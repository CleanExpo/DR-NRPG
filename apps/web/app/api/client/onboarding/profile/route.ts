import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { handleUnexpectedError, handleValidationError } from '@/lib/api-errors';
import { completePhase, detectAndAssignTier } from '@/lib/services/client-onboarding.service';
import { sendPhaseCompletionEmail } from '@/lib/services/client-email.service';
import { profileSetupSchema } from '@/lib/validations/client-onboarding';
import { getTenantDb } from '@/lib/get-tenant-db';
import { ZodError } from 'zod';
import { SITE_URL } from '@/lib/seo/site-url';

export const dynamic = 'force-dynamic';

/**
 * POST /api/client/onboarding/profile
 *
 * Save Phase 1: Profile setup
 * Updates ClientProfile and User records
 * Completes profile phase and advances to services
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
    const validated = profileSetupSchema.parse(body);

    // Update user record with full name
    await db.user.update({
      where: { id: user.id },
      data: { name: validated.fullName },
    });

    // Update or create client profile
    await db.clientProfile.upsert({
      where: { userId: user.id },
      update: {
        displayName: validated.displayName,
        phoneNumber: validated.phoneNumber,
        preferredContactMethod: validated.preferredContactMethod,
        timezone: validated.timezone,
        propertyOwnershipStatus: validated.propertyOwnershipStatus,
        isProfileComplete: true,
      },
      create: {
        userId: user.id,
        displayName: validated.displayName,
        phoneNumber: validated.phoneNumber,
        preferredContactMethod: validated.preferredContactMethod,
        timezone: validated.timezone,
        propertyOwnershipStatus: validated.propertyOwnershipStatus,
        isProfileComplete: true,
        tier: 'standard',
      },
    });

    // Detect and assign tier (property manager gets special treatment)
    await detectAndAssignTier(user.id);

    // Complete phase
    const result = await completePhase(user.id, 'profile');

    // Send phase completion email (non-blocking)
    await sendPhaseCompletionEmail({
      clientName: validated.fullName,
      clientEmail: user.email,
      phaseName: 'Profile Setup',
      phaseNumber: 1,
      completionPercentage: result.completionPercentage,
      nextPhaseName: result.nextPhase ? 'Service Preferences' : undefined,
      nextPhaseUrl: result.nextPhase ? `${SITE_URL}/dashboard/client/onboarding/${result.nextPhase}` : undefined,
      estimatedMinutes: 3,
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
