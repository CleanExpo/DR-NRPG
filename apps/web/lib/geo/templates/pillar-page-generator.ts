/**
 * Pillar Page Generator
 * Disaster Recovery - NRPG Platform
 *
 * Generates SEO pillar pages for /{city}/{service}
 * e.g., /brisbane/water-damage, /sydney/mould-remediation
 *
 * Pillar pages aggregate all suburb landing pages for a city + service
 */

import {
  PillarPageTemplate,
  ProcessStep,
  FAQ,
  CTAButton,
  Breadcrumb,
  RelatedPage,
  SuburbLink,
  LocalBusinessSchema,
  FAQSchema,
  BreadcrumbSchema,
  SchemaMarkup,
  OpenGraphData,
  DEFAULT_TEMPLATE_CONFIG,
} from './types';
import { SERVICE_CONFIG } from './landing-page-generator';
import {
  ServiceType,
  AustralianState,
  Coordinates,
  SuburbWithDistance,
  RegionWithCoverage,
} from '../types';

// ============================================
// City Configuration
// ============================================

export interface CityData {
  name: string;
  state: AustralianState;
  population: number;
  areaKm2: number;
  coordinates: Coordinates;
}

export const MAJOR_CITIES: Record<string, CityData> = {
  sydney: {
    name: 'Sydney',
    state: 'NSW',
    population: 5312000,
    areaKm2: 12368,
    coordinates: { latitude: -33.8688, longitude: 151.2093 },
  },
  melbourne: {
    name: 'Melbourne',
    state: 'VIC',
    population: 5078000,
    areaKm2: 9993,
    coordinates: { latitude: -37.8136, longitude: 144.9631 },
  },
  brisbane: {
    name: 'Brisbane',
    state: 'QLD',
    population: 2514000,
    areaKm2: 15826,
    coordinates: { latitude: -27.4705, longitude: 153.0260 },
  },
  perth: {
    name: 'Perth',
    state: 'WA',
    population: 2085000,
    areaKm2: 6417,
    coordinates: { latitude: -31.9505, longitude: 115.8605 },
  },
  adelaide: {
    name: 'Adelaide',
    state: 'SA',
    population: 1376000,
    areaKm2: 3259,
    coordinates: { latitude: -34.9285, longitude: 138.6007 },
  },
  goldcoast: {
    name: 'Gold Coast',
    state: 'QLD',
    population: 679000,
    areaKm2: 1402,
    coordinates: { latitude: -28.0167, longitude: 153.4000 },
  },
  newcastle: {
    name: 'Newcastle',
    state: 'NSW',
    population: 322000,
    areaKm2: 262,
    coordinates: { latitude: -32.9283, longitude: 151.7817 },
  },
  canberra: {
    name: 'Canberra',
    state: 'ACT',
    population: 453000,
    areaKm2: 814,
    coordinates: { latitude: -35.2809, longitude: 149.1300 },
  },
  wollongong: {
    name: 'Wollongong',
    state: 'NSW',
    population: 306000,
    areaKm2: 714,
    coordinates: { latitude: -34.4278, longitude: 150.8931 },
  },
  sunshinecoast: {
    name: 'Sunshine Coast',
    state: 'QLD',
    population: 347000,
    areaKm2: 2291,
    coordinates: { latitude: -26.6500, longitude: 153.0667 },
  },
  hobart: {
    name: 'Hobart',
    state: 'TAS',
    population: 238000,
    areaKm2: 1695,
    coordinates: { latitude: -42.8821, longitude: 147.3272 },
  },
  darwin: {
    name: 'Darwin',
    state: 'NT',
    population: 147000,
    areaKm2: 3163,
    coordinates: { latitude: -12.4634, longitude: 130.8456 },
  },
  geelong: {
    name: 'Geelong',
    state: 'VIC',
    population: 264000,
    areaKm2: 1328,
    coordinates: { latitude: -38.1499, longitude: 144.3617 },
  },
  townsville: {
    name: 'Townsville',
    state: 'QLD',
    population: 180000,
    areaKm2: 3736,
    coordinates: { latitude: -19.2590, longitude: 146.8169 },
  },
  cairns: {
    name: 'Cairns',
    state: 'QLD',
    population: 156000,
    areaKm2: 1687,
    coordinates: { latitude: -16.9186, longitude: 145.7781 },
  },
  toowoomba: {
    name: 'Toowoomba',
    state: 'QLD',
    population: 137000,
    areaKm2: 367,
    coordinates: { latitude: -27.5598, longitude: 151.9507 },
  },
  ballarat: {
    name: 'Ballarat',
    state: 'VIC',
    population: 109000,
    areaKm2: 739,
    coordinates: { latitude: -37.5622, longitude: 143.8503 },
  },
  bendigo: {
    name: 'Bendigo',
    state: 'VIC',
    population: 100000,
    areaKm2: 3047,
    coordinates: { latitude: -36.7570, longitude: 144.2794 },
  },
};

