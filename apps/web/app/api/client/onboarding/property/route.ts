import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { handleUnexpectedError, handleValidationError } from '@/lib/api-errors';
import { completePhase, detectRiskZones } from '@/lib/services/client-onboarding.service';
import { sendPhaseCompletionEmail } from '@/lib/services/client-email.service';
import { propertyDetailsSchema } from '@/lib/validations/client-onboarding';
import { getTenantDb } from '@/lib/get-tenant-db';
import { ZodError } from 'zod';
import { getUserReturnOrigin } from '@/lib/tenant-return-origin';
import { sealAccessInstructions } from '@/lib/privacy/access-instructions-crypto';

export const dynamic = 'force-dynamic';

/**
 * POST /api/client/onboarding/property
 *
 * Save Phase 3: Property details
 * Creates ClientProperty record
 * Detects risk zones (flood, bushfire, cyclone)
 * Seals access instructions with AES-256-GCM (DR-945); withholds them,
 * never stores them in the clear, when no encryption key is configured
 * Completes property phase and marks core phases complete
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
    const validated = propertyDetailsSchema.parse(body);

    // Get or create client profile
    const profile = await db.clientProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        tier: 'standard',
      },
    });

    // Detect risk zones and get recommendations
    const { zones, recommendedServices } = await detectRiskZones(
      validated.postcode,
      validated.state as any
    );

    // Access instructions (gate, alarm and intercom codes) are sealed before
    // they reach the database. No key configured = not stored at all.
    const sealedAccess = sealAccessInstructions(validated.accessInstructions, profile.id);
    if (sealedAccess.status === 'withheld') {
      console.warn(
        '[client-onboarding/property] Access instructions withheld: PROPERTY_ACCESS_ENCRYPTION_KEY is not configured'
      );
    }
    const accessInstructionsSaved = sealedAccess.status !== 'withheld';

    // Create property record
    const property = await db.clientProperty.create({
      data: {
        clientProfileId: profile.id,
        streetAddress: validated.streetAddress,
        suburb: validated.suburb,
        postcode: validated.postcode,
        state: validated.state as any,
        country: validated.country,
        propertyType: validated.propertyType,
        propertySize: validated.propertySize,
        buildingAge: validated.buildingAge,
        accessInstructions: sealedAccess.accessInstructions,
        accessKeyId: sealedAccess.accessKeyId,
        parkingAvailable: validated.parkingAvailable,
        securityAccess: validated.securityAccess,
        petOnPremises: validated.petOnPremises,
        petDetails: validated.petDetails,
        recommendedServices,
        isPrimary: true,
      },
    });

    // Update profile with risk zone and property count
    await db.clientProfile.update({
      where: { id: profile.id },
      data: {
        riskZone: zones.length > 0 ? zones.join(',') : null,
        riskAssessmentOffered: zones.length > 0,
        propertyCount: 1,
      },
    });

    // Complete phase
    const result = await completePhase(user.id, 'property');

    // Core phases complete! Send special email
    const coreComplete = result.completionPercentage >= 42.8; // 3/7 phases

    // Send phase completion email (non-blocking)
    await sendPhaseCompletionEmail({
      clientName: user.name || 'Valued Client',
      clientEmail: user.email,
      phaseName: coreComplete ? 'Core Setup' : 'Property Details',
      phaseNumber: 3,
      completionPercentage: result.completionPercentage,
      nextPhaseName: result.nextPhase ? 'Insurance & Documentation' : undefined,
      nextPhaseUrl: result.nextPhase ? `${await getUserReturnOrigin(user)}/dashboard/client/onboarding/${result.nextPhase}` : undefined,
      estimatedMinutes: result.nextPhase ? 3 : undefined,
    }).catch((err) => {
      console.error('Failed to send phase completion email:', err);
    });

    return NextResponse.json({
      success: true,
      message: coreComplete
        ? 'Core setup complete! You can now create service requests.'
        : result.message,
      property: {
        id: property.id,
        address: `${validated.streetAddress}, ${validated.suburb}, ${validated.state} ${validated.postcode}`,
      },
      riskZones: zones,
      recommendedServices,
      accessInstructionsSaved,
      nextPhase: result.nextPhase,
      nextPhaseUrl: result.nextPhase ? `/dashboard/client/onboarding/${result.nextPhase}` : '/dashboard/client/onboarding/checklist',
      completionPercentage: result.completionPercentage,
      coreComplete,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error);
    }
    return handleUnexpectedError(error);
  }
}
