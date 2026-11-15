/**
 * Claim Processing Workflow - LangGraph implementation
 * Validates, analyses, and processes insurance claims for Australian restoration services
 */

import { StateGraph, Annotation, END, START } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { registerWorkflow, WorkflowExecutionConfig } from '../core/orchestrator';
import { ClaimDetails, ClaimProcessingState, WorkflowError } from '../types';

// State annotation for the claim processing workflow
const ClaimProcessingAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (curr, update) => [...curr, ...update],
    default: () => [],
  }),
  claimData: Annotation<ClaimDetails | null>({
    reducer: (_curr, update) => update,
    default: () => null,
  }),
  validationStatus: Annotation<'valid' | 'invalid' | 'needs_info'>({
    reducer: (_curr, update) => update,
    default: () => 'needs_info' as const,
  }),
  validationErrors: Annotation<string[]>({
    reducer: (_curr, update) => update,
    default: () => [],
  }),
  missingFields: Annotation<string[]>({
    reducer: (_curr, update) => update,
    default: () => [],
  }),
  extractedInfo: Annotation<Record<string, unknown>>({
    reducer: (_curr, update) => ({ ...(_curr || {}), ...update }),
    default: () => ({}),
  }),
  recommendedCategory: Annotation<string>({
    reducer: (_curr, update) => update,
    default: () => '',
  }),
  estimatedValue: Annotation<number>({
    reducer: (_curr, update) => update,
    default: () => 0,
  }),
  providerGuidance: Annotation<string>({
    reducer: (_curr, update) => update,
    default: () => '',
  }),
  nextSteps: Annotation<string[]>({
    reducer: (_curr, update) => update,
    default: () => [],
  }),
  documentChecklist: Annotation<string[]>({
    reducer: (_curr, update) => update,
    default: () => [],
  }),
  isComplete: Annotation<boolean>({
    reducer: (_curr, update) => update,
    default: () => false,
  }),
});

type ClaimState = typeof ClaimProcessingAnnotation.State;

// System prompt for the claim processing specialist (Snake Build Pattern - Minimal)
const SYSTEM_PROMPT = `You are an insurance claim specialist for Australian disaster recovery.
Use Australian English. Reference /australian-insurance-standards skill for coverage rules.
Reference /iicrc-validator for damage assessment standards. Follow recognised industry standards; do not name a standard by number or title.
Reference /australian-business-validator for pricing and compliance.
Return structured JSON responses only.`;

// Provider-specific information
const PROVIDER_INFO: Record<string, { phone: string; requirements: string[] }> = {
  NRMA: {
    phone: '13 21 32',
    requirements: ['2+ incident photos', 'Written quote', 'Proof of incident', 'Policy document'],
  },
  SUNCORP: {
    phone: '13 11 52',
    requirements: ['3+ photos per damage area', 'Detailed damage report', 'Professional quote', 'Incident documentation'],
  },
  ALLIANZ: {
    phone: '1300 139 000',
    requirements: ['Photo evidence', 'Quote from licensed contractor', 'Incident report', 'Policy details'],
  },
  QBE: {
    phone: '1300 651 000',
    requirements: ['Damage photos', 'Written quotation', 'Incident timeline', 'Policy confirmation'],
  },
  IAG: {
    phone: '13 13 27',
    requirements: ['Photographic evidence', 'Professional assessment', 'Scope of works', 'Insurance details'],
  },
  CGU: {
    phone: '1300 366 222',
    requirements: ['Incident photos', 'Repair quotation', 'Claim form', 'Supporting documents'],
  },
  MEDIBANK: {
    phone: '1800 644 325',
    requirements: ['Photo documentation', 'Expert quote', 'Claim details', 'Policy paperwork'],
  },
  OTHER: {
    phone: 'Check your policy',
    requirements: ['Contact your insurer', 'Gather documentation', 'Follow their process'],
  },
};

/**
 * Create the claim processing workflow graph
 */
