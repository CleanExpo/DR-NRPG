import { SITE_URL } from "@/lib/seo/site-url"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Shield, Eye, Users, Mail, Lock, Database, Globe, FileText, AlertTriangle, BookOpen, Bell, UserX, ExternalLink } from "lucide-react"
import Link from "next/link"
import { schemaGenerator } from "@/lib/seo/schema-generator"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | NRPG — Disaster Recovery Australia',
  description: 'Privacy Policy for Disaster Recovery Pty Ltd (ABN: 85 151 794 142). Compliant with the Privacy Act 1988 (Cth), Australian Privacy Principles, and the New Zealand Privacy Act 2020.',
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPage() {
  const faqSchema = schemaGenerator.generateFAQSchema([
    {
      question: 'What data do you collect?',
      answer: 'We collect information you provide when submitting claims, creating accounts, or contacting us. This includes name, contact details, property address, and damage descriptions.',
    },
    {
      question: 'How long do you retain my data?',
      answer: 'We retain personal data for 7 years to comply with Australian financial and insurance regulations, then securely delete it.',
    },
    {
      question: 'Do you share my data with third parties?',
      answer: 'We share relevant claim information with the IICRC-certified contractor matched to your job. We do not share your personal information with your insurer — we provide IICRC-standard documentation that you submit to your insurer yourself. We do not sell personal data to third parties.',
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
              Privacy <span className="gradient-text-teal-purple">Policy</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-4">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>
            <p className="text-[#9CA3AF]">Last updated: 5 March 2026</p>
          </div>

          {/* Legal Entity Notice */}
          <div className="mb-12">
            <div className="bg-[#00BFA6]/10 rounded-2xl p-6 border border-[#00BFA6]/30">
              <div className="flex items-start">
                <Shield className="h-6 w-6 text-[#00BFA6] mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-poppins font-semibold text-lg text-white mb-2">About This Policy</h3>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">
                    This Privacy Policy applies to <strong className="text-white">Disaster Recovery Pty Ltd</strong> (ABN: 85 151 794 142),
                    trading as <strong className="text-white">&quot;Disaster Recovery&quot;</strong>, <strong className="text-white">&quot;NRPG&quot;</strong> (National Restoration Partners Guild),
                    and <strong className="text-white">&quot;Restore Assist&quot;</strong>. This policy covers all personal information collected
                    through our platform at https://disasterrecovery.com.au and any associated applications. We comply with
                    the <strong className="text-white">Privacy Act 1988 (Cth)</strong> and the <strong className="text-white">Australian Privacy Principles (APPs 1–13)</strong>,
                    as well as the <strong className="text-white">New Zealand Privacy Act 2020</strong> and its <strong className="text-white">13 privacy principles (PP 1–13)</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Information We Collect (APP 3 / IPP 1-4) */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Database className="h-8 w-8 text-[#00BFA6] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">1. Information We Collect</h2>
              </div>
              <p className="text-[#9CA3AF] mb-2 text-sm">APP 3 — Collection of Solicited Personal Information | IPP 1–4</p>

              <div className="grid md:grid-cols-2 gap-8 mt-6">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Personal Information</h3>
                  <p className="text-[#9CA3AF] mb-4 text-sm leading-relaxed">
                    We collect personal information that is reasonably necessary for our functions and activities.
                    We collect this information directly from you, or with your consent, from third parties:
                  </p>
                  <ul className="space-y-2 text-[#9CA3AF]">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Full name and contact details (email address, postal address)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Property address and damage or project details
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Insurance policy and claim information (when provided)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Payment and billing information (processed securely via Stripe)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Business registration details, ABN, licences (for contractors)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Photos and documents uploaded to the platform
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Technical Information</h3>
                  <p className="text-[#9CA3AF] mb-4 text-sm leading-relaxed">
                    We automatically collect certain technical information when you use our platform:
                  </p>
                  <ul className="space-y-2 text-[#9CA3AF]">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2196F3] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      IP address and approximate geolocation
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2196F3] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Browser type, version, and operating system
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2196F3] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Device type and screen resolution
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2196F3] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Pages visited, navigation paths, and session duration
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2196F3] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Referring website or source
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2196F3] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Cookies and similar tracking technologies (see our{" "}
                      <Link href="/cookie-policy" className="text-[#00BFA6] hover:underline">Cookie Policy</Link>)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-poppins font-semibold text-xl text-white mb-4">Sensitive Information</h3>
                <p className="text-[#9CA3AF] text-sm leading-relaxed">
                  We do not generally collect sensitive information (as defined in the Privacy Act 1988). If we ever need
                  to collect sensitive information (for example, health information relevant to a disaster recovery claim),
                  we will obtain your explicit consent prior to collection and handle it in accordance with APP 3.3 / IPP 4.
                </p>
              </div>

              <div className="mt-6">
                <h3 className="font-poppins font-semibold text-xl text-white mb-4">Voice Assistant Interactions (APP 5)</h3>
                <p className="text-[#9CA3AF] text-sm leading-relaxed">
                  If you choose to use the voice assistant on this site, your voice is recorded and transcribed so we can
                  respond to your support and contractor onboarding enquiries. Voice recordings and transcripts are
                  processed on our behalf by ElevenLabs, whose infrastructure is located overseas, so this involves a
                  cross-border disclosure of your personal information (see Section 4). In line with Australian Privacy
                  Principle 5, we notify you of this collection at the point you start a voice conversation. Using the
                  voice assistant is optional — you can contact us by phone, email or web form instead.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: How We Use Information (APP 6 / IPP 10) */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Eye className="h-8 w-8 text-[#2196F3] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">2. How We Use Your Information</h2>
              </div>
              <p className="text-[#9CA3AF] mb-6 text-sm">APP 6 — Use or Disclosure of Personal Information | IPP 10</p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-[#00BFA6]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-[#00BFA6]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Service Delivery</h3>
                  <p className="text-[#9CA3AF] text-sm">
                    Match you with qualified contractors, manage your projects, process payments, and provide
                    customer support.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-[#2196F3]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-[#2196F3]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Communication</h3>
                  <p className="text-[#9CA3AF] text-sm">
                    Send transactional notifications, project updates, account alerts, and (with your consent)
                    marketing communications.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-[#7C4DFF]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-[#7C4DFF]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Safety & Compliance</h3>
                  <p className="text-[#9CA3AF] text-sm">
                    Protect against fraud, verify identities, comply with legal obligations, enforce our terms,
                    and maintain platform security.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="bg-[#FF9800]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-[#FF9800]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Platform Improvement</h3>
                  <p className="text-[#9CA3AF] text-sm">
                    Analyse usage patterns, conduct research, improve our services, and develop new features
                    (using anonymised and aggregated data where possible).
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-[#FF4444]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-[#FF4444]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Legal Obligations</h3>
                  <p className="text-[#9CA3AF] text-sm">
                    Respond to lawful requests from regulators, law enforcement, and government authorities;
                    comply with taxation and reporting requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Information Sharing & Disclosure (APP 6 / IPP 10-11) */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Lock className="h-8 w-8 text-[#7C4DFF] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">3. Information Sharing & Protection</h2>
              </div>
              <p className="text-[#9CA3AF] mb-6 text-sm">APP 6 &amp; 11 — Disclosure &amp; Security | IPP 10–11</p>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">When We Share Information</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-[#00BFA6] pl-4">
                      <h4 className="font-semibold text-white">With Contractors</h4>
                      <p className="text-[#9CA3AF] text-sm">
                        We share only the project details necessary for contractors to provide quotes and services
                        (e.g., property address, damage type, photos). We do not share your full personal details
                        until you accept a contractor.
                      </p>
                    </div>
                    <div className="border-l-4 border-[#2196F3] pl-4">
                      <h4 className="font-semibold text-white">Service Providers</h4>
                      <p className="text-[#9CA3AF] text-sm">
                        Trusted third-party service providers who assist in operating our platform, including
                        hosting (Vercel), payment processing (Stripe), analytics (Google Analytics), and
                        email delivery services.
                      </p>
                    </div>
                    <div className="border-l-4 border-[#7C4DFF] pl-4">
                      <h4 className="font-semibold text-white">Legal Requirements</h4>
                      <p className="text-[#9CA3AF] text-sm">
                        When required by law, court order, subpoena, or to protect our rights, property,
                        or the safety of our users and the public.
                      </p>
                    </div>
                    <div className="border-l-4 border-[#FF9800] pl-4">
                      <h4 className="font-semibold text-white">Business Transfers</h4>
                      <p className="text-[#9CA3AF] text-sm">
                        In connection with a merger, acquisition, or sale of assets, your information may be
                        transferred. We will notify you of any such change.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Security Measures (APP 11 / IPP 5)</h3>
                  <p className="text-[#9CA3AF] mb-4 text-sm leading-relaxed">
                    We take reasonable steps to protect your personal information from misuse, interference,
                    loss, unauthorised access, modification, or disclosure:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-[#00BFA6] mr-3 flex-shrink-0" />
                      <span className="text-[#9CA3AF]">TLS/SSL encryption for all data in transit</span>
                    </div>
                    <div className="flex items-center">
                      <Lock className="h-5 w-5 text-[#00BFA6] mr-3 flex-shrink-0" />
                      <span className="text-[#9CA3AF]">Encrypted data storage at rest</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 text-[#00BFA6] mr-3 flex-shrink-0" />
                      <span className="text-[#9CA3AF]">Regular security audits and vulnerability assessments</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-[#00BFA6] mr-3 flex-shrink-0" />
                      <span className="text-[#9CA3AF]">Role-based access controls for staff</span>
                    </div>
                    <div className="flex items-center">
                      <Database className="h-5 w-5 text-[#00BFA6] mr-3 flex-shrink-0" />
                      <span className="text-[#9CA3AF]">Regular backups with disaster recovery procedures</span>
                    </div>
                  </div>
                  <p className="text-[#9CA3AF] mt-4 text-sm leading-relaxed">
                    While we take reasonable steps to protect your information, no method of transmission over the
                    internet or electronic storage is completely secure. We cannot guarantee absolute security.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Cross-Border Data Disclosure (APP 8 / IPP 11) */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Globe className="h-8 w-8 text-[#2196F3] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">4. Cross-Border Data Disclosure</h2>
              </div>
              <p className="text-[#9CA3AF] mb-6 text-sm">APP 8 — Cross-border Disclosure | IPP 11 — Disclosure Outside NZ</p>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Where We Store & Process Data</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    Our primary data storage is within Australia. However, some of our third-party service providers
                    may store or process data in other countries, including:
                  </p>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2196F3] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <strong className="text-white">United States</strong> — Cloud hosting (Vercel), payment processing (Stripe),
                      analytics (Google), voice assistant processing (ElevenLabs — see Section 1)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2196F3] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <strong className="text-white">New Zealand</strong> — Service delivery to NZ-based users and contractors
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2196F3] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <strong className="text-white">European Union</strong> — Some infrastructure providers with EU data centres
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Safeguards</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    Before disclosing personal information to an overseas recipient, we take reasonable steps to
                    ensure that the recipient:
                  </p>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Is subject to a law or binding scheme substantially similar to the APPs/IPPs
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Has contractual obligations to handle data in compliance with Australian and NZ privacy standards
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Implements appropriate technical and organisational security measures
                    </li>
                  </ul>
                  <p className="text-[#9CA3AF] mt-4 text-sm leading-relaxed">
                    We remain accountable under APP 8 and IPP 11 for the handling of your personal information
                    by overseas recipients.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Data Retention */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Database className="h-8 w-8 text-[#FF9800] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">5. Data Retention</h2>
              </div>

              <p className="text-[#9CA3AF] mb-6 leading-relaxed">
                We retain your personal information only for as long as necessary to fulfil the purposes for which
                it was collected, or as required by law. When personal information is no longer needed, we will take
                reasonable steps to destroy or de-identify it (APP 11.2 / IPP 9).
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151] text-center">
                  <p className="text-[#00BFA6] font-bold text-2xl mb-2">Active</p>
                  <p className="text-white font-medium text-sm mb-1">Account Data</p>
                  <p className="text-[#9CA3AF] text-xs">Retained while your account is active</p>
                </div>
                <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151] text-center">
                  <p className="text-[#2196F3] font-bold text-2xl mb-2">7 Years</p>
                  <p className="text-white font-medium text-sm mb-1">Financial Records</p>
                  <p className="text-[#9CA3AF] text-xs">As required by ATO and tax legislation</p>
                </div>
                <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151] text-center">
                  <p className="text-[#7C4DFF] font-bold text-2xl mb-2">3 Years</p>
                  <p className="text-white font-medium text-sm mb-1">Project Records</p>
                  <p className="text-[#9CA3AF] text-xs">After project completion or account closure</p>
                </div>
                <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151] text-center">
                  <p className="text-[#FF9800] font-bold text-2xl mb-2">90 Days</p>
                  <p className="text-white font-medium text-sm mb-1">Log Data</p>
                  <p className="text-[#9CA3AF] text-xs">Server logs and analytics data</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Cookies */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Globe className="h-8 w-8 text-[#00BFA6] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">6. Cookies & Tracking</h2>
              </div>

              <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience, analyse platform usage,
                and support our marketing efforts. Cookies are small text files stored on your device when you visit
                our website.
              </p>
              <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                For detailed information about the types of cookies we use, how to manage your cookie preferences,
                and third-party cookies, please see our full{" "}
                <Link href="/cookie-policy" className="text-[#00BFA6] hover:underline inline-flex items-center">
                  Cookie Policy <ExternalLink className="h-3 w-3 ml-1" />
                </Link>.
              </p>
            </div>
          </div>

          {/* Section 7: Marketing Communications & Spam Act */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Bell className="h-8 w-8 text-[#2196F3] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">7. Marketing Communications</h2>
              </div>
              <p className="text-[#9CA3AF] mb-6 text-sm">Spam Act 2003 (Cth) &amp; Unsolicited Electronic Messages Act 2007 (NZ)</p>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Consent & Opt-In</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    We comply with the Spam Act 2003 (Cth) and the Unsolicited Electronic Messages Act 2007 (NZ).
                    We will only send you commercial electronic messages (marketing emails, SMS, or similar) where:
                  </p>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      You have provided express or inferred consent
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      The message clearly identifies us as the sender
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      The message includes a functional unsubscribe mechanism
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Opting Out</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    You may opt out of receiving marketing communications at any time by:
                  </p>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#FF9800] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Clicking the &quot;unsubscribe&quot; link in any marketing email
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#FF9800] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Updating your communication preferences in your account settings
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#FF9800] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <Link href="/contact" className="text-[#00BFA6] hover:underline">Contacting our privacy team online</Link>
                    </li>
                  </ul>
                  <p className="text-[#9CA3AF] mt-4 text-sm leading-relaxed">
                    We will process opt-out requests within 5 business days. Please note that opting out of marketing
                    communications does not affect transactional messages related to your account or active projects.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 8: Children's Privacy */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <UserX className="h-8 w-8 text-[#FF4444] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">8. Children&apos;s Privacy</h2>
              </div>

              <p className="text-[#9CA3AF] leading-relaxed">
                Our platform is not intended for use by individuals under 16 years of age. We do not knowingly collect
                personal information from children under 16. If we become aware that we have inadvertently collected
                personal information from a child under 16, we will take immediate steps to delete that information
                from our records. If you believe we may have collected information from a child under 16, please
                <Link href="/contact" className="text-[#00BFA6] hover:underline">contact our privacy team online</Link>.
              </p>
            </div>
          </div>

          {/* Section 9: Your Rights (APP 12-13 / IPP 6-7) */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <FileText className="h-8 w-8 text-[#FF9800] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">9. Your Privacy Rights</h2>
              </div>
              <p className="text-[#9CA3AF] mb-6 text-sm">APP 12–13 — Access &amp; Correction | IPP 6–7</p>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Australian Users</h3>
                  <p className="text-[#9CA3AF] mb-4 text-sm leading-relaxed">
                    Under the Australian Privacy Principles, you have the right to:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="w-2 h-2 bg-[#FF9800] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <div>
                        <p className="text-white font-medium">Access Your Data (APP 12)</p>
                        <p className="text-[#9CA3AF] text-sm">Request access to the personal information we hold about you</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="w-2 h-2 bg-[#FF9800] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <div>
                        <p className="text-white font-medium">Correct Information (APP 13)</p>
                        <p className="text-[#9CA3AF] text-sm">Request correction of inaccurate, incomplete, or out-of-date information</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="w-2 h-2 bg-[#FF9800] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <div>
                        <p className="text-white font-medium">Complain (APP 1)</p>
                        <p className="text-[#9CA3AF] text-sm">
                          Lodge a complaint with us or with the Office of the Australian Information Commissioner
                          (OAIC) at www.oaic.gov.au
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="w-2 h-2 bg-[#FF9800] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <div>
                        <p className="text-white font-medium">Delete Account</p>
                        <p className="text-[#9CA3AF] text-sm">Request deletion of your account and associated personal information</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="w-2 h-2 bg-[#FF9800] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <div>
                        <p className="text-white font-medium">Opt Out of Marketing</p>
                        <p className="text-[#9CA3AF] text-sm">Unsubscribe from marketing communications at any time</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">New Zealand Users</h3>
                  <p className="text-[#9CA3AF] mb-4 text-sm leading-relaxed">
                    Under the New Zealand Privacy Act 2020, you additionally have the right to:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="w-2 h-2 bg-[#2196F3] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <div>
                        <p className="text-white font-medium">Access Your Information (IPP 6)</p>
                        <p className="text-[#9CA3AF] text-sm">Request confirmation of whether we hold information about you and access to it</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="w-2 h-2 bg-[#2196F3] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <div>
                        <p className="text-white font-medium">Request Correction (IPP 7)</p>
                        <p className="text-[#9CA3AF] text-sm">Request correction of personal information that is inaccurate, misleading, or incomplete</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="w-2 h-2 bg-[#2196F3] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <div>
                        <p className="text-white font-medium">Complain to NZ Privacy Commissioner</p>
                        <p className="text-[#9CA3AF] text-sm">
                          Lodge a complaint with the Privacy Commissioner of New Zealand at www.privacy.org.nz
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="w-2 h-2 bg-[#2196F3] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <div>
                        <p className="text-white font-medium">Notifiable Privacy Breaches</p>
                        <p className="text-[#9CA3AF] text-sm">
                          We will notify affected individuals and the NZ Privacy Commissioner of any notifiable
                          privacy breach as required by Part 6 of the Privacy Act 2020
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-[#9CA3AF] text-sm leading-relaxed">
                  We will respond to access and correction requests within 20 business days (Australia) or 20 working
                  days (New Zealand). In limited circumstances, we may refuse a request, but we will provide written
                  reasons for the refusal.
                </p>
              </div>
            </div>
          </div>

          {/* Section 10: Complaints & Contact */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Mail className="h-8 w-8 text-[#00BFA6] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">10. Privacy Complaints & Contact</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Contact Our Privacy Team</h3>
                  <div className="space-y-4">
                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <div className="flex items-center mb-2">
                        <Mail className="h-5 w-5 text-[#00BFA6] mr-2" />
                        <span className="text-white font-medium">Privacy Inquiries</span>
                      </div>
                      <Link href="/contact" className="text-[#00BFA6] hover:underline">Contact our privacy team online</Link>
                      <p className="text-[#9CA3AF] text-sm mt-1">For privacy questions, access requests, or complaints</p>
                    </div>

                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <div className="flex items-center mb-2">
                        <Mail className="h-5 w-5 text-[#2196F3] mr-2" />
                        <span className="text-white font-medium">General Inquiries</span>
                      </div>
                      <Link href="/contact" className="text-[#00BFA6] hover:underline">Contact us online</Link>
                    </div>

                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <div className="flex items-center mb-2">
                        <Globe className="h-5 w-5 text-[#2196F3] mr-2" />
                        <span className="text-white font-medium">Entity</span>
                      </div>
                      <p className="text-[#9CA3AF] text-sm">
                        Privacy Officer
                        <br />
                        Disaster Recovery Pty Ltd
                        <br />
                        Australia-wide · AI-automated online
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Complaints Process</h3>
                  <div className="space-y-4">
                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <p className="text-white font-medium mb-2">Step 1: Contact Us</p>
                      <p className="text-[#9CA3AF] text-sm">
                        <Link href="/contact" className="text-[#00BFA6] hover:underline">Contact our privacy team online</Link>. We will acknowledge receipt
                        within 2 business days.
                      </p>
                    </div>
                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <p className="text-white font-medium mb-2">Step 2: Investigation</p>
                      <p className="text-[#9CA3AF] text-sm">
                        We will investigate your complaint and provide a response within 30 days.
                      </p>
                    </div>
                    <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                      <p className="text-white font-medium mb-2">Step 3: External Review</p>
                      <p className="text-[#9CA3AF] text-sm">
                        If unsatisfied, you may complain to the OAIC (Australia) at www.oaic.gov.au or the
                        Privacy Commissioner (NZ) at www.privacy.org.nz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Updates Notice */}
          <div className="mb-16">
            <div className="bg-[#FF9800]/10 rounded-2xl p-6 border border-[#FF9800]/30">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-[#FF9800] mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-poppins font-semibold text-lg text-white mb-2">Policy Updates</h3>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">
                    We may update this Privacy Policy from time to time to reflect changes in our practices,
                    technology, or legal requirements. Material changes will be notified via email or a prominent
                    notice on the platform at least 14 days before they take effect. The &quot;Last updated&quot; date at the
                    top of this page indicates when this policy was last revised. We encourage you to review this
                    policy periodically.
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
