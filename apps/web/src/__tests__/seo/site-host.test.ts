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
 * Review fixes (P1-SEO-HOST-CONFLICTS-IN-RENDERED-PAGES, rounds 1 and 3): the
 * root layout makes nrpg.business the host of EVERY page, so every page/layout
 * under app/ (not only files this branch changed) and the shared builders that
 * render into them must emit canonical, og:url, authors and JSON-LD URLs on the
 * apex only. Jest checks source URL literals for all of them and the exported
 * static metadata of every page/layout that has one; the rendered HTML is
 * scanned against a production build by the Done contract.
 *
 * Out of scope by founder/legal decision: legal body text (terms, privacy,
 * disclaimer, modern slavery) that names the platform in prose. Prose is never
 * a quoted URL literal, so it is not matched below.
 */
const OFF_HOST = /https?:\/\/(?:www\.)?disasterrecovery\.com\.au|https?:\/\/www\.nrpg\.business/;
// A URL literal: opened by a quote or backtick, or a template literal segment.
const OFF_HOST_LITERAL = /['"`]https?:\/\/(?:www\.)?disasterrecovery\.com\.au|['"`]https?:\/\/www\.nrpg\.business/;
// Env fallbacks resolve to www.nrpg.business in production.
const ENV_HOST_FALLBACK = /NEXT_PUBLIC_(?:BASE|SITE)_URL\s*\|\|/;

const rel = (file: string) => path.relative(ROOT, file);
const ALL_APP_ROUTE_FILES = sourceFiles(path.join(ROOT, 'app'))
  .filter((file) => /\/(page|layout)\.tsx$/.test(file) && !rel(file).startsWith('app/api/'))
  .map(rel)
  .sort();

// Shared builders whose canonical / JSON-LD / sitemap URLs render into pages.
const SHARED_URL_SOURCES = [
  ...sourceFiles(path.join(ROOT, 'components')),
  ...sourceFiles(path.join(ROOT, 'src/components')),
  ...['lib/seo', 'lib/geo/templates', 'lib/geo/sitemap'].flatMap((dir) => sourceFiles(path.join(ROOT, dir))),
]
  .map(rel)
  .filter((file) => !/^lib\/seo\/(gbp-manager|citation-manager)\.ts$/.test(file)) // off-site listing data, not page output
  .sort();

const STATIC_METADATA_FILES = ALL_APP_ROUTE_FILES.filter((file) =>
  /^export const metadata\b/m.test(read(file))
);

describe('every app page/layout and shared URL builder is on the apex', () => {
  it('enumerates the public routes', () => {
    expect(ALL_APP_ROUTE_FILES.length).toBeGreaterThan(200);
    expect(ALL_APP_ROUTE_FILES).toEqual(
      expect.arrayContaining(['app/(public)/guides/page.tsx', 'app/(public)/data/page.tsx', 'app/layout.tsx'])
    );
    expect(STATIC_METADATA_FILES.length).toBeGreaterThan(80);
  });

  it.each([...ALL_APP_ROUTE_FILES, ...SHARED_URL_SOURCES])('%s has no off-host URL literal or env host fallback', (file) => {
    const source = read(file);
    const offenders = source.split('\n').filter((line) => OFF_HOST_LITERAL.test(line) || ENV_HOST_FALLBACK.test(line));
    expect(offenders).toEqual([]);
  });

  it.each(STATIC_METADATA_FILES)('%s metadata (canonical, og:url, authors) is on the apex', async (file) => {
    const mod = await import(path.join(ROOT, file));
    expect(JSON.stringify(mod.metadata ?? {})).not.toMatch(OFF_HOST);
    const ogUrl = mod.metadata?.openGraph?.url;
    if (typeof ogUrl === 'string' && /^https?:/.test(ogUrl)) expect(ogUrl.startsWith(SITE_URL)).toBe(true);
  });

  it('detector flags a sibling-host URL literal but not legal prose (positive control)', () => {
    expect(OFF_HOST_LITERAL.test("    url: 'https://disasterrecovery.com.au/guides',")).toBe(true);
    expect(OFF_HOST_LITERAL.test('item: `https://disasterrecovery.com.au/events/${slug}`')).toBe(true);
    expect(OFF_HOST_LITERAL.test("const B = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.nrpg.business'")).toBe(true);
    expect(OFF_HOST_LITERAL.test('platform at https://disasterrecovery.com.au and any associated')).toBe(false);
  });
});

/**
 * Review fix (round 4): customer-facing return/redirect URL builders — Stripe
 * success/cancel/return/refresh URLs, onboarding next-phase and resume links,
 * auth verification/reset and notification email links — must use SITE_URL,
 * never an env host, the request Host/Origin, or the sibling/www host.
 */
const REDIRECT_BUILDER_DIRS = ['app/api', 'src/app/api', 'lib/stripe', 'src/lib/stripe', 'lib/email', 'lib/notifications'];
// Off-site listing / backlink data that names the sibling brand on purpose (not a redirect).
const REDIRECT_SCAN_EXCEPTIONS = new Set(['app/api/local-seo/citations/route.ts', 'src/app/api/link-building/backlinks/monitor/route.ts']);
const REDIRECT_BUILDER_FILES = REDIRECT_BUILDER_DIRS.flatMap((dir) => sourceFiles(path.join(ROOT, dir)))
  .map(rel)
  .filter((file) => !REDIRECT_SCAN_EXCEPTIONS.has(file))
  .sort();
const ENV_HOST_IN_URL = /\$\{process\.env\.(?:NEXT_PUBLIC_(?:BASE|APP|SITE)_URL|NEXTAUTH_URL)\b|NEXT_PUBLIC_(?:BASE|APP|SITE)_URL\s*\|\|/;
const REQUEST_ORIGIN = /new URL\(request\.url\)\.origin|request\.nextUrl\.origin/;
const SIBLING_HREF = /href=["']https?:\/\/(?:www\.)?disasterrecovery\.com\.au|href=["']https?:\/\/www\.nrpg\.business/;

describe('return/redirect URL builders are on the apex', () => {
  it('enumerates the payment and redirect builders', () => {
    expect(REDIRECT_BUILDER_FILES).toEqual(
      expect.arrayContaining([
        'app/api/store/checkout/route.ts',
        'app/api/training/certification/checkout/route.ts',
        'app/api/service-requests/[id]/callout/checkout/route.ts',
        'app/api/contractor/stripe/connect/onboard/route.ts',
        'app/api/subscription/checkout/route.ts',
        'lib/email/resend.ts',
        'lib/stripe/subscription.ts',
      ])
    );
  });

  it.each(REDIRECT_BUILDER_FILES)('%s builds no URL from env host, request origin or the sibling/www host', (file) => {
    const offenders = read(file)
      .split('\n')
      .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line)) // commented-out code builds nothing
      .filter(
        (line) =>
          ENV_HOST_IN_URL.test(line) || REQUEST_ORIGIN.test(line) || OFF_HOST_LITERAL.test(line) || SIBLING_HREF.test(line)
      );
    expect(offenders).toEqual([]);
  });

  it('detectors fire on the round-4 patterns (positive control)', () => {
    expect(ENV_HOST_IN_URL.test("const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://disasterrecovery.com.au'")).toBe(true);
    expect(ENV_HOST_IN_URL.test('success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,')).toBe(true);
    expect(REQUEST_ORIGIN.test('    const origin = new URL(request.url).origin;')).toBe(true);
    expect(SIBLING_HREF.test('<a href="https://disasterrecovery.com.au/dashboard/client/claims/1">')).toBe(true);
    expect(ENV_HOST_IN_URL.test('success_url: `${SITE_URL}/store/cart`,')).toBe(false);
  });
});
