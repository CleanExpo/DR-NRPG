import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, Flame, Wind, Thermometer } from "lucide-react"
import { FireSmoke } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Smoke Damage Restoration Services | Fire & Smoke Damage Australia",
  description: "Professional smoke damage restoration services across Australia. Qualified fire and smoke restoration technicians specialising in all smoke types, HVAC decontamination, and air quality verification. 24/7 response.",
  keywords: ['smoke damage restoration', 'smoke cleanup', 'smoke stain removal', 'smoke remediation', 'soot damage', 'Australia'],
  slug: 'smoke-damage-restoration',
  parentSlug: 'fire-smoke-damage',
  parentName: 'Fire & Smoke Damage',
  serviceName: 'Smoke Damage Restoration',
})

const processSteps = [
  {
    step: 1,
    title: "Smoke Damage Assessment",
    description:
      "Our qualified technicians conduct a thorough assessment to identify smoke type (dry, wet, protein, or fuel oil), affected areas, penetration depth, and the scope of contamination across all surfaces, HVAC systems, and concealed cavities.",
  },
  {
    step: 2,
    title: "Surface Cleaning & Treatment",
    description:
      "Using type-specific cleaning protocols, we remove smoke residue from all hard and soft surfaces. Dry sponge techniques, chemical cleaners, and abrasive methods are matched to each smoke type to prevent further damage during cleaning.",
  },
  {
    step: 3,
    title: "HVAC Decontamination",
    description:
      "Complete cleaning and sanitisation of all heating, ventilation, and air conditioning ductwork, filters, coils, and components. Smoke particles travel through HVAC systems and contaminate every connected room if not properly addressed.",
  },
  {
    step: 4,
    title: "Air Quality Verification",
    description:
      "Post-remediation air quality testing confirms particulate levels meet safe re-occupancy standards. HEPA air scrubbers run continuously during restoration and final clearance testing verifies the property is safe for habitation.",
  },
]

const features = [
  {
    title: "Protein Residue Removal",
    description:
      "Virtually invisible protein smoke from kitchen fires discolours paint and varnish over time. Our specialist detection and cleaning protocols identify and remove protein residue before permanent staining occurs.",
  },
  {
    title: "Dry Smoke Cleaning",
    description:
      "High-temperature, fast-burning fires produce dry, powdery smoke residue. We use dry sponge techniques and HEPA vacuuming to remove residue without smearing, followed by chemical treatment of affected surfaces.",
  },
  {
    title: "Wet Smoke Remediation",
    description:
      "Low-temperature, smouldering fires create thick, sticky wet smoke residue that is difficult to clean. Our technicians use solvent-based cleaners and specialised techniques designed specifically for wet smoke compounds.",
  },
  {
    title: "HVAC Smoke Decontamination",
    description:
      "Comprehensive cleaning of all ductwork, air handling units, filters, and components. We prevent smoke particles from recirculating through your property and install new filters to ensure clean air distribution.",
  },
  {
    title: "Electronics Smoke Damage",
    description:
      "Smoke residue is corrosive and conductive, causing short circuits and accelerated corrosion in electronics. Our specialists clean circuit boards, connectors, and components using ultrasonic and contact cleaning methods.",
  },
  {
    title: "Textile & Fabric Restoration",
    description:
      "Professional restoration of smoke-damaged clothing, curtains, upholstery, and carpets using ozone treatment, dry cleaning, wet cleaning, and deodorisation techniques tailored to each fabric type.",
  },
]

const faqs = [
  {
    question: "What are the different types of smoke damage?",
    answer:
      "There are four primary types: dry smoke (high temperature, fast burning - powdery residue), wet smoke (low temperature, smouldering - sticky, thick residue), protein smoke (organic matter burning - nearly invisible but strong odour), and fuel oil soot (petroleum-based - thick, black, and sticky). Each requires different cleaning methods and chemicals.",
  },
  {
    question: "How far can smoke travel from the fire source?",
    answer:
      "Smoke can travel throughout an entire building via air currents, HVAC systems, wall cavities, and ceiling spaces. It is common for smoke damage to affect rooms on different floors or opposite ends of a property from the fire source. Every room connected to the HVAC system should be assessed.",
  },
  {
    question: "Can smoke damage be fully cleaned?",
    answer:
      "In most cases, yes. Professional smoke damage restoration can fully clean and restore surfaces, textiles, electronics, and structural elements. The key factor is speed - the sooner cleaning begins, the better the outcome. Smoke residue becomes increasingly difficult to remove over time as it bonds chemically with surfaces.",
  },
  {
    question: "Is HVAC affected by smoke damage?",
    answer:
      "Absolutely. HVAC systems draw smoke particles into ductwork, filters, coils, and air handling units. If not professionally cleaned, the system will recirculate smoke particles and odours every time it operates. We recommend full HVAC decontamination as part of any smoke damage restoration.",
  },
  {
    question: "What are the health risks of smoke damage?",
    answer:
      "Smoke residue contains carcinogens, volatile organic compounds (VOCs), and fine particulate matter. Exposure can cause respiratory irritation, headaches, nausea, and long-term health effects. Children, elderly, and those with respiratory conditions are particularly vulnerable. Professional remediation is essential for safe re-occupancy.",
  },
]

