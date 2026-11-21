/**
 * Indoor-environment incident guide for homeowners (DR-990)
 *
 * A plain-English first-notice guide for water damage, dampness, suspected
 * sewage, smoke, combustion gases, mould and building dust. It tells the
 * reader to stop and contact emergency services first, then what to note down,
 * then hands off to the existing claim flow (/claim/step-1) for a referral to
 * an independent restoration contractor.
 *
 * Content rules: no health diagnosis, no "safe to return" decision, no
 * statistics, no response times, no credential claims. The page is kept out of
 * search indexes until the founder approves it for publication.
 *
 * Placed under the (public) route group to inherit PublicHeader + PublicFooter.
 * No phone numbers, addresses or emails for the platform itself.
 */

import { SITE_URL } from '@/lib/seo/site-url'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Droplets,
  Flame,
  HardHat,
  HelpCircle,
  ShieldCheck,
  Wind,
} from 'lucide-react'

const PATH = '/guides/indoor-environment-incidents'

export const metadata: Metadata = {
  title: 'Water, Smoke, Mould or Dust in Your Home: First Steps | Disaster Recovery',
  description:
    'A plain-English guide for homeowners and tenants: what to do first when water, sewage, smoke, fumes, mould or building dust affects your home, what to write down, and how to request a restoration contractor.',
  alternates: { canonical: `${SITE_URL}${PATH}` },
  // Held out of search indexes until the guide is approved for publication (DR-990).
  robots: { index: false, follow: true },
}

const emergencySigns = [
  'A fire, or smoke you cannot account for',
  'A smell of gas',
  'A carbon monoxide alarm sounding, or several people feeling unwell, dizzy or drowsy at the same time indoors',
  'Water near power points, the switchboard or appliances',
  'Sagging ceilings, cracked walls or floors that move',
  'Anyone who is injured, struggling to breathe or otherwise in danger',
]

const incidentTypes = [
  {
    icon: Droplets,
    title: 'Water damage and dampness',
    text: 'Burst pipes, leaking appliances, roof leaks, storm water or rising damp. Wet materials can keep spreading moisture into nearby walls, floors and furniture.',
  },
  {
    icon: AlertTriangle,
    title: 'Suspected sewage',
    text: 'Overflowing toilets, drains or floodwater that may have mixed with sewage. Treat it as contaminated: keep people and pets away and avoid touching it or anything it has soaked.',
  },
  {
    icon: Flame,
    title: 'Smoke, soot and combustion gases',
    text: 'After a fire, or when a heater, stove or appliance may not be venting properly. Soot and fumes can travel well beyond the room where they started.',
  },
  {
    icon: Wind,
    title: 'Mould',
    text: 'Visible growth, staining or a persistent musty smell, often after a leak or long-term dampness. Do not scrub, scrape or dry-brush it, as that can spread spores.',
  },
  {
    icon: HardHat,
    title: 'Building dust and construction materials',
    text: 'Dust from renovations, or damaged walls, ceilings and floors. Older homes can contain asbestos or lead paint, so do not cut, sand or break damaged materials until they have been checked.',
  },
]

const firstActions = [
  'Only do the following if you can do it without putting yourself at risk.',
  'Stop the source if you can: turn off the water at the mains, or close a leaking appliance tap.',
  'Turn off power at the switchboard only if you can reach it without standing in water or touching anything wet.',
  'Keep children, older people, anyone who is unwell, and pets out of the affected area.',
  'Open windows to let in fresh air where it is safe, unless smoke or dust is coming from outside.',
  'Do not disturb mould, soot, sewage or damaged building materials.',
]

const recordFields = [
  {
    label: 'Source',
    prompt: 'What do you think caused it? For example, a burst pipe, a storm, a fire, or "not sure".',
  },
  {
    label: 'Route',
    prompt: 'Where has it spread? List the rooms, levels and materials affected, and whether it is still spreading.',
  },
  {
    label: 'Who and what is exposed',
    prompt: 'Who lives or works in the home, including children, older people, anyone who is unwell, and pets. Which belongings are affected.',
  },
  {
    label: 'What you are unsure of',
    prompt: 'Anything you could not check or do not know, such as what is behind a wall or how long it has been happening.',
  },
  {
    label: 'Photos and times',
    prompt: 'Photos or video taken from a safe spot, and the date and time you first noticed the problem.',
  },
]

