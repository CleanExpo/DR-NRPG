# Stage 5: AI Workflow Testing - Insurance Knowledge Integration

**Document Purpose**: Test scenarios and validation for enhanced AI workflows with insurance standards integration

**Date**: January 2026
**Status**: Testing Phase
**Workflows Tested**: Claim Processing, Contractor Matching, Customer Support

---

## OVERVIEW: ENHANCEMENTS IMPLEMENTED

### 1. Claim Processing Workflow Enhancements
**File**: `lib/agents/workflows/claim-processing.ts`

**Changes**:
- ✅ Minimal system prompt (Snake Build Pattern) referencing insurance standards skill
- ✅ Auto-detection of insurer from policy number format
- ✅ Insurer-specific documentation requirements
- ✅ Code of Practice timeframes (3/10/20/30/120 day rules)
- ✅ AFCA escalation rights in guidance
- ✅ Consumer rights information in final output

**New System Prompt**:
```
"You are an insurance claim specialist for Australian disaster recovery.
Use Australian English. Reference /australian-insurance-standards skill for coverage rules.
Reference /iicrc-validator for checking content does not name standards by number or title.
Reference /australian-business-validator for pricing and compliance.
Return structured JSON responses only."
```

**New Validation Features**:
- Policy number format detection (NRMA vs Suncorp vs Allianz patterns)
- Code of Practice timeline validation
- Insurer-specific photo requirements (NRMA 2+, Suncorp 3+)
- Returns `detectedInsurer` and `codesOfPracticeNotes`

**Enhanced Guidance Output**:
- "Consumer Rights" field with AFCA escalation info
- "Expect initial response within 10 business days (Insurance Code of Practice)"
- AFCA contact: 1800 931 678

---

### 2. Contractor Matching Workflow Enhancements
**File**: `lib/agents/workflows/contractor-matching.ts`

**Changes**:
- ✅ Database queries now include insurance verification data
- ✅ Public Liability $10M verification checks
- ✅ Insurance training completion status tracking
- ✅ Certificate expiry validation
- ✅ Eligibility flag for insurance-backed work
- ✅ Enhanced scoring with insurance requirements

**New Data Fields Added to Contractor Details**:
```typescript
hasValid10mPL: boolean              // $10M PL verified and not expired
publicLiabilityAmount: string       // "$10,000,000" or amount claimed
publicLiabilityCertExpiry: Date     // Certificate expiry date
insuranceTrainingCompleted: boolean // Module 1-4 all passed
trainingCertificateValid: boolean   // Certificate not expired
trainingCertificateExpiry: Date     // 365 days from completion
certificateLevel: string            // "SILVER" | "GOLD" | "PLATINUM" | "NONE"
```

**Enhanced Scoring Criteria** (Total 100 points):
- Service match: 30 points
- IICRC Certification: 15 points
- Rating & Track Record: 15 points
- Response Time: 10 points
- **Insurance Training (NEW)**: 15 points (Completed & Valid = 15, Expired = 5, Not Done = 0)
- **Public Liability $10M (NEW)**: 10 points (Verified & Valid = 10, Expired = 3, Not Verified = 0)
- Urgency Match: 5 points

**Eligibility Logic**:
```
For INSURANCE-BACKED WORK:
- Insurance Training MUST be Completed AND Valid (not expired)
- Public Liability MUST be $10M+ AND Verified AND Not Expired
- Contractors missing either are INELIGIBLE for insurance work
```

---

### 3. Customer Support Workflow Enhancements
**File**: `lib/agents/workflows/customer-support.ts`

**Changes**:
- ✅ System prompt references `/australian-insurance-standards` skill
- ✅ Intent detection includes insurance-specific intents
- ✅ Knowledge search adapted for insurance queries
- ✅ Response generation includes consumer rights
- ✅ Escalation logic for coverage disputes and AFCA
- ✅ Code of Practice compliance references

**New Insurance-Specific Intent Categories**:
- `insurance_coverage_question` - Queries about what's covered
- `insurance_rights_question` - Queries about consumer rights, AFCA
- `policy_exclusion_question` - Queries about what's NOT covered

**Enhanced Knowledge Search for Insurance Queries**:
- Mandatory vs optional coverage information
- Code of Practice timeframes
- Consumer rights (AFCA, cooling-off period, exclusions)
- Insurer-specific information

