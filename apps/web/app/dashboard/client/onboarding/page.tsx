'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Shield, Zap, DollarSign, Award } from 'lucide-react';

export default function ClientOnboardingWelcomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [starting, setStarting] = useState(false);
  const [flowType, setFlowType] = useState<'standard' | 'fast_track'>('standard');
  const [sessionTimeout, setSessionTimeout] = useState(false);

  useEffect(() => {
    // Add timeout for session loading - if session doesn't resolve in 5 seconds, redirect to login
    if (status === 'loading') {
      const timeoutId = setTimeout(() => {
        setSessionTimeout(true);
        router.push('/login');
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [status, router]);

  useEffect(() => {
    // Check if onboarding already started
    if (status === 'authenticated' && session?.user) {
      checkExistingProgress();
    }
  }, [status, session]);

  const checkExistingProgress = async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) return;

    try {
      const response = await fetch(`/api/client/onboarding/progress/${userId}`, { cache: 'no-store' });
      const data = await response.json();

      if (data.success && data.progress.status !== 'PENDING_START') {
        // Already started, redirect to resume URL
        router.push(data.progress.resumeUrl);
      }
    } catch (error) {
      console.error('Failed to check progress:', error);
    }
  };

  const handleStartOnboarding = async (flow: 'standard' | 'fast_track') => {
    setStarting(true);
    try {
      const response = await fetch('/api/client/onboarding/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowType: flow }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(data.resumeUrl);
      } else {
        alert(data.error || 'Failed to start onboarding');
      }
    } catch (error) {
      console.error('Failed to start onboarding:', error);
      alert('Failed to start onboarding. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }

  return (
    <div className="container mx-auto py-12 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to NRPG</h1>
        <p className="text-xl text-muted-foreground">
          Australia's Most Trusted Disaster Recovery Network
        </p>
      </div>

      {/* Value Propositions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Only NRPG-Certified Contractors</h3>
            <p className="text-sm text-muted-foreground">
              Rigorous vetting, mandatory training, insurance verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Restoration Documentation</h3>
            <p className="text-sm text-muted-foreground">
              Professional scope of works and estimates accepted by all major insurers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Zap className="h-12 w-12 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">30-Minute Emergency Response</h3>
            <p className="text-sm text-muted-foreground">
              24/7 availability, rapid dispatch to your location
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <DollarSign className="h-12 w-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Transparent Pricing</h3>
            <p className="text-sm text-muted-foreground">
              No hidden platform fees, what you see is what you pay
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Flow Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Standard Flow */}
        <Card className={`cursor-pointer transition-[border-color,border-width] ${flowType === 'standard' ? 'border-primary border-2' : 'hover:border-primary'}`}
              onClick={() => setFlowType('standard')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Complete Setup</CardTitle>
              <Badge variant={flowType === 'standard' ? 'default' : 'secondary'}>Recommended</Badge>
            </div>
            <CardDescription>Full 7-phase onboarding for best experience</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Profile & property setup</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Insurance & payment details</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>7 disaster recovery education modules</span>
              </li>
              <li className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" />
                <span>Earn "Prepared Client" certificate</span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">
              Estimated time: 15-45 minutes
            </p>
          </CardContent>
        </Card>

        {/* Fast Track Flow */}
        <Card className={`cursor-pointer transition-[border-color,border-width] ${flowType === 'fast_track' ? 'border-orange-500 border-2' : 'hover:border-orange-500'}`}
              onClick={() => setFlowType('fast_track')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quick Start</CardTitle>
              <Badge variant={flowType === 'fast_track' ? 'default' : 'outline'}
                     className={flowType === 'fast_track' ? 'bg-orange-500' : ''}>
                Fast Track
              </Badge>
            </div>
            <CardDescription>Essential 3-phase setup for emergencies</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Profile setup only</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Service preferences</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Property address</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <span className="text-xs">Complete other phases later</span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">
              Estimated time: ~10 minutes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={() => handleStartOnboarding(flowType)}
          disabled={starting}
          className="min-w-[200px]"
        >
          {starting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Starting...
            </>
          ) : (
            `Start ${flowType === 'standard' ? 'Complete' : 'Quick'} Setup →`
          )}
        </Button>
        <p className="text-sm text-muted-foreground mt-4">
          {flowType === 'standard'
            ? 'Get the full NRPG experience with education and certification'
            : 'Get help quickly, complete detailed setup later'}
        </p>
      </div>

      {/* Trust Signals */}
      <div className="mt-16 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Trusted by thousands of Australian property owners
        </p>
        <div className="flex items-center justify-center gap-8 text-xs text-muted-foreground">
          <div>
            <p className="text-2xl font-bold text-foreground">4.8★</p>
            <p>Average Rating</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">30min</p>
            <p>Avg Response Time</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">24/7</p>
            <p>Emergency Support</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">100%</p>
            <p>Certified Contractors</p>
          </div>
        </div>
      </div>
    </div>
  );
}
