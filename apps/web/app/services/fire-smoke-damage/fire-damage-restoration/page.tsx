import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, Flame, Shield, Clock, Building2 } from "lucide-react"
import { FireSmoke } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Fire Damage Restoration Services | Fire & Smoke Damage Australia",
  description: "Professional fire damage restoration services across Australia. IICRC FSRT-certified technicians providing emergency board-up, structural assessment, remediation, and full rebuild. 24/7 response.",
  keywords: ['fire damage restoration', 'fire damage repair', 'fire cleanup', 'house fire restoration', 'fire recovery', 'IICRC fire', 'Australia'],
  slug: 'fire-damage-restoration',
  parentSlug: 'fire-smoke-damage',
  parentName: 'Fire & Smoke Damage',
  serviceName: 'Fire Damage Restoration',
})

const processSteps = [
  {
    step: 1,
    title: "Emergency Board-Up & Securing",
    description:
      "IICRC-certified contractors target rapid on-site response (typically within 2 hours in metro areas) to secure the property with emergency board-up, tarping, and fencing. This prevents further damage from weather exposure, vandalism, and unauthorised access whilst preserving evidence for insurance.",
  },
  {
    step: 2,
    title: "Structural Assessment",
    description:
      "Qualified structural engineers assess load-bearing walls, roof trusses, floors, and foundations. A detailed damage report is produced identifying what can be salvaged, what requires remediation, and what must be rebuilt.",
  },
  {
    step: 3,
    title: "Fire Damage Remediation",
    description:
      "IICRC FSRT-certified technicians remove charred materials, clean soot and smoke residue from all surfaces, decontaminate HVAC systems, and neutralise odours using industrial ozone and hydroxyl technology.",
  },
  {
    step: 4,
    title: "Rebuild & Restoration",
    description:
      "Full reconstruction services restore your property to pre-loss condition or better. We coordinate all trades including carpentry, electrical, plumbing, plastering, and painting under a single project manager.",
  },
]

const features = [
  {
    title: "Emergency Board-Up & Tarping",
    description:
      "Immediate property securing with fire-rated boarding, heavy-duty tarps, and perimeter fencing to prevent secondary damage from weather and unauthorised entry.",
  },
  {
    title: "Structural Fire Damage Assessment",
    description:
      "Comprehensive engineering assessments of all structural elements including load-bearing walls, roof systems, foundations, and floor joists to determine integrity and repair scope.",
  },
  {
    title: "Smoke & Soot Removal",
    description:
      "Professional removal of all smoke and soot residue from walls, ceilings, timber, masonry, and metal surfaces using IICRC-approved chemical treatments and HEPA filtration.",
  },
  {
    title: "Water Damage from Fire Suppression",
    description:
      "Extraction and drying of water damage caused by fire brigade hoses and sprinkler systems. Industrial dehumidifiers and air movers prevent mould growth and secondary damage.",
  },
  {
    title: "Content Cleaning & Restoration",
    description:
      "Salvage and restoration of personal belongings, furniture, electronics, documents, and textiles using ultrasonic cleaning, dry cleaning, and ozone treatment technologies.",
  },
  {
    title: "Insurance Claim Management",
    description:
      "Complete industry-standard documentation including photographic evidence, itemised scope of works, and professional reports — everything you need to submit your insurance claim.",
  },
]

const faqs = [
  {
    question: "When can fire damage cleanup begin?",
    answer:
      "Cleanup can begin as soon as the fire brigade has cleared the property and deemed it safe to enter. Contractors aim to arrive as quickly as possible (typically within 2 hours in metro areas) to begin board-up and securing. Full remediation typically commences within 24-48 hours once the structural assessment is complete.",
  },
  {
    question: "What should I do immediately after a fire?",
    answer:
      "First, ensure everyone is safe and accounted for. Do not re-enter the property until the fire brigade gives clearance. Contact your insurance company to lodge a claim, then contact us for emergency board-up and securing. Avoid touching or cleaning any surfaces as incorrect methods can cause permanent damage.",
  },
  {
    question: "Does insurance cover fire damage restoration?",
    answer:
      "Most home and business insurance policies cover fire damage restoration including emergency board-up, structural repairs, smoke and soot removal, content cleaning, and temporary accommodation. NRPG contractors produce industry-standard documentation accepted by all major Australian insurers including Allianz, NRMA, Suncorp, and QBE — you submit the scope of works and estimate to your insurer.",
  },
  {
    question: "How long does fire damage restoration take?",
    answer:
      "Timeline varies depending on severity. Minor fire damage may take 1-2 weeks for remediation. Moderate damage typically requires 4-8 weeks. Major structural damage with full rebuild can take 3-6 months. We provide detailed timelines during the initial assessment and keep you updated throughout.",
  },
  {
    question: "Can fire-damaged belongings be saved?",
    answer:
      "Many items can be professionally restored including furniture, clothing, electronics, documents, and photographs. Our content restoration team uses ultrasonic cleaning, ozone treatment, and specialist techniques. Items are assessed individually and you are consulted before any disposal decisions.",
  },
]

export default function FireDamageRestorationPage() {
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
  slug: 'fire-damage-restoration',
  parentSlug: 'fire-smoke-damage',
  parentName: 'Fire & Smoke Damage',
  serviceName: 'Fire Damage Restoration',
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
              src="/images/services/fire-smoke-damage/fire-damage-restoration-hero.webp"
              alt="Fire damage restoration and structural assessment"
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
              <FireSmoke size="hero" gradient="fire" aria-label="Fire Damage Restoration" />
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              IICRC FSRT Certified
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Fire Damage Restoration <span className="text-[#00BFA6]">Services</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8 max-w-3xl mx-auto">
              Comprehensive fire damage restoration from emergency board-up through to full rebuild.
              IICRC FSRT-certified technicians restoring properties across Australia 24/7.
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
              <div className="text-3xl font-bold text-[#2196F3] mb-2">FSRT</div>
              <div className="text-[#9CA3AF]">IICRC Certified</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">Full</div>
              <div className="text-[#9CA3AF]">Rebuild Capability</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">8</div>
              <div className="text-[#9CA3AF]">States Covered</div>
            </div>
          </div>
        </section>

        {/* Our Process */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Fire Damage Restoration Process
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
            Comprehensive Fire Damage Services
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
                Fire Damage Hazards
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Structural collapse risk from compromised load-bearing elements</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Toxic fume residue lingering in enclosed spaces</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Asbestos exposure risk in pre-1990 buildings</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Electrical system compromise and shock hazards</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Water damage from fire suppression efforts</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Weakened load-bearing elements at risk of delayed failure</span>
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
              { name: "Smoke Damage Restoration", href: "/services/fire-smoke-damage/smoke-damage-restoration" },
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
              Need Immediate Fire Damage Restoration?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              24/7 emergency response. IICRC FSRT-certified professionals across Australia.
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
