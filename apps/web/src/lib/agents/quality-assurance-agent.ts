import { query } from "@anthropic-ai/claude-agent-sdk";

/**
 * Quality Assurance Agent
 *
 * Multi-step QA process for NRPG reports with compliance checking,
 * historical analysis, and insurance acceptance prediction.
 *
 * Quality Gates:
 * - Compliance: All jurisdiction (QLD/NSW/VIC) + IICRC standards met
 * - Historical: Cost estimates reasonable vs. past claims
 * - Insurance: >80% acceptance probability
 * - Documentation: Photos support findings, no missing docs
 *
 * @param generatedReport - The report to review
 * @returns QA result with approval status and detailed feedback
 */

export interface QAResult {
  status: "APPROVED" | "REJECTED" | "REVISION_REQUESTED";
  complianceScore: number;
  riskFlags: string[];
  requiredActions: string[];
  sessionId?: string;
  subagentResults?: {
    compliance?: any;
    historical?: any;
    insurance?: any;
  };
}

export async function executeQualityAssuranceAgent(
  generatedReport: any
): Promise<QAResult> {
  let sessionId: string | undefined;
  const subagentResults: any = {};

  try {
    // Create session for multi-step QA process
    for await (const message of query({
      prompt: `You are a Quality Assurance Agent for NRPG (Natural Resources Property Group) reports.

Review this NRPG report comprehensively for compliance, quality, and insurance acceptance likelihood:

${JSON.stringify(generatedReport, null, 2)}

QUALITY GATES TO VERIFY:
1. **Compliance** (use compliance-checker subagent):
   - All jurisdiction requirements met (QLD/NSW/VIC building codes)
   - Industry standards compliance
   - Required documentation present

2. **Historical Analysis** (use historical-analyzer subagent):
   - Cost estimates reasonable vs. similar past claims
   - Material quantities within normal ranges
   - Labor hours aligned with industry standards

3. **Insurance Prediction** (use insurance-predictor subagent):
   - >80% acceptance probability target
   - Common adjuster rejection patterns avoided
   - Documentation supports all claims

4. **Quality Checks**:
   - Photos adequately support findings
   - No missing critical documentation
   - Report clarity and professionalism

RETURN FORMAT (JSON):
{
  "allChecksPassed": boolean,
  "complianceScore": number (0-100),
  "riskFlags": string[],
  "requiredActions": string[],
  "subagentResults": {
    "compliance": {...},
    "historical": {...},
    "insurance": {...}
  }
}`,
      options: {
        allowedTools: ["Read", "Grep", "Task", "WebSearch"],
        agents: {
          "compliance-checker": {
            description: "Validates jurisdiction and IICRC standards compliance",
            prompt: `Check all compliance requirements are met per QLD/NSW/VIC codes and IICRC standards.

VERIFICATION CHECKLIST:
- [ ] Building code compliance (jurisdiction-specific)
- [ ] Water damage industry standards
- [ ] Mould remediation industry standards
- [ ] Required certifications and licenses
- [ ] Mandatory documentation present

Return JSON with:
{
  "compliant": boolean,
  "violations": string[],
  "warnings": string[],
  "score": number (0-100)
}`,
            tools: ["Read", "Grep"]
          },
          "historical-analyzer": {
            description: "Compares report to similar past claims",
            prompt: `Analyze cost estimates against historical data for reasonableness.

ANALYSIS STEPS:
1. Find similar past claims (same damage type, property size)
2. Compare material costs (±20% acceptable variance)
3. Compare labor hours (±30% acceptable variance)
4. Identify outliers requiring justification

Return JSON with:
{
  "reasonable": boolean,
  "outliers": Array<{item: string, variance: number, justification: string}>,
  "confidenceLevel": number (0-100),
  "comparableClaimsCount": number
}`,
            tools: ["Read", "Grep"]
          },
          "insurance-predictor": {
            description: "Predicts insurance adjuster acceptance likelihood",
            prompt: `Assess report against insurance company acceptance patterns.

PREDICTION FACTORS:
1. Documentation quality (photos, measurements, notes)
2. Cost justification (itemized, industry-standard rates)
3. Scope clarity (clear cause-and-effect)
4. Common rejection patterns avoided
5. Industry standards alignment

TARGET: >80% acceptance probability

Return JSON with:
{
  "acceptanceProbability": number (0-100),
  "strengthFactors": string[],
  "weaknessFactors": string[],
  "recommendations": string[]
}`,
            tools: ["Read", "WebSearch"]
          }
        }
      }
    })) {
      // Capture session ID
      if (message.type === "system" && message.subtype === "init") {
        sessionId = message.session_id;
      }

      // Process result
      if ("result" in message) {
        try {
          // Parse the QA result
          const qaResult = typeof message.result === "string"
            ? JSON.parse(message.result)
            : message.result;

          // Determine status based on checks
          let status: "APPROVED" | "REJECTED" | "REVISION_REQUESTED";

          if (qaResult.allChecksPassed && qaResult.complianceScore >= 85) {
            status = "APPROVED";
          } else if (qaResult.complianceScore < 60 || qaResult.riskFlags.length > 5) {
            status = "REJECTED";
          } else {
            status = "REVISION_REQUESTED";
          }

          return {
            status,
            complianceScore: qaResult.complianceScore,
            riskFlags: qaResult.riskFlags || [],
            requiredActions: qaResult.requiredActions || [],
            sessionId,
            subagentResults: qaResult.subagentResults
          };
        } catch (parseError) {
          console.error("Failed to parse QA result:", parseError);

          // Fallback to rejection with error
          return {
            status: "REJECTED",
            complianceScore: 0,
            riskFlags: ["Failed to parse QA result"],
            requiredActions: ["Re-run quality assurance with valid report format"],
            sessionId
          };
        }
      }
    }

    // If we exit the loop without a result, return rejection
    return {
      status: "REJECTED",
      complianceScore: 0,
      riskFlags: ["QA process did not complete"],
      requiredActions: ["Re-run quality assurance"],
      sessionId
    };

  } catch (error) {
    console.error("Quality Assurance Agent error:", error);

    return {
      status: "REJECTED",
      complianceScore: 0,
      riskFlags: [
        "QA process failed",
        error instanceof Error ? error.message : "Unknown error"
      ],
      requiredActions: ["Fix errors and re-run quality assurance"],
      sessionId
    };
  }
}

