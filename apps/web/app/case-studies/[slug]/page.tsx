/**
 * Case Study Detail Page
 *
 * Displays comprehensive information about individual restoration projects:
 * - Before/after photos
 * - Damage assessment details
 * - Restoration timeline
 * - Cost breakdown
 * - Customer testimonial
 * - Insurance claim outcome
 * - Lessons learned
 *
 * Critical for:
 * - E.E.A.T signals (experience demonstrated through real work)
 * - Trust building for research users (20%)
 * - SEO rankings for service+location combinations
 */

import { Metadata } from 'next';
import { Star, MapPin, Clock, DollarSign, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Case Study | Real Restoration Project | NRPG',
  description: 'Detailed case study of a real restoration project completed by NRPG contractors, including before/after photos, timeline, cost, and customer testimonial.',
};

interface CaseStudyDetail {
  id: string;
  title: string;
  location: string;
  state: string;
  serviceType: string;
  responseTime: string;
  cost: string;
  daysToRestore: number;
  customerName: string;
  customerInitial: string;
  customerLocation: string;
  customerRating: number;
  customerQuote: string;
  damageSummary: string;
  damageDetails: string[];
  restorationProcess: Array<{
    day: number;
    title: string;
    description: string;
  }>;
  costBreakdown: Array<{
    item: string;
    cost: number;
  }>;
  insuranceOutcome: string;
  lessonsLearned: string[];
  beforePhotos: string[];
  afterPhotos: string[];
  iicrcStandards: string[];
  slug: string;
  published: string;
  contractorName: string;
}

// Sample case study - in production, fetch from database
const SAMPLE_CASE_STUDY: CaseStudyDetail = {
  id: '1',
  title: 'Kitchen Fire Restoration - Family Home Back in 5 Days',
  location: 'Hawthorn',
  state: 'VIC',
  serviceType: 'Fire & Smoke',
  responseTime: '38 minutes',
  cost: '$18,500',
  daysToRestore: 5,
  customerName: 'Sarah M.',
  customerInitial: 'S.M.',
  customerLocation: 'Hawthorn, VIC',
  customerRating: 5,
  customerQuote:
    'The NRPG contractor arrived so quickly and took complete control of the situation. They explained everything, provided detailed documentation for our insurance, and the restoration was professional throughout. Our home is exactly as it was before the fire.',
  damageSummary:
    'Kitchen fire caused extensive smoke and heat damage throughout the home, affecting walls, ceilings, flooring, and personal contents.',
  damageDetails: [
    'Kitchen cabinets: 90% damaged',
    'Ceiling drywall: Complete replacement needed',
    'Flooring: Smoke damage and warping',
    'Personal belongings: Smoke odour remediation',
    'HVAC system: Complete cleaning required',
  ],
  restorationProcess: [
    {
      day: 1,
      title: 'Emergency Response & Assessment',
      description:
        'NRPG contractor arrived 38 minutes after emergency call. Completed structural assessment, identified damage extent, and began emergency make-safe work including boarding and securing the property.',
    },
    {
      day: 2,
      title: 'Extraction & Documentation',
      description:
        'Professional smoke extraction, water damage mitigation from firefighting, and comprehensive photo/video documentation for insurance claim.',
    },
    {
      day: 3,
      title: 'Structural Restoration Begins',
      description:
        'Drywall replacement, kitchen cabinet removal, flooring preparation. Coordination with specialist contractors (electricians, plumbers).',
    },
    {
      day: 4,
      title: 'Finishing & Deodorization',
      description:
        'Painting, flooring installation, HVAC system cleaning and testing. Professional deodorization to eliminate smoke odour.',
    },
    {
      day: 5,
      title: 'Final Inspection & Handover',
      description:
        'Comprehensive final inspection, customer walkthrough, and insurance inspector sign-off. All work completed to pre-loss condition.',
    },
  ],
  costBreakdown: [
    { item: 'NRPG Emergency Dispatch & Assessment', cost: 2750 },
    { item: 'Drywall & Structural Repair', cost: 6200 },
    { item: 'Painting & Finishing', cost: 3100 },
    { item: 'Flooring Restoration', cost: 4000 },
    { item: 'HVAC Cleaning & Deodorization', cost: 2450 },
  ],
  insuranceOutcome: 'Claim approved in full. Insurance company praised the documentation quality and compliance. Zero disputes.',
  lessonsLearned: [
    'Rapid response critical: Every hour counts in fire damage to prevent secondary damage',
    'Documentation crucial: Professional photo/video helps insurance approval dramatically',
    'Industry standards ensure quality: Following established protocols guarantees customer satisfaction',
    'Specialist coordination: Working with licensed tradespeople prevents future issues',
  ],
  beforePhotos: ['/images/case-studies/fire-before-1.jpg', '/images/case-studies/fire-before-2.jpg'],
  afterPhotos: ['/images/case-studies/fire-after-1.jpg', '/images/case-studies/fire-after-2.jpg'],
  iicrcStandards: ['Recognised industry standards for water damage restoration', 'Fire and smoke restoration'],
  slug: 'hawthorn-kitchen-fire-restoration',
  published: '2025-11-15',
  contractorName: 'Michael Chen, NRPG Certified Contractor',
};

