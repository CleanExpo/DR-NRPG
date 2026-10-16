// @ts-nocheck
/**
 * Contractor API: Submit and Manage Bids
 *
 * POST /api/contractor/bids
 * Submit a bid on an available job request
 *
 * GET /api/contractor/bids
 * Get contractor's submitted bids
 *
 * Required role: CONTRACTOR
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { getTenantDb } from '@/lib/get-tenant-db';
import { z } from 'zod';
import { createErrorResponse, ErrorCode } from '@/lib/api-errors';
import { isDispatchEligible } from '@/lib/services/dispatch-eligibility';
import { DISPATCH_INELIGIBLE_ERROR } from '@/lib/services/dispatch-eligibility-error';

// Validation schema for bid submission
const submitBidSchema = z.object({
  matchId: z.string(),
  proposedBudget: z.number().positive('Budget must be greater than 0'),
  estimatedHours: z.number().positive('Hours must be greater than 0').optional(),
  startDate: z.string().datetime().optional(),
  message: z.string().max(1000, 'Message cannot exceed 1000 characters').optional(),
});

type BidSubmission = z.infer<typeof submitBidSchema>;

// POST: Submit a bid
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate and get tenant context
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;

    // 2. Get tenant-scoped database client
    const db = getTenantDb(authResult.context);

    // 3. Get ContractorProfile record — ContractorMatch.contractorId references ContractorProfile.id
    const contractorProfile = await db.contractorProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!contractorProfile) {
      return NextResponse.json(
        { error: 'Contractor profile not found' },
        { status: 404 }
      );
    }

    // DR-900: a contractor with a cancelled ABN or a failed/expired background
    // check (or any other dispatch gate) must get no jobs, so assignment is gated.
    if (!(await isDispatchEligible(user.id))) {
      return createErrorResponse(
        ErrorCode.FORBIDDEN,
        DISPATCH_INELIGIBLE_ERROR.message,
        403,
        { reason: DISPATCH_INELIGIBLE_ERROR.reason, link: DISPATCH_INELIGIBLE_ERROR.link }
      );
    }

    // 4. Parse and validate request body
    const body = await request.json();

    let validatedData: BidSubmission;
    try {
      validatedData = submitBidSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid bid data', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }

    // 5. Get the ContractorMatch record
    const match = await db.contractorMatch.findUnique({
      where: { id: validatedData.matchId },
      include: {
        contractor: {
          select: { id: true },
        },
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // 6. Verify contractor owns this match (ContractorMatch.contractorId = ContractorProfile.id)
    if (match.contractorId !== contractorProfile.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You do not own this match' },
        { status: 403 }
      );
    }

    // 7. Update ContractorMatch with bid details
    const updatedMatch = await db.contractorMatch.update({
      where: { id: validatedData.matchId },
      data: {
        status: 'ACCEPTED',
        budget: validatedData.proposedBudget.toString(),
        estimatedHours: validatedData.estimatedHours?.toString(),
        startDate: validatedData.startDate,
        contractorMessage: validatedData.message,
        updatedAt: new Date(),
      },
      include: {
        serviceRequest: {
          select: { id: true },
        },
      },
    });

    console.log('=== BID SUBMITTED ===');
    console.log('ContractorProfile:', contractorProfile.id);
    console.log('Match ID:', validatedData.matchId);
    console.log('Budget:', validatedData.proposedBudget);

    // 8. Get contractor info and service request client for event emission
    const [profileInfo, serviceReq] = await Promise.all([
      db.contractorProfile.findUnique({
        where: { id: contractorProfile.id },
        select: { businessName: true },
      }),
      updatedMatch.serviceRequest
        ? db.serviceRequest.findUnique({
            where: { id: updatedMatch.serviceRequest.id },
            select: { userId: true },
          })
        : Promise.resolve(null),
    ]);

    // 9. Emit bid submitted event
    if (profileInfo && serviceReq && updatedMatch.serviceRequest) {
      try {
        const { emitBidSubmitted } = await import('@/lib/realtime/emit-handlers');
        await emitBidSubmitted(
          updatedMatch.serviceRequest.id,
          validatedData.matchId,
          contractorProfile.id,
          user.name || 'Contractor',
          profileInfo.businessName,
          validatedData.proposedBudget,
          validatedData.estimatedHours || null,
          validatedData.message || null,
          serviceReq.userId
        );
      } catch (eventError) {
        console.error('Failed to emit bid submitted event:', eventError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Bid submitted successfully',
        bid: {
          matchId: updatedMatch.id,
          status: updatedMatch.status,
          budget: updatedMatch.budget,
          estimatedHours: updatedMatch.estimatedHours,
          startDate: updatedMatch.startDate,
          submittedAt: updatedMatch.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Bid submission error:', error);

    return NextResponse.json(
      { error: 'Failed to submit bid' },
      { status: 500 }
    );
  }
}

// GET: Get contractor's submitted bids
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;
    const db = getTenantDb(authResult.context);

    // ContractorMatch.contractorId references ContractorProfile.id
    const contractorProfile = await db.contractorProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!contractorProfile) {
      return NextResponse.json(
        { error: 'Contractor profile not found' },
        { status: 404 }
      );
    }

    const bids = await db.contractorMatch.findMany({
      where: {
        contractorId: contractorProfile.id,
        status: 'ACCEPTED',
      },
      include: {
        serviceRequest: {
          select: {
            id: true,
            serviceCategory: true, // ServiceRequest uses serviceCategory, not australianServiceType
            location: true,        // ServiceRequest uses location, not serviceSuburb
            budget: true,          // ServiceRequest.budget is String?, not estimatedCostAUD Decimal
            createdAt: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formattedBids = bids.map((bid) => ({
      bidId: bid.id,
      requestId: bid.serviceRequest?.id ?? null,
      disasterType: bid.serviceRequest?.serviceCategory ?? null,
      location: bid.serviceRequest?.location ?? null,
      clientBudget: bid.serviceRequest?.budget ? parseFloat(bid.serviceRequest.budget) || null : null,
      proposedBudget: bid.budget ? Number(bid.budget) : null,
      estimatedHours: bid.estimatedHours ? Number(bid.estimatedHours) : null,
      startDate: bid.startDate,
      message: bid.contractorMessage,
      submittedAt: bid.updatedAt,
      status: bid.status,
    }));

    return NextResponse.json({
      success: true,
      bids: formattedBids,
      total: formattedBids.length,
    });
  } catch (error) {
    console.error('Error fetching bids:', error);

    return NextResponse.json(
      { error: 'Failed to fetch bids' },
      { status: 500 }
    );
  }
}
