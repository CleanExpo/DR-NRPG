import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, CloudLightning, Shield, ArrowRight, Search, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Hail Damage Repair Services | Storm Damage Restoration Australia",
  description: "Professional hail damage repair services across Australia. Qualified specialists provide same-day assessment, roof tile replacement, metal roof repair, and full exterior restoration. Insurance claim support included.",
  keywords: ['hail damage repair', 'hail roof damage', 'hail dents', 'hail storm repair', 'hail damage restoration', 'Colorbond hail', 'Australia'],
  slug: 'hail-damage-repair',
  parentSlug: 'storm-damage',
  parentName: 'Storm Damage',
  serviceName: 'Hail Damage Repair',
})

const processSteps = [
  {
    step: "01",
    title: "Hail Damage Assessment",
    description:
      "Same-day comprehensive assessment of all hail-affected areas including roof, exterior walls, skylights, gutters, and outdoor structures. Detailed photographic documentation for insurance.",
  },
  {
    step: "02",
    title: "Roof & Exterior Inspection",
    description:
      "Thorough inspection of roofing materials for cracks, dents, and granule loss. Assessment of exterior paint, render, cladding, and all exposed surfaces for hail impact damage.",
  },
  {
    step: "03",
    title: "Repair & Replacement",
    description:
      "Professional repair or replacement of damaged tiles, metal sheeting, skylights, gutters, and exterior finishes using matching materials to restore your property to pre-storm condition.",
  },
  {
    step: "04",
    title: "Quality Verification",
    description:
      "Final quality inspection to verify all repairs meet Australian building standards. Water testing of repaired areas and full warranty documentation provided for your records and insurance file.",
  },
]

const features = [
  {
    title: "Roof Tile Replacement",
    description:
      "Expert replacement of cracked, chipped, and shattered terracotta and concrete roof tiles with colour-matched materials.",
  },
  {
    title: "Metal Roof Dent Repair",
    description:
      "Specialist dent removal and panel replacement for Colorbond and metal roofing damaged by large hailstones.",
  },
  {
    title: "Skylight Replacement",
    description:
      "Safe removal and replacement of cracked or shattered skylights with impact-resistant alternatives where available.",
  },
  {
    title: "Gutter & Downpipe Repair",
    description:
      "Repair and replacement of dented, crushed, or punctured guttering and downpipes to restore proper water drainage.",
  },
  {
    title: "Exterior Paint & Render",
    description:
      "Professional repair of hail-pitted paint, chipped render, and damaged exterior finishes to restore weatherproofing and appearance.",
  },
  {
    title: "Vehicle Damage Coordination",
    description:
      "Coordination with automotive assessors and repairers for vehicle hail damage alongside your property restoration claim.",
  },
]

const faqs = [
  {
    question: "How can I spot hail damage on my roof?",
    answer:
      "From ground level, look for cracked or displaced tiles, dented metal sheeting, damaged ridge capping, and debris in gutters. However, many forms of hail damage including micro-fractures and granule loss are not visible from the ground and require professional inspection.",
  },
  {
    question: "What is the insurance claim process for hail damage?",
    answer:
      "Contact your insurer to lodge an initial claim as soon as possible after a hail event. Our team provides comprehensive industry-standard assessment reports, photographic documentation, and detailed scope of works — everything you need when your insurer's assessor visits.",
  },
  {
    question: "Should I repair or replace hail-damaged roofing?",
    answer:
      "This depends on the extent of damage and the age of your roofing materials. Minor damage to newer roofs can often be repaired, while older materials or extensive damage typically warrants full replacement. Our assessors provide honest recommendations based on long-term value.",
  },
  {
    question: "How long do hail damage repairs typically take?",
    answer:
      "Minor repairs can be completed within 1 to 2 days. Extensive roof replacements may take 3 to 7 days depending on the size of your property and material availability. After major hail events, demand for materials and tradespeople can extend lead times.",
  },
  {
    question: "Can hail damage cause roof leaks?",
    answer:
      "Absolutely. Cracked tiles, punctured metal sheeting, damaged flashing, and displaced ridge capping all allow water ingress. Even micro-fractures that are invisible to the naked eye can lead to slow leaks that cause significant water damage over time if not repaired.",
  },
]

const relatedServices = [
  {
    title: "Roof Storm Damage Repair",
    href: "/services/storm-damage/roof-storm-damage",
    description: "Emergency tarping, tile and metal roof repair, and structural assessment.",
  },
  {
    title: "Wind Damage Restoration",
    href: "/services/storm-damage/wind-damage-restoration",
    description: "Structural bracing, cladding repair, and debris removal from wind events.",
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

export default function HailDamageRepairPage() {
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
  slug: 'hail-damage-repair',
  parentSlug: 'storm-damage',
  parentName: 'Storm Damage',
  serviceName: 'Hail Damage Repair',
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
              src="/images/services/storm-damage/hail-damage-repair-hero.webp"
              alt="Hail damage repair and roof tile replacement"
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
              Hail Damage <span className="text-[#00BFA6]">Repair Services</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8">
              Specialist hail damage repair across Australia. Our qualified teams provide same-day assessment,
              expert roof and exterior repairs, and complete insurance claim support to restore your property fast.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                Request Hail Assessment
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
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">Same</div>
              <div className="text-[#9CA3AF]">Same Day Assessment</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#2196F3] mb-2">All</div>
              <div className="text-[#9CA3AF]">All Materials Covered</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">Expert</div>
              <div className="text-[#9CA3AF]">Roof Specialists</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">Full</div>
              <div className="text-[#9CA3AF]">Full Exterior Repair</div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Hail Damage Repair Process
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
            Comprehensive Hail Damage Services
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
              <h2 className="font-poppins font-semibold text-2xl text-white">Hail Damage Is Often Hidden</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Micro-fractures in tiles are invisible but cause slow leaks",
                "Dented metal roofing is often not visible from ground level",
                "Cracked skylights may not shatter immediately after impact",
                "Damaged seals around roof penetrations allow water ingress",
                "Gutter and downpipe dents restrict water flow and cause overflow",
                "Granule loss on roof membranes accelerates material degradation",
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
              Hail Damage to Your Property?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Request a same-day hail damage assessment. Our specialists identify hidden damage others miss.
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
