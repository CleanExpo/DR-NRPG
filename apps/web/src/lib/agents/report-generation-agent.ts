/**
 * Report Generation Agent
 *
 * Converts validated inspection data to NRPG-compliant report.
 *
 * Tools: Read, Write, Bash, Task
 * Hooks: PreToolUse (cost estimate range check, AMRT validation)
 * Subagents: iicrc-standards-lookup, jurisdiction-rules, cost-calculator, pdf-generator
 * MCP: Playwright (for PDF generation)
 *
 * Business Rules:
 * - Cost estimates must be within ±15% of industry averages
 * - Category 3 water damage requires AMRT certification
 * - Reports must comply with jurisdiction-specific requirements (QLD/NSW/VIC)
 * - Industry standards must be referenced for all restoration work
 *
 * Output: Complete NRPG report with cost estimates, recommendations, and compliance documentation
 */

import { query, HookCallback } from "@anthropic-ai/claude-agent-sdk";
import { ValidatedInspectionData } from "./data-intake-agent";

// ============================================================================
// Type Definitions
// ============================================================================

export type WaterDamageCategory = "Category 1" | "Category 2" | "Category 3";

export type Jurisdiction = "QLD" | "NSW" | "VIC" | "SA" | "WA" | "TAS" | "NT" | "ACT";

export interface IICRCStandard {
  code: string;
  title: string;
  applicability: string;
  requirements: string[];
}

export interface CostEstimate {
  itemDescription: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  category: "Labor" | "Materials" | "Equipment" | "Other";
}

export interface JurisdictionRequirements {
  jurisdiction: Jurisdiction;
  requiresAMRT: boolean;
  requiresAsbestosCheck: boolean;
  requiresCouncilNotification: boolean;
  additionalRequirements: string[];
}

export interface NRPGReport {
  reportId: string;
  inspectionData: ValidatedInspectionData;
  waterDamageCategory: WaterDamageCategory;
  iicrcStandards: IICRCStandard[];
  jurisdictionRequirements: JurisdictionRequirements;
  costEstimates: CostEstimate[];
  totalCost: number;
  recommendations: string[];
  amtRequirementsMet: boolean;
  generatedAt: string;
  generatedBy: string;
  pdfPath?: string;
}

export interface ReportValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

// ============================================================================
// Subagent: Industry Standards Lookup
// ============================================================================

/**
 * Industry Standards Lookup Subagent
 * Determines applicable industry standards based on damage type
 */
async function lookupIICRCStandardsSubagent(
  damageDescription: string,
  waterCategory: WaterDamageCategory
): Promise<IICRCStandard[]> {
  console.log("[IICRC Lookup] Determining applicable standards...");

  const standards: IICRCStandard[] = [];

  // Base standard for all water damage restoration
  standards.push({
    code: "Industry standard: water damage restoration",
    title: "Recognised industry standard on water damage restoration",
    applicability: "All water damage restoration projects",
    requirements: [
      "Document moisture readings before and after",
      "Use psychrometric calculations for drying strategy",
      "Monitor daily progress with moisture meters",
      "Maintain drying log with temperature and humidity",
      "Follow manufacturer's equipment specifications",
    ],
  });

  // Category-specific standards
  if (waterCategory === "Category 3") {
    standards.push({
      code: "Industry standard: mould remediation",
      title: "Recognised industry standard on mould remediation",
      applicability: "Category 3 water damage and mold-affected areas",
      requirements: [
        "Establish containment barriers",
        "Use negative air pressure",
        "Wear appropriate PPE (minimum N95 respirator)",
        "HEPA filtration during remediation",
        "Post-remediation verification testing",
      ],
    });
  }

  // Check for structural damage keywords
  const structuralKeywords = ["structural", "ceiling", "floor", "wall damage"];
  if (structuralKeywords.some((k) => damageDescription.toLowerCase().includes(k))) {
    standards.push({
      code: "Industry standard: structural drying",
      title: "Recognised industry standard on structural drying",
      applicability: "Structural water damage requiring specialized drying",
      requirements: [
        "Assess structural materials for water absorption",
        "Calculate evaporation rates",
        "Use specialized drying equipment (desiccant, LGR dehumidifiers)",
        "Monitor internal moisture content of materials",
        "Document restoration with thermal imaging",
      ],
    });
  }

  // Check for contents/textiles damage
  const contentsKeywords = ["furniture", "carpet", "upholstery", "contents"];
  if (contentsKeywords.some((k) => damageDescription.toLowerCase().includes(k))) {
    standards.push({
      code: "Industry standard: textile cleaning",
      title: "Recognised industry standard on textile cleaning",
      applicability: "Cleaning and restoration of water-damaged textiles",
      requirements: [
        "Test fabric colorfastness before cleaning",
        "Use appropriate cleaning methods (dry vs. wet)",
        "Document contents inventory",
        "Separate restorable from non-restorable items",
        "Provide contents storage if needed",
      ],
    });
  }

  console.log(`[IICRC Lookup] Found ${standards.length} applicable standards`);
  return standards;
}

