// @ts-nocheck

/**
 * Predictive Dispute Prevention Service
 *
 * Phase C.3: Predicts dispute likelihood BEFORE job completion and suggests
 * preemptive interventions to prevent issues.
 *
 * Features:
 * - Dispute risk scoring based on multiple factors
 * - Contractor quality pattern analysis
 * - Client history evaluation
 * - Job complexity vs contractor experience matching
 * - Communication frequency analysis
 * - Preemptive intervention suggestions
 * - Auto-triggered quality checks for high-risk jobs
 */

import { prisma } from '@/lib/prisma';
import { getDefaultProvider } from '@/lib/agents/providers';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface DisputeRiskFactors {
  // Contractor factors
  contractorDisputeHistory: number; // 0-1, past dispute rate
  contractorSatisfactionTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  contractorExperienceLevel: 'NEW' | 'INTERMEDIATE' | 'EXPERIENCED' | 'EXPERT';
  contractorWorkloadRisk: number; // 0-1, overloaded contractors have higher risk
  contractorResponseDelays: number; // Average delay in hours

  // Client factors
  clientPastDisputes: number; // Count of previous disputes
  clientExpectationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  clientCommunicationStyle: 'MINIMAL' | 'NORMAL' | 'FREQUENT' | 'EXCESSIVE';
  isFirstTimeClient: boolean;
  clientPaymentHistory: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

  // Job factors
  jobComplexityScore: number; // 0-100
  estimateAccuracyRisk: number; // 0-1, risk of cost overrun
  timelinePressure: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scopeCreepRisk: number; // 0-1
  seasonalRisk: number; // 0-1, busy seasons have higher risk

  // Relationship factors
  contractorClientHistory: 'NEW' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  communicationGapDays: number; // Days since last communication
  milestonesMissed: number; // Count of missed milestones
  changeRequestCount: number; // Count of scope changes
  paymentDelays: number; // Count of late payments
}

export interface DisputePrediction {
  bookingId: string;
  riskScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number; // 0-1
  factors: DisputeRiskFactors;
  riskBreakdown: {
    contractorRisk: number;
    clientRisk: number;
    jobRisk: number;
    relationshipRisk: number;
  };
  primaryRiskFactors: string[];
  interventions: Intervention[];
  qualityChecksRequired: QualityCheck[];
  reasoning: string;
  predictedAt: Date;
  processingTimeMs: number;
}

export interface Intervention {
  id: string;
  type: InterventionType;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  title: string;
  description: string;
  suggestedAction: string;
  automatable: boolean;
  estimatedImpact: number; // Expected risk reduction percentage
}

export type InterventionType =
  | 'COMMUNICATION'
  | 'QUALITY_CHECK'
  | 'PAYMENT_REVIEW'
  | 'SCOPE_CLARIFICATION'
  | 'TIMELINE_ADJUSTMENT'
  | 'MANAGEMENT_ESCALATION'
  | 'CLIENT_EXPECTATION'
  | 'CONTRACTOR_SUPPORT';

export interface QualityCheck {
  id: string;
  type: QualityCheckType;
  stage: 'PRE_START' | 'DURING' | 'PRE_COMPLETION' | 'POST_COMPLETION';
  description: string;
  requiredBy: string;
  autoTriggered: boolean;
}

export type QualityCheckType =
  | 'PHOTO_DOCUMENTATION'
  | 'CLIENT_CONFIRMATION'
  | 'INSPECTOR_REVIEW'
  | 'SCOPE_VERIFICATION'
  | 'COST_AUDIT'
  | 'TIMELINE_CHECK'
  | 'SATISFACTION_SURVEY';

// ============================================================================
// Constants
// ============================================================================

// Risk weights (total = 100)
const RISK_WEIGHTS = {
  contractor: 30,
  client: 25,
  job: 25,
  relationship: 20,
};

// Risk thresholds
const RISK_THRESHOLDS = {
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
  CRITICAL: 100,
};

// Auto-trigger quality check threshold
const AUTO_QUALITY_CHECK_THRESHOLD = 60;

// Australian disaster recovery context
const SEASONAL_RISK_FACTORS: Record<string, Record<string, number>> = {
  STORM_DAMAGE: {
    SUMMER: 0.8,
    AUTUMN: 0.4,
    WINTER: 0.3,
    SPRING: 0.6,
  },
  FLOOD_DAMAGE: {
    SUMMER: 0.7,
    AUTUMN: 0.5,
    WINTER: 0.3,
    SPRING: 0.5,
  },
  FIRE_DAMAGE: {
    SUMMER: 0.9,
    AUTUMN: 0.4,
    WINTER: 0.2,
    SPRING: 0.6,
  },
  WATER_DAMAGE: {
    SUMMER: 0.5,
    AUTUMN: 0.5,
    WINTER: 0.6,
    SPRING: 0.5,
  },
  MOULD_REMEDIATION: {
    SUMMER: 0.6,
    AUTUMN: 0.7,
    WINTER: 0.5,
    SPRING: 0.6,
  },
};

