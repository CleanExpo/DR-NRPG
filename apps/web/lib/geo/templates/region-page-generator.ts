/**
 * Region Page Generator
 * Disaster Recovery - NRPG Platform
 *
 * Generates region pages for /regions/{region}
 * e.g., /regions/qld, /regions/sunshine-coast
 *
 * Region pages provide an overview of all services available in a region
 */

import {
  RegionPageTemplate,
  FAQ,
  CTAButton,
  Breadcrumb,
  RelatedPage,
  DisasterRisk,
  ServiceAvailability,
  SuburbDirectory,
  LocalBusinessSchema,
  FAQSchema,
  BreadcrumbSchema,
  SchemaMarkup,
  OpenGraphData,
  DEFAULT_TEMPLATE_CONFIG,
} from './types';
import { SERVICE_CONFIG } from './landing-page-generator';
import { ServiceType, AustralianState, Coordinates, SuburbWithDistance } from '../types';

// ============================================
// Region Configuration
// ============================================

export interface RegionData {
  id: string;
  name: string;
  state: AustralianState;
  population: number;
  areaKm2: number;
  majorSuburbs: string[];
  coordinates: Coordinates;
  disasterRisks: DisasterRisk[];
}

export const REGIONS: Record<string, RegionData> = {
  'greater-sydney': {
    id: 'greater-sydney',
    name: 'Greater Sydney',
    state: 'NSW',
    population: 5312000,
    areaKm2: 12368,
    majorSuburbs: ['Sydney CBD', 'Parramatta', 'Penrith', 'Liverpool', 'Chatswood'],
    coordinates: { latitude: -33.8688, longitude: 151.2093 },
    disasterRisks: [
      {
        type: 'STORM',
        riskLevel: 'HIGH',
        seasonalPeak: 'November - March',
        description: 'Sydney experiences severe thunderstorms with damaging winds, hail, and flash flooding.',
      },
      {
        type: 'FLOOD',
        riskLevel: 'MEDIUM',
        seasonalPeak: 'February - April',
        description: 'Low-lying areas prone to flooding from heavy rainfall and river systems.',
      },
      {
        type: 'BUSHFIRE',
        riskLevel: 'HIGH',
        seasonalPeak: 'October - March',
        description: 'Western Sydney suburbs face significant bushfire risk during fire season.',
      },
    ],
  },
  'greater-melbourne': {
    id: 'greater-melbourne',
    name: 'Greater Melbourne',
    state: 'VIC',
    population: 5078000,
    areaKm2: 9993,
    majorSuburbs: ['Melbourne CBD', 'Geelong', 'Frankston', 'Dandenong', 'Box Hill'],
    coordinates: { latitude: -37.8136, longitude: 144.9631 },
    disasterRisks: [
      {
        type: 'STORM',
        riskLevel: 'HIGH',
        seasonalPeak: 'October - March',
        description: 'Melbourne experiences severe storms with destructive hail and flash flooding.',
      },
      {
        type: 'BUSHFIRE',
        riskLevel: 'EXTREME',
        seasonalPeak: 'December - February',
        description: 'Outer Melbourne suburbs face extreme bushfire risk during summer.',
      },
      {
        type: 'FLOOD',
        riskLevel: 'MEDIUM',
        seasonalPeak: 'June - October',
        description: 'River flooding and flash floods affect low-lying areas.',
      },
    ],
  },
  'south-east-queensland': {
    id: 'south-east-queensland',
    name: 'South East Queensland',
    state: 'QLD',
    population: 3500000,
    areaKm2: 22420,
    majorSuburbs: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Ipswich', 'Toowoomba'],
    coordinates: { latitude: -27.4705, longitude: 153.0260 },
    disasterRisks: [
      {
        type: 'FLOOD',
        riskLevel: 'EXTREME',
        seasonalPeak: 'January - March',
        description: 'SEQ experiences major flooding events from La Nina weather patterns and cyclone remnants.',
      },
      {
        type: 'STORM',
        riskLevel: 'HIGH',
        seasonalPeak: 'November - April',
        description: 'Severe thunderstorms with supercells, damaging hail, and destructive winds.',
      },
      {
        type: 'CYCLONE',
        riskLevel: 'MEDIUM',
        seasonalPeak: 'November - April',
        description: 'Cyclone impacts occasionally reach SEQ, bringing heavy rain and winds.',
      },
    ],
  },
  'greater-perth': {
    id: 'greater-perth',
    name: 'Greater Perth',
    state: 'WA',
    population: 2085000,
    areaKm2: 6417,
    majorSuburbs: ['Perth CBD', 'Fremantle', 'Joondalup', 'Rockingham', 'Midland'],
    coordinates: { latitude: -31.9505, longitude: 115.8605 },
    disasterRisks: [
      {
        type: 'BUSHFIRE',
        riskLevel: 'EXTREME',
        seasonalPeak: 'November - April',
        description: 'Perth hills and outer suburbs face extreme bushfire risk during hot, dry summers.',
      },
      {
        type: 'STORM',
        riskLevel: 'MEDIUM',
        seasonalPeak: 'May - August',
        description: 'Winter storms bring heavy rain and strong winds.',
      },
    ],
  },
  'greater-adelaide': {
    id: 'greater-adelaide',
    name: 'Greater Adelaide',
    state: 'SA',
    population: 1376000,
    areaKm2: 3259,
    majorSuburbs: ['Adelaide CBD', 'Elizabeth', 'Salisbury', 'Glenelg', 'Norwood'],
    coordinates: { latitude: -34.9285, longitude: 138.6007 },
    disasterRisks: [
      {
        type: 'BUSHFIRE',
        riskLevel: 'EXTREME',
        seasonalPeak: 'November - March',
        description: 'Adelaide Hills and surrounding areas face extreme bushfire risk.',
      },
      {
        type: 'STORM',
        riskLevel: 'MEDIUM',
        seasonalPeak: 'October - March',
        description: 'Severe thunderstorms with damaging winds and hail.',
      },
      {
        type: 'FLOOD',
        riskLevel: 'LOW',
        seasonalPeak: 'June - August',
        description: 'Flash flooding possible in low-lying areas during heavy rain.',
      },
    ],
  },
  'gold-coast': {
    id: 'gold-coast',
    name: 'Gold Coast',
    state: 'QLD',
    population: 679000,
    areaKm2: 1402,
    majorSuburbs: ['Surfers Paradise', 'Southport', 'Burleigh Heads', 'Robina', 'Nerang'],
    coordinates: { latitude: -28.0167, longitude: 153.4000 },
    disasterRisks: [
      {
        type: 'FLOOD',
        riskLevel: 'HIGH',
        seasonalPeak: 'January - March',
        description: 'Gold Coast canal systems and low-lying areas prone to flooding.',
      },
      {
        type: 'STORM',
        riskLevel: 'HIGH',
        seasonalPeak: 'November - April',
        description: 'Severe supercell thunderstorms with large hail and damaging winds.',
      },
      {
        type: 'CYCLONE',
        riskLevel: 'MEDIUM',
        seasonalPeak: 'November - April',
        description: 'Occasional cyclone impacts bring heavy rain and coastal erosion.',
      },
    ],
  },
  'sunshine-coast': {
    id: 'sunshine-coast',
    name: 'Sunshine Coast',
    state: 'QLD',
    population: 347000,
    areaKm2: 2291,
    majorSuburbs: ['Maroochydore', 'Caloundra', 'Noosa', 'Nambour', 'Buderim'],
    coordinates: { latitude: -26.6500, longitude: 153.0667 },
    disasterRisks: [
      {
        type: 'FLOOD',
        riskLevel: 'HIGH',
        seasonalPeak: 'January - March',
        description: 'River systems and coastal areas prone to significant flooding.',
      },
      {
        type: 'STORM',
        riskLevel: 'HIGH',
        seasonalPeak: 'November - April',
        description: 'Severe thunderstorms with heavy rain, hail, and strong winds.',
      },
      {
        type: 'BUSHFIRE',
        riskLevel: 'MEDIUM',
        seasonalPeak: 'September - December',
        description: 'Hinterland areas face moderate bushfire risk.',
      },
    ],
  },
  'north-queensland': {
    id: 'north-queensland',
    name: 'North Queensland',
    state: 'QLD',
    population: 450000,
    areaKm2: 450000,
    majorSuburbs: ['Townsville', 'Cairns', 'Mackay', 'Mount Isa', 'Bowen'],
    coordinates: { latitude: -19.2590, longitude: 146.8169 },
    disasterRisks: [
      {
        type: 'CYCLONE',
        riskLevel: 'EXTREME',
        seasonalPeak: 'November - April',
        description: 'North Queensland is the primary cyclone impact zone in Australia.',
      },
      {
        type: 'FLOOD',
        riskLevel: 'EXTREME',
        seasonalPeak: 'December - April',
        description: 'Monsoonal flooding and cyclone-related flooding are common.',
      },
      {
        type: 'STORM',
        riskLevel: 'HIGH',
        seasonalPeak: 'October - April',
        description: 'Severe tropical storms and thunderstorms during wet season.',
      },
    ],
  },
  'act': {
    id: 'act',
    name: 'Australian Capital Territory',
    state: 'ACT',
    population: 453000,
    areaKm2: 814,
    majorSuburbs: ['Canberra', 'Belconnen', 'Tuggeranong', 'Woden', 'Gungahlin'],
    coordinates: { latitude: -35.2809, longitude: 149.1300 },
    disasterRisks: [
      {
        type: 'BUSHFIRE',
        riskLevel: 'EXTREME',
        seasonalPeak: 'November - March',
        description: 'Canberra faces extreme bushfire risk, as seen in 2003 and 2020 fires.',
      },
      {
        type: 'STORM',
        riskLevel: 'MEDIUM',
        seasonalPeak: 'November - February',
        description: 'Severe thunderstorms with destructive hail.',
      },
    ],
  },
  'hobart-region': {
    id: 'hobart-region',
    name: 'Greater Hobart',
    state: 'TAS',
    population: 238000,
    areaKm2: 1695,
    majorSuburbs: ['Hobart', 'Glenorchy', 'Kingston', 'Bridgewater', 'New Norfolk'],
    coordinates: { latitude: -42.8821, longitude: 147.3272 },
    disasterRisks: [
      {
        type: 'BUSHFIRE',
        riskLevel: 'HIGH',
        seasonalPeak: 'December - March',
        description: 'Surrounding bushland creates significant fire risk during summer.',
      },
      {
        type: 'FLOOD',
        riskLevel: 'MEDIUM',
        seasonalPeak: 'June - August',
        description: 'Flash flooding possible in low-lying areas.',
      },
    ],
  },
  'darwin-region': {
    id: 'darwin-region',
    name: 'Darwin Region',
    state: 'NT',
    population: 147000,
    areaKm2: 3163,
    majorSuburbs: ['Darwin', 'Palmerston', 'Katherine', 'Litchfield', 'Howard Springs'],
    coordinates: { latitude: -12.4634, longitude: 130.8456 },
    disasterRisks: [
      {
        type: 'CYCLONE',
        riskLevel: 'EXTREME',
        seasonalPeak: 'November - April',
        description: 'Darwin experiences regular cyclone impacts during wet season.',
      },
      {
        type: 'FLOOD',
        riskLevel: 'HIGH',
        seasonalPeak: 'December - March',
        description: 'Monsoonal flooding affects many areas during wet season.',
      },
      {
        type: 'STORM',
        riskLevel: 'HIGH',
        seasonalPeak: 'October - April',
        description: 'Severe tropical thunderstorms common during wet season.',
      },
    ],
  },
};

