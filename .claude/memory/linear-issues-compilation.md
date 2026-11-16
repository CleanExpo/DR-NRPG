# Linear Issues Compilation — SEO Audit Findings

**Project**: NRPG Operations Platform
**Team ID**: DR
**Created**: 2026-03-05
**Total Issues**: 19 issues from GEO/AEO audit (8) + Tech SEO audit (12)

---

## ISSUE #1 (CREATED: DR-229)
- **Status**: ✅ CREATED
- **ID**: DR-229
- **Title**: [P0] SEO: Create llms.txt policy file for AI search discoverability
- **Severity**: CRITICAL
- **Description**: Missing llms.txt in apps/web/public/ blocks AI system discoverability (Claude, ChatGPT, Perplexity, Gemini). This file defines citation policies, content access rules, and brand identity signals for LLM-based systems. Draft created at `.claude/memory/llms-txt-draft.md` with 650+ line policy covering all 3 brands (Disaster Recovery, NRPG, Restore Assist). Implementation: Copy draft to apps/web/public/llms.txt and update next.config.js headers.
- **Labels**: Config, Improvement
- **Priority**: 0 (Critical)

---

## ISSUE #2 (PENDING)
- **Title**: [P1] SEO: Add AI crawler directives to robots.txt
- **Severity**: HIGH
- **Description**: robots.txt allows wildcard user-agent * but lacks explicit allow rules for AI crawlers. Missing directives for: GPTBot (ChatGPT), ClaudeBot/anthropic-ai (Claude), PerplexityBot, Google-Extended (Gemini/SGE), Applebot-Extended (Apple Intelligence), OAI-SearchBot. AI systems are more selective than search engines; explicit permission signals increase citation likelihood. Add these user-agent blocks to robots.txt to enable AI crawler access.
- **Affected**: apps/web/public/robots.txt
- **Recommendation**: Add explicit allow rules for each AI crawler (see audit report for exact syntax)
- **Labels**: SEO, Config
- **Priority**: 1 (High)
- **Effort**: 30 minutes

---

## ISSUE #3 (PENDING)
- **Title**: [P2] SEO: Add FAQPage schema.org markup to service pages
- **Severity**: MEDIUM
- **Description**: Service pages contain FAQ content (crime-scene-cleanup, hoarding-cleanup, biohazard services) but lack FAQPage schema.org markup. Without schema, AI systems cannot reliably extract Q&A pairs for featured snippets and AI overviews. Impact: Reduced likelihood of being cited in ChatGPT/Perplexity answers. Implement FAQPage schema.org type with proper question/answer structure on all service pages with FAQ content.
- **Affected Pages**:
  - /services/biohazard-cleanup/crime-scene-cleanup/page.tsx
  - /services/biohazard-cleanup/hoarding-cleanup/page.tsx
  - Other biohazard subservice pages
- **Labels**: SEO, Schema
- **Priority**: 2 (Medium)
- **Effort**: 2-3 hours

---

## ISSUE #4 (PENDING)
- **Title**: [P2] SEO: Add Q&A section to homepage for featured snippets
- **Severity**: MEDIUM
- **Description**: Homepage lacks conversational Q&A content despite being prime real estate for AEO (Answer Engine Optimization). Should include 8 common customer questions with direct answers: "What is disaster recovery?", "How does your matching work?", "Why choose Disaster Recovery Australia?", "What should I do immediately after a disaster?", etc. Add new FAQ/Q&A section before final CTA. Include FAQPage schema markup.
- **Affected**: apps/web/app/(public)/page.tsx
- **Recommendation**: Insert new React component <HomepageFAQ /> with FAQ schema before <JoinNRPGSection />
- **Labels**: Content, Improvement
- **Priority**: 2 (Medium)
- **Effort**: 4-6 hours

---

