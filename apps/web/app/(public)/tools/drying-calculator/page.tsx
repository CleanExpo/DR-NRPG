'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import type { ElementType } from 'react'
import {
  Calculator,
  Droplets,
  Wind,
  Thermometer,
  ArrowRight,
  Info,
  AlertTriangle,
  CheckCircle,
  Layers,
  ChevronDown,
} from 'lucide-react'

// ─── Industry-standard drying time model ─────────────────────────────────────
// Simplified psycrometric model based on industry-standard principles.
// Base drying days adjusted by material, moisture class, and conditions.
// NOTE: This is a field estimation tool only — not a substitute for moisture readings.

const materialTypes = [
  { value: 'drywall_painted', label: 'Drywall — Painted', baseDays: 3 },
  { value: 'drywall_unpainted', label: 'Drywall — Unpainted', baseDays: 2 },
  { value: 'hardwood_floor', label: 'Hardwood Flooring', baseDays: 7 },
  { value: 'subfloor_plywood', label: 'Subfloor — Plywood', baseDays: 5 },
  { value: 'subfloor_particleboard', label: 'Subfloor — Particleboard', baseDays: 9 },
  { value: 'concrete_slab', label: 'Concrete Slab', baseDays: 10 },
  { value: 'carpet_pad', label: 'Carpet + Pad', baseDays: 2 },
  { value: 'insulation_batts', label: 'Wall Insulation — Batts', baseDays: 14 },
  { value: 'timber_framing', label: 'Timber Framing', baseDays: 8 },
  { value: 'masonry_brick', label: 'Masonry / Brick', baseDays: 14 },
]

const moistureClasses = [
  { value: 1, label: 'Class 1 — Minimal moisture (<5% of floor wet)', multiplier: 0.6 },
  { value: 2, label: 'Class 2 — Significant moisture (5–40% wet)', multiplier: 1.0 },
  { value: 3, label: 'Class 3 — Whole room saturation (>40% wet)', multiplier: 1.6 },
  { value: 4, label: 'Class 4 — Specialty drying required (hardwood, concrete)', multiplier: 2.4 },
]

const waterCategories = [
  { value: 1, label: 'Cat 1 — Clean Water (supply line, rain)', multiplier: 1.0 },
  { value: 2, label: 'Cat 2 — Grey Water (washing machine, dishwasher)', multiplier: 1.15 },
  { value: 3, label: 'Cat 3 — Black Water (sewage, flooding)', multiplier: 1.3 },
]

const tempRanges = [
  { value: 'cold', label: 'Cold (<18°C)', multiplier: 1.4 },
  { value: 'optimal', label: 'Optimal (18–27°C)', multiplier: 1.0 },
  { value: 'warm', label: 'Warm (>27°C)', multiplier: 0.85 },
]

const humidityRanges = [
  { value: 'high', label: 'High (>60% RH)', multiplier: 1.5 },
  { value: 'moderate', label: 'Moderate (40–60% RH)', multiplier: 1.0 },
  { value: 'low', label: 'Low (<40% RH)', multiplier: 0.75 },
]

const equipmentOptions = [
  { value: 'none', label: 'No active drying equipment', multiplier: 3.0 },
  { value: 'basic', label: 'Air movers only', multiplier: 1.8 },
  { value: 'standard', label: 'Air movers + dehumidifier', multiplier: 1.0 },
  { value: 'advanced', label: 'Air movers + desiccant dehumidifier', multiplier: 0.7 },
  { value: 'aggressive', label: 'Commercial drying system (LGR desiccant)', multiplier: 0.5 },
]

interface SelectProps {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  icon?: ElementType<{ className?: string }>
  hint?: string
}

