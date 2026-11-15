/**
 * Emergency Guide Template
 * 1500-word action-focused guides for immediate disaster response
 * Targets: What to do after floods, fires, mould, storms, sewage, etc.
 */

import { GeneratedArticle, TemplateInput, ArticleSection, FAQItem, SEOMetadata } from './types';

const EMERGENCY_TEMPLATES: Record<string, any> = {
  'After a Flood': {
    immediateActions: [
      'Evacuate immediately if water is still rising or if electrical hazards exist',
      'Call emergency services (000) if anyone is in danger',
      'Move to higher ground and stay there until official all-clear',
      'Turn off electricity at main switch if safe to do so',
      'Do not touch electrical appliances or outlets if water is present',
      'Document damage with photos/video for insurance'
    ],
    first24: [
      'Contact your insurance company and file a claim',
      'Call a professional water damage restoration team (NRPG)',
      'Remove excess water manually if safe (mop, bucket)',
      'Open windows and doors for ventilation',
      'Move furniture and contents to higher ground',
      'List damaged items for insurance documentation',
      'Do not attempt major cleanup yourself'
    ],
    whatNotToDo: [
      'Don\'t return to flooded areas without official clearance',
      'Don\'t consume tap water (may be contaminated)',
      'Don\'t touch electrical items or appliances',
      'Don\'t attempt major drying or cleanup yourself',
      'Don\'t discard damaged items until documented',
      'Don\'t ignore professional assessment recommendations'
    ],
    slug: 'what-to-do-after-flood'
  },
  'After a Fire': {
    immediateActions: [
      'If fire is still burning, evacuate immediately and call 000',
      'Close doors behind you to slow fire spread',
      'Feel doors before opening (don\'t open if hot)',
      'Get outside and move away from the property',
      'Go to your designated assembly point',
      'Do not re-enter property for any reason',
      'Call emergency services and your insurance company'
    ],
    first24: [
      'Do not re-enter fire-damaged properties without professional clearance',
      'Contact your insurance company immediately',
      'Call a fire restoration professional for safety assessment',
      'Document external damage with photos (from safe distance)',
      'Arrange temporary accommodation',
      'Notify your mortgage lender and landlord',
      'Contact NRPG () for professional assessment'
    ],
    whatNotToDo: [
      'Don\'t re-enter damaged properties',
      'Don\'t touch structural damage or debris',
      'Don\'t assume your home is safe',
      'Don\'t delay professional assessment',
      'Don\'t attempt cleanup yourself',
      'Don\'t discard damaged items until documented'
    ],
    slug: 'what-to-do-after-fire'
  },
  'After Mould Discovery': {
    immediateActions: [
      'Don\'t touch or disturb mould',
      'Close off affected areas to prevent spore spread',
      'Leave the area and close the door',
      'Open windows in other parts of your home',
      'Contact a professional mould specialist',
      'Consult with family members (especially those with allergies)',
      'Document mould location and extent with photos'
    ],
    first24: [
      'Contact a mould remediation specialist (NRPG)',
      'Request professional mould inspection ($300-$500)',
      'Have mould tested to determine species and toxicity',
      'Identify moisture source causing mould growth',
      'Check insurance for mould coverage (often requires water damage trigger)',
      'Document health symptoms family members experience',
      'Arrange professional remediation (don\'t attempt DIY)'
    ],
    whatNotToDo: [
      'Don\'t disturb mould (releases spores)',
      'Don\'t attempt to paint over mould',
      'Don\'t use bleach spray solutions (ineffective)',
      'Don\'t ignore moisture source',
      'Don\'t delay professional assessment',
      'Don\'t expose immunocompromised family members'
    ],
    slug: 'after-mould-discovery'
  },
  'After Storm Damage': {
    immediateActions: [
      'Stay indoors until storm passes',
      'Avoid downed power lines and debris',
      'Check family and neighbors for injuries',
      'Document damage with photos/video',
      'Make temporary repairs to prevent further damage (cover holes, etc.)',
      'Move contents away from leaks or damage',
      'Contact your insurance company'
    ],
    first24: [
      'File insurance claim with damage documentation',
      'Call NRPG () for professional assessment',
      'Obtain detailed damage report and cost estimate',
      'Make emergency temporary repairs (boarding windows, tarping roof)',
      'List all damaged items for insurance',
      'Take photos from multiple angles',
      'Keep receipts for emergency repairs',
      'Request insurance adjuster appointment'
    ],
    whatNotToDo: [
      'Don\'t climb on damaged roofs',
      'Don\'t touch downed power lines',
      'Don\'t ignore safety hazards',
      'Don\'t delay professional assessment',
      'Don\'t start permanent repairs before insurance inspection',
      'Don\'t discard damaged items without documentation'
    ],
    slug: 'after-storm-damage'
  },
  'Sewage Backup': {
    immediateActions: [
      'Stop using all water fixtures immediately',
      'Don\'t use toilets, sinks, or showers',
      'Evacuate affected areas',
      'Avoid contact with sewage (serious health risk)',
      'Contact us for service for emergency sewage cleanup',
      'Contact your insurance company',
      'Document with photos (from safe distance)'
    ],
    first24: [
      'Professional sewage cleanup (DO NOT attempt DIY)',
      'Hazmat-level containment and removal',
      'Complete disinfection and biohazard treatment',
      'Structural drying and assessment',
      'Identify sewage backup cause (main line, septic, etc.)',
      'Arrange temporary water/sewage solutions',
      'Follow professional recommendations for reconstruction'
    ],
    whatNotToDo: [
      'Don\'t touch or approach sewage',
      'Don\'t attempt cleanup yourself',
      'Don\'t use fixtures until professional clearance',
      'Don\'t ignore health warnings',
      'Don\'t delay professional response',
      'Don\'t allow family members in affected areas'
    ],
    slug: 'sewage-backup-emergency'
  }
};

