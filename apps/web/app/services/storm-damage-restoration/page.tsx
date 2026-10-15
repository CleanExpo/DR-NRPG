import { SITE_URL } from "@/lib/seo/site-url"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, ArrowRight, AlertTriangle, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { generateCategoryMetadata } from "@/lib/seo/service-page-seo"
import { schemaGenerator } from "@/lib/seo/schema-generator"

export const metadata = generateCategoryMetadata({
  title: 'Storm Damage Restoration Services Australia | NRPG',
  description: 'Emergency storm damage restoration across Australia. IICRC S500-certified contractors. 24/7 response. Roof tarping, water extraction, structural repairs, insurance documentation.',
  keywords: ['storm damage restoration', 'storm damage repair', 'hail damage repair', 'roof damage repair Australia', 'cyclone damage restoration', 'IICRC S500 storm damage'],
  slug: 'storm-damage-restoration',
  categoryName: 'Storm Damage Restoration',
})

const faqs = [
  {
    question: 'What is the first thing to do after storm damage?',
    answer: 'Do not enter a property if there is any doubt about structural integrity — roof damage, wall displacement, or foundation movement are indicators of unsafe conditions. Once safe to do so, notify your insurer immediately to lodge a claim and request emergency tarping if the roof is breached. Storm damage claims have notification timeframes in most Product Disclosure Statements. IICRC S500-certified contractors can attend for emergency assessment and weatherproofing within hours of a severe weather event.',
  },
  {
    question: 'Does homeowners insurance cover storm damage restoration?',
    answer: 'Most standard Australian home and contents policies cover sudden storm damage, including roof damage, water ingress, and structural repairs. Coverage depends on your policy type — named-peril policies only cover specific listed events, while accidental damage policies provide broader protection. Major insurers including NRMA, Suncorp, Allianz, QBE, IAG, and CGU each have different policy conditions. Review your Product Disclosure Statement and notify your insurer before commencing any permanent repairs. Temporary emergency tarping is generally covered as a mitigation measure.',
  },
  {
    question: 'How soon should water ingress from storm damage be addressed?',
    answer: 'Water ingress through a storm-damaged roof or wall breach should be addressed within 24–48 hours. After this window, concealed moisture promotes mould colonisation — typically within 24–72 hours in warm, humid conditions. IICRC S500 protocols prioritise extraction and drying to halt secondary mould growth before it becomes a separate remediation event. Delay in addressing water ingress can also complicate insurance claims if secondary mould damage is attributed to property owner inaction.',
  },
  {
    question: 'What is emergency tarping and when is it needed?',
    answer: 'Emergency tarping is temporary weatherproofing applied to roof breaches caused by storm damage — missing tiles, displaced metal sheeting, holes from fallen debris, or damaged skylights. Tarping prevents ongoing water ingress during the assessment and claim approval period before permanent repairs commence. It is considered a mitigation measure under most insurance policies and is generally covered. Tarping should be documented photographically before installation to preserve evidence of the original damage for the insurance claim.',
  },
  {
    question: 'Can hail damage cause water ingress?',
    answer: 'Yes. Hail impact can crack terracotta and concrete roof tiles, damage metal roofing, break or crack skylights, and compromise flashing around penetrations and valleys. Even where tiles appear intact, the underlay beneath may be compromised. Water ingress through hail-damaged roofing can be delayed — sometimes appearing days after the storm event as subsequent rain finds entry points. Hail damage should be assessed and documented before tarping or temporary repair work covers the original damage pattern, as insurers require photographic evidence of the cause of loss.',
  },
  {
    question: 'How do I know if my property is structurally safe after a storm?',
    answer: 'Do not assume a property is safe to enter based on visual inspection from outside. A licensed structural engineer or building assessor should inspect properties that have sustained roof structure damage, wall cracking, foundation movement, or impact from fallen trees or debris. Signs of unsafe conditions include visible wall lean, doors or windows that will not open or close, sounds of structural movement, and visible roof framing exposure. Emergency services and the State Emergency Service (SES) provide initial safety assessments during declared emergencies.',
  },
  {
    question: 'What if my storm claim is disputed by my insurer?',
    answer: 'If an insurer disputes a storm damage claim — either denying it outright or offering a scope that does not cover the full extent of damage — property owners have the right to escalate to the Australian Financial Complaints Authority (AFCA). AFCA is the external dispute resolution body for Australian financial services complaints and provides free access to binding determinations. The NRPG platform facilitates contractor matching and does not control claim outcomes or act as a claim advocate. For disputes, visit afca.org.au or call AFCA directly.',
  },
  {
    question: 'What causes secondary mould after storm damage?',
    answer: 'Secondary mould after storm damage is caused by concealed moisture left in wall cavities, roof spaces, ceiling plaster, and subfloor areas following water ingress through a structural breach. Unlike a burst pipe event where the water source is eliminated immediately, storm damage often involves ongoing ingress until tarping or repairs are completed. Mould colonisation begins within 24–72 hours in warm, humid conditions. IICRC S500 drying protocols — psychrometric monitoring, structural drying with dehumidifiers and air movers, and moisture mapping — prevent secondary mould by achieving drying targets before colonisation can occur.',
  },
]

