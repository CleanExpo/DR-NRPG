import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/site-url';

/**
 * Robots.txt Configuration — NRPG Platform
 *
 * Optimised for Australian disaster recovery market.
 * - Allows all major search engines and AI crawlers (GEO/AEO visibility)
 * - Blocks dashboard, API, admin, and internal areas
 * - Blocks known bad-actor scrapers
 */

const BASE_URL = SITE_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Default: allow crawling, block private areas ──────────────
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '/internal/',
        ],
      },

      // ── Search engines ────────────────────────────────────────────
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: ['/dashboard/', '/api/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
      },

      // ── AI crawlers — explicit allow for GEO/AEO visibility ──────
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'Amazonbot', allow: '/' },
      { userAgent: 'FacebookBot', allow: '/' },
      { userAgent: 'Diffbot', allow: '/' },
      { userAgent: 'cohere-ai', allow: '/' },

      // ── Bad bots — block known scrapers ───────────────────────────
      { userAgent: 'AhrefsBot', disallow: '/' },
      { userAgent: 'SemrushBot', disallow: '/' },
      { userAgent: 'DotBot', disallow: '/' },
      { userAgent: 'MJ12bot', disallow: '/' },
      { userAgent: 'BLEXBot', disallow: '/' },
      { userAgent: 'DataForSeoBot', disallow: '/' },
      { userAgent: 'serpstatbot', disallow: '/' },
      { userAgent: 'Bytespider', disallow: '/' },
      { userAgent: 'PetalBot', disallow: '/' },
      { userAgent: 'ZoominfoBot', disallow: '/' },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
