---
name: disaster-recovery-domain
description: "Domain knowledge for Australian disaster recovery and restoration services. Use when working on content, service descriptions, or any feature related to the DR/NRPG business model."
user-invocable: true
allowed-tools: WebSearch WebFetch Read Grep
context: fork
---

# Disaster Recovery Domain Knowledge

## Service Types (Australian Market)

### Water Damage
- Category 1: Clean water (supply lines)
- Category 2: Grey water (washing machines, dishwashers)
- Category 3: Black water (sewage, flooding)
- Certification: WRT (Cat 1-2), AMRT (Cat 3)

### Fire & Smoke Damage
- Primary fire damage, secondary smoke damage, structural assessment
- Certification: FSRT (Fire & Smoke Restoration Technician)

### Mould Remediation
- Visible mould, hidden mould (cavities, HVAC), air quality testing
- Certification: AMRT
- Containment procedures required for areas >10 sq ft

### Biohazard Cleanup
- Crime scene, deceased estate, infectious disease, hoarding
- Specialised training required.

## Naming standards
- Never name a standard published by the IICRC by its number or its title, and never write the name IICRC in front of the word standard (write 'industry standards'), in anything a visitor, contractor or client can read (pages, metadata, structured data, images, emails, reports, training). Say 'recognised industry standards' or 'recognised industry practice'. Certification abbreviations for people (for example WRT, AMRT, FSRT) are not standard numbers. The build check `apps/web/scripts/check-iicrc-standard-refs.cjs` fails the build if a standard number or title appears; do not work around it. Founder rule, 15/11/2026.

## Business Model (Legally Critical)
- NRPG/DR are restoration services, NOT claim advocates
- Platform facilitates matching — does NOT employ contractors
- Each contractor independently licensed, insured
- Never imply NRPG controls claim outcomes or influences insurer decisions
- This distinction is critical under Australian Consumer Law

## Contractor Model
- AU/NZ network with proprietary vetting and onboarding
- Each contractor holds own insurance, licences, IICRC cert
- Competitive moat: independent verification, not employment

## Insurance Integration
- Major insurers: NRMA, Suncorp, Allianz, QBE, IAG, CGU
- Claim lodgment procedures and documentation requirements
- AFCA for dispute resolution

## Emergency Response Levels
- URGENT: <2 hours (active water, biohazard)
- HIGH: <4 hours (fire, mould)
- STANDARD: <24 hours (assessment)
- SCHEDULED: Pre-booked inspections
