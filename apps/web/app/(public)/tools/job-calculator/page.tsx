'use client'

import { SITE_URL } from '@/lib/seo/site-url'
import { useState, useMemo } from 'react'
import { Calculator, Droplets, Flame, Wind, CheckSquare, Printer, ExternalLink, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type JobType = 'water' | 'mould' | 'fire' | 'carpet' | 'storm'
type Region = 'au-metro' | 'au-regional' | 'nz' | 'jp'
type WaterCategory = '1' | '2' | '3'
type MoistureClass = '1' | '2' | '3' | '4'

interface LineItem {
  label: string
  min: number
  max: number
  note?: string
}

// ── Rate Cards (public industry-standard rates, AU/NZ/JP) ─────────────────────

const REGIONAL_MULTIPLIER: Record<Region, number> = {
  'au-metro': 1.0,
  'au-regional': 0.85,
  nz: 0.92,
  jp: 1.35,
}

const JOB_TYPE_OPTIONS: { value: JobType; label: string; icon: string }[] = [
  { value: 'water', label: 'Water / Flood Damage', icon: '💧' },
  { value: 'mould', label: 'Mould Remediation', icon: '🍃' },
  { value: 'fire', label: 'Fire & Smoke Damage', icon: '🔥' },
  { value: 'carpet', label: 'Carpet / Upholstery', icon: '🪑' },
  { value: 'storm', label: 'Storm Damage', icon: '⛈' },
]

const WATER_CATEGORIES: { value: WaterCategory; label: string; desc: string }[] = [
  { value: '1', label: 'Category 1 — Clean water', desc: 'Broken pipe, supply line, rain water' },
  { value: '2', label: 'Category 2 — Grey water', desc: 'Washing machine, dishwasher overflow' },
  { value: '3', label: 'Category 3 — Black water', desc: 'Sewage, floodwater, storm surge' },
]

const MOISTURE_CLASSES: { value: MoistureClass; label: string }[] = [
  { value: '1', label: 'Class 1 — Small, slow evaporation' },
  { value: '2', label: 'Class 2 — Large, fast evaporation' },
  { value: '3', label: 'Class 3 — Entire area absorption' },
  { value: '4', label: 'Class 4 — Specialty drying (hardwood, concrete)' },
]

// ── Calculation engine ─────────────────────────────────────────────────────────

function calcWater(
  sqm: number,
  rooms: number,
  days: number,
  category: WaterCategory,
  moistureClass: MoistureClass,
  multiplier: number
): LineItem[] {
  const catMult = category === '3' ? 1.6 : category === '2' ? 1.25 : 1.0
  const classMult = moistureClass === '4' ? 1.8 : moistureClass === '3' ? 1.4 : moistureClass === '2' ? 1.1 : 1.0
  const m = multiplier * catMult * classMult

  const items: LineItem[] = [
    {
      label: 'Initial assessment & moisture mapping',
      min: Math.round(250 * m),
      max: Math.round(550 * m),
    },
    {
      label: 'Emergency water extraction',
      min: Math.round(sqm * 8 * m),
      max: Math.round(sqm * 18 * m),
      note: `Based on ${sqm} m² affected area`,
    },
    {
      label: 'Structural drying equipment (per day)',
      min: Math.round(days * rooms * 180 * m),
      max: Math.round(days * rooms * 350 * m),
      note: `${rooms} area(s) × ${days} day(s)`,
    },
    {
      label: 'Daily moisture monitoring visits',
      min: Math.round(days * 80 * m),
      max: Math.round(days * 160 * m),
    },
    {
      label: 'Antimicrobial treatment',
      min: Math.round(sqm * 4 * m),
      max: Math.round(sqm * 9 * m),
    },
  ]

  if (category === '3') {
    items.push({
      label: 'Contamination remediation (Cat 3 surcharge)',
      min: Math.round(sqm * 12 * m),
      max: Math.round(sqm * 25 * m),
      note: 'Black water — additional PPE, containment, disposal',
    })
  }

  return items
}

function calcMould(sqm: number, rooms: number, multiplier: number): LineItem[] {
  const m = multiplier
  return [
    {
      label: 'Mould assessment & air testing',
      min: Math.round(300 * m),
      max: Math.round(650 * m),
    },
    {
      label: 'Containment setup (critical barriers)',
      min: Math.round(rooms * 300 * m),
      max: Math.round(rooms * 700 * m),
      note: `${rooms} containment zone(s)`,
    },
    {
      label: 'Mould remediation (per m²)',
      min: Math.round(sqm * 55 * m),
      max: Math.round(sqm * 130 * m),
    },
    {
      label: 'HEPA vacuuming & surface treatment',
      min: Math.round(sqm * 8 * m),
      max: Math.round(sqm * 18 * m),
    },
    {
      label: 'Clearance testing & certification',
      min: Math.round(350 * m),
      max: Math.round(750 * m),
    },
  ]
}

function calcFire(sqm: number, rooms: number, days: number, multiplier: number): LineItem[] {
  const m = multiplier
  return [
    {
      label: 'Emergency board-up & site security',
      min: Math.round(400 * m),
      max: Math.round(1200 * m),
    },
    {
      label: 'Content pack-out & storage (per room)',
      min: Math.round(rooms * 400 * m),
      max: Math.round(rooms * 1200 * m),
      note: `${rooms} room(s)`,
    },
    {
      label: 'Structural soot & smoke cleaning (per m²)',
      min: Math.round(sqm * 45 * m),
      max: Math.round(sqm * 120 * m),
    },
    {
      label: 'Odour neutralisation & ozone treatment',
      min: Math.round(days * 250 * m),
      max: Math.round(days * 600 * m),
      note: `${days} treatment day(s)`,
    },
    {
      label: 'HVAC decontamination',
      min: Math.round(300 * m),
      max: Math.round(800 * m),
    },
  ]
}

function calcCarpet(sqm: number, multiplier: number): LineItem[] {
  const m = multiplier
  return [
    {
      label: 'Hot water extraction cleaning (per m²)',
      min: Math.round(sqm * 3.5 * m),
      max: Math.round(sqm * 8 * m),
    },
    {
      label: 'Pre-treatment & deodorising',
      min: Math.round(sqm * 2 * m),
      max: Math.round(sqm * 5 * m),
    },
    {
      label: 'Stain & spot treatment',
      min: Math.round(80 * m),
      max: Math.round(250 * m),
      note: 'Per heavily soiled area',
    },
    {
      label: 'Scotchgard / fabric protection (optional)',
      min: Math.round(sqm * 4 * m),
      max: Math.round(sqm * 8 * m),
    },
  ]
}

function calcStorm(sqm: number, rooms: number, days: number, multiplier: number): LineItem[] {
  const m = multiplier
  return [
    {
      label: 'Emergency tarping & make-safe',
      min: Math.round(500 * m),
      max: Math.round(1500 * m),
    },
    {
      label: 'Debris removal & site clear',
      min: Math.round(rooms * 250 * m),
      max: Math.round(rooms * 700 * m),
    },
    {
      label: 'Water damage drying (if ingress)',
      min: Math.round(sqm * 10 * m),
      max: Math.round(sqm * 22 * m),
    },
    {
      label: 'Structural drying equipment (per day)',
      min: Math.round(days * 150 * m),
      max: Math.round(days * 320 * m),
    },
    {
      label: 'Mould prevention treatment',
      min: Math.round(sqm * 4 * m),
      max: Math.round(sqm * 9 * m),
    },
  ]
}

function getLineItems(
  jobType: JobType,
  sqm: number,
  rooms: number,
  days: number,
  category: WaterCategory,
  moistureClass: MoistureClass,
  region: Region
): LineItem[] {
  const multiplier = REGIONAL_MULTIPLIER[region]
  switch (jobType) {
    case 'water': return calcWater(sqm, rooms, days, category, moistureClass, multiplier)
    case 'mould': return calcMould(sqm, rooms, multiplier)
    case 'fire': return calcFire(sqm, rooms, days, multiplier)
    case 'carpet': return calcCarpet(sqm, multiplier)
    case 'storm': return calcStorm(sqm, rooms, days, multiplier)
  }
}

// ── JSON-LD ───────────────────────────────────────────────────────────────────

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: `${SITE_URL}/tools` },
        { '@type': 'ListItem', position: 3, name: 'Job Costing Calculator', item: `${SITE_URL}/tools/job-calculator` },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Restoration Job Cost Calculator',
      description: 'Free tool to estimate water damage, mould remediation, fire restoration, carpet cleaning, and storm damage costs in Australia, New Zealand, and Japan.',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'AUD' },
    },
  ],
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function JobCalculatorPage() {
  const [jobType, setJobType] = useState<JobType>('water')
  const [sqm, setSqm] = useState(50)
  const [rooms, setRooms] = useState(2)
  const [days, setDays] = useState(3)
  const [category, setCategory] = useState<WaterCategory>('1')
  const [moistureClass, setMoistureClass] = useState<MoistureClass>('2')
  const [region, setRegion] = useState<Region>('au-metro')
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  const lineItems = useMemo(
    () => getLineItems(jobType, sqm, rooms, days, category, moistureClass, region),
    [jobType, sqm, rooms, days, category, moistureClass, region]
  )

  const total = useMemo(
    () => ({
      min: lineItems.reduce((s, i) => s + i.min, 0),
      max: lineItems.reduce((s, i) => s + i.max, 0),
    }),
    [lineItems]
  )

  const currencySymbol = region === 'nz' ? 'NZ$' : region === 'jp' ? '¥' : 'A$'

  function fmt(n: number) {
    if (region === 'jp') return `¥${Math.round(n * 95).toLocaleString()}`
    return `${currencySymbol}${n.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`
  }

  const needsWaterInputs = jobType === 'water' || jobType === 'mould' || jobType === 'storm'
  const needsDays = jobType !== 'carpet' && jobType !== 'mould'

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-slate-50 print:bg-white">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <section className="bg-white border-b border-slate-200 py-10 px-4 print:py-4">
          <div className="max-w-5xl mx-auto">
            <nav className="text-sm text-slate-500 mb-4 print:hidden">
              <a href="/" className="hover:text-emerald-600">Home</a>
              <span className="mx-2">/</span>
              <a href="/tools" className="hover:text-emerald-600">Tools</a>
              <span className="mx-2">/</span>
              <span className="text-slate-800">Job Cost Calculator</span>
            </nav>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                <Calculator className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Restoration Job Cost Calculator</h1>
                <p className="mt-1 text-slate-600 max-w-2xl">
                  Estimate water damage, mould remediation, fire, carpet, and storm restoration costs based on
                  industry-standard rates across Australia, New Zealand, and Japan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Body ───────────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Left — inputs */}
          <div className="space-y-6 print:hidden">
            {/* Job type */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">Job Type</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {JOB_TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setJobType(opt.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-colors ${
                      jobType === opt.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 hover:border-emerald-300 text-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="text-center leading-tight">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Property details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <h2 className="text-base font-semibold text-slate-800">Property Details</h2>

              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value as Region)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="au-metro">Australia — Metro (Sydney, Melbourne, Brisbane, Perth, Adelaide)</option>
                  <option value="au-regional">Australia — Regional</option>
                  <option value="nz">New Zealand</option>
                  <option value="jp">Japan</option>
                </select>
              </div>

              {/* Affected area */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Affected floor area: <span className="text-emerald-600 font-semibold">{sqm} m²</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={500}
                  step={5}
                  value={sqm}
                  onChange={e => setSqm(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>5 m²</span><span>500 m²</span>
                </div>
              </div>

              {/* Rooms */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Affected rooms / areas: <span className="text-emerald-600 font-semibold">{rooms}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={12}
                  step={1}
                  value={rooms}
                  onChange={e => setRooms(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>1</span><span>12</span>
                </div>
              </div>

              {/* Days */}
              {needsDays && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Estimated job duration: <span className="text-emerald-600 font-semibold">{days} day{days !== 1 ? 's' : ''}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={21}
                    step={1}
                    value={days}
                    onChange={e => setDays(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>1 day</span><span>21 days</span>
                  </div>
                </div>
              )}
            </div>

            {/* Water / storm specific inputs */}
            {needsWaterInputs && jobType !== 'mould' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                <h2 className="text-base font-semibold text-slate-800">Water Parameters</h2>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">IICRC Water Category</label>
                  <div className="space-y-2">
                    {WATER_CATEGORIES.map(cat => (
                      <label key={cat.value} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="water-category"
                          value={cat.value}
                          checked={category === cat.value}
                          onChange={() => setCategory(cat.value as WaterCategory)}
                          className="mt-0.5 accent-emerald-600"
                        />
                        <span className="text-sm">
                          <span className="font-medium text-slate-800">{cat.label}</span>
                          <span className="block text-slate-500">{cat.desc}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">IICRC Moisture Class</label>
                  <div className="space-y-2">
                    {MOISTURE_CLASSES.map(mc => (
                      <label key={mc.value} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="moisture-class"
                          value={mc.value}
                          checked={moistureClass === mc.value}
                          onChange={() => setMoistureClass(mc.value as MoistureClass)}
                          className="accent-emerald-600"
                        />
                        <span className="text-sm text-slate-700">{mc.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right — results */}
          <div className="space-y-4">
            {/* Summary card */}
            <div className="bg-emerald-700 text-white rounded-2xl p-6 print:border print:border-slate-300">
              <div className="flex items-center gap-2 mb-1 text-emerald-200 text-sm font-medium print:text-slate-600">
                <Calculator className="w-4 h-4" />
                Estimated total cost
              </div>
              <div className="text-4xl font-bold tracking-tight">
                {fmt(total.min)} – {fmt(total.max)}
              </div>
              <p className="mt-2 text-emerald-200 text-xs print:text-slate-500">
                Industry-standard rate estimate. Actual cost varies with site conditions.
              </p>
              {region === 'jp' && (
                <p className="mt-1 text-emerald-200 text-xs">
                  JPY estimate at approx. 95 ¥/A$. Verify current exchange rate.
                </p>
              )}
            </div>

            {/* Line items */}
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
              <div className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cost breakdown
              </div>
              {lineItems.map((item, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{item.label}</p>
                      {item.note && (
                        <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>
                      )}
                    </div>
                    <div className="text-right text-sm font-semibold text-slate-700 whitespace-nowrap">
                      {fmt(item.min)} – {fmt(item.max)}
                    </div>
                  </div>
                </div>
              ))}
              <div className="px-5 py-4 bg-slate-50 flex justify-between items-center rounded-b-2xl">
                <span className="text-sm font-semibold text-slate-700">Estimated total</span>
                <span className="text-base font-bold text-emerald-700">
                  {fmt(total.min)} – {fmt(total.max)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 print:hidden">
              <a
                href="/claim/step-1"
                className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-5 rounded-xl transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Get a professional quote
              </a>
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 w-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-5 rounded-xl transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print estimate
              </button>
            </div>

            {/* Disclaimer */}
            <div className="rounded-xl border border-amber-200 bg-amber-50">
              <button
                onClick={() => setShowDisclaimer(d => !d)}
                className="flex items-center justify-between w-full px-4 py-3 text-sm text-amber-800 font-medium print:hidden"
              >
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Estimate disclaimer
                </span>
                {showDisclaimer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {(showDisclaimer) && (
                <p className="px-4 pb-4 text-xs text-amber-700 leading-relaxed">
                  These estimates are based on publicly available industry-standard rates for Australia, New Zealand,
                  and Japan (sourced from IICRC, ICA, and market surveys). Actual costs depend on site conditions,
                  material type, extent of damage, access, contractor availability, and applicable insurance. Estimates
                  do not constitute a quote. Engage a licensed restoration professional for an accurate assessment.
                </p>
              )}
              <p className="px-4 pb-4 text-xs text-amber-700 leading-relaxed print:block hidden">
                These estimates are based on publicly available industry-standard rates (IICRC, ICA, market surveys).
                Actual costs vary with site conditions. Not a formal quote. Engage a licensed restoration professional.
              </p>
            </div>

            {/* Info cards */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 print:hidden">
              <h3 className="text-sm font-semibold text-slate-800">Rate sources</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex gap-2"><CheckSquare className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />IICRC S500 Standard for Professional Water Damage Restoration</li>
                <li className="flex gap-2"><CheckSquare className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />IICRC S520 Standard for Professional Mould Remediation</li>
                <li className="flex gap-2"><CheckSquare className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />Insurance Council of Australia (ICA) industry pricing guidelines</li>
                <li className="flex gap-2"><CheckSquare className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />Market survey of licensed restoration contractors (AU, NZ, JP)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── SEO content ──────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 pb-16 print:hidden">
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">About restoration job costs in Australia</h2>
            <div className="prose prose-sm prose-slate max-w-none">
              <p>
                Water damage restoration cost in Australia varies significantly based on the extent of damage,
                water category, and the IICRC moisture class. A small Cat 1 water leak affecting one room may
                cost {fmt(800)}–{fmt(2500)}, while a Category 3 black water event requiring full structural
                drying across multiple rooms can reach {fmt(15000)}–{fmt(40000)} or more.
              </p>
              <p className="mt-3">
                Mould remediation cost depends heavily on the affected surface area and containment required.
                IICRC S520-compliant mould remediation in an average-sized room (15–25 m²) typically ranges
                from {fmt(2500)} to {fmt(8000)} including air quality testing and clearance certification.
              </p>
              <p className="mt-3">
                Fire and smoke damage restoration is among the most variable — contents pack-out, structural
                cleaning, odour treatment, and HVAC decontamination all add to the final cost. Most
                residential fire damage restoration projects in Australia range from {fmt(5000)} to
                {fmt(50000)} depending on the size of the event.
              </p>
              <p className="mt-3">
                In New Zealand, rates are broadly similar to Australian regional rates (approximately 8–15%
                lower than Australian metro). Japan restoration work is typically priced at a premium
                reflecting higher labour costs.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-3">
              <a href="/guides" className="text-sm text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1.5">
                <Droplets className="w-4 h-4" />Industry guides
              </a>
              <a href="/tools/drying-calculator" className="text-sm text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1.5">
                <Wind className="w-4 h-4" />Drying time calculator
              </a>
              <a href="/tools/course-finder" className="text-sm text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1.5">
                <Flame className="w-4 h-4" />IICRC course finder
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
