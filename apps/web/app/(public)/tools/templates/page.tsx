import { SITE_URL } from '@/lib/seo/site-url'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Download,
  FileText,
  ClipboardList,
  ShieldCheck,
  Droplets,
  Flame,
  Layers,
  ArrowRight,
  Lock,
  CheckCircle,
  BookOpen,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Free Restoration Templates & Downloads | NRPG — Australia, New Zealand & Japan',
  description:
    'Free downloadable templates for restoration professionals: moisture mapping sheets, drying logs, scope of works, safety checklists, and insurance documentation.',
}

const freeTemplates = [
  {
    icon: ClipboardList,
    title: 'Daily Drying Log — IICRC S500',
    description:
      'Record daily moisture readings, temperature, RH, dew point, and GPP. Pre-formatted for IICRC S500 compliance and insurer documentation.',
    format: 'PDF + Excel',
    category: 'Water Damage',
    accent: 'blue',
  },
  {
    icon: Droplets,
    title: 'Moisture Mapping Sheet — Residential',
    description:
      'Floor plan grid for plotting pin and non-invasive moisture readings across affected rooms. Includes reference moisture content targets per material.',
    format: 'PDF',
    category: 'Water Damage',
    accent: 'blue',
  },
  {
    icon: ShieldCheck,
    title: 'PPE Pre-Job Safety Checklist',
    description:
      'Pre-job safety checklist covering PPE selection, Tyvek suit donning/doffing, respirator fit check, and SafeWork hazard identification for biohazard and mould jobs.',
    format: 'PDF',
    category: 'Safety',
    accent: 'red',
  },
  {
    icon: FileText,
    title: 'Job Completion Report — Water Damage',
    description:
      'Client-facing completion report template: moisture readings before/after, equipment used, standards complied with, and insurer sign-off fields.',
    format: 'Word / PDF',
    category: 'Documentation',
    accent: 'emerald',
  },
  {
    icon: ClipboardList,
    title: 'Mould Remediation Work Plan Template',
    description:
      'IICRC S520-aligned work plan template covering scope, containment method, PPE requirements, disposal protocol, and post-remediation testing plan.',
    format: 'Word / PDF',
    category: 'Mould',
    accent: 'green',
  },
  {
    icon: FileText,
    title: 'Category & Class Determination Worksheet',
    description:
      'Guided worksheet for determining IICRC water damage category (1/2/3) and moisture class (1/2/3/4) at initial inspection. Suitable for insurer submission.',
    format: 'PDF',
    category: 'Water Damage',
    accent: 'blue',
  },
]

const gatedTemplates = [
  {
    icon: ClipboardList,
    title: 'Scope of Works — Water Damage (Xactimate-Aligned)',
    description:
      'Detailed scope of works template aligned with Xactimate line items. Pre-filled common mitigation and restoration line items for Cat 1–3 water jobs.',
    format: 'Excel',
    category: 'Insurance',
    accent: 'purple',
    gated: true,
  },
  {
    icon: Flame,
    title: 'Fire & Smoke Damage Scope Template',
    description:
      'Soot removal, deodorisation, contents pack-out, and structural repair line items. IICRC FSRT-referenced with insurer documentation fields.',
    format: 'Excel',
    category: 'Fire & Smoke',
    accent: 'orange',
    gated: true,
  },
  {
    icon: ShieldCheck,
    title: 'Insurance Dispute Letter Templates (3 types)',
    description:
      'Professionally worded templates for disputing scope reductions, requesting re-inspection, and escalating unresolved claims with Australian insurers.',
    format: 'Word',
    category: 'Insurance',
    accent: 'purple',
    gated: true,
  },
  {
    icon: BookOpen,
    title: 'IICRC Standards Quick Reference Cards',
    description:
      'One-page reference cards for S500, S520, and FSRT standards. Field-ready moisture content targets, equipment ratios, and compliance checkpoints.',
    format: 'PDF',
    category: 'Reference',
    accent: 'teal',
    gated: true,
  },
]

const accentMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200 hover:border-blue-400', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
  green: { bg: 'bg-green-50', border: 'border-green-200 hover:border-green-400', text: 'text-green-600', badge: 'bg-green-100 text-green-700' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200 hover:border-emerald-400', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  red: { bg: 'bg-red-50', border: 'border-red-200 hover:border-red-400', text: 'text-red-600', badge: 'bg-red-100 text-red-700' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200 hover:border-purple-400', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200 hover:border-orange-400', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200 hover:border-teal-400', text: 'text-teal-600', badge: 'bg-teal-100 text-teal-700' },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Industry Partners', item: `${SITE_URL}/industry-partners` },
    { '@type': 'ListItem', position: 3, name: 'Tools', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 4, name: 'Templates & Downloads', item: `${SITE_URL}/tools/templates` },
  ],
}

export default function TemplatesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 text-sm font-medium mb-6">
            <Download className="w-4 h-4" />
            Free Downloads for Restoration Professionals
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
            Restoration Templates &amp; Resource Library
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            IICRC-aligned documentation templates, safety checklists, scope of works, and reference cards — free for restoration professionals in Australia, New Zealand, and Japan.
          </p>
        </div>
      </section>

      {/* Free templates */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Free Templates</h2>
              <p className="text-sm text-slate-500">No sign-up required — download immediately</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {freeTemplates.map((template) => {
              const Icon = template.icon
              const accent = accentMap[template.accent]
              return (
                <div
                  key={template.title}
                  className={`bg-white rounded-2xl p-6 border-2 ${accent.border} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 ${accent.bg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${accent.text}`} />
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${accent.badge}`}>
                      {template.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">{template.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">{template.format}</span>
                    <Link
                      href="/contact"
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${accent.text} hover:underline`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Free
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Gated templates */}
      <section className="bg-white py-20 px-6 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Premium Templates</h2>
              <p className="text-sm text-slate-500">Register your business for free access</p>
            </div>
          </div>
          <p className="text-slate-600 mb-10 max-w-2xl">
            More advanced documentation templates are available to registered NRPG network members. Registration is free.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            {gatedTemplates.map((template) => {
              const Icon = template.icon
              const accent = accentMap[template.accent]
              return (
                <div
                  key={template.title}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-200 relative overflow-hidden"
                >
                  <div className="absolute top-3 right-3">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex items-start gap-4 mb-3">
                    <div className={`w-10 h-10 ${accent.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${accent.text}`} />
                    </div>
                    <div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${accent.badge} mb-1 inline-block`}>
                        {template.category}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900">{template.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">{template.format}</span>
                    <Link
                      href="/get-started"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Lock className="w-3 h-3" />
                      Register Free
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Get Unlimited Template Access
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Register as an NRPG contractor for free — unlock all templates, receive jobs, and access the full industry hub.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-started"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Register Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-colors"
            >
              <Layers className="w-5 h-5" />
              All Tools
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
