// @ts-nocheck

/**
 * EmergencyHero Component
 *
 * Full-width hero section for the public Disaster Recovery Australia site.
 * Features emergency CTAs, trust signals, and responsive design optimized for
 * users in crisis situations.
 *
 * Design Principles:
 * - Emerald green (#10B981) accent colors with white/light background
 * - Red emergency CTA (#DC2626) for urgency
 * - Large touch targets for mobile (56px minimum)
 * - Clear visual hierarchy with professional credibility signals
 * - Accessibility-first with semantic HTML and ARIA labels
 *
 * @module components/public/sections/EmergencyHero
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/src/design-system'
import { AlertCircle, MapPin, Calculator, Award, Clock, Shield, Phone, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'

/**
 * Animation variants for scroll-reveal effects
 */
const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
}

const scaleIn = {
  hidden: {
    opacity: 0,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  }
}

/**
 * Trust badge component for credibility indicators
 */
interface TrustBadgeProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  variant?: 'emerald' | 'blue' | 'amber'
}

const TrustBadge: React.FC<TrustBadgeProps> = ({ icon, title, subtitle, variant = 'emerald' }) => {
  const variantStyles = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700'
  }

  return (
    <motion.div
      variants={fadeInUp}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${variantStyles[variant]} backdrop-blur-sm`}
    >
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-sm leading-tight">{title}</span>
        <span className="text-xs opacity-80 leading-tight">{subtitle}</span>
      </div>
    </motion.div>
  )
}

/**
 * Main EmergencyHero component
 *
 * Displays hero section with:
 * - Large headline and subheading
 * - Three prominent CTA buttons (Report, Find, Quote)
 * - Trust signals (certifications, Insurance, 24/7)
 * - Responsive layout with mobile optimization
 * - Subtle animations on scroll reveal
 */
export function EmergencyHero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section
      className="relative w-full min-h-[calc(100vh-80px)] lg:min-h-[700px] bg-gradient-to-br from-slate-50 via-emerald-50 to-white overflow-hidden"
      aria-label="Emergency disaster recovery services hero section"
    >
      {/* Background Pattern/Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #10B981 1px, transparent 1px),
              linear-gradient(to bottom, #10B981 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px'
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={staggerContainer}
          className="flex flex-col items-center text-center"
        >
          {/* Emergency Badge */}
          <motion.div
            variants={scaleIn}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-red-50 border border-red-200 rounded-full text-red-700"
          >
            <Phone className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-semibold">24/7 Emergency Response Available</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={fadeInUp}
            className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 max-w-5xl tracking-tight"
          >
            <span className="block">24/7 Emergency</span>
            <span className="block bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Disaster Recovery
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl lg:text-2xl text-gray-400 mb-4 max-w-3xl leading-relaxed"
          >
            Priority dispatch to verified restoration contractors,{' '}
            <span className="font-semibold text-emerald-600">24/7 across Australia</span>
          </motion.p>

          <motion.p
            variants={fadeInUp}
            className="text-base sm:text-lg text-gray-400 mb-12 max-w-2xl"
          >
            Australia&apos;s trusted network of certified disaster recovery specialists.
            Fire, flood, storm, or mould - we&apos;re here to help restore your property.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16 px-4 sm:px-0"
          >
            {/* Report a Claim - Emergency Red */}
            <Link href="/claim/step-1" className="flex-1 sm:flex-initial">
              <Button
                size="xl"
                variant="emergency"
                className="w-full sm:w-auto min-w-[200px] shadow-lg hover:shadow-xl transition-shadow"
                icon={<AlertCircle className="h-5 w-5" />}
                iconPosition="left"
                aria-label="Report an emergency claim"
              >
                Report a Claim
              </Button>
            </Link>

            {/* Find a Contractor - Emerald Green */}
            <Link href="/contractors/directory" className="flex-1 sm:flex-initial">
              <Button
                size="xl"
                variant="contractor-accent"
                className="w-full sm:w-auto min-w-[200px] shadow-lg hover:shadow-xl transition-shadow"
                icon={<MapPin className="h-5 w-5" />}
                iconPosition="left"
                aria-label="Find a certified contractor near you"
              >
                Find a Contractor
              </Button>
            </Link>

            {/* Get a Quote - Blue Outline */}
            <Link href="/claim/step-1" className="flex-1 sm:flex-initial">
              <Button
                size="xl"
                variant="outline"
                className="w-full sm:w-auto min-w-[200px] border-2 border-blue-500 text-blue-600 hover:bg-blue-50 shadow-md hover:shadow-lg transition-[background-color,box-shadow] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]"
                icon={<Calculator className="h-5 w-5" />}
                iconPosition="left"
                aria-label="Get a free quote"
              >
                Get a Quote
              </Button>
            </Link>
          </motion.div>

          {/* Trust Signals / Credibility Section */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl"
          >
            {/* Qualified Contractors */}
            <TrustBadge
              icon={<Award className="h-6 w-6" />}
              title="Qualified Contractors"
              subtitle="Industry-standard training"
              variant="emerald"
            />

            {/* Insurance Approved */}
            <TrustBadge
              icon={<Shield className="h-6 w-6" />}
              title="Insurance Approved"
              subtitle="Insurance-ready documentation"
              variant="blue"
            />

            {/* 24/7 Available */}
            <TrustBadge
              icon={<Clock className="h-6 w-6" />}
              title="Available 24/7"
              subtitle="Emergency response ready"
              variant="amber"
            />
          </motion.div>

          {/* Additional Trust Indicators */}
          <motion.div
            variants={fadeInUp}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>Licensed & Insured</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>Australia-Wide Coverage</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>Fixed-Price Make-Safe</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Hero Image - Using next/image with priority */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="/images/marketing/emergency-response.jpg"
          alt="24/7 Emergency Disaster Recovery Australia"
          width={1200}
          height={630}
          priority
          sizes="100vw"
          quality={85}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  )
}

/**
 * Export type for external use
 */
export type EmergencyHeroProps = Record<string, never>