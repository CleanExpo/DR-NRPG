/**
 * Resource Hub Data
 *
 * Sample data and category configurations for the resources hub.
 * In production, this will be replaced with CMS integration.
 */

import { Resource, ResourceCategory, DisasterCategory, ProcessResource, CaseStudyResource } from './types';

/**
 * Category Configurations
 */
export const RESOURCE_CATEGORIES: Record<DisasterCategory, ResourceCategory> = {
  'water-damage': {
    id: 'water-damage',
    name: 'Water Damage',
    description: 'Comprehensive guides on water damage restoration, mitigation, and prevention',
    icon: 'Droplet',
    color: 'blue',
    gradient: 'from-blue-600 to-blue-800',
  },
  'fire-damage': {
    id: 'fire-damage',
    name: 'Fire & Smoke Damage',
    description: 'Expert resources on fire damage restoration and smoke odor removal',
    icon: 'Flame',
    color: 'orange',
    gradient: 'from-orange-600 to-red-700',
  },
  'mold-remediation': {
    id: 'mold-remediation',
    name: 'Mold Remediation',
    description: 'Professional mold remediation protocols and prevention strategies',
    icon: 'Biohazard',
    color: 'green',
    gradient: 'from-green-600 to-emerald-700',
  },
  'storm-damage': {
    id: 'storm-damage',
    name: 'Storm Damage',
    description: 'Storm damage assessment, repair, and emergency response guides',
    icon: 'Cloud',
    color: 'gray',
    gradient: 'from-gray-600 to-slate-700',
  },
  'sewage-cleanup': {
    id: 'sewage-cleanup',
    name: 'Sewage Cleanup',
    description: 'Biohazard sewage cleanup and sanitization protocols',
    icon: 'AlertTriangle',
    color: 'yellow',
    gradient: 'from-yellow-600 to-amber-700',
  },
  'biohazard-cleanup': {
    id: 'biohazard-cleanup',
    name: 'Biohazard Cleanup',
    description: 'Specialized biohazard and trauma cleanup procedures',
    icon: 'Shield',
    color: 'red',
    gradient: 'from-red-600 to-rose-700',
  },
};

/**
 * Sample Resources
 * These would be fetched from CMS in production
 */
export const SAMPLE_RESOURCES: Resource[] = [
  {
    id: '1',
    slug: 'ultimate-water-damage-restoration-guide',
    title: 'The Ultimate Water Damage Restoration Guide',
    description: 'Complete step-by-step guide to professional water damage restoration following industry standards',
    excerpt: 'Learn the complete water damage restoration process from initial assessment to final verification.',
    category: 'water-damage',
    contentType: 'guide',
    author: {
      id: 'john-smith',
      name: 'John Smith',
      title: 'IICRC Master Water Restorer',
      credentials: ['Water Restoration Technician (WRT)', 'Applied Microbial Remediation Technician (AMRT)'],
      avatarUrl: '/images/authors/john-smith.jpg',
    },
    publishedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    readingTime: 15,
    difficulty: 'intermediate',
    tags: ['industry standards', 'water extraction', 'drying', 'moisture detection'],
    thumbnailUrl: '/images/resources/water-damage-guide.jpg',
    featuredImageUrl: '/images/resources/water-damage-guide-featured.jpg',
    downloadable: true,
    downloadUrl: '/downloads/water-damage-restoration-guide.pdf',
    downloadFormat: 'pdf',
    featured: true,
    viewCount: 4523,
  },
  {
    id: '2',
    slug: 'mold-remediation-checklist',
    title: 'Professional Mold Remediation Checklist',
    description: 'Checklist compliant with industry standards for complete mold remediation projects',
    excerpt: 'Ensure every mold remediation project follows proper protocols with this comprehensive checklist.',
    category: 'mold-remediation',
    contentType: 'checklist',
    author: {
      id: 'sarah-johnson',
      name: 'Dr. Sarah Johnson',
      title: 'Certified Mold Remediation Specialist',
      credentials: ['Applied Microbial Remediation Technician (AMRT)', 'CMR', 'Ph.D. Mycology'],
      avatarUrl: '/images/authors/sarah-johnson.jpg',
    },
    publishedAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    readingTime: 5,
    difficulty: 'beginner',
    tags: ['industry standards', 'mold', 'checklist', 'protocol'],
    thumbnailUrl: '/images/resources/mold-checklist.jpg',
    downloadable: true,
    downloadUrl: '/downloads/mold-remediation-checklist.pdf',
    downloadFormat: 'pdf',
    trending: true,
    viewCount: 3241,
  },
  {
    id: '3',
    slug: 'fire-damage-restoration-process',
    title: 'Fire Damage Restoration: A Complete Process Guide',
    description: 'Understanding the fire and smoke damage restoration process from emergency board-up to final restoration',
    excerpt: 'Navigate the complex fire restoration process with confidence using this comprehensive guide.',
    category: 'fire-damage',
    contentType: 'article',
    author: {
      id: 'mike-anderson',
      name: 'Mike Anderson',
      title: 'Fire Restoration Specialist',
      credentials: ['Fire and Smoke Restoration Technician (FSRT)', 'Odour Control Technician (OCT)'],
      avatarUrl: '/images/authors/mike-anderson.jpg',
    },
    publishedAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    readingTime: 12,
    difficulty: 'intermediate',
    tags: ['fire damage', 'smoke damage', 'restoration', 'IICRC'],
    thumbnailUrl: '/images/resources/fire-damage-process.jpg',
    videoUrl: 'https://youtube.com/watch?v=example',
    featured: true,
    viewCount: 2876,
  },
  {
    id: '4',
    slug: 'storm-damage-emergency-response',
    title: 'Storm Damage Emergency Response Protocol',
    description: '24/7 emergency response procedures for storm damage incidents',
    excerpt: 'Be prepared for storm emergencies with this professional response protocol.',
    category: 'storm-damage',
    contentType: 'guide',
    author: {
      id: 'john-smith',
      name: 'John Smith',
      title: 'IICRC Master Water Restorer',
      credentials: ['Water Restoration Technician (WRT)', 'Applied Microbial Remediation Technician (AMRT)'],
      avatarUrl: '/images/authors/john-smith.jpg',
    },
    publishedAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
    readingTime: 8,
    difficulty: 'beginner',
    tags: ['storm damage', 'emergency', 'response', 'protocol'],
    thumbnailUrl: '/images/resources/storm-emergency.jpg',
    downloadable: true,
    downloadUrl: '/downloads/storm-emergency-protocol.pdf',
    downloadFormat: 'pdf',
    viewCount: 1923,
  },
  {
    id: '5',
    slug: 'sewage-cleanup-safety-guide',
    title: 'Sewage Cleanup Safety: Protecting Your Team',
    description: 'Essential safety protocols for Category 3 water (sewage) cleanup operations',
    excerpt: 'Keep your team safe during sewage cleanup with proper PPE and decontamination procedures.',
    category: 'sewage-cleanup',
    contentType: 'article',
    author: {
      id: 'sarah-johnson',
      name: 'Dr. Sarah Johnson',
      title: 'Certified Mold Remediation Specialist',
      credentials: ['Applied Microbial Remediation Technician (AMRT)', 'CMR', 'Ph.D. Mycology'],
      avatarUrl: '/images/authors/sarah-johnson.jpg',
    },
    publishedAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    readingTime: 10,
    difficulty: 'intermediate',
    tags: ['sewage', 'safety', 'PPE', 'category 3 water'],
    thumbnailUrl: '/images/resources/sewage-safety.jpg',
    trending: true,
    viewCount: 2134,
  },
];

