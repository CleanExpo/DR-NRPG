'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Circle, ArrowRight, Award, FileText, Shield, BookOpen, FileSignature, AlertCircle, RefreshCw } from 'lucide-react';
import { evaluateNrpgRetakePolicy } from '@/lib/training/training-policy';
import { formatTrainingModuleLabel } from '@/lib/training/module-names';
import { RetakeCountdown } from '@/src/components/onboarding/retake-countdown';

// DR-918: fetch with a hard timeout so a hung endpoint can't spin the checklist forever.
const FETCH_TIMEOUT_MS = 10_000;
const fetchWithTimeout = (url: string) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { cache: 'no-store', signal: controller.signal }).finally(() => clearTimeout(timer));
};

// DR-919: retake state for a FAILED module quiz, mirrored from the DR-894
// server policy (`retake` payload / evaluateNrpgRetakePolicy).
interface QuizRetakeState {
  maxAttempts: number;
  attemptsUsed: number;
  attemptsRemaining: number;
  locked: boolean;
  cooldownUntil: string | null;
}

interface ChecklistStatus {
  preferencesComplete: boolean;
  profileComplete: boolean;
  nrpgRegistrationComplete: boolean;
  trainingInProgress: boolean;
  trainingComplete: boolean;
  quizFailed: boolean;
  quizRetake?: QuizRetakeState;
  payoutsConfigured: boolean;
  currentModuleId?: string;
  completionPercentage?: number;
  stripeAccountId?: string;
  nrpgStatus?: 'pending' | 'approved' | 'rejected';
  nrpgRejectionReason?: string | null;
  // NRPG Certification status
  nrpgBackgroundComplete: boolean;
  nrpgCommitmentSigned: boolean;
  nrpgCertificationPoints?: number;
  nrpgPartnershipLevel?: string;
}

