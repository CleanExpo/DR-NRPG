/**
 * Schema Content Generator
 *
 * Generates SEO-optimized structured data (JSON-LD schemas) for:
 * - FAQPage (disaster recovery service FAQs)
 * - HowTo (step-by-step disaster recovery guides)
 * - Service (specific service descriptions)
 * - LocalBusiness (organizational information)
 * - Organization (company structure and details)
 *
 * All schema content is brand-aligned and optimized for search engines.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getBrandContextString } from './brand-guidelines';

export type SchemaType = 'FAQPage' | 'HowTo' | 'Service' | 'LocalBusiness' | 'Organization' | 'BreadcrumbList';

export interface FAQSchema {
  '@context': string;
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

export interface HowToSchema {
  '@context': string;
  '@type': 'HowTo';
  name: string;
  description: string;
  step: Array<{
    '@type': 'HowToStep';
    name: string;
    text: string;
  }>;
}

export interface ServiceSchema {
  '@context': string;
  '@type': 'Service';
  name: string;
  description: string;
  provider: {
    '@type': 'Organization';
    name: string;
  };
  areaServed: string[];
  availableChannel: {
    '@type': 'ServiceChannel';
    serviceUrl: string;
    availableLanguage: string[];
  };
}

export interface LocalBusinessSchema {
  '@context': string;
  '@type': 'LocalBusiness';
  name: string;
  description: string;
  address: {
    '@type': 'PostalAddress';
    addressCountry: string;
  };
  telephone: string;
  email: string;
  url: string;
  areaServed: string[];
  priceRange: string;
}

export interface OrganizationSchema {
  '@context': string;
  '@type': 'Organization';
  name: string;
  description: string;
  url: string;
  logo: string;
  sameAs: string[];
  contactPoint: {
    '@type': 'ContactPoint';
    contactType: string;
    telephone: string;
    email: string;
  };
}

export interface GeneratedSchema {
  type: SchemaType;
  topic: string;
  schema: any;
  tokensUsed: number;
  generatedAt: Date;
}

class SchemaContentGenerator {
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
   * Generate FAQ schema for a topic
   */
  async generateFAQSchema(topic: string, questionCount: number = 5): Promise<GeneratedSchema> {
    const prompt = `
${getBrandContextString('insurance')}

TASK: Generate a FAQPage JSON-LD schema for "${topic}".

TOPIC: ${topic}
QUESTION COUNT: ${questionCount} Q&A pairs

REQUIREMENTS:
1. Generate ${questionCount} realistic, common questions about the topic
2. Provide clear, helpful answers (3-5 sentences each)
3. Include NRPG brand keywords naturally
4. Cover diverse aspects of the topic
5. Answers should be SEO-optimized but natural
6. Use Australian spelling/context where relevant

OUTPUT FORMAT (Valid JSON-LD):
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "...",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "..."
      }
    },
    ...
  ]
}

Generate ONLY the JSON object, no markdown or explanation.
`;

    try {
      const response = await this.model.generateContent(prompt);
      let jsonText = response.response.text().trim();

      if (jsonText.includes('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      const schema = JSON.parse(jsonText);

      return {
        type: 'FAQPage',
        topic,
        schema,
        tokensUsed: response.response.usageMetadata?.totalTokenCount || 0,
        generatedAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to generate FAQ schema: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate HowTo schema for a process
   */
  async generateHowToSchema(process: string, stepCount: number = 5): Promise<GeneratedSchema> {
    const prompt = `
${getBrandContextString('insurance')}

TASK: Generate a HowTo JSON-LD schema for "${process}".

PROCESS: ${process}
STEP COUNT: ${stepCount} steps

REQUIREMENTS:
1. Create a logical ${stepCount}-step process guide
2. Include NRPG context where relevant (e.g., "Call NRPG", "provide details to IICRC contractor")
3. Each step should be 1-3 sentences, actionable
4. Include professional terminology
5. Assume user is in emergency/crisis context (if applicable)
6. Steps should be clear and sequential

OUTPUT FORMAT (Valid JSON-LD):
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "...",
  "description": "...",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Step 1: ...",
      "text": "..."
    },
    ...
  ]
}

Generate ONLY the JSON object, no markdown or explanation.
`;

    try {
      const response = await this.model.generateContent(prompt);
      let jsonText = response.response.text().trim();

      if (jsonText.includes('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      const schema = JSON.parse(jsonText);

      return {
        type: 'HowTo',
        topic: process,
        schema,
        tokensUsed: response.response.usageMetadata?.totalTokenCount || 0,
        generatedAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to generate HowTo schema: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate Service schema
   */
  async generateServiceSchema(serviceName: string, serviceType: string): Promise<GeneratedSchema> {
    const prompt = `
${getBrandContextString('insurance')}

TASK: Generate a Service JSON-LD schema for NRPG service offering.

SERVICE NAME: ${serviceName}
SERVICE TYPE: ${serviceType}

REQUIREMENTS:
1. Create professional service description (2-3 sentences)
2. Include areas served (Australian states: NSW, VIC, QLD, WA, SA, TAS, ACT, NT)
3. Include professional language
4. Highlight NRPG differentiators (24/7, qualified, insured)
5. Set serviceUrl to NRPG domain (placeholder: https://disasterrecovery-seven.vercel.app)

OUTPUT FORMAT (Valid JSON-LD):
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "...",
  "description": "...",
  "provider": {
    "@type": "Organization",
    "name": "NRPG (National Restoration Platform Group)"
  },
  "areaServed": ["NSW", "VIC", "QLD", ...],
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceUrl": "...",
    "availableLanguage": ["en-AU"]
  }
}

Generate ONLY the JSON object, no markdown or explanation.
`;

    try {
      const response = await this.model.generateContent(prompt);
      let jsonText = response.response.text().trim();

      if (jsonText.includes('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      const schema = JSON.parse(jsonText);

      return {
        type: 'Service',
        topic: serviceName,
        schema,
        tokensUsed: response.response.usageMetadata?.totalTokenCount || 0,
        generatedAt: new Date(),
      };
    } catch (error) {
      throw new Error(
        `Failed to generate Service schema: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate LocalBusiness schema
   */
  async generateLocalBusinessSchema(): Promise<GeneratedSchema> {
    const prompt = `
${getBrandContextString('insurance')}

TASK: Generate a LocalBusiness JSON-LD schema for NRPG.

REQUIREMENTS:
1. Use official NRPG name: "NRPG (National Restoration Platform Group)"
2. Create 2-3 sentence professional description
3. Include contact: support@disasterrecovery.com.au (no phone per guidelines)
4. Serve all Australian states
5. Price range: $$$ (premium professional service)

OUTPUT FORMAT (Valid JSON-LD):
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "...",
  "description": "...",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "AU"
  },
  "telephone": "...",
  "email": "...",
  "url": "...",
  "areaServed": ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"],
  "priceRange": "$$"
}

Generate ONLY the JSON object, no markdown or explanation.
`;

    try {
      const response = await this.model.generateContent(prompt);
      let jsonText = response.response.text().trim();

      if (jsonText.includes('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      const schema = JSON.parse(jsonText);

      return {
        type: 'LocalBusiness',
        topic: 'NRPG Local Business',
        schema,
        tokensUsed: response.response.usageMetadata?.totalTokenCount || 0,
        generatedAt: new Date(),
      };
    } catch (error) {
      throw new Error(
        `Failed to generate LocalBusiness schema: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate Organization schema
   */
  async generateOrganizationSchema(): Promise<GeneratedSchema> {
    const prompt = `
${getBrandContextString('insurance')}

TASK: Generate an Organization JSON-LD schema for NRPG.

REQUIREMENTS:
1. Name: NRPG (National Restoration Platform Group)
2. Create 2-3 sentence description
3. URL: https://disasterrecovery.com.au
4. Logo: https://disasterrecovery.com.au/logo.png (placeholder)
5. Contact: support@disasterrecovery.com.au
6. Social profiles (placeholder URLs)

OUTPUT FORMAT (Valid JSON-LD):
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "...",
  "description": "...",
  "url": "...",
  "logo": "...",
  "sameAs": ["https://linkedin.com/company/nrpg", ...],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "telephone": "...",
    "email": "..."
  }
}

Generate ONLY the JSON object, no markdown or explanation.
`;

    try {
      const response = await this.model.generateContent(prompt);
      let jsonText = response.response.text().trim();

      if (jsonText.includes('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      const schema = JSON.parse(jsonText);

      return {
        type: 'Organization',
        topic: 'NRPG Organization',
        schema,
        tokensUsed: response.response.usageMetadata?.totalTokenCount || 0,
        generatedAt: new Date(),
      };
    } catch (error) {
      throw new Error(
        `Failed to generate Organization schema: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate multiple service schemas for different disaster types
   */
  async generateMultipleServiceSchemas(): Promise<GeneratedSchema[]> {
    const services = [
      { name: 'Water Damage Restoration', type: 'Restoration Service' },
      { name: 'Fire & Smoke Restoration', type: 'Restoration Service' },
      { name: 'Mould Remediation', type: 'Remediation Service' },
      { name: 'Bio & Forensic Cleaning', type: 'Cleaning Service' },
    ];

    const results: GeneratedSchema[] = [];

    for (const service of services) {
      try {
        const schema = await this.generateServiceSchema(service.name, service.type);
        results.push(schema);

        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to generate schema for ${service.name}:`, error);
      }
    }

    return results;
  }
}

// Singleton instance
let instance: SchemaContentGenerator | null = null;

export function getSchemaGenerator(apiKey?: string): SchemaContentGenerator {
  if (!instance) {
    instance = new SchemaContentGenerator(apiKey);
  }
  return instance;
}

export default SchemaContentGenerator;
