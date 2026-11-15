import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, Droplets } from "lucide-react"
import { BioForensic } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Sewage Cleanup Services | Biohazard Cleanup Australia",
  description: "Professional sewage cleanup and Category 3 water damage restoration. IICRC-certified technicians. 24/7 emergency response for sewage overflows and contamination across Australia.",
  keywords: ['sewage cleanup', 'sewage overflow', 'black water cleanup', 'sewage contamination', 'sewage restoration', 'category 3 water', 'Australia'],
  slug: 'sewage-cleanup',
  parentSlug: 'biohazard-cleanup',
  parentName: 'Biohazard Cleanup',
  serviceName: 'Sewage Cleanup',
})

const processSteps = [
  {
    step: 1,
    title: "Emergency Containment",
    description:
      "Immediate response to stop the source of contamination where possible. Containment barriers prevent further spread. Standing sewage water is extracted using truck-mounted pumps.",
  },
  {
    step: 2,
    title: "Category 3 Water Extraction",
    description:
      "All contaminated water is removed using industrial extraction equipment. Affected porous materials (carpet, underlay, particle board) are removed as they cannot be safely decontaminated.",
  },
  {
    step: 3,
    title: "Decontamination & Drying",
    description:
      "Surfaces are treated with antimicrobial agents and hospital-grade disinfectants. Industrial dehumidifiers and air movers establish controlled drying conditions to prevent mould growth.",
  },
  {
    step: 4,
    title: "Verification & Restoration",
    description:
      "Moisture mapping confirms dry standard is met. Air quality testing verifies no elevated microbial counts. Structural restoration returns the property to pre-loss condition.",
  },
]

const features = [
  {
    title: "Category 3 Water Expertise",
    description:
      "Sewage is classified as Category 3 (black water) under industry standards \u2014 the most contaminated category. Our teams are specifically trained in C3 water protocols.",
  },
  {
    title: "Sewage Overflow Response",
    description:
      "Rapid response for sewer main breaks, blocked drains causing backup, septic system failures, and stormwater infiltration carrying sewage into properties.",
  },
  {
    title: "Antimicrobial Treatment",
    description:
      "Multi-stage disinfection using EPA-registered antimicrobials effective against bacteria (E. coli, Salmonella), viruses (Hepatitis A, Norovirus), and parasites (Giardia, Cryptosporidium).",
  },
  {
    title: "Mould Prevention",
    description:
      "Controlled drying with commercial dehumidifiers and HEPA air scrubbers. Moisture monitoring ensures materials reach dry standard within 48-72 hours to prevent mould colonisation.",
  },
  {
    title: "Structural Drying",
    description:
      "Advanced drying techniques for wall cavities, subfloors, and concrete slabs. Thermal imaging and moisture meters track drying progress to industry dry standards.",
  },
  {
    title: "Insurance Claims Support",
    description:
      "Complete IICRC-standard documentation including contamination assessment, moisture readings, drying logs, and photographic evidence — professional reports for your insurance submission.",
  },
]

const faqs = [
  {
    question: "How dangerous is sewage contamination?",
    answer:
      "Sewage (Category 3 water) contains harmful bacteria, viruses, and parasites that can cause serious illness including gastroenteritis, hepatitis, and respiratory infections. Professional cleanup with proper PPE and disinfection protocols is essential \u2014 never attempt DIY cleanup of sewage.",
  },
  {
    question: "What should I do if sewage backs up into my property?",
    answer:
      "Evacuate the affected area immediately. Do not walk through or touch contaminated water. Turn off HVAC systems to prevent airborne contamination. Contact us for 24/7 emergency response — teams aim to arrive as quickly as possible (typically within 2 hours in metro areas).",
  },
  {
    question: "Can furniture and carpets be saved after sewage exposure?",
    answer:
      "Under industry guidelines, porous materials exposed to Category 3 water (sewage) generally cannot be safely decontaminated and must be removed. This includes carpet, underlay, upholstered furniture, and mattresses. Hard, non-porous items can often be salvaged with proper cleaning.",
  },
  {
    question: "How long does sewage cleanup take?",
    answer:
      "Emergency extraction and decontamination typically takes 1-2 days. The controlled drying phase requires an additional 3-5 days depending on the extent of water penetration. Total restoration including structural repairs may take 1-2 weeks.",
  },
  {
    question: "Will my insurance cover sewage cleanup?",
    answer:
      "Most comprehensive home insurance policies cover sewage backup and overflow damage. Coverage varies by policy — some require a specific sewage backup endorsement. NRPG contractors provide IICRC-standard documentation accepted by all major Australian insurers — whether your policy covers the work is a matter for you and your insurer.",
  },
]

