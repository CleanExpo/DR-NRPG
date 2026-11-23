/**
 * Google Business Profile (GBP) Manager
 *
 * Manages GBP creation, maintenance, and optimization for all 8 Australian capitals:
 * - Sydney (NSW)
 * - Melbourne (VIC)
 * - Brisbane (QLD)
 * - Perth (WA)
 * - Adelaide (SA)
 * - Canberra (ACT)
 * - Hobart (TAS)
 * - Darwin (NT)
 *
 * Features:
 * - Profile creation & verification
 * - Photo management (20+ per location)
 * - Weekly automated posts
 * - Review request automation
 * - Performance analytics
 * - Service radius & attributes
 * - Direct messaging setup
 */

import { EMERGENCY_PRICING } from '@/lib/design-tokens';

export interface GBPLocation {
  id: string;
  city: string;
  state: string;
  stateCode: string;
  latitude: number;
  longitude: number;
  serviceRadiusKm: number;
  businessName: string;
  address: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  businessHours: BusinessHours;
  categories: string[];
  services: ServiceOffering[];
  attributes: GBPAttribute[];
  photos: PhotoAsset[];
  reviews: ReviewMetrics;
  posts: PostMetrics;
  verified: boolean;
  createdAt?: Date;
}

interface BusinessHours {
  dayOfWeek: string;
  opens: string; // "00:00" for 24/7
  closes: string; // "23:59" for 24/7
  isOpen: boolean;
}

interface ServiceOffering {
  name: string;
  description: string;
  price: number;
  currency: string;
}

interface GBPAttribute {
  name: string;
  value: string; // e.g., "Yes", "No", "24/7", "All Major Insurers"
}

interface PhotoAsset {
  id: string;
  url: string;
  caption: string;
  uploadedAt: Date;
}

interface ReviewMetrics {
  averageRating: number;
  totalReviews: number;
  responseRate: number; // % of reviews responded to
  responseTimeHours: number;
}

interface PostMetrics {
  weeksActive: number;
  totalPosts: number;
  avgEngagement: number; // views/reactions per post
  lastPostDate: Date;
}

