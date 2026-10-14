'use client'

import { SITE_URL } from '@/lib/seo/site-url'
import { useState, useMemo } from 'react'
import { Camera, Upload, Star, CheckCircle, Filter, ArrowRight, Globe } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type ProjectCategory = 'all' | 'water' | 'mould' | 'fire' | 'carpet' | 'storm' | 'commercial'
type Region = 'all' | 'au' | 'nz' | 'jp'

interface Project {
  id: string
  title: string
  category: Exclude<ProjectCategory, 'all'>
  region: Exclude<Region, 'all'>
  company: string
  technician: string
  description: string
  result: string
  certUsed: string
  duration: string
  gradientFrom: string
  gradientTo: string
  featured: boolean
  votes: number
  submittedDate: string
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Class 3 structural drying — 280 m² Brisbane residential',
    category: 'water',
    region: 'au',
    company: 'Rapid Dry Solutions',
    technician: 'Jake M.',
    description: 'Burst pipe in ceiling cavity affecting three bedrooms, lounge, and hallway. Category 1, Class 3 event. Full structural drying with 8 dehumidifiers and 24 air movers over 4 days.',
    result: 'Full structural dry achieved, Cat 1 moisture clearance, no secondary mould growth.',
    certUsed: 'WRT, ASD',
    duration: '4 days',
    gradientFrom: 'from-blue-700',
    gradientTo: 'to-blue-500',
    featured: true,
    votes: 47,
    submittedDate: '15 Mar 2026',
  },
  {
    id: '2',
    title: 'Post-flood mould remediation — Auckland townhouse',
    category: 'mould',
    region: 'nz',
    company: 'NZ FloodTech',
    technician: 'Sarah K.',
    description: 'Cyclone Gabrielle aftermath — townhouse with 6-week undetected moisture ingress. S520 remediation protocol applied, full containment, HEPA filtration, antimicrobial treatment throughout.',
    result: 'IICRC S520 clearance testing passed, air quality certificate issued.',
    certUsed: 'AMRT, WRT',
    duration: '8 days',
    gradientFrom: 'from-emerald-700',
    gradientTo: 'to-emerald-500',
    featured: true,
    votes: 38,
    submittedDate: '10 Mar 2026',
  },
  {
    id: '3',
    title: 'Commercial fire restoration — 3-storey Tokyo office',
    category: 'fire',
    region: 'jp',
    company: 'Nihon Restore Co.',
    technician: 'Hiroshi T.',
    description: 'Electrical fire in server room spread smoke through HVAC to two upper floors. Full pack-out, structural cleaning, ozone treatment, and HVAC decontamination.',
    result: 'All surfaces certified smoke-free, HVAC cleared, office operational within 12 days.',
    certUsed: 'FSRT, AMRT',
    duration: '12 days',
    gradientFrom: 'from-orange-700',
    gradientTo: 'to-orange-500',
    featured: false,
    votes: 29,
    submittedDate: '5 Mar 2026',
  },
  {
    id: '4',
    title: 'Storm water ingress — Queenstown ski lodge',
    category: 'storm',
    region: 'nz',
    company: 'Alpine Dry NZ',
    technician: 'Brendan O.',
    description: 'Severe alpine storm caused roof and wall ingress across 6 guest rooms. Emergency response within 4 hours, full structural dry and mould prevention treatment.',
    result: 'All rooms dried and cleared within 6 days, lodge reopened ahead of ski season.',
    certUsed: 'WRT',
    duration: '6 days',
    gradientFrom: 'from-sky-700',
    gradientTo: 'to-sky-500',
    featured: false,
    votes: 22,
    submittedDate: '28 Feb 2026',
  },
  {
    id: '5',
    title: 'Carpet restoration — 1,200 m² Melbourne office flood',
    category: 'carpet',
    region: 'au',
    company: 'FloorCare Pro',
    technician: 'David H.',
    description: 'Building sprinkler malfunction discharged for 40 minutes across open-plan office. Emergency extraction and structural drying of 1,200 m² carpet and subfloor.',
    result: 'Carpet salvaged, subfloor dried to equilibrium MC, no replacement required — saving $85,000.',
    certUsed: 'OCT, WRT',
    duration: '5 days',
    gradientFrom: 'from-purple-700',
    gradientTo: 'to-purple-500',
    featured: false,
    votes: 31,
    submittedDate: '20 Feb 2026',
  },
  {
    id: '6',
    title: 'Biohazard Category 3 sewage — Sydney apartment',
    category: 'water',
    region: 'au',
    company: 'CleanSafe Sydney',
    technician: 'Maria P.',
    description: 'Blocked sewer caused Category 3 overflow into bathroom, hallway, and bedroom. Full PPE, biocide application, hard floor and wall remediation, air scrubbing.',
    result: 'All surfaces cleared, apartment certified safe for re-occupation.',
    certUsed: 'WRT, AMRT',
    duration: '3 days',
    gradientFrom: 'from-rose-700',
    gradientTo: 'to-rose-500',
    featured: false,
    votes: 19,
    submittedDate: '12 Feb 2026',
  },
]

const CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: 'all', label: 'All categories' },
  { value: 'water', label: 'Water / Flood' },
  { value: 'mould', label: 'Mould' },
  { value: 'fire', label: 'Fire & Smoke' },
  { value: 'carpet', label: 'Carpet' },
  { value: 'storm', label: 'Storm' },
  { value: 'commercial', label: 'Commercial' },
]

