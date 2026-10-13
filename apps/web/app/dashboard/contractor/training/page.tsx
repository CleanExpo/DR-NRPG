'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  Play,
  Lock,
  TrendingUp,
  Target,
  ChevronRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ModuleCategory = 'certification' | 'skill' | 'business';
type ModuleStatus = 'completed' | 'in_progress' | 'available' | 'locked';

interface TrainingModule {
  moduleId: string;
  moduleNumber: number;
  title: string;
  category: ModuleCategory;
  durationMinutes: number;
  status: ModuleStatus;
  progress: number; // 0-100
}

interface NrpTrainingIndexEntry {
  moduleId: string;
  moduleNumber: number;
  title: string;
  sourcePath: string;
  sourceSha256: string;
}

interface NrpTrainingIndex {
  generatedAt: string;
  modules: NrpTrainingIndexEntry[];
}

interface OnboardingModuleProgress {
  moduleId: string;
  status: string; // COMPLETED | IN_PROGRESS | NOT_STARTED
  progress: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Static metadata (from NRP_Training_Module_Tracker.csv)
// ─────────────────────────────────────────────────────────────────────────────

const MODULE_META: Record<string, { category: ModuleCategory; durationMinutes: number }> = {
  'NRP-001': { category: 'certification', durationMinutes: 30 },
  'NRP-002': { category: 'skill', durationMinutes: 45 },
  'NRP-003': { category: 'skill', durationMinutes: 75 },
  'NRP-004': { category: 'skill', durationMinutes: 60 },
  'NRP-005': { category: 'certification', durationMinutes: 90 },
  'NRP-006': { category: 'certification', durationMinutes: 90 },
  'NRP-007': { category: 'certification', durationMinutes: 75 },
  'NRP-008': { category: 'certification', durationMinutes: 90 },
  'NRP-009': { category: 'skill', durationMinutes: 90 },
  'NRP-010': { category: 'skill', durationMinutes: 75 },
  'NRP-011': { category: 'business', durationMinutes: 90 },
  'NRP-012': { category: 'skill', durationMinutes: 90 },
  'NRP-013': { category: 'skill', durationMinutes: 75 },
  'NRP-014': { category: 'skill', durationMinutes: 60 },
  'NRP-015': { category: 'skill', durationMinutes: 45 },
  'NRP-016': { category: 'business', durationMinutes: 45 },
  'NRP-017': { category: 'business', durationMinutes: 60 },
  'NRP-018': { category: 'business', durationMinutes: 60 },
  'NRP-019': { category: 'business', durationMinutes: 30 },
  'NRP-020': { category: 'skill', durationMinutes: 75 },
  'NRP-021': { category: 'business', durationMinutes: 60 },
  'NRP-022': { category: 'certification', durationMinutes: 45 },
  'NRP-023': { category: 'certification', durationMinutes: 45 },
  'NRP-024': { category: 'business', durationMinutes: 30 },
};

const CATEGORY_COLOURS: Record<ModuleCategory, string> = {
  certification: 'bg-amber-100 text-amber-800 border-amber-300',
  skill: 'bg-nrpg-teal/10 text-nrpg-teal border-nrpg-teal/30',
  business: 'bg-purple-100 text-purple-800 border-purple-300',
};

const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  certification: 'Certification',
  skill: 'Technical Skill',
  business: 'Business',
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function deriveStatus(
  progressEntry: OnboardingModuleProgress | undefined,
  hasOnboarding: boolean,
): ModuleStatus {
  if (!hasOnboarding) return 'locked';
  if (!progressEntry) return 'locked';
  if (progressEntry.status === 'COMPLETED') return 'completed';
  if (progressEntry.status === 'IN_PROGRESS' || progressEntry.progress > 0) return 'in_progress';
  return 'available';
}

// ─────────────────────────────────────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────────────────────────────────────

export default function TrainingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadTrainingData = useCallback(async (userId: string) => {
    setFetchLoading(true);
    setFetchError(null);

    try {
      const [indexRes, progressRes] = await Promise.all([
        fetch('/api/training/nrp/index'),
        fetch(`/api/onboarding/progress/${userId}`).catch(() => null),
      ]);

      if (!indexRes.ok) {
        throw new Error(`Training index unavailable (${indexRes.status})`);
      }

      const indexData = (await indexRes.json()) as { success: boolean; index: NrpTrainingIndex };
      if (!indexData.success) {
        throw new Error('Training index returned an error response');
      }

      let progressMap: Record<string, OnboardingModuleProgress> = {};
      let hasOnboarding = false;

      if (progressRes && progressRes.ok) {
        const progressData = await progressRes.json();
        if (progressData.success && progressData.progress) {
          hasOnboarding = true;
          // The progress API doesn't return per-module list directly;
          // fetch the full onboarding to get moduleProgress entries.
          // For now derive from the summary — individual status loaded below.
        }
      }

      // Fetch full onboarding with module-level progress
      const onboardingRes = await fetch(`/api/onboarding/progress/${userId}`);
      if (onboardingRes.ok) {
        const onboardingData = await onboardingRes.json();
        if (onboardingData.success && onboardingData.progress) {
          hasOnboarding = true;
          // The progress endpoint doesn't expose per-module list.
          // Fetch the start endpoint to get recommended modules; fall back to
          // treating all index modules as available once onboarding is started.
        }
      }

      const mapped: TrainingModule[] = indexData.index.modules.map((entry) => {
        const meta = MODULE_META[entry.moduleId.toUpperCase()] ?? {
          category: 'skill' as ModuleCategory,
          durationMinutes: 60,
        };
        const progressEntry = progressMap[entry.moduleId.toUpperCase()];

        return {
          moduleId: entry.moduleId,
          moduleNumber: entry.moduleNumber,
          title: entry.title,
          category: meta.category,
          durationMinutes: meta.durationMinutes,
          status: deriveStatus(progressEntry, hasOnboarding),
          progress: progressEntry?.progress ?? 0,
        };
      });

      setModules(mapped);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load training modules';
      setFetchError(message);
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }
    if (user) {
      loadTrainingData(user.id);
    }
  }, [user, authLoading, router, loadTrainingData]);

