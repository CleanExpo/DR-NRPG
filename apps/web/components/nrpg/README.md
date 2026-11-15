# NRPG UI Components

Sophisticated UI components for the NRPG platform based on Phil McGurk's DisasterRecovery.com.au design patterns.

## Components

### 1. MegaMenu
Sophisticated dropdown navigation with image thumbnails.

**Features:**
- Grid of 2-4 items with 16/10 aspect ratio images
- Small uppercase labels (10px, tracking-widest)
- Gradient overlays on hover
- Smooth opacity/visibility transitions
- Keyboard accessible (Tab, Enter, Escape)
- Mobile-responsive

**Usage:**
```tsx
import { MegaMenu, useMegaMenu } from '@/components/nrpg/mega-menu';
import { SERVICE_PILLARS } from '@/lib/design-tokens';

function Navigation() {
  const { isOpen, open, close } = useMegaMenu();

  const menuItems = SERVICE_PILLARS.map(pillar => ({
    id: pillar.id,
    title: pillar.title,
    subtitle: pillar.subtitle,
    label: pillar.protocol,
    image: `/images/services/${pillar.id}.jpg`,
    slug: pillar.slug,
    labelColor: pillar.protocolColor,
  }));

  return (
    <>
      <button onMouseEnter={open}>Services</button>
      <MegaMenu
        items={menuItems}
        isOpen={isOpen}
        onClose={close}
        basePath="/services"
        columns={4}
      />
    </>
  );
}
```

---

### 2. HeroCarousel
Auto-rotating carousel with scanning beam effect and HUD overlay.

**Features:**
- Auto-rotates every 5 seconds
- Scanning beam effect (blue line animating vertically)
- HUD overlay (top-left, monospace, blue text)
- Smooth opacity transitions between slides
- Aspect ratio 16/10, rounded-[3rem]
- Pause on hover
- Keyboard navigation (Arrow keys)
- Touch swipe support

**Usage:**
```tsx
import { HeroCarousel } from '@/components/nrpg/hero-carousel';

function Hero() {
  const scenarios = [
    {
      id: '1',
      title: 'Rapid Water Extraction',
      sector: 'Commercial',
      hazard: 'Flood Emergency',
      status: 'Response Active',
      image: '/images/scenarios/flood.jpg',
      description: '24/7 emergency response for commercial properties',
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
      image: '/images/scenarios/fire.jpg',
      description: 'Comprehensive restoration following fire incidents',
      cta: {
        label: 'Learn More',
        href: '/services/fire',
      },
    },
  ];

  return (
    <HeroCarousel
      scenarios={scenarios}
      interval={5000}
      showHUD={true}
      showScanningBeam={true}
      pauseOnHover={true}
    />
  );
}
```

---

### 3. PillarCard
Service pillar card with large background image and protocol badge.

**Features:**
- Height 440px, rounded-[2.5rem]
- Large background image with gradient overlay
- Protocol badge (colored, small uppercase)
- Service title at bottom (Space Grotesk)
- Hover: image scales to 1.1, shadow increases
- Shimmer loading state
- Click handler for navigation
- Accessibility support

**Usage:**
```tsx
import { PillarCard, PillarCardGrid } from '@/components/nrpg/pillar-card';
import { SERVICE_PILLARS } from '@/lib/design-tokens';

function ServicesSection() {
  const pillars = SERVICE_PILLARS.map(pillar => ({
    id: pillar.id,
    title: pillar.title,
    subtitle: pillar.subtitle,
    protocol: pillar.protocol,
    protocolColor: pillar.id, // 'water', 'fire', 'mould', 'bio'
    image: `/images/services/${pillar.id}.jpg`,
    slug: pillar.slug,
    services: pillar.services,
  }));

  return (
    <PillarCardGrid columns={4}>
      {pillars.map(pillar => (
        <PillarCard
          key={pillar.id}
          data={pillar}
          basePath="/services"
        />
      ))}
    </PillarCardGrid>
  );
}
```

**Protocol Colors:**
- `blue` - Water/Flood
- `orange` - Fire/Smoke (FSRT)
- `green` - Mould Remediation
- `red` - Bio/Forensic Cleaning
- `purple` - Custom services
- `yellow` - Warning/Hazard

**Loading State:**
```tsx
<PillarCard
  data={pillarData}
  isLoading={true}
/>
```

**Custom Click Handler:**
```tsx
<PillarCard
  data={pillarData}
  onClick={(data) => {
    console.log('Clicked:', data.title);
    // Custom navigation or modal logic
  }}
/>
```

---

## Complete Example