// ============================================================================
// Core Prediction Functions
// ============================================================================

/**
 * Predict dispute risk for a booking
 */
export async function predictDisputeRisk(bookingId: string): Promise<DisputePrediction> {
  const startTime = Date.now();

  try {
    // Fetch booking with related data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: {
          include: {
            clientBookings: {
              include: {
                ratings: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 20,
            },
          },
        },
        contractor: {
          include: {
            contractorProfile: true,
            contractorBookings: {
              include: {
                ratings: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 50,
            },
          },
        },
        payments: true,
        ratings: true,
      },
    });

    if (!booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    // Calculate all risk factors
    const factors = await calculateRiskFactors(booking);

    // Calculate risk breakdown
    const riskBreakdown = calculateRiskBreakdown(factors);

    // Calculate overall risk score
    const riskScore = calculateOverallRiskScore(riskBreakdown);

    // Determine risk level
    const riskLevel = getRiskLevel(riskScore);

    // Identify primary risk factors
    const primaryRiskFactors = identifyPrimaryRisks(factors);

    // Generate interventions
    const interventions = generateInterventions(factors, riskLevel, booking);

    // Determine required quality checks
    const qualityChecksRequired = determineQualityChecks(
      factors,
      riskScore,
      booking
    );

    // Generate AI reasoning
    const reasoning = await generateReasoning(
      booking,
      factors,
      riskScore,
      primaryRiskFactors
    );

    // Calculate confidence
    const confidence = calculateConfidence(booking, factors);

    return {
      bookingId,
      riskScore,
      riskLevel,
      confidence,
      factors,
      riskBreakdown,
      primaryRiskFactors,
      interventions,
      qualityChecksRequired,
      reasoning,
      predictedAt: new Date(),
      processingTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Dispute prediction error for booking %s:', bookingId, error);
    throw error;
  }
}

/**
 * Batch predict dispute risk for multiple bookings
 */
export async function predictDisputeRiskBatch(
  bookingIds: string[],
  options: { concurrency?: number } = {}
): Promise<{
  predictions: DisputePrediction[];
  highRiskCount: number;
  averageRiskScore: number;
  processingTimeMs: number;
}> {
  const startTime = Date.now();
  const concurrency = options.concurrency || 5;

  const predictions: DisputePrediction[] = [];

  // Process in batches
  for (let i = 0; i < bookingIds.length; i += concurrency) {
    const batch = bookingIds.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((id) =>
        predictDisputeRisk(id).catch((err) => {
          console.error('Error predicting for %s:', id, err);
          return null;
        })
      )
    );
    predictions.push(
      ...batchResults.filter((p): p is DisputePrediction => p !== null)
    );
  }

  const highRiskCount = predictions.filter(
    (p) => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL'
  ).length;

  const averageRiskScore =
    predictions.length > 0
      ? predictions.reduce((sum, p) => sum + p.riskScore, 0) / predictions.length
      : 0;

  return {
    predictions,
    highRiskCount,
    averageRiskScore: Math.round(averageRiskScore * 10) / 10,
    processingTimeMs: Date.now() - startTime,
  };
}

/**
 * Get at-risk bookings for proactive intervention
 */
export async function getAtRiskBookings(options: {
  minRiskScore?: number;
  status?: string[];
  limit?: number;
}): Promise<{
  bookings: Array<{
    bookingId: string;
    clientName: string;
    contractorName: string;
    serviceType: string;
    riskScore: number;
    riskLevel: string;
    primaryRisks: string[];
    daysSinceStart: number;
  }>;
  totalCount: number;
}> {
  const minRisk = options.minRiskScore ?? 50;
  const limit = options.limit ?? 20;
  const statusFilter = options.status ?? ['IN_PROGRESS', 'CONFIRMED'];

  // Fetch active bookings
  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: statusFilter as any[] },
    },
    include: {
      client: { select: { name: true, email: true } },
      contractor: { select: { businessName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit * 2, // Fetch more to filter
  });

  // Calculate risk for each booking
  const riskyBookings = [];
  for (const booking of bookings) {
    try {
      const prediction = await predictDisputeRisk(booking.id);

      if (prediction.riskScore >= minRisk) {
        const daysSinceStart = booking.startedAt
          ? Math.floor(
              (Date.now() - booking.startedAt.getTime()) / (1000 * 60 * 60 * 24)
            )
          : 0;

        riskyBookings.push({
          bookingId: booking.id,
          clientName: booking.client?.name || 'Unknown',
          contractorName: booking.contractor?.businessName || 'Unassigned',
          serviceType: booking.australianServiceType,
          riskScore: prediction.riskScore,
          riskLevel: prediction.riskLevel,
          primaryRisks: prediction.primaryRiskFactors.slice(0, 3),
          daysSinceStart,
        });
      }

      if (riskyBookings.length >= limit) break;
    } catch (error) {
      // Skip bookings that fail prediction
    }
  }

  // Sort by risk score descending
  riskyBookings.sort((a, b) => b.riskScore - a.riskScore);

  return {
    bookings: riskyBookings.slice(0, limit),
    totalCount: riskyBookings.length,
  };
}

