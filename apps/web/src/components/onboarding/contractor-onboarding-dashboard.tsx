
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModuleCard } from './module-card';
import { CertificationBadge } from './certification-badge';
import { QuizInterface } from './quiz-interface';
import {
  CheckCircle2,
  Circle,
  Clock,
  Award,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Shield,
  ChevronRight,
  FileText,
} from 'lucide-react';

interface OnboardingDashboardProps {
  contractorId: string;
}

interface ProgressData {
  contractorId: string;
  specialization: string;
  completionPercentage: number;
  currentModule: any;
  assessmentScores: any[];
  certificationType: string;
}

export function ContractorOnboardingDashboard({ contractorId }: OnboardingDashboardProps) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [startingPayoutSetup, setStartingPayoutSetup] = useState(false);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/onboarding/progress/${contractorId}`);
      const data = await response.json();

      if (data.success) {
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  }, [contractorId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const handleStartQuiz = (moduleId: string) => {
    setActiveQuiz(moduleId);
  };

  const handleQuizComplete = () => {
    setActiveQuiz(null);
    fetchProgress(); // Refresh progress after quiz completion
  };

  const startPayoutSetup = async () => {
    try {
      setStartingPayoutSetup(true);
      const response = await fetch('/api/contractor/stripe/connect/onboard', { method: 'POST' });
      const data = await response.json();
      if (response.ok && data?.url) {
        window.location.href = data.url as string;
        return;
      }
      throw new Error(data?.error || 'Failed to start payout setup');
    } catch (error) {
      console.error('Failed to start payout setup:', error);
      alert(error instanceof Error ? error.message : 'Failed to start payout setup');
    } finally {
      setStartingPayoutSetup(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your onboarding progress...</p>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Onboarding Record Found</CardTitle>
            <CardDescription>
              Please contact your administrator to start your onboarding process.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (activeQuiz) {
    return (
      <QuizInterface
        moduleId={activeQuiz}
        contractorId={contractorId}
        onComplete={handleQuizComplete}
        onCancel={() => setActiveQuiz(null)}
      />
    );
  }

  const completionColor =
    progress.completionPercentage >= 100 ? 'text-green-600' :
    progress.completionPercentage >= 50 ? 'text-blue-600' :
    'text-yellow-600';

  const passedAssessments = progress.assessmentScores.filter((s: any) => (s.score ?? 0) >= 70);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contractor Onboarding</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and complete your certification
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/contractor/onboarding/checklist">Checklist</Link>
          </Button>
          <Button variant="outline" onClick={startPayoutSetup} disabled={startingPayoutSetup}>
            {startingPayoutSetup ? 'Starting payout setup...' : 'Set up payouts'}
          </Button>
          {progress.completionPercentage >= 100 && (
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/dashboard/contractor/onboarding/certificate">
                <Award className="h-4 w-4 mr-2" />
                View Certificate
              </Link>
            </Button>
          )}
          <CertificationBadge
            certificationType={progress.certificationType}
            completionPercentage={progress.completionPercentage}
          />
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Progress
          </CardTitle>
          <CardDescription>
            Specialization: <Badge variant="secondary">{progress.specialization.toUpperCase()}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Completion</span>
              <span className={`text-2xl font-bold ${completionColor}`}>
                {Math.round(progress.completionPercentage)}%
              </span>
            </div>
            <Progress value={progress.completionPercentage} className="h-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{passedAssessments.length}</p>
                    <p className="text-sm text-muted-foreground">Modules Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {progress.assessmentScores.length > 0
                        ? Math.round(
                            progress.assessmentScores.reduce((acc, s) => acc + s.score, 0) /
                            progress.assessmentScores.length
                          )
                        : 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {progress.currentModule ? 'In Progress' : 'Not Started'}
                    </p>
                    <p className="text-sm text-muted-foreground">Current Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Completion Card */}
      {progress.completionPercentage >= 100 && (
        <Card className="border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                    Training Complete!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    You've successfully completed all required modules. Download your certificate now.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href="/dashboard/contractor/onboarding/certificate">
                    <FileText className="h-4 w-4 mr-2" />
                    View Certificate
                  </Link>
                </Button>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/dashboard/contractor/onboarding/certificate?action=download">
                    <Award className="h-4 w-4 mr-2" />
                    Download PDF
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Module */}
      {progress.currentModule && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Current Module
                </CardTitle>
                <CardDescription className="mt-1">
                  Continue where you left off
                </CardDescription>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ModuleCard
              module={progress.currentModule}
              onStartQuiz={handleStartQuiz}
              highlighted
            />
          </CardContent>
        </Card>
      )}

      {/* NRPG Certification Section */}
      <Card className="border-[#00BFA6]/30 bg-gradient-to-br from-gray-900 to-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-[#00BFA6]" />
                NRPG Certification
              </CardTitle>
              <CardDescription className="text-gray-400">
                100-Point Professional Certification System
              </CardDescription>
            </div>
            <Badge className="bg-[#00BFA6]/10 text-[#00BFA6] border-[#00BFA6]/20">
              Professional Network
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/contractor/onboarding/nrpg" className="group">
              <div className="p-4 rounded-lg border border-gray-700 hover:border-[#00BFA6]/50 transition-colors bg-gray-800/50">
                <div className="flex items-center justify-between mb-2">
                  <Award className="h-5 w-5 text-[#00BFA6]" />
                  <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-[#00BFA6] transition-colors" />
                </div>
                <h4 className="font-medium text-white">Certification Dashboard</h4>
                <p className="text-xs text-gray-400 mt-1">Track your points and level progress</p>
              </div>
            </Link>
            <Link href="/dashboard/contractor/onboarding/training" className="group">
              <div className="p-4 rounded-lg border border-gray-700 hover:border-[#00BFA6]/50 transition-colors bg-gray-800/50">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="h-5 w-5 text-purple-400" />
                  <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-[#00BFA6] transition-colors" />
                </div>
                <h4 className="font-medium text-white">Training Courses</h4>
                <p className="text-xs text-gray-400 mt-1">Professional training modules</p>
              </div>
            </Link>
            <Link href="/dashboard/contractor/onboarding/nrpg/verification" className="group">
              <div className="p-4 rounded-lg border border-gray-700 hover:border-[#00BFA6]/50 transition-colors bg-gray-800/50">
                <div className="flex items-center justify-between mb-2">
                  <Shield className="h-5 w-5 text-amber-400" />
                  <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-[#00BFA6] transition-colors" />
                </div>
                <h4 className="font-medium text-white">Background Verification</h4>
                <p className="text-xs text-gray-400 mt-1">Complete required checks</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Assessment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Assessment History
          </CardTitle>
          <CardDescription>Your completed module assessments</CardDescription>
        </CardHeader>
        <CardContent>
          {progress.assessmentScores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Circle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No assessments completed yet</p>
              <p className="text-sm mt-1">Start your first module to begin!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {progress.assessmentScores.map((assessment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">{assessment.moduleId}</p>
                      <p className="text-sm text-muted-foreground">
                        Completed {new Date(assessment.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{assessment.score}%</p>
                    <Badge
                      variant={
                        assessment.score >= 90 ? 'default' :
                        assessment.score >= 70 ? 'secondary' :
                        'destructive'
                      }
                    >
                      {assessment.score >= 90 ? 'Excellent' :
                       assessment.score >= 70 ? 'Passed' :
                       'Needs Review'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Items */}
      {progress.completionPercentage < 100 && (
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Complete these actions to progress</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-muted-foreground" />
                <span>Complete remaining training modules</span>
              </li>
              <li className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-muted-foreground" />
                <span>Pass all module assessments with 70% or higher</span>
              </li>
              <li className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-muted-foreground" />
                <span>Review and understand all course materials</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
