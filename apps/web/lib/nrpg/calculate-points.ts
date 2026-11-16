/**
 * NRPG 100-Point Certification Calculator
 * Based on PROFESSIONAL_CERTIFICATION_FRAMEWORK.md
 *
 * Categories:
 * 1. Government Cert IV (40 pts max)
 * 2. Industry certifications (30 pts max)
 * 3. CARSI Membership & CECs (25 pts max)
 * 4. Industry Association (20 pts max)
 */

import type { NRPGPartnershipLevel } from '@prisma/client';

// ============================================================================
// TYPES
// ============================================================================

export interface IICRCCertifications {
  // Core certifications (24 pts max)
  wrt?: boolean;   // Water Damage Restoration - 8 pts
  asd?: boolean;   // structural drying - 7 pts
  amrt?: boolean;  // mould remediation - 5 pts
  cct?: boolean;   // carpet cleaning - 4 pts

  // Advanced certifications (8 pts max)
  fsr?: boolean;   // Fire and Smoke Restoration - 3 pts
  uft?: boolean;   // Upholstery and Fabric - 2 pts
  tcsc?: boolean;  // Trauma/Crime Scene - 3 pts

  // Master certifications (bonus pts)
  mwr?: boolean;   // senior water restoration - +5 pts
  mfsr?: boolean;  // Master Fire/Smoke - +5 pts
  mtc?: boolean;   // senior textile cleaning - +3 pts
}

export interface CARSIMembership {
  isActiveMember: boolean;
  membershipLevel?: 'professional' | 'business';
  coursesCompleted: number;  // 0-12 pts based on completion
  annualCECCredits: number;  // 20+ = full points
  isCECExcellence?: boolean; // 30+ CECs
  isCourseDeveloper?: boolean; // Contributes to CEC delivery
}

export interface IndustryAssociations {
  primaryAssociation?: string;  // RIA, ATFA, ACCA, BSCA, ESA
  secondaryAssociations: string[];
  hasCommitteeRole?: boolean;
  hasBoardRole?: boolean;
}

export interface GovCert4Status {
  status: 'not_enrolled' | 'enrolled' | 'in_progress_50' | 'completed' | 'experience_based';
}

export interface CertificationInput {
  govCert4: GovCert4Status;
  iicrc: IICRCCertifications;
  carsi: CARSIMembership;
  associations: IndustryAssociations;
}

export interface PointsBreakdown {
  govCert4Points: number;
  iicrcCorePoints: number;
  iicrcAdvancedPoints: number;
  iicrcMasterBonus: number;
  iicrcTotal: number;
  carsiMembershipPoints: number;
  carsiCoursePoints: number;
  carsiCECPoints: number;
  carsiTotal: number;
  primaryAssocPoints: number;
  secondaryAssocPoints: number;
  associationTotal: number;
  totalPoints: number;
  partnershipLevel: NRPGPartnershipLevel;
}

// ============================================================================
// POINT CALCULATIONS
// ============================================================================

/**
 * Calculate Government Cert IV points (max 40)
 */
export function calculateGovCert4Points(status: GovCert4Status): number {
  switch (status.status) {
    case 'not_enrolled':
      return 0;
    case 'enrolled':
      return 3;  // Demonstrates commitment
    case 'in_progress_50':
      return 6;  // Significant progress
    case 'completed':
      return 40; // Full points
    case 'experience_based':
      return 15; // Interim recognition
    default:
      return 0;
  }
}

/**
 * Calculate industry certification points (max 30 + bonus)
 */
export function calculateIICRCPoints(certs: IICRCCertifications): {
  core: number;
  advanced: number;
  masterBonus: number;
} {
  let core = 0;
  let advanced = 0;
  let masterBonus = 0;

  // Core certifications (24 pts max)
  if (certs.wrt) core += 8;
  if (certs.asd) core += 7;
  if (certs.amrt) core += 5;
  if (certs.cct) core += 4;

  // Advanced certifications (8 pts max)
  if (certs.fsr) advanced += 3;
  if (certs.uft) advanced += 2;
  if (certs.tcsc) advanced += 3;

  // Master certifications (bonus, uncapped)
  if (certs.mwr) masterBonus += 5;
  if (certs.mfsr) masterBonus += 5;
  if (certs.mtc) masterBonus += 3;

  // Cap core + advanced at 30
  const cappedTotal = Math.min(core + advanced, 30);

  return {
    core: Math.min(core, 24),
    advanced: Math.min(advanced, 8),
    masterBonus,
  };
}

/**
 * Calculate CARSI membership and CEC points (max 25)
 */
export function calculateCARSIPoints(carsi: CARSIMembership): {
  membership: number;
  courses: number;
  cec: number;
} {
  let membership = 0;
  let courses = 0;
  let cec = 0;

  if (carsi.isActiveMember) {
    // Base membership (8 pts max)
    membership = 5; // Active membership
    if (carsi.membershipLevel === 'professional') {
      membership += 2; // Network participation
    } else if (carsi.membershipLevel === 'business') {
      membership = 8; // Full business membership
    }
    membership += 1; // Industry contribution (assumed for active members)
  }

  // Course completion (12 pts max)
  // Assume courses are worth varying points, cap at 12
  courses = Math.min(carsi.coursesCompleted, 12);

  // CEC credits (5 pts max)
  if (carsi.annualCECCredits >= 20) {
    cec = 3; // Met minimum
    if (carsi.annualCECCredits >= 30 || carsi.isCECExcellence) {
      cec += 1; // Excellence level
    }
    if (carsi.isCourseDeveloper) {
      cec += 1; // Leadership contribution
    }
  } else if (carsi.annualCECCredits >= 10) {
    cec = 2; // Partial credit
  } else if (carsi.annualCECCredits > 0) {
    cec = 1; // Some effort
  }

  return {
    membership: Math.min(membership, 8),
    courses: Math.min(courses, 12),
    cec: Math.min(cec, 5),
  };
}

