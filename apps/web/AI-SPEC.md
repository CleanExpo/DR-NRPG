# AI Implementation Specification: Disaster Recovery NRPG Platform

> **Document Version:** 2.0
> **Last Updated:** January 2026
> **Status:** ✅ ALL PHASES COMPLETE

---

## Executive Summary

This document provides a comprehensive specification for all AI integration stages across the Disaster Recovery NRPG platform. **All five implementation phases (A-E) have been completed.**

### Current AI Infrastructure Status

| Component | Status | Completion |
|-----------|--------|------------|
| LangGraph Orchestration | ✅ COMPLETE | 100% |
| Anthropic Claude Provider | ✅ COMPLETE | 100% |
| Ollama Local Provider | ✅ COMPLETE | 100% |
| Google Gemini Services | ✅ COMPLETE | 100% |
| 8 LangGraph Workflows | ✅ COMPLETE | 100% |
| Autonomous Worker Queue | ✅ COMPLETE | 100% |
| AI API Routes | ✅ COMPLETE | 100% |
| OpenAI Provider | ✅ COMPLETE | 100% |
| T5Gemma Local Model | ✅ COMPLETE | 100% |
| Super-Orchestrator | ✅ COMPLETE | 100% |
| Frontend AI Integration | ✅ COMPLETE | 100% |
| ML-based Matching | ✅ COMPLETE | 100% |
| Fraud Detection AI | ✅ COMPLETE | 100% |
| Dynamic Pricing Engine | ✅ COMPLETE | 100% |
| NLP Extraction Service | ✅ COMPLETE | 100% |
| Contractor Onboarding | ✅ COMPLETE | 100% |
| Report Generation | ✅ COMPLETE | 100% |

### Technology Stack

- **Orchestration:** LangGraph + LangChain
- **Primary LLM:** Anthropic Claude (claude-sonnet-4)
- **Secondary LLM:** Google Gemini 2.5 Flash
- **Local LLM:** Ollama (llama3.1:8b)
- **Queue System:** Bull + Redis
- **Checkpointing:** Prisma PostgreSQL

---

## 1. Current AI Implementation Inventory

### 1.1 Backend AI Services

#### LangGraph Workflows (`lib/agents/workflows/`)

| Workflow | File | Purpose | Status |
|----------|------|---------|--------|
| Disaster Analysis | `disaster-analysis.ts` | Analyse disasters, assess severity, generate recovery plans | ✅ COMPLETE |
| Claim Processing | `claim-processing.ts` | Validate claims, extract info, provider guidance | ✅ COMPLETE |
| Contractor Matching | `contractor-matching.ts` | Intelligent contractor matching with scoring | ✅ COMPLETE |
| Inspection Report | `inspection-report.ts` | industry-standard damage assessment | ✅ COMPLETE |
| Customer Support | `customer-support.ts` | Query handling, sentiment analysis, escalation | ✅ COMPLETE |
| Contractor Onboarding | `contractor-onboarding.ts` | AI document verification, risk assessment, auto-approval | ✅ COMPLETE |
| Report Generation | `report-generation.ts` | Natural language reports, insights, recommendations | ✅ COMPLETE |

#### AI Providers (`lib/agents/providers/`)

| Provider | File | Models | Status |
|----------|------|--------|--------|
| Anthropic | `anthropic-provider.ts` | claude-sonnet-4, claude-3-5-sonnet, claude-3-opus | ✅ COMPLETE |
| Ollama | `ollama-provider.ts` | llama3.1:8b (configurable) | ✅ COMPLETE |
| OpenAI | `openai-provider.ts` | gpt-4o, gpt-4o-mini, gpt-4-turbo | ✅ COMPLETE |

#### Google Gemini Services (`lib/ai/`, `lib/services/`)

| Service | File | Capability | Status |
|---------|------|------------|--------|
| Content Generator | `gemini-content-generator.ts` | Headlines, CTAs, brand compliance | COMPLETE |
| Image Service | `gemini-image.service.ts` | 2K/4K image generation | COMPLETE |
| Design Generator | `design-generator.service.ts` | Visual assets, brand-aware | COMPLETE |
| AI Content | `ai-content-generator.ts` | SEO articles, templates | COMPLETE |
| Video Service | `gemini-video.service.ts` | Video analysis | PARTIAL |

