// @ts-nocheck

/**
 * Claim Intake Pipeline
 *
 * Converts PublicClaim submissions into Bookings and matches with contractors.
 * This is the core of the platform's business logic:
 * 1. Admin reviews PublicClaim
 * 2. Admin converts to Booking (creates job)
 * 3. System finds matching contractors
 * 4. Contractors notified of available job
 * 5. Contractors submit bids
 * 6. Client reviews bids and accepts
 */

import { prisma } from '@/lib/prisma';
import { filterDispatchEligible } from '@/lib/services/dispatch-eligibility';
import { isGoLiveEnabled } from '@/lib/feature-flags/nrpg-go-live';
// Type-only import: runtime VALUES from @prisma/client break jest on CI
// (moduleNameMapper resolves to the generated client, absent there — PR #204).
import type { AustralianServiceType, AustralianState, EmergencyResponseLevel } from '@prisma/client';
import {
  sendContractorMatchNotificationEmail,
  sendBackupContractorNotificationEmail,
} from '@/lib/email/contractor-notifications';

// ============================================================================
// Types
// ============================================================================

export interface ConvertedBooking {
  bookingId: string;
  clientId: string;
  clientEmail: string;
  clientName: string;
  claimId: string;
}

export interface ContractorMatchResult {
  contractorId: string;
  contractorName: string;
  businessName: string;
  matchScore: number;
  reason: string[];
  primaryPostcode: string;
  primaryState: string;
  averageRating: number;
  completedJobs: number;
}

// ============================================================================
// Step 1: Convert PublicClaim to Booking
// ============================================================================

/**
 * Convert a PublicClaim submission into a Booking
 * Creates a User record for the client if needed
 */
export async function convertPublicClaimToBooking(publicClaimId: string): Promise<ConvertedBooking> {
  // 1. Get the PublicClaim
  const publicClaim = await prisma.publicClaim.findUnique({
    where: { id: publicClaimId },
  });

  if (!publicClaim) {
    throw new Error(`PublicClaim not found: ${publicClaimId}`);
  }

  if (publicClaim.status !== 'PENDING') {
    throw new Error(`PublicClaim is not pending: ${publicClaim.status}`);
  }

  // 2. Check if client User already exists
  let clientUser = await prisma.user.findUnique({
    where: { email: publicClaim.clientEmail },
  });

  // 3. Create User if doesn't exist
  if (!clientUser) {
    clientUser = await prisma.user.create({
      data: {
        email: publicClaim.clientEmail,
        name: publicClaim.clientName,
        role: 'CLIENT',
        emailVerified: null,
        isOnboardingComplete: false,
      },
    });

    // Create ClientProfile for the new client
    await prisma.clientProfile.create({
      data: {
        userId: clientUser.id,
        displayName: publicClaim.clientName,
        phoneNumber: publicClaim.clientPhone,
        isProfileComplete: false,
      },
    });
  }

  // 4. Map disaster type to Australian service type
  const serviceType = mapDisasterTypeToServiceType(publicClaim.disasterType);

  // 5. Map priority to emergency level
  const emergencyLevel = mapPriorityToEmergencyLevel(publicClaim.priority);

  // 6. Create Booking
  const booking = await prisma.booking.create({
    data: {
      clientId: clientUser.id,
      australianServiceType: serviceType,
      description: publicClaim.damageDescription,
      servicePostcode: publicClaim.postcode,
      serviceState: mapPostcodeToState(publicClaim.postcode, publicClaim.suburb),
      serviceSuburb: publicClaim.suburb,
      streetAddress: publicClaim.propertyAddress,
      status: 'PENDING' as const, // BookingStatus.PENDING — literal keeps @prisma/client type-only (CI jest trap)
      emergencyResponseLevel: emergencyLevel,
      estimatedCostAUD: estimateCostFromPriority(publicClaim.priority),
      notes: `Converted from PublicClaim ${publicClaimId}\nInsurance: ${publicClaim.hasInsurance ? publicClaim.insuranceProvider : 'None'}`,
      internalNotes: `Original submission email: ${publicClaim.clientEmail}\nPhone: ${publicClaim.clientPhone}`,
    },
  });

  // 7. Update PublicClaim status
  await prisma.publicClaim.update({
    where: { id: publicClaimId },
    data: {
      status: 'CONVERTED',
      convertedToBookingId: booking.id,
      convertedAt: new Date(),
      conversionNotes: `Converted to Booking ${booking.id}`,
    },
  });

  return {
    bookingId: booking.id,
    clientId: clientUser.id,
    clientEmail: clientUser.email,
    clientName: clientUser.name || 'Client',
    claimId: publicClaimId,
  };
}

// ============================================================================
// Step 2: Match Contractors to Booking
// ============================================================================

