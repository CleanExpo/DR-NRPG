// @ts-nocheck

/**
 * NRPG Components Demo Page
 *
 * Demonstrates all three sophisticated UI components:
 * - MegaMenu
 * - HeroCarousel
 * - PillarCard
 *
 * This file shows how to integrate components with the design system.
 */

'use client';

import React from 'react';
import { MegaMenu, useMegaMenu } from './mega-menu';
import { HeroCarousel } from './hero-carousel';
import { PillarCard, PillarCardGrid } from './pillar-card';
import { SERVICE_PILLARS, CLIENT_SECTORS, AUSTRALIAN_LOCATIONS } from '@/lib/design-tokens';

export default function NRPGDemoPage() {
  // Mega menu state hooks
  const servicesMenu = useMegaMenu();
  const sectorsMenu = useMegaMenu();
  const locationsMenu = useMegaMenu();

  // ========================================
  // Data Preparation
  // ========================================

  // Hero carousel scenarios
  const heroScenarios = [
    {
      id: '1',
      title: 'Rapid Water Extraction',
      sector: 'Commercial',
      hazard: 'Flood Emergency',
      status: 'Response Active',
      image: '/images/scenarios/flood-emergency.jpg',
      description: '24/7 emergency response for commercial properties across Australia',
      cta: {
        label: 'Request Emergency Dispatch',
        href: '/emergency',
      },
    },
    {
      id: '2',
      title: 'Fire & Smoke Remediation',
      sector: 'Residential',
      hazard: 'Fire Damage',
      status: 'Vetting Complete',
      image: '/images/scenarios/fire-restoration.jpg',
      description: 'Comprehensive fire and smoke restoration following fire incidents',
      cta: {
        label: 'Learn More',
        href: '/services/fire',
      },
    },
    {
      id: '3',
      title: 'Mould Remediation',
      sector: 'Industrial',
      hazard: 'Spore Containment',
      status: 'Protocol Active',
      image: '/images/scenarios/mould-remediation.jpg',
      description: 'Advanced microbial audit and air quality testing',
      cta: {
        label: 'Get Assessment',
        href: '/services/mould',
      },
    },
    {
      id: '4',
      title: 'Bio & Forensic Cleaning',
      sector: 'Commercial',
      hazard: 'Meth Lab Decon',
      status: 'ATP Verified',
      image: '/images/scenarios/bio-forensic.jpg',
      description: 'Forensic-level pathogen elimination and crime scene restoration',
      cta: {
        label: 'Contact Specialists',
        href: '/services/bio',
      },
    },
  ];

  // Service pillars for PillarCard
  const servicePillars = SERVICE_PILLARS.map((pillar) => ({
    id: pillar.id,
    title: pillar.title,
    subtitle: pillar.subtitle,
    protocol: pillar.protocol,
    protocolColor:
      pillar.id === 'water'
        ? 'blue'
        : pillar.id === 'fire'
        ? 'orange'
        : pillar.id === 'mould'
        ? 'green'
        : 'red',
    image: `/images/services/${pillar.id}-service.jpg`,
    slug: pillar.slug,
    services: pillar.services,
    description: `Professional ${pillar.title.toLowerCase()} restoration services following IICRC protocols.`,
  }));

  // Client sectors for PillarCard
  const clientSectors = CLIENT_SECTORS.map((sector) => ({
    id: sector.id,
    title: sector.title,
    subtitle: sector.subtitle,
    protocol: sector.badge,
    protocolColor: 'purple',
    image: `/images/sectors/${sector.id}-sector.jpg`,
    slug: sector.slug,
    description: sector.description,
  }));

  // Services for MegaMenu
  const serviceMenuItems = SERVICE_PILLARS.map((p) => ({
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    label: p.protocol,
    image: `/images/services/${p.id}-service.jpg`,
    slug: p.slug,
    labelColor: p.protocolColor,
    description: `${p.services.length} specialized services`,
  }));

  // Sectors for MegaMenu
  const sectorMenuItems = CLIENT_SECTORS.map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    label: s.badge,
    image: `/images/sectors/${s.id}-sector.jpg`,
    slug: s.slug,
    labelColor: 'text-purple-400',
    description: s.description,
  }));

  // Locations for MegaMenu
  const locationMenuItems = AUSTRALIAN_LOCATIONS.slice(0, 4).map((loc) => ({
    id: loc.code,
    title: loc.name,
    subtitle: loc.capital,
    label: `${loc.code} Region`,
    image: `/images/locations/${loc.code.toLowerCase()}.jpg`,
    slug: loc.code.toLowerCase(),
    labelColor: 'text-blue-400',
    description: `Disaster recovery services across ${loc.name}`,
  }));

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* ========================================
          NAVIGATION WITH MEGA MENUS
          ======================================== */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="font-display text-3xl font-bold text-blue-600">
              NRPG
            </a>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onMouseEnter={servicesMenu.open}
                className="text-slate-700 dark:text-slate-300 hover:text-blue-600 font-semibold transition-colors"
              >
                Services
              </button>
              <button
                onMouseEnter={sectorsMenu.open}
                className="text-slate-700 dark:text-slate-300 hover:text-blue-600 font-semibold transition-colors"
              >
                Sectors
              </button>
              <button
                onMouseEnter={locationsMenu.open}
                className="text-slate-700 dark:text-slate-300 hover:text-blue-600 font-semibold transition-colors"
              >
                Locations
              </button>
              <a href="/contractors" className="text-slate-700 dark:text-slate-300 hover:text-blue-600">
                Contractors
              </a>
              <a
                href="/emergency"
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-[background-color] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]"
              >
                Emergency
              </a>
            </div>
          </div>
        </div>

        {/* Mega Menus */}
        <MegaMenu
          items={serviceMenuItems}
          isOpen={servicesMenu.isOpen}
          onClose={servicesMenu.close}
          basePath="/services"
          columns={4}
        />

        <MegaMenu
          items={sectorMenuItems}
          isOpen={sectorsMenu.isOpen}
          onClose={sectorsMenu.close}
          basePath="/sectors"
          columns={4}
        />

        <MegaMenu
          items={locationMenuItems}
          isOpen={locationsMenu.isOpen}
          onClose={locationsMenu.close}
          basePath="/locations"
          columns={4}
        />
      </nav>

      {/* ========================================
          HERO CAROUSEL SECTION
          ======================================== */}
      <section className="container mx-auto px-6 py-12 md:py-16">
        <HeroCarousel
          scenarios={heroScenarios}
          interval={5000}
          showHUD={true}
          showScanningBeam={true}
          pauseOnHover={true}
          onSlideChange={(index, scenario) => {
            console.log('Slide changed:', scenario.title);
          }}
        />
      </section>

      {/* ========================================
          SERVICE PILLARS SECTION
          ======================================== */}
      <section className="bg-slate-50 dark:bg-slate-900 py-24">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="label-small text-blue-600 mb-4">IICRC PROTOCOLS</div>
            <h2 className="font-display text-5xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white">
              Service Protocols
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Comprehensive disaster recovery services following international restoration standards
            </p>
          </div>

          {/* Service Pillars Grid */}
          <PillarCardGrid columns={4}>
            {servicePillars.map((pillar) => (
              <PillarCard key={pillar.id} data={pillar} basePath="/services" />
            ))}
          </PillarCardGrid>
        </div>
      </section>

      {/* ========================================
          CLIENT SECTORS SECTION
          ======================================== */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="label-small text-purple-600 mb-4">CLIENT SOLUTIONS</div>
            <h2 className="font-display text-5xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white">
              Sector Expertise
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Specialized restoration strategies for every client sector
            </p>
          </div>

          {/* Sectors Grid */}
          <PillarCardGrid columns={4}>
            {clientSectors.map((sector) => (
              <PillarCard key={sector.id} data={sector} basePath="/sectors" />
            ))}
          </PillarCardGrid>
        </div>
      </section>

      {/* ========================================
          COMPONENT FEATURES SHOWCASE
          ======================================== */}
      <section className="bg-slate-50 dark:bg-slate-900 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Component Features
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Production-ready, accessible, and performant UI components
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* MegaMenu Features */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl">
              <h3 className="font-display text-2xl font-bold mb-4 text-blue-600">MegaMenu</h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li>✓ 4-item grid layout</li>
                <li>✓ 16:10 image aspect ratio</li>
                <li>✓ Hover gradient overlays</li>
                <li>✓ Keyboard accessible</li>
                <li>✓ Outside click detection</li>
                <li>✓ Escape key support</li>
              </ul>
            </div>

            {/* HeroCarousel Features */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl">
              <h3 className="font-display text-2xl font-bold mb-4 text-blue-600">HeroCarousel</h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li>✓ Auto-rotation (5s)</li>
                <li>✓ Scanning beam effect</li>
                <li>✓ HUD overlay (monospace)</li>
                <li>✓ Pause on hover</li>
                <li>✓ Arrow key navigation</li>
                <li>✓ Touch swipe support</li>
              </ul>
            </div>

            {/* PillarCard Features */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl">
              <h3 className="font-display text-2xl font-bold mb-4 text-blue-600">PillarCard</h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li>✓ 440px fixed height</li>
                <li>✓ Image scale on hover (1.1x)</li>
                <li>✓ Protocol badge colors</li>
                <li>✓ Gradient overlay</li>
                <li>✓ Shimmer loading state</li>
                <li>✓ Services list reveal</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          FOOTER
          ======================================== */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="font-display text-2xl font-bold mb-4">NRPG</div>
          <p className="text-slate-400 mb-6">
            National Restoration Partner Group - Australia's Premier Disaster Recovery Platform
          </p>
          <p className="text-sm text-slate-500">
            © 2025 NRPG. Design System by Phil McGurk | DisasterRecovery.com.au
          </p>
        </div>
      </footer>
    </div>
  );
}
