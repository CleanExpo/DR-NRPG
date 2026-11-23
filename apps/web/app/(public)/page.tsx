/**
 * Disaster Recovery Australia - Public Homepage
 *
 * Refactored for simplicity - header/footer now provided by (public)/layout.tsx
 *
 * This is the public-facing emergency disaster recovery platform for clients.
 * For contractors: see /contractor/portal (NRPG contractor-only portal)
 *
 * Content Sections:
 * 1. EmergencyHero - Primary hero with CTAs
 * 2. InsurancePartners - Trust signals band
 * 3. QuickTriageTool - Interactive disaster assessment
 * 4. ServicesGrid - Visual grid of disaster types
 * 5. ResourcesHub - Featured content
 * 6. Trust & Credibility - Why choose us section
 * 7. JoinNRPGSection - Contractor recruitment
 * 8. Final EmergencyCTA - Bottom conversion point
 *
 * Design Standards:
 * - Authority/Clinical aesthetic (navy, white, structured layouts)
 * - Mobile-first responsive design
 * - WCAG 2.1 AA compliance
 * - Performance optimized (LCP <1.5s target)
 *
 * SEO: Schema.org markup, semantic HTML, optimized meta tags
 */

'use client'

import React from 'react'
import { EmergencyHero } from '@/components/public/sections/EmergencyHero'
import { EmergencyCTA } from '@/src/design-system'
import { 
  QuickTriageTool,
  ServicesGrid,
  ResourcesHub,
  JoinNRPGSection,
  InsurancePartners,
} from '@/components/marketing'
import { schemaGenerator } from '@/lib/seo/schema-generator'
import { PageTransition } from '@/src/design-system/components/Layout/PageTransition'
import { ScrollReveal } from '@/src/design-system/components/Layout/ScrollReveal'
import dynamic from 'next/dynamic'

// Dynamically import below-fold sections for code splitting
const QuickTriageToolDynamic = dynamic(
  () => import('@/components/marketing').then(m => ({ default: m.QuickTriageTool })),
  { ssr: true, loading: () => <div className="h-[600px]" /> }
)

const ServicesGridDynamic = dynamic(
  () => import('@/components/marketing').then(m => ({ default: m.ServicesGrid })),
  { ssr: true, loading: () => <div className="h-[800px]" /> }
)

const ResourcesHubDynamic = dynamic(
  () => import('@/components/marketing').then(m => ({ default: m.ResourcesHub })),
  { ssr: true, loading: () => <div className="h-[600px]" /> }
)

const JoinNRPGSectionDynamic = dynamic(
  () => import('@/components/marketing').then(m => ({ default: m.JoinNRPGSection })),
  { ssr: true, loading: () => <div className="h-[400px]" /> }
)

const InsurancePartnersDynamic = dynamic(
  () => import('@/components/marketing').then(m => ({ default: m.InsurancePartners })),
  { ssr: true, loading: () => <div className="h-[200px]" /> }
)

/**
 * Public Homepage Component
 *
 * Simplified structure that relies on (public)/layout.tsx for header/footer.
 * Focus on content sections and conversion points.
 */
