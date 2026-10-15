/**
 * Northern Territory Hub — BUILD-005
 *
 * Territory-level landing page for disaster recovery services in the NT.
 * Addresses GAP-049 (no territory-level SEO hub).
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
  title: 'Disaster Recovery Services NT | NRPG — Cyclone, Flood & Storm Restoration Darwin',
  description:
    'IICRC-certified disaster recovery services across the Northern Territory. Cyclone, flood, storm, and fire damage restoration for Darwin, Alice Springs, and regional NT. Insurance claims support for all declared events.',
  keywords: [
    'disaster recovery Northern Territory',
    'disaster recovery Darwin',
    'cyclone damage repair Darwin',
    'flood restoration NT',
    'storm damage repair Darwin',
    'insurance claims NT',
    'water damage restoration Darwin',
    'IICRC certified Northern Territory',
  ],
  alternates: {
    canonical: `${SITE_URL}/services/northern-territory`,
  },
  openGraph: {
    title: 'Disaster Recovery NT — NRPG Darwin Cyclone & Storm Restoration',
    description:
      'IICRC-certified cyclone, flood, storm, and fire damage restoration across Darwin and the Northern Territory. Insurance claims support.',
    url: `${SITE_URL}/services/northern-territory`,
    type: 'website',
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/services/northern-territory`,
  name: 'NRPG Disaster Recovery — Northern Territory',
  description:
    'IICRC-certified disaster recovery and restoration services across the Northern Territory, including cyclone, flood, storm, and fire damage restoration in Darwin, Alice Springs, and regional NT.',
  url: `${SITE_URL}/services/northern-territory`,
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Northern Territory',
    addressCountry: 'AU',
  },
  serviceType: [
    'Cyclone Damage Restoration',
    'Storm Damage Restoration',
    'Flood Damage Restoration',
    'Fire Damage Restoration',
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
    { '@type': 'ListItem', position: 3, name: 'Northern Territory', item: `${SITE_URL}/services/northern-territory` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does NRPG service Darwin and regional NT for cyclone and storm restoration?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'NRPG provides cyclone and storm restoration across the Northern Territory including Darwin, Palmerston, Katherine, Tennant Creek, and Alice Springs. Remote communities may have extended response times. Submit a claim via the online form to confirm availability for your location.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which NT agency coordinates disaster recovery assistance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'NT disaster recovery is coordinated by the NT Emergency Management Australia and the NT Government\'s Department of Fire and Emergency Services (DFES NT). Commonwealth-State DRFA co-funded assistance is activated for eligible households and businesses following declared disaster events. Visit pfes.nt.gov.au for current recovery information.',
      },
    },
    {
      '@type': 'Question',
      name: 'What restoration services does NRPG provide after a cyclone in Darwin?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'NRPG provides IICRC-certified cyclone restoration including structural assessment, tarpauling, water extraction (from storm surge and rain ingress), structural drying, mould prevention, and full restoration. All work is documented to AS/NZS IICRC S500 standards to support your insurance submission.',
      },
    },
  ],
}

const NT_SERVICES = [
  {
    title: 'Cyclone Damage Restoration',
    description: 'Structural assessment, tarpauling, water extraction, and restoration for cyclone-affected properties across Darwin, Palmerston, and the NT coast. ARPC cyclone event specialists.',
    href: '/services/storm-damage',
    icon: '🌀',
  },
  {
    title: 'Storm Damage Restoration',
    description: 'Emergency response for severe tropical storms across Darwin and regional NT. Structural repairs, water extraction, and IICRC-standard documentation.',
    href: '/services/storm-damage',
    icon: '⛈️',
  },
  {
    title: 'Flood Damage Restoration',
    description: 'Water extraction and structural drying for NT wet season flood events. AS/NZS IICRC S500 standards applied across all affected areas.',
    href: '/services/water-damage',
    icon: '🌊',
  },
  {
    title: 'Fire & Smoke Damage',
    description: 'Fire and smoke damage restoration for NT properties. Soot removal, smoke odour treatment, and suppression-water extraction. IICRC S770 certified.',
    href: '/services/fire-smoke-damage',
    icon: '🔥',
  },
  {
    title: 'Mould Remediation',
    description: 'Post-cyclone and post-flood mould assessment and remediation across the NT — critical in the tropical build environment. AS/NZS IICRC S520 certified technicians.',
    href: '/services/mould-remediation',
    icon: '🔬',
  },
  {
    title: 'Contents Restoration',
    description: 'Recovery and restoration of personal contents and assets following NT disaster events. IICRC-standard documentation provided.',
    href: '/services/water-damage',
    icon: '📦',
  },
]

export default function NorthernTerritoryHubPage() {
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
              Northern Territory — Darwin, Alice Springs & Regional NT
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Disaster Recovery Services<br />
              <span className="text-[#00BFA6]">Northern Territory</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] max-w-2xl mx-auto mb-10">
              IICRC-certified cyclone, flood, storm, and fire damage restoration across Darwin and the NT.
              Insurance claims support for all declared events.
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

        {/* DFES NT Notice */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-3xl mx-auto bg-[#1F2937] border border-[#374151] rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-[#00BFA6] mt-1 shrink-0" />
              <div>
                <h2 className="text-lg font-semibold mb-2">NT Disaster Recovery Assistance (DRFA)</h2>
                <p className="text-[#9CA3AF] text-sm leading-relaxed mb-3">
                  NT disaster recovery is coordinated by the NT Government in partnership with the Commonwealth. DRFA co-funded assistance activates for eligible households and businesses following declared disaster events. The NT Department of Police, Fire and Emergency Services (PFES) coordinates recovery programs.
                </p>
                <a
                  href="https://pfes.nt.gov.au/emergency-service/emergency-management/recovery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#00BFA6] text-sm hover:underline"
                >
                  View NT disaster recovery information at PFES
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Services Available in the Northern Territory</h2>
            <p className="text-[#9CA3AF] text-center mb-12 max-w-2xl mx-auto">
              All services delivered to IICRC standards by independently licensed, insured, and IICRC-certified contractors across the NT.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {NT_SERVICES.map((service) => (
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
                { step: '02', title: 'Contractor Assigned', description: 'An IICRC-certified NT contractor is dispatched to your property for assessment.' },
                { step: '03', title: 'Restoration & Documentation', description: 'Scope of works documented to IICRC standard, restoration completed, and insurance documentation provided.' },
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
            <h2 className="text-2xl font-bold mb-8 text-center">Northern Territory Disaster Recovery — FAQs</h2>
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
            <h2 className="text-2xl font-bold mb-4">Ready to Lodge Your NT Claim?</h2>
            <p className="text-[#9CA3AF] mb-8">
              Submit your claim online. An IICRC-certified Northern Territory contractor will be assigned to your property.
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
