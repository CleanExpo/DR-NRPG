/**
 * The pure rules behind the analytics gate (src/lib/analytics-gate.ts):
 * which addresses may be counted, what a counted address looks like, which
 * event parameters may leave the page, and when stored consent counts.
 */
import {
  ALLOWED_EVENT_PARAMS,
  ANALYTICS_PATHS,
  CONSENT_NOTICE_VERSION,
  CONSENT_STORAGE_KEY,
  CONSENT_TIMESTAMP_KEY,
  CONSENT_VERSION_KEY,
  PAGE_TITLES,
  isAnalyticsPath,
  isOpenUrl,
  clearStoredConsent,
  readStoredConsent,
  safeLocation,
  safeReferrer,
  sanitiseParams,
  writeStoredConsent,
} from '@/lib/analytics-gate';
import { __resetAnalyticsForTests, gateOpen, initializeGA4, withdrawAnalytics } from '@/lib/analytics';

const ORIGIN = 'https://nrpg.business';

function memoryStorage(seed: Record<string, string> = {}) {
  const data = new Map(Object.entries(seed));
  return {
    getItem: (k: string) => (data.has(k) ? data.get(k)! : null),
    setItem: (k: string, v: string) => void data.set(k, String(v)),
    removeItem: (k: string) => void data.delete(k),
    dump: () => Object.fromEntries(data),
  };
}

describe('listed paths', () => {
  it('lists nineteen paths, each with a fixed title', () => {
    expect(ANALYTICS_PATHS).toHaveLength(19);
    for (const path of ANALYTICS_PATHS) {
      expect(typeof PAGE_TITLES[path]).toBe('string');
      expect(PAGE_TITLES[path].length).toBeGreaterThan(0);
      expect(PAGE_TITLES[path]).not.toMatch(/@/);
    }
  });

  it.each(['/', '/about', '/claim/step-3', '/signup', '/cookie-policy'])('accepts %s', (path) => {
    expect(isAnalyticsPath(path)).toBe(true);
  });

  it('accepts one trailing slash', () => {
    expect(isAnalyticsPath('/about/')).toBe(true);
  });

  it.each([
    '/dashboard',
    '/dashboard/contractor/training',
    '/claim/success',
    '/launch/thank-you',
    '/login',
    '/services/water-damage',
    '/Services',
    '/about%2f',
    '/%2e%2e/about',
    '/about/../dashboard',
    '//about',
    '/about.html',
    'about',
    '',
  ])('fails closed on %s', (path) => {
    expect(isAnalyticsPath(path)).toBe(false);
  });

  it('fails closed on a value that is not a string', () => {
    expect(isAnalyticsPath(undefined as unknown as string)).toBe(false);
    expect(isAnalyticsPath(null as unknown as string)).toBe(false);
  });
});

describe('open addresses', () => {
  it('is open on a listed path with no query', () => {
    expect(isOpenUrl('/', '')).toBe(true);
    expect(isOpenUrl('/pricing', '?')).toBe(true);
  });

  it('is open when the only query keys are campaign keys', () => {
    expect(isOpenUrl('/', '?utm_source=news&utm_medium=email&utm_campaign=spring&utm_term=x&utm_content=y')).toBe(true);
  });

  it.each([
    ['/', '?email=pat%40example.com'],
    ['/', '?utm_source=news&token=abc'],
    ['/claim/step-1', '?claimId=CLM-1'],
    ['/quote', '?ref=123'],
    ['/dashboard', ''],
    ['/claim/success', '?claimId=CLM-1'],
    ['/launch/thank-you', '?email=pat%40example.com'],
  ])('is closed for %s%s', (path, search) => {
    expect(isOpenUrl(path, search)).toBe(false);
  });

  it('allows the site\'s own sign-up links and nothing else on that key', () => {
    expect(isOpenUrl('/signup', '?type=contractor')).toBe(true);
    expect(isOpenUrl('/signup', '?type=client')).toBe(true);
    expect(isOpenUrl('/signup', '?type=pat%40example.com')).toBe(false);
    expect(isOpenUrl('/signup', '?type=contractor&type=client')).toBe(false);
    expect(isOpenUrl('/signup', '?type=contractor&email=pat%40example.com')).toBe(false);
    expect(isOpenUrl('/about', '?type=contractor')).toBe(false);
  });
});

