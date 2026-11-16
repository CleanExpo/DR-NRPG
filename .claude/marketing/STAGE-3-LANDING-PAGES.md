# Stage 3: Insurer-Specific Landing Pages

> Marketing Content for 7 Major Australian Insurers
> Status: Template Specifications Ready for Development
> Created: 2026-01-09
> Format: Next.js Page Components + Sanity Content Blocks

---

## Overview & SEO Strategy

### Purpose
Create targeted landing pages for each major insurer showing:
- Why NRPG contractors are approved/preferred by that insurer
- Insurer-specific documentation requirements
- Average claim processing times
- Customer testimonials (insurer-specific)
- Call-to-action for contractor matching

### SEO Keywords by Insurer

| Insurer | Primary Keyword | Secondary Keywords |
|---------|-----------------|-------------------|
| NRMA | "NRMA approved restorers" | "NRMA restoration contractors near me", "NRMA claim process" |
| Suncorp | "Suncorp preferred contractors" | "Suncorp restoration services", "Suncorp approved builders" |
| Allianz | "Allianz restoration network" | "Allianz approved contractors", "Allianz disaster recovery" |
| QBE | "QBE disaster recovery partners" | "QBE approved restorers", "QBE claim process" |
| IAG | "IAG restoration contractors" | "IAG approved builders", "IAG claim support" |
| CGU | "CGU emergency response" | "CGU approved contractors", "CGU claim process" |
| Medibank | "Medibank property services" | "Medibank approved restorers", "Medibank claim support" |

---

## Landing Page Template Structure

### Page URL Structure
```
/insurance/[insurer-slug]-[service-descriptor]

Examples:
- /insurance/nrma-approved-contractors
- /insurance/suncorp-preferred-restorers
- /insurance/allianz-restoration-network
- /insurance/qbe-disaster-recovery-partners
- /insurance/iag-restoration-contractors
- /insurance/cgu-emergency-response
- /insurance/medibank-property-services
```

### Page Components (Consistent Across All 7 Pages)

```
1. Hero Section
   - Insurer logo (prominent)
   - Value proposition headline
   - Call-to-action button
   - Hero image (insurer-branded)

2. Trust & Credibility Section
   - "Why [Insurer] trusts NRPG contractors"
   - 3-4 key points (insurer-specific benefits)
   - Verification badge/checkbox marks

3. Insurer-Specific Documentation Section
   - "What [Insurer] Requires for Claims"
   - Photo requirements (insurer-specific numbers)
   - Quote format requirements
   - Inspection/assessment needs
   - Processing timeline

4. Process Overview Section
   - Step-by-step claim process
   - NRPG contractor role explanation
   - Average timeframes
   - Communication protocol

5. Testimonials Section
   - 3-4 customer reviews (from [Insurer] claimants)
   - Photo of customer (if available)
   - Result/outcome (e.g., "Claim approved in 6 weeks")
   - Star rating

6. FAQ Section
   - 6-8 questions specific to insurer
   - Collapsible answers
   - Links to relevant guides

7. Contractor Showcase
   - Featured contractors approved for [Insurer]
   - Contractor badges/certifications
   - Star ratings
   - Number of [Insurer] claims completed

8. Call-to-Action Section
   - "Get Matched with [Insurer]-Approved Contractors"
   - CTA button → contractor matching flow
   - Secondary CTA: "Learn More About Our Process"

9. Footer Links
   - Related insurance guides
   - Other insurer pages
   - Support contact
```

---

## LANDING PAGE 1: NRMA Approved Contractors

### Metadata
- **URL**: `/insurance/nrma-approved-contractors`
- **Page Title**: "NRMA Approved Restoration Contractors | NRPG"
- **Meta Description**: "Find NRMA-approved disaster recovery contractors. Streamlined claim process, expert restoration, nationwide coverage."
- **Primary Keyword**: "NRMA approved restorers"
- **Target Audience**: NRMA policyholders needing disaster recovery services

### Page Content

#### Hero Section
```
Headline:
"NRMA-Approved Restoration Contractors
Get Your Claim Processed Faster"

Subheading:
"Expert contractors vetted and approved by NRMA.
Streamlined claims process. Professional restoration.
Nationwide coverage."

CTA Button: "Get Matched with NRMA Contractor"
```

#### Trust & Credibility
```
Why NRMA Trusts NRPG Contractors

✓ 100% NRMA-Verified Network
  Our contractors meet NRMA's strict qualification standards

✓ Faster Claim Processing
  Direct communication with NRMA claims team
  Pre-approved scope of work
  Average processing time: 6-8 weeks

✓ Professional Documentation
  NRMA-compliant reports and quotes
  Photo documentation per NRMA requirements (2+ per area)
  Detailed scope of work specifications

✓ Dedicated Claims Support
  We handle communication with NRMA
  You focus on restoration
  Updates every 20 days (Code of Practice compliant)
```

