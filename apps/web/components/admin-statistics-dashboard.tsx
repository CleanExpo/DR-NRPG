// @ts-nocheck

'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, TrendingDown, Users, Zap, DollarSign, CheckCircle } from 'lucide-react';

interface AdminStatistics {
  bookings: {
    total: number;
    active: number;
    completed: number;
    pending: number;
    cancelled: number;
    weeklyTrend: Array<{ week: string; count: number }>;
    byServiceType: Array<{ type: string; count: number }>;
    byEmergencyLevel: Array<{ level: string; count: number }>;
  };
  claims: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    totalAmountAUD: number;
    averageAmountAUD: number;
    processingTrend: Array<{ week: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
  };
  contractors: {
    total: number;
    active: number;
    pendingVerification: number;
    certified: number;
    averageRating: number;
    totalJobs: number;
    byState: Array<{ state: string; count: number }>;
    certificationBreakdown: Array<{ level: string; count: number }>;
  };
  financial: {
    totalRevenueAUD: number;
    totalPayoutsAUD: number;
    netProfitAUD: number;
    averageBookingValueAUD: number;
    averageClaimAmountAUD: number;
    profitMarginPercent: number;
    monthlyRevenue: Array<{ month: string; revenue: number; payouts: number }>;
  };
  system: {
    averageResponseTimeMs: number;
    systemHealthPercent: number;
    failedTransactionsLast24h: number;
    activeSessionsCount: number;
    pendingVerifications: number;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];
const SERVICE_TYPES = ['WATER_DAMAGE', 'FIRE_DAMAGE', 'STORM_DAMAGE', 'MOLD_REMEDIATION', 'BIOHAZARD_CLEANUP', 'STRUCTURAL_ASSESSMENT', 'CARPET_CLEANING', 'CONTENT_RESTORATION', 'DEHUMIDIFICATION', 'TEMPORARY_REPAIRS', 'CONTENTS_ASSESSMENT', 'FLOOD_DAMAGE', 'SMOKE_DAMAGE', 'EMERGENCY_RESPONSE'];

export default function AdminStatisticsDashboard() {
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    fetchStatistics();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStatistics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data - replace with actual API call
      const mockData: AdminStatistics = {
        bookings: {
          total: 1247,
          active: 43,
          completed: 1089,
          pending: 105,
          cancelled: 10,
          weeklyTrend: [
            { week: 'W1', count: 180 },
            { week: 'W2', count: 215 },
            { week: 'W3', count: 198 },
            { week: 'W4', count: 234 },
          ],
          byServiceType: [
            { type: 'Water Damage', count: 380 },
            { type: 'Fire Damage', count: 210 },
            { type: 'Storm Damage', count: 305 },
            { type: 'Mould', count: 187 },
            { type: 'Others', count: 175 },
          ],
          byEmergencyLevel: [
            { level: 'URGENT', count: 420 },
            { level: 'HIGH', count: 510 },
            { level: 'MEDIUM', count: 245 },
            { level: 'LOW', count: 72 },
          ],
        },
        claims: {
          total: 589,
          approved: 421,
          pending: 134,
          rejected: 34,
          totalAmountAUD: 8_945_670,
          averageAmountAUD: 15_184,
          processingTrend: [
            { week: 'W1', count: 85 },
            { week: 'W2', count: 120 },
            { week: 'W3', count: 98 },
            { week: 'W4', count: 142 },
          ],
          byStatus: [
            { status: 'APPROVED', count: 421 },
            { status: 'PENDING', count: 134 },
            { status: 'REJECTED', count: 34 },
          ],
        },
        contractors: {
          total: 234,
          active: 198,
          pendingVerification: 28,
          certified: 156,
          averageRating: 4.6,
          totalJobs: 3421,
          byState: [
            { state: 'NSW', count: 87 },
            { state: 'VIC', count: 65 },
            { state: 'QLD', count: 54 },
            { state: 'WA', count: 18 },
            { state: 'SA', count: 7 },
            { state: 'TAS', count: 2 },
            { state: 'ACT', count: 1 },
          ],
          certificationBreakdown: [
            { level: 'MASTER', count: 23 },
            { level: 'INSPECTOR', count: 58 },
            { level: 'SUPERVISOR', count: 45 },
            { level: 'TECHNICIAN', count: 30 },
          ],
        },
        financial: {
          totalRevenueAUD: 8_945_670,
          totalPayoutsAUD: 5_367_402,
          netProfitAUD: 3_578_268,
          averageBookingValueAUD: 7_172,
          averageClaimAmountAUD: 15_184,
          profitMarginPercent: 39.9,
          monthlyRevenue: [
            { month: 'Aug', revenue: 1_234_500, payouts: 742_700 },
            { month: 'Sep', revenue: 1_456_700, payouts: 873_000 },
            { month: 'Oct', revenue: 1_678_920, payouts: 1_007_360 },
            { month: 'Nov', revenue: 1_892_350, payouts: 1_135_590 },
            { month: 'Dec', revenue: 2_683_200, payouts: 1_608_752 },
          ],
        },
        system: {
          averageResponseTimeMs: 127,
          systemHealthPercent: 99.7,
          failedTransactionsLast24h: 2,
          activeSessionsCount: 87,
          pendingVerifications: 28,
        },
      };

      setStatistics(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || 'Failed to load statistics'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time platform statistics and insights</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={dateRange === 'week' ? 'default' : 'outline'}
            onClick={() => setDateRange('week')}
          >
            This Week
          </Button>
          <Button
            variant={dateRange === 'month' ? 'default' : 'outline'}
            onClick={() => setDateRange('month')}
          >
            This Month
          </Button>
          <Button variant="outline" onClick={fetchStatistics}>
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Alert */}
      {statistics.system.systemHealthPercent < 99 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            System health: {statistics.system.systemHealthPercent}% - {statistics.system.failedTransactionsLast24h} failed transactions in last 24h
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bookings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistics.bookings.total.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="bg-blue-50">
                <TrendingUp className="h-3 w-3 mr-1" />
                {statistics.bookings.active} Active
              </Badge>
              <span className="text-sm text-gray-400">{statistics.bookings.completed} Completed</span>
            </div>
          </CardContent>
        </Card>

        {/* Claims */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Total Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${(statistics.claims.totalAmountAUD / 1_000_000).toFixed(1)}M</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="bg-green-50">
                <CheckCircle className="h-3 w-3 mr-1" />
                {statistics.claims.approved} Approved
              </Badge>
              <span className="text-sm text-gray-400">{statistics.claims.pending} Pending</span>
            </div>
          </CardContent>
        </Card>

        {/* Contractors */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Contractors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistics.contractors.total}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="bg-purple-50">
                <Users className="h-3 w-3 mr-1" />
                {statistics.contractors.active} Active
              </Badge>
              <span className="text-sm text-gray-400">⭐ {statistics.contractors.averageRating}</span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${(statistics.financial.netProfitAUD / 1_000_000).toFixed(2)}M</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="bg-green-50">
                <DollarSign className="h-3 w-3 mr-1" />
                {statistics.financial.profitMarginPercent.toFixed(1)}% Margin
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="contractors">Contractors</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        {/* Bookings Charts */}
        <TabsContent value="bookings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Booking Trend</CardTitle>
                <CardDescription>Bookings by week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={statistics.bookings.weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bookings by Service Type</CardTitle>
                <CardDescription>Distribution across services</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statistics.bookings.byServiceType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, value }) => `${type}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {statistics.bookings.byServiceType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Response Levels</CardTitle>
              <CardDescription>Bookings by urgency</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistics.bookings.byEmergencyLevel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claims Charts */}
        <TabsContent value="claims" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Claims Processing</CardTitle>
                <CardDescription>Claims processed by week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statistics.claims.processingTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Claims Status Distribution</CardTitle>
                <CardDescription>Current claims by status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statistics.claims.byStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, count }) => `${status}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {statistics.claims.byStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contractors Charts */}
        <TabsContent value="contractors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Contractors by State</CardTitle>
                <CardDescription>Geographic distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statistics.contractors.byState} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="state" type="category" width={40} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certification Levels</CardTitle>
                <CardDescription>Industry certification breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statistics.contractors.certificationBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ level, count }) => `${level}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {statistics.contractors.certificationBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Charts */}
        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue vs Payouts</CardTitle>
              <CardDescription>Financial performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={statistics.financial.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                  <Bar dataKey="payouts" fill="#ef4444" name="Payouts" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(statistics.financial.totalRevenueAUD / 1_000_000).toFixed(2)}M</div>
                <p className="text-xs text-gray-400 mt-1">Avg: ${(statistics.financial.averageBookingValueAUD / 1000).toFixed(1)}K per booking</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">Total Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(statistics.financial.totalPayoutsAUD / 1_000_000).toFixed(2)}M</div>
                <p className="text-xs text-gray-400 mt-1">To contractors and partners</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">Average Claim Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(statistics.financial.averageClaimAmountAUD / 1000).toFixed(1)}K</div>
                <p className="text-xs text-gray-400 mt-1">Per insurance claim</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* System Health Details */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Performance and status metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">System Health</p>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{statistics.system.systemHealthPercent}%</div>
                <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${statistics.system.systemHealthPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">Avg Response Time</p>
              <p className="text-2xl font-bold">{statistics.system.averageResponseTimeMs}ms</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">Active Sessions</p>
              <p className="text-2xl font-bold">{statistics.system.activeSessionsCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
