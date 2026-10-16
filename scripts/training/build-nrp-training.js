const { createHash } = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const vm = require('vm');

function sha256Hex(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function extractHtmlTitle(html) {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  return (match && match[1] ? match[1].trim() : '') || '';
}

function extractModuleNumberFromFilename(filename) {
  const match = filename.match(/NRP-(\d{3})/i);
  if (!match) return null;
  return parseInt(match[1], 10);
}

function buildModuleId(moduleNumber) {
  return `NRP-${String(moduleNumber).padStart(3, '0')}`;
}

function findJsObjectLiteral(source, anchor) {
  const anchorIndex = source.indexOf(anchor);
  if (anchorIndex === -1) {
    throw new Error(`Anchor not found: ${anchor}`);
  }

  const equalsIndex = source.indexOf('=', anchorIndex);
  if (equalsIndex === -1) {
    throw new Error(`Assignment not found for anchor: ${anchor}`);
  }

  const startIndex = source.indexOf('{', equalsIndex);
  if (startIndex === -1) {
    throw new Error(`Opening brace not found for anchor: ${anchor}`);
  }

  let index = startIndex;
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplate = false;
  let escaped = false;

  for (; index < source.length; index += 1) {
    const ch = source[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (ch === '\\') {
      escaped = true;
      continue;
    }

    if (!inDoubleQuote && !inTemplate && ch === "'") {
      inSingleQuote = !inSingleQuote;
      continue;
    }
    if (!inSingleQuote && !inTemplate && ch === '"') {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }
    if (!inSingleQuote && !inDoubleQuote && ch === '`') {
      inTemplate = !inTemplate;
      continue;
    }

    if (inSingleQuote || inDoubleQuote || inTemplate) continue;

    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return { objectLiteral: source.slice(startIndex, index + 1) };
      }
    }
  }

  throw new Error(`Unbalanced braces while extracting object literal for: ${anchor}`);
}

function parseQuizBankFromHtml(html) {
  const { objectLiteral } = findJsObjectLiteral(html, 'const quizData');
  const script = `const quizData = ${objectLiteral}; quizData;`;
  return vm.runInNewContext(script, {}, { timeout: 5000 });
}

async function main() {
  const repoRoot = process.cwd();
  const sourcesRoot = path.join(repoRoot, 'training-sources', 'NRP Folder');
  const outputDir = path.join(repoRoot, 'src', 'lib', 'training', 'generated');

  await fs.mkdir(outputDir, { recursive: true });

  const files = await fs.readdir(sourcesRoot);

  const sources = [];
  const modules = [];

  let quizSourcePath = null;
  let quizSourceSha256 = null;
  let quizBank = null;

  for (const filename of files) {
    const absolutePath = path.join(sourcesRoot, filename);
    const stat = await fs.stat(absolutePath);
    if (!stat.isFile()) continue;

    const buffer = await fs.readFile(absolutePath);
    const relPath = path.relative(repoRoot, absolutePath).replace(/\\/g, '/');
    const sha256 = sha256Hex(buffer);

    sources.push({ path: relPath, sha256, bytes: buffer.byteLength });

    if (/NRP-Complete-Quiz-System\.html$/i.test(filename)) {
      quizSourcePath = relPath;
      quizSourceSha256 = sha256;
      quizBank = parseQuizBankFromHtml(buffer.toString('utf8'));
      continue;
    }

    const moduleNumber = extractModuleNumberFromFilename(filename);
    if (moduleNumber === null) continue;

    const title = extractHtmlTitle(buffer.toString('utf8')) || filename;

    modules.push({
      moduleId: buildModuleId(moduleNumber),
      moduleNumber,
      title,
      sourcePath: relPath,
      sourceSha256: sha256,
    });
  }

  // Two source files can carry the same module number (NRP-012 has a legacy water-damage
  // page beside the odour module). The index must hold exactly one entry per module, the
  // file named in apps/web/lib/training/module-filenames.ts; any other duplicate is an error.
  const CANONICAL_DUPLICATE_SOURCE = { 12: 'NRP-012-ODOUR-CONTROL-DEODORISATION.html' };
  const byNumber = new Map();
  for (const m of modules) {
    const kept = byNumber.get(m.moduleNumber);
    if (!kept) {
      byNumber.set(m.moduleNumber, m);
      continue;
    }
    const canonical = CANONICAL_DUPLICATE_SOURCE[m.moduleNumber];
    if (!canonical) {
      throw new Error(`Duplicate module ${m.moduleId}: ${kept.sourcePath} and ${m.sourcePath}`);
    }
    if (path.basename(m.sourcePath) === canonical) byNumber.set(m.moduleNumber, m);
  }
  for (const [number, canonical] of Object.entries(CANONICAL_DUPLICATE_SOURCE)) {
    const kept = byNumber.get(Number(number));
    if (kept && path.basename(kept.sourcePath) !== canonical) {
      throw new Error(`${kept.moduleId} resolved to ${kept.sourcePath}, expected ${canonical}`);
    }
  }
  modules.length = 0;
  modules.push(...byNumber.values());
  modules.sort((a, b) => a.moduleNumber - b.moduleNumber);

  if (!quizSourcePath || !quizSourceSha256 || !quizBank) {
    throw new Error('Quiz system source not found or failed to parse (NRP-Complete-Quiz-System.html).');
  }

  const quizModules = Object.keys(quizBank)
    .map((k) => parseInt(k, 10))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b)
    .map((moduleNumber) => {
      const moduleData = quizBank[moduleNumber] || {};
      return {
        moduleId: buildModuleId(moduleNumber),
        moduleNumber,
        name: moduleData.name || `Module ${moduleNumber}`,
        description: moduleData.description || '',
        questionCount: Array.isArray(moduleData.questions) ? moduleData.questions.length : 0,
      };
    });

  const generatedAt = new Date().toISOString();

  const index = {
    generatedAt,
    sources: sources.sort((a, b) => a.path.localeCompare(b.path)),
    modules,
    quiz: {
      sourcePath: quizSourcePath,
      sourceSha256: quizSourceSha256,
      modules: quizModules,
    },
  };

  await fs.writeFile(
    path.join(outputDir, 'nrp-training-index.json'),
    JSON.stringify(index, null, 2),
    'utf8'
  );

  await fs.writeFile(
    path.join(outputDir, 'nrp-quiz-bank.json'),
    JSON.stringify(
      {
        generatedAt,
        sourcePath: quizSourcePath,
        sourceSha256: quizSourceSha256,
        quizData: quizBank,
      },
      null,
      2
    ),
    'utf8'
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

