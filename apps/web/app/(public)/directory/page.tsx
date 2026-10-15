'use client'

/**
 * DR-50 — Supplier Directory
 * /directory — industry supplier directory with 8 categories and 4 listing tiers.
 * LocalBusiness JSON-LD on each supplier for SEO.
 */

import { SITE_URL } from '@/lib/seo/site-url'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, MapPin, ExternalLink, Star, Zap, ChevronRight } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Category =
  | 'equipment'
  | 'chemicals'
  | 'insurance-assessors'
  | 'building-inspectors'
  | 'training-providers'
  | 'software'
  | 'vehicle-fleet'
  | 'safety-equipment'

type Tier = 'free' | 'standard' | 'featured' | 'sponsored'
type Country = 'AU' | 'NZ' | 'JP'

interface Supplier {
  id: string
  name: string
  category: Category
  tier: Tier
  description: string
  website: string | null
  phone: string | null
  city: string
  country: Country
  rating: number | null
  specialties: string[]
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const CATEGORY_META: Record<Category, { label: string; icon: string; description: string }> = {
  'equipment':            { label: 'Equipment Suppliers',           icon: '⚙️', description: 'Dehumidifiers, air movers, extractors, moisture meters' },
  'chemicals':            { label: 'Chemical & Product Suppliers',  icon: '🧪', description: 'Antimicrobials, biocides, cleaning products, PPE' },
  'insurance-assessors':  { label: 'Insurance Assessors',           icon: '📋', description: 'Loss adjusters, claim assessors, forensic investigators' },
  'building-inspectors':  { label: 'Building Inspectors',           icon: '🏗️', description: 'Pre/post remediation inspections, hygienists' },
  'training-providers':   { label: 'Training Providers',            icon: '🎓', description: 'IICRC approved schools and registered training organisations' },
  'software':             { label: 'Software Vendors',              icon: '💻', description: 'Job management, CRM, estimating, invoicing platforms' },
  'vehicle-fleet':        { label: 'Vehicle & Fleet Suppliers',     icon: '🚐', description: 'Van fitouts, equipment transport, fleet management' },
  'safety-equipment':     { label: 'Safety Equipment',              icon: '🦺', description: 'PPE, respiratory protection, confined space equipment' },
}

const TIER_CONFIG: Record<Tier, { label: string; colour: string; bg: string; badge: string | null }> = {
  free:      { label: 'Free',      colour: 'text-slate-400',  bg: '',                              badge: null },
  standard:  { label: 'Standard',  colour: 'text-blue-400',   bg: '',                              badge: null },
  featured:  { label: 'Featured',  colour: 'text-yellow-400', bg: 'border-yellow-500/40 bg-yellow-500/5', badge: '⭐ Featured' },
  sponsored: { label: 'Sponsored', colour: 'text-purple-400', bg: 'border-purple-500/40 bg-purple-500/5', badge: '✦ Sponsored' },
}

const SUPPLIERS: Supplier[] = [
  // Equipment — Featured
  { id: 'sup-001', name: 'Drieaz Australia',           category: 'equipment',           tier: 'featured',  description: 'Market leader in LGR dehumidifiers, air movers, and drying technology. Full equipment hire and sales nationally.',                                   website: 'https://drieaz.com.au',      phone: null,           city: 'Sydney',      country: 'AU', rating: 4.8, specialties: ['LGR Dehumidifiers','Air Movers','Moisture Meters'] },
  { id: 'sup-002', name: 'Injectidry Systems',          category: 'equipment',           tier: 'standard',  description: 'Specialist structural drying equipment including floor drying systems and wall cavity drying solutions.',                                          website: 'https://injectidry.com',    phone: null,           city: 'Melbourne',   country: 'AU', rating: 4.5, specialties: ['Floor Drying','Wall Cavity Drying','Structural Systems'] },
  { id: 'sup-003', name: 'Nikro Industries',            category: 'equipment',           tier: 'standard',  description: 'HEPA air scrubbers, negative air machines, and mould remediation equipment.',                                                                     website: null,                         phone: null,           city: 'Brisbane',    country: 'AU', rating: 4.2, specialties: ['HEPA Scrubbers','Negative Air Machines','Mould Equipment'] },
  // Chemicals — Featured
  { id: 'sup-004', name: 'Benefect Australia',          category: 'chemicals',           tier: 'featured',  description: 'IICRC-approved botanical antimicrobials and disinfectants. EPA registered, food-contact safe, no harsh chemicals.',                               website: 'https://benefect.com.au',   phone: null,           city: 'Sydney',      country: 'AU', rating: 4.9, specialties: ['Botanical Antimicrobials','EPA Registered','Food-Safe Disinfection'] },
  { id: 'sup-005', name: 'Sanosil Australia',           category: 'chemicals',           tier: 'standard',  description: 'Hydrogen peroxide based disinfection and mould inhibition products for professional restoration use.',                                             website: null,                         phone: null,           city: 'Melbourne',   country: 'AU', rating: 4.3, specialties: ['H2O2 Disinfection','Mould Inhibition','Odour Elimination'] },
  // Insurance Assessors
  { id: 'sup-006', name: 'McLarens Australia',          category: 'insurance-assessors', tier: 'featured',  description: 'Global loss adjusting firm with specialist property and catastrophe claims teams across Australia and New Zealand.',                                 website: 'https://mclarens.com',      phone: null,           city: 'Sydney',      country: 'AU', rating: 4.1, specialties: ['Property Claims','Catastrophe Response','Water Damage'] },
  { id: 'sup-007', name: 'Sedgwick Australia',          category: 'insurance-assessors', tier: 'standard',  description: 'Technology-enabled claims and risk management. Specialist in property, casualty, and marine losses.',                                              website: 'https://sedgwick.com',      phone: null,           city: 'Melbourne',   country: 'AU', rating: 4.0, specialties: ['Property Claims','Technology Enabled','Risk Management'] },
  // Building Inspectors
  { id: 'sup-008', name: 'ACS Indoor Environmental',   category: 'building-inspectors', tier: 'featured',  description: 'Post-remediation verification, mould assessments, air quality testing, and hygienist reports accepted by all major insurers.',                     website: 'https://acsinspect.com.au', phone: null,           city: 'Brisbane',    country: 'AU', rating: 4.7, specialties: ['Post-Remediation Verification','Air Quality','Hygienist Reports'] },
  { id: 'sup-009', name: 'NZ Indoor Air Quality',      category: 'building-inspectors', tier: 'standard',  description: 'Residential and commercial air quality assessments and mould inspections across New Zealand.',                                                     website: null,                         phone: null,           city: 'Auckland',    country: 'NZ', rating: 4.4, specialties: ['Air Quality','Mould Inspection','Remediation Advice'] },
  // Training Providers
  { id: 'sup-010', name: 'IICRC Australia',             category: 'training-providers',  tier: 'featured',  description: 'Official IICRC registered training organisation. WRT, ASD, AMRT, FSRT, and all other IICRC certifications delivered across Australia.',           website: 'https://iicrc.org',         phone: null,           city: 'National',    country: 'AU', rating: 4.9, specialties: ['WRT','ASD','AMRT','FSRT','OCT','CCT'] },
  { id: 'sup-011', name: 'IICRC New Zealand',           category: 'training-providers',  tier: 'standard',  description: 'IICRC certifications delivered in Auckland, Wellington, and Christchurch. All courses NZQA recognised.',                                          website: 'https://iicrc.org',         phone: null,           city: 'Auckland',    country: 'NZ', rating: 4.8, specialties: ['WRT','ASD','AMRT','IICRC Certified'] },
  // Software
  { id: 'sup-012', name: 'ASCORA',                      category: 'software',            tier: 'featured',  description: 'Purpose-built field service management for restoration contractors. Job scheduling, mobile app, invoicing, and Xero integration.',                website: 'https://ascora.com.au',     phone: null,           city: 'Gold Coast',  country: 'AU', rating: 4.7, specialties: ['Job Management','Scheduling','Mobile App','Xero Integration'] },
  { id: 'sup-013', name: 'Encircle',                    category: 'software',            tier: 'standard',  description: 'Field documentation app for restoration — photo capture, scope generation, and floor plans from mobile.',                                          website: 'https://encircleapp.com',  phone: null,           city: 'Melbourne',   country: 'AU', rating: 4.5, specialties: ['Field Documentation','Photo Capture','Scope Generation','Floor Plans'] },
  // Vehicle
  { id: 'sup-014', name: 'Rapid Response Vehicles AU', category: 'vehicle-fleet',       tier: 'standard',  description: 'Custom van fitouts for restoration contractors. Shelving, racking, secure storage, and branding solutions.',                                      website: null,                         phone: null,           city: 'Sydney',      country: 'AU', rating: 4.2, specialties: ['Van Fitouts','Racking','Branding','Custom Builds'] },
  // Safety
  { id: 'sup-015', name: 'Portwest Australia',          category: 'safety-equipment',    tier: 'standard',  description: 'Full range of PPE for restoration work: respirators, chemical suits, gloves, eye protection, and hi-vis workwear.',                              website: 'https://portwest.com',      phone: null,           city: 'National',    country: 'AU', rating: 4.3, specialties: ['Respirators','Chemical Suits','PPE','Hi-Vis'] },
]

const LISTING_TIERS = [
  { tier: 'Free',                price: '$0/mo',    features: 'Business name · 1 category' },
  { tier: 'Standard',            price: '$49/mo',   features: 'Full profile · Logo · Website link · Multiple categories' },
  { tier: '⭐ Featured',          price: '$149/mo',  features: 'Top of category · Highlighted · Priority search' },
  { tier: '✦ Sponsored Content', price: '$299/post', features: 'Article/case study published on DR blog' },
]

const jsonLdSuppliersSchema = (suppliers: Supplier[]) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Directory', item: `${SITE_URL}/directory` },
      ],
    },
    ...suppliers.filter(s => s.tier === 'featured' || s.tier === 'sponsored').map(s => ({
      '@type': 'LocalBusiness',
      name: s.name,
      description: s.description,
      address: { '@type': 'PostalAddress', addressLocality: s.city, addressCountry: s.country },
      ...(s.website ? { url: s.website } : {}),
      ...(s.rating ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: s.rating, bestRating: 5 } } : {}),
    })),
  ],
})

