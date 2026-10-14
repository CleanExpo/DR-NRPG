/**
 * Contractor Application Landing Page
 *
 * Route: /contractors/join
 * Purpose: Contractor recruitment and application
 * Target: IICRC-certified contractors looking to join NRPG network
 * Conversion goal: High-quality contractor applications
 */

import { SITE_URL } from '@/lib/seo/site-url';
import React from 'react';
import { Metadata } from 'next';
import { HeroSection } from '@/components/landing/hero-section';
import { ValuePropsGrid, contractorValueProps } from '@/components/landing/value-props-grid';
import { FAQAccordion, contractorFAQs } from '@/components/landing/faq-accordion';
import { TrainingModuleBreakdown } from '@/components/landing/training-module-breakdown';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Join NRPG Network - Certified Disaster Recovery Contractors | Australia',
  description:
    'Join Australia\'s premier IICRC-verified disaster recovery network. Get qualified leads daily with just a $550 flat fee per claim - no commission, no monthly fees. Complete 24-module certification program and start earning.',
  openGraph: {
    title: 'Join the NRPG Contractor Network',
    description:
      'Get qualified disaster recovery leads daily. $550 flat fee per claim - no commission, no monthly fees. Complete professional training and join 200+ certified contractors across Australia.',
    type: 'website',
    url: `${SITE_URL}/contractors/join`,
  },
  keywords: [
    'disaster recovery contractors',
    'IICRC certified',
    'contractor network Australia',
    'restoration leads',
    'water damage contractors',
    'fire restoration contractors',
    'mould remediation contractors',
    'qualified leads',
    'contractor certification',
  ],
};

