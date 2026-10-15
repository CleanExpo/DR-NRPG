/**
 * Sitemap Generator
 * Disaster Recovery - NRPG Platform
 *
 * Generates XML sitemaps for SEO/GEO pages following Google's sitemap protocol.
 * Supports sitemap index files for large sites (>50,000 URLs).
 */

import { SITE_URL } from '@/lib/seo/site-url';
import { ServiceType, SuburbWithDistance } from '../types';
import { SERVICE_CONFIG } from '../templates/landing-page-generator';
import { MAJOR_CITIES, CityData } from '../templates/pillar-page-generator';
import { REGIONS, STATE_REGIONS, RegionData } from '../templates/region-page-generator';

// ============================================
// Types
// ============================================

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: SitemapImage[];
}

export interface SitemapImage {
  loc: string;
  title?: string;
  caption?: string;
  geoLocation?: string;
}

export interface SitemapConfig {
  baseUrl: string;
  maxUrlsPerSitemap: number;
  defaultChangeFreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  includeImages: boolean;
  lastBuildDate: Date;
}

export interface SitemapIndex {
  sitemaps: SitemapFile[];
  lastmod: string;
}

export interface SitemapFile {
  loc: string;
  lastmod: string;
  urlCount: number;
}

// ============================================
// Configuration
// ============================================

export const DEFAULT_SITEMAP_CONFIG: SitemapConfig = {
  baseUrl: SITE_URL,
  maxUrlsPerSitemap: 50000,
  defaultChangeFreq: 'weekly',
  includeImages: true,
  lastBuildDate: new Date(),
};

export const SITEMAP_PRIORITIES: Record<string, number> = {
  home: 1.0,
  service: 0.9,
  city_pillar: 0.8,
  region: 0.7,
  suburb_landing: 0.6,
  guide: 0.5,
  static: 0.4,
};

export const CHANGE_FREQUENCIES = {
  home: 'daily' as const,
  service: 'weekly' as const,
  city_pillar: 'weekly' as const,
  region: 'monthly' as const,
  suburb_landing: 'weekly' as const,
  guide: 'monthly' as const,
  static: 'yearly' as const,
};

// ============================================
// Sitemap XML Generation
// ============================================

/**
 * Generate a sitemap XML string from a list of URLs
 */
export function generateSitemapXml(urls: SitemapUrl[], config: SitemapConfig = DEFAULT_SITEMAP_CONFIG): string {
  const urlElements = urls.map((url) => buildUrlElement(url, config)).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlElements}
</urlset>`;
}

/**
 * Generate a sitemap index XML for multiple sitemaps
 */
export function generateSitemapIndexXml(sitemaps: SitemapFile[], config: SitemapConfig = DEFAULT_SITEMAP_CONFIG): string {
  const sitemapElements = sitemaps
    .map(
      (sitemap) => `  <sitemap>
    <loc>${escapeXml(sitemap.loc)}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;
}

/**
 * Build a single URL element for the sitemap
 */
function buildUrlElement(url: SitemapUrl, config: SitemapConfig): string {
  let element = `  <url>
    <loc>${escapeXml(url.loc)}</loc>`;

  if (url.lastmod) {
    element += `\n    <lastmod>${url.lastmod}</lastmod>`;
  }

  if (url.changefreq) {
    element += `\n    <changefreq>${url.changefreq}</changefreq>`;
  }

  if (url.priority !== undefined) {
    element += `\n    <priority>${url.priority.toFixed(1)}</priority>`;
  }

  if (config.includeImages && url.images && url.images.length > 0) {
    for (const image of url.images) {
      element += `\n    <image:image>
      <image:loc>${escapeXml(image.loc)}</image:loc>`;
      if (image.title) {
        element += `\n      <image:title>${escapeXml(image.title)}</image:title>`;
      }
      if (image.caption) {
        element += `\n      <image:caption>${escapeXml(image.caption)}</image:caption>`;
      }
      if (image.geoLocation) {
        element += `\n      <image:geo_location>${escapeXml(image.geoLocation)}</image:geo_location>`;
      }
      element += `\n    </image:image>`;
    }
  }

  element += `\n  </url>`;
  return element;
}

/**
 * Build a SitemapUrl object
 */
export function buildSitemapUrl(
  path: string,
  priority: number,
  changefreq: SitemapUrl['changefreq'],
  lastmod?: Date,
  images?: SitemapImage[],
  config: SitemapConfig = DEFAULT_SITEMAP_CONFIG
): SitemapUrl {
  return {
    loc: `${config.baseUrl}${path}`,
    lastmod: lastmod ? lastmod.toISOString().split('T')[0] : undefined,
    changefreq,
    priority,
    images,
  };
}

// ============================================
// URL Builders for Page Types
// ============================================

/**
 * Build sitemap URLs for landing pages (/{suburb}/{service})
 */
