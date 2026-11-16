# Execution Plan: Finalize Project Handover and Connect All API Endpoints

**Generated**: 2026-02-04
**Status**: Ready for Execution
**Estimated Time**: 6-8 hours
**Team**: Builder + Validator agents

---

## Architecture Context

This plan uses alternating Builder/Validator task sequences:
- **Builder**: Implements code, updates configs, edits files
- **Validator**: Verifies file existence, checks syntax, runs tests, ensures requirements met
- **Rule**: Validator MUST run immediately after Builder completes a task

---

## Phase 1: API Endpoint Completion

### 1.1 Audit Incomplete API Routes
**[Task 1] Builder**: Search all `/apps/web/app/api/**/*.ts` files for "TODO", "FIXME", "placeholder", "not implemented" comments. Create inventory file at `specs/api-audit.md` listing:
- File path
- Line number
- TODO description
- Priority (Critical/High/Medium/Low)
- Estimated effort (hours)

**[Task 2] Validator**: Verify `specs/api-audit.md` exists, contains valid markdown, has at least 10 entries, properly categorized by priority.

---

### 1.2 Connect Lead Capture Endpoint
**[Task 3] Builder**: Read `/apps/web/app/api/public/lead-capture/route.ts` and verify it:
- Has database insertion logic
- Sends confirmation email
- Triggers contractor matching
- Returns proper 201 response
- If missing any of above, implement them

**[Task 4] Validator**:
- Verify file compiles without TypeScript errors
- Check Prisma schema has `LeadCapture` model
- Verify email template exists
- Run: `curl -X POST http://localhost:3000/api/public/lead-capture -H "Content-Type: application/json" -d '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"0412345678","propertyAddress":"123 Main St","suburb":"Sydney","state":"NSW","postcode":"2000","damageType":"WATER_DAMAGE","damageDescription":"Test description for validation","hasInsurance":true,"urgency":"STANDARD"}'`
- Verify 201 response received

---

### 1.3 Connect Triage Assessment Endpoint
**[Task 5] Builder**: Read `/apps/web/app/api/public/triage/route.ts` and implement:
- Triage scoring algorithm (urgency calculation)
- Cost estimation logic
- Recommendation engine
- Database persistence of results
- Return proper response structure per README spec

**[Task 6] Validator**:
- Verify TypeScript compiles
- Check triage scoring returns value 0-100
- Verify cost estimation returns min/max range
- Test endpoint: `curl -X POST http://localhost:3000/api/public/triage -H "Content-Type: application/json" -d '{"postcode":"2000","state":"NSW","responses":[{"questionId":"water_standing","answer":true},{"questionId":"affected_area","answer":"entire floor"}]}'`
- Verify JSON response has urgencyLevel, urgencyScore, recommendations fields

---

### 1.4 Connect Newsletter Subscription Endpoint
**[Task 7] Builder**: Read `/apps/web/app/api/public/newsletter/route.ts` and implement:
- Email validation and duplicate checking
- Database insertion to NewsletterSubscription model
- SendGrid/Resend integration for confirmation email
- Unsubscribe token generation
- Handle GET /api/public/newsletter?email=xxx&token=xxx for unsubscribe

**[Task 8] Validator**:
- Verify both POST and DELETE methods work
- Test subscribe: `curl -X POST http://localhost:3000/api/public/newsletter -H "Content-Type: application/json" -d '{"email":"test@example.com","firstName":"Test","marketingConsent":true}'`
- Verify 201 response and database record created
- Check duplicate email returns 409 Conflict

---

### 1.5 Connect Contractor Inquiry Endpoint
**[Task 9] Builder**: Read `/apps/web/app/api/public/contractor-inquiry/route.ts` (if different from `/api/landing/contractor-application/route.ts`, merge logic):
- ABN validation (11 digits)
- Duplicate checking by email and ABN
- Auto-approval logic (if qualified + insurance)
- Email notification to admin team
- Return application ID and next steps

