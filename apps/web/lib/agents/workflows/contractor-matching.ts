// @ts-nocheck

/**
 * ⚠️ DEPRECATED - NO LONGER IN USE ⚠️
 *
 * This file contained the AI-powered contractor matching workflow using LangGraph.
 * As of 2026-02-03, the system has been changed to use STRICT ROTATION instead of AI scoring.
 *
 * Reason for deprecation:
 * - User requirement: Fair rotation based on lastJobReceivedAt (no preferential treatment)
 * - User requirement: certification hard filtering (not scoring)
 * - User requirement: No AI - pure round-robin distribution
 *
 * NEW Implementation:
 * See: apps/web/lib/queue/processors/contractor-matching-processor.ts
 *
 * This file is kept for historical reference only.
 * DO NOT USE THIS WORKFLOW - it will not be executed by the system.
 *
 * Date Deprecated: 2026-02-03
 * Previous Functionality: AI-powered contractor matching with 0-100 scoring
 *
 * ============================================================================
 *
 * ORIGINAL DOCUMENTATION (for reference):
 * Contractor Matching Workflow - LangGraph implementation
 * Intelligently matches clients with qualified restoration contractors
 */

import { StateGraph, Annotation, END, START } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { registerWorkflow, WorkflowExecutionConfig } from '../core/orchestrator';
import { MatchingCriteria, ContractorMatchingState, WorkflowError } from '../types';
import { prisma } from '@/lib/prisma';

// State annotation for the contractor matching workflow
const ContractorMatchingAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (curr, update) => [...curr, ...update],
    default: () => [],
  }),
  criteria: Annotation<MatchingCriteria | null>({
    reducer: (_curr, update) => update,
    default: () => null,
  }),
  clientId: Annotation<string>({
    reducer: (_curr, update) => update,
    default: () => '',
  }),
  eligibleContractors: Annotation<string[]>({
    reducer: (_curr, update) => update,
    default: () => [],
  }),
  contractorDetails: Annotation<Array<Record<string, unknown>>>({
    reducer: (_curr, update) => update,
    default: () => [],
  }),
  scoredMatches: Annotation<Array<{ contractorId: string; score: number; reasons: string[] }>>({
    reducer: (_curr, update) => update,
    default: () => [],
  }),
  recommendedMatch: Annotation<string>({
    reducer: (_curr, update) => update,
    default: () => '',
  }),
  matchingRationale: Annotation<string>({
    reducer: (_curr, update) => update,
    default: () => '',
  }),
  alternativeMatches: Annotation<Array<{ contractorId: string; businessName: string; score: number; reason: string }>>({
    reducer: (_curr, update) => update,
    default: () => [],
  }),
  searchRadius: Annotation<number>({
    reducer: (_curr, update) => update,
    default: () => 0,
  }),
  noMatchReason: Annotation<string>({
    reducer: (_curr, update) => update,
    default: () => '',
  }),
  isComplete: Annotation<boolean>({
    reducer: (_curr, update) => update,
    default: () => false,
  }),
});

type MatchingState = typeof ContractorMatchingAnnotation.State;

// System prompt for the contractor matching specialist (Snake Build Pattern)
const SYSTEM_PROMPT = `You are a contractor matching specialist for Australian disaster recovery.
Use Australian English. Reference /australian-insurance-standards for insurance requirements.
Match contractors based on: service type, location, urgency, certifications, insurance verification, training completion.
Insurance-backed work REQUIRES: $10M+ public liability, insurance training completion, Code of Practice compliance.
Return structured JSON scoring for transparent matching.`;

/**
 * Create the contractor matching workflow graph
 */
