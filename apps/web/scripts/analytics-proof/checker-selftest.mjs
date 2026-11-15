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
import { checkRecords, isCollectionUrl, isLibraryUrl } from './lib/checker.mjs';

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
const twinOk = twin.length === 0 && isLibraryUrl(twinLibrary, measurementId) && !isCollectionUrl(twinLibrary, measurementId);
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
  record(name, !isLibraryUrl(url, measurementId) && isCollectionUrl(url, measurementId), `read as the library: ${isLibraryUrl(url, measurementId)}`);
}
// A Google host written with a trailing dot is the same host to the browser (spec E40).
for (const [name, url] of [
  ['a collection host written with a trailing dot', `https://www.google-analytics.com./g/collect?v=2&tid=${measurementId}`],
  ['a regional collection host written with a trailing dot', `https://region1.analytics.google.com./g/collect?v=2&tid=${measurementId}`],
]) {
  record(name, !isLibraryUrl(url, measurementId) && isCollectionUrl(url, measurementId), `read as the library: ${isLibraryUrl(url, measurementId)}`);
}

const missed = rows.filter((row) => !row.pass).map((row) => row.name);
if (twinOk && missed.length === 0) {
  console.log(`\nCHECKER SELF-TEST PASS: ${rows.length} plants caught, clean twin clean`);
  process.exit(0);
}
console.log(`\nCHECKER SELF-TEST FAIL: ${twinOk ? '' : 'the clean twin is not clean; '}${missed.length} missed${missed.length ? `: ${missed.join(', ')}` : ''}`);
process.exit(1);
