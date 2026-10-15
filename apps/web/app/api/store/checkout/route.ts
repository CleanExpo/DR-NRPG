/**
 * POST /api/store/checkout
 *
 * Validates cart items against the local catalogue, then creates a Stripe
 * Checkout Session. Returns the Stripe-hosted checkout URL so the frontend
 * can redirect the customer. The Printful fulfilment order is created only
 * AFTER payment is captured (checkout.session.completed webhook).
 *
 * Previously this route called Printful directly without taking payment,
 * meaning orders were fulfilled for free. DR-219 fixes that critical bug.
 */

import { SITE_URL } from '@/lib/seo/site-url'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import stripe from '@/lib/stripe'
import { getProductById, type StoreProduct } from '@/lib/printful/products'

export const dynamic = 'force-dynamic'

// Product images and Stripe redirects use the canonical site, never env or request host.
const BASE_URL = SITE_URL

// ---------------------------------------------------------------------------
// Request / Response shapes
// ---------------------------------------------------------------------------

interface CheckoutItem {
  productId: string
  variantId: string
  quantity: number
}

interface CheckoutRecipient {
  name: string
  address: string
  address2?: string
  city: string
  state: string
  postcode: string
  country: 'AU'
  email?: string
}

interface CheckoutRequest {
  items: CheckoutItem[]
  recipient: CheckoutRecipient
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validatePayload(body: unknown): { data?: CheckoutRequest; error?: string } {
  const req = body as CheckoutRequest

  if (!req.items || !Array.isArray(req.items) || req.items.length === 0) {
    return { error: 'items must be a non-empty array' }
  }

  for (const item of req.items) {
    if (!item.productId || !item.variantId || !item.quantity) {
      return { error: 'Each item requires productId, variantId, and quantity' }
    }
    if (item.quantity < 1 || item.quantity > 50) {
      return { error: 'Quantity must be between 1 and 50' }
    }
  }

  const r = req.recipient
  if (!r || !r.name || !r.address || !r.city || !r.state || !r.postcode) {
    return { error: 'Recipient must include name, address, city, state, and postcode' }
  }

  if (r.country !== 'AU') {
    return { error: 'Only Australian delivery addresses are currently supported' }
  }

  return { data: req }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Payment processing is not configured. Contact support@disasterrecovery.com.au' },
      { status: 503 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { data, error } = validatePayload(body)
  if (error || !data) {
    return NextResponse.json({ error }, { status: 400 })
  }

  // Resolve products and calculate totals in parallel (Von Neumann: no blocking serial loop)
  type ResolvedItem = {
    product: StoreProduct
    variantId: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }

  const resolvedOrErrors = await Promise.all(
    data.items.map(async (item): Promise<ResolvedItem | NextResponse> => {
      const product = getProductById(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        )
      }

      const variant = product.variants.find((v) => v.id === item.variantId)
      if (!variant) {
        return NextResponse.json(
          { error: `Variant "${item.variantId}" not found for product "${product.name}"` },
          { status: 400 }
        )
      }

      if (!variant.inStock) {
        return NextResponse.json(
          { error: `Variant "${variant.name}" of "${product.name}" is currently out of stock` },
          { status: 400 }
        )
      }

      const unitPrice = product.basePrice + variant.priceAdjustment
      return {
        product,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      }
    })
  )

  // Surface the first validation error, if any
  const firstError = resolvedOrErrors.find((r): r is NextResponse => r instanceof NextResponse)
  if (firstError) return firstError

  const resolvedItems = resolvedOrErrors as ResolvedItem[]
  const externalId = `NRPG-${Date.now()}`

  // Build Stripe line items (amounts in cents, AUD)
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = resolvedItems.map((i) => ({
    quantity: i.quantity,
    price_data: {
      currency: 'aud',
      unit_amount: Math.round(i.unitPrice * 100),
      product_data: {
        name: `${i.product.name} (${i.variantId})`,
        description: i.product.description.slice(0, 500),
        images: i.product.mockupImage ? [`${BASE_URL}${i.product.mockupImage}`] : [],
      },
    },
  }))

  // Serialise order details into metadata so the webhook can fulfil after
  // payment. Stripe metadata values are capped at 500 chars — keep compact.
  const itemsJson = JSON.stringify(
    resolvedItems.map((i) => ({ pid: i.product.id, vid: i.variantId, qty: i.quantity }))
  )
  const recipientJson = JSON.stringify(data.recipient)

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: data.recipient.email,
      success_url: `${BASE_URL}/store/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/store/cart`,
      metadata: {
        type: 'NRPG_STORE_ORDER',
        externalId,
        itemsJson,
        recipientJson,
      },
    })

    return NextResponse.json({ url: session.url, externalId })
  } catch (err) {
    console.error('[store:checkout] Stripe session creation failed:', err)
    return NextResponse.json(
      { error: 'Failed to initiate payment. Please try again or contact support@disasterrecovery.com.au' },
      { status: 502 }
    )
  }
}
