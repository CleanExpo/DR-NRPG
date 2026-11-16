/**
 * TrustSidebar Component
 *
 * Displayed alongside claim form to build trust and confidence during emergency submission.
 * Features:
 * - Live contractor availability counter
 * - Contractor photo avatars (humanize network)
 * - Insurance partner logos (institutional trust)
 * - Response time guarantee
 * - Certification badges
 *
 * Placement: Right sidebar on desktop, below form on mobile
 */

'use client';

import React from 'react';
import Image from 'next/image';

export interface TrustSidebarProps {
  /** Show/hide the sidebar (useful for responsive layouts) */
  visible?: boolean;
  /** Number of available contractors (displays as "X and NNY more") */
  totalContractors?: number;
  /** Response time in minutes */
  responseTimeMinutes?: number;
}

// Mock contractor data (would be fetched in production)
const FEATURED_CONTRACTORS = [
  { name: 'Michael Chen', role: 'Water Damage Specialist', initials: 'MC' },
  { name: 'Lisa Rodriguez', role: 'Fire Restoration', initials: 'LR' },
  { name: 'James Williams', role: 'Mold Remediation', initials: 'JW' },
];

export const TrustSidebar: React.FC<TrustSidebarProps> = ({
  visible = true,
  totalContractors = 500,
  responseTimeMinutes = 60,
}) => {
  if (!visible) return null;

  const remainingContractors = totalContractors - FEATURED_CONTRACTORS.length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="space-y-6">
        {/* Header - "You're in Safe Hands" */}
        <div>
          <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">
            ✓ YOU'RE IN SAFE HANDS
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Professional help on the way
          </p>
        </div>

        {/* Live Network Stats */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <span className="text-lg">⚡</span>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                Average Response: &lt;{responseTimeMinutes} minutes
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Fastest certification-to-dispatch network in Australia
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-lg">🏢</span>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                {totalContractors}+ Vetted Contractors
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                All qualified and insured
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-lg">✓</span>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                Pre-Approved by Major Insurers
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Direct integration with NRMA, RACV, AAMI, Suncorp
              </p>
            </div>
          </div>
        </div>

        {/* Contractor Photos - Humanize Network */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
            Ready to Help
          </p>

          <div className="flex items-center gap-2">
            {/* Photo Avatars */}
            <div className="flex -space-x-3">
              {FEATURED_CONTRACTORS.map((contractor, idx) => (
                <div
                  key={idx}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm cursor-help"
                  title={contractor.name}
                >
                  <span className="text-xs font-bold text-white">{contractor.initials}</span>
                </div>
              ))}
            </div>

            {/* Names + Remaining Count */}
            <div className="flex-1 ml-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {FEATURED_CONTRACTORS[0]?.name.split(' ')[0]}, {FEATURED_CONTRACTORS[1]?.name.split(' ')[0]}, {FEATURED_CONTRACTORS[2]?.name.split(' ')[0]}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                + {remainingContractors} more
              </div>
            </div>
          </div>

          {/* Contractor Roles */}
          <div className="mt-3 space-y-1">
            {FEATURED_CONTRACTORS.map((contractor, idx) => (
              <div key={idx} className="text-xs text-slate-600 dark:text-slate-400">
                • {contractor.role}
              </div>
            ))}
          </div>
        </div>

        {/* Insurance Logos - Institutional Trust */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
            Trusted By
          </p>

          <div className="grid grid-cols-2 gap-2">
            {['NRMA', 'RACV', 'AAMI', 'Suncorp'].map((insurer, idx) => (
              <div
                key={idx}
                className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 p-2"
              >
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 text-center">
                  {insurer}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Certification Badges */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
            Certifications
          </p>

          <div className="space-y-2">
            {[
              { code: 'CERT', label: 'Qualified Contractors' },
              { code: 'IBP', label: 'Insurance Background Verified' },
              { code: 'AUDIT', label: 'Quarterly Audited' },
            ].map((cert, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">✓</span>
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{cert.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Call-to-Action - Reassurance CTA */}
        <button
          type="submit"
          className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-transform duration-100 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] active:scale-95 text-sm"
        >
          Continue to Next Step
        </button>

        {/* Fine Print - Reassurance */}
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Your information is secured and shared only with approved contractors.
        </p>
      </div>
    </div>
  );
};

TrustSidebar.displayName = 'TrustSidebar';

export default TrustSidebar;
