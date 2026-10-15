# Secret Rotation Remediation Plan

**Date:** 2026-02-03
**Status:** 🚨 CRITICAL - IMMEDIATE ACTION REQUIRED
**Estimated Time:** 2-4 hours
**Priority:** P0 (BLOCKING PRODUCTION DEPLOYMENT)

---

## Executive Summary

Git secrets audit (BACKLOG-005) discovered **3 API keys and 2 critical secrets** exposed in git history. All exposed secrets MUST be rotated before production deployment.

**Exposed Secrets:**
1. 3x Google Gemini API keys
2. 1x CSRF secret
3. 1x Supabase JWT secret

**Impact:** Potential unauthorized AI API access, CSRF attacks, JWT forgery, and database access

**Action Required:** Rotate all secrets, update production environment, install preventive measures

---

## ⚠️ CRITICAL: Before You Begin

1. **Do NOT delete this file** - Keep as audit trail
2. **Document each step** - Add checkmarks as you complete
3. **Verify billing** - Check for unauthorized usage before rotating
4. **Coordinate deployment** - Notify team of planned downtime (if any)
5. **Take screenshots** - Document old/new keys for audit

---

## Step 1: Google Gemini API Key Rotation

### 1.1 Verify Unauthorized Usage

**Time:** 10 minutes
**Priority:** CRITICAL

1. Visit: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/metrics
2. Check billing dashboard for unusual spikes in:
   - Request volume
   - Data transfer
   - Cost increases
3. Review audit logs for unauthorized access:
   - IP addresses outside your organization
   - Unusual geographic locations
   - Time patterns (e.g., 3 AM requests)
4. **Document findings**: Screenshot any suspicious activity

**Checkboxes:**
- [ ] Reviewed billing dashboard
- [ ] Checked audit logs
- [ ] No unauthorized usage detected (or documented if found)
- [ ] Screenshots saved to `security-audit/gemini-billing-check-[date].png`

---

### 1.2 Rotate API Keys

**Time:** 15 minutes
**Priority:** CRITICAL

**Exposed Keys (DO NOT USE):**
```
Key 1: [REDACTED_REVOKED_GCP_KEY]
Key 2: [REDACTED_REVOKED_GCP_KEY]
Key 3: [REDACTED_REVOKED_GCP_KEY]
```

**Rotation Steps:**

1. **Generate new API key:**
   ```bash
   # Visit: https://makersuite.google.com/app/apikey
   # OR: https://console.cloud.google.com/apis/credentials

   # Click "Create Credentials" → "API Key"
   # Name: "DR-NRPG Production - 2026-02-03"
   # Copy the new key immediately
   ```

2. **Restrict the new key** (IMPORTANT):
   ```
   Application restrictions: HTTP referrers (web sites)
   Website restrictions:
     - https://disasterrecovery.com.au/*
     - https://*.vercel.app/* (for staging)

   API restrictions: Restrict key
   Select APIs:
     - Generative Language API
   ```

3. **Test new key locally:**
   ```bash
   # Update local .env.local. Replace YOUR_GEMINI_API_KEY with the new key before running.
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY

   # Test API call
   curl -X POST \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}" \
     -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'

   # Should return valid response (not error)
   ```

4. **Update production environment:**
   ```bash
   # Vercel CLI (recommended)
   vercel env add GEMINI_API_KEY production
   # Paste new key when prompted

   # OR via Vercel Dashboard:
   # https://vercel.com/[your-team]/dr-nrpg/settings/environment-variables
   # Edit GEMINI_API_KEY → Enter new value → Save
   ```

5. **Redeploy production:**
   ```bash
   # Trigger new deployment with updated env var
   vercel --prod

   # OR via Vercel Dashboard:
   # Deployments → [Latest] → Redeploy → Use existing Build Cache
   ```

6. **Verify new key works in production:**
   ```bash
   # Test contractor matching endpoint (uses Gemini)
   curl -X POST https://disasterrecovery.com.au/api/claims/[test-claim-id]/match-contractors \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer [test-token]"

   # Check logs for successful Gemini API calls
   vercel logs --prod
   ```