/**
 * Calculate Industry Association points (max 20)
 */
export function calculateAssociationPoints(assoc: IndustryAssociations): {
  primary: number;
  secondary: number;
} {
  let primary = 0;
  let secondary = 0;

  // Primary association (10 pts max)
  if (assoc.primaryAssociation) {
    primary = 4; // Base membership
    if (assoc.hasCommitteeRole) {
      primary += 2; // Committee participation
    }
    if (assoc.hasBoardRole) {
      primary += 4; // Board/executive position
    }
  }

  // Secondary associations (10 pts max)
  // 5 pts each, max 2
  const secondaryCount = Math.min(assoc.secondaryAssociations.length, 2);
  secondary = secondaryCount * 5;

  return {
    primary: Math.min(primary, 10),
    secondary: Math.min(secondary, 10),
  };
}

/**
 * Determine partnership level based on total points
 */
export function determinePartnershipLevel(totalPoints: number): NRPGPartnershipLevel {
  if (totalPoints >= 100) return 'EXCELLENCE';
  if (totalPoints >= 85) return 'PROFESSIONAL';
  if (totalPoints >= 70) return 'ASSOCIATE';
  return 'CANDIDATE';
}

/**
 * Calculate complete NRPG certification points breakdown
 */
export function calculateNRPGPoints(input: CertificationInput): PointsBreakdown {
  const govCert4Points = calculateGovCert4Points(input.govCert4);
  const iicrc = calculateIICRCPoints(input.iicrc);
  const carsi = calculateCARSIPoints(input.carsi);
  const associations = calculateAssociationPoints(input.associations);

  const iicrcTotal = Math.min(iicrc.core + iicrc.advanced, 30) + iicrc.masterBonus;
  const carsiTotal = carsi.membership + carsi.courses + carsi.cec;
  const associationTotal = associations.primary + associations.secondary;

  // Base total capped at 100, but master bonus can exceed
  const basePoints = govCert4Points + Math.min(iicrc.core + iicrc.advanced, 30) + carsiTotal + associationTotal;
  const totalPoints = basePoints + iicrc.masterBonus;

  return {
    govCert4Points,
    iicrcCorePoints: iicrc.core,
    iicrcAdvancedPoints: iicrc.advanced,
    iicrcMasterBonus: iicrc.masterBonus,
    iicrcTotal,
    carsiMembershipPoints: carsi.membership,
    carsiCoursePoints: carsi.courses,
    carsiCECPoints: carsi.cec,
    carsiTotal,
    primaryAssocPoints: associations.primary,
    secondaryAssocPoints: associations.secondary,
    associationTotal,
    totalPoints,
    partnershipLevel: determinePartnershipLevel(totalPoints),
  };
}

// ============================================================================
// PARTNERSHIP LEVEL UTILITIES
// ============================================================================

export const PARTNERSHIP_LEVELS = {
  CANDIDATE: {
    name: 'Certified Specialist',
    minPoints: 60,
    maxPoints: 69,
    description: 'Single-specialty experts and emerging professionals',
    colour: '#F59E0B', // Amber
  },
  ASSOCIATE: {
    name: 'Certified Professional',
    minPoints: 70,
    maxPoints: 84,
    description: 'Multi-competency professionals and growing businesses',
    colour: '#3B82F6', // Blue
  },
  PROFESSIONAL: {
    name: 'Certified Expert',
    minPoints: 85,
    maxPoints: 99,
    description: 'Industry leaders and comprehensive service providers',
    colour: '#8B5CF6', // Purple
  },
  EXCELLENCE: {
    name: 'Certified Master',
    minPoints: 100,
    maxPoints: 999,
    description: 'Industry authorities and education leaders',
    colour: '#10B981', // Green/Teal
  },
} as const;

export function getPartnershipLevelInfo(level: NRPGPartnershipLevel) {
  return PARTNERSHIP_LEVELS[level];
}

export function getNextPartnershipLevel(currentLevel: NRPGPartnershipLevel): NRPGPartnershipLevel | null {
  const levels: NRPGPartnershipLevel[] = ['CANDIDATE', 'ASSOCIATE', 'PROFESSIONAL', 'EXCELLENCE'];
  const currentIndex = levels.indexOf(currentLevel);
  if (currentIndex < levels.length - 1) {
    return levels[currentIndex + 1];
  }
  return null;
}

export function getPointsToNextLevel(currentPoints: number, currentLevel: NRPGPartnershipLevel): number {
  const nextLevel = getNextPartnershipLevel(currentLevel);
  if (!nextLevel) return 0;
  return PARTNERSHIP_LEVELS[nextLevel].minPoints - currentPoints;
}
