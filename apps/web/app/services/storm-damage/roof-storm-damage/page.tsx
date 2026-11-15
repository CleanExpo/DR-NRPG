import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, CloudLightning, Shield, ArrowRight, Clock, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Roof Storm Damage Repair | Storm Damage Restoration Australia",
  description: "Emergency roof storm damage repair across Australia. IICRC-certified professionals provide emergency tarping, tile and metal roof repair, structural assessment, and full insurance documentation. 24/7 response.",
  keywords: ['roof storm damage', 'storm roof repair', 'roof leak storm', 'roof restoration', 'damaged roof tiles', 'Colorbond repair', 'Australia'],
  slug: 'roof-storm-damage',
  parentSlug: 'storm-damage',
  parentName: 'Storm Damage',
  serviceName: 'Roof Storm Damage',
})

const processSteps = [
  {
    step: "01",
    title: "Emergency Tarping & Securing",
    description:
      "Rapid deployment to secure your roof with heavy-duty tarps, preventing further water ingress and protecting your property from additional storm damage.",
  },
  {
    step: "02",
    title: "Damage Assessment & Documentation",
    description:
      "Comprehensive roof inspection using drone and manual assessment to document all damage for accurate repair scoping and insurance claim lodgement.",
  },
  {
    step: "03",
    title: "Roof Repair & Replacement",
    description:
      "Professional repair or replacement of damaged tiles, metal sheeting, flashing, gutters, and structural components using quality materials and licensed tradespeople.",
  },
  {
    step: "04",
    title: "Final Inspection & Warranty",
    description:
      "Thorough quality inspection to ensure all repairs meet Australian building standards, followed by comprehensive warranty documentation and handover.",
  },
]

const features = [
  {
    title: "Emergency Roof Tarping",
    description:
      "Rapid tarp deployment to protect your property from further water damage while permanent repairs are arranged.",
  },
  {
    title: "Tile & Metal Roof Repair",
    description:
      "Expert repair and replacement of terracotta, concrete, and Colorbond roofing materials damaged by storms.",
  },
  {
    title: "Gutter & Flashing Repair",
    description:
      "Restoration of guttering, downpipes, and flashing to ensure proper water drainage and weatherproofing.",
  },
  {
    title: "Structural Truss Assessment",
    description:
      "Qualified structural engineers assess roof trusses and framing for hidden damage that may compromise safety.",
  },
  {
    title: "Waterproofing & Sealing",
    description:
      "Professional waterproofing and sealing of all repaired areas to prevent future leaks and weather penetration.",
  },
  {
    title: "Insurance Scope & Documentation",
    description:
      "Detailed photographic evidence and professional scope of works prepared to support your insurance claim.",
  },
]

const faqs = [
  {
    question: "Should I tarp my own roof after storm damage?",
    answer:
      "We strongly advise against climbing onto a storm-damaged roof. The structure may be weakened, tiles can be loose, and wet surfaces are extremely hazardous. Our emergency teams are equipped and trained for safe roof access and can deploy within 2 hours.",
  },
  {
    question: "What should I do immediately after storm damage to my roof?",
    answer:
      "Move valuables away from areas where water is entering, place buckets under leaks, and contact our emergency line immediately. Document visible damage from ground level with photos if safe to do so, and contact your insurer to lodge an initial claim.",
  },
  {
    question: "Does insurance cover roof storm damage?",
    answer:
      "Most standard home and contents insurance policies cover storm damage to roofs. Our team prepares comprehensive documentation including photos, scope of works, and detailed reports to support your claim and maximise your entitlements.",
  },
  {
    question: "How long does a permanent roof repair take after a storm?",
    answer:
      "Permanent repairs typically take 1 to 5 days depending on the extent of damage and material availability. After major storm events, material supply and licensed tradesperson availability may extend timelines. Emergency tarping provides immediate protection.",
  },
  {
    question: "What is the difference between temporary and permanent roof repairs?",
    answer:
      "Temporary repairs such as tarping and patching prevent further damage and are completed within hours. Permanent repairs involve full tile or sheeting replacement, structural work, and waterproofing, restoring your roof to its pre-storm condition.",
  },
]

const relatedServices = [
  {
    title: "Wind Damage Restoration",
    href: "/services/storm-damage/wind-damage-restoration",
    description: "Structural bracing, cladding repair, and debris removal from wind events.",
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

export default function RoofStormDamagePage() {
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
  slug: 'roof-storm-damage',
  parentSlug: 'storm-damage',
  parentName: 'Storm Damage',
  serviceName: 'Roof Storm Damage',
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
              src="/images/services/storm-damage/roof-storm-damage-hero.webp"
              alt="Storm-damaged roof assessment and restoration"
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
              IICRC Water Damage & FSRT Certified
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Roof Storm Damage <span className="text-[#00BFA6]">Repair</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8">
              Emergency roof storm damage repair across Australia. Our IICRC-certified professionals provide rapid
              tarping, expert repairs, and complete insurance documentation to restore your roof and protect your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                Request Emergency Repair
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
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">2hr</div>
              <div className="text-[#9CA3AF]">Emergency Response</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#2196F3] mb-2">All</div>
              <div className="text-[#9CA3AF]">Roof Types</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">Fast</div>
              <div className="text-[#9CA3AF]">Emergency Tarped</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">8</div>
              <div className="text-[#9CA3AF]">States Covered</div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Roof Repair Process
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
            Comprehensive Roof Storm Damage Services
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
              <h2 className="font-poppins font-semibold text-2xl text-white">Post-Storm Roof Dangers</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Weakened structure may collapse under weight",
                "Loose tiles can fall causing serious injury",
                "Exposed wiring creates electrocution risk",
                "Water ingress causes immediate interior damage",
                "Hidden structural damage may not be visible",
                "Do not climb on a damaged roof under any circumstances",
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
              Emergency Roof Storm Damage?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Our emergency teams deploy within 2 hours. Request service now for immediate roof protection.
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
