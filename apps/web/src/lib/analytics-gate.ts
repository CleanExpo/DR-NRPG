/**
 * The rules that decide what this site may send to Google Analytics.
 *
 * This file imports only its own data (the Google host lists, which the proof
 * scripts read too): the browser code, the middleware and the tests all read
 * the same lists from here, so there is one owner for each rule. Everything
 * fails closed: a value this file does not recognise is not counted and is
 * not sent.
 */

import googleHosts from './google-hosts.json';

// ---------------------------------------------------------------------------
// Stored consent (one owner for the keys, the notice version and the parse)
// ---------------------------------------------------------------------------

/**
 * The one key that holds the visitor's choice. The record in it carries the
 * choice, the notice version and the time together (spec E43), so one write
 * changes all three at once and no reader can see a mix of old and new parts.
 */
export const CONSENT_STORAGE_KEY = 'nrpg_cookie_consent';
/** Written by an earlier build beside the record; never read. Removed on the next save. */
export const CONSENT_VERSION_KEY = 'nrpg_cookie_consent_version';
/** Written by an earlier build beside the record; never read. Removed on the next save. */
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
 * Only the one key is read: the version and the time are inside the record.
 */
export function readStoredConsent(storage: ReadableStorage | null | undefined): StoredConsent | null {
  if (!storage) return null;
  const raw = storage.getItem(CONSENT_STORAGE_KEY);
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
  const { version, savedAt } = parsed as { version?: unknown; savedAt?: unknown };
  if (version !== CONSENT_NOTICE_VERSION) return null;
  if (typeof savedAt !== 'string' || Number.isNaN(Date.parse(savedAt))) return null;
  return {
    necessary: true,
    analytics: (parsed as { analytics?: unknown }).analytics === true,
    marketing: false,
    preferences: false,
  };
}

/**
 * Save the visitor's choice with the notice version and the time it was made.
 *
 * One write (spec E43): the choice, the version and the time go into the one
 * key together, so every reader sees either the whole old record or the whole
 * new one. If that write fails, the record is removed, so what is left reads
 * as no choice (and so as "no"), never as an earlier "yes"; the failure is
 * passed on to the caller. The keys an earlier build wrote beside the record
 * are removed afterwards; they are never read, so a failed removal changes
 * nothing and is ignored.
 */
