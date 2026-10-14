/**
 * @jest-environment node
 *
 * Wave 1 SEO host: this app is served at https://nrpg.business (apex). Search
 * engines and AI crawlers must never be pointed at disasterrecovery.com.au (a
 * different deployment) or at the www duplicate host.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { SITE_URL } from '@/lib/seo/site-url';

const ROOT = path.resolve(__dirname, '../../..');
const read = (file: string) => readFileSync(path.join(ROOT, file), 'utf8');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

describe('SEO host is the nrpg.business apex', () => {
  it('SITE_URL is the apex', () => {
    expect(SITE_URL).toBe('https://nrpg.business');
  });

  it('root layout sets metadataBase to SITE_URL and a self-referencing canonical', () => {
    const layout = read('app/layout.tsx');
    expect(layout).toContain('metadataBase: new URL(SITE_URL)');
    expect(layout).toMatch(/alternates: \{[^}]*canonical: '\.\/'/);
    expect(layout).not.toMatch(/'en-AU': 'https:\/\/disasterrecovery/);
  });

  it('robots points host and sitemap at the apex', () => {
    const result = robots();
    expect(result.host).toBe(SITE_URL);
    expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });

  it('every sitemap URL is on the apex', () => {
    const offHost = sitemap()
      .map((entry) => entry.url)
      .filter((url) => !url.startsWith(`${SITE_URL}/`) && url !== SITE_URL);
    expect(offHost).toEqual([]);
  });

  it('no page hardcodes a canonical on another host', () => {
    const offenders = sourceFiles(path.join(ROOT, 'app')).filter((file) =>
      /canonical:\s*['"`]https:\/\/(?!nrpg\.business)/.test(readFileSync(file, 'utf8'))
    );
    expect(offenders.map((f) => path.relative(ROOT, f))).toEqual([]);
  });

  it('next.config 301s www to the apex', () => {
    const config = read('next.config.mjs');
    expect(config).toMatch(
      /has: \[\{ type: 'host', value: 'www\.nrpg\.business' \}\],\s*destination: 'https:\/\/nrpg\.business\/:path\*',\s*permanent: true/
    );
  });
});

describe('llms.txt describes this site accurately', () => {
  const llms = read('public/llms.txt');

  it('names the apex as this site', () => {
    expect(llms).toContain('https://nrpg.business');
  });

  it('has no email addresses, street location or unverified rating', () => {
    expect(llms).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
    expect(llms).not.toMatch(/Brisbane|Queensland 4076/);
    expect(llms).not.toMatch(/4\.9\/5/);
  });

  it('does not present disasterrecovery.com.au URLs as this site', () => {
    expect(llms).not.toContain('https://disasterrecovery.com.au');
  });
});

/**
 * Review fix (P1-SEO-HOST-CONFLICTS-IN-RENDERED-PAGES): every page/layout this
 * branch changed must emit og:url, canonical, authors and JSON-LD URLs on the
 * apex only. Jest checks the source literals and the exported metadata; the
 * rendered HTML (og:url, JSON-LD) is scanned against a production build by
 * scripts in the Done contract.
 */
const OFF_HOST = /https?:\/\/(?:www\.)?disasterrecovery\.com\.au|https?:\/\/www\.nrpg\.business/;

const CHANGED_STATIC_PAGES = [
  'app/(public)/cyclone-alfred-queensland-2025/page.tsx',
  'app/(public)/cyclone-maila-queensland-2026/page.tsx',
  'app/(public)/cyclone-narelle-western-australia-2026/page.tsx',
  'app/(public)/emergency-finance/page.tsx',
  'app/(public)/insurance-claim-advocate/page.tsx',
  'app/(public)/nsw-qld-storms-april-2026/page.tsx',
  'app/(public)/queensland-floods-2026-recovery/page.tsx',
  'app/(public)/victoria-bushfires-2025/page.tsx',
  'app/(public)/victoria-bushfires-2026/page.tsx',
  'app/about/page.tsx',
  'app/contractor-terms/page.tsx',
  'app/contractors/directory/page.tsx',
  'app/contractors/layout.tsx',
  'app/cookie-policy/page.tsx',
  'app/disclaimer/page.tsx',
  'app/help-center/page.tsx',
  'app/how-it-works/layout.tsx',
  'app/layout.tsx',
  'app/locations/page.tsx',
  'app/login/layout.tsx',
  'app/nz/page.tsx',
  'app/privacy/page.tsx',
  'app/quote/page.tsx',
  'app/services/australian-capital-territory/page.tsx',
  'app/services/new-south-wales/page.tsx',
  'app/services/new-zealand/page.tsx',
  'app/services/northern-territory/page.tsx',
  'app/services/page.tsx',
  'app/services/queensland/page.tsx',
  'app/services/south-australia/page.tsx',
  'app/services/tasmania/page.tsx',
  'app/services/victoria/page.tsx',
  'app/services/western-australia/page.tsx',
  'app/signup/layout.tsx',
  'app/support/page.tsx',
  'app/terms/page.tsx',
  'app/training/page.tsx',
];

// Pages whose metadata is computed per request; their URL literals are scanned in source.
const CHANGED_DYNAMIC_PAGES = ['app/[city]/page.tsx', 'app/[city]/[service]/page.tsx', 'app/contractors/[id]/page.tsx'];

// Shared builders whose JSON-LD / canonical URLs render into those pages.
const SHARED_URL_SOURCES = [
  'lib/seo/schema-generator.ts',
  'lib/geo/templates/types.ts',
  'lib/geo/templates/brand-config.ts',
  'components/public/events/DisasterEventPage.tsx',
];

describe('changed pages emit URLs on the apex only', () => {
  it.each([...CHANGED_STATIC_PAGES, ...CHANGED_DYNAMIC_PAGES, ...SHARED_URL_SOURCES])('%s has no off-host URL literal', (file) => {
    const literal = read(file).match(/['"`]https?:\/\/(?:www\.)?(?:disasterrecovery\.com\.au|nrpg\.business)[^'"`]*/g) ?? [];
    expect(literal.filter((url) => OFF_HOST.test(url))).toEqual([]);
  });

  it.each(SHARED_URL_SOURCES)('%s does not fall back to NEXT_PUBLIC_BASE_URL (www in production)', (file) => {
    expect(read(file)).not.toMatch(/NEXT_PUBLIC_BASE_URL\s*\|\|/);
  });

  it.each(CHANGED_STATIC_PAGES)('%s metadata (og:url, canonical, authors) is on the apex', async (file) => {
    const mod = await import(path.join(ROOT, file));
    const metadata = JSON.stringify(mod.metadata ?? {});
    expect(metadata).not.toMatch(OFF_HOST);
    const ogUrl = mod.metadata?.openGraph?.url;
    if (typeof ogUrl === 'string' && /^https?:/.test(ogUrl)) expect(ogUrl.startsWith(SITE_URL)).toBe(true);
  });
});
