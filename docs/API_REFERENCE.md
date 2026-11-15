# API Reference Documentation

## Overview

Complete API reference for the Disaster Recovery NRPG Platform. This document covers all CRM, Inspection, and Agent endpoints with request/response examples.

**Date Created**: 2025-12-29
**Last Updated**: 2025-12-29
**Version**: 1.0.0
**Base URL**: `https://api.disaster-recovery-nrpg.com/v1`

---

## Table of Contents

1. [Authentication](#authentication)
2. [CRM Endpoints](#crm-endpoints)
3. [Inspection Endpoints](#inspection-endpoints)
4. [Agent Endpoints](#agent-endpoints)
5. [Error Responses](#error-responses)

---

## Authentication

All API requests require authentication using JWT Bearer tokens.

### Obtain Access Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "inspector@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "example",
    "refreshToken": "example",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "email": "inspector@example.com",
      "name": "John Inspector",
      "userType": "CONTRACTOR"
    }
  }
}
```

### Using Access Token

Include the access token in the `Authorization` header:

```http
Authorization: Bearer {token}
```

---

## CRM Endpoints

### Customer Lifecycle

#### Get or Create Customer Lifecycle

```http
GET /api/crm/lifecycle/:userId
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "lifecycle_123",
    "userId": "user_456",
    "currentStage": "LEAD",
    "previousStage": null,
    "healthScore": 50,
    "healthScoreReason": "New customer - neutral score",
    "totalInteractions": 0,
    "lastInteractionDate": null,
    "daysSinceLastContact": 0,
    "lifetimeValueAUD": 0,
    "averageJobValueAUD": 0,
    "totalJobsCompleted": 0,
    "churnRiskScore": 0,
    "isAtRisk": false,
    "atRiskReasons": [],
    "assignedCSMId": null,
    "nextTouchpointDate": null,
    "createdAt": "2025-12-29T10:30:00Z",
    "updatedAt": "2025-12-29T10:30:00Z"
  }
}
```

#### Update Lifecycle Stage

```http
PATCH /api/crm/lifecycle/:id/stage
Authorization: Bearer {token}
Content-Type: application/json

{
  "newStage": "CUSTOMER",
  "reason": "Service completed successfully"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "lifecycle_123",
    "currentStage": "CUSTOMER",
    "previousStage": "OPPORTUNITY",
    "stageChangedAt": "2025-12-29T14:30:00Z"
  }
}
```

#### Calculate Health Score

```http
POST /api/crm/lifecycle/:id/calculate-health
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "score": 75,
    "reasons": [
      "Recent contact within 7 days",
      "Good engagement (25-49 interactions)",
      "Moderate value customer ($10K-24K AUD)",
      "Returning customer (5-9 jobs)",
      "Good payment history"
    ],
    "previousScore": 50,
    "change": +25
  }
}
```

#### Get At-Risk Customers

```http
GET /api/crm/lifecycle/at-risk?limit=50
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "lifecycle_789",
      "userId": "user_101",
      "user": {
        "email": "customer@example.com",
        "name": "Jane Customer"
      },
      "healthScore": 25,
      "churnRiskScore": 80,
      "isAtRisk": true,
      "atRiskReasons": [
        "low_engagement",
        "no_contact_60_days"
      ],
      "daysSinceLastContact": 75,
      "assignedCSMId": "csm_456"
    }
  ],
  "meta": {
    "total": 12,
    "limit": 50,
    "offset": 0
  }
}
```

---

### Opportunities

#### Create Opportunity

```http
POST /api/crm/opportunities
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerLifecycleId": "lifecycle_123",
  "serviceRequestId": "service_request_456",
  "name": "Water Damage - 123 Smith St, Brisbane",
  "stage": "DISCOVERY",
  "estimatedValueAUD": 8500.00,
  "probabilityPercent": 60,
  "australianServiceType": "WATER_DAMAGE",
  "urgencyLevel": "HIGH",
  "serviceState": "QLD",
  "servicePostcode": "4000",
  "expectedCloseDate": "2025-12-31T00:00:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "opp_789",
    "customerLifecycleId": "lifecycle_123",
    "serviceRequestId": "service_request_456",
    "bookingId": null,
    "name": "Water Damage - 123 Smith St, Brisbane",
    "stage": "DISCOVERY",
    "estimatedValueAUD": 8500.00,
    "probabilityPercent": 60,
    "australianServiceType": "WATER_DAMAGE",
    "urgencyLevel": "HIGH",
    "serviceState": "QLD",
    "servicePostcode": "4000",
    "expectedCloseDate": "2025-12-31T00:00:00Z",
    "actualCloseDate": null,
    "assignedContractorId": null,
    "closeReason": null,
    "competitorChosen": null,
    "forecastCategory": "pipeline",
    "createdAt": "2025-12-29T10:30:00Z",
    "updatedAt": "2025-12-29T10:30:00Z"
  }
}
```

#### Update Opportunity Stage

```http
PATCH /api/crm/opportunities/:id/stage
Authorization: Bearer {token}
Content-Type: application/json

