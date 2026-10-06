import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { basePrisma } from '@/lib/prisma';
import { requireCSRFProtection } from '@/lib/middleware/csrf-middleware';
import { createRedisRateLimiter } from '@/lib/api/redis-rate-limit';
import { prepareHallReceipt, receiveHallEnquiry, resolveHallActor } from '@/lib/hall/receiving';

const limiter = createRedisRateLimiter({ windowMs: 60000, maxRequests: 10, failClosed: true });
export async function POST(request: NextRequest) {
  // No activation from a flag alone: reviewed receiver profile is also mandatory.
  if (process.env.NRPG_HALL_RECEIVING_ENABLED !== 'true' || process.env.USE_MOCK_DB === 'true' ||
      !process.env.NRPG_HALL_RECIPIENT_ORGANISATION_ID || !process.env.NRPG_HALL_SOURCE_REVISION ||
      !process.env.NRPG_HALL_APPROVED_PRODUCT_IDS || !process.env.NRPG_HALL_CATALOGUE_VERSION || !process.env.NRPG_HALL_CONSENT_VERSION) {
    return NextResponse.json({ status: 'not_connected' }, { status: 503 });
  }
  if (request.headers.get('origin') !== 'https://nrpg.business' || !/^application\/json(?:;|$)/i.test(request.headers.get('content-type') || '')) {
    return NextResponse.json({ error: 'ORIGIN_REJECTED' }, { status: 403 });
  }
  try {
    const csrfError = await requireCSRFProtection(request);
    if (csrfError) return csrfError;
    const actor = await resolveHallActor(basePrisma, await getServerSession(authOptions));
    if (!actor) return NextResponse.json({ error: 'AUTHENTICATION_REQUIRED' }, { status: 401 });
    const limited = await limiter(request);
    if (limited) return limited;
    const reader = request.body?.getReader();
    if (!reader) return NextResponse.json({ error: 'INVALID_ENQUIRY' }, { status: 400 });
    const chunks: Uint8Array[] = []; let length = 0;
    while (true) { const { value, done } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > 16384) { await reader.cancel(); return NextResponse.json({ error: 'REQUEST_TOO_LARGE' }, { status: 413 }); }
      chunks.push(value);
    }
    let prepared;
    try { prepared = prepareHallReceipt(JSON.parse(Buffer.concat(chunks).toString('utf8')), {
      recipientOrganisationId: process.env.NRPG_HALL_RECIPIENT_ORGANISATION_ID,
      sourceRevision: process.env.NRPG_HALL_SOURCE_REVISION,
      approvedProductIds: process.env.NRPG_HALL_APPROVED_PRODUCT_IDS.split(','),
      catalogueVersion: process.env.NRPG_HALL_CATALOGUE_VERSION,
      consentVersion: process.env.NRPG_HALL_CONSENT_VERSION,
    }); } catch { return NextResponse.json({ error: 'INVALID_ENQUIRY' }, { status: 400 }); }
    const receipt = await receiveHallEnquiry(basePrisma, actor, prepared);
    return NextResponse.json(receipt, { status: receipt.duplicate ? 200 : 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const conflict = error instanceof Error && error.message === 'IDEMPOTENCY_CONFLICT';
    return NextResponse.json({ error: conflict ? 'IDEMPOTENCY_CONFLICT' : 'RECEIVING_UNAVAILABLE' }, { status: conflict ? 409 : 503 });
  }
}
