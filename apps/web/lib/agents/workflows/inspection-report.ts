/**
 * Inspection Report Workflow - LangGraph implementation
 * IICRC-compliant property damage assessment using Snake Build Pattern
 * Minimal context design with progressive disclosure via skills
 */

import { StateGraph, Annotation, END, START } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { registerWorkflow, WorkflowExecutionConfig } from '../core/orchestrator';
import { InspectionInput, InspectionReportState, WorkflowError } from '../types';

// State annotation for the inspection report workflow
const InspectionReportAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (curr, update) => [...curr, ...update],
    default: () => [],
  }),
  inspectionData: Annotation<InspectionInput | null>({
    reducer: (_curr, update) => update,
    default: () => null,
  }),
  inspectorId: Annotation<string>({
    reducer: (_curr, update) => update,
    default: () => '',
  }),
  damageSummary: Annotation<string>({
    reducer: (_curr, update) => update,
    default: () => '',
  }),
  damageAssessment: Annotation<string>({
    reducer: (_curr, update) => update,
    default: () => '',
  }),
  categoryClassification: Annotation<string>({
    reducer: (_curr, update) => update,
    default: () => '',
  }),
  severityScore: Annotation<number>({
    reducer: (_curr, update) => update,
    default: () => 0,
  }),
  recommendedActions: Annotation<string[]>({
    reducer: (_curr, update) => update,
    default: () => [],
  }),
  costEstimate: Annotation<{ labour: number; materials: number; equipment: number; total: number }>({
    reducer: (_curr, update) => update,
    default: () => ({ labour: 0, materials: 0, equipment: 0, total: 0 }),
  }),
  complianceNotes: Annotation<string[]>({
    reducer: (_curr, update) => update,
    default: () => [],
  }),
  reportDraft: Annotation<string>({
    reducer: (_curr, update) => update,
    default: () => '',
  }),
  isComplete: Annotation<boolean>({
    reducer: (_curr, update) => update,
    default: () => false,
  }),
});

type InspectionState = typeof InspectionReportAnnotation.State;

// Minimal system prompt - knowledge loaded via skills
const SYSTEM_PROMPT = `You are an IICRC-certified inspection specialist analyzing property damage.
Use Australian English and metric measurements.
Consult /iicrc-validator skill for standards compliance.
Consult /australian-business-validator for local requirements.
Return structured JSON responses.`;

/**
 * Create the inspection report workflow graph
 */
