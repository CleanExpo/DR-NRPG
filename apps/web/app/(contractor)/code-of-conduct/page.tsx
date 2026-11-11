'use client'

import React from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Users,
  Star,
  MessageSquare,
  Award,
  Shield,
  Ban,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

export default function CodeOfConductPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border-b border-blue-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-500/20 rounded-lg p-3">
              <BookOpen className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-50">
                Code of Conduct
              </h1>
              <p className="text-slate-400 mt-1">
                National Restoration Partners Guild (NRPG)
              </p>
            </div>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            This Code of Conduct establishes the professional standards, ethical obligations,
            and behavioural expectations for all contractors operating within the NRPG network.
            Adherence to this code is a condition of membership.
          </p>
          <p className="text-slate-500 text-sm mt-4">
            Last updated: 5 March 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert prose-slate max-w-none space-y-12">

            {/* 1. Professional Standards */}
            <div>
              <h2 className="text-2xl font-bold text-teal-400 mb-4 flex items-center gap-2">
                <Star className="h-6 w-6" />
                <span className="text-slate-500 text-lg font-mono">1.</span>
                Professional Standards
              </h2>
              <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6 space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  All NRPG contractors are expected to maintain the highest standards of
                  professionalism in all interactions and work performed through the Platform.
                  This includes:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Arriving on time and prepared for all scheduled appointments and jobs</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Presenting a clean, professional appearance with appropriate branded workwear when provided</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Treating all clients, property owners, and fellow contractors with courtesy and respect</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Providing honest, accurate assessments and quotations</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Maintaining a clean and safe work site at all times</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 2. Customer Service Requirements */}
            <div>
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <Users className="h-6 w-6" />
                <span className="text-slate-500 text-lg font-mono">2.</span>
                Customer Service Requirements
              </h2>
              <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6 space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  Exceptional customer service is at the core of the NRPG network. Contractors must:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Respond to all client enquiries and job assignments within the timeframes specified by the Platform</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Provide clear, empathetic communication to clients who are often experiencing distress due to property damage</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Keep clients informed of progress throughout the restoration process</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Address complaints promptly and professionally, escalating to the Platform where appropriate</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Maintain a minimum customer satisfaction rating as determined by the Platform</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 3. Quality of Work Standards */}
            <div>
              <h2 className="text-2xl font-bold text-teal-400 mb-4 flex items-center gap-2">
                <Award className="h-6 w-6" />
                <span className="text-slate-500 text-lg font-mono">3.</span>
                Quality of Work Standards
              </h2>
              <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6 space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  Contractors must deliver work that meets or exceeds industry standards:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>All restoration work must comply with AS-IICRC S500, S520, and S540 standards as applicable</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Use only approved equipment, materials, and methods for all restoration work</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Maintain thorough documentation including photographs, moisture readings, and progress reports</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Complete all work within agreed timeframes, communicating any delays promptly</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Rectify any defective work at no additional cost to the client</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 4. Communication Protocols */}
            <div>
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                <span className="text-slate-500 text-lg font-mono">4.</span>
                Communication Protocols
              </h2>
              <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6 space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  Effective communication is essential. Contractors must follow these protocols:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Use the Platform&apos;s messaging system for all job-related communication</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Respond to urgent communications within 1 hour during business hours</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Update job status in the Platform within 24 hours of any change</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Report any safety incidents, property damage, or client complaints immediately</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Use professional, respectful language in all written and verbal communication</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 5. IICRC Certification Maintenance */}
            <div>
              <h2 className="text-2xl font-bold text-teal-400 mb-4 flex items-center gap-2">
                <Award className="h-6 w-6" />
                <span className="text-slate-500 text-lg font-mono">5.</span>
                IICRC Certification Maintenance
              </h2>
              <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6 space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  Contractors must maintain valid IICRC certification throughout their membership:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Complete all required continuing education credits before certification expiry</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Upload updated certificates of completion to the Platform within 7 days of renewal</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Notify the Platform immediately if any certification is suspended or revoked</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Pursue additional certifications relevant to expanding service offerings</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 6. Insurance Maintenance */}
            <div>
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6" />
                <span className="text-slate-500 text-lg font-mono">6.</span>
                Insurance Maintenance
              </h2>
              <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6 space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  All contractors must maintain current insurance coverage as specified in the{' '}
                  <Link
                    href="/contractor-agreement"
                    className="text-blue-400 hover:text-blue-300 underline transition-colors"
                  >
                    Independent Contractor Agreement
                  </Link>
                  :
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Upload renewed certificates of currency at least 14 days before expiry</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Notify the Platform immediately of any changes to coverage, claims, or cancellations</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Maintain minimum $10M public liability insurance at all times</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Ensure all sub-contractors engaged hold equivalent insurance coverage</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 7. Non-Solicitation */}
            <div>
              <h2 className="text-2xl font-bold text-teal-400 mb-4 flex items-center gap-2">
                <Ban className="h-6 w-6" />
                <span className="text-slate-500 text-lg font-mono">7.</span>
                Non-Solicitation
              </h2>
              <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6 space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-200 text-sm leading-relaxed">
                    <strong>Important:</strong> All jobs sourced through the NRPG platform must be
                    completed through the Platform. Contractors must not solicit clients obtained
                    through the Platform for private work outside of the network.
                  </p>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Specifically, contractors must not:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Directly approach Platform clients to offer services outside the network</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Provide personal contact details to clients for the purpose of circumventing the Platform</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Encourage clients to cancel Platform jobs and engage the contractor directly</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Solicit other NRPG contractors to leave the network for competing platforms</span>
                  </li>
                </ul>
                <p className="text-slate-300 leading-relaxed">
                  This restriction applies during membership and for 12 months following termination,
                  in respect of clients first introduced through the Platform.
                </p>
              </div>
            </div>

            {/* 8. NRPG Brand Representation */}
            <div>
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <span className="text-slate-500 text-lg font-mono">8.</span>
                NRPG Brand Representation
              </h2>
              <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6 space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  When representing the NRPG brand, contractors must:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Use NRPG branding materials only as authorised by the Platform</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Not make statements or claims on behalf of NRPG without prior approval</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Represent the network positively in all public and social media interactions</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Cease all use of NRPG branding immediately upon termination of membership</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 9. Disciplinary Procedures */}
            <div>
              <h2 className="text-2xl font-bold text-teal-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                <span className="text-slate-500 text-lg font-mono">9.</span>
                Disciplinary Procedures
              </h2>
              <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6 space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  Breaches of this Code of Conduct will be addressed through the following
                  progressive disciplinary process:
                </p>
                <div className="space-y-4">
                  <div className="bg-blue-950/40 border border-blue-900/30 rounded-lg p-4">
                    <p className="text-blue-400 font-semibold mb-1">Level 1 &mdash; Written Warning</p>
                    <p className="text-slate-300 text-sm">
                      For minor breaches or first-time infractions. The contractor will receive a
                      formal written warning outlining the breach and required corrective action.
                    </p>
                  </div>
                  <div className="bg-blue-950/40 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-amber-400 font-semibold mb-1">Level 2 &mdash; Temporary Suspension</p>
                    <p className="text-slate-300 text-sm">
                      For repeated breaches or moderate infractions. The contractor&apos;s profile will
                      be suspended for a specified period, during which they cannot accept new jobs.
                    </p>
                  </div>
                  <div className="bg-blue-950/40 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400 font-semibold mb-1">Level 3 &mdash; Termination</p>
                    <p className="text-slate-300 text-sm">
                      For serious breaches, repeated infractions after prior warnings, or conduct
                      that brings the NRPG network into disrepute. Termination may be immediate
                      in cases of fraud, safety violations, or criminal conduct.
                    </p>
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Contractors have the right to appeal disciplinary decisions through the
                  Platform&apos;s dispute resolution process as outlined in the{' '}
                  <Link
                    href="/contractor-agreement"
                    className="text-teal-400 hover:text-teal-300 underline transition-colors"
                  >
                    Independent Contractor Agreement
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Entity Notice */}
            <div className="border-t border-blue-900/30 pt-8 mt-12">
              <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6 text-center">
                <p className="text-slate-400 text-sm">
                  National Restoration Partners Guild (NRPG) | ABN: 85 151 794 142
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  A division of Disaster Recovery Pty Ltd
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
