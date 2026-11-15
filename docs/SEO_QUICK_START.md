# SEO Page Generation - Quick Start Guide

## Overview

The NRPG platform automatically generates **800+ SEO-optimized pages** for disaster recovery services across Australia.

## What Gets Generated

- **60+ Service Pages**: Individual service pages (water damage, fire restoration, etc.)
- **150+ Location Pages**: City-specific disaster recovery pages
- **600+ Service+Location Pages**: Highly targeted "[service] [city]" pages

**Total**: 810+ pages, all automatically generated from JSON data files.

## Quick Commands

```bash
# Test the page generation system
npm run seo:test

# Build all 800+ pages
npm run build

# Start development server
npm run dev

# View generated pages
# http://localhost:3000/services/water-damage-restoration
# http://localhost:3000/locations/nsw/sydney
# http://localhost:3000/services/water-damage-restoration/sydney
```

## File Structure

```
disaster-recovery-nrpg/
├── data/
│   ├── services.json              # 60+ services
│   └── australian-cities.json     # 150+ cities
├── lib/
│   ├── content/
│   │   └── page-generator.ts      # Page generation logic
│   └── seo/
│       ├── internal-linking.ts    # Internal linking system
│       └── schema-generator.ts    # Schema.org markup
├── app/
│   ├── services/
│   │   └── [service-slug]/
│   │       ├── page.tsx           # Service pages
│   │       └── [location]/
│   │           └── page.tsx       # Service+Location pages
│   ├── locations/
│   │   └── [state]/
│   │       └── [city]/
│   │           └── page.tsx       # Location pages
│   └── sitemap.ts                 # XML sitemap
└── docs/
    ├── SEO_PAGE_GENERATION.md     # Full documentation
    └── SEO_QUICK_START.md         # This file
```

## Adding a New Service

1. **Edit `data/services.json`**:

```json
{
  "id": "carpet-cleaning",
  "slug": "carpet-cleaning-restoration",
  "title": "Carpet Cleaning & Restoration",
  "category": "water",
  "protocol": "Industry Standard",
  "description": "Professional carpet cleaning and water damage restoration...",
  "keywords": ["carpet cleaning", "carpet restoration", "wet carpet"],
  "metaDescription": "Expert carpet cleaning and restoration services...",
  "faqs": [
    {
      "question": "How do you clean water-damaged carpets?",
      "answer": "We use truck-mounted extraction equipment..."
    }
  ]
}
```

2. **Rebuild**:

```bash
npm run build
```

3. **Result**: Automatically generates 150+ new pages:
   - `/services/carpet-cleaning-restoration`
   - `/services/carpet-cleaning-restoration/sydney`
   - `/services/carpet-cleaning-restoration/melbourne`
   - ... (one page for each city)

## Adding a New City

1. **Edit `data/australian-cities.json`**:

```json
{
  "city": "Wollongong",
  "state": "NSW",
  "stateCode": "NSW",
  "slug": "wollongong",
  "population": 302000,
  "latitude": -34.4278,
  "longitude": 150.8931,
  "timezone": "Australia/Sydney",
  "keywords": ["wollongong disaster recovery"],
  "localStats": {
    "avgAnnualFloods": 11,
    "avgAnnualStorms": 43,
    "avgAnnualFires": 6,
    "avgHumidity": 66
  }
}
```

2. **Rebuild**:

```bash
npm run build
```

3. **Result**: Automatically generates 60+ new pages:
   - `/locations/nsw/wollongong`
   - `/services/water-damage-restoration/wollongong`
   - `/services/fire-damage-restoration/wollongong`
   - ... (one page for each service)

## Page Templates

### Service Page Template
**Path**: `app/services/[service-slug]/page.tsx`

Features:
- Dynamic metadata (title, description, keywords)
- Schema.org markup (Service + EmergencyService + FAQ)
- Breadcrumb navigation
- Hero section with emergency CTA
- Service description (1,500+ words)
- "How It Works" (4-step process)
- FAQ section (5-15 questions)
- Coverage map (links to all locations)
- Related services

### Location Page Template
**Path**: `app/locations/[state]/[city]/page.tsx`

Features:
- Dynamic metadata (local SEO optimized)
- Schema.org markup (LocalBusiness + Service)
- Local statistics (flood frequency, storms, etc.)
- Population and geographic data
- Links to all services in that city
- Nearby location recommendations
- "Why Choose Us" section

### Service+Location Page Template
**Path**: `app/services/[service-slug]/[location]/page.tsx`

Features:
- Highly targeted "[service] [city]" optimization
- Combined Service + LocalBusiness schemas
- Location-specific FAQs
- Links to related services in same city
- Links to same service in nearby cities
- Links to same service in major cities

