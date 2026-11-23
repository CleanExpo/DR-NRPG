import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, Flame, ShieldAlert, Droplets } from "lucide-react"
import { FireSmoke } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Soot Removal Services | Fire & Smoke Damage Australia",
  description: "Professional soot removal and cleaning services across Australia. Qualified fire and smoke restoration technicians using HEPA extraction, chemical sponge treatment, and specialist techniques for all soot types. 24/7 response.",
  keywords: ['soot removal', 'soot cleaning', 'soot damage', 'carbon cleaning', 'fire soot cleanup', 'professional soot removal', 'Australia'],
  slug: 'soot-removal',
  parentSlug: 'fire-smoke-damage',
  parentName: 'Fire & Smoke Damage',
  serviceName: 'Soot Removal',
})

const processSteps = [
  {
    step: 1,
    title: "Soot Type Identification",
    description:
      "Our qualified technicians identify the type of soot present - dry, wet, protein, or fuel oil - as each requires a fundamentally different cleaning approach. Incorrect methods can permanently embed soot into surfaces, making this critical first step essential.",
  },
  {
    step: 2,
    title: "Dry Soot Removal",
    description:
      "HEPA-filtered vacuums and chemical dry sponges remove loose soot particles without smearing or embedding them into surfaces. This crucial first-pass removal prevents cross-contamination and prepares surfaces for wet cleaning treatment.",
  },
  {
    step: 3,
    title: "Wet Cleaning & Treatment",
    description:
      "Professional-grade cleaning solutions matched to the soot type are applied to all affected surfaces. Alkaline cleaners, solvent-based degreasers, or enzymatic treatments are selected based on the soot composition and surface material.",
  },
  {
    step: 4,
    title: "Surface Restoration",
    description:
      "Final restoration includes sealing treated surfaces to prevent residual staining, repainting where necessary, and applying protective coatings. All treated areas are inspected under UV light to confirm complete soot removal.",
  },
]

const features = [
  {
    title: "Dry Smoke Soot Cleaning",
    description:
      "Powdery, fine-particle soot from fast, high-temperature fires. Removed with HEPA vacuuming and dry chemical sponges before any wet cleaning to prevent smearing and permanent surface staining.",
  },
  {
    title: "Wet Smoke Soot Removal",
    description:
      "Thick, sticky, tar-like soot from slow, smouldering fires. Requires solvent-based cleaners and specialised degreasing agents. This is the most challenging soot type due to its adhesive properties.",
  },
  {
    title: "HEPA Vacuuming",
    description:
      "Industrial HEPA-filtered vacuum extraction captures soot particles down to 0.3 microns. This critical first step removes loose particulate without disturbing settled soot or pushing it deeper into porous surfaces.",
  },
  {
    title: "Chemical Sponge Treatment",
    description:
      "Vulcanised rubber dry cleaning sponges lift soot from surfaces through chemical absorption without moisture. Essential for delicate surfaces like wallpaper, untreated timber, and plasterboard that cannot tolerate wet cleaning.",
  },
  {
    title: "Hard Surface Restoration",
    description:
      "Complete soot removal from tile, stone, glass, metal, timber, and painted surfaces using surface-appropriate cleaning agents. Acidic soot residue is neutralised to prevent ongoing corrosion and deterioration.",
  },
  {
    title: "Porous Material Treatment",
    description:
      "Specialist treatment of soot-affected carpet, upholstery, curtains, clothing, and other porous materials. Ultrasonic cleaning, ozone treatment, and professional laundering restore items where possible.",
  },
]

