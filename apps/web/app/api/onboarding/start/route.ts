import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ModuleStatus, OnboardingStatus } from '@prisma/client';
import { getTenantDb } from '@/lib/get-tenant-db';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { handleUnexpectedError, handleValidationError, createErrorResponse, ErrorCode } from '@/lib/api-errors';
import { loadNrpgTrainingIndex, parseNrpgModuleNumber } from '@/lib/training/nrp-training';
import { NRPG_CANONICAL_MODULE_IDS } from '@/lib/training/training-policy';

export const dynamic = 'force-dynamic';

const onboardingStartSchema = z.object({
  contractorId: z.string().min(1),
  businessName: z.string().min(1),
  specialization: z.enum(['water', 'fire', 'mould', 'combined']),
  experience: z.number().int().min(0).max(50),
  certifications: z.array(z.string()).default([]),
});

interface ModuleDefinition {
  moduleId: string;
  courseName: string;
}

async function getRecommendedModules(specialization: string): Promise<ModuleDefinition[]> {
  const index = await loadNrpgTrainingIndex();
  const byId = new Map(index.modules.map((m) => [m.moduleId.toUpperCase(), m]));

  const coreModuleIds: string[] = [
    'NRP-001',
    'NRP-002',
    'NRP-004',
    'NRP-005',
    'NRP-013',
    'NRP-016',
    'NRP-018',
  ];

  const specializationModuleIds: Record<string, string[]> = {
    water: ['NRP-002', 'NRP-006', 'NRP-009', 'NRP-012', 'NRP-014'],
    fire: ['NRP-002', 'NRP-008', 'NRP-009', 'NRP-014', 'NRP-012'],
    mould: ['NRP-002', 'NRP-007', 'NRP-006', 'NRP-012'],
    combined: ['NRP-002', 'NRP-006', 'NRP-007', 'NRP-008', 'NRP-009', 'NRP-012', 'NRP-014'],
  };

  const desired = [...new Set([...coreModuleIds, ...(specializationModuleIds[specialization] ?? [])])];

  const modules: ModuleDefinition[] = [];
  for (const moduleId of desired) {
    const entry = byId.get(moduleId.toUpperCase());
    if (!entry) continue;
    modules.push({
      moduleId: entry.moduleId,
      courseName: entry.title,
    });
  }

  // Ensure stable ordering by module number when possible.
  modules.sort((a, b) => {
    const aNum = parseNrpgModuleNumber(a.moduleId) ?? Number.MAX_SAFE_INTEGER;
    const bNum = parseNrpgModuleNumber(b.moduleId) ?? Number.MAX_SAFE_INTEGER;
    return aNum - bNum;
  });

  return modules;
}

/**
 * Every canonical module NRP-001..NRP-024, in module order. The certificate is
 * issued only when ALL of them are passed (set equality, DR-893), so every one
 * must be seeded; seeding only the recommended subset made the certificate
 * unreachable. Returns null when the index lacks any canonical module.
 */
async function getAllTrainingModules(): Promise<ModuleDefinition[] | null> {
  const index = await loadNrpgTrainingIndex();
  const byId = new Map(index.modules.map((m) => [m.moduleId.toUpperCase(), m]));
  const modules: ModuleDefinition[] = [];
  for (const moduleId of NRPG_CANONICAL_MODULE_IDS) {
    const entry = byId.get(moduleId);
    if (!entry) return null;
    modules.push({ moduleId: entry.moduleId, courseName: entry.title });
  }
  return modules;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;

    if (!requireRole(user, ['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN'])) {
      return unauthorizedRoleResponse(['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN']);
    }

    const db = getTenantDb(authResult.context);

    const body = await request.json();
    const validation = onboardingStartSchema.safeParse(body);
    if (!validation.success) {
      return handleValidationError(validation.error);
    }

    const input = validation.data;
    const contractorId = user.userType === 'CONTRACTOR' ? user.id : input.contractorId;

    if (user.userType === 'CONTRACTOR' && input.contractorId !== user.id) {
      return createErrorResponse(ErrorCode.FORBIDDEN, 'Unauthorized contractor onboarding start', 403);
    }

    const existing = await db.contractorOnboarding.findUnique({
      where: { contractorId },
    });

    // An already-started onboarding is returned as-is (idempotent). A step-0
    // placeholder (status PENDING_START, created at signup in DR-877) is populated
    // below rather than short-circuited — otherwise the contractor would never get
    // training modules.
    if (existing && existing.status !== OnboardingStatus.PENDING_START) {
      return NextResponse.json({ success: true, onboarding: existing });
    }

    const recommendedModules = await getRecommendedModules(input.specialization);
    if (recommendedModules.length === 0) {
      return createErrorResponse(ErrorCode.INTERNAL_ERROR, 'No training modules available', 500);
    }
    const allModules = await getAllTrainingModules();
    if (!allModules) {
      return createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Training module index is incomplete', 500);
    }

    const onboarding = await db.$transaction(async (tx) => {
      // Create the onboarding, or populate the signup placeholder.
      const created = await tx.contractorOnboarding.upsert({
        where: { contractorId },
        create: {
          contractorId,
          specialization: input.specialization,
          assessmentScore: null,
          recommendedModules: JSON.parse(JSON.stringify(recommendedModules)),
          startDate: new Date(),
          targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: OnboardingStatus.IN_PROGRESS,
        },
        update: {
          specialization: input.specialization,
          recommendedModules: JSON.parse(JSON.stringify(recommendedModules)),
          startDate: new Date(),
          targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: OnboardingStatus.IN_PROGRESS,
        },
      });

      // Seed ALL canonical modules only if none exist yet (the placeholder has none).
      // recommendedModules above stays as guidance; it is not the seeded set.
      const moduleCount = await tx.contractorModuleProgress.count({
        where: { onboardingId: created.id },
      });
      if (moduleCount === 0) {
        await tx.contractorModuleProgress.createMany({
          data: allModules.map((module) => ({
            onboardingId: created.id,
            moduleId: module.moduleId,
            courseName: module.courseName,
            status: ModuleStatus.NOT_STARTED,
            progress: 0,
            completed: false,
          })),
        });
      }

      // Persist businessName to the Contractor record so it is available
      // across the platform before the contractor completes full NRPG registration.
      // We use upsert so this is safe to call even if a Contractor record already exists.
      await tx.contractor.upsert({
        where: { userId: contractorId },
        create: {
          userId: contractorId,
          businessName: input.businessName,
        },
        update: {
          // Only overwrite businessName if the record has no ABN yet
          // (i.e. full NRPG registration has not been completed).
          businessName: input.businessName,
        },
      });

      return created;
    });

    return NextResponse.json({ success: true, onboarding }, { status: 201 });
  } catch (error) {
    return handleUnexpectedError(error);
  }
}