// ============================================
// Pillar Page Content Templates
// ============================================

interface CityServiceContent {
  cityOverviewTemplate: string;
  serviceOverviewTemplate: string;
  whyChooseUsTemplate: string[];
}

const PILLAR_CONTENT_TEMPLATES: Record<ServiceType, CityServiceContent> = {
  WATER_DAMAGE: {
    cityOverviewTemplate:
      '{city} experiences significant water damage incidents annually, from burst pipes in older suburbs to flash flooding during storm season. Our network of qualified contractors provides rapid response across {suburbCount} suburbs.',
    serviceOverviewTemplate:
      'Water damage restoration in {city} requires specialised knowledge of local building standards and climate conditions. Our contractors use industrial-grade equipment to extract water, dry structures, and prevent secondary mould growth.',
    whyChooseUsTemplate: [
      '24/7 emergency response across {city} metro area',
      '{contractorCount} qualified water damage specialists',
      'Average response time of {responseTime} minutes',
      'Direct billing to all major Australian insurers',
      'Local contractors who understand {city} building codes',
    ],
  },
  FIRE_DAMAGE: {
    cityOverviewTemplate:
      'Fire damage in {city} can be devastating, but professional restoration can save your property. Our {city} fire damage network responds to residential and commercial fires across {suburbCount} suburbs.',
    serviceOverviewTemplate:
      'Fire damage restoration involves structural assessment, soot removal, smoke deodorisation, and complete rebuilding. Our {city} contractors are licensed and certified to handle all aspects of fire restoration.',
    whyChooseUsTemplate: [
      'Emergency board-up services across {city}',
      'Certified fire restoration specialists',
      'Complete rebuild capabilities',
      'Insurance claim assistance',
      'Trauma-informed service delivery',
    ],
  },
  SMOKE_DAMAGE: {
    cityOverviewTemplate:
      'Smoke damage can affect your {city} property even without direct fire contact. Our specialists understand how smoke travels through HVAC systems and can identify hidden damage throughout your property.',
    serviceOverviewTemplate:
      'Professional smoke damage cleanup in {city} involves air quality testing, surface cleaning, content restoration, and complete odour elimination using industrial ozone and thermal fogging equipment.',
    whyChooseUsTemplate: [
      'Air quality testing and monitoring',
      'Content cleaning and restoration',
      'Thermal fogging and ozone treatment',
      'HVAC system cleaning',
      'Complete odour elimination guarantee',
    ],
  },
  MOULD_REMEDIATION: {
    cityOverviewTemplate:
      "{city}'s climate creates conditions where mould can thrive. Whether from flooding, humidity, or poor ventilation, our mould remediation specialists safely remove mould and prevent regrowth.",
    serviceOverviewTemplate:
      'Professional mould remediation in {city} includes inspection, containment, air filtration, safe removal, and preventive treatment. Our contractors follow industry standards for mould remediation.',
    whyChooseUsTemplate: [
      'Air quality testing before and after',
      'Remediation compliant with industry standards',
      'Containment to prevent spore spread',
      'HEPA air filtration throughout',
      'Clearance testing certificate provided',
    ],
  },
  STORM_DAMAGE: {
    cityOverviewTemplate:
      '{city} experiences severe weather events including storms, hail, and high winds. Our storm damage network provides emergency tarping, water extraction, and complete restoration services.',
    serviceOverviewTemplate:
      'Storm damage restoration in {city} covers roof repairs, water damage from flooding, debris removal, and structural repairs. We respond rapidly during storm events to prevent secondary damage.',
    whyChooseUsTemplate: [
      'Rapid deployment during storm events',
      'Emergency tarping and board-up',
      'Comprehensive insurance documentation',
      'Debris removal and disposal',
      'Full structural repair capabilities',
    ],
  },
  SEWAGE_CLEANUP: {
    cityOverviewTemplate:
      'Sewage incidents in {city} require immediate professional response due to health hazards. Our certified technicians safely remove contamination and restore your property to safe condition.',
    serviceOverviewTemplate:
      'Sewage cleanup in {city} involves contamination containment, extraction, sanitisation, and restoration. Our technicians use hospital-grade disinfectants and full PPE to ensure safe, complete cleanup.',
    whyChooseUsTemplate: [
      'Rapid response to sewage emergencies',
      'Hospital-grade sanitisation',
      'Full personal protective equipment',
      'Safe disposal of contaminated materials',
      'Post-cleanup verification testing',
    ],
  },
  BIOHAZARD_CLEANUP: {
    cityOverviewTemplate:
      'Biohazard situations in {city} require certified professionals. Our discreet, compassionate team handles trauma scenes, unattended deaths, and other biohazard scenarios with care and professionalism.',
    serviceOverviewTemplate:
      'Biohazard cleanup in {city} follows strict protocols for safety and complete decontamination. Our technicians are trained in bloodborne pathogen handling and provide ATP testing to verify complete cleanup.',
    whyChooseUsTemplate: [
      'Discreet and compassionate service',
      'Bloodborne pathogen certified',
      'ATP testing verification',
      'Insurance and victim compensation assistance',
      '24/7 emergency availability',
    ],
  },
};

