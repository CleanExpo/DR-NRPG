// @ts-nocheck

/**
 * AI Claim Triage Service
 *
 * Automatically triages public claims using AI:
 * - Extracts structured data from descriptions
 * - Classifies damage type and severity
 * - Assesses urgency level
 * - Flags potential fraud indicators
 * - Generates admin summary and recommendations
 */

import { getDefaultProvider } from '@/lib/agents/providers';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

export interface PublicClaimData {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  propertyAddress: string;
  suburb: string;
  postcode: string;
  disasterType: string;
  incidentDate: Date;
  isOngoing: boolean;
  isEmergency: boolean;
  damageDescription: string;
  hasInsurance: boolean;
  insuranceProvider?: string | null;
  policyNumber?: string | null;
  priority: string;
  status: string;
  submittedAt: Date;
}

export interface TriageResult {
  claimId: string;
  triageScore: number; // 0-100 confidence in triage accuracy

  // Classification
  classifiedDamageType: string;
  damageSubTypes: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  urgencyLevel: 'STANDARD' | 'HIGH' | 'URGENT' | 'EMERGENCY';

  // Extracted Data
  extractedData: {
    affectedAreas: string[];
    estimatedSquareMeters?: number;
    possibleCauses: string[];
    timelineSummary: string;
    hasWaterInvolvement: boolean;
    hasMouldRisk: boolean;
    hasStructuralConcerns: boolean;
    requiresImmediateAction: boolean;
  };

  // Cost Estimation
  estimatedCostRange: {
    min: number;
    max: number;
    currency: 'AUD';
    confidence: number;
  };

  // Fraud Detection
  fraudIndicators: FraudIndicator[];
  fraudRiskScore: number; // 0-100

  // Recommendations
  recommendedServiceTypes: string[];
  recommendedPriority: 'LOW' | 'MEDIUM' | 'HIGH';
  adminSummary: string;
  nextSteps: string[];

  // Metadata
  processingTimeMs: number;
  aiProvider: string;
  processedAt: Date;
}

