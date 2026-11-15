/**
 * The last gate: what may actually leave the browser for Google.
 *
 * The Google library holds events for some seconds before it sends them, and
 * it adds events of its own (scrolling, form use) when the Analytics property
 * asks it to. So the rules are applied again at the moment a request is made:
 * the visitor's "yes" must still stand, and every event in the request must be
 * about a counted page and carry only listed parameters.
 */
import {
  ALLOWED_EVENT_PARAMS,
  CONSENT_STORAGE_KEY,
  isCollectionUrl,
  screenCollect,
  writeStoredConsent,
} from '@/lib/analytics-gate';
import * as Sentry from '@sentry/nextjs';
import {
  __resetAnalyticsForTests,
  gateOpen,
  initializeGA4,
  installAnalyticsGuards,
  withdrawAnalytics,
} from '@/lib/analytics';

jest.mock('@sentry/nextjs', () => ({ captureMessage: jest.fn() }), { virtual: true });

const ID = 'G-TEST000000';
const ORIGIN = 'http://localhost';
const COLLECT = 'https://www.google-analytics.com/g/collect';
const context = { origin: ORIGIN, measurementId: ID };
const enc = encodeURIComponent;

function single(fields: Record<string, string>): string {
  return `${COLLECT}?${new URLSearchParams({ v: '2', tid: ID, ...fields }).toString()}`;
}

const CLEAN_VIEW = { en: 'page_view', dl: `${ORIGIN}/about`, dt: 'About' };
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
/** How many requests to Google the guard has stopped or trimmed on this page load. */
const stopped = () => Number(document.documentElement.getAttribute('data-nrpg-wire-dropped') ?? '0');
const warnings = () =>
  (Sentry.captureMessage as jest.Mock).mock.calls.map(([message, detail]) => `${message} | ${JSON.stringify(detail)}`);

describe('isCollectionUrl', () => {
  it.each([
    'https://www.google-analytics.com/g/collect?v=2',
    'https://region1.google-analytics.com/g/collect',
    'https://google-analytics.com/collect',
    'https://region1.analytics.google.com/g/collect',
    'https://stats.g.doubleclick.net/g/collect',
    'https://www.googletagmanager.com/g/collect?v=2',
    'https://www.google.com/ccm/collect?x=1',
  ])('collection: %s', (url) => {
    expect(isCollectionUrl(url)).toBe(true);
  });

  it.each([
    'https://www.googletagmanager.com/gtag/js?id=G-TEST000000',
    'http://localhost/api/public/claims/submit',
    '/api/health',
    'https://google-analytics.com.example.org/g/collect',
    'https://example.org/?next=https://www.google-analytics.com/g/collect',
    'data:text/plain,google-analytics.com',
    '',
    null,
    undefined,
    42,
  ])('not collection: %s', (url) => {
    expect(isCollectionUrl(url)).toBe(false);
  });
});