export function buildLandingPageUrls(
  suburbs: SuburbWithDistance[],
  services: ServiceType[],
  lastmod: Date = new Date(),
  config: SitemapConfig = DEFAULT_SITEMAP_CONFIG
): SitemapUrl[] {
  const urls: SitemapUrl[] = [];

  for (const suburb of suburbs) {
    for (const service of services) {
      const serviceConfig = SERVICE_CONFIG[service];
      const suburbSlug = slugify(suburb.suburb);
      const path = `/${suburbSlug}/${serviceConfig.slug}`;

      urls.push({
        loc: `${config.baseUrl}${path}`,
        lastmod: lastmod.toISOString().split('T')[0],
        changefreq: CHANGE_FREQUENCIES.suburb_landing,
        priority: SITEMAP_PRIORITIES.suburb_landing,
        images: config.includeImages
          ? [
              {
                loc: `${config.baseUrl}/images/services/${serviceConfig.slug}.jpg`,
                title: `${serviceConfig.displayName} in ${suburb.suburb}`,
                geoLocation: `${suburb.suburb}, ${suburb.state}, Australia`,
              },
            ]
          : undefined,
      });
    }
  }

  return urls;
}

/**
 * Build sitemap URLs for pillar pages (/{city}/{service})
 */
export function buildPillarPageUrls(
  cities?: Record<string, CityData>,
  services?: ServiceType[],
  lastmod: Date = new Date(),
  config: SitemapConfig = DEFAULT_SITEMAP_CONFIG
): SitemapUrl[] {
  const urls: SitemapUrl[] = [];
  const citiesToUse = cities || MAJOR_CITIES;
  const servicesToUse = services || (Object.keys(SERVICE_CONFIG) as ServiceType[]);

  for (const [citySlug, city] of Object.entries(citiesToUse)) {
    // City overview page
    urls.push({
      loc: `${config.baseUrl}/${citySlug}`,
      lastmod: lastmod.toISOString().split('T')[0],
      changefreq: CHANGE_FREQUENCIES.city_pillar,
      priority: SITEMAP_PRIORITIES.city_pillar,
    });

    // City + service pages
    for (const service of servicesToUse) {
      const serviceConfig = SERVICE_CONFIG[service];
      const path = `/${citySlug}/${serviceConfig.slug}`;

      urls.push({
        loc: `${config.baseUrl}${path}`,
        lastmod: lastmod.toISOString().split('T')[0],
        changefreq: CHANGE_FREQUENCIES.city_pillar,
        priority: SITEMAP_PRIORITIES.city_pillar,
        images: config.includeImages
          ? [
              {
                loc: `${config.baseUrl}/images/cities/${citySlug}/${serviceConfig.slug}.jpg`,
                title: `${serviceConfig.displayName} in ${city.name}`,
                geoLocation: `${city.name}, ${city.state}, Australia`,
              },
            ]
          : undefined,
      });
    }
  }

  return urls;
}

/**
 * Build sitemap URLs for service pages (/services/{service})
 */
export function buildServicePageUrls(
  services?: ServiceType[],
  lastmod: Date = new Date(),
  config: SitemapConfig = DEFAULT_SITEMAP_CONFIG
): SitemapUrl[] {
  const urls: SitemapUrl[] = [];
  const servicesToUse = services || (Object.keys(SERVICE_CONFIG) as ServiceType[]);

  // Services index page
  urls.push({
    loc: `${config.baseUrl}/services`,
    lastmod: lastmod.toISOString().split('T')[0],
    changefreq: CHANGE_FREQUENCIES.service,
    priority: SITEMAP_PRIORITIES.service,
  });

  // Individual service pages
  for (const service of servicesToUse) {
    const serviceConfig = SERVICE_CONFIG[service];
    const path = `/services/${serviceConfig.slug}`;

    urls.push({
      loc: `${config.baseUrl}${path}`,
      lastmod: lastmod.toISOString().split('T')[0],
      changefreq: CHANGE_FREQUENCIES.service,
      priority: SITEMAP_PRIORITIES.service,
      images: config.includeImages
        ? [
            {
              loc: `${config.baseUrl}/images/services/${serviceConfig.slug}-hero.jpg`,
              title: `${serviceConfig.displayName} Australia`,
            },
          ]
        : undefined,
    });
  }

  return urls;
}

/**
 * Build sitemap URLs for region pages (/regions/{region})
 */
