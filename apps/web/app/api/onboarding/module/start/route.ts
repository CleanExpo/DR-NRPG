import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getTenantDb } from '@/lib/get-tenant-db';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { handleUnexpectedError, handleValidationError, createErrorResponse, ErrorCode } from '@/lib/api-errors';
import { certificationAccessDenied } from '@/lib/training/certification-payment';

export const dynamic = 'force-dynamic';

const startSchema = z.object({
  moduleId: z.string().min(1),
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

    const body = await request.json().catch(() => ({}));
    const validation = startSchema.safeParse(body);
    if (!validation.success) {
      return handleValidationError(validation.error);
    }

    const onboarding = await db.contractorOnboarding.findUnique({
      where: { contractorId: user.id },
      include: { moduleProgress: true },
    });

    if (!onboarding) {
      return createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND, 'Onboarding not found', 404);
    }

    const moduleProgress = onboarding.moduleProgress.find((m) => m.moduleId === validation.data.moduleId);
    if (!moduleProgress) {
      return createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND, 'Module not found for contractor onboarding', 404);
    }

    if (moduleProgress.status === 'NOT_STARTED') {
      await db.contractorModuleProgress.update({
        where: { id: moduleProgress.id },
        data: {
          status: 'IN_PROGRESS',
          startedAt: moduleProgress.startedAt ?? new Date(),
          progress: Math.max(moduleProgress.progress, 1),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleUnexpectedError(error);
  }
}

