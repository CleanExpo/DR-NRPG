// @ts-nocheck

'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertCircle, TrendingUp, TrendingDown, Star, Clock, CheckCircle, DollarSign } from 'lucide-react';

interface ContractorMetrics {
  id: string;
  name: string;
  company: string;
  rating: number;
  reviewCount: number;
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  completionRate: number;
  averageResponseTimeMinutes: number;
  averageJobDurationHours: number;
  totalEarningsAUD: number;
  monthlyEarningsAUD: number;
  jobsByType: Array<{ type: string; count: number }>;
  monthlyTrend: Array<{ month: string; jobs: number; revenue: number }>;
  state: string;
  certifications: Array<{ level: string; expiryDate: string; isValid: boolean }>;
  lastActiveDate: string;
}

interface DashboardData {
  topPerformers: ContractorMetrics[];
  averageMetrics: {
    rating: number;
    completionRate: number;
    responseTime: number;
    monthlyEarnings: number;
  };
  performanceTiers: Array<{ tier: string; count: number; avgRating: number }>;
  earningsByState: Array<{ state: string; earnings: number; contractors: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

export default function ContractorPerformanceDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedContractor, setSelectedContractor] = useState<ContractorMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data - replace with actual API call
      const mockData: DashboardData = {
        topPerformers: [
          {
            id: '1',
            name: 'John Smith',
            company: 'Sydney Restoration Pro',
            rating: 4.9,
            reviewCount: 87,
            totalJobs: 234,
            completedJobs: 227,
            pendingJobs: 7,
            completionRate: 97.0,
            averageResponseTimeMinutes: 12,
            averageJobDurationHours: 8.5,
            totalEarningsAUD: 124_560,
            monthlyEarningsAUD: 12_345,
            state: 'NSW',
            certifications: [
              { level: 'MASTER', expiryDate: '2026-03-15', isValid: true },
              { level: 'INSPECTOR', expiryDate: '2025-08-20', isValid: true },
            ],
            lastActiveDate: '2025-12-22',
            jobsByType: [
              { type: 'Water Damage', count: 89 },
              { type: 'Fire Damage', count: 45 },
              { type: 'Storm Damage', count: 67 },
              { type: 'Mould', count: 33 },
            ],
            monthlyTrend: [
              { month: 'Aug', jobs: 18, revenue: 9_200 },
              { month: 'Sep', jobs: 21, revenue: 10_800 },
              { month: 'Oct', jobs: 19, revenue: 9_950 },
              { month: 'Nov', jobs: 23, revenue: 11_840 },
              { month: 'Dec', jobs: 25, revenue: 12_345 },
            ],
          },
          {
            id: '2',
            name: 'Maria Rodriguez',
            company: 'Melbourne Disaster Recovery',
            rating: 4.8,
            reviewCount: 76,
            totalJobs: 198,
            completedJobs: 193,
            pendingJobs: 5,
            completionRate: 97.5,
            averageResponseTimeMinutes: 15,
            averageJobDurationHours: 7.8,
            totalEarningsAUD: 118_240,
            monthlyEarningsAUD: 11_920,
            state: 'VIC',
            certifications: [
              { level: 'INSPECTOR', expiryDate: '2025-10-10', isValid: true },
              { level: 'SUPERVISOR', expiryDate: '2026-05-20', isValid: true },
            ],
            lastActiveDate: '2025-12-22',
            jobsByType: [
              { type: 'Water Damage', count: 78 },
              { type: 'Mould', count: 42 },
              { type: 'Storm Damage', count: 54 },
              { type: 'Fire Damage', count: 24 },
            ],
            monthlyTrend: [
              { month: 'Aug', jobs: 16, revenue: 8_200 },
              { month: 'Sep', jobs: 19, revenue: 9_700 },
              { month: 'Oct', jobs: 17, revenue: 8_900 },
              { month: 'Nov', jobs: 21, revenue: 10_800 },
              { month: 'Dec', jobs: 23, revenue: 11_920 },
            ],
          },
          {
            id: '3',
            name: 'David Chen',
            company: 'Brisbane Rapid Response',
            rating: 4.7,
            reviewCount: 64,
            totalJobs: 156,
            completedJobs: 151,
            pendingJobs: 5,
            completionRate: 96.8,
            averageResponseTimeMinutes: 18,
            averageJobDurationHours: 9.2,
            totalEarningsAUD: 94_320,
            monthlyEarningsAUD: 9_540,
            state: 'QLD',
            certifications: [
              { level: 'SUPERVISOR', expiryDate: '2026-01-30', isValid: true },
              { level: 'TECHNICIAN', expiryDate: '2025-07-15', isValid: false },
            ],
            lastActiveDate: '2025-12-22',
            jobsByType: [
              { type: 'Storm Damage', count: 67 },
              { type: 'Water Damage', count: 52 },
              { type: 'Mould', count: 28 },
              { type: 'Fire Damage', count: 9 },
            ],
            monthlyTrend: [
              { month: 'Aug', jobs: 12, revenue: 6_400 },
              { month: 'Sep', jobs: 15, revenue: 8_100 },
              { month: 'Oct', jobs: 14, revenue: 7_500 },
              { month: 'Nov', jobs: 17, revenue: 9_100 },
              { month: 'Dec', jobs: 18, revenue: 9_540 },
            ],
          },
        ],
        averageMetrics: {
          rating: 4.6,
          completionRate: 95.8,
          responseTime: 22,
          monthlyEarnings: 8_450,
        },
        performanceTiers: [
          { tier: 'Platinum (4.8+)', count: 23, avgRating: 4.85 },
          { tier: 'Gold (4.5-4.7)', count: 67, avgRating: 4.62 },
          { tier: 'Silver (4.0-4.4)', count: 78, avgRating: 4.18 },
          { tier: 'Bronze (3.5-3.9)', count: 45, avgRating: 3.71 },
          { tier: 'Standard (<3.5)', count: 21, avgRating: 3.12 },
        ],
        earningsByState: [
          { state: 'NSW', earnings: 2_145_670, contractors: 87 },
          { state: 'VIC', earnings: 1_876_450, contractors: 65 },
          { state: 'QLD', earnings: 1_543_210, contractors: 54 },
          { state: 'WA', earnings: 456_780, contractors: 18 },
          { state: 'SA', earnings: 234_560, contractors: 7 },
          { state: 'TAS', earnings: 89_340, contractors: 2 },
          { state: 'ACT', earnings: 45_670, contractors: 1 },
        ],
      };