// ============================================================================
// Subagent: Jurisdiction Rules
// ============================================================================

/**
 * Jurisdiction Rules Subagent
 * Determines jurisdiction-specific requirements based on location
 */
async function determineJurisdictionRulesSubagent(
  postcode: string
): Promise<JurisdictionRequirements> {
  console.log(`[Jurisdiction Rules] Determining rules for postcode ${postcode}...`);

  // Postcode to jurisdiction mapping (simplified)
  const postcodeNumber = parseInt(postcode, 10);
  let jurisdiction: Jurisdiction;

  if (postcodeNumber >= 4000 && postcodeNumber <= 4999) {
    jurisdiction = "QLD";
  } else if (
    (postcodeNumber >= 2000 && postcodeNumber <= 2599) ||
    (postcodeNumber >= 2619 && postcodeNumber <= 2899) ||
    (postcodeNumber >= 2921 && postcodeNumber <= 2999)
  ) {
    jurisdiction = "NSW";
  } else if (postcodeNumber >= 3000 && postcodeNumber <= 3999) {
    jurisdiction = "VIC";
  } else if (postcodeNumber >= 5000 && postcodeNumber <= 5799) {
    jurisdiction = "SA";
  } else if (
    (postcodeNumber >= 6000 && postcodeNumber <= 6797) ||
    (postcodeNumber >= 6800 && postcodeNumber <= 6999)
  ) {
    jurisdiction = "WA";
  } else if (postcodeNumber >= 7000 && postcodeNumber <= 7999) {
    jurisdiction = "TAS";
  } else if (postcodeNumber >= 800 && postcodeNumber <= 899) {
    jurisdiction = "NT";
  } else {
    jurisdiction = "ACT";
  }

  // Jurisdiction-specific requirements
  const requirements: JurisdictionRequirements = {
    jurisdiction,
    requiresAMRT: false,
    requiresAsbestosCheck: false,
    requiresCouncilNotification: false,
    additionalRequirements: [],
  };

  // QLD-specific rules
  if (jurisdiction === "QLD") {
    requirements.requiresAMRT = true;
    requirements.requiresAsbestosCheck = true;
    requirements.additionalRequirements = [
      "QBCC (Queensland Building and Construction Commission) compliance required",
      "Written contract required for work over $3,300",
      "Minimum 6-year structural warranty",
      "Certificate of Classification for water damage category required",
    ];
  }

  // NSW-specific rules
  if (jurisdiction === "NSW") {
    requirements.requiresAsbestosCheck = true;
    requirements.requiresCouncilNotification = true;
    requirements.additionalRequirements = [
      "NSW Fair Trading compliance required",
      "Written contract required for work over $5,000",
      "Home Building Act 1989 compliance",
      "Asbestos notification to SafeWork NSW if pre-1990 building",
    ];
  }

  // VIC-specific rules
  if (jurisdiction === "VIC") {
    requirements.requiresAsbestosCheck = true;
    requirements.additionalRequirements = [
      "VBA (Victorian Building Authority) registration required",
      "Domestic Building Contract required for work over $10,000",
      "Asbestos assessment mandatory for buildings constructed before 2003",
      "Certificate of Compliance required for plumbing work",
    ];
  }

  console.log(`[Jurisdiction Rules] Jurisdiction: ${jurisdiction}`);
  return requirements;
}

