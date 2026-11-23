/**
 * @jest-environment node
 *
 * DR-985: nrpg.com.au does not resolve (the live site is nrpg.business), so no
 * page, email, QR code or data file may point at it. Template links must reach
 * a route that exists.
 *
 * src/app is not scanned: Next.js serves the root app/ directory and ignores
 * src/app when both exist, so nothing in src/app reaches a visitor.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../../..');
const read = (file: string) => readFileSync(path.join(ROOT, file), 'utf8');

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return name === 'node_modules' ? [] : files(full);
    return /\.(ts|tsx|json)$/.test(name) ? [full] : [];
  });
}

describe('no dead nrpg.com.au addresses', () => {
  it('app, components, lib, src/lib and data never mention nrpg.com.au', () => {
    const offenders = ['app', 'components', 'lib', 'src/lib', 'data']
      .flatMap((dir) => files(path.join(ROOT, dir)))
      .filter((file) => /nrpg\.com\.au/i.test(readFileSync(file, 'utf8')))
      .map((file) => path.relative(ROOT, file));
    expect(offenders).toEqual([]);
  });

  it('certificate QR codes open the public contractor profile on the live site', () => {
    expect(existsSync(path.join(ROOT, 'app/contractors/[id]/page.tsx'))).toBe(true);
    const certificate = read('lib/pdf/certificate-generator.ts');
    expect(certificate).toContain('`${SITE_URL}/contractors/${data.contractorId}`');
    const qr = read('lib/qrcode/generator.ts');
    expect(qr).not.toMatch(/\/verify\/|\/track`|\/verify`/);
  });

  it('the onboarding emails do not quote an invalid 1800 number', () => {
    expect(read('src/lib/services/client-email.service.ts')).not.toContain('1800 6774');
  });
});

describe('template links reach real routes', () => {
  const templates = [
    'app/[city]/area/[suburb]/page.tsx',
    'app/[city]/area/[suburb]/[service]/page.tsx',
    'lib/geo/templates/brand-config.ts',
  ];

  it.each(templates)('%s does not link to /report-claim or /join', (file) => {
    const source = read(file);
    expect(source).not.toMatch(/['"`]\/report-claim/);
    expect(source).not.toMatch(/['"`]\/join['"`?]/);
  });

  it('the routes the templates now use exist', () => {
    expect(existsSync(path.join(ROOT, 'app/claim/step-1/page.tsx'))).toBe(true);
    expect(existsSync(path.join(ROOT, 'app/signup/page.tsx'))).toBe(true);
  });
});
