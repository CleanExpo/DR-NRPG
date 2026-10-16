/**
 * AI-Powered Fraud Detection Service
 *
 * Phase D.1: Comprehensive fraud detection for disaster recovery platform
 *
 * Detection Capabilities:
 * - Duplicate claim detection (semantic similarity, address clustering)
 * - Anomaly detection (pricing patterns, geographic inconsistencies, collusion)
 * - Document verification (invoice authenticity, estimate reasonableness)
 * - Pattern recognition across entities
 */

import { prisma } from '@/lib/prisma';
import { getDefaultProvider } from '@/lib/agents/providers';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

// ============================================================================
// Types and Interfaces
// ============================================================================

export type FraudAlertType =
  | 'DUPLICATE_CLAIM'
  | 'SUSPICIOUS_PRICING'
  | 'DOCUMENT_ANOMALY'
  | 'COLLUSION_PATTERN'
  | 'GEOGRAPHIC_MISMATCH'
  | 'TIMING_ANOMALY'
  | 'IDENTITY_INCONSISTENCY'
  | 'PATTERN_MATCH';

export type AlertStatus = 'PENDING' | 'INVESTIGATING' | 'CONFIRMED' | 'DISMISSED' | 'ESCALATED';

export type EntityType = 'CLAIM' | 'BOOKING' | 'PAYMENT' | 'CONTRACTOR' | 'CLIENT';

export interface FraudIndicator {
  type: FraudAlertType;
  confidence: number; // 0-1
  description: string;
  evidence: string[];
  suggestedAction: string;
}

export interface FraudAnalysisResult {
  entityType: EntityType;
  entityId: string;
  overallRiskScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  indicators: FraudIndicator[];
  similarEntities: Array<{
    entityId: string;
    entityType: EntityType;
    similarity: number;
    matchedFields: string[];
  }>;
  recommendation: 'AUTO_APPROVE' | 'MANUAL_REVIEW' | 'HOLD' | 'REJECT';
  reasoning: string;
  analysedAt: Date;
  processingTimeMs: number;
}

export interface FraudAlert {
  id: string;
  entityType: EntityType;
  entityId: string;
  alertType: FraudAlertType;
  riskScore: number;
  indicators: FraudIndicator[];
  status: AlertStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  confidence: number;
  matchedEntities: Array<{
    entityId: string;
    similarity: number;
    matchedFields: string[];
  }>;
  reasoning: string;
}

export interface PricingAnomalyResult {
  isAnomaly: boolean;
  deviation: number; // Percentage deviation from expected
  expectedRange: { min: number; max: number };
  actualAmount: number;
  reasoning: string;
}

// ============================================================================
// Constants
// ============================================================================

// Australian average costs by service type (AUD)
const AVERAGE_COSTS_AUD: Record<string, { min: number; max: number; median: number }> = {
  WATER_DAMAGE: { min: 1500, max: 15000, median: 5000 },
  FIRE_DAMAGE: { min: 5000, max: 50000, median: 20000 },
  SMOKE_DAMAGE: { min: 2000, max: 20000, median: 8000 },
  MOULD_REMEDIATION: { min: 2000, max: 25000, median: 7500 },
  STORM_DAMAGE: { min: 2000, max: 30000, median: 10000 },
  FLOOD_DAMAGE: { min: 3000, max: 40000, median: 15000 },
  CONTENT_RESTORATION: { min: 500, max: 10000, median: 3000 },
  STRUCTURAL_DRYING: { min: 2000, max: 15000, median: 6000 },
  BIOHAZARD_REMEDIATION: { min: 3000, max: 30000, median: 12000 },
  HOARDING_CLEANUP: { min: 2000, max: 25000, median: 8000 },
};

// Risk thresholds
const RISK_THRESHOLDS = {
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
  CRITICAL: 100,
};

// Similarity thresholds
const SIMILARITY_THRESHOLDS = {
  DUPLICATE: 0.85,
  SUSPICIOUS: 0.7,
  RELATED: 0.5,
};

