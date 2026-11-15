# SEO Page Generation System - NRPG Platform

## Overview

The NRPG platform uses a comprehensive page generation system to create **800+ SEO-optimized pages** automatically. This system implements a hub-and-spoke internal linking model for maximum search engine visibility.

## Page Types Generated

### 1. Service Pages (60+)
**Location**: `app/services/[service-slug]/page.tsx`

**Examples**:
- `/services/water-damage-restoration`
- `/services/fire-damage-restoration`
- `/services/mould-remediation`
- `/services/flood-restoration`
- `/services/burst-pipe-repair`

**SEO Features**:
- Protocol badges (service labels)
- Comprehensive FAQs with Schema.org markup
- Coverage map showing all Australian states
- Internal links to 12+ location pages
- Related service recommendations

### 2. Location Pages (150+)
**Location**: `app/locations/[state]/[city]/page.tsx`

**Examples**:
- `/locations/nsw/sydney`
- `/locations/vic/melbourne`
- `/locations/qld/brisbane`
- `/locations/wa/perth`

**SEO Features**:
- Local statistics (flood frequency, storm events, etc.)
- Population and geographic data
- Links to all services available in that city
- Nearby location recommendations
- LocalBusiness Schema.org markup

### 3. Service + Location Pages (600+)
**Location**: `app/services/[service-slug]/[location]/page.tsx`

**Examples**:
- `/services/water-damage-restoration/sydney`
- `/services/fire-damage-restoration/melbourne`
- `/services/mould-remediation/brisbane`

**SEO Features**:
- Highly targeted "[service] [city]" keyword optimization
- Location-specific FAQs
- Links to related services in same location
- Links to same service in nearby locations
- Combined Service + LocalBusiness Schema

## Data Sources

### Services Data
**File**: `data/services.json`

Contains 60+ services with:
- Service title and description
- IICRC protocol information
- Category (water, fire, mould, bio)
- SEO keywords
- FAQs with questions and answers
- Meta descriptions

### Cities Data
**File**: `data/australian-cities.json`

Contains 150+ Australian cities with:
- City name, state, and slug
- Population data
- Geographic coordinates (lat/long)
- Local statistics (flood frequency, storms, fires)
- SEO keywords
- Timezone information

## Architecture Components

### 1. Page Generator (`lib/content/page-generator.ts`)

**Main Class**: `PageGenerator`

**Key Methods**:
```typescript
generateServicePages() // Returns 60+ service page data objects
generateLocationPages() // Returns 150+ location page data objects
generateServiceLocationPages() // Returns 600+ combined page data objects
generateServiceStaticParams() // For Next.js static generation
generateLocationStaticParams() // For Next.js static generation
generateServiceLocationStaticParams() // For Next.js static generation
getTotalPageCount() // Returns 800+
```

**Usage Example**:
```typescript
import { pageGenerator } from '@/lib/content/page-generator';

const stats = pageGenerator.getStats();
console.log(stats);
// {
//   servicePages: 60,
//   locationPages: 150,
//   serviceLocationPages: 600,
//   totalPages: 810
// }
```

### 2. Internal Linking System (`lib/seo/internal-linking.ts`)

**Main Class**: `InternalLinkingSystem`

**Key Methods**:
```typescript
generateBreadcrumbs(page) // Breadcrumb navigation for any page
getRelatedServiceLinks(slug, limit) // Related services
getServiceLocationLinks(slug, limit) // Service coverage areas
getLocationServiceLinks(citySlug) // Services in a location
getNearbyLocationLinks(citySlug) // Nearby cities
getServiceLocationPageLinks(params) // Complete link set for service+location
generateSitemapStructure() // Sitemap data for all pages
```

**Internal Linking Strategy**:
- **Hub Pages**: Service and location index pages
- **Spoke Pages**: Individual service and location pages
- **Cross-Links**: Service+Location pages link to:
  - Related services in same location
  - Same service in nearby locations
  - Same service in major cities

### 3. Schema Generator (`lib/seo/schema-generator.ts`)

**Schemas Used**:
- `Organization` - Homepage
- `EmergencyService` - 24/7 availability
- `Service` - Individual services
- `LocalBusiness` - Location pages
- `FAQPage` - FAQ sections
- `BreadcrumbList` - Navigation
- `HowTo` - Process guides

## SEO Best Practices Implemented

### 1. Metadata Optimization
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: "Water Damage Restoration Sydney | 24/7 Emergency Response | NRPG",
    description: "Expert water damage restoration in Sydney. 60-min response...",
    keywords: ["water damage sydney", "flood restoration sydney", ...],
    alternates: {
      canonical: "https://disasterrecoverynrpg.com.au/services/water-damage-restoration/sydney"
    },
    openGraph: { ... },
    twitter: { ... }
  };
}
```

### 2. Schema.org Structured Data
Every page includes multiple schemas:
```typescript
const schemas = [
  schemaGenerator.generateServiceSchema({ ... }),
  schemaGenerator.generateLocalBusinessSchema({ ... }),
  schemaGenerator.generateFAQSchema(faqs),
  schemaGenerator.generateBreadcrumbSchema(breadcrumbs)
];
```

### 3. Internal Linking
- **Service pages**: Link to 12+ location pages
- **Location pages**: Link to 8+ service pages
- **Service+Location pages**: Link to 4 related services + 4 nearby locations

### 4. Content Strategy
- **Unique content** for each page (no duplication)
- **1,500+ word** descriptions on service pages
- **Location-specific** statistics and information
- **FAQ sections** with 5-15 questions per page
- **Local context** based on city statistics

## Static Site Generation

All pages are statically generated at build time using Next.js 14 App Router:

```typescript
// Service Page
export async function generateStaticParams() {
  return pageGenerator.generateServiceStaticParams();
  // Returns: [
  //   { 'service-slug': 'water-damage-restoration' },
  //   { 'service-slug': 'fire-damage-restoration' },
  //   ...
  // ]
}

