import { SITE_URL } from "@/lib/seo/site-url"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowRight, AlertTriangle, Shield, Clock, Droplets } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { generateCategoryMetadata } from "@/lib/seo/service-page-seo"
import { schemaGenerator } from "@/lib/seo/schema-generator"

export const metadata = generateCategoryMetadata({
  title: 'Flood Restoration Services Australia | NRPG',
  description: 'Emergency flood restoration across Australia. IICRC S500-certified contractors. 24/7 response. Category 1–3 floodwater, sewage contamination, structural drying, insurance documentation.',
  keywords: ['flood restoration', 'flood damage restoration', 'flood cleanup Australia', 'floodwater damage', 'IICRC S500 flood', 'category 3 water damage', 'flood recovery Australia'],
  slug: 'flood-restoration',
  categoryName: 'Flood Restoration',
})

const faqs = [
  {
    question: 'Is floodwater always Category 3?',
    answer: 'Not always. A burst potable water pipe is classified as Category 1 (clean water) under IICRC S500. However, floodwater from rivers, stormwater drains, and overland flow is almost always Category 3 (black water) because overwhelmed sewage infrastructure mixes with floodwater during major events. This is the most common scenario in Australian flood events — including QLD floods and NSW East Coast Lows. Water category classification is performed on site by the attending contractor and determines all subsequent protocols.',
  },
  {
    question: 'Can carpet and flooring be saved after flooding?',
    answer: 'It depends on the water category. Category 1 events — a burst pipe with fast extraction within 24 hours — may allow carpet to be salvaged with appropriate drying. Category 3 events involve sewage contamination, and porous materials including carpet, underlay, plasterboard, and insulation cannot be safely decontaminated. Disposal is the standard protocol under IICRC S500 for Category 3-affected porous materials. The attending contractor assesses salvageability on site and documents the decision for the insurance scope.',
  },
  {
    question: 'How long does flood restoration take?',
    answer: 'A straightforward Category 1 event in a single room typically takes 3–7 days for extraction and structural drying. Category 3 events requiring full removal of wet areas — carpet, plasterboard, insulation, and cabinetry — typically take 2–6 weeks for the remediation phase alone. Structural rebuild following a Category 3 event is a separate scope and timeline agreed with the insurer. IICRC S500 requires moisture readings every 24 hours, and drying is not declared complete until psychrometric targets are met.',
  },
  {
    question: 'Does homeowners insurance cover flood damage?',
    answer: 'Australian flood coverage is complex. Older policies often excluded flood damage entirely or used narrow definitions. Since 2012, the Insurance Council of Australia introduced a standard flood definition to reduce ambiguity, and most major insurers — NRMA, Suncorp, Allianz, QBE, IAG, and CGU — now offer flood cover as standard or optional. Storm surge (seawater inundation from coastal events) is frequently excluded even where inland flood is covered. Review the Product Disclosure Statement carefully, particularly the flood and storm surge definitions. Disputes over flood definition are one of the most common complaint categories at AFCA.',
  },
  {
    question: 'When is it safe to re-enter a flood-affected property?',
    answer: 'Re-entry requires a structural safety assessment first — floodwater can compromise footings, walls, and flooring integrity without visible signs. Electrical systems must not be energised until inspected and cleared by a licensed electrician. In Category 3 events, local councils in QLD and NSW may issue formal clearance requirements before re-occupancy. Snakes, spiders, and other wildlife displaced by floodwater are a documented hazard in QLD, NSW, and VIC flood zones — property owners should take appropriate precautions during initial re-entry.',
  },
  {
    question: 'What happens to contents after Category 3 flooding?',
    answer: 'Hard, non-porous contents — ceramics, metals, glass, sealed plastics — can often be decontaminated using antimicrobial treatments documented under IICRC S500. Porous contents — soft furnishings, mattresses, clothing, books, and upholstered furniture — are typically disposed of when confirmed Category 3 contaminated, as sewage bacteria cannot be safely removed from porous substrates. All items are inventoried and photographed before disposal to support insurance contents claims. The scope is agreed with the insurer prior to disposal.',
  },
  {
    question: 'What if my insurer disputes the flood claim?',
    answer: 'Flood definition disputes and scope disputes are common after major Australian flood events. Property owners have the right to escalate to the Australian Financial Complaints Authority (AFCA), which provides free external dispute resolution for financial services complaints including insurance. IICRC S500-compliant drying logs, moisture readings, water category classification documentation, and photographic evidence all support scope acceptance and dispute resolution. The NRPG platform facilitates contractor matching and does not control claim outcomes — those are matters between the property owner, their insurer, and the contractor. AFCA can be reached at afca.org.au.',
  },
  {
    question: 'Why does flood damage smell even after extraction?',
    answer: 'Persistent odour after floodwater extraction is caused by multiple factors: sewage bacteria embedded in porous materials, mould growth beginning within 24–48 hours in concealed cavities (wall framing, subfloor, ceiling void), and organic decomposition of plant and soil matter carried by floodwater. Surface extraction alone does not address odour sources inside wall cavities or under flooring. Full odour resolution requires antimicrobial treatment, complete structural drying to S500 psychrometric targets, and HEPA air scrubbing during the remediation phase. Odour that returns after initial treatment typically indicates incomplete drying or concealed mould growth.',
  },
]

