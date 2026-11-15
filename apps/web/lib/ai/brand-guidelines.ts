/**
 * NRPG Brand Guidelines System
 *
 * Centralized brand specifications for AI-generated content across:
 * - Marketing copy (headlines, CTAs, value props)
 * - Visual assets (contractor portraits, network maps, trust badges)
 * - Product content (emails, onboarding, tooltips)
 *
 * All AI generations must inject these guidelines to maintain consistency.
 */

export interface ColorPalette {
  primary: string;
  primaryHover: string;
  emergency: string;
  emergencyHover: string;
  contractorAccent: string;
  dark: string;
  light: string;
}

export interface BrandGuidelines {
  name: string;
  mission: string;
  tagline: string;
  description: string;

  // Visual Identity
  colors: ColorPalette;
  typography: {
    displayFont: string;
    bodyFont: string;
    tone: 'emergency' | 'professional' | 'aspirational';
  };

  // Voice & Tone for Different Audiences
  voiceByAudience: {
    emergency: {
      tone: string;
      keywords: string[];
      examples: string[];
    };
    contractor: {
      tone: string;
      keywords: string[];
      examples: string[];
    };
    insurance: {
      tone: string;
      keywords: string[];
      examples: string[];
    };
  };

  // Content Guidelines
  contentGuidelines: {
    ctaMaxLength: number;
    headlineMaxLength: number;
    paragraphMaxLength: number;
    keyMessages: string[];
    avoidWords: string[];
    emphasizeWords: string[];
  };

  // Asset Generation Guidelines
  assetGuidelines: {
    colorHarmony: string;
    designStyle: string;
    photographyStyle: string;
    iconStyle: string;
    backgroundColor: string;
  };

  // Copy Generation Patterns
  copyPatterns: {
    emergencyHeadline: string;
    emergencySubheadline: string;
    contractorHeadline: string;
    serviceDescription: string;
    ctaPattern: string;
  };
}

// NRPG Brand Guidelines - Live Definition
export const nrpgBrandGuidelines: BrandGuidelines = {
  name: 'NRPG (National Restoration Platform Group)',
  mission: 'Transform disaster recovery by connecting Australia with elite qualified contractors as quickly as possible in metro areas.',
  tagline: 'Professional Disaster Recovery. One Call Away.',
  description: 'National platform connecting emergency clients with vetted, insured disaster restoration contractors across Australia.',

  // Colors (Semantic Color System)
  colors: {
    primary: '#0047FF',
    primaryHover: '#0039CC',
    emergency: '#DC2626',
    emergencyHover: '#B91C1C',
    contractorAccent: '#00BFA6',
    dark: '#020617',
    light: '#F8FAFC',
  },

  // Typography
  typography: {
    displayFont: 'Space Grotesk',
    bodyFont: 'Plus Jakarta Sans',
    tone: 'emergency',
  },

  // Voice & Tone by Audience
  voiceByAudience: {
    emergency: {
      tone: 'Urgent, empathetic, action-oriented. "Help is coming." Reassuring but fast.',
      keywords: ['immediate', 'now', 'certified', 'rapid response', 'help', 'professional', '24/7'],
      examples: [
        'Your home is damaged. Professional help is on the way.',
        'Active disaster? Get qualified help dispatched now.',
        'Water damage spreading? Stop the damage NOW with certified pros.',
      ],
    },
    contractor: {
      tone: 'Professional, aspirational, data-driven. "Elite network." Exclusive but welcoming.',
      keywords: ['elite', 'network', 'certified', 'exclusive', 'revenue', 'professional', '500+'],
      examples: [
        'Join Australia\'s most exclusive restoration network.',
        'Elite IICRC contractors earn $400K+ annually with NRPG.',
        'Only 1 in 4 applicants approved. Are you elite?',
      ],
    },
    insurance: {
      tone: 'Authoritative, data-backed, institutional. "Verified network." Trustworthy and transparent.',
      keywords: ['verified', 'audited', 'IICRC', 'insured', 'transparent', 'data', 'certified'],
      examples: [
        'Access Australia\'s most verified restoration network.',
        'Qualified, insured, and background-checked.',
        'Real-time claim tracking with pre-approved contractors.',
      ],
    },
  },

  // Content Guidelines
  contentGuidelines: {
    ctaMaxLength: 60,
    headlineMaxLength: 100,
    paragraphMaxLength: 250,
    keyMessages: [
      'qualified professionals',
      'Priority emergency response',
      '500+ vetted contractors nationwide',
      '24/7 emergency dispatch',
      'Pre-approved by major insurers',
      'Transparent, upfront pricing',
    ],
    avoidWords: [
      'hopefully',
      'maybe',
      'probably',
      'soon',
      'might',
      'allegedly',
      'informal slang',
    ],
    emphasizeWords: [
      'certified',
      'professional',
      'verified',
      'immediate',
      'emergency',
      'IICRC',
      'nationwide',
      'trusted',
    ],
  },

  // Asset Generation Guidelines
  assetGuidelines: {
    colorHarmony: 'Primary blue (#0047FF) for professional trust, emergency red (#DC2626) for urgency, contractor teal (#00BFA6) for accents',
    designStyle: 'Modern, clean, professional. Material Design 3 principles. High contrast for accessibility.',
    photographyStyle: 'Professional corporate headshots, candid team collaboration, active disaster scenes (respectful), before/after restoration.',
    iconStyle: 'Outline style icons from Material Design or custom SVG. Consistent 2px stroke width.',
    backgroundColor: 'White (#FFFFFF) for light mode, Deep dark (#020617) for dark mode. Avoid pure black.',
  },

  // Copy Generation Patterns (for templating)
  copyPatterns: {
    emergencyHeadline: '[Problem] in [location]? [Action] in [timeframe].',
    emergencySubheadline: '[Number] qualified [service] contractors ready 24/7. [Key benefit].',
    contractorHeadline: 'Join Australia\'s most [adjective] restoration network.',
    serviceDescription: '[Service] by qualified professionals. [Key benefit]. Available [availability].',
    ctaPattern: '[Verb] [direct benefit] [timeframe/assurance]',
  },
};

