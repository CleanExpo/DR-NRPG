'use client'

/**
 * DR-40 — Moisture Reading Interpreter
 * Input moisture meter readings for common building materials
 * and get an instant IICRC-aligned assessment.
 */

import { SITE_URL } from '@/lib/seo/site-url'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Gauge, Plus, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

type Material = 'drywall' | 'timber_hardwood' | 'timber_softwood' | 'concrete' | 'brick' | 'carpet'
type AssessmentLevel = 'dry' | 'caution' | 'wet'

interface Reading {
  id: string
  material: Material
  location: string
  value: number
}

// IICRC S500 / industry benchmark moisture thresholds
const THRESHOLDS: Record<Material, { dry: number; caution: number; label: string }> = {
  drywall: { dry: 1, caution: 2, label: 'Drywall / Plasterboard' },
  timber_hardwood: { dry: 12, caution: 18, label: 'Hardwood Timber' },
  timber_softwood: { dry: 15, caution: 19, label: 'Softwood Timber' },
  concrete: { dry: 4, caution: 6, label: 'Concrete' },
  brick: { dry: 2, caution: 4, label: 'Brick / Masonry' },
  carpet: { dry: 15, caution: 25, label: 'Carpet & Underlay' },
}

const MATERIAL_KEYS = Object.keys(THRESHOLDS) as Material[]

function assessReading(value: number, material: Material): AssessmentLevel {
  const t = THRESHOLDS[material]
  if (value <= t.dry) return 'dry'
  if (value <= t.caution) return 'caution'
  return 'wet'
}

const ASSESSMENT_CONFIG = {
  dry: { colour: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: CheckCircle, label: 'Dry', action: 'Within acceptable range — no drying intervention required.' },
  caution: { colour: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: AlertTriangle, label: 'Caution', action: 'Elevated moisture — monitor and consider targeted drying.' },
  wet: { colour: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: XCircle, label: 'Wet', action: 'Above dry standard — active drying required before reinstatement.' },
}

function uid() { return Math.random().toString(36).slice(2, 9) }

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: `${SITE_URL}/tools` },
        { '@type': 'ListItem', position: 3, name: 'Moisture Reader', item: `${SITE_URL}/tools/moisture-reader` },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Moisture Reading Interpreter',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'AUD' },
      description: 'IICRC S500-aligned moisture reading interpreter for building materials.',
    },
  ],
}

export default function MoistureReaderPage() {
  const [readings, setReadings] = useState<Reading[]>([
    { id: uid(), material: 'drywall', location: 'Feature wall', value: 0 },
  ])

  function addReading() {
    setReadings(prev => [...prev, { id: uid(), material: 'drywall', location: '', value: 0 }])
  }

  function removeReading(id: string) {
    setReadings(prev => prev.filter(r => r.id !== id))
  }

  function updateReading(id: string, patch: Partial<Reading>) {
    setReadings(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))
  }

  const assessments = useMemo(() =>
    readings.map(r => ({ ...r, level: assessReading(r.value, r.material) })),
    [readings]
  )

  const summary = useMemo(() => ({
    dry: assessments.filter(a => a.level === 'dry').length,
    caution: assessments.filter(a => a.level === 'caution').length,
    wet: assessments.filter(a => a.level === 'wet').length,
  }), [assessments])

  const overallStatus: AssessmentLevel = summary.wet > 0 ? 'wet' : summary.caution > 0 ? 'caution' : 'dry'
  const overallCfg = ASSESSMENT_CONFIG[overallStatus]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="bg-[#050505] text-white min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <nav className="text-sm text-slate-500 mb-8 flex gap-2">
            <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-slate-300">Moisture Reader</span>
          </nav>

          <div className="flex items-center gap-3 mb-2">
            <Gauge className="w-7 h-7 text-blue-400" />
            <h1 className="text-3xl font-black">Moisture Reading Interpreter</h1>
          </div>
          <p className="text-slate-400 mb-10">
            Enter moisture meter readings per material. IICRC S500 dry standards applied.
          </p>

          {/* Reference table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Dry Standards Reference</h2>
            <div className="grid grid-cols-[1fr_80px_80px] gap-2 text-xs text-slate-500 uppercase mb-2">
              <span>Material</span>
              <span className="text-center text-green-500">Dry</span>
              <span className="text-center text-yellow-500">Caution</span>
            </div>
            {MATERIAL_KEYS.map(mat => {
              const t = THRESHOLDS[mat]
              return (
                <div key={mat} className="grid grid-cols-[1fr_80px_80px] gap-2 py-1.5 border-t border-slate-800/60 text-sm">
                  <span className="text-slate-300">{t.label}</span>
                  <span className="text-center text-green-400 font-mono">≤{t.dry}%</span>
                  <span className="text-center text-yellow-400 font-mono">≤{t.caution}%</span>
                </div>
              )
            })}
          </div>

          {/* Readings */}
          <div className="space-y-3 mb-4">
            {readings.map((reading, i) => {
              const level = assessReading(reading.value, reading.material)
              const cfg = ASSESSMENT_CONFIG[level]
              const Icon = cfg.icon
              return (
                <div key={reading.id} className={`border rounded-xl p-4 transition-colors ${cfg.bg}`}>
                  <div className="grid grid-cols-[1fr_1fr_110px_40px] gap-3 items-end">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Location</label>
                      <input
                        type="text"
                        value={reading.location}
                        onChange={e => updateReading(reading.id, { location: e.target.value })}
                        placeholder={`Reading ${i + 1}`}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Material</label>
                      <select
                        value={reading.material}
                        onChange={e => updateReading(reading.id, { material: e.target.value as Material })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      >
                        {MATERIAL_KEYS.map(m => (
                          <option key={m} value={m}>{THRESHOLDS[m].label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Reading (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        value={reading.value}
                        onChange={e => updateReading(reading.id, { value: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Icon className={`w-5 h-5 ${cfg.colour}`} />
                      <button
                        onClick={() => removeReading(reading.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors"
                        disabled={readings.length === 1}
                        aria-label="Remove reading"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className={`text-xs mt-2 ${cfg.colour}`}>
                    {cfg.label}: {cfg.action}
                  </p>
                </div>
              )
            })}
          </div>

          <button
            onClick={addReading}
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mb-8"
          >
            <Plus className="w-4 h-4" />
            Add reading
          </button>

          {/* Overall summary */}
          <div className={`border rounded-2xl p-6 ${overallCfg.bg}`}>
            <div className="flex items-center gap-3 mb-4">
              <overallCfg.icon className={`w-7 h-7 ${overallCfg.colour}`} />
              <h2 className="text-xl font-bold">
                Overall Assessment: <span className={overallCfg.colour}>{overallCfg.label}</span>
              </h2>
            </div>
            <div className="flex gap-6 text-sm">
              <span className="text-green-400 font-bold">{summary.dry} Dry</span>
              <span className="text-yellow-400 font-bold">{summary.caution} Caution</span>
              <span className="text-red-400 font-bold">{summary.wet} Wet</span>
            </div>
            <p className="text-sm text-slate-300 mt-3">{overallCfg.action}</p>
          </div>

          <p className="text-xs text-slate-600 mt-4 text-center">
            Reference thresholds from IICRC S500 Standard. Readings are relative moisture content (%).
            Results are indicative only — field conditions and metre calibration affect accuracy.
          </p>
        </div>
      </main>
    </>
  )
}
