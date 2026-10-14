// @ts-nocheck

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { handleUnexpectedError, handleValidationError } from '@/lib/api-errors';
import { getTierConfig } from '@/lib/services/subscription-tier.service';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { z, ZodError } from 'zod';
import { SITE_URL } from '@/lib/seo/site-url';

/** Client-supplied return URLs are honoured only on the canonical site (no open redirect). */
function onSite(url: string | undefined): string | undefined {
  return url && url.startsWith(`${SITE_URL}/`) ? url : undefined;
}

export const dynamic = 'force-dynamic';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null;

const checkoutSchema = z.object({
  workspaceId: z.string().cuid(),
  tier: z.enum(['BASIC', 'PRO', 'ENTERPRISE']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

/**
 * POST /api/subscription/checkout
 *
 * Create Stripe checkout session for workspace subscription
 * - Creates Stripe customer if doesn't exist
 * - Creates subscription checkout session
 * - Returns checkout URL for redirect
 *
 * Strategic decision: Upfront monthly billing (SaaS standard)
 */
export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    // Authenticate
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;

    // Check role
    if (!requireRole(user, ['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN'])) {
      return unauthorizedRoleResponse(['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN']);
    }

    // Parse and validate
    const body = await request.json();
    const validated = checkoutSchema.parse(body);

    // Get workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: validated.workspaceId },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Verify user is workspace owner
    if (workspace.ownerId !== user.id) {
      return NextResponse.json({ error: 'Only workspace owner can manage subscription' }, { status: 403 });
    }

    // Get tier configuration
    const tierConfig = getTierConfig(validated.tier);

    // Create or get Stripe customer
    let stripeCustomerId = workspace.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: workspace.businessName,
        metadata: {
          workspaceId: workspace.id,
          userId: user.id,
        },
      });

      stripeCustomerId = customer.id;

      // Update workspace with customer ID
      await prisma.workspace.update({
        where: { id: workspace.id },
        data: { stripeCustomerId },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: `NRPG ${tierConfig.name} Tier`,
              description: `${tierConfig.name} subscription - ${tierConfig.seatLimit === 999 ? 'Unlimited' : tierConfig.seatLimit} seats, ${tierConfig.monthlyJobLimit === 999 ? 'Unlimited' : tierConfig.monthlyJobLimit} jobs/month`,
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: tierConfig.monthlyPrice * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      success_url: onSite(validated.successUrl) || `${SITE_URL}/dashboard/contractor?subscription=success`,
      cancel_url: onSite(validated.cancelUrl) || `${SITE_URL}/dashboard/contractor?subscription=cancelled`,
      metadata: {
        workspaceId: workspace.id,
        tier: validated.tier,
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error);
    }
    return handleUnexpectedError(error);
  }
}