const REGIONS: { value: Region; label: string }[] = [
  { value: 'all', label: 'All regions' },
  { value: 'au', label: 'Australia' },
  { value: 'nz', label: 'New Zealand' },
  { value: 'jp', label: 'Japan' },
]

const REGION_LABELS: Record<Exclude<Region, 'all'>, string> = {
  au: 'AU',
  nz: 'NZ',
  jp: 'JP',
}

// ── JSON-LD ───────────────────────────────────────────────────────────────────

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Community', item: `${SITE_URL}/social` },
        { '@type': 'ListItem', position: 3, name: 'Project Showcase', item: `${SITE_URL}/social/showcase` },
      ],
    },
    {
      '@type': 'ItemList',
      name: 'Restoration Project Showcase — AU, NZ & Japan',
      numberOfItems: PROJECTS.length,
      itemListElement: PROJECTS.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.title,
      })),
    },
  ],
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ShowcasePage() {
  const [category, setCategory] = useState<ProjectCategory>('all')
  const [region, setRegion] = useState<Region>('all')
  const [showSubmit, setShowSubmit] = useState(false)

  const filtered = useMemo(() => {
    return PROJECTS.filter(p => {
      if (category !== 'all' && p.category !== category) return false
      if (region !== 'all' && p.region !== region) return false
      return true
    })
  }, [category, region])

  const featured = useMemo(() => PROJECTS.filter(p => p.featured), [])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-slate-50">
        {/* ── Header ─────────────────────────────────────────────── */}
        <section className="bg-white border-b border-slate-200 py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <nav className="text-sm text-slate-500 mb-4">
              <a href="/" className="hover:text-emerald-600">Home</a>
              <span className="mx-2">/</span>
              <a href="/social" className="hover:text-emerald-600">Community</a>
              <span className="mx-2">/</span>
              <span className="text-slate-800">Project Showcase</span>
            </nav>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Project Showcase</h1>
                  <p className="mt-1 text-slate-600 max-w-xl">
                    Before/after work from certified restoration professionals across Australia, New Zealand, and Japan.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSubmit(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                <Upload className="w-4 h-4" />
                Submit your project
              </button>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
          {/* ── Featured ───────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Star className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">Featured projects this month</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {featured.map(proj => (
                <div key={proj.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className={`h-44 bg-gradient-to-br ${proj.gradientFrom} ${proj.gradientTo} relative`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera className="w-10 h-10 text-white/30" />
                    </div>
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3" /> Featured
                    </div>
                    <div className="absolute top-3 right-3 bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {REGION_LABELS[proj.region]}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">{proj.category}</span>
                      <span className="text-xs text-slate-400">{proj.votes} votes</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">{proj.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{proj.company} · {proj.technician}</p>
                    <p className="mt-3 text-sm text-slate-600">{proj.description}</p>
                    <div className="mt-3 flex items-start gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-sm font-medium text-slate-800">{proj.result}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                      <span>Certs: <span className="font-medium text-slate-700">{proj.certUsed}</span></span>
                      <span>·</span>
                      <span>Duration: <span className="font-medium text-slate-700">{proj.duration}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Filters + grid ────────────────────────────────── */}
          <section>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Filter className="w-4 h-4" /> Filter:
              </div>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProjectCategory)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <select
                value={region}
                onChange={e => setRegion(e.target.value as Region)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {REGIONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <span className="text-sm text-slate-500">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Camera className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No projects match the current filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(proj => (
                  <div key={proj.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-emerald-200 hover:shadow-sm transition-all">
                    <div className={`h-32 bg-gradient-to-br ${proj.gradientFrom} ${proj.gradientTo} relative`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white/30" />
                      </div>
                      <div className="absolute top-2 right-2 bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Globe className="w-3 h-3" />{REGION_LABELS[proj.region]}
                      </div>
                    </div>
                    <div className="p-4">
                      <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">{proj.category}</span>
                      <h3 className="mt-1 text-sm font-semibold text-slate-900 leading-tight">{proj.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{proj.company}</p>
                      <p className="mt-2 text-xs text-slate-600 line-clamp-2">{proj.description}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                        <span>{proj.duration} · {proj.certUsed}</span>
                        <span>{proj.votes} votes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── CTA to submit ──────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-dashed border-emerald-300 p-8 text-center">
            <Camera className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Share your best work</h3>
            <p className="text-sm text-slate-600 mb-5 max-w-md mx-auto">
              Submit your before/after project photos to be featured in the DR Project Showcase.
              Open to all certified professionals across AU, NZ, and Japan.
            </p>
            <button
              onClick={() => setShowSubmit(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              <Upload className="w-4 h-4" />
              Submit a project
            </button>
          </section>
        </div>

        {/* ── Submit modal ──────────────────────────────────────── */}
        {showSubmit && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Submit a project</h2>
              <p className="text-sm text-slate-600 mb-5">
                Project submissions are currently reviewed manually. Please send your before/after
                photos, project description, and company details via the contact form and select
                &quot;Project Showcase&quot; as the subject.
              </p>
              <div className="flex gap-3">
                <a
                  href="/contact"
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Go to contact form <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setShowSubmit(false)}
                  className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