7. **Delete old keys:**
   ```bash
   # Visit: https://console.cloud.google.com/apis/credentials
   # Find each old key by name or value
   # Click "⋮" → "Delete"
   # Confirm deletion
   ```

**Checkboxes:**
- [ ] New API key generated
- [ ] New key restricted (HTTP referrers + API restrictions)
- [ ] Tested new key locally (successful response)
- [ ] Updated Vercel production environment variable
- [ ] Production redeployed with new key
- [ ] Verified new key works in production
- [ ] Old key #1 deleted from Google Cloud Console
- [ ] Old key #2 deleted from Google Cloud Console
- [ ] Old key #3 deleted from Google Cloud Console
- [ ] New key stored in password manager (1Password/LastPass)

---

## Step 2: CSRF Secret Rotation

### 2.1 Validate Operator-Supplied CSRF Secret

Do not generate, store, or display a credential in this document. Supply it from secure operator input, then validate its shape before any provider or network action:

```bash
if [ -z "${CSRF_SECRET:-}" ]; then
  echo "CSRF_SECRET must be supplied through secure operator input" >&2
  exit 1
fi
if ! [[ "${CSRF_SECRET}" =~ ^[a-fA-F0-9]{64}$ ]]; then
  echo "CSRF_SECRET must contain exactly 64 hexadecimal characters" >&2
  exit 1
fi
export CSRF_SECRET
# The deployment platform prompts securely; do not place the value on the command line.
vercel env add CSRF_SECRET production
```

Non-executable documentation placeholder: `<64-hex-secret>`. No generation, deployment, or verification is established by this plan.

### 2.2 Invalidate Existing CSRF Tokens

**Time:** 5 minutes
**Priority:** MEDIUM

**Impact:** All active CSRF tokens will be invalidated. Users with open forms may need to refresh.

1. **Notify team** (optional):
   ```
   Subject: Scheduled CSRF token refresh - Feb 3, 2026
   Body: CSRF secret has been rotated for security.
         Users may need to refresh forms if they see CSRF errors.
         Expected duration: < 5 minutes of potential form errors.
   ```

2. **Monitor for CSRF errors:**
   ```bash
   # Check Sentry for CSRF validation errors
   # https://sentry.io/organizations/[org]/issues/?query=csrf

   # Should see temporary spike, then normalize
   ```

3. **Clear Redis cache** (if using Redis for CSRF tokens):
   ```bash
   # If you have Redis configured for session storage
   redis-cli FLUSHDB

   # OR via code (safer - only CSRF tokens):
   # Add to admin panel or run as migration
   ```

**Checkboxes:**
- [ ] Team notified of CSRF token refresh (if needed)
- [ ] Monitoring configured for CSRF errors
- [ ] CSRF token cache cleared (if applicable)
- [ ] No spike in CSRF errors beyond 5 minutes

---

## Step 3: Supabase JWT Secret Rotation

### 3.1 Contact Supabase Support

**Time:** 30-60 minutes (includes wait time)
**Priority:** CRITICAL

**Exposed Secret (DO NOT USE):**
```
<SUPABASE-ANON-JWT-REDACTED>
```

**Rotation Steps:**

1. **Open Supabase support ticket:**
   ```
   To: support@supabase.io
   Subject: URGENT: JWT Secret Rotation Request - Security Incident

   Body:
   We have discovered our JWT secret was exposed in our git history
   and require immediate rotation.

   Project: [Your Supabase Project ID]
   Organization: [Your Org Name]
   Priority: CRITICAL

   Request:
   1. Rotate JWT secret immediately
   2. Provide new JWT secret for production environment
   3. Confirm old secret is revoked
   4. Provide timeline for rotation completion

   We understand this will invalidate all active user sessions.
   We are prepared to force re-authentication.

   Please respond within 2 hours if possible.

   Security Contact: [Your email]
   Phone: [Your phone] (for urgent callback)
   ```

2. **While waiting for Supabase support:**
   ```bash
   # Review Supabase audit logs for unauthorized access
   # https://app.supabase.com/project/[project-id]/logs/explorer

   # Look for:
   # - Unusual authentication patterns
   # - Database queries from unknown IPs
   # - Failed authentication attempts (brute force)
   # - Data exports or downloads
   ```

