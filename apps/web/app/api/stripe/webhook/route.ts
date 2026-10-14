// @ts-nocheck

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import stripe, { constructWebhookEvent } from '@/lib/stripe';
import { getNrpgCalloutSplit } from '@/lib/pricing/nrpg-callout';
import { isEventProcessed, recordWebhookEvent } from '@/src/lib/stripe/webhook-idempotency';
import { retryPrismaOperation } from '@/src/lib/stripe/webhook-retry';
import { createPrintfulOrder } from '@/lib/printful/sync';
import { getProductById } from '@/lib/printful/products';
import {
  CERTIFICATION_PAYMENT_STATUS,
  NRPG_CERTIFICATION_PAYMENT_TYPE,
  getCertificationPriceId,
} from '@/lib/training/certification-payment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  const normalised = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalised)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalised)) return false;
  return defaultValue;
}

function getCalloutGstOptionsFromEnv() {
  return {
    totalGstInclusive: parseBooleanEnv(process.env.NRPG_CALLOUT_TOTAL_GST_INCLUSIVE, true),
    platformFeeGstInclusive: parseBooleanEnv(process.env.NRPG_CALLOUT_PLATFORM_FEE_GST_INCLUSIVE, true),
    contractorEntitlementGstInclusive: parseBooleanEnv(process.env.NRPG_CALLOUT_CONTRACTOR_ENTITLEMENT_GST_INCLUSIVE, true),
  };
}

/**
 * Fulfil a store order after payment is confirmed.
 * Creates the Printful production order from the metadata serialised in
 * the Checkout Session by /api/store/checkout. Only runs once payment is
 * captured, so orders are never fulfilled for free (DR-219).
 */
async function fulfillStoreOrder(session: Stripe.Checkout.Session): Promise<void> {
  const meta = session.metadata ?? {};
  const { externalId, itemsJson, recipientJson } = meta;

  if (!externalId || !itemsJson || !recipientJson) {
    console.error('[store:webhook] Missing metadata on store order session', session.id);
    return;
  }

  let items: Array<{ pid: string; vid: string; qty: number }>;
  let recipient: {
    name: string; address: string; address2?: string;
    city: string; state: string; postcode: string; country: 'AU'; email?: string;
  };

  try {
    items = JSON.parse(itemsJson);
    recipient = JSON.parse(recipientJson);
  } catch {
    console.error('[store:webhook] Failed to parse store order metadata', session.id);
    return;
  }

  // Only items mapped to a Printful catalogue product can be auto-fulfilled.
  // Items without a printfulProductId (e.g. bundles, certification packs,
  // lanyard, hard hat) are still PAID for but require manual fulfilment, so
  // route them to a warning rather than letting them break the Printful order.
  const printfulItems: Array<{ external_variant_id: string; quantity: number }> = [];
  const manualItems: string[] = [];
  for (const i of items) {
    const product = getProductById(i.pid);
    if (product?.printfulProductId) {
      printfulItems.push({ external_variant_id: `${i.pid}-${i.vid}`, quantity: i.qty });
    } else {
      manualItems.push(`${i.pid}/${i.vid} x${i.qty}`);
    }
  }

  if (manualItems.length > 0) {
    console.warn(
      `[store:webhook] Order ${externalId} contains ${manualItems.length} item(s) without a Printful mapping — MANUAL FULFILMENT REQUIRED: ${manualItems.join(', ')}`
    );
  }

  if (printfulItems.length === 0) {
    console.info(
      `[store:webhook] Order ${externalId} has no Printful-fulfillable items; skipping Printful order (manual fulfilment only).`
    );
    return;
  }

  try {
    await createPrintfulOrder({
      externalId,
      recipient: {
        name: recipient.name,
        address1: recipient.address,
        address2: recipient.address2,
        city: recipient.city,
        state_code: recipient.state,
        country_code: recipient.country,
        zip: recipient.postcode,
        email: recipient.email,
      },
      items: printfulItems,
      confirm: true, // Confirm immediately — payment is already captured
    });

    console.info('[store:webhook] Printful order created for', externalId);
  } catch (err) {
    console.error('[store:webhook] Printful order creation failed for', externalId, err);
    // Do not rethrow — let the idempotency layer record success so Stripe
    // does not retry. A failed fulfilment needs manual intervention.
  }
}

async function markCalloutPaidBySession(session: Stripe.Checkout.Session): Promise<void> {
  const metadata = session.metadata ?? {};
  if (metadata.type !== 'NRPG_CALLOUT') return;

  const serviceRequestId = metadata.serviceRequestId;
  const clientId = metadata.clientId;

  if (!serviceRequestId || !clientId) return;

  // Retry with exponential backoff for database queries
  const serviceRequest = await retryPrismaOperation(
    'databaseQuery',
    () =>
      prisma.serviceRequest.findUnique({
        where: { id: serviceRequestId },
        select: { userId: true },
      }),
    `find service request ${serviceRequestId}`
  );

  if (!serviceRequest || serviceRequest.userId !== clientId) return;

  const split = getNrpgCalloutSplit(getCalloutGstOptionsFromEnv());

  // Retry critical payment operation with more aggressive retry strategy
  await retryPrismaOperation(
    'criticalPayment',
    () =>
      prisma.serviceRequestCalloutPayment.upsert({
        where: { serviceRequestId },
        create: {
          serviceRequestId,
          clientId,
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
          status: 'PAID',
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        },
        update: {
          status: 'PAID',
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
        },
      }),
    `upsert callout payment for session ${session.id}`
  );
}

