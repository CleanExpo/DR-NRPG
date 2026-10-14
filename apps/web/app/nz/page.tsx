/**
 * Coming Soon — New Zealand
 *
 * URL: /nz
 * NRPG expansion announcement for the New Zealand market.
 * Waitlist email capture. en-NZ hreflang ready.
 *
 * Disaster Recovery Pty Ltd | ABN: 85 151 794 142
 */

import { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo/site-url'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Coming Soon to New Zealand | NRPG Disaster Recovery',
  description:
    'NRPG is expanding to New Zealand. Professional disaster recovery, IICRC-certified restoration, and CARSI training — coming soon to NZ. Join the waitlist.',
  alternates: {
    canonical: `${SITE_URL}/nz`,
    languages: {
      'en-AU': SITE_URL,
      'en-NZ': `${SITE_URL}/nz`,
    },
  },
  openGraph: {
    title: 'NRPG Coming to New Zealand',
    description:
      'Professional disaster recovery and IICRC-certified restoration services expanding into New Zealand. Join the waitlist.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const COMING_SOON_FEATURES = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    title: '24/7 Emergency Response',
    description:
      'IICRC-certified technicians on call around the clock. Water damage, fire restoration, and mould remediation across New Zealand.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
        />
      </svg>
    ),
    title: 'CARSI Training & Certification',
    description:
      'IICRC-approved training courses for New Zealand restoration contractors. WRT, AMRT, FSRT and more — delivered online 24/7.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
        />
      </svg>
    ),
    title: 'NRPG Professional Network',
    description:
      'New Zealand restoration professionals will be able to join the National Restoration Professionals Guild — gaining insurer panel access and verified credentials.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
        />
      </svg>
    ),
    title: 'Restore Assist — Claims Navigation',
    description:
      'Independent claims assistance for New Zealand homeowners. Navigate the EQC, private insurer, and Canterbury Earthquake Commission processes with expert support.',
  },
]

const NZ_COMPLIANCE = [
  { label: 'Privacy Act 2020 (NZ)', status: 'Covered' },
  { label: 'NZ Consumer Guarantees Act 1993', status: 'Covered' },
  { label: 'NZ Fair Trading Act 1986', status: 'Covered' },
  { label: 'Health and Safety at Work Act 2015 (NZ)', status: 'Covered' },
  { label: 'Building Act 2004 (NZ)', status: 'In Review' },
  { label: 'EQC Act 2019', status: 'In Review' },
]

export default function NewZealandPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: '#050505' }}
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* NZ map glow */}
        <div
          className="absolute right-1/4 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #00b4d8 0%, transparent 70%)' }}
        />

        <div className="relative z-10 container mx-auto px-6 py-24 text-center max-w-4xl">
          {/* NZ flag colours badge */}
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full" style={{ background: '#00247D' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#CC142B' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#ffffff' }} />
            </div>
            <span className="text-xs font-mono tracking-widest uppercase" style={{ color: '#6b7280' }}>
              New Zealand Expansion
            </span>
          </div>

          <h1
            className="text-5xl md:text-7xl font-black tracking-tight mb-6"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #00b4d8 50%, #0077b6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Coming Soon
            <br />
            to New Zealand
          </h1>

          <p className="text-lg md:text-xl mb-4" style={{ color: '#9ca3af' }}>
            NRPG is bringing professional disaster recovery, IICRC-certified restoration,
            <br className="hidden md:block" />
            and world-class contractor training to Aotearoa New Zealand.
          </p>

          <p className="text-sm mb-12 font-mono" style={{ color: '#4b5563' }}>
            Auckland &middot; Wellington &middot; Christchurch &middot; Hamilton &middot; Tauranga &middot; Dunedin
          </p>

          {/* Email waitlist */}
          <div className="max-w-md mx-auto mb-8">
            <p className="text-sm mb-4 font-semibold uppercase tracking-wider" style={{ color: '#00b4d8' }}>
              Join the NZ Waitlist
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-3 px-8 py-4 font-bold text-sm uppercase tracking-wider transition-all duration-300 text-[#00b4d8] bg-transparent border border-[#00b4d8] hover:bg-[#00b4d8] hover:text-[#050505]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
              Register Your Interest
            </a>
            <p className="text-xs mt-3" style={{ color: '#4b5563' }}>
              We respect your privacy under the NZ Privacy Act 2020
            </p>
          </div>

          {/* Already in AU? */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 text-xs"
            style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            Australian business? Our services are available now at{' '}
            <Link href="/" className="underline underline-offset-2" style={{ color: '#00b4d8' }}>
              disasterrecovery.com.au
            </Link>
          </div>
        </div>
      </section>

      {/* What's Coming */}
      <section className="py-24" style={{ background: '#080808' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-mono tracking-widest uppercase mb-4" style={{ color: '#00b4d8' }}>
                What We're Bringing to New Zealand
              </p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#ffffff' }}>
                Professional disaster recovery,{' '}
                <span style={{ color: '#00b4d8' }}>built for Aotearoa</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {COMING_SOON_FEATURES.map((feature, i) => (
                <div
                  key={i}
                  className="p-8 transition-all duration-300"
                  style={{
                    background: '#0d0d0d',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="mb-4" style={{ color: '#00b4d8' }}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: '#ffffff' }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NZ Compliance */}
      <section className="py-20" style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-mono tracking-widest uppercase mb-4" style={{ color: '#00b4d8' }}>
                Regulatory Readiness
              </p>
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#ffffff' }}>
                NZ Compliance Framework
              </h2>
              <p className="text-sm mt-3" style={{ color: '#6b7280' }}>
                We're building for full New Zealand regulatory compliance before launch.
              </p>
            </div>

            <div className="space-y-3">
              {NZ_COMPLIANCE.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-6 py-4"
                  style={{
                    background: '#0d0d0d',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <span className="text-sm" style={{ color: '#d1d5db' }}>
                    {item.label}
                  </span>
                  <span
                    className="text-xs font-mono px-3 py-1"
                    style={{
                      background: item.status === 'Covered' ? 'rgba(0, 180, 216, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: item.status === 'Covered' ? '#00b4d8' : '#f59e0b',
                      border: `1px solid ${item.status === 'Covered' ? 'rgba(0, 180, 216, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-center mt-6" style={{ color: '#374151' }}>
              Privacy collection governed by the NZ Privacy Act 2020 (IPPs 1–13). Email addresses stored in AU data centres.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ background: '#080808', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#ffffff' }}>
              Are you a NZ restoration contractor?
            </h2>
            <p className="text-base mb-8" style={{ color: '#6b7280' }}>
              CARSI training and NRPG membership will be available to New Zealand contractors.
              Get on the list to be first notified when enrolments open.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-sm uppercase tracking-wider transition-all duration-300"
                style={{
                  background: '#00b4d8',
                  color: '#050505',
                  border: '1px solid #00b4d8',
                }}
              >
                NZ Contractor Enquiry
              </a>
              <Link
                href="/privacy"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm transition-all duration-300"
                style={{
                  background: 'transparent',
                  color: '#6b7280',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
