/**
 * The visit that the capture and its controls replay, and the named checks
 * that judge what the browser sent to Google during it.
 *
 * Timing matters. The Google library holds a page view for about five seconds
 * before it sends it, so each counted page is given longer than that, and a
 * step that must send nothing starts from a blank page: anything recorded in
 * it then comes from the page under test and from nowhere else.
 */
import { LISTED_PATHS, MARKERS, Results, checkRecords, describeHit } from './checker.mjs';
import {
  acceptAll,
  gotoPath,
  hideTab,
  recordIsolation,
  sayNo,
  seedClaimProgress,
  settle,
  stoppedCount,
} from './session.mjs';

const encoded = (text) => encodeURIComponent(text);

/** Long enough for the library to send what it is holding for a page. */
const FLUSH_MS = 6500;

/** Addresses that must send nothing, even after the visitor said yes. */
export const CLOSED_ADDRESSES = [
  '/login',
  `/launch/thank-you?email=${encoded(MARKERS.email)}`,
  `/claim/success?claimId=${MARKERS.claimId}`,
  `/dashboard?record=${MARKERS.recordId}`,
  `/?email=${encoded(MARKERS.email)}`,
  `/about?utm_source=proofnews&token=${MARKERS.token}`,
];

const pathOf = (url) => {
  try {
    return new URL(url).pathname;
  } catch {
    return '';
  }
};

/**
 * Replay the visit. `pages` is the list of counted pages to load one by one
 * (all 19 for the capture, a few for a control).
 */
