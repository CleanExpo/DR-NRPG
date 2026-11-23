import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, Heart, Home, Trash2 } from "lucide-react"
import { BioForensic } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Hoarding Cleanup Services | Biohazard Cleanup Australia",
  description: "Compassionate hoarding cleanup and remediation services. Qualified professionals providing sensitive, staged decluttering and biohazard decontamination across Australia.",
  keywords: ['hoarding cleanup', 'hoarder cleaning', 'extreme cleaning', 'hoarding remediation', 'biohazard hoarding', 'declutter service', 'Australia'],
  slug: 'hoarding-cleanup',
  parentSlug: 'biohazard-cleanup',
  parentName: 'Biohazard Cleanup',
  serviceName: 'Hoarding Cleanup',
})

const processSteps = [
  {
    step: 1,
    title: "Compassionate Consultation",
    description:
      "We begin with a private, non-judgemental consultation to understand the situation. Where appropriate, we coordinate with mental health professionals and family members to develop a comfortable approach.",
  },
  {
    step: 2,
    title: "Systematic Sorting",
    description:
      "Items are carefully sorted into categories: keep, donate, recycle, and dispose. We respect the individual\u2019s attachment to belongings and work at a pace that feels manageable.",
  },
  {
    step: 3,
    title: "Biohazard Remediation",
    description:
      "Once cleared, any areas with biological contamination (rodent droppings, mould, animal waste, decomposition) are professionally decontaminated to industry standards.",
  },
  {
    step: 4,
    title: "Deep Clean & Restoration",
    description:
      "Complete deep cleaning of all surfaces, floors, and fixtures. Structural repairs are carried out as needed. The property is restored to a safe, livable condition.",
  },
]

const features = [
  {
    title: "Compassionate Approach",
    description:
      "Hoarding is a recognised mental health condition. Our teams are trained in trauma-informed care and work with empathy, patience, and respect throughout every engagement.",
  },
  {
    title: "Staged Cleanup Plans",
    description:
      "We understand that large-scale cleanouts can be overwhelming. We offer staged plans \u2014 room by room, level by level \u2014 at a pace the individual is comfortable with.",
  },
  {
    title: "Biohazard Assessment",
    description:
      "Hoarding environments often harbour biological hazards including rodent infestations, mould growth, animal waste, and decomposing organic matter requiring professional remediation.",
  },
  {
    title: "Vermin & Pest Remediation",
    description:
      "Coordination with licensed pest controllers for rodent, insect, and vermin removal. Full decontamination of pest-affected areas including droppings and nesting materials.",
  },
  {
    title: "Structural Assessment",
    description:
      "Evaluation of structural integrity compromised by excessive weight loading, moisture damage, pest damage, or neglected maintenance. Coordination with builders for repairs.",
  },
  {
    title: "Ongoing Support",
    description:
      "Connections to hoarding support groups, mental health professionals, and professional organisers to help maintain the restored living environment long-term.",
  },
]

const faqs = [
  {
    question: "How do you approach someone who hoards with sensitivity?",
    answer:
      "All our team members receive specialised training in hoarding disorder awareness and trauma-informed engagement. We never force decisions, work at the individual\u2019s pace, and maintain strict confidentiality. We can also coordinate with their mental health professional for a collaborative approach.",
  },
  {
    question: "What health hazards are common in hoarding situations?",
    answer:
      "Common hazards include mould growth from poor ventilation and moisture, rodent and insect infestations, decomposing food and organic matter, blocked fire exits, structural overloading, and compromised electrical and plumbing systems. Our assessment identifies all hazards before work begins.",
  },
  {
    question: "How long does a hoarding cleanup take?",
    answer:
      "Duration varies significantly based on the property size and level of accumulation. Small apartments may take 2-3 days, while larger properties with severe hoarding can take 1-3 weeks. Staged cleanups spread over multiple visits may take longer but are often more manageable for the individual.",
  },
  {
    question: "Can you help with deceased estate hoarding situations?",
    answer:
      "Yes. We frequently assist families dealing with inherited properties affected by hoarding. We handle the full process including sorting, valuables identification, donation coordination, disposal, and biohazard remediation with care and discretion.",
  },
  {
    question: "Do you donate or recycle items rather than disposing of everything?",
    answer:
      "Absolutely. We partner with local charities, op shops, and recycling facilities to divert as much as possible from landfill. Items in good condition are donated, recyclables are sorted appropriately, and only unsuitable items are disposed of responsibly.",
  },
]

export default function HoardingCleanupPage() {
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
  slug: 'hoarding-cleanup',
  parentSlug: 'biohazard-cleanup',
  parentName: 'Biohazard Cleanup',
  serviceName: 'Hoarding Cleanup',
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
              src="/images/services/biohazard-cleanup/hoarding-cleanup-hero.webp"
              alt="Professional hoarding cleanup equipment"
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
                <BioForensic size="hero" gradient="bio" aria-label="Hoarding Cleanup" />
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
                Qualified Contractors {"\u2014"} Trauma-Informed Care
              </div>
              <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
                Hoarding Cleanup <span className="text-[#00BFA6]">Services</span>
              </h1>
              <p className="text-xl text-[#9CA3AF] mb-8 max-w-3xl mx-auto">
                Compassionate, non-judgemental hoarding cleanup and remediation. Our teams work with
                empathy and patience to restore safe, livable environments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                  Request Consultation
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
              <Heart className="h-8 w-8 text-[#00BFA6] mx-auto mb-1" />
              <div className="text-[#9CA3AF]">Compassionate Care</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#2196F3] mb-2">Private</div>
              <div className="text-[#9CA3AF]">Confidential Service</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <Home className="h-8 w-8 text-[#7C4DFF] mx-auto mb-1" />
              <div className="text-[#9CA3AF]">Full Restoration</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <Trash2 className="h-8 w-8 text-[#FFD700] mx-auto mb-1" />
              <div className="text-[#9CA3AF]">Donate & Recycle</div>
            </div>
          </div>
        </section>

        {/* Our Process */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Hoarding Cleanup Process
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
            Comprehensive Hoarding Cleanup Services
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

        {/* Hazards Info */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-8 w-8 text-[#FFD700]" />
              <h2 className="font-poppins font-semibold text-2xl text-white">
                Common Hazards in Hoarding Environments
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Mould and mildew from poor ventilation</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Rodent and insect infestations</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Blocked fire exits and trip hazards</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Structural overloading and floor damage</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Decomposing organic matter</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Compromised electrical and plumbing systems</span>
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

        {/* CTA */}
        <section className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-[#EF4444] to-[#DC2626] rounded-2xl p-12 text-center">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-white mb-4">
              Need Help with a Hoarding Situation?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Confidential, compassionate service. No judgement, just help.
            </p>
            <Button className="bg-white hover:bg-white/90 text-[#EF4444] font-bold text-xl px-12 py-4">
              Request Confidential Consultation
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
