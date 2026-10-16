/**
 * Public Service Requests API
 * POST /api/public/service-requests - Anonymous lead capture
 *
 * For the client onboarding wizard - no auth required.
 * Creates guest user if email doesn't exist.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface PublicServiceRequestBody {
  serviceType: string
  urgency: string
  state: string
  suburb: string
  postcode: string
  propertyType: string
  description: string
  name: string
  email: string
}

// Map wizard service types to schema categories
const SERVICE_TYPE_MAP: Record<string, string> = {
  'water-damage': 'WATER_DAMAGE',
  'fire-damage': 'FIRE_DAMAGE',
  'mould-remediation': 'MOULD_REMEDIATION',
  'storm-damage': 'STORM_DAMAGE',
  'biohazard': 'BIOHAZARD',
  'carpet-cleaning': 'CARPET_CLEANING',
}

export async function POST(request: NextRequest) {
  try {
    const body: PublicServiceRequestBody = await request.json()

    const {
      serviceType,
      urgency,
      state,
      suburb,
      postcode,
      propertyType,
      description,
      name,
      email,
    } = body

    // Validate required fields
    if (!serviceType || !state || !suburb || !postcode || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format. Cap the length first (RFC 5321 max is 254) so the
    // regex below cannot be driven into quadratic backtracking by a huge input.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (typeof email !== 'string' || email.length > 254 || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Find or create guest user
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          userType: 'CLIENT',
          australianState: state as 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'NT' | 'ACT',
          australianPostcode: postcode,
          suburb,
          isEmailVerified: false,
          isActive: true,
        },
      })
    }

    // Map service type
    const serviceCategory = SERVICE_TYPE_MAP[serviceType] || serviceType.toUpperCase()

    // Build location string
    const location = `${suburb}, ${state} ${postcode}`

    // Create service request
    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        userId: user.id,
        serviceCategory,
        urgency: urgency || 'standard',
        serviceTitle: `${serviceCategory.replace(/_/g, ' ')} - ${suburb}`,
        description: description || `${propertyType} property requires ${serviceType.replace(/-/g, ' ')} services.`,
        location,
        status: 'PENDING',
        urgentResponse: urgency === 'emergency',
      },
    })

    // Bridge into the CRM: open an Opportunity from this ServiceRequest so it
    // enters the customer-lifecycle pipeline. Best-effort — never block the
    // response on CRM failure.
    try {
      const { opportunityService } = await import('@/lib/crm/opportunity.service')
      await opportunityService.createFromServiceRequest(serviceRequest.id)
    } catch (crmError) {
      console.error('[service-requests] failed to bridge to CRM:', crmError)
    }

    // TODO: Send confirmation email to client

    return NextResponse.json({
      id: serviceRequest.id,
      status: 'PENDING',
      message: 'Service request submitted successfully',
    })
  } catch (error) {
    console.error('[PUBLIC_SERVICE_REQUEST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create service request' },
      { status: 500 }
    )
  }
}