// ============================================
// Pillar Page Generator
// ============================================

export interface PillarPageInput {
  city: CityData;
  serviceType: ServiceType;
  suburbsInCity: SuburbWithDistance[];
  contractorData: {
    totalCount: number;
    averageRating: number;
    topCertifications: string[];
    coveragePercentage: number;
  };
  stats: {
    jobsCompleted: number;
    averageResponseMinutes: number;
    satisfactionRate: number;
  };
}

/**
 * Generate a pillar page for a city + service combination
 */
export function generatePillarPage(input: PillarPageInput): PillarPageTemplate {
  const config = SERVICE_CONFIG[input.serviceType];
  const contentTemplate = PILLAR_CONTENT_TEMPLATES[input.serviceType];
  const { city } = input;

  // Build URL slug
  const citySlug = slugify(city.name);
  const slug = `/${citySlug}/${config.slug}`;
  const canonicalUrl = `${DEFAULT_TEMPLATE_CONFIG.baseUrl}${slug}`;

  // Generate title and meta
  const title = `${config.displayName} ${city.name} ${city.state} | ${input.contractorData.totalCount} Contractors | ${DEFAULT_TEMPLATE_CONFIG.siteName}`;
  const metaDescription = `Professional ${config.displayName.toLowerCase()} services across ${city.name} ${city.state}. ${input.contractorData.totalCount} certified contractors. Average ${input.stats.averageResponseMinutes} min response. Get matched online.`;
  const h1 = `${config.displayName} in ${city.name}`;

  // Build breadcrumbs
  const breadcrumbs: Breadcrumb[] = [
    { label: 'Home', href: '/', current: false },
    { label: city.state, href: `/regions/${city.state.toLowerCase()}`, current: false },
    { label: city.name, href: `/${citySlug}`, current: false },
    { label: config.displayName, href: slug, current: true },
  ];

  // Build content with city-specific values
  const cityOverview = contentTemplate.cityOverviewTemplate
    .replace(/{city}/g, city.name)
    .replace(/{suburbCount}/g, input.suburbsInCity.length.toString());

  const serviceOverview = contentTemplate.serviceOverviewTemplate.replace(/{city}/g, city.name);

  const whyChooseUs = contentTemplate.whyChooseUsTemplate.map((item) =>
    item
      .replace(/{city}/g, city.name)
      .replace(/{contractorCount}/g, input.contractorData.totalCount.toString())
      .replace(/{responseTime}/g, input.stats.averageResponseMinutes.toString())
  );

  // Generate suburb links
  const suburbs: SuburbLink[] = input.suburbsInCity.slice(0, 50).map((suburb) => ({
    suburb: suburb.suburb,
    postcode: suburb.postcode,
    href: `/${slugify(suburb.suburb)}/${config.slug}`,
    contractorCount: Math.max(1, Math.floor(input.contractorData.totalCount / input.suburbsInCity.length)),
    distanceFromCityCentre: suburb.distanceKm,
  }));

  // Generate FAQs
  const faqs: FAQ[] = [
    {
      question: `How quickly can you respond to ${config.displayName.toLowerCase()} emergencies in ${city.name}?`,
      answer: `Our ${city.name} ${config.displayName.toLowerCase()} team typically responds within ${input.stats.averageResponseMinutes} minutes. We have ${input.contractorData.totalCount} certified contractors covering ${input.suburbsInCity.length} suburbs across the ${city.name} metro area.`,
    },
    {
      question: `What areas of ${city.name} do you service?`,
      answer: `We provide ${config.displayName.toLowerCase()} services across all ${city.name} suburbs including ${input.suburbsInCity.slice(0, 5).map((s) => s.suburb).join(', ')}, and ${input.suburbsInCity.length - 5} more suburbs.`,
    },
    {
      question: `How much does ${config.displayName.toLowerCase()} cost in ${city.name}?`,
      answer: `${config.displayName} costs vary based on the extent of damage and property size. We provide free assessments and transparent quotes. Most ${city.name} insurance policies cover ${config.displayName.toLowerCase()} - we work directly with your insurer.`,
    },
    {
      question: `Are your ${city.name} contractors certified?`,
      answer: `Yes, all our ${city.name} contractors are qualified with certifications including ${input.contractorData.topCertifications.slice(0, 3).join(', ')}. We maintain strict quality standards across our network.`,
    },
  ];

  // Build process steps
  const processSteps: ProcessStep[] = config.processSteps.map((step) => ({
    ...step,
    description: step.description.replace(/{city}/g, city.name),
  }));

  // Build schema markup
  const schema = buildPillarSchemaMarkup(input, config, canonicalUrl, breadcrumbs, faqs);

  // Build Open Graph data
  const og: OpenGraphData = {
    title,
    description: metaDescription,
    type: 'website',
    url: canonicalUrl,
    image: `${DEFAULT_TEMPLATE_CONFIG.baseUrl}/images/cities/${citySlug}/${config.slug}.jpg`,
    imageAlt: `${config.displayName} services in ${city.name}`,
    siteName: DEFAULT_TEMPLATE_CONFIG.siteName,
    locale: 'en_AU',
  };

  // Build CTAs
  const cta = {
    primary: {
      text: `Get ${city.name} Quote`,
      href: `/quote?city=${citySlug}&service=${input.serviceType}`,
      variant: 'primary' as const,
      icon: '📋',
      tracking: {
        event: 'cta_click',
        category: 'quote',
        label: `${citySlug}_${input.serviceType}`,
      },
    },
    secondary: {
      text: `View ${city.name} Contractors`,
      href: `/contractors?city=${citySlug}&service=${input.serviceType}`,
      variant: 'secondary' as const,
      icon: '👷',
      tracking: {
        event: 'cta_click',
        category: 'contractors',
        label: `${citySlug}_${input.serviceType}`,
      },
    },
  };

  // Related pages
  const relatedPages = buildPillarRelatedPages(city, input.serviceType, config);

  return {
    pageType: 'PILLAR',
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
    location: {
      city: city.name,
      state: city.state,
      population: city.population,
      areaKm2: city.areaKm2,
      coordinates: city.coordinates,
    },
    service: {
      type: input.serviceType,
      displayName: config.displayName,
      description: config.shortDesc,
      icon: config.icon,
    },
    content: {
      heroHeadline: h1,
      heroSubheadline: `${input.contractorData.totalCount} certified contractors across ${input.suburbsInCity.length} suburbs`,
      cityOverview,
      serviceOverview,
      whyChooseUs,
      processSteps,
      faqs,
    },
    suburbs,
    contractors: input.contractorData,
    stats: input.stats,
    cta,
  };
}

