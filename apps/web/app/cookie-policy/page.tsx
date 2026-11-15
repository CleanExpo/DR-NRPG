import { SITE_URL } from "@/lib/seo/site-url"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Cookie, Shield, BarChart3, Megaphone, Settings, Globe, AlertTriangle, ExternalLink } from "lucide-react"
import Link from "next/link"
import { schemaGenerator } from "@/lib/seo/schema-generator"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | NRPG — Disaster Recovery Australia',
  description: 'Cookie Policy for disasterrecovery.com.au. Explains how Disaster Recovery Pty Ltd uses cookies and similar technologies, and how to manage your cookie preferences.',
  alternates: {
    canonical: `${SITE_URL}/cookie-policy`,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CookiePolicyPage() {
  const faqSchema = schemaGenerator.generateFAQSchema([
    {
      question: 'What cookies does this site use?',
      answer: 'We use essential cookies that the site needs to work and, only if you agree, Google Analytics cookies that count visits to our public pages. We do not use marketing or advertising cookies.',
    },
    {
      question: 'Can I disable cookies?',
      answer: 'Yes. Use the "Cookie settings" link at the foot of each page to turn analytics cookies on or off at any time, or use your browser settings. Blocking essential cookies may stop parts of the platform from working.',
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
              Cookie <span className="gradient-text-teal-purple">Policy</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-4">
              This policy explains how we use cookies and similar technologies on our platform.
            </p>
            <p className="text-[#9CA3AF]">Last updated: 15 November 2026</p>
          </div>

          {/* Introduction */}
          <div className="mb-12">
            <div className="bg-[#00BFA6]/10 rounded-2xl p-6 border border-[#00BFA6]/30">
              <div className="flex items-start">
                <Cookie className="h-6 w-6 text-[#00BFA6] mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-poppins font-semibold text-lg text-white mb-2">What Are Cookies?</h3>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">
                    Cookies are small text files placed on your device (computer, tablet, or mobile) when you visit
                    a website. They are widely used to make websites work more efficiently, provide a better user
                    experience, and supply information to the site owners. This policy applies to{" "}
                    <strong className="text-white">Disaster Recovery Pty Ltd</strong>, trading as &quot;Disaster Recovery&quot;,
                    &quot;NRPG&quot;, and &quot;Restore Assist&quot;.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Essential Cookies */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Shield className="h-8 w-8 text-[#00BFA6] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">1. Essential Cookies</h2>
              </div>

              <p className="text-[#9CA3AF] mb-6 leading-relaxed">
                Essential cookies are strictly necessary for the operation of our platform. They enable core
                functionality such as security, account authentication, and session management. These cookies
                cannot be disabled without significantly affecting your use of the platform.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#374151]">
                      <th className="text-left py-3 px-4 text-white font-semibold">Cookie</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">Purpose</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#9CA3AF]">
                    <tr className="border-b border-[#374151]/50">
                      <td className="py-3 px-4 text-[#00BFA6]">session_id</td>
                      <td className="py-3 px-4">Maintains your authenticated session</td>
                      <td className="py-3 px-4">Session</td>
                    </tr>
                    <tr className="border-b border-[#374151]/50">
                      <td className="py-3 px-4 text-[#00BFA6]">csrf_token</td>
                      <td className="py-3 px-4">Protects against cross-site request forgery attacks</td>
                      <td className="py-3 px-4">Session</td>
                    </tr>
                    <tr className="border-b border-[#374151]/50">
                      <td className="py-3 px-4 text-[#00BFA6]">nrpg_cookie_consent</td>
                      <td className="py-3 px-4">
                        Remembers your cookie choice and when you made it. Kept in your browser&apos;s local
                        storage, not as a cookie
                      </td>
                      <td className="py-3 px-4">
                        Until you change it or clear your browser storage. We ask again if this notice changes
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-[#00BFA6]">next-auth.*</td>
                      <td className="py-3 px-4">Authentication state management (NextAuth.js)</td>
                      <td className="py-3 px-4">Session / 30 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 2: Analytics Cookies */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <BarChart3 className="h-8 w-8 text-[#2196F3] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">2. Analytics Cookies</h2>
              </div>

              <p className="text-[#9CA3AF] mb-6 leading-relaxed">
                Analytics cookies let us count visits to our public pages and see which of those pages are used.
                They are set only if you agree. They hold a random identifier for your browser, not your name or
                contact details. These cookies are optional and are off until you turn them on.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#374151]">
                      <th className="text-left py-3 px-4 text-white font-semibold">Cookie</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">Provider</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">Purpose</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#9CA3AF]">
                    <tr className="border-b border-[#374151]/50">
                      <td className="py-3 px-4 text-[#2196F3]">nrpg_ga</td>
                      <td className="py-3 px-4">Google Analytics 4</td>
                      <td className="py-3 px-4">Tells one browser from another</td>
                      <td className="py-3 px-4">12 months</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-[#2196F3]">nrpg_ga_*</td>
                      <td className="py-3 px-4">Google Analytics 4</td>
                      <td className="py-3 px-4">Keeps the pages of one visit together</td>
                      <td className="py-3 px-4">12 months</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-[#9CA3AF] mt-4 text-sm leading-relaxed">
                Google Analytics is provided by Google, which may process this data outside Australia,
                including in the United States, under Google&apos;s privacy policy. When your browser contacts
                Google it shares your IP address, as it does with any website it loads from. We count visits to
                our public pages only. We do not send Google your name, email address, phone number or the
                details of a claim.
              </p>
              <p className="text-[#9CA3AF] mt-4 text-sm leading-relaxed">
                If you turn analytics cookies off, we stop sending data to Google from then on and remove the
                analytics cookies from this browser. Turning them off does not delete what Google already holds.
              </p>
            </div>
          </div>

          {/* Section 3: Marketing Cookies */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Megaphone className="h-8 w-8 text-[#7C4DFF] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">3. Marketing Cookies</h2>
              </div>

              <p className="text-[#9CA3AF] leading-relaxed">
                We do not use marketing or advertising cookies. This site does not set cookies for Meta
                (Facebook), Google Ads or any other advertising service, and we do not use cookies to follow
                you across other websites. If that ever changes, we will update this policy and ask for your
                consent first.
              </p>
            </div>
          </div>

          {/* Section 4: Third-Party Cookies */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Globe className="h-8 w-8 text-[#FF9800] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">4. Third-Party Cookies</h2>
              </div>

              <p className="text-[#9CA3AF] mb-6 leading-relaxed">
                Some third-party services integrated into our platform may set their own cookies. We do not
                control these cookies. The following third-party services may place cookies on your device:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#0F1115] rounded-lg p-6 border border-[#374151]">
                  <h3 className="font-semibold text-white mb-3">Google Analytics</h3>
                  <p className="text-[#9CA3AF] text-sm mb-3">
                    Used to count visits to our public pages, and only if you agree. See section 2.
                  </p>
                  <p className="text-[#9CA3AF] text-sm">
                    Privacy policy:{" "}
                    <span className="text-[#00BFA6]">policies.google.com/privacy</span>
                  </p>
                </div>

                <div className="bg-[#0F1115] rounded-lg p-6 border border-[#374151]">
                  <h3 className="font-semibold text-white mb-3">Stripe</h3>
                  <p className="text-[#9CA3AF] text-sm mb-3">
                    Used for secure payment processing. Stripe may set cookies for fraud prevention and
                    payment session management.
                  </p>
                  <p className="text-[#9CA3AF] text-sm">
                    Privacy policy:{" "}
                    <span className="text-[#00BFA6]">stripe.com/privacy</span>
                  </p>
                </div>

                <div className="bg-[#0F1115] rounded-lg p-6 border border-[#374151]">
                  <h3 className="font-semibold text-white mb-3">Vercel</h3>
                  <p className="text-[#9CA3AF] text-sm mb-3">
                    Our hosting provider may set performance-related cookies for content delivery optimisation.
                  </p>
                  <p className="text-[#9CA3AF] text-sm">
                    Privacy policy:{" "}
                    <span className="text-[#00BFA6]">vercel.com/legal/privacy-policy</span>
                  </p>
                </div>

                <div className="bg-[#0F1115] rounded-lg p-6 border border-[#374151]">
                  <h3 className="font-semibold text-white mb-3">Supabase</h3>
                  <p className="text-[#9CA3AF] text-sm mb-3">
                    Our database provider may set cookies for authentication and session management.
                  </p>
                  <p className="text-[#9CA3AF] text-sm">
                    Privacy policy:{" "}
                    <span className="text-[#00BFA6]">supabase.com/privacy</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Managing Your Cookie Preferences */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Settings className="h-8 w-8 text-[#00BFA6] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">5. Managing Your Cookies</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Cookie Consent</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    When you first visit our platform, you will be presented with a cookie consent banner
                    allowing you to accept or decline analytics cookies. You can change your choice at any
                    time through:
                  </p>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      The &quot;Cookie settings&quot; link at the foot of each page
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#00BFA6] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <Link href="/contact" className="text-[#00BFA6] hover:underline">Contacting us online</Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Browser Settings</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    You can also control cookies through your browser settings. Most browsers allow you to:
                  </p>
                  <ul className="space-y-2 text-[#9CA3AF] text-sm">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2196F3] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      View and delete existing cookies
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2196F3] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Block all cookies or specific third-party cookies
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2196F3] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Set preferences for specific websites
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#2196F3] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Receive notifications when cookies are being set
                    </li>
                  </ul>
                  <div className="bg-[#FF9800]/10 rounded-lg p-4 border border-[#FF9800]/30 mt-4">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-4 w-4 text-[#FF9800] mr-2" />
                      <span className="text-white font-medium text-sm">Please Note</span>
                    </div>
                    <p className="text-[#9CA3AF] text-xs">
                      Blocking essential cookies may affect the functionality of our platform, including your
                      ability to log in, manage projects, or process payments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Google Analytics Opt-Out */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <BarChart3 className="h-8 w-8 text-[#FF4444] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">6. Google Analytics Opt-Out</h2>
              </div>

              <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                If you wish to opt out of Google Analytics tracking specifically, you can install the Google
                Analytics Opt-out Browser Add-on, which is available for most major browsers. This add-on
                prevents Google Analytics JavaScript (ga.js, analytics.js, and gtag.js) from sharing
                information with Google Analytics about your visit activity.
              </p>
              <p className="text-[#9CA3AF] text-sm leading-relaxed">
                You can also opt out by declining analytics cookies in our cookie banner when you first visit,
                or at any time through the &quot;Cookie settings&quot; link at the foot of each page.
              </p>
            </div>
          </div>

          {/* Contact & Related Policies */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Shield className="h-8 w-8 text-[#00BFA6] mr-4" />
                <h2 className="font-poppins font-bold text-3xl text-white">Questions & Related Policies</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Contact Us</h3>
                  <p className="text-[#9CA3AF] mb-4 leading-relaxed">
                    If you have questions about our use of cookies, please contact us:
                  </p>
                  <div className="bg-[#0F1115] rounded-lg p-4 border border-[#374151]">
                    <Link href="/contact" className="text-[#00BFA6] hover:underline">Contact our privacy team online</Link>
                    <p className="text-[#9CA3AF] text-sm mt-2">
                      Disaster Recovery Pty Ltd
                      <br />
                      Australia-wide · AI-automated online
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-4">Related Policies</h3>
                  <div className="space-y-3">
                    <Link href="/privacy" className="block bg-[#0F1115] rounded-lg p-4 border border-[#374151] hover:border-[#00BFA6] transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">Privacy Policy</span>
                        <ExternalLink className="h-4 w-4 text-[#00BFA6]" />
                      </div>
                      <p className="text-[#9CA3AF] text-sm mt-1">How we collect, use, and protect your personal information</p>
                    </Link>
                    <Link href="/terms" className="block bg-[#0F1115] rounded-lg p-4 border border-[#374151] hover:border-[#00BFA6] transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">Terms of Service</span>
                        <ExternalLink className="h-4 w-4 text-[#00BFA6]" />
                      </div>
                      <p className="text-[#9CA3AF] text-sm mt-1">Our terms and conditions for using the platform</p>
                    </Link>
                  </div>
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
