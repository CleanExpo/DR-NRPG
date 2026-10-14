/**
 * NRPG Onboarding Phases API
 * GET: Retrieve contractor's phase progress (admins may pass ?contractorId=)
 * PATCH: Update phase checklist items
 *
 * Checklist integrity (DR-895):
 *  - Contractors may only set fields that are theirs to attest
 *    (CONTRACTOR_ATTESTABLE_PHASE_FIELDS); admin-attested fields return 403
 *    for contractor callers with NO state change.
 *  - standardsTrainingComplete and commitmentSigned are DERIVED server-side
 *    from real training/commitment records and are never accepted from any
 *    client (400).
 *  - No invalid skips: a phase-N checklist item can only be set once phases
 *    1..N-1 are complete; phase status transitions cascade strictly in order.
 *  - Phase 4 probation (90-day): probationEndDate is recorded when Phase 4
 *    begins; fullCertificationGranted is rejected before probationEndDate has
 *    passed or while performanceReviewScore is below threshold. The day-90
 *    auto-review is a pure derivation surfaced on GET (probation.reviewDue).
 *  - Rows are keyed on the canonical lifecycle key contractorId === User.id
 *    (DR-879 Option B, lib/contractor-identity) — the previous Contractor.id
 *    keying orphaned this route from the commitment route's phase sync.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { PrismaClient, NRPGOnboardingPhase } from '@prisma/client';

import { authenticateRequest, requireRole } from '@/lib/auth-middleware';
import { getTenantDb } from '@/lib/get-tenant-db';
import { contractorKey } from '@/lib/contractor-identity';
import {
  createErrorResponse,
  ErrorCode,
  handleUnexpectedError,
  handleValidationError,
} from '@/lib/api-errors';
import { logAuditEvent } from '@/lib/services/audit.service';
import {
  isNrpgTrainingSetComplete,
  NRPG_CERTIFICATION_NAMES,
} from '@/lib/training/training-policy';
import {
  ADMIN_ONLY_PHASE_FIELDS,
  canGrantFullCertification,
  CONTRACTOR_ATTESTABLE_PHASE_FIELDS,
  DERIVED_PHASE_FIELDS,
  deriveProbationStatus,
  getProbationEndDate,
  isCommitmentSignatureCurrent,
  PHASE_FIELD_PHASE,
} from '@/lib/training/nrpg-phase-policy';

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const patchSchema = z
  .object({
    /** Target contractor lifecycle key (User.id) — ADMIN/SUPER_ADMIN only. */
    contractorId: z.string().min(1).optional(),
    // Phase 1
    applicationSubmitted: z.boolean().optional(),
    eligibilityReviewed: z.boolean().optional(),
    backgroundCheckInitiated: z.boolean().optional(),
    // Phase 2
    carsiOnboarded: z.boolean().optional(),
    associationIntegrated: z.boolean().optional(),
    competencyVerified: z.boolean().optional(),
    // Phase 3 (standardsTrainingComplete/commitmentSigned are DERIVED — kept
    // in the schema so an attempt is rejected with a clear payload, not
    // silently stripped)
    standardsTrainingComplete: z.boolean().optional(),
    commitmentSigned: z.boolean().optional(),
    platformActivated: z.boolean().optional(),
    // Phase 4
    performanceReviewScore: z.number().int().min(0).max(100).optional(),
    fullCertificationGranted: z.boolean().optional(),
    // Background-check summary (admin bookkeeping)
    allChecksPass: z.boolean().optional(),
  })
  .strict();

type PatchInput = z.infer<typeof patchSchema>;

// ---------------------------------------------------------------------------
// Derived checklist facts (never client-supplied)
// ---------------------------------------------------------------------------

interface DerivedChecklistFacts {
  standardsTrainingComplete: boolean;
  commitmentSigned: boolean;
}