3. **Document findings:**
   ```bash
   # Create audit report
   # File: security-audit/supabase-access-review-[date].md

   # Include:
   # - Screenshot of audit logs
   # - List of suspicious IPs (if any)
   # - Unusual query patterns
   # - Any data access outside business hours
   ```

**Checkboxes:**
- [ ] Support ticket opened with Supabase
- [ ] Audit logs reviewed for unauthorized access
- [ ] Suspicious activity documented (or confirmed none)
- [ ] Screenshots saved to security-audit/supabase-audit-[date].png

---

### 3.2 Apply New JWT Secret (After Supabase Response)

**Time:** 15 minutes
**Priority:** CRITICAL
**Dependency:** Supabase support provides new secret

1. **Receive new JWT secret from Supabase:**
   ```bash
   # Supabase will provide new secret via:
   # - Email response to support ticket
   # - Updated project settings in dashboard
   # - Phone call (if urgent)
   ```

2. **Update local environment:**
   ```bash
   # .env.local
   SUPABASE_JWT_SECRET=[NEW_SECRET_FROM_SUPABASE]
   ```

3. **Update production environment:**
   ```bash
   vercel env add SUPABASE_JWT_SECRET production
   # Paste new secret from Supabase
   ```

4. **Redeploy production:**
   ```bash
   vercel --prod
   ```

5. **Force user re-authentication:**
   ```sql
   -- Connect to Supabase database
   -- https://app.supabase.com/project/[project-id]/sql

   -- Invalidate all existing sessions
   DELETE FROM auth.sessions;

   -- Optional: Clear refresh tokens
   DELETE FROM auth.refresh_tokens;
   ```

6. **Notify users** (email template):
   ```
   Subject: Action Required: Please Sign In Again

   Dear [User],

   We have updated our security infrastructure and all users
   are required to sign in again.

   This is a routine security measure and your account remains secure.

   Please visit: https://disasterrecovery.com.au/login

   If you experience any issues signing in, please contact:
   support@disasterrecovery.com.au

   Thank you for your understanding.

   DR-NRPG Security Team
   ```

7. **Verify new JWT secret works:**
   ```bash
   # Test authentication flow
   curl -X POST https://disasterrecovery.com.au/api/auth/signin \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpass123"}'

   # Should return valid JWT token
   # Decode token to verify signature
   # https://jwt.io/
   ```

**Checkboxes:**
- [ ] New JWT secret received from Supabase support
- [ ] Confirmed old secret is revoked by Supabase
- [ ] Updated local .env.local with new secret
- [ ] Updated Vercel production environment
- [ ] Production redeployed
- [ ] All user sessions invalidated (DELETE FROM auth.sessions)
- [ ] User notification email sent (if applicable)
- [ ] Verified new JWT works (successful sign-in test)
- [ ] New secret stored in password manager

---

## Step 4: Install Preventive Measures

### 4.1 Install git-secrets Pre-commit Hook

**Time:** 10 minutes
**Priority:** HIGH

**Purpose:** Prevent future secret commits

1. **Install git-secrets:**
   ```bash
   # Windows (using chocolatey)
   choco install git-secrets

   # OR download from:
   # https://github.com/awslabs/git-secrets/releases
   # Extract to C:\Program Files\Git\usr\bin\
   ```

2. **Initialize git-secrets in repository:**
   ```bash
   cd "D:\Disaster Recovery - NRP"

   # Install hooks
   git secrets --install

   # Should output:
   # ✓ Installed commit-msg hook to .git/hooks/commit-msg
   # ✓ Installed pre-commit hook to .git/hooks/pre-commit
   ```

3. **Configure secret patterns:**
   ```bash
   # Add patterns to detect API keys
   git secrets --add 'AIza[0-9A-Za-z\-_]{35}'  # Google API keys
   git secrets --add '[a-f0-9]{64}'            # CSRF secrets (64 hex)
   git secrets --add 'Bearer [A-Za-z0-9\-_\.]+' # JWT tokens
   git secrets --add 'sk_live_[0-9a-zA-Z]{24}' # Stripe live keys
   git secrets --add 'sk_test_[0-9a-zA-Z]{24}' # Stripe test keys
   git secrets --add 'SUPABASE_[A-Z_]+='       # Supabase env vars

   # Add common secret keywords
   git secrets --add --allowed 'password|secret|token|api_key|private_key'
   ```

