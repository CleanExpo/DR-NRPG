/**
 * POST /api/admin/contractors/[contractorId]/compliance  (DR-900)
 *
 * The only writer of Contractor.abnCancelledAt and Contractor.backgroundCheckExpiresAt,
 * the two columns the dispatch gate (lib/services/dispatch-eligibility.ts) reads.
 * An admin records the outcome of an ABN Lookup check or a background check; the
 * contractor drops out of (or returns to) the dispatch pool on the next read.
 *
 * [contractorId] is Contractor.id, not User.id (same as admin/contractors/verification).
 *
 * Fail-closed rules:
 *  - ADMIN needs a tenant; only SUPER_ADMIN may act with no tenant. A null-tenant
 *    ADMIN would otherwise get an unscoped client (lib/prisma-tenant.ts) or a
 *    header-chosen tenant (lib/auth-middleware.ts).
 *  - Load and write both filter by tenantId inside one transaction; the write
 *    must match exactly one row.
 *  - FAILED / EXPIRED force backgroundCheckExpiresAt one second into the past so
 *    the gate's `gt: now` blocks. The real expiry is kept in the history row.
 *  - Every data key is set explicitly. Prisma skips `undefined`, so nothing is spread.
 *  - NULL columns still mean "nothing recorded" and do not block (legacy rows).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { getTenantDb } from '@/lib/get-tenant-db';
import { handleUnexpectedError, handleValidationError } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

const DAY_MS = 24 * 60 * 60 * 1000;
const FUTURE_SKEW_MS = 5 * 60 * 1000;
const MAX_CHECK_AGE_MS = 366 * DAY_MS;

// ISO-8601 with an explicit offset (Z or +hh:mm); naive dates are rejected.
const isoWithOffset = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/, 'ISO date with offset required')
  .transform((s, ctx) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid date' });
      return z.NEVER;
    }
    return d;
  });

const reason = z.string().trim().min(10).max(500);

const bodySchema = z.discriminatedUnion('event', [
  z.object({ event: z.literal('ABN_CANCELLED'), reason }).strict(),
  z
    .object({ event: z.literal('ABN_REINSTATED'), reason, abnChecked: z.string().regex(/^\d{11}$/) })
    .strict(),
  z
    .object({ event: z.literal('BACKGROUND_CLEARED'), reason, checkedAt: isoWithOffset, expiresAt: isoWithOffset })
    .strict(),
  z.object({ event: z.literal('BACKGROUND_FAILED'), reason, checkedAt: isoWithOffset }).strict(),
  z.object({ event: z.literal('BACKGROUND_EXPIRED'), reason, checkedAt: isoWithOffset }).strict(),
]);

type Body = z.infer<typeof bodySchema>;

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function checkedAtOrThrow(checkedAt: Date, now: Date) {
  if (checkedAt.getTime() > now.getTime() + FUTURE_SKEW_MS) throw new HttpError(400, 'checkedAt is in the future');
  if (checkedAt.getTime() < now.getTime() - MAX_CHECK_AGE_MS) throw new HttpError(400, 'checkedAt is more than a year old');
}

export async function POST(request: NextRequest, props: { params: Promise<{ contractorId: string }> }) {
  const { contractorId } = await props.params;
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) return authResult.response;
    const { user, tenantId } = authResult.context;

    if (!requireRole(user, ['ADMIN', 'SUPER_ADMIN'])) {
      return unauthorizedRoleResponse(['ADMIN', 'SUPER_ADMIN']);
    }
    // Check the User.tenantId DATABASE column, not the resolved context tenant:
    // the middleware fills a null user tenant from the client-sent x-tenant-id
    // header, which would let a null-tenant ADMIN pick any tenant.
    if (user.userType !== 'SUPER_ADMIN' && !user.tenantId) {
      return NextResponse.json({ success: false, error: 'Tenant context required' }, { status: 403 });
    }

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Body must be JSON' }, { status: 400 });
    }
    const body: Body = bodySchema.parse(raw);

    const now = new Date();
    if (body.event === 'BACKGROUND_CLEARED') {
      checkedAtOrThrow(body.checkedAt, now);
      if (body.expiresAt.getTime() <= now.getTime()) throw new HttpError(400, 'expiresAt must be in the future');
    } else if (body.event === 'BACKGROUND_FAILED' || body.event === 'BACKGROUND_EXPIRED') {
      checkedAtOrThrow(body.checkedAt, now);
    }

    // ADMIN is pinned to their own User.tenantId; only SUPER_ADMIN may use the
    // resolved (header-derived) tenant or act unscoped.
    const scopeTenantId = user.userType === 'SUPER_ADMIN' ? tenantId : user.tenantId;
    const where = scopeTenantId ? { id: contractorId, tenantId: scopeTenantId } : { id: contractorId };
    const db = getTenantDb(authResult.context);

    const result = await db.$transaction(async (tx) => {
      const contractor = await tx.contractor.findFirst({ where });
      if (!contractor) throw new HttpError(404, 'Contractor not found');

      let data: Record<string, Date | string | null>;
      let field: string;
      let from: string | null;
      let to: string | null;

      switch (body.event) {
        case 'ABN_CANCELLED':
          if (contractor.abnCancelledAt) return { changed: false };
          field = 'abnCancelledAt';
          from = null;
          to = now.toISOString();
          data = { abnCancelledAt: now };
          break;
        case 'ABN_REINSTATED': {
          if (!contractor.abnCancelledAt) return { changed: false };
          const onFile = (contractor.abnNumber ?? '').replace(/\s/g, '');
          if (onFile !== body.abnChecked) {
            throw new HttpError(409, 'abnChecked does not match the ABN on file for this contractor');
          }
          field = 'abnCancelledAt';
          from = contractor.abnCancelledAt.toISOString();
          to = null;
          data = { abnCancelledAt: null };
          break;
        }
        case 'BACKGROUND_CLEARED':
          field = 'backgroundCheckExpiresAt';
          from = contractor.backgroundCheckExpiresAt?.toISOString() ?? null;
          to = body.expiresAt.toISOString();
          data = {
            backgroundCheckExpiresAt: body.expiresAt,
            backgroundCheckStatus: 'CLEARED',
            lastBackgroundCheckDate: body.checkedAt,
          };
          break;
        case 'BACKGROUND_FAILED':
        case 'BACKGROUND_EXPIRED': {
          const blockedAt = new Date(now.getTime() - 1000);
          field = 'backgroundCheckExpiresAt';
          from = contractor.backgroundCheckExpiresAt?.toISOString() ?? null;
          to = blockedAt.toISOString();
          data = {
            backgroundCheckExpiresAt: blockedAt,
            backgroundCheckStatus: body.event === 'BACKGROUND_FAILED' ? 'FAILED' : 'EXPIRED',
            lastBackgroundCheckDate: body.checkedAt,
          };
          break;
        }
      }

      // Compare-and-set on the value read above: a request that read a stale
      // value (e.g. a reinstatement racing a newer cancellation) matches 0 rows.
      const guard =
        field === 'abnCancelledAt'
          ? { abnCancelledAt: contractor.abnCancelledAt }
          : { backgroundCheckExpiresAt: contractor.backgroundCheckExpiresAt };
      const updated = await tx.contractor.updateMany({ where: { ...where, ...guard }, data });
      if (updated.count !== 1) throw new HttpError(409, 'Contractor changed concurrently; retry');

      await tx.contractorVerificationHistory.create({
        data: {
          contractorId,
          action: 'STATUS_CHANGED',
          previousStatus: contractor.verificationStatus,
          newStatus: contractor.verificationStatus,
          reason: body.reason,
          performedBy: user.id,
          performedByName: user.name || user.email,
          isSystemAction: false,
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
          userAgent: request.headers.get('user-agent'),
          metadata: { event: body.event, field, from, to, tenantId: tenantId ?? null },
        },
      });
      return { changed: true, field, to };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    if (error instanceof ZodError) return handleValidationError(error);
    return handleUnexpectedError(error);
  }
}
