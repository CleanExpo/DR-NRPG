# Australian Context Enrichment Design

**Date:** 2026-02-06
**Epic:** AUDIT-04, AI-02, AI-03
**Priority:** P1 (High - Product Enhancement)
**Est. Time:** 16-22 hours

---

## Executive Summary

This document outlines the design for enriching the DR-NRPG platform with comprehensive Australian disaster recovery context, AI integration via Google Vertex AI, and content validation for Australian compliance.

**Current Gaps:**
1. Generic disaster terminology (missing bushfire, cyclone, hailstorm specifics)
2. No regional risk assessment (bushfire zones, cyclone-prone areas)
3. No Vertex AI integration (currently using generic LangChain)
4. No validation layer for AI-generated Australian content

**Solution:**
Implement three-tier enhancement:
- **Tier 1:** Australian disaster terminology and regional context
- **Tier 2:** Google Vertex AI integration with Australian-specific prompts
- **Tier 3:** Content validation layer ensuring Australian compliance

---

## Part 1: Australian Disaster Terminology Enhancement

### Current Disaster Types (Generic)
```typescript
// Current implementation in lib/claim-wizard/types.ts
export const disasterTypes = [
  { value: 'water-damage', label: 'Water Damage' },
  { value: 'fire-damage', label: 'Fire & Smoke Damage' },
  { value: 'mold', label: 'Mold Remediation' },
  { value: 'storm-damage', label: 'Storm Damage' },
  { value: 'sewage', label: 'Sewage Cleanup' },
  { value: 'biohazard', label: 'Biohazard Restoration' },
] as const;
```

### Enhanced Australian Disaster Types
```typescript
export const australianDisasterTypes = [
  // Water-Related
  { value: 'water-damage', label: 'Water Damage', category: 'water', australian: true },
  { value: 'flood', label: 'Flood Damage', category: 'water', australian: true, seasonal: 'Nov-Feb' },
  { value: 'storm-water', label: 'Storm Water Damage', category: 'water', australian: true },
  { value: 'burst-pipe', label: 'Burst Pipe', category: 'water', australian: true },

  // Fire-Related (Australian-Specific)
  { value: 'bushfire', label: 'Bushfire', category: 'fire', australian: true, seasonal: 'Oct-Mar', highRisk: ['NSW', 'VIC', 'SA', 'WA'] },
  { value: 'house-fire', label: 'House Fire', category: 'fire', australian: true },
  { value: 'smoke-damage', label: 'Smoke Damage', category: 'fire', australian: true },

  // Storm-Related (Australian-Specific)
  { value: 'cyclone', label: 'Cyclone', category: 'storm', australian: true, seasonal: 'Nov-Apr', highRisk: ['QLD', 'NT', 'WA'] },
  { value: 'severe-storm', label: 'Severe Storm', category: 'storm', australian: true, seasonal: 'Nov-Feb' },
  { value: 'hailstorm', label: 'Hailstorm', category: 'storm', australian: true },
  { value: 'wind-damage', label: 'Wind Damage', category: 'storm', australian: true },

  // Mould & Bio (Australian Spelling)
  { value: 'mould-remediation', label: 'Mould Remediation', category: 'mould', australian: true },
  { value: 'sewage-backup', label: 'Sewage Backup', category: 'biohazard', australian: true },
  { value: 'biohazard', label: 'Biohazard Cleanup', category: 'biohazard', australian: true },

  // Structural
  { value: 'structural-damage', label: 'Structural Damage', category: 'structural', australian: true },
  { value: 'roof-damage', label: 'Roof Damage', category: 'structural', australian: true },
] as const;
```

### Regional Risk Zones (Australian)

```typescript
export const australianRiskZones = {
  bushfire: {
    high: ['NSW', 'VIC', 'SA', 'WA', 'TAS'],
    moderate: ['QLD', 'ACT'],
    low: ['NT'],
    season: { start: 'October', end: 'March' },
    buildingCode: 'AS 3959-2018 (Bushfire Attack Level)',
  },
  cyclone: {
    high: ['QLD', 'NT', 'WA'],
    moderate: [],
    low: ['NSW', 'VIC', 'SA', 'TAS', 'ACT'],
    season: { start: 'November', end: 'April' },
    buildingCode: 'AS 1170.2 Wind Actions',
  },
  flood: {
    high: ['QLD', 'NSW', 'NT'],
    moderate: ['VIC', 'WA', 'SA'],
    low: ['TAS', 'ACT'],
    season: { start: 'November', end: 'February' },
    buildingCode: 'Planning for Bushfire Protection 2019',
  },
  hail: {
    high: ['NSW', 'ACT', 'QLD'],
    moderate: ['VIC', 'SA'],
    low: ['WA', 'NT', 'TAS'],
    season: { start: 'October', end: 'March' },
    buildingCode: 'AS 4040.3 Hail Resistance',
  },
};
```

