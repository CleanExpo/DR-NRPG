/**
 * DesignOS Success State Component
 *
 * Subtle professional success feedback (Strategic Decision)
 * No confetti, no sounds - inappropriate for crisis situations
 *
 * Example: "Help Is On The Way" after emergency intake submission
 * - Green checkmark
 * - Calm confirmation text
 * - Clear next steps
 * - Professional, reassuring tone
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';
import { Button } from '../Button/Button';

export interface NextStep {
  number: number;
  text: string;
}

export interface SuccessStateProps {
  title: string;
  message: string;
  nextSteps?: NextStep[];
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function SuccessState({
  title,
  message,
  nextSteps,
  primaryAction,
  secondaryAction,
  icon,
  className,
}: SuccessStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      {/* Icon */}
      {icon || <CheckCircle className="h-16 w-16 text-green-600 mb-4" />}

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">{title}</h2>

      {/* Message */}
      <p className="text-gray-600 text-center max-w-md mb-6">{message}</p>

      {/* Next Steps (if provided) */}
      {nextSteps && nextSteps.length > 0 && (
        <div className="w-full max-w-md p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
          <p className="text-sm font-semibold text-green-900 mb-3">Next Steps:</p>
          <ol className="space-y-2">
            {nextSteps.map((step) => (
              <li key={step.number} className="text-sm text-green-900 flex gap-2">
                <span className="font-semibold">{step.number}.</span>
                <span>{step.text}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {primaryAction && (
            <Button
              variant="education-primary"
              size="lg"
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              size="lg"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Example usage (Emergency intake success):
 *
 * <SuccessState
 *   title="Help Is On The Way"
 *   message="We've matched you with 3 qualified contractors in Sydney. You'll receive calls within 30 minutes."
 *   nextSteps={[
 *     { number: 1, text: 'Answer contractor calls (expect 3 calls)' },
 *     { number: 2, text: 'Choose your preferred contractor' },
 *     { number: 3, text: 'They'll arrive within 2 hours' }
 *   ]}
 *   primaryAction={{
 *     label: 'View My Dashboard',
 *     onClick: () => router.push('/dashboard/client')
 *   }}
 *   secondaryAction={{
 *     label: 'Track Progress',
 *     onClick: () => router.push('/dashboard/client/requests')
 *   }}
 * />
 */
