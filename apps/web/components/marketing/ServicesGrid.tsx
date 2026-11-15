// @ts-nocheck

/**
 * Services Grid - Visual Grid of Disaster Types
 *
 * Marketing component displaying service categories with visual imagery,
 * icons, and quick navigation to service pages.
 *
 * Features:
 * - Visual card grid with imagery
 * - Hover effects and interactions
 * - IICRC protocol badges
 * - Mobile-responsive layout
 * - Performance optimized images
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { IICRCBadge } from '@/src/design-system';
import { WaterDamage, FireSmoke, MouldRemediation, BioForensic } from '@/icons';

type ServiceIconComponent = React.ComponentType<{ size?: string; gradient?: string; className?: string }>;

interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: ServiceIconComponent;
  image: string;
  iicrcCodes: string[];
  href: string;
  color: 'blue' | 'orange' | 'green' | 'purple';
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'water',
    title: 'Water & Flood Restoration',
    description: 'Emergency water extraction, structural drying, and flood damage recovery',
    icon: WaterDamage,
    image: '/images/services/water-damage.jpg',
    iicrcCodes: [],
    href: '/services/water-flood-restoration',
    color: 'blue',
  },
  {
    id: 'fire',
    title: 'Fire & Smoke Remediation',
    description: 'Fire damage restoration, smoke odor removal, and structural cleaning',
    icon: FireSmoke,
    image: '/images/services/fire-smoke.jpg',
    iicrcCodes: ['FSRT'],
    href: '/services/fire-smoke-remediation',
    color: 'orange',
  },
  {
    id: 'mold',
    title: 'Mould & Air Quality',
    description: 'Professional mould remediation and indoor air quality restoration',
    icon: MouldRemediation,
    image: '/images/services/mould-remediation.jpg',
    iicrcCodes: [],
    href: '/services/mould-air-quality',
    color: 'green',
  },
  {
    id: 'bio',
    title: 'Biohazard & Forensic Cleaning',
    description: 'Crime scene cleanup, trauma decontamination, and biohazard removal',
    icon: BioForensic,
    image: '/images/services/biohazard.jpg',
    iicrcCodes: [],
    href: '/services/bio-forensic-cleaning',
    color: 'purple',
  },
];

interface ServicesGridProps {
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
  showIICRCBadges?: boolean;
  className?: string;
}

export function ServicesGrid({
  title = 'Our Services',
  subtitle = 'Professional restoration for every disaster type',
  columns = 4,
  showIICRCBadges = true,
  className = '',
}: ServicesGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={className}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="text-center mb-12">
          {title && (
            <h2 className="font-display text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Grid */}
      <div className={`grid gap-6 ${gridCols}`}>
        {SERVICE_CATEGORIES.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            showIICRCBadges={showIICRCBadges}
          />
        ))}
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  showIICRCBadges,
}: {
  service: ServiceCategory;
  showIICRCBadges: boolean;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700',
    orange: 'from-orange-500 to-orange-600 group-hover:from-orange-600 group-hover:to-orange-700',
    green: 'from-green-500 to-green-600 group-hover:from-green-600 group-hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 group-hover:from-purple-600 group-hover:to-purple-700',
  }[service.color];

  return (
    <Link
      href={service.href}
      className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-[transform,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-2"
    >
      {/* Image Background with Gradient Overlay */}
      <div className="relative h-48 bg-slate-200 dark:bg-slate-800 overflow-hidden">
        {/* Placeholder gradient (replace with actual images) */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses} opacity-80 transition-[opacity] duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]`} />

        {/* Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <service.icon
            size="hero"
            gradient={service.color === 'blue' ? 'water' : service.color === 'orange' ? 'fire' : service.color === 'green' ? 'mould' : 'bio'}
            className="opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-[transform,opacity] duration-300 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)]"
            aria-hidden="true"
          />
        </div>

        {/* IICRC Badges - Top Right */}
        {showIICRCBadges && service.iicrcCodes.length > 0 && (
          <div className="absolute top-4 right-4 flex gap-2">
            {service.iicrcCodes.map((code) => (
              <IICRCBadge key={code} code={code as any} size="sm" />
            ))}
          </div>
        )}

        {/* Active Indicator */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              24/7 Available
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {service.title}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
          {service.description}
        </p>

        {/* Arrow Indicator */}
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          Learn More
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-600 rounded-3xl transition-colors pointer-events-none" />
    </Link>
  );
}

// Compact variant for sidebar/footer
export function ServicesGridCompact({ className = '' }: { className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {SERVICE_CATEGORIES.map((service) => (
        <Link
          key={service.id}
          href={service.href}
          className="group flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-[background-color] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]"
        >
          <service.icon
            size="lg"
            className="flex-shrink-0 text-slate-600 dark:text-slate-400"
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {service.title}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