describe('the address that is sent', () => {
  it('is the origin and path only', () => {
    expect(safeLocation(ORIGIN, '/about', '')).toBe('https://nrpg.business/about');
    expect(safeLocation(ORIGIN, '/', '')).toBe('https://nrpg.business/');
  });

  it('never carries the sign-up type key', () => {
    expect(safeLocation(ORIGIN, '/signup', '?type=contractor')).toBe('https://nrpg.business/signup');
  });

  it('[AC-E47a] sends listed campaign values as written and any other as "other"', () => {
    expect(safeLocation(ORIGIN, '/', '?utm_source=newsletter&utm_medium=email')).toBe(
      'https://nrpg.business/?utm_source=newsletter&utm_medium=email',
    );
    expect(safeLocation(ORIGIN, '/', '?utm_source=pat%40example.com&utm_medium=email')).toBe(
      'https://nrpg.business/?utm_source=other&utm_medium=email',
    );
    expect(safeLocation(ORIGIN, '/', `?utm_campaign=${'x'.repeat(101)}`)).toBe('https://nrpg.business/?utm_campaign=other');
    expect(safeLocation(ORIGIN, '/', '?utm_campaign=')).toBe('https://nrpg.business/');
  });

  it('is empty for an address that may not be counted', () => {
    expect(safeLocation(ORIGIN, '/dashboard', '')).toBe('');
    expect(safeLocation(ORIGIN, '/', '?email=pat%40example.com')).toBe('');
  });
});

describe('the referrer that is sent', () => {
  it('keeps origin and path for a listed page on this site', () => {
    expect(safeReferrer('https://nrpg.business/pricing?x=1#top', ORIGIN)).toBe('https://nrpg.business/pricing');
  });

  it('is empty for a page on this site that is not listed', () => {
    expect(safeReferrer('https://nrpg.business/dashboard/claims/42', ORIGIN)).toBe('');
    expect(safeReferrer('https://nrpg.business/claim/success?claimId=CLM-1', ORIGIN)).toBe('');
  });

  it('keeps only the origin of a listed site', () => {
    expect(safeReferrer('https://www.google.com/search?q=pat+example', ORIGIN)).toBe('https://www.google.com');
  });

  it('[AC-E47a] is empty for a site the list does not name, whatever its name holds', () => {
    expect(safeReferrer('https://prooftoken7731abcdef.example.org/', ORIGIN)).toBe('');
    expect(safeReferrer('https://www.example.org/a', ORIGIN)).toBe('');
    expect(safeReferrer('http://www.google.com/', ORIGIN)).toBe('');
  });

  it('is empty when it cannot be read or is not a web address', () => {
    expect(safeReferrer('', ORIGIN)).toBe('');
    expect(safeReferrer('not a url', ORIGIN)).toBe('');
    expect(safeReferrer('android-app://com.example/', ORIGIN)).toBe('');
  });
});

