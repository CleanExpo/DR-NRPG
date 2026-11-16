import { SITE_URL } from '@/lib/seo/site-url'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  BookOpen,
  Video,
  Headphones,
  FileText,
  ArrowRight,
  Star,
  Award,
  ExternalLink,
  GraduationCap,
  Layers,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Learning Hub | Restoration Training — Australia, New Zealand & Japan',
  description:
    'NRPG training modules, training videos, industry podcasts, and technical books for disaster restoration professionals in Australia, New Zealand, and Japan.',
  openGraph: {
    title: 'Learning Hub | Restoration Training — NRPG',
    description:
      'Upskill with NRPG training modules, restoration training videos, industry podcasts, and reference books — for AU, NZ, and Japan restorers.',
    url: `${SITE_URL}/learn`,
  },
}

const trainingModules = [
  {
    code: 'water-damage',
    name: 'Water Damage Restoration',
    level: 'Technician',
    description:
      'Foundation training for water extraction, structural drying and moisture mapping across Category 1–3 water damage jobs.',
    prereqs: 'None',
    accent: 'blue',
  },
  {
    code: 'mould',
    name: 'Mould Remediation',
    level: 'Technician',
    description:
      'Mould assessment, containment and remediation, air quality testing and clearance procedures.',
    prereqs: 'Water damage restoration training recommended',
    accent: 'green',
  },
  {
    code: 'fire-smoke',
    name: 'Fire and Smoke Restoration',
    level: 'Technician',
    description:
      'Soot removal, smoke odour neutralisation and structural fire damage restoration techniques.',
    prereqs: 'None',
    accent: 'orange',
  },
  {
    code: 'biohazard',
    name: 'Biohazard and Crime Scene Remediation',
    level: 'Technician',
    description:
      'Bloodborne pathogen handling, PPE protocols, trauma scene decontamination and SafeWork compliance for biohazard technicians.',
    prereqs: 'None',
    accent: 'red',
  },
  {
    code: 'structural-drying',
    name: 'Structural Drying',
    level: 'Advanced',
    description:
      'Advanced psychrometrics, drying chamber construction, equipment selection and placement for complex structural drying scenarios.',
    prereqs: 'Water damage restoration training required',
    accent: 'purple',
  },
  {
    code: 'commercial-drying',
    name: 'Commercial Drying',
    level: 'Specialist',
    description:
      'Large-loss commercial drying projects. Multi-storey buildings, controlled environments, and document/contents restoration.',
    prereqs: 'Water damage restoration and structural drying training required',
    accent: 'teal',
  },
]

const featuredResources = [
  {
    type: 'Video Series',
    icon: Video,
    title: 'Water Restoration Fundamentals',
    description: 'Step-by-step video walkthroughs of Category 1, 2, and 3 water damage jobs — from initial inspection to final clearance.',
    badge: 'Free',
    accent: 'blue',
  },
  {
    type: 'Podcast',
    icon: Headphones,
    title: 'The Restoration Rundown',
    description: 'Weekly podcast covering industry updates, insurance claims trends, equipment reviews, and interviews with leading Australian restorers.',
    badge: 'Free',
    accent: 'purple',
  },
  {
    type: 'Reference Book',
    icon: BookOpen,
    title: 'Recognised Industry Standards for Water Damage Restoration',
    description: 'The definitive technical standard on professional water damage restoration. Recommended reading for water damage restoration and structural drying trainees.',
    badge: 'Paid',
    accent: 'emerald',
  },
  {
    type: 'Reference Book',
    icon: BookOpen,
    title: 'Recognised Industry Standards for Mould Remediation',
    description: 'The recognised industry standard for mould remediation, covering assessment, containment, remediation, and post-remediation verification.',
    badge: 'Paid',
    accent: 'green',
  },
  {
    type: 'Video Series',
    icon: Video,
    title: 'Insurance Claims Process for Restorers',
    description: 'Navigate Australian insurance claims: scope writing, insurer liaison, Xactimate documentation, and disputed claim management.',
    badge: 'Free',
    accent: 'orange',
  },
  {
    type: 'Podcast',
    icon: Headphones,
    title: 'Safety in Restoration',
    description: 'SafeWork Australia compliance, PPE selection, confined space entry, chemical handling, and incident reporting for restoration businesses.',
    badge: 'Free',
    accent: 'red',
  },
]

