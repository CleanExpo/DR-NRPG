// @ts-nocheck

/**
 * Contractor Matching Background Job Processor - STRICT ROTATION
 *
 * ⚠️ ARCHITECTURAL CHANGE (2026-02-03):
 * This processor now uses STRICT ROTATION instead of AI scoring.
 * - NO AI workflow execution
 * - NO scoring algorithms
 * - Pure round-robin rotation based on lastJobReceivedAt
 * - IICRC cert hard filtering with fallback
 * - Fair job distribution across all contractors
 *
 * Previous Implementation: AI-powered scoring via LangGraph (deprecated)
 * See: apps/web/lib/agents/workflows/contractor-matching.ts (DEPRECATED)
 */

import { basePrisma } from '@/lib/prisma';
import { createJob } from '../background-jobs';
import { getRequiredCerts } from '@/lib/claim-wizard/cert-requirements';
import { filterDispatchEligible } from '@/lib/services/dispatch-eligibility';
import { isGoLiveEnabled } from '@/lib/feature-flags/nrpg-go-live';

/** How many contractors one claim is offered to, in rotation order. */
const OFFER_COUNT = 5;

/**
 * Keep only contractors that pass the canonical dispatch gate (ICA, insurance,
 * IICRC, Stripe, training certificate), in rotation order, then cap the offer.
 * Same single code path as claim intake, so the queue cannot drift from it.
 */
async function keepDispatchEligible(candidates: any[]): Promise<any[]> {
  if (candidates.length === 0) return candidates;
  const eligible = await filterDispatchEligible(candidates.map((c) => c.user.id));
  return candidates.filter((c) => eligible.has(c.user.id)).slice(0, OFFER_COUNT);
}

// ============================================================================
// Types
// ============================================================================

interface ContractorMatchingInput {
  claimId: string;
  criteria: {
    serviceType: string;
    location: {
      state: string;
      suburb: string;
      postcode: string;
    };
    urgency: 'emergency' | 'urgent' | 'standard' | 'flexible';
    budget?: number;
    preferredAvailability?: string;
    specialRequirements?: string[];
  };
}

interface ProcessorOutput {
  claimId: string;
  matchingCompleted: boolean;
  matchedContractorCount: number;
  recommendedContractorId: string | null;
  notificationJobsQueued: number;
  rotationBased: boolean;
  fallbackUsed: boolean;
  noMatchReason?: string;
}

// ============================================================================
// Main Processor - STRICT ROTATION LOGIC
// ============================================================================

/**
 * Process contractor matching job using STRICT ROTATION
 *
 * Algorithm:
 * 1. Load claim and determine required IICRC certifications
 * 2. ROUND 1: Query contractors WITH required certs, ordered by rotation (lastJobReceivedAt ASC)
 * 3. If Round 1 has matches → Create ContractorMatch records
 * 4. If Round 1 has NO matches → ROUND 2 (FALLBACK): Query ANY contractor in rotation order
 * 5. Update rotation tracking (lastJobReceivedAt = now, totalJobsOffered++)
 * 6. Queue notification for PRIMARY contractor (first in rotation)
 */