async function getCaseStudy(slug: string): Promise<CaseStudyDetail | null> {
  // In production, fetch from database by slug
  if (slug === SAMPLE_CASE_STUDY.slug) {
    return SAMPLE_CASE_STUDY;
  }
  return null;
}

export default async function CaseStudyPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const caseStudy = await getCaseStudy(params.slug);

  if (!caseStudy) {
    notFound();
  }

  const totalCost = caseStudy.costBreakdown.reduce((sum, item) => sum + item.cost, 0);

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="mb-4">
            <Link href="/case-studies" className="flex items-center gap-2 text-blue-100 hover:text-white">
              ← Back to Case Studies
            </Link>
          </div>

          <h1 className="text-3xl md:text-4xl font-black mb-4">{caseStudy.title}</h1>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">Location</p>
              <p className="font-bold">{caseStudy.location}, {caseStudy.state}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Response Time</p>
              <p className="font-bold">{caseStudy.responseTime}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Restoration Time</p>
              <p className="font-bold">{caseStudy.daysToRestore} days</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Cost</p>
              <p className="font-bold">{caseStudy.cost}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Gallery */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Before & After</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-slate-900 mb-3">Before Restoration</h3>
            <div className="bg-slate-200 aspect-video rounded-2xl flex items-center justify-center text-slate-600">
              [Before Photo]
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-3">After Restoration</h3>
            <div className="bg-slate-200 aspect-video rounded-2xl flex items-center justify-center text-slate-600">
              [After Photo]
            </div>
          </div>
        </div>
      </section>

      {/* Damage Assessment */}
      <section className="bg-red-50 border-t border-b border-red-200 py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <h2 className="text-2xl font-bold text-red-900 mb-6">Damage Assessment</h2>

          <p className="text-red-800 text-lg mb-6">{caseStudy.damageSummary}</p>

          <div className="bg-white rounded-2xl p-8 border-2 border-red-200">
            <h3 className="font-bold text-slate-900 mb-4">Damage Details</h3>
            <ul className="space-y-3">
              {caseStudy.damageDetails.map((detail, idx) => (
                <li key={idx} className="flex gap-3 text-slate-700">
                  <span className="flex-shrink-0 font-bold text-red-600">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Restoration Timeline */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">5-Day Restoration Timeline</h2>

        <div className="space-y-6">
          {caseStudy.restorationProcess.map((step, idx) => (
            <div key={idx} className="flex gap-6 md:gap-8">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-black">
                  {step.day}
                </div>
              </div>
              <div className="flex-1 pb-6 border-l-2 border-slate-200 pl-6 md:pl-8">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-700">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cost Breakdown */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Cost Breakdown</h2>

          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Service</th>
                    <th className="px-6 py-4 text-right font-bold">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {caseStudy.costBreakdown.map((item, idx) => (
                    <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-900">{item.item}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        ${item.cost.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-blue-600 text-white font-bold">
                    <td className="px-6 py-4">Total Project Cost</td>
                    <td className="px-6 py-4 text-right">${totalCost.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Insurance Note */}
            <div className="bg-green-50 border-t-2 border-green-200 px-6 py-4">
              <div className="flex gap-3 text-green-900">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-bold">Insurance Outcome</p>
                  <p className="text-sm">{caseStudy.insuranceOutcome}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonial */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Customer Testimonial</h2>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 md:p-12 border-l-4 border-blue-600">
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>

          <blockquote className="text-xl text-slate-900 mb-6 italic">
            "{caseStudy.customerQuote}"
          </blockquote>

          <div>
            <p className="font-bold text-slate-900">{caseStudy.customerName}</p>
            <p className="text-sm text-slate-700">{caseStudy.customerLocation}</p>
          </div>
        </div>
      </section>

      {/* Lessons Learned */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Key Takeaways</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {caseStudy.lessonsLearned.map((lesson, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border-l-4 border-blue-600">
                <p className="text-slate-900 font-medium">{lesson}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Standards */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Industry Standards Applied</h2>

        <div className="space-y-3">
          {caseStudy.iicrcStandards.map((standard, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">{standard}</p>
                <p className="text-sm text-slate-600">
                  Professional standards ensuring consistent quality across all NRPG contractors
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl font-bold mb-6">Need Similar Help?</h2>
          <p className="text-xl text-blue-100 mb-8">
            NRPG provides the same professional, qualified restoration across Australia.
          </p>
          <button className="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
            Request Emergency Service →
          </button>
        </div>
      </section>

      {/* Related Case Studies */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">More Case Studies</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Related case studies would be shown here */}
          <Link
            href="/case-studies"
            className="flex items-center justify-between p-6 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors group"
          >
            <div>
              <p className="font-bold text-slate-900 group-hover:text-blue-600">View All Case Studies</p>
              <p className="text-sm text-slate-600">Browse our complete project portfolio</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
          </Link>
        </div>
      </section>
    </main>
  );
}