#### AI API Routes (`app/api/`)

| Route | Method | Purpose | Status |
|-------|--------|---------|--------|
| `/agents/orchestrate` | POST/GET | Execute LangGraph workflows | ✅ COMPLETE |
| `/agents/status/[jobId]` | GET/POST | Job status, cancel, resume | ✅ COMPLETE |
| `/ai/extract` | POST | Document extraction | ✅ COMPLETE |
| `/ai/process` | POST/GET | Multi-task AI processing | ✅ COMPLETE |
| `/ai/summarize` | POST | Content summarisation | ✅ COMPLETE |
| `/ai/claim-assist` | POST | Photo analysis, field suggestions | ✅ COMPLETE |
| `/ai/semantic-search` | POST | Natural language search parsing | ✅ COMPLETE |
| `/ai/chat` | POST | Streaming chat with context | ✅ COMPLETE |
| `/admin/claims/triage` | POST/GET | AI claim triage system | ✅ COMPLETE |
| `/admin/disputes/predict` | POST/GET | Dispute prediction & prevention | ✅ COMPLETE |
| `/admin/fraud/analyze` | POST/GET | Fraud detection & alerts | ✅ COMPLETE |
| `/admin/pricing/calculate` | POST/GET | Dynamic pricing engine | ✅ COMPLETE |
| `/admin/reports/ai-generate` | POST/GET | AI-powered report generation | ✅ COMPLETE |
| `/super-orchestrator` | POST/GET | Meta-agent coordination | ✅ COMPLETE |

### 1.2 Frontend AI Integration Points

#### Current AI-Enabled Components

| Component | Location | AI Feature | Status |
|-----------|----------|------------|--------|
| Claim Form | `components/insurance/claim-submission-form.tsx` | Photo analysis, field suggestions | ✅ COMPLETE |
| Contractor Search | `components/contractor/contractor-search-interface.tsx` | Semantic search, AI matching | ✅ COMPLETE |
| Chat Widget | `components/floating-chat-widget.tsx` | Streaming AI responses | ✅ COMPLETE |
| Service Request | `components/configurable/service-request-form.tsx` | AI-assisted form filling | ✅ COMPLETE |
| Admin Dashboard | `dashboard/admin/` | AI analytics, fraud alerts | ✅ COMPLETE |
| Claim Assistant | `components/ai/claim-assistant.tsx` | Real-time AI suggestions | ✅ COMPLETE |
| Semantic Search | `components/ai/semantic-search-input.tsx` | Natural language parsing | ✅ COMPLETE |
| AI Chat Widget | `components/ai/ai-chat-widget.tsx` | Context-aware support | ✅ COMPLETE |

---

## 2. AI Implementation Roadmap

### Phase A: Foundation Enhancement (Week 1-2)

#### A.1 OpenAI Provider Implementation

**Files to Create/Modify:**
- `lib/agents/providers/openai-provider.ts` (NEW)
- `lib/agents/providers/index.ts` (MODIFY)

**Implementation:**
```typescript
// openai-provider.ts
import { ChatOpenAI } from '@langchain/openai';

export class OpenAIProvider implements AIProvider {
  models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo']
  // Implement health check, inference, streaming
}
```

#### A.2 Enable T5Gemma Local Service

**Files to Modify:**
- `lib/services/t5gemma.service.ts` (UNCOMMENT + CONFIGURE)

**Tasks:**
1. Install Hugging Face transformers
2. Configure model download path
3. Enable CPU/CUDA detection
4. Uncomment model initialisation

#### A.3 AI Monitoring Dashboard

**Files to Create:**
- `app/dashboard/admin/ai-monitoring/page.tsx`
- `components/admin/ai-metrics-panel.tsx`

