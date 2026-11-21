/**
 * hCaptcha Integration with Mock Mode & Failed Attempt Tracking
 *
 * This module provides hCaptcha verification functionality
 * to prevent bot submissions on critical forms.
 *
 * Features:
 * - Real hCaptcha verification in production
 * - Mock hCaptcha mode for development/testing
 * - Failed attempt tracking with progressive penalties
 * - IP-based rate limiting for failed attempts
 */

import axios from 'axios';
import { getHCaptchaSecret } from '@/lib/services/captcha.service';

const HCAPTCHA_VERIFY_URL = 'https://hcaptcha.com/siteverify';
const MOCK_CAPTCHA_TOKEN = 'mock-captcha-token-development-only';

// In-memory cache for tracking failed CAPTCHA attempts per IP
// In production, this should use Redis
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

/**
 * Get the number of failed CAPTCHA attempts for an IP address
 */
function getFailedAttempts(ip: string): number {
  const record = failedAttempts.get(ip);
  if (!record) return 0;

  // Reset if more than 1 hour has passed
  if (Date.now() - record.lastAttempt > 3600000) {
    failedAttempts.delete(ip);
    return 0;
  }

  return record.count;
}

/**
 * Increment failed CAPTCHA attempt for an IP address
 */
function incrementFailedAttempts(ip: string): number {
  const current = getFailedAttempts(ip);
  const newCount = current + 1;

  failedAttempts.set(ip, {
    count: newCount,
    lastAttempt: Date.now(),
  });

  return newCount;
}

/**
 * Reset failed CAPTCHA attempts for an IP address (on successful verification)
 */
function resetFailedAttempts(ip: string): void {
  failedAttempts.delete(ip);
}

/**
 * Check if an IP is rate-limited due to too many failed attempts
 * Progressive penalties: 3+ failures = block 1 minute, 5+ = 10 minutes, 10+ = 1 hour
 */
function isRateLimited(ip: string): { limited: boolean; resetInSeconds?: number } {
  const failures = getFailedAttempts(ip);

  if (failures < 3) {
    return { limited: false };
  }

  const record = failedAttempts.get(ip);
  if (!record) {
    return { limited: false };
  }

  const timeSinceLastAttempt = Math.floor((Date.now() - record.lastAttempt) / 1000);

  let blockDurationSeconds = 0;
  if (failures >= 10) {
    blockDurationSeconds = 3600; // 1 hour
  } else if (failures >= 5) {
    blockDurationSeconds = 600; // 10 minutes
  } else if (failures >= 3) {
    blockDurationSeconds = 60; // 1 minute
  }

  if (timeSinceLastAttempt < blockDurationSeconds) {
    return {
      limited: true,
      resetInSeconds: blockDurationSeconds - timeSinceLastAttempt,
    };
  }

  // Block duration expired, reset
  failedAttempts.delete(ip);
  return { limited: false };
}

/**
 * hCaptcha verification response
 */
export interface HCaptchaVerificationResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  credit?: boolean;
  'error-codes'?: string[];
  score?: number;
  score_reason?: string[];
}

/**
 * Verify hCaptcha token on the server side
 *
 * @param token - The hCaptcha token from the client
 * @param remoteip - Optional remote IP address for additional validation
 * @returns Promise resolving to verification result
 */
