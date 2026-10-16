# Linear Implementation Tracking - DR-NRPG Australian Compliance & CSE/WRT Integration

**Project:** DR-NRPG Contractor Onboarding Enhancement  
**URL:** https://linear.app/unite-hub/project/dr-nrpg-563835ea6b00/issues  
**Plan Reference:** PLAN.md (Strengthened Implementation Plan)  
**Last Updated:** 2026-02-03  
**Senior PM:** Implementation Coordinator  

---

## 📊 Project Overview

| Metric | Value |
|--------|-------|
| **Total Epics** | 3 |
| **Total Tasks** | 21 |
| **Total Effort** | 80-108 hours |
| **Timeline** | 3-4 weeks |
| **Status** | 🟢 Ready for Implementation |

---

## 🎯 Epic 1: Australian Compliance & Content Audit
**Priority:** P0 (Critical)  
**Estimate:** 24-32 hours  
**Status:** 🔵 Ready to Start  

### AUDIT-01: Source Validation Engine ✅ COMPLETE
- **Priority:** P0
- **Estimate:** 8-10 hours
- **Status:** ✅ DONE
- **Assignee:** Infrastructure Team
- **Files Created:**
  - `apps/web/lib/training/australian-sources.json`
  - `apps/web/scripts/validate-australian-sources.ts`
- **Acceptance Criteria:**
  - [x] Whitelist of 25+ .gov.au domains
  - [x] Blacklist with Australian alternatives
  - [x] Pre-commit validation script
  - [x] CI/CD integration ready
- **Linear Command:**
  ```bash
  linear issue create --title "AUDIT-01: Source Validation Engine" --project "DR-NRPG" --estimate 8 --priority urgent --state "Done"
  ```

### AUDIT-02: Module ID Schema Expansion ✅ COMPLETE
- **Priority:** P0
- **Estimate:** 4-6 hours
- **Status:** ✅ DONE
- **Assignee:** Backend Team
- **Files Updated:**
  - `apps/web/app/api/training/nrp/module/[moduleId]/route.ts`
  - `apps/web/lib/training/nrp-training.ts`
- **Acceptance Criteria:**
  - [x] Regex supports NRP-XXX, CSE-MXX, WRT-MXX
  - [x] parseCseModuleNumber() function
  - [x] parseWrtModuleNumber() function
  - [x] getCourseTypeFromModuleId() function
- **Linear Command:**
  ```bash
  linear issue create --title "AUDIT-02: Module ID Schema Expansion" --project "DR-NRPG" --estimate 5 --priority urgent --state "Done"
  ```

### AUDIT-03: Database Schema Migration ✅ COMPLETE
- **Priority:** P0
- **Estimate:** 4-6 hours
- **Status:** ✅ DONE
- **Assignee:** Database Team
- **Files Created:**
  - `apps/web/prisma/migrations/20250203000000_add_course_types/migration.sql`
- **Acceptance Criteria:**
  - [x] CourseType enum (NRPG, CSE, WRT)
  - [x] CertificationLevel enum (NONE, BRONZE, SILVER, GOLD)
  - [x] CertificationRequirements table
  - [x] Auto-updating trigger
- **Linear Command:**
  ```bash
  linear issue create --title "AUDIT-03: Database Schema Migration" --project "DR-NRPG" --estimate 5 --priority urgent --state "Done"
  ```

### AUDIT-04: Australian Context Enrichment
- **Priority:** P0
- **Estimate:** 6-8 hours
- **Status:** 🟡 TODO
- **Assignee:** Content Team
- **Dependencies:** AUDIT-01, AUDIT-02, AUDIT-03
- **Description:** Add required sections to all 46 modules
- **Required Sections per Module:**
  1. Sources (minimum 3 .gov.au links)
  2. Australian Context (Sydney/Melbourne/Brisbane examples)
  3. DR-NRPG Process (real platform workflow)
- **Acceptance Criteria:**
  - [ ] All 46 modules have Sources section
  - [ ] All 46 modules have Australian Context section
  - [ ] All 46 modules have DR-NRPG Process section
  - [ ] Validation script passes for all modules
- **Linear Command:**
  ```bash
  linear issue create --title "AUDIT-04: Australian Context Enrichment" --project "DR-NRPG" --estimate 7 --priority urgent --state "Todo"
  ```

---

