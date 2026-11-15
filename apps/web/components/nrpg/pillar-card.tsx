// @ts-nocheck

/**
 * NRPG PillarCard Component
 *
 * Service pillar card with large background image and protocol badge.
 * Pattern from Phil McGurk's DisasterRecovery.com.au design.
 *
 * Features:
 * - Height 440px, rounded-[2.5rem]
 * - Large background image with gradient overlay
 * - Protocol badge (colored, small uppercase)
 * - Service title at bottom (Space Grotesk)
 * - Hover: image scales to 1.1, shadow increases
 * - Shimmer loading state
 * - Click handler for navigation
 * - Accessibility support
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { designTokens } from '@/lib/design-tokens';

// Types
export interface PillarCardData {
  id: string;
  title: string;
  subtitle?: string;
  protocol: string; // Badge text (e.g., "Industry Protocol")
  protocolColor?:
    | 'blue'
    | 'orange'
    | 'green'
    | 'red'
    | 'purple'
    | 'yellow'
    | string; // Color variant or custom Tailwind class
  image: string; // Path to image
  slug: string; // URL path
  services?: string[]; // List of services (optional)
  description?: string;
}

export interface PillarCardProps {
  /** Pillar data */
  data: PillarCardData;
  /** Base path for routing (e.g., "/services") */
  basePath?: string;
  /** Whether to show loading shimmer (default: false) */
  isLoading?: boolean;
  /** Click handler (alternative to link navigation) */
  onClick?: (data: PillarCardData) => void;
  /** Custom className for container */
  className?: string;
  /** Whether card is interactive (default: true) */
  interactive?: boolean;
}

/**
 * Get protocol badge color classes
 */
function getProtocolColorClasses(color?: string): {
  text: string;
  bg: string;
  border: string;
} {
  const colorMap: Record<
    string,
    { text: string; bg: string; border: string }
  > = {
    blue: {
      text: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
    },
    orange: {
      text: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
    },
    green: {
      text: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
    },
    red: {
      text: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
    },
    purple: {
      text: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
    },
    yellow: {
      text: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
    },
  };

  // If color starts with "text-", assume it's a custom Tailwind class
  if (color?.startsWith('text-')) {
    return {
      text: color,
      bg: 'bg-white/5',
      border: 'border-white/10',
    };
  }

  return colorMap[color || 'blue'] || colorMap.blue;
}

/**
 * PillarCard - Service pillar card with background image
 *
 * @example
 * ```tsx
 * <PillarCard
 *   data={{
 *     id: 'water',
 *     title: 'Flood & Water',
 *     subtitle: 'Damage Restoration',
 *     protocol: 'Industry Protocol',
 *     protocolColor: 'blue',
 *     image: '/images/services/water.jpg',
 *     slug: 'flood-water-damage'
 *   }}
 *   basePath="/services"
 * />
 * ```
 */
export function PillarCard({
  data,
  basePath = '',
  isLoading = false,
  onClick,
  className = '',
  interactive = true,
}: PillarCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const protocolColors = getProtocolColorClasses(data.protocolColor);
  const href = `${basePath}/${data.slug}`;

  // Show loading state
  if (isLoading) {
    return <PillarCardSkeleton className={className} />;
  }

  const cardContent = (
    <>
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden rounded-[2.5rem]">
        <Image
          src={data.image}
          alt={`${data.title} - ${data.protocol}`}
          fill
          className={`object-cover transition-[opacity,transform] duration-700 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          } ${isHovered ? 'scale-110' : 'scale-100'}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onLoad={() => setImageLoaded(true)}
          priority={false}
        />

        {/* Gradient Overlay - Bottom to Top */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/60 to-transparent transition-opacity duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] ${
            isHovered ? 'opacity-100' : 'opacity-90'
          }`}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col justify-between p-8">
        {/* Protocol Badge - Top */}
        <div className="flex justify-start">
          <div
            className={`
              label-small px-4 py-2 rounded-full border backdrop-blur-sm
              ${protocolColors.text} ${protocolColors.bg} ${protocolColors.border}
              transition-transform duration-300 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)]
              ${isHovered ? 'scale-105' : 'scale-100'}
            `}
          >
            {data.protocol}
          </div>
        </div>

        {/* Title & Subtitle - Bottom */}
        <div className="space-y-2">
          <h3 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
            {data.title}
          </h3>

          {data.subtitle && (
            <p className="text-lg text-slate-300 font-medium">{data.subtitle}</p>
          )}

          {/* Services List - Shows on hover */}
          {data.services && data.services.length > 0 && (
            <ul
              className={`
                mt-4 space-y-1 text-sm text-slate-400
                transition-[opacity,transform] duration-300 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)]
                ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
              `}
            >
              {data.services.slice(0, 3).map((service, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Description - Shows on hover */}
          {data.description && (
            <p
              className={`
                mt-3 text-sm text-slate-400 line-clamp-2
                transition-opacity duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]
                ${isHovered ? 'opacity-100' : 'opacity-0'}
              `}
            >
              {data.description}
            </p>
          )}
        </div>
      </div>

      {/* Hover Arrow Indicator */}
      <div
        className={`
          absolute bottom-8 right-8 z-10
          w-12 h-12 flex items-center justify-center
          rounded-full bg-blue-600 text-white
          transition-[opacity,transform] duration-300 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)]
          ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
        `}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </>
  );

  // Wrapper element (Link or div)
  const Wrapper = interactive && !onClick ? Link : 'div';

  const wrapperProps = interactive
    ? onClick
      ? {
          onClick: () => onClick(data),
          role: 'button',
          tabIndex: 0,
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick(data);
            }
          },
        }
      : {
          href,
        }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`
        relative block group
        h-[440px] rounded-[2.5rem] overflow-hidden
        bg-slate-900
        transition-[transform,box-shadow] duration-500 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)]
        ${
          interactive
            ? 'hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-4 cursor-pointer'
            : ''
        }
        ${className}
      `}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      aria-label={`${data.title} - ${data.protocol}`}
    >
      {cardContent}
    </Wrapper>
  );
}

/**
 * PillarCardSkeleton - Loading state with shimmer effect
 */
function PillarCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`
        relative h-[440px] rounded-[2.5rem] overflow-hidden
        bg-slate-200 dark:bg-slate-800
        ${className}
      `}
    >
      <div className="shimmer absolute inset-0" />

      <div className="relative z-10 h-full flex flex-col justify-between p-8">
        {/* Badge skeleton */}
        <div className="w-32 h-8 bg-slate-300 dark:bg-slate-700 rounded-full shimmer" />

        {/* Title skeleton */}
        <div className="space-y-3">
          <div className="w-3/4 h-10 bg-slate-300 dark:bg-slate-700 rounded shimmer" />
          <div className="w-1/2 h-6 bg-slate-300 dark:bg-slate-700 rounded shimmer" />
        </div>
      </div>
    </div>
  );
}

/**
 * PillarCardGrid - Grid container for multiple pillar cards
 *
 * @example
 * ```tsx
 * <PillarCardGrid>
 *   {SERVICE_PILLARS.map(pillar => (
 *     <PillarCard key={pillar.id} data={pillar} />
 *   ))}
 * </PillarCardGrid>
 * ```
 */
export function PillarCardGrid({
  children,
  columns = 4,
  className = '',
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {children}
    </div>
  );
}

export default PillarCard;