{
  "newStage": "PROPOSAL",
  "userId": "user_123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "opp_789",
    "stage": "PROPOSAL",
    "previousStage": "ASSESSMENT",
    "updatedAt": "2025-12-29T11:00:00Z"
  }
}
```

#### Close Opportunity (Won)

```http
POST /api/crm/opportunities/:id/close-won
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookingId": "booking_999"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "opp_789",
    "stage": "CLOSED_WON",
    "bookingId": "booking_999",
    "actualCloseDate": "2025-12-29T12:00:00Z"
  }
}
```

#### Close Opportunity (Lost)

```http
POST /api/crm/opportunities/:id/close-lost
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "price_too_high",
  "competitorChosen": "ServiceMaster"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "opp_789",
    "stage": "CLOSED_LOST",
    "closeReason": "price_too_high",
    "competitorChosen": "ServiceMaster",
    "actualCloseDate": "2025-12-29T12:00:00Z"
  }
}
```

#### Get Forecast

```http
GET /api/crm/opportunities/forecast?startDate=2025-12-01&endDate=2025-12-31
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-12-01",
      "endDate": "2025-12-31"
    },
    "summary": {
      "totalPipelineValue": 450000.00,
      "weightedPipelineValue": 225000.00,
      "totalOpportunities": 45,
      "expectedCloses": 18
    },
    "byStage": [
      {
        "stage": "DISCOVERY",
        "count": 15,
        "totalValue": 120000.00,
        "weightedValue": 36000.00
      },
      {
        "stage": "ASSESSMENT",
        "count": 12,
        "totalValue": 150000.00,
        "weightedValue": 75000.00
      },
      {
        "stage": "PROPOSAL",
        "count": 10,
        "totalValue": 100000.00,
        "weightedValue": 70000.00
      },
      {
        "stage": "NEGOTIATION",
        "count": 8,
        "totalValue": 80000.00,
        "weightedValue": 64000.00
      }
    ]
  }
}
```

---

### Activities

#### Create Activity

```http
POST /api/crm/activities
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerLifecycleId": "lifecycle_123",
  "opportunityId": "opp_789",
  "type": "CALL",
  "subject": "Follow-up call regarding water damage quote",
  "description": "Discussed timeline and pricing. Customer requested 10% discount.",
  "outcome": "Agreed to 5% discount. Customer will decide by Friday.",
  "performedById": "user_456",
  "customerId": "user_123",
  "activityDate": "2025-12-29T14:30:00Z",
  "durationMinutes": 15,
  "sentiment": "positive",
  "sentimentScore": 0.8,
  "requiresFollowUp": true,
  "followUpDate": "2025-12-30T10:00:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "activity_101",
    "customerLifecycleId": "lifecycle_123",
    "opportunityId": "opp_789",
    "bookingId": null,
    "claimId": null,
    "type": "CALL",
    "subject": "Follow-up call regarding water damage quote",
    "description": "Discussed timeline and pricing. Customer requested 10% discount.",
    "outcome": "Agreed to 5% discount. Customer will decide by Friday.",
    "performedById": "user_456",
    "customerId": "user_123",
    "contractorId": null,
    "activityDate": "2025-12-29T14:30:00Z",
    "durationMinutes": 15,
    "attachments": [],
    "sentiment": "positive",
    "sentimentScore": 0.8,
    "requiresFollowUp": true,
    "followUpDate": "2025-12-30T10:00:00Z",
    "followUpTaskId": "task_202",
    "createdAt": "2025-12-29T14:35:00Z",
    "updatedAt": "2025-12-29T14:35:00Z"
  }
}
```

#### Get Activities by Customer

```http
GET /api/crm/activities/customer/:customerId?limit=20
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "activity_101",
      "type": "CALL",
      "subject": "Follow-up call regarding water damage quote",
      "activityDate": "2025-12-29T14:30:00Z",
      "performedBy": {
        "id": "user_456",
        "name": "Sales Rep"
      },
      "sentiment": "positive"
    },
    {
      "id": "activity_100",
      "type": "EMAIL",
      "subject": "Initial quote sent",
      "activityDate": "2025-12-28T10:00:00Z",
      "performedBy": {
        "id": "user_456",
        "name": "Sales Rep"
      },
      "sentiment": "neutral"
    }
  ],
  "meta": {
    "total": 15,
    "limit": 20,
    "offset": 0
  }
}
```

---

### Tasks

#### Create Task

```http
POST /api/crm/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerLifecycleId": "lifecycle_123",
  "opportunityId": "opp_789",
  "title": "Follow up with customer on Friday",
  "description": "Customer needs to decide on 5% discount offer by end of week",
  "assignedToId": "user_456",
  "createdById": "user_456",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2025-12-30T17:00:00Z",
  "reminderDate": "2025-12-30T09:00:00Z",
  "relatedEntityType": "Opportunity",
  "relatedEntityId": "opp_789"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "task_202",
    "customerLifecycleId": "lifecycle_123",
    "opportunityId": "opp_789",
    "title": "Follow up with customer on Friday",
    "description": "Customer needs to decide on 5% discount offer by end of week",
    "assignedToId": "user_456",
    "createdById": "user_456",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2025-12-30T17:00:00Z",
    "completedAt": null,
    "reminderDate": "2025-12-30T09:00:00Z",
    "isOverdue": false,
    "relatedEntityType": "Opportunity",
    "relatedEntityId": "opp_789",
    "createdAt": "2025-12-29T14:35:00Z",
    "updatedAt": "2025-12-29T14:35:00Z"
  }
}
```

#### Get Tasks Assigned to User

```http
GET /api/crm/tasks/assigned/:userId?status=TODO,IN_PROGRESS
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "task_202",
      "title": "Follow up with customer on Friday",
      "status": "TODO",
      "priority": "HIGH",
      "dueDate": "2025-12-30T17:00:00Z",
      "isOverdue": false,
      "customer": {
        "id": "user_123",
        "name": "Jane Customer"
      },
      "opportunity": {
        "id": "opp_789",
        "name": "Water Damage - 123 Smith St"
      }
    }
  ],
  "meta": {
    "total": 8,
    "limit": 50,
    "offset": 0
  }
}
```

---

## Inspection Endpoints

### Inspection Reports

#### Create Inspection Report

```http
POST /api/inspection/reports
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookingId": "booking_999",
  "inspectorId": "user_456",
  "inspectionDate": "2025-12-29T10:00:00Z",
  "jurisdiction": "QLD",
  "insuranceClaimId": "claim_123",
  "scopeOfWork": "Water damage assessment for Category 2 water intrusion in residential property",
  "executiveSummary": "Significant water damage to ground floor areas due to burst pipe. Immediate extraction and drying required."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "report_555",
    "reportNumber": "NRPG-2025-0001",
    "bookingId": "booking_999",
    "insuranceClaimId": "claim_123",
    "inspectionDate": "2025-12-29T10:00:00Z",
    "inspectorId": "user_456",
    "jurisdiction": "QLD",
    "applicableCodes": [
      "QLD Building Code 2022",
      "National Construction Code (NCC) 2022",
      "Queensland Development Code",
      "AS/NZS 3500 Plumbing & Drainage"
    ],
    "iicrcStandards": [
      "WATER_DAMAGE_STANDARD",
      "WRT_WATER_RESTORATION"
    ],
    "status": "SCHEDULED",
    "isDraft": true,
    "version": 1,
    "executiveSummary": "Significant water damage to ground floor areas due to burst pipe. Immediate extraction and drying required.",
    "scopeOfWork": "Water damage assessment for Category 2 water intrusion in residential property",
    "findings": "",
    "recommendations": "",
    "createdBy": "user_456",
    "createdAt": "2025-12-29T10:30:00Z",
    "updatedAt": "2025-12-29T10:30:00Z"
  }
}
```

#### Add Damage Area

```http
POST /api/inspection/reports/:reportId/damage-areas
Authorization: Bearer {token}
Content-Type: application/json

