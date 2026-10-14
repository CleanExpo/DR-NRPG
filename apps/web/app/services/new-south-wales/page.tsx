/**
 * New South Wales State Hub — BUILD-005
 *
 * State-level landing page for disaster recovery services in New South Wales.
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
  title: 'Disaster Recovery Services NSW | NRPG — Flood & Storm Restoration',
  description:
    'IICRC-certified disaster recovery services across New South Wales. Flood, storm, and bushfire restoration for SES and DRFA-declared areas. Insurance claims support across all NSW LGAs.',
  keywords: [
    'disaster recovery NSW',
    'flood restoration New South Wales',
    'storm damage repair NSW',
    'DRFA New South Wales',
    'insurance claims NSW',
    'water damage restoration Sydney',
    'bushfire recovery NSW',
    'IICRC certified NSW',
  ],
  alternates: {
    canonical: `${SITE_URL}/services/new-south-wales`,
  },
  openGraph: {
    title: 'Disaster Recovery NSW — NRPG Flood & Storm Restoration',
    description:
      'IICRC-certified flood, storm, and bushfire restoration across New South Wales. Government assistance guidance and insurance claims support for all declared areas.',
    url: `${SITE_URL}/services/new-south-wales`,
    type: 'website',
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/services/new-south-wales`,
  name: 'NRPG Disaster Recovery — New South Wales',
  description:
    'IICRC-certified disaster recovery and restoration services across New South Wales, including flood, storm, and bushfire damage restoration.',
  url: `${SITE_URL}/services/new-south-wales`,
  areaServed: {
    '@type': 'State',
    name: 'New South Wales',
    addressCountry: 'AU',
  },
  serviceType: [
    'Flood Damage Restoration',
    'Storm Damage Restoration',
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
    { '@type': 'ListItem', position: 3, name: 'New South Wales', item: `${SITE_URL}/services/new-south-wales` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Which NSW areas are covered by DRFA flood and storm assistance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'NSW DRFA eligibility is declared by the NSW State Government for each event. Eligible local government areas receive co-funded financial assistance for households and small businesses. Visit the NSW Reconstruction Authority website for current declarations.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does NRPG service the NSW flood corridor including the Hunter and Hawkesbury regions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. NRPG maintains contractor coverage across the key NSW flood corridors including the Hunter Valley, Hawkesbury-Nepean, Macquarie, and Lachlan regions. Submit a claim via the online form to confirm availability for your location.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I get a scope of works for my NSW insurance claim?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lodge your claim via the NRPG online form. An IICRC-certified NSW restoration contractor will conduct an onsite assessment and provide a formal scope-of-works document to support your insurance claim.',
      },
    },
  ],
}

const NSW_SERVICES = [
  {
    title: 'Flood Damage Restoration',
    description: 'Water extraction, structural drying, and mould prevention for NSW flood events. IICRC S500 standards applied across all affected areas.',
    href: '/services/water-damage',
    icon: '🌊',
  },
  {
    title: 'Storm & Hail Damage',
    description: 'Emergency response for severe storms across Sydney, Newcastle, and regional NSW. Structural assessment, tarpauling, and full restoration.',
    href: '/services/storm-damage',
    icon: '⛈️',
  },
  {
    title: 'Bushfire Recovery',
    description: 'Fire and smoke damage restoration for NSW bushfire-affected properties. Soot removal, suppression-water extraction, and structural assessment.',
    href: '/services/fire-smoke-damage',
    icon: '🔥',
  },
  {
    title: 'Mould Remediation',
    description: 'Post-flood mould assessment and remediation across NSW. AS/NZS IICRC S520 certified technicians.',
    href: '/services/mould-remediation',
    icon: '🔬',
  },
  {
    title: 'Water Damage',
    description: 'Burst pipes, roof leaks, and appliance failures — rapid response water damage restoration across NSW.',
    href: '/services/water-damage',
    icon: '💧',
  },
  {
    title: 'Contents Restoration',
    description: 'Specialist recovery and restoration of personal contents and assets for insurance claims across NSW.',
    href: '/services/water-damage',
    icon: '📦',
  },
]

export default function NewSouthWalesHubPage() {
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
              New South Wales — All LGAs Covered
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Disaster Recovery Services<br />
              <span className="text-[#00BFA6]">New South Wales</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] max-w-2xl mx-auto mb-10">
              IICRC-certified flood, storm, and bushfire restoration across NSW.
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
                <h2 className="text-lg font-semibold mb-2">NSW Disaster Recovery Funding</h2>
                <p className="text-[#9CA3AF] text-sm leading-relaxed mb-3">
                  NSW Disaster Recovery Funding Arrangements (DRFA) provide Commonwealth-State co-funded assistance to eligible households and small businesses in declared disaster areas.
                  The NSW Reconstruction Authority manages declarations and administers assistance programs.
                </p>
                <a
                  href="https://www.nsw.gov.au/disaster-recovery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#00BFA6] text-sm hover:underline"
                >
                  View NSW disaster recovery information
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Services Available in NSW</h2>
            <p className="text-[#9CA3AF] text-center mb-12 max-w-2xl mx-auto">
              All services delivered to IICRC standards by independently licensed, insured, and IICRC-certified contractors across New South Wales.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {NSW_SERVICES.map((service) => (
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
                { step: '02', title: 'Contractor Assigned', description: 'An IICRC-certified NSW contractor is dispatched to your property for assessment.' },
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
            <h2 className="text-2xl font-bold mb-8 text-center">NSW Disaster Recovery — FAQs</h2>
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
            <h2 className="text-2xl font-bold mb-4">Ready to Lodge Your NSW Claim?</h2>
            <p className="text-[#9CA3AF] mb-8">
              Submit your claim online. An IICRC-certified NSW contractor will be assigned to your property.
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