#### NRMA-Specific Documentation Requirements
```
What NRMA Requires for Insurance Claims

Photography Requirements:
• Minimum 2 photos per damage area
• Close-up detail shots (show damage clearly)
• Wide-angle context shots (show extent)
• Date-stamped photos (phone camera ideal)

Quote Requirements:
• Itemized breakdown of costs
• Materials and labour clearly separated
• Licensed tradesperson/builder details
• Quote validity: 30 days minimum

Assessment & Inspection:
• NRMA may arrange independent inspector
• Contractor cooperation required
• Inspection typically within 10-14 days of claim
• Scope of work confirmation needed

Documentation Timeline:
• Photos submitted: Day 3-5 after incident
• Quotes submitted: Day 5-10 after incident
• NRMA assessment: 2-4 weeks after documentation
• Repair approval: 4-6 weeks from claim lodgement

Processing Average:
Initial claim acknowledgment: 3 business days
Initial response: 10 business days
Claim decision: 4-6 weeks (water damage)
Payment processing: 7-10 days after approval
```

#### NRMA-Specific FAQ
```
1. How do NRMA-approved contractors speed up my claim?
   Answer: Direct communication with NRMA claims team,
   pre-approved quotes, and familiar process reduces delays
   by 30-40% vs. independent contractors.

2. Do NRMA contractors cost more?
   Answer: No. NRMA approval doesn't affect pricing.
   You get same professional service at standard market rates.

3. What if NRMA rejects my claim?
   Answer: We help you understand the reason and explore
   options. Can escalate to AFCA if claim handling unfair.

4. Can I choose my own contractor?
   Answer: Yes. But NRMA-approved contractors streamline
   the process. Your choice - we're here if you need us.

5. How long does restoration take?
   Answer: Depends on damage extent. Average timeline:
   Assessment (2 weeks) → Approval (2 weeks) → Work (4-8 weeks)

6. What happens after NRMA approves the claim?
   Answer: We coordinate work schedule, manage daily progress,
   keep you and NRMA updated, handle inspections.

7. Do I need to pay anything upfront?
   Answer: No. NRMA pays approved claims directly.
   You pay your excess; we handle the rest.

8. What if damage is worse than the estimate?
   Answer: We document additional damage and submit variation
   to NRMA. Typically approved within 5-7 days.
```

#### Testimonial Example
```
"Processing was a breeze. The contractor NRPG matched me with
knew exactly what NRMA needed. Claim approved in 6 weeks,
which is faster than I expected. Highly recommend."
- Sarah M., NRMA policyholder (Water damage claim, Sydney)
★★★★★
```

#### Process Overview
```
NRMA Claim Process with NRPG Contractors

Step 1: Report Loss (You do this)
├─ Contact NRMA immediately
├─ Provide incident details
└─ Get claim reference number

Step 2: Professional Assessment (We do this)
├─ You contact NRPG for contractor match
├─ Contractor assesses damage
└─ Contractor prepares professional report

Step 3: Documentation & Quotes (We do this)
├─ Photographs per NRMA requirements (2+ per area)
├─ Itemized repair quotes
├─ Detailed scope of work
└─ Submit to NRMA (we handle this)

Step 4: NRMA Assessment (NRMA does this)
├─ NRMA reviews documentation
├─ May arrange independent inspection
├─ Assesses claim against policy
└─ Makes approval/rejection decision

Step 5: Approval & Work (We coordinate)
├─ NRMA approves scope and budget
├─ Contractor schedules work
├─ Work proceeds with NRMA updates
└─ Inspections completed as needed

Step 6: Final Payment (NRMA does this)
├─ Final inspection completed
├─ NRMA releases payment
├─ Less your excess (paid to contractor)
└─ Restoration complete
```

#### Contractor Showcase Section
```
Featured NRMA-Approved Contractors

[Contractor 1]
• Specialization: Water damage restoration
• NRMA claims completed: 127
• Average rating: 4.8/5 stars
• Coverage area: Sydney & surrounds
• Response time: 24 hours
[View Profile] [Request Match]

[Contractor 2]
• Specialization: Fire/smoke restoration
• NRMA claims completed: 89
• Average rating: 4.9/5 stars
• Coverage area: Melbourne & surrounds
• Response time: 24 hours
[View Profile] [Request Match]

[Contractor 3]
• Specialization: Mould remediation
• NRMA claims completed: 156
• Average rating: 4.7/5 stars
• Coverage area: Brisbane & surrounds
• Response time: 12 hours
[View Profile] [Request Match]
```

