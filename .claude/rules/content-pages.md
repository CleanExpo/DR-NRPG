---
paths:
  - "apps/web/app/(public)/**"
  - "**/guides/**"
  - "**/services/**"
---

# Content Page Standards — DR-NRPG

## Industry Standards and Certification Wording (non-negotiable):
- Guide pages MUST use "What to Expect from a Certified Contractor" format
- NEVER reproduce classification frameworks or standard text from published industry standards
- Never write the name of the international restoration standards body, its course codes, or the number or title of any standard it publishes, in anything a visitor, contractor or client can read (pages, metadata, structured data, images, emails, reports, training). NRPG is not that body and does not run its courses or issue its certificates. Say 'recognised industry standards', 'recognised industry practice' or plain trade wording such as 'water damage restoration training'. The build check `apps/web/scripts/check-iicrc-standard-refs.cjs` fails the build if the name, a course code, a standard number or a standard title appears; do not work around it. Founder rules, 15/11/2026 and 16/11/2026.

## Business framing (legally critical):
- NRPG and DR are restoration services, NOT claim advocates
- Never imply NRPG controls claim outcomes or can influence insurer decisions
- Platform facilitates matching — it does NOT employ contractors
- Each contractor holds their own insurance, licences, and industry certification independently
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
