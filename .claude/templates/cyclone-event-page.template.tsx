/**
 * BUILD-006: Cyclone Rapid-Deploy Template
 *
 * HOW TO USE:
 * 1. Copy this file to: apps/web/app/(public)/cyclone-[NAME]-queensland-[YEAR]/page.tsx
 * 2. Fill in all [PLACEHOLDER] values from verified government sources
 * 3. Run pre-deploy checklist (.claude/templates/cyclone-deploy-checklist.md)
 * 4. Commit, push to develop, PR to main — deploys via Vercel CLI
 *
 * SOURCE REQUIREMENTS (ACL s18 compliant):
 * - BOM: http://www.bom.gov.au/cyclone/
 * - DRFA declarations: https://www.disasterassist.gov.au/
 * - QLD: https://www.qld.gov.au/community/disasters-emergencies/financial-assistance
 * - WA: https://www.dfes.wa.gov.au/emergency-preparedness/recovery
 * - NSW: https://www.service.nsw.gov.au/disaster-assistance
 * - VIC: https://www.vic.gov.au/emergency-financial-assistance
 *
 * NEVER invent statistics, approval rates, or claim counts.
 * NEVER list specific LGAs unless confirmed by DRFA declaration or government source.
 */

import type { Metadata } from 'next'
import DisasterEventPage from '@/components/public/events/DisasterEventPage'

// ─── FILL IN: Event identity ──────────────────────────────────────────────────
// CYCLONE_NAME:  e.g. "Alfred", "Winston", "Debbie" (no "Cyclone" prefix)
// STATE:         Full state name: "Queensland", "Western Australia", etc.
// STATE_ABBR:    "QLD", "WA", "NT", "NSW"
// YEAR:          e.g. 2026
// SLUG:          kebab-case URL: "cyclone-alfred-queensland-2026"
// PHASE:         "pre-landfall" | "recovery"
//   - pre-landfall: system named but not made landfall yet
//   - recovery: system has made landfall, recovery underway
// ─────────────────────────────────────────────────────────────────────────────

const CYCLONE_NAME = '[NAME]'             // e.g. "Alfred"
const STATE = '[STATE]'                   // e.g. "Queensland"
const STATE_ABBR = '[ABBR]'              // e.g. "QLD"
const YEAR = 2026
const SLUG = `cyclone-[name]-[state]-${YEAR}`
const PHASE: 'pre-landfall' | 'recovery' = 'pre-landfall'

// IICRC standard: cyclones → water damage (S500) + sometimes wind (S770)
// Use "AS-IICRC S500:2025 (Water Damage Restoration)" for most cyclone events
const IICRC_STANDARD = 'AS-IICRC S500:2025 (Water Damage Restoration)'

export const metadata: Metadata = {
  title: `Cyclone ${CYCLONE_NAME} ${STATE_ABBR} ${YEAR} — Disaster Recovery & Insurance Claims | NRPG`,
  description: `Cyclone ${CYCLONE_NAME} ${STATE} ${YEAR}. IICRC-certified restoration contractors attending all declared areas. Government assistance, insurance claims, and rapid response.`,
  alternates: {
    canonical: `https://disasterrecovery.com.au/${SLUG}`,
  },
  openGraph: {
    title: `Cyclone ${CYCLONE_NAME} ${STATE_ABBR} Recovery — NRPG Disaster Restoration`,
    description: `Expert disaster restoration for Cyclone ${CYCLONE_NAME}-affected properties across ${STATE}. IICRC-certified contractors, government assistance guidance, and insurance claims support.`,
    url: `https://disasterrecovery.com.au/${SLUG}`,
    type: 'website',
  },
}

export default function CycloneEventPage() {
  return (
    <DisasterEventPage
      eventName={CYCLONE_NAME}
      eventType="cyclone"
      eventPhase={PHASE}
      state={STATE}
      stateAbbr={STATE_ABBR}
      year={YEAR}
      iicrcStandard={IICRC_STANDARD}
      slug={SLUG}
      metaTitle={metadata.title as string}
      metaDescription={metadata.description as string}

      // ── Affected areas ──────────────────────────────────────────────────────
      // Source: Official DRFA declaration or government emergency management site
      // Only list LGAs confirmed in the official declaration. No guessing.
      affectedLGAs={[
        '[LGA 1]',   // e.g. "Cairns"
        '[LGA 2]',   // e.g. "Cassowary Coast"
        '[LGA 3]',   // add/remove as needed
      ]}
      // Remote LGAs: areas requiring qualifying language ("subject to access")
      // Only include if the LGA has road/access limitations post-cyclone.
      remoteLGAs={[
        // '[Remote LGA]',  // uncomment if applicable
      ]}

      // ── Government contact ──────────────────────────────────────────────────
      // QLD: 1800 173 349 (QFES) or 13 QGOV (13 74 68)
      // WA:  1800 032 965 (DFES Recovery)
      // NT:  1800 723 375 (NT Emergency Recovery)
      // NSW: 13 77 88 (Service NSW)
      governmentHotline="[HOTLINE]"

      // ── Financial assistance programs ───────────────────────────────────────
      // Add one object per program. Verify all amounts and deadlines from official sources.
      // Never invent amounts. If unknown, omit the amounts field.
      financialAssistance={[
        {
          name: '[Program Name]',             // e.g. "DRFA Essential Services Hardship Allowance"
          provider: '[Government Agency]',     // e.g. "Queensland Government"
          description: '[Who qualifies and what it covers — plain language, verified]',
          amounts: '[$ amounts if confirmed]', // e.g. "$150 per person" or omit if unknown
          deadline: '[DD Month YYYY]',         // e.g. "27 April 2026" or omit if open-ended
          applicationUrl: '[URL]',             // official application URL
          hotline: '[PHONE]',                  // program-specific hotline if different from above
        },
        // Add more programs as needed. Common QLD programs:
        // - DRFA Essential Services Hardship Allowance (ESHA)
        // - DRFA Personal Hardship Assistance
        // - QRIDA Disaster Assistance Loans
        // - Commonwealth Disaster Recovery Payment (DRP)
        // - Commonwealth Disaster Recovery Allowance (DRA)
      ]}

      governmentApplicationUrl="[URL]"       // Main government recovery portal
      governmentApplicationLabel="[Label]"   // e.g. "Apply at disaster.qld.gov.au"

      // ── Optional: ESHA urgency (QLD only) ──────────────────────────────────
      // Only include if ESHA is active with a confirmed close date.
      // eshaDeadline="YYYY-MM-DD"
      // eshaLGAs={['LGA 1', 'LGA 2']}
    />
  )
}
