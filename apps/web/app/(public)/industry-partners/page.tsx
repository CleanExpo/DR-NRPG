import { SITE_URL } from '@/lib/seo/site-url'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Calendar,
  BookOpen,
  Users,
  Wrench,
  Building2,
  ArrowRight,
  Award,
  TrendingUp,
  Globe,
  FileText,
  Layers,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Industry Partners Hub | NRPG — Australia, New Zealand & Japan',
  description:
    'The NRPG industry resource centre for restoration contractors. Find events, training courses, supplier directory, knowledge guides, and industry tools across Australia, New Zealand, and Japan.',
  openGraph: {
    title: 'Industry Partners Hub | NRPG — Australia, New Zealand & Japan',
    description:
      'Resources, events, training, and tools for restoration and disaster recovery industry professionals across Australia, New Zealand, and Japan.',
    url: `${SITE_URL}/industry-partners`,
  },
}

const hubSections = [
  {
    icon: Calendar,
    title: 'Industry Events',
    description:
      'ANZ training courses, conferences, trade shows, and IICRC certification events. Filter by state, format, and certification type.',
    href: '/events',
    cta: 'Browse Events',
    accent: 'emerald',
    stats: '35+ events',
    badge: 'Live',
  },
  {
    icon: Building2,
    title: 'Supplier Directory',
    description:
      'Find vetted equipment suppliers, chemical manufacturers, drying technology providers, and restoration product distributors across Australia.',
    href: '/directory',
    cta: 'Browse Directory',
    accent: 'blue',
    stats: 'Coming soon',
    badge: 'Beta',
  },
  {
    icon: BookOpen,
    title: 'Learning Hub',
    description:
      'IICRC course finder, YouTube channel playlists, industry podcasts, textbooks, and self-paced learning resources for restorers.',
    href: '/learn',
    cta: 'Start Learning',
    accent: 'purple',
    stats: 'Coming soon',
    badge: 'Beta',
  },
  {
    icon: FileText,
    title: 'Knowledge Guides',
    description:
      '10 authoritative technical guides on water damage, mould, fire restoration, insurance claims, and IICRC standards compliance.',
    href: '/guides',
    cta: 'Read Guides',
    accent: 'orange',
    stats: '10 guides',
    badge: 'New',
  },
  {
    icon: Wrench,
    title: 'Industry Tools',
    description:
      'Drying time calculator, IICRC course finder, moisture mapping templates, job costing tools, and insurance documentation aids.',
    href: '/tools',
    cta: 'Use Tools',
    accent: 'teal',
    stats: 'Coming soon',
    badge: 'Beta',
  },
  {
    icon: Users,
    title: 'Industry Community',
    description:
      'Connect with Australia\'s restoration community. Share knowledge, discuss standards, and stay current with regulatory changes.',
    href: '/community',
    cta: 'Join Community',
    accent: 'rose',
    stats: 'Coming soon',
    badge: 'Beta',
  },
]

const accentMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200 hover:border-emerald-400',
    text: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200 hover:border-blue-400',
    text: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200 hover:border-purple-400',
    text: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-700',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200 hover:border-orange-400',
    text: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-700',
  },
  teal: {
    bg: 'bg-teal-50',
    border: 'border-teal-200 hover:border-teal-400',
    text: 'text-teal-600',
    badge: 'bg-teal-100 text-teal-700',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-200 hover:border-rose-400',
    text: 'text-rose-600',
    badge: 'bg-rose-100 text-rose-700',
  },
}

const industryStats = [
  {
    value: '$12.4B',
    label: 'Australian restoration industry annual revenue',
    source: 'IBISWorld 2024',
    icon: TrendingUp,
  },
  {
    value: '4,200+',
    label: 'IICRC-certified technicians active in Australia',
    source: 'IICRC Registry 2024',
    icon: Award,
  },
  {
    value: '3 Countries',
    label: 'Australia, New Zealand, and Japan covered',
    source: 'NRPG Network',
    icon: Globe,
  },
  {
    value: '35+',
    label: 'AU/NZ/JP industry events indexed for 2025–2026',
    source: 'NRPG Events Index',
    icon: Calendar,
  },
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Industry Partners',
      item: `${SITE_URL}/industry-partners`,
    },
  ],
}

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Industry Partners Hub — NRPG Disaster Recovery Australia',
  description:
    'Resource centre for restoration industry professionals: events, supplier directory, learning hub, knowledge guides, and industry tools.',
  url: `${SITE_URL}/industry-partners`,
  breadcrumb: breadcrumbSchema,
}

export default function IndustryPartnersPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 text-sm font-medium mb-6">
            <Layers className="w-4 h-4" />
            NRPG Industry Resource Centre
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
            Everything the Restoration Industry Needs — In One Place
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Events, training, suppliers, guides, and tools for IICRC-certified professionals across Australia, New Zealand, and Japan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Browse ANZ Events
            </Link>
            <Link
              href="/get-started"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors"
            >
              Join as a Contractor
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Industry Stats */}
      <section className="bg-white border-b border-slate-200 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {industryStats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex justify-center mb-2">
                    <Icon className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-600 mb-1">{stat.label}</div>
                  <div className="text-xs text-slate-400">{stat.source}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Hub Sections Grid */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Industry Resources
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built for IICRC-certified contractors, industry educators, and restoration business owners across Australia, New Zealand, and Japan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hubSections.map((section) => {
              const Icon = section.icon
              const accent = accentMap[section.accent]
              return (
                <Link key={section.title} href={section.href} className="group block">
                  <div
                    className={`h-full bg-white rounded-2xl p-6 border-2 ${accent.border} transition-all duration-200 hover:shadow-lg`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 ${accent.bg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${accent.text}`} />
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${accent.badge}`}
                      >
                        {section.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{section.title}</h3>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">{section.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">{section.stats}</span>
                      <span
                        className={`text-sm font-semibold ${accent.text} flex items-center gap-1 group-hover:gap-2 transition-all`}
                      >
                        {section.cta}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured: Events Preview */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                Upcoming ANZ Industry Events
              </h2>
              <p className="text-slate-500 text-sm">IICRC courses, conferences, and trade shows across Australia, New Zealand, and Japan</p>
            </div>
            <Link
              href="/events"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              View all events
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Static preview tiles — Events page has full dynamic listing */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              { title: 'IICRC AMRT Mould Remediation Technician', date: '12 May 2025', city: 'Sydney', type: 'IICRC Training', accent: 'emerald' },
              { title: 'IICRC WRT Water Restoration Technician', date: '19 May 2025', city: 'Melbourne', type: 'IICRC Training', accent: 'blue' },
              { title: 'RIA National Restoration Conference 2025', date: '11–13 Jun 2025', city: 'Brisbane', type: 'Conference', accent: 'purple' },
            ].map((event) => {
              const accent = accentMap[event.accent]
              return (
                <Link key={event.title} href="/events" className="group block">
                  <div className={`bg-white border-2 ${accent.border} rounded-xl p-4 hover:shadow-md transition-all`}>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${accent.badge} mb-3`}>
                      {event.type}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-800 mb-2 leading-snug">{event.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{event.date}</span>
                      <span>·</span>
                      <span>{event.city}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          <Link
            href="/events"
            className="sm:hidden inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            View all 35+ events
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CTA — Join NRPG */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Already an IICRC-Certified Contractor?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join the NRPG network and access a steady stream of verified disaster recovery jobs across Australia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-started"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Apply to Join NRPG
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-colors"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
