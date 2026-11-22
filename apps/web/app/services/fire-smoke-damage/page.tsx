import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, Clock, Phone, ArrowRight } from "lucide-react"
import { FireSmoke } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Metadata } from "next"
import { generateCategoryMetadata, generateCategorySchemas } from "@/lib/seo/service-page-seo"


export const metadata: Metadata = generateCategoryMetadata({
  title: "Fire & Smoke Damage Restoration | NRPG Australia",
  description: "Professional fire and smoke damage restoration by certified specialists. Industry-standard documentation for insurance claims, 24/7 emergency response, and complete soot remediation across all Australian states.",
  keywords: ['fire damage restoration', 'smoke damage', 'fire cleanup', 'soot removal', 'smoke odour removal', 'fire recovery', 'Qualified', 'Australia'],
  slug: 'fire-smoke-damage',
  categoryName: 'Fire & Smoke Damage Restoration',
});

export default function FireSmokeDamagePillarPage() {
  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <Header />
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateCategorySchemas({
  title: 'Fire & Smoke Damage Restoration | NRPG Australia',
  description: 'Professional fire and smoke damage restoration across Australia. Fire damage cleanup, smoke remediation, soot removal, odour elimination. 24/7 emergency response.',
  keywords: [],
  slug: 'fire-smoke-damage',
  categoryName: 'Fire & Smoke Damage Restoration',
})) }}
      />
      <main className="py-24">
        {/* Hero Section */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <FireSmoke size="hero" gradient="fire" aria-label="Fire & Smoke Restoration" />
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              Fire and Smoke Restoration
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              How Is Fire and Smoke Damage <span className="text-[#00BFA6]">Restored?</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8">
              Expert fire and smoke damage restoration services. Qualified professionals. 24/7 emergency response across major Australian cities.
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
            Fire & Smoke Damage Restoration Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            <Link href="/services/fire-smoke-damage/fire-damage-restoration">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <FireSmoke size="lg" gradient="fire" className="text-[#F97316] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Fire Damage Restoration
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Structural fire damage remediation, soot removal, and smoke odour elimination by qualified fire and smoke restoration contractors. Includes emergency board-up and insurance documentation.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/fire-smoke-damage/smoke-damage-restoration">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <FireSmoke size="lg" gradient="fire" className="text-[#F97316] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Smoke Damage Restoration
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Full smoke penetration assessment, residue classification, hydroxyl and ozone treatment by qualified fire and smoke restoration contractors. Covers HVAC decontamination and odour clearance.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/fire-smoke-damage/soot-removal">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <FireSmoke size="lg" gradient="fire" className="text-[#F97316] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Soot Removal
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  HEPA vacuuming, dry chemical sponging, and wet cleaning of soot residue from all surfaces. Residue type classified before cleaning — dry, wet, protein, and fuel oil soot each require different chemistry.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/fire-smoke-damage/smoke-odor-removal">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <FireSmoke size="lg" gradient="fire" className="text-[#F97316] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Smoke Odour Removal
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Persistent smoke odour eliminated through hydroxyl generation, thermal fogging, ozone treatment, and encapsulation. Effective for embedded VOCs in timber, plasterboard, and soft furnishings.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/fire-smoke-damage/commercial-fire-damage">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <FireSmoke size="lg" gradient="fire" className="text-[#F97316] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Commercial Fire Damage
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Large-scale fire damage restoration for commercial, industrial, and strata properties. Business continuity planning, expedited scoping, and insurance-grade documentation for commercial claims.
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
              { "@type": "Question", "name": "How quickly should fire damage be addressed?", "acceptedAnswer": { "@type": "Answer", "text": "Immediately. Soot is acidic and continues to corrode surfaces for days after a fire. Smoke particles penetrate porous materials within hours. Delaying professional cleanup permanently worsens damage and increases restoration costs." } },
              { "@type": "Question", "name": "Can smoke damage be fully removed from a property?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, with professional fire and smoke restoration methods. Technicians use HEPA filtration, thermal fogging, ozone treatment and hydroxyl generators to neutralise smoke odours and particles — including from walls, ceilings and HVAC systems." } },
              { "@type": "Question", "name": "Will insurance cover fire and smoke damage restoration?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, standard building and contents insurance covers fire and smoke damage. NRPG contractors provide complete photo documentation, moisture readings and restoration reports for insurance claims — and bill insurers directly." } },
              { "@type": "Question", "name": "What is the difference between fire damage and smoke damage restoration?", "acceptedAnswer": { "@type": "Answer", "text": "Fire damage restoration addresses structural and material damage from flames. Smoke damage restoration focuses on soot removal, odour elimination and particle extraction. Both are typically required after any fire event." } }
            ]
          }) }}
        />
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "How quickly should fire damage be addressed?", a: "Immediately. Soot is acidic and continues to corrode surfaces for days after a fire. Smoke particles penetrate porous materials within hours. Delaying professional cleanup permanently worsens damage and increases restoration costs." },
                { q: "Can smoke damage be fully removed from a property?", a: "Yes, with professional fire and smoke restoration methods. Technicians use HEPA filtration, thermal fogging, ozone treatment and hydroxyl generators to neutralise smoke odours and particles — including from walls, ceilings and HVAC systems." },
                { q: "Will insurance cover fire and smoke damage restoration?", a: "Yes, standard building and contents insurance covers fire and smoke damage. NRPG contractors provide complete photo documentation and bill insurers directly." },
                { q: "What is the difference between fire damage and smoke damage restoration?", a: "Fire damage restoration addresses structural and material damage from flames. Smoke damage restoration focuses on soot removal, odour elimination and particle extraction. Both are typically required after any fire event." }
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
              Emergency Fire & Smoke Damage Restoration?
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
