// @ts-nocheck

/**
 * Landing Page Generator
 * Disaster Recovery - NRPG Platform
 *
 * Generates SEO-optimised landing pages for /{suburb}/{service}
 * e.g., /wacol/water-damage, /ipswich/mould-remediation
 */

import {
  LandingPageTemplate,
  ProcessStep,
  FAQ,
  CTAButton,
  Breadcrumb,
  RelatedPage,
  LocalBusinessSchema,
  FAQSchema,
  BreadcrumbSchema,
  SchemaMarkup,
  OpenGraphData,
  DEFAULT_TEMPLATE_CONFIG,
  SERVICE_DISPLAY_NAMES,
  SERVICE_SLUGS,
  SERVICE_ICONS,
} from './types';
import { ServiceType, AustralianState, Coordinates, SuburbWithDistance } from '../types';

// ============================================
// Service Display Configuration
// ============================================

export const SERVICE_CONFIG: Record<
  ServiceType,
  {
    displayName: string;
    slug: string;
    icon: string;
    shortDesc: string;
    heroTemplate: string;
    processSteps: ProcessStep[];
    defaultFAQs: FAQ[];
  }
> = {
  WATER_DAMAGE: {
    displayName: 'Water Damage Restoration',
    slug: 'water-damage',
    icon: '💧',
    shortDesc: 'Professional water damage restoration and flood cleanup services',
    heroTemplate: 'Emergency Water Damage Restoration in {suburb}',
    processSteps: [
      {
        stepNumber: 1,
        title: 'Emergency Contact',
        description: 'Call our 24/7 hotline for immediate response',
        icon: '📞',
        duration: '5 mins',
      },
      {
        stepNumber: 2,
        title: 'Rapid Assessment',
        description: 'A qualified technician assesses damage on-site',
        icon: '🔍',
        duration: '30 mins',
      },
      {
        stepNumber: 3,
        title: 'Water Extraction',
        description: 'Industrial pumps remove standing water',
        icon: '💨',
        duration: '2-4 hours',
      },
      {
        stepNumber: 4,
        title: 'Drying & Dehumidification',
        description: 'Professional-grade equipment ensures complete drying',
        icon: '🌡️',
        duration: '3-5 days',
      },
      {
        stepNumber: 5,
        title: 'Restoration',
        description: 'Repair and restore affected areas to pre-loss condition',
        icon: '🏠',
        duration: '1-2 weeks',
      },
    ],
    defaultFAQs: [
      {
        question: 'How quickly can you respond to water damage in {suburb}?',
        answer:
          'Qualified contractors are available 24/7 and prioritise rapid response for emergencies in {suburb}. Aim is to arrive as quickly as possible (typically within 2 hours in metro areas).',
      },
      {
        question: 'Does insurance cover water damage restoration?',
        answer:
          'Most home insurance policies cover sudden water damage from burst pipes or storms. We work directly with all major Australian insurers to streamline your claim.',
      },
      {
        question: 'How long does water damage restoration take?',
        answer:
          'Typical water damage restoration takes 3-7 days depending on severity. Our team provides daily updates and works efficiently to minimise disruption.',
      },
    ],
  },
  FIRE_DAMAGE: {
    displayName: 'Fire Damage Restoration',
    slug: 'fire-damage',
    icon: '🔥',
    shortDesc: 'Complete fire and smoke damage restoration services',
    heroTemplate: 'Professional Fire Damage Restoration in {suburb}',
    processSteps: [
      {
        stepNumber: 1,
        title: 'Emergency Board-Up',
        description: 'Secure property to prevent further damage',
        icon: '🛡️',
        duration: '2-4 hours',
      },
      {
        stepNumber: 2,
        title: 'Damage Assessment',
        description: 'Comprehensive inspection of fire, smoke, and soot damage',
        icon: '📋',
        duration: '1-2 hours',
      },
      {
        stepNumber: 3,
        title: 'Soot & Smoke Removal',
        description: 'Specialist cleaning of all affected surfaces',
        icon: '🧹',
        duration: '2-5 days',
      },
      {
        stepNumber: 4,
        title: 'Odour Elimination',
        description: 'Industrial ozone and thermal fogging treatment',
        icon: '💨',
        duration: '1-3 days',
      },
      {
        stepNumber: 5,
        title: 'Structural Restoration',
        description: 'Rebuild and restore fire-damaged areas',
        icon: '🔨',
        duration: '2-8 weeks',
      },
    ],
    defaultFAQs: [
      {
        question: 'What should I do immediately after a fire in {suburb}?',
        answer:
          'First ensure everyone is safe and contact emergency services. Do not enter the property until cleared. Then call our {suburb} fire restoration team for immediate board-up and assessment.',
      },
      {
        question: 'Can smoke odour be completely removed?',
        answer:
          'Yes, our qualified technicians use industrial ozone generators and thermal fogging to completely eliminate smoke odours from your property.',
      },
      {
        question: 'How long does fire damage restoration take?',
        answer:
          'Minor fire damage may take 1-2 weeks, while major restoration can take 2-3 months. We provide a detailed timeline after our initial assessment.',
      },
    ],
  },
  SMOKE_DAMAGE: {
    displayName: 'Smoke Damage Cleanup',
    slug: 'smoke-damage',
    icon: '🌫️',
    shortDesc: 'Expert smoke and soot damage cleaning services',
    heroTemplate: 'Smoke Damage Cleanup Services in {suburb}',
    processSteps: [
      {
        stepNumber: 1,
        title: 'Assessment',
        description: 'Evaluate extent of smoke and soot penetration',
        icon: '🔍',
        duration: '1-2 hours',
      },
      {
        stepNumber: 2,
        title: 'Ventilation',
        description: 'Air out property and set up air scrubbers',
        icon: '💨',
        duration: '4-8 hours',
      },
      {
        stepNumber: 3,
        title: 'Surface Cleaning',
        description: 'Clean all affected surfaces, walls, and ceilings',
        icon: '🧽',
        duration: '1-3 days',
      },
      {
        stepNumber: 4,
        title: 'Content Cleaning',
        description: 'Clean and restore salvageable belongings',
        icon: '📦',
        duration: '2-5 days',
      },
      {
        stepNumber: 5,
        title: 'Odour Treatment',
        description: 'Final deodorisation treatment',
        icon: '✨',
        duration: '1-2 days',
      },
    ],
    defaultFAQs: [
      {
        question: 'Can smoke damage spread even without visible fire?',
        answer:
          'Yes, smoke particles travel through HVAC systems and can affect areas far from the fire source. Professional assessment ensures all affected areas are identified and treated.',
      },
      {
        question: 'Is smoke damage covered by insurance?',
        answer:
          'Smoke damage from fire is typically covered by home insurance. Our team documents all damage thoroughly to support your insurance claim.',
      },
      {
        question: 'How do you remove smoke smell from furniture?',
        answer:
          'We use specialised cleaning solutions, ozone treatment, and thermal fogging. Severely damaged items may require professional off-site restoration.',
      },
    ],
  },
  MOULD_REMEDIATION: {
    displayName: 'Mould Remediation',
    slug: 'mould-remediation',
    icon: '🦠',
    shortDesc: 'Safe and effective mould removal and prevention services',
    heroTemplate: 'Professional Mould Remediation in {suburb}',
    processSteps: [
      {
        stepNumber: 1,
        title: 'Mould Inspection',
        description: 'Comprehensive inspection including air quality testing',
        icon: '🔬',
        duration: '1-2 hours',
      },
      {
        stepNumber: 2,
        title: 'Containment',
        description: 'Isolate affected areas to prevent spore spread',
        icon: '🚧',
        duration: '2-4 hours',
      },
      {
        stepNumber: 3,
        title: 'Air Filtration',
        description: 'HEPA air scrubbers capture airborne spores',
        icon: '💨',
        duration: 'Continuous',
      },
      {
        stepNumber: 4,
        title: 'Mould Removal',
        description: 'Safe removal of mould-affected materials',
        icon: '🧹',
        duration: '1-3 days',
      },
      {
        stepNumber: 5,
        title: 'Prevention Treatment',
        description: 'Anti-microbial treatment to prevent regrowth',
        icon: '🛡️',
        duration: '1 day',
      },
    ],
    defaultFAQs: [
      {
        question: 'How do I know if I have a mould problem in {suburb}?',
        answer:
          'Signs include musty odours, visible growth, water stains, and allergy symptoms. Our {suburb} team provides professional mould testing and inspection.',
      },
      {
        question: 'Is mould dangerous to health?',
        answer:
          'Yes, mould exposure can cause respiratory issues, allergies, and other health problems. Professional remediation ensures safe and complete removal.',
      },
      {
        question: 'Will mould come back after remediation?',
        answer:
          'Proper remediation includes addressing the moisture source and applying preventive treatments. We also provide guidance on preventing future mould growth.',
      },
    ],
  },
  STORM_DAMAGE: {
    displayName: 'Storm Damage Repair',
    slug: 'storm-damage',
    icon: '⛈️',
    shortDesc: 'Emergency storm damage repair and restoration services',
    heroTemplate: 'Emergency Storm Damage Repair in {suburb}',
    processSteps: [
      {
        stepNumber: 1,
        title: 'Emergency Response',
        description: 'Rapid deployment for tarping and board-up',
        icon: '🚨',
        duration: '1-4 hours',
      },
      {
        stepNumber: 2,
        title: 'Damage Documentation',
        description: 'Thorough documentation for insurance claims',
        icon: '📸',
        duration: '2-4 hours',
      },
      {
        stepNumber: 3,
        title: 'Water Removal',
        description: 'Extract water from storm flooding',
        icon: '💧',
        duration: '4-12 hours',
      },
      {
        stepNumber: 4,
        title: 'Debris Removal',
        description: 'Clear fallen trees and storm debris',
        icon: '🌳',
        duration: '1-3 days',
      },
      {
        stepNumber: 5,
        title: 'Structural Repair',
        description: 'Repair roof, windows, and structural damage',
        icon: '🔨',
        duration: '1-4 weeks',
      },
    ],
    defaultFAQs: [
      {
        question: 'What should I do during a storm emergency in {suburb}?',
        answer:
          'Stay safe indoors, away from windows. After the storm passes, document damage with photos and call our emergency line for immediate assistance.',
      },
      {
        question: 'Does insurance cover storm damage?',
        answer:
          'Most home insurance policies cover storm damage. We work with all major insurers and help document damage for your claim.',
      },
      {
        question: 'How quickly can you respond to storm damage?',
        answer:
          'We deploy emergency crews within hours of a storm. During major events, we prioritise based on safety and severity.',
      },
    ],
  },
  SEWAGE_CLEANUP: {
    displayName: 'Sewage Cleanup',
    slug: 'sewage-cleanup',
    icon: '🚽',
    shortDesc: 'Professional sewage cleanup and sanitisation services',
    heroTemplate: 'Emergency Sewage Cleanup in {suburb}',
    processSteps: [
      {
        stepNumber: 1,
        title: 'Safety Assessment',
        description: 'Evaluate contamination level and safety hazards',
        icon: '⚠️',
        duration: '30 mins',
      },
      {
        stepNumber: 2,
        title: 'Containment',
        description: 'Isolate affected area to prevent spread',
        icon: '🚧',
        duration: '1-2 hours',
      },
      {
        stepNumber: 3,
        title: 'Sewage Extraction',
        description: 'Remove all sewage and contaminated water',
        icon: '💧',
        duration: '2-6 hours',
      },
      {
        stepNumber: 4,
        title: 'Sanitisation',
        description: 'Hospital-grade disinfection of all surfaces',
        icon: '🧴',
        duration: '1-2 days',
      },
      {
        stepNumber: 5,
        title: 'Restoration',
        description: 'Replace damaged materials and restore area',
        icon: '🏠',
        duration: '3-7 days',
      },
    ],
    defaultFAQs: [
      {
        question: 'Is sewage cleanup dangerous?',
        answer:
          'Yes, sewage contains harmful bacteria, viruses, and parasites. Never attempt DIY cleanup. Our technicians use full PPE and hospital-grade disinfectants.',
      },
      {
        question: 'How much does sewage cleanup cost in {suburb}?',
        answer:
          'Costs vary based on affected area size and contamination level. We provide free assessments and work with insurance to minimise out-of-pocket costs.',
      },
      {
        question: 'What causes sewage backups?',
        answer:
          'Common causes include blocked drains, tree root intrusion, damaged pipes, and heavy rainfall overwhelming systems. We can identify the cause and recommend prevention.',
      },
    ],
  },
  BIOHAZARD_CLEANUP: {
    displayName: 'Biohazard Cleanup',
    slug: 'biohazard-cleanup',
    icon: '☣️',
    shortDesc: 'Certified biohazard and trauma scene cleanup services',
    heroTemplate: 'Professional Biohazard Cleanup in {suburb}',
    processSteps: [
      {
        stepNumber: 1,
        title: 'Scene Assessment',
        description: 'Evaluate scope and safety requirements',
        icon: '🔍',
        duration: '1-2 hours',
      },
      {
        stepNumber: 2,
        title: 'PPE & Containment',
        description: 'Full protective equipment and area isolation',
        icon: '🛡️',
        duration: '1-2 hours',
      },
      {
        stepNumber: 3,
        title: 'Biohazard Removal',
        description: 'Safe removal of all biological materials',
        icon: '☣️',
        duration: '2-8 hours',
      },
      {
        stepNumber: 4,
        title: 'Decontamination',
        description: 'Hospital-grade sanitisation and disinfection',
        icon: '🧴',
        duration: '4-12 hours',
      },
      {
        stepNumber: 5,
        title: 'Verification',
        description: 'ATP testing confirms complete decontamination',
        icon: '✅',
        duration: '2-4 hours',
      },
    ],
    defaultFAQs: [
      {
        question: 'What qualifies as biohazard cleanup?',
        answer:
          'Biohazards include blood, bodily fluids, human waste, chemical spills, and infectious materials. Our certified technicians handle trauma scenes, unattended deaths, and hoarding situations.',
      },
      {
        question: 'Is biohazard cleanup covered by insurance?',
        answer:
          'Many policies cover biohazard cleanup, especially for crime scenes and accidents. We work with insurers and can also assist with victim compensation claims.',
      },
      {
        question: 'How do you ensure complete decontamination?',
        answer:
          'We use ATP (adenosine triphosphate) testing to scientifically verify all biological contamination has been eliminated, ensuring the space is safe for occupancy.',
      },
    ],
  },
};

