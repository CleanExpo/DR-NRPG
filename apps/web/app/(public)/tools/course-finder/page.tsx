'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import {
  Search,
  Award,
  MapPin,
  Calendar,
  ChevronDown,
  ArrowRight,
  Filter,
  BookOpen,
  Clock,
  Layers,
  CheckCircle,
} from 'lucide-react'

const certifications = [
  {
    code: 'WRT',
    name: 'Water Damage Restoration Technician',
    category: 'Water Damage',
    level: 'Technician',
    duration: '3 days',
    prereqs: 'None',
    examType: 'Written',
    cecs: 14,
    renewalYears: 4,
    description:
      'Foundation certification for water extraction, structural drying, and moisture mapping. The most in-demand IICRC certification in Australia — required for the majority of insurer-referred water damage jobs.',
    insurerRecognition: ['IAG', 'Suncorp', 'QBE', 'Allianz', 'NRMA'],
    standards: ['Water damage restoration'],
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT', 'NZ'],
    avgCostAUD: 1100,
    jobImpact: 'High',
  },
  {
    code: 'AMRT',
    name: 'Applied Microbial Remediation Technician',
    category: 'Mould',
    level: 'Technician',
    duration: '3 days',
    prereqs: 'WRT recommended',
    examType: 'Written',
    cecs: 14,
    renewalYears: 4,
    description:
      'Mould assessment, containment, remediation, and post-clearance testing. Covers the recognised industry standard and is essential for any restorer handling water-damaged properties with mould growth.',
    insurerRecognition: ['IAG', 'Suncorp', 'QBE'],
    standards: ['Mould remediation'],
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'NZ'],
    avgCostAUD: 1150,
    jobImpact: 'High',
  },
  {
    code: 'FSRT',
    name: 'Fire and Smoke Restoration Technician',
    category: 'Fire & Smoke',
    level: 'Technician',
    duration: '2 days',
    prereqs: 'None',
    examType: 'Written',
    cecs: 14,
    renewalYears: 4,
    description:
      'Soot removal, smoke deodorisation, contents restoration, and structural fire damage cleanup under IICRC FSRT standard. High demand following the 2019–2020 bushfire season.',
    insurerRecognition: ['IAG', 'Suncorp', 'QBE', 'Allianz'],
    standards: ['IICRC FSRT'],
    states: ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'NZ'],
    avgCostAUD: 950,
    jobImpact: 'High',
  },
  {
    code: 'ASD',
    name: 'Applied Structural Drying Technician',
    category: 'Water Damage',
    level: 'Advanced',
    duration: '3 days',
    prereqs: 'WRT required',
    examType: 'Written + Practical',
    cecs: 14,
    renewalYears: 4,
    description:
      'Advanced structural drying using psychrometrics, drying chamber construction, and equipment optimisation. Required for complex multi-storey and Category 3 water damage projects.',
    insurerRecognition: ['IAG', 'Suncorp'],
    standards: ['Water damage restoration'],
    states: ['NSW', 'VIC', 'QLD', 'WA'],
    avgCostAUD: 1600,
    jobImpact: 'Medium',
  },
  {
    code: 'BSRT',
    name: 'Biohazard and Crime Scene Remediation Technician',
    category: 'Biohazard',
    level: 'Technician',
    duration: '2 days',
    prereqs: 'None',
    examType: 'Written',
    cecs: 14,
    renewalYears: 4,
    description:
      'Bloodborne pathogen exposure control, PPE protocols, trauma scene decontamination, and meth lab remediation procedures. SafeWork compliance for biohazard-classified work.',
    insurerRecognition: ['IAG', 'QBE'],
    standards: ['IICRC BSRT', 'SafeWork'],
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA'],
    avgCostAUD: 1000,
    jobImpact: 'Medium',
  },
  {
    code: 'CDS',
    name: 'Commercial Drying Specialist',
    category: 'Water Damage',
    level: 'Specialist',
    duration: '3 days',
    prereqs: 'WRT + ASD required',
    examType: 'Written + Practical',
    cecs: 14,
    renewalYears: 4,
    description:
      'Large-loss commercial drying: multi-storey buildings, controlled environments, document and contents restoration. Essential for restorers targeting commercial and government contracts.',
    insurerRecognition: ['IAG', 'Suncorp', 'QBE'],
    standards: ['Water damage restoration', 'IICRC CDS'],
    states: ['NSW', 'VIC', 'QLD'],
    avgCostAUD: 1900,
    jobImpact: 'Medium',
  },
]

