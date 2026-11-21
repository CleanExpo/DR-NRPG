// @ts-nocheck

/**
 * Public API: Newsletter Subscription Endpoint
 * Handles newsletter email signups from the marketing site
 *
 * Route: POST /api/public/newsletter
 * Rate Limit: 10 requests per 15 minutes per IP
 * Security: CAPTCHA required, honeypot validation, CSP headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { basePrisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/api/rate-limit';
import {
  addSecurityHeaders,
  isHoneypotTriggered,
  isProbablyBot,
} from '@/lib/api/security';
import {
  newsletterSchema,
  validateRequestBody,
} from '@/lib/api/validation-schemas';
import { checkCaptcha } from '@/lib/services/captcha.service';
import {
  withErrorHandler,
  successResponse,
  Logger,
  ValidationError,
  APIError,
} from '@/lib/api/error-handler';
import { sendNewsletterWelcomeEmail } from '@/lib/email/resend';

export const dynamic = 'force-dynamic';

// Custom rate limit for newsletter
const newsletterRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: 'Too many subscription attempts. Please try again later.',
});

/**
 * POST /api/public/newsletter
 * Subscribe to newsletter
 */
async function handleNewsletterSubscription(req: NextRequest) {
  const logger = new Logger({
    endpoint: '/api/public/newsletter',
    method: 'POST',
  });

  // 1. Rate limiting
  const rateLimitResult = await newsletterRateLimit(req);
  if (rateLimitResult) {
    logger.warn('Rate limit exceeded');
    return rateLimitResult;
  }

  // 2. Bot detection
  if (isProbablyBot(req)) {
    logger.warn('Bot detected via User-Agent');
    throw new ValidationError('Invalid request');
  }

  // 3. Parse request body
  const body = await req.json();

  // 4. Honeypot validation
  if (isHoneypotTriggered(body.honeypot)) {
    logger.warn('Honeypot triggered - likely spam bot');
    return successResponse(
      { message: 'Successfully subscribed to newsletter' },
      { statusCode: 200 }
    );
  }

  // 5. Validate request body
  const validation = await validateRequestBody(newsletterSchema, body);
  if (!validation.success) {
    logger.warn('Validation failed', { errors: validation.errors });
    throw validation.errors;
  }

  const data = validation.data;

  // 6. CAPTCHA verification (hCaptcha). A missing token is refused, not skipped (DR-955).
  const captcha = await checkCaptcha(data.captchaToken);
  if (!captcha.ok) {
    logger.warn('CAPTCHA refused', { reason: captcha.reason });
    if (captcha.status === 503) {
      throw new APIError(captcha.message, 503, 'CAPTCHA_UNAVAILABLE');
    }
    throw new ValidationError(captcha.message, { reason: captcha.reason });
  }

  // 7. Check if email already subscribed
  const existingSubscription = await basePrisma.newsletterSubscription.findUnique({
    where: { email: data.email },
  });

  if (existingSubscription) {
    // Update existing subscription
    if (!existingSubscription.isActive) {
      // Reactivate subscription
      await basePrisma.newsletterSubscription.update({
        where: { email: data.email },
        data: {
          isActive: true,
          firstName: data.firstName || existingSubscription.firstName,
          lastName: data.lastName || existingSubscription.lastName,
          interests: data.interests || existingSubscription.interests,
          state: data.state || existingSubscription.state,
          postcode: data.postcode || existingSubscription.postcode,
          marketingConsent: data.marketingConsent,
          resubscribedAt: new Date(),
          source: data.source || existingSubscription.source,
          referrer: data.referrer || existingSubscription.referrer,
        },
      });

      logger.info('Newsletter subscription reactivated', { email: data.email });

      // Send welcome back email
      const welcomeResult = await sendNewsletterWelcomeEmail(data.email, data.firstName);
      if (!welcomeResult.success) {
        logger.warn('Failed to send newsletter welcome email', { error: welcomeResult.error });
      }

      const response = successResponse(
        {
          message: 'Welcome back! Your newsletter subscription has been reactivated.',
          status: 'reactivated',
        },
        { statusCode: 200 }
      );

      return addSecurityHeaders(response, { csp: 'strict', cors: true });
    } else {
      // Already subscribed
      logger.info('Email already subscribed', { email: data.email });

      const response = successResponse(
        {
          message: 'This email is already subscribed to our newsletter.',
          status: 'already_subscribed',
        },
        { statusCode: 200 }
      );

      return addSecurityHeaders(response, { csp: 'strict', cors: true });
    }
  }

  // 8. Create new subscription
  try {
    const subscription = await basePrisma.newsletterSubscription.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        interests: data.interests || [],
        state: data.state,
        postcode: data.postcode,
        marketingConsent: data.marketingConsent,
        isActive: true,
        subscribedAt: new Date(),
        source: data.source || 'website',
        referrer: data.referrer,
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        userAgent: req.headers.get('user-agent'),

        // Generate unsubscribe token
        unsubscribeToken: generateUnsubscribeToken(),
      },
    });

    logger.info('Newsletter subscription created', {
      subscriptionId: subscription.id,
      email: data.email,
    });

    // 9. Send welcome email
    const welcomeResult = await sendNewsletterWelcomeEmail(data.email, data.firstName);
    if (!welcomeResult.success) {
      logger.warn('Failed to send newsletter welcome email', { error: welcomeResult.error });
    }

    // 10. Return success response
    const response = successResponse(
      {
        message: 'Successfully subscribed to newsletter! Check your email to confirm.',
        status: 'subscribed',
        interests: subscription.interests,
      },
      { statusCode: 201 }
    );

    // Add security headers
    return addSecurityHeaders(response, { csp: 'strict', cors: true });
  } catch (error) {
    logger.error('Failed to create newsletter subscription', error);

    // Check for duplicate email (race condition)
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      throw new APIError(
        'This email is already subscribed',
        409,
        'DUPLICATE_SUBSCRIPTION'
      );
    }

    throw error;
  }
}

