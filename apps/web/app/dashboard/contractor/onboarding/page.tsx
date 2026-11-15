'use client';

import { useEffect, useMemo, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { ContractorOnboardingDashboard } from '@/components/onboarding/contractor-onboarding-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Rocket } from 'lucide-react';

type ContractorSpecialisation = 'water' | 'fire' | 'mould' | 'combined';

interface OnboardingStartFormState {
  businessName: string;
  specialization: ContractorSpecialisation;
  experience: number;
  certifications: string;
}

export default function ContractorOnboardingPage() {
  const { data: session, status } = useSession();
  const sessionUserId = useMemo(() => (session?.user as any)?.id as string | undefined, [session]);

  const [contractorId, setContractorId] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<OnboardingStartFormState>({
    businessName: '',
    specialization: 'water',
    experience: 0,
    certifications: '',
  });

  useEffect(() => {
    if (status === 'authenticated' && sessionUserId) {
      setContractorId(sessionUserId);
    }
  }, [sessionUserId, status]);

  useEffect(() => {
    const checkExisting = async () => {
      if (!contractorId) return;

      try {
        const response = await fetch(`/api/onboarding/progress/${contractorId}`, { cache: 'no-store' });
        const data = await response.json().catch(() => null);
        setShowSetup(!(response.ok && data?.success && data?.progress));
      } catch {
        setShowSetup(true);
      }
    };

    void checkExisting();
  }, [contractorId]);

  const handleStartOnboarding = async () => {
    if (!contractorId) return;

    try {
      setLoading(true);

      const response = await fetch('/api/onboarding/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractorId,
          businessName: formData.businessName,
          specialization: formData.specialization,
          experience: formData.experience,
          certifications: formData.certifications
            .split(',')
            .map(c => c.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowSetup(false);
      } else {
        alert(`Failed to start onboarding: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to start onboarding:', error);
      alert('Failed to start onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
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
            <CardDescription>Sign in to access onboarding and training modules.</CardDescription>
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

  if (!contractorId) {
    return null;
  }

  if (!showSetup) {
    return <ContractorOnboardingDashboard contractorId={contractorId} />;
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-6 w-6" />
            Start Your Onboarding Journey
          </CardTitle>
          <CardDescription>
            Personalise your training path based on your experience and goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              placeholder="ABC Restoration Services"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Specialisation</Label>
            <Select
              value={formData.specialization}
              onValueChange={(value) => setFormData({ ...formData, specialization: value as ContractorSpecialisation })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="water">Water Damage Restoration</SelectItem>
                <SelectItem value="fire">Fire & Smoke Restoration</SelectItem>
                <SelectItem value="mould">Mould Remediation</SelectItem>
                <SelectItem value="combined">Combined Specialisation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Years of Experience</Label>
            <Input
              id="experience"
              type="number"
              min="0"
              max="50"
              placeholder="5"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certifications">Current Certifications (comma-separated)</Label>
            <Input
              id="certifications"
              placeholder="Water Restoration Technician (WRT), Applied Structural Drying (ASD)"
              value={formData.certifications}
              onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Leave blank if you have no certifications yet</p>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleStartOnboarding}
              disabled={loading || !formData.businessName}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Your Path...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Start Onboarding
                </>
              )}
            </Button>
          </div>

          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm font-medium mb-2">What happens next?</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>NRPG creates a training path based on your profile</li>
              <li>Complete modules at your own pace (target: 30 days)</li>
              <li>Pass module assessments to unlock the next steps</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

