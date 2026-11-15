/**
 * DesignOS Educational Article Page Template
 *
 * Demonstrates DesignOS usage for educational content
 * Uses: Timeline, BeforeAfterComparison, Button, Header
 *
 * Strategic decisions implemented:
 * - Context: education (teal palette, subtle animations)
 * - Scroll-triggered reveals (Timeline animated)
 * - Expandable before/after evidence
 * - IICRC badges with always-visible tooltips
 * - Comfortable reading experience
 */

'use client';

import * as React from 'react';
import {
  Timeline,
  BeforeAfterComparison,
  Button,
  Header,
  useContextualTheme,
} from '@/design-system';

const restorationSteps = [
  {
    id: '1',
    number: 1,
    title: 'Assessment',
    description: 'IICRC technician inspects damage extent and creates moisture map',
    details: [
      'Visual inspection of all affected areas',
      'Thermal imaging to detect hidden moisture',
      'Moisture readings with calibrated meters',
      'Document damage with photos and measurements',
    ],
  },
  {
    id: '2',
    number: 2,
    title: 'Make Safe',
    description: 'Immediate actions to prevent further damage and ensure safety',
    details: [
      'Turn off affected utilities (water, electricity)',
      'Set up safety barriers',
      'Board up openings if needed',
      'Extract standing water',
    ],
  },
  {
    id: '3',
    number: 3,
    title: 'Moisture Control',
    description: 'Deploy industrial equipment to dry structure and prevent mold',
    details: [
      'Place commercial dehumidifiers',
      'Position air movers for optimal airflow',
      'Monitor moisture levels daily',
      'Adjust equipment based on readings',
    ],
  },
  {
    id: '4',
    number: 4,
    title: 'Remediation',
    description: 'Remove damaged materials and treat affected areas',
    details: [
      'Remove unsalvageable materials (drywall, insulation)',
      'Clean and sanitize affected surfaces',
      'Apply antimicrobial treatments',
      'HEPA vacuum for particulates',
    ],
  },
  {
    id: '5',
    number: 5,
    title: 'Clearance Testing',
    description: 'Verify successful remediation with professional testing',
    details: [
      'Final moisture readings (<12% required)',
      'Air quality testing if needed',
      'Visual inspection for mold/damage',
      'Photographic documentation',
    ],
  },
  {
    id: '6',
    number: 6,
    title: 'Reinstatement',
    description: 'Restore property to pre-loss condition',
    details: [
      'Reconstruct removed structures',
      'Paint and finish surfaces',
      'Reinstall fixtures and fittings',
      'Final cleaning and handover',
    ],
  },
];

export function EducationalArticlePageTemplate() {
  const theme = useContextualTheme();

  return (
    <div className="min-h-screen bg-background">
      <Header logoText="Disaster Recovery" phoneNumber="1300 309 361" emergencyCTA />

      {/* Article Header */}
      <div className="bg-gradient-to-br from-dr-education-bg to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-dr-education mb-4">
            What Happens Next: The Water Damage Recovery Process
          </h1>
          <p className="text-lg text-gray-700">
            Understanding the 6-step IICRC-compliant restoration process helps you know what to
            expect and make informed decisions.
          </p>

          <p className="mt-6 text-sm text-gray-600">This process follows recognised industry standards.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-12">
        {/* Animated Timeline */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">The 6-Step Restoration Process</h2>
          <Timeline steps={restorationSteps} mode="timeline" animated />
        </div>

        {/* Before/After Evidence */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Why Quality Matters</h2>
          <p className="text-gray-700 mb-6">
            Proper IICRC-compliant remediation prevents mold return and long-term damage. Here's
            what happens when corners are cut:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BeforeAfterComparison
              title="Mold Return After Improper Remediation"
              description="Six months after initial remediation, mold returned"
              beforeImage={{
                url: '/images/mold-return-before.jpg',
                alt: 'Mold growth 6 months after improper remediation',
                annotations: [
                  { text: 'Mold growth returned', x: 30, y: 40 },
                  { text: 'Moisture: 18% (too high)', x: 60, y: 70 },
                ],
              }}
              afterImage={{
                url: '/images/mold-proper-after.jpg',
                alt: 'NRPG-compliant remediation with no mold return',
                annotations: [
                  { text: 'No mold return after 12 months', x: 30, y: 40 },
                  { text: 'Moisture: 8% (optimal)', x: 60, y: 70 },
                ],
              }}
              explanation="This property owner initially hired an unlicensed contractor to save money. Six months later, mold returned due to improper moisture control. NRPG re-remediated following industry standards. Total cost was 3x the original quote."
              lesson="Shortcuts cause long-term harm. IICRC-certified contractors may cost more upfront but prevent costly re-work."
              thumbnailUrl="/images/mold-thumbnail.jpg"
            />
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-dr-education-bg border-2 border-dr-education rounded-lg p-8 text-center">
          <h3 className="text-2xl font-semibold mb-4">Need Help Now?</h3>
          <p className="text-gray-700 mb-6">
            NRPG contractors are available 24/7 for water damage emergencies
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="emergency-primary" size="lg">
              🚨 Get Emergency Help
            </Button>
            <Button variant="education-primary" size="lg">
              Learn More About IICRC
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * This template demonstrates:
 * - Education context (teal palette, subtle animations)
 * - Scroll-triggered timeline reveals
 * - Before/after expandable comparison cards
 * - IICRC badge tooltips (educational)
 * - Comfortable reading layout (max-w-4xl, relaxed spacing)
 * - Dual CTAs (emergency + educational)
 * - Gradient backgrounds
 * - Professional article structure
 */