// ============================================================================
// Risk Factor Calculation Functions
// ============================================================================

/**
 * Calculate all risk factors for a booking
 */
async function calculateRiskFactors(booking: any): Promise<DisputeRiskFactors> {
  const contractorFactors = calculateContractorFactors(booking);
  const clientFactors = calculateClientFactors(booking);
  const jobFactors = calculateJobFactors(booking);
  const relationshipFactors = await calculateRelationshipFactors(booking);

  return {
    ...contractorFactors,
    ...clientFactors,
    ...jobFactors,
    ...relationshipFactors,
  };
}

/**
 * Calculate contractor-related risk factors
 */
function calculateContractorFactors(booking: any): {
  contractorDisputeHistory: number;
  contractorSatisfactionTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  contractorExperienceLevel: 'NEW' | 'INTERMEDIATE' | 'EXPERIENCED' | 'EXPERT';
  contractorWorkloadRisk: number;
  contractorResponseDelays: number;
} {
  const contractor = booking.contractor;

  if (!contractor) {
    return {
      contractorDisputeHistory: 0.5,
      contractorSatisfactionTrend: 'STABLE',
      contractorExperienceLevel: 'NEW',
      contractorWorkloadRisk: 0.5,
      contractorResponseDelays: 24,
    };
  }

  const pastBookings = contractor.contractorBookings || [];
  const disputedBookings = pastBookings.filter(
    (b: any) => b.status === 'DISPUTED'
  ).length;
  const totalBookings = pastBookings.length;

  // Dispute history (0-1)
  const contractorDisputeHistory =
    totalBookings > 0 ? Math.min(1, disputedBookings / totalBookings) : 0.1;

  // Satisfaction trend
  const ratings = pastBookings
    .flatMap((b: any) => b.ratings?.map((r: any) => r.rating) || [])
    .filter((r: number | null) => r !== null);

  let contractorSatisfactionTrend: 'IMPROVING' | 'STABLE' | 'DECLINING' = 'STABLE';
  if (ratings.length >= 4) {
    const recentAvg =
      ratings.slice(0, 2).reduce((a: number, b: number) => a + b, 0) / 2;
    const olderAvg =
      ratings.slice(-2).reduce((a: number, b: number) => a + b, 0) / 2;
    if (recentAvg > olderAvg + 0.3) contractorSatisfactionTrend = 'IMPROVING';
    if (recentAvg < olderAvg - 0.3) contractorSatisfactionTrend = 'DECLINING';
  }

  // Experience level
  const completedJobs = contractor.contractorProfile?.completedJobs || 0;
  let contractorExperienceLevel: 'NEW' | 'INTERMEDIATE' | 'EXPERIENCED' | 'EXPERT';
  if (completedJobs < 10) contractorExperienceLevel = 'NEW';
  else if (completedJobs < 50) contractorExperienceLevel = 'INTERMEDIATE';
  else if (completedJobs < 200) contractorExperienceLevel = 'EXPERIENCED';
  else contractorExperienceLevel = 'EXPERT';

  // Workload risk (estimate based on active bookings)
  const activeBookings = pastBookings.filter(
    (b: any) => b.status === 'IN_PROGRESS' || b.status === 'CONFIRMED'
  ).length;
  const maxCapacity = 8; // Assumed max concurrent jobs
  const contractorWorkloadRisk = Math.min(1, activeBookings / maxCapacity);

  // Response delays
  const avgResponseTime =
    contractor.contractorProfile?.averageResponseTimeMinutes || 60;
  const contractorResponseDelays = avgResponseTime / 60; // Convert to hours

  return {
    contractorDisputeHistory,
    contractorSatisfactionTrend,
    contractorExperienceLevel,
    contractorWorkloadRisk,
    contractorResponseDelays,
  };
}

/**
 * Calculate client-related risk factors
 */
