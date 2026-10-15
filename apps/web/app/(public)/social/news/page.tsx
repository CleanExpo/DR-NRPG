import { SITE_URL } from '@/lib/seo/site-url'
import { Newspaper, ArrowRight, ExternalLink, BookOpen, Scale, Wrench, FlaskConical, Megaphone } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type NewsCategory = 'standards' | 'regulation' | 'association' | 'equipment' | 'research' | 'training'

interface NewsItem {
  id: string
  category: NewsCategory
  title: string
  summary: string
  source: string
  sourceType: 'iicrc' | 'government' | 'association' | 'research' | 'dr'
  date: string
  region: 'AU' | 'NZ' | 'JP' | 'Global'
  href: string
  featured: boolean
}

// ── Static data ───────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<NewsCategory, React.ElementType<{ className?: string }>> = {
  standards: BookOpen,
  regulation: Scale,
  association: Megaphone,
  equipment: Wrench,
  research: FlaskConical,
  training: BookOpen,
}

const CATEGORY_COLOURS: Record<NewsCategory, string> = {
  standards: 'bg-blue-100 text-blue-700',
  regulation: 'bg-amber-100 text-amber-700',
  association: 'bg-purple-100 text-purple-700',
  equipment: 'bg-slate-100 text-slate-700',
  research: 'bg-emerald-100 text-emerald-700',
  training: 'bg-sky-100 text-sky-700',
}

const NEWS_ITEMS: NewsItem[] = [
  {
    id: '1',
    category: 'standards',
    title: 'IICRC S500 6th Edition — key changes affecting water damage professionals',
    summary: 'The revised S500 Standard for Professional Water Damage Restoration introduces updated language around Category 3 definitions, psychrometrics requirements, and enhanced documentation requirements. Professionals holding WRT credentials should review the changes before their next recertification.',
    source: 'IICRC',
    sourceType: 'iicrc',
    date: '28 Mar 2026',
    region: 'Global',
    href: '#',
    featured: true,
  },
  {
    id: '2',
    category: 'regulation',
    title: "SafeWork NSW updates mould remediation guidance for residential work",
    summary: "SafeWork NSW has published revised guidance on mould identification and remediation in residential settings, including new requirements around respiratory protection, containment, and disposal of mould-affected materials. Applicable to all licensed remediators working in NSW.",
    source: 'SafeWork NSW',
    sourceType: 'government',
    date: '14 Mar 2026',
    region: 'AU',
    href: '#',
    featured: true,
  },
  {
    id: '3',
    category: 'association',
    title: 'RIA Australia confirms 2026 national conference — Melbourne, August',
    summary: 'The Restoration Industry Association (RIA) Australia chapter has confirmed its annual national conference will be held in Melbourne in August 2026. Early registration is now open. Topics include AI in estimating, IICRC standards update, and cross-sector insurance collaboration.',
    source: 'RIA Australia',
    sourceType: 'association',
    date: '20 Mar 2026',
    region: 'AU',
    href: '/events',
    featured: false,
  },
  {
    id: '4',
    category: 'research',
    title: 'CSIRO: 52% of Australian homes show signs of past water ingress',
    summary: 'A CSIRO survey of 2,400 Australian homes found 52% showed physical evidence of water ingress or damage at some stage — higher than previously estimated. The study identified roof and plumbing failures as the primary causes in metro areas, with stormwater ingress dominant in regional Queensland and Western Australia.',
    source: 'CSIRO',
    sourceType: 'research',
    date: '5 Mar 2026',
    region: 'AU',
    href: '/data',
    featured: false,
  },
  {
    id: '5',
    category: 'standards',
    title: 'IICRC S520 mould standard — updated containment protocols for Class 3',
    summary: 'The IICRC has released guidance clarifying containment requirements under S520 for large-area (Class 3) mould remediation events. The guidance addresses negative air pressure specifications, HEPA filtration requirements, and cross-contamination controls for multi-storey projects.',
    source: 'IICRC',
    sourceType: 'iicrc',
    date: '1 Mar 2026',
    region: 'Global',
    href: '#',
    featured: false,
  },
  {
    id: '6',
    category: 'regulation',
    title: 'New Zealand Building Act amendments — implications for water damage work',
    summary: 'Recent amendments to the NZ Building Act affect how Category 2 and 3 water damage repairs interact with building consent requirements. MBIE has issued guidance clarifying which restoration activities require consent and which are exempt as like-for-like maintenance.',
    source: 'MBIE New Zealand',
    sourceType: 'government',
    date: '22 Feb 2026',
    region: 'NZ',
    href: '#',
    featured: false,
  },
  {
    id: '7',
    category: 'equipment',
    title: 'Desiccant vs refrigerant dehumidifiers — IICRC guidance update',
    summary: 'New IICRC supplemental guidance clarifies equipment selection criteria for structural drying — when to use refrigerant-cycle LGR dehumidifiers versus desiccant units in cold or low-humidity conditions. Relevant for Australian alpine regions, New Zealand South Island, and Japanese northern prefectures.',
    source: 'IICRC',
    sourceType: 'iicrc',
    date: '15 Feb 2026',
    region: 'Global',
    href: '#',
    featured: false,
  },
  {
    id: '8',
    category: 'training',
    title: 'IICRC ASD (Applied Structural Drying) — exam format changes from July 2026',
    summary: 'The IICRC has announced changes to the Applied Structural Drying (ASD) hands-on component from July 2026. Candidates must now demonstrate psychrometric calculations on calibrated equipment, and written exam questions will be updated to reflect the S500 6th Edition.',
    source: 'IICRC',
    sourceType: 'iicrc',
    date: '10 Feb 2026',
    region: 'Global',
    href: '/tools/course-finder',
    featured: false,
  },
  {
    id: '9',
    category: 'research',
    title: 'Japan FDMA report: residential water damage claims up 18% year-on-year',
    summary: 'Japan\'s Fire and Disaster Management Agency (FDMA) annual report shows residential water damage claims increased 18% year-on-year, driven primarily by typhoon season and aging housing stock. The report highlights a shortage of IICRC-certified restoration professionals in rural prefectures.',
    source: 'Japan FDMA',
    sourceType: 'government',
    date: '3 Feb 2026',
    region: 'JP',
    href: '/data',
    featured: false,
  },
]