export default function ContractorOnboardingChecklistPage() {
  const { status, data: session } = useSession();
  const userId = useMemo(() => (session?.user as any)?.id as string | undefined, [session]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistStatus | null>(null);

  const load = useCallback(async () => {
      if (!userId) return;
      setLoading(true);
      setLoadError(false);
      try {
        const [preferencesRes, profileRes, nrpgRes, onboardingRes, stripeRes, nrpgCertRes, nrpgPhasesRes] = await Promise.all([
          fetchWithTimeout('/api/contractor/preferences'),
          fetchWithTimeout('/api/contractor/profile'),
          fetchWithTimeout('/api/contractors/me'),
          fetchWithTimeout(`/api/onboarding/progress/${userId}`),
          fetchWithTimeout('/api/contractor/stripe/connect/status'),
          fetchWithTimeout('/api/onboarding/nrpg/certification'),
          fetchWithTimeout('/api/onboarding/nrpg/phases'),
        ]);

        const preferences = await preferencesRes.json().catch(() => null);
        const profilePayload = await profileRes.json().catch(() => null);
        const nrpgPayload = await nrpgRes.json().catch(() => null);
        const onboardingPayload = await onboardingRes.json().catch(() => null);
        const stripePayload = await stripeRes.json().catch(() => null);
        const nrpgCertPayload = await nrpgCertRes.json().catch(() => null);
        const nrpgPhasesPayload = await nrpgPhasesRes.json().catch(() => null);

        const preferencesComplete = Boolean(preferences?.isOnboardingComplete);
        const profileComplete = Boolean(profilePayload?.profile?.isProfileComplete);
        const nrpgRegistrationComplete = Boolean(nrpgPayload?.success && nrpgPayload?.contractor?.nrpgMemberId);
        const completionPercentage = Number(onboardingPayload?.progress?.completionPercentage ?? 0);
        const trainingInProgress = onboardingRes.ok && completionPercentage > 0 && completionPercentage < 100;
        const trainingComplete = onboardingRes.ok && completionPercentage >= 100;
        const payoutsConfigured = Boolean(stripePayload?.success && stripePayload?.payoutsConfigured);

        // Extract detailed data for deep linking
        const currentModule = onboardingPayload?.progress?.currentModule ?? null;
        const currentModuleId = currentModule?.moduleId;
        const stripeAccountId = stripePayload?.stripeConnectAccountId;

        // DR-919: a FAILED current module means the contractor failed its quiz.
        // Mirror the DR-894 retake policy off the persisted attempt history the
        // progress API already exposes, so the checklist can show retake /
        // cooldown / locked states. The server stays authoritative — an admin
        // reset flips the module back to IN_PROGRESS, which clears this state.
        const quizFailed = currentModule?.status === 'FAILED';
        let quizRetake: QuizRetakeState | undefined;
        if (quizFailed && currentModuleId) {
          type AssessmentScore = { moduleId?: string; score?: number; completedAt?: string };
          const attempts = ((onboardingPayload?.progress?.assessmentScores ?? []) as AssessmentScore[])
            .filter((a) => a?.moduleId === currentModuleId)
            .map((a) => ({
              score: typeof a?.score === 'number' ? a.score : null,
              completedAt: a?.completedAt ? new Date(a.completedAt) : null,
              createdAt: a?.completedAt ? new Date(a.completedAt) : new Date(0),
              feedback: null,
            }));
          const decision = evaluateNrpgRetakePolicy(attempts);
          quizRetake = {
            maxAttempts: decision.maxAttempts,
            attemptsUsed: decision.attemptsUsed,
            attemptsRemaining: decision.attemptsRemaining,
            locked: decision.reason === 'ATTEMPT_CAP',
            cooldownUntil:
              decision.reason === 'COOLDOWN' && decision.retryAt ? decision.retryAt.toISOString() : null,
          };
        }

        // DR-918: /api/contractors/me exposes the NRPG review outcome as nrpgVerificationLevel
        // (REJECTED / PENDING_INFO / VERIFIED). Also honour verificationStatus if present.
        const rawNrpgLevel = String(
          nrpgPayload?.contractor?.verificationStatus ?? nrpgPayload?.contractor?.nrpgVerificationLevel ?? ''
        ).toLowerCase();
        const nrpgStatus: ChecklistStatus['nrpgStatus'] =
          rawNrpgLevel === 'rejected'
            ? 'rejected'
            : rawNrpgLevel === 'verified' || rawNrpgLevel === 'approved'
              ? 'approved'
              : nrpgRegistrationComplete
                ? 'pending'
                : undefined;

        // DR-918: if rejected, best-effort fetch of the reviewer's rejection reason.
        let nrpgRejectionReason: string | null = null;
        if (nrpgStatus === 'rejected') {
          const verificationPayload = await fetchWithTimeout('/api/contractor/verification/profile')
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null);
          nrpgRejectionReason = verificationPayload?.contractor?.rejectionReason ?? null;
        }

        // NRPG Certification data
        const nrpgBackgroundComplete = Boolean(nrpgPhasesPayload?.data?.summary?.backgroundChecks?.allPass);
        const nrpgCommitmentSigned = Boolean(nrpgPhasesPayload?.data?.summary?.phase3?.checklist?.find((c: any) => c.key === 'commitmentSigned')?.complete);
        const nrpgCertificationPoints = nrpgCertPayload?.data?.certification?.totalPoints || 0;
        const nrpgPartnershipLevel = nrpgCertPayload?.data?.certification?.partnershipLevel || 'CANDIDATE';

        setChecklist({
          preferencesComplete,
          profileComplete,
          nrpgRegistrationComplete,
          trainingInProgress,
          trainingComplete,
          quizFailed,
          quizRetake,
          payoutsConfigured,
          currentModuleId,
          completionPercentage,
          stripeAccountId,
          nrpgStatus,
          nrpgRejectionReason,
          nrpgBackgroundComplete,
          nrpgCommitmentSigned,
          nrpgCertificationPoints,
          nrpgPartnershipLevel,
        });
      } catch (err) {
        // DR-918: a failed or timed-out fetch renders a visible error state, not an endless spinner.
        console.error('Error loading onboarding checklist:', err);
        setChecklist(null);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
  }, [userId]);

  useEffect(() => {
    if (status === 'authenticated') {
      void load();
    }
  }, [status, load]);

  if (status === 'loading') {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Card>
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Contractor Onboarding</CardTitle>
            <CardDescription>Sign in to continue your onboarding checklist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => void signIn()} className="w-full" size="lg">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // DR-918: distinct error state (with retry) — not the same as loading, not a silent dead end.
  if (!loading && loadError) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              We couldn&apos;t load your onboarding status
            </CardTitle>
            <CardDescription>
              The request failed or timed out. Your progress is safe — try again, or contact support if this keeps happening.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => void load()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">Contact support</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || !checklist) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Card>
          <CardContent className="py-12 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your onboarding status…
          </CardContent>
        </Card>
      </div>
    );
  }

  // DR-919: never show a contractor a raw internal module id ("cse-001").
  const currentModuleName = checklist.currentModuleId
    ? formatTrainingModuleLabel(checklist.currentModuleId)
    : undefined;

  // Generate smart deep links based on current state
  const getTrainingHref = () => {
    // DR-919: attempts exhausted — the module is locked pending admin review,
    // so the only useful destination is support.
    if (checklist.quizFailed && checklist.quizRetake?.locked) {
      return '/contact';
    }
    if (checklist.currentModuleId) {
      return `/dashboard/contractor/onboarding/module/${checklist.currentModuleId}`;
    }
    return '/dashboard/contractor/onboarding';
  };

  const getTrainingAction = () => {
    if (checklist.trainingComplete) {
      return 'Review training';
    }
    // DR-919: failed quiz gets a distinct retake CTA per the DR-894 policy.
    if (checklist.quizFailed) {
      if (checklist.quizRetake?.locked) {
        return 'Contact support';
      }
      if (checklist.quizRetake?.cooldownUntil) {
        return 'Review module';
      }
      return `Retake: ${currentModuleName ?? 'module'}`;
    }
    if (checklist.trainingInProgress && currentModuleName) {
      return `Continue: ${currentModuleName}`;
    }
    if (checklist.trainingInProgress) {
      return `Resume training (${Math.round(checklist.completionPercentage || 0)}%)`;
    }
    return 'Start training';
  };

  const getNRPGAction = () => {
    if (checklist.nrpgStatus === 'rejected') {
      return 'Fix and resubmit';
    }
    if (checklist.nrpgRegistrationComplete) {
      return checklist.nrpgStatus === 'pending' ? 'View status (pending)' : 'View registration';
    }
    return 'Submit registration';
  };

  const getPayoutsAction = () => {
    if (checklist.payoutsConfigured) {
      return 'Manage payouts';
    }
    if (checklist.stripeAccountId) {
      return 'Complete Stripe setup';
    }
    return 'Set up payouts';
  };

  // DR-919: failed-quiz messaging per the DR-894 retake policy — retake CTA,
  // cooldown countdown, or attempts-exhausted (locked) pointing to support.
  const retake = checklist.quizRetake;
  const trainingErrorTitle = checklist.quizFailed
    ? retake?.locked
      ? 'Attempts exhausted — contact support'
      : `Failed — retake module ${currentModuleName ?? ''}`.trim()
    : undefined;
  const trainingErrorContext = checklist.quizFailed ? (
    retake?.locked ? (
      <>
        You&apos;ve used all {retake.maxAttempts} attempts for {currentModuleName ?? 'this module'}. The
        quiz is locked pending admin review — contact our support team to request a reset.
      </>
    ) : retake?.cooldownUntil ? (
      <>
        You didn&apos;t pass this time. You can retake the quiz in{' '}
        <RetakeCountdown until={retake.cooldownUntil} /> — {retake.attemptsRemaining} of{' '}
        {retake.maxAttempts} attempts remaining. Use the time to review the module content.
      </>
    ) : (
      <>
        You didn&apos;t pass this time. Review the module content, then retake the quiz
        {retake ? <> — {retake.attemptsRemaining} of {retake.maxAttempts} attempts remaining</> : null}.
      </>
    )
  ) : undefined;

  const steps = [
    {
      key: 'preferences',
      title: 'Set your preferences',
      description: 'Service categories, locations, availability, and theme.',
      complete: checklist.preferencesComplete,
      href: '/dashboard/contractor/preferences',
      action: checklist.preferencesComplete ? 'Update preferences' : 'Set preferences',
      icon: null,
    },
    {
      key: 'profile',
      title: 'Complete your profile',
      description: 'Business details, services, service areas, insurance and bio.',
      complete: checklist.profileComplete,
      href: '/dashboard/contractor/profile-setup',
      action: checklist.profileComplete ? 'Update profile' : 'Complete profile',
      icon: null,
    },
    {
      key: 'nrpg',
      title: 'NRPG registration',
      description: 'Submit ABN, certification and insurance details for NRPG verification.',
      // A rejected registration is not complete — it needs to be fixed and resubmitted.
      complete: checklist.nrpgRegistrationComplete && checklist.nrpgStatus !== 'rejected',
      href: '/dashboard/contractor/onboarding/nrpg-registration',
      action: getNRPGAction(),
      statusBadge:
        checklist.nrpgStatus === 'rejected'
          ? 'Rejected'
          : checklist.nrpgStatus === 'pending'
            ? 'Under review'
            : undefined,
      statusBadgeTone: checklist.nrpgStatus === 'rejected' ? ('error' as const) : ('warning' as const),
      errorTitle: 'Registration rejected',
      errorContext:
        checklist.nrpgStatus === 'rejected'
          ? checklist.nrpgRejectionReason ||
            'Your registration was reviewed and could not be approved. Check the email we sent you for the reviewer’s notes, update your ABN, certification and insurance details, then resubmit.'
          : undefined,
      icon: null,
    },
    {
      key: 'nrpg-verification',
      title: 'Background verification',
      description: 'Complete criminal, financial, professional, and insurance checks.',
      complete: checklist.nrpgBackgroundComplete,
      href: '/dashboard/contractor/onboarding/nrpg/verification',
      action: checklist.nrpgBackgroundComplete ? 'View verification' : 'Start verification',
      icon: Shield,
      iconColour: 'text-amber-500',
    },
    {
      key: 'nrpg-commitment',
      title: 'Sign commitment framework',
      description: 'Review and sign the NRPG professional commitment.',
      complete: checklist.nrpgCommitmentSigned,
      href: '/dashboard/contractor/onboarding/nrpg/commitment',
      action: checklist.nrpgCommitmentSigned ? 'View commitment' : 'Sign commitment',
      icon: FileSignature,
      iconColour: 'text-purple-500',
    },
    {
      key: 'training',
      title: 'Complete training',
      description: 'Finish required modules and pass assessments (70%+).',
      complete: checklist.trainingComplete,
      // DR-919: a failed quiz is a distinct state, not generic "in progress".
      inProgress: checklist.trainingInProgress && !checklist.quizFailed,
      href: getTrainingHref(),
      action: getTrainingAction(),
      statusBadge: checklist.quizFailed
        ? retake?.locked
          ? 'Locked'
          : 'Quiz failed'
        : undefined,
      statusBadgeTone: 'error' as const,
      errorTitle: trainingErrorTitle,
      errorContext: trainingErrorContext,
      progressText: checklist.trainingInProgress && checklist.completionPercentage
        ? `${Math.round(checklist.completionPercentage)}% complete`
        : undefined,
      icon: BookOpen,
      iconColour: 'text-blue-500',
    },
    {
      key: 'payouts',
      title: 'Set up payouts',
      description: 'Connect your Stripe account to receive payments.',
      complete: checklist.payoutsConfigured,
      href: '/dashboard/contractor/onboarding/payouts',
      action: getPayoutsAction(),
      statusBadge: checklist.stripeAccountId && !checklist.payoutsConfigured ? 'Setup incomplete' : undefined,
      icon: null,
    },
  ] as const;

  const allComplete = steps.every((s) => s.complete);

  // Resume point (DR-883): the first incomplete step. Each step has its own URL, so the
  // "Continue" CTA deep-links the returning contractor straight to where they left off.
  const firstIncompleteIndex = steps.findIndex((s) => !s.complete);
  const nextStep = firstIncompleteIndex >= 0 ? steps[firstIncompleteIndex] : null;
  const currentStepNumber = firstIncompleteIndex >= 0 ? firstIncompleteIndex + 1 : steps.length;

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-4">
      {nextStep && (
        <Card className="border-emerald-500/40 bg-emerald-50/60">
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Continue — Step {currentStepNumber} of {steps.length}
              </p>
              <p className="text-sm text-muted-foreground">{nextStep.title}</p>
            </div>
            <Button asChild className="flex-shrink-0">
              <Link href={nextStep.href}>
                {nextStep.action}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Contractor Onboarding Checklist</CardTitle>
              <CardDescription>Complete each step to become ready for dispatch.</CardDescription>
            </div>
            <Badge variant={allComplete ? 'default' : 'secondary'} className={allComplete ? 'bg-green-600' : ''}>
              {allComplete ? 'Ready for dispatch' : 'In progress'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((step) => {
            const StepIcon = step.icon;
            return (
            <div key={step.key} className="flex items-start justify-between gap-3 rounded-lg border p-4">
              <div className="flex items-start gap-3 flex-1">
                {step.complete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : StepIcon ? (
                  <StepIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${'iconColour' in step ? step.iconColour : 'text-muted-foreground'}`} />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{step.title}</p>
                    {!step.complete && 'inProgress' in step && step.inProgress && (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        In progress
                      </Badge>
                    )}
                    {'statusBadge' in step && step.statusBadge && (
                      <Badge
                        variant="outline"
                        className={
                          'statusBadgeTone' in step && step.statusBadgeTone === 'error'
                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                            : 'text-amber-600 border-amber-600'
                        }
                      >
                        {step.statusBadge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                  {/* DR-918/DR-919: failure states (rejected registration, failed quiz)
                      render their error context + recovery guidance */}
                  {'errorContext' in step && step.errorContext && (
                    <div className="mt-2 rounded-md border border-red-500/20 bg-red-500/10 p-3">
                      <p className="text-sm font-semibold text-red-500 flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {('errorTitle' in step && step.errorTitle) || 'Action required'}
                      </p>
                      <p className="text-sm text-red-500/90 mt-1">{step.errorContext}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Need help?{' '}
                        <Link href="/contact" className="underline text-red-500">
                          Contact our support team
                        </Link>
                      </p>
                    </div>
                  )}
                  {'progressText' in step && step.progressText && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">{step.progressText}</p>
                  )}
                </div>
              </div>
              <Button asChild variant={step.complete ? 'outline' : 'default'} className="flex-shrink-0">
                <Link href={step.href}>
                  {step.action}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          );
          })}
        </CardContent>
      </Card>

      {/* Certificate Card - Shows when training is complete */}
      {checklist.trainingComplete && (
        <Card className="border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                    Your NRPG Training Certificate is Ready!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    You've completed all required modules. View and download your official NRPG certificate.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button asChild variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
                  <Link href="/dashboard/contractor/onboarding/certificate">
                    <FileText className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </Button>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/dashboard/contractor/onboarding/certificate?action=download">
                    <Award className="h-4 w-4 mr-2" />
                    Download
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
