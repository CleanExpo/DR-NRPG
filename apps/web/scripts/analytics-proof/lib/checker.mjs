/**
 * The rules a request to Google must meet, written out again here on purpose.
 *
 * The lists of what may be SENT are not read from the site's own code. If the
 * site's lists and these lists ever disagree, the capture fails, and someone
 * has to decide which one is right. That is the point of keeping two copies.
 *
 * The one exception is the list of hosts that count as Google (spec E44). A
 * second copy of that list fails the other way: a host the proof forgets is
 * a request it never checks, and the capture passes. So the proof reads the
 * site's own host file and may add hosts of its own, never fewer.
 */

import { readFileSync } from 'node:fs';

/** The only addresses that may be counted. */
export const LISTED_PATHS = [
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

/**
 * Campaign keys that may appear in a sent address, and the one shape their
 * value may take: a lower-case slug with no run of more than four digits.
 * `utm_term` and `utm_content` are never sent (spec E35).
 */
const SENT_CAMPAIGN_KEYS = new Set(['utm_source', 'utm_medium', 'utm_campaign']);
const CAMPAIGN_SLUG = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;
function isCampaignSlug(value) {
  return typeof value === 'string' && value.length <= 100 && CAMPAIGN_SLUG.test(value) && !/\d{5,}/.test(value);
}

/**
 * The page each listed page must land on when it is opened (spec E36). Only
 * /quote moves on, to the first claim step; every other page is its own
 * landing. A landing anywhere else means the page asked for was not tested.
 */
export const LANDINGS = Object.freeze(
  Object.fromEntries(LISTED_PATHS.map((path) => [path, path === '/quote' ? '/claim/step-1' : path])),
);

/** Null when `landed` is the stated landing of `target`, else what is wrong. */
export function landingProblem(target, landed) {
  const expected = LANDINGS[target];
  if (expected === undefined) return `${target} is not a listed page`;
  if (typeof landed !== 'string' || landed === '') return `${target} did not land on any page`;
  return landed === expected ? null : `${target} landed on ${landed}, expected ${expected}`;
}

/** Event parameter names the site may send (as `ep.<name>` or `epn.<name>`). */
const EVENT_PARAMS = new Set([
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
  'page_path',
  // Added by the Google library itself when a callback is waited for.
  'event_timeout',
]);

/**
 * The Google library's own fields and the one shape each value may take (spec
 * E46), written out again here, not read from the site. Every other field that
 * is not a page, event or parameter field is a problem, whatever it holds.
 */
const DIGITS = /^\d{1,20}$/;
const BRAND_ITEM = /^([^;|]{1,120});(\d{1,5}(?:\.\d{1,5}){0,3})$/;
function brandListInShape(value) {
  const items = value.split('|');
  if (items.length > 10) return false;
  return items.every((item) => {
    const match = BRAND_ITEM.exec(item);
    if (!match) return false;
    const brand = decodeAll(match[1]);
    if (/%[0-9A-Fa-f]{2}/.test(brand)) return false;
    return /^[A-Za-z][A-Za-z ]{0,39}$/.test(brand) || /^Not[ ()\-./:;=?_]A[ ()\-./:;=?_]Brand$/.test(brand);
  });
}
const LIBRARY_FIELDS = {
  v: /^2$/,
  gtm: /^\d{2}[a-z0-9]{1,78}$/,
  _p: DIGITS,
  gcs: /^G\d{3}$/,
  gcd: /^\d{2}(?:[a-z]\d){1,14}$/,
  npa: DIGITS,
  dma: DIGITS,
  dma_cps: /^(?:-|[a-z]{1,12})$/,
  _eu: /^[A-Za-z0-9_-]{1,12}$/,
  ae: /^[a-z]{1,4}$/,
  are: DIGITS,
  cid: /^\d{1,12}\.\d{1,12}$/,
  frm: DIGITS,
  ngs: DIGITS,
  pscdl: /^[a-z]{1,12}$/,
  rcb: DIGITS,
  sr: /^\d{1,5}x\d{1,5}$/,
  uaa: /^[a-z0-9_]{0,12}$/,
  uab: DIGITS,
  uafvl: brandListInShape,
  uam: /^[A-Za-z0-9 ._-]{0,40}$/,
  uamb: DIGITS,
  uap: /^[A-Za-z ]{0,30}$/,
  uapv: /^[0-9.]{0,24}$/,
  uaw: DIGITS,
  ul: /^[a-z]{2,3}(?:-[a-z0-9]{2,8}){0,2}$/i,
  _s: DIGITS,
  tag_exp: /^\d{1,12}(?:~\d{1,12}){0,60}$/,
  sid: DIGITS,
  sct: DIGITS,
  seg: DIGITS,
  _tu: /^[A-Za-z0-9_-]{1,12}$/,
  _fv: DIGITS,
  _nsi: DIGITS,
  _ss: DIGITS,
  _ee: DIGITS,
  _et: DIGITS,
  tfd: DIGITS,
};
/** Fields with a rule of their own in `checkHit`. */
const PAGE_AND_EVENT_FIELDS = new Set(['tid', 'en', 'dl', 'dr', 'dt', 'dp']);

/** Null when `key` is a library field and `value` is in its shape, else what is wrong. */
function libraryFieldProblem(key, value) {
  if (!Object.prototype.hasOwnProperty.call(LIBRARY_FIELDS, key)) return `field not on the list: ${key}`;
  const shape = LIBRARY_FIELDS[key];
  const text = String(value ?? '');
  const ok = typeof shape === 'function' ? shape(text) : shape.test(text);
  return ok ? null : `${key} is not in the shape the library sends: ${text.slice(0, 60)}`;
}

/** Text planted in addresses and forms during a run. None of it may reach Google. */
export const MARKERS = {
  claimId: 'PROOFCLAIM7731',
  email: 'proof-visitor-7731@example.invalid',
  emailLocal: 'proof-visitor-7731',
  phone: '0400007731',
  name: 'Proofname Visitorsen',
  token: 'prooftoken7731abcdef',
  recordId: 'proofrecord7731',
};

const MARKER_VALUES = Object.values(MARKERS).map((value) => value.toLowerCase());

/** The site's own Google host rule, from src/lib/google-hosts.json (spec E44). */
const SITE_HOSTS = JSON.parse(readFileSync(new URL('../../../src/lib/google-hosts.json', import.meta.url), 'utf8'));
/** Hosts the proof also calls Google, beyond the site's rule. Adding is allowed; removing a site host is not. */
const PROOF_EXTRA_HOSTS = ['gstatic.com'];
const NAMED_HOSTS = [...SITE_HOSTS.collectionHosts, SITE_HOSTS.tagHost, ...PROOF_EXTRA_HOSTS];
const GOOGLE_SITE_HOST = new RegExp(SITE_HOSTS.googleSitePattern);
if (NAMED_HOSTS.length < 7 || NAMED_HOSTS.some((name) => typeof name !== 'string' || name === '')) {
  throw new Error('google-hosts.json does not hold the Google host lists; the proof cannot run');
}

function isGoogleHost(host) {
  return NAMED_HOSTS.some((name) => host === name || host.endsWith(`.${name}`)) || GOOGLE_SITE_HOST.test(host);
}

/**
 * Every component of an address, read once, in one complete form: scheme,
 * user name and password, host, port, path, every query field in order
 * (repeats kept), and whether there is a fragment. Null when it is not an
 * absolute address. Checks below accept an address only by allow-listing
 * all of this, so no part can ride along unseen (spec E35).
 */
export function parseAddress(text) {
  if (typeof text !== 'string') return null;
  let url;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  const authority = /^[a-z][a-z0-9+.-]*:\/\/([^/?#]*)/i.exec(text)?.[1] ?? '';
  const hashAt = text.indexOf('#');
  const queryText = (hashAt === -1 ? text : text.slice(0, hashAt)).split('?').slice(1).join('?');
  return {
    scheme: url.protocol.slice(0, -1),
    userinfo: url.username !== '' || url.password !== '' || authority.includes('@'),
    host: url.hostname,
    port: url.port,
    origin: url.origin,
    path: url.pathname,
    hasQueryMark: (hashAt === -1 ? text : text.slice(0, hashAt)).includes('?'),
    query: [...new URLSearchParams(queryText)],
    hasFragment: hashAt !== -1,
  };
}

/** The key given more than once in a list of fields, or null. */
function repeatedKey(entries) {
  const seen = new Set();
  for (const [key] of entries) {
    if (seen.has(key)) return key;
    seen.add(key);
  }
  return null;
}

export function isGoogleUrl(url) {
  try {
    // "example.com." and "example.com" are the same host to the browser (spec E40).
    return isGoogleHost(new URL(url).hostname.toLowerCase().replace(/\.$/, ''));
  } catch {
    return false;
  }
}

/**
 * The library file itself, in the one form the site asks for it:
 * `https://www.googletagmanager.com/gtag/js?id=<the id>` and nothing else.
 * Loading it sends no visitor data beyond the request. Any other address to
 * Google, an extra field included, is collection and is checked as such.
 */
export function isLibraryUrl(url, measurementId) {
  const address = parseAddress(url);
  return (
    address !== null &&
    typeof measurementId === 'string' &&
    measurementId !== '' &&
    address.scheme === 'https' &&
    !address.userinfo &&
    !address.hasFragment &&
    address.host === 'www.googletagmanager.com' &&
    address.port === '' &&
    address.path === '/gtag/js' &&
    address.query.length === 1 &&
    address.query[0][0] === 'id' &&
    address.query[0][1] === measurementId
  );
}

/**
 * The one owner of "is this the library load" in the proof (spec E42): a GET
 * of the exact library address by a script element. The address alone is not
 * enough; a fetch, beacon, XMLHttpRequest or image to it is collection.
 * `request` is `{ url, resourceType, method }`, as Playwright reports them.
 */
export function isLibraryLoad(request, measurementId) {
  return (
    request !== null &&
    typeof request === 'object' &&
    request.resourceType === 'script' &&
    String(request.method).toUpperCase() === 'GET' &&
    isLibraryUrl(request.url, measurementId)
  );
}

/** Every request to Google that is not the library load is treated as collection. */
export function isCollectionRequest(request, measurementId) {
  return request !== null && typeof request === 'object' && isGoogleUrl(request.url) && !isLibraryLoad(request, measurementId);
}

function decodeAll(text) {
  let out = String(text ?? '');
  // Decode up to three times so doubly encoded text cannot hide.
  for (let i = 0; i < 3; i += 1) {
    try {
      const next = decodeURIComponent(out.replace(/\+/g, ' '));
      if (next === out) break;
      out = next;
    } catch {
      break;
    }
  }
  return out;
}

/**
 * Split one collection request into its hits. Google batches: the address
 * carries the shared fields, and each line of the body is one event.
 */
export function readRecord(record) {
  const address = parseAddress(record.url);
  const shared = address ? address.query : [];
  const body = typeof record.postData === 'string' ? record.postData : '';
  const lines = body
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => [...new URLSearchParams(line)]);
  const problems = [];
  if (!address) problems.push({ check: 'address', detail: `the request address cannot be read: ${record.url}` });
  else if (address.userinfo || address.hasFragment) {
    problems.push({ check: 'address', detail: `the request address carries a user name, password or fragment: ${record.url}` });
  }
  const sharedRepeat = repeatedKey(shared);
  if (sharedRepeat !== null) problems.push({ check: 'parameters', detail: `the request address gives "${sharedRepeat}" twice` });
  lines.forEach((line, index) => {
    const repeat = repeatedKey(line);
    if (repeat !== null) problems.push({ check: 'parameters', detail: `body line ${index + 1} gives "${repeat}" twice` });
  });
  const hits =
    lines.length === 0
      ? [Object.fromEntries(shared)]
      : lines.map((line) => ({ ...Object.fromEntries(shared), ...Object.fromEntries(line) }));
  return { hits, problems };
}

/**
 * Split one collection request into its hits. Google batches: the address
 * carries the shared fields, and each line of the body is one event. A field
 * given twice is reported by `readRecord`; here the first value is not lost
 * silently, because `checkRecords` fails the request on the repeat.
 */
export function parseHits(record) {
  return readRecord(record).hits;
}

function cleanAddressProblem(value, origin, { allowUtm }) {
  const address = parseAddress(value);
  if (!address) return `not an address: ${value}`;
  if (address.scheme !== 'http' && address.scheme !== 'https') return `not a web address: ${value}`;
  if (address.userinfo) return `carries a user name or password: ${value}`;
  if (address.hasFragment) return `has a fragment: ${value}`;
  if (address.origin !== origin) return `not this site: ${value}`;
  if (!LISTED_PATHS.includes(address.path)) return `path is not on the list: ${address.path}`;
  if (address.hasQueryMark && address.query.length === 0) return `has an empty query: ${value}`;
  const repeat = repeatedKey(address.query);
  if (repeat !== null) return `gives the query key "${repeat}" twice`;
  for (const [key, field] of address.query) {
    if (!allowUtm || !SENT_CAMPAIGN_KEYS.has(key)) return `carries the query key "${key}"`;
    if (!isCampaignSlug(field)) return `campaign value is not a plain slug: ${key}=${field}`;
  }
  return null;
}

function referrerProblem(value, origin) {
  if (value === undefined || value === '') return null;
  const address = parseAddress(value);
  if (!address) return `not an address: ${value}`;
  if (address.scheme !== 'http' && address.scheme !== 'https') return `not a web address: ${value}`;
  if (address.userinfo) return `carries a user name or password: ${value}`;
  if (address.hasQueryMark || address.hasFragment) return `carries a query or fragment: ${value}`;
  if (address.origin === origin) {
    if (address.path !== '/' && !LISTED_PATHS.includes(address.path)) {
      return `names a page that is not on the list: ${address.path}`;
    }
    return null;
  }
  if (address.path !== '/' && address.path !== '') return `another site's page, not just its name: ${value}`;
  return null;
}

/**
 * Check one hit. Returns a list of { check, detail }; empty means clean.
 * `origin` is the site under test; `measurementId` is the id it must carry.
 */
export function checkHit(hit, { origin, measurementId }) {
  const problems = [];
  const add = (check, detail) => problems.push({ check, detail });

  if (hit.tid !== measurementId) add('id', `tid is ${hit.tid}, expected ${measurementId}`);

  if (hit.dl === undefined) {
    add('address', 'the hit has no page address (dl)');
  } else {
    const problem = cleanAddressProblem(hit.dl, origin, { allowUtm: true });
    if (problem) add('address', `dl ${problem}`);
  }

  if (hit.dp !== undefined && !LISTED_PATHS.includes(hit.dp)) {
    add('address', `dp (the page path) is not on the list: ${hit.dp}`);
  }

  const referrer = referrerProblem(hit.dr, origin);
  if (referrer) add('referrer', `dr ${referrer}`);

  if (hit.dt !== undefined && /[@?=&]|https?:/i.test(hit.dt)) {
    add('title', `dt looks like data, not a fixed title: ${hit.dt}`);
  }
  if (hit.dt !== undefined && hit.dt.length > 80) add('title', 'dt is longer than a fixed title');

  for (const key of Object.keys(hit)) {
    if (key === 'uid' || key.startsWith('up.') || key.startsWith('upn.')) {
      add('parameters', `user field sent: ${key}`);
      continue;
    }
    const match = /^(ep|epn)\.(.+)$/.exec(key);
    if (!match) {
      if (!PAGE_AND_EVENT_FIELDS.has(key)) {
        const problem = libraryFieldProblem(key, hit[key]);
        if (problem) add('fields', problem);
      }
      continue;
    }
    const name = match[2];
    if (name === 'page_location') {
      const problem = cleanAddressProblem(hit[key], origin, { allowUtm: true });
      if (problem) add('address', `${key} ${problem}`);
      continue;
    }
    if (name === 'page_referrer') {
      const problem = referrerProblem(hit[key], origin);
      if (problem) add('referrer', `${key} ${problem}`);
      continue;
    }
    if (name === 'page_title') {
      if (/[@?=&]|https?:/i.test(hit[key])) add('title', `${key} looks like data, not a fixed title: ${hit[key]}`);
      continue;
    }
    if (name === 'page_path' && !LISTED_PATHS.includes(hit[key])) {
      add('address', `${key} is not on the list: ${hit[key]}`);
      continue;
    }
    if (!EVENT_PARAMS.has(name)) add('parameters', `parameter not on the list: ${name}`);
  }

  for (const [key, value] of Object.entries(hit)) {
    const text = decodeAll(value).toLowerCase();
    if (/[^\s@]+@[^\s@]+\.[a-z]{2,}/.test(text)) add('markers', `${key} holds an email address`);
    for (const marker of MARKER_VALUES) {
      if (text.includes(marker)) add('markers', `${key} holds planted text "${marker}"`);
    }
  }
  return problems;
}

/** Check the raw request as well, so nothing hides outside the parsed fields. */
export function checkRawRecord(record) {
  const problems = [];
  const raw = decodeAll(`${record.url}\n${record.postData ?? ''}`).toLowerCase();
  for (const marker of MARKER_VALUES) {
    if (raw.includes(marker)) problems.push({ check: 'markers', detail: `the request holds planted text "${marker}"` });
  }
  return problems;
}

/** Check every hit in a list of collection records. */
export function checkRecords(records, context) {
  const problems = [];
  const hits = [];
  for (const record of records) {
    for (const problem of checkRawRecord(record)) problems.push({ ...problem, phase: record.phase });
    const read = readRecord(record);
    for (const problem of read.problems) problems.push({ ...problem, phase: record.phase });
    for (const hit of read.hits) {
      hits.push({ ...hit, __phase: record.phase });
      for (const problem of checkHit(hit, context)) problems.push({ ...problem, phase: record.phase });
    }
  }
  return { problems, hits };
}

/** A short, readable line for one hit, for the report. */
export function describeHit(hit) {
  const params = Object.keys(hit)
    .filter((key) => /^(ep|epn)\./.test(key))
    .map((key) => `${key.replace(/^epn?\./, '')}=${hit[key]}`)
    .join(', ');
  return `${hit.en ?? '(no event name)'} | address ${hit.dl ?? '-'} | referrer ${hit.dr || '-'} | title ${hit.dt ?? '-'}${
    params ? ` | ${params}` : ''
  }`;
}

/** Collects named check results and prints them one per line. */
/**
 * The two checks that belong to the claim walk alone. They take plain data,
 * so a control can hand them planted hits and see both fail.
 *   hits                every event read from the requests of the walk
 *   afterMoveRecords    the requests made after the move to the success page
 *   afterMoveLibrary    loads of the Google library after the move
 */
export function claimChecks({ hits, afterMoveRecords, afterMoveLibrary, origin }) {
  const stepThree = `${origin}/claim/step-3`;
  const claimHits = hits.filter((hit) => hit.en === 'claim_submitted');
  const afterHits = hits.filter((hit) => hit.__phase === 'after-move');
  const wrongAfter = afterHits.filter((hit) => hit.dl !== stepThree);
  const afterRaw = afterMoveRecords.filter(
    (record) => record.url.includes('success') || (record.postData ?? '').includes('success'),
  );
  const named = [...wrongAfter.map((hit) => `${hit.en} ${hit.dl}`), ...afterRaw.map((record) => record.url.split('?')[0])];
  return [
    {
      name: 'claim-event-about-step-3',
      pass: claimHits.length > 0 && claimHits.every((hit) => hit.dl === stepThree),
      detail: claimHits.map((hit) => `[${hit.__phase}] ${describeHit(hit)}`).join(' ; ') || 'no claim event',
    },
    {
      name: 'nothing-about-success-page',
      pass: wrongAfter.length === 0 && afterMoveLibrary.length === 0 && afterRaw.length === 0,
      detail:
        named.length || afterMoveLibrary.length
          ? `${named.length} request(s) after the move not about step 3: ${named.slice(0, 3).join(' ; ')}` +
            (afterMoveLibrary.length ? `; the Google library was loaded ${afterMoveLibrary.length} time(s) after the move` : '')
          : `after the move ${afterHits.length} held hit(s) left, all about step 3 (${afterHits.map((hit) => hit.en).join(', ') || 'none'}); nothing named the success page`,
    },
  ];
}

export class Results {
  constructor(title) {
    this.title = title;
    this.rows = [];
  }
  record(name, pass, detail = '') {
    this.rows.push({ name, pass: pass === true, detail });
    console.log(`${pass === true ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
  }
  failed() {
    return this.rows.filter((row) => !row.pass).map((row) => row.name);
  }
  ok() {
    return this.rows.length > 0 && this.failed().length === 0;
  }
}