/**
 * Generate an emergency guide article
 */
export function generateEmergencyGuide(input: TemplateInput): GeneratedArticle {
  const guideName = input.serviceName || 'Emergency Disaster Response';
  const template = EMERGENCY_TEMPLATES[guideName] || EMERGENCY_TEMPLATES['After a Flood'];
  const authorName = input.authorName || 'Phil McGurk';
  const authorCredentials = input.authorCredentials || [
    'IICRC Master Restorer',
    '15+ years emergency response experience',
    'Director of NRPG Network'
  ];

  // Generate slug
  const slug = template.slug || guideName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  // Determine primary keyword
  const primaryKeyword = input.primaryKeyword || `${guideName.toLowerCase()} australia`;
  const secondaryKeywords = [
    `emergency ${guideName.toLowerCase()}`,
    `first aid after ${guideName.toLowerCase()}`,
    `what to do ${guideName.toLowerCase()}`,
    `disaster checklist`
  ];

  // Generate sections
  const sections: ArticleSection[] = generateEmergencySections(guideName, template);

  // Generate FAQs
  const faqs = generateEmergencyFAQs(guideName);

  // Generate SEO metadata
  const seo: SEOMetadata = {
    title: `${guideName} - Emergency Guide | NRPG`,
    metaDescription: `Immediate action guide for ${guideName.toLowerCase()}. Step-by-step instructions for safety and recovery. Contact NRPG.`,
    keywords: [primaryKeyword, ...secondaryKeywords],
    primaryKeyword,
    secondaryKeywords,
    slug: `/resources/${slug}`,
    internalLinks: generateEmergencyLinks(guideName),
    schema: {
      type: 'HowTo',
      author: {
        name: authorName,
        credentials: authorCredentials
      }
    }
  };

  // Combine sections into content
  const content = sections.map(s => `${s.content}`).join('\n\n');
  const totalWordCount = sections.reduce((sum, s) => sum + s.wordCount, 0) + faqs.length * 30;
  const estimatedReadTime = Math.ceil(totalWordCount / 200);

  return {
    title: seo.title,
    slug: seo.slug,
    templateType: 'emergency-guide',
    content,
    sections,
    faqs,
    wordCount: totalWordCount,
    estimatedReadTime,
    seo,
    authorName,
    authorCredentials,
    status: 'DRAFT',
    createdAt: new Date()
  };
}

/**
 * Generate emergency guide sections
 */
