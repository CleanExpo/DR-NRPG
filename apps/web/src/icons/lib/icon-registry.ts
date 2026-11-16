/**
 * Icon Registry - Type definitions and metadata for custom NRPG icons
 * Centralized source of truth for all custom icon names and properties
 */

import { designTokens } from '@/lib/design-tokens';

/**
 * Service-specific icons for disaster recovery services
 */
export type ServiceIcon = 'water-damage' | 'fire-smoke' | 'mould-remediation' | 'bio-forensic';

/**
 * Trust and certification badge icons
 */
export type TrustIcon = 'iicrc-badge' | 'verified-badge';

/**
 * Emergency and CTA icons for urgent actions
 */
export type EmergencyIcon = 'emergency-alert' | 'phone-call' | 'chat-message';

/**
 * Calendar and scheduling icons
 */
export type CalendarIcon = 'schedule-calendar';

/**
 * All custom icon names combined
 */
export type CustomIconName = ServiceIcon | TrustIcon | EmergencyIcon | CalendarIcon;

/**
 * Standard Lucide icons we keep for generic UI
 */
export type LucideIconName =
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'x'
  | 'menu'
  | 'search'
  | 'check'
  | 'loader'
  | 'arrow-right'
  | 'arrow-left'
  | 'alert-circle'
  | 'info'
  | 'help-circle'
  | 'mail'
  | 'phone'
  | 'message-square'
  | 'calendar'
  | 'shield'
  | 'check-circle';

/**
 * Union of all icon names (custom + Lucide)
 */
export type IconName = CustomIconName | LucideIconName;

/**
 * Size variants for icons
 */
export type IconSizeVariant = keyof typeof designTokens.iconSizes;

/**
 * Gradient options for custom icons
 */
export type IconGradientVariant = keyof typeof designTokens.iconGradients;

/**
 * Icon category for organization and searching
 */
export type IconCategory = 'service' | 'trust' | 'emergency' | 'calendar' | 'ui';

/**
 * Metadata for each custom icon
 */
export interface IconMetadata {
  name: string;
  category: IconCategory;
  keywords: string[];
  defaultSize?: IconSizeVariant;
  gradient?: IconGradientVariant;
  description: string;
  ariaLabel: string;
}

/**
 * Registry of all custom icons with their metadata
 */
export const customIconRegistry: Record<CustomIconName, IconMetadata> = {
  // Service Icons - Disaster recovery service categories
  'water-damage': {
    name: 'Water Damage',
    category: 'service',
    keywords: ['flood', 'water', 'restoration', 'drying', 'extraction'],
    defaultSize: 'service',
    gradient: 'water',
    description: 'Water damage restoration and flood remediation service',
    ariaLabel: 'Water Damage Restoration',
  },
  'fire-smoke': {
    name: 'Fire & Smoke',
    category: 'service',
    keywords: ['fire', 'smoke', 'restoration', 'soot', 'odour'],
    defaultSize: 'service',
    gradient: 'fire',
    description: 'Fire and smoke restoration service',
    ariaLabel: 'Fire & Smoke Restoration',
  },
  'mould-remediation': {
    name: 'Mould Remediation',
    category: 'service',
    keywords: ['mould', 'mold', 'remediation', 'spore', 'containment'],
    defaultSize: 'service',
    gradient: 'mould',
    description: 'Mould growth remediation and mitigation service',
    ariaLabel: 'Mould Remediation',
  },
  'bio-forensic': {
    name: 'Bio & Forensic',
    category: 'service',
    keywords: ['bio', 'forensic', 'cleaning', 'decontamination'],
    defaultSize: 'service',
    gradient: 'bio',
    description: 'Biohazard and forensic cleaning service',
    ariaLabel: 'Bio & Forensic Cleaning',
  },

  // Trust Icons - Certifications and badges
  'iicrc-badge': {
    name: 'Qualified Contractor',
    category: 'trust',
    keywords: ['qualified', 'certified', 'badge', 'trust', 'professional'],
    defaultSize: 'lg',
    description: 'Qualified professional badge',
    ariaLabel: 'Qualified Contractor',
  },
  'verified-badge': {
    name: 'Verified Contractor',
    category: 'trust',
    keywords: ['verified', 'badge', 'trust', 'certified', 'approved'],
    defaultSize: 'lg',
    description: 'Verified contractor badge',
    ariaLabel: 'Verified Contractor',
  },

  // Emergency Icons - Action and CTA icons
  'emergency-alert': {
    name: 'Emergency Alert',
    category: 'emergency',
    keywords: ['emergency', 'alert', 'urgent', '24/7', 'critical'],
    defaultSize: 'emergency',
    gradient: 'emergency',
    description: 'Emergency alert and urgent action indicator',
    ariaLabel: 'Emergency Alert',
  },
  'phone-call': {
    name: 'Phone Call',
    category: 'emergency',
    keywords: ['phone', 'call', 'contact', 'emergency', 'service'],
    defaultSize: 'emergency',
    description: 'Phone call action icon',
    ariaLabel: 'Call for Service',
  },
  'chat-message': {
    name: 'Chat Message',
    category: 'emergency',
    keywords: ['chat', 'message', 'contact', 'support', 'communication'],
    defaultSize: 'emergency',
    description: 'Chat or message action icon',
    ariaLabel: 'Chat Support',
  },

  // Calendar Icons
  'schedule-calendar': {
    name: 'Schedule Calendar',
    category: 'calendar',
    keywords: ['schedule', 'calendar', 'booking', 'appointment', 'date'],
    defaultSize: 'lg',
    description: 'Calendar scheduling and booking icon',
    ariaLabel: 'Schedule Appointment',
  },
};

/**
 * Get metadata for a custom icon
 */
export function getIconMetadata(iconName: CustomIconName): IconMetadata {
  return customIconRegistry[iconName];
}

/**
 * Get all icons by category
 */
export function getIconsByCategory(category: IconCategory): CustomIconName[] {
  return Object.entries(customIconRegistry)
    .filter(([, metadata]) => metadata.category === category)
    .map(([name]) => name as CustomIconName);
}

/**
 * Search icons by keyword
 */
export function searchIcons(keyword: string): CustomIconName[] {
  const lowerKeyword = keyword.toLowerCase();
  return Object.entries(customIconRegistry)
    .filter(([, metadata]) =>
      metadata.keywords.some((kw) => kw.toLowerCase().includes(lowerKeyword)) ||
      metadata.name.toLowerCase().includes(lowerKeyword),
    )
    .map(([name]) => name as CustomIconName);
}

/**
 * Icon size constants (from design tokens)
 */
export const ICON_SIZES = designTokens.iconSizes;

/**
 * Icon gradient constants (from design tokens)
 */
export const ICON_GRADIENTS = designTokens.iconGradients;
