import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleUnexpectedError, handleValidationError, createErrorResponse, ErrorCode } from '@/lib/api-errors';
import {
  getNrpgQuizModule,
  verifyTrainingSourcesPresent,
  toClientSafeQuizQuestions,
  gradeNrpgQuizSubmission,
  NRPG_QUIZ_PASSING_SCORE,
} from '@/lib/training/nrp-training';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { certificationAccessDenied } from '@/lib/training/certification-payment';

export const dynamic = 'force-dynamic';

const ALLOWED_ROLES: Array<'CONTRACTOR' | 'ADMIN' | 'SUPER_ADMIN'> = ['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN'];

const TIME_LIMIT_MINUTES = 30;

const paramsSchema = z.object({
  moduleNumber: z.string().regex(/^\d+$/),
});

/**
 * GET — deliver the quiz WITHOUT the answer key (DR-858 N-05, DR-892).
 * Auth required; `correct`/`explanation` are stripped for everyone except
 * ADMIN/SUPER_ADMIN. Grading is server-side only.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ moduleNumber: string }> }) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { user } = auth.context;
    if (!requireRole(user, ALLOWED_ROLES)) {
      return unauthorizedRoleResponse(ALLOWED_ROLES);
    }

    const certificationDenied = await certificationAccessDenied(user);
    if (certificationDenied) return certificationDenied;

    await verifyTrainingSourcesPresent();

    const validation = paramsSchema.safeParse((await context.params));
    if (!validation.success) {
      return handleValidationError(validation.error);
    }

    const moduleNumber = parseInt(validation.data.moduleNumber, 10);
    const quizModule = await getNrpgQuizModule(moduleNumber);

    if (!quizModule) {
      return createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND, 'Quiz module not found', 404);
    }

    // Full answer key only for ADMIN/SUPER_ADMIN; client-safe projection otherwise.
    const isAdmin = requireRole(user, ['ADMIN', 'SUPER_ADMIN']);
    const questions = isAdmin
      ? quizModule.questions
      : toClientSafeQuizQuestions(quizModule.questions);

    return NextResponse.json({
      success: true,
      quiz: {
        moduleNumber,
        name: quizModule.name,
        description: quizModule.description,
        timeLimitMinutes: TIME_LIMIT_MINUTES,
        passingScore: NRPG_QUIZ_PASSING_SCORE,
        questions,
      },
    });
  } catch (error) {
    return handleUnexpectedError(error);
  }
}

const submitSchema = z.object({
  // Map of questionId -> selected option index. Any client-sent score is ignored.
  answers: z.record(z.string(), z.number().int().min(0)),
});

/**
 * POST — grade a submission server-side against the real answer key
 * (DR-858 N-05, DR-892). The client submits only selected answers; the
 * server computes the score. Client-supplied `score`/`passed` fields are
 * never read.
 */
export async function POST(request: NextRequest, context: { params: Promise<{ moduleNumber: string }> }) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { user } = auth.context;
    if (!requireRole(user, ALLOWED_ROLES)) {
      return unauthorizedRoleResponse(ALLOWED_ROLES);
    }

    const certificationDenied = await certificationAccessDenied(user);
    if (certificationDenied) return certificationDenied;

    await verifyTrainingSourcesPresent();

    const validation = paramsSchema.safeParse((await context.params));
    if (!validation.success) {
      return handleValidationError(validation.error);
    }

    const body = await request.json();
    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      return handleValidationError(parsed.error);
    }

    const moduleNumber = parseInt(validation.data.moduleNumber, 10);
    const quizModule = await getNrpgQuizModule(moduleNumber);
    if (!quizModule) {
      return createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND, 'Quiz module not found', 404);
    }

    const grade = gradeNrpgQuizSubmission(quizModule, parsed.data.answers);

    return NextResponse.json({
      success: true,
      result: {
        moduleNumber,
        total: grade.total,
        correctCount: grade.correctCount,
        score: grade.score,
        passingScore: grade.passingScore,
        passed: grade.passed,
        results: grade.results.map((r) => ({
          questionId: r.questionId,
          correct: r.correct,
          // Revealed only AFTER a graded submission.
          correctAnswer: r.correctAnswer,
          explanation: r.explanation,
        })),
      },
    });
  } catch (error) {
    return handleUnexpectedError(error);
  }
}
