/**
 * BUILD-004: Professional Documentation for Insurance Claims
 *
 * Correct framing per Phill McGurk (6 April 2026):
 * NRPG/DR are specialist restoration service companies. They perform works,
 * provide reports, scopes of works, and estimates — to IICRC best practice
 * and Australian standards. Whether the client is reimbursed by their insurer
 * is between the client and their insurer. NRPG does not advocate for claims,
 * determine outcomes, or guarantee reimbursement.
 *
 * Pre-Deploy Checklist:
 * G1 ✅ No "TBD" content — complete.
 * G2 ✅ No legal claims — describes service and documentation only.
 * G3 ✅ No unverified statistics.
 * G5 ✅ ACL s18 compliant — no misleading representations.
 *
 * CLAUDE.md: No phone/email/address — online claim CTA only.
 */

import { SITE_URL } from '@/lib/seo/site-url'
import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import {
  Shield,
  CheckCircle,
  ArrowRight,
  FileText,
  ClipboardList,
  Search,
  Wrench,
  ChevronRight,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Professional Restoration Reports & Scope of Works | NRPG',
  description:
    'NRPG provides IICRC-certified inspection, scope of works, estimates, and restoration services to Australian and IICRC best practice standards. Professional documentation your insurer will recognise.',
  alternates: {
    canonical: `${SITE_URL}/insurance-claim-advocate`,
  },
  openGraph: {
    title: 'Professional Restoration Reports & Scope of Works | NRPG',
    description:
      'IICRC-certified inspection, damage report, scope of works, and estimate — prepared to Australian standards. NRPG performs the works; the documentation is yours to use as you choose.',
    url: `${SITE_URL}/insurance-claim-advocate`,
    type: 'article',
  },
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Professional Restoration Documentation — What NRPG Provides',
  description:
    'NRPG delivers IICRC-certified restoration works, inspection reports, scopes of works, and estimates prepared to Australian and international best practice standards.',
  url: `${SITE_URL}/insurance-claim-advocate`,
  publisher: {
    '@type': 'Organization',
    name: 'NRPG — National Restoration & Property Group',
    url: SITE_URL,
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Resources', item: `${SITE_URL}/resources` },
    { '@type': 'ListItem', position: 3, name: 'Restoration Documentation', item: `${SITE_URL}/insurance-claim-advocate` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What documentation does NRPG provide after a restoration job?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'NRPG provides a written inspection report documenting the extent and cause of damage, a scope of works detailing the restoration required, and a cost estimate — all prepared to IICRC and Australian standards. This documentation is provided to the property owner and may be submitted to their insurer at the owner\'s discretion.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does NRPG handle my insurance claim?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. NRPG\'s role is to assess damage, perform restoration works, and provide professional documentation. The insurance claim is between the property owner and their insurer. NRPG does not determine claim outcomes and does not act as a claims agent or advocate.',
      },
    },
    {
      '@type': 'Question',
      name: 'What standards do NRPG contractors work to?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All NRPG contractors hold current IICRC certification and perform works to the relevant IICRC standards: S500 for water damage, S520 for mould, FSRT for fire and smoke. All work is conducted in accordance with applicable Australian regulations and guidelines.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does an NRPG inspection report include?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'An NRPG inspection report includes: documentation of the damage observed (with measurements and photographs), moisture readings and readings from diagnostic equipment, identification of the damage category and cause where determinable, and a scope of works with itemised cost estimate for restoration to pre-loss condition.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is AFCA and when is it relevant?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Australian Financial Complaints Authority (AFCA) is a free, independent dispute resolution service for policyholders who have unresolved complaints with their insurer. If a property owner has a dispute with their insurer about a claim, they can lodge a complaint with AFCA at afca.org.au. NRPG documentation — prepared to IICRC standards — may be submitted by the property owner as part of their AFCA complaint.',
      },
    },
  ],
}

