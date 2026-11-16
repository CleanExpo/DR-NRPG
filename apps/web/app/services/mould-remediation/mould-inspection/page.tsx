import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, Shield, Search, Thermometer, FileText } from "lucide-react"
import { MouldRemediation } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Mould Inspection Services | Mould Remediation Australia",
  description: "Professional mould inspection and assessment with thermal imaging, air quality sampling, and laboratory analysis. Qualified inspectors across Australia.",
  keywords: ['mould inspection', 'mould assessment', 'mould testing', 'thermal imaging mould', 'moisture inspection', 'mould survey', 'Australia'],
  slug: 'mould-inspection',
  parentSlug: 'mould-remediation',
  parentName: 'Mould Remediation',
  serviceName: 'Mould Inspection',
})

const processSteps = [
  {
    step: 1,
    title: "Visual Inspection & Moisture Survey",
    description:
      "A thorough visual assessment of the entire property is conducted alongside moisture readings using calibrated pin and pinless meters to identify hidden moisture sources.",
  },
  {
    step: 2,
    title: "Air Quality Sampling",
    description:
      "Calibrated air cassettes collect indoor and outdoor baseline samples to measure airborne spore concentrations and identify elevated mould levels within the property.",
  },
  {
    step: 3,
    title: "Laboratory Analysis",
    description:
      "All collected samples are submitted to a NATA-accredited laboratory for species identification, spore quantification, and comparative analysis against outdoor baseline readings.",
  },
  {
    step: 4,
    title: "Remediation Scope Report",
    description:
      "A comprehensive report is prepared detailing findings, moisture sources, affected areas, species identified, and a prioritised remediation scope with cost estimates.",
  },
]

const features = [
  {
    title: "Thermal Imaging Moisture Detection",
    description:
      "Infrared thermal cameras reveal hidden moisture behind walls, ceilings, and floors without destructive investigation, pinpointing potential mould growth areas.",
  },
  {
    title: "Air Spore Sampling",
    description:
      "Calibrated spore trap cassettes capture airborne mould spores for laboratory quantification, comparing indoor levels against outdoor baselines.",
  },
  {
    title: "Surface Swab Testing",
    description:
      "Direct surface sampling identifies mould species growing on materials, confirming visual findings and determining the appropriate remediation approach.",
  },
  {
    title: "Moisture Mapping",
    description:
      "Detailed moisture mapping of walls, floors, and ceilings creates a visual record of moisture distribution to guide remediation and repairs.",
  },
  {
    title: "HVAC Inspection",
    description:
      "Dedicated inspection of heating, ventilation, and air conditioning systems identifies mould contamination that can distribute spores throughout the property.",
  },
  {
    title: "Detailed Remediation Report",
    description:
      "A comprehensive written report includes findings, laboratory results, photos, moisture readings, and a prioritised remediation scope for contractors or insurers.",
  },
]

const faqs = [
  {
    question: "How long does a mould inspection take?",
    answer:
      "A standard residential mould inspection typically takes two to four hours depending on the size of the property. Larger commercial properties may require a full day or multiple visits. The inspection includes visual assessment, moisture readings, thermal imaging, and sample collection.",
  },
  {
    question: "What does a mould inspection include?",
    answer:
      "Our inspections include a full visual assessment, moisture readings with calibrated meters, thermal imaging to detect hidden moisture, air quality sampling, surface sampling where visible growth is present, HVAC system inspection, and a comprehensive written report with laboratory results and remediation recommendations.",
  },
  {
    question: "Do I need laboratory testing as part of my inspection?",
    answer:
      "Laboratory testing is recommended when you need species identification, quantitative spore counts for insurance claims, or baseline data for post-remediation clearance. Visual inspection alone cannot determine mould species or confirm whether airborne spore levels are elevated.",
  },
  {
    question: "How much does a mould inspection cost?",
    answer:
      "Mould inspection costs vary based on property size, number of samples required, and the scope of assessment needed. We provide a fixed quote after discussing your concerns and property details. Laboratory analysis fees are included in the quoted price.",
  },
  {
    question: "Can you test the air quality in my property?",
    answer:
      "Yes. Air quality testing is a core part of our inspection service. We use calibrated spore trap cassettes to capture airborne spores at multiple locations throughout the property, plus an outdoor baseline sample. Results are analysed by a NATA-accredited laboratory.",
  },
]