      setDashboardData(mockData);
      setSelectedContractor(mockData.topPerformers[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center text-red-600">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        {error || 'Failed to load contractor performance data'}
      </div>
    );
  }

  const filteredContractors = dashboardData.topPerformers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Contractor Performance</h1>
        <p className="text-gray-400 mt-1">Monitor contractor metrics and earnings</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.averageMetrics.rating.toFixed(1)}</div>
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(dashboardData.averageMetrics.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.averageMetrics.completionRate.toFixed(1)}%</div>
            <p className="text-sm text-gray-400 mt-2">Across all contractors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.averageMetrics.responseTime}m</div>
            <p className="text-sm text-gray-400 mt-2">To accept jobs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Avg Monthly Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${(dashboardData.averageMetrics.monthlyEarnings / 1000).toFixed(1)}K</div>
            <p className="text-sm text-gray-400 mt-2">Per contractor</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="topPerformers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="topPerformers">Top Performers</TabsTrigger>
          <TabsTrigger value="rankings">Performance Tiers</TabsTrigger>
          <TabsTrigger value="earnings">Earnings by State</TabsTrigger>
        </TabsList>

        {/* Top Performers Tab */}
        <TabsContent value="topPerformers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Contractor Search</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search by name or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Contractor List */}
            <div className="lg:col-span-1 space-y-2">
              {filteredContractors.map((contractor) => (
                <Card
                  key={contractor.id}
                  className={`cursor-pointer transition-all ${
                    selectedContractor?.id === contractor.id
                      ? 'ring-2 ring-primary bg-blue-50'
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedContractor(contractor)}
                >
                  <CardContent className="pt-4">
                    <h3 className="font-semibold">{contractor.name}</h3>
                    <p className="text-sm text-gray-400">{contractor.company}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(contractor.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold">{contractor.rating.toFixed(1)}</span>
                    </div>
                    <Badge variant="outline" className="mt-2">
                      {contractor.state}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contractor Details */}
            {selectedContractor && (
              <div className="lg:col-span-2 space-y-4">
                {/* Header Card */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedContractor.name}</CardTitle>
                        <CardDescription>{selectedContractor.company}</CardDescription>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">{selectedContractor.state}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Total Jobs</p>
                      <p className="text-2xl font-bold">{selectedContractor.totalJobs}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Completion Rate</p>
                      <p className="text-2xl font-bold">{selectedContractor.completionRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Response Time</p>
                      <p className="text-2xl font-bold">{selectedContractor.averageResponseTimeMinutes}m</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Avg Job Duration</p>
                      <p className="text-2xl font-bold">{selectedContractor.averageJobDurationHours}h</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Earnings Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Earnings Trend</CardTitle>
                    <CardDescription>Revenue and jobs completed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={selectedContractor.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip formatter={(value) => `$${(value / 1000).toFixed(1)}K`} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="revenue" fill="#10b981" name="Revenue (AUD)" />
                        <Bar yAxisId="right" dataKey="jobs" fill="#3b82f6" name="Jobs" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Jobs by Type */}
                <Card>
                  <CardHeader>
                    <CardTitle>Jobs by Service Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={selectedContractor.jobsByType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ type, count }) => `${type}: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {selectedContractor.jobsByType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Certifications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Industry Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedContractor.certifications.map((cert, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="font-medium">{cert.level}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">{cert.expiryDate}</span>
                            <Badge variant={cert.isValid ? 'default' : 'destructive'}>
                              {cert.isValid ? 'Valid' : 'Expired'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Earnings Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Earnings Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Total Earnings</p>
                      <p className="text-2xl font-bold">${(selectedContractor.totalEarningsAUD / 1000).toFixed(1)}K</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Monthly Earnings</p>
                      <p className="text-2xl font-bold">${(selectedContractor.monthlyEarningsAUD / 1000).toFixed(1)}K</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Performance Tiers Tab */}
        <TabsContent value="rankings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contractor Performance Tiers</CardTitle>
              <CardDescription>Distribution across rating categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={dashboardData.performanceTiers}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="tier" type="category" width={140} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Contractors" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {dashboardData.performanceTiers.map((tier, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">{tier.tier}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{tier.count}</p>
                  <p className="text-sm text-gray-400 mt-2">⭐ {tier.avgRating.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Earnings by State Tab */}
        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earnings by State</CardTitle>
              <CardDescription>Total earnings and contractor count</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={dashboardData.earningsByState}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="state" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value) => `$${(value / 1_000_000).toFixed(2)}M`} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="earnings" fill="#10b981" name="Total Earnings (AUD)" />
                  <Bar yAxisId="right" dataKey="contractors" fill="#3b82f6" name="Contractors" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