const accentMap: Record<string, { bg: string; border: string; text: string; badge: string; badgeAlt: string }> = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', badgeAlt: 'bg-blue-600 text-white' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', badge: 'bg-green-100 text-green-700', badgeAlt: 'bg-green-600 text-white' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700', badgeAlt: 'bg-orange-600 text-white' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', badge: 'bg-red-100 text-red-700', badgeAlt: 'bg-red-600 text-white' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700', badgeAlt: 'bg-purple-600 text-white' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600', badge: 'bg-teal-100 text-teal-700', badgeAlt: 'bg-teal-600 text-white' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', badgeAlt: 'bg-emerald-600 text-white' },
}

const aeoFaqs = [
  {
    question: 'Which training module should I start with?',
    answer:
      'Water damage restoration is the most foundational module for Australian restorers. It covers extraction, structural drying and moisture mapping, and it is the base for advanced modules such as structural drying and commercial drying. Start there, then add mould remediation or fire and smoke restoration based on your local market demand.',
  },
  {
    question: 'How do I choose between training providers?',
    answer:
      'Check that the provider is open about what each course covers, how it is assessed and what you receive at the end. Ask your insurers and clients which credentials they look for, and compare the course content against the work you actually do on site.',
  },
  {
    question: 'Do insurers look at contractor qualifications?',
    answer:
      'Insurers commonly ask restoration contractors to show current training and qualifications for the work they carry out. Requirements differ between insurers, so confirm the current expectations with each insurer you work with.',
  },
  {
    question: 'How do I keep my training current?',
    answer:
      'Keep a record of your continuing professional development (CPD) hours from workshops, online courses, industry events and advanced training. If you hold a certificate from an external body, check that body\'s renewal rules directly.',
  },
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Industry Partners', item: `${SITE_URL}/industry-partners` },
    { '@type': 'ListItem', position: 3, name: 'Learning Hub', item: `${SITE_URL}/learn` },
  ],
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

export default function LearningHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/40 rounded-full text-blue-400 text-sm font-medium mb-6">
            <GraduationCap className="w-4 h-4" />
            NRPG Training
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
            Restoration Learning Hub for AU, NZ &amp; Japan
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            NRPG training guides, training videos, industry podcasts, and technical references — everything a restoration professional across Australia, New Zealand, and Japan needs to keep their skills current and stay competitive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
            >
              <Award className="w-5 h-5" />
              Find Training Near You
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

      {/* Stats band */}
      <section className="bg-white border-b border-slate-200 py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { value: '6', label: 'NRPG training modules', sub: 'For AU/NZ restorers' },
            { value: '3', label: 'Countries covered', sub: 'Australia, New Zealand, Japan' },
            { value: 'CPD', label: 'Hours tracker', sub: 'Keep your training current' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-slate-900 mb-1">{s.value}</div>
              <div className="text-sm font-medium text-slate-700">{s.label}</div>
              <div className="text-xs text-slate-400">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Training modules */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">NRPG Training Modules for Australian Restorers</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Core NRPG training modules covering the main restoration skill areas. Find upcoming training on the{' '}
              <Link href="/events" className="text-emerald-600 hover:text-emerald-700 underline">
                ANZ Events Calendar
              </Link>
              .
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingModules.map((course) => {
              const accent = accentMap[course.accent]
              return (
                <div key={course.code} className={`bg-white rounded-2xl p-6 border-2 ${accent.border}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold ${accent.badgeAlt}`}>
                      {course.level}
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">{course.name}</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">{course.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Prereqs: {course.prereqs}</span>
                    <span className={`font-medium ${accent.text}`}>NRPG module</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
            >
              Find Upcoming Training
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Learning Resources */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Learning Resources</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Videos, podcasts, and reference materials curated for Australian and New Zealand restoration professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredResources.map((resource) => {
              const Icon = resource.icon
              const accent = accentMap[resource.accent]
              return (
                <div key={resource.title} className={`bg-white rounded-2xl p-6 border-2 ${accent.border} hover:shadow-md transition-shadow`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 ${accent.bg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${accent.text}`} />
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      resource.badge === 'Free' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {resource.badge}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">{resource.type}</div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2 leading-snug">{resource.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{resource.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* AEO FAQ */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Training — Common Questions
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Practical answers for restoration professionals in Australia, New Zealand and Japan.
            </p>
          </div>

          <div className="space-y-4">
            {aeoFaqs.map((faq) => (
              <div key={faq.question} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-3">{faq.question}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 mb-4">
              Looking for upcoming training in your state?
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
            >
              View the ANZ Events Calendar
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Grow Your Skills?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Browse the ANZ Events Calendar for the next training event near you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              <Award className="w-5 h-5" />
              Browse Training
            </Link>
            <Link
              href="/get-started"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-colors"
            >
              Join NRPG Network
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
