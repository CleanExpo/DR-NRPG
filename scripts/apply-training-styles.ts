/**
 * Training Module CSS Redesign Script
 *
 * Applies the new base CSS styles to all 24 NRPG training modules
 * - Adds link to training-module-base.css
 * - Adds 'training-module' class to container
 *
 * @date 2026-02-06
 */

import fs from 'fs';
import path from 'path';

const TRAINING_MODULES_DIR = path.join(
  __dirname,
  '../apps/web/public/training-sources/NRP Folder'
);

const CSS_LINK = `    <link rel="stylesheet" href="../styles/training-module-base.css">`;

// List of training module HTML files
const TRAINING_MODULE_FILES = [
  'NRP-001-COMPLETE-REAL-MODULE.html',
  'NRP-002-ENVIRONMENTAL-ASSESSMENT-TESTING.html',
  'NRP-003-INSURANCE-CLAIMS-MANAGEMENT.html',
  'NRP-004-PROFESSIONAL-DOCUMENTATION-REPORTING.html',
  'NRP-005-HEALTH-SAFETY-COMPLIANCE.html',
  'NRP-006-STRUCTURAL-DRYING-DEHUMIDIFICATION.html',
  'NRP-007-MOLD-REMEDIATION-PROTOCOLS.html',
  'NRP-008-FIRE-SMOKE-DAMAGE-RESTORATION.html',
  'NRP-009-CONTENTS-RESTORATION-PACK-OUT.html',
  'NRP-010-BIOHAZARD-TRAUMA-CLEANUP.html',
  'NRP-011-CARPET-UPHOLSTERY-CLEANING.html',
  'NRP-012-ODOUR-CONTROL-DEODORISATION.html',
  'NRP-013-EMERGENCY-RESPONSE-PROCEDURES.html',
  'NRP-014-EQUIPMENT-MANAGEMENT-MAINTENANCE.html',
  'NRP-015-CUSTOMER-SERVICE-EXCELLENCE.html',
  'NRP-016-PROJECT-MANAGEMENT-SCHEDULING.html',
  'NRP-017-COST-ESTIMATION-PRICING.html',
  'NRP-018-QUALITY-ASSURANCE-CONTROL.html',
  'NRP-019-BUSINESS-DEVELOPMENT-MARKETING.html',
  'NRP-020-ADVANCED-RESTORATION-TECHNOLOGIES.html',
  'NRP-021-DR-NRPG-PLATFORM-OPERATIONS.html',
  'NRP-022-CONTINUAL-EDUCATION-CREDITS.html',
  'NRP-023-ASSOCIATION-MEMBERSHIPS-BENEFITS.html',
  'NRP-024-MEMBERS-GATHERINGS-NETWORKING.html',
];

interface UpdateResult {
  file: string;
  success: boolean;
  changes: string[];
  error?: string;
}

function applyStylesToModule(filePath: string): UpdateResult {
  const result: UpdateResult = {
    file: path.basename(filePath),
    success: false,
    changes: [],
  };

  try {
    let html = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // 1. Add CSS link if not present
    if (!html.includes('training-module-base.css')) {
      html = html.replace('</head>', `${CSS_LINK}\n</head>`);
      result.changes.push('Added CSS link');
      modified = true;
    }

    // 2. Add training-module class to container
    if (html.includes('class="container"') && !html.includes('class="container training-module"')) {
      html = html.replace('class="container"', 'class="container training-module"');
      result.changes.push('Added training-module class');
      modified = true;
    }

    // 3. Add module-section class to sections
    if (html.includes('class="section"') && !html.includes('class="section module-section"')) {
      html = html.replace(/class="section"/g, 'class="section module-section"');
      const sectionCount = (html.match(/class="section module-section"/g) || []).length;
      if (sectionCount > 0) {
        result.changes.push(`Enhanced ${sectionCount} sections`);
        modified = true;
      }
    }

    // 4. Add training-card class to cards
    if (html.includes('class="card"') && !html.includes('class="card training-card"')) {
      html = html.replace(/class="card"/g, 'class="card training-card"');
      const cardCount = (html.match(/class="card training-card"/g) || []).length;
      if (cardCount > 0) {
        result.changes.push(`Enhanced ${cardCount} cards`);
        modified = true;
      }
    }

    // 5. Add training-table class to tables (if not already present)
    // Look for <table> without training-table class
    const tableRegex = /<table(?![^>]*training-table)([^>]*)>/g;
    const tableMatches = html.match(tableRegex);
    if (tableMatches && tableMatches.length > 0) {
      html = html.replace(tableRegex, (match, attrs) => {
        if (attrs.includes('class="')) {
          return match.replace('class="', 'class="training-table ');
        } else {
          return `<table class="training-table"${attrs}>`;
        }
      });
      result.changes.push(`Enhanced ${tableMatches.length} tables`);
      modified = true;
    }

    // Save if modified
    if (modified) {
      fs.writeFileSync(filePath, html, 'utf-8');
      result.success = true;
    } else {
      result.success = true;
      result.changes.push('Already up to date');
    }
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

async function main() {
  console.log('='.repeat(70));
  console.log('Training Module CSS Redesign');
  console.log('='.repeat(70));
  console.log('');
  console.log(`Target directory: ${TRAINING_MODULES_DIR}`);
  console.log(`CSS file: training-module-base.css`);
  console.log(`Modules to update: ${TRAINING_MODULE_FILES.length}`);
  console.log('');

  const results: UpdateResult[] = [];
  let processedCount = 0;
  let skippedCount = 0;

  for (const file of TRAINING_MODULE_FILES) {
    const filePath = path.join(TRAINING_MODULES_DIR, file);

    if (!fs.existsSync(filePath)) {
      console.log(`SKIP: ${file} (not found)`);
      skippedCount++;
      results.push({
        file,
        success: false,
        changes: [],
        error: 'File not found',
      });
      continue;
    }

    const result = applyStylesToModule(filePath);
    results.push(result);
    processedCount++;

    if (result.success) {
      console.log(`OK: ${file}`);
      result.changes.forEach((change) => console.log(`    - ${change}`));
    } else {
      console.log(`FAIL: ${file} - ${result.error}`);
    }
  }

  console.log('');
  console.log('='.repeat(70));
  console.log('Summary');
  console.log('='.repeat(70));

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`Total modules: ${TRAINING_MODULE_FILES.length}`);
  console.log(`Processed: ${processedCount}`);
  console.log(`Skipped (not found): ${skippedCount}`);
  console.log(`Successfully updated: ${successful}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0 && failed !== skippedCount) {
    console.log('');
    console.log('Failed modules:');
    results
      .filter((r) => !r.success && r.error !== 'File not found')
      .forEach((r) => console.log(`  - ${r.file}: ${r.error}`));
  }
}

main().catch(console.error);
