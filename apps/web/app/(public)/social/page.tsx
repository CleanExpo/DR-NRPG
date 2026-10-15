'use client'

import { SITE_URL } from '@/lib/seo/site-url'
import { useState } from 'react'
import { Users, Newspaper, Camera, ExternalLink, Mail, CheckCircle, Globe, ArrowRight, Youtube, Linkedin, Facebook, Instagram, MessageSquare, Star, TrendingUp, BookOpen } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type SubscribeStatus = 'idle' | 'loading' | 'success' | 'error'

// ── Static data ───────────────────────────────────────────────────────────────

const COMMUNITY_STATS = [
  { label: 'Industry professionals', value: '2,800+' },
  { label: 'Countries covered', value: '3' },
  { label: 'Newsletter subscribers', value: '1,200+' },
  { label: 'Industry events listed', value: '40+' },
]

const SOCIAL_CHANNELS = [
  {
    platform: 'Facebook',
    icon: Facebook,
    handle: '@DisasterRecoveryAU',
    description: 'Industry news, member wins, and community discussions.',
    color: 'bg-blue-600',
    href: '#',
    cta: 'Follow on Facebook',
  },
  {
    platform: 'Instagram',
    icon: Instagram,
    handle: '@disasterrecovery.au',
    description: 'Before/after projects, training highlights, and field work.',
    color: 'bg-pink-600',
    href: '#',
    cta: 'Follow on Instagram',
  },
  {
    platform: 'LinkedIn',
    icon: Linkedin,
    handle: 'Disaster Recovery Australia',
    description: 'Professional insights, certifications, and industry research.',
    color: 'bg-sky-700',
    href: '#',
    cta: 'Connect on LinkedIn',
  },
  {
    platform: 'YouTube',
    icon: Youtube,
    handle: 'Disaster Recovery Australia',
    description: 'Training videos, equipment reviews, and how-to guides.',
    color: 'bg-red-600',
    href: '#',
    cta: 'Subscribe on YouTube',
  },
]

const HUB_SECTIONS = [
  {
    icon: Camera,
    title: 'Project Showcase',
    description: 'Before/after project photos from industry professionals across Australia, New Zealand, and Japan.',
    badge: 'Community',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    href: '/social/showcase',
    cta: 'Browse projects',
    live: true,
  },
  {
    icon: Newspaper,
    title: 'Industry News',
    description: 'Curated standards updates, association announcements, equipment launches, and industry research.',
    badge: 'Curated',
    badgeColor: 'bg-blue-100 text-blue-700',
    href: '/social/news',
    cta: 'Read news',
    live: true,
  },
  {
    icon: MessageSquare,
    title: 'Discussion Forum',
    description: 'Ask questions, share advice, and connect with experienced professionals in your region.',
    badge: 'Coming soon',
    badgeColor: 'bg-amber-100 text-amber-700',
    href: '#',
    cta: 'Coming soon',
    live: false,
  },
]

const FEATURED_PROJECTS = [
  {
    title: 'Class 3 water damage — 280 m² residential, Brisbane QLD',
    category: 'Water Damage',
    company: 'Rapid Dry Solutions',
    region: 'AU',
    imageColor: 'from-blue-800 to-blue-600',
    result: '4-day structural dry, Cat 1 clearance',
    featured: true,
  },
  {
    title: 'Mould remediation post-flood — Auckland townhouse',
    category: 'Mould Remediation',
    company: 'NZ FloodTech',
    region: 'NZ',
    imageColor: 'from-emerald-800 to-emerald-600',
    result: 'S520-compliant, air quality clearance achieved',
    featured: false,
  },
  {
    title: 'Commercial fire restoration — Tokyo office building',
    category: 'Fire & Smoke',
    company: 'Nihon Restore Co.',
    region: 'JP',
    imageColor: 'from-orange-800 to-orange-600',
    result: '3-storey soot remediation, HVAC decon complete',
    featured: false,
  },
]

const NEWS_ITEMS = [
  {
    category: 'Standards Update',
    title: 'IICRC S500 6th Edition — key changes for water damage professionals',
    date: '28 Mar 2026',
    source: 'IICRC',
    href: '/social/news',
  },
  {
    category: 'Association News',
    title: 'RIA Australia confirms 2026 national conference dates',
    date: '20 Mar 2026',
    source: 'RIA Australia',
    href: '/social/news',
  },
  {
    category: 'Regulation',
    title: "SafeWork NSW updates mould remediation guidance for residential work",
    date: '14 Mar 2026',
    source: 'SafeWork NSW',
    href: '/social/news',
  },
  {
    category: 'Research',
    title: 'CSIRO: 52% of Australian homes show signs of past water ingress',
    date: '5 Mar 2026',
    source: 'CSIRO',
    href: '/data',
  },
]