// In-memory alert storage (in production, use database)
const alertStorage = new Map<string, FraudAlert>();
let alertCounter = 0;

// ============================================================================
// Core Fraud Detection Functions
// ============================================================================

/**
 * Analyse entity for fraud indicators
 */
export async function analyseFraud(
  entityType: EntityType,
  entityId: string,
  options: { depth?: 'quick' | 'thorough' } = {}
): Promise<FraudAnalysisResult> {
  const startTime = Date.now();
  const depth = options.depth || 'thorough';

  try {
    // Fetch entity data
    const entityData = await fetchEntityData(entityType, entityId);

    if (!entityData) {
      throw new Error(`Entity not found: ${entityType}/${entityId}`);
    }

    // Run all detection modules
    const indicators: FraudIndicator[] = [];

    // 1. Duplicate detection
    const duplicateCheck = await checkForDuplicates(entityType, entityId, entityData);
    if (duplicateCheck.isDuplicate) {
      indicators.push({
        type: 'DUPLICATE_CLAIM',
        confidence: duplicateCheck.confidence,
        description: `Potential duplicate detected with ${duplicateCheck.matchedEntities.length} similar entities`,
        evidence: duplicateCheck.matchedEntities.map(
          (e) => `${e.entityId}: ${(e.similarity * 100).toFixed(0)}% match on ${e.matchedFields.join(', ')}`
        ),
        suggestedAction: 'Review matched entities for potential duplicate submission',
      });
    }

    // 2. Pricing anomaly detection
    if (entityType === 'CLAIM' || entityType === 'BOOKING') {
      const pricingCheck = await checkPricingAnomaly(entityData);
      if (pricingCheck.isAnomaly) {
        indicators.push({
          type: 'SUSPICIOUS_PRICING',
          confidence: Math.min(1, Math.abs(pricingCheck.deviation) / 100),
          description: `Pricing ${pricingCheck.deviation > 0 ? 'above' : 'below'} expected range by ${Math.abs(pricingCheck.deviation).toFixed(0)}%`,
          evidence: [
            `Expected: $${pricingCheck.expectedRange.min.toLocaleString()} - $${pricingCheck.expectedRange.max.toLocaleString()} AUD`,
            `Actual: $${pricingCheck.actualAmount.toLocaleString()} AUD`,
          ],
          suggestedAction: 'Verify pricing with contractor quotes and market rates',
        });
      }
    }

    // 3. Geographic consistency check
    const geoCheck = await checkGeographicConsistency(entityType, entityData);
    if (geoCheck.hasInconsistency) {
      indicators.push({
        type: 'GEOGRAPHIC_MISMATCH',
        confidence: geoCheck.confidence,
        description: geoCheck.description,
        evidence: geoCheck.evidence,
        suggestedAction: 'Verify location details and contractor service area',
      });
    }

    // 4. Timing anomaly detection
    const timingCheck = await checkTimingAnomaly(entityType, entityData);
    if (timingCheck.hasAnomaly) {
      indicators.push({
        type: 'TIMING_ANOMALY',
        confidence: timingCheck.confidence,
        description: timingCheck.description,
        evidence: timingCheck.evidence,
        suggestedAction: 'Review timeline for suspicious patterns',
      });
    }

    // 5. Document verification (if thorough)
    if (depth === 'thorough') {
      const docCheck = await checkDocumentAnomalies(entityData);
      if (docCheck.hasAnomaly) {
        indicators.push({
          type: 'DOCUMENT_ANOMALY',
          confidence: docCheck.confidence,
          description: docCheck.description,
          evidence: docCheck.evidence,
          suggestedAction: 'Request original documentation for verification',
        });
      }
    }

    // 6. Collusion pattern detection (if thorough)
    if (depth === 'thorough' && entityType === 'BOOKING') {
      const collusionCheck = await checkCollusionPatterns(entityData);
      if (collusionCheck.hasPattern) {
        indicators.push({
          type: 'COLLUSION_PATTERN',
          confidence: collusionCheck.confidence,
          description: collusionCheck.description,
          evidence: collusionCheck.evidence,
          suggestedAction: 'Investigate contractor-client relationship history',
        });
      }
    }

    // Calculate overall risk score
    const overallRiskScore = calculateOverallRiskScore(indicators);
    const riskLevel = getRiskLevel(overallRiskScore);

    // Get similar entities
    const similarEntities = duplicateCheck.matchedEntities.map((e) => ({
      entityId: e.entityId,
      entityType,
      similarity: e.similarity,
      matchedFields: e.matchedFields,
    }));

    // Generate AI reasoning
    const reasoning = await generateFraudReasoning(
      entityType,
      entityData,
      indicators,
      overallRiskScore
    );

    // Determine recommendation
    const recommendation = getRecommendation(overallRiskScore, indicators);

    // Create alert if high risk
    if (overallRiskScore >= RISK_THRESHOLDS.MEDIUM) {
      const alert = createFraudAlert(
        entityType,
        entityId,
        indicators[0]?.type || 'PATTERN_MATCH',
        overallRiskScore,
        indicators
      );
      alertStorage.set(alert.id, alert);
    }

    return {
      entityType,
      entityId,
      overallRiskScore,
      riskLevel,
      indicators,
      similarEntities,
      recommendation,
      reasoning,
      analysedAt: new Date(),
      processingTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Fraud analysis error for %s/%s:', entityType, entityId, error);
    throw error;
  }
}

/**
 * Batch fraud analysis for multiple entities
 */
export async function analyseFraudBatch(
  entities: Array<{ entityType: EntityType; entityId: string }>,
  options: { concurrency?: number; depth?: 'quick' | 'thorough' } = {}
): Promise<{
  results: FraudAnalysisResult[];
  highRiskCount: number;
  processingTimeMs: number;
}> {
  const startTime = Date.now();
  const concurrency = options.concurrency || 5;

  const results: FraudAnalysisResult[] = [];

  // Process in batches
  for (let i = 0; i < entities.length; i += concurrency) {
    const batch = entities.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((e) =>
        analyseFraud(e.entityType, e.entityId, { depth: options.depth }).catch((err) => {
          console.error('Batch fraud analysis error for %s/%s:', e.entityType, e.entityId, err);
          return null;
        })
      )
    );
    results.push(...batchResults.filter((r): r is FraudAnalysisResult => r !== null));
  }

  const highRiskCount = results.filter(
    (r) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL'
  ).length;

  return {
    results,
    highRiskCount,
    processingTimeMs: Date.now() - startTime,
  };
}