export default function ContractorJoinPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection
        headline="Join Australia's Premier Disaster Recovery Network"
        subheadline="Get qualified leads daily. Keep 100% of your revenue minus a flat $550 platform fee per claim. No monthly fees, no commission. Complete our 24-module certification and start earning."
        ctaText="Apply Now"
        ctaHref="#application-form"
        trustBadges={[
          {
            icon: (
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            ),
            text: '200+ Certified Contractors',
          },
          {
            icon: (
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            ),
            text: 'IICRC Verified',
          },
          {
            icon: (
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 3a1 1 0 011-1h.01a1 1 0 010 2H7a1 1 0 01-1-1zm2 3a1 1 0 00-2 0v1a2 2 0 00-2 2v1a2 2 0 00-2 2v.683a3.7 3.7 0 011.055.485 1.704 1.704 0 001.89 0 3.704 3.704 0 014.11 0 1.704 1.704 0 001.89 0 3.704 3.704 0 014.11 0 1.704 1.704 0 001.89 0A3.7 3.7 0 0118 12.683V12a2 2 0 00-2-2V9a2 2 0 00-2-2V6a1 1 0 10-2 0v1h-1V6a1 1 0 10-2 0v1H8V6zm10 8.868a3.704 3.704 0 01-4.055-.036 1.704 1.704 0 00-1.89 0 3.704 3.704 0 01-4.11 0 1.704 1.704 0 00-1.89 0A3.704 3.704 0 012 14.868V17a1 1 0 001 1h14a1 1 0 001-1v-2.132zM9 3a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm3 0a1 1 0 011-1h.01a1 1 0 110 2H13a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ),
            text: 'Australia-Wide Coverage',
          },
        ]}
      />

      {/* Value Propositions */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Contractors Choose NRPG
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
              No upfront costs. No monthly fees. No commission. Just qualified leads and a simple $550 flat fee per claim.
            </p>
          </div>

          <div className="mt-12">
            <ValuePropsGrid valueProps={contractorValueProps} />
          </div>
        </div>
      </section>

      {/* Cost Transparency */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Transparent Pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
              No hidden fees. No surprises. Just straightforward pricing.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* Training Investment */}
            <div className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-lg">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">Training Investment</h3>
                <p className="text-blue-100">One-time certification fee</p>
              </div>
              <div className="p-6">
                <div className="mb-4 text-center">
                  <div className="text-5xl font-bold text-gray-900">$1,495</div>
                  <div className="text-gray-400">AUD (one-time)</div>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg
                      className="mt-1 h-5 w-5 flex-shrink-0 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2">All 24 NRPG certification modules (22+ hours)</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mt-1 h-5 w-5 flex-shrink-0 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2">315 quiz questions and assessments</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mt-1 h-5 w-5 flex-shrink-0 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2">Lifetime access to all training materials</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mt-1 h-5 w-5 flex-shrink-0 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2">NRPG certification upon completion</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mt-1 h-5 w-5 flex-shrink-0 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2">Ongoing updates and continuing education</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Platform Fee Structure */}
            <div className="overflow-hidden rounded-xl border border-green-200 bg-white shadow-lg">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">Platform Fee</h3>
                <p className="text-green-100">Simple, transparent pricing - no commission</p>
              </div>
              <div className="p-6">
                <div className="mb-4 text-center">
                  <div className="text-5xl font-bold text-gray-900">$550</div>
                  <div className="text-gray-400">Flat fee per claim</div>
                </div>

                <div className="mb-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                  <h4 className="mb-3 font-semibold text-blue-900">How It Works:</h4>
                  <ol className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start">
                      <span className="mr-2 font-bold">1.</span>
                      <span>Client pays <strong>$2,750</strong> upfront for emergency make-safe work</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 font-bold">2.</span>
                      <span>You receive <strong>$2,200</strong> ($2,750 - $550 platform fee)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 font-bold">3.</span>
                      <span>You create scope and quote for remaining restoration work</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 font-bold">4.</span>
                      <span>You keep <strong>100% of remaining work</strong> - no commission</span>
                    </li>
                  </ol>
                </div>

                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg
                      className="mt-1 h-5 w-5 flex-shrink-0 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2">No percentage commissions on any work</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mt-1 h-5 w-5 flex-shrink-0 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2">No monthly subscription fees</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mt-1 h-5 w-5 flex-shrink-0 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2">No listing fees or lead costs</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mt-1 h-5 w-5 flex-shrink-0 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2">Keep 100% of all additional restoration work</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mt-1 h-5 w-5 flex-shrink-0 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2">No cancellation penalties</span>
                  </li>
                </ul>
                <div className="mt-4 rounded bg-green-50 p-3 text-sm text-green-800">
                  <strong>Compare:</strong> HIPages takes 20-30% commission, ServiceSeeking takes 15-25%. We take just $550 flat - you keep the rest.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 hover:underline"
            >
              View detailed pricing breakdown
              <svg className="ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Training Module Breakdown */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Complete Training Program
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
              24 professional modules covering every aspect of disaster recovery business operations
            </p>
          </div>

          <div className="mt-12">
            <TrainingModuleBreakdown />
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="application-form" className="scroll-mt-20 bg-gray-50 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Create Your Contractor Account
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
                Register online in minutes. Complete the 24-module training program and start
                receiving qualified leads from day one.
              </p>
            </div>

            <div className="mt-8 rounded-lg border-l-4 border-blue-600 bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                <strong>What happens next:</strong> Create your account, complete the 5-step
                onboarding to set your services and coverage area, then enrol in the 24-module
                NRPG certification program ($1,495 AUD). Once certified, leads are assigned
                automatically — $550 flat fee per claim, no commission, no monthly fees.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">1</span>
                  <div>
                    <p className="font-semibold text-gray-900">Create your account</p>
                    <p className="mt-1 text-sm text-gray-500">Name, email, and password — takes 60 seconds</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">2</span>
                  <div>
                    <p className="font-semibold text-gray-900">Complete onboarding</p>
                    <p className="mt-1 text-sm text-gray-500">Services, coverage area, experience level</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">3</span>
                  <div>
                    <p className="font-semibold text-gray-900">Upload verification docs</p>
                    <p className="mt-1 text-sm text-gray-500">IICRC certificate, ABN, public liability insurance</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">4</span>
                  <div>
                    <p className="font-semibold text-gray-900">Start receiving leads</p>
                    <p className="mt-1 text-sm text-gray-500">Qualified jobs matched to your area and services</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/signup?type=contractor"
                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl sm:w-auto"
              >
                Create Contractor Account
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/contractor/portal"
                className="inline-flex w-full items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 transition hover:border-blue-600 hover:text-blue-600 sm:w-auto"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
              Everything you need to know about joining NRPG
            </p>
          </div>

          <div className="mt-12">
            <FAQAccordion faqs={contractorFAQs} />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-900 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Start Getting Qualified Leads Today
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Join 200+ certified contractors keeping 100% of their work with just a $550 flat fee per claim and no monthly fees.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a
              href="#application-form"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Apply Now
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </a>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg border-2 border-white bg-transparent px-8 py-4 text-lg font-semibold text-white transition hover:bg-white hover:text-blue-600"
            >
              View Pricing Details
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