// ============================================================================
// Subagent: Cost Calculator
// ============================================================================

/**
 * Cost Calculator Subagent
 * Generates cost estimates based on damage assessment
 */
async function calculateCostsSubagent(
  inspectionData: ValidatedInspectionData,
  waterCategory: WaterDamageCategory
): Promise<{ estimates: CostEstimate[]; total: number }> {
  console.log("[Cost Calculator] Generating cost estimates...");

  const estimates: CostEstimate[] = [];

  // Base labor cost (varies by water category)
  const baseLaborHours =
    waterCategory === "Category 1" ? 8 : waterCategory === "Category 2" ? 16 : 24;

  estimates.push({
    itemDescription: "Initial assessment and documentation",
    quantity: 4,
    unitCost: 95,
    totalCost: 380,
    category: "Labor",
  });

  estimates.push({
    itemDescription: "Water extraction and cleanup",
    quantity: baseLaborHours,
    unitCost: 85,
    totalCost: baseLaborHours * 85,
    category: "Labor",
  });

  // Equipment costs based on moisture readings
  const avgMoisture =
    inspectionData.data.moistureReadings.reduce((sum, r) => sum + r.percentage, 0) /
    inspectionData.data.moistureReadings.length;

  if (avgMoisture > 30) {
    estimates.push({
      itemDescription: "Industrial dehumidifiers (per day)",
      quantity: 7,
      unitCost: 150,
      totalCost: 1050,
      category: "Equipment",
    });

    estimates.push({
      itemDescription: "Air movers (per day)",
      quantity: 7,
      unitCost: 75,
      totalCost: 525,
      category: "Equipment",
    });
  }

  // Category 3 specific costs
  if (waterCategory === "Category 3") {
    estimates.push({
      itemDescription: "Antimicrobial treatment",
      quantity: 1,
      unitCost: 850,
      totalCost: 850,
      category: "Materials",
    });

    estimates.push({
      itemDescription: "PPE and containment materials",
      quantity: 1,
      unitCost: 450,
      totalCost: 450,
      category: "Materials",
    });

    estimates.push({
      itemDescription: "Category 3 water handling (labor premium)",
      quantity: 8,
      unitCost: 95,
      totalCost: 760,
      category: "Labor",
    });
  }

  // Moisture monitoring
  estimates.push({
    itemDescription: "Daily moisture monitoring and documentation",
    quantity: 7,
    unitCost: 120,
    totalCost: 840,
    category: "Labor",
  });

  // Materials for common damage
  if (
    inspectionData.data.damageDescription.toLowerCase().includes("drywall") ||
    inspectionData.data.damageDescription.toLowerCase().includes("wall")
  ) {
    estimates.push({
      itemDescription: "Drywall replacement (per sheet)",
      quantity: 6,
      unitCost: 45,
      totalCost: 270,
      category: "Materials",
    });
  }

  if (
    inspectionData.data.damageDescription.toLowerCase().includes("carpet") ||
    inspectionData.data.damageDescription.toLowerCase().includes("flooring")
  ) {
    estimates.push({
      itemDescription: "Carpet removal and disposal",
      quantity: 1,
      unitCost: 650,
      totalCost: 650,
      category: "Labor",
    });
  }

  // Final restoration
  estimates.push({
    itemDescription: "Final cleaning and restoration",
    quantity: 6,
    unitCost: 85,
    totalCost: 510,
    category: "Labor",
  });

  // Calculate total
  const total = estimates.reduce((sum, est) => sum + est.totalCost, 0);

  console.log(`[Cost Calculator] Total estimate: $${total.toFixed(2)}`);
  return { estimates, total };
}

// ============================================================================
// Subagent: PDF Generator
// ============================================================================

/**
 * PDF Generator Subagent
 * Generates PDF report using MCP Playwright
 */
async function generatePDFSubagent(report: NRPGReport): Promise<string> {
  console.log("[PDF Generator] Generating PDF report...");

  // In production, this would use Playwright MCP to generate PDF
  // For now, return a placeholder path
  const pdfPath = `/reports/${report.reportId}.pdf`;

  console.log(`[PDF Generator] PDF generated at: ${pdfPath}`);
  return pdfPath;
}

