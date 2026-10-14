import { SITE_URL } from "@/lib/seo/site-url"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowRight, AlertTriangle, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { generateCategoryMetadata } from "@/lib/seo/service-page-seo"
import { schemaGenerator } from "@/lib/seo/schema-generator"

export const metadata = generateCategoryMetadata({
  title: 'Fire Damage Restoration Services Australia | NRPG',
  description: 'Professional fire damage restoration & smoke cleanup across Australia. IICRC-certified contractors. 24/7 emergency response. Forensic results, zero compromise.',
  keywords: ['fire damage restoration', 'fire restoration services', 'smoke damage cleanup', 'fire restoration Australia', 'IICRC certified fire restoration'],
  slug: 'fire-damage-restoration',
  categoryName: 'Fire Damage Restoration',
})

const faqs = [
  {
    question: 'How long does fire restoration take?',
    answer: 'Timeline depends on damage severity. Minor smoke damage may resolve in 3–7 days. Moderate structural damage typically takes 2–6 weeks. Major fires requiring full reconstruction can span 3–12 months. IICRC FSRT-certified assessors provide a written scope and estimated timeline during the initial assessment.',
  },
  {
    question: 'Does homeowners insurance cover fire restoration?',
    answer: 'Most standard Australian home and contents policies cover fire damage restoration costs, including debris removal, structural repairs, smoke odour removal, and temporary accommodation. Policy conditions vary between insurers including NRMA, Suncorp, Allianz, QBE, IAG, and CGU. Review your Product Disclosure Statement or speak with your insurer directly.',
  },
  {
    question: 'What causes smoke odour and how do you remove it?',
    answer: 'Smoke odour is caused by microscopic particles and volatile compounds that penetrate porous surfaces — timber, plaster, carpet, and soft furnishings. Certified contractors using IICRC FSRT protocols remove odour through a combination of HEPA vacuuming, hydroxyl generation, ozone treatment, thermal fogging, and encapsulation of sealed surfaces. Surface cleaning alone rarely eliminates deep-set smoke odour.',
  },
  {
    question: 'Can I DIY fire cleanup?',
    answer: 'DIY fire cleanup is not recommended and can be hazardous. Fire-damaged properties may contain carcinogenic soot, asbestos (in older homes), structural instability, compromised electrical wiring, and toxic chemical residues. Under NSW and VIC fire codes, structural work following fire events must be assessed by qualified professionals. IICRC FSRT-certified contractors have the equipment, training, and insurance required for safe remediation.',
  },
  {
    question: 'How soon should I start restoration after a fire?',
    answer: 'Restoration should begin as soon as emergency services clear the property for access — ideally within 24–48 hours. Delay allows smoke residue to permanently stain surfaces, acidic byproducts to corrode metals and etch glass, and moisture from firefighting water to promote secondary mould growth. Early assessment also preserves evidence for insurance claims.',
  },
  {
    question: "What's the difference between IICRC and non-certified contractors?",
    answer: 'IICRC FSRT (Fire & Smoke Restoration Technician) certification verifies a contractor has completed structured training in fire chemistry, smoke behaviour, odour removal, and restoration documentation to IICRC S200 Standard. Non-certified contractors lack standardised protocols and may use incorrect cleaning agents that set stains, miss hidden damage, or produce reports insufficient for insurance claim purposes. Each contractor on the platform holds their own IICRC certification independently.',
  },
  {
    question: 'Do you work directly with insurers?',
    answer: 'The platform facilitates matching property owners with vetted, IICRC-certified contractors. Those contractors are experienced in producing insurance-grade documentation, scope reports, and photographic evidence compatible with major Australian insurers including NRMA, Suncorp, Allianz, QBE, IAG, and CGU. The platform does not control claim outcomes or act as a claim advocate — that is a matter between you, your insurer, and your contractor.',
  },
  {
    question: 'What if my property has hidden fire or smoke damage?',
    answer: 'Hidden damage is common after fires. Smoke travels through wall cavities, roof spaces, and HVAC ducting, depositing residue far from the burn origin. Certified assessors use thermal imaging, air quality testing, and visual inspection of concealed spaces to identify hidden damage. Under AFCA complaint guidelines, insurers are required to assess the full scope of damage — not just visible surface loss.',
  },
]