const CATEGORIES_FILTER: { value: NewsCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All categories' },
  { value: 'standards', label: 'Standards' },
  { value: 'regulation', label: 'Regulation' },
  { value: 'association', label: 'Association' },
  { value: 'research', label: 'Research' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'training', label: 'Training' },
]

// ── JSON-LD ───────────────────────────────────────────────────────────────────

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Community', item: `${SITE_URL}/social` },
        { '@type': 'ListItem', position: 3, name: 'Industry News', item: `${SITE_URL}/social/news` },
      ],
    },
    {
      '@type': 'ItemList',
      name: 'Restoration Industry News — AU, NZ & Japan',
      numberOfItems: NEWS_ITEMS.length,
      itemListElement: NEWS_ITEMS.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.title,
      })),
    },
  ],
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const featured = NEWS_ITEMS.filter(n => n.featured)
  const rest = NEWS_ITEMS.filter(n => !n.featured)

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
              <span className="text-slate-800">Industry News</span>
            </nav>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                <Newspaper className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Industry News</h1>
                <p className="mt-1 text-slate-600 max-w-2xl">
                  Curated standards updates, regulation changes, association announcements, and
                  research for restoration professionals across Australia, New Zealand, and Japan.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
          {/* ── Featured ─────────────────────────────────────────── */}
          {featured.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-5">Top stories</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {featured.map(item => {
                  const Icon = CATEGORY_ICONS[item.category]
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-emerald-300 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLOURS[item.category]}`}>
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </span>
                        <span className="text-xs text-slate-400">{item.region} · {item.date}</span>
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-emerald-800 leading-snug">{item.title}</h3>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-3">{item.summary}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${CATEGORY_COLOURS[item.category]}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-medium text-slate-600">{item.source}</span>
                        </div>
                        <span className="text-emerald-700 group-hover:text-emerald-800">
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </a>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── All news ─────────────────────────────────────────── */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-5">All news</h2>
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
              {rest.map(item => {
                const Icon = CATEGORY_ICONS[item.category]
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className="flex items-start gap-4 px-6 py-5 hover:bg-slate-50 group"
                  >
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${CATEGORY_COLOURS[item.category]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLOURS[item.category]}`}>
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </span>
                        <span className="text-xs text-slate-400">{item.region}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-400">{item.source}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-800">{item.title}</h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{item.summary}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.date}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 mt-1 shrink-0" />
                  </a>
                )
              })}
            </div>
          </section>

          {/* ── Categories guide ─────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">News categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES_FILTER.filter(c => c.value !== 'all').map(cat => {
                const Icon = CATEGORY_ICONS[cat.value as NewsCategory]
                return (
                  <div key={cat.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${CATEGORY_COLOURS[cat.value as NewsCategory]}`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{cat.label}</span>
                  </div>
                )
              })}
            </div>
            <p className="mt-4 text-xs text-slate-500">
              News is curated from IICRC, government regulators, industry associations, and research institutions.
              Sources: IICRC, RIA, SafeWork, MBIE, CSIRO, IBISWorld, FDMA Japan.
            </p>
          </section>

          {/* ── Related links ─────────────────────────────────────── */}
          <section className="flex flex-wrap gap-4">
            <a href="/social" className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-medium">
              <ArrowRight className="w-4 h-4" />Community hub
            </a>
            <a href="/data" className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-medium">
              <ExternalLink className="w-4 h-4" />Industry statistics
            </a>
            <a href="/events" className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-medium">
              <ExternalLink className="w-4 h-4" />Industry events
            </a>
          </section>
        </div>
      </main>
    </>
  )
}