describe('event parameters', () => {
  const trusted = {
    page_location: 'https://nrpg.business/about',
    page_referrer: '',
    page_title: 'About',
    page_path: '/about',
  };

  it('passes listed names with plain values', () => {
    expect(
      sanitiseParams({ event_category: 'Claim', claim_type: 'flood', priority: 'high', step_number: 2, outbound: true }),
    ).toEqual({ event_category: 'Claim', claim_type: 'flood', priority: 'high', step_number: 2, outbound: true });
  });

  it('drops names that are not listed', () => {
    expect(
      sanitiseParams({
        claim_id: 'CLM-1',
        contractor_id: 'c_1',
        contractor_name: 'Pat Example',
        search_term: 'pat example flood',
        user_id: 'u_1',
        event_label: 'Pat Example',
        link_url: 'https://example.com/?token=abc',
        link_text: 'Pat',
        transaction_id: 'cs_1',
        items: [{ item_id: 'x' }],
        claim_type: 'flood',
      }),
    ).toEqual({ claim_type: 'flood' });
  });

  it('[AC-E47a] sends text off its list as "other", never the text, and drops other kinds', () => {
    expect(
      sanitiseParams({
        method: 'pat@example.com',
        cta_name: 'x'.repeat(101),
        file_type: 'com/file?token=abc',
        claim_type: 'prooftoken7731abcdef',
        tool_name: { nested: true },
        tool_action: ['a'],
        scroll_depth: Number.NaN,
        value: Number.POSITIVE_INFINITY,
        currency: 'AUD',
      } as Record<string, unknown>),
    ).toEqual({ method: 'other', cta_name: 'other', file_type: 'other', claim_type: 'other', currency: 'AUD' });
  });

  it.each([
    ['a claim number as a step', { step_number: 123456789 }],
    ['a negative count', { results_count: -1 }],
    ['a fraction of a step', { step_number: 1.5 }],
    ['a fraction of a cent', { value: 27.505 }],
    ['true where the list names no true', { claim_type: true }],
  ])('[AC-E47a] drops %s', (_label, params) => {
    expect(sanitiseParams({ ...params, currency: 'AUD' } as Record<string, unknown>)).toEqual({ currency: 'AUD' });
  });

  it('[AC-E47a] keeps numbers in range, cents only on value', () => {
    expect(sanitiseParams({ step_number: 3, scroll_depth: 100, value: 27.5 })).toEqual({
      step_number: 3,
      scroll_depth: 100,
      value: 27.5,
    });
  });

  // An escaped value is just another value off the list. `currency` beside it shows the copy ran.
  it.each([
    ['an email with an escaped at sign', 'pat%40example.com'],
    ['an email escaped twice', 'pat%2540example.com'],
    ['an escaped slash', 'com%2Ffile'],
    ['an escaped question mark and equals sign', 'x%3Ftoken%3Dabc'],
    ['a lone percent sign', '50%'],
  ])('[AC-A4m] a text value holding %s is sent as "other"', (_label, value) => {
    expect(sanitiseParams({ claim_type: value, currency: 'AUD' })).toEqual({ claim_type: 'other', currency: 'AUD' });
  });

  it('keeps a function only as the event callback', () => {
    const cb = () => undefined;
    const out = sanitiseParams({ event_callback: cb, cta_name: cb } as Record<string, unknown>);
    expect(out).toEqual({ event_callback: cb });
  });

  it('passes page fields only when they equal the values this module computed', () => {
    expect(sanitiseParams({ ...trusted }, trusted)).toEqual({
      page_location: 'https://nrpg.business/about',
      page_title: 'About',
      page_path: '/about',
      page_referrer: '',
    });
    expect(
      sanitiseParams(
        { page_location: 'https://nrpg.business/dashboard?token=abc', page_title: 'Pat Example claim', page_path: '/x' },
        trusted,
      ),
    ).toEqual({});
    expect(sanitiseParams({ page_location: 'https://nrpg.business/about' })).toEqual({});
  });

  it('[AC-A4j] a parameter with a throwing getter is dropped', () => {
    const params: Record<string, unknown> = { claim_type: 'flood' };
    Object.defineProperty(params, 'priority', {
      enumerable: true,
      get() {
        throw new Error('boom');
      },
    });
    expect(sanitiseParams(params)).toEqual({ claim_type: 'flood' });
  });

  it('returns an empty object for anything that is not a plain object', () => {
    expect(sanitiseParams(undefined)).toEqual({});
    expect(sanitiseParams(null)).toEqual({});
    expect(sanitiseParams('x' as unknown as Record<string, unknown>)).toEqual({});
  });

  it('lists none of the names that carried a person, a record or free text', () => {
    const banned = [
      'claim_id', 'claim_value', 'contractor_id', 'contractor_name', 'search_term', 'user_id', 'event_label',
      'link_url', 'link_text', 'transaction_id', 'items', 'content_id', 'content_name', 'location', 'video_id',
      'video_name', 'form_name', 'error_message', 'tool_value', 'user_properties',
    ];
    for (const name of banned) {
      expect(ALLOWED_EVENT_PARAMS.has(name)).toBe(false);
    }
    expect(ALLOWED_EVENT_PARAMS.size).toBe(27);
  });
});

