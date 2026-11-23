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
const KNOWN_DEAD: Record<string, string> = {};

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

/**
 * DR-1008: a path held in a constant and used by name (`href={growthPath}`) slipped past
 * the guard, because LINK only reads a literal written at the call site. These read the
 * constant's value and the places that link to it by name.
 */
const PATH_CONST = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::\s*[\w<>[\]| ]+)?=\s*[`'"](\/[A-Za-z0-9_\-/.?=&]*)([`'"$])/g;
const LINK_BY_NAME = /(?:href=\{|push\(|replace\(|redirect\(|href:\s*)\s*([A-Za-z_$][\w$]*)\s*[)},]/g;
const ALIAS_IMPORT = /import\s*\{([^}]*)\}\s*from\s*['"](@\/[^'"]+)['"]/g;

type Link = { url: string; where: string };

/** Path constants declared in `source`, by name. Template literals that continue into ${...} are dynamic and skipped. */
function pathConstants(source: string): Map<string, string> {
  const out = new Map<string, string>();
  PATH_CONST.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = PATH_CONST.exec(source))) {
    if (m[3] === '$') continue;
    out.set(m[1], m[2]);
  }
  return out;
}

/** Resolve an `@/...` import to a file, mirroring the tsconfig paths ('./*' then './src/*'). */
function resolveAlias(spec: string): string | null {
  const rel = spec.slice(2);
  for (const base of [WEB_ROOT, path.join(WEB_ROOT, 'src')]) {
    for (const ext of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
      const candidate = path.join(base, rel + ext);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

/** Path constants a file imports by name from an `@/...` module. */
function importedPathConstants(source: string, readModule: (spec: string) => string | null): Map<string, string> {
  const out = new Map<string, string>();
  ALIAS_IMPORT.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ALIAS_IMPORT.exec(source))) {
    const moduleSource = readModule(m[2]);
    if (!moduleSource) continue;
    const exported = pathConstants(moduleSource);
    for (const part of m[1].split(',')) {
      const [imported, local = imported] = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/);
      const url = exported.get(imported?.trim());
      if (url) out.set(local.trim(), url);
    }
  }
  return out;
}

function readAliasModule(spec: string): string | null {
  const file = resolveAlias(spec);
  return file ? fs.readFileSync(file, 'utf8') : null;
}

export function linksInSource(
  source: string,
  where: string,
  readModule: (spec: string) => string | null = () => null,
): Link[] {
  const found: Link[] = [];
  const named = new Map([...importedPathConstants(source, readModule), ...pathConstants(source)]);
  source.split('\n').forEach((line, i) => {
    for (const re of [LINK, TEMPLATE_HOST]) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(line))) {
        // A link that continues into ${...} is only a prefix; its full value is dynamic.
        if (line[m.index + m[0].length] === '$') continue;
        if (m[1].startsWith('/api/')) continue;
        found.push({ url: m[1], where: `${where}:${i + 1}` });
      }
    }
    LINK_BY_NAME.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = LINK_BY_NAME.exec(line))) {
      const url = named.get(m[1]);
      if (!url || url.startsWith('/api/')) continue;
      found.push({ url, where: `${where}:${i + 1} (${m[1]})` });
    }
  });
  return found;
}

function linksIn(file: string): Link[] {
  return linksInSource(fs.readFileSync(file, 'utf8'), path.relative(WEB_ROOT, file), readAliasModule);
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
    // Reached only through the imported CLIENT_DASHBOARD_PATH constant (DR-1008).
    expect(walkFiles().flatMap(linksIn)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: '/dashboard/client', where: expect.stringContaining('(CLIENT_DASHBOARD_PATH)') }),
      ]),
    );
    expect(urls.length).toBeGreaterThan(20);
  });

  it('follows a link held in a constant (DR-1008: the Codex plant)', () => {
    const planted = [
      "const growthPath = '/dashboard/contractor/resources/growth-guide';",
      'export default function Card() {',
      '  return <Link href={growthPath}>Read</Link>;',
      '}',
    ].join('\n');
    const links = linksInSource(planted, 'planted.tsx');
    expect(links).toEqual([
      { url: '/dashboard/contractor/resources/growth-guide', where: 'planted.tsx:3 (growthPath)' },
    ]);
    expect(routeExists(links[0].url, routes)).toBe(false);
  });

  it('follows a link constant imported from another module', () => {
    const source = [
      "import { CLIENT_DASHBOARD_PATH as home } from '@/lib/paths';",
      'router.replace(home);',
    ].join('\n');
    const links = linksInSource(source, 'page.tsx', (spec) =>
      spec === '@/lib/paths' ? "export const CLIENT_DASHBOARD_PATH = '/dashboard/client';" : null,
    );
    expect(links).toEqual([{ url: '/dashboard/client', where: 'page.tsx:2 (home)' }]);
  });

  it('ignores a constant that is only a prefix of a dynamic path', () => {
    const source = ['const base = `/dashboard/client/${id}`;', '<Link href={base} />'].join('\n');
    expect(linksInSource(source, 'x.tsx')).toEqual([]);
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
