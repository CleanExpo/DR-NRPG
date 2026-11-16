// @ts-nocheck

/**
 * Service Pillar Template
 * 2500-word authoritative guide for core disaster recovery services
 * Targets: Water Damage, Fire & Smoke, Mould, Storm, Sewage, Biohazard
 */

import { GeneratedArticle, TemplateInput, ArticleSection, FAQItem, SEOMetadata } from './types';

const SERVICE_PILLAR_STRUCTURE = {
  HERO_SECTION: { wordCount: 200, order: 1 },
  DEFINITION: { wordCount: 300, order: 2 },
  WHEN_NEEDED: { wordCount: 250, order: 3 },
  IICRC_PROCESS: { wordCount: 500, order: 4 },
  COST_INSURANCE: { wordCount: 400, order: 5 },
  CHOOSING_CONTRACTOR: { wordCount: 300, order: 6 },
  PREVENTION_TIPS: { wordCount: 250, order: 7 },
  WHY_CHOOSE_NRPG: { wordCount: 200, order: 8 },
  FAQ_SECTION: { wordCount: 200, order: 9 },
  CLOSING: { wordCount: 150, order: 10 },
};

const FAQ_TEMPLATES: Record<string, FAQItem[]> = {
  'Water Damage': [
    {
      question: "How quickly should I act after water damage?",
      answer: "Immediately. Call a professional restoration team within the first 24-48 hours. Swift action prevents mould growth and structural damage. NRPG offers 24/7 emergency response with an average response time of 42 minutes across Australian capitals."
    },
    {
      question: "Will insurance cover water damage restoration?",
      answer: "Most standard home and contents insurance policies cover sudden water damage from burst pipes or storms. However, damage from poor maintenance, gradual leaks, or flooding may not be covered. We help navigate insurance claims with professional documentation and direct billing options."
    },
    {
      question: "How long does water damage restoration take?",
      answer: "Timeline depends on damage extent. Minor water damage takes 3-7 days. Moderate damage: 7-14 days. Severe damage: 4-8 weeks. We provide detailed timelines after initial assessment. Qualified teams follow industry standards for drying, cleaning, and restoration."
    },
    {
      question: "What does water damage restoration cost?",
      answer: "Our emergency response fee is $2,750 (including GST) for immediate assessment, extraction, and make-safe work. Additional services (drying, cleaning, repairs) are quoted based on damage scope. Most insurance claims cover 90%+ of costs."
    },
    {
      question: "Can water-damaged items be saved?",
      answer: "Many items can be restored depending on water type and exposure duration. Clean water (burst pipes) has better recovery rates than grey water (appliances) or black water (sewage). Our restoration team specialises in content recovery including documents, furniture, and electronics."
    }
  ],
  'Fire & Smoke': [
    {
      question: "Is my home safe after a fire?",
      answer: "Never re-enter a fire-damaged property without professional assessment. Structural integrity, smoke damage, and hazardous materials must be evaluated by certified professionals. NRPG provides comprehensive safety assessments as part of emergency response."
    },
    {
      question: "How do professionals remove smoke smell?",
      answer: "Smoke odour requires multi-stage treatment: air circulation, thermal fogging to neutralise odours, ozone treatment (when safe), and deep cleaning of surfaces, HVAC systems, and ductwork. Qualified teams follow proven protocols for complete odour elimination."
    },
    {
      question: "What's the difference between fire restoration and cleanup?",
      answer: "Cleanup removes debris. Restoration includes damage assessment, structural repairs, smoke treatment, content restoration, and rebuild to pre-loss condition. Full restoration is covered by insurance and ensures your home is truly restored, not just cleaned."
    },
    {
      question: "How long until I can return home?",
      answer: "For minor fire damage: 2-4 weeks. Moderate: 4-12 weeks. Severe: 3-6 months depending on structural damage. We coordinate with insurance and provide temporary accommodation solutions. Safety assessments determine when areas become habitable."
    },
    {
      question: "Are soot and ash hazardous?",
      answer: "Yes. Fire byproducts contain potentially hazardous particles and chemicals. Professional cleaning prevents respiratory issues and contamination spread. We use HEPA filtration, negative pressure systems, and certified cleaning protocols."
    }
  ],
  'Mould': [
    {
      question: "How do I know if I have mould?",
      answer: "Signs include: musty odours, visible growth (black, green, or white spots), water stains, peeling paint, or respiratory symptoms. Professional mould inspection identifies hidden growth behind walls. Early detection prevents health issues and structural damage."
    },
    {
      question: "Is all mould dangerous?",
      answer: "All mould can trigger allergies and respiratory issues, especially in children, elderly, and immunocompromised individuals. Some species produce toxins. Professional remediation removes all mould and treats the underlying moisture problem to prevent recurrence."
    },
    {
      question: "How does mould remediation differ from cleaning?",
      answer: "Cleaning removes visible mould. Remediation includes moisture control, containment, complete removal, HEPA filtration, and verification testing. Only professional remediation addresses root causes and prevents mould return."
    },
    {
      question: "How much does mould remediation cost?",
      answer: "Small areas: $500-$1,500. Medium: $1,500-$3,000. Large/structural: $3,000+. Costs depend on extent and complexity. Many insurance policies cover mould remediation if caused by covered perils (water damage, storm)."
    },
    {
      question: "How do I prevent mould?",
      answer: "Maintain humidity 30-50% using dehumidifiers. Fix leaks immediately. Ensure adequate ventilation in bathrooms and kitchens. Use exhaust fans. Insulate cold surfaces. Regular inspections catch moisture problems early before mould develops."
    }
  ],
  'Storm': [
    {
      question: "What should I do immediately after a storm?",
      answer: "1) Ensure safety (downed power lines, structural damage). 2) Document damage with photos/video. 3) Make temporary repairs to prevent further damage. 4) Contact your insurance company and a professional restoration team like NRPG for assessment."
    },
    {
      question: "How quickly do professional storm assessments happen?",
      answer: "NRPG prioritises rapid response across all service areas. Weather conditions may delay assessment, but requests are triaged based on safety risk. Comprehensive assessments guide repair planning and insurance claims."
    },
    {
      question: "Does insurance cover storm damage?",
      answer: "Most policies cover storm damage (hail, wind, lightning, falling trees). Deductibles typically apply. Professional documentation improves claim approval. We provide detailed damage reports, before/after photos, and cost estimates for insurance submission."
    },
    {
      question: "What repairs are covered under storm damage?",
      answer: "Sudden, direct damage from storms (roof damage, broken windows, water damage from wind-driven rain) is typically covered. Preventable damage from poor maintenance or lack of weatherproofing may not be covered. We advise on coverage specifics for your situation."
    },
    {
      question: "How do I prevent storm damage?",
      answer: "Maintain roof integrity. Trim tree branches near structures. Secure outdoor items. Install impact-resistant windows in high-risk areas. Check gutters and drainage. Regular maintenance reduces vulnerability. We recommend annual pre-storm inspections for properties in storm-prone regions."
    }
  ],
  'Sewage': [
    {
      question: "Is sewage backup coverage included in standard insurance?",
      answer: "Sewage backup is often excluded from standard policies. You may need a separate endorsement (\"sewer backup rider\"). Professional sewage cleanup is expensive ($5,000-$30,000+) depending on extent. We advise checking your policy and considering additional coverage."
    },
    {
      question: "What are the health risks of sewage exposure?",
      answer: "Exposure risks include bacterial infections (E. coli, hepatitis A), viral illnesses, and parasites. Professional cleanup requires hazmat-level protocols, specialized equipment, and certified technicians. Never attempt DIY sewage cleanup."
    },
    {
      question: "How is sewage cleanup different from standard cleaning?",
      answer: "Sewage cleanup requires containment, hazmat protocols, complete removal of contaminated materials, professional disinfection, and often structural repairs. Standard cleaners cannot handle biohazard contamination. Only certified teams should perform this work."
    },
    {
      question: "How long does sewage remediation take?",
      answer: "Minor backups: 3-5 days. Moderate damage: 5-14 days. Severe contamination: 2-4 weeks. Timeline depends on affected area, materials affected, and structural damage. We provide detailed timelines and coordinate with insurance adjusters."
    },
    {
      question: "What preventive measures reduce sewage backup risk?",
      answer: "Regular drain maintenance, avoid flushing non-toilet items, inspect pipes for tree root intrusion, install backwater valves, maintain septic systems, and ensure proper grading away from structures. These measures significantly reduce backup risk."
    }
  ],
  'Biohazard': [
    {
      question: "What qualifies as biohazard cleanup?",
      answer: "Biohazard cleanup includes bodily fluids, blood, medical waste, and other potentially infectious materials. This includes crime scenes, unattended deaths, accidents, and medical emergencies. Only certified biohazard specialists should handle cleanup."
    },
    {
      question: "Is biohazard cleanup covered by insurance?",
      answer: "Homeowners insurance typically doesn't cover biohazard cleanup. Specialised crime scene cleanup insurance may be available. Many families access support through victim assistance programs. We provide transparent pricing and work with families during difficult times."
    },
    {
      question: "Why can't family members do the cleanup?",
      answer: "Family members face health risks from bloodborne pathogens, emotional trauma, and potential legal issues regarding infectious material disposal. Professional teams use OSHA-compliant protocols, proper equipment, and safe disposal methods. Let professionals handle this difficult work."
    },
    {
      question: "How quickly can biohazard cleanup be performed?",
      answer: "We respond 24/7 and can often begin cleanup within hours. Quick response protects other family members, prevents emotional strain from delayed cleanup, and reduces biohazard risk. Our team handles the entire process with sensitivity and professionalism."
    },
    {
      question: "How is the property made safe after biohazard cleanup?",
      answer: "Beyond visible cleanup, we perform disinfection, deodorisation, and verify safety through professional-grade testing. We work within local regulations regarding medical waste disposal. Our goal is returning the space to safe, habitable condition."
    }
  ]
};

