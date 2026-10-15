/**
 * @jest-environment node
 *
 * Wave 1: unsupported performance claims, testimonials and credentials must not
 * render on the public contractor funnel. None of these figures has evidence
 * behind it, so they stay out until a real, sourced number replaces them.
 */
import { readFileSync } from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../../..');

const FUNNEL_SOURCES = [
  'app/contractors/page.tsx',
  'app/how-it-works/page.tsx',
  'app/training/page.tsx',
  'app/(contractor)/join/page.tsx',
  'components/marketing/JoinNRPGSection.tsx',
  'components/marketing/ROICalculator.tsx',
  'components/contractor/layouts/ContractorFooter.tsx',
  'src/components/contractor/sections/ContractorHero.tsx',
];

const UNSUPPORTED = [
  /500\+/,
  /5,000\+/,
  /\$45M/,
  /98%/,
  /ISO 9001/,
  /\$45,000/,
  /\$45k/,
  /300%/,
  /images\/contractors\/[a-z-]+\.jpg/,
];

describe('public contractor funnel carries no unsupported claims', () => {
  it.each(FUNNEL_SOURCES)('%s', (file) => {
    const source = readFileSync(path.join(ROOT, file), 'utf8');
    for (const pattern of UNSUPPORTED) {
      expect({ file, match: source.match(pattern)?.[0] ?? null }).toEqual({ file, match: null });
    }
  });
});
