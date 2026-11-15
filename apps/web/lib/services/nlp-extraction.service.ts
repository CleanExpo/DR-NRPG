/**
 * NLP Extraction Service
 *
 * Phase D.3: Natural Language Processing for claim processing enhancement
 *
 * Features:
 * - Named Entity Recognition (NER) for locations, dates, amounts, insurance providers
 * - Multi-language support with auto-detection and translation
 * - Document text extraction and structured parsing
 * - Damage description analysis and classification
 */

import { getDefaultProvider } from '@/lib/agents/providers';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface ExtractedEntities {
  locations: LocationEntity[];
  dates: DateEntity[];
  amounts: AmountEntity[];
  insuranceProviders: string[];
  damageTypes: string[];
  affectedItems: string[];
  contactInfo: ContactEntity[];
  measurements: MeasurementEntity[];
}

export interface LocationEntity {
  text: string;
  type: 'ADDRESS' | 'SUBURB' | 'STATE' | 'POSTCODE' | 'ROOM' | 'AREA';
  confidence: number;
  normalized?: string;
}

export interface DateEntity {
  text: string;
  type: 'INCIDENT_DATE' | 'DISCOVERY_DATE' | 'REPORT_DATE' | 'APPOINTMENT';
  confidence: number;
  isoDate?: string;
  isApproximate: boolean;
}

export interface AmountEntity {
  text: string;
  value: number;
  currency: 'AUD' | 'USD' | 'OTHER';
  type: 'ESTIMATE' | 'QUOTE' | 'ACTUAL' | 'DEDUCTIBLE' | 'COVERAGE';
  confidence: number;
}

export interface ContactEntity {
  text: string;
  type: 'EMAIL' | 'PHONE' | 'NAME';
  normalized?: string;
}

export interface MeasurementEntity {
  text: string;
  value: number;
  unit: 'SQM' | 'SQF' | 'METRES' | 'FEET' | 'LITRES';
  context?: string;
}

export interface LanguageDetectionResult {
  detectedLanguage: string;
  languageCode: string;
  confidence: number;
  isEnglish: boolean;
  translationNeeded: boolean;
}

export interface TranslationResult {
  originalText: string;
  originalLanguage: string;
  translatedText: string;
  confidence: number;
}

export interface DocumentParseResult {
  documentType: 'INVOICE' | 'QUOTE' | 'REPORT' | 'CERTIFICATE' | 'POLICY' | 'UNKNOWN';
  extractedText: string;
  structuredData: {
    vendor?: string;
    date?: string;
    totalAmount?: number;
    lineItems?: Array<{ description: string; quantity?: number; amount?: number }>;
    referenceNumbers?: string[];
  };
  confidence: number;
}

export interface ClaimNLPAnalysis {
  extractedEntities: ExtractedEntities;
  classifiedDamageType: string;
  damageSubTypes: string[];
  severityIndicators: string[];
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  languageInfo: LanguageDetectionResult;
  recommendations: string[];
  processingTimeMs: number;
}

// ============================================================================
// Constants
// ============================================================================

// Australian insurance providers for entity extraction
const INSURANCE_PROVIDERS = [
  'NRMA', 'Suncorp', 'Allianz', 'QBE', 'IAG', 'CGU', 'AAMI', 'GIO',
  'RACQ', 'RACV', 'Youi', 'Budget Direct', 'Coles', 'Woolworths',
  'CommInsure', 'ANZ', 'NAB', 'Westpac', 'Medibank',
];

// Damage type keywords for classification
const DAMAGE_KEYWORDS: Record<string, string[]> = {
  WATER_DAMAGE: [
    'water', 'flood', 'leak', 'burst pipe', 'overflow', 'rain',
    'storm water', 'wet', 'damp', 'moisture', 'plumbing', 'bathroom',
    'ceiling leak', 'roof leak', 'sewage', 'drainage',
  ],
  FIRE_DAMAGE: [
    'fire', 'smoke', 'burn', 'flames', 'arson', 'electrical fire',
    'kitchen fire', 'bushfire', 'wildfire', 'charred', 'scorched',
  ],
  MOULD: [
    'mould', 'mold', 'fungus', 'mildew', 'black mould', 'toxic',
    'musty', 'spores', 'moisture damage',
  ],
  STORM_DAMAGE: [
    'storm', 'wind', 'hail', 'cyclone', 'tornado', 'lightning',
    'fallen tree', 'roof damage', 'debris', 'gutter',
  ],
  FLOOD_DAMAGE: [
    'flood', 'inundation', 'flash flood', 'river', 'creek',
    'rising water', 'flood water', 'submerged',
  ],
  BIOHAZARD: [
    'biohazard', 'blood', 'bodily fluid', 'hazmat', 'contamination',
    'trauma', 'crime scene', 'hoarding',
  ],
};

