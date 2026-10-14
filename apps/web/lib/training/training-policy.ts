/**
 * Single source of truth for NRPG training policy (DR-893).
 *
 * Every consumer — quiz grading, checklist/progression, certificate issuance
 * and display, and dispatch eligibility — reads these values from HERE. Do not
 * hardcode a passing score, validity period, certification name, or module
 * count anywhere else (this module resolves the historical 70-vs-80 conflict
 * in favour of the enforced grading value introduced in DR-892).
 *
 * Deliberately dependency-free (no fs/prisma/next) so it is importable from
 * server routes, services, scripts, and client components alike.
 */

/** The one passing-score threshold for training quiz/assessment grading. */
export const NRPG_QUIZ_PASSING_SCORE = 70;

/** How long an issued NRPG Contractor Certification remains valid. */
export const NRPG_CERT_VALIDITY_YEARS = 1;

/** Canonical name of the auto-issued training certification row. New certs use this. */
export const NRPG_CERTIFICATION_NAME = 'NRPG Contractor Certification';

/** Pre-rebrand name. Rows still carrying it stay valid until the rename migration runs. */
export const LEGACY_NRP_CERTIFICATION_NAME = 'NRP Contractor Certification';

/**
 * Every name a live training cert can carry. Queries match on this list so a
 * certified contractor stays eligible whether or not the data migration has run.
 */
export const NRPG_CERTIFICATION_NAMES: readonly string[] = Object.freeze([
  NRPG_CERTIFICATION_NAME,
  LEGACY_NRP_CERTIFICATION_NAME,
]);

/** Display form of a module ID. Stored IDs keep the NRP- prefix; people see NRPG-. */
export function formatModuleIdForDisplay(moduleId: string): string {
  return moduleId.replace(/^NRP-(?=\d{3}$)/i, 'NRPG-');
}

/** Training completion requires ALL of these — set equality, not a count. */
export const NRPG_CANONICAL_MODULE_COUNT = 24;

/** The canonical module set NRP-001..NRP-024 (generated: unique by construction). */
export const NRPG_CANONICAL_MODULE_IDS: readonly string[] = Object.freeze(
  Array.from(
    { length: NRPG_CANONICAL_MODULE_COUNT },
    (_, i) => `NRP-${String(i + 1).padStart(3, '0')}`
  )
);

const CANONICAL_SET: ReadonlySet<string> = new Set(NRPG_CANONICAL_MODULE_IDS);

function normalizeModuleId(moduleId: string): string {
  return moduleId.trim().toUpperCase();
}

/**
 * Count of DISTINCT canonical modules in `moduleIds`. Duplicates never inflate
 * the count and non-canonical ids (CSE-xx, WRT-xx, NRP-025…) never count.
 */
export function countNrpgCanonicalModulesPassed(moduleIds: Iterable<string>): number {
  const passed = new Set<string>();
  for (const raw of moduleIds) {
    const id = normalizeModuleId(raw);
    if (CANONICAL_SET.has(id)) passed.add(id);
  }
  return passed.size;
}

/**
 * Set-equality completion check (DR-893): the completed module set must EQUAL
 * the canonical NRP-001..NRP-024 set. A `count >= 24` check is forgeable with
 * duplicate module ids; this is not.
 */
export function isNrpgTrainingSetComplete(completedModuleIds: Iterable<string>): boolean {
  return countNrpgCanonicalModulesPassed(completedModuleIds) === NRPG_CANONICAL_MODULE_COUNT;
}

/** Certificate expiry = issue date + the configured validity period. */
export function getNrpgCertificationExpiryDate(issueDate: Date): Date {
  const expiry = new Date(issueDate.getTime());
  expiry.setFullYear(expiry.getFullYear() + NRPG_CERT_VALIDITY_YEARS);
  return expiry;
}

// ---------------------------------------------------------------------------
// Retake policy (DR-894)
// ---------------------------------------------------------------------------

/**
 * Maximum FAILED attempts per module before lockout/admin-review.
 * The spec does not fix a number; 3 is the chosen operational value.
 */
export const NRPG_QUIZ_MAX_ATTEMPTS = 3;

/**
 * Server-enforced cooldown between a failed attempt and the next retake.
 * The spec does not fix a duration; 24 hours is the chosen operational value.
 */
export const NRPG_QUIZ_RETAKE_COOLDOWN_HOURS = 24;

export const NRPG_QUIZ_RETAKE_COOLDOWN_MS = NRPG_QUIZ_RETAKE_COOLDOWN_HOURS * 60 * 60 * 1000;

/**
 * Admin reset voids prior attempt rows by prefixing their `feedback` column
 * (ContractorAssessment has no status column and DR-894 makes no schema
 * changes). Any row whose feedback starts with this prefix is excluded from
 * attempt counting.
 */
export const NRPG_ATTEMPT_VOID_PREFIX = 'VOIDED:';