**[Task 10] Validator**:
- Verify endpoint handles all required fields per README spec
- Test: `curl -X POST http://localhost:3000/api/public/contractor-inquiry -H "Content-Type: application/json" -d '{"businessName":"Test Restoration","abn":"12345678901","contactFirstName":"John","contactLastName":"Doe","contactEmail":"john@test.com","contactPhone":"0412345678","businessAddress":"123 St","suburb":"Sydney","state":"NSW","postcode":"2000","servicesOffered":["WATER_DAMAGE"],"serviceAreas":["NSW"],"hasPublicLiability":true,"publicLiabilityAmount":10000000,"hasWorkersCompensation":false,"yearsInBusiness":5,"numberOfEmployees":3,"termsAccepted":true,"backgroundCheckConsent":true}'`
- Verify 201 response with applicationId

---

## Phase 2: Dashboard API Endpoints

### 2.1 Complete Contractor Analytics Endpoint
**[Task 11] Builder**: Read `/apps/web/app/api/contractor/analytics/route.ts` and replace placeholder with:
- Query contractor's completed jobs count
- Calculate average rating
- Calculate total revenue (sum of job amounts)
- Get monthly revenue trend (last 12 months)
- Return jobs by status breakdown

**[Task 12] Validator**:
- Verify TypeScript compiles
- Check SQL queries use proper indexes
- Test endpoint with authenticated contractor session
- Verify response has: completedJobs, averageRating, totalRevenue, monthlyTrend fields

---

### 2.2 Complete Contractor Payout Settings
**[Task 13] Builder**: Read `/apps/web/app/api/contractor/payout-settings/route.ts` and implement:
- GET: Fetch contractor's Stripe Connect account status
- POST: Create/update payout preferences (bank account, schedule)
- Integration with Stripe Connect API
- Return account_link for onboarding if not connected

**[Task 14] Validator**:
- Verify Stripe API key configured in .env
- Check GET returns proper account status
- Verify POST validates bank details format (BSB + account number)
- Test endpoint returns 401 if not authenticated

---

### 2.3 Complete Client Onboarding Property Endpoint
**[Task 15] Builder**: Read `/apps/web/app/api/client/onboarding/property/route.ts` and implement:
- POST: Save property details (address, type, square meters)
- Geocoding integration (Google Maps API or Mapbox) for coordinates
- Validate Australian address format
- Link property to authenticated user

**[Task 16] Validator**:
- Verify address validation rejects invalid postcodes
- Check geocoding returns lat/lng coordinates
- Test property saved to database
- Verify user can only create property for themselves (RLS check)

---

### 2.4 Complete Admin Disputes Endpoint
**[Task 17] Builder**: Read `/apps/web/app/api/admin/disputes/route.ts` and implement:
- GET: List all active disputes with filters
- POST: Admin manually creates dispute
- PATCH /[id]: Update dispute status (OPEN, IN_REVIEW, RESOLVED, CLOSED)
- Include pagination (page, limit)

**[Task 18] Validator**:
- Verify only admin role can access (check middleware)
- Test pagination works correctly
- Verify dispute status transitions follow business rules
- Check audit log created on status change

---

## Phase 3: Integration & Third-Party Services

### 3.1 Verify Stripe Integration
**[Task 19] Builder**: Read all files in `/apps/web/lib/stripe/` and verify:
- Webhook signature verification implemented
- Tenant subscription creation works
- Stripe Connect for contractors configured
- Error handling for failed payments

