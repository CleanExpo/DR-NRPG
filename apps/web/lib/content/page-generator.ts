/**
 * Page Generator - NRPG SEO Content System
 *
 * Generates SEO-optimized content for:
 * - Service pages (60+)
 * - Location pages (150+)
 * - Service + Location combinations (600+)
 *
 * Total: 800+ static pages for maximum SEO coverage
 */

import servicesData from '@/data/services.json';
import citiesData from '@/data/australian-cities.json';
import { SERVICE_PILLARS, AUSTRALIAN_LOCATIONS } from '@/lib/design-tokens';

export interface ServicePageData {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  description: string;
  protocol: string;
  category: string;
  keywords: string[];
  faqs: Array<{ question: string; answer: string }>;
  relatedServices: string[];
  locations: string[];
}

export interface LocationPageData {
  city: string;
  state: string;
  stateCode: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  description: string;
  population: number;
  latitude: number;
  longitude: number;
  localStats: {
    avgAnnualFloods: number;
    avgAnnualStorms: number;
    avgAnnualFires: number;
    avgHumidity: number;
  };
  keywords: string[];
  services: string[];
}

export interface ServiceLocationPageData {
  serviceSlug: string;
  serviceTitle: string;
  city: string;
  state: string;
  stateCode: string;
  locationSlug: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  description: string;
  keywords: string[];
  faqs: Array<{ question: string; answer: string }>;
}

export class PageGenerator {
  /**
   * Generate all service page data
   */
  generateServicePages(): ServicePageData[] {
    return servicesData.services.map(service => ({
      slug: service.slug,
      title: service.title,
      metaTitle: `${service.title} Australia | 24/7 Emergency Response | NRPG`,
      metaDescription: service.metaDescription,
      h1: `${service.title} Australia - 24/7 Emergency Response`,
      description: this.generateServiceDescription(service),
      protocol: service.protocol,
      category: service.category,
      keywords: service.keywords,
      faqs: service.faqs,
      relatedServices: this.getRelatedServices(service.slug),
      locations: this.getAllLocations(),
    }));
  }

  /**
   * Generate all location page data
   */
  generateLocationPages(): LocationPageData[] {
    return citiesData.cities.map(city => ({
      city: city.city,
      state: city.state,
      stateCode: city.stateCode,
      slug: city.slug,
      metaTitle: `Emergency Disaster Recovery ${city.city}, ${city.state} | 24/7 Response | NRPG`,
      metaDescription: `Professional disaster recovery services in ${city.city}, ${city.state}. 24/7 emergency response for water damage, fire restoration, flood cleanup. Contact us for service.`,
      h1: `Emergency Disaster Recovery in ${city.city}, ${city.state}`,
      description: this.generateLocationDescription(city),
      population: city.population,
      latitude: city.latitude,
      longitude: city.longitude,
      localStats: city.localStats,
      keywords: city.keywords,
      services: this.getAllServices(),
    }));
  }

  /**
   * Generate all service + location combination pages
   */
  generateServiceLocationPages(): ServiceLocationPageData[] {
    const pages: ServiceLocationPageData[] = [];

    servicesData.services.forEach(service => {
      citiesData.cities.forEach(city => {
        pages.push({
          serviceSlug: service.slug,
          serviceTitle: service.title,
          city: city.city,
          state: city.state,
          stateCode: city.stateCode,
          locationSlug: city.slug,
          metaTitle: `${service.title} ${city.city} | 24/7 Emergency Response | NRPG`,
          metaDescription: `Expert ${service.title.toLowerCase()} services in ${city.city}, ${city.state}. 24/7 emergency response, IICRC certified technicians. Contact us for service now.`,
          h1: `${service.title} in ${city.city}, ${city.state}`,
          description: this.generateServiceLocationDescription(service, city),
          keywords: [
            `${service.title.toLowerCase()} ${city.city.toLowerCase()}`,
            `${city.city.toLowerCase()} ${service.title.toLowerCase()}`,
            ...service.keywords.map(k => `${k} ${city.city.toLowerCase()}`),
          ],
          faqs: this.generateLocationSpecificFAQs(service, city),
        });
      });
    });

    return pages;
  }

  /**
   * Generate static params for Next.js generateStaticParams
   */
  generateServiceStaticParams() {
    return servicesData.services.map(service => ({
      'service-slug': service.slug,
    }));
  }

  generateLocationStaticParams() {
    return citiesData.cities.map(city => ({
      state: city.stateCode.toLowerCase(),
      city: city.slug,
    }));
  }

  generateServiceLocationStaticParams() {
    const params: Array<{ 'service-slug': string; location: string }> = [];

    servicesData.services.forEach(service => {
      citiesData.cities.forEach(city => {
        params.push({
          'service-slug': service.slug,
          location: city.slug,
        });
      });
    });

    return params;
  }

  /**
   * Private helper methods
   */
  private generateServiceDescription(service: any): string {
    return `Professional ${service.title.toLowerCase()} services across Australia. Our IICRC certified technicians provide 24/7 emergency response using industry-leading protocols. We specialize in rapid response, complete restoration, and thorough documentation for insurance claims. With over 15 years of experience and a network of vetted contractors nationwide, NRPG delivers forensic-level restoration that exceeds industry standards.`;
  }

