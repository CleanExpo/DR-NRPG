import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft, AlertTriangle, Droplets, Clock, Shield, ArrowRight } from "lucide-react"
import { WaterDamage } from "@/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"

export const metadata = generateServiceMetadata({
  title: "Flood Restoration Services | Water Damage Restoration Australia",
  description: "Professional flood restoration services across all 8 Australian states and territories. Flash flood response, storm surge cleanup, and Category 2-3 water treatment. IICRC certified. 24/7 emergency deployment.",
  keywords: ['flood restoration', 'flood damage repair', 'flood cleanup', 'flood water extraction', 'post-flood restoration', 'flood recovery', 'Australia'],
  slug: 'flood-restoration',
  parentSlug: 'water-damage',
  parentName: 'Water Damage',
  serviceName: 'Flood Restoration',
})

const processSteps = [
  { step: 1, title: "Emergency Response & Safety", description: "Our rapid-deployment teams secure the site, assess safety hazards including electrical and structural risks, and establish a safe working perimeter." },
  { step: 2, title: "Flood Water Extraction", description: "Truck-mounted and portable extraction units remove flood water at high volumes, including sediment-laden and contaminated water from all affected areas." },
  { step: 3, title: "Decontamination & Drying", description: "Antimicrobial treatments neutralise bacteria and pathogens. Industrial dehumidifiers and air movers are deployed for thorough structural drying." },
  { step: 4, title: "Structural Restoration", description: "Damaged building materials are removed and replaced, with full restoration to pre-flood condition. Council coordination for permits and industry-standard documentation for your insurance submission provided throughout." },
]

const features = [
  { title: "Flash Flood Response", description: "Rapid-deployment teams equipped for sudden flash flood events with high-volume extraction equipment and emergency containment measures." },
  { title: "River & Creek Flooding", description: "Specialised response for properties affected by rising waterways, including sediment removal, bank stabilisation assessment, and full restoration." },
  { title: "Storm Surge Cleanup", description: "Comprehensive cleanup following storm surge events including salt water damage treatment, corrosion prevention, and structural assessment." },
  { title: "Category 2-3 Water Treatment", description: "Expert handling of grey water and black water contamination with full biohazard protocols, antimicrobial treatment, and safe disposal." },
  { title: "Sediment & Debris Removal", description: "Thorough removal of silt, mud, debris, and organic matter deposited by flood waters, with proper disposal and site decontamination." },
  { title: "Council Liaison & Insurance Documentation", description: "Coordination with local councils for damage assessments and permits, plus comprehensive industry-standard insurance documentation for your claim submission." },
]

const faqs = [
  { question: "What should I do after a flood?", answer: "Do not re-enter your property until authorities confirm it is safe. Avoid contact with flood water as it may contain sewage, chemicals, and debris. Contact us immediately for professional assessment and extraction." },
  { question: "How dangerous is flood water?", answer: "Flood water is classified as Category 2 or 3 (contaminated) water. It can contain sewage, agricultural chemicals, petroleum products, and infectious organisms. Professional decontamination is essential." },
  { question: "Do you cover regional and rural areas?", answer: "Yes. We deploy across all 8 Australian states and territories, including regional and rural areas. For large-scale flood events, we mobilise additional crews and equipment from multiple locations." },
  { question: "Will my insurance cover flood damage?", answer: "Flood coverage varies by policy. Many Australian insurers now offer flood cover as standard or optional. We provide industry-standard documentation — scope of works, moisture reports, and photographic evidence — for you to submit to your insurer." },
  { question: "How long does flood restoration take?", answer: "Extraction may take 1-3 days depending on scale. Drying typically requires 5-7 days. Full structural restoration can take several weeks for severely affected properties. We provide ongoing progress updates." },
]