function calculateClientFactors(booking: any): {
  clientPastDisputes: number;
  clientExpectationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  clientCommunicationStyle: 'MINIMAL' | 'NORMAL' | 'FREQUENT' | 'EXCESSIVE';
  isFirstTimeClient: boolean;
  clientPaymentHistory: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
} {
  const client = booking.client;

  if (!client) {
    return {
      clientPastDisputes: 0,
      clientExpectationRisk: 'MEDIUM',
      clientCommunicationStyle: 'NORMAL',
      isFirstTimeClient: true,
      clientPaymentHistory: 'GOOD',
    };
  }

  const pastBookings = client.clientBookings || [];
  const disputedBookings = pastBookings.filter(
    (b: any) => b.status === 'DISPUTED'
  );

  // Past disputes count
  const clientPastDisputes = disputedBookings.length;

  // First time client
  const isFirstTimeClient = pastBookings.length <= 1;

  // Expectation risk based on past ratings given
  const ratingsGiven = pastBookings
    .flatMap((b: any) => b.ratings?.map((r: any) => r.rating) || [])
    .filter((r: number | null): r is number => r !== null);
  const avgRatingGiven =
    ratingsGiven.length > 0
      ? ratingsGiven.reduce((a, b) => a + b, 0) / ratingsGiven.length
      : 3.5;

  let clientExpectationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  if (avgRatingGiven >= 4.5) clientExpectationRisk = 'LOW';
  else if (avgRatingGiven >= 3.5) clientExpectationRisk = 'MEDIUM';
  else clientExpectationRisk = 'HIGH';

  // Communication style (placeholder - would need message data)
  const clientCommunicationStyle: 'MINIMAL' | 'NORMAL' | 'FREQUENT' | 'EXCESSIVE' =
    'NORMAL';

  // Payment history (placeholder - would need payment data)
  let clientPaymentHistory: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' = 'GOOD';
  if (isFirstTimeClient) clientPaymentHistory = 'GOOD';

  return {
    clientPastDisputes,
    clientExpectationRisk,
    clientCommunicationStyle,
    isFirstTimeClient,
    clientPaymentHistory,
  };
}

/**
 * Calculate job-related risk factors
 */
function calculateJobFactors(booking: any): {
  jobComplexityScore: number;
  estimateAccuracyRisk: number;
  timelinePressure: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scopeCreepRisk: number;
  seasonalRisk: number;
} {
  // Job complexity based on service type and cost
  const serviceType = booking.australianServiceType || '';
  const estimatedCost = parseFloat(booking.estimatedCostAUD) || 0;

  // Complexity scoring
  const complexityByService: Record<string, number> = {
    WATER_DAMAGE: 60,
    FIRE_DAMAGE: 85,
    STORM_DAMAGE: 70,
    FLOOD_DAMAGE: 75,
    MOULD_REMEDIATION: 65,
    BIOHAZARD: 90,
    HOARDING: 80,
    TRAUMA_CLEANING: 85,
    CONTENT_RESTORATION: 55,
    STRUCTURAL_DRYING: 70,
    DEFAULT: 50,
  };
  const baseComplexity = complexityByService[serviceType] || complexityByService.DEFAULT;

  // Adjust for cost (higher cost = more complex)
  const costComplexity = Math.min(20, (estimatedCost / 50000) * 20);
  const jobComplexityScore = Math.min(100, baseComplexity + costComplexity);

  // Estimate accuracy risk (higher cost = more risk of overrun)
  const estimateAccuracyRisk = Math.min(1, estimatedCost / 100000);

  // Timeline pressure
  const urgency = booking.emergencyResponseLevel || 'STANDARD';
  const timelinePressure: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = {
    STANDARD: 'LOW',
    PRIORITY: 'MEDIUM',
    URGENT: 'HIGH',
    EMERGENCY: 'CRITICAL',
    SAME_DAY: 'CRITICAL',
    NEXT_DAY: 'HIGH',
    WITHIN_48_HOURS: 'MEDIUM',
    WITHIN_WEEK: 'LOW',
  };

  // Scope creep risk based on complexity and service type
  const scopeCreepByService: Record<string, number> = {
    WATER_DAMAGE: 0.4,
    FIRE_DAMAGE: 0.6,
    STORM_DAMAGE: 0.5,
    FLOOD_DAMAGE: 0.5,
    MOULD_REMEDIATION: 0.5,
    HOARDING: 0.7,
    TRAUMA_CLEANING: 0.3,
    DEFAULT: 0.4,
  };
  const scopeCreepRisk = scopeCreepByService[serviceType] || scopeCreepByService.DEFAULT;

  // Seasonal risk
  const currentMonth = new Date().getMonth();
  const season =
    currentMonth >= 11 || currentMonth <= 1
      ? 'SUMMER'
      : currentMonth <= 4
        ? 'AUTUMN'
        : currentMonth <= 7
          ? 'WINTER'
          : 'SPRING';
  const seasonalFactors = SEASONAL_RISK_FACTORS[serviceType] || {};
  const seasonalRisk = seasonalFactors[season] || 0.5;

  return {
    jobComplexityScore,
    estimateAccuracyRisk,
    timelinePressure: timelinePressure[urgency] || 'LOW',
    scopeCreepRisk,
    seasonalRisk,
  };
}