// Australian state/territory codes
const AUSTRALIAN_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'];

// Australian phone number patterns
const PHONE_PATTERNS = [
  /\b(?:04\d{2}[\s-]?\d{3}[\s-]?\d{3})\b/, // Mobile
  /\b(?:0[2-9][\s-]?\d{4}[\s-]?\d{4})\b/, // Landline
  /\b(?:13[\d\s]{4,6})\b/, // 13-number
  /\b(?:1300[\s-]?\d{3}[\s-]?\d{3})\b/, // 1300
  /\b(?:1800[\s-]?\d{3}[\s-]?\d{3})\b/, // 1800
];

// ============================================================================
// Core NLP Functions
// ============================================================================

/**
 * Perform comprehensive NLP analysis on claim text
 */
export async function analyseClaimText(
  text: string,
  options: { includeTranslation?: boolean } = {}
): Promise<ClaimNLPAnalysis> {
  const startTime = Date.now();

  // Detect language first
  const languageInfo = await detectLanguage(text);

  // Translate if needed
  let processText = text;
  if (languageInfo.translationNeeded && options.includeTranslation) {
    const translation = await translateToEnglish(text, languageInfo.languageCode);
    processText = translation.translatedText;
  }

  // Extract entities
  const extractedEntities = await extractEntities(processText);

  // Classify damage type
  const { classifiedDamageType, damageSubTypes } = classifyDamageType(processText);

  // Extract severity indicators
  const severityIndicators = extractSeverityIndicators(processText);

  // Determine urgency
  const urgencyLevel = determineUrgency(processText, extractedEntities, severityIndicators);

  // Generate recommendations
  const recommendations = generateNLPRecommendations(
    extractedEntities,
    classifiedDamageType,
    urgencyLevel
  );

  return {
    extractedEntities,
    classifiedDamageType,
    damageSubTypes,
    severityIndicators,
    urgencyLevel,
    languageInfo,
    recommendations,
    processingTimeMs: Date.now() - startTime,
  };
}

/**
 * Extract named entities from text
 */
export async function extractEntities(text: string): Promise<ExtractedEntities> {
  // Rule-based extraction first
  const ruleBasedEntities = extractEntitiesRuleBased(text);

  // Enhance with LLM for complex extraction
  const llmEntities = await extractEntitiesWithLLM(text);

  // Merge results
  return mergeEntities(ruleBasedEntities, llmEntities);
}

/**
 * Rule-based entity extraction
 */
