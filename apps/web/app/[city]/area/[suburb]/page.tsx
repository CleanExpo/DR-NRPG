/**
 * Suburb Landing Page
 * Route: /[city]/area/[suburb]
 * e.g., /sydney/area/parramatta, /brisbane/area/ipswich
 *
 * Generated on-demand when contractors sign up in an area.
 * Uses ISR for caching + on-demand revalidation.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import citiesData from '@/data/australian-cities.json';
import servicesData from '@/data/services.json';
import { BRAND_CONFIG } from '@/lib/geo/templates/brand-config';

// Types
interface City {
  slug: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  population: number;
}

interface Suburb {
  slug: string;
  name: string;
  postcode: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  population?: number;
}

interface Props {
  params: Promise<{ city: string; suburb: string }>;
}

// ISR Configuration
export const revalidate = 86400; // 24 hours
export const dynamicParams = true; // Allow on-demand generation

/**
 * Generate static params for known suburbs
 * New suburbs are generated on-demand via contractor signup
 */
export async function generateStaticParams() {
  // Start with empty array - suburbs generated on-demand
  // When contractor signs up, pages are created via ISR
  return [];
}

/**
 * Get suburb data - checks multiple sources
 */
async function getSuburbData(
  citySlug: string,
  suburbSlug: string
): Promise<{
  city: City;
  suburb: Suburb;
} | null> {
  // Find city
  const city = citiesData.cities.find((c: City) => c.slug === citySlug);

  if (!city) return null;

  // Derive suburb name from URL slug
  const suburbName = suburbSlug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Look up postcode from citiesData suburbs array if available
  type SuburbEntry = { slug: string; postcode: string };
  type CityWithSuburbs = { slug: string; suburbs?: SuburbEntry[] };
  const cityWithSuburbs = (citiesData.cities as CityWithSuburbs[]).find((c) => c.slug === citySlug);
  const postcodeEntry = cityWithSuburbs?.suburbs?.find((s) => s.slug === suburbSlug);
  const postcode = postcodeEntry?.postcode ?? '';

  const suburb: Suburb = {
    slug: suburbSlug,
    name: suburbName,
    postcode,
    city: city.city,
    state: city.state,
    latitude: city.latitude,
    longitude: city.longitude,
    population: undefined,
  };

  return { city, suburb };
}

/**
 * Generate metadata for suburb page
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const data = await getSuburbData(params.city, params.suburb);

  if (!data) {
    return {
      title: 'Suburb Not Found',
    };
  }

  const { city, suburb } = data;
  const title = `Disaster Recovery ${suburb.name} ${city.state} | Emergency Restoration Services`;
  const description = `24/7 disaster recovery services in ${suburb.name}, ${city.city}. Water damage, fire restoration, mould remediation. Qualified contractors. Report online for instant matching.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BRAND_CONFIG.baseUrl}/${params.city}/area/${params.suburb}`,
      siteName: BRAND_CONFIG.name,
      locale: 'en_AU',
      type: 'website',
    },
    alternates: {
      canonical: `${BRAND_CONFIG.baseUrl}/${params.city}/area/${params.suburb}`,
    },
  };
}

/**
 * Suburb Landing Page Component
 */
export default async function SuburbPage(props: Props) {
  const params = await props.params;
  const data = await getSuburbData(params.city, params.suburb);

  if (!data) {
    notFound();
  }

  const { city, suburb } = data;
  const services = servicesData.services.slice(0, 8); // Top 8 services

  // Schema.org structured data
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${BRAND_CONFIG.shortName} - ${suburb.name}`,
    description: `Emergency disaster recovery services in ${suburb.name}, ${city.state}`,
    url: `${BRAND_CONFIG.baseUrl}/${params.city}/area/${params.suburb}`,
    email: BRAND_CONFIG.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: suburb.name,
      addressRegion: city.state,
      addressCountry: 'AU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: suburb.latitude,
      longitude: suburb.longitude,
    },
    areaServed: {
      '@type': 'City',
      name: suburb.name,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white py-20">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-2 mb-6">
            <span className="text-emerald-300 font-semibold text-sm uppercase tracking-wide">
              {suburb.name}, {city.state}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Disaster Recovery in {suburb.name}</h1>

          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            24/7 emergency restoration services in {suburb.name} and surrounding areas. Qualified contractors
            ready to help with water damage, fire restoration, mould remediation, and more.
          </p>

          {/* CTA Buttons - No Phone (Agency Model) */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/claim/step-1?emergency=true"
              className="inline-flex items-center justify-center px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
            >
              Report Emergency Online
            </Link>
            <Link
              href={`/contractors?location=${suburb.slug}`}
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors border border-white/20"
            >
              Find Local Contractors
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Services Available in {suburb.name}</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/${params.city}/area/${params.suburb}/${service.slug}`}
                className="bg-slate-50 hover:bg-white hover:shadow-xl border border-slate-200 hover:border-emerald-300 rounded-lg p-6 transition-all group"
              >
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 mb-2">{service.title}</h3>
                <p className="text-sm text-slate-600 mb-3">{service.description?.slice(0, 100)}...</p>
                <span className="text-emerald-600 font-medium text-sm">
                  View {service.title} in {suburb.name} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">How It Works</h2>

          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { step: 1, title: 'Report Online', desc: 'Fill out our quick emergency form' },
              { step: 2, title: 'Get Matched', desc: 'Instantly matched with local contractors' },
              { step: 3, title: 'Contractor Calls', desc: 'They contact you directly' },
              { step: 4, title: 'Job Complete', desc: 'Rapid restoration by qualified pros' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="bg-emerald-500 text-white text-lg font-bold rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Need Emergency Help in {suburb.name}?</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Our local contractors are standing by 24/7. Report your emergency online and get matched instantly.
          </p>
          <Link
            href="/claim/step-1?emergency=true"
            className="inline-block bg-white text-emerald-700 font-bold text-lg px-10 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all hover:bg-emerald-50"
          >
            Report Emergency Now
          </Link>
        </div>
      </section>

      {/* Nearby Areas */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Also Serving Nearby Areas</h2>
          <p className="text-center text-slate-600 mb-8">
            Our {city.city} contractor network covers {suburb.name} and all surrounding suburbs.
          </p>
          <div className="text-center">
            <Link href={`/${params.city}`} className="text-emerald-600 hover:text-emerald-700 font-semibold">
              View all {city.city} services →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