// ============================================
// Landing Page Generator
// ============================================

export interface LandingPageInput {
  suburb: SuburbWithDistance;
  serviceType: ServiceType;
  region: string;
  contractorCount: number;
  averageRating: number;
  averageResponseMinutes: number;
  certifications: string[];
}

/**
 * Generate a complete landing page template for a suburb + service
 */
export function generateLandingPage(input: LandingPageInput): LandingPageTemplate {
  const config = SERVICE_CONFIG[input.serviceType];
  const { suburb } = input;

  // Build URL slug
  const slug = `/${slugify(suburb.suburb)}/${config.slug}`;
  const canonicalUrl = `${DEFAULT_TEMPLATE_CONFIG.baseUrl}${slug}`;

  // Generate title and meta
  const title = `${config.displayName} ${suburb.suburb} ${suburb.state} | ${DEFAULT_TEMPLATE_CONFIG.siteName}`;
  const metaDescription = `${config.shortDesc} in ${suburb.suburb}, ${suburb.state}. ${input.contractorCount} certified contractors. Average ${input.averageResponseMinutes} min response. Get matched online.`;
  const h1 = config.heroTemplate.replace(/{suburb}/g, suburb.suburb);

  // Build breadcrumbs
  const breadcrumbs: Breadcrumb[] = [
    { label: 'Home', href: '/', current: false },
    { label: suburb.state, href: `/regions/${suburb.state.toLowerCase()}`, current: false },
    { label: suburb.suburb, href: `/${slugify(suburb.suburb)}`, current: false },
    { label: config.displayName, href: slug, current: true },
  ];

  // Personalise FAQs with suburb name
  const faqs = config.defaultFAQs.map((faq) => ({
    ...faq,
    question: faq.question.replace(/{suburb}/g, suburb.suburb),
    answer: faq.answer.replace(/{suburb}/g, suburb.suburb),
  }));

  // Build schema markup
  const schema = buildSchemaMarkup(input, config, canonicalUrl, breadcrumbs, faqs);

  // Build Open Graph data
  const og: OpenGraphData = {
    title,
    description: metaDescription,
    type: 'website',
    url: canonicalUrl,
    image: `${DEFAULT_TEMPLATE_CONFIG.baseUrl}/images/services/${config.slug}.jpg`,
    imageAlt: `${config.displayName} in ${suburb.suburb}`,
    siteName: DEFAULT_TEMPLATE_CONFIG.siteName,
    locale: 'en_AU',
  };

  // Build CTAs
  const cta = {
    primary: {
      text: 'Get Free Quote',
      href: `/quote?suburb=${suburb.postcode}&service=${input.serviceType}`,
      variant: 'primary' as const,
      icon: '📋',
      tracking: {
        event: 'cta_click',
        category: 'quote',
        label: `${suburb.postcode}_${input.serviceType}`,
      },
    },
    secondary: {
      text: `View ${suburb.suburb} Contractors`,
      href: `/contractors?suburb=${suburb.postcode}&service=${input.serviceType}`,
      variant: 'secondary' as const,
      icon: '👷',
      tracking: {
        event: 'cta_click',
        category: 'contractors',
        label: `${suburb.postcode}_${input.serviceType}`,
      },
    },
    emergency: {
      text: 'Report Emergency Now',
      href: `/report-claim?urgent=true&suburb=${suburb.postcode}&service=${input.serviceType}`,
      variant: 'emergency' as const,
      icon: '🚨',
      tracking: {
        event: 'cta_click',
        category: 'emergency',
        label: `${suburb.postcode}_${input.serviceType}`,
      },
    },
  };

  // Related pages
  const relatedPages = buildRelatedPages(suburb, input.serviceType, config);

  return {
    pageType: 'LANDING',
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
      suburb: suburb.suburb,
      postcode: suburb.postcode,
      state: suburb.state,
      region: input.region,
      coordinates: suburb.coordinates,
    },
    service: {
      type: input.serviceType,
      displayName: config.displayName,
      description: config.shortDesc,
      icon: config.icon,
    },
    content: {
      heroHeadline: h1,
      heroSubheadline: `${input.contractorCount} certified contractors ready to help`,
      serviceDescription: config.shortDesc,
      localExpertise: `Our ${suburb.suburb} ${config.displayName.toLowerCase()} specialists understand the unique challenges faced by local properties. With ${input.contractorCount} certified contractors in your area, help is always nearby.`,
      emergencyMessage: DEFAULT_TEMPLATE_CONFIG.emergencyMessage,
      processSteps: config.processSteps,
      faqs,
      testimonials: [], // Populated from database
    },
    contractors: {
      count: input.contractorCount,
      averageRating: input.averageRating,
      averageResponseMinutes: input.averageResponseMinutes,
      certifications: input.certifications,
    },
    cta,
  };
}

