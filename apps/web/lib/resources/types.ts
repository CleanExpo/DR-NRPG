/**
 * Resource Hub Types and Interfaces
 *
 * Comprehensive type system for the resources hub including:
 * - Content types (Articles, Guides, Videos, Podcasts, Tools)
 * - Disaster categories
 * - CMS integration interfaces
 * - Search and filtering
 */

// Disaster categories matching NRPG specializations
export type DisasterCategory =
  | 'water-damage'
  | 'fire-damage'
  | 'mold-remediation'
  | 'storm-damage'
  | 'sewage-cleanup'
  | 'biohazard-cleanup';

// Content types available in the resource hub
export type ContentType =
  | 'article'
  | 'guide'
  | 'video'
  | 'podcast'
  | 'tool'
  | 'checklist';

// Reading difficulty levels
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Content formats for downloadable resources
export type DownloadFormat = 'pdf' | 'docx' | 'xlsx' | 'mp3' | 'mp4';

/**
 * Core Resource Interface
 */
export interface Resource {
  id: string;
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: DisasterCategory;
  contentType: ContentType;

  // Content
  content?: string; // Markdown or HTML
  thumbnailUrl?: string;
  featuredImageUrl?: string;
  videoUrl?: string;
  podcastUrl?: string;

  // Metadata
  author: ResourceAuthor;
  publishedAt: Date;
  updatedAt: Date;
  readingTime?: number; // minutes
  difficulty?: DifficultyLevel;

  // Taxonomy
  tags: string[];
  relatedResources?: string[]; // IDs of related resources

  // Downloads
  downloadable?: boolean;
  downloadUrl?: string;
  downloadFormat?: DownloadFormat;
  downloadCount?: number;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;

  // Analytics
  viewCount?: number;
  shareCount?: number;

  // Features
  featured?: boolean;
  trending?: boolean;
  isMemberOnly?: boolean;
}

/**
 * Resource Author Interface
 */
export interface ResourceAuthor {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  avatarUrl?: string;
  credentials?: string[]; // training and certifications, etc.
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

/**
 * Resource with Process Timeline
 * Used for step-by-step guides and educational content
 */
export interface ProcessResource extends Resource {
  steps: TimelineStep[];
}

export interface TimelineStep {
  id: string;
  number: number;
  title: string;
  description: string;
  details?: string[];
  estimatedTime?: string;
  requiredTools?: string[];
  safetyWarnings?: string[];
}

/**
 * Resource with Before/After Case Study
 * Used for restoration case studies
 */
export interface CaseStudyResource extends Resource {
  caseStudy: {
    propertyType: string;
    location: string;
    incidentDate: Date;
    completionDate: Date;
    projectDuration: string;
    beforeImages: BeforeAfterImage[];
    afterImages: BeforeAfterImage[];
    challenges: string[];
    solutions: string[];
    outcome: string;
    testimonial?: {
      quote: string;
      author: string;
      title: string;
    };
  };
}

export interface BeforeAfterImage {
  url: string;
  alt: string;
  caption?: string;
  annotations?: {
    text: string;
    x: number; // Percentage from left
    y: number; // Percentage from top
  }[];
}

/**
 * Category Information
 */
export interface ResourceCategory {
  id: DisasterCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  resourceCount?: number;
  featured?: Resource[];
}

/**
 * Search and Filter Interfaces
 */
export interface ResourceFilters {
  categories?: DisasterCategory[];
  contentTypes?: ContentType[];
  difficulty?: DifficultyLevel[];
  tags?: string[];
  author?: string;
  dateFrom?: Date;
  dateTo?: Date;
  featured?: boolean;
  trending?: boolean;
  memberOnly?: boolean;
}

export interface ResourceSearchParams {
  query?: string;
  filters?: ResourceFilters;
  sortBy?: 'relevance' | 'date' | 'popular' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
}

export interface ResourceSearchResult {
  resources: Resource[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

/**
 * CMS Integration Interfaces
 * Prepared for Contentful/Sanity integration
 */
export interface CMSConfig {
  provider: 'contentful' | 'sanity' | 'local';
  spaceId?: string;
  accessToken?: string;
  projectId?: string;
  dataset?: string;
}

export interface CMSResource {
  sys?: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields?: any;
  _id?: string;
  _type?: string;
  _createdAt?: string;
  _updatedAt?: string;
}

/**
 * Search Integration Interface
 * Prepared for Algolia integration
 */
export interface SearchConfig {
  provider: 'algolia' | 'local';
  appId?: string;
  apiKey?: string;
  indexName?: string;
}

export interface AlgoliaResource {
  objectID: string;
  title: string;
  description: string;
  category: DisasterCategory;
  contentType: ContentType;
  tags: string[];
  author: string;
  publishedAt: number;
  _highlightResult?: any;
}

/**
 * Download Tracking Interface
 */
export interface DownloadEvent {
  resourceId: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  userAgent?: string;
  referrer?: string;
}

/**
 * Newsletter Signup Interface
 */
export interface NewsletterSubscription {
  email: string;
  firstName?: string;
  lastName?: string;
  interests?: DisasterCategory[];
  source: 'resources' | 'homepage' | 'footer';
  subscribedAt: Date;
  confirmed?: boolean;
  confirmationToken?: string;
}

/**
 * Analytics Interfaces
 */
export interface ResourceAnalytics {
  resourceId: string;
  views: number;
  uniqueViews: number;
  downloads: number;
  shares: number;
  averageReadTime?: number;
  bounceRate?: number;
  topReferrers?: { source: string; count: number }[];
  period: {
    start: Date;
    end: Date;
  };
}

/**
 * Featured Content Collection
 */
export interface FeaturedCollection {
  id: string;
  title: string;
  description: string;
  resources: Resource[];
  displayOrder?: number;
  validFrom?: Date;
  validTo?: Date;
}
