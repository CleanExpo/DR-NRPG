import { SITE_URL } from "@/lib/seo/site-url"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowRight, AlertTriangle, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { generateCategoryMetadata } from "@/lib/seo/service-page-seo"
import { schemaGenerator } from "@/lib/seo/schema-generator"

export const metadata = generateCategoryMetadata({
  title: 'Sewage Cleanup Services Australia | NRPG',
  description: 'Professional sewage cleanup across Australia. IICRC S500 Category 3-certified contractors. 24/7 emergency response. Sewage backup, blocked drains, contamination removal.',
  keywords: ['sewage cleanup', 'sewage backup cleanup', 'sewage damage restoration', 'blocked drain cleanup', 'Category 3 water damage', 'IICRC sewage cleanup', 'sewage contamination removal Australia'],
  slug: 'sewage-cleanup',
  categoryName: 'Sewage Cleanup',
})

const faqs = [
  {
    question: 'Is sewage backup covered by home insurance?',
    answer: 'Sudden and accidental sewage backup is typically covered under most Australian home and contents policies. Gradual backup from a known, neglected issue may be excluded. Where a council sewer main caused the backup, council liability may apply — contact the relevant council and your insurer separately. Review your Product Disclosure Statement with major insurers including NRMA, Suncorp, Allianz, QBE, IAG, and CGU for exact conditions.',
  },
  {
    question: 'Can sewage be cleaned up without a professional contractor?',
    answer: 'Not recommended for anything beyond a very minor toilet overflow. Full Category 3 PPE — respirator, chemical-resistant suit, and gloves — is required. EPA disposal regulations apply to solid biohazard waste. Spreading contaminated material through an uncontained property is a common outcome of unqualified attempts. Insurance claims for sewage events typically require IICRC S500-documented remediation to be accepted.',
  },
  {
    question: 'What materials get removed after a sewage backup?',
    answer: 'All porous materials that have contacted sewage must be removed: carpet, underlay, gyprock (to at least 300mm above the waterline), insulation, and any timber that has absorbed contaminated water. Hard surfaces — tiles, sealed concrete — can typically be decontaminated in place. Furniture and contents are assessed case by case depending on material and extent of exposure.',
  },
  {
    question: 'How long does sewage cleanup take?',
    answer: 'A minor bathroom overflow typically resolves in 2–5 days of remediation. Major sewage backup affecting multiple rooms or a subfloor can take 1–3 weeks for full Category 3 remediation. Rebuild of removed gyprock, flooring, and cabinetry is a separate timeline determined by the scope of works agreed with the insurer.',
  },
  {
    question: 'What are the health risks of sewage exposure?',
    answer: 'Sewage classified as IICRC Category 3 (black water) contains pathogenic organisms including E. coli, Hepatitis A virus, norovirus, Salmonella, and Cryptosporidium. Symptoms of exposure include gastroenteritis, hepatitis, and skin infections. At-risk groups — elderly persons, immunocompromised individuals, and children — should not enter affected areas under any circumstances until clearance testing confirms decontamination is complete.',
  },
  {
    question: 'Does sewage odour go away without treatment?',
    answer: 'No. Odour-causing bacteria remain active in affected materials and surfaces. Masking agents such as bleach or commercial deodorisers do not address the pathogenic source and can create the false impression of successful decontamination. Professional treatment using hydroxyl generation or ozone treatment eliminates odour compounds at the molecular level, and is paired with complete antimicrobial decontamination.',
  },
  {
    question: 'What if the sewage came from the council drain?',
    answer: 'Councils may carry liability where their infrastructure — a blocked or collapsed council sewer main — caused the backup. Document the property condition thoroughly before any cleanup begins. Notify both the council and your insurer, as liability may be shared or disputed. If liability is contested between parties, the Australian Financial Complaints Authority (AFCA) can assist at afca.org.au.',
  },
  {
    question: 'How can sewage backup be prevented?',
    answer: 'CCTV drain inspection every 5–10 years identifies tree root ingress and pipe deterioration before a backup occurs — particularly important in older Australian suburbs with large street trees and earthenware pipe infrastructure. Avoid flushing wipes, sanitary items, or cooking fat. Commercial kitchens should maintain grease traps. Rural properties on septic systems should have annual tank inspections and monitor drainfield condition.',
  },
]

