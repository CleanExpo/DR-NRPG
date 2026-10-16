/**
 * Agent Orchestration System - Type Definitions
 * LangGraph-based agent orchestration for Disaster Recovery - NRPG
 */

import { BaseMessage } from '@langchain/core/messages';

// ============================================================================
// ENUMS
// ============================================================================

export type AgentJobStatus =
  | 'PENDING'
  | 'ROUTING'
  | 'PROCESSING'
  | 'AWAITING_HUMAN'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type WorkflowType =
  | 'DISASTER_ANALYSIS'
  | 'CLAIM_PROCESSING'
  | 'CONTRACTOR_MATCHING'
  | 'INSPECTION_REPORT'
  | 'CUSTOMER_SUPPORT'
  | 'CUSTOM';

export type AIProviderType = 'anthropic' | 'openai' | 'ollama' | 'vertexai';

// ============================================================================
// AGENT STATE
// ============================================================================

export interface AgentMetadata {
  startedAt: Date;
  iterations: number;
  tokensUsed: number;
  toolsCalled: string[];
  currentNode: string;
  errors: string[];
}

export interface AgentState {
  messages: BaseMessage[];
  context: Record<string, unknown>;
  currentAgent: string;
  workflow: WorkflowType;
  userId: string;
  tenantId?: string;
  metadata: AgentMetadata;
  output?: Record<string, unknown>;
  isComplete: boolean;
  requiresHumanInput: boolean;
}

// ============================================================================
// DISASTER ANALYSIS WORKFLOW STATE
// ============================================================================

export interface DisasterScenario {
  type: string;
  severity: number;
  description: string;
  affectedAreas: string[];
  location?: {
    state: string;
    suburb: string;
    postcode: string;
  };
}

export interface DisasterAnalysisState extends AgentState {
  input: {
    scenario: DisasterScenario;
    documentContent?: string;
  };
  analysis: {
    disasterType?: string;
    severityAssessment?: number;
    immediateActions?: string[];
    recoveryPlan?: string;
    resourceNeeds?: string[];
    estimatedCost?: number;
    timeline?: string;
    riskFactors?: string[];
  };
}

// ============================================================================
// CLAIM PROCESSING WORKFLOW STATE
// ============================================================================

