# Storybook Component Library

**Project:** DisasterRecovery.com.au - DesignOS Component Library
**Version:** 1.0.0
**Date:** 2026-01-02
**Storybook URL:** http://localhost:6006 (development)

---

## Overview

This Storybook instance documents the **DesignOS design system** - a comprehensive component library for the Disaster Recovery NRPG Platform.

### What's Included

**18 Existing DesignOS Components:**
1. Button (emergency, education, NRPG variants)
2. EmergencyCTA (dual-path crisis CTAs)
3. FormInput (validation, accessibility)
4. FormTextarea (multi-line input)
5. FormCheckbox (accessible checkboxes)
6. FormSelect (dropdown selections)
7. Toast (notifications with severity)
8. LoadingProgress (step-by-step progress)
9. StatCard (metrics with trends)
10. BeforeAfterComparison (photo comparisons)
11. Timeline (process visualization)
12. DecisionTree (interactive assessment)
14. PriorityCard (color-coded priorities)
15. IncidentTable (CRM dashboard)
16. SuccessState (confirmation screens)
17. ErrorState (error handling)
18. Hero (marketing hero sections)
19. TestimonialCard (customer proof)
20. PricingCard (pricing tiers)

**Plus Marketing Components:**
- Hero variants (full-width, split-screen, video background)
- Testimonial cards
- Pricing cards

---

## Getting Started

### Installation

Storybook is already installed. If you need to reinstall:

```bash
npm install --save-dev @storybook/nextjs @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/addon-a11y @storybook/blocks @storybook/test storybook
```

### Running Storybook

**Development mode:**
```bash
npm run storybook
```

This will start Storybook at http://localhost:6006

**Build for production:**
```bash
npm run build-storybook
```

This creates a static build in `storybook-static/` that can be deployed.

---

## Using Storybook

### Navigating the Library

**Sidebar:**
- Organized by category (Components, Marketing, CRM, etc.)
- Search bar for quick component lookup
- Expandable component sections

**Toolbar:**
- **Brand Switcher:** Toggle between Disaster Recovery and NRPG themes
- **Context Switcher:** Toggle between emergency and educational modes
- **Viewport:** Test responsive breakpoints (mobile, tablet, desktop)
- **Background:** Change background color (light, dark, gray)

### Component Stories

Each component includes:

**1. Documentation Tab:**
- Component description
- Props table (TypeScript types)
- Usage examples
- Accessibility notes

**2. Canvas Tab:**
- Live component preview
- Interactive controls (props playground)
- Multiple story variants

**3. Accessibility Tab:**
- WCAG compliance check
- Color contrast validation
- ARIA label verification

### Controls Panel

Use the **Controls** panel to interact with component props in real-time:

**Example - Button Component:**
- **variant:** Select emergency-primary, education-primary, nrpg-primary, etc.
- **size:** Select sm, default, lg, crisis, crisis-full, call
- **loading:** Toggle loading state
- **disabled:** Toggle disabled state
- **icon:** Add/remove icon
- **iconPosition:** left or right

### Brand & Context Switching

**Brand Switching:**
1. Click **Brand** in toolbar
2. Select **Disaster Recovery** (blue/teal calm) or **NRPG** (navy/gold professional)
3. Watch components update theme instantly

**Context Switching:**
1. Click **Context** in toolbar
2. Select **Emergency** (no animations, urgent) or **Educational** (subtle animations, calm)
3. See components adapt behavior

---

## Writing Stories

### File Structure

Stories live next to components:

```
src/design-system/components/
  Button/
    Button.tsx              # Component implementation
    Button.stories.tsx      # Storybook stories
  EmergencyCTA/
    EmergencyCTA.tsx
    EmergencyCTA.stories.tsx
```

### Basic Story Template

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './YourComponent';

