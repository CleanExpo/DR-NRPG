'use client'

import React from 'react'
import { Button } from '@/src/design-system'
import { TrendingUp, Briefcase, Zap, Award, Calendar, Shield } from 'lucide-react'
import Link from 'next/link'

export function ContractorHero() {
  const trustBadges = [
    {
      icon: Shield,
      text: 'Verified Platform',
    },
    {
      icon: Award,
      text: 'Vetted Jobs Only',
    },
  ]

  return (
    <section
      className="relative w-full min-h-[600px] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden"
      aria-labelledby="contractor-hero-heading"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(0,191,166,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_rgba(0,71,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Accent Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid gap-12 items-center">
          {/* Left Column - Main Content */}
          <div className="space-y-8">
            {/* Trust Badges - Mobile Top */}
            <div className="flex flex-wrap gap-4 lg:hidden">
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-slate-300"
                >
                  <badge.icon className="w-4 h-4 text-teal-400" aria-hidden="true" />
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1
                id="contractor-hero-heading"
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
              >
                Grow Your{' '}
                <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                  Restoration Business
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-slate-300 leading-relaxed max-w-2xl">
                Join the NRPG restoration contractor network. Access vetted jobs, grow revenue, and build your reputation.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup?type=contractor" className="inline-block">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white font-semibold px-8 py-6 text-lg shadow-lg shadow-teal-500/25 transition-[transform,box-shadow,background-color] duration-300 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] hover:shadow-xl hover:shadow-teal-500/30 hover:scale-105"
                  aria-label="Create contractor account"
                >
                  <TrendingUp className="w-5 h-5 mr-2" aria-hidden="true" />
                  Create Account
                </Button>
              </Link>

              <Link href="/contractor/opportunities" className="inline-block">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-400 font-semibold px-8 py-6 text-lg transition-[transform,border-color,background-color,color] duration-300 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] hover:scale-105"
                  aria-label="Browse available opportunities"
                >
                  <Briefcase className="w-5 h-5 mr-2" aria-hidden="true" />
                  Browse Opportunities
                </Button>
              </Link>
            </div>

            {/* Trust Badges - Desktop */}
            <div className="hidden lg:flex flex-wrap gap-6 pt-4">
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-slate-300"
                >
                  <badge.icon className="w-5 h-5 text-teal-400" aria-hidden="true" />
                  <span className="font-medium">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Value Proposition Banner */}
        <div className="mt-16 lg:mt-20">
          <div className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-slate-700/50">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="p-2 rounded-lg bg-teal-500/20">
                    <Zap className="w-6 h-6 text-teal-400" aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Instant Job Matching
                  </h3>
                  <p className="text-sm text-slate-400">
                    AI-powered matching connects you with the right opportunities based on your expertise and location.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Shield className="w-6 h-6 text-blue-400" aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Verified Clients Only
                  </h3>
                  <p className="text-sm text-slate-400">
                    Work with pre-screened clients and insurance companies. No time wasters, just legitimate projects.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="p-2 rounded-lg bg-teal-500/20">
                    <Award className="w-6 h-6 text-teal-400" aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Build Your Reputation
                  </h3>
                  <p className="text-sm text-slate-400">
                    Earn verified reviews and showcase your expertise to attract premium clients and higher-value projects.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
    </section>
  )
}