/**
 * Sample Process Resource (with Timeline)
 */
export const SAMPLE_PROCESS_RESOURCE: ProcessResource = {
  id: 'process-1',
  slug: 'water-damage-restoration-process',
  title: 'Water Damage Restoration Process: Step-by-Step',
  description: 'Follow the complete water damage restoration process, compliant with industry standards',
  excerpt: 'Professional water damage restoration in 7 proven steps.',
  category: 'water-damage',
  contentType: 'guide',
  author: {
    id: 'john-smith',
    name: 'John Smith',
    title: 'IICRC Master Water Restorer',
    credentials: ['Water Restoration Technician (WRT)', 'Applied Microbial Remediation Technician (AMRT)'],
  },
  publishedAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  readingTime: 20,
  difficulty: 'intermediate',
  tags: ['industry standards', 'process', 'restoration'],
  steps: [
    {
      id: 'step-1',
      number: 1,
      title: 'Emergency Contact & Response',
      description: 'Immediate response within 1 hour of call',
      details: [
        'Answer emergency hotline 24/7',
        'Dispatch technician with priority response',
        'Provide initial phone guidance to minimize damage',
      ],
      estimatedTime: '1-2 hours',
      requiredTools: ['Emergency response kit', 'PPE'],
    },
    {
      id: 'step-2',
      number: 2,
      title: 'Inspection & Assessment',
      description: 'Comprehensive property assessment and moisture detection',
      details: [
        'Identify water source and category',
        'Determine extraction and drying class',
        'Document damage with photos and moisture readings',
        'Create comprehensive scope of work',
      ],
      estimatedTime: '2-4 hours',
      requiredTools: ['Moisture meters', 'Thermal imaging camera', 'Documentation forms'],
    },
    {
      id: 'step-3',
      number: 3,
      title: 'Water Extraction',
      description: 'Remove standing water using professional extraction equipment',
      details: [
        'Extract water with truck-mounted or portable extractors',
        'Remove wet contents and materials',
        'Begin preliminary cleaning',
      ],
      estimatedTime: '2-8 hours',
      requiredTools: ['Extractors', 'Pumps', 'Wet vacuums'],
    },
    {
      id: 'step-4',
      number: 4,
      title: 'Drying & Dehumidification',
      description: 'Strategic placement of air movers and dehumidifiers',
      details: [
        'Place air movers for optimal airflow',
        'Install industrial dehumidifiers',
        'Monitor daily moisture readings',
        'Adjust equipment as needed',
      ],
      estimatedTime: '3-7 days',
      requiredTools: ['Air movers', 'Dehumidifiers', 'Moisture meters'],
    },
    {
      id: 'step-5',
      number: 5,
      title: 'Cleaning & Sanitizing',
      description: 'Deep cleaning and antimicrobial treatment',
      details: [
        'Clean all affected surfaces',
        'Apply antimicrobial treatments',
        'Sanitize salvageable contents',
        'Deodorize if necessary',
      ],
      estimatedTime: '1-3 days',
      requiredTools: ['Cleaning solutions', 'Antimicrobials', 'Foggers'],
    },
    {
      id: 'step-6',
      number: 6,
      title: 'Final Verification',
      description: 'Verify complete drying and document restoration',
      details: [
        'Final moisture readings at or below normal levels',
        'Photo documentation of dried areas',
        'Certificate of completion',
        'Customer walkthrough and approval',
      ],
      estimatedTime: '2-4 hours',
      requiredTools: ['Moisture meters', 'Camera', 'Documentation forms'],
    },
    {
      id: 'step-7',
      number: 7,
      title: 'Restoration & Rebuild',
      description: 'Restore property to pre-loss condition',
      details: [
        'Replace removed materials (drywall, flooring, etc.)',
        'Paint and finish work',
        'Final cleaning',
        'Quality inspection',
      ],
      estimatedTime: '1-4 weeks',
      requiredTools: ['Construction tools', 'Materials', 'Paint supplies'],
    },
  ],
};

