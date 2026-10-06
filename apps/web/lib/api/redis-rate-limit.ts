/**
 * Redis Rate Limiting Service (Upstash)
 * Distributed rate limiting for production deployments
 * Handles authentication endpoints, payment endpoints, and API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  failClosed?: boolean; // Custom error message
}

/**
 * Get client identifier from request (IP address)
 * Tries multiple header sources for accurate identification
 */
export function getClientIdentifier(req: NextRequest): string {
  // Try to get real IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = req.headers.get('x-forwarded-for');
  const real = req.headers.get('x-real-ip');
  const cfConnecting = req.headers.get('cf-connecting-ip');

  if (cfConnecting) return cfConnecting;
  if (real) return real;
  if (forwarded) {
    const ips = forwarded.split(',');
    return ips[0].trim();
  }

  return 'unknown';
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
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    failClosed = false,
  } = config;

  return async (req: NextRequest): Promise<NextResponse | null> => {
    // If Redis not configured, skip rate limiting
    if (!redis) {
      if (failClosed) return NextResponse.json({ error: 'RATE_LIMIT_UNAVAILABLE' }, { status: 503 });
      console.warn(
        'Redis rate limiting not configured. Skipping rate limit check.'
      );
      return null;
    }

    try {
      const identifier = getClientIdentifier(req);
      const key = `rate-limit:${identifier}`;
      const now = Date.now();

      // Increment counter and read TTL in parallel — O(1) with 2 concurrent Redis RTTs
      const [count, ttlInitial] = await Promise.all([
        redis.incr(key),
        redis.pttl(key),
      ]);

      // Set expiry on first request (key was just created, so ttlInitial may be -1)
      if (count === 1) {
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
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many login attempts. Please try again in 15 minutes.',
});

// Standard rate limiter for API endpoints
export const apiRateLimiter = createRedisRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
  message: 'API rate limit exceeded. Please slow down.',
});

// Strict rate limiter for payment endpoints
export const paymentRateLimiter = createRedisRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 10,
  message: 'Payment rate limit exceeded. Please wait before trying again.',
});

// Lenient rate limiter for public read endpoints
export const publicReadRateLimiter = createRedisRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: 'Rate limit exceeded.',
});

// Form submission rate limiter
export const formSubmissionRateLimiter = createRedisRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  message: 'Too many form submissions. Please wait before trying again.',
});

/**
 * Check if Redis is configured and available
 */
export function isRedisConfigured(): boolean {
  return !!redis && !!process.env.UPSTASH_REDIS_REST_URL;
}
