/**
 * Google Analytics 4 for nrpg.business.
 *
 * One rule decides everything in this file: the gate. It is open only when
 * the visitor has said yes to analytics under the current cookie notice, the
 * page is on the list of pages that may be counted, and the address carries
 * no query key except campaign keys. The gate is worked out from live state
 * every time it is asked. Nothing caches it.
 *
 * Every send goes through one private function, send(), which asks the gate,
 * cleans the parameters against an allow-list, and only then queues the call
 * for the Google library. The rules themselves live in ./analytics-gate.
 *
 * The Google library sends later than it is asked to, and can add events of
 * its own. So there is a second check, the wire guard, at the point where a
 * request leaves the browser: the visitor's "yes" must still stand, and each
 * event in the request must pass the same rules again. If the wire guard
 * cannot be put in place, the gate stays closed.
 *
 * @module analytics
 */

import {
  CONSENT_CHANGED_EVENT,
  CONSENT_STORAGE_KEY,
  CONSENT_TIMESTAMP_KEY,
  CONSENT_VERSION_KEY,
  PAGE_TITLES,
  type TrustedPage,
  type WayOut,
  isMeasurementId,
  isOpenUrl,
  isSafeEventName,
  normalisePath,
  readStoredConsent,
  safeLocation,
  safeReferrer,
  sanitiseParams,
  screenCollect,
  wireRoute,
} from './analytics-gate';
import type { ScreenedRequest, WireNotes } from './analytics-gate';

// Types for GA4 events
export interface GA4EventParams {
  [key: string]: string | number | boolean | undefined;
}

export interface ClaimEvent {
  claim_id?: string;
  claim_type?: string;
  claim_value?: number;
  step_name?: string;
  step_number?: number;
}

export interface ContractorEvent {
  contractor_id?: string;
  contractor_name?: string;
  service_type?: string;
  location?: string;
}

export interface ContentEvent {
  content_id?: string;
  content_type?: string;
  content_name?: string;
  file_type?: string;
  file_size?: number;
}

export interface ToolEvent {
  tool_name?: string;
  tool_action?: string;
  tool_value?: string;
}

export interface PageViewEvent {
  page_title?: string;
  page_location?: string;
  page_path?: string;
}

// GA4 Event Names (Custom Events)
export const GA4_EVENTS = {
  // Claim Events
  CLAIM_STARTED: 'claim_started',
  CLAIM_STEP_COMPLETED: 'claim_step_completed',
  CLAIM_SUBMITTED: 'claim_submitted',
  CLAIM_ABANDONED: 'claim_abandoned',

  // Contractor Events
  CONTRACTOR_INQUIRY: 'contractor_inquiry',
  CONTRACTOR_SIGNUP_STARTED: 'contractor_signup_started',
  CONTRACTOR_SIGNUP_COMPLETED: 'contractor_signup_completed',
  CONTRACTOR_SIGNUP: 'contractor_signup',
  CERTIFICATION_PURCHASE: 'certification_purchase',
  CALLOUT_PAID: 'callout_paid',
  CONTRACTOR_PROFILE_VIEWED: 'contractor_profile_viewed',
  CONTRACTOR_CONTACTED: 'contractor_contacted',

  // Content & Engagement
  CONTENT_DOWNLOAD: 'content_download',
  CONTENT_SHARED: 'content_shared',
  VIDEO_PLAYED: 'video_start',
  VIDEO_COMPLETED: 'video_complete',

  // Tool Interactions
  TOOL_INTERACTION: 'tool_interaction',
  CALCULATOR_USED: 'calculator_used',
  QUOTE_REQUESTED: 'quote_requested',

  // User Journey
  SEARCH_PERFORMED: 'search',
  FILTER_APPLIED: 'filter_applied',
  CTA_CLICKED: 'cta_clicked',

  // Conversions
  LEAD_GENERATED: 'generate_lead',
  SIGN_UP: 'sign_up',
  LOGIN: 'login',

  // Engagement
  SCROLL_DEPTH: 'scroll_depth',
  TIME_ON_PAGE: 'time_on_page',
  OUTBOUND_LINK: 'click',
} as const;

// GA4 Configuration
export interface GA4Config {
  measurementId: string;
  debug?: boolean;
  cookiePrefix?: string;
  cookieDomain?: string;
  cookieExpires?: number;
  anonymizeIp?: boolean;
}

/** How a send ended. 'closed' means the gate (or a rule) said no. */
type SendResult = 'sent' | 'closed' | 'error';

/** How trackEventAndWait ended. It never rejects. */
export type WaitResult = 'callback' | 'timeout' | 'closed' | 'error';

const COOKIE_PREFIX = 'nrpg';
const COOKIE_EXPIRES_SECONDS = 365 * 24 * 60 * 60;

// ---------------------------------------------------------------------------
// State for this page load. None of it decides whether the gate is open.
// ---------------------------------------------------------------------------

