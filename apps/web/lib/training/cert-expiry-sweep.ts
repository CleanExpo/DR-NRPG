/**
 * Certificate-expiry sweep (DR-894) — run daily by
 * `app/api/cron/cert-expiry-sweep/route.ts`.
 *
 * Dispatch eligibility is COMPUTED-ON-READ (`lib/services/dispatch-eligibility.ts`
 * filters `expiryDate > now`), so an expired NRPG Contractor Certification
 * self-clears from the dispatch pool with no persisted flag to flip. The sweep
 * therefore:
 *   1. RECOMPUTES eligibility through the real service for every contractor
 *      whose latest cert is expired — proving the re-gate and flagging any
 *      anomaly still reported eligible;
 *   2. writes an AuditLog row for each newly-expired contractor (spec: removal
 *      from the dispatch pool leaves an audit row);
 *   3. queues renewal notifications at T-30 / T-7 / at-expiry through the
 *      existing email machinery (`queueEmail` -> Resend with retry queue).
 *
 * Notice windows are one-day half-open buckets (see
 * `classifyNrpgCertRenewalNotice`), so a DAILY cron selects each cert exactly
 * once per notice without needing persisted notification state (no schema
 * changes). A contractor who already renewed (a newer live cert exists) is
 * never notified or audited off the stale expired row.
 */
