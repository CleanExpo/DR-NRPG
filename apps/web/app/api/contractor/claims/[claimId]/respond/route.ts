/**
 * Contractor Claim Response API
 *
 * Allows contractors to respond to claim matches:
 * - ACCEPTED: Contractor accepts the job
 * - DECLINED: Contractor declines the job
 * - COUNTER_OFFER: Contractor proposes different terms
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { z } from 'zod';
import { basePrisma } from '@/lib/prisma';
import { createErrorResponse, ErrorCode } from '@/lib/api-errors';
import { isDispatchEligible } from '@/lib/services/dispatch-eligibility';
import { DISPATCH_INELIGIBLE_ERROR } from '@/lib/services/dispatch-eligibility-error';
import { sendContractorAssignmentConfirmationEmail } from '@/lib/email/contractor-notifications';
import { sendClaimContractorAssignedEmail } from '@/lib/email/client-notifications';

// Request validation schema
const responseSchema = z.object({
  response: z.enum(['ACCEPTED', 'DECLINED', 'COUNTER_OFFER']),
  message: z.string().optional(),
  proposedAmount: z.number().positive().optional(),
  estimatedTimeframe: z.string().optional(),
});

/**
 * POST /api/contractor/claims/[claimId]/respond
 * Submit response to a claim match
 */
export async function POST(request: NextRequest, props: { params: Promise<{ claimId: string }> }) {
  const params = await props.params;
  try {
    // 1. Authenticate request (contractor only)
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;
    const { claimId } = params;

    // 2. Parse and validate request body
    const body = await request.json();
    const validationResult = responseSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid request body',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { response, message, proposedAmount, estimatedTimeframe } = validationResult.data;

    // 3. Get contractor record for authenticated user
    const contractor = await basePrisma.contractor.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        businessName: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!contractor) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Contractor profile not found for authenticated user',
        },
        { status: 404 }
      );
    }

    // 4. Find contractor match for this claim
    const match = await basePrisma.contractorMatch.findFirst({
      where: {
        claimId,
        contractorId: contractor.id,
        notificationStatus: { in: ['SENT', 'PENDING'] }, // Only allow response to sent notifications
      },
      include: {
        claim: {
          select: {
            id: true,
            clientName: true,
            clientEmail: true,
            clientPhone: true,
            propertyAddress: true,
            suburb: true,
            postcode: true,
            disasterType: true,
            damageDescription: true,
            hasInsurance: true,
            insuranceProvider: true,
            policyNumber: true,
            priority: true,
            status: true,
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'No pending match found for this claim',
        },
        { status: 404 }
      );
    }

    if (!match.claim) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Claim not found',
        },
        { status: 404 }
      );
    }

    // 5. Check if already responded
    if (match.contractorRespondedAt) {
      return NextResponse.json(
        {
          error: 'Already Responded',
          message: `You already responded to this claim with: ${match.contractorResponse}`,
          existingResponse: match.contractorResponse,
          respondedAt: match.contractorRespondedAt,
        },
        { status: 409 }
      );
    }

    // 6. Check response deadline
    if (match.responseDeadline && new Date() > match.responseDeadline) {
      return NextResponse.json(
        {
          error: 'Deadline Expired',
          message: 'Response deadline has passed. This opportunity may have been assigned to another contractor.',
          deadline: match.responseDeadline,
        },
        { status: 410 }
      );
    }

    // DR-900: a contractor with a cancelled ABN or a failed/expired background
    // check (or any other dispatch gate) must get no jobs, so assignment is gated.
    if (response !== 'DECLINED' && !(await isDispatchEligible(user.id))) {
      return createErrorResponse(
        ErrorCode.FORBIDDEN,
        DISPATCH_INELIGIBLE_ERROR.message,
        403,
        { reason: DISPATCH_INELIGIBLE_ERROR.reason, link: DISPATCH_INELIGIBLE_ERROR.link }
      );
    }

    // 7. Update contractor match with response
    await basePrisma.contractorMatch.update({
      where: { id: match.id },
      data: {
        contractorResponse: response,
        contractorRespondedAt: new Date(),
        notificationStatus: 'RESPONDED',
      },
    });

    console.log(
      `[Contractor Response] ${contractor.businessName} responded ${response} to claim ${claimId}`
    );

    // 8. Handle ACCEPTED response
    if (response === 'ACCEPTED') {
      // Update claim status to assigned
      await basePrisma.publicClaim.update({
        where: { id: claimId },
        data: {
          status: 'CONTRACTOR_ASSIGNED',
          notes: `Assigned to ${contractor.businessName}`,
        },
      });

      // Mark other contractor matches as declined (only one can be assigned)
      await basePrisma.contractorMatch.updateMany({
        where: {
          claimId,
          id: { not: match.id },
          contractorResponse: null,
        },
        data: {
          notificationStatus: 'SUPERSEDED',
        },
      });

      // Send confirmation email to contractor with full client details
      sendContractorAssignmentConfirmationEmail({
        contractorName: contractor.user.name || 'Contractor',
        contractorEmail: contractor.user.email,
        businessName: contractor.businessName,
        claimId,
        clientName: match.claim.clientName,
        clientEmail: match.claim.clientEmail,
        clientPhone: match.claim.clientPhone,
        propertyAddress: match.claim.propertyAddress,
        disasterType: match.claim.disasterType,
        damageDescription: match.claim.damageDescription,
        urgency: match.claim.priority,
        hasInsurance: match.claim.hasInsurance,
        insuranceProvider: match.claim.insuranceProvider || undefined,
        policyNumber: match.claim.policyNumber || undefined,
      }).catch((error) => {
        console.error('Failed to send contractor assignment confirmation:', error);
      });

      // Send notification to client
      sendClaimContractorAssignedEmail({
        clientName: match.claim.clientName,
        email: match.claim.clientEmail,
        claimId,
        contractorName: contractor.businessName,
        contractorEmail: contractor.user.email,
        contractorPhone: '', // TODO: Add contractor phone to schema
        estimatedArrival: '24 hours', // Default, contractor will confirm
      }).catch((error) => {
        console.error('Failed to send client contractor assignment notification:', error);
      });

      // Update rotation tracking - contractor accepted job
      await basePrisma.contractorRotation.updateMany({
        where: {
          workspace: {
            contractors: {
              some: { id: contractor.id },
            },
          },
          postcode: match.claim.postcode,
        },
        data: {
          totalJobsReceived: { increment: 1 },
        },
      });

      console.log(`[Contractor Response] Claim ${claimId} assigned to ${contractor.businessName}`);
    }

    // 9. Handle DECLINED response
    if (response === 'DECLINED') {
      console.log(
        `[Contractor Response] ${contractor.businessName} declined claim ${claimId}${message ? `: ${message}` : ''}`
      );

      // Update rotation tracking - contractor declined job
      const rotation = await basePrisma.contractorRotation.findFirst({
        where: {
          workspace: {
            contractors: {
              some: { id: contractor.id },
            },
          },
          postcode: match.claim.postcode,
        },
      });

      if (rotation) {
        // Calculate new decline rate
        const newDeclinedCount = rotation.totalJobsDeclined + 1;
        const totalOffered = rotation.totalJobsOffered || 1; // Avoid division by zero
        const newDeclineRate = (newDeclinedCount / totalOffered) * 100;

        await basePrisma.contractorRotation.update({
          where: { id: rotation.id },
          data: {
            totalJobsDeclined: { increment: 1 },
            declineRate: newDeclineRate,
          },
        });

        console.log(
          `[Contractor Response] Updated decline tracking - ${contractor.businessName} decline rate: ${newDeclineRate.toFixed(1)}%`
        );
      }

      // TODO: Trigger backup contractor notification job
      // This will be implemented in Phase 5 (Auto-escalation)
    }

    // 10. Handle COUNTER_OFFER response
    if (response === 'COUNTER_OFFER') {
      console.log(
        `[Contractor Response] ${contractor.businessName} submitted counter-offer for claim ${claimId}: $${proposedAmount}`
      );

      // TODO: Notify client of counter-offer
      // TODO: Create counter-offer tracking in database
    }

    // 11. Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Response recorded: ${response}`,
        response,
        claimId,
        contractorId: contractor.id,
        respondedAt: new Date(),
        actions:
          response === 'ACCEPTED'
            ? {
                claimAssigned: true,
                emailsSent: ['contractor_confirmation', 'client_notification'],
              }
            : response === 'DECLINED'
            ? {
                backupContractorNotified: false, // TODO: Phase 5
              }
            : response === 'COUNTER_OFFER'
            ? {
                counterOfferCreated: false, // TODO: Future enhancement
                proposedAmount,
                estimatedTimeframe,
              }
            : {},
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contractor response error:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/contractor/claims/[claimId]/respond
 * Get current match status and deadline info
 */
