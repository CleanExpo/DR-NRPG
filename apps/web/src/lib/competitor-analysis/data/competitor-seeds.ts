// @ts-nocheck

/**
 * Competitor Seed Data - Australian Disaster Recovery Market
 *
 * 40 competitors across 4 categories for comprehensive market analysis
 * Priority: 10 (highest) to 1 (lowest) based on market presence
 *
 * Categories:
 * 1. Restoration Companies (Direct Competitors) - 10
 * 2. Insurance Networks - 10
 * 3. Contractor Marketplaces - 10
 * 4. Industry Associations & TPAs - 10
 */

export const competitorSeeds = {
  RESTORATION_COMPANY: [
    {
      domain: 'servicemaster.com.au',
      name: 'ServiceMaster Restore Australia',
      priority: 10,
      businessModel: 'Direct competitor',
      targetMarket: 'Both',
      geographicFocus: ['NSW', 'VIC', 'QLD', 'WA', 'SA'],
      notes: 'Major international franchise, strong brand recognition',
    },
    {
      domain: 'servpro.com.au',
      name: 'SERVPRO Australia',
      priority: 10,
      businessModel: 'Direct competitor',
      targetMarket: 'Both',
      geographicFocus: ['NSW', 'VIC', 'QLD'],
      notes: 'US-based franchise, 24/7 emergency response',
    },
    {
      domain: 'belfor.com.au',
      name: 'BELFOR Australia',
      priority: 9,
      businessModel: 'Direct competitor',
      targetMarket: 'Commercial',
      geographicFocus: ['NSW', 'VIC', 'QLD', 'WA'],
      notes: 'Large-scale commercial focus, insurance partnerships',
    },
    {
      domain: 'steamatic.com.au',
      name: 'Steamatic Australia',
      priority: 8,
      businessModel: 'Direct competitor',
      targetMarket: 'Both',
      geographicFocus: ['All states'],
      notes: 'Franchise model, carpet and upholstery focus',
    },
    {
      domain: 'drytec.com.au',
      name: 'Drytec Restoration',
      priority: 7,
      businessModel: 'Direct competitor',
      targetMarket: 'Commercial',
      geographicFocus: ['NSW', 'VIC'],
      notes: 'Technical drying specialists',
    },
    {
      domain: 'waterdamagebrisbane.com.au',
      name: 'Water Damage Brisbane',
      priority: 6,
      businessModel: 'Direct competitor',
      targetMarket: 'Residential',
      geographicFocus: ['QLD'],
      notes: 'Local Brisbane operator, SEO-focused domain',
    },
    {
      domain: 'rapidrestoration.com.au',
      name: 'Rapid Restoration Services',
      priority: 6,
      businessModel: 'Direct competitor',
      targetMarket: 'Both',
      geographicFocus: ['NSW'],
      notes: 'Sydney-based, emergency response focus',
    },
    {
      domain: 'floodresponse.com.au',
      name: 'Flood Response',
      priority: 5,
      businessModel: 'Direct competitor',
      targetMarket: 'Both',
      geographicFocus: ['NSW', 'QLD'],
      notes: 'Flood-specific specialist',
    },
    {
      domain: 'mouldremovalaustralia.com.au',
      name: 'Mould Removal Australia',
      priority: 5,
      businessModel: 'Direct competitor',
      targetMarket: 'Residential',
      geographicFocus: ['All states'],
      notes: 'Mould-specific, national reach',
    },
    {
      domain: 'restorecare.com.au',
      name: 'RestoreCare',
      priority: 4,
      businessModel: 'Direct competitor',
      targetMarket: 'Both',
      geographicFocus: ['VIC'],
      notes: 'Melbourne-based restoration company',
    },
  ],

  INSURANCE_NETWORK: [
    {
      domain: 'nrma.com.au',
      name: 'NRMA Insurance - Restoration Network',
      priority: 10,
      businessModel: 'Insurance network',
      targetMarket: 'Both',
      geographicFocus: ['All states'],
      notes: 'Largest insurer, preferred contractor network',
    },
    {
      domain: 'suncorp.com.au',
      name: 'Suncorp Insurance Network',
      priority: 10,
      businessModel: 'Insurance network',
      targetMarket: 'Both',
      geographicFocus: ['All states'],
      notes: 'Major insurer, emergency assist program',
    },
    {
      domain: 'allianz.com.au',
      name: 'Allianz Australia Network',
      priority: 9,
      businessModel: 'Insurance network',
      targetMarket: 'Both',
      geographicFocus: ['All states'],
      notes: 'International insurer, builder network',
    },
    {
      domain: 'qbe.com.au',
      name: 'QBE Insurance Network',
      priority: 9,
      businessModel: 'Insurance network',
      targetMarket: 'Commercial',
      geographicFocus: ['All states'],
      notes: 'Commercial insurance focus',
    },
    {
      domain: 'iag.com.au',
      name: 'IAG - Insurance Australia Group',
      priority: 8,
      businessModel: 'Insurance network',
      targetMarket: 'Both',
      geographicFocus: ['All states'],
      notes: 'Parent of NRMA, CGU, RACV',
    },
    {
      domain: 'cgu.com.au',
      name: 'CGU Insurance Network',
      priority: 8,
      businessModel: 'Insurance network',
      targetMarket: 'Both',
      geographicFocus: ['All states'],
      notes: 'IAG subsidiary, business insurance',
    },
    {
      domain: 'youi.com.au',
      name: 'Youi Insurance',
      priority: 7,
      businessModel: 'Insurance network',
      targetMarket: 'Residential',
      geographicFocus: ['All states'],
      notes: 'Online insurer, growing market share',
    },
    {
      domain: 'aami.com.au',
      name: 'AAMI Insurance',
      priority: 7,
      businessModel: 'Insurance network',
      targetMarket: 'Residential',
      geographicFocus: ['All states'],
      notes: 'Suncorp subsidiary, strong brand',
    },
    {
      domain: 'racq.com.au',
      name: 'RACQ Insurance',
      priority: 6,
      businessModel: 'Insurance network',
      targetMarket: 'Both',
      geographicFocus: ['QLD'],
      notes: 'Queensland-focused insurer',
    },
    {
      domain: 'budgetdirect.com.au',
      name: 'Budget Direct Insurance',
      priority: 5,
      businessModel: 'Insurance network',
      targetMarket: 'Residential',
      geographicFocus: ['All states'],
      notes: 'Budget insurer, limited restoration network',
    },
  ],

  CONTRACTOR_MARKETPLACE: [
    {
      domain: 'hipages.com.au',
      name: 'hipages',
      priority: 10,
      businessModel: 'Aggregator marketplace',
      targetMarket: 'Both',
      geographicFocus: ['All states'],
      notes: 'Largest contractor marketplace Australia, strong SEO',
    },
    {
      domain: 'serviceseeking.com.au',
      name: 'ServiceSeeking',
      priority: 10,
      businessModel: 'Aggregator marketplace',
      targetMarket: 'Both',
      geographicFocus: ['All states'],
      notes: 'Major competitor to hipages, growing rapidly',
    },
    {
      domain: 'oneflare.com.au',
      name: 'Oneflare',
      priority: 9,
      businessModel: 'Aggregator marketplace',
      targetMarket: 'Both',
      geographicFocus: ['All states'],
      notes: 'Quote comparison platform, strong marketing',
    },
    {
      domain: 'airtasker.com',
      name: 'Airtasker',
      priority: 8,
      businessModel: 'Aggregator marketplace',
      targetMarket: 'Residential',
      geographicFocus: ['All states'],
      notes: 'Task-based marketplace, some restoration jobs',
    },
    {
      domain: 'truelocal.com.au',
      name: 'True Local',
      priority: 6,
      businessModel: 'Business directory',
      targetMarket: 'Both',
      geographicFocus: ['All states'],
      notes: 'Local business directory, contractor listings',
    },
    {
      domain: 'yellowpages.com.au',
      name: 'Yellow Pages Australia',
      priority: 6,
      businessModel: 'Business directory',
      targetMarket: 'Both',
      geographicFocus: ['All states'],
      notes: 'Traditional directory, declining but still relevant',
    },
    {
      domain: 'localsearch.com.au',
      name: 'Local Search',
      priority: 5,
      businessModel: 'Business directory',
      targetMarket: 'Both',
      geographicFocus: ['All states'],
      notes: 'Formerly Yellow Pages, rebranded',
    },
    {
      domain: 'startlocal.com.au',
      name: 'Start Local',
      priority: 4,
      businessModel: 'Business directory',
      targetMarket: 'Both',
      geographicFocus: ['All states'],
      notes: 'Local directory platform',
    },
    {
      domain: 'getquoted.com.au',
      name: 'Get Quoted',
      priority: 4,
      businessModel: 'Aggregator marketplace',
      targetMarket: 'Both',
      geographicFocus: ['NSW', 'VIC'],
      notes: 'Quote comparison for services',
    },
    {
      domain: 'houzz.com.au',
      name: 'Houzz Australia',
      priority: 5,
      businessModel: 'Aggregator marketplace',
      targetMarket: 'Residential',
      geographicFocus: ['All states'],
      notes: 'Home improvement platform, some restoration',
    },
  ],

  INDUSTRY_ASSOCIATION: [
    {
      domain: 'iicrc.org.au',
      name: 'International restoration certification body (Australia)',
      priority: 10,
      businessModel: 'Certification body',
      targetMarket: 'Industry',
      geographicFocus: ['All states'],
      notes: 'Industry certification standard, high authority',
    },
    {
      domain: 'arema.org.au',
      name: 'AREMA - Australian Restoration & Emergency Management',
      priority: 9,
      businessModel: 'Industry association',
      targetMarket: 'Industry',
      geographicFocus: ['All states'],
      notes: 'National restoration industry body',
    },
    {
      domain: 'masterbuilders.com.au',
      name: 'Master Builders Australia',
      priority: 8,
      businessModel: 'Industry association',
      targetMarket: 'Industry',
      geographicFocus: ['All states'],
      notes: 'Building industry association, restoration members',
    },
    {
      domain: 'hia.com.au',
      name: 'Housing Industry Association',
      priority: 8,
      businessModel: 'Industry association',
      targetMarket: 'Industry',
      geographicFocus: ['All states'],
      notes: 'Housing industry body',
    },
    {
      domain: 'crawforddirect.com.au',
      name: 'Crawford & Company - Loss Adjusters',
      priority: 7,
      businessModel: 'Third-party administrator',
      targetMarket: 'Commercial',
      geographicFocus: ['All states'],
      notes: 'Major TPA, controls contractor access',
    },
    {
      domain: 'sedgwick.com.au',
      name: 'Sedgwick Australia - Loss Adjusters',
      priority: 7,
      businessModel: 'Third-party administrator',
      targetMarket: 'Commercial',
      geographicFocus: ['All states'],
      notes: 'International TPA, restoration network',
    },
    {
      domain: 'gaa.com.au',
      name: 'GAA - Gallagher Bassett',
      priority: 6,
      businessModel: 'Third-party administrator',
      targetMarket: 'Commercial',
      geographicFocus: ['All states'],
      notes: 'Claims management, preferred contractors',
    },
    {
      domain: 'mclarens.com.au',
      name: 'McLarens Australia',
      priority: 5,
      businessModel: 'Loss adjusters',
      targetMarket: 'Commercial',
      geographicFocus: ['NSW', 'VIC', 'QLD'],
      notes: 'Independent loss adjusters',
    },
    {
      domain: 'aioh.org.au',
      name: 'AIOH - Australian Institute of Occupational Hygienists',
      priority: 6,
      businessModel: 'Professional association',
      targetMarket: 'Industry',
      geographicFocus: ['All states'],
      notes: 'Mould and air quality standards',
    },
    {
      domain: 'safeworkaustralia.gov.au',
      name: 'Safe Work Australia',
      priority: 7,
      businessModel: 'Government authority',
      targetMarket: 'Industry',
      geographicFocus: ['All states'],
      notes: 'WHS regulations, industry standards',
    },
  ],
} as const;