4. **Test git-secrets with an ephemeral positive fixture:**
   ```bash
   set -eu
   if ! command -v git-secrets >/dev/null 2>&1; then
     echo "git-secrets is not installed" >&2
     exit 1
   fi
   if ! git secrets --list | grep -F 'AIza' >/dev/null; then
     echo "Google API-key detection is not configured" >&2
     exit 1
   fi
   fixture=$(mktemp)
   trap 'rm -f "$fixture"' EXIT
   suffix=$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9_-' | cut -c1-35)
   test "${#suffix}" -eq 35
   printf 'GEMINI_API_KEY=AIza%s\n' "$suffix" > "$fixture"
   if scan_output=$(git secrets --scan "$fixture" 2>&1); then
     echo "git-secrets failed to reject the synthetic fixture" >&2
     exit 1
   fi
   case "$scan_output" in
     *"$fixture:1:"*) ;;
     *)
       echo "git-secrets failed without identifying the synthetic fixture" >&2
       exit 1
       ;;
   esac
   echo "git-secrets explicitly identified the ephemeral synthetic fixture"
   ```

5. **Scan existing repository** (optional - already done):
   ```bash
   # This will re-scan git history (takes time)
   git secrets --scan-history
   ```

**Checkboxes:**
- [ ] git-secrets installed on local machine
- [ ] git-secrets hooks installed in repository
- [ ] Secret patterns configured (API keys, tokens, etc.)
- [ ] git-secrets tested (blocked test secret commit)
- [ ] Repository scan completed (no new secrets found)

---

### 4.2 Configure CI/CD Secret Scanning

**Time:** 15 minutes
**Priority:** MEDIUM

**Purpose:** Catch secrets before they reach production

1. **Add GitHub Actions workflow:**
   ```yaml
   # .github/workflows/security-scan.yml
   name: Security Scan

   on:
     pull_request:
       branches: [main, develop]
     push:
       branches: [main]

   jobs:
     secret-scan:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
           with:
             fetch-depth: 0  # Full history for scanning

         - name: Install git-secrets
           run: |
             git clone https://github.com/awslabs/git-secrets.git
             cd git-secrets
             sudo make install

         - name: Configure git-secrets
           run: |
             git secrets --install
             git secrets --add 'AIza[0-9A-Za-z\-_]{35}'
             git secrets --add '[a-f0-9]{64}'
             git secrets --add 'Bearer [A-Za-z0-9\-_\.]+'
             git secrets --add 'sk_live_[0-9a-zA-Z]{24}'
             git secrets --add 'SUPABASE_[A-Z_]+='

         - name: Scan for secrets
           run: |
             git secrets --scan-history || exit 1
   ```

2. **Enable GitHub secret scanning** (if repo is private):
   ```bash
   # Visit: https://github.com/CleanExpo/DR-NRPG/settings/security_analysis
   # Enable:
   # - Dependency graph
   # - Dependabot alerts
   # - Dependabot security updates
   # - Secret scanning (requires GitHub Advanced Security for private repos)
   ```

3. **Add .gitignore patterns:**
   ```bash
   # Ensure these are in .gitignore
   echo ".env" >> .gitignore
   echo ".env.local" >> .gitignore
   echo ".env.production" >> .gitignore
   echo "*.pem" >> .gitignore
   echo "*.key" >> .gitignore
   echo "*.p12" >> .gitignore
   ```

**Checkboxes:**
- [ ] GitHub Actions workflow created (security-scan.yml)
- [ ] Workflow tested on test branch (verified it blocks secrets)
- [ ] GitHub secret scanning enabled (if available)
- [ ] .gitignore patterns updated

---

## Step 5: Verification & Testing

### 5.1 Verify Revocation and Replacement Without Exposing Values

Require both credentials from secure operator input and fail before any network request when either is absent:

```bash
if [ -z "${OLD_GEMINI_API_KEY:-}" ] || [ -z "${NEW_GEMINI_API_KEY:-}" ]; then
  echo "Both OLD_GEMINI_API_KEY and NEW_GEMINI_API_KEY must be set" >&2
  exit 1
fi

old_status=$(curl -sS -o /dev/null -w '%{http_code}' \
  -H "x-goog-api-key: ${OLD_GEMINI_API_KEY}" \
  "https://generativelanguage.googleapis.com/v1beta/models")
new_status=$(curl -sS -o /dev/null -w '%{http_code}' \
  -H "x-goog-api-key: ${NEW_GEMINI_API_KEY}" \
  "https://generativelanguage.googleapis.com/v1beta/models")

if [ "$old_status" != "403" ] || [ "$new_status" != "200" ]; then
  echo "Gemini revocation/replacement verification failed" >&2
  exit 1
fi
echo "Gemini revocation/replacement status verified without printing credentials"
```

- [ ] Secure operator supplied both values
- [ ] Old credential returned the expected revoked status
- [ ] New credential returned the expected active status
- [ ] Neither credential was printed, committed, or written to a file

### 5.2 End-to-End Production Testing

**Time:** 20 minutes
**Priority:** HIGH

**Test all critical flows that use rotated secrets:**

1. **Test contractor matching (uses Gemini API):**
   ```bash
   # Submit test claim
   curl -X POST https://disasterrecovery.com.au/api/claims \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer [admin-token]" \
     -d '{
       "disasterType": "Water Damage",
       "location": { "postcode": "2000", "state": "NSW" },
       "description": "Test claim for Gemini verification"
     }'

   # Wait for matching job to process (check logs)
   vercel logs --prod | grep "Contractor Matching"

   # Verify contractors matched (should see Gemini API calls)
   # Expected: Successful match with 5 contractors
   ```

2. **Test authentication (uses CSRF + Supabase JWT):**
   ```bash
   # Test sign-in flow
   curl -X POST https://disasterrecovery.com.au/api/auth/signin \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@test.com",
       "password": "TestPassword123!"
     }'

   # Expected: Valid JWT token returned
   # Decode token at https://jwt.io/ to verify signature
   ```

3. **Test form submission (uses CSRF):**
   ```bash
   # Get CSRF token
   curl https://disasterrecovery.com.au/api/auth/csrf

   # Submit form with CSRF token
   curl -X POST https://disasterrecovery.com.au/api/contact \
     -H "Content-Type: application/json" \
     -H "X-CSRF-Token: [token-from-above]" \
     -d '{"name":"Test","email":"test@test.com","message":"CSRF test"}'

   # Expected: 200 OK (not 403 CSRF error)
   ```

4. **Monitor error rates:**
   ```bash
   # Check Sentry for errors in last hour
   # https://sentry.io/organizations/[org]/issues/?query=is:unresolved&statsPeriod=1h

   # Look for:
   # - Gemini API errors (should be 0)
   # - CSRF validation errors (should be minimal, only from old tokens)
   # - JWT verification errors (should be 0 after users re-authenticate)
   ```

**Checkboxes:**
- [ ] Contractor matching works (Gemini API calls successful)
- [ ] User sign-in works (JWT tokens valid)
- [ ] Form submissions work (CSRF validation passing)
- [ ] No spike in error rates (Sentry clean)
- [ ] Production logs show no secret-related errors

---

## Step 6: Documentation & Audit Trail

### 6.1 Update Security Documentation

**Time:** 10 minutes
**Priority:** MEDIUM

1. **Update SECURITY-AUDIT.md:**
   ```bash
   # Add remediation completion section

   ## Remediation Completed - [Date]

   All exposed secrets have been rotated:
   - ✅ Gemini API keys rotated (3 keys)
   - ✅ CSRF secret rotated
   - ✅ Supabase JWT secret rotated
   - ✅ Production environment updated
   - ✅ Old secrets revoked
   - ✅ git-secrets installed

   Status: 🟢 RESOLVED
   Production Deployment: ✅ UNBLOCKED
   Next Review: [Date + 90 days]
   ```

2. **Update BACKLOG.md:**
   ```bash
   # Mark BACKLOG-005 as complete

   ### BACKLOG-005: Environment Variable & Secrets Audit ✅ COMPLETE
   - Status: 🟢 COMPLETED
   - All secrets rotated successfully
   - Preventive measures installed (git-secrets)
   - Production deployment UNBLOCKED
   ```