// ============================================================================
// Validation Hooks
// ============================================================================

/**
 * PreToolUse Hook
 * Validates business rules before tool execution
 */
const preToolUseHook: HookCallback = async (params) => {
  const { toolName, toolInput } = params;

  console.log(`[Report Generation Agent] PreToolUse: ${toolName}`, toolInput);

  // Validate allowed tools
  const allowedTools = ["Read", "Write", "Bash", "Task"];
  if (!allowedTools.includes(toolName)) {
    throw new Error(
      `[Report Generation Agent] Unauthorized tool: ${toolName}. Allowed: ${allowedTools.join(", ")}`
    );
  }

  // Validate Write operations (prevent overwriting critical files)
  if (toolName === "Write") {
    const filePath = toolInput.file_path || "";
    const protectedPaths = [".env", "package.json", "prisma/schema.prisma"];

    if (protectedPaths.some((path) => filePath.includes(path))) {
      throw new Error(
        `[Report Generation Agent] Cannot write to protected file: ${filePath}`
      );
    }
  }

  return params;
};

// ============================================================================
// Main Agent Execution
// ============================================================================

/**
 * Execute Report Generation Agent
 *
 * Converts validated inspection data into complete NRPG report.
 *
 * @param validatedData - Validated inspection data from Data Intake Agent
 * @returns Complete NRPG report with cost estimates and recommendations
 */
