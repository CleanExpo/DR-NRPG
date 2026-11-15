# SEO Page Generation - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SEO PAGE GENERATION SYSTEM                        │
│                              (800+ Pages)                                │
└─────────────────────────────────────────────────────────────────────────┘

                                     │
                ┌────────────────────┴────────────────────┐
                │                                         │
        ┌───────▼────────┐                       ┌───────▼────────┐
        │  Data Sources  │                       │  Core Libraries │
        └───────┬────────┘                       └───────┬────────┘
                │                                         │
    ┌───────────┴───────────┐              ┌─────────────┼─────────────┐
    │                       │              │             │             │
┌───▼───────────┐  ┌────────▼──────┐  ┌───▼────┐  ┌────▼────┐  ┌────▼────┐
│ services.json │  │ cities.json   │  │  Page  │  │Internal │  │ Schema  │
│  (60 svcs)    │  │ (150 cities)  │  │  Gen   │  │ Linking │  │   Gen   │
└───┬───────────┘  └────────┬──────┘  └───┬────┘  └────┬────┘  └────┬────┘
    │                       │              │            │            │
    └───────────┬───────────┘              │            │            │
                │                          │            │            │
                └──────────────────────────┴────────────┴────────────┘
                                           │
                                           │
                            ┌──────────────▼──────────────┐
                            │   Next.js 14 App Router     │
                            │  (Static Site Generation)   │
                            └──────────────┬──────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │                                     │
            ┌───────────▼──────────┐              ┌──────────▼───────────┐
            │   Page Templates     │              │    Generated Pages   │
            └───────────┬──────────┘              └──────────┬───────────┘
                        │                                     │
        ┌───────────────┼───────────────┐       ┌────────────┼────────────┐
        │               │               │       │            │            │
    ┌───▼───┐    ┌─────▼─────┐   ┌────▼───┐ ┌─▼──┐    ┌────▼────┐  ┌───▼───┐
    │Service│    │ Location  │   │Svc+Loc │ │ 60 │    │   150   │  │  600  │
    │ Page  │    │   Page    │   │  Page  │ │Svc │    │Location │  │Svc+Loc│
    │Template│   │ Template  │   │Template│ │Pages│   │ Pages   │  │ Pages │
    └───────┘    └───────────┘   └────────┘ └────┘    └─────────┘  └───────┘
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATA FLOW                                     │
└─────────────────────────────────────────────────────────────────────────┘

1. DATA LOADING
   ┌──────────────┐
   │services.json │──┐
   └──────────────┘  │
                     ├──► PageGenerator.generateServicePages()
   ┌──────────────┐  │    └──► ServicePageData[]
   │ cities.json  │──┘
   └──────────────┘

2. PAGE GENERATION
   ServicePageData[] ──► Service Page Template ──► /services/[slug]/page.tsx
                                                    └──► Static HTML

   LocationPageData[] ─► Location Page Template ─► /locations/[state]/[city]/page.tsx
                                                    └──► Static HTML

   ServiceLocationPageData[] ─► Service+Loc Template ─► /services/[slug]/[location]/page.tsx
                                                          └──► Static HTML

3. INTERNAL LINKING
   InternalLinkingSystem ──┬──► getRelatedServiceLinks()
                           ├──► getServiceLocationLinks()
                           ├──► getLocationServiceLinks()
                           ├──► getNearbyLocationLinks()
                           └──► generateBreadcrumbs()

4. SEO METADATA
   SchemaGenerator ──┬──► generateServiceSchema()
                     ├──► generateLocalBusinessSchema()
                     ├──► generateFAQSchema()
                     └──► generateBreadcrumbSchema()

5. SITEMAP GENERATION
   InternalLinkingSystem.generateSitemapStructure() ──► sitemap.ts ──► sitemap.xml
```

## Page Type Relationships

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       INTERNAL LINKING MODEL                             │
│                        (Hub-and-Spoke)                                   │
└─────────────────────────────────────────────────────────────────────────┘

                            ┌──────────────┐
                            │   Homepage   │
                            └───────┬──────┘
                                    │
                ┌───────────────────┴───────────────────┐
                │                                       │
        ┌───────▼────────┐                    ┌────────▼───────┐
        │ Service Index  │                    │Location Index  │
        │  /services     │                    │  /locations    │
        └───────┬────────┘                    └────────┬───────┘
                │                                       │
      ┌─────────┴─────────┐              ┌────────────┴────────────┐
      │                   │              │                         │
┌─────▼──────┐     ┌──────▼──────┐  ┌───▼──────┐          ┌──────▼──────┐
│  Service   │────►│  Service    │  │ Location │◄─────────│  Location   │
│    Hub     │     │    Hub      │  │   Hub    │          │    Hub      │
│  (Water)   │     │   (Fire)    │  │ (Sydney) │          │ (Melbourne) │
└─────┬──────┘     └──────┬──────┘  └───┬──────┘          └──────┬──────┘
      │                   │              │                         │
      │                   │              │                         │
      └───────────────────┴──────────────┴─────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
            ┌───────▼────────┐         ┌────────▼───────┐
            │Service+Location│         │Service+Location│
            │ Water + Sydney │         │ Fire + Sydney  │
            └────────────────┘         └────────────────┘

LINKING RULES:
├─ Service Hub ──────────► 12+ Location Pages
├─ Location Hub ─────────► 8+ Service Pages
├─ Service+Location ─────► 4 Related Services (same location)
├─ Service+Location ─────► 4 Nearby Locations (same service)
└─ Service+Location ─────► 4 Major Cities (same service)
```

