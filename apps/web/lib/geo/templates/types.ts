/**
 * SEO/GEO Page Template Types
 * Disaster Recovery - NRPG Platform
 *
 * Template types for dynamically generated location pages:
 * - Landing Pages: /{suburb}/{service}
 * - Pillar Pages: /{city}/{service} (aggregates suburbs)
 * - Service Pages: /services/{service}
 * - Region Pages: /regions/{region}
 */

import { SITE_URL } from '@/lib/seo/site-url';
import { AustralianState, ServiceType, Coordinates } from '../types';

// ============================================
// Base Page Types
// ============================================

export interface BaseSEOPage {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  canonicalUrl: string;
  lastModified: Date;

  // Schema.org markup
  schema: SchemaMarkup;

  // Open Graph
  og: OpenGraphData;

  // Internal linking
  breadcrumbs: Breadcrumb[];
  relatedPages: RelatedPage[];
}

export interface Breadcrumb {
  label: string;
  href: string;
  current: boolean;
}

export interface RelatedPage {
  title: string;
  href: string;
  type: 'SERVICE' | 'LOCATION' | 'PILLAR' | 'GUIDE';
}

// ============================================
// Landing Page Template
// ============================================

/**
 * Landing Page: /{suburb}/{service}
 * e.g., /wacol/water-damage
 *
 * Most granular level - specific suburb + specific service
 */
export interface LandingPageTemplate extends BaseSEOPage {
  pageType: 'LANDING';

  // Location data
  location: {
    suburb: string;
    postcode: string;
    state: AustralianState;
    region: string;
    coordinates: Coordinates;
  };

  // Service data
  service: {
    type: ServiceType;
    displayName: string;
    description: string;
    icon: string;
  };

  // Content sections
  content: {
    heroHeadline: string;
    heroSubheadline: string;
    serviceDescription: string;
    localExpertise: string;
    emergencyMessage: string;
    processSteps: ProcessStep[];
    faqs: FAQ[];
    testimonials: Testimonial[];
  };

  // Contractor data (anonymised)
  contractors: {
    count: number;
    averageRating: number;
    averageResponseMinutes: number;
    certifications: string[];
  };

  // CTA
  cta: {
    primary: CTAButton;
    secondary: CTAButton;
    emergency: CTAButton;
  };
}

// ============================================
// Pillar Page Template
// ============================================

/**
 * Pillar Page: /{city}/{service}
 * e.g., /brisbane/water-damage
 *
 * Aggregates all suburb landing pages for a city + service
 */
export interface PillarPageTemplate extends BaseSEOPage {
  pageType: 'PILLAR';

  // City/Region data
  location: {
    city: string;
    state: AustralianState;
    population: number;
    areaKm2: number;
    coordinates: Coordinates;
  };

  // Service data
  service: {
    type: ServiceType;
    displayName: string;
    description: string;
    icon: string;
  };

  // Content sections
  content: {
    heroHeadline: string;
    heroSubheadline: string;
    cityOverview: string;
    serviceOverview: string;
    whyChooseUs: string[];
    processSteps: ProcessStep[];
    faqs: FAQ[];
  };

  // Suburb links (internal linking)
  suburbs: SuburbLink[];

  // Aggregated contractor data
  contractors: {
    totalCount: number;
    averageRating: number;
    topCertifications: string[];
    coveragePercentage: number;
  };

  // Statistics
  stats: {
    jobsCompleted: number;
    averageResponseMinutes: number;
    satisfactionRate: number;
  };

  // CTA
  cta: {
    primary: CTAButton;
    secondary: CTAButton;
  };
}

export interface SuburbLink {
  suburb: string;
  postcode: string;
  href: string;
  contractorCount: number;
  distanceFromCityCentre: number;
}

// ============================================
// Service Page Template
// ============================================

/**
 * Service Page: /services/{service}
 * e.g., /services/water-damage
 *
 * National-level service overview, links to all cities
 */
export interface ServicePageTemplate extends BaseSEOPage {
  pageType: 'SERVICE';

  // Service data
  service: {
    type: ServiceType;
    displayName: string;
    shortDescription: string;
    longDescription: string;
    icon: string;
    heroImage: string;
  };