/**
 * Calculate relationship-related risk factors
 */
async function calculateRelationshipFactors(booking: any): Promise<{
  contractorClientHistory: 'NEW' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  communicationGapDays: number;
  milestonesMissed: number;
  changeRequestCount: number;
  paymentDelays: number;
}> {
  const clientId = booking.clientId;
  const contractorId = booking.contractorId;

  // Check past history between this client and contractor
  let contractorClientHistory: 'NEW' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'NEW';

  if (clientId && contractorId) {
    const pastCollaborations = await prisma.booking.findMany({
      where: {
        clientId,
        contractorId,
        id: { not: booking.id },
      },
      include: {
        ratings: true,
      },
    });

    if (pastCollaborations.length > 0) {
      const avgRating = pastCollaborations
        .flatMap((b) => b.ratings.map((r) => r.rating))
        .reduce((a, b, _, arr) => a + b / arr.length, 0);

      if (avgRating >= 4) contractorClientHistory = 'POSITIVE';
      else if (avgRating >= 3) contractorClientHistory = 'NEUTRAL';
      else contractorClientHistory = 'NEGATIVE';
    }
  }

  // Communication gap (placeholder - would need message timestamps)
  const communicationGapDays = 0;

  // Milestones missed (placeholder - would need milestone tracking)
  const milestonesMissed = 0;

  // Change request count (placeholder - would need change log)
  const changeRequestCount = 0;

  // Payment delays
  const payments = booking.payments || [];
  const latePayments = payments.filter((p: any) => {
    if (!p.dueDate || !p.paidAt) return false;
    return new Date(p.paidAt) > new Date(p.dueDate);
  }).length;
  const paymentDelays = latePayments;

  return {
    contractorClientHistory,
    communicationGapDays,
    milestonesMissed,
    changeRequestCount,
    paymentDelays,
  };
}

// ============================================================================
// Risk Scoring Functions
// ============================================================================

/**
 * Calculate risk breakdown by category
 */
function calculateRiskBreakdown(
  factors: DisputeRiskFactors
): {
  contractorRisk: number;
  clientRisk: number;
  jobRisk: number;
  relationshipRisk: number;
} {
  // Contractor risk (0-100)
  let contractorRisk = 0;
  contractorRisk += factors.contractorDisputeHistory * 30;
  contractorRisk +=
    factors.contractorSatisfactionTrend === 'DECLINING'
      ? 20
      : factors.contractorSatisfactionTrend === 'IMPROVING'
        ? 5
        : 10;
  contractorRisk +=
    factors.contractorExperienceLevel === 'NEW'
      ? 25
      : factors.contractorExperienceLevel === 'INTERMEDIATE'
        ? 15
        : 5;
  contractorRisk += factors.contractorWorkloadRisk * 15;
  contractorRisk += Math.min(10, factors.contractorResponseDelays / 2.4);

  // Client risk (0-100)
  let clientRisk = 0;
  clientRisk += Math.min(30, factors.clientPastDisputes * 10);
  clientRisk +=
    factors.clientExpectationRisk === 'HIGH'
      ? 25
      : factors.clientExpectationRisk === 'MEDIUM'
        ? 10
        : 0;
  clientRisk += factors.isFirstTimeClient ? 15 : 0;
  clientRisk +=
    factors.clientCommunicationStyle === 'EXCESSIVE'
      ? 15
      : factors.clientCommunicationStyle === 'MINIMAL'
        ? 10
        : 0;
  clientRisk +=
    factors.clientPaymentHistory === 'POOR'
      ? 15
      : factors.clientPaymentHistory === 'FAIR'
        ? 10
        : 0;

  // Job risk (0-100)
  let jobRisk = 0;
  jobRisk += (factors.jobComplexityScore / 100) * 30;
  jobRisk += factors.estimateAccuracyRisk * 20;
  jobRisk +=
    factors.timelinePressure === 'CRITICAL'
      ? 20
      : factors.timelinePressure === 'HIGH'
        ? 15
        : factors.timelinePressure === 'MEDIUM'
          ? 8
          : 0;
  jobRisk += factors.scopeCreepRisk * 15;
  jobRisk += factors.seasonalRisk * 15;

  // Relationship risk (0-100)
  let relationshipRisk = 0;
  relationshipRisk +=
    factors.contractorClientHistory === 'NEGATIVE'
      ? 30
      : factors.contractorClientHistory === 'NEW'
        ? 15
        : 0;
  relationshipRisk += Math.min(20, factors.communicationGapDays * 2);
  relationshipRisk += Math.min(20, factors.milestonesMissed * 10);
  relationshipRisk += Math.min(15, factors.changeRequestCount * 5);
  relationshipRisk += Math.min(15, factors.paymentDelays * 5);

  return {
    contractorRisk: Math.min(100, contractorRisk),
    clientRisk: Math.min(100, clientRisk),
    jobRisk: Math.min(100, jobRisk),
    relationshipRisk: Math.min(100, relationshipRisk),
  };
}