{
  "areaName": "Master Bedroom",
  "floor": "Ground Floor",
  "roomType": "Bedroom",
  "damageCategory": "CATEGORY_2",
  "affectedArea": 25.5,
  "affectedMaterials": ["Carpet", "Drywall", "Baseboards"],
  "initialMoistureLevel": 45.2,
  "targetMoistureLevel": 12.0,
  "description": "Water damage from burst pipe in adjacent bathroom. Carpet saturated, drywall moisture at base.",
  "severity": "Moderate",
  "requiredActions": [
    "Remove and dispose of carpet",
    "Extract water from affected areas",
    "Set up drying equipment (air movers, dehumidifiers)",
    "Monitor moisture levels daily"
  ],
  "equipmentNeeded": [
    "Air mover x3",
    "Commercial dehumidifier x1",
    "Moisture meter"
  ],
  "estimatedDryingTime": 72
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "area_777",
    "reportId": "report_555",
    "areaName": "Master Bedroom",
    "floor": "Ground Floor",
    "roomType": "Bedroom",
    "damageCategory": "CATEGORY_2",
    "affectedArea": 25.5,
    "affectedMaterials": ["Carpet", "Drywall", "Baseboards"],
    "initialMoistureLevel": 45.2,
    "targetMoistureLevel": 12.0,
    "description": "Water damage from burst pipe in adjacent bathroom. Carpet saturated, drywall moisture at base.",
    "severity": "Moderate",
    "requiredActions": [
      "Remove and dispose of carpet",
      "Extract water from affected areas",
      "Set up drying equipment (air movers, dehumidifiers)",
      "Monitor moisture levels daily"
    ],
    "equipmentNeeded": [
      "Air mover x3",
      "Commercial dehumidifier x1",
      "Moisture meter"
    ],
    "estimatedDryingTime": 72,
    "estimatedCost": null,
    "createdAt": "2025-12-29T11:00:00Z",
    "updatedAt": "2025-12-29T11:00:00Z"
  }
}
```

#### Add Moisture Reading

```http
POST /api/inspection/reports/:reportId/moisture-readings
Authorization: Bearer {token}
Content-Type: application/json

