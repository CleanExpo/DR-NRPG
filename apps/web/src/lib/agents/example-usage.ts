/**
 * Claude Agent SDK - Example Usage
 *
 * Demonstrates how to use Data Intake Agent and Report Generation Agent
 * for the NRPG disaster recovery platform.
 *
 * Run: npx ts-node src/lib/agents/example-usage.ts
 */

import {
  executeDataIntakeAgent,
  executeReportGenerationAgent,
  type InspectionData,
} from "./index";

// ============================================================================
// Example Inspection Data
// ============================================================================

const exampleInspectionData: InspectionData = {
  propertyAddress: "123 Brisbane Street, Fortitude Valley",
  postcode: "4006",
  photos: [
    {
      filename: "damage_overview.jpg",
      width: 1920,
      height: 1080,
      fileSize: 2048000, // 2MB
      caption: "Overview of water damage in living room",
    },
    {
      filename: "ceiling_damage.jpg",
      width: 1920,
      height: 1080,
      fileSize: 1536000, // 1.5MB
      caption: "Water stains on ceiling",
    },
    {
      filename: "flooring_damage.jpg",
      width: 1920,
      height: 1080,
      fileSize: 1792000, // 1.75MB
      caption: "Buckled hardwood flooring",
    },
    {
      filename: "wall_moisture.jpg",
      width: 1920,
      height: 1080,
      fileSize: 1280000, // 1.25MB
      caption: "Moisture meter reading on wall",
    },
  ],
  moistureReadings: [
    {
      location: "Living room ceiling",
      percentage: 45.2,
      material: "Drywall",
      timestamp: new Date().toISOString(),
    },
    {
      location: "Living room wall (north)",
      percentage: 52.8,
      material: "Drywall",
      timestamp: new Date().toISOString(),
    },
    {
      location: "Hardwood flooring",
      percentage: 38.5,
      material: "Hardwood",
      timestamp: new Date().toISOString(),
    },
    {
      location: "Carpet (hallway)",
      percentage: 65.3,
      material: "Carpet padding",
      timestamp: new Date().toISOString(),
    },
  ],
  damageDescription: `
    Significant water damage observed in living room and hallway areas.
    Source: Burst pipe in ceiling above living room.

    Damage Details:
    - Ceiling: Water staining, sagging drywall, visible moisture
    - Walls: Moisture readings elevated, paint bubbling
    - Flooring: Hardwood buckling in living room, carpet saturated in hallway
    - Contents: Sofa and entertainment center water-damaged

    Water appears to be Category 1 (clean water from supply line).
    No visible mold growth at time of inspection.
    Homeowner reports incident occurred approximately 6 hours ago.
  `.trim(),
  inspectionDuration: 45, // minutes
  technicianId: "TECH-001-JSmith",
  timestamp: new Date().toISOString(),
};

// ============================================================================
// Example with High Severity (Category 3)
// ============================================================================

const highSeverityInspectionData: InspectionData = {
  propertyAddress: "456 Flood Street, Brisbane CBD",
  postcode: "4000",
  photos: [
    {
      filename: "flooding_overview.jpg",
      width: 2048,
      height: 1536,
      fileSize: 3072000, // 3MB
      caption: "Overview of flooding damage",
    },
    {
      filename: "sewage_contamination.jpg",
      width: 2048,
      height: 1536,
      fileSize: 2560000, // 2.5MB
      caption: "Evidence of sewage contamination",
    },
    {
      filename: "structural_damage.jpg",
      width: 2048,
      height: 1536,
      fileSize: 2816000, // 2.75MB
      caption: "Structural damage to foundation",
    },
  ],
  moistureReadings: [
    {
      location: "Basement floor",
      percentage: 78.5,
      material: "Concrete",
      timestamp: new Date().toISOString(),
    },
    {
      location: "Basement walls",
      percentage: 85.2,
      material: "Concrete block",
      timestamp: new Date().toISOString(),
    },
    {
      location: "First floor subfloor",
      percentage: 72.8,
      material: "Plywood",
      timestamp: new Date().toISOString(),
    },
  ],
  damageDescription: `
    Severe flooding damage from Category 3 black water (sewage backup).

    Damage Details:
    - Basement: Complete flooding, standing water, sewage contamination
    - Structural: Foundation cracking, floor joists compromised
    - Contents: Total loss of basement contents, severe mold growth visible
    - Health hazard: Sewage contamination requires specialized PPE and protocols

    Category 3 water damage classification required.
    Mould remediation certification required for this restoration project.
    Immediate health and safety concerns present.
  `.trim(),
  inspectionDuration: 75, // minutes (longer due to severity)
  technicianId: "TECH-002-MJohnson",
  timestamp: new Date().toISOString(),
};

// ============================================================================
// Main Execution
// ============================================================================