export async function runWalk(session, { baseUrl, pages = LISTED_PATHS }) {
  const notes = { landed: {}, cookies: {}, flags: {}, stopped: {}, signupFrom: null, utmMove: null, stray: null, errors: [] };
  const step = async (name, work) => {
    try {
      await work();
    } catch (error) {
      notes.errors.push(`${name}: ${String(error?.message ?? error).split('\n')[0]}`);
    }
  };
  let page = await session.context.newPage();

  /** Leave the site altogether, so the next step starts with no page alive. */
  const leave = async () => {
    session.setPhase('between');
    await page.goto('about:blank');
    await settle(page, 1500);
  };

  // 1. Before any choice: two pages, no click on the notice.
  session.setPhase('before-consent');
  await step('before-consent', async () => {
    await gotoPath(page, baseUrl, '/');
    await settle(page, FLUSH_MS);
    await gotoPath(page, baseUrl, '/about');
    await settle(page, FLUSH_MS);
  });
  notes.cookies.beforeConsent = (await session.analyticsCookies()).map((cookie) => cookie.name);

  // 2. The visitor says yes on the home page.
  session.setPhase('accept');
  await step('accept', async () => {
    await gotoPath(page, baseUrl, '/');
    await acceptAll(page);
    await settle(page, FLUSH_MS);
    await seedClaimProgress(page);
  });
  const afterAccept = await session.analyticsCookies();
  notes.cookies.afterAccept = afterAccept.map((cookie) => ({
    name: cookie.name,
    days: cookie.expires > 0 ? Math.round((cookie.expires * 1000 - Date.now()) / 86400000) : null,
  }));
  const idCookie = afterAccept.find((cookie) => /_ga$/.test(cookie.name) || cookie.name === '_ga');

  // 3. The cookie must survive two full reloads while the "yes" stands.
  session.setPhase('reload');
  await step('reload', async () => {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await settle(page, 2500);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await settle(page, 2500);
  });
  const afterReload = (await session.analyticsCookies()).find((cookie) => cookie.name === idCookie?.name);
  notes.cookies.idName = idCookie?.name ?? null;
  notes.cookies.survivedReload = Boolean(idCookie) && afterReload?.value === idCookie.value;

  // 4. Every counted page, loaded in full.
  for (const target of pages) {
    session.setPhase(`page:${target}`);
    await step(`page ${target}`, async () => {
      await gotoPath(page, baseUrl, target);
      await settle(page, FLUSH_MS);
      notes.landed[target] = pathOf(page.url());
    });
  }

  // 5. Campaign tags are kept; nothing else in the query is.
  session.setPhase('utm');
  await step('utm', async () => {
    await gotoPath(page, baseUrl, '/pricing?utm_source=proofnews&utm_medium=email');
    await settle(page, FLUSH_MS);
  });

  // 5b. From the campaign landing, a move inside the app to another counted
  //     page. Its page view must arrive, with the page left as the referrer
  //     and no campaign tags on that referrer.
  await step('utm-move', async () => {
    for (const to of ['/about', '/contact', '/how-it-works', '/privacy', '/terms']) {
      const links = page.locator(`a[href="${to}"]`);
      const count = await links.count();
      for (let i = 0; i < count; i += 1) {
        if (await links.nth(i).isVisible()) {
          notes.utmMove = to;
          session.setPhase('utm-move');
          await links.nth(i).click();
          await page.waitForURL(`**${to}`, { timeout: 60000 });
          await settle(page, FLUSH_MS + 1500);
          return;
        }
      }
    }
    throw new Error('no visible link from the campaign landing to another counted page');
  });

  // 6. A stray event, handed straight to the Google library around the site's
  //    own cleaning, with a claim id, an email and a dirty address. It must
  //    not leave the browser. An ordinary event sent the proper way just
  //    after it must arrive, which shows the library was running and dealt
  //    with both.
  session.setPhase('stray');
  await step('stray', async () => {
    await gotoPath(page, baseUrl, '/about');
    await settle(page, FLUSH_MS);
    notes.stray = await page.evaluate(
      ({ origin, markers }) => {
        const before = Array.isArray(window.dataLayer) ? window.dataLayer.length : -1;
        (function push() {
          window.dataLayer.push(arguments);
        })('event', 'proof_leak', {
          claim_id: markers.claimId,
          contact_email: markers.email,
          page_location: `${origin}/claim/success?claimId=${markers.claimId}`,
        });
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'cta_clicked', { cta_name: 'proof-alive', cta_location: 'capture' });
        }
        return { pushed: true, queuedBefore: before, queuedAfter: window.dataLayer.length };
      },
      { origin: session.origin, markers: MARKERS },
    );
    await settle(page, FLUSH_MS + 1500);
  });

  // 7. A same-site referrer that carries a query must be cut down.
  session.setPhase('referrer-setup');
  await step('referrer', async () => {
    await gotoPath(page, baseUrl, `/login?email=${encoded(MARKERS.email)}`);
    await settle(page, 1500);
    session.setPhase('referrer');
    await Promise.all([
      page.waitForURL('**/about', { timeout: 60000 }),
      page.evaluate(() => {
        window.location.href = '/about';
      }),
    ]);
    notes.referrerSeenByPage = await page.evaluate(() => document.referrer);
    await settle(page, FLUSH_MS);
  });

  // 8. Sign-up, reached by the site's own link (which carries ?type=).
  session.setPhase('signup-setup');
  await step('signup-link', async () => {
    for (const from of ['/join', '/contractors', '/contractors/join']) {
      await gotoPath(page, baseUrl, from);
      await settle(page, FLUSH_MS);
      const links = page.locator('a[href^="/signup?type="]');
      const count = await links.count();
      for (let i = 0; i < count; i += 1) {
        if (await links.nth(i).isVisible()) {
          notes.signupFrom = from;
          session.setPhase('signup');
          await links.nth(i).click();
          await page.waitForURL('**/signup?type=*', { timeout: 60000 });
          await settle(page, FLUSH_MS + 1500);
          return;
        }
      }
    }
    throw new Error('no visible sign-up link with ?type= was found');
  });

  // 9. A quick move inside the app from a counted page to a closed one, made
  //    while the library is still holding the page view for the counted page.
  //    What it sends afterwards may only be about the page that was left.
  session.setPhase('in-app-setup');
  await step('in-app-move', async () => {
    await gotoPath(page, baseUrl, '/');
    await settle(page, 1000);
    const link = page.locator('a[href="/login"]').first();
    session.setPhase('in-app-move');
    await link.click();
    await page.waitForURL('**/login', { timeout: 60000 });
    await settle(page, FLUSH_MS + 1500);
    notes.stopped.afterInAppMove = await stoppedCount(page);
    notes.flags.afterInAppMove = await page.evaluate(
      () => Object.keys(window).filter((key) => key.startsWith('ga-disable-')).map((key) => `${key}=${window[key]}`),
    );
  });

  // 10. Closed addresses, each loaded in full from a blank page, with the
  //     "yes" still stored.
  for (const target of CLOSED_ADDRESSES) {
    await step(`closed ${target}`, async () => {
      await leave();
      session.setPhase(`closed:${target.split('?')[0]}`);
      await gotoPath(page, baseUrl, target);
      await settle(page, FLUSH_MS);
    });
  }

  // 11. A counted view, then "no" in the dialog while the library is still
  //     holding that view, then the tab hidden, then the tab closed.
  await step('withdraw', async () => {
    await leave();
    session.setPhase('withdraw-setup');
    await gotoPath(page, baseUrl, '/about');
    await settle(page, 2000);
    notes.stopped.beforeNo = await stoppedCount(page);
    notes.cookies.beforeWithdrawal = (await session.analyticsCookies()).map((cookie) => cookie.name);
    await sayNo(page);
    session.setPhase('after-withdrawal');
    await settle(page, FLUSH_MS + 1500);
    notes.cookies.afterWithdrawal = (await session.analyticsCookies()).map((cookie) => cookie.name);
    await hideTab(page);
    await settle(page, 2500);
    notes.stopped.afterNo = await stoppedCount(page);
    await page.close({ runBeforeUnload: true });
    page = await session.context.newPage();
    await gotoPath(page, baseUrl, '/');
    await settle(page, FLUSH_MS);
  });
  await page.close().catch(() => {});
  session.setPhase('end');
  return notes;
}