function createInspectionReportGraph(model: BaseChatModel) {
  // Node 1: Analyze damage areas
  async function analyzeDamage(state: InspectionState): Promise<Partial<InspectionState>> {
    const inspection = state.inspectionData;
    if (!inspection) {
      throw new WorkflowError('No inspection data provided', 'INSPECTION_REPORT', 'analyze');
    }

    const damageAreasText = inspection.damageAreas
      .map(
        (area, idx) =>
          `${idx + 1}. Location: ${area.location}, Type: ${area.damageType}, Severity: ${area.severity}/10${
            area.photos ? `, Photos: ${area.photos.length}` : ''
          }`
      )
      .join('\n');

    const moistureText =
      inspection.moistureReadings && inspection.moistureReadings.length > 0
        ? inspection.moistureReadings
            .map((m) => `${m.location} (${m.material}): ${m.reading}%`)
            .join('\n')
        : 'No moisture readings provided';

    const prompt = `Analyze this property damage inspection:

Damage Areas:
${damageAreasText}

Moisture Readings:
${moistureText}

Inspector Notes: ${inspection.notes || 'None'}

Check /iicrc-validator for moisture thresholds and severity assessment.
Return JSON: {summary: "brief overview", assessment: "technical analysis", severity: 1-10}`;

    const response = await model.invoke([new SystemMessage(SYSTEM_PROMPT), new HumanMessage(prompt)]);

    const content = typeof response.content === 'string' ? response.content : '';

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        messages: [new AIMessage(content)],
        damageSummary: parsed.summary || 'Damage assessment completed',
        damageAssessment: parsed.assessment || 'Technical analysis pending',
        severityScore: typeof parsed.severity === 'number' ? parsed.severity : 5,
      };
    } catch {
      return {
        messages: [new AIMessage(content)],
        damageSummary: 'Damage analysis completed',
        damageAssessment: content,
        severityScore: 5,
      };
    }
  }

  // Node 2: Classify damage per IICRC standards
  async function classifyDamage(state: InspectionState): Promise<Partial<InspectionState>> {
    const inspection = state.inspectionData;
    if (!inspection || !state.damageAssessment) {
      throw new WorkflowError('Missing assessment data for classification', 'INSPECTION_REPORT', 'classify');
    }

    const prompt = `Classify this damage using IICRC standards:

Inspection Type: ${inspection.inspectionType}
Assessment: ${state.damageAssessment}
Severity Score: ${state.severityScore}/10

Consult /iicrc-validator for recognised industry standards for water, mould and fire damage. Do not name a standard by number or title.
Return JSON: {classification: "IICRC standard", compliance: ["note1", "note2"]}`;

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
        categoryClassification: parsed.classification || 'Classification pending',
        complianceNotes: Array.isArray(parsed.compliance) ? parsed.compliance : [],
      };
    } catch {
      return {
        messages: [new AIMessage(content)],
        categoryClassification: 'IICRC Classification Required',
        complianceNotes: ['Review assessment manually for IICRC compliance'],
      };
    }
  }

  // Node 3: Estimate costs
  async function estimateCosts(state: InspectionState): Promise<Partial<InspectionState>> {
    const inspection = state.inspectionData;
    if (!inspection || !state.categoryClassification) {
      throw new WorkflowError('Missing classification for cost estimation', 'INSPECTION_REPORT', 'estimate');
    }

    const areaSize =
      inspection.damageAreas.reduce((sum, area) => sum + (area.severity * 2), 0) || 10; // Rough area estimate

    const prompt = `Estimate restoration costs for Australian market (2026):

Classification: ${state.categoryClassification}
Damage Areas: ${inspection.damageAreas.length}
Estimated Affected Area: ~${areaSize}m²
Severity: ${state.severityScore}/10

Consult /australian-business-validator for labour rates, GST (10%), equipment, materials.
Return JSON: {labour: number, materials: number, equipment: number, total: number}`;

    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      ...state.messages,
      new HumanMessage(prompt),
    ]);

    const content = typeof response.content === 'string' ? response.content : '';

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      const labour = typeof parsed.labour === 'number' ? parsed.labour : 2000;
      const materials = typeof parsed.materials === 'number' ? parsed.materials : 1000;
      const equipment = typeof parsed.equipment === 'number' ? parsed.equipment : 500;

      return {
        messages: [new AIMessage(content)],
        costEstimate: {
          labour,
          materials,
          equipment,
          total: labour + materials + equipment,
        },
      };
    } catch {
      return {
        messages: [new AIMessage(content)],
        costEstimate: {
          labour: 2000,
          materials: 1000,
          equipment: 500,
          total: 3500,
        },
      };
    }
  }

  // Node 4: Generate recommendations
  async function generateRecommendations(state: InspectionState): Promise<Partial<InspectionState>> {
    const inspection = state.inspectionData;
    if (!inspection || !state.categoryClassification) {
      throw new WorkflowError('Missing data for recommendations', 'INSPECTION_REPORT', 'recommend');
    }

    const prompt = `Generate prioritized action plan for:

Classification: ${state.categoryClassification}
Severity: ${state.severityScore}/10
Cost Estimate: $${state.costEstimate.total} AUD

Consult /iicrc-validator for moisture management.
Consult /australian-business-validator for licensed trade requirements (electrician, plumber, asbestos assessor).
Return JSON: {actions: ["step1", "step2", ...], compliance: ["requirement1", ...]}`;

    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      ...state.messages,
      new HumanMessage(prompt),
    ]);

    const content = typeof response.content === 'string' ? response.content : '';

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      const actions = Array.isArray(parsed.actions) ? parsed.actions : ['Contact contractor', 'Request quote'];
      const compliance = Array.isArray(parsed.compliance) ? parsed.compliance : state.complianceNotes;

      return {
        messages: [new AIMessage(content)],
        recommendedActions: actions,
        complianceNotes: [...state.complianceNotes, ...compliance],
      };
    } catch {
      return {
        messages: [new AIMessage(content)],
        recommendedActions: ['Contact qualified restoration contractor', 'Request detailed quote'],
        complianceNotes: [...state.complianceNotes, 'Follow IICRC standards throughout restoration'],
      };
    }
  }

  // Node 5: Format professional report
  async function formatReport(state: InspectionState): Promise<Partial<InspectionState>> {
    const inspection = state.inspectionData;
    if (!inspection || !state.categoryClassification) {
      throw new WorkflowError('Missing data for report formatting', 'INSPECTION_REPORT', 'format');
    }

    const actionsText = state.recommendedActions.map((a, i) => `${i + 1}. ${a}`).join('\n');
    const complianceText = state.complianceNotes.join('\n');

    const prompt = `Format professional inspection report:

Property ID: ${inspection.propertyId}
Inspector ID: ${state.inspectorId}
Inspection Type: ${inspection.inspectionType}

Summary: ${state.damageSummary}
Assessment: ${state.damageAssessment}
Classification: ${state.categoryClassification}
Severity: ${state.severityScore}/10

Cost Estimate:
- Labour: $${state.costEstimate.labour}
- Materials: $${state.costEstimate.materials}
- Equipment: $${state.costEstimate.equipment}
- Total: $${state.costEstimate.total}

Recommended Actions:
${actionsText}

Compliance Notes:
${complianceText}

Consult /disaster-recovery-domain for professional report structure.
Return JSON: {reportDraft: "complete formatted report"}`;

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
        reportDraft: parsed.reportDraft || content,
        isComplete: true,
      };
    } catch {
      return {
        messages: [new AIMessage(content)],
        reportDraft: content,
        isComplete: true,
      };
    }
  }

  // Build the linear workflow graph
  const workflow = new StateGraph(InspectionReportAnnotation)
    .addNode('analyzeDamage', analyzeDamage)
    .addNode('classifyDamage', classifyDamage)
    .addNode('estimateCosts', estimateCosts)
    .addNode('generateRecommendations', generateRecommendations)
    .addNode('formatReport', formatReport)
    .addEdge(START, 'analyzeDamage')
    .addEdge('analyzeDamage', 'classifyDamage')
    .addEdge('classifyDamage', 'estimateCosts')
    .addEdge('estimateCosts', 'generateRecommendations')
    .addEdge('generateRecommendations', 'formatReport')
    .addEdge('formatReport', END);

  return workflow;
}