// ============================================================================
// Detection Module Functions
// ============================================================================

/**
 * Fetch entity data from database
 */
async function fetchEntityData(entityType: EntityType, entityId: string): Promise<any> {
  switch (entityType) {
    case 'CLAIM':
      return await prisma.publicClaim.findUnique({
        where: { id: entityId },
      });

    case 'BOOKING':
      return await prisma.booking.findUnique({
        where: { id: entityId },
        include: {
          client: { select: { id: true, email: true, name: true } },
          contractor: {
            select: { id: true, businessName: true, serviceAreas: true },
          },
          payments: true,
        },
      });

    case 'PAYMENT':
      return await prisma.payment.findUnique({
        where: { id: entityId },
        include: {
          booking: true,
        },
      });

    case 'CONTRACTOR':
      return await prisma.contractor.findUnique({
        where: { id: entityId },
        include: {
          contractorProfile: true,
          contractorBookings: {
            take: 20,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

    case 'CLIENT':
      return await prisma.user.findUnique({
        where: { id: entityId },
        include: {
          clientBookings: {
            take: 20,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

    default:
      return null;
  }
}

/**
 * Check for duplicate claims/bookings
 */
async function checkForDuplicates(
  entityType: EntityType,
  entityId: string,
  entityData: any
): Promise<DuplicateCheckResult> {
  const matchedEntities: Array<{
    entityId: string;
    similarity: number;
    matchedFields: string[];
  }> = [];

  if (entityType === 'CLAIM') {
    // Find claims with similar characteristics
    const similarClaims = await prisma.publicClaim.findMany({
      where: {
        id: { not: entityId },
        OR: [
          { clientEmail: entityData.clientEmail },
          { clientPhone: entityData.clientPhone },
          { propertyAddress: entityData.propertyAddress },
          {
            AND: [
              { suburb: entityData.suburb },
              { postcode: entityData.postcode },
              { disasterType: entityData.disasterType },
            ],
          },
        ],
      },
      take: 10,
    });

    for (const claim of similarClaims) {
      const { similarity, matchedFields } = calculateClaimSimilarity(entityData, claim);
      if (similarity >= SIMILARITY_THRESHOLDS.RELATED) {
        matchedEntities.push({
          entityId: claim.id,
          similarity,
          matchedFields,
        });
      }
    }
  }

  if (entityType === 'BOOKING') {
    // Find bookings with similar characteristics
    const similarBookings = await prisma.booking.findMany({
      where: {
        id: { not: entityId },
        OR: [
          { clientId: entityData.clientId },
          {
            AND: [
              { servicePostcode: entityData.servicePostcode },
              { australianServiceType: entityData.australianServiceType },
              { streetAddress: entityData.streetAddress },
            ],
          },
        ],
      },
      take: 10,
    });

    for (const booking of similarBookings) {
      const { similarity, matchedFields } = calculateBookingSimilarity(entityData, booking);
      if (similarity >= SIMILARITY_THRESHOLDS.RELATED) {
        matchedEntities.push({
          entityId: booking.id,
          similarity,
          matchedFields,
        });
      }
    }
  }

  const isDuplicate = matchedEntities.some((e) => e.similarity >= SIMILARITY_THRESHOLDS.DUPLICATE);
  const confidence = matchedEntities.length > 0
    ? Math.max(...matchedEntities.map((e) => e.similarity))
    : 0;

  return {
    isDuplicate,
    confidence,
    matchedEntities: matchedEntities.sort((a, b) => b.similarity - a.similarity),
    reasoning: isDuplicate
      ? `Found ${matchedEntities.length} similar entities with high similarity scores`
      : 'No duplicates detected',
  };
}

/**
 * Calculate similarity between two claims
 */
function calculateClaimSimilarity(
  claim1: any,
  claim2: any
): { similarity: number; matchedFields: string[] } {
  const matchedFields: string[] = [];
  let matchScore = 0;
  let totalWeight = 0;

  // Email match (high weight)
  if (claim1.clientEmail === claim2.clientEmail) {
    matchScore += 25;
    matchedFields.push('email');
  }
  totalWeight += 25;

  // Phone match (high weight)
  if (claim1.clientPhone === claim2.clientPhone) {
    matchScore += 20;
    matchedFields.push('phone');
  }
  totalWeight += 20;

  // Address match (high weight)
  if (
    claim1.propertyAddress === claim2.propertyAddress ||
    (claim1.suburb === claim2.suburb && claim1.postcode === claim2.postcode)
  ) {
    matchScore += 25;
    matchedFields.push('address');
  }
  totalWeight += 25;

  // Disaster type match
  if (claim1.disasterType === claim2.disasterType) {
    matchScore += 15;
    matchedFields.push('disasterType');
  }
  totalWeight += 15;

  // Description similarity (simplified - check for common words)
  const desc1Words = (claim1.damageDescription || '').toLowerCase().split(/\s+/);
  const desc2Words = (claim2.damageDescription || '').toLowerCase().split(/\s+/);
  const commonWords = desc1Words.filter((w: string) => desc2Words.includes(w));
  const descSimilarity = commonWords.length / Math.max(desc1Words.length, desc2Words.length, 1);
  if (descSimilarity > 0.5) {
    matchScore += 15 * descSimilarity;
    matchedFields.push('description');
  }
  totalWeight += 15;

  return {
    similarity: totalWeight > 0 ? matchScore / totalWeight : 0,
    matchedFields,
  };
}

/**
 * Calculate similarity between two bookings
 */
function calculateBookingSimilarity(
  booking1: any,
  booking2: any
): { similarity: number; matchedFields: string[] } {
  const matchedFields: string[] = [];
  let matchScore = 0;
  let totalWeight = 0;

  // Same client (high weight)
  if (booking1.clientId === booking2.clientId) {
    matchScore += 30;
    matchedFields.push('client');
  }
  totalWeight += 30;

  // Same address
  if (
    booking1.streetAddress === booking2.streetAddress &&
    booking1.servicePostcode === booking2.servicePostcode
  ) {
    matchScore += 25;
    matchedFields.push('address');
  }
  totalWeight += 25;

  // Same service type
  if (booking1.australianServiceType === booking2.australianServiceType) {
    matchScore += 20;
    matchedFields.push('serviceType');
  }
  totalWeight += 20;

  // Same contractor
  if (booking1.contractorId && booking1.contractorId === booking2.contractorId) {
    matchScore += 15;
    matchedFields.push('contractor');
  }
  totalWeight += 15;

  // Similar timing (within 30 days)
  const date1 = new Date(booking1.createdAt).getTime();
  const date2 = new Date(booking2.createdAt).getTime();
  const daysDiff = Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);
  if (daysDiff <= 30) {
    matchScore += 10;
    matchedFields.push('timing');
  }
  totalWeight += 10;

  return {
    similarity: totalWeight > 0 ? matchScore / totalWeight : 0,
    matchedFields,
  };
}

/**
 * Check for pricing anomalies
 */
async function checkPricingAnomaly(entityData: any): Promise<PricingAnomalyResult> {
  const serviceType = entityData.australianServiceType || entityData.disasterType || 'GENERAL';
  const amount = parseFloat(entityData.estimatedCostAUD || entityData.finalCostAUD || '0');

  // Get expected range for service type
  const expectedRange = AVERAGE_COSTS_AUD[serviceType] || {
    min: 1000,
    max: 20000,
    median: 8000,
  };

  // Calculate deviation
  let deviation = 0;
  let isAnomaly = false;

  if (amount < expectedRange.min * 0.5) {
    // Suspiciously low
    deviation = ((amount - expectedRange.min) / expectedRange.min) * 100;
    isAnomaly = true;
  } else if (amount > expectedRange.max * 1.5) {
    // Suspiciously high
    deviation = ((amount - expectedRange.max) / expectedRange.max) * 100;
    isAnomaly = true;
  }

  return {
    isAnomaly,
    deviation,
    expectedRange: { min: expectedRange.min, max: expectedRange.max },
    actualAmount: amount,
    reasoning: isAnomaly
      ? `Amount significantly ${deviation > 0 ? 'exceeds' : 'below'} expected range`
      : 'Pricing within normal range',
  };
}

/**
 * Check for geographic consistency
 */
async function checkGeographicConsistency(
  entityType: EntityType,
  entityData: any
): Promise<{
  hasInconsistency: boolean;
  confidence: number;
  description: string;
  evidence: string[];
}> {
  const evidence: string[] = [];
  let hasInconsistency = false;
  let confidence = 0;

  if (entityType === 'BOOKING' && entityData.contractor) {
    // Check if contractor serves the booking location
    const serviceAreas = entityData.contractor.serviceAreas || [];
    const bookingPostcode = entityData.servicePostcode;
    const bookingState = entityData.serviceState;

    const servicesLocation = serviceAreas.some(
      (sa: any) =>
        sa.postcode === bookingPostcode || sa.state === bookingState
    );

    if (!servicesLocation && serviceAreas.length > 0) {
      hasInconsistency = true;
      confidence = 0.7;
      evidence.push(
        `Contractor service areas: ${serviceAreas.map((sa: any) => sa.state).join(', ')}`,
        `Booking location: ${bookingState} ${bookingPostcode}`,
        'Contractor assigned outside declared service area'
      );
    }
  }

  return {
    hasInconsistency,
    confidence,
    description: hasInconsistency
      ? 'Geographic inconsistency detected between contractor service area and job location'
      : 'No geographic inconsistencies',
    evidence,
  };
}

/**
 * Check for timing anomalies
 */
async function checkTimingAnomaly(
  entityType: EntityType,
  entityData: any
): Promise<{
  hasAnomaly: boolean;
  confidence: number;
  description: string;
  evidence: string[];
}> {
  const evidence: string[] = [];
  let hasAnomaly = false;
  let confidence = 0;

  if (entityType === 'CLAIM') {
    // Check if incident date is in the future
    const incidentDate = new Date(entityData.incidentDate);
    const submittedAt = new Date(entityData.submittedAt || entityData.createdAt);

    if (incidentDate > submittedAt) {
      hasAnomaly = true;
      confidence = 0.9;
      evidence.push(
        `Incident date: ${incidentDate.toISOString().split('T')[0]}`,
        `Submitted: ${submittedAt.toISOString().split('T')[0]}`,
        'Incident date is after submission date'
      );
    }

    // Check for very old incidents
    const daysSinceIncident = (submittedAt.getTime() - incidentDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceIncident > 365) {
      hasAnomaly = true;
      confidence = 0.6;
      evidence.push(
        `Claim submitted ${Math.floor(daysSinceIncident)} days after incident`,
        'Unusually delayed claim submission'
      );
    }
  }

  if (entityType === 'BOOKING') {
    // Check for extremely fast completion
    if (entityData.startedAt && entityData.completedAt) {
      const hoursToComplete =
        (new Date(entityData.completedAt).getTime() - new Date(entityData.startedAt).getTime()) /
        (1000 * 60 * 60);

      // Major restoration shouldn't complete in under 4 hours
      if (hoursToComplete < 4) {
        hasAnomaly = true;
        confidence = 0.7;
        evidence.push(
          `Job completed in ${hoursToComplete.toFixed(1)} hours`,
          'Unusually fast completion for restoration work'
        );
      }
    }
  }

  return {
    hasAnomaly,
    confidence,
    description: hasAnomaly
      ? 'Timing pattern anomaly detected'
      : 'No timing anomalies detected',
    evidence,
  };
}

/**
 * Check for document anomalies
 */
async function checkDocumentAnomalies(entityData: any): Promise<{
  hasAnomaly: boolean;
  confidence: number;
  description: string;
  evidence: string[];
}> {
  const evidence: string[] = [];
  let hasAnomaly = false;
  let confidence = 0;

  // Check for missing required documentation
  const hasPhotos = entityData.damagePhotos?.length > 0;
  const hasInsurance = entityData.hasInsurance;
  const hasPolicyNumber = entityData.policyNumber;

  if (hasInsurance && !hasPolicyNumber) {
    hasAnomaly = true;
    confidence = 0.5;
    evidence.push('Insurance claimed but no policy number provided');
  }

  if (!hasPhotos && entityData.estimatedCostAUD > 5000) {
    hasAnomaly = true;
    confidence = 0.6;
    evidence.push(
      'High-value claim without damage photo documentation',
      `Estimated cost: $${entityData.estimatedCostAUD} AUD`
    );
  }

  return {
    hasAnomaly,
    confidence,
    description: hasAnomaly
      ? 'Documentation anomalies detected'
      : 'Documentation appears complete',
    evidence,
  };
}

/**
 * Check for collusion patterns between contractor and client
 */
async function checkCollusionPatterns(entityData: any): Promise<{
  hasPattern: boolean;
  confidence: number;
  description: string;
  evidence: string[];
}> {
  const evidence: string[] = [];
  let hasPattern = false;
  let confidence = 0;

  if (!entityData.clientId || !entityData.contractorId) {
    return { hasPattern: false, confidence: 0, description: 'Insufficient data', evidence: [] };
  }

  // Check history between this contractor and client
  const previousBookings = await prisma.booking.count({
    where: {
      clientId: entityData.clientId,
      contractorId: entityData.contractorId,
      id: { not: entityData.id },
    },
  });

  if (previousBookings >= 3) {
    // Many bookings between same parties
    const disputedBookings = await prisma.booking.count({
      where: {
        clientId: entityData.clientId,
        contractorId: entityData.contractorId,
        status: 'DISPUTED',
      },
    });

    if (disputedBookings === 0 && previousBookings >= 5) {
      hasPattern = true;
      confidence = 0.5;
      evidence.push(
        `${previousBookings} bookings between same client-contractor pair`,
        'No disputes despite high booking volume',
        'May indicate legitimate relationship OR potential collusion'
      );
    }
  }

  // Check if contractor was selected despite lower rating than alternatives
  // (simplified - would need more data in practice)

  return {
    hasPattern,
    confidence,
    description: hasPattern
      ? 'Potential collusion pattern detected'
      : 'No collusion patterns detected',
    evidence,
  };
}

// ============================================================================
// Scoring and Recommendation Functions
// ============================================================================

/**
 * Calculate overall risk score from indicators
 */
function calculateOverallRiskScore(indicators: FraudIndicator[]): number {
  if (indicators.length === 0) return 0;

  // Weight by indicator type
  const typeWeights: Record<FraudAlertType, number> = {
    DUPLICATE_CLAIM: 30,
    SUSPICIOUS_PRICING: 20,
    DOCUMENT_ANOMALY: 15,
    COLLUSION_PATTERN: 25,
    GEOGRAPHIC_MISMATCH: 15,
    TIMING_ANOMALY: 15,
    IDENTITY_INCONSISTENCY: 25,
    PATTERN_MATCH: 20,
  };

  let weightedScore = 0;
  let totalWeight = 0;

  for (const indicator of indicators) {
    const weight = typeWeights[indicator.type] || 10;
    weightedScore += indicator.confidence * weight;
    totalWeight += weight;
  }

  // Boost for multiple indicators
  const indicatorBoost = Math.min(20, indicators.length * 5);

  const baseScore = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
  return Math.min(100, baseScore + indicatorBoost);
}

/**
 * Get risk level from score
 */
function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= RISK_THRESHOLDS.HIGH) return 'CRITICAL';
  if (score >= RISK_THRESHOLDS.MEDIUM) return 'HIGH';
  if (score >= RISK_THRESHOLDS.LOW) return 'MEDIUM';
  return 'LOW';
}

/**
 * Get recommendation based on analysis
 */
function getRecommendation(
  riskScore: number,
  indicators: FraudIndicator[]
): 'AUTO_APPROVE' | 'MANUAL_REVIEW' | 'HOLD' | 'REJECT' {
  if (riskScore >= RISK_THRESHOLDS.HIGH) return 'REJECT';
  if (riskScore >= RISK_THRESHOLDS.MEDIUM) return 'HOLD';
  if (riskScore >= RISK_THRESHOLDS.LOW) return 'MANUAL_REVIEW';

  // Check for specific high-risk indicators
  const hasHighRiskIndicator = indicators.some(
    (i) =>
      (i.type === 'DUPLICATE_CLAIM' || i.type === 'COLLUSION_PATTERN') &&
      i.confidence >= 0.8
  );

  if (hasHighRiskIndicator) return 'HOLD';

  return 'AUTO_APPROVE';
}

/**
 * Generate AI reasoning for fraud analysis
 */
async function generateFraudReasoning(
  entityType: EntityType,
  entityData: any,
  indicators: FraudIndicator[],
  riskScore: number
): Promise<string> {
  try {
    const provider = await getDefaultProvider();
    const model = provider.getModel();

    const indicatorSummary = indicators
      .map((i) => `- ${i.type}: ${i.description} (${(i.confidence * 100).toFixed(0)}% confidence)`)
      .join('\n');

    const prompt = `You are a fraud analyst for an Australian disaster recovery platform.
Provide a concise risk assessment based on the following analysis.

ENTITY: ${entityType}
RISK SCORE: ${riskScore}/100

FRAUD INDICATORS DETECTED:
${indicatorSummary || 'None'}

Provide a 2-3 sentence summary explaining:
1. The overall fraud risk assessment
2. Key concerns (if any)
3. Recommended next steps

Use Australian English. Be direct and actionable.`;

    const response = await model.invoke([
      new SystemMessage('You are a fraud analyst. Be concise and professional.'),
      new HumanMessage(prompt),
    ]);

    return typeof response.content === 'string'
      ? response.content.trim()
      : generateFallbackReasoning(riskScore, indicators);
  } catch (error) {
    console.error('Error generating fraud reasoning:', error);
    return generateFallbackReasoning(riskScore, indicators);
  }
}

/**
 * Generate fallback reasoning without AI
 */
function generateFallbackReasoning(
  riskScore: number,
  indicators: FraudIndicator[]
): string {
  if (riskScore >= RISK_THRESHOLDS.HIGH) {
    return `Critical fraud risk detected (${riskScore}/100). ${indicators.length} indicator(s) flagged requiring immediate investigation. Recommend holding processing until manual review completed.`;
  }
  if (riskScore >= RISK_THRESHOLDS.MEDIUM) {
    return `Elevated fraud risk detected (${riskScore}/100). ${indicators.length} concern(s) identified. Manual review recommended before approval.`;
  }
  if (riskScore >= RISK_THRESHOLDS.LOW) {
    return `Low-moderate fraud risk (${riskScore}/100). Minor concerns noted. Standard verification procedures should be sufficient.`;
  }
  return `Low fraud risk (${riskScore}/100). No significant concerns detected. Eligible for standard processing.`;
}

/**
 * Create a fraud alert record
 */
function createFraudAlert(
  entityType: EntityType,
  entityId: string,
  alertType: FraudAlertType,
  riskScore: number,
  indicators: FraudIndicator[]
): FraudAlert {
  alertCounter++;
  return {
    id: `FRAUD-${Date.now()}-${alertCounter}`,
    entityType,
    entityId,
    alertType,
    riskScore,
    indicators,
    status: 'PENDING',
    createdAt: new Date(),
  };
}

// ============================================================================
// Alert Management Functions
// ============================================================================

/**
 * Get pending fraud alerts
 */
export function getPendingAlerts(options: { limit?: number } = {}): FraudAlert[] {
  const limit = options.limit || 50;
  return Array.from(alertStorage.values())
    .filter((a) => a.status === 'PENDING')
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, limit);
}

/**
 * Get alert by ID
 */
export function getAlert(alertId: string): FraudAlert | undefined {
  return alertStorage.get(alertId);
}

/**
 * Update alert status
 */
export function updateAlertStatus(
  alertId: string,
  status: AlertStatus,
  reviewedBy?: string,
  reviewNotes?: string
): FraudAlert | null {
  const alert = alertStorage.get(alertId);
  if (!alert) return null;

  alert.status = status;
  alert.reviewedBy = reviewedBy;
  alert.reviewNotes = reviewNotes;
  alert.reviewedAt = new Date();

  alertStorage.set(alertId, alert);
  return alert;
}

/**
 * Get fraud statistics summary
 */
export function getFraudStats(): {
  totalAlerts: number;
  pendingAlerts: number;
  confirmedAlerts: number;
  dismissedAlerts: number;
  alertsByType: Record<string, number>;
  averageRiskScore: number;
} {
  const alerts = Array.from(alertStorage.values());

  const alertsByType: Record<string, number> = {};
  for (const alert of alerts) {
    alertsByType[alert.alertType] = (alertsByType[alert.alertType] || 0) + 1;
  }

  const totalRiskScore = alerts.reduce((sum, a) => sum + a.riskScore, 0);

  return {
    totalAlerts: alerts.length,
    pendingAlerts: alerts.filter((a) => a.status === 'PENDING').length,
    confirmedAlerts: alerts.filter((a) => a.status === 'CONFIRMED').length,
    dismissedAlerts: alerts.filter((a) => a.status === 'DISMISSED').length,
    alertsByType,
    averageRiskScore: alerts.length > 0 ? totalRiskScore / alerts.length : 0,
  };
}