export default function DirectoryPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [countryFilter, setCountryFilter] = useState<Country | 'all'>('all')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return SUPPLIERS.filter(s =>
      (categoryFilter === 'all' || s.category === categoryFilter) &&
      (countryFilter === 'all' || s.country === countryFilter) &&
      (!q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.specialties.some(sp => sp.toLowerCase().includes(q)))
    ).sort((a, b) => {
      // Featured + sponsored first, then by name
      const tierOrder: Record<Tier, number> = { sponsored: 0, featured: 1, standard: 2, free: 3 }
      return tierOrder[a.tier] - tierOrder[b.tier] || a.name.localeCompare(b.name)
    })
  }, [search, categoryFilter, countryFilter])

  const categoryCounts = useMemo(() =>
    Object.keys(CATEGORY_META).reduce((acc, cat) => {
      acc[cat as Category] = SUPPLIERS.filter(s => s.category === cat as Category).length
      return acc
    }, {} as Record<Category, number>),
    []
  )

  const jsonLd = jsonLdSuppliersSchema(filtered)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="bg-[#050505] text-white min-h-screen">
        {/* Hero */}
        <section className="px-6 py-16 max-w-5xl mx-auto">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-3">Industry Directory</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Supplier Directory</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Trusted suppliers for disaster recovery and restoration contractors across Australia, New Zealand, and Japan.
          </p>
        </section>

        {/* Search + filters */}
        <section className="px-6 pb-8 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search suppliers, products, specialties..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as Category | 'all')}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="all">All Categories</option>
              {(Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META[Category]][]).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label} ({categoryCounts[k]})</option>
              ))}
            </select>
            <select value={countryFilter} onChange={e => setCountryFilter(e.target.value as Country | 'all')}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="all">All Countries</option>
              <option value="AU">🇦🇺 Australia</option>
              <option value="NZ">🇳🇿 New Zealand</option>
              <option value="JP">🇯🇵 Japan</option>
            </select>
          </div>
          <p className="text-sm text-slate-500">{filtered.length} supplier{filtered.length !== 1 ? 's' : ''} found</p>
        </section>

        {/* Category nav */}
        {categoryFilter === 'all' && !search && (
          <section className="px-6 pb-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META[Category]][]).map(([key, meta]) => (
                <button key={key} onClick={() => setCategoryFilter(key)}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-4 text-left transition-colors group">
                  <span className="text-2xl mb-2 block">{meta.icon}</span>
                  <p className="text-sm font-semibold group-hover:text-blue-300 transition-colors">{meta.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{categoryCounts[key]} listed</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Results */}
        <section className="px-6 pb-16 max-w-5xl mx-auto">
          <div className="space-y-4">
            {filtered.map(supplier => {
              const tierCfg = TIER_CONFIG[supplier.tier]
              const catMeta = CATEGORY_META[supplier.category]
              return (
                <div key={supplier.id}
                  className={`border rounded-2xl p-5 transition-colors hover:border-slate-600 ${tierCfg.bg || 'border-slate-800 bg-slate-900'}`}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className="font-bold text-lg">{supplier.name}</h2>
                        {tierCfg.badge && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-black/30 ${tierCfg.colour}`}>
                            {tierCfg.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-2 flex-wrap">
                        <span>{catMeta.icon} {catMeta.label}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {supplier.city}, {supplier.country}
                        </span>
                        {supplier.rating && (
                          <span className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-3 h-3 fill-current" />
                            {supplier.rating}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-300 mb-3">{supplier.description}</p>

                      <div className="flex flex-wrap gap-1.5">
                        {supplier.specialties.map(sp => (
                          <span key={sp} className="text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full text-slate-400">
                            {sp}
                          </span>
                        ))}
                      </div>
                    </div>

                    {supplier.website && (
                      <a href={supplier.website} target="_blank" rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-sm text-blue-300 font-bold transition-colors">
                        Visit
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Listing tiers CTA */}
        <section className="px-6 pb-20 max-w-5xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold">List Your Business</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {LISTING_TIERS.map(t => (
                <div key={t.tier} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <p className="font-bold text-sm mb-1">{t.tier}</p>
                  <p className="text-blue-400 font-black text-xl mb-2">{t.price}</p>
                  <p className="text-xs text-slate-400">{t.features}</p>
                </div>
              ))}
            </div>
            <Link href="/contact"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold transition-colors">
              Get Listed
              <ChevronRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-slate-600 mt-3">
              All listings reviewed before publication. Featured suppliers must hold valid IICRC member or industry body credentials.
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
