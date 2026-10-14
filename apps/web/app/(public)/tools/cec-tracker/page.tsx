'use client'

/**
 * DR-40 — CEC Credit Tracker
 * Track Continuing Education Credits toward IICRC certification renewal.
 * Target: 14 CECs per 3-year renewal cycle.
 */

import { SITE_URL } from '@/lib/seo/site-url'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Award, Plus, Trash2, CheckCircle } from 'lucide-react'

type CertType = 'WRT' | 'ASD' | 'AMRT' | 'FSRT' | 'OCT' | 'CCT' | 'OSHA' | 'other'

interface CECEntry {
  id: string
  courseName: string
  certType: CertType
  completedDate: string
  credits: number
  provider: string
}

const CERT_OPTIONS: CertType[] = ['WRT', 'ASD', 'AMRT', 'FSRT', 'OCT', 'CCT', 'OSHA', 'other']

const CEC_REQUIRED = 14 // IICRC standard per 3-year cycle
const RENEWAL_YEARS = 3

function uid() { return Math.random().toString(36).slice(2, 9) }

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: `${SITE_URL}/tools` },
        { '@type': 'ListItem', position: 3, name: 'CEC Tracker', item: `${SITE_URL}/tools/cec-tracker` },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'IICRC CEC Credit Tracker',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'AUD' },
      description: 'Track Continuing Education Credits toward IICRC certification renewal.',
    },
  ],
}

export default function CECTrackerPage() {
  const [certHolder, setCertHolder] = useState('')
  const [certHeld, setCertHeld] = useState<CertType>('WRT')
  const [renewalDate, setRenewalDate] = useState('')
  const [entries, setEntries] = useState<CECEntry[]>([])

  const [newEntry, setNewEntry] = useState<Omit<CECEntry, 'id'>>({
    courseName: '',
    certType: 'WRT',
    completedDate: '',
    credits: 1,
    provider: '',
  })

  function addEntry() {
    if (!newEntry.courseName.trim() || !newEntry.completedDate) return
    setEntries(prev => [
      { ...newEntry, id: uid() },
      ...prev,
    ])
    setNewEntry({ courseName: '', certType: 'WRT', completedDate: '', credits: 1, provider: '' })
  }

  function removeEntry(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const totalCECs = useMemo(() => entries.reduce((sum, e) => sum + e.credits, 0), [entries])
  const remaining = Math.max(0, CEC_REQUIRED - totalCECs)
  const progressPct = Math.min(100, Math.round((totalCECs / CEC_REQUIRED) * 100))
  const isComplete = totalCECs >= CEC_REQUIRED

  // Days until renewal
  const daysUntilRenewal = useMemo(() => {
    if (!renewalDate) return null
    const diff = new Date(renewalDate).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }, [renewalDate])

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
            <span className="text-slate-300">CEC Tracker</span>
          </nav>

          <div className="flex items-center gap-3 mb-2">
            <Award className="w-7 h-7 text-blue-400" />
            <h1 className="text-3xl font-black">CEC Credit Tracker</h1>
          </div>
          <p className="text-slate-400 mb-10">
            Track your {CEC_REQUIRED} Continuing Education Credits required for IICRC certification renewal
            every {RENEWAL_YEARS} years.
          </p>

          {/* Profile */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
            <h2 className="font-bold mb-4">Certification Profile</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Your Name</label>
                <input
                  type="text"
                  value={certHolder}
                  onChange={e => setCertHolder(e.target.value)}
                  placeholder="Technician name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Primary Cert</label>
                <select
                  value={certHeld}
                  onChange={e => setCertHeld(e.target.value as CertType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {CERT_OPTIONS.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Renewal Date</label>
                <input
                  type="date"
                  value={renewalDate}
                  onChange={e => setRenewalDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className={`border rounded-2xl p-6 mb-6 ${
            isComplete ? 'border-green-500/40 bg-green-500/5' : 'border-slate-800 bg-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-lg">Progress</h2>
              <div className="text-right">
                <span className={`text-3xl font-black ${isComplete ? 'text-green-400' : 'text-blue-400'}`}>
                  {totalCECs}
                </span>
                <span className="text-slate-400 text-lg">/{CEC_REQUIRED}</span>
                <span className="text-slate-500 text-sm ml-1">CECs</span>
              </div>
            </div>

            <div className="h-4 bg-slate-800 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {isComplete ? (
              <div className="flex items-center gap-2 text-green-400 font-bold">
                <CheckCircle className="w-5 h-5" />
                CEC requirement met — ready for renewal
              </div>
            ) : (
              <p className="text-slate-400 text-sm">
                {remaining} more CEC{remaining !== 1 ? 's' : ''} needed to renew
              </p>
            )}

            {daysUntilRenewal !== null && (
              <p className={`text-sm mt-2 font-semibold ${
                daysUntilRenewal < 90 ? 'text-red-400' :
                daysUntilRenewal < 180 ? 'text-yellow-400' :
                'text-slate-400'
              }`}>
                {daysUntilRenewal < 0
                  ? `Renewal overdue by ${Math.abs(daysUntilRenewal)} days`
                  : `Renewal in ${daysUntilRenewal} days`}
              </p>
            )}
          </div>

          {/* Add course */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
            <h2 className="font-bold mb-4">Log a Completed Course</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Course Name *</label>
                <input
                  type="text"
                  value={newEntry.courseName}
                  onChange={e => setNewEntry(p => ({ ...p, courseName: e.target.value }))}
                  placeholder="e.g. WRT Water Damage Restoration"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Provider</label>
                <input
                  type="text"
                  value={newEntry.provider}
                  onChange={e => setNewEntry(p => ({ ...p, provider: e.target.value }))}
                  placeholder="e.g. IICRC Australia"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Cert Type</label>
                <select
                  value={newEntry.certType}
                  onChange={e => setNewEntry(p => ({ ...p, certType: e.target.value as CertType }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {CERT_OPTIONS.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Completion Date *</label>
                <input
                  type="date"
                  value={newEntry.completedDate}
                  onChange={e => setNewEntry(p => ({ ...p, completedDate: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">CECs Earned</label>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={newEntry.credits}
                  onChange={e => setNewEntry(p => ({ ...p, credits: parseInt(e.target.value) || 1 }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={addEntry}
              disabled={!newEntry.courseName.trim() || !newEntry.completedDate}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>
          </div>

          {/* Completed courses log */}
          {entries.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800">
                <h2 className="font-bold">Completed Courses ({entries.length})</h2>
              </div>
              <div className="divide-y divide-slate-800">
                {entries.map(entry => {
                  const date = new Date(entry.completedDate + 'T00:00:00').toLocaleDateString('en-AU', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })
                  return (
                    <div key={entry.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/30">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium">{entry.courseName}</span>
                          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">{entry.certType.toUpperCase()}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {entry.provider && `${entry.provider} · `}{date}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-lg font-black text-blue-300">{entry.credits}</span>
                        <span className="text-xs text-slate-500">CEC</span>
                        <button
                          onClick={() => removeEntry(entry.id)}
                          className="text-slate-600 hover:text-red-400 transition-colors"
                          aria-label="Remove entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <p className="text-xs text-slate-600 mt-6 text-center">
            IICRC requires {CEC_REQUIRED} CECs per {RENEWAL_YEARS}-year renewal cycle. Verify your specific requirements at iicrc.org.
            This tracker is a session-only tool — data is not saved between visits.
          </p>
        </div>
      </main>
    </>
  )
}
