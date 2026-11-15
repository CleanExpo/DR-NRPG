'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  Pause,
  Filter,
} from 'lucide-react';

// Types
interface Stats {
  totalPhotos: number;
  enhancedPhotos: number;
  pendingPhotos: number;
  totalCostUSD: number;
  avgCostPerImage: number;
  avgProcessingTime: number;
  successRate: number;
  lastProcessedAt?: string;
}

interface Job {
  id: string;
  status: string;
  totalImages: number;
  processedImages: number;
  successCount: number;
  failureCount: number;
  totalCostUSD: number;
  startedAt: string;
  completedAt?: string;
  estimatedCompletion?: string;
}

interface Enhancement {
  id: string;
  photoId: string;
  photoUrl: string;
  thumbnailUrl?: string;
  originalDesc?: string;
  enhancedDesc: string;
  cost: number;
  processingMs: number;
  success: boolean;
  createdAt: string;
}

interface BatchFilters {
  limit: number;
  reportId?: string;
  claimId?: string;
  damageCategory?: string;
  minDate?: string;
}

export function AIImageEnhancementDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [recentEnhancements, setRecentEnhancements] = useState<Enhancement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BatchFilters>({ limit: 100 });
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
    fetchRecentEnhancements();
    checkActiveJob();
  }, []);

  // Poll active job every 3 seconds
  useEffect(() => {
    if (activeJob && activeJob.status === 'PROCESSING') {
      const interval = setInterval(() => {
        checkActiveJob();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [activeJob]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/ai-enhancement/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentEnhancements = async () => {
    try {
      // This would need a new API endpoint to fetch recent logs
      // For now, we'll leave it empty
      setRecentEnhancements([]);
    } catch (error) {
      console.error('Failed to fetch recent enhancements:', error);
    }
  };

  const checkActiveJob = async () => {
    try {
      const response = await fetch('/api/admin/ai-enhancement/jobs?limit=1&status=PROCESSING');
      if (response.ok) {
        const data = await response.json();
        if (data.jobs && data.jobs.length > 0) {
          setActiveJob(data.jobs[0]);
        } else {
          setActiveJob(null);
        }
      }
    } catch (error) {
      console.error('Failed to check active job:', error);
    }
  };

  const handleStartBatch = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/ai-enhancement/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Batch job started! Processing ${data.totalImages} images. Estimated cost: $${data.estimatedCost.toFixed(2)}`);
        checkActiveJob();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to start batch:', error);
      alert('Failed to start batch processing');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchRecentEnhancements(), checkActiveJob()]);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nrpg-teal"></div>
      </div>
    );
  }

  const enhancementPercentage = stats
    ? ((stats.enhancedPhotos / stats.totalPhotos) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-3 rounded-lg">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            AI Image Enhancement
          </h1>
          <p className="text-gray-400 mt-2">
            Generate E.E.A.T.-optimized descriptions for inspection photos using GPT-4 Vision
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Images */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Images</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.totalPhotos.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-gray-400 mt-2">In database</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3 rounded-lg">
              <ImageIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Enhanced Count */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">AI Enhanced</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.enhancedPhotos.toLocaleString() || '0'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600 text-sm font-medium">
                  {enhancementPercentage}%
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Pending Count */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.pendingPhotos.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-gray-400 mt-2">Awaiting enhancement</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Cost</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${stats?.totalCostUSD.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Avg: ${stats?.avgCostPerImage.toFixed(4) || '0.0000'}/image
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Job Progress */}
      {activeJob && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="animate-pulse bg-purple-600 w-3 h-3 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">Processing in Progress</h3>
            </div>
            <span className="text-sm text-gray-400">Job ID: {activeJob.id.substring(0, 8)}</span>
          </div>

          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {activeJob.processedImages} / {activeJob.totalImages} images
                </span>
                <span className="text-sm font-medium text-purple-600">
                  {((activeJob.processedImages / activeJob.totalImages) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-[width] duration-500 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]"
                  style={{
                    width: `${(activeJob.processedImages / activeJob.totalImages) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-sm text-gray-400">Success</p>
                <p className="text-2xl font-bold text-green-600">{activeJob.successCount}</p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-sm text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-red-600">{activeJob.failureCount}</p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-sm text-gray-400">Cost</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${activeJob.totalCostUSD.toFixed(2)}
                </p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-sm text-gray-400">ETA</p>
                <p className="text-lg font-bold text-blue-600">
                  {activeJob.estimatedCompletion
                    ? new Date(activeJob.estimatedCompletion).toLocaleTimeString()
                    : 'Calculating...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Processing Control Panel */}
      {!activeJob && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Batch Processing</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Size
                </label>
                <input
                  type="number"
                  value={filters.limit}
                  onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  min="1"
                  max="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report ID (optional)
                </label>
                <input
                  type="text"
                  value={filters.reportId || ''}
                  onChange={(e) => setFilters({ ...filters, reportId: e.target.value })}
                  placeholder="Filter by report"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Damage Category (optional)
                </label>
                <select
                  value={filters.damageCategory || ''}
                  onChange={(e) => setFilters({ ...filters, damageCategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">All categories</option>
                  <option value="WATER_DAMAGE">Water Damage</option>
                  <option value="FIRE_DAMAGE">Fire Damage</option>
                  <option value="MOULD_DAMAGE">Mould Damage</option>
                  <option value="STORM_DAMAGE">Storm Damage</option>
                  <option value="IMPACT_DAMAGE">Impact Damage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Date (optional)
                </label>
                <input
                  type="date"
                  value={filters.minDate || ''}
                  onChange={(e) => setFilters({ ...filters, minDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 mb-4">
            <div>
              <p className="text-sm text-gray-400">Ready to process</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.pendingPhotos.toLocaleString() || '0'} images
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Estimated cost</p>
              <p className="text-2xl font-bold text-purple-600">
                ${((filters.limit || 0) * 0.0024).toFixed(2)}
              </p>
            </div>
          </div>

          <button
            onClick={handleStartBatch}
            disabled={refreshing || !stats?.pendingPhotos}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold
                     hover:from-purple-700 hover:to-blue-700 transition-[opacity] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Batch Enhancement
          </button>
        </div>
      )}

      {/* Performance Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Success Rate</h4>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-400 mt-2">Successful enhancements</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Avg Processing Time</h4>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {(stats.avgProcessingTime / 1000).toFixed(1)}s
            </p>
            <p className="text-sm text-gray-400 mt-2">Per image</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Last Processed</h4>
            </div>
            <p className="text-lg font-bold text-purple-600">
              {stats.lastProcessedAt
                ? new Date(stats.lastProcessedAt).toLocaleString()
                : 'Never'}
            </p>
            <p className="text-sm text-gray-400 mt-2">Most recent enhancement</p>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">About AI Enhancement</h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              Our AI system uses GPT-4 Vision to analyze inspection photos and generate
              expert-level descriptions that demonstrate E.E.A.T. (Experience, Expertise,
              Authoritativeness, Trustworthiness). Descriptions reference Australian building
              codes, industry standards, and use proper technical terminology to improve SEO
              performance.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                <CheckCircle className="w-3 h-3" />
                Industry Standards
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                <CheckCircle className="w-3 h-3" />
                Australian Building Codes
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                <CheckCircle className="w-3 h-3" />
                SEO Optimized
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
