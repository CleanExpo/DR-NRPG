/**
 * Public API - Client Event Analytics Endpoint
 *
 * Tracks general user interaction events on the website
 * - PAGE_VIEW: User visited a page
 * - BUTTON_CLICK: User clicked a CTA button
 * - FORM_SUBMIT: User submitted a form
 * - CTA_CLICK: User clicked a call-to-action
 *
 * POST /api/public/analytics/events
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { basePrisma } from '@/lib/prisma';

// Validation schema for analytics events
const analyticsEventSchema = z.object({
  eventType: z.enum(['PAGE_VIEW', 'BUTTON_CLICK', 'FORM_SUBMIT', 'CTA_CLICK', 'LINK_CLICK']),
  eventName: z.string().optional(),
  pageUrl: z.string().optional(),
  referrer: z.string().optional(),
  sessionId: z.string().optional(),
  eventData: z.record(z.any()).optional(), // Allow arbitrary JSON data
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();

    let validatedData;
    try {
      validatedData = analyticsEventSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: error.errors,
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Track event in database
    try {
      const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                        request.headers.get('x-real-ip') ||
                        'unknown';
      const userAgent = request.headers.get('user-agent');

      const savedEvent = await basePrisma.clientAnalytics.create({
        data: {
          eventType: validatedData.eventType,
          eventName: validatedData.eventName,
          pageUrl: validatedData.pageUrl,
          referrer: validatedData.referrer,
          sessionId: validatedData.sessionId,
          ipAddress,
          userAgent,
          eventData: validatedData.eventData,
          recordedAt: new Date(),
        },
      });

      console.log('=== CLIENT EVENT TRACKED ===');
      console.log('Event ID:', savedEvent.id);
      console.log('Event Type:', validatedData.eventType);
      console.log('Event Name:', validatedData.eventName || 'N/A');
      console.log('Page URL:', validatedData.pageUrl || 'N/A');
      console.log('Session ID:', validatedData.sessionId || 'Anonymous');
      console.log('============================');

      return NextResponse.json(
        {
          success: true,
          message: 'Event tracked successfully',
          eventId: savedEvent.id,
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error('Database error tracking event:', dbError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to track event in database',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Analytics event error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again.',
      },
      { status: 500 }
    );
  }
}

// OPTIONS Handler (CORS)
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
