/**
 * GA4 Analytics React Hooks
 *
 * Custom React hooks for tracking Google Analytics 4 events in components
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import * as analytics from '@/lib/analytics';

/**
 * Track page views automatically on route changes
 * Note: Uses pathname only to avoid Suspense boundary requirements
 *
 * The address and title are worked out inside the analytics module from the
 * list of pages that may be counted; this hook passes neither. `trigger`
 * re-runs the count when it changes (the visitor's consent state), so the
 * page a visitor is on when they say yes is counted once.
 */
export function useGA4PageTracking(trigger?: unknown) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      analytics.trackPageView();
    }
  }, [pathname, trigger]);
}

/**
 * Track scroll depth on a page
 */
export function useGA4ScrollTracking(thresholds: number[] = [25, 50, 75, 90, 100]) {
  const trackedThresholds = useRef(new Set<number>());

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;

      thresholds.forEach((threshold) => {
        if (scrolled >= threshold && !trackedThresholds.current.has(threshold)) {
          analytics.trackScrollDepth(threshold);
          trackedThresholds.current.add(threshold);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [thresholds]);
}

/**
 * Track time spent on page
 */
export function useGA4TimeOnPage(intervalSeconds: number = 30) {
  const startTime = useRef<number>(Date.now());
  const lastTracked = useRef<number>(0);

  useEffect(() => {
    // Skip if disabled (intervalSeconds <= 0)
    if (intervalSeconds <= 0) return;

    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);

      if (timeSpent - lastTracked.current >= intervalSeconds) {
        analytics.trackTimeOnPage(timeSpent);
        lastTracked.current = timeSpent;
      }
    }, intervalSeconds * 1000);

    return () => {
      clearInterval(interval);
      // Track final time on page
      const finalTime = Math.floor((Date.now() - startTime.current) / 1000);
      if (finalTime > lastTracked.current) {
        analytics.trackTimeOnPage(finalTime);
      }
    };
  }, [intervalSeconds]);
}

/**
 * Track outbound links
 */