function measurementIdFromBuild(): string {
  const id = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  return isMeasurementId(id) ? id : '';
}

let measurementId = measurementIdFromBuild();
let debugMode = false;
/** consent, clock and configuration have been queued on this page load. */
let configured = false;
/** We told Google "no" and have not yet told it "yes" again. */
let consentDenied = false;
/** The page fields this module worked out for the page being viewed. */
let currentPage: TrustedPage | null = null;
/** The clean address of the last page view sent (the next page's referrer). */
let lastViewedLocation = '';
/** Stops the same page being counted twice in a row. */
let lastCountedLocation = '';
/** The kinds of warning already sent on this page load. */
const reported = new Set<string>();
/**
 * The visitor said no on this page load: the stored choice as it stood at that
 * moment, or null when there has been no "no". While storage still reads the
 * same, the "no" stands, even if the browser could not save it.
 */
let withdrawnAgainst: string | null = null;
/** How many requests to Google the wire guard has stopped or trimmed. */
let wireStopped = 0;
/** Where that number is shown on the page, for the proof scripts. No values. */
const WIRE_STOPPED_ATTRIBUTE = 'data-nrpg-wire-dropped';

interface InstalledGuards {
  pushState: History['pushState'];
  replaceState: History['replaceState'];
  ownPushState: boolean;
  ownReplaceState: boolean;
  onPopState: () => void;
  onPageShow: () => void;
  onStorage: (event: StorageEvent) => void;
}

let guards: InstalledGuards | null = null;

/** The wire guard is in place on this page load. */
let wireReady = false;
/** It could not be put in place; the gate stays closed and we do not retry. */
let wireFailed = false;
/** How to take each part of the wire guard out again (tests only). */
let wireUndo: Array<() => void> = [];

// ---------------------------------------------------------------------------
// Reporting a failure of the gate itself
// ---------------------------------------------------------------------------

function errorClass(error: unknown): string {
  const name = (error as { name?: unknown } | null)?.name;
  return typeof name === 'string' && /^[A-Za-z]{1,40}$/.test(name) ? name : 'Unknown';
}

/**
 * One warning per kind per page load (the kind is the function name), so an
 * earlier warning cannot hide a later one of a different kind. Only the
 * function name and the error class are sent: no address, no parameters, no
 * consent value. The report is loaded on demand so the gate never depends on it.
 */
function report(fn: string, kind: string, message = 'analytics gate failed closed'): void {
  if (reported.has(fn)) return;
  reported.add(fn);
  try {
    void import('@sentry/nextjs')
      .then((Sentry) => {
        Sentry.captureMessage(message, {
          level: 'warning',
          tags: { analytics_fn: fn, error_class: kind },
        });
      })
      .catch(() => undefined);
  } catch {
    // Reporting must never break the page.
  }
}

// ---------------------------------------------------------------------------
// The gate
// ---------------------------------------------------------------------------

/**
 * True when a hit may be sent right now for the current address, or for
 * `targetUrl` when one is given (used just before a move to another page).
 */
export function gateOpen(targetUrl?: string | URL | null): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (!measurementId) return false;
    if (!wireGuardReady()) return false;
    if (withdrawnThisLoad()) return false;
    const consent = readStoredConsent(window.localStorage);
    if (!consent || consent.analytics !== true) return false;
    if (targetUrl === undefined || targetUrl === null || targetUrl === '') {
      return isOpenUrl(window.location.pathname, window.location.search);
    }
    const destination = new URL(String(targetUrl), window.location.href);
    if (destination.origin !== window.location.origin) return false;
    return isOpenUrl(destination.pathname, destination.search);
  } catch (error) {
    // A browser that blocks storage is an ordinary "no", not a fault.
    const kind = errorClass(error);
    if (kind !== 'SecurityError') report('gateOpen', kind);
    return false;
  }
}

/**
 * Set Google's own off switch for this property from the gate. This is the
 * only place that writes it. Returns whether the gate is open.
 */
