#!/usr/bin/env node
/**
 * Deliberate-leak controls for the capture.
 *
 * A check that has never been seen to fail proves nothing. Each control below
 * breaks one thing on purpose and passes only when the checks that should
 * catch it report FAIL, by name:
 *
 *   A. no gate at all (the off switch stuck open, the Google library loaded on
 *      every page)            -> nothing-before-consent, closed-address and
 *                                after-withdrawal must fail
 *   B. no wire guard, and an event handed straight to the Google library with
 *      a claim id, an email and a dirty address
 *                             -> address, parameters, markers and
 *                                stray-push-stopped must fail, the first three
 *                                judged on that event alone
 *   C. three planted requests, built offline, each with one fault in the
 *      second event of a batched body:
 *        C1 a dirty address         -> address must fail
 *        C2 an unlisted parameter   -> parameters must fail
 *        C3 an email, every byte percent-encoded and then encoded again, in
 *           a listed parameter      -> markers must fail (it can only be read
 *                                      by decoding twice)
 *      The same body without the planted event must read as clean.
 *   D. a planted claim event about the success page, built offline
 *                             -> the claim walk's own two checks must fail
 *   E. two planted network logs, built offline, each with one request to the
 *      collection host:
 *        E1 the request was sent                -> isolation must fail
 *        E2 the log stops while it is under way -> isolation must fail
 *      The same request cancelled before it was sent (what the browser does
 *      to a request a closing tab still has under way), and the same request
 *      failing to find its host, must both read as contained.
 *
 * A and B count only if the browser's own network log shows the control let
 * nothing out of this machine.
 *
 * A and B are read from one visit to a site with neither the gate nor the wire
 * guard (see `forceOpen` in lib/session.mjs): the capture makes the same visit
 * with both in place, and must pass every one of these checks.
 *
 * Exit 0 only when every control was caught.
 *
 *   node scripts/analytics-proof/controls.mjs
 */
import { REAL_MEASUREMENT_ID, startSite } from './lib/server.mjs';
import { closeAndAudit, openBrowser, openSession, writeProof } from './lib/session.mjs';
import { MARKERS, Results, checkHit, checkRecords, claimChecks } from './lib/checker.mjs';
import { judgeWalk, runWalk } from './lib/walk.mjs';
import { auditNetworkLog, judgeNetworkLog } from './lib/netlog.mjs';

const measurementId = REAL_MEASUREMENT_ID;
const SHORT_PAGES = ['/', '/about', '/pricing'];
const verdicts = [];

function verdict(name, mustFail, failedNames, extra = '') {
  const missed = mustFail.filter((check) => !failedNames.includes(check));
  const caught = missed.length === 0;
  verdicts.push({ name, caught, mustFail, failed: failedNames, missed });
  console.log(
    `\n${caught ? 'CONTROL CAUGHT' : 'CONTROL MISSED'}  ${name}: expected FAIL on ${mustFail.join(', ')}; ` +
      `got FAIL on ${failedNames.join(', ') || 'nothing'}${missed.length ? `; NOT caught: ${missed.join(', ')}` : ''}${extra}`,
  );
}