/**
 * standardsTrainingComplete := ContractorOnboarding.status === COMPLETED
 *   AND the completed module set EQUALS the canonical 24 (training-policy)
 *   AND a live verified NRPG Contractor Certification exists.
 * commitmentSigned := a signed NRPGCommitment row within annual validity.
 */
async function deriveChecklistFacts(
  db: PrismaClient,
  contractorId: string,
  now: Date
): Promise<DerivedChecklistFacts> {
  const [onboarding, liveCert, commitment] = await Promise.all([
    db.contractorOnboarding.findUnique({
      where: { contractorId },
      select: {
        status: true,
        moduleProgress: { select: { moduleId: true, status: true } },
      },
    }),
    db.contractorCertification.findFirst({
      where: {
        contractorId,
        certificationName: { in: [...NRPG_CERTIFICATION_NAMES] },
        verified: true,
        expiryDate: { gt: now },
      },
      select: { id: true },
    }),
    db.nRPGCommitment.findUnique({
      where: { contractorId },
      select: { signedAt: true },
    }),
  ]);

  const completedModuleIds =
    onboarding?.moduleProgress
      .filter((m) => m.status === 'COMPLETED')
      .map((m) => m.moduleId) ?? [];

  return {
    standardsTrainingComplete:
      onboarding?.status === 'COMPLETED' &&
      isNrpgTrainingSetComplete(completedModuleIds) &&
      liveCert != null,
    commitmentSigned: isCommitmentSignatureCurrent(commitment?.signedAt, now),
  };
}

// ---------------------------------------------------------------------------
// Phase ordering helpers
// ---------------------------------------------------------------------------

type ChecklistState = Pick<
  NRPGOnboardingPhase,
  | 'applicationSubmitted'
  | 'eligibilityReviewed'
  | 'backgroundCheckInitiated'
  | 'carsiOnboarded'
  | 'associationIntegrated'
  | 'competencyVerified'
  | 'standardsTrainingComplete'
  | 'commitmentSigned'
  | 'platformActivated'
>;

function phase1ItemsDone(s: ChecklistState): boolean {
  return s.applicationSubmitted && s.eligibilityReviewed && s.backgroundCheckInitiated;
}
function phase2ItemsDone(s: ChecklistState): boolean {
  return s.carsiOnboarded && s.associationIntegrated && s.competencyVerified;
}
function phase3ItemsDone(s: ChecklistState): boolean {
  return s.standardsTrainingComplete && s.commitmentSigned && s.platformActivated;
}

/** Prerequisites for touching a phase-N item: all earlier phases complete. */
function prerequisitesMet(state: ChecklistState, phase: 1 | 2 | 3 | 4): boolean {
  if (phase >= 2 && !phase1ItemsDone(state)) return false;
  if (phase >= 3 && !phase2ItemsDone(state)) return false;
  if (phase >= 4 && !phase3ItemsDone(state)) return false;
  return true;
}

function getCurrentPhase(phases: NRPGOnboardingPhase): number {
  if (phases.phase4Status === 'IN_PROGRESS') return 4;
  if (phases.phase3Status === 'IN_PROGRESS' || phases.phase3Status === 'NOT_STARTED') return 3;
  if (phases.phase2Status === 'IN_PROGRESS' || phases.phase2Status === 'NOT_STARTED') return 2;
  return 1;
}

function calculateOverallProgress(phases: NRPGOnboardingPhase): number {
  let completed = 0;
  const total = 12; // 3 items per phase × 4 phases

  if (phases.applicationSubmitted) completed++;
  if (phases.eligibilityReviewed) completed++;
  if (phases.backgroundCheckInitiated) completed++;
  if (phases.carsiOnboarded) completed++;
  if (phases.associationIntegrated) completed++;
  if (phases.competencyVerified) completed++;
  if (phases.standardsTrainingComplete) completed++;
  if (phases.commitmentSigned) completed++;
  if (phases.platformActivated) completed++;
  if (phases.fullCertificationGranted) completed += 3;
  else if (phases.phase4Status === 'IN_PROGRESS') completed += 1;

  return Math.round((completed / total) * 100);
}