**Features:**
- Token usage tracking per provider
- Cost analytics (daily/weekly/monthly)
- Response latency percentiles
- Error rate by workflow
- Model comparison metrics

---

### Phase B: Smart Frontend (Week 3-4)

#### B.1 AI-Powered Claim Form

**Files to Modify:**
- `components/insurance/claim-submission-form.tsx`
- `app/api/ai/claim-assist/route.ts` (NEW)

**Features:**
1. **Smart Damage Description Extraction**
   - User uploads photo → AI extracts damage type, severity, affected areas
   - Auto-populate form fields from photo analysis

2. **Intelligent Field Suggestions**
   - As user types damage description, suggest service category
   - Predict insurance provider requirements
   - Estimate claim amount range

3. **Real-time Validation**
   - Natural language understanding of descriptions
   - Flag incomplete or inconsistent data
   - Guide users through complex workflows

**API Endpoint:**
```typescript
// POST /api/ai/claim-assist
{
  action: 'analyze_photo' | 'suggest_fields' | 'validate_description',
  data: { ... }
}
```

#### B.2 Semantic Contractor Search

**Files to Modify:**
- `components/contractor/contractor-search-interface.tsx`
- `hooks/useServiceRequestSearch.ts`
- `app/api/ai/semantic-search/route.ts` (NEW)

**Features:**
1. **Natural Language Queries**
   - "My bathroom flooded and I need help today"
   - → Interprets: WATER_DAMAGE, URGENT, bathroom focus

2. **Intent Understanding**
   - Extract: disaster type, urgency, location, preferences
   - Map to structured filters automatically

3. **Smart Ranking**
   - AI-enhanced contractor scoring
   - Historical performance analysis
   - User preference learning

#### B.3 Context-Aware Chat Support

**Files to Modify:**
- `components/floating-chat-widget.tsx`
- `app/api/ai/chat/route.ts` (NEW - streaming)

**Integration:**
- Wire to existing Customer Support LangGraph workflow
- Add streaming responses
- Context injection from current page/user state
- Escalation to human agent with context transfer

---

### Phase C: Intelligent Backend (Week 5-6)

#### C.1 AI Claim Triage System

**Files to Create:**
- `lib/services/claim-triage.service.ts`
- `app/api/admin/claims/triage/route.ts`

**Workflow:**
```
PublicClaim Submitted
    ↓
AI Triage Service
    ├─ Extract structured data from description
    ├─ Analyse uploaded photos (damage type, severity)
    ├─ Classify disaster type (confidence score)
    ├─ Assess urgency level (URGENT/HIGH/STANDARD)
    ├─ Flag fraud indicators
    └─ Generate admin summary
    ↓
Auto-populate: emergencyLevel, serviceType, estimatedCost
    ↓
Admin Review (with AI recommendations)
```

**Schema Enhancement:**
```prisma
model PublicClaim {
  // Existing fields...

  // AI Triage Fields
  aiTriageScore        Float?
  aiDamageClassification String?
  aiConfidenceScore    Float?
  aiExtractedData      Json?
  aiFraudFlags         String[]
  aiProcessedAt        DateTime?
}
```

#### C.2 ML-Enhanced Contractor Matching

**Files to Create:**
- `lib/services/ml-matching.service.ts`
- `lib/ml/matching-model.ts`

**Enhancement to Existing Matching:**
```typescript
// Current: Static rule-based scoring (40+25+20+15 points)
// Enhanced: ML model trained on historical outcomes

interface MLMatchingFactors {
  // Historical performance
  completionRate: number;
  clientSatisfaction: number;
  disputeRate: number;
  responseTimeConsistency: number;

  // Contextual factors
  currentWorkload: number;
  timeOfDay: number;
  weatherConditions: string;

  // Similarity matching
  similarJobSuccessRate: number;
  clientProfileMatch: number;
}

async function predictMatchScore(
  booking: Booking,
  contractor: Contractor
): Promise<{ score: number; confidence: number; reasoning: string }> {
  // LLM-powered scoring with explainability
}
```

#### C.3 Predictive Dispute Prevention

