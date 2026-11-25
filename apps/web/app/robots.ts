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

// One list of private paths, used by every group. A crawler that reads only its
// own group must still be told these paths are off limits. /_next/ is blocked
// for the default group only: named search and AI crawlers need it to render pages.
const PRIVATE_PATHS = [
  '/dashboard/',
  '/api/',
  '/admin/',
  '/private/',
  '/internal/',
];

const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'Claude-Web',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'ClaudeBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Amazonbot',
  'FacebookBot',
  'Diffbot',
  'cohere-ai',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Default: allow crawling, block private areas ──────────────
      {
        userAgent: '*',
        allow: '/',
        disallow: [...PRIVATE_PATHS, '/_next/'],
      },

      // ── Search engines ────────────────────────────────────────────
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },

      // ── AI crawlers — explicit allow for GEO/AEO visibility ──────
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: PRIVATE_PATHS,
      })),

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
