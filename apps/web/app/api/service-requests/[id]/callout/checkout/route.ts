import { SITE_URL } from '@/lib/seo/site-url';
import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { getTenantDb } from '@/lib/get-tenant-db';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { getNrpgCalloutSplit } from '@/lib/pricing/nrpg-callout';
import { handleUnexpectedError, createErrorResponse, ErrorCode } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;
    
    // Get tenant-scoped database client
    const db = getTenantDb(authResult.context);

    if (!requireRole(user, ['CLIENT'])) {
      return unauthorizedRoleResponse(['CLIENT']);
    }

    const serviceRequest = await db.serviceRequest.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true, serviceTitle: true, status: true },
    });

    if (!serviceRequest) {
      return createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND, 'Service request not found', 404);
    }

    if (serviceRequest.userId !== user.id) {
      return createErrorResponse(ErrorCode.FORBIDDEN, 'Unauthorized callout payment', 403);
    }

    const split = getNrpgCalloutSplit();
    // Stripe redirects use the canonical site, never the request Host/Origin.
    const origin = SITE_URL;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'aud',
            unit_amount: Math.round(split.total.totalAUD * 100),
            product_data: {
              name: 'NRPG Initial Callout',
              description: 'Initial callout fee held by NRPG until job completion',
            },
          },
        },
      ],
      success_url: `${origin}/dashboard/client/callout/${serviceRequest.id}?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/client/callout/${serviceRequest.id}?status=cancel`,
      metadata: {
        serviceRequestId: serviceRequest.id,
        clientId: user.id,
        type: 'NRPG_CALLOUT',
      },
    });

    await db.serviceRequestCalloutPayment.upsert({
      where: { serviceRequestId: serviceRequest.id },
      create: {
        serviceRequestId: serviceRequest.id,
        clientId: user.id,
        totalAUD: split.total.totalAUD,
        totalExGstAUD: split.total.exGstAUD,
        gstAUD: split.total.gstAUD,
        platformFeeAUD: split.platformFee.totalAUD,
        platformFeeExGstAUD: split.platformFee.exGstAUD,
        platformFeeGstAUD: split.platformFee.gstAUD,
        contractorEntitlementAUD: split.contractorEntitlement.totalAUD,
        contractorEntitlementExGstAUD: split.contractorEntitlement.exGstAUD,
        contractorEntitlementGstAUD: split.contractorEntitlement.gstAUD,
        gstInclusive: split.total.gstInclusive,
        status: 'CHECKOUT_CREATED',
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      },
      update: {
        totalAUD: split.total.totalAUD,
        totalExGstAUD: split.total.exGstAUD,
        gstAUD: split.total.gstAUD,
        platformFeeAUD: split.platformFee.totalAUD,
        platformFeeExGstAUD: split.platformFee.exGstAUD,
        platformFeeGstAUD: split.platformFee.gstAUD,
        contractorEntitlementAUD: split.contractorEntitlement.totalAUD,
        contractorEntitlementExGstAUD: split.contractorEntitlement.exGstAUD,
        contractorEntitlementGstAUD: split.contractorEntitlement.gstAUD,
        gstInclusive: split.total.gstInclusive,
        status: 'CHECKOUT_CREATED',
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      },
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    return handleUnexpectedError(error);
  }
}
