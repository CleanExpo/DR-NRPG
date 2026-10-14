/**
 * Public API - Claim Submission Endpoint
 *
 * Handles AI-automated claim intake with:
 * - Rate limiting (prevent spam)
 * - CAPTCHA verification
 * - Data validation
 * - Priority calculation
 * - AI-powered contractor matching (background job)
 * - Email notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { basePrisma } from '@/lib/prisma';
import { completeClaimSchema, calculatePriority } from '@/lib/claim-wizard/types';
import { verifyCaptcha } from '@/lib/services/captcha.service';
import { sendClaimSubmissionConfirmationEmail } from '@/lib/email/client-notifications';
import { createJob } from '@/lib/queue/background-jobs';
import { getStateFromPostcode } from '@/src/lib/validation/australia';
import { getRequiredCerts } from '@/lib/claim-wizard/cert-requirements';

// Rate limiting storage (in-memory for demo, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 claims per hour per IP

// ============================================================================
// Rate Limiting
// ============================================================================

function getRateLimitKey(request: NextRequest): string {
  // Use X-Forwarded-For in production behind proxy
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `claim_submit_${ip}`;
}

function checkRateLimit(key: string): { allowed: boolean; remainingRequests: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // No record or expired window
  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true, remainingRequests: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  // Within window
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remainingRequests: 0 };
  }

  // Increment count
  record.count++;
  return { allowed: true, remainingRequests: RATE_LIMIT_MAX_REQUESTS - record.count };
}

// Note: CAPTCHA verification is now handled by the captcha.service.ts
// The verifyCaptcha function is imported from there and handles:
// - Production: Always requires valid hCaptcha token
// - Development: Uses hCaptcha if configured, otherwise logs warning
// - Testing: Allows test tokens only in test environment

// ============================================================================
// Claim Submission Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting
    const rateLimitKey = getRateLimitKey(request);
    const rateLimit = checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many claim submissions. Please try again later.',
          retryAfter: 3600, // seconds
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'Retry-After': '3600',
          },
        }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();

    let validatedData;
    try {
      validatedData = completeClaimSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid claim data',
            details: error.errors,
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // 3. Verify CAPTCHA
    const captchaValid = await verifyCaptcha(validatedData.captchaToken);
    if (!captchaValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'CAPTCHA verification failed',
        },
        { status: 400 }
      );
    }

    // 4. Calculate priority
    const priority = calculatePriority({
      step1: validatedData.step1,
      step2: validatedData.step2,
      step3: validatedData.step3,
      currentStep: 3,
      completedSteps: [1, 2, 3],
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    });

    // 5. Generate claim ID
    const claimId = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // 6. REAL IMPLEMENTATION: Save claim to database using PublicClaim model
    let savedClaim;
    try {
      // Determine required IICRC certifications based on disaster type
      const requiredCerts = getRequiredCerts(validatedData.step1.disasterType);

      // Create a public claim record (pre-authentication intake)
      savedClaim = await basePrisma.publicClaim.create({
        data: {
          // Client Information
          clientName: validatedData.step2.name,
          clientEmail: validatedData.step2.email,
          clientPhone: validatedData.step2.phone,
          propertyAddress: validatedData.step2.propertyAddress,
          suburb: validatedData.step2.suburb,
          postcode: validatedData.step2.postcode,

          // Incident Details
          disasterType: validatedData.step1.disasterType,
          requiredIICRCCerts: requiredCerts,
          incidentDate: new Date(validatedData.step1.incidentDate),
          isOngoing: validatedData.step1.isOngoing === 'yes',
          isEmergency: validatedData.step1.isEmergency === 'yes',

          // Damage Details
          damageDescription: validatedData.step3.damageDescription,
          hasInsurance: validatedData.step3.hasInsurance === 'yes',
          insuranceProvider: validatedData.step3.insuranceProvider || null,
          policyNumber: validatedData.step3.policyNumber || null,

          // Assessment
          priority: priority.charAt(0).toUpperCase() + priority.slice(1), // Convert to Title Case
          status: 'PENDING',
        },
      });

      console.log('=== CLAIM SAVED TO DATABASE ===');
      console.log('Claim ID:', claimId);
      console.log('Database Record ID:', savedClaim.id);
      console.log('Priority:', priority);
      console.log('Location:', validatedData.step2.suburb, validatedData.step2.postcode);
      console.log('Disaster Type:', validatedData.step1.disasterType);
      console.log('Has Insurance:', validatedData.step3.hasInsurance);
      console.log('================================');

      // Send confirmation email (asynchronously, don't block response)
      sendClaimSubmissionConfirmationEmail({
        clientName: validatedData.step2.name,
        email: validatedData.step2.email,
        claimId: claimId,
        damageType: validatedData.step1.disasterType,
        propertyAddress: validatedData.step2.propertyAddress,
        urgency: priority.toUpperCase(),
        estimatedValue: undefined, // Not captured in current claim flow
      }).catch((error) => {
        console.error('Background email send failed:', error);
      });
    } catch (dbError) {
      console.error('Database error saving claim:', dbError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save claim to database',
        },
        { status: 500 }
      );
    }

    // 7. REAL IMPLEMENTATION: Queue contractor matching background job
    const state = getStateFromPostcode(validatedData.step2.postcode) || 'NSW';
    const matchingJob = await createJob(
      'CONTRACTOR_MATCHING',
      {
        claimId: savedClaim.id,
        criteria: {
          serviceType: validatedData.step1.disasterType,
          location: {
            state,
            suburb: validatedData.step2.suburb,
            postcode: validatedData.step2.postcode,
          },
          urgency:
            priority === 'critical'
              ? 'emergency'
              : priority === 'high'
              ? 'urgent'
              : 'standard',
          specialRequirements: validatedData.step3.hasInsurance === 'yes' ? ['insurance'] : [],
        },
      },
      {
        priority: priority === 'critical' ? 1 : priority === 'high' ? 3 : 5,
        claimId: savedClaim.id,
        tenantId: savedClaim.tenantId || undefined,
        initiatedBy: 'system',
      }
    );

    const estimatedResponseTime = priority === 'critical' ? '15 minutes' : '30 minutes';

    console.log('=== CONTRACTOR MATCHING JOB QUEUED ===');
    console.log('Job ID:', matchingJob.jobId);
    console.log('Priority:', priority === 'critical' ? 1 : priority === 'high' ? 3 : 5);
    console.log('Urgency:', priority === 'critical' ? 'emergency' : priority === 'high' ? 'urgent' : 'standard');
    console.log('Location:', state, validatedData.step2.suburb, validatedData.step2.postcode);
    console.log('Service Type:', validatedData.step1.disasterType);
    console.log('======================================');

    // 8. Return success response with saved claim data
    return NextResponse.json(
      {
        success: true,
        claimId,
        databaseId: savedClaim?.id,
        message: 'Claim submitted successfully. Contractors are being matched.',
        matchingJobId: matchingJob.jobId,
        matchingStatus: 'IN_PROGRESS',
        estimatedResponseTime,
        priority,
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': rateLimit.remainingRequests.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Claim submission error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again.',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS Handler (CORS)
// ============================================================================

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
