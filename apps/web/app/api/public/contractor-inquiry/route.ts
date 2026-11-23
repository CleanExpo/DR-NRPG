// @ts-nocheck

/**
 * Public API: Contractor Inquiry Endpoint
 * Handles NRPG contractor application submissions from the marketing site
 *
 * Route: POST /api/public/contractor-inquiry
 * Rate Limit: 3 requests per hour per IP (strict to prevent spam)
 * Security: CAPTCHA required, honeypot validation, CSP headers, ABN validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { basePrisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/api/rate-limit';
import { getClientIp } from '@/lib/net/client-ip';
import {
  verifyRecaptcha,
  addSecurityHeaders,
  isHoneypotTriggered,
  isProbablyBot,
} from '@/lib/api/security';
import {
  contractorInquirySchema,
  validateRequestBody,
} from '@/lib/api/validation-schemas';
import {
  withErrorHandler,
  successResponse,
  Logger,
  ValidationError,
  APIError,
} from '@/lib/api/error-handler';

export const dynamic = 'force-dynamic';

// Strict rate limit for contractor inquiries
const contractorInquiryRateLimit = rateLimit({
  name: 'public-contractor-inquiry',
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  message: 'Too many contractor applications. Please try again later.',
});

/**
 * Validate Australian Business Number (ABN)
 * Uses the ABN checksum algorithm
 */
function validateABN(abn: string): boolean {
  // Remove any spaces
  const cleanABN = abn.replace(/\s/g, '');

  // Check length
  if (cleanABN.length !== 11) {
    return false;
  }

  // Check if all digits
  if (!/^\d{11}$/.test(cleanABN)) {
    return false;
  }

  // Apply ABN checksum algorithm
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  let sum = 0;

  for (let i = 0; i < 11; i++) {
    const digit = parseInt(cleanABN[i]);
    const weight = weights[i];

    // Subtract 1 from the first digit
    if (i === 0) {
      sum += (digit - 1) * weight;
    } else {
      sum += digit * weight;
    }
  }

  // ABN is valid if sum is divisible by 89
  return sum % 89 === 0;
}

/**
 * Calculate application score based on contractor details
 * Higher score = better qualified contractor
 */
function calculateApplicationScore(data: any): number {
  let score = 0;

  // Years in business (max 30 points)
  if (data.yearsInBusiness >= 10) score += 30;
  else if (data.yearsInBusiness >= 5) score += 20;
  else if (data.yearsInBusiness >= 2) score += 10;

  // Number of employees (max 20 points)
  if (data.numberOfEmployees >= 20) score += 20;
  else if (data.numberOfEmployees >= 10) score += 15;
  else if (data.numberOfEmployees >= 5) score += 10;
  else if (data.numberOfEmployees >= 1) score += 5;

  // Insurance coverage (max 20 points)
  if (data.hasPublicLiability) score += 10;
  if (data.hasWorkersCompensation) score += 10;
  if (data.publicLiabilityAmount && data.publicLiabilityAmount >= 10000000) {
    score += 5; // $10M+ coverage
  }

  // Services offered (max 15 points)
  const servicesCount = data.servicesOffered?.length || 0;
  if (servicesCount >= 10) score += 15;
  else if (servicesCount >= 5) score += 10;
  else if (servicesCount >= 3) score += 5;

  // Service areas (max 10 points)
  const areasCount = data.serviceAreas?.length || 0;
  if (areasCount >= 5) score += 10;
  else if (areasCount >= 3) score += 7;
  else if (areasCount >= 1) score += 5;

  // Certifications (max 5 points)
  const certificationsCount = data.certifications?.length || 0;
  score += Math.min(certificationsCount * 2, 5);

  // Emergency availability (bonus 5 points)
  if (data.availability24x7) score += 5;

  return Math.min(score, 100); // Cap at 100
}

/**
 * Determine application status based on score
 */
function determineApplicationStatus(score: number): 'AUTO_APPROVED' | 'REVIEW_REQUIRED' | 'NEEDS_MORE_INFO' {
  if (score >= 70) return 'AUTO_APPROVED';
  if (score >= 40) return 'REVIEW_REQUIRED';
  return 'NEEDS_MORE_INFO';
}

/**
 * POST /api/public/contractor-inquiry
 * Submit contractor application
 */
