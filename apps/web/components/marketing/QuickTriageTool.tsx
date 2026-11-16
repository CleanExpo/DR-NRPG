/**
 * Quick Triage Tool - Interactive Disaster Assessment
 *
 * Marketing component for homepage that helps users quickly assess
 * their disaster situation and get connected to appropriate services.
 *
 * Features:
 * - Multi-step disaster type selection
 * - Severity assessment
 * - Immediate routing to emergency services or intake form
 * - WCAG 2.1 AA compliant
 * - Mobile-first responsive design
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/src/design-system';
import { EMERGENCY_PRICING } from '@/lib/design-tokens';

interface DisasterOption {
  id: string;
  label: string;
  icon: string;
  severity: 'critical' | 'urgent' | 'standard';
  description: string;
}

const DISASTER_OPTIONS: DisasterOption[] = [
  {
    id: 'flood',
    label: 'Water Damage / Flood',
    icon: '💧',
    severity: 'critical',
    description: 'Standing water, leaks, or flooding',
  },
  {
    id: 'fire',
    label: 'Fire / Smoke Damage',
    icon: '🔥',
    severity: 'critical',
    description: 'Fire damage or smoke residue',
  },
  {
    id: 'mold',
    label: 'Mould / Biological',
    icon: '🦠',
    severity: 'urgent',
    description: 'Mould growth or biohazard contamination',
  },
  {
    id: 'storm',
    label: 'Storm / Wind Damage',
    icon: '🌪️',
    severity: 'urgent',
    description: 'Structural damage from severe weather',
  },
  {
    id: 'vandalism',
    label: 'Vandalism / Crime Scene',
    icon: '🚨',
    severity: 'urgent',
    description: 'Property damage or crime scene cleanup',
  },
  {
    id: 'other',
    label: 'Other Emergency',
    icon: '⚠️',
    severity: 'standard',
    description: 'Other restoration needs',
  },
];

interface QuickTriageToolProps {
  onComplete?: (disasterType: string, severity: string) => void;
  className?: string;
}

export function QuickTriageTool({ onComplete, className = '' }: QuickTriageToolProps) {
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterOption | null>(null);
  const [step, setStep] = useState<'select' | 'severity' | 'result'>('select');
  const [severityLevel, setSeverityLevel] = useState<'emergency' | 'urgent' | 'scheduled'>('urgent');

  const handleDisasterSelect = (disaster: DisasterOption) => {
    setSelectedDisaster(disaster);
    setStep('severity');
    // Auto-set severity based on disaster type
    if (disaster.severity === 'critical') {
      setSeverityLevel('emergency');
    }
  };

  const handleSeveritySelect = (level: 'emergency' | 'urgent' | 'scheduled') => {
    setSeverityLevel(level);
    setStep('result');
    onComplete?.(selectedDisaster?.id || '', level);
  };

  const reset = () => {
    setSelectedDisaster(null);
    setStep('select');
    setSeverityLevel('urgent');
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 md:p-12 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
          Quick Disaster Assessment
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Get connected to the right help in under 60 seconds
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <StepIndicator active={step === 'select'} completed={step !== 'select'} label="1" />
        <div className="w-12 h-0.5 bg-slate-200 dark:bg-slate-700" />
        <StepIndicator active={step === 'severity'} completed={step === 'result'} label="2" />
        <div className="w-12 h-0.5 bg-slate-200 dark:bg-slate-700" />
        <StepIndicator active={step === 'result'} completed={false} label="3" />
      </div>

      {/* Step 1: Select Disaster Type */}
      {step === 'select' && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
            What type of disaster are you experiencing?
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {DISASTER_OPTIONS.map((disaster) => (
              <button
                key={disaster.id}
                onClick={() => handleDisasterSelect(disaster)}
                className="group flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-600 border-2 border-transparent transition-[background-color,border-color] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] text-left"
              >
                <span className="text-3xl" aria-hidden="true">{disaster.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {disaster.label}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {disaster.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Severity Assessment */}
      {step === 'severity' && selectedDisaster && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              How urgent is the situation?
            </h3>
            <button
              onClick={reset}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Change Type
            </button>
          </div>

          <div className="space-y-3">
            <SeverityOption
              level="emergency"
              title="Life-Threatening Emergency"
              description="Active danger, major structural damage, or hazardous conditions"
              icon="🚨"
              recommended={selectedDisaster.severity === 'critical'}
              onClick={() => handleSeveritySelect('emergency')}
            />
            <SeverityOption
              level="urgent"
              title="Urgent - Same Day Response"
              description="Significant damage requiring immediate attention within hours"
              icon="⚡"
              recommended={selectedDisaster.severity === 'urgent'}
              onClick={() => handleSeveritySelect('urgent')}
            />
            <SeverityOption
              level="scheduled"
              title="Standard - Scheduled Service"
              description="Contained situation, can wait for scheduled appointment"
              icon="📅"
              recommended={selectedDisaster.severity === 'standard'}
              onClick={() => handleSeveritySelect('scheduled')}
            />
          </div>
        </div>
      )}

      {/* Step 3: Result & Next Steps */}
      {step === 'result' && selectedDisaster && (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <span className="text-4xl" aria-hidden="true">{selectedDisaster.icon}</span>
          </div>

          <div>
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {selectedDisaster.label}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {severityLevel === 'emergency' && 'Emergency response recommended'}
              {severityLevel === 'urgent' && 'Urgent same-day service recommended'}
              {severityLevel === 'scheduled' && 'Scheduled service available'}
            </p>
          </div>

          {severityLevel === 'emergency' ? (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-600 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-black text-sm uppercase tracking-wider">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                Emergency Service Required
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                {EMERGENCY_PRICING.display} for emergency dispatch and make-safe work
              </p>
              <button
                onClick={() => window.location.href = `/claim/step-1?emergency=true&disaster=${selectedDisaster.id}&pricing_disclosed=true`}
                className="inline-flex items-center justify-center gap-3 w-full px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-lg shadow-red-600/30 transition-[background-color] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] text-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 8l-6-4m6 4l6-4" />
                </svg>
                Request Emergency Service
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => window.location.href = `/get-started?priority=${severityLevel}&disaster=${selectedDisaster.id}`}
              >
                {severityLevel === 'urgent' ? 'Schedule Urgent Service' : 'Get Free Quote'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={reset}
              >
                Start Over
              </Button>
            </div>
          )}

          <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              All contractors are qualified and insurance-approved
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function StepIndicator({ active, completed, label }: { active: boolean; completed: boolean; label: string }) {
  return (
    <div
      className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-[background-color,color,box-shadow] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] ${
        completed
          ? 'bg-blue-600 text-white'
          : active
          ? 'bg-blue-600 text-white ring-4 ring-blue-600/20'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
      }`}
    >
      {completed ? '✓' : label}
    </div>
  );
}

function SeverityOption({
  level,
  title,
  description,
  icon,
  recommended,
  onClick,
}: {
  level: string;
  title: string;
  description: string;
  icon: string;
  recommended: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-[border-color,background-color] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] text-left ${
        recommended
          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-blue-600 bg-white dark:bg-slate-800'
      }`}
    >
      <span className="text-3xl mt-1" aria-hidden="true">{icon}</span>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </span>
          {recommended && (
            <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
              Recommended
            </span>
          )}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>
    </button>
  );
}