export interface FraudIndicator {
  type: 'DUPLICATE_DESCRIPTION' | 'SUSPICIOUS_TIMING' | 'INCONSISTENT_DATA' |
        'UNREALISTIC_DAMAGE' | 'KNOWN_PATTERN' | 'GEOGRAPHIC_MISMATCH';
  description: string;
  confidence: number; // 0-1
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface BatchTriageResult {
  successful: TriageResult[];
  failed: { claimId: string; error: string }[];
  totalProcessed: number;
  totalTimeMs: number;
}

// Australian disaster type mappings
const DISASTER_TYPE_MAPPING: Record<string, string[]> = {
  WATER_DAMAGE: ['flood', 'water', 'leak', 'burst pipe', 'rain', 'storm surge', 'overflow', 'wet', 'moisture', 'damp'],
  FIRE_DAMAGE: ['fire', 'smoke', 'burn', 'flames', 'soot', 'char', 'arson', 'electrical fire'],
  STORM_DAMAGE: ['storm', 'wind', 'hail', 'cyclone', 'tornado', 'lightning', 'fallen tree', 'roof damage'],
  MOULD_REMEDIATION: ['mould', 'mold', 'fungus', 'spores', 'black mould', 'toxic mould', 'mildew'],
  BIOHAZARD: ['biohazard', 'blood', 'sewage', 'hazardous', 'contamination', 'crime scene', 'bodily fluids'],
  STRUCTURAL: ['structural', 'foundation', 'wall crack', 'ceiling collapse', 'subsidence', 'building damage'],
};

// Cost estimation base ranges (AUD)
const COST_RANGES: Record<string, { min: number; max: number; perSqm: number }> = {
  WATER_DAMAGE: { min: 2000, max: 25000, perSqm: 50 },
  FIRE_DAMAGE: { min: 5000, max: 100000, perSqm: 150 },
  STORM_DAMAGE: { min: 1500, max: 30000, perSqm: 40 },
  MOULD_REMEDIATION: { min: 1000, max: 15000, perSqm: 35 },
  BIOHAZARD: { min: 3000, max: 50000, perSqm: 100 },
  STRUCTURAL: { min: 10000, max: 150000, perSqm: 200 },
};

// System prompt for triage
const TRIAGE_SYSTEM_PROMPT = `You are an expert Australian disaster recovery triage specialist. Your role is to analyse public claim submissions and provide accurate classification, severity assessment, and recommendations.

Guidelines:
- Use Australian English (colour, mould, organisation)
- Reference industry standards (for water, mould and fire/smoke damage)
- Consider Australian seasonal patterns (cyclones in QLD/NT, bushfires in summer, floods after La Niña)
- Estimate costs in AUD based on typical Australian restoration rates
- Flag any inconsistencies or potential fraud indicators
- Prioritise safety - recommend emergency response for life-threatening situations

Always provide structured JSON responses.`;

/**
 * Triage a single public claim
 */
export async function triageClaim(claim: PublicClaimData): Promise<TriageResult> {
  const startTime = Date.now();

  try {
    const provider = getDefaultProvider();
    const model = provider.getModel();

    const prompt = buildTriagePrompt(claim);

    const response = await model.invoke([
      new SystemMessage(TRIAGE_SYSTEM_PROMPT),
      new HumanMessage(prompt),
    ]);

    const content = typeof response.content === 'string' ? response.content : '';
    const aiResult = parseTriageResponse(content);

    // Merge AI results with rule-based analysis
    const ruleBasedAnalysis = performRuleBasedAnalysis(claim);
    const fraudAnalysis = detectFraudIndicators(claim, aiResult);

    const result: TriageResult = {
      claimId: claim.id,
      triageScore: calculateTriageScore(aiResult, ruleBasedAnalysis),
      classifiedDamageType: aiResult.damageType || ruleBasedAnalysis.damageType,
      damageSubTypes: aiResult.damageSubTypes || [],
      severity: aiResult.severity || ruleBasedAnalysis.severity,
      urgencyLevel: determineUrgency(claim, aiResult),
      extractedData: {
        affectedAreas: aiResult.affectedAreas || [],
        estimatedSquareMeters: aiResult.estimatedSquareMeters,
        possibleCauses: aiResult.possibleCauses || [],
        timelineSummary: aiResult.timelineSummary || '',
        hasWaterInvolvement: ruleBasedAnalysis.hasWaterInvolvement,
        hasMouldRisk: ruleBasedAnalysis.hasMouldRisk,
        hasStructuralConcerns: ruleBasedAnalysis.hasStructuralConcerns,
        requiresImmediateAction: claim.isEmergency || aiResult.requiresImmediateAction,
      },
      estimatedCostRange: calculateCostEstimate(
        aiResult.damageType || ruleBasedAnalysis.damageType,
        aiResult.severity || ruleBasedAnalysis.severity,
        aiResult.estimatedSquareMeters,
        claim.postcode
      ),
      fraudIndicators: fraudAnalysis.indicators,
      fraudRiskScore: fraudAnalysis.riskScore,
      recommendedServiceTypes: aiResult.recommendedServices || [ruleBasedAnalysis.damageType],
      recommendedPriority: mapSeverityToPriority(aiResult.severity || ruleBasedAnalysis.severity),
      adminSummary: generateAdminSummary(claim, aiResult, ruleBasedAnalysis),
      nextSteps: aiResult.nextSteps || generateDefaultNextSteps(claim),
      processingTimeMs: Date.now() - startTime,
      aiProvider: provider.getName(),
      processedAt: new Date(),
    };

    return result;
  } catch (error) {
    console.error('Claim triage error:', error);

    // Fall back to rule-based analysis
    const ruleBasedAnalysis = performRuleBasedAnalysis(claim);

    return {
      claimId: claim.id,
      triageScore: 50, // Lower confidence for rule-based only
      classifiedDamageType: ruleBasedAnalysis.damageType,
      damageSubTypes: [],
      severity: ruleBasedAnalysis.severity,
      urgencyLevel: claim.isEmergency ? 'EMERGENCY' : 'STANDARD',
      extractedData: {
        affectedAreas: [],
        possibleCauses: [],
        timelineSummary: '',
        hasWaterInvolvement: ruleBasedAnalysis.hasWaterInvolvement,
        hasMouldRisk: ruleBasedAnalysis.hasMouldRisk,
        hasStructuralConcerns: ruleBasedAnalysis.hasStructuralConcerns,
        requiresImmediateAction: claim.isEmergency,
      },
      estimatedCostRange: calculateCostEstimate(
        ruleBasedAnalysis.damageType,
        ruleBasedAnalysis.severity,
        undefined,
        claim.postcode
      ),
      fraudIndicators: [],
      fraudRiskScore: 0,
      recommendedServiceTypes: [ruleBasedAnalysis.damageType],
      recommendedPriority: mapSeverityToPriority(ruleBasedAnalysis.severity),
      adminSummary: `Rule-based triage: ${ruleBasedAnalysis.damageType} damage, ${ruleBasedAnalysis.severity} severity. AI analysis unavailable.`,
      nextSteps: generateDefaultNextSteps(claim),
      processingTimeMs: Date.now() - startTime,
      aiProvider: 'rule-based',
      processedAt: new Date(),
    };
  }
}

/**
 * Batch triage multiple claims
 */
export async function triageClaimsBatch(
  claims: PublicClaimData[],
  options: { concurrency?: number } = {}
): Promise<BatchTriageResult> {
  const startTime = Date.now();
  const concurrency = options.concurrency || 3;

  const successful: TriageResult[] = [];
  const failed: { claimId: string; error: string }[] = [];

  // Process in batches
  for (let i = 0; i < claims.length; i += concurrency) {
    const batch = claims.slice(i, i + concurrency);
    const results = await Promise.allSettled(batch.map(triageClaim));

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(result.value);
      } else {
        failed.push({
          claimId: batch[index].id,
          error: result.reason?.message || 'Unknown error',
        });
      }
    });
  }

  return {
    successful,
    failed,
    totalProcessed: claims.length,
    totalTimeMs: Date.now() - startTime,
  };
}