export function buildRegionPageUrls(
  regions?: Record<string, RegionData>,
  lastmod: Date = new Date(),
  config: SitemapConfig = DEFAULT_SITEMAP_CONFIG
): SitemapUrl[] {
  const urls: SitemapUrl[] = [];

  // Regions index page
  urls.push({
    loc: `${config.baseUrl}/regions`,
    lastmod: lastmod.toISOString().split('T')[0],
    changefreq: CHANGE_FREQUENCIES.region,
    priority: SITEMAP_PRIORITIES.region,
  });

  // Sub-regions
  const regionsToUse = regions || REGIONS;
  for (const [regionId, region] of Object.entries(regionsToUse)) {
    urls.push({
      loc: `${config.baseUrl}/regions/${regionId}`,
      lastmod: lastmod.toISOString().split('T')[0],
      changefreq: CHANGE_FREQUENCIES.region,
      priority: SITEMAP_PRIORITIES.region,
      images: config.includeImages
        ? [
            {
              loc: `${config.baseUrl}/images/regions/${regionId}.jpg`,
              title: `Disaster Recovery Services ${region.name}`,
              geoLocation: `${region.name}, ${region.state}, Australia`,
            },
          ]
        : undefined,
    });
  }

  // State pages
  for (const [state, stateRegion] of Object.entries(STATE_REGIONS)) {
    urls.push({
      loc: `${config.baseUrl}/regions/${state.toLowerCase()}`,
      lastmod: lastmod.toISOString().split('T')[0],
      changefreq: CHANGE_FREQUENCIES.region,
      priority: SITEMAP_PRIORITIES.region,
    });
  }

  return urls;
}

/**
 * Build sitemap URLs for static pages
 */
export function buildStaticPageUrls(
  lastmod: Date = new Date(),
  config: SitemapConfig = DEFAULT_SITEMAP_CONFIG
): SitemapUrl[] {
  const staticPages = [
    { path: '/', priority: SITEMAP_PRIORITIES.home, changefreq: CHANGE_FREQUENCIES.home },
    { path: '/about', priority: 0.6, changefreq: 'monthly' as const },
    { path: '/contact', priority: 0.7, changefreq: 'monthly' as const },
    { path: '/contractors', priority: 0.8, changefreq: 'daily' as const },
    { path: '/join', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/quote', priority: 0.9, changefreq: 'weekly' as const },
    { path: '/emergency', priority: 0.9, changefreq: 'weekly' as const },
    { path: '/resources', priority: 0.6, changefreq: 'weekly' as const },
    { path: '/how-it-works', priority: 0.7, changefreq: 'monthly' as const },
    { path: '/claim', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/privacy', priority: 0.3, changefreq: 'yearly' as const },
    { path: '/terms', priority: 0.3, changefreq: 'yearly' as const },
  ];

  return staticPages.map((page) => ({
    loc: `${config.baseUrl}${page.path}`,
    lastmod: lastmod.toISOString().split('T')[0],
    changefreq: page.changefreq,
    priority: page.priority,
  }));
}

// ============================================
// Utility Functions
// ============================================

/**
 * Convert string to URL-safe slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Split URLs into multiple sitemap files if needed
 */
export function splitIntoSitemapFiles(
  urls: SitemapUrl[],
  config: SitemapConfig = DEFAULT_SITEMAP_CONFIG
): { sitemaps: SitemapFile[]; urlsByFile: SitemapUrl[][] } {
  const urlsByFile: SitemapUrl[][] = [];
  const sitemaps: SitemapFile[] = [];

  for (let i = 0; i < urls.length; i += config.maxUrlsPerSitemap) {
    const chunk = urls.slice(i, i + config.maxUrlsPerSitemap);
    urlsByFile.push(chunk);

    const fileIndex = Math.floor(i / config.maxUrlsPerSitemap) + 1;
    sitemaps.push({
      loc: `${config.baseUrl}/sitemap-${fileIndex}.xml`,
      lastmod: config.lastBuildDate.toISOString().split('T')[0],
      urlCount: chunk.length,
    });
  }

  return { sitemaps, urlsByFile };
}

/**
 * Generate complete sitemap (or sitemap index for large sites)
 */
export function generateCompleteSitemap(
  suburbs: SuburbWithDistance[],
  services: ServiceType[],
  config: SitemapConfig = DEFAULT_SITEMAP_CONFIG
): { xml: string; isIndex: boolean; totalUrls: number } {
  // Collect all URLs
  const allUrls: SitemapUrl[] = [
    ...buildStaticPageUrls(config.lastBuildDate, config),
    ...buildServicePageUrls(services, config.lastBuildDate, config),
    ...buildRegionPageUrls(undefined, config.lastBuildDate, config),
    ...buildPillarPageUrls(undefined, services, config.lastBuildDate, config),
    ...buildLandingPageUrls(suburbs, services, config.lastBuildDate, config),
  ];

  // If under limit, generate single sitemap
  if (allUrls.length <= config.maxUrlsPerSitemap) {
    return {
      xml: generateSitemapXml(allUrls, config),
      isIndex: false,
      totalUrls: allUrls.length,
    };
  }

  // Otherwise, generate sitemap index
  const { sitemaps } = splitIntoSitemapFiles(allUrls, config);
  return {
    xml: generateSitemapIndexXml(sitemaps, config),
    isIndex: true,
    totalUrls: allUrls.length,
  };
}
