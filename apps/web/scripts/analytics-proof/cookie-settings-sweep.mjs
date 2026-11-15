#!/usr/bin/env node
/**
 * "Cookie settings" sweep on the production build.
 *
 * Every counted page, at desktop and phone width, must show exactly one
 * visible "Cookie settings" control that opens the dialog. A visitor who has
 * already answered the notice has no other way back to the choice.
 *
 *   node scripts/analytics-proof/cookie-settings-sweep.mjs
 */
import { REAL_MEASUREMENT_ID, startSite } from './lib/server.mjs';
import { LISTED_PATHS, Results } from './lib/checker.mjs';
import { claimProgress, closeAndAudit, gotoPath, openBrowser, openSession, writeProof } from './lib/session.mjs';
import { judgeNetworkLog } from './lib/netlog.mjs';

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844 },
];

let site;
let browser;
let exitCode = 1;
try {
  site = await startSite({ mode: 'start', env: { NEXT_PUBLIC_GA4_MEASUREMENT_ID: REAL_MEASUREMENT_ID } });
  console.log(`sweep: production build served at ${site.url}`);
  browser = await openBrowser();
  const results = new Results('cookie settings sweep');
  const rows = [];

  for (const viewport of VIEWPORTS) {
    const session = await openSession(browser, { baseUrl: site.url, measurementId: REAL_MEASUREMENT_ID, viewport });
    // A visitor who already said no (so the notice is not on screen), part-way
    // through a claim (so the later claim steps open instead of sending them back).
    await session.context.addInitScript((progress) => {
      window.localStorage.setItem(
        'nrpg_cookie_consent',
        JSON.stringify({ necessary: true, analytics: false, marketing: false, preferences: false }),
      );
      window.localStorage.setItem('nrpg_cookie_consent_version', '2026-11-15');
      window.localStorage.setItem('nrpg-claim-wizard-state', JSON.stringify(progress));
    }, claimProgress());

    for (const target of LISTED_PATHS) {
      const page = await session.context.newPage();
      const row = { viewport: viewport.name, target };
      try {
        await gotoPath(page, site.url, target);
        await page.waitForTimeout(2000);
        row.landed = new URL(page.url()).pathname;
        const controls = page.getByRole('button', { name: 'Cookie settings', exact: true });
        const count = await controls.count();
        let visible = 0;
        let first = null;
        for (let i = 0; i < count; i += 1) {
          if (await controls.nth(i).isVisible()) {
            visible += 1;
            first = first ?? controls.nth(i);
          }
        }
        row.visible = visible;
        row.notice = await page.getByRole('region', { name: 'Cookie notice' }).count();
        if (first) {
          await first.scrollIntoViewIfNeeded();
          const box = await first.boundingBox();
          row.height = box ? Math.round(box.height) : null;
          await first.click();
          await page.getByRole('dialog', { name: 'Cookie settings' }).waitFor({ timeout: 10000 });
          row.dialog = true;
        }
      } catch (error) {
        row.error = String(error?.message ?? error).split('\n')[0];
      }
      rows.push(row);
      // A page that sent the visitor somewhere off the list (a sign-in page,
      // say) proves nothing about the page that was asked for.
      const pass =
        row.visible === 1 && row.dialog === true && row.notice === 0 && !row.error && LISTED_PATHS.includes(row.landed);
      results.record(
        `${viewport.name} ${target}`,
        pass,
        `${row.visible ?? 0} visible control(s)${row.landed && row.landed !== target ? `, landed on ${row.landed}` : ''}${
          row.dialog ? ', dialog opens' : ', dialog did not open'
        }${row.height ? `, ${row.height}px tall` : ''}${row.error ? `, ${row.error}` : ''}`,
      );
      await page.close();
    }
    const google = session.state.records.length + session.state.library.length;
    results.record(`${viewport.name} nothing sent with a stored no`, google === 0, `${google} request(s) to Google`);
    await session.close();
  }

  // The same question asked of the browser's own record, once it has closed.
  const audit = await closeAndAudit(browser);
  browser = null;
  const network = judgeNetworkLog(audit);
  results.record('isolation', network.contained, network.detail);

  const file = writeProof('cookie-settings-sweep.json', { kind: 'sweep', at: new Date().toISOString(), site: site.url, rows, checks: results.rows });
  console.log(`\nproof written to ${file}`);
  if (results.ok()) {
    console.log(`\nSWEEP PASS: ${LISTED_PATHS.length} pages at ${VIEWPORTS.length} widths, one control each`);
    exitCode = 0;
  } else {
    console.log(`\nSWEEP FAIL: ${results.failed().join(', ')}`);
  }
} catch (error) {
  console.error(`SWEEP ERROR: ${error?.stack ?? error}`);
} finally {
  if (browser) await browser.close().catch(() => {});
  if (site) await site.stop();
}
process.exit(exitCode);