## 🎯 Epic 2: AI Content Generation Pipeline
**Priority:** P0 (Critical)  
**Estimate:** 16-20 hours  
**Status:** 🟡 In Progress  

### AI-01: Multi-Model Architecture ✅ COMPLETE
- **Priority:** P0
- **Estimate:** 6-8 hours
- **Status:** ✅ DONE
- **Assignee:** AI Team
- **Files Created:**
  - `apps/web/lib/training/content-generator.ts`
- **Acceptance Criteria:**
  - [x] Hard-coded approved models
  - [x] Model validation at runtime
  - [x] Australian context injection
  - [x] Content validation layer
- **Linear Command:**
  ```bash
  linear issue create --title "AI-01: Multi-Model Architecture" --project "DR-NRPG" --estimate 7 --priority urgent --state "Done"
  ```

### AI-02: Vertex AI Integration
- **Priority:** P0
- **Estimate:** 6-8 hours
- **Status:** 🟡 TODO
- **Assignee:** AI Team
- **Dependencies:** AI-01
- **Description:** Configure Vertex AI SDK for Gemini 3 Pro and VEO 3
- **Configuration:**
  - Region: australia-southeast1 (data sovereignty)
  - Models: Gemini 3 Pro (text/image), VEO 3 (video)
- **Acceptance Criteria:**
  - [ ] Vertex AI SDK configured
  - [ ] Gemini 3 Pro text generation working
  - [ ] Gemini 3 Pro image generation working
  - [ ] VEO 3 video generation configured
- **Linear Command:**
  ```bash
  linear issue create --title "AI-02: Vertex AI Integration" --project "DR-NRPG" --estimate 7 --priority urgent --state "Todo"
  ```

### AI-03: Content Validation Layer
- **Priority:** P0
- **Estimate:** 4 hours
- **Status:** 🟡 TODO
- **Assignee:** QA Team
- **Dependencies:** AI-01, AI-02
- **Description:** Pre-commit hooks for AI-generated content
- **Validation Checks:**
  - Approved models only
  - Australian English spelling
  - .gov.au sources present
  - DR-NRPG process references
- **Acceptance Criteria:**
  - [ ] Pre-commit hook created
  - [ ] CI/CD integration
  - [ ] Validation passes for sample content
- **Linear Command:**
  ```bash
  linear issue create --title "AI-03: Content Validation Layer" --project "DR-NRPG" --estimate 4 --priority urgent --state "Todo"
  ```

---

## 🎯 Epic 3: CSE/WRT Module Integration
**Priority:** P0 (Critical)  
**Estimate:** 40-56 hours  
**Status:** 🔴 Blocked (waiting on Epic 1 & 2)  

### CSE-01: Markdown-to-HTML Converter
- **Priority:** P0
- **Estimate:** 6 hours
- **Status:** 🔴 TODO
- **Assignee:** Backend Team
- **Dependencies:** AUDIT-01, AUDIT-02
- **Description:** Convert 22 CSE/WRT markdown modules to HTML
- **File:** `apps/web/scripts/convert-cse-wrt-modules.ts`
- **Acceptance Criteria:**
  - [ ] Script converts CSE modules (M01-M10)
  - [ ] Script converts WRT modules (M01-M12)
  - [ ] Australian context injected
  - [ ] NRPG styling applied
- **Linear Command:**
  ```bash
  linear issue create --title "CSE-01: Markdown-to-HTML Converter" --project "DR-NRPG" --estimate 6 --priority urgent --state "Todo"
  ```

### CSE-02: Assessment Processing
- **Priority:** P0
- **Estimate:** 6 hours
- **Status:** 🔴 TODO
- **Assignee:** Backend Team
- **Dependencies:** CSE-01
- **Description:** Transform CSE/WRT assessments to NRPG quiz format
- **File:** `apps/web/scripts/process-cse-wrt-assessments.ts`
- **Acceptance Criteria:**
  - [ ] JSON assessments converted
  - [ ] MD assessments converted
  - [ ] 80% passing threshold enforced
  - [ ] Australian context in questions
- **Linear Command:**
  ```bash
  linear issue create --title "CSE-02: Assessment Processing" --project "DR-NRPG" --estimate 6 --priority urgent --state "Todo"
  ```