  private generateLocationDescription(city: any): string {
    return `NRPG provides comprehensive emergency disaster recovery services throughout ${city.city} and the greater ${city.state} region. Our local contractor network responds to ${city.city}'s unique climate challenges, including ${city.localStats.avgAnnualStorms} annual storm events and ${city.localStats.avgAnnualFloods} flood incidents. With ${city.population.toLocaleString()} residents relying on rapid emergency response, our 24/7 dispatch center prioritises fast contractor connection across all ${city.city} suburbs and surrounding areas. We serve residential, commercial, and industrial properties.`;
  }

  private generateServiceLocationDescription(service: any, city: any): string {
    const localContext = this.getLocalContext(city);
    return `When ${service.title.toLowerCase()} emergencies strike in ${city.city}, NRPG's certified technicians respond immediately. ${localContext} Our certified specialists use advanced equipment and proven protocols to restore your property quickly and completely. We work directly with all major insurers serving ${city.city} and provide comprehensive documentation to support your claim. Available 24/7/365 across all ${city.city} suburbs and surrounding areas.`;
  }

  private getLocalContext(city: any): string {
    if (city.localStats.avgAnnualFloods > 15) {
      return `${city.city} experiences an average of ${city.localStats.avgAnnualFloods} flood events annually, making rapid water extraction and structural drying critical.`;
    } else if (city.localStats.avgAnnualFires > 15) {
      return `With ${city.localStats.avgAnnualFires} fire incidents annually in ${city.city}, our smoke remediation and fire restoration services are essential.`;
    } else if (city.localStats.avgAnnualStorms > 50) {
      return `${city.city} faces ${city.localStats.avgAnnualStorms} storm events each year, requiring expert storm damage restoration and emergency tarping.`;
    }
    return `Our ${city.city} team understands local climate challenges and responds rapidly to all disaster recovery needs.`;
  }

  private generateLocationSpecificFAQs(service: any, city: any): Array<{ question: string; answer: string }> {
    const baseFAQs = service.faqs.slice(0, 3); // Take first 3 FAQs from service
    const locationFAQs = [
      {
        question: `How quickly can you respond to ${service.title.toLowerCase()} emergencies in ${city.city}?`,
        answer: `Our ${city.city} contractor network provides 24/7 emergency response with rapid dispatch — technicians are deployed as quickly as possible (typically within 2 hours in metro areas). Local equipment and crews are maintained specifically for rapid deployment across ${city.city} suburbs.`,
      },
      {
        question: `Do you work with insurance companies in ${city.city}?`,
        answer: `Yes. We work with most major insurance providers servicing ${city.city} including NRMA, Suncorp, RACV, Allianz, and QBE. We provide detailed documentation and can communicate with adjusters to help streamline your claim.`,
      },
    ];

    return [...baseFAQs, ...locationFAQs];
  }

  private getRelatedServices(currentSlug: string): string[] {
    return servicesData.services
      .filter(s => s.slug !== currentSlug)
      .slice(0, 6)
      .map(s => s.slug);
  }

  private getAllServices(): string[] {
    return servicesData.services.map(s => s.slug);
  }

  private getAllLocations(): string[] {
    return citiesData.cities.map(c => c.slug);
  }

  /**
   * Get total page count
   */
  getTotalPageCount(): number {
    const servicePages = servicesData.services.length;
    const locationPages = citiesData.cities.length;
    const serviceLocationPages = servicesData.services.length * citiesData.cities.length;

    return servicePages + locationPages + serviceLocationPages;
  }

  /**
   * Get page generation stats
   */
  getStats() {
    return {
      servicePages: servicesData.services.length,
      locationPages: citiesData.cities.length,
      serviceLocationPages: servicesData.services.length * citiesData.cities.length,
      totalPages: this.getTotalPageCount(),
      servicesPerCategory: this.getServicesPerCategory(),
      citiesPerState: this.getCitiesPerState(),
    };
  }

  private getServicesPerCategory() {
    const categories: Record<string, number> = {};
    servicesData.services.forEach(service => {
      categories[service.category] = (categories[service.category] || 0) + 1;
    });
    return categories;
  }

  private getCitiesPerState() {
    const states: Record<string, number> = {};
    citiesData.cities.forEach(city => {
      states[city.stateCode] = (states[city.stateCode] || 0) + 1;
    });
    return states;
  }
}

// Export singleton instance
export const pageGenerator = new PageGenerator();

// Export helper functions
export function getServiceBySlug(slug: string) {
  return servicesData.services.find(s => s.slug === slug);
}

export function getCityBySlug(slug: string) {
  return citiesData.cities.find(c => c.slug === slug);
}

export function getCitiesByState(stateCode: string) {
  return citiesData.cities.filter(c => c.stateCode === stateCode);
}

export function getServicesByCategory(category: string) {
  return servicesData.services.filter(s => s.category === category);
}