describe('stored consent', () => {
  it('is null when nothing is stored', () => {
    expect(readStoredConsent(memoryStorage())).toBeNull();
  });

  it('round-trips a choice with the notice version and a time', () => {
    const storage = memoryStorage();
    writeStoredConsent(storage, true);
    expect(readStoredConsent(storage)).toEqual({ necessary: true, analytics: true, marketing: false, preferences: false });
    // Spec E43: the version and the time are inside the one record, and nothing is written beside it.
    expect(Object.keys(storage.dump())).toEqual([CONSENT_STORAGE_KEY]);
    const record = JSON.parse(storage.dump()[CONSENT_STORAGE_KEY]) as { version: string; savedAt: string };
    expect(record.version).toBe(CONSENT_NOTICE_VERSION);
    const savedAt = record.savedAt;
    expect(new Date(savedAt).toISOString()).toBe(savedAt);
    expect(Math.abs(Date.now() - Date.parse(savedAt))).toBeLessThan(60_000);
    writeStoredConsent(storage, false);
    expect(readStoredConsent(storage)?.analytics).toBe(false);
  });

  it('forgets the time with the choice', () => {
    const storage = memoryStorage();
    writeStoredConsent(storage, true);
    clearStoredConsent(storage);
    expect(storage.dump()).toEqual({});
  });

  it('[AC-A4a] consent stored under an old notice version is treated as no choice', () => {
    const now = new Date().toISOString();
    const yes = { necessary: true, analytics: true, marketing: true, preferences: true };
    // No version in the record: no choice, whatever stands beside it.
    expect(readStoredConsent(memoryStorage({ [CONSENT_STORAGE_KEY]: JSON.stringify(yes) }))).toBeNull();
    expect(
      readStoredConsent(
        memoryStorage({
          [CONSENT_STORAGE_KEY]: JSON.stringify(yes),
          [CONSENT_VERSION_KEY]: CONSENT_NOTICE_VERSION,
          [CONSENT_TIMESTAMP_KEY]: now,
        }),
      ),
    ).toBeNull();
    // An older version in the record: no choice.
    expect(
      readStoredConsent(memoryStorage({ [CONSENT_STORAGE_KEY]: JSON.stringify({ ...yes, version: '2020-01-01', savedAt: now }) })),
    ).toBeNull();
    // The clean twin: this notice's version in the record is a choice.
    expect(
      readStoredConsent(
        memoryStorage({ [CONSENT_STORAGE_KEY]: JSON.stringify({ ...yes, version: CONSENT_NOTICE_VERSION, savedAt: now }) }),
      )?.analytics,
    ).toBe(true);
  });

  it('[AC-A4b] consent stored as a string does not count as yes', () => {
    const storage = memoryStorage({
      [CONSENT_STORAGE_KEY]: JSON.stringify({
        necessary: true,
        analytics: 'true',
        version: CONSENT_NOTICE_VERSION,
        savedAt: new Date().toISOString(),
      }),
    });
    expect(readStoredConsent(storage)?.analytics).toBe(false);
  });

  it('is null for a record that cannot be parsed or is not an object', () => {
    expect(readStoredConsent(memoryStorage({ [CONSENT_STORAGE_KEY]: '{not json' }))).toBeNull();
    expect(readStoredConsent(memoryStorage({ [CONSENT_STORAGE_KEY]: 'true' }))).toBeNull();
    expect(readStoredConsent(memoryStorage({ [CONSENT_STORAGE_KEY]: '[]' }))).toBeNull();
  });

  it('is null when there is no storage', () => {
    expect(readStoredConsent(null)).toBeNull();
    expect(readStoredConsent(undefined)).toBeNull();
  });
});

describe('campaign values (spec E35)', () => {
  it('[AC-K1a] a phone number in utm_term is not sent', () => {
    expect(safeLocation(ORIGIN, '/', '?utm_source=newsletter&utm_term=0412345678')).toBe(
      'https://nrpg.business/?utm_source=newsletter',
    );
  });

  it('[AC-K1a] utm_term and utm_content are never sent, whatever they hold', () => {
    expect(safeLocation(ORIGIN, '/pricing', '?utm_term=water&utm_content=banner')).toBe('https://nrpg.business/pricing');
  });

  it('[AC-K1a] a listed value is kept; an unlisted slug is sent as "other" (spec E47)', () => {
    expect(safeLocation(ORIGIN, '/', '?utm_source=news-letter&utm_medium=email&utm_campaign=spring_2026')).toBe(
      'https://nrpg.business/?utm_source=other&utm_medium=email&utm_campaign=other',
    );
  });

  it.each([
    ['five digits in a row', 'call0412345'],
    ['a phone number', '0412345678'],
    ['upper case', 'Spring'],
    ['a space', 'spring sale'],
    ['a plus sign', 'spring+sale'],
    ['a dot', 'jane.smith'],
    ['a leading dash', '-spring'],
    ['a doubled dash', 'spring--sale'],
  ])('[AC-K1a] a campaign value with %s is sent as "other", never as itself', (_label, value) => {
    expect(safeLocation(ORIGIN, '/', `?utm_campaign=${encodeURIComponent(value)}&utm_medium=email`)).toBe(
      'https://nrpg.business/?utm_medium=email&utm_campaign=other',
    );
  });

  it('[AC-K1a] listed source and medium values are kept as written', () => {
    expect(safeLocation(ORIGIN, '/', '?utm_source=google&utm_medium=cpc')).toBe(
      'https://nrpg.business/?utm_source=google&utm_medium=cpc',
    );
  });

  it('[AC-K1a] an address with a campaign field given twice is not counted', () => {
    expect(isOpenUrl('/', '?utm_source=news&utm_source=0412345678')).toBe(false);
    expect(safeLocation(ORIGIN, '/', '?utm_source=news&utm_source=0412345678')).toBe('');
    expect(isOpenUrl('/signup', '?type=client&type=contractor')).toBe(false);
  });

  it('[AC-K1a] the clean twin: one of each field is counted', () => {
    expect(isOpenUrl('/', '?utm_source=news&utm_term=x')).toBe(true);
  });
});