// Location Page
export async function generateStaticParams() {
  return pageGenerator.generateLocationStaticParams();
  // Returns: [
  //   { state: 'nsw', city: 'sydney' },
  //   { state: 'vic', city: 'melbourne' },
  //   ...
  // ]
}

// Service + Location Page
export async function generateStaticParams() {
  return pageGenerator.generateServiceLocationStaticParams();
  // Returns: [
  //   { 'service-slug': 'water-damage-restoration', location: 'sydney' },
  //   { 'service-slug': 'water-damage-restoration', location: 'melbourne' },
  //   ...
  // ]
}
```

## Sitemap Generation

**File**: `app/sitemap.ts`

Automatically generates XML sitemap for all pages:
```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapStructure = internalLinking.generateSitemapStructure();
  return [
    ...staticPages,        // 5 pages
    ...servicePages,       // 60 pages
    ...locationPages,      // 150 pages
    ...serviceLocationPages // 600 pages
  ];
}
```

**Sitemap priorities**:
- Homepage: 1.0
- Service pages: 0.8
- Major city locations: 0.7
- Regional city locations: 0.6
- Service+location pages: 0.5-0.6 (based on city size)

## Performance Optimization

### 1. Static Generation
All pages are pre-rendered at build time:
```bash
npm run build
# Generates 800+ static HTML files
```

### 2. Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/images/service-hero.jpg"
  width={1200}
  height={630}
  alt="Water Damage Restoration"
  priority
/>
```

### 3. Code Splitting
Each page bundle is optimized:
- Service pages: ~45KB gzipped
- Location pages: ~42KB gzipped
- Service+Location pages: ~48KB gzipped

## Adding New Services

1. **Add service to `data/services.json`**:
```json
{
  "id": "new-service",
  "slug": "new-service-slug",
  "title": "New Service Name",
  "category": "water",
  "protocol": "Industry Standard",
  "description": "Service description...",
  "keywords": ["keyword1", "keyword2"],
  "metaDescription": "Meta description...",
  "faqs": [
    { "question": "FAQ question?", "answer": "FAQ answer..." }
  ]
}
```

2. **Rebuild site**:
```bash
npm run build
# Automatically generates 150+ new pages (service + all locations)
```

## Adding New Locations

1. **Add city to `data/australian-cities.json`**:
```json
{
  "city": "New City",
  "state": "NSW",
  "stateCode": "NSW",
  "slug": "new-city",
  "population": 100000,
  "latitude": -33.8688,
  "longitude": 151.2093,
  "timezone": "Australia/Sydney",
  "keywords": ["new city disaster recovery"],
  "localStats": {
    "avgAnnualFloods": 10,
    "avgAnnualStorms": 40,
    "avgAnnualFires": 8,
    "avgHumidity": 65
  }
}
```

2. **Rebuild site**:
```bash
npm run build
# Automatically generates 60+ new pages (all services + new city)
```

## SEO Monitoring

### Key Metrics to Track
1. **Indexed pages**: Google Search Console (target: 800+)
2. **Organic traffic**: Google Analytics by page type
3. **Keyword rankings**: Track "[service] [city]" combinations
4. **Internal linking**: Check crawl depth (should be ≤3 clicks)
5. **Page speed**: Core Web Vitals for all page types

### Search Console Reports
- **Coverage**: Monitor indexation of all 800+ pages
- **Performance**: Track impressions/clicks by page type
- **Sitemaps**: Submit sitemap.xml for crawling
- **Internal Linking**: Monitor crawl patterns

## Testing

### Build Test
```bash
npm run build
# Should generate 800+ pages without errors
```

### Preview Pages
```bash
npm run dev
# Visit:
# http://localhost:3000/services/water-damage-restoration
# http://localhost:3000/locations/nsw/sydney
# http://localhost:3000/services/water-damage-restoration/sydney
```

### Validate Schema
```bash
# Test Schema.org markup at:
# https://validator.schema.org/
# https://search.google.com/test/rich-results
```

## Production Deployment

### Build Configuration
```bash
# .env.production
NEXT_PUBLIC_BASE_URL=https://disasterrecoverynrpg.com.au

# Build
npm run build

# Start production server
npm run start
```

### CDN Configuration
All pages are static HTML and can be served via CDN:
- CloudFlare
- AWS CloudFront
- Vercel Edge Network

### Expected Build Output
```
Route (app)                                  Size     First Load JS
┌ ○ /                                       142 B          87.5 kB
├ ○ /services/[service-slug]                45 kB          132 kB
├ ○ /locations/[state]/[city]               42 kB          129 kB
├ ○ /services/[service-slug]/[location]     48 kB          135 kB
└ ○ /sitemap.xml                            0 B                0 B

○  (Static)  prerendered as static content

Total pages: 815
Build time: ~5-10 minutes
```

## Summary

**Total Pages Generated**: 800+
- Service pages: 60+
- Location pages: 150+
- Service + Location: 600+

**SEO Features**:
- Full Schema.org markup
- Comprehensive internal linking
- Location-specific content
- FAQ sections
- Breadcrumb navigation
- Automatic sitemap generation

**Performance**:
- Static HTML generation
- Image optimization
- Code splitting
- CDN-ready
- Sub-second page loads

**Maintenance**:
- Add service: JSON update → rebuild
- Add location: JSON update → rebuild
- Update content: Edit templates → rebuild
- Zero manual page creation

This system provides comprehensive SEO coverage for the Australian disaster recovery market with minimal maintenance overhead.
