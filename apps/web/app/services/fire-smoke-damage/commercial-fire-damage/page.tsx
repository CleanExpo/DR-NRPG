import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, Flame, Building2, FileCheck } from "lucide-react"
import { FireSmoke } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Commercial Fire Damage Restoration | Fire & Smoke Damage Australia",
  description: "Commercial fire damage restoration services across Australia. Large-scale fire remediation, server room recovery, regulatory compliance (AS/NZS, BCA), and business continuity planning. Priority emergency response.",
  keywords: ['commercial fire damage', 'business fire restoration', 'office fire damage', 'industrial fire cleanup', 'commercial fire recovery', 'Australia'],
  slug: 'commercial-fire-damage',
  parentSlug: 'fire-smoke-damage',
  parentName: 'Fire & Smoke Damage',
  serviceName: 'Commercial Fire Damage',
})

const processSteps = [
  {
    step: 1,
    title: "Emergency Response & Securing",
    description:
      "Commercial teams mobilise promptly to secure the premises with emergency board-up, structural shoring, and perimeter fencing. Coordination with fire authorities, building management, and insurance providers begins immediately upon dispatch.",
  },
  {
    step: 2,
    title: "Business Impact Assessment",
    description:
      "A comprehensive assessment evaluates structural damage, business-critical systems, inventory losses, and regulatory compliance requirements. We produce a prioritised remediation plan focused on minimising business interruption and accelerating reopening.",
  },
  {
    step: 3,
    title: "Commercial-Scale Remediation",
    description:
      "Industrial-capacity equipment handles large-scale soot removal, smoke decontamination, HVAC purification, and water extraction. Server rooms, warehouses, retail floors, and office spaces are remediated concurrently using multiple teams.",
  },
  {
    step: 4,
    title: "Business Restoration & Reopening",
    description:
      "Full rebuild and restoration to meet BCA (Building Code of Australia) and AS/NZS standards. We coordinate regulatory inspections, occupancy certificates, and compliance sign-off to get your business operational as quickly as possible.",
  },
]

const features = [
  {
    title: "Large-Scale Fire Restoration",
    description:
      "Industrial-capacity restoration for warehouses, factories, retail centres, office buildings, and multi-tenancy complexes. Multiple crews work simultaneously to compress timelines and reduce business interruption.",
  },
  {
    title: "Server & Data Room Recovery",
    description:
      "Specialist recovery of fire and smoke-damaged IT infrastructure including servers, network equipment, storage systems, and cabling. Ultrasonic cleaning and controlled environment restoration of critical hardware.",
  },
  {
    title: "Inventory Salvage Operations",
    description:
      "Systematic assessment, cataloguing, and salvage of commercial inventory. Professional cleaning, deodorisation, and restoration of stock where viable. Detailed loss documentation for insurance claims.",
  },
  {
    title: "Regulatory Compliance (AS/NZS, BCA)",
    description:
      "Full compliance with Australian Standards (AS/NZS), Building Code of Australia (BCA), and state-specific regulations. We coordinate building certifiers, fire engineers, and regulatory inspections throughout restoration.",
  },
  {
    title: "Business Interruption Coordination",
    description:
      "We provide detailed documentation of remediation timelines, cost projections, and scope of works to industry standards. This professional documentation gives your insurer the information they need to assess your business interruption claim — whether it is approved, and to what extent, is determined by your insurer and your policy.",
  },
  {
    title: "Multi-Storey Restoration",
    description:
      "Specialised access equipment, containment systems, and project management for multi-level commercial buildings. Floor-by-floor remediation with phased handback allows partial occupancy during restoration.",
  },
]

const faqs = [
  {
    question: "How do you minimise business downtime during restoration?",
    answer:
      "We deploy multiple crews working extended hours including nights and weekends. Phased restoration allows partial business operations to resume while other areas are still being restored. We prioritise business-critical areas first and provide temporary facilities where possible. Detailed project scheduling ensures predictable reopening dates.",
  },
  {
    question: "What is different about commercial vs residential fire restoration?",
    answer:
      "Commercial restoration involves larger scale equipment, regulatory compliance (BCA, AS/NZS, WHS), business interruption considerations, multi-stakeholder coordination (owners, tenants, insurers, regulators), specialised systems (server rooms, commercial HVAC, fire suppression), and the urgency of resuming business operations.",
  },
  {
    question: "How does insurance work for commercial fire damage?",
    answer:
      "Commercial policies typically cover building damage, contents, stock, business interruption, and temporary premises. NRPG provides detailed scope of works, cost estimates, and progress reporting prepared to industry and Australian standards — professional documentation your insurer and loss adjuster can rely on to assess the claim.",
  },
  {
    question: "What regulatory requirements apply to commercial fire restoration?",
    answer:
      "Commercial restoration must comply with the Building Code of Australia (BCA), relevant Australian Standards (AS/NZS), state-based WHS legislation, fire safety regulations, and local council requirements. An occupancy certificate or compliance certificate is typically required before the business can reopen.",
  },
  {
    question: "What is the typical timeline for commercial fire damage restoration?",
    answer:
      "Timelines vary significantly based on building size and damage severity. Small commercial premises may take 2-4 weeks. Medium-scale damage to offices or retail spaces typically requires 6-12 weeks. Large-scale warehouse or multi-storey restoration can take 3-12 months. We provide detailed schedules during the assessment phase.",
  },
]

export default function CommercialFireDamagePage() {
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
  slug: 'commercial-fire-damage',
  parentSlug: 'fire-smoke-damage',
  parentName: 'Fire & Smoke Damage',
  serviceName: 'Commercial Fire Damage',
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
              src="/images/services/fire-smoke-damage/commercial-fire-damage-hero.webp"
              alt="Commercial fire damage restoration equipment"
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
                <FireSmoke size="hero" gradient="fire" aria-label="Commercial Fire Damage Restoration" />
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
                Qualified Contractors
              </div>
              <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
                Commercial Fire Damage <span className="text-[#00BFA6]">Restoration</span>
              </h1>
              <p className="text-xl text-[#9CA3AF] mb-8 max-w-3xl mx-auto">
                Large-scale commercial fire restoration with priority emergency response. Full regulatory
                compliance, business continuity planning, and insurance coordination across Australia.
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
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">60min</div>
              <div className="text-[#9CA3AF]">Emergency Response</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#2196F3] mb-2">Commercial</div>
              <div className="text-[#9CA3AF]">Grade Equipment</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">Full</div>
              <div className="text-[#9CA3AF]">BCA Compliance</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">Business</div>
              <div className="text-[#9CA3AF]">Continuity Focus</div>
            </div>
          </div>
        </section>

        {/* Our Process */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Commercial Restoration Process
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
            Commercial Fire Damage Services
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
                Commercial Fire Impact
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Business interruption costs escalate rapidly with every day of closure</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Employee displacement and workforce retention challenges</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Regulatory penalties for non-compliance during restoration</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Supply chain disruption affecting customers and partners</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Customer and client confidence impact on ongoing relationships</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Lease obligations and insurance compliance requirements</span>
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
              { name: "Smoke Odour Removal", href: "/services/fire-smoke-damage/smoke-odor-removal" },
              { name: "Soot Removal & Cleaning", href: "/services/fire-smoke-damage/soot-removal" },
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
              Commercial Fire Emergency?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Priority emergency response. Commercial-grade restoration with full regulatory compliance.
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