export function useGA4OutboundLinkTracking() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href) {
        try {
          const url = new URL(link.href);
          const currentHost = window.location.hostname;

          // Check if it's an outbound link
          if (url.hostname !== currentHost) {
            analytics.trackOutboundLink(link.href);
          }
        } catch (error) {
          // Invalid URL, ignore
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
}

/**
 * Hook for tracking claim events
 */
export function useGA4ClaimTracking() {
  const trackClaimStarted = useCallback((params: analytics.ClaimEvent) => {
    analytics.trackClaimStarted(params);
  }, []);

  const trackClaimStepCompleted = useCallback((params: analytics.ClaimEvent) => {
    analytics.trackClaimStepCompleted(params);
  }, []);

  const trackClaimSubmitted = useCallback((params: analytics.ClaimEvent) => {
    analytics.trackClaimSubmitted(params);
  }, []);

  return {
    trackClaimStarted,
    trackClaimStepCompleted,
    trackClaimSubmitted,
  };
}

/**
 * Hook for tracking contractor events
 */
export function useGA4ContractorTracking() {
  const trackContractorInquiry = useCallback((params: analytics.ContractorEvent) => {
    analytics.trackContractorInquiry(params);
  }, []);

  const trackContractorSignupStarted = useCallback((params?: analytics.ContractorEvent) => {
    analytics.trackContractorSignupStarted(params);
  }, []);

  const trackContractorSignupCompleted = useCallback((params: analytics.ContractorEvent) => {
    analytics.trackContractorSignupCompleted(params);
  }, []);

  const trackContractorProfileViewed = useCallback((params: analytics.ContractorEvent) => {
    analytics.trackEvent('contractor_profile_viewed', {
      contractor_id: params.contractor_id,
      contractor_name: params.contractor_name,
      event_category: 'Contractor',
      event_label: 'Profile Viewed',
    });
  }, []);

  const trackContractorContacted = useCallback((params: analytics.ContractorEvent) => {
    analytics.trackEvent('contractor_contacted', {
      contractor_id: params.contractor_id,
      contractor_name: params.contractor_name,
      service_type: params.service_type,
      event_category: 'Contractor',
      event_label: 'Contractor Contacted',
    });
  }, []);

  return {
    trackContractorInquiry,
    trackContractorSignupStarted,
    trackContractorSignupCompleted,
    trackContractorProfileViewed,
    trackContractorContacted,
  };
}

/**
 * Hook for tracking content interactions
 */
export function useGA4ContentTracking() {
  const trackDownload = useCallback((params: analytics.ContentEvent) => {
    analytics.trackContentDownload(params);
  }, []);

  const trackToolInteraction = useCallback((params: analytics.ToolEvent) => {
    analytics.trackToolInteraction(params);
  }, []);

  return {
    trackDownload,
    trackToolInteraction,
  };
}

/**
 * Hook for tracking search events
 */
export function useGA4SearchTracking() {
  const trackSearch = useCallback((searchTerm: string, resultsCount?: number) => {
    analytics.trackSearch(searchTerm, resultsCount);
  }, []);

  return { trackSearch };
}

/**
 * Hook for tracking CTA clicks
 */
export function useGA4CTATracking() {
  const trackCTA = useCallback((ctaName: string, ctaLocation?: string) => {
    analytics.trackCTAClick(ctaName, ctaLocation);
  }, []);

  return { trackCTA };
}

/**
 * Hook for tracking video events
 */
export function useGA4VideoTracking(videoId: string, videoName: string) {
  const trackVideoStart = useCallback(() => {
    analytics.trackEvent('video_start', {
      video_id: videoId,
      video_name: videoName,
      event_category: 'Video',
      event_label: videoName,
    });
  }, [videoId, videoName]);

  const trackVideoProgress = useCallback((percentage: number) => {
    analytics.trackEvent('video_progress', {
      video_id: videoId,
      video_name: videoName,
      video_percent: percentage,
      event_category: 'Video',
      event_label: `${videoName} - ${percentage}%`,
    });
  }, [videoId, videoName]);

  const trackVideoComplete = useCallback(() => {
    analytics.trackEvent('video_complete', {
      video_id: videoId,
      video_name: videoName,
      event_category: 'Video',
      event_label: videoName,
    });
  }, []);

  return {
    trackVideoStart,
    trackVideoProgress,
    trackVideoComplete,
  };
}

/**
 * Hook for tracking form events
 */
export function useGA4FormTracking(formName: string) {
  const trackFormStart = useCallback(() => {
    analytics.trackEvent('form_start', {
      form_name: formName,
      event_category: 'Form',
      event_label: `${formName} - Started`,
    });
  }, [formName]);

  const trackFormSubmit = useCallback(() => {
    analytics.trackEvent('form_submit', {
      form_name: formName,
      event_category: 'Form',
      event_label: `${formName} - Submitted`,
    });
  }, [formName]);

  const trackFormError = useCallback((errorMessage: string) => {
    analytics.trackEvent('form_error', {
      form_name: formName,
      error_message: errorMessage,
      event_category: 'Form',
      event_label: `${formName} - Error`,
    });
  }, [formName]);

  return {
    trackFormStart,
    trackFormSubmit,
    trackFormError,
  };
}

/**
 * Comprehensive analytics hook for page-level tracking
 * Note: All hooks are always called to comply with React's rules of hooks
 */
export function useGA4PageAnalytics(options?: {
  enableScrollTracking?: boolean;
  enableTimeTracking?: boolean;
  scrollThresholds?: number[];
  timeInterval?: number;
  /** Changes when the visitor's consent changes; re-runs the page count. */
  consentState?: unknown;
}) {
  const {
    enableScrollTracking = true,
    enableTimeTracking = true,
    scrollThresholds = [25, 50, 75, 90, 100],
    timeInterval = 30,
    consentState,
  } = options || {};

  // Always call all hooks unconditionally (React rules of hooks)
  useGA4PageTracking(consentState);
  useGA4ScrollTracking(enableScrollTracking ? scrollThresholds : []);
  useGA4TimeOnPage(enableTimeTracking ? timeInterval : 0);
  useGA4OutboundLinkTracking();
}
