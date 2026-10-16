/**
 * NRPG certification payment (Wave 1).
 *
 * The certification programme is sold through Stripe Checkout using a price
 * configured in Stripe and referenced by env. Nothing here hardcodes a price.
 * Purchases are recorded on the existing OnboardingPayment model
 * (contractorId == User.id); no schema change.
 *
 * Fail-closed rules:
 * - Checkout is unavailable unless STRIPE_SECRET_KEY and
 *   STRIPE_NRPG_CERTIFICATION_PRICE_ID are both set. No placeholder price ID.
 * - The training paywall is enforced only when checkout is configured AND an
 *   explicit cut-off, NRPG_CERTIFICATION_PAYWALL_ACTIVATED_AT (ISO 8601), is set.
 *   The cut-off is a recorded config value, never "now" at request time.
 * - Grandfathering: a contractor who started training before the cut-off keeps
 *   access without paying. "Started" means any of: NRPGTrainingProgress (keyed by
 *   Contractor.id), a non-placeholder ContractorOnboarding with startDate, or an
 *   NRP ContractorCertification (both keyed by User.id). Only later starters pay.
 *
 * OnboardingPayment predates this feature and has no purpose column, so
 * certification rows are marked by two values legacy rows cannot hold: an id
 * prefixed CERTIFICATION_PAYMENT_ID_PREFIX (immutable) and certification-only
 * statuses. Only the webhook sets CERTIFICATION_PAYMENT_STATUS.PAID, and only
 * after it has verified the session's single line item is the certification price.
 */
import { NextResponse } from 'next/server';
import type { User } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ErrorCode } from '@/lib/api-errors';
import { NRPG_CERTIFICATION_NAMES } from '@/lib/training/training-policy';

/** Stripe Checkout metadata.type for certification sessions. */
export const NRPG_CERTIFICATION_PAYMENT_TYPE = 'NRPG_CERTIFICATION';

export const CERTIFICATION_PAYMENT_STATUS = {
  PENDING: 'certification_pending',
  PAID: 'certification_paid',
} as const;

/** Prefix on OnboardingPayment.id for certification purchases. */
export const CERTIFICATION_PAYMENT_ID_PREFIX = 'nrpg-cert_';

/** Where-clause fragment that only certification payment rows can satisfy. */
export function certificationPaymentRow(status: (typeof CERTIFICATION_PAYMENT_STATUS)[keyof typeof CERTIFICATION_PAYMENT_STATUS]) {
  return { id: { startsWith: CERTIFICATION_PAYMENT_ID_PREFIX }, status };
}

export function getCertificationPriceId(): string | null {
  return process.env.STRIPE_NRPG_CERTIFICATION_PRICE_ID?.trim() || null;
}

export function isCertificationCheckoutConfigured(): boolean {
  return Boolean(getCertificationPriceId() && process.env.STRIPE_SECRET_KEY?.trim());
}

/** The recorded paywall cut-off, or null when unset or not a valid date. */
export function getPaywallActivatedAt(): Date | null {
  const raw = process.env.NRPG_CERTIFICATION_PAYWALL_ACTIVATED_AT?.trim();
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function hasPaidCertification(userId: string): Promise<boolean> {
  const paid = await prisma.onboardingPayment.findFirst({
    where: { contractorId: userId, ...certificationPaymentRow(CERTIFICATION_PAYMENT_STATUS.PAID) },
    select: { id: true },
  });
  return Boolean(paid);
}

/** True iff `sessionId` is this contractor's own, paid certification checkout. */
export async function isPaidCertificationSession(userId: string, sessionId: string): Promise<boolean> {
  const paid = await prisma.onboardingPayment.findFirst({
    where: {
      contractorId: userId,
      stripeSessionId: sessionId,
      ...certificationPaymentRow(CERTIFICATION_PAYMENT_STATUS.PAID),
    },
    select: { id: true },
  });
  return Boolean(paid);
}

/** Started training or held an NRP certification before the paywall cut-off. */
export async function isGrandfathered(userId: string, activatedAt: Date): Promise<boolean> {
  const before = { lt: activatedAt };
  // NRPGTrainingProgress is keyed by Contractor.id, not User.id.
  const contractor = await prisma.contractor.findFirst({ where: { userId }, select: { id: true } });
  const [progress, onboarding, certification] = await Promise.all([
    contractor
      ? prisma.nRPGTrainingProgress.findFirst({
          where: { contractorId: contractor.id, createdAt: before },
          select: { id: true },
        })
      : null,
    // Keyed by User.id. PENDING_START is the signup placeholder, not a start.
    prisma.contractorOnboarding.findFirst({
      where: { contractorId: userId, status: { not: 'PENDING_START' }, startDate: before },
      select: { id: true },
    }),
    prisma.contractorCertification.findFirst({
      where: { contractorId: userId, certificationName: { in: [...NRPG_CERTIFICATION_NAMES] }, createdAt: before },
      select: { id: true },
    }),
  ]);
  return Boolean(progress || onboarding || certification);
}

/**
 * Training access gate. Returns a 402 response when the user must purchase the
 * certification first, or null when access is allowed.
 */
export async function certificationAccessDenied(
  user: Pick<User, 'id' | 'userType'>
): Promise<NextResponse | null> {
  if (user.userType === 'ADMIN' || user.userType === 'SUPER_ADMIN') return null;
  if (!isCertificationCheckoutConfigured()) return null;
  const activatedAt = getPaywallActivatedAt();
  if (!activatedAt) return null;
  if (await hasPaidCertification(user.id)) return null;
  if (await isGrandfathered(user.id, activatedAt)) return null;

  return NextResponse.json(
    {
      error: ErrorCode.FORBIDDEN,
      code: 'CERTIFICATION_PAYMENT_REQUIRED',
      message: 'Purchase the NRPG certification to unlock the training modules.',
    },
    { status: 402 }
  );
}
