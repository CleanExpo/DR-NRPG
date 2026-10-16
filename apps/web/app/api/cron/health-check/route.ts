import { NextRequest, NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/seo/site-url';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidCronRequest(request: NextRequest): boolean {
  const cronSecret =
    request.headers.get('x-vercel-cron-secret') ||
    request.headers.get('authorization')?.replace('Bearer ', '');
  const expectedSecret = process.env.CRON_SECRET;

  if (process.env.NODE_ENV === 'development' && !expectedSecret) {
    return true;
  }

  if (!expectedSecret) return false;
  return cronSecret === expectedSecret;
}

export async function GET(request: NextRequest) {
  if (!isValidCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Call the deep health endpoint on the fixed public origin. The request's
    // Host / X-Forwarded-Host must never choose the host this server fetches.
    const healthResponse = await fetch(`${SITE_URL}/api/health/deep`, {
      headers: { Accept: 'application/json' },
    });

    const healthData = await healthResponse.json();

    // Log health status for monitoring
    console.log(`[HEALTH CHECK] Status: ${healthData.status}`, {
      timestamp: new Date().toISOString(),
      services: healthData.services,
    });

    // If unhealthy, trigger an alert
    if (healthData.status === 'unhealthy') {
      console.error('[ALERT] System health is unhealthy!', healthData);
      // TODO: Send alert to PagerDuty, Slack, or email
    }

    return NextResponse.json({
      success: true,
      healthStatus: healthData.status,
      timestamp: new Date().toISOString(),
      details: healthData,
    });
  } catch (error) {
    console.error('Health check cron error:', error);
    return NextResponse.json(
      {
        error: 'Health check failed',
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
