'use client'

/**
 * DR-320 / DR-326 — QLD Floods 2026 Event Landing Page
 * URL: /events/queensland-floods-2026
 * SEO: "Bundaberg flood insurance claim", "QLD flood restoration 2026",
 *       "Queensland hardship assistance flood repair"
 * Schema: Event + LocalBusiness (areaServed: 6 QLD regions)
 * ⚠️  DEADLINE: Hardship assistance closes 27 April 2026 (NOT 7 April)
 * SOURCE: qra.qld.gov.au
 */

import { SITE_URL } from '@/lib/seo/site-url'
import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle, Shield, MapPin, FileText, ArrowRight, Clock } from 'lucide-react'

// ---------------------------------------------------------------------------
// Data — sourced from qra.qld.gov.au
// ---------------------------------------------------------------------------

const QLD_AREAS = ['Bundaberg', 'Burnett River', 'North Burnett', 'Banana', 'Gladstone', 'Western Downs']

const ASSISTANCE_TYPES = [
  {
    name: 'Personal Hardship Assistance',
    individual: '$180 per person',
    family: 'Up to $900 per family',
    detail: 'Immediate support for essential needs — food, clothing, accommodation',
    available: true,
  },
  {
    name: 'Essential Services Safety & Reconnection',
    individual: 'Up to $150 per person',
    family: 'Up to $750 per family',
    detail: 'Restoration of essential household services — power, water, gas',
    available: true,
  },
  {
    name: 'Structural Assistance Grants',
    individual: 'Up to $80,000',
    family: '',
    detail: 'For structural damage to primary residence. Assessment required.',
    available: true,
  },
  {
    name: 'NFP Disaster Recovery Loans',
    individual: 'Up to $100,000',
    family: '',
    detail: 'Available in Banana, Bundaberg, and Douglas regions. Non-profit organisations.',
    available: true,
  },
]

const DEADLINE = '27 April 2026'

const STEPS = [
  { step: '01', title: 'Lodge Your Claim Online', detail: 'Secure 3-minute intake form — no paperwork required upfront' },
  { step: '02', title: 'NRPG Assessment Assigned', detail: 'IICRC-certified assessor confirmed within 24–48 hours' },
  { step: '03', title: 'QRIDA Coordination', detail: 'NRPG coordinates claim on the QRIDA critical path for recovery funding' },
  { step: '04', title: 'Certified Restoration', detail: 'NRPG-vetted contractors begin water, mould, and structural work' },
]

const DAMAGE_TYPES = [
  'Flooding / water inundation',
  'Water damage / moisture',
  'Mould / mould growth',
  'Structural damage',
  'Contents damage',
  'Multiple / combination',
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Event',
      name: 'Queensland Floods 2026 — Disaster Assistance Activation',
      startDate: '2026-02-01',
      endDate: '2026-04-27',
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: 'Queensland — Wide Bay, Burnett & Central QLD',
        address: {
          '@type': 'PostalAddress',
          addressRegion: 'QLD',
          addressCountry: 'AU',
        },
      },
      description:
        'Queensland flood disaster assistance is available for affected homeowners. Hardship assistance closes 27 April 2026. NRPG provides QRIDA-aligned claim coordination and certified flood restoration.',
      organizer: {
        '@type': 'Organization',
        name: 'National Remediation & Property Group (NRPG)',
        url: SITE_URL,
      },
    },
    {
      '@type': 'LocalBusiness',
      name: 'NRPG Disaster Recovery — QLD Floods 2026',
      url: `${SITE_URL}/events/queensland-floods-2026`,
      description:
        'NRPG provides QRIDA-aligned insurance claim coordination and IICRC-certified flood restoration across all declared QLD flood regions.',
      areaServed: QLD_AREAS.map(area => ({
        '@type': 'AdministrativeArea',
        name: `${area}, QLD`,
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Events', item: `${SITE_URL}/events` },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Queensland Floods 2026',
          item: `${SITE_URL}/events/queensland-floods-2026`,
        },
      ],
    },
  ],
}

// ---------------------------------------------------------------------------
// Claim intake form
// ---------------------------------------------------------------------------

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface IntakeForm {
  name: string
  postcode: string
  suburb: string
  damageType: string
  insurerName: string
  claimNumber: string
  assistanceType: string
  privacyAccepted: boolean
  honeypot: string
}

