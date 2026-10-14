import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { handleUnexpectedError, createErrorResponse, ErrorCode } from '@/lib/api-errors';
import { getUserReturnOrigin } from '@/lib/tenant-return-origin';
import {
  CERTIFICATION_PAYMENT_ID_PREFIX,
  CERTIFICATION_PAYMENT_STATUS,
  NRPG_CERTIFICATION_PAYMENT_TYPE,
  getCertificationPriceId,
  hasPaidCertification,
  isCertificationCheckoutConfigured,
  isPaidCertificationSession,
} from '@/lib/training/certification-payment';

export const dynamic = 'force-dynamic';

const NOT_AVAILABLE_MESSAGE = 'Certification checkout is not available yet. Please check back soon.';

/**
 * GET — whether checkout is available and whether this contractor has paid.
 * With ?session_id=, `sessionPaid` is true only if that exact Stripe session is
 * this contractor's own paid certification checkout.
 */
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

    const sessionId = new URL(request.url).searchParams.get('session_id')?.trim();
    return NextResponse.json({
      success: true,
      configured: isCertificationCheckoutConfigured(),
      paid: await hasPaidCertification(user.id),
      sessionPaid: sessionId ? await isPaidCertificationSession(user.id, sessionId) : false,
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
    // Return to the user's own tenant domain (read from the DB) or SITE_URL; never request Host/Origin.
    const origin = await getUserReturnOrigin(user);

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
        id: `${CERTIFICATION_PAYMENT_ID_PREFIX}${randomUUID()}`,
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
