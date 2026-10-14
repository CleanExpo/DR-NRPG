// @ts-nocheck

import { getUserReturnOrigin } from '@/lib/tenant-return-origin'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'
import { getTenantDb } from '@/lib/get-tenant-db'
import Stripe from 'stripe'

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
    })
  : null

// Realtime tier price IDs (configure in Stripe Dashboard)
const REALTIME_PRICE_IDS = {
  BASIC: process.env.STRIPE_REALTIME_BASIC_PRICE_ID || 'price_realtime_basic',
  PRO: process.env.STRIPE_REALTIME_PRO_PRICE_ID || 'price_realtime_pro',
  ENTERPRISE: process.env.STRIPE_REALTIME_ENTERPRISE_PRICE_ID || 'price_realtime_enterprise',
}

const TIER_PRICING = {
  BASIC: 49,
  PRO: 99,
  ENTERPRISE: 199,
}

// POST - Create Stripe checkout session for realtime tier subscription
export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return authResult.response
    }

    const { user: authUser } = authResult.context
    const db = getTenantDb(authResult.context)

    const body = await request.json()
    const { tier } = body as { tier: 'BASIC' | 'PRO' | 'ENTERPRISE' }

    if (!tier || !REALTIME_PRICE_IDS[tier]) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be BASIC, PRO, or ENTERPRISE' },
        { status: 400 }
      )
    }

    // Get user with contractor profile
    const user = await db.user.findUnique({
      where: { id: authUser.id },
      include: {
        contractor: {
          include: {
            realtimeSubscription: true,
          },
        },
      },
    })

    if (!user?.contractor) {
      return NextResponse.json(
        { error: 'Contractor profile not found' },
        { status: 403 }
      )
    }

    // Check if already has an active Stripe subscription
    if (user.contractor.realtimeSubscription?.stripeSubscriptionId) {
      // Redirect to portal for tier changes instead of new checkout
      return NextResponse.json(
        {
          error: 'Active subscription exists. Use billing portal to change tier.',
          redirectToPortal: true,
        },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    let customerId: string

    // Check if user has existing Stripe customer ID
    const existingCustomer = await db.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    })

    if (existingCustomer?.stripeCustomerId) {
      customerId = existingCustomer.stripeCustomerId
    } else {
      // Search for existing customer by email
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      })

      if (customers.data.length > 0) {
        customerId = customers.data[0].id
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name || undefined,
          metadata: {
            userId: user.id,
            contractorId: user.contractor.id,
            source: 'realtime_addon_signup',
          },
        })
        customerId = customer.id
      }

      // Store customer ID for future use
      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // Determine if this is a new subscription (eligible for trial)
    const isNewSubscription = !user.contractor.realtimeSubscription
    const trialDays = isNewSubscription ? 90 : 0 // 90-day trial for new subscribers

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: REALTIME_PRICE_IDS[tier],
          quantity: 1,
        },
      ],
      metadata: {
        contractorId: user.contractor.id,
        tier,
        subscriptionType: 'realtime_addon',
      },
      subscription_data: {
        trial_period_days: trialDays,
        metadata: {
          contractorId: user.contractor.id,
          tier,
          subscriptionType: 'realtime_addon',
        },
      },
      success_url: `${await getUserReturnOrigin(authUser)}/dashboard/contractor/realtime/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${await getUserReturnOrigin(authUser)}/dashboard/contractor/realtime/pricing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    })

    // Create or update pending subscription record
    if (user.contractor.realtimeSubscription) {
      await db.realtimeSubscription.update({
        where: { contractorId: user.contractor.id },
        data: {
          tier,
          pricePerMonth: TIER_PRICING[tier],
          // Keep status as is until webhook confirms
        },
      })
    } else {
      await db.realtimeSubscription.create({
        data: {
          contractorId: user.contractor.id,
          tier,
          pricePerMonth: TIER_PRICING[tier],
          status: 'TRIAL', // Will be confirmed by webhook
          trialEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
      })
    }

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('Error creating realtime checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