// Spec E40 (kind K1, eighth time): on a Google host the one exception, the
// library file, is the form that is listed; every other address is screened.
describe('isCollectionUrl allow-lists the library, not the collection (spec E40)', () => {
  const LIBRARY = `https://www.googletagmanager.com/gtag/js?id=${ID}`;

  it('[AC-K1d] the exact library address is not collection', () => {
    expect(isCollectionUrl(LIBRARY)).toBe(false);
    expect(isCollectionUrl('https://www.googletagmanager.com/gtag/js?id=G-RK33F1ZD1H')).toBe(false);
  });

  it.each([
    [`https://www.googletagmanager.com/gtag/destination?id=${ID}&t=dc`, 'another file under /gtag/'],
    [`https://www.googletagmanager.com/gtag/guest?id=${ID}`, 'another file under /gtag/'],
    [`https://www.googletagmanager.com/gtag/`, 'the folder itself'],
    [`${LIBRARY}&dl=${enc('https://x.example/?email=a@b.com')}`, 'the library with an extra field'],
    [`${LIBRARY}&id=G-OTHER00000`, 'the library with a second id'],
    ['https://www.googletagmanager.com/gtag/js?id=not-an-id', 'another id shape'],
    ['https://www.googletagmanager.com/gtag/js', 'no id'],
    [`http://www.googletagmanager.com/gtag/js?id=${ID}`, 'over http'],
    [`https://www.googletagmanager.com:8443/gtag/js?id=${ID}`, 'with a port'],
    [`${LIBRARY}#x`, 'with a fragment'],
    [`https://user:pass@www.googletagmanager.com/gtag/js?id=${ID}`, 'with a user name'],
    [`https://googletagmanager.com/gtag/js?id=${ID}`, 'another tag host name'],
    [`https://www.googletagmanager.com/GTAG/js?id=${ID}`, 'another spelling of the path'],
    [`https://www.googletagmanager.com/gtag/js/?id=${ID}`, 'a trailing slash'],
    [`https://www.googletagmanager.com./gtag/js?id=${ID}`, 'the tag host with a trailing dot'],
    ['https://www.google-analytics.com./g/collect?v=2', 'a collection host with a trailing dot'],
    ['https://region1.analytics.google.com./g/collect', 'a regional collection host with a trailing dot'],
    ['https://www.google.com/anything?x=1', 'a google.* address whose path does not look like collection'],
    ['https://www.google.com.au/measurement?x=1', 'a country google.* address'],
  ])('[AC-K1d] screened as collection: %s (%s)', (url) => {
    expect(isCollectionUrl(url)).toBe(true);
  });

  it('[AC-K1d] addresses that are not Google stay out of the screen', () => {
    for (const url of [
      'https://google-analytics.com.example.org/g/collect',
      'https://example.org/gtag/destination?id=G-TEST000000',
      'https://notgoogle.com/collect',
      'http://localhost/api/health',
    ]) {
      expect(isCollectionUrl(url)).toBe(false);
    }
  });
});

