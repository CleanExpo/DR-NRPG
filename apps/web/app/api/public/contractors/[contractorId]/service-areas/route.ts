// @ts-nocheck

/**
 * Public API: Contractor Service Areas
 * Returns geographic service area data for displaying on contractor profiles.
 *
 * Route: GET /api/public/contractors/[contractorId]/service-areas
 * Rate Limit: 30 requests per minute per IP
 * Security: No auth required; returns only public-safe data
 */

import { NextRequest, NextResponse } from 'next/server';
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

// Moderate rate limit for public data
const serviceAreasRateLimit = rateLimit({
  name: 'public-contractor-service-areas',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  message: 'Too many requests. Please try again shortly.',
});

/**
 * GET /api/public/contractors/[contractorId]/service-areas
 * Get service area postcodes with response times for map visualization
 */
async function handleGetServiceAreas(
  req: NextRequest,
  { params }: { params: Promise<{ contractorId: string }> }
) {
  const logger = new Logger({
    endpoint: `/api/public/contractors/[contractorId]/service-areas`,
    method: 'GET',
  });

  // 1. Rate limiting
  const rateLimitResult = await serviceAreasRateLimit(req);
  if (rateLimitResult) {
    logger.warn('Rate limit exceeded');
    return rateLimitResult;
  }

  const { contractorId } = await params;

  if (!contractorId) {
    throw new ValidationError('Contractor ID is required');
  }

  // 2. Verify contractor exists and is publicly visible
  const contractor = await basePrisma.contractor.findUnique({
    where: { id: contractorId },
    select: {
      id: true,
      isVerified: true,
      isActive: true,
      isSuspended: true,
      nrpgVerificationLevel: true,
      primaryPostcode: true,
      primaryState: true,
      operatingStates: true,
    },
  });

  // Only return data for verified, active, non-suspended contractors
  if (
    !contractor ||
    !contractor.isVerified ||
    !contractor.isActive ||
    contractor.isSuspended ||
    contractor.nrpgVerificationLevel !== 'VERIFIED'
  ) {
    logger.warn('Contractor not found or not publicly visible', {
      contractorId,
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Contractor not found',
      },
      { status: 404 }
    );
  }

  // 3. Get service areas with response times
  const serviceAreas = await basePrisma.contractorServiceArea.findMany({
    where: {
      contractorId,
      isActive: true,
    },
    select: {
      postcode: true,
      state: true,
      responseTimeMinutes: true,
      radiusKm: true,
    },
    orderBy: [
      { state: 'asc' },
      { postcode: 'asc' },
    ],
  });

  logger.info('Service areas retrieved', {
    contractorId,
    count: serviceAreas.length,
  });

  // 4. Format response
  const response = successResponse({
    serviceAreas: serviceAreas.map((area) => ({
      postcode: area.postcode,
      state: area.state,
      responseTimeMinutes: area.responseTimeMinutes || 30, // Default 30 min if not set
      radiusKm: area.radiusKm,
    })),
    primaryPostcode: contractor.primaryPostcode,
    operatingStates: contractor.operatingStates,
    totalAreas: serviceAreas.length,
  });

  return addSecurityHeaders(response, { csp: 'standard', cors: true });
}

// OPTIONS endpoint for CORS preflight
export async function OPTIONS(req: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return addSecurityHeaders(response, { csp: 'none', cors: true });
}

// GET endpoint wrapped with error handler
export const GET = withErrorHandler(handleGetServiceAreas);
