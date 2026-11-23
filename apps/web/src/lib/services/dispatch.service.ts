/**
 * Dispatch & Rotation Service
 *
 * Intelligent job dispatch with KM radius and fair rotation
 * Strategic decisions from SaaS architecture:
 * - Auto-dispatch for emergencies (instant notification)
 * - Fair rotation (timestamp-based)
 * - Soft preference for repeat clients
 * - No penalty for declines
 * - Queue for 6am if no overnight availability
 */

import { prisma } from '@/lib/prisma';
import { filterDispatchEligible } from '@/lib/services/dispatch-eligibility';

// ============================================================================
// TYPES
// ============================================================================

export interface DispatchCriteria {
  latitude: number;
  longitude: number;
  postcode: string;
  disasterType: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  requiredCertifications?: string[]; // certification codes held by the contractor
  clientId?: string; // For repeat client preference
}

export interface AvailableContractor {
  workspaceId: string;
  businessName: string;
  distanceKm: number;
  lastJobReceivedAt: Date | null;
  serviceRadiusKm: number;
  availabilityStatus: string;
  completionRate: number;
  averageRating: number;
}

// ============================================================================
// DISPATCH ALGORITHM
// ============================================================================

/**
 * Find available contractors for incident
 * Auto-dispatch algorithm (Strategic Decision: Full auto-dispatch)
 */
export async function findAvailableContractors(
  criteria: DispatchCriteria
): Promise<AvailableContractor[]> {
  // Query rotation queue for contractors in area
  const contractors = await prisma.contractorRotation.findMany({
    where: {
      postcode: criteria.postcode,
      availabilityStatus: 'available',
      workspace: {
        subscriptionStatus: 'ACTIVE',
        isActive: true,
        // Check if under monthly job limit (or unlimited)
        OR: [
          { monthlyJobLimit: 999 }, // Enterprise unlimited
          { currentMonthJobs: { lt: prisma.workspace.fields.monthlyJobLimit } },
        ],
      },
    },
    include: {
      workspace: {
        select: {
          id: true,
          ownerId: true,
          businessName: true,
          currentMonthJobs: true,
          monthlyJobLimit: true,
          serviceRadiusKm: true,
          completionRate: true,
          averageRating: true,
        },
      },
    },
    orderBy: {
      lastJobReceivedAt: 'asc', // Fair rotation: oldest first
    },
  });

  // Calculate distances (simplified - in production use PostGIS)
  const withinRadius = contractors
    .map((c) => ({
      ownerId: c.workspace.ownerId,
      workspaceId: c.workspace.id,
      businessName: c.workspace.businessName,
      distanceKm: calculateDistance(criteria.latitude, criteria.longitude, c.postcode),
      lastJobReceivedAt: c.lastJobReceivedAt,
      serviceRadiusKm: c.workspace.serviceRadiusKm,
      availabilityStatus: c.availabilityStatus,
      completionRate: Number(c.workspace.completionRate),
      averageRating: Number(c.workspace.averageRating),
    }))
    .filter((c) => c.distanceKm <= c.serviceRadiusKm); // Within radius

  // DR-889: exclude contractors without a current, non-superseded ICA acceptance.
  // The contractor's lifecycle key is the workspace OWNER's User.id (Option B).
  const eligibleOwnerIds = await filterDispatchEligible(
    withinRadius.map((c) => c.ownerId)
  );

  const available: AvailableContractor[] = withinRadius
    .filter((c) => eligibleOwnerIds.has(c.ownerId))
    .map((c) => ({
      workspaceId: c.workspaceId,
      businessName: c.businessName,
      distanceKm: c.distanceKm,
      lastJobReceivedAt: c.lastJobReceivedAt,
      serviceRadiusKm: c.serviceRadiusKm,
      availabilityStatus: c.availabilityStatus,
      completionRate: c.completionRate,
      averageRating: c.averageRating,
    }));

  return available;
}

/**
 * Dispatch job to contractor (notify and wait for response)
 * Soft preference for repeat clients (Strategic Decision)
 */
export async function dispatchJob(
  incidentId: string,
  criteria: DispatchCriteria
): Promise<{
  success: boolean;
  acceptedByWorkspaceId?: string;
  queuedForMorning?: boolean;
  message: string;
}> {
  // Check for repeat client preference
  if (criteria.clientId) {
    const previousJob = await prisma.incident.findFirst({
      where: {
        clientId: criteria.clientId,
        acceptedByWorkspaceId: { not: null },
        status: 'completed',
      },
      orderBy: {
        completedAt: 'desc',
      },
      select: {
        acceptedByWorkspaceId: true,
      },
    });

    if (previousJob?.acceptedByWorkspaceId) {
      // Soft preference: Offer to previous contractor first
      const offered = await offerJobToContractor(
        incidentId,
        previousJob.acceptedByWorkspaceId
      );

      if (offered.accepted) {
        return {
          success: true,
          acceptedByWorkspaceId: previousJob.acceptedByWorkspaceId,
          message: 'Job accepted by previous contractor',
        };
      }
      // If declined, continue with normal rotation
    }
  }

  // Find available contractors
  const contractors = await findAvailableContractors(criteria);

  if (contractors.length === 0) {
    // No contractors available - queue for 6am (Strategic Decision)
    await prisma.incident.update({
      where: { id: incidentId },
      data: {
        status: 'queued_for_morning',
        queuedForTime: new Date(new Date().setHours(6, 0, 0, 0)),
      },
    });

    return {
      success: false,
      queuedForMorning: true,
      message: 'No contractors available. Queued for 6am dispatch.',
    };
  }

  // Offer to contractors in rotation order (oldest first)
  for (const contractor of contractors) {
    const offered = await offerJobToContractor(incidentId, contractor.workspaceId);

    if (offered.accepted) {
      return {
        success: true,
        acceptedByWorkspaceId: contractor.workspaceId,
        message: 'Job accepted',
      };
    }
    // No penalty for decline (Strategic Decision)
    // Continue to next contractor
  }

  // All declined - queue for morning
  return {
    success: false,
    queuedForMorning: true,
    message: 'All contractors declined. Queued for 6am re-dispatch.',
  };
}

/**
 * Offer job to specific contractor (notify and wait)
 */
async function offerJobToContractor(
  incidentId: string,
  workspaceId: string
): Promise<{ accepted: boolean }> {
  // In production:
  // 1. Send SMS + push notification
  // 2. Wait 5 minutes for response
  // 3. Track in incident.offeredToContractors JSONB

  // For now, placeholder
  // Actual implementation would use WebSocket or polling
  return { accepted: false }; // Simulate decline
}

/**
 * Calculate distance between two points (simplified)
 * In production: Use PostGIS or proper geospatial calculation
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  postcode: string
): number {
  // Placeholder: Return random distance for now
  // Real implementation:
  // - Look up postcode lat/lon
  // - Haversine formula for distance
  // - Or use PostGIS ST_Distance
  return Math.random() * 50; // 0-50km random
}

// Placeholder Incident type
interface Incident {
  id: string;
  clientId?: string;
  acceptedByWorkspaceId?: string | null;
  status: string;
  completedAt?: Date | null;
}

// Extend prisma types (placeholder)
declare module '@prisma/client' {
  interface Incident {
    queuedForTime?: Date;
  }
}
