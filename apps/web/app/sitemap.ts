/**
 * Sitemap Generator - NRPG SEO
 *
 * Generates XML sitemap for 5,000-10,000 pages:
 * - Service pages (60+)
 * - Location pages (150+)
 * - Service + Location pages (600+)
 * - City + Service pages (5,000-10,000) - NEW PATTERN
 *
 * Critical for SEO crawlability and indexation
 */

import { MetadataRoute } from 'next';
import { internalLinking } from '@/lib/seo/internal-linking';
import { getAllCityServiceCombinations } from '@/lib/seo/city-service-generator';
import citiesData from '@/data/australian-cities.json';
import { SITE_URL } from '@/lib/seo/site-url';
import { getMargotResourceListing, margotResourcePath } from '@/lib/resources/margot';
import { resourceCanonical } from '@/lib/resources/canonical';

// Publication changes must be checked on each request, including an unconfigured CMS.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { resources: margotResources } = await getMargotResourceListing('/sitemap.xml');
  const baseUrl = SITE_URL;
  const currentDate = new Date();

  const sitemapStructure = internalLinking.generateSitemapStructure();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/locations`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contractors`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contractors/directory`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/modern-slavery`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/store`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contractor/contractor-agreement`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/contractor/code-of-conduct`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/nz`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Event pages — disaster recovery events (high priority, time-sensitive)
    {
      url: `${baseUrl}/queensland-floods-2026-recovery`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cyclone-narelle-western-australia-2026`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cyclone-alfred-queensland-2025`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cyclone-maila-queensland-2026`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/victoria-bushfires-2026`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/victoria-bushfires-2025`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // State hub pages
    {
      url: `${baseUrl}/services/queensland`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services/new-south-wales`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services/victoria`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services/south-australia`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services/western-australia`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Guide pages
    {
      url: `${baseUrl}/insurance-claim-advocate`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Contractor funnel pages
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/training`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/certifications`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contractors/join`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // Territory hub pages
    {
      url: `${baseUrl}/services/tasmania`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/australian-capital-territory`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/northern-territory`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // Legal pages
    {
      url: `${baseUrl}/contractor-terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/help-center`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const servicePages: MetadataRoute.Sitemap = sitemapStructure.services.map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: currentDate,
    changeFrequency: page.changefreq as 'weekly',
    priority: page.priority,
  }));

  // Sub-service pages (e.g. /services/water-damage/basement-flooding)
  const subServicePages: MetadataRoute.Sitemap = [
    // Water Damage
    'water-damage/basement-flooding',
    'water-damage/burst-pipe-repair',
    'water-damage/flood-restoration',
    'water-damage/ceiling-water-damage',
    'water-damage/carpet-water-damage',
    'water-damage/commercial-water-damage',
    'water-damage/structural-drying',
    // Fire & Smoke Damage
    'fire-smoke-damage/fire-damage-restoration',
    'fire-smoke-damage/smoke-damage-restoration',
    'fire-smoke-damage/soot-removal',
    'fire-smoke-damage/smoke-odor-removal',
    'fire-smoke-damage/commercial-fire-damage',
    // Mould Remediation
    'mould-remediation/black-mould-removal',
    'mould-remediation/mould-inspection',
    'mould-remediation/mould-testing',
    'mould-remediation/mould-prevention',
    'mould-remediation/commercial-mould-remediation',
    // Storm Damage
    'storm-damage/wind-damage-restoration',
    'storm-damage/roof-storm-damage',
    'storm-damage/tree-damage-cleanup',
    'storm-damage/emergency-roof-tarping',
    'storm-damage/hail-damage-repair',
    // Biohazard Cleanup
    'biohazard-cleanup/meth-lab-decontamination',
    'biohazard-cleanup/sewage-cleanup',
    'biohazard-cleanup/trauma-cleanup',
    'biohazard-cleanup/crime-scene-cleanup',
    'biohazard-cleanup/hoarding-cleanup',
  ].map((path) => ({
    url: `${baseUrl}/services/${path}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const locationPages: MetadataRoute.Sitemap = sitemapStructure.locations.map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: currentDate,
    changeFrequency: page.changefreq as 'monthly',
    priority: page.priority,
  }));

  const serviceLocationPages: MetadataRoute.Sitemap = sitemapStructure.serviceLocations.map(
    (page) => ({
      url: `${baseUrl}${page.url}`,
      lastModified: currentDate,
      changeFrequency: page.changefreq as 'monthly',
      priority: page.priority,
    })
  );

  // NEW: City overview pages (/[city])
  const cityOverviewPages: MetadataRoute.Sitemap = citiesData.cities.map((city) => ({
    url: `${baseUrl}/${city.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // NEW: City + Service combination pages (/[city]/[service])
  // This generates 5,000-10,000 location pages
  const cityServicePages: MetadataRoute.Sitemap = getAllCityServiceCombinations().map(
    (combo) => {
      // Determine priority based on whether it's a capital city
      const isCapital = citiesData.cities.some((c) => c.slug === combo.city);
      const priority = isCapital ? 0.7 : 0.6;

      return {
        url: `${baseUrl}/${combo.city}/${combo.service}`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority,
      };
    }
  );

  return [
    { url: resourceCanonical(), changeFrequency: 'weekly', priority: 0.7 },
    ...margotResources.map(resource => ({
      url: resourceCanonical(margotResourcePath(resource.slug)),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...staticPages,
    ...servicePages,
    ...subServicePages,
    ...locationPages,
    ...serviceLocationPages,
    ...cityOverviewPages,
    ...cityServicePages,
  ];
}