**Files to Create:**
- `lib/services/dispute-prediction.service.ts`
- `app/api/admin/disputes/predict/route.ts`

**Features:**
1. Predict dispute likelihood BEFORE job completion
2. Analyse risk factors:
   - Contractor quality patterns
   - Client history
   - Job complexity vs contractor experience
   - Communication frequency
3. Suggest preemptive interventions
4. Auto-trigger quality checks for high-risk jobs

---

### Phase D: Advanced AI Features (Week 7-8)

#### D.1 AI-Powered Fraud Detection

**Files to Create:**
- `lib/services/fraud-detection.service.ts`
- `app/api/admin/fraud/analyze/route.ts`

**Detection Capabilities:**
1. **Duplicate Claim Detection**
   - Semantic similarity between claim descriptions
   - Photo fingerprinting (prevent same photos on multiple claims)
   - Address/location clustering

2. **Anomaly Detection**
   - Unusual pricing patterns
   - Geographic inconsistencies
   - Contractor-client relationship mapping (collusion)

3. **Document Verification**
   - Invoice authenticity scoring
   - Certification validation via AI
   - Estimate reasonableness check

**Schema Addition:**
```prisma
model FraudAlert {
  id              String   @id @default(cuid())
  claimId         String?
  paymentId       String?
  contractorId    String?
  alertType       FraudAlertType
  riskScore       Float
  indicators      Json
  status          AlertStatus @default(PENDING)
  reviewedBy      String?
  reviewedAt      DateTime?
  createdAt       DateTime @default(now())
}

enum FraudAlertType {
  DUPLICATE_CLAIM
  SUSPICIOUS_PRICING
  DOCUMENT_ANOMALY
  COLLUSION_PATTERN
  GEOGRAPHIC_MISMATCH
}
```

#### D.2 Dynamic Pricing Engine

**Files to Create:**
- `lib/services/dynamic-pricing.service.ts`
- `app/api/admin/pricing/calculate/route.ts`

**Pricing Factors:**
1. **Demand-based Adjustment**
   - Real-time contractor availability
   - Emergency surge pricing
   - Geographic demand patterns

2. **Value-based Pricing**
   - Client tier (standard/premium/VIP)
   - Job complexity assessment
   - Historical margin analysis

3. **Competitive Positioning**
   - Market rate benchmarking
   - Contractor bid optimisation

#### D.3 Natural Language Claim Processing

**Files to Modify:**
- `lib/agents/workflows/claim-processing.ts` (ENHANCE)

**Features:**
1. **Structured Extraction from Free Text**
   - Named entity recognition (locations, dates, amounts)
   - Damage type classification from descriptions
   - Insurance provider identification

2. **Multi-language Support**
   - Auto-detect language
   - Translate to English for processing
   - Respond in user's language

3. **Document OCR + Understanding**
   - Extract text from uploaded invoices/estimates
   - Parse structured data (line items, totals)
   - Cross-validate with claim details

---

### Phase E: Super-Orchestrator & Automation (Week 9-10)

#### E.1 Meta-Agent Super-Orchestrator

**Files to Create:**
- `lib/agents/super-orchestrator.ts`
- `app/api/super-orchestrator/route.ts`

**Capabilities:**
1. **Multi-Workflow Coordination**
   - Chain workflows: Claim Triage → Matching → Payment Setup
   - Parallel execution with dependency resolution
   - Cross-workflow context sharing

2. **Automated Daily Operations**
   - Morning: Process overnight claims queue
   - Continuous: Match pending bookings
   - Evening: Generate daily reports
   - Weekly: Performance summaries

3. **Self-Improvement Loop**
   - Track workflow outcomes
   - Identify bottlenecks
   - Suggest process optimisations
   - A/B test workflow variations

#### E.2 Automated Contractor Onboarding

**Files to Create:**
- `lib/agents/workflows/contractor-onboarding.ts`

