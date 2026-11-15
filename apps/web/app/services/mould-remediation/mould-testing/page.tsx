import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, Shield, FlaskConical, Microscope, FileCheck } from "lucide-react"
import { MouldRemediation } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Mould Testing & Lab Analysis | Mould Remediation Australia",
  description: "NATA-accredited mould testing and laboratory analysis. Air spore sampling, surface testing, species identification, and court-admissible reports across Australia.",
  keywords: ['mould testing', 'air sampling mould', 'mould laboratory testing', 'mould species identification', 'spore count', 'mould analysis', 'Australia'],
  slug: 'mould-testing',
  parentSlug: 'mould-remediation',
  parentName: 'Mould Remediation',
  serviceName: 'Mould Testing',
})

const processSteps = [
  {
    step: 1,
    title: "Sample Collection Planning",
    description:
      "A testing strategy is developed based on your property layout and concerns. Sample locations are selected to capture representative data from affected and unaffected zones.",
  },
  {
    step: 2,
    title: "Air & Surface Sampling",
    description:
      "Calibrated spore trap cassettes collect airborne samples while surface tape lifts and swabs capture material from visible growth areas. An outdoor baseline sample is always collected.",
  },
  {
    step: 3,
    title: "NATA-Accredited Analysis",
    description:
      "All samples are submitted to a NATA-accredited laboratory under strict chain-of-custody protocols. Analysis includes species identification, spore quantification, and viability assessment.",
  },
  {
    step: 4,
    title: "Results Interpretation & Report",
    description:
      "A detailed report is prepared interpreting laboratory findings in context, comparing indoor versus outdoor levels, identifying species of concern, and providing remediation recommendations.",
  },
]

const features = [
  {
    title: "NATA-Accredited Laboratory",
    description:
      "All samples are analysed by a NATA-accredited laboratory, ensuring results meet Australian standards for accuracy, reliability, and legal admissibility.",
  },
  {
    title: "Air Spore Trap Analysis",
    description:
      "Calibrated air cassettes capture airborne mould spores for quantitative analysis, measuring concentrations per cubic metre and comparing against outdoor baselines.",
  },
  {
    title: "Surface Tape Lift Sampling",
    description:
      "Adhesive tape lifts collect surface samples from suspected mould growth for microscopic examination and species identification by laboratory analysts.",
  },
  {
    title: "Bulk Material Analysis",
    description:
      "Sections of affected building materials are submitted for laboratory analysis to determine mould penetration depth and assess whether materials can be salvaged.",
  },
  {
    title: "Species Identification",
    description:
      "Microscopic and culture-based analysis identifies mould species present, distinguishing between common environmental moulds and species of health concern.",
  },
  {
    title: "Quantitative Analysis Reports",
    description:
      "Detailed numerical data on spore concentrations, species distribution, and comparative analysis provides clear evidence for remediation decisions and insurance claims.",
  },
]

const faqs = [
  {
    question: "Which mould test do I need?",
    answer:
      "The appropriate test depends on your situation. Air sampling is best for assessing overall indoor air quality and detecting hidden mould. Surface sampling identifies species on visible growth. Bulk sampling determines material contamination depth. Our technicians recommend the right combination during the initial consultation.",
  },
  {
    question: "How accurate are mould test results?",
    answer:
      "NATA-accredited laboratory results are highly accurate and legally admissible. Air sampling provides a snapshot of conditions at the time of collection, so we follow strict calibration and collection protocols to ensure representative results. Multiple samples across different locations improve overall accuracy.",
  },
  {
    question: "How long does it take to get results?",
    answer:
      "Standard laboratory turnaround is 48 hours from sample receipt. Urgent results can often be arranged within 24 hours for an additional fee. We contact you as soon as results are available and provide a detailed written report with interpretation and recommendations.",
  },
  {
    question: "Are DIY mould test kits accurate compared to professional testing?",
    answer:
      "DIY settle-plate kits have significant limitations. They cannot quantify airborne spore concentrations, lack outdoor baselines for comparison, and are not analysed under NATA-accredited conditions. Professional testing with calibrated equipment and accredited analysis provides reliable, defensible results.",
  },
  {
    question: "When is mould testing legally required?",
    answer:
      "Mould testing may be required for insurance claims, property transactions where mould has been identified, workplace health and safety investigations, landlord-tenant disputes, and post-remediation clearance verification. NATA-accredited results are necessary for legal and regulatory purposes.",
  },
]

export default function MouldTestingPage() {
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
  slug: 'mould-testing',
  parentSlug: 'mould-remediation',
  parentName: 'Mould Remediation',
  serviceName: 'Mould Testing',
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
              src="/images/services/mould-remediation/mould-testing-hero.webp"
              alt="Professional mould testing and air sampling equipment"
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
              <MouldRemediation size="hero" gradient="mould" aria-label="Mould Testing" />
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              IICRC Certified
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Mould Testing & <span className="text-[#00BFA6]">Laboratory Analysis</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8 max-w-3xl mx-auto">
              NATA-accredited mould testing with professional sample collection, species identification, and quantitative
              analysis. Court-admissible results with expert interpretation for remediation, insurance, and legal purposes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                Request Mould Testing
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
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">NATA</div>
              <div className="text-[#9CA3AF]">Accredited Lab</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#10B981] mb-2">48hr</div>
              <div className="text-[#9CA3AF]">Lab Results</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">Species</div>
              <div className="text-[#9CA3AF]">Identification</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">Court</div>
              <div className="text-[#9CA3AF]">Admissible Results</div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Mould Testing Process
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
            Testing Services & Capabilities
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
              <h2 className="font-poppins font-semibold text-2xl text-white">Types of Mould Tests</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Air sampling measures airborne spore concentrations per cubic metre",
                "Surface sampling identifies mould colonies growing on materials",
                "Bulk sampling analyses building materials for mould penetration",
                "Moisture testing locates hidden water sources fuelling mould growth",
                "Each test serves a different purpose and may be combined for comprehensive results",
                "Professional interpretation is essential for accurate understanding of test data",
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
              { title: "Mould Inspection", href: "/services/mould-remediation/mould-inspection", desc: "Comprehensive mould inspection and moisture assessment services." },
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
              Need Urgent Mould Testing?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Priority mould testing with 24-hour rush results available. Contact us now for immediate sample collection.
            </p>
            <Button className="bg-white hover:bg-white/90 text-[#EF4444] font-bold text-xl px-12 py-4">
              Request Urgent Testing
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
