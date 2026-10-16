/**
 * Join NRPG Section - Contractor Recruitment CTA
 *
 * Marketing component for recruiting qualified contractors to join
 * the NRPG network.
 *
 * Features:
 * - Compelling value proposition
 * - Benefits showcase
 * - Application CTA
 * - Trust indicators (IICRC, insurance partnerships)
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Button, IICRCBadge } from '@/src/design-system';

interface Benefit {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const CONTRACTOR_BENEFITS: Benefit[] = [
  {
    id: 'leads',
    icon: '🎯',
    title: 'Qualified Lead Generation',
    description: 'Access to pre-qualified restoration projects matched to your trade area — you keep running your own business',
  },
  {
    id: 'standards',
    icon: '⭐',
    title: 'IICRC Quality Standards',
    description: 'A network built on IICRC certification held independently by every contractor — your credentials, your business',
  },
  {
    id: 'support',
    icon: '🤝',
    title: 'Business Support',
    description: 'Marketing, scheduling, and administrative support to help you focus on restoration work',
  },
  {
    id: 'payment',
    icon: '💰',
    title: 'Streamlined Payment',
    description: 'Fast, reliable payment processing — you invoice under your own ABN or NZBN',
  },
];

const REQUIREMENTS = [
  'IICRC certification (AS-IICRC S500:2025, AS-IICRC S520:2025, or FSRT minimum)',
  'Current liability insurance ($1M+ coverage)',
  'Established business with 2+ years experience',
  'Clean safety record and references',
];

interface JoinNRPGSectionProps {
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export function JoinNRPGSection({ variant = 'default', className = '' }: JoinNRPGSectionProps) {
  if (variant === 'compact') {
    return <CompactVariant className={className} />;
  }

  if (variant === 'detailed') {
    return <DetailedVariant className={className} />;
  }

  return <DefaultVariant className={className} />;
}

function DefaultVariant({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-[3rem] overflow-hidden shadow-2xl ${className}`}>
      <div className="grid lg:grid-cols-2 gap-12 p-12 md:p-16">
        {/* Left: Content */}
        <div className="space-y-8 text-white">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-full text-sm font-black uppercase tracking-wider">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Now Accepting Applications
            </div>

            <h2 className="font-display text-4xl md:text-5xl font-black">
              Join the NRPG Network
            </h2>

            <p className="text-xl text-blue-100 leading-relaxed">
              Become part of Australia and New Zealand's premier network of IICRC-certified disaster recovery professionals — each contractor independently licensed, insured, and credentialled.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            {CONTRACTOR_BENEFITS.map((benefit) => (
              <div key={benefit.id} className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0" aria-hidden="true">{benefit.icon}</span>
                <div>
                  <h3 className="font-bold text-lg mb-1">{benefit.title}</h3>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              className="bg-white text-slate-900 hover:bg-blue-50"
              onClick={() => window.location.href = '/contractor/join'}
            >
              Apply to Join Network
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
              onClick={() => window.location.href = '/contractor/portal'}
            >
              Contractor Portal Login
            </Button>
          </div>
        </div>

        {/* Right: Requirements & Trust Indicators */}
        <div className="space-y-6">
          {/* Requirements Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
            <h3 className="font-display text-2xl font-bold text-white mb-6">
              Minimum Requirements
            </h3>
            <ul className="space-y-3">
              {REQUIREMENTS.map((req, index) => (
                <li key={index} className="flex items-start gap-3 text-blue-100">
                  <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust Indicators */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h4 className="font-bold text-white mb-4">Partner Certifications</h4>
            <div className="flex flex-wrap gap-3">
              <IICRCBadge code="S500" size="sm" />
              <IICRCBadge code="S520" size="sm" />
              <IICRCBadge code="FSRT" size="sm" />
              <div className="px-3 py-1.5 bg-white/10 text-white text-xs font-black rounded-full uppercase tracking-wider">
                Insured
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
              <div className="font-display text-3xl font-black text-white mb-1">24/7</div>
              <div className="text-xs text-blue-200 uppercase tracking-wider">Dispatch Network</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactVariant({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl ${className}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <h3 className="font-display text-2xl md:text-3xl font-black mb-2">
            Join Our Network
          </h3>
          <p className="text-blue-100">
            IICRC-certified contractors wanted across Australia and New Zealand. Grow your independent business with qualified leads.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => window.location.href = '/contractor/join'}
          >
            Apply Now
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white/10"
            onClick={() => window.location.href = '/contractor/portal'}
          >
            Portal Login
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailedVariant({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <div className="text-center mb-12">
        <h2 className="font-display text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
          Grow Your Restoration Business
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          Join Australia and New Zealand's fastest-growing network of independently credentialled, IICRC-certified disaster recovery professionals
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {CONTRACTOR_BENEFITS.map((benefit) => (
          <div key={benefit.id} className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-3xl">
                {benefit.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DefaultVariant />
    </div>
  );
}