/**
 * Build the AI prompt for triage
 */
function buildTriagePrompt(claim: PublicClaimData): string {
  const daysSinceIncident = Math.floor(
    (Date.now() - claim.incidentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return `Analyse this public claim submission for triage:

## Claim Details
- **Client:** ${claim.clientName}
- **Location:** ${claim.propertyAddress}, ${claim.suburb} ${claim.postcode}
- **Reported Disaster Type:** ${claim.disasterType}
- **Incident Date:** ${claim.incidentDate.toISOString().split('T')[0]} (${daysSinceIncident} days ago)
- **Is Ongoing:** ${claim.isOngoing ? 'Yes' : 'No'}
- **Marked as Emergency:** ${claim.isEmergency ? 'Yes' : 'No'}
- **Has Insurance:** ${claim.hasInsurance ? `Yes (${claim.insuranceProvider || 'Provider not specified'})` : 'No'}

## Damage Description
${claim.damageDescription}

## Tasks
1. Classify the actual damage type(s) based on the description
2. Assess severity (LOW/MEDIUM/HIGH/CRITICAL)
3. Extract affected areas, possible causes, and timeline
4. Estimate square meters affected (if possible)
5. Identify any inconsistencies or fraud indicators
6. Recommend appropriate service types
7. Generate next steps for the admin team

Respond with JSON only:
{
  "damageType": "WATER_DAMAGE|FIRE_DAMAGE|STORM_DAMAGE|MOULD_REMEDIATION|BIOHAZARD|STRUCTURAL",
  "damageSubTypes": ["sub-type 1", "sub-type 2"],
  "severity": "LOW|MEDIUM|HIGH|CRITICAL",
  "affectedAreas": ["area1", "area2"],
  "estimatedSquareMeters": number or null,
  "possibleCauses": ["cause1", "cause2"],
  "timelineSummary": "Brief timeline of events",
  "requiresImmediateAction": boolean,
  "inconsistencies": ["inconsistency1"],
  "recommendedServices": ["SERVICE_TYPE_1", "SERVICE_TYPE_2"],
  "nextSteps": ["step1", "step2", "step3"],
  "confidence": 0.0-1.0,
  "notes": "Any additional observations"
}`;
}

/**
 * Parse the AI response
 */
function parseTriageResponse(content: string): Record<string, unknown> {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.warn('Failed to parse AI triage response:', error);
  }
  return {};
}

/**
 * Perform rule-based analysis as fallback/supplement
 */
function performRuleBasedAnalysis(claim: PublicClaimData): {
  damageType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  hasWaterInvolvement: boolean;
  hasMouldRisk: boolean;
  hasStructuralConcerns: boolean;
} {
  const descLower = claim.damageDescription.toLowerCase();
  const reportedType = claim.disasterType.toUpperCase();

  // Detect damage type from description
  let detectedType = 'WATER_DAMAGE'; // Default
  let maxMatches = 0;

  for (const [type, keywords] of Object.entries(DISASTER_TYPE_MAPPING)) {
    const matches = keywords.filter(kw => descLower.includes(kw)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedType = type;
    }
  }

  // Use reported type if it matches our categories
  if (Object.keys(DISASTER_TYPE_MAPPING).includes(reportedType)) {
    detectedType = reportedType;
  }

  // Assess severity from keywords
  let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';

  const criticalKeywords = ['collapse', 'structural failure', 'uninhabitable', 'total loss', 'destroyed'];
  const highKeywords = ['extensive', 'major', 'severe', 'significant', 'throughout', 'entire'];
  const lowKeywords = ['minor', 'small', 'limited', 'slight', 'partial'];

  if (criticalKeywords.some(kw => descLower.includes(kw)) || claim.isEmergency) {
    severity = 'CRITICAL';
  } else if (highKeywords.some(kw => descLower.includes(kw))) {
    severity = 'HIGH';
  } else if (lowKeywords.some(kw => descLower.includes(kw))) {
    severity = 'LOW';
  }

  // Check for specific concerns
  const waterKeywords = ['water', 'flood', 'leak', 'wet', 'moisture', 'damp', 'rain'];
  const mouldKeywords = ['mould', 'mold', 'musty', 'damp smell', 'spores'];
  const structuralKeywords = ['crack', 'collapse', 'structural', 'foundation', 'wall', 'ceiling', 'roof'];

  return {
    damageType: detectedType,
    severity,
    hasWaterInvolvement: waterKeywords.some(kw => descLower.includes(kw)),
    hasMouldRisk: mouldKeywords.some(kw => descLower.includes(kw)) ||
                  (waterKeywords.some(kw => descLower.includes(kw)) && claim.isOngoing),
    hasStructuralConcerns: structuralKeywords.some(kw => descLower.includes(kw)),
  };
}

/**
 * Detect fraud indicators
 */
function detectFraudIndicators(
  claim: PublicClaimData,
  aiResult: Record<string, unknown>
): { indicators: FraudIndicator[]; riskScore: number } {
  const indicators: FraudIndicator[] = [];

  // Check for suspicious timing
  const daysSinceIncident = Math.floor(
    (Date.now() - claim.incidentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceIncident > 60) {
    indicators.push({
      type: 'SUSPICIOUS_TIMING',
      description: `Claim submitted ${daysSinceIncident} days after incident`,
      confidence: 0.6,
      severity: 'MEDIUM',
    });
  }

  // Check for inconsistencies flagged by AI
  const aiInconsistencies = aiResult.inconsistencies as string[] | undefined;
  if (aiInconsistencies && aiInconsistencies.length > 0) {
    aiInconsistencies.forEach(inconsistency => {
      indicators.push({
        type: 'INCONSISTENT_DATA',
        description: inconsistency,
        confidence: 0.7,
        severity: 'MEDIUM',
      });
    });
  }

  // Check for very short descriptions (potentially copy-pasted)
  if (claim.damageDescription.length < 50) {
    indicators.push({
      type: 'INCONSISTENT_DATA',
      description: 'Damage description is unusually brief',
      confidence: 0.4,
      severity: 'LOW',
    });
  }

  // Calculate overall fraud risk score
  let riskScore = 0;
  indicators.forEach(indicator => {
    const severityWeight = indicator.severity === 'HIGH' ? 30 : indicator.severity === 'MEDIUM' ? 20 : 10;
    riskScore += severityWeight * indicator.confidence;
  });

  return {
    indicators,
    riskScore: Math.min(riskScore, 100),
  };
}

/**
 * Determine urgency level
 */
function determineUrgency(
  claim: PublicClaimData,
  aiResult: Record<string, unknown>
): 'STANDARD' | 'HIGH' | 'URGENT' | 'EMERGENCY' {
  if (claim.isEmergency || aiResult.requiresImmediateAction) {
    return 'EMERGENCY';
  }

  const severity = aiResult.severity as string;
  if (severity === 'CRITICAL') {
    return 'URGENT';
  }

  if (severity === 'HIGH' || claim.isOngoing) {
    return 'HIGH';
  }

  return 'STANDARD';
}

/**
 * Calculate cost estimate
 */
function calculateCostEstimate(
  damageType: string,
  severity: string,
  estimatedSqm: number | undefined,
  postcode: string
): TriageResult['estimatedCostRange'] {
  const baseRange = COST_RANGES[damageType] || COST_RANGES.WATER_DAMAGE;

  // Severity multiplier
  const severityMultiplier = {
    LOW: 0.5,
    MEDIUM: 1.0,
    HIGH: 1.5,
    CRITICAL: 2.0,
  }[severity] || 1.0;

  // Regional adjustment (Sydney/Melbourne typically 15% higher)
  const premiumPostcodes = /^(2\d{3}|3\d{3})$/; // NSW and VIC
  const regionalMultiplier = premiumPostcodes.test(postcode) ? 1.15 : 1.0;

  let min = baseRange.min * severityMultiplier * regionalMultiplier;
  let max = baseRange.max * severityMultiplier * regionalMultiplier;

  // If we have square meter estimate, refine the range
  if (estimatedSqm && estimatedSqm > 0) {
    const sqmCost = baseRange.perSqm * estimatedSqm * severityMultiplier * regionalMultiplier;
    min = Math.max(baseRange.min, sqmCost * 0.7);
    max = Math.min(baseRange.max * severityMultiplier, sqmCost * 1.5);
  }

  return {
    min: Math.round(min),
    max: Math.round(max),
    currency: 'AUD',
    confidence: estimatedSqm ? 0.75 : 0.5,
  };
}

/**
 * Calculate triage confidence score
 */
function calculateTriageScore(
  aiResult: Record<string, unknown>,
  ruleBasedAnalysis: { damageType: string }
): number {
  let score = 50; // Base score

  // AI confidence
  const aiConfidence = aiResult.confidence as number;
  if (aiConfidence) {
    score += aiConfidence * 30;
  }

  // Agreement between AI and rule-based
  if (aiResult.damageType === ruleBasedAnalysis.damageType) {
    score += 15;
  }

  // Completeness of AI response
  if (aiResult.affectedAreas && (aiResult.affectedAreas as string[]).length > 0) score += 2;
  if (aiResult.possibleCauses && (aiResult.possibleCauses as string[]).length > 0) score += 2;
  if (aiResult.estimatedSquareMeters) score += 3;
  if (aiResult.timelineSummary) score += 2;

  return Math.min(Math.round(score), 100);
}

/**
 * Map severity to priority
 */
function mapSeverityToPriority(severity: string): 'LOW' | 'MEDIUM' | 'HIGH' {
  switch (severity) {
    case 'CRITICAL':
    case 'HIGH':
      return 'HIGH';
    case 'MEDIUM':
      return 'MEDIUM';
    default:
      return 'LOW';
  }
}

/**
 * Generate admin summary
 */
function generateAdminSummary(
  claim: PublicClaimData,
  aiResult: Record<string, unknown>,
  ruleBasedAnalysis: { damageType: string; severity: string }
): string {
  const parts: string[] = [];

  parts.push(`**${aiResult.damageType || ruleBasedAnalysis.damageType}** damage reported in ${claim.suburb}, ${claim.postcode}.`);
  parts.push(`Severity: ${aiResult.severity || ruleBasedAnalysis.severity}.`);

  if (claim.isEmergency) {
    parts.push('⚠️ Marked as EMERGENCY.');
  }

  if (claim.isOngoing) {
    parts.push('Damage is ongoing.');
  }

  const daysSinceIncident = Math.floor(
    (Date.now() - claim.incidentDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  parts.push(`Incident occurred ${daysSinceIncident} days ago.`);

  if (claim.hasInsurance) {
    parts.push(`Insurance: ${claim.insuranceProvider || 'Provider not specified'}.`);
  } else {
    parts.push('No insurance coverage.');
  }

  if (aiResult.notes) {
    parts.push(`AI Notes: ${aiResult.notes}`);
  }

  return parts.join(' ');
}

/**
 * Generate default next steps
 */
function generateDefaultNextSteps(claim: PublicClaimData): string[] {
  const steps: string[] = [];

  if (claim.isEmergency) {
    steps.push('Contact client immediately for emergency response');
  } else {
    steps.push('Review claim details and verify client information');
  }

  steps.push('Request additional photos if needed');

  if (claim.hasInsurance) {
    steps.push('Verify insurance details with provider');
  }

  steps.push('Match with appropriate contractors based on location and damage type');
  steps.push('Generate quote request for top contractors');

  return steps;
}

// Export singleton service
export const claimTriageService = {
  triageClaim,
  triageClaimsBatch,
};

export default claimTriageService;