function createContractorMatchingGraph(model: BaseChatModel) {
  // Node: Find eligible contractors from database
  async function findEligibleContractors(state: MatchingState): Promise<Partial<MatchingState>> {
    const criteria = state.criteria;
    if (!criteria) {
      throw new WorkflowError('No matching criteria provided', 'CONTRACTOR_MATCHING', 'find');
    }

    const serviceType = criteria.serviceType || '';
    const location = criteria.location;
    const urgency = criteria.urgency || 'standard';

    try {
      // Query contractors with exact postcode match first
      let contractors = await prisma.contractor.findMany({
        where: {
          isActive: true,
          isVerified: true,
          australianSpecialties: {
            hasSome: [serviceType],
          },
          serviceAreas: {
            some: {
              postcode: location.postcode,
              isActive: true,
              state: location.state,
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          contractorProfile: {
            include: {
              insuranceVerification: true,
            },
          },
          serviceAreas: {
            where: { isActive: true },
          },
          iicrcCertifications: {
            where: { isActive: true },
          },
        },
        take: 20,
      });

      let searchRadius = 25;

      // If no contractors found, expand search radius
      if (contractors.length === 0) {
        for (const radius of [25, 50, 75]) {
          // Approximate radius search using postcode range
          // In production, use proper geo-distance calculations
          contractors = await prisma.contractor.findMany({
            where: {
              isActive: true,
              isVerified: true,
              australianSpecialties: {
                hasSome: [serviceType],
              },
              serviceAreas: {
                some: {
                  state: location.state,
                  isActive: true,
                },
              },
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              contractorProfile: {
                include: {
                  insuranceVerification: true,
                },
              },
              serviceAreas: {
                where: { isActive: true },
              },
              iicrcCertifications: {
                where: { isActive: true },
              },
            },
            take: 20,
          });

          if (contractors.length > 0) {
            searchRadius = radius;
            break;
          }
        }
      }

      const contractorIds = contractors.map((c) => c.id);
      const details = contractors.map((c) => {
        const profile = c.contractorProfile;
        const insurance = profile?.insuranceVerification;

        // Check if public liability is verified and $10M+
        const hasValidPL = insurance?.publicLiabilityVerified &&
                          insurance?.publicLiabilityAmount === '$10,000,000' &&
                          (!insurance?.publicLiabilityExpiryDate || insurance.publicLiabilityExpiryDate > new Date());

        // Check if insurance training is complete
        const hasTrainingCompleted = profile?.insuranceTrainingCompleted || false;
        const trainingExpiryValid = profile?.certificateExpiryDate ?
                                   profile.certificateExpiryDate > new Date() : false;

        return {
          contractorId: c.id,
          businessName: c.businessName || c.user?.name || 'Unknown',
          userEmail: c.user?.email,
          specialties: c.australianSpecialties || [],
          serviceAreas: c.serviceAreas.map((sa) => ({ state: sa.state, suburb: sa.suburb, postcode: sa.postcode })),
          certifications: c.iicrcCertifications.map((cert) => ({
            certification: cert.certification,
            expiryDate: cert.expiryDate,
          })),
          rating: c.contractorProfile?.averageRating || 0,
          completedJobs: c.contractorProfile?.completedJobs || 0,
          responseTimeMinutes: c.contractorProfile?.averageResponseTimeMinutes || 60,
          isNrpgVerified: c.isVerified,
          publicLiability: c.contractorProfile?.publicLiabilityInsured || false,
          // NEW: Insurance fields
          hasValid10mPL: hasValidPL,
          publicLiabilityAmount: insurance?.publicLiabilityAmount || 'Unknown',
          publicLiabilityCertExpiry: insurance?.publicLiabilityExpiryDate,
          insuranceTrainingCompleted: hasTrainingCompleted,
          trainingCertificateValid: trainingExpiryValid,
          trainingCertificateExpiry: profile?.certificateExpiryDate,
          certificateLevel: profile?.badgeLevel || 'NONE',
        };
      });

      return {
        messages: [new AIMessage(`Found ${contractorIds.length} eligible contractors within ${searchRadius}km radius`)],
        eligibleContractors: contractorIds,
        contractorDetails: details,
        searchRadius,
      };
    } catch (error) {
      return {
        messages: [new AIMessage(`Error finding contractors: ${error instanceof Error ? error.message : 'Unknown error'}`)],
        eligibleContractors: [],
        contractorDetails: [],
        noMatchReason: 'Unable to search contractor database at this time',
      };
    }
  }

  // Node: Score contractors with AI reasoning
  async function scoreContractors(state: MatchingState): Promise<Partial<MatchingState>> {
    const criteria = state.criteria;
    if (!criteria || state.contractorDetails.length === 0) {
      throw new WorkflowError('No contractors to score', 'CONTRACTOR_MATCHING', 'score');
    }

    const serviceType = criteria.serviceType || '';
    const location = criteria.location;
    const urgency = criteria.urgency || 'standard';
    const budget = criteria.budget || 10000;

    const contractorsInfo = state.contractorDetails
      .map(
        (c, idx) =>
          `${idx + 1}. ${c.businessName} (ID: ${c.contractorId})
     Specialties: ${(c.specialties as string[]).join(', ')}
     Certifications: ${((c.certifications as { certification: string }[]) || []).map((x: any) => x.certification).join(', ') || 'None'}
     Rating: ${c.rating}/5 (${c.completedJobs} jobs)
     Response Time: ${c.responseTimeMinutes} minutes
     NRPG Verified: ${c.isNrpgVerified}
     Public Liability: ${c.publicLiability}
     INSURANCE TRAINING: ${c.insuranceTrainingCompleted ? 'COMPLETED' : 'NOT COMPLETED'} ${c.trainingCertificateValid ? `(Valid until ${c.trainingCertificateExpiry?.toLocaleDateString()})` : '(EXPIRED)'}
     PUBLIC LIABILITY $10M: ${c.hasValid10mPL ? 'VERIFIED ✓' : 'NOT VERIFIED or EXPIRED'} (${c.publicLiabilityAmount})`
      )
      .join('\n');

    const prompt = `Score and rank these contractors for the following requirements:

Service Type: ${serviceType}
Location: ${location.suburb}, ${location.state} ${location.postcode}
Urgency: ${urgency}
Budget: $${budget} AUD

Contractors to Score:
${contractorsInfo}

Scoring Criteria (total 100 points):
- Service specialty match (30 points): Exact match = 30, Related = 15, Different = 0
- Certification level (15 points): Master = 15, Inspector = 10, Supervisor = 5, Technician = 2, None = 0
- Rating & track record (15 points): Based on average rating (max 5.0) and number of jobs completed
- Response time (10 points): Faster is better (under 30min = 10, 30-60min = 7, 60-120min = 3, over 120min = 1)
- INSURANCE TRAINING (15 points) **REQUIRED FOR INSURANCE-BACKED WORK**: Completed & Valid = 15, Completed but Expired = 5, Not Completed = 0
- PUBLIC LIABILITY $10M (10 points) **REQUIRED FOR INSURANCE-BACKED WORK**: Verified $10M+ & Valid = 10, Verified but Expired = 3, Not Verified = 0
- Urgency match (5 points): Availability matches urgency level

CRITICAL: For insurance-backed claim work, contractors MUST have:
1. Insurance Training Completed and Valid (15 points minimum)
2. $10M+ Public Liability Verified and Valid (10 points minimum)

If either is missing or expired, mark contractor as INELIGIBLE for insurance work but can do cash jobs.

For each contractor, provide a JSON object with:
{
  "contractorId": "string",
  "score": number,
  "eligibleForInsuranceWork": boolean,
  "reasons": ["reason 1", "reason 2", ...]
}

Return ONLY a valid JSON array of objects, nothing else.`;

    const response = await model.invoke([new SystemMessage(SYSTEM_PROMPT), new HumanMessage(prompt)]);

    const content = typeof response.content === 'string' ? response.content : '';

    try {
      const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      const scoredMatches = parsed
        .map(
          (match: any) =>
            ({
              contractorId: match.contractorId,
              score: match.score || 0,
              reasons: [
                ...( match.reasons || []),
                match.eligibleForInsuranceWork ? 'ELIGIBLE for insurance-backed work' : 'NOT ELIGIBLE for insurance-backed work (insurance training or $10M PL missing/expired)'
              ],
            }) as { contractorId: string; score: number; reasons: string[] }
        )
        .sort((a, b) => b.score - a.score);

      return {
        messages: [new AIMessage(content)],
        scoredMatches,
      };
    } catch {
      return {
        messages: [new AIMessage(content)],
        scoredMatches: state.contractorDetails.map((c) => ({
          contractorId: c.contractorId as string,
          score: 50,
          reasons: ['Score could not be calculated, please review manually'],
        })),
      };
    }
  }

  // Node: Analyze matches and select best option
  async function analyzeMatch(state: MatchingState): Promise<Partial<MatchingState>> {
    const criteria = state.criteria;
    if (!criteria) {
      throw new WorkflowError('No criteria for match analysis', 'CONTRACTOR_MATCHING', 'analyze');
    }

    const topMatches = state.scoredMatches.slice(0, 5);
    const topContractorIds = topMatches.map((m) => m.contractorId);
    const relevantDetails = state.contractorDetails.filter((d) => topContractorIds.includes(d.contractorId as string));

    const matchesInfo = topMatches
      .map(
        (match, idx) =>
          `${idx + 1}. Score: ${match.score}/100
     ID: ${match.contractorId}
     Reasons: ${match.reasons.join('; ')}`
      )
      .join('\n');

    const prompt = `Analyse these scored contractors and select the best match for:
Service: ${criteria.serviceType}
Location: ${criteria.location.suburb}, ${criteria.location.state}
Urgency: ${criteria.urgency}
Budget: $${criteria.budget || 'not specified'} AUD

Top Matches (ranked by score):
${matchesInfo}

Provide recommendation as JSON:
{
  "recommendedMatch": "contractor-id",
  "matchingRationale": "Detailed explanation of why this is the best match",
  "alternativeMatches": [
    {
      "contractorId": "id",
      "reason": "Why this is a good alternative"
    }
  ]
}

Return ONLY valid JSON, nothing else.`;

    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      ...state.messages,
      new HumanMessage(prompt),
    ]);

    const content = typeof response.content === 'string' ? response.content : '';

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      const alternativeMatches = (parsed.alternativeMatches || []).map((alt: any) => {
        const detail = state.contractorDetails.find((d) => d.contractorId === alt.contractorId);
        return {
          contractorId: alt.contractorId,
          businessName: (detail?.businessName as string) || 'Unknown',
          score: state.scoredMatches.find((m) => m.contractorId === alt.contractorId)?.score || 0,
          reason: alt.reason,
        };
      });

      return {
        messages: [new AIMessage(content)],
        recommendedMatch: parsed.recommendedMatch || state.scoredMatches[0]?.contractorId || '',
        matchingRationale: parsed.matchingRationale || 'Match selected based on scoring',
        alternativeMatches,
      };
    } catch {
      const firstMatch = state.scoredMatches[0];
      return {
        messages: [new AIMessage(content)],
        recommendedMatch: firstMatch?.contractorId || '',
        matchingRationale: `Top-scored contractor with ${firstMatch?.score || 0} points`,
        alternativeMatches: state.scoredMatches
          .slice(1, 3)
          .map((m) => {
            const detail = state.contractorDetails.find((d) => d.contractorId === m.contractorId);
            return {
              contractorId: m.contractorId,
              businessName: detail?.businessName || 'Unknown',
              score: m.score,
              reason: 'Alternative option',
            };
          }),
      };
    }
  }

  // Node: Generate final recommendation with next steps
  async function generateRecommendation(state: MatchingState): Promise<Partial<MatchingState>> {
    const recommendedId = state.recommendedMatch;
    const recommendedDetail = state.contractorDetails.find((d) => d.contractorId === recommendedId);

    if (!recommendedDetail || !recommendedId) {
      // No contractors found
      return {
        messages: [new AIMessage('No suitable contractors found')],
        noMatchReason: `No contractors specializing in ${state.criteria?.serviceType} found within search radius. Please try a different location or service type.`,
        isComplete: true,
      };
    }

    const prompt = `Generate next steps for the client to contact and work with this contractor:

Contractor: ${recommendedDetail.businessName}
Email: ${recommendedDetail.userEmail}
Service: ${state.criteria?.serviceType}
Location: ${state.criteria?.location.suburb}, ${state.criteria?.location.state}

Provide as JSON:
{
  "nextSteps": ["step 1", "step 2", ...],
  "immediateActions": ["action 1", "action 2"],
  "estimatedResponseTime": "time estimate",
  "keyPoints": ["point 1", "point 2"]
}

Return ONLY valid JSON.`;

    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      ...state.messages,
      new HumanMessage(prompt),
    ]);

    const content = typeof response.content === 'string' ? response.content : '';

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        messages: [new AIMessage(content)],
        isComplete: true,
      };
    } catch {
      return {
        messages: [new AIMessage(content)],
        isComplete: true,
      };
    }
  }

  // Conditional routing based on number of eligible contractors
  function routeByEligibility(state: MatchingState): string {
    if (state.eligibleContractors.length === 0) {
      // No contractors found - go directly to generate recommendation with "no match" message
      return 'generateRecommendation';
    }
    if (state.eligibleContractors.length === 1) {
      // Only one contractor - skip scoring, go directly to analyze
      return 'analyzeMatch';
    }
    // Multiple contractors - score and rank them
    return 'scoreContractors';
  }

  // Build the graph
  const workflow = new StateGraph(ContractorMatchingAnnotation)
    .addNode('findEligibleContractors', findEligibleContractors)
    .addNode('scoreContractors', scoreContractors)
    .addNode('analyzeMatch', analyzeMatch)
    .addNode('generateRecommendation', generateRecommendation)
    .addEdge(START, 'findEligibleContractors')
    .addConditionalEdges('findEligibleContractors', routeByEligibility)
    .addEdge('scoreContractors', 'analyzeMatch')
    .addEdge('analyzeMatch', 'generateRecommendation')
    .addEdge('generateRecommendation', END);

  return workflow;
}

