#!/usr/bin/env node
/**
 * Claim walk with the real Google library.
 *
 * A visitor who said yes submits a claim on /claim/step-3. The site counts
 * the claim, then moves to /claim/success?claimId=..., an address that must
 * never be counted. This script proves three things with the real library
 * for the real public measurement id:
 *   - the claim event is sent, about /claim/step-3, with no claim id, name,
 *     email, phone or address in it;
 *   - after the move nothing is sent about the success page: the Google
 *     library may still send what it was holding, and only about step 3;
 *   - which way the site's wait for Google ended (confirmed, or timed out),
 *     and whether the claim event left before or after the move.
 *
 * It runs against the development server, not the production build: the
 * claim form needs a human-verification answer, and only the development
 * server offers a stand-in for it when no verification key is set. The claim
 * itself is answered on this machine; no claim is stored and nothing reaches
 * the Analytics property (see lib/session.mjs).
 *
 * The development server rewrites .next, so run this before the production
 * build, never after it.
 *
 *   node scripts/analytics-proof/claim-walk.mjs
 */
import { REAL_MEASUREMENT_ID, startSite } from './lib/server.mjs';
import { MARKERS, Results, checkRecords, claimChecks } from './lib/checker.mjs';
import {
  acceptAll,
  closeAndAudit,
  gotoPath,
  hideTab,
  openBrowser,
  openSession,
  recordIsolation,
  seedClaimProgress,
  settle,
  writeProof,
} from './lib/session.mjs';

