#!/usr/bin/env node
/**
 * Offline self-test of how the proof scripts start the site (spec E36,
 * criterion AC-K3).
 *
 * A proof setting must reach what it claims to. Three ways it did not:
 *   - the measurement id handed to the production server at start is inert,
 *     because the build bakes the id in; so the start function reads the id
 *     back out of the build and refuses a build made with another id, or none;
 *   - a value inherited from the shell (a captcha key, another id) changes
 *     the path under test; so the environment is built from an allow-list and
 *     an .env file beside the site, which could add values, stops the start;
 *   - a redirect to another listed page stood in for the page asked for; so
 *     every listed page has a stated landing, and any other landing fails.
 * Each case plants the fault in a throwaway folder or a made-up environment
 * and passes only when it is refused; each has a clean twin that must pass.
 * No server is started.
 *
 * Exit 0 only when every plant is refused and every twin accepted.
 *
 *   node scripts/analytics-proof/server-selftest.mjs
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const server = await import('./lib/server.mjs');
const checker = await import('./lib/checker.mjs');
const id = server.REAL_MEASUREMENT_ID;
const rows = [];
function record(name, pass, detail = '') {
  rows.push({ name, pass: pass === true });
  console.log(`${pass === true ? 'OK    ' : 'FAILED'}  ${name}${detail ? `  (${detail})` : ''}`);
}
function attempt(fn) {
  try {
    return { value: fn() };
  } catch (error) {
    return { error: String(error?.message ?? error) };
  }
}

const scratch = mkdtempSync(path.join(tmpdir(), 'ws-ga4-k3-'));
function plantedBuild(name, { client, server: serverText }) {
  const root = path.join(scratch, name);
  mkdirSync(path.join(root, '.next', 'static', 'chunks'), { recursive: true });
  mkdirSync(path.join(root, '.next', 'server', 'app'), { recursive: true });
  writeFileSync(path.join(root, '.next', 'BUILD_ID'), `planted-${name}`);
  if (client !== undefined) writeFileSync(path.join(root, '.next', 'static', 'chunks', 'main.js'), `var a="${client}";`);
  if (serverText !== undefined) writeFileSync(path.join(root, '.next', 'server', 'app', 'page.html'), `<p>${serverText}</p>`);
  return root;
}

try {
  // 1. The build is read back for its measurement id.
  const check = typeof server.checkBuild === 'function' ? server.checkBuild : null;
  record('the start function has a build check', check !== null);
  if (check) {
    const judge = (root) => attempt(() => check(root, id));
    const good = judge(plantedBuild('good', { client: id, server: id }));
    record('clean twin: a build made with the expected id is accepted', !good.error, good.error ?? 'accepted');
    for (const [name, build] of [
      ['a build made with another id', { client: 'G-OTHER12345', server: 'G-OTHER12345' }],
      ['a build made with no id', { client: 'nothing', server: 'nothing' }],
      ['a build whose server output has no id', { client: id, server: 'nothing' }],
      ['a build whose browser code has another id', { client: 'G-OTHER12345', server: id }],
    ]) {
      const result = judge(plantedBuild(name.replace(/\W+/g, '-'), build));
      record(`${name} is refused`, Boolean(result.error), result.error ?? 'accepted');
    }
    const absent = attempt(() => check(path.join(scratch, 'no-build-here'), id));
    record('no build at all is refused', Boolean(absent.error), absent.error ?? 'accepted');
  }

  // 2. The environment is built from an allow-list.
  const build = typeof server.siteEnv === 'function' ? server.siteEnv : null;
  record('the start function builds its own environment', build !== null);
  if (build) {
    const inherited = {
      PATH: '/usr/bin:/bin',
      HOME: '/tmp/proof-home',
      NEXT_PUBLIC_HCAPTCHA_SITE_KEY: 'planted-site-key',
      HCAPTCHA_SECRET_KEY: 'planted-secret',
      NEXT_PUBLIC_GA4_MEASUREMENT_ID: 'G-OTHER12345',
      NEXT_PUBLIC_SUPABASE_URL: 'https://planted.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'planted-service-key',
      DATABASE_URL: 'postgresql://planted',
    };
    const dev = build({ port: 4321, mode: 'dev', measurementId: id, inherited });
    const start = build({ port: 4321, mode: 'start', measurementId: id, inherited });
    record('clean twin: PATH and HOME are passed on', dev.PATH === inherited.PATH && dev.HOME === inherited.HOME);
    record('the development server is given the expected id', dev.NEXT_PUBLIC_GA4_MEASUREMENT_ID === id, String(dev.NEXT_PUBLIC_GA4_MEASUREMENT_ID));
    record(
      'the production server is handed no id (the build holds it)',
      !('NEXT_PUBLIC_GA4_MEASUREMENT_ID' in start),
      String(start.NEXT_PUBLIC_GA4_MEASUREMENT_ID),
    );
    for (const env of [dev, start]) {
      const mode = env === dev ? 'development' : 'production';
      record(`${mode}: the captcha site key is set empty, not inherited`, env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY === '', JSON.stringify(env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY));
      record(`${mode}: the captcha secret is set empty, not inherited`, env.HCAPTCHA_SECRET_KEY === '', JSON.stringify(env.HCAPTCHA_SECRET_KEY));
      const leaked = Object.keys(env).filter((key) => key in inherited && env[key] === inherited[key] && !['PATH', 'HOME'].includes(key));
      record(`${mode}: nothing else inherited reaches the site`, leaked.length === 0, leaked.join(', ') || 'none');
      record(`${mode}: the database address is a closed local one`, /@127\.0\.0\.1:9\//.test(env.DATABASE_URL ?? ''));
    }
  }

  // 3. An .env file beside the site could add values: the start refuses.
  const files = typeof server.envFilesBeside === 'function' ? server.envFilesBeside : null;
  record('the start function looks for .env files', files !== null);
  if (files) {
    const bare = path.join(scratch, 'bare');
    mkdirSync(bare, { recursive: true });
    writeFileSync(path.join(bare, '.env.example'), 'NEXT_PUBLIC_HCAPTCHA_SITE_KEY=\n');
    record('clean twin: .env.example alone is not a value file', files(bare).length === 0, files(bare).join(', ') || 'none');
    for (const name of ['.env', '.env.local', '.env.production', '.env.development.local']) {
      const root = path.join(scratch, `with${name}`);
      mkdirSync(root, { recursive: true });
      writeFileSync(path.join(root, name), 'NEXT_PUBLIC_HCAPTCHA_SITE_KEY=planted\n');
      record(`${name} is found`, files(root).includes(name), files(root).join(', ') || 'none');
    }
  }

  // 4. Every listed page has a stated landing; any other landing fails.
  const landings = checker.LANDINGS;
  const problem = typeof checker.landingProblem === 'function' ? checker.landingProblem : null;
  record('every listed page has a stated landing', Boolean(landings) && checker.LISTED_PATHS.every((p) => typeof landings[p] === 'string'));
  if (problem && landings) {
    record('clean twin: /about landing on /about passes', problem('/about', '/about') === null);
    record('clean twin: /quote landing on /claim/step-1 passes', problem('/quote', '/claim/step-1') === null);
    record('/about landing on /claim/step-1 fails', problem('/about', '/claim/step-1') !== null);
    record('/quote landing on /quote fails', problem('/quote', '/quote') !== null);
    record('/signup landing on /login fails', problem('/signup', '/login') !== null);
    record('a page that did not land fails', problem('/about', undefined) !== null);
  } else {
    record('the sweep has a landing judge', false);
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

const failed = rows.filter((row) => !row.pass).map((row) => row.name);
if (failed.length === 0) {
  console.log(`\nSTART SELF-TEST PASS: ${rows.length} checks`);
  process.exit(0);
}
console.log(`\nSTART SELF-TEST FAIL: ${failed.length} of ${rows.length}: ${failed.join('; ')}`);
process.exit(1);
