'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, BookOpen, TrendingUp, Calendar, CheckCircle, AlertCircle, ArrowRight, Clock, Tag } from 'lucide-react'

interface Issue {
  volume: number
  issue: number
  date: string
  title: string
  summary: string
  tags: string[]
  readTime: string
  featured: boolean
}

const archiveIssues: Issue[] = [
  {
    volume: 1,
    issue: 8,
    date: '18 March 2025',
    title: 'La Niña Exit, El Niño Entry: What the Pattern Shift Means for Your Pipeline',
    summary: 'BOM has officially called the end of La Niña. We break down what the transition to El Niño conditions means for storm and water damage job volumes across AU, NZ, and Japan — and how to position your business for the drier cycle.',
    tags: ['Market Trends', 'Storm Season', 'AU/NZ/JP'],
    readTime: '6 min',
    featured: true,
  },
  {
    volume: 1,
    issue: 7,
    date: '4 March 2025',
    title: 'The 2021 Water Damage Standard — The Changes You Still Haven\'t Implemented',
    summary: 'The 2021 revision of the water damage standard is now 3 years old. Yet our contractor survey shows 41% of AU technicians are still applying the 2006-era moisture class protocols. Here\'s exactly what changed and why it matters for insurer audits.',
    tags: ['IICRC', 'Standards', 'Compliance'],
    readTime: '8 min',
    featured: true,
  },
  {
    volume: 1,
    issue: 6,
    date: '18 February 2025',
    title: 'Insurer Panel Approvals: The 8 Documents You Need in 2025',
    summary: 'Three major Australian insurers updated their approved contractor documentation requirements in Q4 2024. We\'ve compiled the complete document checklist so you\'re not caught out on your next renewal cycle.',
    tags: ['Insurance', 'Contractor Business', 'Documentation'],
    readTime: '5 min',
    featured: false,
  },
  {
    volume: 1,
    issue: 5,
    date: '4 February 2025',
    title: 'Mould After the Wet: Post-Flood Remediation Surge in Southeast QLD',
    summary: 'Following the January rain events, SE Queensland contractors are reporting a 3–4 week mould backlog. We look at the recognised industry protocols most applicable to post-flood secondary mould growth and how to manage client expectations.',
    tags: ['Mould Remediation', 'Queensland'],
    readTime: '7 min',
    featured: false,
  },
  {
    volume: 1,
    issue: 4,
    date: '21 January 2025',
    title: 'Japan Market Update: IICRC Adoption and the Emerging Opportunity for AU Contractors',
    summary: 'Japanese property restoration is largely unregulated — until now. With two major Tokyo-area insurers adding IICRC certification requirements to their preferred supplier lists, there\'s an emerging lane for certified AU contractors.',
    tags: ['Japan', 'Market Expansion', 'IICRC'],
    readTime: '9 min',
    featured: false,
  },
  {
    volume: 1,
    issue: 3,
    date: '7 January 2025',
    title: 'The AFCA Complaint That Changed How We Write Scope of Works',
    summary: 'A 2024 AFCA determination ruled in favour of a homeowner whose insurer rejected a restoration scope because it lacked IICRC moisture class documentation. We analyse the case and provide a compliant scope template.',
    tags: ['Insurance Disputes', 'Documentation', 'AFCA'],
    readTime: '7 min',
    featured: false,
  },
  {
    volume: 1,
    issue: 2,
    date: '17 December 2024',
    title: 'How to Price a Drying Chamber: The Full Cost-Recovery Model',
    summary: 'Drying chambers are underpriced by most AU contractors. Using real data from NRPG network members, we build the complete cost-recovery model including labour, equipment amortisation, energy, and containment materials.',
    tags: ['Pricing', 'Equipment', 'Business Development'],
    readTime: '10 min',
    featured: false,
  },
  {
    volume: 1,
    issue: 1,
    date: '3 December 2024',
    title: 'Welcome to The DR Brief — Australia\'s Restoration Industry Newsletter',
    summary: 'Introducing The DR Brief: fortnightly intelligence for restoration professionals in Australia, New Zealand, and Japan. In this first issue: who we are, what we cover, and the three industry shifts that will define 2025.',
    tags: ['Introduction', 'Industry Overview', 'AU/NZ/JP'],
    readTime: '4 min',
    featured: false,
  },
]