export function syncGate(targetUrl?: string | URL | null): boolean {
  if (typeof window === 'undefined') return false;
  if (!measurementId) {
    if (process.env.NODE_ENV === 'production') report('syncGate', 'EmptyMeasurementId');
    return false;
  }
  const open = gateOpen(targetUrl);
  try {
    (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = !open;
  } catch {
    return false;
  }
  return open;
}

// ---------------------------------------------------------------------------
// The wire guard: the same rules again, where a request leaves the browser
// ---------------------------------------------------------------------------

/** An absolute address for whatever a caller handed to fetch and friends. */
function absoluteUrl(target: unknown): string {
  try {
    if (typeof target === 'string') return new URL(target, window.location.href).href;
    if (target instanceof URL) return target.href;
    const url = (target as { url?: unknown } | null)?.url;
    return typeof url === 'string' ? new URL(url, window.location.href).href : '';
  } catch {
    return '';
  }
}

/** The stored choice and when it was stored, as one string to compare. */
function storedChoiceStamp(): string {
  try {
    const storage = window.localStorage;
    return `${storage.getItem(CONSENT_STORAGE_KEY)}|${storage.getItem(CONSENT_TIMESTAMP_KEY)}`;
  } catch {
    return 'unreadable';
  }
}

/**
 * True while a "no" given on this page load stands. It stands until a later
 * choice is actually stored: a "no" the browser could not save leaves the old
 * "yes" in storage, and that old "yes" must not reopen anything.
 */
function withdrawnThisLoad(): boolean {
  if (withdrawnAgainst === null) return false;
  if (storedChoiceStamp() === withdrawnAgainst) return true;
  withdrawnAgainst = null;
  return false;
}

/** Count a request the guard stopped or trimmed; warn once if it could not be read. */
function noteStopped(unreadable: boolean): void {
  wireStopped += 1;
  try {
    document.documentElement.setAttribute(WIRE_STOPPED_ATTRIBUTE, String(wireStopped));
  } catch {
    // No document to write on: the count is for the proof scripts only.
  }
  // The Google library is not pinned. If it starts sending in a form the
  // rules cannot read, every hit stops here while the page believes each was
  // sent; this warning is the only sign of it.
  if (unreadable) report('wire', 'UnreadableRequest', 'analytics request not in a known form');
}

/**
 * What may be sent of this request to Google right now, or null for nothing.
 * `readable` is false for a request whose body cannot be read before it goes.
 */
/**
 * True while the visitor's yes stands on this page load: the one test the wire
 * screen and the library load both use (spec E42).
 */
function wireOpen(): boolean {
  try {
    return measurementId !== '' && !withdrawnThisLoad() && readStoredConsent(window.localStorage)?.analytics === true;
  } catch {
    return false;
  }
}

function screenForWire(url: string, body: unknown, readable = true): ScreenedRequest | null {
  const notes: WireNotes = { unreadable: false, trimmed: 0 };
  let screened: ScreenedRequest | null = null;
  try {
    const allowed = wireOpen();
    if (allowed && readable) {
      screened = screenCollect(url, body, { origin: window.location.origin, measurementId }, notes);
    } else if (allowed) {
      notes.unreadable = true;
    }
  } catch {
    screened = null;
  }
  if (!screened || notes.trimmed > 0) noteStopped(notes.unreadable);
  return screened;
}

function textBody(body: unknown): string | undefined {
  return typeof body === 'string' && body !== '' ? body : undefined;
}

/** What a caller gets back for a request that was not sent. */
function notSent(): Promise<Response> {
  if (typeof Response === 'function') return Promise.resolve(new Response(null, { status: 204 }));
  return Promise.reject(new TypeError('Request not sent'));
}

function guardFetch(): void {
  const original = window.fetch;
  if (typeof original !== 'function') return;
  const guarded = function guardedFetch(...args: Parameters<typeof fetch>): Promise<Response> {
    const [input, init] = args;
    const url = absoluteUrl(input);
    if (wireRoute('fetch', url) === 'pass') return original.apply(window, args);
    // A request object's body cannot be read before it is sent, so it is not sent.
    const readable = typeof input === 'string' || input instanceof URL;
    const screened = screenForWire(url, init?.body, readable);
    if (!screened) return notSent();
    if (screened.body === textBody(init?.body)) return original.apply(window, args);
    return original.call(window, input, { ...init, body: screened.body });
  };
  window.fetch = guarded;
  if (window.fetch !== guarded) throw new TypeError('fetch cannot be guarded');
  wireUndo.push(() => {
    if (window.fetch === guarded) window.fetch = original;
  });
}

function guardBeacon(): void {
  const original = navigator.sendBeacon;
  if (typeof original !== 'function') return;
  const own = Object.getOwnPropertyDescriptor(navigator, 'sendBeacon');
  const guarded = function guardedBeacon(...args: Parameters<Navigator['sendBeacon']>): boolean {
    const [target, data] = args;
    const url = absoluteUrl(target);
    if (wireRoute('beacon', url) === 'pass') return original.apply(navigator, args);
    const screened = screenForWire(url, data);
    // "true" is what the browser answers when it has taken a beacon; nothing was sent.
    if (!screened) return true;
    if (screened.body === textBody(data)) return original.apply(navigator, args);
    return original.call(navigator, target, screened.body);
  };
  navigator.sendBeacon = guarded;
  if (navigator.sendBeacon !== guarded) throw new TypeError('sendBeacon cannot be guarded');
  wireUndo.push(() => {
    if (navigator.sendBeacon !== guarded) return;
    if (own) Object.defineProperty(navigator, 'sendBeacon', own);
    else delete (navigator as unknown as Record<string, unknown>).sendBeacon;
  });
}

/** The site never uses these two for analytics, so to Google they are shut. */
function guardOlderTransports(): void {
  if (typeof XMLHttpRequest === 'function') {
    const proto = XMLHttpRequest.prototype;
    const open = proto.open;
    const send = proto.send;
    const shut = new WeakSet<XMLHttpRequest>();
    const guardedOpen = function guardedOpen(this: XMLHttpRequest, _method: string, url: string | URL) {
      if (wireRoute('xhr', absoluteUrl(url)) !== 'pass') shut.add(this);
      else shut.delete(this);
      return Reflect.apply(open, this, arguments);
    };
    const guardedSend = function guardedSend(this: XMLHttpRequest) {
      if (shut.has(this)) return;
      return Reflect.apply(send, this, arguments);
    };
    proto.open = guardedOpen as XMLHttpRequest['open'];
    proto.send = guardedSend as XMLHttpRequest['send'];
    if (proto.open !== guardedOpen || proto.send !== guardedSend) {
      throw new TypeError('XMLHttpRequest cannot be guarded');
    }
    wireUndo.push(() => {
      if (proto.open === guardedOpen) proto.open = open;
      if (proto.send === guardedSend) proto.send = send;
    });
  }
  // The ways out an element's address gives (spec E41), taken from the Google
  // library's own code: it makes images, and one script element (its tag
  // diagnostics, sent to the library's own address plus extra fields). A
  // script element may load the exact library file, and only while the yes
  // stands (spec E42).
  if (typeof HTMLImageElement === 'function') guardElementAddress(HTMLImageElement.prototype, 'image');
  if (typeof HTMLScriptElement === 'function') guardElementAddress(HTMLScriptElement.prototype, 'script');
}

/** May an element of this kind be given this address? Decided by `wireRoute` alone. */
function elementMayLoad(way: WayOut, value: unknown): boolean {
  const route = wireRoute(way, absoluteUrl(String(value)));
  return route === 'pass' || (route === 'library' && wireOpen());
}

/**
 * Keep Google addresses out of an element's `src`, set as a property or as an
 * attribute, unless `wireRoute` allows it. Named limits (spec E41): `srcset`,
 * `setAttributeNS`, attribute nodes and HTML text are not guarded; neither the
 * library nor the site uses them.
 */
function guardElementAddress(proto: HTMLImageElement | HTMLScriptElement, way: 'image' | 'script'): void {
  const source = Object.getOwnPropertyDescriptor(proto, 'src');
  const setSource = source?.set;
  if (!source || !setSource) throw new TypeError(`${way} addresses cannot be guarded`);
  Object.defineProperty(proto, 'src', {
    ...source,
    set(this: Element, value: unknown) {
      if (!elementMayLoad(way, value)) return;
      setSource.call(this, value);
    },
  });
  const ownSetAttribute = Object.getOwnPropertyDescriptor(proto, 'setAttribute');
  const setAttribute = Element.prototype.setAttribute;
  const guardedSetAttribute = function guardedSetAttribute(this: Element, name: string, value: string) {
    if (String(name).toLowerCase() === 'src' && !elementMayLoad(way, value)) return;
    return Reflect.apply(setAttribute, this, arguments);
  };
  Object.defineProperty(proto, 'setAttribute', { value: guardedSetAttribute, configurable: true, writable: true });
  if (proto.setAttribute !== guardedSetAttribute) throw new TypeError(`${way} attributes cannot be guarded`);
  wireUndo.push(() => {
    Object.defineProperty(proto, 'src', source);
    if (ownSetAttribute) Object.defineProperty(proto, 'setAttribute', ownSetAttribute);
    else delete (proto as unknown as Record<string, unknown>).setAttribute;
  });
}

function removeWireGuard(): void {
  for (const undo of wireUndo.reverse()) {
    try {
      undo();
    } catch {
      // Best effort: whatever could not be put back was not ours to move.
    }
  }
  wireUndo = [];
  wireReady = false;
}

/**
 * Put the wire guard in place, once per page load. Returns whether it is in
 * place. A browser that will not let these functions be replaced is treated
 * as one that cannot be counted: the gate stays closed.
 */
function wireGuardReady(): boolean {
  if (wireReady) return true;
  if (wireFailed) return false;
  try {
    guardFetch();
    guardBeacon();
    guardOlderTransports();
    wireReady = true;
  } catch (error) {
    removeWireGuard();
    wireFailed = true;
    report('wireGuard', errorClass(error));
  }
  return wireReady;
}

// ---------------------------------------------------------------------------
// The one way anything is queued for the Google library
// ---------------------------------------------------------------------------

function ensureLayer(): void {
  const layer = window.dataLayer as unknown;
  if (!layer || typeof (layer as { push?: unknown }).push !== 'function') {
    window.dataLayer = [];
  }
}

function pushRaw(..._args: unknown[]): void {
  // The Google library acts only on the arguments object, never on an array.
  window.dataLayer.push(arguments);
}

function refreshCurrentPage(): TrustedPage | null {
  const location = safeLocation(window.location.origin, window.location.pathname, window.location.search);
  const path = normalisePath(window.location.pathname);
  if (!location || path === null) {
    currentPage = null;
    return null;
  }
  if (currentPage && currentPage.page_location === location) return currentPage;
  const previous = currentPage?.page_location || lastViewedLocation;
  let referrer: string;
  if (previous) {
    // The page left, by the one referrer rule (origin and path, no query):
    // the last check applies the same rule where the request leaves the
    // browser, and drops a referrer that still carries campaign tags.
    referrer = previous !== location ? safeReferrer(previous, window.location.origin) : '';
  } else {
    referrer = safeReferrer(document.referrer, window.location.origin);
  }
  currentPage = {
    page_location: location,
    page_path: path,
    page_title: PAGE_TITLES[path] ?? '',
    page_referrer: referrer,
  };
  return currentPage;
}

/** Queue consent, the clock and the configuration, once, the first time the gate is open. */
function ensureConfigured(): void {
  ensureLayer();
  const page = refreshCurrentPage();
  if (!configured) {
    pushRaw('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted',
    });
    pushRaw('js', new Date());
    pushRaw('config', measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_prefix: COOKIE_PREFIX,
      cookie_expires: COOKIE_EXPIRES_SECONDS,
      page_location: page?.page_location ?? '',
      page_referrer: page?.page_referrer ?? '',
      page_title: page?.page_title ?? '',
      ...(debugMode ? { debug_mode: true } : {}),
    });
    configured = true;
    consentDenied = false;
    return;
  }
  if (consentDenied) {
    pushRaw('consent', 'update', { analytics_storage: 'granted' });
    consentDenied = false;
  }
}