export default function StormDamageRestorationPage() {
  const BASE_URL = SITE_URL

  const emergencyServiceSchema = {
    "@context": "https://schema.org",
    "@type": ["Service", "EmergencyService"],
    "name": "Storm Damage Restoration - NRPG Australia",
    "description": "Emergency storm damage restoration across Australia. IICRC S500-certified contractors. 24/7 response. Roof tarping, water extraction, structural repairs, insurance documentation.",
    "serviceType": "Storm Damage Restoration",
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
    { name: 'Storm Damage Restoration', url: `${BASE_URL}/services/storm-damage-restoration` },
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
              Emergency Storm Damage Restoration Services Across Australia
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8">
              Storm damage involves concurrent threats — structural breaches allowing water ingress, roof damage requiring immediate tarping, and secondary water damage requiring IICRC S500-certified extraction and drying protocols. NRPG connects property owners with vetted contractors across all Australian states and territories, mobilised during severe weather events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold px-8 py-3 text-lg">
                  Get Emergency Storm Damage Assessment
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

        {/* How Storm Damage Restoration Works */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              How Storm Damage Restoration Works
            </h2>
            <p className="text-[#9CA3AF] mb-10">
              Storm damage restoration requires concurrent response to multiple threats. IICRC S500 protocols address water ingress from structural breaches, while emergency securing prevents ongoing damage.
            </p>

            <div className="space-y-8">
              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">
                  Emergency Response &amp; Structural Securing (First 4 Hours)
                </h3>
                <p className="text-[#9CA3AF]">
                  Once the property is confirmed safe to access, a certified contractor conducts an emergency assessment to identify structural breaches, roof damage, and active water ingress points. Emergency roof tarping is applied to all breached areas to halt ongoing water entry. Board-up services are provided for broken windows, damaged doors, and compromised wall sections. Temporary fencing may be installed where structural instability poses a risk to persons on or adjacent to the property. All damage is photographically documented before tarping or boarding to preserve evidence for the insurance claim scope.
                </p>
              </div>

              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">
                  Water Extraction &amp; Structural Drying (24–72 Hours)
                </h3>
                <p className="text-[#9CA3AF]">
                  Rainwater entering through storm-damaged roofs and walls is classified as Category 1 under IICRC S500 — clean water requiring extraction and controlled drying. Certified technicians extract standing water from all affected areas using truck-mounted and portable extraction equipment. Structural drying then commences using commercial dehumidifiers and air movers positioned to achieve psychrometric drying targets. Moisture mapping — using calibrated moisture metres and thermal imaging cameras — identifies concealed water in wall cavities, ceiling plaster, and subfloor areas that cannot be detected visually. Psychrometric monitoring continues until all materials return to accepted drying goals as defined in the S500 standard.
                </p>
              </div>

              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-8">
                <h3 className="font-poppins font-semibold text-xl text-white mb-3">
                  Structural Assessment &amp; Restoration Coordination
                </h3>
                <p className="text-[#9CA3AF]">
                  Following emergency water mitigation, a full scope of works is developed covering permanent structural repairs. This includes roof replacement or repair, window and door reinstatement, structural carpentry, and any electrical or plumbing affected by water ingress. IICRC S500-compliant drying documentation — moisture logs, psychrometric records, and moisture maps — is compiled for the insurance file. Contractor coordination for all required trades is managed under a single scope of works to streamline the insurer approval process and minimise total restoration time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              What&apos;s Included in Storm Damage Restoration
            </h2>
            <p className="text-[#9CA3AF] mb-8">
              A complete storm damage restoration engagement covers every phase from initial emergency response through to permanent structural reinstatement. Services delivered by matched contractors include:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Emergency roof tarping and temporary weatherproofing',
                'Board-up services for broken windows and structural breaches',
                'Water extraction from all affected areas',
                'Structural drying — dehumidifiers and air movers',
                'Moisture mapping and thermal imaging for concealed water',
                'Roof damage assessment and temporary repair coordination',
                'Hail damage inspection and documentation',
                'Debris removal and site safety assessment',
                'Contents inventory and pack-out where required',
                'IICRC S500-compliant drying documentation for insurance',
                'Scope of works for permanent structural repairs',
                'AFCA-process compliant insurance claim documentation',
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
              Storm Damage? Get Emergency Response Now
            </h2>
            <p className="text-[#9CA3AF] mb-6">
              Submit a request and an IICRC S500-certified contractor will be matched to your property. Available 24/7 across all Australian states.
            </p>
            <Link href="/contact">
              <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold px-8 py-3 text-lg">
                Get Emergency Storm Damage Assessment
              </Button>
            </Link>
          </div>
        </section>

        {/* Types of Storm Damage in Australia */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              Types of Storm Damage in Australia
            </h2>
            <p className="text-[#9CA3AF] mb-8">
              Australia&apos;s climate produces distinct storm types across different regions, each with specific damage patterns and restoration requirements.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-[#EF4444]" />
                  <h3 className="font-poppins font-semibold text-lg text-white">East Coast Low &amp; Flooding (NSW, VIC, QLD)</h3>
                </div>
                <ul className="space-y-2 text-[#9CA3AF] text-sm">
                  <li>• Storm surge and inland flooding from sustained rainfall</li>
                  <li>• Water may be classified Category 2 or 3 under IICRC S500 if contaminated</li>
                  <li>• Sewage contamination risk in areas with combined stormwater systems</li>
                  <li>• Extended saturation increases structural drying timeframes</li>
                  <li>• Multiple properties affected simultaneously — early lodgement critical</li>
                </ul>
              </div>
              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-[#EF4444]" />
                  <h3 className="font-poppins font-semibold text-lg text-white">Tropical Cyclones (QLD, NT, WA)</h3>
                </div>
                <ul className="space-y-2 text-[#9CA3AF] text-sm">
                  <li>• Class 1–5 cyclones produce sustained destructive wind loading</li>
                  <li>• Structural roof failure, debris impact, and cladding loss common</li>
                  <li>• Prolonged wind-driven rain penetrates even minor roof breaches</li>
                  <li>• QLD cyclone season runs November through April</li>
                  <li>• Insurance catastrophe declarations may affect assessor availability</li>
                </ul>
              </div>
              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-400" />
                  <h3 className="font-poppins font-semibold text-lg text-white">Hailstorms (ACT, VIC, QLD)</h3>
                </div>
                <ul className="space-y-2 text-[#9CA3AF] text-sm">
                  <li>• Hail impacts crack roof tiles, break skylights, and damage flashings</li>
                  <li>• Vehicle damage often falls under motor insurance — separate claim</li>
                  <li>• Some policies apply a co-payment (excess) specific to hail events</li>
                  <li>• Water ingress through hail damage can appear days after the event</li>
                  <li>• Damage must be documented before tarping covers evidence</li>
                </ul>
              </div>
              <div className="bg-[#050505] border border-white/[0.06] rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-400" />
                  <h3 className="font-poppins font-semibold text-lg text-white">Severe Thunderstorms &amp; Flash Flooding</h3>
                </div>
                <ul className="space-y-2 text-[#9CA3AF] text-sm">
                  <li>• Rapid onset — minimal warning, multiple concurrent damage types</li>
                  <li>• Flash flooding may carry Category 3 contaminants under IICRC S500</li>
                  <li>• Roof, window, and structural damage commonly occur simultaneously</li>
                  <li>• Category 1 rainwater vs Category 3 flood water — different protocols</li>
                  <li>• Standard home policies may exclude flood — check your PDS</li>
                </ul>
              </div>
            </div>
            <p className="text-[#9CA3AF] text-sm mt-6">
              Properties affected by flooding in addition to storm damage should review the dedicated{' '}
              <Link href="/services/flood-restoration" className="text-[#0d9488] underline underline-offset-4">
                flood restoration
              </Link>{' '}
              service page. For water ingress from roof breaches, see{' '}
              <Link href="/services/water-damage-restoration" className="text-[#0d9488] underline underline-offset-4">
                water damage restoration
              </Link>{' '}
              for detail on IICRC S500 extraction and drying protocols.
            </p>
          </div>
        </section>

        {/* IICRC S500 Certification */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-3xl text-white mb-4">
              IICRC S500 Certification: What It Means for Storm Claims
            </h2>
            <p className="text-[#9CA3AF] mb-6">
              The IICRC S500 Standard for Professional Water Damage Restoration is the applicable certification standard for storm-related water ingress — rainwater entering through roof breaches, broken windows, and compromised wall sections. Contractors certified to IICRC S500 (Water Damage Restoration Technician) are trained in water classification, extraction methodology, psychrometric drying, and documentation to the S500 standard.
            </p>
            <p className="text-[#9CA3AF] mb-6">
              For insurance purposes, S500-compliant drying documentation — moisture logs, psychrometric records, and drying graphs — provides the evidentiary basis for the scope of works submitted to insurers including NRMA, Suncorp, Allianz, QBE, IAG, and CGU. Insurers may reject scopes of works that lack S500-standard documentation, particularly for structural drying claims where the extent of moisture is not visible.
            </p>
            <p className="text-[#9CA3AF] mb-6">
              Each contractor matched through the platform holds IICRC S500 certification independently and maintains their own professional indemnity insurance and contractor&apos;s licence.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Shield, title: 'IICRC S500 Certified', desc: 'All matched contractors hold current IICRC S500 Water Damage Restoration Technician certification' },
                { icon: Clock, title: 'Emergency 24/7 Response', desc: '24/7 availability for emergency roof tarping, board-up, and water extraction across all states' },
                { icon: CheckCircle, title: 'AFCA Compliant', desc: 'Documentation supports AFCA-regulated insurance dispute processes and insurer scope review' },
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
              The Australian Insurance Claims Process for Storm Damage
            </h2>
            <p className="text-[#9CA3AF] mb-6">
              Storm damage claims in Australia are governed by the Insurance Contracts Act 1984 and the General Insurance Code of Practice. The process follows a broadly consistent structure across major insurers. Note that storm damage events may involve multiple insurers — home building, home contents, strata, and motor insurance policies may each cover different aspects of the same storm event.
            </p>

            <div className="space-y-4 mb-8">
              {[
                {
                  step: '01',
                  title: 'Notify Your Insurer',
                  desc: 'Notify all relevant insurers as soon as the property is safe to access. Home building, strata, and motor policies may each need to be notified separately. Most Product Disclosure Statements require notification within a specified period. Emergency tarping and board-up should be undertaken as a mitigation measure — keep all receipts and photographs.',
                },
                {
                  step: '02',
                  title: 'Assessor Appointed',
                  desc: 'The insurer appoints a loss adjuster or building assessor to inspect the property. During major storm events and catastrophe declarations under the Insurance Council of Australia (ICA) framework, assessor demand is high — lodging early improves access to assessors and contractors. Property owners can engage their own IICRC S500-certified contractor for an independent scope of works.',
                },
                {
                  step: '03',
                  title: 'Scope Agreement',
                  desc: 'The insurer reviews the submitted scope and issues an agreed scope of works. For storm claims involving both structural damage and water ingress, the scope typically covers emergency mitigation, structural repairs, and internal reinstatement. IICRC S500-compliant drying documentation supports scope acceptance for water damage components.',
                },
                {
                  step: '04',
                  title: 'Restoration Commences',
                  desc: 'Once the scope is approved, matched contractors begin work under the agreed scope. Progress reports and photographic documentation are provided throughout. Where strata is involved, coordination between the strata manager, owners corporation insurer, and individual unit holder insurers may be required.',
                },
                {
                  step: '05',
                  title: 'Disputes via AFCA',
                  desc: "If the insurer disputes the scope, denies the claim, or disputes the cause of damage, property owners have the right to escalate to the Australian Financial Complaints Authority (AFCA). AFCA is the external dispute resolution body for Australian financial services complaints and provides free, binding determinations. The ICA's industry code also establishes obligations on insurers during declared catastrophe events.",
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
                The Insurance Council of Australia&apos;s catastrophe declaration framework also applies obligations to insurers during declared severe weather events.
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
                Ready to Start Storm Damage Restoration?
              </h2>
              <p className="text-xl text-[#9CA3AF] mb-8">
                Submit a request to be matched with an IICRC S500-certified contractor in your area. 24/7 availability across all Australian states and territories.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold px-8 py-3 text-lg">
                    Get Emergency Storm Damage Assessment
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