describe('stored consent is all or nothing (spec E37)', () => {
  /** Storage whose setItem throws for the named key, after letting earlier writes land. */
  function failingOn(key: string, seed: Record<string, string> = {}) {
    const storage = memoryStorage(seed);
    const setItem = storage.setItem;
    storage.setItem = (k: string, v: string) => {
      if (k === key) throw new Error('quota');
      setItem(k, v);
    };
    return storage;
  }

  // Spec E43: the choice is written with one setItem, of the one key. The
  // separate version and time keys are no longer written, so a refusal can
  // only come at that one write; every step of the write, removals included,
  // is refused in turn by the [AC-K4b] cases below.
  it('[AC-K4] a failed write of the record leaves no yes readable', () => {
    const storage = failingOn(CONSENT_STORAGE_KEY);
    expect(() => writeStoredConsent(storage, true)).toThrow();
    expect(readStoredConsent(storage)).toBeNull();
    expect(storage.dump()[CONSENT_STORAGE_KEY]).toBeUndefined();
  });

  it('[AC-K4] a failed write of the record over an earlier yes leaves no yes readable', () => {
    const earlier = memoryStorage();
    writeStoredConsent(earlier, true);
    const storage = failingOn(CONSENT_STORAGE_KEY, earlier.dump());
    expect(() => writeStoredConsent(storage, false)).toThrow();
    expect(readStoredConsent(storage)?.analytics === true).toBe(false);
  });

  it('[AC-K4] a record without its time is no choice', () => {
    const base = { necessary: true, analytics: true, marketing: false, preferences: false, version: CONSENT_NOTICE_VERSION };
    expect(readStoredConsent(memoryStorage({ [CONSENT_STORAGE_KEY]: JSON.stringify(base) }))).toBeNull();
    expect(
      readStoredConsent(memoryStorage({ [CONSENT_STORAGE_KEY]: JSON.stringify({ ...base, savedAt: 'not a time' }) })),
    ).toBeNull();
    expect(readStoredConsent(memoryStorage({ [CONSENT_STORAGE_KEY]: JSON.stringify({ ...base, savedAt: 12345 }) }))).toBeNull();
    // A time beside the record does not stand in for the time inside it.
    expect(
      readStoredConsent(
        memoryStorage({ [CONSENT_STORAGE_KEY]: JSON.stringify(base), [CONSENT_TIMESTAMP_KEY]: new Date().toISOString() }),
      ),
    ).toBeNull();
  });

  it('[AC-K4] the clean twin: a complete record is a choice', () => {
    const storage = memoryStorage();
    writeStoredConsent(storage, true);
    expect(readStoredConsent(storage)?.analytics).toBe(true);
  });
});

