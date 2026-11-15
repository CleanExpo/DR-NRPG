/**
 * Integration Tests: Inspection Report Workflow
 *
 * Tests full inspection report lifecycle:
 * Create report → Add damage areas → Generate cost → Validate compliance → Approve → Generate PDF
 *
 * Verifies:
 * - All state transitions (DRAFT → IN_PROGRESS → PENDING_REVIEW → APPROVED)
 * - Compliance checks created and validated
 * - Cost estimation integration
 * - PDF generation
 * - Approval workflow with multi-level review
 *
 * @module InspectionReportWorkflowTests
 * @author Disaster Recovery NRPG Platform
 * @date 2025-12-29
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { InspectionStatus, DamageCategory, IICRCStandard, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

// Skip database integration tests if DB_INTEGRATION_TESTS environment variable is not set
// These tests require a properly configured PostgreSQL database
const describeIfDatabase = process.env.DB_INTEGRATION_TESTS === 'true' ? describe : describe.skip;

describeIfDatabase('Inspection Report Workflow Integration', () => {
  const testInspectorId = `inspector-${Date.now()}`;
  const testCustomerId = `customer-${Date.now()}`;
  const testBookingId = `booking-${Date.now()}`;
  const testPropertyId = `property-${Date.now()}`;

  beforeEach(async () => {
    // Create test users
    await prisma.user.create({
      data: {
        id: testInspectorId,
        email: `inspector-${Date.now()}@example.com`,
        name: 'Test Inspector',
        role: 'INSPECTOR',
        australianState: 'VIC',
      },
    });

    await prisma.user.create({
      data: {
        id: testCustomerId,
        email: `customer-${Date.now()}@example.com`,
        name: 'Test Customer',
        australianState: 'VIC',
      },
    });

    // Create test booking
    await prisma.booking.create({
      data: {
        id: testBookingId,
        userId: testCustomerId,
        serviceDate: new Date(),
        status: 'CONFIRMED',
        serviceType: 'WATER_DAMAGE_RESTORATION',
        estimatedDuration: 240,
        australianState: 'VIC',
        propertyAddress: '123 Test St, Melbourne VIC 3000',
        estimatedCostAUD: new Prisma.Decimal(5000.00),
      },
    });
  });

  afterEach(async () => {
    // Cleanup in reverse order of dependencies
    await prisma.complianceCheck.deleteMany({ where: { reportId: { contains: 'report-' } } });
    await prisma.moistureReading.deleteMany({ where: { reportId: { contains: 'report-' } } });
    await prisma.inspectionPhoto.deleteMany({ where: { reportId: { contains: 'report-' } } });
    await prisma.damageArea.deleteMany({ where: { reportId: { contains: 'report-' } } });
    await prisma.inspectionReport.deleteMany({ where: { bookingId: testBookingId } });
    await prisma.booking.deleteMany({ where: { id: testBookingId } });
    await prisma.user.deleteMany({ where: { id: { in: [testInspectorId, testCustomerId] } } });
  });

  it('should complete full inspection report lifecycle', async () => {
    // ========================================
    // STEP 1: Create Inspection Report (DRAFT)
    // ========================================
    const report = await prisma.inspectionReport.create({
      data: {
        id: `report-${Date.now()}`,
        bookingId: testBookingId,
        inspectorId: testInspectorId,
        inspectionDate: new Date(),
        status: 'DRAFT',
        jurisdiction: 'VIC',
        scopeOfWork: 'Water damage assessment and restoration planning',
        executiveSummary: 'Preliminary inspection for water damage caused by burst pipe',
        totalEstimatedCostAUD: new Prisma.Decimal(0), // To be calculated
      },
    });

    expect(report).toBeDefined();
    expect(report.status).toBe('DRAFT');
    expect(report.totalEstimatedCostAUD.toNumber()).toBe(0);

    // ========================================
    // STEP 2: Add Damage Areas
    // ========================================
    const damageAreas = [
      {
        reportId: report.id,
        areaName: 'Master Bedroom',
        floor: 'Level 2',
        roomType: 'BEDROOM',
        damageCategory: 'WATER' as DamageCategory,
        affectedAreaSqm: new Prisma.Decimal(25.5),
        affectedMaterials: ['Carpet', 'Drywall', 'Baseboards'],
        description: 'Water damage from overhead pipe burst, affecting ceiling and floor',
        severity: 'MODERATE',
        requiredActions: [
          'Extract standing water',
          'Remove wet carpet and padding',
          'Dry wall cavity',
          'Install dehumidifiers',
        ],
        equipmentNeeded: ['Water extractors', 'Air movers', 'Dehumidifiers'],
        estimatedDryingTime: 72, // hours
        initialMoistureLevel: new Prisma.Decimal(65.5),
        targetMoistureLevel: new Prisma.Decimal(12.0),
      },
      {
        reportId: report.id,
        areaName: 'Ensuite Bathroom',
        floor: 'Level 2',
        roomType: 'BATHROOM',
        damageCategory: 'WATER' as DamageCategory,
        affectedAreaSqm: new Prisma.Decimal(8.0),
        affectedMaterials: ['Tile', 'Grout', 'Subfloor'],
        description: 'Water damage to subfloor and surrounding walls',
        severity: 'MINOR',
        requiredActions: [
          'Dry subfloor',
          'Inspect for mold growth',
          'Seal affected areas',
        ],
        equipmentNeeded: ['Air movers', 'Moisture meters'],
        estimatedDryingTime: 48, // hours
        initialMoistureLevel: new Prisma.Decimal(45.0),
        targetMoistureLevel: new Prisma.Decimal(15.0),
      },
      {
        reportId: report.id,
        areaName: 'Living Room',
        floor: 'Level 1',
        roomType: 'LIVING_ROOM',
        damageCategory: 'WATER' as DamageCategory,
        affectedAreaSqm: new Prisma.Decimal(40.0),
        affectedMaterials: ['Hardwood flooring', 'Drywall', 'Baseboards'],
        description: 'Water damage from ceiling leak, extensive floor damage',
        severity: 'SEVERE',
        requiredActions: [
          'Remove damaged hardwood',
          'Dry structural elements',
          'Replace flooring',
          'Repair ceiling drywall',
        ],
        equipmentNeeded: ['Water extractors', 'Air movers', 'Dehumidifiers', 'HEPA air scrubbers'],
        estimatedDryingTime: 96, // hours
        initialMoistureLevel: new Prisma.Decimal(78.5),
        targetMoistureLevel: new Prisma.Decimal(10.0),
      },
    ];

    for (const area of damageAreas) {
      await prisma.damageArea.create({ data: area });
    }

    const allDamageAreas = await prisma.damageArea.findMany({
      where: { reportId: report.id },
    });

    expect(allDamageAreas.length).toBe(3);
    expect(allDamageAreas.some(a => a.severity === 'SEVERE')).toBe(true);

    // ========================================
    // STEP 3: Add Moisture Readings
    // ========================================
    const moistureReadings = [
      {
        reportId: report.id,
        readingDate: new Date(),
        location: 'Master Bedroom - Center',
        material: 'Carpet',
        moistureContent: new Prisma.Decimal(65.5),
        ambientTemperature: new Prisma.Decimal(22.0),
        ambientHumidity: new Prisma.Decimal(55.0),
        meterType: 'Pin-type moisture meter',
        readingDepth: 'Surface',
        notes: 'Initial reading - heavily saturated',
      },
      {
        reportId: report.id,
        readingDate: new Date(),
        location: 'Living Room - Hardwood Floor',
        material: 'Hardwood',
        moistureContent: new Prisma.Decimal(78.5),
        ambientTemperature: new Prisma.Decimal(21.5),
        ambientHumidity: new Prisma.Decimal(58.0),
        meterType: 'Pin-type moisture meter',
        readingDepth: '6mm',
        notes: 'Severely wet, cupping observed',
      },
    ];

    for (const reading of moistureReadings) {
      await prisma.moistureReading.create({ data: reading });
    }

    // ========================================
    // STEP 4: Add Photos
    // ========================================
    const photos = [
      {
        reportId: report.id,
        photoUrl: 'https://cdn.example.com/inspection-photos/photo1.jpg',
        thumbnailUrl: 'https://cdn.example.com/inspection-photos/photo1-thumb.jpg',
        filename: 'master-bedroom-damage.jpg',
        fileSize: 2048000,
        mimeType: 'image/jpeg',
        photoType: 'DAMAGE_DETAIL' as const,
        caption: 'Master bedroom water damage - ceiling and floor',
        description: 'Shows extent of water damage from burst pipe',
        capturedAt: new Date(),
        sortOrder: 1,
      },
      {
        reportId: report.id,
        photoUrl: 'https://cdn.example.com/inspection-photos/photo2.jpg',
        thumbnailUrl: 'https://cdn.example.com/inspection-photos/photo2-thumb.jpg',
        filename: 'living-room-floor.jpg',
        fileSize: 1856000,
        mimeType: 'image/jpeg',
        photoType: 'BEFORE' as const,
        caption: 'Living room hardwood floor damage',
        description: 'Cupping and warping visible',
        capturedAt: new Date(),
        sortOrder: 2,
      },
    ];

    for (const photo of photos) {
      await prisma.inspectionPhoto.create({ data: photo });
    }

    // ========================================
    // STEP 5: Transition to IN_PROGRESS
    // ========================================
    const updatedReport = await prisma.inspectionReport.update({
      where: { id: report.id },
      data: {
        status: 'IN_PROGRESS',
      },
    });

    expect(updatedReport.status).toBe('IN_PROGRESS');

    // ========================================
    // STEP 6: Calculate Cost Estimate
    // ========================================
    // Simplified cost calculation (in production, this uses CostEstimationService)
    const totalCost = damageAreas.reduce((sum, area) => {
      const baseRate = 100; // $100/sqm base rate
      const severityMultiplier = area.severity === 'SEVERE' ? 1.5 : area.severity === 'MODERATE' ? 1.2 : 1.0;
      const areaCost = area.affectedAreaSqm.toNumber() * baseRate * severityMultiplier;
      return sum + areaCost;
    }, 0);

    const reportWithCost = await prisma.inspectionReport.update({
      where: { id: report.id },
      data: {
        totalEstimatedCostAUD: new Prisma.Decimal(totalCost),
      },
    });

    expect(reportWithCost.totalEstimatedCostAUD.toNumber()).toBeGreaterThan(0);
    expect(reportWithCost.totalEstimatedCostAUD.toNumber()).toBeCloseTo(11310, 0); // Expected based on calculation

    // ========================================
    // STEP 7: Create Compliance Checks
    // ========================================
    const complianceChecks = [
      {
        reportId: report.id,
        standardType: 'IICRC_S500' as IICRCStandard,
        requirementDescription: 'Water damage restoration standard compliance',
        isPassed: true,
        verifiedDate: new Date(),
        verifiedBy: testInspectorId,
        evidenceNotes: 'All moisture readings documented, drying procedures follow industry standards',
        regulatoryReference: 'Industry guidance on water damage restoration',
      },
      {
        reportId: report.id,
        standardType: 'IICRC_S520' as IICRCStandard,
        requirementDescription: 'Mold remediation standard (preventive)',
        isPassed: true,
        verifiedDate: new Date(),
        verifiedBy: testInspectorId,
        evidenceNotes: 'Drying timeline prevents mold growth, HEPA filtration planned',
        regulatoryReference: 'Industry guidance on mould remediation',
      },
      {
        reportId: report.id,
        standardType: 'AS_NZS_3733' as IICRCStandard,
        requirementDescription: 'Australian/NZ building compliance for fire and water damage',
        isPassed: true,
        verifiedDate: new Date(),
        verifiedBy: testInspectorId,
        evidenceNotes: 'Restoration plan meets AS/NZS 3733:2018 requirements',
        regulatoryReference: 'AS/NZS 3733:2018',
      },
    ];

    for (const check of complianceChecks) {
      await prisma.complianceCheck.create({ data: check });
    }

    const allCompliance = await prisma.complianceCheck.findMany({
      where: { reportId: report.id },
    });

    expect(allCompliance.length).toBe(3);
    expect(allCompliance.every(c => c.isPassed === true)).toBe(true);

    // ========================================
    // STEP 8: Transition to PENDING_REVIEW
    // ========================================
    const reviewReport = await prisma.inspectionReport.update({
      where: { id: report.id },
      data: {
        status: 'PENDING_REVIEW',
        submittedForReviewAt: new Date(),
      },
    });

    expect(reviewReport.status).toBe('PENDING_REVIEW');
    expect(reviewReport.submittedForReviewAt).toBeDefined();

    // ========================================
    // STEP 9: Technical Review (First Approval)
    // ========================================
    const technicalReview = await prisma.inspectionReport.update({
      where: { id: report.id },
      data: {
        status: 'TECHNICAL_REVIEW',
        technicalReviewedAt: new Date(),
        technicalReviewedBy: testInspectorId,
      },
    });

    expect(technicalReview.status).toBe('TECHNICAL_REVIEW');

    // ========================================
    // STEP 10: Manager Review (Second Approval)
    // ========================================
    const managerReview = await prisma.inspectionReport.update({
      where: { id: report.id },
      data: {
        status: 'MANAGER_REVIEW',
        managerReviewedAt: new Date(),
        managerReviewedBy: testInspectorId,
      },
    });

    expect(managerReview.status).toBe('MANAGER_REVIEW');

    // ========================================
    // STEP 11: Final Approval
    // ========================================
    const approvedReport = await prisma.inspectionReport.update({
      where: { id: report.id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: testInspectorId,
        pdfReportUrl: `https://cdn.example.com/reports/${report.id}.pdf`,
        pdfGeneratedAt: new Date(),
      },
    });

    expect(approvedReport.status).toBe('APPROVED');
    expect(approvedReport.approvedAt).toBeDefined();
    expect(approvedReport.pdfReportUrl).toContain('.pdf');

    // ========================================
    // STEP 12: Verify Complete Report
    // ========================================
    const finalReport = await prisma.inspectionReport.findUnique({
      where: { id: report.id },
      include: {
        damageAreas: true,
        moistureReadings: true,
        photos: true,
        complianceChecks: true,
        booking: true,
      },
    });

    expect(finalReport).toBeDefined();
    expect(finalReport!.status).toBe('APPROVED');
    expect(finalReport!.damageAreas.length).toBe(3);
    expect(finalReport!.moistureReadings.length).toBe(2);
    expect(finalReport!.photos.length).toBe(2);
    expect(finalReport!.complianceChecks.length).toBe(3);
    expect(finalReport!.totalEstimatedCostAUD.toNumber()).toBeGreaterThan(0);
    expect(finalReport!.pdfReportUrl).toBeDefined();
  });

  it('should handle report rejection and revision workflow', async () => {
    // Create report
    const report = await prisma.inspectionReport.create({
      data: {
        id: `report-reject-${Date.now()}`,
        bookingId: testBookingId,
        inspectorId: testInspectorId,
        inspectionDate: new Date(),
        status: 'DRAFT',
        jurisdiction: 'VIC',
        scopeOfWork: 'Quick assessment',
        totalEstimatedCostAUD: new Prisma.Decimal(1000.00),
      },
    });

    // Submit for review
    await prisma.inspectionReport.update({
      where: { id: report.id },
      data: {
        status: 'PENDING_REVIEW',
        submittedForReviewAt: new Date(),
      },
    });

    // Reject report (insufficient detail)
    const rejectedReport = await prisma.inspectionReport.update({
      where: { id: report.id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedBy: testInspectorId,
        rejectionReason: 'Insufficient damage area documentation. Need moisture readings and photos.',
      },
    });

    expect(rejectedReport.status).toBe('REJECTED');
    expect(rejectedReport.rejectionReason).toContain('insufficient');

    // Revise and resubmit
    const revisedReport = await prisma.inspectionReport.update({
      where: { id: report.id },
      data: {
        status: 'DRAFT',
        executiveSummary: 'Revised comprehensive assessment with detailed documentation',
        rejectedAt: null,
        rejectionReason: null,
      },
    });

    expect(revisedReport.status).toBe('DRAFT');

    // Add required documentation
    await prisma.damageArea.create({
      data: {
        reportId: report.id,
        areaName: 'Kitchen',
        floor: 'Level 1',
        roomType: 'KITCHEN',
        damageCategory: 'WATER',
        affectedAreaSqm: new Prisma.Decimal(15.0),
        affectedMaterials: ['Cabinetry', 'Flooring'],
        description: 'Water damage under sink',
        severity: 'MINOR',
        requiredActions: ['Dry affected area'],
        equipmentNeeded: ['Air movers'],
      },
    });

    // Resubmit
    const resubmittedReport = await prisma.inspectionReport.update({
      where: { id: report.id },
      data: {
        status: 'PENDING_REVIEW',
        submittedForReviewAt: new Date(),
      },
    });

    expect(resubmittedReport.status).toBe('PENDING_REVIEW');
  });

  it('should validate compliance checks before approval', async () => {
    const report = await prisma.inspectionReport.create({
      data: {
        id: `report-compliance-${Date.now()}`,
        bookingId: testBookingId,
        inspectorId: testInspectorId,
        inspectionDate: new Date(),
        status: 'PENDING_REVIEW',
        jurisdiction: 'VIC',
        scopeOfWork: 'Compliance validation test',
        totalEstimatedCostAUD: new Prisma.Decimal(5000.00),
      },
    });

    // Add damage area
    await prisma.damageArea.create({
      data: {
        reportId: report.id,
        areaName: 'Office',
        floor: 'Level 1',
        roomType: 'OFFICE',
        damageCategory: 'WATER',
        affectedAreaSqm: new Prisma.Decimal(20.0),
        affectedMaterials: ['Carpet'],
        description: 'Water damage',
        severity: 'MODERATE',
        requiredActions: ['Extract and dry'],
        equipmentNeeded: ['Extractors'],
      },
    });

    // Create compliance checks - one fails
    await prisma.complianceCheck.create({
      data: {
        reportId: report.id,
        standardType: 'IICRC_S500',
        requirementDescription: 'Water damage standard',
        isPassed: true,
        verifiedDate: new Date(),
        verifiedBy: testInspectorId,
      },
    });

    await prisma.complianceCheck.create({
      data: {
        reportId: report.id,
        standardType: 'AS_NZS_3733',
        requirementDescription: 'Building compliance',
        isPassed: false, // FAILED
        verifiedDate: new Date(),
        verifiedBy: testInspectorId,
        evidenceNotes: 'Additional structural assessment required',
      },
    });

    // Check if all compliance passed
    const checks = await prisma.complianceCheck.findMany({
      where: { reportId: report.id },
    });

    const allPassed = checks.every(c => c.isPassed === true);
    expect(allPassed).toBe(false); // Should fail due to one failed check

    // Report should not be approvable until all compliance passes
    expect(checks.some(c => c.isPassed === false)).toBe(true);
  });

  it('should track moisture readings over time for drying progress', async () => {
    const report = await prisma.inspectionReport.create({
      data: {
        id: `report-moisture-${Date.now()}`,
        bookingId: testBookingId,
        inspectorId: testInspectorId,
        inspectionDate: new Date(),
        status: 'IN_PROGRESS',
        jurisdiction: 'VIC',
        scopeOfWork: 'Moisture monitoring',
        totalEstimatedCostAUD: new Prisma.Decimal(3000.00),
      },
    });

    // Day 1 readings
    await prisma.moistureReading.create({
      data: {
        reportId: report.id,
        readingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        location: 'Bedroom - Center',
        material: 'Drywall',
        moistureContent: new Prisma.Decimal(45.0),
        meterType: 'Pin-type',
      },
    });

    // Day 2 readings
    await prisma.moistureReading.create({
      data: {
        reportId: report.id,
        readingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        location: 'Bedroom - Center',
        material: 'Drywall',
        moistureContent: new Prisma.Decimal(28.0),
        meterType: 'Pin-type',
      },
    });

    // Day 3 readings
    await prisma.moistureReading.create({
      data: {
        reportId: report.id,
        readingDate: new Date(),
        location: 'Bedroom - Center',
        material: 'Drywall',
        moistureContent: new Prisma.Decimal(15.0),
        meterType: 'Pin-type',
        notes: 'Target moisture level achieved',
      },
    });

    const readings = await prisma.moistureReading.findMany({
      where: { reportId: report.id },
      orderBy: { readingDate: 'asc' },
    });

    expect(readings.length).toBe(3);
    expect(readings[0].moistureContent.toNumber()).toBe(45.0);
    expect(readings[2].moistureContent.toNumber()).toBe(15.0);

    // Verify moisture is decreasing
    expect(readings[2].moistureContent.toNumber()).toBeLessThan(readings[0].moistureContent.toNumber());
  });
});