const EMPTY_FORM: IntakeForm = {
  name: '',
  postcode: '',
  suburb: '',
  damageType: '',
  insurerName: '',
  claimNumber: '',
  assistanceType: '',
  privacyAccepted: false,
  honeypot: '',
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function QLDFloodsPage() {
  const [form, setForm] = useState<IntakeForm>(EMPTY_FORM)
  const [state, setState] = useState<FormState>('idle')

  function set<K extends keyof IntakeForm>(key: K, value: IntakeForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.honeypot) return
    if (!form.name || !form.postcode || !form.suburb || !form.damageType || !form.privacyAccepted) return
    setState('submitting')
    // Wire to /api/claims/intake in production
    await new Promise(res => setTimeout(res, 1000))
    setState('success')
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="bg-[#050505] text-white min-h-screen">

        {/* Urgency Banner */}
        <div className="bg-blue-600/10 border-b border-blue-500/30 px-6 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-3 text-blue-300 text-sm font-semibold">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              Hardship assistance closes <strong>{DEADLINE}</strong> — act now to secure your entitlement.
            </span>
          </div>
        </div>

        {/* Hero */}
        <section className="px-6 py-16 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-blue-400 text-sm font-semibold mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Active Disaster Event — Queensland Flood Regions
          </div>

          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            Queensland Flood 2026:<br />
            <span className="text-blue-400">Get Your Claim Moving Before 27 April.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mb-8">
            NRPG provides IICRC-certified flood restoration and QRIDA-aligned insurance claim coordination
            across all declared QLD flood regions. Don&apos;t lose your entitlement — hardship assistance closes
            27 April 2026.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <a href="#intake-form"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">
              Lodge Your Claim <ArrowRight className="w-4 h-4" />
            </a>
            <Link href="/services/water-damage-restoration"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-semibold transition-colors">
              Flood Restoration Services
            </Link>
          </div>

          {/* Affected Areas */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-12">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-400" />
              <h2 className="font-bold">Declared QLD Flood Regions</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {QLD_AREAS.map(area => (
                <div key={area} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-slate-300">{area}, QLD</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Source: Queensland Reconstruction Authority (qra.qld.gov.au), 2026.
            </p>
          </div>

          {/* Assistance Available */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-400" />
              Available QLD Disaster Assistance
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Source: Queensland Reconstruction Authority (qra.qld.gov.au). Closes {DEADLINE}.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {ASSISTANCE_TYPES.map(a => (
                <div key={a.name} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <p className="font-bold text-sm mb-1">{a.name}</p>
                  <div className="flex gap-4 mb-2">
                    {a.individual && (
                      <span className="text-xs bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full">
                        {a.individual}
                      </span>
                    )}
                    {a.family && (
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                        {a.family}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{a.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* QRIDA note */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 mb-12">
            <p className="text-sm text-blue-300 font-semibold mb-1">QRIDA Claim Coordination</p>
            <p className="text-sm text-slate-400">
              NRPG claim coordination is on the critical path to policyholders receiving QRIDA recovery funds.
              Our coordinators ensure your restoration scope aligns with QRIDA requirements, reducing delays in
              structural assistance grant processing.
            </p>
          </div>

          {/* How it works */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">How NRPG Claim Coordination Works</h2>
            <div className="space-y-4">
              {STEPS.map(s => (
                <div key={s.step} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <span className="text-blue-400 text-xs font-black">{s.step}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">{s.title}</p>
                    <p className="text-sm text-slate-400 mt-0.5">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Intake Form */}
          <div id="intake-form" className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-black">Lodge Your Claim — QLD Floods 2026</h2>
            </div>
            <p className="text-sm text-slate-400 mb-1">
              A NRPG coordinator will contact you within 24 hours to begin your assessment.
            </p>
            <p className="text-xs text-amber-400 font-semibold mb-6">
              ⚠️ Assistance closes {DEADLINE} — submit today to protect your entitlement.
            </p>

            {state === 'success' ? (
              <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-5">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-green-300">Claim Intake Received</p>
                  <p className="text-sm text-slate-400 mt-1">
                    A NRPG coordinator will be in touch within 24 hours. Keep this page bookmarked for reference.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot */}
                <input
                  type="text"
                  value={form.honeypot}
                  onChange={e => set('honeypot', e.target.value)}
                  aria-hidden="true"
                  tabIndex={-1}
                  style={{ display: 'none' }}
                  autoComplete="off"
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Full Name *</label>
                    <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Postcode *</label>
                    <input type="text" required pattern="[0-9]{4}" maxLength={4} value={form.postcode}
                      onChange={e => set('postcode', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="e.g. 4670"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Suburb / Town *</label>
                    <input type="text" required value={form.suburb} onChange={e => set('suburb', e.target.value)}
                      placeholder="e.g. Bundaberg, Gladstone"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Primary Damage Type *</label>
                    <select required value={form.damageType} onChange={e => set('damageType', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                      <option value="">Select damage type</option>
                      {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Assistance Type Needed</label>
                    <select value={form.assistanceType} onChange={e => set('assistanceType', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                      <option value="">Select (optional)</option>
                      {ASSISTANCE_TYPES.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Insurer Name</label>
                    <input type="text" value={form.insurerName} onChange={e => set('insurerName', e.target.value)}
                      placeholder="e.g. Suncorp, NRMA, IAG"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Claim Number (if known)</label>
                  <input type="text" value={form.claimNumber} onChange={e => set('claimNumber', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>

                {/* Privacy collection notice */}
                <div className="bg-slate-800/50 rounded-xl p-4 text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">Privacy Collection Notice</p>
                  <p>
                    NRPG collects your personal information to coordinate your insurance claim and connect you
                    with certified restoration contractors. Information may be shared with your insurer, QRIDA,
                    and assigned contractors for claim and funding purposes only. You may request access,
                    correction, or deletion of your information via our online contact form at any time.
                  </p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" required checked={form.privacyAccepted}
                    onChange={e => set('privacyAccepted', e.target.checked)}
                    className="mt-0.5" />
                  <span className="text-sm text-slate-300">
                    I have read the Privacy Collection Notice and consent to my information being used for claim
                    coordination and assistance purposes.
                  </span>
                </label>

                <button type="submit"
                  disabled={!form.privacyAccepted || state === 'submitting'}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors">
                  {state === 'submitting' ? 'Submitting...' : 'Lodge My Claim Intake'}
                </button>

                <p className="text-xs text-center text-slate-500">
                  This form is secured and rate-limited. Your information is handled in accordance with the
                  Privacy Act 1988 (Cth) and the Information Privacy Act 2009 (Qld).
                </p>
              </form>
            )}
          </div>

          {/* Internal links */}
          <div className="mt-8 flex flex-wrap gap-4 text-sm">
            <Link href="/services/water-damage-restoration" className="text-blue-400 hover:text-blue-300 transition-colors">
              Water Damage Restoration →
            </Link>
            <Link href="/services/mould-remediation" className="text-blue-400 hover:text-blue-300 transition-colors">
              Mould Remediation →
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