describe('stored consent is one key and one write (spec E43)', () => {
  type State = Record<string, string>;
  type Verdict = 'none' | 'yes' | 'no';
  const verdict = (choice: { analytics: boolean } | null): Verdict =>
    choice === null ? 'none' : choice.analytics ? 'yes' : 'no';

  /** Storage that keeps a copy of itself after every change, and refuses the change numbered `refuseAt`. */
  function recording(seed: State, refuseAt = -1) {
    const data = new Map(Object.entries(seed));
    const states: State[] = [];
    let step = 0;
    const change = (apply: () => void) => {
      if (step++ === refuseAt) throw new Error('storage refused');
      apply();
      states.push(Object.fromEntries(data));
    };
    return {
      getItem: (k: string) => (data.has(k) ? data.get(k)! : null),
      setItem: (k: string, v: string) => change(() => void data.set(k, String(v))),
      removeItem: (k: string) => change(() => void data.delete(k)),
      states,
      steps: () => step,
    };
  }

  const OLDER = '2020-01-01';
  const OLDER_TIME = '2020-01-01T00:00:00.000Z';
  const saved = (analytics: boolean): State => {
    const storage = memoryStorage();
    writeStoredConsent(storage, analytics);
    return storage.dump();
  };
  const starts: Array<[string, () => State]> = [
    ['nothing stored', () => ({})],
    ['a yes under this notice', () => saved(true)],
    ['a no under this notice', () => saved(false)],
    [
      'a yes under an older notice',
      () => ({
        [CONSENT_STORAGE_KEY]: JSON.stringify({
          necessary: true,
          analytics: true,
          marketing: false,
          preferences: false,
          version: OLDER,
          savedAt: OLDER_TIME,
        }),
        [CONSENT_VERSION_KEY]: OLDER,
        [CONSENT_TIMESTAMP_KEY]: OLDER_TIME,
      }),
    ],
    [
      'a yes in an older record shape',
      () => ({
        [CONSENT_STORAGE_KEY]: JSON.stringify({ necessary: true, analytics: true }),
        [CONSENT_VERSION_KEY]: OLDER,
        [CONSENT_TIMESTAMP_KEY]: OLDER_TIME,
      }),
    ],
  ];
  const cases = starts.flatMap(([name, seed]) => (['yes', 'no'] as const).map((choice) => [name, choice, seed] as const));

  it.each(cases)('[AC-K4b] from %s, saving %s: every state on the way reads as the old or the new choice', (_name, choice, seed) => {
    const start = seed();
    const before = verdict(readStoredConsent(memoryStorage(start)));
    const storage = recording(start);
    writeStoredConsent(storage, choice === 'yes');
    const after = verdict(readStoredConsent(storage));
    expect(after).toBe(choice);
    expect(storage.states.length).toBeGreaterThan(0);
    for (const state of storage.states) {
      expect([before, after]).toContain(verdict(readStoredConsent(memoryStorage(state))));
    }
  });

  it.each(cases)('[AC-K4b] from %s, saving %s: a write refused at any step leaves no yes readable', (_name, choice, seed) => {
    const clean = recording(seed());
    writeStoredConsent(clean, choice === 'yes');
    const total = clean.steps();
    expect(total).toBeGreaterThan(0);
    for (let refuseAt = 0; refuseAt < total; refuseAt += 1) {
      const storage = recording(seed(), refuseAt);
      let threw = false;
      try {
        writeStoredConsent(storage, choice === 'yes');
      } catch {
        threw = true;
      }
      const result = verdict(readStoredConsent(storage));
      if (threw) expect(result).not.toBe('yes');
      else expect(result).toBe(choice);
    }
  });

  describe('the open page reads the one key', () => {
    const ID = 'G-RK33F1ZD1H';
    beforeEach(() => {
      __resetAnalyticsForTests();
      window.localStorage.clear();
      window.history.replaceState(null, '', '/about');
      (window as unknown as { fetch: unknown }).fetch = jest.fn(async () => ({ ok: true, status: 200 }));
      Object.defineProperty(navigator, 'sendBeacon', { value: jest.fn(() => true), configurable: true, writable: true });
    });
    afterEach(() => {
      __resetAnalyticsForTests();
      window.localStorage.clear();
    });

    it('[AC-K4b] a change to the old separate version key alone does not change the choice in an open tab', () => {
      writeStoredConsent(window.localStorage, true);
      initializeGA4({ measurementId: ID });
      expect(gateOpen()).toBe(true);
      window.localStorage.setItem(CONSENT_VERSION_KEY, OLDER);
      window.dispatchEvent(new StorageEvent('storage', { key: CONSENT_VERSION_KEY }));
      expect(gateOpen()).toBe(true);
    });

    it('[AC-K4b] a no given on this page load stands until the one key changes', async () => {
      writeStoredConsent(window.localStorage, true);
      initializeGA4({ measurementId: ID });
      expect(gateOpen()).toBe(true);
      withdrawAnalytics();
      expect(gateOpen()).toBe(false);
      window.localStorage.setItem(CONSENT_TIMESTAMP_KEY, new Date(Date.now() + 60_000).toISOString());
      expect(gateOpen()).toBe(false);
      // A later "yes" that is really stored opens it again.
      await new Promise((resolve) => setTimeout(resolve, 5));
      writeStoredConsent(window.localStorage, true);
      expect(gateOpen()).toBe(true);
    });
  });
});