export default function FloodRestorationPage() {
  const BASE_URL = SITE_URL

  const emergencyServiceSchema = {
    "@context": "https://schema.org",
    "@type": ["Service", "EmergencyService"],
    "name": "Flood Restoration - NRPG Australia",
    "description": "Emergency flood restoration across Australia. IICRC S500-certified contractors. 24/7 response. Category 1–3 floodwater, sewage contamination, structural drying, insurance documentation.",
    "serviceType": "Flood Restoration",
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
    { name: 'Flood Restoration', url: `${BASE_URL}/services/flood-restoration` },
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
              Emergency Flood Restoration Services Across Australia
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8">
              Floodwater is classified under IICRC S500 water categories — many flood events involve Category 3 (black water) due to sewage contamination, requiring specialist containment and disposal protocols beyond standard water extraction. NRPG connects property owners with vetted IICRC S500-certified contractors across all Australian states.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold px-8 py-3 text-lg">
                  Get Emergency Flood Assessment
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

        {/* How Flood Restoration Works */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              How Flood Restoration Works
            </h2>
            <p className="text-[#9CA3AF] mb-10">
              Flood restoration follows IICRC S500 protocols — water category classification determines the entire remediation approach. Category 3 (black water) events require substantially different protocols to Category 1 (clean water) burst pipe events.
            </p>

            <div className="space-y-8">
              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">
                  Phase 1: Floodwater Classification &amp; Site Safety (First 4 Hours)
                </h3>
                <p className="text-[#9CA3AF]">
                  The first priority is water category identification on site — Category 1, 2, or 3 classification determines every subsequent decision including PPE requirements, which materials can be salvaged, and total remediation cost. Sewage contamination testing confirms Category 3 status where river or stormwater inundation has occurred. A structural safety check is completed before entry to assess flooring integrity, wall stability, and electrical hazards. In significant flood events across QLD, NSW, and VIC, local councils may issue formal clearance requirements before property owners or contractors are permitted to enter flood-affected buildings.
                </p>
              </div>

              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">
                  Phase 2: Extraction, Decontamination &amp; Removal (24–72 Hours)
                </h3>
                <p className="text-[#9CA3AF]">
                  Extraction equipment and protocols are selected by water category. Category 3 events require full PPE compliance — respiratory protection, gloves, and Tyvek suits — for contractor safety during extraction. Porous materials including carpet, underlay, plasterboard, and insulation that have absorbed Category 3 contaminated water cannot be safely decontaminated and are removed and disposed under documented protocols. Antimicrobial treatment is applied to all remaining surfaces. Hard contents are assessed for decontamination or disposal. The full removal scope is documented with photographs for the insurance file before any disposal occurs.
                </p>
              </div>

              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">
                  Phase 3: Structural Drying, Testing &amp; Documentation
                </h3>
                <p className="text-[#9CA3AF]">
                  Structural drying follows IICRC S500 drying protocol using commercial dehumidifiers and air movers sized to the affected area. Psychrometric monitoring — tracking temperature, relative humidity, and dew point — confirms drying conditions are maintained throughout. Moisture readings are taken from structural timbers, concrete, and masonry every 24 hours and recorded in S500 drying logs, which form part of the insurance documentation package. Final clearance testing confirms structural moisture has returned to dry standard values. A completion report with before/after photographs, drying logs, and clearance certification is provided for the insurance file.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What&apos;s Included */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              What&apos;s Included in the Flood Restoration Process
            </h2>
            <p className="text-[#9CA3AF] mb-8">
              A full flood restoration engagement covers every phase from initial emergency response through to clearance certification. Services delivered by matched contractors include:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Emergency floodwater extraction (Category 1, 2, and 3 protocols)',
                'Site safety assessment before property entry',
                'Sewage contamination testing and classification',
                'Category 3-compliant PPE and containment',
                'Removal of saturated porous materials (carpet, plasterboard, insulation)',
                'Structural drying — commercial dehumidifiers and air movers',
                'Antimicrobial treatment for contaminated surfaces',
                'HVAC assessment and decontamination',
                'Contents inventory, salvage assessment, and pack-out',
                'Moisture mapping and thermal imaging for concealed water',
                'IICRC S500 drying logs and clearance certification',
                'Insurance-grade scope of works documentation',
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
              Need Emergency Flood Restoration?
            </h2>
            <p className="text-[#9CA3AF] mb-6">
              Submit a request and an IICRC S500-certified contractor will be matched to your property. Available 24/7 across all Australian states.
            </p>
            <Link href="/contact">
              <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold px-8 py-3 text-lg">
                Get Emergency Flood Assessment
              </Button>
            </Link>
          </div>
        </section>

        {/* Flood Water Categories */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              Flood Water Categories — Why Classification Matters
            </h2>
            <p className="text-[#9CA3AF] mb-8">
              Under IICRC S500, floodwater is classified into three categories based on contamination level. Category determines PPE requirements, which materials can be saved, and total remediation cost.
            </p>

            <div className="space-y-6 mb-8">
              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Droplets className="h-6 w-6 text-[#0d9488]" />
                  <h3 className="font-poppins font-semibold text-lg text-white">Category 1 — Clean Water</h3>
                </div>
                <p className="text-[#9CA3AF] text-sm mb-3">
                  Rainwater through an intact roof, burst potable water pipes, or appliance overflow from clean water sources. Low contamination risk.
                </p>
                <ul className="space-y-1 text-[#9CA3AF] text-sm">
                  <li>• Standard extraction and structural drying protocols apply</li>
                  <li>• Porous materials may be salvageable if extraction begins within 24 hours</li>
                  <li>• No sewage contamination — lower PPE requirements</li>
                  <li>• Most cost-effective remediation pathway</li>
                </ul>
              </div>

              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-[#FFB800]" />
                  <h3 className="font-poppins font-semibold text-lg text-white">Category 2 — Grey Water</h3>
                </div>
                <p className="text-[#9CA3AF] text-sm mb-3">
                  Washing machine discharge, dishwasher overflow, toilet overflow (urine only, no faeces). Moderate contamination requiring antimicrobial treatment.
                </p>
                <ul className="space-y-1 text-[#9CA3AF] text-sm">
                  <li>• Antimicrobial treatment required for all affected surfaces</li>
                  <li>• Porous materials assessed case by case — salvage possible if treated promptly</li>
                  <li>• Elevated PPE requirements compared to Category 1</li>
                  <li>• Category 2 water left standing for more than 72 hours upgrades to Category 3</li>
                </ul>
              </div>

              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-[#EF4444]" />
                  <h3 className="font-poppins font-semibold text-lg text-white">Category 3 — Black Water</h3>
                </div>
                <p className="text-[#9CA3AF] text-sm mb-3">
                  Sewage backup, floodwater from rivers and stormwater drains (which carry sewage from overwhelmed infrastructure), or Category 1/2 water left standing for more than 72 hours. Highest health risk classification.
                </p>
                <ul className="space-y-1 text-[#9CA3AF] text-sm">
                  <li>• Porous materials — carpet, plasterboard, insulation — are typically removed and disposed</li>
                  <li>• Specialist PPE required: respiratory protection, Tyvek suits, and gloves mandatory</li>
                  <li>• Sewage contamination testing confirms classification on site</li>
                  <li>• Substantially higher remediation cost than Category 1 or 2</li>
                  <li>• Full antimicrobial treatment of all remaining structural surfaces</li>
                </ul>
              </div>
            </div>

            <div className="bg-[#050505] border border-[#0d9488]/20 rounded-sm p-6">
              <p className="text-[#9CA3AF] text-sm">
                Floodwater from rivers, stormwater drains, and overland flow is almost always Category 3 due to sewage contamination from overwhelmed infrastructure. This is the most common flood scenario in Australian flood events — including QLD floods, NSW East Coast Lows, and VIC flooding — and requires full Category 3 protocols regardless of the source water&apos;s appearance.
              </p>
            </div>
          </div>
        </section>

        {/* IICRC S500 Certification */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              IICRC S500 Certification for Flood Damage
            </h2>
            <p className="text-[#9CA3AF] mb-6">
              The IICRC S500 Standard for Professional Water Damage Restoration is the methodology all certified flood restoration contractors follow. S500 covers water extraction, drying science, psychrometric monitoring, water category classification, and documentation protocols. WRT (Water Damage Restoration Technician) is the corresponding technician certification.
            </p>
            <p className="text-[#9CA3AF] mb-6">
              Category 3 certification matters specifically for insurance claims because Category 3 events — sewage contamination, full material removal, specialist disposal — generate significantly higher remediation costs than Category 1 events. Insurers including NRMA, Suncorp, Allianz, QBE, IAG, and CGU require properly documented Category 3 classification with S500 drying logs to accept Category 3 scope costs. Without certified documentation, scope disputes are common.
            </p>
            <p className="text-[#9CA3AF] mb-6">
              Each contractor matched through the platform holds IICRC S500/WRT certification independently and maintains their own professional indemnity insurance and contractor&apos;s licence.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Shield, title: 'IICRC S500 Certified', desc: 'All matched contractors hold current IICRC S500/WRT certification independently' },
                { icon: CheckCircle, title: 'IICRC S500 Standard', desc: 'Work performed to the published IICRC S500 methodology with documented drying logs' },
                { icon: Clock, title: 'AFCA Compliant', desc: 'S500 documentation supports AFCA-regulated insurance dispute processes for flood claims' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-[#050505] border border-white/[0.06] rounded-sm p-6 text-center">
                  <Icon className="h-8 w-8 text-[#0d9488] mx-auto mb-3" />
                  <div className="font-semibold text-white mb-2">{title}</div>
                  <div className="text-[#9CA3AF] text-sm">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Australian Insurance Claims Process */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              Australian Insurance Claims Process for Flood Damage
            </h2>
            <p className="text-[#9CA3AF] mb-6">
              Flood damage claims in Australia are governed by the Insurance Contracts Act 1984 and the General Insurance Code of Practice. Since 2012, the Insurance Council of Australia has maintained a standard flood definition across major insurers — but policy variations and flood exclusion clauses remain common, particularly for storm surge and overland flow events.
            </p>

            <div className="space-y-4 mb-8">
              {[
                {
                  step: '01',
                  title: 'Notify Your Insurer',
                  desc: 'Contact your insurer as soon as it is safe to access the property. Most policies require notification within a defined period — check the Product Disclosure Statement for exact timeframes. During declared catastrophe events, the Insurance Council of Australia activates an industry catastrophe response, which may affect assessor availability and claim timelines.',
                },
                {
                  step: '02',
                  title: 'Insurer Appoints Assessor',
                  desc: 'The insurer appoints a loss adjuster or building assessor to inspect the property and prepare a scope of works. Property owners may engage their own IICRC S500-certified contractor to provide an independent scope — particularly valuable for Category 3 events where full material removal substantially increases the remediation cost.',
                },
                {
                  step: '03',
                  title: 'Scope Agreement',
                  desc: 'The insurer reviews submitted scopes and issues an agreed scope of works. Category 3 classification disputes are common — documented sewage contamination testing and S500 water category classification performed by the attending contractor supports the scope. Flood definition disputes (whether the event is classified as "flood" or "stormwater" under the policy) are also a frequent point of disagreement.',
                },
                {
                  step: '04',
                  title: 'Restoration Commences',
                  desc: 'Once the scope is approved, matched contractors begin work. S500 drying logs, moisture readings, and photographic documentation are maintained throughout and provided to the insurer on completion.',
                },
                {
                  step: '05',
                  title: 'Disputes via AFCA',
                  desc: 'If the insurer disputes the scope, the flood classification, or denies the claim on policy exclusion grounds, property owners have the right to escalate to the Australian Financial Complaints Authority (AFCA). Flood definition and storm surge exclusion disputes are among the most common complaint categories at AFCA following major Australian flood events.',
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
                The platform facilitates contractor matching and does not act as an insurance claim advocate or control claim outcomes. For independent claims assistance, property owners may engage a public loss assessor. For insurer disputes — including flood definition and storm surge exclusion disputes — AFCA provides free external resolution services at{' '}
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

        {/* Related Services */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-2xl text-white mb-6">
              Related Services
            </h2>
            <p className="text-[#9CA3AF] text-sm">
              Flood events often require additional specialist services beyond water extraction and structural drying. Properties with secondary mould growth should review{' '}
              <Link href="/services/mould-remediation" className="text-[#0d9488] underline underline-offset-4">
                mould remediation
              </Link>
              . Storm-damaged roof and building envelope affecting water ingress is covered under{' '}
              <Link href="/services/storm-damage-restoration" className="text-[#0d9488] underline underline-offset-4">
                storm damage restoration
              </Link>
              . For general water damage from internal sources — burst pipes, appliance overflow — see{' '}
              <Link href="/services/water-damage" className="text-[#0d9488] underline underline-offset-4">
                water damage restoration
              </Link>{' '}
              or{' '}
              <Link href="/services/water-damage-restoration" className="text-[#0d9488] underline underline-offset-4">
                water damage restoration services
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-[#0d9488]/20 to-[#050505] border border-[#0d9488]/30 rounded-sm p-12 text-center">
              <h2 className="font-poppins font-bold text-3xl text-white mb-4">
                Ready to Start Flood Restoration?
              </h2>
              <p className="text-xl text-[#9CA3AF] mb-8">
                Submit a request to be matched with an IICRC S500-certified contractor in your area. 24/7 availability across all Australian states and territories.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold px-8 py-3 text-lg">
                    Get Emergency Flood Assessment
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
