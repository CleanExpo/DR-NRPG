// @ts-nocheck

/**
 * Public API: Triage Endpoint
 * Handles damage assessment tool submissions from the marketing site
 *
 * Route: POST /api/public/triage
 * Rate Limit: 10 requests per 15 minutes per IP
 * Security: CAPTCHA required, honeypot validation, CSP headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { rateLimit } from '@/lib/api/rate-limit';
import {
  addSecurityHeaders,
  isHoneypotTriggered,
  isProbablyBot,
} from '@/lib/api/security';
import {
  triageSchema,
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

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// Custom rate limit for triage (more lenient than lead capture)
const triageRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: 'Too many triage submissions. Please try again later.',
});

/**
 * Calculate triage score and recommendations based on responses
 */
function calculateTriageScore(responses: Array<{ questionId: string; answer: unknown }>) {
  let urgencyScore = 0;
  let estimatedCost = 0;
  const recommendations: string[] = [];
  const requiredServices: string[] = [];

  // Analyze responses to determine urgency and recommendations
  for (const response of responses) {
    const { questionId, answer } = response;

    switch (questionId) {
      case 'water_standing':
        if (answer === true || answer === 'yes') {
          urgencyScore += 30;
          recommendations.push('Immediate water extraction required');
          requiredServices.push('WATER_DAMAGE');
        }
        break;

      case 'water_source':
        if (answer === 'sewage' || answer === 'flood') {
          urgencyScore += 40;
          recommendations.push('Category 3 water damage - biohazard protocols required');
          requiredServices.push('BIOHAZARD_REMEDIATION');
        } else if (answer === 'pipe' || answer === 'appliance') {
          urgencyScore += 20;
          requiredServices.push('WATER_DAMAGE');
        }
        break;

      case 'affected_area':
        if (typeof answer === 'string') {
          const area = answer.toLowerCase();
          if (area.includes('entire') || area.includes('multiple')) {
            urgencyScore += 25;
            estimatedCost += 5000;
          } else if (area.includes('room')) {
            urgencyScore += 15;
            estimatedCost += 2000;
          } else {
            urgencyScore += 5;
            estimatedCost += 500;
          }
        }
        break;

      case 'fire_smoke':
        if (answer === true || answer === 'yes') {
          urgencyScore += 35;
          recommendations.push('Fire and smoke damage restoration needed');
          requiredServices.push('FIRE_DAMAGE', 'SMOKE_DAMAGE');
          estimatedCost += 10000;
        }
        break;

      case 'mould_visible':
        if (answer === true || answer === 'yes') {
          urgencyScore += 30;
          recommendations.push('Professional mould remediation required');
          requiredServices.push('MOULD_REMEDIATION');
          estimatedCost += 3000;
        }
        break;

      case 'structural_damage':
        if (answer === true || answer === 'yes') {
          urgencyScore += 40;
          recommendations.push('Structural assessment required before restoration');
        }
        break;

      case 'when_occurred':
        if (typeof answer === 'string') {
          if (answer.includes('hour') || answer.includes('today')) {
            urgencyScore += 20;
          } else if (answer.includes('week')) {
            urgencyScore += 10;
          }
        }
        break;

      case 'insurance_coverage':
        if (answer === false || answer === 'no') {
          recommendations.push('Consider payment plans or financing options');
        }
        break;
    }
  }

  // Determine urgency level
  let urgencyLevel: 'URGENT' | 'HIGH' | 'STANDARD' | 'SCHEDULED';
  if (urgencyScore >= 80) {
    urgencyLevel = 'URGENT';
  } else if (urgencyScore >= 50) {
    urgencyLevel = 'HIGH';
  } else if (urgencyScore >= 20) {
    urgencyLevel = 'STANDARD';
  } else {
    urgencyLevel = 'SCHEDULED';
  }

  return {
    urgencyScore,
    urgencyLevel,
    estimatedCost,
    recommendations: [...new Set(recommendations)], // Remove duplicates
    requiredServices: [...new Set(requiredServices)],
  };
}

/**
 * POST /api/public/triage
 * Process triage assessment
 */
async function handleTriage(req: NextRequest) {
  const logger = new Logger({
    endpoint: '/api/public/triage',
    method: 'POST',
  });

  // 1. Rate limiting
  const rateLimitResult = await triageRateLimit(req);
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
      { message: 'Assessment completed successfully' },
      { statusCode: 200 }
    );
  }

  // 5. Validate request body
  const validation = await validateRequestBody(triageSchema, body);
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

  // 7. Calculate triage score and recommendations
  const triageResults = calculateTriageScore(data.responses);

  logger.info('Triage score calculated', {
    urgencyLevel: triageResults.urgencyLevel,
    score: triageResults.urgencyScore,
  });

  // 8. Save triage assessment to database
  try {
    const triage = await prisma.triageAssessment.create({
      data: {
        // Contact information
        email: data.email,
        phone: data.phone,

        // Location
        postcode: data.postcode,
        state: data.state,

        // Responses
        responses: data.responses as any, // Prisma Json type

        // Calculated results
        urgencyScore: triageResults.urgencyScore,
        urgencyLevel: triageResults.urgencyLevel,
        estimatedCost: triageResults.estimatedCost,
        recommendations: triageResults.recommendations,
        requiredServices: triageResults.requiredServices,

        // Metadata
        triageSessionId: data.triageSessionId,
        completedAt: data.completedAt ? new Date(data.completedAt) : new Date(),
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        userAgent: req.headers.get('user-agent'),
      },
    });

    logger.info('Triage assessment saved', { triageId: triage.id });

    // 9. TODO: Follow-up actions based on urgency
    if (triageResults.urgencyLevel === 'URGENT') {
      // Send immediate notification to emergency response team
      // Trigger SMS to customer
    } else if (triageResults.urgencyLevel === 'HIGH') {
      // Send notification to sales team
      // Schedule follow-up call
    }

    // 10. Return triage results
    const response = successResponse(
      {
        message: 'Assessment completed successfully',
        triageId: triage.id,
        results: {
          urgencyLevel: triageResults.urgencyLevel,
          urgencyScore: triageResults.urgencyScore,
          estimatedCost: triageResults.estimatedCost,
          estimatedCostRange: {
            min: Math.floor(triageResults.estimatedCost * 0.7),
            max: Math.ceil(triageResults.estimatedCost * 1.3),
          },
          recommendations: triageResults.recommendations,
          requiredServices: triageResults.requiredServices,
          nextSteps: [
            triageResults.urgencyLevel === 'URGENT'
              ? 'An emergency response team will contact you within 2 hours'
              : triageResults.urgencyLevel === 'HIGH'
                ? 'We will contact you within 24 hours to schedule an assessment'
                : 'We will contact you within 48 hours to discuss your needs',
            'Prepare photos of the damaged areas',
            'Contact your insurance provider if applicable',
            'Do not attempt repairs yourself - this may void insurance coverage',
          ],
        },
      },
      { statusCode: 201 }
    );

    // Add security headers
    return addSecurityHeaders(response, { csp: 'strict', cors: true });
  } catch (error) {
    logger.error('Failed to save triage assessment', error);
    throw error;
  }
}

// OPTIONS endpoint for CORS preflight
export async function OPTIONS(req: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return addSecurityHeaders(response, { csp: 'none', cors: true });
}

// POST endpoint wrapped with error handler
export const POST = withErrorHandler(handleTriage);