// Flatten for easy iteration
export const allCompetitors = [
  ...competitorSeeds.RESTORATION_COMPANY.map(c => ({ ...c, category: 'RESTORATION_COMPANY' as const })),
  ...competitorSeeds.INSURANCE_NETWORK.map(c => ({ ...c, category: 'INSURANCE_NETWORK' as const })),
  ...competitorSeeds.CONTRACTOR_MARKETPLACE.map(c => ({ ...c, category: 'CONTRACTOR_MARKETPLACE' as const })),
  ...competitorSeeds.INDUSTRY_ASSOCIATION.map(c => ({ ...c, category: 'INDUSTRY_ASSOCIATION' as const })),
];

// Helper: Get competitors by category
export function getCompetitorsByCategory(category: keyof typeof competitorSeeds) {
  return competitorSeeds[category];
}

// Helper: Get top N competitors by priority
export function getTopCompetitors(n: number = 10) {
  return allCompetitors
    .sort((a, b) => b.priority - a.priority)
    .slice(0, n);
}

// Helper: Get competitors for specific state
export function getCompetitorsForState(state: string) {
  return allCompetitors.filter(c =>
    c.geographicFocus.includes(state) || c.geographicFocus.includes('All states')
  );
}

// Total count validation
console.assert(
  allCompetitors.length === 40,
  `Expected 40 competitors, got ${allCompetitors.length}`
);
