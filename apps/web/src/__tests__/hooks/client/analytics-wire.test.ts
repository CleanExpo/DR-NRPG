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
  COLLECT_FETCH_INIT,
  CONSENT_STORAGE_KEY,
  OWN_CLIENT_ID,
  OWN_STATE_KEY,
  isGoogleAddress,
  screenCollect,
  wireRoute,
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
const enc = encodeURIComponent;
/** The site's own hit fields a test hands the screen (spec E47). */
const OWN = { cid: '440459488.1794803162', sid: '1794803161', sct: '1', seg: '0' as const, _s: '1' };
const context = { origin: ORIGIN, measurementId: ID, own: () => OWN };
const OWN_TAIL = 'cid=440459488.1794803162&sid=1794803161&sct=1&seg=0&_s=1';
/** The start of every request the site sends: its constants, nothing else. */
const HEAD = `${COLLECT}?v=2&tid=${ID}&npa=1`;
/** One event as the site sends it: the event's fields, then the site's own. */
const line = (fields: string) => `${fields}&${OWN_TAIL}`;
const ABOUT = `dl=${enc(`${ORIGIN}/about`)}&dt=About`;

function single(fields: Record<string, string>): string {
  return `${COLLECT}?${new URLSearchParams({ v: '2', tid: ID, ...fields }).toString()}`;
}

const CLEAN_VIEW = { en: 'page_view', dl: `${ORIGIN}/about`, dt: 'About' };
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
/** How many requests to Google the guard has stopped or trimmed on this page load. */
const stopped = () => Number(document.documentElement.getAttribute('data-nrpg-wire-dropped') ?? '0');
const warnings = () =>
  (Sentry.captureMessage as jest.Mock).mock.calls.map(([message, detail]) => `${message} | ${JSON.stringify(detail)}`);

const WAYS = ['fetch', 'beacon', 'xhr', 'image', 'script'] as const;
const LIBRARY = `https://www.googletagmanager.com/gtag/js?id=${ID}`;

describe('wireRoute: which Google requests are screened or shut', () => {
  it.each([
    'https://www.google-analytics.com/g/collect?v=2',
    'https://region1.google-analytics.com/g/collect',
    'https://google-analytics.com/collect',
    'https://region1.analytics.google.com/g/collect',
    'https://stats.g.doubleclick.net/g/collect',
    'https://www.googletagmanager.com/g/collect?v=2',
    'https://www.google.com/ccm/collect?x=1',
  ])('a Google address: %s', (url) => {
    expect(isGoogleAddress(url)).toBe(true);
    expect(wireRoute('fetch', url)).toBe('screen');
  });

  it.each([
    'http://localhost/api/public/claims/submit',
    '/api/health',
    'https://google-analytics.com.example.org/g/collect',
    'https://example.org/?next=https://www.google-analytics.com/g/collect',
    'data:text/plain,google-analytics.com',
    '',
    null,
    undefined,
    42,
  ])('not a Google address: %s', (url) => {
    expect(isGoogleAddress(url)).toBe(false);
    for (const way of WAYS) expect(wireRoute(way, url)).toBe('pass');
  });
});

// Spec E40 and E42 (kind K1): the one exception is a script element loading
// the exact library file. It is listed as a way out and an address together.
describe('wireRoute lists the library load, not the collection (spec E40, E42)', () => {
  it('[AC-K1d] [AC-K1f] the exact library address is a library load only for a script element', () => {
    for (const url of [LIBRARY, 'https://www.googletagmanager.com/gtag/js?id=G-RK33F1ZD1H']) {
      expect(isGoogleAddress(url)).toBe(true);
      expect(wireRoute('script', url)).toBe('library');
      expect(wireRoute('fetch', url)).toBe('screen');
      expect(wireRoute('beacon', url)).toBe('screen');
      expect(wireRoute('xhr', url)).toBe('shut');
      expect(wireRoute('image', url)).toBe('shut');
    }
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
  ])('[AC-K1d] screened or shut on every way out: %s (%s)', (url) => {
    expect(isGoogleAddress(url)).toBe(true);
    expect(wireRoute('fetch', url)).toBe('screen');
    expect(wireRoute('beacon', url)).toBe('screen');
    expect(wireRoute('xhr', url)).toBe('shut');
    expect(wireRoute('image', url)).toBe('shut');
    expect(wireRoute('script', url)).toBe('shut');
  });

  it('[AC-K1d] addresses that are not Google stay out of the screen', () => {
    for (const url of [
      'https://google-analytics.com.example.org/g/collect',
      'https://example.org/gtag/destination?id=G-TEST000000',
      'https://notgoogle.com/collect',
      'http://localhost/api/health',
    ]) {
      expect(isGoogleAddress(url)).toBe(false);
      for (const way of WAYS) expect(wireRoute(way, url)).toBe('pass');
    }
  });
});