/**
 * Find and match contractors to a booking based on:
 * - Location (same postcode, state)
 * - Service specialties
 * - Availability
 * - Rating and performance
 * - Certifications
 */
export async function matchContractorsToBooking(bookingId: string): Promise<ContractorMatchResult[]> {
  // DR-929: kill switch — claim intake itself (PublicClaim -> Booking) keeps
  // functioning when the program is killed; only contractor matching/
  // notification is skipped, so no NEW contractor is matched or notified.
  // No booking lookup, no candidate query, no ContractorMatch rows created.
  if (!isGoLiveEnabled()) {
    return [];
  }

  // 1. Get booking details
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      servicePostcode: true,
      serviceState: true,
      australianServiceType: true,
      emergencyResponseLevel: true,
    },
  });

  if (!booking) {
    throw new Error(`Booking not found: ${bookingId}`);
  }

  // 2. Find candidate contractors.
  //    DR-925: eligibility is delegated to the canonical dispatch gate below
  //    (filterDispatchEligible — the single code path per spec N-04), which
  //    covers isActive/isSuspended and the rest of the lifecycle gates. Only
  //    two match-path-specific filters stay inline:
  //      - isVerified: admin verification is NOT part of the canonical gate
  //        (adding it there is a pending owner decision) — kept to preserve
  //        existing match behaviour.
  //      - unavailableUntil: availability, not eligibility.
  const now = new Date();
  const candidates = await prisma.contractor.findMany({
    where: {
      isVerified: true,
      OR: [
        { unavailableUntil: null },
        { unavailableUntil: { lt: now } },
      ],
    },
    include: {
      serviceAreas: {
        where: { isActive: true },
      },
      iicrcCertifications: {
        where: { isActive: true },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // 2b. DR-925: canonical dispatch-eligibility gate (contractor lifecycle is
  //     keyed on the owning User.id — Option B). Replaces the previous inline
  //     partial gate so this path can never drift from the pool's gating.
  const eligibleUserIds = await filterDispatchEligible(
    candidates.map((c) => c.user.id)
  );
  const contractors = candidates.filter((c) => eligibleUserIds.has(c.user.id));

  // 3. Calculate match scores
  const matches: ContractorMatchResult[] = [];

  for (const contractor of contractors) {
    let score = 0;
    const reasons: string[] = [];

    // Location matching (40 points max)
    const samePostcodeArea = contractor.serviceAreas.some(
      (area) => area.postcode === booking.servicePostcode
    );
    const sameStateArea = contractor.serviceAreas.some(
      (area) => area.state === booking.serviceState
    );

    if (samePostcodeArea) {
      score += 40;
      reasons.push('Same postcode service area');
    } else if (sameStateArea) {
      score += 20;
      reasons.push('Same state service area');
    }

    // Specialty matching (20 points)
    if (contractor.australianSpecialties.includes(booking.australianServiceType)) {
      score += 20;
      reasons.push(`Specialist in ${booking.australianServiceType}`);
    }

    // Emergency level capability (10 points)
    if (contractor.supportedEmergencyLevels.includes(booking.emergencyResponseLevel)) {
      score += 10;
      reasons.push(`Can handle ${booking.emergencyResponseLevel} response`);
    }

    // Availability (20 points)
    // For now, just check if they have any active service areas
    if (contractor.serviceAreas.length > 0) {
      score += 20;
      reasons.push('Currently accepting jobs');
    }

    // Rating (10 points)
    if (contractor.averageRating >= 4.5) {
      score += 10;
      reasons.push(`High rating: ${contractor.averageRating}/5`);
    }

    // Response time (10 points)
    if (contractor.averageResponseTimeMinutes > 0 && contractor.averageResponseTimeMinutes <= 30) {
      score += 10;
      reasons.push(`Fast response: ${contractor.averageResponseTimeMinutes}min avg`);
    }

    // Certifications (10 points)
    const hasSupervisorCert = contractor.iicrcCertifications.some(
      (cert) => cert.certificationLevel === 'SUPERVISOR' || cert.certificationLevel === 'MASTER'
    );
    if (hasSupervisorCert) {
      score += 10;
      reasons.push('Supervisor level or above certified');
    }

    // Only include contractors with minimum score of 30 (location + basic capability)
    if (score >= 30) {
      matches.push({
        contractorId: contractor.id,
        contractorName: contractor.user.name || 'Unknown',
        businessName: contractor.businessName,
        matchScore: score,
        reason: reasons,
        primaryPostcode: contractor.primaryPostcode || 'N/A',
        primaryState: contractor.primaryState || 'N/A',
        averageRating: Number(contractor.averageRating),
        completedJobs: contractor.completedJobs,
      });
    }
  }

  // 4. Sort by match score descending
  matches.sort((a, b) => b.matchScore - a.matchScore);

  // 5. Create ContractorMatch records for top matches (limit to 10)
  const topMatches = matches.slice(0, 10);

  for (const match of topMatches) {
    await prisma.contractorMatch.create({
      data: {
        contractorId: match.contractorId,
        serviceRequestId: bookingId, // Using bookingId as serviceRequestId (they reference the same job)
        matchScore: match.matchScore,
        status: 'PENDING',
      },
    });
  }

  return topMatches;
}

// ============================================================================
// Step 3: Notify Contractors
// ============================================================================

// Response deadline windows by urgency
const RESPONSE_DEADLINE_HOURS: Record<string, number> = {
  emergency: 0.25, // 15 minutes
  urgent: 0.5,     // 30 minutes
  standard: 2,     // 2 hours
  flexible: 4,     // 4 hours
};

const EMERGENCY_LEVEL_TO_URGENCY: Record<string, 'emergency' | 'urgent' | 'standard' | 'flexible'> = {
  CRITICAL: 'emergency',
  URGENT: 'urgent',
  STANDARD: 'standard',
  SCHEDULED: 'flexible',
};

/**
 * Send notifications to contractors about new available job.
 * Emails each contractor, updates ContractorMatch.notificationStatus, and sets responseDeadline.
 */
export async function notifyContractorsOfNewJob(
  bookingId: string,
  contractorIds: string[]
): Promise<{ successCount: number; failureCount: number }> {
  let successCount = 0;
  let failureCount = 0;

  // Get booking details for notification
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      client: { select: { name: true, email: true } },
    },
  });

  if (!booking) {
    throw new Error(`Booking not found: ${bookingId}`);
  }

  const urgency = EMERGENCY_LEVEL_TO_URGENCY[booking.emergencyResponseLevel] ?? 'standard';
  const responseDeadline = new Date(
    Date.now() + RESPONSE_DEADLINE_HOURS[urgency] * 60 * 60 * 1000
  );

  // Mask client name for privacy (e.g., "John S.")
  const clientParts = (booking.client?.name || 'Client').split(' ');
  const maskedClientName =
    clientParts.length > 1
      ? `${clientParts[0]} ${clientParts[clientParts.length - 1].charAt(0)}.`
      : clientParts[0];

  // Determine if insurance-backed from booking notes
  const hasInsurance = booking.notes?.includes('Insurance:') &&
    !booking.notes?.includes('Insurance: None');

  for (const contractorId of contractorIds) {
    try {
      const contractor = await prisma.contractor.findUnique({
        where: { id: contractorId },
        include: { user: { select: { id: true, email: true, name: true } } },
      });

      if (!contractor) {
        failureCount++;
        continue;
      }

      // Get ContractorMatch for this contractor+booking to retrieve matchScore/matchReason
      const match = await prisma.contractorMatch.findFirst({
        where: { contractorId, serviceRequestId: bookingId },
      });

      const emailResult = await sendContractorMatchNotificationEmail({
        contractorName: contractor.user.name || 'Contractor',
        contractorEmail: contractor.user.email,
        businessName: contractor.businessName,
        claimId: bookingId,
        clientName: maskedClientName,
        propertySuburb: booking.serviceSuburb || '',
        propertyPostcode: booking.servicePostcode || '',
        disasterType: booking.australianServiceType.replace(/_/g, ' '),
        urgency,
        matchScore: match?.matchScore ?? 50,
        matchReasons: (match?.matchReason as string[]) ?? ['Location match', 'Service specialty'],
        responseDeadline,
        estimatedValue: booking.estimatedCostAUD
          ? `$${Number(booking.estimatedCostAUD).toLocaleString('en-AU')}`
          : undefined,
        hasInsurance: hasInsurance ?? false,
      });

      if (emailResult.success) {
        if (match) {
          await prisma.contractorMatch.update({
            where: { id: match.id },
            data: {
              notificationStatus: 'SENT',
              notificationSentAt: new Date(),
              responseDeadline,
            },
          });
        }
        successCount++;
      } else {
        if (match) {
          await prisma.contractorMatch.update({
            where: { id: match.id },
            data: { notificationStatus: 'FAILED' },
          });
        }
        failureCount++;
      }
    } catch (error) {
      console.error(`Failed to notify contractor ${contractorId}:`, error);
      failureCount++;
    }
  }

  return { successCount, failureCount };
}