function extractEntitiesRuleBased(text: string): ExtractedEntities {
  const locations: LocationEntity[] = [];
  const dates: DateEntity[] = [];
  const amounts: AmountEntity[] = [];
  const insuranceProviders: string[] = [];
  const damageTypes: string[] = [];
  const affectedItems: string[] = [];
  const contactInfo: ContactEntity[] = [];
  const measurements: MeasurementEntity[] = [];

  const lowerText = text.toLowerCase();

  // Extract Australian postcodes (4 digits)
  const postcodeMatches = text.match(/\b\d{4}\b/g) || [];
  for (const match of postcodeMatches) {
    const num = parseInt(match);
    // Valid Australian postcode ranges
    if ((num >= 2000 && num <= 2999) || // NSW
        (num >= 3000 && num <= 3999) || // VIC
        (num >= 4000 && num <= 4999) || // QLD
        (num >= 5000 && num <= 5999) || // SA
        (num >= 6000 && num <= 6999) || // WA
        (num >= 7000 && num <= 7999) || // TAS
        (num >= 800 && num <= 899)) {   // NT
      locations.push({
        text: match,
        type: 'POSTCODE',
        confidence: 0.8,
      });
    }
  }

  // Extract Australian states
  for (const state of AUSTRALIAN_STATES) {
    if (text.includes(state) || lowerText.includes(state.toLowerCase())) {
      locations.push({
        text: state,
        type: 'STATE',
        confidence: 0.9,
        normalized: state,
      });
    }
  }

  // Extract insurance providers
  for (const provider of INSURANCE_PROVIDERS) {
    if (lowerText.includes(provider.toLowerCase())) {
      insuranceProviders.push(provider);
    }
  }

  // Extract dollar amounts (AUD)
  const amountMatches = text.match(/\$[\d,]+(?:\.\d{2})?/g) || [];
  for (const match of amountMatches) {
    const value = parseFloat(match.replace(/[$,]/g, ''));
    amounts.push({
      text: match,
      value,
      currency: 'AUD',
      type: lowerText.includes('quote') ? 'QUOTE' :
            lowerText.includes('estimate') ? 'ESTIMATE' : 'ACTUAL',
      confidence: 0.85,
    });
  }

  // Extract dates
  const datePatterns = [
    /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/g, // DD/MM/YYYY or DD-MM-YYYY
    /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{2,4})\b/gi,
  ];

  for (const pattern of datePatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      dates.push({
        text: match[0],
        type: 'INCIDENT_DATE',
        confidence: 0.7,
        isApproximate: false,
      });
    }
  }

  // Extract relative dates
  const relativeDatePatterns = [
    { pattern: /yesterday/i, days: -1 },
    { pattern: /today/i, days: 0 },
    { pattern: /last\s+week/i, days: -7 },
    { pattern: /(\d+)\s+days?\s+ago/i, multiplier: -1 },
    { pattern: /this\s+morning/i, days: 0 },
  ];

  for (const { pattern } of relativeDatePatterns) {
    const match = text.match(pattern);
    if (match) {
      dates.push({
        text: match[0],
        type: 'INCIDENT_DATE',
        confidence: 0.6,
        isApproximate: true,
      });
    }
  }

  // Extract phone numbers
  for (const pattern of PHONE_PATTERNS) {
    const matches = text.match(pattern) || [];
    for (const match of matches) {
      contactInfo.push({
        text: match,
        type: 'PHONE',
        normalized: match.replace(/[\s-]/g, ''),
      });
    }
  }

  // Extract email addresses
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emailMatches = text.match(emailPattern) || [];
  for (const match of emailMatches) {
    contactInfo.push({
      text: match,
      type: 'EMAIL',
      normalized: match.toLowerCase(),
    });
  }

  // Extract measurements
  const measurementPatterns = [
    { pattern: /(\d+(?:\.\d+)?)\s*(?:sqm|sq\.?\s*m(?:etres?)?|m²)/gi, unit: 'SQM' as const },
    { pattern: /(\d+(?:\.\d+)?)\s*(?:square\s+metres?)/gi, unit: 'SQM' as const },
    { pattern: /(\d+(?:\.\d+)?)\s*(?:sqf|sq\.?\s*f(?:eet|t)?|ft²)/gi, unit: 'SQF' as const },
    { pattern: /(\d+(?:\.\d+)?)\s*(?:metres?|m)\b/gi, unit: 'METRES' as const },
    { pattern: /(\d+(?:\.\d+)?)\s*(?:litres?|L)\b/gi, unit: 'LITRES' as const },
  ];

  for (const { pattern, unit } of measurementPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      measurements.push({
        text: match[0],
        value: parseFloat(match[1]),
        unit,
      });
    }
  }

  // Extract damage types
  for (const [type, keywords] of Object.entries(DAMAGE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        if (!damageTypes.includes(type)) {
          damageTypes.push(type);
        }
        break;
      }
    }
  }

  // Extract room names / affected areas
  const roomPatterns = [
    /\b(kitchen|bathroom|bedroom|living\s+room|lounge|dining\s+room|garage|laundry|toilet|ensuite|study|office|hallway|corridor|basement|attic|roof|ceiling|wall|floor)\b/gi,
  ];

  for (const pattern of roomPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const item = match[0].toLowerCase();
      if (!affectedItems.includes(item)) {
        affectedItems.push(item);
        locations.push({
          text: match[0],
          type: 'ROOM',
          confidence: 0.85,
        });
      }
    }
  }

  return {
    locations,
    dates,
    amounts,
    insuranceProviders,
    damageTypes,
    affectedItems,
    contactInfo,
    measurements,
  };
}

/**
 * LLM-enhanced entity extraction for complex cases
 */
