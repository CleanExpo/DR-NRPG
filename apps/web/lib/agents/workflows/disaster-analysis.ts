/**
 * Disaster Analysis Workflow - LangGraph implementation
 * Analyses disaster scenarios, assesses severity, and generates recovery plans
 */

import { StateGraph, Annotation, END, START } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { registerWorkflow, WorkflowExecutionConfig } from '../core/orchestrator';
import { DisasterScenario, DisasterAnalysisState, WorkflowError } from '../types';

// State annotation for the disaster analysis workflow
const DisasterAnalysisAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (curr, update) => [...curr, ...update],
    default: () => [],
  }),
  scenario: Annotation<DisasterScenario | null>({
    reducer: (_curr, update) => update,
    default: () => null,
  }),
  disasterType: Annotation<string>({
    reducer: (_curr, update) => update,
    default: () => '',
  }),
  severityAssessment: Annotation<number>({
    reducer: (_curr, update) => update,
    default: () => 0,
  }),
  immediateActions: Annotation<string[]>({
    reducer: (_curr, update) => update,
    default: () => [],
  }),
  recoveryPlan: Annotation<string>({
    reducer: (_curr, update) => update,
    default: () => '',
  }),
  resourceNeeds: Annotation<string[]>({
    reducer: (_curr, update) => update,
    default: () => [],
  }),
  estimatedCost: Annotation<number>({
    reducer: (_curr, update) => update,
    default: () => 0,
  }),
  timeline: Annotation<string>({
    reducer: (_curr, update) => update,
    default: () => '',
  }),
  riskFactors: Annotation<string[]>({
    reducer: (_curr, update) => update,
    default: () => [],
  }),
  isComplete: Annotation<boolean>({
    reducer: (_curr, update) => update,
    default: () => false,
  }),
});

type DisasterState = typeof DisasterAnalysisAnnotation.State;

// System prompt for the disaster analysis agent
const SYSTEM_PROMPT = `You are an expert disaster recovery analyst for an Australian restoration services platform.
Your role is to analyse disaster scenarios and provide actionable recovery recommendations.

Guidelines:
- Use Australian English (colour, mould, organisation)
- Reference Australian standards and regulations where applicable
- Consider recognised industry standards for water damage, mould and fire/smoke; do not name a standard by number or title
- Account for Australian climate and environmental factors
- Provide cost estimates in AUD
- Consider insurance claim requirements for Australian providers

Always provide structured, actionable recommendations.`;

/**
 * Create the disaster analysis workflow graph
 */