/**
 * Escalate a timed-out ContractorMatch to the next backup contractor.
 * Called by the job-alerts cron when a contractor hasn't responded within the deadline.
 */
export async function escalateToNextContractor(
  bookingId: string,
  expiredMatchId: string
): Promise<boolean> {
  // Mark the expired match
  await prisma.contractorMatch.update({
    where: { id: expiredMatchId },
    data: { notificationStatus: 'EXPIRED', contractorResponse: 'DECLINED' },
  });

  // Find next unnotified backup contractor for this booking, sorted by matchScore desc
  const nextMatch = await prisma.contractorMatch.findFirst({
    where: {
      serviceRequestId: bookingId,
      notificationStatus: null,
      contractorResponse: null,
    },
    orderBy: { matchScore: 'desc' },
    include: {
      contractor: {
        include: { user: { select: { email: true, name: true } } },
      },
    },
  });

  if (!nextMatch) {
    console.warn(`[ESCALATE] No backup contractor available for booking ${bookingId}`);
    return false;
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      australianServiceType: true,
      serviceSuburb: true,
      servicePostcode: true,
      emergencyResponseLevel: true,
    },
  });

  if (!booking) return false;

  const urgency = EMERGENCY_LEVEL_TO_URGENCY[booking.emergencyResponseLevel] ?? 'standard';
  const responseDeadline = new Date(
    Date.now() + RESPONSE_DEADLINE_HOURS[urgency] * 60 * 60 * 1000
  );

  const contractor = nextMatch.contractor as any;
  await sendBackupContractorNotificationEmail({
    contractorName: contractor?.user?.name || 'Contractor',
    contractorEmail: contractor?.user?.email || '',
    businessName: contractor?.businessName || '',
    claimId: bookingId,
    clientName: 'Property Owner',
    propertySuburb: booking.serviceSuburb || '',
    propertyPostcode: booking.servicePostcode || '',
    disasterType: booking.australianServiceType.replace(/_/g, ' '),
    urgency,
    matchScore: nextMatch.matchScore,
    responseDeadline,
  });

  await prisma.contractorMatch.update({
    where: { id: nextMatch.id },
    data: {
      notificationStatus: 'SENT',
      notificationSentAt: new Date(),
      responseDeadline,
    },
  });

  return true;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map disaster type from claim form to Australian service type
 */
