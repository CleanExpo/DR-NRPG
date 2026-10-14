/**
 * Contractor Terms & Conditions — NRPG Network
 *
 * Governs the relationship between Disaster Recovery Pty Ltd
 * and independent contractors admitted to the NRPG network.
 *
 * ACL s18 compliant. No unverified statistics.
 * Reflects independent contractor model — not employment.
 */

import Header from "@/components/header"
import Footer from "@/components/footer"
import {
  FileText, Shield, CheckCircle, AlertTriangle, Scale,
  Globe, Gavel, RefreshCw, HardHat, CreditCard, Lock, Users
} from "lucide-react"
import Link from "next/link"
import { schemaGenerator } from "@/lib/seo/schema-generator"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contractor Terms & Conditions | NRPG Network — Disaster Recovery Australia',
  description: 'Terms and Conditions governing NRPG network membership for independent restoration contractors in Australia and New Zealand. IICRC-certified contractors holding their own ABN/NZBN, licences, and insurances.',
  alternates: {
    canonical: 'https://nrpg.business/contractor-terms',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ContractorTermsPage() {
  const faqSchema = schemaGenerator.generateFAQSchema([
    {
      question: 'Are NRPG contractors employees of Disaster Recovery Pty Ltd?',
      answer: 'No. All contractors in the NRPG network are independent businesses. They hold their own ABN or NZBN, trade licences, IICRC certifications, and business insurances. Disaster Recovery Pty Ltd is a platform facilitator only.',
    },
    {
      question: 'What insurance must NRPG contractors hold?',
      answer: 'Each contractor must independently hold current public liability insurance (minimum $20 million AUD / $10 million NZD), professional indemnity insurance, and any trade-specific insurances required under state, territory, or NZ law. Proof must be provided at onboarding and maintained throughout network membership.',
    },
    {
      question: 'What IICRC certifications are required to join the NRPG network?',
      answer: 'Contractors must hold current IICRC certification relevant to their service offering — for example, WRT (Water Restoration Technician), FSRT (Fire and Smoke Restoration Technician), or AMRT (Applied Microbial Remediation Technician). Certifications must be individually held, not just company-level.',
    },
  ])

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Header />
      <main className="py-24">
        <div className="container mx-auto px-6 max-w-6xl">

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-poppins font-bold text-4xl md:text-5xl text-balance mb-8">
              Contractor <span className="gradient-text-teal-purple">Terms & Conditions</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-4">
              Terms governing NRPG network membership for independent restoration contractors
              across Australia and New Zealand.
            </p>
            <p className="text-[#9CA3AF]">Last updated: 6 April 2026</p>
          </div>

          {/* Entity Notice */}
          <div className="mb-12">
            <div className="bg-[#00BFA6]/10 rounded-2xl p-6 border border-[#00BFA6]/30">
              <div className="flex items-start">
                <Gavel className="h-6 w-6 text-[#00BFA6] mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-poppins font-semibold text-lg text-white mb-2">Legal Entity Notice</h3>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">
                    These Contractor Terms &amp; Conditions (&quot;Contractor Terms&quot;) are entered into between
                    the contractor entity named in the onboarding application (&quot;Contractor&quot;, &quot;you&quot;, &quot;your&quot;)
                    and <strong className="text-white">Disaster Recovery Pty Ltd</strong> (ABN: 85 151 794 142),
                    trading as <strong className="text-white">&quot;NRPG&quot;</strong> (National Restoration Partners Guild),
                    &quot;Disaster Recovery&quot;, and &quot;Restore Assist&quot; (collectively, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
                    Registered address: Brisbane, Queensland, Australia.
                    These Contractor Terms are binding upon acceptance of a network membership application
                    and govern your ongoing participation in the NRPG contractor network.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Independent Contractor Status */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <HardHat className="h-8 w-8 text-[#00BFA6] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">1. Independent Contractor Status</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Not an Employment Relationship</h3>
                  <div className="bg-[#FF9800]/10 rounded-lg p-4 border border-[#FF9800]/30 mb-4">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-5 w-5 text-[#FF9800] mr-2" />
                      <span className="text-white font-medium">Important</span>
                    </div>
                    <p className="text-[#9CA3AF] text-sm leading-relaxed">
                      These Contractor Terms do not create an employment, agency, partnership, joint venture,
                      or franchise relationship between you and Disaster Recovery Pty Ltd. You are an
                      independent contractor operating your own business entity.
                    </p>
                  </div>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">
                    This arrangement is consistent with the independent contractor provisions of the
                    <strong className="text-white"> Fair Work Act 2009 (Cth)</strong> and the
                    <strong className="text-white"> Independent Contractors Act 2006 (Cth)</strong> for Australian contractors,
                    and the <strong className="text-white">Employment Relations Act 2000 (NZ)</strong> for New Zealand contractors.
                    The platform facilitates referrals only — it does not direct or control how you perform restoration work.
                  </p>
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Your Responsibilities as an Independent Business</h3>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    {[
                      'Operate under your own registered ABN (Australia) or NZBN (New Zealand)',
                      'Lodge your own tax returns and pay your own income tax and GST/GST (NZ)',
                      'Hold and maintain your own business insurances',
                      'Hold and maintain your own trade licences and IICRC certifications',
                      'Engage and pay your own employees or subcontractors',
                      'Comply with all applicable workplace health and safety laws',
                      'Comply with all state, territory, and NZ licensing laws relevant to your services',
                    ].map((item) => (
                      <li key={item} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-[#00BFA6] mr-2 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Eligibility & Vetting Requirements */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Shield className="h-8 w-8 text-[#2196F3] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">2. Eligibility & Vetting Requirements</h2>
              </div>
              <p className="text-[#9CA3AF] mb-6 leading-relaxed">
                The NRPG network operates a proprietary onboarding and vetting standard with no equivalent
                currently operating in Australia or New Zealand. All of the following must be met and maintained
                throughout your network membership.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-[#0F1115] rounded-xl p-6 border border-[#374151]">
                  <div className="bg-[#00BFA6]/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <HardHat className="h-6 w-6 text-[#00BFA6]" />
                  </div>
                  <h3 className="font-semibold text-white mb-3">IICRC Certification</h3>
                  <ul className="space-y-2 text-[#9CA3AF] text-xs leading-relaxed">
                    <li>&#8226; Current individual IICRC certification for each service category offered</li>
                    <li>&#8226; Water: WRT — Water Restoration Technician</li>
                    <li>&#8226; Fire/Smoke: FSRT — Fire &amp; Smoke Restoration Technician</li>
                    <li>&#8226; Mould: AMRT — Applied Microbial Remediation Technician</li>
                    <li>&#8226; Certification must be current and in the individual&apos;s name</li>
                    <li>&#8226; Annual renewal evidence required</li>
                  </ul>
                </div>
                <div className="bg-[#0F1115] rounded-xl p-6 border border-[#374151]">
                  <div className="bg-[#2196F3]/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-[#2196F3]" />
                  </div>
                  <h3 className="font-semibold text-white mb-3">Licences & Registration</h3>
                  <ul className="space-y-2 text-[#9CA3AF] text-xs leading-relaxed">
                    <li>&#8226; Active ABN (Australia) or NZBN (New Zealand) in your entity name</li>
                    <li>&#8226; All state/territory/NZ trade licences required for your service types</li>
                    <li>&#8226; Compliance with the Building Act in each jurisdiction you operate</li>
                    <li>&#8226; Current police clearance (not older than 12 months at onboarding)</li>
                    <li>&#8226; GST registration where applicable (AU: if turnover exceeds $75,000 AUD)</li>
                  </ul>
                </div>
                <div className="bg-[#0F1115] rounded-xl p-6 border border-[#374151]">
                  <div className="bg-[#7C4DFF]/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-[#7C4DFF]" />
                  </div>
                  <h3 className="font-semibold text-white mb-3">Insurance (Minimum Required)</h3>
                  <ul className="space-y-2 text-[#9CA3AF] text-xs leading-relaxed">
                    <li>&#8226; Public liability: minimum $20M AUD / $10M NZD per occurrence</li>
                    <li>&#8226; Professional indemnity: minimum $2M AUD / $1M NZD per claim</li>
                    <li>&#8226; Workers&apos; compensation (if you employ staff) under applicable state/NZ law</li>
                    <li>&#8226; Tool and equipment insurance (recommended)</li>
                    <li>&#8226; Current certificates of currency required at onboarding and renewal</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Work Standards & Documentation */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <FileText className="h-8 w-8 text-[#00BFA6] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">3. Work Standards & Documentation</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">IICRC Standard Compliance</h3>
                  <p className="text-[#9CA3AF] mb-4 text-sm leading-relaxed">
                    All restoration work performed through NRPG referrals must be carried out in accordance
                    with the applicable current IICRC standards, including but not limited to:
                  </p>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    {[
                      'AS/NZS IICRC S500 — Standard for Professional Water Damage Restoration',
                      'AS/NZS IICRC S520 — Standard for Professional Mould Remediation',
                      'IICRC S770 — Standard for Professional Fire and Smoke Damage Restoration',
                      'IICRC S100 — Standard for Professional Biohazard Remediation (where applicable)',
                    ].map((std) => (
                      <li key={std} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-[#00BFA6] mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-xs">{std}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Required Documentation</h3>
                  <p className="text-[#9CA3AF] mb-4 text-sm leading-relaxed">
                    For each job completed through an NRPG referral, you must produce and submit to the platform:
                  </p>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    {[
                      'Written scope of works prior to commencing restoration',
                      'Photographic evidence of damage (pre-work, during, and post-work)',
                      'Moisture readings and drying logs (water/mould jobs)',
                      'Itemised invoice on your letterhead under your own ABN/NZBN',
                      'Certificate of completion or make-safe declaration',
                      'IICRC-standard job completion report for client insurance submission',
                    ].map((doc) => (
                      <li key={doc} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-[#00BFA6] mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-xs">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Platform & Payment */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <CreditCard className="h-8 w-8 text-[#00BFA6] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">4. Platform Referrals & Payment</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">How Referrals Work</h3>
                  <div className="space-y-3">
                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <p className="text-white font-medium mb-1 text-sm">Client Engagement Fee</p>
                      <p className="text-[#9CA3AF] text-xs leading-relaxed">
                        Clients pay an engagement fee of $2,750 AUD (incl. GST) to Disaster Recovery Pty Ltd
                        prior to contractor dispatch. This fee is separate from your restoration charges.
                      </p>
                    </div>
                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <p className="text-white font-medium mb-1 text-sm">Your Invoicing</p>
                      <p className="text-[#9CA3AF] text-xs leading-relaxed">
                        You invoice the client directly for all restoration costs under your own ABN or NZBN.
                        Your invoice is separate from and in addition to the platform engagement fee.
                        You are responsible for collecting payment from the client.
                      </p>
                    </div>
                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <p className="text-white font-medium mb-1 text-sm">GST</p>
                      <p className="text-[#9CA3AF] text-xs leading-relaxed">
                        You are responsible for applying GST to your invoices where you are registered for
                        GST (AU) or hold GST registration (NZ), and for remitting GST to the ATO or Inland Revenue.
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Pricing & Estimates</h3>
                  <p className="text-[#9CA3AF] mb-4 text-sm leading-relaxed">
                    You are responsible for providing accurate written estimates to clients prior to commencing
                    work. Estimates must reflect the actual scope of works. You must not commence works
                    materially beyond the agreed scope without a written variation approved by the client.
                  </p>
                  <div className="bg-[#FF9800]/10 rounded-lg p-4 border border-[#FF9800]/30">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-5 w-5 text-[#FF9800] mr-2" />
                      <span className="text-white font-medium text-sm">No Insurance Claim Advocacy</span>
                    </div>
                    <p className="text-[#9CA3AF] text-xs leading-relaxed">
                      You must not represent to clients that you will &quot;work with their insurer&quot;,
                      &quot;manage their claim&quot;, or &quot;bill their insurance directly&quot;. Your role is to perform
                      restoration work and produce IICRC-standard documentation. The client submits
                      documentation to their insurer independently.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Conduct & Prohibited Activities */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Scale className="h-8 w-8 text-[#FF4444] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">5. Conduct & Prohibited Activities</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">You Must Not</h3>
                  <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                    <ul className="space-y-2 text-[#9CA3AF] text-sm">
                      {[
                        'Circumvent the platform to directly acquire clients introduced through NRPG',
                        'Misrepresent your IICRC certifications, licences, or insurance coverage',
                        'Subcontract NRPG jobs to uncertified or unlicensed parties without disclosure',
                        'Solicit or accept payment outside the agreed scope without client written approval',
                        'Make false or misleading representations to clients about insurance outcomes',
                        'Use the NRPG name, logo, or branding without written authorisation',
                        'Share client personal information beyond what is necessary to perform the job',
                        'Perform work while under suspension or following termination from the network',
                        'Engage in conduct that brings the NRPG network into disrepute',
                      ].map((item) => (
                        <li key={item} className="flex items-start">
                          <span className="text-[#FF4444] mr-2 flex-shrink-0 text-sm">✕</span>
                          <span className="text-xs">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">WHS & Safety Obligations</h3>
                  <p className="text-[#9CA3AF] mb-4 text-sm leading-relaxed">
                    You are responsible for your own workplace health and safety compliance. This includes:
                  </p>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    {[
                      'Compliance with Work Health and Safety Act 2011 (Cth) and applicable state/territory WHS legislation',
                      'For NZ contractors: Health and Safety at Work Act 2015 (NZ)',
                      'Safe work method statements (SWMS) for high-risk construction work',
                      'Appropriate PPE for all site personnel',
                      'Incident reporting obligations under applicable WHS laws',
                    ].map((item) => (
                      <li key={item} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-[#00BFA6] mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-xs">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Confidentiality & Data */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Lock className="h-8 w-8 text-[#7C4DFF] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">6. Confidentiality & Privacy</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Client Data</h3>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed mb-4">
                    You will have access to personal information about clients (including property address,
                    contact details, and damage information) only for the purpose of performing the
                    referred restoration job. You must:
                  </p>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    {[
                      'Handle client personal information in accordance with the Privacy Act 1988 (Cth) and APPs (AU) or the Privacy Act 2020 (NZ)',
                      'Not retain client personal information beyond what is necessary for the job and any applicable legal retention periods',
                      'Not use client information for any purpose other than performing the referred job',
                      'Not disclose client information to third parties without client consent',
                    ].map((item) => (
                      <li key={item} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-[#00BFA6] mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-xs">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Platform Confidentiality</h3>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">
                    You must keep confidential the NRPG onboarding process, vetting criteria, platform
                    pricing structures, and any proprietary systems disclosed to you during onboarding
                    or network participation. This obligation survives termination of your network membership.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Intellectual Property */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Globe className="h-8 w-8 text-[#2196F3] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">7. Intellectual Property & Branding</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Permitted Use</h3>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed mb-4">
                    While you are an active member of the NRPG network in good standing, we grant you a
                    limited, non-exclusive, non-transferable licence to display the NRPG network member
                    badge on your vehicle, workwear, and marketing materials for the sole purpose of
                    identifying yourself as an NRPG-verified contractor.
                  </p>
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Restrictions</h3>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    {[
                      'You may not use NRPG branding to imply you are an employee or agent of Disaster Recovery Pty Ltd',
                      'All brand usage rights terminate immediately upon suspension or exit from the network',
                      'You may not register domain names, social media handles, or business names incorporating "NRPG" without written consent',
                    ].map((item) => (
                      <li key={item} className="flex items-start">
                        <span className="text-[#FF4444] mr-2 flex-shrink-0 text-sm">✕</span>
                        <span className="text-xs">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Section 8: Suspension & Removal */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <AlertTriangle className="h-8 w-8 text-[#FF9800] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">8. Suspension & Removal</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Grounds for Suspension</h3>
                  <p className="text-[#9CA3AF] mb-4 text-sm leading-relaxed">
                    We may suspend your access to the NRPG platform pending investigation of:
                  </p>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    {[
                      'A client complaint involving safety concerns or serious misconduct',
                      'Lapse or cancellation of required insurance or IICRC certification',
                      'Suspension or cancellation of a required trade licence',
                      'Alleged breach of these Contractor Terms',
                      'Ongoing or unresolved regulatory action against your business',
                    ].map((item) => (
                      <li key={item} className="flex items-start">
                        <span className="text-[#FF9800] mr-2 flex-shrink-0">&#8226;</span>
                        <span className="text-xs">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Grounds for Termination</h3>
                  <p className="text-[#9CA3AF] mb-4 text-sm leading-relaxed">
                    We may terminate your network membership immediately (without notice) for:
                  </p>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    {[
                      'Fraudulent misrepresentation of certifications, licences, or insurance',
                      'Serious client safety incident or injury attributable to your work',
                      'Criminal conviction relevant to your work or client interactions',
                      'Persistent or wilful failure to meet IICRC documentation standards',
                      'Breach of confidentiality obligations',
                    ].map((item) => (
                      <li key={item} className="flex items-start">
                        <span className="text-[#FF4444] mr-2 flex-shrink-0 text-sm">✕</span>
                        <span className="text-xs">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[#9CA3AF] text-xs mt-4 leading-relaxed">
                    You may also voluntarily exit the network at any time by submitting written notice
                    via the platform. Any outstanding jobs in progress must be completed or formally
                    handed over prior to exit.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 9: Limitation of Liability */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Scale className="h-8 w-8 text-[#7C4DFF] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">9. Limitation of Liability</h2>
              </div>
              <div className="space-y-4 text-[#9CA3AF] text-sm leading-relaxed">
                <p>
                  To the maximum extent permitted by law, Disaster Recovery Pty Ltd&apos;s total aggregate
                  liability to you arising out of or in connection with these Contractor Terms shall not
                  exceed the total platform fees (if any) paid by you in the twelve (12) months preceding
                  the event giving rise to the claim.
                </p>
                <p>
                  We are not liable for: loss of referrals or business opportunity; the conduct, solvency,
                  or payment capacity of clients introduced through the platform; your inability to collect
                  payment from clients; or any indirect, consequential, or incidental loss.
                </p>
                <p>
                  Nothing in these Contractor Terms excludes any right or remedy you may have under the
                  Australian Consumer Law (Schedule 2 of the Competition and Consumer Act 2010 (Cth)) or
                  the New Zealand Consumer Guarantees Act 1993 that cannot be excluded by agreement.
                </p>
              </div>
            </div>
          </div>

          {/* Section 10: Dispute Resolution & Governing Law */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Gavel className="h-8 w-8 text-[#FF9800] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">10. Dispute Resolution & Governing Law</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {[
                  { step: '01', title: 'Internal Resolution', description: 'Submit a dispute via the platform contact form. We aim to acknowledge within 2 business days and resolve within 21 business days.' },
                  { step: '02', title: 'Mediation', description: 'If unresolved, either party may refer the dispute to a mutually agreed mediator. Costs shared equally unless otherwise agreed.' },
                  { step: '03', title: 'Courts', description: 'As a last resort, disputes may be referred to the courts of Queensland, Australia. NZ contractors may also refer to the Disputes Tribunal of New Zealand for eligible matters.' },
                ].map((item) => (
                  <div key={item.step} className="bg-[#0F1115] rounded-lg p-6 border border-[#374151] text-center">
                    <div className="bg-[#00BFA6]/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <span className="text-[#00BFA6] font-bold">{item.step}</span>
                    </div>
                    <h4 className="font-semibold text-white mb-2 text-sm">{item.title}</h4>
                    <p className="text-[#9CA3AF] text-xs">{item.description}</p>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                  <h4 className="font-semibold text-white mb-2 text-sm">Governing Law — Australia</h4>
                  <p className="text-[#9CA3AF] text-xs leading-relaxed">
                    These Contractor Terms are governed by the laws of Queensland, Australia. Australian
                    contractors submit to the exclusive jurisdiction of the courts of Queensland and the
                    Federal Court of Australia.
                  </p>
                </div>
                <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                  <h4 className="font-semibold text-white mb-2 text-sm">Governing Law — New Zealand</h4>
                  <p className="text-[#9CA3AF] text-xs leading-relaxed">
                    For NZ contractors, these Contractor Terms are also subject to the Employment Relations
                    Act 2000 (NZ) (independent contractor provisions), the Fair Trading Act 1986 (NZ), and
                    the Contract and Commercial Law Act 2017 (NZ) to the extent they apply.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 11: General */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <RefreshCw className="h-8 w-8 text-[#00BFA6] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">11. General Provisions</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8 text-[#9CA3AF] text-sm leading-relaxed">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-1">Amendments</h4>
                    <p>We may update these Contractor Terms at any time. Material changes will be communicated
                    via the platform with at least 14 days notice. Continued participation constitutes acceptance.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Severability</h4>
                    <p>If any provision is found unenforceable, the remaining provisions continue in full force.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-1">Entire Agreement</h4>
                    <p>These Contractor Terms, together with your signed onboarding application and any supplementary
                    agreements, constitute the entire agreement between you and Disaster Recovery Pty Ltd
                    regarding your network participation.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">No Waiver</h4>
                    <p>Failure to enforce any provision does not constitute a waiver of that right.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-16">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">Contractor FAQs</h2>
              <div className="space-y-4">
                {[
                  {
                    q: 'Are NRPG contractors employees of Disaster Recovery Pty Ltd?',
                    a: 'No. All contractors in the NRPG network are independent businesses. They hold their own ABN or NZBN, trade licences, IICRC certifications, and business insurances. Disaster Recovery Pty Ltd is a platform facilitator only.',
                  },
                  {
                    q: 'What insurance must NRPG contractors hold?',
                    a: 'Each contractor must independently hold current public liability insurance (minimum $20M AUD / $10M NZD), professional indemnity insurance, and any trade-specific insurances required under state, territory, or NZ law.',
                  },
                  {
                    q: 'What IICRC certifications are required?',
                    a: 'Contractors must hold current IICRC certification relevant to their service offering — WRT for water, FSRT for fire and smoke, AMRT for mould. Certifications must be individually held and kept current.',
                  },
                ].map((faq, i) => (
                  <div key={i} className="bg-[#1F2937] border border-[#374151] rounded-xl p-6">
                    <h3 className="font-semibold mb-2 flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#00BFA6] mt-0.5 shrink-0" />
                      {faq.q}
                    </h3>
                    <p className="text-[#9CA3AF] text-sm leading-relaxed pl-7">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mb-16">
            <div className="max-w-3xl mx-auto bg-[#1F2937] border border-[#374151] rounded-2xl p-10 text-center">
              <Users className="w-12 h-12 text-[#00BFA6] mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Ready to Join the NRPG Network?</h2>
              <p className="text-[#9CA3AF] mb-8 max-w-lg mx-auto">
                IICRC-certified restoration contractors across Australia and New Zealand are invited to
                apply for NRPG network membership. Each contractor is independently vetted to a standard
                with no equivalent in the market.
              </p>
              <Link
                href="/contact?subject=Contractor+Network+Application"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#00BFA6] hover:bg-[#00BFA6]/90 text-white font-semibold rounded-xl transition-colors"
              >
                Apply to Join the NRPG Network
              </Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
