// @ts-nocheck

/**
 * Job Assignment API Route
 * POST /api/jobs/[id]/assign - Assign a verified contractor to a job
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { getTenantDb } from '@/lib/get-tenant-db';
import { assignContractorSchema } from '@/lib/jobs';
import { notifyContractorAssigned } from '@/lib/notifications/job-notifications';
import { createErrorResponse, ErrorCode } from '@/lib/api-errors';
import { isDispatchEligible } from '@/lib/services/dispatch-eligibility';
import { DISPATCH_INELIGIBLE_ERROR } from '@/lib/services/dispatch-eligibility-error';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await params;
    const { user } = authResult.context;
    const db = getTenantDb(authResult.context);

    const body = await request.json();
    const validation = assignContractorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { contractorId } = validation.data;

    // Verify job exists and is in PENDING status
    const job = await db.job.findUnique({
      where: { id },
      select: { id: true, status: true, jobNumber: true },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Cannot assign contractor to a job with status ${job.status}` },
        { status: 400 }
      );
    }

    // Verify contractor exists and is verified
    const contractor = await db.contractor.findUnique({
      where: { id: contractorId },
      select: {
        id: true,
        userId: true,
        businessName: true,
        isVerified: true,
        isActive: true,
        isSuspended: true,
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor not found' },
        { status: 404 }
      );
    }

    if (!contractor.isActive || contractor.isSuspended) {
      return NextResponse.json(
        { error: 'Contractor is not currently active' },
        { status: 400 }
      );
    }

    if (!contractor.isVerified) {
      return NextResponse.json(
        { error: 'Contractor must be verified before assignment' },
        { status: 400 }
      );
    }

    // DR-900: a contractor with a cancelled ABN or a failed/expired background
    // check (or any other dispatch gate) must get no jobs, so assignment is gated.
    if (!(await isDispatchEligible(contractor.userId))) {
      return createErrorResponse(
        ErrorCode.FORBIDDEN,
        DISPATCH_INELIGIBLE_ERROR.message,
        403,
        { reason: DISPATCH_INELIGIBLE_ERROR.reason, link: DISPATCH_INELIGIBLE_ERROR.link }
      );
    }

    // Assign contractor and update status
    const updatedJob = await db.job.update({
      where: { id },
      data: {
        contractorId,
        status: 'ASSIGNED',
      },
      include: {
        contractor: {
          select: {
            id: true,
            businessName: true,
            isVerified: true,
          },
        },
        property: {
          select: {
            id: true,
            streetAddress: true,
            suburb: true,
            state: true,
            postcode: true,
          },
        },
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'ASSIGN_CONTRACTOR',
        entityType: 'Job',
        entityId: id,
        performedBy: user.id,
        newValues: {
          contractorId,
          contractorName: contractor.businessName,
          jobNumber: job.jobNumber,
        } as Record<string, unknown>,
      },
    });

    // Notify contractor via email + SMS (async, don't block response)
    if (contractor.user) {
      notifyContractorAssigned({
        id: updatedJob.id,
        jobNumber: job.jobNumber,
        type: updatedJob.type,
        clientId: updatedJob.clientId,
        contractor: {
          id: contractor.id,
          businessName: contractor.businessName,
          user: contractor.user,
        },
        property: updatedJob.property,
      }).catch((err) => console.error('Contractor assigned notification failed:', err));
    }

    return NextResponse.json({
      success: true,
      data: updatedJob,
      message: `${contractor.businessName} assigned to job ${job.jobNumber}`,
    });
  } catch (error) {
    console.error('Error assigning contractor:', error);
    return NextResponse.json(
      { error: 'Error assigning contractor' },
      { status: 500 }
    );
  }
}