const PRICING_TEMPLATES: Record<string, string> = {
  'Water Damage': `
## Emergency Response & Pricing

Our **emergency response fee is $2,750 (including GST)** and includes:
- Immediate 24/7 response (average 42 minutes)
- Professional damage assessment
- Water extraction and removal
- Initial drying and stabilisation
- Insurance documentation (before/after photos, timeline)
- Direct billing available

**Additional services** beyond the emergency response:
- Water extraction and equipment drying: $800–$3,500
- Professional drying system setup: $500–$2,000/day
- Dehumidification and air circulation: $300–$1,000
- Content restoration and cleaning: $500–$3,000+
- Structural repairs and rebuild: Quote based on assessment

We accept direct insurance billing. For uninsured damage, payment plans are available.
  `,
  'Fire & Smoke': `
## Emergency Response & Pricing

Our **emergency response fee is $2,750 (including GST)** and includes:
- Immediate response and safety assessment
- Damage documentation for insurance
- Make-safe work and hazard mitigation
- Initial debris removal

**Restoration services** (quoted separately based on assessment):
- Structural assessment and repairs: $1,200–$1,800
- Fire damage restoration: $2,000–$8,000
- Smoke damage treatment: $1,500–$4,000
- Content restoration: $500–$5,000+
- HVAC and ductwork cleaning: $1,000–$3,000

Insurance coverage typically includes all restoration work. We manage the claim process and provide direct billing.
  `,
  'Mould': `
## Assessment & Remediation Pricing

Professional mould inspection: $300–$500
Remediation costs vary significantly:
- Small areas (< 10 sq m): $500–$1,500
- Medium areas (10-100 sq m): $1,500–$3,000
- Large/structural mould: $3,000–$10,000+

**Included in remediation**:
- Containment and moisture control
- Complete removal of all mould
- HEPA air filtration
- Disinfection and treatment
- Verification testing
- Prevention recommendations

When caused by covered water damage, insurance may cover remediation. We handle documentation and claims.
  `,
  'Storm': `
## Assessment & Repair Pricing

Emergency response and assessment: Included with initial call
Repair costs depend entirely on damage extent:
- Minor damage (windows, gutters): $500–$2,000
- Moderate damage (partial roof): $3,000–$10,000
- Severe structural damage: $10,000–$50,000+

**Our role**:
- Professional damage assessment
- Insurance documentation and claims support
- Coordination with approved repair contractors
- Oversight of restoration work
- Completion verification

Most storm damage is covered by insurance with deductible application.
  `,
  'Sewage': `
## Remediation Pricing (Sewage Backup)

Sewage cleanup is complex and hazardous. Costs typically range:
- Minor backup (bathroom/fixture): $3,000–$8,000
- Moderate backup (basement/multiple areas): $8,000–$15,000
- Severe/structural contamination: $15,000–$30,000+

**Included**:
- Hazmat-level containment and safety
- Complete removal of contaminated materials
- Professional disinfection and biohazard treatment
- Structural drying and assessment
- Preventive system upgrades

Many areas offer sewer backup insurance endorsements. Check your policy and consider coverage given the potential costs.
  `,
  'Biohazard': `
## Biohazard Cleanup Pricing

Biohazard cleanup pricing depends on affected area and contamination level:
- Single room: $1,500–$3,500
- Multiple areas: $3,500–$7,000
- Extensive contamination: $7,000–$15,000+

**Included in service**:
- 24/7 immediate response
- Sensitive, professional handling
- Complete biohazard removal and disinfection
- Proper waste disposal per regulations
- Deodorisation
- Final verification of safety

We work compassionately with families during difficult times. Pricing is transparent with no hidden costs.
  `
};

