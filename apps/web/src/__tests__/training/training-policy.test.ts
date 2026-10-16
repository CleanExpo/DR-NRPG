/**
 * @jest-environment node
 *
 * DR-893 — Single-sourced training policy configuration.
 *
 * Proves the training-policy module is the ONE source for:
 *   1. The quiz passing threshold (grading reads it — no hardcoded 70/80).
 *   2. Certificate validity (issue + validity = expiry).
 *   3. The canonical 24-module set (NRP-001..NRP-024) and set-equality
 *      completion semantics: duplicates never inflate the count, 23/24 fails,
 *      non-canonical ids never count.
 */
import {
  NRPG_QUIZ_PASSING_SCORE,
  NRPG_CERT_VALIDITY_YEARS,
  NRPG_CERTIFICATION_NAME,
  NRPG_CERTIFICATION_NAMES,
  formatModuleIdForDisplay,
  NRPG_CANONICAL_MODULE_COUNT,
  NRPG_CANONICAL_MODULE_IDS,
  countNrpgCanonicalModulesPassed,
  isNrpgTrainingSetComplete,
  getNrpgCertificationExpiryDate,
} from '@/lib/training/training-policy';
import {
  gradeNrpgQuizSubmission,
  NRPG_QUIZ_PASSING_SCORE as REEXPORTED_SCORE,
} from '@/lib/training/nrp-training';

const ALL_24 = [...NRPG_CANONICAL_MODULE_IDS];

/** n-question quiz with answer key all-zero. */
function quizOf(n: number) {
  return {
    name: 'Policy fixture',
    description: '',
    questions: Array.from({ length: n }, (_, i) => ({
      id: `q${i + 1}`,
      type: 'mc',
      question: `Q${i + 1}`,
      options: ['a', 'b', 'c', 'd'],
      correct: 0,
      explanation: `e${i + 1}`,
    })),
  };
}

/** Answers with exactly `correct` right answers out of `total`. */
function answersWith(correct: number, total: number): Record<string, number> {
  const answers: Record<string, number> = {};
  for (let i = 1; i <= total; i++) {
    answers[`q${i}`] = i <= correct ? 0 : 1;
  }
  return answers;
}

describe('canonical module set', () => {
  it('is exactly NRP-001..NRP-024 with no duplicates', () => {
    expect(NRPG_CANONICAL_MODULE_COUNT).toBe(24);
    expect(NRPG_CANONICAL_MODULE_IDS).toHaveLength(24);
    expect(new Set(NRPG_CANONICAL_MODULE_IDS).size).toBe(24);
    expect(NRPG_CANONICAL_MODULE_IDS[0]).toBe('NRP-001');
    expect(NRPG_CANONICAL_MODULE_IDS[11]).toBe('NRP-012');
    expect(NRPG_CANONICAL_MODULE_IDS[23]).toBe('NRP-024');
  });
});

describe('isNrpgTrainingSetComplete — set equality, not count', () => {
  it('accepts exactly the canonical 24', () => {
    expect(isNrpgTrainingSetComplete(ALL_24)).toBe(true);
  });

  it('rejects 24 completions containing a duplicate id (23 unique + duplicated NRP-012)', () => {
    const withDuplicate = [...ALL_24.filter((id) => id !== 'NRP-024'), 'NRP-012'];
    expect(withDuplicate).toHaveLength(24); // count-based check would pass this
    expect(isNrpgTrainingSetComplete(withDuplicate)).toBe(false);
  });

  it('rejects 23/24', () => {
    expect(isNrpgTrainingSetComplete(ALL_24.slice(0, 23))).toBe(false);
  });

  it('rejects a non-canonical id padding the count (23 canonical + NRP-025)', () => {
    const padded = [...ALL_24.slice(0, 23), 'NRP-025'];
    expect(padded).toHaveLength(24);
    expect(isNrpgTrainingSetComplete(padded)).toBe(false);
  });

  it('a redundant duplicate on top of a genuinely complete set still passes', () => {
    expect(isNrpgTrainingSetComplete([...ALL_24, 'NRP-012'])).toBe(true);
  });

  it('is case/whitespace tolerant on ids', () => {
    const lowered = ALL_24.map((id) => ` ${id.toLowerCase()}`);
    expect(isNrpgTrainingSetComplete(lowered)).toBe(true);
  });

  it('counts distinct canonical passes only', () => {
    expect(countNrpgCanonicalModulesPassed(['NRP-012', 'nrp-012', 'NRP-025', 'CSE-01'])).toBe(1);
    expect(countNrpgCanonicalModulesPassed(ALL_24)).toBe(24);
  });
});

describe('single-sourced passing threshold', () => {
  it('nrp-training re-exports the same threshold object grading enforces', () => {
    expect(REEXPORTED_SCORE).toBe(NRPG_QUIZ_PASSING_SCORE);
  });

  it('gradeNrpgQuizSubmission reads the policy threshold (no literal)', () => {
    const grade = gradeNrpgQuizSubmission(quizOf(10), answersWith(10, 10));
    expect(grade.passingScore).toBe(NRPG_QUIZ_PASSING_SCORE);
  });

  it('passes AT the threshold exactly and fails one point below it', () => {
    // 100 questions => score == number correct, so the boundary is exact.
    const atThreshold = gradeNrpgQuizSubmission(
      quizOf(100),
      answersWith(NRPG_QUIZ_PASSING_SCORE, 100)
    );
    expect(atThreshold.score).toBe(NRPG_QUIZ_PASSING_SCORE);
    expect(atThreshold.passed).toBe(true);

    const oneBelow = gradeNrpgQuizSubmission(
      quizOf(100),
      answersWith(NRPG_QUIZ_PASSING_SCORE - 1, 100)
    );
    expect(oneBelow.score).toBe(NRPG_QUIZ_PASSING_SCORE - 1);
    expect(oneBelow.passed).toBe(false);
  });
});

describe('certificate validity from config', () => {
  it('exposes a 1-year validity period and a name for the NRPG certification', () => {
    expect(NRPG_CERT_VALIDITY_YEARS).toBe(1);
    expect(NRPG_CERTIFICATION_NAME).toBe('NRPG Contractor Certification');
    // Pre-rebrand rows stay valid: queries match both names, new name first.
    expect(NRPG_CERTIFICATION_NAMES).toEqual(['NRPG Contractor Certification', 'NRP Contractor Certification']);
  });

  it('computes expiry = issue date + the configured validity', () => {
    const issue = new Date('2026-07-02T10:00:00.000Z');
    const expiry = getNrpgCertificationExpiryDate(issue);
    const expected = new Date(issue.getTime());
    expected.setFullYear(expected.getFullYear() + NRPG_CERT_VALIDITY_YEARS);
    expect(expiry.getTime()).toBe(expected.getTime());
    // and does not mutate the input
    expect(issue.toISOString()).toBe('2026-07-02T10:00:00.000Z');
  });
});

describe('module ID display', () => {
  it('shows stored NRP- module IDs as NRPG- and leaves other IDs alone', () => {
    expect(formatModuleIdForDisplay('NRP-001')).toBe('NRPG-001');
    expect(formatModuleIdForDisplay('nrp-024')).toBe('NRPG-024');
    expect(formatModuleIdForDisplay('NRPG-001')).toBe('NRPG-001');
    expect(formatModuleIdForDisplay('CSE-M01')).toBe('CSE-M01');
    expect(formatModuleIdForDisplay('NRP-2026-1234')).toBe('NRP-2026-1234');
  });
});
