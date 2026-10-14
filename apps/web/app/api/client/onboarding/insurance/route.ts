import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { handleUnexpectedError, handleValidationError } from '@/lib/api-errors';
import { completePhase } from '@/lib/services/client-onboarding.service';
import { sendPhaseCompletionEmail } from '@/lib/services/client-email.service';
import { insuranceDetailsSchema } from '@/lib/validations/client-onboarding';
import { getTenantDb } from '@/lib/get-tenant-db';
import { ZodError } from 'zod';
import { SITE_URL } from '@/lib/seo/site-url';

export const dynamic = 'force-dynamic';

/**
 * POST /api/client/onboarding/insurance
 *
 * Save Phase 4: Insurance information (OPTIONAL)
 * Creates/updates ClientInsurance record
 * Triggers verified_insurance tier upgrade if policy verified
 * Completes insurance phase
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
    const validated = insuranceDetailsSchema.parse(body);

    // Get client profile
    const profile = await db.clientProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Client profile not found' }, { status: 404 });
    }

    // Create or update insurance record
    await db.clientInsurance.upsert({
      where: { clientProfileId: profile.id },
      update: {
        hasInsurance: validated.hasInsurance,
        insuranceProvider: validated.insuranceProvider,
        policyNumber: validated.policyNumber,
        policyExpiryDate: validated.policyExpiryDate,
        policyDocumentUrls: validated.policyDocumentUrls || [],
        hasPreviousClaims: validated.hasPreviousClaims || false,
        claimCount: validated.claimCount || 0,
        lastClaimDate: validated.lastClaimDate,
        preferredContractors: validated.preferredContractors || [],
        restrictedContractors: validated.restrictedContractors || [],
      },
      create: {
        clientProfileId: profile.id,
        hasInsurance: validated.hasInsurance,
        insuranceProvider: validated.insuranceProvider,
        policyNumber: validated.policyNumber,
        policyExpiryDate: validated.policyExpiryDate,
        policyDocumentUrls: validated.policyDocumentUrls || [],
        hasPreviousClaims: validated.hasPreviousClaims || false,
        claimCount: validated.claimCount || 0,
        lastClaimDate: validated.lastClaimDate,
        preferredContractors: validated.preferredContractors || [],
        restrictedContractors: validated.restrictedContractors || [],
      },
    });

    // Complete phase
    const result = await completePhase(user.id, 'insurance');

    // Send phase completion email (non-blocking)
    await sendPhaseCompletionEmail({
      clientName: user.name || 'Valued Client',
      clientEmail: user.email,
      phaseName: 'Insurance Information',
      phaseNumber: 4,
      completionPercentage: result.completionPercentage,
      nextPhaseName: result.nextPhase ? 'Payment Setup' : undefined,
      nextPhaseUrl: result.nextPhase ? `${SITE_URL}/dashboard/client/onboarding/${result.nextPhase}` : undefined,
      estimatedMinutes: 4,
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
