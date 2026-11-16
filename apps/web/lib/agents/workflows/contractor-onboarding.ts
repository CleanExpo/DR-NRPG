// @ts-nocheck

/**
 * Contractor Onboarding Workflow - LangGraph implementation
 *
 * Phase E.2: Automated contractor verification and onboarding
 *
 * Features:
 * 1. AI Document Verification (certification, ABN, Insurance)
 * 2. Background Assessment (online presence, reviews, risk scoring)
 * 3. Auto-Approve/Flag for Review decision
 */

import { StateGraph, Annotation, END, START } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { registerWorkflow, WorkflowExecutionConfig } from '../core/orchestrator';
import { WorkflowError } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface ContractorApplicationData {
  applicationId: string;
  businessName: string;
  abn: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  businessAddress: {
    street?: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  serviceTypes: string[];
  serviceAreas: string[];
  yearsInBusiness?: number;
  employeeCount?: number;
  documents: {
    iicrcCertificate?: DocumentInfo;
    publicLiabilityInsurance?: DocumentInfo;
    workersCompInsurance?: DocumentInfo;
    abnVerification?: DocumentInfo;
    businessRegistration?: DocumentInfo;
    additionalCertificates?: DocumentInfo[];
  };
  references?: ReferenceInfo[];
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface DocumentInfo {
  url: string;
  fileName: string;
  fileType: string;
  uploadedAt: Date;
}

export interface ReferenceInfo {
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  relationship: string;
}

export type VerificationStatus = 'VERIFIED' | 'UNVERIFIED' | 'INVALID' | 'EXPIRED' | 'PENDING';

export interface DocumentVerificationResult {
  documentType: string;
  status: VerificationStatus;
  confidence: number;
  expiryDate?: Date;
  extractedData?: Record<string, unknown>;
  issues?: string[];
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskAssessment {
  overallRiskScore: number; // 0-100
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  recommendations: string[];
}

export interface RiskFactor {
  factor: string;
  score: number;
  weight: number;
  details: string;
}

export type OnboardingDecision = 'AUTO_APPROVE' | 'MANUAL_REVIEW' | 'REJECT' | 'MORE_INFO_REQUIRED';

// ============================================================================
// STATE ANNOTATION
// ============================================================================

const ContractorOnboardingAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (curr, update) => [...curr, ...update],
    default: () => [],
  }),
  applicationData: Annotation<ContractorApplicationData | null>({
    reducer: (_curr, update) => update,
    default: () => null,
  }),
  documentVerifications: Annotation<DocumentVerificationResult[]>({
    reducer: (_curr, update) => update,
    default: () => [],
  }),
  abnVerificationResult: Annotation<{
    isValid: boolean;
    businessName?: string;
    abnStatus?: string;
    gstRegistered?: boolean;
    mainBusinessLocation?: string;
  } | null>({
    reducer: (_curr, update) => update,
    default: () => null,
  }),
  onlinePresenceAnalysis: Annotation<{
    websiteFound: boolean;
    websiteQuality?: string;
    socialMediaPresence: string[];
    reviewsFound: boolean;
    averageRating?: number;
    totalReviews?: number;
    sentimentAnalysis?: string;
    redFlags?: string[];
  } | null>({
    reducer: (_curr, update) => update,
    default: () => null,
  }),
  riskAssessment: Annotation<RiskAssessment | null>({
    reducer: (_curr, update) => update,
    default: () => null,
  }),
  decision: Annotation<{
    decision: OnboardingDecision;
    reasoning: string;
    nextSteps: string[];
    requiredActions?: string[];
    autoApprovalEligible: boolean;
  } | null>({
    reducer: (_curr, update) => update,
    default: () => null,
  }),
  isComplete: Annotation<boolean>({
    reducer: (_curr, update) => update,
    default: () => false,
  }),
});

type OnboardingState = typeof ContractorOnboardingAnnotation.State;

// ============================================================================
// PROMPTS
// ============================================================================

