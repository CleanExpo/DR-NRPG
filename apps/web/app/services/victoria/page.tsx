/**
 * Victoria State Hub — BUILD-005
 *
 * State-level landing page for disaster recovery services in Victoria.
 * Addresses GAP-049 (no state-level SEO hub).
 * Links to Victoria Bushfires 2025 event page.
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
  title: 'Disaster Recovery Services Victoria | NRPG — Bushfire & Flood Restoration',
  description:
    'IICRC-certified disaster recovery services across Victoria. Bushfire, flood, and storm restoration for ERV and DRFA-declared areas. Insurance claims support across all VIC LGAs.',
  keywords: [
    'disaster recovery Victoria',
    'bushfire restoration Victoria',
    'flood damage repair VIC',
    'DRFA Victoria',
    'Emergency Recovery Victoria',
    'insurance claims Victoria',
    'water damage restoration Melbourne',
    'East Gippsland bushfire recovery',
    'IICRC certified Victoria',
  ],
  alternates: {
    canonical: `${SITE_URL}/services/victoria`,
  },
  openGraph: {
    title: 'Disaster Recovery Victoria — NRPG Bushfire & Flood Restoration',
    description:
      'IICRC-certified bushfire, flood, and storm restoration across Victoria. Emergency Recovery Victoria assistance guidance and insurance claims support.',
    url: `${SITE_URL}/services/victoria`,
    type: 'website',
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/services/victoria`,
  name: 'NRPG Disaster Recovery — Victoria',
  description:
    'IICRC-certified disaster recovery and restoration services across Victoria, including bushfire, flood, and storm damage restoration.',
  url: `${SITE_URL}/services/victoria`,
  areaServed: {
    '@type': 'State',
    name: 'Victoria',
    addressCountry: 'AU',
  },
  serviceType: [
    'Bushfire Recovery',
    'Flood Damage Restoration',
    'Storm Damage Restoration',
    'Fire & Smoke Damage',
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
    { '@type': 'ListItem', position: 3, name: 'Victoria', item: `${SITE_URL}/services/victoria` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What financial assistance is available for Victorian bushfire and flood victims?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Emergency Recovery Victoria (ERV) administers DRFA financial assistance for households and small businesses in declared disaster areas. Assistance includes Emergency Relief Payments and Household Disaster Recovery Grants. Visit recover.vic.gov.au for current program details and eligibility.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does NRPG service regional Victoria including East Gippsland and the Alpine region?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. NRPG maintains contractor coverage across Victoria including East Gippsland, Alpine Shire, and other regional areas. Remote and alpine LGAs may have extended response times. Submit a claim via the online form to confirm availability for your location.',
      },
    },
    {
      '@type': 'Question',
      name: 'What bushfire restoration services does NRPG provide in Victoria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'NRPG provides IICRC-certified fire and smoke damage restoration including soot and char removal, smoke odour treatment, suppression-water extraction, structural drying, and mould prevention. All work is documented to IICRC S770 standards to support insurance claims.',
      },
    },
  ],
}

const VIC_SERVICES = [
  {
    title: 'Bushfire Recovery',
    description: 'Fire and smoke damage restoration for Victorian bushfire-affected properties. Soot removal, smoke odour treatment, and suppression-water extraction. IICRC S770 certified.',
    href: '/services/fire-smoke-damage',
    icon: '🔥',
  },
  {
    title: 'Flood Damage Restoration',
    description: 'Water extraction, structural drying, and mould prevention for Victorian flood events. AS/NZS IICRC S500 standards across all affected areas.',
    href: '/services/water-damage',
    icon: '🌊',
  },
  {
    title: 'Storm & Hail Damage',
    description: 'Emergency response for Melbourne and regional VIC storm events. Structural assessment, tarpauling, and full restoration.',
    href: '/services/storm-damage',
    icon: '⛈️',
  },
  {
    title: 'Mould Remediation',
    description: 'Post-flood and post-bushfire mould assessment and remediation. AS/NZS IICRC S520 certified technicians across Victoria.',
    href: '/services/mould-remediation',
    icon: '🔬',
  },
  {
    title: 'Smoke & Soot Damage',
    description: 'Specialist smoke and soot remediation for bushfire-affected properties. Odour neutralisation, surface decontamination, and air quality restoration.',
    href: '/services/fire-smoke-damage',
    icon: '💨',
  },
  {
    title: 'Contents Restoration',
    description: 'Recovery and restoration of personal contents, documents, and assets following Victorian disaster events.',
    href: '/services/water-damage',
    icon: '📦',
  },
]

export default function VictoriaHubPage() {
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
              Victoria — All LGAs Covered
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Disaster Recovery Services<br />
              <span className="text-[#00BFA6]">Victoria</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] max-w-2xl mx-auto mb-10">
              IICRC-certified bushfire, flood, and storm restoration across Victoria.
              Emergency Recovery Victoria funding guidance and insurance claims support.
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

        {/* ERV Notice */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-3xl mx-auto bg-[#1F2937] border border-[#374151] rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-[#00BFA6] mt-1 shrink-0" />
              <div>
                <h2 className="text-lg font-semibold mb-2">Emergency Recovery Victoria (ERV)</h2>
                <p className="text-[#9CA3AF] text-sm leading-relaxed mb-3">
                  Emergency Recovery Victoria coordinates disaster financial assistance including DRFA Emergency Relief Payments and
                  Household Disaster Recovery Grants for eligible Victorian households and small businesses in declared disaster areas.
                </p>
                <a
                  href="https://www.recover.vic.gov.au"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#00BFA6] text-sm hover:underline"
                >
                  Apply for assistance at recover.vic.gov.au
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Services Available in Victoria</h2>
            <p className="text-[#9CA3AF] text-center mb-12 max-w-2xl mx-auto">
              All services delivered to IICRC standards by independently licensed, insured, and IICRC-certified contractors across Victoria.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {VIC_SERVICES.map((service) => (
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
            <h2 className="text-2xl font-bold mb-6 text-center">Recent Victorian Disaster Events</h2>
            <div className="space-y-3">
              <Link
                href="/victoria-bushfires-2025"
                className="flex items-center justify-between bg-[#1F2937] border border-[#374151] rounded-lg p-4 hover:border-[#00BFA6]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <div className="font-medium">Victoria Bushfires 2025</div>
                    <div className="text-[#9CA3AF] text-sm">Recovery active — East Gippsland, Alpine, Indigo, Wodonga, Greater Bendigo</div>
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
                { step: '02', title: 'Contractor Assigned', description: 'An IICRC-certified Victorian contractor is dispatched to your property for assessment.' },
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
            <h2 className="text-2xl font-bold mb-8 text-center">Victoria Disaster Recovery — FAQs</h2>
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
            <h2 className="text-2xl font-bold mb-4">Ready to Lodge Your Victorian Claim?</h2>
            <p className="text-[#9CA3AF] mb-8">
              Submit your claim online. An IICRC-certified Victorian contractor will be assigned to your property.
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
