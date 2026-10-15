# Agent Configuration - Disaster Recovery NRPG

## Purpose

This file configures AI agents working on the Disaster Recovery platform.

## Core Principles

1. **Marketing Agency Model** - We connect clients with contractors, we don't employ them
2. **No Phone Contact** - All communication via email and online forms
3. **Dynamic Content** - SEO pages generated on-demand with contractor signups
4. **Australian Market** - Use Australian English spelling throughout

## Pricing Model

Population-based tiers with 10% buffer:
- Rural (<50k): $395/mo
- Semi-Rural (50k-200k): $595/mo
- Tier 1 (200k-400k): $795/mo
- Tier 2 (400k-1M): $995/mo
- Tier 3 (>1M): $1,095/mo

## When Working on This Project

1. **Never add phone numbers** to any page or component
2. **Use PostgreSQL search** - not Algolia (apps/web/lib/search/postgres-search.ts)
3. **Check apps/web/lib/geo/** for tier calculations and radius logic
4. **SEO pages** use ISR with Sanity CMS content
5. **All CTAs** should direct to online forms, not tel: links

## File References

- `apps/web/lib/geo/types.ts` - Tier definitions and pricing
- `apps/web/lib/geo/radius-calculator.ts` - Haversine distance, 10% buffer
- `apps/web/lib/search/postgres-search.ts` - Full-text search
- `sanity/schemas/locationContent.ts` - CMS schema for locations

## Contact Model
```
Client submits request → Platform matches contractor → Contractor becomes sole contact
                                                    ↓
                                         Client support via:
                                         - AI Bot messenger
                                         - Online forms
                                         - support@disasterrecovery.com.au
```
