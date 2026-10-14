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
