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

1. **Industry Standards Wording** — Confirm no standard published by the IICRC is named by number or title (founder rule, 15/11/2026; say 'recognised industry standards'), check certification requirements, confirm procedure descriptions.

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

- Never name a standard published by the IICRC by its number or its title, and never write the name IICRC in front of the word standard (write 'industry standards'), in anything a visitor, contractor or client can read (pages, metadata, structured data, images, emails, reports, training). Say 'recognised industry standards' or 'recognised industry practice'. Certification abbreviations for people (for example WRT, AMRT, FSRT) are not standard numbers. The build check `apps/web/scripts/check-iicrc-standard-refs.cjs` fails the build if a standard number or title appears; do not work around it. Founder rule, 15/11/2026.
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