```tsx
import { MegaMenu, useMegaMenu } from '@/components/nrpg/mega-menu';
import { HeroCarousel } from '@/components/nrpg/hero-carousel';
import { PillarCard, PillarCardGrid } from '@/components/nrpg/pillar-card';
import { SERVICE_PILLARS, CLIENT_SECTORS } from '@/lib/design-tokens';

export default function HomePage() {
  const servicesMenu = useMegaMenu();

  // Hero scenarios
  const heroScenarios = [
    {
      id: '1',
      title: 'National Contractor Network',
      sector: 'All Sectors',
      hazard: 'Multi-Hazard',
      status: 'Network Active',
      image: '/images/hero/network.jpg',
      description: 'Australia\'s premier disaster recovery platform',
      cta: { label: 'Join Network', href: '/contractors/join' },
    },
  ];

  // Service pillars for cards
  const servicePillars = SERVICE_PILLARS.map(p => ({
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    protocol: p.protocol,
    protocolColor: p.id === 'water' ? 'blue' :
                   p.id === 'fire' ? 'orange' :
                   p.id === 'mould' ? 'green' : 'red',
    image: `/images/services/${p.id}.jpg`,
    slug: p.slug,
    services: p.services,
  }));

  // Menu items for mega menu
  const serviceMenuItems = SERVICE_PILLARS.map(p => ({
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    label: p.protocol,
    image: `/images/services/${p.id}.jpg`,
    slug: p.slug,
    labelColor: p.protocolColor,
  }));

  return (
    <div className="min-h-screen">
      {/* Navigation with MegaMenu */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-display text-2xl font-bold">NRPG</div>

          <div className="flex items-center gap-8">
            <button
              onMouseEnter={servicesMenu.open}
              className="text-slate-700 dark:text-slate-300 hover:text-blue-600"
            >
              Services
            </button>
            <a href="/contractors">Contractors</a>
            <a href="/about">About</a>
          </div>
        </div>

        <MegaMenu
          items={serviceMenuItems}
          isOpen={servicesMenu.isOpen}
          onClose={servicesMenu.close}
          basePath="/services"
          columns={4}
        />
      </nav>

      {/* Hero Carousel */}
      <section className="container mx-auto px-6 py-12">
        <HeroCarousel scenarios={heroScenarios} />
      </section>

      {/* Service Pillars */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-5xl font-bold mb-4">
            Service Protocols
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Qualified restoration services
          </p>
        </div>

        <PillarCardGrid columns={4}>
          {servicePillars.map(pillar => (
            <PillarCard
              key={pillar.id}
              data={pillar}
              basePath="/services"
            />
          ))}
        </PillarCardGrid>
      </section>
    </div>
  );
}
```

---

## Design Tokens Integration

All components use the centralized design system from `lib/design-tokens.ts`:

**Typography:**
- Plus Jakarta Sans (body text)
- Space Grotesk (headings, display)
- Monospace (HUD overlays)

**Colors:**
- National Blue: `#0047FF`
- Emergency Red: `#E11D48`
- Protocol Blue: `#60A5FA` (Water)
- Protocol Orange: `#FB923C` (Fire)
- Protocol Green: `#4ADE80` (Mould)
- Protocol Red: `#F87171` (Bio/Forensic)

**Spacing:**
- Component gap: 1rem (16px)
- Section gap: 3rem (48px)
- Large rounded corners: 2.5rem - 3rem (40-48px)

**Transitions:**
- Fast: 0.15s ease-out
- Normal: 0.3s ease-out
- Slow: 0.5s ease-out
- Transform: 0.3s cubic-bezier

---

## Accessibility Features

All components include:
- ✅ Keyboard navigation (Tab, Enter, Escape, Arrows)
- ✅ ARIA labels and roles
- ✅ Focus states with visible rings
- ✅ Screen reader support
- ✅ Touch/swipe support for mobile
- ✅ Reduced motion support (coming soon)
- ✅ Color contrast ratios (WCAG AA)

---

## Performance Optimizations

- ✅ Next.js Image component with proper sizing
- ✅ Lazy loading for images
- ✅ Shimmer loading states
- ✅ CSS transitions (GPU-accelerated)
- ✅ Minimal JavaScript bundle size
- ✅ Tree-shakeable exports

---

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

---

## Files

```
components/nrpg/
├── mega-menu.tsx          # MegaMenu + useMegaMenu hook
├── hero-carousel.tsx      # HeroCarousel with scanning beam
├── pillar-card.tsx        # PillarCard + PillarCardGrid
└── README.md              # This file
```

---

## Next Steps

1. Add placeholder images to `/public/images/`
2. Create service and scenario content
3. Implement remaining page sections
4. Add animations library (Framer Motion)
5. Implement dark mode toggle
6. Add analytics tracking
7. Performance monitoring

---

**Generated**: 2025-12-28
**For**: NRPG Platform - Phil McGurk Design System
**Version**: 1.0.0
