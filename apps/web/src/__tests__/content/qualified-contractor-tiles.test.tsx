/**
 * DR-1001: the quick-stat tiles on the service pages showed "100%" beside
 * "Qualified Contractors". No contractor record backs that figure: the pages
 * are static and query nothing. This test renders each page and checks that
 * no tile pairs a number with a contractor label, so the claim cannot return
 * without a data source behind it.
 */
import type { ComponentType } from 'react';
import { renderToString } from 'react-dom/server';

import WaterDamageRestoration from '@/app/services/water-damage-restoration/page';
import FireDamageRestoration from '@/app/services/fire-damage-restoration/page';
import SmokeDamageRestoration from '@/app/services/smoke-damage-restoration/page';
import StormDamageRestoration from '@/app/services/storm-damage-restoration/page';
import FloodRestoration from '@/app/services/flood-restoration/page';
import SewageCleanup from '@/app/services/sewage-cleanup/page';
import WaterDamage from '@/app/services/water-damage/page';
import FireSmokeDamage from '@/app/services/fire-smoke-damage/page';
import StormDamage from '@/app/services/storm-damage/page';
import BiohazardCleanup from '@/app/services/biohazard-cleanup/page';
import MouldRemediation from '@/app/services/mould-remediation/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/services',
  useSearchParams: () => new URLSearchParams(),
}));

const pages: Array<[string, ComponentType]> = [
  ['/services/water-damage-restoration', WaterDamageRestoration],
  ['/services/fire-damage-restoration', FireDamageRestoration],
  ['/services/smoke-damage-restoration', SmokeDamageRestoration],
  ['/services/storm-damage-restoration', StormDamageRestoration],
  ['/services/flood-restoration', FloodRestoration],
  ['/services/sewage-cleanup', SewageCleanup],
  ['/services/water-damage', WaterDamage],
  ['/services/fire-smoke-damage', FireSmokeDamage],
  ['/services/storm-damage', StormDamage],
  ['/services/biohazard-cleanup', BiohazardCleanup],
  ['/services/mould-remediation', MouldRemediation],
];

const decode = (s: string) =>
  s.replace(/<!-- -->/g, '').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").trim();

/** Each quick-stat tile renders as a large value div followed by a grey label div. */
function statTiles(html: string): Array<{ value: string; label: string }> {
  const tile =
    /<div class="text-3xl font-bold[^"]*">([^<]*)<\/div><div class="text-\[#9CA3AF\]">([^<]*)<\/div>/g;
  return Array.from(html.matchAll(tile), (m) => ({ value: decode(m[1]), label: decode(m[2]) }));
}

describe.each(pages)('%s quick-stat tiles', (_route, Page) => {
  let tiles: Array<{ value: string; label: string }> = [];
  beforeAll(() => {
    tiles = statTiles(renderToString(<Page />));
  });

  it('renders its quick-stat tiles', () => {
    expect(tiles.length).toBeGreaterThanOrEqual(4);
  });

  it('pairs no number with a contractor label', () => {
    const contractorTiles = tiles.filter((t) => /contractor/i.test(t.label));
    expect(contractorTiles.length).toBeGreaterThan(0);
    for (const t of contractorTiles) {
      expect(`${t.value} ${t.label}`).not.toMatch(/\d/);
    }
  });

  it('shows no "100%" tile for contractors', () => {
    expect(tiles).not.toContainEqual({ value: '100%', label: 'Qualified Contractors' });
  });
});