/**
 * Auto-update phase transition statuses after a checklist item changes.
 * Transitions cascade strictly in order: a later phase can only complete when
 * every earlier phase's items are complete (no invalid skips even for legacy
 * rows with out-of-order flags). db must be passed explicitly — it is NOT
 * available at module scope.
 */
async function updatePhaseStatuses(contractorId: string, db: PrismaClient): Promise<void> {
  const phases = await db.nRPGOnboardingPhase.findUnique({
    where: { contractorId },
  });

  if (!phases) return;

  const updates: Partial<NRPGOnboardingPhase> = {};
  const now = new Date();

  const phase1Complete = phase1ItemsDone(phases);
  const phase2Complete = phase1Complete && phase2ItemsDone(phases);
  const phase3Complete = phase2Complete && phase3ItemsDone(phases);

  // Phase 1 → Phase 2 transition
  if (phase1Complete && phases.phase1Status !== 'COMPLETED') {
    updates.phase1Status = 'COMPLETED';
    updates.phase1CompleteDate = now;
    updates.phase2Status = 'IN_PROGRESS';
    updates.phase2StartDate = now;
  } else if (
    !phase1Complete &&
    (phases.applicationSubmitted || phases.eligibilityReviewed || phases.backgroundCheckInitiated) &&
    phases.phase1Status === 'NOT_STARTED'
  ) {
    updates.phase1Status = 'IN_PROGRESS';
    updates.phase1StartDate = now;
  }

  // Phase 2 → Phase 3 transition (requires phase 1 complete)
  if (phase2Complete && phases.phase2Status !== 'COMPLETED') {
    updates.phase2Status = 'COMPLETED';
    updates.phase2CompleteDate = now;
    updates.phase3Status = 'IN_PROGRESS';
    updates.phase3StartDate = now;
  }

  // Phase 3 → Phase 4 transition (requires phases 1-2 complete).
  // Probation starts when Phase 4 begins: 90-day window recorded here.
  if (phase3Complete && phases.phase3Status !== 'COMPLETED') {
    updates.phase3Status = 'COMPLETED';
    updates.phase3CompleteDate = now;
    updates.phase4Status = 'IN_PROGRESS';
    updates.phase4StartDate = now;
    updates.probationEndDate = getProbationEndDate(now);
  }

  // Phase 4 completion — fullCertificationGranted is only ever accepted via
  // the gated PATCH below (admin, probation elapsed, score >= threshold).
  if (phase3Complete && phases.fullCertificationGranted && phases.phase4Status !== 'COMPLETED') {
    updates.phase4Status = 'COMPLETED';
    updates.phase4CompleteDate = now;
    updates.overallStatus = 'COMPLETED';
  }

  // Overall status
  if (phase1Complete || phase2Complete || phase3Complete) {
    if (updates.overallStatus !== 'COMPLETED') {
      updates.overallStatus = 'IN_PROGRESS';
    }
  }

  if (Object.keys(updates).length > 0) {
    await db.nRPGOnboardingPhase.update({
      where: { contractorId },
      data: updates,
    });
  }
}

// ---------------------------------------------------------------------------
// Response shaping
// ---------------------------------------------------------------------------