export interface ClaimDetails {
  claimId?: string;
  insurerName: string;
  policyNumber: string;
  incidentDate: Date;
  damageDescription: string;
  estimatedValue?: number;
  documentUrls?: string[];
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ClaimProcessingState extends AgentState {
  input: {
    claim: ClaimDetails;
    clientId: string;
  };
  processing: {
    validationStatus?: 'valid' | 'invalid' | 'needs_info';
    validationErrors?: string[];
    extractedInfo?: Record<string, unknown>;
    recommendedCategory?: string;
    suggestedContractors?: string[];
    nextSteps?: string[];
  };
}

// ============================================================================
// CONTRACTOR MATCHING WORKFLOW STATE
// ============================================================================

export interface MatchingCriteria {
  serviceType: string;
  location: {
    state: string;
    suburb: string;
    postcode: string;
  };
  urgency: 'emergency' | 'urgent' | 'standard' | 'flexible';
  budget?: number;
  preferredAvailability?: string;
  specialRequirements?: string[];
}

export interface ContractorMatchingState extends AgentState {
  input: {
    criteria: MatchingCriteria;
    clientId: string;
  };
  matching: {
    eligibleContractors?: string[];
    scoredMatches?: Array<{
      contractorId: string;
      score: number;
      reasons: string[];
    }>;
    recommendedMatch?: string;
    matchingRationale?: string;
  };
}

// ============================================================================
// INSPECTION REPORT WORKFLOW STATE
// ============================================================================

export interface InspectionInput {
  propertyId: string;
  inspectionType: string;
  damageAreas: Array<{
    location: string;
    damageType: string;
    severity: number;
    photos?: string[];
  }>;
  moistureReadings?: Array<{
    location: string;
    reading: number;
    material: string;
  }>;
  notes?: string;
}

export interface InspectionReportState extends AgentState {
  input: {
    inspection: InspectionInput;
    inspectorId: string;
  };
  report: {
    summary?: string;
    damageAssessment?: string;
    categoryClassification?: string;
    recommendedActions?: string[];
    costEstimate?: {
      labour: number;
      materials: number;
      equipment: number;
      total: number;
    };
    complianceNotes?: string[];
    reportDraft?: string;
  };
}

// ============================================================================
// CUSTOMER SUPPORT WORKFLOW STATE
// ============================================================================

export interface SupportQuery {
  query: string;
  category?: string;
  previousInteractions?: Array<{
    timestamp: Date;
    query: string;
    response: string;
  }>;
}

export interface CustomerSupportState extends AgentState {
  input: {
    query: SupportQuery;
    customerId: string;
  };
  support: {
    intent?: string;
    sentiment?: 'positive' | 'neutral' | 'negative' | 'urgent';
    suggestedResponse?: string;
    escalationRequired?: boolean;
    relatedArticles?: string[];
    actionsTaken?: string[];
  };
}

// ============================================================================
// PROVIDER CONFIGURATION
// ============================================================================

export interface AIProviderConfig {
  type: AIProviderType;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface ProviderHealth {
  available: boolean;
  latencyMs?: number;
  lastChecked: Date;
  error?: string;
}

// ============================================================================
// ORCHESTRATOR CONFIGURATION
// ============================================================================

export interface OrchestratorConfig {
  defaultProvider: AIProviderType;
  providers: Partial<Record<AIProviderType, AIProviderConfig>>;
  maxIterations: number;
  timeoutMs: number;
  enableStreaming: boolean;
  checkpointerType: 'prisma' | 'redis' | 'memory';
}

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
  error?: string;
  durationMs?: number;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}

// ============================================================================
// JOB & STEP TYPES
// ============================================================================

export interface AgentJobInput {
  workflowType: WorkflowType;
  input: Record<string, unknown>;
  userId: string;
  tenantId?: string;
  priority?: number;
  metadata?: Record<string, unknown>;
}

export interface AgentJobResult {
  jobId: string;
  status: AgentJobStatus;
  output?: Record<string, unknown>;
  error?: string;
  metrics: {
    totalTokens: number;
    totalCost: number;
    iterations: number;
    durationMs: number;
  };
}

export interface AgentJobStepData {
  nodeName: string;
  agentName?: string;
  toolName?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  promptTokens?: number;
  completionTokens?: number;
  durationMs?: number;
  error?: string;
}

// ============================================================================
// STREAMING TYPES
// ============================================================================

export interface StreamEvent {
  type: 'node_start' | 'node_end' | 'tool_call' | 'message' | 'error' | 'complete';
  node?: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

export interface StreamConfig {
  onNodeStart?: (node: string) => void;
  onNodeEnd?: (node: string, output: unknown) => void;
  onToolCall?: (tool: ToolCall) => void;
  onMessage?: (message: BaseMessage) => void;
  onError?: (error: Error) => void;
  onComplete?: (result: AgentJobResult) => void;
}

// ============================================================================
// CHECKPOINT TYPES
// ============================================================================

export interface CheckpointData {
  threadId: string;
  checkpointId: string;
  parentCheckpointId?: string;
  state: AgentState;
  metadata: {
    nodeCompleted: string;
    createdAt: Date;
  };
}

export interface CheckpointConfig {
  configurable: {
    thread_id: string;
    job_id: string;
  };
}

// ============================================================================
// ROUTING TYPES
// ============================================================================

export interface RoutingDecision {
  targetWorkflow: WorkflowType;
  targetNode: string;
  confidence: number;
  reasoning: string;
}

export interface RouterConfig {
  defaultWorkflow: WorkflowType;
  enableAutoRouting: boolean;
  routingModel?: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = false,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export class ProviderError extends AgentError {
  constructor(
    message: string,
    public provider: AIProviderType,
    recoverable: boolean = true
  ) {
    super(message, 'PROVIDER_ERROR', recoverable, { provider });
    this.name = 'ProviderError';
  }
}

export class WorkflowError extends AgentError {
  constructor(
    message: string,
    public workflow: WorkflowType,
    public node: string,
    recoverable: boolean = false
  ) {
    super(message, 'WORKFLOW_ERROR', recoverable, { workflow, node });
    this.name = 'WorkflowError';
  }
}

export class CheckpointError extends AgentError {
  constructor(message: string, public threadId: string) {
    super(message, 'CHECKPOINT_ERROR', true, { threadId });
    this.name = 'CheckpointError';
  }
}