/**
 * Generate a service pillar article
 */
export function generateServicePillar(input: TemplateInput): GeneratedArticle {
  const serviceName = input.serviceName || 'Disaster Recovery Service';
  const authorName = input.authorName || 'Phil McGurk';
  const authorCredentials = input.authorCredentials || [
    '15+ years disaster recovery experience',
    'Founder of NRPG network (500+ contractors)'
  ];

  // Generate slug from service name
  const slug = serviceName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  // Determine primary keyword
  const primaryKeyword = input.primaryKeyword || `${serviceName.toLowerCase()} restoration australia`;
  const secondaryKeywords = [
    `${serviceName.toLowerCase()} specialists`,
    `professional ${serviceName.toLowerCase()}`,
    `${serviceName.toLowerCase()} 24/7`,
    `insurance approved ${serviceName.toLowerCase()}`
  ];

  // Generate sections
  const sections: ArticleSection[] = generateSections(serviceName, input.includePricing || true);

  // Generate FAQs based on service
  const faqs = FAQ_TEMPLATES[serviceName] || FAQ_TEMPLATES['Water Damage'];

  // Generate SEO metadata
  const seo: SEOMetadata = {
    title: `${serviceName} Restoration Guide | NRPG`,
    metaDescription: `Professional ${serviceName.toLowerCase()} restoration across Australia. 24/7 emergency response. $2,750 emergency fee. Insurance approved.`,
    keywords: [primaryKeyword, ...secondaryKeywords],
    primaryKeyword,
    secondaryKeywords,
    slug: `/resources/${slug}`,
    internalLinks: generateInternalLinks(serviceName),
    schema: {
      type: 'Article',
      author: {
        name: authorName,
        credentials: authorCredentials
      }
    }
  };

  // Combine sections into content
  const content = sections.map(s => `${s.content}`).join('\n\n');
  const totalWordCount = sections.reduce((sum, s) => sum + s.wordCount, 0) + faqs.length * 40;
  const estimatedReadTime = Math.ceil(totalWordCount / 200); // Average 200 words per minute

  return {
    title: seo.title,
    slug: seo.slug,
    templateType: 'service-pillar',
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
 * Generate article sections with structured content
 */
function generateSections(serviceName: string, includePricing: boolean): ArticleSection[] {
  const sections: ArticleSection[] = [
    {
      heading: `${serviceName} Restoration: Complete Guide to Professional Recovery`,
      content: `When disaster strikes, every minute counts. Water damage, fire, mould, storms, sewage, or biohazards can devastate your home and endanger your family. This comprehensive guide explains ${serviceName.toLowerCase()} restoration, the industry process standards, costs, and how to choose the right certified contractor.

NRPG (National Restoration Professionals Group) represents 500+ qualified contractors across Australia. We provide 24/7 emergency response with an average 42-minute arrival time. Our $2,750 emergency response fee includes immediate damage assessment and make-safe work. We accept direct insurance billing and work with your insurer to ensure complete restoration.`,
      wordCount: 200,
      order: 1,
      includeInToC: false,
      schemaType: 'Text'
    },
    {
      heading: `What is ${serviceName}?`,
      content: `${serviceName} is the professional process of restoring properties damaged by disaster. Unlike simple cleanup, professional restoration addresses:

- Moisture removal and structural drying
- Complete contamination elimination
- Structural damage assessment and repair
- Content restoration and preservation
- Health and safety compliance
- Insurance documentation and claims support

The key differentiator: **restoration makes properties safe and habitable again**, not just visibly clean. Recognised industry standards set out how this work should be done.`,
      wordCount: 300,
      order: 2,
      includeInToC: true,
      schemaType: 'Text'
    },
    {
      heading: `When Do You Need Professional ${serviceName}?`,
      content: `Act immediately if you experience:
- Standing water or water intrusion
- Smoke damage or fire involvement
- Visible mould or musty odours
- Storm damage to roof, walls, or foundation
- Sewage or biohazard contamination
- Health concerns from contamination

**The first 48 hours are critical.** Delays allow:
- Mould growth (starts within 24-48 hours)
- Structural damage from moisture
- Health risks from contamination
- Higher overall remediation costs

Professional assessment determines:
- Damage extent and affected materials
- Restoration timeline
- Insurance coverage and deductibles
- Cost estimates
- Preventive measures for future incidents`,
      wordCount: 250,
      order: 3,
      includeInToC: true,
      schemaType: 'Text'
    },
    {
      heading: `Professional Process Standards`,
      content: `Qualified professionals follow industry-best practices. The four-step restoration process:

**Step 1: Assessment & Documentation**
- Determine damage extent and affected materials
- Test moisture levels and contamination
- Document with photos, measurements, and reports
- Develop detailed restoration plan
- Identify insurance coverage and deductibles

**Step 2: Removal & Extraction**
- Remove water, debris, or contaminated materials
- Extract moisture using commercial equipment
- Protect undamaged contents
- Prevent further damage and contamination spread

**Step 3: Drying & Cleaning**
- Deploy drying systems (dehumidifiers, air movers, HEPA filtration)
- Clean surfaces and contents
- Monitor moisture levels continuously
- Treat for mould, odour, and contamination
- Verify effectiveness through testing

**Step 4: Restoration & Rebuild**
- Repair structural damage (drywall, flooring, fixtures)
- Restore contents where possible
- Paint, refinish, and complete cosmetic work
- Final inspection and verification
- Hand over to occupants`,
      wordCount: 500,
      order: 4,
      includeInToC: true,
      schemaType: 'HowToStep'
    }
  ];

  // Add pricing section if requested
  if (includePricing) {
    sections.push({
      heading: `Cost & Insurance for ${serviceName}`,
      content: PRICING_TEMPLATES[serviceName] || `
Emergency response fee: $2,750 (including GST)
Additional services quoted separately based on damage assessment.
Insurance typically covers 90%+ of restoration costs for covered perils.
Direct billing available. Payment plans for uninsured damage.`,
      wordCount: 400,
      order: 5,
      includeInToC: true,
      schemaType: 'Text'
    });
  }

  sections.push(
    {
      heading: `How to Choose a Qualified Contractor`,
      content: `Not all restoration companies are equal. Here's how to evaluate contractors:

**Verify Certifications**
- Ask for credentials for relevant specialisations
- Verify current certifications (not expired)
- Confirm continuing professional development (CPD) hours

**Ask About Experience**
- How many jobs in your specific damage type?
- How many qualified technicians on staff?
- What's their average response time?
- Can they provide references?

**Understand Their Process**
- Do they follow industry standards?
- Do they document with photos and reports?
- How do they handle insurance coordination?
- What equipment and technology do they use?

**Review Insurance Relationships**
- Are they approved by major Australian insurers?
- Do they accept direct insurance billing?
- Can they handle complex claims?
- What's their insurance approval rate?

**NRPG Advantage**: All our contractors are qualified with verified credentials. We provide 24/7 response, transparent pricing, and work directly with insurers. Our network represents 500+ of Australia's most qualified restoration professionals.`,
      wordCount: 300,
      order: 6,
      includeInToC: true,
      schemaType: 'Text'
    },
    {
      heading: `Prevention Tips to Reduce Risk`,
      content: `While you can't prevent all disasters, these steps significantly reduce risk and damage:

**Water Damage Prevention**
- Inspect pipes and connections quarterly
- Address leaks immediately (don't delay)
- Ensure gutters and downpipes drain away from foundation
- Install water leak detectors near appliances
- Maintain proper grading around property perimeter
- Consider backwater valves in flood-prone areas

**Fire Safety & Prevention**
- Install working smoke detectors (test monthly)
- Keep fire extinguishers accessible
- Clear vegetation near structures
- Maintain roof and gutters free of debris
- Have electrical systems regularly inspected
- Create defensible space around property

**Mould Prevention**
- Maintain humidity 30-50% using dehumidifiers
- Fix leaks within 24 hours
- Ensure bathroom and kitchen ventilation
- Use exhaust fans during showers and cooking
- Insulate cold surfaces to prevent condensation
- Regular property inspections catch moisture early

**General Preparedness**
- Know your insurance coverage (read your policy)
- Keep photos/video of property contents
- Store important documents securely
- Have contractor phone numbers readily available
- Develop a family emergency plan
- Consider additional coverage (sewer backup, flood)`,
      wordCount: 250,
      order: 7,
      includeInToC: true,
      schemaType: 'Text'
    },
    {
      heading: `Why Choose NRPG for ${serviceName}`,
      content: `NRPG represents Australia's largest network of qualified restoration professionals. Here's why contractors and customers choose us:

**Professional Standards**
- Every contractor verified (multiple credentials)
- Standardised digital documentation
- Quality assurance and customer satisfaction focus
- Insurance partnerships and approvals

**24/7 Emergency Response**
- Average 42-minute response across Australian capitals
- Certified professionals at every callout
- Make-safe work included in emergency response
- Transparent pricing ($2,750 emergency fee)

**Insurance-Friendly**
- Professional documentation for stronger claim outcomes
- Direct billing with major Australian insurers
- Professional documentation for claims
- Claims coordination and follow-up

**Customer Support**
- Free consultation and damage assessment
- Transparent cost estimates (no surprises)
- Payment plans for uninsured damage
- Commitment to customer satisfaction

**Industry Leadership**
- Publish quarterly industry research reports
- Educate professionals through training hub
- Support recognised certification standards
- Advocate for industry best practices`,
      wordCount: 200,
      order: 8,
      includeInToC: true,
      schemaType: 'Text'
    },
    {
      heading: `Frequently Asked Questions`,
      content: `Common questions about ${serviceName} answered by our qualified professionals.`,
      wordCount: 100,
      order: 9,
      includeInToC: true,
      schemaType: 'FAQ'
    },
    {
      heading: `Get Professional Help Today`,
      content: `Don't wait for damage to worsen. Contact NRPG for immediate professional assessment and restoration.

**24/7 Emergency Response**: Contact us for service
**Emergency Fee**: $2,750 (includes immediate response, assessment, and make-safe work)
**Average Response Time**: 42 minutes across Australian capitals
**Insurance Approved**: Direct billing with major Australian insurers

Let Australia's largest network of qualified professionals restore your property to pre-loss condition.`,
      wordCount: 150,
      order: 10,
      includeInToC: false,
      schemaType: 'Text'
    }
  );

  return sections;
}

/**
 * Generate contextual internal links
 */
function generateInternalLinks(serviceName: string) {
  const baseLinks = [
    {
      text: 'Training & Certifications',
      url: '/training',
      position: 'footer' as const,
      keyword: 'restoration certification'
    },
    {
      text: 'Our Pricing & Services',
      url: '/pricing',
      position: 'footer' as const,
      keyword: 'professional restoration pricing'
    },
    {
      text: 'Insurance Partnerships',
      url: '/certifications',
      position: 'footer' as const,
      keyword: 'insurance approved contractors'
    },
    {
      text: 'Emergency Response',
      url: '/claim/step-1',
      position: 'footer' as const,
      keyword: '24/7 emergency response'
    }
  ];

  // Add service-specific links
  const serviceLinks: Record<string, any[]> = {
    'Water Damage': [
      {
        text: 'Water Damage Prevention Guide',
        url: '/resources/water-damage-prevention',
        position: 'inline' as const,
        keyword: 'water damage prevention'
      },
      {
        text: 'Flood Damage Guide',
        url: '/resources/flood-damage-recovery',
        position: 'inline' as const,
        keyword: 'flood damage'
      }
    ],
    'Fire & Smoke': [
      {
        text: 'Fire Safety Prevention',
        url: '/resources/fire-safety-prevention',
        position: 'inline' as const,
        keyword: 'fire prevention'
      },
      {
        text: 'Smoke Damage Removal',
        url: '/resources/smoke-damage-removal',
        position: 'inline' as const,
        keyword: 'smoke damage'
      }
    ],
    'Mould': [
      {
        text: 'Mould Prevention Tips',
        url: '/resources/mould-prevention',
        position: 'inline' as const,
        keyword: 'mould prevention'
      },
      {
        text: 'Health Risks of Mould',
        url: '/resources/mould-health-risks',
        position: 'inline' as const,
        keyword: 'mould health'
      }
    ]
  };

  return [...baseLinks, ...(serviceLinks[serviceName] || [])];
}
