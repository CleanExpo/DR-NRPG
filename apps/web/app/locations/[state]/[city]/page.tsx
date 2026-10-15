/**
 * Location Page Template - Dynamic Route
 *
 * Generates 150+ location pages with local SEO optimization
 * Examples:
 * - /locations/nsw/sydney
 * - /locations/vic/melbourne
 * - /locations/qld/brisbane
 */

import { SITE_URL } from '@/lib/seo/site-url';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { pageGenerator, getCityBySlug, getCitiesByState } from '@/lib/content/page-generator';
import { internalLinking, getBreadcrumbsForPage } from '@/lib/seo/internal-linking';
import { schemaGenerator } from '@/lib/seo/schema-generator';

interface LocationPageProps {
  params: Promise<{
    state: string;
    city: string;
  }>;
}

// Generate static params for all locations
export async function generateStaticParams() {
  return pageGenerator.generateLocationStaticParams();
}

// Generate metadata for SEO
export async function generateMetadata(props: LocationPageProps): Promise<Metadata> {
  const params = await props.params;
  const city = getCityBySlug(params.city);

  if (!city) {
    return {
      title: 'Location Not Found',
    };
  }

  const locationPages = pageGenerator.generateLocationPages();
  const pageData = locationPages.find(p => p.slug === params.city);

  if (!pageData) {
    return {
      title: 'Location Not Found',
    };
  }

  const canonicalUrl = internalLinking.generateCanonicalUrl(
    `/locations/${params.state}/${params.city}`
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
          url: '/images/og-location-default.jpg',
          width: 1200,
          height: 630,
          alt: `Disaster Recovery in ${pageData.city}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageData.metaTitle,
      description: pageData.metaDescription,
      images: ['/images/og-location-default.jpg'],
    },
  };
}

export default async function LocationPage(props: LocationPageProps) {
  const params = await props.params;
  const city = getCityBySlug(params.city);

  if (!city) {
    notFound();
  }

  const locationPages = pageGenerator.generateLocationPages();
  const pageData = locationPages.find(p => p.slug === params.city);

  if (!pageData) {
    notFound();
  }

  const breadcrumbs = getBreadcrumbsForPage({
    type: 'location',
    city: pageData.city,
    state: pageData.state,
  });

  const serviceLinks = internalLinking.getLocationServiceLinks(params.city);
  const nearbyLocations = internalLinking.getNearbyLocationLinks(params.city);

  // Generate Schema.org structured data
  const schemas = [
    schemaGenerator.generateLocalBusinessSchema({
      city: pageData.city,
      state: pageData.stateCode,
      latitude: pageData.latitude,
      longitude: pageData.longitude,
    }),
    schemaGenerator.generateEmergencyServiceSchema(),
    schemaGenerator.generateBreadcrumbSchema(
      breadcrumbs.map(b => ({
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
              {/* Location Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2 mb-6">
                <svg className="w-5 h-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
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

              {/* H1 - Primary SEO Target */}
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
                  Request Local Quote
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
                  <span>60-Minute Response Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Local {pageData.city} Contractors</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>All Insurers Accepted</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Local Statistics */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                Disaster Recovery Needs in {pageData.city}
              </h2>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {pageData.localStats.avgAnnualFloods}
                  </div>
                  <div className="text-sm text-slate-700">Average Annual Flood Events</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-2">
                    {pageData.localStats.avgAnnualStorms}
                  </div>
                  <div className="text-sm text-slate-700">Storm Events Per Year</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {pageData.localStats.avgAnnualFires}
                  </div>
                  <div className="text-sm text-slate-700">Fire Incidents Annually</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {pageData.localStats.avgHumidity}%
                  </div>
                  <div className="text-sm text-slate-700">Average Humidity Level</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Available */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                Emergency Services in {pageData.city}
              </h2>
              <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
                Our vetted contractor network provides comprehensive disaster recovery services
                throughout {pageData.city} and surrounding areas.
              </p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {serviceLinks.map((link) => (
                  <Link
                    key={link.url}
                    href={link.url}
                    className="bg-white hover:shadow-lg border border-slate-200 rounded-xl p-6 transition-all group"
                    title={link.title}
                  >
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {link.text}
                    </h3>
                    <p className="text-sm text-slate-600">24/7 Emergency Response</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose NRPG in Location */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                Why {pageData.city} Residents Choose NRPG
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    title: 'Local Contractor Network',
                    description: `Our ${pageData.city}-based contractors know the area, understand local building codes, and target rapid on-site response (typically within 2 hours in metro areas).`,
                    icon: '🏘️',
                  },
                  {
                    title: 'Most Insurers Accepted',
                    description: `We work with most major insurers serving ${pageData.city} including NRMA, Suncorp, RACV, Allianz, and QBE.`,
                    icon: '🤝',
                  },
                  {
                    title: 'IICRC Certified Technicians',
                    description:
                      'Every contractor in our network is IICRC certified and vetted to meet our professional restoration standards.',
                    icon: '✅',
                  },
                  {
                    title: '24/7/365 Emergency Response',
                    description: `Disasters don't wait for business hours. Our ${pageData.city} dispatch center operates around the clock.`,
                    icon: '🚨',
                  },
                ].map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="text-4xl flex-shrink-0">{feature.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-slate-700">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Nearby Locations */}
        {nearbyLocations.length > 0 && (
          <section className="py-16 bg-slate-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                  We Also Serve Areas Near {pageData.city}
                </h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {nearbyLocations.map((link) => (
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

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-br from-blue-900 to-slate-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Emergency Disaster Recovery in {pageData.city}
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Our local {pageData.city} contractors are standing by 24/7 to respond to your
              emergency. Contractors aim to arrive as quickly as possible (typically within 2 hours in metro areas).
            </p>
            <Link
              href="/claim/step-1?emergency=true"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold text-xl px-12 py-5 rounded-lg shadow-xl hover:shadow-2xl transition-all"
            >
              Submit Emergency Claim — {pageData.city}
            </Link>
            <div className="mt-6 text-sm text-slate-400">
              Serving {pageData.population.toLocaleString()} residents across {pageData.city}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
