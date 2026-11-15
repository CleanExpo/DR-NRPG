/**
 * Suburb + Service Landing Page
 * Route: /[city]/area/[suburb]/[service]
 * e.g., /sydney/area/parramatta/water-damage, /brisbane/area/ipswich/mould-remediation
 *
 * Most granular SEO page - specific suburb + specific service.
 * Generated on-demand when contractors sign up via geo module.
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
}

interface Service {
  slug: string;
  title: string;
  description: string;
  category: string;
  protocol?: string;
  faqs?: Array<{ question: string; answer: string }>;
}

interface Props {
  params: Promise<{ city: string; suburb: string; service: string }>;
}

// ISR Configuration
export const revalidate = 86400; // 24 hours
export const dynamicParams = true; // Allow on-demand generation

/**
 * Static params - empty, generated on-demand via contractor signup
 */
export async function generateStaticParams() {
  return [];
}

/**
 * Get page data
 */
async function getPageData(citySlug: string, suburbSlug: string, serviceSlug: string) {
  const city = citiesData.cities.find((c: City) => c.slug === citySlug);
  const service = servicesData.services?.find((s: Service) => s.slug === serviceSlug);

  if (!city || !service) return null;

  const suburbName = suburbSlug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    city,
    suburb: { slug: suburbSlug, name: suburbName },
    service,
  };
}

/**
 * Generate metadata
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const data = await getPageData(params.city, params.suburb, params.service);

  if (!data) {
    return { title: 'Page Not Found' };
  }

  const { city, suburb, service } = data;
  const title = `${service.title} ${suburb.name} ${city.state} | 24/7 Emergency Service`;
  const description = `${service.title} in ${suburb.name}, ${city.city}. Qualified contractors, 24/7 emergency response. Report online for instant matching with local ${service.title.toLowerCase()} specialists.`;

  return {
    title,
    description,
    keywords: [
      `${service.title} ${suburb.name}`,
      `${service.title} ${city.city}`,
      `emergency ${service.slug} ${suburb.name}`,
      `${suburb.name} ${city.state} ${service.slug}`,
    ],
    openGraph: {
      title,
      description,
      url: `${BRAND_CONFIG.baseUrl}/${params.city}/area/${params.suburb}/${params.service}`,
      siteName: BRAND_CONFIG.name,
      locale: 'en_AU',
      type: 'website',
    },
    alternates: {
      canonical: `${BRAND_CONFIG.baseUrl}/${params.city}/area/${params.suburb}/${params.service}`,
    },
  };
}

/**
 * Get process steps based on service type
 */
function getProcessSteps(serviceSlug: string) {
  const defaultSteps = [
    { icon: '1', title: 'Report Online', description: 'Submit your emergency details', duration: '5 mins' },
    { icon: '2', title: 'Get Matched', description: 'Instant contractor matching', duration: 'Instant' },
    { icon: '3', title: 'Contractor Calls', description: 'Direct contact from specialist', duration: '15-30 mins' },
    { icon: '4', title: 'Assessment', description: 'On-site damage evaluation', duration: '1-2 hours' },
    { icon: '5', title: 'Restoration', description: 'Professional restoration work', duration: 'Varies' },
  ];

  const serviceSteps: Record<string, typeof defaultSteps> = {
    'water-damage': [
      { icon: '1', title: 'Report Online', description: 'Describe water damage', duration: '5 mins' },
      { icon: '2', title: 'Get Matched', description: 'Water damage specialists', duration: 'Instant' },
      { icon: '3', title: 'Contractor Calls', description: 'Assessment scheduled', duration: '15-30 mins' },
      { icon: '4', title: 'Water Extraction', description: 'Remove standing water', duration: '2-4 hours' },
      { icon: '5', title: 'Full Restoration', description: 'Dry and restore', duration: '3-7 days' },
    ],
    'fire-restoration': [
      { icon: '1', title: 'Report Online', description: 'Describe fire damage', duration: '5 mins' },
      { icon: '2', title: 'Get Matched', description: 'Fire restoration experts', duration: 'Instant' },
      { icon: '3', title: 'Contractor Calls', description: 'Safety assessment', duration: '15-30 mins' },
      { icon: '4', title: 'Smoke & Soot Removal', description: 'Deodorisation', duration: '1-3 days' },
      { icon: '5', title: 'Full Restoration', description: 'Rebuild & restore', duration: '1-4 weeks' },
    ],
    'mold-remediation': [
      { icon: '1', title: 'Report Online', description: 'Describe mould issue', duration: '5 mins' },
      { icon: '2', title: 'Get Matched', description: 'Mould specialists', duration: 'Instant' },
      { icon: '3', title: 'Contractor Calls', description: 'Inspection booked', duration: '15-30 mins' },
      { icon: '4', title: 'Containment', description: 'Prevent spread', duration: '1-2 hours' },
      { icon: '5', title: 'Safe Removal', description: 'Contained remediation', duration: '2-5 days' },
    ],
  };

  return serviceSteps[serviceSlug] || defaultSteps;
}

/**
 * Suburb + Service Page Component
 */
