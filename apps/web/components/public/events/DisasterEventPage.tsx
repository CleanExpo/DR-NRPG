/**
 * Disaster Event Page Template — BUILD-006
 *
 * Rapid-deploy template for cyclone, flood, and storm events.
 * Supports pre-landfall and recovery phases.
 *
 * Deploy checklist (must verify before publishing):
 * 1. BOM/official declared event or warning zone active
 * 2. LGA/shire list confirmed from BOM + DRFA/SES source
 * 3. Financial assistance deadlines verified from government source
 * 4. No unverified statistics (ACL s18 compliant)
 * 5. Qualifying language applied to remote area LGAs
 *
 * Schema: Event + LocalBusiness + FAQPage
 */

import React from 'react'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo/site-url'

export type EventType = 'cyclone' | 'flood' | 'storm' | 'bushfire'
export type EventPhase = 'pre-landfall' | 'recovery'

export interface FinancialAssistanceItem {
  name: string
  description: string
  amounts?: string
  deadline?: string
  hotline?: string
  applicationUrl?: string
  provider: string
}

export interface DisasterEventPageProps {
  // Event identity
  eventName: string
  eventType: EventType
  eventPhase: EventPhase
  state: string          // e.g. 'Western Australia' | 'Queensland'
  stateAbbr: string      // e.g. 'WA' | 'QLD'
  year: number

  // IICRC standard reference
  iicrcStandard: string  // e.g. 'AS-IICRC S500:2025 (Water Damage Restoration)'

  // Affected areas
  affectedLGAs: string[]
  remoteLGAs?: string[]  // Requires qualifying language for coverage

  // Financial assistance programs
  financialAssistance: FinancialAssistanceItem[]

  // Government recovery hotline
  governmentHotline?: string
  governmentApplicationUrl?: string
  governmentApplicationLabel?: string

  // SEO
  metaTitle: string
  metaDescription: string
  slug: string           // URL slug for canonical

  // Optional — shows ESHA urgency banner
  eshaDeadline?: string  // ISO date string
  eshaLGAs?: string[]
}

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  cyclone: 'Cyclone',
  flood: 'Flood',
  storm: 'Storm',
  bushfire: 'Bushfire',
}

const EVENT_PHASE_LABELS: Record<EventPhase, { label: string; badgeColour: string }> = {
  'pre-landfall': { label: 'WARNING ACTIVE — Prepare Now', badgeColour: 'bg-amber-600' },
  'recovery': { label: 'RECOVERY ACTIVE', badgeColour: 'bg-blue-700' },
}

const EVENT_TYPE_IICRC: Record<EventType, string> = {
  cyclone: 'AS-IICRC S500:2025 (Water Damage Restoration)',
  flood: 'AS-IICRC S500:2025 (Water Damage Restoration)',
  storm: 'AS-IICRC S500:2025 (Water Damage Restoration)',
  bushfire: 'AS-IICRC S520:2025 (Mould Remediation)',
}

function buildEventSchema(props: DisasterEventPageProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${EVENT_TYPE_LABELS[props.eventType]} ${props.eventName} ${props.stateAbbr} ${props.year} — Disaster Recovery`,
    description: props.metaDescription,
    startDate: new Date().toISOString().split('T')[0],
    location: {
      '@type': 'State',
      name: props.state,
      addressCountry: 'AU',
    },
    organizer: {
      '@type': 'Organization',
      name: 'NRPG — National Restoration & Property Group',
      url: SITE_URL,
    },
  }
}

function buildFAQSchema(props: DisasterEventPageProps) {
  const isFloodOrCyclone = props.eventType === 'cyclone' || props.eventType === 'flood'
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How quickly can a restoration contractor attend in ${props.state}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `NRPG-network contractors aim to arrive as quickly as possible in major urban areas of ${props.state} (typically within 2 hours). Response times in regional and remote areas may vary — always call first to confirm availability for your location.`,
        },
      },
      {
        '@type': 'Question',
        name: `Will my insurance cover ${EVENT_TYPE_LABELS[props.eventType].toLowerCase()} damage?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Coverage depends on your specific policy. Most standard home and contents policies cover sudden water damage from storms and cyclones. Flood damage may require separate flood cover. NRPG contractors provide insurance-standard documentation to support your claim.',
        },
      },
      ...(isFloodOrCyclone ? [{
        '@type': 'Question',
        name: 'What should I do first after cyclone or flood damage?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Ensure the property is structurally safe before re-entering. Do not turn on electricity if water has entered the building. Document all damage with photos and video before any clean-up. Contact your insurer to lodge a claim, then engage an ${props.iicrcStandard}-qualified restoration contractor.`,
        },
      }] : []),
      {
        '@type': 'Question',
        name: 'What is the deadline for emergency hardship assistance?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: props.financialAssistance
            .filter(a => a.deadline)
            .map(a => `${a.name}: ${a.deadline}`)
            .join('. ') || 'Check the relevant government website for current application deadlines.',
        },
      },
    ],
  }
}

