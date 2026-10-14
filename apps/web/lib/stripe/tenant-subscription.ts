/**
 * Stripe Tenant Subscription Management
 *
 * Handles tenant-level billing for multi-tenant SaaS.
 * Separate from contractor workspace subscriptions.
 */

import { SITE_URL } from '@/lib/seo/site-url';
import Stripe from 'stripe';

// Initialize Stripe (requires STRIPE_SECRET_KEY in .env)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
    })
  : null;

// Tenant subscription tier price IDs (create these in Stripe Dashboard)
export const TENANT_PRICE_IDS = {
  BASIC: process.env.STRIPE_TENANT_BASIC_PRICE_ID || 'price_tenant_basic_monthly',
  PRO: process.env.STRIPE_TENANT_PRO_PRICE_ID || 'price_tenant_pro_monthly',
  ENTERPRISE: process.env.STRIPE_TENANT_ENTERPRISE_PRICE_ID || 'price_tenant_enterprise_monthly',
};

export interface CreateTenantCheckoutParams {
  /** Trusted return origin (getUserReturnOrigin); defaults to SITE_URL for platform flows such as signup. */
  returnOrigin?: string;
  tenantId: string;
  tenantName: string;
  adminEmail: string;
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
}

/**
 * Create a Stripe checkout session for tenant subscription
 */
export async function createTenantCheckoutSession(params: CreateTenantCheckoutParams) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const { tenantId, tenantName, adminEmail, tier, returnOrigin = SITE_URL } = params;

  try {
    // Create or retrieve customer
    const customer = await getOrCreateTenantCustomer(tenantId, tenantName, adminEmail);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: TENANT_PRICE_IDS[tier],
          quantity: 1,
        },
      ],
      metadata: {
        tenantId,
        tier,
        type: 'tenant_subscription',
      },
      success_url: `${returnOrigin}/dashboard/admin/tenant-billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${returnOrigin}/dashboard/admin/tenant-billing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {
        metadata: {
          tenantId,
          tier,
          type: 'tenant_subscription',
        },
        trial_period_days: 14, // 14-day free trial for new tenants
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
      customerId: customer.id,
    };
  } catch (error) {
    console.error('[Tenant Subscription] Checkout session creation error:', error);
    throw new Error('Failed to create tenant checkout session');
  }
}

/**
 * Get or create Stripe customer for tenant
 * Uses idempotency to prevent duplicate customer creation
 */
export async function getOrCreateTenantCustomer(
  tenantId: string,
  tenantName: string,
  adminEmail: string
): Promise<Stripe.Customer> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    // First, search by tenant ID in metadata
    const existingCustomers = await stripe.customers.search({
      query: `metadata['tenantId']:'${tenantId}'`,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer with idempotency key
    const customer = await stripe.customers.create(
      {
        email: adminEmail,
        name: tenantName,
        description: `Tenant: ${tenantName}`,
        metadata: {
          tenantId,
          type: 'tenant',
          source: 'nrpg_multitenant',
        },
      },
      {
        idempotencyKey: `tenant_customer_${tenantId}`,
      }
    );

    return customer;
  } catch (error) {
    console.error('[Tenant Subscription] Customer creation error:', error);
    throw new Error('Failed to create tenant customer');
  }
}

/**
 * Create Stripe portal session for managing tenant subscription
 */
export async function createTenantPortalSession(customerId: string, tenantId: string, returnOrigin: string = SITE_URL) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${returnOrigin}/dashboard/admin/tenant-billing`,
    });

    return {
      url: session.url,
    };
  } catch (error) {
    console.error('[Tenant Subscription] Portal session creation error:', error);
    throw new Error('Failed to create tenant portal session');
  }
}

/**
 * Cancel a tenant subscription
 */
export async function cancelTenantSubscription(subscriptionId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    // Cancel at period end to allow access until billing cycle completes
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return subscription;
  } catch (error) {
    console.error('[Tenant Subscription] Cancellation error:', error);
    throw new Error('Failed to cancel tenant subscription');
  }
}

/**
 * Immediately cancel a tenant subscription (no grace period)
 */
export async function cancelTenantSubscriptionImmediately(subscriptionId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('[Tenant Subscription] Immediate cancellation error:', error);
    throw new Error('Failed to immediately cancel tenant subscription');
  }
}

/**
 * Update tenant subscription tier
 */
export async function updateTenantSubscriptionTier(
  subscriptionId: string,
  newTier: 'BASIC' | 'PRO' | 'ENTERPRISE'
) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription.items.data[0]) {
      throw new Error('No subscription items found');
    }

    // Update subscription with new price
    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: TENANT_PRICE_IDS[newTier],
        },
      ],
      proration_behavior: 'always_invoice',
      metadata: {
        ...subscription.metadata,
        tier: newTier,
      },
    });

    return updated;
  } catch (error) {
    console.error('[Tenant Subscription] Tier update error:', error);
    throw new Error('Failed to update tenant subscription tier');
  }
}

/**
 * Get tenant subscription details
 */
export async function getTenantSubscription(subscriptionId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['customer', 'default_payment_method'],
    });
    return subscription;
  } catch (error) {
    console.error('[Tenant Subscription] Retrieval error:', error);
    throw new Error('Failed to retrieve tenant subscription');
  }
}

/**
 * Reactivate a canceled subscription (before period end)
 */
export async function reactivateTenantSubscription(subscriptionId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    return subscription;
  } catch (error) {
    console.error('[Tenant Subscription] Reactivation error:', error);
    throw new Error('Failed to reactivate tenant subscription');
  }
}

/**
 * Get usage-based billing data for a tenant
 * (For future implementation of usage-based pricing)
 */
export async function getTenantUsageData(tenantId: string, startDate: Date, endDate: Date) {
  // TODO: Implement usage tracking for:
  // - Number of active users
  // - Number of service requests
  // - API calls
  // - Storage usage
  // This will be used for usage-based billing in ENTERPRISE tier

  return {
    tenantId,
    period: { start: startDate, end: endDate },
    metrics: {
      activeUsers: 0,
      serviceRequests: 0,
      apiCalls: 0,
      storageGB: 0,
    },
  };
}
