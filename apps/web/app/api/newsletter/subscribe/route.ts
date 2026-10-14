/**
 * Newsletter Subscription API Route
 *
 * POST /api/newsletter/subscribe
 * Handles newsletter subscriptions and integrates with email service providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { NewsletterSubscription } from '@/lib/resources/types';
import { sendNewsletterConfirmationEmail } from '@/lib/email';

/**
 * Send the double-opt-in confirmation email via Resend.
 * Failures are non-fatal — the subscription is already persisted, so we
 * log and continue (matching the repo's fire-and-forget notification pattern).
 */
async function subscribeToEmailService(subscription: NewsletterSubscription): Promise<void> {
  if (!subscription.confirmationToken) {
    return;
  }

  const result = await sendNewsletterConfirmationEmail(
    subscription.email,
    subscription.confirmationToken,
    subscription.firstName
  );

  if (!result.success) {
    console.error('Failed to send newsletter confirmation email:', result.error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate email
    if (!body.email || !body.email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Create subscription object
    const subscription: NewsletterSubscription = {
      email: body.email.toLowerCase().trim(),
      firstName: body.firstName?.trim(),
      lastName: body.lastName?.trim(),
      interests: body.interests || [],
      source: body.source || 'resources',
      subscribedAt: new Date(),
      confirmed: false,
      confirmationToken: generateConfirmationToken(),
    };

    // Store subscription in database
    try {
      const { prisma } = await import('@/lib/prisma');

      // Check for existing subscription
      const existingSubscriber = await prisma.newsletterSubscription.findUnique({
        where: { email: subscription.email },
      });

      if (existingSubscriber && existingSubscriber.isActive) {
        return NextResponse.json(
          {
            success: false,
            error: 'This email is already subscribed to our newsletter',
          },
          { status: 409 }
        );
      }

      // Create or update subscription
      const savedSubscription = await prisma.newsletterSubscription.upsert({
        where: { email: subscription.email },
        update: {
          isActive: true,
          confirmedAt: null,
          confirmed: false,
          confirmationToken: subscription.confirmationToken,
          unsubscribedAt: null,
          subscribedAt: new Date(),
        },
        create: {
          email: subscription.email,
          firstName: subscription.firstName,
          lastName: subscription.lastName,
          interests: subscription.interests,
          source: subscription.source,
          confirmed: false,
          confirmationToken: subscription.confirmationToken,
          isActive: true,
        },
      });

      console.log('=== NEWSLETTER SUBSCRIPTION SAVED ===');
      console.log('Source:', savedSubscription.source);
      console.log('Interests:', savedSubscription.interests);
      console.log('======================================');
    } catch (dbError) {
      console.error('Database error saving newsletter subscription:', dbError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save subscription to database',
        },
        { status: 500 }
      );
    }

    // Send the double-opt-in confirmation email (non-fatal on failure)
    await subscribeToEmailService(subscription);

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully subscribed! Please check your email to confirm.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to subscribe.' },
    { status: 405 }
  );
}

/**
 * Generate secure confirmation token
 */
function generateConfirmationToken(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}`;
}