function buildPhaseSummary(phases: NRPGOnboardingPhase, now: Date) {
  const probation = deriveProbationStatus(phases, now);

  return {
    phase1: {
      status: phases.phase1Status,
      startDate: phases.phase1StartDate,
      completeDate: phases.phase1CompleteDate,
      checklist: [
        { key: 'applicationSubmitted', label: 'Application Submitted', complete: phases.applicationSubmitted },
        { key: 'eligibilityReviewed', label: 'Eligibility Reviewed', complete: phases.eligibilityReviewed },
        { key: 'backgroundCheckInitiated', label: 'Background Check Initiated', complete: phases.backgroundCheckInitiated },
      ],
      completedItems: [phases.applicationSubmitted, phases.eligibilityReviewed, phases.backgroundCheckInitiated].filter(Boolean).length,
      totalItems: 3,
    },
    phase2: {
      status: phases.phase2Status,
      startDate: phases.phase2StartDate,
      completeDate: phases.phase2CompleteDate,
      checklist: [
        { key: 'carsiOnboarded', label: 'CARSI Platform Onboarded', complete: phases.carsiOnboarded },
        { key: 'associationIntegrated', label: 'Association Integrated', complete: phases.associationIntegrated },
        { key: 'competencyVerified', label: 'Competency Verified', complete: phases.competencyVerified },
      ],
      completedItems: [phases.carsiOnboarded, phases.associationIntegrated, phases.competencyVerified].filter(Boolean).length,
      totalItems: 3,
    },
    phase3: {
      status: phases.phase3Status,
      startDate: phases.phase3StartDate,
      completeDate: phases.phase3CompleteDate,
      checklist: [
        { key: 'standardsTrainingComplete', label: 'Standards Training Complete', complete: phases.standardsTrainingComplete },
        { key: 'commitmentSigned', label: 'Commitment Framework Signed', complete: phases.commitmentSigned },
        { key: 'platformActivated', label: 'Platform Activated', complete: phases.platformActivated },
      ],
      completedItems: [phases.standardsTrainingComplete, phases.commitmentSigned, phases.platformActivated].filter(Boolean).length,
      totalItems: 3,
    },
    phase4: {
      status: phases.phase4Status,
      startDate: phases.phase4StartDate,
      completeDate: phases.phase4CompleteDate,
      probationEndDate: phases.probationEndDate,
      performanceReviewScore: phases.performanceReviewScore,
      fullCertificationGranted: phases.fullCertificationGranted,
      daysRemaining: phases.probationEndDate
        ? Math.max(0, Math.ceil((new Date(phases.probationEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : null,
      // Day-90 auto-review, derived server-side on every read (DR-895).
      // probation.reviewDue is the admin-queue flag.
      probation,
    },
    backgroundChecks: {
      criminal: { status: phases.criminalCheckStatus, date: phases.criminalCheckDate, ref: phases.criminalCheckRef },
      financial: { status: phases.financialCheckStatus, date: phases.financialCheckDate, ref: phases.financialCheckRef },
      professional: { status: phases.professionalCheckStatus, date: phases.professionalCheckDate, ref: phases.professionalCheckRef },
      insurance: { status: phases.insuranceCheckStatus, date: phases.insuranceCheckDate, ref: phases.insuranceCheckRef },
      allPass: phases.allChecksPass,
    },
    overall: {
      status: phases.overallStatus,
      currentPhase: getCurrentPhase(phases),
      percentComplete: calculateOverallProgress(phases),
    },
  };
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;
    const db = getTenantDb(authResult.context);
    const isAdmin = requireRole(user, ['ADMIN', 'SUPER_ADMIN']);
    const now = new Date();

    // Admins may read any contractor's phases (?contractorId= is the
    // lifecycle key, User.id); contractors always read their own.
    const requestedId = request.nextUrl.searchParams.get('contractorId');
    let targetId: string;

    if (isAdmin && requestedId) {
      targetId = requestedId;
    } else {
      const contractor = await db.contractor.findFirst({
        where: { userId: user.id },
        select: { id: true },
      });
      if (!contractor) {
        return NextResponse.json({ success: false, error: 'Contractor not found' }, { status: 404 });
      }
      targetId = contractorKey(user);
    }

    // Get or create phase record (create only for the caller's own record)
    let phases = await db.nRPGOnboardingPhase.findUnique({
      where: { contractorId: targetId },
    });

    if (!phases) {
      if (isAdmin && requestedId) {
        return createErrorResponse(
          ErrorCode.RESOURCE_NOT_FOUND,
          'Onboarding phases not found for contractor',
          404
        );
      }
      phases = await db.nRPGOnboardingPhase.create({
        data: {
          contractorId: targetId,
          phase1Status: 'NOT_STARTED',
          phase2Status: 'NOT_STARTED',
          phase3Status: 'NOT_STARTED',
          phase4Status: 'NOT_STARTED',
          overallStatus: 'NOT_STARTED',
        },
      });
    }

    // Overlay server-derived facts — the stored flags are a cache; the truth
    // is always recomputed from training/commitment records on read.
    const derived = await deriveChecklistFacts(db, targetId, now);
    const effectivePhases: NRPGOnboardingPhase = { ...phases, ...derived };

    return NextResponse.json({
      success: true,
      data: {
        phases: effectivePhases,
        summary: buildPhaseSummary(effectivePhases, now),
      },
    });
  } catch (error) {
    return handleUnexpectedError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;
    const db = getTenantDb(authResult.context);
    const isAdmin = requireRole(user, ['ADMIN', 'SUPER_ADMIN']);

    if (!isAdmin && !requireRole(user, ['CONTRACTOR'])) {
      return createErrorResponse(
        ErrorCode.FORBIDDEN,
        'Access denied. Required roles: CONTRACTOR, ADMIN, SUPER_ADMIN',
        403
      );
    }

    const body = await request.json();
    const validation = patchSchema.safeParse(body);
    if (!validation.success) {
      return handleValidationError(validation.error);
    }

    const input: PatchInput = validation.data;
    const now = new Date();

    // ---- Checklist integrity: derived fields are never client-settable ----
    const derivedAttempted = DERIVED_PHASE_FIELDS.filter((f) => input[f] !== undefined);
    if (derivedAttempted.length > 0) {
      return createErrorResponse(
        ErrorCode.INVALID_INPUT,
        'These checklist fields are derived by the server from training and commitment records and cannot be set directly',
        400,
        { rejectedFields: derivedAttempted }
      );
    }

    // ---- Checklist integrity: admin-attested fields need ADMIN/SUPER_ADMIN ----
    const adminOnlyAttempted = ADMIN_ONLY_PHASE_FIELDS.filter((f) => input[f] !== undefined);
    if (!isAdmin && adminOnlyAttempted.length > 0) {
      return createErrorResponse(
        ErrorCode.FORBIDDEN,
        'These checklist fields are admin-attested and require ADMIN or SUPER_ADMIN',
        403,
        { rejectedFields: adminOnlyAttempted }
      );
    }

    // ---- Resolve the target lifecycle key (contractorId === User.id) ----
    let targetId: string;
    if (isAdmin) {
      if (!input.contractorId) {
        return createErrorResponse(
          ErrorCode.MISSING_FIELDS,
          'contractorId is required for admin phase updates',
          400
        );
      }
      targetId = input.contractorId;
    } else {
      if (input.contractorId && input.contractorId !== contractorKey(user)) {
        return createErrorResponse(
          ErrorCode.FORBIDDEN,
          'Contractors may only update their own onboarding phases',
          403
        );
      }
      const contractor = await db.contractor.findFirst({
        where: { userId: user.id },
        select: { id: true },
      });
      if (!contractor) {
        return NextResponse.json({ success: false, error: 'Contractor not found' }, { status: 404 });
      }
      targetId = contractorKey(user);
    }

    // ---- Load (or initialise for the contractor's own record) ----
    let phases = await db.nRPGOnboardingPhase.findUnique({
      where: { contractorId: targetId },
    });

    if (!phases) {
      if (isAdmin) {
        return createErrorResponse(
          ErrorCode.RESOURCE_NOT_FOUND,
          'Onboarding phases not found for contractor',
          404
        );
      }
      phases = await db.nRPGOnboardingPhase.create({
        data: {
          contractorId: targetId,
          phase1Status: 'NOT_STARTED',
          phase2Status: 'NOT_STARTED',
          phase3Status: 'NOT_STARTED',
          phase4Status: 'NOT_STARTED',
          overallStatus: 'NOT_STARTED',
        },
      });
    }

    // ---- Recompute derived facts and evaluate ordering on effective state ----
    const derived = await deriveChecklistFacts(db, targetId, now);
    const effective: NRPGOnboardingPhase = { ...phases, ...derived };

    const updateData: Partial<NRPGOnboardingPhase> = {};

    // Persist derived-fact sync so phase transitions read accurate flags
    // (the server, not the client, flips these).
    if (derived.standardsTrainingComplete !== phases.standardsTrainingComplete) {
      updateData.standardsTrainingComplete = derived.standardsTrainingComplete;
    }
    if (derived.commitmentSigned !== phases.commitmentSigned) {
      updateData.commitmentSigned = derived.commitmentSigned;
    }

    // Apply requested fields in phase order so an in-batch cascade
    // (e.g. completing phase 1 and starting phase 2 in one PATCH) is allowed,
    // but a skip over an incomplete phase is not.
    const settableFields = [
      ...CONTRACTOR_ATTESTABLE_PHASE_FIELDS,
      ...ADMIN_ONLY_PHASE_FIELDS,
    ].filter((f) => input[f] !== undefined);
    settableFields.sort((a, b) => (PHASE_FIELD_PHASE[a] ?? 0) - (PHASE_FIELD_PHASE[b] ?? 0));

    for (const field of settableFields) {
      const value = input[field] as boolean | number;
      const phase = PHASE_FIELD_PHASE[field];

      // Only ADVANCING writes are order-gated; clearing a flag is always OK.
      const isAdvancing = typeof value === 'number' ? true : value === true;
      if (phase && isAdvancing && !prerequisitesMet(effective, phase)) {
        return createErrorResponse(
          ErrorCode.INVALID_INPUT,
          `Cannot set ${field}: phase ${phase} prerequisites are not complete (phases must be completed in order)`,
          400,
          { field, phase }
        );
      }

      // Phase 4 probation gate: grant blocked before day 90 / below threshold.
      if (field === 'fullCertificationGranted' && value === true) {
        const gate = canGrantFullCertification(
          {
            probationEndDate: effective.probationEndDate,
            performanceReviewScore:
              input.performanceReviewScore ?? effective.performanceReviewScore,
          },
          now
        );
        if (!gate.allowed) {
          return createErrorResponse(ErrorCode.INVALID_INPUT, gate.reason, 400, {
            field: 'fullCertificationGranted',
          });
        }
      }

      (effective as Record<string, unknown>)[field] = value;
      (updateData as Record<string, unknown>)[field] = value;
    }

    if (Object.keys(updateData).length > 0) {
      await db.nRPGOnboardingPhase.update({
        where: { contractorId: targetId },
        data: updateData,
      });
    }

    // Auto-update phase transition statuses — pass db explicitly
    await updatePhaseStatuses(targetId, db);

    const updatedPhases = await db.nRPGOnboardingPhase.findUnique({
      where: { contractorId: targetId },
    });

    // Audit admin attestations (existing audit mechanism, ADMIN_ACTION)
    if (isAdmin && adminOnlyAttempted.length > 0) {
      await logAuditEvent({
        userId: user.id,
        action: 'ADMIN_ACTION',
        resourceId: targetId,
        resourceType: 'NRPGOnboardingPhase',
        status: 'SUCCESS',
        details: {
          route: 'PATCH /api/onboarding/nrpg/phases',
          fields: Object.fromEntries(adminOnlyAttempted.map((f) => [f, input[f]])),
        },
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent') ?? 'unknown',
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedPhases,
      probation: updatedPhases ? deriveProbationStatus(updatedPhases, now) : null,
    });
  } catch (error) {
    return handleUnexpectedError(error);
  }
}
