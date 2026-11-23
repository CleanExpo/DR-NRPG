/**
 * CAPTCHA Verification Service (hCaptcha Basic)
 *
 * The one place the server reads the hCaptcha secret and decides whether a
 * public form submission passes the CAPTCHA check (DR-955).
 *
 * Secret name: HCAPTCHA_SECRET is canonical (the name set in Vercel production
 * and used by DEPLOYMENT_CHECKLIST.md / SPEC.md). HCAPTCHA_SECRET_KEY is still
 * read as a fallback, with a one-time warning, so a deployment that only has
 * the older name keeps working.
 *
 * Policy (checkCaptcha):
 * - Secret configured: a missing token is refused, a token hCaptcha rejects is
 *   refused, a token hCaptcha accepts passes.
 * - No secret configured, production (NODE_ENV or VERCEL_ENV is 'production',
 *   or REQUIRE_CAPTCHA=true): refused. Vercel previews run with
 *   NODE_ENV=production, so they are refused too.
 * - No secret configured anywhere else (local dev, test): allowed, with a
 *   one-time warning.
 */

export const HCAPTCHA_SECRET_ENV = 'HCAPTCHA_SECRET';
export const HCAPTCHA_SECRET_LEGACY_ENV = 'HCAPTCHA_SECRET_KEY';

const HCAPTCHA_VERIFY_URL = 'https://hcaptcha.com/siteverify';
const TEST_BYPASS_TOKEN = 'test-captcha-token';

let warnedLegacyName = false;
let warnedNoSecret = false;

/**
 * Read the hCaptcha secret. Never logs the value.
 */
export function getHCaptchaSecret(): string | undefined {
  const canonical = process.env[HCAPTCHA_SECRET_ENV];
  if (canonical) return canonical;

  const legacy = process.env[HCAPTCHA_SECRET_LEGACY_ENV];
  if (legacy) {
    if (!warnedLegacyName) {
      warnedLegacyName = true;
      console.warn(
        `[captcha] ${HCAPTCHA_SECRET_LEGACY_ENV} is deprecated; set ${HCAPTCHA_SECRET_ENV} instead.`
      );
    }
    return legacy;
  }
  return undefined;
}

/** True where a missing secret must refuse rather than allow. */
export function isCaptchaRequiredEnv(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.REQUIRE_CAPTCHA === 'true'
  );
}

export type CaptchaCheckResult =
  | { ok: true; skipped: boolean }
  | {
      ok: false;
      reason: 'missing-token' | 'invalid-token' | 'not-configured';
      status: 400 | 503;
      message: string;
    };

/**
 * Decide whether a public form submission passes the CAPTCHA check.
 */
export async function checkCaptcha(token: unknown): Promise<CaptchaCheckResult> {
  if (process.env.NODE_ENV === 'test' && token === TEST_BYPASS_TOKEN) {
    return { ok: true, skipped: false };
  }

  const secret = getHCaptchaSecret();
  if (!secret) {
    if (isCaptchaRequiredEnv()) {
      console.error(`[captcha] ${HCAPTCHA_SECRET_ENV} is not configured; refusing submission.`);
      return {
        ok: false,
        reason: 'not-configured',
        status: 503,
        message: 'CAPTCHA verification is unavailable. Please try again later.',
      };
    }
    if (!warnedNoSecret) {
      warnedNoSecret = true;
      console.warn(
        `[captcha] ${HCAPTCHA_SECRET_ENV} is not configured; CAPTCHA check skipped outside production.`
      );
    }
    return { ok: true, skipped: true };
  }

  if (typeof token !== 'string' || token.trim() === '') {
    return {
      ok: false,
      reason: 'missing-token',
      status: 400,
      message: 'CAPTCHA token is required. Please complete the CAPTCHA and try again.',
    };
  }

  const valid = await verifyHCaptcha(token, secret);
  if (!valid) {
    return {
      ok: false,
      reason: 'invalid-token',
      status: 400,
      message: 'CAPTCHA verification failed. Please complete the CAPTCHA again.',
    };
  }
  return { ok: true, skipped: false };
}

/**
 * Verify hCaptcha token with hCaptcha API
 *
 * @param token - hCaptcha token from client
 * @param secret - defaults to getHCaptchaSecret()
 * @returns true if token is valid, false otherwise
 */
export async function verifyHCaptcha(
  token: string,
  secret: string | undefined = getHCaptchaSecret()
): Promise<boolean> {
  try {
    // Validate token format
    if (!token || typeof token !== 'string' || token.length < 10) {
      console.warn('Invalid CAPTCHA token format');
      return false;
    }

    if (!secret) {
      console.error(`${HCAPTCHA_SECRET_ENV} not configured`);
      return false;
    }

    // Verify with hCaptcha API
    const response = await fetch(HCAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        response: token,
        secret: secret,
      }),
    });

    if (!response.ok) {
      console.error(`hCaptcha API error: ${response.status} ${response.statusText}`);
      return false;
    }

    const data = await response.json();

    // Check if verification successful
    if (!data.success) {
      console.warn('hCaptcha verification failed:', data['error-codes']);
      return false;
    }

    // Validate timestamp (token must be recent, within 5 minutes)
    const tokenTime = new Date(data.challenge_ts).getTime();
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    if (now - tokenTime > maxAge) {
      console.warn('hCaptcha token too old');
      return false;
    }

    return true;
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return false;
  }
}

/**
 * Verify CAPTCHA token (boolean form of checkCaptcha, used by the claim route).
 *
 * @param token - CAPTCHA token from client
 * @returns true if valid
 */
export async function verifyCaptcha(token: string): Promise<boolean> {
  return (await checkCaptcha(token)).ok;
}

/**
 * Validate CAPTCHA configuration
 * Ensures hCaptcha is properly configured for the environment
 */
export function validateCaptchaConfig(): {
  isConfigured: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const isProd = process.env.NODE_ENV === 'production';
  const hasSecret = !!getHCaptchaSecret();
  const hasSiteKey = !!process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  if (isProd && !hasSecret) {
    warnings.push(
      'HCAPTCHA_SECRET not configured in production. CAPTCHA verification will fail.'
    );
  }

  if (isProd && !hasSiteKey) {
    warnings.push(
      'NEXT_PUBLIC_HCAPTCHA_SITE_KEY not configured in production. CAPTCHA widget will not work.'
    );
  }

  if (!hasSecret && !isProd) {
    warnings.push(
      'HCAPTCHA_SECRET not configured. Running in development mode with CAPTCHA disabled.'
    );
  }

  return {
    isConfigured: hasSecret && hasSiteKey,
    warnings,
  };
}