async function extractEntitiesWithLLM(text: string): Promise<ExtractedEntities> {
  try {
    const provider = await getDefaultProvider();
    const model = provider.getModel();

    const prompt = `Extract entities from this Australian insurance claim text. Return ONLY valid JSON.

TEXT:
${text.substring(0, 2000)}

Extract and return:
{
  "locations": [{"text": "exact text", "type": "ADDRESS|SUBURB|STATE|POSTCODE|ROOM", "normalized": "clean version"}],
  "dates": [{"text": "exact text", "type": "INCIDENT_DATE|DISCOVERY_DATE", "isoDate": "YYYY-MM-DD if determinable", "isApproximate": true/false}],
  "amounts": [{"text": "$X,XXX", "value": number, "type": "ESTIMATE|QUOTE|ACTUAL"}],
  "insuranceProviders": ["provider names"],
  "damageTypes": ["WATER_DAMAGE", "FIRE_DAMAGE", "MOULD", "STORM_DAMAGE", "FLOOD_DAMAGE", "BIOHAZARD"],
  "affectedItems": ["specific items damaged"],
  "measurements": [{"text": "X sqm", "value": number, "unit": "SQM|METRES"}]
}`;

    const response = await model.invoke([
      new SystemMessage('You are an NLP extraction specialist. Extract entities precisely. Use Australian context.'),
      new HumanMessage(prompt),
    ]);

    const content = typeof response.content === 'string' ? response.content : '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        locations: (parsed.locations || []).map((l: any) => ({ ...l, confidence: 0.8 })),
        dates: (parsed.dates || []).map((d: any) => ({ ...d, confidence: 0.75 })),
        amounts: (parsed.amounts || []).map((a: any) => ({ ...a, currency: 'AUD', confidence: 0.8 })),
        insuranceProviders: parsed.insuranceProviders || [],
        damageTypes: parsed.damageTypes || [],
        affectedItems: parsed.affectedItems || [],
        contactInfo: [],
        measurements: (parsed.measurements || []).map((m: any) => ({ ...m, confidence: 0.75 })),
      };
    }

    return createEmptyEntities();
  } catch (error) {
    console.error('LLM entity extraction error:', error);
    return createEmptyEntities();
  }
}

/**
 * Merge rule-based and LLM entities
 */
function mergeEntities(
  ruleBased: ExtractedEntities,
  llmBased: ExtractedEntities
): ExtractedEntities {
  // Prefer rule-based for simple patterns, add LLM for complex ones
  return {
    locations: deduplicateEntities([...ruleBased.locations, ...llmBased.locations]),
    dates: deduplicateEntities([...ruleBased.dates, ...llmBased.dates]),
    amounts: deduplicateAmounts([...ruleBased.amounts, ...llmBased.amounts]),
    insuranceProviders: [...new Set([...ruleBased.insuranceProviders, ...llmBased.insuranceProviders])],
    damageTypes: [...new Set([...ruleBased.damageTypes, ...llmBased.damageTypes])],
    affectedItems: [...new Set([...ruleBased.affectedItems, ...llmBased.affectedItems])],
    contactInfo: ruleBased.contactInfo, // Rule-based is more reliable for contact info
    measurements: deduplicateEntities([...ruleBased.measurements, ...llmBased.measurements]),
  };
}