**Escalation Triggers for Insurance Queries**:
- Coverage disputes → ESCALATE
- Claims not progressing per Code of Practice timelines → ESCALATE
- AFCA complaint discussion → ESCALATE (Critical)
- Complex consumer rights questions → May escalate

---

## TEST SCENARIOS

### TEST SET 1: CLAIM PROCESSING WORKFLOW

#### Test 1.1: Auto-Detect Insurer from Policy Number
**Objective**: Verify auto-detection of insurer from policy number format

**Input**:
```json
{
  "claim": {
    "insurerName": "UNKNOWN",
    "policyNumber": "13456789",
    "incidentDate": "2026-01-05",
    "damageDescription": "Water damage from burst pipe affecting bathroom, 3 sqm area, visible water stains on drywall",
    "estimatedValue": 3500,
    "documentUrls": ["photo1.jpg", "photo2.jpg"]
  }
}
```

**Expected Output**:
- `detectedInsurer`: "NRMA" (policy starts with 13)
- `validationStatus`: "valid" (if other fields meet requirements)
- `codesOfPracticeNotes`: "3-day acknowledgment, 10-day response timeline applies"
- `documentChecklist` includes "NRMA: minimum 2+ incident photos"

**Success Criteria**:
✓ Insurer correctly auto-detected
✓ NRMA-specific photo requirement (2+) identified
✓ Code of Practice timeline included in guidance

---

#### Test 1.2: Code of Practice Timeline Guidance
**Objective**: Verify Code of Practice timelines are referenced

**Input**: Water damage claim with valid details

**Expected Output**:
- Mentions "Expect initial response within 10 business days (Insurance Code of Practice)"
- References "3-day acknowledgment" expectation
- Includes "Provide regular updates every 20 days minimum during assessment"
- Mentions "4-month decision timeframe" as standard

**Success Criteria**:
✓ All Code of Practice timeframes mentioned
✓ Realistic expectations set
✓ Progress update frequency explained

---

#### Test 1.3: AFCA Rights Included in Guidance
**Objective**: Verify consumer rights are communicated

**Input**: Valid claim details

**Expected Output**:
- Response includes AFCA contact information (1800 931 678)
- Mentions "AFCA escalation available after 30 days if unresolved"
- References "Cooling-off period: 14-21 days"
- Includes "right to request written explanation"

**Success Criteria**:
✓ AFCA contact info provided
✓ 30-day escalation trigger mentioned
✓ Consumer rights clearly explained

---

#### Test 1.4: Flood Coverage Detection (Suncorp vs NRMA)
**Objective**: Verify coverage gap detection for flood claims

**Input**:
```json
{
  "claim": {
    "insurerName": "SUNCORP",
    "policyNumber": "SC1234567",
    "damageDescription": "Rising water from nearby creek overflow, 5 sqm affected",
    "documentUrls": ["photo1.jpg", "photo2.jpg", "photo3.jpg"]
  }
}
```

**Expected Output**:
- Documentation prompt includes Suncorp requirement: "3+ photos per damage area"
- `exclusionsToWatch` mentions "Flood damage may be excluded - verify policy includes optional flood cover"
- Guidance notes whether this is "storm damage" (covered) vs "flood damage" (optional)

**Success Criteria**:
✓ Flood cover optionality mentioned
✓ Suncorp's 3+ photo requirement identified
✓ Coverage uncertainty flagged for clarification

---

### TEST SET 2: CONTRACTOR MATCHING WORKFLOW

#### Test 2.1: Insurance Training Verification
**Objective**: Verify contractors without insurance training are flagged

**Input**:
```json
{
  "criteria": {
    "serviceType": "water_restoration",
    "location": { "suburb": "Southbank", "state": "VIC", "postcode": "3006" },
    "urgency": "high",
    "insuranceBackedWork": true
  }
}
```

**Mock Contractor Data**:
- Contractor A: Insurance Training COMPLETED, PL $10M Verified ✓
- Contractor B: Insurance Training EXPIRED (cert expired 2025-12-01) ✗
- Contractor C: Insurance Training NOT COMPLETED ✗
- Contractor D: Insurance Training Valid, PL NOT VERIFIED ✗

