---
name: iicrc-validator
description: "Check that NRPG content does NOT name the international restoration standards body, show its course codes or certificates as NRPG's own, or name or reproduce any standard it publishes. Use when working on service pages, guides, training or any content that mentions certification, courses or industry standards."
user-invocable: true
allowed-tools: Read Grep Glob
context: fork
paths:
  - "**/guides/**"
  - "**/services/**"
  - "content/**"
  - "data/services*"
---

# Certification and Standards Wording Validator

## The rule

NRPG is not the international restoration standards body, does not run its courses and does not issue its certificates. Founder rule, 16/11/2026: NRPG must not display that body's certifications, its name or its acronyms for NRPG's courses, or for the work NRPG provides, as if NRPG had authority to do so.

Never write the body's name, its course codes, or the number or title of any standard it publishes, in anything a visitor, contractor or client can read (pages, metadata, structured data, images, emails, reports, training, AI prompts). Say 'recognised industry standards', 'recognised industry practice' or plain trade wording such as 'water damage restoration training'. The build check `apps/web/scripts/check-iicrc-standard-refs.cjs` fails the build if the name, a course code, a standard number or a standard title appears; do not work around it.

## What to flag

- The name of the standards body, in any form, including possessives and "-certified" or "-qualified" compounds.
- Course codes shown as courses, credentials or marks of the work.
- Any standard number or standard title, in any form or edition, including section or clause citations.
- Any reproduced standard text or classification framework.
- Any sentence that attributes a requirement or figure to a named standard. Rewrite it to "industry standards" or "recognised industry practice" and keep the fact.

## Content Framing Rules

- Guide pages MUST use "What to Expect from a Certified Contractor" format
- NEVER reproduce classification frameworks from industry standards
- NEVER reproduce standard text verbatim
- Describe training and qualifications in plain trade wording, not by code

## Validation Process

1. Run the build check `apps/web/scripts/check-iicrc-standard-refs.cjs`
2. Search the content under review for the body's name, course codes and any standard number or title
3. Rewrite each hit using the rule above, keeping the fact unchanged
4. Re-run the build check
