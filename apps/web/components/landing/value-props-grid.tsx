/**
 * Value Propositions Grid Component
 *
 * Displays key benefits/value propositions in a responsive grid
 * Features:
 * - Icon + title + description layout
 * - Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
 * - Hover effects
 * - Customizable icons and content
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ValueProp {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface ValuePropsGridProps {
  valueProps: ValueProp[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function ValuePropsGrid({ valueProps, columns = 3, className }: ValuePropsGridProps) {
  const gridColsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-8 sm:grid-cols-2',
        gridColsClass[columns],
        className
      )}
    >
      {valueProps.map((prop, index) => (
        <div
          key={index}
          className="group relative rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition hover:border-orange-300 hover:shadow-lg"
        >
          {/* Icon */}
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md transition group-hover:scale-110 group-hover:shadow-lg">
            {prop.icon}
          </div>

          {/* Title */}
          <h3 className="mb-2 text-xl font-semibold text-gray-900">{prop.title}</h3>

          {/* Description */}
          <p className="text-base leading-relaxed text-gray-400">{prop.description}</p>

          {/* Decorative gradient on hover */}
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-orange-500/5 to-blue-500/5 opacity-0 transition group-hover:opacity-100" />
        </div>
      ))}
    </div>
  );
}

// Preset value props for common landing pages
export const propertyOwnerValueProps: ValueProp[] = [
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    title: 'Verified Qualified Contractors',
    description:
      'Every contractor is pre-screened, qualified, fully insured, and background-checked. Only qualified professionals, no guesswork.',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: '24/7 Emergency Response',
    description:
      'Disaster does not wait, neither do we. Get matched with available contractors in 15 minutes, any time, day or night, across Australia.',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: 'Transparent Pricing, No Hidden Fees',
    description:
      'Get clear, itemized quotes before work begins. No surprises, no hidden charges. Track every dollar and hold contractors accountable.',
  },
];

export const contractorValueProps: ValueProp[] = [
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    title: 'Qualified Leads Delivered Daily',
    description:
      'Property owners actively seeking your services, matched based on your certifications, service areas, and availability. No cold calling.',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
    title: 'Mobile App for Job Management',
    description:
      'Manage jobs, communicate with clients, track progress, and submit documentation from your phone. Work smarter, not harder.',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: '20% Platform Fee - No Monthly Fees',
    description:
      'You keep 80% of each claim payment; NRPG keeps a 20% platform fee. No monthly fees.',
  },
];
