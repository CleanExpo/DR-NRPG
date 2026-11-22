/**
 * Rate Limiting Implementation using Upstash Redis
 *
 * This module provides rate limiting functionality for API endpoints
 * to prevent abuse and DDoS attacks.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';
import { getClientIp as trustedClientIp } from '@/lib/net/client-ip';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

/**
 * Rate limiter for lead capture endpoint
 * Max 3 submissions per hour per IP
 */
export const leadCaptureRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true,
  prefix: 'ratelimit:lead-capture',
});

/**
 * Rate limiter for contractor inquiry endpoint
 * Max 5 submissions per day per IP
 */
export const contractorInquiryRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '24 h'),
  analytics: true,
  prefix: 'ratelimit:contractor-inquiry',
});

/**
 * Rate limiter for general API endpoints
 * Max 100 requests per minute per IP
 */
export const generalApiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:api',
});

/**
 * Rate limiter for authentication endpoints
 * Max 5 attempts per 15 minutes per IP
 */
export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'ratelimit:auth',
});

/**
 * Rate limiter for password reset endpoints
 * Max 3 attempts per hour per IP
 */
export const passwordResetRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true,
  prefix: 'ratelimit:password-reset',
});

/**
 * Extract IP address from request (platform-trusted; see lib/net/client-ip.ts)
 */
export function getClientIp(request: NextRequest): string {
  return trustedClientIp(request);
}

/**
 * Apply rate limiting to a request
 */
export async function applyRateLimit(
  request: NextRequest,
  rateLimiter: Ratelimit,
  options?: {
    identifier?: string;
    onRateLimited?: () => NextResponse;
  }
): Promise<{ success: boolean; response?: NextResponse; limit?: number; remaining?: number; reset?: number }> {
  const identifier = options?.identifier || getClientIp(request);

  const { success, limit, remaining, reset } = await rateLimiter.limit(identifier);

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);

    const response = options?.onRateLimited?.() || NextResponse.json(
      {
        error: 'Too Many Requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        },
      }
    );

    return { success: false, response, limit, remaining, reset };
  }

  return { success: true, limit, remaining, reset };
}

/**
 * Create a rate limit handler for API routes
 */
export function withRateLimit(
  rateLimiter: Ratelimit,
  options?: {
    identifier?: string;
  }
) {
  return async (request: NextRequest) => {
    const result = await applyRateLimit(request, rateLimiter, options);

    if (!result.success && result.response) {
      return result.response;
    }

    return null; // Rate limit passed, continue
  };
}

/**
 * Check if Redis is configured
 */
export function isRateLimitingEnabled(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

/**
 * Fallback rate limiter using in-memory storage
 * (Use only for development/testing)
 */
class InMemoryRateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  async check(identifier: string): Promise<{ success: boolean; remaining: number }> {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return { success: true, remaining: this.maxRequests - 1 };
    }

    if (record.count >= this.maxRequests) {
      return { success: false, remaining: 0 };
    }

    record.count++;
    return { success: true, remaining: this.maxRequests - record.count };
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Cleanup in-memory cache every 5 minutes
if (typeof window === 'undefined') {
  // Server-side only
  setInterval(() => {
    // Cleanup would happen here if using in-memory fallback
  }, 5 * 60 * 1000);
}
