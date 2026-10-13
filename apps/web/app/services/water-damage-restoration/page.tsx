import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowRight, AlertTriangle, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { generateCategoryMetadata } from "@/lib/seo/service-page-seo"
import { schemaGenerator } from "@/lib/seo/schema-generator"

export const metadata = generateCategoryMetadata({
  title: 'Water Damage Restoration Services Australia | NRPG',
  description: 'Professional water damage restoration across Australia. IICRC S500-certified contractors. 24/7 emergency response. Category 1–3 water damage, structural drying, mould prevention.',
  keywords: ['water damage restoration', 'water damage repair', 'flood damage restoration', 'water extraction Australia', 'IICRC S500 water damage', 'structural drying'],
  slug: 'water-damage-restoration',
  categoryName: 'Water Damage Restoration',
})

const faqs = [
  {
    question: 'How soon should restoration begin after water damage?',
    answer: 'Restoration should begin within 24–48 hours of water damage occurring. This is the critical window before mould colonisation becomes established — mould spores can begin germinating on wet porous materials within 24 hours under humid conditions. Delay beyond 48 hours significantly increases remediation costs, as saturated materials degrade, secondary mould damage requires separate S520-standard treatment, and insurance documentation of the initial loss becomes harder to establish. Rapid IICRC S500-certified response reduces total claim cost and prevents avoidable health risks.',
  },
  {
    question: 'What is Category 3 (black water) and why does it matter?',
    answer: 'Category 3 water — referred to as black water — includes sewage overflow, external floodwater, and Category 1 or 2 water that has been left standing for long enough to deteriorate without treatment. Black water carries bacteria, viruses, and chemical contaminants at levels that make decontamination of porous materials impractical. Under IICRC S500 protocols, porous materials that have contacted Category 3 water — carpet, underlay, gyprock, insulation, and soft furnishings — are typically removed and disposed of rather than cleaned and dried in place. This classification directly determines the scope of works submitted to insurers and the PPE requirements for on-site contractors.',
  },
  {
    question: 'Does homeowners insurance cover water damage restoration?',
    answer: 'Most standard Australian home and contents policies cover sudden and accidental water damage — burst pipes, appliance failures, and storm-driven water entry. Gradual damage such as slow leaks, rising damp, or deterioration over time is typically excluded. Policy conditions vary significantly between insurers including NRMA, Suncorp, Allianz, QBE, IAG, and CGU. Review the Product Disclosure Statement for your specific policy, paying particular attention to the definitions of "sudden", "accidental", and "flood" — the last term has a specific meaning under the Insurance Contracts Act 1984 that may differ from common usage. IICRC S500-certified documentation from contractors supports claim acceptance.',
  },
  {
    question: 'How long does structural drying take?',
    answer: 'Structural drying typically takes 3–7 days for standard residential water damage where water has not penetrated wall cavities or subfloor structures. Larger properties, concealed cavity damage, or events involving Category 2 or 3 water require longer drying periods — sometimes 10–14 days or more. Drying progress is measured using moisture meters and psychrometric monitoring every 24 hours, and all readings are recorded in a drying log. The drying log is an insurance-critical document that demonstrates the scope of drying activity and the point at which materials reached acceptable moisture content benchmarks.',
  },
  {
    question: 'Can mould grow after water damage is "dry"?',
    answer: 'Yes. Visible surface dryness does not indicate that structural materials have reached acceptable moisture content. Gyprock, timber framing, and subfloor materials can retain moisture well above mould-growth thresholds even when surface touch suggests dryness. Mould colonisation can establish within 24–72 hours in untreated wet areas. IICRC S500 protocols require antimicrobial treatment of affected surfaces before and during drying, combined with final moisture clearance testing to confirm materials have reached target moisture content. Skipping antimicrobial treatment on the basis of apparent surface dryness is a common cause of post-restoration mould callbacks.',
  },
  {
    question: 'What equipment is used for structural drying?',
    answer: 'Structural drying uses a combination of low-grain refrigerant (LGR) dehumidifiers, high-velocity air movers, and — in cooler Australian climates such as Tasmania and alpine Victoria — desiccant dehumidifiers, which are more effective at lower temperatures. Thermal imaging cameras identify moisture within wall cavities and subfloor voids that are not visible to the naked eye. Moisture meters and thermo-hygrometers track psychrometric conditions throughout the drying period. Equipment placement and air movement patterns are calculated based on the affected area, material types, and ambient conditions — this is a technical process documented in the drying log.',
  },
  {
    question: 'What if my insurer disputes the scope of works?',
    answer: 'If an insurer disputes a scope of works submitted by an IICRC S500-certified contractor, property owners have the right to escalate to the Australian Financial Complaints Authority (AFCA). AFCA is the external dispute resolution body for Australian financial services complaints and provides a free service to consumers. IICRC S500-compliant drying logs, moisture readings, and scope documentation materially support dispute resolution by demonstrating that the scope was determined by measurable, standardised criteria rather than contractor opinion. The platform facilitates contractor matching and does not act as a claim advocate or control claim outcomes — those matters are between the property owner, the contractor, and the insurer. See afca.org.au for dispute lodgement information.',
  },
  {
    question: 'How do I know when drying is complete?',
    answer: 'Drying is considered complete when structural materials reach target moisture content benchmarks specified in IICRC S500 — typically measured against pre-loss moisture content of comparable unaffected materials in the same property, or against material-specific reference ranges. Moisture meter readings are taken at multiple points across the affected area and recorded in the drying log. When all readings fall within the target range, IICRC S500-certified contractors produce a drying verification certificate. This certificate is submitted with the final scope of works as part of the insurance claim file and confirms that drying has been completed to a published industry standard.',
  },
]

