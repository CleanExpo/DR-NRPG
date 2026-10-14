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
 * - Grandfathering: a contractor who started training (any NRPGTrainingProgress
 *   row) or holds an NRP certification record created before the cut-off keeps
 *   access without paying. Only contractors who start after the cut-off pay.
 */
import { NextResponse } from 'next/server';
import type { User } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ErrorCode } from '@/lib/api-errors';
import { NRPG_CERTIFICATION_NAME } from '@/lib/training/training-policy';

/** Stripe Checkout metadata.type for certification sessions. */
export const NRPG_CERTIFICATION_PAYMENT_TYPE = 'NRPG_CERTIFICATION';

export const CERTIFICATION_PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
} as const;

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
    where: { contractorId: userId, status: CERTIFICATION_PAYMENT_STATUS.PAID },
    select: { id: true },
  });
  return Boolean(paid);
}

/** True iff `sessionId` is this contractor's own, paid certification checkout. */
export async function isPaidCertificationSession(userId: string, sessionId: string): Promise<boolean> {
  const paid = await prisma.onboardingPayment.findFirst({
    where: { contractorId: userId, stripeSessionId: sessionId, status: CERTIFICATION_PAYMENT_STATUS.PAID },
    select: { id: true },
  });
  return Boolean(paid);
}

/** Started training or held an NRP certification before the paywall cut-off. */
export async function isGrandfathered(userId: string, activatedAt: Date): Promise<boolean> {
  const [progress, certification] = await Promise.all([
    prisma.nRPGTrainingProgress.findFirst({
      where: { contractorId: userId, createdAt: { lt: activatedAt } },
      select: { id: true },
    }),
    prisma.contractorCertification.findFirst({
      where: { contractorId: userId, certificationName: NRPG_CERTIFICATION_NAME, createdAt: { lt: activatedAt } },
      select: { id: true },
    }),
  ]);
  return Boolean(progress || certification);
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
