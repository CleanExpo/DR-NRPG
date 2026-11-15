# Agent Framework Documentation

## Overview

The Disaster Recovery NRPG Platform utilizes a **5-agent architecture** powered by the **Claude Agent SDK** to orchestrate complex workflows across data intake, report generation, quality assurance, operations, and CEO-level oversight. This framework implements a "snake build" pattern where each agent acts as a validation gate with hooks that can block or approve progression to the next stage.

**Date Created**: 2025-12-29
**Last Updated**: 2025-12-29
**Version**: 1.0.0

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Agent Roles & Responsibilities](#agent-roles--responsibilities)
3. [Snake Build Pattern](#snake-build-pattern)
4. [Hook System](#hook-system)
5. [Claude Agent SDK Integration](#claude-agent-sdk-integration)
6. [Implementation Details](#implementation-details)
7. [Error Handling & Recovery](#error-handling--recovery)

---

## Architecture Overview

### 5-Agent Pipeline

```
┌────────────────────────────────────────────────────────────────┐
│                    5-Agent Framework                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Agent 1:     │→ │ Agent 2:     │→ │ Agent 3:     │        │
│  │ Data Intake  │  │ Report Gen   │  │ QA Review    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│         ↓                  ↓                  ↓                │
│  [Validation Gate]  [Validation Gate]  [Validation Gate]      │
│         ↓                  ↓                  ↓                │
│  ┌──────────────┐  ┌──────────────────────────────┐          │
│  │ Agent 4:     │→ │ Agent 5:                      │          │
│  │ Operations   │  │ CEO Oversight & Approval      │          │
│  └──────────────┘  └──────────────────────────────┘          │
│         ↓                       ↓                              │
│  [Validation Gate]       [Final Approval]                      │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Agent SDK**: `@anthropic-ai/claude-agent-sdk` ^0.1.76
- **LLM**: Claude Sonnet 4.5 (model: claude-sonnet-4-5-20251101)
- **Runtime**: Node.js with TypeScript
- **State Management**: Redis for cross-agent communication
- **Database**: PostgreSQL with Prisma ORM
- **Monitoring**: Winston logging + CloudWatch

---

## Agent Roles & Responsibilities

### Agent 1: Data Intake Agent

**Purpose**: Validate and structure incoming inspection data from field inspectors.

**Responsibilities**:
1. **Data Validation**
   - Verify all required fields present
   - Validate jurisdiction-specific requirements
   - Check photo uploads (minimum 5 photos per damage area)
   - Validate moisture readings format

2. **Enrichment**
   - Geocode addresses
   - Lookup property records
   - Identify applicable building codes
   - Determine IICRC standards

3. **Quality Checks**
   - Damage category properly classified (Category 1-4)
   - Moisture content within valid ranges (0-100%)
   - Photo metadata extracted (EXIF, GPS)

4. **Output**
   - Structured `InspectionReport` with validation status
   - List of any data gaps requiring inspector follow-up

**Validation Gate Criteria**:
- ✅ All required fields completed
- ✅ Minimum 5 photos per damage area
- ✅ At least 3 moisture readings per area
- ✅ Damage category classified
- ❌ **BLOCKS** if critical data missing

**Implementation**: `src/agents/data-intake.agent.ts`

---

### Agent 2: Report Generation Agent

**Purpose**: Generate compliant inspection reports with cost estimates.

**Responsibilities**:
1. **Jurisdiction Rules Application**
   - Apply QLD/NSW/VIC building codes
   - Validate against National Construction Code (NCC) 2022
   - Check state-specific requirements

2. **IICRC Standards Validation**
   - Apply recognised industry standards for water damage
   - Apply recognised industry standards for mould if applicable
   - Validate psychrometric calculations

3. **Cost Estimation**
   - Calculate labor costs (IICRC-certified rates)
   - Calculate material costs (jurisdiction-specific)
   - Calculate equipment rental costs
   - Apply 10% contingency
   - Calculate 10% GST (Australian tax)

4. **Report Drafting**
   - Executive summary
   - Findings and observations
   - Recommendations
   - Scope of work
   - Cost breakdown

**Validation Gate Criteria**:
- ✅ All compliance checks passed
- ✅ Cost estimate within reasonable range (0.8x - 1.2x of baseline)
- ✅ IICRC standards met
- ✅ Jurisdiction rules validated
- ❌ **BLOCKS** if compliance failures detected

**Implementation**: `src/agents/report-generation.agent.ts`

---

### Agent 3: QA Review Agent

**Purpose**: Quality assurance and technical review of generated reports.

**Responsibilities**:
1. **Technical Review**
   - Verify moisture reading accuracy
   - Validate drying time estimates
   - Check equipment recommendations
   - Review material specifications

2. **Compliance Verification**
   - Double-check jurisdiction compliance
   - Verify IICRC standard adherence
   - Validate cost estimate reasonableness

3. **Consistency Checks**
   - Ensure findings align with photos
   - Verify recommendations match damage severity
   - Check cross-references (e.g., damage areas → cost line items)

4. **Language & Clarity**
   - Review executive summary for clarity
   - Ensure technical terms defined
   - Check for spelling/grammar errors

**Validation Gate Criteria**:
- ✅ No technical inconsistencies found
- ✅ Report clarity score > 80%
- ✅ All cross-references valid
- ✅ Cost estimate variance < 15%
- ⚠️  **WARNS** if minor issues (can proceed with notes)
- ❌ **BLOCKS** if major issues detected

**Implementation**: `src/agents/qa-review.agent.ts`

---

### Agent 4: Operations Agent

**Purpose**: Operational readiness and contractor assignment.

**Responsibilities**:
1. **Contractor Matching**
   - Match report to qualified contractors
   - Verify contractor availability
   - Check IICRC certifications match requirements
   - Validate service area coverage

2. **Resource Allocation**
   - Reserve equipment for estimated duration
   - Schedule labor based on urgency
   - Coordinate with suppliers for materials

3. **Timeline Planning**
   - Create project timeline
   - Set milestones (water extraction, drying, completion)
   - Schedule follow-up inspections

4. **Client Communication**
   - Prepare client-facing summary
   - Schedule kickoff meeting
   - Set expectations for timeline

**Validation Gate Criteria**:
- ✅ Contractor assigned with matching certifications
- ✅ Equipment reserved
- ✅ Materials available or on order
- ✅ Timeline created with realistic milestones
- ❌ **BLOCKS** if no qualified contractor available

**Implementation**: `src/agents/operations.agent.ts`

---

### Agent 5: CEO Oversight Agent

**Purpose**: Executive-level review and final approval.

**Responsibilities**:
1. **Risk Assessment**
   - Identify high-value contracts (> $50K AUD)
   - Flag unusual damage patterns
   - Review insurance claim alignment
   - Check customer credit risk

2. **Financial Review**
   - Validate pricing against company margins
   - Review contingency appropriateness
   - Check for upsell opportunities
   - Assess payment terms

3. **Strategic Alignment**
   - Ensure report aligns with company standards
   - Check customer relationship status
   - Review contractor performance history
   - Validate brand representation

4. **Final Approval**
   - Approve for release to client
   - Approve for release to insurer
   - Require revisions if needed

**Validation Gate Criteria**:
- ✅ Financial metrics within acceptable range
- ✅ Risk factors identified and mitigated
- ✅ Brand standards met
- ✅ Customer relationship considerations addressed
- ⚠️  **ESCALATES** for high-value or high-risk reports
- ✅ **APPROVES** for standard reports

**Implementation**: `src/agents/ceo-oversight.agent.ts`

---

## Snake Build Pattern

### Concept

The "snake build" pattern refers to a **sequential, gated workflow** where each agent acts as a checkpoint. Work flows forward only when validation gates pass.

```
┌──────────────┐
│ Data Intake  │
└──────┬───────┘
       │ ✅ Validation Gate 1
       ↓
┌──────────────┐
│ Report Gen   │
└──────┬───────┘
       │ ✅ Validation Gate 2
       ↓
┌──────────────┐
│ QA Review    │
└──────┬───────┘
       │ ✅ Validation Gate 3
       ↓
┌──────────────┐
│ Operations   │
└──────┬───────┘
       │ ✅ Validation Gate 4
       ↓
┌──────────────┐
│ CEO Oversight│
└──────┬───────┘
       │ ✅ Final Approval
       ↓
    [RELEASE]
```

### Characteristics

1. **Sequential Execution**: Agents execute in strict order
2. **Gated Progression**: Each agent has validation criteria
3. **Blocking Failures**: Critical failures prevent forward progress
4. **Audit Trail**: Every gate decision is logged
5. **Reversibility**: Failed reports can be revised and re-submitted

### Benefits

- **Quality Assurance**: Multiple checkpoints catch errors
- **Accountability**: Clear ownership at each stage
- **Traceability**: Complete audit trail
- **Risk Mitigation**: High-risk items escalated early

---

## Hook System

### Overview

Each validation gate implements a **hook system** that can:
- ✅ **APPROVE** - Allow progression to next stage
- ❌ **BLOCK** - Prevent progression, require fixes
- ⚠️  **WARN** - Flag issues but allow progression
- 🔄 **ESCALATE** - Route to human review

### Hook Implementation

**Base Hook Interface**:

```typescript
interface ValidationHook {
  name: string;
  description: string;
  severity: 'BLOCKING' | 'WARNING' | 'INFO';
  execute(context: AgentContext): Promise<HookResult>;
}

interface HookResult {
  passed: boolean;
  message: string;
  metadata?: Record<string, any>;
  recommendation?: string;
}

interface AgentContext {
  reportId: string;
  report: InspectionReport;
  previousStage?: string;
  userId?: string;
}
```

### Example Hooks

**Data Intake Agent - Photo Validation Hook**:

```typescript
class PhotoValidationHook implements ValidationHook {
  name = 'photo-validation';
  description = 'Validates minimum photo requirements per damage area';
  severity = 'BLOCKING';

  async execute(context: AgentContext): Promise<HookResult> {
    const report = context.report;
    const damageAreas = report.damageAreas;

    for (const area of damageAreas) {
      const photoCount = report.photos.filter(
        (photo) => photo.damageAreaId === area.id
      ).length;

      if (photoCount < 5) {
        return {
          passed: false,
          message: `Damage area "${area.areaName}" has only ${photoCount} photos. Minimum 5 required.`,
          metadata: {
            areaId: area.id,
            areaName: area.areaName,
            photoCount,
            required: 5,
          },
          recommendation: 'Inspector must upload additional photos before proceeding.',
        };
      }
    }

    return {
      passed: true,
      message: 'All damage areas meet minimum photo requirements',
    };
  }
}
```

**QA Review Agent - Cost Variance Hook**:

```typescript
class CostVarianceHook implements ValidationHook {
  name = 'cost-variance-check';
  description = 'Validates cost estimate is within acceptable variance';
  severity = 'WARNING';

  async execute(context: AgentContext): Promise<HookResult> {
    const report = context.report;
    const costEstimate = report.costEstimate;

    // Calculate baseline cost using heuristics
    const baselineCost = this.calculateBaselineCost(report.damageAreas);
    const variance = Math.abs(costEstimate.totalCost - baselineCost) / baselineCost;

    if (variance > 0.25) {
      return {
        passed: false,
        message: `Cost estimate variance is ${(variance * 100).toFixed(1)}% from baseline. Exceeds 25% threshold.`,
        metadata: {
          estimatedCost: costEstimate.totalCost,
          baselineCost,
          variancePercent: variance * 100,
          threshold: 25,
        },
        recommendation: 'Review labor and material line items for accuracy.',
      };
    }

    return {
      passed: true,
      message: `Cost estimate variance is ${(variance * 100).toFixed(1)}% - within acceptable range`,
      metadata: {
        variancePercent: variance * 100,
      },
    };
  }

  private calculateBaselineCost(damageAreas: DamageArea[]): number {
    // Simplified baseline: $200 AUD per sq meter
    const totalArea = damageAreas.reduce((sum, area) => sum + area.affectedArea, 0);
    return totalArea * 200;
  }
}
```

**CEO Oversight Agent - High Value Hook**:

```typescript
class HighValueEscalationHook implements ValidationHook {
  name = 'high-value-escalation';
  description = 'Escalates high-value contracts for executive review';
  severity = 'INFO';

  async execute(context: AgentContext): Promise<HookResult> {
    const costEstimate = context.report.costEstimate;
    const threshold = 50000; // $50K AUD

    if (costEstimate.totalCost > threshold) {
      return {
        passed: false, // Triggers escalation
        message: `High-value contract ($${costEstimate.totalCost.toLocaleString()} AUD) requires executive approval`,
        metadata: {
          totalCost: costEstimate.totalCost,
          threshold,
          requiresHumanReview: true,
        },
        recommendation: 'Route to CEO for final approval before client release.',
      };
    }

    return {
      passed: true,
      message: 'Standard contract value - auto-approved',
    };
  }
}
```

### Hook Execution Flow

```typescript
class AgentExecutor {
  private hooks: ValidationHook[] = [];

  registerHook(hook: ValidationHook) {
    this.hooks.push(hook);
  }

  async executeHooks(context: AgentContext): Promise<{
    allPassed: boolean;
    results: HookResult[];
  }> {
    const results: HookResult[] = [];
    let allPassed = true;

    for (const hook of this.hooks) {
      const result = await hook.execute(context);
      results.push(result);

      if (!result.passed && hook.severity === 'BLOCKING') {
        allPassed = false;
        // Log failure
        logger.error(`Hook failed: ${hook.name}`, {
          reportId: context.reportId,
          hook: hook.name,
          message: result.message,
        });
      } else if (!result.passed && hook.severity === 'WARNING') {
        // Log warning but allow progression
        logger.warn(`Hook warning: ${hook.name}`, {
          reportId: context.reportId,
          hook: hook.name,
          message: result.message,
        });
      }
    }

    return { allPassed, results };
  }
}
```

---

## Claude Agent SDK Integration

### Installation

```bash
npm install @anthropic-ai/claude-agent-sdk
```

### Configuration

```typescript
import { Agent, AgentExecutor } from '@anthropic-ai/claude-agent-sdk';

const agentConfig = {
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-sonnet-4-5-20251101',
  maxTokens: 4096,
  temperature: 0.3, // Lower temperature for consistent technical outputs
};
```

### Agent Definition

```typescript
// Data Intake Agent
const dataIntakeAgent = new Agent({
  name: 'DataIntakeAgent',
  description: 'Validates and structures incoming inspection data',
  model: agentConfig.model,
  apiKey: agentConfig.apiKey,
  systemPrompt: `You are a data validation specialist for disaster recovery inspections.

Your role:
1. Validate all required fields are present
2. Check photo uploads meet minimum requirements
3. Verify moisture readings are within valid ranges
4. Ensure damage categories are properly classified

Output a structured validation report with:
- Status: PASS or FAIL
- Errors: List of validation failures
- Warnings: List of issues that don't block progression
- Data gaps: List of missing optional fields

Be thorough and precise. Quality data is critical for accurate reporting.`,
  tools: [
    {
      name: 'validate_photo_count',
      description: 'Validates minimum photo count per damage area',
      inputSchema: {
        type: 'object',
        properties: {
          damageAreaId: { type: 'string' },
          photoCount: { type: 'number' },
        },
        required: ['damageAreaId', 'photoCount'],
      },
    },
    {
      name: 'validate_moisture_reading',
      description: 'Validates moisture reading is within valid range',
      inputSchema: {
        type: 'object',
        properties: {
          location: { type: 'string' },
          moistureContent: { type: 'number' },
        },
        required: ['location', 'moistureContent'],
      },
    },
  ],
});

// Report Generation Agent
const reportGenerationAgent = new Agent({
  name: 'ReportGenerationAgent',
  description: 'Generates compliant inspection reports with cost estimates',
  model: agentConfig.model,
  apiKey: agentConfig.apiKey,
  systemPrompt: `You are a certified IICRC inspector specializing in disaster recovery reports.

Your role:
1. Apply jurisdiction-specific building codes (QLD/NSW/VIC)
2. Validate against recognised industry standards
3. Generate accurate cost estimates
4. Draft professional reports

Output format:
- Executive Summary: 2-3 paragraphs
- Findings: Detailed observations
- Recommendations: Actionable next steps
- Cost Estimate: Line-item breakdown with totals

Ensure all reports meet Australian compliance standards.`,
  tools: [
    {
      name: 'calculate_labor_cost',
      description: 'Calculates labor costs based on IICRC level and hours',
      inputSchema: {
        type: 'object',
        properties: {
          iicrcLevel: { type: 'string' },
          hours: { type: 'number' },
          jurisdiction: { type: 'string' },
        },
        required: ['iicrcLevel', 'hours', 'jurisdiction'],
      },
    },
    {
      name: 'validate_jurisdiction_compliance',
      description: 'Validates compliance with jurisdiction building codes',
      inputSchema: {
        type: 'object',
        properties: {
          jurisdiction: { type: 'string' },
          damageCategory: { type: 'string' },
        },
        required: ['jurisdiction', 'damageCategory'],
      },
    },
  ],
});
```

### Agent Execution

```typescript
class InspectionReportPipeline {
  private agents: Agent[];

  constructor() {
    this.agents = [
      dataIntakeAgent,
      reportGenerationAgent,
      qaReviewAgent,
      operationsAgent,
      ceoOversightAgent,
    ];
  }

  async execute(reportId: string): Promise<{
    success: boolean;
    stage: string;
    results: any[];
  }> {
    const report = await this.getReport(reportId);
    const results: any[] = [];
    let currentStage = 'DATA_INTAKE';

    for (const agent of this.agents) {
      logger.info(`Executing agent: ${agent.name}`, { reportId, stage: currentStage });

      // Execute agent
      const agentResult = await agent.execute({
        messages: [
          {
            role: 'user',
            content: JSON.stringify({
              reportId,
              report,
              stage: currentStage,
            }),
          },
        ],
      });

      results.push({
        agent: agent.name,
        stage: currentStage,
        result: agentResult,
      });

      // Check if agent blocked progression
      if (agentResult.status === 'BLOCKED') {
        logger.error(`Agent blocked progression: ${agent.name}`, {
          reportId,
          stage: currentStage,
          reason: agentResult.message,
        });

        return {
          success: false,
          stage: currentStage,
          results,
        };
      }

      // Update stage
      currentStage = this.getNextStage(currentStage);
    }

    // All agents passed
    return {
      success: true,
      stage: 'APPROVED',
      results,
    };
  }

  private getNextStage(currentStage: string): string {
    const stageMap: Record<string, string> = {
      DATA_INTAKE: 'REPORT_GENERATION',
      REPORT_GENERATION: 'QA_REVIEW',
      QA_REVIEW: 'OPERATIONS',
      OPERATIONS: 'CEO_OVERSIGHT',
      CEO_OVERSIGHT: 'APPROVED',
    };
    return stageMap[currentStage] || 'UNKNOWN';
  }

  private async getReport(reportId: string) {
    // Fetch report from database
    return prisma.inspectionReport.findUnique({
      where: { id: reportId },
      include: {
        damageAreas: true,
        moistureReadings: true,
        photos: true,
        costEstimate: {
          include: {
            laborLineItems: true,
            materialLineItems: true,
            equipmentLineItems: true,
          },
        },
      },
    });
  }
}
```

---

## Implementation Details

### Agent Communication

Agents communicate via **structured JSON payloads** stored in Redis:

```typescript
interface AgentPayload {
  reportId: string;
  stage: string;
  previousStage?: string;
  data: any;
  metadata: {
    timestamp: string;
    userId?: string;
    triggeredBy: 'SYSTEM' | 'USER' | 'AGENT';
  };
}

// Publish to Redis
await redis.publish('agent:pipeline', JSON.stringify(payload));

// Subscribe to agent events
redis.subscribe('agent:pipeline', (message) => {
  const payload = JSON.parse(message);
  handleAgentEvent(payload);
});
```

### State Management

Agent execution state stored in PostgreSQL:

```prisma
model AgentExecution {
  id        String   @id @default(cuid())
  reportId  String
  agentName String
  stage     String
  status    String   // 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'
  startedAt DateTime
  completedAt DateTime?
  result    Json?
  error     String?
  createdAt DateTime @default(now())

  @@index([reportId])
  @@index([status])
}
```

---

## Error Handling & Recovery

### Retry Strategy

Agents implement **exponential backoff** for transient failures:

```typescript
async executeWithRetry(agent: Agent, context: AgentContext, maxRetries = 3) {
  let attempt = 0;
  let delay = 1000; // 1 second initial delay

  while (attempt < maxRetries) {
    try {
      return await agent.execute(context);
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }

      logger.warn(`Agent execution failed, retrying...`, {
        agent: agent.name,
        attempt,
        maxRetries,
        delay,
      });

      await this.sleep(delay);
      delay *= 2; // Exponential backoff
    }
  }
}

private sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

### Failure Recovery

Failed reports can be **resubmitted** after corrections:

```typescript
async resubmitReport(reportId: string, stage: string) {
  // Reset execution state
  await prisma.agentExecution.deleteMany({
    where: {
      reportId,
      stage: {
        in: this.getStagesAfter(stage),
      },
    },
  });

  // Re-run pipeline from failed stage
  await this.executePipelineFrom(reportId, stage);
}
```

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-29
**Maintained By**: Disaster Recovery NRPG Platform Team
