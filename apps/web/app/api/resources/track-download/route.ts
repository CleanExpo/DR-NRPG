// @ts-nocheck

/**
 * Download Tracking API Route
 *
 * POST /api/resources/track-download
 * Tracks resource download events for analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/net/client-ip';
import { authenticateRequest } from '@/lib/auth-middleware';
import { getTenantDb } from '@/lib/get-tenant-db';
import { DownloadEvent } from '@/lib/resources/types';

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const db = getTenantDb(authResult.context);

    const body = await request.json();
    const downloadEvent: DownloadEvent = {
      resourceId: body.resourceId,
      userId: body.userId,
      sessionId: body.sessionId,
      timestamp: new Date(body.timestamp || Date.now()),
      userAgent: body.userAgent || request.headers.get('user-agent') || undefined,
      referrer: body.referrer || request.headers.get('referer') || undefined,
    };

    // Store download event in database
    try {
      const ipAddress = getClientIp(request);

      const savedDownload = await db.resourceDownload.create({
        data: {
          resourceId: downloadEvent.resourceId,
          resourceType: body.resourceType || 'unknown',
          resourceName: body.resourceName,
          userId: downloadEvent.userId,
          ipAddress,
          userAgent: downloadEvent.userAgent,
          downloadedAt: downloadEvent.timestamp,
        },
      });

      console.log('=== RESOURCE DOWNLOAD TRACKED ===');
      console.log('Download ID:', savedDownload.id);
      console.log('Resource ID:', downloadEvent.resourceId);
      console.log('User ID:', downloadEvent.userId || 'Anonymous');
      console.log('IP Address:', ipAddress);
      console.log('Timestamp:', downloadEvent.timestamp);
      console.log('=================================');
    } catch (dbError) {
      console.error('Database error tracking download:', dbError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to track download in database',
        },
        { status: 500 }
      );
    }

    // TODO: Send to analytics platform (Google Analytics, Mixpanel, etc.)
    // await analytics.track('Resource Downloaded', {
    //   resourceId: downloadEvent.resourceId,
    //   userId: downloadEvent.userId,
    //   timestamp: downloadEvent.timestamp,
    // });

    return NextResponse.json(
      { success: true, message: 'Download tracked successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error tracking download:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track download' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to track downloads.' },
    { status: 405 }
  );
}
