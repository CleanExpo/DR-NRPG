/**
 * Dispatch eligibility — the single dispatch gate (DR-889 + DR-858 N-04).
 *
 * A contractor may be dispatched only if ALL hold:
 *   1. CURRENT, non-superseded acceptance of the live ICA version (`ICA_VERSION`).
 *      Bumping the version auto-re-gates everyone until they re-sign.
 *   2. Active, non-suspended Contractor record.
 *   3. Public liability insurance not expired.
 *   4. At least one active IICRC certification not expired.
 *   5. Active, non-blocked User account.
 *   6. Stripe Connect payouts AND charges enabled (DR-898). The flags are
 *      persisted on ContractorProfile by the account.updated webhook, so a
 *      capability revoked at Stripe re-gates the contractor automatically.
 *   7. Verified, unexpired NRP Contractor Certification (DR-893) — auto-issued
 *      when all 24 canonical training modules are passed server-side. Name and
 *      validity come from the single training-policy config source, so an
 *      expired or unverified training cert re-gates the contractor.
 *   8. ABN not cancelled (DR-900). A recorded `abnCancelledAt` re-gates a LIVE
 *      contractor on the next read; NULL means no cancellation recorded.
 *   9. Background check not expired (DR-900). A recorded
 *      `backgroundCheckExpiresAt` in the past re-gates a LIVE contractor; NULL
 *      means no expiry recorded and does not block.
 *
 * contractorId == User.id (Option B). Callers must pass the contractor's User.id.
 */
import { prisma } from '@/lib/prisma';
import { ICA_VERSION } from '@/lib/legal/ica';
import { NRPG_CERTIFICATION_NAME } from '@/lib/training/training-policy';

/** True iff `userId` passes every dispatch-eligibility check. */
export async function isDispatchEligible(userId: string): Promise<boolean> {
  const eligible = await filterDispatchEligible([userId]);
  return eligible.has(userId);
}

/**
 * Batch variant: given contractor User.ids, return the subset that is currently
 * dispatch-eligible. Three queries regardless of N (ICA acceptances, then
 * contractor/insurance/cert/account status, then NRP training certification).
 */
export async function filterDispatchEligible(userIds: string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();
  const now = new Date();

  // 1. ICA: current-version, non-superseded acceptances.
  const accepted = await prisma.contractorAgreementAcceptance.findMany({
    where: {
      contractorId: { in: userIds },
      version: ICA_VERSION,
      supersededAt: null,
    },
    select: { contractorId: true },
  });
  const icaUserIds = [...new Set(accepted.map((r) => r.contractorId))];
  if (icaUserIds.length === 0) return new Set();

  // 2. Contractor record active + insurance current + >=1 current IICRC cert
  //    + owning User active & not blocked + Stripe payouts/charges enabled
  //    (webhook-synced on ContractorProfile) + ABN not cancelled + background
  //    check not expired. All AND-ed in one query.
  const contractors = await prisma.contractor.findMany({
    where: {
      userId: { in: icaUserIds },
      isActive: true,
      isSuspended: false,
      publicLiabilityExpiryDate: { gt: now },
      abnCancelledAt: null,
      OR: [{ backgroundCheckExpiresAt: null }, { backgroundCheckExpiresAt: { gt: now } }],
      user: {
        isActive: true,
        isBlocked: false,
        contractorProfile: {
          stripePayoutsEnabled: true,
          stripeChargesEnabled: true,
        },
      },
      iicrcCertifications: { some: { isActive: true, expiryDate: { gt: now } } },
    },
    select: { userId: true },
  });
  const contractorUserIds = contractors.map((c) => c.userId);
  if (contractorUserIds.length === 0) return new Set();

  // 3. Training gate (DR-893): a verified, unexpired NRP Contractor
  //    Certification, keyed on User.id like the other lifecycle tables.
  //    The certification name (and its validity, at issuance) come from the
  //    single training-policy source — never a literal.
  const trainingCerts = await prisma.contractorCertification.findMany({
    where: {
      contractorId: { in: contractorUserIds },
      certificationName: NRPG_CERTIFICATION_NAME,
      verified: true,
      expiryDate: { gt: now },
    },
    select: { contractorId: true },
  });

  return new Set(trainingCerts.map((c) => c.contractorId));
}
