import { SITE_URL } from "@/lib/seo/site-url"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowRight, AlertTriangle, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { generateCategoryMetadata } from "@/lib/seo/service-page-seo"
import { schemaGenerator } from "@/lib/seo/schema-generator"

export const metadata = generateCategoryMetadata({
  title: 'Smoke Damage Restoration Services Australia | NRPG',
  description: 'Professional smoke damage restoration & odour removal across Australia. IICRC FSRT-certified contractors. 24/7 emergency response. Soot removal, hydroxyl treatment, HVAC decontamination.',
  keywords: ['smoke damage restoration', 'smoke damage cleanup', 'smoke odour removal', 'soot removal', 'smoke damage repair Australia', 'IICRC FSRT smoke'],
  slug: 'smoke-damage-restoration',
  categoryName: 'Smoke Damage Restoration',
})

const faqs = [
  {
    question: 'Can smoke damage spread beyond the fire area?',
    answer: 'Yes — this is one of the most underestimated aspects of smoke damage. Smoke travels through wall cavities, roof spaces, HVAC ducting, and gaps around pipes, depositing acidic residue on surfaces far from the burn origin. A kitchen fire can result in smoke penetration throughout an entire storey. IICRC FSRT-certified assessors use air quality sampling and thermal imaging to map smoke spread beyond the visible burn area.',
  },
  {
    question: 'Why does smoke odour persist even after cleaning?',
    answer: 'Smoke odour is caused by microscopic volatile organic compounds (VOCs) and particulate matter that penetrate deep into porous materials — timber framing, plasterboard, carpet fibres, soft furnishings, and insulation. Surface cleaning removes visible soot but does not address deep-set odour. Certified contractors using IICRC FSRT protocols apply a combination of HEPA vacuuming, hydroxyl generation, ozone treatment, thermal fogging, and encapsulation of sealed surfaces to eliminate embedded odour compounds.',
  },
  {
    question: 'Does homeowners insurance cover smoke damage restoration?',
    answer: 'Most standard Australian home and contents policies cover smoke damage resulting from a fire event, including properties not directly in the burn area (e.g., neighbouring structure fires causing smoke penetration). Coverage conditions vary between NRMA, Suncorp, Allianz, QBE, IAG, and CGU. Review your Product Disclosure Statement for smoke damage definitions and exclusions, particularly around gradual smoke damage versus sudden event damage. IICRC FSRT-standard documentation supports scope acceptance by insurers.',
  },
  {
    question: "What's the difference between soot cleaning and smoke odour removal?",
    answer: 'Soot removal addresses the visible particulate residue deposited on surfaces — walls, ceilings, windows, and contents. Smoke odour removal targets the volatile compounds that have penetrated porous materials and cannot be seen. Both are required for a complete IICRC FSRT-standard restoration. Soot is addressed first (HEPA vacuuming, dry chemical sponges, wet cleaning agents appropriate to surface type), followed by odour treatment through hydroxyl generation, ozone, thermal fogging, or encapsulation depending on penetration depth.',
  },
  {
    question: 'Is it safe to remain in a smoke-damaged property?',
    answer: 'Smoke-damaged properties should not be occupied during active restoration. Smoke residue contains carcinogenic compounds, heavy metals, and fine particulates that pose respiratory and health risks, particularly for children, elderly occupants, and those with respiratory conditions. Short-term occupancy for minor, isolated smoke events may be acceptable where HEPA air filtration is deployed, but assessors provide occupancy clearance guidance based on air quality testing results. Properties with substantial smoke penetration require negative pressure containment during remediation.',
  },
  {
    question: 'How long does smoke damage restoration take?',
    answer: 'Restoration timeline depends on penetration depth and affected area. Minor smoke events (isolated room, superficial soot) typically resolve in 2–5 days. Moderate smoke spread through multiple rooms requires 1–2 weeks. Severe penetration into wall cavities, roof spaces, and HVAC systems requiring structural access can extend to 3–6 weeks. Contents restoration (pack-out, cleaning, return) adds time separately. Assessors provide a written scope and timeline estimate after initial air quality testing.',
  },
  {
    question: 'What is hydroxyl generation and how does it remove smoke odour?',
    answer: 'Hydroxyl generators produce hydroxyl radicals (OH) through UV light interacting with water vapour — the same chemical process that occurs naturally in the atmosphere. Hydroxyl radicals break down volatile organic compounds in smoke odour through oxidation, effectively neutralising odour molecules in air and on surfaces. Unlike ozone, hydroxyl treatment is safe for use while occupants are briefly present and does not require full evacuation. It is particularly effective for large-volume spaces and contents restoration.',
  },
  {
    question: 'What happens if smoke has penetrated my HVAC system?',
    answer: 'HVAC systems become vectors for smoke odour recirculation if not decontaminated. Smoke particles deposit throughout ductwork, on coils, and in filter housings. Running the system post-fire spreads contamination to previously unaffected areas. IICRC FSRT protocols include HVAC assessment, duct cleaning using negative pressure vacuuming, coil cleaning, and filter replacement. If smoke contamination is severe, duct replacement may be required and is documented for insurance purposes.',
  },
]

