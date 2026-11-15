import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, Droplets, Clock, Shield, ArrowRight } from "lucide-react"
import { WaterDamage } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Commercial Water Damage Restoration | Water Damage Restoration Australia",
  description: "Professional commercial water damage restoration across Australia. Server room recovery, large-area extraction, business continuity planning, and commercial insurance claims. IICRC certified. Priority response.",
  keywords: ['commercial water damage', 'office water damage', 'business flood damage', 'commercial restoration', 'industrial water damage', 'Australia'],
  slug: 'commercial-water-damage',
  parentSlug: 'water-damage',
  parentName: 'Water Damage',
  serviceName: 'Commercial Water Damage',
})

const processSteps = [
  { step: 1, title: "Business Impact Assessment", description: "Our commercial response team assesses the scope of water damage, identifies critical business assets at risk, and develops a prioritised recovery plan to minimise downtime." },
  { step: 2, title: "Large-Scale Extraction", description: "Truck-mounted and industrial extraction units remove water from large commercial spaces rapidly, with containment strategies to protect unaffected areas and equipment." },
  { step: 3, title: "Commercial Drying Program", description: "A tailored drying program using commercial-grade dehumidifiers and air movers is deployed across your facility, with daily monitoring and documentation." },
  { step: 4, title: "Business Restoration", description: "Full restoration of commercial spaces including flooring, walls, ceilings, and fixtures. We coordinate with your schedule to minimise business disruption." },
]

const features = [
  { title: "Server Room Recovery", description: "Specialised protocols for water-damaged server rooms and IT infrastructure, including controlled drying, equipment assessment, and data recovery coordination." },
  { title: "Large-Area Extraction", description: "Industrial extraction equipment capable of handling warehouses, retail floors, office buildings, and multi-storey commercial properties efficiently." },
  { title: "Business Continuity Planning", description: "We work with your management team to develop recovery timelines, temporary relocation plans, and phased restoration schedules to keep your business operating." },
  { title: "After-Hours Scheduling", description: "Restoration work scheduled outside business hours, on weekends, and during holidays to minimise impact on your operations and staff." },
  { title: "Document & Inventory Recovery", description: "Specialised recovery procedures for water-damaged documents, files, inventory, and stock with freeze-drying and decontamination options available." },
  { title: "Commercial Insurance Claims", description: "Expert IICRC-standard commercial insurance documentation including loss of revenue calculations and detailed scope of works — professional reports for your insurance submission." },
]

const faqs = [
  { question: "How quickly can you respond to commercial water damage?", answer: "Priority dispatch applies to all commercial emergencies. Commercial teams are on standby 24/7 with industrial-grade equipment and aim to arrive as quickly as possible across major Australian metropolitan areas." },
  { question: "Can you work outside business hours?", answer: "Yes. We offer after-hours, weekend, and public holiday scheduling to minimise disruption to your business operations. We can also coordinate phased restoration during operating hours." },
  { question: "Do you handle commercial insurance claims?", answer: "Yes. We provide comprehensive IICRC-standard commercial insurance documentation including detailed scope of works, moisture readings, and loss assessments — everything you need to submit to your insurer or loss adjuster." },
  { question: "Can you recover water-damaged IT equipment?", answer: "We have specialised protocols for server rooms and IT infrastructure. While we manage the drying environment, we coordinate with data recovery specialists for equipment and data salvage." },
  { question: "How do you minimise business downtime?", answer: "We develop a prioritised recovery plan that addresses critical areas first, offers after-hours scheduling, and provides business continuity planning including temporary relocation support if needed." },
]

