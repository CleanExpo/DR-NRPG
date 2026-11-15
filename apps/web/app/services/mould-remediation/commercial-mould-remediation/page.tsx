import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, Shield, Building2, Clock, HardHat } from "lucide-react"
import { MouldRemediation } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Commercial Mould Remediation | Mould Remediation Australia",
  description: "Professional commercial mould remediation for offices, retail, warehouses, and industrial properties. WorkSafe compliant, minimal disruption, 24/7 available across Australia.",
  keywords: ['commercial mould remediation', 'office mould removal', 'industrial mould', 'business mould cleanup', 'commercial mould testing', 'Australia'],
  slug: 'commercial-mould-remediation',
  parentSlug: 'mould-remediation',
  parentName: 'Mould Remediation',
  serviceName: 'Commercial Mould Remediation',
})

const processSteps = [
  {
    step: 1,
    title: "Commercial Assessment & Scope",
    description:
      "A thorough assessment of the commercial property determines the extent of mould contamination, affected systems, occupant impact, and develops a detailed remediation scope and timeline.",
  },
  {
    step: 2,
    title: "Containment & Workforce Planning",
    description:
      "Containment zones are established to isolate affected areas from occupied spaces. A workforce plan is developed to minimise business disruption, including after-hours scheduling where possible.",
  },
  {
    step: 3,
    title: "Large-Scale Remediation",
    description:
      "Professional remediation teams execute the scope using commercial-grade equipment including HEPA air scrubbers, negative air machines, and antimicrobial treatments across all affected areas.",
  },
  {
    step: 4,
    title: "Clearance Testing & Documentation",
    description:
      "Independent post-remediation clearance testing verifies successful remediation. Comprehensive documentation is provided for WorkSafe compliance, insurance, and building management records.",
  },
]

const features = [
  {
    title: "Office & Retail Remediation",
    description:
      "Specialist remediation for office buildings, retail spaces, and shopping centres with minimal impact on business operations and customer-facing areas.",
  },
  {
    title: "Warehouse & Industrial",
    description:
      "Large-scale remediation for warehouses, factories, and industrial facilities including structural steel, concrete, and high-bay areas with specialist access equipment.",
  },
  {
    title: "HVAC System Remediation",
    description:
      "Complete assessment and remediation of commercial HVAC systems that can harbour and distribute mould spores throughout multi-storey and multi-tenanted buildings.",
  },
  {
    title: "Minimal Business Disruption",
    description:
      "Flexible scheduling including after-hours, weekend, and staged remediation programmes designed to keep your business operating during the remediation process.",
  },
  {
    title: "WorkSafe Compliance",
    description:
      "All commercial remediation projects comply with WorkSafe requirements including safe work method statements, risk assessments, and occupational health documentation.",
  },
  {
    title: "Building Management Coordination",
    description:
      "Direct coordination with building managers, strata committees, and facility management teams to integrate remediation with building operations and access requirements.",
  },
]

const faqs = [
  {
    question: "What are my legal obligations as a building owner regarding mould?",
    answer:
      "Building owners and employers have a duty of care under workplace health and safety legislation to provide a safe working environment. This includes addressing known mould contamination, responding to occupant complaints, and maintaining building systems to prevent moisture and mould issues. Failure to act can result in WorkSafe investigations and liability claims.",
  },
  {
    question: "Can employees refuse to work in a mouldy building?",
    answer:
      "Under Australian workplace health and safety law, workers can cease work if they have a reasonable concern that continuing work would expose them to a serious health risk. If mould contamination poses a genuine health risk, employees may be within their rights to refuse to work in the affected area until remediation is completed.",
  },
  {
    question: "Can you perform remediation after hours to minimise disruption?",
    answer:
      "Yes. We offer after-hours, weekend, and staged remediation programmes specifically designed for commercial properties. Our teams can work outside business hours to minimise impact on your operations, tenants, and customers. We coordinate directly with building management to schedule access.",
  },
  {
    question: "How do you handle mould in multi-tenant buildings?",
    answer:
      "Multi-tenant remediation requires careful coordination with building management, strata committees, and individual tenants. We establish containment to prevent cross-contamination between tenancies, coordinate access schedules, and provide documentation for each affected area. Communication plans keep all stakeholders informed throughout the process.",
  },
  {
    question: "What compliance documentation do you provide?",
    answer:
      "We provide comprehensive documentation including initial assessment reports, safe work method statements, risk assessments, remediation completion certificates, independent clearance testing results, and photographic records. This documentation satisfies WorkSafe, insurance, and building management requirements.",
  },
]

export default function CommercialMouldRemediationPage() {
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
  slug: 'commercial-mould-remediation',
  parentSlug: 'mould-remediation',
  parentName: 'Mould Remediation',
  serviceName: 'Commercial Mould Remediation',
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
              src="/images/services/mould-remediation/commercial-mould-remediation-hero.webp"
              alt="Commercial mould remediation equipment"
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
                <MouldRemediation size="hero" gradient="mould" aria-label="Commercial Mould Remediation" />
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
                IICRC Certified
              </div>
              <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
                Commercial Mould <span className="text-[#00BFA6]">Remediation</span>
              </h1>
              <p className="text-xl text-[#9CA3AF] mb-8 max-w-3xl mx-auto">
                Professional mould remediation for commercial and industrial properties. WorkSafe-compliant processes with
                minimal business disruption, after-hours availability, and comprehensive compliance documentation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                  Request Commercial Assessment
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
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">24/7</div>
              <div className="text-[#9CA3AF]">Available</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#10B981] mb-2">WorkSafe</div>
              <div className="text-[#9CA3AF]">Compliant</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">All</div>
              <div className="text-[#9CA3AF]">Commercial Types</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">Low</div>
              <div className="text-[#9CA3AF]">Minimal Disruption</div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Commercial Remediation Process
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
            Commercial Services & Capabilities
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
              <h2 className="font-poppins font-semibold text-2xl text-white">Commercial Mould Risks</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Workplace health and safety obligations under WHS legislation",
                "Increased employee sick leave and reduced productivity costs",
                "Risk of WorkSafe investigation and potential prosecution",
                "Building structural damage from prolonged mould exposure",
                "Tenant disputes and potential lease termination claims",
                "Insurance premium increases and potential claim rejection",
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
              { title: "Mould Testing", href: "/services/mould-remediation/mould-testing", desc: "NATA-accredited laboratory mould testing and species identification." },
              { title: "Mould Prevention", href: "/services/mould-remediation/mould-prevention", desc: "Proactive mould prevention solutions including ventilation and waterproofing." },
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
              Need Emergency Commercial Mould Remediation?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              24/7 commercial mould remediation with after-hours availability. Protect your employees, tenants, and business.
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
