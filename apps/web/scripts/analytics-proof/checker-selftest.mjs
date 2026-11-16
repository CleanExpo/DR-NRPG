#!/usr/bin/env node
/**
 * Offline self-test of the proof checker (spec E35, criterion AC-K1b).
 *
 * The checker must read every address and every request in one complete
 * form, then accept only what is on its lists. Each case below plants one
 * form that a looser reading lets through, and passes only when the checker
 * reports a problem for it (or, for a library address, refuses to treat it as
 * the library). The clean twin, the same request without the plant, must read
 * as clean. No browser and no server: this runs in a second.
 *
 * Exit 0 only when every plant is caught and the clean twin passes.
 *
 *   node scripts/analytics-proof/checker-selftest.mjs
 */
import { REAL_MEASUREMENT_ID } from './lib/server.mjs';
import { checkRecords, isCollectionRequest, isLibraryLoad, isLibraryUrl } from './lib/checker.mjs';

/** A script element's GET of an address: the only way the library is loaded. */
const scriptGet = (url) => ({ url, resourceType: 'script', method: 'GET' });

const origin = 'http://localhost:3000';
const measurementId = REAL_MEASUREMENT_ID;
const context = { origin, measurementId };
const collect = `https://region1.google-analytics.com/g/collect?v=2&tid=${measurementId}`;
const enc = encodeURIComponent;
const clean = `${origin}/pricing?utm_source=news&utm_medium=email`;
const dirty = `${origin}/claim/success?claimId=CLM-9`;

const rows = [];
function record(name, pass, detail) {
  rows.push({ name, pass });
  console.log(`${pass ? 'CAUGHT' : 'MISSED'}  ${name}${detail ? `  (${detail})` : ''}`);
}
function problemsOf(url, postData = '') {
  return checkRecords([{ phase: 'planted', url, postData }], context).problems;
}
function judgePlant(name, url, postData) {
  const problems = problemsOf(url, postData);
  record(name, problems.length > 0, problems.map((p) => `${p.check}: ${p.detail}`).join(' ; ') || 'no problem reported');
}

// The clean twin: every plant below differs from this in one place.
const twin = problemsOf(`${collect}&en=page_view&dl=${enc(clean)}&dr=${enc(`${origin}/about`)}`, 'en=cta_clicked&ep.cta_name=hero');
const twinLibrary = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
const twinOk =
  twin.length === 0 &&
  isLibraryUrl(twinLibrary, measurementId) &&
  isLibraryLoad(scriptGet(twinLibrary), measurementId) &&
  !isCollectionRequest(scriptGet(twinLibrary), measurementId);
console.log(
  `${twinOk ? 'CLEAN ' : 'DIRTY '}  clean twin  (${twin.map((p) => `${p.check}: ${p.detail}`).join(' ; ') || 'no problem'}; library address read as the library: ${isLibraryUrl(twinLibrary, measurementId)})`,
);

