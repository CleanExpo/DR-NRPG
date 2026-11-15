/**
 * The rules that decide what this site may send to Google Analytics.
 *
 * This file has no imports on purpose: the browser code, the middleware and
 * the tests all read the same lists from here, so there is one owner for each
 * rule. Everything fails closed: a value this file does not recognise is not
 * counted and is not sent.
 */

// ---------------------------------------------------------------------------
// Stored consent (one owner for the keys, the notice version and the parse)
// ---------------------------------------------------------------------------

export const CONSENT_STORAGE_KEY = 'nrpg_cookie_consent';
export const CONSENT_VERSION_KEY = 'nrpg_cookie_consent_version';
export const CONSENT_TIMESTAMP_KEY = 'nrpg_cookie_consent_at';
/** Written by an older banner; never read. Removed on the next save. */
export const LEGACY_CONSENT_EXPIRY_KEY = 'nrpg_cookie_consent_expiry';

/**
 * The version of the cookie notice the visitor agreed to. Change it whenever
 * the banner or the cookie policy changes what "yes" means: a choice stored
 * under any other version is treated as no choice and the banner shows again.
 */
export const CONSENT_NOTICE_VERSION = '2026-11-15';

/** Window event that opens the cookie settings dialog. */
export const COOKIE_SETTINGS_EVENT = 'nrpg:cookie-settings';
/** Window event fired after the stored choice changes in another tab. */
export const CONSENT_CHANGED_EVENT = 'nrpg:consent-changed';

export interface StoredConsent {
  necessary: true;
  analytics: boolean;
  marketing: false;
  preferences: false;
}

interface ReadableStorage {
  getItem(key: string): string | null;
}

