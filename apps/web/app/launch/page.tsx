/**
 * Waitlist Landing Page
 *
 * Route: /launch
 * Purpose: Pre-launch email capture for waitlist sign-ups
 * Target: Property owners + contractors interested in the platform
 * Conversion goal: 20-40% email capture rate
 */

import { SITE_URL } from '@/lib/seo/site-url';
import React from 'react';
import { Metadata } from 'next';
import { HeroSection } from '@/components/landing/hero-section';
import { EmailCaptureForm } from '@/components/landing/email-capture-form';
import { ValuePropsGrid, propertyOwnerValueProps } from '@/components/landing/value-props-grid';
import { FAQAccordion, waitlistFAQs } from '@/components/landing/faq-accordion';

export const metadata: Metadata = {
  title: 'Join the Waitlist - NRPG | Australia\'s Premier Disaster Recovery Network',
  description:
    'Be first to access Australia\'s leading IICRC-verified disaster recovery network. Join 500+ property owners and contractors on the waitlist. Launching Q2 2026.',
  openGraph: {
    title: 'Join the NRPG Waitlist - Launching Q2 2026',
    description:
      'Australia\'s first platform connecting property owners with verified disaster recovery contractors. 24/7 emergency response, transparent pricing, IICRC-certified professionals.',
    type: 'website',
    url: `${SITE_URL}/launch`,
    images: [
      {
        url: `${SITE_URL}/og-image-launch.jpg`,
        width: 1200,
        height: 630,
        alt: 'NRPG - National Restoration Professionals Group',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join the NRPG Waitlist',
    description:
      'Be first to access Australia\'s premier disaster recovery network. Launching Q2 2026.',
  },
  keywords: [
    'disaster recovery',
    'IICRC certified contractors',
    'emergency restoration',
    'water damage',
    'flood restoration',
    'fire damage',
    'mould remediation',
    'storm damage',
    'Australia',
    'waitlist',
  ],
};

export default function LaunchPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection
        headline="Australia's First IICRC-Verified Disaster Recovery Network"
        subheadline="Join 500+ property owners and contractors waiting for trusted, transparent disaster restoration. Launching Q2 2026."
        ctaText="Join the Waitlist"
        ctaHref="#waitlist-form"
        trustBadges={[
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
            text: '24/7 Emergency Response',
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
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            ),
            text: 'Australia-Wide',
          },
        ]}
      />

      {/* Value Propositions */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Property Owners Choose NRPG
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
              No more guesswork. No more bad contractors. Just verified professionals who show up and
              get the job done right.
            </p>
          </div>

          <div className="mt-12">
            <ValuePropsGrid valueProps={propertyOwnerValueProps} />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
              Get matched with verified contractors in 3 simple steps
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Submit Your Claim</h3>
              <p className="mt-2 text-base text-gray-400">
                Tell us what happened. Water damage? Fire? Mould? Takes 2 minutes. No credit card
                required.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                Get Matched with Verified Contractors
              </h3>
              <p className="mt-2 text-base text-gray-400">
                Our system matches you with IICRC-certified contractors in your area within 15
                minutes. All verified, insured, and background-checked.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                Track Your Restoration Progress
              </h3>
              <p className="mt-2 text-base text-gray-400">
                Contractor contacts you, provides a transparent quote, and starts work. Track progress
                in real-time through our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Form Section */}
      <section id="waitlist-form" className="scroll-mt-20 bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Join the Waitlist Today
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
              Be among the first to access the platform. Get early access 2 weeks before public
              launch.
            </p>
          </div>

          <div className="mt-12">
            <EmailCaptureForm source="waitlist" />
          </div>

          {/* Social Proof */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-400">
              <span className="font-semibold text-gray-900">500+ people</span> have already joined
              the waitlist
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-orange-400 to-blue-600"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400">and counting...</span>
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
              Everything you need to know about joining the waitlist
            </p>
          </div>

          <div className="mt-12">
            <FAQAccordion faqs={waitlistFAQs} />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-orange-600 to-blue-900 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Join the Waitlist?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Don't miss out. Be first to access Australia's premier disaster recovery network.
          </p>
          <div className="mt-8">
            <a
              href="#waitlist-form"
              className="inline-flex items-center rounded-lg bg-white px-8 py-4 text-lg font-semibold text-orange-600 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Join the Waitlist Now
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
