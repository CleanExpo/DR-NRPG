'use client'

import { SITE_URL } from '@/lib/seo/site-url'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Clock, Award, Search, Filter, ArrowRight, ChevronDown, Plus } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type EventCategory = 'iicrc-training' | 'conference' | 'trade-show' | 'networking' | 'seminar' | 'supplier-day' | 'webinar'
type EventFormat = 'in-person' | 'online' | 'hybrid'

interface CalendarEvent {
  id: string
  title: string
  organiser: string
  category: EventCategory
  format: EventFormat
  startDate: string
  endDate: string
  location: string
  state: string
  country: 'AU' | 'NZ' | 'JP'
  iicrcCert?: string
  cecCredits?: number
  price: string
  featured: boolean
  description: string
}

// ── Seed events ───────────────────────────────────────────────────────────────

const events: CalendarEvent[] = [
  {
    id: 'wrt-asd-bris-may25',
    title: 'IICRC WRT & ASD Combo — Brisbane',
    organiser: 'Total Flood Restore',
    category: 'iicrc-training',
    format: 'in-person',
    startDate: '2025-05-12',
    endDate: '2025-05-16',
    location: 'Brisbane, QLD',
    state: 'QLD',
    country: 'AU',
    iicrcCert: 'WRT + ASD',
    cecCredits: 14,
    price: '$2,400',
    featured: true,
    description: '5-day combo covering Water Restoration Technician and Applied Structural Drying. IICRC-approved instructor. Max 14 students.',
  },
  {
    id: 'amrt-syd-may25',
    title: 'IICRC AMRT — Applied Microbial Remediation Technician',
    organiser: 'CleanAir Training',
    category: 'iicrc-training',
    format: 'in-person',
    startDate: '2025-05-19',
    endDate: '2025-05-22',
    location: 'Sydney, NSW',
    state: 'NSW',
    country: 'AU',
    iicrcCert: 'AMRT',
    cecCredits: 12,
    price: '$1,950',
    featured: true,
    description: 'IICRC Applied Microbial Remediation Technician certification. Covers mould assessment, containment, and S520 protocols.',
  },
  {
    id: 'mould-workshop-tokyo-may25',
    title: 'Mould Remediation Workshop — Tokyo',
    organiser: 'Japan Resto Pro',
    category: 'iicrc-training',
    format: 'in-person',
    startDate: '2025-05-24',
    endDate: '2025-05-25',
    location: 'Tokyo',
    state: 'Tokyo',
    country: 'JP',
    iicrcCert: 'AMRT',
    cecCredits: 8,
    price: '¥85,000',
    featured: false,
    description: 'Two-day AMRT preparation workshop with Japanese-language support. IICRC S520, mould sampling, containment, and remediation protocols.',
  },
  {
    id: 'fsrt-mel-jun25',
    title: 'IICRC FSRT — Fire & Smoke Restoration Technician',
    organiser: 'ProRestore VIC',
    category: 'iicrc-training',
    format: 'in-person',
    startDate: '2025-06-09',
    endDate: '2025-06-11',
    location: 'Melbourne, VIC',
    state: 'VIC',
    country: 'AU',
    iicrcCert: 'FSRT',
    cecCredits: 10,
    price: '$1,750',
    featured: false,
    description: 'IICRC Fire & Smoke Restoration Technician certification. Covers soot types, deodorisation, contents pack-out, and IICRC FSRT standards.',
  },
  {
    id: 'airc-forum-syd-jun25',
    title: 'AU Restoration Industry Forum 2025',
    organiser: 'AIRC',
    category: 'conference',
    format: 'in-person',
    startDate: '2025-06-18',
    endDate: '2025-06-19',
    location: 'Sydney, NSW',
    state: 'NSW',
    country: 'AU',
    price: '$750',
    featured: true,
    description: 'Annual industry conference for restoration professionals. Keynote speakers, insurer roundtables, technical workshops, and networking dinner.',
  },
  {
    id: 'wrt-auckland-jul25',
    title: 'IICRC WRT — Water Restoration Technician',
    organiser: 'Restore NZ',
    category: 'iicrc-training',
    format: 'in-person',
    startDate: '2025-07-07',
    endDate: '2025-07-09',
    location: 'Auckland',
    state: 'Auckland',
    country: 'NZ',
    iicrcCert: 'WRT',
    cecCredits: 10,
    price: 'NZD $1,800',
    featured: false,
    description: 'IICRC Water Restoration Technician course in Auckland. Foundation certification for water damage professionals.',
  },
  {
    id: 'insurance-claims-webinar-jul25',
    title: 'Navigating Insurer Scopes: What Changed in 2025',
    organiser: 'NRPG',
    category: 'webinar',
    format: 'online',
    startDate: '2025-07-15',
    endDate: '2025-07-15',
    location: 'Online',
    state: 'Online',
    country: 'AU',
    price: 'Free for NRPG members',
    featured: false,
    description: 'Live webinar covering the 2025 insurer documentation requirements, scope of works changes, and AFCA complaint trends. Q&A included.',
  },
  {
    id: 'restoration-expo-mel-aug25',
    title: 'Restoration & Cleaning Industry Expo — Melbourne',
    organiser: 'Cleaning World',
    category: 'trade-show',
    format: 'in-person',
    startDate: '2025-08-14',
    endDate: '2025-08-15',
    location: 'Melbourne Convention Centre, VIC',
    state: 'VIC',
    country: 'AU',
    price: 'Free (registration required)',
    featured: true,
    description: 'Australia\'s largest restoration and cleaning industry trade show. Equipment demonstrations, supplier stands, and CE sessions.',
  },
  {
    id: 'asd-bsrt-perth-aug25',
    title: 'IICRC ASD & BSRT Combo — Perth',
    organiser: 'WA Restore',
    category: 'iicrc-training',
    format: 'in-person',
    startDate: '2025-08-18',
    endDate: '2025-08-22',
    location: 'Perth, WA',
    state: 'WA',
    country: 'AU',
    iicrcCert: 'ASD + BSRT',
    cecCredits: 14,
    price: '$2,250',
    featured: false,
    description: 'Combined Applied Structural Drying and Building Science for the Restoration Technician course. Suitable for WRT holders.',
  },
  {
    id: 'networking-bris-sep25',
    title: 'QLD Restoration Professionals Networking Evening',
    organiser: 'NRPG Queensland',
    category: 'networking',
    format: 'in-person',
    startDate: '2025-09-11',
    endDate: '2025-09-11',
    location: 'Brisbane, QLD',
    state: 'QLD',
    country: 'AU',
    price: '$45',
    featured: false,
    description: 'Informal networking evening for Queensland restoration contractors and industry suppliers. Drinks and canapés included.',
  },
]

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<EventCategory, string> = {
  'iicrc-training': 'IICRC Training',
  'conference': 'Conference',
  'trade-show': 'Trade Show',
  'networking': 'Networking',
  'seminar': 'Seminar',
  'supplier-day': 'Supplier Day',
  'webinar': 'Webinar',
}