/**
 * Execute the inspection report workflow
 */
async function executeInspectionReport(
  input: Record<string, unknown>,
  config: WorkflowExecutionConfig
): Promise<Record<string, unknown>> {
  const model = config.provider.getModel();
  const workflow = createInspectionReportGraph(model);

  // Compile the graph with checkpointer
  const compiledWorkflow = workflow.compile({
    checkpointer: config.checkpointer as any,
  });

  // Extract inspection details from input
  const inspectionInput = input.inspection as Record<string, unknown> || {};
  const inspection: InspectionInput = {
    propertyId: (inspectionInput.propertyId as string) || '',
    inspectionType: (inspectionInput.inspectionType as string) || 'general',
    damageAreas: (inspectionInput.damageAreas as any[]) || [],
    moistureReadings: (inspectionInput.moistureReadings as any[]) || undefined,
    notes: (inspectionInput.notes as string) || undefined,
  };

  const inspectorId = (input.inspectorId as string) || 'INSP-AUTO';

  // Initial state
  const initialState: Partial<InspectionState> = {
    inspectionData: inspection,
    inspectorId,
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

  // Return the inspection report results
  return {
    inspectionId: inspection.propertyId,
    inspectorId: result.inspectorId,
    inspectionType: inspection.inspectionType,
    damageSummary: result.damageSummary,
    damageAssessment: result.damageAssessment,
    categoryClassification: result.categoryClassification,
    severityScore: result.severityScore,
    costEstimate: result.costEstimate,
    recommendedActions: result.recommendedActions,
    complianceNotes: result.complianceNotes,
    reportDraft: result.reportDraft,
    damageAreas: inspection.damageAreas.map((area) => ({
      location: area.location,
      damageType: area.damageType,
      severity: area.severity,
      photosCount: area.photos?.length || 0,
    })),
    moistureReadings: inspection.moistureReadings?.map((m) => ({
      location: m.location,
      reading: m.reading,
      material: m.material,
    })) || [],
    workflowStatus: 'COMPLETED',
  };
}

// Register the workflow
registerWorkflow('INSPECTION_REPORT', executeInspectionReport);

// Export for direct use
export { createInspectionReportGraph, executeInspectionReport };
