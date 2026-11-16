/**
 * Location Page Q&A Template Component
 *
 * Optimized for:
 * - Google People Also Ask snippets
 * - AI Overviews extraction
 * - ChatGPT/Perplexity citations
 *
 * Uses proper schema markup and entity-rich formatting
 * for optimal LLM content extraction
 *
 * Usage:
 * <LocationPageQATemplate city="Sydney" state="NSW" service="Water Damage" />
 */

'use client';

import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface LocationPageQAProps {
  city: string;
  state: string;
  service: string;
  emergencyPrice?: string;
  responseTime?: string;
  certifications?: string[];
}

export function LocationPageQATemplate({
  city,
  state,
  service,
  emergencyPrice = '$2,750 AUD',
  responseTime = '42 minutes average',
  certifications = ['Qualified', 'Insurance Approved', 'All Regions Covered'],
}: LocationPageQAProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const qaData = useMemo(() => [
    {
      question: `What does ${service.toLowerCase()} cost in ${city}?`,
      answer: `Emergency ${service} in ${city}, ${state} starts at ${emergencyPrice} for initial assessment and make-safe work. This includes 24/7 dispatch, qualified contractor, and professional documentation for insurance claims. Additional restoration work is quoted after assessment.`,
      schema: true,
    },
    {
      question: `How quickly can NRPG respond to ${service.toLowerCase()} in ${city}?`,
      answer: `NRPG maintains an average response time of ${responseTime} for emergency calls in ${city}. We operate 24/7 with contractors stationed across ${state} ready for immediate dispatch. Response times may vary based on location within the service area.`,
      schema: true,
    },
    {
      question: `Are your ${city} contractors qualified?`,
      answer: `Yes. All NRPG contractors operating in ${city} are ${certifications.join(', ')}. Industry certification means they follow recognised restoration standards and industry best practices for ${service.toLowerCase()}.`,
      schema: true,
    },
    {
      question: `Can NRPG work with my insurance in ${city}?`,
      answer: `NRPG contractors in ${city} produce industry-standard documentation — scope of works, estimates, and damage reports — accepted by all major Australian insurance companies including NRMA, RACV, AAMI, Suncorp, and Allianz. You submit this documentation to your insurer as part of your claim.`,
      schema: true,
    },
    {
      question: `What's included in the ${emergencyPrice} emergency service?`,
      answer: `The ${emergencyPrice} emergency callout includes: 24/7 emergency dispatch, qualified contractor arrival, professional damage assessment, initial make-safe work to prevent further damage, and comprehensive documentation for your insurance claim. Additional restoration work is estimated after initial assessment.`,
      schema: true,
    },
    {
      question: `Do you service all areas of ${city}?`,
      answer: `NRPG maintains a 50km service radius from central ${city}, covering all major suburbs and surrounding areas. Some remote areas may have extended response times. Call our dispatch team to confirm coverage for your specific location.`,
      schema: true,
    },
  ], [city, state, service, emergencyPrice, responseTime, certifications]);

  return (
    <div className="w-full bg-white rounded-3xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-3xl p-8 md:p-12 mb-0">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          {service} in {city}
        </h2>
        <p className="text-blue-100 text-lg mb-6">
          Frequently asked questions about emergency restoration services
        </p>

        {/* Key Facts Header */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-black text-white">{emergencyPrice}</div>
            <div className="text-xs font-bold text-blue-100 uppercase tracking-wider">
              Emergency Price
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-black text-white">{responseTime}</div>
            <div className="text-xs font-bold text-blue-100 uppercase tracking-wider">
              Response Time
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-black text-white">24/7</div>
            <div className="text-xs font-bold text-blue-100 uppercase tracking-wider">
              Always Available
            </div>
          </div>
        </div>
      </div>

      {/* Q&A Section - Optimized for LLM extraction */}
      <div className="p-8 md:p-12 space-y-4">
        {qaData.map((item, index) => (
          <div
            key={index}
            className="border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-blue-600 transition-colors"
          >
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full flex items-start justify-between p-6 bg-slate-50 hover:bg-slate-100 transition-colors text-left group"
              aria-expanded={expandedIndex === index}
            >
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {/* Schema.org Question format */}
                  {item.question}
                </h3>
              </div>
              <ChevronDown
                className={`w-6 h-6 text-slate-600 flex-shrink-0 ml-4 transition-transform ${
                  expandedIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Expanded Answer - Rich answer text for LLM extraction */}
            {expandedIndex === index && (
              <div className="bg-white px-6 py-8 border-t-2 border-slate-200">
                <p className="text-slate-700 leading-relaxed text-lg">
                  {/* This paragraph format is optimal for AI extraction */}
                  {item.answer}
                </p>

                {/* Call-to-action for emergency */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-sm text-slate-600 mb-3">
                    Need immediate help? Contact us now.
                  </p>
                  <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">
                    Request Service for {city} →
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* JSON-LD Schema for Q&A (for Google) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: qaData.map(item => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }),
        }}
      />

      {/* Bottom CTA */}
      <div className="bg-blue-50 border-t border-blue-200 px-8 md:px-12 py-8 rounded-b-3xl">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-3">
            Have a specific question?
          </h3>
          <p className="text-slate-700 mb-6">
            Our NRPG team is available 24/7 to discuss your restoration needs in {city}.
          </p>
          <div className="flex flex-col md:flex-row gap-3 justify-center">
            <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors">
              Request Emergency Service
            </button>
            <button className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-xl transition-colors">
              Get Free Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
