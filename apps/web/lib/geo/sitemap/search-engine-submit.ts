/**
 * Search Engine Sitemap Submission
 * Disaster Recovery - NRPG Platform
 *
 * Handles submission of sitemaps to Google Search Console and Bing Webmaster Tools.
 * Also supports ping endpoints for immediate crawl requests.
 */

import { DEFAULT_SITEMAP_CONFIG, SitemapConfig } from './sitemap-generator';

// ============================================
// Types
// ============================================

export interface GoogleSearchConsoleConfig {
  siteUrl: string;
  serviceAccountEmail: string;
  privateKey: string;
  scopes: string[];
}

export interface BingWebmasterConfig {
  siteUrl: string;
  apiKey: string;
}

export interface SearchEngineSubmission {
  engine: 'google' | 'bing';
  sitemapUrl: string;
  status: 'success' | 'error' | 'pending';
  timestamp: Date;
  response?: string;
  error?: string;
}

export interface SubmissionResult {
  submissions: SearchEngineSubmission[];
  allSuccessful: boolean;
  timestamp: Date;
}

// ============================================
// Google Search Console Submission
// ============================================

/**
 * Submit sitemap to Google Search Console
 *
 * Requires Google Cloud service account with Search Console API access.
 * Scopes needed: https://www.googleapis.com/auth/webmasters
 *
 * @see https://developers.google.com/webmaster-tools/v1/sitemaps/submit
 */
