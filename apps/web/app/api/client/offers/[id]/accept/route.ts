
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route (uses request.headers)
export const dynamic = 'force-dynamic';

import { getTenantDb } from '@/lib/get-tenant-db';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { isDispatchEligible } from '@/lib/services/dispatch-eligibility';
import { DISPATCH_INELIGIBLE_ERROR } from '@/lib/services/dispatch-eligibility-error';
import { handleUnexpectedError, ErrorCode, createErrorResponse } from '@/lib/api-errors';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;
    
    // Get tenant-scoped database client
    const db = getTenantDb(authResult.context);

    // Check role authorization
    if (!requireRole(user, ['ADMIN', 'SUPER_ADMIN'])) {
      return unauthorizedRoleResponse(['ADMIN', 'SUPER_ADMIN']);
    }

    // Get the offer/match
    const offer = await db.contractorMatch.findUnique({
      where: { id: params.id },
      include: {
        contractor: {
          include: {
            user: true,
          },
        },
        serviceRequest: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!offer) {
      return createErrorResponse(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Offer not found',
        404
      );
    }

    // DR-900: a contractor with a cancelled ABN or a failed/expired background
    // check (or any other dispatch gate) must get no jobs, so assignment is gated.
    if (!(await isDispatchEligible(offer.contractor.userId))) {
      return createErrorResponse(
        ErrorCode.FORBIDDEN,
        DISPATCH_INELIGIBLE_ERROR.message,
        403,
        { reason: DISPATCH_INELIGIBLE_ERROR.reason, link: DISPATCH_INELIGIBLE_ERROR.link }
      );
    }

    // Auto-dispatch: client acceptance is not supported. Admin-only override.
    // (Ownership checks are not required for admin actions.)

    // Update the offer status to ACCEPTED
    await db.contractorMatch.update({
      where: { id: params.id },
      data: { status: 'ACCEPTED' },
    });

    // Update the service request status to MATCHED
    await db.serviceRequest.update({
      where: { id: offer.serviceRequestId ?? '' },
      data: { status: 'MATCHED' },
    });

    // Send notification message to contractor
    await db.message.create({
      data: {
        senderId: user.id,
        receiverId: offer.contractor.userId,
        content: `Great news! Your bid for "${offer.serviceRequest?.serviceTitle ?? 'your service request'}" has been accepted. The client is looking forward to working with you.`,
        messageType: 'BID_ACCEPTED',
        requestId: offer.serviceRequestId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Offer accepted successfully',
    });
  } catch (error) {
    return handleUnexpectedError(error);
  }
}
