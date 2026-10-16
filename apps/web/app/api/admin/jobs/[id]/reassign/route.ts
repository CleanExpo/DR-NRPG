import { NextRequest, NextResponse } from 'next/server'
import { getTenantDb } from '@/lib/get-tenant-db'
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware'
import { handleUnexpectedError, createErrorResponse, ErrorCode } from '@/lib/api-errors'
import { isDispatchEligible } from '@/lib/services/dispatch-eligibility'
import { DISPATCH_INELIGIBLE_ERROR } from '@/lib/services/dispatch-eligibility-error'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { RealtimeJobEvent } from '@/lib/supabase/types'
import { logClaimAction } from '@/lib/services/audit.service'

export const dynamic = 'force-dynamic'

// Lazy initialization for Supabase
let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error('Supabase configuration missing')
    }
    supabase = createClient(url, key)
  }
  return supabase
}

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - Reassign job to different contractor
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) return authResult.response
    const { user } = authResult.context

    if (!requireRole(user, ['ADMIN', 'SUPER_ADMIN'])) {
      return unauthorizedRoleResponse(['ADMIN', 'SUPER_ADMIN'])
    }

    // Get tenant-scoped database client
    const db = getTenantDb(authResult.context)

    const { id: jobId } = await params
    const body = await request.json()
    const { newContractorId, reason } = body

    if (!newContractorId) {
      return NextResponse.json(
        { error: 'newContractorId is required' },
        { status: 400 }
      )
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reassignment reason is required' },
        { status: 400 }
      )
    }

    // Fetch job
    const job = await db.serviceRequest.findUnique({
      where: { id: jobId },
      include: {
        matches: {
          where: { status: { in: ['PENDING', 'ACCEPTED'] } },
          include: {
            contractor: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
        },
        user: { select: { id: true, name: true } },
      },
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Verify new contractor exists
    const newContractor = await db.contractorProfile.findUnique({
      where: { id: newContractorId },
      include: {
        user: { select: { id: true, name: true } },
      },
    })

    if (!newContractor) {
      return NextResponse.json(
        { error: 'New contractor not found' },
        { status: 404 }
      )
    }

    // DR-900: a contractor with a cancelled ABN or a failed/expired background
    // check (or any other dispatch gate) must get no jobs, so assignment is gated.
    if (!(await isDispatchEligible(newContractor.userId))) {
      return createErrorResponse(
        ErrorCode.FORBIDDEN,
        DISPATCH_INELIGIBLE_ERROR.message,
        403,
        { reason: DISPATCH_INELIGIBLE_ERROR.reason, link: DISPATCH_INELIGIBLE_ERROR.link }
      );
    }

    // Get current contractor (if any)
    const currentMatch = job.matches[0]
    const oldContractor = currentMatch?.contractor

    // Start transaction for reassignment
    await db.$transaction(async (tx) => {
      // Expire old match if exists
      if (currentMatch) {
        await tx.contractorMatch.update({
          where: { id: currentMatch.id },
          data: { status: 'EXPIRED' },
        })
      }

      // Create new match
      await tx.contractorMatch.create({
        data: {
          serviceRequestId: jobId,
          contractorId: newContractorId,
          status: 'PENDING',
          matchScore: 100, // Admin-initiated reassignment gets max score
        },
      })

      // Update job status back to PENDING if it was MATCHED
      if (job.status === 'MATCHED') {
        await tx.serviceRequest.update({
          where: { id: jobId },
          data: { status: 'PENDING' },
        })
      }
    })

    // Log the reassignment (outside transaction for proper audit service usage)
    await logClaimAction(request, user.id, jobId, 'BOOKING_REASSIGNED', {
      previousContractor: oldContractor ? {
        id: oldContractor.id,
        name: oldContractor.user.name,
      } : null,
      newContractor: {
        id: newContractorId,
        name: newContractor.user.name,
      },
      reason,
    })

    // Broadcast reassignment event via Supabase
    const reassignEvent: RealtimeJobEvent = {
      type: 'JOB_REASSIGNED',
      jobId,
      contractorId: newContractorId,
      clientId: job.userId,
      status: 'pending',
      message: `Job reassigned to ${newContractor.user.name}`,
      timestamp: new Date().toISOString(),
    }

    // Notify old contractor (if any)
    if (oldContractor) {
      await getSupabase().channel('jobs:contractor').send({
        type: 'broadcast',
        event: `contractor:${oldContractor.userId}`,
        payload: {
          ...reassignEvent,
          message: 'Job has been reassigned to another contractor',
        },
      })
    }

    // Notify new contractor
    await getSupabase().channel('jobs:contractor').send({
      type: 'broadcast',
      event: `contractor:${newContractor.userId}`,
      payload: reassignEvent,
    })

    // Notify client
    await getSupabase().channel('jobs:client').send({
      type: 'broadcast',
      event: `client:${job.userId}`,
      payload: {
        ...reassignEvent,
        message: `A new contractor (${newContractor.user.name}) has been assigned to your job`,
      },
    })

    // Broadcast to admin channel for dashboard updates
    await getSupabase().channel('jobs:admin').send({
      type: 'broadcast',
      event: 'job_reassigned',
      payload: reassignEvent,
    })

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        previousContractor: oldContractor ? {
          id: oldContractor.id,
          name: oldContractor.user.name,
        } : null,
        newContractor: {
          id: newContractor.id,
          name: newContractor.user.name,
        },
        reason,
      },
    })
  } catch (error) {
    return handleUnexpectedError(error)
  }
}

// GET - Fetch available contractors for reassignment
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) return authResult.response
    const { user } = authResult.context

    if (!requireRole(user, ['ADMIN', 'SUPER_ADMIN'])) {
      return unauthorizedRoleResponse(['ADMIN', 'SUPER_ADMIN'])
    }

    // Get tenant-scoped database client
    const db = getTenantDb(authResult.context)

    const { id: jobId } = await params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    // Get job location for distance calculation context
    const job = await db.serviceRequest.findUnique({
      where: { id: jobId },
      select: {
        location: true,
        serviceCategory: true,
      },
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Build contractor query
    const where: Record<string, unknown> = {
      verificationStatus: 'VERIFIED',
    }

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    // Fetch available contractors with their active job count
    const contractors = await db.contractorProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        matches: {
          where: {
            status: 'ACCEPTED',
            serviceRequest: {
              status: { notIn: ['COMPLETED', 'CANCELLED'] },
            },
          },
        },
      },
      take: 20,
      orderBy: { businessName: 'asc' },
    })

    const formattedContractors = contractors.map(c => ({
      id: c.id,
      userId: c.user.id,
      name: c.user?.name ?? null,
      businessName: c.businessName,
      email: c.user?.email ?? null,
      activeJobs: c.matches?.length ?? 0,
    }))

    return NextResponse.json({
      success: true,
      data: {
        contractors: formattedContractors,
        jobLocation: job.location,
      },
    })
  } catch (error) {
    return handleUnexpectedError(error)
  }
}