describe('screenCollect', () => {
  it('[AC-E47b] sends a clean single event as the site\'s own rebuilt request', () => {
    expect(screenCollect(single(CLEAN_VIEW), undefined, context)).toEqual({
      url: `${HEAD}&${line(`en=page_view&${ABOUT}`)}`,
      body: undefined,
    });
  });

  it('[AC-E47b] keeps listed campaign tags and a listed referrer', () => {
    const address = `${ORIGIN}/pricing?utm_source=newsletter&utm_medium=email`;
    const url = single({ ...CLEAN_VIEW, dl: address, dt: 'Pricing', dr: 'https://www.google.com' });
    expect(screenCollect(url, '', context)).toEqual({
      url: `${HEAD}&${line(`en=page_view&dl=${enc(address)}&dt=Pricing&dr=${enc('https://www.google.com')}`)}`,
      body: undefined,
    });
  });

  it('[AC-E47b] drops an event whose referrer names a site off the list', () => {
    expect(screenCollect(single({ ...CLEAN_VIEW, dr: 'https://example.org' }), undefined, context)).toBeNull();
  });

  it.each([
    ['an email', { 'ep.claim_type': 'a@b.co' }, 'ep.claim_type'],
    ['an address', { 'ep.cta_name': 'https://x.example/?t=1' }, 'ep.cta_name'],
    ['a token', { 'ep.cta_location': 'prooftoken7731abcdef' }, 'ep.cta_location'],
    ['an escaped email', { 'ep.claim_type': 'a%40b.co' }, 'ep.claim_type'],
    ['a twice-escaped email', { 'ep.claim_type': 'a%2540b.co' }, 'ep.claim_type'],
  ])('[AC-E47b] a listed parameter holding %s is sent as "other"', (_label, change, key) => {
    expect(screenCollect(single({ ...CLEAN_VIEW, ...change }), undefined, context)).toEqual({
      url: `${HEAD}&${line(`en=page_view&${ABOUT}&${key}=other`)}`,
      body: undefined,
    });
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
    ['a number out of its range', { 'epn.step_number': '123456789' }],
    ['an event name off the list', { en: 'prooftoken7731abcdef' }],
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

  // A field that is neither ruled nor the library's own stops its event,
  // whatever it holds. The case after this block is the clean twin.
  it.each([
    ['an escaped email in a field the library keeps for itself', { _x: 'a%40b.co' }],
    ['a twice-escaped email in a field the library keeps for itself', { _x: 'a%2540b.co' }],
    ['an escaped address in a field the library keeps for itself', { _x: 'https%3A%2F%2Fexample.org%2Fa' }],
    ['an escaped email beside a broken escape in a library field', { _x: 'a%40b.co%ZZ' }],
    ['a library field escaped more deeply than the screen will read', { _x: 'a%25252525252540b.co' }],
  ])('[AC-A4n] drops an event with %s', (_label, change) => {
    expect(screenCollect(single({ ...CLEAN_VIEW, ...change }), undefined, context)).toBeNull();
  });

  it('[AC-A4n] a library field is never sent, whatever it holds (spec E47)', () => {
    const browserList = 'Not(A%3ABrand;8.0.0.0|Google%20Chrome;131.0.0.0';
    expect(screenCollect(single({ ...CLEAN_VIEW, uafvl: browserList }), undefined, context)).toEqual({
      url: `${HEAD}&${line(`en=page_view&${ABOUT}`)}`,
      body: undefined,
    });
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
    expect(screenCollect(url, undefined, context)).toEqual({
      url: `${HEAD}&${line(`en=page_view&${ABOUT}&dp=${enc('/about')}&dr=${enc(`${ORIGIN}/pricing`)}&ep.page_path=${enc('/about')}`)}`,
      body: undefined,
    });
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
      url: HEAD,
      body: [
        line(`en=page_view&${ABOUT}`),
        line(`en=scroll_depth&${ABOUT}&epn.scroll_depth=50&ep.event_category=Engagement`),
      ].join('\n'),
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
    expect(screenCollect(`${COLLECT}?v=2&tid=${ID}`, clean, context)).toEqual({
      url: HEAD,
      body: line(`en=page_view&${ABOUT}`),
    });
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

  it('[AC-E47b] sends nothing without the site\'s own fields, or with own fields out of form', () => {
    expect(screenCollect(single(CLEAN_VIEW), undefined, { origin: ORIGIN, measurementId: ID })).toBeNull();
    expect(screenCollect(single(CLEAN_VIEW), undefined, { ...context, own: () => null })).toBeNull();
    for (const bad of [
      { ...OWN, cid: 'prooftoken7731abcdef' },
      { ...OWN, cid: '123456789' },
      { ...OWN, sid: 'Jane Smith' },
      { ...OWN, _s: '0' },
      { ...OWN, _et: '99999999' },
      { ...OWN, _fv: 'yes' },
    ]) {
      expect([bad, screenCollect(single(CLEAN_VIEW), undefined, { ...context, own: () => bad as typeof OWN })]).toEqual([bad, null]);
    }
  });

  it.each([
    ['another collection host', 'https://prooftoken7731abcdef.google-analytics.com/g/collect'],
    ['another path on the host', 'https://www.google-analytics.com/g/collect/prooftoken7731abcdef'],
    ['a port', 'https://www.google-analytics.com:8443/g/collect'],
    ['plain http', 'http://www.google-analytics.com/g/collect'],
  ])('[AC-E47b] sends nothing for a request to %s', (_label, address) => {
    expect(screenCollect(`${address}?${new URLSearchParams({ v: '2', tid: ID, ...CLEAN_VIEW })}`, undefined, context)).toBeNull();
  });

  it('the listed parameters used above are on the one list', () => {
    for (const name of ['claim_type', 'event_timeout', 'scroll_depth', 'event_category']) {
      expect(ALLOWED_EVENT_PARAMS.has(name)).toBe(true);
    }
  });
});

// Spec E46: the library's own fields are an allow-list of names, each with the
// one shape its value may take. The three requests below are the real Google
// library's, copied from this work's captures with only the property, the
// address and the title made clean; they are the controls that the list does
// not stop real traffic.
const REAL_LIBRARY_FIELDS = [
  'gtm=45je6bb1v9234167022za208zd9234167022xf1&_p=1794803160958&gcd=13l3l3l3l1l1&npa=0&dma=0&are=1&cid=440459488.1794803162&frm=0&ngs=1&pscdl=noapi&rcb=12&sr=1280x900&uaa=arm&uab=64&uafvl=HeadlessChrome%3B147.0.7727.15%7CNot.A%252FBrand%3B8.0.0.0%7CChromium%3B147.0.7727.15&uam=&uamb=0&uap=macOS&uapv=26.6.2&uaw=0&ul=en-us&_s=1&tag_exp=100940091~115616985~115938465~115938468~118897920~118897930~120213116~120385423~120412526~120420416~120469145~120469153~121246026~121246034&sid=1794803161&sct=1&seg=0&en=page_view&_fv=1&_nsi=1&_ss=1&_ee=1&tfd=816',
  'gtm=45je6bb1v9234167022za200zd9234167022xf1&_p=1794803160958&gcd=13l3l3l3l1l1&npa=0&dma=0&_eu=AAAAAAQ&are=1&cid=440459488.1794803162&frm=0&ngs=1&pscdl=noapi&rcb=12&sr=1280x900&uaa=arm&uab=64&uafvl=HeadlessChrome%3B147.0.7727.15%7CNot.A%252FBrand%3B8.0.0.0%7CChromium%3B147.0.7727.15&uam=&uamb=0&uap=macOS&uapv=26.6.2&uaw=0&ul=en-us&_s=2&tag_exp=100940091~115616985~115938465~115938468~118897920~118897930~120213116~120385423~120412526~120420416~120469145~120469153~121246026~121246034&sid=1794803161&sct=1&seg=0&en=user_engagement&_et=5894&tfd=6712',
  'gtm=45je6bb1v9234167022za200zd9234167022xf1&_p=1794728088507&gcs=G101&gcd=13p3t3p3p7l1&npa=1&dma_cps=-&dma=0&_eu=AEAAAAQ&ae=a&are=1&cid=456194592.1794728007&frm=0&ngs=1&pscdl=denied&rcb=18&sr=1280x900&uaa=arm&uab=64&uafvl=HeadlessChrome%3B147.0.7727.15%7CNot.A%252FBrand%3B8.0.0.0%7CChromium%3B147.0.7727.15&uam=&uamb=0&uap=macOS&uapv=26.6.2&uaw=0&ul=en-us&_s=1&tag_exp=115938465~115938469~118897920~118897930~120213116~120385422~120412528~120420416~120469145~120469153~121246026~121246034~123785233&dp=%2F&sid=1794728007&sct=1&seg=1&_tu=wAg&en=page_view&_et=1&tfd=5621',
];
const realRequest = (fields: string) => `${COLLECT}?v=2&tid=${ID}&${fields}&dl=${enc(`${ORIGIN}/`)}&dt=Home`;

/** What the site sends for each real request above: none of the library's fields. */
const HOME = `dl=${enc(`${ORIGIN}/`)}&dt=Home`;
const REBUILT_REAL = [
  `${HEAD}&${line(`en=page_view&${HOME}`)}`,
  `${HEAD}&${line(`en=user_engagement&${HOME}`)}`,
  `${HEAD}&${line(`en=page_view&${HOME}&dp=${enc('/')}`)}`,
];
/** Every field name the site's own request may carry (spec E47). */
const SENT_NAMES = new Set(['v', 'tid', 'npa', 'en', 'dl', 'dt', 'dp', 'dr', 'cid', 'sid', 'sct', 'seg', '_s', '_et', '_fv', '_ss', '_nsi']);

describe('screenCollect: the library fields are read for nothing (spec E46, E47)', () => {
  it.each(REAL_LIBRARY_FIELDS.map((fields, index) => [index + 1, fields]))(
    '[AC-K1i] the real library request %s is sent as the site\'s own request, with none of its fields',
    (index, fields) => {
      const url = realRequest(fields as string);
      const notes = { unreadable: false, trimmed: 0 };
      const sent = screenCollect(url, undefined, context, notes);
      expect(sent).toEqual({ url: REBUILT_REAL[(index as number) - 1], body: undefined });
      expect(notes.unreadable).toBe(false);
      for (const key of new URL((sent as { url: string }).url).searchParams.keys()) {
        expect([key, SENT_NAMES.has(key) || /^epn?\./.test(key)]).toEqual([key, true]);
      }
    },
  );

  it.each([
    ['a token', { token: 'prooftoken7731abcdef' }],
    ['a claim number', { claim_id: '123456789' }],
    ['a name', { contractor_name: 'Jane Smith' }],
    ['a search term', { utm_term: 'private-search' }],
    ['typed search text', { q: 'water damage at 12 Smith St' }],
    ['a record id', { record: 'proofrecord7731' }],
    ['a field in another case', { CID: '440459488.1794803162' }],
  ])('[AC-K1i] a field the library never sends is not sent: %s', (_label, change) => {
    const notes = { unreadable: false, trimmed: 0 };
    expect(screenCollect(`${realRequest(REAL_LIBRARY_FIELDS[0])}&${new URLSearchParams(change)}`, undefined, context, notes)).toBeNull();
    // Counted as unreadable, so the page's one warning reports it (spec E24).
    expect(notes.unreadable).toBe(true);
  });

  it.each([
    ['a token as the client id', { cid: 'prooftoken7731abcdef' }],
    ['a claim number as the client id', { cid: '123456789' }],
    ['an address as the language', { ul: 'https://example.org/a' }],
    ['an email as the screen size', { sr: 'a@b.co' }],
    ['a token in the experiment list', { tag_exp: '115938465~prooftoken7731abcdef' }],
    ['a name as the session id', { sid: 'Jane Smith' }],
    ['a token in the tag version', { gtm: 'prooftoken7731abcdef@x' }],
    ['a token as a browser brand version', { uafvl: 'Chromium;prooftoken7731abcdef' }],
    ['an escaped email as a browser brand', { uafvl: 'a%40b.co;1.0' }],
    ['an escaped address as a browser brand', { uafvl: 'https%3A%2F%2Fexample.org%2Fa;1' }],
    ['a browser brand escaped more deeply than the screen will read', { uafvl: 'a%25252525252540b.co;1' }],
    ['a browser list with no versions', { uafvl: 'prooftoken7731abcdef' }],
    ['the token from the Codex review in the tag version', { gtm: '12zz9secret4417qq' }],
    ['a token in the page load id', { _p: '123456789' }],
    ['a token in the engagement time', { _et: '123456789' }],
  ])('[AC-K1i] [AC-E47b] a library field never leaves, whatever it holds: %s', (_label, change) => {
    const base = new URLSearchParams(REAL_LIBRARY_FIELDS[0]);
    for (const [key, value] of Object.entries(change)) base.set(key, value);
    // Exactly what the clean request is sent as: the planted value is not in it.
    expect(screenCollect(realRequest(base.toString()), undefined, context)).toEqual({ url: REBUILT_REAL[0], body: undefined });
  });

  it('[AC-K1i] a request naming a field twice is not sent (here the protocol version)', () => {
    expect(screenCollect(`${realRequest(REAL_LIBRARY_FIELDS[0])}&v=3`, undefined, context)).toBeNull();
  });

  it('[AC-K1i] a batched event carrying an unlisted field is taken out; the clean event is sent', () => {
    const url = `${COLLECT}?v=2&tid=${ID}&cid=440459488.1794803162&sid=1794803161&dl=${enc(`${ORIGIN}/about`)}`;
    const clean = 'en=page_view&dt=About&_et=12';
    const body = [clean, 'en=page_view&dt=About&claim_id=123456789', 'en=user_engagement&token=prooftoken7731abcdef'].join('\r\n');
    const notes = { unreadable: false, trimmed: 0 };
    expect(screenCollect(url, body, context, notes)).toEqual({ url: HEAD, body: line(`en=page_view&${ABOUT}`) });
    expect(notes.trimmed).toBe(2);
    expect(notes.unreadable).toBe(true);
  });

  it('[AC-K1i] a shared part carrying an unlisted field stops the whole batch', () => {
    const url = `${COLLECT}?v=2&tid=${ID}&contractor_name=Jane%20Smith&dl=${enc(`${ORIGIN}/about`)}`;
    expect(screenCollect(url, 'en=page_view&dt=About', context)).toBeNull();
  });

  it('[AC-E47b] the site\'s own fields are asked for once per event that will be sent, in order', () => {
    const asked: boolean[] = [];
    const own = (isPageView: boolean) => {
      asked.push(isPageView);
      return OWN;
    };
    const url = `${COLLECT}?v=2&tid=${ID}&dl=${enc(`${ORIGIN}/about`)}`;
    const body = ['en=page_view', 'en=prooftoken7731abcdef', 'en=user_engagement'].join('\n');
    expect(screenCollect(url, body, { ...context, own })).not.toBeNull();
    expect(asked).toEqual([true, false]);
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

  it('[AC-E47c] sends the site\'s own rebuilt request while the yes stands, with its own visitor id', async () => {
    setUp(true);
    await window.fetch(`${single(CLEAN_VIEW)}&gtm=12zz9secret4417qq&cid=123456789.1794803162`, { method: 'POST', keepalive: true });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const sent = new URL(fetchSpy.mock.calls[0][0]);
    expect(`${sent.origin}${sent.pathname}`).toBe(COLLECT);
    expect(sent.searchParams.get('gtm')).toBeNull();
    expect(sent.searchParams.get('en')).toBe('page_view');
    const cid = sent.searchParams.get('cid') as string;
    expect(cid).toMatch(OWN_CLIENT_ID);
    expect(cid).not.toBe('123456789.1794803162');
    expect(JSON.parse(window.localStorage.getItem(OWN_STATE_KEY) as string).cid).toBe(cid);
    expect(fetchSpy.mock.calls[0][1]).toMatchObject({ method: 'POST', keepalive: true });
    // The second hit carries the same visitor id and the next hit number.
    await window.fetch(single({ ...CLEAN_VIEW, en: 'user_engagement' }), { method: 'POST' });
    const second = new URL(fetchSpy.mock.calls[1][0]);
    expect(second.searchParams.get('cid')).toBe(cid);
    expect(second.searchParams.get('_s')).toBe('2');
  });

  it('[AC-E47c] the site\'s own visitor record goes when the visitor says no', async () => {
    setUp(true);
    await window.fetch(single(CLEAN_VIEW), { method: 'POST' });
    expect(window.localStorage.getItem(OWN_STATE_KEY)).not.toBeNull();
    writeStoredConsent(window.localStorage, false);
    withdrawAnalytics();
    expect(window.localStorage.getItem(OWN_STATE_KEY)).toBeNull();
  });

  it('[AC-E48] start-up removes a visitor record that has reached its lifetime, even when nothing is sent', () => {
    setUp(true);
    const old = { cid: '325000000.1600000000', sct: 1, sid: 1600000000, startAt: 1600000000000, lastAt: 1600000000000, hits: 1, views: 1 };
    window.localStorage.setItem(OWN_STATE_KEY, JSON.stringify(old));
    initializeGA4({ measurementId: ID });
    expect(window.localStorage.getItem(OWN_STATE_KEY)).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('[AC-E48] start-up removes the visitor record when there is no stored yes', () => {
    setUp(true);
    const now = Date.now();
    const seconds = Math.floor(now / 1000);
    const current = { cid: `325000000.${seconds}`, sct: 1, sid: seconds, startAt: seconds * 1000, lastAt: now, hits: 1, views: 1 };
    window.localStorage.setItem(OWN_STATE_KEY, JSON.stringify(current));
    initializeGA4({ measurementId: ID });
    // The control: a current record under a yes is kept.
    expect(window.localStorage.getItem(OWN_STATE_KEY)).toBe(JSON.stringify(current));
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    initializeGA4({ measurementId: ID });
    expect(window.localStorage.getItem(OWN_STATE_KEY)).toBeNull();
  });

  it('[AC-E49] the site\'s own request options send no referrer, no cookies and no headers', () => {
    expect(COLLECT_FETCH_INIT).toEqual({
      method: 'POST',
      keepalive: true,
      mode: 'no-cors',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      cache: 'no-store',
    });
    expect(Object.isFrozen(COLLECT_FETCH_INIT)).toBe(true);
  });

  it('[AC-E49] a rebuilt hit carries the site\'s own request options, never the caller\'s', async () => {
    setUp(true);
    const controller = new AbortController();
    const planted = {
      method: 'GET',
      headers: { Accept: 'proof-visitor-7731@example.invalid', 'X-Claim': 'CLM-9' },
      referrer: '/about?token=prooftoken7731abcdef',
      referrerPolicy: 'unsafe-url',
      credentials: 'include',
      mode: 'cors',
      integrity: 'sha256-proof7731',
      signal: controller.signal,
      cache: 'reload',
      redirect: 'follow',
    } as RequestInit;
    await window.fetch(single(CLEAN_VIEW), planted);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][1]).toEqual({ ...COLLECT_FETCH_INIT });
    expect(fetchSpy.mock.calls[0][1]).not.toBe(COLLECT_FETCH_INIT);
  });

  it('[AC-E49] a rebuilt batch carries the site\'s own options and its own body only', async () => {
    setUp(true);
    const url = `${COLLECT}?v=2&tid=${ID}&dl=${enc(`${ORIGIN}/about`)}`;
    await window.fetch(url, {
      method: 'POST',
      body: 'en=page_view\r\nen=user_engagement',
      headers: { 'Content-Type': 'text/claim-7731', 'X-Claim': 'CLM-9' },
      referrer: '/about?token=prooftoken7731abcdef',
      credentials: 'include',
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe(HEAD);
    const sent = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(Object.keys(sent).sort()).toEqual([...Object.keys(COLLECT_FETCH_INIT), 'body'].sort());
    expect({ ...sent, body: undefined }).toEqual({ ...COLLECT_FETCH_INIT, body: undefined });
    expect(typeof sent.body).toBe('string');
  });

  it('sends only the clean part of a batch', async () => {
    setUp(true);
    const url = `${COLLECT}?v=2&tid=${ID}&dl=${enc(`${ORIGIN}/about`)}`;
    await window.fetch(url, { method: 'POST', body: 'en=page_view\r\nen=scroll&epn.percent_scrolled=90' });
    expect(fetchSpy.mock.calls[0][0]).toBe(HEAD);
    const kept = (fetchSpy.mock.calls[0][1].body as string).split('\n');
    expect(kept).toHaveLength(1);
    expect(kept[0].startsWith(`en=page_view&${ABOUT}&cid=`)).toBe(true);
    navigator.sendBeacon(url, 'en=scroll&epn.percent_scrolled=90\r\nen=user_engagement');
    const [target, beaconBody] = beaconSpy.mock.calls[0];
    expect(target).toBe(HEAD);
    expect((beaconBody as string).split('\n')).toHaveLength(1);
    expect((beaconBody as string).startsWith(`en=user_engagement&${ABOUT}&cid=`)).toBe(true);
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

  // Spec E42: every way out asks one owner, with the way and the address together.
  it('[AC-K1f] after a no, nothing reaches the library address or a collection address by any way out', async () => {
    // The spy goes under the guard, so a send the guard lets through reaches it.
    const send = jest.spyOn(XMLHttpRequest.prototype, 'send').mockImplementation(() => undefined);
    setUp(true);
    writeStoredConsent(window.localStorage, false);
    const body = 'email=pat@example.com&claim=CLM-1';
    for (const url of [LIBRARY, single(CLEAN_VIEW)]) {
      const answer = await window.fetch(url, { method: 'POST', body });
      expect(answer.status).toBe(204);
      expect(navigator.sendBeacon(url, body)).toBe(true);
      const request = new XMLHttpRequest();
      request.open('POST', url);
      request.send(body);
      const image = new Image();
      image.src = url;
      image.setAttribute('src', url);
      expect(image.getAttribute('src')).toBeNull();
      const script = document.createElement('script');
      script.src = url;
      script.setAttribute('src', url);
      expect(script.getAttribute('src')).toBeNull();
    }
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(beaconSpy).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    send.mockRestore();
  });

  it('[AC-K1f] while the yes stands, only a script element loads the library; a fetch or beacon to it is dropped', async () => {
    const send = jest.spyOn(XMLHttpRequest.prototype, 'send').mockImplementation(() => undefined);
    setUp(true);
    const script = document.createElement('script');
    script.src = LIBRARY;
    expect(script.getAttribute('src')).toBe(LIBRARY);
    const byAttribute = document.createElement('script');
    byAttribute.setAttribute('src', LIBRARY);
    expect(byAttribute.getAttribute('src')).toBe(LIBRARY);
    const body = 'email=pat@example.com&claim=CLM-1';
    const answer = await window.fetch(LIBRARY, { method: 'POST', body });
    expect(answer.status).toBe(204);
    expect(navigator.sendBeacon(LIBRARY, body)).toBe(true);
    const request = new XMLHttpRequest();
    request.open('GET', LIBRARY);
    request.send();
    const image = new Image();
    image.src = LIBRARY;
    expect(image.getAttribute('src')).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(beaconSpy).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    send.mockRestore();
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
