/**
 * South Australia State Hub — BUILD-005
 *
 * State-level landing page for disaster recovery services in South Australia.
 * Addresses GAP-049 (no state-level SEO hub).
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
  title: 'Disaster Recovery Services SA | NRPG — Storm & Hail Restoration',
  description:
    'IICRC-certified disaster recovery services across South Australia. Storm, hail, flood, and bushfire restoration for DRFA-declared areas. Insurance claims support across all SA LGAs.',
  keywords: [
    'disaster recovery South Australia',
    'storm damage repair SA',
    'hail damage restoration Adelaide',
    'DRFA South Australia',
    'insurance claims SA',
    'water damage restoration Adelaide',
    'bushfire recovery South Australia',
    'IICRC certified South Australia',
  ],
  alternates: {
    canonical: `${SITE_URL}/services/south-australia`,
  },
  openGraph: {
    title: 'Disaster Recovery South Australia — NRPG Storm & Hail Restoration',
    description:
      'IICRC-certified storm, hail, flood, and bushfire restoration across South Australia. Government assistance guidance and insurance claims support.',
    url: `${SITE_URL}/services/south-australia`,
    type: 'website',
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/services/south-australia`,
  name: 'NRPG Disaster Recovery — South Australia',
  description:
    'IICRC-certified disaster recovery and restoration services across South Australia, including storm, hail, flood, and bushfire damage restoration.',
  url: `${SITE_URL}/services/south-australia`,
  areaServed: {
    '@type': 'State',
    name: 'South Australia',
    addressCountry: 'AU',
  },
  serviceType: [
    'Storm Damage Restoration',
    'Hail Damage Restoration',
    'Flood Damage Restoration',
    'Bushfire Recovery',
    'Water Damage Restoration',
    'Mould Remediation',
    'Contents Restoration',
  ],
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
    { '@type': 'ListItem', position: 3, name: 'South Australia', item: `${SITE_URL}/services/south-australia` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What disaster recovery assistance is available in South Australia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'South Australia activates DRFA (Disaster Recovery Funding Arrangements) for declared disaster events. The SA Government and Commonwealth co-fund assistance for eligible households and small businesses. Visit the SA Government disaster recovery page for current activation details.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does NRPG cover hail and storm damage in the Adelaide Hills and outer metro areas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. NRPG covers Adelaide metro, the Hills, and regional SA for storm, hail, and water damage restoration. Submit a claim via the online form for your specific location and an IICRC-certified contractor will be assigned.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does NRPG support bushfire recovery in regional South Australia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'NRPG provides fire and smoke damage restoration including soot removal, suppression-water extraction, and structural assessment for SA bushfire-affected properties. All work is IICRC S770 certified and documented for insurance claims.',
      },
    },
  ],
}

const SA_SERVICES = [
  {
    title: 'Storm & Hail Damage',
    description: 'Emergency response for SA storm and hail events. Structural assessment, tarpauling, water extraction, and full restoration across Adelaide and regional SA.',
    href: '/services/storm-damage',
    icon: '⛈️',
  },
  {
    title: 'Flood Damage Restoration',
    description: 'Water extraction and structural drying for SA flood events. AS/NZS IICRC S500 standards applied.',
    href: '/services/water-damage',
    icon: '🌊',
  },
  {
    title: 'Bushfire Recovery',
    description: 'Fire and smoke damage restoration for SA bushfire-affected properties. Soot removal, odour treatment, and suppression-water extraction.',
    href: '/services/fire-smoke-damage',
    icon: '🔥',
  },
  {
    title: 'Mould Remediation',
    description: 'Post-flood and post-storm mould assessment and remediation across South Australia. AS/NZS IICRC S520 certified.',
    href: '/services/mould-remediation',
    icon: '🔬',
  },
  {
    title: 'Water Damage',
    description: 'Burst pipes, roof leaks, and appliance failures — rapid response water damage restoration across SA.',
    href: '/services/water-damage',
    icon: '💧',
  },
  {
    title: 'Contents Restoration',
    description: 'Recovery and restoration of personal contents and assets following SA disaster events.',
    href: '/services/water-damage',
    icon: '📦',
  },
]

export default function SouthAustraliaHubPage() {
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
              South Australia — All LGAs Covered
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Disaster Recovery Services<br />
              <span className="text-[#00BFA6]">South Australia</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] max-w-2xl mx-auto mb-10">
              IICRC-certified storm, hail, flood, and bushfire restoration across South Australia.
              Government assistance guidance and insurance claims support for all declared areas.
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
                <h2 className="text-lg font-semibold mb-2">SA Disaster Recovery Funding</h2>
                <p className="text-[#9CA3AF] text-sm leading-relaxed mb-3">
                  South Australia activates Commonwealth-State DRFA assistance for eligible households and businesses following declared disaster events.
                  The SA Department for Human Services administers assistance programs.
                </p>
                <a
                  href="https://www.sa.gov.au/topics/emergencies-and-safety/during-and-after-an-emergency/disaster-recovery-funding"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#00BFA6] text-sm hover:underline"
                >
                  View SA disaster recovery funding information
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Services Available in South Australia</h2>
            <p className="text-[#9CA3AF] text-center mb-12 max-w-2xl mx-auto">
              All services delivered to IICRC standards by independently licensed, insured, and IICRC-certified contractors across South Australia.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SA_SERVICES.map((service) => (
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

        {/* Process */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How the Claim Process Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Lodge Online', description: 'Submit your claim details via the secure online form. No phone required — fully digital.' },
                { step: '02', title: 'Contractor Assigned', description: 'An IICRC-certified SA contractor is dispatched to your property for assessment.' },
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
            <h2 className="text-2xl font-bold mb-8 text-center">SA Disaster Recovery — FAQs</h2>
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
            <h2 className="text-2xl font-bold mb-4">Ready to Lodge Your SA Claim?</h2>
            <p className="text-[#9CA3AF] mb-8">
              Submit your claim online. An IICRC-certified South Australia contractor will be assigned to your property.
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