**Expected Scoring**:
- Contractor A: 90/100, Eligible for insurance work ✓
- Contractor B: 70/100, NOT eligible (training expired)
- Contractor C: 60/100, NOT eligible (training incomplete)
- Contractor D: 75/100, NOT eligible (PL not verified)

**Success Criteria**:
✓ Training completion status correctly identified
✓ Expiry dates validated
✓ Eligibility correctly determined
✓ Insurance-ineligible contractors flagged despite high scores

---

#### Test 2.2: $10M Public Liability Verification
**Objective**: Verify $10M+ public liability validation

**Input**: Same as Test 2.1, insurance-backed work required

**Mock Data**:
- Contractor A: PL Amount "$10,000,000", Verified ✓, Expiry 2026-06-15 ✓
- Contractor B: PL Amount "$5,000,000" (insufficient) ✗
- Contractor C: PL Amount "$10,000,000", NOT Verified ✗
- Contractor D: PL Amount "$10,000,000", Verified ✓, Expiry 2024-12-31 (expired) ✗

**Expected Behavior**:
- Contractor A: 10 points for PL requirement
- Contractor B-D: 0-3 points for PL requirement
- Final message: "NOT ELIGIBLE for insurance work (insurance requirement)"

**Success Criteria**:
✓ $10M minimum enforced
✓ Verification status checked
✓ Certificate expiry validated
✓ Insurance-ineligible contractors identified

---

#### Test 2.3: Insurance Eligibility Filtering
**Objective**: Verify insurance-ineligible contractors excluded for insurance work

**Input**:
- 10 contractors available
- 6 have valid insurance training + $10M PL
- 4 missing one or both requirements
- Insurance-backed work required

**Expected Output**:
- Top recommendation from insured contractors only
- Recommendations note: "ELIGIBLE for insurance-backed work"
- Non-eligible contractors noted: "NOT ELIGIBLE for insurance-backed work (insurance training or $10M PL missing/expired)"
- Alternative recommendation for cash jobs includes non-eligible contractors

**Success Criteria**:
✓ Only insured contractors recommended for insurance work
✓ Reason for ineligibility clearly stated
✓ Non-insured contractors still available for other work

---

### TEST SET 3: CUSTOMER SUPPORT WORKFLOW

#### Test 3.1: Insurance Query Recognition
**Objective**: Verify insurance-related queries are correctly identified

**Input Queries**:
1. "Is my water damage covered by my policy?" → `insurance_coverage_question`
2. "The insurer hasn't responded in 3 weeks" → `insurance_rights_question`
3. "Why isn't my damaged furniture covered?" → `policy_exclusion_question`
4. "Can I escalate to AFCA?" → `insurance_rights_question`
5. "How do I claim?" → `claim_status` (platform, not insurance-specific)

**Expected Output**:
- Query 1-4: `category: "insurance_query"` with specific intent
- Knowledge search references `/australian-insurance-standards`
- Query 5: `category: "general"` with platform-specific guidance

**Success Criteria**:
✓ Insurance queries correctly identified
✓ Non-insurance queries routed to platform knowledge
✓ Specific insurance intents captured

---

#### Test 3.2: Code of Practice Timeline Response
**Objective**: Verify responses include Code of Practice timelines

**Input Query**: "It's been 15 days and the insurer hasn't responded. Is that normal?"

**Expected Response Components**:
- Acknowledges customer's concern (empathy)
- References Code of Practice: "Insurers are required to provide an initial response within 10 business days"
- Explains: "At 15 days, if you haven't received a substantive response, you can request a status update"
- Mentions: "You're entitled to a progress update every 20 days minimum during assessment"
- Provides AFCA option: "If still unresolved after 30 days, you can escalate to AFCA"

**Success Criteria**:
✓ Code of Practice timeline mentioned
✓ Customer's concern validated
✓ Actionable next steps provided
✓ Consumer rights empowered

---

#### Test 3.3: AFCA Escalation Trigger
**Objective**: Verify AFCA-related queries trigger escalation

**Input Query**: "I want to lodge an AFCA complaint because my claim was rejected unfairly"

**Expected Output**:
- `sentiment`: "negative" (complaint)
- `escalationRequired`: true
- `escalationReason`: "Insurance coverage dispute requiring AFCA discussion (critical)"
- `urgency`: "high" or "critical"
- Response includes: "I'm escalating your case to our specialist team who can help guide you through the AFCA process"

