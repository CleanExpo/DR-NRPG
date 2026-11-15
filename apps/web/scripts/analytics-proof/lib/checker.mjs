/**
 * The rules a request to Google must meet, written out again here on purpose.
 *
 * Nothing in this file is read from the site's own code. If the site's lists
 * and these lists ever disagree, the capture fails, and someone has to decide
 * which one is right. That is the point of keeping two copies.
 */

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

const UTM_KEYS = new Set(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']);

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

const GOOGLE_HOST = /(^|\.)(google-analytics\.com|analytics\.google\.com|googletagmanager\.com|doubleclick\.net|googleadservices\.com|googlesyndication\.com|google\.com|google\.com\.au|gstatic\.com)$/;

export function isGoogleUrl(url) {
  try {
    return GOOGLE_HOST.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** The library file itself. Loading it sends no visitor data beyond the request. */
export function isLibraryUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'www.googletagmanager.com' && parsed.pathname === '/gtag/js';
  } catch {
    return false;
  }
}

/** Every request to Google that is not the library file is treated as collection. */
export function isCollectionUrl(url) {
  return isGoogleUrl(url) && !isLibraryUrl(url);
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
export function parseHits(record) {
  const shared = {};
  let query = '';
  try {
    query = new URL(record.url).search.slice(1);
  } catch {
    query = '';
  }
  for (const [key, value] of new URLSearchParams(query)) shared[key] = value;
  const body = typeof record.postData === 'string' ? record.postData : '';
  const lines = body.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [{ ...shared }];
  return lines.map((line) => {
    const hit = { ...shared };
    for (const [key, value] of new URLSearchParams(line)) hit[key] = value;
    return hit;
  });
}

function cleanAddressProblem(value, origin, { allowUtm }) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return `not an address: ${value}`;
  }
  if (url.origin !== origin) return `not this site: ${value}`;
  if (url.hash) return `has a fragment: ${value}`;
  if (!LISTED_PATHS.includes(url.pathname)) return `path is not on the list: ${url.pathname}`;
  for (const [key] of url.searchParams) {
    if (!allowUtm || !UTM_KEYS.has(key)) return `carries the query key "${key}"`;
  }
  return null;
}

function referrerProblem(value, origin) {
  if (value === undefined || value === '') return null;
  let url;
  try {
    url = new URL(value);
  } catch {
    return `not an address: ${value}`;
  }
  if (url.search || url.hash) return `carries a query or fragment: ${value}`;
  if (url.origin === origin) {
    if (url.pathname !== '/' && !LISTED_PATHS.includes(url.pathname)) {
      return `names a page that is not on the list: ${url.pathname}`;
    }
    return null;
  }
  if (url.pathname !== '/' && url.pathname !== '') return `another site's page, not just its name: ${value}`;
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
    if (!match) continue;
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
    for (const hit of parseHits(record)) {
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