// ============================================
// Schema Markup Builders
// ============================================

function buildPillarSchemaMarkup(
  input: PillarPageInput,
  config: (typeof SERVICE_CONFIG)[ServiceType],
  canonicalUrl: string,
  breadcrumbs: Breadcrumb[],
  faqs: FAQ[]
): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildPillarLocalBusinessSchema(input, config, canonicalUrl),
      generatePillarFAQSchema(faqs),
      generatePillarBreadcrumbSchema(breadcrumbs),
    ],
  };
}

function buildPillarLocalBusinessSchema(
  input: PillarPageInput,
  config: (typeof SERVICE_CONFIG)[ServiceType],
  canonicalUrl: string
): LocalBusinessSchema {
  return {
    '@type': 'LocalBusiness',
    '@id': `${canonicalUrl}#business`,
    name: `${config.displayName} ${input.city.name}`,
    description: config.shortDesc,
    url: canonicalUrl,
    telephone: DEFAULT_TEMPLATE_CONFIG.email, // Email contact only (agency model)
    address: {
      '@type': 'PostalAddress',
      addressLocality: input.city.name,
      addressRegion: input.city.state,
      postalCode: '',
      addressCountry: 'AU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: input.city.coordinates.latitude,
      longitude: input.city.coordinates.longitude,
    },
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: input.city.coordinates.latitude,
        longitude: input.city.coordinates.longitude,
      },
      geoRadius: '50km',
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
            reviewCount: input.stats.jobsCompleted,
          }
        : undefined,
  };
}

