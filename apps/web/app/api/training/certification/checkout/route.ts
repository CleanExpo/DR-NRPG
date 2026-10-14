import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { handleUnexpectedError, createErrorResponse, ErrorCode } from '@/lib/api-errors';
import {
  CERTIFICATION_PAYMENT_STATUS,
  NRPG_CERTIFICATION_PAYMENT_TYPE,
  getCertificationPriceId,
  hasPaidCertification,
  isCertificationCheckoutConfigured,
} from '@/lib/training/certification-payment';

export const dynamic = 'force-dynamic';

const NOT_AVAILABLE_MESSAGE = 'Certification checkout is not available yet. Please check back soon.';

/** GET — whether checkout is available and whether this contractor has paid. */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;
    if (!requireRole(user, ['CONTRACTOR'])) {
      return unauthorizedRoleResponse(['CONTRACTOR']);
    }

    return NextResponse.json({
      success: true,
      configured: isCertificationCheckoutConfigured(),
      paid: await hasPaidCertification(user.id),
    });
  } catch (error) {
    return handleUnexpectedError(error);
  }
}

/** POST — start a Stripe Checkout session for the NRPG certification. */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;
    if (!requireRole(user, ['CONTRACTOR'])) {
      return unauthorizedRoleResponse(['CONTRACTOR']);
    }

    const priceId = getCertificationPriceId();
    if (!priceId || !isCertificationCheckoutConfigured()) {
      return createErrorResponse(ErrorCode.SERVICE_UNAVAILABLE, NOT_AVAILABLE_MESSAGE, 503);
    }

    if (await hasPaidCertification(user.id)) {
      return createErrorResponse(ErrorCode.INVALID_INPUT, 'The NRPG certification is already purchased.', 409);
    }

    // Imported lazily so an unconfigured deployment never constructs a Stripe client.
    const { default: stripe } = await import('@/lib/stripe');
    const origin = new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      success_url: `${origin}/dashboard/contractor/training?certification=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/contractor/training?certification=cancel`,
      metadata: {
        type: NRPG_CERTIFICATION_PAYMENT_TYPE,
        contractorId: user.id,
      },
    });

    await prisma.onboardingPayment.create({
      data: {
        id: randomUUID(),
        contractorId: user.id,
        stripeSessionId: session.id,
        stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        amount: session.amount_total ?? 0,
        currency: session.currency ?? 'aud',
        status: CERTIFICATION_PAYMENT_STATUS.PENDING,
        updatedAt: new Date(),
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