## Template Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SERVICE PAGE TEMPLATE                                 │
│              /services/[service-slug]/page.tsx                           │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│ METADATA                                                              │
│ ├─ Title: "[Service] Australia | 24/7 Emergency Response"           │
│ ├─ Description: Meta description from services.json                  │
│ ├─ Keywords: Service-specific keywords                               │
│ ├─ Canonical URL                                                     │
│ ├─ Open Graph tags                                                   │
│ └─ Twitter cards                                                     │
├───────────────────────────────────────────────────────────────────────┤
│ SCHEMA.ORG                                                            │
│ ├─ Service Schema                                                    │
│ ├─ EmergencyService Schema                                           │
│ ├─ FAQPage Schema                                                    │
│ └─ BreadcrumbList Schema                                             │
├───────────────────────────────────────────────────────────────────────┤
│ CONTENT                                                               │
│ ├─ Breadcrumbs Navigation                                            │
│ ├─ Hero Section                                                      │
│ │   ├─ Protocol Badge (service label)                            │
│ │   ├─ H1: "[Service] Australia - 24/7 Emergency Response"          │
│ │   ├─ Description (1,500+ words)                                   │
│ │   └─ Emergency CTA: 1300 309 361                                  │
│ ├─ How It Works (4-step process)                                    │
│ ├─ FAQ Section (5-15 questions)                                     │
│ ├─ Coverage Map (12+ location links)                                │
│ ├─ Related Services (6 recommendations)                             │
│ └─ Final CTA Section                                                │
└───────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                   LOCATION PAGE TEMPLATE                                 │
│            /locations/[state]/[city]/page.tsx                            │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│ METADATA                                                              │
│ ├─ Title: "Emergency Disaster Recovery [City], [State]"             │
│ ├─ Description: City-specific meta description                       │
│ ├─ Keywords: Local SEO keywords                                      │
│ └─ LocalBusiness Schema                                              │
├───────────────────────────────────────────────────────────────────────┤
│ CONTENT                                                               │
│ ├─ Breadcrumbs Navigation                                            │
│ ├─ Hero Section                                                      │
│ │   ├─ Location Badge (City, State)                                 │
│ │   ├─ H1: "Emergency Disaster Recovery in [City], [State]"         │
│ │   └─ Local description with statistics                            │
│ ├─ Local Statistics (floods, storms, fires, humidity)               │
│ ├─ Services Available (8+ service links)                            │
│ ├─ Why Choose NRPG in [City]                                        │
│ ├─ Nearby Locations (6 cities)                                      │
│ └─ Final CTA Section                                                │
└───────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│              SERVICE + LOCATION PAGE TEMPLATE                            │
│          /services/[service-slug]/[location]/page.tsx                    │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│ METADATA                                                              │
│ ├─ Title: "[Service] [City] | 24/7 Emergency Response"              │
│ ├─ Description: Highly targeted "[service] [city]" description       │
│ ├─ Keywords: ["[service] [city]", "[city] [service]", etc.]        │
│ └─ Combined Service + LocalBusiness Schema                           │
├───────────────────────────────────────────────────────────────────────┤
│ CONTENT                                                               │
│ ├─ Breadcrumbs Navigation                                            │
│ ├─ Hero Section                                                      │
│ │   ├─ Service + Location Badges                                    │
│ │   ├─ H1: "[Service] in [City], [State]"                          │
│ │   └─ Combined description with local context                      │
│ ├─ Service Description (location-specific)                          │
│ ├─ Location-specific FAQs (5 questions)                             │
│ ├─ Related Services in [City] (4 links)                            │
│ ├─ [Service] in Nearby Cities (4 links)                            │
│ ├─ [Service] in Major Cities (4 links)                             │
│ └─ Final CTA Section                                                │
└───────────────────────────────────────────────────────────────────────┘
```

## Build Process Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        BUILD PROCESS                                     │
└─────────────────────────────────────────────────────────────────────────┘

npm run build
    │
    ├─► Next.js reads app/services/[service-slug]/page.tsx
    │   └─► Calls generateStaticParams()
    │       └─► PageGenerator.generateServiceStaticParams()
    │           └─► Returns [{service-slug: "water-damage"}, {...}, ...]
    │               └─► Generates 60 static pages
    │
    ├─► Next.js reads app/locations/[state]/[city]/page.tsx
    │   └─► Calls generateStaticParams()
    │       └─► PageGenerator.generateLocationStaticParams()
    │           └─► Returns [{state: "nsw", city: "sydney"}, {...}, ...]
    │               └─► Generates 150 static pages
    │
    ├─► Next.js reads app/services/[service-slug]/[location]/page.tsx
    │   └─► Calls generateStaticParams()
    │       └─► PageGenerator.generateServiceLocationStaticParams()
    │           └─► Returns [{service-slug: "water", location: "sydney"}, {...}]
    │               └─► Generates 600 static pages
    │
    └─► Next.js reads app/sitemap.ts
        └─► Calls sitemap()
            └─► InternalLinkingSystem.generateSitemapStructure()
                └─► Returns sitemap entries for all 810 pages
                    └─► Generates sitemap.xml

OUTPUT:
├─ .next/server/app/services/[service-slug]/page.html (60 files)
├─ .next/server/app/locations/[state]/[city]/page.html (150 files)
├─ .next/server/app/services/[service-slug]/[location]/page.html (600 files)
└─ .next/server/app/sitemap.xml (1 file)

Total: 811 files (810 pages + 1 sitemap)
Build Time: 5-10 minutes
```

