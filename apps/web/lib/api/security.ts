/**
 * Security Middleware for API Routes
 * Implements CAPTCHA verification, CSP headers, and security best practices
 */

import { NextRequest, NextResponse } from 'next/server';
import { getHCaptchaSecret } from '@/lib/services/captcha.service';

/**
 * CAPTCHA verification interface
 * Supports multiple providers (Google reCAPTCHA, hCaptcha, Cloudflare Turnstile)
 */
export interface CaptchaVerificationResult {
  success: boolean;
  score?: number;
  errorCodes?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verify Google reCAPTCHA v3 token
 *
 * @param token - reCAPTCHA token from client
 * @param secretKey - reCAPTCHA secret key
 * @param minScore - Minimum score (0.0 - 1.0) for reCAPTCHA v3
 * @returns Verification result
 */
export async function verifyRecaptcha(
  token: string,
  secretKey: string = process.env.RECAPTCHA_SECRET_KEY || '',
  minScore: number = 0.5
): Promise<CaptchaVerificationResult> {
  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY not configured');
    // In development, allow requests without CAPTCHA
    if (process.env.NODE_ENV === 'development') {
      return { success: true };
    }
    return { success: false, errorCodes: ['missing-secret-key'] };
  }

  try {
    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data = await response.json();

    // For reCAPTCHA v3, check score
    if (data.success && data.score !== undefined) {
      if (data.score < minScore) {
        return {
          success: false,
          score: data.score,
          errorCodes: ['score-too-low'],
        };
      }
    }

    return {
      success: data.success,
      score: data.score,
      errorCodes: data['error-codes'],
      challenge_ts: data.challenge_ts,
      hostname: data.hostname,
    };
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    return {
      success: false,
      errorCodes: ['verification-error'],
    };
  }
}

/**
 * Verify hCaptcha token
 *
 * @param token - hCaptcha token from client
 * @param secretKey - hCaptcha secret key
 * @returns Verification result
 */
export async function verifyHCaptcha(
  token: string,
  secretKey: string = getHCaptchaSecret() || ''
): Promise<CaptchaVerificationResult> {
  if (!secretKey) {
    console.warn('HCAPTCHA_SECRET not configured');
    if (process.env.NODE_ENV === 'development') {
      return { success: true };
    }
    return { success: false, errorCodes: ['missing-secret-key'] };
  }

  try {
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();

    return {
      success: data.success,
      errorCodes: data['error-codes'],
      challenge_ts: data.challenge_ts,
      hostname: data.hostname,
    };
  } catch (error) {
    console.error('hCaptcha verification failed:', error);
    return {
      success: false,
      errorCodes: ['verification-error'],
    };
  }
}

/**
 * Verify Cloudflare Turnstile token
 *
 * @param token - Turnstile token from client
 * @param secretKey - Turnstile secret key
 * @returns Verification result
 */
export async function verifyTurnstile(
  token: string,
  secretKey: string = process.env.TURNSTILE_SECRET_KEY || ''
): Promise<CaptchaVerificationResult> {
  if (!secretKey) {
    console.warn('TURNSTILE_SECRET_KEY not configured');
    if (process.env.NODE_ENV === 'development') {
      return { success: true };
    }
    return { success: false, errorCodes: ['missing-secret-key'] };
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data = await response.json();

    return {
      success: data.success,
      errorCodes: data['error-codes'],
      challenge_ts: data.challenge_ts,
      hostname: data.hostname,
    };
  } catch (error) {
    console.error('Turnstile verification failed:', error);
    return {
      success: false,
      errorCodes: ['verification-error'],
    };
  }
}

/**
 * Content Security Policy (CSP) headers
 * Strict CSP for security-critical pages
 */
export const strictCSPHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://www.google.com/recaptcha/",
    "frame-src 'self' https://www.google.com/recaptcha/",
    "form-action 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'geolocation=(), microphone=(), camera=(), payment=()',
};

/**
 * Lenient CSP for pages with third-party integrations
 */
export const lenientCSPHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https:",
    "frame-src 'self' https:",
    "form-action 'self'",
    "base-uri 'self'",
  ].join('; '),
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

/**
 * CORS headers for public API endpoints
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, restrict to specific domains
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24 hours
};

/**
 * Add security headers to response
 */
export function addSecurityHeaders(
  response: NextResponse,
  options: {
    csp?: 'strict' | 'lenient' | 'none';
    cors?: boolean;
  } = {}
): NextResponse {
  const { csp = 'strict', cors = false } = options;

  // Add CSP headers
  if (csp === 'strict') {
    Object.entries(strictCSPHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  } else if (csp === 'lenient') {
    Object.entries(lenientCSPHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  // Add CORS headers if enabled
  if (cors) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

/**
 * Validate request origin to prevent CSRF
 */
export function validateOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  // Allow requests without origin (same-origin, non-browser clients)
  if (!origin && !referer) {
    return true;
  }

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    // Add your production domains here
  ];

  if (origin && allowedOrigins.includes(origin)) {
    return true;
  }

  if (referer) {
    const refererUrl = new URL(referer);
    if (allowedOrigins.some((allowed) => refererUrl.origin === allowed)) {
      return true;
    }
  }

  return false;
}

/**
 * Input sanitization to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Australian phone number
 */
export function isValidAustralianPhone(phone: string): boolean {
  // Remove spaces, hyphens, and parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Australian phone formats:
  // Mobile: 04XX XXX XXX (10 digits starting with 04)
  // Landline: 0X XXXX XXXX (10 digits starting with 02-09)
  // International: +61 X XXXX XXXX
  const mobileRegex = /^04\d{8}$/;
  const landlineRegex = /^0[2-9]\d{8}$/;
  const internationalRegex = /^\+61[2-9]\d{8}$/;

  return (
    mobileRegex.test(cleaned) ||
    landlineRegex.test(cleaned) ||
    internationalRegex.test(cleaned)
  );
}

/**
 * Validate Australian postcode
 */
export function isValidAustralianPostcode(postcode: string): boolean {
  const postcodeRegex = /^[0-9]{4}$/;
  return postcodeRegex.test(postcode);
}

/**
 * Honeypot field validation (spam bot detection)
 * Add a hidden field to forms that should remain empty
 */
export function isHoneypotTriggered(honeypotValue: string | null): boolean {
  return honeypotValue !== null && honeypotValue !== '';
}

/** Compiled once at module load — avoids re-creating RegExp objects per request. */
const BOT_PATTERNS: readonly RegExp[] = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
];

/**
 * Check if request is from a bot based on User-Agent.
 * Complexity: O(p) where p = BOT_PATTERNS.length (constant 7).
 */
export function isProbablyBot(req: NextRequest): boolean {
  const userAgent = req.headers.get('user-agent') || '';
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}
