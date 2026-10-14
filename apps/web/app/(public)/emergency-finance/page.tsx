/**
 * Emergency Finance — BlueFire Finance Partnership Page
 *
 * DR-5: Client trust signal page explaining emergency finance options
 * for property owners who need to fund disaster recovery work
 *
 * Placed under (public) route group to inherit PublicHeader + PublicFooter
 * NO phone numbers, NO addresses, NO emails — online-only per spec
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import {
  DollarSign,
  Clock,
  Shield,
  CheckCircle,
  ArrowRight,
  FileText,
  Zap,
  Users,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Emergency Finance for Disaster Recovery | Disaster Recovery Australia',
  description:
    'Worried about upfront costs? BlueFire Finance offers same-day emergency finance for disaster recovery and restoration work — so repairs start immediately, not when your insurer settles.',
  alternates: {
    canonical: 'https://nrpg.business/emergency-finance',
  },
  openGraph: {
    title: 'Emergency Finance for Disaster Recovery | Disaster Recovery Australia',
    description:
      'Same-day emergency finance for restoration work. Do not let cost delays prevent you from protecting your property.',
    url: 'https://disasterrecovery.com.au/emergency-finance',
    type: 'website',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Emergency Finance for Disaster Recovery',
  description:
    'Emergency finance options for property owners requiring immediate disaster recovery and restoration services, provided through the BlueFire Finance partnership.',
  provider: {
    '@type': 'Organization',
    name: 'Disaster Recovery Australia',
    url: 'https://disasterrecovery.com.au',
  },
  serviceType: 'Emergency Finance',
  areaServed: {
    '@type': 'Country',
    name: 'Australia',
  },
  url: 'https://disasterrecovery.com.au/emergency-finance',
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://disasterrecovery.com.au' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Emergency Finance',
      item: 'https://disasterrecovery.com.au/emergency-finance',
    },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who is BlueFire Finance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BlueFire Finance is a specialist emergency finance partner integrated with the Disaster Recovery Australia platform. They provide fast-approval finance specifically designed for property restoration and disaster recovery work.',
      },
    },
    {
      '@type': 'Question',
      name: 'How quickly can I get emergency finance approved?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BlueFire Finance offers same-day approval for most applications. Once your claim is submitted through Disaster Recovery Australia, the finance application is pre-filled with your details to minimise paperwork.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need emergency finance if I have home insurance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Even with insurance, there may be an excess to pay upfront, a delay between work completing and your insurer settling, or damage not fully covered under your policy. Emergency finance bridges that gap so work can begin immediately.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does applying for finance affect my credit score?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A soft credit check is performed during the initial application, which does not affect your credit score. A full credit assessment only occurs if you proceed to accept a finance offer.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use emergency finance even without insurance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Emergency finance is available for both insured and uninsured property owners. It ensures restoration work begins immediately regardless of insurance status.',
      },
    },
  ],
}

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: FileText,
    title: 'Submit your claim',
    description:
      "Complete the standard DR Australia claim form. Indicate you'd like to explore finance options — takes 30 seconds.",
  },
  {
    step: '02',
    icon: Zap,
    title: 'Pre-filled application',
    description:
      'Your claim details are passed securely to BlueFire Finance, pre-filling your application and removing duplicate data entry.',
  },
  {
    step: '03',
    icon: Clock,
    title: 'Same-day approval',
    description:
      'BlueFire Finance reviews your application and provides a decision, typically within a few hours of submission.',
  },
  {
    step: '04',
    icon: CheckCircle,
    title: 'Work begins immediately',
    description:
      'Finance is paid directly to your NRPG contractor. Restoration starts without waiting for insurance settlement.',
  },
]

const FINANCE_USES = [
  'Insurance excess payment',
  'Gap between work cost and insurer payout',
  'Uninsured damage',
  'Emergency make-safe works',
  'Mould remediation not covered by policy',
  'Contents replacement not covered by insurance',
  'Temporary accommodation during restoration',
  'Secondary damage prevention works',
]

const STATS = [
  { value: 'Same day', label: 'approval for most applications' },
  { value: '0 upfront', label: 'restoration can begin before you pay a cent' },
  { value: 'All states', label: 'available across Australia' },
  { value: 'Soft check', label: 'initial application does not affect credit score' },
]

export default function EmergencyFinancePage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-white dark:bg-slate-950">

        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 to-blue-900 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-200 text-sm font-medium mb-8">
              <DollarSign className="w-4 h-4" />
              <span>Finance Partner: BlueFire Finance</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Do not let cost be the reason{' '}
              <span className="text-blue-300">damage gets worse</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10">
              Emergency restoration cannot wait weeks for insurance to settle. BlueFire Finance
              provides same-day approval so your NRPG contractor can start work immediately —
              protecting your property and your claim value.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/claim/step-1"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Submit a claim
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors border border-white/20"
              >
                How it works
              </Link>
            </div>
          </div>
        </section>

        {/* Stats band */}
        <section className="bg-slate-800 py-10 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">{value}</div>
                <div className="text-sm text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Why finance */}
        <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Insurance helps. Finance bridges the gap.
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Even with a valid insurance policy, you may need to fund work before your claim
                settles. Emergency finance ensures your property is protected now — not in 30 days.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Common finance use cases
                </h3>
                <ul className="space-y-2">
                  {FINANCE_USES.map((use) => (
                    <li key={use} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {use}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-600 rounded-lg p-6 text-white">
                  <h3 className="font-semibold text-lg mb-2">The cost of waiting</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Water damage that is not treated within 24–48 hours leads to mould growth.
                    Mould remediation costs significantly more than water extraction. Delaying
                    work to wait for insurance settlement can multiply your total restoration cost.
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-2">
                    Finance is not debt — it is speed
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    For insured events, your insurer will typically reimburse the full scope of
                    approved works. Emergency finance simply ensures that reimbursement happens
                    after the work is done — not before.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 px-4 bg-white dark:bg-slate-950">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                From claim to finance in four steps
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                The finance process is integrated into your standard DR Australia claim —
                no separate portal, no re-entering your details.
              </p>
            </div>

            <ol className="grid md:grid-cols-4 gap-8 list-none">
              {HOW_IT_WORKS.map(({ step, icon: Icon, title, description }) => (
                <li key={step} className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center mb-4 flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-mono text-blue-600 dark:text-blue-400 mb-1">
                    STEP {step}
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Trust signals */}
        <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Why BlueFire Finance?
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <Zap className="w-8 h-8 text-yellow-500 mb-4" />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Built for emergencies
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Standard personal loans take days. BlueFire Finance is purpose-built for
                  disaster recovery — same-day decisions, fast disbursement, direct contractor payment.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <Shield className="w-8 h-8 text-green-500 mb-4" />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Responsible lending
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  BlueFire Finance holds an Australian Credit Licence and operates under the
                  National Consumer Credit Protection Act. All lending is assessed responsibly.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <Users className="w-8 h-8 text-blue-500 mb-4" />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Contractor paid directly
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Finance is disbursed directly to your NRPG contractor — you never handle the funds.
                  This simplifies the process and ensures work begins without administrative delay.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4 bg-white dark:bg-slate-950">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Frequently asked questions
              </h2>
            </div>
            <div className="space-y-3">
              {faqSchema.mainEntity.map((item) => (
                <details
                  key={item.name}
                  className="group border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                    <svg
                      className="w-4 h-4 text-slate-500 flex-shrink-0 group-open:rotate-180 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="px-5 py-4 bg-white dark:bg-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.acceptedAnswer.text}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-blue-700">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to get restoration underway?
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              Submit your claim now and indicate you'd like to explore finance options.
              Your NRPG contractor and BlueFire Finance will handle the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/claim/step-1"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Submit a claim
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/restore-assist"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-500/30 hover:bg-blue-500/40 text-white font-semibold rounded-lg transition-colors border border-blue-400/40"
              >
                How restoration documentation works
              </Link>
            </div>
            <p className="text-sm text-blue-200 mt-8">
              Finance subject to approval. Terms and conditions apply.{' '}
              BlueFire Finance holds an Australian Credit Licence.
            </p>
          </div>
        </section>

      </div>
    </>
  )
}
