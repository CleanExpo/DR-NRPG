/**
 * DesignOS NRPG Contractor Dashboard Page Template
 *
 * Demonstrates DesignOS usage for contractor portal (LinkedIn-style)
 * Uses: StatCard, IncidentTable, Header, Toast, IICRCBadge
 *
 * Strategic decisions implemented:
 * - LinkedIn-style professional network
 * - All three metrics visible (earnings, completion, rating)
 * - High-density CRM table (20+ incidents per screen)
 * - Leaderboard integration
 * - 30-second auto-refresh with subtle notifications
 */

'use client';

import * as React from 'react';
import {
  StatCard,
  IncidentTable,
  Header,
  Toast,
  IICRCBadgeGroup,
  Button,
  type Incident,
  useBrandTheme,
} from '@/design-system';
import { DollarSign, CheckCircle, Star, TrendingUp } from 'lucide-react';

const mockIncidents: Incident[] = [
  {
    id: '2374',
    priority: 'critical',
    clientName: 'John Smith',
    type: 'Sewage Backup',
    location: 'Sydney CBD',
    status: 'new',
    ageMinutes: 12,
  },
  {
    id: '2373',
    priority: 'high',
    clientName: 'ABC Strata',
    type: 'Water Leak',
    location: 'Bondi',
    status: 'matching',
    ageMinutes: 45,
  },
  {
    id: '2372',
    priority: 'medium',
    clientName: 'Sarah Johnson',
    type: 'Mould Inspection',
    location: 'Parramatta',
    status: 'assigned',
    assignedTo: 'Tech 1',
    ageMinutes: 120,
  },
];

export function NRPGDashboardPageTemplate() {
  const brand = useBrandTheme();
  const [showToast, setShowToast] = React.useState(false);
  const [incidents, setIncidents] = React.useState<Incident[]>(mockIncidents);
  const [lastRefresh, setLastRefresh] = React.useState(new Date());

  // Simulate 30-second auto-refresh (strategic decision)
  React.useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new incident
      setShowToast(true);
      setLastRefresh(new Date());

      // Hide toast after 5 seconds
      setTimeout(() => setShowToast(false), 5000);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-nrpg-bg">
      <Header logoText="NRPG" phoneNumber="" emergencyCTA={false} />

      {/* Auto-refresh notification (subtle) */}
      {showToast && (
        <Toast
          variant="info"
          title="2 new incidents"
          message="Critical sewage backup in Sydney CBD"
          duration={5000}
          onClose={() => setShowToast(false)}
          action={{
            label: 'View Now',
            onClick: () => console.log('View incident'),
          }}
        />
      )}

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-nrpg-heading mb-2">
            Welcome back, ABC Restoration
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-nrpg-text-secondary">Pro Tier</p>
            <span className="text-nrpg-text-muted">•</span>
            <p className="text-nrpg-text-secondary">Sydney Metro</p>
          </div>

          {/* IICRC Certifications */}
          <div className="mt-4">
            <IICRCBadgeGroup codes={['FSRT', 'WRT']} />
          </div>
        </div>

        {/* Stats Cards - All Three Metrics Visible (Strategic Decision) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Total Earnings"
            value="$47,382"
            sublabel="Year to Date"
            trend="+12% vs last month"
            trendDirection="up"
            icon={DollarSign}
            iconColor="emerald"
            helpText="Shows experience and trust from clients"
          />

          <StatCard
            label="Job Completion Rate"
            value="98%"
            sublabel="147 of 150 jobs completed"
            trend="+2% vs last quarter"
            trendDirection="up"
            icon={CheckCircle}
            iconColor="blue"
            helpText="Reliability metric affecting rotation priority"
          />

          <StatCard
            label="Average Rating"
            value="4.8★"
            sublabel="from 127 client reviews (private)"
            trend="Top 5% of network"
            icon={Star}
            iconColor="amber"
            helpText="Client satisfaction from private feedback"
          />
        </div>

        {/* Leaderboard Position */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Your Rankings</h3>
              <p className="text-sm text-muted-foreground">Performance across Australia</p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Global Rank</p>
              <p className="text-2xl font-bold text-nrpg-primary">#37</p>
              <p className="text-xs text-green-600">↑ Up 12 places this month</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sydney Metro Rank</p>
              <p className="text-2xl font-bold text-nrpg-primary">#4</p>
              <p className="text-xs text-green-600">↑ Top 5 in region</p>
            </div>
          </div>

          <Button variant="nrpg-outline" size="sm" className="mt-4 w-full">
            View Full Leaderboard →
          </Button>
        </div>

        {/* Available Incidents - High-Density Table (Strategic Decision) */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Available Jobs</h2>
          <IncidentTable
            incidents={incidents}
            onIncidentClick={(incident) => console.log('Clicked:', incident)}
            onRefresh={async () => {
              console.log('Refreshing incidents...');
              setLastRefresh(new Date());
            }}
            lastRefreshTime={lastRefresh}
          />
        </div>

        {/* Subscription Usage */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Usage (Pro Tier)</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Jobs This Month</span>
                <span className="font-medium">23 / 50</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-nrpg-secondary" style={{ width: '46%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Team Seats</span>
                <span className="font-medium">3 / 5</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: '60%' }} />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Next billing date: Jan 15, 2026 • $299.00 AUD
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * This template demonstrates:
 * - NRPG brand (navy/gold palette)
 * - LinkedIn-style professional network feel
 * - All three metrics visible (earnings, completion, rating)
 * - High-density CRM table (20+ incidents viewable)
 * - Leaderboard integration (global + regional)
 * - Auto-refresh with subtle toast notifications
 * - Subscription usage visualization
 * - Professional stats cards
 * - IICRC certification display
 */
