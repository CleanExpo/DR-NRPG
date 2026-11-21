// @ts-nocheck

/**
 * Public API: Lead Capture Endpoint
 * Handles claim form submissions from the marketing site
 *
 * Route: POST /api/public/lead-capture
 * Rate Limit: 5 requests per 15 minutes per IP
 * Security: CAPTCHA required, honeypot validation, CSP headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { basePrisma } from '@/lib/prisma';
import { strictRateLimit } from '@/lib/api/rate-limit';
import {
  addSecurityHeaders,
  isHoneypotTriggered,
  isProbablyBot,
} from '@/lib/api/security';
import {
  leadCaptureSchema,
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
import { sendLeadConfirmationEmail } from '@/lib/email/resend';
import { bridgeLeadToCrm } from '@/lib/crm/lead-bridge';

export const dynamic = 'force-dynamic';

/**
 * POST /api/public/lead-capture
 * Create a new lead from claim form submission
 */
async function handleLeadCapture(req: NextRequest) {
  const logger = new Logger({
    endpoint: '/api/public/lead-capture',
    method: 'POST',
  });

  // 1. Rate limiting
  const rateLimitResult = await strictRateLimit(req);
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
    // Return success to avoid revealing honeypot
    return successResponse(
      { message: 'Your claim has been submitted successfully' },
      { statusCode: 200 }
    );
  }

  // 5. Validate request body
  const validation = await validateRequestBody(leadCaptureSchema, body);
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

  // 7. Create lead in database
  try {
    const lead = await basePrisma.leadCapture.create({
      data: {
        // Personal Information
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,

        // Property Information
        propertyAddress: data.propertyAddress,
        suburb: data.suburb,
        state: data.state,
        postcode: data.postcode,

        // Damage Information
        damageType: data.damageType,
        damageDescription: data.damageDescription,

        // Insurance Information
        hasInsurance: data.hasInsurance,
        insuranceProvider: data.insuranceProvider,
        claimNumber: data.claimNumber,

        // Urgency
        urgency: data.urgency,

        // Marketing
        preferredContactMethod: data.preferredContactMethod,
        marketingConsent: data.marketingConsent,

        // Metadata
        source: data.source || 'website',
        referrer: data.referrer,
        submittedAt: new Date(),
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        userAgent: req.headers.get('user-agent'),
      },
    });

    logger.info('Lead created successfully', { leadId: lead.id });

    // Bridge the lead into the CRM (customer lifecycle + opportunity). Best-effort:
    // the lead is already persisted, so a CRM failure must not affect the response.
    void bridgeLeadToCrm({
      email: data.email,
      name: `${data.firstName} ${data.lastName}`.trim(),
      phone: data.phone,
      source: data.source || 'lead_capture',
      state: data.state,
      postcode: data.postcode,
      suburb: data.suburb,
      serviceType: data.damageType,
    });

    // 8. Send confirmation email to customer
    const emailResult = await sendLeadConfirmationEmail(data.email, {
      firstName: data.firstName,
      leadId: lead.id,
      damageType: data.damageType,
      suburb: data.suburb,
      urgency: data.urgency,
    });

    if (!emailResult.success) {
      logger.warn('Failed to send lead confirmation email', { error: emailResult.error });
    }

    // 8.5. Queue contractor matching job
    try {
      const { createJob } = await import('@/lib/queue/background-jobs');

      await createJob(
        'CONTRACTOR_MATCHING',
        {
          claimId: lead.id,
          criteria: {
            serviceType: data.damageType,
            location: {
              state: data.state,
              suburb: data.suburb,
              postcode: data.postcode,
            },
            urgency: data.urgency?.toLowerCase() || 'standard',
            preferredAvailability: data.preferredAvailability,
          },
        },
        {
          priority: data.urgency === 'URGENT' ? 1 : data.urgency === 'HIGH' ? 2 : 5,
          claimId: lead.id,
        }
      );

      logger.info('Contractor matching job queued', { leadId: lead.id, urgency: data.urgency });
    } catch (queueError) {
      logger.error('Failed to queue contractor matching job', queueError);
      // Don't fail the request - matching can be triggered manually by admin if needed
    }

    // 9. Return success response
    const response = successResponse(
      {
        message: 'Your claim has been submitted successfully',
        leadId: lead.id,
        estimatedResponseTime:
          data.urgency === 'URGENT'
            ? 'within 2 hours'
            : data.urgency === 'HIGH'
              ? 'within 24 hours'
              : 'within 48 hours',
      },
      { statusCode: 201 }
    );

    // Add security headers
    return addSecurityHeaders(response, { csp: 'strict', cors: true });
  } catch (error) {
    logger.error('Failed to create lead', error);

    // Check for duplicate submission
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      throw new APIError(
        'A claim with this information has already been submitted',
        409,
        'DUPLICATE_SUBMISSION'
      );
    }

    throw error;
  }
}

// OPTIONS endpoint for CORS preflight
export async function OPTIONS(req: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return addSecurityHeaders(response, { csp: 'none', cors: true });
}

// POST endpoint wrapped with error handler
export const POST = withErrorHandler(handleLeadCapture);
