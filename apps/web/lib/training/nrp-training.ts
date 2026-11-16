import path from 'path';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';

// Training sources are stored in the public folder so they're accessible in Vercel's serverless functions
// The public folder is always included in Vercel deployments and accessible via fs.readFile()

export interface NrpgTrainingSource {
  path: string;
  sha256: string;
  bytes: number;
}

export interface NrpgTrainingModuleIndexEntry {
  moduleId: string;
  moduleNumber: number;
  title: string;
  sourcePath: string;
  sourceSha256: string;
}

export interface NrpgTrainingQuizModuleIndexEntry {
  moduleId: string;
  moduleNumber: number;
  name: string;
  description: string;
  questionCount: number;
}

export interface NrpgTrainingIndex {
  generatedAt: string;
  sources: NrpgTrainingSource[];
  modules: NrpgTrainingModuleIndexEntry[];
  quiz: {
    sourcePath: string;
    sourceSha256: string;
    modules: NrpgTrainingQuizModuleIndexEntry[];
  };
}

export interface NrpgQuizQuestion {
  id: string;
  type: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  reference?: string;
}

export interface NrpgQuizModule {
  name: string;
  description: string;
  questions: NrpgQuizQuestion[];
}

export interface NrpgQuizBank {
  generatedAt: string;
  sourcePath: string;
  sourceSha256: string;
  quizData: Record<string, NrpgQuizModule>;
}

function generatedDir(): string {
  // In production (Vercel), src/ is compiled away
  // Try the lib path first (production), fall back to src path (development)
  return path.join(process.cwd(), 'lib', 'training', 'generated');
}

function trainingSourcesDir(): string {
  // Use public folder so files are accessible in Vercel serverless functions
  return path.join(process.cwd(), 'public', 'training-sources');
}

function sha256Hex(content: Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

export async function loadNrpgTrainingIndex(): Promise<NrpgTrainingIndex> {
  const raw = await fs.readFile(path.join(generatedDir(), 'nrp-training-index.json'), 'utf8');
  return JSON.parse(raw) as NrpgTrainingIndex;
}

export async function loadNrpgQuizBank(): Promise<NrpgQuizBank> {
  const raw = await fs.readFile(path.join(generatedDir(), 'nrp-quiz-bank.json'), 'utf8');
  return JSON.parse(raw) as NrpgQuizBank;
}

export async function getNrpgQuizModule(moduleNumber: number): Promise<NrpgQuizModule | null> {
  const bank = await loadNrpgQuizBank();
  const quizModule = bank.quizData[String(moduleNumber)];
  return quizModule ?? null;
}

/**
 * Client-safe quiz question projection (DR-892).
 * Strips the answer key — `correct` and `explanation` must never reach a
 * non-admin caller before grading.
 */
export interface NrpgClientSafeQuizQuestion {
  id: string;
  type: string;
  question: string;
  options: string[];
  reference?: string;
}

export function toClientSafeQuizQuestions(
  questions: NrpgQuizQuestion[]
): NrpgClientSafeQuizQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    type: q.type,
    question: q.question,
    options: q.options,
    reference: q.reference,
  }));
}

// Single-sourced training policy (DR-893). The threshold moved into
// training-policy.ts; re-exported here so existing consumers keep working.
import { NRPG_QUIZ_PASSING_SCORE } from './training-policy';
export { NRPG_QUIZ_PASSING_SCORE } from './training-policy';

export interface NrpgQuizQuestionResult {
  questionId: string;
  correct: boolean;
  /** Revealed only AFTER a graded submission. */
  correctAnswer: number;
  explanation: string;
}

export interface NrpgQuizGrade {
  total: number;
  correctCount: number;
  score: number;
  passingScore: number;
  passed: boolean;
  results: NrpgQuizQuestionResult[];
}

/**
 * Server-authoritative quiz grading (DR-892).
 * The score is computed here from the sealed answer key — any score a client
 * asserts is ignored by construction because it is never an input.
 */
export function gradeNrpgQuizSubmission(
  quizModule: NrpgQuizModule,
  answers: Record<string, number>
): NrpgQuizGrade {
  const results: NrpgQuizQuestionResult[] = quizModule.questions.map((q) => ({
    questionId: q.id,
    correct: answers[q.id] === q.correct,
    correctAnswer: q.correct,
    explanation: q.explanation,
  }));

  const total = quizModule.questions.length;
  const correctCount = results.filter((r) => r.correct).length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return {
    total,
    correctCount,
    score,
    passingScore: NRPG_QUIZ_PASSING_SCORE,
    passed: score >= NRPG_QUIZ_PASSING_SCORE,
    results,
  };
}

export function parseNrpgModuleNumber(moduleId: string): number | null {
  const match = moduleId.match(/^NRP-(\d{3})$/i);
  if (!match) return null;
  return parseInt(match[1], 10);
}

/**
 * Parse CSE module ID to extract module number
 * Format: CSE-M01, CSE-M02, etc.
 */
