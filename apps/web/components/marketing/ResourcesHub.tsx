/**
 * Resources Hub - Featured Content Section
 *
 * Marketing component showcasing educational resources, guides,
 * and helpful content for disaster recovery.
 *
 * Features:
 * - Featured articles and guides
 * - Quick links to resources
 * - Emergency checklists
 * - Educational content cards
 */

'use client';

import React from 'react';
import Link from 'next/link';

interface Resource {
  id: string;
  type: 'guide' | 'article' | 'checklist' | 'video';
  title: string;
  description: string;
  icon: string;
  href: string;
  readTime?: string;
  featured?: boolean;
}

const FEATURED_RESOURCES: Resource[] = [
  {
    id: 'emergency-checklist',
    type: 'checklist',
    title: 'Emergency Response Checklist',
    description: 'Essential steps to take in the first 24 hours after a disaster',
    icon: '📋',
    href: '/resources/emergency-checklist',
    readTime: '5 min',
    featured: true,
  },
  {
    id: 'insurance-guide',
    type: 'guide',
    title: 'Insurance Claims Guide',
    description: 'Navigate the insurance claims process with confidence',
    icon: '📄',
    href: '/resources/insurance-guide',
    readTime: '10 min',
    featured: true,
  },
  {
    id: 'water-damage-101',
    type: 'article',
    title: 'Water Damage 101',
    description: 'Understanding water damage categories and restoration processes',
    icon: '💧',
    href: '/resources/water-damage-101',
    readTime: '7 min',
  },
  {
    id: 'fire-safety',
    type: 'article',
    title: 'Fire Safety & Prevention',
    description: 'Protect your property with proactive fire safety measures',
    icon: '🔥',
    href: '/resources/fire-safety',
    readTime: '8 min',
  },
  {
    id: 'mold-prevention',
    type: 'guide',
    title: 'Mould Prevention Guide',
    description: 'Keep your property mould-free with these expert tips',
    icon: '🦠',
    href: '/resources/mold-prevention',
    readTime: '6 min',
  },
  {
    id: 'disaster-prep',
    type: 'video',
    title: 'Disaster Preparedness Video Series',
    description: 'Visual guides to preparing your home or business for disasters',
    icon: '🎥',
    href: '/resources/disaster-prep-videos',
    readTime: '15 min',
  },
  {
    id: 'insurance-claim-advocate',
    type: 'guide',
    title: 'Professional Restoration Reports & Scope of Works',
    description: 'How qualified restoration experts assess damage, document findings, and deliver a professional scope of works and estimate — to Australian standards.',
    icon: '🛡️',
    href: '/insurance-claim-advocate',
    readTime: '8 min',
    featured: true,
  },
];

interface ResourcesHubProps {
  title?: string;
  subtitle?: string;
  maxItems?: number;
  showFeaturedOnly?: boolean;
  className?: string;
}

export function ResourcesHub({
  title = 'Knowledge Center',
  subtitle = 'Expert guides and resources for disaster recovery',
  maxItems = 6,
  showFeaturedOnly = false,
  className = '',
}: ResourcesHubProps) {
  const displayResources = showFeaturedOnly
    ? FEATURED_RESOURCES.filter((r) => r.featured)
    : FEATURED_RESOURCES.slice(0, maxItems);

  const featuredResource = displayResources.find((r) => r.featured);
  const otherResources = displayResources.filter((r) => !r.featured || showFeaturedOnly);

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

      {/* Featured + Grid Layout */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Featured Resource - Large Card */}
        {featuredResource && !showFeaturedOnly && (
          <div className="lg:col-span-7">
            <FeaturedResourceCard resource={featuredResource} />
          </div>
        )}

        {/* Other Resources - Grid */}
        <div className={`${featuredResource && !showFeaturedOnly ? 'lg:col-span-5' : 'lg:col-span-12'} grid gap-6 ${showFeaturedOnly ? 'md:grid-cols-2' : ''}`}>
          {otherResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} compact={!showFeaturedOnly && !!featuredResource} />
          ))}
        </div>
      </div>

      {/* View All Link */}
      <div className="text-center mt-12">
        <Link
          href="/resources"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:gap-3 transition-[gap] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]"
        >
          View All Resources
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function FeaturedResourceCard({ resource }: { resource: Resource }) {
  const typeColors = {
    guide: 'bg-blue-600',
    article: 'bg-green-600',
    checklist: 'bg-orange-600',
    video: 'bg-purple-600',
  };

  return (
    <Link
      href={resource.href}
      className="group block h-full bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-3xl overflow-hidden shadow-2xl hover:shadow-blue-500/20 transition-[transform,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-2"
    >
      <div className="p-8 md:p-10 h-full flex flex-col">
        {/* Type Badge */}
        <div className="flex items-center gap-3 mb-6">
          <span className={`px-4 py-2 ${typeColors[resource.type]} text-white text-xs font-black uppercase tracking-wider rounded-full`}>
            {resource.type}
          </span>
          {resource.readTime && (
            <span className="text-sm text-slate-400">
              {resource.readTime} read
            </span>
          )}
        </div>

        {/* Icon */}
        <div className="mb-6">
          <span className="text-6xl" aria-hidden="true">{resource.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          <h3 className="font-display text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">
            {resource.title}
          </h3>
          <p className="text-lg text-slate-300 leading-relaxed">
            {resource.description}
          </p>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 text-blue-400 font-bold mt-6 group-hover:gap-3 transition-[gap] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]">
          Read More
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function ResourceCard({ resource, compact = false }: { resource: Resource; compact?: boolean }) {
  const typeColors = {
    guide: 'text-blue-600 dark:text-blue-400',
    article: 'text-green-600 dark:text-green-400',
    checklist: 'text-orange-600 dark:text-orange-400',
    video: 'text-purple-600 dark:text-purple-400',
  };

  return (
    <Link
      href={resource.href}
      className="group block bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-[transform,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-1"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <span className="text-4xl" aria-hidden="true">{resource.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Type & Read Time */}
          <div className="flex items-center gap-2 text-xs">
            <span className={`font-black uppercase tracking-wider ${typeColors[resource.type]}`}>
              {resource.type}
            </span>
            {resource.readTime && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {resource.readTime}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h4 className={`font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${compact ? 'text-base' : 'text-lg'}`}>
            {resource.title}
          </h4>

          {/* Description */}
          {!compact && (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {resource.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// Compact List Variant
export function ResourcesList({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {FEATURED_RESOURCES.slice(0, 4).map((resource) => (
        <Link
          key={resource.id}
          href={resource.href}
          className="group flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-[background-color] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]"
        >
          <span className="text-2xl" aria-hidden="true">{resource.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {resource.title}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {resource.readTime} • {resource.type}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