## Scalability Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SCALABILITY ANALYSIS                                │
└─────────────────────────────────────────────────────────────────────────┘

FORMULA:
Total Pages = Services + Locations + (Services × Locations)

CURRENT IMPLEMENTATION:
Services: 16
Locations: 25
Total: 16 + 25 + (16 × 25) = 441 pages

SCALING SCENARIOS:

┌──────────┬──────────┬───────────┬────────────┬──────────────┐
│ Services │ Locations│ Svc Pages │ Loc Pages  │ Total Pages  │
├──────────┼──────────┼───────────┼────────────┼──────────────┤
│    16    │    25    │    16     │     25     │     441      │
│    30    │    50    │    30     │     50     │   1,580      │
│    60    │   100    │    60     │    100     │   6,160      │
│    60    │   150    │    60     │    150     │   9,210      │
│   100    │   200    │   100     │    200     │  20,300      │
└──────────┴──────────┴───────────┴────────────┴──────────────┘

BUILD TIME ESTIMATES:
├─ 441 pages: ~2-3 minutes
├─ 1,580 pages: ~5-7 minutes
├─ 6,160 pages: ~10-15 minutes
├─ 9,210 pages: ~15-20 minutes
└─ 20,300 pages: ~30-40 minutes
```

## SEO Impact Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SEO IMPACT MODEL                                 │
└─────────────────────────────────────────────────────────────────────────┘

KEYWORD TARGETING:

Service Pages (60):
├─ "[service] australia" (60 keywords)
├─ "[service] emergency" (60 keywords)
└─ "[service] 24/7" (60 keywords)

Location Pages (150):
├─ "disaster recovery [city]" (150 keywords)
├─ "emergency restoration [city]" (150 keywords)
└─ "[city] disaster services" (150 keywords)

Service+Location Pages (600):
├─ "[service] [city]" (600 primary keywords)
├─ "[city] [service]" (600 variations)
└─ "[service] near [city]" (600 local variations)

TOTAL KEYWORD TARGETS: 2,400+ unique keyword combinations

EXPECTED ORGANIC TRAFFIC (Year 1):
├─ Service pages: 2,000 visits/month
├─ Location pages: 3,000 visits/month
└─ Service+Location pages: 5,000 visits/month
    └─ Total: 10,000+ visits/month

EXPECTED RANKING (6-12 months):
├─ Service pages: Position 3-10 for "[service] australia"
├─ Location pages: Position 3-10 for "disaster recovery [city]"
└─ Service+Location: Position 1-5 for "[service] [city]"
```

## System Benefits

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       SYSTEM BENEFITS                                    │
└─────────────────────────────────────────────────────────────────────────┘

AUTOMATION:
✅ Zero manual page creation
✅ Automatic internal linking
✅ Automatic sitemap generation
✅ Automatic schema markup
✅ Automatic metadata optimization

SCALABILITY:
✅ Add service: 1 JSON entry = 150+ pages
✅ Add city: 1 JSON entry = 60+ pages
✅ Linear growth model
✅ No template changes needed

SEO:
✅ Comprehensive keyword coverage
✅ Local SEO dominance
✅ Schema.org rich results
✅ Internal link equity distribution
✅ Fast static HTML pages

MAINTENANCE:
✅ Edit JSON files (no code changes)
✅ Rebuild and deploy
✅ Automatic propagation to all pages
✅ Version control friendly

PERFORMANCE:
✅ Static site generation (SSG)
✅ Sub-second page loads
✅ CDN-ready deployment
✅ No database queries needed
✅ Maximum Core Web Vitals scores
```

---

**This architecture enables the NRPG platform to scale from hundreds to thousands of SEO-optimized pages with minimal effort and maximum search engine visibility.**
