import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { handleUnexpectedError, handleValidationError } from '@/lib/api-errors';
import { completePhase } from '@/lib/services/client-onboarding.service';
import { sendPhaseCompletionEmail } from '@/lib/services/client-email.service';
import { paymentSetupSchema } from '@/lib/validations/client-onboarding';
import { getTenantDb } from '@/lib/get-tenant-db';
import Stripe from 'stripe';
import { ZodError } from 'zod';
import { getUserReturnOrigin } from '@/lib/tenant-return-origin';

export const dynamic = 'force-dynamic';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion })
  : null;

/**
 * POST /api/client/onboarding/payment
 *
 * Save Phase 5: Payment method (OPTIONAL)
 * Creates Stripe customer and attaches payment method
 * Stores card metadata for expiry tracking
 * Completes payment phase
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;
    
    // Get tenant-scoped database client
    const db = getTenantDb(authResult.context);

    if (!requireRole(user, ['CLIENT', 'ADMIN', 'SUPER_ADMIN'])) {
      return unauthorizedRoleResponse(['CLIENT', 'ADMIN', 'SUPER_ADMIN']);
    }

    const body = await request.json();
    const validated = paymentSetupSchema.parse(body);

    if (!stripe) {
      return NextResponse.json({ success: false, error: 'Payment processing not configured' }, { status: 500 });
    }

    const profile = await db.clientProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Client profile not found' }, { status: 404 });
    }

    // Create Stripe customer if doesn't exist
    const existingPayment = await db.clientPayment.findUnique({
      where: { clientProfileId: profile.id },
      select: { stripeCustomerId: true },
    });

    let customerId: string;
    if (existingPayment?.stripeCustomerId) {
      customerId = existingPayment.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          clientProfileId: profile.id,
          userId: user.id,
        },
      });
      customerId = customer.id;
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(validated.stripePaymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: validated.stripePaymentMethodId,
      },
    });

    // Get payment method details for metadata
    const paymentMethod = await stripe.paymentMethods.retrieve(validated.stripePaymentMethodId);
    const card = paymentMethod.card;

    // Save payment information
    await db.clientPayment.upsert({
      where: { clientProfileId: profile.id },
      update: {
        stripeCustomerId: customerId,
        stripePaymentMethodId: validated.stripePaymentMethodId,
        cardBrand: card?.brand,
        cardLast4: card?.last4,
        cardExpiryMonth: card?.exp_month,
        cardExpiryYear: card?.exp_year,
        billingAddressSameAs: validated.billingAddressSameAs,
        billingStreet: validated.billingStreet,
        billingSuburb: validated.billingSuburb,
        billingPostcode: validated.billingPostcode,
        billingState: validated.billingState as any,
        autoPayEnabled: validated.autoPayEnabled,
        invoiceDeliveryMethod: validated.invoiceDeliveryMethod,
        taxInvoiceRecipient: validated.taxInvoiceRecipient,
        abnNumber: validated.abnNumber,
      },
      create: {
        clientProfileId: profile.id,
        stripeCustomerId: customerId,
        stripePaymentMethodId: validated.stripePaymentMethodId,
        cardBrand: card?.brand,
        cardLast4: card?.last4,
        cardExpiryMonth: card?.exp_month,
        cardExpiryYear: card?.exp_year,
        billingAddressSameAs: validated.billingAddressSameAs,
        billingStreet: validated.billingStreet,
        billingSuburb: validated.billingSuburb,
        billingPostcode: validated.billingPostcode,
        billingState: validated.billingState as any,
        autoPayEnabled: validated.autoPayEnabled,
        invoiceDeliveryMethod: validated.invoiceDeliveryMethod,
        taxInvoiceRecipient: validated.taxInvoiceRecipient,
        abnNumber: validated.abnNumber,
      },
    });

    // Complete phase
    const result = await completePhase(user.id, 'payment');

    // Send phase completion email
    await sendPhaseCompletionEmail({
      clientName: user.name || 'Valued Client',
      clientEmail: user.email,
      phaseName: 'Payment Setup',
      phaseNumber: 5,
      completionPercentage: result.completionPercentage,
      nextPhaseName: result.nextPhase ? 'Communication Preferences' : undefined,
      nextPhaseUrl: result.nextPhase ? `${await getUserReturnOrigin(user)}/dashboard/client/onboarding/${result.nextPhase}` : undefined,
      estimatedMinutes: 2,
    }).catch((err) => {
      console.error('Failed to send phase completion email:', err);
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      cardLast4: card?.last4,
      nextPhase: result.nextPhase,
      nextPhaseUrl: result.nextPhase ? `/dashboard/client/onboarding/${result.nextPhase}` : '/dashboard/client/onboarding/checklist',
      completionPercentage: result.completionPercentage,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error);
    }
    return handleUnexpectedError(error);
  }
}
