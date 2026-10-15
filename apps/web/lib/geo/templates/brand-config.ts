/**
 * Brand Configuration
 * Disaster Recovery - NRPG Platform
 *
 * IMPORTANT: Disaster Recovery is a MARKETING AGENCY, not a service provider.
 * - NO phone number (email only)
 * - Contractors are the direct point of contact
 * - Clients contact contractors AFTER match is accepted
 * - Support via AI Bot messenger and online forms
 */

import { SITE_URL } from '@/lib/seo/site-url';

// ============================================
// Brand Identity
// ============================================

export const BRAND_CONFIG = {
  // Company Details
  name: 'Disaster Recovery Australia',
  legalName: 'Disaster Recovery Pty Ltd',
  tagline: "Australia's Disaster Recovery Network",
  description: 'Connecting Australians with certified disaster recovery contractors',

  // IMPORTANT: No phone number - email/digital only
  phone: null,
  email: 'support@disasterrecovery.com.au',

  // Website
  baseUrl: SITE_URL,

  // Business Model Clarification
  businessModel: {
    type: 'MARKETING_AGENCY' as const,
    description:
      'Disaster Recovery is a marketing platform that connects clients with independent certified contractors. We are not a service provider.',
    directContact: false, // Clients don't contact us directly for service
    contractorIsContact: true, // Contractor becomes sole point of contact after match
  },

  // Branding
  colours: {
    primary: '#00BFA6', // Teal
    secondary: '#1E3A5F', // Navy
    emergency: '#DC2626', // Red
    accent: '#F59E0B', // Gold
  },

  // Default Images
  images: {
    logo: '/images/logo.svg',
    ogDefault: '/images/og-default.jpg',
    favicon: '/favicon.ico',
  },
} as const;

// ============================================
// Contact Model
// ============================================

export const CONTACT_MODEL = {
  // How clients get help
  clientSupport: {
    primary: 'AI_BOT' as const, // AI Bot messenger
    secondary: 'ONLINE_FORM' as const, // Support form
    email: 'support@disasterrecovery.com.au',
    phone: null, // NO PHONE
  },

  // How clients contact contractors
  contractorContact: {
    trigger: 'MATCH_ACCEPTED' as const, // Only after contractor accepts match
    method: 'CONTRACTOR_DIRECT' as const, // Contractor's own contact details
    revealed: 'AFTER_MATCH' as const, // Contact details revealed after match
  },

  // Client feedback
  feedback: {
    rating: true, // Can rate contractors
    concerns: {
      method: 'AI_BOT_OR_FORM' as const, // Via AI Bot or online form
      escalation: 'support@disasterrecovery.com.au',
    },
  },
} as const;

// ============================================
// CTA Configuration (No Phone CTAs)
// ============================================

export const CTA_CONFIG = {
  // Primary actions (no phone calls)
  primary: {
    text: 'Get Matched with Contractors',
    href: '/report-claim',
    style: 'PRIMARY' as const,
    icon: '🔍',
  },

  secondary: {
    text: 'Find Local Contractors',
    href: '/contractors',
    style: 'SECONDARY' as const,
    icon: '👷',
  },

  emergency: {
    text: 'Report Emergency Now',
    href: '/report-claim?urgent=true',
    style: 'EMERGENCY' as const,
    icon: '🚨',
    // NOTE: No phone number - directs to online form
  },

  quote: {
    text: 'Get Free Quotes',
    href: '/report-claim',
    style: 'PRIMARY' as const,
    icon: '📋',
  },

  joinNetwork: {
    text: 'Join Contractor Network',
    href: '/join',
    style: 'SECONDARY' as const,
    icon: '🤝',
  },

  support: {
    text: 'Get Help',
    href: '/support',
    style: 'SECONDARY' as const,
    icon: '💬',
    // Opens AI Bot or support form
  },
} as const;

// ============================================
// Page Messaging
// ============================================