export default function DisasterEventPage(props: DisasterEventPageProps) {
  const {
    eventName,
    eventType,
    eventPhase,
    state,
    stateAbbr,
    year,
    iicrcStandard,
    affectedLGAs,
    remoteLGAs = [],
    financialAssistance,
    governmentHotline,
    governmentApplicationUrl,
    governmentApplicationLabel,
    eshaDeadline,
    eshaLGAs = [],
    slug,
  } = props

  const phaseConfig = EVENT_PHASE_LABELS[eventPhase]
  const eventLabel = EVENT_TYPE_LABELS[eventType]
  const isRecovery = eventPhase === 'recovery'

  const eventSchema = buildEventSchema(props)
  const faqSchema = buildFAQSchema(props)

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/${slug}`,
    name: 'NRPG — National Restoration & Property Group',
    url: SITE_URL,
    areaServed: props.affectedLGAs.map(lga => ({ '@type': 'City', name: lga })),
    knowsAbout: [props.iicrcStandard, `${EVENT_TYPE_LABELS[props.eventType]} damage restoration`, 'Insurance claims documentation'],
  }

  return (
    <>
      {/* Schema.org Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="min-h-screen bg-white">

        {/* ── ESHA Urgency Banner ── */}
        {eshaDeadline && (
          <div className="bg-red-700 text-white py-3 px-4 text-center">
            <p className="text-sm font-bold">
              ⚠️ ESHA APPLICATION DEADLINE: {new Date(eshaDeadline).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
              {' '} — Apply before the deadline to access emergency hardship assistance.
              {governmentApplicationUrl && (
                <> {' '}<a href={governmentApplicationUrl} target="_blank" rel="noopener noreferrer" className="underline ml-1">Apply now</a></>
              )}
            </p>
          </div>
        )}

        {/* ── Hero Section ── */}
        <section className="bg-slate-900 text-white py-16 md:py-24">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="mb-4">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${phaseConfig.badgeColour}`}>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {phaseConfig.label}
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
              {eventLabel} {eventName}
              <br />
              <span className="text-blue-400">{state} {year}</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mb-8 leading-relaxed">
              {isRecovery
                ? `If your property has been damaged by ${eventLabel.toLowerCase()} ${eventName}, NRPG-network ${iicrcStandard}-qualified contractors are ready to attend. Document your damage and lodge your insurance claim today.`
                : `${eventLabel} ${eventName} is approaching ${state}. Prepare now — secure your property, document pre-event condition, and get claim-ready. NRPG-network contractors are on standby across the affected region.`
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/claim"
                className="inline-flex items-center justify-center px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-lg"
              >
                {isRecovery ? 'Lodge Emergency Claim' : 'Get Claim-Ready Now'}
              </Link>
              {governmentHotline && (
                <a
                  href={`tel:${governmentHotline.replace(/\s/g, '')}`}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors text-lg border border-white/20"
                >
                  Gov Hotline: {governmentHotline}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ── Affected LGAs ── */}
        <section className="py-12 bg-slate-50 border-b border-slate-200">
          <div className="container mx-auto px-6 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-6">
              Affected Areas — Declared {eventLabel} Event
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {affectedLGAs.map(lga => (
                <div
                  key={lga}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                    remoteLGAs.includes(lga)
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium text-sm">{lga}</span>
                  {remoteLGAs.includes(lga) && (
                    <span className="text-xs text-amber-600 ml-auto">Remote</span>
                  )}
                </div>
              ))}
            </div>
            {remoteLGAs.length > 0 && (
              <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <strong>Note for remote areas ({remoteLGAs.join(', ')}):</strong> Contractor availability in remote regions may be limited. NRPG will confirm coverage and estimated response times when you lodge your claim.
              </p>
            )}
          </div>
        </section>

        {/* ── Financial Assistance ── */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6 max-w-5xl">
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-2">
              Government Financial Assistance
            </h2>
            <p className="text-slate-600 mb-8">
              The following assistance programs have been activated for this event. Verify eligibility and application deadlines directly with the relevant government agency.
            </p>
            <div className="space-y-4">
              {financialAssistance.map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-slate-900">{item.name}</h3>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{item.provider}</span>
                      </div>
                      <p className="text-slate-600 text-sm mb-3">{item.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        {item.amounts && (
                          <div>
                            <span className="text-slate-500">Amount: </span>
                            <span className="font-semibold text-green-700">{item.amounts}</span>
                          </div>
                        )}
                        {item.deadline && (
                          <div>
                            <span className="text-slate-500">Deadline: </span>
                            <span className="font-semibold text-red-600">{item.deadline}</span>
                          </div>
                        )}
                        {item.hotline && (
                          <div>
                            <span className="text-slate-500">Hotline: </span>
                            <a href={`tel:${item.hotline.replace(/\s/g, '')}`} className="font-semibold text-blue-600 hover:underline">{item.hotline}</a>
                          </div>
                        )}
                      </div>
                    </div>
                    {item.applicationUrl && (
                      <a
                        href={item.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex-shrink-0"
                      >
                        Apply
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How to Claim ── */}
        <section className="py-12 md:py-16 bg-blue-900 text-white">
          <div className="container mx-auto px-6 max-w-5xl">
            <h2 className="font-display text-3xl font-bold text-white mb-2">
              How to Lodge Your Insurance Claim
            </h2>
            <p className="text-blue-200 mb-10">
              Follow these steps for the strongest possible insurance outcome. Work completed by {iicrcStandard.split('(')[0].trim()}-certified contractors is accepted by all major Australian insurers.
            </p>
            <ol className="grid md:grid-cols-4 gap-6">
              {[
                {
                  n: '1',
                  title: 'Ensure Safety',
                  body: `Do not enter the property until it is structurally safe. Do not use electricity if water has entered the building. Contact emergency services if required.`,
                },
                {
                  n: '2',
                  title: 'Document the Damage',
                  body: 'Photograph and video all damage before any clean-up begins. Note the date and time. This documentation is critical for your insurer.',
                },
                {
                  n: '3',
                  title: 'Lodge Your Claim',
                  body: 'Contact your insurer as soon as possible. Provide your damage documentation. Ask your insurer to confirm cover for the event type.',
                },
                {
                  n: '4',
                  title: 'Engage NRPG Contractor',
                  body: `Submit your claim through NRPG to be matched with an ${iicrcStandard}-certified contractor. All work is documented to insurance standards.`,
                },
              ].map(({ n, title, body }) => (
                <li key={n} className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-white text-blue-900 flex items-center justify-center font-display text-2xl font-black flex-shrink-0">
                    {n}
                  </div>
                  <h3 className="font-bold text-white text-lg">{title}</h3>
                  <p className="text-blue-200 text-sm leading-relaxed">{body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 text-center">
              <Link
                href="/claim"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-colors text-lg"
              >
                Start Your Claim
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── IICRC Standards Note ── */}
        <section className="py-10 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row items-start gap-4 bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Industry Standard: {iicrcStandard}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  All NRPG-network contractors working on this event type follow {iicrcStandard} protocols. This certification is the recognised industry standard for {eventLabel.toLowerCase()} damage restoration in Australia and is accepted by all major insurers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ Section ── */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6 max-w-4xl">
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <dl className="space-y-5">
              {[
                {
                  q: `How quickly can a restoration contractor attend in ${state}?`,
                  a: `NRPG-network contractors aim to arrive as quickly as possible in major urban areas of ${state} (typically within 2 hours). Response times in regional and remote areas may vary — always call first to confirm availability for your location.`,
                },
                {
                  q: `Will my insurance cover ${eventLabel.toLowerCase()} damage?`,
                  a: `Coverage depends on your specific policy. Most standard home and contents policies cover sudden water damage from storms and cyclones. Flood damage may require a separate flood cover endorsement. NRPG contractors provide insurance-standard documentation to support your claim.`,
                },
                {
                  q: 'What should I do first after the damage?',
                  a: `Ensure the property is structurally safe before re-entering. Do not turn on electricity if water has entered the building. Document all damage with photos and video before any clean-up. Contact your insurer to lodge a claim, then engage an ${iicrcStandard}-qualified restoration contractor.`,
                },
                {
                  q: 'How do I apply for government financial assistance?',
                  a: financialAssistance.length > 0
                    ? `Multiple assistance programs are available for this event. See the Financial Assistance section above for program names, amounts, deadlines, and application links.${governmentHotline ? ` You can also call the Government Recovery Hotline: ${governmentHotline}.` : ''}`
                    : `Contact your state government disaster recovery hotline for information on available assistance programs.`,
                },
              ].map(({ q, a }) => (
                <div key={q} className="bg-white border border-slate-200 rounded-xl p-6">
                  <dt className="font-bold text-slate-900 mb-2">{q}</dt>
                  <dd className="text-slate-600 text-sm leading-relaxed">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Privacy + Enquiry CTA ── */}
        <section className="py-12 bg-slate-900 text-white">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold text-white mb-3">
              Ready to Start Your Recovery?
            </h2>
            <p className="text-slate-300 mb-2 leading-relaxed">
              Submit your claim online. NRPG will match you with a certified contractor in your area.
            </p>
            <p className="text-slate-400 text-xs mb-8">
              <strong>Privacy Notice:</strong> Personal information collected through this service is used solely for the purpose of connecting you with a restoration contractor and is handled in accordance with the Privacy Act 1988 (Cth). We do not sell your information to third parties.
            </p>
            <Link
              href="/claim"
              className="inline-flex items-center gap-2 px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
              Submit Emergency Claim
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

      </div>
    </>
  )
}
