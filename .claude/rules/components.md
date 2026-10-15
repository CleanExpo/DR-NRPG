---
paths:
  - "apps/web/components/**"
  - "apps/web/src/components/**"
---

# Component Standards — Scientific Luxury Design System

## Design system:
- OLED black background: `#050505` — never use generic Tailwind `bg-black`
- No generic Tailwind colour defaults. All colours from the design token system.
- Mobile-first responsive design. Every component must work on 320px width.
- WCAG 2.1 AA accessibility. All interactive elements keyboard accessible.
- Page load target: <2s on 4G connection.

## Every component MUST have:
1. **Loading state** — Skeleton or spinner while data loads
2. **Error state** — User-friendly error message with retry option
3. **Empty state** — Meaningful message when no data exists
4. **Mobile responsive** — Tested at 320px, 375px, 768px, 1024px, 1440px
5. **Keyboard accessible** — Tab order, focus indicators, ARIA labels

## Component architecture:
- Server Components by default. Client Components only when interactivity is required.
- Mark Client Components with `'use client'` directive at the top.
- Extract reusable logic into custom hooks.
- Props must be typed — no `any` in component interfaces.
- Cleanup effects in useEffect returns (unsubscribe, abort controllers).

## Forbidden:
- Inline styles (use Tailwind or CSS modules)
- Magic numbers (extract to constants or design tokens)
- Phone numbers, email addresses, street addresses, or business locations in UI
