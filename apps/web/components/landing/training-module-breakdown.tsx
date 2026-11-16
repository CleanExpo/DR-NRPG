/**
 * Training Module Breakdown Component
 *
 * Displays all 24 NRPG training modules organized by category
 * Features:
 * - Expandable category sections
 * - Module duration and quiz count
 * - Total statistics
 * - Visual category icons
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface Module {
  id: string;
  title: string;
  duration: number; // minutes
  questions: number;
  description: string;
}

interface ModuleCategory {
  name: string;
  icon: React.ReactNode;
  color: string;
  modules: Module[];
}

const trainingCategories: ModuleCategory[] = [
  {
    name: 'Foundation',
    color: 'blue',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    modules: [
      {
        id: 'NRPG-001',
        title: 'NRPG Membership Registration',
        duration: 30,
        questions: 10,
        description: 'Introduction to NRPG organisation and membership requirements',
      },
    ],
  },
  {
    name: 'Documentation',
    color: 'green',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    modules: [
      {
        id: 'NRPG-002',
        title: 'Business Documentation & Verification',
        duration: 45,
        questions: 10,
        description: 'Essential business documentation standards',
      },
      {
        id: 'NRPG-003',
        title: 'Documentation Standards & Procedures',
        duration: 75,
        questions: 20,
        description: 'Comprehensive documentation protocols',
      },
    ],
  },
  {
    name: 'Safety',
    color: 'red',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    modules: [
      {
        id: 'NRPG-005',
        title: 'Asbestos & Lead Paint Awareness',
        duration: 90,
        questions: 25,
        description: 'Critical safety awareness training',
      },
      {
        id: 'NRPG-006',
        title: 'Working at Heights & Confined Spaces',
        duration: 90,
        questions: 25,
        description: 'Advanced safety protocols',
      },
      {
        id: 'NRPG-007',
        title: 'Biohazards, Sewage & Bacterial Contamination',
        duration: 75,
        questions: 20,
        description: 'Biohazard safety procedures',
      },
    ],
  },
  {
    name: 'Legal & Compliance',
    color: 'purple',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
        />
      </svg>
    ),
    modules: [
      {
        id: 'NRPG-008',
        title: 'Australian Compliance, WHS & Consumer Law',
        duration: 90,
        questions: 25,
        description: 'Legal compliance requirements',
      },
    ],
  },
  {
    name: 'Technical',
    color: 'orange',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    modules: [
      {
        id: 'NRPG-009',
        title: 'Building Codes & Construction Standards',
        duration: 90,
        questions: 20,
        description: 'Building standards and codes',
      },
      {
        id: 'NRPG-010',
        title: 'Electrical Codes & Safety Standards',
        duration: 75,
        questions: 20,
        description: 'Electrical safety and standards',
      },
    ],
  },
  {
    name: 'Business Operations',
    color: 'indigo',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    modules: [
      {
        id: 'NRPG-004',
        title: 'Procedure Development & Implementation',
        duration: 60,
        questions: 15,
        description: 'Operational procedure development',
      },
      {
        id: 'NRPG-011',
        title: 'Insurance Claim Management',
        duration: 90,
        questions: 20,
        description: 'Insurance claim processes',
      },
      {
        id: 'NRPG-015',
        title: 'Emergency Response Management',
        duration: 45,
        questions: 10,
        description: 'Emergency response protocols',
      },
      {
        id: 'NRPG-016',
        title: 'Quality Assurance & Customer Service',
        duration: 45,
        questions: 10,
        description: 'Service quality standards',
      },
      {
        id: 'NRPG-017',
        title: 'Financial Management & Job Costing',
        duration: 60,
        questions: 15,
        description: 'Financial management principles',
      },
      {
        id: 'NRPG-019',
        title: 'Marketing & Business Development',
        duration: 30,
        questions: 5,
        description: 'Business growth strategies',
      },
    ],
  },
  {
    name: 'Restoration Techniques',
    color: 'teal',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>
    ),
    modules: [
      {
        id: 'NRPG-012',
        title: 'Water Damage Restoration Mastery',
        duration: 90,
        questions: 20,
        description: 'Advanced water damage techniques',
      },
      {
        id: 'NRPG-013',
        title: 'Mould Remediation Protocols',
        duration: 75,
        questions: 15,
        description: 'Mould remediation procedures',
      },
      {
        id: 'NRPG-014',
        title: 'Fire & Smoke Damage Restoration',
        duration: 60,
        questions: 15,
        description: 'Fire damage restoration',
      },
      {
        id: 'NRPG-020',
        title: 'Advanced Restoration & Specialty Services',
        duration: 75,
        questions: 15,
        description: 'Specialised restoration techniques',
      },
    ],
  },
  {
    name: 'Technology & Platform',
    color: 'cyan',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    modules: [
      {
        id: 'NRPG-018',
        title: 'CRM System & Technology',
        duration: 60,
        questions: 10,
        description: 'Technology systems and CRM',
      },
      {
        id: 'NRPG-021',
        title: 'DR-NRPG Platform Operations',
        duration: 60,
        questions: 15,
        description: 'Learn to use the NRPG platform effectively',
      },
    ],
  },
  {
    name: 'Professional Development',
    color: 'pink',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    modules: [
      {
        id: 'NRPG-022',
        title: 'Continuing Professional Development',
        duration: 45,
        questions: 10,
        description: 'Ongoing professional development',
      },
      {
        id: 'NRPG-023',
        title: 'Association Memberships & Benefits',
        duration: 30,
        questions: 8,
        description: 'Industry associations and networking',
      },
      {
        id: 'NRPG-024',
        title: 'Member Gatherings & Networking',
        duration: 30,
        questions: 7,
        description: 'Community events and networking opportunities',
      },
    ],
  },
];

const colorClasses = {
  blue: {
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800',
  },
  green: {
    border: 'border-green-200',
    bg: 'bg-green-50',
    text: 'text-green-900',
    icon: 'text-green-600',
    badge: 'bg-green-100 text-green-800',
  },
  red: {
    border: 'border-red-200',
    bg: 'bg-red-50',
    text: 'text-red-900',
    icon: 'text-red-600',
    badge: 'bg-red-100 text-red-800',
  },
  purple: {
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    text: 'text-purple-900',
    icon: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-800',
  },
  orange: {
    border: 'border-orange-200',
    bg: 'bg-orange-50',
    text: 'text-orange-900',
    icon: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-800',
  },
  indigo: {
    border: 'border-indigo-200',
    bg: 'bg-indigo-50',
    text: 'text-indigo-900',
    icon: 'text-indigo-600',
    badge: 'bg-indigo-100 text-indigo-800',
  },
  teal: {
    border: 'border-teal-200',
    bg: 'bg-teal-50',
    text: 'text-teal-900',
    icon: 'text-teal-600',
    badge: 'bg-teal-100 text-teal-800',
  },
  cyan: {
    border: 'border-cyan-200',
    bg: 'bg-cyan-50',
    text: 'text-cyan-900',
    icon: 'text-cyan-600',
    badge: 'bg-cyan-100 text-cyan-800',
  },
  pink: {
    border: 'border-pink-200',
    bg: 'bg-pink-50',
    text: 'text-pink-900',
    icon: 'text-pink-600',
    badge: 'bg-pink-100 text-pink-800',
  },
};

export function TrainingModuleBreakdown() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const totalModules = trainingCategories.reduce((sum, cat) => sum + cat.modules.length, 0);
  const totalDuration = trainingCategories.reduce(
    (sum, cat) => sum + cat.modules.reduce((catSum, mod) => catSum + mod.duration, 0),
    0
  );
  const totalQuestions = trainingCategories.reduce(
    (sum, cat) => sum + cat.modules.reduce((catSum, mod) => catSum + mod.questions, 0),
    0
  );

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="text-4xl font-bold text-gray-900">{totalModules}</div>
          <div className="mt-1 text-sm text-gray-400">Total Modules</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="text-4xl font-bold text-gray-900">{Math.floor(totalDuration / 60)}h+</div>
          <div className="mt-1 text-sm text-gray-400">Training Duration</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="text-4xl font-bold text-gray-900">{totalQuestions}</div>
          <div className="mt-1 text-sm text-gray-400">Assessment Questions</div>
        </div>
      </div>

      {/* Module Categories */}
      <div className="space-y-4">
        {trainingCategories.map((category) => {
          const colors = colorClasses[category.color as keyof typeof colorClasses];
          const isExpanded = expandedCategory === category.name;
          const categoryDuration = category.modules.reduce((sum, mod) => sum + mod.duration, 0);
          const categoryQuestions = category.modules.reduce((sum, mod) => sum + mod.questions, 0);

          return (
            <div
              key={category.name}
              className={cn(
                'overflow-hidden rounded-lg border bg-white shadow-sm transition',
                colors.border,
                isExpanded && 'ring-2 ring-offset-2',
                isExpanded && `ring-${category.color}-600`
              )}
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.name)}
                className="flex w-full items-center justify-between p-6 text-left transition hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className={cn('flex-shrink-0', colors.icon)}>{category.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-400">
                      <span>{category.modules.length} modules</span>
                      <span>•</span>
                      <span>{categoryDuration} mins</span>
                      <span>•</span>
                      <span>{categoryQuestions} questions</span>
                    </div>
                  </div>
                </div>
                <svg
                  className={cn(
                    'h-6 w-6 flex-shrink-0 text-gray-400 transition-transform',
                    isExpanded && 'rotate-180'
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

              {/* Module List */}
              {isExpanded && (
                <div className={cn('border-t p-4', colors.border, colors.bg)}>
                  <div className="space-y-3">
                    {category.modules.map((module) => (
                      <div
                        key={module.id}
                        className="rounded-lg border border-white bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={cn('text-xs font-medium', colors.badge, 'px-2 py-1 rounded')}>
                                {module.id}
                              </span>
                              <h4 className="font-semibold text-gray-900">{module.title}</h4>
                            </div>
                            <p className="mt-2 text-sm text-gray-400">{module.description}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {module.duration} minutes
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                              />
                            </svg>
                            {module.questions} questions
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pass Requirements */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <div className="flex gap-3">
          <svg
            className="h-6 w-6 flex-shrink-0 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h4 className="font-semibold text-amber-900">Certification Requirements</h4>
            <ul className="mt-2 space-y-1 text-sm text-amber-800">
              <li>• Complete all 24 training modules</li>
              <li>• Pass all 315 assessment questions with 80% minimum score</li>
              <li>• Training can be completed at your own pace (typically 2-4 weeks)</li>
              <li>• Lifetime access to all materials for future reference</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
