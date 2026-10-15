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
    /RestoreAssist[^\n]{0,160}industry[- ]standard|industry[- ]standard[^\n]{0,160}RestoreAssist/i,
  ],
  ['used by most insurers', /most (major )?insurers|used by most (major )?insurance/i],
  ['fixed overhead/profit rate', /(overhead|profit)\s*\(\s*10\s*%\s*\)/i],
  ['unit pricing includes fixed rates', /unit pricing includes[^.]*10\s*%/i],
];

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
      for (const [label, re] of UNSUPPORTED) {
        if (re.test(text)) hits.push(`${label}: ${file}`);
      }
    }
    expect(hits).toEqual([]);
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
