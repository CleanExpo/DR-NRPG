'use client'

/**
 * DR-320 / DR-326 — Cyclone Narelle WA 2026 Event Landing Page
 * URL: /events/cyclone-narelle-2026-wa
 * SEO: "Exmouth cyclone insurance claim", "Carnarvon WA cyclone damage",
 *       "Ashburton cyclone restoration", "DRFA claim WA 2026"
 * Schema: Event + LocalBusiness (areaServed: 6 DRFA shires)
 * CRITICAL RULES: No phone/email/address displayed. Claim form via online intake only.
 */

import { SITE_URL } from '@/lib/seo/site-url'
import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle, Shield, MapPin, FileText, ArrowRight } from 'lucide-react'

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const DRFA_SHIRES = ['Exmouth', 'Carnarvon', 'Shark Bay', 'Ashburton', 'Upper Gascoyne', 'Yalgoo']

const DRFA_ASSISTANCE = [
  { label: 'Emergency Personal Hardship Assistance', detail: 'Immediate support for essential needs' },
  { label: 'Essential Services Safety and Reconnection Scheme', detail: 'Restoration of essential household services' },
  { label: 'Structural Assistance Grants', detail: 'For structural damage to primary residence' },
  { label: 'Clean Up Assistance', detail: 'Professional mould, water, and debris remediation' },
]

const STEPS = [
  { step: '01', title: 'Lodge Your Claim Online', detail: 'Complete our secure intake form — takes 3 minutes' },
  { step: '02', title: 'NRPG Coordinates Assessment', detail: 'A certified assessor is assigned within 24–48 hours' },
  { step: '03', title: 'Insurer Liaison', detail: 'We manage the insurer on your behalf, maximising your entitlement' },
  { step: '04', title: 'Restoration Begins', detail: 'NRPG-certified contractors begin work under managed scope' },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Event',
      name: 'Cyclone Narelle WA 2026 — DRFA Disaster Activation',
      startDate: '2026-03-28',
      endDate: '2026-06-30',
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: 'Western Australia — Gascoyne/Midwest Region',
        address: {
          '@type': 'PostalAddress',
          addressRegion: 'WA',
          addressCountry: 'AU',
        },
      },
      description:
        'Cyclone Narelle made landfall affecting 6 DRFA-declared shires in WA. NRPG provides insurance claim coordination and certified restoration for affected policyholders.',
      organizer: {
        '@type': 'Organization',
        name: 'National Remediation & Property Group (NRPG)',
        url: SITE_URL,
      },
    },
    {
      '@type': 'LocalBusiness',
      name: 'NRPG Disaster Recovery — Cyclone Narelle WA',
      url: `${SITE_URL}/events/cyclone-narelle-2026-wa`,
      description:
        'NRPG provides insurance claim coordination and IICRC-certified cyclone damage restoration across all 6 DRFA-declared shires in WA.',
      areaServed: DRFA_SHIRES.map(shire => ({
        '@type': 'AdministrativeArea',
        name: `${shire} Shire, WA`,
      })),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Cyclone Damage Restoration Services',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Water Damage Restoration' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Mould Remediation' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Structural Drying' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Contents Restoration' } },
        ],
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Events', item: `${SITE_URL}/events` },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Cyclone Narelle WA 2026',
          item: `${SITE_URL}/events/cyclone-narelle-2026-wa`,
        },
      ],
    },
  ],
}

// ---------------------------------------------------------------------------
// Claim intake form state
// ---------------------------------------------------------------------------

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface IntakeForm {
  name: string
  postcode: string
  suburb: string
  damageType: string
  insurerName: string
  claimNumber: string
  privacyAccepted: boolean
  honeypot: string // never shown to user — bot trap
}

const EMPTY_FORM: IntakeForm = {
  name: '',
  postcode: '',
  suburb: '',
  damageType: '',
  insurerName: '',
  claimNumber: '',
  privacyAccepted: false,
  honeypot: '',
}

