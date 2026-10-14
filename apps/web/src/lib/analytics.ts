// @ts-nocheck

/**
 * Google Analytics 4 (GA4) Integration
 *
 * Complete GA4 analytics implementation with custom events, conversion tracking,
 * and privacy-compliant cookie consent management.
 *
 * @module analytics
 */

// Types for GA4 events
export interface GA4EventParams {
  [key: string]: string | number | boolean | undefined;
}

export interface ClaimEvent {
  claim_id?: string;
  claim_type?: string;
  claim_value?: number;
  step_name?: string;
  step_number?: number;
}

export interface ContractorEvent {
  contractor_id?: string;
  contractor_name?: string;
  service_type?: string;
  location?: string;
}

export interface ContentEvent {
  content_id?: string;
  content_type?: string;
  content_name?: string;
  file_type?: string;
  file_size?: number;
}

export interface ToolEvent {
  tool_name?: string;
  tool_action?: string;
  tool_value?: string;
}

export interface PageViewEvent {
  page_title?: string;
  page_location?: string;
  page_path?: string;
}

// GA4 Event Names (Custom Events)
export const GA4_EVENTS = {
  // Claim Events
  CLAIM_STARTED: 'claim_started',
  CLAIM_STEP_COMPLETED: 'claim_step_completed',
  CLAIM_SUBMITTED: 'claim_submitted',
  CLAIM_ABANDONED: 'claim_abandoned',

  // Contractor Events
  CONTRACTOR_INQUIRY: 'contractor_inquiry',
  CONTRACTOR_SIGNUP_STARTED: 'contractor_signup_started',
  CONTRACTOR_SIGNUP_COMPLETED: 'contractor_signup_completed',
  CONTRACTOR_SIGNUP: 'contractor_signup',
  CERTIFICATION_PURCHASE: 'certification_purchase',
  CALLOUT_PAID: 'callout_paid',
  CONTRACTOR_PROFILE_VIEWED: 'contractor_profile_viewed',
  CONTRACTOR_CONTACTED: 'contractor_contacted',

  // Content & Engagement
  CONTENT_DOWNLOAD: 'content_download',
  CONTENT_SHARED: 'content_shared',
  VIDEO_PLAYED: 'video_start',
  VIDEO_COMPLETED: 'video_complete',

  // Tool Interactions
  TOOL_INTERACTION: 'tool_interaction',
  CALCULATOR_USED: 'calculator_used',
  QUOTE_REQUESTED: 'quote_requested',

  // User Journey
  SEARCH_PERFORMED: 'search',
  FILTER_APPLIED: 'filter_applied',
  CTA_CLICKED: 'cta_clicked',

  // Conversions
  LEAD_GENERATED: 'generate_lead',
  SIGN_UP: 'sign_up',
  LOGIN: 'login',

  // Engagement
  SCROLL_DEPTH: 'scroll_depth',
  TIME_ON_PAGE: 'time_on_page',
  OUTBOUND_LINK: 'click',
} as const;

// GA4 Configuration
export interface GA4Config {
  measurementId: string;
  debug?: boolean;
  cookiePrefix?: string;
  cookieDomain?: string;
  cookieExpires?: number;
  anonymizeIp?: boolean;
}

// Default configuration
const DEFAULT_CONFIG: Partial<GA4Config> = {
  debug: process.env.NODE_ENV === 'development',
  cookiePrefix: 'nrpg',
  cookieExpires: 365, // days
  anonymizeIp: true,
};

/**
 * Initialize Google Analytics 4
 * Should be called once when the app loads
 */
export function initializeGA4(config: GA4Config): void {
  const { measurementId, debug, cookiePrefix, cookieDomain, cookieExpires, anonymizeIp } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  if (typeof window === 'undefined') {
    console.warn('GA4: Cannot initialize on server side');
    return;
  }

  // Check if gtag is already loaded
  if (window.gtag) {
    if (debug) {
      console.log('GA4: Already initialized');
    }
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer.push(args);
  };

  // Configure gtag
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    debug_mode: debug,
    cookie_prefix: cookiePrefix,
    cookie_domain: cookieDomain,
    cookie_expires: cookieExpires ? cookieExpires * 24 * 60 * 60 : undefined,
    anonymize_ip: anonymizeIp,
    send_page_view: false, // We'll handle page views manually
  });

  if (debug) {
    console.log('GA4: Initialized with measurement ID:', measurementId);
  }
}

/**
 * Track a page view
 */
