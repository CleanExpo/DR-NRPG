/**
 * Tests for Phase 1 SEO Components
 *
 * Tests all new 2026 SEO components to ensure:
 * - Proper rendering
 * - API integration
 * - Schema markup generation
 * - LLM optimization
 */

import { render, screen, waitFor } from '@testing-library/react';
import { SchemaGenerator } from '@/lib/seo/schema-generator';
import { llmOptimizer } from '@/lib/seo/llm-optimizer';
import '@testing-library/jest-dom';

describe('SchemaGenerator - 2026 Enhancements', () => {
  const schemaGen = new SchemaGenerator();

  describe('generateQuestionSchema', () => {
    it('should generate valid Question schema', () => {
      const questions = [
        {
          question: 'What is water damage restoration?',
          answer: 'Professional service to restore properties damaged by water.',
        },
      ];

      const schema = schemaGen.generateQuestionSchema(questions);

      expect(schema).toBeDefined();
      expect(schema[0]['@context']).toBe('https://schema.org');
      expect(schema[0]['@type']).toBe('Question');
      expect(schema[0].name).toBe('What is water damage restoration?');
    });

    it('should support optional URL in answer', () => {
      const questions = [
        {
          question: 'Where can I learn more?',
          answer: 'Visit our help center',
          answerUrl: 'https://example.com/help',
        },
      ];

      const schema = schemaGen.generateQuestionSchema(questions);

      expect(schema[0].acceptedAnswer.url).toBe('https://example.com/help');
    });
  });

  describe('generateSpecialAnnouncementSchema', () => {
    it('should generate valid SpecialAnnouncement schema', () => {
      const announcement = {
        name: 'Emergency Water Damage Alert',
        description: 'Severe flooding in Sydney area',
        datePosted: '2026-01-09',
        category: 'DisasterRelief' as const,
      };

      const schema = schemaGen.generateSpecialAnnouncementSchema(announcement);

      expect(schema['@type']).toBe('SpecialAnnouncement');
      expect(schema.name).toBe('Emergency Water Damage Alert');
      expect(schema.category).toBe('DisasterRelief');
    });

    it('should include location data when provided', () => {
      const announcement = {
        name: 'Sydney Area Emergency',
        description: 'Test',
        datePosted: '2026-01-09',
        category: 'EmergencyWarning' as const,
        location: { latitude: -33.8688, longitude: 151.2093 },
      };

      const schema = schemaGen.generateSpecialAnnouncementSchema(announcement);

      expect(schema.spatialCoverage).toBeDefined();
      expect(schema.spatialCoverage.geo.latitude).toBe(-33.8688);
    });
  });

  describe('generateEventSchema', () => {
    it('should generate valid Event schema for webinars', () => {
      const event = {
        name: 'IICRC Certification Webinar',
        description: 'Training on water damage restoration',
        startDate: '2026-02-01T10:00:00',
        endDate: '2026-02-01T11:30:00',
        eventType: 'OnlineEvent' as const,
        eventStatus: 'EventScheduled' as const,
        url: '/webinar/iicrc-training',
        organizer: 'NRPG',
      };

      const schema = schemaGen.generateEventSchema(event);

      expect(schema['@type']).toBe('OnlineEvent');
      expect(schema.name).toBe('IICRC Certification Webinar');
      expect(schema.eventStatus).toBe('https://schema.org/EventScheduled');
    });

    it('should include offers when provided', () => {
      const event = {
        name: 'Premium Workshop',
        description: 'Advanced restoration techniques',
        startDate: '2026-02-15T09:00:00',
        endDate: '2026-02-15T17:00:00',
        eventType: 'OfflineEvent' as const,
        eventStatus: 'EventScheduled' as const,
        url: '/workshop/premium',
        organizer: 'NRPG',
        offers: [{ name: 'Standard', price: '99', currency: 'AUD' }],
      };

      const schema = schemaGen.generateEventSchema(event);

      expect(schema.offers).toBeDefined();
      expect(schema.offers[0].name).toBe('Standard');
      expect(schema.offers[0].price).toBe('99');
    });
  });

  describe('generateLocalBusinessWithPricingSchema', () => {
    it('should include pricing offers in schema', () => {
      const location = {
        city: 'Sydney',
        state: 'NSW',
        latitude: -33.8688,
        longitude: 151.2093,
        emergencyPrice: 2750,
        currency: 'AUD',
      };

      const schema = schemaGen.generateLocalBusinessWithPricingSchema(location);

      expect(schema.makesOffer).toBeDefined();
      expect(schema.makesOffer[0]['@type']).toBe('Offer');
      expect(schema.makesOffer[0].name).toBe('Emergency Service');
      expect(schema.makesOffer[0].price).toBe('2750');
    });
  });
});

