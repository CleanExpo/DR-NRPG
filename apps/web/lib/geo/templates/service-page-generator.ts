/**
 * Service Page Generator
 * Disaster Recovery - NRPG Platform
 *
 * Generates national-level service pages for /services/{service}
 * e.g., /services/water-damage, /services/mould-remediation
 *
 * These are top-level pages that link to all city pillar pages
 */

import {
  ServicePageTemplate,
  ProcessStep,
  FAQ,
  CTAButton,
  Breadcrumb,
  RelatedPage,
  CityLink,
  RelatedService,
  CostGuide,
  ServiceSchema,
  FAQSchema,
  BreadcrumbSchema,
  OrganisationSchema,
  SchemaMarkup,
  OpenGraphData,
  DEFAULT_TEMPLATE_CONFIG,
} from './types';
import { SERVICE_CONFIG } from './landing-page-generator';
import { MAJOR_CITIES, CityData } from './pillar-page-generator';
import { ServiceType, AustralianState } from '../types';

// ============================================
// Service Page Content Configuration
// ============================================

interface ServicePageContent {
  shortDescription: string;
  longDescription: string;
  whatIs: string;
  causes: string[];
  signs: string[];
  prevention: string[];
  costGuide: CostGuide;
  faqs: FAQ[];
}

const SERVICE_PAGE_CONTENT: Record<ServiceType, ServicePageContent> = {
  WATER_DAMAGE: {
    shortDescription: 'Professional water damage restoration services across Australia',
    longDescription:
      'Water damage can strike without warning - from burst pipes and appliance failures to severe storms and flooding. Our national network of qualified water damage restoration specialists provides 24/7 emergency response to minimise damage and restore your property quickly.',
    whatIs:
      'Water damage restoration is the process of removing water, drying structures, and restoring properties affected by water intrusion. This includes water extraction, structural drying, dehumidification, mould prevention, and repairs to return your property to pre-loss condition.',
    causes: [
      'Burst or leaking pipes',
      'Appliance failures (washing machines, dishwashers, hot water systems)',
      'Roof leaks and storm damage',
      'Flash flooding and rising waters',
      'Blocked drains and sewage backups',
      'Foundation cracks and groundwater seepage',
      'HVAC system leaks and condensation',
      'Firefighting water from fire suppression',
    ],
    signs: [
      'Visible water pooling or wet spots',
      'Damp or musty odours',
      'Warped or buckled flooring',
      'Peeling paint or wallpaper',
      'Stained or discoloured walls and ceilings',
      'Increased humidity levels',
      'Visible mould growth',
      'Unexplained increase in water bills',
    ],
    prevention: [
      'Regular plumbing inspections and maintenance',
      'Install water leak detection devices',
      'Maintain gutters and downpipes',
      'Ensure proper drainage around foundations',
      'Inspect appliances and replace aging hoses',
      'Know your main water shut-off location',
      'Insulate pipes in cold areas',
      'Address roof issues promptly',
    ],
    costGuide: {
      lowEstimate: 1500,
      highEstimate: 15000,
      average: 4500,
      factors: [
        'Size of affected area',
        'Category of water (clean, grey, black)',
        'Duration of water exposure',
        'Materials affected (carpet, hardwood, drywall)',
        'Need for content restoration',
        'Mould remediation requirements',
      ],
      disclaimer:
        'Costs vary significantly based on damage extent. Most home insurance policies cover sudden water damage. We provide free assessments and work directly with insurers.',
    },
    faqs: [
      {
        question: 'How quickly do you respond to water damage emergencies?',
        answer:
          'Contractors prioritise rapid response across all service areas. Water damage worsens every hour, so prompt professional attendance is critical to minimise damage and costs.',
      },
      {
        question: 'Is water damage covered by insurance in Australia?',
        answer:
          'Most Australian home insurance policies cover sudden water damage from events like burst pipes or storms. Gradual damage from neglected maintenance may not be covered. We work directly with all major Australian insurers.',
      },
      {
        question: 'How long does water damage restoration take?',
        answer:
          'Typical restoration takes 3-7 days depending on severity. Water extraction takes hours, while structural drying takes 3-5 days. Full restoration including repairs may take 1-2 weeks.',
      },
      {
        question: 'Can I stay in my home during water damage restoration?',
        answer:
          'Minor water damage may allow you to stay with affected areas blocked off. Severe damage or contaminated water (Category 2 or 3) typically requires temporary relocation for safety.',
      },
    ],
  },
  FIRE_DAMAGE: {
    shortDescription: 'Complete fire damage restoration and rebuild services across Australia',
    longDescription:
      'Fire damage is devastating, but professional restoration can save your property and belongings. Our national network of certified fire damage specialists handles everything from emergency board-up to complete rebuilding, with compassionate service during a difficult time.',
    whatIs:
      'Fire damage restoration involves securing the property, removing soot and smoke residue, eliminating odours, and restoring or rebuilding damaged structures. This comprehensive process returns fire-damaged properties to safe, pre-loss condition.',
    causes: [
      'Electrical faults and overloaded circuits',
      'Cooking accidents and unattended stoves',
      'Heating equipment malfunctions',
      'Smoking materials and candles',
      'Faulty appliances',
      'Lightning strikes',
      'Bushfires and ember attacks',
      'Arson and deliberate fires',
    ],
    signs: [
      'Visible fire and burn damage',
      'Soot deposits on surfaces',
      'Smoke odour throughout property',
      'Melted or heat-damaged materials',
      'Water damage from firefighting',
      'Structural instability',
      'Electrical system damage',
      'Discoloured walls and ceilings',
    ],
    prevention: [
      'Install and maintain smoke alarms',
      'Have electrical systems inspected regularly',
      'Never leave cooking unattended',
      'Keep flammable materials away from heat sources',
      'Maintain heating equipment annually',
      'Create a fire escape plan',
      'Clear vegetation around property (ember zones)',
      'Store flammable liquids properly',
    ],
    costGuide: {
      lowEstimate: 5000,
      highEstimate: 150000,
      average: 25000,
      factors: [
        'Extent of fire damage',
        'Smoke and soot penetration',
        'Water damage from firefighting',
        'Structural damage requiring rebuild',
        'Content restoration needs',
        'Specialised cleaning requirements',
      ],
      disclaimer:
        'Fire damage costs vary dramatically based on severity. Australian home insurance typically covers fire damage. We provide detailed assessments and work with your insurer throughout the process.',
    },
    faqs: [
      {
        question: 'What should I do immediately after a house fire?',
        answer:
          'First, ensure everyone is safe and do not re-enter until cleared by fire services. Contact your insurance company, then call a professional fire restoration company for emergency board-up and assessment.',
      },
      {
        question: 'Can smoke odour be completely removed?',
        answer:
          'Yes, professional fire restoration specialists use industrial ozone generators, thermal fogging, and hydroxyl technology to completely eliminate smoke odours, even from porous materials.',
      },
      {
        question: 'How long does fire damage restoration take?',
        answer:
          'Minor fire damage restoration takes 1-2 weeks. Major fire damage with structural rebuilding can take 2-6 months depending on scope and permit requirements.',
      },
      {
        question: 'What items can be saved after a fire?',
        answer:
          'Many items can be professionally restored including furniture, clothing, electronics, documents, and photos. Our specialists assess each item and use appropriate cleaning and restoration techniques.',
      },
    ],
  },
  SMOKE_DAMAGE: {
    shortDescription: 'Expert smoke and soot damage cleanup services across Australia',
    longDescription:
      'Smoke damage can affect your property even without direct fire contact. Smoke particles travel through HVAC systems and penetrate porous materials, leaving odours and residue. Our certified specialists provide thorough cleaning and deodorisation.',
    whatIs:
      'Smoke damage cleanup involves removing soot deposits, cleaning affected surfaces and contents, purifying the air, and eliminating smoke odours. This requires specialised equipment and techniques to ensure complete restoration.',
    causes: [
      'House fires (even distant ones)',
      'Neighbouring property fires',
      'Bushfires and wildfires',
      'Kitchen cooking fires',
      'Electrical fires',
      'Candle and heating equipment',
      'Vehicle fires near buildings',
      'Industrial fires',
    ],
    signs: [
      'Smoke smell throughout property',
      'Visible soot on surfaces',
      'Discoloured walls and ceilings',
      'Residue on furniture and contents',
      'HVAC system blowing smoke particles',
      'Respiratory irritation indoors',
      'Sticky residue on surfaces',
      'Tarnished metals',
    ],
    prevention: [
      'Ensure functioning smoke alarms',
      'Proper kitchen ventilation',
      'Never leave cooking unattended',
      'Maintain heating equipment',
      'Clean chimney flues regularly',
      'Keep bushfire preparedness plan',
      'Seal HVAC during nearby fires',
      'Install air purifiers',
    ],
    costGuide: {
      lowEstimate: 1000,
      highEstimate: 20000,
      average: 5000,
      factors: [
        'Extent of smoke penetration',
        'Type of smoke (wet vs dry)',
        'Size of affected area',
        'Content cleaning requirements',
        'HVAC system cleaning',
        'Odour elimination difficulty',
      ],
      disclaimer:
        'Smoke damage costs depend on penetration extent and materials affected. Insurance typically covers smoke damage from fire. We provide assessments to document damage for claims.',
    },
    faqs: [
      {
        question: 'Can smoke damage occur without a fire in my property?',
        answer:
          'Yes, smoke from neighbouring fires, bushfires, or community fires can infiltrate your property through HVAC systems, gaps, and openings, causing significant damage even kilometres away.',
      },
      {
        question: 'Is smoke damage dangerous to health?',
        answer:
          'Yes, smoke particles and soot contain harmful chemicals and carcinogens. Professional cleanup with HEPA filtration is essential to ensure air quality and protect occupant health.',
      },
      {
        question: 'How do you remove smoke smell from a house?',
        answer:
          'We use a combination of surface cleaning, HEPA air filtration, thermal fogging, ozone treatment, and hydroxyl generators. The approach depends on smoke type and penetration.',
      },
      {
        question: 'Will painting cover smoke damage?',
        answer:
          'Painting without proper cleaning traps smoke residue and odours, which will eventually bleed through. Professional cleaning and sealing primers are essential before repainting.',
      },
    ],
  },
  MOULD_REMEDIATION: {
    shortDescription: 'Safe and effective mould removal services across Australia',
    longDescription:
      "Australia's climate creates ideal conditions for mould growth. Our certified mould remediation specialists safely remove mould, address moisture sources, and implement prevention measures to protect your property and health.",
    whatIs:
      'Mould remediation is the process of identifying, containing, removing, and preventing mould growth in buildings. This includes moisture control, air quality testing, safe removal following industry standards, and preventive treatments.',
    causes: [
      'Water damage and flooding',
      'High humidity levels',
      'Poor ventilation',
      'Roof and plumbing leaks',
      'Condensation on cold surfaces',
      'Rising damp from foundations',
      'Blocked gutters and downpipes',
      'HVAC system issues',
    ],
    signs: [
      'Visible mould growth (any colour)',
      'Musty or earthy odours',
      'Water stains on walls or ceilings',
      'Peeling or bubbling paint',
      'Warped or buckled materials',
      'Allergic reactions indoors',
      'Respiratory issues at home',
      'Condensation on windows',
    ],
    prevention: [
      'Control indoor humidity (30-50%)',
      'Ensure adequate ventilation',
      'Fix leaks promptly',
      'Use exhaust fans in bathrooms/kitchens',
      'Clean and maintain HVAC systems',
      'Improve air circulation',
      'Address water damage within 24-48 hours',
      'Use mould-resistant materials where appropriate',
    ],
    costGuide: {
      lowEstimate: 500,
      highEstimate: 30000,
      average: 3500,
      factors: [
        'Size of affected area',
        'Type and extent of mould growth',
        'Accessibility of affected areas',
        'Materials requiring removal',
        'Air quality testing requirements',
        'Moisture source remediation',
      ],
      disclaimer:
        'Mould remediation costs vary by scope. Some insurance policies cover mould from covered water damage events. We provide detailed assessments and testing documentation.',
    },
    faqs: [
      {
        question: 'Is mould dangerous to health?',
        answer:
          'Yes, mould exposure can cause respiratory issues, allergies, asthma attacks, and other health problems. Some moulds produce mycotoxins that can cause serious illness. Professional remediation is essential.',
      },
      {
        question: 'Can I remove mould myself?',
        answer:
          'Small areas (under 1 square metre) may be cleaned with appropriate precautions. Larger areas, hidden mould, or toxic black mould require professional remediation to ensure safety and complete removal.',
      },
      {
        question: 'Will mould come back after remediation?',
        answer:
          'Professional remediation includes identifying and addressing moisture sources. With proper moisture control and prevention measures, mould should not return. We provide guidance on maintaining a mould-free environment.',
      },
      {
        question: 'How do I know if I have hidden mould?',
        answer:
          'Signs include musty odours, unexplained allergies, and water damage history. Professional inspection includes moisture meters, thermal imaging, and air quality testing to detect hidden mould.',
      },
    ],
  },
  STORM_DAMAGE: {
    shortDescription: 'Emergency storm damage repair and restoration across Australia',
    longDescription:
      'Australian storms can cause devastating damage through wind, hail, flooding, and fallen trees. Our national network provides rapid emergency response to secure properties and complete restoration following severe weather events.',
    whatIs:
      'Storm damage restoration encompasses emergency securing (tarping, board-up), water extraction, debris removal, structural repairs, and full property restoration following weather events including storms, hail, cyclones, and flooding.',
    causes: [
      'Severe thunderstorms',
      'Tropical cyclones',
      'High winds and wind-driven rain',
      'Hailstorms',
      'Flash flooding',
      'Tornadoes',
      'Fallen trees and debris',
      'Lightning strikes',
    ],
    signs: [
      'Roof damage or missing tiles/sheets',
      'Broken windows and doors',
      'Water intrusion and flooding',
      'Fallen trees and debris',
      'Structural damage to walls',
      'Damaged gutters and downpipes',
      'Hail damage to surfaces',
      'Power lines down near property',
    ],
    prevention: [
      'Maintain roof and gutters regularly',
      'Trim overhanging trees',
      'Secure outdoor furniture and items',
      'Install storm shutters in cyclone zones',
      'Reinforce garage doors',
      'Check insurance coverage annually',
      'Create emergency supply kit',
      'Know emergency shelter locations',
    ],
    costGuide: {
      lowEstimate: 2000,
      highEstimate: 100000,
      average: 15000,
      factors: [
        'Type and severity of storm damage',
        'Extent of water intrusion',
        'Roof repair or replacement needs',
        'Structural damage extent',
        'Tree and debris removal',
        'Content damage and restoration',
      ],
      disclaimer:
        'Storm damage costs vary dramatically by event severity. Australian home insurance typically covers storm damage. We document all damage thoroughly for insurance claims.',
    },
    faqs: [
      {
        question: 'What should I do immediately after storm damage?',
        answer:
          'Ensure safety first - avoid downed power lines and structural hazards. Document damage with photos/video, then call for emergency tarping to prevent further water damage. Contact your insurer promptly.',
      },
      {
        question: 'Does insurance cover storm damage in Australia?',
        answer:
          'Most Australian home insurance policies cover storm damage including wind, hail, and storm-related flooding. Some policies have specific flood coverage requirements. Review your policy and contact your insurer.',
      },
      {
        question: 'How quickly can you respond during a major storm event?',
        answer:
          'We deploy emergency crews as soon as safely possible during storm events. During major disasters, we prioritise based on safety and severity. Pre-registering before storm season helps expedite response.',
      },
      {
        question: 'Can you help with insurance claims?',
        answer:
          'Yes, we provide comprehensive documentation including photos, moisture readings, and detailed scope of work to support your insurance claim. We work directly with all major Australian insurers.',
      },
    ],
  },
  SEWAGE_CLEANUP: {
    shortDescription: 'Professional sewage cleanup and sanitisation services across Australia',
    longDescription:
      'Sewage backups and overflows present serious health hazards requiring immediate professional response. Our certified technicians safely remove contamination, sanitise affected areas, and restore properties to safe, habitable condition.',
    whatIs:
      'Sewage cleanup is the process of safely removing sewage and contaminated materials, sanitising affected areas with hospital-grade disinfectants, drying structures, and restoring the property. This Category 3 (black water) work requires specialised equipment and training.',
    causes: [
      'Blocked or damaged sewer lines',
      'Tree root intrusion into pipes',
      'Collapsed sewer pipes',
      'Heavy rainfall overwhelming systems',
      'Septic tank failures',
      'Municipal sewer backups',
      'Toilet overflows',
      'Pump station failures',
    ],
    signs: [
      'Sewage backing up into drains',
      'Foul odours from drains or yard',
      'Multiple slow drains',
      'Gurgling sounds in pipes',
      'Wet spots in yard near sewer line',
      'Sewage pooling in low areas',
      'Toilet backing up when using other drains',
      'Foundation cracks with odour',
    ],
    prevention: [
      'Regular sewer line inspections',
      'Avoid flushing inappropriate items',
      'Install backflow prevention valves',
      'Remove tree roots near sewer lines',
      'Maintain septic systems regularly',
      'Avoid pouring grease down drains',
      'Know your sewer line location',
      'Address slow drains promptly',
    ],
    costGuide: {
      lowEstimate: 2000,
      highEstimate: 25000,
      average: 7500,
      factors: [
        'Size of affected area',
        'Duration of exposure',
        'Materials requiring removal',
        'Extent of contamination spread',
        'Structural drying requirements',
        'Sewer line repair needs',
      ],
      disclaimer:
        'Sewage cleanup is a health hazard requiring professional intervention. Some insurance policies cover sewage backup with appropriate endorsements. We provide documentation for claims.',
    },
    faqs: [
      {
        question: 'Is sewage cleanup covered by insurance?',
        answer:
          'Many policies require a specific sewage backup endorsement. Check your policy for coverage details. Even without coverage, professional cleanup is essential for health and safety.',
      },
      {
        question: 'How dangerous is sewage exposure?',
        answer:
          'Sewage contains harmful bacteria, viruses, parasites, and pathogens that can cause serious illness. Never attempt DIY cleanup. Professional technicians use full PPE and hospital-grade disinfectants.',
      },
      {
        question: 'What should I do during a sewage backup?',
        answer:
          'Stop using water and drains immediately, evacuate the affected area, ventilate if safe, and call for professional cleanup. Do not attempt to clean sewage yourself.',
      },
      {
        question: 'How long does sewage cleanup take?',
        answer:
          'Initial cleanup and sanitisation typically takes 1-3 days. Complete restoration including drying and repairs may take 5-10 days depending on affected materials and extent.',
      },
    ],
  },
  BIOHAZARD_CLEANUP: {
    shortDescription: 'Certified biohazard and trauma scene cleanup across Australia',
    longDescription:
      'Biohazard situations require certified professionals with specialised training and equipment. Our discreet, compassionate teams handle trauma scenes, unattended deaths, crime scenes, and other biohazard scenarios with professionalism and care.',
    whatIs:
      'Biohazard cleanup involves the safe removal and disposal of biological hazards including blood, bodily fluids, and potentially infectious materials. This specialised work requires certification, proper PPE, and strict adherence to health regulations.',
    causes: [
      'Trauma and violent incidents',
      'Unattended deaths',
      'Crime scenes',
      'Suicide cleanup',
      'Infectious disease situations',
      'Hoarding with biohazard materials',
      'Industrial accidents',
      'Vehicle accidents',
    ],
    signs: [
      'Blood or bodily fluid presence',
      'Decomposition materials',
      'Strong persistent odours',
      'Insect activity',
      'Stained surfaces and materials',
      'Potentially infectious materials',
      'Chemical contamination',
      'Sharps and medical waste',
    ],
    prevention: [
      'This type of cleanup typically cannot be prevented',
      'Focus is on proper professional response',
      'Mental health support for vulnerable individuals',
      'Community safety programs',
      'Proper medical waste disposal',
      'Workplace safety protocols',
      'Vehicle and workplace safety',
      'Home safety measures',
    ],
    costGuide: {
      lowEstimate: 1500,
      highEstimate: 35000,
      average: 5000,
      factors: [
        'Type of biohazard situation',
        'Size of affected area',
        'Materials requiring removal',
        'Extent of contamination',
        'Decontamination complexity',
        'Disposal requirements',
      ],
      disclaimer:
        'Biohazard cleanup costs vary by situation complexity. Some insurance policies and victim compensation programs may cover costs. We assist with documentation and claims.',
    },
    faqs: [
      {
        question: 'Is biohazard cleanup covered by insurance?',
        answer:
          'Some homeowners policies cover biohazard cleanup. Crime scene cleanup may be covered by victim compensation programs. We assist with insurance claims and victim compensation applications.',
      },
      {
        question: 'How do you ensure complete decontamination?',
        answer:
          'We use ATP (adenosine triphosphate) testing to scientifically verify all biological contamination has been eliminated. This ensures the space is safe for occupancy.',
      },
      {
        question: 'Is biohazard cleanup discreet?',
        answer:
          'Absolutely. We use unmarked vehicles and maintain complete discretion. Our teams are trained in trauma-informed service delivery and treat all situations with compassion.',
      },
      {
        question: 'Who is responsible for biohazard cleanup?',
        answer:
          'Property owners are typically responsible for cleanup after authorities release a scene. Police do not clean crime scenes. We can respond immediately after scene release.',
      },
    ],
  },
};

