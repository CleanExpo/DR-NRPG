import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, Droplets, Clock, Shield, ArrowRight } from "lucide-react"
import { WaterDamage } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Ceiling Water Damage Repair | Water Damage Restoration Australia",
  description: "Professional ceiling water damage repair and restoration across Australia. Leak source tracing, plasterboard replacement, and mould prevention. IICRC certified. Same-day service available.",
  keywords: ['ceiling water damage', 'ceiling leak repair', 'water stain ceiling', 'ceiling restoration', 'roof leak damage', 'plaster repair', 'Australia'],
  slug: 'ceiling-water-damage',
  parentSlug: 'water-damage',
  parentName: 'Water Damage',
  serviceName: 'Ceiling Water Damage',
})

const processSteps = [
  { step: 1, title: "Source Identification", description: "Our technicians use moisture meters and thermal imaging to trace the water source, whether from a roof leak, burst pipe, overflowing fixture, or condensation issue." },
  { step: 2, title: "Controlled Water Removal", description: "Water is carefully drained from the ceiling space in a controlled manner to prevent sudden collapse, protecting your furnishings and flooring below." },
  { step: 3, title: "Structural Assessment", description: "A thorough assessment of ceiling joists, battens, and plasterboard integrity determines the extent of damage and required repairs." },
  { step: 4, title: "Ceiling Restoration", description: "Damaged sections are replaced with matching materials, sealed, primed, and painted to achieve a seamless finish matching your existing ceiling." },
]

const features = [
  { title: "Leak Source Tracing", description: "Advanced moisture detection and thermal imaging technology to pinpoint the exact source of ceiling water damage, even when hidden within wall and roof cavities." },
  { title: "Plasterboard Replacement", description: "Expert removal of water-damaged plasterboard and installation of new sheets with seamless joining, cornicing, and finishing to match your existing ceiling." },
  { title: "Sagging Ceiling Support", description: "Emergency temporary supports installed to prevent ceiling collapse, with controlled drainage of trapped water before permanent repairs begin." },
  { title: "Mould Prevention", description: "Antimicrobial treatments applied to ceiling cavities and surrounding areas to prevent mould growth, with follow-up inspections to confirm effectiveness." },
  { title: "Electrical Safety Assessment", description: "All ceiling-mounted electrical fixtures, wiring, and junction boxes inspected for water damage before power is restored to affected circuits." },
  { title: "Paint & Finish Matching", description: "Professional colour matching and painting ensures repaired ceiling sections blend seamlessly with existing finishes for an invisible repair." },
]

const faqs = [
  { question: "How do I know if my ceiling has water damage?", answer: "Common signs include brown or yellowish stains, sagging or bulging areas, bubbling or peeling paint, visible dripping, mould spots, and a musty odour. If you notice any of these, contact a professional immediately." },
  { question: "Is a water-stained ceiling dangerous?", answer: "Yes, it can be. Water-damaged ceilings can collapse without warning, especially plasterboard ceilings. Water near electrical wiring also creates electrocution risks. Do not ignore ceiling water stains." },
  { question: "Can you repair a ceiling without replacing it entirely?", answer: "In many cases, yes. If the damage is localised, we can cut out and replace only the affected section with matching plasterboard, then blend the finish. Severe or widespread damage may require full replacement." },
  { question: "How quickly can you attend to ceiling water damage?", answer: "We offer same-day service for ceiling water damage emergencies. Our technicians arrive equipped with moisture detection tools, temporary supports, and extraction equipment." },
  { question: "Will my insurance cover ceiling water damage?", answer: "Most home insurance policies cover sudden and accidental water damage to ceilings, such as from burst pipes or storm damage. We provide detailed documentation with moisture readings and photos for your claim." },
]

export default function CeilingWaterDamagePage() {
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
  slug: 'ceiling-water-damage',
  parentSlug: 'water-damage',
  parentName: 'Water Damage',
  serviceName: 'Ceiling Water Damage',
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
              src="/images/services/water-damage/ceiling-water-damage-hero.webp"
              alt="Ceiling water damage assessment and restoration"
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
              <WaterDamage size="hero" gradient="water" aria-label="Ceiling Water Damage Services" />
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              IICRC Certified
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Ceiling Water Damage <span className="text-[#00BFA6]">Repair</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8 max-w-2xl mx-auto">
              Expert ceiling water damage repair and restoration across Australia. From leak source tracing to seamless plasterboard replacement, our IICRC-certified technicians restore your ceiling to pre-damage condition.
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
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">Same Day</div>
              <div className="text-[#9CA3AF]">Service Available</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#2196F3] mb-2">100%</div>
              <div className="text-[#9CA3AF]">Source Found</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">Full</div>
              <div className="text-[#9CA3AF]">Ceiling Repair</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">Expert</div>
              <div className="text-[#9CA3AF]">Ceiling Specialists</div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Ceiling Repair Process
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
            Complete Ceiling Restoration Solutions
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
              <h2 className="font-poppins font-semibold text-2xl text-white">Ceiling Water Damage Warning Signs</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Brown or yellowish stains spreading on the ceiling",
                "Sagging or bulging sections of plasterboard",
                "Bubbling, peeling, or flaking paint",
                "Active dripping or water beading on the surface",
                "Visible mould spots or dark patches",
                "Musty odour coming from the ceiling area",
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
              { title: "Burst Pipe Repair", href: "/services/water-damage/burst-pipe-repair", desc: "Emergency pipe isolation and water damage restoration." },
              { title: "Structural Drying", href: "/services/water-damage/structural-drying", desc: "Professional monitored drying programs for all structures." },
              { title: "Carpet Water Damage", href: "/services/water-damage/carpet-water-damage", desc: "Carpet extraction, drying, and reinstallation services." },
              { title: "Commercial Water Damage", href: "/services/water-damage/commercial-water-damage", desc: "Large-scale commercial water damage restoration." },
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
              Ceiling Water Damage Emergency?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              A sagging ceiling can collapse without warning. Request emergency service now for same-day assessment and repair.
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