/**
 * Wave 1: a paid NRPG certification Checkout session marks the contractor's
 * pending OnboardingPayment row paid, which unlocks the training modules
 * (lib/training/certification-payment.ts). Only sessions this app created are
 * honoured: the pending row (keyed by stripeSessionId) must exist for the same
 * contractor as metadata and client_reference_id, with matching amount and
 * currency, and the single line item must be the configured certification
 * price. Anything else is ignored and logged by session id only (no PII).
 * Replays of an already-paid session are no-ops.
 */
async function markCertificationPaidBySession(session: Stripe.Checkout.Session): Promise<void> {
  const ignore = (reason: string) =>
    console.warn('[certification:webhook] ignored session', session.id, reason);

  const contractorId = session.metadata?.contractorId;
  if (!contractorId || session.client_reference_id !== contractorId) return ignore('contractor mismatch');
  if (session.mode !== 'payment' || session.payment_status !== 'paid') return ignore('not a paid payment session');

  const pending = await retryPrismaOperation(
    'databaseQuery',
    () =>
      prisma.onboardingPayment.findFirst({
        where: { stripeSessionId: session.id },
        select: { id: true, contractorId: true, status: true, amount: true, currency: true },
      }),
    `find certification payment for session ${session.id}`
  );
  if (!pending) return ignore('unknown session');
  if (pending.contractorId !== contractorId) return ignore('contractor mismatch');
  if (pending.status === CERTIFICATION_PAYMENT_STATUS.PAID) return;
  if (pending.amount !== session.amount_total || pending.currency !== session.currency) {
    return ignore('amount mismatch');
  }

  const expectedPriceId = getCertificationPriceId();
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 10 });
  const priceIds = lineItems.data.map((item) => item.price?.id);
  if (!expectedPriceId || priceIds.length !== 1 || priceIds[0] !== expectedPriceId) {
    return ignore('price mismatch');
  }

  await retryPrismaOperation(
    'criticalPayment',
    () =>
      prisma.onboardingPayment.updateMany({
        where: { id: pending.id, status: { not: CERTIFICATION_PAYMENT_STATUS.PAID } },
        data: {
          status: CERTIFICATION_PAYMENT_STATUS.PAID,
          paidAt: new Date(),
          stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          updatedAt: new Date(),
        },
      }),
    `mark certification paid for session ${session.id}`
  );
}

async function markCalloutPaidByPaymentIntent(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  await retryPrismaOperation(
    'criticalPayment',
    () =>
      prisma.serviceRequestCalloutPayment.updateMany({
        where: {
          stripePaymentIntentId: paymentIntent.id,
          status: { in: ['CREATED', 'CHECKOUT_CREATED'] },
        },
        data: {
          status: 'PAID',
        },
      }),
    `update payment status for intent ${paymentIntent.id}`
  );
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(payload, signature, webhookSecret) as Stripe.Event;
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid signature', message: error instanceof Error ? error.message : 'Invalid signature' },
      { status: 400 }
    );
  }

  // Check if this event has already been processed (idempotency)
  try {
    const alreadyProcessed = await isEventProcessed(event.id);
    if (alreadyProcessed) {
      console.info(`Webhook event ${event.id} already processed, skipping`);
      return NextResponse.json({ received: true });
    }
  } catch (error) {
    console.error('Error checking webhook event idempotency:', error);
    // Don't block the response, but let Stripe know we had trouble
    // Stripe will retry on the next attempt
    return NextResponse.json(
      { error: 'Idempotency check failed', message: error instanceof Error ? error.message : 'Idempotency check failed' },
      { status: 503 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.type === 'NRPG_STORE_ORDER') {
          await fulfillStoreOrder(session);
        } else if (session.metadata?.type === NRPG_CERTIFICATION_PAYMENT_TYPE) {
          await markCertificationPaidBySession(session);
        } else {
          await markCalloutPaidBySession(session);
        }
        break;
      }
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.type === NRPG_CERTIFICATION_PAYMENT_TYPE) {
          await markCertificationPaidBySession(session);
        }
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await markCalloutPaidByPaymentIntent(paymentIntent);
        break;
      }
      default:
        // Unknown event type - still record it
        break;
    }

    // Record successful processing
    await recordWebhookEvent(event.id, event.type, 200);
  } catch (error) {
    // Record failed processing
    const errorMessage = error instanceof Error ? error.message : 'Webhook handler error';
    await recordWebhookEvent(event.id, event.type, 500, errorMessage);

    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler error', message: errorMessage },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
