import Header from "@/components/header"
import Footer from "@/components/footer"
import { Droplets, Flame, Wind, Zap, Shield, Clock, CheckCircle, Users } from "lucide-react"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disaster Recovery Services | NRPG Australia',
  description: 'IICRC-certified disaster recovery services across Australia — water damage, fire restoration, mould remediation, storm damage, and biohazard cleanup. Independently licensed and insured contractors, 24/7 emergency response.',
  keywords: [
    'disaster recovery services Australia',
    'water damage restoration',
    'fire damage restoration',
    'mould remediation',
    'storm damage repair',
    'biohazard cleanup',
    'IICRC certified contractors',
    'emergency restoration Australia',
  ],
  alternates: {
    canonical: 'https://nrpg.business/services',
  },
  openGraph: {
    title: 'Disaster Recovery Services | NRPG Australia',
    description: 'IICRC-certified disaster recovery services across Australia — water damage, fire restoration, mould remediation, storm damage, and biohazard cleanup.',
    url: 'https://disasterrecovery.com.au/services',
    type: 'website',
  },
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <Header />
      <main className="py-24">
        {/* Hero Section */}
        <section className="container mx-auto px-6 text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
            🏗️ Marketplace Platform Services
          </div>
          <h1 className="font-poppins font-bold text-4xl md:text-5xl text-balance mb-6">
            <span className="text-[#00BFA6]">Platform-Powered</span> Restoration Services
          </h1>
          <p className="text-xl text-[#9CA3AF] max-w-3xl mx-auto mb-8">
            Our marketplace platform connects you with verified restoration contractors through transparent pricing, automated workflows, and real-time project tracking across Australia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-poppins font-semibold text-lg px-8 py-4 rounded-lg">
              Submit Service Request
            </button>
            <button className="border border-[#2196F3] text-[#2196F3] hover:bg-[#2196F3] hover:text-white font-poppins font-semibold text-lg px-8 py-4 rounded-lg bg-transparent">
              Join as Contractor
            </button>
          </div>
        </section>

        {/* Platform Benefits Section */}
        <section className="container mx-auto px-6 mb-16">
          <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151] mb-16">
            <div className="text-center mb-8">
              <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
                Why Choose Our <span className="text-[#00BFA6]">Marketplace Platform</span>?
              </h2>
              <p className="text-[#9CA3AF] max-w-3xl mx-auto">
                Our platform revolutionizes restoration services by connecting clients and contractors through technology, transparency, and trust.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#00BFA6] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-[#0F1115]" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">Verified & Insured</h3>
                <p className="text-[#9CA3AF]">All contractors are thoroughly vetted, licensed, and insured for your peace of mind.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[#2196F3] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">Real-time Tracking</h3>
                <p className="text-[#9CA3AF]">Monitor your project progress in real-time with our advanced tracking system.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[#7C4DFF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">Transparent Pricing</h3>
                <p className="text-[#9CA3AF]">Get upfront, standardized pricing with no hidden fees or surprises.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comprehensive Service Categories Section */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Complete Restoration Solutions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <Droplets className="h-12 w-12 text-[#00BFA6] mx-auto mb-4" />
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Water Damage</h3>
              <p className="text-[#9CA3AF] text-sm mb-4">Flood cleanup, pipe bursts, and water extraction services</p>
              <ul className="text-[#9CA3AF] text-xs space-y-1">
                <li>• Emergency water extraction</li>
                <li>• Structural drying</li>
                <li>• Mould prevention</li>
                <li>• Insurance claims support</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <Flame className="h-12 w-12 text-[#FF6B35] mx-auto mb-4" />
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Fire Damage</h3>
              <p className="text-[#9CA3AF] text-sm mb-4">Smoke damage, soot removal, and fire restoration</p>
              <ul className="text-[#9CA3AF] text-xs space-y-1">
                <li>• Smoke odor removal</li>
                <li>• Soot cleaning</li>
                <li>• Structural repairs</li>
                <li>• Content restoration</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <Wind className="h-12 w-12 text-[#2196F3] mx-auto mb-4" />
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Storm Damage</h3>
              <p className="text-[#9CA3AF] text-sm mb-4">Roof repairs, wind damage, and emergency boarding</p>
              <ul className="text-[#9CA3AF] text-xs space-y-1">
                <li>• Emergency tarping</li>
                <li>• Roof repairs</li>
                <li>• Window replacement</li>
                <li>• Debris removal</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <Zap className="h-12 w-12 text-[#FFD700] mx-auto mb-4" />
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Emergency Services</h3>
              <p className="text-[#9CA3AF] text-sm mb-4">24/7 emergency response and damage mitigation</p>
              <ul className="text-[#9CA3AF] text-xs space-y-1">
                <li>• 24/7 availability</li>
                <li>• Rapid response</li>
                <li>• Damage assessment</li>
                <li>• Temporary repairs</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Specialized Services Section */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">Specialized Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <h3 className="font-poppins font-semibold text-xl text-white mb-4">Mould Remediation</h3>
              <p className="text-[#9CA3AF] mb-4">Professional mould testing, removal, and prevention services</p>
              <ul className="text-[#9CA3AF] text-sm space-y-2">
                <li>• Comprehensive mould inspection</li>
                <li>• Safe removal procedures</li>
                <li>• Air quality testing</li>
                <li>• Prevention strategies</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <h3 className="font-poppins font-semibold text-xl text-white mb-4">Asbestos Removal</h3>
              <p className="text-[#9CA3AF] mb-4">Licensed asbestos identification and safe removal services</p>
              <ul className="text-[#9CA3AF] text-sm space-y-2">
                <li>• Licensed professionals</li>
                <li>• Safe containment</li>
                <li>• Proper disposal</li>
                <li>• Clearance certificates</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <h3 className="font-poppins font-semibold text-xl text-white mb-4">Biohazard Cleanup</h3>
              <p className="text-[#9CA3AF] mb-4">Professional cleanup of hazardous biological materials</p>
              <ul className="text-[#9CA3AF] text-sm space-y-2">
                <li>• Crime scene cleanup</li>
                <li>• Trauma cleaning</li>
                <li>• Infectious disease cleanup</li>
                <li>• Odor elimination</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">How Our Marketplace Platform Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00BFA6] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#0F1115] font-bold text-xl">1</span>
              </div>
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Submit Request</h3>
              <p className="text-[#9CA3AF]">
                Submit your restoration needs through our platform and get instantly matched with verified local contractors
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#2196F3] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Smart Matching</h3>
              <p className="text-[#9CA3AF]">Our smart matching algorithm connects you with qualified contractors based on location, expertise, and availability</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Transparent Quotes</h3>
              <p className="text-[#9CA3AF]">Receive standardized, transparent quotes with no hidden fees. Compare and choose the best option for your project</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#0F1115] font-bold text-xl">4</span>
              </div>
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Track & Complete</h3>
              <p className="text-[#9CA3AF]">Monitor project progress in real-time, communicate with your contractor, and ensure quality completion</p>
            </div>
          </div>
        </section>

        {/* Service Areas Section */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Service Areas Across Australia
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <h3 className="font-poppins font-semibold text-lg text-white mb-3">New South Wales</h3>
              <ul className="text-[#9CA3AF] text-sm space-y-1">
                <li>Sydney</li>
                <li>Newcastle</li>
                <li>Wollongong</li>
                <li>Central Coast</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <h3 className="font-poppins font-semibold text-lg text-white mb-3">Victoria</h3>
              <ul className="text-[#9CA3AF] text-sm space-y-1">
                <li>Melbourne</li>
                <li>Geelong</li>
                <li>Ballarat</li>
                <li>Bendigo</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <h3 className="font-poppins font-semibold text-lg text-white mb-3">Queensland</h3>
              <ul className="text-[#9CA3AF] text-sm space-y-1">
                <li>Brisbane</li>
                <li>Gold Coast</li>
                <li>Sunshine Coast</li>
                <li>Cairns</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <h3 className="font-poppins font-semibold text-lg text-white mb-3">Other States</h3>
              <ul className="text-[#9CA3AF] text-sm space-y-1">
                <li>Perth, WA</li>
                <li>Adelaide, SA</li>
                <li>Hobart, TAS</li>
                <li>Darwin, NT</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing and Packages Section */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">Service Packages</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <h3 className="font-poppins font-semibold text-xl text-white mb-4">Emergency Response</h3>
              <div className="text-[#00BFA6] text-3xl font-bold mb-4">24/7</div>
              <ul className="text-[#9CA3AF] space-y-3 mb-6">
                <li>• Immediate response</li>
                <li>• Damage assessment</li>
                <li>• Emergency mitigation</li>
                <li>• Insurance coordination</li>
              </ul>
              <button className="w-full bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold py-3 rounded-lg">
                Get Emergency Help
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151] relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#00BFA6] text-[#0F1115] px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="font-poppins font-semibold text-xl text-white mb-4">Complete Restoration</h3>
              <div className="text-[#00BFA6] text-3xl font-bold mb-4">Full Service</div>
              <ul className="text-[#9CA3AF] space-y-3 mb-6">
                <li>• Comprehensive assessment</li>
                <li>• Full restoration service</li>
                <li>• Project management</li>
                <li>• Quality assurance</li>
              </ul>
              <button className="w-full bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold py-3 rounded-lg">
                Start Project
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <h3 className="font-poppins font-semibold text-xl text-white mb-4">Maintenance & Prevention</h3>
              <div className="text-[#00BFA6] text-3xl font-bold mb-4">Ongoing</div>
              <ul className="text-[#9CA3AF] space-y-3 mb-6">
                <li>• Regular inspections</li>
                <li>• Preventive maintenance</li>
                <li>• Early detection</li>
                <li>• Priority support</li>
              </ul>
              <button className="w-full bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold py-3 rounded-lg">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">Why Choose Our Platform</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center">
              <Shield className="h-12 w-12 text-[#00BFA6] mb-4" />
              <h3 className="font-semibold text-white mb-2">Verified Contractors</h3>
              <p className="text-[#9CA3AF] text-sm">All contractors are licensed and insured</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <Clock className="h-12 w-12 text-[#2196F3] mb-4" />
              <h3 className="font-semibold text-white mb-2">24/7 Support</h3>
              <p className="text-[#9CA3AF] text-sm">Round-the-clock customer support</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <CheckCircle className="h-12 w-12 text-[#00BFA6] mb-4" />
              <h3 className="font-semibold text-white mb-2">Quality Assurance</h3>
              <p className="text-[#9CA3AF] text-sm">Work monitored through quality checks</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <Users className="h-12 w-12 text-[#2196F3] mb-4" />
              <h3 className="font-semibold text-white mb-2">Trusted Network</h3>
              <p className="text-[#9CA3AF] text-sm">Australia's largest restoration network</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
