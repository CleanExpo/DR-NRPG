# Inspection Reports API - Quick Start Guide

**Quick reference for developers working with Inspection Reports API**

---

## Installation & Setup

```bash
# No additional installation needed - uses existing Prisma/Next.js setup
npm install  # Ensure dependencies are installed
```

---

## Common Workflows

### 1. Create Inspection Report

```typescript
// POST /api/inspection-reports
const response = await fetch('/api/inspection-reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bookingId: 'booking_123',
    propertyId: 'prop_456',
    inspectorId: 'user_inspector_001',
    inspectionDate: '2025-12-30T09:00:00Z',
    jurisdiction: 'NSW',
    iicrcStandards: ['WATER_DAMAGE_STANDARD', 'WRT_WATER_RESTORATION'],
    scopeOfWork: 'Water damage assessment',
    applicableCodes: ['NCC 2022']
  })
});

const { data } = await response.json();
console.log('Report Number:', data.reportNumber);  // NRPG-2025-0042
```

### 2. Get Report Details

```typescript
// GET /api/inspection-reports/{id}
const response = await fetch(`/api/inspection-reports/${reportId}`);
const { data: report } = await response.json();

// Access all relations
console.log('Damage Areas:', report.damageAreas.length);
console.log('Photos:', report.photos.length);
console.log('Cost Estimate:', report.costEstimate?.totalAmount);
```

### 3. Transition Status (Complete Workflow)

```typescript
// Step 1: Start inspection
await fetch(`/api/inspection-reports/${reportId}/transition`, {
  method: 'POST',
  body: JSON.stringify({
    toStatus: 'IN_PROGRESS',
    userId: 'user_inspector_001',
    userRole: 'INSPECTOR',
    notes: 'Starting on-site inspection'
  })
});

// Step 2: Complete data collection
await fetch(`/api/inspection-reports/${reportId}/transition`, {
  method: 'POST',
  body: JSON.stringify({
    toStatus: 'DATA_COLLECTION_COMPLETE',
    userId: 'user_inspector_001',
    userRole: 'INSPECTOR'
  })
});

// Step 3: Generate draft
await fetch(`/api/inspection-reports/${reportId}/transition`, {
  method: 'POST',
  body: JSON.stringify({
    toStatus: 'DRAFT_GENERATED',
    userId: 'user_inspector_001',
    userRole: 'INSPECTOR'
  })
});

// Step 4: Technical review
await fetch(`/api/inspection-reports/${reportId}/transition`, {
  method: 'POST',
  body: JSON.stringify({
    toStatus: 'TECHNICAL_REVIEW',
    userId: 'user_reviewer_001',
    userRole: 'TECHNICAL_REVIEWER',
    notes: 'Reviewing compliance with industry standards'
  })
});

// Step 5: Manager approval
await fetch(`/api/inspection-reports/${reportId}/transition`, {
  method: 'POST',
  body: JSON.stringify({
    toStatus: 'MANAGER_REVIEW',
    userId: 'user_manager_001',
    userRole: 'MANAGER'
  })
});

// Step 6: Final approval
await fetch(`/api/inspection-reports/${reportId}/transition`, {
  method: 'POST',
  body: JSON.stringify({
    toStatus: 'APPROVED',
    userId: 'user_manager_001',
    userRole: 'MANAGER',
    notes: 'Approved for client delivery'
  })
});
```

### 4. Generate PDF

```typescript
// POST /api/inspection-reports/{id}/pdf
const response = await fetch(`/api/inspection-reports/${reportId}/pdf`, {
  method: 'POST',
  body: JSON.stringify({
    templateType: 'INSURANCE',  // or 'STANDARD', 'CLIENT'
    includePhotos: true,
    includeCostEstimate: true
  })
});

const { data } = await response.json();
console.log('PDF URL:', data.pdfUrl);
```

### 5. Run Compliance Validation

```typescript
// POST /api/inspection-reports/{id}/compliance
const response = await fetch(`/api/inspection-reports/${reportId}/compliance`, {
  method: 'POST'
});

const { data: validation } = await response.json();

console.log('Overall Status:', validation.overallStatus);
console.log('Compliance Score:', validation.complianceScore, '%');
console.log('Critical Issues:', validation.criticalIssues);

// Show non-compliant items
validation.checks
  .filter(check => check.status === 'NON_COMPLIANT')
  .forEach(check => {
    console.log(`❌ ${check.requirement}: ${check.details}`);
  });
```

### 6. List Reports with Filters

```typescript
// GET /api/inspection-reports?status=DRAFT_GENERATED&jurisdiction=NSW
const response = await fetch(
  '/api/inspection-reports?' + new URLSearchParams({
    status: 'DRAFT_GENERATED',
    jurisdiction: 'NSW',
    page: '1',
    limit: '20'
  })
);

const { data } = await response.json();
console.log('Total Reports:', data.pagination.totalCount);
data.reports.forEach(report => {
  console.log(`${report.reportNumber}: ${report.status}`);
});
```

---

## Status Flow Diagram

```
SCHEDULED
    ↓ (Inspector starts)
IN_PROGRESS
    ↓ (Data collection complete)
DATA_COLLECTION_COMPLETE
    ↓ (Report drafted)
DRAFT_GENERATED
    ↓ (Technical reviewer)
TECHNICAL_REVIEW
    ↓ (Manager review)
MANAGER_REVIEW
    ↓ (Manager approval)
APPROVED
    ↓ (Delivery)
SENT_TO_CLIENT / SENT_TO_INSURER

Any status → REVISED (revisions needed)
Any status → CANCELLED (Manager/Admin only)
```

