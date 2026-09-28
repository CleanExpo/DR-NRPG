import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCORSHeaders, handleCORSPreflight, logCORSViolation, isOriginAllowed } from '@/lib/config/cors.config';
import { getToken } from 'next-auth/jwt';

// ============================================================================
// Rate Limiting (In-Memory, Per-IP, 100 req/min for API routes)
// ============================================================================

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 100; // max requests per window

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Periodic cleanup to prevent memory leak (runs every 5 minutes)
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 300_000;

function cleanupRateLimitMap() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

function isRateLimited(ip: string): { limited: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  cleanupRateLimitMap();

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  entry.count++;

  if (entry.count > RATE_LIMIT_MAX) {
    return { limited: true, remaining: 0, resetAt: entry.resetAt };
  }

  return { limited: false, remaining: RATE_LIMIT_MAX - entry.count, resetAt: entry.resetAt };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract hostname for tenant resolution in API routes
  // Edge Runtime cannot call Prisma directly, so we forward hostname to API routes
  const hostname = request.headers.get('x-forwarded-host') || request.headers.get('host');

  const requestHeaders = new Headers(request.headers);
  if (hostname) {
    requestHeaders.set('x-tenant-hostname', hostname);
  }

  // Pass through x-tenant-id header if present (for explicit tenant selection)
  const tenantIdHeader = request.headers.get('x-tenant-id');
  if (tenantIdHeader) {
    requestHeaders.set('x-tenant-id', tenantIdHeader);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/about',
    '/contact',
    '/services',
    '/contractors',
    '/property-owners',
    '/help-center',
    '/support',
    '/privacy',
    '/terms',
    '/login',
    '/signup',
  ];

  // Add claim wizard routes to public routes
  const isClaimRoute = pathname.startsWith('/claim');

  // Skip security headers for static files
  const isStatic = pathname.startsWith('/_next') || pathname.startsWith('/static');
  const isApi = pathname.startsWith('/api');

  // ============================================================================
  // Cron Route Security (Vercel Cron Jobs)
  // ============================================================================
  const isCronRoute = pathname.startsWith('/api/cron') || pathname.startsWith('/api/webhooks/cron');

  if (isCronRoute) {
    const cronSecret = request.headers.get('x-vercel-cron-secret') ||
                       request.headers.get('authorization')?.replace('Bearer ', '');
    const expectedSecret = process.env.CRON_SECRET;
    const isLocalDev = process.env.NODE_ENV === 'development';

    // In production, require valid CRON_SECRET
    if (!isLocalDev && expectedSecret && cronSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Allow cron routes to proceed without additional security headers
    return response;
  }

  // ============================================================================
  // Rate Limiting for API Routes (100 req/min per IP)
  // ============================================================================

  if (isApi) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    const { limited, remaining, resetAt } = isRateLimited(ip);

    if (limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
          },
        }
      );
    }

    // Add rate limit headers to API responses
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));
  }

  // ============================================================================
  // Centralized RBAC: only ADMIN / SUPER_ADMIN may reach admin surfaces.
  // Defense-in-depth — route handlers still enforce requireRole() with a fresh
  // DB read (authoritative); this ensures no /api/admin/* route can be left ungated.
  // ============================================================================
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/dashboard/admin')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const role = (token as { userType?: string } | null)?.userType;
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      if (isApi) {
        return NextResponse.json(
          { error: 'FORBIDDEN', message: 'Admin access required' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (!isStatic) {
    // ============================================================================
    // Content Security Policy (CSP) Headers
    // ============================================================================

    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://hcaptcha.com https://*.hcaptcha.com",
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://cdn.jsdelivr.net",
      "connect-src 'self' https://hcaptcha.com https://*.hcaptcha.com https://*.supabase.co wss://*.supabase.co",
      "frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ];

    response.headers.set('Content-Security-Policy', cspDirectives.join('; '));

    // ============================================================================
    // Additional Security Headers
    // ============================================================================

    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy (allow geolocation for claim wizard)
    response.headers.set(
      'Permissions-Policy',
      'geolocation=(self), microphone=(), camera=(), payment=()'
    );
  }

  // ============================================================================
  // CORS for Public APIs (Production-Ready with Whitelist)
  // ============================================================================

  if (isApi && pathname.startsWith('/api/public')) {
    const origin = request.headers.get('origin');

    if (isOriginAllowed(origin ?? undefined)) {
      // Origin is allowed - apply CORS headers
      const corsHeaders = getCORSHeaders(origin ?? undefined);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    } else if (origin) {
      // Origin is not allowed - log violation
      logCORSViolation(origin ?? undefined, pathname);
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const preflightHeaders = handleCORSPreflight(origin ?? undefined);
      return new NextResponse(null, {
        status: 204,
        headers: preflightHeaders,
      });
    }
  }

  // Check if the current path is a public route or claim route
  if (publicRoutes.includes(pathname) || isClaimRoute) {
    return response;
  }

  // Check if the current path is an auth route
  if (pathname.startsWith('/api/auth/')) {
    return response;
  }

  // Check if the current path is a dashboard route
  if (pathname.startsWith('/dashboard')) {
    // Dashboard routes are now protected by server-side authentication in layout.tsx
    // The layout will redirect unauthenticated users to /login
    // This middleware allows the request to proceed to the layout handler
    return response;
  }

  // For all other routes, allow access
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