describe('screenCollect', () => {
  it('passes a clean single event unchanged', () => {
    const url = single(CLEAN_VIEW);
    expect(screenCollect(url, undefined, context)).toEqual({ url, body: undefined });
  });

  it('passes campaign tags and a clean referrer', () => {
    const url = single({
      ...CLEAN_VIEW,
      dl: `${ORIGIN}/pricing?utm_source=news&utm_medium=email`,
      dt: 'Pricing',
      dr: 'https://example.org',
    });
    expect(screenCollect(url, '', context)).toEqual({ url, body: undefined });
  });

  it('passes listed event parameters', () => {
    const url = single({ en: 'claim_submitted', dl: `${ORIGIN}/claim/step-3`, 'ep.claim_type': 'water-damage', 'epn.event_timeout': '1000' });
    expect(screenCollect(url, null, context)).not.toBeNull();
  });

  it.each([
    ['a closed page', { dl: `${ORIGIN}/claim/success` }],
    ['a query that is not a campaign tag', { dl: `${ORIGIN}/claim/step-3?claimId=CLM-1` }],
    ['the sign-up type (it opens the gate but is never sent)', { dl: `${ORIGIN}/signup?type=contractor` }],
    ['another site', { dl: 'https://example.org/about' }],
    ['no address at all', { dl: '' }],
    ['a referrer with a query', { dr: `${ORIGIN}/login?email=a%40b.co` }],
    ['a referrer naming a closed page', { dr: `${ORIGIN}/dashboard` }],
    ['another site’s page as referrer', { dr: 'https://example.org/thread/42' }],
    ['the page\u2019s own title', { dt: 'Claim CLM-1 for a named person' }],
    ['the fixed title of a different page', { dt: 'Pricing' }],
    ['a user id', { uid: 'user-1' }],
    ['a user property', { 'up.plan': 'gold' }],
    ['a parameter that is not listed', { 'ep.claim_id': 'CLM-1' }],
    ['a numeric parameter that is not listed', { 'epn.percent_scrolled': '90' }],
    ['a listed parameter holding an email', { 'ep.claim_type': 'a@b.co' }],
    ['a listed parameter holding an address', { 'ep.cta_name': 'https://x.example/?t=1' }],
    ['a dirty page address parameter', { 'ep.page_location': `${ORIGIN}/claim/success?claimId=1` }],
    ['a page path parameter for another page', { 'ep.page_path': '/dashboard' }],
    ['a page path field for another page', { dp: '/pricing' }],
    ['a page path field with a query', { dp: '/about?claimId=CLM-1' }],
    ['a number parameter that is not a number', { 'epn.scroll_depth': '50; a@b.co' }],
    ['an email in a field the library keeps for itself', { _x: 'a@b.co' }],
    ['an address in a field the library keeps for itself', { _x: 'https://example.org/a?b=1' }],
    ['a listed name in another spelling', { 'ep.Claim_type': 'water' }],
    ['an event name that is not a plain word', { en: 'Bad Name!' }],
    ['another property', { tid: 'G-OTHER00000' }],
  ])('drops an event with %s', (_label, change) => {
    expect(screenCollect(single({ ...CLEAN_VIEW, ...change }), undefined, context)).toBeNull();
  });

  // A percent sign can spell an @ or a slash, so a value is judged in every
  // form it can be unescaped to. The case after this block is the clean twin.
  it.each([
    ['a listed parameter holding an escaped email', { 'ep.claim_type': 'a%40b.co' }],
    ['a listed parameter holding a twice-escaped email', { 'ep.claim_type': 'a%2540b.co' }],
    ['an escaped email in a field the library keeps for itself', { _x: 'a%40b.co' }],
    ['a twice-escaped email in a field the library keeps for itself', { _x: 'a%2540b.co' }],
    ['an escaped address in a field the library keeps for itself', { _x: 'https%3A%2F%2Fexample.org%2Fa' }],
    ['an escaped email beside a broken escape in a library field', { _x: 'a%40b.co%ZZ' }],
    ['a library field escaped more deeply than the screen will read', { _x: 'a%25252525252540b.co' }],
  ])('[AC-A4n] drops an event with %s', (_label, change) => {
    expect(screenCollect(single({ ...CLEAN_VIEW, ...change }), undefined, context)).toBeNull();
  });

  it('[AC-A4n] keeps a library field whose own escapes hold no address or email', () => {
    const browserList = 'Not(A%3ABrand;8.0.0.0|Google%20Chrome;131.0.0.0';
    expect(screenCollect(single({ ...CLEAN_VIEW, uafvl: browserList }), undefined, context)).not.toBeNull();
  });

  it('drops a request that names its address twice', () => {
    expect(screenCollect(`${single(CLEAN_VIEW)}&dl=${enc(`${ORIGIN}/dashboard`)}`, undefined, context)).toBeNull();
  });

  it('passes the page fields this site sends with a page view', () => {
    const url = single({
      ...CLEAN_VIEW,
      dr: `${ORIGIN}/pricing`,
      'ep.page_path': '/about',
      dp: '/about',
      _et: '12',
      sr: '1280x900',
      ul: 'en-au',
    });
    expect(screenCollect(url, undefined, context)).not.toBeNull();
  });

  it('drops an event with no name', () => {
    const { en: _en, ...rest } = CLEAN_VIEW;
    expect(screenCollect(single(rest), undefined, context)).toBeNull();
  });

  it('keeps the clean events of a batch and drops the rest', () => {
    const url = `${COLLECT}?v=2&tid=${ID}&dl=${enc(`${ORIGIN}/about`)}`;
    const body = [
      'en=page_view&dt=About',
      'en=scroll&epn.percent_scrolled=90',
      `en=form_start&ep.form_id=&ep.form_destination=${enc(`${ORIGIN}/signup?type=contractor`)}`,
      'en=scroll_depth&epn.scroll_depth=50&ep.event_category=Engagement',
      `en=claim_submitted&dl=${enc(`${ORIGIN}/claim/success?claimId=CLM-1`)}`,
    ].join('\r\n');
    expect(screenCollect(url, body, context)).toEqual({
      url,
      body: ['en=page_view&dt=About', 'en=scroll_depth&epn.scroll_depth=50&ep.event_category=Engagement'].join('\r\n'),
    });
  });

  it('drops the whole request when no event in the batch is clean', () => {
    const url = `${COLLECT}?v=2&tid=${ID}&dl=${enc(`${ORIGIN}/about`)}`;
    expect(screenCollect(url, 'en=scroll&epn.percent_scrolled=90\r\nen=form_start&ep.form_id=x', context)).toBeNull();
  });

  it('drops a batch whose shared part breaks a rule, even when each event is clean', () => {
    const clean = `en=page_view&dl=${enc(`${ORIGIN}/about`)}`;
    const closedShared = `${COLLECT}?v=2&tid=${ID}&dl=${enc(`${ORIGIN}/claim/success?claimId=CLM-1`)}`;
    expect(screenCollect(closedShared, clean, context)).toBeNull();
    const userShared = `${COLLECT}?v=2&tid=${ID}&uid=user-1`;
    expect(screenCollect(userShared, clean, context)).toBeNull();
    // The same events with a clean shared part do pass.
    expect(screenCollect(`${COLLECT}?v=2&tid=${ID}`, clean, context)).toEqual({ url: `${COLLECT}?v=2&tid=${ID}`, body: clean });
  });

  it('drops a request whose body cannot be read as text', () => {
    expect(screenCollect(single(CLEAN_VIEW), { size: 10 }, context)).toBeNull();
    expect(screenCollect(single(CLEAN_VIEW), 42, context)).toBeNull();
  });

  it('drops a request that is not to a collection address, or cannot be parsed', () => {
    expect(screenCollect('http://localhost/api/x?en=page_view', undefined, context)).toBeNull();
    expect(screenCollect('not a url', undefined, context)).toBeNull();
    expect(screenCollect(single(CLEAN_VIEW), undefined, { origin: '', measurementId: ID })).toBeNull();
    expect(screenCollect(single(CLEAN_VIEW), undefined, { origin: ORIGIN, measurementId: '' })).toBeNull();
  });

  it('the listed parameters used above are on the one list', () => {
    for (const name of ['claim_type', 'event_timeout', 'scroll_depth', 'event_category']) {
      expect(ALLOWED_EVENT_PARAMS.has(name)).toBe(true);
    }
  });
});