describe('LLMOptimizer - Content Structure', () => {
  describe('generateEntityRichSummary', () => {
    it('should create formatted entity summary', () => {
      const summary = llmOptimizer.generateEntityRichSummary('Water Damage Restoration', {
        organization: 'NRPG',
        service: 'Emergency Water Removal',
        price: '$2,750 AUD',
        certifications: ['IICRC', 'Insurance Approved'],
      });

      expect(summary.type).toBe('summary');
      expect(summary.content).toContain('# Water Damage Restoration');
      expect(summary.content).toContain('**Organization**: NRPG');
      expect(summary.content).toContain('**Price**: $2,750 AUD');
    });
  });

  describe('generateQAFormat', () => {
    it('should format questions and answers for LLM extraction', () => {
      const qa = llmOptimizer.generateQAFormat([
        {
          question: 'What is included?',
          answer: 'Assessment, make-safe, and documentation',
          relevantEntities: ['Assessment', 'Documentation'],
        },
      ]);

      expect(qa.type).toBe('faq');
      expect(qa.content).toContain('## Q1: What is included?');
      expect(qa.content).toContain('**Key Entities**: Assessment, Documentation');
    });
  });

  describe('generateComparisonTable', () => {
    it('should create markdown table for AI extraction', () => {
      const table = llmOptimizer.generateComparisonTable('Service Options', [
        {
          name: 'Emergency',
          characteristics: { price: '$2,750', time: '42 mins', scope: 'Make-safe only' },
        },
        {
          name: 'Standard',
          characteristics: { price: 'Quote based', time: '3-5 days', scope: 'Full restoration' },
        },
      ]);

      expect(table.type).toBe('table');
      expect(table.content).toContain('| Service |');
      expect(table.content).toContain('| Emergency |');
    });
  });

  describe('generatePriceFormat', () => {
    it('should format pricing transparently', () => {
      const pricing = llmOptimizer.generatePriceFormat('Emergency Service', {
        basePrice: 2750,
        currency: 'AUD',
        includes: ['24/7 Dispatch', 'IICRC Contractor', 'Assessment'],
        additionalServices: [
          { name: 'Dehumidification', price: 500 },
          { name: 'Deodorization', price: 300 },
        ],
      });

      expect(pricing.type).toBe('comparison');
      expect(pricing.content).toContain('### Base Price: AUD2750');
      expect(pricing.content).toContain('- Dehumidification: AUD500');
    });
  });

  describe('analyzeContentForLLMOptimization', () => {
    it('should score content optimization', () => {
      const content = `
        # Water Damage Restoration

        **NRPG** provides emergency **water damage restoration** in **Sydney**.

        ## Key Features
        - 24/7 availability
        - Qualified contractors
        - Insurance accepted

        | Service | Price |
        |---------|-------|
        | Emergency | $2,750 |

        **Q: What's included?**
        A: Assessment and make-safe work
      `;

      const analysis = llmOptimizer.analyzeContentForLLMOptimization(content);

      expect(analysis.score).toBeGreaterThan(75);
      expect(analysis.strengths.length).toBeGreaterThan(0);
      expect(analysis.strengths.some(s => s.includes('H1'))).toBe(true);
      expect(analysis.strengths.some(s => s.includes('table'))).toBe(true);
    });
  });
});

describe('Phase 1 Component Integration', () => {
  it('should validate schema output can be used in page head', () => {
    const schemaGen = new SchemaGenerator();
    const org = schemaGen.generateOrganizationSchema();

    expect(org['@context']).toBe('https://schema.org');
    expect(org['@type']).toBe('ProfessionalService');
    expect(org.areaServed).toBeDefined();
    expect(Array.isArray(org.areaServed)).toBe(true);
  });

  it('should combine multiple schemas correctly', () => {
    const schemaGen = new SchemaGenerator();
    const org = schemaGen.generateOrganizationSchema();
    const service = schemaGen.generateEmergencyServiceSchema();

    const combined = schemaGen.combineSchemas(org, service);

    expect(Array.isArray(combined)).toBe(true);
    expect(combined.length).toBe(2);
  });
});

describe('Content Optimization Integration', () => {
  it('should generate LLM-optimized location content', () => {
    const location = llmOptimizer.generateLocationFormat('Sydney', 'NSW', {
      serviceHours: '24/7',
      responseTime: '42 minutes average',
      serviceRadius: '50km from CBD',
      certifications: ['IICRC Water', 'IICRC Fire'],
      insuranceAccepted: true,
      emergencyPrice: '$2,750 AUD',
    });

    expect(location.type).toBe('summary');
    expect(location.content).toContain('Sydney, NSW');
    expect(location.content).toContain('24/7');
    expect(location.content).toContain('IICRC Water');
  });
});