{
  "readingDate": "2025-12-29T11:30:00Z",
  "location": "Master Bedroom - North Wall",
  "material": "Drywall",
  "moistureContent": 45.2,
  "ambientTemperature": 22.5,
  "ambientHumidity": 68.0,
  "meterType": "Pin-type",
  "readingDepth": "12mm",
  "notes": "Elevated moisture behind baseboards"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "reading_888",
    "reportId": "report_555",
    "readingDate": "2025-12-29T11:30:00Z",
    "location": "Master Bedroom - North Wall",
    "material": "Drywall",
    "moistureContent": 45.2,
    "ambientTemperature": 22.5,
    "ambientHumidity": 68.0,
    "meterType": "Pin-type",
    "readingDepth": "12mm",
    "latitude": null,
    "longitude": null,
    "notes": "Elevated moisture behind baseboards",
    "createdAt": "2025-12-29T11:35:00Z"
  }
}
```

#### Generate Cost Estimate

```http
POST /api/inspection/reports/:reportId/cost-estimate
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "estimate_999",
    "reportId": "report_555",
    "totalLaborHours": 24.0,
    "totalLaborCost": 2280.00,
    "totalMaterialCost": 850.00,
    "totalEquipmentCost": 420.00,
    "subtotal": 3550.00,
    "contingencyPercent": 10,
    "contingencyAmount": 355.00,
    "gst": 390.50,
    "totalCost": 4295.50,
    "jurisdiction": "QLD",
    "pricingSource": "NRPG_2025_Q1_RATES",
    "pricingDate": "2025-12-29T12:00:00Z",
    "assumptions": "All materials available locally. Standard working hours. No asbestos present.",
    "exclusions": "Structural repairs, electrical work, plumbing repairs",
    "validityPeriod": 30,
    "laborLineItems": [
      {
        "description": "Water extraction - CATEGORY_2",
        "taskCode": "WE-CATEGORY_2",
        "iicrcLevel": "WRT",
        "hours": 4.0,
        "hourlyRate": 95.00,
        "subtotal": 380.00
      },
      {
        "description": "Structural drying - Master Bedroom",
        "taskCode": "SD-TECH",
        "iicrcLevel": "WRT",
        "hours": 20.0,
        "hourlyRate": 95.00,
        "subtotal": 1900.00
      }
    ],
    "materialLineItems": [
      {
        "description": "Antimicrobial treatment - 20L",
        "materialCode": "AM-20L",
        "quantity": 2.0,
        "unit": "each",
        "unitPrice": 125.00,
        "subtotal": 250.00
      }
    ],
    "equipmentLineItems": [
      {
        "description": "Air mover - 3 days",
        "equipmentCode": "AIR-MOVER",
        "quantity": 3,
        "rentalDays": 3,
        "dailyRate": 35.00,
        "subtotal": 315.00
      }
    ]
  }
}
```

#### Run Compliance Validation

```http
POST /api/inspection/reports/:reportId/compliance
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "complianceStatus": "COMPLIANT",
    "checks": [
      {
        "checkName": "QLD Building Code 2022 - Water Damage Response",
        "checkCode": "QLD-BC-2022-4.2",
        "jurisdiction": "QLD",
        "status": "PASS",
        "required": true,
        "evidence": "Category 2 water damage areas identified: 1",
        "referenceSection": "Section 4.2 - Water Damage Management"
      },
      {
        "checkName": "NCC 2022 - Moisture Control Standards",
        "checkCode": "NCC-2022-3.8.6",
        "jurisdiction": "QLD",
        "status": "PASS",
        "required": true,
        "evidence": "Moisture control measures outlined in remediation plan",
        "referenceSection": "Volume 2, Section 3.8.6"
      }
    ],
    "totalChecks": 2,
    "passed": 2,
    "failed": 0
  }
}
```

#### Generate PDF Report

```http
POST /api/inspection/reports/:reportId/pdf
Authorization: Bearer {token}
Content-Type: application/json

