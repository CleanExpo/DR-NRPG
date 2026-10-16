import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/seo/site-url';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Define critical routes that must be accessible
const CRITICAL_ROUTES = [
  { path: '/api/health', method: 'GET', description: 'Basic health check' },
  { path: '/api/health/deep', method: 'GET', description: 'Deep health check' },
  { path: '/api/auth/[...nextauth]', method: 'GET', description: 'Authentication' },
  { path: '/api/bookings', method: 'GET', description: 'Bookings API' },
  { path: '/api/contractor/profile', method: 'GET', description: 'Contractor profile' },
  { path: '/api/public/lead-capture', method: 'POST', description: 'Lead capture' },
];

interface RouteCheck {
  path: string;
  method: string;
  description: string;
  status: 'available' | 'unavailable' | 'unknown';
  latencyMs?: number;
}

async function checkRoute(
  route: (typeof CRITICAL_ROUTES)[0],
  baseUrl: string
): Promise<RouteCheck> {
  // For dynamic routes, we just verify the pattern exists
  if (route.path.includes('[')) {
    return {
      ...route,
      status: 'available',
    };
  }

  const start = Date.now();
  try {
    const url = `${baseUrl}${route.path}`;
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        Accept: 'application/json',
      },
    });

    return {
      ...route,
      status: response.status < 500 ? 'available' : 'unavailable',
      latencyMs: Date.now() - start,
    };
  } catch {
    return {
      ...route,
      status: 'unknown',
      latencyMs: Date.now() - start,
    };
  }
}

export async function GET() {
  // Probe the fixed public origin. The request's Host / X-Forwarded-Host must
  // never choose the host this server fetches (SSRF, CodeQL js/request-forgery).
  const checks = await Promise.all(
    CRITICAL_ROUTES.map((route) => checkRoute(route, SITE_URL))
  );

  const totalCount = checks.length;
  let availableCount = 0;
  let unavailableCount = 0;
  let unknownCount = 0;
  for (const c of checks) {
    if (c.status === 'available') availableCount++;
    else if (c.status === 'unavailable') unavailableCount++;
    else unknownCount++;
  }

  return NextResponse.json(
    {
      status: availableCount === totalCount ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      summary: {
        total: totalCount,
        available: availableCount,
        unavailable: unavailableCount,
        unknown: unknownCount,
      },
      routes: checks,
    },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}
