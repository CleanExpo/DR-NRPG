/**
 * GAP-089: NSW/QLD Storms April 2026 — Recovery Stub
 *
 * ICA Significant Event declared 10 April 2026 for NSW/QLD Storms 3–8 April 2026.
 * Primary impact zones: Hawkesbury-Nepean Valley and Illawarra (NSW); South East Queensland.
 *
 * Pre-Deploy Checklist:
 * G1 ✅ ICA Significant Event declared 10 April 2026.
 *       Source: https://insurancecouncil.com.au/news-hub/current-catastrophes/significant-events/
 * G2 ✅ Affected areas: Hawkesbury-Nepean Valley + Illawarra (NSW); SE QLD (ICA declaration).
 *       Specific LGA lists updated as DRFA declarations are confirmed.
 * G3 ⚠️  Financial assistance: NSW + QLD government programs listed; verify deadlines as declared.
 *       Source: https://www.service.nsw.gov.au/disaster-assistance and https://disaster.qld.gov.au
 * G4 N/A No confirmed remote LGAs at time of publication.
 * G5 ✅ Phase: recovery (storm event 3–8 April 2026, recovery underway).
 *
 * Sources:
 * - ICA Significant Events: https://insurancecouncil.com.au/news-hub/current-catastrophes/significant-events/
 * - NSW Disaster Assistance: https://www.service.nsw.gov.au/disaster-assistance
 * - QLD Disaster Hub: https://disaster.qld.gov.au
 * - AFCA: https://www.afca.org.au/make-a-complaint/your-complaint/types-of-complaints/insurance
 *
 * ACL s18 compliant — no unverified statistics.
 * Platform guarantee claim EXCLUDED pending GAP-061 legal review.
 * Event stub — update LGAs and financial assistance as DRFA declarations are confirmed.
 */

import { SITE_URL } from '@/lib/seo/site-url'
import type { Metadata } from 'next'
import DisasterEventPage from '@/components/public/events/DisasterEventPage'

export const metadata: Metadata = {
  title: 'NSW QLD Storms April 2026 — Insurance Claims & Recovery | NRPG',
  description:
    'NSW and QLD storms 3–8 April 2026. ICA Significant Event declared. IICRC-certified restoration contractors attending Hawkesbury-Nepean, Illawarra and SE QLD. Insurance claims, government assistance, and rapid response.',
  alternates: {
    canonical: `${SITE_URL}/nsw-qld-storms-april-2026`,
  },
  openGraph: {
    title: 'NSW QLD Storms April 2026 — Insurance Claims & Restoration | NRPG',
    description:
      'ICA Significant Event declared for NSW/QLD storms 3–8 April 2026. Expert IICRC-certified restoration contractors — Hawkesbury-Nepean, Illawarra, and SE QLD. Insurance claims support.',
    url: `${SITE_URL}/nsw-qld-storms-april-2026`,
    type: 'website',
  },
}

export default function NSWQLDStormsApril2026Page() {
  return (
    <DisasterEventPage
      eventName="NSW/QLD Storms April 2026"
      eventType="storm"
      eventPhase="recovery"
      state="New South Wales and Queensland"
      stateAbbr="NSW/QLD"
      year={2026}
      iicrcStandard="IICRC S500 (Water Damage Restoration)"
      slug="nsw-qld-storms-april-2026"
      metaTitle="NSW QLD Storms April 2026 — Insurance Claims & Recovery | NRPG"
      metaDescription="NSW and QLD storms 3–8 April 2026. ICA Significant Event. IICRC-certified restoration, insurance claims support, Hawkesbury-Nepean, Illawarra, SE QLD."

      // Primary impact zones per ICA Significant Event declaration (10 April 2026).
      // LGAs confirmed by DRFA declarations — update as additional areas are declared.
      // NSW primary: Hawkesbury-Nepean Valley, Illawarra corridor
      // QLD primary: South East Queensland (storm affected areas)
      affectedLGAs={[
        // NSW — Hawkesbury-Nepean Valley
        'Hawkesbury',
        'Penrith',
        'Wollondilly',
        // NSW — Illawarra
        'Wollongong',
        'Shellharbour',
        'Kiama',
        // NSW — Greater Sydney
        'The Hills Shire',
        'Blacktown',
        // QLD — SE Queensland
        'Gold Coast',
        'Logan',
        'Brisbane',
        'Scenic Rim',
      ]}
      remoteLGAs={[]}

      governmentHotline="13 77 88"

      // Government assistance programs — verify deadlines as declarations are confirmed.
      financialAssistance={[
        {
          name: 'Disaster Recovery Payment (NSW)',
          provider: 'Services Australia',
          description:
            'One-off payment for eligible NSW residents whose primary residence was destroyed, severely damaged, or who suffered serious injury as a direct result of the April 2026 storms.',
          amounts: '$1,000 per eligible adult | $400 per eligible child',
          applicationUrl: 'https://www.servicesaustralia.gov.au/disaster-recovery-payment',
          hotline: '180 22 66',
        },
        {
          name: 'Disaster Recovery Allowance (NSW)',
          provider: 'Services Australia',
          description:
            'Short-term income support for employees, primary producers, and sole traders in declared NSW areas who lost income as a direct result of the April 2026 storms.',
          amounts: 'Up to 13 weeks of income support',
          applicationUrl: 'https://www.servicesaustralia.gov.au/disaster-recovery-allowance',
          hotline: '180 22 66',
        },
        {
          name: 'NSW Disaster Relief Grants',
          provider: 'NSW Government',
          description:
            'Emergency financial assistance for eligible NSW residents in declared areas impacted by the April 2026 storms. For essential household items, temporary accommodation, and immediate needs.',
          applicationUrl: 'https://www.service.nsw.gov.au/disaster-assistance',
          hotline: '13 77 88',
        },
        {
          name: 'QLD Personal Hardship Assistance',
          provider: 'Queensland Government',
          description:
            'Financial support for essential needs for QLD residents in declared areas impacted by the April 2026 storms. Contact the QLD Community Recovery Hotline to confirm eligibility.',
          applicationUrl: 'https://disaster.qld.gov.au',
          hotline: '1800 173 349',
        },
        {
          name: 'AFCA Insurance Dispute Resolution',
          provider: 'Australian Financial Complaints Authority',
          description:
            'Free and independent dispute resolution if your insurer delays, denies, or disputes your storm damage claim. AFCA escalation available for all storm-affected policyholders.',
          applicationUrl: 'https://www.afca.org.au/make-a-complaint',
          hotline: '1800 931 678',
        },
      ]}

      governmentApplicationUrl="https://www.service.nsw.gov.au/disaster-assistance"
      governmentApplicationLabel="NSW Disaster Assistance — Service NSW"
    />
  )
}