---

## Required Roles for Transitions

| Status | Required Role |
|--------|--------------|
| SCHEDULED | INSPECTOR, ADMIN |
| IN_PROGRESS | INSPECTOR, ADMIN |
| DATA_COLLECTION_COMPLETE | INSPECTOR, ADMIN |
| DRAFT_GENERATED | INSPECTOR, ADMIN |
| TECHNICAL_REVIEW | TECHNICAL_REVIEWER, ADMIN |
| MANAGER_REVIEW | MANAGER, ADMIN |
| APPROVED | MANAGER, ADMIN |
| SENT_TO_CLIENT | MANAGER, ADMIN |
| SENT_TO_INSURER | MANAGER, ADMIN |
| REVISED | INSPECTOR, TECHNICAL_REVIEWER, MANAGER, ADMIN |
| CANCELLED | MANAGER, ADMIN |

---

## Australian Jurisdictions

Valid values for `jurisdiction` field:
- `NSW` - New South Wales
- `VIC` - Victoria
- `QLD` - Queensland
- `WA` - Western Australia
- `SA` - South Australia
- `TAS` - Tasmania
- `ACT` - Australian Capital Territory
- `NT` - Northern Territory

---

## Industry Standards

Available standards (enum values):
- `WATER_DAMAGE_STANDARD` - Water damage restoration
- `MOULD_STANDARD` - Mold remediation
- `BIOHAZARD_STANDARD` - Trauma and crime scene cleanup
- `WRT_WATER_RESTORATION` - Water Restoration Technician
- `AMRT_APPLIED_MICROBIAL` - Applied Microbial Remediation
- `FSRT_FIRE_SMOKE` - Fire & Smoke Restoration

---

## Error Handling

```typescript
try {
  const response = await fetch(`/api/inspection-reports/${id}/transition`, {
    method: 'POST',
    body: JSON.stringify({
      toStatus: 'APPROVED',
      userId: 'user_123',
      userRole: 'INSPECTOR'
    })
  });

  const result = await response.json();

  if (!result.success) {
    if (response.status === 400) {
      console.error('Invalid transition:', result.details);
      // Show user: result.details.allowedStatuses
    } else if (response.status === 403) {
      console.error('Permission denied:', result.details);
      // Show user: result.details.requiredRole
    } else {
      console.error('Error:', result.error);
    }
  }
} catch (error) {
  console.error('Network error:', error);
}
```

---

## Compliance Check Categories

When running compliance validation, checks are grouped by:

1. **Jurisdiction Requirements**
   - Executive summary
   - Minimum photos
   - Moisture readings

2. **Industry Standards**
   - Required documentation
   - Safety protocols

3. **Data Quality**
   - Damage areas
   - Scope of work
   - Findings
   - Recommendations

4. **Cost Estimate**
   - Estimate completeness
   - Line items

---

## PDF Template Types

| Type | Use Case |
|------|----------|
| `STANDARD` | Internal use, full detail |
| `INSURANCE` | Insurance company submission |
| `CLIENT` | Client-friendly format |

---

## Common Pitfalls

### 1. Invalid Status Transition
```typescript
// ❌ DON'T: Skip steps
await transition(reportId, 'SCHEDULED' → 'APPROVED');  // Will fail

// ✅ DO: Follow workflow
await transition(reportId, 'SCHEDULED' → 'IN_PROGRESS');
await transition(reportId, 'IN_PROGRESS' → 'DATA_COLLECTION_COMPLETE');
// ... continue through workflow
```

### 2. Wrong Role for Transition
```typescript
// ❌ DON'T: Use inspector role for approval
await transition(reportId, 'MANAGER_REVIEW' → 'APPROVED', {
  userRole: 'INSPECTOR'  // Will fail with 403
});

// ✅ DO: Use manager role
await transition(reportId, 'MANAGER_REVIEW' → 'APPROVED', {
  userRole: 'MANAGER'  // Success
});
```

### 3. Generating PDF Too Early
```typescript
// ❌ DON'T: Generate PDF before draft
await generatePDF(reportId);  // Fails if status is SCHEDULED

// ✅ DO: Generate PDF after draft
await transition(reportId, ... → 'DRAFT_GENERATED');
await generatePDF(reportId);  // Success
```

---

## Testing

### Example Test Cases

```typescript
describe('Inspection Reports API', () => {
  test('should create report with auto-generated number', async () => {
    const report = await createReport({ bookingId: '...' });
    expect(report.reportNumber).toMatch(/NRPG-\d{4}-\d{4}/);
  });

  test('should prevent invalid status transition', async () => {
    const response = await transition(reportId, 'SCHEDULED', 'APPROVED');
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Cannot transition');
  });

  test('should calculate compliance score', async () => {
    const validation = await runCompliance(reportId);
    expect(validation.complianceScore).toBeGreaterThanOrEqual(0);
    expect(validation.complianceScore).toBeLessThanOrEqual(100);
  });
});
```

---

## Performance Tips

1. **Use pagination** for list endpoints
2. **Filter early** - use query params instead of client-side filtering
3. **Include only needed relations** when fetching report details
4. **Cache PDF URLs** - check `isOutdated` before regenerating
5. **Run compliance checks** only when report changes

---

## Next Steps

1. Review full documentation: `docs/API_ROUTES_INSPECTION_REPORTS.md`
2. Check Prisma schema: `prisma/schema.prisma` (InspectionReport model)
3. Explore services:
   - `src/services/inspection/jurisdiction-rules.service.ts`
   - `src/services/inspection/iicrc-standards.service.ts`

---

**Questions?** Check the full API documentation or contact the platform team.