export async function submitToGoogleSearchConsole(
  sitemapUrl: string,
  config?: Partial<GoogleSearchConsoleConfig>
): Promise<SearchEngineSubmission> {
  const siteUrl = config?.siteUrl || DEFAULT_SITEMAP_CONFIG.baseUrl;
  const serviceAccountEmail = config?.serviceAccountEmail || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = config?.privateKey || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountEmail || !privateKey) {
    console.log('[GSC] Credentials not configured, skipping submission');
    return {
      engine: 'google',
      sitemapUrl,
      status: 'error',
      timestamp: new Date(),
      error: 'Google Search Console credentials not configured',
    };
  }

  try {
    // Generate JWT token for Google API authentication
    const accessToken = await getGoogleAccessToken(serviceAccountEmail, privateKey);

    // Submit sitemap via Search Console API
    const encodedSiteUrl = encodeURIComponent(siteUrl);
    const encodedSitemapUrl = encodeURIComponent(sitemapUrl);
    const apiUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/sitemaps/${encodedSitemapUrl}`;

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API error: ${response.status} - ${errorText}`);
    }

    console.log(`[GSC] Successfully submitted sitemap: ${sitemapUrl}`);

    return {
      engine: 'google',
      sitemapUrl,
      status: 'success',
      timestamp: new Date(),
      response: 'Sitemap submitted successfully',
    };
  } catch (error) {
    console.error('[GSC] Submission error:', error);
    return {
      engine: 'google',
      sitemapUrl,
      status: 'error',
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate Google OAuth access token from service account
 */
async function getGoogleAccessToken(serviceAccountEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600; // 1 hour

  // JWT header and claims
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const claims = {
    iss: serviceAccountEmail,
    scope: 'https://www.googleapis.com/auth/webmasters',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: expiry,
  };

  // Create JWT (simplified - in production use a proper JWT library)
  const jwt = await createJwt(header, claims, privateKey);

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(`Failed to get access token: ${tokenResponse.status}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

/**
 * Create JWT token (placeholder - use proper JWT library in production)
 */
async function createJwt(
  header: Record<string, string>,
  claims: Record<string, unknown>,
  privateKey: string
): Promise<string> {
  // In production, use a library like 'jsonwebtoken' or 'jose'
  // This is a placeholder that shows the structure

  // Base64url encode header and claims
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaims = base64UrlEncode(JSON.stringify(claims));

  // Create signature (placeholder - needs proper RSA signing)
  const signatureInput = `${encodedHeader}.${encodedClaims}`;

  // TODO: Implement proper RSA-SHA256 signing with privateKey
  // For now, return a placeholder that will fail auth
  console.warn('[JWT] Using placeholder JWT - implement proper signing for production');

  const signature = base64UrlEncode('placeholder-signature');

  return `${signatureInput}.${signature}`;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// ============================================
// Bing Webmaster Tools Submission
// ============================================

/**
 * Submit sitemap to Bing Webmaster Tools
 *
 * @see https://www.bing.com/webmasters/help/Sitemaps-3b5cf6ed
 */
export async function submitToBingWebmaster(
  sitemapUrl: string,
  config?: Partial<BingWebmasterConfig>
): Promise<SearchEngineSubmission> {
  const siteUrl = config?.siteUrl || DEFAULT_SITEMAP_CONFIG.baseUrl;
  const apiKey = config?.apiKey || process.env.BING_WEBMASTER_API_KEY;

  if (!apiKey) {
    console.log('[Bing] API key not configured, skipping submission');
    return {
      engine: 'bing',
      sitemapUrl,
      status: 'error',
      timestamp: new Date(),
      error: 'Bing Webmaster API key not configured',
    };
  }

  try {
    const encodedSiteUrl = encodeURIComponent(siteUrl);
    const encodedSitemapUrl = encodeURIComponent(sitemapUrl);
    const apiUrl = `https://ssl.bing.com/webmaster/api.svc/json/SubmitSitemap?siteUrl=${encodedSiteUrl}&feedUrl=${encodedSitemapUrl}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bing API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`[Bing] Successfully submitted sitemap: ${sitemapUrl}`);

    return {
      engine: 'bing',
      sitemapUrl,
      status: 'success',
      timestamp: new Date(),
      response: JSON.stringify(result),
    };
  } catch (error) {
    console.error('[Bing] Submission error:', error);
    return {
      engine: 'bing',
      sitemapUrl,
      status: 'error',
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// Combined Submission
// ============================================

/**
 * Submit sitemap to all configured search engines
 */
export async function submitToSearchEngines(
  sitemapUrl: string,
  engines: ('google' | 'bing')[] = ['google', 'bing']
): Promise<SubmissionResult> {
  const submissions: SearchEngineSubmission[] = [];

  // Submit to each engine in parallel
  const promises = engines.map(async (engine) => {
    if (engine === 'google') {
      return submitToGoogleSearchConsole(sitemapUrl);
    } else {
      return submitToBingWebmaster(sitemapUrl);
    }
  });

  const results = await Promise.all(promises);
  submissions.push(...results);

  const allSuccessful = submissions.every((s) => s.status === 'success');

  return {
    submissions,
    allSuccessful,
    timestamp: new Date(),
  };
}

// ============================================
// Ping Endpoints (Alternative to API)
// ============================================

/**
 * Ping search engines to notify them of sitemap updates
 * This is a simpler alternative to API submission that doesn't require authentication.
 *
 * Note: These ping endpoints are being deprecated by some search engines.
 * Use API submission when possible.
 */
export async function pingSearchEngines(
  sitemapUrl: string,
  engines: ('google' | 'bing')[] = ['google', 'bing']
): Promise<SubmissionResult> {
  const submissions: SearchEngineSubmission[] = [];

  for (const engine of engines) {
    try {
      let pingUrl: string;

      if (engine === 'google') {
        // Google's ping endpoint (deprecated but may still work)
        pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      } else {
        // Bing's ping endpoint
        pingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      }

      const response = await fetch(pingUrl, { method: 'GET' });

      if (response.ok) {
        console.log(`[Ping] Successfully pinged ${engine} for: ${sitemapUrl}`);
        submissions.push({
          engine,
          sitemapUrl,
          status: 'success',
          timestamp: new Date(),
          response: `Ping successful: ${response.status}`,
        });
      } else {
        throw new Error(`Ping returned ${response.status}`);
      }
    } catch (error) {
      console.error(`[Ping] Error pinging ${engine}:`, error);
      submissions.push({
        engine,
        sitemapUrl,
        status: 'error',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return {
    submissions,
    allSuccessful: submissions.every((s) => s.status === 'success'),
    timestamp: new Date(),
  };
}

// ============================================
// URL Submission (Individual URLs)
// ============================================

/**
 * Submit individual URLs for indexing via Google's Indexing API
 * Note: This API is primarily for job posting and broadcast pages.
 *
 * For general pages, use Search Console URL Inspection API instead.
 */
export async function submitUrlToGoogle(
  url: string,
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<SearchEngineSubmission> {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountEmail || !privateKey) {
    return {
      engine: 'google',
      sitemapUrl: url,
      status: 'error',
      timestamp: new Date(),
      error: 'Google credentials not configured',
    };
  }

  try {
    const accessToken = await getGoogleAccessToken(serviceAccountEmail, privateKey);

    const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        type,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Indexing API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`[Indexing] Successfully submitted URL: ${url}`);

    return {
      engine: 'google',
      sitemapUrl: url,
      status: 'success',
      timestamp: new Date(),
      response: JSON.stringify(result),
    };
  } catch (error) {
    console.error('[Indexing] URL submission error:', error);
    return {
      engine: 'google',
      sitemapUrl: url,
      status: 'error',
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Submit URL to Bing for indexing
 */
export async function submitUrlToBing(url: string): Promise<SearchEngineSubmission> {
  const apiKey = process.env.BING_WEBMASTER_API_KEY;
  const siteUrl = DEFAULT_SITEMAP_CONFIG.baseUrl;

  if (!apiKey) {
    return {
      engine: 'bing',
      sitemapUrl: url,
      status: 'error',
      timestamp: new Date(),
      error: 'Bing API key not configured',
    };
  }

  try {
    const response = await fetch('https://ssl.bing.com/webmaster/api.svc/json/SubmitUrl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify({
        siteUrl,
        url,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bing API error: ${response.status} - ${errorText}`);
    }

    console.log(`[Bing] Successfully submitted URL: ${url}`);

    return {
      engine: 'bing',
      sitemapUrl: url,
      status: 'success',
      timestamp: new Date(),
      response: 'URL submitted successfully',
    };
  } catch (error) {
    console.error('[Bing] URL submission error:', error);
    return {
      engine: 'bing',
      sitemapUrl: url,
      status: 'error',
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