function createClaimProcessingGraph(model: BaseChatModel) {
  // Node: Validate claim data
  async function validateClaim(state: ClaimState): Promise<Partial<ClaimState>> {
    const claim = state.claimData;
    if (!claim) {
      throw new WorkflowError('No claim data provided', 'CLAIM_PROCESSING', 'validate');
    }

    const prompt = `Validate this insurance claim for completeness and correctness:

Insurance Provider: ${claim.insurerName}
Policy Number: ${claim.policyNumber}
Incident Date: ${claim.incidentDate}
Damage Description: ${claim.damageDescription}
Estimated Value: $${claim.estimatedValue || 'unknown'} AUD
Has Photos: ${claim.documentUrls && claim.documentUrls.length > 0 ? 'Yes (' + claim.documentUrls.length + ')' : 'No'}

Task:
1. Auto-detect insurer from policy number format (if not provided):
   - NRMA: starts with 9, 13, or 4-digit numerics
   - Suncorp: typically 7-9 digits
   - Allianz: often starts with letters
   - Reference /australian-insurance-standards for insurer policy formats
2. Validate policy number format for detected insurer
3. Check incident date is within 90 days (per Insurance Code of Practice)
4. Verify damage description (minimum 50 characters)
5. Check minimum 2 photos (NRMA requirement) or 3+ per area (Suncorp requirement)
6. Check estimated value is reasonable ($100-$500,000 for residential)

Respond with ONLY a JSON object: {
  "isValid": boolean,
  "detectedInsurer": "NRMA|SUNCORP|ALLIANZ|QBE|IAG|CGU|MEDIBANK|OTHER",
  "errors": ["error 1", "error 2"],
  "missingFields": ["field1", "field2"],
  "codesOfPracticeNotes": "3-day acknowledgment, 10-day response timeline applies",
  "notes": "any additional notes"
}`;

    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(prompt),
    ]);

    const content = typeof response.content === 'string' ? response.content : '';

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      const isValid = parsed.isValid && (!parsed.errors || parsed.errors.length === 0);
      const errors = parsed.errors || [];
      const missing = parsed.missingFields || [];

      // Update claim data with auto-detected insurer if provided
      if (parsed.detectedInsurer && parsed.detectedInsurer !== 'OTHER') {
        claim.insurerName = parsed.detectedInsurer;
      }

      return {
        messages: [new AIMessage(content)],
        validationStatus: isValid ? 'valid' : errors.length > 0 ? 'invalid' : 'needs_info',
        validationErrors: errors,
        missingFields: missing,
        claimData: claim,  // Update with detected insurer
        providerGuidance: parsed.codesOfPracticeNotes || '',
      };
    } catch {
      return {
        messages: [new AIMessage(content)],
        validationStatus: 'needs_info',
        validationErrors: ['Unable to validate claim - please review manually'],
        missingFields: [],
      };
    }
  }

  // Node: Extract claim information
  async function extractInformation(state: ClaimState): Promise<Partial<ClaimState>> {
    const claim = state.claimData;
    if (!claim) {
      throw new WorkflowError('No claim data for extraction', 'CLAIM_PROCESSING', 'extract');
    }

    const prompt = `Extract structured information from this claim:

Description: ${claim.damageDescription}

Identify and extract:
1. Damage Type (water, fire, mould, storm, other)
2. Affected Areas/Rooms (list specific locations)
3. Urgency Level (emergency <24h, urgent <7 days, standard)
4. Timeline (when did damage occur - today, week, month, etc)
5. Secondary Damage Risks (mould, structural, electrical hazards)
6. Estimated Affected Area (square metres if possible)
7. Photos/Documents Provided: ${claim.documentUrls?.length || 0} document(s)

Respond with ONLY a JSON object: {
  "damageType": "string",
  "affectedAreas": ["area1", "area2"],
  "urgencyLevel": "emergency|urgent|standard",
  "timeline": "string",
  "secondaryRisks": ["risk1", "risk2"],
  "estimatedArea": "string",
  "complexity": "simple|moderate|complex"
}`;

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
        extractedInfo: {
          damageType: parsed.damageType || 'unknown',
          affectedAreas: parsed.affectedAreas || [],
          urgencyLevel: parsed.urgencyLevel || 'standard',
          timeline: parsed.timeline || 'recent',
          secondaryRisks: parsed.secondaryRisks || [],
          estimatedArea: parsed.estimatedArea || 'not specified',
          complexity: parsed.complexity || 'moderate',
        },
      };
    } catch {
      return {
        messages: [new AIMessage(content)],
        extractedInfo: {
          damageType: 'unknown',
          affectedAreas: [],
          urgencyLevel: 'standard',
        },
      };
    }
  }

  // Node: Assess requirements and estimate value
  async function assessRequirements(state: ClaimState): Promise<Partial<ClaimState>> {
    const claim = state.claimData;
    if (!claim) {
      throw new WorkflowError('No claim data for assessment', 'CLAIM_PROCESSING', 'assess');
    }

    const damageType = (state.extractedInfo.damageType as string) || 'unknown';
    const estimatedArea = (state.extractedInfo.estimatedArea as string) || '5m²';

    const prompt = `Assess claim requirements and estimate repair costs for ${claim.insurerName}:

Damage Type: ${damageType}
Estimated Area: ${estimatedArea}
Description: ${claim.damageDescription}

Task:
1. Reference /australian-insurance-standards for ${claim.insurerName}-specific documentation requirements:
   - NRMA: minimum 2+ incident photos, written quote, proof of incident
   - Suncorp: minimum 3+ photos per damage area, detailed damage report, professional quote
   - Allianz: photo evidence, licensed contractor quote, incident report
   - Others: check /australian-insurance-standards for specific requirements
2. Reference /iicrc-validator for damage category assessment (water, mould, fire). Follow recognised industry standards; do not name a standard by number or title
3. Estimate repair cost (labour, materials, equipment) with GST (10% Australian GST applies)
4. Identify policy exclusions to watch (reference /australian-insurance-standards for mandatory exclusions)
5. Reference Code of Practice: Claims should be assessed within 4 months standard, with progress updates every 20 days
6. Consider insurer-specific processing preferences (NRMA faster, Suncorp requires more detail)

Respond with ONLY a JSON object: {
  "requiredDocuments": ["doc1 - required by ${claim.insurerName}", "doc2"],
  "estimatedCostAUD": number,
  "gstIncluded": boolean,
  "professionalAssessmentRequired": boolean,
  "assessmentCost": number,
  "exclusionsToWatch": ["exclusion per policy"],
  "repairTimeline": "X days typical",
  "iicrcStandard": "recognised industry standards for the damage type",
  "codesOfPracticeTimeline": "3-day acknowledgment, 10-day response, 20-day progress update minimum",
  "providerSpecificNotes": "notes for ${claim.insurerName} processing"
}`;

    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      ...state.messages,
      new HumanMessage(prompt),
    ]);

    const content = typeof response.content === 'string' ? response.content : '';

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      const costWithoutGst = parsed.estimatedCostAUD || 0;
      const finalCost = parsed.gstIncluded ? costWithoutGst : costWithoutGst * 1.1;

      return {
        messages: [new AIMessage(content)],
        estimatedValue: Math.round(finalCost),
        documentChecklist: parsed.requiredDocuments || ['Photo documentation', 'Written quote', 'Policy details'],
        recommendedCategory: parsed.iicrcStandard || 'IICRC Assessment Required',
        providerGuidance: `${parsed.providerSpecificNotes || 'Contact your insurer for specific requirements'}. Code of Practice Timeframes: ${parsed.codesOfPracticeTimeline || '3-day ack, 10-day response, 20-day updates'}`,
        nextSteps: [
          `Gather documentation per ${claim.insurerName} requirements: ${(parsed.requiredDocuments || []).join(', ')}`,
          'Submit claim with all required evidence',
          `Expect initial response within 10 business days (Insurance Code of Practice)`,
          'Provide regular updates every 20 days minimum during assessment'
        ],
      };
    } catch {
      return {
        messages: [new AIMessage(content)],
        estimatedValue: claim.estimatedValue || 0,
      };
    }
  }

  // Node: Generate guidance for client
  async function generateGuidance(state: ClaimState): Promise<Partial<ClaimState>> {
    const claim = state.claimData;
    const provider = claim?.insurerName || 'your insurer';
    const providerData = PROVIDER_INFO[provider] || PROVIDER_INFO.OTHER;
    const isValid = state.validationStatus === 'valid';

    const prompt = `Generate step-by-step guidance for this insurance claim:

Claim Status: ${state.validationStatus}
${state.validationErrors.length > 0 ? `Issues to Address: ${state.validationErrors.join(', ')}` : ''}
Insurer: ${provider}
Damage Type: ${(state.extractedInfo.damageType as string) || 'water damage'}
Estimated Cost: $${state.estimatedValue} AUD
Documents Provided: ${claim?.documentUrls?.length || 0}

Task:
1. Reference /australian-insurance-standards for Code of Practice timeframes (3-day acknowledgment, 10-day response, 20-day progress updates, 4-month decision, 30-day complaint resolution)
2. Include consumer rights information (AFCA escalation available after 30 days, cooling-off period is 14-21 days)
3. Reference ${provider}-specific requirements from /australian-insurance-standards
4. Generate actionable next steps (immediate <24h, documentation, submission, follow-up)
5. Include key consumer rights and when to escalate to AFCA

Respond with ONLY a JSON object: {
  "nextSteps": ["step 1", "step 2", ...],
  "immediateActions": ["action 1", "action 2"],
  "documentationTips": ["tip 1", "tip 2"],
  "timeline": "3 days: insurer acknowledges | 10 days: initial response | 20 days: progress updates | 4 months: decision expected",
  "consumerRights": ["14-21 day cooling-off period", "AFCA escalation available after 30 days", "right to request written explanation"],
  "importantNotes": ["note 1", "note 2"],
  "whenToEscalate": "If not resolved in 30 days or coverage disputed, contact AFCA at afca.org.au or 1800 931 678",
  "emergencyContacts": {
    "insurer": "${providerData.phone}",
    "disasterRecovery": "support@disasterrecovery.com.au",
    "afca": "1800 931 678"
  }
}`;


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
        nextSteps: parsed.nextSteps || ['Contact your insurer', 'Gather documentation', 'Submit claim'],
        providerGuidance: `Consumer Rights: ${parsed.consumerRights?.join('; ') || 'Access to cooling-off period and AFCA escalation'}. ${parsed.whenToEscalate || 'AFCA available after 30 days'}`,
        isComplete: true,
      };
    } catch {
      return {
        messages: [new AIMessage(content)],
        nextSteps: [
          `Contact ${provider} at ${providerData.phone}`,
          'Provide all required documentation',
          'Expect 10-day response per Code of Practice',
          'You have right to AFCA escalation after 30 days if unresolved',
        ],
        isComplete: true,
      };
    }
  }

  // Conditional routing based on validation
  function routeByValidation(state: ClaimState): string {
    if (state.validationStatus === 'valid') {
      return 'extractInformation';
    }
    // For invalid or needs_info, still proceed but flag issues
    return 'extractInformation';
  }

  // Build the graph
  const workflow = new StateGraph(ClaimProcessingAnnotation)
    .addNode('validateClaim', validateClaim)
    .addNode('extractInformation', extractInformation)
    .addNode('assessRequirements', assessRequirements)
    .addNode('generateGuidance', generateGuidance)
    .addEdge(START, 'validateClaim')
    .addConditionalEdges('validateClaim', routeByValidation)
    .addEdge('extractInformation', 'assessRequirements')
    .addEdge('assessRequirements', 'generateGuidance')
    .addEdge('generateGuidance', END);

  return workflow;
}

