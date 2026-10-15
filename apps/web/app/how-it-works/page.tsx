'use client';

/**
 * NRPG Contractor Acquisition Funnel - Page 2: Education
 *
 * Path: /how-it-works
 * Purpose: Explain platform mechanics, show pricing, demonstrate ROI
 * Next: /join
 */

import React from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import {
  Hero,
  PricingCard,
  ROICalculator,
  LeadPreview,
  Timeline,
} from '@/design-system';
import { ArrowRight, Zap } from 'lucide-react';
import { VerifiedBadge } from '@/icons';

export default function HowItWorksPage() {
  const pricingTiers = [
    {
      tier: 'basic' as const,
      name: 'Basic',
      price: 99,
      description: 'Perfect for getting started',
      features: [
        { text: 'Up to 10 leads per month', included: true },
        { text: 'Basic profile listing', included: true },
        { text: 'Mobile app access', included: true },
        { text: 'Email notifications', included: true },
        { text: 'Basic analytics dashboard', included: true },
        { text: 'Email support', included: true },
        { text: 'Priority support', included: false },
        { text: 'Featured placement', included: false },
      ],
      ctaText: 'Start with Basic',
    },
    {
      tier: 'pro' as const,
      name: 'Professional',
      price: 299,
      description: 'Best for growing businesses',
      popular: true,
      features: [
        { text: 'Up to 50 leads per month', included: true },
        { text: 'Featured profile listing', included: true },
        { text: 'Mobile app access', included: true },
        { text: 'SMS + Email notifications', included: true },
        { text: 'Advanced analytics & insights', included: true },
        { text: 'Priority support', included: true },
        { text: 'Marketing automation tools', included: true },
        { text: 'Business coaching sessions', included: true },
      ],
      ctaText: 'Choose Professional',
    },
    {
      tier: 'enterprise' as const,
      name: 'Enterprise',
      price: 799,
      description: 'For established contractors',
      features: [
        { text: 'Unlimited leads', included: true },
        { text: 'Premium profile placement', included: true },
        { text: 'Mobile app access', included: true },
        { text: 'SMS + Email + Push notifications', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: '24/7 priority support', included: true },
        { text: 'Custom branding options', included: true },
        { text: 'API access & integrations', included: true },
      ],
      ctaText: 'Go Enterprise',
    },
  ];

  const howItWorksSteps = [
    {
      id: 'step-1',
      number: 1,
      title: 'Client Reports Disaster',
      description:
        'Homeowner or business submits a claim through our website or app. They provide details about the disaster, location, and insurance information.',
    },
    {
      id: 'step-2',
      number: 2,
      title: 'AI Qualifies Lead',
      description:
        'Our AI system instantly validates contact information, verifies insurance status, assesses damage severity, and confirms the location is within your service area.',
    },
    {
      id: 'step-3',
      number: 3,
      title: 'Rotation System Dispatches',
      description:
        'Our fair rotation algorithm selects the next eligible contractor based on location, specialization, and availability. No favoritism, just equal opportunity.',
    },
    {
      id: 'step-4',
      number: 4,
      title: 'You Receive Notification',
      description:
        'Get instant SMS and email alerts with full lead details: client contact info, damage description, photos, insurance details, and urgency level.',
    },
    {
      id: 'step-5',
      number: 5,
      title: 'Close Job & Get Paid',
      description:
        'Contact the client, provide your quote, complete the work. Just $550 flat fee per claim — no commission. Keep 100% of all additional restoration work.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      <main>
        {/* Hero Section */}
        <Hero
          variant="centered"
          badge={{
            text: 'See How NRPG Works',
            icon: <Zap className="h-4 w-4" />,
          }}
          title="How the Platform Works"
          titleHighlight="Step by Step"
          description="From disaster report to completed job, here's exactly how NRPG connects you with high-quality, pre-qualified leads."
          className="pt-32 pb-20"
        />

        {/* How It Works Timeline */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="font-sans-modern font-bold text-4xl text-center mb-16">
            The NRPG Process
          </h2>

          <div className="max-w-4xl mx-auto">
            <Timeline
              steps={howItWorksSteps}
              mode="timeline"
              animated
              className="mb-12"
            />

            <div className="bg-gradient-to-br from-nrpg-primary/10 to-blue-500/10 border border-nrpg-primary/30 rounded-2xl p-8 text-center">
              <p className="text-xl text-gray-300">
                Average time from client submission to contractor notification:{' '}
                <span className="text-nrpg-primary font-bold">under 2 minutes</span>
              </p>
            </div>
          </div>
        </section>

        {/* Sample Lead Preview */}
        <section className="bg-gray-800/30 py-20">
          <div className="container mx-auto px-6">
            <h2 className="font-sans-modern font-bold text-4xl text-center mb-4">
              What You'll Receive
            </h2>
            <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
              Here's an example of what a qualified lead looks like. All details are verified before you receive them.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Sample Lead 1 */}
              <LeadPreview
                urgency="urgent"
                disasterType="Water Damage - Burst Pipe"
                location="Sydney"
                postcode="2000"
                insured
                insuranceProvider="NRMA"
                hasPhotos
                timeAgo="5 minutes ago"
              />

              {/* Sample Lead 2 */}
              <LeadPreview
                urgency="high"
                disasterType="Fire & Smoke Damage"
                location="Melbourne"
                postcode="3000"
                insured
                insuranceProvider="RACV"
                hasPhotos
                timeAgo="12 minutes ago"
              />
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-400 max-w-2xl mx-auto">
                Every lead includes verified contact details, damage photos, insurance information, and a detailed description. You'll have everything you need to provide an accurate quote and close the job.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="font-sans-modern font-bold text-4xl text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
            No hidden fees. No percentage commissions. No monthly subscription. Just a simple $550 flat fee per claim.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier) => (
              <PricingCard
                key={tier.tier}
                {...tier}
                onCTAClick={() => {
                  window.location.href = '/join';
                }}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex flex-col gap-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <VerifiedBadge size="md" gradient="primary" className="flex-shrink-0" aria-hidden="true" />
                <span>No setup fees or onboarding costs</span>
              </div>
              <div className="flex items-center gap-2">
                <VerifiedBadge size="md" gradient="primary" className="flex-shrink-0" aria-hidden="true" />
                <span>Cancel anytime, no lock-in contracts</span>
              </div>
              <div className="flex items-center gap-2">
                <VerifiedBadge size="md" gradient="primary" className="flex-shrink-0" aria-hidden="true" />
                <span>Keep 100% of your job earnings</span>
              </div>
            </div>
          </div>
        </section>

        {/* ROI Calculator */}
        <section className="bg-gray-800/30 py-20">
          <div className="container mx-auto px-6">
            <h2 className="font-sans-modern font-bold text-4xl text-center mb-4">
              Calculate Your ROI
            </h2>
            <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
              See how quickly the Professional tier pays for itself based on your average job value and close rate.
            </p>

            <div className="max-w-2xl mx-auto">
              <ROICalculator subscriptionPrice={299} />
            </div>

            <div className="mt-12 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700">
                <h3 className="font-semibold text-xl text-center mb-6">
                  Real Contractor Results
                </h3>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-nrpg-primary mb-2">
                      $3,200
                    </div>
                    <div className="text-gray-400 text-sm">
                      Average job value
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-500 mb-2">
                      58%
                    </div>
                    <div className="text-gray-400 text-sm">
                      Average close rate
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-nrpg-secondary mb-2">
                      $18.5k
                    </div>
                    <div className="text-gray-400 text-sm">
                      Monthly revenue (Pro tier)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="font-sans-modern font-bold text-4xl text-center mb-16">
            Common Questions
          </h2>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                q: 'How are leads distributed?',
                a: 'We use a fair rotation system. When a lead comes in, our algorithm matches it to contractors based on location, specialization, and availability. The next eligible contractor in the rotation gets the lead. No favoritism, no bidding.',
              },
              {
                q: 'Can I choose which leads to accept?',
                a: "Yes! You receive a notification with full lead details. You can accept or decline based on your current capacity, the job type, or any other factor. Declining a lead doesn't affect your rotation position.",
              },
              {
                q: 'What if I exceed my monthly lead limit?',
                a: 'On Basic and Professional tiers, you can purchase additional leads at $15/lead. Enterprise tier has no limits. You can also upgrade your tier at any time to increase your monthly allocation.',
              },
              {
                q: 'How quickly do I get paid?',
                a: "NRPG doesn't handle payment for jobs. You invoice the client directly and keep 100% of your earnings. We only charge the monthly subscription fee for platform access.",
              },
              {
                q: 'What certifications do I need?',
                a: 'All contractors must have current IICRC certifications relevant to their specializations, $20M public liability insurance, $5M professional indemnity insurance, and a valid ABN/ACN.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700"
              >
                <h3 className="font-semibold text-xl text-white mb-3">
                  {faq.q}
                </h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="bg-gradient-to-br from-nrpg-primary/20 to-blue-500/20 border-2 border-nrpg-primary/50 rounded-3xl p-12 text-center">
            <h2 className="font-sans-modern font-bold text-4xl mb-6">
              Ready to Start Your Application?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Apply to join the NRPG contractor network. Application takes less than 10 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/join"
                className="inline-flex items-center justify-center px-8 py-4 bg-nrpg-primary hover:bg-nrpg-primary/90 text-gray-900 font-semibold rounded-lg transition-all text-lg"
              >
                Start Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-semibold rounded-lg transition-all text-lg">
                Talk to Sales
              </button>
            </div>

            <p className="text-sm text-gray-400 mt-6">
              No credit card required for application • Review takes 24-48 hours • Start receiving leads within 1 week
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
