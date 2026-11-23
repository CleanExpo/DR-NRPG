import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, Clock, Phone, ArrowRight } from "lucide-react"
import { WaterDamage } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Metadata } from "next"
import { generateCategoryMetadata, generateCategorySchemas } from "@/lib/seo/service-page-seo"


export const metadata: Metadata = generateCategoryMetadata({
  title: "Water Damage Restoration Services | NRPG Australia",
  description: "Qualified water damage restoration across Australia. Priority emergency response, insurance-approved contractors, and forensic drying standards to protect your property.",
  keywords: ['water damage restoration', 'water damage repair', 'flood damage', 'water extraction', 'structural drying', 'burst pipe', 'basement flooding', 'Australia'],
  slug: 'water-damage',
  categoryName: 'Water Damage Restoration',
});

const waterDamageHowTo = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How Water Damage Restoration Works",
  "description": "NRPG's forensic water damage restoration process",
  "step": [
    { "@type": "HowToStep", "position": 1, "name": "Emergency Assessment", "text": "Qualified technician is dispatched with priority to assess moisture levels and damage extent." },
    { "@type": "HowToStep", "position": 2, "name": "Water Extraction", "text": "Industrial-grade extractors remove standing water and moisture from all affected surfaces." },
    { "@type": "HowToStep", "position": 3, "name": "Structural Drying", "text": "Commercial dehumidifiers and air movers create optimal drying conditions across affected areas." },
    { "@type": "HowToStep", "position": 4, "name": "Mould Prevention", "text": "Antimicrobial treatments applied to prevent secondary mould growth post-water damage." },
    { "@type": "HowToStep", "position": 5, "name": "Restoration & Repair", "text": "Full structural repairs and restoration to pre-loss condition, documented for insurance claims." },
  ],
};

