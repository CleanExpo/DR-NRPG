'use client';

import React from 'react';
import Link from 'next/link';
import { MegaMenu, MegaMenuItem, useMegaMenu } from '@/components/nrpg/mega-menu';

// Service pillars data for MegaMenu
const servicePillars: MegaMenuItem[] = [
  {
    id: 'water',
    title: 'Water Damage',
    subtitle: 'Restoration',
    label: 'INDUSTRY PROTOCOL',
    description: '24/7 emergency water damage restoration',
    image: '/images/services/water-card.jpg',
    slug: 'water-damage',
    labelColor: 'text-blue-400'
  },
  {
    id: 'fire',
    title: 'Fire & Smoke',
    subtitle: 'Restoration',
    label: 'FIRE AND SMOKE',
    description: 'Fire and smoke damage restoration',
    image: '/images/services/fire-card.jpg',
    slug: 'fire-smoke-damage',
    labelColor: 'text-red-400'
  },
  {
    id: 'mould',
    title: 'Mould Remediation',
    subtitle: 'Remediation',
    label: 'INDUSTRY PROTOCOL',
    description: 'Professional mould removal and remediation',
    image: '/images/services/mould-card.jpg',
    slug: 'mould-remediation',
    labelColor: 'text-green-400'
  },
  {
    id: 'bio',
    title: 'Biohazard',
    subtitle: 'Cleanup',
    label: 'INDUSTRY PROTOCOL',
    description: 'Certified biohazard and trauma cleanup',
    image: '/images/services/bio-card.jpg',
    slug: 'biohazard-cleanup',
    labelColor: 'text-purple-400'
  },
  {
    id: 'storm',
    title: 'Storm Damage',
    subtitle: 'Restoration',
    label: 'EMERGENCY',
    description: 'Emergency storm and weather damage restoration',
    image: '/images/services/water-card.jpg', // Placeholder: using water-card
    slug: 'storm-damage',
    labelColor: 'text-yellow-400'
  }
];

export default function Header() {
  const servicesMenu = useMegaMenu();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close mobile menu when Services menu opens
  React.useEffect(() => {
    if (servicesMenu.isOpen) {
      setMobileMenuOpen(false);
    }
  }, [servicesMenu.isOpen]);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-br from-[#0F1115] to-[#1a1d29] border-b border-[#374151]/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00BFA6] to-[#7C4DFF] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)]">
                <span className="text-white font-bold text-lg">DR</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#00BFA6] to-[#7C4DFF] bg-clip-text text-transparent">
                  Disaster Recovery
                </h1>
                <p className="text-xs text-[#9CA3AF]">NRPG Platform</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-6 items-center">
              {/* Services Dropdown */}
              <div className="relative">
                <button
                  onClick={servicesMenu.toggle}
                  onMouseEnter={servicesMenu.open}
                  className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium flex items-center gap-1 group"
                  aria-expanded={servicesMenu.isOpen}
                  aria-haspopup="true"
                >
                  Services
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      servicesMenu.isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Regular Links */}
              <Link href="/how-it-works" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium">
                How It Works
              </Link>
              <Link href="/pricing" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium">
                Pricing
              </Link>
              <Link href="/about" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium">
                About
              </Link>
              <Link href="/contractors" className="text-[#00BFA6] hover:text-[#00A693] transition-colors font-semibold">
                Join as Contractor
              </Link>
            </nav>
          </div>

          {/* Right Side - Auth Buttons + Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="px-6 py-2 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium border border-[#374151] rounded-lg hover:border-[#00BFA6] hover:bg-[#00BFA6]/10"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 bg-gradient-to-br from-[#00BFA6] to-[#7C4DFF] text-white rounded-lg font-semibold hover:opacity-90 transition-[opacity,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] shadow-lg shadow-[#00BFA6]/20 hover:shadow-[#00BFA6]/40"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#374151]/50">
            <nav className="flex flex-col gap-4">
              {/* Mobile Services Accordion */}
              <div>
                <button
                  onClick={servicesMenu.toggle}
                  className="w-full text-left text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium flex items-center justify-between py-2"
                >
                  Services
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      servicesMenu.isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Mobile Services List */}
                {servicesMenu.isOpen && (
                  <div className="ml-4 mt-2 flex flex-col gap-2">
                    {servicePillars.map((service) => (
                      <Link
                        key={service.id}
                        href={`/services/${service.slug}`}
                        onClick={() => {
                          servicesMenu.close();
                          setMobileMenuOpen(false);
                        }}
                        className="text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors py-1 flex items-center gap-2"
                      >
                        <span className={`text-xs ${service.labelColor}`}>●</span>
                        {service.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium py-2"
              >
                How It Works
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium py-2"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium py-2"
              >
                About
              </Link>
              <Link
                href="/contractors"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#00BFA6] hover:text-[#00A693] transition-colors font-semibold py-2"
              >
                Join as Contractor
              </Link>

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t border-[#374151]/50 md:hidden">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-2 text-center text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium border border-[#374151] rounded-lg hover:border-[#00BFA6] hover:bg-[#00BFA6]/10"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-2 text-center bg-gradient-to-br from-[#00BFA6] to-[#7C4DFF] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] shadow-lg shadow-[#00BFA6]/20"
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Services MegaMenu - Desktop Only */}
      <div
        className="hidden lg:block relative"
        onMouseLeave={servicesMenu.close}
      >
        <MegaMenu
          items={servicePillars}
          isOpen={servicesMenu.isOpen}
          onClose={servicesMenu.close}
          basePath="/services"
          columns={4}
        />
      </div>
    </header>
  );
}