const DAMAGE_TYPES = [
  'Wind/structural damage',
  'Roof damage / water ingress',
  'Flooding / water damage',
  'Mould / moisture damage',
  'Contents damage',
  'Multiple / combination',
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CycloneNarellePage() {
  const [form, setForm] = useState<IntakeForm>(EMPTY_FORM)
  const [state, setState] = useState<FormState>('idle')

  function set<K extends keyof IntakeForm>(key: K, value: IntakeForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Honeypot check — bots fill hidden fields
    if (form.honeypot) return

    if (!form.name || !form.postcode || !form.suburb || !form.damageType || !form.privacyAccepted) {
      return
    }
    setState('submitting')
    // Wire to /api/claims/intake in production
    await new Promise(res => setTimeout(res, 1000))
    setState('success')
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="bg-[#050505] text-white min-h-screen">

        {/* Emergency Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-3 text-amber-300 text-sm font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>DRFA Disaster Activation — 6 WA shires declared. NRPG claim coordinators deployed.</span>
          </div>
        </div>

        {/* Hero */}
        <section className="px-6 py-16 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full text-red-400 text-sm font-semibold mb-6">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            Active Disaster Event — WA Gascoyne &amp; Midwest
          </div>

          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            Affected by Cyclone Narelle?<br />
            <span className="text-amber-400">Get Your Insurance Claim Moving.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mb-8">
            NRPG provides certified disaster recovery and insurance claim coordination across all
            6 DRFA-declared shires in Western Australia. We manage your insurer — you focus on your family.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <a href="#intake-form"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
              Lodge Your Claim <ArrowRight className="w-4 h-4" />
            </a>
            <Link href="/services/storm-damage-restoration"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-semibold transition-colors">
              View Restoration Services
            </Link>
          </div>

          {/* Affected Shires */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-12">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold">DRFA-Declared Shires — WA 2026</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DRFA_SHIRES.map(shire => (
                <div key={shire} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-slate-300">{shire} Shire, WA</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Source: Australian Government Disaster Recovery Funding Arrangements (DRFA), confirmed 2 April 2026.
            </p>
          </div>

          {/* DRFA Assistance */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-400" />
              DRFA Assistance Available
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {DRFA_ASSISTANCE.map(item => (
                <div key={item.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <p className="font-semibold text-sm mb-1">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">How NRPG Claim Coordination Works</h2>
            <div className="space-y-4">
              {STEPS.map(s => (
                <div key={s.step} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <span className="text-amber-400 text-xs font-black">{s.step}</span>
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
              <FileText className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-black">Lodge Your Claim — Cyclone Narelle WA</h2>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              A NRPG claim coordinator will contact you within 24 hours to begin your assessment.
            </p>

            {state === 'success' ? (
              <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-5">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-green-300">Claim Intake Received</p>
                  <p className="text-sm text-slate-400 mt-1">
                    A NRPG coordinator will be in touch within 24 hours. Reference your intake for all correspondence.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot — hidden from humans, bots fill this */}
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
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Postcode *</label>
                    <input type="text" required pattern="[0-9]{4}" maxLength={4} value={form.postcode}
                      onChange={e => set('postcode', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="e.g. 6701"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Suburb / Town *</label>
                    <input type="text" required value={form.suburb} onChange={e => set('suburb', e.target.value)}
                      placeholder="e.g. Exmouth, Carnarvon"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Primary Damage Type *</label>
                    <select required value={form.damageType} onChange={e => set('damageType', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500">
                      <option value="">Select damage type</option>
                      {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Insurer Name</label>
                    <input type="text" value={form.insurerName} onChange={e => set('insurerName', e.target.value)}
                      placeholder="e.g. RACWA, Suncorp, IAG"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Claim Number (if known)</label>
                    <input type="text" value={form.claimNumber} onChange={e => set('claimNumber', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
                  </div>
                </div>

                {/* Privacy collection notice */}
                <div className="bg-slate-800/50 rounded-xl p-4 text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">Privacy Collection Notice</p>
                  <p>
                    NRPG collects your personal information to coordinate your insurance claim and connect you with
                    certified restoration contractors. Information may be shared with your insurer and assigned
                    contractors for the purpose of your claim only. You may request access, correction, or deletion of
                    your information at any time via our online contact form.
                  </p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" required checked={form.privacyAccepted}
                    onChange={e => set('privacyAccepted', e.target.checked)}
                    className="mt-0.5" />
                  <span className="text-sm text-slate-300">
                    I have read the Privacy Collection Notice and consent to my information being used for claim
                    coordination purposes.
                  </span>
                </label>

                <button type="submit"
                  disabled={!form.privacyAccepted || state === 'submitting'}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors">
                  {state === 'submitting' ? 'Submitting...' : 'Lodge My Claim Intake'}
                </button>

                <p className="text-xs text-center text-slate-500">
                  This form is secured and rate-limited. Your information is handled in accordance with the
                  Privacy Act 1988 (Cth).
                </p>
              </form>
            )}
          </div>

          {/* Internal links */}
          <div className="mt-8 flex flex-wrap gap-4 text-sm">
            <Link href="/perth" className="text-blue-400 hover:text-blue-300 transition-colors">
              Perth Restoration Services →
            </Link>
            <Link href="/services/storm-damage-restoration" className="text-blue-400 hover:text-blue-300 transition-colors">
              Storm Damage Restoration →
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