3. **Create incident report:**
   ```bash
   # File: security-audit/incident-report-2026-02-03.md

   # Include:
   # - Timeline of discovery
   # - List of exposed secrets
   # - Impact assessment (unauthorized usage found or not)
   # - Remediation steps taken
   # - Preventive measures implemented
   # - Lessons learned
   ```

**Checkboxes:**
- [ ] SECURITY-AUDIT.md updated with remediation completion
- [ ] BACKLOG.md marked as complete
- [ ] Incident report created and filed
- [ ] Team notified of resolution

---

### 6.2 Password Manager Storage

**Time:** 5 minutes
**Priority:** HIGH

**Store all new secrets in password manager:**

1. **Create secure notes in 1Password/LastPass:**
   ```
   The placeholders below are labels only. Never store these literal values as credentials.

   Title: DR-NRPG Production Secrets - 2026-02-03

   GEMINI_API_KEY: <new-gemini-api-key>
   CSRF_SECRET: <set-via-secure-operator-input>
   SUPABASE_JWT_SECRET: [new-secret-from-supabase]

   Rotation Date: 2026-02-03
   Next Rotation: 2026-05-03 (90 days)
   Rotated By: [Your Name]
   Reason: Git history exposure (BACKLOG-005)
   ```

2. **Set rotation reminder:**
   ```
   # Add calendar event:
   Title: Rotate Production Secrets (Quarterly)
   Date: 2026-05-03
   Recurrence: Every 90 days
   Description: Rotate all production API keys and secrets
                as part of security best practices.
   ```

**Checkboxes:**
- [ ] All new secrets stored in password manager
- [ ] Rotation date documented
- [ ] Next rotation reminder set (90 days)
- [ ] Emergency access configured (for team leads)

---

## Step 7: Final Verification Checklist

**Complete ALL items before marking remediation as DONE:**

### Production Environment
- [ ] All 3 Gemini API keys deleted from Google Cloud Console
- [ ] New Gemini API key active and restricted (HTTP referrers + API limits)
- [ ] CSRF secret rotated (64 hex characters)
- [ ] Supabase JWT secret rotated (confirmed by Supabase support)
- [ ] All production environment variables updated in Vercel
- [ ] Production redeployed with new secrets
- [ ] Old secrets return 403/401 errors (revoked)
- [ ] New secrets work in production (tested)

### Security Measures
- [ ] git-secrets installed on local machine
- [ ] git-secrets pre-commit hook active in repository
- [ ] Secret patterns configured (API keys, tokens, etc.)
- [ ] CI/CD secret scanning workflow added (.github/workflows/security-scan.yml)
- [ ] .gitignore updated (.env files, keys, certificates)

### Testing & Verification
- [ ] Contractor matching tested (Gemini API working)
- [ ] User authentication tested (JWT working)
- [ ] Form submissions tested (CSRF validation working)
- [ ] No unauthorized API usage found in billing dashboards
- [ ] No spike in error rates (Sentry clean)
- [ ] Production logs show no secret-related errors

### Documentation & Audit
- [ ] SECURITY-AUDIT.md updated (remediation complete)
- [ ] BACKLOG.md marked as complete (BACKLOG-005 done)
- [ ] Incident report created (security-audit/incident-report-[date].md)
- [ ] All new secrets stored in password manager
- [ ] Next rotation reminder set (90 days)
- [ ] Team notified of resolution
- [ ] This REMEDIATION-PLAN.md archived for audit trail

---

## Post-Remediation Actions

**After completing all steps above:**

1. **Update project status:**
   ```bash
   Platform Status: 🟢 PRODUCTION READY (was: DEPLOYMENT BLOCKED)
   Security Status: ✅ PASS (was: CRITICAL)
   ```

2. **Notify stakeholders:**
   ```
   Subject: Security Remediation Complete - Production Unblocked

   The security incident discovered on 2026-02-03 has been fully remediated.

   Actions Taken:
   - All exposed secrets rotated
   - Preventive measures installed (git-secrets)
   - Production environment secured
   - Testing completed successfully

   Status: Production deployment is now UNBLOCKED
   Next Steps: Proceed with launch preparations

   Full details: See REMEDIATION-PLAN.md
   ```

