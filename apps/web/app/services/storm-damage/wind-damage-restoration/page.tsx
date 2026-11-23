import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, CloudLightning, Shield, ArrowRight, Wind, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Wind Damage Restoration | Storm Damage Restoration Australia",
  description: "Professional wind damage restoration services across Australia. Qualified teams provide emergency securing, structural bracing, cladding repair, and full property restoration. 24/7 response.",
  keywords: ['wind damage restoration', 'wind damage repair', 'storm wind damage', 'cyclone damage', 'structural wind damage', 'Australia'],
  slug: 'wind-damage-restoration',
  parentSlug: 'storm-damage',
  parentName: 'Storm Damage',
  serviceName: 'Wind Damage Restoration',
})

const processSteps = [
  {
    step: "01",
    title: "Safety Assessment & Securing",
    description:
      "Immediate site safety evaluation to identify hazards including unstable structures, fallen powerlines, and debris. Emergency board-up and securing of exposed openings to prevent further damage.",
  },
  {
    step: "02",
    title: "Structural Damage Evaluation",
    description:
      "Comprehensive structural inspection by qualified engineers to assess wind damage to walls, roof framing, cladding, and foundations. Detailed documentation for insurance purposes.",
  },
  {
    step: "03",
    title: "Wind Damage Remediation",
    description:
      "Professional repair of all wind-damaged elements including structural bracing, cladding replacement, window and door restoration, and boundary fence reconstruction.",
  },
  {
    step: "04",
    title: "Restoration & Reinforcement",
    description:
      "Complete property restoration to pre-storm condition with enhanced wind-resistance upgrades where possible. Final inspection, compliance certification, and warranty handover.",
  },
]

const features = [
  {
    title: "Window & Door Board-Up",
    description:
      "Emergency securing of blown-out windows and doors with heavy-duty boarding to prevent water ingress, debris entry, and security breaches.",
  },
  {
    title: "Structural Bracing",
    description:
      "Temporary and permanent structural bracing for wind-weakened walls, roof frames, and load-bearing elements to prevent collapse.",
  },
  {
    title: "Fence & Boundary Repair",
    description:
      "Complete reconstruction of wind-damaged fences, retaining walls, and boundary structures using compliant materials and methods.",
  },
  {
    title: "Cladding & Render Repair",
    description:
      "Professional repair and replacement of blown-off cladding, cracked render, and damaged exterior finishes to restore weatherproofing.",
  },
  {
    title: "Tree Impact Damage",
    description:
      "Specialist repair of structural damage caused by wind-blown trees and branches impacting roofs, walls, and other structures.",
  },
  {
    title: "Debris Removal & Cleanup",
    description:
      "Comprehensive site cleanup including removal of wind-scattered debris, damaged materials, and hazardous items from your property.",
  },
]

const faqs = [
  {
    question: "What wind speed causes structural damage?",
    answer:
      "Wind damage can begin at speeds as low as 63 km/h (gale force), which can dislodge loose items and damage fences. Storm force winds of 88 to 117 km/h cause significant structural damage including roof lifting and cladding removal. Cyclonic winds above 118 km/h can cause catastrophic damage.",
  },
  {
    question: "Is wind damage covered by home insurance?",
    answer:
      "Most standard home insurance policies cover wind and storm damage. However, coverage can vary between insurers and policy types. Our team provides detailed documentation, structural reports, and photographic evidence to support your insurance claim and maximise your entitlements.",
  },
  {
    question: "What is the difference between cyclone and storm damage?",
    answer:
      "Cyclone damage is caused by sustained winds exceeding 118 km/h with associated heavy rainfall and storm surge. Standard storm damage involves severe weather events with lower wind speeds. Both are typically covered by insurance, though cyclone-prone areas may have specific policy conditions.",
  },
  {
    question: "How should I prepare my property for high winds?",
    answer:
      "Secure loose outdoor items, trim overhanging branches, check roof fixings and flashing, ensure gutters are clear, and reinforce garage doors. For cyclone-prone areas, install approved window shutters and ensure your property meets current building codes for wind resistance.",
  },
  {
    question: "What temporary securing options are available after wind damage?",
    answer:
      "We provide emergency board-up for windows and doors, temporary roofing with heavy-duty tarps, structural bracing for weakened walls, and debris clearance to make your property safe. These measures are deployed within hours and protect your property until permanent repairs are completed.",
  },
]

