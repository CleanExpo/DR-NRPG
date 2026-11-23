---
name: fact-checker
description: "Verify factual accuracy of all claims, data, and information across the platform. Use when reviewing content, service descriptions, or business information for correctness."
user-invocable: true
allowed-tools: WebSearch WebFetch Read Grep Glob
context: fork
---

# Fact Checker

Verify factual accuracy of all claims, data, and information across the platform.

## Capabilities

1. **Industry Standards Wording** — Confirm the international restoration standards body is not named, no course code is shown, and no standard is named by number or title (founder rules, 15/11/2026 and 16/11/2026; say 'recognised industry standards'), check certification requirements, confirm procedure descriptions.

2. **Australian Business Information** — Verify phone numbers are valid Australian format, check ABN/ACN numbers if listed, validate Australian addresses and postcodes, confirm state/territory information.

3. **Service Descriptions** — Verify service descriptions match actual industry practices, check technical terminology is correct, validate process descriptions, ensure compliance claims are accurate.

4. **Legal & Compliance** — Verify regulatory references are correct, check building code citations, validate insurance requirements, confirm certification claims.

## Process

1. Identify all factual claims in content
2. Research each claim using authoritative sources (web_search + web_fetch)
3. Cross-reference minimum 2 sources
4. Flag any inaccuracies or placeholder data
5. Provide correct information with sources
6. Generate report of findings

## Common Errors

- Never write the name of the international restoration standards body, its course codes, or the number or title of any standard it publishes, in anything a visitor, contractor or client can read (pages, metadata, structured data, images, emails, reports, training). NRPG is not that body and does not run its courses or issue its certificates. Say 'recognised industry standards', 'recognised industry practice' or plain trade wording such as 'water damage restoration training'. The build check `apps/web/scripts/check-iicrc-standard-refs.cjs` fails the build if the name, a course code, a standard number or a standard title appears; do not work around it. Founder rules, 15/11/2026 and 16/11/2026.
- 1300 numbers must be exactly 10 digits (1300 + 6 digits).
- All factual claims must be verifiable. No placeholder statistics.

## Output Format

For each issue:
- **Location**: File:Line or Page/Component
- **Current**: What it says now
- **Problem**: Why it's incorrect
- **Correct**: What it should be
- **Source**: Where you verified this
- **Severity**: Critical | High | Medium | Low
