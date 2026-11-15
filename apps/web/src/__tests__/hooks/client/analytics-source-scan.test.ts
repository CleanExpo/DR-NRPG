/**
 * @jest-environment node
 *
 * Nothing in the site's own code may talk to the Google tag except
 * src/lib/analytics.ts (the gate) and the one loader component. A call
 * anywhere else would skip the gate, so this scan fails the build on one.
 *
 * Every form the scan claims to catch is proved against a planted string
 * first: a scan that cannot find a planted call proves nothing by finding none.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const WEB_ROOT = join(__dirname, '..', '..', '..', '..');
const ROOTS = ['app', 'components', 'lib', 'src', 'hooks', 'contexts'];
const CODE_FILE = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const SKIP_DIRS = new Set(['node_modules', '.next', '__tests__', '__mocks__', 'e2e']);
const TEST_FILE = /\.(test|spec)\.[a-z]+$/;

/** The only file that may call the tag or the data layer. */
const GATE_FILE = 'src/lib/analytics.ts';
/** The only file that may load the Google library. */
const LOADER_FILE = 'src/components/analytics/GoogleAnalytics.tsx';

const CALL_FORMS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'a call to gtag', pattern: /\bgtag\s*(\?\.)?\s*\(/ },
  { name: 'gtag reached by a bracket', pattern: /\[\s*['"`]gtag['"`]\s*\]/ },
  { name: 'gtag assigned', pattern: /\bgtag\s*=(?!=)/ },
  { name: 'a push to the data layer', pattern: /\bdataLayer\b\s*(\?\.|\.)\s*push\b/ },
  { name: 'the data layer push reached by a bracket', pattern: /\bdataLayer\b\s*(\?\.)?\s*\[\s*['"`]push/ },
  { name: 'the data layer assigned', pattern: /\bdataLayer\s*=(?!=)/ },
];

const LOADER_FORMS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'the Google tag script', pattern: /googletagmanager\.com\/(gtag\/js|gtm\.js|ns\.html)/ },
  { name: 'the old analytics script', pattern: /google-analytics\.com\/(analytics|ga)\.js/ },
];

/** Remove block and line comments so a commented-out call is not a finding. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1');
}

function findings(source: string, forms: Array<{ name: string; pattern: RegExp }>): string[] {
  const code = stripComments(source);
  return forms.filter((form) => form.pattern.test(code)).map((form) => form.name);
}

function walk(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (!SKIP_DIRS.has(entry)) walk(full, out);
    } else if (CODE_FILE.test(entry) && !TEST_FILE.test(entry)) {
      out.push(full);
    }
  }
}

function rel(file: string): string {
  return relative(WEB_ROOT, file).split(sep).join('/');
}

describe('the scan can see what it claims to catch', () => {
  it.each([
    ["gtag('event', 'x')", 'a call to gtag'],
    ["window.gtag('event', 'x')", 'a call to gtag'],
    ["(window as any).gtag('event', 'x')", 'a call to gtag'],
    ["window.gtag?.('event', 'x')", 'a call to gtag'],
    ["gtag?.('event', 'x')", 'a call to gtag'],
    ["window['gtag']('event', 'x')", 'gtag reached by a bracket'],
    ['window["gtag"]("event")', 'gtag reached by a bracket'],
    ['window.gtag = function () {}', 'gtag assigned'],
    ['window.dataLayer.push({ event: "x" })', 'a push to the data layer'],
    ['dataLayer.push(arguments)', 'a push to the data layer'],
    ['window.dataLayer?.push({})', 'a push to the data layer'],
    ["window.dataLayer['push']({})", 'the data layer push reached by a bracket'],
    ['window.dataLayer = window.dataLayer || []', 'the data layer assigned'],
  ])('finds %s', (planted, expected) => {
    expect(findings(`const a = 1;\n${planted};\n`, CALL_FORMS)).toContain(expected);
  });

  it.each([
    ['<Script src="https://www.googletagmanager.com/gtag/js?id=G-X" />', 'the Google tag script'],
    ["j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i", 'the Google tag script'],
    ['<script src="https://www.google-analytics.com/analytics.js" />', 'the old analytics script'],
  ])('finds the loader in %s', (planted, expected) => {
    expect(findings(planted, LOADER_FORMS)).toContain(expected);
  });

  it('ignores a call that is commented out, and plain words', () => {
    expect(findings("  // gtag('event', 'onboarding_' + event, {\n", CALL_FORMS)).toEqual([]);
    expect(findings("/* window.dataLayer.push({}) */\nconst x = 1;", CALL_FORMS)).toEqual([]);
    expect(findings('const text = "our gtag.js notice"; if (a === gtag) {}', CALL_FORMS)).toEqual([]);
  });

  it('still finds a call that follows a web address on the same line', () => {
    expect(findings("const u = 'https://example.com'; gtag('event', 'x');", CALL_FORMS)).toContain('a call to gtag');
  });
});

describe('the site code', () => {
  const files: string[] = [];
  const perRoot: Record<string, number> = {};

  beforeAll(() => {
    for (const root of ROOTS) {
      const dir = join(WEB_ROOT, root);
      if (!existsSync(dir)) continue;
      const before = files.length;
      walk(dir, files);
      perRoot[root] = files.length - before;
    }
  });

  it('was actually read: every root that exists has code files', () => {
    expect(Object.keys(perRoot).length).toBeGreaterThanOrEqual(4);
    for (const [root, count] of Object.entries(perRoot)) {
      expect({ root, hasFiles: count > 0 }).toEqual({ root, hasFiles: true });
    }
    expect(files.length).toBeGreaterThan(500);
    expect(files.map(rel)).toContain(GATE_FILE);
    expect(files.map(rel)).toContain(LOADER_FILE);
  });

  it('positive control: the gate file itself is seen to push to the data layer', () => {
    const source = readFileSync(join(WEB_ROOT, GATE_FILE), 'utf8');
    expect(findings(source, CALL_FORMS)).toContain('a push to the data layer');
    const loader = readFileSync(join(WEB_ROOT, LOADER_FILE), 'utf8');
    expect(findings(loader, LOADER_FORMS)).toContain('the Google tag script');
  });

  it('calls the tag or the data layer only inside the gate file', () => {
    const found: string[] = [];
    for (const file of files) {
      const name = rel(file);
      if (name === GATE_FILE) continue;
      for (const hit of findings(readFileSync(file, 'utf8'), CALL_FORMS)) {
        found.push(`${name}: ${hit}`);
      }
    }
    expect(found).toEqual([]);
  });

  it('loads the Google library only from the one loader component', () => {
    const found: string[] = [];
    for (const file of files) {
      const name = rel(file);
      if (name === LOADER_FILE) continue;
      for (const hit of findings(readFileSync(file, 'utf8'), LOADER_FORMS)) {
        found.push(`${name}: ${hit}`);
      }
    }
    expect(found).toEqual([]);
  });

  it('no longer has the second, ungated tracking module', () => {
    expect(existsSync(join(WEB_ROOT, 'lib', 'analytics', 'tracking.ts'))).toBe(false);
  });
});