export default function WaterDamagePillarPage() {
  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <Header />
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateCategorySchemas({
  title: 'Water Damage Restoration Services | NRPG Australia',
  description: 'Professional water damage restoration services across Australia. Basement flooding, burst pipes, flood restoration, structural drying. 24/7 emergency response.',
  keywords: [],
  slug: 'water-damage',
  categoryName: 'Water Damage Restoration',
})) }}
      />
      {/* HowTo Schema (DIS-30) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(waterDamageHowTo) }}
      />
      <main className="py-24">
        {/* Hero Section */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <WaterDamage size="hero" gradient="water" aria-label="Water Damage Restoration" />
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              Qualified Contractors
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              What Should You Do After <span className="text-[#00BFA6]">Water Damage?</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8">
              Water damage restoration services across Australia, delivered by qualified contractors. Residential and commercial jobs covered, with direct insurance documentation included.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                Request Service
              </Button>
              <Button variant="outline" className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] px-8 py-3 text-lg bg-transparent">
                Get a Quote
              </Button>
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
              <div className="text-3xl font-bold text-[#2196F3] mb-2">NRPG</div>
              <div className="text-[#9CA3AF]">Contractor Network</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">8</div>
              <div className="text-[#9CA3AF]">States Covered</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">60min</div>
              <div className="text-[#9CA3AF]">Target Response</div>
            </div>
          </div>
        </section>

        {/* Sub-Services (Sub-Pillar Links) */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Water Damage Restoration Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            <Link href="/services/water-damage/basement-flooding">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <WaterDamage size="lg" gradient="water" className="text-[#3B82F6] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Basement Flooding
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Below-ground water extraction, sump pump coordination, and structural drying for basement flooding events. Category 1–3 classification on site determines protocol and material disposal requirements.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/water-damage/burst-pipe-repair">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <WaterDamage size="lg" gradient="water" className="text-[#3B82F6] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Burst Pipe Repair
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Emergency response to burst pipes including water extraction, structural drying, and coordinated plumbing repairs. Industry-standard documentation produced for insurance claims from day one.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/water-damage/flood-restoration">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <WaterDamage size="lg" gradient="water" className="text-[#3B82F6] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Flood Restoration
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Category 3 floodwater extraction, full porous material removal, antimicrobial decontamination, and industry-standard structural drying. Covers river flooding, stormwater, and overland flow events.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/water-damage/ceiling-water-damage">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <WaterDamage size="lg" gradient="water" className="text-[#3B82F6] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Ceiling Water Damage
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Ceiling cavity moisture mapping, controlled opening of water-laden plasterboard, and structural drying to prevent mould growth. Includes scope documentation for insurance and strata claims.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/water-damage/carpet-water-damage">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <WaterDamage size="lg" gradient="water" className="text-[#3B82F6] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Carpet Water Damage
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Carpet extraction, delamination assessment, and in-situ drying or removal based on water category and contact time. Salvage decisions documented for contents claims.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/water-damage/commercial-water-damage">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <WaterDamage size="lg" gradient="water" className="text-[#3B82F6] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Commercial Water Damage
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Large-scale water damage restoration for commercial, office, retail, and industrial properties. Business continuity planning, expedited drying, and multi-site coordination available.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/water-damage/structural-drying">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <WaterDamage size="lg" gradient="water" className="text-[#3B82F6] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Structural Drying
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Psychrometric-monitored drying using LGR dehumidifiers and high-velocity air movers. Drying logs produced every 24 hours to industry standard — required for insurance sign-off on completed works.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            
          </div>
        </section>

        {/* FAQ Section */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What should I do first after water damage?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Turn off the water source if safe, avoid using electrical appliances in affected areas, move valuables to a dry area, and call a certified water damage restoration professional immediately. Acting within the first 60 minutes dramatically reduces damage and mould risk."
                }
              },
              {
                "@type": "Question",
                "name": "How long does water damage restoration take?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Minor water damage is typically restored in 3–5 days. Significant flooding or structural damage may take 1–2 weeks. Industry standards require complete structural drying before any reconstruction begins."
                }
              },
              {
                "@type": "Question",
                "name": "Does insurance cover water damage restoration?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most home and contents insurance policies cover sudden and accidental water damage. NRPG contractors provide full insurance documentation and work directly with all major Australian insurers including NRMA, Suncorp, RACV and QBE."
                }
              },
              {
                "@type": "Question",
                "name": "Why does contractor training matter?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The recognised industry standard covering water damage restoration is international. Certified technicians are trained in moisture measurement, structural drying science, and mould prevention protocols — ensuring your property is restored to pre-loss condition."
                }
              }
            ]
          }) }}
        />
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "What should I do first after water damage?",
                  a: "Turn off the water source if safe, avoid using electrical appliances in affected areas, move valuables to a dry area, and call a certified water damage restoration professional immediately. Acting within the first 60 minutes dramatically reduces damage and mould risk."
                },
                {
                  q: "How long does water damage restoration take?",
                  a: "Minor water damage is typically restored in 3–5 days. Significant flooding or structural damage may take 1–2 weeks. Industry standards require complete structural drying before any reconstruction begins."
                },
                {
                  q: "Does insurance cover water damage restoration?",
                  a: "Most home and contents insurance policies cover sudden and accidental water damage. NRPG contractors provide full insurance documentation and work directly with all major Australian insurers including NRMA, Suncorp, RACV and QBE."
                },
                {
                  q: "Why does contractor training matter?",
                  a: "The recognised industry standard covering water damage restoration is international. Certified technicians are trained in moisture measurement, structural drying science, and mould prevention protocols — ensuring your property is restored to pre-loss condition."
                }
              ].map(({ q, a }, i) => (
                <div key={i} className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]">
                  <h3 className="font-poppins font-semibold text-lg text-white mb-3">{q}</h3>
                  <p className="text-[#9CA3AF] leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency CTA */}
        <section className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-[#EF4444] to-[#DC2626] rounded-2xl p-12 text-center">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-white mb-4">
              Emergency Water Damage Restoration?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              24/7 emergency response. Request service now for immediate assistance.
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
