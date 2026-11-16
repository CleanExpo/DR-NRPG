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
/** A lower-case slug: words of letters and digits joined by single - or _. */
const CAMPAIGN_SLUG = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;
/** More than four digits in a row could be a phone, account or claim number. */
const LONG_DIGIT_RUN = /\d{5,}/;

/**
 * The one rule for a campaign value that may be sent: a lower-case slug of at
 * most 100 characters with no run of more than four digits. A name written by
 * the campaign's author as a slug (`jane-smith`) still passes; nothing here
 * can tell it from a word.
 */
export function isCampaignValue(value: unknown): value is string {
  return (
    typeof value === 'string' && value.length <= 100 && CAMPAIGN_SLUG.test(value) && !LONG_DIGIT_RUN.test(value)
  );
}
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
 * campaign source, medium and name when each is a campaign value
 * (`isCampaignValue`). Empty when the address is not open. The wire screen
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
    if (found && isCampaignValue(found[1])) {
      kept.push(`${key}=${found[1]}`);
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

/**
 * Short, plain text: no @, slash, question mark, equals or ampersand, and no
 * percent sign, because a percent sign can spell any of those in escaped form.
 */
const PLAIN_VALUE = /^[A-Za-z0-9][A-Za-z0-9 _.:\-]{0,99}$/;

const PERCENT_ESCAPE = /%[0-9A-Fa-f]{2}/;
const PERCENT_ESCAPES = /%[0-9A-Fa-f]{2}/g;
const MAX_UNESCAPES = 4;

/**
 * Every reading of a value: as given, then with its percent escapes undone,
 * round after round until nothing changes. Null when it is escaped more
 * deeply than the rounds allowed, which the caller treats as unreadable.
 */
function everyReading(value: string): string[] | null {
  const readings = [value];
  let current = value;
  for (let round = 0; round < MAX_UNESCAPES; round += 1) {
    const next = current.replace(PERCENT_ESCAPES, (escape) => String.fromCharCode(parseInt(escape.slice(1), 16)));
    if (next === current) return readings;
    readings.push(next);
    current = next;
  }
  return PERCENT_ESCAPE.test(current) ? null : readings;
}

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
   * body that is not text, a field given twice, a field that is not one of the
   * library's own, or a library field whose value is out of its shape (spec
   * E46). The Google library does not send these today.
   */
  unreadable: boolean;
  /** Events taken out of a request whose other events were sent. */
  trimmed: number;
}

const FIXED_TITLES: ReadonlySet<string> = new Set(Object.values(PAGE_TITLES));
const NUMBER_VALUE = /^-?\d{1,15}(\.\d{1,10})?(e[+-]?\d{1,3})?$/i;
/** Fields with a rule of their own below. */
const RULED_FIELDS: ReadonlySet<string> = new Set(['tid', 'en', 'dl', 'dr', 'dt', 'dp']);

const DIGITS = /^\d{1,20}$/;
const BRAND_VERSION = /^\d{1,5}(?:\.\d{1,5}){0,3}$/;
/** A browser's own name: letters and spaces, as "Google Chrome" or "Chromium". */
const BRAND_NAME = /^[A-Za-z][A-Za-z ]{0,39}$/;
/** The made-up brand Chromium adds to its list ("Not.A/Brand", "Not_A Brand"). */
const GREASE_BRAND = /^Not[ ()\-./:;=?_]A[ ()\-./:;=?_]Brand$/;

/** The browser's brand list: up to ten `brand;version` items joined by `|`. */
function isBrandList(value: string): boolean {
  const items = value.split('|');
  if (items.length > 10) return false;
  return items.every((item) => {
    const parts = item.split(';');
    if (parts.length !== 2 || !BRAND_VERSION.test(parts[1])) return false;
    // The library escapes the brand, so it is judged in its fully unescaped form.
    const readings = everyReading(parts[0]);
    if (readings === null) return false;
    const brand = readings[readings.length - 1];
    return BRAND_NAME.test(brand) || GREASE_BRAND.test(brand);
  });
}

function shaped(pattern: RegExp): (value: string) => boolean {
  return (value) => pattern.test(value);
}

/**
 * The Google library's own fields (spec E46): every name it was seen sending
 * in this work's captures, each with the one shape its value may take. A field
 * not named here, or a value out of its shape, is not sent, and the event
 * counts as unreadable so the page's one warning reports it (spec E24). Widen
 * this list only from a captured real request, never by guess. The proof
 * checker keeps its own copy (scripts/analytics-proof/lib/checker.mjs).
 */
const LIBRARY_FIELDS: ReadonlyMap<string, (value: string) => boolean> = new Map([
  ['v', shaped(/^2$/)],
  ['gtm', shaped(/^\d{2}[a-z0-9]{1,78}$/)],
  ['_p', shaped(DIGITS)],
  ['gcs', shaped(/^G\d{3}$/)],
  ['gcd', shaped(/^\d{2}(?:[a-z]\d){1,14}$/)],
  ['npa', shaped(DIGITS)],
  ['dma', shaped(DIGITS)],
  ['dma_cps', shaped(/^(?:-|[a-z]{1,12})$/)],
  ['_eu', shaped(/^[A-Za-z0-9_-]{1,12}$/)],
  ['ae', shaped(/^[a-z]{1,4}$/)],
  ['are', shaped(DIGITS)],
  ['cid', shaped(/^\d{1,12}\.\d{1,12}$/)],
  ['frm', shaped(DIGITS)],
  ['ngs', shaped(DIGITS)],
  ['pscdl', shaped(/^[a-z]{1,12}$/)],
  ['rcb', shaped(DIGITS)],
  ['sr', shaped(/^\d{1,5}x\d{1,5}$/)],
  ['uaa', shaped(/^[a-z0-9_]{0,12}$/)],
  ['uab', shaped(DIGITS)],
  ['uafvl', isBrandList],
  ['uam', shaped(/^[A-Za-z0-9 ._-]{0,40}$/)],
  ['uamb', shaped(DIGITS)],
  ['uap', shaped(/^[A-Za-z ]{0,30}$/)],
  ['uapv', shaped(/^[0-9.]{0,24}$/)],
  ['uaw', shaped(DIGITS)],
  ['ul', shaped(/^[a-z]{2,3}(?:-[a-z0-9]{2,8}){0,2}$/i)],
  ['_s', shaped(DIGITS)],
  ['tag_exp', shaped(/^\d{1,12}(?:~\d{1,12}){0,60}$/)],
  ['sid', shaped(DIGITS)],
  ['sct', shaped(DIGITS)],
  ['seg', shaped(DIGITS)],
  ['_tu', shaped(/^[A-Za-z0-9_-]{1,12}$/)],
  ['_fv', shaped(DIGITS)],
  ['_nsi', shaped(DIGITS)],
  ['_ss', shaped(DIGITS)],
  ['_ee', shaped(DIGITS)],
  ['_et', shaped(DIGITS)],
  ['tfd', shaped(DIGITS)],
]);

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
    // Any other field must be one of the library's own, with its value in the
    // one shape that field takes (spec E46). Nothing the rules do not name is sent.
    const shape = LIBRARY_FIELDS.get(key);
    if (shape === undefined || !shape(value)) {
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
  if (typeof url !== 'string' || !isGoogleAddress(url)) return null;
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