### Page Features
- [ ] NRMA logo prominently displayed
- [ ] NRMA brand colors in design
- [ ] Insurer-specific documentation requirements highlighted
- [ ] NRMA claims timeline prominently shown
- [ ] Testimonials from NRMA policyholders only
- [ ] Link to NRMA claims information page
- [ ] Mention of NRMA Code of Practice compliance
- [ ] FAQ addressing NRMA-specific concerns

---

## LANDING PAGE 2: Suncorp Preferred Restorers

### Metadata
- **URL**: `/insurance/suncorp-preferred-restorers`
- **Page Title**: "Suncorp Preferred Restoration Contractors | NRPG"
- **Meta Description**: "Suncorp-preferred disaster recovery contractors nationwide. Expert restoration, faster claims processing, comprehensive support."
- **Primary Keyword**: "Suncorp preferred contractors"
- **Target Audience**: Suncorp policyholders needing restoration services

### Key Differences from NRMA Page
```
Documentation Requirements (Suncorp-specific):
• Photo requirements: 3+ photos per damage area (stricter than NRMA)
• Quote format: Must include material specifications
• Inspection: Typically required for claims >$5,000
• Timeline: 4-8 weeks typical (slightly longer than NRMA)

Processing Average:
Initial claim acknowledgment: 3 business days
Initial response: 10 business days
Claim decision: 6-8 weeks (water damage)
Payment processing: 10-14 days after approval

Suncorp-Specific Benefits:
✓ 3+ Photos Policy = Clearer damage documentation
✓ Advanced damage assessment tools
✓ Direct contact with dedicated Suncorp adjuster
✓ Online claim tracking portal

FAQs Specific to Suncorp:
1. Why does Suncorp require 3+ photos per area?
   [Answer about documentation clarity improving approvals]

2. Does Suncorp cover [specific scenario]?
   [Suncorp policy-specific answer]

3. How does Suncorp's escalation process work?
   [Suncorp escalation procedures]
```

---

## LANDING PAGE 3: Allianz Restoration Network

### Metadata
- **URL**: `/insurance/allianz-restoration-network`
- **Page Title**: "Allianz Restoration Network - Approved Contractors | NRPG"
- **Meta Description**: "Join Allianz restoration network contractors. Streamlined approvals, professional support, nationwide coverage for disaster recovery."
- **Primary Keyword**: "Allianz restoration network"
- **Target Audience**: Allianz policyholders, contractors seeking Allianz approval

### Key Differences from NRMA Page
```
Documentation Requirements (Allianz-specific):
• Photo requirements: 2-3 photos per area (similar to NRMA)
• Quote format: Allianz uses proprietary assessment tools
• Inspection: Typically onsite within 10 days
• Timeline: 4-6 weeks typical (faster than Suncorp)

Allianz-Specific Benefits:
✓ Flood cover included (major differentiator)
✓ Premium care for stressed customers
✓ Digital claim lodgement option
✓ Mobile app for tracking progress
✓ 24/7 claims support hotline

Processing Average:
Initial claim acknowledgment: 2 business days (fast)
Initial response: 8 business days
Claim decision: 4-6 weeks (water damage)
Payment processing: 7-10 days after approval

Allianz Value Proposition:
"Allianz contractors get dedicated support coordinator
who manages your entire claim from assessment to completion."
```

---

## LANDING PAGE 4: QBE Disaster Recovery Partners

### Metadata
- **URL**: `/insurance/qbe-disaster-recovery-partners`
- **Page Title**: "QBE Disaster Recovery Partners | Approved Contractors | NRPG"
- **Meta Description**: "QBE disaster recovery partner network. Expert contractors, streamlined claims, professional restoration support."
- **Primary Keyword**: "QBE disaster recovery partners"
- **Target Audience**: QBE policyholders, commercial property owners

### Key Differences
```
Documentation Requirements (QBE-specific):
• Photo requirements: 2+ photos per area
• Quote format: Detailed breakdown required
• Inspection: Commercial properties may require engineer assessment
• Timeline: 4-8 weeks (varies by commercial complexity)

QBE-Specific Benefits:
✓ Specialization in commercial/large losses
✓ Business interruption support
✓ Direct contractor access to QBE's engineering team
✓ Faster approvals for large commercial claims

Processing Average:
Initial claim acknowledgment: 3 business days
Initial response: 10 business days
Claim decision: 4-6 weeks (standard) to 8-12 weeks (commercial)
Payment processing: 10-14 days after approval

QBE Value Proposition:
"QBE partners with contractors for seamless coordination
on large, complex losses. Engineering support included."
```