/**
 * The same check for our own calls and for anyone who calls window.gtag.
 * Only `event` and `set` can pass, only while the gate is open, and only with
 * cleaned values. Returns the call to queue, or null to drop it.
 */
function guard(args: unknown[]): unknown[] | null {
  const command = args[0];
  if (command !== 'event' && command !== 'set') return null;
  if (!syncGate()) return null;
  ensureConfigured();
  const trusted = currentPage ?? undefined;
  if (command === 'event') {
    if (!isSafeEventName(args[1])) return null;
    return ['event', args[1], sanitiseParams(args[2], trusted)];
  }
  const clean = sanitiseParams(args[1], trusted);
  const page: Record<string, unknown> = {};
  for (const name of ['page_location', 'page_title', 'page_referrer']) {
    if (name in clean) page[name] = clean[name];
  }
  return Object.keys(page).length > 0 ? ['set', page] : null;
}

function send(...args: unknown[]): SendResult {
  if (typeof window === 'undefined') return 'closed';
  try {
    const safe = guard(args);
    if (!safe) return 'closed';
    ensureLayer();
    pushRaw(...safe);
    return 'sent';
  } catch (error) {
    report('send', errorClass(error));
    return 'error';
  }
}

/** What window.gtag points at: the guard, applied at call time. */
function gtag(..._args: unknown[]): void {
  send(...Array.prototype.slice.call(arguments));
}