{
  "templateType": "STANDARD"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "pdfUrl": "https://storage.disaster-recovery-nrpg.com/reports/NRPG-2025-0001_v1.pdf",
    "pdfVersion": 1,
    "generatedAt": "2025-12-29T15:00:00Z",
    "report": {
      "id": "report_555",
      "reportNumber": "NRPG-2025-0001",
      "status": "DRAFT_GENERATED"
    }
  }
}
```

#### Transition Report Status

```http
PATCH /api/inspection/reports/:reportId/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "newStatus": "TECHNICAL_REVIEW",
  "userId": "user_789",
  "userRole": "TECHNICAL_REVIEWER",
  "notes": "All IICRC standards met. Cost estimate reasonable for scope."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "reportId": "report_555",
    "oldStatus": "DRAFT_GENERATED",
    "newStatus": "TECHNICAL_REVIEW",
    "technicalReviewerId": "user_789",
    "technicalReviewDate": "2025-12-29T16:00:00Z",
    "technicalReviewNotes": "All IICRC standards met. Cost estimate reasonable for scope."
  }
}
```

---

## Agent Endpoints

### Agent Pipeline Execution

#### Trigger Agent Pipeline

```http
POST /api/agents/pipeline/execute
Authorization: Bearer {token}
Content-Type: application/json

