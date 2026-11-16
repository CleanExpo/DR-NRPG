// @ts-nocheck

/**
 * Contractor Search API Route
 * Handles contractor search and matching based on postcode, state, and specialties
 * GET /api/contractors/search - Search for available contractors
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { getTenantDb } from '@/lib/get-tenant-db';
import { AustralianServiceType, EmergencyResponseLevel } from '@prisma/client';
import { australianPostcodeSchema } from '@/lib/validation/australia';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET /api/contractors/search - Search for contractors
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;

    // Contractors are private; this endpoint is admin-only.
    if (!requireRole(user, ['ADMIN', 'SUPER_ADMIN'])) {
      return unauthorizedRoleResponse(['ADMIN', 'SUPER_ADMIN']);
    }

    const db = getTenantDb(authResult.context);

    const searchParams = request.nextUrl.searchParams;
    const postcode = searchParams.get('postcode');
    const serviceType = searchParams.get('serviceType');
    const emergencyLevel = searchParams.get('emergencyLevel');
    const minRating = searchParams.get('minRating');

    // Validate postcode
    if (!postcode) {
      return NextResponse.json(
        { error: 'postcode is required' },
        { status: 400 }
      );
    }

    try {
      australianPostcodeSchema.parse(postcode);
    } catch (error: any) {
      return NextResponse.json(
        {
          error: 'Invalid postcode',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Validate service type if provided
    const validServiceTypes = Object.values(AustralianServiceType);
    if (serviceType && !validServiceTypes.includes(serviceType as any)) {
      return NextResponse.json(
        { error: 'Invalid service type' },
        { status: 400 }
      );
    }

    // Validate emergency level if provided
    const validEmergencyLevels = Object.values(EmergencyResponseLevel);
    if (emergencyLevel && !validEmergencyLevels.includes(emergencyLevel as any)) {
      return NextResponse.json(
        { error: 'Invalid emergency level' },
        { status: 400 }
      );
    }

    // Build filter
    const where: any = {
      isVerified: true,
      isActive: true,
      isSuspended: false,
      nrpgVerificationLevel: 'VERIFIED',
      serviceAreas: {
        some: {
          postcode,
          isActive: true,
        },
      },
      iicrcCertifications: {
        some: {
          isActive: true,
          expiryDate: {
            gt: new Date(),
          },
        },
      },
    };

    // Add service type filter if provided
    if (serviceType) {
      where.australianSpecialties = {
        has: serviceType as AustralianServiceType,
      };
    }

    // Add emergency level filter if provided
    if (emergencyLevel) {
      where.supportedEmergencyLevels = {
        has: emergencyLevel as EmergencyResponseLevel,
      };
    }

    // Search contractors
    const contractors = await db.contractor.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            australianPhoneNumber: true,
          },
        },
        serviceAreas: {
          where: {
            postcode,
            isActive: true,
          },
        },
        iicrcCertifications: {
          where: {
            isActive: true,
            expiryDate: {
              gt: new Date(),
            },
          },
        },
      },
      orderBy: [
        { averageRating: 'desc' },
        { completedJobs: 'desc' },
        { averageResponseTimeMinutes: 'asc' },
      ],
      take: 20,
    });

    // Filter by min rating if provided
    const minRatingNum = minRating ? parseFloat(minRating) : 0;
    const filteredContractors = contractors.filter(
      (c) => c.averageRating >= minRatingNum
    );

    // Calculate match scores
    const results = filteredContractors.map((contractor) => {
      let score = 100;

      // Reduce score for lower rating
      score -= (5 - Number(contractor.averageRating)) * 5;

      // Bonus for more completed jobs
      score += Math.min(contractor.completedJobs * 0.5, 20);

      // Bonus for faster response time
      if (contractor.averageResponseTimeMinutes > 0) {
        score += Math.min(240 / contractor.averageResponseTimeMinutes, 20);
      }

      // Bonus for industry certifications
      score += contractor.iicrcCertifications.length * 5;

      return {
        id: contractor.id,
        businessName: contractor.businessName,
        nrpgMemberId: contractor.nrpgMemberId,
        rating: Number(contractor.averageRating),
        completedJobs: contractor.completedJobs,
        responseTimeMinutes: contractor.averageResponseTimeMinutes,
        iicrcLevels: contractor.iicrcCertifications.map(
          (c) => c.certificationLevel
        ),
        specialties: contractor.australianSpecialties,
        operatingStates: contractor.operatingStates,
        contact: {
          email: contractor.user.email,
          phone: contractor.user.australianPhoneNumber,
        },
        matchScore: Math.round(score),
      };
    });

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      searchCriteria: {
        postcode,
        serviceType: serviceType || 'any',
        emergencyLevel: emergencyLevel || 'any',
        minRating: minRatingNum,
      },
    });
  } catch (error) {
    console.error('Error searching contractors:', error);
    return NextResponse.json(
      { error: 'Error searching contractors' },
      { status: 500 }
    );
  }
}
