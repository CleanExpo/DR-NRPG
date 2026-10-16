/**
 * Booking Contractor Assignment Route
 * Handles contractor assignment to bookings
 * POST   /api/bookings/[id]/assign - Assign contractor to booking
 * DELETE /api/bookings/[id]/assign - Unassign contractor
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { getTenantDb } from '@/lib/get-tenant-db';
import { BookingStatus } from '@prisma/client';
import { sendBookingConfirmationEmail } from '@/lib/email/client-notifications';
import { createErrorResponse, ErrorCode } from '@/lib/api-errors';
import { isDispatchEligible } from '@/lib/services/dispatch-eligibility';
import { DISPATCH_INELIGIBLE_ERROR } from '@/lib/services/dispatch-eligibility-error';

// ============================================================================
// POST /api/bookings/[id]/assign - Assign contractor to booking
// ============================================================================

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;

    if (!requireRole(user, ['ADMIN', 'SUPER_ADMIN'])) {
      return unauthorizedRoleResponse(['ADMIN', 'SUPER_ADMIN']);
    }

    const db = getTenantDb(authResult.context);

    const body = await request.json();
    const { contractorId } = body;

    if (!contractorId) {
      return NextResponse.json(
        { error: 'contractorId is required' },
        { status: 400 }
      );
    }

    // Verify booking exists
    const booking = await db.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify contractor exists and is verified
    const contractor = await db.contractor.findUnique({
      where: { id: contractorId },
      include: {
        iicrcCertifications: {
          where: { isActive: true },
        },
      },
    });

    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor not found' },
        { status: 404 }
      );
    }

    if (!contractor.isVerified) {
      return NextResponse.json(
        { error: 'Contractor is not verified' },
        { status: 400 }
      );
    }

    if (contractor.iicrcCertifications.length === 0) {
      return NextResponse.json(
        { error: 'Contractor does not have active IICRC certification' },
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

    // Check if contractor operates in the booking's area
    if (!contractor.operatingStates.includes(booking.serviceState)) {
      return NextResponse.json(
        { error: 'Contractor does not operate in the booking area' },
        { status: 400 }
      );
    }

    // Assign contractor
    const updatedBooking = await db.booking.update({
      where: { id: params.id },
      data: {
        contractorId,
        status: BookingStatus.CONFIRMED,
      },
      include: {
        contractor: {
          select: {
            id: true,
            businessName: true,
            averageRating: true,
            user: {
              select: {
                australianPhoneNumber: true,
              },
            },
          },
        },
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Send updated booking confirmation email with contractor details
    // Type assertion for included relations
    const bookingWithRelations = updatedBooking as typeof updatedBooking & {
      client?: { name: string | null; email: string };
      contractor?: { businessName: string; user?: { australianPhoneNumber: string | null } };
    };

    if (bookingWithRelations.client && bookingWithRelations.contractor) {
      sendBookingConfirmationEmail({
        clientName: bookingWithRelations.client.name || 'Valued Client',
        email: bookingWithRelations.client.email,
        bookingId: updatedBooking.id,
        contractorName: bookingWithRelations.contractor.businessName,
        contractorPhone: bookingWithRelations.contractor.user?.australianPhoneNumber || undefined,
        serviceType: updatedBooking.australianServiceType,
        scheduledDate: updatedBooking.scheduledDate || new Date(),
        propertyAddress: `${updatedBooking.streetAddress}, ${updatedBooking.serviceSuburb}, ${updatedBooking.serviceState} ${updatedBooking.servicePostcode}`,
        totalAmount: updatedBooking.estimatedCostAUD ? Number(updatedBooking.estimatedCostAUD) : undefined,
      }).catch((error) => {
        console.error('Failed to send booking confirmation email after contractor assignment:', error);
      });
    }

    // Log audit
    await db.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'Booking',
        entityId: booking.id,
        performedBy: user.id,
        newValues: {
          contractorId,
          status: BookingStatus.CONFIRMED,
        } as any,
      },
    });

    // Create notification for contractor
    // TODO: Implement notification system

    return NextResponse.json({
      success: true,
      data: updatedBooking,
      message: 'Contractor assigned successfully',
    });
  } catch (error) {
    console.error('Error assigning contractor:', error);
    return NextResponse.json(
      { error: 'Error assigning contractor' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/bookings/[id]/assign - Unassign contractor
// ============================================================================

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;

    if (!requireRole(user, ['ADMIN', 'SUPER_ADMIN'])) {
      return unauthorizedRoleResponse(['ADMIN', 'SUPER_ADMIN']);
    }

    const db = getTenantDb(authResult.context);

    const booking = await db.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (!booking.contractorId) {
      return NextResponse.json(
        { error: 'No contractor assigned to this booking' },
        { status: 400 }
      );
    }

    // Can only unassign if booking hasn't started
    if (booking.status === BookingStatus.IN_PROGRESS ||
        booking.status === BookingStatus.COMPLETED) {
      return NextResponse.json(
        { error: 'Cannot unassign contractor from in-progress or completed booking' },
        { status: 400 }
      );
    }

    const updatedBooking = await db.booking.update({
      where: { id: params.id },
      data: {
        contractorId: null,
        status: BookingStatus.PENDING,
      },
    });

    // Log audit
    await db.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'Booking',
        entityId: booking.id,
        performedBy: user.id,
        newValues: {
          contractorId: null,
          status: BookingStatus.PENDING,
        } as any,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedBooking,
      message: 'Contractor unassigned successfully',
    });
  } catch (error) {
    console.error('Error unassigning contractor:', error);
    return NextResponse.json(
      { error: 'Error unassigning contractor' },
      { status: 500 }
    );
  }
}
