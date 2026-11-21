/**
 * Follow-up to DR-1001 (#301): eight sub-service pages and the client
 * onboarding welcome page showed "100%" stat tiles ("100% Odour Removal",
 * "100% Full Containment", "100% Regulatory Compliant", "100% Certified
 * Contractors" and so on). The pages are static and query no records, so no
 * data backs any of those percentages. This test renders each page and checks
 * that no stat tile shows a percentage, so the claim cannot return without a
 * data source behind it.
 */
import type { ComponentType } from 'react';
import { renderToString } from 'react-dom/server';

import SmokeOdourRemoval from '@/app/services/fire-smoke-damage/smoke-odor-removal/page';
import TreeDamageCleanup from '@/app/services/storm-damage/tree-damage-cleanup/page';
import HoardingCleanup from '@/app/services/biohazard-cleanup/hoarding-cleanup/page';
import CrimeSceneCleanup from '@/app/services/biohazard-cleanup/crime-scene-cleanup/page';
import MethLabDecontamination from '@/app/services/biohazard-cleanup/meth-lab-decontamination/page';
import BasementFlooding from '@/app/services/water-damage/basement-flooding/page';
import CeilingWaterDamage from '@/app/services/water-damage/ceiling-water-damage/page';
import BlackMouldRemoval from '@/app/services/mould-remediation/black-mould-removal/page';
import ClientOnboardingWelcome from '@/app/dashboard/client/onboarding/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/services',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'test-user' } }, status: 'authenticated' }),
}));

const decode = (s: string) =>
  s.replace(/<!-- -->/g, '').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").trim();

type Tile = { value: string; label: string };

/** Service-page quick-stat tile: a large value div followed by a grey label div. */
function serviceTiles(html: string): Tile[] {
  const tile =
    /<div class="text-3xl font-bold[^"]*">([^<]*)<\/div><div class="text-\[#9CA3AF\]">([^<]*)<\/div>/g;
  return Array.from(html.matchAll(tile), (m) => ({ value: decode(m[1]), label: decode(m[2]) }));
}

/** Onboarding trust-signal tile: a large value paragraph followed by a label paragraph. */
function onboardingTiles(html: string): Tile[] {
  const tile = /<p class="text-2xl font-bold text-foreground">([^<]*)<\/p><p>([^<]*)<\/p>/g;
  return Array.from(html.matchAll(tile), (m) => ({ value: decode(m[1]), label: decode(m[2]) }));
}

const pages: Array<[string, ComponentType, (html: string) => Tile[], number]> = [
  ['/services/fire-smoke-damage/smoke-odor-removal', SmokeOdourRemoval, serviceTiles, 4],
  ['/services/storm-damage/tree-damage-cleanup', TreeDamageCleanup, serviceTiles, 4],
  // Three of the four hoarding tiles are icon tiles with no value div.
  ['/services/biohazard-cleanup/hoarding-cleanup', HoardingCleanup, serviceTiles, 1],
  ['/services/biohazard-cleanup/crime-scene-cleanup', CrimeSceneCleanup, serviceTiles, 4],
  ['/services/biohazard-cleanup/meth-lab-decontamination', MethLabDecontamination, serviceTiles, 4],
  ['/services/water-damage/basement-flooding', BasementFlooding, serviceTiles, 4],
  ['/services/water-damage/ceiling-water-damage', CeilingWaterDamage, serviceTiles, 4],
  ['/services/mould-remediation/black-mould-removal', BlackMouldRemoval, serviceTiles, 4],
  ['/dashboard/client/onboarding', ClientOnboardingWelcome, onboardingTiles, 4],
];

describe.each(pages)('%s stat tiles', (_route, Page, extract, expectedTiles) => {
  let tiles: Tile[] = [];
  beforeAll(() => {
    tiles = extract(renderToString(<Page />));
  });

  it('renders its stat tiles', () => {
    expect(tiles.length).toBe(expectedTiles);
  });

  it('shows no percentage claim in any tile', () => {
    for (const t of tiles) {
      expect(`${t.value} ${t.label}`).not.toMatch(/%/);
    }
  });
});
