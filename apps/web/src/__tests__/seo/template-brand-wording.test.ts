/**
 * @jest-environment node
 *
 * DR-985: city, service and geo page templates speak as NRPG, not as the
 * separate Disaster Recovery brand, and make no standards-compliance claims
 * the platform cannot back.
 */
import { readFileSync } from 'fs';
import path from 'path';
import { BRAND_CONFIG, PAGE_MESSAGING } from '@/lib/geo/templates/brand-config';
import { DEFAULT_TEMPLATE_CONFIG } from '@/lib/geo/templates/types';

const ROOT = path.resolve(__dirname, '../../..');
const NRPG = 'NRPG - National Restoration Professionals Group';

const TEMPLATES = [
  'app/[city]/page.tsx',
  'app/[city]/[service]/page.tsx',
  'app/[city]/area/[suburb]/page.tsx',
  'app/[city]/area/[suburb]/[service]/page.tsx',
  'app/services/[service-slug]/page.tsx',
  'app/services/[service-slug]/[location]/page.tsx',
  'app/locations/page.tsx',
  'app/locations/[state]/[city]/page.tsx',
  'lib/seo/service-page-seo.ts',
  'lib/seo/city-service-generator.ts',
  'lib/geo/templates/brand-config.ts',
  'lib/geo/templates/types.ts',
];

const STANDARDS_CLAIMS =
  /industry standards|restoration standards|certified protocols|dry standards|meets our standards|certified to/i;

describe('page templates use the NRPG brand', () => {
  it('the geo template brand and site name are NRPG', () => {
    expect(BRAND_CONFIG.name).toBe(NRPG);
    expect(DEFAULT_TEMPLATE_CONFIG.siteName).toBe(NRPG);
    expect(PAGE_MESSAGING.disclaimer).not.toMatch(/Disaster Recovery Australia/);
  });

  it.each(TEMPLATES)('%s does not use the old Disaster Recovery brand', (file) => {
    const source = readFileSync(path.join(ROOT, file), 'utf8');
    expect(source).not.toMatch(/Disaster Recovery Australia/);
    expect(source).not.toMatch(/alternateName:\s*`Disaster Recovery/);
  });

  it.each(TEMPLATES)('%s makes no standards-compliance claims', (file) => {
    const source = readFileSync(path.join(ROOT, file), 'utf8');
    expect(source).not.toMatch(STANDARDS_CLAIMS);
  });

  it('the city LocalBusiness schema has no Disaster Recovery alternate name', () => {
    const source = readFileSync(path.join(ROOT, 'lib/seo/schema-generator.ts'), 'utf8');
    expect(source).not.toMatch(/alternateName:\s*`Disaster Recovery \$\{location\.city\}`/);
  });
});