export default function SewageCleanupPage() {
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
  slug: 'sewage-cleanup',
  parentSlug: 'biohazard-cleanup',
  parentName: 'Biohazard Cleanup',
  serviceName: 'Sewage Cleanup',
  faqs,
})) }}
      />
      <main className="py-24">
        {/* Breadcrumb */}
        <section className="container mx-auto px-6 mb-8">
          <Link
            href="/services/biohazard-cleanup"
            className="inline-flex items-center text-[#9CA3AF] hover:text-[#00BFA6] transition-colors text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Biohazard Cleanup Services
          </Link>
        </section>

        {/* Hero Section */}
        <section className="relative overflow-hidden mb-16">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/services/biohazard-cleanup/sewage-cleanup-hero.webp"
              alt="Professional sewage cleanup equipment"
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
                <BioForensic size="hero" gradient="bio" aria-label="Sewage Cleanup" />
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
                IICRC Certified
              </div>
              <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
                Sewage Cleanup <span className="text-[#00BFA6]">Services</span>
              </h1>
              <p className="text-xl text-[#9CA3AF] mb-8 max-w-3xl mx-auto">
                Emergency Category 3 water damage restoration. IICRC-certified teams providing rapid
                sewage extraction, decontamination, and structural drying across Australia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                  Emergency Response
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
              <div className="text-[#9CA3AF]">Response Time</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#2196F3] mb-2">Cat 3</div>
              <div className="text-[#9CA3AF]">Water Specialists</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">Industry</div>
              <div className="text-[#9CA3AF]">Standard</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <Droplets className="h-8 w-8 text-[#FFD700] mx-auto mb-1" />
              <div className="text-[#9CA3AF]">Full Extraction</div>
            </div>
          </div>
        </section>

        {/* Our Process */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Sewage Cleanup Process
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

        {/* Services */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Comprehensive Sewage Cleanup Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]"
              >
                <Droplets className="h-8 w-8 text-[#EF4444] mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#9CA3AF] text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Health Warning */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-8 w-8 text-[#FFD700]" />
              <h2 className="font-poppins font-semibold text-2xl text-white">
                Health Hazards {"\u2014"} Do Not Attempt DIY Cleanup
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">E. coli and Salmonella bacteria</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Hepatitis A and Norovirus</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Giardia and Cryptosporidium parasites</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Rapid mould growth within 24-48 hours</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Structural damage from prolonged saturation</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Electrical hazards from water exposure</span>
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
            Related Biohazard Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Crime Scene Cleanup", href: "/services/biohazard-cleanup/crime-scene-cleanup" },
              { name: "Trauma Cleanup", href: "/services/biohazard-cleanup/trauma-cleanup" },
              { name: "Meth Lab Decontamination", href: "/services/biohazard-cleanup/meth-lab-decontamination" },
              { name: "Hoarding Cleanup", href: "/services/biohazard-cleanup/hoarding-cleanup" },
            ].map((service) => (
              <Link key={service.href} href={service.href}>
                <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-5 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer text-center">
                  <BioForensic size="md" gradient="bio" className="text-[#EF4444] mx-auto mb-3" aria-hidden="true" />
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
              Emergency Sewage Cleanup Required?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              24/7 emergency response. Rapid extraction and decontamination across Australia.
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
