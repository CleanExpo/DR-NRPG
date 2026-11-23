/**
 * Contractor Eligibility Service
 *
 * Single Source of Truth for contractor "Ready for Dispatch" status
 *
 * Eligibility Requirements:
 * 1. Preferences Complete
 * 2. Profile Complete
 * 3. NRPG Registration Submitted (and optionally verified)
 * 4. Training Complete (100% modules passed)
 * 5. Payouts Configured (Stripe charges + payouts enabled)
 */

import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import {
  NRPG_CANONICAL_MODULE_COUNT,
  countNrpgCanonicalModulesPassed,
  isNrpgTrainingSetComplete,
} from '@/lib/training/training-policy';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as any })
  : null;

export interface EligibilityCheck {
  requirement: string;
  status: 'complete' | 'incomplete' | 'pending';
  label: string;
  description: string;
  actionUrl?: string;
  actionText?: string;
}

export interface EligibilityResult {
  isEligible: boolean;
  readyForDispatch: boolean;
  completionPercentage: number;
  checks: EligibilityCheck[];
  incompleteRequirements: string[];
  nextAction?: {
    requirement: string;
    label: string;
    url: string;
    buttonText: string;
  };
}

/**
 * Check contractor eligibility for marketplace access
 */
export async function checkContractorEligibility(userId: string): Promise<EligibilityResult> {
  const checks: EligibilityCheck[] = [];

  // 1. Check Preferences
  const preferences = await prisma.contractorPreferences.findUnique({
    where: { userId },
  });

  const preferencesComplete = Boolean(preferences?.isOnboardingComplete);
  checks.push({
    requirement: 'preferences',
    status: preferencesComplete ? 'complete' : 'incomplete',
    label: 'Preferences Set',
    description: 'Service categories, locations, and availability configured',
    actionUrl: '/dashboard/contractor/preferences',
    actionText: 'Set preferences',
  });

  // 2. Check Profile
  const profile = await prisma.contractorProfile.findUnique({
    where: { userId },
  });

  const profileComplete = Boolean(
    profile &&
    profile.businessName &&
    profile.phone &&
    profile.services.length > 0 &&
    profile.serviceAreas.length > 0
  );

  checks.push({
    requirement: 'profile',
    status: profileComplete ? 'complete' : 'incomplete',
    label: 'Profile Complete',
    description: 'Business name, contact info, and service details provided',
    actionUrl: '/dashboard/contractor/profile-setup',
    actionText: 'Complete profile',
  });

  // 3. Check NRPG Registration
  const contractor = await prisma.contractor.findUnique({
    where: { userId },
    include: {
      iicrcCertifications: true,
    },
  });

  const nrpgSubmitted = Boolean(contractor?.nrpgMemberId);
  const nrpgVerified = contractor?.nrpgVerificationLevel === 'VERIFIED';

  checks.push({
    requirement: 'nrpg',
    status: nrpgVerified ? 'complete' : nrpgSubmitted ? 'pending' : 'incomplete',
    label: 'NRPG Registration',
    description: nrpgVerified
      ? 'Verified NRPG member'
      : nrpgSubmitted
      ? 'Registration submitted, pending admin verification'
      : 'Submit ABN, certification, and insurance details',
    actionUrl: '/dashboard/contractor/onboarding/nrpg-registration',
    actionText: nrpgSubmitted ? 'View registration' : 'Submit registration',
  });

  // 4. Check Training Completion
  // NOTE (DR-879, Option B): lifecycle tables key `contractorId` on User.id, not
  // Contractor.id. Querying by `userId` here is CORRECT — do not "fix" it to resolve
  // Contractor.id (that mismatch was the regression reverted in #159).
  // See lib/contractor-identity.ts for the convention.
  const onboarding = await prisma.contractorOnboarding.findUnique({
    where: { contractorId: userId },
    include: {
      moduleProgress: true,
      assessments: true,
    },
  });

  // DR-893: completion is set-equality against the canonical NRP-001..024
  // module set (single-sourced in training-policy) — never a count of seeded
  // rows, which a short-seeded onboarding (e.g. 5/5) or duplicate ids would fool.
  const totalModules = onboarding?.moduleProgress.length || 0;
  const completedModuleIds =
    onboarding?.moduleProgress
      .filter((m: { status: string }) => m.status === 'COMPLETED')
      .map((m: { moduleId: string }) => m.moduleId) || [];
  const completedCanonicalModules = countNrpgCanonicalModulesPassed(completedModuleIds);
  const trainingComplete = isNrpgTrainingSetComplete(completedModuleIds);

  checks.push({
    requirement: 'training',
    status: trainingComplete ? 'complete' : totalModules > 0 ? 'pending' : 'incomplete',
    label: 'Training Complete',
    description: trainingComplete
      ? 'All required modules passed'
      : `${completedCanonicalModules}/${NRPG_CANONICAL_MODULE_COUNT} modules passed`,
    actionUrl: '/dashboard/contractor/onboarding',
    actionText: trainingComplete ? 'View certificate' : 'Continue training',
  });

  // 5. Check Payouts Configuration
  let payoutsConfigured = false;
  let payoutsStatus: 'complete' | 'incomplete' | 'pending' = 'incomplete';
  let payoutsDescription = 'Connect Stripe account to receive payments';

  if (profile?.stripeConnectAccountId && stripe) {
    try {
      const account = await stripe.accounts.retrieve(profile.stripeConnectAccountId);
      const chargesEnabled = account.charges_enabled;
      const payoutsEnabled = account.payouts_enabled;
      payoutsConfigured = chargesEnabled && payoutsEnabled;

      if (payoutsConfigured) {
        payoutsStatus = 'complete';
        payoutsDescription = 'Stripe account fully configured';
      } else if (account.details_submitted) {
        payoutsStatus = 'pending';
        const currentlyDue = account.requirements?.currently_due || [];
        if (currentlyDue.length > 0) {
          payoutsDescription = `Pending: ${currentlyDue.length} requirement(s) needed`;
        } else {
          payoutsDescription = 'Verification in progress';
        }
      } else {
        payoutsStatus = 'incomplete';
        payoutsDescription = 'Complete Stripe Connect onboarding';
      }
    } catch (error) {
      payoutsStatus = 'incomplete';
      payoutsDescription = 'Stripe account error - reconnect required';
    }
  } else if (profile?.stripeConnectAccountId) {
    payoutsStatus = 'pending';
    payoutsDescription = 'Stripe account created, verification pending';
  }

  checks.push({
    requirement: 'payouts',
    status: payoutsStatus,
    label: 'Payouts Configured',
    description: payoutsDescription,
    actionUrl: '/dashboard/contractor/onboarding/payouts',
    actionText: payoutsConfigured ? 'Manage payouts' : 'Set up payouts',
  });

  // Calculate eligibility
  const allComplete = checks.every((c) => c.status === 'complete');
  const completeCount = checks.filter((c) => c.status === 'complete').length;
  const completionPercentage = (completeCount / checks.length) * 100;

  // Allow dispatch if all complete OR if pending items are only verification (not contractor action needed)
  const pendingOnly = checks.filter((c) => c.status === 'incomplete').length === 0;
  const readyForDispatch = allComplete || (pendingOnly && nrpgSubmitted);

  // Find next action (first incomplete requirement)
  const nextIncomplete = checks.find((c) => c.status === 'incomplete');
  const nextAction = nextIncomplete
    ? {
        requirement: nextIncomplete.requirement,
        label: nextIncomplete.label,
        url: nextIncomplete.actionUrl || '/dashboard/contractor',
        buttonText: nextIncomplete.actionText || 'Complete',
      }
    : undefined;

  const incompleteRequirements = checks
    .filter((c) => c.status !== 'complete')
    .map((c) => c.label);

  return {
    isEligible: allComplete,
    readyForDispatch,
    completionPercentage,
    checks,
    incompleteRequirements,
    nextAction,
  };
}

/**
 * Check if contractor is allowed to bid on jobs
 */
export async function canContractorBid(userId: string): Promise<boolean> {
  const eligibility = await checkContractorEligibility(userId);
  return eligibility.readyForDispatch;
}

/**
 * Get user-friendly eligibility message
 */
export function getEligibilityMessage(result: EligibilityResult): string {
  if (result.isEligible) {
    return 'Ready for dispatch! You can now bid on service requests.';
  }

  if (result.readyForDispatch) {
    return 'Almost ready! Your application is under review.';
  }

  const count = result.incompleteRequirements.length;
  if (count === 1) {
    return `Complete ${result.incompleteRequirements[0]} to start receiving jobs`;
  }

  return `Complete ${count} more requirements to start receiving jobs`;
}