3. **Schedule security review:**
   ```
   # Add to calendar:
   Title: Security Review - Post-Remediation
   Date: [1 week after remediation]
   Attendees: Security team, DevOps, Product Owner
   Agenda:
     - Review incident timeline
     - Discuss lessons learned
     - Evaluate preventive measures
     - Update security policies
   ```

---

## Estimated Timeline

| Step | Task | Time | Can Parallelize? |
|------|------|------|------------------|
| 1.1 | Verify Gemini billing | 10 min | Yes |
| 1.2 | Rotate Gemini keys | 15 min | No (sequential) |
| 2.1 | Generate CSRF secret | 5 min | Yes |
| 2.2 | Invalidate CSRF tokens | 5 min | No (after 2.1) |
| 3.1 | Contact Supabase support | 30-60 min | Yes (wait time) |
| 3.2 | Apply Supabase JWT secret | 15 min | No (after 3.1 response) |
| 4.1 | Install git-secrets | 10 min | Yes |
| 4.2 | Configure CI/CD scanning | 15 min | Yes |
| 5.1 | Verify rotation | 15 min | No (after all rotations) |
| 5.2 | End-to-end testing | 20 min | No (after 5.1) |
| 6.1 | Update documentation | 10 min | Yes |
| 6.2 | Password manager storage | 5 min | Yes |
| **TOTAL** | | **2-4 hours** | |

**Fastest Path (Parallelized):**
- Start Steps 1.1, 2.1, 3.1, 4.1, 4.2 simultaneously → 30 min
- Complete Step 1.2 → +15 min (45 min total)
- Complete Steps 2.2, 6.2 → +5 min (50 min total)
- Wait for Supabase response → +30-60 min (80-110 min total)
- Complete Step 3.2 → +15 min (95-125 min total)
- Complete Steps 5.1, 5.2 → +35 min (130-160 min total)
- Complete Step 6.1 → +10 min (140-170 min total)
- **Total: ~2.5-3 hours** (if Supabase responds quickly)

---

## Emergency Contacts

**If you encounter issues during remediation:**

- **Google Cloud Support:** https://cloud.google.com/support
- **Supabase Support:** support@supabase.io (or Slack if enterprise)
- **Vercel Support:** https://vercel.com/support (or dashboard chat)
- **Security Team Lead:** [Your contact]
- **DevOps Team:** [Your contact]

---

## Rollback Plan

**If remediation causes production issues:**

1. **Immediate rollback:**
   ```bash
   # Revert to previous Vercel deployment
   vercel rollback

   # Temporarily re-enable old secrets (EMERGENCY ONLY)
   # Add old secrets back to environment (DO NOT COMMIT)
   # This gives you time to diagnose the issue
   ```

2. **Diagnose issue:**
   ```bash
   # Check error logs
   vercel logs --prod

   # Check Sentry for errors
   # https://sentry.io/...

   # Test specific endpoint that's failing
   curl -v https://disasterrecovery.com.au/api/[failing-endpoint]
   ```

3. **Fix and retry:**
   ```bash
   # Fix issue (e.g., typo in new secret)
   # Re-run affected remediation step
   # Test locally before redeploying
   # Redeploy to production
   vercel --prod
   ```

---

## Success Criteria

**Remediation is COMPLETE when:**

- ✅ All 7 steps have checkboxes marked as done
- ✅ Old secrets return errors (revoked)
- ✅ New secrets work in production (tested)
- ✅ No spike in error rates (Sentry clean)
- ✅ git-secrets blocks test secret commits
- ✅ Documentation updated (SECURITY-AUDIT.md, BACKLOG.md)
- ✅ Team notified
- ✅ Production status: 🟢 UNBLOCKED

---

**Last Updated:** 2026-02-03
**Owner:** Security Team
**Approver:** [Security Lead Name]
**Status:** 🟡 PENDING EXECUTION

---

**⚠️ IMPORTANT:** Do NOT delete this file after remediation is complete. Keep it as part of the security audit trail for compliance and future reference.
