/**
 * NRPG Merch Store — Landing Page
 *
 * Sub Pillar page for the NRPG branded merchandise catalogue.
 * Fetches product data directly from the local catalogue (server component).
 *
 * Design: Scientific Luxury — OLED black, teal accents, rounded-sm only.
 */

import { SITE_URL } from '@/lib/seo/site-url'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { products } from '@/lib/printful/products'
import StoreLanding from './StoreLanding'

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'NRPG Store | Disaster Recovery Equipment & Branded Workwear',
  description:
    'Shop NRPG branded workwear, hi-vis gear, headwear, and accessories. Engineered for disaster recovery contractors. Fast Australian delivery. All prices AUD inc. GST.',
  keywords: [
    'NRPG merch',
    'NRPG store',
    'disaster recovery workwear',
    'hi-vis polo australia',
    'branded contractor gear',
    'safety workwear australia',
    'NRPG branded merchandise',
    'restoration contractor clothing',
  ],
  alternates: {
    canonical: '/store',
  },
  openGraph: {
    title: 'NRPG Store | Branded Workwear & Equipment',
    description:
      'Official NRPG merchandise. Hi-vis polos, caps, accessories and bundles for disaster recovery professionals.',
    url: `${SITE_URL}/store`,
    type: 'website',
  },
}

// ---------------------------------------------------------------------------
// JSON-LD Structured Data
// ---------------------------------------------------------------------------

const BASE_URL = SITE_URL

const storeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'NRPG Store — Professional Restoration Equipment & Gear',
  url: `${BASE_URL}/store`,
  description:
    'Shop NRPG branded workwear, hi-vis gear, headwear, and accessories. Engineered for disaster recovery contractors. Fast Australian delivery. All prices AUD inc. GST.',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Store', item: `${BASE_URL}/store` },
    ],
  },
}

// ---------------------------------------------------------------------------
// Page (Server Component — data fetching)
// ---------------------------------------------------------------------------

export default function StorePage() {
  // Data sourced directly from local catalogue — no fetch latency.
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
      />
      <Suspense fallback={<StoreSkeleton />}>
        <StoreLanding products={products} />
      </Suspense>
    </>
  )
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function StoreSkeleton() {
  return (
    <div className="min-h-screen bg-[#050505] animate-pulse">
      <div className="h-64 bg-white/5" />
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-white/5 rounded-sm" />
          ))}
        </div>
      </div>
    </div>
  )
}
