// @ts-nocheck

/**
 * Google Business Profile Manager - NRPG Platform
 *
 * Automates GBP management for local SEO dominance across Australia:
 * - Create and manage GBP listings for major cities
 * - Automate weekly posts for engagement
 * - Monitor and respond to reviews
 * - Upload photos and manage media
 * - Track insights and performance
 *
 * API Integration: Google Business Profile API
 * Rate Limits: 10 requests/second (as per SEMrush recommendations)
 */

import {
  GBPLocationConfig,
  GBPLocationStatus,
  GBPPost,
  GBPPostType,
  GBPReview,
  GBPAddress,
  GBPAttribute,
  GBPCallToAction,
  GBPPhoto,
  GeoCoordinates,
  OpeningHoursSpec,
  LocalSEOApiResponse,
  AustralianStateCode,
} from './local-seo-types';
import { EMERGENCY_PHONE, AUSTRALIAN_LOCATIONS } from '@/lib/design-tokens';
import citiesData from '@/data/australian-cities.json';

// =============================================================================
// CONFIGURATION
// =============================================================================

const GBP_CONFIG = {
  baseUrl: 'https://mybusinessbusinessinformation.googleapis.com/v1',
  accountsUrl: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
  apiVersion: 'v1',
  rateLimit: 10, // requests per second
  defaultServiceRadius: 50, // km
  businessName: 'NRPG Disaster Recovery',
  phone: EMERGENCY_PHONE.number,
  website: 'https://disasterrecovery.com.au',
};

/**
 * Priority cities for GBP listings (top 10)
 */
const PRIORITY_CITIES = [
  'Sydney',
  'Melbourne',
  'Brisbane',
  'Perth',
  'Adelaide',
  'Gold Coast',
  'Canberra',
  'Newcastle',
  'Hobart',
  'Darwin',
];

/**
 * GBP business categories for disaster recovery
 */
const GBP_CATEGORIES = {
  primary: 'Emergency restoration service',
  additional: [
    'Water damage restoration service',
    'Fire damage restoration service',
    'Mold removal service',
  ],
};

/**
 * Default business attributes for all locations
 */
const DEFAULT_ATTRIBUTES: GBPAttribute[] = [
  { name: 'Emergency service', value: true },
  { name: '24/7 availability', value: true },
  { name: 'IICRC certified', value: true },
  { name: 'Insurance work accepted', value: true },
  { name: 'Free inspections', value: true },
  { name: 'Online estimates', value: true },
  { name: 'Identifies as Australian-owned', value: true },
];

/**
 * 24/7 opening hours specification
 */
const HOURS_24_7: OpeningHoursSpec = {
  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  opens: '00:00',
  closes: '23:59',
  is24Hours: true,
};

// =============================================================================
// GBP MANAGER CLASS
// =============================================================================

export class GoogleBusinessProfileManager {
  private accessToken: string | null = null;
  private accountId: string | null = null;
  private locations: Map<string, GBPLocationConfig> = new Map();
  private requestCount = 0;
  private lastRequestTime = 0;

  constructor(config?: { accessToken?: string; accountId?: string }) {
    if (config?.accessToken) {
      this.accessToken = config.accessToken;
    }
    if (config?.accountId) {
      this.accountId = config.accountId;
    }
  }

  // ===========================================================================
  // AUTHENTICATION
  // ===========================================================================

