import { test, expect, type BrowserContext, type Page, type Request } from '@playwright/test';
import { isGoogleUrl, isLibraryLoad } from './helpers/google-rule';

/**
 * Consent-gated analytics, our side only.
 *
 * Runs against a development server started for this spec alone (its own
 * port, a fake measurement id; see playwright.config.ts, ANALYTICS_E2E=1).
 * The Google library is replaced by an empty file and every other request to
 * Google is answered here; the browser is also started able to find this
 * machine only, so nothing leaves it. What the real
 * library does with what we hand it is proved separately by
 * scripts/analytics-proof/capture.mjs.
 *
 *   ANALYTICS_E2E=1 pnpm exec playwright test e2e/analytics-consent.spec.ts --project=chromium
 */

const FAKE_ID = 'G-TEST000000';
const REAL_ID = 'G-RK33F1ZD1H';

test.use({ launchOptions: { args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost'] } });

interface Seen {
  library: string[];
  /** Collection requests this spec answered. */
  collection: string[];
  /** Every collection request the browser made, answered here or not. */
  wire: string[];
  /** The same requests with the headers the browser sent (spec E49). */
  sent: Array<{ url: string; headers: Record<string, string> }>;
}

/** The library load for the fake id: the one request to Google answered with a file (spec E44). */
function libraryLoad(request: Request): boolean {
  return isLibraryLoad(request.url(), request.resourceType(), request.method(), FAKE_ID);
}

async function watchGoogle(context: BrowserContext): Promise<Seen> {
  const seen: Seen = { library: [], collection: [], wire: [], sent: [] };
  context.on('request', (request) => {
    if (isGoogleUrl(request.url()) && !libraryLoad(request)) {
      seen.wire.push(request.url());
      seen.sent.push({ url: request.url(), headers: request.headers() });
    }
  });
  // Every Google host the site screens, from the one host file; the library
  // load is matched exactly, and any other request to Google is collection.
  await context.route((url) => isGoogleUrl(url.href), async (route) => {
    const url = route.request().url();
    if (libraryLoad(route.request())) {
      seen.library.push(url);
      await route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stand-in for the Google library */' });
      return;
    }
    seen.collection.push(url);
    await route.fulfill({ status: 204, body: '' });
  });
  return seen;
}

const OWN_ID = /^[1-9]\d{8}\.[1-9]\d{9}$/;
const SENT_FIELDS = new Set(['v', 'tid', 'npa', 'en', 'dl', 'dt', 'dp', 'dr', 'cid', 'sid', 'sct', 'seg', '_s', '_et', '_fv', '_ss', '_nsi']);

/** True when a request is the site's own rebuilt page view of the home page (spec E47). */
function isRebuiltHomeView(url: string, baseURL: string): boolean {
  const sent = new URL(url);
  if (`${sent.origin}${sent.pathname}` !== 'https://www.google-analytics.com/g/collect') return false;
  const keys = [...sent.searchParams.keys()];
  if (new Set(keys).size !== keys.length || keys.some((key) => !SENT_FIELDS.has(key))) return false;
  const field = (key: string) => sent.searchParams.get(key);
  return (
    field('v') === '2' &&
    field('tid') === FAKE_ID &&
    field('npa') === '1' &&
    field('en') === 'page_view' &&
    field('dl') === `${baseURL}/` &&
    field('dt') === 'Home' &&
    OWN_ID.test(field('cid') ?? '')
  );
}

/** What our code queued for Google, as plain data. */
async function queued(page: Page): Promise<unknown[][]> {
  return page.evaluate(() => {
    const layer = (window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? [];
    return Array.from(layer).map((entry) =>
      Array.from(entry).map((part) => {
        try {
          return JSON.parse(JSON.stringify(part ?? null));
        } catch {
          return null;
        }
      }),
    );
  });
}

async function queuedEvents(page: Page): Promise<Array<{ name: string; params: Record<string, unknown> }>> {
  return (await queued(page))
    .filter((entry) => entry[0] === 'event')
    .map((entry) => ({ name: String(entry[1]), params: (entry[2] ?? {}) as Record<string, unknown> }));
}

async function offSwitch(page: Page): Promise<unknown> {
  return page.evaluate((id) => (window as unknown as Record<string, unknown>)[`ga-disable-${id}`], FAKE_ID);
}

async function accept(page: Page): Promise<void> {
  const notice = page.getByRole('region', { name: 'Cookie notice' });
  await expect(notice).toBeVisible({ timeout: 30_000 });
  await notice.getByRole('button', { name: 'Accept All' }).click();
}

test.describe.configure({ mode: 'serial' });

test.describe('consent-gated analytics', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'this spec runs on the chromium project only');
    test.skip(process.env.ANALYTICS_E2E !== '1', 'needs the analytics server: run with ANALYTICS_E2E=1');
    testInfo.setTimeout(180_000);
  });

  test('the server under test carries the fake id, never the real one', async ({ page, context, baseURL }) => {
    const seen = await watchGoogle(context);
    await page.goto('/');
    await accept(page);
    await expect.poll(() => seen.library.length, { timeout: 30_000 }).toBeGreaterThan(0);
    expect(seen.library.every((url) => url.includes(`id=${FAKE_ID}`))).toBe(true);
    expect([...seen.library, ...seen.collection].some((url) => url.includes(REAL_ID))).toBe(false);
    expect(await page.content()).not.toContain(REAL_ID);
    expect(baseURL).not.toContain(':3000');
  });

  test('nothing is queued or requested before the visitor chooses', async ({ page, context }) => {
    const seen = await watchGoogle(context);
    await page.goto('/');
    await expect(page.getByRole('region', { name: 'Cookie notice' })).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(2500);
    expect(seen.library).toEqual([]);
    expect(seen.wire).toEqual([]);
    expect(await queuedEvents(page)).toEqual([]);
  });

  test('after a yes, the home page is counted with its clean address', async ({ page, context, baseURL }) => {
    await watchGoogle(context);
    await page.goto('/?utm_source=newsletter');
    await accept(page);
    await expect.poll(async () => (await queuedEvents(page)).length, { timeout: 30_000 }).toBeGreaterThan(0);
    const views = (await queuedEvents(page)).filter((event) => event.name === 'page_view');
    expect(views.length).toBe(1);
    expect(views[0].params.page_location).toBe(`${baseURL}/?utm_source=newsletter`);
    expect(await offSwitch(page)).toBe(false);
  });

  test('a move inside the app to a closed page sends nothing more', async ({ page, context }) => {
    const seen = await watchGoogle(context);
    await page.goto('/');
    await accept(page);
    await expect.poll(async () => (await queuedEvents(page)).length, { timeout: 30_000 }).toBeGreaterThan(0);
    const before = (await queued(page)).length;

    await page.locator('a[href="/login"]').first().click();
    await page.waitForURL('**/login', { timeout: 60_000 });
    await page.waitForTimeout(2500);

    expect(await offSwitch(page)).toBe(true);
    const after = await queued(page);
    expect(after.slice(before).filter((entry) => entry[0] === 'event')).toEqual([]);
    expect(seen.wire).toEqual([]);
  });

  test('a closed address is never counted, even with a stored yes', async ({ page, context }) => {
    const seen = await watchGoogle(context);
    await page.goto('/');
    await accept(page);
    await expect.poll(() => seen.library.length, { timeout: 30_000 }).toBeGreaterThan(0);
    const loads = seen.library.length;

    await page.goto('/login?email=someone%40example.invalid');
    await page.waitForTimeout(2500);
    expect(seen.library.length).toBe(loads);
    expect(await queuedEvents(page)).toEqual([]);
    expect(seen.wire).toEqual([]);
  });

  test('in a real browser only a clean event can leave for Google, and none after a no', async ({ page, context, baseURL }) => {
    const seen = await watchGoogle(context);
    await page.goto('/');
    await accept(page);
    await expect.poll(async () => (await queuedEvents(page)).length, { timeout: 30_000 }).toBeGreaterThan(0);

    const collect = `https://www.google-analytics.com/g/collect?v=2&tid=${FAKE_ID}`;
    const home = encodeURIComponent(`${baseURL}/`);
    const clean = `${collect}&en=page_view&dl=${home}&dt=Home`;
    const closedPage = `${collect}&en=page_view&dl=${encodeURIComponent(`${baseURL}/claim/success?claimId=SPEC-1`)}`;
    const libraryOwn = `${collect}&en=scroll&dl=${home}&epn.percent_scrolled=90`;

    // The four ways a script can send something: fetch, a beacon, the older
    // request object, and an image.
    const tryEveryWay = (urls: string[]) =>
      page.evaluate(async (list) => {
        for (const url of list) {
          await fetch(url, { method: 'POST', keepalive: true }).catch(() => undefined);
          navigator.sendBeacon(url);
          const older = new XMLHttpRequest();
          older.open('POST', url);
          older.send();
          new Image().src = url;
        }
      }, urls);

    await tryEveryWay([closedPage, libraryOwn]);
    await page.waitForTimeout(1500);
    expect(seen.wire).toEqual([]);

    // Control: the same code does send a clean event (by fetch and by beacon).
    await tryEveryWay([clean]);
    await expect.poll(() => seen.wire.length, { timeout: 15_000 }).toBe(2);
    // What leaves is the site's own rebuilt hit, not the request the script wrote (spec E47).
    expect(seen.wire.every((url) => isRebuiltHomeView(url, baseURL as string))).toBe(true);

    // The caller's request options never reach Google: the site sends its own (spec E49).
    await page.evaluate(async (url) => {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { Accept: 'text/prooftoken7731abcdef' },
        referrer: '/?claim=prooftoken7731abcdef',
        referrerPolicy: 'unsafe-url',
        credentials: 'include',
      }).catch(() => undefined);
    }, clean);
    await expect.poll(() => seen.sent.length, { timeout: 15_000 }).toBe(3);
    const optioned = seen.sent[2];
    expect(isRebuiltHomeView(optioned.url, baseURL as string)).toBe(true);
    expect(optioned.headers.accept).toBe('*/*');
    expect(JSON.stringify(optioned.headers)).not.toContain('prooftoken7731abcdef');

    // After a no, not even the clean event leaves.
    const control = page.getByRole('button', { name: 'Cookie settings', exact: true }).first();
    await control.scrollIntoViewIfNeeded();
    await control.click();
    const dialog = page.getByRole('dialog', { name: 'Cookie settings' });
    await dialog.getByRole('switch', { name: 'Analytics cookies' }).click();
    await dialog.getByRole('button', { name: 'Save choices' }).click();
    await expect(dialog).toBeHidden({ timeout: 15_000 });
    await tryEveryWay([clean]);
    await page.waitForTimeout(1500);
    expect(seen.wire.length).toBe(3);
  });

  test('the analytics cookie survives two full reloads, and a no removes it', async ({ page, context, baseURL }) => {
    await watchGoogle(context);
    await page.goto('/');
    await accept(page);
    await expect.poll(async () => (await queuedEvents(page)).length, { timeout: 30_000 }).toBeGreaterThan(0);

    // The stand-in library sets no cookie, so plant the one the real library would.
    const value = 'GA1.1.1111111111.2222222222';
    await context.addCookies([{ name: 'nrpg_ga', value, url: baseURL as string }]);
    const idCookie = async () => (await context.cookies(baseURL as string)).find((cookie) => cookie.name === 'nrpg_ga');

    for (let i = 0; i < 2; i += 1) {
      await page.reload();
      await expect(page.getByRole('button', { name: 'Cookie settings', exact: true }).first()).toBeAttached({ timeout: 30_000 });
      await page.waitForTimeout(1500);
      expect((await idCookie())?.value).toBe(value);
    }

    // Control: the same reading must be able to see the cookie go.
    const control = page.getByRole('button', { name: 'Cookie settings', exact: true }).first();
    await control.scrollIntoViewIfNeeded();
    await control.click();
    const dialog = page.getByRole('dialog', { name: 'Cookie settings' });
    await dialog.getByRole('switch', { name: 'Analytics cookies' }).click();
    await dialog.getByRole('button', { name: 'Save choices' }).click();
    await expect.poll(async () => (await idCookie())?.value ?? null, { timeout: 15_000 }).toBeNull();
    expect(await offSwitch(page)).toBe(true);
  });

  test('the switches in Cookie settings are drawn, and on looks different from off', async ({ page }) => {
    await page.goto('/');
    const notice = page.getByRole('region', { name: 'Cookie notice' });
    await expect(notice).toBeVisible({ timeout: 30_000 });
    await notice.getByRole('button', { name: 'Customise' }).click();
    const dialog = page.getByRole('dialog', { name: 'Cookie settings' });
    await expect(dialog).toBeVisible();

    // The colour each part is painted with. A part with no usable colour
    // reads as rgba(0, 0, 0, 0): present, clickable and impossible to see.
    const paint = (name: string) =>
      dialog.getByRole('switch', { name }).evaluate((el) => ({
        track: getComputedStyle(el).backgroundColor,
        thumb: getComputedStyle(el.firstElementChild as Element).backgroundColor,
      }));
    const solid = /^rgb\(/;

    for (const name of ['Necessary cookies', 'Analytics cookies']) {
      const colours = await paint(name);
      expect(colours.track, `${name} track`).toMatch(solid);
      expect(colours.thumb, `${name} thumb`).toMatch(solid);
      expect(colours.thumb, `${name} thumb against its track`).not.toBe(colours.track);
    }

    const off = await paint('Analytics cookies');
    await dialog.getByRole('switch', { name: 'Analytics cookies' }).click();
    await expect(dialog.getByRole('switch', { name: 'Analytics cookies' })).toHaveAttribute('aria-checked', 'true');
    await expect.poll(async () => (await paint('Analytics cookies')).track, { timeout: 5_000 }).not.toBe(off.track);
  });
});
