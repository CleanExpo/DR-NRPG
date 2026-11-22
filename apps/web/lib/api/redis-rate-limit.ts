/**
 * Redis Rate Limiting Service (Upstash)
 * Distributed rate limiting for production deployments
 * Handles authentication endpoints, payment endpoints, and API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getUpstashRestConfig } from '@/lib/redis/upstash-config';
import { getClientIp } from '@/lib/net/client-ip';

// Null unless the env holds a real https URL and token. `vercel build` sees
// "[SENSITIVE]" placeholders, which must not throw at import (DR-1011).
const upstashConfig = getUpstashRestConfig();
const redis = upstashConfig ? new Redis(upstashConfig) : null;

export interface RateLimitConfig {
  /**
   * Limiter namespace. Required so every limiter keeps its own counter
   * (`rate-limit:<name>:<ip>`); without it all limiters shared `rate-limit:<ip>`
   * and one surface's traffic used up another's allowance (DR-1010).
   */
  name: string;
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  failClosed?: boolean; // Deny (503) when Redis is missing or failing
}

/** Build the per-limiter Redis key: `rate-limit:<name>:<identifier>`. */
export function rateLimitKey(name: string, identifier: string): string {
  if (!name || !name.trim()) {
    throw new Error('Rate limiter name is required (DR-1010)');
  }
  return `rate-limit:${name}:${identifier}`;
}

/**
 * Get client identifier from request (IP address).
 * Uses the platform-trusted client IP only (see lib/net/client-ip.ts).
 */
export function getClientIdentifier(req: NextRequest): string {
  return getClientIp(req);
}

/**
 * Redis-based rate limiter
 * Distributed across multiple instances using Upstash
 *
 * @param config Rate limiting configuration
 * @returns Middleware function that returns error response or null
 *
 * @example
 * ```ts
 * const authLimiter = createRedisRateLimiter({
 *   name: 'auth',
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 *   maxRequests: 5,
 *   message: 'Too many login attempts',
 * });
 *
 * export async function POST(req: NextRequest) {
 *   const result = await authLimiter(req);
 *   if (result) return result;
 *   // Handle request
 * }
 * ```
 */
export function createRedisRateLimiter(config: RateLimitConfig) {
  const {
    name,
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    failClosed = false,
  } = config;
  // Validate at construction so a nameless limiter fails loudly, not per request.
  rateLimitKey(name, '');

  return async (req: NextRequest, identifier?: string): Promise<NextResponse | null> => {
    // If Redis not configured, skip rate limiting
    if (!redis) {
      if (failClosed) return NextResponse.json({ error: 'RATE_LIMIT_UNAVAILABLE' }, { status: 503 });
      console.warn(
        'Redis rate limiting not configured. Skipping rate limit check.'
      );
      return null;
    }

    try {
      // `identifier` replaces the client IP, e.g. a signed-in user's id for a per-user limit
      // (DR-1009); the key stays rate-limit:<name>:<identifier> (DR-1010).
      const key = rateLimitKey(name, identifier ?? getClientIdentifier(req));
      const now = Date.now();

      // Increment counter and read TTL in parallel — O(1) with 2 concurrent Redis RTTs
      const [count, ttlInitial] = await Promise.all([
        redis.incr(key),
        redis.pttl(key),
      ]);

      // Set expiry on first request (key was just created, so ttlInitial may be -1)
      // A key with no expiry (-1) after its first request means an earlier pexpire
      // failed; set it now so the caller is not refused forever (DR-1009).
      if (count === 1 || ttlInitial === -1) {
        await redis.pexpire(key, windowMs);
      }

      // If pttl returned -1 (no expiry set yet), fall back to window size
      const ttl = ttlInitial > 0 ? ttlInitial : windowMs;
      const resetTime = now + (ttl > 0 ? ttl : windowMs);
      const remaining = Math.max(0, maxRequests - count);

      // Check if limit exceeded
      if (count > maxRequests) {
        const retryAfter = Math.ceil(ttl / 1000);

        return NextResponse.json(
          {
            error: message,
            retryAfter,
            remaining: 0,
          },
          {
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(resetTime).toISOString(),
            },
          }
        );
      }

      // Attach rate limit info to request for response headers
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());

      return null;
    } catch (error) {
      if (failClosed) return NextResponse.json({ error: 'RATE_LIMIT_UNAVAILABLE' }, { status: 503 });
      // Existing callers retain their configured fallback
      console.error('Rate limit check failed:', error);
      return null;
    }
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */

// Strict rate limiter for authentication endpoints
export const authRateLimiter = createRedisRateLimiter({
  name: 'auth',
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many login attempts. Please try again in 15 minutes.',
});

// Standard rate limiter for API endpoints
export const apiRateLimiter = createRedisRateLimiter({
  name: 'api',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
  message: 'API rate limit exceeded. Please slow down.',
});

// Strict rate limiter for payment endpoints
export const paymentRateLimiter = createRedisRateLimiter({
  name: 'payment',
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 10,
  message: 'Payment rate limit exceeded. Please wait before trying again.',
});

// Lenient rate limiter for public read endpoints
export const publicReadRateLimiter = createRedisRateLimiter({
  name: 'public-read',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: 'Rate limit exceeded.',
});

// Form submission rate limiter
export const formSubmissionRateLimiter = createRedisRateLimiter({
  name: 'form-submission',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  message: 'Too many form submissions. Please wait before trying again.',
});

/**
 * The shared Upstash client, or null when Redis is not configured.
 */
export function getSharedRedis(): Redis | null {
  return redis;
}

/**
 * Check if Redis is configured and available
 */
export function isRedisConfigured(): boolean {
  return !!redis;
}
