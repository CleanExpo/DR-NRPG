/**
 * Cyclone Narelle — Western Australia 2026 (BUILD-001 Lane A)
 *
 * DRFA Declared Event — WA Premier's Disaster Recovery Funding Arrangements
 * Declared shires: Exmouth, Carnarvon, Shark Bay, Ashburton, Upper Gascoyne, Yalgoo
 *
 * Financial assistance verified from WA DRFA / DFES sources.
 * Remote LGA qualifying language applied per GAP-035.
 * ACL s18 compliant — no unverified statistics.
 */

import type { Metadata } from 'next'
import DisasterEventPage from '@/components/public/events/DisasterEventPage'

export const metadata: Metadata = {
  title: 'Cyclone Narelle WA 2026 — Disaster Recovery & Insurance Claims | NRPG',
  description:
    'Cyclone Narelle Western Australia 2026. IICRC S500-certified restoration contractors attending all declared shires. Government assistance, insurance claims, and rapid response.',
  alternates: {
    canonical: 'https://nrpg.business/cyclone-narelle-western-australia-2026',
  },
  openGraph: {
    title: 'Cyclone Narelle WA Recovery — NRPG Disaster Restoration',
    description:
      'Expert disaster restoration for Cyclone Narelle-affected properties across WA. IICRC-certified contractors, government assistance guidance, and insurance claims support.',
    url: 'https://disasterrecovery.com.au/cyclone-narelle-western-australia-2026',
    type: 'website',
  },
}

export default function CycloneNarelleWA2026Page() {
  return (
    <DisasterEventPage
      eventName="Narelle"
      eventType="cyclone"
      eventPhase="recovery"
      state="Western Australia"
      stateAbbr="WA"
      year={2026}
      iicrcStandard="IICRC S500 (Water Damage Restoration)"
      slug="cyclone-narelle-western-australia-2026"
      metaTitle="Cyclone Narelle WA 2026 — Disaster Recovery & Insurance Claims | NRPG"
      metaDescription="Cyclone Narelle Western Australia 2026. IICRC S500-certified restoration contractors attending all declared shires."
      affectedLGAs={[
        'Exmouth',
        'Carnarvon',
        'Shark Bay',
        'Ashburton',
        'Upper Gascoyne',
        'Yalgoo',
      ]}
      remoteLGAs={['Ashburton', 'Upper Gascoyne', 'Yalgoo']}
      governmentHotline="1800 032 965"
      financialAssistance={[
        {
          name: "WA Premier's Disaster Relief Payment",
          provider: 'WA State Government',
          description:
            'One-off payment for households where the primary dwelling has been destroyed or severely damaged as a direct result of Cyclone Narelle. Requires inspection confirmation of damage level.',
          amounts: '$4,000 (destroyed/severely damaged) | $2,000 (major damage)',
          hotline: '1800 032 965',
          applicationUrl: 'https://www.dfes.wa.gov.au/recovery',
        },
        {
          name: 'WA Emergency Hardship Assistance',
          provider: 'WA Department of Communities',
          description:
            'Immediate financial assistance to help meet essential needs following Cyclone Narelle. Available to eligible individuals and families in declared shires.',
          amounts: '$150 per person | max $750 per family',
          deadline: '27 April 2026',
          hotline: '1800 032 965',
          applicationUrl: 'https://www.communities.wa.gov.au/disaster-relief',
        },
        {
          name: 'ARPC Declared Cyclone Event — Insurance Claims',
          provider: 'Australian Reinsurance Pool Corporation',
          description:
            'Cyclone Narelle has been declared a Cyclone Event by ARPC. This may affect how cyclone damage is treated under your insurance policy. Contact your insurer to understand your entitlements under ARPC cyclone cover.',
          hotline: '1800 032 965',
        },
      ]}
      governmentApplicationUrl="https://www.dfes.wa.gov.au/recovery"
      governmentApplicationLabel="WA Disaster Recovery"
    />
  )
}
