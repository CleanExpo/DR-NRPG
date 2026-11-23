import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, Clock, Shield, ArrowLeft, ArrowRight, AlertTriangle, Users, FileCheck } from "lucide-react"
import { BioForensic } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Crime Scene Cleanup Services | Biohazard Cleanup Australia",
  description: "Professional crime scene cleanup and remediation services. Qualified technicians providing discreet, thorough decontamination across Australia. 24/7 emergency response.",
  keywords: ['crime scene cleanup', 'crime scene cleaning', 'forensic cleanup', 'biohazard crime scene', 'blood cleanup', 'Australia'],
  slug: 'crime-scene-cleanup',
  parentSlug: 'biohazard-cleanup',
  parentName: 'Biohazard Cleanup',
  serviceName: 'Crime Scene Cleanup',
})

const processSteps = [
  {
    step: 1,
    title: "Initial Assessment",
    description:
      "Our team arrives discreetly to assess the scene, identify all biohazards, and develop a comprehensive remediation plan in coordination with authorities.",
  },
  {
    step: 2,
    title: "Containment & PPE Setup",
    description:
      "Full containment barriers are established with negative air pressure. Technicians suit up in Level A/B PPE including respirators and chemical-resistant suits.",
  },
  {
    step: 3,
    title: "Decontamination & Removal",
    description:
      "All biohazardous materials are carefully removed and disposed of per EPA regulations. Surfaces are treated with hospital-grade disinfectants and enzymatic cleaners.",
  },
  {
    step: 4,
    title: "Verification & Clearance",
    description:
      "ATP testing and visual inspection confirm the site meets safe re-occupancy standards. A clearance certificate is issued for insurance and legal purposes.",
  },
]

const features = [
  {
    title: "Law Enforcement Coordination",
    description:
      "We work alongside police and forensic investigators, only entering the scene after official clearance. Full chain-of-custody documentation provided.",
  },
  {
    title: "Bloodborne Pathogen Removal",
    description:
      "Complete removal of blood, bodily fluids, and tissue using recognised industry protocols. All materials treated as potentially infectious.",
  },
  {
    title: "Odour Neutralisation",
    description:
      "Industrial ozone generators and hydroxyl radical machines eliminate lingering odours at the molecular level, not just mask them.",
  },
  {
    title: "Structural Remediation",
    description:
      "Contaminated building materials (carpet, underlay, drywall, timber) are safely removed and replaced to manufacturer specifications.",
  },
  {
    title: "Discreet Service",
    description:
      "Unmarked vehicles and plain-clothed arrival. We understand the sensitivity of these situations and protect your privacy throughout.",
  },
  {
    title: "Insurance Documentation",
    description:
      "Complete photographic documentation and industry-standard itemised scope of works — professional reports for your insurance submission.",
  },
]

const faqs = [
  {
    question: "How soon can you respond to a crime scene cleanup request?",
    answer:
      "Teams are on standby 24/7 across all Australian states and prioritise rapid response across all service areas. Metro areas are typically reached within 2 hours; regional locations within 2-4 hours.",
  },
  {
    question: "Who is responsible for paying for crime scene cleanup?",
    answer:
      "In most cases, the property owner or their insurance policy covers crime scene cleanup costs. NRPG contractors produce industry-standard documentation accepted by all major Australian insurers including Allianz, NRMA, Suncorp, and QBE — you submit the scope of works and invoices to your insurer.",
  },
  {
    question: "Do we need to wait for police clearance before cleanup begins?",
    answer:
      "Yes. We never enter a scene until law enforcement has completed their forensic investigation and issued a clearance. We coordinate directly with investigating officers to begin work as soon as possible after release.",
  },
  {
    question: "What certifications do your technicians hold?",
    answer:
      "All technicians hold trauma and crime scene training, along with bloodborne pathogen training, confined space entry, and current first aid qualifications.",
  },
  {
    question: "Is the property safe to re-enter after cleanup?",
    answer:
      "Absolutely. We perform ATP bioluminescence testing to verify decontamination levels meet safe re-occupancy standards. A formal clearance certificate is issued upon completion.",
  },
]

export default function CrimeSceneCleanupPage() {
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
  slug: 'crime-scene-cleanup',
  parentSlug: 'biohazard-cleanup',
  parentName: 'Biohazard Cleanup',
  serviceName: 'Crime Scene Cleanup',
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
              src="/images/services/biohazard-cleanup/crime-scene-cleanup-hero.webp"
              alt="Professional biohazard cleanup equipment"
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
                <BioForensic size="hero" gradient="bio" aria-label="Crime Scene Cleanup" />
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
                Qualified Contractors
              </div>
              <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
                Crime Scene Cleanup <span className="text-[#00BFA6]">Services</span>
              </h1>
              <p className="text-xl text-[#9CA3AF] mb-8 max-w-3xl mx-auto">
                Professional, discreet crime scene remediation by qualified technicians.
                We restore properties to safe, habitable conditions with compassion and precision.
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
              <div className="text-3xl font-bold text-[#2196F3] mb-2">Qualified</div>
              <div className="text-[#9CA3AF]">Technicians</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">Discreet</div>
              <div className="text-[#9CA3AF]">Service</div>
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
            Our Crime Scene Cleanup Process
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
            Comprehensive Crime Scene Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]"
              >
                <Shield className="h-8 w-8 text-[#EF4444] mb-4" />
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
                  <span className="text-[#9CA3AF]">EPA-compliant biohazardous waste disposal</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00BFA6] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">OSHA bloodborne pathogen standard compliance</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00BFA6] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Chain-of-custody documentation for legal proceedings</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00BFA6] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Licensed hazardous waste transport and disposal</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00BFA6] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Post-remediation ATP bioluminescence verification</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00BFA6] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Full photographic documentation for insurance claims</span>
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
              { name: "Trauma Cleanup", href: "/services/biohazard-cleanup/trauma-cleanup" },
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
              Need Immediate Crime Scene Cleanup?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              24/7 emergency response. Discreet, professional service across Australia.
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
