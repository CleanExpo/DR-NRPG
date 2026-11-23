/**
 * Australian Disaster Types & Classification
 *
 * Comprehensive disaster type definitions specific to Australian disaster recovery,
 * including regional risk factors, seasonal patterns, and building code requirements.
 */

import { z } from 'zod';

// ============================================================================
// Australian Disaster Categories
// ============================================================================

export const DISASTER_CATEGORIES = {
  WATER: 'water',
  FIRE: 'fire',
  STORM: 'storm',
  MOULD: 'mould',
  BIOHAZARD: 'biohazard',
  STRUCTURAL: 'structural',
} as const;

export type DisasterCategory = typeof DISASTER_CATEGORIES[keyof typeof DISASTER_CATEGORIES];

// ============================================================================
// Australian States
// ============================================================================

export const AUSTRALIAN_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'] as const;
export type AustralianState = typeof AUSTRALIAN_STATES[number];

// ============================================================================
// Australian Disaster Type Definitions
// ============================================================================

export interface AustralianDisasterType {
  value: string;
  label: string;
  description: string;
  category: DisasterCategory;
  australian: true;
  seasonal?: {
    start: string; // Month name
    end: string;   // Month name
  };
  highRiskStates?: AustralianState[];
  moderateRiskStates?: AustralianState[];
  buildingCode?: string; // Applicable Australian Standard
  iicrcCertRequired?: string[]; // Required certifications (descriptive labels, not matched against stored codes)
  averageCostAUD?: {
    min: number;
    max: number;
  };
  keywords: string[]; // For AI classification
}

/**
 * Comprehensive Australian Disaster Types
 * Organized by category with Australian-specific terminology and regional data
 */