/**
 * Calculate overall risk score
 */
function calculateOverallRiskScore(riskBreakdown: {
  contractorRisk: number;
  clientRisk: number;
  jobRisk: number;
  relationshipRisk: number;
}): number {
  const weightedScore =
    (riskBreakdown.contractorRisk * RISK_WEIGHTS.contractor +
      riskBreakdown.clientRisk * RISK_WEIGHTS.client +
      riskBreakdown.jobRisk * RISK_WEIGHTS.job +
      riskBreakdown.relationshipRisk * RISK_WEIGHTS.relationship) /
    100;

  return Math.round(weightedScore * 10) / 10;
}

/**
 * Determine risk level from score
 */
function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= RISK_THRESHOLDS.HIGH) return 'CRITICAL';
  if (score >= RISK_THRESHOLDS.MEDIUM) return 'HIGH';
  if (score >= RISK_THRESHOLDS.LOW) return 'MEDIUM';
  return 'LOW';
}

/**
 * Identify primary risk factors
 */
function identifyPrimaryRisks(factors: DisputeRiskFactors): string[] {
  const risks: Array<{ label: string; score: number }> = [];

  // Contractor risks
  if (factors.contractorDisputeHistory > 0.1) {
    risks.push({
      label: `Contractor has ${(factors.contractorDisputeHistory * 100).toFixed(0)}% dispute history`,
      score: factors.contractorDisputeHistory * 100,
    });
  }
  if (factors.contractorSatisfactionTrend === 'DECLINING') {
    risks.push({ label: 'Declining contractor satisfaction trend', score: 60 });
  }
  if (factors.contractorExperienceLevel === 'NEW') {
    risks.push({ label: 'Contractor has limited experience', score: 50 });
  }
  if (factors.contractorWorkloadRisk > 0.7) {
    risks.push({ label: 'Contractor has high current workload', score: 55 });
  }

  // Client risks
  if (factors.clientPastDisputes > 0) {
    risks.push({
      label: `Client has ${factors.clientPastDisputes} past dispute(s)`,
      score: 40 + factors.clientPastDisputes * 10,
    });
  }
  if (factors.clientExpectationRisk === 'HIGH') {
    risks.push({ label: 'Client has high expectations', score: 50 });
  }
  if (factors.isFirstTimeClient) {
    risks.push({ label: 'First-time client (unknown history)', score: 30 });
  }

  // Job risks
  if (factors.jobComplexityScore > 70) {
    risks.push({
      label: `High complexity job (score: ${factors.jobComplexityScore})`,
      score: factors.jobComplexityScore,
    });
  }
  if (factors.estimateAccuracyRisk > 0.5) {
    risks.push({
      label: 'High risk of cost overrun',
      score: factors.estimateAccuracyRisk * 80,
    });
  }
  if (factors.timelinePressure === 'CRITICAL') {
    risks.push({ label: 'Critical timeline pressure', score: 70 });
  }
  if (factors.scopeCreepRisk > 0.5) {
    risks.push({
      label: 'High scope creep risk',
      score: factors.scopeCreepRisk * 70,
    });
  }

  // Relationship risks
  if (factors.contractorClientHistory === 'NEGATIVE') {
    risks.push({ label: 'Previous negative history between parties', score: 80 });
  }
  if (factors.milestonesMissed > 0) {
    risks.push({
      label: `${factors.milestonesMissed} milestone(s) missed`,
      score: 40 + factors.milestonesMissed * 15,
    });
  }
  if (factors.paymentDelays > 0) {
    risks.push({
      label: `${factors.paymentDelays} payment delay(s)`,
      score: 35 + factors.paymentDelays * 10,
    });
  }

  // Sort by score and return top 5
  return risks
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((r) => r.label);
}

// ============================================================================
// Intervention Generation
// ============================================================================

/**
 * Generate intervention suggestions based on risk factors
 */