async function handleContractorInquiry(req: NextRequest) {
  const logger = new Logger({
    endpoint: '/api/public/contractor-inquiry',
    method: 'POST',
  });

  // 1. Rate limiting (strict)
  const rateLimitResult = await contractorInquiryRateLimit(req);
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
      { message: 'Your application has been submitted successfully' },
      { statusCode: 200 }
    );
  }

  // 5. Validate request body
  const validation = await validateRequestBody(contractorInquirySchema, body);
  if (!validation.success) {
    logger.warn('Validation failed', { errors: validation.errors });
    throw validation.errors;
  }

  const data = validation.data;

  // 6. ABN validation
  if (!validateABN(data.abn)) {
    throw new ValidationError('Invalid ABN', {
      abn: ['Please provide a valid 11-digit Australian Business Number'],
    });
  }

  // 7. CAPTCHA verification (strict)
  if (data.captchaToken) {
    const captchaResult = await verifyRecaptcha(data.captchaToken, undefined, 0.6); // High threshold
    if (!captchaResult.success) {
      logger.warn('CAPTCHA verification failed', {
        errorCodes: captchaResult.errorCodes,
      });
      throw new ValidationError('CAPTCHA verification failed');
    }

    if (captchaResult.score !== undefined && captchaResult.score < 0.6) {
      logger.warn('CAPTCHA score too low', { score: captchaResult.score });
      throw new ValidationError('CAPTCHA verification failed - suspicious activity detected');
    }

    logger.info('CAPTCHA verified', { score: captchaResult.score });
  }

  // 8. Check for duplicate ABN
  const existingApplication = await basePrisma.contractorInquiry.findUnique({
    where: { abn: data.abn },
  });

  if (existingApplication) {
    logger.warn('Duplicate ABN application', { abn: data.abn });

    // If application is still pending, don't allow duplicate
    if (existingApplication.status === 'PENDING' || existingApplication.status === 'REVIEW_REQUIRED') {
      throw new APIError(
        'An application with this ABN is already being processed',
        409,
        'DUPLICATE_APPLICATION',
        { applicationId: existingApplication.id }
      );
    }

    // If previous application was rejected, allow reapplication after 90 days
    if (existingApplication.status === 'REJECTED') {
      const daysSinceRejection = Math.floor(
        (Date.now() - existingApplication.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceRejection < 90) {
        throw new APIError(
          `You can reapply ${90 - daysSinceRejection} days after your previous application was rejected`,
          403,
          'REAPPLICATION_TOO_SOON'
        );
      }
    }
  }

  // 9. Calculate application score
  const applicationScore = calculateApplicationScore(data);
  const applicationStatus = determineApplicationStatus(applicationScore);

  logger.info('Application score calculated', {
    score: applicationScore,
    status: applicationStatus,
  });

  // 10. Create contractor inquiry
  try {
    const inquiry = await basePrisma.contractorInquiry.create({
      data: {
        // Business Information
        businessName: data.businessName,
        abn: data.abn,
        businessType: data.businessType,

        // Contact Information
        contactFirstName: data.contactFirstName,
        contactLastName: data.contactLastName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,

        // Business Address
        businessAddress: data.businessAddress,
        suburb: data.suburb,
        state: data.state,
        postcode: data.postcode,

        // Services & Experience
        servicesOffered: data.servicesOffered,
        serviceAreas: data.serviceAreas,
        certifications: data.certifications as any, // Prisma Json type
        yearsInBusiness: data.yearsInBusiness,
        numberOfEmployees: data.numberOfEmployees,

        // Insurance
        hasPublicLiability: data.hasPublicLiability,
        publicLiabilityAmount: data.publicLiabilityAmount,
        hasWorkersCompensation: data.hasWorkersCompensation,

        // Additional Information
        additionalInfo: data.additionalInfo,
        website: data.website,
        availability24x7: data.availability24x7,
        emergencyResponseTime: data.emergencyResponseTime,

        // Consent
        termsAccepted: data.termsAccepted,
        backgroundCheckConsent: data.backgroundCheckConsent,

        // Application Scoring
        applicationScore,
        status: applicationStatus,

        // Metadata
        source: data.source || 'website',
        referrer: data.referrer,
        submittedAt: new Date(),
        ipAddress: getClientIp(req),
        userAgent: req.headers.get('user-agent'),
      },
    });

    logger.info('Contractor inquiry created', {
      inquiryId: inquiry.id,
      abn: data.abn,
      status: applicationStatus,
    });

    // 11. TODO: Post-submission actions based on status
    if (applicationStatus === 'AUTO_APPROVED') {
      // Send to onboarding workflow
      // Create contractor account
      // Send welcome email with next steps
      // Notify contractor verification team for final checks
    } else if (applicationStatus === 'REVIEW_REQUIRED') {
      // Send to manual review queue
      // Notify review team
      // Send acknowledgment email to applicant
    } else {
      // NEEDS_MORE_INFO
      // Send email requesting additional information
      // Create follow-up task
    }

    // 12. TODO: Integrations
    // - Add to CRM
    // - Create background check request
    // - Trigger ABN lookup verification
    // - Send to compliance team if required

    // 13. Return success response
    const response = successResponse(
      {
        message: 'Your contractor application has been submitted successfully',
        applicationId: inquiry.id,
        status: applicationStatus,
        nextSteps:
          applicationStatus === 'AUTO_APPROVED'
            ? [
                'Your application has been preliminarily approved',
                'We will conduct background and credential verification',
                'You will receive onboarding instructions within 2-3 business days',
                'Prepare copies of your insurance certificates and licenses',
              ]
            : applicationStatus === 'REVIEW_REQUIRED'
              ? [
                  'Your application is under review',
                  'We will contact you within 5-7 business days',
                  'Please have your documentation ready for verification',
                  'Check your email for further instructions',
                ]
              : [
                  'Thank you for your interest',
                  'We need some additional information to process your application',
                  'You will receive an email within 24 hours',
                  'Please respond promptly to expedite the review process',
                ],
        estimatedReviewTime:
          applicationStatus === 'AUTO_APPROVED'
            ? '2-3 business days'
            : applicationStatus === 'REVIEW_REQUIRED'
              ? '5-7 business days'
              : '1-2 weeks',
      },
      { statusCode: 201 }
    );

    // Add security headers
    return addSecurityHeaders(response, { csp: 'strict', cors: true });
  } catch (error) {
    logger.error('Failed to create contractor inquiry', error);

    // Check for duplicate ABN (race condition)
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      throw new APIError(
        'An application with this ABN already exists',
        409,
        'DUPLICATE_ABN'
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
export const POST = withErrorHandler(handleContractorInquiry);