export default async function SuburbServicePage(props: Props) {
  const params = await props.params;
  const data = await getPageData(params.city, params.suburb, params.service);

  if (!data) {
    notFound();
  }

  const { city, suburb, service } = data;
  const faqs = service.faqs || [];
  const processSteps = getProcessSteps(service.slug);

  // Get related services (same category)
  const relatedServices = servicesData.services
    .filter((s: Service) => s.category === service.category && s.slug !== service.slug)
    .slice(0, 3);

  // Schema.org structured data
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${service.title} in ${suburb.name}`,
      description: service.description,
      provider: {
        '@type': 'LocalBusiness',
        name: `${BRAND_CONFIG.name} - ${suburb.name}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: suburb.name,
          addressRegion: city.state,
          addressCountry: 'AU',
        },
      },
      areaServed: {
        '@type': 'City',
        name: suburb.name,
      },
      serviceType: service.title,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BRAND_CONFIG.baseUrl },
        { '@type': 'ListItem', position: 2, name: city.city, item: `${BRAND_CONFIG.baseUrl}/${params.city}` },
        {
          '@type': 'ListItem',
          position: 3,
          name: suburb.name,
          item: `${BRAND_CONFIG.baseUrl}/${params.city}/area/${params.suburb}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: service.title,
          item: `${BRAND_CONFIG.baseUrl}/${params.city}/area/${params.suburb}/${params.service}`,
        },
      ],
    },
  ];

  // Add FAQ schema if FAQs exist
  if (faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.slice(0, 5).map((faq) => ({
        '@type': 'Question',
        name: faq.question.replace(/{suburb}/g, suburb.name).replace(/{city}/g, city.city),
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer.replace(/{suburb}/g, suburb.name).replace(/{city}/g, city.city),
        },
      })),
    } as unknown as (typeof schemas)[0]);
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href={`/${params.city}`} className="hover:text-white">
              {city.city}
            </Link>
            <span>/</span>
            <Link href={`/${params.city}/area/${params.suburb}`} className="hover:text-white">
              {suburb.name}
            </Link>
            <span>/</span>
            <span className="text-emerald-400">{service.title}</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-2 mb-6">
            <span className="text-emerald-300 font-semibold text-sm uppercase tracking-wide">
              {suburb.name}, {city.state}
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            {service.title} in {suburb.name}
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl">
            {service.description} Professional {service.title.toLowerCase()} services in {suburb.name}, {city.city}.
            Qualified contractors ready to respond.
          </p>

          {/* CTA Buttons - No Phone (Agency Model) */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/report-claim?location=${suburb.slug}&service=${service.slug}`}
              className="inline-flex items-center justify-center px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
            >
              Report {service.title} Emergency
            </Link>
            <Link
              href={`/contractors?location=${suburb.slug}&service=${service.slug}`}
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors border border-white/20"
            >
              Find Local Specialists
            </Link>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            {service.title} Process in {suburb.name}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center relative">
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-slate-200" />
                )}
                <div className="relative z-10 w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-emerald-600">{step.icon}</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 text-sm">{step.title}</h3>
                <p className="text-xs text-slate-600">{step.description}</p>
                {step.duration && <p className="text-xs text-emerald-600 mt-1">{step.duration}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Why Choose Us for {service.title} in {suburb.name}
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: '✓', title: 'Qualified', desc: 'All contractors certified to industry standards' },
              { icon: '⚡', title: 'Fast Response', desc: 'Contractors contact you within 30 minutes' },
              { icon: '🛡️', title: 'Fully Insured', desc: 'All work covered by comprehensive insurance' },
              { icon: '📋', title: 'Insurance Assistance', desc: 'Help with documentation for your claim' },
              { icon: '🏆', title: 'Quality Guaranteed', desc: 'Satisfaction guaranteed on all work' },
              { icon: '💬', title: 'Direct Communication', desc: 'Work directly with your contractor' },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{item.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      {faqs.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              {service.title} FAQs for {suburb.name}
            </h2>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="bg-slate-50 rounded-lg p-4 group">
                  <summary className="font-semibold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                    {faq.question.replace(/{suburb}/g, suburb.name).replace(/{city}/g, city.city)}
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-slate-600">
                    {faq.answer.replace(/{suburb}/g, suburb.name).replace(/{city}/g, city.city)}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Related Services in {suburb.name}</h2>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {relatedServices.map((related: Service) => (
                <Link
                  key={related.slug}
                  href={`/${params.city}/area/${params.suburb}/${related.slug}`}
                  className="bg-white hover:shadow-lg border border-slate-200 hover:border-emerald-300 rounded-lg p-6 transition-all"
                >
                  <h3 className="font-bold text-slate-900 mb-2">{related.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">{related.description?.slice(0, 80)}...</p>
                  <span className="text-emerald-600 font-medium text-sm">
                    View {related.title} in {suburb.name} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Need {service.title} in {suburb.name}?
          </h2>
          <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
            Report your situation online and get matched with certified contractors instantly. They&apos;ll call you
            directly to assess and schedule the work.
          </p>
          <Link
            href={`/report-claim?location=${suburb.slug}&service=${service.slug}`}
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
          >
            Get Matched with Contractors →
          </Link>
        </div>
      </section>

      {/* Navigation Links */}
      <section className="py-12 bg-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href={`/${params.city}`} className="text-slate-600 hover:text-emerald-600">
              ← All {city.city} Services
            </Link>
            <span className="text-slate-300">|</span>
            <Link href={`/${params.city}/area/${params.suburb}`} className="text-slate-600 hover:text-emerald-600">
              All Services in {suburb.name}
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/contractors" className="text-slate-600 hover:text-emerald-600">
              Find Contractors →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
