/**
 * Western Australia State Hub — BUILD-005
 *
 * State-level landing page for disaster recovery services in Western Australia.
 * Addresses GAP-049 (no state-level SEO hub).
 * Links to Cyclone Narelle WA 2026 event page.
 * ACL s18 compliant — no unverified statistics.
 */

import Header from '@/components/header'
import Footer from '@/components/footer'
import { CheckCircle, ArrowRight, MapPin, Shield, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disaster Recovery Services WA | NRPG — Cyclone & Storm Restoration',
  description:
    'IICRC-certified disaster recovery services across Western Australia. Cyclone, storm, flood, and bushfire restoration for DRFA-declared shires. Insurance claims support across all WA LGAs.',
  keywords: [
    'disaster recovery Western Australia',
    'cyclone damage repair WA',
    'storm damage restoration Perth',
    'DRFA Western Australia',
    'insurance claims WA',
    'water damage restoration Perth',
    'bushfire recovery WA',
    'cyclone restoration contractor WA',
    'IICRC certified Western Australia',
  ],
  alternates: {
    canonical: 'https://nrpg.business/services/western-australia',
  },
  openGraph: {
    title: 'Disaster Recovery Western Australia — NRPG Cyclone & Storm Restoration',
    description:
      'IICRC-certified cyclone, storm, flood, and bushfire restoration across Western Australia. DRFA assistance guidance and insurance claims support.',
    url: 'https://disasterrecovery.com.au/services/western-australia',
    type: 'website',
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://disasterrecovery.com.au/services/western-australia',
  name: 'NRPG Disaster Recovery — Western Australia',
  description:
    'IICRC-certified disaster recovery and restoration services across Western Australia, including cyclone, storm, flood, and bushfire damage restoration.',
  url: 'https://disasterrecovery.com.au/services/western-australia',
  areaServed: {
    '@type': 'State',
    name: 'Western Australia',
    addressCountry: 'AU',
  },
  serviceType: [
    'Cyclone Damage Restoration',
    'Storm Damage Restoration',
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
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://disasterrecovery.com.au' },
    { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://disasterrecovery.com.au/services' },
    { '@type': 'ListItem', position: 3, name: 'Western Australia', item: 'https://disasterrecovery.com.au/services/western-australia' },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Which WA shires are eligible for DRFA cyclone and storm assistance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'WA DRFA eligibility is declared by the WA State Government on an event-by-event basis. Eligible shires receive co-funded financial assistance for households and small businesses. The WA Department of Fire and Emergency Services (DFES) publishes declared shire lists for each event at dfes.wa.gov.au.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does NRPG service North West WA for cyclone restoration?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'NRPG provides cyclone restoration across North West WA including the Pilbara, Gascoyne, and Mid West regions. Remote shires may have extended response times. Submit a claim via the online form to confirm availability for your shire and location.',
      },
    },
    {
      '@type': 'Question',
      name: 'What restoration services does NRPG provide after a cyclone in WA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'NRPG provides IICRC-certified cyclone restoration including structural assessment, tarpauling, water extraction (from storm surge and rain ingress), structural drying, mould prevention, and full restoration. All work is documented to AS/NZS IICRC S500 standards to support your insurance claim.',
      },
    },
  ],
}

const WA_SERVICES = [
  {
    title: 'Cyclone Damage Restoration',
    description: 'Structural assessment, tarpauling, water extraction, and restoration for cyclone-affected properties across North West and coastal WA. ARPC cyclone event specialists.',
    href: '/services/storm-damage',
    icon: '🌀',
  },
  {
    title: 'Storm Damage Restoration',
    description: 'Emergency response for severe storms across Perth and regional WA. Structural repairs, water extraction, and insurance-compliant documentation.',
    href: '/services/storm-damage',
    icon: '⛈️',
  },
  {
    title: 'Flood Damage Restoration',
    description: 'Water extraction and structural drying for WA flood events. AS/NZS IICRC S500 standards applied across all affected areas.',
    href: '/services/water-damage',
    icon: '🌊',
  },
  {
    title: 'Bushfire Recovery',
    description: 'Fire and smoke damage restoration for WA bushfire-affected properties. Soot removal, smoke odour treatment, and suppression-water extraction. IICRC S770 certified.',
    href: '/services/fire-smoke-damage',
    icon: '🔥',
  },
  {
    title: 'Mould Remediation',
    description: 'Post-cyclone and post-flood mould assessment and remediation across WA. AS/NZS IICRC S520 certified technicians.',
    href: '/services/mould-remediation',
    icon: '🔬',
  },
  {
    title: 'Contents Restoration',
    description: 'Recovery and restoration of personal contents and assets following WA disaster events. Insurance-compliant documentation provided.',
    href: '/services/water-damage',
    icon: '📦',
  },
]

export default function WesternAustraliaHubPage() {
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
              Western Australia — All Shires Covered
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Disaster Recovery Services<br />
              <span className="text-[#00BFA6]">Western Australia</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] max-w-2xl mx-auto mb-10">
              IICRC-certified cyclone, storm, flood, and bushfire restoration across Western Australia.
              DRFA assistance guidance and insurance claims support for all declared shires.
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

        {/* DRFA/DFES Notice */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-3xl mx-auto bg-[#1F2937] border border-[#374151] rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-[#00BFA6] mt-1 shrink-0" />
              <div>
                <h2 className="text-lg font-semibold mb-2">WA Disaster Recovery Funding (DRFA)</h2>
                <p className="text-[#9CA3AF] text-sm leading-relaxed mb-3">
                  Western Australia&apos;s DRFA activates Commonwealth-State co-funded assistance for eligible households and small businesses following declared disaster events.
                  The WA Department of Fire and Emergency Services (DFES) coordinates recovery programs including the WA Premier&apos;s Disaster Relief Payment.
                </p>
                <a
                  href="https://www.dfes.wa.gov.au/recovery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#00BFA6] text-sm hover:underline"
                >
                  View WA disaster recovery information at DFES
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Services Available in Western Australia</h2>
            <p className="text-[#9CA3AF] text-center mb-12 max-w-2xl mx-auto">
              All services delivered to IICRC standards by independently licensed, insured, and IICRC-certified contractors across WA.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {WA_SERVICES.map((service) => (
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
            <h2 className="text-2xl font-bold mb-6 text-center">Recent WA Disaster Events</h2>
            <div className="space-y-3">
              <Link
                href="/cyclone-narelle-western-australia-2026"
                className="flex items-center justify-between bg-[#1F2937] border border-[#374151] rounded-lg p-4 hover:border-[#00BFA6]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌀</span>
                  <div>
                    <div className="font-medium">Cyclone Narelle — Western Australia 2026</div>
                    <div className="text-[#9CA3AF] text-sm">Recovery active — Exmouth, Carnarvon, Shark Bay, Ashburton</div>
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
                { step: '02', title: 'Contractor Assigned', description: 'An IICRC-certified WA contractor is dispatched to your property for assessment.' },
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
            <h2 className="text-2xl font-bold mb-8 text-center">Western Australia Disaster Recovery — FAQs</h2>
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
            <h2 className="text-2xl font-bold mb-4">Ready to Lodge Your WA Claim?</h2>
            <p className="text-[#9CA3AF] mb-8">
              Submit your claim online. An IICRC-certified Western Australia contractor will be assigned to your property.
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