// ---------------------------------------------------------------------------
// Keeping the off switch right while the page lives
// ---------------------------------------------------------------------------

function onStorage(event: StorageEvent): void {
  if (event.key !== null && event.key !== CONSENT_STORAGE_KEY && event.key !== CONSENT_VERSION_KEY) return;
  syncGate();
  let allowed = false;
  try {
    allowed = readStoredConsent(window.localStorage)?.analytics === true;
  } catch {
    allowed = false;
  }
  if (!allowed) withdrawAnalytics();
  try {
    window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
  } catch {
    // Nothing listens, or events are unavailable: the flag is already right.
  }
}

/**
 * Install, once per page load: the wire guard; the guarded window.gtag; a wrapper on
 * history.pushState and history.replaceState that sets the off switch from
 * the destination before the address changes (so the Google library's own
 * page view on a history change never sees an open switch for a closed page);
 * and listeners for back and forward, a restore from the back-forward cache,
 * and a change of the choice in another tab.
 */
export function installAnalyticsGuards(): void {
  if (typeof window === 'undefined') return;
  wireGuardReady();
  try {
    if (window.gtag !== gtag) window.gtag = gtag;
    ensureLayer();
  } catch {
    // A page that forbids this cannot send anything through us either.
  }
  if (!guards) {
    try {
      const history = window.history;
      const installed: InstalledGuards = {
        pushState: history.pushState,
        replaceState: history.replaceState,
        ownPushState: Object.prototype.hasOwnProperty.call(history, 'pushState'),
        ownReplaceState: Object.prototype.hasOwnProperty.call(history, 'replaceState'),
        onPopState: () => void syncGate(),
        onPageShow: () => void syncGate(),
        onStorage,
      };
      const wrap = (original: History['pushState']): History['pushState'] =>
        function guardedHistoryChange(this: History, data: unknown, unused: string, url?: string | URL | null) {
          syncGate(url);
          return original.apply(this, arguments as unknown as Parameters<History['pushState']>);
        };
      history.pushState = wrap(installed.pushState);
      history.replaceState = wrap(installed.replaceState);
      window.addEventListener('popstate', installed.onPopState);
      window.addEventListener('pageshow', installed.onPageShow);
      window.addEventListener('storage', installed.onStorage);
      guards = installed;
    } catch (error) {
      report('installAnalyticsGuards', errorClass(error));
    }
  }
  syncGate();
}

