# NRPG Hall member flow — inactive source slice

Owner Phill McGurk, execution 06/10/2026. Branch codex/nrpg-hall-member-handoff depends on **unmerged receiving candidate fd691338c7eb5cd106d13c80b47c7b67af0938e0**. Freshly fetched authoritative main is 2b4c86d543730db67f6edeb1c263101ebcd7d91b. **No push/PR before the receiving dependency's human merge, current-main rebase and every exact-final-SHA release gate.** No live/DONE claim, deployment, collection, outreach, schema operation or paid request occurs.

## RALPLAN-DR

Principles: NRPG owns identity and receiving; existing CSRF/forms/store reused; no cross-origin credentials; acknowledgement only after scoped durable source receipt. Drivers: avoid an unreviewed Hall producer, preserve immutable retry identity, deny unsupported/expired/replayed state. Options: automatic cross-origin postMessage draft exchange (held: no authorised producer/transfer-consent bridge); fixed NRPG member page (selected: smallest reviewable source, no cookies/contact in URLs). Antithesis: members must re-enter their Hall enquiry, so this does not complete automatic Hall handoff. Acceptance: off profile causes no DB check; unverified member cannot see form; wrong origin/consent/owner injection/expiry/replay/stale receipt deny; source reply must match current event and held record. Pre-mortem: stale UI response (in-flight generation and event binding), unsafe login redirect (exact /hall/enquiry only), receiver off (explicit not-connected message, no fake submitted status).

Parallel lanes: immutable receiving/review lane, isolated member UI lane, root release orchestration. Live approval remains held; this is authorised local source preparation.

## Reuse and limitations

/hall/enquiry is a fixed NRPG-owned member page. It reuses getServerSession/current-user-and-tenant verification, existing CsrfProtectedForm and UI primitives, and the receiving profile/env gates. Existing login gains only a whitelisted exact /hall/enquiry return; no arbitrary callback URL is accepted. The page and submitter never forward NRPG cookies, session/token or user/tenant data to Hall; they have no message listener/automatic draft transfer. No personal data goes into a URL. The actual Hall producer/link is not changed in this lane; existing NRPG /trade-hall redirect remains unchanged.

The first UI slice labels exactly three existing Hall catalogue products (TotalCheck, TechCheck, deep-wall probe), without price, stock or suitability claims. Profile IDs outside these labels keep the page off rather than inventing names. Additional catalogue UI must reuse a reviewed registry feed before widening this slice. Profile/source/consent values are not set or retrieved here.

Source ContactEnquiry/BackgroundJob stay authoritative. Receipt adds validated eventId and the existing immutable payloadHash for UI correlation. The browser recomputes the exact canonical fingerprint (including reviewed source/catalogue provenance), and rejects an acknowledgement for a different payload. Client transmits only to relative /api/hall/enquiries with same-origin credentials and existing CSRF header; it rejects extra owner fields. Confirmation is unticked by default, marketing is not granted. Five-minute confirmation window, one-use per-request nonce, immutable event retry, current in-flight generation and exact matching held receipt prevent stale/replayed acknowledgement. No acknowledgement is sent to Hall. Contact/question are held only in the current browser form until source receiving; no extra localStorage/lead store is created.

## Remaining gates

Automatic Hall draft transfer needs a reviewed producer and explicit transfer consent plus exact origin/source/nonce/expiry/replay contract. Current fixed-link member flow does not claim those messages work. Verified staging member/operator/current-tenant/database-role/RLS/retention/witness proof and receiving-profile activation remain held. Actual supplier delivery is unsupported/HELD and excluded from dequeue/process/retry. This lane cannot release around its unmerged dependency. Human merge and current-main rebase precede fresh tests, independent second-agent PASS and mandatory CI mirror, then hosted checks/public deployment authority and live verification.

## Clean dependency correction

The isolated web build exposed a direct runtime import of @langchain/langgraph-checkpoint without a declared web dependency. Version 1.0.1 already exists in the locked transitive graph. This branch declares that exact existing version directly and updates the web importer; it does not introduce hoisting, symlinks or parent build artefacts.

## Local candidate evidence

Node 20.20.2: full repository test gate passed, web 56 suites/556 tests; repository lint passed; repository type-check passed (3 tasks); Australian-English gate passed. Actual web production compilation passed (48s, all 946 pages) as the repository test prerequisite; repository build then passed using those exact outputs (2 cached tasks). An earlier overlapping build/test attempt collided on generated .next files and is invalid evidence; the later single build completed successfully.

Actual Prisma 5.22 with full schema in isolated loopback PostgreSQL 17 passed concurrent immutable receiving retries, event/payload receipt correlation, current tenant/member denial, forged replay denial, atomic rollback and HELD/PENDING queue starvation prevention. The disposable container was stopped. This does not prove estate RLS or supplier delivery.

Local production HTTP Playwright proof passed 2 tests: receiving returns 503/not_connected and /hall/enquiry is inactive without contact/question inputs. No real member, customer or destination was used. Consent, origin, nonce replay and payloadHash guard removal each made the focused test fail; originals were restored byte-identically. These are local checks, not independent same-SHA approval or hosted/live proof.