---

## Part 2: Enhanced Claim Intake with Australian Context

### New Questions for Australian Claims

#### Step 1 Enhancement: Regional Risk Assessment
After selecting disaster type, ask region-specific questions:

**For Bushfire (NSW, VIC, SA, WA, TAS):**
```typescript
{
  question: "Is your property in a designated bushfire zone?",
  type: "yes-no",
  helpText: "Check your local council's bushfire overlay map",
  relevantStates: ['NSW', 'VIC', 'SA', 'WA', 'TAS'],
  affects: ['insurance-eligibility', 'contractor-requirements'],
}
```

**For Cyclone (QLD, NT, WA):**
```typescript
{
  question: "What is your property's cyclone rating?",
  type: "select",
  options: ['C1', 'C2', 'C3', 'C4', 'Not sure'],
  helpText: "This is based on your building approval documents",
  relevantStates: ['QLD', 'NT', 'WA'],
  affects: ['building-code-compliance', 'insurance-claim'],
}
```

**For Flood (All states with intensity):**
```typescript
{
  question: "Is your property in a flood zone?",
  type: "yes-no-unsure",
  helpText: "Check your property's flood overlay on council website",
  affects: ['insurance-eligibility', 'emergency-services-notification'],
}
```

#### Step 3 Enhancement: Australian Insurance Specifics

```typescript
{
  question: "Does your policy cover this type of disaster?",
  type: "yes-no-unsure",
  helpText: "Some policies exclude flood, cyclone, or bushfire. Check your PDS.",
  conditional: { on: 'hasInsurance', equals: 'yes' },
}

{
  question: "Have you contacted your insurer?",
  type: "yes-no",
  helpText: "Most Australian insurers require notification within 48 hours",
  conditional: { on: 'hasInsurance', equals: 'yes' },
}
```

---

## Part 3: Google Vertex AI Integration

### New Vertex AI Provider

**File:** `apps/web/lib/agents/providers/vertex-ai-provider.ts`

```typescript
import { BaseAIProvider } from './base-provider';
import { ChatVertexAI } from '@langchain/google-vertexai';
import { AIProviderConfig, AIProviderType, ProviderHealth } from '../types';

export class VertexAIProvider extends BaseAIProvider {
  getType(): AIProviderType {
    return 'vertexai';
  }

  getName(): string {
    return 'Google Vertex AI';
  }

  createModel(): ChatVertexAI {
    return new ChatVertexAI({
      model: this.config.model || 'gemini-pro',
      temperature: this.config.temperature ?? 0.7,
      maxOutputTokens: this.config.maxTokens ?? 2048,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
    });
  }

  async checkHealth(): Promise<ProviderHealth> {
    try {
      const model = this.getModel();
      const testResponse = await model.invoke([
        { role: 'user', content: 'Test connection' },
      ]);

      return {
        available: true,
        latencyMs: 0,
        lastChecked: new Date(),
        error: null,
      };
    } catch (error) {
      return {
        available: false,
        latencyMs: 0,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  estimateCost(promptTokens: number, completionTokens: number): number {
    // Gemini Pro pricing (as of 2024): $0.00025/1K input, $0.0005/1K output
    const inputCost = (promptTokens / 1000) * 0.00025;
    const outputCost = (completionTokens / 1000) * 0.0005;
    return inputCost + outputCost;
  }
}
```

### Australian-Specific AI Prompts

**File:** `apps/web/lib/ai/australian-disaster-prompts.ts`

```typescript
export const AUSTRALIAN_DISASTER_SYSTEM_PROMPT = `You are an Australian disaster recovery expert with deep knowledge of:

**Australian Building Codes:**
- AS 3959-2018 (Bushfire Attack Level - BAL)
- AS 1170.2 (Wind Actions for Cyclones)
- AS 4040.3 (Hail Resistance)
- National Construction Code (NCC) 2022

**Australian Insurance Standards:**
- Insurance Council of Australia (ICA) guidelines
- Common policy exclusions (flood, cyclone, bushfire)
- Typical excess amounts for disaster claims
- Average claim processing times (14-30 days)

