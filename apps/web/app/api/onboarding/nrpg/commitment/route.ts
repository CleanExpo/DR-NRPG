/**
 * NRPG Commitment Framework API
 * GET: Retrieve contractor's commitment status
 * POST: Sign the commitment framework
 *
 * Reconciled to the actual NRPGCommitment schema (DR-890): writes only existing
 * columns, keys contractorId on User.id (Option B, see lib/contractor-identity),
 * removes @ts-nocheck, and records signing provenance (signedName, version,
 * signedIpAddress) via the shared client-IP helper.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/net/client-ip';
import { z } from 'zod';
import { authenticateRequest } from '@/lib/auth-middleware';
import { getTenantDb } from '@/lib/get-tenant-db';
import { contractorKey } from '@/lib/contractor-identity';

/** Version of the commitment framework currently presented for signing. */
const COMMITMENT_VERSION = '2026-03-05';

const RENEWAL_MS = 365 * 24 * 60 * 60 * 1000;

const commitmentSchema = z.object({
  fullName: z.string().min(2),
  signature: z.string().min(2),
  agreedToEthics: z.boolean().refine((val) => val === true),
  agreedToQuality: z.boolean().refine((val) => val === true),
  agreedToCustomer: z.boolean().refine((val) => val === true),
  agreedToContinuousImprovement: z.boolean().refine((val) => val === true),
});

// GET /api/onboarding/nrpg/commitment
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;
    const db = getTenantDb(authResult.context);
    const contractorId = contractorKey(user);

    const commitment = await db.nRPGCommitment.findUnique({
      where: { contractorId },
    });

    if (!commitment) {
      return NextResponse.json({
        success: true,
        data: {
          signed: false,
          signedAt: null,
          signedName: null,
          renewalDue: null,
        },
      });
    }

    const renewalDue = commitment.signedAt
      ? new Date(commitment.signedAt.getTime() + RENEWAL_MS).toISOString()
      : null;

    return NextResponse.json({
      success: true,
      data: {
        signed: true,
        signedAt: commitment.signedAt?.toISOString() ?? null,
        signedName: commitment.signedName,
        version: commitment.version,
        renewalDue,
      },
    });
  } catch (error) {
    console.error('Error fetching commitment:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/onboarding/nrpg/commitment
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;
    const db = getTenantDb(authResult.context);
    const contractorId = contractorKey(user);

    const body = await request.json();

    const parsed = commitmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Require an existing contractor profile before signing.
    const contractor = await db.contractor.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!contractor) {
      return NextResponse.json({ success: false, error: 'Contractor not found' }, { status: 404 });
    }

    // Idempotent guard: one signed commitment per contractor.
    const existing = await db.nRPGCommitment.findUnique({
      where: { contractorId },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Commitment framework already signed' },
        { status: 400 }
      );
    }

    const now = new Date();

    // The form requires all four agreements to be true, so signing affirms the
    // full commitment framework — record all standards as committed.
    const commitment = await db.nRPGCommitment.create({
      data: {
        contractorId,
        professionalStandards: true,
        codeOfConduct: parsed.data.agreedToEthics,
        qualityAssurance: parsed.data.agreedToQuality,
        clientProtection: parsed.data.agreedToCustomer,
        continuingEducation: parsed.data.agreedToContinuousImprovement,
        industryContribution: true,
        signedName: parsed.data.fullName,
        signatureData: parsed.data.signature,
        signatureType: 'typed',
        version: COMMITMENT_VERSION,
        signedAt: now,
        signedIpAddress: getClientIp(request),
      },
    });

    // Mark the onboarding phase commitment as signed (keyed on User.id, Option B).
    await db.nRPGOnboardingPhase.updateMany({
      where: { contractorId },
      data: {
        commitmentSigned: true,
        commitmentSignedAt: now,
      },
    });

    const renewalDue = new Date(now.getTime() + RENEWAL_MS).toISOString();

    return NextResponse.json({
      success: true,
      data: {
        signed: true,
        signedAt: commitment.signedAt?.toISOString(),
        signedName: commitment.signedName,
        version: commitment.version,
        renewalDue,
      },
    });
  } catch (error) {
    console.error('Error signing commitment:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
