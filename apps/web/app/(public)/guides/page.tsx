import { SITE_URL } from '@/lib/seo/site-url'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  FileText,
  ArrowRight,
  Clock,
  BookOpen,
  Shield,
  Droplets,
  Flame,
  Wind,
  Layers,
  AlertTriangle,
  ClipboardList,
  DollarSign,
  CheckCircle,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Industry Knowledge Guides | Restoration — Australia, New Zealand & Japan',
  description:
    'Authoritative technical guides on water damage, mould remediation, fire restoration, insurance claims, and IICRC standards for restoration professionals in Australia, New Zealand, and Japan.',
  openGraph: {
    title: 'Industry Knowledge Guides | NRPG',
    description:
      '10 authoritative guides covering water damage, mould, fire restoration, biohazard cleanup, insurance claims, and IICRC compliance.',
    url: `${SITE_URL}/guides`,
  },
}

const guides = [
  {
    slug: 'water-damage-restoration-guide',
    icon: Droplets,
    category: 'Water Damage',
    title: 'The Complete Guide to Water Damage Restoration in Australia',
    description:
      'Category 1, 2, and 3 water damage. IICRC S500 standard explained. Psychrometrics, structural drying, equipment placement, and insurance documentation.',
    readTime: '18 min',
    difficulty: 'Intermediate',
    accent: 'blue',
    tags: ['IICRC S500', 'WRT', 'Structural Drying', 'Insurance'],
    featured: true,
  },
  {
    slug: 'mould-remediation-guide',
    icon: Shield,
    category: 'Mould Remediation',
    title: 'Mould Remediation to IICRC S520 Standard — Australian Guide',
    description:
      'Risk assessment, containment protocols, remediation procedures, and post-remediation verification. Covers black mould (Stachybotrys) and SafeWork requirements.',
    readTime: '15 min',
    difficulty: 'Intermediate',
    accent: 'green',
    tags: ['IICRC S520', 'AMRT', 'Black Mould', 'SafeWork'],
    featured: true,
  },
  {
    slug: 'fire-smoke-damage-guide',
    icon: Flame,
    category: 'Fire & Smoke',
    title: 'Fire and Smoke Damage Restoration — Technician Guide',
    description:
      'Soot chemistry, smoke penetration, deodorisation methods (ozone vs hydroxyl), contents pack-out, and IICRC FSRT standard compliance for Australian restorers.',
    readTime: '14 min',
    difficulty: 'Intermediate',
    accent: 'orange',
    tags: ['IICRC FSRT', 'Soot Removal', 'Deodorisation', 'Contents'],
    featured: true,
  },
  {
    slug: 'storm-damage-restoration-guide',
    icon: Wind,
    category: 'Storm Damage',
    title: 'Storm Damage Restoration Guide for Australian Contractors',
    description:
      'Emergency board-up, tarping, hail and wind damage assessment, water ingress, roof repairs, and large-loss project management during Australian storm season.',
    readTime: '12 min',
    difficulty: 'Beginner',
    accent: 'teal',
    tags: ['Emergency Response', 'Roof Damage', 'Large Loss', 'QLD/NSW'],
    featured: false,
  },
  {
    slug: 'biohazard-cleanup-guide',
    icon: AlertTriangle,
    category: 'Biohazard',
    title: 'Biohazard and Crime Scene Cleanup — Australian Compliance Guide',
    description:
      'Bloodborne pathogen exposure control, PPE requirements, trauma scene decontamination, meth lab testing and remediation, and SafeWork/state licensing requirements.',
    readTime: '13 min',
    difficulty: 'Advanced',
    accent: 'red',
    tags: ['BSRT', 'Meth Lab', 'SafeWork', 'Biohazard'],
    featured: false,
  },
  {
    slug: 'insurance-claims-guide',
    icon: ClipboardList,
    category: 'Insurance Claims',
    title: 'How to Write Restoration Scopes for Australian Insurers',
    description:
      'Xactimate basics, Symbility workflows, disputed claim management, scope writing best practices, and working with loss adjusters from IAG, Suncorp, and QBE.',
    readTime: '20 min',
    difficulty: 'Advanced',
    accent: 'purple',
    tags: ['Xactimate', 'IAG', 'Suncorp', 'Scope Writing'],
    featured: true,
  },
  {
    slug: 'drying-chamber-guide',
    icon: Layers,
    category: 'Technical',
    title: 'Drying Chamber Construction and Psychrometrics — Field Guide',
    description:
      'Practical guide to building effective drying chambers: poly sheming, equipment selection, airflow optimisation, and daily readings interpretation under IICRC S500.',
    readTime: '10 min',
    difficulty: 'Intermediate',
    accent: 'blue',
    tags: ['Psychrometrics', 'ASD', 'Drying Chamber', 'IICRC S500'],
    featured: false,
  },
  {
    slug: 'pricing-restoration-jobs-guide',
    icon: DollarSign,
    category: 'Business',
    title: 'How to Price Disaster Restoration Jobs in Australia',
    description:
      'Benchmarking rates for water, fire, mould, and biohazard jobs. Equipment charge-out, labour rates, overhead calculation, and insurance vs direct billing considerations.',
    readTime: '16 min',
    difficulty: 'Intermediate',
    accent: 'emerald',
    tags: ['Pricing', 'Insurance', 'Business', 'Rates'],
    featured: false,
  },
  {
    slug: 'mould-testing-guide',
    icon: CheckCircle,
    category: 'Mould Remediation',
    title: 'Mould Testing Methods and Clearance Standards — Australian Guide',
    description:
      'Air sampling, tape lift, bulk sampling, and ERMI testing. Acceptable clearance levels, laboratory selection, and report writing for insurance and regulatory compliance.',
    readTime: '11 min',
    difficulty: 'Advanced',
    accent: 'green',
    tags: ['Air Sampling', 'AMRT', 'Clearance Testing', 'IICRC S520'],
    featured: false,
  },
  {
    slug: 'iicrc-certification-guide',
    icon: BookOpen,
    category: 'Training',
    title: 'IICRC Certification Pathways for Australian Restorers',
    description:
      'Which certifications to get first, prerequisites, costs, exam preparation, CEC requirements, and how IICRC credentials affect your insurer relationships and job win rate.',
    readTime: '9 min',
    difficulty: 'Beginner',
    accent: 'purple',
    tags: ['WRT', 'AMRT', 'IICRC', 'Certification'],
    featured: false,
  },
]

