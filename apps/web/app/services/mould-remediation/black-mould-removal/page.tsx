import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, Shield, Clock, FlaskConical, Microscope } from "lucide-react"
import { MouldRemediation } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Black Mould Removal Services | Mould Remediation Australia",
  description: "Professional black mould removal with IICRC certified technicians. Full containment protocols, HEPA air scrubbing, antimicrobial treatment, and post-remediation verification across Australia.",
  keywords: ['black mould removal', 'toxic mould', 'mould remediation', 'stachybotrys removal', 'mould cleanup', 'mould testing', 'Australia'],
  slug: 'black-mould-removal',
  parentSlug: 'mould-remediation',
  parentName: 'Mould Remediation',
  serviceName: 'Black Mould Removal',
})

const processSteps = [
  {
    step: 1,
    title: "Containment & Air Filtration",
    description:
      "Full negative air containment is established with HEPA-filtered air scrubbers to prevent cross-contamination during the remediation process.",
  },
  {
    step: 2,
    title: "Mould Colony Removal",
    description:
      "Affected materials are carefully removed and disposed of following strict protocols. Non-porous surfaces are cleaned using specialist techniques.",
  },
  {
    step: 3,
    title: "Antimicrobial Treatment",
    description:
      "All remediated areas receive professional-grade antimicrobial treatment to eliminate residual spores and inhibit future mould growth.",
  },
  {
    step: 4,
    title: "Post-Remediation Verification",
    description:
      "Independent air quality testing and visual inspection confirm successful remediation. Clearance certificates are issued upon passing.",
  },
]

const features = [
  {
    title: "Stachybotrys Identification",
    description:
      "Laboratory-confirmed species identification to determine the exact type of black mould and appropriate remediation strategy.",
  },
  {
    title: "Full Containment Protocols",
    description:
      "Negative air pressure containment with polyethylene sheeting prevents spore migration to unaffected areas of the property.",
  },
  {
    title: "HEPA Air Scrubbing",
    description:
      "Industrial HEPA air scrubbers capture 99.97% of particles down to 0.3 microns, ensuring thorough airborne spore removal.",
  },
  {
    title: "Antimicrobial Treatment",
    description:
      "Professional-grade antimicrobial agents are applied to all remediated surfaces to eliminate residual contamination.",
  },
  {
    title: "Structural Material Removal",
    description:
      "Porous materials such as drywall, carpet, and insulation that cannot be salvaged are safely removed and disposed of.",
  },
  {
    title: "Post-Remediation Clearance Testing",
    description:
      "Independent laboratory air sampling verifies the remediation meets industry clearance standards before the area is released.",
  },
]

const faqs = [
  {
    question: "Is all black mould dangerous?",
    answer:
      "Not all dark-coloured mould is Stachybotrys chartarum (toxic black mould). Many common moulds appear dark but pose lower health risks. However, professional testing is the only reliable way to identify the species. We recommend treating all visible mould growth seriously and having it assessed by a certified technician.",
  },
  {
    question: "Can I remove black mould myself?",
    answer:
      "Small areas of surface mould (less than one square metre) on non-porous surfaces may be manageable with proper PPE. However, black mould in wall cavities, HVAC systems, or large areas requires professional remediation. DIY attempts without containment can spread spores throughout the property, significantly worsening the problem.",
  },
  {
    question: "How do I know if I have black mould?",
    answer:
      "Signs include dark greenish-black patches on walls, ceilings, or other surfaces, a persistent musty odour, and unexplained health symptoms such as respiratory issues or headaches. A professional mould inspection with laboratory testing is the only definitive way to confirm Stachybotrys presence.",
  },
  {
    question: "How long does black mould remediation take?",
    answer:
      "Remediation timelines depend on the extent of contamination. Small contained areas may take one to two days, while large-scale remediation involving structural materials can take three to five days or more. We provide a detailed timeline during the initial assessment.",
  },
  {
    question: "Will black mould come back after remediation?",
    answer:
      "Effective remediation addresses both the mould and the underlying moisture source. If the moisture issue is resolved, black mould should not return. We identify and recommend solutions for all contributing moisture problems as part of our remediation process.",
  },
]

export default function BlackMouldRemovalPage() {
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
  slug: 'black-mould-removal',
  parentSlug: 'mould-remediation',
  parentName: 'Mould Remediation',
  serviceName: 'Black Mould Removal',
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
              src="/images/services/mould-remediation/black-mould-removal-hero.webp"
              alt="Black mould removal containment and HEPA filtration"
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
              <MouldRemediation size="hero" gradient="mould" aria-label="Black Mould Removal" />
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              IICRC Certified
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Black Mould Removal <span className="text-[#00BFA6]">Services</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8 max-w-3xl mx-auto">
              Professional black mould removal with full containment protocols and HEPA air scrubbing. Our IICRC
              certified technicians ensure safe, thorough remediation with post-clearance verification.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                Request Black Mould Removal
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
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">Industry</div>
              <div className="text-[#9CA3AF]">Standard</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#10B981] mb-2">HEPA</div>
              <div className="text-[#9CA3AF]">Filtered Air Scrubbing</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">100%</div>
              <div className="text-[#9CA3AF]">Full Containment</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">Lab</div>
              <div className="text-[#9CA3AF]">Verified Results</div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Black Mould Removal Process
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
            Professional Black Mould Removal Features
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
              <h2 className="font-poppins font-semibold text-2xl text-white">Black Mould Health Risks</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Respiratory issues including asthma and chronic cough",
                "Chronic sinusitis and nasal congestion",
                "Neurological symptoms such as headaches and memory loss",
                "Immune system suppression with prolonged exposure",
                "Toxic mycotoxin exposure from Stachybotrys species",
                "Particularly dangerous for children, elderly, and immunocompromised individuals",
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
              { title: "Mould Inspection", href: "/services/mould-remediation/mould-inspection", desc: "Comprehensive mould inspection and moisture assessment services." },
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
              Need Emergency Black Mould Removal?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Our IICRC-certified team is available 24/7 for urgent black mould remediation across Australia.
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
