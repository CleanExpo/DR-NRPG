'use client';

/**
 * NRPG Contractor Acquisition Funnel - Page 1: Awareness
 *
 * Path: /contractors
 * Purpose: Build trust and showcase value proposition
 * Next: /how-it-works
 */

import React from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import {
  Hero,
  IICRCBadgeGroup,
} from '@/design-system';
import {
  Shield,
  DollarSign,
  Users,
  Target,
  CheckCircle,
  ArrowRight,
  Zap,
  Award,
} from 'lucide-react';

export default function ContractorsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      <main>
        {/* Hero Section */}
        <Hero
          variant="centered"
          badge={{
            text: 'Join the NRPG Restoration Contractor Network',
            icon: <Award className="h-4 w-4" />,
          }}
          title="Scale Your Restoration Business with"
          titleHighlight="Pre-Qualified Leads"
          description="Access verified, insured leads through our fair rotation system. No favoritism, no hidden fees. Just quality leads that help you grow your business."
          primaryCTA={{
            text: 'See How It Works',
            href: '/how-it-works',
          }}
          secondaryCTA={{
            text: 'Watch Platform Demo',
          }}
          className="pt-32 pb-20"
        />

        {/* Value Propositions */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="font-sans-modern font-bold text-4xl text-center mb-4">
            Why Join <span className="text-nrpg-primary">NRPG</span>?
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
            We're not just another lead marketplace. We're a complete business growth platform built specifically for restoration contractors.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pre-Qualified Leads */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700 hover:border-nrpg-primary/50 transition-all">
              <div className="w-16 h-16 bg-nrpg-primary/20 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-nrpg-primary" />
              </div>
              <h3 className="font-sans-modern font-semibold text-2xl mb-4">
                Pre-Qualified Leads
              </h3>
              <p className="text-gray-400 mb-6">
                Every lead is contact-verified, insurance-validated, and geo-matched to your service area. No tire kickers.
              </p>
              <ul className="space-y-3">
                {[
                  'Contact information verified',
                  'Insurance status validated',
                  'Location within your service area',
                  'Urgency level assessed',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fair Rotation System */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700 hover:border-nrpg-primary/50 transition-all">
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-sans-modern font-semibold text-2xl mb-4">
                Fair Rotation System
              </h3>
              <p className="text-gray-400 mb-6">
                No favoritism. No bidding wars. Every contractor gets equal opportunity through our automated rotation algorithm.
              </p>
              <ul className="space-y-3">
                {[
                  'Equal opportunity for all contractors',
                  'Automated, unbiased distribution',
                  'Skill-matched assignments',
                  'Transparent dispatch history',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Transparent Pricing */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700 hover:border-nrpg-primary/50 transition-all">
              <div className="w-16 h-16 bg-nrpg-secondary/20 rounded-xl flex items-center justify-center mb-6">
                <DollarSign className="h-8 w-8 text-nrpg-secondary" />
              </div>
              <h3 className="font-sans-modern font-semibold text-2xl mb-4">
                Transparent Pricing
              </h3>
              <p className="text-gray-400 mb-6">
                Simple flat fee per claim. No monthly fees, no commission cuts. Keep 100% of your additional work.
              </p>
              <ul className="space-y-3">
                {[
                  '$550 flat fee per claim',
                  'No monthly subscription fees',
                  'No commission on any work',
                  'Keep 100% of additional restoration work',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Trust Signals - IICRC Certifications */}
        <section className="bg-gray-800/30 py-20">
          <div className="container mx-auto px-6">
            <h2 className="font-sans-modern font-bold text-4xl text-center mb-4">
              Join Certified Professionals
            </h2>
            <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
              Every NRPG contractor independently holds AS-IICRC S500 certification, their own trade licences, and their own business insurance — a standard enforced through a proprietary onboarding process found nowhere else in Australia or New Zealand.
            </p>

            <div className="max-w-4xl mx-auto">
              <IICRCBadgeGroup
                codes={['S500', 'S520', 'WRT', 'FSRT', 'ASD', 'AMRT']}
                className="justify-center"
              />

              <div className="mt-12 grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <Shield className="h-12 w-12 text-nrpg-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Independently Insured</h3>
                  <p className="text-gray-400 text-sm">
                    Each contractor holds their own public liability and professional indemnity insurance — not pooled, not shared
                  </p>
                </div>
                <div className="text-center">
                  <Award className="h-12 w-12 text-nrpg-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">IICRC Certified</h3>
                  <p className="text-gray-400 text-sm">
                    Each contractor holds their own AS-IICRC S500 certification — independently earned and maintained
                  </p>
                </div>
                <div className="text-center">
                  <Zap className="h-12 w-12 text-nrpg-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Background Checked</h3>
                  <p className="text-gray-400 text-sm">
                    Clean criminal background verification for all technicians
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="bg-gradient-to-br from-nrpg-primary/20 to-blue-500/20 border-2 border-nrpg-primary/50 rounded-3xl p-12 text-center">
            <h2 className="font-sans-modern font-bold text-4xl mb-6">
              Ready to See How It Works?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover how NRPG's platform works, see our pricing tiers, and calculate your potential ROI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 bg-nrpg-primary hover:bg-nrpg-primary/90 text-gray-900 font-semibold rounded-lg transition-all text-lg"
              >
                See How It Works
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-semibold rounded-lg transition-all text-lg">
                Schedule a Demo Call
              </button>
            </div>

            <p className="text-sm text-gray-400 mt-6">
              No credit card required • See pricing and ROI calculator
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