function generateInterventions(
  factors: DisputeRiskFactors,
  riskLevel: string,
  booking: any
): Intervention[] {
  const interventions: Intervention[] = [];
  let idCounter = 1;

  // Communication interventions
  if (factors.communicationGapDays > 3) {
    interventions.push({
      id: `INT-${idCounter++}`,
      type: 'COMMUNICATION',
      priority: factors.communicationGapDays > 7 ? 'HIGH' : 'MEDIUM',
      title: 'Resume Regular Communication',
      description: `No communication for ${factors.communicationGapDays} days. Re-establish contact.`,
      suggestedAction:
        'Send progress update to client and request confirmation of satisfaction',
      automatable: true,
      estimatedImpact: 15,
    });
  }

  // Contractor support
  if (
    factors.contractorExperienceLevel === 'NEW' &&
    factors.jobComplexityScore > 60
  ) {
    interventions.push({
      id: `INT-${idCounter++}`,
      type: 'CONTRACTOR_SUPPORT',
      priority: 'HIGH',
      title: 'Assign Senior Mentor',
      description:
        'New contractor handling complex job. Recommend mentor assignment.',
      suggestedAction:
        'Pair with experienced contractor for guidance and quality checks',
      automatable: false,
      estimatedImpact: 25,
    });
  }

  // Scope clarification
  if (factors.scopeCreepRisk > 0.5 || factors.changeRequestCount > 2) {
    interventions.push({
      id: `INT-${idCounter++}`,
      type: 'SCOPE_CLARIFICATION',
      priority: 'HIGH',
      title: 'Document Scope Changes',
      description: 'High risk of scope creep. Formalise current scope.',
      suggestedAction:
        'Request written confirmation of current scope from both parties',
      automatable: true,
      estimatedImpact: 20,
    });
  }

  // Client expectation management
  if (factors.clientExpectationRisk === 'HIGH') {
    interventions.push({
      id: `INT-${idCounter++}`,
      type: 'CLIENT_EXPECTATION',
      priority: 'MEDIUM',
      title: 'Set Clear Expectations',
      description: 'Client may have unrealistic expectations.',
      suggestedAction:
        'Schedule expectation-setting call to clarify deliverables and timeline',
      automatable: false,
      estimatedImpact: 20,
    });
  }

  // Payment review
  if (factors.paymentDelays > 0 || factors.clientPaymentHistory === 'POOR') {
    interventions.push({
      id: `INT-${idCounter++}`,
      type: 'PAYMENT_REVIEW',
      priority: factors.paymentDelays > 1 ? 'HIGH' : 'MEDIUM',
      title: 'Review Payment Schedule',
      description: 'Payment issues detected. Review and adjust if needed.',
      suggestedAction:
        'Consider milestone-based payments or deposit adjustment',
      automatable: false,
      estimatedImpact: 15,
    });
  }

  // Timeline adjustment for critical pressure
  if (factors.timelinePressure === 'CRITICAL') {
    interventions.push({
      id: `INT-${idCounter++}`,
      type: 'TIMELINE_ADJUSTMENT',
      priority: 'URGENT',
      title: 'Review Timeline Feasibility',
      description: 'Critical timeline may lead to quality issues.',
      suggestedAction:
        'Discuss realistic timeline with client and adjust expectations if needed',
      automatable: false,
      estimatedImpact: 20,
    });
  }

  // Management escalation for high risk
  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    interventions.push({
      id: `INT-${idCounter++}`,
      type: 'MANAGEMENT_ESCALATION',
      priority: riskLevel === 'CRITICAL' ? 'URGENT' : 'HIGH',
      title: 'Escalate to Account Manager',
      description: `${riskLevel} dispute risk requires management attention.`,
      suggestedAction:
        'Assign dedicated account manager to monitor job progress',
      automatable: true,
      estimatedImpact: 25,
    });
  }

  // Sort by estimated impact
  return interventions.sort((a, b) => b.estimatedImpact - a.estimatedImpact);
}

/**
 * Determine required quality checks
 */
function determineQualityChecks(
  factors: DisputeRiskFactors,
  riskScore: number,
  booking: any
): QualityCheck[] {
  const checks: QualityCheck[] = [];
  let idCounter = 1;

  // Auto-trigger for high risk
  const autoTrigger = riskScore >= AUTO_QUALITY_CHECK_THRESHOLD;

  // Photo documentation for all high-risk jobs
  if (riskScore >= 50) {
    checks.push({
      id: `QC-${idCounter++}`,
      type: 'PHOTO_DOCUMENTATION',
      stage: 'DURING',
      description: 'Daily photo updates of work progress',
      requiredBy: 'Contractor',
      autoTriggered: autoTrigger,
    });
  }

  // Inspector review for complex jobs
  if (factors.jobComplexityScore > 70) {
    checks.push({
      id: `QC-${idCounter++}`,
      type: 'INSPECTOR_REVIEW',
      stage: 'PRE_COMPLETION',
      description: 'Independent inspector review before handover',
      requiredBy: 'Platform',
      autoTriggered: autoTrigger,
    });
  }

  // Scope verification for high scope creep risk
  if (factors.scopeCreepRisk > 0.5) {
    checks.push({
      id: `QC-${idCounter++}`,
      type: 'SCOPE_VERIFICATION',
      stage: 'DURING',
      description: 'Weekly scope verification with client sign-off',
      requiredBy: 'Contractor',
      autoTriggered: autoTrigger,
    });
  }

  // Cost audit for high estimate risk
  if (factors.estimateAccuracyRisk > 0.5) {
    checks.push({
      id: `QC-${idCounter++}`,
      type: 'COST_AUDIT',
      stage: 'PRE_COMPLETION',
      description: 'Detailed cost breakdown and justification',
      requiredBy: 'Contractor',
      autoTriggered: autoTrigger,
    });
  }

  // Client confirmation at key stages
  if (riskScore >= 60) {
    checks.push({
      id: `QC-${idCounter++}`,
      type: 'CLIENT_CONFIRMATION',
      stage: 'DURING',
      description: 'Mid-project client satisfaction check',
      requiredBy: 'Platform',
      autoTriggered: autoTrigger,
    });
  }

  // Satisfaction survey for all
  checks.push({
    id: `QC-${idCounter++}`,
    type: 'SATISFACTION_SURVEY',
    stage: 'POST_COMPLETION',
    description: 'Post-completion satisfaction survey',
    requiredBy: 'Platform',
    autoTriggered: true,
  });

  return checks;
}

