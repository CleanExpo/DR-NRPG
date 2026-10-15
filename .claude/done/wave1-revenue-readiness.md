# Done contract — Wave 1 revenue-readiness (DR-NRPG)

- Status: LOCKED (founder approved Wave 1 "go", 14/10/2026). Revision 2, 14/10/2026: acceptance tightened per independent review `DR-NRPG-review-1.json` (5 × P1). Revision 3, 14/10/2026: per `DR-NRPG-review-2.json` (4 × P1). Revision 4, 14/10/2026: per `DR-NRPG-review-3.json` (1 × P1, host migration across all public pages). Revision 5, 14/10/2026: per `DR-NRPG-review-4.json` (1 × P1, payment/redirect URL builders). Revision 6, 14/10/2026: per `DR-NRPG-review-5.json` (P0 email-guard coverage, P1 white-label tenant returns); scope unchanged.
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
- `next.config.mjs` permanently redirects `www.nrpg.business/*` to `https://nrpg.business/*` (Next emits 308).
- Every page/layout under `app/` (all public routes, not only files this branch changed) and the shared URL builders (`components/`, `src/components/`, `lib/seo`, `lib/geo/templates`, `lib/geo/sitemap`) emit canonical, og:url, authors and JSON-LD URLs derived from `SITE_URL` — none on `disasterrecovery.com.au` or `www.nrpg.business` in exported metadata or rendered HTML. (Legal body text and the waitlist email body are out of scope: founder/legal input.)

Proof:
- `pnpm exec jest src/__tests__/seo/site-host.test.ts`
- Rendered HTML, against `next start -p 3123` on the build (dummy unreachable `DATABASE_URL`):
  `for p in / /about /services /services/tasmania /cyclone-alfred-queensland-2025 /emergency-finance /insurance-claim-advocate /locations /contractors /how-it-works /signup /training /community /data /events /find-a-contractor /guides /store /tools; do curl -s localhost:3123$p | grep -oE '(content|href)="https?://[^"]*"|"(url|item|@id)":"https?://[^"]*"' | grep -E 'disasterrecovery\.com\.au|www\.nrpg\.business' | sed "s#^#$p #"; done` prints nothing.
- `grep -rnE "canonical: *[\"'\`]https://(disasterrecovery|www\.)" app` returns nothing.

## 3. Certification checkout

Acceptance:
- `POST /api/training/certification/checkout`: 401 unauthenticated; 403 non-CONTRACTOR; 503 "not available" when `STRIPE_NRPG_CERTIFICATION_PRICE_ID` or `STRIPE_SECRET_KEY` is unset (no Stripe call); 409 if already paid; otherwise a Stripe Checkout session (`mode: payment`, price from env, `metadata.type = NRPG_CERTIFICATION`) and a pending `OnboardingPayment` row.
- `GET` same path returns `{ configured, paid }` for the signed-in contractor.
- `GET ?session_id=` returns `sessionPaid: true` only when that exact session is the signed-in contractor's paid certification payment.
- Stripe webhook grants the entitlement only for a session this app created: a pending `OnboardingPayment` row with that `stripeSessionId`, the same contractor in `metadata.contractorId`, `client_reference_id` and the row, `mode = payment`, `payment_status = paid`, matching amount and currency, and exactly one line item whose price is `STRIPE_NRPG_CERTIFICATION_PRICE_ID`. Unknown, wrong-price, wrong-amount, unpaid, wrong-mode or wrong-contractor sessions are ignored and logged by session id only; replays are no-ops. No row is ever created from webhook data.
- Certification payment rows are identified only by an id prefixed `nrpg-cert_` plus the statuses `certification_pending` / `certification_paid`; a pre-existing paid `OnboardingPayment` row never counts as the certification (GET `paid`/`sessionPaid`, POST 409 guard, training gate).
- Every customer-facing return/redirect URL (Stripe success/cancel/return/refresh for certification, callout, store, Connect onboarding, subscriptions, realtime billing and tenant billing; client onboarding next-phase/resume links; auth verification/reset and notification email links) is built from a trusted origin: the signed-in user's own tenant domain/subdomain read from the database (`lib/tenant-return-origin.ts`), else `SITE_URL` — never from `NEXT_PUBLIC_*_URL`/`NEXTAUTH_URL`, the request Host/Origin, `x-tenant-*` headers, or the sibling/www host. Client-supplied subscription return URLs are honoured only on exactly that tenant origin or `SITE_URL`. Proof additionally: `src/__tests__/payments/tenant-return-origin.test.ts`. Proof: `src/__tests__/payments/redirect-urls.test.ts` (absent and poisoned env, spoofed Host/Origin) and the redirect-builder scan in `site-host.test.ts`.
- Grandfathering resolves `Contractor.id` from `User.id` for `NRPGTrainingProgress`; a non-placeholder `ContractorOnboarding` started before the cut-off also counts.
- Module, quiz and progress routes require a paid certification only when checkout is configured AND `NRPG_CERTIFICATION_PAYWALL_ACTIVATED_AT` (recorded ISO cut-off) is set. Contractors with `NRPGTrainingProgress` or an NRP `ContractorCertification` created before the cut-off are grandfathered; admins bypass; otherwise access is unchanged.
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
- `pnpm run db:generate`, `pnpm run lint`, `pnpm run type-check`, `pnpm run check:au-english`, `CIRCLE_NODE_TOTAL=2 pnpm run build` (CI `ci.yml` jobs lint/build)
- Tests, clean environment, **exactly the command CI's `test` job runs** (`.github/workflows/ci.yml` job `test`: `pnpm install --frozen-lockfile`, `pnpm run db:generate`, `pnpm run test` with its four env vars):
  `env -i HOME="$HOME" PATH="$PATH" TERM=dumb env NEXTAUTH_SECRET=test-secret-for-ci NEXTAUTH_URL=http://localhost:3000 CSRF_SECRET=test-csrf-secret-for-ci-minimum-32-chars JWT_SECRET=test-jwt-secret-for-ci-minimum-32-chars pnpm run test`
  This legitimately compiles the app first: `pnpm run test` is `turbo run test`, and `turbo.json` makes `test` depend on `build`. It is run as-is (under `flock /code/.heavy.lock` in the shared sandbox). CI is not edited.