export default function SmokeDamageRestorationPage() {
  const BASE_URL = SITE_URL

  const emergencyServiceSchema = {
    "@context": "https://schema.org",
    "@type": ["Service", "EmergencyService"],
    "name": "Smoke Damage Restoration - NRPG Australia",
    "description": "Professional smoke damage restoration & odour removal across Australia. IICRC FSRT-certified contractors. 24/7 emergency response.",
    "serviceType": "Smoke Damage Restoration",
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
    { name: 'Smoke Damage Restoration', url: `${BASE_URL}/services/smoke-damage-restoration` },
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
              IICRC FSRT Certified Contractors
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Professional Smoke Damage Restoration &amp; Odour Removal Across Australia
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8">
              Smoke travels beyond the visible burn area — penetrating wall cavities, HVAC systems, and porous materials across an entire property. Access vetted IICRC FSRT-certified contractors with 24/7 emergency response across all Australian states and territories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold px-8 py-3 text-lg">
                  Get Free Smoke Damage Assessment
                </Button>
              </Link>
              <Link href="/services/fire-smoke-damage">
                <Button variant="outline" className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] px-8 py-3 text-lg bg-transparent">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Fire &amp; Smoke Damage Overview
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
              <div className="text-[#9CA3AF]">IICRC FSRT Certified</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-sm p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#0d9488] mb-2">8</div>
              <div className="text-[#9CA3AF]">States &amp; Territories</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-sm p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#0d9488] mb-2">S200</div>
              <div className="text-[#9CA3AF]">IICRC Standard</div>
            </div>
          </div>
        </section>

        {/* How Smoke Damage Restoration Works */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              How Smoke Damage Restoration Works
            </h2>
            <p className="text-[#9CA3AF] mb-10">
              Smoke restoration follows the IICRC S200 Standard methodology. Assessment identifies penetration depth and spread; remediation sequences soot removal before odour treatment; documentation supports insurance claims throughout.
            </p>

            <div className="space-y-8">
              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">
                  Smoke Mapping &amp; Air Quality Assessment (First 4 Hours)
                </h3>
                <p className="text-[#9CA3AF]">
                  IICRC FSRT-certified assessors conduct a systematic inspection of all areas accessible to smoke travel — including roof cavities, wall voids, HVAC ductwork, and adjacent rooms. Air quality sampling establishes particulate concentrations and odour compound levels. Thermal imaging identifies areas where smoke has penetrated behind wall linings and into insulation batts. This baseline determines the full remediation scope and is documented for insurance claim submission. Properties where smoke has spread beyond the fire area are particularly important to assess comprehensively — insurers require documentation of secondary smoke damage separate from primary fire damage.
                </p>
              </div>

              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">
                  Soot Removal &amp; Surface Decontamination (24–72 Hours)
                </h3>
                <p className="text-[#9CA3AF]">
                  Soot is removed before odour treatment — loose particulates must be captured before wet cleaning to avoid smearing. IICRC FSRT-certified technicians apply dry chemical sponges to dry soot, HEPA vacuum all surfaces, and then follow with appropriate wet cleaning agents calibrated to surface type (alkaline cleaners for oily soot, dry-cleaning compounds for protein soot from cooking fires). HVAC filters are replaced and ductwork is assessed for contamination. Charred porous materials (affected plasterboard, insulation, carpet) are removed where smoke penetration is confirmed and full-depth cleaning is impractical.
                </p>
              </div>

              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">
                  Odour Elimination &amp; Clearance Verification
                </h3>
                <p className="text-[#9CA3AF]">
                  Following surface decontamination, odour treatment addresses volatile compounds embedded in porous materials. Hydroxyl generation breaks down VOCs through oxidation without requiring full evacuation. Ozone treatment is deployed in unoccupied spaces for severe penetration. Thermal fogging introduces deodorising agents in vapour form to replicate smoke&apos;s penetration path, reaching concealed spaces. Final air quality testing confirms clearance to habitable standards. A completion report with before/after air quality data, treatment log, and photographic documentation is produced for the insurance file.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              What&apos;s Included in Smoke Damage Restoration
            </h2>
            <p className="text-[#9CA3AF] mb-8">
              A complete smoke damage engagement covers initial assessment through to air quality clearance certification. Services delivered by matched contractors include:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Smoke mapping and air quality assessment',
                'Thermal imaging for concealed smoke penetration',
                'HEPA vacuuming of soot from all surfaces',
                'Dry chemical sponge and wet surface cleaning',
                'Odour elimination — hydroxyl, ozone, and thermal fogging',
                'HVAC duct cleaning and decontamination',
                'Wall cavity and roof space smoke assessment',
                'Removal of smoke-saturated porous materials',
                'Contents pack-out, cleaning, and odour treatment',
                'Encapsulation of residual odour where required',
                'IICRC FSRT-compliant documentation for insurance',
                'Final air quality clearance certificate',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 bg-[#050505] border border-white/[0.06] rounded-sm p-4">
                  <CheckCircle className="h-5 w-5 text-[#0d9488] mt-0.5 shrink-0" />
                  <span className="text-[#9CA3AF] text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto bg-[#050505] border border-[#0d9488]/30 rounded-sm p-10 text-center">
            <h2 className="font-poppins font-bold text-2xl text-white mb-3">
              Need a Smoke Damage Assessment?
            </h2>
            <p className="text-[#9CA3AF] mb-6">
              Submit a request and an IICRC FSRT-certified contractor will be matched to your property. Available 24/7 across all Australian states.
            </p>
            <Link href="/contact">
              <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold px-8 py-3 text-lg">
                Get Free Smoke Damage Assessment
              </Button>
            </Link>
          </div>
        </section>

        {/* Smoke Damage Types */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              Types of Smoke Damage &amp; Residue
            </h2>
            <p className="text-[#9CA3AF] mb-8">
              Not all smoke damage is the same. IICRC FSRT protocols distinguish residue types because each requires different cleaning chemistry and equipment.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-[#EF4444]" />
                  <h3 className="font-poppins font-semibold text-lg text-white">Dry Smoke Residue</h3>
                </div>
                <p className="text-[#9CA3AF] text-sm mb-3">Produced by fast-burning, high-temperature fires (paper, wood). Fine, powdery texture. Easily disturbed and spread if not HEPA vacuumed before wet cleaning. Responds well to dry chemical sponges followed by alkaline cleaning agents.</p>
              </div>
              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-[#F97316]" />
                  <h3 className="font-poppins font-semibold text-lg text-white">Wet (Oily) Smoke Residue</h3>
                </div>
                <p className="text-[#9CA3AF] text-sm mb-3">Produced by slow-burning, low-temperature fires (synthetic materials, plastics, rubber). Sticky, smears on contact, strong odour. Significantly harder to clean — requires specialist solvents. Common in house fires involving furniture and electronics.</p>
              </div>
              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-[#0d9488]" />
                  <h3 className="font-poppins font-semibold text-lg text-white">Protein Smoke Residue</h3>
                </div>
                <p className="text-[#9CA3AF] text-sm mb-3">Produced by cooking fires. Almost invisible — a thin, varnish-like film that discolours painted surfaces and grout. Intensely pungent odour. Requires enzymatic cleaning agents. Commonly missed in visual inspection, identified through odour mapping.</p>
              </div>
              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-[#0d9488]" />
                  <h3 className="font-poppins font-semibold text-lg text-white">Fuel Oil Soot</h3>
                </div>
                <p className="text-[#9CA3AF] text-sm mb-3">Produced by furnace puffs or fuel combustion incidents. Heavy, black oily residue that stains quickly and permanently if not addressed rapidly. Requires specialist dry-cleaning compounds before wet cleaning. Can affect an entire property through HVAC distribution within minutes.</p>
              </div>
            </div>
            <p className="text-[#9CA3AF] text-sm mt-6">
              Residue type identification is performed during initial assessment. Applying incorrect cleaning chemistry to smoke residue can permanently set stains and increase restoration costs — this is one of the primary risks of DIY smoke cleanup.
            </p>
          </div>
        </section>

        {/* IICRC FSRT Certification */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              IICRC FSRT Certification: What It Means for Smoke Damage Claims
            </h2>
            <p className="text-[#9CA3AF] mb-6">
              IICRC FSRT — Fire &amp; Smoke Restoration Technician — is the internationally recognised certification standard for smoke and fire damage restoration. FSRT is distinct from the S520 mould remediation standard and covers smoke chemistry, residue classification, odour treatment technology, and documentation requirements specific to smoke damage events.
            </p>
            <p className="text-[#9CA3AF] mb-6">
              The IICRC S200 Standard for Professional Fire &amp; Smoke Damage Restoration sets the methodology for smoke assessment, residue type identification, cleaning chemistry selection, and odour elimination protocols. Insurers including NRMA, Suncorp, Allianz, QBE, IAG, and CGU increasingly reference IICRC FSRT certification when evaluating scope of works submitted by restoration contractors.
            </p>
            <p className="text-[#9CA3AF] mb-6">
              Smoke damage documentation must evidence: smoke mapping extent, residue type classification, cleaning methodology, treatment log for odour elimination, and final air quality clearance results. Each contractor matched through the platform holds IICRC FSRT certification independently and maintains their own professional indemnity insurance.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Shield, title: 'IICRC FSRT Certified', desc: 'All matched contractors hold current IICRC FSRT certification' },
                { icon: CheckCircle, title: 'IICRC S200 Standard', desc: 'Work performed to the published IICRC S200 methodology' },
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
              . For properties with concurrent structural fire damage, see the{' '}
              <Link href="/services/fire-damage-restoration" className="text-[#0d9488] underline underline-offset-4">
                fire damage restoration
              </Link>
              {' '}service page.
            </p>
          </div>
        </section>

        {/* Australian Insurance Claims Process */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              The Australian Insurance Claims Process for Smoke Damage
            </h2>
            <p className="text-[#9CA3AF] mb-6">
              Smoke damage claims in Australia are typically covered under standard home and contents policies as a consequence of a fire event. The General Insurance Code of Practice and Insurance Contracts Act 1984 govern insurer obligations.
            </p>

            <div className="space-y-4 mb-8">
              {[
                {
                  step: '01',
                  title: 'Notify Your Insurer',
                  desc: 'Contact your insurer to lodge the claim as soon as the property is safe. Smoke damage — particularly secondary smoke from neighbouring fires — must be lodged as a separate event or as part of the primary fire claim. Check your Product Disclosure Statement for smoke damage definitions and time limits.',
                },
                {
                  step: '02',
                  title: 'Insurer Appoints Assessor',
                  desc: 'The insurer will appoint a loss adjuster to inspect and scope the smoke damage. Property owners can engage an IICRC FSRT-certified contractor to prepare an independent scope — this is advisable where smoke has spread beyond the visible burn area, as insurer-appointed assessors may underestimate secondary smoke penetration.',
                },
                {
                  step: '03',
                  title: 'Scope Agreement',
                  desc: 'The insurer reviews the scope of works. Smoke damage scopes are frequently disputed where spread has been extensive — detailed air quality data, thermal imaging reports, and residue type documentation from IICRC FSRT assessors strengthen scope acceptance. Secondary smoke from neighbouring fires can be particularly complex to scope.',
                },
                {
                  step: '04',
                  title: 'Restoration Commences',
                  desc: 'Once the scope is approved, matched contractors begin work. Progress is documented with treatment logs, air quality readings at key stages, and photographic evidence throughout.',
                },
                {
                  step: '05',
                  title: 'Disputes via AFCA',
                  desc: "If the insurer disputes the smoke damage scope or claim decision, property owners have the right to escalate to the Australian Financial Complaints Authority (AFCA). AFCA is the external dispute resolution body for Australian financial services complaints and is free to use. The platform does not act as a claim advocate or control claim outcomes.",
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

        {/* Final CTA */}
        <section className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-[#0d9488]/20 to-[#050505] border border-[#0d9488]/30 rounded-sm p-12 text-center">
              <h2 className="font-poppins font-bold text-3xl text-white mb-4">
                Ready to Start Smoke Damage Restoration?
              </h2>
              <p className="text-xl text-[#9CA3AF] mb-8">
                Submit a request to be matched with an IICRC FSRT-certified contractor in your area. 24/7 availability across all Australian states and territories.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold px-8 py-3 text-lg">
                    Get Free Smoke Damage Assessment
                  </Button>
                </Link>
                <Link href="/services/fire-smoke-damage">
                  <Button variant="outline" className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] px-8 py-3 text-lg bg-transparent">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Fire &amp; Smoke Damage Overview
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