export const AUSTRALIAN_DISASTER_TYPES: Record<string, AustralianDisasterType> = {
  // ============================================================================
  // WATER-RELATED DISASTERS
  // ============================================================================
  'water-damage': {
    value: 'water-damage',
    label: 'Water Damage (General)',
    description: 'General water damage from various sources including leaks, overflow, or condensation',
    category: DISASTER_CATEGORIES.WATER,
    australian: true,
    iicrcCertRequired: ['Water damage restoration'],
    averageCostAUD: { min: 2000, max: 15000 },
    keywords: ['water', 'wet', 'moisture', 'damp', 'leak', 'overflow'],
  },
  'flood': {
    value: 'flood',
    label: 'Flood',
    description: 'Flooding from natural disasters, storm surges, or overflowing waterways',
    category: DISASTER_CATEGORIES.WATER,
    australian: true,
    seasonal: { start: 'November', end: 'February' },
    highRiskStates: ['QLD', 'NSW', 'NT'],
    moderateRiskStates: ['VIC', 'WA', 'SA'],
    buildingCode: 'Planning for Bushfire Protection 2019',
    iicrcCertRequired: ['Water damage restoration'],
    averageCostAUD: { min: 10000, max: 100000 },
    keywords: ['flood', 'flooding', 'inundation', 'river overflow', 'flash flood', 'storm surge'],
  },
  'storm-water': {
    value: 'storm-water',
    label: 'Storm Water Damage',
    description: 'Water damage caused by severe storms, heavy rainfall, or inadequate drainage',
    category: DISASTER_CATEGORIES.WATER,
    australian: true,
    seasonal: { start: 'November', end: 'February' },
    iicrcCertRequired: ['Water damage restoration'],
    averageCostAUD: { min: 3000, max: 25000 },
    keywords: ['storm water', 'heavy rain', 'downpour', 'drainage failure', 'gutters overflow'],
  },
  'burst-pipe': {
    value: 'burst-pipe',
    label: 'Burst Pipe',
    description: 'Water damage from burst or broken pipes, including hot water systems',
    category: DISASTER_CATEGORIES.WATER,
    australian: true,
    iicrcCertRequired: ['Water damage restoration'],
    averageCostAUD: { min: 1500, max: 10000 },
    keywords: ['burst pipe', 'broken pipe', 'plumbing failure', 'pipe rupture', 'hot water system'],
  },

  // ============================================================================
  // FIRE-RELATED DISASTERS (Australian-Specific)
  // ============================================================================
  'bushfire': {
    value: 'bushfire',
    label: 'Bushfire',
    description: 'Damage from bushfire including ember attack, radiant heat, direct flame contact, and smoke',
    category: DISASTER_CATEGORIES.FIRE,
    australian: true,
    seasonal: { start: 'October', end: 'March' },
    highRiskStates: ['NSW', 'VIC', 'SA', 'WA', 'TAS'],
    moderateRiskStates: ['QLD', 'ACT'],
    buildingCode: 'AS 3959-2018 (Bushfire Attack Level - BAL)',
    iicrcCertRequired: ['Fire and smoke damage restoration'],
    averageCostAUD: { min: 20000, max: 500000 },
    keywords: ['bushfire', 'bush fire', 'wildfire', 'ember attack', 'radiant heat', 'BAL rating'],
  },
  'house-fire': {
    value: 'house-fire',
    label: 'House Fire',
    description: 'Fire damage from residential fire including structural damage, smoke damage, and water damage from firefighting',
    category: DISASTER_CATEGORIES.FIRE,
    australian: true,
    iicrcCertRequired: ['Fire and smoke damage restoration'],
    averageCostAUD: { min: 15000, max: 300000 },
    keywords: ['house fire', 'residential fire', 'structural fire', 'fire damage', 'burn damage'],
  },
  'smoke-damage': {
    value: 'smoke-damage',
    label: 'Smoke Damage',
    description: 'Smoke and soot damage from fire or bushfire smoke',
    category: DISASTER_CATEGORIES.FIRE,
    australian: true,
    iicrcCertRequired: ['Fire and smoke damage restoration'],
    averageCostAUD: { min: 5000, max: 50000 },
    keywords: ['smoke', 'soot', 'smoke damage', 'smoke odour', 'smoke smell', 'smoke residue'],
  },

  // ============================================================================
  // STORM-RELATED DISASTERS (Australian-Specific)
  // ============================================================================
  'cyclone': {
    value: 'cyclone',
    label: 'Cyclone',
    description: 'Damage from tropical cyclone including high winds, storm surge, and torrential rain',
    category: DISASTER_CATEGORIES.STORM,
    australian: true,
    seasonal: { start: 'November', end: 'April' },
    highRiskStates: ['QLD', 'NT', 'WA'],
    buildingCode: 'AS 1170.2 Wind Actions',
    iicrcCertRequired: ['Water damage restoration', 'Structural drying'],
    averageCostAUD: { min: 30000, max: 200000 },
    keywords: ['cyclone', 'tropical cyclone', 'hurricane', 'category 1', 'category 2', 'category 3', 'category 4', 'category 5', 'wind rating'],
  },
  'severe-storm': {
    value: 'severe-storm',
    label: 'Severe Storm',
    description: 'Damage from severe thunderstorms including wind damage, water ingress, and lightning strikes',
    category: DISASTER_CATEGORIES.STORM,
    australian: true,
    seasonal: { start: 'November', end: 'February' },
    iicrcCertRequired: ['Water damage restoration'],
    averageCostAUD: { min: 5000, max: 50000 },
    keywords: ['severe storm', 'thunderstorm', 'storm damage', 'lightning strike', 'severe weather'],
  },
  'hailstorm': {
    value: 'hailstorm',
    label: 'Hailstorm',
    description: 'Damage from hailstorm including roof damage, broken windows, and vehicle damage',
    category: DISASTER_CATEGORIES.STORM,
    australian: true,
    seasonal: { start: 'October', end: 'March' },
    highRiskStates: ['NSW', 'ACT', 'QLD'],
    moderateRiskStates: ['VIC', 'SA'],
    buildingCode: 'AS 4040.3 Hail Resistance',
    iicrcCertRequired: ['Water damage restoration'],
    averageCostAUD: { min: 3000, max: 30000 },
    keywords: ['hail', 'hailstorm', 'hail damage', 'hailstone', 'roof damage from hail'],
  },
  'wind-damage': {
    value: 'wind-damage',
    label: 'Wind Damage',
    description: 'Structural damage from high winds including roof damage, fence damage, and fallen trees',
    category: DISASTER_CATEGORIES.STORM,
    australian: true,
    buildingCode: 'AS 1170.2 Wind Actions',
    iicrcCertRequired: [],
    averageCostAUD: { min: 2000, max: 40000 },
    keywords: ['wind damage', 'high winds', 'gale', 'windstorm', 'roof blown off', 'fallen tree'],
  },

  // ============================================================================
  // MOULD & BIOLOGICAL (Australian Spelling)
  // ============================================================================
  'mould-remediation': {
    value: 'mould-remediation',
    label: 'Mould Remediation',
    description: 'Mould growth and contamination requiring professional remediation (Australian spelling: mould)',
    category: DISASTER_CATEGORIES.MOULD,
    australian: true,
    iicrcCertRequired: ['Microbial remediation'],
    averageCostAUD: { min: 2000, max: 15000 },
    keywords: ['mould', 'mold', 'black mould', 'toxic mould', 'mould growth', 'fungus', 'mildew', 'spores'],
  },

  // ============================================================================
  // BIOHAZARD & SEWAGE
  // ============================================================================
  'sewage-backup': {
    value: 'sewage-backup',
    label: 'Sewage Backup',
    description: 'Sewage backup or overflow requiring biohazard cleanup and disinfection',
    category: DISASTER_CATEGORIES.BIOHAZARD,
    australian: true,
    iicrcCertRequired: ['Water damage restoration', 'Microbial remediation'],
    averageCostAUD: { min: 3000, max: 20000 },
    keywords: ['sewage', 'sewage backup', 'sewage overflow', 'black water', 'toilet overflow'],
  },
  'biohazard': {
    value: 'biohazard',
    label: 'Biohazard Cleanup',
    description: 'Biohazard contamination including bodily fluids, medical waste, or chemical spills',
    category: DISASTER_CATEGORIES.BIOHAZARD,
    australian: true,
    iicrcCertRequired: ['Microbial remediation'],
    averageCostAUD: { min: 2500, max: 25000 },
    keywords: ['biohazard', 'bodily fluids', 'blood', 'medical waste', 'hazardous materials', 'contamination'],
  },

  // ============================================================================
  // STRUCTURAL DAMAGE
  // ============================================================================
  'structural-damage': {
    value: 'structural-damage',
    label: 'Structural Damage',
    description: 'Damage to building structure including foundations, walls, floors, or roof',
    category: DISASTER_CATEGORIES.STRUCTURAL,
    australian: true,
    buildingCode: 'National Construction Code (NCC) 2022',
    iicrcCertRequired: [],
    averageCostAUD: { min: 10000, max: 150000 },
    keywords: ['structural damage', 'foundation', 'wall damage', 'ceiling collapse', 'floor damage', 'structural integrity'],
  },
  'roof-damage': {
    value: 'roof-damage',
    label: 'Roof Damage',
    description: 'Damage to roof including missing tiles, leaks, or structural failure',
    category: DISASTER_CATEGORIES.STRUCTURAL,
    australian: true,
    buildingCode: 'AS 1170.2 Wind Actions',
    iicrcCertRequired: [],
    averageCostAUD: { min: 3000, max: 50000 },
    keywords: ['roof damage', 'roof leak', 'missing tiles', 'roof collapse', 'roof repair', 'roofing'],
  },
} as const;

