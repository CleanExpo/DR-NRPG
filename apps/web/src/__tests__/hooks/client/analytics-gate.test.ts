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

  it('keeps well-formed campaign values and drops the rest', () => {
    expect(safeLocation(ORIGIN, '/', '?utm_source=news&utm_medium=email')).toBe(
      'https://nrpg.business/?utm_source=news&utm_medium=email',
    );
    expect(safeLocation(ORIGIN, '/', '?utm_source=pat%40example.com&utm_medium=email')).toBe(
      'https://nrpg.business/?utm_medium=email',
    );
    expect(safeLocation(ORIGIN, '/', `?utm_campaign=${'x'.repeat(101)}`)).toBe('https://nrpg.business/');
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

  it('keeps only the origin of another site', () => {
    expect(safeReferrer('https://www.google.com/search?q=pat+example', ORIGIN)).toBe('https://www.google.com');
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
      sanitiseParams({ event_category: 'Claim', claim_type: 'water', priority: 'high', step_number: 2, outbound: true }),
    ).toEqual({ event_category: 'Claim', claim_type: 'water', priority: 'high', step_number: 2, outbound: true });
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
        claim_type: 'water',
      }),
    ).toEqual({ claim_type: 'water' });
  });

  it('drops values that could carry a person or an address', () => {
    expect(
      sanitiseParams({
        method: 'pat@example.com',
        cta_name: 'x'.repeat(101),
        file_type: 'com/file?token=abc',
        tool_name: { nested: true },
        tool_action: ['a'],
        scroll_depth: Number.NaN,
        value: Number.POSITIVE_INFINITY,
        currency: 'AUD',
      } as Record<string, unknown>),
    ).toEqual({ currency: 'AUD' });
  });

  // The percent sign is the escape for every character the rule above refuses,
  // so a text value may not hold one. `currency` beside it shows the copy ran.
  it.each([
    ['an email with an escaped at sign', 'pat%40example.com'],
    ['an email escaped twice', 'pat%2540example.com'],
    ['an escaped slash', 'com%2Ffile'],
    ['an escaped question mark and equals sign', 'x%3Ftoken%3Dabc'],
    ['a lone percent sign', '50%'],
  ])('[AC-A4m] drops a text value holding %s', (_label, value) => {
    expect(sanitiseParams({ claim_type: value, currency: 'AUD' })).toEqual({ currency: 'AUD' });
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
    const params: Record<string, unknown> = { claim_type: 'water' };
    Object.defineProperty(params, 'priority', {
      enumerable: true,
      get() {
        throw new Error('boom');
      },
    });
    expect(sanitiseParams(params)).toEqual({ claim_type: 'water' });
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
    expect(storage.dump()[CONSENT_VERSION_KEY]).toBe(CONSENT_NOTICE_VERSION);
    const savedAt = storage.dump()[CONSENT_TIMESTAMP_KEY];
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
    const record = JSON.stringify({ necessary: true, analytics: true, marketing: true, preferences: true });
    expect(readStoredConsent(memoryStorage({ [CONSENT_STORAGE_KEY]: record }))).toBeNull();
    expect(
      readStoredConsent(memoryStorage({ [CONSENT_STORAGE_KEY]: record, [CONSENT_VERSION_KEY]: '2020-01-01' })),
    ).toBeNull();
  });

  it('[AC-A4b] consent stored as a string does not count as yes', () => {
    const storage = memoryStorage({
      [CONSENT_STORAGE_KEY]: JSON.stringify({ necessary: true, analytics: 'true' }),
      [CONSENT_VERSION_KEY]: CONSENT_NOTICE_VERSION,
    });
    expect(readStoredConsent(storage)?.analytics).toBe(false);
  });

  it('is null for a record that cannot be parsed or is not an object', () => {
    const v = { [CONSENT_VERSION_KEY]: CONSENT_NOTICE_VERSION };
    expect(readStoredConsent(memoryStorage({ ...v, [CONSENT_STORAGE_KEY]: '{not json' }))).toBeNull();
    expect(readStoredConsent(memoryStorage({ ...v, [CONSENT_STORAGE_KEY]: 'true' }))).toBeNull();
    expect(readStoredConsent(memoryStorage({ ...v, [CONSENT_STORAGE_KEY]: '[]' }))).toBeNull();
  });

  it('is null when there is no storage', () => {
    expect(readStoredConsent(null)).toBeNull();
    expect(readStoredConsent(undefined)).toBeNull();
  });
});
