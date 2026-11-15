import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, Droplets, Clock, Shield, ArrowRight } from "lucide-react"
import { WaterDamage } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Carpet Water Damage Restoration | Water Damage Restoration Australia",
  description: "Professional carpet water damage restoration across Australia. Hot water extraction, carpet lifting, underlay replacement, and odour treatment. Compliant with industry standards. 4-hour emergency response.",
  keywords: ['carpet water damage', 'wet carpet', 'carpet drying', 'carpet restoration', 'carpet flood damage', 'carpet extraction', 'Australia'],
  slug: 'carpet-water-damage',
  parentSlug: 'water-damage',
  parentName: 'Water Damage',
  serviceName: 'Carpet Water Damage',
})

const processSteps = [
  { step: 1, title: "Water Category Assessment", description: "Our technicians assess the water contamination category to determine whether your carpet can be salvaged. Category 1 (clean water) is salvageable; Category 2-3 may require disposal." },
  { step: 2, title: "Extraction & Carpet Lifting", description: "Powerful extraction units remove water from carpet fibres. Carpet is carefully lifted from tack strips to allow access to the underlay and subfloor beneath." },
  { step: 3, title: "Underlay Treatment", description: "Saturated underlay is assessed for replacement. Category 1 underlay may be dried in place; contaminated underlay is removed and replaced with new material." },
  { step: 4, title: "Drying & Reinstallation", description: "Industrial air movers and dehumidifiers dry the carpet, subfloor, and surrounding area. Clean carpet is re-stretched and reinstalled over new or dried underlay." },
]

const features = [
  { title: "Hot Water Extraction", description: "Professional-grade hot water extraction removes deep-seated moisture, dirt, and contaminants from carpet fibres, restoring them to pre-damage condition." },
  { title: "Carpet Lifting & Relaying", description: "Expert carpet lifting preserves your existing carpet while allowing thorough drying of underlay and subfloor. Careful re-stretching prevents wrinkles and bubbling." },
  { title: "Underlay Replacement", description: "Water-damaged underlay is removed and replaced with new, matching material. Proper underlay replacement is essential for carpet longevity and comfort." },
  { title: "Odour Treatment", description: "Antimicrobial and deodorising treatments eliminate musty odours caused by water damage, bacteria growth, and organic decomposition in carpet fibres." },
  { title: "Category 1 Salvage", description: "Clean water damage from burst pipes or supply lines is treated quickly to salvage your existing carpet, saving you the cost of full replacement." },
  { title: "Category 2-3 Disposal Coordination", description: "Contaminated carpet and underlay are safely removed, bagged, and disposed of in accordance with health and safety regulations." },
]

const faqs = [
  { question: "Can water-damaged carpet be saved?", answer: "It depends on the water category and response time. Category 1 (clean water) carpet can usually be saved if treated within 24-48 hours. Category 2 (grey water) may be salvageable with professional treatment. Category 3 (black water) carpet must be disposed of." },
  { question: "How quickly should water-damaged carpet be treated?", answer: "As quickly as possible. Mould can begin growing in carpet within 24-48 hours. We offer a 4-hour emergency response to maximise the chance of saving your carpet and preventing health hazards." },
  { question: "Does the underlay always need replacing?", answer: "Not always. Category 1 water-damaged underlay can sometimes be dried in place if treated promptly. However, contaminated or heavily saturated underlay typically requires full replacement for hygiene reasons." },
  { question: "Will my carpet shrink after water damage?", answer: "Improper drying can cause carpet shrinkage. Our professional drying process uses controlled dehumidification and air movement to prevent shrinkage, with careful re-stretching during reinstallation." },
  { question: "Does insurance cover carpet water damage?", answer: "Most home insurance policies cover sudden and accidental carpet water damage. We provide detailed documentation including water category assessment, moisture readings, and photos for your insurance claim." },
]

export default function CarpetWaterDamagePage() {
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
  slug: 'carpet-water-damage',
  parentSlug: 'water-damage',
  parentName: 'Water Damage',
  serviceName: 'Carpet Water Damage',
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
              src="/images/services/water-damage/carpet-water-damage-hero.webp"
              alt="Carpet water damage extraction and restoration"
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
              <WaterDamage size="hero" gradient="water" aria-label="Carpet Water Damage Services" />
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              Industry Standards Compliant
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Carpet Water Damage <span className="text-[#00BFA6]">Restoration</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8 max-w-2xl mx-auto">
              Professional carpet water damage restoration across Australia. From emergency extraction to complete reinstallation, our IICRC-certified technicians save your carpet and protect your health.
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
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">4hr</div>
              <div className="text-[#9CA3AF]">Emergency Response</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#2196F3] mb-2">Cat 1</div>
              <div className="text-[#9CA3AF]">Carpet Salvage</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">Industry</div>
              <div className="text-[#9CA3AF]">Standards Compliant</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">Expert</div>
              <div className="text-[#9CA3AF]">Carpet Specialists</div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Carpet Restoration Process
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
            Complete Carpet Water Damage Solutions
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
              <h2 className="font-poppins font-semibold text-2xl text-white">Why Quick Action Matters</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Mould grows in carpet within 24-48 hours",
                "Bacteria breeds rapidly in warm, wet carpet",
                "Permanent staining sets in quickly",
                "Carpet delamination from prolonged moisture",
                "Health risks from airborne mould spores",
                "Carpet shrinkage from improper drying",
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
              { title: "Burst Pipe Repair", href: "/services/water-damage/burst-pipe-repair", desc: "Emergency pipe isolation and water damage restoration." },
              { title: "Basement Flooding", href: "/services/water-damage/basement-flooding", desc: "Complete basement water extraction and waterproofing." },
              { title: "Ceiling Water Damage", href: "/services/water-damage/ceiling-water-damage", desc: "Repair and restoration for water-damaged ceilings." },
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
              Carpet Water Damage Emergency?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Every hour counts when saving water-damaged carpet. Request emergency service now for rapid extraction and drying.
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
