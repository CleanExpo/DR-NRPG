/**
 * Batch SEO Update Script - NRPG Platform
 *
 * Updates all 27 sub-service pages and 5 parent category pages with:
 * - Full SEO metadata (OG, Twitter, canonical, keywords)
 * - JSON-LD structured data (Service, Breadcrumb, FAQ schemas)
 *
 * Run: cd apps/web && npx tsx ../../scripts/update-service-page-seo.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const APPS_WEB = path.resolve(__dirname, '..', 'apps', 'web', 'app', 'services');

// ---------------------------------------------------------------------------
// Sub-service page definitions
// ---------------------------------------------------------------------------

interface SubService {
  slug: string;
  parentSlug: string;
  parentName: string;
  serviceName: string;
  keywords: string[];
}

const SUB_SERVICES: SubService[] = [
  // Water Damage (7)
  { slug: 'basement-flooding', parentSlug: 'water-damage', parentName: 'Water Damage', serviceName: 'Basement Flooding', keywords: ['basement flooding', 'basement water damage', 'flooded basement', 'basement restoration', 'water extraction basement', 'sump pump', 'basement waterproofing', 'Australia'] },
  { slug: 'burst-pipe-repair', parentSlug: 'water-damage', parentName: 'Water Damage', serviceName: 'Burst Pipe Repair', keywords: ['burst pipe repair', 'broken pipe', 'pipe leak damage', 'emergency plumbing', 'water damage pipe', 'pipe restoration', 'Australia'] },
  { slug: 'flood-restoration', parentSlug: 'water-damage', parentName: 'Water Damage', serviceName: 'Flood Restoration', keywords: ['flood restoration', 'flood damage repair', 'flood cleanup', 'flood water extraction', 'post-flood restoration', 'flood recovery', 'Australia'] },
  { slug: 'ceiling-water-damage', parentSlug: 'water-damage', parentName: 'Water Damage', serviceName: 'Ceiling Water Damage', keywords: ['ceiling water damage', 'ceiling leak repair', 'water stain ceiling', 'ceiling restoration', 'roof leak damage', 'plaster repair', 'Australia'] },
  { slug: 'carpet-water-damage', parentSlug: 'water-damage', parentName: 'Water Damage', serviceName: 'Carpet Water Damage', keywords: ['carpet water damage', 'wet carpet', 'carpet drying', 'carpet restoration', 'carpet flood damage', 'carpet extraction', 'Australia'] },
  { slug: 'commercial-water-damage', parentSlug: 'water-damage', parentName: 'Water Damage', serviceName: 'Commercial Water Damage', keywords: ['commercial water damage', 'office water damage', 'business flood damage', 'commercial restoration', 'industrial water damage', 'Australia'] },
  { slug: 'structural-drying', parentSlug: 'water-damage', parentName: 'Water Damage', serviceName: 'Structural Drying', keywords: ['structural drying', 'dehumidification', 'moisture removal', 'building drying', 'injectidry', 'desiccant drying', 'drying program', 'Australia'] },

  // Fire & Smoke Damage (5)
  { slug: 'fire-damage-restoration', parentSlug: 'fire-smoke-damage', parentName: 'Fire & Smoke Damage', serviceName: 'Fire Damage Restoration', keywords: ['fire damage restoration', 'fire damage repair', 'fire cleanup', 'house fire restoration', 'fire recovery', 'Australia'] },
  { slug: 'smoke-damage-restoration', parentSlug: 'fire-smoke-damage', parentName: 'Fire & Smoke Damage', serviceName: 'Smoke Damage Restoration', keywords: ['smoke damage restoration', 'smoke cleanup', 'smoke stain removal', 'smoke remediation', 'soot damage', 'Australia'] },
  { slug: 'soot-removal', parentSlug: 'fire-smoke-damage', parentName: 'Fire & Smoke Damage', serviceName: 'Soot Removal', keywords: ['soot removal', 'soot cleaning', 'soot damage', 'carbon cleaning', 'fire soot cleanup', 'professional soot removal', 'Australia'] },
  { slug: 'smoke-odor-removal', parentSlug: 'fire-smoke-damage', parentName: 'Fire & Smoke Damage', serviceName: 'Smoke Odor Removal', keywords: ['smoke odor removal', 'smoke smell removal', 'fire odor elimination', 'thermal fogging', 'hydroxyl generator', 'ozone treatment', 'Australia'] },
  { slug: 'commercial-fire-damage', parentSlug: 'fire-smoke-damage', parentName: 'Fire & Smoke Damage', serviceName: 'Commercial Fire Damage', keywords: ['commercial fire damage', 'business fire restoration', 'office fire damage', 'industrial fire cleanup', 'commercial fire recovery', 'Australia'] },

  // Mould Remediation (5)
  { slug: 'black-mould-removal', parentSlug: 'mould-remediation', parentName: 'Mould Remediation', serviceName: 'Black Mould Removal', keywords: ['black mould removal', 'toxic mould', 'mould remediation', 'stachybotrys removal', 'mould cleanup', 'mould testing', 'Australia'] },
  { slug: 'mould-inspection', parentSlug: 'mould-remediation', parentName: 'Mould Remediation', serviceName: 'Mould Inspection', keywords: ['mould inspection', 'mould assessment', 'mould testing', 'thermal imaging mould', 'moisture inspection', 'mould survey', 'Australia'] },
  { slug: 'mould-testing', parentSlug: 'mould-remediation', parentName: 'Mould Remediation', serviceName: 'Mould Testing', keywords: ['mould testing', 'air sampling mould', 'mould laboratory testing', 'mould species identification', 'spore count', 'mould analysis', 'Australia'] },
  { slug: 'mould-prevention', parentSlug: 'mould-remediation', parentName: 'Mould Remediation', serviceName: 'Mould Prevention', keywords: ['mould prevention', 'mould proofing', 'humidity control', 'ventilation', 'mould resistant', 'moisture prevention', 'Australia'] },
  { slug: 'commercial-mould-remediation', parentSlug: 'mould-remediation', parentName: 'Mould Remediation', serviceName: 'Commercial Mould Remediation', keywords: ['commercial mould remediation', 'office mould removal', 'industrial mould', 'business mould cleanup', 'commercial mould testing', 'Australia'] },

  // Storm Damage (5)
  { slug: 'wind-damage-restoration', parentSlug: 'storm-damage', parentName: 'Storm Damage', serviceName: 'Wind Damage Restoration', keywords: ['wind damage restoration', 'wind damage repair', 'storm wind damage', 'cyclone damage', 'structural wind damage', 'Australia'] },
  { slug: 'roof-storm-damage', parentSlug: 'storm-damage', parentName: 'Storm Damage', serviceName: 'Roof Storm Damage', keywords: ['roof storm damage', 'storm roof repair', 'roof leak storm', 'roof restoration', 'damaged roof tiles', 'Colorbond repair', 'Australia'] },
  { slug: 'tree-damage-cleanup', parentSlug: 'storm-damage', parentName: 'Storm Damage', serviceName: 'Tree Damage Cleanup', keywords: ['tree damage cleanup', 'fallen tree removal', 'storm tree damage', 'tree on house', 'arborist emergency', 'tree debris cleanup', 'Australia'] },
  { slug: 'emergency-roof-tarping', parentSlug: 'storm-damage', parentName: 'Storm Damage', serviceName: 'Emergency Roof Tarping', keywords: ['emergency roof tarping', 'roof tarp', 'temporary roof cover', 'storm roof protection', 'emergency roof repair', 'make safe', 'Australia'] },
  { slug: 'hail-damage-repair', parentSlug: 'storm-damage', parentName: 'Storm Damage', serviceName: 'Hail Damage Repair', keywords: ['hail damage repair', 'hail roof damage', 'hail dents', 'hail storm repair', 'hail damage restoration', 'Colorbond hail', 'Australia'] },

  // Biohazard Cleanup (5)
  { slug: 'meth-lab-decontamination', parentSlug: 'biohazard-cleanup', parentName: 'Biohazard Cleanup', serviceName: 'Meth Lab Decontamination', keywords: ['meth lab decontamination', 'methamphetamine cleanup', 'clandestine lab', 'meth testing', 'meth contamination', 'drug lab cleanup', 'Australia'] },
  { slug: 'sewage-cleanup', parentSlug: 'biohazard-cleanup', parentName: 'Biohazard Cleanup', serviceName: 'Sewage Cleanup', keywords: ['sewage cleanup', 'sewage overflow', 'black water cleanup', 'sewage contamination', 'sewage restoration', 'category 3 water', 'Australia'] },
  { slug: 'trauma-cleanup', parentSlug: 'biohazard-cleanup', parentName: 'Biohazard Cleanup', serviceName: 'Trauma Cleanup', keywords: ['trauma cleanup', 'trauma scene cleaning', 'biohazard cleaning', 'blood cleanup', 'forensic cleaning', 'trauma restoration', 'Australia'] },
  { slug: 'crime-scene-cleanup', parentSlug: 'biohazard-cleanup', parentName: 'Biohazard Cleanup', serviceName: 'Crime Scene Cleanup', keywords: ['crime scene cleanup', 'crime scene cleaning', 'forensic cleanup', 'biohazard crime scene', 'blood cleanup', 'Australia'] },
  { slug: 'hoarding-cleanup', parentSlug: 'biohazard-cleanup', parentName: 'Biohazard Cleanup', serviceName: 'Hoarding Cleanup', keywords: ['hoarding cleanup', 'hoarder cleaning', 'extreme cleaning', 'hoarding remediation', 'biohazard hoarding', 'declutter service', 'Australia'] },
];

// ---------------------------------------------------------------------------
// Category page definitions
// ---------------------------------------------------------------------------

interface Category {
  slug: string;
  categoryName: string;
  title: string;
  description: string;
  keywords: string[];
}

const CATEGORIES: Category[] = [
  { slug: 'water-damage', categoryName: 'Water Damage Restoration', title: 'Water Damage Restoration Services | NRPG Australia', description: 'Professional water damage restoration services across Australia. Basement flooding, burst pipes, flood restoration, structural drying. 24/7 emergency response.', keywords: ['water damage restoration', 'water damage repair', 'flood damage', 'water extraction', 'structural drying', 'burst pipe', 'basement flooding', 'Australia'] },
  { slug: 'fire-smoke-damage', categoryName: 'Fire & Smoke Damage Restoration', title: 'Fire & Smoke Damage Restoration | NRPG Australia', description: 'Professional fire and smoke damage restoration across Australia. Fire damage cleanup, smoke remediation, soot removal, odour elimination. 24/7 emergency response.', keywords: ['fire damage restoration', 'smoke damage', 'fire cleanup', 'soot removal', 'smoke odour removal', 'fire recovery', 'Australia'] },
  { slug: 'mould-remediation', categoryName: 'Mould Remediation', title: 'Mould Remediation Services | NRPG Australia', description: 'Professional mould remediation services across Australia. Black mould removal, mould inspection, testing, prevention. Safe and thorough mould cleanup.', keywords: ['mould remediation', 'mould removal', 'black mould', 'mould inspection', 'mould testing', 'mould prevention', 'Australia'] },
  { slug: 'storm-damage', categoryName: 'Storm Damage Restoration', title: 'Storm Damage Restoration Services | NRPG Australia', description: 'Professional storm damage restoration across Australia. Roof damage, wind damage, hail damage, tree cleanup, emergency tarping. 24/7 emergency response.', keywords: ['storm damage restoration', 'storm damage repair', 'roof damage', 'wind damage', 'hail damage', 'tree damage', 'emergency tarping', 'Australia'] },
  { slug: 'biohazard-cleanup', categoryName: 'Biohazard Cleanup', title: 'Biohazard Cleanup Services | NRPG Australia', description: 'Professional biohazard cleanup services across Australia. Crime scene, trauma, meth lab decontamination, sewage, hoarding cleanup. Certified and discreet.', keywords: ['biohazard cleanup', 'crime scene cleanup', 'trauma cleanup', 'meth decontamination', 'sewage cleanup', 'hoarding cleanup', 'forensic cleaning', 'Australia'] },
];

// ---------------------------------------------------------------------------
// File transformation functions
// ---------------------------------------------------------------------------

function updateSubServicePage(filePath: string, service: SubService): boolean {
  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP: ${filePath} (not found)`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Check if already updated
  if (content.includes('generateServiceMetadata')) {
    console.log(`  SKIP: ${service.slug} (already updated)`);
    return false;
  }

  // 1. Add import for the SEO utility (after existing imports)
  const seoImport = `import { generateServiceMetadata, generateServiceSchemas } from "@/lib/seo/service-page-seo"`;
  if (!content.includes('generateServiceMetadata')) {
    // Add after the last import line
    const importLines = content.match(/^import .+$/gm);
    if (importLines && importLines.length > 0) {
      const lastImport = importLines[importLines.length - 1];
      content = content.replace(lastImport, `${lastImport}\n${seoImport}`);
    }
  }

  // 2. Replace static metadata with utility call
  const metadataRegex = /export const metadata: Metadata = \{[^}]+\}/s;
  const keywordsStr = service.keywords.map(k => `'${k}'`).join(', ');
  const newMetadata = `export const metadata = generateServiceMetadata({
  title: "${extractField(content, 'title')}",
  description: "${extractField(content, 'description')}",
  keywords: [${keywordsStr}],
  slug: '${service.slug}',
  parentSlug: '${service.parentSlug}',
  parentName: '${service.parentName}',
  serviceName: '${service.serviceName}',
})`;

  content = content.replace(metadataRegex, newMetadata);

  // 3. Add JSON-LD script tag after <main> opening tag
  // Check if the page has a faqs array defined
  const hasFaqs = content.includes('const faqs =') || content.includes('const faqs=');

  const schemaCall = hasFaqs
    ? `generateServiceSchemas({
  title: metadata.title as string,
  description: metadata.description as string,
  keywords: [],
  slug: '${service.slug}',
  parentSlug: '${service.parentSlug}',
  parentName: '${service.parentName}',
  serviceName: '${service.serviceName}',
  faqs,
})`
    : `generateServiceSchemas({
  title: metadata.title as string,
  description: metadata.description as string,
  keywords: [],
  slug: '${service.slug}',
  parentSlug: '${service.parentSlug}',
  parentName: '${service.parentName}',
  serviceName: '${service.serviceName}',
})`;

  // Find the component's return statement and add schemas
  // Look for pattern: return (\n    <div ...>
  // We need to add the JSON-LD script inside the return, right after <Header />
  const headerPattern = '<Header />';
  if (content.includes(headerPattern) && !content.includes('application/ld+json')) {
    const jsonLdBlock = `<Header />
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(${schemaCall}) }}
      />`;
    content = content.replace(headerPattern, jsonLdBlock);
  }

  // 4. Remove unused Metadata type import if present (since we no longer use it inline)
  // Keep it if other things use it, but our utility handles the type
  content = content.replace(/import type \{ Metadata \} from "next"\n/, '');

  fs.writeFileSync(filePath, content, 'utf-8');
  return true;
}

function updateCategoryPage(filePath: string, category: Category): boolean {
  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP: ${filePath} (not found)`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Check if already updated
  if (content.includes('generateCategoryMetadata')) {
    console.log(`  SKIP: ${category.slug} (already updated)`);
    return false;
  }

  // 1. Add imports
  const seoImport = `import { generateCategoryMetadata, generateCategorySchemas } from "@/lib/seo/service-page-seo"`;
  const metadataTypeImport = `import type { Metadata } from "next"`;

  // Add SEO import after the last existing import
  const importLines = content.match(/^import .+$/gm);
  if (importLines && importLines.length > 0) {
    const lastImport = importLines[importLines.length - 1];
    content = content.replace(lastImport, `${lastImport}\n${seoImport}`);
  }

  // 2. Add metadata export before the default export function
  const keywordsStr = category.keywords.map(k => `'${k}'`).join(', ');
  const metadataExport = `\nexport const metadata: Metadata = generateCategoryMetadata({
  title: "${category.title}",
  description: "${category.description}",
  keywords: [${keywordsStr}],
  slug: '${category.slug}',
  categoryName: '${category.categoryName}',
});\n`;

  // Insert before `export default function`
  const defaultExportMatch = content.match(/export default function/);
  if (defaultExportMatch && !content.includes('export const metadata')) {
    content = content.replace('export default function', `${metadataExport}\nexport default function`);
  }

  // 3. Add JSON-LD script after <Header />
  if (content.includes('<Header />') && !content.includes('application/ld+json')) {
    const schemaCall = `generateCategorySchemas({
  title: '${category.title}',
  description: '${category.description}',
  keywords: [],
  slug: '${category.slug}',
  categoryName: '${category.categoryName}',
})`;

    const jsonLdBlock = `<Header />
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(${schemaCall}) }}
      />`;
    content = content.replace('<Header />', jsonLdBlock);
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  return true;
}

// Helper: extract title or description from the existing metadata export
function extractField(content: string, field: 'title' | 'description'): string {
  const regex = new RegExp(`${field}:\\s*"([^"]+)"`);
  const match = content.match(regex);
  return match ? match[1] : '';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log('=== NRPG Service Page SEO Updater ===\n');

let updated = 0;
let skipped = 0;

// Update sub-service pages
console.log('--- Sub-Service Pages (27) ---');
for (const service of SUB_SERVICES) {
  const filePath = path.join(APPS_WEB, service.parentSlug, service.slug, 'page.tsx');
  process.stdout.write(`  [${updated + skipped + 1}/32] ${service.slug}... `);
  const wasUpdated = updateSubServicePage(filePath, service);
  if (wasUpdated) {
    console.log('OK');
    updated++;
  } else {
    skipped++;
  }
}

// Update category pages
console.log('\n--- Category Pages (5) ---');
for (const category of CATEGORIES) {
  const filePath = path.join(APPS_WEB, category.slug, 'page.tsx');
  process.stdout.write(`  [${updated + skipped + 1}/32] ${category.slug}... `);
  const wasUpdated = updateCategoryPage(filePath, category);
  if (wasUpdated) {
    console.log('OK');
    updated++;
  } else {
    skipped++;
  }
}

console.log(`\n=== Complete ===`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