/**
 * Helper function to validate QA thresholds
 */
export function meetsQualityThresholds(qaResult: QAResult): boolean {
  return (
    qaResult.status === "APPROVED" &&
    qaResult.complianceScore >= 85 &&
    qaResult.riskFlags.length === 0
  );
}

/**
 * Helper function to generate QA summary report
 */
export function generateQASummary(qaResult: QAResult): string {
  const statusEmoji = {
    APPROVED: "✅",
    REJECTED: "❌",
    REVISION_REQUESTED: "⚠️"
  };

  return `
${statusEmoji[qaResult.status]} QUALITY ASSURANCE REPORT

Status: ${qaResult.status}
Compliance Score: ${qaResult.complianceScore}/100

${qaResult.riskFlags.length > 0 ? `
Risk Flags:
${qaResult.riskFlags.map(flag => `  - ${flag}`).join('\n')}
` : ''}

${qaResult.requiredActions.length > 0 ? `
Required Actions:
${qaResult.requiredActions.map((action, i) => `  ${i + 1}. ${action}`).join('\n')}
` : ''}

${qaResult.subagentResults ? `
Subagent Results:
  - Compliance: ${JSON.stringify(qaResult.subagentResults.compliance, null, 2)}
  - Historical: ${JSON.stringify(qaResult.subagentResults.historical, null, 2)}
  - Insurance: ${JSON.stringify(qaResult.subagentResults.insurance, null, 2)}
` : ''}

Session ID: ${qaResult.sessionId || 'N/A'}
  `.trim();
}
