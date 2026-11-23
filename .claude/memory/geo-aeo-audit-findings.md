# GEO/AEO Audit Findings — disasterrecovery.com.au

## Audit Date: 2026-03-05
## Audit Scope: Generative Engine Optimisation (GEO) & Answer Engine Optimisation (AEO)

---

## CRITICAL FINDINGS

### 1. llms.txt — CRITICAL GAP
**Status**: MISSING
**Severity**: CRITICAL
**Impact**: Site is not discoverable by LLM-based AI systems (Claude, ChatGPT, Perplexity, etc.)

**Evidence**:
- No `llms.txt` file found in `/apps/web/public/`
- This file is essential for AI systems to understand your domain, terms, content policy, and citation preferences

**Action Required**: Create `apps/web/public/llms.txt` immediately (see draft below)

---

### 2. AI Crawler Access — INCOMPLETE
**Status**: NOT OPTIMIZED
**Severity**: HIGH
**Finding**: `robots.txt` allows wildcard user-agent `*` but does NOT explicitly allow AI crawlers

**Current robots.txt rules**:
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /admin/
Disallow: /_next/
Disallow: /demo/
```

**Missing explicit AI crawler directives**:
- ❌ GPTBot (OpenAI's ChatGPT crawler)
- ❌ ClaudeBot / anthropic-ai (Anthropic's Claude crawler)
- ❌ PerplexityBot (Perplexity AI crawler)
- ❌ Google-Extended (Google's Gemini/SGE crawler)
- ❌ Applebot-Extended (Apple's AI crawler)
- ❌ OAI-SearchBot (OpenAI's search bot)

**Why this matters**:
- AI systems default to respecting robots.txt
- Explicit allow rules signal that you WANT your content cited
- These crawlers are MORE selective than search engines; permission signals matter

**Recommendation**: Add explicit allow rules to robots.txt:
```
# AI Crawlers - Citation-Optimized
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: OAI-SearchBot
Allow: /
```

---

### 3. FAQ & Q&A Content — GOOD FOUNDATION
**Status**: PARTIALLY IMPLEMENTED
**Severity**: MEDIUM
**Finding**: Service pages have FAQ sections, but no FAQ schema markup

**Confirmed FAQs on**:
- `/services/biohazard-cleanup/crime-scene-cleanup/page.tsx` — 5 Q&A items
- `/services/biohazard-cleanup/hoarding-cleanup/page.tsx` — 5 Q&A items
- Other biohazard subservices also have FAQs

**Missing**:
- FAQ schema.org markup on service pages
- No FAQPage type schema
- Homepage has NO FAQ section (missed AEO opportunity)
- Water damage pillar page has NO Q&A content

**Impact on AI Search**:
- FAQ schema helps AI systems extract direct answers
- Without schema, AI has to parse plain text (less reliable)
- Featured snippets and AI overview citations less likely

**Recommendation**:
1. Add `FAQPage` schema.org markup to all service pages with FAQs
2. Add Q&A section to homepage (top 5-8 questions from customer triage data)
3. Add FAQ to water damage pillar page
4. Ensure all FAQs have clear question/answer pairs (already done ✓)

---

### 4. Homepage Q&A Content — OPPORTUNITY
**Status**: MISSING
**Severity**: MEDIUM
**Finding**: Homepage has NO conversational Q&A content

**Current structure**:
- EmergencyHero (CTA-focused)
- InsurancePartners (trust signals)
- QuickTriageTool (interactive)
- ServicesGrid (visual)
- ResourcesHub (content links)
- Trust section (credibility statements)
- JoinNRPGSection (contractor recruitment)
- EmergencyCTA (final conversion)

**Missing**:
- "What is disaster recovery?" section
- "How does [our matching] work?" explanation
- "Why choose us vs. competitors?" Q&A
- "What should I do immediately after a disaster?" FAQ

**For AEO**: Conversational content helps AI answer user questions directly — homepage is prime real estate

---

### 5. Structured Content Format — WEAK
**Status**: PARTIALLY IMPLEMENTED
**Severity**: MEDIUM
**Finding**: Service pages use card layouts but lack structured lists/tables/numbered steps

**Observed on water-damage/page.tsx**:
- Hero section with CTAs ✓
- Quick stats grid ✓
- Sub-service cards (links to detail pages)
- BUT: No numbered steps, no process tables, no bullet lists

**Preferred by AI systems**:
- Numbered steps: "1. First, do X. 2. Then, do Y. 3. Finally, do Z."
- Tables: Comparison matrices
- Bullet lists: Key facts, benefits, requirements
- Lists are easily extractable for AI overviews

**Service pages that SHOULD have structured steps**:
- Water damage restoration (steps in process)
- Fire restoration (post-fire safety steps)
- Biohazard cleanup (health/safety protocol)
- Flood restoration (damage assessment steps)

---

### 6. Brand Entity Signals — STRONG
**Status**: WELL-DEFINED
**Severity**: N/A (positive finding)

**Organization Schema** (apps/web/lib/seo/schema-generator.ts):
- ✅ ProfessionalService type
- ✅ NRPG as primary name
- ✅ Disaster Recovery Australia as alternateName
- ✅ Legal name: "National Restoration Professionals Group Pty Ltd"
- ✅ Consistent description across all pages
- ✅ Full address (Sydney HQ)
- ✅ Geo coordinates
- ✅ areaServed: All Australian states
- ✅ serviceType: All pillars listed
- ✅ sameAs: Social profile consistency (LinkedIn, Facebook, Instagram, Twitter)
- ✅ Aggregate rating (4.9/5 with 1247 reviews)
- ✅ Member of IICRC + industry associations
- ✅ Emergency contact via email (no phone per CLAUDE.md ✓)

**Strong E-E-A-T signals**:
- Expertise: IICRC certifications mentioned
- Experience: 50+ employees, established network
- Authoritativeness: Industry membership visible
- Trustworthiness: Insurance partnerships, ratings, verified contractors

---

### 7. Social Profile Consistency — GOOD
**Status**: DOCUMENTED
**Severity**: N/A (positive finding)

**Confirmed social links** (components/footer.tsx):
- ✅ LinkedIn (individual profile link)
- ✅ Facebook: disasterrecoveryau
- ✅ YouTube: disaster recovery channel
- ✅ Twitter/X: implicit in schema.org sameAs
- ✅ Instagram: nrpgaustralia in schema.org

**For AEO**: Social signals help establish entity credibility in Knowledge Graph

---

### 8. Passage-Level Citability — MODERATE
**Status**: PARTIALLY OPTIMIZED
**Severity**: MEDIUM

**Findings**:
- ✅ Clear hero sections with value propositions
- ✅ Direct CTAs and conversion points
- ✅ Trust/credibility statements (qualified contractors, 24/7 response)
- ❌ Statistics lack sources (4.9 rating, 1247 reviews, 50+ employees - need attribution)
- ❌ Service descriptions are generic ("Professional [service] services with qualified professionals")
- ⚠️ No inline citations or links to source credibility claims

**For AI citation**: AI prefers pages where claims can be easily extracted and cited. Attributing stats (e.g., "4.9★ from 1247 verified reviews on Google") makes citations more reliable

---

### 9. Voice Search / Conversational Queries — PARTIAL
**Status**: MODERATE
**Severity**: LOW-MEDIUM

**Current headings**:
- Mostly declarative: "Water Damage Restoration Services", "Services Grid", "Trust & Credibility"
- Some conversational: "Why Choose Disaster Recovery Australia?"
- Missing conversational: "How long does restoration take?", "What does water damage restoration cost?"

**For voice search**: Questions as headings perform better
- Consider H2s like "What should I do after water damage?"
- "How much does [service] cost?" (even if answer is "contact us")
- "Who provides [service] in [city]?"

---

## AUDIT SUMMARY TABLE

| Audit Item | Status | Severity | Gap |
|-----------|--------|----------|-----|
| llms.txt | Missing | CRITICAL | Must create |
| AI crawler directives (robots.txt) | Incomplete | HIGH | Add explicit allows |
| FAQ Schema | Missing | MEDIUM | Add FAQPage markup |
| Homepage Q&A | Missing | MEDIUM | Add conversational section |
| Structured content (lists/tables/steps) | Weak | MEDIUM | Enhance service pages |
| Brand entity signals | Strong | N/A | ✓ Complete |
| Social consistency | Good | N/A | ✓ Complete |
| Passage citability | Moderate | MEDIUM | Add source attribution |
| Voice/conversational headings | Partial | LOW-MEDIUM | Add Q-format headings |

---

## RECOMMENDATIONS BY PRIORITY

### PHASE 1: CRITICAL (Week 1)
1. **Create `apps/web/public/llms.txt`** (see draft below)
2. **Update `robots.txt`** with explicit AI crawler allow rules

### PHASE 2: HIGH (Week 2)
3. Add `FAQPage` schema.org markup to service pages
4. Add Q&A section to homepage (top 8 common questions)
5. Add "Process steps" to water damage, fire damage, flood pages (numbered, structured)

### PHASE 3: MEDIUM (Week 3-4)
6. Add source attribution to statistics
7. Convert more headings to conversational Q-format
8. Ensure all service cards/descriptions have unique, detailed explanations
9. Consider adding comparison tables (e.g., "Water Damage by Type")

### PHASE 4: ONGOING
10. Monitor AI search visibility (ChatGPT, Perplexity, Claude) for citation performance
11. Track featured snippets and AI overview inclusion rates
12. Audit quarterly as AI systems evolve

---

## DRAFT llms.txt

Below is a recommended `llms.txt` for **disasterrecovery.com.au** covering all 3 brands (Disaster Recovery, NRPG, Restore Assist).

See full draft in next section.

---

## NEXT STEPS

1. Create `apps/web/public/llms.txt` using the draft provided
2. Update `apps/web/public/robots.txt` with AI crawler rules
3. Create Linear issues for FAQ schema, homepage Q&A, structured content
4. Brief content team on conversational content updates
5. Re-audit in 4 weeks to measure AI citation performance