const benefits = [
  { icon: TrendingUp, text: 'Market trend analysis for AU, NZ & Japan' },
  { icon: BookOpen, text: 'IICRC standard updates and compliance guidance' },
  { icon: Tag, text: 'Pricing benchmarks and contractor data' },
  { icon: Calendar, text: 'Upcoming events and course dates' },
]

type SubscribeStatus = 'idle' | 'loading' | 'success' | 'error'

export default function NewsletterPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<SubscribeStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.')
      return
    }
    setStatus('loading')
    setErrorMsg('')
    // Simulated subscribe — API route /api/newsletter/subscribe to be wired in DR-32 sprint
    await new Promise(r => setTimeout(r, 1200))
    setStatus('success')
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 text-sm font-medium mb-6">
            <Mail className="w-4 h-4" />
            Fortnightly Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
            The DR Brief
          </h1>
          <p className="text-lg text-emerald-400 font-medium mb-6">
            Australia's restoration industry newsletter
          </p>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Fortnightly analysis for restoration professionals in Australia, New Zealand, and Japan — IICRC standards, insurer intelligence, market data, and business benchmarks.
          </p>
        </div>
      </section>

      {/* Subscribe + benefits */}
      <section className="bg-white py-16 px-6 border-b border-slate-200">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          {/* Subscribe form */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Subscribe Free</h2>
            <p className="text-slate-600 mb-6 text-sm">No spam. One email every two weeks. Unsubscribe any time.</p>

            {status === 'success' ? (
              <div className="flex items-start gap-3 p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-900">You're on the list.</p>
                  <p className="text-sm text-emerald-700 mt-1">The next issue of The DR Brief will land in your inbox on the next publication date.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Work email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com.au"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-slate-900 text-sm transition-colors"
                  />
                  {errorMsg && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errorMsg}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-lg transition-colors"
                >
                  {status === 'loading' ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Subscribe to The DR Brief
                    </>
                  )}
                </button>
                <p className="text-xs text-slate-400">
                  By subscribing you agree to our{' '}
                  <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
                  Unsubscribe with one click at any time.
                </p>
              </form>
            )}
          </div>

          {/* What you'll get */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Every issue covers:</h2>
            <ul className="space-y-3">
              {benefits.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm text-slate-700">{text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Publication cadence</p>
              <p className="text-sm text-slate-700">Every second Tuesday — 8 issues so far, starting December 2024.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured issues */}
      <section className="bg-slate-50 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Featured Issues</h2>
          <p className="text-slate-500 text-sm mb-8">A taste of what's inside The DR Brief.</p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {archiveIssues.filter(i => i.featured).map((issue) => (
              <div key={`${issue.volume}-${issue.issue}`} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400 font-medium">Vol. {issue.volume}, Issue {issue.issue}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {issue.readTime} read
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2 leading-snug">{issue.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{issue.summary}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {issue.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">{tag}</span>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">{issue.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Full archive */}
          <h2 className="text-xl font-bold text-slate-900 mb-6">Issue Archive</h2>
          <div className="space-y-3">
            {archiveIssues.map((issue) => (
              <div
                key={`${issue.volume}-${issue.issue}`}
                className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                        Vol. {issue.volume}, Issue {issue.issue} · {issue.date}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {issue.readTime}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1.5 leading-snug">{issue.title}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {issue.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    className="flex-shrink-0 text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    onClick={() => {/* archive articles coming in next sprint */}}
                  >
                    Read
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom subscribe CTA */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 py-14 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Mail className="w-10 h-10 text-emerald-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Don't Miss the Next Issue</h2>
          <p className="text-emerald-100 mb-6">
            Join restoration professionals across Australia, New Zealand, and Japan reading The DR Brief.
          </p>
          <Link
            href="#subscribe"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
          >
            Subscribe Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  )
}