  // Content sections
  content: {
    heroHeadline: string;
    heroSubheadline: string;
    whatIs: string;
    causes: string[];
    signs: string[];
    process: ProcessStep[];
    prevention: string[];
    faqs: FAQ[];
    costGuide: CostGuide;
  };

  // City links
  cities: CityLink[];

  // National statistics
  stats: {
    nationalContractors: number;
    citiesCovered: number;
    jobsCompletedNational: number;
  };

  // Related services
  relatedServices: RelatedService[];

  // CTA
  cta: {
    primary: CTAButton;
    findLocal: CTAButton;
  };
}

export interface CityLink {
  city: string;
  state: AustralianState;
  href: string;
  contractorCount: number;
  population: number;
}

export interface RelatedService {
  type: ServiceType;
  displayName: string;
  href: string;
  description: string;
}

export interface CostGuide {
  lowEstimate: number;
  highEstimate: number;
  average: number;
  factors: string[];
  disclaimer: string;
}

// ============================================
// Region Page Template
// ============================================

/**
 * Region Page: /regions/{region}
 * e.g., /regions/sunshine-coast
 *
 * Overview of a region with all services available
 */
export interface RegionPageTemplate extends BaseSEOPage {
  pageType: 'REGION';

  // Region data
  region: {
    name: string;
    state: AustralianState;
    population: number;
    areaKm2: number;
    majorSuburbs: string[];
    coordinates: Coordinates;
  };

  // Content sections
  content: {
    heroHeadline: string;
    heroSubheadline: string;
    regionOverview: string;
    disasterRisks: DisasterRisk[];
    faqs: FAQ[];
  };

  // Services available in region
  services: ServiceAvailability[];

  // Suburb directory
  suburbs: SuburbDirectory[];

  // Contractor coverage
  contractors: {
    totalCount: number;
    averageRating: number;
    servicesOffered: ServiceType[];
  };

  // CTA
  cta: {
    primary: CTAButton;
    emergency: CTAButton;
  };
}

export interface DisasterRisk {
  type: 'FLOOD' | 'BUSHFIRE' | 'STORM' | 'CYCLONE';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  seasonalPeak: string;
  description: string;
}

export interface ServiceAvailability {
  type: ServiceType;
  displayName: string;
  href: string;
  contractorCount: number;
  available: boolean;
}

export interface SuburbDirectory {
  suburb: string;
  postcode: string;
  href: string;
  population: number;
}

// ============================================
// Shared Content Types
// ============================================

export interface ProcessStep {
  stepNumber: number;
  title: string;
  description: string;
  icon?: string;
  duration?: string;
}

export interface FAQ {
  question: string;
  answer: string;
  category?: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  location: string;
  rating: number;
  service: ServiceType;
  date: string;
  verified: boolean;
}

export interface CTAButton {
  text: string;
  href: string;
  variant: 'primary' | 'secondary' | 'emergency';
  icon?: string;
  tracking?: {
    event: string;
    category: string;
    label: string;
  };
}

// ============================================
// Schema.org Markup Types
// ============================================

export interface SchemaMarkup {
  '@context': 'https://schema.org';
  '@graph': SchemaEntity[];
}

export type SchemaEntity =
  | LocalBusinessSchema
  | ServiceSchema
  | FAQSchema
  | BreadcrumbSchema
  | OrganisationSchema;

export interface LocalBusinessSchema {
  '@type': 'LocalBusiness';
  '@id': string;
  name: string;
  description: string;
  url: string;
  telephone: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: 'AU';
  };
  geo: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  areaServed: {
    '@type': 'GeoCircle';
    geoMidpoint: {
      '@type': 'GeoCoordinates';
      latitude: number;
      longitude: number;
    };
    geoRadius: string;
  };
  priceRange: string;
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification';
    dayOfWeek: string[];
    opens: string;
    closes: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
}

export interface ServiceSchema {
  '@type': 'Service';
  '@id': string;
  name: string;
  description: string;
  provider: {
    '@type': 'LocalBusiness';
    '@id': string;
  };
  areaServed: {
    '@type': 'Place';
    name: string;
  };
  serviceType: string;
  offers?: {
    '@type': 'Offer';
    priceRange: string;
    priceCurrency: 'AUD';
  };
}

