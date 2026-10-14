import { getUserReturnOrigin } from '@/lib/tenant-return-origin';
import { NextRequest, NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/get-tenant-db';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { createAccountLink, createConnectedAccount } from '@/lib/stripe';
import { handleUnexpectedError, createErrorResponse, ErrorCode } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;

    if (!requireRole(user, ['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN'])) {
      return unauthorizedRoleResponse(['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN']);
    }

    const db = getTenantDb(authResult.context);

    // Return to the user's own tenant domain (read from the DB) or SITE_URL; never request Host/Origin.
    const origin = await getUserReturnOrigin(user);
    const returnUrl = `${origin}/dashboard/contractor/onboarding/payouts?stripe=return`;
    const refreshUrl = `${origin}/dashboard/contractor/onboarding/payouts?stripe=refresh`;

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true },
    });

    if (!dbUser?.email) {
      return createErrorResponse(ErrorCode.INVALID_INPUT, 'User email is required for Stripe Connect', 400);
    }

    let contractorProfile = await db.contractorProfile.findUnique({
      where: { userId: user.id },
    });

    if (!contractorProfile) {
      contractorProfile = await db.contractorProfile.create({
        data: {
          userId: user.id,
          services: [],
          serviceAreas: [],
        },
      });
    }

    let connectAccountId = contractorProfile.stripeConnectAccountId ?? undefined;

    if (!connectAccountId) {
      const account = await createConnectedAccount({
        email: dbUser.email,
        businessType: 'company',
        country: 'AU',
      });

      // DR-897: atomic claim — only persist our account if no concurrent
      // request claimed one since our read. Guards double-click/retry races
      // that would otherwise mint duplicate connected accounts.
      const claimed = await db.contractorProfile.updateMany({
        where: { id: contractorProfile.id, stripeConnectAccountId: null },
        data: { stripeConnectAccountId: account.id },
      });

      if (claimed.count === 1) {
        connectAccountId = account.id;
      } else {
        // A concurrent request won the claim — reuse its account and discard
        // ours (never activated, inert on Stripe).
        const winner = await db.contractorProfile.findUnique({
          where: { id: contractorProfile.id },
          select: { stripeConnectAccountId: true },
        });
        if (!winner?.stripeConnectAccountId) {
          return createErrorResponse(
            ErrorCode.INTERNAL_ERROR,
            'Failed to persist Stripe Connect account',
            500
          );
        }
        connectAccountId = winner.stripeConnectAccountId;
        console.warn(
          `[Connect Onboard] Discarded duplicate connected account ${account.id} for profile ${contractorProfile.id}; reusing ${connectAccountId}`
        );
      }
    }

    const link = await createAccountLink(connectAccountId, returnUrl, refreshUrl);

    return NextResponse.json({
      success: true,
      url: link.url,
      accountId: connectAccountId,
    });
  } catch (error) {
    return handleUnexpectedError(error);
  }
}