// 8 Capital cities configuration
export const GBP_LOCATIONS: GBPLocation[] = [
  {
    id: 'sydney-nsw',
    city: 'Sydney',
    state: 'New South Wales',
    stateCode: 'NSW',
    latitude: -33.8688,
    longitude: 151.2093,
    serviceRadiusKm: 50,
    businessName: 'NRPG - National Restoration Professionals Group',
    address: 'Level 12, 680 George Street',
    postalCode: '2000',
    phone: '',
    email: '', // old domain does not resolve; set a working inbox before this listing goes live
    website: 'https://disasterrecovery.com.au',
    businessHours: {
      dayOfWeek: 'Everyday',
      opens: '00:00',
      closes: '23:59',
      isOpen: true,
    },
    categories: ['Restoration Service', 'Water Damage Restoration', 'Fire Restoration'],
    services: [
      {
        name: 'Emergency Service',
        description: '24/7 Emergency Dispatch + Make-Safe',
        price: EMERGENCY_PRICING.total,
        currency: 'AUD',
      },
      {
        name: 'Water Damage Restoration',
        description: 'Professional water extraction and restoration',
        price: 2750,
        currency: 'AUD',
      },
      {
        name: 'Fire & Smoke Restoration',
        description: 'Complete fire damage restoration',
        price: 2750,
        currency: 'AUD',
      },
    ],
    attributes: [
      { name: 'Emergency Service', value: 'Yes' },
      { name: '24/7 Availability', value: 'Yes' },
      { name: 'Insurance Work Accepted', value: 'All Major Insurers' },
      { name: 'Response Time', value: '42 minutes average' },
      { name: 'Service Type', value: 'Disaster Recovery' },
    ],
    photos: [],
    reviews: {
      averageRating: 4.9,
      totalReviews: 0,
      responseRate: 100,
      responseTimeHours: 24,
    },
    posts: {
      weeksActive: 0,
      totalPosts: 0,
      avgEngagement: 0,
      lastPostDate: new Date(),
    },
    verified: false,
  },
  // Melbourne
  {
    id: 'melbourne-vic',
    city: 'Melbourne',
    state: 'Victoria',
    stateCode: 'VIC',
    latitude: -37.8136,
    longitude: 144.9631,
    serviceRadiusKm: 50,
    businessName: 'NRPG - National Restoration Professionals Group',
    address: 'Level 5, 250 Flinders Street',
    postalCode: '3000',
    phone: '',
    email: '', // old domain does not resolve; set a working inbox before this listing goes live
    website: 'https://disasterrecovery.com.au',
    businessHours: { dayOfWeek: 'Everyday', opens: '00:00', closes: '23:59', isOpen: true },
    categories: ['Restoration Service', 'Water Damage Restoration', 'Fire Restoration'],
    services: [
      {
        name: 'Emergency Service',
        description: '24/7 Emergency Dispatch + Make-Safe',
        price: EMERGENCY_PRICING.total,
        currency: 'AUD',
      },
    ],
    attributes: [
      { name: 'Emergency Service', value: 'Yes' },
      { name: '24/7 Availability', value: 'Yes' },
      { name: 'Insurance Work Accepted', value: 'All Major Insurers' },
    ],
    photos: [],
    reviews: { averageRating: 4.9, totalReviews: 0, responseRate: 100, responseTimeHours: 24 },
    posts: { weeksActive: 0, totalPosts: 0, avgEngagement: 0, lastPostDate: new Date() },
    verified: false,
  },
  // Brisbane
  {
    id: 'brisbane-qld',
    city: 'Brisbane',
    state: 'Queensland',
    stateCode: 'QLD',
    latitude: -27.4698,
    longitude: 153.0251,
    serviceRadiusKm: 50,
    businessName: 'NRPG - National Restoration Professionals Group',
    address: 'Level 3, 120 Edward Street',
    postalCode: '4000',
    phone: '',
    email: '', // old domain does not resolve; set a working inbox before this listing goes live
    website: 'https://disasterrecovery.com.au',
    businessHours: { dayOfWeek: 'Everyday', opens: '00:00', closes: '23:59', isOpen: true },
    categories: ['Restoration Service', 'Water Damage Restoration'],
    services: [
      {
        name: 'Emergency Service',
        description: '24/7 Emergency Dispatch + Make-Safe',
        price: EMERGENCY_PRICING.total,
        currency: 'AUD',
      },
    ],
    attributes: [
      { name: 'Emergency Service', value: 'Yes' },
      { name: '24/7 Availability', value: 'Yes' },
    ],
    photos: [],
    reviews: { averageRating: 4.9, totalReviews: 0, responseRate: 100, responseTimeHours: 24 },
    posts: { weeksActive: 0, totalPosts: 0, avgEngagement: 0, lastPostDate: new Date() },
    verified: false,
  },
  // Perth
  {
    id: 'perth-wa',
    city: 'Perth',
    state: 'Western Australia',
    stateCode: 'WA',
    latitude: -31.9505,
    longitude: 115.8605,
    serviceRadiusKm: 50,
    businessName: 'NRPG - National Restoration Professionals Group',
    address: 'Level 2, 55 St Georges Terrace',
    postalCode: '6000',
    phone: '',
    email: '', // old domain does not resolve; set a working inbox before this listing goes live
    website: 'https://disasterrecovery.com.au',
    businessHours: { dayOfWeek: 'Everyday', opens: '00:00', closes: '23:59', isOpen: true },
    categories: ['Restoration Service'],
    services: [
      {
        name: 'Emergency Service',
        description: '24/7 Emergency Dispatch + Make-Safe',
        price: EMERGENCY_PRICING.total,
        currency: 'AUD',
      },
    ],
    attributes: [
      { name: 'Emergency Service', value: 'Yes' },
      { name: '24/7 Availability', value: 'Yes' },
    ],
    photos: [],
    reviews: { averageRating: 4.9, totalReviews: 0, responseRate: 100, responseTimeHours: 24 },
    posts: { weeksActive: 0, totalPosts: 0, avgEngagement: 0, lastPostDate: new Date() },
    verified: false,
  },
  // Adelaide
  {
    id: 'adelaide-sa',
    city: 'Adelaide',
    state: 'South Australia',
    stateCode: 'SA',
    latitude: -34.9285,
    longitude: 138.6007,
    serviceRadiusKm: 50,
    businessName: 'NRPG - National Restoration Professionals Group',
    address: 'Level 1, 50 Wauwi Street',
    postalCode: '5000',
    phone: '',
    email: '', // old domain does not resolve; set a working inbox before this listing goes live
    website: 'https://disasterrecovery.com.au',
    businessHours: { dayOfWeek: 'Everyday', opens: '00:00', closes: '23:59', isOpen: true },
    categories: ['Restoration Service'],
    services: [
      {
        name: 'Emergency Service',
        description: '24/7 Emergency Dispatch + Make-Safe',
        price: EMERGENCY_PRICING.total,
        currency: 'AUD',
      },
    ],
    attributes: [
      { name: 'Emergency Service', value: 'Yes' },
      { name: '24/7 Availability', value: 'Yes' },
    ],
    photos: [],
    reviews: { averageRating: 4.9, totalReviews: 0, responseRate: 100, responseTimeHours: 24 },
    posts: { weeksActive: 0, totalPosts: 0, avgEngagement: 0, lastPostDate: new Date() },
    verified: false,
  },
  // Canberra
  {
    id: 'canberra-act',
    city: 'Canberra',
    state: 'Australian Capital Territory',
    stateCode: 'ACT',
    latitude: -35.2809,
    longitude: 149.13,
    serviceRadiusKm: 50,
    businessName: 'NRPG - National Restoration Professionals Group',
    address: 'Level 1, 82 London Circuit',
    postalCode: '2601',
    phone: '',
    email: '', // old domain does not resolve; set a working inbox before this listing goes live
    website: 'https://disasterrecovery.com.au',
    businessHours: { dayOfWeek: 'Everyday', opens: '00:00', closes: '23:59', isOpen: true },
    categories: ['Restoration Service'],
    services: [
      {
        name: 'Emergency Service',
        description: '24/7 Emergency Dispatch + Make-Safe',
        price: EMERGENCY_PRICING.total,
        currency: 'AUD',
      },
    ],
    attributes: [
      { name: 'Emergency Service', value: 'Yes' },
      { name: '24/7 Availability', value: 'Yes' },
    ],
    photos: [],
    reviews: { averageRating: 4.9, totalReviews: 0, responseRate: 100, responseTimeHours: 24 },
    posts: { weeksActive: 0, totalPosts: 0, avgEngagement: 0, lastPostDate: new Date() },
    verified: false,
  },
  // Hobart
  {
    id: 'hobart-tas',
    city: 'Hobart',
    state: 'Tasmania',
    stateCode: 'TAS',
    latitude: -42.8821,
    longitude: 147.3272,
    serviceRadiusKm: 50,
    businessName: 'NRPG - National Restoration Professionals Group',
    address: 'Level 2, 15 Murray Street',
    postalCode: '7000',
    phone: '',
    email: '', // old domain does not resolve; set a working inbox before this listing goes live
    website: 'https://disasterrecovery.com.au',
    businessHours: { dayOfWeek: 'Everyday', opens: '00:00', closes: '23:59', isOpen: true },
    categories: ['Restoration Service'],
    services: [
      {
        name: 'Emergency Service',
        description: '24/7 Emergency Dispatch + Make-Safe',
        price: EMERGENCY_PRICING.total,
        currency: 'AUD',
      },
    ],
    attributes: [
      { name: 'Emergency Service', value: 'Yes' },
      { name: '24/7 Availability', value: 'Yes' },
    ],
    photos: [],
    reviews: { averageRating: 4.9, totalReviews: 0, responseRate: 100, responseTimeHours: 24 },
    posts: { weeksActive: 0, totalPosts: 0, avgEngagement: 0, lastPostDate: new Date() },
    verified: false,
  },
  // Darwin
  {
    id: 'darwin-nt',
    city: 'Darwin',
    state: 'Northern Territory',
    stateCode: 'NT',
    latitude: -12.4634,
    longitude: 130.8456,
    serviceRadiusKm: 50,
    businessName: 'NRPG - National Restoration Professionals Group',
    address: 'Level 1, 19 The Mall',
    postalCode: '0800',
    phone: '',
    email: '', // old domain does not resolve; set a working inbox before this listing goes live
    website: 'https://disasterrecovery.com.au',
    businessHours: { dayOfWeek: 'Everyday', opens: '00:00', closes: '23:59', isOpen: true },
    categories: ['Restoration Service'],
    services: [
      {
        name: 'Emergency Service',
        description: '24/7 Emergency Dispatch + Make-Safe',
        price: EMERGENCY_PRICING.total,
        currency: 'AUD',
      },
    ],
    attributes: [
      { name: 'Emergency Service', value: 'Yes' },
      { name: '24/7 Availability', value: 'Yes' },
    ],
    photos: [],
    reviews: { averageRating: 4.9, totalReviews: 0, responseRate: 100, responseTimeHours: 24 },
    posts: { weeksActive: 0, totalPosts: 0, avgEngagement: 0, lastPostDate: new Date() },
    verified: false,
  },
];