// ============================================================================
// AI Reasoning Generation
// ============================================================================

/**
 * Generate AI-powered reasoning for the prediction
 */
async function generateReasoning(
  booking: any,
  factors: DisputeRiskFactors,
  riskScore: number,
  primaryRisks: string[]
): Promise<string> {
  try {
    const provider = await getDefaultProvider();
    const model = provider.getModel();

    const prompt = `You are a dispute prevention specialist for Australian disaster recovery.
Analyse this booking and provide a concise risk assessment.

BOOKING:
- Service: ${booking.australianServiceType}
- Estimated Cost: $${booking.estimatedCostAUD} AUD
- Urgency: ${booking.emergencyResponseLevel}
- Location: ${booking.serviceSuburb}, ${booking.serviceState}

RISK SCORE: ${riskScore}/100

PRIMARY RISK FACTORS:
${primaryRisks.map((r, i) => `${i + 1}. ${r}`).join('\n')}

KEY METRICS:
- Contractor dispute history: ${(factors.contractorDisputeHistory * 100).toFixed(0)}%
- Contractor experience: ${factors.contractorExperienceLevel}
- Client past disputes: ${factors.clientPastDisputes}
- Job complexity: ${factors.jobComplexityScore}/100
- Scope creep risk: ${(factors.scopeCreepRisk * 100).toFixed(0)}%

Provide a 2-3 sentence summary explaining the dispute risk level and key concerns.
Focus on actionable insights. Use Australian English.`;

    const response = await model.invoke([
      new SystemMessage(
        'You are a dispute prevention specialist. Be concise and actionable.'
      ),
      new HumanMessage(prompt),
    ]);

    const content =
      typeof response.content === 'string' ? response.content : '';
    return content.trim() || generateFallbackReasoning(riskScore, primaryRisks);
  } catch (error) {
    console.error('Error generating reasoning:', error);
    return generateFallbackReasoning(riskScore, primaryRisks);
  }
}

/**
 * Generate fallback reasoning without AI
 */
function generateFallbackReasoning(
  riskScore: number,
  primaryRisks: string[]
): string {
  let assessment = '';

  if (riskScore >= 75) {
    assessment =
      'This booking has a critical dispute risk and requires immediate attention.';
  } else if (riskScore >= 50) {
    assessment =
      'This booking has elevated dispute risk and should be monitored closely.';
  } else if (riskScore >= 25) {
    assessment =
      'This booking has moderate dispute risk with some areas requiring attention.';
  } else {
    assessment = 'This booking has low dispute risk but standard monitoring is recommended.';
  }

  if (primaryRisks.length > 0) {
    assessment += ` Key concerns include: ${primaryRisks.slice(0, 2).join('; ')}.`;
  }

  return assessment;
}

/**
 * Calculate prediction confidence
 */
function calculateConfidence(booking: any, factors: DisputeRiskFactors): number {
  let confidencePoints = 0;
  const maxPoints = 10;

  // Points for data availability
  if (booking.contractor) confidencePoints += 2;
  if (booking.client) confidencePoints += 2;
  if (booking.contractor?.contractorBookings?.length > 5) confidencePoints += 1;
  if (booking.client?.clientBookings?.length > 3) confidencePoints += 1;
  if (booking.payments?.length > 0) confidencePoints += 1;
  if (factors.contractorDisputeHistory !== 0.5) confidencePoints += 1; // Not default
  if (factors.jobComplexityScore > 0) confidencePoints += 1;
  if (booking.estimatedCostAUD) confidencePoints += 1;

  return Math.round((confidencePoints / maxPoints) * 100) / 100;
}