{
  "reportId": "report_555",
  "startFromStage": "DATA_INTAKE"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "pipelineId": "pipeline_101",
    "reportId": "report_555",
    "status": "IN_PROGRESS",
    "currentStage": "DATA_INTAKE",
    "startedAt": "2025-12-29T17:00:00Z",
    "agents": [
      "DataIntakeAgent",
      "ReportGenerationAgent",
      "QAReviewAgent",
      "OperationsAgent",
      "CEOOversightAgent"
    ]
  }
}
```

#### Get Pipeline Status

```http
GET /api/agents/pipeline/:pipelineId/status
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "pipelineId": "pipeline_101",
    "reportId": "report_555",
    "status": "COMPLETED",
    "currentStage": "APPROVED",
    "startedAt": "2025-12-29T17:00:00Z",
    "completedAt": "2025-12-29T17:15:00Z",
    "executionTime": 900,
    "stages": [
      {
        "agent": "DataIntakeAgent",
        "stage": "DATA_INTAKE",
        "status": "COMPLETED",
        "result": "PASS",
        "startedAt": "2025-12-29T17:00:00Z",
        "completedAt": "2025-12-29T17:02:00Z"
      },
      {
        "agent": "ReportGenerationAgent",
        "stage": "REPORT_GENERATION",
        "status": "COMPLETED",
        "result": "PASS",
        "startedAt": "2025-12-29T17:02:00Z",
        "completedAt": "2025-12-29T17:08:00Z"
      },
      {
        "agent": "QAReviewAgent",
        "stage": "QA_REVIEW",
        "status": "COMPLETED",
        "result": "PASS",
        "startedAt": "2025-12-29T17:08:00Z",
        "completedAt": "2025-12-29T17:11:00Z"
      },
      {
        "agent": "OperationsAgent",
        "stage": "OPERATIONS",
        "status": "COMPLETED",
        "result": "PASS",
        "startedAt": "2025-12-29T17:11:00Z",
        "completedAt": "2025-12-29T17:13:00Z"
      },
      {
        "agent": "CEOOversightAgent",
        "stage": "CEO_OVERSIGHT",
        "status": "COMPLETED",
        "result": "APPROVED",
        "startedAt": "2025-12-29T17:13:00Z",
        "completedAt": "2025-12-29T17:15:00Z"
      }
    ]
  }
}
```

#### Get Agent Execution Logs

```http
GET /api/agents/executions/:reportId
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "exec_201",
      "reportId": "report_555",
      "agentName": "DataIntakeAgent",
      "stage": "DATA_INTAKE",
      "status": "COMPLETED",
      "startedAt": "2025-12-29T17:00:00Z",
      "completedAt": "2025-12-29T17:02:00Z",
      "result": {
        "validationStatus": "PASS",
        "errors": [],
        "warnings": [],
        "dataGaps": []
      },
      "error": null
    }
  ]
}
```

---

## Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed: Missing required field 'jurisdiction'",
    "details": {
      "field": "jurisdiction",
      "constraint": "required"
    },
    "timestamp": "2025-12-29T17:00:00Z",
    "requestId": "req_12345"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | User lacks permission for this operation |
| `NOT_FOUND` | 404 | Requested resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `BUSINESS_RULE_VIOLATION` | 422 | Business rule constraint violated |
| `COMPLIANCE_FAILURE` | 422 | Compliance check failed |
| `AGENT_EXECUTION_FAILED` | 500 | Agent pipeline execution error |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

### Example Error Responses

**Unauthorized**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired authentication token",
    "timestamp": "2025-12-29T17:00:00Z",
    "requestId": "req_12345"
  }
}
```

**Validation Error**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "errors": [
        {
          "field": "estimatedValueAUD",
          "message": "Must be a positive number"
        },
        {
          "field": "jurisdiction",
          "message": "Must be one of: QLD, NSW, VIC, WA, SA, TAS, ACT, NT"
        }
      ]
    },
    "timestamp": "2025-12-29T17:00:00Z",
    "requestId": "req_12346"
  }
}
```

**Not Found**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Inspection report not found: report_999",
    "timestamp": "2025-12-29T17:00:00Z",
    "requestId": "req_12347"
  }
}
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour

Rate limit headers included in all responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1672329600
```

---

## Pagination

List endpoints support pagination using `limit` and `offset` parameters:

```http
GET /api/crm/opportunities?limit=20&offset=40
```

Response includes pagination metadata:

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 150,
    "limit": 20,
    "offset": 40,
    "hasMore": true
  }
}
```

---

## Webhooks

Subscribe to events using webhooks:

```http
POST /api/webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/disaster-recovery",
  "events": [
    "report.created",
    "report.approved",
    "opportunity.closed_won",
    "customer.at_risk"
  ],
  "secret": "your_webhook_secret"
}
```

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-29
**Maintained By**: Disaster Recovery NRPG Platform Team
