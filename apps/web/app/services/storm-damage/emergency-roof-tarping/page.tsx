import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, CloudLightning, Shield, ArrowRight, Clock, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Emergency Roof Tarping Services | Storm Damage Restoration Australia",
  description: "Emergency roof tarping services across Australia. 2-hour rapid deployment of heavy-duty UV-stabilised tarps. Professional installation, multi-storey capability, and 24/7 after-hours availability. Insurance documentation included.",
  keywords: ['emergency roof tarping', 'roof tarp', 'temporary roof cover', 'storm roof protection', 'emergency roof repair', 'make safe', 'Australia'],
  slug: 'emergency-roof-tarping',
  parentSlug: 'storm-damage',
  parentName: 'Storm Damage',
  serviceName: 'Emergency Roof Tarping',
})

const processSteps = [
  {
    step: "01",
    title: "Damage Triage Call",
    description:
      "Immediate phone assessment to determine the severity and location of roof damage, identify hazards, and dispatch the nearest emergency tarping crew to your property.",
  },
  {
    step: "02",
    title: "Rapid Deployment",
    description:
      "Our emergency crews deploy within 2 hours carrying heavy-duty tarps, mechanical fastening equipment, and safety gear for all roof types and heights.",
  },
  {
    step: "03",
    title: "Emergency Tarping Installation",
    description:
      "Professional installation of UV-stabilised tarps using secure mechanical fastening. Complete coverage of all damaged areas to prevent water ingress, with attention to proper drainage.",
  },
  {
    step: "04",
    title: "Follow-Up Assessment",
    description:
      "Comprehensive damage assessment and photographic documentation for insurance purposes. Permanent repair recommendations and scheduling for full roof restoration.",
  },
]

const features = [
  {
    title: "2-Hour Emergency Response",
    description:
      "Guaranteed rapid deployment with emergency crews positioned across all major Australian metropolitan areas for fastest possible response times.",
  },
  {
    title: "Heavy-Duty UV-Stabilised Tarps",
    description:
      "Commercial-grade, UV-stabilised polyethylene tarps rated for extended outdoor exposure. Designed to withstand ongoing weather events until permanent repairs are completed.",
  },
  {
    title: "Secure Mechanical Fastening",
    description:
      "Professional fastening using timber battens, screws, and anchor points rather than sandbags or tape. Ensures tarps remain secure through subsequent storms and wind events.",
  },
  {
    title: "Multi-Storey Capability",
    description:
      "Fully equipped for single and multi-storey properties with elevated work platforms, harness systems, and trained height-safety personnel.",
  },
  {
    title: "After-Hours Availability",
    description:
      "24/7 emergency tarping available including weekends, public holidays, and overnight callouts. Storms do not wait for business hours and neither do we.",
  },
  {
    title: "Temporary Repair Solutions",
    description:
      "Beyond tarping, we provide temporary flashing, ridge capping, and patching solutions to address specific damage points until permanent repairs are scheduled.",
  },
]

const faqs = [
  {
    question: "How long does an emergency tarp last on a roof?",
    answer:
      "Our heavy-duty UV-stabilised tarps typically last 3 to 6 months when properly installed with mechanical fastening. Duration depends on weather exposure, UV intensity, and wind conditions. We recommend scheduling permanent repairs within 4 to 8 weeks of tarping.",
  },
  {
    question: "What does emergency roof tarping cost?",
    answer:
      "Emergency tarping costs vary based on roof size, height, accessibility, and the extent of damage. Most standard residential tarping is covered under your home insurance policy. We provide detailed invoicing that aligns with insurance requirements for straightforward claim processing.",
  },
  {
    question: "Will my insurance cover emergency roof tarping?",
    answer:
      "Yes, emergency roof tarping is typically covered as a reasonable mitigation measure under most home insurance policies. Insurers expect you to take reasonable steps to prevent further damage after a storm event. We provide all documentation required for your claim.",
  },
  {
    question: "What size tarp is needed for my roof damage?",
    answer:
      "Tarp size depends on the area of damage plus an overlap margin of at least one metre on all sides. Our crews carry a range of tarp sizes from 3x4 metres to 10x12 metres and can deploy multiple tarps for larger damaged areas. Size is assessed on arrival.",
  },
  {
    question: "Can I tarp my own roof after storm damage?",
    answer:
      "We strongly advise against DIY roof tarping. Working at height on a damaged roof is extremely dangerous, amateur tarping often fails in subsequent weather and can void insurance claims. Professional installation with mechanical fastening is essential for effective protection and insurance compliance.",
  },
]