// State-level regions
export const STATE_REGIONS: Record<AustralianState, RegionData> = {
  NSW: {
    id: 'nsw',
    name: 'New South Wales',
    state: 'NSW',
    population: 8176000,
    areaKm2: 800642,
    majorSuburbs: ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast', 'Wagga Wagga'],
    coordinates: { latitude: -32.1633, longitude: 147.0167 },
    disasterRisks: [
      {
        type: 'BUSHFIRE',
        riskLevel: 'EXTREME',
        seasonalPeak: 'October - March',
        description: 'NSW faces extreme bushfire risk, particularly in Blue Mountains and rural areas.',
      },
      {
        type: 'FLOOD',
        riskLevel: 'HIGH',
        seasonalPeak: 'February - April',
        description: 'Major flood events affect coastal and inland river systems.',
      },
      {
        type: 'STORM',
        riskLevel: 'HIGH',
        seasonalPeak: 'November - March',
        description: 'Severe thunderstorms with supercells and destructive hail.',
      },
    ],
  },
  VIC: {
    id: 'vic',
    name: 'Victoria',
    state: 'VIC',
    population: 6681000,
    areaKm2: 227444,
    majorSuburbs: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton'],
    coordinates: { latitude: -37.0167, longitude: 144.9667 },
    disasterRisks: [
      {
        type: 'BUSHFIRE',
        riskLevel: 'EXTREME',
        seasonalPeak: 'November - March',
        description: 'Victoria experiences catastrophic bushfire conditions.',
      },
      {
        type: 'STORM',
        riskLevel: 'HIGH',
        seasonalPeak: 'October - March',
        description: 'Severe hailstorms and destructive wind events.',
      },
      {
        type: 'FLOOD',
        riskLevel: 'MEDIUM',
        seasonalPeak: 'June - October',
        description: 'River flooding affects agricultural regions.',
      },
    ],
  },
  QLD: {
    id: 'qld',
    name: 'Queensland',
    state: 'QLD',
    population: 5259000,
    areaKm2: 1852642,
    majorSuburbs: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville', 'Cairns'],
    coordinates: { latitude: -22.4667, longitude: 144.2500 },
    disasterRisks: [
      {
        type: 'CYCLONE',
        riskLevel: 'EXTREME',
        seasonalPeak: 'November - April',
        description: 'Queensland coastal areas face regular cyclone impacts.',
      },
      {
        type: 'FLOOD',
        riskLevel: 'EXTREME',
        seasonalPeak: 'December - April',
        description: 'Major flooding events from cyclones and monsoonal rain.',
      },
      {
        type: 'STORM',
        riskLevel: 'HIGH',
        seasonalPeak: 'November - April',
        description: 'Severe supercell thunderstorms with large hail.',
      },
    ],
  },
  SA: {
    id: 'sa',
    name: 'South Australia',
    state: 'SA',
    population: 1821000,
    areaKm2: 1043514,
    majorSuburbs: ['Adelaide', 'Mount Gambier', 'Whyalla', 'Murray Bridge', 'Port Augusta'],
    coordinates: { latitude: -30.0000, longitude: 135.0000 },
    disasterRisks: [
      {
        type: 'BUSHFIRE',
        riskLevel: 'EXTREME',
        seasonalPeak: 'November - March',
        description: 'Adelaide Hills and rural areas face extreme bushfire risk.',
      },
      {
        type: 'STORM',
        riskLevel: 'MEDIUM',
        seasonalPeak: 'October - March',
        description: 'Severe thunderstorms with damaging winds.',
      },
    ],
  },
  WA: {
    id: 'wa',
    name: 'Western Australia',
    state: 'WA',
    population: 2760000,
    areaKm2: 2646954,
    majorSuburbs: ['Perth', 'Bunbury', 'Geraldton', 'Kalgoorlie', 'Broome'],
    coordinates: { latitude: -25.3333, longitude: 122.8333 },
    disasterRisks: [
      {
        type: 'CYCLONE',
        riskLevel: 'HIGH',
        seasonalPeak: 'November - April',
        description: 'Northern WA experiences regular severe cyclone impacts.',
      },
      {
        type: 'BUSHFIRE',
        riskLevel: 'EXTREME',
        seasonalPeak: 'November - April',
        description: 'Perth hills and rural areas face extreme bushfire conditions.',
      },
    ],
  },
  TAS: {
    id: 'tas',
    name: 'Tasmania',
    state: 'TAS',
    population: 572000,
    areaKm2: 90758,
    majorSuburbs: ['Hobart', 'Launceston', 'Devonport', 'Burnie', 'Kingston'],
    coordinates: { latitude: -42.0000, longitude: 147.0000 },
    disasterRisks: [
      {
        type: 'BUSHFIRE',
        riskLevel: 'HIGH',
        seasonalPeak: 'December - March',
        description: 'Tasmania faces significant bushfire risk during summer.',
      },
      {
        type: 'FLOOD',
        riskLevel: 'MEDIUM',
        seasonalPeak: 'June - August',
        description: 'River and flash flooding during winter.',
      },
    ],
  },
  NT: {
    id: 'nt',
    name: 'Northern Territory',
    state: 'NT',
    population: 250000,
    areaKm2: 1419630,
    majorSuburbs: ['Darwin', 'Alice Springs', 'Katherine', 'Palmerston', 'Tennant Creek'],
    coordinates: { latitude: -19.4914, longitude: 132.5510 },
    disasterRisks: [
      {
        type: 'CYCLONE',
        riskLevel: 'EXTREME',
        seasonalPeak: 'November - April',
        description: 'Northern coast experiences severe cyclone impacts annually.',
      },
      {
        type: 'FLOOD',
        riskLevel: 'HIGH',
        seasonalPeak: 'December - March',
        description: 'Monsoonal flooding affects many communities.',
      },
    ],
  },
  ACT: {
    id: 'act',
    name: 'Australian Capital Territory',
    state: 'ACT',
    population: 453000,
    areaKm2: 2358,
    majorSuburbs: ['Canberra', 'Belconnen', 'Tuggeranong', 'Woden', 'Gungahlin'],
    coordinates: { latitude: -35.2809, longitude: 149.1300 },
    disasterRisks: [
      {
        type: 'BUSHFIRE',
        riskLevel: 'EXTREME',
        seasonalPeak: 'November - March',
        description: 'ACT faces extreme bushfire risk from surrounding bushland.',
      },
      {
        type: 'STORM',
        riskLevel: 'MEDIUM',
        seasonalPeak: 'November - February',
        description: 'Severe supercell thunderstorms with large hail.',
      },
    ],
  },
};