const WHAT_WE_PROVIDE = [
  {
    icon: Search,
    title: 'On-Site Inspection',
    description:
      'IICRC-certified contractors inspect the property in person using moisture meters, thermal imaging, and diagnostic equipment — documenting damage that may not be visible to the untrained eye.',
  },
  {
    icon: FileText,
    title: 'Damage Report',
    description:
      'A written report documenting the extent, location, and category of damage — with photographs, measurements, and moisture readings. Prepared to IICRC and Australian standards.',
  },
  {
    icon: ClipboardList,
    title: 'Scope of Works',
    description:
      'A detailed itemised scope describing the restoration work required to return the property to its pre-loss condition — the standard document recognised by the Australian restoration industry.',
  },
  {
    icon: Wrench,
    title: 'Restoration Works',
    description:
      'The actual remediation and restoration — water extraction, structural drying, mould remediation, smoke/soot removal, or fire damage restoration — performed to IICRC best practice.',
  },
]

const IICRC_STANDARDS = [
  { code: 'S500', description: 'Water Damage Restoration', href: '/services/water-damage' },
  { code: 'S520', description: 'Mould Remediation', href: '/services/mould-remediation' },
  { code: 'FSRT', description: 'Fire & Smoke Restoration', href: '/services/fire-smoke-damage' },
  { code: 'S100', description: 'Contents Cleaning', href: '/services/water-damage' },
]

