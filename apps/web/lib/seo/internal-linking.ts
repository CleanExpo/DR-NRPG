/**
 * Internal Linking System - NRPG SEO
 *
 * Implements hub-and-spoke internal linking model:
 * - Service hub pages → Location pages
 * - Location hub pages → Service pages
 * - Service + Location pages → Related services and nearby locations
 *
 * Critical for:
 * - PageRank flow
 * - Crawl depth reduction
 * - Semantic relevance
 * - User navigation
 */

import servicesData from '@/data/services.json';
import { SITE_URL } from '@/lib/seo/site-url';
import citiesData from '@/data/australian-cities.json';
import { AUSTRALIAN_LOCATIONS } from '@/lib/design-tokens';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface InternalLink {
  text: string;
  url: string;
  rel?: 'prev' | 'next' | 'related';
  title?: string;
}

export class InternalLinkingSystem {
  private readonly baseUrl = SITE_URL;

  /**
   * Generate breadcrumbs for any page
   */
  generateBreadcrumbs(page: {
    type: 'service' | 'location' | 'service-location';
    serviceSlug?: string;
    city?: string;
    state?: string;
  }): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Home', url: '/' },
    ];

    if (page.type === 'service' && page.serviceSlug) {
      breadcrumbs.push(
        { name: 'Services', url: '/services' },
        { name: this.getServiceTitle(page.serviceSlug), url: `/services/${page.serviceSlug}` }
      );
    } else if (page.type === 'location' && page.city && page.state) {
      breadcrumbs.push(
        { name: 'Locations', url: '/locations' },
        { name: page.state, url: `/locations/${page.state.toLowerCase()}` },
        { name: page.city, url: `/locations/${page.state.toLowerCase()}/${this.getCitySlug(page.city)}` }
      );
    } else if (page.type === 'service-location' && page.serviceSlug && page.city && page.state) {
      breadcrumbs.push(
        { name: 'Services', url: '/services' },
        { name: this.getServiceTitle(page.serviceSlug), url: `/services/${page.serviceSlug}` },
        {
          name: `${page.city}, ${page.state}`,
          url: `/services/${page.serviceSlug}/${this.getCitySlug(page.city)}`,
        }
      );
    }

    return breadcrumbs;
  }

  /**
   * Generate related service links for a service page
   */
  getRelatedServiceLinks(currentServiceSlug: string, limit: number = 6): InternalLink[] {
    const currentService = servicesData.services.find(s => s.slug === currentServiceSlug);
    if (!currentService) return [];

    // Get services in same category first
    const sameCategory = servicesData.services
      .filter(s => s.category === currentService.category && s.slug !== currentServiceSlug)
      .slice(0, 3);

    // Then get services from other categories
    const otherCategories = servicesData.services
      .filter(s => s.category !== currentService.category && s.slug !== currentServiceSlug)
      .slice(0, limit - sameCategory.length);

    return [...sameCategory, ...otherCategories].map(service => ({
      text: service.title,
      url: `/services/${service.slug}`,
      rel: 'related' as const,
      title: `Learn about our ${service.title.toLowerCase()} services`,
    }));
  }

  /**
   * Generate location links for a service page
   */
  getServiceLocationLinks(serviceSlug: string, limit: number = 12): InternalLink[] {
    // Prioritize major cities
    const majorCities = citiesData.cities
      .filter(c => c.population > 200000)
      .sort((a, b) => b.population - a.population)
      .slice(0, 8);

    // Add some regional cities
    const regionalCities = citiesData.cities
      .filter(c => c.population <= 200000)
      .slice(0, limit - majorCities.length);

    return [...majorCities, ...regionalCities].map(city => ({
      text: `${city.city}, ${city.state}`,
      url: `/services/${serviceSlug}/${city.slug}`,
      title: `${this.getServiceTitle(serviceSlug)} in ${city.city}`,
    }));
  }

  /**
   * Generate service links for a location page
   */
  getLocationServiceLinks(citySlug: string): InternalLink[] {
    const city = citiesData.cities.find(c => c.slug === citySlug);
    if (!city) return [];

    // Prioritize services based on local statistics
    let prioritizedServices = [...servicesData.services];

    if (city.localStats.avgAnnualFloods > 15) {
      // Flood-prone area - prioritize water services
      prioritizedServices = this.prioritizeCategory(prioritizedServices, 'water');
    } else if (city.localStats.avgAnnualFires > 15) {
      // Fire-prone area - prioritize fire services
      prioritizedServices = this.prioritizeCategory(prioritizedServices, 'fire');
    } else if (city.localStats.avgHumidity > 70) {
      // High humidity - prioritize mould services
      prioritizedServices = this.prioritizeCategory(prioritizedServices, 'mould');
    }

    return prioritizedServices.slice(0, 8).map(service => ({
      text: service.title,
      url: `/services/${service.slug}/${citySlug}`,
      title: `${service.title} services in ${city.city}`,
    }));
  }

  /**
   * Generate nearby location links
   */
  getNearbyLocationLinks(citySlug: string, limit: number = 6): InternalLink[] {
    const city = citiesData.cities.find(c => c.slug === citySlug);
    if (!city) return [];

    // Find cities in same state
    const sameSate = citiesData.cities
      .filter(c => c.stateCode === city.stateCode && c.slug !== citySlug)
      .slice(0, limit);

    return sameSate.map(nearbyCity => ({
      text: `${nearbyCity.city}, ${nearbyCity.state}`,
      url: `/locations/${nearbyCity.stateCode.toLowerCase()}/${nearbyCity.slug}`,
      rel: 'related' as const,
      title: `Disaster recovery services in ${nearbyCity.city}`,
    }));
  }

  /**
   * Generate service + location page links
   */
  getServiceLocationPageLinks(params: {
    serviceSlug: string;
    citySlug: string;
  }): {
    relatedServices: InternalLink[];
    nearbyLocations: InternalLink[];
    sameServiceOtherLocations: InternalLink[];
  } {
    const city = citiesData.cities.find(c => c.slug === params.citySlug);
    if (!city) {
      return { relatedServices: [], nearbyLocations: [], sameServiceOtherLocations: [] };
    }

    // Related services in same location
    const relatedServices = this.getRelatedServiceLinks(params.serviceSlug, 4).map(link => ({
      ...link,
      url: `/services/${link.url.split('/').pop()}/${params.citySlug}`,
    }));

    // Nearby locations for same service
    const nearbyLocations = this.getNearbyLocationLinks(params.citySlug, 4).map(link => ({
      text: link.text,
      url: `/services/${params.serviceSlug}/${link.url.split('/').pop()}`,
      title: `${this.getServiceTitle(params.serviceSlug)} in ${link.text}`,
    }));

    // Same service, major cities
    const majorCities = citiesData.cities
      .filter(c => c.population > 300000 && c.slug !== params.citySlug)
      .slice(0, 4);

    const sameServiceOtherLocations = majorCities.map(city => ({
      text: `${city.city}, ${city.state}`,
      url: `/services/${params.serviceSlug}/${city.slug}`,
      title: `${this.getServiceTitle(params.serviceSlug)} in ${city.city}`,
    }));

    return {
      relatedServices,
      nearbyLocations,
      sameServiceOtherLocations,
    };
  }

  /**
   * Generate state overview links
   */
  getStateLinks(): InternalLink[] {
    return AUSTRALIAN_LOCATIONS.map(state => ({
      text: state.name,
      url: `/locations/${state.code.toLowerCase()}`,
      title: `Disaster recovery services in ${state.name}`,
    }));
  }

  /**
   * Generate service category links
   */
  getServiceCategoryLinks(): InternalLink[] {
    const categories = [
      { name: 'Water & Flood Damage', slug: 'water-damage-restoration', category: 'water' },
      { name: 'Fire & Smoke Damage', slug: 'fire-damage-restoration', category: 'fire' },
      { name: 'Mould Remediation', slug: 'mould-remediation', category: 'mould' },
      { name: 'Biohazard Cleanup', slug: 'biohazard-cleanup', category: 'bio' },
    ];

    return categories.map(cat => ({
      text: cat.name,
      url: `/services/${cat.slug}`,
      title: `Professional ${cat.name.toLowerCase()} services`,
    }));
  }

  /**
   * Generate sitemap structure for crawlers
   */
  generateSitemapStructure(): {
    services: Array<{ url: string; priority: number; changefreq: string }>;
    locations: Array<{ url: string; priority: number; changefreq: string }>;
    serviceLocations: Array<{ url: string; priority: number; changefreq: string }>;
  } {
    const services = servicesData.services.map(service => ({
      url: `/services/${service.slug}`,
      priority: 0.8,
      changefreq: 'weekly',
    }));

    const locations = citiesData.cities.map(city => ({
      url: `/locations/${city.stateCode.toLowerCase()}/${city.slug}`,
      priority: city.population > 500000 ? 0.7 : 0.6,
      changefreq: 'monthly',
    }));

    const serviceLocations: Array<{ url: string; priority: number; changefreq: string }> = [];
    servicesData.services.forEach(service => {
      citiesData.cities.forEach(city => {
        const priority = city.population > 500000 ? 0.6 : 0.5;
        serviceLocations.push({
          url: `/services/${service.slug}/${city.slug}`,
          priority,
          changefreq: 'monthly',
        });
      });
    });

    return { services, locations, serviceLocations };
  }

  /**
   * Helper methods
   */
  private getServiceTitle(slug: string): string {
    const service = servicesData.services.find(s => s.slug === slug);
    return service?.title || slug;
  }

  private getCitySlug(cityName: string): string {
    const city = citiesData.cities.find(c => c.city === cityName);
    return city?.slug || cityName.toLowerCase().replace(/\s/g, '-');
  }

  private prioritizeCategory(services: any[], category: string): any[] {
    const categoryServices = services.filter(s => s.category === category);
    const otherServices = services.filter(s => s.category !== category);
    return [...categoryServices, ...otherServices];
  }

  /**
   * Generate canonical URL
   */
  generateCanonicalUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  /**
   * Generate hreflang alternates for multi-region support
   */
  generateHreflangAlternates(path: string): Array<{ hreflang: string; href: string }> {
    return [
      { hreflang: 'en-AU', href: `${this.baseUrl}${path}` },
      { hreflang: 'x-default', href: `${this.baseUrl}${path}` },
    ];
  }
}

// Export singleton instance
export const internalLinking = new InternalLinkingSystem();

// Export helper for components
export function getBreadcrumbsForPage(page: {
  type: 'service' | 'location' | 'service-location';
  serviceSlug?: string;
  city?: string;
  state?: string;
}): BreadcrumbItem[] {
  return internalLinking.generateBreadcrumbs(page);
}