const relatedServices = [
  {
    title: "Roof Storm Damage Repair",
    href: "/services/storm-damage/roof-storm-damage",
    description: "Permanent roof repair and replacement after storm damage.",
  },
  {
    title: "Wind Damage Restoration",
    href: "/services/storm-damage/wind-damage-restoration",
    description: "Structural bracing, cladding repair, and debris removal from wind events.",
  },
  {
    title: "Hail Damage Repair",
    href: "/services/storm-damage/hail-damage-repair",
    description: "Roof tile replacement, dent repair, and exterior restoration after hail.",
  },
  {
    title: "Tree Damage Cleanup",
    href: "/services/storm-damage/tree-damage-cleanup",
    description: "Emergency tree removal, structural repair, and full property restoration.",
  },
]

export default function EmergencyRoofTarpingPage() {
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
  slug: 'emergency-roof-tarping',
  parentSlug: 'storm-damage',
  parentName: 'Storm Damage',
  serviceName: 'Emergency Roof Tarping',
  faqs,
})) }}
      />
      <main className="py-24">
        {/* Breadcrumb */}
        <section className="container mx-auto px-6 mb-8">
          <Link
            href="/services/storm-damage"
            className="inline-flex items-center text-[#9CA3AF] hover:text-[#00BFA6] transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Storm Damage Services
          </Link>
        </section>

        {/* Hero Section */}
        <section className="relative overflow-hidden mb-16">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/services/storm-damage/emergency-roof-tarping-hero.webp"
              alt="Emergency roof tarping with UV-stabilised tarpaulins"
              fill
              priority
              className="object-cover opacity-30"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0F1115]/70 via-[#0F1115]/50 to-[#0F1115]" />
          </div>
          <div className="relative z-10 container mx-auto px-6 pt-16 pb-8">
            <div className="max-w-4xl mx-auto text-center">
            <CloudLightning className="h-16 w-16 text-[#7C4DFF] mx-auto mb-6" />
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              Qualified Contractors
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Emergency Roof <span className="text-[#00BFA6]">Tarping Services</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8">
              Rapid emergency roof tarping across Australia. Our crews deploy within 2 hours with heavy-duty
              UV-stabilised tarps and professional mechanical fastening to protect your property from further damage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                Request Emergency Tarping
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
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">2hr</div>
              <div className="text-[#9CA3AF]">Rapid Deployment</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#2196F3] mb-2">HD</div>
              <div className="text-[#9CA3AF]">Heavy Duty Tarps</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">All</div>
              <div className="text-[#9CA3AF]">All Heights Covered</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">24/7</div>
              <div className="text-[#9CA3AF]">Always Available</div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Emergency Tarping Process
          </h2>
          <div className="max-w-4xl mx-auto space-y-8">
            {processSteps.map((step) => (
              <div key={step.step} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full flex items-center justify-center text-[#00BFA6] font-bold">
                  {step.step}
                </div>
                <div>
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
            Professional Emergency Tarping Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]"
              >
                <Shield className="h-8 w-8 text-[#00BFA6] mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">{feature.title}</h3>
                <p className="text-[#9CA3AF] text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Warning Section */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-8 w-8 text-[#FFD700]" />
              <h2 className="font-poppins font-semibold text-2xl text-white">Why Professional Tarping Is Essential</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Amateur tarping can void your insurance claim entirely",
                "Improperly secured tarps cause further damage in subsequent storms",
                "Working at height on a damaged roof is extremely dangerous",
                "Incorrect tarp sizing allows continued water ingress at edges",
                "Temporary fixes require professional follow-up and documentation",
                "Insurance requires documented professional mitigation measures",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
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
          <div className="max-w-4xl mx-auto space-y-6">
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
            Related Storm Damage Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {relatedServices.map((service) => (
              <Link key={service.title} href={service.href}>
                <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer h-full">
                  <CloudLightning className="h-8 w-8 text-[#7C4DFF] mb-4" />
                  <h3 className="font-poppins font-semibold text-lg text-white mb-3">{service.title}</h3>
                  <p className="text-[#9CA3AF] text-sm mb-4">{service.description}</p>
                  <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Emergency CTA */}
        <section className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-[#EF4444] to-[#DC2626] rounded-2xl p-12 text-center">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-white mb-4">
              Need Emergency Roof Tarping?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Our crews deploy within 2 hours, 24/7. Do not attempt to tarp your own roof. Request professional service now.
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