function createDisasterAnalysisGraph(model: BaseChatModel) {
  // Node: Classify the disaster type
  async function classifyDisaster(state: DisasterState): Promise<Partial<DisasterState>> {
    const scenario = state.scenario;
    if (!scenario) {
      throw new WorkflowError(
        'No disaster scenario provided',
        'DISASTER_ANALYSIS',
        'classify'
      );
    }

    const prompt = `Analyse and classify this disaster scenario:

Type: ${scenario.type}
Severity: ${scenario.severity}/10
Description: ${scenario.description}
Affected Areas: ${scenario.affectedAreas.join(', ')}
${scenario.location ? `Location: ${scenario.location.suburb}, ${scenario.location.state} ${scenario.location.postcode}` : ''}

Classify the primary disaster type and any secondary impacts.
Respond with ONLY a JSON object: {"disasterType": "string", "secondaryImpacts": ["string"]}`;

    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(prompt),
    ]);

    const content = typeof response.content === 'string' ? response.content : '';

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { disasterType: scenario.type };

      return {
        messages: [new AIMessage(content)],
        disasterType: parsed.disasterType || scenario.type,
      };
    } catch {
      return {
        messages: [new AIMessage(content)],
        disasterType: scenario.type,
      };
    }
  }

  // Node: Assess severity
  async function assessSeverity(state: DisasterState): Promise<Partial<DisasterState>> {
    const scenario = state.scenario;
    if (!scenario) {
      throw new WorkflowError(
        'No disaster scenario provided',
        'DISASTER_ANALYSIS',
        'assess_severity'
      );
    }

    const prompt = `Based on the ${state.disasterType} disaster:

Initial Severity: ${scenario.severity}/10
Description: ${scenario.description}

Assess the actual severity considering:
1. Structural damage potential
2. Health and safety risks
3. Secondary damage risks (mould, further deterioration)
4. Restoration complexity

Respond with ONLY a JSON object: {"severityScore": number (1-10), "riskFactors": ["string"]}`;

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
        severityAssessment: parsed.severityScore || scenario.severity,
        riskFactors: parsed.riskFactors || [],
      };
    } catch {
      return {
        messages: [new AIMessage(content)],
        severityAssessment: scenario.severity,
      };
    }
  }

  // Node: Generate immediate actions
  async function generateActions(state: DisasterState): Promise<Partial<DisasterState>> {
    const scenario = state.scenario;

    const prompt = `For this ${state.disasterType} disaster with severity ${state.severityAssessment}/10:

Description: ${scenario?.description}
Risk Factors: ${state.riskFactors.join(', ')}

Generate 3-5 immediate actions that should be taken. Consider:
- Safety first (occupant safety, utilities, hazards)
- Damage mitigation (prevent further damage)
- Documentation (photos, measurements for insurance)
- Professional engagement (when to call restoration specialists)

Respond with ONLY a JSON object: {"immediateActions": ["action 1", "action 2", ...]}`;

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
        immediateActions: parsed.immediateActions || [],
      };
    } catch {
      return {
        messages: [new AIMessage(content)],
        immediateActions: ['Contact emergency services if needed', 'Document damage with photos', 'Contact restoration professionals'],
      };
    }
  }

  // Node: Create recovery plan
  async function createRecoveryPlan(state: DisasterState): Promise<Partial<DisasterState>> {
    const scenario = state.scenario;

    const prompt = `Create a recovery plan for this ${state.disasterType} disaster:

Severity: ${state.severityAssessment}/10
Affected Areas: ${scenario?.affectedAreas.join(', ')}
Immediate Actions Taken: ${state.immediateActions.join('; ')}

Provide a structured recovery plan including:
1. Phase breakdown (emergency, restoration, reconstruction)
2. Timeline estimates
3. Professional services required
4. Key milestones

Respond with ONLY a JSON object: {
  "recoveryPlan": "detailed plan text",
  "timeline": "estimated timeline",
  "resourceNeeds": ["resource 1", "resource 2"],
  "estimatedCostAUD": number
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
        recoveryPlan: parsed.recoveryPlan || '',
        timeline: parsed.timeline || '',
        resourceNeeds: parsed.resourceNeeds || [],
        estimatedCost: parsed.estimatedCostAUD || 0,
        isComplete: true,
      };
    } catch {
      return {
        messages: [new AIMessage(content)],
        recoveryPlan: content,
        isComplete: true,
      };
    }
  }

  // Routing function based on severity
  function routeBySeverity(state: DisasterState): string {
    // For high severity (>7), go straight to actions
    // For lower severity, continue through normal flow
    return 'generateActions';
  }

  // Build the graph
  const workflow = new StateGraph(DisasterAnalysisAnnotation)
    .addNode('classifyDisaster', classifyDisaster)
    .addNode('assessSeverity', assessSeverity)
    .addNode('generateActions', generateActions)
    .addNode('createRecoveryPlan', createRecoveryPlan)
    .addEdge(START, 'classifyDisaster')
    .addEdge('classifyDisaster', 'assessSeverity')
    .addConditionalEdges('assessSeverity', routeBySeverity)
    .addEdge('generateActions', 'createRecoveryPlan')
    .addEdge('createRecoveryPlan', END);

  return workflow;
}

/**
 * Execute the disaster analysis workflow
 */
async function executeDisasterAnalysis(
  input: Record<string, unknown>,
  config: WorkflowExecutionConfig
): Promise<Record<string, unknown>> {
  const model = config.provider.getModel();
  const workflow = createDisasterAnalysisGraph(model);

  // Compile the graph with checkpointer
  const compiledWorkflow = workflow.compile({
    checkpointer: config.checkpointer as any,
  });

  // Extract scenario from input
  const scenario: DisasterScenario = input.scenario as DisasterScenario || {
    type: (input.type as string) || 'unknown',
    severity: (input.severity as number) || 5,
    description: (input.description as string) || '',
    affectedAreas: (input.affectedAreas as string[]) || [],
    location: input.location as DisasterScenario['location'],
  };

  // Initial state
  const initialState: Partial<DisasterState> = {
    scenario,
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
    disasterType: result.disasterType,
    severityAssessment: result.severityAssessment,
    immediateActions: result.immediateActions,
    recoveryPlan: result.recoveryPlan,
    resourceNeeds: result.resourceNeeds,
    estimatedCost: result.estimatedCost,
    timeline: result.timeline,
    riskFactors: result.riskFactors,
  };
}

// Register the workflow
registerWorkflow('DISASTER_ANALYSIS', executeDisasterAnalysis);

// Export for direct use
export { createDisasterAnalysisGraph, executeDisasterAnalysis };