const SYSTEM_PROMPT = `You are an expert contractor verification specialist for an Australian disaster recovery platform.
Your role is to assess contractor applications for legitimacy, compliance, and risk.

Key verification areas:
1. Industry certification - Must be current and relevant to the restoration work offered (Water, Mould, Fire)
2. ABN - Australian Business Number must be active and match business details
3. Insurance - Public liability (minimum $10M) and workers compensation (if employees)
4. Business legitimacy - Online presence, reviews, professional standing

Australian compliance requirements:
- Valid ABN with correct business type
- GST registration required for businesses >$75k annual revenue
- Appropriate trade licences for state of operation
- QBCC licence for Queensland, Home Building Compensation Fund for NSW

Return structured JSON responses only. Use Australian English.`;

// ============================================================================
// WORKFLOW NODES
// ============================================================================

function createContractorOnboardingGraph(model: BaseChatModel) {
  // Node: Verify documents
  async function verifyDocuments(state: OnboardingState): Promise<Partial<OnboardingState>> {
    const application = state.applicationData;
    if (!application) {
      throw new WorkflowError('No application data', 'CONTRACTOR_ONBOARDING', 'verify_documents');
    }

    const verifications: DocumentVerificationResult[] = [];

    // Build document list for verification
    const documentsToVerify: { type: string; doc: DocumentInfo | undefined }[] = [
      { type: 'IICRC_CERTIFICATE', doc: application.documents.iicrcCertificate },
      { type: 'PUBLIC_LIABILITY_INSURANCE', doc: application.documents.publicLiabilityInsurance },
      { type: 'WORKERS_COMP_INSURANCE', doc: application.documents.workersCompInsurance },
      { type: 'ABN_VERIFICATION', doc: application.documents.abnVerification },
      { type: 'BUSINESS_REGISTRATION', doc: application.documents.businessRegistration },
    ];

    // Add additional certificates
    if (application.documents.additionalCertificates) {
      application.documents.additionalCertificates.forEach((cert, i) => {
        documentsToVerify.push({ type: `ADDITIONAL_CERT_${i + 1}`, doc: cert });
      });
    }

    const prompt = `Verify the following contractor documents for ${application.businessName}:

Service Types Claimed: ${application.serviceTypes.join(', ')}
State of Operation: ${application.businessAddress.state}

Documents Submitted:
${documentsToVerify
  .map(
    (d) =>
      `- ${d.type}: ${d.doc ? `${d.doc.fileName} (${d.doc.fileType})` : 'NOT PROVIDED'}`
  )
  .join('\n')}

For each document, assess:
1. Is the document type appropriate for the claimed services?
2. Based on filename/type, does it appear legitimate?
3. What information should be extracted for verification?
4. Are there any red flags?

Requirements by service type:
- WATER_DAMAGE: current water damage restoration certification
- MOULD_REMEDIATION: current mould remediation certification
- FIRE_RESTORATION: current fire and smoke restoration certification
- All services: Public liability insurance (min $10M), valid ABN

State-specific requirements:
- QLD: QBCC licence required
- NSW: Home Building licence for work >$5,000
- VIC: Registered Building Practitioner for structural work

Respond with ONLY a JSON object:
{
  "verifications": [
    {
      "documentType": "string",
      "status": "VERIFIED|UNVERIFIED|INVALID|EXPIRED|PENDING",
      "confidence": 0.0-1.0,
      "expiryDate": "YYYY-MM-DD or null",
      "extractedData": {},
      "issues": ["issue1", "issue2"]
    }
  ],
  "overallDocumentScore": 0-100,
  "criticalMissing": ["document1", "document2"],
  "recommendations": ["recommendation1"]
}`;

    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(prompt),
    ]);

    const content = typeof response.content === 'string' ? response.content : '';

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      if (parsed.verifications) {
        verifications.push(...parsed.verifications);
      }

      return {
        messages: [new AIMessage(content)],
        documentVerifications: verifications,
      };
    } catch {
      // If parsing fails, mark all as pending
      documentsToVerify.forEach((d) => {
        verifications.push({
          documentType: d.type,
          status: d.doc ? 'PENDING' : 'UNVERIFIED',
          confidence: 0.5,
          issues: d.doc ? [] : ['Document not provided'],
        });
      });

      return {
        messages: [new AIMessage(content)],
        documentVerifications: verifications,
      };
    }
  }

  // Node: Verify ABN
  async function verifyABN(state: OnboardingState): Promise<Partial<OnboardingState>> {
    const application = state.applicationData;
    if (!application) {
      throw new WorkflowError('No application data', 'CONTRACTOR_ONBOARDING', 'verify_abn');
    }

    const prompt = `Verify ABN ${application.abn} for business "${application.businessName}":

Location: ${application.businessAddress.suburb}, ${application.businessAddress.state} ${application.businessAddress.postcode}
Service Types: ${application.serviceTypes.join(', ')}

ABN Validation Rules:
1. Must be 11 digits
2. Check digit validation using weighted sum algorithm
3. Must be currently active
4. Business name should reasonably match
5. GST registration required if annual turnover >$75,000 (likely for restoration contractors)

Perform validation and respond with ONLY a JSON object:
{
  "isValid": boolean,
  "abnFormat": "Valid 11-digit format: true/false",
  "checkDigitValid": boolean,
  "businessName": "extracted or inferred business name",
  "abnStatus": "Active|Cancelled|Inactive",
  "gstRegistered": boolean,
  "mainBusinessLocation": "State",
  "businessType": "Sole Trader|Partnership|Company|Trust",
  "registrationDate": "YYYY-MM-DD or null",
  "issues": ["issue1"],
  "recommendations": ["rec1"]
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
        abnVerificationResult: {
          isValid: parsed.isValid || false,
          businessName: parsed.businessName,
          abnStatus: parsed.abnStatus || 'Unknown',
          gstRegistered: parsed.gstRegistered,
          mainBusinessLocation: parsed.mainBusinessLocation,
        },
      };
    } catch {
      return {
        messages: [new AIMessage(content)],
        abnVerificationResult: {
          isValid: false,
          abnStatus: 'Unable to verify',
        },
      };
    }
  }

  // Node: Analyse online presence
  async function analyseOnlinePresence(state: OnboardingState): Promise<Partial<OnboardingState>> {
    const application = state.applicationData;
    if (!application) {
      throw new WorkflowError('No application data', 'CONTRACTOR_ONBOARDING', 'analyse_presence');
    }

    const prompt = `Analyse online presence for contractor: ${application.businessName}

Website: ${application.website || 'Not provided'}
Social Media:
- Facebook: ${application.socialMedia?.facebook || 'Not provided'}
- Instagram: ${application.socialMedia?.instagram || 'Not provided'}
- LinkedIn: ${application.socialMedia?.linkedin || 'Not provided'}

Location: ${application.businessAddress.suburb}, ${application.businessAddress.state}
Years in Business: ${application.yearsInBusiness || 'Unknown'}
Employee Count: ${application.employeeCount || 'Unknown'}

Assess:
1. Website quality and professionalism (if provided)
2. Social media presence consistency
3. Expected review presence for a business of this type/age
4. Any red flags (fake reviews, complaints, legal issues)
5. Professional associations or industry body memberships

For restoration contractors, look for:
- Industry certification or affiliation mentions
- Insurance Builders Association membership
- Case studies/before-after photos
- Emergency response capability claims

Respond with ONLY a JSON object:
{
  "websiteFound": boolean,
  "websiteQuality": "Professional|Adequate|Poor|Not Assessed",
  "websiteRedFlags": ["flag1"],
  "socialMediaPresence": ["platform1", "platform2"],
  "socialMediaConsistency": "Consistent|Inconsistent|Limited",
  "reviewsFound": boolean,
  "reviewPlatforms": ["Google", "Facebook", "ProductReview"],
  "averageRating": 0.0-5.0,
  "totalReviews": number,
  "sentimentAnalysis": "Positive|Mixed|Negative|Insufficient Data",
  "commonPraises": ["praise1"],
  "commonComplaints": ["complaint1"],
  "redFlags": ["flag1"],
  "professionalIndicators": ["indicator1"],
  "onlinePresenceScore": 0-100,
  "recommendations": ["rec1"]
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
        onlinePresenceAnalysis: {
          websiteFound: parsed.websiteFound || false,
          websiteQuality: parsed.websiteQuality,
          socialMediaPresence: parsed.socialMediaPresence || [],
          reviewsFound: parsed.reviewsFound || false,
          averageRating: parsed.averageRating,
          totalReviews: parsed.totalReviews,
          sentimentAnalysis: parsed.sentimentAnalysis,
          redFlags: parsed.redFlags || [],
        },
      };
    } catch {
      return {
        messages: [new AIMessage(content)],
        onlinePresenceAnalysis: {
          websiteFound: false,
          socialMediaPresence: [],
          reviewsFound: false,
          redFlags: ['Unable to analyse online presence'],
        },
      };
    }
  }

  // Node: Assess risk
  async function assessRisk(state: OnboardingState): Promise<Partial<OnboardingState>> {
    const application = state.applicationData;
    if (!application) {
      throw new WorkflowError('No application data', 'CONTRACTOR_ONBOARDING', 'assess_risk');
    }

    const documentSummary = state.documentVerifications
      .map((d) => `${d.documentType}: ${d.status} (${Math.round(d.confidence * 100)}%)`)
      .join('\n');

    const prompt = `Perform comprehensive risk assessment for contractor application:

Business: ${application.businessName}
ABN: ${application.abn}
Location: ${application.businessAddress.state}
Services: ${application.serviceTypes.join(', ')}
Years in Business: ${application.yearsInBusiness || 'Unknown'}

Document Verification Summary:
${documentSummary}

ABN Verification:
${state.abnVerificationResult ? JSON.stringify(state.abnVerificationResult, null, 2) : 'Not verified'}

Online Presence:
${state.onlinePresenceAnalysis ? JSON.stringify(state.onlinePresenceAnalysis, null, 2) : 'Not analysed'}

Risk Factors to Consider (weighted):
1. Document Compliance (30%) - Valid certs, insurance, licences
2. Business Legitimacy (25%) - ABN status, business age, online presence
3. Service Capability (20%) - Appropriate certs for claimed services
4. Reputation (15%) - Reviews, complaints, red flags
5. Insurance Coverage (10%) - Adequate coverage levels

Respond with ONLY a JSON object:
{
  "overallRiskScore": 0-100,
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "factors": [
    {
      "factor": "Document Compliance",
      "score": 0-100,
      "weight": 0.30,
      "details": "explanation"
    }
  ],
  "criticalIssues": ["issue1"],
  "warningIssues": ["warning1"],
  "positiveIndicators": ["positive1"],
  "recommendations": ["rec1"],
  "autoApprovalEligible": boolean,
  "manualReviewRequired": boolean,
  "rejectionRecommended": boolean
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

      const riskLevel: RiskLevel =
        parsed.overallRiskScore >= 80
          ? 'LOW'
          : parsed.overallRiskScore >= 60
            ? 'MEDIUM'
            : parsed.overallRiskScore >= 40
              ? 'HIGH'
              : 'CRITICAL';

      return {
        messages: [new AIMessage(content)],
        riskAssessment: {
          overallRiskScore: parsed.overallRiskScore || 50,
          riskLevel,
          factors: parsed.factors || [],
          recommendations: parsed.recommendations || [],
        },
      };
    } catch {
      return {
        messages: [new AIMessage(content)],
        riskAssessment: {
          overallRiskScore: 50,
          riskLevel: 'MEDIUM',
          factors: [],
          recommendations: ['Manual review recommended due to assessment failure'],
        },
      };
    }
  }

  // Node: Make decision
  async function makeDecision(state: OnboardingState): Promise<Partial<OnboardingState>> {
    const application = state.applicationData;
    if (!application) {
      throw new WorkflowError('No application data', 'CONTRACTOR_ONBOARDING', 'make_decision');
    }

    const riskScore = state.riskAssessment?.overallRiskScore || 50;
    const riskLevel = state.riskAssessment?.riskLevel || 'MEDIUM';

    // Check for critical missing documents
    const criticalDocs = ['IICRC_CERTIFICATE', 'PUBLIC_LIABILITY_INSURANCE'];
    const missingCritical = state.documentVerifications
      .filter((d) => criticalDocs.includes(d.documentType) && d.status !== 'VERIFIED')
      .map((d) => d.documentType);

    // Check ABN validity
    const abnValid = state.abnVerificationResult?.isValid || false;

    // Check for red flags
    const redFlags = state.onlinePresenceAnalysis?.redFlags || [];

    const prompt = `Make final onboarding decision for ${application.businessName}:

Risk Assessment:
- Overall Score: ${riskScore}/100
- Risk Level: ${riskLevel}

Document Status:
${state.documentVerifications.map((d) => `- ${d.documentType}: ${d.status}`).join('\n')}

Missing Critical Documents: ${missingCritical.length > 0 ? missingCritical.join(', ') : 'None'}

ABN Valid: ${abnValid}
Red Flags: ${redFlags.length > 0 ? redFlags.join(', ') : 'None'}

Online Presence:
- Reviews: ${state.onlinePresenceAnalysis?.averageRating || 'N/A'}/5 (${state.onlinePresenceAnalysis?.totalReviews || 0} reviews)
- Sentiment: ${state.onlinePresenceAnalysis?.sentimentAnalysis || 'Unknown'}

Decision Criteria:
AUTO_APPROVE (risk score >=80, no missing critical docs, ABN valid, no red flags):
- All documents verified
- ABN active and matching
- Good online presence
- No red flags

MANUAL_REVIEW (risk score 50-79 OR minor issues):
- Some documents pending verification
- Minor discrepancies
- Limited online presence
- Requires human assessment

MORE_INFO_REQUIRED (missing documents or information):
- Critical documents missing
- ABN issues that could be resolved
- Information gaps

REJECT (risk score <40 OR critical issues):
- Invalid/expired critical documents
- ABN cancelled or fraudulent
- Multiple red flags
- Serious complaints or legal issues

Respond with ONLY a JSON object:
{
  "decision": "AUTO_APPROVE|MANUAL_REVIEW|MORE_INFO_REQUIRED|REJECT",
  "confidence": 0.0-1.0,
  "reasoning": "detailed explanation",
  "nextSteps": ["step1", "step2"],
  "requiredActions": ["action1 if MORE_INFO_REQUIRED"],
  "autoApprovalEligible": boolean,
  "estimatedOnboardingTime": "X business days",
  "recommendedTier": "STANDARD|PREFERRED|PREMIUM",
  "specialConditions": ["condition1"]
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

      // Default decision based on rules
      let decision: OnboardingDecision = 'MANUAL_REVIEW';

      if (riskScore >= 80 && missingCritical.length === 0 && abnValid && redFlags.length === 0) {
        decision = 'AUTO_APPROVE';
      } else if (missingCritical.length > 0) {
        decision = 'MORE_INFO_REQUIRED';
      } else if (riskScore < 40 || redFlags.length >= 3) {
        decision = 'REJECT';
      }

      // Override with AI decision if reasonable
      if (parsed.decision && ['AUTO_APPROVE', 'MANUAL_REVIEW', 'MORE_INFO_REQUIRED', 'REJECT'].includes(parsed.decision)) {
        // Only allow auto-approve if conditions truly met
        if (parsed.decision === 'AUTO_APPROVE' && (missingCritical.length > 0 || !abnValid)) {
          decision = 'MANUAL_REVIEW';
        } else {
          decision = parsed.decision as OnboardingDecision;
        }
      }

      return {
        messages: [new AIMessage(content)],
        decision: {
          decision,
          reasoning: parsed.reasoning || 'Assessment complete',
          nextSteps: parsed.nextSteps || ['Review application'],
          requiredActions: parsed.requiredActions,
          autoApprovalEligible: decision === 'AUTO_APPROVE',
        },
        isComplete: true,
      };
    } catch {
      return {
        messages: [new AIMessage(content)],
        decision: {
          decision: 'MANUAL_REVIEW',
          reasoning: 'Decision processing failed, manual review required',
          nextSteps: ['Assign to admin for manual review'],
          autoApprovalEligible: false,
        },
        isComplete: true,
      };
    }
  }

  // Build the graph
  const workflow = new StateGraph(ContractorOnboardingAnnotation)
    .addNode('verifyDocuments', verifyDocuments)
    .addNode('verifyABN', verifyABN)
    .addNode('analyseOnlinePresence', analyseOnlinePresence)
    .addNode('assessRisk', assessRisk)
    .addNode('makeDecision', makeDecision)
    .addEdge(START, 'verifyDocuments')
    .addEdge('verifyDocuments', 'verifyABN')
    .addEdge('verifyABN', 'analyseOnlinePresence')
    .addEdge('analyseOnlinePresence', 'assessRisk')
    .addEdge('assessRisk', 'makeDecision')
    .addEdge('makeDecision', END);

  return workflow;
}