export default function CommercialWaterDamagePage() {
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
  slug: 'commercial-water-damage',
  parentSlug: 'water-damage',
  parentName: 'Water Damage',
  serviceName: 'Commercial Water Damage',
  faqs,
})) }}
      />
      <main className="py-24">
        {/* Breadcrumb */}
        <section className="container mx-auto px-6 mb-8">
          <Link href="/services/water-damage" className="inline-flex items-center text-[#9CA3AF] hover:text-[#00BFA6] transition-colors text-sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Water Damage Services
          </Link>
        </section>

        {/* Hero Section */}
        <section className="relative overflow-hidden mb-16">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/services/water-damage/commercial-water-damage-hero.webp"
              alt="Commercial water damage restoration operation"
              fill
              priority
              className="object-cover opacity-30"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0F1115]/70 via-[#0F1115]/50 to-[#0F1115]" />
          </div>
          <div className="relative z-10 container mx-auto px-6 pt-16 pb-8">
            <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <WaterDamage size="hero" gradient="water" aria-label="Commercial Water Damage Services" />
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              IICRC Certified
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Commercial Water Damage <span className="text-[#00BFA6]">Restoration</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8 max-w-2xl mx-auto">
              Large-scale commercial water damage restoration across Australia. Our IICRC-certified teams minimise business downtime with rapid extraction, industrial drying, and complete restoration services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                Request Emergency Service
              </Button>
              <Button variant="outline" className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] px-8 py-3 text-lg bg-transparent">
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
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">60min</div>
              <div className="text-[#9CA3AF]">Emergency Response</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#2196F3] mb-2">24/7</div>
              <div className="text-[#9CA3AF]">Available</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">All</div>
              <div className="text-[#9CA3AF]">Commercial Types</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">Full</div>
              <div className="text-[#9CA3AF]">Business Continuity</div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Commercial Restoration Process
          </h2>
          <div className="max-w-4xl mx-auto space-y-8">
            {processSteps.map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#00BFA6]/20 border border-[#00BFA6]/40 flex items-center justify-center text-[#00BFA6] font-bold text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-2">{item.title}</h3>
                  <p className="text-[#9CA3AF]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Complete Commercial Restoration Solutions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <div key={feature.title} className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]">
                <Droplets className="h-8 w-8 text-[#2196F3] mb-4" />
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
              <AlertTriangle className="h-8 w-8 text-[#F59E0B]" />
              <h2 className="font-poppins font-semibold text-2xl text-white">Business Interruption Risks</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Data loss from water-damaged servers and equipment",
                "Inventory damage and stock write-offs",
                "Employee displacement and productivity loss",
                "Regulatory compliance issues from facility damage",
                "Reputation impact from prolonged closure",
                "Lease obligations during restoration period",
              ].map((hazard) => (
                <div key={hazard} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <span className="text-[#9CA3AF]">{hazard}</span>
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
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]">
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">{faq.question}</h3>
                <p className="text-[#9CA3AF]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Services */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Related Water Damage Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { title: "Structural Drying", href: "/services/water-damage/structural-drying", desc: "Professional monitored drying programs for all structures." },
              { title: "Flood Restoration", href: "/services/water-damage/flood-restoration", desc: "Complete flood water extraction and decontamination." },
              { title: "Burst Pipe Repair", href: "/services/water-damage/burst-pipe-repair", desc: "Emergency pipe isolation and water damage restoration." },
              { title: "Carpet Water Damage", href: "/services/water-damage/carpet-water-damage", desc: "Carpet extraction, drying, and reinstallation services." },
            ].map((service) => (
              <Link key={service.title} href={service.href}>
                <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer h-full">
                  <WaterDamage size="lg" gradient="water" className="mb-4" aria-hidden="true" />
                  <h3 className="font-poppins font-semibold text-lg text-white mb-2">{service.title}</h3>
                  <p className="text-[#9CA3AF] text-sm mb-4">{service.desc}</p>
                  <span className="text-[#00BFA6] text-sm font-medium inline-flex items-center">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Emergency CTA */}
        <section className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-[#EF4444] to-[#DC2626] rounded-2xl p-12 text-center">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-white mb-4">
              Commercial Water Damage Emergency?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Every minute of downtime costs your business. Request emergency service now for priority commercial response.
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