// ============================================
// Service Page Generator
// ============================================

export interface ServicePageInput {
  serviceType: ServiceType;
  nationalStats: {
    nationalContractors: number;
    citiesCovered: number;
    jobsCompletedNational: number;
  };
  cityContractorCounts: Record<string, number>;
}

/**
 * Generate a national service page
 */
export function generateServicePage(input: ServicePageInput): ServicePageTemplate {
  const config = SERVICE_CONFIG[input.serviceType];
  const content = SERVICE_PAGE_CONTENT[input.serviceType];

  // Build URL slug
  const slug = `/services/${config.slug}`;
  const canonicalUrl = `${DEFAULT_TEMPLATE_CONFIG.baseUrl}${slug}`;

  // Generate title and meta
  const title = `${config.displayName} Australia | ${input.nationalStats.nationalContractors} Certified Contractors | ${DEFAULT_TEMPLATE_CONFIG.siteName}`;
  const metaDescription = `Professional ${config.displayName.toLowerCase()} services across Australia. ${input.nationalStats.nationalContractors} certified contractors in ${input.nationalStats.citiesCovered} cities. 24/7 emergency response. Get matched online.`;
  const h1 = `${config.displayName} Australia`;

  // Build breadcrumbs
  const breadcrumbs: Breadcrumb[] = [
    { label: 'Home', href: '/', current: false },
    { label: 'Services', href: '/services', current: false },
    { label: config.displayName, href: slug, current: true },
  ];

  // Build city links
  const cities: CityLink[] = Object.entries(MAJOR_CITIES)
    .map(([citySlug, city]) => ({
      city: city.name,
      state: city.state,
      href: `/${citySlug}/${config.slug}`,
      contractorCount: input.cityContractorCounts[citySlug] || 0,
      population: city.population,
    }))
    .filter((city) => city.contractorCount > 0)
    .sort((a, b) => b.contractorCount - a.contractorCount);

  // Build related services
  const relatedServices: RelatedService[] = Object.entries(SERVICE_CONFIG)
    .filter(([type]) => type !== input.serviceType)
    .map(([type, sConfig]) => ({
      type: type as ServiceType,
      displayName: sConfig.displayName,
      href: `/services/${sConfig.slug}`,
      description: sConfig.shortDesc,
    }));

  // Build schema markup
  const schema = buildServiceSchemaMarkup(input, config, content, canonicalUrl, breadcrumbs);

  // Build Open Graph data
  const og: OpenGraphData = {
    title,
    description: metaDescription,
    type: 'website',
    url: canonicalUrl,
    image: `${DEFAULT_TEMPLATE_CONFIG.baseUrl}/images/services/${config.slug}-hero.jpg`,
    imageAlt: `${config.displayName} services across Australia`,
    siteName: DEFAULT_TEMPLATE_CONFIG.siteName,
    locale: 'en_AU',
  };

  // Build CTAs
  const cta = {
    primary: {
      text: 'Get Free Quote',
      href: `/quote?service=${input.serviceType}`,
      variant: 'primary' as const,
      icon: '📋',
      tracking: {
        event: 'cta_click',
        category: 'quote',
        label: `national_${input.serviceType}`,
      },
    },
    findLocal: {
      text: 'Find Local Contractors',
      href: `/contractors?service=${input.serviceType}`,
      variant: 'secondary' as const,
      icon: '📍',
      tracking: {
        event: 'cta_click',
        category: 'find_local',
        label: `national_${input.serviceType}`,
      },
    },
  };

  // Related pages
  const relatedPages: RelatedPage[] = [
    {
      title: 'All Services',
      href: '/services',
      type: 'SERVICE',
    },
    {
      title: 'Find Contractors',
      href: '/contractors',
      type: 'LOCATION',
    },
    {
      title: 'Emergency Help',
      href: '/emergency',
      type: 'GUIDE',
    },
  ];

  return {
    pageType: 'SERVICE',
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
    service: {
      type: input.serviceType,
      displayName: config.displayName,
      shortDescription: content.shortDescription,
      longDescription: content.longDescription,
      icon: config.icon,
      heroImage: `${DEFAULT_TEMPLATE_CONFIG.baseUrl}/images/services/${config.slug}-hero.jpg`,
    },
    content: {
      heroHeadline: h1,
      heroSubheadline: `${input.nationalStats.nationalContractors} certified contractors across ${input.nationalStats.citiesCovered} Australian cities`,
      whatIs: content.whatIs,
      causes: content.causes,
      signs: content.signs,
      process: config.processSteps,
      prevention: content.prevention,
      faqs: content.faqs,
      costGuide: content.costGuide,
    },
    cities,
    stats: input.nationalStats,
    relatedServices,
    cta,
  };
}