/** Judge a finished walk. Every check has a fixed name the controls refer to. */
export function judgeWalk(session, notes, { measurementId, pages = LISTED_PATHS, title, audit }) {
  const results = new Results(title);
  const { state, origin } = session;
  const all = state.records;
  const { problems, hits } = checkRecords(all, { origin, measurementId });
  const problemsOf = (check) => problems.filter((problem) => problem.check === check);
  const sample = (list) => list.slice(0, 3).map((item) => item.detail ?? item.url ?? item).join(' ; ');

  results.record('walk-completed', notes.errors.length === 0, notes.errors.join(' ; '));

  recordIsolation(results, session, audit);

  const before = [...session.inPhase('before-consent'), ...session.inPhase('before-consent', state.library)];
  results.record(
    'nothing-before-consent',
    before.length === 0 && (notes.cookies.beforeConsent ?? []).length === 0,
    before.length ? `${before.length} request(s): ${sample(before)}` : 'no request, no cookie',
  );

  const libraryIds = state.library.map((item) => new URL(item.url).searchParams.get('id'));
  results.record(
    'library-loaded-after-consent',
    libraryIds.length > 0 && libraryIds.every((id) => id === measurementId),
    `${libraryIds.length} load(s) of the Google library, id(s): ${[...new Set(libraryIds)].join(', ') || 'none'}`,
  );

  const views = hits.filter((hit) => hit.en === 'page_view');
  const missing = pages.filter((target) => {
    const landed = notes.landed[target];
    if (!landed || !LISTED_PATHS.includes(landed)) return true;
    return !views.some((hit) => hit.__phase === `page:${target}` && pathOf(hit.dl ?? '') === landed);
  });
  results.record(
    'hits-received',
    missing.length === 0 && views.length >= pages.length,
    missing.length
      ? `no page view recorded during the full load of: ${missing.join(', ')}`
      : `${views.length} page views, one or more during the full load of each of ${pages.length} pages`,
  );

  for (const check of ['id', 'address', 'referrer', 'title', 'parameters', 'markers']) {
    const found = problemsOf(check);
    // "No problem" in no hits at all would be a bare zero.
    results.record(check, found.length === 0 && hits.length > 0, found.length ? `${found.length} problem(s): ${sample(found)}` : `${hits.length} hits clean`);
  }

  const leaked = hits.filter((hit) => hit.en === 'proof_leak');
  const alive = hits.filter((hit) => hit.en === 'cta_clicked' && hit['ep.cta_name'] === 'proof-alive');
  results.record(
    'stray-push-stopped',
    notes.stray?.pushed === true && leaked.length === 0 && alive.length > 0,
    `stray event pushed: ${notes.stray?.pushed === true ? 'yes' : 'no'}; reached Google ${leaked.length} time(s); ` +
      `the ordinary event sent just after it arrived ${alive.length} time(s)`,
  );

  // Full loads of closed addresses start from a blank page: nothing at all
  // may be sent. After the move inside the app, the library may still send
  // what it was holding, but only about the page that was left.
  const closed = [...session.inPhase('closed'), ...session.inPhase('closed', state.library)];
  const afterMove = hits.filter((hit) => hit.__phase === 'in-app-move');
  const wrongAfterMove = afterMove.filter((hit) => hit.dl !== `${origin}/`);
  const moveLibrary = session.inPhase('in-app-move', state.library);
  const switchClosed = (notes.flags.afterInAppMove ?? []).some((flag) => flag === `ga-disable-${measurementId}=true`);
  results.record(
    'closed-address',
    closed.length === 0 && wrongAfterMove.length === 0 && moveLibrary.length === 0 && switchClosed,
    closed.length
      ? `${closed.length} request(s) on closed addresses: ${sample(closed)}`
      : wrongAfterMove.length
        ? `after the in-app move, ${wrongAfterMove.length} hit(s) not about the page left: ${wrongAfterMove.map((hit) => `${hit.en} ${hit.dl}`).slice(0, 3).join(' ; ')}`
        : `nothing sent on closed addresses; after the in-app move ${afterMove.length} held hit(s) left, all about the page that was left ` +
          `(${afterMove.map((hit) => hit.en).join(', ') || 'none'}); off switch ${switchClosed ? 'closed' : 'NOT closed'}; ` +
          `the wire guard had stopped ${notes.stopped.afterInAppMove ?? 'an unread number of'} request(s) on that page`,
  );

  const utm = views.filter((hit) => pathOf(hit.dl ?? '') === '/pricing' && (hit.dl ?? '').includes('?'));
  results.record(
    'utm-kept',
    utm.length > 0 && utm.every((hit) => hit.dl === `${origin}/pricing?utm_source=proofnews&utm_medium=email`),
    utm.map((hit) => hit.dl).join(' ; ') || 'no page view in the campaign-tag step',
  );

  const movedTo = notes.utmMove ? `${origin}${notes.utmMove}` : null;
  const moved = hits.filter((hit) => hit.__phase === 'utm-move' && hit.en === 'page_view');
  results.record(
    'campaign-then-move',
    movedTo !== null &&
      moved.some((hit) => hit.dl === movedTo && hit.dr === `${origin}/pricing`) &&
      moved.every((hit) => !(hit.dr ?? '').includes('?')),
    movedTo === null
      ? 'the move from the campaign landing was not made'
      : moved.length
        ? moved.map((hit) => `${hit.dl} with referrer "${hit.dr ?? ''}"`).join(' ; ')
        : `no page view arrived for ${movedTo} after the move from the campaign landing`,
  );

  const signup = hits.filter((hit) => hit.__phase === 'signup' && hit.en === 'page_view' && pathOf(hit.dl ?? '') === '/signup');
  results.record(
    'signup-link',
    signup.length > 0 && signup.every((hit) => hit.dl === `${origin}/signup`),
    signup.length ? `from ${notes.signupFrom}: ${signup.map((hit) => hit.dl).join(' ; ')}` : 'no page view for sign-up',
  );

  const referred = hits.filter((hit) => hit.__phase === 'referrer' && hit.en === 'page_view');
  const dirtyReferrer = /\?/.test(notes.referrerSeenByPage ?? '');
  results.record(
    'referrer-reduced',
    dirtyReferrer && referred.length > 0 && referred.every((hit) => !hit.dr || hit.dr === origin || hit.dr === `${origin}/`),
    `the page saw "${notes.referrerSeenByPage ?? ''}", Google was sent "${referred.map((hit) => hit.dr ?? '').join(' ; ')}"`,
  );

  const afterNo = [...session.inPhase('after-withdrawal'), ...session.inPhase('after-withdrawal', state.library)];
  // A count of zero proves nothing unless something was there to be sent. The
  // site's wire guard counts what it stops: that count must have risen after
  // the "no", which shows the library was holding something and the guard is
  // what stopped it.
  const stoppedBefore = notes.stopped.beforeNo;
  const stoppedAfter = notes.stopped.afterNo;
  const guardStopped =
    typeof stoppedBefore === 'number' && typeof stoppedAfter === 'number' ? stoppedAfter - stoppedBefore : null;
  results.record(
    'after-withdrawal',
    afterNo.length === 0 && guardStopped !== null && guardStopped > 0,
    afterNo.length
      ? `${afterNo.length} request(s) after the "no": ${sample(afterNo)}`
      : guardStopped === null
        ? 'nothing sent after the "no", but the wire guard\'s count could not be read, so this proves nothing'
        : guardStopped > 0
          ? `nothing sent after the "no", the hidden tab or the closed tab; the wire guard stopped ${guardStopped} request(s) the library tried to send after it`
          : 'nothing sent after the "no", but the wire guard stopped nothing either: the library held nothing, so this proves nothing',
  );

  const named = notes.cookies.afterAccept ?? [];
  const expected = named.length > 0 && named.every((cookie) => /^nrpg_ga(_|$)/.test(cookie.name));
  const lifetimes = named.every((cookie) => cookie.days !== null && cookie.days <= 366);
  results.record(
    'cookies-named-as-policy',
    expected && lifetimes,
    named.map((cookie) => `${cookie.name} (${cookie.days} days)`).join(', ') || 'no analytics cookie was set',
  );
  results.record('cookie-survives-reload', notes.cookies.survivedReload === true, `id cookie ${notes.cookies.idName ?? 'not found'}`);
  // "None left" counts only if there was one to remove just before the "no".
  const cookiesBefore = notes.cookies.beforeWithdrawal ?? [];
  const cookiesAfter = notes.cookies.afterWithdrawal;
  results.record(
    'cookies-removed-on-withdrawal',
    cookiesBefore.length > 0 && Array.isArray(cookiesAfter) && cookiesAfter.length === 0,
    cookiesBefore.length === 0
      ? 'no analytics cookie was there just before the "no", so this proves nothing'
      : `just before the "no": ${cookiesBefore.join(', ')}; after it: ${(cookiesAfter ?? ['not measured']).join(', ') || 'none left'}`,
  );

  const refused = state.violations.filter((item) => /google|doubleclick/i.test(item.blocked ?? ''));
  results.record(
    'policy-no-refusal',
    refused.length === 0,
    refused.length ? refused.slice(0, 4).map((item) => `${item.blocked} (${item.directive}) on ${item.page}`).join(' ; ') : 'the security policy refused no Google request',
  );

  return { results, hits, problems, hitLines: hits.map((hit) => `[${hit.__phase}] ${describeHit(hit)}`) };
}
