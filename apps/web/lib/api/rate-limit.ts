/**
 * Rate Limiting Utilities for API Routes
 * Implements in-memory rate limiting with IP-based tracking
 * Production: Replace with Redis (Upstash) for distributed rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/net/client-ip';

export { getClientIp };

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  /**
   * Limiter namespace. Required so every limiter keeps its own counter
   * (`<name>:<ip>`); without it every in-memory limiter shared one counter per
   * IP across the public routes (same defect DR-1010 fixed for Redis).
   */
  name: string;
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
}

// In-memory store for rate limiting
// Production: Replace with Redis for distributed systems
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

/**
 * Rate limit middleware
 *
 * @example
 * ```ts
 * const limiter = rateLimit({
 *   name: 'my-route',
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 *   maxRequests: 100,
 * });
 *
 * export async function POST(req: NextRequest) {
 *   const rateLimitResult = await limiter(req);
 *   if (rateLimitResult) return rateLimitResult;
 *   // ... handle request
 * }
 * ```
 */
export function rateLimit(config: RateLimitConfig) {
  const {
    name,
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
    keyGenerator = getClientIp,
  } = config;
  // Validate at construction so a nameless limiter fails loudly, not per request.
  rateLimitKey(name, '');

  return async (req: NextRequest): Promise<NextResponse | null> => {
    const key = rateLimitKey(name, keyGenerator(req));
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    // Create new entry or reset if window expired
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, entry);
    }

    // Increment request count
    entry.count++;

    // Check if rate limit exceeded
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      return NextResponse.json(
        {
          error: message,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
          },
        }
      );
    }

    // Return null to indicate success (no rate limit hit)
    return null;
  };
}

/**
 * Strict rate limiter for sensitive endpoints (e.g., authentication, payments)
 */
export const strictRateLimit = rateLimit({
  name: 'strict',
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many attempts. Please try again in 15 minutes.',
});

/**
 * Standard rate limiter for public API endpoints
 */
export const standardRateLimit = rateLimit({
  name: 'standard',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20,
  message: 'Too many requests. Please slow down.',
});

/**
 * Lenient rate limiter for read-only endpoints
 */
export const lenientRateLimit = rateLimit({
  name: 'lenient',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
});

/**
 * Burst protection - very short window, high request limit
 */
export const burstProtection = rateLimit({
  name: 'burst',
  windowMs: 1000, // 1 second
  maxRequests: 5,
  message: 'Request rate too high. Please slow down.',
});

/**
 * Middleware to add rate limit headers to all responses
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  resetTime: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());

  return response;
}

/**
 * Production-ready Redis rate limiter (Upstash)
 * ENABLED FOR PRODUCTION - Uses distributed rate limiting via Upstash Redis
 *
 * For production deployments, ensure these environment variables are set:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

import { Redis } from '@upstash/redis';
import { rateLimitKey } from './redis-rate-limit';

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * Redis-based rate limiting for production
 * Fails open (allows request) if Redis is unavailable
 */
export async function redisRateLimit(
  config: RateLimitConfig & { identifier: string; name: string }
) {
  const { identifier, name, windowMs, maxRequests } = config;
  // Per-limiter namespace so different limiters never share a counter (DR-1010).
  const key = rateLimitKey(name, identifier);
  const now = Date.now();

  try {
    if (!redis) {
      throw new Error('Redis not configured');
    }

    // Increment counter and fetch TTL in parallel — 2 concurrent Redis RTTs instead of 3
    const [count, ttlInitial] = await Promise.all([
      redis.incr(key),
      redis.pttl(key),
    ]);

    // Set expiry on first request (key was just created)
    if (count === 1) {
      await redis.pexpire(key, windowMs);
    }

    const ttl = ttlInitial > 0 ? ttlInitial : windowMs;
    const resetTime = now + ttl;

    if (count > maxRequests) {
      const retryAfter = Math.ceil(ttl / 1000);

      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter,
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

    return null;
  } catch (error) {
    // Fail open - if Redis is unavailable, allow the request
    console.error('Redis rate limit check failed:', error);
    return null;
  }
}