/**
 * Execute the claim processing workflow
 */
async function executeClaimProcessing(
  input: Record<string, unknown>,
  config: WorkflowExecutionConfig
): Promise<Record<string, unknown>> {
  const model = config.provider.getModel();
  const workflow = createClaimProcessingGraph(model);

  // Compile the graph with checkpointer
  const compiledWorkflow = workflow.compile({
    checkpointer: config.checkpointer as any,
  });

  // Extract claim details from input
  const claimInput = input.claim as Record<string, unknown> || {};
  const claim: ClaimDetails = {
    claimId: (claimInput.claimId as string) || undefined,
    insurerName: (claimInput.insurerName as string) || 'OTHER',
    policyNumber: (claimInput.policyNumber as string) || '',
    incidentDate: claimInput.incidentDate ? new Date(claimInput.incidentDate as string) : new Date(),
    damageDescription: (claimInput.damageDescription as string) || '',
    estimatedValue: (claimInput.estimatedValue as number) || undefined,
    documentUrls: (claimInput.documentUrls as string[]) || undefined,
    contactName: (claimInput.contactName as string) || undefined,
    contactEmail: (claimInput.contactEmail as string) || undefined,
    contactPhone: (claimInput.contactPhone as string) || undefined,
  };

  // Initial state
  const initialState: Partial<ClaimState> = {
    claimData: claim,
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

  // Return the analysis results
  return {
    validationStatus: result.validationStatus,
    validationErrors: result.validationErrors,
    missingFields: result.missingFields,
    extractedInfo: result.extractedInfo,
    recommendedCategory: result.recommendedCategory,
    estimatedValue: result.estimatedValue,
    providerGuidance: result.providerGuidance,
    nextSteps: result.nextSteps,
    documentChecklist: result.documentChecklist,
    claimSummary: {
      insurer: claim.insurerName,
      policyNumber: claim.policyNumber,
      damageType: (result.extractedInfo as Record<string, unknown>)?.damageType || 'unknown',
      status: result.validationStatus,
    },
  };
}

// Register the workflow
registerWorkflow('CLAIM_PROCESSING', executeClaimProcessing);

// Export for direct use
export { createClaimProcessingGraph, executeClaimProcessing };
