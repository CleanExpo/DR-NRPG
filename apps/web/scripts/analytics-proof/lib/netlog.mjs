/**
 * What the browser itself says it sent.
 *
 * The test driver does not report every request (a hit sent as a page closes
 * can go unreported, and some are never shown to finish), so it cannot be the
 * judge of whether anything left this machine. The browser's own network log
 * can: it lists every request the network code started, and whether that
 * request was ever written to a connection.
 *
 * A request to a host other than this machine and the allowed hosts passes
 * only if the log shows it failed and was never sent. Anything else (sent, or
 * still under way when the log ended) is reported as having left.
 */
import { readFileSync } from 'node:fs';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function invert(map) {
  return Object.fromEntries(Object.entries(map).map(([name, number]) => [number, name]));
}

/**
 * Read a Chromium network log. `reachable` is the list of outside hosts the
 * browser was allowed to find. Returns:
 *   requests   how many network requests the browser started
 *   local      how many of those were to this machine
 *   outside    how many of those were to a host not on the list, by host
 *   left       those that were sent, or whose end the log does not show
 *   sessions   connections kept open to a host not on the list
 */
export function readNetworkLog(file, { reachable }) {
  const log = JSON.parse(readFileSync(file, 'utf8'));
  const typeName = invert(log.constants.logEventTypes);
  const errorName = invert(log.constants.netError);
  const allowed = (host) => LOCAL_HOSTS.has(host) || reachable.includes(host);

  const bySource = new Map();
  const sessions = [];
  for (const event of log.events) {
    const name = typeName[event.type];
    if ((name === 'HTTP2_SESSION' || name === 'QUIC_SESSION') && typeof event.params?.host === 'string') {
      const host = event.params.host.replace(/:\d+$/, '');
      if (!allowed(host)) sessions.push(event.params.host);
    }
    const list = bySource.get(event.source.id);
    if (list) list.push(event);
    else bySource.set(event.source.id, [event]);
  }

  let requests = 0;
  let local = 0;
  const outside = {};
  const left = [];
  for (const events of bySource.values()) {
    // One source is one request, with one leg for each redirect it followed.
    const legs = [];
    for (const event of events) {
      const name = typeName[event.type];
      if (name === 'URL_REQUEST_START_JOB' && typeof event.params?.url === 'string') {
        legs.push({ url: event.params.url, sent: false, error: null, ended: false });
        continue;
      }
      const leg = legs[legs.length - 1];
      if (!leg) continue;
      if (name === 'HTTP_TRANSACTION_SEND_REQUEST') leg.sent = true;
      const error = event.params?.net_error;
      if (typeof error === 'number' && error < 0) leg.error = errorName[error] ?? String(error);
      if (name === 'REQUEST_ALIVE' && event.phase === log.constants.logEventPhase.PHASE_END) leg.ended = true;
    }
    for (const leg of legs) {
      let target;
      try {
        target = new URL(leg.url);
      } catch {
        continue;
      }
      if (!/^(https?|wss?):$/.test(target.protocol)) continue;
      requests += 1;
      if (LOCAL_HOSTS.has(target.hostname)) local += 1;
      if (allowed(target.hostname)) continue;
      outside[target.hostname] = (outside[target.hostname] ?? 0) + 1;
      if (leg.sent) left.push({ url: leg.url, state: 'sent' });
      else if (leg.error === null) left.push({ url: leg.url, state: 'no end recorded' });
    }
  }
  return { requests, local, outside, left, sessions: [...new Set(sessions)] };
}

/** One line for a check's detail, and whether the log shows nothing left. */
export function judgeNetworkLog(audit) {
  // Every run loads pages from this machine. A log that shows none of them
  // recorded nothing, and "nothing left" read from it would be a bare zero.
  if (!(audit.local > 0)) {
    return {
      contained: false,
      detail: `the browser's network log shows no request to this machine (${audit.requests} request(s) in all), so it cannot show that nothing left`,
    };
  }
  const contained = audit.left.length === 0 && audit.sessions.length === 0;
  const hosts = Object.entries(audit.outside)
    .map(([host, count]) => `${host} ${count}`)
    .join(', ');
  const detail = contained
    ? `the browser's network log shows ${audit.requests} request(s), ${audit.local} of them to this machine, none sent to any host but this machine and the library host` +
      (hosts ? `; tried and failed to leave: ${hosts}` : '')
    : `the browser's network log shows ${audit.left.length} request(s) that left or may have left: ` +
      audit.left
        .slice(0, 3)
        .map((item) => `${item.state} ${item.url.split('?')[0]}`)
        .join(' ; ') +
      (audit.sessions.length ? `; connection(s) kept to ${audit.sessions.join(', ')}` : '');
  return { contained, detail };
}