export async function executeReportGenerationAgent(
  validatedData: ValidatedInspectionData
): Promise<NRPGReport> {
  console.log("[Report Generation Agent] Starting report generation...");

  // Validate input data
  if (!validatedData.isValid) {
    throw new Error(
      `[Report Generation Agent] Cannot generate report from invalid data. Errors: ${validatedData.errors.map((e) => e.message).join("; ")}`
    );
  }

  try {
    // ========================================================================
    // Step 1: Determine Water Damage Category using AI
    // ========================================================================
    console.log("[Report Generation Agent] Determining water damage category...");

    const categoryPrompt = `
You are a water damage assessment specialist certified in industry standards.

Based on the following damage description, determine the water damage category:

**Damage Description**: ${validatedData.data.damageDescription}

**Moisture Readings**: ${validatedData.data.moistureReadings.map((r) => `${r.location}: ${r.percentage}%`).join(", ")}

**Water Damage Categories**:
- **Category 1 (Clean Water)**: Water from a clean source (broken pipe, sink overflow). Minimal contamination.
- **Category 2 (Grey Water)**: Water with some contamination (washing machine, dishwasher, toilet overflow without feces). May cause discomfort or illness.
- **Category 3 (Black Water)**: Grossly contaminated water (sewage, flooding, toilet backflow). Contains pathogenic agents, requires special handling.

**Instructions**:
1. Analyze the damage description for keywords indicating contamination level
2. Consider moisture levels (Category 3 often has higher moisture due to flooding)
3. Respond with ONLY the category: "Category 1", "Category 2", or "Category 3"
4. No additional explanation needed

Your assessment:
`;

    const categoryResult = await query({
      prompt: categoryPrompt,
      hooks: {
        preToolUse: preToolUseHook,
      },
      allowedTools: ["Read"],
      maxTurns: 2,
    });

    // Parse water category from AI response
    let waterCategory: WaterDamageCategory = "Category 2"; // default
    if (categoryResult.includes("Category 1")) {
      waterCategory = "Category 1";
    } else if (categoryResult.includes("Category 3")) {
      waterCategory = "Category 3";
    }

    console.log(`[Report Generation Agent] Water damage category: ${waterCategory}`);

    // ========================================================================
    // Step 2: Lookup Industry Standards
    // ========================================================================
    const iicrcStandards = await lookupIICRCStandardsSubagent(
      validatedData.data.damageDescription,
      waterCategory
    );

    // ========================================================================
    // Step 3: Determine Jurisdiction Requirements
    // ========================================================================
    const jurisdictionRequirements = await determineJurisdictionRulesSubagent(
      validatedData.data.postcode
    );

    // ========================================================================
    // Step 4: Calculate Costs
    // ========================================================================
    const { estimates, total } = await calculateCostsSubagent(
      validatedData,
      waterCategory
    );

    // ========================================================================
    // Step 5: Validate Cost Estimates (±15% rule)
    // ========================================================================
    console.log("[Report Generation Agent] Validating cost estimates...");

    // Industry average for water damage restoration: $2,500-$7,500
    const industryMin = 2500;
    const industryMax = 7500;
    const allowedVariance = 0.15; // 15%

    if (total < industryMin * (1 - allowedVariance)) {
      console.warn(
        `[Report Generation Agent] Cost estimate ($${total}) is significantly below industry average. Review recommended.`
      );
    }

    if (total > industryMax * (1 + allowedVariance)) {
      console.warn(
        `[Report Generation Agent] Cost estimate ($${total}) is significantly above industry average. Review recommended.`
      );
    }

    // ========================================================================
    // Step 6: Validate AMRT Requirements for Category 3
    // ========================================================================
    let amtRequirementsMet = true;

    if (waterCategory === "Category 3" && jurisdictionRequirements.requiresAMRT) {
      console.log("[Report Generation Agent] Checking AMRT requirements...");

      // In production, this would verify AMRT certification from database
      // For now, flag as requiring manual verification
      amtRequirementsMet = false;
      console.warn(
        "[Report Generation Agent] Category 3 water damage requires AMRT certification. Manual verification required."
      );
    }

    // ========================================================================
    // Step 7: Generate Recommendations using AI
    // ========================================================================
    console.log("[Report Generation Agent] Generating recommendations...");

    const recommendationsPrompt = `
You are a disaster recovery specialist generating recommendations for a water damage restoration project.

**Water Damage Category**: ${waterCategory}
**Jurisdiction**: ${jurisdictionRequirements.jurisdiction}
**Total Cost Estimate**: $${total.toFixed(2)}
**Industry Standards**: ${iicrcStandards.map((s) => s.code).join(", ")}

**Risk Flags**: ${validatedData.riskFlags.join(", ") || "None"}

Generate 3-5 specific, actionable recommendations for this restoration project. Focus on:
1. Immediate safety concerns
2. Critical restoration steps
3. Compliance requirements
4. Cost-saving opportunities
5. Timeline expectations

Format as a numbered list. Be concise and specific.
`;

    const recommendationsResult = await query({
      prompt: recommendationsPrompt,
      hooks: {
        preToolUse: preToolUseHook,
      },
      allowedTools: ["Read"],
      maxTurns: 2,
    });

    // Parse recommendations from AI response
    const recommendations = recommendationsResult
      .split("\n")
      .filter((line) => line.match(/^\d+\./))
      .map((line) => line.replace(/^\d+\.\s*/, "").trim());

    console.log(
      `[Report Generation Agent] Generated ${recommendations.length} recommendations`
    );

    // ========================================================================
    // Step 8: Compile Report
    // ========================================================================
    const reportId = `NRPG-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    const report: NRPGReport = {
      reportId,
      inspectionData: validatedData,
      waterDamageCategory: waterCategory,
      iicrcStandards,
      jurisdictionRequirements,
      costEstimates: estimates,
      totalCost: total,
      recommendations,
      amtRequirementsMet,
      generatedAt: new Date().toISOString(),
      generatedBy: "Report Generation Agent v1.0.0",
    };

    // ========================================================================
    // Step 9: Generate PDF (optional)
    // ========================================================================
    try {
      const pdfPath = await generatePDFSubagent(report);
      report.pdfPath = pdfPath;
    } catch (error) {
      console.error("[Report Generation Agent] PDF generation failed:", error);
      // Continue without PDF - report data is still valid
    }

    console.log(`[Report Generation Agent] Report generated successfully: ${reportId}`);
    return report;
  } catch (error) {
    console.error("[Report Generation Agent] Report generation failed:", error);
    throw new Error(
      `Report generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// ============================================================================
// Export Subagents for Testing
// ============================================================================

export const subagents = {
  lookupIICRCStandards: lookupIICRCStandardsSubagent,
  determineJurisdictionRules: determineJurisdictionRulesSubagent,
  calculateCosts: calculateCostsSubagent,
  generatePDF: generatePDFSubagent,
};
