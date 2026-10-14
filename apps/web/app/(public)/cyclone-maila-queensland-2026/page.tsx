/**
 * BUILD-006: Cyclone Maila — Queensland 2026 (Pre-landfall)
 *
 * Pre-Deploy Checklist Status (6 April 2026):
 * G1 ✅ Official declaration: TC Maila named by BOM TCWC Port Moresby. Active system.
 *       Source: https://www.bom.gov.au/cyclone/
 * G2 ⚠️  Affected LGAs: No BOM Watch/Warning issued for QLD as of 6 April 2026.
 *       Forecast: Far North Queensland coastal areas (low confidence track).
 *       No specific LGAs listed — none confirmed by official declaration.
 * G3 ✅  Financial assistance: None declared yet. Section omitted per checklist rules.
 * G4 N/A Qualifying language: No declared LGAs to qualify.
 * G5 ✅  Phase: pre-landfall (Maila has not made landfall on QLD coast).
 *
 * Sources:
 * - BOM: https://www.bom.gov.au/cyclone/
 * - QLD Emergency: https://www.disaster.qld.gov.au/
 * - QLD Community Recovery Hotline: 1800 173 349
 *
 * UPDATE INSTRUCTIONS: When BOM issues a QLD coastal Watch/Warning:
 * 1. Update affectedLGAs[] with the Watch/Warning zones from BOM bulletin
 * 2. Add remoteLGAs[] for any Cape York / Far North QLD remote communities
 * 3. Add financialAssistance[] once DRFA declaration is made
 * 4. Update eventPhase to "recovery" after landfall confirmed
 *
 * ACL s18 compliant — no unverified statistics.
 */

import type { Metadata } from 'next'
import DisasterEventPage from '@/components/public/events/DisasterEventPage'

export const metadata: Metadata = {
  title: 'Cyclone Maila Queensland 2026 — Disaster Preparation & Recovery | NRPG',
  description:
    'Tropical Cyclone Maila is forecast to approach Far North Queensland. IICRC-certified restoration contractors on standby for cyclone-affected properties. Preparation guide and recovery support.',
  alternates: {
    canonical: 'https://nrpg.business/cyclone-maila-queensland-2026',
  },
  openGraph: {
    title: 'Cyclone Maila QLD 2026 — Preparation & Recovery | NRPG',
    description:
      'Tropical Cyclone Maila is tracking towards Far North Queensland. IICRC-certified contractors ready to respond. Preparation guide, government resources, and insurance claims support.',
    url: 'https://disasterrecovery.com.au/cyclone-maila-queensland-2026',
    type: 'website',
  },
}

export default function CycloneMailaQLD2026Page() {
  return (
    <DisasterEventPage
      eventName="Maila"
      eventType="cyclone"
      eventPhase="pre-landfall"
      state="Queensland"
      stateAbbr="QLD"
      year={2026}
      iicrcStandard="IICRC S500 (Water Damage Restoration)"
      slug="cyclone-maila-queensland-2026"
      metaTitle="Cyclone Maila Queensland 2026 — Disaster Preparation & Recovery | NRPG"
      metaDescription="Tropical Cyclone Maila is forecast to approach Far North Queensland. IICRC-certified restoration contractors on standby. Preparation guide and recovery support."

      // No BOM Watch/Warning issued as of 6 April 2026.
      // LGAs will be added when BOM issues a Queensland coastal Watch/Warning.
      affectedLGAs={[]}
      remoteLGAs={[]}

      governmentHotline="1800 173 349"

      // No DRFA financial assistance declared yet.
      // Programs will be added once Queensland Government activates DRFA for Maila.
      financialAssistance={[]}

      governmentApplicationUrl="https://www.disaster.qld.gov.au/"
      governmentApplicationLabel="Queensland Disaster Hub"
    />
  )
}
