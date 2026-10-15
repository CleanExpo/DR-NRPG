// @ts-nocheck

import { getUserReturnOrigin } from '@/lib/tenant-return-origin'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'
import { getTenantDb } from '@/lib/get-tenant-db'
import Stripe from 'stripe'

// Realtime tier pricing
const TIER_PRICING = {
  BASIC: 49,      // +$49/month - Status updates, notifications
  PRO: 99,        // +$99/month - + Live ETA, in-app messaging
  ENTERPRISE: 199 // +$199/month - + GPS tracking, video/voice
}

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
    })
  : null

// Get current subscription
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return authResult.response
    }

    const { user: authUser } = authResult.context
    const db = getTenantDb(authResult.context)

    const user = await db.user.findUnique({
      where: { id: authUser.id },
      include: { contractor: true },
    })

    if (!user?.contractor) {
      return NextResponse.json(
        { error: 'Contractor not found' },
        { status: 403 }
      )
    }

    const subscription = await db.realtimeSubscription.findUnique({
      where: { contractorId: user.contractor.id },
    })

    // Calculate trial days remaining
    let trialDaysRemaining = 0
    if (subscription?.status === 'TRIAL' && subscription.trialEndsAt) {
      const now = new Date()
      const diff = subscription.trialEndsAt.getTime() - now.getTime()
      trialDaysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }

    return NextResponse.json({
      subscription,
      pricing: TIER_PRICING,
      hasActiveSubscription: subscription?.status === 'ACTIVE' || subscription?.status === 'TRIAL',
      trialDaysRemaining,
      canUpgrade: !!subscription?.stripeSubscriptionId,
    })
  } catch (error) {
    console.error('Error fetching realtime subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

// Subscribe to realtime tier - redirects to Stripe checkout
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return authResult.response
    }

    const { user: authUser } = authResult.context
    const db = getTenantDb(authResult.context)

    const body = await request.json()
    const { tier, action } = body as {
      tier?: 'BASIC' | 'PRO' | 'ENTERPRISE'
      action?: 'upgrade' | 'portal'
    }

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
        { error: 'Contractor not found' },
        { status: 403 }
      )
    }

    const existing = user.contractor.realtimeSubscription

    // If requesting billing portal access
    if (action === 'portal') {
      if (!stripe || !user.stripeCustomerId) {
        return NextResponse.json(
          { error: 'No billing account found' },
          { status: 400 }
        )
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${await getUserReturnOrigin(authUser)}/dashboard/contractor/realtime/pricing`,
      })

      return NextResponse.json({ portalUrl: portalSession.url })
    }

    // Validate tier for subscription actions
    if (!tier || !TIER_PRICING[tier]) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      )
    }

    // If has active Stripe subscription, redirect to portal for tier changes
    if (existing?.stripeSubscriptionId) {
      if (!stripe || !user.stripeCustomerId) {
        return NextResponse.json(
          { error: 'Stripe not configured' },
          { status: 500 }
        )
      }

      // Create portal session for subscription management
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${await getUserReturnOrigin(authUser)}/dashboard/contractor/realtime/pricing`,
      })

      return NextResponse.json({
        redirectToPortal: true,
        portalUrl: portalSession.url,
        message: 'Please manage your subscription through the billing portal',
      })
    }

    // For new subscriptions, redirect to checkout API
    // This allows the checkout route to handle customer creation and trial logic
    return NextResponse.json({
      redirectToCheckout: true,
      checkoutUrl: `/api/realtime/billing/checkout`,
      tier,
      message: 'Please complete checkout to start your subscription',
    })
  } catch (error) {
    console.error('Error processing subscription request:', error)
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    )
  }
}

// Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return authResult.response
    }

    const { user: authUser } = authResult.context
    const db = getTenantDb(authResult.context)

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
        { error: 'Contractor not found' },
        { status: 403 }
      )
    }

    const subscription = user.contractor.realtimeSubscription

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    // If has Stripe subscription, cancel via Stripe
    if (subscription.stripeSubscriptionId && stripe) {
      try {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true, // Cancel at end of billing period
        })
      } catch (stripeError) {
        console.error('Error cancelling Stripe subscription:', stripeError)
        // Continue to update local record even if Stripe fails
      }
    }

    // Update local subscription status
    const updated = await db.realtimeSubscription.update({
      where: { contractorId: user.contractor.id },
      data: {
        status: 'CANCELLED',
        endDate: new Date(),
      },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'REALTIME_SUBSCRIPTION_CANCELLED',
        entityType: 'RealtimeSubscription',
        entityId: user.contractor.id,
        userId: user.id,
        oldValues: {
          tier: subscription.tier,
          status: subscription.status,
        },
        newValues: {
          status: 'CANCELLED',
        },
      },
    })

    return NextResponse.json({
      subscription: updated,
      message: 'Subscription cancelled. Access continues until end of billing period.',
    })
  } catch (error) {
    console.error('Error cancelling realtime subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
