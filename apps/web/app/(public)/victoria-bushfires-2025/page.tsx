/**
 * Victoria Bushfires 2025-26 Recovery Event Page
 *
 * Primary affected areas: East Gippsland, Alpine Shire, Indigo Shire, Wodonga, Greater Bendigo
 *
 * Financial assistance verified from:
 * - Emergency Recovery Victoria (ERV): recover.vic.gov.au
 * - Commonwealth-State DRFA (Victorian Disaster Recovery Funding Arrangements)
 *
 * Remote LGA qualifying language applied per GAP-035.
 * ACL s18 compliant — no unverified statistics.
 * PERILS estimate due 13 April 2026.
 */

import type { Metadata } from 'next'
import DisasterEventPage from '@/components/public/events/DisasterEventPage'

export const metadata: Metadata = {
  title: 'Victoria Bushfires 2025 — Disaster Recovery & Insurance Claims | NRPG',
  description:
    'Victoria Bushfires 2025. IICRC-certified restoration contractors attending fire and smoke damage across East Gippsland, Alpine, Indigo, Wodonga and Greater Bendigo. Government assistance, insurance claims, and rapid response.',
  alternates: {
    canonical: 'https://nrpg.business/victoria-bushfires-2025',
  },
  openGraph: {
    title: 'Victoria Bushfires 2025 Recovery — NRPG Disaster Restoration',
    description:
      'Expert fire and smoke damage restoration for Victoria Bushfire-affected properties. IICRC-certified contractors, government assistance guidance, and insurance claims support.',
    url: 'https://disasterrecovery.com.au/victoria-bushfires-2025',
    type: 'website',
  },
}

export default function VictoriaBushfires2025Page() {
  return (
    <DisasterEventPage
      eventName="East Gippsland & Alpine Region"
      eventType="bushfire"
      eventPhase="recovery"
      state="Victoria"
      stateAbbr="VIC"
      year={2025}
      iicrcStandard="IICRC S770 (Fire & Smoke Damage Restoration)"
      slug="victoria-bushfires-2025"
      metaTitle="Victoria Bushfires 2025 — Disaster Recovery & Insurance Claims | NRPG"
      metaDescription="Victoria Bushfires 2025. IICRC-certified restoration contractors attending fire and smoke damage across East Gippsland, Alpine, Indigo, Wodonga and Greater Bendigo."
      affectedLGAs={[
        'East Gippsland',
        'Alpine Shire',
        'Indigo Shire',
        'Wodonga',
        'Greater Bendigo',
      ]}
      remoteLGAs={['Alpine Shire']}
      governmentHotline="1800 226 226"
      governmentApplicationUrl="https://www.recover.vic.gov.au"
      governmentApplicationLabel="Emergency Recovery Victoria"
      financialAssistance={[
        {
          name: 'Emergency Relief Payments — Victorian Bushfires 2025',
          provider: 'Emergency Recovery Victoria (ERV)',
          description:
            'Immediate financial assistance for eligible households whose primary residence has been directly impacted by the 2025 Victorian Bushfires. Covers essential needs including food, clothing, and temporary accommodation while insurance or other long-term support is arranged.',
          amounts: 'Up to $400 per adult | Up to $160 per child',
          hotline: '1800 226 226',
          applicationUrl: 'https://www.recover.vic.gov.au',
        },
        {
          name: 'DRFA Household Disaster Recovery Grant — Victoria',
          provider: 'Commonwealth-State Disaster Recovery Funding Arrangements',
          description:
            'Grant funding for owner-occupiers whose primary residence has sustained significant structural or non-structural damage from the 2025 Victorian Bushfires. Requires damage assessment by an ERV assessor. Covers clean-up, essential repairs, and safety restoration.',
          amounts: 'Up to $685 (non-structural) | Up to $14,685 (structural damage)',
          hotline: '1800 226 226',
          applicationUrl: 'https://www.recover.vic.gov.au/disaster-grants',
        },
        {
          name: 'Personal Hardship Assistance — Small Business',
          provider: 'Emergency Recovery Victoria (ERV)',
          description:
            'Financial assistance for small business owners who have suffered direct damage or significant disruption to their operations as a result of the 2025 Victorian Bushfires. Administered through DRFA co-funding arrangements.',
          hotline: '1800 226 226',
          applicationUrl: 'https://www.recover.vic.gov.au',
        },
        {
          name: 'ICA Insurance Assistance — Declared Bushfire Event',
          provider: 'Insurance Council of Australia',
          description:
            'The Insurance Council of Australia has declared the 2025 Victoria Bushfires a Significant Event. If your property has sustained fire, smoke, or suppression-water damage, contact your insurer promptly. NRPG restoration contractors can provide scope-of-works documentation to support your claim.',
          applicationUrl: 'https://www.ica.com.au',
        },
      ]}
    />
  )
}
