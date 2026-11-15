/**
 * NRPG MegaMenu Component
 *
 * Sophisticated dropdown navigation with image thumbnails.
 * Pattern from Phil McGurk's DisasterRecovery.com.au design.
 *
 * Features:
 * - Grid of 4 items with 16/10 aspect ratio images
 * - Small uppercase labels (10px, tracking-widest)
 * - Gradient overlays on hover
 * - Smooth opacity/visibility transitions
 * - Keyboard accessible (Tab, Enter, Escape)
 * - Mobile-responsive
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { designTokens } from '@/lib/design-tokens';

// Types
export interface MegaMenuItem {
  id: string;
  title: string;
  subtitle?: string;
  label: string; // Small uppercase label (e.g., "INDUSTRY PROTOCOL")
  description?: string;
  image: string; // Path to image
  slug: string; // URL path
  labelColor?: string; // Tailwind class (e.g., "text-blue-400")
}

export interface MegaMenuProps {
  /** Menu items to display (maximum 4 for optimal grid layout) */
  items: MegaMenuItem[];
  /** Whether the menu is open */
  isOpen: boolean;
  /** Callback when menu should close */
  onClose: () => void;
  /** Base path for routing (e.g., "/services") */
  basePath?: string;
  /** Grid columns (2 or 4) */
  columns?: 2 | 4;
  /** Custom className for container */
  className?: string;
}

/**
 * MegaMenu - Sophisticated dropdown navigation
 *
 * @example
 * ```tsx
 * <MegaMenu
 *   items={SERVICE_PILLARS.map(p => ({
 *     id: p.id,
 *     title: p.title,
 *     subtitle: p.subtitle,
 *     label: p.protocol,
 *     image: `/images/services/${p.id}.jpg`,
 *     slug: p.slug,
 *     labelColor: p.protocolColor
 *   }))}
 *   isOpen={isServicesOpen}
 *   onClose={() => setIsServicesOpen(false)}
 *   basePath="/services"
 * />
 * ```
 */
export function MegaMenu({
  items,
  isOpen,
  onClose,
  basePath = '',
  columns = 4,
  className = '',
}: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div
      ref={menuRef}
      className={`
        fixed top-20 left-0 right-0 bg-gradient-to-br from-[#0F1115] to-[#1a1d29]
        shadow-2xl border-t border-[#374151]/50
        transition-[opacity,transform,visibility] duration-300 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)]
        ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4 pointer-events-none'}
        ${className}
      `}
      role="menu"
      aria-hidden={!isOpen}
      style={{
        zIndex: designTokens.zIndex.dropdown,
      }}
    >
      <div className="container mx-auto px-6 py-8">
        <div
          className={`grid gap-6 ${
            columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}
        >
          {items.slice(0, columns === 2 ? 2 : 4).map((item) => (
            <MegaMenuItemCard key={item.id} item={item} basePath={basePath} onClose={onClose} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * MegaMenuItemCard - Individual menu item with image
 */
interface MegaMenuItemCardProps {
  item: MegaMenuItem;
  basePath: string;
  onClose: () => void;
}

function MegaMenuItemCard({ item, basePath, onClose }: MegaMenuItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`${basePath}/${item.slug}`}
      onClick={onClose}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative block rounded-2xl overflow-hidden bg-[#1a1d29] transition-[box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] hover:shadow-xl hover:shadow-[#00BFA6]/20 focus:outline-none focus:ring-2 focus:ring-[#00BFA6] focus:ring-offset-2 focus:ring-offset-[#0F1115]"
      role="menuitem"
    >
      {/* Image Container - 16:10 Aspect Ratio */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={item.image}
          alt={`${item.title} - ${item.label}`}
          fill
          className={`object-cover transition-transform duration-500 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Gradient Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent transition-opacity duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] ${
            isHovered ? 'opacity-100' : 'opacity-80'
          }`}
        />

        {/* Content Overlay */}
        <div className="absolute inset-0 p-5 flex flex-col justify-end">
          {/* Small Label - 10px Uppercase */}
          <div
            className={`label-small mb-2 ${item.labelColor || 'text-blue-400'}`}
            style={{ fontSize: '10px' }}
          >
            {item.label}
          </div>

          {/* Title */}
          <h3 className="font-display text-xl font-bold text-white mb-1 leading-tight">
            {item.title}
          </h3>

          {/* Subtitle */}
          {item.subtitle && (
            <p className="text-sm text-slate-300 font-medium">{item.subtitle}</p>
          )}

          {/* Description - Shows on hover */}
          {item.description && (
            <p
              className={`text-xs text-slate-400 mt-2 line-clamp-2 transition-opacity duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {item.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * Helper Hook - Manage MegaMenu State
 *
 * @example
 * ```tsx
 * const { isOpen, open, close, toggle } = useMegaMenu();
 *
 * <button onMouseEnter={open}>Services</button>
 * <MegaMenu isOpen={isOpen} onClose={close} items={services} />
 * ```
 */
export function useMegaMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}

export default MegaMenu;
