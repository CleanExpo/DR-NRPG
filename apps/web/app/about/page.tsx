import type { Metadata } from 'next'
import Header from "@/components/header"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: 'About NRPG | Australia\'s Disaster Recovery Platform',
  description: 'NRPG is Australia and New Zealand\'s certified disaster recovery contractor network — connecting property owners with IICRC-certified restoration professionals.',
  alternates: {
    canonical: 'https://nrpg.business/about',
  },
  openGraph: {
    title: 'About NRPG — Disaster Recovery Australia',
    description: 'The platform connecting property owners with IICRC-certified restoration contractors across Australia and New Zealand.',
    url: 'https://disasterrecovery.com.au/about',
    siteName: 'NRPG — Disaster Recovery Australia',
    type: 'website',
    locale: 'en_AU',
  },
}
import { Users, Award, Target, MapPin, TrendingUp, Heart, Star, Building2, Zap, Globe, Code, BarChart3, Smartphone, Shield } from "lucide-react"
import { VerifiedBadge, IICRCBadge, ScheduleCalendar } from "@/icons"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <Header />
      <main className="py-24">
        <div className="container mx-auto px-6">
          <section className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              🚀 Advanced Restoration Marketplace Platform
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-5xl text-balance mb-8">
              About <span className="text-[#00BFA6]">NRPG Marketplace Platform</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] max-w-4xl mx-auto mb-8">
              We're building an advanced restoration marketplace platform - a comprehensive SaaS solution that connects property owners with verified contractors through transparent pricing, automated workflows, and real-time project tracking. Our white-label platform is designed for scale and growth.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-[#00BFA6]">Coming Soon</div>
                <div className="text-[#9CA3AF]">MVP Launch</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#2196F3]">September 2025</div>
                <div className="text-[#9CA3AF]">Development Started</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#FFD700]">April 2026</div>
                <div className="text-[#9CA3AF]">Expected Launch</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#7C4DFF]">50+</div>
                <div className="text-[#9CA3AF]">Planned Integrations</div>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
                <IICRCBadge size="lg" gradient="primary" className="mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-2xl text-white mb-4">Our Mission</h3>
                <p className="text-[#9CA3AF] leading-relaxed mb-4">
                  To revolutionize the restoration industry through our marketplace-as-a-service platform, providing transparency, reliability, and trust between clients and contractors through innovative technology solutions and automated workflows.
                </p>
                <ul className="text-[#9CA3AF] space-y-2">
                  <li>• Building scalable marketplace technology</li>
                  <li>• Enabling white-label platform licensing</li>
                  <li>• Automating restoration workflows</li>
                  <li>• Maintaining highest industry standards</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
                <Target className="h-12 w-12 text-[#2196F3] mb-4" />
                <h3 className="font-poppins font-semibold text-2xl text-white mb-4">Our Vision</h3>
                <p className="text-[#9CA3AF] leading-relaxed mb-4">
                  To become the leading restoration marketplace platform provider globally, enabling other companies to launch their own restoration marketplaces through our white-label SaaS solution.
                </p>
                <ul className="text-[#9CA3AF] space-y-2">
                  <li>• Global platform expansion</li>
                  <li>• White-label marketplace licensing</li>
                  <li>• Industry standardization</li>
                  <li>• Technology innovation leadership</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Leadership Team Section */}
          <section className="mb-16">
            <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">Leadership Team</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151] text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#00BFA6] to-[#00A693] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-[#0F1115] font-bold text-2xl">PM</span>
                </div>
                <h3 className="font-poppins font-semibold text-xl text-white mb-2">Phil McGurk</h3>
                <p className="text-[#00BFA6] font-medium mb-4">Chief Executive Officer</p>
                <p className="text-[#9CA3AF] text-sm leading-relaxed">
                  Phil leads NRPG's strategic vision and growth initiatives, bringing over 15 years of experience in marketplace technology and business development to drive platform expansion across Australia.
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151] text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#2196F3] to-[#1976D2] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">CB</span>
                </div>
                <h3 className="font-poppins font-semibold text-xl text-white mb-2">Claire Booth</h3>
                <p className="text-[#2196F3] font-medium mb-4">Chief Marketing Officer</p>
                <p className="text-[#9CA3AF] text-sm leading-relaxed">
                  Claire oversees brand strategy and customer acquisition, leveraging her expertise in digital marketing and growth hacking to scale our marketplace platform and contractor network.
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151] text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#7C4DFF] to-[#6A1B9A] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">RM</span>
                </div>
                <h3 className="font-poppins font-semibold text-xl text-white mb-2">Rana Muzamil</h3>
                <p className="text-[#7C4DFF] font-medium mb-4">Chief Technology Officer</p>
                <p className="text-[#9CA3AF] text-sm leading-relaxed">
                  Rana architects our marketplace platform technology, leading the development of our white-label SaaS solution, smart matching algorithms, and scalable infrastructure.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">Our Platform Journey</h2>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#00BFA6] rounded-full flex items-center justify-center">
                      <ScheduleCalendar size="md" className="text-[#0F1115]" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-poppins font-semibold text-xl text-white mb-2">September 2025 - Platform Development Begins</h3>
                    <p className="text-[#9CA3AF]">
                      Started development of our comprehensive marketplace platform for the restoration industry. Building core matching algorithms, workflow automation technology, and multi-tenant architecture from the ground up.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#2196F3] rounded-full flex items-center justify-center">
                      <Code className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-poppins font-semibold text-xl text-white mb-2">April 2026 - MVP Launch</h3>
                    <p className="text-[#9CA3AF]">
                      Launching our MVP marketplace platform with smart contractor matching, automated workflows, and real-time project tracking. Initial focus on connecting property owners with verified restoration contractors across Australia.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-[#0F1115]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-poppins font-semibold text-xl text-white mb-2">
                      October 2025 - Platform Enhancement
                    </h3>
                    <p className="text-[#9CA3AF]">
                      Adding advanced features including mobile app, enhanced analytics dashboard, and automated payment processing. Expanding contractor network and implementing quality assurance systems.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#7C4DFF] rounded-full flex items-center justify-center">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-poppins font-semibold text-xl text-white mb-2">November 2025 - White-Label Launch</h3>
                    <p className="text-[#9CA3AF]">
                      Launching white-label marketplace platform capabilities, enabling other companies to license our technology. Introducing partnership programs and expanding to major Australian cities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#FF6B35] rounded-full flex items-center justify-center">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-poppins font-semibold text-xl text-white mb-2">2026 - Global Platform Vision</h3>
                    <p className="text-[#9CA3AF]">
                      Expanding globally with advanced platform features including AI insights, predictive analytics, and enterprise solutions. Building towards becoming the leading restoration marketplace platform worldwide.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Platform Capabilities Section */}
          <section className="mb-16">
            <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">Platform Capabilities</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
                <Zap className="h-12 w-12 text-[#00BFA6] mx-auto mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">Smart Contractor Matching</h3>
                <p className="text-[#9CA3AF] text-sm">
                  Advanced algorithms match clients with the most qualified contractors based on location, expertise, and availability
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
                <Building2 className="h-12 w-12 text-[#2196F3] mx-auto mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">White-Label Ready</h3>
                <p className="text-[#9CA3AF] text-sm">
                  Fully customizable platform that can be rebranded and licensed to other restoration companies
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
                <BarChart3 className="h-12 w-12 text-[#7C4DFF] mx-auto mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">Analytics Dashboard</h3>
                <p className="text-[#9CA3AF] text-sm">
                  Comprehensive insights into performance, revenue, and growth opportunities for all stakeholders
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
                <Smartphone className="h-12 w-12 text-[#FF6B35] mx-auto mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">Mobile-First Design</h3>
                <p className="text-[#9CA3AF] text-sm">
                  Responsive platform optimized for mobile devices with native app capabilities
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
                <Globe className="h-12 w-12 text-[#FFD700] mx-auto mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">Multi-Tenant Architecture</h3>
                <p className="text-[#9CA3AF] text-sm">
                  Scalable infrastructure supporting multiple companies and markets simultaneously
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
                <Shield className="h-12 w-12 text-[#00BFA6] mx-auto mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">Enterprise Security</h3>
                <p className="text-[#9CA3AF] text-sm">
                  Bank-level security with compliance monitoring and data protection
                </p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">Our Core Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
                <IICRCBadge size="lg" gradient="primary" className="mx-auto mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">Trust</h3>
                <p className="text-[#9CA3AF] text-sm">
                  Building lasting relationships through transparency and reliability
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
                <Award className="h-12 w-12 text-[#2196F3] mx-auto mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">Excellence</h3>
                <p className="text-[#9CA3AF] text-sm">
                  Maintaining the highest standards in every project we facilitate
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
                <Users className="h-12 w-12 text-[#00BFA6] mx-auto mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">Community</h3>
                <p className="text-[#9CA3AF] text-sm">Supporting local contractors and strengthening communities</p>
              </div>

              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
                <Heart className="h-12 w-12 text-[#FF6B35] mx-auto mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">Care</h3>
                <p className="text-[#9CA3AF] text-sm">Genuinely caring about every customer's restoration journey</p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">Why Choose NRPG?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <VerifiedBadge size="lg" gradient="primary" className="mt-1 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-semibold text-xl text-white mb-2">Independently Verified Contractors</h4>
                    <p className="text-[#9CA3AF] leading-relaxed">
                      Every contractor independently holds their own IICRC certification, trade licences, and business insurance — verified through a proprietary onboarding process with no equivalent in Australia or New Zealand.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <VerifiedBadge size="lg" gradient="primary" className="mt-1 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-semibold text-xl text-white mb-2">Quality Assurance</h4>
                    <p className="text-[#9CA3AF] leading-relaxed">
                      Every project is monitored for quality and compliance with Australian building standards and
                      regulations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <VerifiedBadge size="lg" gradient="primary" className="mt-1 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-semibold text-xl text-white mb-2">Transparent Pricing</h4>
                    <p className="text-[#9CA3AF] leading-relaxed">
                      No hidden fees or surprises. Get clear, competitive quotes from multiple contractors.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <VerifiedBadge size="lg" gradient="primary" className="mt-1 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-semibold text-xl text-white mb-2">Professional Documentation</h4>
                    <p className="text-[#9CA3AF] leading-relaxed">
                      IICRC-standard scope of works, reports, and estimates — professional documentation prepared by independently credentialled restoration specialists.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <VerifiedBadge size="lg" gradient="primary" className="mt-1 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-semibold text-xl text-white mb-2">24/7 Emergency Response</h4>
                    <p className="text-[#9CA3AF] leading-relaxed">
                      Round-the-clock emergency services for urgent restoration needs across Australia and New Zealand.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <VerifiedBadge size="lg" gradient="primary" className="mt-1 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="font-semibold text-xl text-white mb-2">Project Management</h4>
                    <p className="text-[#9CA3AF] leading-relaxed">
                      Dedicated project management support to ensure timely completion and quality results.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
              Get In Touch
            </h2>
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151] text-center">
                <IICRCBadge size="lg" gradient="primary" className="mb-6 mx-auto" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-2xl text-white mb-4">Request Emergency Service</h3>
                <p className="text-[#00BFA6] text-sm mb-4">Contact us for 24/7 emergency restoration</p>
                <p className="text-[#9CA3AF] text-sm">Available 24/7 for emergency restoration services in major Australian cities</p>
              </div>
            </div>
          </section>

          {/* Unite Group Section */}
          <section className="text-center">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-12 border border-[#374151]">
              <h2 className="font-poppins font-semibold text-3xl text-white mb-6">Powered by Unite Group Australia</h2>
              <p className="text-[#9CA3AF] leading-relaxed max-w-3xl mx-auto">
                NRPG is proudly developed and operated by Unite Group Australia, a technology company specializing in marketplace platforms and SaaS solutions. Unite Group brings enterprise-level technology and scalable infrastructure to power our restoration marketplace platform.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
