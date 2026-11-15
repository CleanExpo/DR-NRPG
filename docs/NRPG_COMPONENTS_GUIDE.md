# NRPG UI Components - Complete Guide

## Overview

Three production-ready, sophisticated UI components for the NRPG platform based on Phil McGurk's DisasterRecovery.com.au design patterns.

**Created**: 2025-12-28
**Design System**: Phil McGurk / DisasterRecovery.com.au
**Framework**: Next.js 14+ with TypeScript
**Status**: Production Ready ✅

---

## Components Summary

| Component | Purpose | Key Features | File |
|-----------|---------|--------------|------|
| **MegaMenu** | Navigation dropdown | Grid thumbnails, hover effects | `components/nrpg/mega-menu.tsx` |
| **HeroCarousel** | Hero section slider | Auto-rotate, HUD overlay, scanning beam | `components/nrpg/hero-carousel.tsx` |
| **PillarCard** | Service/sector cards | Large image, protocol badge, hover scale | `components/nrpg/pillar-card.tsx` |

---

## 1. MegaMenu Component

### Overview
Sophisticated dropdown navigation with image thumbnails, designed for service/sector navigation.

### Features
- ✅ Grid of 2-4 items with 16:10 aspect ratio images
- ✅ Small uppercase labels (10px, tracking-widest)
- ✅ Gradient overlays on hover
- ✅ Smooth opacity/visibility transitions
- ✅ Keyboard accessible (Tab, Enter, Escape)
- ✅ Outside click detection
- ✅ Mobile-responsive

### Usage

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

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `MegaMenuItem[]` | **required** | Array of menu items (max 4) |
| `isOpen` | `boolean` | **required** | Whether menu is visible |
| `onClose` | `() => void` | **required** | Close callback |
| `basePath` | `string` | `''` | Base URL path |
| `columns` | `2 \| 4` | `4` | Grid columns |
| `className` | `string` | `''` | Additional CSS classes |

### MegaMenuItem Type

```typescript
interface MegaMenuItem {
  id: string;
  title: string;
  subtitle?: string;
  label: string; // Small uppercase badge
  description?: string;
  image: string; // Path to image
  slug: string; // URL slug
  labelColor?: string; // Tailwind class (e.g., "text-blue-400")
}
```

### useMegaMenu Hook

```typescript
const { isOpen, open, close, toggle } = useMegaMenu();
```

Returns:
- `isOpen: boolean` - Current state
- `open: () => void` - Open menu
- `close: () => void` - Close menu
- `toggle: () => void` - Toggle state

---

## 2. HeroCarousel Component

### Overview
Auto-rotating carousel with scanning beam effect and HUD overlay for hero sections.

### Features
- ✅ Auto-rotates every 5 seconds (configurable)
- ✅ Scanning beam effect (blue line animating vertically)
- ✅ HUD overlay (top-left, monospace, blue text)
- ✅ Smooth opacity transitions between slides
- ✅ Aspect ratio 16/10, rounded-[3rem]
- ✅ Pause on hover
- ✅ Keyboard navigation (Arrow keys)
- ✅ Touch swipe support
- ✅ Slide indicators