export default function SewageCleanupPage() {
  const BASE_URL = SITE_URL

  const emergencyServiceSchema = {
    "@context": "https://schema.org",
    "@type": ["Service", "EmergencyService"],
    "name": "Sewage Cleanup - NRPG Australia",
    "description": "Professional sewage cleanup across Australia. IICRC S500 Category 3-certified contractors. 24/7 emergency response. Sewage backup, blocked drains, contamination removal.",
    "serviceType": "Sewage Cleanup",
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
    { name: 'Sewage Cleanup', url: `${BASE_URL}/services/sewage-cleanup` },
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
              IICRC S500 Category 3 Certified
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Professional Sewage Cleanup &amp; Contamination Removal Across Australia
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8">
              Sewage backup and contamination is classified as IICRC Category 3 (black water) — the highest hazard classification. It contains pathogenic bacteria, viruses, and parasites requiring full PPE, containment, and specialist decontamination protocols. NRPG connects property owners with vetted IICRC S500-certified contractors across all Australian states.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold px-8 py-3 text-lg">
                  Get Emergency Sewage Cleanup Assessment
                </Button>
              </Link>
              <Link href="/services/biohazard-cleanup">
                <Button variant="outline" className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] px-8 py-3 text-lg bg-transparent">
                  Learn about biohazard cleanup
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
              <div className="text-[#9CA3AF]">IICRC Certified</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-sm p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#0d9488] mb-2">Cat 3</div>
              <div className="text-[#9CA3AF]">Specialist</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-sm p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#0d9488] mb-2">S500</div>
              <div className="text-[#9CA3AF]">IICRC Standard</div>
            </div>
          </div>
        </section>

        {/* How Sewage Cleanup Works */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              How Sewage Cleanup Works
            </h2>
            <p className="text-[#9CA3AF] mb-10">
              Sewage events require immediate Category 3 containment — spread of contaminated material must be halted before extraction begins.
            </p>

            <div className="space-y-8">
              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">
                  Phase 1: Containment &amp; Site Assessment (First 2 Hours)
                </h3>
                <p className="text-[#9CA3AF]">
                  The sewage source must be stopped before remediation can begin — a licenced plumber is typically required to clear the blockage or repair the damaged line. Containment barriers are established to prevent contaminated material tracking into unaffected areas of the property. Technicians don full Category 3 PPE before entering the affected zone. The extent of contamination is mapped, a structural safety check is completed, and electrical isolation is carried out where sewage has reached switchboard proximity.
                </p>
              </div>

              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">
                  Phase 2: Extraction &amp; Material Removal (24–48 Hours)
                </h3>
                <p className="text-[#9CA3AF]">
                  Sewage water is extracted using specialist wet extraction equipment rated for Category 3 material. All porous materials that have contacted sewage are removed — carpet, underlay, gyprock to at least 300mm above the waterline, insulation, and affected timber. Solid waste is double-bagged and disposed of in accordance with EPA guidelines for biohazard waste in the relevant state. Material removal is documented photographically for the insurance scope of works.
                </p>
              </div>

              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">
                  Phase 3: Decontamination &amp; Drying
                </h3>
                <p className="text-[#9CA3AF]">
                  All remaining hard surfaces — tiles, concrete slabs, timber framing that was not removed — are treated with EPA-registered biocides applied at label-specified concentrations. HEPA air scrubbers run continuously during decontamination to capture airborne pathogens. Structural drying follows the S500 protocol using commercial dehumidifiers and air movers until moisture readings confirm structural materials have returned to acceptable levels. Odour treatment using hydroxyl generation or ozone is applied, and final pathogen clearance testing confirms the property is safe for reinstatement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Checklist */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              What&apos;s Included in a Sewage Cleanup Engagement
            </h2>
            <p className="text-[#9CA3AF] mb-8">
              A full Category 3 sewage remediation engagement covers every phase from source containment through to pathogen clearance. Services delivered by matched contractors include:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Sewage source containment coordination',
                'Category 3 PPE and containment zone establishment',
                'Sewage water extraction using specialist equipment',
                'Removal of all porous materials contacting sewage',
                'EPA-compliant solid waste disposal',
                'Hard surface decontamination with registered biocides',
                'HEPA air scrubbing during decontamination',
                'Structural drying — dehumidifiers and air movers',
                'Odour elimination — hydroxyl or ozone treatment',
                'HVAC system assessment (sewage in ducts is common)',
                'Pathogen clearance testing post-treatment',
                'IICRC S500 Category 3 documentation for insurance',
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
              Sewage Backup? Get Emergency Response
            </h2>
            <p className="text-[#9CA3AF] mb-6">
              Submit a request and an IICRC S500 Category 3-certified contractor will be matched to your property. Available 24/7 across all Australian states.
            </p>
            <Link href="/contact">
              <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold px-8 py-3 text-lg">
                Get Emergency Sewage Cleanup Assessment
              </Button>
            </Link>
          </div>
        </section>

        {/* Common Causes */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              Common Causes of Sewage Backup in Australian Properties
            </h2>

            <div className="space-y-6">
              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-[#EF4444] shrink-0" />
                  <h3 className="font-poppins font-semibold text-xl text-white">
                    Blocked or Collapsed Sewer Lines
                  </h3>
                </div>
                <p className="text-[#9CA3AF]">
                  Tree root ingress is the most common cause in older Australian suburbs where large street trees — fig, camphor laurel, liquidambar — have roots that seek moisture in earthenware pipe joints. Grease buildup from kitchen discharge, collapsed earthenware pipes (common in pre-1980 properties), and blockages in the council sewer main connecting to the property all produce the same outcome: sewage flowing back through floor wastes and toilets.
                </p>
              </div>

              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-[#EF4444] shrink-0" />
                  <h3 className="font-poppins font-semibold text-xl text-white">
                    Stormwater &amp; Sewer System Overwhelm
                  </h3>
                </div>
                <p className="text-[#9CA3AF]">
                  During major rain events, combined stormwater and sewer systems can reach capacity and overflow into connected properties. QLD and NSW flood events commonly trigger sewage backup as a secondary event. Where the source is identified as council infrastructure overwhelm, council liability may apply — affected property owners should notify their local council and insurer independently.
                </p>
              </div>

              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-[#EF4444] shrink-0" />
                  <h3 className="font-poppins font-semibold text-xl text-white">
                    Septic System Failure
                  </h3>
                </div>
                <p className="text-[#9CA3AF]">
                  Rural and peri-urban properties across regional NSW, QLD, SA, and WA commonly rely on septic systems. Failed septic tanks, saturated drainfields following extended wet periods, and tanks that have exceeded their pumping interval produce Category 3 contamination at the surface or through plumbing fixtures. Septic events are common following prolonged La Ni&ntilde;a weather cycles.
                </p>
              </div>

              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-[#EF4444] shrink-0" />
                  <h3 className="font-poppins font-semibold text-xl text-white">
                    Internal Plumbing Failures
                  </h3>
                </div>
                <p className="text-[#9CA3AF]">
                  Blocked toilets, cracked internal drain lines, and discharge backup from washing machines or dishwashers represent internal plumbing failures that produce Category 3 contamination without any council or external infrastructure involvement. These events are typically covered under home insurance as sudden and accidental damage.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why IICRC S500 Category 3 Matters */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              Why IICRC S500 Category 3 Certification Matters
            </h2>
            <p className="text-[#9CA3AF] mb-6">
              Category 3 is the highest hazard classification under IICRC S500. It carries legal obligations that do not apply to Category 1 or 2 water events. Solid biohazard waste must be disposed of per state EPA guidelines — contractors without Category 3 certification may not understand the disposal chain, creating liability for the property owner.
            </p>
            <p className="text-[#9CA3AF] mb-6">
              Using an unqualified contractor for a sewage event creates direct liability risks: cross-contamination from inadequate containment, incomplete material removal leaving pathogens in the structure, and the production of documentation insufficient for insurers. Major Australian insurers including NRMA, Suncorp, Allianz, QBE, IAG, and CGU are increasingly requiring IICRC S500 Category 3 documentation as a condition of claim acceptance for sewage events.
            </p>
            <p className="text-[#9CA3AF] mb-6">
              Each contractor matched through the platform holds IICRC S500 certification independently and maintains their own professional indemnity insurance and trade licences.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Shield, title: 'IICRC S500 Certified', desc: 'All matched contractors hold current IICRC S500 certification for Category 3 water events' },
                { icon: CheckCircle, title: 'Category 3 Protocols', desc: 'Full biohazard handling, EPA-compliant disposal, and pathogen clearance testing' },
                { icon: Clock, title: 'AFCA Compliant', desc: 'Documentation supports AFCA-regulated insurance dispute processes at afca.org.au' },
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

        {/* Insurance Claims Process */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              Australian Insurance Claims Process for Sewage Events
            </h2>
            <p className="text-[#9CA3AF] mb-6">
              Sudden sewage backup events — including from blocked or collapsed sewer lines — are typically covered under standard Australian home and contents policies. Gradual leaks arising from known maintenance issues that were not addressed are commonly excluded. Where the council sewer caused the event, the property owner should contact both their insurer and the council separately, as liability may be shared.
            </p>

            <div className="space-y-4 mb-8">
              {[
                {
                  step: '01',
                  title: 'Notify Your Insurer',
                  desc: 'Contact your insurer to lodge a sewage damage claim as soon as the property is safe. Do not begin cleanup before the insurer has noted the claim — some policies require prior authorisation for remediation work above a threshold amount.',
                },
                {
                  step: '02',
                  title: 'Document Before Cleanup',
                  desc: 'Photograph and video the affected areas thoroughly before any extraction or removal begins. This documentation is the primary evidence base for the insurance scope of works and cannot be recreated once cleanup commences.',
                },
                {
                  step: '03',
                  title: 'Insurer Appoints Assessor',
                  desc: 'The insurer will appoint a loss adjuster or building assessor. Property owners may engage an IICRC S500-certified contractor to provide an independent scope — particularly important for events affecting subfloor, wall cavities, or HVAC systems.',
                },
                {
                  step: '04',
                  title: 'Scope Agreement & Remediation',
                  desc: 'Once the scope of works is agreed, matched contractors commence remediation under Category 3 protocols. Progress reports and photographic documentation are provided throughout for the insurance file.',
                },
                {
                  step: '05',
                  title: 'Disputes via AFCA',
                  desc: 'If the insurer disputes coverage or the scope of works, property owners have the right to escalate to the Australian Financial Complaints Authority (AFCA). AFCA provides free external dispute resolution for all Australian financial services complaints.',
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
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { href: '/services/water-damage', label: 'Water Damage Restoration' },
                { href: '/services/biohazard-cleanup', label: 'Biohazard Cleanup' },
                { href: '/services/flood-restoration', label: 'Flood Restoration' },
                { href: '/services/mould-remediation', label: 'Mould Remediation' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 bg-[#050505] border border-white/[0.06] rounded-sm p-4 text-[#9CA3AF] hover:text-[#0d9488] hover:border-[#0d9488]/30 transition-colors"
                >
                  <ArrowRight className="h-4 w-4 text-[#0d9488] shrink-0" />
                  <span className="text-sm">{label}</span>
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
                Ready to Start Sewage Cleanup?
              </h2>
              <p className="text-xl text-[#9CA3AF] mb-8">
                Submit a request to be matched with an IICRC S500 Category 3-certified contractor. 24/7 availability across all Australian states and territories.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold px-8 py-3 text-lg">
                    Get Emergency Sewage Cleanup Assessment
                  </Button>
                </Link>
                <Link href="/services/biohazard-cleanup">
                  <Button variant="outline" className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] px-8 py-3 text-lg bg-transparent">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Biohazard cleanup services
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
