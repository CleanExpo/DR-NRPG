/**
 * Service + Location Page Template - Dynamic Nested Route
 *
 * Generates 600+ highly targeted service+location pages
 * Examples:
 * - /services/water-damage-restoration/sydney
 * - /services/fire-damage-restoration/melbourne
 * - /services/mould-remediation/brisbane
 *
 * These pages are optimized for "[service] [city]" search queries
 */

import { SITE_URL } from '@/lib/seo/site-url';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  pageGenerator,
  getServiceBySlug,
  getCityBySlug,
} from '@/lib/content/page-generator';
import { internalLinking, getBreadcrumbsForPage } from '@/lib/seo/internal-linking';
import { schemaGenerator } from '@/lib/seo/schema-generator';

interface ServiceLocationPageProps {
  params: Promise<{
    'service-slug': string;
    location: string;
  }>;
}

// Generate static params for all service+location combinations
export async function generateStaticParams() {
  return pageGenerator.generateServiceLocationStaticParams();
}

// Generate metadata for SEO
export async function generateMetadata(props: ServiceLocationPageProps): Promise<Metadata> {
  const params = await props.params;
  const service = getServiceBySlug(params['service-slug']);
  const city = getCityBySlug(params.location);

  if (!service || !city) {
    return {
      title: 'Page Not Found',
    };
  }

  const serviceLocationPages = pageGenerator.generateServiceLocationPages();
  const pageData = serviceLocationPages.find(
    (p) => p.serviceSlug === params['service-slug'] && p.locationSlug === params.location
  );

  if (!pageData) {
    return {
      title: 'Page Not Found',
    };
  }

  const canonicalUrl = internalLinking.generateCanonicalUrl(
    `/services/${params['service-slug']}/${params.location}`
  );

  return {
    title: pageData.metaTitle,
    description: pageData.metaDescription,
    keywords: pageData.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageData.metaTitle,
      description: pageData.metaDescription,
      url: canonicalUrl,
      siteName: 'NRPG - Disaster Recovery Australia',
      type: 'website',
      images: [
        {
          url: '/images/og-service-location-default.jpg',
          width: 1200,
          height: 630,
          alt: `${pageData.serviceTitle} in ${pageData.city}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageData.metaTitle,
      description: pageData.metaDescription,
      images: ['/images/og-service-location-default.jpg'],
    },
  };
}

export default async function ServiceLocationPage(props: ServiceLocationPageProps) {
  const params = await props.params;
  const service = getServiceBySlug(params['service-slug']);
  const city = getCityBySlug(params.location);

  if (!service || !city) {
    notFound();
  }

  const serviceLocationPages = pageGenerator.generateServiceLocationPages();
  const pageData = serviceLocationPages.find(
    (p) => p.serviceSlug === params['service-slug'] && p.locationSlug === params.location
  );

  if (!pageData) {
    notFound();
  }

  const breadcrumbs = getBreadcrumbsForPage({
    type: 'service-location',
    serviceSlug: params['service-slug'],
    city: pageData.city,
    state: pageData.state,
  });

  const links = internalLinking.getServiceLocationPageLinks({
    serviceSlug: params['service-slug'],
    citySlug: params.location,
  });

  // Generate Schema.org structured data
  const schemas = [
    schemaGenerator.generateServiceSchema({
      name: `${pageData.serviceTitle} - ${pageData.city}`,
      description: pageData.description,
      serviceType: service.category,
    }),
    schemaGenerator.generateLocalBusinessSchema({
      city: pageData.city,
      state: pageData.stateCode,
      latitude: city.latitude,
      longitude: city.longitude,
    }),
    schemaGenerator.generateFAQSchema(pageData.faqs),
    schemaGenerator.generateBreadcrumbSchema(
      breadcrumbs.map((b) => ({
        name: b.name,
        url: `${SITE_URL}${b.url}`,
      }))
    ),
  ];

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />

      <div className="min-h-screen bg-slate-50">
        {/* Breadcrumbs */}
        <nav className="bg-white border-b border-slate-200" aria-label="Breadcrumb">
          <div className="container mx-auto px-4 py-3">
            <ol className="flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.url} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-slate-400">/</span>}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-slate-900 font-medium">{crumb.name}</span>
                  ) : (
                    <Link
                      href={crumb.url}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* Service + Location Badge */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2">
                  <span className="text-blue-300 font-semibold text-sm uppercase tracking-wide">
                    {service.protocol}
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2">
                  <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-blue-300 font-semibold text-sm uppercase tracking-wide">
                    {pageData.city}, {pageData.state}
                  </span>
                </div>
              </div>

              {/* H1 - Highly Targeted for "[service] [city]" */}
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                {pageData.h1}
              </h1>

              {/* Description */}
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                {pageData.description}
              </p>

              {/* Emergency CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/claim/step-1?emergency=true"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Submit Emergency Claim
                </Link>
                <Link
                  href="/claim/step-1"
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-lg transition-all"
                >
                  Get Free Quote
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Under 60 Min Response</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Local {pageData.city} Experts</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{service.protocol} Certified</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">
                  Expert {pageData.serviceTitle} in {pageData.city}
                </h2>
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  {pageData.description}
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  Our {pageData.city}-based technicians understand local conditions and building
                  codes. We maintain equipment and crews specifically for rapid deployment across
                  all {pageData.city} suburbs, ensuring professional {pageData.serviceTitle.toLowerCase()} services when you need them most.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                {pageData.serviceTitle} FAQs - {pageData.city}
              </h2>
              <div className="space-y-6">
                {pageData.faqs.map((faq, index) => (
                  <details
                    key={index}
                    className="bg-white rounded-xl border border-slate-200 p-6 group"
                  >
                    <summary className="font-semibold text-lg text-slate-900 cursor-pointer list-none flex justify-between items-center">
                      {faq.question}
                      <svg
                        className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <p className="mt-4 text-slate-700 leading-relaxed">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Related Services in Same Location */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                Other Services in {pageData.city}
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                {links.relatedServices.map((link) => (
                  <Link
                    key={link.url}
                    href={link.url}
                    className="bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg p-4 transition-all text-center"
                    title={link.title}
                  >
                    <span className="text-slate-900 font-medium">{link.text}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Same Service, Nearby Locations */}
        {links.nearbyLocations.length > 0 && (
          <section className="py-16 bg-slate-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                  {pageData.serviceTitle} in Nearby Areas
                </h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {links.nearbyLocations.map((link) => (
                    <Link
                      key={link.url}
                      href={link.url}
                      className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg p-4 transition-all text-center"
                      title={link.title}
                    >
                      <span className="text-slate-900 font-medium">{link.text}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Same Service, Major Cities */}
        {links.sameServiceOtherLocations.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                  {pageData.serviceTitle} Across Australia
                </h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {links.sameServiceOtherLocations.map((link) => (
                    <Link
                      key={link.url}
                      href={link.url}
                      className="bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg p-4 transition-all text-center"
                      title={link.title}
                    >
                      <span className="text-slate-900 font-medium">{link.text}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-br from-blue-900 to-slate-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Need {pageData.serviceTitle} in {pageData.city}?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Our local {pageData.city} contractors are available 24/7 for emergency response.
              Priority dispatch applies to all emergency requests.
            </p>
            <Link
              href="/claim/step-1?emergency=true"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold text-xl px-12 py-5 rounded-lg shadow-xl hover:shadow-2xl transition-all"
            >
              Submit Emergency Claim — {pageData.city}
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