export default function FloodRestorationPage() {
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
  slug: 'flood-restoration',
  parentSlug: 'water-damage',
  parentName: 'Water Damage',
  serviceName: 'Flood Restoration',
  faqs,
})) }}
      />
      <main className="py-24">
        {/* Breadcrumb */}
        <section className="container mx-auto px-6 mb-8">
          <Link href="/services/water-damage" className="inline-flex items-center text-[#9CA3AF] hover:text-[#00BFA6] transition-colors text-sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Water Damage Services
          </Link>
        </section>

        {/* Hero Section */}
        <section className="relative overflow-hidden mb-16">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/services/water-damage/flood-restoration-hero.webp"
              alt="Professional flood restoration with industrial equipment"
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
              <WaterDamage size="hero" gradient="water" aria-label="Flood Restoration Services" />
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              IICRC Certified
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Flood Restoration <span className="text-[#00BFA6]">Services</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8 max-w-2xl mx-auto">
              Comprehensive flood restoration across Australia. From flash floods to river inundation, our IICRC-certified teams provide rapid extraction, decontamination, and complete structural restoration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                Request Emergency Service
              </Button>
              <Button variant="outline" className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] px-8 py-3 text-lg bg-transparent">
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
              <div className="text-[#9CA3AF]">Emergency Response</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#2196F3] mb-2">Cat 1-3</div>
              <div className="text-[#9CA3AF]">All Categories</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">8</div>
              <div className="text-[#9CA3AF]">States Covered</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">Rapid</div>
              <div className="text-[#9CA3AF]">Deployment</div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Our Flood Restoration Process
          </h2>
          <div className="max-w-4xl mx-auto space-y-8">
            {processSteps.map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#00BFA6]/20 border border-[#00BFA6]/40 flex items-center justify-center text-[#00BFA6] font-bold text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-white mb-2">{item.title}</h3>
                  <p className="text-[#9CA3AF]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Comprehensive Flood Restoration Solutions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <div key={feature.title} className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]">
                <Droplets className="h-8 w-8 text-[#2196F3] mb-4" />
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
              <AlertTriangle className="h-8 w-8 text-[#F59E0B]" />
              <h2 className="font-poppins font-semibold text-2xl text-white">Flood Water Dangers</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Contaminated with sewage and waste water",
                "Chemical pollutants from industrial and agricultural runoff",
                "Debris including sharp objects and hazardous materials",
                "Electrical hazards from submerged wiring and appliances",
                "Structural instability in flood-affected buildings",
                "Disease risk from waterborne pathogens and bacteria",
              ].map((hazard) => (
                <div key={hazard} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <span className="text-[#9CA3AF]">{hazard}</span>
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
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]">
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">{faq.question}</h3>
                <p className="text-[#9CA3AF]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Services */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Related Water Damage Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { title: "Basement Flooding", href: "/services/water-damage/basement-flooding", desc: "Complete basement water extraction and waterproofing." },
              { title: "Structural Drying", href: "/services/water-damage/structural-drying", desc: "Professional monitored drying programs for all structures." },
              { title: "Commercial Water Damage", href: "/services/water-damage/commercial-water-damage", desc: "Large-scale commercial water damage restoration." },
              { title: "Carpet Water Damage", href: "/services/water-damage/carpet-water-damage", desc: "Carpet extraction, drying, and reinstallation services." },
            ].map((service) => (
              <Link key={service.title} href={service.href}>
                <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer h-full">
                  <WaterDamage size="lg" gradient="water" className="mb-4" aria-hidden="true" />
                  <h3 className="font-poppins font-semibold text-lg text-white mb-2">{service.title}</h3>
                  <p className="text-[#9CA3AF] text-sm mb-4">{service.desc}</p>
                  <span className="text-[#00BFA6] text-sm font-medium inline-flex items-center">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Emergency CTA */}
        <section className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-[#EF4444] to-[#DC2626] rounded-2xl p-12 text-center">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-white mb-4">
              Flood Emergency?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Do not re-enter flood-affected properties without professional clearance. Request emergency service now for immediate deployment.
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