export default function IndoorEnvironmentIncidentGuidePage() {
  return (
    <main className="bg-white text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-600">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href="/guides" className="hover:underline">
            Guides
          </Link>
        </nav>

        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
          Water, smoke, mould or dust in your home: what to do first
        </h1>
        <p className="mt-4 text-lg text-slate-700">
          This guide is for homeowners and tenants dealing with water damage, dampness, suspected
          sewage, smoke, fumes, mould or building dust. It covers what to do first, what to write
          down, and how to ask for a restoration contractor. It is general information, not advice
          about your home or your health.
        </p>

        <nav aria-label="On this page" className="mt-8 rounded-lg border border-slate-200 p-4">
          <p className="font-semibold">On this page</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-700">
            <li><a href="#emergency" className="hover:underline">Stop: is anyone in danger?</a></li>
            <li><a href="#incident-types" className="hover:underline">What kind of problem is it?</a></li>
            <li><a href="#first-actions" className="hover:underline">Safe first actions</a></li>
            <li><a href="#record" className="hover:underline">Write down what you saw</a></li>
            <li><a href="#limits" className="hover:underline">What this guide cannot tell you</a></li>
            <li><a href="#who-else" className="hover:underline">Who else can help</a></li>
            <li><a href="#referral" className="hover:underline">Request a restoration contractor</a></li>
          </ol>
        </nav>

        <section
          id="emergency"
          aria-labelledby="emergency-heading"
          className="mt-10 rounded-lg border-2 border-red-600 bg-red-50 p-5"
        >
          <h2 id="emergency-heading" className="flex items-center gap-2 text-2xl font-bold text-red-800">
            <AlertTriangle className="h-6 w-6 shrink-0" aria-hidden="true" />
            Stop: is anyone in danger?
          </h2>
          <p className="mt-3 font-semibold text-red-900">
            If you notice any of the following, leave the building and call Triple Zero (000). Do
            not use the form on this site for an emergency.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-red-900">
            {emergencySigns.map((sign) => (
              <li key={sign}>{sign}</li>
            ))}
          </ul>
          <p className="mt-3 text-red-900">
            If you smell gas, do not switch lights or appliances on or off, and contact your gas
            supplier&apos;s emergency line once you are outside. Do not go back inside until
            emergency services or a qualified person tells you it is safe.
          </p>
        </section>

        <section id="incident-types" aria-labelledby="incident-types-heading" className="mt-10">
          <h2 id="incident-types-heading" className="text-2xl font-bold">
            What kind of problem is it?
          </h2>
          <p className="mt-2 text-slate-700">
            Many incidents involve more than one of these. If you are not sure, say so when you
            ask for help.
          </p>
          <ul className="mt-4 space-y-4">
            {incidentTypes.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <Icon className="mt-1 h-5 w-5 shrink-0 text-slate-600" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-slate-700">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="first-actions" aria-labelledby="first-actions-heading" className="mt-10">
          <h2 id="first-actions-heading" className="flex items-center gap-2 text-2xl font-bold">
            <ShieldCheck className="h-6 w-6 shrink-0 text-slate-600" aria-hidden="true" />
            Safe first actions
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
            {firstActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </section>

        <section id="record" aria-labelledby="record-heading" className="mt-10">
          <h2 id="record-heading" className="flex items-center gap-2 text-2xl font-bold">
            <ClipboardList className="h-6 w-6 shrink-0 text-slate-600" aria-hidden="true" />
            Write down what you saw
          </h2>
          <p className="mt-2 text-slate-700">
            A short record helps your insurer, landlord or contractor understand the problem. Write
            down only what you saw, smelt or were told, and note anything you are unsure of.
          </p>
          <dl className="mt-4 space-y-3">
            {recordFields.map(({ label, prompt }) => (
              <div key={label} className="rounded-lg border border-slate-200 p-3">
                <dt className="font-semibold">{label}</dt>
                <dd className="text-slate-700">{prompt}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="limits" aria-labelledby="limits-heading" className="mt-10">
          <h2 id="limits-heading" className="flex items-center gap-2 text-2xl font-bold">
            <HelpCircle className="h-6 w-6 shrink-0 text-slate-600" aria-hidden="true" />
            What this guide cannot tell you
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
            <li>
              It cannot tell you whether a symptom is caused by your home. If you or anyone in the
              home feels unwell, see your GP or another qualified health professional.
            </li>
            <li>
              It cannot tell you whether your home is safe to live in. That decision belongs to
              emergency services or a qualified professional who has inspected the property.
            </li>
            <li>
              It cannot tell you what is behind walls, under floors or in the air. Only an
              inspection can do that.
            </li>
          </ul>
        </section>

        <section id="who-else" aria-labelledby="who-else-heading" className="mt-10">
          <h2 id="who-else-heading" className="text-2xl font-bold">
            Who else can help
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
            <li>Your home or contents insurer, if you are insured.</li>
            <li>Your landlord, property manager or strata manager, if you rent or live in a unit.</li>
            <li>Your local council, for problems that affect neighbours or public drains.</li>
            <li>
              Your state or territory health department, for general information about mould,
              smoke and other indoor hazards.
            </li>
            <li>
              Safe Work Australia and your state or territory work health and safety regulator, for
              information about asbestos and other hazards in building materials.
            </li>
          </ul>
        </section>

        <section
          id="referral"
          aria-labelledby="referral-heading"
          className="mt-10 rounded-lg border border-slate-300 bg-slate-50 p-5"
        >
          <h2 id="referral-heading" className="text-2xl font-bold">
            Request a restoration contractor
          </h2>
          <p className="mt-2 text-slate-700">
            When no one is in danger, you can describe the problem online and ask to be referred to
            a restoration contractor. Contractors are independent businesses. Before you agree to
            any work, ask them about their licences, insurance and qualifications for the type of
            problem you have.
          </p>
          <Link
            href="/claim/step-1"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Describe the problem and request a contractor
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  )
}
