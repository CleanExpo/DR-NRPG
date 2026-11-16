import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, Droplets, Clock, Shield, ArrowRight } from "lucide-react"
import { WaterDamage } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Structural Drying Services | Water Damage Restoration Australia",
  description: "Professional structural drying services across Australia. Thermal imaging, desiccant dehumidification, Injectidry cavity drying, and daily moisture monitoring.",
  keywords: ['structural drying', 'dehumidification', 'moisture removal', 'building drying', 'injectidry', 'desiccant drying', 'drying program', 'Australia'],
  slug: 'structural-drying',
  parentSlug: 'water-damage',
  parentName: 'Water Damage',
  serviceName: 'Structural Drying',
})

const processSteps = [
  { step: 1, title: "Moisture Mapping", description: "Comprehensive moisture mapping using thermal imaging cameras and pin/pinless moisture meters to identify all affected areas, including hidden moisture in cavities and subfloors." },
  { step: 2, title: "Drying Plan Development", description: "A customised drying plan is developed based on psychrometric calculations, material types, and environmental conditions to achieve optimal drying efficiency." },
  { step: 3, title: "Monitored Drying", description: "Industrial dehumidifiers, air movers, and specialty drying systems are deployed with daily moisture readings to track progress against target levels." },
  { step: 4, title: "Verification & Clearance", description: "Final moisture verification confirms all materials have reached acceptable levels per industry standards. A clearance certificate is issued for your records and insurance." },
]

const features = [
  { title: "Thermal Imaging Assessment", description: "FLIR thermal imaging cameras detect hidden moisture behind walls, under floors, and in ceiling cavities that cannot be seen with the naked eye." },
  { title: "Desiccant Dehumidification", description: "High-capacity desiccant dehumidifiers for large-scale and low-temperature drying applications where refrigerant systems are less effective." },
  { title: "Injectidry Cavity Drying", description: "Specialised Injectidry systems inject warm, dry air directly into wall cavities, cabinetry, and enclosed spaces for targeted structural drying." },
  { title: "HEPA Air Filtration", description: "HEPA-filtered air scrubbers remove airborne mould spores, dust, and contaminants during the drying process, maintaining indoor air quality." },
  { title: "Daily Moisture Monitoring", description: "Technicians take daily moisture readings at documented test points, providing you with progress reports and adjusting equipment placement as needed." },
  { title: "Psychrometric Calculations", description: "Scientific psychrometric analysis ensures optimal temperature, humidity, and airflow conditions for the fastest and most thorough drying outcome." },
]

const faqs = [
  { question: "How long does structural drying take?", answer: "Most residential structural drying projects take 3-5 days. Commercial properties and severe water damage may require 5-10 days. Duration depends on materials affected, water volume, and environmental conditions." },
  { question: "Why can't I just open windows to dry my property?", answer: "Natural drying is unreliable and often too slow to prevent mould growth. Professional drying uses controlled dehumidification to extract moisture faster than evaporation alone, with monitoring to confirm safe moisture levels." },
  { question: "What is psychrometric drying?", answer: "Psychrometric drying uses scientific calculations of temperature, humidity, and air movement to create the optimal drying environment. This approach dries structures faster and more thoroughly than trial-and-error methods." },
  { question: "How do you know when drying is complete?", answer: "We take moisture readings at documented test points daily and compare them to the industry target moisture levels for each material type. Drying is complete only when all readings meet or fall below these targets." },
  { question: "Does insurance cover structural drying?", answer: "Yes. Most Australian insurance policies cover structural drying as part of water damage restoration. We provide comprehensive documentation including moisture maps, daily readings, and a clearance certificate for your claim." },
]

export default function StructuralDryingPage() {
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
  slug: 'structural-drying',
  parentSlug: 'water-damage',
  parentName: 'Water Damage',
  serviceName: 'Structural Drying',
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
              src="/images/services/water-damage/structural-drying-hero.webp"
              alt="Structural drying with industrial dehumidification equipment"
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
              <WaterDamage size="hero" gradient="water" aria-label="Structural Drying Services" />
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              Qualified Contractors
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Structural Drying <span className="text-[#00BFA6]">Services</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8 max-w-2xl mx-auto">
              Scientific structural drying services across Australia. Our qualified technicians use thermal imaging, psychrometric calculations, and daily monitoring to ensure your property is dried to safe moisture levels.
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
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">Daily</div>
              <div className="text-[#9CA3AF]">Moisture Monitoring</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#2196F3] mb-2">Industry</div>
              <div className="text-[#9CA3AF]">Target Standards</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">HEPA</div>
              <div className="text-[#9CA3AF]">Air Filtered</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">Thermal</div>
              <div className="text-[#9CA3AF]">Imaging Mapped</div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Structural Drying Process
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
            Advanced Structural Drying Solutions
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
              <h2 className="font-poppins font-semibold text-2xl text-white">Why Professional Drying Matters</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Incomplete drying leads to mould growth within days",
                "Structural rot weakens timber framing and flooring",
                "Warping and buckling of floorboards and cabinetry",
                "Adhesive failure in flooring and wall coverings",
                "Microbial amplification in hidden wall cavities",
                "Secondary damage costs far exceed initial restoration",
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
              { title: "Basement Flooding", href: "/services/water-damage/basement-flooding", desc: "Complete basement water extraction and waterproofing." },
              { title: "Flood Restoration", href: "/services/water-damage/flood-restoration", desc: "Complete flood water extraction and decontamination." },
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
              Need Professional Structural Drying?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Incomplete drying leads to mould, rot, and costly secondary damage. Request professional structural drying services now.
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
