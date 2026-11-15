/**
 * Start the site locally for the analytics proof scripts, and stop it again.
 *
 * The site refuses to start without a database address and an auth signing
 * value (lib/env.ts). The public pages these scripts test use neither, so both
 * are made up fresh for each run: random text, and a database address on a
 * closed local port that nothing can connect to. Values already in the
 * environment are replaced on purpose, so a proof run can never reach a real
 * database or sign anything with a real key.
 */
import { execFileSync, spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
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

function throwawayEnv(port, extra) {
  const closedDatabase = `postgresql://${randomWord()}:${randomWord()}@127.0.0.1:9/${randomWord()}`;
  return {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: '1',
    PORT: String(port),
    NEXTAUTH_URL: `http://localhost:${port}`,
    NEXTAUTH_SECRET: randomWord(32),
    DATABASE_URL: closedDatabase,
    DIRECT_URL: closedDatabase,
    ...extra,
  };
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
 * first); mode 'dev' runs the development server.
 * Returns { url, port, stop, output }.
 */
export async function startSite({ mode = 'start', env = {}, timeoutMs = 180000, readyPath = '/about' } = {}) {
  const port = await freePort();
  const next = path.join(WEB_ROOT, 'node_modules', '.bin', 'next');
  const child = spawn(next, [mode, '--port', String(port)], {
    cwd: WEB_ROOT,
    env: throwawayEnv(port, env),
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
  return { url, port, stop, output };
}