**Success Criteria**:
✓ AFCA complaint correctly identified as critical
✓ Escalation triggered immediately
✓ Human specialist assigned
✓ Professional reassurance provided

---

#### Test 3.4: Coverage Dispute Response with Rights
**Objective**: Verify coverage disputes include consumer rights

**Input Query**: "The insurer says my flood damage isn't covered, but I thought I had full coverage. What can I do?"

**Expected Response Components**:
- Acknowledges frustration (empathy)
- References `/australian-insurance-standards`: "Flood cover is optional for most insurers—many policies don't include it automatically"
- Explains steps:
  1. Request written explanation from insurer
  2. Review your policy documents
  3. Ask insurer to cite specific policy section
- Provides escalation option: "If you disagree with their decision, you can escalate to AFCA at 1800 931 678 or afca.org.au"
- Mentions cooling-off period if relevant

**Success Criteria**:
✓ Flood cover optionality explained
✓ Step-by-step guidance provided
✓ AFCA information included
✓ Consumer rights emphasized
✓ Empathetic tone throughout

---

#### Test 3.5: Escalation for Unresponsive Insurer
**Objective**: Verify Code of Practice violations trigger escalation

**Input Query**: "It's been 35 days with no response from my insurer, multiple follow-ups made"

**Expected Output**:
- `sentiment`: "urgent" or "negative"
- `escalationRequired`: true
- `escalationReason`: "Claims not progressing per Code of Practice timelines (critical)"
- `urgency`: "critical"

**Response Includes**:
- "This is a violation of the Insurance Code of Practice which requires responses within 10 business days"
- "You have the right to escalate to AFCA without waiting any longer"
- "I'm escalating your case to our team to provide AFCA support"
- Contact: "AFCA: 1800 931 678 or afca.org.au"

**Success Criteria**:
✓ Code of Practice violation identified
✓ Critical escalation triggered
✓ AFCA information provided
✓ Client empowered with rights knowledge

---

## INTEGRATION TEST: END-TO-END SCENARIO

### Scenario: Water Damage Claim with Insurance Training Requirements

**Timeline**:
1. **Day 1 - Claim Submission**:
   - Client submits claim via claim-processing workflow
   - Insurer auto-detected as "SUNCORP" from policy number
   - Documentation requirements identified: "3+ photos per damage area"
   - Code of Practice timeline explained: "3-day ack, 10-day response"

2. **Day 4 - Contractor Matching**:
   - NRPG receives request for contractor
   - Contractor-matching workflow evaluates available contractors
   - **Critical Check**: Verify contractor has:
     - Insurance training completed AND valid
     - $10M+ public liability verified AND valid
   - Only eligible contractors recommended for insurance-backed work

3. **Day 10 - Customer Support**:
   - Client calls: "Has the insurer responded? I haven't heard anything"
   - Customer-support workflow recognizes as `claim_status` + insurance query
   - References Code of Practice: "Initial response due within 10 days"
   - Provides AFCA escalation info if needed
   - Knowledge includes: "Expected timeline is 10-day response minimum"

4. **Day 35 - Escalation**:
   - Client contacts again: "Still no response, can I complain to AFCA?"
   - Customer-support workflow identifies AFCA escalation query
   - Triggers escalation to human specialist (critical urgency)
   - Response includes: AFCA contact, cooling-off period info, consumer rights

**Success Criteria - Full Integration**:
✓ Insurer correctly auto-detected in Day 1
✓ Insurance requirements enforced in contractor selection (Day 4)
✓ Code of Practice timeline referenced consistently (Days 10, 35)
✓ AFCA information provided when needed (Day 35)
✓ Consumer rights empowered throughout

---

## MANUAL TESTING CHECKLIST

### Claim Processing Workflow Testing
- [ ] Test with 5+ different insurer policy number formats
- [ ] Verify auto-detection works for NRMA, Suncorp, Allianz, QBE, IAG, CGU, Medibank
- [ ] Test flood damage scenarios (coverage vs exclusion)
- [ ] Verify AFCA contact info in all claim outputs
- [ ] Test Code of Practice timeline mentions in different scenarios
- [ ] Verify GST calculation with Australian rates (10%)
- [ ] Test with claims outside 90-day incident date window