export interface FAQSchema {
  '@type': 'FAQPage';
  mainEntity: {
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }[];
}

export interface BreadcrumbSchema {
  '@type': 'BreadcrumbList';
  itemListElement: {
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }[];
}

export interface OrganisationSchema {
  '@type': 'Organization';
  '@id': string;
  name: string;
  url: string;
  logo: string;
  sameAs: string[];
  contactPoint: {
    '@type': 'ContactPoint';
    telephone: string;
    contactType: string;
    areaServed: string;
    availableLanguage: string[];
  };
}

// ============================================
// Open Graph Data
// ============================================

export interface OpenGraphData {
  title: string;
  description: string;
  type: 'website' | 'article' | 'place';
  url: string;
  image: string;
  imageAlt: string;
  siteName: string;
  locale: 'en_AU';
}

// ============================================
// Template Configuration
// ============================================

export interface TemplateConfig {
  baseUrl: string;
  siteName: string;
  phone: string | null; // IMPORTANT: null for agency model (no phone)
  email: string;
  defaultImage: string;
  brandColour: string;
  emergencyMessage: string;
  agencyDisclaimer: string;
  ctaText: {
    primary: string;
    secondary: string;
    emergency: string;
  };
}

/**
 * Default Template Configuration
 *
 * IMPORTANT: Disaster Recovery is a MARKETING AGENCY, not a service provider.
 * - NO phone number (email/online only)
 * - Contractors are the direct point of contact
 * - Clients contact contractors AFTER match is accepted
 */
export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  baseUrl: SITE_URL,
  siteName: 'Disaster Recovery Australia',
  phone: null, // No phone - agency model uses online forms
  email: 'support@disasterrecovery.com.au',
  defaultImage: '/images/og-default.jpg',
  brandColour: '#00BFA6',
  emergencyMessage: 'Report your emergency online - contractors notified instantly',
  agencyDisclaimer:
    'Disaster Recovery Australia is a marketing platform connecting clients with independent contractors. All services are provided directly by the contractor.',
  ctaText: {
    primary: 'Get Matched Now',
    secondary: 'Find Local Contractors',
    emergency: 'Report Emergency',
  },
};

// ============================================
// Service Display Names
// ============================================

export const SERVICE_DISPLAY_NAMES: Record<ServiceType, string> = {
  WATER_DAMAGE: 'Water Damage Restoration',
  FIRE_DAMAGE: 'Fire Damage Restoration',
  SMOKE_DAMAGE: 'Smoke Damage Cleanup',
  MOULD_REMEDIATION: 'Mould Remediation',
  STORM_DAMAGE: 'Storm Damage Repair',
  SEWAGE_CLEANUP: 'Sewage Cleanup',
  BIOHAZARD_CLEANUP: 'Biohazard Cleanup',
};

export const SERVICE_SLUGS: Record<ServiceType, string> = {
  WATER_DAMAGE: 'water-damage',
  FIRE_DAMAGE: 'fire-damage',
  SMOKE_DAMAGE: 'smoke-damage',
  MOULD_REMEDIATION: 'mould-remediation',
  STORM_DAMAGE: 'storm-damage',
  SEWAGE_CLEANUP: 'sewage-cleanup',
  BIOHAZARD_CLEANUP: 'biohazard-cleanup',
};

export const SERVICE_ICONS: Record<ServiceType, string> = {
  WATER_DAMAGE: '💧',
  FIRE_DAMAGE: '🔥',
  SMOKE_DAMAGE: '💨',
  MOULD_REMEDIATION: '🦠',
  STORM_DAMAGE: '⛈️',
  SEWAGE_CLEANUP: '🚽',
  BIOHAZARD_CLEANUP: '☣️',
};

// ============================================
// Page Type Union
// ============================================

export type SEOPageTemplate =
  | LandingPageTemplate
  | PillarPageTemplate
  | ServicePageTemplate
  | RegionPageTemplate;

export type PageType = 'LANDING' | 'PILLAR' | 'SERVICE' | 'REGION';
