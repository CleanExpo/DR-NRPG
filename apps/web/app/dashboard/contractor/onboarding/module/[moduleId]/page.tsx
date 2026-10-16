'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { formatModuleIdForDisplay } from '@/lib/training/training-policy';
import { marked } from 'marked';
import { sanitizeHtml, preloadSanitizer } from '@/lib/sanitize';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  PlayCircle,
  Target,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ModuleInfo {
  moduleId: string;
  moduleOrder: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  passingScore: number;
  learningObjectives: string[];
  hasAssessment: boolean;
  hasExercises: boolean;
  hasResources: boolean;
}

interface ModuleProgress {
  id: string;
  status: string;
  progress: number;
  contentViewedAt: string | null;
  exercisesComplete: boolean;
  resourcesViewed: boolean;
  quizPassed: boolean;
}

interface ContentData {
  moduleInfo: ModuleInfo;
  content: {
    trainingContent: string;
    hasAssessment: boolean;
    hasExercises: boolean;
    hasResources: boolean;
  };
  progress: ModuleProgress | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ModuleLessonPlayer() {
  const params = useParams<{ moduleId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const moduleId = useMemo(
    () => params.moduleId?.toUpperCase() ?? '',
    [params.moduleId],
  );

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ContentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Time-tracking ref — records seconds on page, reported on unmount
  const startTimeRef = useRef<number>(Date.now());

  // ── Fetch content ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (authLoading || !user || !moduleId) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/onboarding/module/${moduleId}/content`);
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error || 'Failed to load module');
        }
        setData(json.data as ContentData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load module');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [authLoading, user, moduleId]);

  // ── Report time spent on unmount ──────────────────────────────────────────

  useEffect(() => {
    return () => {
      const minutesSpent = Math.round((Date.now() - startTimeRef.current) / 60_000);
      if (minutesSpent >= 1 && user && moduleId) {
        navigator.sendBeacon(
          `/api/onboarding/module/${moduleId}/content`,
          new Blob(
            [JSON.stringify({ timeSpentMinutes: minutesSpent })],
            { type: 'application/json' },
          ),
        );
      }
    };
  }, [user, moduleId]);

  // ── Mark section complete ──────────────────────────────────────────────────

  const markComplete = async (field: 'exercisesComplete' | 'resourcesViewed') => {
    if (!data || data.progress?.[field]) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/onboarding/module/${moduleId}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: true }),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev) =>
          prev ? { ...prev, progress: json.data as ModuleProgress } : prev,
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  // ── Auth guard ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Eagerly load DOMPurify so sanitizeHtml() is effective synchronously when
  // rendering the training markdown below (mirrors the client education module).
  useEffect(() => {
    void preloadSanitizer();
  }, []);

  // ── Render markdown ────────────────────────────────────────────────────────

  const htmlContent = useMemo(() => {
    if (!data?.content.trainingContent) return null;
    return marked.parse(data.content.trainingContent) as string;
  }, [data?.content.trainingContent]);

  // ── Loading states ─────────────────────────────────────────────────────────

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-nrpg-teal" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <AlertCircle className="size-10 text-red-400" />
        <p className="text-portal-text font-heading font-bold">Unable to load module</p>
        <p className="text-portal-muted text-sm font-body max-w-md">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-nrpg-teal hover:bg-nrpg-teal-dark text-white text-sm font-bold font-heading rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { moduleInfo, content, progress } = data;
  const progressPct = progress?.progress ?? 0;
  const isCompleted = progress?.status === 'COMPLETED';

  // Course prefix → human-readable label
  const [coursePrefix] = moduleId.split('-');
  const courseLabels: Record<string, string> = {
    CSE: 'Customer Service Excellence',
    WRT: 'Water Damage Restoration',
  };
  const courseLabel = courseLabels[coursePrefix] ?? coursePrefix;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 px-4">

      {/* ── Back nav ── */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-portal-muted hover:text-portal-text transition-colors font-heading"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      {/* ── Module header ── */}
      <div className="bg-portal-card rounded-xl border border-portal-border p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2 py-0.5 text-xs font-bold rounded border border-nrpg-teal/30 bg-nrpg-teal/10 text-nrpg-teal font-heading">
                {courseLabel}
              </span>
              <span className="text-xs text-portal-muted font-body">{formatModuleIdForDisplay(moduleInfo.moduleId)}</span>
              {isCompleted && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-heading">
                  <CheckCircle className="size-3" />
                  Completed
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-portal-text font-heading">{moduleInfo.title}</h1>
            {moduleInfo.description && (
              <p className="text-sm text-portal-muted font-body mt-1">{moduleInfo.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-portal-muted text-sm font-body flex-shrink-0">
            <Clock className="size-4" />
            {formatDuration(moduleInfo.estimatedMinutes)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-portal-muted font-body">Progress</span>
            <span className="font-bold text-portal-text font-heading">{progressPct}%</span>
          </div>
          <div className="w-full bg-portal-border rounded-full h-2">
            <div
              className="h-2 rounded-full transition-[width] duration-500 bg-nrpg-teal"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Learning objectives ── */}
      {moduleInfo.learningObjectives?.length > 0 && (
        <div className="bg-portal-card rounded-xl border border-portal-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Target className="size-4 text-earth-secondary" />
            <h2 className="text-sm font-bold text-portal-text font-heading">Learning Objectives</h2>
          </div>
          <ul className="space-y-1.5">
            {moduleInfo.learningObjectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-portal-muted font-body">
                <span className="mt-0.5 size-4 rounded-full bg-nrpg-teal/15 text-nrpg-teal text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Training content ── */}
      {htmlContent ? (
        <div className="bg-portal-card rounded-xl border border-portal-border p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="size-4 text-nrpg-teal" />
            <h2 className="text-sm font-bold text-portal-text font-heading">Training Material</h2>
          </div>
          <div
            className="prose prose-sm prose-invert max-w-none
              prose-headings:font-heading prose-headings:text-portal-text
              prose-p:text-portal-muted prose-p:font-body prose-p:leading-relaxed
              prose-strong:text-portal-text
              prose-li:text-portal-muted prose-li:font-body
              prose-a:text-nrpg-teal prose-a:no-underline hover:prose-a:underline
              prose-code:text-nrpg-teal prose-code:bg-nrpg-teal/10 prose-code:px-1 prose-code:rounded
              prose-blockquote:border-l-nrpg-teal prose-blockquote:text-portal-muted
              prose-hr:border-portal-border"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlContent) }}
          />
        </div>
      ) : (
        <div className="bg-portal-card rounded-xl border border-portal-border p-8 text-center">
          <FileText className="size-10 text-portal-muted mx-auto mb-3" />
          <p className="text-portal-muted text-sm font-body">No content available for this module yet.</p>
        </div>
      )}

      {/* ── Section actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {content.hasExercises && (
          <button
            disabled={updating || !!progress?.exercisesComplete}
            onClick={() => markComplete('exercisesComplete')}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-colors text-left ${
              progress?.exercisesComplete
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : 'border-portal-border bg-portal-card hover:border-nrpg-teal/40'
            }`}
          >
            {progress?.exercisesComplete ? (
              <CheckCircle className="size-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <PlayCircle className="size-5 text-nrpg-teal flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-bold text-portal-text font-heading">Exercises</p>
              <p className="text-xs text-portal-muted font-body">
                {progress?.exercisesComplete ? 'Marked complete' : 'Mark exercises as done'}
              </p>
            </div>
          </button>
        )}

        {content.hasResources && (
          <button
            disabled={updating || !!progress?.resourcesViewed}
            onClick={() => markComplete('resourcesViewed')}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-colors text-left ${
              progress?.resourcesViewed
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : 'border-portal-border bg-portal-card hover:border-nrpg-teal/40'
            }`}
          >
            {progress?.resourcesViewed ? (
              <CheckCircle className="size-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <FileText className="size-5 text-earth-secondary flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-bold text-portal-text font-heading">Resources</p>
              <p className="text-xs text-portal-muted font-body">
                {progress?.resourcesViewed ? 'Viewed' : 'Mark resources as viewed'}
              </p>
            </div>
          </button>
        )}
      </div>

      {/* ── Assessment CTA ── */}
      {content.hasAssessment && (
        <div className="bg-earth-primary/5 rounded-xl border border-earth-primary/20 p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-portal-text font-heading">Module Assessment</h3>
            <p className="text-xs text-portal-muted font-body mt-0.5">
              Complete the quiz to earn your progress credit. Passing score: {moduleInfo.passingScore}%
            </p>
            {progress?.quizPassed && (
              <span className="inline-flex items-center gap-1 mt-1 text-xs text-emerald-400 font-bold font-heading">
                <CheckCircle className="size-3" />
                Quiz passed
              </span>
            )}
          </div>
          <button
            onClick={() => router.push(`/dashboard/contractor/onboarding/nrpg?quiz=${moduleId}`)}
            disabled={progress?.quizPassed}
            className={`px-4 py-2 text-sm font-bold font-heading rounded-lg transition-colors flex-shrink-0 ${
              progress?.quizPassed
                ? 'bg-emerald-500/10 text-emerald-400 cursor-default'
                : 'bg-earth-primary hover:bg-earth-secondary text-white'
            }`}
          >
            {progress?.quizPassed ? 'Passed ✓' : 'Take Quiz'}
          </button>
        </div>
      )}
    </div>
  );
}