export default function MouldInspectionPage() {
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
  slug: 'mould-inspection',
  parentSlug: 'mould-remediation',
  parentName: 'Mould Remediation',
  serviceName: 'Mould Inspection',
  faqs,
})) }}
      />
      <main className="py-24">
        {/* Breadcrumb */}
        <section className="container mx-auto px-6 mb-8">
          <Link
            href="/services/mould-remediation"
            className="inline-flex items-center text-[#9CA3AF] hover:text-[#00BFA6] transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mould Remediation Services
          </Link>
        </section>

        {/* Hero Section */}
        <section className="relative overflow-hidden mb-16">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/services/mould-remediation/mould-inspection-hero.webp"
              alt="Mould inspection with thermal imaging and moisture detection"
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
              <MouldRemediation size="hero" gradient="mould" aria-label="Mould Inspection" />
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              Qualified Contractors
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Mould Inspection & <span className="text-[#00BFA6]">Assessment</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8 max-w-3xl mx-auto">
              Comprehensive mould inspection services using thermal imaging, air quality sampling, and laboratory
              analysis. Our qualified inspectors identify hidden mould and moisture problems across your property.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                Book a Mould Inspection
              </Button>
              <Button
                variant="outline"
                className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] px-8 py-3 text-lg bg-transparent"
              >
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
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">Same Day</div>
              <div className="text-[#9CA3AF]">Inspection Available</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#10B981] mb-2">Lab</div>
              <div className="text-[#9CA3AF]">Tested Samples</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">Thermal</div>
              <div className="text-[#9CA3AF]">Imaging Included</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">Full</div>
              <div className="text-[#9CA3AF]">Detailed Report</div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Mould Inspection Process
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {processSteps.map((step) => (
              <div key={step.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#00BFA6]/10 border border-[#00BFA6]/30 flex items-center justify-center">
                  <span className="text-[#00BFA6] font-bold">{step.step}</span>
                </div>
                <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] flex-1">
                  <h3 className="font-poppins font-semibold text-lg text-white mb-2">{step.title}</h3>
                  <p className="text-[#9CA3AF]">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Inspection Services & Capabilities
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]"
              >
                <Shield className="h-8 w-8 text-[#10B981] mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-2">{feature.title}</h3>
                <p className="text-[#9CA3AF] text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Warning Section */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-8 w-8 text-[#EF4444]" />
              <h2 className="font-poppins font-semibold text-2xl text-white">When to Get a Mould Inspection</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Persistent musty odours that you cannot locate the source of",
                "Visible mould growth on walls, ceilings, or other surfaces",
                "Recent water damage from leaks, flooding, or storm events",
                "Unexplained health symptoms such as respiratory issues or allergies",
                "Buying or selling a property and need a pre-purchase assessment",
                "Insurance claim documentation requiring professional evidence",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                  <span className="text-[#9CA3AF]">{item}</span>
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
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]"
              >
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">{faq.question}</h3>
                <p className="text-[#9CA3AF]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Services */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Related Mould Remediation Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { title: "Black Mould Removal", href: "/services/mould-remediation/black-mould-removal", desc: "Specialist black mould removal with full containment and HEPA air scrubbing." },
              { title: "Mould Testing", href: "/services/mould-remediation/mould-testing", desc: "NATA-accredited laboratory mould testing and species identification." },
              { title: "Mould Prevention", href: "/services/mould-remediation/mould-prevention", desc: "Proactive mould prevention solutions including ventilation and waterproofing." },
              { title: "Commercial Mould Remediation", href: "/services/mould-remediation/commercial-mould-remediation", desc: "Large-scale mould remediation for commercial and industrial properties." },
            ].map((service) => (
              <Link key={service.href} href={service.href}>
                <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer h-full">
                  <MouldRemediation size="lg" gradient="mould" className="mb-4" aria-hidden="true" />
                  <h3 className="font-poppins font-semibold text-lg text-white mb-2">{service.title}</h3>
                  <p className="text-[#9CA3AF] text-sm">{service.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Emergency CTA */}
        <section className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-[#EF4444] to-[#DC2626] rounded-2xl p-12 text-center">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-white mb-4">
              Need an Urgent Mould Inspection?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Same-day mould inspections available. Contact us now for immediate assessment of your property.
            </p>
            <Button className="bg-white hover:bg-white/90 text-[#EF4444] font-bold text-xl px-12 py-4">
              Request Emergency Inspection
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