### CSE-03: Combined Module Index
- **Priority:** P0
- **Estimate:** 6 hours
- **Status:** 🔴 TODO
- **Assignee:** Backend Team
- **Dependencies:** CSE-01, CSE-02
- **Description:** Extend training index to include all 46 modules
- **File:** `apps/web/scripts/generate-training-index.ts`
- **Acceptance Criteria:**
  - [ ] Index includes 24 NRPG modules
  - [ ] Index includes 10 CSE modules
  - [ ] Index includes 12 WRT modules
  - [ ] Grouped by certification level
- **Linear Command:**
  ```bash
  linear issue create --title "CSE-03: Combined Module Index" --project "DR-NRPG" --estimate 6 --priority urgent --state "Todo"
  ```

### CSE-04: Update Module API Validation
- **Priority:** P0
- **Estimate:** 3 hours
- **Status:** 🔴 TODO
- **Assignee:** Backend Team
- **Dependencies:** AUDIT-02, CSE-03
- **File:** `apps/web/app/api/training/nrp/module/[moduleId]/route.ts`
- **Acceptance Criteria:**
  - [ ] API accepts CSE-MXX format
  - [ ] API accepts WRT-MXX format
  - [ ] Backward compatibility maintained
  - [ ] Tests updated
- **Linear Command:**
  ```bash
  linear issue create --title "CSE-04: Update Module API Validation" --project "DR-NRPG" --estimate 3 --priority urgent --state "Todo"
  ```

### CSE-05: Update Quiz Endpoint
- **Priority:** P0
- **Estimate:** 3 hours
- **Status:** 🔴 TODO
- **Assignee:** Backend Team
- **Dependencies:** CSE-02, CSE-04
- **File:** `apps/web/app/api/onboarding/quiz/route.ts`
- **Acceptance Criteria:**
  - [ ] Quiz lookup supports CSE/WRT
  - [ ] Question randomization working
  - [ ] 80% threshold enforced
  - [ ] Tests updated
- **Linear Command:**
  ```bash
  linear issue create --title "CSE-05: Update Quiz Endpoint" --project "DR-NRPG" --estimate 3 --priority urgent --state "Todo"
  ```

### CSE-06: Update Onboarding Path Logic
- **Priority:** P0
- **Estimate:** 4 hours
- **Status:** 🔴 TODO
- **Assignee:** Backend Team
- **Dependencies:** CSE-03, CSE-05
- **File:** `apps/web/src/lib/contractor-onboarding-service.ts`
- **Acceptance Criteria:**
  - [ ] CSE modules included for all contractors
  - [ ] WRT modules included for water specialists
  - [ ] Path generation updated
  - [ ] Tests updated
- **Linear Command:**
  ```bash
  linear issue create --title "CSE-06: Update Onboarding Path Logic" --project "DR-NRPG" --estimate 4 --priority urgent --state "Todo"
  ```

### CSE-07: Define Certification Requirements
- **Priority:** P0
- **Estimate:** 3 hours
- **Status:** 🔴 TODO
- **Assignee:** Product Team
- **Dependencies:** AUDIT-03, CSE-06
- **Description:** Implement Bronze/Silver/Gold criteria
- **Certification Levels:**
  - Bronze: NRP-001,002,003 + CSE-M01,M02
  - Silver: Bronze + NRP-004,005 + CSE-M03,M04,M05 + WRT-M01,M02
  - Gold: Silver + NRP-006,007 + CSE-M06,M07,M08 + WRT-M03,M04,M05
- **Acceptance Criteria:**
  - [ ] Bronze criteria defined
  - [ ] Silver criteria defined
  - [ ] Gold criteria defined
  - [ ] Database populated
- **Linear Command:**
  ```bash
  linear issue create --title "CSE-07: Define Certification Requirements" --project "DR-NRPG" --estimate 3 --priority urgent --state "Todo"
  ```

### CSE-08: Update Training Overview UI
- **Priority:** P0
- **Estimate:** 4 hours
- **Status:** 🔴 TODO
- **Assignee:** Frontend Team
- **Dependencies:** CSE-03, CSE-07
- **File:** `apps/web/app/dashboard/contractor/onboarding/training/page.tsx`
- **Acceptance Criteria:**
  - [ ] Display 46 modules grouped by course
  - [ ] Progress indicators for each module
  - [ ] Certification level badges
  - [ ] Mobile responsive
- **Linear Command:**
  ```bash
  linear issue create --title "CSE-08: Update Training Overview UI" --project "DR-NRPG" --estimate 4 --priority urgent --state "Todo"
  ```