let site;
let browser;
let exitCode = 1;
try {
  site = await startSite({ mode: 'start', env: { NEXT_PUBLIC_GA4_MEASUREMENT_ID: measurementId } });
  browser = await openBrowser();

  // A and B. One visit to a site with no gate and no wire guard.
  console.log('--- controls A and B: no gate, no wire guard (library on every page, stray event pushed) ---');
  {
    const session = await openSession(browser, { baseUrl: site.url, measurementId, forceOpen: true });
    const notes = await runWalk(session, { baseUrl: site.url, pages: SHORT_PAGES });
    await session.close();
    const audit = await closeAndAudit(browser);
    browser = null;
    const { results, hits } = judgeWalk(session, notes, { measurementId, pages: SHORT_PAGES, title: 'controls A and B', audit });
    const leaked = hits.filter((hit) => hit.en === 'proof_leak').length;
    const contained = !results.failed().includes('isolation');
    console.log(
      contained
        ? 'contained: the network log shows nothing the control sent left this machine'
        : 'NOT CONTAINED: the control let a request out; its verdicts do not count',
    );
    // A control counts only if it really planted what the checks should catch:
    // hits before the choice, on closed addresses and after the "no".
    const planted = {
      'before the choice': session.inPhase('before-consent').length,
      'on closed addresses': session.inPhase('closed').length,
      'after the no': session.inPhase('after-withdrawal').length,
    };
    const plantedLine = Object.entries(planted).map(([where, count]) => `${count} ${where}`).join(', ');
    verdict('A no gate', ['nothing-before-consent', 'closed-address', 'after-withdrawal'], results.failed(), `; requests to Google planted: ${plantedLine}`);
    if (Object.values(planted).some((count) => count === 0)) verdicts[verdicts.length - 1].caught = false;
    // B is judged on what it planted. The visit sends other dirty hits too
    // (it has no gate), and those must not be what trips the checks.
    const strayHits = hits
      .filter((hit) => hit.en === 'proof_leak')
      .map((hit) => Object.fromEntries(Object.entries(hit).filter(([key]) => key !== '__phase')));
    const fromStray = strayHits.flatMap((hit) => checkHit(hit, { origin: session.origin, measurementId })).map((problem) => problem.check);
    const strayStopped = results.failed().filter((check) => check === 'stray-push-stopped');
    verdict(
      'B no wire guard',
      ['address', 'parameters', 'markers', 'stray-push-stopped'],
      [...new Set([...fromStray, ...strayStopped])],
      `; the stray event reached Google ${leaked} time(s); address, parameters and markers judged on that event alone`,
    );
    if (leaked === 0) verdicts[verdicts.length - 1].caught = false;
    if (!contained) for (const item of verdicts) item.caught = false;
  }

  // C. Planted requests, offline: one fault each, in the second event of a
  //    batched body, judged on that request alone.
  console.log('\n--- control C: three planted, batched requests (offline) ---');
  {
    const origin = new URL(site.url).origin;
    const context = { origin, measurementId };
    const base = `https://region1.google-analytics.com/g/collect?v=2&tid=${measurementId}&dl=${encodeURIComponent(`${origin}/about`)}`;
    const everyByte = (text) => [...Buffer.from(text, 'utf8')].map((byte) => `%${byte.toString(16).padStart(2, '0')}`).join('');
    const hidden = encodeURIComponent(everyByte(MARKERS.email));
    const plants = [
      ['C1 planted address', `en=cta_clicked&dl=${encodeURIComponent(`${origin}/claim/success?claimId=CLM-9`)}`, 'address'],
      ['C2 planted parameter', 'en=cta_clicked&ep.claim_ref=abc', 'parameters'],
      ['C3 planted text, encoded twice', `en=cta_clicked&ep.cta_name=${hidden}`, 'markers'],
    ];
    // The same body without the planted event must read as clean.
    const twinClean = checkRecords([{ phase: 'planted', url: base, postData: 'en=page_view' }], context).problems.length === 0;
    for (const [name, line, mustFail] of plants) {
      const record = { phase: 'planted', url: base, postData: ['en=page_view', line].join('\r\n') };
      const { problems, hits } = checkRecords([record], context);
      const failed = [...new Set(problems.map((problem) => problem.check))];
      // C3 only: the planted text must be unreadable until it is decoded
      // twice, or the control would be caught with the decoder broken.
      const once = decodeURIComponent(line);
      const readableEarly = mustFail === 'markers' && [line, once].some((text) => /@|example\.invalid/i.test(text));
      verdict(
        name,
        [mustFail],
        failed,
        `; ${hits.length} events read from one body; the same body without the planted event ${twinClean ? 'passes' : 'FAILS'}` +
          (mustFail === 'markers' ? `; planted text readable before the second decode: ${readableEarly ? 'YES' : 'no'}` : ''),
      );
      if (!twinClean || hits.length !== 2 || readableEarly) verdicts[verdicts.length - 1].caught = false;
    }
  }

  // D. The claim walk's own two checks, offline.
  console.log('\n--- control D: a planted claim event about the success page (offline) ---');
  {
    const origin = new URL(site.url).origin;
    const collect = `https://www.google-analytics.com/g/collect?v=2&tid=${measurementId}`;
    const judge = (address) => {
      const record = {
        phase: 'after-move',
        url: `${collect}&dl=${encodeURIComponent(address)}`,
        postData: 'en=claim_submitted&ep.event_category=Claim',
      };
      const { hits } = checkRecords([record], { origin, measurementId });
      const results = new Results('control D');
      for (const row of claimChecks({ hits, afterMoveRecords: [record], afterMoveLibrary: [], origin })) {
        results.record(row.name, row.pass, row.detail);
      }
      return results.failed();
    };
    const failed = judge(`${origin}/claim/success?claimId=${MARKERS.claimId}`);
    const cleanTwin = judge(`${origin}/claim/step-3`).length === 0;
    verdict(
      'D planted claim event',
      ['claim-event-about-step-3', 'nothing-about-success-page'],
      failed,
      `; the same event about step 3 ${cleanTwin ? 'passes both' : 'FAILS'}`,
    );
    if (!cleanTwin) verdicts[verdicts.length - 1].caught = false;
  }

  // E. The reader of the browser's network log, offline. The shapes are the
  //    ones the browser writes: a request that was sent, one the log never
  //    shows ending, one cancelled before it was sent, one that failed.
  console.log('\n--- control E: two planted network logs (offline) ---');
  {
    const types = { REQUEST_ALIVE: 1, URL_REQUEST_START_JOB: 2, HTTP_TRANSACTION_SEND_REQUEST: 3, CANCELLED: 4 };
    const phases = { PHASE_NONE: 0, PHASE_BEGIN: 1, PHASE_END: 2 };
    const constants = { logEventTypes: types, logEventPhase: phases, netError: { ERR_NAME_NOT_RESOLVED: -105 } };
    const event = (id, type, phase, params) => ({ source: { id }, type: types[type], phase: phases[phase], params });
    const request = (id, url, steps) => [
      event(id, 'REQUEST_ALIVE', 'PHASE_BEGIN'),
      event(id, 'URL_REQUEST_START_JOB', 'PHASE_BEGIN', { url }),
      ...steps.map(([type, phase, params]) => event(id, type, phase, params)),
    ];
    const SENT = [
      ['HTTP_TRANSACTION_SEND_REQUEST', 'PHASE_BEGIN'],
      ['REQUEST_ALIVE', 'PHASE_END'],
    ];
    const CUT_SHORT = [];
    const CANCELLED = [
      ['CANCELLED', 'PHASE_NONE'],
      ['REQUEST_ALIVE', 'PHASE_END'],
    ];
    const FAILED = [
      ['URL_REQUEST_START_JOB', 'PHASE_END', { net_error: -105 }],
      ['REQUEST_ALIVE', 'PHASE_END', { net_error: -105 }],
    ];
    const collect = `https://www.google-analytics.com/g/collect?v=2&tid=${measurementId}`;
    // Each log also holds a page loaded from this machine, as every run does.
    const judge = (steps) => {
      const events = [...request(1, `${site.url}/`, SENT), ...request(2, collect, steps)];
      const audit = auditNetworkLog({ constants, events }, { reachable: ['www.googletagmanager.com'] });
      return judgeNetworkLog(audit).contained ? [] : ['isolation'];
    };
    const cancelledClean = judge(CANCELLED).length === 0;
    const failedClean = judge(FAILED).length === 0;
    for (const [name, steps] of [
      ['E1 planted request that was sent', SENT],
      ['E2 planted log that stops mid-request', CUT_SHORT],
    ]) {
      verdict(
        name,
        ['isolation'],
        judge(steps),
        `; the same request cancelled before it was sent ${cancelledClean ? 'passes' : 'FAILS'}; ` +
          `the same request failing to find its host ${failedClean ? 'passes' : 'FAILS'}`,
      );
      if (!cancelledClean || !failedClean) verdicts[verdicts.length - 1].caught = false;
    }
  }

  writeProof('controls.json', { kind: 'controls', at: new Date().toISOString(), measurementId, verdicts });
  const missed = verdicts.filter((item) => !item.caught);
  if (verdicts.length === 8 && missed.length === 0) {
    console.log('\nCONTROLS PASS: all eight deliberate leaks were caught by name');
    exitCode = 0;
  } else {
    console.log(`\nCONTROLS FAIL: not caught: ${missed.map((item) => item.name).join(', ') || 'a control did not run'}`);
  }
} catch (error) {
  console.error(`CONTROLS ERROR: ${error?.stack ?? error}`);
} finally {
  if (browser) await browser.close().catch(() => {});
  if (site) await site.stop();
}
process.exit(exitCode);