/**
 * GBP Manager class for programmatic GBP management
 * In production, this connects to Google Business Profile API
 */
export class GBPManagerService {
  /**
   * Get all configured GBP locations
   */
  getLocations(): GBPLocation[] {
    return GBP_LOCATIONS;
  }

  /**
   * Get specific location by ID
   */
  getLocation(id: string): GBPLocation | undefined {
    return GBP_LOCATIONS.find(loc => loc.id === id);
  }

  /**
   * Get location by city name
   */
  getLocationByCity(city: string): GBPLocation | undefined {
    return GBP_LOCATIONS.find(loc => loc.city.toLowerCase() === city.toLowerCase());
  }

  /**
   * Validate NAP (Name, Address, Phone) consistency
   * Critical for local SEO
   */
  validateNAP(location: GBPLocation): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!location.businessName) errors.push('Business name missing');
    if (!location.address) errors.push('Address missing');
    if (!location.postalCode) errors.push('Postal code missing');
    if (!location.phone) errors.push('Phone number missing');

    // Check for inconsistencies
    if (location.phone !== '') {
      errors.push('Phone number should be standard: ');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check photo coverage for location
   * Goal: 20+ photos per location
   */
  getPhotoStatus(location: GBPLocation): {
    count: number;
    isSufficient: boolean;
    needed: number;
  } {
    const count = location.photos.length;
    const target = 20;
    return {
      count,
      isSufficient: count >= target,
      needed: Math.max(0, target - count),
    };
  }

  /**
   * Get review status for location
   */
  getReviewStatus(location: GBPLocation): {
    averageRating: number;
    totalReviews: number;
    target: number;
    progress: number; // percentage
  } {
    const target = 50; // Target 50+ reviews per city
    const progress = (location.reviews.totalReviews / target) * 100;
    return {
      averageRating: location.reviews.averageRating,
      totalReviews: location.reviews.totalReviews,
      target,
      progress: Math.min(100, progress),
    };
  }

  /**
   * Check post activity for location
   */
  getPostStatus(location: GBPLocation): {
    totalPosts: number;
    weeksActive: number;
    postsPerWeek: number;
    isActive: boolean;
  } {
    const postsPerWeek =
      location.posts.weeksActive > 0 ? location.posts.totalPosts / location.posts.weeksActive : 0;

    return {
      totalPosts: location.posts.totalPosts,
      weeksActive: location.posts.weeksActive,
      postsPerWeek: Math.round(postsPerWeek * 10) / 10,
      isActive: postsPerWeek >= 1, // At least 1 post per week
    };
  }

  /**
   * Calculate GBP health score (0-100)
   * Based on: verification, photos, reviews, posts, NAP
   */
  getHealthScore(location: GBPLocation): number {
    let score = 0;

    // Verification (20 points)
    if (location.verified) score += 20;

    // Photos (20 points)
    const photoStatus = this.getPhotoStatus(location);
    score += Math.min(20, (photoStatus.count / 20) * 20);

    // Reviews (20 points)
    const reviewStatus = this.getReviewStatus(location);
    score += Math.min(20, (reviewStatus.progress / 100) * 20);

    // Posts (20 points)
    const postStatus = this.getPostStatus(location);
    score += postStatus.isActive ? 20 : Math.min(20, postStatus.postsPerWeek * 20);

    // NAP Consistency (20 points)
    const napStatus = this.validateNAP(location);
    score += napStatus.isValid ? 20 : 0;

    return Math.round(score);
  }

  /**
   * Generate GBP activation checklist
   */
  getActivationChecklist(location: GBPLocation): Array<{
    task: string;
    completed: boolean;
    priority: 'critical' | 'high' | 'medium';
  }> {
    const photoStatus = this.getPhotoStatus(location);
    const reviewStatus = this.getReviewStatus(location);
    const postStatus = this.getPostStatus(location);
    const napStatus = this.validateNAP(location);

    return [
      {
        task: `Verify GBP profile for ${location.city}`,
        completed: location.verified,
        priority: 'critical',
      },
      {
        task: `Upload 20+ photos (currently ${photoStatus.count})`,
        completed: photoStatus.isSufficient,
        priority: 'critical',
      },
      {
        task: `Fix NAP consistency issues (${napStatus.errors.length} found)`,
        completed: napStatus.isValid,
        priority: 'critical',
      },
      {
        task: `Set service radius and attributes`,
        completed: location.attributes.length > 0,
        priority: 'high',
      },
      {
        task: `Generate and schedule weekly posts`,
        completed: postStatus.isActive,
        priority: 'high',
      },
      {
        task: `Generate 50+ reviews (currently ${reviewStatus.totalReviews})`,
        completed: reviewStatus.totalReviews >= reviewStatus.target,
        priority: 'high',
      },
      {
        task: `Set up direct messaging`,
        completed: location.email ? true : false,
        priority: 'medium',
      },
    ];
  }

  /**
   * Get activation priority (which cities to focus on first)
   */
  getPriorityOrder(): GBPLocation[] {
    return GBP_LOCATIONS.sort((a, b) => {
      const scoreA = this.getHealthScore(a);
      const scoreB = this.getHealthScore(b);
      return scoreA - scoreB; // Lowest score first = priority
    });
  }
}

// Export singleton
export const gbpManager = new GBPManagerService();