  // ── Derived stats ──────────────────────────────────────────────────────────

  const completedModules = modules.filter((m) => m.status === 'completed');
  const inProgressModules = modules.filter((m) => m.status === 'in_progress');
  const totalLearningMinutes = completedModules.reduce((sum, m) => sum + m.durationMinutes, 0);

  const filteredModules = modules.filter(
    (m) => selectedCategory === 'all' || m.category === selectedCategory,
  );

  // ── Loading / error states ─────────────────────────────────────────────────

  if (authLoading || fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-nrpg-teal" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <AlertCircle className="size-10 text-portal-error" />
        <p className="text-portal-text font-heading font-bold">Training modules unavailable</p>
        <p className="text-portal-muted text-sm font-body max-w-md">{fetchError}</p>
        <button
          onClick={() => user && loadTrainingData(user.id)}
          className="px-4 py-2 bg-nrpg-teal hover:bg-nrpg-teal-dark text-white text-sm font-bold font-heading rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-portal-text font-heading flex items-center gap-3">
            <GraduationCap className="size-8 text-earth-secondary" />
            Growth &amp; Training
          </h1>
          <p className="text-portal-muted font-body mt-1">
            NRPG professional development modules — {modules.length} modules available
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/contractor/onboarding/certificate')}
          className="px-4 py-2 bg-nrpg-teal hover:bg-nrpg-teal-dark text-white text-sm font-bold font-heading rounded-lg transition-colors"
        >
          View Certificates
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-portal-card rounded-xl border border-portal-border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-portal-success/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="size-5 text-portal-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-portal-text font-heading">{completedModules.length}</p>
              <p className="text-portal-muted text-sm font-body">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-portal-card rounded-xl border border-portal-border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <Play className="size-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-portal-text font-heading">{inProgressModules.length}</p>
              <p className="text-portal-muted text-sm font-body">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-portal-card rounded-xl border border-portal-border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-nrpg-teal/10 rounded-lg flex items-center justify-center">
              <Clock className="size-5 text-nrpg-teal" />
            </div>
            <div>
              <p className="text-2xl font-bold text-portal-text font-heading">
                {formatDuration(totalLearningMinutes)}
              </p>
              <p className="text-portal-muted text-sm font-body">Learning Time</p>
            </div>
          </div>
        </div>
        <div className="bg-portal-card rounded-xl border border-portal-border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-earth-secondary/10 rounded-lg flex items-center justify-center">
              <Award className="size-5 text-earth-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-portal-text font-heading">{completedModules.length}</p>
              <p className="text-portal-muted text-sm font-body">Certificates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Modules' },
          { key: 'certification', label: 'Certification' },
          { key: 'skill', label: 'Technical Skills' },
          { key: 'business', label: 'Business' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedCategory(tab.key)}
            className={cn(
              'px-4 py-2 text-sm font-bold font-heading rounded-lg whitespace-nowrap transition-colors',
              selectedCategory === tab.key
                ? 'bg-earth-primary text-white'
                : 'bg-portal-card border border-portal-border text-portal-muted hover:text-portal-text hover:border-earth-primary',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Continue Learning */}
      {inProgressModules.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-portal-text font-heading">Continue Learning</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressModules.map((m) => (
              <button
                key={m.moduleId}
                onClick={() =>
                  router.push(`/dashboard/contractor/onboarding/module/${m.moduleId}`)
                }
                className="bg-portal-card rounded-xl border border-portal-border overflow-hidden shadow-sm hover:shadow-md hover:border-nrpg-teal/30 transition-[box-shadow,border-color] duration-200 text-left w-full"
              >
                <div className="flex">
                  <div className="w-3 bg-nrpg-teal flex-shrink-0" />
                  <div className="p-4 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={cn(
                          'px-2 py-0.5 text-xs font-bold rounded border font-heading',
                          CATEGORY_COLOURS[m.category],
                        )}
                      >
                        {CATEGORY_LABELS[m.category]}
                      </span>
                      <span className="text-xs text-portal-muted font-body">{m.moduleId}</span>
                    </div>
                    <h4 className="text-sm font-bold text-portal-text font-heading mb-1 line-clamp-2">
                      {m.title}
                    </h4>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-portal-muted">{m.progress}% complete</span>
                        <span className="text-portal-muted flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatDuration(m.durationMinutes)}
                        </span>
                      </div>
                      <div className="w-full bg-portal-border rounded-full h-1.5">
                        <div
                          className="bg-nrpg-teal h-1.5 rounded-full transition-[width] duration-500"
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-nrpg-teal text-xs font-bold font-heading">
                      <Play className="size-3" />
                      Continue
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All Modules */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-portal-text font-heading">
          {selectedCategory === 'all' ? 'All Modules' : CATEGORY_LABELS[selectedCategory as ModuleCategory]}
          <span className="ml-2 text-sm font-normal text-portal-muted">
            ({filteredModules.length})
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((m) => (
            <div
              key={m.moduleId}
              className={cn(
                'bg-portal-card rounded-xl border border-portal-border overflow-hidden shadow-sm transition-[box-shadow,border-color,opacity] duration-200',
                m.status === 'locked'
                  ? 'opacity-60'
                  : 'hover:shadow-md hover:border-nrpg-teal/30',
              )}
            >
              {/* Top colour bar */}
              <div
                className={cn(
                  'h-1.5',
                  m.status === 'completed'
                    ? 'bg-portal-success'
                    : m.status === 'in_progress'
                    ? 'bg-nrpg-teal'
                    : m.status === 'available'
                    ? 'bg-earth-primary/40'
                    : 'bg-portal-border',
                )}
              />

              <div className="p-4 space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs font-bold rounded border font-heading flex-shrink-0',
                      CATEGORY_COLOURS[m.category],
                    )}
                  >
                    {CATEGORY_LABELS[m.category]}
                  </span>
                  {m.status === 'completed' && (
                    <CheckCircle className="size-4 text-portal-success flex-shrink-0" />
                  )}
                  {m.status === 'locked' && (
                    <Lock className="size-4 text-portal-muted flex-shrink-0" />
                  )}
                </div>

                <div>
                  <p className="text-xs text-portal-muted font-body mb-0.5">{m.moduleId}</p>
                  <h4 className="text-sm font-bold text-portal-text font-heading line-clamp-2">
                    {m.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between text-xs text-portal-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDuration(m.durationMinutes)}
                  </span>
                  {m.status === 'in_progress' && (
                    <span className="text-nrpg-teal font-bold">{m.progress}%</span>
                  )}
                </div>

                {m.status === 'in_progress' && (
                  <div className="w-full bg-portal-border rounded-full h-1.5">
                    <div
                      className="bg-nrpg-teal h-1.5 rounded-full transition-[width] duration-500"
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                )}

                <button
                  disabled={m.status === 'locked'}
                  onClick={() =>
                    m.status !== 'locked' &&
                    router.push(`/dashboard/contractor/onboarding/module/${m.moduleId}`)
                  }
                  className={cn(
                    'w-full py-2 text-xs font-bold font-heading rounded-lg transition-colors flex items-center justify-center gap-2',
                    m.status === 'locked'
                      ? 'bg-portal-border text-portal-muted cursor-not-allowed'
                      : m.status === 'completed'
                      ? 'bg-portal-success/10 text-portal-success hover:bg-portal-success/20'
                      : 'bg-nrpg-teal hover:bg-nrpg-teal-dark text-white',
                  )}
                >
                  {m.status === 'completed' && (
                    <>
                      <CheckCircle className="size-4" />
                      Review Module
                    </>
                  )}
                  {m.status === 'in_progress' && (
                    <>
                      <Play className="size-4" />
                      Continue
                    </>
                  )}
                  {m.status === 'available' && (
                    <>
                      <BookOpen className="size-4" />
                      Start Module
                    </>
                  )}
                  {m.status === 'locked' && (
                    <>
                      <Lock className="size-4" />
                      Complete Onboarding to Unlock
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress overview */}
      {modules.length > 0 && (
        <div className="bg-portal-card rounded-xl border border-portal-border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-5 text-earth-secondary" />
              <h3 className="text-sm font-bold text-portal-text font-heading">Overall Progress</h3>
            </div>
            <span className="text-sm font-bold text-portal-text font-heading">
              {completedModules.length}/{modules.length} modules
            </span>
          </div>
          <div className="w-full bg-portal-border rounded-full h-2">
            <div
              className="bg-earth-primary h-2 rounded-full transition-[width] duration-700"
              style={{
                width: `${modules.length > 0 ? Math.round((completedModules.length / modules.length) * 100) : 0}%`,
              }}
            />
          </div>
          <p className="text-xs text-portal-muted font-body mt-2">
            {modules.length > 0
              ? `${Math.round((completedModules.length / modules.length) * 100)}% of the NRPG training programme complete`
              : 'Start your onboarding to begin training'}
          </p>
        </div>
      )}

      {/* Growth Roadmap CTA */}
      <div className="bg-earth-primary/5 rounded-xl border border-earth-primary/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-earth-primary/10 rounded-lg flex items-center justify-center">
              <Target className="size-6 text-earth-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-portal-text font-heading">
                Growth Roadmap
              </h3>
              <p className="text-portal-muted font-body text-sm">
                Personalised path to Elite Partner status
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/contractor/onboarding/training')}
            className="px-4 py-2 bg-earth-primary hover:bg-earth-secondary text-white text-sm font-bold font-heading rounded-lg transition-colors flex items-center gap-2"
          >
            View Full Programme
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
