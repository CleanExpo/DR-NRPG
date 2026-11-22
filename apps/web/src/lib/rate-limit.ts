/**
 * Rate Limiting Utility for Next.js App Router
 *
 * Provides rate limiting for API routes with configurable time windows
 * and request limits. Uses in-memory LRU cache for efficient token tracking.
 */

import { LRUCache } from 'lru-cache';
import { getClientIp as trustedClientIp } from '@/lib/net/client-ip';

export interface RateLimitOptions {
  uniqueTokenPerInterval?: number;
  interval?: number;
}

/**
 * Create a rate limiter instance
 * @param options Configuration options
 * @returns Object with check method for rate limiting
 */
export function createRateLimiter(options?: RateLimitOptions) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: async (limit: number, token: string): Promise<void> => {
      const tokenCount = tokenCache.get(token) || [0];

      if (tokenCount[0] === 0) {
        tokenCache.set(token, [1]);
        return;
      }

      tokenCount[0] += 1;
      tokenCache.set(token, tokenCount);

      if (tokenCount[0] >= limit) {
        throw new Error('Rate limit exceeded');
      }
    },
  };
}

/**
 * Login/Auth Rate Limiter: 5 attempts per 15 minutes
 * Prevents brute force attacks on authentication endpoints
 */
export const authLimiter = createRateLimiter({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500,
});

/**
 * API Rate Limiter: 30 requests per 1 minute
 * Standard limit for authenticated API endpoints
 */
export const apiLimiter = createRateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

/**
 * Public Rate Limiter: 5 requests per 15 minutes
 * Strict limit for public endpoints (contact forms, etc.)
 */
export const publicLimiter = createRateLimiter({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500,
});

/**
 * Admin Rate Limiter: 100 requests per 1 minute
 * Higher limit for authenticated admin endpoints
 */
export const adminLimiter = createRateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

/**
 * Helper function to extract client IP from request
 * @param request NextRequest or Request object
 * @returns Client IP address
 */
export function getClientIp(request: Request | any): string {
  // Platform-trusted only (see lib/net/client-ip.ts); `request.ip` no longer
  // exists in Next 15 and client-set headers are never used.
  return trustedClientIp(request);
}