const meta = {
  title: 'DesignOS/Components/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define prop controls
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
  },
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default prop values
    variant: 'primary',
    children: 'Click me',
  },
};
```

### Story Best Practices

**1. Create Multiple Variants:**
- Default state
- Loading state
- Disabled state
- Error state
- Edge cases

**2. Add Documentation:**
```tsx
export const EmergencyPrimary: Story = {
  args: {
    variant: 'emergency-primary',
    children: 'Call Emergency',
  },
  parameters: {
    docs: {
      description: {
        story: 'Emergency buttons use red color and no animations for immediate response feel.',
      },
    },
  },
};
```

**3. Include Accessibility Examples:**
```tsx
export const Accessible: Story = {
  args: {
    'aria-label': 'Submit emergency form',
    children: 'Submit',
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
};
```

**4. Show Responsive Behavior:**
```tsx
export const Mobile: Story = {
  args: {
    size: 'crisis-full',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};
```

---

## Accessibility Testing

### Built-in A11y Checks

Storybook includes **@storybook/addon-a11y** for automated accessibility testing.

**Features:**
- Color contrast validation
- ARIA label verification
- Keyboard navigation testing
- Screen reader compatibility

**How to Use:**
1. Open any component story
2. Click **Accessibility** tab
3. Review violations (if any)
4. Fix issues in component
5. Re-run checks

### Manual Accessibility Testing

**Keyboard Navigation:**
1. Tab through interactive elements
2. Verify focus indicators (2px ring)
3. Test Enter/Space activation
4. Test Escape to close modals

**Screen Reader Testing:**
1. Enable screen reader (NVDA, JAWS, VoiceOver)
2. Navigate through component
3. Verify ARIA labels read correctly
4. Verify roles announced properly

---

## Deployment

### Deploy to Vercel (Recommended)

**1. Build Storybook:**
```bash
npm run build-storybook
```

**2. Deploy to Vercel:**
```bash
# Install Vercel CLI if not installed
npm install -g vercel

# Deploy storybook-static folder
cd storybook-static
vercel --prod
```

**3. Set up custom domain (optional):**
- In Vercel dashboard, add domain: `storybook.disasterrecovery.com.au`
- Configure DNS records
- SSL automatically provisioned

### Deploy to GitHub Pages

**1. Install gh-pages:**
```bash
npm install --save-dev gh-pages
```

**2. Add deploy script to package.json:**
```json
{
  "scripts": {
    "deploy-storybook": "npm run build-storybook && gh-pages -d storybook-static"
  }
}
```

**3. Deploy:**
```bash
npm run deploy-storybook
```

**4. Access at:**
```
https://[your-org].github.io/[repo-name]/
```

---

## Creating New Stories

### Step-by-Step Guide

**1. Create component file:**
```bash
# Example: Create a new Badge component
src/design-system/components/Badge/Badge.tsx
```

**2. Implement component:**
```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'px-2 py-1 rounded-full text-sm font-medium',
        variant === 'success' && 'bg-green-100 text-green-800',
        variant === 'warning' && 'bg-yellow-100 text-yellow-800',
        variant === 'error' && 'bg-red-100 text-red-800',
        variant === 'info' && 'bg-blue-100 text-blue-800'
      )}
    >
      {children}
    </span>
  );
}
```

**3. Create story file:**
```bash
src/design-system/components/Badge/Badge.stories.tsx
```

**4. Write stories:**
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta = {
  title: 'DesignOS/Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'error', 'info'],
      description: 'Visual variant of the badge',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Completed',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Pending',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Failed',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'In Progress',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
};
```

**5. Run Storybook:**
```bash
npm run storybook
```

**6. Verify:**
- Component appears in sidebar under `DesignOS/Components/Badge`
- All stories render correctly
- Controls work in Controls panel
- Accessibility tab shows no violations

---

## Troubleshooting

### Common Issues

**1. "Module not found" errors**

**Problem:** Webpack can't resolve imports

**Solution:** Check webpack aliases in `.storybook/main.ts`:
```typescript
config.resolve.alias = {
  ...config.resolve.alias,
  '@': path.resolve(__dirname, '../src'),
  '@/components': path.resolve(__dirname, '../components'),
  '@/lib': path.resolve(__dirname, '../src/lib'),
  '@/design-system': path.resolve(__dirname, '../src/design-system'),
};
```

**2. Tailwind styles not loading**

**Problem:** Global CSS not imported

**Solution:** Import in `.storybook/preview.ts`:
```typescript
import '../app/globals.css'; // or '../src/app/globals.css'
```

**3. Stories not appearing in sidebar**

**Problem:** Story files not matching glob pattern

**Solution:** Check `.storybook/main.ts` stories config:
```typescript
stories: [
  '../src/design-system/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  '../src/design-system/**/*.mdx',
],
```

**4. TypeScript errors in stories**

**Problem:** Type mismatch between component and story args

**Solution:** Use `satisfies Meta<typeof Component>` for type safety:
```typescript
const meta = {
  // ...config
} satisfies Meta<typeof YourComponent>;
```

