import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, Clock, Phone, ArrowRight } from "lucide-react"
import { MouldRemediation } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Metadata } from "next"
import { generateCategoryMetadata, generateCategorySchemas } from "@/lib/seo/service-page-seo"


export const metadata: Metadata = generateCategoryMetadata({
  title: "Mould Remediation Services | NRPG Australia",
  description: "Safe, certified mould remediation services across Australia. air quality testing, containment, and full remediation by NRPG-vetted specialists.",
  keywords: ['mould remediation', 'mould removal', 'black mould', 'mould inspection', 'mould testing', 'mould prevention', 'Australia'],
  slug: 'mould-remediation',
  categoryName: 'Mould Remediation',
});

export default function MouldRemediationPillarPage() {
  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <Header />
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateCategorySchemas({
  title: 'Mould Remediation Services | NRPG Australia',
  description: 'Professional mould remediation services across Australia. Black mould removal, mould inspection, testing, prevention. Safe and thorough mould cleanup.',
  keywords: [],
  slug: 'mould-remediation',
  categoryName: 'Mould Remediation',
})) }}
      />
      <main className="py-24">
        {/* Hero Section */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <MouldRemediation size="hero" gradient="mould" aria-label="Mould Remediation" />
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              Qualified Contractors
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              How Is Mould Safely Removed <span className="text-[#00BFA6]">from Your Property?</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8">
              Mould remediation services across Australia, delivered by qualified contractors. Covers residential and commercial properties, with air quality clearance testing included in every engagement.
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
            Mould Remediation Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            <Link href="/services/mould-remediation/black-mould-removal">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <MouldRemediation size="lg" gradient="mould" className="text-[#22C55E] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Black Mould Removal
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Containment, HEPA removal, and antimicrobial treatment of Stachybotrys (black mould) by qualified contractors. Air quality testing confirms clearance before containment is lifted.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/mould-remediation/mould-inspection">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <MouldRemediation size="lg" gradient="mould" className="text-[#22C55E] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Mould Inspection
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Surface sampling, air quality testing, and moisture mapping to identify mould species, contamination extent, and moisture source. Written report produced for insurance and strata purposes.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/mould-remediation/mould-testing">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <MouldRemediation size="lg" gradient="mould" className="text-[#22C55E] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Mould Testing
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Laboratory-grade air and surface sampling to identify mould species and spore concentrations. Required for insurance disputes, property transactions, and tenancy health complaints.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/mould-remediation/mould-prevention">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <MouldRemediation size="lg" gradient="mould" className="text-[#22C55E] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Mould Prevention
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Moisture source identification, ventilation assessment, and antimicrobial preventative treatment to maintain humidity below 60%. Particularly relevant for properties in tropical and coastal Queensland.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/mould-remediation/commercial-mould-remediation">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <MouldRemediation size="lg" gradient="mould" className="text-[#22C55E] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Commercial Mould Remediation
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Industry-standard mould remediation for commercial, retail, hospitality, and strata properties. Negative air pressure containment and business continuity planning included for occupied buildings.
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
              { "@type": "Question", "name": "Can mould affect my health?", "acceptedAnswer": { "@type": "Answer", "text": "Mould exposure can cause symptoms such as a blocked or runny nose, eye irritation, coughing and wheezing, and can aggravate conditions like asthma — particularly for people with allergies, asthma or weakened immunity (consistent with Australian health guidance). If you have health concerns, seek advice from a medical professional. Professional remediation safely removes mould and addresses the underlying moisture source to help prevent regrowth." } },
              { "@type": "Question", "name": "Can I remove mould myself?", "acceptedAnswer": { "@type": "Answer", "text": "DIY methods only address surface mould and do not eliminate the moisture source or airborne spores. Professional remediation uses containment, HEPA filtration and antimicrobial treatments to fully eliminate mould colonies and prevent recurrence." } },
              { "@type": "Question", "name": "How long does mould remediation take?", "acceptedAnswer": { "@type": "Answer", "text": "Small mould areas (under 1 sqm) typically take 1–2 days. Larger infestations affecting walls, subfloors or HVAC systems may take 3–7 days. Full remediation includes post-treatment air quality testing to confirm clearance." } },
              { "@type": "Question", "name": "Will insurance cover mould remediation?", "acceptedAnswer": { "@type": "Answer", "text": "Insurance covers mould remediation when it results from a covered event such as water damage, flooding or a burst pipe. Mould from poor ventilation or ongoing maintenance issues is generally not covered. An NRPG certified assessor can help determine coverage." } }
            ]
          }) }}
        />
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Is mould dangerous to my health?", a: "Yes. Exposure to mould — particularly black mould (Stachybotrys) — can cause respiratory symptoms, allergic reactions and in severe cases, serious illness. Professional remediation is essential to safely remove mould and prevent regrowth." },
                { q: "Can I remove mould myself?", a: "DIY methods only address surface mould and do not eliminate the moisture source or airborne spores. Professional remediation uses containment, HEPA filtration and antimicrobial treatments to fully eliminate mould colonies and prevent recurrence." },
                { q: "How long does mould remediation take?", a: "Small mould areas (under 1 sqm) typically take 1–2 days. Larger infestations affecting walls, subfloors or HVAC systems may take 3–7 days. Full remediation includes post-treatment air quality testing to confirm clearance." },
                { q: "Will insurance cover mould remediation?", a: "Insurance covers mould remediation when it results from a covered event such as water damage, flooding or a burst pipe. Mould from poor ventilation or ongoing maintenance issues is generally not covered. An NRPG certified assessor can help determine coverage." }
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
              Emergency Mould Remediation Services?
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