## ISSUE #5 (PENDING)
- **Title**: [P2] SEO: Add numbered process steps to service pillar pages
- **Severity**: MEDIUM
- **Description**: Service pillar pages (water-damage, fire-damage, flood-restoration, etc.) lack structured content preferred by AI systems. Missing: numbered steps, comparison tables, bullet lists. Water-damage/page.tsx has hero/stats/cards but no process information. Add structured process steps (e.g., "1. Emergency response 2. Assessment 3. Mitigation 4. Restoration 5. Follow-up") with HowTo schema.org markup for improved AI extraction and featured snippet eligibility.
- **Affected Pages**:
  - /services/water-damage/page.tsx
  - /services/fire-damage/page.tsx
  - /services/flood-restoration/page.tsx
  - /services/biohazard-cleanup/page.tsx
- **Recommendation**: Add <ProcessSteps /> or <ServiceProcess /> component with numbered list + HowTo schema
- **Labels**: Content, SEO
- **Priority**: 2 (Medium)
- **Effort**: 6-8 hours

---

## ISSUE #6 (PENDING)
- **Title**: [P2] SEO: Attribute statistics with sources for AI citability
- **Severity**: MEDIUM
- **Description**: Statistics displayed across pages lack source attribution, reducing AI confidence in citations. Examples: "4.9★ rating from 1247 reviews" (no source stated), "50+ employees" (no verification link), "8 states covered" (no data source). For AI search: attributed facts are cited more reliably than unsourced claims. Add inline citations or links to Google Business Profile, verification sources, or internal data sources. Update schema.org aggregateRating with source reference.
- **Affected**:
  - apps/web/lib/seo/schema-generator.ts (aggregateRating)
  - apps/web/app/services/water-damage/page.tsx (stats grid)
  - Homepage trust signals
- **Recommendation**: Add data source links or attribution statements next to key statistics
- **Labels**: Content, SEO
- **Priority**: 2 (Medium)
- **Effort**: 3-4 hours

---

