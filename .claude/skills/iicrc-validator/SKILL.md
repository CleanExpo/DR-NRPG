---
name: iicrc-validator
description: "Check that content does NOT name a standard published by the IICRC by number or title and does not reproduce standard text or classification frameworks. Use when working on service pages, guides, training or any content that mentions IICRC."
user-invocable: true
allowed-tools: Read Grep Glob
context: fork
paths:
  - "**/guides/**"
  - "**/services/**"
  - "content/**"
  - "data/services*"
---

# IICRC Wording Validator

## The rule

Never name a standard published by the IICRC by its number or its title, and never write the name IICRC in front of the word standard (write 'industry standards'), in anything a visitor, contractor or client can read (pages, metadata, structured data, images, emails, reports, training). Say 'recognised industry standards' or 'recognised industry practice'. Certification abbreviations for people (for example WRT, AMRT, FSRT) are not standard numbers. The build check `apps/web/scripts/check-iicrc-standard-refs.cjs` fails the build if a standard number or title appears; do not work around it. Founder rule, 15/11/2026.

## What to flag

- Any standard number or standard title, in any form or edition, including section or clause citations.
- Any reproduced standard text or classification framework.
- Any sentence that attributes a requirement or figure to a named standard. Rewrite it to "industry standards" or "recognised industry practice" and keep the fact.

## Content Framing Rules

- Guide pages MUST use "What to Expect from a Certified Contractor" format
- NEVER reproduce classification frameworks from industry standards
- NEVER reproduce standard text verbatim
- Certification abbreviations for people (WRT, AMRT, FSRT) may be used; they are not standard numbers

## Validation Process

1. Run the build check `apps/web/scripts/check-iicrc-standard-refs.cjs`
2. Grep the content under review for any standard number or title
3. Rewrite each hit using the rule above, keeping the fact unchanged
4. Re-run the build check