const difficultyColour: Record<string, string> = {
  Beginner: 'bg-green-100 text-green-700',
  Intermediate: 'bg-yellow-100 text-yellow-700',
  Advanced: 'bg-red-100 text-red-700',
}

const accentMap: Record<string, { border: string; text: string; bg: string; badge: string }> = {
  blue: { border: 'border-blue-200 hover:border-blue-400', text: 'text-blue-600', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  green: { border: 'border-green-200 hover:border-green-400', text: 'text-green-600', bg: 'bg-green-50', badge: 'bg-green-100 text-green-700' },
  orange: { border: 'border-orange-200 hover:border-orange-400', text: 'text-orange-600', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700' },
  teal: { border: 'border-teal-200 hover:border-teal-400', text: 'text-teal-600', bg: 'bg-teal-50', badge: 'bg-teal-100 text-teal-700' },
  red: { border: 'border-red-200 hover:border-red-400', text: 'text-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700' },
  purple: { border: 'border-purple-200 hover:border-purple-400', text: 'text-purple-600', bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700' },
  emerald: { border: 'border-emerald-200 hover:border-emerald-400', text: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
}

const featuredGuides = guides.filter((g) => g.featured)
const allGuides = guides.filter((g) => !g.featured)

const aeoFaqs = [
  {
    question: 'What technical standards govern restoration work in Australia?',
    answer:
      'The primary standards are IICRC S500 (water damage), IICRC S520 (mould remediation), and IICRC FSRT (fire/smoke). SafeWork Australia provides the Work Health and Safety framework for hazardous work. State-specific licensing applies to meth lab decontamination in WA, NSW, and QLD. Most Australian insurers require IICRC-certified technicians.',
  },
  {
    question: 'How do Australian restoration contractors get work from insurers?',
    answer:
      'The primary pathway is joining an insurer\'s Preferred Repairer Panel — IAG, Suncorp, and QBE all operate these programs. Requirements typically include IICRC certification, public liability insurance ($20M minimum), ASIC-registered business, and demonstrated restoration capacity. Platforms like NRPG also direct insurance-referral jobs to qualified contractors.',
  },
  {
    question: 'What insurance do restoration contractors need in Australia?',
    answer:
      'At minimum: public liability insurance ($20M), professional indemnity ($1–2M), workers compensation, and tools/equipment cover. Biohazard and meth lab operators also require pollution liability cover. Most insurer panels require $20M public liability as a baseline. Contracts with councils or government may require $50M.',
  },
]

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'NRPG Restoration Industry Knowledge Guides',
  description: 'Authoritative technical guides for Australian disaster restoration professionals',
  url: `${SITE_URL}/guides`,
  numberOfItems: guides.length,
  itemListElement: guides.map((guide, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: guide.title,
    url: `${SITE_URL}/guides/${guide.slug}`,
  })),
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: aeoFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Industry Partners', item: `${SITE_URL}/industry-partners` },
    { '@type': 'ListItem', position: 3, name: 'Knowledge Guides', item: `${SITE_URL}/guides` },
  ],
}

export default function KnowledgeHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/40 rounded-full text-orange-400 text-sm font-medium mb-6">
            <FileText className="w-4 h-4" />
            10 Authoritative Industry Guides
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
            Technical Knowledge for Restoration Professionals
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            IICRC standards explained. Insurance claims decoded. Practical field guides written for restorers in Australia, New Zealand, and Japan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#featured"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5" />
              Browse All Guides
            </Link>
            <Link
              href="/industry-partners"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors"
            >
              <Layers className="w-5 h-5" />
              Industry Hub
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Guides */}
      <section id="featured" className="bg-slate-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Featured Guides</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {featuredGuides.map((guide) => {
              const Icon = guide.icon
              const accent = accentMap[guide.accent]
              return (
                <article
                  key={guide.slug}
                  className={`bg-white rounded-2xl p-6 border-2 ${accent.border} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 ${accent.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${accent.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${accent.badge}`}>
                          {guide.category}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColour[guide.difficulty]}`}>
                          {guide.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {guide.readTime} read
                      </div>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2 leading-snug">{guide.title}</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">{guide.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {guide.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className={`inline-flex items-center gap-1 text-sm font-semibold ${accent.text} hover:underline`}
                  >
                    Read Guide
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              )
            })}
          </div>

          {/* All Guides */}
          <h2 className="text-2xl font-bold text-slate-900 mb-8">All Guides</h2>
          <div className="space-y-4">
            {allGuides.map((guide) => {
              const Icon = guide.icon
              const accent = accentMap[guide.accent]
              return (
                <article
                  key={guide.slug}
                  className={`bg-white rounded-xl p-5 border-2 ${accent.border} transition-all hover:shadow-sm`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${accent.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${accent.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${accent.badge}`}>
                          {guide.category}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColour[guide.difficulty]}`}>
                          {guide.difficulty}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {guide.readTime}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 leading-snug">{guide.title}</h3>
                    </div>
                    <Link
                      href={`/guides/${guide.slug}`}
                      className={`flex-shrink-0 inline-flex items-center gap-1 text-sm font-semibold ${accent.text} hover:underline`}
                    >
                      Read
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* AEO FAQ */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Industry Standards — Common Questions
            </h2>
            <p className="text-slate-500">
              Answers based on IICRC standards, SafeWork Australia requirements, and Australian insurer agreements.
            </p>
          </div>

          <div className="space-y-4">
            {aeoFaqs.map((faq) => (
              <div key={faq.question} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">{faq.question}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Apply Your Knowledge on Real Jobs
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            NRPG connects certified Australian restorers with verified disaster recovery jobs across all 8 states.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-started"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-700 font-bold rounded-xl hover:bg-orange-50 transition-colors shadow-lg"
            >
              Join NRPG Network
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-colors"
            >
              Back to Learning Hub
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