function generatePillarFAQSchema(faqs: FAQ[]): FAQSchema {
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

function generatePillarBreadcrumbSchema(breadcrumbs: Breadcrumb[]): BreadcrumbSchema {
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
// Related Pages Builder
// ============================================

function buildPillarRelatedPages(
  city: CityData,
  currentService: ServiceType,
  currentConfig: (typeof SERVICE_CONFIG)[ServiceType]
): RelatedPage[] {
  const related: RelatedPage[] = [];
  const citySlug = slugify(city.name);

  // Add other services in same city
  for (const [serviceType, config] of Object.entries(SERVICE_CONFIG)) {
    if (serviceType !== currentService) {
      related.push({
        title: `${config.displayName} in ${city.name}`,
        href: `/${citySlug}/${config.slug}`,
        type: 'SERVICE',
      });
    }
  }

  // Add service page (national level)
  related.push({
    title: `${currentConfig.displayName} Australia`,
    href: `/services/${currentConfig.slug}`,
    type: 'SERVICE',
  });

  // Add region page
  related.push({
    title: `${city.state} Disaster Recovery Services`,
    href: `/regions/${city.state.toLowerCase()}`,
    type: 'LOCATION',
  });

  return related;
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
 * Generate all pillar pages for a city
 */
export function generateAllPillarPagesForCity(
  city: CityData,
  suburbsInCity: SuburbWithDistance[],
  services: ServiceType[],
  contractorData: {
    totalCount: number;
    averageRating: number;
    topCertifications: string[];
    coveragePercentage: number;
  },
  stats: {
    jobsCompleted: number;
    averageResponseMinutes: number;
    satisfactionRate: number;
  }
): PillarPageTemplate[] {
  return services.map((serviceType) =>
    generatePillarPage({
      city,
      serviceType,
      suburbsInCity,
      contractorData,
      stats,
    })
  );
}

/**
 * Get city data by slug
 */
export function getCityBySlug(slug: string): CityData | undefined {
  return MAJOR_CITIES[slug.toLowerCase()];
}

/**
 * Get all city slugs
 */
export function getAllCitySlugs(): string[] {
  return Object.keys(MAJOR_CITIES);
}
