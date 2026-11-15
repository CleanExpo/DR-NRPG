import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';

// Types
export interface EnhancementResult {
  success: boolean;
  photoId: string;
  description?: string;
  cost: number;
  processingTime: number;
  error?: string;
}

export interface BatchResult {
  totalImages: number;
  successCount: number;
  failureCount: number;
  totalCost: number;
  results: EnhancementResult[];
}

export interface EnhancementStats {
  totalPhotos: number;
  enhancedPhotos: number;
  pendingPhotos: number;
  totalCostUSD: number;
  avgCostPerImage: number;
  avgProcessingTime: number;
  successRate: number;
  lastProcessedAt?: Date;
}

interface PhotoContext {
  photo: any;
  damageArea: any;
  report: any;
  claim: any;
  booking: any;
}

export class AIImageEnhancementService {
  private openai: OpenAI;
  private model: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = process.env.AI_IMAGE_ENHANCEMENT_MODEL || 'gpt-4o';
  }

  /**
   * Enhance a single image with AI-generated E.E.A.T.-optimized description
   */
  async enhanceSingleImage(photoId: string): Promise<EnhancementResult> {
    const startTime = Date.now();

    try {
      // 1. Fetch photo with full context
      const photo = await this.fetchPhotoWithContext(photoId);

      if (!photo) {
        throw new Error(`Photo not found: ${photoId}`);
      }

      // 2. Skip if already enhanced
      if (photo.aiEnhanced) {
        return {
          success: true,
          photoId,
          description: photo.description || undefined,
          cost: 0,
          processingTime: Date.now() - startTime,
        };
      }

      // 3. Build E.E.A.T.-optimized prompt
      const prompt = await this.buildPrompt({
        photo,
        damageArea: photo.damageArea,
        report: photo.report,
        claim: photo.report?.booking?.auClaims?.[0],
        booking: photo.report?.booking,
      });

      // 4. Call GPT-4 Vision API
      const enhancedDescription = await this.callGPT4Vision(photo.photoUrl, prompt);

      // 5. Calculate cost
      const cost = this.calculateCost(prompt, enhancedDescription);

      // 6. Update photo with enhanced description
      await this.updatePhotoDescription(photoId, enhancedDescription, {
        model: this.model,
        cost,
      });

      // 7. Log enhancement
      await this.logEnhancement({
        photoId,
        reportId: photo.reportId,
        prompt,
        originalDesc: photo.description,
        enhancedDesc: enhancedDescription,
        model: this.model,
        tokensUsed: this.estimateTokens(prompt, enhancedDescription),
        costUSD: cost,
        processingMs: Date.now() - startTime,
        success: true,
        tenantId: photo.tenantId,
      });

      return {
        success: true,
        photoId,
        description: enhancedDescription,
        cost,
        processingTime: Date.now() - startTime,
      };
    } catch (error: any) {
      const processingTime = Date.now() - startTime;

      // Log failure
      try {
        const photo = await prisma.inspectionPhoto.findUnique({
          where: { id: photoId },
          select: { reportId: true, tenantId: true, description: true },
        });

        if (photo) {
          await this.logEnhancement({
            photoId,
            reportId: photo.reportId,
            prompt: '',
            originalDesc: photo.description,
            enhancedDesc: '',
            model: this.model,
            tokensUsed: 0,
            costUSD: 0,
            processingMs: processingTime,
            success: false,
            error: error.message,
            tenantId: photo.tenantId,
          });
        }
      } catch (logError) {
        console.error('Failed to log enhancement error:', logError);
      }

      return {
        success: false,
        photoId,
        cost: 0,
        processingTime,
        error: error.message,
      };
    }
  }

  /**
   * Enhance multiple images in batch
   */
  async enhanceBatchImages(photoIds: string[]): Promise<BatchResult> {
    const results: EnhancementResult[] = [];
    let successCount = 0;
    let failureCount = 0;
    let totalCost = 0;

    for (const photoId of photoIds) {
      const result = await this.enhanceSingleImage(photoId);
      results.push(result);

      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }

      totalCost += result.cost;
    }

    return {
      totalImages: photoIds.length,
      successCount,
      failureCount,
      totalCost,
      results,
    };
  }

  /**
   * Enhance all unprocessed images up to a limit
   */
  async enhanceAllUnprocessedImages(limit: number = 100): Promise<BatchResult> {
    const unprocessedPhotos = await prisma.inspectionPhoto.findMany({
      where: {
        aiEnhanced: false,
        photoUrl: { not: null },
      },
      take: limit,
      select: { id: true },
    });

    const photoIds = unprocessedPhotos.map((p) => p.id);
    return this.enhanceBatchImages(photoIds);
  }

  /**
   * Get enhancement statistics
   */
  async getEnhancementStats(): Promise<EnhancementStats> {
    const [totalPhotos, enhancedPhotos, lastLog, costStats] = await Promise.all([
      prisma.inspectionPhoto.count(),
      prisma.inspectionPhoto.count({ where: { aiEnhanced: true } }),
      prisma.aIImageEnhancementLog.findFirst({
        where: { success: true },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      prisma.aIImageEnhancementLog.aggregate({
        where: { success: true },
        _avg: { costUSD: true, processingMs: true },
        _sum: { costUSD: true },
        _count: true,
      }),
    ]);

    const successCount = costStats._count || 0;
    const totalAttempts = await prisma.aIImageEnhancementLog.count();

    return {
      totalPhotos,
      enhancedPhotos,
      pendingPhotos: totalPhotos - enhancedPhotos,
      totalCostUSD: Number(costStats._sum.costUSD || 0),
      avgCostPerImage: Number(costStats._avg.costUSD || 0),
      avgProcessingTime: costStats._avg.processingMs || 0,
      successRate: totalAttempts > 0 ? (successCount / totalAttempts) * 100 : 0,
      lastProcessedAt: lastLog?.createdAt,
    };
  }

  /**
   * Fetch photo with all related context
   */
  private async fetchPhotoWithContext(photoId: string) {
    return await prisma.inspectionPhoto.findUnique({
      where: { id: photoId },
      include: {
        damageArea: true,
        report: {
          include: {
            booking: {
              include: {
                auClaims: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Build E.E.A.T.-optimized prompt for AI
   */
  private async buildPrompt(context: PhotoContext): Promise<string> {
    const { photo, damageArea, report, claim, booking } = context;

    // Build context sections
    const photoContext = `- Type: ${photo.photoType || 'evidence'} (before/after/evidence)
- Location: ${damageArea?.areaName || 'Property'} - ${damageArea?.roomType || 'Area'}
- Damage Category: ${damageArea?.damageCategory || 'General damage'}
- Severity: ${damageArea?.severity || 'Not specified'}
- Affected Materials: ${damageArea?.affectedMaterials?.join(', ') || 'Various materials'}
- Required Actions: ${damageArea?.requiredActions?.join(', ') || 'Assessment required'}`;

    const complianceContext = `- Jurisdiction: ${report?.jurisdiction || 'Australia'}
- Applicable Codes: ${report?.applicableCodes?.join(', ') || 'Standard building codes'}
- IICRC Standards: ${report?.iicrcStandards?.join(', ') || 'Industry standards'}`;

    const serviceContext = `SERVICE TYPE: ${booking?.australianServiceType || 'Disaster Recovery'}
CLAIM VALUE: $${claim?.totalClaimAmountAUD || 'TBD'} AUD`;

    const promptTemplate = `You are a certified IICRC disaster restoration expert documenting insurance claims in Australia.

PHOTO CONTEXT:
${photoContext}

COMPLIANCE FRAMEWORK:
${complianceContext}

${serviceContext}

TASK: Analyze this image and generate a 2-3 sentence expert-level description that:
1. Demonstrates technical expertise using proper restoration terminology
2. Shows authority by referencing applicable Australian standards or building codes (AS/NZS codes)
3. Provides specific details about materials, damage extent, and remediation needs
4. Is optimised for SEO and E.E.A.T. scoring
5. Uses ONLY Australian English spelling throughout (MANDATORY)

CRITICAL SPELLING REQUIREMENTS (Australian English ONLY):
- colonisation (NOT colonization)
- optimised/optimisation (NOT optimized/optimization)
- colour (NOT color)
- mould (NOT mold)
- metre/centimetre (NOT meter/centimeter)
- fibre (NOT fiber)
- vapour (NOT vapor)
- behaviour (NOT behavior)
- labour (NOT labor)
- recognise/recognising (NOT recognize/recognizing)
- analyse/analysis (NOT analyze)
- stabilise (NOT stabilize)
- minimise (NOT minimize)
- materialised (NOT materialized)

EXCEPTIONS (Use American spelling ONLY for these):
- Trademarked product names (e.g., "DryAir", "ServPro")
- IICRC official references
- Technical abbreviations and standards codes

OUTPUT FORMAT: Plain text description only, no preamble or explanations.

EXAMPLE OUTPUT (for reference only):
"Severe water damage to structural timber framing and plasterboard ceiling linings in accordance with AS 3959 classification. Moisture readings indicate saturation levels exceeding 20% requiring immediate extraction and drying per industry standards. Affected materials include Oregon timber joists, R2.5 ceiling insulation, and painted plasterboard requiring removal and replacement to prevent secondary mould colonisation and progressive structural degradation."`;

    return promptTemplate;
  }

  /**
   * Call GPT-4 Vision API
   */
  private async callGPT4Vision(imageUrl: string, prompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const description = response.choices[0].message.content?.trim();

    if (!description) {
      throw new Error('No description generated by AI');
    }

    return description;
  }

  /**
   * Update photo with enhanced description
   */
  private async updatePhotoDescription(
    photoId: string,
    description: string,
    metadata: { model: string; cost: number }
  ): Promise<void> {
    await prisma.inspectionPhoto.update({
      where: { id: photoId },
      data: {
        description,
        aiEnhanced: true,
        aiEnhancedAt: new Date(),
        aiModel: metadata.model,
      },
    });
  }

  /**
   * Log enhancement to database
   */
  private async logEnhancement(data: {
    photoId: string;
    reportId: string;
    prompt: string;
    originalDesc: string | null;
    enhancedDesc: string;
    model: string;
    tokensUsed: number;
    costUSD: number;
    processingMs: number;
    success: boolean;
    error?: string;
    tenantId?: string | null;
  }): Promise<void> {
    await prisma.aIImageEnhancementLog.create({
      data: {
        photoId: data.photoId,
        reportId: data.reportId,
        prompt: data.prompt,
        originalDesc: data.originalDesc,
        enhancedDesc: data.enhancedDesc,
        model: data.model,
        tokensUsed: data.tokensUsed,
        costUSD: data.costUSD,
        processingMs: data.processingMs,
        success: data.success,
        error: data.error,
        tenantId: data.tenantId,
      },
    });
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(prompt: string, response: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil((prompt.length + response.length) / 4);
  }

  /**
   * Calculate cost based on GPT-4o pricing
   */
  private calculateCost(prompt: string, response: string): number {
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(response.length / 4);

    // GPT-4o pricing (as of 2025)
    const inputCostPer1M = 2.5; // $2.50 per 1M input tokens
    const outputCostPer1M = 10.0; // $10.00 per 1M output tokens

    const inputCost = (inputTokens / 1_000_000) * inputCostPer1M;
    const outputCost = (outputTokens / 1_000_000) * outputCostPer1M;

    return inputCost + outputCost;
  }
}
