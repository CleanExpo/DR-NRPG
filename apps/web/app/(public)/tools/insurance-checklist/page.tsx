'use client'

/**
 * DR-40 — Insurance Claim Documentation Checklist
 * Interactive checklist covering all items required for
 * a successful insurance claim in AU, NZ, and Japan.
 */

import { SITE_URL } from '@/lib/seo/site-url'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ClipboardList, CheckCircle, Circle, ChevronDown, ChevronUp, Printer } from 'lucide-react'

interface CheckItem {
  id: string
  label: string
  description: string
  required: boolean
}

interface CheckSection {
  title: string
  items: CheckItem[]
}

const SECTIONS: CheckSection[] = [
  {
    title: 'Immediate Documentation (On-site)',
    items: [
      { id: '1a', label: 'Photographs — overview of damage', description: 'Wide-angle shots showing full extent before any work begins. Minimum 10 photos per room.', required: true },
      { id: '1b', label: 'Photographs — close-up damage detail', description: 'Macro shots of staining, structural damage, mould, and watermarks.', required: true },
      { id: '1c', label: 'Cause of loss documentation', description: 'Photo or written record of the source (burst pipe, storm entry point, etc.).', required: true },
      { id: '1d', label: 'Moisture readings logged', description: 'All initial moisture readings by material and location, time-stamped.', required: true },
      { id: '1e', label: 'Client signature on scope', description: 'Signed authority to proceed and initial scope document.', required: true },
    ],
  },
  {
    title: 'Scope of Works',
    items: [
      { id: '2a', label: 'Written scope of works prepared', description: 'Line-item scope covering all damaged areas, materials, and restoration steps.', required: true },
      { id: '2b', label: 'Xactimate / Symbility estimate', description: 'Industry-standard estimating software output. Required by most insurers.', required: true },
      { id: '2c', label: 'IICRC S-standard compliance noted', description: 'Reference applicable standard (S500 water, S520 mould, S770 fire) in scope.', required: false },
      { id: '2d', label: 'Affected area measurements', description: 'Floor, wall, and ceiling dimensions per room. Support photo with measuring tape.', required: true },
      { id: '2e', label: 'Material specification', description: 'Document existing material types for like-for-like reinstatement costing.', required: false },
    ],
  },
  {
    title: 'Contractor Reports',
    items: [
      { id: '3a', label: 'Drying logs (daily readings)', description: 'Daily moisture readings at each monitoring point throughout drying phase.', required: true },
      { id: '3b', label: 'Equipment placement diagram', description: 'Room diagram showing dehumidifier and air mover locations.', required: false },
      { id: '3c', label: 'Drying complete certificate', description: 'Written declaration that all materials are within dry standards before reinstatement.', required: true },
      { id: '3d', label: 'Third-party hygienist report (if mould)', description: 'Independent hygienist report for Category 3 / mould jobs. Required by most insurers.', required: false },
      { id: '3e', label: 'Trade qualification certificates', description: 'Copy of IICRC certification (WRT, ASD, AMRT, FSRT) for the attending technician.', required: false },
    ],
  },
  {
    title: 'Financial Documentation',
    items: [
      { id: '4a', label: 'Tax invoice issued', description: 'GST-inclusive invoice with ABN, date, job address, and line items.', required: true },
      { id: '4b', label: 'Receipts for hired equipment', description: 'Third-party equipment hire receipts if applicable.', required: false },
      { id: '4c', label: 'Labour hours record', description: 'Signed timesheet or job management system export per technician.', required: true },
      { id: '4d', label: 'Subcontractor invoices', description: 'Invoices for any subcontracted trades (electrician, plumber, plasterer).', required: false },
    ],
  },
  {
    title: 'Sign-offs & Authorisations',
    items: [
      { id: '5a', label: 'Insurer scope approval (before work)', description: 'Written approval from insurer or loss adjuster before commencing major works.', required: true },
      { id: '5b', label: 'Client satisfaction sign-off', description: 'Client signature confirming all works completed to satisfaction.', required: true },
      { id: '5c', label: 'Reinstatement contractor hand-over', description: 'Formal hand-over to builder/reinstatement contractor. Drying logs included.', required: false },
      { id: '5d', label: 'Dispute/supplement documentation', description: 'If supplementing the claim, include photos and written justification for each line item.', required: false },
    ],
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: `${SITE_URL}/tools` },
        { '@type': 'ListItem', position: 3, name: 'Insurance Checklist', item: `${SITE_URL}/tools/insurance-checklist` },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Insurance Claim Documentation Checklist',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'AUD' },
      description: 'Interactive insurance claim documentation checklist for disaster recovery contractors in Australia, New Zealand, and Japan.',
    },
  ],
}

