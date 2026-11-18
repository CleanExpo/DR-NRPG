/**
 * DR-947: every internal link on the client and contractor first-run walks must lead
 * to a page that exists. The walks used to end on 404s (/dashboard/client/requests/new,
 * /dashboard/contractor/my-bids, /dashboard/contractor/resources/growth-guide) because
 * nothing checked a hard-coded href against the app's routes.
 *
 * The route table is read from the app directory itself, so a new page or a deleted
 * page changes the answer without editing this test.
 */
import fs from 'fs';
import path from 'path';

const WEB_ROOT = path.resolve(__dirname, '../../..');
const APP_DIR = path.join(WEB_ROOT, 'app');

/** The surfaces a stranger walks through on the first run, plus the emails that link back in. */
const WALK_SOURCES = [
  'app/(public)/page.tsx',
  'app/signup',
  'app/login',
  'app/auth',
  'app/claim',
  'app/onboarding',
  'app/dashboard/client',
  'app/dashboard/contractor',
  'components/onboarding',
  'components/client-onboarding.tsx',
  'lib/notifications/templates.ts',
];

/**
 * Known dead links outside the first-run walk, each with the ticket that owns it.
 * Adding to this list needs a ticket; it is not a way to make the test pass.
 */
const KNOWN_DEAD: Record<string, string> = {
  // Payments page "Manage Subscription"; client subscriptions have an API but no page yet.
  '/dashboard/client/subscription': 'DR-947 follow-up (payments page, not on the first-run walk)',
};

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function routeTable(): string[][] {
  return walk(APP_DIR)
    .filter((f) => /[\\/](page|route)\.(tsx|ts|js)$/.test(f))
    .map((f) =>
      path
        .relative(APP_DIR, path.dirname(f))
        .split(path.sep)
        .filter((s) => s && !(s.startsWith('(') && s.endsWith(')')) && !s.startsWith('@')),
    );
}

export function routeExists(url: string, routes: string[][]): boolean {
  const segs = url.split(/[?#]/)[0].split('/').filter(Boolean);
  if (segs.length === 0) return true;
  return routes.some((r) => {
    const catchAll = r.length > 0 && /^\[\[?\.\.\./.test(r[r.length - 1]);
    if (!catchAll && r.length !== segs.length) return false;
    for (let i = 0; i < r.length; i++) {
      if (/^\[\[?\.\.\./.test(r[i])) return true;
      if (i >= segs.length) return false;
      if (r[i].startsWith('[')) continue;
      if (r[i] !== segs[i]) return false;
    }
    return true;
  });
}

const LINK = /(?:href=|push\(|replace\(|redirect\(|href:\s*)\s*\{?\s*[`'"](\/[A-Za-z0-9_\-/.?=&]*)/g;
const TEMPLATE_HOST = /\$\{(?:SITE_URL|baseUrl|BASE_URL|appUrl)\}(\/[A-Za-z0-9_\-/.?=&]*)/g;

function linksIn(file: string): Array<{ url: string; where: string }> {
  const found: Array<{ url: string; where: string }> = [];
  fs.readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const re of [LINK, TEMPLATE_HOST]) {
        re.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(line))) {
          // A link that continues into ${...} is only a prefix; its full value is dynamic.
          if (line[m.index + m[0].length] === '$') continue;
          if (m[1].startsWith('/api/')) continue;
          found.push({ url: m[1], where: `${path.relative(WEB_ROOT, file)}:${i + 1}` });
        }
      }
    });
  return found;
}

function walkFiles(): string[] {
  return WALK_SOURCES.flatMap((rel) => {
    const full = path.join(WEB_ROOT, rel);
    if (!fs.existsSync(full)) throw new Error(`walk source missing: ${rel}`);
    return fs.statSync(full).isDirectory() ? walk(full) : [full];
  }).filter((f) => /\.(tsx|ts)$/.test(f));
}

describe('DR-947 first-run walk links', () => {
  const routes = routeTable();

  it('reads a real route table (positive control)', () => {
    expect(routeExists('/signup', routes)).toBe(true);
    expect(routeExists('/claim/step-1', routes)).toBe(true);
    expect(routeExists('/dashboard/client/callout/abc123', routes)).toBe(true);
    expect(routeExists('/dashboard/client/no-such-page', routes)).toBe(false);
  });

  it('finds the links it is meant to check', () => {
    const urls = walkFiles().flatMap(linksIn).map((l) => l.url);
    expect(urls).toEqual(expect.arrayContaining(['/dashboard/contractor/my-bids', '/dashboard/contractor']));
    expect(urls.length).toBeGreaterThan(20);
  });

  it('every internal link on the walk resolves to a page', () => {
    const dead = walkFiles()
      .flatMap(linksIn)
      .filter((l) => !routeExists(l.url, routes) && !(l.url.split('?')[0] in KNOWN_DEAD))
      .map((l) => `${l.where} -> ${l.url}`);
    expect(dead).toEqual([]);
  });

  it('the shared "create request" link resolves to a page', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { newRequestHref } = require('@/lib/onboarding/new-request-link');
    expect(routeExists(newRequestHref(), routes)).toBe(true);
    expect(routeExists(newRequestHref({ emergency: true }), routes)).toBe(true);
  });
});
