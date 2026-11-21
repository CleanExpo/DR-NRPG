// @ts-nocheck

/**
 * Public API: Contractor Search
 * Allows property owners to search for verified contractors without authentication.
 *
 * Route: GET /api/public/contractors/search
 * Rate Limit: 30 requests per minute per IP
 * Security: No auth required; returns only public-safe data
 */

import { NextRequest, NextResponse } from 'next/server';
import { AustralianServiceType, EmergencyResponseLevel } from '@prisma/client';
import { basePrisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/api/rate-limit';
import {
  withErrorHandler,
  successResponse,
  Logger,
  ValidationError,
} from '@/lib/api/error-handler';
import { addSecurityHeaders } from '@/lib/api/security';

export const dynamic = 'force-dynamic';

// Moderate rate limit for public search
const searchRateLimit = rateLimit({
  name: 'public-contractor-search',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  message: 'Too many search requests. Please try again shortly.',
});

/**
 * GET /api/public/contractors/search
 * Search for verified, active contractors
 */
async function handleContractorSearch(req: NextRequest) {
  const logger = new Logger({
    endpoint: '/api/public/contractors/search',
    method: 'GET',
  });

  // 1. Rate limiting
  const rateLimitResult = await searchRateLimit(req);
  if (rateLimitResult) {
    logger.warn('Rate limit exceeded');
    return rateLimitResult;
  }

  const searchParams = req.nextUrl.searchParams;
  const postcode = searchParams.get('postcode');
  const serviceType = searchParams.get('serviceType');
  const emergencyLevel = searchParams.get('emergencyLevel');
  const minRating = searchParams.get('minRating');
  const query = searchParams.get('q');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));

  // 2. Validate service type if provided
  const validServiceTypes = Object.values(AustralianServiceType);
  if (serviceType && !validServiceTypes.includes(serviceType as AustralianServiceType)) {
    throw new ValidationError('Invalid service type');
  }

  // 3. Validate emergency level if provided
  const validEmergencyLevels = Object.values(EmergencyResponseLevel);
  if (emergencyLevel && !validEmergencyLevels.includes(emergencyLevel as EmergencyResponseLevel)) {
    throw new ValidationError('Invalid emergency level');
  }

  // 4. Validate postcode format if provided (4-digit Australian)
  if (postcode && !/^\d{4}$/.test(postcode)) {
    throw new ValidationError('Invalid postcode format. Must be a 4-digit Australian postcode.');
  }

  // 5. Build filter — only verified, active, non-suspended contractors
  const where: any = {
    isVerified: true,
    isActive: true,
    isSuspended: false,
    nrpgVerificationLevel: 'VERIFIED',
    iicrcCertifications: {
      some: {
        isActive: true,
        expiryDate: {
          gt: new Date(),
        },
      },
    },
  };

  // Postcode filter via service areas
  if (postcode) {
    where.serviceAreas = {
      some: {
        postcode,
        isActive: true,
      },
    };
  }

  // Service type filter
  if (serviceType) {
    where.australianSpecialties = {
      has: serviceType as AustralianServiceType,
    };
  }

  // Emergency level filter
  if (emergencyLevel) {
    where.supportedEmergencyLevels = {
      has: emergencyLevel as EmergencyResponseLevel,
    };
  }

  // Text search on business name
  if (query) {
    where.businessName = {
      contains: query,
      mode: 'insensitive',
    };
  }

  // 6. Count total for pagination
  const total = await basePrisma.contractor.count({ where });
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  // 7. Search contractors
  const contractors = await basePrisma.contractor.findMany({
    where,
    include: {
      iicrcCertifications: {
        where: {
          isActive: true,
          expiryDate: {
            gt: new Date(),
          },
        },
        select: {
          certificationLevel: true,
        },
      },
      _count: {
        select: {
          ratings: true,
        },
      },
      ...(postcode
        ? {
            serviceAreas: {
              where: {
                postcode,
                isActive: true,
              },
              select: {
                state: true,
                responseTimeMinutes: true,
              },
            },
          }
        : {}),
    },
    orderBy: [
      { averageRating: 'desc' },
      { completedJobs: 'desc' },
      { averageResponseTimeMinutes: 'asc' },
    ],
    skip,
    take: limit,
  });

  // 8. Filter by min rating and calculate match scores
  const minRatingNum = minRating ? parseFloat(minRating) : 0;

  const results = contractors
    .filter((c) => Number(c.averageRating) >= minRatingNum)
    .map((contractor) => {
      // Match scoring algorithm (mirrors admin endpoint)
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

      // PUBLIC-SAFE data only — no phone, email, ABN, address, policy details
      return {
        id: contractor.id,
        businessName: contractor.businessName,
        nrpgMemberId: contractor.nrpgMemberId,
        rating: Number(contractor.averageRating),
        reviewCount: contractor._count.ratings,
        completedJobs: contractor.completedJobs,
        responseTimeMinutes: contractor.averageResponseTimeMinutes,
        iicrcLevels: contractor.iicrcCertifications.map(
          (c) => c.certificationLevel
        ),
        specialties: contractor.australianSpecialties,
        operatingStates: contractor.operatingStates,
        matchScore: Math.round(Math.min(score, 150)),
      };
    });

  logger.info('Public contractor search completed', {
    total,
    returned: results.length,
    page,
    postcode: postcode || 'any',
    serviceType: serviceType || 'any',
  });

  const response = successResponse({
    contractors: results,
    total,
    page,
    totalPages,
    limit,
    searchCriteria: {
      postcode: postcode || null,
      serviceType: serviceType || null,
      emergencyLevel: emergencyLevel || null,
      minRating: minRatingNum,
      query: query || null,
    },
  });

  return addSecurityHeaders(response, { csp: 'standard', cors: true });
}

// OPTIONS endpoint for CORS preflight
export async function OPTIONS(req: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return addSecurityHeaders(response, { csp: 'none', cors: true });
}

// GET endpoint wrapped with error handler
export const GET = withErrorHandler(handleContractorSearch);