export const PAGE_MESSAGING = {
  // Agency positioning (not service provider)
  agencyStatement:
    'Disaster Recovery Australia connects you with independent certified contractors. We are a marketing platform, not a service provider.',

  // How it works
  howItWorks: {
    title: 'How It Works',
    subtitle: 'Get connected with certified contractors in minutes',
    steps: [
      {
        number: 1,
        title: 'Report Your Situation',
        description: 'Fill out our quick online form with details about the damage',
        icon: '📝',
      },
      {
        number: 2,
        title: 'Get Matched',
        description: 'Our system matches you with certified, available contractors in your area',
        icon: '🎯',
      },
      {
        number: 3,
        title: 'Contractor Contacts You',
        description: 'The contractor calls you directly to assess and schedule the work',
        icon: '📞',
      },
      {
        number: 4,
        title: 'Work Completed',
        description: 'Rate your experience and provide feedback through our platform',
        icon: '✅',
      },
    ],
  },

  // Trust signals (agency positioning)
  trustSignals: [
    {
      icon: '✓',
      text: 'IICRC-Certified Contractors Only',
    },
    {
      icon: '✓',
      text: 'Verified Insurance & Licences',
    },
    {
      icon: '✓',
      text: 'Background-Checked Professionals',
    },
    {
      icon: '✓',
      text: 'Local Australian Businesses',
    },
    {
      icon: '✓',
      text: 'Satisfaction Guarantee',
    },
  ],

  // Disclaimer for all pages
  disclaimer:
    'Disaster Recovery Australia is a marketing platform connecting clients with independent contractors. All services are provided directly by the contractor. Disaster Recovery Australia does not perform restoration work.',

  // Emergency messaging (no phone)
  emergencyMessage: {
    headline: 'Need Emergency Help?',
    subheadline: 'Report now and get matched with available contractors',
    cta: CTA_CONFIG.emergency,
    note: 'Contractors in your area will be notified immediately',
  },
} as const;

// ============================================
// Schema.org Overrides for Agency Model
// ============================================

export const SCHEMA_OVERRIDES = {
  // We are NOT a LocalBusiness providing services
  // We are an Organization that connects clients with contractors
  organizationType: 'Organization' as const,

  // No telephone in schema
  telephone: undefined,

  // Contact point is email/web only
  contactPoint: {
    '@type': 'ContactPoint' as const,
    contactType: 'customer service',
    email: BRAND_CONFIG.email,
    url: `${BRAND_CONFIG.baseUrl}/support`,
    availableLanguage: ['English'],
    // No telephone
  },

  // Service description clarifies agency role
  serviceDescription:
    'Disaster Recovery Australia is a marketing platform that connects property owners with certified, independent disaster recovery contractors across Australia.',
} as const;

// ============================================
// Template Overrides
// ============================================

/**
 * Override default template config with brand-specific values
 */
export const TEMPLATE_CONFIG_OVERRIDES = {
  // No phone number
  phone: null,

  // Email for contact
  email: BRAND_CONFIG.email,

  // Updated CTAs (no phone-based CTAs)
  ctaText: {
    primary: 'Get Matched Now',
    secondary: 'Find Contractors',
    emergency: 'Report Emergency',
    // No 'Call Now' or similar phone CTAs
  },

  // Emergency message without phone
  emergencyMessage: 'Need help? Report your emergency online and get matched instantly.',
} as const;

// ============================================
// Utility Functions
// ============================================

/**
 * Get CTA for a specific action (never returns phone CTA)
 */
export function getCTA(action: keyof typeof CTA_CONFIG) {
  return CTA_CONFIG[action];
}

/**
 * Get emergency CTA (online form, not phone)
 */
export function getEmergencyCTA() {
  return {
    ...CTA_CONFIG.emergency,
    note: 'Submitting this form will immediately notify available contractors in your area',
  };
}

/**
 * Build page disclaimer
 */
export function getPageDisclaimer(): string {
  return PAGE_MESSAGING.disclaimer;
}

/**
 * Check if we should show phone number (always false)
 */
export function shouldShowPhone(): boolean {
  return false;
}

/**
 * Get contact info for schema markup (no phone)
 */
export function getSchemaContactInfo() {
  return {
    email: BRAND_CONFIG.email,
    url: `${BRAND_CONFIG.baseUrl}/support`,
    contactType: 'customer service',
  };
}

/**
 * Get agency disclaimer for page footers
 */
export function getAgencyDisclaimer(): string {
  return PAGE_MESSAGING.agencyStatement;
}

/**
 * Build "How It Works" section data
 */
export function getHowItWorksData() {
  return PAGE_MESSAGING.howItWorks;
}

/**
 * Get trust signals for display
 */
export function getTrustSignals() {
  return PAGE_MESSAGING.trustSignals;
}
