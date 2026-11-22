import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, Flame, Wind, Zap } from "lucide-react"
import { FireSmoke } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Smoke Odour Removal Services | Fire & Smoke Damage Australia",
  description: "Professional smoke odour removal services across Australia. Advanced ozone, hydroxyl, and thermal fogging technology for complete odour elimination. Qualified fire and smoke restoration technicians. Verified results.",
  keywords: ['smoke odor removal', 'smoke smell removal', 'fire odor elimination', 'thermal fogging', 'hydroxyl generator', 'ozone treatment', 'Australia'],
  slug: 'smoke-odor-removal',
  parentSlug: 'fire-smoke-damage',
  parentName: 'Fire & Smoke Damage',
  serviceName: 'Smoke Odor Removal',
})

const processSteps = [
  {
    step: 1,
    title: "Odour Source Identification",
    description:
      "Our technicians conduct a comprehensive inspection to identify all odour sources including smoke-saturated materials, HVAC contamination, structural cavities, and porous surfaces. Thermal imaging and moisture meters help locate hidden odour reservoirs.",
  },
  {
    step: 2,
    title: "Surface Deodorisation",
    description:
      "All accessible surfaces are cleaned and treated with professional-grade deodorising agents. Smoke-saturated soft furnishings, carpets, and textiles are treated or removed. Walls, ceilings, and hard surfaces receive chemical treatment to break down odour compounds.",
  },
  {
    step: 3,
    title: "Advanced Odour Technology",
    description:
      "Industrial ozone generators, hydroxyl radical machines, and thermal fogging equipment are deployed to neutralise odour molecules at the molecular level. These technologies penetrate walls, cavities, fabrics, and HVAC systems where manual cleaning cannot reach.",
  },
  {
    step: 4,
    title: "Verification Testing",
    description:
      "Post-treatment air quality testing confirms odour elimination meets acceptable standards. Follow-up inspections ensure no residual odour returns as temperature and humidity change. A clearance report is provided for your records.",
  },
]

const features = [
  {
    title: "Ozone Generation Treatment",
    description:
      "Industrial ozone generators produce activated oxygen that breaks down smoke odour molecules at the molecular level. Ozone penetrates every surface, cavity, and textile fibre for complete neutralisation.",
  },
  {
    title: "Hydroxyl Radical Technology",
    description:
      "Safe-to-occupy hydroxyl generators produce radicals that destroy odour compounds in the air and on surfaces. Unlike ozone, hydroxyl treatment allows continued occupancy during the deodorisation process.",
  },
  {
    title: "Thermal Fogging",
    description:
      "Heated deodorant fog penetrates the same microscopic spaces that smoke particles entered. The fog follows the same pathways as the original smoke, neutralising odours in walls, ceilings, and concealed cavities.",
  },
  {
    title: "HEPA Air Scrubbing",
    description:
      "Hospital-grade HEPA filtration removes airborne smoke particles down to 0.3 microns. Continuous air scrubbing during restoration ensures clean breathing air and prevents cross-contamination between treated areas.",
  },
  {
    title: "Encapsulation Sealing",
    description:
      "Specialist sealant coatings encapsulate residual odour compounds trapped deep within porous materials like timber, concrete, and masonry. This prevents future off-gassing without requiring full material replacement.",
  },
  {
    title: "Air Quality Testing",
    description:
      "Professional air quality monitoring before, during, and after treatment verifies odour elimination. We use calibrated instruments to measure particulate levels and volatile organic compounds to confirm safe re-occupancy.",
  },
]

const faqs = [
  {
    question: "How long does professional smoke odour removal take?",
    answer:
      "Treatment duration depends on the severity and extent of contamination. A single room may take 1-2 days. A full house typically requires 3-7 days for complete odour elimination including surface treatment, ozone or hydroxyl processing, and verification. Severely affected properties may require multiple treatment cycles over 2-3 weeks.",
  },
  {
    question: "Can you remove cigarette smoke odour from a property?",
    answer:
      "Yes. Cigarette smoke odour is one of our most common requests. Years of cigarette smoke saturate walls, ceilings, carpets, curtains, and HVAC systems. We use a combination of surface cleaning, ozone treatment, encapsulation sealing, and HVAC decontamination to fully eliminate embedded cigarette smoke odour.",
  },
  {
    question: "Does ozone treatment really work for smoke odour?",
    answer:
      "Yes, ozone is highly effective for smoke odour removal. Ozone (O3) is a powerful oxidiser that breaks down odour-causing molecules rather than masking them. However, ozone treatment must be performed by qualified professionals as high ozone concentrations are harmful to humans, pets, and plants. The property must be vacated during treatment.",
  },
  {
    question: "Can you remove smoke odour from clothing and fabrics?",
    answer:
      "Yes. We offer professional textile restoration including ozone treatment, specialist dry cleaning, and wet cleaning for smoke-damaged clothing, curtains, bedding, and soft furnishings. Items are individually assessed and treated using the most appropriate method for each fabric type.",
  },
  {
    question: "Do you guarantee complete odour removal?",
    answer:
      "We guarantee our work meets industry standards for smoke odour remediation. In the vast majority of cases, we achieve complete odour elimination. In rare instances where odour compounds have deeply penetrated structural materials, we may recommend targeted material replacement combined with encapsulation for a permanent solution.",
  },
]

export default function SmokeOdourRemovalPage() {
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
  slug: 'smoke-odor-removal',
  parentSlug: 'fire-smoke-damage',
  parentName: 'Fire & Smoke Damage',
  serviceName: 'Smoke Odor Removal',
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
              src="/images/services/fire-smoke-damage/smoke-odor-removal-hero.webp"
              alt="Smoke odour removal with ozone and hydroxyl equipment"
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
              <FireSmoke size="hero" gradient="fire" aria-label="Smoke Odour Removal" />
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              Qualified Contractors
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Smoke Odour Removal <span className="text-[#00BFA6]">Services</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8 max-w-3xl mx-auto">
              Complete smoke odour elimination using advanced ozone, hydroxyl, and thermal fogging technology.
              Qualified fire and smoke restoration technicians delivering verified, permanent results.
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
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">Odour</div>
              <div className="text-[#9CA3AF]">Source Treatment</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#2196F3] mb-2">3</div>
              <div className="text-[#9CA3AF]">Technologies Used</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">HEPA</div>
              <div className="text-[#9CA3AF]">Air Filtered</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">Verified</div>
              <div className="text-[#9CA3AF]">Clean Results</div>
            </div>
          </div>
        </section>

        {/* Our Process */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Smoke Odour Removal Process
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
            Advanced Odour Removal Technologies
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
                Why DIY Odour Removal Fails
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Smoke penetrates deep into porous materials beyond surface cleaning</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Air fresheners and sprays only mask odour temporarily</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Incomplete treatment causes recontamination from untreated areas</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Structural cavities and wall voids trap odour compounds</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">HVAC systems circulate odour throughout the entire property</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Professional-grade equipment is required for permanent elimination</span>
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
              { name: "Smoke Damage Restoration", href: "/services/fire-smoke-damage/smoke-damage-restoration" },
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
              Need Professional Smoke Odour Removal?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Advanced technology for permanent odour elimination. Verified results guaranteed.
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