async function runExample() {
  console.log("=============================================================");
  console.log("Claude Agent SDK - NRPG Platform Example");
  console.log("=============================================================\n");

  try {
    // =========================================================================
    // Example 1: Standard Water Damage (Category 1)
    // =========================================================================
    console.log("### Example 1: Standard Water Damage (Category 1) ###\n");

    console.log("Step 1: Data Intake Agent - Validating inspection data...");
    const validatedData = await executeDataIntakeAgent(exampleInspectionData);

    console.log("\nValidation Results:");
    console.log(`- Valid: ${validatedData.isValid}`);
    console.log(`- Errors: ${validatedData.errors.length}`);
    console.log(`- Risk Flags: ${validatedData.riskFlags.join(", ") || "None"}`);

    if (validatedData.errors.length > 0) {
      console.log("\nValidation Errors/Warnings:");
      validatedData.errors.forEach((error) => {
        console.log(`  [${error.severity.toUpperCase()}] ${error.field}: ${error.message}`);
      });
    }

    if (validatedData.isValid) {
      console.log("\n" + "=".repeat(60));
      console.log("Step 2: Report Generation Agent - Generating NRPG report...");
      const report = await executeReportGenerationAgent(validatedData);

      console.log("\nReport Generated Successfully!");
      console.log(`- Report ID: ${report.reportId}`);
      console.log(`- Water Damage Category: ${report.waterDamageCategory}`);
      console.log(`- Jurisdiction: ${report.jurisdictionRequirements.jurisdiction}`);
      console.log(`- Industry Standards: ${report.iicrcStandards.map((s) => s.code).join(", ")}`);
      console.log(`- Total Cost Estimate: $${report.totalCost.toFixed(2)}`);
      console.log(`- AMRT Requirements Met: ${report.amtRequirementsMet}`);

      console.log("\nCost Breakdown:");
      report.costEstimates.forEach((estimate) => {
        console.log(
          `  - ${estimate.itemDescription}: $${estimate.totalCost.toFixed(2)} (${estimate.category})`
        );
      });

      console.log("\nRecommendations:");
      report.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });

      if (report.pdfPath) {
        console.log(`\nPDF Report: ${report.pdfPath}`);
      }
    }

    // =========================================================================
    // Example 2: High Severity (Category 3)
    // =========================================================================
    console.log("\n\n" + "=".repeat(60));
    console.log("### Example 2: High Severity Water Damage (Category 3) ###\n");

    console.log("Step 1: Data Intake Agent - Validating high severity data...");
    const highSeverityValidated = await executeDataIntakeAgent(
      highSeverityInspectionData
    );

    console.log("\nValidation Results:");
    console.log(`- Valid: ${highSeverityValidated.isValid}`);
    console.log(`- Errors: ${highSeverityValidated.errors.length}`);
    console.log(
      `- Risk Flags: ${highSeverityValidated.riskFlags.join(", ") || "None"}`
    );

    if (highSeverityValidated.errors.length > 0) {
      console.log("\nValidation Errors/Warnings:");
      highSeverityValidated.errors.forEach((error) => {
        console.log(`  [${error.severity.toUpperCase()}] ${error.field}: ${error.message}`);
      });
    }

    if (highSeverityValidated.isValid) {
      console.log("\n" + "=".repeat(60));
      console.log("Step 2: Report Generation Agent - Generating Category 3 report...");
      const highSeverityReport = await executeReportGenerationAgent(
        highSeverityValidated
      );

      console.log("\nHigh Severity Report Generated!");
      console.log(`- Report ID: ${highSeverityReport.reportId}`);
      console.log(
        `- Water Damage Category: ${highSeverityReport.waterDamageCategory}`
      );
      console.log(
        `- Jurisdiction: ${highSeverityReport.jurisdictionRequirements.jurisdiction}`
      );
      console.log(
        `- Industry Standards: ${highSeverityReport.iicrcStandards.map((s) => s.code).join(", ")}`
      );
      console.log(`- Total Cost Estimate: $${highSeverityReport.totalCost.toFixed(2)}`);
      console.log(
        `- AMRT Requirements Met: ${highSeverityReport.amtRequirementsMet} ${!highSeverityReport.amtRequirementsMet ? "(⚠️ MANUAL VERIFICATION REQUIRED)" : ""}`
      );

      console.log("\nJurisdiction Requirements:");
      console.log(
        `  - Requires AMRT: ${highSeverityReport.jurisdictionRequirements.requiresAMRT}`
      );
      console.log(
        `  - Requires Asbestos Check: ${highSeverityReport.jurisdictionRequirements.requiresAsbestosCheck}`
      );
      console.log(
        `  - Requires Council Notification: ${highSeverityReport.jurisdictionRequirements.requiresCouncilNotification}`
      );
      highSeverityReport.jurisdictionRequirements.additionalRequirements.forEach(
        (req) => {
          console.log(`  - ${req}`);
        }
      );

      console.log("\nRecommendations:");
      highSeverityReport.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log("Examples completed successfully!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ Error during example execution:");
    console.error(error);
    process.exit(1);
  }
}

// ============================================================================
// Execute if run directly
// ============================================================================

if (require.main === module) {
  runExample()
    .then(() => {
      console.log("\n✅ All examples completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Example execution failed:");
      console.error(error);
      process.exit(1);
    });
}

export { runExample };