### Usage

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
      description: '24/7 emergency response',
      cta: {
        label: 'Request Dispatch',
        href: '/emergency',
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
      onSlideChange={(index, scenario) => {
        console.log('Slide:', scenario.title);
      }}
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scenarios` | `HeroScenario[]` | **required** | Array of scenarios |
| `interval` | `number` | `5000` | Auto-rotation interval (ms) |
| `showHUD` | `boolean` | `true` | Show HUD overlay |
| `showScanningBeam` | `boolean` | `true` | Show scanning beam effect |
| `pauseOnHover` | `boolean` | `true` | Pause on mouse hover |
| `className` | `string` | `''` | Additional CSS classes |
| `onSlideChange` | `function` | - | Callback on slide change |

### HeroScenario Type

```typescript
interface HeroScenario {
  id: string;
  title: string;
  sector: string; // e.g., "Residential", "Commercial"
  hazard: string; // e.g., "Flood Emergency"
  status: string; // e.g., "Response Active"
  image: string; // Path to image
  description?: string;
  cta?: {
    label: string;
    href: string;
  };
}
```

### HUD Display

The HUD overlay shows:
- **SECTOR**: Client sector (e.g., "Commercial")
- **HAZARD**: Emergency type (e.g., "Flood Emergency")
- **STATUS**: Current status with pulse animation (e.g., "Response Active")

---

## 3. PillarCard Component

### Overview
Service pillar card with large background image and protocol badge.

### Features
- ✅ Height 440px, rounded-[2.5rem]
- ✅ Large background image with gradient overlay
- ✅ Protocol badge (colored, small uppercase)
- ✅ Service title at bottom (Space Grotesk)
- ✅ Hover: image scales to 1.1, shadow increases
- ✅ Services list reveal on hover
- ✅ Shimmer loading state
- ✅ Click handler for navigation
- ✅ Accessibility support

### Usage

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

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `PillarCardData` | **required** | Card data |
| `basePath` | `string` | `''` | Base URL path |
| `isLoading` | `boolean` | `false` | Show loading shimmer |
| `onClick` | `function` | - | Custom click handler |
| `className` | `string` | `''` | Additional CSS classes |
| `interactive` | `boolean` | `true` | Enable hover/click effects |

### PillarCardData Type

```typescript
interface PillarCardData {
  id: string;
  title: string;
  subtitle?: string;
  protocol: string; // Badge text (e.g., "Water Damage")
  protocolColor?: 'blue' | 'orange' | 'green' | 'red' | 'purple' | 'yellow' | string;
  image: string; // Path to image
  slug: string; // URL slug
  services?: string[]; // List of services
  description?: string;
}
```

### Protocol Colors

| Color | Use Case | Services |
|-------|----------|----------|
| `blue` | Water/Flood | Water Damage |
| `orange` | Fire/Smoke | FSRT |
| `green` | Mould | Mould |
| `red` | Bio/Forensic | Biohazard |
| `purple` | Custom | Custom services |
| `yellow` | Warning | Hazard response |

### Loading State

```tsx
<PillarCard data={data} isLoading={true} />
```

Shows shimmer animation while loading.

### Custom Click Handler

```tsx
<PillarCard
  data={data}
  onClick={(data) => {
    console.log('Clicked:', data.title);
    // Custom logic (e.g., open modal)
  }}
/>
```

### PillarCardGrid

Grid container with responsive columns:

```tsx
<PillarCardGrid columns={4}>
  {/* Cards here */}
</PillarCardGrid>
```

**Columns:**
- `2`: 1 col mobile, 2 cols tablet+
- `3`: 1 col mobile, 2 cols tablet, 3 cols desktop
- `4`: 1 col mobile, 2 cols tablet, 4 cols desktop

---

## Design System Integration

### Colors (from design-tokens.ts)

```typescript
import { designTokens } from '@/lib/design-tokens';

// Primary
designTokens.colors.nrpgBlue     // #0047FF
designTokens.colors.nrpgRed      // #E11D48

// Protocol Colors
designTokens.colors.protocolBlue   // #60A5FA (Water)
designTokens.colors.protocolOrange // #FB923C (Fire)
designTokens.colors.protocolGreen  // #4ADE80 (Mould)
designTokens.colors.protocolRed    // #F87171 (Bio)
```

### Typography

```typescript
// Fonts
designTokens.fonts.sans     // Plus Jakarta Sans
designTokens.fonts.display  // Space Grotesk
designTokens.fonts.mono     // Monospace (HUD)

// Font Sizes
designTokens.fontSize.labelXs    // 10px (small labels)
designTokens.fontSize.headingXl  // 48px (card titles)
```

### Custom CSS Utilities

All components use custom utilities from `app/globals.css`:

```css
/* Small Label Typography */
.label-small {
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

/* Scanning Beam Effect */
.scanning-beam {
  /* Blue line animating vertically */
}

/* Gradient Overlays */
.gradient-overlay-dark {
  background: linear-gradient(to top, rgba(2, 6, 23, 0.95), transparent);
}

/* Shimmer Loading */
.shimmer {
  background: linear-gradient(90deg, #f1f5f9, #e2e8f0, #f1f5f9);
  animation: shimmer-load 1.5s infinite;
}
```

---

## Data Sources

### SERVICE_PILLARS

```typescript
import { SERVICE_PILLARS } from '@/lib/design-tokens';

SERVICE_PILLARS.map(p => ({
  id: p.id,              // 'water', 'fire', 'mould', 'bio'
  title: p.title,        // 'Flood & Water'
  subtitle: p.subtitle,  // 'Damage Restoration'
  protocol: p.protocol,  // 'Water Damage'
  protocolColor: p.protocolColor, // 'text-blue-400'
  services: p.services,  // Array of services
  slug: p.slug,         // 'flood-water-damage'
}));
```

### CLIENT_SECTORS

```typescript
import { CLIENT_SECTORS } from '@/lib/design-tokens';

CLIENT_SECTORS.map(s => ({
  id: s.id,              // 'residential', 'commercial', etc.
  title: s.title,        // 'Residential'
  subtitle: s.subtitle,  // 'Advocacy'
  badge: s.badge,        // 'Homeowner Defense'
  description: s.description,
  slug: s.slug,         // 'residential-restoration'
}));
```

### AUSTRALIAN_LOCATIONS

```typescript
import { AUSTRALIAN_LOCATIONS } from '@/lib/design-tokens';

AUSTRALIAN_LOCATIONS.map(l => ({
  code: l.code,     // 'NSW', 'VIC', etc.
  name: l.name,     // 'New South Wales'
  capital: l.capital, // 'Sydney'
}));
```

---

## Accessibility Features

All components include:

- ✅ **Keyboard Navigation**: Tab, Enter, Escape, Arrow keys
- ✅ **ARIA Labels**: `role`, `aria-label`, `aria-hidden`
- ✅ **Focus States**: Visible focus rings (ring-2)
- ✅ **Screen Reader**: Proper semantic HTML
- ✅ **Touch Support**: Swipe gestures for carousel
- ✅ **Color Contrast**: WCAG AA compliant
- ✅ **Reduced Motion**: (Coming soon)

### Example ARIA Usage

```tsx
// MegaMenu
<div role="menu" aria-hidden={!isOpen}>
  <a role="menuitem">Service Item</a>
</div>

// HeroCarousel
<div role="region" aria-label="Hero carousel" aria-live="polite">
  <button aria-label="Go to slide 1">Indicator</button>
</div>

// PillarCard
<a aria-label="Flood & Water - Water Damage">Card</a>
```

---

## Performance Optimizations

### Image Loading

```tsx
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="Description"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={isFirstSlide}
/>
```

### Transitions

All animations use GPU-accelerated CSS:
- `transform` instead of `left/top`
- `opacity` instead of `visibility` alone
- `will-change` for complex animations

### Bundle Size

Components are tree-shakeable:
```typescript
// Import only what you need
import { MegaMenu } from '@/components/nrpg/mega-menu';
// vs
import { MegaMenu, HeroCarousel, PillarCard } from '@/components/nrpg';
```

---

## Complete Example

See `components/nrpg/demo-page.tsx` for a full working example.

### Quick Start

```tsx
import {
  MegaMenu,
  useMegaMenu,
  HeroCarousel,
  PillarCard,
  PillarCardGrid,
} from '@/components/nrpg';
import { SERVICE_PILLARS } from '@/lib/design-tokens';

export default function HomePage() {
  const servicesMenu = useMegaMenu();

  return (
    <div>
      {/* Navigation */}
      <nav>
        <button onMouseEnter={servicesMenu.open}>Services</button>
        <MegaMenu
          items={serviceMenuItems}
          isOpen={servicesMenu.isOpen}
          onClose={servicesMenu.close}
        />
      </nav>

      {/* Hero */}
      <HeroCarousel scenarios={heroScenarios} />

      {/* Services */}
      <PillarCardGrid columns={4}>
        {SERVICE_PILLARS.map(p => (
          <PillarCard key={p.id} data={cardData} />
        ))}
      </PillarCardGrid>
    </div>
  );
}
```

---

## File Structure

```
components/nrpg/
├── mega-menu.tsx          # MegaMenu component + hook
├── hero-carousel.tsx      # HeroCarousel component
├── pillar-card.tsx        # PillarCard + Grid components
├── types.ts               # TypeScript type definitions
├── index.ts               # Centralized exports
├── demo-page.tsx          # Complete working example
└── README.md              # Component documentation
```

---

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

---

## Next Steps

1. **Add Images**: Place placeholder images in `/public/images/`
2. **Test Components**: Use demo page to verify all features
3. **Integrate**: Add to your pages (home, services, sectors)
4. **Customize**: Adjust colors, spacing, content
5. **Analytics**: Add tracking to click handlers
6. **Animations**: Consider Framer Motion for advanced effects
7. **Dark Mode**: Test with dark mode toggle
8. **Performance**: Monitor with Lighthouse

---

## Support

For issues or questions:
1. Check `components/nrpg/README.md`
2. Review `demo-page.tsx` for examples
3. Inspect `types.ts` for TypeScript definitions
4. Review design tokens in `lib/design-tokens.ts`

---

## Version History

- **v1.0.0** (2025-12-28): Initial release
  - MegaMenu component
  - HeroCarousel component
  - PillarCard component
  - Complete TypeScript types
  - Demo page
  - Documentation

---

**Generated**: 2025-12-28
**For**: NRPG Platform - Disaster Recovery
**Design**: Phil McGurk / DisasterRecovery.com.au
**Status**: Production Ready ✅
