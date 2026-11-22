import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, Shield, ArrowLeft, AlertTriangle } from "lucide-react"
import { BioForensic } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Meth Lab Decontamination Services | Biohazard Cleanup Australia",
  description: "Professional methamphetamine laboratory decontamination and remediation. Certified to Australian Clandestine Drug Laboratory Remediation Guidelines. NATA-accredited testing across Australia.",
  keywords: ['meth lab decontamination', 'methamphetamine cleanup', 'clandestine lab', 'meth testing', 'meth contamination', 'drug lab cleanup', 'Australia'],
  slug: 'meth-lab-decontamination',
  parentSlug: 'biohazard-cleanup',
  parentName: 'Biohazard Cleanup',
  serviceName: 'Meth Lab Decontamination',
})

const processSteps = [
  {
    step: 1,
    title: "Preliminary Assessment",
    description:
      "Licensed assessors conduct comprehensive testing of all surfaces, HVAC systems, and structural materials. Samples are sent to NATA-accredited laboratories for analysis against Australian guidelines.",
  },
  {
    step: 2,
    title: "Remediation Plan Development",
    description:
      "A detailed Remediation Action Plan (RAP) is prepared based on contamination levels, outlining removal, cleaning, and validation procedures per state regulatory requirements.",
  },
  {
    step: 3,
    title: "Chemical Decontamination",
    description:
      "Contaminated materials are removed and disposed of as hazardous waste. Surfaces are treated with specialised chemical neutralisers. HVAC systems are decontaminated or replaced.",
  },
  {
    step: 4,
    title: "Validation & Clearance",
    description:
      "Post-remediation sampling by independent assessors confirms contamination levels are below 0.5 \u00B5g/100cm\u00B2 (Australian guideline). A clearance certificate is issued for property transfer.",
  },
]

const features = [
  {
    title: "NATA-Accredited Testing",
    description:
      "All sampling and analysis conducted through NATA-accredited laboratories. Results you can trust for property transactions, insurance claims, and regulatory compliance.",
  },
  {
    title: "Chemical Hazard Expertise",
    description:
      "Our technicians are trained in handling volatile organic compounds, heavy metals, solvents, and precursor chemicals associated with clandestine drug manufacture.",
  },
  {
    title: "HVAC Decontamination",
    description:
      "Complete assessment and remediation of heating, ventilation, and air conditioning systems that can harbour and spread methamphetamine residue throughout a property.",
  },
  {
    title: "Structural Remediation",
    description:
      "Removal and replacement of contaminated building materials including plasterboard, carpet, insulation, soft furnishings, and porous surfaces that absorb chemical residue.",
  },
  {
    title: "Regulatory Compliance",
    description:
      "Full compliance with state and territory Clandestine Drug Laboratory Remediation Guidelines (NSW, VIC, QLD, WA, SA, TAS, ACT, NT specific requirements).",
  },
  {
    title: "Property Transaction Support",
    description:
      "Clearance certificates suitable for property sale, lease, and mortgage applications. We support real estate agents, conveyancers, and property managers through the process.",
  },
]

const faqs = [
  {
    question: "What contamination level requires remediation?",
    answer:
      "Under Australian guidelines, methamphetamine surface contamination exceeding 0.5 \u00B5g/100cm\u00B2 requires professional remediation. Many states also mandate remediation for properties identified as former clandestine drug laboratories regardless of current contamination levels.",
  },
  {
    question: "How long does meth lab decontamination take?",
    answer:
      "Typical residential properties require 3-7 days for complete remediation, depending on contamination levels and the extent of structural materials requiring removal. Larger or more heavily contaminated properties may take up to 2 weeks.",
  },
  {
    question: "Is the property safe to live in after decontamination?",
    answer:
      "Yes. Post-remediation validation by an independent assessor confirms all surfaces are below the 0.5 \u00B5g/100cm\u00B2 guideline. A formal clearance certificate is issued confirming the property meets habitable standards.",
  },
  {
    question: "Who is responsible for the cost of meth lab decontamination?",
    answer:
      "Typically the property owner bears the cost. Some landlord insurance policies cover clandestine drug laboratory remediation. For property purchases, costs may be negotiated as part of the sale contract. We provide detailed quotes for budgeting.",
  },
  {
    question: "Do you handle the regulatory notifications?",
    answer:
      "Yes. We assist with all required notifications to state health departments, local councils, and environmental protection agencies as required under your jurisdiction\u2019s regulations.",
  },
]

export default function MethLabDecontaminationPage() {
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
  slug: 'meth-lab-decontamination',
  parentSlug: 'biohazard-cleanup',
  parentName: 'Biohazard Cleanup',
  serviceName: 'Meth Lab Decontamination',
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
              src="/images/services/biohazard-cleanup/meth-lab-decontamination-hero.webp"
              alt="Professional chemical decontamination equipment"
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
                <BioForensic size="hero" gradient="bio" aria-label="Meth Lab Decontamination" />
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
                Australian Clandestine Lab Guidelines
              </div>
              <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
                Meth Lab Decontamination <span className="text-[#00BFA6]">Services</span>
              </h1>
              <p className="text-xl text-[#9CA3AF] mb-8 max-w-3xl mx-auto">
                Certified methamphetamine laboratory remediation meeting Australian Clandestine Drug Lab
                Guidelines. NATA-accredited testing and independent validation for property clearance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                  Request Assessment
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
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">0.5</div>
              <div className="text-[#9CA3AF]">{"\u00B5g/100cm\u00B2 Target"}</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#2196F3] mb-2">NATA</div>
              <div className="text-[#9CA3AF]">Accredited Labs</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">8</div>
              <div className="text-[#9CA3AF]">States Covered</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">Clearance</div>
              <div className="text-[#9CA3AF]">Testing</div>
            </div>
          </div>
        </section>

        {/* Our Process */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Decontamination Process
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
            Comprehensive Decontamination Services
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

        {/* Health Warning */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-8 w-8 text-[#FFD700]" />
              <h2 className="font-poppins font-semibold text-2xl text-white">
                Health Risks of Meth Contamination
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Respiratory issues and chronic headaches</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Skin irritation and chemical burns</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Neurological effects from prolonged exposure</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Increased cancer risk from chemical residues</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Particularly dangerous for children and elderly</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Contamination persists for years without remediation</span>
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
              { name: "Sewage Cleanup", href: "/services/biohazard-cleanup/sewage-cleanup" },
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
              Suspect Meth Contamination?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Get a professional assessment. NATA-accredited testing with fast turnaround.
            </p>
            <Button className="bg-white hover:bg-white/90 text-[#EF4444] font-bold text-xl px-12 py-4">
              Request Assessment
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
