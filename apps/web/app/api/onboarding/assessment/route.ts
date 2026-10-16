import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getTenantDb } from '@/lib/get-tenant-db';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { handleUnexpectedError, handleValidationError, createErrorResponse, ErrorCode } from '@/lib/api-errors';
import {
  getNrpgQuizModule,
  parseNrpgModuleNumber,
  gradeNrpgQuizSubmission,
} from '@/lib/training/nrp-training';
import {
  NRPG_CERTIFICATION_NAME,
  NRPG_CERTIFICATION_NAMES,
  getNrpgCertificationExpiryDate,
  isNrpgTrainingSetComplete,
  evaluateNrpgRetakePolicy,
} from '@/lib/training/training-policy';
import { certificationAccessDenied } from '@/lib/training/certification-payment';

export const dynamic = 'force-dynamic';

/**
 * DR-892: the client submits ANSWERS, never a score. Any extra fields (e.g. a
 * forged `score`/`passed`) are dropped by the schema and never read — the
 * stored score is always recomputed server-side from the sealed answer key.
 */
const assessmentSchema = z.object({
  contractorId: z.string().min(1),
  moduleId: z.string().min(1),
  // Map of questionId -> selected option index.
  answers: z.record(z.string(), z.number().int().min(0)),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;

    const db = getTenantDb(authResult.context);

    if (!requireRole(user, ['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN'])) {
      return unauthorizedRoleResponse(['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN']);
    }

    const certificationDenied = await certificationAccessDenied(user);
    if (certificationDenied) return certificationDenied;

    const body = await request.json();
    const validation = assessmentSchema.safeParse(body);
    if (!validation.success) {
      return handleValidationError(validation.error);
    }

    const { contractorId, moduleId, answers } = validation.data;
    const effectiveContractorId = user.userType === 'CONTRACTOR' ? user.id : contractorId;

    if (user.userType === 'CONTRACTOR' && contractorId !== user.id) {
      return createErrorResponse(ErrorCode.FORBIDDEN, 'Unauthorized assessment submission', 403);
    }

    // Server-side grading against the sealed answer key (DR-892).
    const moduleNumber = parseNrpgModuleNumber(moduleId);
    if (!moduleNumber) {
      return createErrorResponse(ErrorCode.INVALID_INPUT, 'Unsupported moduleId for assessment', 400, { moduleId });
    }

    const quizModule = await getNrpgQuizModule(moduleNumber);
    if (!quizModule) {
      return createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND, 'Quiz module not found', 404, { moduleId });
    }

    const grade = gradeNrpgQuizSubmission(quizModule, answers);

    const onboarding = await db.contractorOnboarding.findUnique({
      where: { contractorId: effectiveContractorId },
      include: { moduleProgress: true },
    });

    if (!onboarding) {
      return createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND, 'Onboarding not found', 404);
    }

    const moduleProgress = onboarding.moduleProgress.find(m => m.moduleId === moduleId);
    if (!moduleProgress) {
      return createErrorResponse(ErrorCode.INVALID_INPUT, 'Module not found for contractor onboarding', 400);
    }

    // Progression follows the canonical module number (NRP-001..024), never row
    // chronology: backfilled rows carry a fixed createdAt that can predate the
    // contractor's original rows. createdAt only breaks ties between ids that
    // do not parse as NRP-nnn.
    const ordered = [...onboarding.moduleProgress].sort(
      (a, b) =>
        (parseNrpgModuleNumber(a.moduleId) ?? Number.MAX_SAFE_INTEGER) -
          (parseNrpgModuleNumber(b.moduleId) ?? Number.MAX_SAFE_INTEGER) ||
        a.createdAt.getTime() - b.createdAt.getTime()
    );
    const current = ordered.find((m) => m.status !== 'COMPLETED') ?? null;
    const isAllowed =
      (current && current.moduleId === moduleId) ||
      moduleProgress.status === 'IN_PROGRESS' ||
      moduleProgress.status === 'FAILED';

    if (!isAllowed) {
      return createErrorResponse(
        ErrorCode.INVALID_INPUT,
        'Module assessment is locked until previous modules are completed',
        400,
        { currentModuleId: current?.moduleId ?? null }
      );
    }

    // DR-894: server-side retake policy — attempt cap + cooldown, evaluated
    // off the persisted ContractorAssessment rows for this module (voided rows
    // from an admin reset never count). Rejected BEFORE anything persists.
    const submittedAt = new Date();
    const priorAttempts = await db.contractorAssessment.findMany({
      where: { onboardingId: onboarding.id, moduleId },
      select: { score: true, completedAt: true, createdAt: true, feedback: true },
    });
    const retakeDecision = evaluateNrpgRetakePolicy(priorAttempts, submittedAt);

    if (!retakeDecision.allowed) {
      if (retakeDecision.reason === 'ATTEMPT_CAP') {
        return createErrorResponse(
          ErrorCode.FORBIDDEN,
          'Maximum attempts reached for this module — locked pending admin review',
          403,
          {
            reason: 'ATTEMPT_CAP',
            attemptsUsed: retakeDecision.attemptsUsed,
            attemptsRemaining: 0,
            maxAttempts: retakeDecision.maxAttempts,
            retryAt: null,
          }
        );
      }

      const retryAt = retakeDecision.retryAt as Date;
      const response = createErrorResponse(
        ErrorCode.RATE_LIMITED,
        'Retake cooldown is still active for this module',
        429,
        {
          reason: 'COOLDOWN',
          attemptsUsed: retakeDecision.attemptsUsed,
          attemptsRemaining: retakeDecision.attemptsRemaining,
          maxAttempts: retakeDecision.maxAttempts,
          retryAt: retryAt.toISOString(),
        }
      );
      response.headers.set(
        'Retry-After',
        String(Math.max(1, Math.ceil((retryAt.getTime() - submittedAt.getTime()) / 1000)))
      );
      return response;
    }

    const { score, passingScore, passed } = grade;

    await db.$transaction(async (tx) => {
      await tx.contractorAssessment.create({
        data: {
          onboardingId: onboarding.id,
          moduleId,
          assessmentType: 'QUIZ',
          score,
          maxScore: 100,
          completedAt: new Date(),
          feedback: passed ? 'Passed' : 'Needs review',
        },
      });

      await tx.contractorModuleProgress.update({
        where: { id: moduleProgress.id },
        data: {
          startedAt: moduleProgress.startedAt ?? new Date(),
          completedAt: passed ? new Date() : null,
          completed: passed,
          status: passed ? 'COMPLETED' : 'FAILED',
          progress: passed ? 100 : Math.max(moduleProgress.progress, 25),
        },
      });

      const refreshed = await tx.contractorModuleProgress.findMany({
        where: { onboardingId: onboarding.id },
        select: { moduleId: true, status: true },
      });

      // DR-893: completion is SET-EQUALITY against the canonical NRP-001..024
      // module set — a count-based check is forgeable with duplicate rows and
      // passes short-seeded onboardings (e.g. 5/5).
      const passedModuleIds = refreshed
        .filter((m) => m.status === 'COMPLETED')
        .map((m) => m.moduleId);
      const allComplete = isNrpgTrainingSetComplete(passedModuleIds);

      await tx.contractorOnboarding.update({
        where: { id: onboarding.id },
        data: allComplete
          ? { status: 'COMPLETED', actualCompletionDate: new Date() }
          : { status: 'IN_PROGRESS' },
      });

      if (allComplete) {
        // DR-893: auto-issue the certification on genuine completion. Idempotent —
        // scoped to a LIVE cert so re-completion never duplicates a row, while a
        // renewal after expiry issues a fresh row (audit history preserved).
        // The schema has no unique key for the live cert, so serialize issuance
        // per contractor with a transaction-scoped advisory lock — concurrent
        // final submissions cannot both pass the findFirst gate.
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`cert:${effectiveContractorId}`}))`;
        const issueDate = new Date();
        const existingCert = await tx.contractorCertification.findFirst({
          where: {
            contractorId: effectiveContractorId,
            certificationName: { in: [...NRPG_CERTIFICATION_NAMES] },
            expiryDate: { gt: issueDate },
            // Legacy rows predating DR-893 are unverified; they must not block
            // a genuine re-completion from issuing the verified cert that
            // dispatch eligibility requires.
            verified: true,
          },
          select: { id: true },
        });

        if (!existingCert) {
          await tx.contractorCertification.create({
            data: {
              contractorId: effectiveContractorId,
              certificationName: NRPG_CERTIFICATION_NAME,
              certificationLevel: 1,
              issueDate,
              // Validity comes from the single policy source.
              expiryDate: getNrpgCertificationExpiryDate(issueDate),
              specializations: onboarding.specialization ? [onboarding.specialization] : [],
              // Server-side grading of all 24 modules IS the verification.
              verified: true,
            },
          });
        }
      }
    });

    // DR-894: recompute the retake state INCLUDING this submission so the UI
    // (DR-919) can render attempts remaining / lockout / cooldown countdown.
    const postDecision = evaluateNrpgRetakePolicy(
      [
        ...priorAttempts,
        { score, completedAt: submittedAt, createdAt: submittedAt, feedback: passed ? 'Passed' : 'Needs review' },
      ],
      submittedAt
    );
    const locked = postDecision.reason === 'ATTEMPT_CAP';

    return NextResponse.json({
      success: true,
      passed,
      score,
      passingScore,
      retake: {
        maxAttempts: postDecision.maxAttempts,
        attemptsUsed: postDecision.attemptsUsed,
        attemptsRemaining: postDecision.attemptsRemaining,
        locked,
        cooldownUntil:
          !passed && !locked && postDecision.retryAt ? postDecision.retryAt.toISOString() : null,
      },
      result: {
        total: grade.total,
        correctCount: grade.correctCount,
        // Per-question key material is revealed only AFTER a graded submission.
        results: grade.results,
      },
    });
  } catch (error) {
    return handleUnexpectedError(error);
  }
}