function deduplicateEntities<T extends { text: string }>(entities: T[]): T[] {
  const seen = new Set<string>();
  return entities.filter((e) => {
    const key = e.text.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function deduplicateAmounts(amounts: AmountEntity[]): AmountEntity[] {
  const seen = new Set<number>();
  return amounts.filter((a) => {
    if (seen.has(a.value)) return false;
    seen.add(a.value);
    return true;
  });
}

// ============================================================================
// Language Detection and Translation
// ============================================================================

/**
 * Detect language of text
 */
export async function detectLanguage(text: string): Promise<LanguageDetectionResult> {
  // Simple heuristic first - check for common non-English patterns
  const sample = text.substring(0, 500).toLowerCase();

  // Common language indicators
  const languageIndicators: Record<string, string[]> = {
    'zh': ['的', '是', '在', '我', '有', '这'],
    'vi': ['của', 'và', 'là', 'trong', 'được', 'cho'],
    'ar': ['في', 'من', 'على', 'إلى', 'أن', 'هذا'],
    'ko': ['의', '를', '이', '에', '는', '가'],
    'ja': ['の', 'は', 'が', 'に', 'を', 'で'],
    'hi': ['का', 'की', 'के', 'है', 'में', 'और'],
    'el': ['και', 'το', 'να', 'είναι', 'για', 'με'],
  };

  for (const [lang, indicators] of Object.entries(languageIndicators)) {
    if (indicators.some((ind) => sample.includes(ind))) {
      return {
        detectedLanguage: getLanguageName(lang),
        languageCode: lang,
        confidence: 0.8,
        isEnglish: false,
        translationNeeded: true,
      };
    }
  }

  // Check for English indicators
  const englishWords = ['the', 'is', 'and', 'of', 'to', 'in', 'that', 'was', 'for'];
  const englishCount = englishWords.filter((w) => sample.includes(w)).length;

  if (englishCount >= 3) {
    return {
      detectedLanguage: 'English',
      languageCode: 'en',
      confidence: 0.9,
      isEnglish: true,
      translationNeeded: false,
    };
  }

  // Default to English with lower confidence
  return {
    detectedLanguage: 'English',
    languageCode: 'en',
    confidence: 0.5,
    isEnglish: true,
    translationNeeded: false,
  };
}

function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    'en': 'English',
    'zh': 'Chinese',
    'vi': 'Vietnamese',
    'ar': 'Arabic',
    'ko': 'Korean',
    'ja': 'Japanese',
    'hi': 'Hindi',
    'el': 'Greek',
  };
  return names[code] || 'Unknown';
}

/**
 * Translate text to English using LLM
 */
export async function translateToEnglish(
  text: string,
  sourceLanguage: string
): Promise<TranslationResult> {
  try {
    const provider = await getDefaultProvider();
    const model = provider.getModel();

    const prompt = `Translate the following ${getLanguageName(sourceLanguage)} text to Australian English.
Preserve all names, numbers, dates, and technical terms.

TEXT:
${text}

Provide ONLY the English translation, nothing else.`;

    const response = await model.invoke([
      new SystemMessage('You are a professional translator. Translate accurately to Australian English.'),
      new HumanMessage(prompt),
    ]);

    const translatedText = typeof response.content === 'string'
      ? response.content.trim()
      : text;

    return {
      originalText: text,
      originalLanguage: getLanguageName(sourceLanguage),
      translatedText,
      confidence: 0.85,
    };
  } catch (error) {
    console.error('Translation error:', error);
    return {
      originalText: text,
      originalLanguage: getLanguageName(sourceLanguage),
      translatedText: text,
      confidence: 0,
    };
  }
}

// ============================================================================
// Document Parsing
// ============================================================================

/**
 * Parse document text and extract structured data
 */
export async function parseDocumentText(
  text: string,
  documentHint?: string
): Promise<DocumentParseResult> {
  try {
    const provider = await getDefaultProvider();
    const model = provider.getModel();

    const prompt = `Parse this document and extract structured information.
${documentHint ? `Document type hint: ${documentHint}` : ''}

DOCUMENT TEXT:
${text.substring(0, 3000)}

Extract and return ONLY valid JSON:
{
  "documentType": "INVOICE|QUOTE|REPORT|CERTIFICATE|POLICY|UNKNOWN",
  "vendor": "business name if found",
  "date": "YYYY-MM-DD if found",
  "totalAmount": number if found,
  "lineItems": [{"description": "item", "quantity": number, "amount": number}],
  "referenceNumbers": ["any reference/invoice/quote numbers"]
}`;

    const response = await model.invoke([
      new SystemMessage('You are a document parsing specialist. Extract structured data accurately.'),
      new HumanMessage(prompt),
    ]);

    const content = typeof response.content === 'string' ? response.content : '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        documentType: parsed.documentType || 'UNKNOWN',
        extractedText: text,
        structuredData: {
          vendor: parsed.vendor,
          date: parsed.date,
          totalAmount: parsed.totalAmount,
          lineItems: parsed.lineItems,
          referenceNumbers: parsed.referenceNumbers,
        },
        confidence: 0.75,
      };
    }

    return {
      documentType: 'UNKNOWN',
      extractedText: text,
      structuredData: {},
      confidence: 0.3,
    };
  } catch (error) {
    console.error('Document parsing error:', error);
    return {
      documentType: 'UNKNOWN',
      extractedText: text,
      structuredData: {},
      confidence: 0,
    };
  }
}

// ============================================================================
// Classification and Analysis Functions
// ============================================================================

/**
 * Classify damage type from text
 */
