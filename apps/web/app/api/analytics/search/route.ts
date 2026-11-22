/**
 * Search Analytics API
 *
 * Stores and retrieves search analytics data
 * Used for tracking search behavior and optimization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/net/client-ip';
import { authenticateRequest } from '@/lib/auth-middleware';
import type { SearchAnalyticsEvent } from '@/lib/algolia/types';

/**
 * POST /api/analytics/search
 * Track a search analytics event
 * Note: SearchAnalytics model not yet implemented in Prisma schema
 * Currently logs to console for development/debugging
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const event: SearchAnalyticsEvent = await request.json();

    // Validate required fields
    if (!event.query || !event.index) {
      return NextResponse.json(
        { error: 'Missing required fields: query, index' },
        { status: 400 }
      );
    }

    // Log search analytics (database model not yet implemented)
    const ipAddress = getClientIp(request);

    console.log('=== SEARCH ANALYTICS TRACKED ===');
    console.log('Query:', event.query);
    console.log('Index/Category:', event.index);
    console.log('User ID:', event.userId || 'Anonymous');
    console.log('IP Address:', ipAddress);
    console.log('Timestamp:', new Date(event.timestamp || Date.now()).toISOString());
    console.log('================================');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Analytics] Error storing search event:', error);
    return NextResponse.json(
      { error: 'Failed to store analytics event' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/search
 * Retrieve search analytics data
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const index = searchParams.get('index');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: startDate, endDate' },
        { status: 400 }
      );
    }

    // In production, fetch from your analytics storage
    // For now, return mock data
    const analytics = {
      totalSearches: 12450,
      uniqueQueries: 3820,
      avgResultsPerSearch: 15.3,
      clickThroughRate: 0.42,
      conversionRate: 0.08,
      topQueries: [
        { query: 'water damage', count: 450, ctr: 0.52 },
        { query: 'fire restoration', count: 380, ctr: 0.48 },
        { query: 'mould removal', count: 320, ctr: 0.45 },
        { query: 'emergency restoration', count: 290, ctr: 0.51 },
        { query: 'flood cleanup', count: 250, ctr: 0.43 },
      ],
      topLocations: [
        { location: 'Sydney, NSW', searches: 3200 },
        { location: 'Melbourne, VIC', searches: 2800 },
        { location: 'Brisbane, QLD', searches: 2100 },
        { location: 'Perth, WA', searches: 1500 },
        { location: 'Adelaide, SA', searches: 1200 },
      ],
      searchesByDay: [
        { date: '2024-01-01', searches: 420 },
        { date: '2024-01-02', searches: 450 },
        { date: '2024-01-03', searches: 380 },
        { date: '2024-01-04', searches: 510 },
        { date: '2024-01-05', searches: 490 },
        { date: '2024-01-06', searches: 320 },
        { date: '2024-01-07', searches: 280 },
      ],
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('[Analytics] Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