/**
 * Generate Brand Context String for Gemini Prompts
 * Include this in all AI generation prompts to ensure brand consistency
 */
export function getBrandContextString(audience: 'emergency' | 'contractor' | 'insurance'): string {
  const guide = nrpgBrandGuidelines;
  const voice = guide.voiceByAudience[audience];

  return `
BRAND CONTEXT - NRPG (National Restoration Platform Group)

MISSION: ${guide.mission}
TAGLINE: ${guide.tagline}

TARGET AUDIENCE: ${audience.toUpperCase()}
VOICE & TONE: ${voice.tone}
KEY KEYWORDS: ${voice.keywords.join(', ')}

BRAND COLORS:
- Primary: ${guide.colors.primary} (trust, professional)
- Emergency: ${guide.colors.emergency} (urgency, crisis)
- Contractor Accent: ${guide.colors.contractorAccent} (exclusive, professional)

KEY MESSAGES:
${guide.contentGuidelines.keyMessages.map(msg => `- ${msg}`).join('\n')}

CONTENT RULES:
- CTA Max Length: ${guide.contentGuidelines.ctaMaxLength} characters
- Headline Max Length: ${guide.contentGuidelines.headlineMaxLength} characters
- Emphasize: ${guide.contentGuidelines.emphasizeWords.join(', ')}
- Avoid: ${guide.contentGuidelines.avoidWords.join(', ')}

VISUAL GUIDELINES:
- Style: ${guide.assetGuidelines.designStyle}
- Photography: ${guide.assetGuidelines.photographyStyle}
- Icons: ${guide.assetGuidelines.iconStyle}

EXAMPLE MESSAGES:
${voice.examples.map(ex => `- "${ex}"`).join('\n')}

IMPORTANT: Generated content must align with BRAND COLORS and VOICE for the ${audience} audience.
`;
}

/**
 * Generate Visual Design Brief for Gemini Image Generation
 */
export function getVisualDesignBrief(assetType: string): string {
  const guide = nrpgBrandGuidelines;

  return `
VISUAL DESIGN BRIEF

Asset Type: ${assetType}

BRAND COLORS (Use as color harmony):
- Primary: ${guide.colors.primary}
- Emergency: ${guide.colors.emergency}
- Contractor Accent: ${guide.colors.contractorAccent}
- Dark: ${guide.colors.dark}
- Light: ${guide.colors.light}

DESIGN STYLE: ${guide.assetGuidelines.designStyle}
PHOTOGRAPHY STYLE: ${guide.assetGuidelines.photographyStyle}
ICON STYLE: ${guide.assetGuidelines.iconStyle}
BACKGROUND: ${guide.assetGuidelines.backgroundColor}

Typography:
- Display Font: ${guide.typography.displayFont}
- Body Font: ${guide.typography.bodyFont}

OUTPUT REQUIREMENTS:
- Professional quality suitable for institutional trust signals
- Scalable vector-compatible design (if SVG)
- High contrast for readability
- Accessible to colorblind users
- Australian context where relevant
- Modern, clean aesthetic

AVOID:
- Cartoons or illustrations
- Outdated design styles
- Poor contrast
- Text-heavy designs
- Unrealistic graphics
`;
}

/**
 * Get tone and keywords for content generation by audience
 */
export function getAudienceTone(audience: 'emergency' | 'contractor' | 'insurance') {
  return nrpgBrandGuidelines.voiceByAudience[audience];
}

/**
 * Validate generated content against brand guidelines
 */
export function validateBrandCompliance(
  content: string,
  audience: 'emergency' | 'contractor' | 'insurance'
): {
  compliant: boolean;
  issues: string[];
} {
  const guide = nrpgBrandGuidelines;
  const voice = guide.voiceByAudience[audience];
  const issues: string[] = [];

  // Check for avoided words
  guide.contentGuidelines.avoidWords.forEach(word => {
    if (content.toLowerCase().includes(word.toLowerCase())) {
      issues.push(`Contains avoided word: "${word}"`);
    }
  });

  // Check length (basic validation)
  if (content.length > guide.contentGuidelines.paragraphMaxLength) {
    issues.push(`Content too long: ${content.length} chars (max ${guide.contentGuidelines.paragraphMaxLength})`);
  }

  // Check for key emphasis words (should have at least one)
  const hasEmphasisWord = guide.contentGuidelines.emphasizeWords.some(
    word => content.toLowerCase().includes(word.toLowerCase())
  );
  if (!hasEmphasisWord && audience === 'contractor') {
    issues.push('Should emphasize at least one key word: ' + guide.contentGuidelines.emphasizeWords.slice(0, 3).join(', '));
  }

  return {
    compliant: issues.length === 0,
    issues,
  };
}

export default nrpgBrandGuidelines;