export async function verifyHCaptcha(
  token: string,
  remoteip?: string
): Promise<HCaptchaVerificationResponse> {
  // Check if rate-limited due to too many failed attempts
  if (remoteip) {
    const rateLimitCheck = isRateLimited(remoteip);
    if (rateLimitCheck.limited) {
      return {
        success: false,
        'error-codes': ['rate-limited'],
      };
    }
  }

  // Handle mock CAPTCHA for development/testing
  if (process.env.NODE_ENV === 'development' && token === MOCK_CAPTCHA_TOKEN) {
    console.info(`Mock CAPTCHA verification successful for IP: ${remoteip}`);
    if (remoteip) {
      resetFailedAttempts(remoteip);
    }
    return {
      success: true,
      challenge_ts: new Date().toISOString(),
      hostname: 'localhost',
    };
  }

  const secretKey = getHCaptchaSecret();

  if (!secretKey) {
    throw new Error('HCAPTCHA_SECRET is not configured');
  }

  if (!token) {
    if (remoteip) {
      incrementFailedAttempts(remoteip);
    }
    return {
      success: false,
      'error-codes': ['missing-input-response'],
    };
  }

  try {
    const response = await axios.post<HCaptchaVerificationResponse>(
      HCAPTCHA_VERIFY_URL,
      new URLSearchParams({
        secret: secretKey,
        response: token,
        ...(remoteip && { remoteip }),
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    // Track successful verification
    if (response.data.success && remoteip) {
      resetFailedAttempts(remoteip);
    } else if (!response.data.success && remoteip) {
      incrementFailedAttempts(remoteip);
    }

    return response.data;
  } catch (error) {
    console.error('hCaptcha verification error:', error);
    if (remoteip) {
      incrementFailedAttempts(remoteip);
    }
    return {
      success: false,
      'error-codes': ['network-error'],
    };
  }
}

/**
 * Verify hCaptcha token and throw error if verification fails
 *
 * @param token - The hCaptcha token from the client
 * @param remoteip - Optional remote IP address
 * @throws Error if verification fails
 */
export async function requireValidCaptcha(
  token: string,
  remoteip?: string
): Promise<void> {
  const result = await verifyHCaptcha(token, remoteip);

  if (!result.success) {
    const errors = result['error-codes'] || [];
    throw new Error(
      `CAPTCHA verification failed: ${errors.join(', ') || 'Unknown error'}`
    );
  }
}

/**
 * Check if hCaptcha is properly configured
 */
export function isCaptchaEnabled(): boolean {
  return !!(
    getHCaptchaSecret() &&
    process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY
  );
}

/**
 * Get hCaptcha error message for display to users
 */
export function getCaptchaErrorMessage(errorCodes?: string[], resetInSeconds?: number): string {
  if (!errorCodes || errorCodes.length === 0) {
    return 'CAPTCHA verification failed. Please try again.';
  }

  const errorMessages: Record<string, string> = {
    'missing-input-secret': 'Server configuration error. Please contact support.',
    'invalid-input-secret': 'Server configuration error. Please contact support.',
    'missing-input-response': 'Please complete the CAPTCHA challenge.',
    'invalid-input-response': 'Invalid CAPTCHA response. Please try again.',
    'bad-request': 'Invalid request. Please refresh and try again.',
    'invalid-or-already-seen-response': 'This CAPTCHA has already been used. Please try again.',
    'not-using-dummy-passcode': 'Invalid test passcode.',
    'sitekey-secret-mismatch': 'Server configuration error. Please contact support.',
    'network-error': 'Network error during verification. Please try again.',
    'rate-limited': `Too many failed attempts. Please try again in ${Math.ceil((resetInSeconds || 60) / 60)} minute(s).`,
  };

  const firstError = errorCodes[0];
  return errorMessages[firstError] || 'CAPTCHA verification failed. Please try again.';
}

/**
 * Get mock CAPTCHA token for development/testing
 * Only available in development environment
 */
export function getMockCaptchaToken(): string | null {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  return MOCK_CAPTCHA_TOKEN;
}

/**
 * Get failed attempt count for an IP (for monitoring/debugging)
 */
export function getFailedAttemptCount(ip: string): number {
  return getFailedAttempts(ip);
}

/**
 * Middleware helper to verify CAPTCHA in API routes
 */
export async function verifyCaptchaMiddleware(
  captchaToken: string | undefined,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  // Skip in development if not configured
  if (process.env.NODE_ENV === 'development' && !isCaptchaEnabled()) {
    console.warn('hCaptcha not configured - skipping verification in development');
    return { success: true };
  }

  if (!captchaToken) {
    return {
      success: false,
      error: 'CAPTCHA token is required',
    };
  }

  try {
    await requireValidCaptcha(captchaToken, remoteIp);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'CAPTCHA verification failed';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Client-side configuration
 */
export const HCAPTCHA_CONFIG = {
  siteKey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '',
  size: 'normal' as const,
  theme: 'light' as const,
};