const categoryOptions = ['All Categories', 'Water Damage', 'Mould', 'Fire & Smoke', 'Biohazard']
const levelOptions = ['All Levels', 'Technician', 'Advanced', 'Specialist']
const stateOptions = ['All States', 'NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT', 'NZ', 'Japan']

const jobImpactColour: Record<string, string> = {
  High: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-slate-100 text-slate-500',
}

const levelColour: Record<string, string> = {
  Technician: 'bg-blue-100 text-blue-700',
  Advanced: 'bg-purple-100 text-purple-700',
  Specialist: 'bg-orange-100 text-orange-700',
}

export default function CourseFinderPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [levelFilter, setLevelFilter] = useState('All Levels')
  const [stateFilter, setStateFilter] = useState('All States')
  const [expandedCode, setExpandedCode] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return certifications.filter((cert) => {
      const matchesSearch =
        !search ||
        cert.name.toLowerCase().includes(search.toLowerCase()) ||
        cert.code.toLowerCase().includes(search.toLowerCase()) ||
        cert.category.toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        categoryFilter === 'All Categories' || cert.category === categoryFilter
      const matchesLevel = levelFilter === 'All Levels' || cert.level === levelFilter
      const matchesState =
        stateFilter === 'All States' || cert.states.includes(stateFilter)
      return matchesSearch && matchesCategory && matchesLevel && matchesState
    })
  }, [search, categoryFilter, levelFilter, stateFilter])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 text-sm font-medium mb-6">
            <Award className="w-4 h-4" />
            IICRC Certification Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
            Find Your Next IICRC Certification
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Compare IICRC certifications by category, level, cost, and insurer recognition — for restoration professionals in Australia, New Zealand, and Japan.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-slate-200 py-6 px-6 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by code, name, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
              >
                {categoryOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Level */}
            <div className="relative">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="pl-4 pr-8 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
              >
                {levelOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* State */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
              >
                {stateOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-500">
            {filtered.length} certification{filtered.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-10 px-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Award className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No certifications match your filters.</p>
              <p className="text-sm mt-1">Try adjusting your search or clearing some filters.</p>
            </div>
          )}

          {filtered.map((cert) => {
            const isExpanded = expandedCode === cert.code
            return (
              <div
                key={cert.code}
                className="bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-300 transition-all overflow-hidden"
              >
                {/* Header row */}
                <button
                  onClick={() => setExpandedCode(isExpanded ? null : cert.code)}
                  className="w-full text-left p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-emerald-700">{cert.code}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${levelColour[cert.level]}`}>
                            {cert.level}
                          </span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${jobImpactColour[cert.jobImpact]}`}>
                            {cert.jobImpact} Job Impact
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-slate-900">{cert.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {cert.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {cert.prereqs}
                          </span>
                          <span className="font-medium text-slate-700">~${cert.avgCostAUD.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-6 pb-6">
                    <p className="text-sm text-slate-600 leading-relaxed mt-4 mb-5">{cert.description}</p>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Certification Details</h4>
                        <dl className="space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Standard</dt>
                            <dd className="text-slate-900 font-medium">{cert.standards.join(', ')}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Exam type</dt>
                            <dd className="text-slate-900 font-medium">{cert.examType}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Renewal</dt>
                            <dd className="text-slate-900 font-medium">Every {cert.renewalYears} years ({cert.cecs} CECs)</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Avg. cost (AU)</dt>
                            <dd className="text-slate-900 font-medium">${cert.avgCostAUD.toLocaleString()} AUD</dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Insurer Recognition</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {cert.insurerRecognition.map((ins) => (
                            <span key={ins} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              <CheckCircle className="w-3 h-3" />
                              {ins}
                            </span>
                          ))}
                        </div>

                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">States / Regions</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {cert.states.map((state) => (
                            <span key={state} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                              {state}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-5">
                      <Link
                        href="/events"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                        Find {cert.code} Courses Near You
                      </Link>
                      <Link
                        href="/learn"
                        className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        Preparation Guide
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Tools CTA */}
      <section className="bg-white border-t border-slate-200 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Ready to book a course?</h3>
              <p className="text-sm text-slate-500">
                Browse the ANZ Events Calendar for 35+ upcoming IICRC courses across Australia and NZ.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Browse Events
              </Link>
              <Link
                href="/industry-partners"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-sm rounded-lg bg-white transition-colors"
              >
                <Layers className="w-4 h-4" />
                Industry Hub
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