/**
 * Initialise analytics. Safe to call any number of times. Nothing is queued
 * for Google until the gate is open.
 */
export function initializeGA4(config: GA4Config): void {
  if (typeof window === 'undefined') return;
  if (isMeasurementId(config?.measurementId)) measurementId = config.measurementId;
  debugMode = config?.debug === true;
  installAnalyticsGuards();
  try {
    if (syncGate()) ensureConfigured();
  } catch (error) {
    report('initializeGA4', errorClass(error));
  }
}

function deleteAnalyticsCookies(): void {
  const names = document.cookie
    .split(';')
    .map((pair) => pair.split('=')[0].trim())
    .filter((name) => name.startsWith('_ga') || name.startsWith(`${COOKIE_PREFIX}_ga`));
  if (names.length === 0) return;
  const host = window.location.hostname;
  const labels = host.split('.');
  const domains = ['', host, `.${host}`];
  for (let i = 1; i <= labels.length - 2; i += 1) {
    domains.push(`.${labels.slice(i).join('.')}`);
  }
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/${
        domain ? `; domain=${domain}` : ''
      }`;
    }
  }
}

/**
 * The visitor said no. Tell Google (if it was ever started), close the off
 * switch, and delete the analytics cookies. This stops future collection; it
 * does not delete what Google already holds.
 */
export function withdrawAnalytics(): void {
  if (typeof window === 'undefined') return;
  withdrawnAgainst = storedChoiceStamp();
  try {
    if (configured && !consentDenied) {
      ensureLayer();
      pushRaw('consent', 'update', { analytics_storage: 'denied' });
      consentDenied = true;
    }
  } catch (error) {
    report('withdrawAnalytics', errorClass(error));
  }
  syncGate();
  try {
    deleteAnalyticsCookies();
  } catch {
    // Cookies unavailable: there is nothing to delete.
  }
}

// ---------------------------------------------------------------------------
// Sending
// ---------------------------------------------------------------------------

/**
 * Count a view of the current page. The address and title a caller passes are
 * ignored: the clean address and the fixed title for this path are sent.
 */
export function trackPageView(_params?: PageViewEvent): void {
  if (typeof window === 'undefined') return;
  try {
    if (!syncGate()) {
      currentPage = null;
      lastCountedLocation = '';
      return;
    }
    ensureConfigured();
    const page = currentPage;
    if (!page || page.page_location === lastCountedLocation) return;
    send('set', {
      page_location: page.page_location,
      page_title: page.page_title,
      page_referrer: page.page_referrer,
    });
    const result = send('event', 'page_view', { ...page });
    if (result === 'sent') {
      lastCountedLocation = page.page_location;
      lastViewedLocation = page.page_location;
    }
  } catch (error) {
    report('trackPageView', errorClass(error));
  }
}

/**
 * Track a custom event. Parameters that are not on the allow-list are dropped.
 */
export function trackEvent(eventName: string, params?: GA4EventParams): void {
  send('event', eventName, params);
}

/**
 * Track an event at most once per browser session for `onceKey` (e.g. a Stripe
 * session id), so reloading a payment return page does not double-count. The
 * key is not used up while the gate is closed.
 */
export function trackEventOnce(eventName: string, onceKey: string, params?: GA4EventParams): void {
  if (typeof window === 'undefined') return;
  if (!syncGate()) return;

  const storageKey = `nrpg_ga4_once:${eventName}:${onceKey}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, '1');
  } catch {
    // sessionStorage unavailable (privacy mode): fall through and track.
  }

  trackEvent(eventName, params);
}

/**
 * Leave the way the last wait ended where a browser check can read it. It is
 * one of four fixed words and says nothing about the visitor.
 */
function noteWaitResult(result: WaitResult): void {
  try {
    document.documentElement.setAttribute('data-nrpg-analytics-wait', result);
  } catch {
    // No document (server render), or it cannot be written: nothing to note.
  }
}

