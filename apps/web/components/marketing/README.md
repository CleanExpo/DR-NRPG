# Marketing Components

Production-ready marketing components for the NRPG homepage and landing pages.

## Components

### QuickTriageTool
Interactive disaster assessment tool that helps users quickly identify their emergency type and severity, then routes them to appropriate services.

**Features:**
- 3-step wizard (disaster type → severity → next steps)
- 6 disaster categories with visual icons
- Severity-based recommendations
- Emergency phone routing for critical situations
- Form routing for scheduled services
- WCAG 2.1 AA compliant
- Mobile-first responsive

**Usage:**
```tsx
import { QuickTriageTool } from '@/components/marketing';

<QuickTriageTool
  onComplete={(disasterType, severity) => {
    // Track analytics
  }}
/>
```

### ServicesGrid
Visual grid showcasing service categories with imagery, IICRC badges, and interactive cards.

**Features:**
- 4 service categories (water, fire, mold, bio)
- IICRC protocol badges
- Configurable columns (2, 3, or 4)
- Hover effects and animations
- 24/7 availability indicators
- Gradient overlays with brand colors

**Usage:**
```tsx
import { ServicesGrid } from '@/components/marketing';

<ServicesGrid
  title="Complete Disaster Recovery Services"
  subtitle="Qualified restoration for every emergency"
  columns={4}
/>
```

**Compact Variant:**
```tsx
import { ServicesGridCompact } from '@/components/marketing';

<ServicesGridCompact className="..." />
```

### ResourcesHub
Featured content section displaying educational resources, guides, and knowledge base articles.

**Features:**
- Featured resource with large card
- Grid of additional resources
- Resource type badges (guide, article, checklist, video)
- Read time estimates
- Configurable display count
- Link to full resource library

**Usage:**
```tsx
import { ResourcesHub } from '@/components/marketing';

<ResourcesHub
  title="Knowledge Center"
  subtitle="Expert guides and resources"
  maxItems={6}
  showFeaturedOnly={false}
/>
```

**List Variant:**
```tsx
import { ResourcesList } from '@/components/marketing';

<ResourcesList className="..." />
```

### JoinNRPGSection
Contractor recruitment section with value proposition, benefits, requirements, and application CTA.

**Features:**
- 3 variants (default, compact, detailed)
- 4 contractor benefits with icons
- Minimum requirements checklist
- Trust indicators (certifications, stats)
- IICRC badge display
- Dual CTAs (apply + portal login)

**Usage:**
```tsx
import { JoinNRPGSection } from '@/components/marketing';

// Default (full featured)
<JoinNRPGSection variant="default" />

// Compact (CTA bar)
<JoinNRPGSection variant="compact" />

// Detailed (benefits grid + full)
<JoinNRPGSection variant="detailed" />
```

## Design Standards

All components follow the NRPG design system:

### Colors
- **Primary Blue**: `blue-600` (#2563eb)
- **Emergency Red**: `red-600` (#dc2626)
- **Navy**: `slate-900` (#0f172a)
- **White/Light**: `white`, `slate-50`

### Typography
- **Display Font**: Inter (font-display)
- **Headings**: font-black (900 weight)
- **Body**: Medium/Regular (500/400 weight)

### Spacing
- **Sections**: `py-16 md:py-24` (64px-96px)
- **Cards**: `p-6` to `p-12` (24px-48px)
- **Gaps**: `gap-4` to `gap-12` (16px-48px)

### Accessibility
- WCAG 2.1 AA compliant
- Semantic HTML5 elements
- ARIA labels and roles
- Keyboard navigation support
- Screen reader optimized
- Color contrast ratios > 4.5:1

### Performance
- Component code splitting
- Lazy loading for images
- CSS-in-JS optimizations
- Mobile-first responsive design
- LCP target: <1.5s

## Homepage Implementation

The homepage (`/app/page.tsx`) integrates all marketing components:

### Structure
1. **Hero Section** - 3-path emergency CTA (Report/Find/Join)
2. **Quick Triage Tool** - Interactive assessment
3. **Services Grid** - Visual service categories
4. **Resources Hub** - Featured educational content
5. **Trust Section** - Why choose NRPG
6. **Join NRPG** - Contractor recruitment
7. **Final CTA** - Emergency contact

### Performance Optimizations
- Fixed header with blur backdrop
- Mega menu lazy rendering
- Mobile menu conditional rendering
- Schema.org structured data
- Semantic HTML for SEO

### Mobile Responsiveness
- Hamburger menu at `lg` breakpoint
- Stacked layouts on mobile
- Touch-optimized interactions
- Reduced spacing on small screens

## Integration with DesignOS

Marketing components use DesignOS primitives:

```tsx
// From DesignOS
import {
  Button,           // CTAs and actions
  PriorityCard,     // 3-path emergency selector
  EmergencyCTA,     // Final emergency banner
} from '@/src/design-system';
```

## File Structure

```
components/marketing/
├── QuickTriageTool.tsx      # Interactive triage wizard
├── ServicesGrid.tsx          # Service category grid
├── ResourcesHub.tsx          # Featured content section
├── JoinNRPGSection.tsx       # Contractor recruitment
├── index.ts                  # Barrel exports
└── README.md                 # This file
```

## Future Enhancements

### Phase 24 (Analytics)
- [ ] Track triage tool completions
- [ ] Monitor CTA conversion rates
- [ ] A/B test component variants
- [ ] Heatmap integration

### Phase 25 (Personalization)
- [ ] Location-based service filtering
- [ ] Disaster type recommendations
- [ ] Return visitor personalization
- [ ] Dynamic content based on weather

### Phase 26 (Advanced Features)
- [ ] Video backgrounds for hero
- [ ] Animated statistics counters
- [ ] Interactive service selector
- [ ] Live contractor availability map

## Testing

All components should be tested for:

1. **Accessibility**
   - Screen reader compatibility
   - Keyboard navigation
   - Color contrast
   - Focus management

2. **Responsiveness**
   - Mobile (320px-768px)
   - Tablet (768px-1024px)
   - Desktop (1024px+)
   - Large screens (1920px+)

3. **Performance**
   - Lighthouse scores > 90
   - LCP < 1.5s
   - CLS < 0.1
   - FID < 100ms

4. **Browser Compatibility**
   - Chrome (latest 2 versions)
   - Firefox (latest 2 versions)
   - Safari (latest 2 versions)
   - Edge (latest 2 versions)

## Contributing

When adding new marketing components:

1. Follow existing patterns
2. Use DesignOS primitives where possible
3. Ensure WCAG 2.1 AA compliance
4. Add TypeScript types
5. Document props and usage
6. Include examples
7. Test on all breakpoints

---

**Last Updated**: 2026-01-02
**Version**: 1.0.0
**Status**: Production Ready ✅
