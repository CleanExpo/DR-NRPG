import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, Shield, Fan, Droplets, Eye } from "lucide-react"
import { MouldRemediation } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Mould Prevention Services | Mould Remediation Australia",
  description: "Professional mould prevention services including ventilation improvement, waterproofing, dehumidification, and ongoing monitoring plans. Stop mould before it starts.",
  keywords: ['mould prevention', 'mould proofing', 'humidity control', 'ventilation', 'mould resistant', 'moisture prevention', 'Australia'],
  slug: 'mould-prevention',
  parentSlug: 'mould-remediation',
  parentName: 'Mould Remediation',
  serviceName: 'Mould Prevention',
})

const processSteps = [
  {
    step: 1,
    title: "Property Assessment",
    description:
      "A comprehensive assessment of your property identifies existing vulnerabilities, moisture entry points, ventilation deficiencies, and areas at highest risk of mould growth.",
  },
  {
    step: 2,
    title: "Moisture Source Identification",
    description:
      "Using thermal imaging and calibrated moisture meters, all active and potential moisture sources are mapped including leaks, condensation zones, rising damp, and drainage issues.",
  },
  {
    step: 3,
    title: "Prevention Measures Installation",
    description:
      "Tailored prevention solutions are installed based on your property's specific needs, including ventilation upgrades, waterproofing, dehumidification systems, and anti-mould coatings.",
  },
  {
    step: 4,
    title: "Monitoring Plan Establishment",
    description:
      "An ongoing monitoring plan is established with scheduled check-ups, humidity monitoring devices, and maintenance recommendations to ensure long-term mould-free conditions.",
  },
]

const features = [
  {
    title: "Ventilation Improvement",
    description:
      "Assessment and upgrade of existing ventilation systems, including installation of exhaust fans, sub-floor ventilation, and roof ventilation to maintain healthy airflow.",
  },
  {
    title: "Waterproofing Solutions",
    description:
      "Professional waterproofing of wet areas, external walls, basements, and sub-floor spaces to prevent moisture ingress that drives mould growth.",
  },
  {
    title: "Dehumidification Systems",
    description:
      "Installation of whole-house or targeted dehumidification systems to maintain indoor humidity below the 60% threshold that supports mould growth.",
  },
  {
    title: "Drainage Improvements",
    description:
      "Assessment and improvement of property drainage including stormwater, sub-surface drainage, and grading to direct water away from the building envelope.",
  },
  {
    title: "Anti-Mould Coatings",
    description:
      "Application of professional-grade anti-mould coatings and paints to walls, ceilings, and surfaces in high-risk areas such as bathrooms, kitchens, and laundries.",
  },
  {
    title: "Ongoing Monitoring Plans",
    description:
      "Scheduled property inspections, humidity data logging, and maintenance programmes ensure prevention measures continue to perform effectively over time.",
  },
]

const faqs = [
  {
    question: "How do I prevent mould in the bathroom?",
    answer:
      "Effective bathroom mould prevention requires adequate exhaust ventilation running during and for at least 20 minutes after showers, wiping down wet surfaces, fixing any leaks promptly, using anti-mould paint on ceilings, and ensuring grout and sealant are maintained. A properly sized exhaust fan ducted to the exterior is essential.",
  },
  {
    question: "What is the ideal indoor humidity level to prevent mould?",
    answer:
      "Indoor relative humidity should be maintained below 60% to prevent mould growth, with 40-50% being ideal. Above 60%, most mould species can begin to colonise surfaces within 48 to 72 hours. A quality hygrometer can help you monitor humidity levels in problem areas of your property.",
  },
  {
    question: "Do dehumidifiers work for mould prevention?",
    answer:
      "Dehumidifiers are effective for controlling humidity in enclosed spaces, particularly during humid seasons or in naturally damp areas like basements. However, they address symptoms rather than root causes. A comprehensive prevention approach also addresses ventilation, waterproofing, and moisture sources.",
  },
  {
    question: "Is ventilation or dehumidification better for mould prevention?",
    answer:
      "Both serve different purposes and are often used together. Ventilation removes moist air and brings in fresh air, which is ideal for bathrooms, kitchens, and sub-floor spaces. Dehumidification reduces humidity in enclosed spaces where ventilation alone is insufficient. The best approach depends on your property's specific conditions.",
  },
  {
    question: "How often should I check my property for mould?",
    answer:
      "We recommend visual inspections of high-risk areas such as bathrooms, kitchens, laundries, and sub-floor spaces at least quarterly. After heavy rain, storms, or plumbing events, check immediately. Properties with a history of mould should be professionally inspected annually to ensure prevention measures remain effective.",
  },
]

export default function MouldPreventionPage() {
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
  slug: 'mould-prevention',
  parentSlug: 'mould-remediation',
  parentName: 'Mould Remediation',
  serviceName: 'Mould Prevention',
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
              src="/images/services/mould-remediation/mould-prevention-hero.webp"
              alt="Professional mould prevention equipment"
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
                <MouldRemediation size="hero" gradient="mould" aria-label="Mould Prevention" />
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
                Qualified Contractors
              </div>
              <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
                Mould Prevention <span className="text-[#00BFA6]">Services</span>
              </h1>
              <p className="text-xl text-[#9CA3AF] mb-8 max-w-3xl mx-auto">
                Proactive mould prevention solutions tailored to your property. From ventilation upgrades and waterproofing
                to dehumidification systems and ongoing monitoring, we stop mould before it starts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                  Request Prevention Assessment
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
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">Prevent</div>
              <div className="text-[#9CA3AF]">Prevention First</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#10B981] mb-2">&lt;60%</div>
              <div className="text-[#9CA3AF]">Humidity Controlled</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">Airflow</div>
              <div className="text-[#9CA3AF]">Ventilation Optimised</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">Ongoing</div>
              <div className="text-[#9CA3AF]">Long-Term Protection</div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Mould Prevention Process
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
            Prevention Solutions & Services
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
              <h2 className="font-poppins font-semibold text-2xl text-white">Conditions That Cause Mould Growth</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Indoor humidity levels consistently above 60% relative humidity",
                "Poor ventilation in bathrooms, kitchens, laundries, and enclosed spaces",
                "Unrepaired water leaks from plumbing, roofing, or building envelope",
                "Condensation on windows, walls, and cold surfaces during cooler months",
                "Flooding aftermath with inadequate drying within 48 hours",
                "High-moisture areas such as bathrooms, kitchens, and laundries without adequate exhaust",
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
              Protect Your Property from Mould
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Prevention is always more cost-effective than remediation. Contact us for a comprehensive prevention assessment.
            </p>
            <Button className="bg-white hover:bg-white/90 text-[#EF4444] font-bold text-xl px-12 py-4">
              Request Prevention Assessment
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
