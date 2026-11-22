/**
 * DR-1008: follow-ups from the DR-947 first-run walk fix. Each check reads the source,
 * so it fails if the defect comes back.
 */
import fs from 'fs';
import path from 'path';

const WEB_ROOT = path.resolve(__dirname, '../../..');
const read = (rel: string) => fs.readFileSync(path.join(WEB_ROOT, rel), 'utf8');

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, out);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe('DR-1008 first-run follow-ups', () => {
  it('the contractor dashboard makes no unsourced revenue claim', () => {
    const page = read('app/dashboard/contractor/page.tsx');
    // A dollar figure with a scale (e.g. "$2M+", "$500k") needs a source; none is held.
    expect(page.match(/\$\d[\d,.]*\s*[MmKkBb]\b\+?/g) ?? []).toEqual([]);
  });

  it('the client payments page has no link to the missing subscription page', () => {
    expect(read('app/dashboard/client/payments/page.tsx')).not.toContain('/dashboard/client/subscription');
  });

  it('the unused my-bids-section component is gone and nothing imports it', () => {
    expect(fs.existsSync(path.join(WEB_ROOT, 'components/configurable/my-bids-section.tsx'))).toBe(false);
    const importers = ['app', 'components', 'lib', 'src']
      .flatMap((d) => sourceFiles(path.join(WEB_ROOT, d)))
      .filter((f) => /from\s+['"][^'"]*configurable\/my-bids-section['"]|import\(\s*['"][^'"]*configurable\/my-bids-section/.test(fs.readFileSync(f, 'utf8')))
      .map((f) => path.relative(WEB_ROOT, f));
    expect(importers).toEqual([]);
  });

  it('the root layout loads its fonts locally, not from Google at build time', () => {
    const layout = read('app/layout.tsx');
    expect(layout).not.toMatch(/from\s+["']next\/font\/google["']/);
    expect(layout).toMatch(/from\s+["']next\/font\/local["']/);

    const fontPaths = [...layout.matchAll(/path:\s*["'](\.\/fonts\/[^"']+)["']/g)].map((m) => m[1]);
    expect(fontPaths.length).toBeGreaterThanOrEqual(6);
    for (const rel of fontPaths) {
      const file = path.join(WEB_ROOT, 'app', rel);
      expect(fs.existsSync(file)).toBe(true);
      // A woff2 file starts with the signature "wOF2".
      expect(fs.readFileSync(file).subarray(0, 4).toString('latin1')).toBe('wOF2');
    }
  });
});
