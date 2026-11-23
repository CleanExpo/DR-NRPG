import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, Shield, ArrowLeft, AlertTriangle, Heart } from "lucide-react"
import { BioForensic } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Trauma Scene Cleanup Services | Biohazard Cleanup Australia",
  description: "Compassionate trauma scene cleanup and remediation. Qualified technicians providing sensitive, thorough biohazard decontamination. 24/7 emergency response across Australia.",
  keywords: ['trauma cleanup', 'trauma scene cleaning', 'biohazard cleaning', 'blood cleanup', 'forensic cleaning', 'trauma restoration', 'Australia'],
  slug: 'trauma-cleanup',
  parentSlug: 'biohazard-cleanup',
  parentName: 'Biohazard Cleanup',
  serviceName: 'Trauma Cleanup',
})

const processSteps = [
  {
    step: 1,
    title: "Compassionate Contact",
    description:
      "Our trained team makes initial contact with sensitivity and discretion. We coordinate with authorities and family members to determine the appropriate time to begin.",
  },
  {
    step: 2,
    title: "Scene Assessment & Containment",
    description:
      "A thorough assessment identifies all affected areas. Full containment barriers with HEPA-filtered negative air are established to prevent cross-contamination.",
  },
  {
    step: 3,
    title: "Biohazard Remediation",
    description:
      "All biohazardous materials are removed following recognised industry protocols. Hospital-grade disinfectants and enzymatic cleaners eliminate all biological contaminants.",
  },
  {
    step: 4,
    title: "Restoration & Verification",
    description:
      "Affected structural materials are replaced. ATP bioluminescence testing confirms the space is safe for re-occupancy. Clearance documentation is provided.",
  },
]

const features = [
  {
    title: "Compassionate Approach",
    description:
      "Our teams receive specialised grief-awareness training. We understand the emotional weight of these situations and treat every scene with dignity and respect.",
  },
  {
    title: "Unattended Death Cleanup",
    description:
      "Specialised remediation for decomposition scenarios including fluid removal, odour elimination with ozone and hydroxyl technology, and structural decontamination.",
  },
  {
    title: "Suicide Scene Remediation",
    description:
      "Sensitive, thorough cleanup following self-harm incidents. We work discreetly to restore the space while supporting families through a difficult time.",
  },
  {
    title: "Accident Scene Cleanup",
    description:
      "Residential and commercial accident scene remediation including slip-and-fall injuries, industrial accidents, and vehicle impact scenes.",
  },
  {
    title: "Complete Odour Elimination",
    description:
      "Industrial ozone generators, hydroxyl radical machines, and thermal fogging technology eliminate all biological odours permanently.",
  },
  {
    title: "Victim Support Resources",
    description:
      "We connect families with grief counselling services and victim support organisations, and provide industry-standard documentation to help navigate the insurance claims process.",
  },
]

const faqs = [
  {
    question: "How do you handle trauma scenes with sensitivity?",
    answer:
      "All our technicians complete specialised grief-awareness and trauma-informed care training. We arrive in unmarked vehicles, wear plain clothing when appropriate, and communicate with empathy throughout the process.",
  },
  {
    question: "What types of trauma scenes do you handle?",
    answer:
      "We handle all trauma scenes including unattended deaths, suicides, accidental deaths, violent incidents, and any situation involving blood or bodily fluid contamination. Each scenario is treated with equal professionalism and care.",
  },
  {
    question: "How long does trauma scene cleanup typically take?",
    answer:
      "Most trauma scene cleanups are completed within 4-12 hours depending on the extent of contamination. Complex scenarios involving structural remediation may take 1-3 days. We work efficiently to minimise disruption.",
  },
  {
    question: "Will insurance cover trauma scene cleanup?",
    answer:
      "Most home and contents insurance policies cover trauma scene cleanup under their biohazard or emergency provisions. NRPG contractors provide industry-standard documentation for your insurance submission — whether and how much your policy covers is between you and your insurer.",
  },
  {
    question: "Can you help with personal belongings affected by the scene?",
    answer:
      "Yes. We carefully sort and catalogue personal belongings, cleaning and restoring items where possible. Items that cannot be safely decontaminated are documented for insurance purposes before disposal.",
  },
]

export default function TraumaCleanupPage() {
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
  slug: 'trauma-cleanup',
  parentSlug: 'biohazard-cleanup',
  parentName: 'Biohazard Cleanup',
  serviceName: 'Trauma Cleanup',
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
              src="/images/services/biohazard-cleanup/trauma-cleanup-hero.webp"
              alt="Professional trauma cleanup equipment"
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
                <BioForensic size="hero" gradient="bio" aria-label="Trauma Scene Cleanup" />
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
                Qualified Contractors
              </div>
              <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
                Trauma Scene Cleanup <span className="text-[#00BFA6]">Services</span>
              </h1>
              <p className="text-xl text-[#9CA3AF] mb-8 max-w-3xl mx-auto">
                Compassionate, professional trauma scene remediation. Our qualified teams restore
                spaces with dignity, discretion, and thorough decontamination.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                  Request Service
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
              <div className="text-3xl font-bold text-[#2196F3] mb-2">Qualified</div>
              <div className="text-[#9CA3AF]">Technicians</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <Heart className="h-8 w-8 text-[#7C4DFF] mx-auto mb-1" />
              <div className="text-[#9CA3AF]">Grief-Aware Teams</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">ATP</div>
              <div className="text-[#9CA3AF]">Verified Clean</div>
            </div>
          </div>
        </section>

        {/* Our Process */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Trauma Scene Cleanup Process
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

        {/* What We Handle */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Comprehensive Trauma Scene Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]"
              >
                <Heart className="h-8 w-8 text-[#EF4444] mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#9CA3AF] text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Safety Protocols */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-8 w-8 text-[#FFD700]" />
              <h2 className="font-poppins font-semibold text-2xl text-white">
                Safety & Compliance
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00BFA6] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Recognised industry trauma scene protocols</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00BFA6] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">EPA-compliant biohazardous waste disposal</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00BFA6] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Grief-awareness and trauma-informed training</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00BFA6] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Level A/B personal protective equipment</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00BFA6] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Post-remediation ATP bioluminescence verification</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00BFA6] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Full photographic documentation for insurance</span>
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
              { name: "Hoarding Cleanup", href: "/services/biohazard-cleanup/hoarding-cleanup" },
              { name: "Meth Lab Decontamination", href: "/services/biohazard-cleanup/meth-lab-decontamination" },
              { name: "Sewage Cleanup", href: "/services/biohazard-cleanup/sewage-cleanup" },
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
              Need Trauma Scene Cleanup Assistance?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Compassionate, 24/7 emergency response. We are here to help.
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
