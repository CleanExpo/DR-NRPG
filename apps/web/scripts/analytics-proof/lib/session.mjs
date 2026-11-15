/**
 * Shared browser plumbing for the analytics proof scripts.
 *
 * Isolation, in two layers:
 *   1. every request the browser makes is routed here. The Google library file
 *      is let through; every other request to Google is recorded and answered
 *      on this machine with an empty 204, so the library behaves as it would
 *      live while nothing reaches the Analytics property; every request to any
 *      other outside host is recorded and stopped.
 *   2. the browser itself is started able to find two hosts only: this
 *      machine, and the host the Google library file is fetched from. Every
 *      other name fails to resolve, so a request that missed layer 1 (the
 *      browser does not offer every request to it) fails instead of leaving.
 *      This is a list of what is allowed, not of what is blocked: a host
 *      nobody thought of is closed by default.
 * Whether anything left is then read from the browser's own network log
 * (lib/netlog.mjs), not from the requests the test driver reports: the driver
 * never showed how some requests ended. A request sent to any host other than
 * this machine and the library host fails the run ("isolation").
 */
import { createRequire } from 'node:module';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { WEB_ROOT, treeStamp } from './server.mjs';
import { judgeNetworkLog, readNetworkLog } from './netlog.mjs';
import { MARKERS, isCollectionUrl, isGoogleUrl, isLibraryUrl } from './checker.mjs';

const webRequire = createRequire(path.join(WEB_ROOT, 'package.json'));
const { chromium } = webRequire('@playwright/test');

const REACHABLE = ['localhost', 'www.googletagmanager.com'];
const RESOLVER_RULES = ['MAP * ~NOTFOUND', ...REACHABLE.map((host) => `EXCLUDE ${host}`)].join(', ');

const networkLogs = new WeakMap();

export async function openBrowser() {
  const folder = mkdtempSync(path.join(os.tmpdir(), 'analytics-proof-'));
  const file = path.join(folder, 'network-log.json');
  const browser = await chromium.launch({
    args: [`--host-resolver-rules=${RESOLVER_RULES}`, `--log-net-log=${file}`],
  });
  networkLogs.set(browser, { folder, file });
  return browser;
}

/**
 * Close the browser and read its own record of what it sent. The log is only
 * complete once the browser has closed, so every check that depends on it
 * runs after this.
 */
export async function closeAndAudit(browser) {
  const log = networkLogs.get(browser);
  await browser.close();
  try {
    return readNetworkLog(log.file, { reachable: REACHABLE.filter((host) => host !== 'localhost') });
  } finally {
    rmSync(log.folder, { recursive: true, force: true });
  }
}

/** The "isolation" check, the same for every script that sends anything. */
export function recordIsolation(results, session, audit) {
  const answered = session.escaped();
  const network = judgeNetworkLog(audit);
  const unreported = session.state.records.filter((record) => record.outcome === 'pending').length;
  const pass = network.contained && answered.length === 0;
  results.record(
    'isolation',
    pass,
    answered.length
      ? `${answered.length} request(s) were answered by a real server: ${answered
          .slice(0, 3)
          .map((item) => `${item.outcome} ${item.url.split('?')[0]}`)
          .join(' ; ')}`
      : network.detail +
          (unreported ? `; ${unreported} request(s) the test driver never showed ending are covered by that log` : ''),
  );
  return pass;
}

