'use client'

/**
 * DR-46 — Discussion Forum / Community Hub
 * /community — forum landing with 9 categories, early-access sign-up.
 * Phase 1: community hub with category listing + email capture.
 */

import { SITE_URL } from '@/lib/seo/site-url'
import { useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Users, CheckCircle } from 'lucide-react'

type SignUpState = 'idle' | 'submitting' | 'success' | 'error'

interface Category {
  slug: string
  icon: string
  title: string
  description: string
  topicCount: number
  memberCount: number
}

const CATEGORIES: Category[] = [
  { slug: 'water-damage',         icon: '💧', title: 'Water Damage Restoration',   description: 'Drying techniques, S500 discussions, equipment, moisture readings, dehumidification.', topicCount: 0, memberCount: 0 },
  { slug: 'mould-remediation',    icon: '🟢', title: 'Mould Remediation',          description: 'S520 protocol, containment, air sampling, hygienist reports, PRV discussion.',           topicCount: 0, memberCount: 0 },
  { slug: 'carpet-hard-floor',    icon: '🧹', title: 'Carpet, Upholstery & Floors', description: 'Carpet extraction, hard floor restoration, spotting, odour removal.',                   topicCount: 0, memberCount: 0 },
  { slug: 'equipment-technology', icon: '⚙️', title: 'Equipment & Technology',      description: 'Equipment reviews, software comparisons, new tech, AI tools in restoration.',            topicCount: 0, memberCount: 0 },
  { slug: 'insurance-claims',     icon: '📋', title: 'Insurance & Claims',          description: 'Claim strategies, supplements, scope disputes, insurer dealings, Xactimate.',            topicCount: 0, memberCount: 0 },
  { slug: 'business-management',  icon: '📊', title: 'Business Management',         description: 'Pricing, cash flow, hiring, contracts, growth, systemisation.',                         topicCount: 0, memberCount: 0 },
  { slug: 'training-certification',icon: '🎓', title: 'Training & Certification',   description: 'IICRC courses, study tips, CEC tracking, upcoming courses across AU/NZ/JP.',            topicCount: 0, memberCount: 0 },
  { slug: 'introductions',        icon: '👋', title: 'Introductions & Networking', description: 'Introduce yourself, find referral partners, regional connections.',                      topicCount: 0, memberCount: 0 },
  { slug: 'job-board',            icon: '💼', title: 'Job Board',                  description: 'Tech wanted, positions available, subcontract work in your area.',                       topicCount: 0, memberCount: 0 },
]

const BENEFITS = [
  'Get early access to the forum before public launch',
  'Shape the community guidelines and category structure',
  'Founding member badge on your profile',
  'First access to the industry poll results and benchmark data',
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Community', item: `${SITE_URL}/community` },
      ],
    },
    {
      '@type': 'DiscussionForumPosting',
      name: 'DR Professional Community Forum',
      description: 'Professional discussion forum for disaster recovery and restoration contractors in Australia, New Zealand, and Japan.',
      url: `${SITE_URL}/community`,
    },
  ],
}

export default function CommunityPage() {
  const [email, setEmail] = useState('')
  const [signUpState, setSignUpState] = useState<SignUpState>('idle')

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSignUpState('submitting')
    await new Promise(res => setTimeout(res, 800))
    setSignUpState('success')
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="bg-[#050505] text-white min-h-screen">
        {/* Hero */}
        <section className="px-6 py-20 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-blue-400 text-sm font-semibold mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Coming Soon — Join the Waitlist
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            The DR Professional Community
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            A moderated forum for disaster recovery and restoration professionals across Australia,
            New Zealand, and Japan. Ask questions, share knowledge, find referral partners.
          </p>

          {/* Stats preview */}
          <div className="flex items-center justify-center gap-8 mb-10">
            <div className="text-center">
              <p className="text-3xl font-black text-blue-400">9</p>
              <p className="text-xs text-slate-500 mt-1">Categories</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-green-400">2,800+</p>
              <p className="text-xs text-slate-500 mt-1">Professionals</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-yellow-400">3</p>
              <p className="text-xs text-slate-500 mt-1">Countries</p>
            </div>
          </div>

          {/* Early access sign-up */}
          {signUpState === 'success' ? (
            <div className="inline-flex items-center gap-3 bg-green-500/10 border border-green-500/30 px-6 py-4 rounded-2xl">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-300 font-semibold">You&apos;re on the list — we&apos;ll notify you at launch.</p>
            </div>
          ) : (
            <form onSubmit={handleSignUp} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your work email address"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <button type="submit" disabled={signUpState === 'submitting'}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-xl font-bold text-sm transition-colors whitespace-nowrap">
                {signUpState === 'submitting' ? 'Joining...' : 'Get Early Access'}
              </button>
            </form>
          )}
        </section>

        {/* Benefits */}
        <section className="px-6 pb-12 max-w-4xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-12">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Founding Member Benefits
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {BENEFITS.map(b => (
                <div key={b} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Category preview */}
        <section className="px-6 pb-20 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            Forum Categories
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map(cat => (
              <div key={cat.slug}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-colors relative group">
                {/* Coming soon overlay */}
                <div className="absolute inset-0 rounded-2xl bg-[#050505]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-slate-400 font-semibold">Opening at launch</span>
                </div>

                <span className="text-2xl mb-3 block">{cat.icon}</span>
                <h3 className="font-bold text-sm mb-1">{cat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{cat.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm mb-4">
              Already part of the DR social community?
            </p>
            <Link href="/social"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors">
              Visit the Social Hub →
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