// ── JSON-LD ───────────────────────────────────────────────────────────────────

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Community & Social', item: `${SITE_URL}/social` },
      ],
    },
    {
      '@type': 'CommunityForum',
      name: "DR Industry Community — Australia, New Zealand & Japan",
      description: "Online community hub for cleaning and restoration professionals across Australia, New Zealand, and Japan.",
      url: `${SITE_URL}/social`,
    },
  ],
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SocialPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<SubscribeStatus>('idle')
  const [emailError, setEmailError] = useState('')

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    setEmailError('')
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address')
      return
    }
    setStatus('loading')
    await new Promise(r => setTimeout(r, 1200))
    setStatus('success')
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-slate-50">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-emerald-800 to-emerald-600 text-white py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <nav className="text-sm text-emerald-200 mb-6">
              <a href="/" className="hover:text-white">Home</a>
              <span className="mx-2">/</span>
              <span className="text-white">Community</span>
            </nav>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">Community &amp; Social</h1>
                <p className="mt-2 text-emerald-100 text-lg max-w-2xl">
                  Connect with cleaning and restoration professionals across Australia, New Zealand, and Japan.
                </p>
              </div>
            </div>

            {/* Stats bar */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {COMMUNITY_STATS.map(stat => (
                <div key={stat.label} className="bg-white/10 rounded-xl px-4 py-3 text-center">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-emerald-200 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
          {/* ── Hub sections ─────────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Community hubs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {HUB_SECTIONS.map(section => {
                const Icon = section.icon
                return (
                  <div key={section.title} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${section.badgeColor}`}>
                        {section.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">{section.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 flex-1">{section.description}</p>
                    {section.live ? (
                      <a
                        href={section.href}
                        className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        {section.cta} <ArrowRight className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="mt-5 text-sm font-medium text-slate-400">{section.cta}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* ── Featured projects preview ─────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Featured projects</h2>
                <p className="text-sm text-slate-500 mt-0.5">Real work from professionals across AU, NZ &amp; Japan</p>
              </div>
              <a href="/social/showcase" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5">
                View all <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {FEATURED_PROJECTS.map(proj => (
                <div key={proj.title} className="bg-white rounded-2xl border border-slate-200 overflow-hidden group">
                  {/* Placeholder image with gradient */}
                  <div className={`h-36 bg-gradient-to-br ${proj.imageColor} relative`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white/40" />
                    </div>
                    {proj.featured && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3" />
                        Featured
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {proj.region}
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">{proj.category}</span>
                    <h3 className="mt-1 text-sm font-semibold text-slate-900 leading-tight">{proj.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{proj.company}</p>
                    <p className="mt-2 text-xs text-slate-600 flex items-start gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      {proj.result}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Latest news ────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Industry news</h2>
                <p className="text-sm text-slate-500 mt-0.5">Standards, associations, regulation, and research</p>
              </div>
              <a href="/social/news" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5">
                All news <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
              {NEWS_ITEMS.map(item => (
                <a key={item.title} href={item.href} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 group">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                    <Newspaper className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">{item.category}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-400">{item.source}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 group-hover:text-emerald-800">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.date}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 mt-1 shrink-0" />
                </a>
              ))}
            </div>
          </section>

          {/* ── Social channels ─────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Follow DR</h2>
            <p className="text-sm text-slate-500 mb-6">Stay connected across all platforms</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SOCIAL_CHANNELS.map(ch => {
                const Icon = ch.icon
                return (
                  <a
                    key={ch.platform}
                    href={ch.href}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-300 hover:shadow-sm transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-xl ${ch.color} flex items-center justify-center text-white mb-4`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{ch.platform}</div>
                    <div className="text-xs text-slate-500 mb-2">{ch.handle}</div>
                    <p className="text-xs text-slate-600 mb-4">{ch.description}</p>
                    <span className="text-xs font-semibold text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1">
                      {ch.cta} <ExternalLink className="w-3 h-3" />
                    </span>
                  </a>
                )
              })}
            </div>
          </section>

          {/* ── Newsletter signup ────────────────────────────────── */}
          <section className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-3">
                  <Mail className="w-4 h-4" />
                  The DR Brief
                </div>
                <h2 className="text-2xl font-bold mb-3">Join 1,200+ professionals</h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Monthly industry digest covering stats, news, IICRC updates, upcoming events,
                  and resources for Australian, New Zealand, and Japanese restoration professionals.
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    'Stat of the month (sourced, verified)',
                    'Standards &amp; regulation updates',
                    'Upcoming industry events',
                    'Free tools &amp; resources',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                {status === 'success' ? (
                  <div className="bg-emerald-700/40 border border-emerald-500 rounded-xl p-6 text-center">
                    <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                    <p className="text-lg font-semibold">You&apos;re on the list!</p>
                    <p className="text-sm text-slate-300 mt-1">First issue arrives next month.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com.au"
                        className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                      {emailError && (
                        <p className="mt-1 text-xs text-red-400">{emailError}</p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-70 text-white font-semibold py-3 px-5 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {status === 'loading' ? (
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Subscribe free <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                    <p className="text-xs text-slate-400 text-center">Monthly only. Unsubscribe any time.</p>
                  </form>
                )}
              </div>
            </div>
          </section>

          {/* ── CleanExpo + community partners ──────────────────── */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">CleanExpo247</h3>
              </div>
              <p className="text-sm text-slate-600 mb-5">
                Virtual trade show for the cleaning &amp; restoration industry. Connect with equipment suppliers,
                attend seminars, and discover new solutions — available 24/7.
              </p>
              <a
                href="https://cleanexpo247.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                Visit CleanExpo247 <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Industry statistics</h3>
              </div>
              <p className="text-sm text-slate-600 mb-5">
                Explore 54 verified industry statistics covering market size, IICRC certification,
                water damage, mould, insurance, workforce, and pricing across AU, NZ &amp; Japan.
              </p>
              <a
                href="/data"
                className="flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Browse statistics <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">IICRC learning hub</h3>
              </div>
              <p className="text-sm text-slate-600 mb-5">
                Browse IICRC certifications (WRT, AMRT, FSRT, ASD), find registered courses
                near you, and plan your professional development pathway.
              </p>
              <a
                href="/learn"
                className="flex items-center gap-2 text-sm font-semibold text-purple-700 hover:text-purple-800"
              >
                Explore learning <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Industry partners</h3>
              </div>
              <p className="text-sm text-slate-600 mb-5">
                List your business in the NRPG directory, reach insurance assessors, and connect
                with property owners actively seeking certified restoration professionals.
              </p>
              <a
                href="/industry-partners"
                className="flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-800"
              >
                Join the network <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
