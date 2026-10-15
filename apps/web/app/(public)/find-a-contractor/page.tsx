'use client'

import { SITE_URL } from '@/lib/seo/site-url'
import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  MapPin,
  CheckCircle,
  ArrowRight,
  Shield,
  Award,
  Clock,
  Star,
  ChevronDown,
  AlertCircle,
  Droplets,
  Flame,
  Wind,
  Layers,
  ShieldCheck,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type DamageType = 'water' | 'fire' | 'mould' | 'storm' | 'biohazard' | 'other'
type Urgency = 'emergency' | 'today' | 'this-week' | 'planning'

interface SearchState {
  postcode: string
  damageType: DamageType | ''
  urgency: Urgency | ''
}

// ── Seed contractor results (static — wired to RestoreAssist API in DR-74 sprint) ──

interface ContractorResult {
  id: string
  name: string
  location: string
  state: string
  rating: number
  reviewCount: number
  iicrcCerts: string[]
  services: string[]
  responseTime: string
  tier: 'premium' | 'standard'
  verified: boolean
  yearsExperience: number
}

const mockResults: ContractorResult[] = [
  {
    id: 'rapid-dry-vic',
    name: 'Rapid Dry Solutions',
    location: 'Melbourne, VIC',
    state: 'VIC',
    rating: 4.9,
    reviewCount: 41,
    iicrcCerts: ['WRT', 'ASD', 'AMRT'],
    services: ['Water Damage', 'Mould Remediation', 'Structural Drying'],
    responseTime: 'Typically <2 hours',
    tier: 'premium',
    verified: true,
    yearsExperience: 8,
  },
  {
    id: 'proflood-qld',
    name: 'ProFlood Restore QLD',
    location: 'Brisbane, QLD',
    state: 'QLD',
    rating: 4.7,
    reviewCount: 28,
    iicrcCerts: ['WRT', 'FSRT'],
    services: ['Water Damage', 'Fire & Smoke', 'Storm Damage'],
    responseTime: 'Typically <3 hours',
    tier: 'standard',
    verified: true,
    yearsExperience: 6,
  },
  {
    id: 'clean-slate-nsw',
    name: 'Clean Slate Restoration',
    location: 'Sydney, NSW',
    state: 'NSW',
    rating: 4.8,
    reviewCount: 35,
    iicrcCerts: ['WRT', 'ASD', 'AMRT', 'CCT'],
    services: ['Water Damage', 'Mould Remediation', 'Contents Restoration'],
    responseTime: 'Typically <1.5 hours',
    tier: 'premium',
    verified: true,
    yearsExperience: 11,
  },
]

const DAMAGE_TYPES: { id: DamageType; label: string; icon: typeof Droplets }[] = [
  { id: 'water', label: 'Water / Flood Damage', icon: Droplets },
  { id: 'fire', label: 'Fire & Smoke Damage', icon: Flame },
  { id: 'storm', label: 'Storm Damage', icon: Wind },
  { id: 'mould', label: 'Mould Remediation', icon: Layers },
  { id: 'biohazard', label: 'Biohazard / Trauma', icon: ShieldCheck },
  { id: 'other', label: 'Other Restoration', icon: Shield },
]

const URGENCY_OPTIONS: { id: Urgency; label: string; sub: string }[] = [
  { id: 'emergency', label: 'Emergency', sub: 'Right now — active damage' },
  { id: 'today', label: 'Today', sub: 'Within the next few hours' },
  { id: 'this-week', label: 'This Week', sub: 'In the next 1–7 days' },
  { id: 'planning', label: 'Planning', sub: 'No rush — getting quotes' },
]

