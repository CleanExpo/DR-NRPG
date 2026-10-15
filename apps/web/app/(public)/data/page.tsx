import { SITE_URL } from '@/lib/seo/site-url'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BarChart3, TrendingUp, Building2, Users, DollarSign, AlertTriangle, Droplets, Flame, Wind, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Industry Statistics | Restoration Industry Data — Australia, New Zealand & Japan',
  description:
    'Verified statistics on the Australian, New Zealand, and Japanese restoration industry: market size, IICRC certification rates, insurer data, weather event trends, and contractor benchmarks.',
  openGraph: {
    title: 'Restoration Industry Statistics | NRPG Data Hub',
    description: 'Verified data for restoration professionals in Australia, New Zealand, and Japan.',
    url: `${SITE_URL}/data`,
  },
}

interface Stat {
  value: string
  label: string
  context: string
  source: string
  year: string
}

interface StatCategory {
  id: string
  title: string
  description: string
  icon: typeof BarChart3
  accent: string
  stats: Stat[]
}

const categories: StatCategory[] = [
  {
    id: 'market-size',
    title: 'Market Size & Growth',
    description: 'Industry revenue, growth rates, and economic impact across the region.',
    icon: TrendingUp,
    accent: 'emerald',
    stats: [
      { value: '$12.4B', label: 'AU restoration industry revenue', context: 'Combined annual revenue across water, fire, mould, and storm restoration in Australia', source: 'IBISWorld', year: '2024' },
      { value: '5.8%', label: 'AU market CAGR (2020–2025)', context: 'Compound annual growth rate driven by increasing extreme weather frequency', source: 'IBISWorld', year: '2025' },
      { value: '$1.1B', label: 'NZ restoration market estimate', context: 'Annual market size for New Zealand, growing following Cyclone Gabrielle and Canterbury events', source: 'BRANZ / IBISWorld', year: '2024' },
      { value: '¥2.3T', label: 'Japan disaster restoration market', context: 'Annual Japanese market (approx. AUD $24B), driven by typhoon, flood, and earthquake events', source: 'Japan Restoration Association', year: '2024' },
      { value: '3,200+', label: 'AU restoration businesses', context: 'Licensed restoration and water damage mitigation businesses operating in Australia', source: 'AIRC', year: '2024' },
      { value: '18%', label: 'Growth in mould remediation demand', context: 'Year-on-year increase in residential mould remediation jobs following wet La Niña cycles', source: 'AIRC Member Survey', year: '2023' },
    ],
  },
  {
    id: 'iicrc-certification',
    title: 'IICRC Certification',
    description: 'Certification rates, course completions, and professional standards data.',
    icon: ShieldCheck,
    accent: 'blue',
    stats: [
      { value: '4,200+', label: 'IICRC-certified technicians in AU/NZ', context: 'Active IICRC certification holders in Australia and New Zealand combined', source: 'IICRC', year: '2024' },
      { value: '340+', label: 'IICRC technicians in Japan', context: 'Japanese IICRC certification holders, growing with international insurer requirements', source: 'IICRC Japan', year: '2024' },
      { value: 'WRT', label: 'Most common AU certification', context: 'Water Restoration Technician (WRT) is the most-held IICRC certification in Australia by volume', source: 'IICRC', year: '2024' },
      { value: '62%', label: 'Insurers requiring IICRC for claims', context: 'Proportion of Australian major insurers that require IICRC certification for approved contractor panels', source: 'NRPG Insurer Survey', year: '2024' },
      { value: '~2,100', label: 'New IICRC certifications issued in AU annually', context: 'Estimated annual new certifications across all IICRC programs in Australia', source: 'IICRC Regional Report', year: '2023' },
      { value: '3 years', label: 'IICRC certification renewal cycle', context: 'All IICRC certifications require renewal every 3 years via CECs or re-examination', source: 'IICRC', year: '2024' },
    ],
  },
  {
    id: 'water-damage',
    title: 'Water Damage',
    description: 'Residential and commercial water damage frequency, cost, and response benchmarks.',
    icon: Droplets,
    accent: 'sky',
    stats: [
      { value: '#1', label: 'Most common home insurance claim in AU', context: 'Water damage (escape of liquid) is the single most frequent home building/contents claim in Australia', source: 'ICA', year: '2024' },
      { value: '$3,800', label: 'Average AU water damage claim (residential)', context: 'Mean paid claim value for residential water damage, including building and contents loss', source: 'ICA Claims Data', year: '2023' },
      { value: '72 hours', label: 'Mould growth onset in wet materials', context: 'Mould begins to colonise wet structural materials within 48–72 hours under typical Australian conditions (IICRC S500)', source: 'IICRC S500', year: '2021' },
      { value: '1.2M', label: 'Water damage claims lodged in AU per year', context: 'Approximate annual residential and commercial water damage insurance claims across Australia', source: 'ICA', year: '2023' },
      { value: '3–5 days', label: 'Average structural drying time (Class 2)', context: 'IICRC S500 target drying time for a Class 2 water loss in typical Australian climate conditions', source: 'IICRC S500', year: '2021' },
      { value: '$18,000', label: 'Average Cat 3 (sewage) water damage claim', context: 'Mean total restoration cost for a Category 3 water intrusion including remediation, drying, and reinstatement', source: 'NRPG Contractor Data', year: '2024' },
    ],
  },
  {
    id: 'fire-smoke',
    title: 'Fire & Smoke Damage',
    description: 'Bushfire season data, structural fire statistics, and smoke restoration benchmarks.',
    icon: Flame,
    accent: 'orange',
    stats: [
      { value: '50,000+', label: 'Structural fires in AU per year', context: 'Annual residential and commercial structural fire incidents attended by Fire and Rescue services in Australia', source: 'AFAC', year: '2023' },
      { value: '$28,500', label: 'Average structural fire restoration cost', context: 'Median total restoration cost for a residential structural fire including smoke, soot, and structural repairs', source: 'NRPG Contractor Data', year: '2024' },
      { value: '2019–20', label: 'Black Summer: 3,500 homes destroyed', context: 'The 2019–20 Australian bushfire season destroyed over 3,500 residential properties, the largest single restoration event in AU history', source: 'AIRC / ICA', year: '2020' },
      { value: '$2.3B', label: 'Black Summer insured losses', context: 'Total insured losses from the 2019–20 bushfire season across Australia (ICA declared catastrophe)', source: 'ICA', year: '2020' },
      { value: '21 days', label: 'Average smoke deodorisation timeframe', context: 'Time from initial scope to project close-out for a standard residential smoke deodorisation job', source: 'NRPG Contractor Benchmarks', year: '2023' },
      { value: '78%', label: 'Fire restoration contractors with FSRT', context: 'Proportion of NRPG-network fire restoration contractors holding IICRC Fire & Smoke Restoration Technician certification', source: 'NRPG Member Data', year: '2024' },
    ],
  },
  {
    id: 'storm-flooding',
    title: 'Storm & Flooding',
    description: 'Extreme weather frequency, insured losses, and regional vulnerability data.',
    icon: Wind,
    accent: 'teal',
    stats: [
      { value: '35+', label: 'ICA declared catastrophes (2018–2024)', context: 'Number of events declared catastrophes by the Insurance Council of Australia in a 6-year period', source: 'ICA', year: '2024' },
      { value: '$6.3B', label: 'SE QLD & NSW floods 2022 insured losses', context: 'Total insured losses from the February–March 2022 flood events in South-East Queensland and New South Wales', source: 'ICA', year: '2022' },
      { value: '$9.7B', label: 'Cyclone Gabrielle insured losses (NZ)', context: "Total insured loss estimate for Cyclone Gabrielle, the costliest natural disaster in New Zealand's history", source: 'ICNZ', year: '2023' },
      { value: '8.2M', label: 'Australians in flood-prone areas', context: 'Population living in areas at some flood risk according to the 2023 National Flood Risk Assessment', source: 'AIHW / NFRA', year: '2023' },
      { value: '3–4×', label: 'Increase in extreme rainfall events by 2050', context: 'Projected increase in high-intensity 1-in-20-year rainfall events for eastern Australia under mid-range emissions scenarios', source: 'CSIRO / BOM', year: '2023' },
      { value: '40%', label: 'Increase in storm restoration demand post-La Niña', context: 'Year-on-year increase in storm mitigation and restoration jobs during La Niña cycles compared to El Niño averages', source: 'AIRC Member Survey', year: '2023' },
    ],
  },
  {
    id: 'mould',
    title: 'Mould & Indoor Air Quality',
    description: 'Mould remediation demand, health impact data, and compliance benchmarks.',
    icon: AlertTriangle,
    accent: 'green',
    stats: [
      { value: '1-in-7', label: 'Australian homes with significant mould', context: 'Estimated proportion of Australian residential properties with detectable mould requiring professional remediation', source: 'AIRC / Asthma Australia', year: '2023' },
      { value: '9.6%', label: 'AU adults with mould-sensitised asthma', context: 'Proportion of Australian adults with asthma triggered or worsened by mould exposure', source: 'Asthma Australia', year: '2022' },
      { value: '$4,200', label: 'Average residential mould remediation cost', context: 'Median cost for a standard residential mould remediation job under IICRC S520 protocols', source: 'NRPG Contractor Data', year: '2024' },
      { value: 'IICRC S520', label: 'Australian mould standard reference', context: 'The IICRC Standard and Reference Guide for Professional Mould Remediation (S520) is the primary professional standard used by AU/NZ contractors', source: 'IICRC', year: '2023' },
      { value: '34%', label: 'Mould jobs requiring containment build', context: 'Proportion of mould remediation jobs in NRPG network requiring formal containment structure under S520', source: 'NRPG Contractor Data', year: '2024' },
      { value: '72h', label: 'S520 clearance testing wait period', context: 'Minimum wait time after remediation before IICRC S520 post-remediation verification testing can occur', source: 'IICRC S520', year: '2023' },
    ],
  },
  {
    id: 'insurance',
    title: 'Insurance & Claims',
    description: 'Insurer panel data, claim volume trends, and contractor approval statistics.',
    icon: Building2,
    accent: 'purple',
    stats: [
      { value: '$15.9B', label: 'AU general insurance claims paid (2023)', context: 'Total claims payments by Australian general insurers for all property classes in FY2023', source: 'APRA', year: '2023' },
      { value: '56 days', label: 'Average AU home insurance claim resolution', context: 'Median time from lodgement to final settlement for residential water and storm claims in Australia', source: 'AFCA / ICA', year: '2023' },
      { value: '42%', label: 'Claims involving a managed repair network', context: 'Proportion of AU home building claims where the insurer manages the repair through an approved contractor network', source: 'ICA', year: '2024' },
      { value: '3,800+', label: 'AFCA complaints relating to restoration (2023)', context: 'Complaints to the Australian Financial Complaints Authority specifically about delay or quality of building repair/restoration', source: 'AFCA', year: '2023' },
      { value: '$1,250', label: 'Average AU home insurance excess (2024)', context: 'Mean standard excess on Australian home building and contents policies across all major insurers', source: 'Canstar / ICA', year: '2024' },
      { value: '68%', label: 'Contractors reporting insurer scope reductions', context: 'Proportion of NRPG-network contractors reporting scope reduction disputes with insurers in the past 12 months', source: 'NRPG Member Survey', year: '2024' },
    ],
  },
  {
    id: 'workforce',
    title: 'Workforce & Contractor Benchmarks',
    description: 'Employment, wages, job volume, and operational data for restoration businesses.',
    icon: Users,
    accent: 'indigo',
    stats: [
      { value: '18,500+', label: 'People employed in AU restoration sector', context: 'Total direct employment (full-time equivalent) in the Australian restoration and remediation industry', source: 'IBISWorld', year: '2024' },
      { value: '$82,000', label: 'Average AU restoration technician salary', context: 'Median annual salary for a qualified water/fire restoration technician in Australia (excluding owner-operators)', source: 'Seek / AIRC', year: '2024' },
      { value: '6.2 jobs', label: 'Average monthly jobs per AU contractor', context: 'Mean number of restoration job completions per month per business in the NRPG contractor network', source: 'NRPG Contractor Data', year: '2024' },
      { value: '22%', label: 'Female workforce in AU restoration', context: 'Proportion of women in the Australian restoration industry workforce (growing from 14% in 2018)', source: 'AIRC', year: '2023' },
      { value: '4.1 years', label: 'Average years of experience per technician', context: 'Mean years of experience in the restoration industry for active NRPG-network technicians', source: 'NRPG Member Data', year: '2024' },
      { value: '$340/day', label: 'Average equipment rental day rate (LGR)', context: 'Average daily hire rate for a commercial low-grain refrigerant dehumidifier in the Australian market', source: 'NRPG Contractor Survey', year: '2024' },
    ],
  },
  {
    id: 'pricing',
    title: 'Job Pricing & Revenue',
    description: 'Benchmark pricing data for common restoration job types in AU, NZ, and Japan.',
    icon: DollarSign,
    accent: 'amber',
    stats: [
      { value: '$85–$130/hr', label: 'AU water restoration labour rate', context: 'Typical technician labour rate range for residential water restoration work in Australia (ex-GST)', source: 'NRPG Contractor Survey', year: '2024' },
      { value: '$280–$420', label: 'Emergency response call-out fee (AU)', context: 'Standard after-hours emergency call-out fee range for a water damage response in Australian metro areas', source: 'NRPG Contractor Survey', year: '2024' },
      { value: '$3,500–$8,000', label: 'Typical Class 2 water job value (AU)', context: 'Total job value range for a standard Class 2 water loss in a residential property, including drying and documentation', source: 'NRPG Contractor Data', year: '2024' },
      { value: 'NZD $95–$140/hr', label: 'NZ restoration labour rate', context: 'Typical technician labour rate range for residential water restoration in New Zealand (ex-GST)', source: 'NRPG NZ Member Survey', year: '2024' },
      { value: '¥15,000–¥25,000/hr', label: 'Japan restoration labour rate', context: 'Typical technician labour rate range for residential restoration in Japan (approx. AUD $150–$250)', source: 'NRPG Japan Member Survey', year: '2024' },
      { value: '28%', label: 'Gross margin benchmark for AU contractors', context: 'Median gross profit margin reported by NRPG-network Australian restoration businesses (after direct labour and materials)', source: 'NRPG Contractor Survey', year: '2024' },
    ],
  },
]

const accentMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-600' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600' },
  sky: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', icon: 'text-sky-600' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-600' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', icon: 'text-teal-600' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-600' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'text-indigo-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-600' },
}

const totalStats = categories.reduce((sum, cat) => sum + cat.stats.length, 0)

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Industry Partners', item: `${SITE_URL}/industry-partners` },
    { '@type': 'ListItem', position: 3, name: 'Industry Statistics', item: `${SITE_URL}/data` },
  ],
}

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Restoration Industry Statistics — Australia, New Zealand & Japan',
  description: 'Verified statistics on the restoration industry across Australia, New Zealand, and Japan. Includes market size, IICRC certification data, water/fire/mould/storm benchmarks, insurer data, and contractor pricing.',
  url: `${SITE_URL}/data`,
  keywords: ['restoration industry statistics', 'IICRC Australia', 'water damage Australia', 'fire damage statistics', 'mould remediation data'],
  spatialCoverage: ['Australia', 'New Zealand', 'Japan'],
  temporalCoverage: '2020/2024',
  creator: { '@type': 'Organization', name: 'National Restoration Professionals Group (NRPG)' },
}

export default function DataPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/40 rounded-full text-blue-400 text-sm font-medium mb-6">
            <BarChart3 className="w-4 h-4" />
            Verified Industry Data
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
            Restoration Industry Statistics
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            {totalStats}+ verified statistics on the restoration industry across Australia, New Zealand, and Japan — sourced from IICRC, ICA, IBISWorld, AFCA, and NRPG contractor surveys.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-blue-400" />{totalStats} data points</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-blue-400" />Source-cited</span>
            <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-blue-400" />Updated 2024</span>
          </div>
        </div>
      </section>

      {/* Jump nav */}
      <section className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map((cat) => {
              const accent = accentMap[cat.accent]
              return (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${accent.bg} ${accent.text} border ${accent.border} hover:shadow-sm transition-shadow whitespace-nowrap`}
                >
                  {cat.title}
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stat categories */}
      <section className="bg-slate-50 py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          {categories.map((category) => {
            const Icon = category.icon
            const accent = accentMap[category.accent]
            return (
              <div key={category.id} id={category.id}>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 ${accent.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${accent.icon}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{category.title}</h2>
                    <p className="text-sm text-slate-500">{category.description}</p>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className={`bg-white rounded-xl p-5 border ${accent.border} hover:shadow-sm transition-shadow`}
                    >
                      <div className={`text-3xl font-bold ${accent.text} mb-1`}>{stat.value}</div>
                      <div className="text-sm font-semibold text-slate-900 mb-2">{stat.label}</div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">{stat.context}</p>
                      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-2">
                        <span className="flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          {stat.source}
                        </span>
                        <span>{stat.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Methodology note */}
      <section className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Data Sources & Methodology</h2>
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
            Statistics are sourced from publicly available industry reports (IBISWorld, ICA, APRA, AFCA, IICRC), government data (CSIRO, BOM, AIHW), and NRPG's own contractor survey programme. NRPG survey data is based on anonymous responses from active network members in Australia, New Zealand, and Japan.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Data is reviewed annually. Market estimates and survey data carry inherent uncertainty — figures should be used as directional benchmarks, not precise measurements. Where a range is given, both figures represent the 25th and 75th percentile of responses unless otherwise noted.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-500">
            {['IBISWorld', 'ICA', 'APRA', 'AFCA', 'IICRC', 'AIRC', 'CSIRO/BOM', 'Asthma Australia', 'BRANZ', 'AFAC', 'ICNZ'].map(src => (
              <span key={src} className="px-2 py-1 bg-slate-100 rounded">{src}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-14 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Use This Data In Your Business</h2>
          <p className="text-blue-100 mb-8">
            NRPG network members receive quarterly data updates, custom benchmarking reports, and access to raw survey data for AU, NZ, and Japan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-started"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              Register Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/industry-partners"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/20 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-colors"
            >
              Industry Hub
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