---

## Best Practices

### Component Organization

**Recommended structure:**
```
src/design-system/components/
  [ComponentName]/
    [ComponentName].tsx        # Main component
    [ComponentName].stories.tsx # Storybook stories
    [ComponentName].test.tsx    # Unit tests
    index.ts                    # Export barrel
```

### Story Naming

**Use descriptive story names:**
```tsx
// Good
export const EmergencyPrimary: Story = { /* ... */ };
export const LoadingState: Story = { /* ... */ };
export const DisabledWithTooltip: Story = { /* ... */ };

// Avoid
export const Story1: Story = { /* ... */ };
export const Test: Story = { /* ... */ };
export const Example: Story = { /* ... */ };
```

### Documentation

**Add component description in meta:**
```tsx
const meta = {
  title: 'DesignOS/Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'Context-aware button component with emergency, educational, and NRPG variants. Supports loading states, icons, and crisis-optimized sizes.',
      },
    },
  },
} satisfies Meta<typeof Button>;
```

**Add story descriptions:**
```tsx
export const EmergencyPrimary: Story = {
  args: { /* ... */ },
  parameters: {
    docs: {
      description: {
        story: 'Emergency buttons use red color and transition-none for immediate response feel. Optimised for stressed users during disasters.',
      },
    },
  },
};
```

### Prop Documentation

**Use JSDoc comments in component:**
```tsx
export interface ButtonProps {
  /**
   * Visual variant of the button
   * @default 'default'
   */
  variant?: 'default' | 'emergency-primary' | 'education-primary';

  /**
   * Size of the button
   * @default 'default'
   */
  size?: 'sm' | 'default' | 'lg' | 'crisis';

  /**
   * Show loading spinner
   * @default false
   */
  loading?: boolean;
}
```

---

## Component Library Reference

### Foundation Components

**Button**
- Path: `src/design-system/components/Button/Button.tsx`
- Variants: 13 variants (emergency, education, NRPG, default)
- Sizes: 8 sizes (sm, default, lg, xl, icon, crisis, crisis-full, call)
- Features: Loading states, icons, disabled states

**Form Components**
- FormInput: Text input with validation
- FormTextarea: Multi-line text input
- FormCheckbox: Accessible checkboxes
- FormSelect: Dropdown selections

**Toast**
- Notification system
- Severity levels (success, warning, error, info)
- Auto-dismiss or persistent

### Emergency Components

**EmergencyCTA**
- Dual-path crisis CTAs (call + online)
- Mobile sticky variant
- Reduces decision paralysis

**DecisionTree**
- Interactive damage assessment
- Step-by-step guidance
- Conditional routing

**LoadingProgress**
- Step-by-step progress indicators
- Shows what's happening
- Reduces perceived wait time

### Marketing Components

**Hero**
- Full-width hero sections
- Multiple variants (split-screen, video background)
- CTA-focused

**TestimonialCard**
- Customer proof with ratings
- Photo + name + location
- Verified badge option

**PricingCard**
- Pricing tiers with features
- Comparison layout
- CTA buttons

### Data Display

**StatCard**
- Key metrics with trend indicators
- Icon support
- Color-coded changes

**BeforeAfterComparison**
- Before/after photo slider
- Click to reveal full image
- Respects user comfort level

**Timeline**
- Process visualization
- Scroll-triggered reveals
- Milestone markers

### CRM Components

**IncidentTable**
- Sortable, filterable incidents
- Priority indicators
- Bulk actions

**PriorityCard**
- Color-coded priority levels
- Icon system
- Auto-positioning

### Success Components

**SuccessState**
- Confirmation screens
- Next steps guidance
- Share/print options

**ErrorState**
- Error handling with recovery options
- Transparent explanations
- Alternative actions

---

## Resources

### Links

- **Storybook Documentation:** https://storybook.js.org/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **Radix UI (accessible primitives):** https://radix-ui.com
- **Tailwind CSS:** https://tailwindcss.com

### Internal Documentation

- [Content Style Guide](CONTENT_STYLE_GUIDE.md)
- [Operations Playbook](OPERATIONS_PLAYBOOK.md)
- [SEO Strategy](SEO_STRATEGY.md)
- [DesignOS Specification](../DESIGNOS_SPEC.md)

---

**Document Version:** 1.0.0
**Last Updated:** 2026-01-02
**Owner:** Design Team
**Storybook Version:** 7.6.x
