'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, Circle, ArrowRight, Award, Lock } from 'lucide-react';
import { newRequestHref } from '@/lib/onboarding/new-request-link';

interface ChecklistStatus {
  profileComplete: boolean;
  servicesComplete: boolean;
  propertyComplete: boolean;
  insuranceComplete: boolean;
  paymentComplete: boolean;
  communicationComplete: boolean;
  educationComplete: boolean;
  progressivePhasesUnlocked: boolean;
  completionPercentage: number;
  tier: string;
  flowVariant: string;
}

export default function ClientOnboardingChecklistPage() {
  const { status, data: session } = useSession();
  const userId = useMemo(() => (session?.user as any)?.id as string | undefined, [session]);

  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState<ChecklistStatus | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        // Fetch eligibility (contains all requirement statuses)
        const response = await fetch('/api/client/eligibility', { cache: 'no-store' });
        const data = await response.json();

        if (data.success) {
          // Map eligibility checks to checklist status
          const checks = data.checks || [];
          setChecklist({
            profileComplete: checks.find((c: any) => c.requirement === 'profile')?.status === 'complete',
            servicesComplete: checks.find((c: any) => c.requirement === 'services')?.status === 'complete',
            propertyComplete: checks.find((c: any) => c.requirement === 'property')?.status === 'complete',
            insuranceComplete: checks.find((c: any) => c.requirement === 'insurance')?.status === 'complete',
            paymentComplete: checks.find((c: any) => c.requirement === 'payment')?.status === 'complete',
            communicationComplete: checks.find((c: any) => c.requirement === 'communication')?.status === 'complete',
            educationComplete: checks.find((c: any) => c.requirement === 'education')?.status === 'complete',
            progressivePhasesUnlocked: data.progressivePhasesUnlocked || false,
            completionPercentage: data.completionPercentage || 0,
            tier: data.tier || 'standard',
            flowVariant: data.flowVariant || 'standard',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      void load();
    }
  }, [status, userId]);

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
            <CardTitle>Client Onboarding</CardTitle>
            <CardDescription>Sign in to view your onboarding progress.</CardDescription>
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

  if (loading || !checklist) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Card>
          <CardContent className="py-12 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your progress…
          </CardContent>
        </Card>
      </div>
    );
  }

  const corePhases = [
    {
      key: 'profile',
      title: 'Profile Setup',
      description: 'Contact information and preferences',
      complete: checklist.profileComplete,
      href: '/dashboard/client/onboarding/profile',
      action: checklist.profileComplete ? 'Update profile' : 'Setup profile',
      required: true,
    },
    {
      key: 'services',
      title: 'Service Preferences',
      description: 'Service types, urgency, and budget preferences',
      complete: checklist.servicesComplete,
      href: '/dashboard/client/onboarding/services',
      action: checklist.servicesComplete ? 'Update preferences' : 'Set preferences',
      required: true,
    },
    {
      key: 'property',
      title: 'Property Details',
      description: 'Address, property type, and access information',
      complete: checklist.propertyComplete,
      href: '/dashboard/client/onboarding/property',
      action: checklist.propertyComplete ? 'Update property' : 'Add property',
      required: true,
    },
  ];

  const progressivePhases = [
    {
      key: 'insurance',
      title: 'Insurance Information',
      description: 'Insurance policy details and document upload',
      complete: checklist.insuranceComplete,
      href: '/dashboard/client/onboarding/insurance',
      action: checklist.insuranceComplete ? 'Update insurance' : 'Add insurance',
      required: false,
      locked: !checklist.progressivePhasesUnlocked,
    },
    {
      key: 'payment',
      title: 'Payment Method',
      description: 'Payment method and billing information',
      complete: checklist.paymentComplete,
      href: '/dashboard/client/onboarding/payment',
      action: checklist.paymentComplete ? 'Update payment' : 'Add payment',
      required: false,
      locked: !checklist.progressivePhasesUnlocked,
    },
    {
      key: 'communication',
      title: 'Communication Preferences',
      description: 'Notification settings and contact preferences',
      complete: checklist.communicationComplete,
      href: '/dashboard/client/onboarding/communication',
      action: checklist.communicationComplete ? 'Update preferences' : 'Set preferences',
      required: false,
      locked: !checklist.progressivePhasesUnlocked,
    },
    {
      key: 'education',
      title: 'Education Modules',
      description: 'Learn about disaster recovery (7 modules)',
      complete: checklist.educationComplete,
      href: '/dashboard/client/onboarding/education',
      action: checklist.educationComplete ? 'Review modules' : 'Start learning',
      required: false,
      locked: !checklist.progressivePhasesUnlocked,
    },
  ];

  const allPhases = [...corePhases, ...progressivePhases];
  const allComplete = allPhases.every((p) => p.complete);
  const coreComplete = corePhases.every((p) => p.complete);

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Client Onboarding Checklist</h1>
        <p className="text-muted-foreground mt-1">
          Complete the core phases to start creating service requests. Additional phases unlock progressively.
        </p>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <CardTitle>Your Progress</CardTitle>
              <CardDescription className="mt-2">
                {coreComplete
                  ? '✓ Core setup complete - you can create service requests now!'
                  : 'Complete core phases to unlock full platform access'}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={allComplete ? 'default' : coreComplete ? 'secondary' : 'outline'}
                     className={allComplete ? 'bg-green-600' : coreComplete ? 'bg-blue-600' : ''}>
                {allComplete ? 'All Complete' : coreComplete ? 'Core Complete' : 'In Progress'}
              </Badge>
              {checklist.tier !== 'standard' && (
                <Badge variant="outline" className="text-purple-600 border-purple-600">
                  {checklist.tier.replace('_', ' ').toUpperCase()} Tier
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Overall Completion</span>
              <span className="text-muted-foreground">{Math.round(checklist.completionPercentage)}%</span>
            </div>
            <Progress value={checklist.completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Core Phases (Required) */}
      <Card>
        <CardHeader>
          <CardTitle>Core Setup (Required)</CardTitle>
          <CardDescription>
            Complete these 3 phases to create service requests and get matched with contractors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {corePhases.map((step) => (
            <div key={step.key} className="flex items-start justify-between gap-3 rounded-lg border p-4">
              <div className="flex items-start gap-3 flex-1">
                {step.complete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{step.title}</p>
                    {step.required && !step.complete && (
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                </div>
              </div>
              <Button asChild variant={step.complete ? 'outline' : 'default'} className="flex-shrink-0">
                <Link href={step.href}>
                  {step.action}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Progressive Phases (Optional - Unlock after core or 7 days) */}
      <Card className={!checklist.progressivePhasesUnlocked ? 'opacity-60' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Enhanced Features (Optional)
                {!checklist.progressivePhasesUnlocked && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                {checklist.progressivePhasesUnlocked
                  ? 'Complete these for enhanced matching and priority support'
                  : 'Unlocks after core setup, first request, or 7 days'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {progressivePhases.map((step) => (
            <div
              key={step.key}
              className={`flex items-start justify-between gap-3 rounded-lg border p-4 ${
                step.locked ? 'bg-muted/30' : ''
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                {step.locked ? (
                  <Lock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                ) : step.complete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-medium ${step.locked ? 'text-muted-foreground' : ''}`}>
                      {step.title}
                    </p>
                    {!step.required && (
                      <Badge variant="secondary" className="text-xs">
                        Optional
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                </div>
              </div>
              <Button
                asChild
                variant={step.complete ? 'outline' : 'default'}
                className="flex-shrink-0"
                disabled={step.locked}
              >
                <Link href={step.href}>
                  {step.locked ? 'Locked' : step.action}
                  {!step.locked && <ArrowRight className="h-4 w-4 ml-2" />}
                </Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Completion Certificate Card */}
      {allComplete && (
        <Card className="border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                    Onboarding Complete - You're a Prepared Client!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    You've completed all phases and are ready to create service requests.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button asChild variant="outline" className="border-green-600 text-green-700">
                  <Link href="/dashboard/client/onboarding/certificate">
                    View Certificate
                  </Link>
                </Button>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href={newRequestHref()}>
                    <Award className="h-4 w-4 mr-2" />
                    Create Request
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Core Complete But Not All Complete */}
      {coreComplete && !allComplete && (
        <Card className="border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    You're Ready to Create Requests!
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Core setup complete. Complete optional phases for enhanced features and priority support.
                  </p>
                </div>
              </div>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 flex-shrink-0">
                <Link href={newRequestHref()}>
                  Create Service Request →
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