import { prisma } from '@/lib/prisma';
import { filterDispatchEligible } from '@/lib/services/dispatch-eligibility';
import { queueEmail } from '@/lib/email/email-queue';
import {
  NRPG_CERTIFICATION_NAME,
  NRPG_CERTIFICATION_NAMES,
  NRPG_CANONICAL_MODULE_COUNT,
  classifyNrpgCertRenewalNotice,
  NrpgCertRenewalNotice,
} from '@/lib/training/training-policy';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface CertExpirySweepResult {
  contractorsChecked: number;
  notices: Record<NrpgCertRenewalNotice, number>;
  /** Contractor userIds whose cert newly expired and were re-gated + audited. */
  revoked: string[];
  /** Expired contractors the eligibility service STILL reports eligible (bug flag). */
  anomaliesStillEligible: string[];
  emailsQueued: number;
  emailFailures: number;
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildRenewalEmail(
  notice: NrpgCertRenewalNotice,
  name: string | null,
  expiryDate: Date
): { subject: string; html: string; text: string } {
  const greeting = name ? `Hi ${name},` : 'Hi,';
  const certName = NRPG_CERTIFICATION_NAME;
  const expiry = fmtDate(expiryDate);

  if (notice === 'EXPIRED') {
    const subject = `Your ${certName} has expired — dispatch paused`;
    const text = `${greeting}\n\nYour ${certName} expired on ${expiry}. You are no longer eligible to receive dispatches until you renew.\n\nTo restore your dispatch eligibility, sign in to the contractor portal and complete the required training modules to re-certify.\n\n— National Restoration Professionals Group`;
    return { subject, text, html: text.replace(/\n/g, '<br/>') };
  }

  const days = notice === 'T30' ? 30 : 7;
  const subject = `Your ${certName} expires in ${days} days`;
  const text = `${greeting}\n\nYour ${certName} expires on ${expiry} (${days} days from now). When it expires you will be removed from the dispatch pool until you re-certify.\n\nRenew ahead of time: sign in to the contractor portal and complete the ${NRPG_CANONICAL_MODULE_COUNT}-module refresher to issue a fresh certification with a new validity period.\n\n— National Restoration Professionals Group`;
  return { subject, text, html: text.replace(/\n/g, '<br/>') };
}

export async function runCertExpirySweep(now: Date = new Date()): Promise<CertExpirySweepResult> {
  const result: CertExpirySweepResult = {
    contractorsChecked: 0,
    notices: { T30: 0, T7: 0, EXPIRED: 0 },
    revoked: [],
    anomaliesStillEligible: [],
    emailsQueued: 0,
    emailFailures: 0,
  };

  // Everything inside the widest notice horizon (T-30) plus anything expired.
  const horizon = new Date(now.getTime() + 31 * DAY_MS);
  const inWindow = await prisma.contractorCertification.findMany({
    where: {
      certificationName: { in: [...NRPG_CERTIFICATION_NAMES] },
      verified: true,
      expiryDate: { lte: horizon },
    },
    select: { contractorId: true, expiryDate: true },
  });

  const ids = [...new Set(inWindow.map((c) => c.contractorId))];
  if (ids.length === 0) return result;

  // A contractor's state is their LATEST cert — a renewal (possibly outside
  // the horizon query) supersedes the stale expired row entirely.
  const allCerts = await prisma.contractorCertification.findMany({
    where: {
      contractorId: { in: ids },
      certificationName: { in: [...NRPG_CERTIFICATION_NAMES] },
      verified: true,
      expiryDate: { not: null },
    },
    select: { contractorId: true, expiryDate: true },
  });

  const latestExpiry = new Map<string, Date>();
  for (const c of allCerts) {
    if (!c.expiryDate) continue;
    const current = latestExpiry.get(c.contractorId);
    if (!current || c.expiryDate.getTime() > current.getTime()) {
      latestExpiry.set(c.contractorId, c.expiryDate);
    }
  }
  result.contractorsChecked = latestExpiry.size;

  const buckets: Record<NrpgCertRenewalNotice, string[]> = { T30: [], T7: [], EXPIRED: [] };
  const expiredContractorIds: string[] = [];
  for (const [contractorId, expiry] of latestExpiry) {
    if (expiry.getTime() <= now.getTime()) expiredContractorIds.push(contractorId);
    const notice = classifyNrpgCertRenewalNotice(expiry, now);
    if (notice) buckets[notice].push(contractorId);
  }

  // 1+2. Recompute eligibility through the REAL dispatch gate and audit the
  // newly-expired revocations. Expiry self-clears (computed eligibility), so a
  // contractor still reported eligible here is an anomaly worth alerting on.
  if (expiredContractorIds.length > 0) {
    const stillEligible = await filterDispatchEligible(expiredContractorIds);
    result.anomaliesStillEligible = [...stillEligible];
    for (const contractorId of stillEligible) {
      console.error(
        `[cert-expiry-sweep] ANOMALY: contractor ${contractorId} has an expired ${NRPG_CERTIFICATION_NAME} but is still dispatch-eligible`
      );
    }

    for (const contractorId of buckets.EXPIRED) {
      result.revoked.push(contractorId);
      await prisma.auditLog.create({
        data: {
          action: 'DISPATCH_ELIGIBILITY_REVOKED_CERT_EXPIRED',
          entityType: 'ContractorCertification',
          entityId: contractorId,
          performedBy: 'cron:cert-expiry-sweep',
          newValues: {
            contractorId,
            certificationName: NRPG_CERTIFICATION_NAME,
            certExpiryDate: latestExpiry.get(contractorId)!.toISOString(),
            dispatchEligibleAfterRecompute: stillEligible.has(contractorId),
          },
        },
      });
    }
  }

  // 3. Renewal notifications at T-30 / T-7 / at-expiry.
  const notifyIds = [...new Set([...buckets.T30, ...buckets.T7, ...buckets.EXPIRED])];
  if (notifyIds.length > 0) {
    const users = await prisma.user.findMany({
      where: { id: { in: notifyIds } },
      select: { id: true, email: true, name: true },
    });
    const userById = new Map<string, (typeof users)[number]>(users.map((u) => [u.id, u]));

    for (const notice of ['T30', 'T7', 'EXPIRED'] as const) {
      for (const contractorId of buckets[notice]) {
        result.notices[notice] += 1;
        const contractorUser = userById.get(contractorId);
        if (!contractorUser?.email) {
          result.emailFailures += 1;
          console.error(`[cert-expiry-sweep] no email for contractor ${contractorId}; ${notice} notice skipped`);
          continue;
        }
        const { subject, html, text } = buildRenewalEmail(
          notice,
          contractorUser.name,
          latestExpiry.get(contractorId)!
        );
        const sent = await queueEmail({ to: contractorUser.email, subject, html, text });
        if (sent.success) result.emailsQueued += 1;
        else result.emailFailures += 1;
      }
    }
  }

  return result;
}
