/**
 * MobileMenu Component
 *
 * Full-screen mobile navigation menu with animated slide-in from right.
 * Matches desktop MegaMenu navigation structure with touch-friendly targets.
 *
 * Features:
 * - Animated slide-in/out transitions
 * - Full-screen overlay
 * - Nested navigation (Services, Sectors, Locations)
 * - Emergency CTA button
 * - Touch-friendly 48px minimum targets
 * - Closes on route change
 * - Accessible (keyboard + screen reader)
 *
 * @component MobileMenu
 * @author NRPG Platform
 * @date 2025-12-29
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ChevronRight } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const services = [
  { name: 'Flood & Water', href: '/services/flood-water', icon: '💧' },
  { name: 'Fire & Smoke', href: '/services/fire-smoke', icon: '🔥' },
  { name: 'Mould Growth', href: '/services/mould', icon: '🦠' },
  { name: 'Bio & Forensic', href: '/services/bio-forensic', icon: '🧪' },
];

const sectors = [
  { name: 'Residential Advocacy', href: '/sectors/residential', icon: '🏠' },
  { name: 'Commercial Continuity', href: '/sectors/commercial', icon: '🏢' },
  { name: 'Industrial Infrastructure', href: '/sectors/industrial', icon: '🏭' },
  { name: 'Insurance Partners', href: '/sectors/insurance', icon: '🤝' },
];

const locations = [
  { name: 'New South Wales', short: 'NSW', href: '/locations/nsw' },
  { name: 'Victoria', short: 'VIC', href: '/locations/vic' },
  { name: 'Queensland', short: 'QLD', href: '/locations/qld' },
  { name: 'Western Australia', short: 'WA', href: '/locations/wa' },
  { name: 'South Australia', short: 'SA', href: '/locations/sa' },
  { name: 'Tasmania', short: 'TAS', href: '/locations/tas' },
  { name: 'ACT Canberra', short: 'ACT', href: '/locations/act' },
  { name: 'Northern Territory', short: 'NT', href: '/locations/nt' },
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Close menu when route changes
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Menu Panel */}
      <div
        className={`
          fixed top-0 right-0 bottom-0 w-full max-w-sm
          bg-white dark:bg-slate-900
          shadow-2xl z-50 lg:hidden
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          overflow-y-auto overscroll-contain
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xl">N</span>
            </div>
            <div>
              <div className="font-display font-black text-lg text-slate-900 dark:text-white">
                NRPG
              </div>
              <div className="text-[8px] font-black text-slate-500 tracking-[0.2em] uppercase">
                National Restoration
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-slate-900 dark:text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-6 py-6 space-y-6">
          {/* Services Section */}
          <div>
            <button
              onClick={() => toggleSection('services')}
              className="w-full flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="font-bold text-slate-900 dark:text-white">
                Services
              </span>
              <ChevronRight
                className={`w-5 h-5 text-slate-500 transition-transform ${
                  expandedSection === 'services' ? 'rotate-90' : ''
                }`}
              />
            </button>

            {expandedSection === 'services' && (
              <div className="mt-2 space-y-1 pl-4">
                {services.map((service) => (
                  <Link
                    key={service.href}
                    href={service.href}
                    className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <span className="text-2xl">{service.icon}</span>
                    <span className="text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {service.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sectors Section */}
          <div>
            <button
              onClick={() => toggleSection('sectors')}
              className="w-full flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="font-bold text-slate-900 dark:text-white">
                Sectors
              </span>
              <ChevronRight
                className={`w-5 h-5 text-slate-500 transition-transform ${
                  expandedSection === 'sectors' ? 'rotate-90' : ''
                }`}
              />
            </button>

            {expandedSection === 'sectors' && (
              <div className="mt-2 space-y-1 pl-4">
                {sectors.map((sector) => (
                  <Link
                    key={sector.href}
                    href={sector.href}
                    className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <span className="text-2xl">{sector.icon}</span>
                    <span className="text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {sector.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Locations Section */}
          <div>
            <button
              onClick={() => toggleSection('locations')}
              className="w-full flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="font-bold text-slate-900 dark:text-white">
                Locations
              </span>
              <ChevronRight
                className={`w-5 h-5 text-slate-500 transition-transform ${
                  expandedSection === 'locations' ? 'rotate-90' : ''
                }`}
              />
            </button>

            {expandedSection === 'locations' && (
              <div className="mt-2 space-y-1 pl-4">
                {locations.map((location) => (
                  <Link
                    key={location.href}
                    href={location.href}
                    className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <span className="text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {location.name}
                    </span>
                    <span className="text-xs font-black text-slate-400 group-hover:text-blue-500 transition-colors">
                      {location.short}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 dark:border-slate-800 my-6" />

          {/* Additional Links */}
          <div className="space-y-1">
            <Link
              href="/portal"
              className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Contractor Portal
              </span>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>

            <Link
              href="/case-studies"
              className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <span className="text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Case Studies
              </span>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>

            <Link
              href="/blog"
              className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <span className="text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Blog
              </span>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>

            <Link
              href="/faq"
              className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <span className="text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                FAQ
              </span>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>
          </div>
        </nav>

        {/* Emergency CTA - Sticky Bottom */}
        <div className="sticky bottom-0 bg-gradient-to-t from-white dark:from-slate-900 via-white dark:via-slate-900 to-transparent px-6 py-6 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => window.location.href = '/claim/step-1?pricing_disclosed=true'}
            className="
              flex items-center justify-center gap-3
              w-full py-4 px-6
              bg-gradient-to-r from-red-600 to-red-700
              hover:from-red-700 hover:to-red-800
              text-white font-black rounded-2xl
              shadow-lg shadow-red-600/30
              active:scale-95 transition-[transform,background-color,box-shadow] duration-200 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)]
            "
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 8l-6-4m6 4l6-4" />
            </svg>
            <span className="text-xl">Request Service</span>
          </button>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-3 font-bold uppercase tracking-wider">
            $2,750 Emergency Dispatch • 24/7
          </p>
        </div>
      </div>
    </>
  );
}

/**
 * Hamburger Menu Button Component
 *
 * Animated hamburger icon that transforms to X when menu is open.
 */
interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        lg:hidden p-2 rounded-lg
        hover:bg-slate-100 dark:hover:bg-slate-800
        transition-colors
      "
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
    >
      <div className="w-6 h-5 flex flex-col justify-between">
        <span
          className={`
            h-0.5 w-full bg-slate-900 dark:bg-white rounded-full
            transition-[transform] duration-300 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] origin-center
            ${isOpen ? 'rotate-45 translate-y-[9px]' : 'rotate-0'}
          `}
        />
        <span
          className={`
            h-0.5 w-full bg-slate-900 dark:bg-white rounded-full
            transition-[opacity,transform] duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]
            ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
          `}
        />
        <span
          className={`
            h-0.5 w-full bg-slate-900 dark:bg-white rounded-full
            transition-[transform] duration-300 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] origin-center
            ${isOpen ? '-rotate-45 -translate-y-[9px]' : 'rotate-0'}
          `}
        />
      </div>
    </button>
  );
}