### CSE-09: Update Checklist Page
- **Priority:** P0
- **Estimate:** 4 hours
- **Status:** 🔴 TODO
- **Assignee:** Frontend Team
- **Dependencies:** CSE-06, CSE-08
- **File:** `apps/web/app/dashboard/contractor/onboarding/checklist/page.tsx`
- **Acceptance Criteria:**
  - [ ] Modules grouped by course
  - [ ] Completion badges shown
  - [ ] Next module highlighted
  - [ ] Certification progress bar
- **Linear Command:**
  ```bash
  linear issue create --title "CSE-09: Update Checklist Page" --project "DR-NRPG" --estimate 4 --priority urgent --state "Todo"
  ```

### CSE-10: Content Quality Audit
- **Priority:** P0
- **Estimate:** 6 hours
- **Status:** 🔴 TODO
- **Assignee:** QA Team
- **Dependencies:** CSE-01, AUDIT-04
- **Description:** Manual review of all 46 converted modules
- **Acceptance Criteria:**
  - [ ] All modules reviewed for formatting
  - [ ] Australian English verified
  - [ ] NRPG values alignment checked
  - [ ] Source validation passes
- **Linear Command:**
  ```bash
  linear issue create --title "CSE-10: Content Quality Audit" --project "DR-NRPG" --estimate 6 --priority urgent --state "Todo"
  ```

### CSE-11: Quiz Validation Testing
- **Priority:** P0
- **Estimate:** 3 hours
- **Status:** 🔴 TODO
- **Assignee:** QA Team
- **Dependencies:** CSE-02, CSE-05
- **Description:** Test all CSE/WRT quizzes through API
- **Acceptance Criteria:**
  - [ ] All CSE quizzes tested
  - [ ] All WRT quizzes tested
  - [ ] Scoring logic verified (80% threshold)
  - [ ] Edge cases tested
- **Linear Command:**
  ```bash
  linear issue create --title "CSE-11: Quiz Validation Testing" --project "DR-NRPG" --estimate 3 --priority urgent --state "Todo"
  ```

### CSE-12: End-to-End Onboarding Testing
- **Priority:** P0
- **Estimate:** 6 hours
- **Status:** 🔴 TODO
- **Assignee:** QA Team
- **Dependencies:** CSE-06, CSE-08, CSE-09
- **Description:** Test complete contractor workflows
- **Test Scenarios:**
  - Water damage specialist path
  - Fire damage specialist path
  - Mould remediation path
- **Acceptance Criteria:**
  - [ ] Water specialist workflow passes
  - [ ] Fire specialist workflow passes
  - [ ] Mould specialist workflow passes
  - [ ] All 46 modules accessible
- **Linear Command:**
  ```bash
  linear issue create --title "CSE-12: End-to-End Onboarding Testing" --project "DR-NRPG" --estimate 6 --priority urgent --state "Todo"
  ```

### CSE-13: Database Migration Script
- **Priority:** P0
- **Estimate:** 3 hours
- **Status:** 🔴 TODO
- **Assignee:** Database Team
- **Dependencies:** CSE-07, CSE-12
- **File:** `apps/web/scripts/migrate-existing-contractor-progress.ts`
- **Acceptance Criteria:**
  - [ ] Existing contractor progress preserved
  - [ ] CSE/WRT modules added to progress records
  - [ ] Certification levels calculated
  - [ ] Rollback script ready
- **Linear Command:**
  ```bash
  linear issue create --title "CSE-13: Database Migration Script" --project "DR-NRPG" --estimate 3 --priority urgent --state "Todo"
  ```

### CSE-14: Production Deployment
- **Priority:** P0
- **Estimate:** 3 hours
- **Status:** 🔴 TODO
- **Assignee:** DevOps Team
- **Dependencies:** CSE-10, CSE-11, CSE-12, CSE-13
- **Description:** Deploy to production with monitoring
- **Acceptance Criteria:**
  - [ ] Deployment successful
  - [ ] Smoke tests pass
  - [ ] Error logs monitored for 24 hours
  - [ ] Rollback plan tested
- **Linear Command:**
  ```bash
  linear issue create --title "CSE-14: Production Deployment" --project "DR-NRPG" --estimate 3 --priority urgent --state "Todo"
  ```

### CSE-15: Documentation Update
- **Priority:** P1 (High)
- **Estimate:** 2 hours
- **Status:** 🔴 TODO
- **Assignee:** Documentation Team
- **Dependencies:** CSE-14
- **Files to Update:**
  - CLAUDE.md
  - BACKLOG.md
  - API documentation