export async function processContractorMatchingJob(
  input: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { claimId, criteria } = input as ContractorMatchingInput;

  console.log(`[Contractor Matching - ROTATION] Starting for claim ${claimId}`);

  // Kill switch (DR-929): when go-live is paused, match and notify no one.
  // The claim is left untouched so it can be matched once go-live resumes.
  if (!isGoLiveEnabled()) {
    return {
      claimId,
      matchingCompleted: false,
      matchedContractorCount: 0,
      recommendedContractorId: null,
      notificationJobsQueued: 0,
      rotationBased: true,
      fallbackUsed: false,
      noMatchReason: 'Contractor go-live is paused',
    } as ProcessorOutput;
  }

  // 1. Load claim
  const claim = await basePrisma.publicClaim.findUnique({
    where: { id: claimId },
    select: {
      id: true,
      status: true,
      priority: true,
      tenantId: true,
      clientName: true,
      disasterType: true,
      postcode: true,
      requiredIICRCCerts: true,
    },
  });

  if (!claim) {
    throw new Error(`Claim ${claimId} not found`);
  }

  // 2. Determine required IICRC certifications
  const requiredCerts =
    claim.requiredIICRCCerts && claim.requiredIICRCCerts.length > 0
      ? claim.requiredIICRCCerts
      : getRequiredCerts(claim.disasterType);

  console.log(
    `[Contractor Matching - ROTATION] Claim ${claimId} requires certs: ${requiredCerts.length > 0 ? requiredCerts.join(', ') : 'NONE'}`
  );

  // 3. ROUND 1: Try to match contractors WITH required cert (if any)
  let eligibleContractors: any[] = [];
  let fallbackUsed = false;

  if (requiredCerts.length > 0) {
    console.log(
      `[Contractor Matching - ROTATION] ROUND 1: Searching for contractors WITH certs ${requiredCerts.join(', ')}`
    );

    eligibleContractors = await basePrisma.contractor.findMany({
      where: {
        // Active and verified
        isActive: true,
        isVerified: true,
        isSuspended: false,

        // Availability check (grace period)
        OR: [{ unavailableUntil: null }, { unavailableUntil: { lt: new Date() } }],

        // Service area match
        serviceAreas: {
          some: {
            postcode: criteria.location.postcode,
            state: criteria.location.state,
            isActive: true,
          },
        },

        // IICRC certification hard filter
        iicrcCertifications: {
          some: {
            certificationLevel: { in: requiredCerts },
            isActive: true,
            expiryDate: { gt: new Date() }, // Not expired
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        iicrcCertifications: {
          where: {
            isActive: true,
            expiryDate: { gt: new Date() },
          },
          select: {
            certificationLevel: true,
          },
        },
      },
      // STRICT ROTATION ORDER: Oldest lastJobReceivedAt first
      orderBy: {
        updatedAt: 'asc', // Use updatedAt as proxy for rotation (TODO: add ContractorRotation join)
      },
    });
    eligibleContractors = await keepDispatchEligible(eligibleContractors);

    console.log(
      `[Contractor Matching - ROTATION] ROUND 1: Found ${eligibleContractors.length} contractors with required certs`
    );
  }

  // 4. ROUND 2 (FALLBACK): If no contractors with cert, offer to ANY in rotation
  if (eligibleContractors.length === 0) {
    if (requiredCerts.length > 0) {
      console.log(
        `[Contractor Matching - ROTATION] ROUND 2 (FALLBACK): No contractors with required certs, searching ANY contractors`
      );
      fallbackUsed = true;
    }

    eligibleContractors = await basePrisma.contractor.findMany({
      where: {
        isActive: true,
        isVerified: true,
        isSuspended: false,
        OR: [{ unavailableUntil: null }, { unavailableUntil: { lt: new Date() } }],
        serviceAreas: {
          some: {
            postcode: criteria.location.postcode,
            state: criteria.location.state,
            isActive: true,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        iicrcCertifications: {
          where: {
            isActive: true,
            expiryDate: { gt: new Date() },
          },
          select: {
            certificationLevel: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'asc', // Use updatedAt as proxy for rotation
      },
    });
    eligibleContractors = await keepDispatchEligible(eligibleContractors);

    console.log(
      `[Contractor Matching - ROTATION] ROUND ${requiredCerts.length > 0 ? '2 (FALLBACK)' : '1'}: Found ${eligibleContractors.length} contractors`
    );
  }

  // 5. Handle no-match scenario
  if (eligibleContractors.length === 0) {
    console.warn(
      `[Contractor Matching - ROTATION] No contractors available for claim ${claimId} in area ${criteria.location.postcode}`
    );

    await basePrisma.publicClaim.update({
      where: { id: claimId },
      data: {
        status: 'NO_CONTRACTORS_AVAILABLE',
        notes: `No contractors available in ${criteria.location.suburb} (${criteria.location.postcode})${requiredCerts.length > 0 ? ` with required certifications: ${requiredCerts.join(', ')}` : ''}`,
      },
    });

    // TODO: Send Slack alert to admin
    console.error(
      `[Contractor Matching - ROTATION] ALERT: No contractors for ${criteria.location.postcode}`
    );

    return {
      claimId,
      matchingCompleted: true,
      matchedContractorCount: 0,
      recommendedContractorId: null,
      notificationJobsQueued: 0,
      rotationBased: true,
      fallbackUsed,
      noMatchReason: `No contractors available in area`,
    } as ProcessorOutput;
  }

  // 6. Create ContractorMatch records (NO AI SCORING - rotation order = priority)
  console.log(
    `[Contractor Matching - ROTATION] Creating match records for ${eligibleContractors.length} contractors`
  );

  const matchRecords = await Promise.all(
    eligibleContractors.map(async (contractor, index) => {
      const isPrimary = index === 0; // First in rotation = primary

      // Calculate response deadline based on urgency
      const responseDeadline = calculateResponseDeadline(criteria.urgency, isPrimary);

      // Build match reasons (for transparency)
      const matchReasons = [
        `Position #${index + 1} in rotation queue`,
        contractor.iicrcCertifications.length > 0
          ? `Has certs: ${contractor.iicrcCertifications.map((c: any) => c.certificationLevel).join(', ')}`
          : fallbackUsed
          ? 'Fallback match (no cert required or none available)'
          : 'No certifications required for this job',
        `Last updated: ${contractor.updatedAt.toISOString().split('T')[0]}`,
      ];

      return basePrisma.contractorMatch.create({
        data: {
          claimId,
          contractorId: contractor.id,
          matchScore: 100 - index * 5, // Simple score for display: 100, 95, 90, 85, 80
          matchReason: matchReasons,
          notificationStatus: 'PENDING',
          responseDeadline,
          isBackup: !isPrimary,
        },
      });
    })
  );

  console.log(
    `[Contractor Matching - ROTATION] Created ${matchRecords.length} ContractorMatch records`
  );

  // 7. Update rotation tracking for all matched contractors
  const contractorIds = eligibleContractors.map((c) => c.id);

  if (contractorIds.length > 0) {
    const now = new Date();

    // Update contractors directly (simplified - no ContractorRotation table join)
    await basePrisma.contractor.updateMany({
      where: { id: { in: contractorIds } },
      data: {
        updatedAt: now, // Using updatedAt as rotation tracker for now
      },
    });

    console.log(
      `[Contractor Matching - ROTATION] Updated rotation for ${contractorIds.length} contractors`
    );
  }

  // 8. Update claim status
  await basePrisma.publicClaim.update({
    where: { id: claimId },
    data: {
      status: 'CONTRACTORS_MATCHED',
      notes: `Matched via rotation: ${eligibleContractors[0].businessName} (primary) + ${matchRecords.length - 1} backup(s)${fallbackUsed ? ' [FALLBACK - no contractors had required certs]' : ''}`,
    },
  });

  // 9. Queue contractor notification job (only for PRIMARY - first in rotation)
  const primaryMatch = matchRecords[0];

  if (primaryMatch) {
    await createJob(
      'CONTRACTOR_NOTIFICATION',
      {
        matchId: primaryMatch.id,
        claimId,
        contractorId: primaryMatch.contractorId,
        urgency: criteria.urgency,
        isPrimary: true,
      },
      {
        priority:
          criteria.urgency === 'emergency' ? 1 : criteria.urgency === 'urgent' ? 2 : 5,
        claimId,
        tenantId: claim.tenantId || undefined,
      }
    );

    console.log(
      `[Contractor Matching - ROTATION] Queued notification for primary contractor ${primaryMatch.contractorId}`
    );
  }

  // 10. Return processor output
  const output: ProcessorOutput = {
    claimId,
    matchingCompleted: true,
    matchedContractorCount: matchRecords.length,
    recommendedContractorId: primaryMatch.contractorId,
    notificationJobsQueued: 1,
    rotationBased: true,
    fallbackUsed,
  };

  console.log(
    `[Contractor Matching - ROTATION] Completed for claim ${claimId}:`,
    output
  );

  return output;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate response deadline based on urgency and priority
 */
function calculateResponseDeadline(
  urgency: 'emergency' | 'urgent' | 'standard' | 'flexible',
  isPrimary: boolean
): Date {
  const now = new Date();
  let minutesToAdd = 0;

  if (urgency === 'emergency') {
    minutesToAdd = isPrimary ? 15 : 5; // 15 min primary, 5 min backup
  } else if (urgency === 'urgent') {
    minutesToAdd = isPrimary ? 30 : 10; // 30 min primary, 10 min backup
  } else if (urgency === 'standard') {
    minutesToAdd = isPrimary ? 120 : 30; // 2 hours primary, 30 min backup
  } else {
    // flexible
    minutesToAdd = isPrimary ? 240 : 60; // 4 hours primary, 1 hour backup
  }

  return new Date(now.getTime() + minutesToAdd * 60000);
}
