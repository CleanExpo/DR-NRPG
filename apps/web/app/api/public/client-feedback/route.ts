/**
 * Public API - Client Feedback Submission Endpoint
 *
 * Handles general client feedback, suggestions, complaints, and bug reports
 * from the website without requiring authentication.
 *
 * POST /api/public/client-feedback
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { basePrisma } from '@/lib/prisma';

// Validation schema for client feedback
const clientFeedbackSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  feedbackType: z.enum(['COMPLAINT', 'SUGGESTION', 'PRAISE', 'BUG_REPORT'], {
    errorMap: () => ({ message: 'Invalid feedback type' })
  }),
  message: z.string().min(10, 'Feedback message must be at least 10 characters'),
  rating: z.number().min(1).max(5).optional(),
  serviceName: z.string().optional(), // Which service/page they're providing feedback about
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();

    let validatedData;
    try {
      validatedData = clientFeedbackSchema.parse(body);
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

    // Save feedback to database
    try {
      const savedFeedback = await basePrisma.clientFeedback.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          feedbackType: validatedData.feedbackType,
          message: validatedData.message,
          rating: validatedData.rating,
          serviceName: validatedData.serviceName,
          isResolved: false,
          submittedAt: new Date(),
        },
      });

      console.log('=== CLIENT FEEDBACK SAVED ===');
      console.log('Feedback ID:', savedFeedback.id);
      console.log('Type:', validatedData.feedbackType);
      console.log('Service:', validatedData.serviceName || 'General');
      console.log('Rating:', validatedData.rating || 'N/A');
      console.log('Message length:', validatedData.message.length);
      console.log('==============================');

      // TODO: Send notification email to admin
      // TODO: Add feedback to support queue for triage
      // TODO: Send confirmation email to client

      return NextResponse.json(
        {
          success: true,
          message: 'Thank you for your feedback! We appreciate your input.',
          feedbackId: savedFeedback.id,
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error('Database error saving feedback:', dbError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save feedback to database',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Feedback submission error:', error);

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
