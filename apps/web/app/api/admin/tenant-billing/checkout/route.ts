/**
 * POST /api/admin/tenant-billing/checkout
 *
 * Create a Stripe checkout session for tenant subscription.
 * Only accessible to ADMIN and SUPER_ADMIN users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { ErrorCode } from '@/lib/api-errors';
import { createTenantCheckoutSession } from '@/lib/stripe/tenant-subscription';
import { getUserReturnOrigin } from '@/lib/tenant-return-origin';
import { getTenantDb } from '@/lib/get-tenant-db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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

  // Parse request body
  let body: {
    tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  };

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      {
        error: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid request body',
      },
      { status: 400 }
    );
  }

  // Validate tier
  if (!body.tier || !['BASIC', 'PRO', 'ENTERPRISE'].includes(body.tier)) {
    return NextResponse.json(
      {
        error: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid subscription tier. Must be BASIC, PRO, or ENTERPRISE',
      },
      { status: 400 }
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

    // Check if tenant already has an active subscription
    if (tenant.stripeSubscriptionId && tenant.subscriptionStatus === 'ACTIVE') {
      return NextResponse.json(
        {
          error: ErrorCode.VALIDATION_ERROR,
          message: 'Tenant already has an active subscription. Use the billing portal to manage it.',
        },
        { status: 409 }
      );
    }

    // Create checkout session
    const session = await createTenantCheckoutSession({
      tenantId: tenant.id,
      tenantName: tenant.name,
      adminEmail: user.email,
      tier: body.tier,
      // The admin's own tenant domain (from the DB), never request Host/Origin.
      returnOrigin: await getUserReturnOrigin(user),
    });

    // Update tenant with customer ID if this is a new customer
    if (session.customerId && !tenant.stripeCustomerId) {
      await db.tenant.update({
        where: { id: tenantId },
        data: {
          stripeCustomerId: session.customerId,
        },
      });
    }

    return NextResponse.json({
      sessionId: session.sessionId,
      url: session.url,
    });
  } catch (error) {
    console.error('[Tenant Billing] Checkout session creation failed:', error);

    return NextResponse.json(
      {
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}
