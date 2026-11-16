/**
 * NRPG Growth Portal - Brand & Compliance Page
 *
 * Full compliance management with certifications, audits, and brand alignment.
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Shield,
  Star,
  Award,
  Scale,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  Calendar,
  FileText,
  ChevronRight,
} from 'lucide-react';

interface ComplianceItem {
  id: string;
  title: string;
  category: 'certification' | 'audit' | 'brand' | 'training';
  status: 'complete' | 'pending' | 'expiring' | 'overdue';
  description: string;
  dueDate?: string;
  completedDate?: string;
  documentUrl?: string;
}

const statusConfig = {
  complete: {
    color: 'text-portal-success',
    bg: 'bg-portal-success/10',
    icon: CheckCircle,
    label: 'Complete',
  },
  pending: {
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    icon: Clock,
    label: 'Pending',
  },
  expiring: {
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    icon: AlertCircle,
    label: 'Expiring Soon',
  },
  overdue: {
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    icon: AlertCircle,
    label: 'Overdue',
  },
};

const sampleComplianceItems: ComplianceItem[] = [
  {
    id: '1',
    title: 'Water Damage Restoration',
    category: 'certification',
    status: 'complete',
    description: 'Industry-standard certification for water damage restoration professionals.',
    completedDate: 'Jan 2024',
  },
  {
    id: '2',
    title: 'Mould Remediation',
    category: 'certification',
    status: 'complete',
    description: 'Advanced certification for mould remediation specialists.',
    completedDate: 'Mar 2024',
  },
  {
    id: '3',
    title: 'Fire and Smoke Restoration',
    category: 'certification',
    status: 'expiring',
    description: 'Certification for fire and smoke damage restoration.',
    dueDate: 'Feb 2025',
  },
  {
    id: '4',
    title: 'Annual Insurance Verification',
    category: 'audit',
    status: 'complete',
    description: 'Public liability and professional indemnity insurance verification.',
    completedDate: 'Oct 2024',
  },
  {
    id: '5',
    title: 'NRPG Brand Alignment Review',
    category: 'brand',
    status: 'complete',
    description: 'Annual review ensuring brand guidelines and service standards are met.',
    completedDate: 'Nov 2024',
  },
  {
    id: '6',
    title: 'Safety & Compliance Training',
    category: 'training',
    status: 'pending',
    description: 'Quarterly safety and compliance refresher training module.',
    dueDate: 'Jan 2025',
  },
  {
    id: '7',
    title: 'NRPG Sustainability Initiative',
    category: 'brand',
    status: 'pending',
    description: 'Optional program for environmentally conscious restoration practices.',
    dueDate: 'Ongoing',
  },
];

export default function CompliancePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<ComplianceItem[]>(sampleComplianceItems);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const filteredItems = items.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  // Single-pass reduce — avoids 3 separate O(n) filter passes in render
  const statusCounts = items.reduce(
    (acc, i) => {
      if (i.status === 'complete') acc.complete++;
      else if (i.status === 'pending') acc.pending++;
      else if (i.status === 'expiring') acc.expiring++;
      return acc;
    },
    { complete: 0, pending: 0, expiring: 0 }
  );
  const completedCount = statusCounts.complete;
  const totalCount = items.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nrpg-teal"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-portal-text font-heading flex items-center gap-3">
            <Award className="size-8 text-earth-secondary" />
            Brand & Compliance
          </h1>
          <p className="text-portal-muted font-body mt-1">
            Manage certifications, audits, and brand alignment
          </p>
        </div>
        <span className="px-4 py-2 bg-portal-success/10 text-portal-success text-sm font-bold font-heading rounded-full">
          {progressPercentage}% Complete
        </span>
      </div>

      {/* Progress Overview */}
      <div className="bg-portal-card rounded-xl border border-portal-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-portal-text font-heading">
            Compliance Progress
          </h3>
          <span className="text-portal-muted font-body text-sm">
            {completedCount} of {totalCount} items complete
          </span>
        </div>
        <div className="w-full bg-portal-border rounded-full h-3">
          <div
            className="bg-nrpg-teal h-3 rounded-full transition-[width] duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-portal-success"></div>
            <span className="text-portal-muted">Complete ({statusCounts.complete})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-amber-500"></div>
            <span className="text-portal-muted">Pending ({statusCounts.pending})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-orange-500"></div>
            <span className="text-portal-muted">Expiring ({statusCounts.expiring})</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Items' },
          { key: 'certification', label: 'Certifications' },
          { key: 'audit', label: 'Audits' },
          { key: 'brand', label: 'Brand' },
          { key: 'training', label: 'Training' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedCategory(tab.key)}
            className={cn(
              'px-4 py-2 text-sm font-bold font-heading rounded-lg whitespace-nowrap transition-colors',
              selectedCategory === tab.key
                ? 'bg-earth-primary text-white'
                : 'bg-portal-card border border-portal-border text-portal-muted hover:text-portal-text hover:border-earth-primary'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Compliance Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const config = statusConfig[item.status];
          const StatusIcon = config.icon;
          return (
            <div
              key={item.id}
              className="bg-portal-card rounded-xl border border-portal-border p-6 shadow-sm hover:shadow-md hover:border-nrpg-teal/30 transition-[box-shadow,border-color] duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={cn(
                      'size-12 rounded-lg flex items-center justify-center flex-shrink-0',
                      config.bg
                    )}
                  >
                    <StatusIcon className={cn('size-6', config.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-portal-text font-heading">
                        {item.title}
                      </h3>
                      <span
                        className={cn(
                          'px-2 py-0.5 text-xs font-bold rounded font-heading',
                          config.bg,
                          config.color
                        )}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="text-portal-muted font-body text-sm mb-3">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      {item.completedDate && (
                        <div className="flex items-center gap-1 text-portal-success">
                          <CheckCircle className="size-4" />
                          <span>Completed: {item.completedDate}</span>
                        </div>
                      )}
                      {item.dueDate && (
                        <div className={cn('flex items-center gap-1', config.color)}>
                          <Calendar className="size-4" />
                          <span>Due: {item.dueDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.status !== 'complete' && (
                    <button className="px-4 py-2 bg-nrpg-teal hover:bg-nrpg-teal-dark text-white text-sm font-bold font-heading rounded-lg transition-colors flex items-center gap-2">
                      <Upload className="size-4" />
                      Upload
                    </button>
                  )}
                  <button className="p-2 text-portal-muted hover:text-portal-text hover:bg-portal-border rounded-lg transition-colors">
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Strategy Session */}
      <div className="bg-earth-primary/5 rounded-xl border border-earth-primary/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-portal-text font-heading">
              Next Strategy Session
            </h3>
            <p className="text-portal-muted font-body text-sm">
              Your quarterly compliance and growth review
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-earth-primary font-heading">Dec 15, 2024</p>
            <button className="text-nrpg-teal text-sm font-bold font-heading hover:underline">
              Add to Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
