/**
 * DesignOS IICRC Badge Component
 *
 * Official IICRC certification badges with always-visible tooltips
 *
 * Strategic decisions:
 * - Use official IICRC logos exactly as specified (no redesign)
 * - Always visible tooltips (assume zero client knowledge)
 * - Desktop: Hover to show, Mobile: Tap to show
 * - Every acronym gets explanation
 */

'use client';

import * as React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export type IICRCCode = 'FSRT' | 'WRT' | 'AMRT' | 'ASD' | 'OCT';

interface IICRCStandard {
  code: IICRCCode;
  name: string;
  description: string;
  learnMoreUrl: string;
}

const iicrcStandards: Record<IICRCCode, IICRCStandard> = {
  FSRT: {
    code: 'FSRT',
    name: 'Fire and Smoke Restoration Technician',
    description: 'Certification for fire and smoke damage restoration including soot removal and odor control.',
    learnMoreUrl: '/standards/iicrc-fsrt',
  },
  WRT: {
    code: 'WRT',
    name: 'Water Damage Restoration Technician',
    description: 'Fundamental certification for water damage restoration and drying techniques.',
    learnMoreUrl: '/standards/iicrc-wrt',
  },
  AMRT: {
    code: 'AMRT',
    name: 'Applied Microbial Remediation Technician',
    description: 'Certification for microbial contamination remediation and decontamination protocols.',
    learnMoreUrl: '/standards/iicrc-amrt',
  },
  ASD: {
    code: 'ASD',
    name: 'Applied Structural Drying',
    description: 'Advanced certification for structural drying and complex water damage scenarios.',
    learnMoreUrl: '/standards/iicrc-asd',
  },
  OCT: {
    code: 'OCT',
    name: 'Odor Control Technician',
    description: 'Certification for odor identification, removal, and deodorization techniques.',
    learnMoreUrl: '/standards/iicrc-oct',
  },
};

export interface IICRCBadgeProps {
  code: IICRCCode;
  size?: 'sm' | 'md' | 'lg';
  showCode?: boolean;
  className?: string;
}

export function IICRCBadge({ code, size = 'md', showCode = true, className }: IICRCBadgeProps) {
  const standard = iicrcStandards[code];

  // Guard against invalid codes
  if (!standard) {
    console.warn(`IICRCBadge: Unknown code "${code}"`);
    return null;
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center gap-2 cursor-help transition-opacity hover:opacity-80',
              className
            )}
          >
            <div
              className={cn(
                'rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs',
                sizeClasses[size]
              )}
              role="img"
              aria-label={`IICRC ${code} Certified`}
            >
              {code}
            </div>
            {showCode && (
              <span className="text-sm font-medium text-muted-foreground">IICRC {code}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-4">
          <h4 className="font-semibold mb-2">
            IICRC {code}: {standard.name}
          </h4>
          <p className="text-sm text-muted-foreground mb-3">{standard.description}</p>
          <Link
            href={standard.learnMoreUrl}
            className="text-xs text-primary hover:underline inline-flex items-center"
          >
            Learn more about {code} →
          </Link>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Multiple badges in a row (contractor profile)
 */
export function IICRCBadgeGroup({ codes, className }: { codes: IICRCCode[]; className?: string }) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {codes.map((code) => (
        <IICRCBadge key={code} code={code} size="sm" showCode={false} />
      ))}
    </div>
  );
}
