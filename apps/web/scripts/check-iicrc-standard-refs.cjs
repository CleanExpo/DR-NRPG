#!/usr/bin/env node
/**
 * Fails when an IICRC standard number or standard title appears anywhere the
 * site can show it (DR-993), or when NRPG's own wording uses the IICRC name as
 * a certification claim or beside a certification code (DR-1000), or shows the
 * IICRC name or an IICRC course code at all (founder rule, 16/11/2026).
 *
 * Why: naming an IICRC standard by number or title on nrpg.business is not
 * allowed, and neither is presenting NRPG, its courses or its network's work
 * with the IICRC name or IICRC course codes, as if NRPG had that authority.
 * Nothing in the build used to fail on that wording, so it returned whenever
 * an author followed an old instruction. The name and codes stay only where a
 * contractor enters their own credential (CREDENTIAL_ENTRY), in stored keys
 * that are never shown (INTERNAL_KEYS), and in places nothing is shown from
 * (NOT_DISPLAYED).
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
// Course codes for the course-code rule (founder rule, 16/11/2026).
const CODE_VALUE = '(?:WRT|FSRT|ASD|AMRT|CCT|UFT|RRT|BSRT|TCST|HST|CDS|CMT|FCT|RFMT|SMT|LCT|CCMT|JMT|WLS|FST|CFT)';
const CODE_SEP = '(?:\\s*[,/&|\\u00b7\\u2022]\\s*|\\s+(?:and|or)\\s+|\\s+)';
const COURSE_WORD =
  '(?:[Cc]ertifi(?:ed|cations?)|[Cc]ertificates?|[Cc]ourses?|[Tt]raining|[Tt]echnicians?|[Cc]redentials?|' +
  '[Cc]erts?|CECs?|[Cc]lass(?:es)?|[Hh]olders?|[Qq]ualified|[Qq]ualifications?|[Pp]rograms?|[Mm]odules?|[Ee]xams?)';
const AS_STANDARD_WORD ='(?:standards?|referenced|protocols?|guidelines?|methodology|compliant|compliance)';
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
  {
    name: 'iicrc-name',
    // Founder rule, 16/11/2026: NRPG may not display IICRC certifications or IICRC
    // acronyms for its courses, or for the work its network provides, as if it
    // has that authority. The name in capitals, as a word. Identifiers
    // (IICRCBadge, iicrcLevel), lower-case slugs and links to iicrc.org are not
    // matched. Only the files in CREDENTIAL_ENTRY may show it.
    // The full name of the body counts as the name.
    re: new RegExp(
      '(?<![A-Za-z0-9_.])IICRC(?![A-Za-z0-9_]|\\.org)' +
        '|[Ii]nstitute of [Ii]nspection,? [Cc]leaning,? (?:and|&) [Rr]estoration [Cc]ertification',
      'g'
    ),
  },
  {
    name: 'credential-title',
    // Same founder rule: an IICRC credential written out as a title, which
    // names the certification without the acronym ("Applied Microbial
    // Remediation Technician", "Water Loss Specialist"). Title case only, so
    // plain trade wording ("structural drying", "water damage restoration
    // training") is left alone.
    re: new RegExp(
      '(?<![A-Za-z])(?:' +
        'Water (?:Damage )?Restoration Technician|Applied Structural Drying|Applied Microbial Remediation|' +
        'Fire (?:and|&) Smoke Restoration Technician|Odou?r Control Technician|Carpet Cleaning Technician|' +
        'Upholstery (?:and|&) Fabric Cleaning Technician|Rug Cleaning Technician|Water Loss Specialist|' +
        'Health (?:and|&) Safety Technician|Commercial Drying Specialist|Trauma (?:and|&) Crime Scene Technician|' +
        'Master (?:Water|Fire (?:and|&) Smoke|Textile|Mou?ld) (?:Restorer|Cleaner|Remediator)|' +
        'Certified Restor(?:er|ation Drycleaner)' +
        ')(?![a-z])',
      'g'
    ),
  },
  {
    name: 'course-code',
    // Same founder rule: an IICRC course code shown as a course, a credential or
    // a mark of the work. "(WRT)", "WRT, ASD", "WRT ASD", "FSRT-certified",
    // "WRT course", "certification: WRT", "WRT - Water Damage Restoration", a
    // value 'FSRT' (a chip, tag or label) and <div>FSRT</div>. Capitals only.
    // OCT is left out of the quoted-value form, where it is usually October.
    re: new RegExp(
      '(?<![A-Za-z0-9_])\\(\\s*' + CODE + '(?:' + CODE_SEP + CODE + ')*\\s*\\)' +
        '|(?<![A-Za-z0-9_])' + CODE + CODE_SEP + CODE + '(?![A-Za-z0-9])' +
        '|(?<![A-Za-z0-9_])' + CODE + '[ -]' + COURSE_WORD + '(?![a-z])' +
        '|' + COURSE_WORD + '\\s*[:(\\u2014-]\\s*' + CODE + '(?![A-Za-z0-9])' +
        '|(?<![A-Za-z0-9_])' + CODE + ' [-\\u2013\\u2014] [A-Z]' +
        '|[\'"`]' + CODE_VALUE + '[\'"`]' +
        '|>\\s*' + CODE + '\\s*<' +
        '|(?<![A-Za-z0-9_])' + CODE + '\\s*\\(\\s*[A-Z][a-z]',
      'g'
    ),
  },
];

// The only files that may show the IICRC name or a course code (iicrc-name,
// course-code): where a contractor enters or reviews their OWN credential. NRPG
// records what the contractor holds; it does not present it as its own.
const NAME_RULES = new Set(['iicrc-name', 'course-code', 'credential-title']);
const CREDENTIAL_ENTRY = [
  {
    file: 'apps/web/app/dashboard/contractor/onboarding/nrpg-registration/page.tsx',
    reason: 'signed-in contractor enters their own certificate code, dates and file',
  },
  {
    file: 'apps/web/components/contractor/DocumentUpload.tsx',
    reason: 'signed-in contractor names the type of their own uploaded certificate',
  },
  {
    file: 'apps/web/app/dashboard/admin/contractor-verification/page.tsx',
    reason: 'admin-only review of a contractor\'s own certificate',
  },
  {
    file: 'apps/web/components/admin/contractor-verification-dashboard.tsx',
    reason: 'admin-only review of a contractor\'s own certificate',
  },
  {
    file: 'apps/web/lib/legal/ica.ts',
    reason: 'signed contractor agreement: the contractor\'s own certification obligation. A wording change needs a version bump and counsel (DR-891); tracked in DR-1003',
  },
];
// Places the two name rules do not cover because nothing in them is shown to a
// visitor, a contractor or a content author. Everything else is covered, so a
// new folder is checked without anyone adding it. The other rules still apply here.
const NOT_DISPLAYED = [
  { prefix: 'docs/', reason: 'internal documentation, not served' },
  { prefix: 'specs/', reason: 'build specifications, not served' },
  { prefix: '.planning/', reason: 'planning records, not served' },
  { prefix: '.claude/memory/', reason: 'agent memory records, not served' },
  { prefix: 'tests/', reason: 'tests' },
  { prefix: 'apps/web/src/__tests__/', reason: 'tests' },
  { prefix: 'apps/web/e2e/', reason: 'tests' },
  { root: '.md', reason: 'repository-root planning and status records, not served' },
  { root: '.md', under: '.claude/', reason: 'stage records in .claude/, not served' },
];
// A course code kept as a stored key that is never shown: one exact match in one
// file, so any other wording in that file is still checked. Renaming the key
// needs a data migration.
// Each entry: the file, the exact match the check prints and, where the match
// alone is too broad, text the line must also contain (context).
const INTERNAL_KEYS = [
  { file: 'apps/web/lib/nrpg/course-loader.ts', match: "'WRT'", reason: 'onboarding course id, module id prefix and their types' },
  { file: 'apps/web/lib/training/nrp-training.ts', match: "'WRT'", reason: 'course type for module ids such as WRT-M01' },
  { file: 'apps/web/lib/training/content-generator.ts', match: "'WRT'", reason: 'course type parameter' },
  { file: 'apps/web/app/api/onboarding/courses/route.ts', match: "'WRT'", reason: 'course id cast' },
  { file: 'apps/web/app/api/onboarding/courses/[courseId]/route.ts', match: "'WRT'", reason: 'course id allow-list' },
  { file: 'apps/web/app/dashboard/contractor/onboarding/training/page.tsx', match: "'WRT'", reason: 'course id type' },
  { file: 'apps/web/app/dashboard/contractor/onboarding/training/[courseId]/page.tsx', match: "'WRT'", reason: 'course id type from the URL' },
  { file: 'apps/web/src/components/onboarding/CourseCard.tsx', match: "'WRT'", reason: 'course id prop type; used for the link, icon and colour, never printed' },
  { file: 'apps/web/scripts/convert-cse-wrt-modules.ts', match: "'WRT'", reason: 'course config key and --course argument' },
  { file: 'apps/web/scripts/process-cse-wrt-assessments.ts', match: "'WRT'", reason: 'course config key and --course argument' },
  { file: 'apps/web/scripts/generate-training-index.ts', match: "'WRT'", reason: 'course type and generator argument' },
  { file: 'apps/web/lib/claim-wizard/cert-requirements.ts', match: "'WRT'", reason: 'claim-matching code compared with stored contractor values, never rendered' },
  { file: 'apps/web/lib/claim-wizard/cert-requirements.ts', match: "'ASD'", reason: 'claim-matching code compared with stored contractor values, never rendered' },
  { file: 'apps/web/lib/claim-wizard/cert-requirements.ts', match: "'AMRT'", reason: 'claim-matching code compared with stored contractor values, never rendered' },
  { file: 'apps/web/lib/claim-wizard/cert-requirements.ts', match: "'FSRT'", reason: 'claim-matching code compared with stored contractor values, never rendered' },
  { file: 'apps/web/lib/claim-wizard/cert-requirements.ts', match: "'CCT'", reason: 'claim-matching code compared with stored contractor values, never rendered' },
  { file: 'apps/web/lib/claim-wizard/cert-requirements.ts', match: "'UFT'", reason: 'claim-matching code compared with stored contractor values, never rendered' },
  { file: 'apps/web/lib/api/validation-schemas.ts', match: 'IICRC', context: "z.enum(['IICRC'", sample: "type: z.enum(['IICRC', 'OTHER'])", reason: 'accepted API value for a certification type, never rendered' },
];
function isNotDisplayed(rel) {
  return NOT_DISPLAYED.some(({ prefix, root, under }) => {
    if (prefix) return rel.startsWith(prefix);
    const base = under ? rel.slice(under.length) : rel;
    return (!under || rel.startsWith(under)) && !base.includes('/') && base.endsWith(root);
  });
}

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
        at: m.index,
        text: text.length > 200 ? text.slice(m.index, m.index + 200) : text,
      });
      if (m[0].length === 0) re.lastIndex++;
    }
  }
}

// The text as a reader sees it (DR-1000, extended to every rule in DR-1002). The
// browser shows "IICRC<br />Certified", "<div>IICRC</div><p>Certified contractors</p>",
// "IICRC<!-- --> Certified" and a phrase wrapped over several source lines as one
// phrase, so markup tags, comments, JSX spaces, escaped line breaks and space
// entities become one space and every run of whitespace collapses to one. Character
// entities (&amp;, &#83;, &#x53;, &rsquo;) are read as the character they show.
// map[i] is the source offset of reading-view char i.
// Two views are read. In the spaced view a tag is a space, so "IICRC</span> <h3>Water
// damage standard" reads as a phrase. In the joined view an inline tag or comment is nothing,
// because an inline tag inside a word shows no gap: "S<span>500</span>" and React's
// "S<!-- -->500" both show the standard number whole.
const MARKUP = /<!--[\s\S]*?-->|<\/?[A-Za-z][^<>]*>|\{\s*(['"`]) \1\s*\}|\\[nrt]|&(?:#[0-9]{1,7}|#[xX][0-9A-Fa-f]{1,6}|[A-Za-z][A-Za-z0-9]{1,31});/y;
const NAMED_ENTITIES = {
  nbsp: ' ', ensp: ' ', emsp: ' ', thinsp: ' ', hairsp: ' ', NewLine: ' ', Tab: ' ',
  amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', rsquo: '\u2019', lsquo: '\u2018',
  rdquo: '\u201d', ldquo: '\u201c', ndash: '\u2013', mdash: '\u2014', middot: '\u00b7',
  bull: '\u2022', sol: '/', colon: ':', comma: ',', period: '.', hyphen: '-', dash: '-',
  lpar: '(', rpar: ')', shy: '',
};
const SPACE_CHARS = /[ \n\r\t\f\v\u00a0\u2000-\u200a\u202f\u205f\u3000]/;
function decodeEntity(e) {
  if (e[1] === '#') {
    const code = e[2] === 'x' || e[2] === 'X' ? parseInt(e.slice(3, -1), 16) : parseInt(e.slice(2, -1), 10);
    if (!(code >= 0 && code <= 0x10ffff)) return null;
    return String.fromCodePoint(code);
  }
  const name = e.slice(1, -1);
  return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, name) ? NAMED_ENTITIES[name] : null;
}
// Tags that sit inside a line of text without a gap. A block tag (<p>, <td>, <li>,
// <br>) or a component is a space in both views, so "<td>S</td><td>500</td>" stays
// two cells.
const INLINE_TAG = /^<\/?(?:span|strong|b|i|em|a|small|sup|sub|mark|u|abbr|code|s|ins|del|bdi|bdo|data|time|var|q|cite|dfn|kbd|samp|wbr)(?=[\s/>])/i;
function isInlineTag(tok) {
  return tok.startsWith('<!--') || INLINE_TAG.test(tok);
}
function readingView(src, joinTags) {
  const out = [];
  const map = [];
  let space = false;
  const pushSpace = (at) => {
    if (!space) {
      out.push(' ');
      map.push(at);
      space = true;
    }
  };
  const pushChar = (ch, at) => {
    if (SPACE_CHARS.test(ch)) return pushSpace(at);
    out.push(ch);
    map.push(at);
    space = false;
  };
  for (let i = 0; i < src.length; ) {
    const c = src[i];
    if (c === '<' || c === '{' || c === '&' || c === '\\') {
      MARKUP.lastIndex = i;
      const m = MARKUP.exec(src);
      if (m) {
        const tok = m[0];
        if (tok[0] === '&') {
          const ch = decodeEntity(tok);
          if (ch !== null) {
            for (const x of ch) pushChar(x, i);
            i += tok.length;
            continue;
          }
        } else {
          // A tag or comment is a space in the spaced view and nothing in the
          // joined view; a JSX space and an escaped line break are always a space.
          if (!(joinTags && tok[0] === '<' && isInlineTag(tok))) pushSpace(i);
          i += tok.length;
          continue;
        }
      }
    }
    pushChar(c, i);
    i++;
  }
  return { text: out.join(''), map };
}

function scan(root) {
  const findings = [];
  let scanned = 0;
  let excluded = 0;
  for (const rel of listFiles(root)) {
    if (hasSkippedDir(rel)) continue;
    if (!isScannable(rel)) {
      // An image or other binary is served under its name, so the name is
      // checked even though the contents are not (DR-1000: a served
      // iicrc-certified.jpg was only seen by the scan of the built pages).
      if (!isExcluded(rel)) matchLine(rel, rel, 0, findings);
      continue;
    }
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
    const src = fs.readFileSync(full, 'utf8');
    const lines = src.split(/\r?\n/);
    const own = [];
    for (let i = 0; i < lines.length; i++) matchLine(lines[i], rel, i + 1, own);
    // Then the reading view, which sees what markup and line breaks split. A
    // match the line scan already reported (same form, line and text) is not
    // reported twice.
    const seen = new Set(own.map((f) => `${f.form}\u0000${f.line}\u0000${f.match}`));
    for (const joinTags of [false, true]) {
      const view = readingView(src, joinTags);
      const flat = [];
      matchLine(view.text, rel, 0, flat);
      for (const f of flat) {
        const start = view.map[f.at];
        const end = view.map[f.at + f.match.length - 1] + 1;
        const line = src.slice(0, start).split('\n').length;
        if (seen.has(`${f.form}\u0000${line}\u0000${f.match}`)) continue;
        seen.add(`${f.form}\u0000${line}\u0000${f.match}`);
        const shown = src.slice(start, end).replace(/\s+/g, ' ');
        own.push({ file: rel, line, form: f.form, match: f.match, text: shown.length > 200 ? shown.slice(0, 200) : shown });
      }
    }
    const entry = CREDENTIAL_ENTRY.some(({ file }) => file === rel) || isNotDisplayed(rel);
    findings.push(
      ...own.filter(
        (f) =>
          !NAME_RULES.has(f.form) ||
          (!entry &&
            !INTERNAL_KEYS.some(
              (k) => k.file === rel && k.match === f.match && (!k.context || f.text.includes(k.context))
            ))
      )
    );
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
      'iicrc-name': 'Start your IICRC' + ' course pathway\n',
      'course-code': 'Water Damage Restoration Technician (' + 'WRT)\n',
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
    // DR-1000: a claim wrapped over source lines is still a claim, and two
    // lines that only share a word across the break are not.
    const split = scan(build({ [target]: '<p>Our IICRC\n            ' + 'certified technicians</p>\n', [CLEAN_FILE]: CLEAN }));
    record('catches a claim split over two lines', forms(split).includes('cert-claim'), `got ${forms(split)}`);
    const splitPair = scan(build({ [target]: 'matched with an IICRC\n  ' + 'WRT technician\n', [CLEAN_FILE]: CLEAN }));
    record('catches a pairing split over two lines', forms(splitPair).includes('cert-code-pair'), `got ${forms(splitPair)}`);
    const splitOnce = scan(build({ [target]: 'IICRC-' + 'certified\nnext line\n', [CLEAN_FILE]: CLEAN }));
    const claimsOnce = (r) => r.findings.filter((f) => f.form === 'cert-claim').length;
    record('a claim on one line is reported once', claimsOnce(splitOnce) === 1, `claims=${claimsOnce(splitOnce)}`);
    const splitClean = scan(build({ [target]: 'IICRC courses.\nCertified rates apply\n', [CLEAN_FILE]: CLEAN }));
    record('two unrelated lines are not joined into a claim', !forms(splitClean).includes('cert-claim'), `got ${forms(splitClean)}`);
    // DR-1000: a claim split by markup reads as one phrase in the browser, so it
    // is caught in the reading view: the footer badge, the stat tile, React's
    // text separators in built HTML, an escaped line break in JSON, and a claim
    // wrapped over three source lines.
    const markupClaims = [
      ['a line break tag', '<p className="text-xs">IICRC<' + 'br />Certified</p>\n', 'cert-claim'],
      ['two elements', '<div className="stat">IICRC</div>\n  <p>' + 'Certified contractors on every job</p>\n', 'cert-claim'],
      ['React text separators', '<p>IICRC<!-- --> <!-- -->' + 'Certified</p>\n', 'cert-claim'],
      ['an escaped line break', '{"html": "<p>Our IICRC\\n' + 'certified team</p>"}\n', 'cert-claim'],
      ['three source lines', '<p>\n  Our IICRC\n\n  ' + 'certified\n  team</p>\n', 'cert-claim'],
      ['a JSX space', '<b>IICRC</b>{" "}' + 'Certified\n', 'cert-claim'],
      ['two spans', '<span>IICRC</span> <span>' + 'WRT</span>\n', 'cert-code-pair'],
    ];
    for (const [label, text, form] of markupClaims) {
      const r = scan(build({ [target]: text, [CLEAN_FILE]: CLEAN }));
      record(`catches a claim split by ${label}`, forms(r).includes(form) && exitCodeFor(r) === 1, `got ${forms(r)}`);
    }
    const markupOnce = scan(build({ [target]: '<p>IICRC ' + 'Certified</p>\n', [CLEAN_FILE]: CLEAN }));
    record('a claim inside one element is reported once', claimsOnce(markupOnce) === 1, `claims=${claimsOnce(markupOnce)}`);
    const markupKept = scan(build({
      [target]: '<li>Hold your own IICRC certification</li>\n<td>IICRC</td><td>Water Restoration Technician course</td>\n',
      [CLEAN_FILE]: CLEAN,
    }));
    record(
      'a course or own credential is caught by the name rule (founder rule, 16/11/2026), not as a claim',
      forms(markupKept).includes('iicrc-name') && !forms(markupKept).includes('cert-claim'),
      `got ${forms(markupKept)}`
    );
    // DR-1002: every rule reads the page as a visitor sees it, so a standard
    // reference split by markup, a line break or an entity is caught as the form it
    // is: the news and data cards ("IICRC" label over a standard title), a number
    // wrapped in spans or <strong>, React's text separators, an escaped line break
    // in JSON, and HTML entities. Each case names the form it must be caught as.
    const splitStandards = [
      ['a source label over a standard title', '<span>IICRC</span><h3>Water damage ' + 'standard</h3>\n', 'iicrc-standards'],
      ['spans', '<span>IICRC</span> <span>S</span><span>' + '500</span>\n', 'standard-slug'],
      ['spans around the number', '<p>Drying to <span>S</span><span>' + '500</span></p>\n', 'standard-number'],
      ['<strong>', '<p><strong>IICRC</strong> mould remediation <strong>' + 'standard</strong></p>\n', 'iicrc-standards'],
      ['<strong> inside the number', 'per IICRC <strong>S</strong>' + '520 guidance\n', 'standard-number'],
      ['a line break', 'IICRC<br />\n' + 'S500 water damage\n', 'standard-slug'],
      ['a line break between two elements', '<p>Work to the IICRC</p>\n<p>water damage ' + 'standard</p>\n', 'iicrc-standards'],
      ['React text separators', '<p>S<!-- -->' + '500</p>\n', 'standard-number'],
      ['an escaped line break', '{"html": "Intro.\\n' + 'S500 notes"}\n', 'standard-number'],
      ['&nbsp; and a numeric entity', 'IICRC&nbsp;S&#' + '53;00\n', 'standard-slug'],
      ['a decimal entity for the letter', '<td>&#83;' + '520</td>\n', 'standard-number'],
      ['a hex entity for the letter', '<td>&#x53;' + '770</td>\n', 'standard-number'],
      ['an entity in a title', 'Standard&nbsp;and Reference Guide for&#32;' + 'Professional Water Damage Restoration\n', 'standard-title'],
      ['an entity in a prefix', 'ANSI&#47;' + 'IICRC\n', 'standard-prefix'],
      ['&amp; in a credential title', 'Fire &amp; Smoke Restoration ' + 'Technician\n', 'credential-title'],
      ['&rsquo; beside the name', 'the IICRC&rsquo;s drying ' + 'standards\n', 'iicrc-standards'],
    ];
    for (const [label, text, form] of splitStandards) {
      const r = scan(build({ [target]: text, [CLEAN_FILE]: CLEAN }));
      record(`catches a standard split by ${label} as ${form} (DR-1002)`, forms(r).includes(form) && exitCodeFor(r) === 1, `got ${forms(r)}`);
    }
    // Block elements stay apart, and ordinary entities stay ordinary.
    const splitApart = [
      '<table><tr><td>S</td><td>500 m\u00b2</td></tr></table>',
      '<li>Class</li><li>S</li><li>520 litres</li>',
      '<p>AT&amp;T and Smith &amp; Sons</p><p>Water damage repairs to Australian standards</p>',
      '<span>Bay</span> <span>S</span> <span>500</span>',
    ];
    for (const text of splitApart) {
      const r = scan(build({ [target]: text + '\n', [CLEAN_FILE]: CLEAN }));
      record(`does not join separate text: ${text}`, exitCodeFor(r) === 0, `got ${forms(r)}`);
    }
    const splitOnceStd = scan(build({ [target]: '<p>See ' + 'S500 here</p>\n', [CLEAN_FILE]: CLEAN }));
    const numbersOnce = splitOnceStd.findings.filter((f) => f.form === 'standard-number').length;
    record('a standard number inside one element is reported once', numbersOnce === 1, `numbers=${numbersOnce}`);

    // Founder rule, 16/11/2026: the name and the course codes are not shown for
    // NRPG's courses or work, so what DR-1000 first kept is now caught.
    const named = [
      'holds their own IICRC certification',
      'IICRC Water Restoration Technician course',
      'IICRC certifications must be renewed',
      'IICRC courses, then get the rest certified',
      "the IICRC's renewal rules",
      'earn 14 IICRC CECs',
      '{"html": "<p>Intro.\\nIICRC pathways</p>"}',
      'IICRC Australia member',
    ];
    for (const text of named) {
      const r = scan(build({ [target]: text + '\n', [CLEAN_FILE]: CLEAN }));
      record(`catches the name: ${text}`, forms(r).includes('iicrc-name') && exitCodeFor(r) === 1, `got ${forms(r)}`);
    }
    const codes = [
      'Water Restoration Technician (' + 'WRT)', '(' + 'ASD)', '(' + 'WRT/ASD)', 'WRT, ' + 'AMRT, FSRT', 'WRT and ' + 'ASD',
      '<li>WRT</li><li>' + 'ASD</li>', 'FSRT-' + 'certified technicians', 'WRT ' + 'course', 'AMRT ' + 'certification',
      'Certification: ' + 'WRT', "'WRT - " + "Water Damage Restoration'", "tags: ['" + "FSRT']", 'label: "' + 'CCT"',
      '<div className="x">' + 'FSRT</div>', 'WRT ' + 'Module 3', '14 CECs (' + 'WLS)', 'WRT (' + 'Water Damage)',
    ];
    for (const text of codes) {
      const r = scan(build({ [target]: text + '\n', [CLEAN_FILE]: CLEAN }));
      record(`catches a course code: ${text}`, forms(r).includes('course-code') && exitCodeFor(r) === 1, `got ${forms(r)}`);
    }
    // The full name of the body counts as the name; an IICRC credential written
    // out as a title counts as the credential.
    const fullName = scan(build({ [target]: 'issued by the Institute of Inspection, ' + 'Cleaning and Restoration Certification\n', [CLEAN_FILE]: CLEAN }));
    record('catches the full name of the body', forms(fullName).includes('iicrc-name'), `got ${forms(fullName)}`);
    const titles = [
      'Applied Microbial ' + 'Remediation Technician', 'Water Damage Restoration ' + 'Technician', 'Applied Structural ' + 'Drying',
      'Odour Control ' + 'Technician', 'Water Loss ' + 'Specialist', 'Fire & Smoke Restoration ' + 'Technician',
      'Health and Safety ' + 'Technician', 'Master Water ' + 'Restorer', 'Certified ' + 'Restorer', '<h3>Applied Structural</h3><p>' + 'Drying course</p>',
    ];
    for (const text of titles) {
      const r = scan(build({ [target]: text + '\n', [CLEAN_FILE]: CLEAN }));
      record(`catches a credential title: ${text}`, forms(r).includes('credential-title') && exitCodeFor(r) === 1, `got ${forms(r)}`);
    }
    const plainTrade = [
      'water damage restoration training', 'structural drying for timber floors', 'odour control after a fire',
      'Our water damage restoration technicians arrive within the hour',
    ];
    for (const text of plainTrade) {
      const r = scan(build({ [target]: text + '\n', [CLEAN_FILE]: CLEAN }));
      record(`does not catch plain trade wording: ${text}`, exitCodeFor(r) === 0, `got ${forms(r)}`);
    }
    // Identifiers, slugs, links and ordinary words are not the name or a code.
    const notNamed = [
      'const ok = iicrc.wrt || iicrc?.fsrt',
      'iicrcCertified: true, iicrc_certified: false',
      'see https://www.iicrc.org/education or IICRC.org',
      'import { IICRCBadge } from "./icons"; const k = IICRC_CERTIFICATE',
      'href="/events/iicrc-wrt-sydney"',
      "months: ['SEP', 'OCT', 'NOV']",
      'the WRTX field and ASDF keys',
      'Water damage restoration training',
    ];
    for (const text of notNamed) {
      const r = scan(build({ [target]: text + '\n', [CLEAN_FILE]: CLEAN }));
      record(`does not catch: ${text}`, exitCodeFor(r) === 0, `got ${forms(r)}`);
    }
    // A contractor's own credential entry keeps the name; the claim rules still apply there.
    for (const { file } of CREDENTIAL_ENTRY) {
      const own = scan(build({ [file]: '<Label>IICRC certification code (' + 'WRT)</Label>\n', [CLEAN_FILE]: CLEAN }));
      record(`credential entry may show the name: ${file}`, exitCodeFor(own) === 0, `got ${forms(own)}`);
      const claimThere = scan(build({ [file]: 'IICRC-' + 'certified network\n', [CLEAN_FILE]: CLEAN }));
      record(`a claim in credential entry is still caught: ${file}`, forms(claimThere).includes('cert-claim'), `got ${forms(claimThere)}`);
    }
    // Places nothing is shown from are not covered by the name rules, but the other rules still apply.
    for (const rel of ['docs/x.md', 'specs/x.md', '.planning/x.md', '.claude/memory/x.md', 'tests/x.ts',
      'apps/web/src/__tests__/x.test.ts', 'apps/web/e2e/x.spec.ts', 'PLAN.md', '.claude/STAGE-1.md']) {
      const r = scan(build({ [rel]: 'IICRC ' + 'course (WRT)\n', [CLEAN_FILE]: CLEAN }));
      record(`not displayed, name allowed: ${rel}`, exitCodeFor(r) === 0, `got ${forms(r)}`);
      const std = scan(build({ [rel]: plants['standard-number'], [CLEAN_FILE]: CLEAN }));
      record(`not displayed, standard still caught: ${rel}`, exitCodeFor(std) === 1, `got ${forms(std)}`);
    }
    for (const rel of ['apps/web/AI-SPEC.md', '.claude/rules/x.md', 'NRPG-Onboarding-Framework/x/course-info.json',
      'apps/web/docs/x.md', 'training-sources/a.html']) {
      const r = scan(build({ [rel]: 'IICRC ' + 'course\n', [CLEAN_FILE]: CLEAN }));
      record(`displayed or authored, name caught: ${rel}`, forms(r).includes('iicrc-name'), `got ${forms(r)}`);
    }
    // A stored key is allowed only as that exact match in that file.
    for (const { file, match, sample } of INTERNAL_KEYS) {
      const key = scan(build({ [file]: (sample || 'const id = ' + match) + ';\n', [CLEAN_FILE]: CLEAN }));
      record(`stored key allowed: ${match} in ${file}`, exitCodeFor(key) === 0, `got ${forms(key)}`);
      const shown = scan(build({ [file]: 'const id = 1;\nconst t = "IICRC ' + 'course (WRT)";\n', [CLEAN_FILE]: CLEAN }));
      record(`other wording in a stored-key file is caught: ${file}`, forms(shown).includes('iicrc-name'), `got ${forms(shown)}`);
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
      'IICRC training. Standard rates apply',  // the name rule reports it; not as a standard
      'see src/services/inspection/iicrc-' + 'standards.service.ts',
      'industry standards for water damage',
    ];
    for (const text of notOwned) {
      const r = scan(build({ [target]: text + '\n', [CLEAN_FILE]: CLEAN }));
      record(`does not catch as a standard: ${text}`, !forms(r).includes('iicrc-standards'), `got ${forms(r)}`);
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

    // DR-1000: an image is served under its name, so a claim in the name is a finding.
    const imgPlant = scan(build({ ['apps/web/public/images/iicrc-' + 'certified.jpg']: 'x', [CLEAN_FILE]: CLEAN }));
    record(
      'image name with a certification claim is caught',
      imgPlant.findings.some((f) => f.line === 0 && f.form === 'cert-claim') && exitCodeFor(imgPlant) === 1,
      `got ${forms(imgPlant)}`
    );
    const imgClean = scan(build({ 'apps/web/public/images/certificate-review.jpg': 'x', [CLEAN_FILE]: CLEAN }));
    record('a plain image name is not caught', exitCodeFor(imgClean) === 0, `got ${forms(imgClean)}`);

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
