/**
 * Dynamic Contractor Sitemap
 *
 * Generates XML sitemap for all verified contractor profiles.
 * Updates daily as new contractors are added.
 *
 * Format: /sitemap-contractors.xml
 */

import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/seo/site-url';
import { basePrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Revalidate once per day

export async function GET() {
  try {
    const baseUrl = SITE_URL;
    const currentDate = new Date().toISOString();

    // Fetch all verified, active contractors
    const contractors = await basePrisma.contractor.findMany({
      where: {
        isVerified: true,
        isActive: true,
        isSuspended: false,
        nrpgVerificationLevel: 'VERIFIED',
      },
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${contractors
  .map(
    (contractor) => `  <url>
    <loc>${baseUrl}/contractors/${contractor.id}</loc>
    <lastmod>${contractor.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error('[Sitemap Contractors] Error generating sitemap:', error);

    // Return minimal sitemap on error
    const baseUrl = SITE_URL;
    const errorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/contractors</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

    return new NextResponse(errorSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600',
      },
    });
  }
}