const trustPoints = [
  { icon: Award, text: 'IICRC-certified contractors only' },
  { icon: Shield, text: 'Public liability insurance verified' },
  { icon: CheckCircle, text: 'Reviewed and approved by NRPG' },
  { icon: Star, text: 'Rated by real property owners' },
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Find a Contractor', item: `${SITE_URL}/find-a-contractor` },
  ],
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FindAContractorPage() {
  const [search, setSearch] = useState<SearchState>({ postcode: '', damageType: '', urgency: '' })
  const [step, setStep] = useState<'search' | 'results'>('search')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ postcode?: string; damageType?: string; urgency?: string }>({})

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const e2: typeof errors = {}
    if (!search.postcode.trim() || !/^\d{4}$/.test(search.postcode.trim()) && !['Auckland', 'Wellington', 'Christchurch', 'Tokyo'].some(c => search.postcode.trim().toLowerCase().includes(c.toLowerCase()))) {
      e2.postcode = 'Please enter a valid postcode or city name.'
    }
    if (!search.damageType) e2.damageType = 'Please select the type of damage.'
    if (!search.urgency) e2.urgency = 'Please select your urgency level.'
    if (Object.keys(e2).length > 0) { setErrors(e2); return }
    setErrors({})
    setSubmitting(true)
    // Handoff to RestoreAssist matching engine — API wired in DR-74 backend sprint
    await new Promise(r => setTimeout(r, 1000))
    setSubmitting(false)
    setStep('results')
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            IICRC-Certified Contractors — AU, NZ & Japan
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
            Find a Restoration Contractor
          </h1>
          <p className="text-xl text-slate-300 mb-4 max-w-2xl mx-auto">
            Connect with verified, IICRC-certified restoration professionals across Australia, New Zealand, and Japan.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            {trustPoints.map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5">
                <Icon className="w-4 h-4 text-emerald-400" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Search form */}
      {step === 'search' && (
        <section className="bg-slate-50 py-16 px-6">
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Find contractors near you</h2>
              <p className="text-sm text-slate-500 mb-6">We&apos;ll match you with verified contractors available in your area.</p>

              <form onSubmit={handleSearch} className="space-y-5">
                {/* Postcode */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Your postcode or suburb *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={search.postcode}
                      onChange={e => { setSearch(s => ({ ...s, postcode: e.target.value })); setErrors(er => ({ ...er, postcode: undefined })) }}
                      placeholder="e.g. 3000, Sydney, Auckland..."
                      className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                        errors.postcode ? 'border-red-400 bg-red-50' : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                      }`}
                    />
                  </div>
                  {errors.postcode && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />{errors.postcode}
                    </p>
                  )}
                </div>

                {/* Damage type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type of damage *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DAMAGE_TYPES.map(({ id, label, icon: Icon }) => {
                      const active = search.damageType === id
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => { setSearch(s => ({ ...s, damageType: id })); setErrors(er => ({ ...er, damageType: undefined })) }}
                          className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-colors ${
                            active ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-300'
                          }`}
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span className={`text-xs font-medium ${active ? 'text-emerald-900' : 'text-slate-700'}`}>{label}</span>
                        </button>
                      )
                    })}
                  </div>
                  {errors.damageType && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />{errors.damageType}
                    </p>
                  )}
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">How urgent is this? *</label>
                  <div className="space-y-2">
                    {URGENCY_OPTIONS.map(({ id, label, sub }) => {
                      const active = search.urgency === id
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => { setSearch(s => ({ ...s, urgency: id })); setErrors(er => ({ ...er, urgency: undefined })) }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-colors ${
                            active ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            active ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                          }`}>
                            {active && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${active ? 'text-emerald-900' : 'text-slate-800'}`}>{label}</p>
                            <p className="text-xs text-slate-500">{sub}</p>
                          </div>
                          {id === 'emergency' && (
                            <span className="ml-auto text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">24/7</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  {errors.urgency && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />{errors.urgency}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl transition-colors"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Finding contractors...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Find Available Contractors
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Trust signals */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { icon: Clock, text: 'Contractors respond within 2 hours on average' },
                { icon: Shield, text: 'All contractors carry $10M+ public liability' },
                { icon: Award, text: 'IICRC-certified techs only — no unlicensed operators' },
                { icon: Star, text: 'Rated 4.7 / 5 by property owners across AU, NZ & JP' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2 p-3 bg-white rounded-lg border border-slate-200">
                  <Icon className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {step === 'results' && (
        <section className="bg-slate-50 py-12 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Available Contractors</h2>
                <p className="text-sm text-slate-500">
                  {mockResults.length} verified contractors near {search.postcode} for {search.damageType ? DAMAGE_TYPES.find(d => d.id === search.damageType)?.label : 'your job'}
                </p>
              </div>
              <button
                onClick={() => setStep('search')}
                className="text-sm text-slate-500 hover:text-slate-700 underline"
              >
                ← Edit search
              </button>
            </div>

            {search.urgency === 'emergency' && (
              <div className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Emergency response active</p>
                  <p className="text-xs text-red-700 mt-0.5">
                    Contractors below are available now. If you have a safety emergency, contact emergency services (000 AU / 111 NZ / 110 JP) first.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {mockResults.map((contractor, i) => (
                <div
                  key={contractor.id}
                  className={`bg-white rounded-xl border p-5 transition-shadow hover:shadow-md ${
                    contractor.tier === 'premium' ? 'border-amber-200' : 'border-slate-200'
                  }`}
                >
                  {contractor.tier === 'premium' && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Featured</span>
                      {i === 0 && <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Best Match</span>}
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{contractor.name}</h3>
                        {contractor.verified && (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5" />Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        {contractor.location}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {contractor.iicrcCerts.map(cert => (
                          <span key={cert} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">{cert}</span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400" />
                          {contractor.rating} ({contractor.reviewCount} reviews)
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {contractor.responseTime}
                        </span>
                        <span>{contractor.yearsExperience}+ years experience</span>
                      </div>
                    </div>
                    <Link
                      href={`/directory#${contractor.id}`}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      View Profile
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-white rounded-xl border border-slate-200 text-center">
              <p className="text-sm text-slate-600 mb-3">
                Want to compare more contractors or see your full options?
              </p>
              <Link
                href="/directory"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Browse Full Directory
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* For contractors CTA */}
      <section className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Are you a restoration contractor?</h3>
            <p className="text-sm text-slate-500">
              Join the NRPG network to receive job referrals and appear in contractor search results.
            </p>
          </div>
          <Link
            href="/industry-partners/join"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg transition-colors"
          >
            Register Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
