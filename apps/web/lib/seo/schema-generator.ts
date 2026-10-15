/**
 * Schema.org Structured Data Generator - NRPG Platform
 *
 * Generates structured data for:
 * - Rich snippets in Google/Bing search
 * - AI search engines (ChatGPT, Perplexity, Google SGE)
 * - Voice search optimization
 * - Local search results
 *
 * Critical for SEO visibility in disaster recovery market
 */

import { SERVICE_PILLARS, CLIENT_SECTORS, AUSTRALIAN_LOCATIONS } from '@/lib/design-tokens';
import { SITE_URL } from '@/lib/seo/site-url';

const BASE_URL = SITE_URL;

export class SchemaGenerator {
  /**
   * Organization Schema - For Homepage
   * Establishes NRPG as authoritative professional service
   */
  generateOrganizationSchema() {
    return {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${BASE_URL}/#organization`,
      name: "NRPG - National Restoration Professionals Group",
      alternateName: "Disaster Recovery Australia",
      legalName: "Disaster Recovery Pty Ltd",
      taxID: "urn:abn:85151794142",
      description: "Australian disaster recovery and emergency restoration network connecting property owners with independent IICRC-certified restoration contractors for flood, fire, storm, and water damage across all states and territories.",
      url: BASE_URL,

      address: {
        "@type": "PostalAddress",
        addressCountry: "AU",
      },

      areaServed: AUSTRALIAN_LOCATIONS.map(loc => ({
        "@type": "State",
        name: loc.name,
      })),

      serviceType: SERVICE_PILLARS.map(p => p.title),

      sameAs: [
        "https://www.facebook.com/NRPGAustralia",
        "https://twitter.com/NRPGAustralia",
        "https://www.linkedin.com/company/nrpg-australia",
        "https://www.instagram.com/nrpgaustralia",
      ],

      slogan: "One call connects you with trusted restoration professionals.",

      knowsAbout: [
        "Emergency Restoration",
        "Flood Damage Restoration",
        "Fire Damage Restoration",
        "Water Damage Repair",
        "Mold Remediation",
        "Biohazard Cleanup",
        "Forensic Cleaning",
        "IICRC Standards",
      ],

      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Emergency Restoration Services",
        itemListElement: SERVICE_PILLARS.map((pillar, index) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: pillar.title,
            description: `Professional ${pillar.title.toLowerCase()} restoration services across Australia`,
          },
        })),
      },
    };
  }

  /**
   * EmergencyService Schema - Critical for disaster recovery
   * Shows 24/7 availability in search results
   */
  generateEmergencyServiceSchema() {
    return {
      "@context": "https://schema.org",
      "@type": "EmergencyService",
      "@id": `${BASE_URL}/#emergency-service`,
      name: "NRPG 24/7 Emergency Restoration",
      description: "Round-the-clock emergency disaster restoration services across all Australian states and territories",

      serviceType: [
        "Water Damage Restoration",
        "Fire Damage Restoration",
        "Flood Restoration",
        "Storm Damage Repair",
        "Emergency Water Extraction",
        "Mold Remediation",
        "Trauma Cleanup",
        "Biohazard Restoration",
      ],

      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: `${BASE_URL}/emergency`,
        availableLanguage: ["en-AU"],
      },

      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },

      areaServed: {
        "@type": "Country",
        name: "Australia",
      },
    };
  }

  /**
   * Service Schema - For individual service pages
   */
  generateServiceSchema(service: {
    name: string;
    description: string;
    serviceType: string;
    provider?: string;
  }) {
    return {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.name,
      description: service.description,
      serviceType: service.serviceType,

      provider: {
        "@id": `${BASE_URL}/#organization`,
      },

      areaServed: {
        "@type": "Country",
        name: "Australia",
      },

      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: `${BASE_URL}/contact`,
      },

      category: "Disaster Restoration",
    };
  }

  /**
   * LocalBusiness Schema - For location pages
   * Enhanced with GeoCircle service area, reviews, and detailed local SEO attributes
   */
  generateLocalBusinessSchema(location: {
    city: string;
    state: string;
    address?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
    serviceRadius?: number;
    reviewCount?: number;
    averageRating?: number;
  }) {
    const citySlug = location.city.toLowerCase().replace(/\s/g, '-');
    const stateSlug = location.state.toLowerCase();
    const serviceRadiusMeters = (location.serviceRadius || 50) * 1000;

    return {
      "@context": "https://schema.org",
      "@type": ["LocalBusiness", "EmergencyService", "ProfessionalService"],
      "@id": `${BASE_URL}/locations/${stateSlug}/${citySlug}#business`,
      name: `NRPG Disaster Recovery - ${location.city}`,
      alternateName: `Disaster Recovery ${location.city}`,
      description: `24/7 emergency disaster recovery in ${location.city}, ${location.state}. IICRC-certified water damage, fire damage, mould remediation. Priority dispatch.`,
      url: `${BASE_URL}/locations/${stateSlug}/${citySlug}`,

      address: {
        "@type": "PostalAddress",
        streetAddress: location.address || "",
        addressLocality: location.city,
        addressRegion: location.state,
        addressCountry: "AU",
      },

      ...(location.latitude && location.longitude && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: location.latitude,
          longitude: location.longitude,
        },
      }),

      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },

      // GeoCircle service area for local pack optimization
      ...(location.latitude && location.longitude && {
        areaServed: {
          "@type": "GeoCircle",
          geoMidpoint: {
            "@type": "GeoCoordinates",
            latitude: location.latitude,
            longitude: location.longitude,
          },
          geoRadius: serviceRadiusMeters.toString(),
        },
      }),

      priceRange: "$$",
      paymentAccepted: "Cash, Credit Card, Insurance Direct Billing",
      currenciesAccepted: "AUD",

      // NOTE: aggregateRating intentionally omitted — star ratings must reflect a
      // real, auditable review source, not generated values. Re-add only when wired
      // to verified review data (see verified-claims.json).

      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: `Disaster Recovery Services - ${location.city}`,
        itemListElement: SERVICE_PILLARS.map((pillar, index) => ({
          "@type": "Offer",
          position: index + 1,
          itemOffered: {
            "@type": "Service",
            name: `${pillar.title} - ${location.city}`,
            description: `Professional ${pillar.title.toLowerCase()} services in ${location.city}`,
            provider: { "@id": `${BASE_URL}/#organization` },
          },
        })),
      },

      // Business attributes for local search signals
      additionalProperty: [
        { "@type": "PropertyValue", name: "Emergency Service", value: "Yes" },
        { "@type": "PropertyValue", name: "24/7 Availability", value: "Yes" },
        { "@type": "PropertyValue", name: "IICRC Certified", value: "Yes" },
        { "@type": "PropertyValue", name: "Insurance Work Accepted", value: "Yes" },
        { "@type": "PropertyValue", name: "Response Time", value: "Priority dispatch — times vary by location" },
      ],

      parentOrganization: { "@id": `${BASE_URL}/#organization` },
      image: `${BASE_URL}/images/locations/${citySlug}-disaster-recovery.jpg`,
      sameAs: [
        "https://www.facebook.com/NRPGAustralia",
        "https://www.linkedin.com/company/nrpg-australia",
      ],
    };
  }

  /**
   * Enhanced LocalBusiness Schema with full GeoCircle service area
   * For Google Local Pack optimization with population and local stats
   */
  generateEnhancedLocalBusinessSchema(location: {
    city: string;
    state: string;
    stateCode: string;
    latitude: number;
    longitude: number;
    serviceRadius?: number;
    population?: number;
    localStats?: {
      avgAnnualFloods: number;
      avgAnnualStorms: number;
      avgAnnualFires: number;
      avgHumidity: number;
    };
  }) {
    const citySlug = location.city.toLowerCase().replace(/\s/g, '-');
    const stateSlug = location.stateCode.toLowerCase();
    const serviceRadiusMeters = (location.serviceRadius || 50) * 1000;

    // Determine primary service based on local disaster stats
    let primaryService = "Water Damage Restoration";
    if (location.localStats) {
      if (location.localStats.avgAnnualFires > location.localStats.avgAnnualFloods) {
        primaryService = "Fire Damage Restoration";
      } else if (location.localStats.avgHumidity > 70) {
        primaryService = "Mould Remediation";
      }
    }

    return {
      "@context": "https://schema.org",
      "@type": ["LocalBusiness", "EmergencyService"],
      "@id": `${BASE_URL}/locations/${stateSlug}/${citySlug}#enhanced-business`,
      name: `NRPG Disaster Recovery - ${location.city}`,
      image: [
        `${BASE_URL}/images/locations/${citySlug}-team.jpg`,
        `${BASE_URL}/images/locations/${citySlug}-equipment.jpg`,
      ],
      url: `${BASE_URL}/locations/${stateSlug}/${citySlug}`,

      address: {
        "@type": "PostalAddress",
        addressLocality: location.city,
        addressRegion: location.state,
        addressCountry: "AU",
      },

      geo: {
        "@type": "GeoCoordinates",
        latitude: location.latitude,
        longitude: location.longitude,
      },

      areaServed: {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: location.latitude,
          longitude: location.longitude,
        },
        geoRadius: serviceRadiusMeters.toString(),
      },

      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59",
      },

      makesOffer: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: primaryService,
            description: `Emergency ${primaryService.toLowerCase()} for ${location.city} residents`,
          },
        },
        ...SERVICE_PILLARS.map(pillar => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: pillar.title },
        })),
      ],

      ...(location.population && {
        additionalProperty: {
          "@type": "PropertyValue",
          name: "Population Served",
          value: location.population,
        },
      }),

      priceRange: "$$",
      paymentAccepted: "Cash, Credit Card, Bank Transfer, Insurance Direct Billing",
    };
  }

  /**
   * FAQ Schema - For rich snippets
   */
  generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(faq => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
  }

  /**
   * HowTo Schema - For guides and instructional content
   */
  generateHowToSchema(guide: {
    title: string;
    description: string;
    steps: Array<{ title: string; description: string; image?: string }>;
  }) {
    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: guide.title,
      description: guide.description,

      step: guide.steps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        text: step.description,
        ...(step.image && { image: step.image }),
      })),
    };
  }

  /**
   * Review Schema - For testimonials
   */
  generateReviewSchema(review: {
    rating: number;
    author: string;
    content: string;
    date: string;
  }) {
    return {
      "@context": "https://schema.org",
      "@type": "Review",
      itemReviewed: {
        "@id": `${BASE_URL}/#organization`,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: "5",
        worstRating: "1",
      },
      author: {
        "@type": "Person",
        name: review.author,
      },
      reviewBody: review.content,
      datePublished: review.date,
    };
  }

  /**
   * BreadcrumbList Schema - For navigation
   */
  generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    };
  }

  /**
   * Article Schema - For blog posts
   */
  generateArticleSchema(article: {
    title: string;
    description: string;
    author: string;
    publishedDate: string;
    modifiedDate?: string;
    image?: string;
  }) {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.description,

      author: {
        "@type": "Organization",
        name: article.author || "NRPG Australia",
      },

      publisher: {
        "@id": `${BASE_URL}/#organization`,
      },

      datePublished: article.publishedDate,
      dateModified: article.modifiedDate || article.publishedDate,

      ...(article.image && {
        image: {
          "@type": "ImageObject",
          url: article.image,
        },
      }),
    };
  }

  /**
   * Helper: Combine multiple schemas for a page
   */
  combineSchemas(...schemas: any[]) {
    return schemas;
  }
}

// Export singleton instance
export const schemaGenerator = new SchemaGenerator();