// ============================================
// Schema Markup Builders
// ============================================

function buildServiceSchemaMarkup(
  input: ServicePageInput,
  config: (typeof SERVICE_CONFIG)[ServiceType],
  content: ServicePageContent,
  canonicalUrl: string,
  breadcrumbs: Breadcrumb[]
): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildServiceSchema(input, config, content, canonicalUrl),
      generateServiceFAQSchema(content.faqs),
      generateServiceBreadcrumbSchema(breadcrumbs),
      buildOrganisationSchema(),
    ],
  };
}

function buildServiceSchema(
  input: ServicePageInput,
  config: (typeof SERVICE_CONFIG)[ServiceType],
  content: ServicePageContent,
  canonicalUrl: string
): ServiceSchema {
  return {
    '@type': 'Service',
    '@id': `${canonicalUrl}#service`,
    name: config.displayName,
    description: content.longDescription,
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${DEFAULT_TEMPLATE_CONFIG.baseUrl}#organization`,
    },
    areaServed: {
      '@type': 'Place',
      name: 'Australia',
    },
    serviceType: config.displayName,
    offers: {
      '@type': 'Offer',
      priceRange: `$${content.costGuide.lowEstimate} - $${content.costGuide.highEstimate}`,
      priceCurrency: 'AUD',
    },
  };
}

