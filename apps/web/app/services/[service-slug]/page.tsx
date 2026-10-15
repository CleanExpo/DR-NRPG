/**
 * Service Page Template - Dynamic Route
 *
 * Generates 60+ service pages with full SEO optimization
 * Examples:
 * - /services/water-damage-restoration
 * - /services/fire-damage-restoration
 * - /services/mould-remediation
 */

import { SITE_URL } from '@/lib/seo/site-url';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { pageGenerator, getServiceBySlug } from '@/lib/content/page-generator';
import { internalLinking, getBreadcrumbsForPage } from '@/lib/seo/internal-linking';
import { schemaGenerator } from '@/lib/seo/schema-generator';

interface ServicePageProps {
  params: Promise<{
    'service-slug': string;
  }>;
}

// Generate static params for all services
export async function generateStaticParams() {
  return pageGenerator.generateServiceStaticParams();
}

// Generate metadata for SEO
export async function generateMetadata(props: ServicePageProps): Promise<Metadata> {
  const params = await props.params;
  const service = getServiceBySlug(params['service-slug']);

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  const servicePages = pageGenerator.generateServicePages();
  const pageData = servicePages.find(p => p.slug === params['service-slug']);

  if (!pageData) {
    return {
      title: 'Service Not Found',
    };
  }

  const canonicalUrl = internalLinking.generateCanonicalUrl(`/services/${params['service-slug']}`);

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
          url: '/images/og-service-default.jpg',
          width: 1200,
          height: 630,
          alt: pageData.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageData.metaTitle,
      description: pageData.metaDescription,
      images: ['/images/og-service-default.jpg'],
    },
  };
}

export default async function ServicePage(props: ServicePageProps) {
  const params = await props.params;
  const service = getServiceBySlug(params['service-slug']);

  if (!service) {
    notFound();
  }

  const servicePages = pageGenerator.generateServicePages();
  const pageData = servicePages.find(p => p.slug === params['service-slug']);

  if (!pageData) {
    notFound();
  }

  const breadcrumbs = getBreadcrumbsForPage({
    type: 'service',
    serviceSlug: params['service-slug'],
  });

  const relatedServices = internalLinking.getRelatedServiceLinks(params['service-slug']);
  const locationLinks = internalLinking.getServiceLocationLinks(params['service-slug']);

  // Generate Schema.org structured data
  const schemas = [
    schemaGenerator.generateServiceSchema({
      name: pageData.title,
      description: pageData.description,
      serviceType: pageData.category,
    }),
    schemaGenerator.generateEmergencyServiceSchema(),
    schemaGenerator.generateFAQSchema(pageData.faqs),
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
              {/* Protocol Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2 mb-6">
                <span className="text-blue-300 font-semibold text-sm uppercase tracking-wide">
                  {pageData.protocol}
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
                  Request Quote
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>24/7 Emergency Response</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>IICRC Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>All States Coverage</span>
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
                  Professional {pageData.title} Services
                </h2>
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  NRPG connects property owners with IICRC {pageData.protocol}-certified contractors across all Australian states and territories. Contractors respond to {pageData.title.toLowerCase()} emergencies 24 hours a day, with direct insurance claim support and real-time job tracking included in every engagement.
                </p>

                {/* How It Works Section */}
                <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">
                  How Our {pageData.title} Process Works
                </h2>
                <div className="grid md:grid-cols-2 gap-6 not-prose">
                  {[
                    {
                      step: 1,
                      title: 'Emergency Contact',
                      description: 'Request emergency service for immediate dispatch. Our team responds 24/7/365.',
                    },
                    {
                      step: 2,
                      title: 'Rapid Assessment',
                      description: 'We aim for rapid response with technicians arriving as quickly as possible to assess damage and begin emergency mitigation.',
                    },
                    {
                      step: 3,
                      title: 'Complete Restoration',
                      description: `Professional ${pageData.title.toLowerCase()} using ${pageData.protocol} certified protocols and equipment.`,
                    },
                    {
                      step: 4,
                      title: 'Verification & Documentation',
                      description: 'Final inspection, moisture testing, and comprehensive documentation for insurance.',
                    },
                  ].map((step) => (
                    <div key={step.step} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-600 text-white font-bold text-xl w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                          {step.step}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                          <p className="text-slate-700">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                Frequently Asked Questions
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <p className="mt-4 text-slate-700 leading-relaxed">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Coverage Areas */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                {pageData.title} Coverage Across Australia
              </h2>
              <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
                We provide {pageData.title.toLowerCase()} services across all major Australian cities and regional areas. Click your location for local service information.
              </p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {locationLinks.map((link) => (
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

        {/* Related Services */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                Related Services
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {relatedServices.map((link) => (
                  <Link
                    key={link.url}
                    href={link.url}
                    className="bg-white hover:shadow-lg border border-slate-200 rounded-xl p-6 transition-all"
                    title={link.title}
                  >
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{link.text}</h3>
                    <p className="text-slate-600 text-sm">{link.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-br from-blue-900 to-slate-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Need {pageData.title} Now?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Our emergency response team is standing by 24/7/365 to help you recover from disaster.
            </p>
            <Link
              href="/claim/step-1?emergency=true"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold text-xl px-12 py-5 rounded-lg shadow-xl hover:shadow-2xl transition-all"
            >
              Submit Emergency Claim
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