---

## LANDING PAGE 5: IAG Restoration Contractors

### Metadata
- **URL**: `/insurance/iag-restoration-contractors`
- **Page Title**: "IAG Approved Restoration Contractors | NRPG"
- **Meta Description**: "IAG-approved disaster recovery contractors nationwide. Fast claims processing, professional restoration, comprehensive support."
- **Primary Keyword**: "IAG restoration contractors"
- **Target Audience**: IAG policyholders (includes AAMI, NRMA brand users in some states)

### Key Differences
```
Documentation Requirements (IAG-specific):
• Photo requirements: 2+ photos per area
• Quote format: Standard format acceptable
• Inspection: Variable by claim amount
• Timeline: 4-6 weeks typical

IAG-Specific Benefits:
✓ Part of Australia's largest insurer
✓ Access to nationwide contractor network
✓ Mobile claim app (MySupport)
✓ Fast turnaround on large claims
✓ Business continuity support

Processing Average:
Initial claim acknowledgment: 3 business days
Initial response: 10 business days
Claim decision: 4-6 weeks
Payment processing: 7-10 days after approval

IAG Value Proposition:
"IAG's scale means faster processing and access to
specialist contractors for any disaster type."
```

---

## LANDING PAGE 6: CGU Emergency Response

### Metadata
- **URL**: `/insurance/cgu-emergency-response`
- **Page Title**: "CGU Emergency Response - Approved Contractors | NRPG"
- **Meta Description**: "CGU emergency response contractors. Fast disaster recovery support, professional restoration, nationwide network."
- **Primary Keyword**: "CGU emergency response"
- **Target Audience**: CGU policyholders, commercial/specialty insureds

### Key Differences
```
Documentation Requirements (CGU-specific):
• Photo requirements: 2+ photos per area
• Quote format: Detailed with specifications
• Inspection: Required for claims >$3,000
• Timeline: 4-8 weeks (includes specialist assessments)

CGU-Specific Benefits:
✓ Specialty insurance expertise (high-value properties)
✓ 24/7 emergency response hotline
✓ Dedicated claims coordinator
✓ Engineering assessment access
✓ Premium restoration oversight

Processing Average:
Initial claim acknowledgment: 2 business days
Initial response: 8 business days
Claim decision: 4-8 weeks
Payment processing: 10-14 days after approval

CGU Value Proposition:
"CGU specializes in high-value properties. Our contractors
understand complex, specialized restoration requirements."
```

---

## LANDING PAGE 7: Medibank Property Services

### Metadata
- **URL**: `/insurance/medibank-property-services`
- **Page Title**: "Medibank Property Services - Approved Contractors | NRPG"
- **Meta Description**: "Medibank-approved disaster recovery contractors. Professional restoration, streamlined claims, customer-focused support."
- **Primary Keyword**: "Medibank property services"
- **Target Audience**: Medibank policyholders, residential property owners

### Key Differences
```
Documentation Requirements (Medibank-specific):
• Photo requirements: 2+ photos per area
• Quote format: Standard format acceptable
• Inspection: Variable by claim type
• Timeline: 4-6 weeks typical

Medibank-Specific Benefits:
✓ Customer-focused claims handling
✓ Simple claim process
✓ Online portal for claim tracking
✓ Customer advocate support
✓ Fast response times

Processing Average:
Initial claim acknowledgment: 3 business days
Initial response: 10 business days
Claim decision: 4-6 weeks
Payment processing: 7-10 days after approval

Medibank Value Proposition:
"Medibank puts customers first. Our contractors align with
Medibank's commitment to excellent customer service."
```

---

## Common Sections (All 7 Pages)

### Related Resources Section
```
Learn More About Insurance Claims

Related Guides:
• Understanding Australian Property Insurance Policies
• Mandatory vs Optional Coverage
• Your Rights as Insurance Claimant
• When to Claim: Understanding Excesses
• [Insurer-Specific Guide Link]

Related Pages:
• [Other Insurer Pages] (4 links)
• Insurance Education Hub
```

### Trust Signals Section (All Pages)
```
Why Policyholders Choose NRPG

✓ [Number] Successful Claims Completed
✓ [Number]+ Approved Contractors Nationwide
✓ [Number]+ Customer Testimonials (4.8★ average)
✓ 100% Upfront Pricing (No Hidden Fees)
✓ Code of Practice Compliant (All Timeframes Met)
✓ Qualified Specialists Available
```

