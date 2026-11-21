/**
 * @jest-environment node
 *
 * DR-985: a star rating may reach a page or its structured data only when it
 * comes from published client reviews. Made-up ratings, estimated review
 * counts and "4.5 when unknown" fallbacks are not allowed.
 */
import { readFileSync, readdirSync } from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../../..');
const read = (file: string) => readFileSync(path.join(ROOT, file), 'utf8');

describe('contractor ratings come only from published reviews', () => {
  it('buildAggregateRating returns nothing without published reviews', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { buildAggregateRating } = require('@/lib/seo/aggregate-rating');
    expect(buildAggregateRating(4.8, 0)).toBeUndefined();
    expect(buildAggregateRating(0, 0)).toBeUndefined();
    expect(buildAggregateRating('0.00', 3)).toBeUndefined();
    expect(buildAggregateRating('4.67', 3)).toEqual({
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      reviewCount: 3,
      bestRating: '5',
      worstRating: '1',
    });
  });

  it('the public contractor profile counts published reviews, not completed jobs', () => {
    const page = read('app/contractors/[id]/page.tsx');
    expect(page).not.toMatch(/reviewCount:\s*contractor\.completedJobs/);
    expect(page).toMatch(/ratings:\s*\{\s*where:\s*\{\s*isPublished:\s*true\s*\}\s*\}/);
    expect(page).toContain('buildAggregateRating(contractor.averageRating, contractor._count.ratings)');
    expect(page).not.toMatch(/"@type":\s*"AggregateRating"/);
  });
});

describe('no hardcoded or estimated ratings', () => {
  it('the supplier directory carries no ratings', () => {
    const page = read('app/(public)/directory/page.tsx');
    expect(page).not.toMatch(/AggregateRating/);
    expect(page).not.toMatch(/\brating:\s*[0-9]/);
  });

  it('geo page templates put no AggregateRating in schema', () => {
    const dir = path.join(ROOT, 'lib/geo/templates');
    const offenders = readdirSync(dir).filter((name) =>
      /['"]AggregateRating['"]/.test(readFileSync(path.join(dir, name), 'utf8'))
    );
    expect(offenders).toEqual([]);
  });

  it('the client dashboard shows no made-up contractor ratings', () => {
    const page = read('app/dashboard/client/page.tsx');
    expect(page).not.toMatch(/rating\?\.toFixed\(1\)\s*\|\|\s*['"][1-5]\.[0-9]['"]/);
    expect(page).not.toMatch(/^\s*rating:\s*[1-5]\.[0-9],?\s*$/m);
  });
});
