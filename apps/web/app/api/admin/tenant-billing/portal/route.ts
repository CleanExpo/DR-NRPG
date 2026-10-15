/**
 * GET /api/admin/tenant-billing/portal
 *
 * Create a Stripe billing portal session for tenant.
 * Allows admin to manage subscription, payment methods, and invoices.
 * Only accessible to ADMIN and SUPER_ADMIN users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { ErrorCode } from '@/lib/api-errors';
import { createTenantPortalSession } from '@/lib/stripe/tenant-subscription';
import { getUserReturnOrigin } from '@/lib/tenant-return-origin';
import { getTenantDb } from '@/lib/get-tenant-db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Authenticate request
  const authResult = await authenticateRequest(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { user, tenantId } = authResult.context;

  // Only ADMIN and SUPER_ADMIN can manage tenant billing
  if (!requireRole(user, ['ADMIN', 'SUPER_ADMIN'])) {
    return unauthorizedRoleResponse(['ADMIN', 'SUPER_ADMIN']);
  }

  // Get tenant-scoped database client
  const db = getTenantDb(authResult.context);

  if (false) {
    return NextResponse.json(
      {
        error: ErrorCode.FORBIDDEN,
        message: 'Only administrators can manage tenant billing',
      },
      { status: 403 }
    );
  }

  // Validate tenant exists
  if (!tenantId) {
    return NextResponse.json(
      {
        error: ErrorCode.FORBIDDEN,
        message: 'No tenant associated with this account',
      },
      { status: 403 }
    );
  }

  try {
    // Fetch tenant details
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json(
        {
          error: ErrorCode.RESOURCE_NOT_FOUND,
          message: 'Tenant not found',
        },
        { status: 404 }
      );
    }

    // Check if tenant has a Stripe customer ID
    if (!tenant.stripeCustomerId) {
      return NextResponse.json(
        {
          error: ErrorCode.VALIDATION_ERROR,
          message: 'No billing account found. Please create a subscription first.',
        },
        { status: 400 }
      );
    }

    // Create billing portal session
    const session = await createTenantPortalSession(
      tenant.stripeCustomerId,
      tenantId,
      // The admin's own tenant domain (from the DB), never request Host/Origin.
      await getUserReturnOrigin(user)
    );

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error('[Tenant Billing] Portal session creation failed:', error);

    return NextResponse.json(
      {
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to create portal session',
      },
      { status: 500 }
    );
  }
}