export default function HomePage() {
  // Generate Schema.org structured data for SEO
  const organizationSchema = schemaGenerator.generateOrganizationSchema()
  const emergencyServiceSchema = schemaGenerator.generateEmergencyServiceSchema()

  const howToSchema = schemaGenerator.generateHowToSchema({
    title: 'How to Get Emergency Disaster Recovery Assistance',
    description: 'Submit a claim and be connected with a qualified contractor in minutes.',
    steps: [
      {
        title: 'Submit Your Claim Online',
        description: 'Fill out our 3-minute emergency claim form with details about your disaster.',
      },
      {
        title: 'AI-Matched to Certified Contractors',
        description: 'Our AI instantly matches you to the nearest qualified contractor.',
      },
      {
        title: 'Rapid On-Site Response',
        description: 'A verified contractor is dispatched to your location as a priority job. Response times vary by location and contractor availability.',
      },
      {
        title: 'Restoration & Insurance Coordination',
        description: 'We provide industry-standard documentation — scope of works and estimate — for you to submit to your insurer.',
      },
    ],
  })

  const faqSchema = schemaGenerator.generateFAQSchema([
    {
      question: 'How quickly can you respond to a disaster emergency?',
      answer: 'All emergency claims receive priority dispatch. A verified qualified contractor is assigned as quickly as possible, 24 hours a day, 7 days a week. Response times vary by location and contractor availability.',
    },
    {
      question: 'Which types of disaster damage do you cover?',
      answer: 'We cover water damage, flood damage, fire and smoke damage, storm damage, mould remediation, and biohazard cleanup across all Australian states and territories.',
    },
    {
      question: 'Are your contractors certified and insured?',
      answer: 'Every contractor in the NRPG network independently holds their own trade licences and their own business insurance. They operate as independent businesses verified through a proprietary onboarding process with no equivalent in Australia or New Zealand.',
    },
    {
      question: 'Do you work with all insurance companies?',
      answer: 'Yes. Our contractors produce industry-standard documentation — scope of works, estimates, and reports — accepted by all major Australian insurers. You submit this documentation to your insurer as part of your claim.',
    },
    {
      question: 'How much does disaster restoration cost?',
      answer: 'Costs vary based on the type and extent of damage. In many cases, restoration is fully covered by home and contents insurance. Our contractors provide detailed assessments for your insurer.',
    },
  ])

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(emergencyServiceSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      {/* Main Content */}
      <div className="min-h-screen bg-white dark:bg-slate-950">
        {/* 1. HERO SECTION - Emergency-First Design */}
        <PageTransition variant="fadeInUp">
          <EmergencyHero />
        </PageTransition>

        {/* 2. TRUST SIGNALS BAND - Insurance Partners */}
        <ScrollReveal>
          <section className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 py-12 md:py-16" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}>
            <div className="container mx-auto px-6">
              <InsurancePartnersDynamic />
            </div>
          </section>
        </ScrollReveal>

        {/* 3. QUICK TRIAGE TOOL - Interactive Assessment */}
        <ScrollReveal>
          <section className="container mx-auto px-6 py-16 md:py-24" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 600px' }}>
            <QuickTriageToolDynamic />
          </section>
        </ScrollReveal>

        {/* 4. SERVICES GRID - Visual Disaster Types */}
        <ScrollReveal>
          <section className="bg-slate-50 dark:bg-slate-900 py-16 md:py-24" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 800px' }}>
            <div className="container mx-auto px-6">
              <ServicesGridDynamic
                title="Complete Disaster Recovery Services"
                subtitle="Qualified restoration for every emergency scenario"
                columns={4}
              />
            </div>
          </section>
        </ScrollReveal>

        {/* 5. RESOURCES HUB - Featured Content */}
        <ScrollReveal>
          <section className="container mx-auto px-6 py-16 md:py-24" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 600px' }}>
            <ResourcesHubDynamic
              title="Knowledge Center"
              subtitle="Expert guides and resources to help you navigate disaster recovery"
              maxItems={6}
            />
          </section>
        </ScrollReveal>

        {/* 6. TRUST & CREDIBILITY SECTION */}
        <ScrollReveal>
          <section className="bg-gradient-to-br from-blue-600 to-blue-700 py-16 md:py-24" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4">
                  Why Choose Disaster Recovery Australia?
                </h2>
                <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                  Professional standards. Nationwide coverage. 24/7 response.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Qualified */}
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-sm mb-4">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">
                    Qualified
                  </h3>
                  <p className="text-blue-100 leading-relaxed">
                    Every contractor independently holds their own licences and their own business insurance — verified through an onboarding process unmatched in Australia and New Zealand
                  </p>
                </div>

                {/* 24/7 Emergency Response */}
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-sm mb-4">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">
                    24/7 Emergency Response
                  </h3>
                  <p className="text-blue-100 leading-relaxed">
                    Round-the-clock dispatch to connect you with the nearest qualified contractor
                  </p>
                </div>

                {/* Insurance Approved */}
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-sm mb-4">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">
                    Insurance-Ready Documentation
                  </h3>
                  <p className="text-blue-100 leading-relaxed">
                    All work documented to industry and Australian standards — a professional scope of works and estimate you can submit to your insurer
                  </p>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* 7. HOW IT WORKS - Process Steps (DIS-23) */}
        <ScrollReveal>
          <section className="container mx-auto px-6 py-16 md:py-24" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
                How It Works
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                From emergency claim to on-site restoration — four simple steps
              </p>
            </div>

            <ol className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto list-none">
              {[
                {
                  step: '1',
                  title: 'Submit Your Claim Online',
                  description: 'Fill out our 3-minute emergency claim form with details about your disaster.',
                },
                {
                  step: '2',
                  title: 'AI-Matched to Certified Contractors',
                  description: 'Our AI instantly matches you to the nearest qualified contractor.',
                },
                {
                  step: '3',
                  title: 'Rapid On-Site Response',
                  description: 'A verified contractor is dispatched to your location as a priority job. Response times vary by location and contractor availability.',
                },
                {
                  step: '4',
                  title: 'Restoration & Insurance Coordination',
                  description: 'We provide industry-standard documentation — scope of works and estimate — for you to submit to your insurer.',
                },
              ].map(({ step, title, description }) => (
                <li key={step} className="flex flex-col items-center text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white font-display text-2xl font-black flex-shrink-0">
                    {step}
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    {title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                    {description}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </ScrollReveal>

        {/* 8. FAQ SECTION (DIS-22) */}
        <ScrollReveal>
          <section className="bg-slate-50 dark:bg-slate-900 py-16 md:py-24">
            <div className="container mx-auto px-6 max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="font-display text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-300">
                  Everything you need to know about disaster recovery with NRPG
                </p>
              </div>

              <dl className="space-y-6">
                {[
                  {
                    question: 'How quickly can you respond to a disaster emergency?',
                    answer: 'All emergency claims receive priority dispatch. A verified qualified contractor is assigned as quickly as possible, 24 hours a day, 7 days a week. Response times vary by location and contractor availability.',
                  },
                  {
                    question: 'Which types of disaster damage do you cover?',
                    answer: 'We cover water damage, flood damage, fire and smoke damage, storm damage, mould remediation, and biohazard cleanup across all Australian states and territories.',
                  },
                  {
                    question: 'Are your contractors certified and insured?',
                    answer: 'Every contractor in the NRPG network independently holds their own trade licences and their own business insurance. They operate as independent businesses verified through a proprietary onboarding process with no equivalent in Australia or New Zealand.',
                  },
                  {
                    question: 'Do you work with all insurance companies?',
                    answer: 'Yes. Our contractors produce industry-standard documentation — scope of works, estimates, and reports — accepted by all major Australian insurers. You submit this documentation to your insurer as part of your claim.',
                  },
                  {
                    question: 'How much does disaster restoration cost?',
                    answer: 'Costs vary based on the type and extent of damage. In many cases, restoration is fully covered by home and contents insurance. Our contractors provide detailed assessments for your insurer.',
                  },
                ].map(({ question, answer }) => (
                  <div
                    key={question}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
                  >
                    <dt className="font-display text-lg font-bold text-slate-900 dark:text-white mb-3">
                      {question}
                    </dt>
                    <dd className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </ScrollReveal>

        {/* 9. JOIN NRPG SECTION - Contractor Recruitment */}
        <ScrollReveal>
          <section className="container mx-auto px-6 py-16 md:py-24">
            <JoinNRPGSectionDynamic variant="default" />
          </section>
        </ScrollReveal>

        {/* 10. FINAL EMERGENCY CTA */}
        <ScrollReveal>
          <section className="container mx-auto px-6 py-16">
            <EmergencyCTA />
          </section>
        </ScrollReveal>
      </div>
    </>
  )
}