# DR-956: NRPG Hall receiving readiness

Source engineering owner: Phill McGurk; execution 06/10/2026. User authorised this inactive receiving slice and parallel issue resolution. Public collection, legal/supplier activation and deployed authority remain unapproved/unproven; this BUILD is not Approved for live activation and no DONE claim is made.

## RALPLAN-DR

Principles: reuse NRPG identity/data; deny missing authority; no outbound delivery; preserve separate Hall origin. Drivers: current tenant membership, immutable retries, recipient-specific consent. Options: call public contact (rejected: sends email/CRM); implement narrow existing-table transaction (selected: reversible, no schema). Antithesis: new receiving source still requires actual deployed role/policy testing. Acceptance: absent flag/profile/mock DB deny before access, forged/stale/unverified actor and recipient/product deny, immutable retries, HELD jobs cannot process/retry. Pre-mortem: stolen stale session (re-read membership); recipient consent reused (strict profile/product binding); generic queue forwards held job (process/retry guards).

Parallel lanes: existing Hall source reviewed separately; this NRPG identity/receiving lane; root independent verification/release lane. No author self-certifies independent review.

/api/hall/enquiries is same-origin nrpg.business only, with existing session/CSRF and fail-closed Redis limiter. Activation requires NRPG_HALL_RECEIVING_ENABLED=true plus reviewed NRPG_HALL_RECIPIENT_ORGANISATION_ID, NRPG_HALL_SOURCE_REVISION, NRPG_HALL_APPROVED_PRODUCT_IDS, NRPG_HALL_CATALOGUE_VERSION, NRPG_HALL_CONSENT_VERSION. Values are not retrieved or set here. Source revision must be a40hex commit. Approved product IDs must come from that reviewed CCW catalogue; no visitor/model can set profile. User must have current verified/active/unblocked identity in active tenant. USE_MOCK_DB denies activation.

ContactEnquiry owns contact/question data; BackgroundJob stores only scoped reference/hash/consent/product/provenance, not duplicate name/email/question. Existing retention/withdrawal reconciliation still requires staging validation. ContactEnquiry and BackgroundJob reused; HELD/HALL_ENQUIRY_HANDOFF records are not supplier delivery. No email/CRM/matching calls, paid model access, resource creation or migration. Supplier/outbound queue guards also reject FAILED/PENDING Hall jobs. No cross-origin token exchange or PII URL is introduced; existing /trade-hall redirect and cookie isolation stay intact. A same-origin consent UI/opaque-reference bridge and actual private staging database/session/policy proof are remaining gates, followed by independent same-SHA review and governed release.

Verification: focused Node-environment tests pass. Actual Prisma5.22 + disposable PostgreSQL17 full existing schema proves concurrent immutable retry, current member/tenant denial, forged scoped receipt denial and atomic rollback. No production RLS migration applied; superuser local tests do not establish deployed role/policies. Local container removed. After preparing the existing canvas native dependency, the complete web Jest suite passes (53 suites/547 tests). Web lint and type-check pass; production build passes and includes /api/hall/enquiries. Playwright synthetic loopback HTTP proof against the built route returns503/not_connected with database deliberately unreachable; server stopped afterwards. No skips introduced.

Independent review reproduced a manually PENDING Hall job starving two consecutive dequeues. getNextJob now excludes HALL_ENQUIRY_HANDOFF before priority selection; normal PENDING/RETRY selection stays unchanged. Actual PostgreSQL regression advances two normal jobs and then returns no eligible work while the unsupported Hall job remains excluded. This is worker safety, not delivery activation.

Guard-specific mutation evidence: disabled-flag test supplies every required profile field and downstream synthetic success; each missing-profile and mock-database test isolates only that guard. Removing any single activation predicate fails its named test; restored source bytes are identical. A fully configured synthetic control reaches201 so downstream fallback cannot mask missing guards.

## Hall identity exclusion

Hall member entry and enquiries reject Coach8 company identity, its verified ABN
62664157573 and coach8.com.au domain (including subdomains). The policy is fixed
in source and checks trusted current user, tenant and contractor/company records
before access, again inside the receiving transaction, and checks submitted
contact email before persistence. Public responses remain generic. This policy
does not block general NRPG registration or emergency services.

Anonymous public Hall browsing cannot establish an organisation identity. It
remains an unresolved access boundary; the restriction here applies to identified
NRPG Hall member entry and enquiry receiving, and is not live until governed
release and verification. No Coach8 data is deleted or migrated.

### Authenticated Hall viewing portal

Eligible active verified members enter at `/hall/view/index.html`. Anonymous
HTML entry redirects to the existing NRPG login with this one approved callback;
assets remain denied until authenticated. Blocked identity receives a generic
access denial without a sign-in loop. Every GET/HEAD rechecks trusted membership
and business identity before a request to the fixed approved Hall host.

Both hosts must receive `NRPG_HALL_PROXY_SECRET` (at least 32 UTF-8 bytes),
`NRPG_HALL_PRODUCER_ORIGIN=https://cleanexpo247-hall.vercel.app` and
`NRPG_HALL_ISSUER_ORIGIN=https://nrpg.business` through their existing approved
server credential configuration. No secret is supplied by the browser. Missing
or inconsistent binding fails closed. No production credentials or activation
are created by this source change.

The server sends two proof headers: base64url JSON with only version, GET/HEAD
method, exact pathname, approved audience, expiry (60 seconds) and random nonce;
HMAC-SHA256 signs that exact encoded header. The producer checks the signature,
exact path/method/audience and expiry (maximum 90 seconds). The shared synthetic
fixture verifies byte agreement between both implementations. The nonce is
random; there is no durable replay store and no replay-prevention claim.

The proxy forwards no member cookies, authorisation, business query parameters
or user identity. Only reviewed entry files and asset prefixes are proxied.
Queries, hidden/traversal/encoded paths, API writes and upstream redirects are
denied. Streaming output is private/no-store and drops upstream cookies and
proof headers. Legacy Hall links are rewritten into the authenticated portal.

This still requires independent review of both exact revisions, governed human
merge, approved host/key deployment and live eligible/excluded account tests.
The currently live anonymous direct Hall entry remains unverified as protected
until the matching producer middleware is deployed. General NRPG registration,
emergency services and free-text references to Coach8 are unaffected.