### Call-to-Action (All Pages - Bottom)
```
Get Matched with [Insurer]-Approved Contractor

We'll connect you with the perfect contractor for your needs.
Free consultation. No obligation.

[Get Matched Now] [Schedule Consultation]
```

---

## Technical Implementation Notes

### Page Type in Next.js
```typescript
// app/insurance/[insurer]/page.tsx

export default function InsurerLandingPage({ params }) {
  const insurer = params.insurer; // nrma, suncorp, allianz, etc.

  return (
    <div>
      <Hero insurer={insurer} />
      <TrustSection insurer={insurer} />
      <DocumentationSection insurer={insurer} />
      <ProcessOverview insurer={insurer} />
      <Testimonials insurer={insurer} />
      <FAQ insurer={insurer} />
      <ContractorShowcase insurer={insurer} />
      <CTA insurer={insurer} />
      <Footer />
    </div>
  );
}
```

### Data Structure (Sanity)
```
insurerPage
├─ name: "NRMA"
├─ slug: "nrma-approved-contractors"
├─ logo: image
├─ primaryKeyword: "NRMA approved restorers"
├─ heroHeadline: string
├─ trustPoints: array[objects]
├─ documentationRequirements: object
├─ processSteps: array[objects]
├─ testimonials: array[references to testimonial docs]
├─ faqItems: array[objects]
├─ featuredContractors: array[references to contractor profiles]
├─ seo: object {metaTitle, metaDescription, keywords}
└─ relatedPages: array[references to other insurer pages]
```

### SEO Configuration
- H1: Page title (unique for each insurer)
- H2s: Major sections (Trust, Documentation, Process, etc.)
- Internal links: To other insurer pages, insurance guides
- Schema markup: LocalBusiness, FAQPage, Review
- Meta tags: OpenGraph, Twitter Card
- Sitemap: Include all 7 pages

---

## Performance & Analytics

### GA4 Events to Track
- Page view (with insurer parameter)
- CTA button click (match with insurer)
- Testimonial expansion
- FAQ accordion open
- Contractor profile view
- Contractor match initiated

### Performance Targets
- Page load: <3 seconds (Core Web Vitals)
- Mobile responsiveness: 100% (viewport testing)
- SEO score: 90+ (Lighthouse)
- Accessibility: WCAG AA compliant

---

## Content Maintenance

### Update Schedule
- Monthly: Check testimonials for relevance
- Quarterly: Verify insurer requirements (contact insurer)
- Semi-annually: Update processing averages
- Annually: Full content audit and refresh

### Review Triggers
- Insurer announces policy changes
- Code of Practice updated
- New testimonial received
- Contractor network changes significantly

---

## Conversion Optimization

### CTA Copy Variations (A/B Testing)
```
Option A: "Get Matched with [Insurer] Contractor"
Option B: "Start Your Claim Process"
Option C: "Connect with Approved Contractor Now"
Option D: "Get Free Contractor Assessment"

Recommendation: Start with Option A (clearest value)
Then test against Option D (free angle)
```

### Landing Page Conversion Goals
- Primary: Contractor matching initiation (40% of visitors)
- Secondary: Insurance guide download (25% of visitors)
- Tertiary: Contact form submission (10% of visitors)

### Optimization Tactics
1. Trust signals prominent (near CTA)
2. Social proof (testimonials early, visible)
3. Clear value proposition (hero section)
4. Friction-free CTA (no login required initially)
5. Mobile-first design (60%+ traffic mobile)
6. Fast load times (3 seconds max)

---

**Status**: ✅ Template Specifications Complete - Ready for Development

**Next**: Email Campaign Templates (21 templates, 3 per insurer)

---

## Insurer Page Checklist

For each insurer page, confirm:

- [ ] Insurer logo sourced (with permission/brand guidelines)
- [ ] Brand colors identified
- [ ] Insurer requirements verified (contact insurer)
- [ ] Processing timeline confirmed (current as of 2026-01-09)
- [ ] Sample testimonials collected (from actual policyholders)
- [ ] Featured contractors identified
- [ ] FAQ questions answered (insurer-specific)
- [ ] SEO keywords researched
- [ ] Internal linking structure planned
- [ ] CTA copy finalized
- [ ] Mobile responsiveness planned
- [ ] Analytics tracking configured

---

**Files to Create After This**:
1. STAGE-3-EMAIL-CAMPAIGNS.md (21 templates)
2. STAGE-3-SEO-STRATEGY.md (Keyword strategy, backlink plan)
3. STAGE-3-CONTENT-CALENDAR.md (Publishing schedule)