// ============================================
// Region Page Generator
// ============================================

export interface RegionPageInput {
  region: RegionData;
  suburbsInRegion: SuburbWithDistance[];
  contractorData: {
    totalCount: number;
    averageRating: number;
    servicesOffered: ServiceType[];
  };
  serviceAvailability: Record<ServiceType, number>; // Service type -> contractor count
}

/**
 * Generate a region page
 */
export function generateRegionPage(input: RegionPageInput): RegionPageTemplate {
  const { region } = input;

  // Build URL slug
  const slug = `/regions/${region.id}`;
  const canonicalUrl = `${DEFAULT_TEMPLATE_CONFIG.baseUrl}${slug}`;

  // Generate title and meta
  const title = `Disaster Recovery Services ${region.name} ${region.state} | ${input.contractorData.totalCount} Contractors | ${DEFAULT_TEMPLATE_CONFIG.siteName}`;
  const metaDescription = `Professional disaster recovery services across ${region.name}, ${region.state}. ${input.contractorData.totalCount} certified contractors covering ${input.suburbsInRegion.length} suburbs. 24/7 emergency response. Get matched online.`;
  const h1 = `Disaster Recovery Services in ${region.name}`;

  // Build breadcrumbs
  const breadcrumbs: Breadcrumb[] = [
    { label: 'Home', href: '/', current: false },
    { label: 'Regions', href: '/regions', current: false },
    { label: region.name, href: slug, current: true },
  ];

  // Build region overview
  const regionOverview = `${region.name} is home to ${region.population.toLocaleString()} residents across ${region.areaKm2.toLocaleString()} square kilometres. Our network of ${input.contractorData.totalCount} certified contractors provides comprehensive disaster recovery services throughout the region, including ${region.majorSuburbs.slice(0, 4).join(', ')}, and ${input.suburbsInRegion.length - 4} more suburbs.`;

  // Build FAQs
  const faqs: FAQ[] = [
    {
      question: `What disaster recovery services are available in ${region.name}?`,
      answer: `We provide comprehensive disaster recovery services in ${region.name} including water damage restoration, fire damage restoration, mould remediation, storm damage repair, sewage cleanup, and biohazard cleanup. Our ${input.contractorData.totalCount} certified contractors cover all ${input.suburbsInRegion.length} suburbs.`,
    },
    {
      question: `What are the main disaster risks in ${region.name}?`,
      answer: `${region.name} faces ${region.disasterRisks.map((r) => `${r.type.toLowerCase()} risk (${r.riskLevel.toLowerCase()})`).join(', ')}. Our contractors are experienced in responding to these specific regional challenges.`,
    },
    {
      question: `How quickly can you respond to emergencies in ${region.name}?`,
      answer: `Contractors across ${region.name} prioritise rapid response for emergencies. The network is strategically distributed across the region to minimise travel time and get help on-site as quickly as possible.`,
    },
    {
      question: `Are your ${region.name} contractors certified?`,
      answer: `Yes, all our ${region.name} contractors are qualified with current licences and insurance. We maintain strict quality standards across our network.`,
    },
  ];

  // Build service availability
  const services: ServiceAvailability[] = Object.entries(SERVICE_CONFIG).map(([type, config]) => ({
    type: type as ServiceType,
    displayName: config.displayName,
    href: `/${region.id}/${config.slug}`,
    contractorCount: input.serviceAvailability[type as ServiceType] || 0,
    available: (input.serviceAvailability[type as ServiceType] || 0) > 0,
  }));

  // Build suburb directory
  const suburbs: SuburbDirectory[] = input.suburbsInRegion.slice(0, 100).map((suburb) => ({
    suburb: suburb.suburb,
    postcode: suburb.postcode,
    href: `/${slugify(suburb.suburb)}`,
    population: suburb.population || 0,
  }));

  // Build schema markup
  const schema = buildRegionSchemaMarkup(input, canonicalUrl, breadcrumbs, faqs);

  // Build Open Graph data
  const og: OpenGraphData = {
    title,
    description: metaDescription,
    type: 'place',
    url: canonicalUrl,
    image: `${DEFAULT_TEMPLATE_CONFIG.baseUrl}/images/regions/${region.id}.jpg`,
    imageAlt: `Disaster recovery services in ${region.name}`,
    siteName: DEFAULT_TEMPLATE_CONFIG.siteName,
    locale: 'en_AU',
  };

  // Build CTAs
  const cta = {
    primary: {
      text: `Get ${region.name} Quote`,
      href: `/quote?region=${region.id}`,
      variant: 'primary' as const,
      icon: '📋',
      tracking: {
        event: 'cta_click',
        category: 'quote',
        label: `region_${region.id}`,
      },
    },
    emergency: {
      text: 'Report Emergency Now',
      href: `/report-claim?urgent=true&region=${region.id}`,
      variant: 'emergency' as const,
      icon: '🚨',
      tracking: {
        event: 'cta_click',
        category: 'emergency',
        label: `region_${region.id}`,
      },
    },
  };

  // Related pages
  const relatedPages: RelatedPage[] = [
    {
      title: `${region.state} Disaster Recovery`,
      href: `/regions/${region.state.toLowerCase()}`,
      type: 'LOCATION',
    },
    {
      title: 'All Regions',
      href: '/regions',
      type: 'LOCATION',
    },
    {
      title: 'Emergency Preparedness Guide',
      href: '/guides/emergency-preparedness',
      type: 'GUIDE',
    },
  ];

  return {
    pageType: 'REGION',
    slug,
    title,
    metaDescription,
    h1,
    canonicalUrl,
    lastModified: new Date(),
    schema,
    og,
    breadcrumbs,
    relatedPages,
    region: {
      name: region.name,
      state: region.state,
      population: region.population,
      areaKm2: region.areaKm2,
      majorSuburbs: region.majorSuburbs,
      coordinates: region.coordinates,
    },
    content: {
      heroHeadline: h1,
      heroSubheadline: `${input.contractorData.totalCount} certified contractors across ${input.suburbsInRegion.length} suburbs`,
      regionOverview,
      disasterRisks: region.disasterRisks,
      faqs,
    },
    services,
    suburbs,
    contractors: input.contractorData,
    cta,
  };
}

