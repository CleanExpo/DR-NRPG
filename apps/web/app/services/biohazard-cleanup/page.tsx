import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, Clock, Phone, ArrowRight } from "lucide-react"
import { BioForensic } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Metadata } from "next"
import { generateCategoryMetadata, generateCategorySchemas } from "@/lib/seo/service-page-seo"


export const metadata: Metadata = generateCategoryMetadata({
  title: "Biohazard Cleanup Services | NRPG Australia",
  description: "What Does Professional Biohazard Cleanup Involve? IICRC-certified specialists across Australia provide discreet, insurance-approved crime scene, trauma, and hazardous material remediation.",
  keywords: ['biohazard cleanup', 'crime scene cleanup', 'trauma cleanup', 'meth decontamination', 'sewage cleanup', 'hoarding cleanup', 'forensic cleaning', 'Australia'],
  slug: 'biohazard-cleanup',
  categoryName: 'Biohazard Cleanup',
});

export default function BiohazardCleanupPillarPage() {
  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <Header />
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateCategorySchemas({
  title: 'Biohazard Cleanup Services | NRPG Australia',
  description: 'Professional biohazard cleanup services across Australia. Crime scene, trauma, meth lab decontamination, sewage, hoarding cleanup. Certified and discreet.',
  keywords: [],
  slug: 'biohazard-cleanup',
  categoryName: 'Biohazard Cleanup',
})) }}
      />
      <main className="py-24">
        {/* Hero Section */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <BioForensic size="hero" gradient="bio" aria-label="Biohazard & Forensic Cleaning" />
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              IICRC
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              What Does Professional Biohazard <span className="text-[#00BFA6]">Cleanup Involve?</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8">
              Biohazard cleanup services across Australia, including crime scene decontamination, trauma cleanup, meth lab remediation, and sewage events. EPA-compliant disposal and IICRC-certified contractors.
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
              <div className="text-[#9CA3AF]">IICRC Certified</div>
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
            Biohazard Cleanup Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            <Link href="/services/biohazard-cleanup/crime-scene-cleanup">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <BioForensic size="lg" gradient="bio" className="text-[#EF4444] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Crime Scene Cleanup
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Discreet, trauma-informed crime scene decontamination and biohazard removal. Compliant with state EPA biohazard disposal regulations. Documentation available for police and insurance purposes.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/biohazard-cleanup/trauma-cleanup">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <BioForensic size="lg" gradient="bio" className="text-[#EF4444] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Trauma Cleanup
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Compassionate unattended death, suicide, and serious accident cleanup by trained biohazard specialists. Bloodborne pathogen protocols, full containment, and EPA-compliant disposal.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/biohazard-cleanup/meth-lab-decontamination">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <BioForensic size="lg" gradient="bio" className="text-[#EF4444] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Meth Lab Decontamination
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Clandestine drug laboratory decontamination to NIOSH and Australian state guidelines. Chemical residue testing, specialist PPE, EPA waste disposal, and clearance certificate for property re-occupation.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/biohazard-cleanup/sewage-cleanup">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <BioForensic size="lg" gradient="bio" className="text-[#EF4444] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Sewage Cleanup
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Category 3 sewage backup extraction, porous material removal, and EPA-registered biocide decontamination. Industry-standard documentation for insurance and property management purposes.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            

            <Link href="/services/biohazard-cleanup/hoarding-cleanup">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <BioForensic size="lg" gradient="bio" className="text-[#EF4444] mb-4" aria-hidden="true" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  Hoarding Cleanup
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Sensitive, dignified hoarding property clearance with biohazard decontamination where required. Coordination with social services, estate managers, and property owners available.
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
              { "@type": "Question", "name": "What is biohazard cleanup?", "acceptedAnswer": { "@type": "Answer", "text": "Biohazard cleanup is the professional decontamination and disposal of biological hazards including blood, bodily fluids, chemical exposure, sewage, and trauma scenes. It requires PPE, specialised equipment and certified disposal of biohazardous materials." } },
              { "@type": "Question", "name": "How quickly must a biohazard scene be cleaned?", "acceptedAnswer": { "@type": "Answer", "text": "As quickly as possible. Biological materials begin decomposing within hours, increasing health risks and making decontamination more complex. NRPG provides 24/7 emergency biohazard response across Australia." } },
              { "@type": "Question", "name": "Is biohazard cleanup covered by insurance?", "acceptedAnswer": { "@type": "Answer", "text": "Most building insurance policies cover biohazard cleanup resulting from unforeseen events. Trauma scene cleanup following a crime may be covered by crime-scene assistance riders. NRPG contractors provide complete documentation for insurance claims." } },
              { "@type": "Question", "name": "Do I need to vacate my property during biohazard cleanup?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. For safety, all occupants (including pets) should vacate during biohazard decontamination. NRPG contractors establish containment zones and provide clearance certificates before re-entry is permitted." } }
            ]
          }) }}
        />
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "What is biohazard cleanup?", a: "Biohazard cleanup is the professional decontamination and disposal of biological hazards including blood, bodily fluids, chemical exposure, sewage, and trauma scenes. It requires PPE, specialised equipment and certified disposal of biohazardous materials." },
                { q: "How quickly must a biohazard scene be cleaned?", a: "As quickly as possible. Biological materials begin decomposing within hours, increasing health risks and making decontamination more complex. NRPG provides 24/7 emergency biohazard response across Australia." },
                { q: "Is biohazard cleanup covered by insurance?", a: "Most building insurance policies cover biohazard cleanup resulting from unforeseen events. Trauma scene cleanup following a crime may be covered by crime-scene assistance riders. NRPG contractors provide complete documentation for insurance claims." },
                { q: "Do I need to vacate my property during biohazard cleanup?", a: "Yes. For safety, all occupants (including pets) should vacate during biohazard decontamination. NRPG contractors establish containment zones and provide clearance certificates before re-entry is permitted." }
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
              Emergency Biohazard Cleanup Services?
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