function classifyDamageType(text: string): {
  classifiedDamageType: string;
  damageSubTypes: string[];
} {
  const lowerText = text.toLowerCase();
  const scores: Record<string, number> = {};
  const subTypes: string[] = [];

  for (const [type, keywords] of Object.entries(DAMAGE_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score += keyword.length; // Longer matches score higher
        if (!subTypes.includes(keyword)) {
          subTypes.push(keyword);
        }
      }
    }
    if (score > 0) {
      scores[type] = score;
    }
  }

  // Find highest scoring type
  let maxType = 'UNKNOWN';
  let maxScore = 0;
  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxType = type;
    }
  }

  return {
    classifiedDamageType: maxType,
    damageSubTypes: subTypes.slice(0, 5),
  };
}

/**
 * Extract severity indicators from text
 */
function extractSeverityIndicators(text: string): string[] {
  const indicators: string[] = [];
  const lowerText = text.toLowerCase();

  const severityPatterns: Record<string, string[]> = {
    critical: [
      'emergency', 'urgent', 'immediate', 'danger', 'hazard',
      'severe', 'major', 'significant', 'extensive', 'collapsed',
      'structural damage', 'uninhabitable', 'evacuate',
    ],
    high: [
      'serious', 'substantial', 'considerable', 'widespread',
      'multiple rooms', 'entire', 'whole house', 'flooding',
    ],
    moderate: [
      'moderate', 'partial', 'some damage', 'affected',
      'visible damage', 'leaking',
    ],
    low: [
      'minor', 'small', 'slight', 'limited', 'cosmetic',
      'surface', 'superficial',
    ],
  };

  for (const [severity, patterns] of Object.entries(severityPatterns)) {
    for (const pattern of patterns) {
      if (lowerText.includes(pattern)) {
        indicators.push(`${severity}: ${pattern}`);
      }
    }
  }

  return indicators.slice(0, 10);
}

/**
 * Determine urgency level from analysis
 */
function determineUrgency(
  text: string,
  entities: ExtractedEntities,
  severityIndicators: string[]
): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const lowerText = text.toLowerCase();

  // Check for critical keywords
  const criticalKeywords = ['emergency', 'immediate', 'danger', 'evacuate', 'collapse'];
  if (criticalKeywords.some((k) => lowerText.includes(k))) {
    return 'CRITICAL';
  }

  // Check severity indicators
  const criticalCount = severityIndicators.filter((i) => i.startsWith('critical')).length;
  const highCount = severityIndicators.filter((i) => i.startsWith('high')).length;

  if (criticalCount >= 2) return 'CRITICAL';
  if (criticalCount >= 1 || highCount >= 2) return 'HIGH';
  if (highCount >= 1) return 'MEDIUM';

  // Check for biohazard
  if (entities.damageTypes.includes('BIOHAZARD')) {
    return 'HIGH';
  }

  // Check for active water
  if (lowerText.includes('still leaking') || lowerText.includes('water running')) {
    return 'HIGH';
  }

  return 'LOW';
}

/**
 * Generate recommendations based on NLP analysis
 */
function generateNLPRecommendations(
  entities: ExtractedEntities,
  damageType: string,
  urgency: string
): string[] {
  const recommendations: string[] = [];

  // Urgency-based recommendations
  if (urgency === 'CRITICAL') {
    recommendations.push('Immediate professional assessment required');
    recommendations.push('Contact emergency services if safety is at risk');
  }

  // Damage type recommendations
  if (damageType === 'WATER_DAMAGE') {
    recommendations.push('Stop water source if possible');
    recommendations.push('Begin drying within 24-48 hours to prevent mould');
  } else if (damageType === 'FIRE_DAMAGE') {
    recommendations.push('Do not enter property until cleared by fire services');
    recommendations.push('Document all damage before cleanup');
  } else if (damageType === 'MOULD') {
    recommendations.push('Professional mould assessment recommended');
    recommendations.push('Remediation compliant with industry standards required');
  }

  // Insurance recommendations
  if (entities.insuranceProviders.length > 0) {
    recommendations.push(`Contact ${entities.insuranceProviders[0]} claims department`);
  }

  // Documentation recommendations
  if (entities.amounts.length === 0) {
    recommendations.push('Obtain professional repair quotes');
  }

  return recommendations.slice(0, 5);
}

/**
 * Create empty entities object
 */
function createEmptyEntities(): ExtractedEntities {
  return {
    locations: [],
    dates: [],
    amounts: [],
    insuranceProviders: [],
    damageTypes: [],
    affectedItems: [],
    contactInfo: [],
    measurements: [],
  };
}