function SelectField({ label, value, onChange, options, icon: Icon, hint }: SelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {Icon && <Icon className="inline w-4 h-4 mr-1.5 text-slate-400" />}
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

export default function DryingCalculatorPage() {
  const [material, setMaterial] = useState('drywall_painted')
  const [moistureClass, setMoistureClass] = useState('2')
  const [waterCategory, setWaterCategory] = useState('1')
  const [temperature, setTemperature] = useState('optimal')
  const [humidity, setHumidity] = useState('moderate')
  const [equipment, setEquipment] = useState('standard')
  const [affectedArea, setAffectedArea] = useState('20')

  const result = useMemo(() => {
    const mat = materialTypes.find((m) => m.value === material)!
    const mc = moistureClasses.find((m) => m.value === parseInt(moistureClass))!
    const wc = waterCategories.find((w) => w.value === parseInt(waterCategory))!
    const temp = tempRanges.find((t) => t.value === temperature)!
    const rh = humidityRanges.find((h) => h.value === humidity)!
    const equip = equipmentOptions.find((e) => e.value === equipment)!

    const rawDays =
      mat.baseDays * mc.multiplier * wc.multiplier * temp.multiplier * rh.multiplier * equip.multiplier

    const minDays = Math.max(1, Math.round(rawDays * 0.8))
    const maxDays = Math.round(rawDays * 1.3)

    const area = parseFloat(affectedArea) || 0

    // LGR dehumidifier sizing: ~17L/day per 100m² at optimal conditions (industry standard estimate)
    const dehusNeeded = Math.max(1, Math.ceil((area * 17) / 100 / equip.multiplier))
    // Air movers: 1 per 9–14 m² (industry guideline), approx 1 per 10m²
    const airMoversNeeded = Math.max(1, Math.ceil(area / 10))

    const moistureClassObj = mc
    const isMouldRisk = rawDays > 2 && parseInt(moistureClass) >= 2

    return { minDays, maxDays, dehusNeeded, airMoversNeeded, isMouldRisk, moistureClassObj }
  }, [material, moistureClass, waterCategory, temperature, humidity, equipment, affectedArea])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 rounded-full text-cyan-400 text-sm font-medium mb-6">
            <Calculator className="w-4 h-4" />
            Drying Estimator
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
            Structural Drying Time Calculator
          </h1>
          <p className="text-xl text-slate-300 mb-4 max-w-2xl mx-auto">
            Estimate drying times and equipment needs based on industry standard parameters — for water damage jobs across Australia, New Zealand, and Japan.
          </p>
          <p className="text-sm text-slate-500">
            Field estimation tool only. Always verify with actual moisture readings.
          </p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">

            {/* Input panel */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900 mb-5 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-cyan-500" />
                  Job Parameters
                </h2>

                <div className="space-y-4">
                  <SelectField
                    label="Primary material to dry"
                    value={material}
                    onChange={setMaterial}
                    options={materialTypes}
                    hint="Select the wettest or slowest-drying material in the affected area"
                  />

                  <SelectField
                    label="IICRC Moisture Class"
                    value={moistureClass}
                    onChange={setMoistureClass}
                    options={moistureClasses.map((m) => ({ value: String(m.value), label: m.label }))}
                    hint="Class 2 is the most common residential scenario"
                  />

                  <SelectField
                    label="Water Category"
                    value={waterCategory}
                    onChange={setWaterCategory}
                    options={waterCategories.map((w) => ({ value: String(w.value), label: w.label }))}
                    icon={AlertTriangle}
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Affected floor area (m²)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={2000}
                      value={affectedArea}
                      onChange={(e) => setAffectedArea(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900 mb-5 flex items-center gap-2">
                  <Wind className="w-5 h-5 text-blue-500" />
                  Ambient Conditions &amp; Equipment
                </h2>

                <div className="space-y-4">
                  <SelectField
                    label="Room temperature"
                    value={temperature}
                    onChange={setTemperature}
                    options={tempRanges}
                    icon={Thermometer}
                  />

                  <SelectField
                    label="Ambient relative humidity"
                    value={humidity}
                    onChange={setHumidity}
                    options={humidityRanges}
                    hint="Measure with a thermo-hygrometer before starting"
                  />

                  <SelectField
                    label="Drying equipment deployed"
                    value={equipment}
                    onChange={setEquipment}
                    options={equipmentOptions}
                    icon={Wind}
                  />
                </div>
              </div>
            </div>

            {/* Results panel */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-6 border-2 border-emerald-300 shadow-md sticky top-24">
                <h2 className="text-base font-semibold text-slate-900 mb-5 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-500" />
                  Estimated Results
                </h2>

                {/* Main estimate */}
                <div className="bg-emerald-50 rounded-xl p-5 mb-5 text-center">
                  <div className="text-sm text-emerald-700 font-medium mb-1">Estimated Drying Time</div>
                  <div className="text-5xl font-bold text-emerald-700 mb-1">
                    {result.minDays}–{result.maxDays}
                  </div>
                  <div className="text-emerald-600 font-medium">days</div>
                  <div className="text-xs text-emerald-600/70 mt-2">
                    Based on industry standard parameters · Verify with daily moisture readings
                  </div>
                </div>

                {/* Equipment recommendations */}
                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3">
                    <div>
                      <div className="text-xs text-blue-600 font-medium">Dehumidifiers needed</div>
                      <div className="text-xs text-blue-500">LGR or desiccant recommended</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">{result.dehusNeeded}</div>
                  </div>
                  <div className="flex items-center justify-between bg-purple-50 rounded-lg px-4 py-3">
                    <div>
                      <div className="text-xs text-purple-600 font-medium">Air movers needed</div>
                      <div className="text-xs text-purple-500">1 per ~10 m² (industry standard)</div>
                    </div>
                    <div className="text-2xl font-bold text-purple-700">{result.airMoversNeeded}</div>
                  </div>
                </div>

                {/* Mould risk warning */}
                {result.isMouldRisk && (
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-amber-800">Mould risk — act within 48 hours</div>
                      <div className="text-xs text-amber-700 mt-1">
                        Estimated drying time exceeds 48 hours. Apply antimicrobial treatment and begin containment per recognised industry practice.
                      </div>
                    </div>
                  </div>
                )}

                {/* Industry standard reference */}
                <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 space-y-1">
                  <div className="flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>Results use recognised industry practice as the baseline model.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Verify progress with daily moisture content readings using a calibrated pin or non-invasive meter.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Cat 2 and Cat 3 water requires antimicrobial treatment regardless of drying time.</span>
                  </div>
                </div>
              </div>

              {/* Links to related resources */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Related Resources</h3>
                <div className="space-y-2">
                  {[
                    { href: '/guides/water-damage-restoration-guide', label: 'Water Damage Restoration Guide', colour: 'text-blue-600' },
                    { href: '/learn', label: 'Water Restoration and Structural Drying Training Guide', colour: 'text-purple-600' },
                    { href: '/events', label: 'Find Water Damage Courses Near You', colour: 'text-emerald-600' },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 text-sm font-medium ${link.colour} hover:underline`}
                    >
                      <ArrowRight className="w-4 h-4 flex-shrink-0" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-amber-50 border-t border-amber-200 py-8 px-6">
        <div className="max-w-3xl mx-auto flex items-start gap-3 text-sm text-amber-800">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Disclaimer:</strong> This calculator provides field estimates only. Actual drying times depend on many factors including hidden moisture pockets, building materials, vapour barriers, and equipment performance. Always conduct daily moisture readings and document progress per industry standards. This tool does not replace professional assessment.
          </div>
        </div>
      </section>

      {/* Footer nav */}
      <section className="bg-white border-t border-slate-200 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">More restoration tools</h3>
            <p className="text-sm text-slate-500">Job costing, moisture mapping, and IICRC course finder.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/tools/course-finder"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg transition-colors"
            >
              IICRC Course Finder
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-sm rounded-lg bg-white transition-colors"
            >
              <Layers className="w-4 h-4" />
              All Tools
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