function generateEmergencySections(guideName: string, template: any): ArticleSection[] {
  return [
    {
      heading: `Emergency: ${guideName}`,
      content: `**This is an emergency situation. Act immediately.**

When disaster strikes, the first few hours are critical. This guide provides step-by-step actions to protect your safety, document damage, and begin recovery. For life-threatening situations, call 000 immediately.

**NRPG provides 24/7 emergency response across Australia:**
- Emergency phone: Contact us
- Average response time: **42 minutes**
- Qualified professionals
- Emergency response fee: **$2,750** (includes assessment and make-safe work)`,
      wordCount: 180,
      order: 1,
      includeInToC: false,
      schemaType: 'Text'
    },
    {
      heading: `Immediate Actions (Right Now)`,
      content: `Act immediately with these critical steps:

**Priority List (In This Order):**
${template.immediateActions.map((action: string, i: number) => `${i + 1}. ${action}`).join('\n')}

**Safety First**: Never put yourself at risk. If you're in danger, leave immediately and call 000. Property can be replaced; your life cannot.

**Document Everything**: Take photos and videos from a safe location. This documentation is essential for insurance claims.`,
      wordCount: 250,
      order: 2,
      includeInToC: true,
      schemaType: 'HowToStep'
    },
    {
      heading: `First 24 Hours`,
      content: `Within the first day, take these important steps:

**Your Action Checklist:**
${template.first24.map((action: string, i: number) => `☐ ${action}`).join('\n')}

**Insurance Claim**: Call your insurance company within 24 hours to report the claim. Have your policy number ready. Provide photos and descriptions of damage.

**Professional Assessment**: Contact NRPG for professional damage assessment. We'll document everything needed for your insurance claim and provide detailed cost estimates.

**Temporary Solutions**: Secure your property temporarily (tarps, boarding, pumping) to prevent further damage while awaiting professional restoration.`,
      wordCount: 240,
      order: 3,
      includeInToC: true,
      schemaType: 'HowToStep'
    },
    {
      heading: `What NOT to Do`,
      content: `Avoid these mistakes that worsen damage or create safety hazards:

**Critical DON'Ts:**
${template.whatNotToDo.map((action: string) => `❌ ${action}`).join('\n')}

**Why This Matters**: Attempting DIY cleanup, ignoring professional assessment, or unsafe actions can:
- Create additional damage
- Violate insurance requirements
- Cause health hazards
- Lead to injuries or liability
- Delay insurance claim processing

Let professionals handle the recovery.`,
      wordCount: 200,
      order: 4,
      includeInToC: true,
      schemaType: 'Text'
    },
    {
      heading: `Getting Professional Help`,
      content: `Professional restoration is essential for complete, safe recovery.

**NRPG Professional Response Includes:**
- 24/7 immediate availability
- Qualified professionals at every callout
- Rapid damage assessment (average 42-minute response)
- Professional documentation for insurance
- Make-safe work (emergency stabilisation)
- Complete restoration coordination
- Direct insurance billing (most cases)

**What to Expect**:
1. **Initial Assessment** (30-60 minutes)
   - Damage evaluation
   - Photos and documentation
   - Preliminary cost estimate
   - Insurance coverage review

2. **Work Authorization**
   - Detailed work plan
   - Timeline and milestones
   - Final cost estimate
   - Insurance coordination

3. **Restoration**
   - Professional teams deploy equipment
   - Daily progress updates
   - Regular monitoring and verification
   - Final inspection and handover

**Call NRPG: **
- Available 24/7
- Immediate response dispatch
- Free consultation
- Transparent pricing`,
      wordCount: 280,
      order: 5,
      includeInToC: true,
      schemaType: 'Text'
    },
    {
      heading: `Insurance & Documentation`,
      content: `Proper documentation is critical for insurance claims.

**Document Everything**:
- **Photos**: Take from multiple angles, wide shots and close-ups
- **Video**: Walk-through video showing all damage
- **List**: Itemise all damaged items with approximate values
- **Receipts**: Keep receipts for emergency repairs
- **Communications**: Save emails and note conversation times with insurers
- **Professionals**: Keep contractor quotes and reports

**Insurance Claim Process**:
1. Call insurer within 24 hours
2. Provide policy number and claim description
3. Request adjuster appointment
4. Have documentation ready
5. Get written estimate from restoration contractor
6. Submit for approval
7. Proceed with restoration
8. Maintain communication with adjuster

**Coverage Questions**:
- Is this damage covered by my policy?
- What's my deductible?
- Are additional services covered?
- Is there a timeline for coverage?
- What documentation do they need?

NRPG coordinates directly with insurers and handles documentation on your behalf.`,
      wordCount: 280,
      order: 6,
      includeInToC: true,
      schemaType: 'Text'
    },
    {
      heading: `Recovery & Prevention`,
      content: `After immediate recovery, focus on prevention and resilience.

**Post-Disaster**:
- Monitor for secondary issues (mould, structural problems)
- Follow all contractor recommendations
- Keep restoration warranty documentation
- Schedule follow-up inspections
- Update your insurance annually

**Prevention for Future Incidents**:
- Install leak detectors and monitors
- Maintain gutters and drainage
- Inspect plumbing regularly
- Clear vegetation near structures
- Secure outdoor items
- Keep emergency supplies ready
- Have contractor contacts saved
- Review insurance coverage annually

**Building Resilience**:
- Make home improvements that reduce risk
- Consider additional insurance coverage
- Create an emergency plan with family
- Maintain professional contractor relationships
- Stay informed about local disaster risks`,
      wordCount: 200,
      order: 7,
      includeInToC: true,
      schemaType: 'Text'
    },
    {
      heading: `Key Takeaways`,
      content: `**Remember These Critical Points:**

1. **Act Immediately**: The first 24 hours are critical
2. **Prioritize Safety**: Never put yourself at risk
3. **Document Everything**: Photos for insurance
4. **Call Professionals**: NRPG 
5. **Notify Insurance**: Within 24 hours
6. **Avoid DIY**: Professional restoration is essential
7. **Follow Guidance**: Trust qualified professionals

**NRPG Is Ready To Help**:
- 24/7 emergency response
- Qualified professionals
- Transparent pricing ($2,750 emergency fee)
- Insurance coordination
- Complete restoration

Don't face disaster alone. Let Australia's largest network of certified restoration professionals guide your recovery.`,
      wordCount: 180,
      order: 8,
      includeInToC: true,
      schemaType: 'Text'
    }
  ];
}

