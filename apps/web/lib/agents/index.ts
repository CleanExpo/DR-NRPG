/**
 * Agent Orchestration System - Main Exports
 *
 * LangGraph-based AI agent orchestration for Disaster Recovery - NRPG
 *
 * Usage:
 * ```typescript
 * import { getOrchestrator } from '@/lib/agents';
 *
 * const orchestrator = getOrchestrator();
 * const result = await orchestrator.execute({
 *   workflowType: 'DISASTER_ANALYSIS',
 *   input: { scenario: { ... } },
 *   userId: 'user-123',
 * });
 * ```
 */

// Types
export * from './types';

// Providers
export {
  getProvider,
  getDefaultProvider,
  getFirstAvailableProvider,
  checkAllProvidersHealth,
  clearProviders,
  BaseAIProvider,
  AnthropicProvider,
  OllamaProvider,
} from './providers';

// Core
export {
  BaseAgent,
  BaseStateAnnotation,
  type BaseStateType,
} from './core/base-agent';

export {
  ContextManager,
  getContextManager,
  createContextManager,
} from './core/context-manager';

export {
  IntelligentRouter,
  getRouter,
  createRouter,
} from './core/router';

export {
  AgentOrchestrator,
  getOrchestrator,
  createOrchestrator,
  registerWorkflow,
  type WorkflowExecutionConfig,
} from './core/orchestrator';

// Checkpointers
export {
  PrismaCheckpointer,
  createPrismaCheckpointer,
} from './checkpointers/prisma-checkpointer';

// Workflows - import to register them
import './workflows/disaster-analysis';
import './workflows/claim-processing';
import './workflows/contractor-matching';
import './workflows/inspection-report';
import './workflows/customer-support';

// Super-Orchestrator (planned meta-agent feature)
export {
  executeManualWorkflow,
  getDailyReport,
  getWeeklyReport,
  runSelfImprovement,
  type AgentEvent,
} from './super-orchestrator';

// Re-export workflow functions for direct use
export {
  createDisasterAnalysisGraph,
  executeDisasterAnalysis,
} from './workflows/disaster-analysis';

export {
  createClaimProcessingGraph,
  executeClaimProcessing,
} from './workflows/claim-processing';

export {
  createContractorMatchingGraph,
  executeContractorMatching,
} from './workflows/contractor-matching';

export {
  createInspectionReportGraph,
  executeInspectionReport,
} from './workflows/inspection-report';

export {
  createCustomerSupportGraph,
  executeCustomerSupport,
} from './workflows/customer-support';
