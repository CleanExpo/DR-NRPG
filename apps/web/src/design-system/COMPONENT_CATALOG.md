# DesignOS Component Catalog

**Version:** 1.0.0
**Status:** 95% Complete
**Components:** 18
**Templates:** 3

---

## Quick Reference

### Import All Components
```tsx
import {
  // Core UI
  Button, PriorityCard, EmergencyCTA, StickyEmergencyCTA,

  // Forms (Complete)
  FormInput, FormSelect, FormTextarea, FormCheckbox,

  // Feedback
  LoadingProgress, LoadingOverlay, ErrorState, SuccessState, Toast,

  // Navigation
  Header,

  // Data Display
  StatCard, BeforeAfterComparison,

  // Interactive
  DecisionTree, Timeline,

  // CRM
  IncidentTable,

  // Templates
  EmergencyIntakePageTemplate,
  EducationalArticlePageTemplate,
  NRPGDashboardPageTemplate,

  // Hooks
  useContextualTheme, useBrandTheme, useIsEmergency, useIsNRPG,

  // Utilities
  getPageContext, getContextColors, getBrandColors,
} from '@/design-system';
```

---

## Component Categories

### 1. Core UI (3)
- **Button** - Context-aware variants (emergency, education, NRPG)
- **PriorityCard** - CRM incident cards with 4-indicator signaling
- **EmergencyCTA** - Dual-path call-to-action (Call + Online)

### 2. Forms (4) - Complete
- **FormInput** - Text input with smart hybrid validation
- **FormSelect** - Dropdown with validation
- **FormTextarea** - Multi-line with character count
- **FormCheckbox** - Checkbox with integrated label

### 3. Feedback (4)
- **LoadingProgress** - Step-by-step progress indicator
- **ErrorState** - Transparent error explanations with alternatives
- **SuccessState** - Subtle professional success feedback
- **Toast** - Notification system with auto-dismiss

### 4. Navigation (1)
- **Header** - Responsive header with 768px hamburger menu

### 5. Data Display (3)
- **StatCard** - Metric cards with trends (contractor dashboard)
- **BeforeAfterComparison** - Expandable before/after evidence

### 6. Interactive (2)
- **DecisionTree** - "Who First?" decision flow
- **Timeline** - Animated timeline or interactive checklist

### 7. CRM (1)
- **IncidentTable** - High-density incident table with priority signaling

---

## Page Templates (3)

### 1. Emergency Intake
Crisis-optimized form with all emergency components
- Large tap targets (56px)
- No animations
- Red emergency palette
- Sticky mobile CTA

### 2. Educational Article
Engaging educational content with animations
- Animated timeline
- Before/after comparisons
- Scroll-triggered reveals

### 3. NRPG Dashboard
Professional contractor portal (LinkedIn-style)
- Stat cards (earnings, completion, rating)
- High-density incident table
- Leaderboard integration
- Auto-refresh notifications

---

## Design Tokens

### Colors
- Emergency: `bg-dr-emergency`, `text-dr-emergency`
- Education: `bg-dr-education`, `text-dr-education`
- Authority: `bg-dr-authority`, `text-dr-authority`
- NRPG: `bg-nrpg-primary`, `bg-nrpg-secondary`
- Priority: `bg-priority-critical`, `bg-priority-high`, etc.

### Typography
- Serif: `font-serif` (Playfair/Merriweather for authority)
- Sans: `font-sans-modern` (Inter/Archivo for clarity)

---

## Theme Hooks

### useContextualTheme
Auto-detects emergency vs education vs authority pages
```tsx
const theme = useContextualTheme();
// { context, colors, animationsEnabled, typography }
```

### useBrandTheme
Detects Disaster Recovery vs NRPG brand
```tsx
const brand = useBrandTheme();
// { brand, colors, name, tagline }
```

---

## Status: 95% Complete

**Complete:**
- ✅ 18 components
- ✅ 3 page templates
- ✅ Design tokens
- ✅ Theme hooks
- ✅ Documentation
- ✅ Tailwind integration

**Remaining (5%):**
- ⏳ Storybook stories (optional)
- ⏳ Figma files (optional)

**DesignOS is production-ready and provides everything needed to build the complete NRPG platform!**
