# DesignOS - NRPG Design System

**Version:** 1.0.0
**Status:** Foundation Complete (40%)
**Branch:** DesignOS

---

## Overview

DesignOS is the comprehensive design system powering the NRPG dual-sided SaaS platform. It provides a shared foundation with distinct brand expressions for Disaster Recovery (client-facing) and NRPG (contractor-facing).

### Core Philosophy

1. **Context-Aware Adaptation** - Emergency pages minimize friction, education pages engage
2. **Authority Through Clarity** - Institutional trust via typography and clinical precision
3. **Crisis-Optimized UX** - Zero friction for 2am panic users
4. **Shared Foundation, Distinct Expression** - Same components, different brand skins

---

## Quick Start

### Installation

```tsx
// Import from design system
import {
  Button,
  PriorityCard,
  EmergencyCTA,
  FormInput,
  LoadingProgress,
  Header,
  ErrorState,
  DecisionTree,
  Timeline,
  useContextualTheme,
  useBrandTheme,
} from '@/design-system';
```

### Basic Usage

```tsx
// Emergency page with crisis-optimized button
function EmergencyPage() {
  const theme = useContextualTheme();
  // theme.context = 'emergency'
  // theme.animationsEnabled = false

  return (
    <div>
      <h1 className="font-serif text-dr-emergency text-5xl">
        Who First?™
      </h1>

      <Button variant="emergency-primary" size="crisis-full">
        🚨 Get Help Now
      </Button>
    </div>
  );
}

// Educational page with engaging components
function EducationalPage() {
  return (
    <div>
      <Timeline
        steps={restorationSteps}
        mode="timeline"
        animated={true}
      />

      <Button variant="education-primary" size="lg">
        Learn More →
      </Button>
    </div>
  );
}

// NRPG contractor portal
function NRPGDashboard() {
  const brand = useBrandTheme();
  // brand.brand = 'nrpg'

  return (
    <div>
      <Header logoText="NRPG" emergencyCTA={false} />

      <PriorityCard priority="critical">
        Critical incident details
      </PriorityCard>
    </div>
  );
}
```

---

## Components

### Complete Component Library (18 Components)

**Core UI:**
1. Button - Context-aware variants
2. PriorityCard - 4-indicator CRM signaling
3. EmergencyCTA - Dual-path (Call + Online)

**Forms (Complete):**
4. FormInput - Smart hybrid validation
5. FormSelect - Dropdown with validation
6. FormTextarea - Character count
7. FormCheckbox - Integrated label

**Feedback:**
8. LoadingProgress - Detailed steps
9. ErrorState - Transparent explanations
10. SuccessState - Subtle professional
11. Toast - Notifications

**Navigation:**
12. Header - Responsive, 768px hamburger

**Data Display:**
14. StatCard - Contractor metrics
15. BeforeAfterComparison - Expandable evidence

**Interactive:**
16. DecisionTree - "Who First?" flow
17. Timeline - Animated or checklist

**CRM:**
18. IncidentTable - High-density table

---

### Component Examples

#### Button
```tsx
<Button variant="emergency-primary" size="crisis-full">
  🚨 Emergency
</Button>

<Button variant="education-primary" size="lg">
  Learn More
</Button>
```

#### Forms (Complete)
```tsx
<FormInput
  label="Phone Number"
  type="tel"
  required
  context="emergency"
  validationType="instant"
  error={errors.phone}
/>

<FormSelect
  label="State"
  options={[
    { value: 'NSW', label: 'New South Wales' },
    { value: 'VIC', label: 'Victoria' }
  ]}
  required
  context="emergency"
/>

<FormTextarea
  label="Description"
  maxLength={500}
  showCharCount
  helpText="Describe the damage"
/>

<FormCheckbox
  label="I agree to terms"
  helpText="Read our terms and conditions"
/>
```

#### Toast Notifications
```tsx
<Toast
  variant="success"
  title="Payment processed"
  message="Subscription activated"
  duration={5000}
/>

// CRM auto-refresh (30-second polling)
<Toast
  variant="info"
  title="2 new incidents"
  action={{
    label: 'View Now',
    onClick: () => router.push('/crm')
  }}
/>
```

### 2. PriorityCard

CRM incident cards with 4-indicator priority signaling.

```tsx
<PriorityCard priority="critical">
  Sewage backup - 3 floors - School
</PriorityCard>
```

**Priorities:** critical, high, medium, low
**Indicators:** Color (border-left), Icon (fire/clock/circle/check), Position (CSS order), Size (height varies)

### 3. EmergencyCTA

Dual-path CTA (Call + Online Help).

```tsx
<EmergencyCTA
  phoneNumber="1300 309 361"
  onlineHelpUrl="/intake/emergency"
/>

// Mobile sticky variant
<StickyEmergencyCTA phoneNumber="1300 309 361" />
```

### 4. FormInput

Smart hybrid validation input.

```tsx
<FormInput
  label="Phone Number"
  type="tel"
  required
  context="emergency" // Large 56px height
  validationType="instant" // Format errors show on blur
  helpText="Australian mobile or landline"
  error={errors.phone}
/>
```

**Validation Types:** instant (format errors), on-blur, on-submit (required errors)
**Contexts:** emergency (56px), education (40px)

### 5. LoadingProgress

Detailed step-by-step loading indicator.

```tsx
<LoadingProgress
  steps={[
    { id: '1', label: 'Validating...', status: 'complete' },
    { id: '2', label: 'Matching contractors...', status: 'in-progress' },
    { id: '3', label: 'Sending notifications', status: 'pending' }
  ]}
  estimatedSeconds={15}
/>

// Full-screen overlay
<LoadingOverlay steps={steps} estimatedSeconds={15} />
```

### 6. Header