function buildOrganisationSchema(): OrganisationSchema {
  return {
    '@type': 'Organization',
    '@id': `${DEFAULT_TEMPLATE_CONFIG.baseUrl}#organization`,
    name: DEFAULT_TEMPLATE_CONFIG.siteName,
    url: DEFAULT_TEMPLATE_CONFIG.baseUrl,
    logo: `${DEFAULT_TEMPLATE_CONFIG.baseUrl}/images/logo.png`,
    sameAs: [
      'https://www.facebook.com/disasterrecoveryau',
      'https://www.linkedin.com/company/disaster-recovery-australia',
      'https://twitter.com/disasterrecovau',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: DEFAULT_TEMPLATE_CONFIG.email, // Email contact only (agency model)
      contactType: 'customer service',
      areaServed: 'AU',
      availableLanguage: ['English'],
    },
  };
}

function generateServiceFAQSchema(faqs: FAQ[]): FAQSchema {
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

function generateServiceBreadcrumbSchema(breadcrumbs: Breadcrumb[]): BreadcrumbSchema {
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

/**
 * Generate all service pages
 */
export function generateAllServicePages(
  nationalStats: {
    nationalContractors: number;
    citiesCovered: number;
    jobsCompletedNational: number;
  },
  cityContractorCounts: Record<string, Record<ServiceType, number>>
): ServicePageTemplate[] {
  const serviceTypes: ServiceType[] = [
    'WATER_DAMAGE',
    'FIRE_DAMAGE',
    'SMOKE_DAMAGE',
    'MOULD_REMEDIATION',
    'STORM_DAMAGE',
    'SEWAGE_CLEANUP',
    'BIOHAZARD_CLEANUP',
  ];

  return serviceTypes.map((serviceType) => {
    // Aggregate city contractor counts for this service
    const cityContractorCountsForService: Record<string, number> = {};
    for (const [citySlug, serviceCounts] of Object.entries(cityContractorCounts)) {
      cityContractorCountsForService[citySlug] = serviceCounts[serviceType] || 0;
    }

    return generateServicePage({
      serviceType,
      nationalStats,
      cityContractorCounts: cityContractorCountsForService,
    });
  });
}

/**
 * Get service page content for a specific service
 */
export function getServiceContent(serviceType: ServiceType): ServicePageContent {
  return SERVICE_PAGE_CONTENT[serviceType];
}

/**
 * Get all service types
 */
export function getAllServiceTypes(): ServiceType[] {
  return Object.keys(SERVICE_CONFIG) as ServiceType[];
}

/**
 * Get service config by slug
 */
export function getServiceBySlug(slug: string): {
  type: ServiceType;
  config: (typeof SERVICE_CONFIG)[ServiceType];
} | null {
  for (const [type, config] of Object.entries(SERVICE_CONFIG)) {
    if (config.slug === slug) {
      return { type: type as ServiceType, config };
    }
  }
  return null;
}
