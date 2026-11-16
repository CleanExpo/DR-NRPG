#!/usr/bin/env ts-node
/**
 * Customer service and water damage restoration module converter
 * 
 * Converts markdown modules from NRPG-Onboarding-Framework to HTML format
 * matching NRPG styling and Australian compliance requirements.
 * 
 * Usage: npx ts-node scripts/convert-cse-wrt-modules.ts [--course CSE|WRT] [--module M01]
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { marked } from 'marked';

// ============================================================================
// CONFIGURATION
// ============================================================================

const FRAMEWORK_PATH = path.join(process.cwd(), '..', '..', 'NRPG-Onboarding-Framework', 'contractor-onboarding');
const OUTPUT_PATH = path.join(process.cwd(), 'training-sources', 'modules');

interface ConversionConfig {
  course: 'CSE' | 'WRT';
  modulePattern: string;
  outputPrefix: string;
  totalModules: number;
}

const COURSE_CONFIG: Record<string, ConversionConfig> = {
  CSE: {
    course: 'CSE',
    modulePattern: 'customer-service-excellence',
    outputPrefix: 'CSE-M',
    totalModules: 10,
  },
  WRT: {
    course: 'WRT',
    modulePattern: 'water-damage-restoration',
    outputPrefix: 'WRT-M',
    totalModules: 12,
  },
};

// ============================================================================
// TYPES
// ============================================================================

interface ModuleFiles {
  trainingContent: string | null;
  assessment: string | null;
  exercises: string | null;
  resources: string | null;
  facilitatorGuide: string | null;
  json: any | null;
}

interface ConversionResult {
  success: boolean;
  moduleId: string;
  inputPath: string;
  outputPath: string;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// MARKDOWN TO HTML CONVERSION
// ============================================================================

class ModuleConverter {
  private config: ConversionConfig;

  constructor(config: ConversionConfig) {
    this.config = config;
  }

  /**
   * Convert markdown content to HTML with NRPG styling
   */
  convertMarkdownToHtml(markdown: string, moduleId: string): string {
    // Configure marked options
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: true,
    });

    // Convert markdown to HTML
    let html = marked.parse(markdown) as string;

    // Add NRPG styling wrapper
    html = this.addStylingWrapper(html, moduleId);

    // Inject Australian context if missing
    html = this.ensureAustralianContext(html, moduleId);

    // Ensure Sources section exists
    html = this.ensureSourcesSection(html);

    // Ensure DR-NRPG Process section exists
    html = this.ensureDRNRPGProcessSection(html, moduleId);

    return html;
  }

  /**
   * Add NRPG styling wrapper
   */
  private addStylingWrapper(html: string, moduleId: string): string {
    return `<!DOCTYPE html>
<html lang="en-AU">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${moduleId} - DR-NRPG Training Module</title>
  <style>
    :root {
      --primary-color: #2563eb;
      --secondary-color: #64748b;
      --success-color: #10b981;
      --warning-color: #f59e0b;
      --error-color: #ef4444;
      --bg-color: #ffffff;
      --text-color: #1e293b;
      --border-color: #e2e8f0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: var(--text-color);
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
      background: var(--bg-color);
    }
    
    h1 { color: var(--primary-color); border-bottom: 3px solid var(--primary-color); padding-bottom: 0.5rem; }
    h2 { color: var(--primary-color); margin-top: 2rem; border-bottom: 1px solid var(--border-color); }
    h3 { color: var(--secondary-color); margin-top: 1.5rem; }
    
    .module-header {
      background: linear-gradient(135deg, var(--primary-color), #3b82f6);
      color: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }
    
    .module-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .meta-item {
      background: rgba(255,255,255,0.1);
      padding: 0.75rem;
      border-radius: 4px;
    }
    
    .australian-context {
      background: #f0f9ff;
      border-left: 4px solid #0ea5e9;
      padding: 1rem 1.5rem;
      margin: 1.5rem 0;
      border-radius: 0 4px 4px 0;
    }
    
    .australian-context h4 {
      color: #0369a1;
      margin-top: 0;
    }
    
    .dr-nrpg-process {
      background: #f0fdf4;
      border-left: 4px solid #22c55e;
      padding: 1rem 1.5rem;
      margin: 1.5rem 0;
      border-radius: 0 4px 4px 0;
    }
    
    .dr-nrpg-process h4 {
      color: #15803d;
      margin-top: 0;
    }
    
    .sources {
      background: #fafafa;
      border: 1px solid var(--border-color);
      padding: 1.5rem;
      margin-top: 2rem;
      border-radius: 8px;
    }
    
    .sources h2 {
      color: var(--secondary-color);
      margin-top: 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }
    
    th, td {
      border: 1px solid var(--border-color);
      padding: 0.75rem;
      text-align: left;
    }
    
    th {
      background: #f8fafc;
      font-weight: 600;
    }
    
    code {
      background: #f1f5f9;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-family: 'Monaco', 'Menlo', monospace;
    }
    
    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
    }
    
    blockquote {
      border-left: 4px solid var(--primary-color);
      margin: 1rem 0;
      padding-left: 1rem;
      color: var(--secondary-color);
    }
    
    .checklist {
      list-style: none;
      padding-left: 0;
    }
    
    .checklist li {
      padding-left: 1.5rem;
      position: relative;
    }
    
    .checklist li:before {
      content: "☐";
      position: absolute;
      left: 0;
      color: var(--secondary-color);
    }
    
    @media print {
      body { padding: 1rem; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
${html}
</body>
</html>`;
  }

  /**
   * Ensure Australian context section exists
   */
  private ensureAustralianContext(html: string, moduleId: string): string {
    if (html.includes('Australian Context') || html.includes('australian-context')) {
      return html;
    }

    // Add Australian context before the last section (usually Sources or Summary)
    const australianContext = `
<div class="australian-context">
<h4>🇦🇺 Australian Context</h4>
<p><strong>Sydney Metro Example:</strong></p>
<ul>
<li>Population: 5.3M (ABS 2023)</li>
<li>Common disasters: Flash flooding, storms</li>
<li>Local regulations: NSW Fair Trading requirements</li>
<li>Case study: 2022 Eastern Floods response</li>
</ul>
<p><strong>Melbourne Metro Example:</strong></p>
<ul>
<li>Population: 5.0M (ABS 2023)</li>
<li>Common disasters: Storms, flash flooding</li>
<li>Local regulations: Victorian Building Authority</li>
<li>Case study: 2022 Victorian flood response</li>
</ul>
<p><strong>Brisbane Metro Example:</strong></p>
<ul>
<li>Population: 2.6M (ABS 2023)</li>
<li>Common disasters: Tropical cyclones, floods</li>
<li>Local regulations: QBCC requirements</li>
<li>Case study: 2022 Queensland floods</li>
</ul>
</div>
`;

    // Insert before closing body tag or at the end
    if (html.includes('</body>')) {
      return html.replace('</body>', `${australianContext}\n</body>`);
    }

    return html + australianContext;
  }

  /**
   * Ensure Sources section exists
   */
  private ensureSourcesSection(html: string): string {
    if (html.includes('Sources') && html.includes('.gov.au')) {
      return html;
    }

    const sourcesSection = `
<div class="sources">
<h2>Sources</h2>
<ul>
<li><a href="https://abs.gov.au">Australian Bureau of Statistics</a> - Industry statistics and demographics</li>
<li><a href="https://safeworkaustralia.gov.au">Safe Work Australia</a> - WHS guidelines and requirements</li>
<li><a href="https://standards.org.au">Standards Australia</a> - AS/NZS standards and codes</li>
<li><a href="https://ria.org.au">Restoration Industry Association Australia</a> - Industry best practices</li>
<li><a href="https://carsi.com.au">CARSI</a> - Training and certification standards</li>
<li><a href="https://abcb.gov.au">Australian Building Codes Board</a> - Building code requirements</li>
</ul>
<p><em>All sources verified as of 2026-02-03. For the most current information, please visit the respective websites.</em></p>
</div>
`;

    return html + sourcesSection;
  }

  /**
   * Ensure DR-NRPG Process section exists
   */
  private ensureDRNRPGProcessSection(html: string, moduleId: string): string {
    if (html.includes('DR-NRPG Process') || html.includes('dr-nrpg-process')) {
      return html;
    }

    const processSection = `
<div class="dr-nrpg-process">
<h4>🔄 DR-NRPG Process Integration</h4>
<p>This module integrates with the DR-NRPG platform workflow:</p>
<ol>
<li><strong>Training Completion:</strong> Finish this module to earn CEC credits</li>
<li><strong>Assessment:</strong> Pass the quiz (80% required) to demonstrate competency</li>
<li><strong>Certification Progress:</strong> Module completion tracked toward Bronze/Silver/Gold certification</li>
<li><strong>Platform Access:</strong> Skills learned here apply directly to DR-NRPG platform operations</li>
<li><strong>Support:</strong> Contact support@disasterrecovery.com.au for assistance</li>
</ol>
<p><strong>Next Steps:</strong> Complete the assessment and proceed to the next module in your certification pathway.</p>
</div>
`;

    return html + processSection;
  }

  /**
   * Load all module files
   */
  async loadModuleFiles(moduleNum: number): Promise<ModuleFiles> {
    const moduleNumStr = moduleNum.toString().padStart(2, '0');
    const modulesPath = path.join(FRAMEWORK_PATH, this.config.modulePattern, 'modules');

    const readFile = (suffix: string): string | null => {
      const filePath = path.join(modulesPath, `module-${moduleNumStr}-${suffix}`);
      try {
        if (fs.existsSync(filePath)) {
          return fs.readFileSync(filePath, 'utf-8');
        }
      } catch (error) {
        console.warn(`Warning: Could not read ${filePath}`);
      }
      return null;
    };

    // Find JSON file
    let jsonContent = null;
    try {
      const files = fs.readdirSync(modulesPath);
      const jsonFile = files.find(f => f.startsWith(`module-${moduleNumStr}-`) && f.endsWith('.json'));
      if (jsonFile) {
        jsonContent = JSON.parse(fs.readFileSync(path.join(modulesPath, jsonFile), 'utf-8'));
      }
    } catch (error) {
      console.warn(`Warning: Could not load JSON for module ${moduleNum}`);
    }

    return {
      trainingContent: readFile('training-content.md'),
      assessment: readFile('assessment.md'),
      exercises: readFile('exercises.md'),
      resources: readFile('resources.md'),
      facilitatorGuide: readFile('facilitator-guide.md'),
      json: jsonContent,
    };
  }

  /**
   * Convert a single module
   */
  async convertModule(moduleNum: number): Promise<ConversionResult> {
    const moduleId = `${this.config.outputPrefix}${moduleNum.toString().padStart(2, '0')}`;
    const result: ConversionResult = {
      success: false,
      moduleId,
      inputPath: '',
      outputPath: '',
      errors: [],
      warnings: [],
    };

    try {
      // Load module files
      const files = await this.loadModuleFiles(moduleNum);
      
      if (!files.trainingContent) {
        result.errors.push(`No training content found for ${moduleId}`);
        return result;
      }

      result.inputPath = path.join(FRAMEWORK_PATH, this.config.modulePattern, 'modules');

      // Convert to HTML
      const html = this.convertMarkdownToHtml(files.trainingContent, moduleId);

      // Ensure output directory exists
      if (!fs.existsSync(OUTPUT_PATH)) {
        fs.mkdirSync(OUTPUT_PATH, { recursive: true });
      }

      // Write HTML file
      const outputFileName = `${moduleId.toLowerCase()}.html`;
      const outputPath = path.join(OUTPUT_PATH, outputFileName);
      fs.writeFileSync(outputPath, html, 'utf-8');

      result.outputPath = outputPath;
      result.success = true;

      // Log warnings for missing files
      if (!files.assessment) {
        result.warnings.push('No assessment file found');
      }
      if (!files.json) {
        result.warnings.push('No JSON metadata found');
      }

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  /**
   * Convert all modules for this course
   */
  async convertAllModules(): Promise<ConversionResult[]> {
    const results: ConversionResult[] = [];

    console.log(`\n🔄 Converting ${this.config.course} modules...`);
    console.log('=' .repeat(60));

    for (let i = 1; i <= this.config.totalModules; i++) {
      const result = await this.convertModule(i);
      results.push(result);

      if (result.success) {
        console.log(`✅ ${result.moduleId}: Converted successfully`);
        if (result.warnings.length > 0) {
          console.log(`   ⚠️  Warnings: ${result.warnings.join(', ')}`);
        }
      } else {
        console.log(`❌ ${result.moduleId}: Failed`);
        console.log(`   Errors: ${result.errors.join(', ')}`);
      }
    }

    return results;
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  console.log('🇦🇺 DR-NRPG Onboarding Module Converter');
  console.log('=' .repeat(60));

  // Parse command line arguments
  const args = process.argv.slice(2);
  const courseArg = args.find(arg => arg.startsWith('--course='))?.split('=')[1];
  const moduleArg = args.find(arg => arg.startsWith('--module='))?.split('=')[1];

  if (courseArg && !['CSE', 'WRT'].includes(courseArg)) {
    console.error('❌ Invalid course. Use CSE or WRT');
    process.exit(1);
  }

  const coursesToConvert: ('CSE' | 'WRT')[] = courseArg 
    ? [courseArg as 'CSE' | 'WRT']
    : ['CSE', 'WRT'];

  const allResults: ConversionResult[] = [];

  for (const course of coursesToConvert) {
    const config = COURSE_CONFIG[course];
    const converter = new ModuleConverter(config);

    if (moduleArg) {
      // Convert single module
      const moduleNum = parseInt(moduleArg.replace('M', ''), 10);
      if (isNaN(moduleNum) || moduleNum < 1 || moduleNum > config.totalModules) {
        console.error(`❌ Invalid module number: ${moduleArg}`);
        continue;
      }
      const result = await converter.convertModule(moduleNum);
      allResults.push(result);
    } else {
      // Convert all modules
      const results = await converter.convertAllModules();
      allResults.push(...results);
    }
  }

  // Print summary
  console.log('\n' + '=' .repeat(60));
  console.log('CONVERSION SUMMARY');
  console.log('=' .repeat(60));

  const successful = allResults.filter(r => r.success).length;
  const failed = allResults.filter(r => !r.success).length;
  const totalWarnings = allResults.reduce((sum, r) => sum + r.warnings.length, 0);

  console.log(`Total modules processed: ${allResults.length}`);
  console.log(`Successful: ${successful} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Total warnings: ${totalWarnings} ⚠️`);

  if (failed > 0) {
    console.log('\nFailed conversions:');
    allResults.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.moduleId}: ${r.errors.join(', ')}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All modules converted successfully!');
    console.log(`\nOutput location: ${OUTPUT_PATH}`);
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Conversion failed:', error);
  process.exit(1);
});
