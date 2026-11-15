#!/usr/bin/env node
/**
 * Security-policy header check on the production build.
 *
 * For each address: exactly one Content-Security-Policy header on the
 * response, naming the Google Analytics hosts on public content and no Google
 * host anywhere else. The expected text is written out here, not read from
 * the site's code. Raw headers are read, because the usual fetch API joins
 * two headers of the same name into one and would hide a duplicate.
 *
 *   node scripts/analytics-proof/header-check.mjs
 */
import http from 'node:http';
import { REAL_MEASUREMENT_ID, startSite } from './lib/server.mjs';
import { LISTED_PATHS, Results } from './lib/checker.mjs';
import { writeProof } from './lib/session.mjs';

const CLOSED_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://hcaptcha.com https://*.hcaptcha.com",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://cdn.jsdelivr.net",
  "connect-src 'self' https://hcaptcha.com https://*.hcaptcha.com https://*.supabase.co wss://*.supabase.co",
  "frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const OPEN_POLICY = CLOSED_POLICY.replace(
  'https://*.hcaptcha.com; style-src',
  'https://*.hcaptcha.com https://www.googletagmanager.com; style-src',
).replace(
  'wss://*.supabase.co; frame-src',
  'wss://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com; frame-src',
);

const OPEN = [
  ...LISTED_PATHS,
  '/services/water-damage',
  '/locations',
  '/guides',
  '/resources',
  '/training',
  '/case-studies',
  '/claim/success?claimId=HEADERCHECK',
];
const CLOSED = [
  '/login',
  '/login?next=/services',
  '/dashboard',
  '/dashboard/admin',
  '/admin',
  '/auth/reset-password',
  '/onboarding',
  '/launch/thank-you',
  '/portal',
  '/search',
  '/brisbane',
  '/api/health',
  '/api/public/claims/submit',
  '/no-such-page-header-check',
  '/Services',
];
const STATIC = ['/_next/static/header-check-no-such-file.js', '/favicon.ico'];

function head(base, target) {
  return new Promise((resolve, reject) => {
    const request = http.get(base + target, (response) => {
      const policies = [];
      for (let i = 0; i < response.rawHeaders.length; i += 2) {
        if (response.rawHeaders[i].toLowerCase() === 'content-security-policy') policies.push(response.rawHeaders[i + 1]);
      }
      response.resume();
      response.on('end', () => resolve({ status: response.statusCode, policies, location: response.headers.location ?? '' }));
    });
    request.setTimeout(60000, () => request.destroy(new Error(`timed out: ${target}`)));
    request.on('error', reject);
  });
}

if (OPEN_POLICY === CLOSED_POLICY || !OPEN_POLICY.includes('https://www.google-analytics.com')) {
  console.error('HEADER CHECK ERROR: the expected open policy was not built');
  process.exit(1);
}

let site;
let exitCode = 1;
try {
  site = await startSite({ mode: 'start', env: { NEXT_PUBLIC_GA4_MEASUREMENT_ID: REAL_MEASUREMENT_ID } });
  console.log(`header check: production build served at ${site.url}`);
  const results = new Results('header check');
  const rows = [];

  for (const [kind, list, expected] of [
    ['open', OPEN, OPEN_POLICY],
    ['closed', CLOSED, CLOSED_POLICY],
  ]) {
    for (const target of list) {
      const answer = await head(site.url, target);
      rows.push({ kind, target, ...answer });
      const one = answer.policies.length === 1;
      const exact = one && answer.policies[0] === expected;
      const google = answer.policies.some((policy) => /google/i.test(policy));
      // A redirect the middleware issues itself (an admin page with no session)
      // is a bare "go to /login" with no document, and has never carried a
      // policy. That is accepted for a closed address only, and said out loud.
      const bareRedirect =
        kind === 'closed' && answer.policies.length === 0 && answer.status >= 300 && answer.status < 400;
      if (bareRedirect) {
        console.log(`NOTE  closed ${target}: status ${answer.status} redirect to ${answer.location} with no policy header (no document is served)`);
        continue;
      }
      const pass = one && exact && google === (kind === 'open');
      results.record(
        `${kind} ${target}`,
        pass,
        `status ${answer.status}, ${answer.policies.length} policy header(s)${one && !exact ? ', text differs from the expected policy' : ''}${
          google ? ', names Google' : ', no Google host'
        }${answer.location ? `, redirects to ${answer.location}` : ''}`,
      );
    }
  }

  // Not judged, reported: files the middleware does not handle carry no policy
  // now that the copy in the site config is gone. A policy only acts on documents.
  for (const target of STATIC) {
    const answer = await head(site.url, target);
    rows.push({ kind: 'static', target, ...answer });
    console.log(`NOTE  static ${target}: status ${answer.status}, ${answer.policies.length} policy header(s)`);
    if (answer.policies.some((policy) => /google/i.test(policy))) {
      results.record(`static ${target}`, false, 'a static file names a Google host');
    }
  }

  const file = writeProof('header-check.json', { kind: 'header-check', at: new Date().toISOString(), site: site.url, rows, checks: results.rows });
  console.log(`\nproof written to ${file}`);
  if (results.ok()) {
    console.log(`\nHEADER CHECK PASS: ${results.rows.length} addresses, one policy header each`);
    exitCode = 0;
  } else {
    console.log(`\nHEADER CHECK FAIL: ${results.failed().join(', ')}`);
  }
} catch (error) {
  console.error(`HEADER CHECK ERROR: ${error?.stack ?? error}`);
} finally {
  if (site) await site.stop();
}
process.exit(exitCode);
