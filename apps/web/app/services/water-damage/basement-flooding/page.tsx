import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, Droplets, Clock, Shield, ArrowRight } from "lucide-react"
import { WaterDamage } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Basement Flooding Services | Water Damage Restoration Australia",
  description: "Professional basement flooding restoration across Australia. Submersible pump extraction, foundation waterproofing, and sewage contamination handling. Qualified. Priority emergency response.",
  keywords: ['basement flooding', 'basement water damage', 'flooded basement', 'basement restoration', 'water extraction basement', 'sump pump', 'basement waterproofing', 'Australia'],
  slug: 'basement-flooding',
  parentSlug: 'water-damage',
  parentName: 'Water Damage',
  serviceName: 'Basement Flooding',
})

const processSteps = [
  { step: 1, title: "Assessment & Water Extraction", description: "Our technicians assess contamination category and water depth, then deploy submersible pumps for rapid extraction of standing water from your basement." },
  { step: 2, title: "Sump Pump Installation", description: "We install or repair sump pump systems to prevent ongoing water ingress and ensure continuous drainage throughout the restoration process." },
  { step: 3, title: "Dehumidification", description: "Industrial-grade dehumidifiers and air movers are strategically placed to remove moisture from walls, floors, and subfloor cavities." },
  { step: 4, title: "Waterproofing & Prevention", description: "Final waterproofing treatments are applied to basement walls and floors to prevent future flooding, with drainage solutions tailored to your property." },
]

const features = [
  { title: "Submersible Pump Extraction", description: "High-capacity submersible pumps remove standing water quickly, regardless of depth or volume, minimising secondary damage to your property." },
  { title: "Foundation Waterproofing", description: "Professional-grade waterproofing membranes and coatings applied to basement walls and floors to prevent future water intrusion." },
  { title: "Sump Pump Systems", description: "Installation, repair, and maintenance of sump pump systems with battery backup to protect against future basement flooding events." },
  { title: "Sewage Contamination Handling", description: "Category 3 black water contamination safely managed with biohazard protocols, antimicrobial treatments, and proper disposal procedures." },
  { title: "Structural Drying", description: "Monitored drying programs using moisture meters and thermal imaging to ensure all structural elements reach safe moisture levels." },
  { title: "Insurance Documentation", description: "Comprehensive photo documentation, moisture readings, and detailed reports prepared to support your insurance claim from start to finish." },
]

const faqs = [
  { question: "How quickly can you respond to basement flooding?", answer: "Priority dispatch applies to all emergency basement flooding requests. Contractors are on standby 24/7 with fully equipped vehicles and aim to arrive as quickly as possible (typically within 2 hours in major Australian metropolitan areas)." },
  { question: "Is basement flood water dangerous?", answer: "Yes. Standing water in basements can contain sewage, chemicals, and bacteria. It also poses electrical hazards and can compromise your foundation. Never enter a flooded basement until a professional has assessed electrical safety." },
  { question: "Will my insurance cover basement flooding?", answer: "Most Australian home insurance policies cover sudden and accidental water damage, including burst pipes and storm damage. We provide industry-standard documentation — scope of works, moisture reports, and photographic evidence — for you to submit to your insurer." },
  { question: "How long does basement flood restoration take?", answer: "Extraction typically takes 4-12 hours depending on volume. Full structural drying usually requires 3-5 days of monitored dehumidification. We provide daily moisture readings to track progress." },
  { question: "Can you prevent future basement flooding?", answer: "Yes. We offer comprehensive waterproofing solutions including sump pump installation, drainage improvements, waterproof membranes, and foundation sealing to protect against future flooding events." },
]

export default function BasementFloodingPage() {
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
  slug: 'basement-flooding',
  parentSlug: 'water-damage',
  parentName: 'Water Damage',
  serviceName: 'Basement Flooding',
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
              src="/images/services/water-damage/basement-flooding-hero.webp"
              alt="Basement flooding restoration with submersible pump extraction"
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
              <WaterDamage size="hero" gradient="water" aria-label="Basement Flooding Services" />
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              Qualified Contractors
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Basement Flooding <span className="text-[#00BFA6]">Restoration</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8 max-w-2xl mx-auto">
              Professional basement flooding extraction and restoration services across Australia. From emergency water removal to complete waterproofing solutions, our qualified technicians handle all contamination categories.
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
              <div className="text-3xl font-bold text-[#2196F3] mb-2">Cat 1-3</div>
              <div className="text-[#9CA3AF]">Water Categories</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">Industry</div>
              <div className="text-[#9CA3AF]">Standard</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">Water</div>
              <div className="text-[#9CA3AF]">Extraction</div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Basement Flooding Process
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
            Comprehensive Basement Flooding Solutions
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
              <h2 className="font-poppins font-semibold text-2xl text-white">Health & Safety Risks from Standing Water</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Mould growth begins within 24-48 hours",
                "Electrical hazards from submerged wiring",
                "Structural damage to foundations and walls",
                "Bacteria and pathogen contamination",
                "Sewage contamination in Category 3 water",
                "Foundation compromise from prolonged saturation",
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
              { title: "Flood Restoration", href: "/services/water-damage/flood-restoration", desc: "Complete flood water extraction and decontamination services." },
              { title: "Structural Drying", href: "/services/water-damage/structural-drying", desc: "Professional monitored drying programs for all structures." },
              { title: "Burst Pipe Repair", href: "/services/water-damage/burst-pipe-repair", desc: "Emergency pipe isolation and water damage restoration." },
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
              Basement Flooding Emergency?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Do not enter a flooded basement without professional assessment. Request emergency service now for immediate assistance.
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