  /**
   * Initialize with OAuth2 access token
   */
  async authenticate(credentials: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  }): Promise<boolean> {
    try {
      // In production, exchange refresh token for access token
      // This is a placeholder for the OAuth flow
      const tokenResponse = await this.exchangeRefreshToken(credentials);
      this.accessToken = tokenResponse.accessToken;
      return true;
    } catch (error) {
      console.error('[GBP] Authentication failed:', error);
      return false;
    }
  }

  private async exchangeRefreshToken(credentials: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  }): Promise<{ accessToken: string; expiresIn: number }> {
    // OAuth2 token exchange implementation
    // In production, this would call Google's OAuth endpoint
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        refresh_token: credentials.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  }

  // ===========================================================================
  // LOCATION MANAGEMENT
  // ===========================================================================

  /**
   * Create a new GBP location
   */
  async createLocation(locationData: {
    city: string;
    state: string;
    stateCode: AustralianStateCode;
    latitude: number;
    longitude: number;
    address?: Partial<GBPAddress>;
  }): Promise<LocalSEOApiResponse<GBPLocationConfig>> {
    await this.enforceRateLimit();

    const locationId = this.generateLocationId(locationData.city, locationData.stateCode);
    const citySlug = locationData.city.toLowerCase().replace(/\s+/g, '-');
    const stateSlug = locationData.stateCode.toLowerCase();

    const config: GBPLocationConfig = {
      id: locationId,
      businessName: `${GBP_CONFIG.businessName} - ${locationData.city}`,
      city: locationData.city,
      stateCode: locationData.stateCode,
      address: {
        addressLine1: locationData.address?.addressLine1 || '',
        locality: locationData.city,
        region: locationData.state,
        postalCode: locationData.address?.postalCode || '',
        country: 'Australia',
        countryCode: 'AU',
      },
      coordinates: {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      },
      serviceRadius: GBP_CONFIG.defaultServiceRadius,
      phone: GBP_CONFIG.phone,
      websiteUrl: `${GBP_CONFIG.website}/locations/${stateSlug}/${citySlug}`,
      primaryCategory: 'Emergency restoration service',
      additionalCategories: GBP_CATEGORIES.additional as any[],
      description: this.generateLocationDescription(locationData.city, locationData.stateCode),
      openingHours: HOURS_24_7,
      attributes: DEFAULT_ATTRIBUTES,
      photos: {
        gallery: [],
        team: [],
        projects: [],
      },
      status: 'pending_creation',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store locally
    this.locations.set(locationId, config);

    // In production, make API call to create location
    if (this.accessToken && this.accountId) {
      try {
        const apiPayload = this.buildCreateLocationPayload(config);
        const response = await this.makeApiRequest(
          `${GBP_CONFIG.accountsUrl}/${this.accountId}/locations`,
          'POST',
          apiPayload
        );

        if (response.ok) {
          const data = await response.json();
          config.id = data.name?.split('/').pop() || config.id;
          config.status = 'pending_verification';
          this.locations.set(config.id, config);
        }
      } catch (error) {
        console.error('[GBP] Failed to create location via API:', error);
      }
    }

    return {
      success: true,
      data: config,
      meta: {
        timestamp: new Date(),
        requestId: `gbp-create-${Date.now()}`,
      },
    };
  }

  /**
   * Update an existing GBP location
   */
  async updateLocation(
    locationId: string,
    updates: Partial<GBPLocationConfig>
  ): Promise<LocalSEOApiResponse<GBPLocationConfig>> {
    await this.enforceRateLimit();

    const existing = this.locations.get(locationId);
    if (!existing) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Location ${locationId} not found`,
        },
      };
    }

    const updated: GBPLocationConfig = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    this.locations.set(locationId, updated);

    // In production, make API call to update
    if (this.accessToken && this.accountId) {
      try {
        const response = await this.makeApiRequest(
          `${GBP_CONFIG.accountsUrl}/${this.accountId}/locations/${locationId}`,
          'PATCH',
          updates
        );

        if (!response.ok) {
          console.warn('[GBP] API update failed, using local data');
        }
      } catch (error) {
        console.error('[GBP] Failed to update location via API:', error);
      }
    }

    return {
      success: true,
      data: updated,
      meta: {
        timestamp: new Date(),
        requestId: `gbp-update-${Date.now()}`,
      },
    };
  }

  /**
   * Get a location by ID
   */
  async getLocation(locationId: string): Promise<LocalSEOApiResponse<GBPLocationConfig | null>> {
    const location = this.locations.get(locationId);
    return {
      success: true,
      data: location || null,
      meta: {
        timestamp: new Date(),
        requestId: `gbp-get-${Date.now()}`,
      },
    };
  }

  /**
   * List all GBP locations
   */
  async listLocations(): Promise<LocalSEOApiResponse<GBPLocationConfig[]>> {
    return {
      success: true,
      data: Array.from(this.locations.values()),
      meta: {
        timestamp: new Date(),
        requestId: `gbp-list-${Date.now()}`,
      },
    };
  }

  /**
   * Delete a GBP location
   */
  async deleteLocation(locationId: string): Promise<LocalSEOApiResponse<boolean>> {
    const exists = this.locations.has(locationId);
    if (!exists) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Location ${locationId} not found`,
        },
      };
    }

    this.locations.delete(locationId);

    // In production, make API call to delete
    if (this.accessToken && this.accountId) {
      try {
        await this.makeApiRequest(
          `${GBP_CONFIG.accountsUrl}/${this.accountId}/locations/${locationId}`,
          'DELETE'
        );
      } catch (error) {
        console.error('[GBP] Failed to delete location via API:', error);
      }
    }

    return {
      success: true,
      data: true,
      meta: {
        timestamp: new Date(),
        requestId: `gbp-delete-${Date.now()}`,
      },
    };
  }

  // ===========================================================================
  // GBP POSTS MANAGEMENT
  // ===========================================================================

  /**
   * Create and publish a GBP post
   */
  async postUpdate(
    locationId: string,
    content: {
      type?: GBPPostType;
      summary: string;
      callToAction?: GBPCallToAction;
      media?: { url: string; mediaFormat: 'PHOTO' | 'VIDEO'; description?: string };
      scheduledAt?: Date;
    }
  ): Promise<LocalSEOApiResponse<GBPPost>> {
    await this.enforceRateLimit();

    const post: GBPPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      locationId,
      type: content.type || 'UPDATE',
      summary: content.summary.substring(0, 1500), // GBP limit
      callToAction: content.callToAction,
      media: content.media,
      scheduledAt: content.scheduledAt,
      publishedAt: content.scheduledAt ? undefined : new Date(),
      status: content.scheduledAt ? 'scheduled' : 'published',
    };

    // In production, make API call to create post
    if (this.accessToken && this.accountId) {
      try {
        const response = await this.makeApiRequest(
          `${GBP_CONFIG.accountsUrl}/${this.accountId}/locations/${locationId}/localPosts`,
          'POST',
          {
            languageCode: 'en-AU',
            summary: post.summary,
            callToAction: post.callToAction,
            media: post.media
              ? {
                  sourceUrl: post.media.sourceUrl,
                  mediaFormat: post.media.mediaFormat,
                }
              : undefined,
          }
        );

        if (response.ok) {
          const data = await response.json();
          post.id = data.name?.split('/').pop() || post.id;
        }
      } catch (error) {
        console.error('[GBP] Failed to create post via API:', error);
      }
    }

    return {
      success: true,
      data: post,
      meta: {
        timestamp: new Date(),
        requestId: `gbp-post-${Date.now()}`,
      },
    };
  }

  /**
   * Generate weekly posts for all locations
   */
  async generateWeeklyPosts(): Promise<LocalSEOApiResponse<GBPPost[]>> {
    const posts: GBPPost[] = [];
    const postTemplates = this.getPostTemplates();

    for (const location of this.locations.values()) {
      const template = postTemplates[Math.floor(Math.random() * postTemplates.length)];
      const localizedContent = this.localizePostContent(template, location);

      const result = await this.postUpdate(location.id, {
        type: 'UPDATE',
        summary: localizedContent,
        callToAction: {
          actionType: 'CALL',
          url: `tel:${GBP_CONFIG.phone.replace(/\s/g, '')}`,
        },
      });

      if (result.success && result.data) {
        posts.push(result.data);
      }
    }

    return {
      success: true,
      data: posts,
      meta: {
        timestamp: new Date(),
        requestId: `gbp-weekly-posts-${Date.now()}`,
      },
    };
  }

  // ===========================================================================
  // REVIEW MANAGEMENT
  // ===========================================================================

  /**
   * Monitor reviews across all locations
   */
  async monitorReviews(): Promise<LocalSEOApiResponse<GBPReview[]>> {
    await this.enforceRateLimit();

    const allReviews: GBPReview[] = [];

    for (const location of this.locations.values()) {
      if (this.accessToken && this.accountId) {
        try {
          const response = await this.makeApiRequest(
            `${GBP_CONFIG.accountsUrl}/${this.accountId}/locations/${location.id}/reviews`,
            'GET'
          );

          if (response.ok) {
            const data = await response.json();
            const reviews = this.parseReviewsResponse(data, location.id);
            allReviews.push(...reviews);
          }
        } catch (error) {
          console.error('[GBP] Failed to fetch reviews for %s:', location.id, error);
        }
      }
    }

    // Sort by date, newest first
    allReviews.sort((a, b) => b.createTime.getTime() - a.createTime.getTime());

    return {
      success: true,
      data: allReviews,
      meta: {
        timestamp: new Date(),
        requestId: `gbp-reviews-${Date.now()}`,
      },
    };
  }

  /**
   * Respond to a review
   */
  async respondToReview(
    reviewId: string,
    response: string
  ): Promise<LocalSEOApiResponse<boolean>> {
    await this.enforceRateLimit();

    if (this.accessToken && this.accountId) {
      try {
        const apiResponse = await this.makeApiRequest(
          `${GBP_CONFIG.accountsUrl}/${this.accountId}/reviews/${reviewId}/reply`,
          'PUT',
          { comment: response }
        );

        return {
          success: apiResponse.ok,
          data: apiResponse.ok,
          meta: {
            timestamp: new Date(),
            requestId: `gbp-reply-${Date.now()}`,
          },
        };
      } catch (error) {
        console.error('[GBP] Failed to respond to review:', error);
      }
    }

    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Failed to respond to review',
      },
    };
  }

  /**
   * Generate auto-response for reviews based on sentiment
   */
  generateReviewResponse(review: GBPReview): string {
    const locationName = this.locations.get(review.locationId)?.city || 'your area';

    if (review.starRating >= 4) {
      return this.getPositiveReviewResponse(review.reviewer.displayName, locationName);
    } else if (review.starRating === 3) {
      return this.getNeutralReviewResponse(review.reviewer.displayName, locationName);
    } else {
      return this.getNegativeReviewResponse(review.reviewer.displayName, locationName);
    }
  }

  // ===========================================================================
  // PHOTO MANAGEMENT
  // ===========================================================================

  /**
   * Upload photos to a location
   */
  async uploadPhotos(
    locationId: string,
    photos: GBPPhoto[]
  ): Promise<LocalSEOApiResponse<GBPPhoto[]>> {
    await this.enforceRateLimit();

    const uploadedPhotos: GBPPhoto[] = [];

    for (const photo of photos) {
      if (this.accessToken && this.accountId) {
        try {
          const response = await this.makeApiRequest(
            `${GBP_CONFIG.accountsUrl}/${this.accountId}/locations/${locationId}/media`,
            'POST',
            {
              mediaFormat: 'PHOTO',
              sourceUrl: photo.url,
              category: this.mapPhotoCategoryToApi(photo.category),
              description: photo.description,
            }
          );

          if (response.ok) {
            uploadedPhotos.push({
              ...photo,
              uploadedAt: new Date(),
            });
          }
        } catch (error) {
          console.error('[GBP] Failed to upload photo:', error);
        }
      }
    }

    // Update local cache
    const location = this.locations.get(locationId);
    if (location) {
      location.photos.gallery.push(...uploadedPhotos);
      this.locations.set(locationId, location);
    }

    return {
      success: true,
      data: uploadedPhotos,
      meta: {
        timestamp: new Date(),
        requestId: `gbp-photos-${Date.now()}`,
      },
    };
  }

  // ===========================================================================
  // HOURS MANAGEMENT
  // ===========================================================================

  /**
   * Update business hours (always 24/7 for emergency services)
   */
  async updateHours(
    locationId: string,
    hours: OpeningHoursSpec
  ): Promise<LocalSEOApiResponse<boolean>> {
    await this.enforceRateLimit();

    const location = this.locations.get(locationId);
    if (!location) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Location ${locationId} not found`,
        },
      };
    }

    location.openingHours = hours;
    location.updatedAt = new Date();
    this.locations.set(locationId, location);

    if (this.accessToken && this.accountId) {
      try {
        await this.makeApiRequest(
          `${GBP_CONFIG.accountsUrl}/${this.accountId}/locations/${locationId}`,
          'PATCH',
          {
            regularHours: {
              periods: hours.is24Hours
                ? hours.dayOfWeek.map(day => ({
                    openDay: day.toUpperCase(),
                    closeDay: day.toUpperCase(),
                    openTime: { hours: 0, minutes: 0 },
                    closeTime: { hours: 23, minutes: 59 },
                  }))
                : [],
            },
          }
        );
      } catch (error) {
        console.error('[GBP] Failed to update hours via API:', error);
      }
    }

    return {
      success: true,
      data: true,
      meta: {
        timestamp: new Date(),
        requestId: `gbp-hours-${Date.now()}`,
      },
    };
  }

  // ===========================================================================
  // BULK OPERATIONS
  // ===========================================================================

  /**
   * Initialize GBP locations for all priority cities
   */
  async initializePriorityLocations(): Promise<LocalSEOApiResponse<GBPLocationConfig[]>> {
    const createdLocations: GBPLocationConfig[] = [];

    for (const cityName of PRIORITY_CITIES) {
      const cityData = citiesData.cities.find(c => c.city === cityName);
      if (!cityData) continue;

      const stateInfo = AUSTRALIAN_LOCATIONS.find(s => s.code === cityData.stateCode);
      if (!stateInfo) continue;

      const result = await this.createLocation({
        city: cityData.city,
        state: stateInfo.name,
        stateCode: cityData.stateCode as AustralianStateCode,
        latitude: cityData.latitude,
        longitude: cityData.longitude,
      });

      if (result.success && result.data) {
        createdLocations.push(result.data);
      }

      // Small delay between creations to avoid rate limits
      await this.delay(100);
    }

    return {
      success: true,
      data: createdLocations,
      meta: {
        timestamp: new Date(),
        requestId: `gbp-init-${Date.now()}`,
      },
    };
  }

  /**
   * Initialize GBP locations for all cities in database
   */
  async initializeAllLocations(): Promise<LocalSEOApiResponse<GBPLocationConfig[]>> {
    const createdLocations: GBPLocationConfig[] = [];

    for (const cityData of citiesData.cities) {
      const stateInfo = AUSTRALIAN_LOCATIONS.find(s => s.code === cityData.stateCode);
      if (!stateInfo) continue;

      const result = await this.createLocation({
        city: cityData.city,
        state: stateInfo.name,
        stateCode: cityData.stateCode as AustralianStateCode,
        latitude: cityData.latitude,
        longitude: cityData.longitude,
      });

      if (result.success && result.data) {
        createdLocations.push(result.data);
      }

      await this.delay(100);
    }

    return {
      success: true,
      data: createdLocations,
      meta: {
        timestamp: new Date(),
        requestId: `gbp-init-all-${Date.now()}`,
      },
    };
  }

  // ===========================================================================
  // PRIVATE HELPER METHODS
  // ===========================================================================

  private generateLocationId(city: string, stateCode: string): string {
    return `nrpg-${city.toLowerCase().replace(/\s+/g, '-')}-${stateCode.toLowerCase()}`;
  }

  private generateLocationDescription(city: string, stateCode: AustralianStateCode): string {
    return `NRPG Disaster Recovery provides 24/7 emergency restoration services in ${city} and surrounding ${stateCode} areas. Our IICRC-certified technicians specialize in water damage, fire damage, mould remediation, and biohazard cleanup. Priority emergency dispatch. All insurers accepted. Call ${GBP_CONFIG.phone} for immediate assistance.`;
  }

  private buildCreateLocationPayload(config: GBPLocationConfig): Record<string, unknown> {
    return {
      languageCode: 'en-AU',
      locationName: config.businessName,
      primaryPhone: config.phone,
      websiteUrl: config.websiteUrl,
      address: {
        addressLines: [config.address.addressLine1, config.address.addressLine2].filter(Boolean),
        locality: config.address.locality,
        administrativeArea: config.address.region,
        postalCode: config.address.postalCode,
        regionCode: 'AU',
      },
      latlng: {
        latitude: config.coordinates.latitude,
        longitude: config.coordinates.longitude,
      },
      primaryCategoryId: config.primaryCategory,
      additionalCategories: config.additionalCategories.map(cat => ({ categoryId: cat })),
      serviceArea: {
        businessType: 'CUSTOMER_AND_BUSINESS_LOCATION',
        places: {
          placeInfos: [
            {
              name: config.city,
            },
          ],
        },
        regionCode: 'AU',
      },
    };
  }

  private async makeApiRequest(
    url: string,
    method: string,
    body?: Record<string, unknown>
  ): Promise<Response> {
    await this.enforceRateLimit();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < 1000 / GBP_CONFIG.rateLimit) {
      await this.delay(1000 / GBP_CONFIG.rateLimit - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getPostTemplates(): string[] {
    return [
      'Need emergency water damage restoration in {{city}}? Our IICRC-certified team is on standby 24/7 for priority dispatch. Request service at disasterrecovery.com.au for immediate assistance.',
      '{{city}} residents: Experiencing flood damage? Don\'t wait — water damage worsens every hour. Submit a request at disasterrecovery.com.au and our experts will respond immediately.',
      'Fire or smoke damage in {{city}}? NRPG provides complete restoration including soot removal, odour elimination, and structural repairs. Get started at disasterrecovery.com.au.',
      'Mould found in your {{city}} property? Our certified technicians safely remove all mould and prevent future growth. Free inspection — request via disasterrecovery.com.au.',
      'Storm damage affecting your {{city}} home? Emergency tarping, water extraction, and complete restoration available 24/7. Request service at disasterrecovery.com.au.',
      'Trust {{city}}\'s leading disaster recovery team. NRPG: IICRC certified, all insurers accepted, priority response. disasterrecovery.com.au.',
      'Recent flooding in {{city}}? Acting fast prevents mould! Our emergency team extracts water and dries structures completely. Request urgent help at disasterrecovery.com.au.',
      'Commercial property damage in {{city}}? NRPG minimises business downtime with rapid-response restoration. Submit a priority request at disasterrecovery.com.au.',
    ];
  }

  private localizePostContent(template: string, location: GBPLocationConfig): string {
    return template
      .replace(/\{\{city\}\}/g, location.city)
      .replace(/\{\{state\}\}/g, location.stateCode);
  }

  private getPositiveReviewResponse(name: string, location: string): string {
    const responses = [
      `Thank you so much, ${name}! We're thrilled we could help restore your property in ${location}. Your recommendation means everything to our team. If you ever need us again, simply request service at disasterrecovery.com.au.`,
      `We truly appreciate your kind words, ${name}! Its our mission to provide ${location} with the best disaster recovery services, and reviews like yours motivate our entire team. Thank you for trusting NRPG.`,
      `${name}, thank you for this wonderful review! Nothing makes us happier than knowing we could help during a stressful time. The entire ${location} team sends their gratitude.`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getNeutralReviewResponse(name: string, location: string): string {
    return `Thank you for your feedback, ${name}. We appreciate you taking the time to share your experience with NRPG ${location}. We're always looking to improve our services. Please don't hesitate to reach out via disasterrecovery.com.au/contact if there's anything we can do to better meet your expectations.`;
  }

  private getNegativeReviewResponse(name: string, location: string): string {
    return `${name}, we're truly sorry to hear about your experience. This is not the level of service we strive to provide in ${location}. We take all feedback seriously and would like to address your concerns personally. Please contact our customer care team via disasterrecovery.com.au/contact so we can make things right.`;
  }

  private parseReviewsResponse(data: any, locationId: string): GBPReview[] {
    if (!data.reviews) return [];

    return data.reviews.map((review: any) => ({
      reviewId: review.name?.split('/').pop() || '',
      locationId,
      reviewer: {
        displayName: review.reviewer?.displayName || 'Anonymous',
        profilePhotoUrl: review.reviewer?.profilePhotoUrl,
        isAnonymous: !review.reviewer?.displayName,
      },
      starRating: this.parseStarRating(review.starRating),
      comment: review.comment,
      createTime: new Date(review.createTime),
      updateTime: review.updateTime ? new Date(review.updateTime) : undefined,
      reviewReply: review.reviewReply
        ? {
            comment: review.reviewReply.comment,
            updateTime: new Date(review.reviewReply.updateTime),
          }
        : undefined,
      status: review.reviewReply ? 'responded' : 'new',
    }));
  }

  private parseStarRating(rating: string): 1 | 2 | 3 | 4 | 5 {
    const map: Record<string, 1 | 2 | 3 | 4 | 5> = {
      ONE: 1,
      TWO: 2,
      THREE: 3,
      FOUR: 4,
      FIVE: 5,
    };
    return map[rating] || 5;
  }

  private mapPhotoCategoryToApi(
    category: GBPPhoto['category']
  ): string {
    const map: Record<GBPPhoto['category'], string> = {
      exterior: 'EXTERIOR',
      interior: 'INTERIOR',
      product: 'PRODUCT',
      at_work: 'AT_WORK',
      team: 'TEAM',
      logo: 'LOGO',
      cover: 'COVER',
    };
    return map[category] || 'ADDITIONAL';
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const gbpManager = new GoogleBusinessProfileManager();

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export { GBP_CONFIG, PRIORITY_CITIES, GBP_CATEGORIES, DEFAULT_ATTRIBUTES, HOURS_24_7 };
