/**
 * A/B Test Variant Generator
 *
 * Generates psychologically optimized content variations for A/B testing.
 * Uses Gemini to create multiple variants targeting different decision drivers:
 * - Urgency/FOMO
 * - Trust/Authority
 * - Value/ROI
 * - Social Proof
 * - Exclusivity/Status
 *
 * All variants maintain brand consistency while optimizing for conversion.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  getBrandContextString,
  validateBrandCompliance,
  getAudienceTone,
} from './brand-guidelines';

export type PsychologicalAppeal =
  | 'urgency'
  | 'trust'
  | 'value'
  | 'social_proof'
  | 'exclusivity'
  | 'curiosity'
  | 'fear_of_loss'
  | 'aspiration';

export interface ContentVariant {
  id: string;
  variant: string; // 'A', 'B', 'C', etc.
  text: string;
  psychologicalAppeal: PsychologicalAppeal;
  wordCount: number;
  characterCount: number;
  estimatedConversionLift: number; // 1.05 = 5% lift
  compliance: {
    compliant: boolean;
    issues: string[];
  };
}

export interface ABTestSpec {
  baseContent: string;
  audience: 'emergency' | 'contractor' | 'insurance';
  contentType: 'headline' | 'cta' | 'value_prop' | 'email_subject';
  maxLength?: number;
  variantCount: 3 | 5 | 7;
  customPsychologicalAppeals?: PsychologicalAppeal[];
}

export interface ABTestResults {
  baseContent: string;
  audience: string;
  contentType: string;
  generatedAt: Date;
  variants: ContentVariant[];
  recommendedVariant: ContentVariant;
  tokensUsed: number;
}

class ABTestVariantGenerator {
  private client: GoogleGenerativeAI;
  private model: any;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }

    this.client = new GoogleGenerativeAI(this.apiKey);
    this.model = this.client.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  /**
   * Generate A/B test variants for any content type
   */
  async generateVariants(spec: ABTestSpec): Promise<ABTestResults> {
    const tone = getAudienceTone(spec.audience);
    const psychologicalAppeals = this.getPsychologicalAppeals(spec.variantCount, spec.customPsychologicalAppeals);

    const prompt = `
${getBrandContextString(spec.audience)}

TASK: Generate ${spec.variantCount} A/B test variants for ${spec.contentType}.

BASE CONTENT: "${spec.baseContent}"
CONTENT TYPE: ${spec.contentType}
AUDIENCE: ${spec.audience}
MAX LENGTH: ${spec.maxLength || 'no limit'}
TONE: ${tone.tone}

PSYCHOLOGICAL APPEALS (one per variant):
${psychologicalAppeals.map((appeal, idx) => `- Variant ${String.fromCharCode(65 + idx)} (${appeal})`).join('\n')}

REQUIREMENTS FOR EACH VARIANT:
1. Maintain same core message as base content
2. Vary psychological trigger (see appeals above)
3. Stay true to brand voice and guidelines
4. Feel distinct but on-brand
5. Be grammatically perfect
6. ${spec.maxLength ? `Stay under ${spec.maxLength} characters` : 'No length constraints'}

VARIANT GUIDELINES:
- Urgency: Use "now", "immediately", "limited time", numbers of jobs/hours
- Trust: Use "verified", "certified", "insured", credentials
- Value: Use "$", "revenue", "earn", ROI language, calculated benefits
- Social Proof: Use "500+", "trusted by", "contractors say", comparison language
- Exclusivity: Use "elite", "1 in 4", "premium", "only", scarcity language
- Curiosity: Use "discover", "learn", questions, mysterious language
- Fear of Loss: Use "don't", "miss out", "before", urgency without pressure
- Aspiration: Use "grow", "build", "achieve", "success", inspirational language

OUTPUT FORMAT (JSON Array):
[
  {
    "variant": "A",
    "text": "...",
    "psychological_appeal": "urgency|trust|value|social_proof|exclusivity|curiosity|fear_of_loss|aspiration",
    "estimated_conversion_lift": 1.0
  },
  ...
]

CONVERSION LIFT ESTIMATES:
- Urgency: 1.15-1.25 (15-25% lift) for emergency
- Trust: 1.10-1.20 (10-20% lift) for insurance/contractor
- Value: 1.12-1.18 (12-18% lift) for contractor ROI
- Social Proof: 1.08-1.15 (8-15% lift) for conversion
- Exclusivity: 1.10-1.20 (10-20% lift) for premium positioning
- Curiosity: 1.05-1.10 (5-10% lift) for engagement
- Fear of Loss: 1.12-1.18 (12-18% lift) for urgency
- Aspiration: 1.10-1.15 (10-15% lift) for growth messaging

Generate realistic lift estimates based on appeal type and audience.

Return ONLY the JSON array, no markdown or explanation.
`;

    try {
      const response = await this.model.generateContent(prompt);
      let jsonText = response.response.text().trim();

      // Clean up markdown if present
      if (jsonText.includes('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      const variantData = JSON.parse(jsonText);

      // Process and validate variants
      const variants: ContentVariant[] = variantData.map((item: any, idx: number) => {
        const text = item.text || '';
        const compliance = validateBrandCompliance(text, spec.audience);

        return {
          id: `variant-${String.fromCharCode(65 + idx)}-${Date.now()}`,
          variant: String.fromCharCode(65 + idx),
          text,
          psychologicalAppeal: item.psychological_appeal as PsychologicalAppeal,
          wordCount: text.split(/\s+/).length,
          characterCount: text.length,
          estimatedConversionLift: item.estimated_conversion_lift || 1.0,
          compliance: {
            compliant: compliance.compliant,
            issues: compliance.issues,
          },
        };
      });

      // Find recommended variant (highest estimated lift + compliant)
      const recommendedVariant = variants.reduce((best, current) => {
        if (!current.compliance.compliant && best.compliance.compliant) return best;
        return current.estimatedConversionLift > best.estimatedConversionLift ? current : best;
      });

      return {
        baseContent: spec.baseContent,
        audience: spec.audience,
        contentType: spec.contentType,
        generatedAt: new Date(),
        variants,
        recommendedVariant,
        tokensUsed: response.response.usageMetadata?.totalTokenCount || 0,
      };
    } catch (error) {
      throw new Error(
        `Failed to generate A/B variants: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate variants for headlines
   */
  async generateHeadlineVariants(
    baseHeadline: string,
    audience: 'emergency' | 'contractor' | 'insurance',
    variantCount: 3 | 5 = 5
  ): Promise<ABTestResults> {
    return this.generateVariants({
      baseContent: baseHeadline,
      audience,
      contentType: 'headline',
      maxLength: 80,
      variantCount,
    });
  }

  /**
   * Generate variants for CTAs
   */
  async generateCTAVariants(
    baseCTA: string,
    audience: 'emergency' | 'contractor' | 'insurance',
    variantCount: 3 | 5 = 5
  ): Promise<ABTestResults> {
    return this.generateVariants({
      baseContent: baseCTA,
      audience,
      contentType: 'cta',
      maxLength: 40,
      variantCount,
    });
  }

  /**
   * Generate variants for email subject lines
   */
  async generateEmailSubjectVariants(
    baseSubject: string,
    audience: 'emergency' | 'contractor' | 'insurance',
    variantCount: 3 | 5 = 5
  ): Promise<ABTestResults> {
    return this.generateVariants({
      baseContent: baseSubject,
      audience,
      contentType: 'email_subject',
      maxLength: 60,
      variantCount,
    });
  }

  /**
   * Get psychological appeals for given variant count
   */
  private getPsychologicalAppeals(
    count: number,
    custom?: PsychologicalAppeal[]
  ): PsychologicalAppeal[] {
    if (custom && custom.length >= count) {
      return custom.slice(0, count);
    }

    const defaultAppeals: PsychologicalAppeal[] = [
      'urgency',
      'trust',
      'value',
      'social_proof',
      'exclusivity',
      'aspiration',
      'fear_of_loss',
    ];

    if (custom && custom.length > 0) {
      return [...custom, ...defaultAppeals].slice(0, count);
    }

    return defaultAppeals.slice(0, count);
  }

  /**
   * Compare variants and provide insights
   */
  analyzeVariants(results: ABTestResults): {
    comparison: string;
    highestLiftVariant: ContentVariant;
    lowestLiftVariant: ContentVariant;
    averageLift: number;
    insights: string[];
  } {
    const variants = results.variants;
    const highestLift = variants.reduce((max, v) =>
      v.estimatedConversionLift > max.estimatedConversionLift ? v : max
    );
    const lowestLift = variants.reduce((min, v) =>
      v.estimatedConversionLift < min.estimatedConversionLift ? v : min
    );
    const averageLift =
      variants.reduce((sum, v) => sum + v.estimatedConversionLift, 0) / variants.length;

    const insights: string[] = [];

    // Add insights based on variant performance
    if (highestLift.estimatedConversionLift > 1.2) {
      insights.push(`Variant ${highestLift.variant} shows high conversion potential (${((highestLift.estimatedConversionLift - 1) * 100).toFixed(0)}% lift)`);
    }

    const compliantVariants = variants.filter(v => v.compliance.compliant);
    if (compliantVariants.length < variants.length) {
      insights.push(
        `${variants.length - compliantVariants.length} variant(s) have compliance issues - review recommendations`
      );
    }

    if (results.audience === 'emergency') {
      const urgencyVariants = variants.filter(v => v.psychologicalAppeal === 'urgency');
      if (urgencyVariants.length > 0 && urgencyVariants[0].estimatedConversionLift > 1.15) {
        insights.push('Urgency messaging performs well for emergency audience');
      }
    }

    return {
      comparison: `Base content vs ${variants.length} variants | Avg lift: ${(averageLift - 1).toFixed(1)}%`,
      highestLiftVariant: highestLift,
      lowestLiftVariant: lowestLift,
      averageLift,
      insights,
    };
  }
}

// Singleton instance
let instance: ABTestVariantGenerator | null = null;

export function getABTestGenerator(apiKey?: string): ABTestVariantGenerator {
  if (!instance) {
    instance = new ABTestVariantGenerator(apiKey);
  }
  return instance;
}

export default ABTestVariantGenerator;