export function trackPageView(params?: PageViewEvent): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  const pageData = {
    page_title: params?.page_title || document.title,
    page_location: params?.page_location || window.location.href,
    page_path: params?.page_path || window.location.pathname,
  };

  window.gtag('event', 'page_view', pageData);
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, params?: GA4EventParams): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', eventName, params);
}

/**
 * Track an event at most once per browser session for `onceKey` (e.g. a Stripe
 * session id), so reloading a payment return page does not double-count.
 */
export function trackEventOnce(eventName: string, onceKey: string, params?: GA4EventParams): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  const storageKey = `nrpg_ga4_once:${eventName}:${onceKey}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, '1');
  } catch {
    // sessionStorage unavailable (privacy mode): fall through and track.
  }

  trackEvent(eventName, params);
}

// ============================================================================
// Custom Event Tracking Functions
// ============================================================================

/**
 * Track claim started
 */
export function trackClaimStarted(params: ClaimEvent): void {
  trackEvent(GA4_EVENTS.CLAIM_STARTED, {
    claim_type: params.claim_type,
    claim_value: params.claim_value,
    event_category: 'Claim',
    event_label: 'Claim Started',
  });
}

/**
 * Track claim step completed
 */
export function trackClaimStepCompleted(params: ClaimEvent): void {
  trackEvent(GA4_EVENTS.CLAIM_STEP_COMPLETED, {
    claim_id: params.claim_id,
    step_name: params.step_name,
    step_number: params.step_number,
    event_category: 'Claim',
    event_label: `Step ${params.step_number}: ${params.step_name}`,
  });
}

/**
 * Track claim submitted (conversion)
 */
export function trackClaimSubmitted(params: ClaimEvent): void {
  trackEvent(GA4_EVENTS.CLAIM_SUBMITTED, {
    claim_id: params.claim_id,
    claim_type: params.claim_type,
    claim_value: params.claim_value,
    event_category: 'Claim',
    event_label: 'Claim Submitted',
    value: params.claim_value,
  });

  // Also track as conversion
  trackConversion('claim_submission', params.claim_value);
}

/**
 * Track contractor inquiry
 */
export function trackContractorInquiry(params: ContractorEvent): void {
  trackEvent(GA4_EVENTS.CONTRACTOR_INQUIRY, {
    contractor_id: params.contractor_id,
    contractor_name: params.contractor_name,
    service_type: params.service_type,
    location: params.location,
    event_category: 'Contractor',
    event_label: 'Contractor Inquiry',
  });
}

/**
 * Track contractor signup started
 */
export function trackContractorSignupStarted(params?: ContractorEvent): void {
  trackEvent(GA4_EVENTS.CONTRACTOR_SIGNUP_STARTED, {
    service_type: params?.service_type,
    location: params?.location,
    event_category: 'Contractor',
    event_label: 'Signup Started',
  });
}

/**
 * Track contractor signup completed (conversion)
 */
export function trackContractorSignupCompleted(params: ContractorEvent): void {
  trackEvent(GA4_EVENTS.CONTRACTOR_SIGNUP_COMPLETED, {
    contractor_id: params.contractor_id,
    service_type: params.service_type,
    location: params.location,
    event_category: 'Contractor',
    event_label: 'Signup Completed',
  });

  // Also track as conversion
  trackConversion('contractor_signup');
}

/**
 * Track content download
 */
export function trackContentDownload(params: ContentEvent): void {
  trackEvent(GA4_EVENTS.CONTENT_DOWNLOAD, {
    content_id: params.content_id,
    content_name: params.content_name,
    content_type: params.content_type,
    file_type: params.file_type,
    file_size: params.file_size,
    event_category: 'Content',
    event_label: params.content_name,
  });
}

/**
 * Track tool interaction
 */
export function trackToolInteraction(params: ToolEvent): void {
  trackEvent(GA4_EVENTS.TOOL_INTERACTION, {
    tool_name: params.tool_name,
    tool_action: params.tool_action,
    tool_value: params.tool_value,
    event_category: 'Tool',
    event_label: `${params.tool_name}: ${params.tool_action}`,
  });
}

/**
 * Track search
 */
export function trackSearch(searchTerm: string, resultsCount?: number): void {
  trackEvent(GA4_EVENTS.SEARCH_PERFORMED, {
    search_term: searchTerm,
    results_count: resultsCount,
    event_category: 'Search',
    event_label: searchTerm,
  });
}

/**
 * Track CTA click
 */
export function trackCTAClick(ctaName: string, ctaLocation?: string): void {
  trackEvent(GA4_EVENTS.CTA_CLICKED, {
    cta_name: ctaName,
    cta_location: ctaLocation,
    event_category: 'CTA',
    event_label: ctaName,
  });
}

/**
 * Track outbound link click
 */
export function trackOutboundLink(url: string, linkText?: string): void {
  trackEvent(GA4_EVENTS.OUTBOUND_LINK, {
    link_url: url,
    link_text: linkText,
    link_domain: new URL(url).hostname,
    outbound: true,
    event_category: 'Outbound Link',
    event_label: url,
  });
}

/**
 * Track scroll depth
 */
export function trackScrollDepth(percentage: number): void {
  trackEvent(GA4_EVENTS.SCROLL_DEPTH, {
    scroll_depth: percentage,
    event_category: 'Engagement',
    event_label: `${percentage}% Scrolled`,
  });
}

/**
 * Track time on page
 */
export function trackTimeOnPage(seconds: number): void {
  trackEvent(GA4_EVENTS.TIME_ON_PAGE, {
    time_on_page: seconds,
    event_category: 'Engagement',
    event_label: `${Math.floor(seconds / 60)}m ${seconds % 60}s`,
  });
}

/**
 * Track conversion event
 */
export function trackConversion(conversionName: string, value?: number): void {
  trackEvent('conversion', {
    conversion_name: conversionName,
    value: value,
    event_category: 'Conversion',
    event_label: conversionName,
  });
}

/**
 * Track user sign up
 */
export function trackSignUp(method?: string): void {
  trackEvent(GA4_EVENTS.SIGN_UP, {
    method: method || 'email',
    event_category: 'User',
    event_label: 'Sign Up',
  });

  trackConversion('sign_up');
}

/**
 * Track user login
 */
export function trackLogin(method?: string): void {
  trackEvent(GA4_EVENTS.LOGIN, {
    method: method || 'email',
    event_category: 'User',
    event_label: 'Login',
  });
}

// ============================================================================
// Enhanced Measurement Helpers
// ============================================================================

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('set', 'user_properties', properties);
}

/**
 * Set user ID
 */
export function setUserId(userId: string): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('set', { user_id: userId });
}

/**
 * Clear user ID (on logout)
 */
export function clearUserId(): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('set', { user_id: undefined });
}

// ============================================================================
// Geographic Tracking
// ============================================================================

/**
 * Track geographic data
 */
export function trackGeographicData(location: {
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
}): void {
  setUserProperties({
    user_city: location.city,
    user_state: location.state,
    user_country: location.country,
    user_postcode: location.postcode,
  });
}

// ============================================================================
// E-commerce Tracking (for future use)
// ============================================================================

/**
 * Track product view
 */
export function trackProductView(product: {
  id: string;
  name: string;
  category?: string;
  price?: number;
}): void {
  trackEvent('view_item', {
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
      },
    ],
  });
}

/**
 * Track add to cart
 */
export function trackAddToCart(product: {
  id: string;
  name: string;
  category?: string;
  price?: number;
  quantity?: number;
}): void {
  trackEvent('add_to_cart', {
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: product.quantity || 1,
      },
    ],
  });
}

/**
 * Track purchase
 */
export function trackPurchase(transaction: {
  transaction_id: string;
  value: number;
  currency?: string;
  items: Array<{
    id: string;
    name: string;
    category?: string;
    price?: number;
    quantity?: number;
  }>;
}): void {
  trackEvent('purchase', {
    transaction_id: transaction.transaction_id,
    value: transaction.value,
    currency: transaction.currency || 'AUD',
    items: transaction.items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price,
      quantity: item.quantity || 1,
    })),
  });
}

// ============================================================================
// Type Declarations for Window
// ============================================================================

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default {
  initializeGA4,
  trackPageView,
  trackEvent,
  trackClaimStarted,
  trackClaimStepCompleted,
  trackClaimSubmitted,
  trackContractorInquiry,
  trackContractorSignupStarted,
  trackContractorSignupCompleted,
  trackContentDownload,
  trackToolInteraction,
  trackSearch,
  trackCTAClick,
  trackOutboundLink,
  trackScrollDepth,
  trackTimeOnPage,
  trackConversion,
  trackSignUp,
  trackLogin,
  setUserProperties,
  setUserId,
  clearUserId,
  trackGeographicData,
  trackProductView,
  trackAddToCart,
  trackPurchase,
};
