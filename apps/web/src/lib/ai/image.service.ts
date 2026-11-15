// apps/web/src/lib/ai/image.service.ts
// DR-484: Gemini image generation service for disaster restoration context
// Uses Imagen 3 via Google AI for generating property/restoration imagery
// NOTE: @google/generative-ai v0.24.1 does not include Imagen types — using REST API directly.

const IMAGEN_MODEL = 'imagen-3.0-generate-002'
const IMAGEN_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGEN_MODEL}:predict`

// ---------------------------------------------------------------------------
// Public Interfaces
// ---------------------------------------------------------------------------

export interface ImageGenerateRequest {
  prompt: string
  count?: number           // 1–4 images per request
  aspectRatio?: '1:1' | '16:9' | '4:3' | '3:4'
}

export interface ImageGenerateResponse {
  images: Array<{ base64: string; mimeType: string }>
  prompt: string
  model: string
}

// ---------------------------------------------------------------------------
// Restoration prompt templates
// ---------------------------------------------------------------------------

type DamageType = 'water' | 'fire' | 'cyclone' | 'mould' | 'biohazard'
type Stage = 'before' | 'during' | 'after'

const RESTORATION_PROMPTS: Record<DamageType, Record<Stage, string>> = {
  water: {
    before:
      'Professional photograph of water-damaged residential property interior, wet flooring, water stains on walls, realistic disaster assessment, Australian home',
    during:
      'Professional photograph of water damage restoration in progress, industrial dehumidifiers and air movers operating, drying equipment, qualified crew working, Australian residential property',
    after:
      'Professional photograph of fully restored residential interior, new flooring, fresh paintwork, clean and dry, Australian home renovation',
  },
  fire: {
    before:
      'Professional photograph of fire-damaged property exterior, structural damage assessment, charred walls and roof, emergency restoration site, Australian home',
    during:
      'Professional photograph of fire damage restoration in progress, debris removal, structural drying, remediation crew in PPE, Australian residential property',
    after:
      'Professional photograph of fully restored property after fire damage, fresh exterior paintwork, new roofing, clean landscaping, Australian home',
  },
  cyclone: {
    before:
      'Aerial photograph of cyclone-damaged residential property, missing roof sections, debris, North Queensland tropical setting',
    during:
      'Professional photograph of cyclone damage restoration in progress, roof tarping, structural assessment, restoration crew, North Queensland tropical setting',
    after:
      'Professional photograph of cyclone-damaged property fully restored, new roof, repaired exterior, tropical garden, North Queensland home',
  },
  mould: {
    before:
      'Professional photograph of severe mould infestation in residential property, black mould on walls and ceiling, realistic damage assessment, Australian home interior',
    during:
      'Professional photograph of mould remediation in progress, crew in full PPE, HEPA filtration units operating, containment barriers, Australian residential property',
    after:
      'Professional photograph of mould-remediated residential interior, clean white walls, fresh air, bright lighting, Australian home interior',
  },
  biohazard: {
    before:
      'Professional photograph of biohazard scene requiring specialist remediation, contaminated residential property interior, restricted access signage, realistic damage assessment',
    during:
      'Professional photograph of biohazard remediation in progress, specialist crew in full PPE, industrial cleaning equipment, sealed containment, residential property',
    after:
      'Professional photograph of fully decontaminated and restored residential property interior, clean and safe environment, fresh paintwork, Australian home',
  },
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Returns true if the Google Generative AI API key is configured.
 */
export function isImageGenerationAvailable(): boolean {
  return Boolean(process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_AI_API_KEY)
}

// ---------------------------------------------------------------------------
// Core generation function
// ---------------------------------------------------------------------------

/**
 * Generates images using Imagen 3 via the Google AI REST API.
 */
export async function generateImage(req: ImageGenerateRequest): Promise<ImageGenerateResponse> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_AI_API_KEY

  if (!apiKey) {
    throw new Error('Image generation failed: GOOGLE_GENAI_API_KEY is not configured')
  }

  const sampleCount = Math.min(Math.max(req.count ?? 1, 1), 4)
  const aspectRatio = req.aspectRatio ?? '1:1'

  const requestBody = {
    instances: [{ prompt: req.prompt }],
    parameters: {
      sampleCount,
      aspectRatio,
    },
  }

  const response = await fetch(`${IMAGEN_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(
      `Image generation failed: HTTP ${response.status} from Imagen API — ${errorText}`
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await response.json()

  // Imagen response shape: { predictions: [{ bytesBase64Encoded: string, mimeType: string }] }
  if (!data?.predictions || !Array.isArray(data.predictions) || data.predictions.length === 0) {
    throw new Error('Image generation failed: No images returned from Imagen API')
  }

  const images: Array<{ base64: string; mimeType: string }> = data.predictions.map(
    (pred: { bytesBase64Encoded?: string; mimeType?: string }) => ({
      base64: pred.bytesBase64Encoded ?? '',
      mimeType: pred.mimeType ?? 'image/png',
    })
  )

  return {
    images,
    prompt: req.prompt,
    model: IMAGEN_MODEL,
  }
}

// ---------------------------------------------------------------------------
// Domain-specific helper
// ---------------------------------------------------------------------------

/**
 * Generates a professional restoration image for a given damage type and stage.
 * Auto-constructs a contextually appropriate prompt.
 */
export async function generateRestorationImage(
  damageType: DamageType,
  stage: Stage
): Promise<ImageGenerateResponse> {
  const prompt = RESTORATION_PROMPTS[damageType]?.[stage]

  if (!prompt) {
    throw new Error(
      `No prompt template found for damageType="${damageType}" stage="${stage}"`
    )
  }

  return generateImage({ prompt, count: 1, aspectRatio: '16:9' })
}