/**
 * Execute the contractor matching workflow
 */
async function executeContractorMatching(
  input: Record<string, unknown>,
  config: WorkflowExecutionConfig
): Promise<Record<string, unknown>> {
  const model = config.provider.getModel();
  const workflow = createContractorMatchingGraph(model);

  // Compile the graph with checkpointer
  const compiledWorkflow = workflow.compile({
    checkpointer: config.checkpointer,
  });

  // Extract criteria from input
  const criteriaInput = input.criteria as Record<string, unknown> || {};
  const criteria: MatchingCriteria = {
    serviceType: (criteriaInput.serviceType as string) || '',
    location: {
      state: ((criteriaInput.location as any)?.state as string) || '',
      suburb: ((criteriaInput.location as any)?.suburb as string) || '',
      postcode: ((criteriaInput.location as any)?.postcode as string) || '',
    },
    urgency: ((criteriaInput.urgency as string) || 'standard') as 'emergency' | 'urgent' | 'standard' | 'flexible',
    budget: (criteriaInput.budget as number) || undefined,
    preferredAvailability: (criteriaInput.preferredAvailability as string) || undefined,
    specialRequirements: (criteriaInput.specialRequirements as string[]) || undefined,
  };

  const clientId = (input.clientId as string) || '';

  // Initial state
  const initialState: Partial<MatchingState> = {
    criteria,
    clientId,
    messages: [],
  };

  // Execute the workflow
  const result = await compiledWorkflow.invoke(initialState, {
    configurable: {
      thread_id: config.threadId,
      job_id: config.jobId,
    },
    recursionLimit: config.maxIterations,
  });

  // Return the matching results
  return {
    recommendedMatch: result.recommendedMatch,
    matchingRationale: result.matchingRationale,
    eligibleContractorCount: result.eligibleContractors.length,
    searchRadius: result.searchRadius,
    contractorDetails: result.contractorDetails
      .filter((d) => d.contractorId === result.recommendedMatch)
      .map((d) => ({
        contractorId: d.contractorId,
        businessName: d.businessName,
        userEmail: d.userEmail,
        specialties: d.specialties,
        certifications: d.certifications,
        rating: d.rating,
        completedJobs: d.completedJobs,
        responseTimeMinutes: d.responseTimeMinutes,
        isNrpgVerified: d.isNrpgVerified,
        publicLiability: d.publicLiability,
      }))[0] || null,
    alternativeMatches: result.alternativeMatches.slice(0, 2),
    noMatchReason: result.noMatchReason,
    scoredMatches: result.scoredMatches.slice(0, 5),
    searchCriteria: {
      serviceType: criteria.serviceType,
      location: `${criteria.location.suburb}, ${criteria.location.state} ${criteria.location.postcode}`,
      urgency: criteria.urgency,
      budget: criteria.budget,
    },
  };
}

// Register the workflow
registerWorkflow('CONTRACTOR_MATCHING', executeContractorMatching);

// Export for direct use
export { createContractorMatchingGraph, executeContractorMatching };
