/**
 * Queensland State Hub — BUILD-005
 *
 * State-level landing page for disaster recovery services in Queensland.
 * Addresses GAP-049 (no state-level SEO hub) and GAP-048 (DRFA LGA list links to QRA).
 * ACL s18 compliant — no unverified statistics.
 */

import { SITE_URL } from '@/lib/seo/site-url'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { CheckCircle, ArrowRight, MapPin, Shield, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disaster Recovery Services Queensland | NRPG — DRFA-Backed Restoration',
  description:
    'IICRC-certified disaster recovery services across Queensland. Flood, cyclone, storm and bushfire restoration for DRFA-declared areas. Insurance claims support and rapid response across all QLD LGAs.',
  keywords: [
    'disaster recovery Queensland',
    'flood restoration Queensland',
    'cyclone damage repair QLD',
    'DRFA Queensland',
    'insurance claims QLD',
    'water damage restoration Brisbane',
    'storm damage Queensland',
    'IICRC certified Queensland',
  ],
  alternates: {
    canonical: `${SITE_URL}/services/queensland`,
  },
  openGraph: {
    title: 'Disaster Recovery Queensland — NRPG DRFA-Backed Restoration',
    description:
      'IICRC-certified flood, cyclone and storm restoration across Queensland. Government assistance guidance and insurance claims support for all declared disaster areas.',
    url: `${SITE_URL}/services/queensland`,
    type: 'website',
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/services/queensland`,
  name: 'NRPG Disaster Recovery — Queensland',
  description:
    'IICRC-certified disaster recovery and restoration services across Queensland, including flood, cyclone, storm and bushfire damage restoration.',
  url: `${SITE_URL}/services/queensland`,
  areaServed: {
    '@type': 'State',
    name: 'Queensland',
    addressCountry: 'AU',
  },
  serviceType: [
    'Flood Damage Restoration',
    'Cyclone Damage Restoration',
    'Storm Damage Restoration',
    'Bushfire Recovery',
    'Water Damage Restoration',
    'Mould Remediation',
    'Contents Restoration',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Queensland Disaster Recovery Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Flood Damage Restoration', areaServed: 'Queensland' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Cyclone Damage Restoration', areaServed: 'Queensland' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Storm Damage Restoration', areaServed: 'Queensland' } },
    ],
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
    { '@type': 'ListItem', position: 3, name: 'Queensland', item: `${SITE_URL}/services/queensland` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Which Queensland LGAs are eligible for DRFA disaster recovery funding?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Queensland DRFA eligibility is determined on an event-by-event basis. The Queensland Reconstruction Authority (QRA) publishes the full list of declared local government areas for each activation. Visit the QRA website for current and historical DRFA declarations.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I lodge an insurance claim for flood or cyclone damage in Queensland?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Contact your insurer as soon as it is safe to do so. An NRPG IICRC-certified restoration contractor can provide a formal scope-of-works document to support your claim. Use the online claim form on this site to request an assessment.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does NRPG service regional and remote Queensland?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'NRPG maintains contractor coverage across Queensland including regional and coastal areas. Remote LGAs may have extended response times; contact us via the claim form to confirm availability for your location.',
      },
    },
  ],
}

const QLD_SERVICES = [
  {
    title: 'Flood Damage Restoration',
    description:
      'Certified water extraction, structural drying, and mould prevention for properties affected by Queensland flooding events. AS/NZS IICRC S500 standards applied.',
    href: '/services/water-damage',
    icon: '🌊',
  },
  {
    title: 'Cyclone Damage Restoration',
    description:
      'Roof, structural, and water ingress restoration for cyclone-affected properties in North and Far North Queensland. Rapid deployment to DRFA-declared shires.',
    href: '/services/storm-damage',
    icon: '🌀',
  },
  {
    title: 'Storm & Hail Damage',
    description:
      'Emergency response for storm and hail damage across SEQ and regional Queensland. Tarpauling, water extraction, and full structural restoration.',
    href: '/services/storm-damage',
    icon: '⛈️',
  },
  {
    title: 'Fire & Smoke Damage',
    description:
      'Bushfire recovery including smoke/soot remediation, suppression-water extraction, and structural assessment. IICRC S770 certified.',
    href: '/services/fire-smoke-damage',
    icon: '🔥',
  },
  {
    title: 'Mould Remediation',
    description:
      'Post-flood and post-cyclone mould assessment and remediation across Queensland. AS/NZS IICRC S520 standards.',
    href: '/services/mould-remediation',
    icon: '🔬',
  },
  {
    title: 'Contents Restoration',
    description:
      'Specialist recovery of personal contents, documents, and assets following disaster events. Insurance-compliant documentation provided.',
    href: '/services/water-damage',
    icon: '📦',
  },
]

export default function QueenslandHubPage() {
  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="py-24">
        {/* Hero */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              Queensland — All LGAs Covered
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Disaster Recovery Services<br />
              <span className="text-[#00BFA6]">Queensland</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] max-w-2xl mx-auto mb-10">
              IICRC-certified flood, cyclone, storm, and bushfire restoration across Queensland.
              DRFA-backed funding guidance and insurance claims support for all declared areas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-[#00BFA6] hover:bg-[#00BFA6]/90 text-white">
                <Link href="/claim">
                  Lodge a Claim
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937]">
                <Link href="/services">View All Services</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* DRFA Notice */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-3xl mx-auto bg-[#1F2937] border border-[#374151] rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-[#00BFA6] mt-1 shrink-0" />
              <div>
                <h2 className="text-lg font-semibold mb-2">Queensland DRFA — Disaster Funding</h2>
                <p className="text-[#9CA3AF] text-sm leading-relaxed mb-3">
                  Queensland&apos;s Disaster Recovery Funding Arrangements (DRFA) are activated by the State Government on an event-by-event basis.
                  Eligible LGAs receive co-funded financial assistance for individuals, households, and small businesses.
                </p>
                <a
                  href="https://www.qld.gov.au/emergency/disasters-emergencies/natural-disasters/disaster-recovery-funding-arrangements"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#00BFA6] text-sm hover:underline"
                >
                  View current DRFA-declared LGAs on the QRA website
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Services Available in Queensland</h2>
            <p className="text-[#9CA3AF] text-center mb-12 max-w-2xl mx-auto">
              All services delivered to IICRC standards by independently licensed, insured, and IICRC-certified contractors across Queensland.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {QLD_SERVICES.map((service) => (
                <Link
                  key={service.href + service.title}
                  href={service.href}
                  className="bg-[#1F2937] border border-[#374151] rounded-xl p-6 hover:border-[#00BFA6]/50 transition-colors group"
                >
                  <div className="text-3xl mb-4">{service.icon}</div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-[#00BFA6] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">{service.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Events */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Recent Queensland Disaster Events</h2>
            <div className="space-y-3">
              <Link
                href="/queensland-floods-2026-recovery"
                className="flex items-center justify-between bg-[#1F2937] border border-[#374151] rounded-lg p-4 hover:border-[#00BFA6]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌊</span>
                  <div>
                    <div className="font-medium">Queensland Floods 2026</div>
                    <div className="text-[#9CA3AF] text-sm">Recovery active — multiple LGAs declared</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#00BFA6]" />
              </Link>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How the Claim Process Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Lodge Online', description: 'Submit your claim details via the secure online form. No phone required — fully digital.' },
                { step: '02', title: 'Contractor Assigned', description: 'An IICRC-certified QLD contractor is dispatched to your property for assessment.' },
                { step: '03', title: 'Restoration & Claim', description: 'Scope of works documented, restoration completed, and insurance claim supported end-to-end.' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="text-4xl font-bold text-[#00BFA6]/30 mb-3">{item.step}</div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-[#9CA3AF] text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Queensland Disaster Recovery — FAQs</h2>
            <div className="space-y-4">
              {faqSchema.mainEntity.map((faq, i) => (
                <div key={i} className="bg-[#1F2937] border border-[#374151] rounded-xl p-6">
                  <h3 className="font-semibold mb-2 flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#00BFA6] mt-0.5 shrink-0" />
                    {faq.name}
                  </h3>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed pl-7">{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center bg-[#1F2937] border border-[#374151] rounded-2xl p-12">
            <FileText className="w-12 h-12 text-[#00BFA6] mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Ready to Lodge Your Queensland Claim?</h2>
            <p className="text-[#9CA3AF] mb-8">
              Submit your claim online. An IICRC-certified Queensland contractor will be assigned to your property.
            </p>
            <Button asChild size="lg" className="bg-[#00BFA6] hover:bg-[#00BFA6]/90 text-white">
              <Link href="/claim">
                Start Your Claim
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