const CATEGORY_COLOURS: Record<EventCategory, string> = {
  'iicrc-training': 'bg-blue-100 text-blue-800',
  'conference': 'bg-emerald-100 text-emerald-800',
  'trade-show': 'bg-purple-100 text-purple-800',
  'networking': 'bg-orange-100 text-orange-800',
  'seminar': 'bg-sky-100 text-sky-800',
  'supplier-day': 'bg-yellow-100 text-yellow-800',
  'webinar': 'bg-teal-100 text-teal-800',
}

const COUNTRY_LABELS: Record<string, string> = {
  'AU': 'Australia',
  'NZ': 'New Zealand',
  'JP': 'Japan',
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  if (start === end) return s.toLocaleDateString('en-AU', { ...opts, year: 'numeric' })
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()}–${e.toLocaleDateString('en-AU', { ...opts, year: 'numeric' })}`
  }
  return `${s.toLocaleDateString('en-AU', opts)} – ${e.toLocaleDateString('en-AU', { ...opts, year: 'numeric' })}`
}

const eventsSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Restoration Industry Events Calendar — Australia, New Zealand & Japan',
  description: 'IICRC training courses, conferences, trade shows, and networking events for restoration professionals in Australia, New Zealand, and Japan.',
  url: `${SITE_URL}/events`,
  numberOfItems: events.length,
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Industry Partners', item: `${SITE_URL}/industry-partners` },
    { '@type': 'ListItem', position: 3, name: 'Events', item: `${SITE_URL}/events` },
  ],
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<EventCategory | 'all'>('all')
  const [filterCountry, setFilterCountry] = useState<'all' | 'AU' | 'NZ' | 'JP'>('all')
  const [filterFormat, setFilterFormat] = useState<EventFormat | 'all'>('all')

  const filtered = useMemo(() => {
    return events.filter(ev => {
      const matchSearch = !search || ev.title.toLowerCase().includes(search.toLowerCase()) || ev.organiser.toLowerCase().includes(search.toLowerCase()) || ev.location.toLowerCase().includes(search.toLowerCase())
      const matchCat = filterCategory === 'all' || ev.category === filterCategory
      const matchCountry = filterCountry === 'all' || ev.country === filterCountry
      const matchFormat = filterFormat === 'all' || ev.format === filterFormat
      return matchSearch && matchCat && matchCountry && matchFormat
    })
  }, [search, filterCategory, filterCountry, filterFormat])

  const featured = filtered.filter(e => e.featured)
  const standard = filtered.filter(e => !e.featured)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventsSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/40 rounded-full text-blue-400 text-sm font-medium mb-6">
            <Calendar className="w-4 h-4" />
            Industry Events Calendar
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
            Restoration Industry Events
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            IICRC training courses, conferences, trade shows, and networking events for restoration professionals across Australia, New Zealand, and Japan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/events/submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Submit an Event
            </Link>
            <a
              href="#calendar"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Browse Events
            </a>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10" id="calendar">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value as EventCategory | 'all')}
              className="pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-lg bg-white appearance-none focus:border-blue-400 outline-none"
            >
              <option value="all">All categories</option>
              {(Object.entries(CATEGORY_LABELS) as [EventCategory, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Country filter */}
          <div className="relative">
            <select
              value={filterCountry}
              onChange={e => setFilterCountry(e.target.value as 'all' | 'AU' | 'NZ' | 'JP')}
              className="pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-lg bg-white appearance-none focus:border-blue-400 outline-none"
            >
              <option value="all">All countries</option>
              <option value="AU">Australia</option>
              <option value="NZ">New Zealand</option>
              <option value="JP">Japan</option>
            </select>
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Format filter */}
          <div className="relative">
            <select
              value={filterFormat}
              onChange={e => setFilterFormat(e.target.value as EventFormat | 'all')}
              className="pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-lg bg-white appearance-none focus:border-blue-400 outline-none"
            >
              <option value="all">All formats</option>
              <option value="in-person">In-Person</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          <span className="text-xs text-slate-400 ml-auto">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </section>

      {/* Events list */}
      <section className="bg-slate-50 py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-10">

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-slate-500">No events match your filters.</p>
              <button
                onClick={() => { setSearch(''); setFilterCategory('all'); setFilterCountry('all'); setFilterFormat('all') }}
                className="mt-3 text-sm text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Featured events */}
          {featured.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Featured Events</h2>
              <div className="grid md:grid-cols-2 gap-5">
                {featured.map(ev => (
                  <EventCard key={ev.id} event={ev} featured />
                ))}
              </div>
            </div>
          )}

          {/* Standard events */}
          {standard.length > 0 && (
            <div>
              {featured.length > 0 && (
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">All Events</h2>
              )}
              <div className="space-y-3">
                {standard.map(ev => (
                  <EventCard key={ev.id} event={ev} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Submit CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-14 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Running an Event?</h2>
          <p className="text-blue-100 mb-8">
            Submit your IICRC training course, industry conference, or networking event to appear on this calendar.
            Events are reviewed within 48 hours and published free of charge.
          </p>
          <Link
            href="/events/submit"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Submit an Event
          </Link>
        </div>
      </section>
    </>
  )
}

// ── Event card component ───────────────────────────────────────────────────────

function EventCard({ event, featured = false }: { event: CalendarEvent; featured?: boolean }) {
  const catColour = CATEGORY_COLOURS[event.category]
  const catLabel = CATEGORY_LABELS[event.category]

  if (featured) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${catColour}`}>{catLabel}</span>
          <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Featured</span>
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">{event.title}</h3>
        <p className="text-xs text-slate-500 mb-3">{event.organiser}</p>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{event.description}</p>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDateRange(event.startDate, event.endDate)}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.location}</span>
          {event.iicrcCert && (
            <span className="flex items-center gap-1 text-blue-600"><Award className="w-3.5 h-3.5" />{event.iicrcCert} · {event.cecCredits} CECs</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900">{event.price}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
            View details <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-4">
        <div className="hidden sm:flex flex-col items-center justify-center w-14 h-14 bg-blue-50 rounded-xl border border-blue-100 flex-shrink-0 text-center">
          <span className="text-xs font-bold text-blue-700 leading-none">
            {new Date(event.startDate).toLocaleDateString('en-AU', { month: 'short' }).toUpperCase()}
          </span>
          <span className="text-xl font-bold text-blue-900 leading-tight">
            {new Date(event.startDate).getDate()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-900 leading-snug">{event.title}</h3>
            <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${catColour}`}>{catLabel}</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDateRange(event.startDate, event.endDate)}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>
            {event.iicrcCert && (
              <span className="flex items-center gap-1 text-blue-600 font-medium"><Award className="w-3 h-3" />{event.iicrcCert}</span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold text-slate-900">{event.price}</p>
          <p className="text-xs text-slate-400 mt-0.5">{event.country === 'AU' ? 'Australia' : event.country === 'NZ' ? 'New Zealand' : 'Japan'}</p>
        </div>
      </div>
    </div>
  )
}