**Workflow:**
```
Application Submitted
    ↓
AI Document Verification
    ├─ Industry certificate validation
    ├─ ABN verification (AI + ATO API)
    ├─ Insurance document parsing
    └─ Business profile analysis
    ↓
Background Assessment
    ├─ Online presence analysis
    ├─ Review sentiment analysis
    ├─ Risk scoring
    └─ Recommendation generation
    ↓
Auto-Approve (low-risk) OR Flag for Review (high-risk)
```

#### E.3 Intelligent Reporting System

**Files to Create:**
- `lib/agents/workflows/report-generation.ts`
- `app/api/admin/reports/ai-generate/route.ts`

**Features:**
1. **Natural Language Report Generation**
   - "Generate weekly contractor performance report"
   - "Summarise claims by disaster type for Q1"
   - "Compare NSW vs VIC booking trends"

2. **Insight Extraction**
   - Anomaly highlighting
   - Trend identification
   - Actionable recommendations

3. **Scheduled Reports**
   - Daily operational summary
   - Weekly performance analytics
   - Monthly executive dashboard

---

## 3. Environment Variables

```env
# === AI PROVIDERS ===

# Anthropic Claude (Primary)
ANTHROPIC_API_KEY=sk-ant-...
AGENT_DEFAULT_MODEL=claude-sonnet-4-20250514

# OpenAI (Secondary)
OPENAI_API_KEY=sk-...
OPENAI_DEFAULT_MODEL=gpt-4o

# Google Gemini
GEMINI_API_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...

# Ollama (Local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# === AI CONFIGURATION ===
AI_PROVIDER=anthropic
AGENT_MAX_ITERATIONS=10
AGENT_TIMEOUT_MS=55000
AGENT_ENABLE_STREAMING=true
ENABLE_AI_ENHANCEMENT=true

# === T5GEMMA LOCAL ===
T5GEMMA_MODEL_SIZE=2b
T5GEMMA_DEVICE=cpu
T5GEMMA_MAX_LENGTH=512
T5GEMMA_BATCH_SIZE=8
T5GEMMA_CACHE_DIR=./models

# === QUEUE SYSTEM ===
REDIS_URL=redis://localhost:6379

# === FEATURE FLAGS ===
FEATURE_AI_CLAIM_TRIAGE=true
FEATURE_AI_SEMANTIC_SEARCH=true
FEATURE_AI_FRAUD_DETECTION=true
FEATURE_AI_DYNAMIC_PRICING=false
FEATURE_AI_SUPER_ORCHESTRATOR=false
```

---

## 4. Database Schema Additions

```prisma
// AI Job Tracking (already exists, ensure completeness)
model AIJob {
  id           String   @id @default(cuid())
  type         String   // workflow type
  status       AIJobStatus
  input        Json
  output       Json?
  error        String?
  tokenUsage   Json?    // { input, output, total }
  cost         Float?   // USD
  provider     String   // anthropic, openai, gemini
  model        String
  latencyMs    Int?
  createdAt    DateTime @default(now())
  completedAt  DateTime?
  userId       String?

  @@index([userId])
  @@index([status])
  @@index([type])
}

// AI Triage Results
model ClaimTriageResult {
  id                    String   @id @default(cuid())
  publicClaimId         String   @unique
  damageClassification  String
  severityScore         Float
  confidenceScore       Float
  extractedData         Json
  fraudIndicators       String[]
  recommendedActions    String[]
  processingTimeMs      Int
  createdAt             DateTime @default(now())

  publicClaim           PublicClaim @relation(fields: [publicClaimId], references: [id])
}

// ML Matching Results
model MLMatchResult {
  id              String   @id @default(cuid())
  bookingId       String
  contractorId    String
  mlScore         Float
  confidence      Float
  factors         Json     // detailed scoring breakdown
  reasoning       String   // LLM explanation
  createdAt       DateTime @default(now())

  @@index([bookingId])
  @@index([contractorId])
}

// Fraud Alerts
model FraudAlert {
  id              String         @id @default(cuid())
  entityType      String         // CLAIM, PAYMENT, CONTRACTOR
  entityId        String
  alertType       String
  riskScore       Float
  indicators      Json
  status          AlertStatus    @default(PENDING)
  reviewedBy      String?
  reviewNotes     String?
  reviewedAt      DateTime?
  createdAt       DateTime @default(now())

  @@index([entityType, entityId])
  @@index([status])
}

enum AlertStatus {
  PENDING
  INVESTIGATING
  CONFIRMED
  DISMISSED
  ESCALATED
}
```

