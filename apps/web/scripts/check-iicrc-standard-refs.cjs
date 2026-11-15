#!/usr/bin/env node
/**
 * Fails when an IICRC standard number or standard title appears anywhere the
 * site can show it (DR-993), or when NRPG's own wording uses the IICRC name as
 * a certification claim or beside a certification code (DR-1000).
 *
 * Why: naming an IICRC standard by number or title on nrpg.business is not
 * allowed, and neither is presenting NRPG or its network as IICRC certified.
 * Nothing in the build used to fail on that wording, so it returned whenever
 * an author followed an old instruction. The IICRC name stays only where a
 * page describes an IICRC course or records a contractor's own credential.
 *
 * Usage:
 *   node scripts/check-iicrc-standard-refs.cjs                 check the repository
 *   node scripts/check-iicrc-standard-refs.cjs --root <dir>    check another tree
 *   node scripts/check-iicrc-standard-refs.cjs --selftest      prove the check can fail
 *
 * Exit: 0 clean, 1 findings (or a failed self-test case), 2 usage or internal error.
 * An empty scan is an error, never a pass.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

// Patterns are assembled from parts so this file never matches its own rules.
const S = 'S';
const D = '[0-9]';
const CODE = '(?:WRT|FSRT|ASD|AMRT|OCT|CCT|UFT|RRT|BSRT|TCST|HST|CDS|CMT|FCT|RFMT|SMT|LCT|CCMT|JMT|WLS|FST|CFT)';
// Words that turn the IICRC name into a mark NRPG shows for itself: a
// certification, an endorsement or a partnership (DR-1000).
const CLAIM_WORD = '(?:certified|verified|accredited|approved|endorsed|registered|partners?)';
const AS_STANDARD_WORD = '(?:standards?|referenced|protocols?|guidelines?|methodology|compliant|compliance)';
const BANNED_FORMS = [
  { name: 'standard-number', re: new RegExp('(?<![A-Za-z0-9_])' + S + D + '{3,4}(?![0-9A-Za-z_])', 'g') },
  { name: 'standard-number-enum', re: new RegExp('(?<![A-Za-z0-9])' + S + D + '{3,4}_[A-Z]', 'g') },
  { name: 'standard-slug', re: new RegExp('iicrc[-_ ]?s' + D + '{3,4}', 'gi') },
  {
    name: 'standard-prefix',
    re: new RegExp('ANSI/IICRC|AS/NZS[ -]?IICRC|AS-IICRC|BSR/IICRC', 'gi'),
  },
  {
    name: 'standard-title',
    // Every IICRC standard title has the form "Standard [and Reference Guide]
    // for Professional <topic>". Matching that form, singular or plural, leaves
    // plain phrases such as "industry standard for water damage" alone.
    re: new RegExp('(Standards?|Reference Guides?)( and Reference Guides?)? for Professional', 'gi'),
  },
  {
    name: 'cert-as-standard',
    // A certification code names a course a technician passes. Written with
    // "standard", "protocol", "compliant" and the like beside it, it reads as
    // an IICRC standard cited by name, which is the thing this check forbids.
    re: new RegExp(
      'IICRC[ -]' + CODE + '(?:(?: ?[/&,] ?| and )' + CODE + ')*[ -]' + AS_STANDARD_WORD +
        '|(?:standards?|protocols?)\\s*[(:\\u2014-]?\\s*IICRC[ -]' + CODE + '\\b' +
        // a list held in a field named "standards", anywhere in the list
        '|standards?["\']?\\s*[:=]\\s*\\[[^\\]\\n]*IICRC[ -]' + CODE + '\\b',
      'gi'
    ),
  },
  {
    name: 'cert-badge',
    // A badge that shows "IICRC <code>" as a mark. The component that drew it
    // is gone; this stops it being rebuilt. The plain shield icon of the same
    // name takes no code and is not matched.
    re: new RegExp('IICRCBadge' + 'Group|<IICRCBadge\\b[^>]*\\bcode=', 'g'),
  },
  {
    name: 'iicrc-standards',
    // The organisation's name written as the owner of a standard: "IICRC
    // standards", "IICRC-standard drying", "IICRC drying standards". The name
    // is matched in capitals only, so file names and CSS classes such as
    // iicrc-standards.service.ts are left alone. At most two words may sit
    // between the name and the word "standard".
    re: new RegExp("IICRC(?:['\\u2019]s)?[ -](?:[A-Za-z]+[ -]){0,2}?(?:[Ss]tandards?|STANDARDS?)\\b", 'g'),
  },
  {
    name: 'cert-code-pair',
    // DR-1000. The IICRC name written beside a certification code ("IICRC
    // WRT", "IICRC-FSRT"). A contractor's own credential is written without
    // the pairing ("Water Restoration Technician (WRT)" under an IICRC
    // heading). Capitals only, so field names such as iicrc.wrt are left alone.
    re: new RegExp('(?<![A-Za-z0-9_])IICRC[ /-]' + CODE + '(?![A-Za-z0-9])', 'g'),
  },
  {
    name: 'cert-claim',
    // DR-1000. "IICRC-certified", "IICRC Certified Partner", "IICRC Category
    // 3-certified", "IICRC-verified", "certified by the IICRC": the name used
    // as a mark of certification, endorsement or partnership. At most three
    // words may sit between the name and the claim word. The noun "IICRC
    // certification", used for a contractor's own credential or a course, is
    // not matched. A separator is required, so identifiers such as
    // iicrcCertified and iicrc_certified are left alone. A template value
    // ("IICRC ${level} certified") counts as one word, and "recognised as an
    // IICRC ..." is a claim whatever follows (the NRPG certificate PDF said it).
    re: new RegExp(
      '(?<![A-Za-z0-9_])iicrc(?:[\'\\u2019]s)?[ -](?:(?:[a-z0-9&]+|\\$\\{[^}\\n]*\\})[ -]){0,3}?' + CLAIM_WORD + '(?![a-z])' +
        '|' + CLAIM_WORD + ' (?:by|with|through) (?:the )?iicrc(?![a-z])' +
        '|(?:recogni[sz]ed|authori[sz]ed|accredited) as (?:an? |the )?iicrc(?![a-z])',
      'gi'
    ),
  },
];

// The only places a standard reference may live. Nothing else may be excluded.
const OWN_SCRIPT = 'apps/web/scripts/check-iicrc-standard-refs.cjs';
const OWN_TEST = 'apps/web/src/__tests__/hooks/client/iicrc-standard-refs.test.ts';
const EXCLUSIONS = [
  { prefix: 'apps/web/prisma/', reason: 'database enum; changing it needs a migration' },
  { prefix: 'apps/web/src/services/inspection/', reason: 'not served; Next.js uses apps/web/app' },
  { prefix: 'apps/web/src/app/', reason: 'not served' },
  { prefix: 'tests/unit/inspection/', reason: 'tests the unserved inspection service' },
  { prefix: 'tests/integration/inspection/', reason: 'passes database enum values; changes with the enum migration' },
  { prefix: 'scripts/seed-test-data.ts', reason: 'inserts database enum values; changes with the enum migration' },
  { prefix: 'apps/web/scripts/demo-ai-enhancement.ts', reason: 'developer script that passes database enum values' },
  { prefix: 'apps/web/scripts/test-ai-enhancement.ts', reason: 'developer script that passes database enum values' },
  { prefix: '.claude/done/', reason: 'work records' },
  { prefix: 'pnpm-lock.yaml', reason: 'lockfile (matched by file name)' },
  { prefix: 'package-lock.json', reason: 'lockfile (matched by file name)' },
  { prefix: OWN_SCRIPT, reason: 'this check names the forms it bans' },
  { prefix: OWN_TEST, reason: 'the test of this check' },
];

const SKIP_DIRS = new Set([
  'node_modules', '.next', '.git', 'coverage', 'test-results', 'playwright-report', 'dist', 'build',
]);
const TEXT_EXT = new Set([
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'json', 'md', 'mdx', 'html', 'htm', 'txt',
  'css', 'scss', 'yml', 'yaml', 'svg', 'csv', 'xml',
]);

function isExcluded(rel) {
  return EXCLUSIONS.some(({ prefix }) => {
    if (prefix.endsWith('/')) return rel.startsWith(prefix);
    if (prefix.includes('/')) return rel === prefix;
    return rel === prefix || rel.endsWith('/' + prefix);
  });
}

function isScannable(rel) {
  const ext = path.extname(rel).slice(1).toLowerCase();
  return TEXT_EXT.has(ext);
}

function hasSkippedDir(rel) {
  const parts = rel.split('/');
  parts.pop();
  return parts.some((p) => SKIP_DIRS.has(p));
}

function listFiles(root) {
  if (fs.existsSync(path.join(root, '.git'))) {
    const out = execFileSync('git', ['ls-files', '-z'], {
      cwd: root,
      maxBuffer: 1024 * 1024 * 512,
    });
    return out.toString('utf8').split('\0').filter(Boolean);
  }
  const files = [];
  (function walk(dir, relDir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = relDir ? relDir + '/' + entry.name : entry.name;
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name), rel);
      } else if (entry.isFile()) {
        files.push(rel);
      }
    }
  })(root, '');
  return files;
}

function matchLine(text, file, lineNo, findings) {
  for (const { name, re } of BANNED_FORMS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      findings.push({
        file,
        line: lineNo,
        form: name,
        match: m[0],
        text: text.length > 200 ? text.slice(0, 200) : text,
      });
      if (m[0].length === 0) re.lastIndex++;
    }
  }
}

function scan(root) {
  const findings = [];
  let scanned = 0;
  let excluded = 0;
  for (const rel of listFiles(root)) {
    if (hasSkippedDir(rel) || !isScannable(rel)) continue;
    if (isExcluded(rel)) {
      excluded++;
      continue;
    }
    const full = path.join(root, rel);
    let st;
    try {
      st = fs.lstatSync(full);
    } catch {
      continue; // tracked but removed from the working tree
    }
    if (!st.isFile()) continue;
    scanned++;
    matchLine(rel, rel, 0, findings); // the path itself
    const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      matchLine(lines[i], rel, i + 1, findings);
      // JSX and HTML wrap text, and the browser shows "Our IICRC" and
      // "certified technicians" on two source lines as one sentence. Join each
      // line to the next and keep only matches that cross the join (DR-1000).
      if (i + 1 < lines.length) {
        const head = lines[i].trimEnd();
        const joined = head + ' ' + lines[i + 1].trimStart();
        const across = [];
        matchLine(joined, rel, i + 1, across);
        for (const f of across) {
          const at = joined.indexOf(f.match);
          if (at < head.length && at + f.match.length > head.length + 1) findings.push(f);
        }
      }
    }
  }
  return { findings, scanned, excluded };
}

function exitCodeFor(result) {
  if (result.scanned === 0) return 2;
  return result.findings.length > 0 ? 1 : 0;
}

function summaryLine(result) {
  const code = exitCodeFor(result);
  const verdict = code === 0 ? 'PASS' : 'FAIL';
  return `IICRC_STANDARD_REFS findings=${result.findings.length} files_scanned=${result.scanned} excluded=${result.excluded} ${verdict}`;
}

function runSelftest() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'iicrc-refs-'));
  const results = [];
  let n = 0;
  const record = (label, ok, detail) => {
    results.push(ok);
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : ' :: ' + detail}`);
  };
  const build = (files) => {
    const dir = path.join(tmp, 'case' + n++);
    for (const [rel, content] of Object.entries(files)) {
      const full = path.join(dir, rel);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, content);
    }
    return dir;
  };
  const CLEAN_FILE = 'apps/web/app/ok/page.tsx';
  const CLEAN = 'export default function Page() { return null }\n';
  const forms = (r) => r.findings.map((f) => f.form);

  try {
    // Planted strings are built by concatenation.
    const plants = {
      'standard-number': 'See ' + S + '520 for details\n',
      'standard-number-enum': 'kind: ' + S + '500_WATER_DAMAGE\n',
      'standard-slug': 'link to iicrc-' + 's' + '540 guide\n',
      'standard-prefix': 'per ANSI/' + 'IICRC guidance\n',
      'standard-title': 'Standard and Reference Guide for ' + 'Professional Mould Remediation\n',
      'cert-as-standard': 'cleaned under IICRC ' + 'FSRT standard\n',
      'cert-badge': '<IICRC' + 'Badge code="FSRT" size="sm" />\n',
      'iicrc-standards': 'work is done to IICRC ' + 'standards\n',
      'cert-code-pair': 'our IICRC ' + 'WRT technicians\n',
      'cert-claim': 'IICRC-' + 'certified contractors near you\n',
    };
    const prefixPlants = [
      'AS/NZS ' + 'IICRC', 'AS-' + 'IICRC', 'BSR/' + 'IICRC',
    ];
    const target = 'apps/web/app/x/page.tsx';

    for (const [form, plant] of Object.entries(plants)) {
      const bad = scan(build({ [target]: plant, [CLEAN_FILE]: CLEAN }));
      record(`catches ${form}`, forms(bad).includes(form) && exitCodeFor(bad) === 1, `got ${forms(bad)}`);
      const twin = scan(build({ [target]: 'Nothing to see here\n', [CLEAN_FILE]: CLEAN }));
      record(`clean twin passes (${form})`, exitCodeFor(twin) === 0, `findings=${twin.findings.length}`);
    }
    for (const p of prefixPlants) {
      const r = scan(build({ [target]: 'cite ' + p + ' here\n', [CLEAN_FILE]: CLEAN }));
      record(`catches prefix ${p}`, forms(r).includes('standard-prefix'), `got ${forms(r)}`);
    }

    // A certification code beside a standard word is caught in each spelling
    // found on the site; the same code in a plain certification claim is not.
    const asStandard = [
      'covered under standard IICRC ' + 'FSRT protocols',
      'IICRC ' + 'UFT-compliant cleaning',
      'IICRC ' + 'WRT & ASD standards',
      'Standard: IICRC ' + 'UFT (Upholstery)',
      'IICRC ' + 'FSRT-referenced line items',
      "standards: ['IICRC " + "FSRT'],",
      "standards: ['Water damage restoration', 'IICRC " + "CDS'],",
    ];
    for (const text of asStandard) {
      const r = scan(build({ [target]: text + '\n', [CLEAN_FILE]: CLEAN }));
      record(`catches a code written as a standard: ${text}`, forms(r).includes('cert-as-standard'), `got ${forms(r)}`);
    }
    const claim = scan(build({ [target]: 'IICRC ' + 'FSRT Certified contractors\n', [CLEAN_FILE]: CLEAN }));
    record(
      'a certification claim with a code is caught as a pairing and a claim (DR-1000)',
      forms(claim).includes('cert-code-pair') && forms(claim).includes('cert-claim') && !forms(claim).includes('cert-as-standard'),
      `got ${forms(claim)}`
    );

    // DR-1000: every spelling of a code pairing found on the site.
    const pairs = [
      'IICRC ' + 'WRT', 'IICRC-' + 'WRT', 'IICRC/' + 'AMRT', 'IICRC ' + 'FSRT, ASD',
      'Certifications: IICRC ' + 'OCT', "['IICRC " + "WLS']", '>IICRC ' + 'CCT<',
    ];
    for (const text of pairs) {
      const r = scan(build({ [target]: text + '\n', [CLEAN_FILE]: CLEAN }));
      record(`catches a code pairing: ${text}`, forms(r).includes('cert-code-pair'), `got ${forms(r)}`);
    }
    // DR-1000: every spelling of a certification, endorsement or partner claim.
    const claims = [
      'IICRC ' + 'Certified', 'IICRC ' + 'certified technicians', 'IICRC-' + 'Certified Contractor',
      'IICRC ' + 'Certified Partner', 'IICRC ' + 'Certified Professionals', 'IICRC ' + 'Category 3-certified crews',
      'IICRC ' + 'Water Damage Certified', 'IICRC-' + 'verified disaster recovery', "label: 'IICRC " + "Verified'",
      'certified by the ' + 'IICRC', 'accredited through ' + 'IICRC', 'IICRC ' + 'partners',
      'IICRC ' + 'approved firms', '/iicrc-' + 'certified-contractors', 'IICRC' + "'s approved list",
      '`an IICRC ' + '${level} certified contractor`', 'is hereby recognized as an ' + 'IICRC ${level} Restoration Contractor',
      'recognised as the ' + 'IICRC partner network',
    ];
    for (const text of claims) {
      const r = scan(build({ [target]: text + '\n', [CLEAN_FILE]: CLEAN }));
      record(`catches a certification claim: ${text}`, forms(r).includes('cert-claim'), `got ${forms(r)}`);
    }
    // DR-1000: a claim wrapped over two source lines is still a claim, and a
    // line pair that only shares a word with the join is not.
    const split = scan(build({ [target]: '<p>Our IICRC\n            ' + 'certified technicians</p>\n', [CLEAN_FILE]: CLEAN }));
    record('catches a claim split over two lines', forms(split).includes('cert-claim'), `got ${forms(split)}`);
    const splitPair = scan(build({ [target]: 'matched with an IICRC\n  ' + 'WRT technician\n', [CLEAN_FILE]: CLEAN }));
    record('catches a pairing split over two lines', forms(splitPair).includes('cert-code-pair'), `got ${forms(splitPair)}`);
    const splitOnce = scan(build({ [target]: 'IICRC-' + 'certified\nnext line\n', [CLEAN_FILE]: CLEAN }));
    record('a claim on one line is reported once', splitOnce.findings.length === 1, `findings=${splitOnce.findings.length}`);
    const splitClean = scan(build({ [target]: 'IICRC courses.\nCertified rates apply\n', [CLEAN_FILE]: CLEAN }));
    record('two unrelated lines are not joined into a claim', exitCodeFor(splitClean) === 0, `got ${forms(splitClean)}`);

    // DR-1000 keeps the name for a course or a contractor's own credential.
    const kept = [
      'holds their own IICRC certification',
      'Upload your IICRC certification document',
      'IICRC Water Restoration Technician course',
      'IICRC certifications must be renewed',
      'Water Restoration Technician (WRT)',
      'const ok = iicrc.wrt || iicrc?.fsrt',
      'iicrcCertified: true, iicrc_certified: false',
      'see https://www.iicrc.org/education',
      'IICRC courses, then get the rest certified',
    ];
    for (const text of kept) {
      const r = scan(build({ [target]: text + '\n', [CLEAN_FILE]: CLEAN }));
      record(`does not catch (course or own credential): ${text}`, exitCodeFor(r) === 0, `got ${forms(r)}`);
    }
    const group = scan(build({ [target]: '<IICRC' + 'BadgeGroup codes={[]} />\n', [CLEAN_FILE]: CLEAN }));
    record('catches the badge group', forms(group).includes('cert-badge'), `got ${forms(group)}`);
    const owned = [
      'IICRC ' + 'Quality Standards',
      'IICRC-' + 'standard drying',
      'IICRC and Australian ' + 'standards',
      'Official IICRC mould remediation ' + 'standard',
      "the IICRC's " + 'standards',
    ];
    for (const text of owned) {
      const r = scan(build({ [target]: text + '\n', [CLEAN_FILE]: CLEAN }));
      record(`catches the name beside a standard: ${text}`, forms(r).includes('iicrc-standards'), `got ${forms(r)}`);
    }
    const notOwned = [
      'IICRC training. Standard rates apply',
      'see src/services/inspection/iicrc-' + 'standards.service.ts',
      'industry standards for water damage',
    ];
    for (const text of notOwned) {
      const r = scan(build({ [target]: text + '\n', [CLEAN_FILE]: CLEAN }));
      record(`does not catch: ${text}`, exitCodeFor(r) === 0, `got ${forms(r)}`);
    }
    const icon = scan(build({ [target]: '<IICRC' + 'Badge size="lg" gradient="primary" />\n', [CLEAN_FILE]: CLEAN }));
    record('the plain shield icon is not caught', exitCodeFor(icon) === 0, `got ${forms(icon)}`);

    // Every named exclusion is honoured, and the exclusion list is printed.
    for (const { prefix, reason } of EXCLUSIONS) {
      let rel;
      if (prefix.endsWith('/')) rel = prefix + 'x.ts';
      else rel = prefix.endsWith('.yaml') ? prefix : prefix; // file exclusions are exact files
      if (!isScannable(rel)) rel = rel + '.ts';
      const r = scan(build({ [rel]: plants['standard-number'], [CLEAN_FILE]: CLEAN }));
      record(
        `excluded ${prefix} (${reason})`,
        r.findings.length === 0 && r.excluded >= 1,
        `findings=${r.findings.length} excluded=${r.excluded}`
      );
    }

    // The walk reaches every place the site can be fed from.
    const reach = [
      'apps/web/public/training-sources/a.html',
      'apps/web/data/services.json',
      'apps/web/lib/x.ts',
      'training-sources/a.html',
      '.claude/rules/x.md',
      'docs/x.md',
      'NRPG-Onboarding-Framework/x.md',
    ];
    for (const rel of reach) {
      const r = scan(build({ [rel]: plants['standard-number'], [CLEAN_FILE]: CLEAN }));
      record(`walk reaches ${rel}`, r.findings.length > 0 && exitCodeFor(r) === 1, `findings=${r.findings.length}`);
    }

    // A plant under a skipped directory is not reported.
    const skipped = scan(build({ 'node_modules/p/x.ts': plants['standard-number'], [CLEAN_FILE]: CLEAN }));
    record('node_modules is skipped', skipped.findings.length === 0, `findings=${skipped.findings.length}`);

    // A path named after a standard is a finding.
    const pathPlant = scan(build({ ['docs/iicrc-' + 's' + '500-guide.md']: 'plain text\n', [CLEAN_FILE]: CLEAN }));
    record(
      'file path with a standard slug is caught',
      pathPlant.findings.some((f) => f.line === 0 && f.form === 'standard-slug'),
      `got ${forms(pathPlant)}`
    );

    // An empty scan is an error, not a pass.
    const empty = scan(build({ 'apps/web/app/x/image.png': 'x', 'notes/readme': 'x' }));
    record('no scannable files exits 2', exitCodeFor(empty) === 2, `exit=${exitCodeFor(empty)}`);

    // Ordinary words are left alone.
    const ordinary = ['S3', 'PS5000', 'iOS500', 'CSS500', 'S50', 'US5000'].join(' ') + '\n';
    const ord = scan(build({ [target]: ordinary, [CLEAN_FILE]: CLEAN }));
    record('ordinary words are not caught', ord.findings.length === 0, `got ${JSON.stringify(ord.findings.map((f) => f.match))}`);

    // The plural of a title is still a title.
    const plural = scan(build({ [target]: 'Recognised Industry Standards for ' + 'Professional Mould Remediation\n', [CLEAN_FILE]: CLEAN }));
    record('a title in the plural is caught', forms(plural).includes('standard-title'), `got ${forms(plural)}`);

    // A plain phrase about industry standards is not a title.
    const plain = scan(build({ [target]: 'the recognised industry standard for water damage restoration\n', [CLEAN_FILE]: CLEAN }));
    record('"industry standard for <topic>" is not caught', plain.findings.length === 0, `got ${forms(plain)}`);

    // Accepted over-match: a generic phrase that fits the title pattern.
    const title = scan(build({ [target]: 'standard for professional conduct\n', [CLEAN_FILE]: CLEAN }));
    record('generic "standard for professional ..." is caught (accepted)', forms(title).includes('standard-title'), `got ${forms(title)}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }

  console.log('Named exclusions:');
  for (const { prefix, reason } of EXCLUSIONS) console.log(`  ${prefix}  (${reason})`);
  const failed = results.filter((ok) => !ok).length;
  console.log(`IICRC_STANDARD_REFS selftest cases=${results.length} failed=${failed} ${failed === 0 ? 'PASS' : 'FAIL'}`);
  return failed === 0 ? 0 : 1;
}

function main(argv) {
  let root = path.resolve(__dirname, '..', '..', '..');
  let selftest = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--selftest') selftest = true;
    else if (argv[i] === '--root') {
      if (!argv[i + 1]) throw new Error('--root needs a directory');
      root = path.resolve(argv[++i]);
    } else throw new Error(`unknown argument: ${argv[i]}`);
  }
  if (selftest) return runSelftest();
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Error(`root is not a directory: ${root}`);
  const result = scan(root);
  for (const f of result.findings) {
    console.log(`${f.file}:${f.line} [${f.form}] "${f.match}" :: ${f.text.trim()}`);
  }
  if (result.scanned === 0) console.error('No scannable files found: an empty scan is not a pass.');
  console.log(summaryLine(result));
  return exitCodeFor(result);
}

if (require.main === module) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (err) {
    console.error(`IICRC_STANDARD_REFS error: ${err && err.message ? err.message : err}`);
    process.exitCode = 2;
  }
}

module.exports = { scan, exitCodeFor, EXCLUSIONS, BANNED_FORMS };
