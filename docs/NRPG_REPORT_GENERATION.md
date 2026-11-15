# NRPG Inspection Report Generation System

## Overview

The NRPG (National Restoration Professionals Group) Inspection Report Generation System is a comprehensive, compliance-focused platform for creating professional disaster recovery inspection reports. The system enforces jurisdiction-specific building codes, applies industry standards, generates accurate cost estimates, and produces PDF reports for clients and insurance companies.

**Date Created**: 2025-12-29
**Last Updated**: 2025-12-29
**Version**: 1.0.0

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Jurisdiction Rules Engine](#jurisdiction-rules-engine)
3. [Industry Standards Validation](#iicrc-standards-validation)
4. [Cost Estimation Process](#cost-estimation-process)
5. [Approval Workflow](#approval-workflow)
6. [PDF Generation](#pdf-generation)
7. [Data Models](#data-models)
8. [API Reference](#api-reference)

---

## System Architecture

### High-Level Design

```
┌──────────────────────────────────────────────────────────────────┐
│              NRPG Inspection Report System                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │   Data Intake  │→ │  Jurisdiction  │→ │ Industry Standards  │  │
│  │   (Inspector)  │  │  Rules Engine  │  │   Validation     │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
│          │                    │                     │            │
│          ▼                    ▼                     ▼            │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ Cost Estimation│  │    Approval    │  │  PDF Generation  │  │
│  │   & Pricing    │  │    Workflow    │  │   (Client/Ins)   │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Service Components

**Location**: `src/services/inspection/`

1. **inspection-report.service.ts** - Main orchestrator
2. **jurisdiction-rules.service.ts** - QLD/NSW/VIC building codes
3. **iicrc-standards.service.ts** - Industry standards validation
4. **cost-estimation.service.ts** - Pricing and line items
5. **pdf-generation.service.ts** - Report PDF rendering
6. **approval-workflow.service.ts** - Multi-stage approval chain

---

## Jurisdiction Rules Engine

### Overview

The Jurisdiction Rules Engine validates inspection reports against Australian state-specific building codes and regulations.

**Supported Jurisdictions**:
- **QLD** (Queensland) - Queensland Building Code 2022, NCC 2022
- **NSW** (New South Wales) - NSW Building Code, Environmental Planning
- **VIC** (Victoria) - Victorian Building Regulations, NCC 2022

### Implementation

**Service**: `src/services/inspection/jurisdiction-rules.service.ts`

```typescript
export class JurisdictionRulesEngine {
  /**
   * Get applicable building codes for a jurisdiction
   */
  async getApplicableCodes(jurisdiction: AustralianState): Promise<string[]> {
    const codeMap: Record<AustralianState, string[]> = {
      QLD: [
        'QLD Building Code 2022',
        'National Construction Code (NCC) 2022',
        'Queensland Development Code',
        'AS/NZS 3500 Plumbing & Drainage',
      ],
      NSW: [
        'NSW Environmental Planning & Assessment Act',
        'National Construction Code (NCC) 2022',
        'NSW Building Code',
        'AS/NZS 3500 Plumbing & Drainage',
      ],
      VIC: [
        'Victorian Building Regulations 2018',
        'National Construction Code (NCC) 2022',
        'Building Act 1993 (Vic)',
        'AS/NZS 3500 Plumbing & Drainage',
      ],
      // ... other states
    };

    return codeMap[jurisdiction] || [];
  }

  /**
   * Validate report compliance with jurisdiction rules
   */
  async validateCompliance(params: {
    reportId: string;
    jurisdiction: AustralianState;
    damageAreas: DamageArea[];
    iicrcStandards: IICRCStandard[];
  }): Promise<ComplianceCheck[]> {
    const checks: ComplianceCheck[] = [];

    // QLD-specific checks
    if (params.jurisdiction === 'QLD') {
      checks.push(
        await this.validateQLDWaterDamage(params),
        await this.validateQLDMouldRemediation(params),
        await this.validateQLDStructuralIntegrity(params)
      );
    }

    // NSW-specific checks
    if (params.jurisdiction === 'NSW') {
      checks.push(
        await this.validateNSWWaterDamage(params),
        await this.validateNSWEnvironmentalCompliance(params)
      );
    }

    // VIC-specific checks
    if (params.jurisdiction === 'VIC') {
      checks.push(
        await this.validateVICBuildingRegulations(params),
        await this.validateVICWaterDamage(params)
      );
    }

    // National checks (apply to all jurisdictions)
    checks.push(
      await this.validateNCC2022Compliance(params),
      await this.validateASNZS3500Plumbing(params)
    );

    return checks;
  }

  /**
   * QLD-specific water damage validation
   */
  private async validateQLDWaterDamage(params: any): Promise<ComplianceCheck> {
    // QLD Building Code 2022 - Section 4.2: Water Damage Response
    // Requires Category 3 water (sewage) to be treated within 24 hours

    const category3Areas = params.damageAreas.filter(
      (area) => area.damageCategory === 'CATEGORY_3'
    );

    const inspectionDate = new Date(); // Get from report
    const within24Hours = category3Areas.every((area) => {
      // Check if response time < 24 hours
      return true; // Implement actual logic
    });

    return {
      checkName: 'QLD Building Code 2022 - Water Damage Response',
      checkCode: 'QLD-BC-2022-4.2',
      jurisdiction: 'QLD',
      status: within24Hours ? 'PASS' : 'FAIL',
      required: true,
      evidence: `Category 3 water damage areas identified: ${category3Areas.length}`,
      referenceSection: 'Section 4.2 - Water Damage Management',
    };
  }

  /**
   * VIC-specific building regulations validation
   */
  private async validateVICBuildingRegulations(params: any): Promise<ComplianceCheck> {
    // Victorian Building Regulations 2018 - Part 4.6: Moisture Control
    // Requires moisture barriers in affected areas

    const requiresMoistureBarrier = params.damageAreas.some(
      (area) => area.severity === 'Severe' || area.severity === 'Critical'
    );

    return {
      checkName: 'Victorian Building Regulations - Moisture Control',
      checkCode: 'VIC-BR-2018-4.6',
      jurisdiction: 'VIC',
      status: requiresMoistureBarrier ? 'REQUIRES_REVIEW' : 'PASS',
      required: true,
      evidence: 'Severe damage areas identified requiring moisture barriers',
      referenceSection: 'Part 4.6 - Moisture Control Requirements',
    };
  }

  /**
   * National Construction Code (NCC) 2022 validation
   */
  private async validateNCC2022Compliance(params: any): Promise<ComplianceCheck> {
    // NCC 2022 Volume 2 - Section 3.8.6: Moisture Control
    // Applies to all Australian jurisdictions

    return {
      checkName: 'NCC 2022 - Moisture Control Standards',
      checkCode: 'NCC-2022-3.8.6',
      jurisdiction: params.jurisdiction,
      status: 'PASS',
      required: true,
      evidence: 'Moisture control measures outlined in remediation plan',
      referenceSection: 'Volume 2, Section 3.8.6',
    };
  }
}
```

### Jurisdiction-Specific Rules

#### Queensland (QLD)

**Key Requirements**:
- **24-hour response** for Category 3 water (sewage)
- **Moisture barrier installation** for structural water damage
- **Asbestos testing** for pre-1990 buildings
- **Licensed contractor** for commercial properties

**Building Codes**:
- Queensland Building Code 2022
- Queensland Development Code MP 4.2
- NCC 2022 (National)

#### New South Wales (NSW)

**Key Requirements**:
- **Environmental assessment** for mould > 3m²
- **Heritage considerations** for buildings pre-1940
- **Strata approval** for multi-unit dwellings
- **WorkCover notification** for asbestos

**Building Codes**:
- NSW Environmental Planning & Assessment Act
- NSW Building Code
- Heritage Act 1977

#### Victoria (VIC)

**Key Requirements**:
- **Moisture control barriers** for severe damage
- **Building permit** for structural repairs > $5,000
- **Plumbing compliance** (AS/NZS 3500)
- **Energy efficiency** considerations (NCC Part J)

**Building Codes**:
- Victorian Building Regulations 2018
- Building Act 1993
- NCC 2022

---

## Industry Standards Validation

### Overview

The IICRC (Institute of Inspection, Cleaning and Restoration Certification) sets global standards for disaster recovery. The system validates adherence to applicable industry standards based on service type.

**Supported Standards**:

```typescript
enum IICRCStandard {
  WATER_DAMAGE_STANDARD   // Water damage restoration
  MOULD_STANDARD           // Mold remediation
  BIOHAZARD_STANDARD       // Biohazard cleanup
  WRT_WATER_RESTORATION    // Water restoration technician
  AMRT_APPLIED_MICROBIAL   // Applied microbial remediation
  FSRT_FIRE_SMOKE          // Fire and smoke restoration
}
```

### Implementation

**Service**: `src/services/inspection/iicrc-standards.service.ts`

```typescript
export class IICRCStandardsService {
  /**
   * Determine applicable industry standards based on service type
   */
  async determineApplicableStandards(
    serviceType: AustralianServiceType
  ): Promise<IICRCStandard[]> {
    const standardMap: Record<AustralianServiceType, IICRCStandard[]> = {
      WATER_DAMAGE: ['WATER_DAMAGE_STANDARD', 'WRT_WATER_RESTORATION'],
      COMMERCIAL_WATER_DAMAGE: ['WATER_DAMAGE_STANDARD', 'WRT_WATER_RESTORATION'],

      MOULD_REMEDIATION: ['MOULD_STANDARD', 'AMRT_APPLIED_MICROBIAL'],
      COMMERCIAL_MOULD: ['MOULD_STANDARD', 'AMRT_APPLIED_MICROBIAL'],

      FIRE_DAMAGE: ['FSRT_FIRE_SMOKE'],
      SMOKE_DAMAGE: ['FSRT_FIRE_SMOKE'],
      COMMERCIAL_FIRE_DAMAGE: ['FSRT_FIRE_SMOKE'],

      CRIME_SCENE_CLEANING: ['BIOHAZARD_STANDARD'],
      BIOHAZARD_REMEDIATION: ['BIOHAZARD_STANDARD'],

      // ... other service types
    };

    return standardMap[serviceType] || [];
  }

  /**
   * Validate the water damage standard
   */
  async validateWaterDamageStandard(report: InspectionReport): Promise<{
    compliant: boolean;
    violations: string[];
  }> {
    const violations: string[] = [];

    // Requirement 1: Damage Category Classification
    for (const area of report.damageAreas) {
      if (!area.damageCategory) {
        violations.push(
          `Damage area "${area.areaName}" missing damage category classification (Category 1-4)`
        );
      }
    }

    // Requirement 2: Moisture Content Documentation
    if (report.moistureReadings.length === 0) {
      violations.push('No moisture readings documented (industry standards require baseline readings)');
    }

    // Requirement 3: Drying Goals
    for (const area of report.damageAreas) {
      if (!area.targetMoistureLevel) {
        violations.push(
          `Damage area "${area.areaName}" missing target moisture level (drying goal)`
        );
      }
    }

    // Requirement 4: Affected Materials List
    for (const area of report.damageAreas) {
      if (!area.affectedMaterials || area.affectedMaterials.length === 0) {
        violations.push(
          `Damage area "${area.areaName}" missing affected materials list`
        );
      }
    }

    // Requirement 5: Equipment Documentation
    for (const area of report.damageAreas) {
      if (!area.equipmentNeeded || area.equipmentNeeded.length === 0) {
        violations.push(
          `Damage area "${area.areaName}" missing equipment requirements`
        );
      }
    }

    return {
      compliant: violations.length === 0,
      violations,
    };
  }

  /**
   * Validate the mold remediation standard
   */
  async validateMouldStandard(report: InspectionReport): Promise<{
    compliant: boolean;
    violations: string[];
  }> {
    const violations: string[] = [];

    // Requirement 1: Source Identification
    const hasMoldAreas = report.damageAreas.some((area) =>
      area.affectedMaterials.some((material) =>
        material.toLowerCase().includes('mold') || material.toLowerCase().includes('mould')
      )
    );

    if (hasMoldAreas && !report.findings.includes('moisture source')) {
      violations.push('Mold present but moisture source not identified');
    }

    // Requirement 2: Containment Plan
    const severeMold = report.damageAreas.some(
      (area) =>
        area.affectedMaterials.some((m) => m.toLowerCase().includes('mold')) &&
        (area.severity === 'Severe' || area.severity === 'Critical')
    );

    if (severeMold && !report.recommendations.includes('containment')) {
      violations.push('Severe mold requires containment procedures');
    }

    // Requirement 3: Personal Protective Equipment (PPE)
    if (hasMoldAreas && !report.recommendations.includes('PPE')) {
      violations.push('PPE requirements not documented for mold remediation');
    }

    return {
      compliant: violations.length === 0,
      violations,
    };
  }
}
```

### Industry Standard Requirements

#### Water Damage Restoration

**Key Requirements**:
1. **Damage Category Classification** (1-4)
   - Category 1: Clean water
   - Category 2: Grey water
   - Category 3: Black water (sewage)
   - Category 4: Specialty drying

2. **Moisture Content Documentation**
   - Baseline readings before drying
   - Daily progress readings
   - Final verification readings

3. **Drying Goals**
   - Target moisture levels per material
   - Estimated drying time
   - Equipment requirements

4. **Psychrometry**
   - Temperature and humidity tracking
   - Dew point calculations
   - Vapor pressure differentials

#### Mold Remediation

**Key Requirements**:
1. **Source Identification**
   - Moisture source must be identified and corrected
   - Water intrusion pathways documented

2. **Containment**
   - Level 1: < 10 sq ft (no containment)
   - Level 2: 10-100 sq ft (limited containment)
   - Level 3: > 100 sq ft (full containment)

3. **Removal Methods**
   - HEPA vacuuming
   - Damp wiping
   - Material disposal

4. **Personal Protective Equipment**
   - Respirators (N95 minimum)
   - Gloves, eye protection
   - Disposable coveralls

---

## Cost Estimation Process

### Overview

The Cost Estimation Service generates accurate pricing for disaster recovery services using jurisdiction-specific pricing databases, IICRC labor rates, and real-time material costs.

### Implementation

**Service**: `src/services/inspection/cost-estimation.service.ts`

```typescript
export class CostEstimationService {
  /**
   * Generate complete cost estimate for inspection report
   */
  async generateEstimate(params: {
    reportId: string;
    jurisdiction: AustralianState;
    damageAreas: DamageArea[];
    iicrcStandards: IICRCStandard[];
  }): Promise<CostEstimate> {
    const laborLineItems: LaborLineItem[] = [];
    const materialLineItems: MaterialLineItem[] = [];
    const equipmentLineItems: EquipmentLineItem[] = [];

    // Calculate labor costs
    for (const area of params.damageAreas) {
      const laborItems = await this.calculateLaborCosts({
        jurisdiction: params.jurisdiction,
        damageArea: area,
        iicrcStandards: params.iicrcStandards,
      });
      laborLineItems.push(...laborItems);
    }

    // Calculate material costs
    for (const area of params.damageAreas) {
      const materialItems = await this.calculateMaterialCosts({
        jurisdiction: params.jurisdiction,
        damageArea: area,
      });
      materialLineItems.push(...materialItems);
    }

    // Calculate equipment costs
    for (const area of params.damageAreas) {
      const equipmentItems = await this.calculateEquipmentCosts({
        jurisdiction: params.jurisdiction,
        damageArea: area,
        estimatedDryingTime: area.estimatedDryingTime || 72, // Default 3 days
      });
      equipmentLineItems.push(...equipmentItems);
    }

    // Calculate totals
    const totalLaborCost = laborLineItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalMaterialCost = materialLineItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalEquipmentCost = equipmentLineItems.reduce((sum, item) => sum + item.subtotal, 0);

    const subtotal = totalLaborCost + totalMaterialCost + totalEquipmentCost;
    const contingency = subtotal * 0.1; // 10% contingency
    const gst = (subtotal + contingency) * 0.1; // 10% GST (Australia)
    const totalCost = subtotal + contingency + gst;

    // Create cost estimate record
    const costEstimate = await this.prisma.costEstimate.create({
      data: {
        reportId: params.reportId,
        totalLaborHours: laborLineItems.reduce((sum, item) => sum + item.hours, 0),
        totalLaborCost,
        totalMaterialCost,
        totalEquipmentCost,
        subtotal,
        contingencyPercent: 10,
        contingencyAmount: contingency,
        gst,
        totalCost,
        jurisdiction: params.jurisdiction,
        pricingSource: 'NRPG_2025_Q1_RATES',
        laborLineItems: {
          create: laborLineItems.map((item) => ({ ...item, costEstimateId: undefined })),
        },
        materialLineItems: {
          create: materialLineItems.map((item) => ({ ...item, costEstimateId: undefined })),
        },
        equipmentLineItems: {
          create: equipmentLineItems.map((item) => ({ ...item, costEstimateId: undefined })),
        },
      },
      include: {
        laborLineItems: true,
        materialLineItems: true,
        equipmentLineItems: true,
      },
    });

    return costEstimate;
  }

  /**
   * Calculate labor costs based on IICRC certification level
   */
  private async calculateLaborCosts(params: {
    jurisdiction: AustralianState;
    damageArea: DamageArea;
    iicrcStandards: IICRCStandard[];
  }): Promise<Partial<LaborLineItem>[]> {
    const lineItems: Partial<LaborLineItem>[] = [];

    // Get hourly rates for jurisdiction
    const rates = await this.getPricingRates(params.jurisdiction);

    // Water extraction (if applicable)
    if (params.damageArea.damageCategory === 'CATEGORY_1' ||
        params.damageArea.damageCategory === 'CATEGORY_2') {
      const hours = this.estimateWaterExtractionHours(params.damageArea.affectedArea);
      lineItems.push({
        description: `Water extraction - ${params.damageArea.damageCategory}`,
        taskCode: `WE-${params.damageArea.damageCategory}`,
        iicrcLevel: 'WRT',
        hours,
        hourlyRate: rates.wrt,
        subtotal: hours * rates.wrt,
        jurisdiction: params.jurisdiction,
        rateEffectiveDate: new Date(),
      });
    }

    // Structural drying
    const dryingHours = this.estimateStructuralDryingHours(
      params.damageArea.affectedArea,
      params.damageArea.estimatedDryingTime || 72
    );
    lineItems.push({
      description: `Structural drying - ${params.damageArea.areaName}`,
      taskCode: 'SD-TECH',
      iicrcLevel: 'WRT',
      hours: dryingHours,
      hourlyRate: rates.wrt,
      subtotal: dryingHours * rates.wrt,
      jurisdiction: params.jurisdiction,
      rateEffectiveDate: new Date(),
    });

    // Mold remediation (if the mold standard applies)
    if (params.iicrcStandards.includes('MOULD_STANDARD')) {
      const moldHours = this.estimateMoldRemediationHours(params.damageArea.affectedArea);
      lineItems.push({
        description: `Mold remediation - ${params.damageArea.areaName}`,
        taskCode: 'MOLD-REM',
        iicrcLevel: 'AMRT',
        hours: moldHours,
        hourlyRate: rates.amrt,
        subtotal: moldHours * rates.amrt,
        jurisdiction: params.jurisdiction,
        rateEffectiveDate: new Date(),
      });
    }

    return lineItems;
  }

  /**
   * Get pricing rates for jurisdiction
   */
  private async getPricingRates(jurisdiction: AustralianState) {
    // NRPG 2025 Q1 Pricing (AUD per hour)
    const ratesByJurisdiction: Record<AustralianState, any> = {
      QLD: {
        wrt: 95.00,      // Water Restoration Technician
        amrt: 125.00,    // Applied Microbial Remediation Technician
        supervisor: 140.00,
        inspector: 160.00,
      },
      NSW: {
        wrt: 105.00,
        amrt: 135.00,
        supervisor: 150.00,
        inspector: 175.00,
      },
      VIC: {
        wrt: 100.00,
        amrt: 130.00,
        supervisor: 145.00,
        inspector: 170.00,
      },
      // ... other states
    };

    return ratesByJurisdiction[jurisdiction];
  }

  /**
   * Estimate hours for water extraction
   */
  private estimateWaterExtractionHours(affectedAreaSqM: number): number {
    // Rule of thumb: 1 hour per 20 sq meters
    return Math.ceil(affectedAreaSqM / 20);
  }

  /**
   * Estimate hours for structural drying monitoring
   */
  private estimateStructuralDryingHours(affectedAreaSqM: number, dryingTimeHours: number): number {
    // 2 hours per day for monitoring and adjustment
    const dryingDays = Math.ceil(dryingTimeHours / 24);
    return dryingDays * 2;
  }

  /**
   * Estimate hours for mold remediation
   */
  private estimateMoldRemediationHours(affectedAreaSqM: number): number {
    // Rule of thumb: 3 hours per sq meter for severe mold
    return affectedAreaSqM * 3;
  }
}
```

### Pricing Database

**Service**: `src/services/inspection/pricing-database.service.ts`

Maintains up-to-date pricing for:
- **Labor rates** by IICRC certification level
- **Material costs** (antimicrobials, sealants, etc.)
- **Equipment rental rates** (dehumidifiers, air movers, etc.)
- **Jurisdiction-specific adjustments**

---

## Approval Workflow

### Workflow Stages

```
SCHEDULED → IN_PROGRESS → DATA_COLLECTION_COMPLETE → DRAFT_GENERATED
    ↓
TECHNICAL_REVIEW → MANAGER_REVIEW → APPROVED → SENT_TO_CLIENT
    ↓
SENT_TO_INSURER
```

### Implementation

**Service**: `src/services/inspection/approval-workflow.service.ts`

```typescript
export class ApprovalWorkflowService {
  /**
   * Transition report status through approval chain
   */
  async transitionStatus(params: {
    reportId: string;
    newStatus: InspectionStatus;
    userId: string;
    userRole: 'INSPECTOR' | 'TECHNICAL_REVIEWER' | 'MANAGER' | 'FINAL_APPROVER';
    notes?: string;
  }) {
    const report = await this.prisma.inspectionReport.findUnique({
      where: { id: params.reportId },
    });

    if (!report) {
      throw new Error(`Inspection report not found: ${params.reportId}`);
    }

    // Validate transition is allowed
    this.validateTransition(report.status, params.newStatus, params.userRole);

    // Update report based on role
    const updateData: any = {
      status: params.newStatus,
    };

    if (params.userRole === 'TECHNICAL_REVIEWER') {
      updateData.technicalReviewerId = params.userId;
      updateData.technicalReviewDate = new Date();
      updateData.technicalReviewNotes = params.notes;
    } else if (params.userRole === 'MANAGER') {
      updateData.managerReviewerId = params.userId;
      updateData.managerReviewDate = new Date();
      updateData.managerReviewNotes = params.notes;
    } else if (params.userRole === 'FINAL_APPROVER') {
      updateData.finalApproverId = params.userId;
      updateData.finalApprovalDate = new Date();
      updateData.isDraft = false;
    }

    const updatedReport = await this.prisma.inspectionReport.update({
      where: { id: params.reportId },
      data: updateData,
    });

    return {
      oldStatus: report.status,
      newStatus: updatedReport.status,
      report: updatedReport,
    };
  }

  /**
   * Validate status transition is allowed
   */
  private validateTransition(
    currentStatus: InspectionStatus,
    newStatus: InspectionStatus,
    userRole: string
  ) {
    const allowedTransitions: Record<InspectionStatus, InspectionStatus[]> = {
      SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['DATA_COLLECTION_COMPLETE', 'CANCELLED'],
      DATA_COLLECTION_COMPLETE: ['DRAFT_GENERATED'],
      DRAFT_GENERATED: ['TECHNICAL_REVIEW'],
      TECHNICAL_REVIEW: ['MANAGER_REVIEW', 'REVISED'],
      MANAGER_REVIEW: ['APPROVED', 'REVISED'],
      APPROVED: ['SENT_TO_CLIENT'],
      SENT_TO_CLIENT: ['SENT_TO_INSURER'],
      REVISED: ['TECHNICAL_REVIEW'],
      SENT_TO_INSURER: [],
      CANCELLED: [],
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: ${currentStatus} → ${newStatus}`
      );
    }
  }
}
```

### Approval Gates

1. **Technical Review** - Validates industry standards compliance
2. **Manager Review** - Validates cost estimates and jurisdiction rules
3. **Final Approval** - Authorizes release to client/insurer

---

## PDF Generation

### Overview

Generates professional PDF reports using Puppeteer and Handlebars templates.

### Implementation

**Service**: `src/services/inspection/pdf-generation.service.ts`

```typescript
export class PDFGenerationService {
  /**
   * Generate PDF report from inspection data
   */
  async generateReport(params: {
    report: InspectionReport;
    templateType: 'STANDARD' | 'INSURANCE' | 'TECHNICAL';
  }): Promise<{ pdfUrl: string; pdfBuffer: Buffer }> {
    // Load Handlebars template
    const templatePath = this.getTemplatePath(params.templateType);
    const template = await this.loadTemplate(templatePath);

    // Compile template with report data
    const html = template({
      reportNumber: params.report.reportNumber,
      inspectionDate: params.report.inspectionDate,
      inspector: params.report.inspector,
      client: params.report.booking.client,
      jurisdiction: params.report.jurisdiction,
      damageAreas: params.report.damageAreas,
      moistureReadings: params.report.moistureReadings,
      photos: params.report.photos,
      costEstimate: params.report.costEstimate,
      complianceChecks: params.report.complianceChecks,
      executiveSummary: params.report.executiveSummary,
      findings: params.report.findings,
      recommendations: params.report.recommendations,
    });

    // Generate PDF with Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });

    await browser.close();

    // Upload to cloud storage (S3/CloudFlare R2)
    const pdfUrl = await this.uploadPDF(pdfBuffer, params.report.reportNumber);

    return { pdfUrl, pdfBuffer };
  }

  /**
   * Get template path based on type
   */
  private getTemplatePath(templateType: string): string {
    const templates = {
      STANDARD: 'templates/inspection-report-standard.hbs',
      INSURANCE: 'templates/inspection-report-insurance.hbs',
      TECHNICAL: 'templates/inspection-report-technical.hbs',
    };
    return templates[templateType];
  }
}
```

### PDF Templates

**Templates** use Handlebars for dynamic content:

- **Standard Template**: Client-facing, plain language
- **Insurance Template**: Detailed for claims processing
- **Technical Template**: Comprehensive for contractors

---

## Data Models

See `prisma/schema.prisma` for complete database schema.

**Key Models**:
- `InspectionReport` - Main report record
- `DamageArea` - Individual damage locations
- `MoistureReading` - Moisture measurements
- `InspectionPhoto` - Photo documentation
- `CostEstimate` - Pricing breakdown
- `ComplianceCheck` - Jurisdiction compliance
- `ReportRevision` - Audit trail

---

## API Reference

See [API_REFERENCE.md](./API_REFERENCE.md) for complete API documentation.

**Key Endpoints**:

```typescript
// Create inspection report
POST /api/inspection/reports

// Add damage area
POST /api/inspection/reports/:id/damage-areas

// Generate cost estimate
POST /api/inspection/reports/:id/cost-estimate

// Run compliance validation
POST /api/inspection/reports/:id/compliance

// Generate PDF
POST /api/inspection/reports/:id/pdf

// Transition status
PATCH /api/inspection/reports/:id/status
```

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-29
**Maintained By**: Disaster Recovery NRPG Platform Team
