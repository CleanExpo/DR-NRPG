/**
 * New Zealand Hub — Coming Soon
 *
 * NZ expansion is planned. This page captures search intent now
 * and provides a notify/waitlist CTA so we have qualified leads
 * ready when the NZ contractor network launches.
 *
 * ACL s18 compliant — no unverified statistics.
 * No fake contractor count or coverage claims.
 */

import { SITE_URL } from '@/lib/seo/site-url'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { ArrowRight, MapPin, Bell, Shield, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disaster Recovery Services New Zealand | NRPG — Coming Soon',
  description:
    'NRPG is expanding to New Zealand. IICRC-certified disaster recovery services — storm, flood, earthquake, and fire damage restoration — coming to NZ. Register your interest to be notified at launch.',
  keywords: [
    'disaster recovery New Zealand',
    'NRPG New Zealand',
    'flood restoration NZ',
    'storm damage repair New Zealand',
    'IICRC certified New Zealand',
    'disaster recovery Auckland',
    'disaster recovery Wellington',
  ],
  alternates: {
    canonical: `${SITE_URL}/services/new-zealand`,
  },
  openGraph: {
    title: 'NRPG Coming to New Zealand — Disaster Recovery Services NZ',
    description:
      'NRPG is expanding to New Zealand. IICRC-certified storm, flood, earthquake, and fire damage restoration — coming soon.',
    url: `${SITE_URL}/services/new-zealand`,
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
    { '@type': 'ListItem', position: 3, name: 'New Zealand', item: `${SITE_URL}/services/new-zealand` },
  ],
}

const PLANNED_SERVICES = [
  {
    title: 'Flood & Storm Restoration',
    description: 'Responding to NZ\'s frequent severe weather events — structured drying, extraction, and IICRC-standard documentation.',
    icon: '🌊',
  },
  {
    title: 'Earthquake Damage Restoration',
    description: 'Structural assessment and restoration following seismic events — water ingress, structural drying, and make-safe works.',
    icon: '🏚️',
  },
  {
    title: 'Fire & Smoke Restoration',
    description: 'Soot removal, smoke odour treatment, and suppression-water extraction to IICRC S770 standard.',
    icon: '🔥',
  },
  {
    title: 'Mould Remediation',
    description: 'Post-flood and post-storm mould assessment and remediation. AS/NZS IICRC S520 standards.',
    icon: '🔬',
  },
  {
    title: 'Water Damage Restoration',
    description: 'Emergency water extraction and structural drying for burst pipes, roof leaks, and storm ingress.',
    icon: '💧',
  },
  {
    title: 'Contents Restoration',
    description: 'Recovery and restoration of personal contents and assets following disaster events.',
    icon: '📦',
  },
]

export default function NewZealandHubPage() {
  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="py-24">
        {/* Hero */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              New Zealand — Coming Soon
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Disaster Recovery Services<br />
              <span className="text-amber-400">New Zealand</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] max-w-2xl mx-auto mb-6">
              NRPG is expanding its IICRC-certified contractor network to New Zealand. Storm, flood, earthquake,
              and fire damage restoration — coming to NZ.
            </p>
            <p className="text-[#9CA3AF] max-w-xl mx-auto mb-10">
              NZ contractors will independently hold their own NZBN, trade licences, and IICRC certifications —
              the same proprietary onboarding standard that makes NRPG unmatched in Australia.
            </p>

            {/* Notify CTA */}
            <div className="bg-[#1F2937] border border-amber-500/30 rounded-2xl p-8 max-w-md mx-auto mb-8">
              <Bell className="w-10 h-10 text-amber-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Be First to Know</h2>
              <p className="text-[#9CA3AF] text-sm mb-6">
                Register your interest and we&apos;ll notify you the moment NRPG launches in New Zealand.
              </p>
              <Button asChild size="lg" className="w-full bg-amber-500 hover:bg-amber-400 text-[#0F1115] font-semibold">
                <Link href="/contact?subject=NZ+Launch+Notification">
                  Notify Me at NZ Launch
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <p className="text-[#9CA3AF] text-sm">
              Already in Australia?{' '}
              <Link href="/services" className="text-[#00BFA6] hover:underline">
                View all Australian services →
              </Link>
            </p>
          </div>
        </section>

        {/* What's Coming */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Planned Services for New Zealand</h2>
            <p className="text-[#9CA3AF] text-center mb-12 max-w-2xl mx-auto">
              All services will be delivered to IICRC standards by independently licensed, insured, and IICRC-certified contractors — the same standard applied across Australia.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PLANNED_SERVICES.map((service) => (
                <div
                  key={service.title}
                  className="bg-[#1F2937] border border-[#374151] rounded-xl p-6 opacity-80"
                >
                  <div className="text-3xl mb-4">{service.icon}</div>
                  <h3 className="text-lg font-semibold mb-2 text-[#F9FAFB]">
                    {service.title}
                  </h3>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">{service.description}</p>
                  <div className="mt-4 inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-xs">
                    Coming Soon
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why NRPG NZ */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-3xl mx-auto bg-[#1F2937] border border-[#374151] rounded-xl p-8">
            <Shield className="w-10 h-10 text-[#00BFA6] mb-4" />
            <h2 className="text-2xl font-bold mb-4">The NRPG Standard — Coming to NZ</h2>
            <p className="text-[#9CA3AF] mb-6 leading-relaxed">
              Every NRPG contractor in New Zealand will independently hold their own NZBN, trade licences, and IICRC certification —
              an onboarding and vetting standard with no equivalent currently operating in New Zealand.
            </p>
            <ul className="space-y-3">
              {[
                'Each contractor holds their own IICRC certification independently',
                'Each contractor holds their own trade licences and NZBN',
                'Each contractor holds their own public liability and professional indemnity insurance',
                'All work documented to AS/NZS IICRC standards for insurance submissions',
                '24/7 emergency response target across major NZ cities',
              ].map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00BFA6] mt-0.5 shrink-0" />
                  <span className="text-[#9CA3AF] text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* NZ Contractor CTA */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-3xl mx-auto bg-[#1F2937] border border-[#374151] rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">New Zealand Contractor? Join the Network</h2>
            <p className="text-[#9CA3AF] mb-6">
              Are you an IICRC-certified restoration contractor in New Zealand? Register your interest in joining the NRPG network at launch.
            </p>
            <Button asChild variant="outline" size="lg" className="border-[#00BFA6] text-[#00BFA6] hover:bg-[#00BFA6]/10">
              <Link href="/contact?subject=NZ+Contractor+Interest">
                Register as an NZ Contractor
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Interim — Australian Services */}
        <section className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[#9CA3AF] mb-4">Need disaster recovery services now?</p>
            <Button asChild size="lg" className="bg-[#00BFA6] hover:bg-[#00BFA6]/90 text-white">
              <Link href="/services">
                View Australian Services
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