/**
 * DELETE /api/public/newsletter?token=xxx
 * Unsubscribe from newsletter
 */
async function handleNewsletterUnsubscribe(req: NextRequest) {
  const logger = new Logger({
    endpoint: '/api/public/newsletter',
    method: 'DELETE',
  });

  // Get unsubscribe token from query params
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    throw new ValidationError('Missing unsubscribe token or email');
  }

  // Find subscription
  const subscription = await basePrisma.newsletterSubscription.findUnique({
    where: { email },
  });

  if (!subscription) {
    throw new APIError('Subscription not found', 404, 'NOT_FOUND');
  }

  // Verify token
  if (subscription.unsubscribeToken !== token) {
    throw new ValidationError('Invalid unsubscribe token');
  }

  // Deactivate subscription (soft delete)
  await basePrisma.newsletterSubscription.update({
    where: { email },
    data: {
      isActive: false,
      unsubscribedAt: new Date(),
    },
  });

  logger.info('Newsletter subscription deactivated', { email });

  // TODO: Remove from email marketing platform

  const response = successResponse(
    {
      message: 'You have been successfully unsubscribed from our newsletter.',
      status: 'unsubscribed',
    },
    { statusCode: 200 }
  );

  return addSecurityHeaders(response, { csp: 'strict', cors: true });
}

/**
 * Generate secure unsubscribe token
 */
function generateUnsubscribeToken(): string {
  return `unsub_${Date.now()}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

// OPTIONS endpoint for CORS preflight
export async function OPTIONS(req: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return addSecurityHeaders(response, { csp: 'none', cors: true });
}

// POST endpoint wrapped with error handler
export const POST = withErrorHandler(handleNewsletterSubscription);

// DELETE endpoint for unsubscribe
export const DELETE = withErrorHandler(handleNewsletterUnsubscribe);