function mapDisasterTypeToServiceType(disasterType: string): AustralianServiceType {
  const mapping: Record<string, AustralianServiceType> = {
    'water-damage': 'WATER_RESTORATION',
    'fire-damage': 'FIRE_RESTORATION',
    'flood': 'FLOOD_RESTORATION',
    'bushfire': 'BUSHFIRE_RESTORATION',
    'storm-damage': 'STORM_RESTORATION',
    'mold': 'MOLD_REMEDIATION',
    'other': 'GENERAL_RESTORATION',
  };

  return mapping[disasterType.toLowerCase()] || 'GENERAL_RESTORATION';
}

/**
 * Map priority level to emergency response level
 */
function mapPriorityToEmergencyLevel(priority: string): EmergencyResponseLevel {
  const mapping: Record<string, EmergencyResponseLevel> = {
    critical: 'CRITICAL',
    urgent: 'CRITICAL',
    high: 'URGENT',
    medium: 'STANDARD',
    low: 'STANDARD',
  };

  return mapping[priority.toLowerCase()] || 'STANDARD';
}

/**
 * Map Australian postcode to state
 * This is a simplified version - in production, use a full postcode database
 */
function mapPostcodeToState(postcode: string, suburb?: string): AustralianState {
  const firstDigit = postcode.charAt(0);

  const mapping: Record<string, AustralianState> = {
    '1': 'NSW', // 1000-1999
    '2': 'NSW', // 2000-2799
    '3': 'VIC', // 3000-3999
    '4': 'QLD', // 4000-4999
    '5': 'SA', // 5000-5999
    '6': 'WA', // 6000-6999
    '7': 'TAS', // 7000-7999
    '8': 'NT', // 8000-8999
    '9': 'ACT', // 9000-9999
  };

  return (mapping[firstDigit] || 'NSW') as AustralianState;
}

/**
 * Estimate service cost based on priority level
 * In production, this would be more sophisticated based on:
 * - Damage severity
 * - Location
 * - Service type
 * - Insurance coverage
 */
function estimateCostFromPriority(priority: string): number {
  const costMap: Record<string, number> = {
    critical: 5000,
    urgent: 3000,
    high: 2000,
    medium: 1000,
    low: 500,
  };

  return costMap[priority.toLowerCase()] || 1000;
}

/**
 * Get all pending public claims ready for conversion
 */
export async function getPendingPublicClaims() {
  return await prisma.publicClaim.findMany({
    where: { status: 'PENDING' },
    orderBy: { submittedAt: 'desc' },
  });
}

/**
 * Get claim status and history
 */
export async function getClaimStatus(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      client: {
        select: {
          name: true,
          email: true,
        },
      },
      contractor: {
        select: {
          businessName: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      payments: {
        select: {
          id: true,
          status: true,
          amountAUD: true,
          createdAt: true,
        },
      },
    },
  });

  return booking;
}
