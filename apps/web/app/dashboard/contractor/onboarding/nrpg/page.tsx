'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, BookOpen, Shield, FileSignature, ChevronRight } from 'lucide-react';
import { NRPGCertificationCard } from '@/src/components/onboarding/NRPGCertificationCard';
import { PointsCategoryTracker } from '@/src/components/onboarding/PointsCategoryTracker';
import { OnboardingPhaseTimeline } from '@/src/components/onboarding/OnboardingPhaseTimeline';
import { CourseCard } from '@/src/components/onboarding/CourseCard';

export default function NRPGDashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [certificationData, setCertificationData] = useState<any>(null);
  const [phasesData, setPhasesData] = useState<any>(null);
  const [coursesData, setCoursesData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [certRes, phasesRes, coursesRes] = await Promise.all([
        fetch('/api/onboarding/nrpg/certification'),
        fetch('/api/onboarding/nrpg/phases'),
        fetch('/api/onboarding/courses'),
      ]);

      const [certData, phasesData, coursesData] = await Promise.all([
        certRes.json(),
        phasesRes.json(),
        coursesRes.json(),
      ]);

      if (certData.success) setCertificationData(certData.data);
      if (phasesData.success) setPhasesData(phasesData.data);
      if (coursesData.success) setCoursesData(coursesData.data);
    } catch (err) {
      console.error('Error fetching NRPG data:', err);
      setError('Failed to load NRPG certification data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchData();
    }
  }, [authStatus, fetchData]);

  if (authStatus === 'loading' || loading) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#00BFA6]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="py-12 text-center">
            <p className="text-gray-400 mb-4">Please sign in to view your NRPG certification</p>
            <Button className="bg-[#00BFA6] hover:bg-[#00A693]">Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/contractor/onboarding"
          className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Onboarding
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">NRPG Certification</h1>
            <p className="text-gray-400">
              National Restoration Professionals Group - 100 Point Certification System
            </p>
          </div>
          <Badge className="bg-[#00BFA6]/10 text-[#00BFA6] border-[#00BFA6]/20 text-sm px-3 py-1">
            Professional Network
          </Badge>
        </div>
      </div>

      {error && (
        <Card className="bg-red-500/10 border-red-500/20 mb-6">
          <CardContent className="py-4">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Certification Card */}
          {certificationData && (
            <NRPGCertificationCard
              totalPoints={certificationData.certification.totalPoints}
              partnershipLevel={certificationData.certification.partnershipLevel}
              levelInfo={certificationData.levelInfo}
              pointsToNextLevel={certificationData.pointsToNextLevel}
              categoryBreakdown={certificationData.categoryBreakdown}
            />
          )}

          {/* Training Courses */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[#00BFA6]" />
                    Training Courses
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Complete training modules to enhance your certification
                  </CardDescription>
                </div>
                <Link href="/dashboard/contractor/onboarding/training">
                  <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {coursesData?.courses?.map((course: any) => (
                <CourseCard
                  key={course.courseId}
                  courseId={course.courseId}
                  courseName={course.courseName}
                  description={course.description}
                  totalModules={course.totalModules}
                  totalHours={course.totalHours}
                  progress={course.progress}
                />
              ))}
            </CardContent>
          </Card>

          {/* Points Breakdown */}
          {certificationData && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Certification Points Breakdown</CardTitle>
                <CardDescription className="text-gray-400">
                  Track your progress across all certification categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PointsCategoryTracker
                  certification={certificationData.certification}
                  onCategoryClick={(cat) => console.log('Category clicked:', cat)}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Phase Timeline */}
          {phasesData && (
            <OnboardingPhaseTimeline
              summary={phasesData.summary}
              onPhaseClick={(phase) => console.log('Phase clicked:', phase)}
            />
          )}

          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-base text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/contractor/onboarding/nrpg/verification" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-700"
                >
                  <Shield className="h-4 w-4 mr-2 text-amber-500" />
                  Background Verification
                </Button>
              </Link>
              <Link href="/dashboard/contractor/onboarding/nrpg/commitment" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-700"
                >
                  <FileSignature className="h-4 w-4 mr-2 text-purple-500" />
                  Sign Commitment Framework
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-base text-white">Resources</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-400 space-y-2">
              <a href="#" className="block hover:text-[#00BFA6] transition-colors">
                → NRPG Certification Framework Guide
              </a>
              <a href="#" className="block hover:text-[#00BFA6] transition-colors">
                → Partnership Level Requirements
              </a>
              <a href="#" className="block hover:text-[#00BFA6] transition-colors">
                → Industry Certification Information
              </a>
              <a href="#" className="block hover:text-[#00BFA6] transition-colors">
                → CARSI Membership Benefits
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
