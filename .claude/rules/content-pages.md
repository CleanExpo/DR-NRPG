---
paths:
  - "apps/web/app/(public)/**"
  - "**/guides/**"
  - "**/services/**"
---

# Content Page Standards — DR-NRPG

## IICRC Compliance (non-negotiable):
- Guide pages MUST use "What to Expect from a Certified Contractor" format
- NEVER reproduce classification frameworks or standard text from standards published by the IICRC
- Never name a standard published by the IICRC by its number or its title, and never write the name IICRC in front of the word standard (write 'industry standards'), in anything a visitor, contractor or client can read (pages, metadata, structured data, images, emails, reports, training). Say 'recognised industry standards' or 'recognised industry practice'. Certification abbreviations for people (for example WRT, AMRT, FSRT) are not standard numbers. The build check `apps/web/scripts/check-iicrc-standard-refs.cjs` fails the build if a standard number or title appears; do not work around it. Founder rule, 15/11/2026.

## Business framing (legally critical):
- NRPG and DR are restoration services, NOT claim advocates
- Never imply NRPG controls claim outcomes or can influence insurer decisions
- Platform facilitates matching — it does NOT employ contractors
- Each contractor holds their own insurance, licences, and IICRC certification independently
- This distinction is critical under Australian Consumer Law

## Content Golden Rules:
1. No first-person business language (We/Our/I/Us/My) — use third person or Q&A format
2. No AI filler words (delve, tapestry, landscape, leverage, utilize, robust, seamless, elevate, game-changer)
3. Every paragraph answers a specific search intent question
4. Include external citations from authoritative sources
5. Include strategic internal cross-links
6. Valid JSON-LD structured data (FAQ, HowTo, Organization, BreadcrumbList)

## Australian English:
- colour, mould, organisation, licence (noun), centre, behaviour, optimisation
- Dates: DD/MM/YYYY. Phone: 04XX XXX XXX or 1300 XXX XXX

## SEO requirements:
- Meta title <60 chars, meta description <160 chars
- One H1 per page, logical heading hierarchy (H1 > H2 > H3)
- Alt text on all images
- Canonical URL set