---

## 5. Frontend Component Specifications

### 5.1 AI Claim Assistant Component

**File:** `components/ai/claim-assistant.tsx`

```typescript
interface ClaimAssistantProps {
  onSuggestion: (field: string, value: any) => void;
  currentFormData: ClaimFormData;
}

// Features:
// - Photo upload → AI analysis → field suggestions
// - Real-time damage type prediction as user types
// - Coverage estimation based on insurance provider
// - Required document checklist generation
```

### 5.2 Semantic Search Input

**File:** `components/ai/semantic-search-input.tsx`

```typescript
interface SemanticSearchProps {
  onSearch: (query: string, parsedFilters: ParsedFilters) => void;
  placeholder?: string;
}

// Features:
// - Natural language input
// - Real-time intent parsing display
// - Filter chip generation from query
// - Voice input support (future)
```

### 5.3 AI Chat Widget

**File:** `components/ai/ai-chat-widget.tsx`

```typescript
interface AIChatWidgetProps {
  userId?: string;
  contextData?: Record<string, any>;
  onEscalate?: (conversation: Message[]) => void;
}

// Features:
// - Streaming responses
// - Context-aware based on current page
// - Quick action buttons
// - Human escalation with context transfer
```

### 5.4 AI Monitoring Dashboard

**File:** `components/admin/ai-dashboard.tsx`

**Sections:**
1. Usage Overview (tokens, cost, requests)
2. Performance Metrics (latency, error rates)
3. Workflow Analytics (completion rates, outcomes)
4. Cost Breakdown by Provider/Workflow
5. Anomaly Alerts

---

## 6. API Specifications

### 6.1 Claim Assist API

```typescript
// POST /api/ai/claim-assist
// Analyse photo or description for claim assistance

Request:
{
  action: 'analyze_photo' | 'parse_description' | 'suggest_category' | 'estimate_cost',
  data: {
    photo?: string; // base64 or URL
    description?: string;
    insuranceProvider?: string;
    location?: { suburb: string; state: string };
  }
}

Response:
{
  success: true,
  result: {
    damageType: 'WATER_DAMAGE',
    severity: 'HIGH',
    confidence: 0.92,
    suggestedFields: {
      australianServiceType: 'WATER_DAMAGE',
      emergencyLevel: 'URGENT',
      estimatedCost: { min: 2000, max: 5000 }
    },
    requiredDocuments: ['photos', 'insurance_policy', 'damage_report'],
    warnings: ['Possible mould risk detected']
  }
}
```

### 6.2 Semantic Search API

```typescript
// POST /api/ai/semantic-search
// Parse natural language query into structured search

Request:
{
  query: "I need someone to fix water damage in my Sydney home urgently",
  context?: { userId?: string }
}

Response:
{
  success: true,
  parsed: {
    serviceType: 'WATER_DAMAGE',
    urgency: 'URGENT',
    location: { suburb: null, state: 'NSW', city: 'Sydney' },
    intent: 'find_contractor',
    confidence: 0.95
  },
  filters: {
    australianServiceType: ['WATER_DAMAGE'],
    emergencyResponseLevel: ['URGENT', 'HIGH'],
    serviceAreas: { state: 'NSW' }
  }
}
```

### 6.3 Fraud Analysis API

```typescript
// POST /api/admin/fraud/analyze
// Analyse entity for fraud indicators

Request:
{
  entityType: 'CLAIM' | 'PAYMENT' | 'CONTRACTOR',
  entityId: string,
  depth?: 'quick' | 'thorough'
}

Response:
{
  success: true,
  analysis: {
    riskScore: 0.73,
    riskLevel: 'HIGH',
    indicators: [
      { type: 'DUPLICATE_DESCRIPTION', confidence: 0.85, details: '...' },
      { type: 'SUSPICIOUS_TIMING', confidence: 0.65, details: '...' }
    ],
    recommendation: 'MANUAL_REVIEW',
    similarEntities: [{ id: '...', similarity: 0.92 }]
  }
}
```

