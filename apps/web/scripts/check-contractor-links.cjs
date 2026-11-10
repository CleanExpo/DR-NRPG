#!/usr/bin/env node
/**
 * Fails when source code links to /contractor/<word> and no page lives there.
 *
 * Why: the only route under /contractor/ is the private profile page
 * /contractor/[id]. A link such as /contractor/join is read as a profile id,
 * so the visitor gets an error page instead of the page the link meant.
 * A route group folder such as app/(contractor)/ adds NO address segment:
 * app/(contractor)/portal/page.tsx is served at /portal.
 *
 * Usage:
 *   node scripts/check-contractor-links.cjs            check this app
 *   node scripts/check-contractor-links.cjs --selftest prove the check can fail
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const SCAN_DIRS = ['app', 'components', 'src', 'lib'];
const SKIP_DIRS = new Set(['node_modules', '.next', '__tests__', 'coverage']);
const SOURCE_FILE = /\.(ts|tsx|js|jsx)$/;
const PAGE_FILE = /^page\.(ts|tsx|js|jsx)$/;
const LINK = /['"`](\/contractor\/[a-z0-9][a-z0-9/_-]*)/gi;

function walk(dir, onFile) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(full, onFile);
    } else {
      onFile(full, entry.name);
    }
  }
}

/** Every page address under /contractor/, as arrays of segments. */
function contractorRoutes(root) {
  const appDir = path.join(root, 'app');
  const routes = [];
  walk(appDir, (full, name) => {
    if (!PAGE_FILE.test(name)) return;
    const segments = path
      .relative(appDir, path.dirname(full))
      .split(path.sep)
      .filter((s) => s && !(s.startsWith('(') && s.endsWith(')')));
    if (segments[0] === 'contractor') routes.push(segments);
  });
  return routes;
}

function isDynamic(segment) {
  return segment.startsWith('[') && segment.endsWith(']');
}

/** A literal link resolves only when its first word after /contractor/ is a real folder. */
function resolves(linkSegments, routes) {
  return routes.some((route) => {
    if (route.length !== linkSegments.length) return false;
    if (route.length < 2 || isDynamic(route[1])) return false;
    return route.every((seg, i) => isDynamic(seg) || seg === linkSegments[i]);
  });
}

function findBrokenContractorLinks(root) {
  const routes = contractorRoutes(root);
  const broken = [];
  for (const dirName of SCAN_DIRS) {
    walk(path.join(root, dirName), (full, name) => {
      if (!SOURCE_FILE.test(name)) return;
      const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/);
      lines.forEach((line, index) => {
        for (const match of line.matchAll(LINK)) {
          const link = match[1].replace(/\/+$/, '');
          const segments = link.split('/').filter(Boolean);
          if (!resolves(segments, routes)) {
            broken.push({
              file: path.relative(root, full).split(path.sep).join('/'),
              line: index + 1,
              link,
            });
          }
        }
      });
    });
  }
  return broken;
}

function selftest() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'contractor-links-'));
  const write = (rel, text) => {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, text);
  };
  try {
    write('app/contractor/[id]/page.tsx', 'export default function P() { return null }\n');
    write('app/contractor/real/page.tsx', 'export default function P() { return null }\n');
    write('app/(contractor)/portal/page.tsx', 'export default function P() { return null }\n');
    write(
      'components/links.tsx',
      [
        'const good = "/contractor/real";',
        'const ghost = "/contractor/ghost";',
        "const group = '/contractor/portal';",
        'const byId = `/contractor/${id}`;',
        "const api = fetch('/api/contractor/ghost');",
      ].join('\n')
    );
    const found = findBrokenContractorLinks(root)
      .map((b) => b.link)
      .sort();
    const expected = ['/contractor/ghost', '/contractor/portal'];
    const ok = JSON.stringify(found) === JSON.stringify(expected);
    console.log(ok ? 'selftest PASS' : 'selftest FAIL');
    console.log('expected:', expected.join(', '));
    console.log('found:   ', found.join(', ') || '(none)');
    return ok;
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

if (require.main === module) {
  if (process.argv.includes('--selftest')) {
    process.exit(selftest() ? 0 : 1);
  }
  const root = path.resolve(__dirname, '..');
  const broken = findBrokenContractorLinks(root);
  if (broken.length === 0) {
    console.log('contractor links OK: every /contractor/<word> link has a page');
    process.exit(0);
  }
  console.log(`${broken.length} link(s) point to /contractor/<word> with no page:`);
  for (const b of broken) console.log(`  ${b.file}:${b.line}  ${b.link}`);
  process.exit(1);
}

module.exports = { findBrokenContractorLinks };