/** The persisted shape the retake policy reads off ContractorAssessment rows. */
export interface NrpgAttemptRecord {
  score: number | null;
  completedAt: Date | null;
  createdAt: Date;
  feedback: string | null;
}

export type NrpgRetakeBlockReason = 'ATTEMPT_CAP' | 'COOLDOWN';

export interface NrpgRetakeDecision {
  allowed: boolean;
  reason: NrpgRetakeBlockReason | null;
  attemptsUsed: number;
  attemptsRemaining: number;
  maxAttempts: number;
  /** When the next attempt becomes allowed (cooldown), null when capped or allowed now. */
  retryAt: Date | null;
}

/** True when an assessment row was voided by an admin reset. */
export function isVoidedNrpgAttempt(attempt: Pick<NrpgAttemptRecord, 'feedback'>): boolean {
  return typeof attempt.feedback === 'string' && attempt.feedback.startsWith(NRPG_ATTEMPT_VOID_PREFIX);
}

function attemptTime(attempt: NrpgAttemptRecord): number {
  return (attempt.completedAt ?? attempt.createdAt).getTime();
}

/**
 * Pure server-side retake gate (DR-894). `attempts` are the persisted
 * ContractorAssessment rows for one (onboarding, module) pair.
 *
 * Rules, in precedence order:
 *   1. Voided rows (admin reset) never count.
 *   2. Only FAILED attempts (score below the passing threshold, or no score)
 *      count toward the cap — a passing row completes the module and the
 *      sequential lock already blocks resubmission.
 *   3. attemptsUsed >= max  -> blocked, ATTEMPT_CAP, admin reset required.
 *   4. now < lastFail + cooldown -> blocked, COOLDOWN, retryAt returned.
 */
export function evaluateNrpgRetakePolicy(
  attempts: readonly NrpgAttemptRecord[],
  now: Date = new Date()
): NrpgRetakeDecision {
  const failed = attempts.filter(
    (a) => !isVoidedNrpgAttempt(a) && !(typeof a.score === 'number' && a.score >= NRPG_QUIZ_PASSING_SCORE)
  );
  const attemptsUsed = failed.length;
  const attemptsRemaining = Math.max(0, NRPG_QUIZ_MAX_ATTEMPTS - attemptsUsed);

  if (attemptsUsed >= NRPG_QUIZ_MAX_ATTEMPTS) {
    return {
      allowed: false,
      reason: 'ATTEMPT_CAP',
      attemptsUsed,
      attemptsRemaining: 0,
      maxAttempts: NRPG_QUIZ_MAX_ATTEMPTS,
      retryAt: null,
    };
  }

  const lastFailAt = failed.reduce<number | null>(
    (max, a) => (max === null || attemptTime(a) > max ? attemptTime(a) : max),
    null
  );
  if (lastFailAt !== null) {
    const retryAt = new Date(lastFailAt + NRPG_QUIZ_RETAKE_COOLDOWN_MS);
    if (now.getTime() < retryAt.getTime()) {
      return {
        allowed: false,
        reason: 'COOLDOWN',
        attemptsUsed,
        attemptsRemaining,
        maxAttempts: NRPG_QUIZ_MAX_ATTEMPTS,
        retryAt,
      };
    }
  }

  return {
    allowed: true,
    reason: null,
    attemptsUsed,
    attemptsRemaining,
    maxAttempts: NRPG_QUIZ_MAX_ATTEMPTS,
    retryAt: null,
  };
}

// ---------------------------------------------------------------------------
// Certificate expiry sweep — renewal notice selection (DR-894)
// ---------------------------------------------------------------------------

/** Renewal notices fire this many days before expiry (plus one at expiry). */
export const NRPG_CERT_RENEWAL_NOTICE_DAYS = [30, 7] as const;

export type NrpgCertRenewalNotice = 'T30' | 'T7' | 'EXPIRED';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Classify one certificate expiry date against a DAILY sweep run at `now`.
 * Each bucket is a one-day half-open window so a daily cron selects every
 * cert exactly once per notice:
 *   T30:     29d < timeToExpiry <= 30d
 *   T7:       6d < timeToExpiry <=  7d
 *   EXPIRED: expired within the last day (-1d < timeToExpiry <= 0)
 * A 29-days-out cert returns null: already notified at T-30, not yet T-7.
 */
export function classifyNrpgCertRenewalNotice(
  expiryDate: Date,
  now: Date = new Date()
): NrpgCertRenewalNotice | null {
  const msToExpiry = expiryDate.getTime() - now.getTime();
  if (msToExpiry > 29 * DAY_MS && msToExpiry <= 30 * DAY_MS) return 'T30';
  if (msToExpiry > 6 * DAY_MS && msToExpiry <= 7 * DAY_MS) return 'T7';
  if (msToExpiry <= 0 && msToExpiry > -DAY_MS) return 'EXPIRED';
  return null;
}
