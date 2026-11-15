import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, CloudLightning, Shield, ArrowRight, TreePine, Hammer } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Tree Damage Cleanup Services | Storm Damage Restoration Australia",
  description: "Emergency tree damage cleanup and restoration across Australia. IICRC-certified professionals provide emergency tree removal, structural damage repair, and complete property restoration. 24/7 emergency response.",
  keywords: ['tree damage cleanup', 'fallen tree removal', 'storm tree damage', 'tree on house', 'arborist emergency', 'tree debris cleanup', 'Australia'],
  slug: 'tree-damage-cleanup',
  parentSlug: 'storm-damage',
  parentName: 'Storm Damage',
  serviceName: 'Tree Damage Cleanup',
})

const processSteps = [
  {
    step: "01",
    title: "Emergency Safety Assessment",
    description:
      "Immediate site assessment to identify hazards including powerline contact, unstable trees, gas line risks, and structural compromise. Safety exclusion zones established before any work begins.",
  },
  {
    step: "02",
    title: "Tree Removal & Debris Clearing",
    description:
      "Safe removal of fallen trees using specialist equipment and qualified arborists. Systematic debris clearing with careful attention to preventing further damage to structures and services.",
  },
  {
    step: "03",
    title: "Structural Damage Repair",
    description:
      "Professional repair of all tree-impact damage including roof penetrations, wall damage, crushed fencing, and foundation assessment. Licensed builders and structural engineers engaged as required.",
  },
  {
    step: "04",
    title: "Property Restoration",
    description:
      "Complete property restoration including landscaping, boundary reconstruction, exterior finishes, and final inspection. Insurance documentation and warranty handover upon completion.",
  },
]

const features = [
  {
    title: "Emergency Tree Removal",
    description:
      "Rapid response for storm-felled trees threatening structures, blocking access, or creating safety hazards. Specialist equipment and qualified arborists deployed.",
  },
  {
    title: "Fallen Tree Extraction",
    description:
      "Careful extraction of trees embedded in roofs, walls, and structures using controlled cutting techniques to prevent additional damage during removal.",
  },
  {
    title: "Root Damage Assessment",
    description:
      "Professional assessment of underground root damage to foundations, drainage systems, paths, and retaining walls caused by uprooted trees.",
  },
  {
    title: "Structural Impact Repair",
    description:
      "Expert repair of structural damage caused by tree strikes including roof penetrations, cracked walls, damaged framing, and compromised load-bearing elements.",
  },
  {
    title: "Fence & Boundary Restoration",
    description:
      "Complete reconstruction of crushed fences, damaged retaining walls, and boundary structures impacted by fallen trees and branches.",
  },
  {
    title: "Council Coordination for Public Trees",
    description:
      "Liaison with local council for trees on public land, nature strips, and easements that have damaged private property. Navigating council processes on your behalf.",
  },
]

const faqs = [
  {
    question: "Who pays for tree damage to my property?",
    answer:
      "Generally, your home insurance covers damage to your property from fallen trees regardless of where the tree originated. If a neighbour's tree falls on your property, your own insurance typically covers the structural damage while the tree removal may be shared. We help document everything for your claim.",
  },
  {
    question: "A neighbour's tree has damaged my property. What are my rights?",
    answer:
      "In most Australian states, if a neighbour's tree was clearly dead, diseased, or poorly maintained and they were previously notified, they may be liable for damages. Your home insurance typically covers the immediate damage regardless. We provide detailed arborist reports that can support liability claims.",
  },
  {
    question: "What are council responsibilities for public tree damage?",
    answer:
      "Local councils are responsible for trees on public land including nature strips, parks, and easements. If a council tree damages your property, the council may be liable, particularly if the tree was known to be hazardous. We coordinate directly with councils on your behalf.",
  },
  {
    question: "Can damaged trees be saved after a storm?",
    answer:
      "Some storm-damaged trees can be saved through professional pruning, bracing, and crown restoration. Our arborist partners assess tree viability, considering species, extent of damage, structural integrity, and risk to property. Salvageable trees are identified during the initial assessment.",
  },
  {
    question: "Do I need a structural assessment after a tree strikes my property?",
    answer:
      "Yes, a structural assessment is strongly recommended after any tree impact, even if damage appears minor. Tree strikes can cause hidden damage to roof trusses, wall framing, and foundations that may not be immediately visible but can compromise structural integrity over time.",
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
    title: "Hail Damage Repair",
    href: "/services/storm-damage/hail-damage-repair",
    description: "Roof tile replacement, dent repair, and exterior restoration after hail.",
  },
  {
    title: "Emergency Roof Tarping",
    href: "/services/storm-damage/emergency-roof-tarping",
    description: "Rapid 2-hour tarp deployment to protect your property from water ingress.",
  },
]

export default function TreeDamageCleanupPage() {
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
  slug: 'tree-damage-cleanup',
  parentSlug: 'storm-damage',
  parentName: 'Storm Damage',
  serviceName: 'Tree Damage Cleanup',
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
              src="/images/services/storm-damage/tree-damage-cleanup-hero.webp"
              alt="Fallen tree damage cleanup and arborist services"
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
              IICRC & Structural Assessment Certified
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Tree Damage <span className="text-[#00BFA6]">Cleanup & Restoration</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8">
              Emergency tree damage cleanup and property restoration across Australia. Our IICRC-certified teams
              coordinate arborists, structural engineers, and builders for complete tree strike recovery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                Request Emergency Cleanup
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
              <div className="text-[#9CA3AF]">Emergency Call-Out</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#2196F3] mb-2">Cert</div>
              <div className="text-[#9CA3AF]">Arborist Coordinated</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">Full</div>
              <div className="text-[#9CA3AF]">Structural Assessed</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">100%</div>
              <div className="text-[#9CA3AF]">Full Site Cleanup</div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Tree Damage Cleanup Process
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
            Comprehensive Tree Damage Services
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
              <h2 className="font-poppins font-semibold text-2xl text-white">Tree Damage Hazards</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Powerline contact is life-threatening - stay at least 8 metres away",
                "Unstable trees may fall further without warning",
                "Root damage can undermine foundations and retaining walls",
                "Branches under tension can spring back causing serious injury",
                "Hidden structural damage may not be visible after tree removal",
                "Gas line ruptures from root damage create explosion risk",
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
              Tree Damage Emergency?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              24/7 emergency tree damage response. Do not approach fallen trees near powerlines. Request service now.
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
