/**
 * NRPG Store — Product Detail Page
 *
 * Dynamic route: /store/[slug]
 * Renders product info, variant selector, quantity selector, and Add to Cart.
 *
 * Design: Scientific Luxury — OLED black, teal accents, rounded-sm.
 */

import { SITE_URL } from '@/lib/seo/site-url'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug, products } from '@/lib/printful/products'
import ProductDetail from './ProductDetail'

// ---------------------------------------------------------------------------
// Static params (SSG-friendly)
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

// ---------------------------------------------------------------------------
// Dynamic SEO metadata
// ---------------------------------------------------------------------------

export async function generateMetadata(
  props: {
    params: Promise<{ slug: string }>
  }
): Promise<Metadata> {
  const params = await props.params;
  const product = getProductBySlug(params.slug)

  if (!product) {
    return {
      title: 'Product Not Found | NRPG Store',
    }
  }

  const categoryLabels: Record<string, string> = {
    workwear: 'Workwear',
    headwear: 'Headwear',
    accessories: 'Accessories',
    bundles: 'Bundles',
  }

  return {
    title: `${product.name} | NRPG Store`,
    description: `${product.description} Price: $${product.basePrice.toFixed(2)} AUD. Fast Australian delivery.`,
    keywords: [
      ...product.tags,
      'NRPG store',
      'disaster recovery gear',
      categoryLabels[product.category],
    ],
    alternates: {
      canonical: `/store/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} — NRPG Store`,
      description: product.description,
      url: `${SITE_URL}/store/${product.slug}`,
      type: 'website',
    },
  }
}

// ---------------------------------------------------------------------------
// JSON-LD Structured Data
// ---------------------------------------------------------------------------

const BASE_URL = SITE_URL

function generateProductJsonLd(product: NonNullable<ReturnType<typeof getProductBySlug>>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: `${BASE_URL}${product.mockupImage}`,
    brand: { '@type': 'Brand', name: 'NRPG' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'AUD',
      price: product.basePrice.toFixed(2),
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/store/${product.slug}`,
      seller: { '@type': 'Organization', name: 'NRPG' },
    },
  }
}

function generateProductBreadcrumbJsonLd(product: NonNullable<ReturnType<typeof getProductBySlug>>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Store', item: `${BASE_URL}/store` },
      { '@type': 'ListItem', position: 3, name: product.name, item: `${BASE_URL}/store/${product.slug}` },
    ],
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProductPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const product = getProductBySlug(params.slug)

  if (!product) notFound()

  const productJsonLd = generateProductJsonLd(product)
  const breadcrumbJsonLd = generateProductBreadcrumbJsonLd(product)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetail product={product} />
    </>
  )
}
