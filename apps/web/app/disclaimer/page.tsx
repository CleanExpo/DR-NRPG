import { SITE_URL } from "@/lib/seo/site-url"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { AlertTriangle, Shield, FileText, Scale, HardHat, Heart, Globe, Mail, BookOpen, Users } from "lucide-react"
import { schemaGenerator } from "@/lib/seo/schema-generator"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Platform Disclaimer | NRPG — Disaster Recovery Australia',
  description: 'Important disclaimer for Disaster Recovery Pty Ltd (ABN: 85 151 794 142). NRPG is a platform facilitator only — all restoration work is performed by independent, IICRC-certified contractors.',
  alternates: {
    canonical: `${SITE_URL}/disclaimer`,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function DisclaimerPage() {
  const faqSchema = schemaGenerator.generateFAQSchema([
    {
      question: 'Are contractor results guaranteed?',
      answer: 'While all contractors meet our IICRC certification and vetting standards, individual results may vary based on the nature and extent of the damage.',
    },
    {
      question: 'Is Disaster Recovery Australia responsible for contractor work?',
      answer: 'No. Disaster Recovery Australia is a platform facilitating the matching process. All restoration work is performed by independent, licensed contractors.',
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
          <div className="text-center mb-16">
            <h1 className="font-poppins font-bold text-4xl md:text-5xl text-balance mb-8">
              Platform <span className="gradient-text-teal-purple">Disclaimer</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-4">
              Important information about the nature of our platform and the limitations of our services.
            </p>
            <p className="text-[#9CA3AF]">Last updated: 5 March 2026</p>
          </div>

          {/* Entity Notice */}
          <div className="mb-12">
            <div className="bg-[#FF9800]/10 rounded-2xl p-6 border border-[#FF9800]/30">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-[#FF9800] mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-poppins font-semibold text-lg text-white mb-2">Important Notice</h3>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">
                    This disclaimer applies to <strong className="text-white">Disaster Recovery Pty Ltd</strong> (ABN: 85 151 794 142),
                    trading as <strong className="text-white">&quot;Disaster Recovery&quot;</strong>, <strong className="text-white">&quot;NRPG&quot;</strong> (National Restoration Partners Guild),
                    and <strong className="text-white">&quot;Restore Assist&quot;</strong>. Please read this disclaimer carefully before using our
                    platform at https://disasterrecovery.com.au.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Platform Facilitator Disclaimer */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Globe className="h-8 w-8 text-[#00BFA6] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">1. Platform Facilitator Disclaimer</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Our Role</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    Our platform operates as a <strong className="text-white">facilitator and marketplace</strong> that connects property
                    owners, insurers, and loss assessors with independent restoration and disaster recovery contractors.
                  </p>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    We are <strong className="text-white">not</strong> a restoration company, building contractor, insurer, loss assessor,
                    financial adviser, or legal adviser. We do not perform any restoration, remediation, construction,
                    or repair work.
                  </p>
                  <p className="text-[#9CA3AF] leading-relaxed">
                    All contractors accessible through our platform are <strong className="text-white">independent businesses</strong>. They
                    are not our employees, agents, partners, subcontractors, or representatives. We do not supervise,
                    direct, or control the work of any contractor.
                  </p>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">What We Do Not Guarantee</h3>
                  <div className="space-y-3">
                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <div className="flex items-start">
                        <span className="text-[#FF4444] mr-2 mt-0.5 flex-shrink-0">&#10005;</span>
                        <p className="text-[#9CA3AF] text-sm">The quality, safety, legality, or timeliness of any work performed by contractors</p>
                      </div>
                    </div>
                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <div className="flex items-start">
                        <span className="text-[#FF4444] mr-2 mt-0.5 flex-shrink-0">&#10005;</span>
                        <p className="text-[#9CA3AF] text-sm">The accuracy of any contractor&apos;s qualifications, licences, or certifications</p>
                      </div>
                    </div>
                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <div className="flex items-start">
                        <span className="text-[#FF4444] mr-2 mt-0.5 flex-shrink-0">&#10005;</span>
                        <p className="text-[#9CA3AF] text-sm">The suitability of any contractor for your particular project or needs</p>
                      </div>
                    </div>
                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <div className="flex items-start">
                        <span className="text-[#FF4444] mr-2 mt-0.5 flex-shrink-0">&#10005;</span>
                        <p className="text-[#9CA3AF] text-sm">The outcome of any project or restoration work arranged through the platform</p>
                      </div>
                    </div>
                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <div className="flex items-start">
                        <span className="text-[#FF4444] mr-2 mt-0.5 flex-shrink-0">&#10005;</span>
                        <p className="text-[#9CA3AF] text-sm">The availability of contractors in your area or for your type of project</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: No Warranty for Contractor Work */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <HardHat className="h-8 w-8 text-[#FF9800] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">2. No Warranty for Contractor Work</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Contractor Responsibility</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    Any contract for restoration, remediation, or construction services is formed directly between
                    you and the contractor. We are <strong className="text-white">not a party</strong> to that contract. The contractor is
                    solely responsible for:
                  </p>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#FF9800] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      The quality and standard of workmanship
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#FF9800] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Compliance with building codes, standards, and regulations
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#FF9800] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Holding valid and current licences and permits
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#FF9800] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Maintaining adequate insurance coverage
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#FF9800] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Occupational health and safety compliance
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#FF9800] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Providing warranties for their own work
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Your Due Diligence</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    While we take reasonable steps to verify contractor credentials, you should conduct your own
                    due diligence before engaging any contractor. We recommend:
                  </p>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Verifying the contractor&apos;s licence with the relevant state or territory authority
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Requesting proof of insurance (public liability and professional indemnity)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Obtaining a written quote and scope of work before commencing
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Checking references and reviews from previous clients
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Ensuring a written contract is in place before work begins
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Insurance & Liability Limitations */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Shield className="h-8 w-8 text-[#2196F3] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">3. Insurance & Liability Limitations</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Insurance Disclaimer</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    We are not an insurance company, insurance broker, or insurance adviser. Any information displayed
                    on the platform regarding insurance (including but not limited to cost estimates, coverage
                    information, or claim processes) is provided for general informational purposes only and
                    does not constitute insurance advice.
                  </p>
                  <p className="text-[#9CA3AF] leading-relaxed">
                    You should consult with your insurance provider or a qualified insurance professional regarding
                    your specific policy, coverage, and claim entitlements.
                  </p>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Limitation of Our Liability</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    Subject to the Australian Consumer Law and the New Zealand Consumer Guarantees Act 1993 (which
                    cannot be excluded), we exclude all liability for:
                  </p>
                  <div className="space-y-2">
                    <div className="border-l-4 border-[#FF4444] pl-4">
                      <p className="text-[#9CA3AF] text-sm">
                        Any loss, damage, injury, or claim arising from the acts, omissions, negligence, or wilful
                        misconduct of any contractor
                      </p>
                    </div>
                    <div className="border-l-4 border-[#FF4444] pl-4">
                      <p className="text-[#9CA3AF] text-sm">
                        Property damage, personal injury, or economic loss resulting from any restoration or
                        construction work
                      </p>
                    </div>
                    <div className="border-l-4 border-[#FF4444] pl-4">
                      <p className="text-[#9CA3AF] text-sm">
                        Indirect, consequential, special, or punitive damages, including loss of profits, data,
                        or business opportunities
                      </p>
                    </div>
                    <div className="border-l-4 border-[#FF4444] pl-4">
                      <p className="text-[#9CA3AF] text-sm">
                        Any dispute between you and a contractor, including disputes regarding pricing,
                        timelines, or work quality
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Professional Advice Disclaimer */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <BookOpen className="h-8 w-8 text-[#7C4DFF] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">4. Professional Advice Disclaimer</h2>
              </div>

              <p className="text-[#9CA3AF] mb-6 leading-relaxed">
                The information and content provided on our platform (including cost estimates, rate schedules,
                guides, articles, and FAQs) is for <strong className="text-white">general informational purposes only</strong> and does not
                constitute professional advice of any kind. Specifically:
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-[#0F1115] rounded-lg p-6 border border-[#374151]">
                  <div className="bg-[#7C4DFF]/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <Scale className="h-6 w-6 text-[#7C4DFF]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-center">Not Legal Advice</h3>
                  <p className="text-[#9CA3AF] text-sm text-center">
                    Nothing on this platform constitutes legal advice. Consult a qualified solicitor for
                    legal matters related to your project, insurance claim, or contractual disputes.
                  </p>
                </div>

                <div className="bg-[#0F1115] rounded-lg p-6 border border-[#374151]">
                  <div className="bg-[#FF9800]/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-6 w-6 text-[#FF9800]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-center">Not Financial Advice</h3>
                  <p className="text-[#9CA3AF] text-sm text-center">
                    Cost estimates and pricing information are indicative only and do not constitute
                    financial, tax, or insurance advice. Consult a qualified financial adviser.
                  </p>
                </div>

                <div className="bg-[#0F1115] rounded-lg p-6 border border-[#374151]">
                  <div className="bg-[#00BFA6]/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <HardHat className="h-6 w-6 text-[#00BFA6]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-center">Not Building Advice</h3>
                  <p className="text-[#9CA3AF] text-sm text-center">
                    Information about restoration methods, materials, or standards is general only. Consult
                    a qualified building professional for specific advice about your property.
                  </p>
                </div>
              </div>

              <p className="text-[#9CA3AF] mt-6 text-sm leading-relaxed">
                You should always seek independent professional advice tailored to your specific circumstances
                before making decisions based on information obtained through our platform.
              </p>
            </div>
          </div>

          {/* Section 5: Cost Estimates & Pricing */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <FileText className="h-8 w-8 text-[#FF9800] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">5. Cost Estimates & Pricing</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Estimates Are Indicative Only</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    Any cost estimates, rate schedules, or pricing information displayed on the platform are
                    provided for general guidance only. They are based on industry averages and typical project
                    parameters, and may not reflect the actual cost of your specific project.
                  </p>
                  <p className="text-[#9CA3AF] leading-relaxed">
                    Actual costs may vary significantly based on factors including project scope, location, access
                    difficulties, material availability, urgency, and individual contractor pricing. Always obtain
                    a formal written quote from the contractor before proceeding.
                  </p>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Third-Party Content</h3>
                  <p className="text-[#9CA3AF] leading-relaxed">
                    Our platform may contain links to third-party websites, resources, or content. We do not
                    control, endorse, or assume responsibility for the content, privacy policies, or practices
                    of any third-party websites or services. Accessing third-party content is at your own risk.
                    We encourage you to review the terms and privacy policies of any third-party sites you visit.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Platform Availability */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Users className="h-8 w-8 text-[#2196F3] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">6. Platform Availability & Accuracy</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">No Guarantee of Availability</h3>
                  <p className="text-[#9CA3AF] leading-relaxed">
                    We do not guarantee that the platform will be available at all times. The platform may be
                    temporarily unavailable due to scheduled maintenance, system updates, technical failures, or
                    circumstances beyond our control. We will endeavour to provide advance notice of planned
                    downtime where possible but accept no liability for any loss caused by platform unavailability.
                  </p>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Information Accuracy</h3>
                  <p className="text-[#9CA3AF] leading-relaxed">
                    While we take reasonable steps to ensure the accuracy and currency of information on the
                    platform, we do not warrant that all information is complete, accurate, reliable, or current.
                    Information provided by contractors (including qualifications, availability, and pricing) is
                    supplied by them and has not been independently verified by us unless otherwise stated.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Indemnification */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Heart className="h-8 w-8 text-[#FF4444] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">7. Indemnification</h2>
              </div>

              <p className="text-[#9CA3AF] leading-relaxed">
                To the maximum extent permitted by law, you agree to indemnify, defend, and hold harmless
                Disaster Recovery Pty Ltd, its directors, officers, employees, and agents from and against any
                claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising
                out of or in any way connected with: (a) your use of the platform; (b) your violation of these
                Terms or any applicable law; (c) your interactions with any contractor; or (d) any dispute between
                you and a contractor. This indemnification obligation does not limit or exclude any other rights
                or remedies available to us.
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Mail className="h-8 w-8 text-[#00BFA6] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">Contact Us</h2>
              </div>

              <p className="text-[#9CA3AF] mb-6 leading-relaxed">
                If you have any questions about this disclaimer or our platform, please contact us:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                  <div className="flex items-center mb-2">
                    <Mail className="h-5 w-5 text-[#00BFA6] mr-2" />
                    <span className="text-white font-medium">Contact</span>
                  </div>
                  <a href="/contact" className="text-[#00BFA6] hover:underline">Contact us online</a>
                </div>

                <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                  <div className="flex items-center mb-2">
                    <Globe className="h-5 w-5 text-[#2196F3] mr-2" />
                    <span className="text-white font-medium">Entity</span>
                  </div>
                  <p className="text-[#9CA3AF] text-sm">
                    Disaster Recovery Pty Ltd
                    <br />
                    Australia-wide · AI-automated online
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