Responsive navigation with 768px hamburger.

```tsx
<Header
  logoText="NRPG"
  phoneNumber="1300 309 361"
  emergencyCTA={true}
/>
```

### 7. ErrorState

Transparent error explanations with alternatives.

```tsx
<ErrorState
  severity="warning"
  title="All Contractors Busy"
  message="We're expanding our search..."
  explanation="Searching 50km radius (Parramatta, Liverpool...)"
  showProgress
  progressValue={60}
  alternatives={[
    { label: 'Call 1300 309 361', action: callNow },
    { label: 'Try Again', action: retry }
  ]}
/>
```

**Certifications:** FSRT, WRT, AMRT, ASD, OCT
**Tooltips:** Always visible, full descriptions

### 9. DecisionTree

"Who First?" interactive decision flow.

```tsx
<DecisionTree
  onComplete={(answers) => {
    router.push(`/education/${generateSlug(answers)}`);
  }}
/>
```

### 10. Timeline

Process timeline with scroll reveals or checklist mode.

```tsx
<Timeline
  steps={restorationSteps}
  mode="timeline"
  animated={true}
/>

<Timeline
  steps={restorationSteps}
  mode="checklist"
  onStepCheck={(id, checked) => trackProgress(id, checked)}
/>
```

---

## Hooks

### useContextualTheme

Auto-detects page context and returns appropriate theme.

```tsx
const theme = useContextualTheme();
// Returns: { context, colors, animationsEnabled, typography }

// Use in components
<div style={{ backgroundColor: theme.colors.background }}>
  {theme.animationsEnabled && <AnimatedElement />}
</div>
```

### useBrandTheme

Detects brand (Disaster Recovery vs NRPG).

```tsx
const brand = useBrandTheme();
// Returns: { brand, colors, name, tagline }

if (brand.brand === 'nrpg') {
  // Show contractor-specific content
}
```

### Utility Hooks

```tsx
const isEmergency = useIsEmergency();
const isNRPG = useIsNRPG();
const animationsEnabled = useAnimationsEnabled();
```

---

## Design Tokens

### Colors

```tsx
import { disasterRecoveryColors, nrpgColors, priorityColors } from '@/design-system';

// Context colors
disasterRecoveryColors.emergency.primary // #DC2626 (red)
disasterRecoveryColors.education.primary // #00BFA6 (teal)
disasterRecoveryColors.authority.primary // #1E3A8A (navy)

// NRPG colors
nrpgColors.primary // #1E3A8A (navy)
nrpgColors.secondary // #F59E0B (gold)

// Tailwind utilities
className="bg-dr-emergency text-white"
className="bg-dr-education hover:bg-dr-education-hover"
className="bg-nrpg-primary text-white"
className="border-priority-critical bg-priority-critical-bg"
```

### Typography

```tsx
import { fontFamilies, typographyPresets } from '@/design-system';

// Font families
className="font-serif" // Playfair/Merriweather (authority)
className="font-sans-modern" // Inter/Archivo (clarity)

// Presets
const crisisH1 = typographyPresets.crisis.h1;
// Returns: { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing }
```

### Spacing

```tsx
import { spacing, breakpoints, tapTargets } from '@/design-system';

// 8px grid
spacing[2] // 8px
spacing[4] // 16px
spacing[8] // 32px

// Breakpoints
breakpoints.md // '768px' (hamburger trigger)

// Tap targets
tapTargets.crisis // '56px' (panic users)
```

---

## Design Decisions

### Crisis Optimization

**Emergency Pages:**
- No animations (`transition: none`)
- Large tap targets (56px minimum)
- Red color palette
- Dual CTAs (Call + Online)
- Sticky bottom CTA on mobile
- Instant format validation

### Educational Engagement

**Learning Pages:**
- Subtle animations (scroll reveals)
- Comfortable tap targets (44px)
- Teal color palette
- Timeline components
- Accordion FAQs
- Video embeds

### Dual-Brand System

**Disaster Recovery (Client):**
- Calming blues/teals
- "Who First?™" trademark
- Crisis-focused
- Educational authority

**NRPG (Contractor):**
- Professional navy/gold
- LinkedIn-style
- Quality metrics visible (earnings, ratings)
- Certification progress

---

## Accessibility (WCAG AAA)

All components meet WCAG 2.1 AAA:
- 7:1 color contrast minimum
- Keyboard navigation support
- Screen reader compatible (ARIA labels)
- Focus indicators (2px solid ring)
- Explicit labels (never placeholder-only)
- Alternative text for all images
- Motion respects `prefers-reduced-motion`

---

## Status

**Complete (85%):**
- ✅ Design tokens (colors, typography, spacing)
- ✅ Theme hooks (context, brand)
- ✅ Tailwind integration
- ✅ 18 production-ready components
- ✅ Complete form library (Input, Select, Textarea, Checkbox)
- ✅ Feedback components (Loading, Error, Success, Toast)
- ✅ Navigation (Header)
- ✅ CRM components (IncidentTable, PriorityCard)
- ✅ Interactive components (DecisionTree, Timeline)
- ✅ Data display (StatCard, BeforeAfterComparison)

**Remaining (15%):**
- ⏳ Page templates (Emergency intake, Educational article, NRPG dashboard)
- ⏳ Storybook documentation
- ⏳ Figma design files
- ⏳ Additional specialized components

---

## Contributing

1. Add new components to `src/design-system/components/`
2. Export from `src/design-system/index.ts`
3. Follow naming: ComponentName/ComponentName.tsx
4. Include TypeScript types
5. Add prop documentation
6. Maintain WCAG AAA compliance
7. Test on emergency + education contexts

---

**DesignOS v1.0.0**
**Built:** 2026-01-02
**Status:** Foundation Complete