/**
 * Send an event and wait for Google to confirm it, for use just before a move
 * to another page. Resolves when the confirmation arrives or `timeoutMs`
 * passes, and at once when the gate is closed. It never rejects, so a caller
 * can await it without putting its own work at risk.
 */
export function trackEventAndWait(
  eventName: string,
  params?: GA4EventParams,
  timeoutMs = 1000,
): Promise<WaitResult> {
  return new Promise<WaitResult>((resolve) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = (result: WaitResult) => {
      if (settled) return;
      settled = true;
      if (timer !== undefined) clearTimeout(timer);
      noteWaitResult(result);
      resolve(result);
    };
    try {
      if (typeof window === 'undefined' || !gateOpen()) {
        syncGate();
        finish('closed');
        return;
      }
      const wait = Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 1000;
      timer = setTimeout(() => finish('timeout'), wait);
      const result = send('event', eventName, {
        // Cleaned here as well as in send(), so a parameter that throws when
        // read is dropped instead of losing the whole event.
        ...sanitiseParams(params),
        event_callback: () => finish('callback'),
        event_timeout: wait,
      });
      if (result !== 'sent') finish(result);
    } catch {
      finish('error');
    }
  });
}

// ============================================================================
// Custom Event Tracking Functions
// ============================================================================

/**
 * Track claim started
 */
export function trackClaimStarted(params: ClaimEvent): void {
  trackEvent(GA4_EVENTS.CLAIM_STARTED, {
    claim_type: params.claim_type,
    event_category: 'Claim',
  });
}

/**
 * Track claim step completed
 */
export function trackClaimStepCompleted(params: ClaimEvent): void {
  trackEvent(GA4_EVENTS.CLAIM_STEP_COMPLETED, {
    step_name: params.step_name,
    step_number: params.step_number,
    event_category: 'Claim',
  });
}

/**
 * Track claim submitted (conversion). The claim id and amount are never sent.
 */
export function trackClaimSubmitted(params: ClaimEvent): void {
  trackEvent(GA4_EVENTS.CLAIM_SUBMITTED, {
    claim_type: params.claim_type,
    event_category: 'Claim',
  });

  // Also track as conversion
  trackConversion('claim_submission');
}

/**
 * Track contractor inquiry
 */
export function trackContractorInquiry(params: ContractorEvent): void {
  trackEvent(GA4_EVENTS.CONTRACTOR_INQUIRY, {
    service_type: params.service_type,
    event_category: 'Contractor',
  });
}

/**
 * Track contractor signup started
 */
export function trackContractorSignupStarted(params?: ContractorEvent): void {
  trackEvent(GA4_EVENTS.CONTRACTOR_SIGNUP_STARTED, {
    service_type: params?.service_type,
    event_category: 'Contractor',
  });
}

/**
 * Track contractor signup completed (conversion)
 */
export function trackContractorSignupCompleted(params: ContractorEvent): void {
  trackEvent(GA4_EVENTS.CONTRACTOR_SIGNUP_COMPLETED, {
    service_type: params.service_type,
    event_category: 'Contractor',
  });

  // Also track as conversion
  trackConversion('contractor_signup');
}

/**
 * Track content download. The file name and address are never sent.
 */
export function trackContentDownload(params: ContentEvent): void {
  trackEvent(GA4_EVENTS.CONTENT_DOWNLOAD, {
    content_type: params.content_type,
    file_type: typeof params.file_type === 'string' && /^[A-Za-z0-9]{1,8}$/.test(params.file_type)
      ? params.file_type
      : undefined,
    event_category: 'Content',
  });
}

/**
 * Track tool interaction
 */
export function trackToolInteraction(params: ToolEvent): void {
  trackEvent(GA4_EVENTS.TOOL_INTERACTION, {
    tool_name: params.tool_name,
    tool_action: params.tool_action,
    event_category: 'Tool',
  });
}

/**
 * Track search. The words searched for are never sent.
 */
export function trackSearch(_searchTerm: string, resultsCount?: number): void {
  trackEvent(GA4_EVENTS.SEARCH_PERFORMED, {
    results_count: resultsCount,
    event_category: 'Search',
  });
}

/**
 * Track CTA click
 */
export function trackCTAClick(ctaName: string, ctaLocation?: string): void {
  trackEvent(GA4_EVENTS.CTA_CLICKED, {
    cta_name: ctaName,
    cta_location: ctaLocation,
    event_category: 'CTA',
  });
}

/**
 * Track outbound link click. Only the host of a web link is sent: never the
 * full address and never the link text.
 */
export function trackOutboundLink(url: string, _linkText?: string): void {
  let host = '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return;
    host = parsed.hostname;
  } catch {
    return;
  }
  trackEvent(GA4_EVENTS.OUTBOUND_LINK, {
    link_domain: host,
    outbound: true,
    event_category: 'Outbound Link',
  });
}

/**
 * Track scroll depth
 */
