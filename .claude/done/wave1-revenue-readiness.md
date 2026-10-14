# Done contract — Wave 1 revenue-readiness (DR-NRPG)

- Status: LOCKED (founder approved Wave 1 "go", 14/10/2026)
- Branch: `wave1/revenue-readiness` from `origin/main` @ `4d1d601a54049a6e622a5a7354b979a3785269dd`
- Builder: Claude (builder only). Independent review and release are run by the orchestrator.
- Out of scope: picking a contractor pricing model, live Stripe, prod DB/migrations, push/PR/deploy.

All commands run from `apps/web` unless noted. Node 20 (CI `NODE_VERSION: '20'`).

## 1. Unsupported claims neutralised

Acceptance:
- No "500+ contractors/professionals", "$45M+", "98% Client Satisfaction", "ISO 9001", "$45,000 in my first 3 months" / "$45k in 3 months", or "revenue increased 300%" renders on `/`, `/contractors`, `/join`, `/how-it-works`, `/training` or the contractor footer.
- The named persona testimonials and photos (`/join` ROI calculator stories, `/contractors` testimonials) and invented platform metrics no longer render.
- No replacement numbers, testimonials or credentials are invented; neutral copy only.

Proof:
- `pnpm exec jest src/__tests__/content/unsupported-claims.test.ts` (fails on the base commit, passes on HEAD).
- `grep -rnE "500\+ (contractors|verified)|'500\+'|45M|98%|ISO 9001|45,000 in|45k in|300% since" app/contractors app/how-it-works app/training "app/(contractor)/join" components/marketing/JoinNRPGSection.tsx components/marketing/ROICalculator.tsx components/contractor/layouts/ContractorFooter.tsx src/components/contractor/sections/ContractorHero.tsx` returns nothing.

## 2. SEO host = https://nrpg.business (apex)

Acceptance:
- `metadataBase` is `https://nrpg.business`.
- Every `alternates.canonical` in `app/` resolves to `https://nrpg.business` (no `disasterrecovery.com.au`, no `www.`).
- `robots.ts` `host`/`sitemap` and `sitemap.ts` URLs use `https://nrpg.business`.
- `next.config.mjs` 301-redirects `www.nrpg.business/*` to `https://nrpg.business/*`.

Proof:
- `pnpm exec jest src/__tests__/seo/site-host.test.ts`
- `grep -rnE "canonical: *[\"'\`]https://(disasterrecovery|www\.)" app` returns nothing.

## 3. Certification checkout

Acceptance:
- `POST /api/training/certification/checkout`: 401 unauthenticated; 403 non-CONTRACTOR; 503 "not available" when `STRIPE_NRPG_CERTIFICATION_PRICE_ID` or `STRIPE_SECRET_KEY` is unset (no Stripe call); 409 if already paid; otherwise a Stripe Checkout session (`mode: payment`, price from env, `metadata.type = NRPG_CERTIFICATION`) and a pending `OnboardingPayment` row.
- `GET` same path returns `{ configured, paid }` for the signed-in contractor.
- Stripe webhook `checkout.session.completed` with `metadata.type = NRPG_CERTIFICATION` and `payment_status = paid` marks the `OnboardingPayment` paid (idempotent; existing event idempotency kept).
- Module and quiz routes require a paid certification once checkout is configured; admins bypass; with checkout unconfigured access is unchanged (no lock-out).
- Contractor onboarding final step and the training dashboard show a certification CTA with a clear "not available yet" state when unconfigured.
- No live keys, no live Stripe calls, no schema change.

Proof:
- `pnpm exec jest src/__tests__/payments/certification-checkout.test.ts`

## 4. No PII in public-route logs

Acceptance:
- `app/api/public/claims/submit/route.ts` no longer logs client name/email; `public/client-feedback` and `newsletter/subscribe` no longer log name/email; `public/analytics/events` no longer logs IP address.

Proof:
- `pnpm exec jest src/__tests__/privacy/public-route-pii-logging.test.ts`

## 5. llms.txt corrected

Acceptance:
- `public/llms.txt` names `https://nrpg.business` as this site, contains no `contractors@nrpg.com.au`, no email addresses, no street/suburb location, and no unverified rating claims.

Proof:
- `pnpm exec jest src/__tests__/seo/site-host.test.ts` (llms.txt assertions).

## 6. GA4 conversion events

Precondition: GA4 client exists (`src/lib/analytics.ts` `trackEvent`, consent-gated via `AnalyticsProvider`).

Acceptance:
- `claim_submitted` fires after a successful claim submit; `contractor_signup` after successful contractor registration; `certification_purchase` when the server confirms the certification paid on return; `callout_paid` when the server confirms the callout paid. No PII in event params. Return-page events fire once per Stripe session.

Proof:
- `pnpm exec jest src/__tests__/analytics/conversion-events.test.ts`

## 7. /signup server-rendered value proposition

Acceptance:
- `app/signup/page.tsx` is a server component; served HTML contains the H1 and value-proposition copy; the interactive form still renders client-side.
- No contractor pricing copy added or changed.

Proof:
- `pnpm exec jest src/__tests__/content/signup-ssr.test.tsx`
- After build: `next start` then `curl -s localhost:3000/signup | grep -c "<h1"` ≥ 1.

## Repository definition of done (repo root)

- `python3 ~/.claude/skills/pr-release-gate/scripts/pr_release_gate.py provision`
- `pnpm run lint`, `pnpm run type-check`, `pnpm run check:au-english`, `pnpm run test`, `pnpm run build` (CI `ci.yml` jobs lint/test/build)