**Regional Disaster Patterns:**
- Bushfire season: October to March (NSW, VIC, SA, WA, TAS)
- Cyclone season: November to April (QLD, NT, WA)
- Storm season: November to February (most states)
- Flood: Year-round with peaks in summer (Nov-Feb)

**Australian Terminology:**
- Use "mould" not "mold"
- Use "colour" not "color"
- Use Australian suburb/postcode format
- Currency: AUD (Australian Dollars)
- Measurements: Metric (mm, m, km, kg)

**Response Format:**
- Provide cost estimates in AUD
- Reference applicable Australian Standards
- Mention regional considerations
- Use Australian spelling throughout
- Reference local building codes when relevant`;

export const analyzeDamageForAustralia = (description: string, state: string, postcode: string) => {
  return `${AUSTRALIAN_DISASTER_SYSTEM_PROMPT}

**Task:** Analyze this damage description for an Australian property:

**Location:** ${state}, Postcode ${postcode}
**Description:** ${description}

**Provide:**
1. Primary damage type (bushfire, cyclone, flood, storm, water, mould, etc.)
2. Severity level (LOW, MEDIUM, HIGH, CRITICAL)
3. Applicable Australian Standards (AS codes)
4. Estimated repair cost range (AUD)
5. Regional risk factors for this postcode
6. Insurance considerations (typical coverage, exclusions)
7. Required certifications for contractors (IICRC, building license)
8. Any safety warnings or immediate actions needed