### Contractor Matching Workflow Testing
- [ ] Test contractor without training completion
- [ ] Test contractor with expired training certificate
- [ ] Test contractor with PL < $10M
- [ ] Test contractor with unverified PL
- [ ] Test contractor with expired PL certificate
- [ ] Test with mix of eligible/ineligible contractors
- [ ] Verify eligible contractors ranked higher for insurance work
- [ ] Test insurance-ineligible contractors can still match for non-insured work

### Customer Support Workflow Testing
- [ ] Test insurance coverage questions
- [ ] Test consumer rights questions
- [ ] Test AFCA escalation triggers
- [ ] Test Code of Practice timeline references
- [ ] Test flood cover optionality explanations
- [ ] Test coverage dispute responses with rights
- [ ] Test urgent/critical escalation for delayed responses
- [ ] Test empathetic tone throughout

---

## AUTOMATED TESTING (When Available)

```typescript
// Example test framework setup (Jest/Vitest)

describe('Stage 5: Enhanced AI Workflows', () => {

  describe('Claim Processing - Insurance Integration', () => {
    test('Should auto-detect insurer from policy number', async () => {
      // Implementation with mock data
    });

    test('Should include Code of Practice timelines', async () => {
      // Implementation verification
    });

    test('Should reference AFCA in consumer rights guidance', async () => {
      // Implementation verification
    });
  });

  describe('Contractor Matching - Insurance Verification', () => {
    test('Should exclude contractors without valid insurance training', async () => {
      // Implementation verification
    });

    test('Should enforce $10M public liability requirement', async () => {
      // Implementation verification
    });

    test('Should validate certificate expiry dates', async () => {
      // Implementation verification
    });
  });

  describe('Customer Support - Insurance Knowledge', () => {
    test('Should recognize insurance-related queries', async () => {
      // Implementation verification
    });

    test('Should include Code of Practice info in responses', async () => {
      // Implementation verification
    });

    test('Should escalate AFCA-related queries', async () => {
      // Implementation verification
    });
  });
});
```

---

## PERFORMANCE METRICS

**Expected Performance Improvements with Snake Build Pattern**:
- System prompt reduction: ~70% (from 200+ tokens to ~80 tokens)
- Context window savings: ~20-25% per execution (via skill progressive disclosure)
- Response time: <2 seconds for validation, <3 seconds for scoring
- Cost per execution: ~30% reduction due to smaller prompts

**Baseline Metrics to Establish**:
- Average response time per workflow node
- Token usage per execution
- Accuracy of auto-detected insurers
- Contractor matching consistency
- Customer support escalation accuracy

---

## KNOWN LIMITATIONS & FUTURE IMPROVEMENTS

**Current Limitations**:
- Auto-detect relies on policy number format assumptions (may need adjustment for new insurers)
- Manual verification of contractor insurance documents still required
- AFCA information is provided but full complaint submission not automated

**Future Improvements**:
- Integration with actual insurer APIs for real-time policy verification
- Automated certificate validation via insurer portals
- AFCA complaint submission workflow automation
- Real-time Code of Practice timeline tracking dashboard

---

## SIGN-OFF CHECKLIST

**QA Sign-Off**:
- [ ] All 5 claim processing test scenarios pass
- [ ] All 3 contractor matching test scenarios pass
- [ ] All 5 customer support test scenarios pass
- [ ] Integration test passes end-to-end
- [ ] No critical bugs identified
- [ ] Performance acceptable (< 3 second response times)

**Product Sign-Off**:
- [ ] Insurance knowledge integration meets requirements
- [ ] Consumer rights properly communicated
- [ ] Code of Practice compliance verified
- [ ] AFCA escalation logic working correctly
- [ ] Contractor insurance requirements enforced

**Deployment Sign-Off**:
- [ ] All workflows tested in staging environment
- [ ] Database migrations successful
- [ ] API endpoints responding correctly
- [ ] Error handling working as expected
- [ ] Ready for production deployment

---

**Document Status**: Testing Scenarios Complete, Ready for Manual & Automated Testing
**Next Step**: Begin executing test scenarios, document results, fix any issues before Stage 6 launch