export default function InsuranceDocumentationPage() {
  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
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

        {/* Breadcrumb */}
        <div className="container mx-auto px-6 mb-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Link href="/" className="hover:text-[#00BFA6] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/resources" className="hover:text-[#00BFA6] transition-colors">Resources</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#F9FAFB]">Restoration Documentation</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              IICRC-Certified Restoration
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Professional Restoration Works,{' '}
              <span className="text-[#00BFA6]">Documentation to Industry Standard</span>
            </h1>

            <p className="text-xl text-[#9CA3AF] mb-8 leading-relaxed max-w-3xl">
              NRPG specialist restoration contractors assess damage, perform works, and deliver a professional report, scope of works, and estimate — all prepared to IICRC best practice and Australian guidelines. What you do with that documentation is up to you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-[#00BFA6] hover:bg-[#00BFA6]/90 text-white">
                <Link href="/claim">
                  Request an Assessment
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937]">
                <Link href="/certifications">
                  Our IICRC Certifications
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What the service is */}
        <section className="bg-[#1F2937] py-20 mb-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">What NRPG Does</h2>
              <p className="text-[#9CA3AF] mb-8 leading-relaxed">
                NRPG contractors are specialist restoration professionals. Their role is to respond to an incident, prevent further loss, and restore the property to its pre-loss condition — performing all work to IICRC standards and Australian best practice. At the conclusion of works, the property owner receives a professional report, scope, and estimate that documents exactly what was found and what was done.
              </p>

              <div className="bg-[#0F1115] border border-[#374151] rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-[#F9FAFB]">The service includes:</h3>
                <ul className="space-y-2 text-[#9CA3AF]">
                  {[
                    'On-site inspection and damage assessment',
                    'Written damage report with photographic evidence and diagnostic readings',
                    'Itemised scope of works — what needs to be done and why',
                    'Cost estimate prepared to industry standards',
                    'Remediation and restoration works performed by IICRC-certified contractors',
                    'Final documentation confirming works completed',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#00BFA6] mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0F1115] border border-amber-500/20 rounded-xl p-6">
                <h3 className="text-base font-semibold mb-2 text-amber-400">What NRPG does not do</h3>
                <p className="text-[#9CA3AF] text-sm leading-relaxed">
                  NRPG does not determine whether a property owner has a valid insurance claim, manage claims on behalf of clients, or guarantee reimbursement from any insurer. The insurance relationship is between the property owner and their insurer. NRPG charges for the services performed — inspection, report, scope, and works — regardless of how the property owner chooses to engage with their insurance provider.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What we provide */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">What You Receive</h2>
            <p className="text-[#9CA3AF] text-center mb-12 max-w-2xl mx-auto">
              Every NRPG engagement delivers four professionally prepared outputs.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {WHAT_WE_PROVIDE.map((item) => (
                <div
                  key={item.title}
                  className="bg-[#1F2937] border border-[#374151] rounded-xl p-6 hover:border-[#00BFA6]/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-[#00BFA6]/10 shrink-0">
                      <item.icon className="w-5 h-5 text-[#00BFA6]" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-[#F9FAFB]">{item.title}</h3>
                      <p className="text-[#9CA3AF] text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* IICRC Standards */}
        <section className="bg-[#1F2937] py-20 mb-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4 mb-8">
                <div className="p-3 rounded-xl bg-[#00BFA6]/10 shrink-0">
                  <Shield className="w-6 h-6 text-[#00BFA6]" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">Australian & IICRC Standards</h2>
                  <p className="text-[#9CA3AF] leading-relaxed">
                    All NRPG restoration works are performed to the relevant IICRC standard for the damage type. These are the internationally recognised best practice standards for professional restoration — the same standards used by restoration contractors globally and referenced by Australian insurers.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {IICRC_STANDARDS.map((std) => (
                  <Link
                    key={std.code}
                    href={std.href}
                    className="bg-[#0F1115] border border-[#374151] rounded-xl p-5 hover:border-[#00BFA6]/50 transition-colors group"
                  >
                    <div className="text-[#00BFA6] font-mono text-sm font-semibold mb-1">{std.code}</div>
                    <div className="font-semibold text-[#F9FAFB] group-hover:text-[#00BFA6] transition-colors">
                      {std.description}
                    </div>
                    <div className="flex items-center gap-1 text-[#6B7280] text-xs mt-2">
                      View service <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Insurance & AFCA context — factual only */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Insurance & Your Documentation</h2>
            <div className="space-y-4">
              <div className="bg-[#1F2937] border border-[#374151] rounded-xl p-6">
                <p className="text-[#9CA3AF] leading-relaxed">
                  Many property owners use the NRPG report, scope of works, and estimate as part of their insurance claim submission. Because the documentation is prepared by an IICRC-certified contractor to recognised industry standards, it provides a professionally prepared record of the damage and the work required. How you choose to use that documentation — including whether to submit it to your insurer — is entirely your decision.
                </p>
              </div>

              <div className="bg-[#0F1115] border border-[#374151] rounded-xl p-6">
                <h3 className="font-semibold mb-2 text-[#F9FAFB]">If you have a dispute with your insurer</h3>
                <p className="text-[#9CA3AF] text-sm leading-relaxed mb-3">
                  The Australian Financial Complaints Authority (AFCA) is a free, independent service for policyholders with unresolved complaints against their insurer. If you believe your insurer has not assessed your claim fairly, you can lodge a complaint at afca.org.au. Your NRPG documentation may be submitted as part of that process.
                </p>
                <a
                  href="https://www.afca.org.au/make-a-complaint"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#00BFA6] text-sm hover:underline"
                >
                  afca.org.au — lodge a complaint
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[#1F2937] py-20 mb-20">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqSchema.mainEntity.map((faq, i) => (
                  <div key={i} className="bg-[#0F1115] border border-[#374151] rounded-xl p-6">
                    <h3 className="font-semibold mb-3 flex items-start gap-2 text-[#F9FAFB]">
                      <CheckCircle className="w-5 h-5 text-[#00BFA6] mt-0.5 shrink-0" />
                      {faq.name}
                    </h3>
                    <p className="text-[#9CA3AF] text-sm leading-relaxed pl-7">
                      {faq.acceptedAnswer.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center bg-[#1F2937] border border-[#374151] rounded-2xl p-12">
            <FileText className="w-12 h-12 text-[#00BFA6] mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Request a Professional Assessment</h2>
            <p className="text-[#9CA3AF] mb-8 leading-relaxed">
              Submit your details online. An IICRC-certified NRPG contractor will assess the damage, perform the works, and provide a professional report, scope, and estimate — prepared to Australian and IICRC best practice.
            </p>
            <Button asChild size="lg" className="bg-[#00BFA6] hover:bg-[#00BFA6]/90 text-white">
              <Link href="/claim">
                Request Assessment
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