export function trackScrollDepth(percentage: number): void {
  trackEvent(GA4_EVENTS.SCROLL_DEPTH, {
    scroll_depth: percentage,
    event_category: 'Engagement',
  });
}

/**
 * Track time on page
 */
export function trackTimeOnPage(seconds: number): void {
  trackEvent(GA4_EVENTS.TIME_ON_PAGE, {
    time_on_page: seconds,
    event_category: 'Engagement',
  });
}

/**
 * Track conversion event
 */
export function trackConversion(conversionName: string, value?: number): void {
  trackEvent('conversion', {
    conversion_name: conversionName,
    value: value,
    event_category: 'Conversion',
  });
}

/**
 * Track user sign up
 */
export function trackSignUp(method?: string): void {
  trackEvent(GA4_EVENTS.SIGN_UP, {
    method: method || 'email',
    event_category: 'User',
  });

  trackConversion('sign_up');
}

/**
 * Track user login
 */
export function trackLogin(method?: string): void {
  trackEvent(GA4_EVENTS.LOGIN, {
    method: method || 'email',
    event_category: 'User',
  });
}

// ============================================================================
// Who the visitor is: nothing is sent
// ============================================================================

/**
 * Kept so existing callers compile. Sends nothing: this site does not tell
 * Google who a visitor is or where they are.
 */
export function setUserProperties(_properties: Record<string, unknown>): void {
  return;
}

/** Kept so existing callers compile. Sends nothing. */
export function setUserId(_userId: string): void {
  return;
}

/** Kept so existing callers compile. Sends nothing. */
export function clearUserId(): void {
  return;
}

/** Kept so existing callers compile. Sends nothing. */
export function trackGeographicData(_location: {
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
}): void {
  return;
}

// ============================================================================
// E-commerce Tracking (for future use). Item and order details are not on the
// allow-list, so only the event name, value and currency can be sent.
// ============================================================================

/**
 * Track product view
 */
export function trackProductView(_product: {
  id: string;
  name: string;
  category?: string;
  price?: number;
}): void {
  trackEvent('view_item', {});
}

/**
 * Track add to cart
 */
export function trackAddToCart(_product: {
  id: string;
  name: string;
  category?: string;
  price?: number;
  quantity?: number;
}): void {
  trackEvent('add_to_cart', {});
}

/**
 * Track purchase
 */
export function trackPurchase(transaction: {
  transaction_id: string;
  value: number;
  currency?: string;
  items: Array<{
    id: string;
    name: string;
    category?: string;
    price?: number;
    quantity?: number;
  }>;
}): void {
  trackEvent('purchase', {
    value: transaction.value,
    currency: transaction.currency || 'AUD',
  });
}

// ============================================================================
// Test support
// ============================================================================

/** Put this module back to a fresh page load. For tests only. */
export function __resetAnalyticsForTests(): void {
  if (typeof window !== 'undefined' && guards) {
    try {
      const history = window.history as unknown as Record<string, unknown>;
      if (guards.ownPushState) history.pushState = guards.pushState;
      else delete history.pushState;
      if (guards.ownReplaceState) history.replaceState = guards.replaceState;
      else delete history.replaceState;
      window.removeEventListener('popstate', guards.onPopState);
      window.removeEventListener('pageshow', guards.onPageShow);
      window.removeEventListener('storage', guards.onStorage);
    } catch {
      // Best effort: a test that broke history will fail on its own assertions.
    }
  }
  guards = null;
  if (typeof window !== 'undefined') removeWireGuard();
  wireFailed = false;
  measurementId = measurementIdFromBuild();
  debugMode = false;
  configured = false;
  consentDenied = false;
  currentPage = null;
  lastViewedLocation = '';
  lastCountedLocation = '';
  reported.clear();
  withdrawnAgainst = null;
  wireStopped = 0;
  if (typeof document !== 'undefined') document.documentElement.removeAttribute(WIRE_STOPPED_ATTRIBUTE);
}

// ============================================================================
// Type Declarations for Window
// ============================================================================

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default {
  initializeGA4,
  installAnalyticsGuards,
  gateOpen,
  syncGate,
  withdrawAnalytics,
  trackPageView,
  trackEvent,
  trackEventOnce,
  trackEventAndWait,
  trackClaimStarted,
  trackClaimStepCompleted,
  trackClaimSubmitted,
  trackContractorInquiry,
  trackContractorSignupStarted,
  trackContractorSignupCompleted,
  trackContentDownload,
  trackToolInteraction,
  trackSearch,
  trackCTAClick,
  trackOutboundLink,
  trackScrollDepth,
  trackTimeOnPage,
  trackConversion,
  trackSignUp,
  trackLogin,
  setUserProperties,
  setUserId,
  clearUserId,
  trackGeographicData,
  trackProductView,
  trackAddToCart,
  trackPurchase,
};
