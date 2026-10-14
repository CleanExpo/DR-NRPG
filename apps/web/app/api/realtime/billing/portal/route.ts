// @ts-nocheck

import { SITE_URL } from '@/lib/seo/site-url'
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

// POST - Create Stripe billing portal session
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

    // Get user with contractor and subscription
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

    // Must have a Stripe customer ID
    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe first.' },
        { status: 400 }
      )
    }

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${SITE_URL}/dashboard/contractor/realtime/pricing`,
    })

    // Log portal access for audit
    await db.auditLog.create({
      data: {
        action: 'REALTIME_BILLING_PORTAL_ACCESSED',
        entityType: 'RealtimeSubscription',
        entityId: user.contractor.id,
        userId: user.id,
        metadata: {
          subscriptionTier: user.contractor.realtimeSubscription?.tier,
          subscriptionStatus: user.contractor.realtimeSubscription?.status,
        },
      },
    })

    return NextResponse.json({
      portalUrl: portalSession.url,
    })
  } catch (error) {
    console.error('Error creating billing portal session:', error)
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
}