export function parseCseModuleNumber(moduleId: string): number | null {
  const match = moduleId.match(/^CSE-M(\d{2})$/i);
  if (!match) return null;
  return parseInt(match[1], 10);
}

/**
 * Parse water damage restoration module ID to extract module number
 * Format: WRT-M01, WRT-M02, etc.
 */
export function parseWrtModuleNumber(moduleId: string): number | null {
  const match = moduleId.match(/^WRT-M(\d{2})$/i);
  if (!match) return null;
  return parseInt(match[1], 10);
}

/**
 * Determine course type from module ID
 */
export function getCourseTypeFromModuleId(moduleId: string): 'NRPG' | 'CSE' | 'WRT' | null {
  if (moduleId.match(/^NRP-\d{3}$/i)) return 'NRPG';
  if (moduleId.match(/^CSE-M\d{2}$/i)) return 'CSE';
  if (moduleId.match(/^WRT-M\d{2}$/i)) return 'WRT';
  return null;
}

/**
 * Get module path based on course type
 */
function getModulePath(courseType: 'NRPG' | 'CSE' | 'WRT', moduleNumber: number): string {
  switch (courseType) {
    case 'NRPG':
      return path.join('training-sources', 'modules', `nrp-${moduleNumber.toString().padStart(3, '0')}.html`);
    case 'CSE':
      return path.join('..', '..', 'NRPG-Onboarding-Framework', 'contractor-onboarding', 'customer-service-excellence', 'modules', `module-${moduleNumber.toString().padStart(2, '0')}-training-content.md`);
    case 'WRT':
      return path.join('..', '..', 'NRPG-Onboarding-Framework', 'contractor-onboarding', 'water-damage-restoration', 'modules', `module-${moduleNumber.toString().padStart(2, '0')}-training-content.md`);
    default:
      throw new Error(`Unknown course type: ${courseType}`);
  }
}

export async function getTrainingModuleHtmlById(
  moduleId: string
): Promise<{ html: string; sourcePath: string; sha256: string }> {
  const courseType = getCourseTypeFromModuleId(moduleId);
  
  if (!courseType) {
    throw new Error(`Invalid module ID format: ${moduleId}. Expected NRP-XXX, CSE-MXX, or WRT-MXX`);
  }

  // Try to load from index first (for NRPG modules)
  if (courseType === 'NRPG') {
    const index = await loadNrpgTrainingIndex();
    const entry = index.modules.find((m) => m.moduleId.toUpperCase() === moduleId.toUpperCase());
    if (entry) {
      // Read from public/training-sources (accessible in Vercel serverless functions)
      const localPath = entry.sourcePath.replace('training-sources/', '');
      const absolutePath = path.join(process.cwd(), 'public', 'training-sources', localPath);
      const buffer = await fs.readFile(absolutePath);
      const sha = sha256Hex(buffer);

      if (sha !== entry.sourceSha256) {
        throw new Error(`Training module source hash mismatch for ${moduleId}`);
      }

      return {
        html: buffer.toString('utf8'),
        sourcePath: entry.sourcePath,
        sha256: sha,
      };
    }
  }

  // For CSE and water damage restoration modules, load directly from framework
  const moduleNumber = courseType === 'CSE' 
    ? parseCseModuleNumber(moduleId) 
    : parseWrtModuleNumber(moduleId);
    
  if (!moduleNumber) {
    throw new Error(`Training module not found: ${moduleId}`);
  }

  const sourcePath = getModulePath(courseType, moduleNumber);
  const absolutePath = path.join(process.cwd(), sourcePath);

  try {
    const buffer = await fs.readFile(absolutePath);
    const sha = sha256Hex(buffer);

    return {
      html: buffer.toString('utf8'),
      sourcePath,
      sha256: sha,
    };
  } catch (error) {
    throw new Error(`Training module not found: ${moduleId} (tried ${sourcePath})`);
  }
}

export async function verifyTrainingSourcesPresent(): Promise<void> {
  const root = trainingSourcesDir();
  const stat = await fs.stat(root).catch(() => null);
  if (!stat || !stat.isDirectory()) {
    throw new Error('Missing training-sources directory');
  }
}

export async function getVerifiedTrainingSourceHtml(
  relativePath: string
): Promise<{ html: string; sha256: string; bytes: number }> {
  const index = await loadNrpgTrainingIndex();
  const entry = index.sources.find((s) => s.path === relativePath);
  if (!entry) {
    throw new Error(`Training source not found in index: ${relativePath}`);
  }

  // Replace 'training-sources' prefix with 'public/training-sources'
  const localPath = relativePath.replace('training-sources/', '');
  const absolutePath = path.join(process.cwd(), 'public', 'training-sources', localPath);
  const buffer = await fs.readFile(absolutePath);
  const sha = sha256Hex(buffer);

  if (sha !== entry.sha256) {
    throw new Error(`Training source hash mismatch for ${relativePath}`);
  }

  return { html: buffer.toString('utf8'), sha256: sha, bytes: buffer.byteLength };
}
