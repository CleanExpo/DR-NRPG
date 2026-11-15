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
 *                                stray-push-stopped must fail
 *   C. a planted request, built offline: two events in one body, the personal
 *      data percent-encoded twice
 *                             -> address, parameters and markers must fail
 *   D. a planted claim event about the success page, built offline
 *                             -> the claim walk's own two checks must fail
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
import { MARKERS, Results, checkRecords, claimChecks } from './lib/checker.mjs';
import { judgeWalk, runWalk } from './lib/walk.mjs';

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
    verdict(
      'B no wire guard',
      ['address', 'parameters', 'markers', 'stray-push-stopped'],
      results.failed(),
      `; the stray event reached Google ${leaked} time(s)`,
    );
    if (leaked === 0) verdicts[verdicts.length - 1].caught = false;
    if (!contained) for (const item of verdicts) item.caught = false;
  }

  // C. A planted request, offline.
  console.log('\n--- control C: a planted, batched, twice-encoded request (offline) ---');
  {
    const origin = new URL(site.url).origin;
    const twice = (text) => encodeURIComponent(encodeURIComponent(text));
    const record = {
      phase: 'planted',
      url: `https://region1.google-analytics.com/g/collect?v=2&tid=${measurementId}&dl=${encodeURIComponent(`${origin}/about`)}`,
      postData: [
        'en=page_view',
        `en=claim_submitted&ep.claim_id=${twice(MARKERS.claimId)}&ep.note=${twice(MARKERS.email)}` +
          `&dl=${encodeURIComponent(`${origin}/claim/success?claimId=${MARKERS.claimId}`)}`,
      ].join('\r\n'),
    };
    const { problems, hits } = checkRecords([record], { origin, measurementId });
    const results = new Results('control C');
    for (const check of ['id', 'address', 'referrer', 'title', 'parameters', 'markers']) {
      const found = problems.filter((problem) => problem.check === check);
      results.record(check, found.length === 0, found.length ? found[0].detail : '');
    }
    // The first, clean event in the same body must still read as clean.
    const firstClean = checkRecords([{ ...record, postData: 'en=page_view' }], { origin, measurementId }).problems.length === 0;
    verdict('C planted request', ['address', 'parameters', 'markers'], results.failed(), `; ${hits.length} events read from one body; clean twin ${firstClean ? 'passes' : 'FAILS'}`);
    if (!firstClean || hits.length !== 2) verdicts[verdicts.length - 1].caught = false;
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

  writeProof('controls.json', { kind: 'controls', at: new Date().toISOString(), measurementId, verdicts });
  const missed = verdicts.filter((item) => !item.caught);
  if (verdicts.length === 4 && missed.length === 0) {
    console.log('\nCONTROLS PASS: all four deliberate leaks were caught by name');
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