---

## 7. Implementation Checklist

### Phase A: Foundation ✅ COMPLETE
- [x] Implement OpenAI provider
- [x] Enable T5Gemma local service
- [x] Create AI monitoring dashboard
- [x] Add token usage tracking
- [x] Set up cost alerting

### Phase B: Smart Frontend ✅ COMPLETE
- [x] AI-powered claim form assistance
- [x] Semantic contractor search
- [x] Context-aware chat widget
- [x] Real-time AI suggestions

### Phase C: Intelligent Backend ✅ COMPLETE
- [x] AI claim triage system
- [x] ML-enhanced contractor matching
- [x] Predictive dispute prevention
- [x] Automated quality scoring

### Phase D: Advanced Features ✅ COMPLETE
- [x] Fraud detection pipeline
- [x] Dynamic pricing engine
- [x] NLP claim processing
- [x] Multi-language support

### Phase E: Automation ✅ COMPLETE
- [x] Super-orchestrator implementation
- [x] Automated contractor onboarding
- [x] Intelligent report generation
- [x] Self-improvement loops

---

## 8. Verification Strategy

### Unit Tests
- Provider health checks
- Workflow state transitions
- Scoring algorithm accuracy

### Integration Tests
- End-to-end claim triage flow
- Matching algorithm with ML enhancement
- Chat widget streaming

### Load Tests
- AI API under 100 concurrent requests
- Queue processing at scale
- Provider failover scenarios

### Acceptance Criteria
- Claim triage: 90%+ classification accuracy
- Matching: 15% improvement in completion rate
- Chat: 80% resolution without escalation
- Fraud: 95% detection rate, <5% false positives

---

## 9. Cost Projections

| Phase | Monthly AI Cost (Est.) | Token Usage |
|-------|------------------------|-------------|
| Current | $200-500 | 5M tokens |
| Phase A-B | $500-1000 | 15M tokens |
| Phase C-D | $1000-2000 | 30M tokens |
| Phase E | $2000-3500 | 50M tokens |

**Cost Optimisation Strategies:**
1. Use Ollama for non-critical tasks
2. Cache common queries
3. Batch similar requests
4. Use smaller models for triage

---

## 10. Files Summary

### New Files (23 total)

```
lib/agents/providers/openai-provider.ts
lib/services/claim-triage.service.ts
lib/services/ml-matching.service.ts
lib/services/dispute-prediction.service.ts
lib/services/fraud-detection.service.ts
lib/services/dynamic-pricing.service.ts
lib/agents/super-orchestrator.ts
lib/agents/workflows/contractor-onboarding.ts
lib/agents/workflows/report-generation.ts

app/api/ai/claim-assist/route.ts
app/api/ai/semantic-search/route.ts
app/api/ai/chat/route.ts
app/api/admin/claims/triage/route.ts
app/api/admin/disputes/predict/route.ts
app/api/admin/fraud/analyze/route.ts
app/api/admin/pricing/calculate/route.ts
app/api/admin/reports/ai-generate/route.ts
app/api/super-orchestrator/route.ts

components/ai/claim-assistant.tsx
components/ai/semantic-search-input.tsx
components/ai/ai-chat-widget.tsx
components/admin/ai-dashboard.tsx
components/admin/ai-metrics-panel.tsx
```

### Files to Modify (12 total)

```
lib/agents/providers/index.ts
lib/services/t5gemma.service.ts
lib/agents/workflows/claim-processing.ts
prisma/schema.prisma

components/insurance/claim-submission-form.tsx
components/contractor/contractor-search-interface.tsx
components/floating-chat-widget.tsx
hooks/useServiceRequestSearch.ts

app/dashboard/admin/layout.tsx (add AI nav)
.env.example
```

---

## Contact

For questions about this specification, contact support@disasterrecovery.com.au