const faqs = [
  {
    question: "Can I clean soot myself?",
    answer:
      "We strongly advise against DIY soot cleaning. Wiping soot with a cloth, paper towel, or household cleaner will smear it into surfaces, causing permanent staining. Soot also contains carcinogens and respiratory irritants requiring proper PPE. Professional HEPA vacuuming and type-specific chemical treatment is essential for proper removal.",
  },
  {
    question: "What surfaces can be saved from soot damage?",
    answer:
      "Most hard surfaces including tile, glass, metal, stone, and sealed timber can be fully restored. Painted walls and ceilings can often be cleaned and resealed. Porous materials like carpet, upholstery, and untreated timber have variable outcomes depending on soot type and how quickly treatment begins. Our technicians assess each surface individually.",
  },
  {
    question: "How quickly should soot be cleaned after a fire?",
    answer:
      "As soon as possible. Soot is acidic and begins corroding metals, electronics, and plumbing within hours. It bonds chemically with surfaces over time, making removal increasingly difficult. Within 24-48 hours, soot can permanently discolour plastics, fibreglass, and porous materials. Immediate professional intervention delivers the best restoration outcomes.",
  },
  {
    question: "Does soot cause permanent damage?",
    answer:
      "If left untreated, yes. Soot residue is acidic and corrosive, permanently etching metals, discolouring plastics, and staining porous materials. However, with prompt professional treatment, the vast majority of soot damage can be fully reversed. The key factor is speed - the sooner treatment begins, the better the outcome.",
  },
  {
    question: "What does professional soot removal cost?",
    answer:
      "Cost varies based on the extent of damage, soot type, affected surface area, and materials involved. A single room may cost $500-$2,000 while a full property can range from $5,000-$25,000 or more. Most home and business insurance policies cover professional soot removal. We provide detailed quotes and industry-standard documentation for your insurance submission.",
  },
]

export default function SootRemovalPage() {
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
  slug: 'soot-removal',
  parentSlug: 'fire-smoke-damage',
  parentName: 'Fire & Smoke Damage',
  serviceName: 'Soot Removal',
  faqs,
})) }}
      />
      <main className="py-24">
        {/* Breadcrumb */}
        <section className="container mx-auto px-6 mb-8">
          <Link
            href="/services/fire-smoke-damage"
            className="inline-flex items-center text-[#9CA3AF] hover:text-[#00BFA6] transition-colors text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Fire & Smoke Damage Services
          </Link>
        </section>

        {/* Hero Section */}
        <section className="relative overflow-hidden mb-16">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/services/fire-smoke-damage/soot-removal-hero.webp"
              alt="Professional soot removal and cleaning equipment"
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
                <FireSmoke size="hero" gradient="fire" aria-label="Soot Removal Services" />
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
                Qualified Contractors
              </div>
              <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
                Soot Removal & Cleaning <span className="text-[#00BFA6]">Services</span>
              </h1>
              <p className="text-xl text-[#9CA3AF] mb-8 max-w-3xl mx-auto">
                Professional soot removal for all fire types using HEPA extraction, chemical sponge
                treatment, and specialist cleaning techniques. Qualified fire and smoke restoration technicians across Australia.
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
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">All</div>
              <div className="text-[#9CA3AF]">Soot Types Treated</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#2196F3] mb-2">HEPA</div>
              <div className="text-[#9CA3AF]">Particle Extraction</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">Safe</div>
              <div className="text-[#9CA3AF]">Surface Treatment</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">Expert</div>
              <div className="text-[#9CA3AF]">Cleaned & Verified</div>
            </div>
          </div>
        </section>

        {/* Our Process */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Soot Removal Process
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

        {/* Features Grid */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Comprehensive Soot Removal Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]"
              >
                <Flame className="h-8 w-8 text-[#EF4444] mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  {feature.title}
                </h3>
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
              <h2 className="font-poppins font-semibold text-2xl text-white">
                Soot Health Hazards
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Soot contains known carcinogens including polycyclic aromatic hydrocarbons</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Fine particles cause severe respiratory irritation and lung damage</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Direct skin contact causes irritation and potential chemical burns</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Disturbing soot incorrectly causes permanent staining of surfaces</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Acidic residue corrodes metals, electronics, and plumbing fixtures</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                  <span className="text-[#9CA3AF]">Always wear appropriate PPE - never handle soot without protection</span>
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
            Related Fire & Smoke Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Fire Damage Restoration", href: "/services/fire-smoke-damage/fire-damage-restoration" },
              { name: "Smoke Damage Restoration", href: "/services/fire-smoke-damage/smoke-damage-restoration" },
              { name: "Smoke Odour Removal", href: "/services/fire-smoke-damage/smoke-odor-removal" },
              { name: "Commercial Fire Damage", href: "/services/fire-smoke-damage/commercial-fire-damage" },
            ].map((service) => (
              <Link key={service.href} href={service.href}>
                <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-5 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer text-center">
                  <FireSmoke size="md" gradient="fire" className="mx-auto mb-3" aria-hidden="true" />
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
              Need Professional Soot Removal?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Do not attempt DIY soot cleaning. Our qualified technicians are available 24/7.
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
