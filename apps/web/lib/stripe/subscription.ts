/**
 * Stripe Subscription Management
 *
 * Handles NRPG contractor subscription creation and management
 */

import { SITE_URL } from '@/lib/seo/site-url';
import Stripe from 'stripe';

// Initialize Stripe (requires STRIPE_SECRET_KEY in .env)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
    })
  : null;

// Subscription tier price IDs (create these in Stripe Dashboard)
export const SUBSCRIPTION_PRICE_IDS = {
  basic: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic_monthly',
  pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
};

export interface CreateSubscriptionParams {
  contractorId: string;
  email: string;
  businessName: string;
  tier: 'basic' | 'pro' | 'enterprise';
}

/**
 * Create a Stripe checkout session for contractor subscription
 */
export async function createCheckoutSession(params: CreateSubscriptionParams) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const { contractorId, email, businessName, tier } = params;

  try {
    // Create or retrieve customer
    const customer = await getOrCreateCustomer(email, businessName);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: SUBSCRIPTION_PRICE_IDS[tier],
          quantity: 1,
        },
      ],
      metadata: {
        contractorId,
        tier,
      },
      success_url: `${SITE_URL}/dashboard/contractor?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${SITE_URL}/join?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {
        metadata: {
          contractorId,
          tier,
        },
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Get or create Stripe customer
 */
async function getOrCreateCustomer(email: string, businessName: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  // Search for existing customer
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  // Create new customer
  return await stripe.customers.create({
    email,
    name: businessName,
    metadata: {
      source: 'nrpg_contractor_signup',
    },
  });
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    throw new Error('Failed to cancel subscription');
  }
}

/**
 * Update subscription tier
 */
export async function updateSubscriptionTier(
  subscriptionId: string,
  newTier: 'basic' | 'pro' | 'enterprise'
) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update subscription with new price
    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: SUBSCRIPTION_PRICE_IDS[newTier],
        },
      ],
      proration_behavior: 'always_invoice',
      metadata: {
        tier: newTier,
      },
    });

    return updated;
  } catch (error) {
    console.error('Subscription update error:', error);
    throw new Error('Failed to update subscription');
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Subscription retrieval error:', error);
    throw new Error('Failed to retrieve subscription');
  }
}

/**
 * Create Stripe portal session for managing subscription
 */
export async function createPortalSession(customerId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${SITE_URL}/dashboard/contractor/preferences`,
    });

    return {
      url: session.url,
    };
  } catch (error) {
    console.error('Portal session creation error:', error);
    throw new Error('Failed to create portal session');
  }
}