export default function SmokeDamageRestorationPage() {
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
  slug: 'smoke-damage-restoration',
  parentSlug: 'fire-smoke-damage',
  parentName: 'Fire & Smoke Damage',
  serviceName: 'Smoke Damage Restoration',
  faqs,
})) }}
      />
      <main className="py-24">
        {/* Breadcrumb */}
        <section className="container mx-auto px-6 mb-8">
          <Link
            href="/services/fire-smoke-damage"
            className="inline-flex items-center text-[#9CA3AF] hover:text-[#00BFA6] transition-colors text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Fire & Smoke Damage Services
          </Link>
        </section>

        {/* Hero Section */}
        <section className="relative overflow-hidden mb-16">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/services/fire-smoke-damage/smoke-damage-restoration-hero.webp"
              alt="Smoke damage restoration with HEPA air scrubbers"
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
              <FireSmoke size="hero" gradient="fire" aria-label="Smoke Damage Restoration" />
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              Qualified Contractors
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Smoke Damage Restoration <span className="text-[#00BFA6]">Services</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8 max-w-3xl mx-auto">
              Expert removal and restoration for all smoke damage types. Qualified fire and smoke restoration
              technicians with specialist equipment for HVAC decontamination and air quality verification.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                Request Emergency Service
              </Button>
              <Button
                variant="outline"
                className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] px-8 py-3 text-lg bg-transparent"
              >
                Get a Quote
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
              <div className="text-3xl font-bold text-[#2196F3] mb-2">4</div>
              <div className="text-[#9CA3AF]">Smoke Types Treated</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">HVAC</div>
              <div className="text-[#9CA3AF]">Systems Cleared</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">Air</div>
              <div className="text-[#9CA3AF]">Quality Verified</div>
            </div>
          </div>
        </section>

        {/* Our Process */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Smoke Damage Restoration Process
          </h2>
          <div className="max-w-4xl mx-auto space-y-8">
            {processSteps.map((step) => (
              <div key={step.step} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#00BFA6] rounded-full flex items-center justify-center text-[#0F1115] font-bold text-lg">
                  {step.step}
                </div>
                <div className="flex-1 bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]">
                  <h3 className="font-poppins font-semibold text-lg text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[#9CA3AF]">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Comprehensive Smoke Damage Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]"
              >
                <Flame className="h-8 w-8 text-[#EF4444] mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#9CA3AF] text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Warning Section */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-8 w-8 text-[#FFD700]" />
              <h2 className="font-poppins font-semibold text-2xl text-white">
                Types of Smoke Damage
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Dry smoke from fast, high-temperature fires leaves powdery residue</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Wet smoke from slow, low-temperature fires creates thick, sticky deposits</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Protein smoke is nearly invisible but produces extreme odours</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Fuel oil soot is thick, sticky, and requires specialist solvents</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Each smoke type requires a different cleaning approach and chemicals</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">All smoke residue is harmful if inhaled and should not be disturbed without PPE</span>
                </div>
              </div>
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
              <div
                key={faq.question}
                className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]"
              >
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-[#9CA3AF]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Services */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Related Fire & Smoke Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Fire Damage Restoration", href: "/services/fire-smoke-damage/fire-damage-restoration" },
              { name: "Smoke Odour Removal", href: "/services/fire-smoke-damage/smoke-odor-removal" },
              { name: "Soot Removal & Cleaning", href: "/services/fire-smoke-damage/soot-removal" },
              { name: "Commercial Fire Damage", href: "/services/fire-smoke-damage/commercial-fire-damage" },
            ].map((service) => (
              <Link key={service.href} href={service.href}>
                <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-5 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer text-center">
                  <FireSmoke size="md" gradient="fire" className="mx-auto mb-3" aria-hidden="true" />
                  <h3 className="font-poppins font-semibold text-sm text-white">{service.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Emergency CTA */}
        <section className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-[#EF4444] to-[#DC2626] rounded-2xl p-12 text-center">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-white mb-4">
              Need Immediate Smoke Damage Restoration?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              24/7 emergency response. All smoke types treated by qualified professionals.
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