// ============================================================================
// Type-Safe Array of Disaster Types
// ============================================================================

export const AUSTRALIAN_DISASTER_TYPE_LIST = Object.values(AUSTRALIAN_DISASTER_TYPES);

/**
 * Get disaster types as select options for forms
 */
export function getAustralianDisasterTypeOptions() {
  return AUSTRALIAN_DISASTER_TYPE_LIST.map((type) => ({
    value: type.value,
    label: type.label,
  }));
}

/**
 * Get disaster types filtered by category
 */
export function getDisasterTypesByCategory(category: DisasterCategory) {
  return AUSTRALIAN_DISASTER_TYPE_LIST.filter((type) => type.category === category);
}

/**
 * Get disaster types relevant to a specific state
 */
export function getDisasterTypesForState(state: AustralianState) {
  return AUSTRALIAN_DISASTER_TYPE_LIST.filter((type) => {
    if (!type.highRiskStates && !type.moderateRiskStates) return true; // Available in all states
    return (
      type.highRiskStates?.includes(state) ||
      type.moderateRiskStates?.includes(state)
    );
  });
}

/**
 * Get currently in-season disaster types
 */
export function getCurrentSeasonalDisasters(month?: number): AustralianDisasterType[] {
  const currentMonth = month ?? new Date().getMonth() + 1; // 1-12
  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const currentMonthName = monthNames[currentMonth];

  return AUSTRALIAN_DISASTER_TYPE_LIST.filter((type) => {
    if (!type.seasonal) return false;

    const startMonth = monthNames.indexOf(type.seasonal.start);
    const endMonth = monthNames.indexOf(type.seasonal.end);

    // Handle seasons that cross year boundary (e.g., Oct-Mar)
    if (startMonth > endMonth) {
      return currentMonth >= startMonth || currentMonth <= endMonth;
    }

    return currentMonth >= startMonth && currentMonth <= endMonth;
  });
}

/**
 * Classify damage description using keywords
 */
export function classifyDisasterType(description: string): AustralianDisasterType | null {
  const descLower = description.toLowerCase();
  let bestMatch: { type: AustralianDisasterType; score: number } | null = null;

  for (const type of AUSTRALIAN_DISASTER_TYPE_LIST) {
    const matches = type.keywords.filter((keyword) =>
      descLower.includes(keyword.toLowerCase())
    );

    if (matches.length > 0) {
      const score = matches.length / type.keywords.length;
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { type, score };
      }
    }
  }

  return bestMatch?.type || null;
}

// ============================================================================
// Zod Schema for Validation
// ============================================================================

export const australianDisasterTypeSchema = z.enum(
  Object.keys(AUSTRALIAN_DISASTER_TYPES) as [string, ...string[]],
  { required_error: 'Please select a disaster type' }
);

export type AustralianDisasterTypeValue = z.infer<typeof australianDisasterTypeSchema>;