const measurementId = REAL_MEASUREMENT_ID;
let site;
let browser;
let exitCode = 1;
try {
  site = await startSite({ mode: 'dev', env: { NEXT_PUBLIC_GA4_MEASUREMENT_ID: measurementId }, timeoutMs: 240000 });
  console.log(`claim walk: development server at ${site.url}, measurement id ${measurementId}`);
  browser = await openBrowser();
  const session = await openSession(browser, { baseUrl: site.url, measurementId });
  const { state, origin } = session;
  const results = new Results('claim walk');
  const notes = { submitted: null };

  // The claim is answered here, so no claim is stored anywhere.
  await session.context.route('**/api/public/claims/submit', async (route) => {
    notes.submitted = route.request().postData() ?? '';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, claimId: MARKERS.claimId, message: 'proof run' }),
    });
  });

  const page = await session.context.newPage();
  session.setPhase('accept');
  await gotoPath(page, site.url, '/');
  await acceptAll(page);
  await settle(page, 5000);

  // Open the success page once, so the development server has it ready and
  // the move after the claim is as quick as it is in production.
  session.setPhase('warm');
  await gotoPath(page, site.url, '/claim/success?claimId=WARM');
  await settle(page, 3000);
  await gotoPath(page, site.url, '/');
  await seedClaimProgress(page);

  session.setPhase('step-3');
  await gotoPath(page, site.url, '/claim/step-3');
  await page.locator('textarea').first().waitFor({ timeout: 120000 });
  await settle(page, 3000);
  await page.locator('textarea').first().fill(
    `Water through the ceiling of the back room. Contact ${MARKERS.name} on ${MARKERS.phone} or ${MARKERS.email}.`,
  );
  await page.locator('input[type="radio"][value="no"]').first().check();
  await page.getByRole('button', { name: 'Bypass for Development' }).click();
  const submit = page.getByRole('button', { name: 'Submit Claim' });
  await submit.waitFor({ timeout: 15000 });
  notes.submitEnabled = await submit.isEnabled();

  session.setPhase('submit');
  const clicked = Date.now();
  await submit.click();
  await page.waitForURL('**/claim/success?claimId=*', { timeout: 60000 });
  session.setPhase('after-move');
  notes.moveMs = Date.now() - clicked;
  notes.landed = page.url();
  notes.waitBranch = await page.evaluate(() => document.documentElement.getAttribute('data-nrpg-analytics-wait'));
  await settle(page, 6000);
  await hideTab(page);
  await settle(page, 2500);
  await page.close({ runBeforeUnload: true });
  session.setPhase('end');
  // The browser's own record of what it sent is complete only once it has closed.
  await session.close();
  const audit = await closeAndAudit(browser);
  browser = null;

  const { problems, hits } = checkRecords(state.records, { origin, measurementId });
  const sample = (list) => list.slice(0, 3).map((item) => item.detail ?? item.url).join(' ; ');

  recordIsolation(results, session, audit);
  const warm = [...session.inPhase('warm'), ...session.inPhase('warm', state.library)];
  results.record('nothing-while-warming', warm.length === 0, `${warm.length} request(s) to Google while the success page was opened ahead of the claim`);
  results.record('claim-was-submitted', typeof notes.submitted === 'string' && notes.submitted.includes(MARKERS.email), 'the claim form posted the planted details to the site (answered on this machine)');
  results.record('moved-to-success', notes.landed.includes(`/claim/success?claimId=${MARKERS.claimId}`), notes.landed);

  const stepView = hits.some((hit) => hit.en === 'page_view' && hit.dl === `${origin}/claim/step-3`);
  const claimHits = hits.filter((hit) => hit.en === 'claim_submitted');
  results.record('hits-received', stepView && claimHits.length > 0, `page view for step 3: ${stepView ? 'yes' : 'no'}; claim_submitted hits: ${claimHits.length}`);
  notes.claimEventLeft = [...new Set(claimHits.map((hit) => (hit.__phase === 'after-move' ? 'after the move' : 'before the move')))];
  const ownChecks = claimChecks({
    hits,
    afterMoveRecords: session.inPhase('after-move'),
    afterMoveLibrary: session.inPhase('after-move', state.library),
    origin,
  });
  results.record(ownChecks[0].name, ownChecks[0].pass, ownChecks[0].detail);
  // How the site's wait ended. It is not proof Google received anything (the
  // wire guard answers a stopped request the same way); hits-received is.
  results.record(
    'wait-branch-logged',
    ['callback', 'timeout'].includes(notes.waitBranch),
    `the site's wait for Google ended on: ${notes.waitBranch ?? 'not recorded'}; the move took ${notes.moveMs} ms from the click; ` +
      `the claim event left ${notes.claimEventLeft.join(' and ') || 'at no time'}`,
  );

  for (const check of ['id', 'address', 'referrer', 'title', 'parameters', 'markers']) {
    const found = problems.filter((problem) => problem.check === check);
    results.record(check, found.length === 0, found.length ? `${found.length} problem(s): ${sample(found)}` : `${hits.length} hits clean`);
  }

  results.record(ownChecks[1].name, ownChecks[1].pass, ownChecks[1].detail);

  const file = writeProof('claim-walk.json', {
    kind: 'claim-walk',
    at: new Date().toISOString(),
    site: site.url,
    measurementId,
    checks: results.rows,
    networkLog: audit,
    notes: { ...notes, submitted: notes.submitted ? '(posted, answered on this machine)' : null },
    hits: hits.map((hit) => ({ ...hit, cid: hit.cid ? '(set)' : undefined, sid: hit.sid ? '(set)' : undefined })),
    problems,
  });
  console.log(`\nproof written to ${file}`);
  if (results.ok()) {
    console.log(
      `\nCLAIM WALK PASS: wait ended on "${notes.waitBranch}", move took ${notes.moveMs} ms, claim event left ${notes.claimEventLeft.join(' and ')}, ` +
        `${hits.length} hits recorded, none about the success page`,
    );
    exitCode = 0;
  } else {
    console.log(`\nCLAIM WALK FAIL: ${results.failed().join(', ')}`);
  }
} catch (error) {
  console.error(`CLAIM WALK ERROR: ${error?.stack ?? error}`);
} finally {
  if (browser) await browser.close().catch(() => {});
  if (site) await site.stop();
}
process.exit(exitCode);
