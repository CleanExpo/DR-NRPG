/**
 * Queensland Floods 2026 — Recovery (BUILD-001 Lane B)
 *
 * Tropical Low 29U event — QRA + ESHA declared assistance
 * ESHA closes 7 April 2026 — urgency banner active
 *
 * Financial assistance verified from disaster.qld.gov.au / QRA sources.
 * ACL s18 compliant — no unverified statistics.
 */

import { SITE_URL } from '@/lib/seo/site-url'
import type { Metadata } from 'next'
import DisasterEventPage from '@/components/public/events/DisasterEventPage'

export const metadata: Metadata = {
  title: 'Queensland Floods 2026 Recovery — Insurance Claims & Restoration | NRPG',
  description:
    'Queensland Floods 2026 recovery. IICRC S500-certified water damage restoration contractors across all declared LGAs. ESHA, Personal Hardship, and insurance claims support.',
  alternates: {
    canonical: `${SITE_URL}/queensland-floods-2026-recovery`,
  },
  openGraph: {
    title: 'Queensland Floods 2026 Recovery — NRPG Disaster Restoration',
    description:
      'Expert flood restoration for all QLD declared LGAs. IICRC-certified contractors, ESHA application guidance, and insurance claims support.',
    url: `${SITE_URL}/queensland-floods-2026-recovery`,
    type: 'website',
  },
}

export default function QueenslandFloods2026Page() {
  return (
    <DisasterEventPage
      eventName="Floods 2026"
      eventType="flood"
      eventPhase="recovery"
      state="Queensland"
      stateAbbr="QLD"
      year={2026}
      iicrcStandard="IICRC S500 (Water Damage Restoration)"
      slug="queensland-floods-2026-recovery"
      metaTitle="Queensland Floods 2026 Recovery — Insurance Claims & Restoration | NRPG"
      metaDescription="Queensland Floods 2026 recovery. IICRC-certified restoration across all declared LGAs. ESHA, Personal Hardship, and insurance claims support."
      // ESHA urgency — closes 7 April 2026
      eshaDeadline="2026-04-07"
      eshaLGAs={[
        'Banana',
        'Barcaldine',
        'Bundaberg',
        'Carpentaria',
        'Doomadgee',
        'Douglas',
        'Flinders',
        'Gladstone',
        'North Burnett',
        'Western Downs',
      ]}
      affectedLGAs={[
        // ESHA LGAs
        'Banana',
        'Barcaldine',
        'Bundaberg',
        'Carpentaria',
        'Doomadgee',
        'Douglas',
        'Flinders',
        'Gladstone',
        'North Burnett',
        'Western Downs',
        // Expanded QRA LGAs
        'Barcoo (Windorah)',
        'Boulia',
        'Diamantina',
      ]}
      remoteLGAs={['Carpentaria', 'Doomadgee', 'Barcoo (Windorah)', 'Boulia', 'Diamantina']}
      governmentHotline="1800 173 349"
      financialAssistance={[
        {
          name: 'ESHA — Emergency Services and Hardship Assistance',
          provider: 'Queensland Government',
          description:
            'Immediate financial assistance for eligible residents in declared LGAs who have experienced significant damage or displacement as a direct result of the 2026 Queensland floods.',
          deadline: '7 April 2026 — CLOSES SOON',
          hotline: '1800 173 349',
          applicationUrl: 'https://disaster.qld.gov.au',
        },
        {
          name: 'Personal Hardship Assistance',
          provider: 'Queensland Government',
          description:
            'Financial support for essential needs including temporary accommodation, essential household items, and emergency food and clothing. Available to individuals and families in declared LGAs.',
          deadline: '27 April 2026',
          hotline: '1800 173 349',
          applicationUrl: 'https://disaster.qld.gov.au',
        },
        {
          name: 'QRIDA Business Recovery Assistance',
          provider: 'Queensland Rural and Industry Development Authority',
          description:
            'Low-interest loans and grants available to eligible small businesses, primary producers, and non-profit organisations impacted by the 2026 Queensland floods. Contact QRIDA to discuss options.',
          hotline: '1800 623 946',
          applicationUrl: 'https://www.qrida.qld.gov.au',
        },
        {
          name: 'QRA Disaster Recovery Funding Arrangements (DRFA)',
          provider: 'Queensland Reconstruction Authority',
          description:
            'Concessional loans and other financial assistance available through QRA for eligible residents and businesses. Check QRA expanded LGA list: North Burnett, Barcoo, Boulia, Diamantina.',
          applicationUrl: 'https://www.qra.qld.gov.au',
        },
      ]}
      governmentApplicationUrl="https://disaster.qld.gov.au"
      governmentApplicationLabel="Apply at disaster.qld.gov.au"
    />
  )
}