// ============================================
// Schema Markup Builders
// ============================================

function buildRegionSchemaMarkup(
  input: RegionPageInput,
  canonicalUrl: string,
  breadcrumbs: Breadcrumb[],
  faqs: FAQ[]
): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildRegionLocalBusinessSchema(input, canonicalUrl),
      generateRegionFAQSchema(faqs),
      generateRegionBreadcrumbSchema(breadcrumbs),
    ],
  };
}

function buildRegionLocalBusinessSchema(
  input: RegionPageInput,
  canonicalUrl: string
): LocalBusinessSchema {
  return {
    '@type': 'LocalBusiness',
    '@id': `${canonicalUrl}#business`,
    name: `Disaster Recovery ${input.region.name}`,
    description: `Professional disaster recovery services across ${input.region.name}`,
    url: canonicalUrl,
    telephone: DEFAULT_TEMPLATE_CONFIG.email, // Email contact only (agency model)
    address: {
      '@type': 'PostalAddress',
      addressLocality: input.region.name,
      addressRegion: input.region.state,
      postalCode: '',
      addressCountry: 'AU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: input.region.coordinates.latitude,
      longitude: input.region.coordinates.longitude,
    },
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: input.region.coordinates.latitude,
        longitude: input.region.coordinates.longitude,
      },
      geoRadius: '100km',
    },
    priceRange: '$$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '00:00',
      closes: '23:59',
    },
    aggregateRating:
      input.contractorData.averageRating > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: input.contractorData.averageRating,
            reviewCount: input.contractorData.totalCount * 15,
          }
        : undefined,
  };
}