// ============================================================================
// WORKFLOW EXECUTOR
// ============================================================================

async function executeContractorOnboarding(
  input: Record<string, unknown>,
  config: WorkflowExecutionConfig
): Promise<Record<string, unknown>> {
  const model = config.provider.getModel();
  const workflow = createContractorOnboardingGraph(model);

  const compiledWorkflow = workflow.compile({
    checkpointer: config.checkpointer,
  });

  // Extract application data from input
  const applicationInput = input.application as Record<string, unknown> || {};

  const applicationData: ContractorApplicationData = {
    applicationId: (applicationInput.applicationId as string) || config.jobId,
    businessName: (applicationInput.businessName as string) || 'Unknown Business',
    abn: (applicationInput.abn as string) || '',
    contactName: (applicationInput.contactName as string) || '',
    contactEmail: (applicationInput.contactEmail as string) || '',
    contactPhone: applicationInput.contactPhone as string | undefined,
    businessAddress: {
      street: (applicationInput.businessAddress as Record<string, unknown>)?.street as string | undefined,
      suburb: ((applicationInput.businessAddress as Record<string, unknown>)?.suburb as string) || '',
      state: ((applicationInput.businessAddress as Record<string, unknown>)?.state as string) || 'NSW',
      postcode: ((applicationInput.businessAddress as Record<string, unknown>)?.postcode as string) || '',
    },
    serviceTypes: (applicationInput.serviceTypes as string[]) || [],
    serviceAreas: (applicationInput.serviceAreas as string[]) || [],
    yearsInBusiness: applicationInput.yearsInBusiness as number | undefined,
    employeeCount: applicationInput.employeeCount as number | undefined,
    documents: {
      iicrcCertificate: applicationInput.documents
        ? (applicationInput.documents as Record<string, unknown>).iicrcCertificate as DocumentInfo | undefined
        : undefined,
      publicLiabilityInsurance: applicationInput.documents
        ? (applicationInput.documents as Record<string, unknown>).publicLiabilityInsurance as DocumentInfo | undefined
        : undefined,
      workersCompInsurance: applicationInput.documents
        ? (applicationInput.documents as Record<string, unknown>).workersCompInsurance as DocumentInfo | undefined
        : undefined,
    },
    website: applicationInput.website as string | undefined,
    socialMedia: applicationInput.socialMedia as {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
    } | undefined,
  };

  const initialState: Partial<OnboardingState> = {
    applicationData,
    messages: [],
  };

  const result = await compiledWorkflow.invoke(initialState, {
    configurable: {
      thread_id: config.threadId,
      job_id: config.jobId,
    },
    recursionLimit: config.maxIterations,
  });

  return {
    applicationId: applicationData.applicationId,
    businessName: applicationData.businessName,
    decision: result.decision,
    documentVerifications: result.documentVerifications,
    abnVerification: result.abnVerificationResult,
    onlinePresence: result.onlinePresenceAnalysis,
    riskAssessment: result.riskAssessment,
    summary: {
      riskScore: result.riskAssessment?.overallRiskScore || 0,
      riskLevel: result.riskAssessment?.riskLevel || 'UNKNOWN',
      decision: result.decision?.decision || 'PENDING',
      autoApprovalEligible: result.decision?.autoApprovalEligible || false,
      nextSteps: result.decision?.nextSteps || [],
    },
  };
}

// Register the workflow
registerWorkflow('CONTRACTOR_ONBOARDING' as any, executeContractorOnboarding);

// Export for direct use
export { createContractorOnboardingGraph, executeContractorOnboarding };
