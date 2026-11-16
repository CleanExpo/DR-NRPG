/**
 * Start the site locally for the analytics proof scripts, and stop it again.
 *
 * The site refuses to start without a database address and an auth signing
 * value (lib/env.ts). The public pages these scripts test use neither, so both
 * are made up fresh for each run: random text, and a database address on a
 * closed local port that nothing can connect to.
 *
 * Nothing is inherited from the shell but PATH, HOME and a few locale and
 * temp-folder names (spec E36): a key set there (a captcha key, another
 * measurement id, a database address) cannot change the path under test or
 * reach a real service. The captcha keys are set empty on purpose, so the
 * development server offers its stand-in. A `.env` file beside the site could
 * add values the same way, so the start refuses while one is there. The
 * production server is handed no measurement id at all: the build baked one
 * in, so the start reads it back out of the build and refuses another.
 */
import { execFileSync, spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const WEB_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

/** The real public id for nrpg.business. Public by design: it is in every page. */
export const REAL_MEASUREMENT_ID = 'G-RK33F1ZD1H';

/**
 * The tree a proof run was made on: the commit, whether anything was changed
 * on top of it, and the id of the production build in .next (absent while the
 * development server is in use). Written into every proof file, so evidence
 * cannot be mistaken for evidence about some other tree.
 */
export function treeStamp() {
  const git = (...args) => {
    try {
      return execFileSync('git', args, { cwd: WEB_ROOT, encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  };
  const changed = git('status', '--porcelain');
  let buildId = 'no production build';
  try {
    buildId = readFileSync(path.join(WEB_ROOT, '.next', 'BUILD_ID'), 'utf8').trim();
  } catch {
    // The development server keeps no build id.
  }
  return {
    commit: git('rev-parse', 'HEAD'),
    treeClean: changed === '',
    changedFiles: changed === '' || changed === 'unknown' ? 0 : changed.split('\n').length,
    buildId,
  };
}

function randomWord(bytes = 12) {
  return randomBytes(bytes).toString('hex');
}

/** Ask the system for a port nobody is using. */
export function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.unref();
    probe.on('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

/** The only names taken from the shell: where programs and home are, locale, temp folder. */
const PASSED_ON = ['PATH', 'HOME', 'TMPDIR', 'LANG', 'LC_ALL', 'TZ'];

/**
 * The whole environment the site is started with, built here and nowhere
 * else. `inherited` is the shell's environment (a parameter so the self-test
 * can plant values in it).
 */
export function siteEnv({ port, mode, measurementId, inherited = process.env }) {
  if (mode !== 'start' && mode !== 'dev') throw new Error(`unknown mode ${mode}`);
  const env = {};
  for (const name of PASSED_ON) {
    if (typeof inherited[name] === 'string') env[name] = inherited[name];
  }
  const closedDatabase = `postgresql://${randomWord()}:${randomWord()}@127.0.0.1:9/${randomWord()}`;
  Object.assign(env, {
    NEXT_TELEMETRY_DISABLED: '1',
    PORT: String(port),
    NEXTAUTH_URL: `http://localhost:${port}`,
    NEXTAUTH_SECRET: randomWord(32),
    DATABASE_URL: closedDatabase,
    DIRECT_URL: closedDatabase,
    // Empty, not absent: with no captcha key the development server offers
    // its stand-in, and nothing can sign a real captcha answer.
    NEXT_PUBLIC_HCAPTCHA_SITE_KEY: '',
    HCAPTCHA_SECRET: '',
    HCAPTCHA_SECRET_KEY: '',
    RECAPTCHA_SECRET_KEY: '',
  });
  // The development server builds as it serves, so the id it is given is the
  // id it uses. The production server is given none: its build holds the id.
  if (mode === 'dev') env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = measurementId;
  return env;
}

/** Files beside the site that Next.js would read values from. `.env.example` is not one. */
export function envFilesBeside(root = WEB_ROOT) {
  let names = [];
  try {
    names = readdirSync(root);
  } catch {
    return [];
  }
  return names.filter((name) => /^\.env(\..+)?$/.test(name) && !/\.example$/.test(name)).sort();
}

/**
 * True when a file under `dir` holds `text` as a whole token (spec E45), not
 * inside something longer: a build made with `G-ABC123X` must not pass for
 * one made with `G-ABC123`. A letter, digit, underscore or dash on either
 * side makes it part of something longer.
 */
function holdsToken(dir, text) {
  if (!existsSync(dir)) return false;
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const token = new RegExp(`(?<![A-Za-z0-9_-])${escaped}(?![A-Za-z0-9_-])`);
  const pending = [dir];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const name of readdirSync(current)) {
      const full = path.join(current, name);
      const info = statSync(full);
      if (info.isDirectory()) pending.push(full);
      else if (/\.(js|html|rsc|body|json|txt)$/.test(name) && token.test(readFileSync(full, 'utf8'))) return true;
    }
  }
  return false;
}

/**
 * Read the measurement id back out of the production build in `root/.next`:
 * the browser code and the server output must both hold the expected id.
 * Throws, naming what is missing, when they do not, so a build made with
 * another id (or none) is never served as proof about this one.
 */
export function checkBuild(root, measurementId) {
  const next = path.join(root, '.next');
  if (!existsSync(path.join(next, 'BUILD_ID'))) throw new Error(`no production build in ${next}`);
  const missing = [];
  if (!holdsToken(path.join(next, 'static'), measurementId)) missing.push('the browser code (.next/static)');
  if (!holdsToken(path.join(next, 'server'), measurementId)) missing.push('the server output (.next/server)');
  if (missing.length > 0) {
    throw new Error(`the build was not made with measurement id ${measurementId}: it is absent from ${missing.join(' and ')}`);
  }
  return { buildId: readFileSync(path.join(next, 'BUILD_ID'), 'utf8').trim(), measurementId };
}

async function waitUntilServing(url, child, output, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`the site stopped before it was ready (exit ${child.exitCode})\n${output.text()}`);
    }
    try {
      const response = await fetch(url, { redirect: 'manual' });
      // Any answer from the site itself means it is serving.
      if (response.status > 0) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`the site did not answer at ${url} within ${timeoutMs} ms\n${output.text()}`);
}

/**
 * mode 'start' serves the production build already in .next (run the build
 * first), after reading the measurement id back out of it; mode 'dev' runs
 * the development server with the id. The only way the proof scripts start
 * the site. Returns { url, port, stop, output, build }.
 */
export async function startSite({ mode = 'start', measurementId, timeoutMs = 180000, readyPath = '/about' } = {}) {
  if (typeof measurementId !== 'string' || !/^G-[A-Z0-9]{4,20}$/.test(measurementId)) {
    throw new Error(`startSite needs the measurement id (got ${measurementId})`);
  }
  const files = envFilesBeside(WEB_ROOT);
  if (files.length > 0) {
    throw new Error(`refusing to start: ${files.join(', ')} in ${WEB_ROOT} could add values to the proof run; move it aside`);
  }
  const build = mode === 'start' ? checkBuild(WEB_ROOT, measurementId) : null;
  const port = await freePort();
  const next = path.join(WEB_ROOT, 'node_modules', '.bin', 'next');
  const child = spawn(next, [mode, '--port', String(port)], {
    cwd: WEB_ROOT,
    env: siteEnv({ port, mode, measurementId }),
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const chunks = [];
  const keep = (chunk) => {
    chunks.push(String(chunk));
    if (chunks.length > 400) chunks.shift();
  };
  child.stdout.on('data', keep);
  child.stderr.on('data', keep);
  const output = { text: () => chunks.join('').slice(-6000) };

  let stopped = false;
  const stop = async () => {
    if (stopped) return;
    stopped = true;
    try {
      // The server starts workers; stop the whole group.
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      // Already gone.
    }
    await new Promise((resolve) => {
      if (child.exitCode !== null) return resolve();
      const force = setTimeout(() => {
        try {
          process.kill(-child.pid, 'SIGKILL');
        } catch {
          // Already gone.
        }
        resolve();
      }, 5000);
      child.once('exit', () => {
        clearTimeout(force);
        resolve();
      });
    });
  };

  const url = `http://localhost:${port}`;
  try {
    await waitUntilServing(url + readyPath, child, output, timeoutMs);
  } catch (error) {
    await stop();
    throw error;
  }
  return { url, port, stop, output, build };
}