## SEO Features

### 1. Schema.org Structured Data
Every page includes multiple schemas:
- Organization
- EmergencyService (24/7 availability)
- Service
- LocalBusiness
- FAQPage
- BreadcrumbList

### 2. Internal Linking
**Hub-and-Spoke Model**:
- Service hubs link to 12+ location pages
- Location hubs link to 8+ service pages
- Service+Location pages link to related services and nearby locations

### 3. Metadata Optimization
- Unique title and description for each page
- Targeted keywords
- Canonical URLs
- Open Graph tags (Facebook/LinkedIn)
- Twitter cards

### 4. Sitemap Generation
Automatic XML sitemap at `/sitemap.xml`:
- All 800+ pages included
- Priority levels based on page importance
- Change frequencies optimized for search engines

## Testing the System

```bash
# Run comprehensive tests
npm run seo:test

# Expected output:
# ✅ Services loaded: 60
# ✅ Cities loaded: 150
# ✅ Service pages generated: 60
# ✅ Location pages generated: 150
# ✅ Service+Location pages generated: 600
# ✅ Total pages: 810
```

## Build Output

```bash
npm run build

# Expected output:
# Route (app)                                  Size     First Load JS
# ├ ○ /services/[service-slug]                45 kB          132 kB
# ├ ○ /locations/[state]/[city]               42 kB          129 kB
# ├ ○ /services/[service-slug]/[location]     48 kB          135 kB
# └ ○ /sitemap.xml                            0 B                0 B
#
# ○  (Static)  prerendered as static content
#
# Total pages: 815
# Build time: ~5-10 minutes
```

## Preview Pages

```bash
npm run dev

# Visit these URLs to preview:
```

**Service Pages**:
- http://localhost:3000/services/water-damage-restoration
- http://localhost:3000/services/fire-damage-restoration
- http://localhost:3000/services/mould-remediation

**Location Pages**:
- http://localhost:3000/locations/nsw/sydney
- http://localhost:3000/locations/vic/melbourne
- http://localhost:3000/locations/qld/brisbane

**Service+Location Pages**:
- http://localhost:3000/services/water-damage-restoration/sydney
- http://localhost:3000/services/fire-damage-restoration/melbourne
- http://localhost:3000/services/mould-remediation/brisbane

**Sitemap**:
- http://localhost:3000/sitemap.xml

## Common Tasks

### Update Service Description
Edit `data/services.json` → find service → update `description` → rebuild

### Add FAQs to Service
Edit `data/services.json` → find service → add to `faqs` array → rebuild

### Update City Statistics
Edit `data/australian-cities.json` → find city → update `localStats` → rebuild

### Change Meta Descriptions
Edit `data/services.json` or `data/australian-cities.json` → update `metaDescription` → rebuild

## SEO Monitoring

### Google Search Console
1. Submit sitemap: `https://disasterrecoverynrpg.com.au/sitemap.xml`
2. Monitor indexation (target: 800+ pages indexed)
3. Track performance by page type

### Key Metrics
- **Indexed pages**: 800+ (check Coverage report)
- **Organic traffic**: Track in Google Analytics
- **Keyword rankings**: Monitor "[service] [city]" combinations
- **Page speed**: Core Web Vitals for all page types

## Troubleshooting

### Pages Not Generating
```bash
# Check data files are valid JSON
npm run seo:test

# If errors, check:
# - data/services.json syntax
# - data/australian-cities.json syntax
# - Required fields present
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Missing Pages
```bash
# Verify static params generation
npm run seo:test

# Check output for:
# ✅ Service params: 60
# ✅ Location params: 150
# ✅ Service+Location params: 600
```

## Performance Tips

1. **Static Generation**: All pages are pre-rendered at build time
2. **Image Optimization**: Use Next.js `<Image>` component
3. **Code Splitting**: Each route bundle is optimized
4. **CDN Deployment**: Static HTML ready for CloudFlare/Vercel

## Production Deployment

```bash
# Set environment variable
export NEXT_PUBLIC_BASE_URL=https://disasterrecoverynrpg.com.au

# Build
npm run build

# Start
npm run start

# Or deploy to Vercel/Netlify/AWS
```

## Need Help?

- **Full Documentation**: See `docs/SEO_PAGE_GENERATION.md`
- **Test System**: Run `npm run seo:test`
- **Preview Pages**: Run `npm run dev`

## Summary

**What You Get**:
- 800+ SEO-optimized pages
- Automatic generation from JSON data
- Schema.org structured data
- Comprehensive internal linking
- XML sitemap
- Local SEO optimization

**What You Do**:
- Edit JSON files
- Run `npm run build`
- Deploy

**No manual page creation required!**