/** Where proof output goes: outside the repository, so a run never dirties the tree. */
export function proofDir() {
  const dir =
    process.env.ANALYTICS_PROOF_DIR ||
    path.join(os.homedir(), 'session-handoffs', 'website-sync-WS-20261115', 'proof');
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function writeProof(name, data) {
  const file = path.join(proofDir(), name);
  writeFileSync(file, typeof data === 'string' ? data : `${JSON.stringify({ tree: treeStamp(), ...data }, null, 2)}\n`);
  return file;
}

/**
 * A browser context whose every request is recorded. `forceOpen` simulates a
 * site with no gate and no wire guard (used only by the deliberate-leak
 * controls): the site's own guard is stopped from going in, so the site sends
 * nothing itself, and the Google library is loaded and configured on every
 * page as a site with no rules would do it.
 */
export async function openSession(browser, { baseUrl, measurementId, viewport, forceOpen = false }) {
  const origin = new URL(baseUrl).origin;
  const state = {
    phase: 'start',
    records: [], // every request to Google other than the library file
    library: [], // loads of the library file
    routed: 0, // how many of those requests the route below answered
    other: [], // requests to any other outside host (stopped)
    violations: [], // security-policy refusals reported by the page
  };

  const started = Date.now();
  const context = await browser.newContext({
    viewport: viewport ?? { width: 1280, height: 900 },
    serviceWorkers: 'block',
    bypassCSP: forceOpen,
  });

  const pageOf = (request) => {
    try {
      return request.frame().url();
    } catch {
      return '';
    }
  };

  const answeredHere = new Set();
  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = request.url();
    if (url === origin || url.startsWith(`${origin}/`) || /^(data|blob|about):/.test(url)) {
      return route.continue();
    }
    if (isLibraryUrl(url, measurementId)) {
      state.library.push({ phase: state.phase, url, page: pageOf(request) });
      return route.continue();
    }
    if (isGoogleUrl(url)) {
      state.routed += 1;
      answeredHere.add(request);
      return route.fulfill({
        status: 204,
        headers: { 'access-control-allow-origin': origin, 'access-control-allow-credentials': 'true' },
        body: '',
      });
    }
    state.other.push({ phase: state.phase, url });
    return route.abort();
  });

  // Every request the browser reports, routed or not. A hit sent as the page
  // closes (a "beacon") is not always offered to the route above, so the
  // record is taken here, where nothing is missed.
  const byRequest = new Map();
  context.on('request', (request) => {
    const url = request.url();
    if (!isCollectionUrl(url, measurementId)) return;
    const record = {
      phase: state.phase,
      at: Date.now() - started,
      url,
      method: request.method(),
      postData: request.postData() ?? '',
      page: pageOf(request),
      transport: request.resourceType(),
      outcome: answeredHere.has(request) ? 'answered on this machine' : 'pending',
    };
    byRequest.set(request, record);
    state.records.push(record);
  });
  context.on('requestfinished', async (request) => {
    const record = byRequest.get(request);
    if (!record) return;
    try {
      const response = await request.response();
      // Our own answer is an empty 204 with no server address behind it.
      const server = response ? await response.serverAddr() : null;
      if (answeredHere.has(request)) record.outcome = 'answered on this machine';
      else record.outcome = server ? `answered by ${server.ipAddress}` : 'finished with no server address';
    } catch {
      if (!answeredHere.has(request)) record.outcome = 'finished (page closed before it could be read)';
    }
  });
  context.on('requestfailed', (request) => {
    const record = byRequest.get(request);
    if (!record) return;
    // A request the route answered can still be reported as aborted when the
    // page that sent it has gone; it never left this machine either way.
    record.outcome = answeredHere.has(request)
      ? 'answered on this machine'
      : `failed: ${request.failure()?.errorText ?? 'unknown'}`;
  });

  await context.exposeBinding('__proofPolicyRefusal', (source, detail) => {
    state.violations.push({ phase: state.phase, page: source.page?.url?.() ?? '', ...detail });
  });
  await context.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      try {
        window.__proofPolicyRefusal({ blocked: event.blockedURI, directive: event.effectiveDirective });
      } catch {
        // The binding is gone: the page is closing.
      }
    });
  });

  if (forceOpen) {
    // A site with no gate: the off switch can never be set, the two ways a
    // request leaves cannot be replaced (so the site's wire guard cannot go
    // in), and the library is loaded and configured on every page, whatever
    // the visitor chose.
    await context.addInitScript((id) => {
      // Only the site's own pages: a blank tab is not a visit.
      if (!/^https?:$/.test(window.location.protocol)) return;
      try {
        Object.defineProperty(window, `ga-disable-${id}`, { get: () => false, set: () => {}, configurable: false });
        Object.defineProperty(window, 'fetch', { value: window.fetch, writable: false, configurable: false });
        Object.defineProperty(Navigator.prototype, 'sendBeacon', {
          value: Navigator.prototype.sendBeacon,
          writable: false,
          configurable: false,
        });
      } catch {
        // Already defined.
      }
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', id);
      const tag = document.createElement('script');
      tag.async = true;
      tag.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      // This runs before the page has any element to hang the tag on.
      const add = () => (document.head ?? document.documentElement).appendChild(tag);
      if (document.documentElement) add();
      else document.addEventListener('DOMContentLoaded', add, { once: true });
    }, measurementId);
  }

  const session = {
    context,
    origin,
    state,
    setPhase(name) {
      state.phase = name;
    },
    /** Records of one phase (or of every phase whose name starts with the prefix). */
    inPhase(prefix, list = state.records) {
      return list.filter((item) => item.phase === prefix || item.phase.startsWith(`${prefix}:`));
    },
    /** Requests the test driver saw a real server answer. There must be none. */
    escaped() {
      return state.records.filter(
        (record) => record.outcome.startsWith('answered by') || record.outcome.startsWith('finished'),
      );
    },
    async analyticsCookies() {
      const cookies = await context.cookies(origin);
      return cookies.filter((cookie) => /(^|_)ga(_|$)/.test(cookie.name) || cookie.name.includes('_ga'));
    },
    async close() {
      await context.close();
    },
  };
  return session;
}

