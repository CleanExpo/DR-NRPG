/**
 * @jest-environment node
 *
 * Unsupported-claim guard for graded training content. The quiz bank is
 * generated from the served training sources, so a claim in a source page
 * becomes a graded answer. RestoreAssist.ai stays the answer to the platform
 * questions; it must not be called the industry standard or said to be used by
 * most insurers, and overhead/profit must not be asserted as fixed rates.
 */
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { MODULE_FILENAMES } from '../../../lib/training/module-filenames';

const webRoot = path.join(__dirname, '..', '..', '..');
const repoRoot = path.join(webRoot, '..', '..');
const generated = path.join(webRoot, 'src', 'lib', 'training', 'generated');
const bank = JSON.parse(fs.readFileSync(path.join(generated, 'nrp-quiz-bank.json'), 'utf8'));
const index = JSON.parse(fs.readFileSync(path.join(generated, 'nrp-training-index.json'), 'utf8'));

const sourceDirs = [
  path.join(webRoot, 'public', 'training-sources', 'NRP Folder'),
  path.join(webRoot, 'lib', 'training', 'sources', 'NRP Folder'),
  path.join(repoRoot, 'training-sources', 'NRP Folder'),
];
const moduleDir = path.join(webRoot, 'public', 'training-modules');

const UNSUPPORTED: Array<[string, RegExp]> = [
  [
    'RestoreAssist called industry standard',
    /RestoreAssist.{0,160}industry[- ]standard|industry[- ]standard.{0,160}RestoreAssist/i,
  ],
  ['used by most insurers', /most (major )?insurers|used by most (major )?insurance/i],
  ['fixed overhead/profit rate', /(overhead|profit)\s*\(\s*10\s*%\s*\)/i],
  ['unit pricing includes fixed rates', /unit pricing includes[^.]*10\s*%/i],
];

// A claim split by a line break, a JSON "\n" escape or an HTML tag is still
// the claim, so every text is matched as one line of single-spaced words.
function flatten(text: string): string {
  return text.replace(/<[^>]*>/g, ' ').replace(/\\n|\s+/g, ' ');
}

function unsupportedHits(text: string): string[] {
  const flat = flatten(text);
  return UNSUPPORTED.filter(([, re]) => re.test(flat)).map(([label]) => label);
}

function texts(): Array<{ file: string; text: string }> {
  const out: Array<{ file: string; text: string }> = [];
  for (const dir of sourceDirs) {
    for (const name of fs.readdirSync(dir)) {
      if (/\.(html|md)$/i.test(name)) {
        out.push({ file: path.join(dir, name), text: fs.readFileSync(path.join(dir, name), 'utf8') });
      }
    }
  }
  for (const name of fs.readdirSync(moduleDir)) {
    if (name.endsWith('.json')) {
      out.push({ file: path.join(moduleDir, name), text: fs.readFileSync(path.join(moduleDir, name), 'utf8') });
    }
  }
  out.push({ file: 'nrp-quiz-bank.json', text: JSON.stringify(bank.quizData) });
  return out;
}

function findQuestion(id: string) {
  for (const mod of Object.values(bank.quizData) as Array<{ questions: any[] }>) {
    const hit = mod.questions.find((q) => q.id === id);
    if (hit) return hit;
  }
  throw new Error(`question ${id} not in bank`);
}

describe('graded training content claims', () => {
  it('has no unsupported RestoreAssist, insurer-usage or fixed-margin claims', () => {
    const hits: string[] = [];
    for (const { file, text } of texts()) {
      for (const label of unsupportedHits(text)) hits.push(`${label}: ${file}`);
    }
    expect(hits).toEqual([]);
  });

  it('the guard catches a claim split across a line break, a JSON escape or a tag', () => {
    expect(unsupportedHits('RestoreAssist.ai is the\nindustry standard')).toEqual([
      'RestoreAssist called industry standard',
    ]);
    expect(unsupportedHits('"RestoreAssist.ai is the\\nindustry standard"')).toEqual([
      'RestoreAssist called industry standard',
    ]);
    expect(unsupportedHits('<p>RestoreAssist.ai is the <b>industry</b>\n  standard</p>')).toEqual([
      'RestoreAssist called industry standard',
    ]);
    expect(unsupportedHits('used by most\n\tinsurers')).toEqual(['used by most insurers']);
  });

  it('m10q4 still grades RestoreAssist.ai as the platform answer', () => {
    const q = findQuestion('m10q4');
    expect(q.question).toMatch(/NRPG programme use/);
    expect(Number.isInteger(q.correct)).toBe(true);
    expect(q.options[q.correct]).toBe('RestoreAssist.ai');
    expect(q.options).toHaveLength(4);
  });

  it('m17q1 still grades materials, labour, overhead, profit and says rates vary', () => {
    const q = findQuestion('m17q1');
    expect(Number.isInteger(q.correct)).toBe(true);
    expect(q.options[q.correct]).toBe('Materials, labour, overhead, profit');
    expect(q.explanation).toMatch(/vary/);
    expect(q.explanation).not.toMatch(/\d+\s*%/);
  });

  it('index holds one entry per module, each the file module-filenames.ts names', () => {
    // NRP-012 has two source files; onboarding (Map, last wins) and the lesson
    // loader (find, first wins) disagreed when both were indexed.
    const mods = index.modules as Array<{ moduleId: string; sourcePath: string }>;
    const ids = mods.map((m) => m.moduleId);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(Object.keys(MODULE_FILENAMES).sort());
    for (const m of mods) {
      expect({ id: m.moduleId, file: path.basename(m.sourcePath) }).toEqual({
        id: m.moduleId,
        file: MODULE_FILENAMES[m.moduleId],
      });
    }
  });

  it('every root training source equals the committed app copy the build overwrites', () => {
    // `pnpm build` runs scripts/copy-training-sources.js, which copies the root
    // training-sources over lib/training/sources. A fix made only in the app copy is
    // silently undone by every build (the NRPG certificate title was, 16/10/2026).
    const root = path.join(repoRoot, 'training-sources', 'NRP Folder');
    const app = path.join(webRoot, 'lib', 'training', 'sources', 'NRP Folder');
    const differ = fs
      .readdirSync(root)
      .filter((name) => !fs.existsSync(path.join(app, name)) ||
        !fs.readFileSync(path.join(root, name)).equals(fs.readFileSync(path.join(app, name))));
    expect(differ).toEqual([]);
  });

  it('generated index and bank hashes match the served files', () => {
    const served = path.join(webRoot, 'public', 'training-sources', 'NRP Folder');
    const quizSha = createHash('sha256')
      .update(fs.readFileSync(path.join(served, 'NRP-Complete-Quiz-System.html')))
      .digest('hex');
    expect(bank.sourceSha256).toBe(quizSha);
    expect(index.quiz.sourceSha256).toBe(quizSha);
    for (const m of index.modules as Array<{ sourcePath: string; sourceSha256: string }>) {
      const file = path.join(webRoot, 'public', m.sourcePath);
      const sha = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
      expect({ file: m.sourcePath, sha }).toEqual({ file: m.sourcePath, sha: m.sourceSha256 });
    }
  });
});