export async function GET(request: NextRequest, props: { params: Promise<{ claimId: string }> }) {
  const params = await props.params;
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;
    const { claimId } = params;

    // Get contractor record
    const contractor = await basePrisma.contractor.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!contractor) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Contractor profile not found',
        },
        { status: 404 }
      );
    }

    // Find contractor match
    const match = await basePrisma.contractorMatch.findFirst({
      where: {
        claimId,
        contractorId: contractor.id,
      },
      select: {
        id: true,
        matchScore: true,
        matchReason: true,
        notificationStatus: true,
        notificationSentAt: true,
        responseDeadline: true,
        contractorRespondedAt: true,
        contractorResponse: true,
        isBackup: true,
      },
    });

    if (!match) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'No match found for this claim',
        },
        { status: 404 }
      );
    }

    // Calculate time remaining
    const now = new Date();
    const deadline = match.responseDeadline;
    const timeRemaining = deadline ? Math.max(0, deadline.getTime() - now.getTime()) : null;
    const minutesRemaining = timeRemaining ? Math.floor(timeRemaining / 60000) : null;

    return NextResponse.json({
      success: true,
      match: {
        id: match.id,
        matchScore: match.matchScore,
        matchReasons: match.matchReason,
        notificationStatus: match.notificationStatus,
        notificationSentAt: match.notificationSentAt,
        responseDeadline: match.responseDeadline,
        timeRemaining: minutesRemaining,
        hasResponded: !!match.contractorRespondedAt,
        response: match.contractorResponse,
        respondedAt: match.contractorRespondedAt,
        isBackup: match.isBackup,
        canRespond:
          !match.contractorRespondedAt &&
          match.notificationStatus === 'SENT' &&
          (deadline ? now < deadline : true),
      },
    });
  } catch (error) {
    console.error('Get match status error:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