**[Task 20] Validator**:
- Check `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in .env.example
- Verify webhook endpoint at `/api/webhooks/stripe/tenant/route.ts` exists
- Test webhook with Stripe CLI: `stripe trigger payment_intent.succeeded`
- Confirm database updated after webhook

---

### 3.2 Verify Email Service Integration
**[Task 21] Builder**: Check email service configuration:
- Read `/apps/web/lib/email/` (if exists) or search for Resend/SendGrid usage
- Verify all email templates exist (confirmation, password reset, notification)
- Ensure email sending is async/non-blocking
- Add retry logic for failed sends

**[Task 22] Validator**:
- Check `RESEND_API_KEY` or `SENDGRID_API_KEY` in .env.example
- Verify at least 5 email templates defined
- Test sending email via API endpoint
- Check email queue/background job processor exists

---

### 3.3 Verify Redis/Queue Integration
**[Task 23] Builder**: Read `/apps/web/lib/queue/` and verify:
- Background job processor configured
- Contractor matching queue works
- Email queue works
- Job retry logic with exponential backoff

**[Task 24] Validator**:
- Check `UPSTASH_REDIS_REST_URL` in .env.example
- Verify background job cron runs at `/api/cron/process-background-jobs`
- Test adding job to queue and verify it processes
- Check dead letter queue for failed jobs

---

## Phase 4: Vercel Deployment Configuration

### 4.1 Verify Vercel Configuration
**[Task 25] Builder**: Read `/vercel.json` and verify:
- Build command uses turbo: `turbo run build --filter=dr-nrpg-web`
- Output directory: `apps/web/.next`
- All cron jobs defined (12 total per current config)
- Security headers configured
- Regions set to Sydney (syd1)

**[Task 26] Validator**:
- Run: `cat vercel.json | jq '.buildCommand'` - verify correct
- Count cron jobs: `cat vercel.json | jq '.crons | length'` - verify ≥ 12
- Check headers include CSP, X-Frame-Options, X-Content-Type-Options
- Verify no conflicting apps/web/vercel.json exists

---

### 4.2 Create Deployment Environment Checklist
**[Task 27] Builder**: Create `specs/deployment-checklist.md` with sections:
- Environment Variables (categorized: Database, Auth, Email, Payment, Monitoring)
- For each variable: name, description, required/optional, example value
- Pre-deployment verification steps
- Post-deployment smoke tests
- Rollback procedure

**[Task 28] Validator**:
- Verify file exists at `specs/deployment-checklist.md`
- Check contains at least 30 environment variables
- Verify has smoke test section with ≥ 5 tests
- Validate markdown renders correctly

---

### 4.3 Test Production Build
**[Task 29] Builder**: Run production build locally:
- Execute: `NODE_ENV=production turbo run build --filter=dr-nrpg-web`
- Fix any build errors that occur
- Verify no TypeScript errors
- Verify no missing environment variable errors during build

**[Task 30] Validator**:
- Check build succeeds (exit code 0)
- Verify output: `apps/web/.next` directory exists and is > 10MB
- Check no critical warnings in build output
- Verify build time < 5 minutes

---

## Phase 5: Documentation & Handover Preparation

### 5.1 Create API Documentation
**[Task 31] Builder**: Create comprehensive `specs/API-REFERENCE.md`:
- All public API endpoints with examples
- All authenticated API endpoints grouped by role
- Request/response schemas
- Error codes and handling
- Rate limits
- Authentication methods

**[Task 32] Validator**:
- Verify file exists at `specs/API-REFERENCE.md`
- Check documents at least 20 API endpoints
- Verify each endpoint has: method, path, auth, request body, response example
- Validate all code examples are valid JSON

---

### 5.2 Create Database Documentation
**[Task 33] Builder**: Generate database schema documentation:
- Run: `npx prisma-docs-generator` (if available) OR manually create `specs/DATABASE-SCHEMA.md`
- Document all 12+ tables with columns, types, relationships
- Include ER diagram (Mermaid or PlantUML)
- Document indexes, constraints, RLS policies

**[Task 34] Validator**:
- Verify documentation file exists
- Check all Prisma models documented
- Verify ER diagram renders correctly
- Count tables: should be ≥ 12 models

---

### 5.3 Create Runbook for Operations
**[Task 35] Builder**: Create `specs/RUNBOOK.md` with:
- **Deployment**: Step-by-step Vercel deployment
- **Monitoring**: How to check logs, errors, performance
- **Incidents**: Common issues and resolutions
- **Maintenance**: Database migrations, backups
- **Cron Jobs**: What each job does, schedules, monitoring
- **Alerts**: What alerts exist, thresholds, escalation

**[Task 36] Validator**:
- Verify file exists at `specs/RUNBOOK.md`
- Check has 6 main sections (listed above)
- Verify deployment section has ≥ 8 steps
- Check includes example commands for common tasks

---

### 5.4 Create Handover Documentation
**[Task 37] Builder**: Create `specs/HANDOVER.md` with:
- Project overview and tech stack
- Architecture diagram (high-level)
- Key contacts and roles
- Access credentials locations (not the actual secrets)
- Known issues and limitations
- Future roadmap items
- Critical paths (what must not break)

**[Task 38] Validator**:
- Verify file exists at `specs/HANDOVER.md`
- Check includes architecture diagram (Mermaid/PlantUML)
- Verify lists known issues from README
- Check has future roadmap with ≥ 5 items

---

## Phase 6: Testing & Quality Assurance

### 6.1 Run Full Test Suite
**[Task 39] Builder**: Execute complete test suite:
- Run: `npm run test`
- Fix any failing tests
- Ensure coverage ≥ 80% for critical paths
- Update snapshots if needed

**[Task 40] Validator**:
- Verify all tests pass (exit code 0)
- Check test output shows ≥ 150 passing tests
- Verify no test warnings
- Check test coverage report: `npm run test:coverage`

---

### 6.2 Manual Smoke Testing
**[Task 41] Builder**: Create smoke test script at `scripts/smoke-test.sh`:
- Test homepage loads (curl http://localhost:3000)
- Test API health endpoint (if exists)
- Test login flow (programmatically)
- Test dashboard loads for each role
- Test key API endpoints (5-10 critical ones)

**[Task 42] Validator**:
- Execute: `bash scripts/smoke-test.sh`
- Verify all checks pass
- Check script tests at least 5 endpoints
- Verify script exits with code 0 on success

---

### 6.3 Load Testing (Optional but Recommended)
**[Task 43] Builder**: Create basic load test with k6 or Artillery:
- Test file: `tests/load/basic-load.js`
- Simulate 50 concurrent users
- Test critical paths: homepage, API endpoints
- Run for 2 minutes
- Set acceptable thresholds (95th percentile < 500ms)

**[Task 44] Validator**:
- Run load test: `k6 run tests/load/basic-load.js` (or equivalent)
- Verify no errors during test
- Check 95th percentile response time < 500ms
- Verify no memory leaks or crashes

---

## Phase 7: Security Audit

### 7.1 Environment Variables Audit
**[Task 45] Builder**: Review all environment variable usage:
- Search codebase for `process.env`
- Verify all secrets are in .env.example (with placeholder values)
- Check no secrets committed to git: `git log -p | grep -i "api_key\|secret\|password"`
- Verify .gitignore includes .env files

**[Task 46] Validator**:
- Check .env.example exists and has ≥ 25 variables
- Verify no actual secrets in .env.example (all should be placeholders)
- Run: `git log -S "sk_live_" --all` - should return 0 results
- Confirm .env, .env.local in .gitignore

---

### 7.2 Dependency Vulnerability Scan
**[Task 47] Builder**: Scan for vulnerabilities:
- Run: `npm audit`
- Fix critical and high vulnerabilities: `npm audit fix`
- Document any vulnerabilities that can't be auto-fixed
- Update packages if needed

**[Task 48] Validator**:
- Verify `npm audit` shows 0 critical vulnerabilities
- Check 0 high vulnerabilities
- Document any remaining moderate/low vulns in `specs/SECURITY.md`
- Verify no outdated major dependencies

---

### 7.3 API Security Review
**[Task 49] Builder**: Review API security:
- Verify all authenticated endpoints check user roles
- Check rate limiting on public endpoints
- Ensure CORS configured correctly
- Verify no SQL injection vectors (use Prisma parameterized queries)
- Check XSS prevention (sanitize inputs)

**[Task 50] Validator**:
- Test unauthenticated access to protected endpoints (should return 401)
- Verify rate limits work: send 100 requests rapidly to public endpoint
- Check CORS: send OPTIONS request from foreign origin
- Attempt SQL injection in search/filter endpoints
- Test XSS: submit `<script>alert('XSS')</script>` in form fields

---

## Phase 8: Final Handover

### 8.1 Create Handover Package
**[Task 51] Builder**: Consolidate all documentation into `specs/` directory:
- Move/copy all specs to one location
- Create README.md in specs/ with index
- Zip archive: `specs-handover-$(date +%Y%m%d).zip`
- Generate PDF versions of key docs (optional)

**[Task 52] Validator**:
- Verify specs/ directory contains ≥ 8 documentation files
- Check specs/README.md exists with table of contents
- Verify zip archive created successfully
- Test extracting zip to verify integrity

---

### 8.2 Update Main README
**[Task 53] Builder**: Update `/README.md` with:
- Change status from "95% Complete" to "100% Production Ready"
- Update last updated date to today
- Add link to specs/ documentation
- Add "Handover Complete" badge
- Document final commit hash

**[Task 54] Validator**:
- Verify README.md status shows 100%
- Check date is current
- Verify all links work
- Confirm commit hash is valid: `git log -1 --format=%H`

---

### 8.3 Final Git Commit
**[Task 55] Builder**: Create final handover commit:
- Stage all changes: `git add .`
- Commit with message: `chore: Complete project handover - all API endpoints connected, documentation finalized`
- Add Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
- DO NOT push yet (awaiting user approval)

**[Task 56] Validator**:
- Run: `git status` - verify working tree clean
- Check: `git log -1` - verify commit message correct
- Verify commit includes all new files in specs/
- Count changed files: should be ≥ 15

---

## Phase 9: Deployment Readiness

### 9.1 Vercel Deployment Test
**[Task 57] Builder**: Prepare for Vercel deployment:
- Review vercel.json one final time
- Ensure all environment variables documented
- Create `vercel-env-template.txt` with all required env vars
- Document deployment steps in RUNBOOK.md

**[Task 58] Validator**:
- Verify vercel.json is valid JSON
- Check vercel-env-template.txt lists all 25+ variables
- Verify RUNBOOK.md has Vercel deployment section
- Confirm no hardcoded localhost URLs in code

---

### 9.2 Create Deployment Command
**[Task 59] Builder**: User will manually deploy via Vercel Dashboard:
- Document in RUNBOOK.md: "Go to Vercel Dashboard → Deployments → Redeploy"
- Verify Root Directory setting is blank (not apps/web)
- Confirm build command in Vercel matches vercel.json
- Note: Cannot automate due to previous CLI issues

**[Task 60] Validator**:
- Verify deployment instructions in RUNBOOK.md
- Check screenshot/instructions for Vercel Dashboard
- Confirm reminder about Root Directory setting
- Verify note about build command matches vercel.json

---

## Success Criteria

### Phase 1-3: API Endpoints ✅
- [ ] All TODO/FIXME items addressed
- [ ] 4 public API endpoints fully functional
- [ ] 4 dashboard API endpoints completed
- [ ] All endpoints tested and verified
- [ ] Stripe, email, Redis integrations working

### Phase 4: Deployment ✅
- [ ] vercel.json configured correctly
- [ ] Production build succeeds
- [ ] Deployment checklist created
- [ ] No conflicting config files

### Phase 5-6: Documentation & Testing ✅
- [ ] API reference documentation complete
- [ ] Database schema documented
- [ ] Runbook created
- [ ] Handover documentation complete
- [ ] All tests passing
- [ ] Smoke tests successful

### Phase 7: Security ✅
- [ ] 0 critical/high vulnerabilities
- [ ] No secrets in git history
- [ ] API security verified
- [ ] Rate limiting tested

### Phase 8-9: Handover ✅
- [ ] specs/ directory complete (8+ files)
- [ ] README updated to 100% complete
- [ ] Final commit created
- [ ] Deployment ready for Vercel

---

## Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: API Completion | 10 tasks | 2.5 hours |
| Phase 2: Dashboard APIs | 8 tasks | 1.5 hours |
| Phase 3: Integrations | 6 tasks | 1 hour |
| Phase 4: Deployment | 6 tasks | 45 mins |
| Phase 5: Documentation | 8 tasks | 1.5 hours |
| Phase 6: Testing | 6 tasks | 45 mins |
| Phase 7: Security | 6 tasks | 1 hour |
| Phase 8: Handover | 6 tasks | 30 mins |
| Phase 9: Deployment Prep | 4 tasks | 30 mins |
| **TOTAL** | **60 tasks** | **~8 hours** |

---

## Notes for Execution

1. **Sequential Execution**: Each Builder task MUST be followed by its Validator task before proceeding
2. **Failure Handling**: If Validator fails, Builder must fix and re-run validation
3. **Documentation**: All code changes should be documented inline
4. **Testing**: Never skip validation steps - they catch issues early
5. **Commit Strategy**: Commit after each completed phase, not individual tasks
6. **Communication**: Builder should log progress after each task completion

---

## Ready to Execute

This plan is ready for autonomous execution. Begin with **[Task 1] Builder** and proceed sequentially through all 60 tasks.

**Execution Mode**: Autonomous with validation gates
**Expected Completion**: 8 hours of focused work
**Output**: Production-ready platform with complete handover documentation

---

*Plan generated by Lead Architect Agent*
*Execution by Builder + Validator team*