judgePlant('a field given twice in the address, the dirty value first', `${collect}&en=page_view&dl=${enc(dirty)}&dl=${enc(clean)}`);
judgePlant('a field given twice in one body line, the dirty value first', collect, `en=page_view&dl=${enc(dirty)}&dl=${enc(clean)}`);
judgePlant('a parameter given twice in one body line', `${collect}&dl=${enc(clean)}`, 'en=cta_clicked&ep.cta_name=hero&ep.cta_name=footer');
judgePlant('userinfo in the page address', `${collect}&en=page_view&dl=${enc(`http://proofuser:proofpass@localhost:3000/pricing`)}`);
judgePlant('userinfo in the referrer', `${collect}&en=page_view&dl=${enc(clean)}&dr=${enc('https://proofuser:proofpass@other.example/')}`);
judgePlant('an empty fragment on the page address', `${collect}&en=page_view&dl=${enc(`${origin}/pricing#`)}`);
judgePlant('a fragment on the referrer', `${collect}&en=page_view&dl=${enc(clean)}&dr=${enc(`${origin}/about#`)}`);
judgePlant('utm_term in the page address', `${collect}&en=page_view&dl=${enc(`${origin}/pricing?utm_term=water`)}`);
judgePlant('a phone number as a campaign value', `${collect}&en=page_view&dl=${enc(`${origin}/pricing?utm_source=0412345678`)}`);
judgePlant('a campaign field given twice in the page address', `${collect}&en=page_view&dl=${enc(`${origin}/pricing?utm_source=news&utm_source=mail`)}`);

for (const [name, url] of [
  ['a library address with an extra field', `${twinLibrary}&email=proof-visitor-7731%40example.invalid`],
  ['a library address for another id', 'https://www.googletagmanager.com/gtag/js?id=G-OTHER12345'],
  ['a library address with the id given twice', `${twinLibrary}&id=G-OTHER12345`],
  ['a library address with userinfo', `https://proofuser:proofpass@www.googletagmanager.com/gtag/js?id=${measurementId}`],
  ['a library address on the tag host written with a trailing dot', `https://www.googletagmanager.com./gtag/js?id=${measurementId}`],
]) {
  record(
    name,
    !isLibraryLoad(scriptGet(url), measurementId) && isCollectionRequest(scriptGet(url), measurementId),
    `read as the library: ${isLibraryLoad(scriptGet(url), measurementId)}`,
  );
}
// A Google host written with a trailing dot is the same host to the browser (spec E40).
for (const [name, url] of [
  ['a collection host written with a trailing dot', `https://www.google-analytics.com./g/collect?v=2&tid=${measurementId}`],
  ['a regional collection host written with a trailing dot', `https://region1.analytics.google.com./g/collect?v=2&tid=${measurementId}`],
]) {
  record(
    name,
    !isLibraryLoad(scriptGet(url), measurementId) && isCollectionRequest(scriptGet(url), measurementId),
    `read as the library: ${isLibraryLoad(scriptGet(url), measurementId)}`,
  );
}


// Spec E42 (criterion AC-K1f): the library is a way out and an address
// together. The exact library address reached any other way is collection,
// and its body is checked like any other request.
for (const [name, request] of [
  ['the library address by fetch with a body', { url: twinLibrary, resourceType: 'fetch', method: 'POST', postData: 'email=proof-visitor-7731%40example.invalid&claim=CLM-9' }],
  ['the library address by beacon with a body', { url: twinLibrary, resourceType: 'ping', method: 'POST', postData: 'email=proof-visitor-7731%40example.invalid' }],
  ['the library address by XMLHttpRequest', { url: twinLibrary, resourceType: 'xhr', method: 'GET', postData: '' }],
  ['the library address by an image', { url: twinLibrary, resourceType: 'image', method: 'GET', postData: '' }],
  ['the library address by a script POST', { url: twinLibrary, resourceType: 'script', method: 'POST', postData: '' }],
]) {
  const collection = !isLibraryLoad(request, measurementId) && isCollectionRequest(request, measurementId);
  const problems = checkRecords([{ phase: 'planted', ...request }], context).problems;
  record(name, collection && problems.length > 0, `${collection ? 'read as collection' : 'read as the library'}; ${problems.map((p) => `${p.check}: ${p.detail}`).join(' ; ') || 'no problem reported'}`);
}

// Spec E44 (criterion AC-K1g): the proof reads the site's own Google host
// rule, so a country Google domain is checked as collection, not let go.
{
  const request = {
    url: 'https://www.google.co.uk/measurement?email=alice%40example.org',
    resourceType: 'fetch',
    method: 'POST',
    postData: 'email=proof-visitor-7731%40example.invalid',
  };
  const collection = isCollectionRequest(request, measurementId);
  const problems = collection ? checkRecords([{ phase: 'planted', ...request }], context).problems : [];
  record(
    'a collection request to a country Google domain',
    collection && problems.length > 0,
    `${collection ? 'read as collection' : 'read as an outside host'}; ${problems.map((p) => `${p.check}: ${p.detail}`).join(' ; ') || 'no problem reported'}`,
  );
}

// Spec E46 (criterion AC-K1i): the library's own fields are an allow-list of
// names and value shapes. Neither value below is a planted marker, so only the
// field rule can catch them.
judgePlant('a collection request with a field the library never sends', `${collect}&en=page_view&dl=${enc(clean)}&claim_id=123456789`);
judgePlant('a listed library field holding a planted token', `${collect}&en=page_view&dl=${enc(clean)}&cid=zz9token4417qq`);

// The real library's own fields, as captured, must read clean: the field list
// may not stop real traffic.
const realFields =
  'gtm=45je6bb1v9234167022za208zd9234167022xf1&_p=1794803160958&gcs=G101&gcd=13l3l3l3l1l1&npa=0&dma_cps=-&dma=0&_eu=AEAAAAQ&ae=a&are=1&cid=440459488.1794803162&frm=0&ngs=1&pscdl=noapi&rcb=12&sr=1280x900&uaa=arm&uab=64&uafvl=HeadlessChrome%3B147.0.7727.15%7CNot.A%252FBrand%3B8.0.0.0%7CChromium%3B147.0.7727.15&uam=&uamb=0&uap=macOS&uapv=26.6.2&uaw=0&ul=en-us&_s=1&tag_exp=100940091~115616985~115938465&sid=1794803161&sct=1&seg=0&_tu=wAg&_fv=1&_nsi=1&_ss=1&_ee=1&_et=5894&tfd=816';
const realTwin = problemsOf(`${collect}&${realFields}&en=page_view&dl=${enc(clean)}&dp=%2Fpricing`);
console.log(`${realTwin.length === 0 ? 'CLEAN ' : 'DIRTY '}  the real library's own fields  (${realTwin.map((p) => `${p.check}: ${p.detail}`).join(' ; ') || 'no problem'})`);
if (realTwin.length !== 0) rows.push({ name: "the real library's own fields read clean", pass: false });

const missed = rows.filter((row) => !row.pass).map((row) => row.name);
if (twinOk && missed.length === 0) {
  console.log(`\nCHECKER SELF-TEST PASS: ${rows.length} plants caught, clean twin clean`);
  process.exit(0);
}
console.log(`\nCHECKER SELF-TEST FAIL: ${twinOk ? '' : 'the clean twin is not clean; '}${missed.length} missed${missed.length ? `: ${missed.join(', ')}` : ''}`);
process.exit(1);