const relatedServices = [
  {
    title: "Roof Storm Damage Repair",
    href: "/services/storm-damage/roof-storm-damage",
    description: "Emergency tarping, tile and metal roof repair, and structural assessment.",
  },
  {
    title: "Hail Damage Repair",
    href: "/services/storm-damage/hail-damage-repair",
    description: "Roof tile replacement, dent repair, and exterior restoration after hail.",
  },
  {
    title: "Tree Damage Cleanup",
    href: "/services/storm-damage/tree-damage-cleanup",
    description: "Emergency tree removal, structural repair, and full property restoration.",
  },
  {
    title: "Emergency Roof Tarping",
    href: "/services/storm-damage/emergency-roof-tarping",
    description: "Rapid 2-hour tarp deployment to protect your property from water ingress.",
  },
]

export default function WindDamageRestorationPage() {
  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <Header />
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateServiceSchemas({
  title: metadata.title as string,
  description: metadata.description as string,
  keywords: [],
  slug: 'wind-damage-restoration',
  parentSlug: 'storm-damage',
  parentName: 'Storm Damage',
  serviceName: 'Wind Damage Restoration',
  faqs,
})) }}
      />
      <main className="py-24">
        {/* Breadcrumb */}
        <section className="container mx-auto px-6 mb-8">
          <Link
            href="/services/storm-damage"
            className="inline-flex items-center text-[#9CA3AF] hover:text-[#00BFA6] transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Storm Damage Services
          </Link>
        </section>

        {/* Hero Section */}
        <section className="relative overflow-hidden mb-16">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/services/storm-damage/wind-damage-restoration-hero.webp"
              alt="Wind damage restoration and structural bracing"
              fill
              priority
              className="object-cover opacity-30"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0F1115]/70 via-[#0F1115]/50 to-[#0F1115]" />
          </div>
          <div className="relative z-10 container mx-auto px-6 pt-16 pb-8">
            <div className="max-w-4xl mx-auto text-center">
            <CloudLightning className="h-16 w-16 text-[#7C4DFF] mx-auto mb-6" />
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              Qualified Contractors
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Wind Damage <span className="text-[#00BFA6]">Restoration</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8">
              Professional wind damage restoration across Australia. From emergency board-up and structural bracing
              to complete property restoration, our qualified teams respond around the clock.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                Request Emergency Service
              </Button>
              <Button
                variant="outline"
                className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] px-8 py-3 text-lg bg-transparent"
              >
                Get a Free Quote
              </Button>
            </div>
          </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="container mx-auto px-6 mb-16">
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">24/7</div>
              <div className="text-[#9CA3AF]">Emergency Response</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#2196F3] mb-2">Rated</div>
              <div className="text-[#9CA3AF]">Wind Rated Repairs</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">Full</div>
              <div className="text-[#9CA3AF]">Structural Assessment</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">SES</div>
              <div className="text-[#9CA3AF]">Coordinated Response</div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Wind Damage Restoration Process
          </h2>
          <div className="max-w-4xl mx-auto space-y-8">
            {processSteps.map((step) => (
              <div key={step.step} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full flex items-center justify-center text-[#00BFA6] font-bold">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-lg text-white mb-2">{step.title}</h3>
                  <p className="text-[#9CA3AF]">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Comprehensive Wind Damage Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]"
              >
                <Shield className="h-8 w-8 text-[#00BFA6] mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">{feature.title}</h3>
                <p className="text-[#9CA3AF] text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Warning Section */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-8 w-8 text-[#FFD700]" />
              <h2 className="font-poppins font-semibold text-2xl text-white">Wind Damage Severity Scale</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Gale force (63-87 km/h): loose items displaced, minor fence damage",
                "Storm force (88-117 km/h): roof lifting, cladding removal, tree fall",
                "Cyclone category 1-2 (118-170 km/h): significant structural damage",
                "Cyclone category 3+ (170+ km/h): catastrophic structural failure",
                "Structural assessment essential after any severe wind event",
                "Hidden damage is common and may not present immediately",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]"
              >
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">{faq.question}</h3>
                <p className="text-[#9CA3AF]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Services */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Related Storm Damage Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {relatedServices.map((service) => (
              <Link key={service.title} href={service.href}>
                <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer h-full">
                  <CloudLightning className="h-8 w-8 text-[#7C4DFF] mb-4" />
                  <h3 className="font-poppins font-semibold text-lg text-white mb-3">{service.title}</h3>
                  <p className="text-[#9CA3AF] text-sm mb-4">{service.description}</p>
                  <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Emergency CTA */}
        <section className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-[#EF4444] to-[#DC2626] rounded-2xl p-12 text-center">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-white mb-4">
              Emergency Wind Damage Restoration?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              24/7 emergency response for wind damage. Request service now for immediate structural securing.
            </p>
            <Button className="bg-white hover:bg-white/90 text-[#EF4444] font-bold text-xl px-12 py-4">
              Request Emergency Service
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