// ============================================
// Schema Markup Builders
// ============================================

function buildSchemaMarkup(
  input: LandingPageInput,
  config: (typeof SERVICE_CONFIG)[ServiceType],
  canonicalUrl: string,
  breadcrumbs: Breadcrumb[],
  faqs: FAQ[]
): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildLocalBusinessSchema(input, config, canonicalUrl),
      generateFAQSchema(faqs),
      generateBreadcrumbSchema(breadcrumbs),
    ],
  };
}

function buildLocalBusinessSchema(
  input: LandingPageInput,
  config: (typeof SERVICE_CONFIG)[ServiceType],
  canonicalUrl: string
): LocalBusinessSchema {
  return {
    '@type': 'LocalBusiness',
    '@id': `${canonicalUrl}#business`,
    name: `${config.displayName} ${input.suburb.suburb}`,
    description: config.shortDesc,
    url: canonicalUrl,
    telephone: DEFAULT_TEMPLATE_CONFIG.email, // Email contact only (agency model)
    address: {
      '@type': 'PostalAddress',
      addressLocality: input.suburb.suburb,
      addressRegion: input.suburb.state,
      postalCode: input.suburb.postcode,
      addressCountry: 'AU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: input.suburb.coordinates.latitude,
      longitude: input.suburb.coordinates.longitude,
    },
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: input.suburb.coordinates.latitude,
        longitude: input.suburb.coordinates.longitude,
      },
      geoRadius: '25km',
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
      input.averageRating > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: input.averageRating,
            reviewCount: input.contractorCount * 10, // Estimate
          }
        : undefined,
  };
}

