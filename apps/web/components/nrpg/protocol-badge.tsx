/**
 * Protocol Badge Component - NRPG Brand
 *
 * Small uppercase labels with wide tracking
 * Used for service protocols, certifications, and status indicators
 * Pattern from Phil McGurk's DisasterRecovery.com.au design
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProtocolBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'blue' | 'green' | 'orange' | 'red' | 'slate' | 'white';
  children: React.ReactNode;
}

const variantClasses = {
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  green: 'bg-green-50 text-green-700 border-green-100',
  orange: 'bg-orange-50 text-orange-700 border-orange-100',
  red: 'bg-red-50 text-red-700 border-red-100',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  white: 'bg-white/10 text-white border-white/20',
};

export function ProtocolBadge({
  variant = 'blue',
  children,
  className,
  ...props
}: ProtocolBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-4 py-1.5 rounded-full border',
        'text-[10px] font-black tracking-[0.3em] uppercase',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Variant: With status indicator
export function ProtocolBadgeWithStatus({
  children,
  status = 'active',
  ...props
}: ProtocolBadgeProps & { status?: 'active' | 'inactive' }) {
  return (
    <ProtocolBadge {...props}>
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'
        )}
      />
      {children}
    </ProtocolBadge>
  );
}

// Variant: Protocol labels for service pillars
export function ServiceProtocolBadge({
  protocol,
  color = 'blue',
}: {
  protocol: string;
  color?: 'blue' | 'orange' | 'green' | 'red';
}) {
  const colorClasses = {
    blue: 'text-blue-400',
    orange: 'text-orange-400',
    green: 'text-green-400',
    red: 'text-red-400',
  };

  return (
    <span className={cn(
      'text-[10px] font-black tracking-[0.3em] uppercase',
      colorClasses[color]
    )}>
      {protocol}
    </span>
  );
}
