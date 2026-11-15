/**
 * The sending module (src/lib/analytics.ts): nothing reaches the data layer
 * unless the visitor said yes, the address may be counted, and the value is
 * on the allow-list. Asserted on window.dataLayer, which is what the Google
 * library reads, never on a mock of our own function.
 */
import * as Sentry from '@sentry/nextjs';
import {
  __resetAnalyticsForTests,
  clearUserId,
  gateOpen,
  initializeGA4,
  installAnalyticsGuards,
  setUserId,
  setUserProperties,
  syncGate,
  trackClaimStepCompleted,
  trackClaimSubmitted,
  trackContentDownload,
  trackContractorInquiry,
  trackEvent,
  trackEventAndWait,
  trackEventOnce,
  trackGeographicData,
  trackOutboundLink,
  trackPageView,
  trackSearch,
  withdrawAnalytics,
} from '@/lib/analytics';
import {
  CONSENT_CHANGED_EVENT,
  CONSENT_NOTICE_VERSION,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION_KEY,
  writeStoredConsent,
} from '@/lib/analytics-gate';

// Jest cannot resolve the real package here (other suites mock it the same way).
jest.mock('@sentry/nextjs', () => ({ captureMessage: jest.fn() }), { virtual: true });

/** The report is sent on a later tick, so the gate never waits on it. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const ID = 'G-TEST000000';
const FLAG = `ga-disable-${ID}`;
const w = window as unknown as Record<string, any>;

function layer(): unknown[][] {
  const raw = w.dataLayer;
  if (!Array.isArray(raw)) return [];
  return raw.map((entry: ArrayLike<unknown>) => Array.from(entry));
}

function events(name?: string) {
  return layer().filter((e) => e[0] === 'event' && (name === undefined || e[1] === name));
}

function commands(kind: string) {
  return layer().filter((e) => e[0] === kind);
}

function go(url: string) {
  window.history.replaceState({}, '', url);
}

function clearCookies() {
  for (const pair of document.cookie.split(';')) {
    const name = pair.split('=')[0].trim();
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

function start(url = '/', consent: boolean | null = true) {
  go(url);
  if (consent !== null) writeStoredConsent(window.localStorage, consent);
  initializeGA4({ measurementId: ID });
}

beforeEach(() => {
  __resetAnalyticsForTests();
  window.localStorage.clear();
  window.sessionStorage.clear();
  delete w.dataLayer;
  delete w.gtag;
  delete w[FLAG];
  clearCookies();
  go('/');
});

afterEach(() => {
  jest.useRealTimers();
});

describe('the gate', () => {
  it('is closed and sends nothing before the visitor chooses', () => {
    start('/', null);
    trackEvent('cta_clicked', { cta_name: 'hero' });
    trackPageView();
    expect(gateOpen()).toBe(false);
    expect(w[FLAG]).toBe(true);
    expect(layer()).toEqual([]);
  });

  it('is closed and sends nothing after the visitor says no', () => {
    start('/', false);
    trackEvent('cta_clicked', { cta_name: 'hero' });
    expect(w[FLAG]).toBe(true);
    expect(layer()).toEqual([]);
  });

  it('opens on a listed page once the visitor says yes', () => {
    start('/about', true);
    expect(gateOpen()).toBe(true);
    expect(w[FLAG]).toBe(false);
  });

  it('is computed live: the same call closes when the address changes', () => {
    start('/about', true);
    expect(gateOpen()).toBe(true);
    go('/dashboard');
    expect(gateOpen()).toBe(false);
    go('/about?email=pat%40example.com');
    expect(gateOpen()).toBe(false);
    go('/about');
    expect(gateOpen()).toBe(true);
  });

  it('[AC-A4a] consent stored under an old notice version keeps the gate closed', () => {
    go('/');
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ necessary: true, analytics: true }));
    initializeGA4({ measurementId: ID });
    trackEvent('cta_clicked', { cta_name: 'hero' });
    expect(gateOpen()).toBe(false);
    expect(w[FLAG]).toBe(true);
    expect(layer()).toEqual([]);

    window.localStorage.setItem(CONSENT_VERSION_KEY, '2020-01-01');
    trackEvent('cta_clicked', { cta_name: 'hero' });
    expect(layer()).toEqual([]);

    // Same fixture, driven open: the current version is what opens it.
    window.localStorage.setItem(CONSENT_VERSION_KEY, CONSENT_NOTICE_VERSION);
    trackEvent('cta_clicked', { cta_name: 'hero' });
    expect(events('cta_clicked')).toHaveLength(1);
  });

  it('[AC-A4b] consent stored as a string keeps the gate closed', () => {
    go('/');
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ necessary: true, analytics: 'true' }));
    window.localStorage.setItem(CONSENT_VERSION_KEY, CONSENT_NOTICE_VERSION);
    initializeGA4({ measurementId: ID });
    trackEvent('cta_clicked', { cta_name: 'hero' });
    expect(gateOpen()).toBe(false);
    expect(layer()).toEqual([]);
  });

  it('stays closed with no measurement id, or one in the wrong shape', () => {
    go('/');
    writeStoredConsent(window.localStorage, true);
    initializeGA4({ measurementId: '' });
    expect(gateOpen()).toBe(false);
    initializeGA4({ measurementId: 'G-1"><script>' });
    expect(gateOpen()).toBe(false);
    trackEvent('cta_clicked', { cta_name: 'hero' });
    expect(layer()).toEqual([]);
  });
});

describe('set-up', () => {
  it('queues consent, then the clock, then the configuration, in that order', () => {
    start('/about?utm_source=news', true);
    const all = layer();
    expect(all.map((e) => e[0])).toEqual(['consent', 'js', 'config']);
    expect(all[0]).toEqual([
      'consent',
      'default',
      { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' },
    ]);
    expect(all[2][1]).toBe(ID);
    expect(all[2][2]).toMatchObject({
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: 'http://localhost/about?utm_source=news',
      page_title: 'About',
    });
  });

  it('pushes the arguments object the Google library expects, not an array', () => {
    start('/', true);
    expect(Array.isArray(w.dataLayer[0])).toBe(false);
    expect(Object.prototype.toString.call(w.dataLayer[0])).toBe('[object Arguments]');
  });

  it('configures once however many times it is called', () => {
    start('/', true);
    initializeGA4({ measurementId: ID });
    initializeGA4({ measurementId: ID });
    expect(commands('config')).toHaveLength(1);
  });

  it('waits to configure until the first open address', () => {
    start('/dashboard', true);
    expect(layer()).toEqual([]);
    go('/about');
    trackEvent('cta_clicked', { cta_name: 'hero' });
    expect(layer().map((e) => e[0])).toEqual(['consent', 'js', 'config', 'event']);
    expect(commands('config')[0][2]).toMatchObject({ page_location: 'http://localhost/about' });
  });
});

describe('a stray caller', () => {
  it('replaces a tag function defined before ours', () => {
    const earlier = jest.fn();
    w.gtag = earlier;
    start('/', true);
    expect(w.gtag).not.toBe(earlier);
    w.gtag('event', 'cta_clicked', { cta_name: 'hero', claim_id: 'CLM-1' });
    expect(earlier).not.toHaveBeenCalled();
    expect(events('cta_clicked')[0][2]).toEqual({ cta_name: 'hero' });
  });

  it('is dropped on a page that may not be counted', () => {
    start('/', true);
    const before = layer().length;
    go('/claim/success?claimId=CLM-1');
    w.gtag('event', 'page_view', { page_location: window.location.href });
    w.gtag('event', 'cta_clicked', { cta_name: 'hero' });
    expect(layer()).toHaveLength(before);
    expect(w[FLAG]).toBe(true);
  });

  it('cannot configure, set a user, or set its own address', () => {
    start('/', true);
    const before = layer().length;
    w.gtag('config', 'G-OTHER00000', { page_location: 'http://localhost/dashboard?token=abc' });
    w.gtag('config', ID, { send_page_view: true });
    w.gtag('set', { user_id: 'u_1' });
    w.gtag('set', 'user_properties', { user_city: 'Brisbane' });
    w.gtag('set', { page_location: 'http://localhost/dashboard?token=abc' });
    w.gtag('get', ID, 'client_id', () => undefined);
    w.gtag('event', 'pat@example.com', {});
    w.gtag('event');
    w.gtag();
    expect(layer()).toHaveLength(before);
  });
});

describe('page views', () => {
  it('sends the clean address and the fixed title, whatever the caller passes', () => {
    document.title = 'Claim for Pat Example';
    start('/claim/step-1?utm_medium=email', true);
    trackPageView({
      page_location: 'http://localhost/dashboard?email=pat%40example.com',
      page_title: 'Claim for Pat Example',
      page_path: '/dashboard',
    });
    const view = events('page_view');
    expect(view).toHaveLength(1);
    expect(view[0][2]).toEqual({
      page_location: 'http://localhost/claim/step-1?utm_medium=email',
      page_title: 'Claim step 1',
      page_path: '/claim/step-1',
      page_referrer: '',
    });
    expect(JSON.stringify(layer())).not.toMatch(/Pat Example|pat%40|dashboard/);
  });

  it('sets the clean address for later events on the page', () => {
    start('/pricing', true);
    trackPageView();
    expect(commands('set').pop()).toEqual([
      'set',
      { page_location: 'http://localhost/pricing', page_title: 'Pricing', page_referrer: '' },
    ]);
  });

  it('uses the previous counted page as the referrer', () => {
    start('/', true);
    trackPageView();
    go('/pricing');
    trackPageView();
    expect(events('page_view')[1][2]).toMatchObject({
      page_location: 'http://localhost/pricing',
      page_referrer: 'http://localhost/',
    });
  });

  it('does not count the same page twice in a row, but counts a return visit', () => {
    start('/', true);
    trackPageView();
    trackPageView();
    expect(events('page_view')).toHaveLength(1);
    go('/dashboard');
    trackPageView();
    go('/');
    trackPageView();
    expect(events('page_view')).toHaveLength(2);
  });

  it('sends nothing for an address that carries a person or a record', () => {
    start('/', true);
    const before = layer().length;
    go('/launch/thank-you?email=pat%40example.com');
    trackPageView();
    go('/claim/success?claimId=CLM-1');
    trackPageView();
    go('/?email=pat%40example.com');
    trackPageView();
    expect(layer()).toHaveLength(before);
  });
});

describe('event parameters', () => {
  it('strips record ids, names and amounts from the claim and contractor helpers', () => {
    start('/claim/step-3', true);
    trackClaimStepCompleted({ claim_id: 'CLM-1', step_name: 'details', step_number: 3 });
    trackClaimSubmitted({ claim_id: 'CLM-1', claim_type: 'water', claim_value: 12500 });
    trackContractorInquiry({ contractor_id: 'c_1', contractor_name: 'Pat Example', service_type: 'water', location: 'Brisbane' });
    const sent = JSON.stringify(events());
    expect(sent).not.toMatch(/CLM-1|c_1|Pat Example|12500|Brisbane/);
    expect(events('claim_step_completed')[0][2]).toEqual({ step_name: 'details', step_number: 3, event_category: 'Claim' });
    expect(events('claim_submitted')[0][2]).toEqual({ claim_type: 'water', event_category: 'Claim' });
  });

  it('never sends the search words', () => {
    start('/find-a-contractor', true);
    trackSearch('pat example flood brisbane', 4);
    expect(events('search')[0][2]).toEqual({ results_count: 4, event_category: 'Search' });
  });

  it('sends only the host of an outbound link, and only for web links', () => {
    start('/', true);
    trackOutboundLink('https://www.example.org/path?token=abc', 'Pat Example');
    trackOutboundLink('mailto:pat@example.com');
    trackOutboundLink('javascript:alert(1)');
    trackOutboundLink('not a url');
    expect(events('click')).toHaveLength(1);
    expect(events('click')[0][2]).toEqual({ link_domain: 'www.example.org', outbound: true, event_category: 'Outbound Link' });
  });

  it('never sends a download name or address', () => {
    start('/', true);
    trackContentDownload({ content_id: 'r_1', content_name: 'https://x.test/a.pdf?token=abc', content_type: 'file', file_type: 'com/a?token=abc' });
    trackContentDownload({ content_name: 'guide', content_type: 'file', file_type: 'pdf' });
    expect(events('content_download')[0][2]).toEqual({ content_type: 'file', event_category: 'Content' });
    expect(events('content_download')[1][2]).toEqual({ content_type: 'file', file_type: 'pdf', event_category: 'Content' });
  });

  it('sends nothing about who the visitor is', () => {
    start('/', true);
    const before = layer().length;
    setUserId('u_1');
    clearUserId();
    setUserProperties({ user_city: 'Brisbane' });
    trackGeographicData({ city: 'Brisbane', state: 'QLD', postcode: '4000' });
    expect(layer()).toHaveLength(before);
  });
});

describe('once-only events', () => {
  it('sends once per key', () => {
    start('/', true);
    trackEventOnce('cta_clicked', 'k1', { cta_name: 'hero' });
    trackEventOnce('cta_clicked', 'k1', { cta_name: 'hero' });
    trackEventOnce('cta_clicked', 'k2', { cta_name: 'hero' });
    expect(events('cta_clicked')).toHaveLength(2);
  });

  it('does not use up the key while the gate is closed', () => {
    start('/dashboard', true);
    trackEventOnce('callout_paid', 'cs_1', { value: 1, currency: 'AUD' });
    expect(events()).toHaveLength(0);
    go('/');
    trackEventOnce('callout_paid', 'cs_1', { value: 1, currency: 'AUD' });
    expect(events('callout_paid')).toHaveLength(1);
  });
});

describe('waiting for an event before leaving the page', () => {
  it('resolves at once when the gate is closed', async () => {
    start('/claim/step-3', false);
    await expect(trackEventAndWait('claim_submitted', { claim_type: 'water' })).resolves.toBe('closed');
    expect(layer()).toEqual([]);
  });

  it('resolves when Google confirms the event', async () => {
    start('/claim/step-3', true);
    const waiting = trackEventAndWait('claim_submitted', { claim_type: 'water', claim_id: 'CLM-1' });
    const params = events('claim_submitted')[0][2] as Record<string, any>;
    expect(params.claim_id).toBeUndefined();
    expect(params.event_timeout).toBe(1000);
    params.event_callback();
    await expect(waiting).resolves.toBe('callback');
  });

  it('[AC-A4h] navigation still happens at the timeout when Google never answers', async () => {
    jest.useFakeTimers();
    start('/claim/step-3', true);
    let settled: string | undefined;
    const waiting = trackEventAndWait('claim_submitted', { claim_type: 'water' }).then((r) => {
      settled = r;
    });
    jest.advanceTimersByTime(999);
    await Promise.resolve();
    expect(settled).toBeUndefined();
    jest.advanceTimersByTime(1);
    await waiting;
    expect(settled).toBe('timeout');
  });

  it('leaves the way the wait ended where a browser check can read it', async () => {
    const mark = () => document.documentElement.getAttribute('data-nrpg-analytics-wait');
    document.documentElement.removeAttribute('data-nrpg-analytics-wait');

    start('/claim/step-3', false);
    await trackEventAndWait('claim_submitted', { claim_type: 'water' });
    expect(mark()).toBe('closed');

    start('/claim/step-3', true);
    const waiting = trackEventAndWait('claim_submitted', { claim_type: 'water' });
    (events('claim_submitted')[0][2] as Record<string, any>).event_callback();
    await waiting;
    expect(mark()).toBe('callback');
  });

  it('[AC-A4c] trackEventAndWait never rejects', async () => {
    start('/claim/step-3', true);
    w.dataLayer = {
      push() {
        throw new Error('data layer broke');
      },
    };
    await expect(trackEventAndWait('claim_submitted', { claim_type: 'water' })).resolves.toBe('error');

    const hostile: Record<string, unknown> = {};
    Object.defineProperty(hostile, 'claim_type', {
      enumerable: true,
      get() {
        throw new Error('boom');
      },
    });
    __resetAnalyticsForTests();
    delete w.dataLayer;
    start('/claim/step-3', true);
    const waiting = trackEventAndWait('claim_submitted', hostile as never, 5);
    await expect(waiting).resolves.toMatch(/^(callback|timeout)$/);

    await expect(trackEventAndWait(undefined as never, undefined as never)).resolves.toMatch(/^(closed|error)$/);
  });

  it('[AC-A4i] a throwing window.gtag or data layer does not escape', () => {
    w.gtag = () => {
      throw new Error('someone else\'s tag broke');
    };
    start('/', true);
    expect(() => trackEvent('cta_clicked', { cta_name: 'hero' })).not.toThrow();
    w.dataLayer = {
      push() {
        throw new Error('data layer broke');
      },
    };
    expect(() => trackEvent('cta_clicked', { cta_name: 'hero' })).not.toThrow();
    expect(() => trackPageView()).not.toThrow();
    expect(() => w.gtag('event', 'cta_clicked', {})).not.toThrow();
    expect(() => withdrawAnalytics()).not.toThrow();
  });
});

describe('keeping the flag right while the page lives', () => {
  it('[AC-A4d] the history wrapper sets the flag from the destination, before the move', () => {
    const seen: Array<[string, unknown]> = [];
    const native = window.history.pushState;
    window.history.pushState = function spy(this: History, ...args: Parameters<History['pushState']>) {
      seen.push([window.location.pathname, w[FLAG]]);
      return native.apply(this, args);
    } as History['pushState'];
    try {
      start('/about', true);
      expect(w[FLAG]).toBe(false);

      window.history.pushState({}, '', '/dashboard/claims/42');
      // The underlying move ran while the address was still /about, and the flag was already closed.
      expect(seen[0]).toEqual(['/about', true]);
      expect(w[FLAG]).toBe(true);

      window.history.pushState({}, '', '/pricing');
      expect(seen[1]).toEqual(['/dashboard/claims/42', false]);

      window.history.replaceState({}, '', '/pricing?email=pat%40example.com');
      expect(w[FLAG]).toBe(true);

      window.history.pushState({ scroll: 1 }, '');
      expect(w[FLAG]).toBe(true);
    } finally {
      __resetAnalyticsForTests();
      window.history.pushState = native;
    }
  });

  it('installs the history wrapper once', () => {
    start('/', true);
    const wrapped = window.history.pushState;
    installAnalyticsGuards();
    initializeGA4({ measurementId: ID });
    expect(window.history.pushState).toBe(wrapped);
  });

  it('[AC-A4g] pageshow resyncs the gate', () => {
    start('/about', true);
    expect(w[FLAG]).toBe(false);
    // The choice changes without this tab being told (a restore from the back-forward cache).
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    expect(w[FLAG]).toBe(false);
    window.dispatchEvent(new Event('pageshow'));
    expect(w[FLAG]).toBe(true);
  });

  it('[AC-A4e] withdrawal in another tab closes this tab', () => {
    start('/about', true);
    document.cookie = '_ga=GA1.1.111.222; path=/';
    const heard = jest.fn();
    window.addEventListener(CONSENT_CHANGED_EVENT, heard);
    try {
      writeStoredConsent(window.localStorage, false);
      window.dispatchEvent(new StorageEvent('storage', { key: CONSENT_STORAGE_KEY }));
      expect(w[FLAG]).toBe(true);
      expect(commands('consent').pop()).toEqual(['consent', 'update', { analytics_storage: 'denied' }]);
      expect(document.cookie).not.toMatch(/_ga/);
      expect(heard).toHaveBeenCalledTimes(1);

      const before = layer().length;
      trackEvent('cta_clicked', { cta_name: 'hero' });
      expect(layer()).toHaveLength(before);

      window.dispatchEvent(new StorageEvent('storage', { key: 'something_else' }));
      expect(heard).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener(CONSENT_CHANGED_EVENT, heard);
    }
  });
});

describe('saying no', () => {
  it('tells Google, closes the flag and removes the analytics cookies only', () => {
    start('/', true);
    document.cookie = '_ga=GA1.1.111.222; path=/';
    document.cookie = '_ga_TEST000000=GS1.1.1; path=/';
    document.cookie = 'nrpg_ga=GA1.1.333.444; path=/';
    document.cookie = 'nrpg_ga_TEST000000=GS1.1.2; path=/';
    document.cookie = 'session=keep; path=/';
    writeStoredConsent(window.localStorage, false);
    withdrawAnalytics();
    expect(commands('consent').pop()).toEqual(['consent', 'update', { analytics_storage: 'denied' }]);
    expect(w[FLAG]).toBe(true);
    expect(document.cookie).toBe('session=keep');
  });

  it('tells Google when the visitor says yes again', () => {
    start('/', true);
    writeStoredConsent(window.localStorage, false);
    withdrawAnalytics();
    writeStoredConsent(window.localStorage, true);
    syncGate();
    trackEvent('cta_clicked', { cta_name: 'hero' });
    const consent = commands('consent');
    expect(consent[consent.length - 1]).toEqual(['consent', 'update', { analytics_storage: 'granted' }]);
    expect(commands('config')).toHaveLength(1);
    expect(events('cta_clicked')).toHaveLength(1);
  });

  it('does nothing to the data layer when analytics never started', () => {
    start('/', false);
    withdrawAnalytics();
    expect(layer()).toEqual([]);
  });
});

describe('when the gate itself fails', () => {
  it('[AC-A4f] a gate error is reported and nothing is sent', async () => {
    start('/', true);
    const before = layer().length;
    const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new TypeError('storage broke at http://localhost/?email=pat%40example.com');
    });
    expect(gateOpen()).toBe(false);
    trackEvent('cta_clicked', { cta_name: 'hero' });
    trackPageView();
    expect(layer()).toHaveLength(before);
    expect(w[FLAG]).toBe(true);
    getItem.mockRestore();
    await flush();

    // One report per page load, with the function name and the error class and nothing else.
    expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
    const [message, context] = (Sentry.captureMessage as jest.Mock).mock.calls[0];
    expect(message).toBe('analytics gate failed closed');
    expect(context).toEqual({ level: 'warning', tags: { analytics_fn: 'gateOpen', error_class: 'TypeError' } });
    expect(JSON.stringify([message, context])).not.toMatch(/pat|localhost|email/);
  });

  it('treats blocked storage as an ordinary no, without a report', async () => {
    start('/', true);
    const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });
    expect(gateOpen()).toBe(false);
    getItem.mockRestore();
    await flush();
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });

  it('reports an empty measurement id in a production build, once', async () => {
    const env = process.env as Record<string, string | undefined>;
    const original = env.NODE_ENV;
    env.NODE_ENV = 'production';
    try {
      go('/');
      writeStoredConsent(window.localStorage, true);
      initializeGA4({ measurementId: '' });
      syncGate();
      syncGate();
      await flush();
      expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
      expect((Sentry.captureMessage as jest.Mock).mock.calls[0][1]).toEqual({
        level: 'warning',
        tags: { analytics_fn: 'syncGate', error_class: 'EmptyMeasurementId' },
      });
    } finally {
      env.NODE_ENV = original;
    }
  });
});
