import Header from "@/components/header"
import Footer from "@/components/footer"
import { FileText, Users, Shield, Scale, AlertTriangle, CheckCircle, Mail, Globe, Gavel, BookOpen, CreditCard, RefreshCw } from "lucide-react"
import { schemaGenerator } from "@/lib/seo/schema-generator"
import Link from "next/link"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | NRPG — Disaster Recovery Australia',
  description: 'Terms of Service for Disaster Recovery Pty Ltd (ABN: 85 151 794 142), trading as NRPG, Disaster Recovery, and Restore Assist. Governs use of the platform under Australian and New Zealand law.',
  alternates: {
    canonical: 'https://nrpg.business/terms',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsPage() {
  const faqSchema = schemaGenerator.generateFAQSchema([
    {
      question: 'What are the terms of using this platform?',
      answer: 'By using Disaster Recovery Australia, you agree that we facilitate matching between property owners and independent contractors. We do not directly provide restoration services.',
    },
    {
      question: 'Are contractors employees of Disaster Recovery Australia?',
      answer: 'No. All contractors are independent businesses in the NRPG network. Disaster Recovery Australia is a platform facilitating the matching process only.',
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
              Terms of <span className="gradient-text-teal-purple">Service</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-4">
              Please read these terms carefully before using our platform and services.
            </p>
            <p className="text-[#9CA3AF]">Last updated: 5 March 2026</p>
          </div>

          {/* ABN Legal Notice */}
          <div className="mb-12">
            <div className="bg-[#00BFA6]/10 rounded-2xl p-6 border border-[#00BFA6]/30">
              <div className="flex items-start">
                <Gavel className="h-6 w-6 text-[#00BFA6] mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-poppins font-semibold text-lg text-white mb-2">Legal Entity Notice</h3>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">
                    These Terms of Service (&quot;Terms&quot;) are entered into between you (&quot;User&quot;, &quot;you&quot;, &quot;your&quot;) and
                    <strong className="text-white"> Disaster Recovery Pty Ltd</strong> (ABN: 85 151 794 142),
                    trading as <strong className="text-white">&quot;Disaster Recovery&quot;</strong>, <strong className="text-white">&quot;NRPG&quot;</strong> (National Restoration Partners Guild),
                    and <strong className="text-white">&quot;Restore Assist&quot;</strong> (collectively, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
                    Registered address: Brisbane, Queensland, 4076, Australia.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Acceptance & Electronic Agreement */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <FileText className="h-8 w-8 text-[#00BFA6] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">1. Acceptance of Terms</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Agreement to be Bound</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    By accessing and using our platform (available at https://disasterrecovery.com.au and any associated
                    applications or services), you accept and agree to be bound by these Terms. If you do not agree
                    to these Terms, you must not use our platform or services.
                  </p>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    These Terms apply regardless of whether you access our services under the trading name
                    &quot;Disaster Recovery&quot;, &quot;NRPG&quot;, or &quot;Restore Assist&quot;. All three trading names refer to the same
                    platform and entity.
                  </p>
                  <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="h-5 w-5 text-[#00BFA6] mr-2" />
                      <span className="text-white font-medium">Eligibility</span>
                    </div>
                    <p className="text-[#9CA3AF] text-sm">
                      You must be at least 18 years of age and legally capable of entering into binding contracts
                      under the laws of your jurisdiction.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Electronic Acceptance</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    You acknowledge that by clicking &quot;I agree&quot;, registering an account, or using the platform, you are
                    entering into a legally binding agreement electronically. This agreement is valid and enforceable
                    pursuant to:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mr-3"></span>
                      <span className="text-[#9CA3AF] text-sm">Electronic Transactions Act 1999 (Cth) (Australia)</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mr-3"></span>
                      <span className="text-[#9CA3AF] text-sm">Electronic Transactions Act 2002 (New Zealand)</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mr-3"></span>
                      <span className="text-[#9CA3AF] text-sm">Applicable state and territory electronic transactions legislation</span>
                    </div>
                  </div>
                  <p className="text-[#9CA3AF] mt-4 text-sm leading-relaxed">
                    Electronic signatures and acceptances have the same legal effect as handwritten signatures
                    under these Acts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Service Description & Platform Role */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Globe className="h-8 w-8 text-[#2196F3] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">2. Service Description</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Platform Services</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    Our platform provides a digital marketplace connecting property owners, insurers, and loss assessors
                    with verified restoration and disaster recovery contractors. Our services include:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mr-3"></span>
                      <span className="text-[#9CA3AF] text-sm">Contractor matching and discovery services</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mr-3"></span>
                      <span className="text-[#9CA3AF] text-sm">Project management and tracking tools</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mr-3"></span>
                      <span className="text-[#9CA3AF] text-sm">Cost estimation and transparent pricing</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mr-3"></span>
                      <span className="text-[#9CA3AF] text-sm">Quality assurance and verification monitoring</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mr-3"></span>
                      <span className="text-[#9CA3AF] text-sm">Secure payment processing via third-party providers</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Platform Facilitator Disclaimer</h3>
                  <div className="bg-[#FF9800]/10 rounded-lg p-4 border border-[#FF9800]/30 mb-4">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-5 w-5 text-[#FF9800] mr-2" />
                      <span className="text-white font-medium">Important Notice</span>
                    </div>
                    <p className="text-[#9CA3AF] text-sm leading-relaxed">
                      We are a <strong className="text-white">platform facilitator only</strong>. We do not perform restoration,
                      remediation, or construction work directly. All contractors listed on the platform are independent
                      businesses and are not our employees, agents, or subcontractors.
                    </p>
                  </div>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">
                    Any contract for restoration services is formed directly between you and the contractor.
                    We are not a party to that contract and accept no liability for the performance, quality,
                    or outcome of any work carried out by contractors accessed through our platform. We do not
                    guarantee the availability, suitability, or qualifications of any contractor.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: User Responsibilities */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Users className="h-8 w-8 text-[#2196F3] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">3. User Responsibilities</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="bg-[#00BFA6]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-[#00BFA6]" />
                  </div>
                  <h3 className="font-semibold text-white mb-3 text-center">Account Security</h3>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    <li>&#8226; Maintain confidential login credentials</li>
                    <li>&#8226; Report unauthorised access immediately</li>
                    <li>&#8226; Use strong, unique passwords</li>
                    <li>&#8226; Keep contact information current</li>
                    <li>&#8226; You are responsible for all activity under your account</li>
                  </ul>
                </div>

                <div>
                  <div className="bg-[#2196F3]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-[#2196F3]" />
                  </div>
                  <h3 className="font-semibold text-white mb-3 text-center">Accurate Information</h3>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    <li>&#8226; Provide truthful and accurate project details</li>
                    <li>&#8226; Submit correct property and insurance information</li>
                    <li>&#8226; Update changes to your details promptly</li>
                    <li>&#8226; Verify insurance and licence details as required</li>
                    <li>&#8226; Ensure uploaded documents are genuine</li>
                  </ul>
                </div>

                <div>
                  <div className="bg-[#7C4DFF]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Scale className="h-8 w-8 text-[#7C4DFF]" />
                  </div>
                  <h3 className="font-semibold text-white mb-3 text-center">Lawful Use</h3>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    <li>&#8226; Comply with all applicable Australian and NZ laws</li>
                    <li>&#8226; Respect intellectual property rights</li>
                    <li>&#8226; No fraudulent or deceptive practices</li>
                    <li>&#8226; Professional communication standards</li>
                    <li>&#8226; Do not circumvent the platform for direct contact</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Pricing & GST */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <CreditCard className="h-8 w-8 text-[#00BFA6] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">4. Pricing, Payments & GST</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Pricing</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    Unless otherwise stated, all prices displayed on the platform are in Australian Dollars (AUD)
                    and are inclusive of Goods and Services Tax (GST) where applicable.
                  </p>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    For New Zealand users, prices may be displayed in New Zealand Dollars (NZD) where relevant.
                    GST at the applicable rate under the Goods and Services Tax Act 1985 (NZ) will be clearly
                    indicated.
                  </p>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">
                    We reserve the right to modify pricing at any time. Price changes will not affect services
                    already contracted or in progress.
                  </p>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Payment Terms</h3>
                  <div className="space-y-3">
                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <p className="text-white font-medium mb-1">Payment Processing</p>
                      <p className="text-[#9CA3AF] text-sm">
                        Payments are processed securely through third-party payment processors (e.g., Stripe).
                        We do not store your full credit card details on our servers.
                      </p>
                    </div>
                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <p className="text-white font-medium mb-1">Engagement Fee — Disaster Recovery Pty Ltd</p>
                      <p className="text-[#9CA3AF] text-sm">
                        An engagement fee of <strong className="text-white">$2,750 AUD (incl. GST)</strong> is payable to Disaster Recovery Pty Ltd
                        prior to contractor dispatch. This fee covers platform matching, contractor coordination,
                        and IICRC-standard project documentation. A tax invoice compliant with the
                        A New Tax System (Goods and Services Tax) Act 1999 (Cth) will be issued.
                        Payment is accepted by credit card or bank transfer.
                      </p>
                    </div>
                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <p className="text-white font-medium mb-1">Contractor Costs — Paid Directly to Contractor</p>
                      <p className="text-[#9CA3AF] text-sm">
                        All restoration costs beyond the engagement fee are invoiced directly to you by the
                        assigned contractor under their own ABN (or NZBN for NZ contractors). Contractor
                        invoices are separate from and in addition to the platform engagement fee.
                        IICRC-standard scope-of-works documentation is provided for your insurance submission.
                      </p>
                    </div>
                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <p className="text-white font-medium mb-1">Refund Policy</p>
                      <p className="text-[#9CA3AF] text-sm">
                        The engagement fee is generally non-refundable once a contractor has been dispatched,
                        unless otherwise required by the Australian Consumer Law (Schedule 2 of the
                        Competition and Consumer Act 2010 (Cth)) or the New Zealand Consumer Guarantees Act 1993.
                        Refund requests are assessed on a case-by-case basis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Australian Consumer Law */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <BookOpen className="h-8 w-8 text-[#2196F3] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">5. Consumer Guarantees</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Australian Consumer Law</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    Nothing in these Terms excludes, restricts, or modifies any consumer guarantee, right, or
                    remedy conferred on you by the Australian Consumer Law (Schedule 2 of the Competition and
                    Consumer Act 2010 (Cth)) or any other applicable law that cannot be excluded, restricted, or
                    modified by agreement.
                  </p>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    Our services come with guarantees that cannot be excluded under the Australian Consumer Law.
                    For major failures with the service, you are entitled to:
                  </p>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-[#00BFA6] mr-2 mt-0.5 flex-shrink-0" />
                      Cancel your service contract
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-[#00BFA6] mr-2 mt-0.5 flex-shrink-0" />
                      Receive a refund for the unused portion
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-[#00BFA6] mr-2 mt-0.5 flex-shrink-0" />
                      Seek compensation for reasonably foreseeable loss or damage
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">New Zealand Consumer Protections</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    If you are a consumer in New Zealand, your rights under the following legislation are not
                    affected by these Terms:
                  </p>
                  <div className="space-y-3">
                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <p className="text-white font-medium mb-1">Consumer Guarantees Act 1993 (NZ)</p>
                      <p className="text-[#9CA3AF] text-sm">
                        Services must be carried out with reasonable care and skill, be fit for purpose,
                        and be completed within a reasonable time.
                      </p>
                    </div>
                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <p className="text-white font-medium mb-1">Fair Trading Act 1986 (NZ)</p>
                      <p className="text-[#9CA3AF] text-sm">
                        We will not engage in misleading or deceptive conduct, false representations,
                        or unfair practices.
                      </p>
                    </div>
                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <p className="text-white font-medium mb-1">Contract and Commercial Law Act 2017 (NZ)</p>
                      <p className="text-[#9CA3AF] text-sm">
                        Applicable provisions regarding contractual remedies and fair contracting apply
                        to New Zealand users.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Intellectual Property */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Shield className="h-8 w-8 text-[#7C4DFF] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">6. Intellectual Property</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Our Intellectual Property</h3>
                  <p className="text-[#9CA3AF] leading-relaxed">
                    All content, features, and functionality of the platform — including but not limited to text,
                    graphics, logos, icons, images, software, and the compilation thereof — are owned by
                    Disaster Recovery Pty Ltd and are protected by Australian and international copyright, trademark,
                    and other intellectual property laws. The names &quot;Disaster Recovery&quot;, &quot;NRPG&quot;, &quot;National
                    Restoration Partners Guild&quot;, and &quot;Restore Assist&quot; are our trading names and may not be used
                    without our prior written consent.
                  </p>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">User-Generated Content</h3>
                  <p className="text-[#9CA3AF] leading-relaxed">
                    By uploading content (including photos, documents, and project descriptions) to the platform,
                    you grant us a non-exclusive, royalty-free, worldwide licence to use, display, reproduce, and
                    distribute such content solely for the purpose of operating and improving the platform. You
                    retain all ownership rights in your content and may request its removal at any time, subject
                    to any legal retention obligations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Limitation of Liability */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <AlertTriangle className="h-8 w-8 text-[#FF9800] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">7. Limitation of Liability</h2>
              </div>

              <div className="space-y-4">
                <p className="text-[#9CA3AF] leading-relaxed">
                  To the maximum extent permitted by law (and subject to Section 5 — Consumer Guarantees), our total
                  aggregate liability to you for all claims arising out of or in connection with these Terms or your
                  use of the platform shall not exceed the total amount of platform fees paid by you in the twelve (12)
                  months immediately preceding the event giving rise to the claim.
                </p>
                <p className="text-[#9CA3AF] leading-relaxed">
                  To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special,
                  consequential, or punitive damages, including but not limited to loss of profits, data, business
                  opportunities, goodwill, or anticipated savings, whether arising in contract, tort (including negligence),
                  statute, or otherwise.
                </p>
                <p className="text-[#9CA3AF] leading-relaxed">
                  We are not responsible for any loss or damage arising from: the acts or omissions of contractors;
                  the quality, safety, or legality of any work performed; any dispute between you and a contractor; or
                  any failure by a contractor to hold appropriate licences, insurance, or qualifications.
                </p>
              </div>
            </div>
          </div>

          {/* Section 8: Prohibited Activities */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Scale className="h-8 w-8 text-[#FF4444] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">8. Prohibited Activities</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">You Must Not</h3>
                  <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                    <ul className="space-y-2 text-[#9CA3AF] text-sm">
                      <li className="flex items-start">
                        <span className="text-[#FF4444] mr-2 flex-shrink-0">&#10005;</span>
                        Circumvent the platform to contact contractors directly and avoid platform fees
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#FF4444] mr-2 flex-shrink-0">&#10005;</span>
                        Submit false, misleading, or fraudulent information
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#FF4444] mr-2 flex-shrink-0">&#10005;</span>
                        Attempt to access, hack, or disrupt the platform&apos;s security or infrastructure
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#FF4444] mr-2 flex-shrink-0">&#10005;</span>
                        Use the platform for any illegal or unauthorised purpose
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#FF4444] mr-2 flex-shrink-0">&#10005;</span>
                        Engage in harassment, discrimination, or inappropriate communication
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Consequences</h3>
                  <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                    <ul className="space-y-2 text-[#9CA3AF] text-sm">
                      <li className="flex items-start">
                        <span className="text-[#FF4444] mr-2 flex-shrink-0">&#10005;</span>
                        Scrape, crawl, or use automated means to access the platform without written permission
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#FF4444] mr-2 flex-shrink-0">&#10005;</span>
                        Impersonate another person, business, or entity
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#FF4444] mr-2 flex-shrink-0">&#10005;</span>
                        Use the platform to distribute spam, malware, or unsolicited communications
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#FF4444] mr-2 flex-shrink-0">&#10005;</span>
                        Interfere with another user&apos;s use and enjoyment of the platform
                      </li>
                    </ul>
                  </div>
                  <p className="text-[#9CA3AF] text-sm mt-4 leading-relaxed">
                    Breach of these provisions may result in immediate suspension or termination of your account,
                    without notice, and we reserve the right to pursue legal remedies.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 9: Termination */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <RefreshCw className="h-8 w-8 text-[#7C4DFF] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">9. Termination & Suspension</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Your Right to Terminate</h3>
                  <p className="text-[#9CA3AF] leading-relaxed">
                    You may close your account and cease using the platform at any time by submitting a request
                    via our <Link href="/contact" className="text-[#00BFA6] hover:underline">online contact form</Link>. Termination does not relieve you of any outstanding
                    obligations, including payment of any fees owed prior to termination. Upon termination,
                    your right to access the platform ceases immediately.
                  </p>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Our Right to Terminate</h3>
                  <p className="text-[#9CA3AF] leading-relaxed">
                    We may suspend or terminate your account at any time if you breach these Terms, engage in
                    prohibited activities, fail to pay outstanding fees, or if we reasonably believe your account
                    poses a risk to the platform, other users, or third parties. We will endeavour to provide
                    notice prior to termination where practicable, except in cases of serious breach.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 10: Dispute Resolution */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Gavel className="h-8 w-8 text-[#FF9800] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">10. Dispute Resolution</h2>
              </div>

              <div className="space-y-6">
                <p className="text-[#9CA3AF] leading-relaxed">
                  We are committed to resolving disputes fairly and efficiently. If you have a complaint or dispute
                  regarding our services, the following process applies:
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-[#0F1115] rounded-lg p-6 border border-[#374151] text-center">
                    <div className="bg-[#00BFA6]/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <span className="text-[#00BFA6] font-bold text-lg">1</span>
                    </div>
                    <h4 className="font-semibold text-white mb-2">Internal Resolution</h4>
                    <p className="text-[#9CA3AF] text-sm">
                      Submit a complaint via our <Link href="/contact" className="text-[#00BFA6] hover:underline">online contact form</Link>. We aim to acknowledge complaints within
                      2 business days and resolve within 14 business days.
                    </p>
                  </div>

                  <div className="bg-[#0F1115] rounded-lg p-6 border border-[#374151] text-center">
                    <div className="bg-[#2196F3]/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <span className="text-[#2196F3] font-bold text-lg">2</span>
                    </div>
                    <h4 className="font-semibold text-white mb-2">External Dispute Resolution</h4>
                    <p className="text-[#9CA3AF] text-sm">
                      If unresolved, you may refer the matter to an appropriate external dispute resolution
                      body, such as a relevant industry ombudsman or mediation service.
                    </p>
                  </div>

                  <div className="bg-[#0F1115] rounded-lg p-6 border border-[#374151] text-center">
                    <div className="bg-[#7C4DFF]/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <span className="text-[#7C4DFF] font-bold text-lg">3</span>
                    </div>
                    <h4 className="font-semibold text-white mb-2">QCAT / Courts</h4>
                    <p className="text-[#9CA3AF] text-sm">
                      As a last resort, disputes may be referred to the Queensland Civil and Administrative
                      Tribunal (QCAT) or the courts of Queensland, Australia.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 11: Governing Law */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Scale className="h-8 w-8 text-[#FF9800] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">11. Governing Law & Jurisdiction</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Australian Users</h3>
                  <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                    <p className="text-[#9CA3AF] text-sm leading-relaxed">
                      These Terms are governed by and construed in accordance with the laws of the State of Queensland,
                      Australia. You irrevocably submit to the exclusive jurisdiction of the courts of Queensland and
                      the Federal Court of Australia, and any courts of appeal from them, for the resolution of any
                      dispute arising under or in connection with these Terms.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">New Zealand Users</h3>
                  <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                    <p className="text-[#9CA3AF] text-sm leading-relaxed">
                      If you are accessing the platform from New Zealand, these Terms are also subject to the
                      Consumer Guarantees Act 1993 (NZ), the Fair Trading Act 1986 (NZ), and the Contract and
                      Commercial Law Act 2017 (NZ) to the extent they apply. Nothing in these Terms limits your
                      statutory rights as a New Zealand consumer. Disputes involving New Zealand consumers may be
                      referred to the Disputes Tribunal of New Zealand where applicable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 12: Changes & General */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <RefreshCw className="h-8 w-8 text-[#00BFA6] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">12. General Provisions</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Amendments</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    We reserve the right to update or modify these Terms at any time. Material changes will be
                    communicated by email or by prominent notice on the platform at least 14 days prior to taking
                    effect. Your continued use of the platform after the effective date constitutes acceptance of the
                    updated Terms. If you do not agree to the changes, you must cease using the platform.
                  </p>

                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Severability</h3>
                  <p className="text-[#9CA3AF] leading-relaxed">
                    If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining
                    provisions shall continue in full force and effect. The invalid provision shall be modified to the
                    minimum extent necessary to make it valid and enforceable.
                  </p>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Entire Agreement</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    These Terms, together with our Privacy Policy, Cookie Policy, and any supplementary terms,
                    constitute the entire agreement between you and us regarding your use of the platform.
                  </p>

                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Waiver</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    No failure or delay by us in exercising any right or remedy under these Terms shall constitute
                    a waiver of that right or remedy.
                  </p>

                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Assignment</h3>
                  <p className="text-[#9CA3AF] leading-relaxed">
                    You may not assign or transfer your rights or obligations under these Terms without our prior
                    written consent. We may assign these Terms to any successor or affiliate without your consent.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Mail className="h-8 w-8 text-[#00BFA6] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">Contact Us</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                  <div className="flex items-center mb-2">
                    <Mail className="h-5 w-5 text-[#00BFA6] mr-2" />
                    <span className="text-white font-medium">General & Legal Inquiries</span>
                  </div>
                  <Link href="/contact" className="text-[#00BFA6] hover:underline text-sm">Submit inquiry via online contact form →</Link>
                  <p className="text-[#9CA3AF] text-sm mt-1">For questions about these terms, legal matters, or complaints</p>
                </div>

                <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                  <div className="flex items-center mb-2">
                    <Globe className="h-5 w-5 text-[#2196F3] mr-2" />
                    <span className="text-white font-medium">Registered Address</span>
                  </div>
                  <p className="text-[#9CA3AF] text-sm">
                    Disaster Recovery Pty Ltd
                    <br />
                    Brisbane, Queensland
                    <br />
                    Queensland 4076
                    <br />
                    Australia
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