## ISSUE #7 (PENDING)
- **Title**: [P3] SEO: Convert service headings to conversational question format
- **Severity**: LOW-MEDIUM
- **Description**: Most service page headings use declarative format ("Water Damage Restoration Services", "Trust & Credibility") rather than conversational question format preferred by voice search and AI. Example improvements: "What should I do after water damage?" instead of "Water Damage Restoration Services", "How much does [service] cost?" "How long does restoration take?". Voice search and AEO favor Q-format headings. Audit and update H2/H3 headings on top 10 service pages.
- **Affected**: Service pages across /services/* directory
- **Labels**: Content, SEO
- **Priority**: 3 (Low-Medium)
- **Effort**: 2-3 hours

---

## ISSUE #8 (PENDING)
- **Title**: [P3] SEO: Enhance generic service descriptions with unique details
- **Severity**: LOW
- **Description**: Service card descriptions are generic ("Professional [service] services with qualified professionals"). AI systems prefer unique, detailed content that differentiates services. Expand descriptions with specific value props, unique methodologies, response times, guarantees, or certification details. Example: "Professional water damage restoration with IICRC certification, 60-minute response time, structural drying guarantee" instead of generic placeholder text.
- **Affected**: Water-damage/page.tsx sub-service cards and other pillar pages
- **Labels**: Content, Improvement
- **Priority**: 3 (Low)
- **Effort**: 3-4 hours

---

## SUMMARY TABLE

| # | Title | Priority | Status | Effort | Audit Category |
|---|-------|----------|--------|--------|-----------------|
| 1 | Create llms.txt | P0 | ✅ CREATED (DR-229) | 1-2 hrs | AI discoverability |
| 2 | Add AI crawler directives | P1 | Pending | 0.5 hrs | AI access |
| 3 | Add FAQPage schema | P2 | Pending | 2-3 hrs | FAQ/schema |
| 4 | Add homepage Q&A | P2 | Pending | 4-6 hrs | AEO content |
| 5 | Add process steps | P2 | Pending | 6-8 hrs | Structured content |
| 6 | Attribute statistics | P2 | Pending | 3-4 hrs | Citability |
| 7 | Convert to Q-format headings | P3 | Pending | 2-3 hrs | Voice search |
| 8 | Enhance service descriptions | P3 | Pending | 3-4 hrs | Content uniqueness |

**Total Effort**: 22-31 hours spread across 8 issues

---

## IMPLEMENTATION PRIORITY

### IMMEDIATE (This Week)
1. ✅ DR-229: Create llms.txt (DONE)
2. DR-XXX: Add AI crawler directives to robots.txt (30 min)

### NEXT SPRINT (Week 2)
3. Add FAQPage schema markup (2-3 hours)
4. Add homepage Q&A section (4-6 hours)
5. Add process steps to service pages (6-8 hours)

### BACKLOG
6. Attribute statistics (3-4 hours)
7. Convert headings to Q-format (2-3 hours)
8. Enhance descriptions (3-4 hours)

---

---

# TECHNICAL SEO AUDIT — 12 Issues (Task #1)

## CRITICAL FINDINGS (P0)

### ISSUE #9 (PENDING)
- **Title**: [P0] SEO: Fix domain hardcoding in robots.txt
- **Severity**: CRITICAL
- **Description**: Static robots.txt file hardcodes wrong domain (disasterrecoverynrpg.com.au) instead of disasterrecovery.com.au. All 4 instances affect sitemap declarations (lines 82-83) and host directive (line 86). Search engines are directed to non-production domain.
- **Affected**: `apps/web/public/robots.txt` (lines 3, 82, 83, 86)
- **Recommendation**: Replace all 4 instances of disasterrecoverynrpg.com.au with disasterrecovery.com.au
- **Labels**: SEO, Config, Bug
- **Priority**: 0 (Critical)
- **Effort**: 15 minutes

### ISSUE #10 (PENDING)
- **Title**: [P0] SEO: Fix domain fallback in sitemap generator
- **Severity**: CRITICAL
- **Description**: Sitemap generator hardcodes wrong domain fallback (disasterrecoverynrpg.com.au). If NEXT_PUBLIC_BASE_URL environment variable is unset, all 5,000-10,000 generated sitemap URLs will point to wrong domain, causing indexing to incorrect domain.
- **Affected**: `apps/web/app/sitemap.ts` line 19
- **Recommendation**: Change fallback from https://disasterrecoverynrpg.com.au to https://disasterrecovery.com.au
- **Labels**: SEO, Config, Bug
- **Priority**: 0 (Critical)
- **Effort**: 10 minutes

### ISSUE #11 (PENDING)
- **Title**: [P0] SEO: Set NEXT_PUBLIC_BASE_URL environment variable
- **Severity**: CRITICAL
- **Description**: NEXT_PUBLIC_BASE_URL not explicitly set in production environments (.env.local, .env.vercel). Variable used as fallback in 27+ files and defaults to wrong domain (disasterrecoverynrpg.com.au) causing domain inconsistency across metadata, canonicals, and generated URLs. This is the root cause of multiple domain-related issues.
- **Affected**: `.env.local`, `.env.vercel`, and 27+ dependent files (app/robots.ts, app/sitemap.ts, app/layout.tsx, all dynamic page metadata)
- **Recommendation**: Explicitly set NEXT_PUBLIC_BASE_URL=https://disasterrecovery.com.au in all production environment files
- **Labels**: Config, Infrastructure
- **Priority**: 0 (Critical)
- **Effort**: 20 minutes

---

## HIGH FINDINGS (P1)

### ISSUE #12 (PENDING)
- **Title**: [P1] SEO: Delete static robots.txt, consolidate in robots.ts
- **Severity**: HIGH
- **Description**: Both static public/robots.txt and dynamic app/robots.ts exist. Static file takes precedence and is served instead of dynamic version. Static version has wrong domain and aggressive bot blocking; dynamic version is never used despite having correct domain fallback. This conflict causes robots configuration to not be applied correctly.
- **Affected**: `apps/web/public/robots.txt` (DELETE) and `apps/web/app/robots.ts` (KEEP & FIX)
- **Recommendation**: Delete static public/robots.txt file and ensure dynamic app/robots.ts is the only robots configuration source
- **Labels**: SEO, Config
- **Priority**: 1 (High)
- **Effort**: 30 minutes

### ISSUE #13 (PENDING)
- **Title**: [P1] SEO: Add AI crawler optimization rules to robots.ts
- **Severity**: HIGH
- **Description**: Dynamic robots.ts lacks explicit rules for AI crawlers (GPTBot, Claude-Web, PerplexityBot, Anthropic-AI). While global allow catches them, explicit rules improve AI search engine visibility and control access. Critical for GEO (Generative Engine Optimization) performance. Coordinates with GEO/AEO audit findings.
- **Affected**: `apps/web/app/robots.ts` (lines 13-47)
- **Recommendation**: Add explicit user-agent rules for GPTBot, Claude-Web, PerplexityBot with Allow directives. See GEO/AEO audit report for AI crawler list.
- **Labels**: SEO, Config
- **Priority**: 1 (High)
- **Effort**: 1 hour

### ISSUE #14 (PENDING - DUPLICATE)
- **Title**: [P1] SEO: Create llms.txt AI policy file
- **Severity**: HIGH
- **Description**: No public/llms.txt file exists. Standard file for AI model access policies used by OpenAI, Anthropic, Perplexity. Without it, no metadata provided to LLM crawlers regarding training permissions, access restrictions, or legal terms. Draft already created by GEO/AEO audit.
- **Affected**: `apps/web/public/llms.txt` (MISSING)
- **Recommendation**: Create /apps/web/public/llms.txt using draft from GEO/AEO audit (.claude/memory/llms-txt-draft.md)
- **Labels**: SEO, Config
- **Priority**: 1 (High)
- **Effort**: 30 minutes
- **Note**: Duplicate of DR-229 from GEO/AEO audit — mark as duplicate after creation

---

## MEDIUM FINDINGS (P2)

### ISSUE #15 (PENDING)
- **Title**: [P2] SEO: Fix metadataBase domain in layout.tsx
- **Severity**: MEDIUM
- **Description**: Global layout.tsx hardcodes metadataBase URL to disasterrecoverynrpg.com.au instead of disasterrecovery.com.au. All relative OpenGraph URLs and canonical URLs are built from this base, causing domain inconsistency in generated meta tags.
- **Affected**: `apps/web/app/layout.tsx` line 25
- **Recommendation**: Change metadataBase from https://disasterrecoverynrpg.com.au to https://disasterrecovery.com.au
- **Labels**: SEO, Bug
- **Priority**: 2 (Medium)
- **Effort**: 10 minutes

### ISSUE #16 (PENDING)
- **Title**: [P2] SEO: Clean up duplicated bot rules in robots.txt
- **Severity**: MEDIUM
- **Description**: Static robots.txt has duplicated rules for AhrefsBot, SemrushBot, DotBot (listed twice: once with crawl-delay, once with disallow). Inconsistent handling of service bots (Yandex, Baidu, DuckDuckGo have crawl-delay but no specific disallow rules). Will be resolved by consolidating to dynamic robots.ts.
- **Affected**: `apps/web/public/robots.txt` (lines 59-79) — Will be deleted per Issue #12
- **Recommendation**: When deleting static robots.txt, consolidate rules in dynamic robots.ts with clear, non-duplicated bot directives
- **Labels**: SEO, Cleanup
- **Priority**: 2 (Medium)
- **Effort**: 1 hour
- **Note**: Depends on Issue #12 (delete static robots.txt)

### ISSUE #17 (PENDING)
- **Title**: [P2] SEO: Implement hreflang tags for AU/NZ markets
- **Severity**: MEDIUM
- **Description**: No hreflang language/regional alternates implemented. Only default en_AU in OpenGraph metadata. For AU/NZ market distinction and future NZ expansion, hreflang support needed to signal regional targeting to search engines and prevent duplicate content penalties.
- **Affected**: `apps/web/app/layout.tsx` and all dynamic pages with generateMetadata
- **Recommendation**: Add hreflang alternates support in metadata (en-AU for Australia, en-NZ for future New Zealand domain when /nz section launches)
- **Labels**: SEO, Internationalization
- **Priority**: 2 (Medium)
- **Effort**: 3-4 hours

### ISSUE #18 (PENDING)
- **Title**: [P2] SEO: Create missing policy pages
- **Severity**: MEDIUM
- **Description**: Five required policy/agreement pages do not exist: /cookie-policy, /disclaimer, /modern-slavery, /contractor/contractor-agreement, /contractor/code-of-conduct. Pages cannot be indexed or added to sitemap until created. Important for legal compliance and SEO.
- **Affected**: Missing pages in `apps/web/app/` and `apps/web/app/sitemap.ts` (lines 24-79)
- **Recommendation**: Create five missing policy pages with proper metadata and add to sitemap.ts static pages array with appropriate priority/change frequency
- **Labels**: Content, Compliance
- **Priority**: 2 (Medium)
- **Effort**: 6-8 hours

### ISSUE #19 (PENDING)
- **Title**: [P2] SEO: Add explicit canonical URL to store page
- **Severity**: MEDIUM
- **Description**: Store landing page (app/(public)/store/page.tsx) has metadata but no explicit canonical URL. Relies on implicit default. While acceptable, explicit canonical recommended for e-commerce content to prevent duplicate issues as store evolves.
- **Affected**: `apps/web/app/(public)/store/page.tsx` metadata object (lines 19-40)
- **Recommendation**: Add explicit alternates.canonical: 'https://disasterrecovery.com.au/store' to store page metadata
- **Labels**: SEO, Improvement
- **Priority**: 2 (Medium)
- **Effort**: 15 minutes

---

## UPDATED SUMMARY TABLE

| # | Title | Priority | Status | Effort | Audit |
|---|-------|----------|--------|--------|-------|
| 1 | Create llms.txt | P0 | ✅ CREATED (DR-229) | 1-2 hrs | GEO/AEO |
| 2 | Add AI crawler directives (robots) | P1 | Pending | 0.5 hrs | GEO/AEO |
| 3 | Add FAQPage schema | P2 | Pending | 2-3 hrs | GEO/AEO |
| 4 | Add homepage Q&A | P2 | Pending | 4-6 hrs | GEO/AEO |
| 5 | Add process steps | P2 | Pending | 6-8 hrs | GEO/AEO |
| 6 | Attribute statistics | P2 | Pending | 3-4 hrs | GEO/AEO |
| 7 | Convert to Q-format headings | P3 | Pending | 2-3 hrs | GEO/AEO |
| 8 | Enhance descriptions | P3 | Pending | 3-4 hrs | GEO/AEO |
| 9 | Fix domain in robots.txt | P0 | Pending | 15 min | Tech SEO |
| 10 | Fix domain in sitemap.ts | P0 | Pending | 10 min | Tech SEO |
| 11 | Set NEXT_PUBLIC_BASE_URL | P0 | Pending | 20 min | Tech SEO |
| 12 | Delete static robots.txt | P1 | Pending | 30 min | Tech SEO |
| 13 | Add AI rules to robots.ts | P1 | Pending | 1 hr | Tech SEO |
| 14 | Create llms.txt (duplicate) | P1 | Pending | 30 min | Tech SEO |
| 15 | Fix metadataBase domain | P2 | Pending | 10 min | Tech SEO |
| 16 | Clean up bot rules | P2 | Pending | 1 hr | Tech SEO |
| 17 | Implement hreflang tags | P2 | Pending | 3-4 hrs | Tech SEO |
| 18 | Create policy pages | P2 | Pending | 6-8 hrs | Tech SEO |
| 19 | Add store canonical | P2 | Pending | 15 min | Tech SEO |

**Total Issues**: 19 (6 Critical, 3 High, 10 Medium)
**Total Effort**: 49-65 hours

---

# SCHEMA.ORG STRUCTURED DATA AUDIT — 10 Issues (Task #2)

## CRITICAL FINDINGS (P0)

### ISSUE #20 (PENDING)
- **Title**: [P0] SEO: Fix domain in all Organization schemas
- **Severity**: CRITICAL
- **Description**: All JSON-LD schemas across entire platform reference disasterrecoverynrpg.com.au instead of disasterrecovery.com.au. Breaks canonical URLs, causes search engine confusion, prevents proper schema validation in Google Search Console, Bing Webmaster Tools, and AI search engines. Affects 100% of pages.
- **Affected**: `apps/web/app/layout.tsx` (lines 25, 80-82, 101, 122), `apps/web/lib/seo/schema-generator.ts` (line 15), all service/location/contractor pages
- **Recommendation**: Update NEXT_PUBLIC_BASE_URL to https://disasterrecovery.com.au (coordinated with Tech SEO Issue #11)
- **Labels**: SEO, Schema, Bug
- **Priority**: 0
- **Effort**: 20 minutes (depends on env var)

### ISSUE #21 (PENDING)
- **Title**: [P0] SEO: Add ABN (taxID) to Organization schema
- **Severity**: CRITICAL
- **Description**: Organization schema missing required ABN field (85 151 794 142). Prevents Google and search engines from verifying company legitimacy, affecting local search results, knowledge panels, and trust signals.
- **Affected**: `apps/web/lib/seo/schema-generator.ts` lines 22-114, `apps/web/app/layout.tsx` lines 117-142
- **Recommendation**: Add `"taxID": "urn:abn:85151794142"` and update `"legalName"` to include ABN before address block
- **Labels**: SEO, Schema, Compliance
- **Priority**: 0
- **Effort**: 15 minutes

### ISSUE #22 (PENDING)
- **Title**: [P0] SEO: Add JSON-LD schemas to e-commerce store pages
- **Severity**: CRITICAL
- **Description**: Store pages (/store/page.tsx, /store/[slug]/ProductDetail.tsx) have ZERO JSON-LD structured data. Completely removes e-commerce visibility from Google Shopping, rich snippets, and AI search engines. Product schema required for price/availability signals.
- **Affected**: `apps/web/app/(public)/store/page.tsx`, `apps/web/app/(public)/store/[slug]/ProductDetail.tsx`, product data in `apps/web/lib/printful/products.ts`
- **Recommendation**: Add Product schema with name, description, image, price, availability, SKU. Add Organization schema reference and BreadcrumbList to store landing.
- **Labels**: SEO, Schema, E-commerce
- **Priority**: 0
- **Effort**: 3-4 hours

### ISSUE #23 (PENDING)
- **Title**: [P0] SEO: Fix Organization address from Sydney to Brisbane
- **Severity**: CRITICAL
- **Description**: Master Organization schema uses Sydney NSW address instead of correct Brisbane QLD. Creates incorrect local SEO signals, location-based search penalties, contradicts geo-targeting strategy.
- **Affected**: `apps/web/lib/seo/schema-generator.ts` lines 36-43, `apps/web/app/layout.tsx`, affects every page
- **Recommendation**: Update to Brisbane CBD (lat: -27.4698, lon: 153.0251). Update streetAddress, addressLocality, addressRegion, postalCode.
- **Labels**: SEO, Schema, Local SEO
- **Priority**: 0
- **Effort**: 20 minutes

---

## HIGH FINDINGS (P1)

### ISSUE #24 (PENDING)
- **Title**: [P1] SEO: Add BreadcrumbList schemas to service pages
- **Severity**: HIGH
- **Description**: Service pages (water-damage, fire-smoke, mould, storm) missing BreadcrumbList schemas. Improves SERP appearance with breadcrumb rich snippets, critical for internal linking SEO and UX signals.
- **Affected**: All service pillar pages
- **Recommendation**: Add BreadcrumbList schema with path: Home → Services → [Service Name]. Include canonical URLs in each breadcrumb item.
- **Labels**: SEO, Schema
- **Priority**: 1
- **Effort**: 2-3 hours

### ISSUE #25 (PENDING)
- **Title**: [P1] SEO: Add Offer schema with pricing to e-commerce products
- **Severity**: HIGH
- **Description**: Store products lack structured pricing and availability data. Without `offers` schema, Google Shopping and price comparison engines cannot index products. Reduces e-commerce search visibility.
- **Affected**: `apps/web/app/(public)/store/[slug]/ProductDetail.tsx`, `apps/web/lib/printful/products.ts`
- **Recommendation**: Add Offer schema with priceCurrency: "AUD", price, availability, url pointing to product page.
- **Labels**: SEO, Schema, E-commerce
- **Priority**: 1
- **Effort**: 2-3 hours

### ISSUE #26 (PENDING)
- **Title**: [P1] SEO: Add credential references to contractor profiles
- **Severity**: HIGH
- **Description**: Contractor ProfessionalService schemas missing `hasCredential` fields for IICRC certifications. Prevents search engines from understanding professional qualifications, reduces trust signals in local search.
- **Affected**: `apps/web/app/contractors/[id]/page.tsx` lines 138-160
- **Recommendation**: Add `"hasCredential"` array with EducationalOccupationalCredential objects for each IICRC certification.
- **Labels**: SEO, Schema, Credentials
- **Priority**: 1
- **Effort**: 2-3 hours

---

## MEDIUM FINDINGS (P2)

### ISSUE #27 (PENDING)
- **Title**: [P2] SEO: Implement FAQ schema on service and location pages
- **Severity**: MEDIUM
- **Description**: No pages include FAQ schema despite Q&A patterns in content. FAQ schema enables rich snippets in search results and voice search optimization.
- **Affected**: Service pages, location pages, contractor directory
- **Recommendation**: Add FAQ schema with 3-5 Q&A pairs minimum per page. Improve featured snippet eligibility.
- **Labels**: SEO, Schema, Content
- **Priority**: 2
- **Effort**: 4-6 hours

### ISSUE #28 (PENDING)
- **Title**: [P2] SEO: Implement HowTo schema for process-based content
- **Severity**: MEDIUM
- **Description**: Service pages describe multi-step processes suitable for HowTo schema but not implemented. HowTo schema enables rich snippets and improves featured snippet potential.
- **Affected**: Service pillar pages with process descriptions
- **Recommendation**: Structure with HowTo schema including step, name, description, image fields.
- **Labels**: SEO, Schema, Content
- **Priority**: 2
- **Effort**: 3-4 hours

### ISSUE #29 (PENDING)
- **Title**: [P2] SEO: Add SiteLinksSearchBox schema globally
- **Severity**: MEDIUM
- **Description**: Platform lacks global SiteLinksSearchBox schema. High-value feature for platforms with 150+ location pages, 40+ service combinations. Enables site search in Google results.
- **Affected**: Global site schema in layout.tsx
- **Recommendation**: Add SiteLinksSearchBox schema with `searchAction` pointing to `/search` endpoint.
- **Labels**: SEO, Schema, Feature
- **Priority**: 2
- **Effort**: 2-3 hours

---

## FINAL SUMMARY (3 AUDITS COMPILED)

**Total Issues**: 29 (10 Critical, 6 High, 13 Medium)
**Total Effort**: 70-95 hours

| Audit | P0 | P1 | P2 | P3 | Total |
|-------|----|----|----|----|-------|
| GEO/AEO | 1 | 2 | 4 | 2 | 9 |
| Tech SEO | 3 | 3 | 6 | - | 12 |
| Schema | 4 | 3 | 3 | - | 10 |
| **TOTAL** | **8** | **8** | **13** | **2** | **29** |

**Key Dependencies**:
- Schema domain fix (Issue #20) depends on Tech SEO env var fix (Issue #11)
- Store schemas (Issues #22, #25) depend on product data structure
- Organization address fix (Issue #23) should coordinate with domain fixes

---

## NOTES

- GEO/AEO audit: `.claude/memory/geo-aeo-audit-findings.md`
- Tech SEO audit: Received from tech-seo-agent
- Schema audit: Received from schema-agent
- llms.txt draft: `.claude/memory/llms-txt-draft.md`
- Waiting for audit findings from content-seo-agent, local-seo-agent
- linear-agent has full compilation for issue creation

