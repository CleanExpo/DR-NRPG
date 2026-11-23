#!/usr/bin/env node
/**
 * Real-library capture.
 *
 * Serves the production build already in .next, opens a real browser, lets
 * the real Google library load for the real public measurement id, and
 * records every request the browser tries to send to Google while a visitor
 * walks the site. Nothing reaches the Analytics property (see lib/session.mjs).
 *
 * Exit 0 only when every named check passes. The run cannot pass without
 * first showing it received hits: at least one page view per counted page.
 *
 *   node scripts/analytics-proof/capture.mjs
 */
import { REAL_MEASUREMENT_ID, startSite } from './lib/server.mjs';
import { closeAndAudit, openBrowser, openSession, proofDir, writeProof } from './lib/session.mjs';
import { LISTED_PATHS } from './lib/checker.mjs';
import { judgeWalk, runWalk } from './lib/walk.mjs';

const measurementId = REAL_MEASUREMENT_ID;
let site;
let browser;
let exitCode = 1;
try {
  site = await startSite({ mode: 'start', measurementId });
  console.log(`capture: production build ${site.build.buildId} served at ${site.url}; measurement id ${measurementId} read back from the build`);
  browser = await openBrowser();
  const session = await openSession(browser, { baseUrl: site.url, measurementId });
  const notes = await runWalk(session, { baseUrl: site.url, pages: LISTED_PATHS });
  // The browser's own record of what it sent is complete only once it has closed.
  await session.close();
  const audit = await closeAndAudit(browser);
  browser = null;
  const { results, hits, problems, hitLines } = judgeWalk(session, notes, {
    measurementId,
    pages: LISTED_PATHS,
    title: 'capture',
    audit,
  });

  const otherHosts = [...new Set(session.state.other.map((item) => new URL(item.url).hostname))];
  const googleHosts = [...new Set(session.state.records.map((item) => new URL(item.url).hostname))];
  const eventNames = [...new Set(hits.map((hit) => hit.en ?? '(none)'))];
  console.log(`\nobserved: ${hits.length} hits in ${session.state.records.length} request(s) to ${googleHosts.join(', ') || 'no host'}`);
  console.log(`observed: event names sent: ${eventNames.join(', ') || 'none'}`);
  console.log(`observed: off switch after the in-app move: ${(notes.flags.afterInAppMove ?? []).join(', ') || 'not read'}`);
  console.log(`observed: other outside hosts asked for and stopped: ${otherHosts.join(', ') || 'none'}`);

  const stamp = new Date().toISOString();
  const report = {
    kind: 'capture',
    at: stamp,
    site: site.url,
    measurementId,
    checks: results.rows,
    notes,
    eventNames,
    googleHosts,
    otherHosts,
    networkLog: audit,
    policyRefusals: session.state.violations,
    libraryLoads: session.state.library,
    hits: hits.map((hit) => ({ ...hit, cid: hit.cid ? '(set)' : undefined, sid: hit.sid ? '(set)' : undefined })),
    problems,
  };
  const file = writeProof('capture.json', report);
  writeProof('capture-hits.txt', `${hitLines.join('\n')}\n`);
  console.log(`\nproof written to ${file} (and capture-hits.txt in ${proofDir()})`);

  const failed = results.failed();
  if (results.ok()) {
    console.log(`\nCAPTURE PASS: ${results.rows.length} checks, ${hits.length} hits recorded`);
    exitCode = 0;
  } else {
    console.log(`\nCAPTURE FAIL: ${failed.join(', ')}`);
  }
} catch (error) {
  console.error(`CAPTURE ERROR: ${error?.stack ?? error}`);
} finally {
  if (browser) await browser.close().catch(() => {});
  if (site) await site.stop();
}
process.exit(exitCode);
