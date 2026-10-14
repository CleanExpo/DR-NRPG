/**
 * Victoria Bushfires January 2026 — Recovery Page
 *
 * Event: Victorian Bushfires commencing 7 January 2026
 * Source: disasterassist.gov.au/Pages/disasters/victoria/victorian-bushfires-commencing-7-Jan-2026.aspx
 *
 * Pre-Deploy Checklist:
 * G1 ✅ Official declaration confirmed.
 *       Source: https://www.disasterassist.gov.au/Pages/disasters/victoria/victorian-bushfires-commencing-7-Jan-2026.aspx
 * G2 ✅ Declared LGAs verified (23 declared) from Premier VIC press release.
 *       Source: https://www.premier.vic.gov.au/disaster-assistance-available-bushfire-affected-communities-victoria
 * G3 ✅ Financial assistance verified from emergency.vic.gov.au and Services Australia.
 *       Source: https://emergency.vic.gov.au/relief-and-recovery/1154
 *       Note: Emergency Relief Payments now closed. DRA deadline 21 July 2026.
 *       PPOP deadline 31 March 2026 (now passed).
 * G4 N/A No remote LGAs — all are accessible VIC regional areas.
 * G5 ✅ Phase: recovery (fires commenced 7 January 2026, recovery underway April 2026).
 *
 * IICRC Standards for bushfire recovery:
 * - Water damage from suppression: S500
 * - Smoke/soot remediation: IICRC S520 (Mould) + FSRT (Fire/Smoke)
 * - Contents cleaning: IICRC S100 (Cleaning) + S700 (Odour Control)
 *
 * ACL s18 compliant — no unverified statistics.
 */

import { SITE_URL } from '@/lib/seo/site-url'
import type { Metadata } from 'next'
import DisasterEventPage from '@/components/public/events/DisasterEventPage'

export const metadata: Metadata = {
  title: 'Victoria Bushfires 2026 — Insurance Claims & Recovery | NRPG',
  description:
    'Victorian Bushfires (January 2026). 23 declared LGAs including East Gippsland, Alpine, Greater Bendigo, and Wodonga. IICRC-certified restoration contractors for smoke damage, water damage from suppression, and insurance claims support.',
  alternates: {
    canonical: `${SITE_URL}/victoria-bushfires-2026`,
  },
  openGraph: {
    title: 'Victoria Bushfires 2026 — Recovery & Insurance Claims | NRPG',
    description:
      'Expert disaster restoration for Victoria bushfire-affected properties. Smoke remediation, suppression water damage, contents cleaning — IICRC-certified contractors across all 23 declared LGAs.',
    url: `${SITE_URL}/victoria-bushfires-2026`,
    type: 'website',
  },
}

export default function VictoriaBushfires2026Page() {
  return (
    <DisasterEventPage
      eventName="Victoria Bushfires"
      eventType="bushfire"
      eventPhase="recovery"
      state="Victoria"
      stateAbbr="VIC"
      year={2026}
      iicrcStandard="IICRC FSRT (Fire & Smoke Restoration Technician)"
      slug="victoria-bushfires-2026"
      metaTitle="Victoria Bushfires 2026 — Insurance Claims & Recovery | NRPG"
      metaDescription="Victorian Bushfires January 2026. 23 declared LGAs. IICRC-certified restoration contractors for smoke damage, suppression water damage, and insurance claims support."

      // 23 LGAs declared per Premier VIC press release
      // Source: premier.vic.gov.au/disaster-assistance-available-bushfire-affected-communities-victoria
      affectedLGAs={[
        'Alpine',
        'Ararat',
        'Benalla',
        'Campaspe',
        'Colac Otway',
        'Corangamite',
        'East Gippsland',
        'Golden Plains',
        'Greater Bendigo',
        'Horsham',
        'Macedon Ranges',
        'Mansfield',
        'Mildura',
        'Mitchell',
        'Moira',
        'Mount Alexander',
        'Murrindindi',
        'Pyrenees',
        'Strathbogie',
        'Towong',
        'Wellington',
        'Wodonga',
        'Yarra Ranges',
      ]}
      remoteLGAs={[]}

      governmentHotline="1800 560 760"

      // Financial assistance programs — verified from emergency.vic.gov.au
      // Source: https://emergency.vic.gov.au/relief-and-recovery/1154
      financialAssistance={[
        {
          name: 'Australian Government Disaster Recovery Payment (AGDRP)',
          provider: 'Services Australia',
          description:
            'One-off payment for eligible adults and children whose homes were destroyed or severely damaged, who suffered serious injury, or whose family members died as a direct result of the January 2026 Victorian bushfires.',
          amounts: '$1,000 per eligible adult | $400 per eligible child',
          applicationUrl: 'https://www.servicesaustralia.gov.au/vic-bushfires-jan-2026',
          hotline: '180 22 66',
        },
        {
          name: 'Disaster Recovery Allowance (DRA)',
          provider: 'Services Australia',
          description:
            'Income support for employees, primary producers, and sole traders who experienced loss of income as a direct result of the January 2026 Victorian bushfires.',
          amounts: 'Up to 13 weeks of income support',
          deadline: '21 July 2026',
          applicationUrl: 'https://www.servicesaustralia.gov.au/disaster-recovery-allowance',
          hotline: '180 22 66',
        },
        {
          name: 'Re-establishment Assistance Payment',
          provider: 'Victorian Government / Emergency Recovery Victoria',
          description:
            'Financial assistance for uninsured or underinsured homeowners with limited resources who were unable to occupy their home for 7 or more days due to fire damage.',
          applicationUrl: 'https://emergency.vic.gov.au/relief-and-recovery/1154',
          hotline: '1800 560 760',
        },
        {
          name: 'Primary Producer Grants',
          provider: 'Victorian Government',
          description:
            'Grants to support primary producers with the cost of clean-up and emergency measures following the January 2026 bushfires.',
          amounts: 'Up to $75,000',
          applicationUrl: 'https://emergency.vic.gov.au/relief-and-recovery/1154',
          hotline: '1800 560 760',
        },
        {
          name: 'Clean-up Program',
          provider: 'Victorian Government',
          description:
            'Funding for demolition and hazardous material removal for uninsured or underinsured homeowners whose properties were destroyed or significantly damaged by the bushfires.',
          applicationUrl: 'https://emergency.vic.gov.au/relief-and-recovery/1154',
          hotline: '1800 560 760',
        },
      ]}

      governmentApplicationUrl="https://emergency.vic.gov.au/relief-and-recovery/1154"
      governmentApplicationLabel="Emergency Recovery Victoria — January 2026 Bushfires"
    />
  )
}