export default function InsuranceChecklistPage() {
  const allIds = SECTIONS.flatMap(s => s.items.map(i => i.id))
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set(SECTIONS.map(s => s.title)))

  function toggleItem(id: string) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSection(title: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(title) ? next.delete(title) : next.add(title)
      return next
    })
  }

  function checkAll() { setChecked(new Set(allIds)) }
  function clearAll() { setChecked(new Set()) }

  const requiredIds = SECTIONS.flatMap(s => s.items.filter(i => i.required).map(i => i.id))
  const { totalChecked, requiredChecked, totalItems, requiredItems } = useMemo(() => ({
    totalChecked: checked.size,
    requiredChecked: requiredIds.filter(id => checked.has(id)).length,
    totalItems: allIds.length,
    requiredItems: requiredIds.length,
  }), [checked, requiredIds, allIds.length])

  const allRequiredDone = requiredChecked === requiredItems
  const progressPct = Math.round((totalChecked / totalItems) * 100)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="bg-[#050505] text-white min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <nav className="text-sm text-slate-500 mb-8 flex gap-2">
            <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-slate-300">Insurance Checklist</span>
          </nav>

          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="w-7 h-7 text-blue-400" />
            <h1 className="text-3xl font-black">Insurance Claim Checklist</h1>
          </div>
          <p className="text-slate-400 mb-8">
            Complete documentation checklist for disaster recovery insurance claims.
            Required items must be completed before submitting a claim.
          </p>

          {/* Progress bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-bold text-lg">{totalChecked}/{totalItems}</span>
                <span className="text-slate-400 text-sm ml-2">items complete</span>
              </div>
              <div className="text-right">
                <span className={`font-bold text-sm ${allRequiredDone ? 'text-green-400' : 'text-yellow-400'}`}>
                  {requiredChecked}/{requiredItems} required
                </span>
              </div>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${allRequiredDone ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {allRequiredDone && (
              <p className="text-green-400 text-sm font-semibold mt-3">
                ✓ All required items complete — claim documentation ready
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button onClick={checkAll} className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors">
              Check All
            </button>
            <button onClick={clearAll} className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors">
              Clear All
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors ml-auto">
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {SECTIONS.map(section => {
              const sectionChecked = section.items.filter(i => checked.has(i.id)).length
              const isExpanded = expanded.has(section.title)

              return (
                <div key={section.title} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{section.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        sectionChecked === section.items.length
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {sectionChecked}/{section.items.length}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-800">
                      {section.items.map(item => {
                        const isChecked = checked.has(item.id)
                        return (
                          <div
                            key={item.id}
                            className={`flex items-start gap-4 px-6 py-4 border-t border-slate-800/50 cursor-pointer hover:bg-slate-800/30 transition-colors ${
                              isChecked ? 'opacity-60' : ''
                            }`}
                            onClick={() => toggleItem(item.id)}
                          >
                            {isChecked
                              ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                              : <Circle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                            }
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-sm font-medium ${isChecked ? 'line-through text-slate-500' : ''}`}>
                                  {item.label}
                                </span>
                                {item.required && (
                                  <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">Required</span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <p className="text-xs text-slate-600 mt-6 text-center">
            Guide only. Requirements vary by insurer, claim type, and jurisdiction (AU/NZ/JP).
            Always confirm documentation requirements with the insurer or loss adjuster before commencing work.
          </p>
        </div>
      </main>
    </>
  )
}
