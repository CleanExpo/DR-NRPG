import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { handleUnexpectedError, handleValidationError } from '@/lib/api-errors';
import { completeModule } from '@/lib/services/client-onboarding.service';
import { sendModuleCompletionEmail } from '@/lib/services/client-email.service';
import { moduleCompletionSchema } from '@/lib/validations/client-onboarding';
import { getTenantDb } from '@/lib/get-tenant-db';
import { ZodError } from 'zod';
import { SITE_URL } from '@/lib/seo/site-url';

export const dynamic = 'force-dynamic';

/**
 * POST /api/client/onboarding/education/module/complete
 *
 * Mark education module as completed
 * Records quiz score if provided
 * Sends completion email
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;
    
    // Get tenant-scoped database client
    const db = getTenantDb(authResult.context);

    // Check role
    if (!requireRole(user, ['CLIENT', 'ADMIN', 'SUPER_ADMIN'])) {
      return unauthorizedRoleResponse(['CLIENT', 'ADMIN', 'SUPER_ADMIN']);
    }

    // Parse and validate
    const body = await request.json();
    const validated = moduleCompletionSchema.parse(body);

    // Get onboarding record
    const onboarding = await db.clientOnboarding.findUnique({
      where: { clientId: validated.clientId },
      include: {
        moduleProgress: true,
      },
    });

    if (!onboarding) {
      return NextResponse.json(
        { success: false, error: 'Onboarding not initialized' },
        { status: 404 }
      );
    }

    // Complete the module
    const passed = await completeModule(
      onboarding.id,
      validated.moduleId,
      validated.quizScore,
      validated.timeSpentSeconds
    );

    // Get module name
    const moduleProgress = onboarding.moduleProgress.find((m) => m.moduleId === validated.moduleId);
    const moduleName = moduleProgress?.moduleName || validated.moduleId;

    // Find next module
    const allModules = await db.clientModuleProgress.findMany({
      where: { onboardingId: onboarding.id },
      orderBy: { moduleId: 'asc' },
    });

    const currentIndex = allModules.findIndex((m) => m.moduleId === validated.moduleId);
    const nextModule = currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;

    // Send module completion email (non-blocking)
    await sendModuleCompletionEmail({
      clientName: user.name || 'Valued Client',
      clientEmail: user.email,
      moduleName,
      moduleId: validated.moduleId,
      quizScore: validated.quizScore,
      nextModuleLink: nextModule
        ? `${SITE_URL}/dashboard/client/onboarding/education/module/${nextModule.moduleId}`
        : undefined,
    }).catch((err) => {
      console.error('Failed to send module completion email:', err);
    });

    // Check if all modules complete
    const allComplete = allModules.every((m) =>
      m.moduleId === validated.moduleId ? true : m.completed
    );

    return NextResponse.json({
      success: true,
      passed,
      message: passed ? 'Module completed successfully' : 'Module completed (quiz score below 70%)',
      moduleId: validated.moduleId,
      quizScore: validated.quizScore,
      nextModule: nextModule
        ? {
            id: nextModule.moduleId,
            name: nextModule.moduleName,
            url: `/dashboard/client/onboarding/education/module/${nextModule.moduleId}`,
          }
        : null,
      allModulesComplete: allComplete,
      completionUrl: allComplete ? '/dashboard/client/onboarding/complete' : undefined,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error);
    }
    return handleUnexpectedError(error);
  }
}