describe('the wire guard installed in the page', () => {
  type Win = { fetch?: unknown };
  type Globals = { Response?: unknown };
  const realResponse = (globalThis as Globals).Response;

  beforeAll(() => {
    // The test browser has no Response; a real one always does.
    if (realResponse === undefined) {
      (globalThis as Globals).Response = class {
        status: number;
        constructor(_body: unknown, init?: { status?: number }) {
          this.status = init?.status ?? 200;
        }
      };
    }
  });

  afterAll(() => {
    if (realResponse === undefined) delete (globalThis as Globals).Response;
  });
  const realFetch = (window as Win).fetch;
  const realBeaconOwner = Object.getOwnPropertyDescriptor(navigator, 'sendBeacon');
  let fetchSpy: jest.Mock;
  let beaconSpy: jest.Mock;

  function setUp(consent: boolean | null) {
    window.localStorage.clear();
    if (consent !== null) writeStoredConsent(window.localStorage, consent);
    window.history.replaceState(null, '', '/about');
    fetchSpy = jest.fn(async () => ({ ok: true, status: 200 }));
    beaconSpy = jest.fn(() => true);
    (window as Win).fetch = fetchSpy;
    Object.defineProperty(navigator, 'sendBeacon', { value: beaconSpy, configurable: true, writable: true });
    initializeGA4({ measurementId: ID });
  }

  beforeEach(() => {
    __resetAnalyticsForTests();
  });

  afterEach(() => {
    __resetAnalyticsForTests();
    if (realFetch === undefined) delete (window as Win).fetch;
    else (window as Win).fetch = realFetch;
    if (realBeaconOwner) Object.defineProperty(navigator, 'sendBeacon', realBeaconOwner);
    else delete (navigator as unknown as Record<string, unknown>).sendBeacon;
    window.localStorage.clear();
  });

  it('leaves every other request alone', async () => {
    setUp(true);
    const init = { method: 'POST', body: '{"a":1}' };
    await window.fetch('/api/public/claims/submit', init);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe('/api/public/claims/submit');
    expect(fetchSpy.mock.calls[0][1]).toBe(init);
    expect(navigator.sendBeacon('/api/log', 'x')).toBe(true);
    expect(beaconSpy).toHaveBeenCalledWith('/api/log', 'x');
  });

  it('lets a clean event through while the yes stands', async () => {
    setUp(true);
    const url = single(CLEAN_VIEW);
    await window.fetch(url, { method: 'POST', keepalive: true });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe(url);
    expect(fetchSpy.mock.calls[0][1]).toMatchObject({ method: 'POST', keepalive: true });
  });

  it('sends only the clean part of a batch', async () => {
    setUp(true);
    const url = `${COLLECT}?v=2&tid=${ID}&dl=${enc(`${ORIGIN}/about`)}`;
    await window.fetch(url, { method: 'POST', body: 'en=page_view\r\nen=scroll&epn.percent_scrolled=90' });
    expect(fetchSpy.mock.calls[0][1].body).toBe('en=page_view');
    navigator.sendBeacon(url, 'en=scroll&epn.percent_scrolled=90\r\nen=user_engagement');
    expect(beaconSpy).toHaveBeenCalledWith(url, 'en=user_engagement');
  });

  it('[wire] a queued event does not leave after the visitor says no', async () => {
    setUp(true);
    writeStoredConsent(window.localStorage, false);
    const answer = await window.fetch(single(CLEAN_VIEW), { method: 'POST' });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(answer.status).toBe(204);
    expect(navigator.sendBeacon(single(CLEAN_VIEW), '')).toBe(true);
    expect(beaconSpy).not.toHaveBeenCalled();
  });

  it('nothing leaves when no choice is stored, or the stored choice is unreadable', async () => {
    setUp(null);
    await window.fetch(single(CLEAN_VIEW));
    window.localStorage.setItem(CONSENT_STORAGE_KEY, '{not json');
    await window.fetch(single(CLEAN_VIEW));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('[wire] an event the Google library adds by itself does not leave', async () => {
    setUp(true);
    await window.fetch(single({ en: 'form_start', dl: `${ORIGIN}/about`, 'ep.form_destination': `${ORIGIN}/signup?type=client` }));
    navigator.sendBeacon(single({ en: 'scroll', dl: `${ORIGIN}/about`, 'epn.percent_scrolled': '90' }));
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(beaconSpy).not.toHaveBeenCalled();
  });

  it('a clean event about the page just left still goes after a move to a closed page', async () => {
    setUp(true);
    window.history.pushState(null, '', '/login');
    await window.fetch(single({ en: 'page_view', dl: `${ORIGIN}/about` }));
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    // ...but nothing that names the closed page.
    await window.fetch(single({ en: 'page_view', dl: `${ORIGIN}/login` }));
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('drops a request object, whose body cannot be read in time', async () => {
    setUp(true);
    await window.fetch({ url: single(CLEAN_VIEW) } as unknown as Request);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('[AC-K1d] with a stored no, a tag-host file other than the library is not sent by fetch or beacon', async () => {
    setUp(true);
    writeStoredConsent(window.localStorage, false);
    const destination = `https://www.googletagmanager.com/gtag/destination?id=${ID}&t=dc`;
    const extra = `https://www.googletagmanager.com/gtag/js?id=${ID}&dl=${enc(`${ORIGIN}/about?email=a@b.com`)}`;
    for (const url of [destination, extra]) {
      const answer = await window.fetch(url, { method: 'POST' });
      expect(answer.status).toBe(204);
      expect(navigator.sendBeacon(url, '')).toBe(true);
    }
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(beaconSpy).not.toHaveBeenCalled();
  });

  it('[AC-K1d] an image to a Google host written with a trailing dot is not loaded', () => {
    setUp(true);
    const image = new Image();
    image.src = `https://www.google-analytics.com./g/collect?v=2&tid=${ID}&en=page_view&dl=${enc(`${ORIGIN}/about?email=a@b.com`)}`;
    expect(image.getAttribute('src')).toBeNull();
  });

  // Spec E41: the library's tag diagnostics leave by a new script element whose
  // address is the library's own plus the diagnostics fields.
  it('[AC-K1e] a script element is not given a Google address other than the exact library file', () => {
    setUp(true);
    const library = `https://www.googletagmanager.com/gtag/js?id=${ID}`;
    const diagnostics = `${library}&is_td=1&v=3&t=t&dl=localhost%2Fhow-it-works&mde=x`;
    const byProperty = document.createElement('script');
    byProperty.src = diagnostics;
    expect(byProperty.getAttribute('src')).toBeNull();
    const byAttribute = document.createElement('script');
    byAttribute.setAttribute('src', diagnostics);
    expect(byAttribute.getAttribute('src')).toBeNull();
    const byUpperName = document.createElement('script');
    byUpperName.setAttribute('SRC', `https://www.googletagmanager.com/td?id=${ID}&dl=localhost%2Fdashboard`);
    expect(byUpperName.getAttribute('src')).toBeNull();
  });

  it("[AC-K1e] the exact library file and the site's own scripts still load", () => {
    setUp(true);
    const library = document.createElement('script');
    library.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`;
    expect(library.getAttribute('src')).toBe(`https://www.googletagmanager.com/gtag/js?id=${ID}`);
    const own = document.createElement('script');
    own.setAttribute('src', '/_next/static/chunks/main.js');
    expect(own.getAttribute('src')).toBe('/_next/static/chunks/main.js');
    own.setAttribute('type', 'module');
    expect(own.getAttribute('type')).toBe('module');
  });

  it('[AC-K1e] an image is not given a collection address by attribute', () => {
    setUp(true);
    const image = new Image();
    image.setAttribute('src', single(CLEAN_VIEW));
    expect(image.getAttribute('src')).toBeNull();
    image.setAttribute('src', '/logo.png');
    expect(image.getAttribute('src')).toBe('/logo.png');
  });

  it('other ways out (XMLHttpRequest, an image) are closed for collection addresses', () => {
    setUp(true);
    const send = jest.spyOn(XMLHttpRequest.prototype, 'send').mockImplementation(() => undefined);
    __resetAnalyticsForTests();
    initializeGA4({ measurementId: ID });
    const blocked = new XMLHttpRequest();
    blocked.open('POST', single(CLEAN_VIEW));
    blocked.send('en=page_view');
    expect(send).not.toHaveBeenCalled();
    const allowed = new XMLHttpRequest();
    allowed.open('GET', '/api/health');
    allowed.send();
    expect(send).toHaveBeenCalledTimes(1);

    const image = new Image();
    image.src = single(CLEAN_VIEW);
    expect(image.getAttribute('src')).toBeNull();
    image.src = '/logo.png';
    expect(image.getAttribute('src')).toBe('/logo.png');
    __resetAnalyticsForTests();
    send.mockRestore();
  });

  it('[wire] if the guard cannot be installed the gate stays closed', () => {
    window.localStorage.clear();
    writeStoredConsent(window.localStorage, true);
    window.history.replaceState(null, '', '/about');
    const win = window as unknown as { dataLayer: unknown[] };
    win.dataLayer = [];
    Object.defineProperty(window, 'fetch', { value: jest.fn(), configurable: true, writable: false });
    installAnalyticsGuards();
    initializeGA4({ measurementId: ID });
    expect(gateOpen()).toBe(false);
    expect(win.dataLayer).toHaveLength(0);
    Object.defineProperty(window, 'fetch', { value: undefined, configurable: true, writable: true });
  });

  it('[wire] a guard that cannot be installed is reported once, with no values', async () => {
    window.localStorage.clear();
    writeStoredConsent(window.localStorage, true);
    window.history.replaceState(null, '', '/about?email=pat%40example.com');
    Object.defineProperty(window, 'fetch', { value: jest.fn(), configurable: true, writable: false });
    installAnalyticsGuards();
    initializeGA4({ measurementId: ID });
    gateOpen();
    await flush();
    Object.defineProperty(window, 'fetch', { value: undefined, configurable: true, writable: true });
    expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
    const [message, detail] = (Sentry.captureMessage as jest.Mock).mock.calls[0];
    expect(message).toBe('analytics gate failed closed');
    expect(detail).toEqual({ level: 'warning', tags: { analytics_fn: 'wireGuard', error_class: 'TypeError' } });
    expect(JSON.stringify([message, detail])).not.toMatch(/pat|localhost|email/);
  });

  it('[wire] an earlier warning of another kind does not hide a later one', async () => {
    setUp(true);
    const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new TypeError('storage broke');
    });
    expect(gateOpen()).toBe(false);
    getItem.mockRestore();
    await window.fetch(single(CLEAN_VIEW), { method: 'POST', body: new Blob(['en=page_view']) });
    await flush();
    const kinds = (Sentry.captureMessage as jest.Mock).mock.calls.map(([, detail]) => detail.tags.analytics_fn);
    expect(kinds).toEqual(['gateOpen', 'wire']);
  });

  it('[wire] a no that cannot be stored still stops what is waiting to be sent', async () => {
    setUp(true);
    // The save of the "no" fails part-way. Since spec E37 the failed save removes
    // the record, so the earlier "yes" is gone too (all or nothing).
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    expect(() => writeStoredConsent(window.localStorage, false)).toThrow();
    setItem.mockRestore();
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull();
    withdrawAnalytics(); // what the page does with a "no", stored or not

    await window.fetch(single(CLEAN_VIEW), { method: 'POST' });
    navigator.sendBeacon(single(CLEAN_VIEW), '');
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(beaconSpy).not.toHaveBeenCalled();
    expect(gateOpen()).toBe(false);

    // A later "yes" that is really stored opens it again.
    await new Promise((resolve) => setTimeout(resolve, 5));
    writeStoredConsent(window.localStorage, true);
    expect(gateOpen()).toBe(true);
    await window.fetch(single(CLEAN_VIEW), { method: 'POST' });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('[wire] counts what it stops, as a number on the page and nothing else', async () => {
    setUp(true);
    expect(stopped()).toBe(0);
    await window.fetch(single(CLEAN_VIEW), { method: 'POST' });
    expect(stopped()).toBe(0); // a clean event is not a stop
    await window.fetch(single({ en: 'scroll', dl: `${ORIGIN}/about`, 'epn.percent_scrolled': '90' }));
    expect(stopped()).toBe(1);
    const batch = `${COLLECT}?v=2&tid=${ID}&dl=${enc(`${ORIGIN}/about`)}`;
    navigator.sendBeacon(batch, 'en=page_view\r\nen=scroll&epn.percent_scrolled=90'); // trimmed
    expect(stopped()).toBe(2);
    writeStoredConsent(window.localStorage, false);
    await window.fetch(single(CLEAN_VIEW), { method: 'POST' }); // held event after a no
    expect(stopped()).toBe(3);
    expect(document.documentElement.getAttribute('data-nrpg-wire-dropped')).toMatch(/^\d+$/);
  });

  it.each([
    ['a body that is not text', () => window.fetch(single(CLEAN_VIEW), { method: 'POST', body: new Blob(['en=page_view']) })],
    ['a request object', () => window.fetch({ url: single(CLEAN_VIEW) } as unknown as Request)],
    ['a field given twice', () => window.fetch(`${single(CLEAN_VIEW)}&en=page_view`)],
    ['an unlisted field holding an address', () => window.fetch(`${single(CLEAN_VIEW)}&zz=${enc('https://example.org/x')}`)],
  ])('[wire] warns once when it stops a request it cannot read: %s', async (_name, sendIt) => {
    setUp(true);
    await sendIt();
    await sendIt();
    await flush();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(warnings()).toEqual([
      'analytics request not in a known form | {"level":"warning","tags":{"analytics_fn":"wire","error_class":"UnreadableRequest"}}',
    ]);
  });

  it('[wire] stays quiet about the stops it expects', async () => {
    setUp(true);
    // The library's own events, a closed page, and anything after a no.
    await window.fetch(single({ en: 'scroll', dl: `${ORIGIN}/about`, 'epn.percent_scrolled': '90' }));
    await window.fetch(single({ en: 'page_view', dl: `${ORIGIN}/login` }));
    writeStoredConsent(window.localStorage, false);
    await window.fetch(single(CLEAN_VIEW), { method: 'POST', body: new Blob(['en=page_view']) });
    await flush();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(warnings()).toEqual([]);
  });

  it('a browser with no Response refuses the request instead of answering it', async () => {
    setUp(true);
    const kept = (globalThis as Globals).Response;
    delete (globalThis as Globals).Response;
    try {
      await expect(window.fetch(single({ en: 'scroll', dl: `${ORIGIN}/about` }) + '&uid=1')).rejects.toThrow(TypeError);
    } finally {
      (globalThis as Globals).Response = kept;
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('the guard is removed again by the test reset', () => {
    setUp(true);
    expect(window.fetch).not.toBe(fetchSpy);
    __resetAnalyticsForTests();
    expect(window.fetch).toBe(fetchSpy);
    expect(navigator.sendBeacon).toBe(beaconSpy);
  });
});