**Format response as JSON:**
\`\`\`json
{
  "damageType": "...",
  "severity": "...",
  "australianStandards": ["AS XXXX"],
  "estimatedCostAUD": { "min": 0, "max": 0 },
  "regionalFactors": ["..."],
  "insuranceNotes": "...",
  "requiredCerts": ["Water Restoration Technician (WRT)", "..."],
  "safetyWarnings": ["..."],
  "immediateActions": ["..."]
}
\`\`\``;
};
```

---

## Part 4: Content Validation Layer

**File:** `apps/web/lib/ai/australian-content-validator.ts`

```typescript
/**
 * Australian Content Validation Layer
 *
 * Validates AI-generated content for Australian compliance
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export class AustralianContentValidator {
  /**
   * Validate terminology (Australian spelling)
   */
  validateTerminology(content: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for American spelling
    const americanSpellings = [
      { us: /\bmold\b/gi, au: 'mould' },
      { us: /\bcolor\b/gi, au: 'colour' },
      { us: /\bcenter\b/gi, au: 'centre' },
      { us: /\bfavor\b/gi, au: 'favour' },
    ];

    americanSpellings.forEach(({ us, au }) => {
      if (us.test(content)) {
        warnings.push(`Use Australian spelling: "${au}" instead of American variant`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions: [],
    };
  }

  /**
   * Validate currency (must be AUD)
   */
  validateCurrency(content: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for USD references
    if (/\$\d+\s*USD/gi.test(content) || /USD\s*\$\d+/gi.test(content)) {
      errors.push('Currency must be in AUD, not USD');
    }

    // Ensure AUD is mentioned for clarity
    if (/\$\d+/g.test(content) && !/AUD/gi.test(content)) {
      warnings.push('Consider specifying currency as AUD for clarity');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions: [],
    };
  }

  /**
   * Validate building codes (Australian Standards)
   */
  validateBuildingCodes(content: string, disasterType: string): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    const relevantStandards: Record<string, string[]> = {
      bushfire: ['AS 3959-2018', 'BAL rating'],
      cyclone: ['AS 1170.2', 'Wind rating'],
      hail: ['AS 4040.3'],
      structural: ['NCC 2022', 'BCA'],
    };

    const applicable = relevantStandards[disasterType] || [];

    if (applicable.length > 0) {
      const mentionsStandard = applicable.some((std) => content.includes(std));
      if (!mentionsStandard) {
        suggestions.push(`Consider referencing ${applicable.join(' or ')} for ${disasterType} compliance`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
      suggestions,
    };
  }

  /**
   * Comprehensive validation
   */
  validate(content: string, context: {
    disasterType?: string;
    state?: string;
    requiresCompliance?: boolean;
  }): ValidationResult {
    const results = [
      this.validateTerminology(content),
      this.validateCurrency(content),
      context.disasterType ? this.validateBuildingCodes(content, context.disasterType) : null,
    ].filter(Boolean) as ValidationResult[];

    return {
      valid: results.every((r) => r.valid),
      errors: results.flatMap((r) => r.errors),
      warnings: results.flatMap((r) => r.warnings),
      suggestions: results.flatMap((r) => r.suggestions),
    };
  }
}

// Singleton instance
export const australianValidator = new AustralianContentValidator();
```

---

## Implementation Plan

### Phase 1: Australian Disaster Terminology (6 hours)
1. ✅ Create `lib/disaster-types/australian-disasters.ts`
2. ✅ Update claim wizard to use Australian disaster types
3. ✅ Add regional risk assessment questions
4. ✅ Update validation schemas
5. ✅ Test with all Australian states

### Phase 2: Vertex AI Integration (6-8 hours)
1. ✅ Install `@langchain/google-vertexai` package
2. ✅ Create `VertexAIProvider` class
3. ✅ Add Vertex AI to provider selection
4. ✅ Configure Google Cloud credentials
5. ✅ Create Australian-specific prompts
6. ✅ Update `/api/ai/claim-assist` to use Vertex AI
7. ✅ Test with sample Australian disaster descriptions

### Phase 3: Content Validation Layer (4 hours)
1. ✅ Create `AustralianContentValidator` class
2. ✅ Implement terminology validation
3. ✅ Implement currency validation
4. ✅ Implement building code validation
5. ✅ Integrate validator into claim submission flow
6. ✅ Add validation to AI-generated content
7. ✅ Test with various scenarios

### Phase 4: Testing & Documentation (2 hours)
1. ✅ Test all disaster types across all states
2. ✅ Verify regional questions appear correctly
3. ✅ Test Vertex AI integration end-to-end
4. ✅ Verify Australian compliance validation
5. ✅ Document API changes
6. ✅ Update LINEAR with completion status

---

## Environment Variables Required

```env
# Google Cloud Vertex AI
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=australia-southeast1  # Sydney region
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# AI Provider Selection
AI_PROVIDER=vertexai  # or anthropic, openai, ollama
AI_MODEL=gemini-pro   # or gemini-pro-vision for image analysis
```

---

## Success Criteria

### Must Have (Blocking)
- ✅ Australian disaster types implemented (bushfire, cyclone, hailstorm, flood)
- ✅ Regional risk questions working for all states
- ✅ Vertex AI provider integrated and functional
- ✅ Content validation catching American spelling
- ✅ Cost estimates in AUD only
- ✅ Australian building codes referenced

### Nice to Have (Non-Blocking)
- ⚠️ Seasonal risk warnings (bushfire season, cyclone season)
- ⚠️ Auto-detect risk zone from postcode
- ⚠️ Integration with Bureau of Meteorology API
- ⚠️ Image analysis using Gemini Pro Vision

---

## Files to Create/Modify

### New Files (8)
1. `apps/web/lib/disaster-types/australian-disasters.ts`
2. `apps/web/lib/disaster-types/regional-risks.ts`
3. `apps/web/lib/agents/providers/vertex-ai-provider.ts`
4. `apps/web/lib/ai/australian-disaster-prompts.ts`
5. `apps/web/lib/ai/australian-content-validator.ts`
6. `apps/web/app/api/ai/australian-claim-assist/route.ts`
7. `docs/AUSTRALIAN_CONTEXT_ENRICHMENT_DESIGN.md` (this file)
8. `docs/VERTEX_AI_SETUP.md`

### Modified Files (6)
1. `apps/web/lib/claim-wizard/types.ts` - Add Australian disaster types
2. `apps/web/app/claim/step-1/page.tsx` - Add regional questions
3. `apps/web/app/api/public/claims/submit/route.ts` - Integrate validation
4. `apps/web/app/api/ai/claim-assist/route.ts` - Add Vertex AI option
5. `apps/web/lib/agents/types.ts` - Add VertexAI provider type
6. `package.json` - Add @langchain/google-vertexai dependency

---

## Risk Mitigation

**Risk:** Vertex AI not available in Australia region
**Mitigation:** Use `australia-southeast1` (Sydney) or fallback to `asia-southeast1` (Singapore)

**Risk:** Higher latency than Anthropic/OpenAI
**Mitigation:** Implement caching for common queries, use async processing

**Risk:** Cost overruns with Vertex AI
**Mitigation:** Set usage limits, monitor costs via Cloud Console, implement rate limiting

**Risk:** American content still generated
**Mitigation:** Strong system prompts, validation layer, test suite

---

**Status:** READY FOR IMPLEMENTATION
**Owner:** Engineering Team
**Next Action:** Begin Phase 1 - Australian Disaster Terminology
