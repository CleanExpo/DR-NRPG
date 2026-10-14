import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { handleUnexpectedError, handleValidationError } from '@/lib/api-errors';
import { completePhase } from '@/lib/services/client-onboarding.service';
import { sendPhaseCompletionEmail } from '@/lib/services/client-email.service';
import { communicationPreferencesSchema } from '@/lib/validations/client-onboarding';
import { getTenantDb } from '@/lib/get-tenant-db';
import { ZodError } from 'zod';
import { SITE_URL } from '@/lib/seo/site-url';

export const dynamic = 'force-dynamic';

/**
 * POST /api/client/onboarding/communication
 *
 * Save Phase 6: Communication preferences (OPTIONAL)
 * Updates UserPreferences with notification settings
 * Creates emergency contact if provided
 * Completes communication phase
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;
    
    // Get tenant-scoped database client
    const db = getTenantDb(authResult.context);

    if (!requireRole(user, ['CLIENT', 'ADMIN', 'SUPER_ADMIN'])) {
      return unauthorizedRoleResponse(['CLIENT', 'ADMIN', 'SUPER_ADMIN']);
    }

    const body = await request.json();
    const validated = communicationPreferencesSchema.parse(body);

    // Update user preferences with notification settings
    // Store all communication preferences in notificationSettings Json field
    const notificationSettings = {
      notifications: validated.notifications,
      contactTimes: validated.contactTimes,
      shareDataForAnalytics: validated.shareDataForAnalytics,
      allowSessionRecording: validated.allowSessionRecording,
    };

    await db.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        notificationSettings,
      },
      create: {
        userId: user.id,
        notificationSettings,
      },
    });

    // Create emergency contact if provided
    if (validated.emergencyContact) {
      const profile = await db.clientProfile.findUnique({
        where: { userId: user.id },
      });

      if (profile) {
        await db.clientEmergencyContact.create({
          data: {
            clientProfileId: profile.id,
            name: validated.emergencyContact.name,
            relationship: validated.emergencyContact.relationship,
            phone: validated.emergencyContact.phone,
            email: validated.emergencyContact.email,
            allowContractorContact: validated.emergencyContact.allowContractorContact,
            isPrimary: true,
          },
        });
      }
    }

    // Complete phase
    const result = await completePhase(user.id, 'communication');

    // Send phase completion email
    await sendPhaseCompletionEmail({
      clientName: user.name || 'Valued Client',
      clientEmail: user.email,
      phaseName: 'Communication Preferences',
      phaseNumber: 6,
      completionPercentage: result.completionPercentage,
      nextPhaseName: result.nextPhase ? 'Education & Completion' : undefined,
      nextPhaseUrl: result.nextPhase ? `${SITE_URL}/dashboard/client/onboarding/${result.nextPhase}` : undefined,
      estimatedMinutes: 35,
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
