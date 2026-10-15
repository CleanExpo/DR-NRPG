import { SITE_URL } from '@/lib/seo/site-url'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Wrench, Calculator, Award, Download, ArrowRight, Clock, Layers } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Industry Tools | Restoration Professionals — Australia, New Zealand & Japan',
  description:
    'Free tools for restoration industry professionals: IICRC course finder, drying time calculator, downloadable templates, and moisture mapping.',
  openGraph: {
    title: 'Industry Tools | NRPG',
    description: 'Free tools for restoration professionals in Australia, New Zealand, and Japan.',
    url: `${SITE_URL}/tools`,
  },
}

const tools = [
  {
    href: '/tools/course-finder',
    icon: Award,
    title: 'IICRC Course Finder',
    description:
      'Compare IICRC certifications by category, level, prerequisites, and insurer recognition. Find upcoming courses across Australia, New Zealand, and Japan.',
    badge: 'Live',
    badgeColour: 'bg-green-100 text-green-700',
    accent: 'emerald',
  },
  {
    href: '/tools/drying-calculator',
    icon: Calculator,
    title: 'Drying Time Calculator',
    description:
      'Estimate structural drying times based on material type, moisture content, equipment capacity, and ambient conditions. IICRC S500 parameters.',
    badge: 'Live',
    badgeColour: 'bg-green-100 text-green-700',
    accent: 'blue',
  },
  {
    href: '/tools/templates',
    icon: Download,
    title: 'Templates & Downloads',
    description:
      'Free IICRC-aligned templates: drying logs, moisture mapping sheets, safety checklists, scope of works, and insurance documentation.',
    badge: 'Live',
    badgeColour: 'bg-green-100 text-green-700',
    accent: 'purple',
  },
  {
    href: '/tools/moisture-map',
    icon: Layers,
    title: 'Interactive Moisture Map',
    description:
      'Digital moisture mapping tool for residential and commercial properties. Mark affected areas, record readings, and export for insurance documentation.',
    badge: 'Coming Soon',
    badgeColour: 'bg-yellow-100 text-yellow-700',
    accent: 'teal',
  },
]

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200 hover:border-emerald-400', text: 'text-emerald-600' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200 hover:border-blue-400', text: 'text-blue-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200 hover:border-purple-400', text: 'text-purple-600' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200 hover:border-teal-400', text: 'text-teal-600' },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Industry Partners', item: `${SITE_URL}/industry-partners` },
    { '@type': 'ListItem', position: 3, name: 'Tools', item: `${SITE_URL}/tools` },
  ],
}

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 border border-teal-500/40 rounded-full text-teal-400 text-sm font-medium mb-6">
            <Wrench className="w-4 h-4" />
            Restoration Industry Tools
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
            Free Tools for Restoration Professionals
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Calculators, templates, and reference tools built for restoration contractors in Australia, New Zealand, and Japan.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon
              const accent = accentMap[tool.accent]
              return (
                <Link key={tool.href} href={tool.href} className="group block">
                  <div className={`h-full bg-white rounded-2xl p-6 border-2 ${accent.border} transition-all hover:shadow-md`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 ${accent.bg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${accent.text}`} />
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tool.badgeColour}`}>
                        {tool.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{tool.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{tool.description}</p>
                    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${accent.text} group-hover:gap-2 transition-all`}>
                      {tool.badge === 'Live' ? 'Open Tool' : 'Coming Soon'}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">More tools coming soon</h3>
            <p className="text-sm text-slate-500">
              New tools are added regularly. Visit the{' '}
              <Link href="/industry-partners" className="text-emerald-600 hover:underline">Industry Hub</Link>{' '}
              for all resources.
            </p>
          </div>
          <Link
            href="/events"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg transition-colors"
          >
            <Clock className="w-4 h-4" />
            Browse Upcoming Events
          </Link>
        </div>
      </section>
    </>
  )
}