- **Acceptance Criteria:**
  - [ ] Module counts updated (46 total)
  - [ ] Architecture documented
  - [ ] API changes documented
  - [ ] Certification paths documented
- **Linear Command:**
  ```bash
  linear issue create --title "CSE-15: Documentation Update" --project "DR-NRPG" --estimate 2 --priority high --state "Todo"
  ```

---

## 📅 Implementation Schedule

### Week 1: Australian Compliance Foundation
| Day | Tasks | Team | Hours |
|-----|-------|------|-------|
| Mon | AUDIT-01, AUDIT-02 | Infrastructure, Backend | 16 |
| Tue | AUDIT-03, AI-01 | Database, AI | 12 |
| Wed | AI-02, AI-03 | AI, QA | 12 |
| Thu | AUDIT-04 | Content | 8 |
| Fri | Testing, Bug fixes | All | 8 |

### Week 2: CSE/WRT Integration
| Day | Tasks | Team | Hours |
|-----|-------|------|-------|
| Mon | CSE-01, CSE-02 | Backend | 12 |
| Tue | CSE-03, CSE-04, CSE-05 | Backend | 12 |
| Wed | CSE-06, CSE-07 | Backend, Product | 8 |
| Thu | CSE-08, CSE-09 | Frontend | 8 |
| Fri | CSE-10, Testing | QA | 10 |

### Week 3: Testing & Deployment
| Day | Tasks | Team | Hours |
|-----|-------|------|-------|
| Mon | CSE-11, CSE-12 | QA | 9 |
| Tue | CSE-13 | Database | 3 |
| Wed | CSE-14 | DevOps | 3 |
| Thu | CSE-15, Monitoring | Documentation | 4 |
| Fri | Buffer/Fixes | All | 8 |

---

## 🔄 Critical Path

```
AUDIT-01 → AUDIT-02 → AUDIT-03 → AI-01 → AI-02 → AI-03
    ↓
CSE-01 → CSE-02 → CSE-03 → CSE-04 → CSE-05 → CSE-06 → CSE-07
    ↓
CSE-08 → CSE-09 → CSE-10 → CSE-11 → CSE-12 → CSE-13 → CSE-14 → CSE-15
```

---

## 📈 Success Metrics

### Pre-Deployment
- [ ] 100% of modules cite only .gov.au sources
- [ ] All 46 modules load successfully via API
- [ ] Quiz scoring works for all module types (80% threshold)
- [ ] Australian English spelling validated
- [ ] DR-NRPG process sections present in all modules

### Post-Deployment
- [ ] Contractor completion rate >85% for Bronze
- [ ] Average module completion time < estimated duration
- [ ] Quiz pass rate >75% on first attempt
- [ ] Zero API errors for CSE/WRT requests
- [ ] Source validation passes in CI/CD

---

## 🚨 Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Non-Australian sources | HIGH | HIGH | Automated validation + manual audit |
| API breaking changes | MEDIUM | HIGH | Versioned endpoints + backward compat |
| AI content quality | MEDIUM | MEDIUM | Human review gate + validation layer |
| Migration failure | LOW | HIGH | Comprehensive backup + rollback script |

---

## 📝 Notes for Senior PM

1. **AUDIT-01, AUDIT-02, AUDIT-03, AI-01 are COMPLETE** - Mark as Done in Linear
2. **AUDIT-04 is next priority** - Unblocks CSE-01
3. **AI-02 and AI-03 can run parallel** to AUDIT-04
4. **CSE tasks are sequential** - Follow critical path
5. **CSE-14 (Deployment) should be scheduled** for low-traffic period
6. **Monitor error logs for 24 hours** post-deployment

---

## 🔗 Quick Links

- **Plan:** PLAN.md
- **Australian Sources:** apps/web/lib/training/australian-sources.json
- **Validation Script:** apps/web/scripts/validate-australian-sources.ts
- **AI Generator:** apps/web/lib/training/content-generator.ts
- **Database Migration:** apps/web/prisma/migrations/20250203000000_add_course_types/migration.sql
- **API Route:** apps/web/app/api/training/nrp/module/[moduleId]/route.ts
- **Training Loader:** apps/web/lib/training/nrp-training.ts

---

**Next Action:** Create AUDIT-04 in Linear and assign to Content Team