function generateRegionFAQSchema(faqs: FAQ[]): FAQSchema {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

function generateRegionBreadcrumbSchema(breadcrumbs: Breadcrumb[]): BreadcrumbSchema {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: `${DEFAULT_TEMPLATE_CONFIG.baseUrl}${crumb.href}`,
    })),
  };
}

// ============================================
// Utility Functions
// ============================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Get region by ID
 */
export function getRegionById(id: string): RegionData | undefined {
  return REGIONS[id] || STATE_REGIONS[id.toUpperCase() as AustralianState];
}

/**
 * Get all region IDs
 */
export function getAllRegionIds(): string[] {
  return [...Object.keys(REGIONS), ...Object.keys(STATE_REGIONS).map((s) => s.toLowerCase())];
}

/**
 * Get state region
 */
export function getStateRegion(state: AustralianState): RegionData {
  return STATE_REGIONS[state];
}

/**
 * Generate all region pages
 */
export function generateAllRegionPages(
  regionsData: Record<string, {
    suburbsInRegion: SuburbWithDistance[];
    contractorData: {
      totalCount: number;
      averageRating: number;
      servicesOffered: ServiceType[];
    };
    serviceAvailability: Record<ServiceType, number>;
  }>
): RegionPageTemplate[] {
  const pages: RegionPageTemplate[] = [];

  // Generate pages for defined regions
  for (const [regionId, regionData] of Object.entries(REGIONS)) {
    const inputData = regionsData[regionId];
    if (inputData) {
      pages.push(
        generateRegionPage({
          region: regionData,
          ...inputData,
        })
      );
    }
  }

  // Generate pages for states
  for (const [state, stateRegion] of Object.entries(STATE_REGIONS)) {
    const inputData = regionsData[state.toLowerCase()];
    if (inputData) {
      pages.push(
        generateRegionPage({
          region: stateRegion,
          ...inputData,
        })
      );
    }
  }

  return pages;
}
