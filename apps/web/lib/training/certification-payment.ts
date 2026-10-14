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
 * - Once checkout is configured, training modules and quizzes require a paid
 *   certification for contractors. While it is NOT configured, module access is
 *   unchanged, so nobody is locked out of training they cannot pay for.
 */
import { NextResponse } from 'next/server';
import type { User } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ErrorCode } from '@/lib/api-errors';

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

export async function hasPaidCertification(userId: string): Promise<boolean> {
  const paid = await prisma.onboardingPayment.findFirst({
    where: { contractorId: userId, status: CERTIFICATION_PAYMENT_STATUS.PAID },
    select: { id: true },
  });
  return Boolean(paid);
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
  if (await hasPaidCertification(user.id)) return null;

  return NextResponse.json(
    {
      error: ErrorCode.FORBIDDEN,
      code: 'CERTIFICATION_PAYMENT_REQUIRED',
      message: 'Purchase the NRPG certification to unlock the training modules.',
    },
    { status: 402 }
  );
}
