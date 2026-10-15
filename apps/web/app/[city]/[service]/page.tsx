/**
 * City + Service SEO Pages - Dynamic Route
 *
 * URL Pattern: /[city]/[service]
 * Examples:
 * - /sydney/water-damage
 * - /melbourne/fire-restoration
 * - /brisbane/mold-remediation
 *
 * Generates 5,000-10,000 location pages for maximum local SEO coverage
 * Uses hybrid generation: Static for capitals, ISR for suburbs
 */

import { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/site-url';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';

import { getCityBySlug, getServiceBySlug } from '@/lib/content/page-generator';
import { schemaGenerator } from '@/lib/seo/schema-generator';
import { internalLinking } from '@/lib/seo/internal-linking';
import { generateCityServicePageData, getAllCityServiceCombinations } from '@/lib/seo/city-service-generator';

interface CityServicePageProps {
  params: Promise<{
    city: string;
    service: string;
  }>;
}

// Hybrid Generation Strategy
// Static: Capital cities (8 cities × 50 services = 400 pages)
// ISR: Major suburbs (100+ suburbs × 50 services = 5,000+ pages)
export async function generateStaticParams() {
  // Generate static params for capital cities only
  const capitalCities = [
    'sydney',
    'melbourne',
    'brisbane',
    'perth',
    'adelaide',
    'canberra',
    'darwin',
    'hobart',
  ];

  const services = [
    'water-damage',
    'fire-restoration',
    'mold-remediation',
    'flood-cleanup',
    'storm-damage',
    'sewage-cleanup',
    'biohazard-cleanup',
    'burst-pipe',
    'ceiling-leak',
    'basement-flooding',
  ];

  const params: Array<{ city: string; service: string }> = [];

  capitalCities.forEach((city) => {
    services.forEach((service) => {
      params.push({ city, service });
    });
  });

  return params;
}

// ISR Configuration - Revalidate weekly for suburb pages
export const revalidate = 604800; // 7 days

// Dynamic rendering for non-static params
export const dynamicParams = true;

// Generate SEO metadata
export async function generateMetadata({ params }: CityServicePageProps): Promise<Metadata> {
  const { city: citySlug, service: serviceSlug } = await params;
  const pageData = generateCityServicePageData(citySlug, serviceSlug);

  if (!pageData) {
    return {
      title: 'Page Not Found',
    };
  }

  const canonicalUrl = `${SITE_URL}/${citySlug}/${serviceSlug}`;

  return {
    title: pageData.metaTitle,
    description: pageData.metaDescription,
    keywords: pageData.keywords.join(', '),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageData.metaTitle,
      description: pageData.metaDescription,
      url: canonicalUrl,
      siteName: 'NRPG - Disaster Recovery Australia',
      type: 'website',
      locale: 'en_AU',
      images: [
        {
          url: `/images/og/${serviceSlug}-${citySlug}.jpg`,
          width: 1200,
          height: 630,
          alt: `${pageData.serviceTitle} in ${pageData.cityName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageData.metaTitle,
      description: pageData.metaDescription,
      images: [`/images/og/${serviceSlug}-${citySlug}.jpg`],
    },
    robots: {
      // Suburb-level pages are near-duplicate (default stats / templated copy);
      // keep them out of the index to avoid scaled-content bloat. Capital-city
      // pages carry unique data and stay indexable.
      index: !pageData.isSuburb,
      follow: true,
      googleBot: {
        index: !pageData.isSuburb,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function CityServicePage({ params }: CityServicePageProps) {
  const { city: citySlug, service: serviceSlug } = await params;
  const pageData = generateCityServicePageData(citySlug, serviceSlug);

  if (!pageData) {
    notFound();
  }

  // Generate breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: pageData.cityName, url: `/${citySlug}` },
    { name: pageData.serviceTitle, url: `/${citySlug}/${serviceSlug}` },
  ];

  // Generate schema markup
  const schemas = [
    schemaGenerator.generateLocalBusinessSchema({
      city: pageData.cityName,
      state: pageData.state,
      latitude: pageData.latitude,
      longitude: pageData.longitude,
      serviceRadius: 50,
    }),
    schemaGenerator.generateServiceSchema({
      name: `${pageData.serviceTitle} - ${pageData.cityName}`,
      description: pageData.description,
      serviceType: pageData.serviceTitle,
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
            <ol className="flex items-center space-x-2 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
              {breadcrumbs.map((crumb, index) => (
                <li
                  key={crumb.url}
                  className="flex items-center"
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                >
                  {index > 0 && <span className="mx-2 text-slate-400">/</span>}
                  {index === breadcrumbs.length - 1 ? (
                    <>
                      <span className="text-slate-900 font-medium" itemProp="name">
                        {crumb.name}
                      </span>
                      <meta itemProp="position" content={String(index + 1)} />
                    </>
                  ) : (
                    <>
                      <Link
                        href={crumb.url}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                        itemProp="item"
                      >
                        <span itemProp="name">{crumb.name}</span>
                      </Link>
                      <meta itemProp="position" content={String(index + 1)} />
                    </>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </nav>

        {/* Hero Section - Above the Fold */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('/images/patterns/grid.svg')] bg-repeat"></div>
          </div>

          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="max-w-5xl mx-auto">
              {/* Location + Service Badge */}
              <div className="inline-flex items-center gap-3 bg-blue-500/20 border border-blue-400/30 rounded-full px-5 py-2.5 mb-6">
                <svg className="w-5 h-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-blue-200 font-semibold text-sm uppercase tracking-wide">
                  {pageData.cityName}, {pageData.state}
                </span>
                <span className="text-blue-400">•</span>
                <span className="text-blue-200 font-semibold text-sm uppercase tracking-wide">
                  {pageData.isSuburb ? 'Suburb Service' : 'Metro Service'}
                </span>
              </div>

              {/* H1 - Primary SEO Target */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {pageData.h1}
              </h1>

              {/* Description */}
              <p className="text-xl md:text-2xl text-slate-200 mb-8 leading-relaxed max-w-3xl">
                {pageData.description}
              </p>

              {/* Trust Signals Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: '⚡', text: 'Priority Dispatch', subtext: 'Emergency Response' },
                  { icon: '✓', text: 'IICRC Certified', subtext: 'Technicians' },
                  { icon: '🛡️', text: 'Insurance Work', subtext: 'Welcome' },
                  { icon: '📞', text: '24/7 Available', subtext: 'All Year Round' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-1">{item.icon}</div>
                    <div className="font-bold text-sm">{item.text}</div>
                    <div className="text-xs text-slate-300">{item.subtext}</div>
                  </div>
                ))}
              </div>

              {/* Emergency CTA */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start">
                <Link
                  href="/claim/step-1?emergency=true"
                  className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all group w-full sm:w-auto"
                >
                  Submit Emergency Claim
                </Link>
                <Link
                  href={`/${citySlug}/${serviceSlug}/quote`}
                  className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-lg transition-all w-full sm:w-auto"
                >
                  Get Free Quote
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Local Statistics */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
                Why {pageData.cityName} Needs {pageData.serviceTitle}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {pageData.localStats.map((stat, idx) => (
                  <div key={idx} className={`${stat.color} border ${stat.borderColor} rounded-xl p-6 text-center`}>
                    <div className={`text-3xl md:text-4xl font-bold ${stat.textColor} mb-2`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-700 leading-tight">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Service Protocol Section */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Image */}
                <div className="relative h-64 md:h-96 rounded-xl overflow-hidden shadow-2xl">
                  <Suspense fallback={<div className="w-full h-full bg-slate-200 animate-pulse"></div>}>
                    <Image
                      src={`/images/services/${serviceSlug}-hero.jpg`}
                      alt={`${pageData.serviceTitle} in ${pageData.cityName}`}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </Suspense>
                </div>

                {/* Content */}
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                    Our {pageData.serviceTitle} Process
                  </h2>
                  <p className="text-lg text-slate-700 mb-6">
                    {pageData.processDescription}
                  </p>
                  <div className="space-y-4">
                    {pageData.processSteps.map((step, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
                          <p className="text-slate-700 text-sm">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Local Contractors CTA */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Verified Local Contractors in {pageData.cityName}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Our {pageData.cityName} contractor network is IICRC certified, background-checked, and ready to respond 24/7 to your emergency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/claim/step-1?emergency=true"
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold text-xl px-12 py-5 rounded-lg shadow-xl hover:shadow-2xl transition-all"
              >
                Submit Emergency Claim
              </Link>
              <Link
                href={`/${citySlug}/contractors`}
                className="inline-block bg-white/10 hover:bg-white/20 border-2 border-white/40 text-white font-semibold px-12 py-5 rounded-lg transition-all"
              >
                View Local Contractors
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section - Schema-Optimized */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {pageData.faqs.map((faq, idx) => (
                  <details
                    key={idx}
                    className="group bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    itemScope
                    itemProp="mainEntity"
                    itemType="https://schema.org/Question"
                  >
                    <summary className="text-lg font-bold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                      <span itemProp="name">{faq.question}</span>
                      <svg
                        className="w-5 h-5 text-slate-600 group-open:rotate-180 transition-transform"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </summary>
                    <div
                      className="mt-4 text-slate-700 leading-relaxed"
                      itemScope
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                    >
                      <div itemProp="text">{faq.answer}</div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Related Services */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                Other Services in {pageData.cityName}
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {pageData.relatedServices.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/${citySlug}/${service.slug}`}
                    className="bg-white hover:shadow-xl border border-slate-200 hover:border-blue-300 rounded-xl p-6 transition-all group"
                  >
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 mb-2 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">{service.description}</p>
                    <span className="text-blue-600 font-semibold text-sm group-hover:underline">
                      Learn More →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Nearby Locations */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                {pageData.serviceTitle} in Nearby Areas
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {pageData.nearbyLocations.map((location) => (
                  <Link
                    key={location.slug}
                    href={`/${location.slug}/${serviceSlug}`}
                    className="bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg p-4 text-center transition-all group"
                  >
                    <span className="text-slate-900 font-medium group-hover:text-blue-600 transition-colors">
                      {location.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Restore Your Property?
            </h2>
            <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
              Our {pageData.cityName} team is standing by 24/7. Contractors aim to arrive as quickly as possible (typically within 2 hours in metro areas).
            </p>
            <Link
              href="/claim/step-1?emergency=true"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold text-xl px-12 py-6 rounded-lg shadow-2xl hover:shadow-3xl transition-all"
            >
              Submit Emergency Claim
            </Link>
            <div className="mt-6 text-sm text-slate-400">
              Serving {pageData.population.toLocaleString()} residents across {pageData.cityName} and surrounding suburbs
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