export const settle = (page, ms = 2500) => page.waitForTimeout(ms);

/** How many requests to Google the site's wire guard has stopped or trimmed on this page. */
export async function stoppedCount(page) {
  try {
    return await page.evaluate(() => Number(document.documentElement.getAttribute('data-nrpg-wire-dropped') ?? '0'));
  } catch {
    return null;
  }
}

export async function gotoPath(page, baseUrl, target, options = {}) {
  await page.goto(baseUrl + target, { waitUntil: 'domcontentloaded', timeout: 120000, ...options });
}

/** The visitor's own "yes": the Accept All button on the cookie notice. */
export async function acceptAll(page) {
  const notice = page.getByRole('region', { name: 'Cookie notice' });
  await notice.waitFor({ timeout: 30000 });
  await notice.getByRole('button', { name: 'Accept All' }).click();
}

/** The visitor's own "no": the Cookie settings control, the switch, Save. */
export async function sayNo(page) {
  const control = page.getByRole('button', { name: 'Cookie settings', exact: true }).first();
  await control.scrollIntoViewIfNeeded();
  await control.click();
  const dialog = page.getByRole('dialog', { name: 'Cookie settings' });
  await dialog.waitFor({ timeout: 15000 });
  const toggle = dialog.getByRole('switch', { name: 'Analytics cookies' });
  if ((await toggle.getAttribute('aria-checked')) === 'true') await toggle.click();
  await dialog.getByRole('button', { name: 'Save choices' }).click();
  await dialog.waitFor({ state: 'hidden', timeout: 15000 });
}

/** What a browser does when the visitor switches away from the tab. */
export async function hideTab(page) {
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('pagehide'));
  });
}

/** A part-finished claim, as the claim pages save it. Holds planted personal details. */
export function claimProgress() {
  const now = new Date().toISOString();
  return {
    version: '1.0.0',
    data: {
      step1: { disasterType: 'water-damage', incidentDate: '2026-11-10T09:00', isOngoing: 'no', isEmergency: 'no' },
      step2: {
        propertyAddress: `1 ${MARKERS.recordId} Street`,
        suburb: 'Brisbane',
        postcode: '4000',
        name: MARKERS.name,
        phone: MARKERS.phone,
        email: MARKERS.email,
      },
      currentStep: 3,
      completedSteps: [1, 2],
      startedAt: now,
      lastUpdatedAt: now,
    },
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export async function seedClaimProgress(page) {
  await page.evaluate((progress) => {
    window.localStorage.setItem('nrpg-claim-wizard-state', JSON.stringify(progress));
  }, claimProgress());
}