/**
 * Generate emergency guide FAQs
 */
function generateEmergencyFAQs(guideName: string): FAQItem[] {
  const commonFAQs: FAQItem[] = [
    {
      question: "Should I evacuate my home?",
      answer: "If there's any danger (active fire, rising water, structural hazard, downed power lines), evacuate immediately and don't return until professional clearance. Safety always comes first."
    },
    {
      question: "When should I call professionals?",
      answer: "Immediately. NRPG provides 24/7 emergency response. Professional assessment within the first 24 hours prevents additional damage and is essential for insurance claims."
    },
    {
      question: "How much will emergency response cost?",
      answer: "NRPG's emergency response fee is $2,750 (including GST) and includes immediate response, professional assessment, and make-safe work. Insurance typically covers this cost."
    },
    {
      question: "What documents should I save?",
      answer: "Keep insurance policy, photos/videos of damage, receipts for emergency repairs, contractor estimates, adjuster communications, and your list of damaged items. These are essential for insurance claims."
    },
    {
      question: "Can I attempt cleanup myself?",
      answer: "Only minor cleanup if it's safe. Professional cleanup is required for contamination, water extraction, mould, or structural issues. DIY attempts often violate insurance requirements and create health hazards."
    }
  ];

  return commonFAQs;
}

/**
 * Generate emergency guide internal links
 */
function generateEmergencyLinks(guideName: string) {
  return [
    {
      text: 'Full Service Guides',
      url: '/resources',
      position: 'footer' as const,
      keyword: 'disaster recovery guides'
    },
    {
      text: 'Industry Professional Standards',
      url: '/certifications',
      position: 'footer' as const,
      keyword: 'professional standards'
    },
    {
      text: 'Emergency Response',
      url: '/claim/step-1',
      position: 'footer' as const,
      keyword: 'emergency response'
    },
    {
      text: '24/7 Support',
      url: '/pricing',
      position: 'footer' as const,
      keyword: 'emergency services'
    }
  ];
}
