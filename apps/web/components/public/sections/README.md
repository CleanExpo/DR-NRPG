# Public Sections Components

Public-facing section components for the Disaster Recovery Australia marketing website.

## Components

### EmergencyHero

Full-width hero section optimized for emergency disaster recovery services.

**Features:**
- Responsive design (mobile-first)
- Three prominent CTAs (Report Claim, Find Contractor, Get Quote)
- Trust signals (certifications, Insurance, 24/7 availability)
- Scroll-reveal animations with Framer Motion
- Accessibility-compliant (ARIA labels, semantic HTML)
- Emerald green brand colors with emergency red accents

**Usage:**

```tsx
import { EmergencyHero } from '@/components/public/sections'

export default function HomePage() {
  return (
    <main>
      <EmergencyHero />
      {/* Other sections */}
    </main>
  )
}
```

**Routes Used:**
- `/claim/submit` - Emergency claim submission
- `/find-contractor` - Contractor search/directory
- `/quote` - Quote request form

**Color Palette:**
- Primary: Emerald Green (`#10B981`)
- Emergency: Red (`#DC2626`)
- Secondary: Blue (`#3B82F6`)
- Background: White/Slate-50 gradient

**Dependencies:**
- `@/src/design-system` - Button component
- `lucide-react` - Icon library
- `framer-motion` - Animation library
- `next/link` - Next.js routing

**Accessibility:**
- Semantic HTML structure (`<section>`, `<h1>`, etc.)
- ARIA labels on interactive elements
- Proper heading hierarchy
- Sufficient color contrast ratios
- Large touch targets (56px minimum on mobile)

**Mobile Optimization:**
- Stacked button layout on mobile
- Responsive text sizing
- Touch-optimized button sizes
- Single-column trust badges on small screens

**Performance:**
- Client-side component (`'use client'`)
- Lazy animation initialization
- Optimized gradient backgrounds
- No external image dependencies

## File Structure

```
components/public/sections/
├── EmergencyHero.tsx          # Main component
├── EmergencyHero.example.tsx  # Usage examples
├── index.ts                   # Component exports
└── README.md                  # Documentation (this file)
```

## Design System Integration

This component uses the Disaster Recovery design system:
- Colors: `dr-emergency`, `dr-education`, emerald palette
- Typography: Display and body text scales
- Spacing: Consistent padding/margin rhythm
- Animations: Subtle scroll-reveal effects

## Future Enhancements

Potential improvements for future iterations:

1. **Props Interface**: Add configuration props for customization
2. **A/B Testing**: Support multiple headline variants
3. **Dynamic Content**: CMS integration for content updates
4. **Analytics**: Track CTA click-through rates
5. **Localization**: Support for multiple languages
6. **Video Background**: Optional video hero variant
7. **Live Stats**: Real-time contractor availability counter

## Testing

To test this component:

```bash
# Run development server
npm run dev

# Navigate to page using EmergencyHero
# Test responsiveness at different breakpoints
# Verify animations and interactions
# Check accessibility with screen reader
```

## Maintenance

- Update trust badges as certifications change
- Monitor CTA performance and optimize copy
- Ensure routing links remain valid
- Update color palette if brand evolves
