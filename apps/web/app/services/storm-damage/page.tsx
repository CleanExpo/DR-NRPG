import Header from "@/components/header"
import Footer from "@/components/footer"
import { Shield, CheckCircle, Clock, Phone, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Metadata } from "next"
import { generateCategoryMetadata, generateCategorySchemas } from "@/lib/seo/service-page-seo"


export const metadata: Metadata = generateCategoryMetadata({
  title: "Storm Damage Restoration Services | NRPG Australia",
  description: "Emergency storm damage repair and restoration across Australia. NRPG-vetted contractors prioritise rapid response across all service areas, manage insurance claims, and restore your property to pre-loss condition.",
  keywords: ['storm damage restoration', 'storm damage repair', 'roof damage', 'wind damage', 'hail damage', 'tree damage', 'emergency tarping', 'Australia'],
  slug: 'storm-damage',
  categoryName: 'Storm Damage Restoration',
});

export default function StormDamagePillarPage() {
  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <Header />
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateCategorySchemas({
  title: 'Storm Damage Restoration Services | NRPG Australia',
  description: 'Professional storm damage restoration across Australia. Roof damage, wind damage, hail damage, tree cleanup, emergency tarping. 24/7 emergency response.',
  keywords: [],
  slug: 'storm-damage',
  categoryName: 'Storm Damage Restoration',
})) }}
      />
      <main className="py-24">
        {/* Hero Section */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              Multiple Industry Standards
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Who Handles Storm Damage Restoration <span className="text-[#00BFA6]">in Australia?</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8">
              Emergency storm and weather damage restoration. Qualified professionals. 24/7 emergency response across major Australian cities.
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
              <div className="text-3xl font-bold text-[#2196F3] mb-2">100%</div>
              <div className="text-[#9CA3AF]">Qualified Contractors</div>
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
            Storm Damage Restoration Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            <Link href="/services/storm-damage/roof-storm-damage">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <CheckCircle className="h-8 w-8 text-[#00BFA6] mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Roof Storm Damage
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Emergency assessment of storm-damaged roofs, temporary tarping to prevent water ingress, and coordination of permanent roofing repairs. Documentation produced for insurance claim scope.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/storm-damage/wind-damage-restoration">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <CheckCircle className="h-8 w-8 text-[#00BFA6] mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Wind Damage Restoration
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Structural assessment and restoration for cyclone and severe wind events. Covers wall racking, roof lifting, window failure, and secondary water ingress. Industry protocols applied where water damage has occurred.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/storm-damage/hail-damage-repair">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <CheckCircle className="h-8 w-8 text-[#00BFA6] mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Hail Damage Repair
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Hail damage inspection and documentation for roofing, skylights, gutters, and cladding. Evidence photography taken before any temporary repairs to preserve insurance claim scope.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/storm-damage/tree-damage-cleanup">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <CheckCircle className="h-8 w-8 text-[#00BFA6] mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Tree Damage Cleanup
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Storm-fallen tree removal, structural damage assessment where trees have impacted the building, and coordinated repair of penetrations in roofing, walls, and windows.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/storm-damage/emergency-roof-tarping">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <CheckCircle className="h-8 w-8 text-[#00BFA6] mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Emergency Roof Tarping
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  24/7 emergency heavy-duty roof tarping to prevent ongoing water ingress after storm damage. Temporary fencing and board-up for broken windows and structural breaches where required.
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
              { "@type": "Question", "name": "What should I do immediately after storm damage?", "acceptedAnswer": { "@type": "Answer", "text": "Document all damage with photographs before touching anything. If roof damage has occurred, do not enter until the structure is assessed as safe. Contact your insurer and a certified storm damage restoration specialist as soon as possible." } },
              { "@type": "Question", "name": "Does storm damage require emergency roof tarping?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, if roof damage is present. Emergency roof tarping prevents water from entering and causing secondary water and mould damage. NRPG contractors provide 24/7 emergency tarping services across Australia." } },
              { "@type": "Question", "name": "How do I know if my home has structural damage after a storm?", "acceptedAnswer": { "@type": "Answer", "text": "Signs include visible cracks in walls or foundations, doors and windows that no longer close properly, bowing or sagging roof areas, and water staining on ceilings. A qualified inspector can assess hidden structural damage using thermal imaging." } },
              { "@type": "Question", "name": "Is storm damage covered by home insurance in Australia?", "acceptedAnswer": { "@type": "Answer", "text": "Storm, hail and wind damage is typically covered under standard building insurance in Australia. Contents insurance may also apply. NRPG contractors provide full damage reports and work directly with your insurer." } }
            ]
          }) }}
        />
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "What should I do immediately after storm damage?", a: "Document all damage with photographs before touching anything. If roof damage has occurred, do not enter until the structure is assessed as safe. Contact your insurer and a certified storm damage restoration specialist as soon as possible." },
                { q: "Does storm damage require emergency roof tarping?", a: "Yes, if roof damage is present. Emergency roof tarping prevents water from entering and causing secondary water and mould damage. NRPG contractors provide 24/7 emergency tarping services across Australia." },
                { q: "How do I know if my home has structural damage after a storm?", a: "Signs include visible cracks in walls or foundations, doors and windows that no longer close properly, bowing or sagging roof areas, and water staining on ceilings. A qualified inspector can assess hidden structural damage using thermal imaging." },
                { q: "Is storm damage covered by home insurance in Australia?", a: "Storm, hail and wind damage is typically covered under standard building insurance in Australia. Contents insurance may also apply. NRPG contractors provide full damage reports and work directly with your insurer." }
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
              Emergency Storm Damage Restoration?
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