export function writeStoredConsent(storage: WritableStorage, analytics: boolean): StoredConsent {
  const choice: StoredConsent = { necessary: true, analytics: analytics === true, marketing: false, preferences: false };
  const record = { ...choice, version: CONSENT_NOTICE_VERSION, savedAt: new Date().toISOString() };
  try {
    storage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch (error) {
    try {
      storage.removeItem(CONSENT_STORAGE_KEY);
    } catch {
      // Storage refuses even a removal: nothing more can be done here.
    }
    throw error;
  }
  for (const key of [CONSENT_VERSION_KEY, CONSENT_TIMESTAMP_KEY, LEGACY_CONSENT_EXPIRY_KEY]) {
    try {
      storage.removeItem(key);
    } catch {
      // Never read: a key left behind changes nothing.
    }
  }
  return choice;
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

/** Campaign keys an address may carry and still be counted. */
const UTM_KEYS: readonly string[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
const UTM_KEY_SET: ReadonlySet<string> = new Set(UTM_KEYS);
/**
 * The campaign keys that are ever sent. `utm_term` and `utm_content` are
 * free-text slots (a search term, an ad's wording) where a person's details
 * can end up, so they are never sent, whatever they hold.
 */
const SENT_UTM_KEYS: readonly string[] = ['utm_source', 'utm_medium', 'utm_campaign'];

/**
 * The campaign values that are sent as written (spec E47). A campaign value is
 * typed by whoever made the link, so it is open text; only a value on these
 * lists leaves as itself. Any other campaign value is sent as `other`, so the
 * visit still counts as a campaign visit. Add a campaign name to
 * `utm_campaign` before the campaign's links go out.
 */
export const CAMPAIGN_VALUES: Readonly<Record<string, ReadonlySet<string>>> = {
  utm_source: new Set([
    'google',
    'bing',
    'facebook',
    'instagram',
    'linkedin',
    'youtube',
    'tiktok',
    'x',
    'twitter',
    'email',
    'newsletter',
    'sms',
    'qr',
  ]),
  utm_medium: new Set([
    'cpc',
    'ppc',
    'paid',
    'paid_social',
    'social',
    'organic',
    'email',
    'referral',
    'display',
    'video',
    'sms',
    'qr',
    'print',
  ]),
  utm_campaign: new Set([]),
};

/**
 * What is sent for one campaign value: the value when its list names it,
 * `other` for any other campaign value, and nothing for an empty or
 * unreadable one.
 */
export function ownCampaignValue(key: string, value: unknown): string | null {
  const listed = CAMPAIGN_VALUES[key];
  if (listed === undefined || typeof value !== 'string' || value === '') return null;
  return listed.has(value) ? value : OTHER_VALUE;
}

/**
 * The other sites a referrer may name (spec E47): search engines, the social
 * sites this site links to, and Disaster Recovery's customer site. A visit
 * from any other site is sent with no referrer, as a direct visit.
 */
export const REFERRER_ORIGINS: ReadonlySet<string> = new Set([
  'https://www.google.com',
  'https://www.google.com.au',
  'https://www.google.co.nz',
  'https://www.bing.com',
  'https://duckduckgo.com',
  'https://search.yahoo.com',
  'https://www.facebook.com',
  'https://m.facebook.com',
  'https://l.facebook.com',
  'https://www.instagram.com',
  'https://l.instagram.com',
  'https://www.linkedin.com',
  'https://lnkd.in',
  'https://t.co',
  'https://www.youtube.com',
  'https://disasterrecovery.com.au',
  'https://www.disasterrecovery.com.au',
]);

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
 * nothing but campaign keys (plus the sign-up type on /signup), each at most
 * once. A key given twice could hide one value behind another, so it closes
 * the address.
 */
export function isOpenUrl(pathname: unknown, search: unknown): boolean {
  const path = normalisePath(pathname);
  if (path === null || !ANALYTICS_PATH_SET.has(path)) return false;
  const entries = queryEntries(search);
  if (entries === null) return false;
  const seen = new Set<string>();
  for (const [key, value] of entries) {
    if (seen.has(key)) return false;
    seen.add(key);
    if (UTM_KEY_SET.has(key)) continue;
    if (path === SIGNUP_PATH && key === SIGNUP_TYPE_KEY && SIGNUP_TYPES.has(value)) continue;
    return false;
  }
  return true;
}

/**
 * The address that is sent for a counted page: origin and path, plus the
 * campaign source, medium and name, each as `ownCampaignValue` gives it (its
 * listed value or `other`). Empty when the address is not open. The wire screen
 * accepts an address only when it equals what this builds, character for
 * character, so this is the one owner of what a sent address looks like.
 */
export function safeLocation(origin: unknown, pathname: unknown, search: unknown): string {
  if (typeof origin !== 'string' || !ORIGIN_SHAPE.test(origin)) return '';
  if (!isOpenUrl(pathname, search)) return '';
  const path = normalisePath(pathname) as string;
  const entries = queryEntries(search) ?? [];
  const kept: string[] = [];
  for (const key of SENT_UTM_KEYS) {
    const found = entries.find(([k]) => k === key);
    const own = found ? ownCampaignValue(key, found[1]) : null;
    if (own !== null) kept.push(`${key}=${own}`);
  }
  return `${origin}${path}${kept.length > 0 ? `?${kept.join('&')}` : ''}`;
}

/**
 * The referrer that is sent. This site: origin and path of a listed page,
 * otherwise empty. Another site: its origin, only when `REFERRER_ORIGINS`
 * names it (spec E47); otherwise empty. Unreadable: empty.
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
  return REFERRER_ORIGINS.has(url.origin) ? url.origin : '';
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

/** What an unlisted text value is sent as (spec E47). It never carries the value itself. */
export const OTHER_VALUE = 'other';

/**
 * The values each text parameter may take (spec E47), written from the values
 * this site's own code passes. A value not on its list is sent as `other`, so
 * the event is still counted but no text of the page's leaves. Add a value
 * here in the same change that first passes it.
 */
export const PARAM_VALUES: Readonly<Record<string, ReadonlySet<string>>> = {
  event_category: new Set([
    'Claim',
    'Contractor',
    'Callout',
    'Certification',
    'Engagement',
    'Outbound Link',
    'CTA',
    'Video',
    'Form',
    'Content',
    'Tool',
    'Search',
    'Conversion',
    'User',
  ]),
  claim_type: new Set([
    'water-damage',
    'flood',
    'storm-water',
    'burst-pipe',
    'bushfire',
    'house-fire',
    'smoke-damage',
    'cyclone',
    'severe-storm',
    'hailstorm',
    'wind-damage',
    'mould-remediation',
    'sewage-backup',
    'biohazard',
    'structural-damage',
    'roof-damage',
  ]),
  priority: new Set(['critical', 'urgent', 'high', 'medium']),
  method: new Set(['email']),
  step_name: new Set([]),
  service_type: new Set([]),
  content_type: new Set(['file']),
  file_type: new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'zip', 'jpg', 'png', 'mp4']),
  tool_name: new Set([]),
  tool_action: new Set([]),
  cta_name: new Set(['Contact Contractor', 'Book Consultation']),
  cta_location: new Set(['Profile Header']),
  conversion_name: new Set(['claim_submission', 'contractor_signup', 'sign_up']),
  link_domain: new Set(['www.linkedin.com', 'www.facebook.com', 'www.youtube.com', 'creators.spotify.com']),
  outbound: new Set(['true', 'false']),
  currency: new Set(['AUD']),
};

/**
 * The number parameters and the range each may take (spec E47). A number out
 * of its range is not sent. `value` is the one that may carry cents.
 */
export const NUMBER_RANGES: Readonly<Record<string, { max: number; cents: boolean }>> = {
  step_number: { max: 20, cents: false },
  scroll_depth: { max: 100, cents: false },
  time_on_page: { max: 86_400, cents: false },
  results_count: { max: 10_000, cents: false },
  value: { max: 100_000, cents: true },
  event_timeout: { max: 60_000, cents: false },
};

/** The one rule for a text parameter's value: itself when listed, else `other`. */
export function ownParamValue(name: string, value: string): string | null {
  const listed = PARAM_VALUES[name];
  if (listed === undefined) return null;
  return listed.has(value) ? value : OTHER_VALUE;
}

/** The one rule for a number parameter: the number when in its range, else null. */
export function ownNumber(name: string, value: number): number | null {
  const range = NUMBER_RANGES[name];
  if (range === undefined || !Number.isFinite(value) || value < 0 || value > range.max) return null;
  const scaled = range.cents ? value * 100 : value;
  return Math.abs(scaled - Math.round(scaled)) < 1e-9 ? value : null;
}

/**
 * Copy only what may be sent. A listed name passes with a number in its range,
 * true or false where its list names them, or text from its closed list (any
 * other text becomes `other`); `event_callback` passes as a function; the page
 * fields pass only when they equal the values this module computed.
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
    // Spec E47: numbers only within their parameter's range, text only from its
    // closed list (else `other`), true/false only where the list names them.
    if (typeof value === 'number') {
      if (ownNumber(name, value) !== null) out[name] = value;
      continue;
    }
    if (typeof value === 'boolean') {
      if (ownParamValue(name, String(value)) === String(value)) out[name] = value;
      continue;
    }
    if (typeof value === 'string') {
      const own = ownParamValue(name, value);
      if (own !== null) out[name] = own;
    }
  }
  return out;
}

/**
 * The event names this site sends (spec E47): the ones its own code names, and
 * the two the Google library sends on its own (`page_view` is sent by this
 * site; `user_engagement` by the library). A closed list, so a name can never
 * carry data. The form and video names in src/hooks/useGA4.ts are left off:
 * no page sends them, and they are also names the library's automatic
 * measurement uses. Add a name here in the same change that first sends it.
 */
export const EVENT_NAMES: ReadonlySet<string> = new Set([
  'page_view',
  'user_engagement',
  'claim_started',
  'claim_step_completed',
  'claim_submitted',
  'claim_abandoned',
  'contractor_inquiry',
  'contractor_signup_started',
  'contractor_signup_completed',
  'contractor_signup',
  'certification_purchase',
  'callout_paid',
  'contractor_profile_viewed',
  'contractor_contacted',
  'content_download',
  'content_shared',
  'tool_interaction',
  'calculator_used',
  'quote_requested',
  'search',
  'filter_applied',
  'cta_clicked',
  'generate_lead',
  'sign_up',
  'login',
  'scroll_depth',
  'time_on_page',
  'click',
  'conversion',
]);

/** An event name on the closed list; anything else is not sent. */
export function isSafeEventName(name: unknown): name is string {
  return typeof name === 'string' && EVENT_NAMES.has(name);
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

// The host lists live in one file the proof scripts read too (spec E44), so
// the proof can never call fewer hosts Google than the site does.
const COLLECTION_HOSTS: readonly string[] = googleHosts.collectionHosts;
const TAG_HOST: string = googleHosts.tagHost;
const GOOGLE_SITE_HOST = new RegExp(googleHosts.googleSitePattern);
/** The library file, exactly as the browser writes it (spec E40). */
const LIBRARY_ADDRESS = /^https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-[A-Z0-9]{4,20}$/;

function hostIs(host: string, name: string): boolean {
  return host === name || host.endsWith(`.${name}`);
}

/** True for a host Google owns: the collection hosts, the tag host, and google.*. */
function isGoogleHost(hostname: string): boolean {
  // "example.com." and "example.com" are the same host to the browser.
  const host = hostname.toLowerCase().replace(/\.$/, '');
  return COLLECTION_HOSTS.some((name) => hostIs(host, name)) || hostIs(host, TAG_HOST) || GOOGLE_SITE_HOST.test(host);
}

function parseWebAddress(url: unknown): URL | null {
  if (typeof url !== 'string' || url === '') return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed : null;
  } catch {
    return null;
  }
}

/** True for an absolute web address on a host Google owns, the library file included. */
export function isGoogleAddress(url: unknown): boolean {
  const parsed = parseWebAddress(url);
  return parsed !== null && isGoogleHost(parsed.hostname);
}

/** The ways a page can make a request that the wire guard watches. */
export type WayOut = 'fetch' | 'beacon' | 'xhr' | 'image' | 'script';

/**
 * What the wire guard does with a request, decided from the whole request:
 * the way out and the address together (spec E42), in this one place.
 *
 * - `pass`: not a Google address; left alone.
 * - `library`: a script element loading the exact library file. The only
 *   exception, and only for that way out; the caller allows it only while the
 *   visitor's yes stands.
 * - `screen`: fetch or beacon to any Google address, the library address
 *   included: the yes is re-read and every event is screened.
 * - `shut`: XMLHttpRequest, an image, or a script element to any other Google
 *   address; the site never uses these for analytics.
 */
export function wireRoute(way: WayOut, url: unknown): 'pass' | 'library' | 'screen' | 'shut' {
  const parsed = parseWebAddress(url);
  if (parsed === null || !isGoogleHost(parsed.hostname)) return 'pass';
  if (way === 'script' && LIBRARY_ADDRESS.test(parsed.href)) return 'library';
  return way === 'fetch' || way === 'beacon' ? 'screen' : 'shut';
}

export interface WireContext {
  /** This site's own origin. */
  origin: string;
  /** The one Analytics property this site sends to. */
  measurementId: string;
  /**
   * The site's own fields for the next hit that will be sent (spec E47), one
   * call per such hit, in order; null when they cannot be had, and then
   * nothing is sent. Without it the screen sends nothing.
   */
  own?: (isPageView: boolean) => OwnHitFields | null;
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
   * body that is not text, a field given twice, or a field that is neither
   * ruled nor one of the library's own (spec E46). The Google library does not
   * send these today.
   */
  unreadable: boolean;
  /** Events taken out of a request whose other events were sent. */
  trimmed: number;
}

const NUMBER_VALUE = /^-?\d{1,15}(\.\d{1,10})?(e[+-]?\d{1,3})?$/i;
/** Fields with a rule of their own below. */
const RULED_FIELDS: ReadonlySet<string> = new Set(['tid', 'en', 'dl', 'dr', 'dt', 'dp']);

/**
 * The names of the Google library's own fields (spec E46), as seen in this
 * work's captures. Since spec E47 their values are never read for sending: the
 * site sends its own fields in their place (`OwnHitFields`). A field that is
 * neither one of these nor ruled above still stops its event and counts as
 * unreadable, so the page's one warning reports it (spec E24). The proof
 * checker keeps its own copy of what may leave (scripts/analytics-proof/lib/checker.mjs).
 */
const LIBRARY_FIELD_NAMES: ReadonlySet<string> = new Set([
  'v', 'gtm', '_p', 'gcs', 'gcd', 'npa', 'dma', 'dma_cps', '_eu', 'ae', 'are', 'cid', 'frm', 'ngs', 'pscdl',
  'rcb', 'sr', 'uaa', 'uab', 'uafvl', 'uam', 'uamb', 'uap', 'uapv', 'uaw', 'ul', '_s', 'tag_exp', 'sid',
  'sct', 'seg', '_tu', '_fv', '_nsi', '_ss', '_ee', '_et', 'tfd',
]);

/**
 * The one place hits are sent to (spec E47): Google's collection path on the
 * hosts the library was seen using. A host or path is text too, so it is a
 * closed list like every other part of a sent hit.
 */
const COLLECT_HOSTS: ReadonlySet<string> = new Set([
  'www.google-analytics.com',
  'region1.google-analytics.com',
  'analytics.google.com',
]);
const COLLECT_PATH = '/g/collect';

/** The address a rebuilt hit is sent to, or null when the request was not to it. */
function collectTarget(url: string): string | null {
  const parsed = parseWebAddress(url);
  if (parsed === null || parsed.protocol !== 'https:' || parsed.port !== '' || parsed.username !== '') return null;
  if (!COLLECT_HOSTS.has(parsed.hostname) || parsed.pathname !== COLLECT_PATH || parsed.hash !== '') return null;
  return `https://${parsed.hostname}${COLLECT_PATH}`;
}

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

// ---------------------------------------------------------------------------
// The hit fields the site keeps itself (spec E47)
// ---------------------------------------------------------------------------

/**
 * The one key that holds the site's own visitor and session record. It is
 * written only while the visitor's yes stands and removed when they say no.
 */
export const OWN_STATE_KEY = 'nrpg_analytics_own';
/** A session ends after half an hour without a hit, as Google counts them. */
export const SESSION_IDLE_MS = 30 * 60 * 1000;
/**
 * How long one visitor id is kept: the 12 months the cookie policy states for
 * the analytics identifiers, counted from the first visit (spec E48). The
 * analytics cookies take their lifetime from this too.
 */
export const ANALYTICS_ID_LIFETIME_SECONDS = 365 * 24 * 60 * 60;
/** A session counts as engaged after ten seconds or a second page view. */
const ENGAGED_MS = 10_000;
const MAX_HITS = 10_000;
const MAX_SESSIONS = 100_000;
/** The visitor id the site mints: nine random digits, a dot, the first visit's second. */
export const OWN_CLIENT_ID = /^[1-9]\d{8}\.[1-9]\d{9}$/;
const OWN_SECONDS = /^[1-9]\d{9}$/;
/** Seconds since 1970 that a session id may name: 2001 to 2286. */
const MIN_SECONDS = 1_000_000_000;
const MAX_SECONDS = 9_999_999_999;

/** The site's own record of this visitor, kept beside the visitor's yes. */
export interface OwnState {
  cid: string;
  sct: number;
  sid: number;
  startAt: number;
  lastAt: number;
  hits: number;
  views: number;
}

/** The fields of one hit that the site makes itself, never the library. */
export interface OwnHitFields {
  cid: string;
  sid: string;
  sct: string;
  seg: '0' | '1';
  _s: string;
  _et?: string;
  _fv?: '1';
  _ss?: '1';
  _nsi?: '1';
}

function isCount(value: unknown, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= max;
}

function isTime(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= MIN_SECONDS * 1000 && value <= MAX_SECONDS * 1000;
}

/**
 * The stored record, or null when there is none that this code could have
 * written: any other shape, an extra key, or a value out of range starts a new
 * visitor, so nothing stored by anyone else is ever sent.
 */
export function readOwnState(text: unknown): OwnState | null {
  if (typeof text !== 'string' || text.length > 400) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
  const record = parsed as Record<string, unknown>;
  const keys = Object.keys(record).sort().join(',');
  if (keys !== 'cid,hits,lastAt,sct,sid,startAt,views') return null;
  const { cid, sct, sid, startAt, lastAt, hits, views } = record;
  if (typeof cid !== 'string' || !OWN_CLIENT_ID.test(cid)) return null;
  if (!isCount(sct, MAX_SESSIONS) || sct < 1 || !isCount(hits, MAX_HITS) || !isCount(views, MAX_HITS)) return null;
  if (!isCount(sid, MAX_SECONDS) || sid < MIN_SECONDS || !isTime(startAt) || !isTime(lastAt)) return null;
  if (startAt > lastAt || Math.floor(startAt / 1000) !== sid) return null;
  if (firstVisitSeconds(cid) > sid) return null;
  return { cid, sct, sid, startAt, lastAt, hits, views };
}

/** The first visit's second, from the visitor id the site minted. */
function firstVisitSeconds(cid: string): number {
  return Number(cid.slice(cid.indexOf('.') + 1));
}

/**
 * True when the record's visitor id has reached its lifetime, or names a first
 * visit after the clock's now (spec E48). Such a record is never sent from
 * again: the next hit starts a new visitor and replaces it.
 */
export function ownStateExpired(state: OwnState, nowMs: number): boolean {
  const first = firstVisitSeconds(state.cid);
  return nowMs < first * 1000 || nowMs >= (first + ANALYTICS_ID_LIFETIME_SECONDS) * 1000;
}

/** A new visitor id from the site's own random source and clock. */
export function mintClientId(nowMs: number, random: () => number): string | null {
  const seconds = Math.floor(nowMs / 1000);
  const draw = random();
  if (!Number.isFinite(draw) || draw < 0 || draw >= 1) return null;
  const id = `${100_000_000 + Math.floor(draw * 900_000_000)}.${seconds}`;
  return OWN_CLIENT_ID.test(id) ? id : null;
}

/**
 * The site's own fields for the next hit, and the record to store after it.
 * Everything here comes from the stored record, the clock and the random
 * source: nothing the page or the library wrote into the request.
 */
export function nextOwnHit(
  state: OwnState | null,
  nowMs: number,
  random: () => number,
  isPageView: boolean,
): { state: OwnState; fields: OwnHitFields } | null {
  if (!isTime(nowMs)) return null;
  if (state !== null && ownStateExpired(state, nowMs)) state = null;
  const firstVisit = state === null;
  const cid = state === null ? mintClientId(nowMs, random) : state.cid;
  if (cid === null) return null;
  const newSession = state === null || nowMs - state.lastAt > SESSION_IDLE_MS || nowMs < state.lastAt;
  const sct = newSession ? Math.min((state?.sct ?? 0) + 1, MAX_SESSIONS) : (state as OwnState).sct;
  const startAt = newSession ? nowMs : (state as OwnState).startAt;
  const sid = Math.floor(startAt / 1000);
  const hits = Math.min((newSession ? 0 : (state as OwnState).hits) + 1, MAX_HITS);
  const views = Math.min((newSession ? 0 : (state as OwnState).views) + (isPageView ? 1 : 0), MAX_HITS);
  const engaged = nowMs - startAt >= ENGAGED_MS || views >= 2;
  const fields: OwnHitFields = { cid, sid: String(sid), sct: String(sct), seg: engaged ? '1' : '0', _s: String(hits) };
  if (!newSession) fields._et = String(Math.min(nowMs - (state as OwnState).lastAt, SESSION_IDLE_MS));
  if (firstVisit) fields._fv = '1';
  if (newSession) {
    fields._ss = '1';
    fields._nsi = '1';
  }
  return { state: { cid, sct, sid, startAt, lastAt: nowMs, hits, views }, fields };
}

/** The own fields in the order they are sent, or null when one is not in its form. */
function ownEntries(own: OwnHitFields | null): Array<[string, string]> | null {
  if (own === null || typeof own !== 'object') return null;
  const entries: Array<[string, string]> = [];
  const add = (key: string, value: unknown, valid: boolean): boolean => {
    if (!valid || typeof value !== 'string') return false;
    entries.push([key, value]);
    return true;
  };
  const { cid, sid, sct, seg, _s: hit, _et: engagement, _fv: firstVisit, _ss: sessionStart, _nsi: newSession } = own;
  const count = (value: unknown, max: number) => typeof value === 'string' && /^[1-9]\d{0,5}$/.test(value) && Number(value) <= max;
  if (!add('cid', cid, typeof cid === 'string' && OWN_CLIENT_ID.test(cid))) return null;
  if (!add('sid', sid, typeof sid === 'string' && OWN_SECONDS.test(sid))) return null;
  if (!add('sct', sct, count(sct, MAX_SESSIONS))) return null;
  if (!add('seg', seg, seg === '0' || seg === '1')) return null;
  if (!add('_s', hit, count(hit, MAX_HITS))) return null;
  if (engagement !== undefined) {
    const valid = typeof engagement === 'string' && /^(0|[1-9]\d{0,6})$/.test(engagement) && Number(engagement) <= SESSION_IDLE_MS;
    if (!add('_et', engagement, valid)) return null;
  }
  for (const [key, flag] of [['_fv', firstVisit], ['_ss', sessionStart], ['_nsi', newSession]] as const) {
    if (flag !== undefined && !add(key, flag, flag === '1')) return null;
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Rebuilding a hit (spec E47)
// ---------------------------------------------------------------------------

/**
 * One event as the site will send it, built from the request's event, or
 * null when the event breaks a rule. Every value in the result is a constant,
 * a member of a closed list in this file, or (added later) one of the site's
 * own fields: nothing is copied from the request as it was written.
 */
function buildEvent(fields: Map<string, string>, context: WireContext, notes?: WireNotes): Array<[string, string]> | null {
  const property = fields.get('tid');
  if (property !== undefined && property !== context.measurementId) return null;
  const eventName = fields.get('en');
  if (eventName === undefined || !isSafeEventName(eventName)) return null;
  const address = fields.get('dl');
  if (address === undefined) return null;
  const path = cleanAddressPath(address, context.origin);
  if (path === null) return null;
  const title = PAGE_TITLES[path];
  const referrer = fields.get('dr');
  if (referrer !== undefined && !cleanReferrer(referrer, context.origin)) return null;
  const sentTitle = fields.get('dt');
  if (sentTitle !== undefined && sentTitle !== '' && sentTitle !== title) return null;
  const pagePath = fields.get('dp');
  if (pagePath !== undefined && pagePath !== path) return null;

  const params: Array<[string, string]> = [];
  for (const [key, value] of fields) {
    if (RULED_FIELDS.has(key)) continue;
    if (key === 'uid' || key.startsWith('up.') || key.startsWith('upn.')) return null;
    if (key.startsWith('ep.')) {
      const name = key.slice(3);
      if (!ALLOWED_EVENT_PARAMS.has(name) || name === 'event_callback') return null;
      if (name === 'page_location') {
        if (value !== address) return null;
        params.push([key, address]);
      } else if (name === 'page_referrer') {
        if (!cleanReferrer(value, context.origin)) return null;
        params.push([key, value]);
      } else if (name === 'page_title') {
        if (value !== title) return null;
        params.push([key, title]);
      } else if (name === 'page_path') {
        if (value !== path) return null;
        params.push([key, path]);
      } else {
        const own = ownParamValue(name, value);
        if (own === null) return null;
        params.push([key, own]);
      }
      continue;
    }
    if (key.startsWith('epn.')) {
      if (!NUMBER_VALUE.test(value)) return null;
      const own = ownNumber(key.slice(4), Number(value));
      if (own === null) return null;
      params.push([key, String(own)]);
      continue;
    }
    // The library's own fields are not read for sending (spec E47).
    if (LIBRARY_FIELD_NAMES.has(key)) continue;
    if (notes) notes.unreadable = true;
    return null;
  }

  const built: Array<[string, string]> = [['en', eventName], ['dl', address], ['dt', title]];
  if (pagePath !== undefined) built.push(['dp', path]);
  if (referrer !== undefined && referrer !== '') built.push(['dr', referrer]);
  return [...built, ...params];
}

/**
 * The part of a batched request that every event in it shares. A field there
 * may be missing, but one that is present must still pass its rule, so a
 * shared part naming a closed page or another property stops the batch even
 * when each event names a clean one.
 */
function sharedAllowed(fields: Map<string, string>, context: WireContext, notes?: WireNotes): boolean {
  const property = fields.get('tid');
  if (property !== undefined && property !== context.measurementId) return false;
  const eventName = fields.get('en');
  if (eventName !== undefined && !isSafeEventName(eventName)) return false;
  const address = fields.get('dl');
  if (address !== undefined && cleanAddressPath(address, context.origin) === null) return false;
  const referrer = fields.get('dr');
  if (referrer !== undefined && !cleanReferrer(referrer, context.origin)) return false;
  for (const key of fields.keys()) {
    if (key === 'uid' || key.startsWith('up.') || key.startsWith('upn.')) return false;
    if (RULED_FIELDS.has(key) || LIBRARY_FIELD_NAMES.has(key) || key.startsWith('ep.') || key.startsWith('epn.')) continue;
    if (notes) notes.unreadable = true;
    return false;
  }
  return true;
}

function encodeFields(entries: Array<[string, string]>): string {
  return entries.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
}

/**
 * Screen one request to Google and build what is sent in its place (spec E47).
 * Returns the site's own rebuilt request, holding only the events that passed
 * every rule, or null when nothing may leave. The request the library wrote
 * is never sent as it is: it decides only which events are counted.
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
  if (typeof url !== 'string' || !isGoogleAddress(url)) return null;
  if (!context || typeof context.origin !== 'string' || !ORIGIN_SHAPE.test(context.origin)) return null;
  if (!isMeasurementId(context.measurementId) || typeof context.own !== 'function') return null;
  const target = collectTarget(url);
  if (target === null) return null;
  const shared = wireFields(new URL(url).search);
  if (shared === null) return unreadable();

  const hasBody = !(body === undefined || body === null || body === '');
  const events: Array<Map<string, string> | null> = [];
  if (!hasBody) {
    events.push(shared);
  } else {
    if (typeof body !== 'string') return unreadable();
    if (!sharedAllowed(shared, context, notes)) return null;
    for (const line of body.split(/\r?\n/)) {
      if (line === '') continue;
      const own = wireFields(line);
      if (own === null) {
        if (notes) notes.unreadable = true;
        events.push(null);
        continue;
      }
      const event = new Map(shared);
      for (const [key, value] of own) event.set(key, value);
      events.push(event);
    }
  }

  const built: Array<Array<[string, string]>> = [];
  for (const event of events) {
    if (event === null) continue;
    const fields = buildEvent(event, context, notes);
    if (fields !== null) built.push(fields);
  }
  if (built.length === 0) return null;

  const lines: string[] = [];
  for (const fields of built) {
    const own = ownEntries(context.own(fields[0][1] === 'page_view'));
    if (own === null) return null;
    lines.push(encodeFields([...fields, ...own]));
  }
  if (notes) notes.trimmed += events.length - built.length;
  const head = `${target}?${encodeFields([['v', '2'], ['tid', context.measurementId], ['npa', '1']])}`;
  if (!hasBody && lines.length === 1) return { url: `${head}&${lines[0]}`, body: undefined };
  return { url: head, body: lines.join('\n') };
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
