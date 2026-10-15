import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { handleUnexpectedError, handleValidationError } from '@/lib/api-errors';
import { completePhase } from '@/lib/services/client-onboarding.service';
import { sendPhaseCompletionEmail } from '@/lib/services/client-email.service';
import { servicePreferencesSchema } from '@/lib/validations/client-onboarding';
import { getTenantDb } from '@/lib/get-tenant-db';
import { ZodError } from 'zod';
import { getUserReturnOrigin } from '@/lib/tenant-return-origin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/client/onboarding/services
 *
 * Save Phase 2: Service preferences
 * Updates UserPreferences with service types, urgency, budget
 * Completes services phase and advances to property
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
    const validated = servicePreferencesSchema.parse(body);

    // Update user preferences
    // Map to existing schema fields and store extras in dashboardLayout
    const serviceExtras = {
      serviceFrequency: validated.serviceFrequency,
      pastServiceExperience: validated.pastServiceExperience,
      emergencyContactAvailable: validated.emergencyContactAvailable,
    };

    await db.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        serviceTypes: validated.primaryServiceTypes,
        urgencyLevel: validated.urgencyPreference,
        budgetRange: validated.typicalBudgetRange,
        dashboardLayout: serviceExtras,
      },
      create: {
        userId: user.id,
        serviceTypes: validated.primaryServiceTypes,
        urgencyLevel: validated.urgencyPreference,
        budgetRange: validated.typicalBudgetRange,
        dashboardLayout: serviceExtras,
      },
    });

    // Complete phase
    const result = await completePhase(user.id, 'services');

    // Send phase completion email (non-blocking)
    await sendPhaseCompletionEmail({
      clientName: user.name || 'Valued Client',
      clientEmail: user.email,
      phaseName: 'Service Preferences',
      phaseNumber: 2,
      completionPercentage: result.completionPercentage,
      nextPhaseName: result.nextPhase ? 'Property Details' : undefined,
      nextPhaseUrl: result.nextPhase ? `${await getUserReturnOrigin(user)}/dashboard/client/onboarding/${result.nextPhase}` : undefined,
      estimatedMinutes: 5,
    }).catch((err) => {
      console.error('Failed to send phase completion email:', err);
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      nextPhase: result.nextPhase,
      nextPhaseUrl: result.nextPhase ? `/dashboard/client/onboarding/${result.nextPhase}` : '/dashboard/client/onboarding/checklist',
      completionPercentage: result.completionPercentage,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error);
    }
    return handleUnexpectedError(error);
  }
}
