import { GoogleGenerativeAI } from '@google/generative-ai'
import { getLanguageByCode } from '@/lib/translation/languages'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_AI_API_KEY || '')

// Use gemini-1.5-flash for translation — fast, cheap, 140+ language support
// Gemma 4 26B is the on-device model; server-side we use Gemini for reliability
const MODEL_NAME = 'gemini-1.5-flash'

export interface TranslateRequest {
  text: string
  targetLanguage: string       // BCP-47 code e.g. 'zh-CN', 'ar'
  sourceLanguage?: string      // defaults to 'en'
  context?: 'disaster' | 'contractor' | 'general'
}

export interface TranslateResponse {
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  targetLanguageName: string
  isRtl: boolean
  model: string
}

// Context-aware system prompts for disaster recovery domain
const CONTEXT_PROMPTS: Record<string, string> = {
  disaster: 'You are translating urgent disaster recovery communications. Preserve technical terms like water damage, mould remediation, structural drying, insurance claim, assessor. Be precise and clear.',
  contractor: 'You are translating contractor coordination messages. Preserve technical restoration terms, job status, and measurement units.',
  general: 'You are translating content for an Australian disaster recovery platform.',
}

export async function translateText(req: TranslateRequest): Promise<TranslateResponse> {
  const { text, targetLanguage, sourceLanguage = 'en', context = 'general' } = req

  // No-op for English
  if (targetLanguage === 'en' || targetLanguage === sourceLanguage) {
    return {
      translatedText: text,
      sourceLanguage,
      targetLanguage,
      targetLanguageName: 'English',
      isRtl: false,
      model: 'passthrough',
    }
  }

  const lang = getLanguageByCode(targetLanguage)
  const langName = lang?.name || targetLanguage
  const systemContext = CONTEXT_PROMPTS[context] || CONTEXT_PROMPTS.general

  const model = genAI.getGenerativeModel({ model: MODEL_NAME })

  const prompt = `${systemContext}

Translate the following text from ${sourceLanguage === 'en' ? 'English' : sourceLanguage} to ${langName} (language code: ${targetLanguage}).

Return ONLY the translated text with no explanation, no quotes, no prefix like "Translation:".

Text to translate:
${text}`

  const result = await model.generateContent(prompt)
  const translatedText = result.response.text().trim()

  return {
    translatedText,
    sourceLanguage,
    targetLanguage,
    targetLanguageName: langName,
    isRtl: lang?.rtl ?? false,
    model: MODEL_NAME,
  }
}

/**
 * Batch translate multiple strings to one target language.
 * Used for UI string translation.
 */
export async function batchTranslate(
  texts: string[],
  targetLanguage: string,
  context: TranslateRequest['context'] = 'general'
): Promise<string[]> {
  if (targetLanguage === 'en') return texts

  const lang = getLanguageByCode(targetLanguage)
  const langName = lang?.name || targetLanguage
  const systemContext = CONTEXT_PROMPTS[context] || CONTEXT_PROMPTS.general

  const model = genAI.getGenerativeModel({ model: MODEL_NAME })

  const numbered = texts.map((t, i) => `${i + 1}. ${t}`).join('\n')

  const prompt = `${systemContext}

Translate each numbered item from English to ${langName} (${targetLanguage}).
Return ONLY the translations in the same numbered format. No explanations.

${numbered}`

  const result = await model.generateContent(prompt)
  const raw = result.response.text().trim()

  // Parse numbered response back to array
  const lines = raw.split('\n').filter((l: string) => l.trim())
  return lines.map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
}

/**
 * Offline fallback for low-connectivity disaster scenarios.
 * Returns basic phrase mappings for critical emergency terms.
 */
export const OFFLINE_PHRASES: Record<string, Record<string, string>> = {
  'zh-CN': {
    'We are here to help': '我们来帮助您',
    'Insurance claim': '保险索赔',
    'Water damage': '水损',
    'Emergency': '紧急',
    'Call us': '致电我们',
  },
  'ar': {
    'We are here to help': 'نحن هنا للمساعدة',
    'Insurance claim': 'مطالبة تأمين',
    'Water damage': 'أضرار المياه',
    'Emergency': 'طوارئ',
    'Call us': 'اتصل بنا',
  },
  'vi': {
    'We are here to help': 'Chúng tôi ở đây để giúp đỡ',
    'Insurance claim': 'Yêu cầu bảo hiểm',
    'Water damage': 'Hư hại do nước',
    'Emergency': 'Khẩn cấp',
    'Call us': 'Gọi cho chúng tôi',
  },
  'hi': {
    'We are here to help': 'हम यहाँ मदद के लिए हैं',
    'Insurance claim': 'बीमा दावा',
    'Water damage': 'पानी की क्षति',
    'Emergency': 'आपातकाल',
    'Call us': 'हमें कॉल करें',
  },
}