export default function FireDamageRestorationPage() {
  const BASE_URL = SITE_URL

  const emergencyServiceSchema = {
    "@context": "https://schema.org",
    "@type": ["Service", "EmergencyService"],
    "name": "Fire Damage Restoration - NRPG Australia",
    "description": "Professional fire damage restoration & smoke cleanup across Australia. IICRC-certified contractors. 24/7 emergency response.",
    "serviceType": "Fire Damage Restoration",
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
    { name: 'Fire Damage Restoration', url: `${BASE_URL}/services/fire-damage-restoration` },
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
              Professional Fire Damage Restoration &amp; Smoke Cleanup Across Australia
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8">
              Structural fire damage and smoke odour removal require certified expertise — not generalised builders. Access vetted IICRC FSRT-certified contractors with 24/7 emergency response across all Australian states.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold px-8 py-3 text-lg">
                  Get Free Fire Damage Assessment
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

        {/* How Fire Damage Restoration Works */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              How Fire Damage Restoration Works
            </h2>
            <p className="text-[#9CA3AF] mb-10">
              Fire restoration follows a structured process aligned to the IICRC S200 Standard. Each phase is documented for insurance purposes, and work is performed by contractors holding IICRC FSRT certification independently.
            </p>

            <div className="space-y-8">
              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">
                  Immediate Assessment (First 4 Hours)
                </h3>
                <p className="text-[#9CA3AF]">
                  Once emergency services clear the property, a certified assessor conducts a fire restoration assessment to document structural damage, smoke penetration, and water ingress from firefighting operations. This initial report forms the foundation of the insurance claim scope. Photographs, moisture readings, and air quality samples are collected to establish a pre-restoration baseline. Properties that have sustained structural fire damage are secured with emergency board-up, tarping, or temporary fencing to prevent further deterioration and unauthorised access.
                </p>
              </div>

              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">
                  Containment &amp; Decontamination (24–72 Hours)
                </h3>
                <p className="text-[#9CA3AF]">
                  Soot and smoke residue are acidic and corrosive — within 24–72 hours they permanently etch glass, discolour grout, corrode metal fixtures, and penetrate timber grain. Containment zones are established to prevent cross-contamination of unaffected areas. IICRC FSRT-certified technicians then begin decontamination: HEPA vacuuming of loose particulates, dry chemical sponging of soot from walls and ceilings, and cleaning of HVAC systems to prevent smoke odour recirculation. Charred structural materials are removed and catalogued for insurance documentation. Firefighting water — a common secondary hazard — is extracted using the same protocols as a standard water damage event to prevent mould formation.
                </p>
              </div>

              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">
                  Restoration &amp; Rebuild Coordination
                </h3>
                <p className="text-[#9CA3AF]">
                  Following decontamination, the scope of structural repair is confirmed with the insurer. Certified contractors coordinate all required trades — structural carpentry, electrical, plumbing, plastering, and painting — under a single scope of works. Final air quality testing and odour clearance testing confirm the property meets habitable standards before reinstatement. A full completion report with before/after documentation is produced for the insurance file.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              What&apos;s Included in the Fire Restoration Process
            </h2>
            <p className="text-[#9CA3AF] mb-8">
              A full fire restoration engagement covers every phase from initial emergency response through to habitation clearance. Services delivered by matched contractors include:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Emergency board-up, tarping, and site security',
                'Structural fire damage assessment and documentation',
                'Soot and smoke residue removal from all surfaces',
                'Smoke odour removal — ozone, hydroxyl, and thermal fogging',
                'HVAC decontamination and duct cleaning',
                'Firefighting water extraction and structural drying',
                'Contents cleaning and pack-out coordination',
                'Asbestos testing coordination (pre-1990 properties)',
                'Structural repairs and full rebuild coordination',
                'Final air quality clearance testing',
                'Insurance-grade scope reports and photographic documentation',
                'Liaison support for AFCA-regulated complaint processes',
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
              Need a Fire Damage Assessment?
            </h2>
            <p className="text-[#9CA3AF] mb-6">
              Submit a request and an IICRC FSRT-certified contractor will be matched to your property. Available 24/7 across all Australian states.
            </p>
            <Link href="/contact">
              <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold px-8 py-3 text-lg">
                Get Free Fire Damage Assessment
              </Button>
            </Link>
          </div>
        </section>

        {/* Fire Damage vs Smoke Damage */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              Fire Damage vs. Smoke Damage: Key Differences
            </h2>
            <p className="text-[#9CA3AF] mb-8">
              Fire and smoke damage are distinct in their behaviour, spread, and remediation requirements — yet both are covered under standard IICRC FSRT protocols.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-[#EF4444]" />
                  <h3 className="font-poppins font-semibold text-lg text-white">Structural Fire Damage</h3>
                </div>
                <ul className="space-y-2 text-[#9CA3AF] text-sm">
                  <li>• Direct heat causes char, carbonisation, and material failure</li>
                  <li>• Confined to burn path — does not travel through cavities</li>
                  <li>• Requires structural assessment and engineering sign-off</li>
                  <li>• Debris removal follows hazardous material protocols</li>
                  <li>• Covered under building sum insured</li>
                </ul>
              </div>
              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-[#0d9488]" />
                  <h3 className="font-poppins font-semibold text-lg text-white">Smoke Damage</h3>
                </div>
                <ul className="space-y-2 text-[#9CA3AF] text-sm">
                  <li>• Travels through air currents — affects rooms distant from burn</li>
                  <li>• Deposits acidic residue on all surfaces including undamaged areas</li>
                  <li>• Smoke odour removal requires specialist equipment and treatment</li>
                  <li>• HVAC systems become contaminated and require full decontamination</li>
                  <li>• Often covered separately as contents or smoke damage loss</li>
                </ul>
              </div>
            </div>
            <p className="text-[#9CA3AF] text-sm mt-6">
              For properties where smoke has spread beyond the fire area, see the dedicated{' '}
              <Link href="/services/smoke-damage-cleanup" className="text-[#0d9488] underline underline-offset-4">
                smoke damage cleanup
              </Link>{' '}
              service page. Properties with secondary water ingress from firefighting should also review{' '}
              <Link href="/services/water-damage" className="text-[#0d9488] underline underline-offset-4">
                water damage restoration
              </Link>{' '}
              to understand combined claim scoping.
            </p>
          </div>
        </section>

        {/* IICRC FSRT Certification */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              IICRC FSRT Certification: What It Means for Your Claim
            </h2>
            <p className="text-[#9CA3AF] mb-6">
              IICRC FSRT — Fire &amp; Smoke Restoration Technician — is the internationally recognised certification standard for fire and smoke restoration work. It is distinct from other IICRC certifications: FSRT covers fire chemistry, smoke behaviour, odour removal chemistry, and documentation protocols. S520 is the mould remediation standard and has no overlap.
            </p>
            <p className="text-[#9CA3AF] mb-6">
              The IICRC S200 Standard for Professional Fire &amp; Smoke Damage Restoration sets the methodology all certified contractors follow. Insurers including NRMA, Suncorp, Allianz, QBE, IAG, and CGU increasingly require IICRC FSRT certification as a condition of approving scopes of works submitted by restoration contractors.
            </p>
            <p className="text-[#9CA3AF] mb-6">
              Using a non-certified contractor risks claim disputes, scope rejections, and callbacks for incomplete remediation. Each contractor matched through the platform holds IICRC FSRT certification independently and maintains their own professional indemnity insurance.
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
              Fire damage claims in Australia are governed by the Insurance Contracts Act 1984 and the General Insurance Code of Practice. The process follows a broadly consistent structure across NRMA, Suncorp, Allianz, QBE, IAG, and CGU.
            </p>

            <div className="space-y-4 mb-8">
              {[
                {
                  step: '01',
                  title: 'Notify Your Insurer',
                  desc: 'Contact your insurer to lodge a fire damage claim as soon as the property is safe to access. Most insurers require notification within a defined period — check your Product Disclosure Statement for exact timeframes.',
                },
                {
                  step: '02',
                  title: 'Insurer Appoints Assessor',
                  desc: 'The insurer will appoint a loss adjuster or building assessor to inspect the property and prepare a scope of works. Property owners can engage their own IICRC FSRT-certified contractor to provide an independent scope — this is often advisable for complex structural fire damage.',
                },
                {
                  step: '03',
                  title: 'Scope Agreement',
                  desc: 'The insurer reviews submitted scopes and issues an agreed scope of works. This stage can involve negotiation, particularly where hidden smoke damage or secondary water damage is present. Detailed documentation from IICRC FSRT assessors supports scope acceptance.',
                },
                {
                  step: '04',
                  title: 'Restoration Commences',
                  desc: 'Once the scope is approved, matched contractors begin work under the agreed scope. Progress reports and photographic documentation are provided throughout.',
                },
                {
                  step: '05',
                  title: 'Disputes via AFCA',
                  desc: "If the insurer disputes the scope or claim, property owners have the right to escalate to the Australian Financial Complaints Authority (AFCA). AFCA is the external dispute resolution body for Australian financial services complaints. Claims involving the NSW Strata Management Act or VIC Fire Code may have additional regulatory considerations.",
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
                Ready to Start Fire Damage Restoration?
              </h2>
              <p className="text-xl text-[#9CA3AF] mb-8">
                Submit a request to be matched with an IICRC FSRT-certified contractor in your area. 24/7 availability across all Australian states and territories.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold px-8 py-3 text-lg">
                    Get Free Fire Damage Assessment
                  </Button>
                </Link>
                <Link href="/services/insurance-claim-advocate">
                  <Button variant="outline" className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] px-8 py-3 text-lg bg-transparent">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Insurance claims process
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