export default function WaterDamageRestorationPage() {
  const BASE_URL = 'https://disasterrecovery.com.au'

  const emergencyServiceSchema = {
    "@context": "https://schema.org",
    "@type": ["Service", "EmergencyService"],
    "name": "Water Damage Restoration - NRPG Australia",
    "description": "Professional water damage restoration across Australia. IICRC S500-certified contractors. 24/7 emergency response. Category 1–3 water damage, structural drying, mould prevention.",
    "serviceType": "Water Damage Restoration",
    "areaServed": {
      "@type": "Country",
      "name": "Australia",
    },
    "provider": {
      "@type": "Organization",
      "name": "NRPG - National Restoration Platform",
      "url": BASE_URL,
    },
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": `${BASE_URL}/contact`,
      "availabilityStarts": "00:00",
      "availabilityEnds": "23:59",
    },
  }

  const breadcrumbSchema = schemaGenerator.generateBreadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Services', url: `${BASE_URL}/services` },
    { name: 'Water Damage Restoration', url: `${BASE_URL}/services/water-damage-restoration` },
  ])

  const faqSchema = schemaGenerator.generateFAQSchema(faqs)

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <Header />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(emergencyServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="py-24">

        {/* Hero Section */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-[#0d9488]/10 border border-[#0d9488]/30 rounded-sm text-[#0d9488] text-sm font-medium mb-6">
              IICRC S500 Certified Contractors
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Professional Water Damage Restoration Services Across Australia
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8">
              Water damage requires rapid IICRC S500-certified response to extract water, dry structures, and prevent mould colonisation within the critical 24–48 hour window. NRPG connects property owners with vetted contractors across all Australian states and territories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold px-8 py-3 text-lg">
                  Get Urgent Water Damage Assessment
                </Button>
              </Link>
              <Link href="/services/insurance-claim-advocate">
                <Button variant="outline" className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] px-8 py-3 text-lg bg-transparent">
                  Learn about the insurance claims process
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="container mx-auto px-6 mb-16">
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-sm p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#0d9488] mb-2">24/7</div>
              <div className="text-[#9CA3AF]">Emergency Response</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-sm p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#0d9488] mb-2">100%</div>
              <div className="text-[#9CA3AF]">IICRC S500 Certified</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-sm p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#0d9488] mb-2">8</div>
              <div className="text-[#9CA3AF]">States &amp; Territories</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-sm p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#0d9488] mb-2">S500</div>
              <div className="text-[#9CA3AF]">IICRC Standard</div>
            </div>
          </div>
        </section>

        {/* How Water Damage Restoration Works */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              How Water Damage Restoration Works
            </h2>
            <p className="text-[#9CA3AF] mb-10">
              Water damage restoration follows a structured protocol aligned to the IICRC S500 Standard. Each phase is documented for insurance purposes.
            </p>

            <div className="space-y-8">
              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">
                  Immediate Response &amp; Water Extraction (0–4 Hours)
                </h3>
                <p className="text-[#9CA3AF]">
                  IICRC S500 emergency extraction begins with identifying the water category — Category 1 (clean water from burst pipes or appliance overflow), Category 2 (grey water with moderate contamination), or Category 3 (black water from sewage or external flooding). Truck-mounted extractors remove standing water rapidly from all affected areas. Initial moisture mapping using moisture meters and thermal imaging establishes the extent of water migration through floor assemblies, wall cavities, and subfloor voids. This documentation forms the baseline for the insurance scope of works.
                </p>
              </div>

              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">
                  Structural Drying &amp; Monitoring (24–72 Hours)
                </h3>
                <p className="text-[#9CA3AF]">
                  Following extraction, LGR dehumidifiers and high-velocity air movers are positioned to create controlled air movement across wet structural materials. Psychrometric conditions — temperature, relative humidity, and specific humidity — are monitored and recorded every 24 hours. Moisture readings are taken at consistent mapped points throughout the affected area to track drying progress against target benchmarks. The resulting drying log is an insurance-critical document demonstrating that drying was performed to IICRC S500 methodology, not approximated. Equipment is adjusted daily based on readings to maintain optimal drying conditions.
                </p>
              </div>

              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">
                  Mould Prevention &amp; Damage Documentation
                </h3>
                <p className="text-[#9CA3AF]">
                  Antimicrobial treatment is applied to all affected porous surfaces during and after the drying phase to inhibit mould colonisation within the critical 24–72 hour window. Final moisture clearance testing confirms all materials have reached target moisture content benchmarks. IICRC S500-certified contractors then produce a drying verification certificate — a formal record that the drying process was completed to the published standard. This certificate, combined with photographic documentation and the drying log, forms the complete documentation package submitted to the insurer as part of the restoration claim.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              What&apos;s Included in Water Damage Restoration
            </h2>
            <p className="text-[#9CA3AF] mb-8">
              A full water damage restoration engagement covers every phase from emergency extraction through to final moisture clearance certification. Services delivered by matched contractors include:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Emergency water extraction (Category 1, 2, and 3)',
                'Truck-mounted and portable extraction equipment',
                'Structural drying — dehumidifiers and high-velocity air movers',
                'Psychrometric monitoring and drying logs',
                'Thermal imaging to locate hidden moisture',
                'Antimicrobial treatment to prevent mould growth',
                'Carpet and subfloor extraction and drying or disposal',
                'Wall cavity drying and inspection',
                'Contents pack-out and inventory',
                'Final moisture clearance testing and certification',
                'IICRC S500-compliant documentation for insurance',
                'AFCA-process compliant scope of works',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 bg-[#050505] border border-white/[0.06] rounded-sm p-4">
                  <CheckCircle className="h-5 w-5 text-[#0d9488] mt-0.5 shrink-0" />
                  <span className="text-[#9CA3AF] text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Mid-Page */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto bg-[#050505] border border-[#0d9488]/30 rounded-sm p-10 text-center">
            <h2 className="font-poppins font-bold text-2xl text-white mb-3">
              Need Emergency Water Damage Response?
            </h2>
            <p className="text-[#9CA3AF] mb-6">
              Submit a request and an IICRC S500-certified contractor will be matched to your property. Available 24/7 across all Australian states and territories.
            </p>
            <Link href="/contact">
              <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold px-8 py-3 text-lg">
                Get Urgent Water Damage Assessment
              </Button>
            </Link>
          </div>
        </section>

        {/* Water Damage Categories */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              Water Damage Categories — What They Mean for Restoration
            </h2>
            <p className="text-[#9CA3AF] mb-8">
              IICRC S500 classifies water damage into three categories based on contamination level. This classification determines the scope of works, material disposal requirements, PPE standards for on-site contractors, and how the insurance claim is structured.
            </p>

            <div className="space-y-6">
              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-[#0d9488]" />
                  <h3 className="font-poppins font-semibold text-lg text-white">Category 1: Clean Water</h3>
                </div>
                <p className="text-[#9CA3AF] text-sm">
                  Originates from a sanitary source — burst water supply pipes, appliance supply line failures, or overflow from cisterns and tanks. Category 1 water poses the lowest contamination risk at the point of loss. Direct extraction is possible without the decontamination requirements of higher categories. However, Category 1 water can degrade to Category 2 if left standing for long enough to deteriorate or if it contacts contaminated materials during migration. Common in residential properties following pipe failures, dishwasher or washing machine supply line ruptures, and roof penetrations from rainfall.
                </p>
              </div>

              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-[#f59e0b]" />
                  <h3 className="font-poppins font-semibold text-lg text-white">Category 2: Grey Water</h3>
                </div>
                <p className="text-[#9CA3AF] text-sm">
                  Contains moderate contamination from biological, chemical, or physical sources — washing machine discharge, dishwasher overflow, toilet overflow involving urine only (no faecal matter), and aquarium leaks. Category 2 water poses a health risk if contacted or ingested and requires antimicrobial treatment of affected surfaces before and during drying. Porous materials with significant Category 2 saturation may require disposal depending on the extent of absorption and the elapsed time since the loss event. Drying protocols and documentation requirements are more stringent than Category 1.
                </p>
              </div>

              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-[#EF4444]" />
                  <h3 className="font-poppins font-semibold text-lg text-white">Category 3: Black Water</h3>
                </div>
                <p className="text-[#9CA3AF] text-sm">
                  Grossly contaminated water — sewage backflow, external floodwater containing surface runoff, rising river water, and Category 1 or 2 water left standing for long enough to deteriorate without treatment. Black water carries bacteria, viruses, fungi, and potentially toxic chemical contaminants. Porous materials that have contacted Category 3 water — including carpet, underlay, gyprock, insulation, and soft furnishings — are typically removed and disposed of rather than dried in place, as decontamination to safe standards is not achievable. Category 3 events generate the highest scope of works and the most detailed insurance documentation requirements.
                </p>
              </div>
            </div>

            <p className="text-[#9CA3AF] text-sm mt-6 bg-[#050505] border border-white/[0.06] rounded-sm p-4">
              Category classification is established during initial assessment by IICRC S500-certified contractors and directly determines scope, PPE requirements, and insurance documentation standards. For properties with suspected sewage involvement, see the{' '}
              <Link href="/services/burst-pipe-repair" className="text-[#0d9488] underline underline-offset-4">
                burst pipe repair
              </Link>{' '}
              page. For properties affected by external flooding, see{' '}
              <Link href="/services/flood-restoration" className="text-[#0d9488] underline underline-offset-4">
                flood damage restoration
              </Link>
              .
            </p>
          </div>
        </section>

        {/* IICRC S500 Certification */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              IICRC S500 Certification: What It Means for Your Claim
            </h2>
            <p className="text-[#9CA3AF] mb-6">
              IICRC S500 is the Standard and Reference Guide for Professional Water Damage Restoration — the published methodology that defines how water damage assessment, extraction, drying, and documentation must be performed. The Water Damage Restoration Technician (WRT) certification verifies that a contractor has completed structured training in water behaviour, psychrometrics, drying science, and insurance documentation to S500 methodology. It is distinct from other IICRC certifications: S500 covers water damage, S520 covers mould remediation, and FSRT covers fire and smoke restoration — each is a separate credential addressing a separate loss type.
            </p>
            <p className="text-[#9CA3AF] mb-6">
              Insurers including NRMA, Suncorp, Allianz, QBE, IAG, and CGU increasingly require IICRC S500-compliant documentation as a condition of approving restoration scopes. A drying log, moisture mapping records, and a drying verification certificate produced by a certified contractor carry significantly more weight with loss adjusters than an undocumented restoration report. Using a non-certified contractor can result in scope disputes, claim delays, and callbacks for mould growth that developed due to incomplete drying.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Shield, title: 'IICRC S500 Certified', desc: 'All matched contractors hold current IICRC S500 (WRT) certification independently' },
                { icon: CheckCircle, title: 'IICRC S500 Standard', desc: 'Work performed to the published IICRC S500 methodology for water damage restoration' },
                { icon: Clock, title: 'AFCA Compliant', desc: 'Documentation supports AFCA-regulated insurance dispute processes' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-[#050505] border border-white/[0.06] rounded-sm p-6 text-center">
                  <Icon className="h-8 w-8 text-[#0d9488] mx-auto mb-3" />
                  <div className="font-semibold text-white mb-2">{title}</div>
                  <div className="text-[#9CA3AF] text-sm">{desc}</div>
                </div>
              ))}
            </div>
            <p className="text-[#9CA3AF] text-sm mt-6">
              Learn more about contractor certification requirements on the{' '}
              <Link href="/certifications" className="text-[#0d9488] underline underline-offset-4">
                certifications page
              </Link>
              . For background on the platform and matching process, visit the{' '}
              <Link href="/about" className="text-[#0d9488] underline underline-offset-4">
                about page
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Australian Insurance Claims Process */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              The Australian Insurance Claims Process
            </h2>
            <p className="text-[#9CA3AF] mb-6">
              Water damage claims in Australia are governed by the Insurance Contracts Act 1984 and the General Insurance Code of Practice. The covered peril can make a material difference to claim acceptance — a burst internal pipe is typically covered under most standard policies, whereas external floodwater entry may be subject to specific flood definitions and optional flood cover. Review the Product Disclosure Statement carefully before lodging.
            </p>

            <div className="space-y-4 mb-8">
              {[
                {
                  step: '01',
                  title: 'Notify Your Insurer',
                  desc: 'Contact your insurer to lodge a water damage claim as soon as the source is controlled and the property is safe to access. Most policies require notification within a defined period — late notification can affect claim acceptance. Document the source of water damage photographically before extraction commences where safe to do so.',
                },
                {
                  step: '02',
                  title: 'Assessor Appointed',
                  desc: "The insurer appoints a loss adjuster or building assessor to inspect the property. Property owners can simultaneously engage an IICRC S500-certified contractor to prepare an independent scope of works — particularly useful where the initial loss adjuster's scope does not fully account for cavity moisture or secondary damage. Parallel scoping is common in complex water damage events.",
                },
                {
                  step: '03',
                  title: 'Scope Agreement',
                  desc: 'The insurer reviews submitted scopes and issues an agreed scope of works. For water damage events, the category classification (1, 2, or 3) and moisture mapping evidence are central to scope negotiations. IICRC S500-compliant drying logs and thermal imaging records provide objective, measurable evidence supporting scope items that might otherwise be disputed.',
                },
                {
                  step: '04',
                  title: 'Restoration Commences',
                  desc: 'Once the scope is approved, matched contractors begin extraction, drying, and remediation under the agreed scope. Progress documentation — daily moisture readings, psychrometric logs, and photographic records — is produced throughout and forms part of the final claim file.',
                },
                {
                  step: '05',
                  title: 'Disputes via AFCA',
                  desc: 'If the insurer disputes the scope, the category classification, or the claim itself, property owners have the right to escalate to the Australian Financial Complaints Authority (AFCA). AFCA provides free external dispute resolution for financial services complaints, including insurance. IICRC S500 documentation materially supports the property owner\'s position in scope disputes. Note that the platform facilitates matching only and cannot influence claim outcomes.',
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-6 bg-[#050505] border border-white/[0.06] rounded-sm p-6">
                  <div className="text-2xl font-bold text-[#0d9488] shrink-0 w-10">{step}</div>
                  <div>
                    <div className="font-semibold text-white mb-1">{title}</div>
                    <p className="text-[#9CA3AF] text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#050505] border border-[#0d9488]/20 rounded-sm p-6">
              <p className="text-[#9CA3AF] text-sm">
                The platform facilitates contractor matching and does not act as an insurance claim advocate or control claim outcomes. For independent claims assistance, property owners may engage a public loss assessor. For insurer disputes, AFCA provides free external resolution services at{' '}
                <a href="https://afca.org.au" target="_blank" rel="noopener noreferrer" className="text-[#0d9488] underline underline-offset-4">afca.org.au</a>.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map(({ question, answer }) => (
                <div key={question} className="bg-[#050505] border border-white/[0.06] rounded-sm p-6">
                  <h3 className="font-poppins font-semibold text-lg text-white mb-3">{question}</h3>
                  <p className="text-[#9CA3AF]">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-2xl text-white mb-6">
              Related Services
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Water Damage Services', href: '/services/water-damage' },
                { label: 'Flood Damage Restoration', href: '/services/flood-restoration' },
                { label: 'Structural Drying', href: '/services/structural-drying' },
                { label: 'Mould Remediation', href: '/services/mould-remediation' },
                { label: 'Burst Pipe Repair', href: '/services/burst-pipe-repair' },
                { label: 'Get in Touch', href: '/contact' },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 bg-[#050505] border border-white/[0.06] rounded-sm p-4 text-[#9CA3AF] hover:text-[#0d9488] hover:border-[#0d9488]/30 transition-colors text-sm"
                >
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#0d9488]" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-[#0d9488]/20 to-[#050505] border border-[#0d9488]/30 rounded-sm p-12 text-center">
              <h2 className="font-poppins font-bold text-3xl text-white mb-4">
                Ready to Start Water Damage Restoration?
              </h2>
              <p className="text-xl text-[#9CA3AF] mb-8">
                Submit a request to be matched with an IICRC S500-certified contractor in your area. 24/7 availability across all Australian states and territories.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold px-8 py-3 text-lg">
                    Get Urgent Water Damage Assessment
                  </Button>
                </Link>
                <Link href="/services/insurance-claim-advocate">
                  <Button variant="outline" className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] px-8 py-3 text-lg bg-transparent">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Learn About the Insurance Claims Process
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
