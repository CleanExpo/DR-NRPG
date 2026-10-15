/**
 * Service Page SEO Utilities - NRPG Platform
 *
 * Generates complete SEO metadata (Open Graph, Twitter Cards, canonical URLs,
 * keywords) and JSON-LD structured data for service and category pages.
 *
 * Usage:
 *   import { generateServiceMetadata, generateServiceSchemas } from '@/lib/seo/service-page-seo';
 *
 *   export const metadata = generateServiceMetadata({ ... });
 *
 *   // In component:
 *   const schemas = generateServiceSchemas({ ... });
 *   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
 */

import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/site-url';
import { schemaGenerator } from './schema-generator';

const BASE_URL = SITE_URL;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ServicePageSEOConfig {
  /** Page title for <title> and OG/Twitter */
  title: string;
  /** Meta description */
  description: string;
  /** SEO keywords */
  keywords: string[];
  /** Sub-service slug, e.g. "basement-flooding" */
  slug: string;
  /** Parent category slug, e.g. "water-damage" */
  parentSlug: string;
  /** Parent category display name, e.g. "Water Damage" */
  parentName: string;
  /** Sub-service display name, e.g. "Basement Flooding" */
  serviceName: string;
  /** FAQs for FAQ schema (optional) */
  faqs?: Array<{ question: string; answer: string }>;
}

export interface CategoryPageSEOConfig {
  /** Page title */
  title: string;
  /** Meta description */
  description: string;
  /** SEO keywords */
  keywords: string[];
  /** Category slug, e.g. "water-damage" */
  slug: string;
  /** Category display name, e.g. "Water Damage Restoration" */
  categoryName: string;
}

// ---------------------------------------------------------------------------
// Metadata Generators
// ---------------------------------------------------------------------------

/**
 * Generate full Next.js Metadata for a sub-service page.
 * Includes title, description, keywords, canonical URL, Open Graph, and Twitter Card.
 */
export function generateServiceMetadata(config: ServicePageSEOConfig): Metadata {
  const canonicalUrl = `${BASE_URL}/services/${config.parentSlug}/${config.slug}`;
  const imageUrl = `${BASE_URL}/images/services/${config.parentSlug}/${config.slug}-hero.webp`;

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: canonicalUrl,
      siteName: 'NRPG - Disaster Recovery Australia',
      type: 'website',
      locale: 'en_AU',
      images: [{
        url: imageUrl,
        width: 1920,
        height: 1080,
        alt: `${config.serviceName} - NRPG Australia`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [imageUrl],
    },
  };
}

/**
 * Generate full Next.js Metadata for a parent category page.
 * Includes title, description, keywords, canonical URL, Open Graph, and Twitter Card.
 */
export function generateCategoryMetadata(config: CategoryPageSEOConfig): Metadata {
  const canonicalUrl = `${BASE_URL}/services/${config.slug}`;

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: canonicalUrl,
      siteName: 'NRPG - Disaster Recovery Australia',
      type: 'website',
      locale: 'en_AU',
      images: [{
        url: `${BASE_URL}/images/og-services-default.jpg`,
        width: 1200,
        height: 630,
        alt: `${config.categoryName} - NRPG Australia`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [`${BASE_URL}/images/og-services-default.jpg`],
    },
  };
}

// ---------------------------------------------------------------------------
// JSON-LD Schema Generators
// ---------------------------------------------------------------------------

/**
 * Generate JSON-LD structured data array for a sub-service page.
 * Returns: Service schema + BreadcrumbList schema + FAQPage schema (if FAQs provided).
 */
export function generateServiceSchemas(config: ServicePageSEOConfig): object[] {
  const schemas: object[] = [];

  // 1. Service schema
  schemas.push(
    schemaGenerator.generateServiceSchema({
      name: `${config.serviceName} - NRPG Australia`,
      description: config.description,
      serviceType: config.serviceName,
    })
  );

  // 2. Breadcrumb schema
  schemas.push(
    schemaGenerator.generateBreadcrumbSchema([
      { name: 'Home', url: BASE_URL },
      { name: 'Services', url: `${BASE_URL}/services` },
      { name: config.parentName, url: `${BASE_URL}/services/${config.parentSlug}` },
      { name: config.serviceName, url: `${BASE_URL}/services/${config.parentSlug}/${config.slug}` },
    ])
  );

  // 3. FAQ schema (if FAQs provided)
  if (config.faqs && config.faqs.length > 0) {
    schemas.push(schemaGenerator.generateFAQSchema(config.faqs));
  }

  return schemas;
}

/**
 * Generate JSON-LD structured data array for a parent category page.
 * Returns: Service schema + BreadcrumbList schema.
 */
export function generateCategorySchemas(config: CategoryPageSEOConfig): object[] {
  return [
    schemaGenerator.generateServiceSchema({
      name: `${config.categoryName} - NRPG Australia`,
      description: config.description,
      serviceType: config.categoryName,
    }),
    schemaGenerator.generateBreadcrumbSchema([
      { name: 'Home', url: BASE_URL },
      { name: 'Services', url: `${BASE_URL}/services` },
      { name: config.categoryName, url: `${BASE_URL}/services/${config.slug}` },
    ]),
  ];
}
