/**
 * Contractor Dashboard - NRPG Growth Portal
 *
 * Premium contractor dashboard with earth-tone design system.
 * Features:
 * - Magazine-style stats cards
 * - Partnership opportunities table
 * - Featured stories and resources
 * - Brand compliance tracking
 * - Professional profile management
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  StatsCard,
  FeaturedStory,
  OpportunityTable,
  ComplianceSection,
} from '@/components/portal';
import ContractorOnboarding from '@/components/onboarding/contractor-onboarding';
import FloatingChatWidget from '@/components/floating-chat-widget';
import { EligibilityBanner } from '@/components/contractor/eligibility-banner';
import { RealtimeNotifications } from '@/components/realtime/RealtimeNotifications';
import { TrendingUp, DollarSign, Briefcase, Users, Power, Clock, AlertCircle, RefreshCw } from 'lucide-react';

// DR-918: fetch with a hard timeout so a hung endpoint renders the error state instead of spinning forever.
const FETCH_TIMEOUT_MS = 10_000;
const fetchWithTimeout = (url: string) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { cache: 'no-store', signal: controller.signal }).finally(() => clearTimeout(timer));
};

interface DashboardStats {
  activeOpportunities: number;
  pendingBids: number;
  completedProjects: number;
  totalEarnings: number;
  conversionRate: number;
  avgProjectValue: number;
}

interface Opportunity {
  id: string;
  type: string;
  priority: 'Elite' | 'Strategic' | 'New Market' | 'Standard';
  location: string;
  distance: string;
  potentialValue: string;
  imageUrl?: string;
}

interface AvailabilityStatus {
  status: 'available' | 'unavailable' | 'suspended' | 'inactive';
  isActive: boolean;
  isSuspended: boolean;
  unavailableUntil: string | null;
  minutesRemaining: number;
  canReceiveNewJobs: boolean;
}

export default function ContractorDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [contractorPreferences, setContractorPreferences] = useState<any>(null);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeOpportunities: 0,
    pendingBids: 0,
    completedProjects: 0,
    totalEarnings: 0,
    conversionRate: 0,
    avgProjectValue: 0,
  });
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  // DR-918: distinguish "the opportunities API failed" from "there are genuinely no jobs".
  const [opportunitiesError, setOpportunitiesError] = useState(false);
  const [retryingOpportunities, setRetryingOpportunities] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityStatus | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    } else if (user && user.userType === 'ADMIN') {
      router.push('/dashboard/admin');
    } else if (user && user.userType === 'CLIENT') {
      router.push('/dashboard/client');
    } else if (user && user.userType === 'CONTRACTOR') {
      checkOnboardingStatus();
      fetchDashboardData();
    }
  }, [user, loading, router]);

  const checkOnboardingStatus = async () => {
    try {
      setLoadingPreferences(true);
      const response = await fetch('/api/contractor/preferences', {
        cache: 'no-store',
      });

      if (response.ok) {
        const preferences = await response.json();
        setContractorPreferences(preferences);

        if (!preferences || !preferences.isOnboardingComplete) {
          setShowOnboarding(true);
        } else {
          setShowOnboarding(false);
        }
      } else {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setShowOnboarding(true);
    } finally {
      setLoadingPreferences(false);
    }
  };

  // DR-918: opportunities load has its own error handling so an API failure renders a visible
  // error state (with retry) instead of silently falling back to sample data.
  const fetchOpportunities = async () => {
    setRetryingOpportunities(true);
    setOpportunitiesError(false);
    try {
      const opportunitiesResponse = await fetchWithTimeout('/api/contractor/available-requests');
      if (!opportunitiesResponse.ok) {
        throw new Error(`Opportunities request failed with status ${opportunitiesResponse.status}`);
      }

      const data = await opportunitiesResponse.json();
      const availableRequests = data.data || [];

      // Map API response to opportunity format
      const mappedOpportunities: Opportunity[] = availableRequests.slice(0, 10).map((req: any) => ({
        id: req.id,
        type: req.type || req.serviceTitle || 'Service Request',
        priority: req.priority || 'Standard',
        location: req.location || 'Location not specified',
        distance: req.distance || 'Distance unknown',
        potentialValue: req.potentialValue || 'Quote Required',
        imageUrl: undefined,
      }));

      // An empty list is a genuine empty state — render "no jobs available", never sample data.
      setOpportunities(mappedOpportunities);
      if (mappedOpportunities.length > 0) {
        setStats((prev) => ({
          ...prev,
          activeOpportunities: mappedOpportunities.length,
        }));
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setOpportunities([]);
      setOpportunitiesError(true);
    } finally {
      setRetryingOpportunities(false);
    }
  };

  const fetchDashboardData = async () => {
    void fetchOpportunities();
    try {
      // Fetch contractor stats
      const [statsResponse, projectsResponse, analyticsResponse] = await Promise.all([
        fetchWithTimeout('/api/contractor/profile'),
        fetchWithTimeout('/api/contractor/active-projects'),
        fetchWithTimeout('/api/contractor/analytics'),
      ]);

      if (statsResponse.ok) {
        const data = await statsResponse.json();
        const profile = data.profile;
        setStats((prev) => ({
          ...prev,
          completedProjects: profile?.totalJobs || 0,
          totalEarnings: profile?.totalEarnings || 0,
        }));
      }

      if (projectsResponse.ok) {
        const data = await projectsResponse.json();
        const projects = data.projects || [];
        setStats((prev) => ({
          ...prev,
          activeOpportunities: projects.length,
        }));
      }

      // Update stats with analytics data
      if (analyticsResponse.ok) {
        const data = await analyticsResponse.json();
        if (data.success && data.analytics) {
          const { overview, bookingStats, performance } = data.analytics;
          setStats((prev) => ({
            ...prev,
            completedProjects: bookingStats.completed || prev.completedProjects,
            totalEarnings: performance?.totalEarnings || prev.totalEarnings,
            activeOpportunities: bookingStats.active || prev.activeOpportunities,
            pendingBids: bookingStats.thisMonth || prev.pendingBids,
            conversionRate: overview.conversionRate || prev.conversionRate,
            avgProjectValue: performance?.averageProjectValue || prev.avgProjectValue,
          }));
        }
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchAvailability = async (signal?: AbortSignal) => {
    try {
      const response = await fetch('/api/contractor/availability', {
        cache: 'no-store',
        signal,
      });

      if (response.ok) {
        const data = await response.json();
        setAvailability(data.availability);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Error fetching availability:', error);
    }
  };

  const handleToggleAvailability = async () => {
    if (availability?.status === 'suspended') {
      return; // Cannot toggle if suspended
    }

    const willBeUnavailable = availability?.status === 'available';

    if (willBeUnavailable) {
      setShowConfirmDialog(true);
    } else {
      await performToggle(true);
    }
  };

  const performToggle = async (available: boolean) => {
    setLoadingAvailability(true);
    setShowConfirmDialog(false);

    try {
      const response = await fetch('/api/contractor/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available }),
      });

      if (response.ok) {
        const data = await response.json();
        setAvailability(data.availability);
      } else {
        const error = await response.json();
        console.error('Failed to toggle availability:', error.message);
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleCancelUnavailability = async () => {
    setLoadingAvailability(true);

    try {
      const response = await fetch('/api/contractor/availability', {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        setAvailability(data.availability);
      }
    } catch (error) {
      console.error('Error cancelling unavailability:', error);
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Auto-refresh availability every 60 seconds
  useEffect(() => {
    if (user && user.userType === 'CONTRACTOR') {
      const controller = new AbortController();
      fetchAvailability(controller.signal);
      const interval = setInterval(() => {
        const c = new AbortController();
        fetchAvailability(c.signal);
      }, 60000);
      return () => {
        controller.abort();
        clearInterval(interval);
      };
    }
  }, [user]);

  const handleOnboardingComplete = async (preferences: any) => {
    try {
      setLoadingPreferences(true);
      const response = await fetch('/api/contractor/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        const savedPreferences = await response.json();
        setContractorPreferences(savedPreferences.preferences);
        setShowOnboarding(false);
      } else {
        console.error('Failed to save contractor preferences');
      }
    } catch (error) {
      console.error('Error saving contractor preferences:', error);
    } finally {
      setLoadingPreferences(false);
    }
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    setLoadingPreferences(false);
  };

  if (loading || loadingPreferences) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nrpg-teal"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Eligibility Banner */}
      <EligibilityBanner />

      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-portal-text font-heading">
            Welcome back, {user?.name?.split(' ')[0] || 'Partner'}
          </h1>
          <p className="text-portal-muted font-body mt-1">
            Here's your growth summary for today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RealtimeNotifications userId={user.id} />
          <span className="hidden md:inline-block px-4 py-2 bg-nrpg-teal/10 text-nrpg-teal text-sm font-bold font-heading rounded-full uppercase tracking-wider">
            Growth Partner
          </span>
        </div>
      </div>

      {/* Availability Toggle */}
      {availability && (
        <div className="bg-white border border-earth-primary/20 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${
                availability.status === 'available'
                  ? 'bg-portal-success/10'
                  : availability.status === 'suspended'
                  ? 'bg-red-500/10'
                  : 'bg-portal-muted/10'
              }`}>
                <Power className={`size-6 ${
                  availability.status === 'available'
                    ? 'text-portal-success'
                    : availability.status === 'suspended'
                    ? 'text-red-500'
                    : 'text-portal-muted'
                }`} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-portal-text font-heading">
                    Job Availability
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    availability.status === 'available'
                      ? 'bg-portal-success/10 text-portal-success'
                      : availability.status === 'suspended'
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-portal-muted/10 text-portal-muted'
                  }`}>
                    {availability.status}
                  </span>
                </div>
                <p className="text-portal-muted text-sm mt-1">
                  {availability.status === 'available'
                    ? 'You are currently receiving new job offers'
                    : availability.status === 'suspended'
                    ? 'Your account is suspended. Contact support for assistance.'
                    : availability.status === 'inactive'
                    ? 'Your account is inactive. Contact support to reactivate.'
                    : `You will not receive new job offers for ${availability.minutesRemaining} more minutes`
                  }
                </p>
                {availability.status === 'unavailable' && availability.minutesRemaining > 0 && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Clock className="size-4 text-portal-muted" />
                    <span className="text-sm text-portal-muted">
                      Unavailable for {availability.minutesRemaining} more minute{availability.minutesRemaining !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={handleCancelUnavailability}
                      disabled={loadingAvailability}
                      className="ml-2 text-sm text-nrpg-teal hover:text-nrpg-teal/80 font-medium underline disabled:opacity-50"
                    >
                      Cancel and become available now
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleToggleAvailability}
                disabled={loadingAvailability || availability.status === 'suspended' || availability.status === 'inactive'}
                className={`relative inline-flex h-11 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-nrpg-teal focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  availability.status === 'available'
                    ? 'bg-portal-success'
                    : 'bg-portal-muted/40'
                }`}
              >
                <span className="sr-only">Toggle availability</span>
                <span
                  className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-lg transition-transform ${
                    availability.status === 'available' ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <AlertCircle className="size-6 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-portal-text font-heading">
                  Pause Job Notifications?
                </h3>
                <p className="text-portal-muted text-sm mt-2">
                  You will not receive new job offers for the next 30 minutes. Already-sent offers will remain valid and you can still respond to them.
                </p>
                <div className="flex items-center space-x-3 mt-6">
                  <button
                    onClick={() => performToggle(false)}
                    disabled={loadingAvailability}
                    className="flex-1 px-4 py-2 bg-nrpg-teal text-white rounded-lg hover:bg-nrpg-teal/90 font-medium disabled:opacity-50"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    disabled={loadingAvailability}
                    className="flex-1 px-4 py-2 bg-portal-hover text-portal-text rounded-lg hover:bg-portal-border font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Opportunities"
          value={stats.activeOpportunities.toString()}
          trend={{ value: '+12%', direction: 'up' }}
        />
        <StatsCard
          title="Pending Bids"
          value={stats.pendingBids.toString()}
          trend={{ value: '+3', direction: 'up' }}
        />
        <StatsCard
          title="Projects Completed"
          value={stats.completedProjects.toString()}
          subtitle="This quarter"
        />
        <StatsCard
          title="Total Earnings"
          value={`$${stats.totalEarnings.toLocaleString()}`}
          trend={{ value: '+8%', direction: 'up' }}
          subtitle="YTD"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Partnership Opportunities */}
          {opportunitiesError ? (
            /* DR-918: API failure is visibly different from an empty job list, and retryable */
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-portal-text flex items-center gap-2 font-heading">
                Partnership Opportunities
              </h3>
              <div className="bg-white border border-red-500/20 rounded-xl shadow-lg p-12 text-center">
                <div className="mx-auto w-fit p-3 bg-red-500/10 rounded-full">
                  <AlertCircle className="size-6 text-red-500" />
                </div>
                <p className="text-portal-text font-bold font-heading mt-4">
                  We couldn&apos;t load opportunities
                </p>
                <p className="text-portal-muted text-sm font-body mt-1">
                  The request failed or timed out — this doesn&apos;t mean there are no jobs available.
                </p>
                <button
                  onClick={() => void fetchOpportunities()}
                  disabled={retryingOpportunities}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-nrpg-teal hover:bg-nrpg-teal/90 text-white text-sm font-bold font-heading rounded-lg disabled:opacity-50"
                >
                  <RefreshCw className={`size-4 mr-2 ${retryingOpportunities ? 'animate-spin' : ''}`} />
                  {retryingOpportunities ? 'Retrying…' : 'Retry'}
                </button>
              </div>
            </div>
          ) : (
            <OpportunityTable
              opportunities={opportunities}
              title="Partnership Opportunities"
              viewAllHref="/dashboard/contractor/opportunities"
            />
          )}
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-8">
          {/* Featured Story */}
          <FeaturedStory
            badge="Growth Spotlight"
            title="How NRPG Partners Grow Their Restoration Businesses"
            description="Discover the strategies our top-performing contractors use to grow their restoration businesses with the NRPG network."
            imageUrl="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"
            href="/dashboard/contractor/training"
          />

          {/* Brand & Compliance */}
          <ComplianceSection
            nextSession="Dec 15, 2024"
            progress={82}
          />
        </div>
      </div>

      {/* Contractor Onboarding Modal */}
      {showOnboarding && (
        <ContractorOnboarding
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      {/* Floating Chat Widget */}
      {user && (
        <FloatingChatWidget
          currentUserId={user.id}
          currentUserType={user.userType as 'CLIENT' | 'CONTRACTOR' | 'ADMIN'}
        />
      )}
    </div>
  );
}
