/**
 * FAQ Accordion Component
 *
 * Collapsible FAQ section for landing pages
 * Features:
 * - Smooth expand/collapse animation
 * - Chevron icon rotation
 * - Only one FAQ open at a time
 * - Accessible keyboard navigation
 * - Mobile responsive
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface FAQ {
  question: string;
  answer: string | React.ReactNode;
}

interface FAQAccordionProps {
  faqs: FAQ[];
  className?: string;
}

export function FAQAccordion({ faqs, className }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:border-orange-300 hover:shadow-md"
        >
          {/* Question Button */}
          <button
            onClick={() => toggleFAQ(index)}
            className="flex w-full items-center justify-between p-6 text-left transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            aria-expanded={openIndex === index}
          >
            <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
            <svg
              className={cn(
                'h-6 w-6 flex-shrink-0 text-orange-600 transition-transform duration-200',
                openIndex === index ? 'rotate-180' : ''
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Answer Content */}
          <div
            className={cn(
              'overflow-hidden transition-all duration-200',
              openIndex === index ? 'max-h-[500px]' : 'max-h-0'
            )}
          >
            <div className="border-t border-gray-100 px-6 pb-6 pt-4">
              {typeof faq.answer === 'string' ? (
                <p className="text-base leading-relaxed text-gray-400">{faq.answer}</p>
              ) : (
                faq.answer
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Preset FAQs for waitlist landing page
export const waitlistFAQs: FAQ[] = [
  {
    question: 'When will the platform launch?',
    answer:
      'We expect to launch in Q2 2026 (April-June). Waitlist members will get early access 2 weeks before the public launch and exclusive beta testing opportunities.',
  },
  {
    question: 'Is there a cost to join the waitlist?',
    answer:
      'No! Joining the waitlist is completely free. There are no credit card requirements, no fees, and no obligations. You will receive launch updates and have the option to be among the first to use the platform.',
  },
  {
    question: 'What happens after I join the waitlist?',
    answer: (
      <div className="space-y-2">
        <p className="text-gray-400">After joining, you will receive:</p>
        <ul className="list-inside list-disc space-y-1 text-gray-400">
          <li>A confirmation email with your spot on the waitlist</li>
          <li>Monthly progress updates as we build the platform</li>
          <li>Exclusive disaster recovery tips and resources</li>
          <li>Early access invitation 2 weeks before public launch</li>
          <li>Opportunity to provide feedback during beta testing</li>
        </ul>
      </div>
    ),
  },
  {
    question: 'Who can use the NRPG platform?',
    answer: (
      <div className="space-y-2">
        <p className="text-gray-400">The platform serves two primary users:</p>
        <ul className="list-inside list-disc space-y-1 text-gray-400">
          <li>
            <strong>Property Owners:</strong> Homeowners, landlords, property managers, or business
            owners who need disaster recovery services (water damage, fire damage, mould, storm
            damage, etc.)
          </li>
          <li>
            <strong>Contractors:</strong> IICRC-certified disaster recovery contractors who want to
            grow their business by receiving qualified leads and managing jobs through our platform
          </li>
        </ul>
      </div>
    ),
  },
  {
    question: 'What makes NRPG different from other platforms?',
    answer: (
      <div className="space-y-2">
        <p className="text-gray-400">NRPG is the only platform that combines:</p>
        <ul className="list-inside list-disc space-y-1 text-gray-400">
          <li>
            <strong>Strict verification:</strong> Only IICRC-certified, insured, and
            background-checked contractors
          </li>
          <li>
            <strong>24/7 emergency matching:</strong> Get help within 15 minutes, any time
          </li>
          <li>
            <strong>Transparent pricing:</strong> See itemized quotes before committing
          </li>
          <li>
            <strong>Real reviews:</strong> Verified customer reviews, not fake testimonials
          </li>
          <li>
            <strong>Fair contractor pricing:</strong> $550 flat fee vs. 20-30% commission on other platforms
          </li>
        </ul>
      </div>
    ),
  },
  {
    question: 'Can I unsubscribe from waitlist emails?',
    answer:
      'Absolutely! Every email we send includes an unsubscribe link at the bottom. You can opt out at any time with one click. We respect your inbox and your privacy.',
  },
];

// Preset FAQs for contractor application page
export const contractorFAQs: FAQ[] = [
  {
    question: 'How much does it cost to join?',
    answer: (
      <div className="space-y-2">
        <p className="text-gray-400">NRPG membership includes the following costs:</p>
        <ul className="list-inside list-disc space-y-1 text-gray-400">
          <li>
            <strong>Training Program:</strong> $1,495 AUD (one-time) for all 24 certification modules (22+ hours of training)
          </li>
          <li>
            <strong>Platform Fee:</strong> $550 flat fee per claim (no commission on your work)
          </li>
          <li>
            <strong>No Monthly Fees:</strong> Zero subscription charges - only pay the flat fee per claim
          </li>
          <li>
            <strong>No Commission:</strong> Keep 100% of all additional restoration work
          </li>
          <li>
            <strong>No Hidden Costs:</strong> Transparent pricing with no surprise fees
          </li>
        </ul>
        <p className="mt-2 text-sm text-gray-400">
          Training investment includes lifetime access to all modules, ongoing updates, and NRPG certification upon completion.
        </p>
      </div>
    ),
  },
  {
    question: 'How does the $550 platform fee work?',
    answer: (
      <div className="space-y-2">
        <p className="text-gray-400">Our platform fee structure is simple and transparent:</p>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
          <p className="font-semibold text-blue-900 mb-2">The $550 Flat Fee Model:</p>
          <ol className="list-inside list-decimal space-y-1 text-blue-800 text-sm">
            <li>Client pays <strong>$2,750 upfront</strong> for emergency make-safe work</li>
            <li>You receive <strong>$2,200</strong> ($2,750 - $550 platform fee)</li>
            <li>You create scope and quote for remaining restoration work</li>
            <li>You keep <strong>100% of all additional work</strong> - no commission</li>
          </ol>
        </div>

        <ul className="list-inside list-disc space-y-1 text-gray-400 mt-3">
          <li>
            <strong>No percentage commissions:</strong> Unlike other platforms, we never take a cut of your work
          </li>
          <li>
            <strong>No monthly fees:</strong> Zero subscription charges
          </li>
          <li>
            <strong>No cancellation fees:</strong> Leave anytime, no penalties
          </li>
        </ul>
        <p className="mt-2 text-sm text-gray-400">
          Compare to competitors: HIPages takes 20-30% commission, ServiceSeeking takes 15-25%. We take just $550 flat.
        </p>
      </div>
    ),
  },
  {
    question: 'How do I receive jobs?',
    answer: (
      <div className="space-y-2">
        <p className="text-gray-400">Here's how job matching works:</p>
        <ol className="list-inside list-decimal space-y-1 text-gray-400">
          <li>Property owner submits a claim (water damage, fire, mould, etc.)</li>
          <li>
            Our system matches the claim with contractors based on: certifications, service areas,
            availability, rating, and response time
          </li>
          <li>You receive a notification via app, SMS, or email (you choose)</li>
          <li>You have 30 minutes to accept or decline the job</li>
          <li>If accepted, you contact the property owner directly and schedule the work</li>
        </ol>
      </div>
    ),
  },
  {
    question: 'What are the complete membership requirements?',
    answer: (
      <div className="space-y-3">
        <p className="text-gray-400">
          <strong>To become an NRPG member, you must meet ALL of the following requirements:</strong>
        </p>

        <div className="bg-blue-50 p-3 rounded">
          <p className="font-semibold text-blue-900 mb-2">1. NRPG Training Certification (Required)</p>
          <ul className="list-inside list-disc space-y-1 text-blue-800 text-sm">
            <li>Complete all 24 NRPG training modules (22+ hours)</li>
            <li>Pass 315 assessment questions (80% minimum)</li>
            <li>Modules cover: Safety, Legal, Documentation, Operations, Business, and Restoration</li>
          </ul>
        </div>

        <div className="bg-green-50 p-3 rounded">
          <p className="font-semibold text-green-900 mb-2">2. IICRC Certifications (At least one)</p>
          <ul className="list-inside list-disc space-y-1 text-green-800 text-sm">
            <li>Water Damage Restoration (WRT) or Applied Structural Drying (ASD)</li>
            <li>Fire and Smoke Restoration (FSR)</li>
            <li>Mould Remediation (AMRT)</li>
            <li>Trauma and Crime Scene Cleanup (CTS)</li>
            <li>Or equivalent Australian/international certifications</li>
          </ul>
        </div>

        <div className="bg-amber-50 p-3 rounded">
          <p className="font-semibold text-amber-900 mb-2">3. Business & Legal Requirements</p>
          <ul className="list-inside list-disc space-y-1 text-amber-800 text-sm">
            <li>Valid Australian Business Number (ABN)</li>
            <li>Public Liability Insurance ($10M+ coverage)</li>
            <li>WorkCover/Workers Compensation (if applicable)</li>
            <li>National Police Check (background verification)</li>
            <li>2+ years industry experience with verifiable references</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    question: 'How long does the approval process take?',
    answer: (
      <div className="space-y-2">
        <p className="text-gray-400">The complete onboarding process includes:</p>
        <ol className="list-inside list-decimal space-y-1 text-gray-400">
          <li>
            <strong>Application Review:</strong> 2-3 business days for initial verification
          </li>
          <li>
            <strong>Training Program:</strong> Complete all 24 NRPG certification modules (approximately 22+ hours total, self-paced)
          </li>
          <li>
            <strong>Assessment:</strong> Pass 315 quiz questions across all modules (80% minimum)
          </li>
          <li>
            <strong>Final Verification:</strong> Background check, license verification, insurance confirmation
          </li>
          <li>
            <strong>Platform Activation:</strong> Start receiving qualified leads once certified
          </li>
        </ol>
        <p className="mt-2 text-sm text-gray-400">
          Most contractors complete the training program within 2-4 weeks while working full-time. You can study at your own pace.
        </p>
      </div>
    ),
  },
  {
    question: 'What support and training do you provide?',
    answer: (
      <div className="space-y-2">
        <p className="text-gray-400">NRPG provides comprehensive support:</p>
        <ul className="list-inside list-disc space-y-1 text-gray-400">
          <li>
            <strong>Complete Training Program:</strong> 24 professional modules covering all aspects of disaster recovery business operations (22+ hours of content)
          </li>
          <li>
            <strong>Certification Support:</strong> Study materials, practice assessments, and instructor assistance throughout your training
          </li>
          <li>
            <strong>Platform Training:</strong> Dedicated module (NRPG-021) teaching you how to use the DR-NRPG platform effectively
          </li>
          <li>
            <strong>Mobile App:</strong> Job management, client communication, invoicing, and progress tracking
          </li>
          <li>
            <strong>Contractor Success Team:</strong> Online support via your contractor portal (Mon-Fri, 9am-5pm AEST)
          </li>
          <li>
            <strong>Ongoing Education:</strong> Continual education credits (NRPG-022) and industry updates
          </li>
          <li>
            <strong>Community Network:</strong> Member gatherings and networking events (NRPG-024)
          </li>
          <li>
            <strong>Payment Processing:</strong> Invoice management and IICRC-standard insurance documentation support
          </li>
        </ul>
      </div>
    ),
  },
];