/**
 * Sample Case Study Resource (with Before/After)
 */
export const SAMPLE_CASE_STUDY: CaseStudyResource = {
  id: 'case-1',
  slug: 'commercial-flood-restoration-case-study',
  title: 'Commercial Flood Restoration: 50,000 sq ft Office Complex',
  description: 'Complete restoration of flood-damaged commercial office complex in 14 days',
  excerpt: 'How we restored a major office complex after catastrophic flooding.',
  category: 'water-damage',
  contentType: 'article',
  author: {
    id: 'mike-anderson',
    name: 'Mike Anderson',
    title: 'Fire Restoration Specialist',
    credentials: ['Fire and Smoke Restoration Technician (FSRT)', 'Odour Control Technician (OCT)'],
  },
  publishedAt: new Date('2024-02-05'),
  updatedAt: new Date('2024-02-05'),
  readingTime: 15,
  tags: ['case study', 'commercial', 'flood', 'large loss'],
  caseStudy: {
    propertyType: 'Commercial Office Complex',
    location: 'Downtown Business District',
    incidentDate: new Date('2024-01-10'),
    completionDate: new Date('2024-01-24'),
    projectDuration: '14 days',
    beforeImages: [
      {
        url: '/images/case-studies/office-flood-before-1.jpg',
        alt: 'Flooded office lobby with standing water',
        caption: 'Main lobby with 3 inches of standing water',
        annotations: [
          { text: '3" standing water', x: 50, y: 70 },
          { text: 'Water-damaged drywall', x: 30, y: 40 },
        ],
      },
    ],
    afterImages: [
      {
        url: '/images/case-studies/office-flood-after-1.jpg',
        alt: 'Restored office lobby',
        caption: 'Fully restored lobby ready for business',
        annotations: [
          { text: 'New flooring installed', x: 50, y: 70 },
          { text: 'Restored to pre-loss condition', x: 30, y: 40 },
        ],
      },
    ],
    challenges: [
      'Large 50,000 sq ft area affected',
      'Business needed to reopen within 2 weeks',
      'Category 3 water contamination',
      'HVAC system compromised',
    ],
    solutions: [
      'Deployed 200+ air movers and 50 dehumidifiers',
      'Worked 24/7 shifts to meet deadline',
      'Coordinated with HVAC contractor for system restoration',
      'Implemented containment barriers for occupied areas',
    ],
    outcome: 'Office complex restored to pre-loss condition in 14 days, allowing business to resume operations on schedule. Zero mold growth detected in post-restoration testing.',
    testimonial: {
      quote: 'The team worked around the clock to get us back in business. Their professionalism and expertise were outstanding.',
      author: 'Janet Martinez',
      title: 'Facilities Manager, ABC Corporation',
    },
  },
};

/**
 * Helper Functions
 */
export function getCategoryBySlug(slug: string): ResourceCategory | undefined {
  return Object.values(RESOURCE_CATEGORIES).find((cat) => cat.id === slug);
}

export function getResourcesByCategory(category: DisasterCategory): Resource[] {
  return SAMPLE_RESOURCES.filter((resource) => resource.category === category);
}

export function getFeaturedResources(): Resource[] {
  return SAMPLE_RESOURCES.filter((resource) => resource.featured);
}

export function getTrendingResources(): Resource[] {
  return SAMPLE_RESOURCES.filter((resource) => resource.trending);
}

export function getRecentResources(limit: number = 5): Resource[] {
  return [...SAMPLE_RESOURCES]
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, limit);
}
