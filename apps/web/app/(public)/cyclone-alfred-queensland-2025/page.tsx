/**
 * BUILD-008: Ex-Tropical Cyclone Alfred — Queensland 2025 (Recovery)
 *
 * TC Alfred made landfall SE Queensland / Northern NSW, late February 2025.
 * ICA Insurance Catastrophe declared. 95,000+ claims lodged as at March 2025.
 *
 * Pre-Deploy Checklist:
 * G1 ✅ ICA Catastrophe declaration confirmed.
 *       Source: https://insurancecouncil.com.au/resource/insurance-catastrophe-declared-for-tropical-cyclone-alfred/
 * G2 ✅ Affected LGAs: 16 QLD councils declared under DRFA.
 *       Source: https://www.qra.qld.gov.au/news-case-studies/news/cyclone-alfred-financial-assistance-available-south-east-queensland-residents
 * G3 ✅ Financial assistance: Amounts from QRA official news (published 11 March 2025).
 *       Note: Application deadlines for most programs have passed (event was Feb-Mar 2025).
 *       Insurance claims and AFCA dispute pathways remain open.
 * G4 N/A No remote LGAs — all declared areas are accessible SE QLD metro/regional.
 * G5 ✅ Phase: recovery (TC Alfred made landfall Feb 2025, recovery ongoing).
 *
 * Sources:
 * - ICA: https://insurancecouncil.com.au/resource/insurance-catastrophe-declared-for-tropical-cyclone-alfred/
 * - QRA: https://www.qra.qld.gov.au/news-case-studies/news/cyclone-alfred-financial-assistance-available-south-east-queensland-residents
 * - disasterassist.gov.au: https://www.disasterassist.gov.au/Pages/disasters/queensland/tropical-cyclone-alfred-march-2025.aspx
 *
 * ACL s18 compliant — no unverified statistics.
 */

import { SITE_URL } from '@/lib/seo/site-url'
import type { Metadata } from 'next'
import DisasterEventPage from '@/components/public/events/DisasterEventPage'

export const metadata: Metadata = {
  title: 'Ex-Cyclone Alfred Queensland 2025 — Insurance Claims & Recovery | NRPG',
  description:
    'Ex-Tropical Cyclone Alfred hit SE Queensland and northern NSW in February 2025. ICA Insurance Catastrophe declared. IICRC-certified restoration contractors for water damage, storm damage, and insurance claims support across all 16 declared LGAs.',
  alternates: {
    canonical: `${SITE_URL}/cyclone-alfred-queensland-2025`,
  },
  openGraph: {
    title: 'Ex-Cyclone Alfred QLD 2025 — Insurance Claims & Restoration | NRPG',
    description:
      'Insurance Catastrophe declared for ex-TC Alfred. 95,000+ insurance claims lodged. Expert restoration contractors across SE Queensland — water damage, storm damage, and claims advocacy.',
    url: `${SITE_URL}/cyclone-alfred-queensland-2025`,
    type: 'website',
  },
}

export default function CycloneAlfredQLD2025Page() {
  return (
    <DisasterEventPage
      eventName="Alfred"
      eventType="cyclone"
      eventPhase="recovery"
      state="Queensland"
      stateAbbr="QLD"
      year={2025}
      iicrcStandard="IICRC S500 (Water Damage Restoration)"
      slug="cyclone-alfred-queensland-2025"
      metaTitle="Ex-Cyclone Alfred Queensland 2025 — Insurance Claims & Recovery | NRPG"
      metaDescription="Ex-Tropical Cyclone Alfred SE Queensland 2025. ICA Insurance Catastrophe declared. IICRC-certified restoration contractors, insurance claims support, across all declared LGAs."

      // Declared under DRFA per QRA (published 11 March 2025)
      // Source: qra.qld.gov.au/news-case-studies/news/cyclone-alfred-financial-assistance-available-south-east-queensland-residents
      affectedLGAs={[
        'Brisbane',
        'Bundaberg',
        'Fraser Coast',
        'Gold Coast',
        'Gympie',
        'Ipswich',
        'Lockyer Valley',
        'Logan',
        'Moreton Bay',
        'Noosa',
        'Redland',
        'Scenic Rim',
        'Somerset',
        'Southern Downs',
        'Sunshine Coast',
        'Toowoomba',
      ]}
      remoteLGAs={[]}

      governmentHotline="1800 173 349"

      // Financial assistance programs declared for TC Alfred (QRA, March 2025).
      // Note: Most application windows for direct grants have passed.
      // Insurance claims and AFCA dispute pathways remain open.
      financialAssistance={[
        {
          name: 'Structural Assistance Grant',
          provider: 'Queensland Government',
          description:
            'For repair of a disaster-damaged dwelling to make it safe and habitable. The largest grant available to homeowners affected by TC Alfred.',
          amounts: 'Up to $80,000',
          applicationUrl: 'https://www.qld.gov.au/community/disasters-emergencies/disasters/money-finance/eligibility-apply/tc-alfred-march-2025',
          hotline: '1800 173 349',
        },
        {
          name: 'Essential Household Contents Grant',
          provider: 'Queensland Government',
          description:
            'Assistance to replace essential household contents destroyed or damaged by TC Alfred.',
          amounts: 'Up to $1,765 for individuals | Up to $5,300 for families',
          applicationUrl: 'https://www.qld.gov.au/community/disasters-emergencies/disasters/money-finance/eligibility-apply/tc-alfred-march-2025',
          hotline: '1800 173 349',
        },
        {
          name: 'Essential Services Reconnection Support',
          provider: 'Queensland Government',
          description:
            'Support for reconnection of essential services (power, water, gas) damaged by TC Alfred.',
          amounts: 'Up to $5,000',
          applicationUrl: 'https://www.qld.gov.au/community/disasters-emergencies/disasters/money-finance/eligibility-apply/tc-alfred-march-2025',
          hotline: '1800 173 349',
        },
        {
          name: 'Australian Government Disaster Recovery Payment',
          provider: 'Services Australia',
          description:
            'One-off payment for eligible adults and children seriously affected by TC Alfred. For those whose homes were destroyed, severely damaged, or who suffered serious injury.',
          amounts: '$1,000 per eligible adult | $400 per eligible child',
          applicationUrl: 'https://www.servicesaustralia.gov.au/disaster-recovery-payment',
          hotline: '180 22 66',
        },
        {
          name: 'Disaster Recovery Allowance',
          provider: 'Services Australia',
          description:
            'Income support for employees, primary producers, and sole traders who lost income as a direct result of TC Alfred.',
          amounts: 'Up to 13 weeks of income support',
          applicationUrl: 'https://www.servicesaustralia.gov.au/disaster-recovery-allowance',
          hotline: '180 22 66',
        },
      ]}

      governmentApplicationUrl="https://www.qld.gov.au/community/disasters-emergencies/disasters/money-finance/eligibility-apply/tc-alfred-march-2025"
      governmentApplicationLabel="TC Alfred Financial Assistance — QLD Government"
    />
  )
}
