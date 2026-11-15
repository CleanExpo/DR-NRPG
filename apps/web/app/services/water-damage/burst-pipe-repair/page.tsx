import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, Droplets, Clock, Shield, ArrowRight } from "lucide-react"
import { WaterDamage } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Burst Pipe Repair & Water Damage | Water Damage Restoration Australia",
  description: "Emergency burst pipe repair and water damage restoration across Australia. Rapid shutoff, pipe repair coordination, and complete water extraction. 24/7 response.",
  keywords: ['burst pipe repair', 'broken pipe', 'pipe leak damage', 'emergency plumbing', 'water damage pipe', 'pipe restoration', 'Australia'],
  slug: 'burst-pipe-repair',
  parentSlug: 'water-damage',
  parentName: 'Water Damage',
  serviceName: 'Burst Pipe Repair',
})

const processSteps = [
  { step: 1, title: "Emergency Shutoff & Containment", description: "Our team locates and isolates the burst pipe, shutting off water supply to prevent further damage while containing the spread of water." },
  { step: 2, title: "Pipe Repair Coordination", description: "We coordinate with licensed plumbers for permanent pipe repair, whether copper, PVC, or PEX, ensuring the source is fully resolved." },
  { step: 3, title: "Water Extraction & Drying", description: "Industrial extraction equipment removes all standing water, followed by strategic placement of dehumidifiers and air movers for structural drying." },
  { step: 4, title: "Restoration & Reinstatement", description: "Damaged walls, ceilings, and flooring are restored to pre-loss condition with full documentation provided for insurance purposes." },
]

const features = [
  { title: "Emergency Pipe Isolation", description: "Rapid location and isolation of the burst pipe to stop water flow immediately, minimising the extent of damage to your property." },
  { title: "Copper/PVC/PEX Repair Coordination", description: "We coordinate with licensed plumbers experienced in all pipe materials including copper, PVC, PEX, and galvanised steel repairs." },
  { title: "Cavity Wall Drying", description: "Specialised injection drying systems target moisture trapped within wall cavities, preventing hidden mould growth and structural deterioration." },
  { title: "Ceiling Collapse Prevention", description: "Controlled drainage of water-logged ceilings to prevent sudden collapse, with structural support provided during the extraction process." },
  { title: "Frozen Pipe Prevention", description: "Assessment and recommendations for pipe insulation and protection in cold-climate areas to prevent future burst pipe incidents." },
  { title: "After-Hours Response", description: "Our emergency teams are available 24 hours a day, 7 days a week, including public holidays, for immediate burst pipe response." },
]

const faqs = [
  { question: "What should I do if a pipe bursts in my home?", answer: "Immediately turn off your main water supply at the meter. Switch off electricity at the mains if water is near electrical outlets. Then contact us for emergency response. Do not attempt to repair the pipe yourself." },
  { question: "How quickly can you respond to a burst pipe?", answer: "Priority dispatch applies to all emergency burst pipe requests. Contractors are available 24/7 and aim to arrive as quickly as possible in metro areas, with fully equipped vehicles ready for immediate water removal." },
  { question: "Will a burst pipe cause mould?", answer: "Yes, if not addressed promptly. Mould can begin growing within 24-48 hours of water exposure. Our rapid response and thorough drying programs are designed to prevent mould development." },
  { question: "Does insurance cover burst pipe damage?", answer: "Most Australian home insurance policies cover sudden and accidental burst pipe damage. We provide comprehensive documentation including moisture readings, photos, and detailed reports for your claim." },
  { question: "How long does burst pipe restoration take?", answer: "Emergency extraction typically takes a few hours. Structural drying requires 3-5 days of monitored dehumidification. Full restoration including wall and ceiling repairs may take 1-2 weeks depending on severity." },
]

export default function BurstPipeRepairPage() {
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
  slug: 'burst-pipe-repair',
  parentSlug: 'water-damage',
  parentName: 'Water Damage',
  serviceName: 'Burst Pipe Repair',
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
              src="/images/services/water-damage/burst-pipe-repair-hero.webp"
              alt="Emergency burst pipe water damage restoration"
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
              <WaterDamage size="hero" gradient="water" aria-label="Burst Pipe Repair Services" />
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              Qualified Contractors
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Burst Pipe Repair & <span className="text-[#00BFA6]">Water Damage</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8 max-w-2xl mx-auto">
              Emergency burst pipe response and complete water damage restoration. Our qualified technicians provide rapid shutoff, extraction, and drying to minimise property damage across Australia.
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
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">24/7</div>
              <div className="text-[#9CA3AF]">Emergency Response</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#2196F3] mb-2">Rapid</div>
              <div className="text-[#9CA3AF]">Pipe Shutoff</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">Industry</div>
              <div className="text-[#9CA3AF]">Standard</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">All</div>
              <div className="text-[#9CA3AF]">Pipe Specialists</div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Burst Pipe Response Process
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
            Complete Burst Pipe Solutions
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
              <h2 className="font-poppins font-semibold text-2xl text-white">Signs of a Burst Pipe</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Sudden drop in water pressure",
                "Unexplained water stains on walls or ceilings",
                "Hissing or rushing sounds behind walls",
                "Wet spots on floors or carpets",
                "Unexpectedly high water bill",
                "Discoloured or rusty water from taps",
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
              { title: "Ceiling Water Damage", href: "/services/water-damage/ceiling-water-damage", desc: "Repair and restoration for water-damaged ceilings." },
              { title: "Structural Drying", href: "/services/water-damage/structural-drying", desc: "Professional monitored drying programs for all structures." },
              { title: "Carpet Water Damage", href: "/services/water-damage/carpet-water-damage", desc: "Carpet extraction, drying, and reinstallation services." },
              { title: "Basement Flooding", href: "/services/water-damage/basement-flooding", desc: "Complete basement water extraction and waterproofing." },
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
              Burst Pipe Emergency?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Turn off your water mains immediately and contact us. 24/7 emergency response with rapid pipe isolation and water extraction.
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