/**
 * Generate FAQ schema markup
 */
export function generateFAQSchema(faqs: FAQ[]): FAQSchema {
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

/**
 * Generate breadcrumb schema markup
 */
export function generateBreadcrumbSchema(breadcrumbs: Breadcrumb[]): BreadcrumbSchema {
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

function buildRelatedPages(
  suburb: SuburbWithDistance,
  currentService: ServiceType,
  currentConfig: (typeof SERVICE_CONFIG)[ServiceType]
): RelatedPage[] {
  const related: RelatedPage[] = [];

  // Add other services in same suburb
  for (const [serviceType, config] of Object.entries(SERVICE_CONFIG)) {
    if (serviceType !== currentService) {
      related.push({
        title: `${config.displayName} in ${suburb.suburb}`,
        href: `/${slugify(suburb.suburb)}/${config.slug}`,
        type: 'SERVICE',
      });
    }
  }

  // Add pillar page (city level)
  related.push({
    title: `${currentConfig.displayName} in ${suburb.state}`,
    href: `/${suburb.state.toLowerCase()}/${currentConfig.slug}`,
    type: 'PILLAR',
  });

  // Add service page (national level)
  related.push({
    title: `${currentConfig.displayName} Australia`,
    href: `/services/${currentConfig.slug}`,
    type: 'SERVICE',
  });

  return related;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Convert string to URL-safe slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate landing pages for all services in a suburb
 */
export function generateAllLandingPagesForSuburb(
  suburb: SuburbWithDistance,
  region: string,
  services: ServiceType[],
  contractorData: {
    count: number;
    averageRating: number;
    averageResponseMinutes: number;
    certifications: string[];
  }
): LandingPageTemplate[] {
  return services.map((serviceType) =>
    generateLandingPage({
      suburb,
      serviceType,
      region,
      ...contractorData,
    })
  );
}