interface WritableStorage extends ReadableStorage {
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * The visitor's current choice, or null when there is none that counts:
 * nothing stored, a record that cannot be read, or a choice made under a
 * different notice version. `analytics` is true only for a stored boolean true.
 */
export function readStoredConsent(storage: ReadableStorage | null | undefined): StoredConsent | null {
  if (!storage) return null;
  if (storage.getItem(CONSENT_VERSION_KEY) !== CONSENT_NOTICE_VERSION) return null;
  const raw = storage.getItem(CONSENT_STORAGE_KEY);
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
  return {
    necessary: true,
    analytics: (parsed as { analytics?: unknown }).analytics === true,
    marketing: false,
    preferences: false,
  };
}

/** Save the visitor's choice with the notice version and the time it was made. */
export function writeStoredConsent(storage: WritableStorage, analytics: boolean): StoredConsent {
  const record: StoredConsent = { necessary: true, analytics: analytics === true, marketing: false, preferences: false };
  storage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  storage.setItem(CONSENT_VERSION_KEY, CONSENT_NOTICE_VERSION);
  storage.setItem(CONSENT_TIMESTAMP_KEY, new Date().toISOString());
  storage.removeItem(LEGACY_CONSENT_EXPIRY_KEY);
  return record;
}

/** Forget the visitor's choice, so the banner asks again. */
export function clearStoredConsent(storage: WritableStorage): void {
  storage.removeItem(CONSENT_STORAGE_KEY);
  storage.removeItem(CONSENT_VERSION_KEY);
  storage.removeItem(CONSENT_TIMESTAMP_KEY);
  storage.removeItem(LEGACY_CONSENT_EXPIRY_KEY);
}

// ---------------------------------------------------------------------------
// Which addresses may be counted
// ---------------------------------------------------------------------------

/** Exact paths that may be counted. Nothing else is. */
export const ANALYTICS_PATHS: readonly string[] = [
  '/',
  '/about',
  '/contact',
  '/services',
  '/contractors',
  '/property-owners',
  '/pricing',
  '/how-it-works',
  '/get-started',
  '/find-a-contractor',
  '/quote',
  '/join',
  '/signup',
  '/claim/step-1',
  '/claim/step-2',
  '/claim/step-3',
  '/privacy',
  '/terms',
  '/cookie-policy',
];

/** One fixed title per counted path. The page's own title is never sent. */
export const PAGE_TITLES: Readonly<Record<string, string>> = {
  '/': 'Home',
  '/about': 'About',
  '/contact': 'Contact',
  '/services': 'Services',
  '/contractors': 'Contractors',
  '/property-owners': 'Property owners',
  '/pricing': 'Pricing',
  '/how-it-works': 'How it works',
  '/get-started': 'Get started',
  '/find-a-contractor': 'Find a contractor',
  '/quote': 'Quote',
  '/join': 'Join',
  '/signup': 'Sign up',
  '/claim/step-1': 'Claim step 1',
  '/claim/step-2': 'Claim step 2',
  '/claim/step-3': 'Claim step 3',
  '/privacy': 'Privacy policy',
  '/terms': 'Terms',
  '/cookie-policy': 'Cookie policy',
};

const ANALYTICS_PATH_SET: ReadonlySet<string> = new Set(ANALYTICS_PATHS);

const UTM_KEYS: readonly string[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
const UTM_KEY_SET: ReadonlySet<string> = new Set(UTM_KEYS);
const UTM_VALUE = /^[A-Za-z0-9_.\-~+ ]{1,100}$/;
const ORIGIN_SHAPE = /^https?:\/\/[A-Za-z0-9.\-]+(:\d{1,5})?$/;

/** The site's own sign-up links carry `type`; it opens the gate and is never sent. */
const SIGNUP_PATH = '/signup';
const SIGNUP_TYPE_KEY = 'type';
const SIGNUP_TYPES: ReadonlySet<string> = new Set(['contractor', 'client']);

/**
 * A path in its one accepted spelling, or null. Encoded characters, parent
 * steps, doubled slashes, upper-case letters and dots all fail closed.
 */
export function normalisePath(pathname: unknown): string | null {
  if (typeof pathname !== 'string' || pathname.length === 0 || pathname.length > 200) return null;
  if (pathname[0] !== '/') return null;
  if (pathname.includes('%') || pathname.includes('..') || pathname.includes('//')) return null;
  if (pathname.includes('.') || pathname.includes('\\')) return null;
  if (pathname !== pathname.toLowerCase()) return null;
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

export function isAnalyticsPath(pathname: unknown): boolean {
  const path = normalisePath(pathname);
  return path !== null && ANALYTICS_PATH_SET.has(path);
}

function queryEntries(search: unknown): Array<[string, string]> | null {
  if (typeof search !== 'string') return null;
  if (search === '' || search === '?') return [];
  try {
    return Array.from(new URLSearchParams(search).entries());
  } catch {
    return null;
  }
}

/**
 * True when this address may be counted: a listed path whose query carries
 * nothing but campaign keys (plus the sign-up type on /signup).
 */
export function isOpenUrl(pathname: unknown, search: unknown): boolean {
  const path = normalisePath(pathname);
  if (path === null || !ANALYTICS_PATH_SET.has(path)) return false;
  const entries = queryEntries(search);
  if (entries === null) return false;
  let signupTypeSeen = false;
  for (const [key, value] of entries) {
    if (UTM_KEY_SET.has(key)) continue;
    if (path === SIGNUP_PATH && key === SIGNUP_TYPE_KEY && !signupTypeSeen && SIGNUP_TYPES.has(value)) {
      signupTypeSeen = true;
      continue;
    }
    return false;
  }
  return true;
}

/**
 * The address that is sent for a counted page: origin and path, plus campaign
 * keys whose values are short and plain. Empty when the address is not open.
 */
export function safeLocation(origin: unknown, pathname: unknown, search: unknown): string {
  if (typeof origin !== 'string' || !ORIGIN_SHAPE.test(origin)) return '';
  if (!isOpenUrl(pathname, search)) return '';
  const path = normalisePath(pathname) as string;
  const entries = queryEntries(search) ?? [];
  const kept: string[] = [];
  for (const key of UTM_KEYS) {
    const found = entries.find(([k]) => k === key);
    if (found && UTM_VALUE.test(found[1])) {
      kept.push(`${key}=${encodeURIComponent(found[1])}`);
    }
  }
  return `${origin}${path}${kept.length > 0 ? `?${kept.join('&')}` : ''}`;
}

/**
 * The referrer that is sent. This site: origin and path of a listed page,
 * otherwise empty. Another site: its origin only. Unreadable: empty.
 */
export function safeReferrer(referrer: unknown, origin: unknown): string {
  if (typeof referrer !== 'string' || referrer === '' || typeof origin !== 'string') return '';
  let url: URL;
  try {
    url = new URL(referrer);
  } catch {
    return '';
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
  if (url.origin === origin) {
    const path = normalisePath(url.pathname);
    return path !== null && ANALYTICS_PATH_SET.has(path) ? `${origin}${path}` : '';
  }
  return url.origin;
}

// ---------------------------------------------------------------------------
// Which event parameters may leave the page
// ---------------------------------------------------------------------------

/** Parameter names that may be sent. Every other name is dropped. */
export const ALLOWED_EVENT_PARAMS: ReadonlySet<string> = new Set([
  'event_category',
  'claim_type',
  'priority',
  'method',
  'step_name',
  'step_number',
  'service_type',
  'content_type',
  'file_type',
  'tool_name',
  'tool_action',
  'cta_name',
  'cta_location',
  'scroll_depth',
  'time_on_page',
  'conversion_name',
  'link_domain',
  'outbound',
  'results_count',
  'value',
  'currency',
  'page_title',
  'page_location',
  'page_referrer',
  'page_path',
  'event_callback',
  'event_timeout',
]);

/** The page fields this module computed. A caller cannot supply its own. */
export interface TrustedPage {
  page_location: string;
  page_referrer: string;
  page_title: string;
  page_path: string;
}

const PAGE_FIELDS: ReadonlySet<string> = new Set(['page_location', 'page_referrer', 'page_title', 'page_path']);

/** Short, plain text: no @, slash, question mark, equals or ampersand. */
const PLAIN_VALUE = /^[A-Za-z0-9][A-Za-z0-9 _.:%\-]{0,99}$/;

/**
 * Copy only what may be sent. A listed name passes with a finite number, a
 * boolean, or short plain text; `event_callback` passes as a function; the
 * page fields pass only when they equal the values this module computed.
 */
export function sanitiseParams(params: unknown, trusted?: TrustedPage): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (typeof params !== 'object' || params === null || Array.isArray(params)) return out;
  let names: string[];
  try {
    names = Object.keys(params);
  } catch {
    return out;
  }
  for (const name of names) {
    if (!ALLOWED_EVENT_PARAMS.has(name)) continue;
    let value: unknown;
    try {
      value = (params as Record<string, unknown>)[name];
    } catch {
      continue;
    }
    if (PAGE_FIELDS.has(name)) {
      if (trusted && typeof value === 'string' && value === trusted[name as keyof TrustedPage]) {
        out[name] = value;
      }
      continue;
    }
    if (name === 'event_callback') {
      if (typeof value === 'function') out[name] = value;
      continue;
    }
    if (typeof value === 'number') {
      if (Number.isFinite(value)) out[name] = value;
      continue;
    }
    if (typeof value === 'boolean') {
      out[name] = value;
      continue;
    }
    if (typeof value === 'string' && PLAIN_VALUE.test(value)) {
      out[name] = value;
    }
  }
  return out;
}

/** An event name is a short lower-case word; anything else is not sent. */
export function isSafeEventName(name: unknown): name is string {
  return typeof name === 'string' && /^[a-z][a-z0-9_]{0,39}$/.test(name);
}

/** A Google Analytics 4 measurement id, in the only shape this site accepts. */
export function isMeasurementId(id: unknown): id is string {
  return typeof id === 'string' && /^G-[A-Z0-9]{4,20}$/.test(id);
}

// ---------------------------------------------------------------------------
// The wire: what a request to Google may contain at the moment it is made
// ---------------------------------------------------------------------------
//
// The Google library holds events for some seconds before it sends them, and
// it adds events of its own (scrolling, form use, page changes) when the
// Analytics property asks it to. So the rules above are applied a second time
// to the request itself. An event leaves only if it is about a counted page,
// with the clean address, the fixed title, and nothing but listed parameters.

const COLLECTION_HOSTS: readonly string[] = [
  'google-analytics.com',
  'analytics.google.com',
  'doubleclick.net',
  'googleadservices.com',
  'googlesyndication.com',
];
const TAG_HOST = 'googletagmanager.com';
/** The one thing this site asks the tag host for: the library file. */
const TAG_LIBRARY_PATH = '/gtag/';
const GOOGLE_SITE_HOST = /^(?:[a-z0-9-]+\.)*google\.(?:com|[a-z]{2,3}|com?\.[a-z]{2})$/;
const GOOGLE_SITE_COLLECTION_PATH = /\/collect\/?$|\/ga-audiences|\/pagead\//;

function hostIs(host: string, name: string): boolean {
  return host === name || host.endsWith(`.${name}`);
}

/**
 * True for an absolute web address that would hand something to Google's
 * collection services. The library file itself is not one.
 */
export function isCollectionUrl(url: unknown): boolean {
  if (typeof url !== 'string' || url === '') return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
  const host = parsed.hostname.toLowerCase();
  if (COLLECTION_HOSTS.some((name) => hostIs(host, name))) return true;
  if (hostIs(host, TAG_HOST)) return !parsed.pathname.startsWith(TAG_LIBRARY_PATH);
  if (GOOGLE_SITE_HOST.test(host)) return GOOGLE_SITE_COLLECTION_PATH.test(parsed.pathname);
  return false;
}

export interface WireContext {
  /** This site's own origin. */
  origin: string;
  /** The one Analytics property this site sends to. */
  measurementId: string;
}

export interface ScreenedRequest {
  url: string;
  /** The events that may be sent, or undefined when the request has no body. */
  body: string | undefined;
}

/** What the screen noticed while it worked, for the caller's own counting. */
export interface WireNotes {
  /**
   * Something was stopped because it was not in a form the rules can read: a
   * body that is not text, a field given twice, or an unlisted field holding
   * an address or an email. The Google library does not send these today.
   */
  unreadable: boolean;
  /** Events taken out of a request whose other events were sent. */
  trimmed: number;
}

const FIXED_TITLES: ReadonlySet<string> = new Set(Object.values(PAGE_TITLES));
const NUMBER_VALUE = /^-?\d{1,15}(\.\d{1,10})?(e[+-]?\d{1,3})?$/i;
/** Fields with a rule of their own below. */
const RULED_FIELDS: ReadonlySet<string> = new Set(['tid', 'en', 'dl', 'dr', 'dt', 'dp']);

/** The fields of one query string, or null when a field is given twice. */
function wireFields(query: string): Map<string, string> | null {
  const fields = new Map<string, string>();
  for (const [key, value] of new URLSearchParams(query)) {
    if (fields.has(key)) return null;
    fields.set(key, value);
  }
  return fields;
}

/** The listed path of an address that is exactly its own clean form, else null. */
function cleanAddressPath(address: string, origin: string): string | null {
  let url: URL;
  try {
    url = new URL(address);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;
  return safeLocation(origin, url.pathname, url.search) === address ? normalisePath(url.pathname) : null;
}

function cleanReferrer(value: string, origin: string): boolean {
  return value === '' || safeReferrer(value, origin) === value;
}

/**
 * The rules for one event as it appears in a request. `complete` is false for
 * the part of a batched request that every event in it shares: there a field
 * may be missing, but one that is present must still pass.
 */
function wireFieldsAllowed(
  fields: Map<string, string>,
  context: WireContext,
  complete: boolean,
  notes?: WireNotes,
): boolean {
  const property = fields.get('tid');
  if (property === undefined ? complete : property !== context.measurementId) return false;
  const eventName = fields.get('en');
  if (eventName === undefined ? complete : !isSafeEventName(eventName)) return false;

  const address = fields.get('dl');
  let path: string | null = null;
  if (address === undefined) {
    if (complete) return false;
  } else {
    path = cleanAddressPath(address, context.origin);
    if (path === null) return false;
  }

  const referrer = fields.get('dr');
  if (referrer !== undefined && !cleanReferrer(referrer, context.origin)) return false;

  const title = fields.get('dt');
  if (title !== undefined && title !== '') {
    if (path === null ? !FIXED_TITLES.has(title) : title !== PAGE_TITLES[path]) return false;
  }

  // The page path travels beside the address; it must be that address's path.
  const pagePath = fields.get('dp');
  if (pagePath !== undefined && (path === null || pagePath !== path)) return false;

  for (const [key, value] of fields) {
    if (RULED_FIELDS.has(key)) continue;
    if (key === 'uid' || key.startsWith('up.') || key.startsWith('upn.')) return false;
    if (key.startsWith('ep.')) {
      const name = key.slice(3);
      if (!ALLOWED_EVENT_PARAMS.has(name) || name === 'event_callback') return false;
      if (name === 'page_location') {
        if (value !== address) return false;
      } else if (name === 'page_referrer') {
        if (!cleanReferrer(value, context.origin)) return false;
      } else if (name === 'page_title') {
        if (path === null || value !== PAGE_TITLES[path]) return false;
      } else if (name === 'page_path') {
        if (path === null || value !== path) return false;
      } else if (!PLAIN_VALUE.test(value)) {
        return false;
      }
      continue;
    }
    if (key.startsWith('epn.')) {
      const name = key.slice(4);
      if (!ALLOWED_EVENT_PARAMS.has(name) || PAGE_FIELDS.has(name) || name === 'event_callback') return false;
      if (!NUMBER_VALUE.test(value)) return false;
      continue;
    }
    // Any other field is the library's own bookkeeping. It never needs an
    // address or an email, so one that holds either is not sent.
    if (value.includes('@') || value.includes('://')) {
      if (notes) notes.unreadable = true;
      return false;
    }
  }
  return true;
}

/**
 * Screen one request to Google. Returns what may be sent: the request as it
 * is, the request with the events that broke a rule taken out, or null when
 * nothing in it may leave. A body that is not plain text cannot be read, so
 * it is not sent.
 */
export function screenCollect(
  url: unknown,
  body: unknown,
  context: WireContext,
  notes?: WireNotes,
): ScreenedRequest | null {
  const unreadable = (): null => {
    if (notes) notes.unreadable = true;
    return null;
  };
  if (typeof url !== 'string' || !isCollectionUrl(url)) return null;
  if (!context || typeof context.origin !== 'string' || !ORIGIN_SHAPE.test(context.origin)) return null;
  if (!isMeasurementId(context.measurementId)) return null;
  const shared = wireFields(new URL(url).search);
  if (shared === null) return unreadable();

  if (body === undefined || body === null || body === '') {
    return wireFieldsAllowed(shared, context, true, notes) ? { url, body: undefined } : null;
  }
  if (typeof body !== 'string') return unreadable();
  if (!wireFieldsAllowed(shared, context, false, notes)) return null;

  const kept: string[] = [];
  let events = 0;
  for (const line of body.split(/\r?\n/)) {
    if (line === '') continue;
    events += 1;
    const own = wireFields(line);
    if (own === null) {
      if (notes) notes.unreadable = true;
      continue;
    }
    const event = new Map(shared);
    for (const [key, value] of own) event.set(key, value);
    if (wireFieldsAllowed(event, context, true, notes)) kept.push(line);
  }
  if (kept.length === 0) return null;
  if (notes) notes.trimmed += events - kept.length;
  return { url, body: kept.join(body.includes('\r\n') ? '\r\n' : '\n') };
}

// ---------------------------------------------------------------------------
// Security policy: which documents may load the Google tag at all
// ---------------------------------------------------------------------------

/**
 * Public content sections that are not counted yet but may be later. Their
 * documents get the open policy so a visitor who lands there and then moves to
 * a counted page in the app can still be counted.
 */
const PUBLIC_CONTENT_SEGMENTS: readonly string[] = [
  'services',
  'locations',
  'guides',
  'resources',
  'tools',
  'learn',
  'case-studies',
  'events',
  'training',
  'cyclone-alfred-queensland-2025',
  'cyclone-maila-queensland-2026',
  'cyclone-narelle-western-australia-2026',
  'nsw-qld-storms-april-2026',
  'queensland-floods-2026-recovery',
  'victoria-bushfires-2025',
  'victoria-bushfires-2026',
];

function firstSegment(path: string): string {
  return path.split('/')[1] ?? '';
}

/**
 * First path segments whose documents may carry the Google hosts in their
 * security policy. The home page is the empty segment. Anything not listed is
 * closed: the dashboard, admin, sign-in, onboarding, the API, search and the
 * city pages never name a Google host.
 */
export const POLICY_OPEN_SEGMENTS: ReadonlySet<string> = new Set([
  ...ANALYTICS_PATHS.map(firstSegment),
  ...PUBLIC_CONTENT_SEGMENTS,
]);

/** True when the document at this path may carry the open policy. */
export function isPolicyOpenPath(pathname: unknown): boolean {
  const path = normalisePath(pathname);
  return path !== null && POLICY_OPEN_SEGMENTS.has(firstSegment(path));
}

const GOOGLE_SCRIPT_HOSTS = 'https://www.googletagmanager.com';
const GOOGLE_CONNECT_HOSTS =
  'https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com';

/**
 * The Content-Security-Policy header value. The closed policy is the one the
 * site has always sent. The open policy adds the Google Analytics hosts to
 * script-src and connect-src and changes nothing else.
 */
export function buildCsp(options: { allowAnalytics: boolean }): string {
  const open = options?.allowAnalytics === true;
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://hcaptcha.com https://*.hcaptcha.com" +
      (open ? ` ${GOOGLE_SCRIPT_HOSTS}` : ''),
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://cdn.jsdelivr.net",
    "connect-src 'self' https://hcaptcha.com https://*.hcaptcha.com https://*.supabase.co wss://*.supabase.co" +
      (open ? ` ${GOOGLE_CONNECT_HOSTS}` : ''),
    "frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}
