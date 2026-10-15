import { SITE_URL } from '@/lib/seo/site-url'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import eventsData from '@/data/events.json'
import { Calendar, MapPin, Clock, Award, Tag, Users, ChevronLeft, ChevronRight, Download, Globe } from 'lucide-react'

type Event = (typeof eventsData.events)[number]

const CATEGORY_LABELS: Record<string, string> = {
  'iicrc-training': 'IICRC Training',
  'conference': 'Conference',
  'trade-show': 'Trade Show',
  'networking': 'Networking',
  'seminar': 'Seminar',
  'supplier-day': 'Supplier Day',
  'standards': 'Standards',
  'webinar': 'Webinar',
}

const CATEGORY_COLOURS: Record<string, string> = {
  'iicrc-training': 'bg-blue-100 text-blue-800',
  'conference': 'bg-emerald-100 text-emerald-800',
  'trade-show': 'bg-purple-100 text-purple-800',
  'networking': 'bg-orange-100 text-orange-800',
  'seminar': 'bg-sky-100 text-sky-800',
  'supplier-day': 'bg-yellow-100 text-yellow-800',
  'standards': 'bg-red-100 text-red-800',
  'webinar': 'bg-teal-100 text-teal-800',
}

export async function generateStaticParams() {
  return eventsData.events.map(event => ({ slug: event.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const event = eventsData.events.find(e => e.slug === slug)
  if (!event) return {}

  const location = event.type === 'virtual' ? 'Online' : `${event.city}, ${event.stateCode}`
  const dateStr = new Date(event.startDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })

  return {
    title: `${event.title} — ${dateStr} | DR Australia Events`,
    description: `${event.title}. ${location} · ${dateStr}. ${event.description.slice(0, 130)}`,
  }
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  if (startDate === endDate) return start.toLocaleDateString('en-AU', options)
  const endOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
  return `${start.toLocaleDateString('en-AU', options)} – ${end.toLocaleDateString('en-AU', endOptions)}`
}

function generateICalContent(event: Event): string {
  const dtStart = event.startDate.replace(/-/g, '')
  const dtEnd = event.endDate.replace(/-/g, '')
  const location = event.type === 'virtual'
    ? 'Online'
    : event.venue
      ? `${event.venue}\\, ${event.city}\\, ${event.state}\\, ${event.country}`
      : `${event.city}\\, ${event.state}\\, ${event.country}`

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Disaster Recovery Australia//Events//EN',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    `ORGANIZER;CN="${event.organiser}":MAILTO:events@disasterrecovery.com.au`,
    `URL:${SITE_URL}/events/${event.slug}`,
    `UID:${event.id}@disasterrecovery.com.au`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

function buildEventSchema(event: Event) {
  const location = event.type === 'virtual'
    ? { '@type': 'VirtualLocation', url: `${SITE_URL}/events/` + event.slug }
    : {
        '@type': 'Place',
        name: event.venue ?? `${event.city}, ${event.state}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: event.city,
          addressRegion: event.state,
          addressCountry: event.country,
        },
      }

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    eventAttendanceMode: event.type === 'virtual'
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : event.type === 'hybrid'
        ? 'https://schema.org/MixedEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location,
    description: event.description,
    organizer: {
      '@type': 'Organization',
      name: event.organiser,
    },
    offers: {
      '@type': 'Offer',
      price: event.price,
      priceCurrency: event.country === 'NZ' ? 'NZD' : 'AUD',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/events/${event.slug}`,
    },
    url: `${SITE_URL}/events/${event.slug}`,
  }
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = eventsData.events.find(e => e.slug === slug)
  if (!event) notFound()

  const today = new Date().toISOString().split('T')[0]
  const isPast = event.endDate < today
  const isEarlyBirdActive = event.earlyBirdDate && event.earlyBirdDate >= today

  // Related events: same category, not this event, upcoming
  const relatedEvents = eventsData.events
    .filter(e => e.id !== event.id && e.category === event.category && e.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 3)

  const icalContent = generateICalContent(event)
  const icalDataUri = `data:text/calendar;charset=utf-8,${encodeURIComponent(icalContent)}`

  const googleCalUrl = new URL('https://calendar.google.com/calendar/render')
  googleCalUrl.searchParams.set('action', 'TEMPLATE')
  googleCalUrl.searchParams.set('text', event.title)
  googleCalUrl.searchParams.set('dates', `${event.startDate.replace(/-/g, '')}/${event.endDate.replace(/-/g, '')}`)
  googleCalUrl.searchParams.set('details', event.description)
  googleCalUrl.searchParams.set('location', event.type === 'virtual' ? 'Online' : (event.venue ?? `${event.city}, ${event.state}`))

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Industry Events', item: `${SITE_URL}/events` },
      { '@type': 'ListItem', position: 3, name: event.title, item: `${SITE_URL}/events/${event.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildEventSchema(event)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="min-h-screen bg-slate-50">
        {/* Back nav */}
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-6 max-w-5xl py-3">
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Events Calendar
            </Link>
          </div>
        </div>

        {/* Hero */}
        <section className={`py-12 ${isPast ? 'bg-slate-700' : 'bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900'}`}>
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLOURS[event.category] ?? 'bg-slate-100 text-slate-700'}`}>
                {CATEGORY_LABELS[event.category] ?? event.category}
              </span>
              {isPast && (
                <span className="text-xs bg-slate-500 text-slate-100 px-2.5 py-1 rounded-full">Past Event</span>
              )}
              {event.type === 'virtual' && (
                <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full">Online</span>
              )}
              {isEarlyBirdActive && (
                <span className="text-xs bg-amber-400 text-amber-900 px-2.5 py-1 rounded-full font-semibold">
                  Early bird ends {new Date(event.earlyBirdDate!).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 max-w-3xl">{event.title}</h1>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start gap-3 bg-white/10 rounded-xl p-4">
                <Calendar className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-400 mb-0.5">Date</div>
                  <div className="text-white text-sm font-medium">{formatDateRange(event.startDate, event.endDate)}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/10 rounded-xl p-4">
                <MapPin className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-400 mb-0.5">Location</div>
                  <div className="text-white text-sm font-medium">
                    {event.type === 'virtual'
                      ? 'Online Event'
                      : event.venue
                        ? `${event.venue}, ${event.city}`
                        : `${event.city}, ${event.state}`}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/10 rounded-xl p-4">
                <Users className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-400 mb-0.5">Organiser</div>
                  <div className="text-white text-sm font-medium">{event.organiser}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/10 rounded-xl p-4">
                <Tag className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-400 mb-0.5">Price</div>
                  <div className="text-white text-sm font-medium">{event.price}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6 max-w-5xl py-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <section className="bg-white rounded-2xl p-8 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">About This Event</h2>
                <p className="text-slate-600 leading-relaxed">{event.description}</p>
              </section>

              {/* IICRC Info */}
              {(event.iicrcCredits > 0 || event.certificationOffered) && (
                <section className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-slate-900">IICRC Certification Details</h2>
                  </div>
                  <dl className="space-y-3">
                    {event.certificationOffered && (
                      <div className="flex gap-3">
                        <dt className="text-sm font-medium text-slate-500 w-40 flex-shrink-0">Certification</dt>
                        <dd className="text-sm text-slate-800 font-semibold">{event.certificationOffered}</dd>
                      </div>
                    )}
                    {event.iicrcCredits > 0 && (
                      <div className="flex gap-3">
                        <dt className="text-sm font-medium text-slate-500 w-40 flex-shrink-0">Continuing Ed Credits</dt>
                        <dd className="text-sm text-slate-800">{event.iicrcCredits} IICRC CECs</dd>
                      </div>
                    )}
                  </dl>
                </section>
              )}

              {/* Tags */}
              {event.tags.length > 0 && (
                <section className="bg-white rounded-2xl p-6 border border-slate-200">
                  <h2 className="text-base font-bold text-slate-700 mb-3">Topics Covered</h2>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map(tag => (
                      <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Add to Calendar */}
              {!isPast && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-500" />
                    Add to Calendar
                  </h3>
                  <div className="space-y-3">
                    <a
                      href={icalDataUri}
                      download={`${event.slug}.ics`}
                      className="flex items-center gap-2 w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-sm justify-center"
                    >
                      <Download className="h-4 w-4" />
                      Download .ics (iCal)
                    </a>
                    <a
                      href={googleCalUrl.toString()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors text-sm justify-center border border-slate-200"
                    >
                      <Globe className="h-4 w-4" />
                      Add to Google Calendar
                    </a>
                  </div>
                </div>
              )}

              {/* Event Details */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4">Event Details</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Format</dt>
                    <dd className="text-sm text-slate-800 capitalize">{event.type.replace('-', ' ')}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Country</dt>
                    <dd className="text-sm text-slate-800">{event.country === 'AU' ? 'Australia' : 'New Zealand'}</dd>
                  </div>
                  {event.earlyBirdDate && !isPast && (
                    <div>
                      <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Early Bird Deadline</dt>
                      <dd className="text-sm text-slate-800">
                        {new Date(event.earlyBirdDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Pricing</dt>
                    <dd className="text-sm text-slate-800 font-medium">{event.price}</dd>
                  </div>
                </dl>
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 text-xs text-amber-800">
                <strong>Note:</strong> Event details are sourced from public information and may change. Contact the organiser directly to confirm dates, pricing, and registration.
              </div>
            </div>
          </div>

          {/* Related Events */}
          {relatedEvents.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                More {CATEGORY_LABELS[event.category] ?? 'Industry'} Events
              </h2>
              <div className="grid md:grid-cols-3 gap-5">
                {relatedEvents.map(related => (
                  <Link
                    key={related.id}
                    href={`/events/${related.slug}`}
                    className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-emerald-400 hover:shadow-sm transition-all"
                  >
                    <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 text-sm leading-tight mb-2">
                      {related.title}
                    </h3>
                    <div className="text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {new Date(related.startDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {related.type === 'virtual' ? 'Online' : `${related.city}, ${related.stateCode}`}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center text-emerald-600 text-xs font-medium gap-1">
                      View event <ChevronRight className="h-3 w-3" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back to calendar */}
          <div className="mt-10 text-center">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-semibold transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Full Events Calendar
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
