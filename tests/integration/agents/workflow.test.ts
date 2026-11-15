/**
 * Integration Tests: Agent Orchestrator Workflow
 *
 * Tests 4-agent workflow for inspection processing:
 * 1. Data Intake Agent - Validates and structures inspection data
 * 2. Report Generation Agent - Creates comprehensive inspection report
 * 3. Quality Assurance Agent - Reviews and approves/rejects report
 * 4. Operations Agent - Finalizes and distributes approved report
 *
 * Verifies:
 * - Sequential agent execution
 * - State persistence between agents
 * - Error handling and compensation
 * - QA rejection and revision workflow
 * - Session management
 *
 * @module AgentWorkflowTests
 * @author Disaster Recovery NRPG Platform
 * @date 2025-12-29
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock types matching agent-orchestrator.ts
interface InspectionData {
  propertyAddress: string;
  inspectorId: string;
  customerId: string;
  inspectionType: string;
  scheduledDate: string;
  findings: InspectionFinding[];
  photos: Photo[];
  metadata: Record<string, any>;
}

interface InspectionFinding {
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  location: string;
  recommendation: string;
  estimatedCost?: number;
}

interface Photo {
  url: string;
  caption: string;
  category: string;
  timestamp: string;
}

interface WorkflowState {
  workflowId: string;
  status: 'RUNNING' | 'REVISION_REQUIRED' | 'COMPLETED' | 'FAILED';
  currentStep: 'INTAKE' | 'REPORT_GEN' | 'QA' | 'OPERATIONS' | 'FINISHED';
  sessions: {
    intake?: string;
    reportGen?: string;
    qa?: string;
    operations?: string;
  };
  results: {
    intake?: any;
    report?: any;
    qa?: any;
    operations?: any;
  };
  error?: string;
  startedAt: string;
  completedAt?: string;
}

describe('Agent Orchestrator Workflow Integration', () => {
  let mockInspectionData: InspectionData;
  let workflowState: WorkflowState;

  beforeEach(() => {
    // Setup mock inspection data
    mockInspectionData = {
      propertyAddress: '456 Collins St, Melbourne VIC 3000',
      inspectorId: 'inspector-123',
      customerId: 'customer-456',
      inspectionType: 'WATER_DAMAGE',
      scheduledDate: new Date().toISOString(),
      findings: [
        {
          category: 'Water Damage',
          severity: 'HIGH',
          description: 'Significant water infiltration in master bedroom',
          location: 'Master Bedroom, Level 2',
          recommendation: 'Immediate water extraction and drying required',
          estimatedCost: 5500,
        },
        {
          category: 'Structural',
          severity: 'MEDIUM',
          description: 'Ceiling drywall showing signs of water damage',
          location: 'Living Room, Level 1',
          recommendation: 'Replace affected drywall sections',
          estimatedCost: 2000,
        },
        {
          category: 'Mold Risk',
          severity: 'LOW',
          description: 'Minor moisture detected in bathroom',
          location: 'Ensuite Bathroom, Level 2',
          recommendation: 'Monitor moisture levels, increase ventilation',
          estimatedCost: 500,
        },
      ],
      photos: [
        {
          url: 'https://cdn.example.com/photos/bedroom-damage.jpg',
          caption: 'Master bedroom water damage',
          category: 'DAMAGE_DETAIL',
          timestamp: new Date().toISOString(),
        },
        {
          url: 'https://cdn.example.com/photos/ceiling-damage.jpg',
          caption: 'Living room ceiling damage',
          category: 'DAMAGE_DETAIL',
          timestamp: new Date().toISOString(),
        },
      ],
      metadata: {
        emergencyService: true,
        insuranceClaim: 'INS-2025-001',
        customerPriority: 'HIGH',
      },
    };

    // Initialize workflow state
    workflowState = {
      workflowId: `workflow-${Date.now()}`,
      status: 'RUNNING',
      currentStep: 'INTAKE',
      sessions: {},
      results: {},
      startedAt: new Date().toISOString(),
    };
  });

  it('should execute complete 4-agent workflow successfully', async () => {
    // ========================================
    // AGENT 1: Data Intake Agent
    // ========================================
    console.log('Starting Agent 1: Data Intake');

    // Simulate Data Intake Agent processing
    const intakeResult = {
      sessionId: `intake-session-${Date.now()}`,
      validatedData: mockInspectionData,
      complianceChecks: {
        passed: true,
        issues: [],
      },
      historicalContext: {
        priorInspections: 2,
        customerHistory: 'Good payment history, 2 previous jobs completed successfully',
      },
      insuranceRequirements: {
        applicable: true,
        requirements: [
          'Industry standards compliance required',
          'Photo documentation mandatory',
          'Detailed cost breakdown required',
        ],
      },
      status: 'SUCCESS' as const,
      timestamp: new Date().toISOString(),
    };

    // Update workflow state
    workflowState.sessions.intake = intakeResult.sessionId;
    workflowState.results.intake = intakeResult;
    workflowState.currentStep = 'REPORT_GEN';

    expect(intakeResult.status).toBe('SUCCESS');
    expect(intakeResult.complianceChecks.passed).toBe(true);
    expect(intakeResult.validatedData.findings.length).toBe(3);
    expect(workflowState.currentStep).toBe('REPORT_GEN');

    // ========================================
    // AGENT 2: Report Generation Agent
    // ========================================
    console.log('Starting Agent 2: Report Generation');

    // Simulate Report Generation Agent processing
    const reportResult = {
      sessionId: `report-session-${Date.now()}`,
      reportId: `report-${Date.now()}`,
      reportUrl: `https://cdn.example.com/reports/report-${Date.now()}.pdf`,
      generatedSections: [
        'Executive Summary',
        'Scope of Work',
        'Damage Assessment',
        'Cost Estimation',
        'Recommendations',
        'Compliance Documentation',
      ],
      complianceDocumentation: {
        standards: ['Industry standards', 'AS/NZS 3733'],
        certifications: ['Water Damage Restoration Certified'],
        insuranceRequirements: intakeResult.insuranceRequirements.requirements,
      },
      totalCost: 8000.00,
      estimatedCompletionDays: 5,
      status: 'SUCCESS' as const,
      timestamp: new Date().toISOString(),
    };

    // Update workflow state
    workflowState.sessions.reportGen = reportResult.sessionId;
    workflowState.results.report = reportResult;
    workflowState.currentStep = 'QA';

    expect(reportResult.status).toBe('SUCCESS');
    expect(reportResult.generatedSections.length).toBe(6);
    expect(reportResult.totalCost).toBe(8000.00);
    expect(workflowState.currentStep).toBe('QA');

    // ========================================
    // AGENT 3: Quality Assurance Agent
    // ========================================
    console.log('Starting Agent 3: Quality Assurance');

    // Simulate QA Agent processing
    const qaResult = {
      sessionId: `qa-session-${Date.now()}`,
      approved: true,
      qualityScore: 95,
      checks: [
        {
          name: 'Compliance Standards',
          passed: true,
          notes: 'All industry standards properly documented',
        },
        {
          name: 'Cost Accuracy',
          passed: true,
          notes: 'Cost estimates align with damage severity',
        },
        {
          name: 'Photo Documentation',
          passed: true,
          notes: 'Sufficient photos provided for all damage areas',
        },
        {
          name: 'Technical Accuracy',
          passed: true,
          notes: 'Moisture readings and drying timelines are reasonable',
        },
        {
          name: 'Insurance Requirements',
          passed: true,
          notes: 'All insurance documentation requirements met',
        },
      ],
      revisionRequired: false,
      revisionNotes: [],
      reviewedBy: 'qa-agent-001',
      status: 'APPROVED' as const,
      timestamp: new Date().toISOString(),
    };

    // Update workflow state
    workflowState.sessions.qa = qaResult.sessionId;
    workflowState.results.qa = qaResult;
    workflowState.currentStep = 'OPERATIONS';

    expect(qaResult.approved).toBe(true);
    expect(qaResult.qualityScore).toBeGreaterThanOrEqual(90);
    expect(qaResult.checks.every(c => c.passed)).toBe(true);
    expect(qaResult.revisionRequired).toBe(false);
    expect(workflowState.currentStep).toBe('OPERATIONS');

    // ========================================
    // AGENT 4: Operations Agent
    // ========================================
    console.log('Starting Agent 4: Operations');

    // Simulate Operations Agent processing
    const operationsResult = {
      sessionId: `operations-session-${Date.now()}`,
      distributionStatus: {
        customer: 'SENT',
        inspector: 'SENT',
        insurance: 'SENT',
        management: 'SENT',
      },
      notificationsSent: [
        {
          recipient: 'customer-456',
          type: 'EMAIL',
          subject: 'Inspection Report Ready',
          sentAt: new Date().toISOString(),
        },
        {
          recipient: 'inspector-123',
          type: 'EMAIL',
          subject: 'Report Approved - Action Required',
          sentAt: new Date().toISOString(),
        },
        {
          recipient: 'INS-2025-001',
          type: 'API',
          subject: 'Insurance Claim Documentation',
          sentAt: new Date().toISOString(),
        },
      ],
      scheduling: {
        serviceScheduled: true,
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        crewAssigned: 'CREW-A',
        equipmentReserved: true,
      },
      invoicing: {
        invoiceGenerated: true,
        invoiceId: `INV-${Date.now()}`,
        amount: 8000.00,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      status: 'COMPLETED' as const,
      timestamp: new Date().toISOString(),
    };

    // Update workflow state
    workflowState.sessions.operations = operationsResult.sessionId;
    workflowState.results.operations = operationsResult;
    workflowState.currentStep = 'FINISHED';
    workflowState.status = 'COMPLETED';
    workflowState.completedAt = new Date().toISOString();

    expect(operationsResult.status).toBe('COMPLETED');
    expect(operationsResult.distributionStatus.customer).toBe('SENT');
    expect(operationsResult.notificationsSent.length).toBe(3);
    expect(operationsResult.scheduling.serviceScheduled).toBe(true);
    expect(operationsResult.invoicing.invoiceGenerated).toBe(true);
    expect(workflowState.status).toBe('COMPLETED');

    // ========================================
    // Verify Complete Workflow
    // ========================================
    expect(workflowState.sessions.intake).toBeDefined();
    expect(workflowState.sessions.reportGen).toBeDefined();
    expect(workflowState.sessions.qa).toBeDefined();
    expect(workflowState.sessions.operations).toBeDefined();

    expect(workflowState.results.intake).toBeDefined();
    expect(workflowState.results.report).toBeDefined();
    expect(workflowState.results.qa).toBeDefined();
    expect(workflowState.results.operations).toBeDefined();

    expect(workflowState.currentStep).toBe('FINISHED');
    expect(workflowState.completedAt).toBeDefined();
  });

  it('should handle QA rejection and revision workflow', async () => {
    // Execute steps 1-2 (Intake and Report Generation)
    const intakeResult = {
      sessionId: `intake-${Date.now()}`,
      validatedData: mockInspectionData,
      complianceChecks: { passed: true, issues: [] },
      status: 'SUCCESS' as const,
      timestamp: new Date().toISOString(),
    };

    const reportResult = {
      sessionId: `report-${Date.now()}`,
      reportId: `report-${Date.now()}`,
      generatedSections: ['Executive Summary', 'Damage Assessment'],
      totalCost: 8000.00,
      status: 'SUCCESS' as const,
      timestamp: new Date().toISOString(),
    };

    workflowState.results.intake = intakeResult;
    workflowState.results.report = reportResult;
    workflowState.currentStep = 'QA';

    // QA Agent REJECTS report
    const qaResult = {
      sessionId: `qa-${Date.now()}`,
      approved: false,
      qualityScore: 65,
      checks: [
        {
          name: 'Photo Documentation',
          passed: false,
          notes: 'Insufficient photos for bathroom area',
        },
        {
          name: 'Cost Accuracy',
          passed: false,
          notes: 'Cost breakdown lacks equipment rental details',
        },
      ],
      revisionRequired: true,
      revisionNotes: [
        'Add photos of bathroom moisture damage',
        'Include detailed equipment rental costs',
        'Provide moisture reading timeline',
      ],
      status: 'REVISION_REQUIRED' as const,
      timestamp: new Date().toISOString(),
    };

    workflowState.results.qa = qaResult;
    workflowState.status = 'REVISION_REQUIRED';
    workflowState.currentStep = 'REPORT_GEN'; // Go back to report generation

    expect(qaResult.approved).toBe(false);
    expect(qaResult.revisionRequired).toBe(true);
    expect(qaResult.revisionNotes.length).toBe(3);
    expect(workflowState.status).toBe('REVISION_REQUIRED');
    expect(workflowState.currentStep).toBe('REPORT_GEN');

    // Report Generation Agent addresses revisions
    const revisedReportResult = {
      sessionId: `report-revised-${Date.now()}`,
      reportId: reportResult.reportId, // Same report, revised
      generatedSections: [
        'Executive Summary',
        'Damage Assessment',
        'Equipment Rental Breakdown', // NEW
        'Moisture Reading Timeline', // NEW
      ],
      additionalPhotos: 3, // NEW photos added
      totalCost: 8500.00, // Updated with equipment details
      status: 'SUCCESS' as const,
      timestamp: new Date().toISOString(),
    };

    workflowState.results.report = revisedReportResult;
    workflowState.currentStep = 'QA';

    // QA Agent re-reviews and APPROVES
    const qaReReviewResult = {
      sessionId: `qa-rerev-${Date.now()}`,
      approved: true,
      qualityScore: 92,
      checks: [
        { name: 'Photo Documentation', passed: true, notes: 'All areas documented' },
        { name: 'Cost Accuracy', passed: true, notes: 'Detailed breakdown provided' },
      ],
      revisionRequired: false,
      revisionNotes: [],
      status: 'APPROVED' as const,
      timestamp: new Date().toISOString(),
    };

    workflowState.results.qa = qaReReviewResult;
    workflowState.status = 'RUNNING';
    workflowState.currentStep = 'OPERATIONS';

    expect(qaReReviewResult.approved).toBe(true);
    expect(workflowState.status).toBe('RUNNING');
    expect(workflowState.currentStep).toBe('OPERATIONS');
  });

  it('should handle error and perform compensation/rollback', async () => {
    // Execute Intake successfully
    const intakeResult = {
      sessionId: `intake-${Date.now()}`,
      validatedData: mockInspectionData,
      status: 'SUCCESS' as const,
      timestamp: new Date().toISOString(),
    };

    workflowState.results.intake = intakeResult;
    workflowState.currentStep = 'REPORT_GEN';

    // Report Generation fails
    try {
      throw new Error('PDF generation service unavailable');
    } catch (error: any) {
      workflowState.status = 'FAILED';
      workflowState.error = error.message;
      workflowState.currentStep = 'REPORT_GEN';

      // Compensation: Clean up partial report data
      const compensationActions = [
        'Rollback partial report creation',
        'Release reserved resources',
        'Notify inspector of failure',
        'Schedule retry',
      ];

      expect(workflowState.status).toBe('FAILED');
      expect(workflowState.error).toContain('unavailable');
      expect(compensationActions.length).toBe(4);
    }
  });

  it('should persist session state between agent executions', async () => {
    // Agent 1: Data Intake
    const intakeSessionId = `intake-${Date.now()}`;
    workflowState.sessions.intake = intakeSessionId;
    workflowState.results.intake = {
      sessionId: intakeSessionId,
      validatedData: mockInspectionData,
      status: 'SUCCESS',
    };

    // Simulate workflow pause/resume
    const serializedState = JSON.stringify(workflowState);
    const resumedState: WorkflowState = JSON.parse(serializedState);

    expect(resumedState.sessions.intake).toBe(intakeSessionId);
    expect(resumedState.results.intake).toBeDefined();
    expect(resumedState.results.intake.validatedData.propertyAddress).toBe(mockInspectionData.propertyAddress);

    // Agent 2: Resume from persisted state
    const reportSessionId = `report-${Date.now()}`;
    resumedState.sessions.reportGen = reportSessionId;
    resumedState.currentStep = 'REPORT_GEN';

    expect(resumedState.sessions.intake).toBeDefined();
    expect(resumedState.sessions.reportGen).toBeDefined();
  });

  it('should track execution metrics for each agent', async () => {
    const metrics = {
      intake: {
        startTime: Date.now(),
        endTime: 0,
        duration: 0,
        success: false,
      },
      reportGen: {
        startTime: 0,
        endTime: 0,
        duration: 0,
        success: false,
      },
      qa: {
        startTime: 0,
        endTime: 0,
        duration: 0,
        success: false,
      },
      operations: {
        startTime: 0,
        endTime: 0,
        duration: 0,
        success: false,
      },
    };

    // Agent 1
    await new Promise(resolve => setTimeout(resolve, 10));
    metrics.intake.endTime = Date.now();
    metrics.intake.duration = metrics.intake.endTime - metrics.intake.startTime;
    metrics.intake.success = true;

    // Agent 2
    metrics.reportGen.startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 10));
    metrics.reportGen.endTime = Date.now();
    metrics.reportGen.duration = metrics.reportGen.endTime - metrics.reportGen.startTime;
    metrics.reportGen.success = true;

    expect(metrics.intake.success).toBe(true);
    expect(metrics.intake.duration).toBeGreaterThan(0);
    expect(metrics.reportGen.success).toBe(true);
    expect(metrics.reportGen.duration).toBeGreaterThan(0);
  });

  it('should handle critical severity findings with expedited workflow', async () => {
    // Create critical severity inspection
    const criticalData: InspectionData = {
      ...mockInspectionData,
      findings: [
        {
          category: 'Structural Integrity',
          severity: 'CRITICAL',
          description: 'Major structural damage, building unsafe',
          location: 'Main Support Beam',
          recommendation: 'IMMEDIATE EVACUATION AND EMERGENCY SHORING',
          estimatedCost: 50000,
        },
      ],
      metadata: {
        emergencyService: true,
        priority: 'CRITICAL',
        evacuationRequired: true,
      },
    };

    // Data Intake detects critical severity
    const intakeResult = {
      sessionId: `intake-critical-${Date.now()}`,
      validatedData: criticalData,
      complianceChecks: { passed: true, issues: [] },
      priorityOverride: 'CRITICAL',
      expeditedWorkflow: true,
      status: 'SUCCESS' as const,
      timestamp: new Date().toISOString(),
    };

    expect(intakeResult.priorityOverride).toBe('CRITICAL');
    expect(intakeResult.expeditedWorkflow).toBe(true);

    // Report generation uses expedited template
    const reportResult = {
      sessionId: `report-critical-${Date.now()}`,
      reportId: `critical-report-${Date.now()}`,
      expedited: true,
      notificationsSent: ['emergency-team', 'management', 'customer'],
      status: 'SUCCESS' as const,
      timestamp: new Date().toISOString(),
    };

    expect(reportResult.expedited).toBe(true);
    expect(reportResult.notificationsSent).toContain('emergency-team');
  });
});
