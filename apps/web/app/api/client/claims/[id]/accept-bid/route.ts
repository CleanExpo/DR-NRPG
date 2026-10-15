/**
 * Client API: Accept Contractor Bid
 *
 * POST /api/client/claims/[id]/accept-bid
 * Accepts a contractor bid on a booking, assigns the contractor,
 * rejects remaining bids, and updates booking status.
 *
 * Required role: CLIENT (must own the booking)
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { getTenantDb } from '@/lib/get-tenant-db';
import { createErrorResponse, ErrorCode } from '@/lib/api-errors';
import { isDispatchEligible } from '@/lib/services/dispatch-eligibility';
import { DISPATCH_INELIGIBLE_ERROR } from '@/lib/services/dispatch-eligibility-error';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // 1. Verify client authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;
    const db = getTenantDb(authResult.context);

    const bookingId = params.id;

    // 2. Parse request body
    const body = await request.json();
    const { matchId } = body;

    if (!matchId) {
      return NextResponse.json(
        { error: 'matchId is required' },
        { status: 400 }
      );
    }

    // 3. Get booking and verify ownership
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        clientId: true,
        contractorId: true,
        status: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    if (booking.clientId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorised - You do not own this claim' },
        { status: 403 }
      );
    }

    // 4. Check booking is still pending
    if (booking.contractorId) {
      return NextResponse.json(
        { error: 'A contractor has already been assigned to this claim' },
        { status: 409 }
      );
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'This claim is no longer accepting bids' },
        { status: 409 }
      );
    }

    // 5. Get the contractor match
    const match = await db.contractorMatch.findUnique({
      where: { id: matchId },
      include: {
        contractor: {
          select: {
            id: true,
            userId: true,
            businessName: true,
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      );
    }

    if (match.serviceRequestId !== bookingId) {
      return NextResponse.json(
        { error: 'This bid does not belong to this claim' },
        { status: 400 }
      );
    }

    if (match.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'This bid is no longer available' },
        { status: 409 }
      );
    }

    // 6. Find the Contractor record linked to the same user
    const contractor = await db.contractor.findUnique({
      where: { userId: match.contractor.userId },
      select: { id: true },
    });

    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor profile not found' },
        { status: 404 }
      );
    }

    // DR-900: a contractor with a cancelled ABN or a failed/expired background
    // check (or any other dispatch gate) must get no jobs, so assignment is gated.
    if (!(await isDispatchEligible(match.contractor.userId))) {
      return createErrorResponse(
        ErrorCode.FORBIDDEN,
        DISPATCH_INELIGIBLE_ERROR.message,
        403,
        { reason: DISPATCH_INELIGIBLE_ERROR.reason, link: DISPATCH_INELIGIBLE_ERROR.link }
      );
    }

    // 7. Execute transaction: accept bid, reject others, assign contractor
    await db.$transaction([
      // Accept the selected match
      db.contractorMatch.update({
        where: { id: matchId },
        data: { status: 'ACCEPTED' },
      }),

      // Reject all other pending matches for this booking
      db.contractorMatch.updateMany({
        where: {
          serviceRequestId: bookingId,
          id: { not: matchId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      }),

      // Assign the contractor to the booking and update status
      db.booking.update({
        where: { id: bookingId },
        data: {
          contractorId: contractor.id,
          status: 'CONFIRMED',
          estimatedCostAUD: match.budget ? parseFloat(match.budget) : undefined,
        },
      }),

      // Log the action
      db.auditLog.create({
        data: {
          action: 'BID_ACCEPTED',
          entityType: 'Booking',
          entityId: bookingId,
          performedBy: user.id,
          resourceType: 'ContractorMatch',
          resourceId: matchId,
          details: `Client accepted bid from ${match.contractor.businessName}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Bid accepted successfully. Your contractor has been assigned.',
      booking: {
        id: bookingId,
        status: 'CONFIRMED',
        contractorId: contractor.id,
        contractorName: match.contractor.businessName,
      },
    });
  } catch (error) {
    console.error('Error accepting bid:', error);

    return NextResponse.json(
      { error: 'Failed to accept bid' },
      { status: 500 }
    );
  }
}
