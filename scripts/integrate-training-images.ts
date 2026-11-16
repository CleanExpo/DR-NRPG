/**
 * Training Module Image Integration Script
 *
 * Automatically integrates generated images into training module HTML files
 * Adds <img> tags with proper paths, alt text, and styling
 */

import fs from 'fs';
import path from 'path';

interface ImageMapping {
  module: string;
  htmlFilename: string; // Actual HTML filename
  images: {
    filename: string;
    altText: string;
    caption?: string;
  }[];
}

// Image mappings for each training module
const IMAGE_MAPPINGS: ImageMapping[] = [
  {
    module: 'NRP-001',
    htmlFilename: 'NRP-001-COMPLETE-REAL-MODULE.html',
    images: [
      {
        filename: 'membership-registration-process.jpg',
        altText: 'Membership registration workflow diagram showing application, verification, approval, and activation steps',
        caption: 'Professional membership registration process workflow',
      },
      {
        filename: 'professional-certifications.jpg',
        altText: 'Industry certification documentation and training materials',
        caption: 'Professional certifications and training standards',
      },
      {
        filename: 'australian-compliance-checklist.jpg',
        altText: 'Australian regulatory compliance requirements checklist including ABN, insurance, and licenses',
        caption: 'Australian business compliance requirements',
      },
    ],
  },
  {
    module: 'NRP-002',
    htmlFilename: 'NRP-002-ENVIRONMENTAL-ASSESSMENT-TESTING.html',
    images: [
      {
        filename: 'moisture-testing-equipment.jpg',
        altText: 'Professional moisture detection equipment including meters, thermal cameras, and hygrometers',
        caption: 'Moisture testing and detection equipment',
      },
      {
        filename: 'environmental-testing-process.jpg',
        altText: 'Environmental assessment and testing in Australian residential property',
        caption: 'Professional environmental testing process',
      },
      {
        filename: 'moisture-mapping-diagram.jpg',
        altText: 'Colour-coded moisture mapping on floor plan showing dry, elevated, and wet zones',
        caption: 'Moisture mapping visualization',
      },
    ],
  },
  {
    module: 'NRP-003',
    htmlFilename: 'NRP-003-INSURANCE-CLAIMS-MANAGEMENT.html',
    images: [
      {
        filename: 'insurance-claim-documentation.jpg',
        altText: 'Insurance claim forms, photos, receipts, and organized documentation',
        caption: 'Insurance claim documentation package',
      },
      {
        filename: 'claims-process-workflow.jpg',
        altText: 'Step-by-step insurance claims processing workflow diagram',
        caption: 'Insurance claims process workflow',
      },
      {
        filename: 'damage-assessment-photos.jpg',
        altText: 'Professional damage documentation photography methodology',
        caption: 'Professional damage assessment photography',
      },
    ],
  },
  {
    module: 'NRP-004',
    htmlFilename: 'NRP-004-PROFESSIONAL-DOCUMENTATION-REPORTING.html',
    images: [
      {
        filename: 'professional-report-template.jpg',
        altText: 'Professional restoration report layout with organized sections',
        caption: 'Professional report template design',
      },
      {
        filename: 'photo-documentation-best-practices.jpg',
        altText: 'Before, during, and after restoration documentation examples',
        caption: 'Documentation photography best practices',
      },
      {
        filename: 'field-notes-documentation.jpg',
        altText: 'Professional field notes, sketches, and measurement documentation',
        caption: 'Field documentation and notes',
      },
    ],
  },
  {
    module: 'NRP-005',
    htmlFilename: 'NRP-005-HEALTH-SAFETY-COMPLIANCE.html',
    images: [
      {
        filename: 'ppe-safety-equipment.jpg',
        altText: 'Personal protective equipment including hard hat, respirator, gloves, boots, and vest',
        caption: 'Personal protective equipment (PPE)',
      },
      {
        filename: 'worksite-safety-setup.jpg',
        altText: 'Professional job site with safety protocols and organized equipment',
        caption: 'Professional worksite safety setup',
      },
      {
        filename: 'australian-safety-standards.jpg',
        altText: 'Australian workplace health and safety standards infographic',
        caption: 'Australian WH&S compliance standards',
      },
    ],
  },
  {
    module: 'NRP-006',
    htmlFilename: 'NRP-006-STRUCTURAL-DRYING-DEHUMIDIFICATION.html',
    images: [
      {
        filename: 'dehumidification-equipment.jpg',
        altText: 'Industrial dehumidifiers and high-velocity air movers',
        caption: 'Dehumidification equipment',
      },
      {
        filename: 'psychrometric-chart.jpg',
        altText: 'Psychrometric chart for drying calculations and monitoring',
        caption: 'Psychrometric chart for structural drying',
      },
      {
        filename: 'drying-chamber-setup.jpg',
        altText: 'Professional drying chamber with containment and equipment setup',
        caption: 'Drying chamber containment setup',
      },
    ],
  },
  {
    module: 'NRP-007',
    htmlFilename: 'NRP-007-MOLD-REMEDIATION-PROTOCOLS.html',
    images: [
      {
        filename: 'mould-containment-setup.jpg',
        altText: 'Professional mould remediation containment barriers and zipper doors',
        caption: 'Mould containment barrier setup',
      },
      {
        filename: 'hepa-filtration-equipment.jpg',
        altText: 'HEPA air scrubbers and negative air filtration machines',
        caption: 'HEPA filtration and air scrubbing equipment',
      },
      {
        filename: 'mould-testing-samples.jpg',
        altText: 'Mould testing equipment and sample collection materials',
        caption: 'Mould testing and sampling equipment',
      },
    ],
  },
  {
    module: 'NRP-008',
    htmlFilename: 'NRP-008-FIRE-SMOKE-DAMAGE-RESTORATION.html',
    images: [
      {
        filename: 'fire-damage-assessment.jpg',
        altText: 'Fire and smoke damage in commercial office setting',
        caption: 'Fire and smoke damage assessment',
      },
      {
        filename: 'air-scrubber-operation.jpg',
        altText: 'Industrial air scrubbers operating for smoke odour removal',
        caption: 'Air scrubber equipment for smoke removal',
      },
      {
        filename: 'soot-cleaning-techniques.jpg',
        altText: 'Professional soot and smoke residue cleaning methodology',
        caption: 'Professional soot cleaning techniques',
      },
    ],
  },
  {
    module: 'NRP-009',
    htmlFilename: 'NRP-009-CONTENTS-RESTORATION-PACK-OUT.html',
    images: [
      {
        filename: 'biohazard-ppe-full-suit.jpg',
        altText: 'Complete biohazard protective equipment including hazmat suit and respirator',
        caption: 'Full biohazard PPE',
      },
      {
        filename: 'decontamination-equipment.jpg',
        altText: 'Biohazard decontamination tools and supplies',
        caption: 'Decontamination equipment and supplies',
      },
      {
        filename: 'biohazard-waste-disposal.jpg',
        altText: 'Proper biohazard waste containers and disposal protocols',
        caption: 'Biohazard waste disposal procedures',
      },
    ],
  },
  {
    module: 'NRP-010',
    htmlFilename: 'NRP-010-BIOHAZARD-TRAUMA-CLEANUP.html',
    images: [
      {
        filename: 'reconstruction-tools-equipment.jpg',
        altText: 'Professional construction and reconstruction tools',
        caption: 'Reconstruction tools and equipment',
      },
      {
        filename: 'wall-reconstruction-progress.jpg',
        altText: 'Wall reconstruction in progress during restoration',
        caption: 'Wall reconstruction in progress',
      },
    ],
  },
  {
    module: 'NRP-011',
    htmlFilename: 'NRP-011-CARPET-UPHOLSTERY-CLEANING.html',
    images: [
      {
        filename: 'carpet-cleaning-equipment.jpg',
        altText: 'Professional carpet extraction and cleaning equipment',
        caption: 'Carpet cleaning equipment',
      },
      {
        filename: 'upholstery-cleaning-process.jpg',
        altText: 'Upholstery cleaning in progress on furniture',
        caption: 'Upholstery cleaning process',
      },
      {
        filename: 'stain-removal-techniques.jpg',
        altText: 'Professional carpet stain removal methodology',
        caption: 'Stain removal techniques',
      },
      {
        filename: 'carpet-drying-setup.jpg',
        altText: 'Air movers positioned for carpet drying',
        caption: 'Carpet drying equipment setup',
      },
    ],
  },
  {
    module: 'NRP-012',
    htmlFilename: 'NRP-012-ODOUR-CONTROL-DEODORISATION.html',
    images: [
      {
        filename: 'contents-pack-out.jpg',
        altText: 'Professional contents packing and inventory process',
        caption: 'Contents pack-out process',
      },
      {
        filename: 'contents-cleaning-facility.jpg',
        altText: 'Commercial contents restoration facility',
        caption: 'Contents cleaning facility',
      },
      {
        filename: 'electronics-restoration.jpg',
        altText: 'Electronic equipment restoration and cleaning',
        caption: 'Electronics restoration process',
      },
      {
        filename: 'textile-restoration.jpg',
        altText: 'Professional textile cleaning and restoration',
        caption: 'Textile restoration',
      },
    ],
  },
  {
    module: 'NRP-013',
    htmlFilename: 'NRP-013-EMERGENCY-RESPONSE-PROCEDURES.html',
    images: [
      {
        filename: 'odour-control-equipment.jpg',
        altText: 'Ozone generators, hydroxyl generators, and thermal foggers',
        caption: 'Odour control equipment',
      },
      {
        filename: 'air-quality-testing.jpg',
        altText: 'Air quality testing and monitoring equipment',
        caption: 'Air quality testing equipment',
      },
      {
        filename: 'deodorisation-process.jpg',
        altText: 'Professional deodorisation in progress',
        caption: 'Deodorisation process',
      },
    ],
  },
  {
    module: 'NRP-014',
    htmlFilename: 'NRP-014-EQUIPMENT-MANAGEMENT-MAINTENANCE.html',
    images: [
      {
        filename: 'crawl-space-assessment.jpg',
        altText: 'Professional crawl space inspection',
        caption: 'Crawl space assessment',
      },
      {
        filename: 'crawl-space-encapsulation.jpg',
        altText: 'Crawl space vapor barrier installation',
        caption: 'Crawl space encapsulation',
      },
      {
        filename: 'crawl-space-dehumidification.jpg',
        altText: 'Dehumidification system in crawl space',
        caption: 'Crawl space dehumidification',
      },
    ],
  },
  {
    module: 'NRP-015',
    htmlFilename: 'NRP-015-CUSTOMER-SERVICE-EXCELLENCE.html',
    images: [
      {
        filename: 'equipment-fleet-overview.jpg',
        altText: 'Complete restoration equipment fleet display',
        caption: 'Equipment fleet overview',
      },
      {
        filename: 'equipment-maintenance-schedule.jpg',
        altText: 'Maintenance checklist and schedule infographic',
        caption: 'Equipment maintenance schedule',
      },
      {
        filename: 'equipment-operation-safety.jpg',
        altText: 'Safe equipment operation demonstration',
        caption: 'Equipment operation safety',
      },
      {
        filename: 'equipment-calibration.jpg',
        altText: 'Professional equipment calibration and testing',
        caption: 'Equipment calibration process',
      },
    ],
  },
  {
    module: 'NRP-016',
    htmlFilename: 'NRP-016-PROJECT-MANAGEMENT-SCHEDULING.html',
    images: [
      {
        filename: 'advanced-drying-techniques.jpg',
        altText: 'Specialty drying methods and equipment',
        caption: 'Advanced drying techniques',
      },
      {
        filename: 'thermal-imaging-analysis.jpg',
        altText: 'Thermal imaging camera showing moisture patterns',
        caption: 'Thermal imaging moisture analysis',
      },
      {
        filename: 'cavity-drying-setup.jpg',
        altText: 'Specialty drying equipment for wall cavities',
        caption: 'Wall cavity drying setup',
      },
      {
        filename: 'drying-monitoring-dashboard.jpg',
        altText: 'Digital moisture monitoring system display',
        caption: 'Moisture monitoring dashboard',
      },
    ],
  },
  {
    module: 'NRP-017',
    htmlFilename: 'NRP-017-COST-ESTIMATION-PRICING.html',
    images: [
      {
        filename: 'estimating-software-interface.jpg',
        altText: 'Professional estimating software dashboard',
        caption: 'Estimating software interface',
      },
      {
        filename: 'cost-breakdown-chart.jpg',
        altText: 'Visual cost breakdown by category',
        caption: 'Job cost breakdown',
      },
      {
        filename: 'pricing-calculator.jpg',
        altText: 'Interactive pricing calculator interface',
        caption: 'Pricing calculator tool',
      },
      {
        filename: 'profit-margin-analysis.jpg',
        altText: 'Profit margin analysis chart and graphs',
        caption: 'Profit margin analysis',
      },
    ],
  },
  {
    module: 'NRP-018',
    htmlFilename: 'NRP-018-QUALITY-ASSURANCE-CONTROL.html',
    images: [
      {
        filename: 'safety-management-workflow.jpg',
        altText: 'Complete safety management system workflow',
        caption: 'Safety management workflow',
      },
      {
        filename: 'incident-reporting-form.jpg',
        altText: 'Professional incident reporting documentation',
        caption: 'Incident reporting form',
      },
      {
        filename: 'safety-training-materials.jpg',
        altText: 'Safety training manuals and materials',
        caption: 'Safety training materials',
      },
      {
        filename: 'safety-audit-checklist.jpg',
        altText: 'Comprehensive safety audit checklist',
        caption: 'Safety audit checklist',
      },
    ],
  },
  {
    module: 'NRP-019',
    htmlFilename: 'NRP-019-BUSINESS-DEVELOPMENT-MARKETING.html',
    images: [
      {
        filename: 'quality-control-checklist.jpg',
        altText: 'Multi-point quality control inspection checklist',
        caption: 'Quality control checklist',
      },
      {
        filename: 'quality-documentation.jpg',
        altText: 'Professional quality assurance documentation',
        caption: 'Quality documentation',
      },
      {
        filename: 'customer-satisfaction-survey.jpg',
        altText: 'Customer satisfaction survey and feedback form',
        caption: 'Customer satisfaction survey',
      },
      {
        filename: 'quality-metrics-dashboard.jpg',
        altText: 'Quality metrics tracking dashboard',
        caption: 'Quality metrics dashboard',
      },
    ],
  },
  {
    module: 'NRP-020',
    htmlFilename: 'NRP-020-ADVANCED-RESTORATION-TECHNOLOGIES.html',
    images: [
      {
        filename: 'customer-communication-channels.jpg',
        altText: 'Multi-channel customer communication infographic',
        caption: 'Customer communication channels',
      },
      {
        filename: 'customer-journey-map.jpg',
        altText: 'Customer experience journey mapping',
        caption: 'Customer journey map',
      },
      {
        filename: 'complaint-resolution-workflow.jpg',
        altText: 'Professional complaint resolution process',
        caption: 'Complaint resolution workflow',
      },
      {
        filename: 'customer-feedback-system.jpg',
        altText: 'Customer feedback collection and analysis system',
        caption: 'Customer feedback system',
      },
    ],
  },
  {
    module: 'NRP-021',
    htmlFilename: 'NRP-021-DR-NRPG-PLATFORM-OPERATIONS.html',
    images: [
      {
        filename: 'marketing-channels-overview.jpg',
        altText: 'Digital and traditional marketing channels infographic',
        caption: 'Marketing channels overview',
      },
      {
        filename: 'social-media-strategy.jpg',
        altText: 'Social media marketing strategy framework',
        caption: 'Social media strategy',
      },
      {
        filename: 'lead-generation-funnel.jpg',
        altText: 'Lead generation and conversion funnel diagram',
        caption: 'Lead generation funnel',
      },
      {
        filename: 'branding-guidelines.jpg',
        altText: 'Professional branding and visual identity guide',
        caption: 'Branding guidelines',
      },
      {
        filename: 'marketing-analytics-dashboard.jpg',
        altText: 'Marketing performance metrics dashboard',
        caption: 'Marketing analytics dashboard',
      },
    ],
  },
  {
    module: 'NRP-022',
    htmlFilename: 'NRP-022-CONTINUAL-EDUCATION-CREDITS.html',
    images: [
      {
        filename: 'project-timeline-gantt.jpg',
        altText: 'Gantt chart showing project timeline and milestones',
        caption: 'Project timeline Gantt chart',
      },
      {
        filename: 'resource-allocation-chart.jpg',
        altText: 'Resource allocation and scheduling diagram',
        caption: 'Resource allocation chart',
      },
      {
        filename: 'project-communication-plan.jpg',
        altText: 'Communication plan and stakeholder management',
        caption: 'Project communication plan',
      },
      {
        filename: 'risk-management-matrix.jpg',
        altText: 'Risk assessment and mitigation matrix',
        caption: 'Risk management matrix',
      },
      {
        filename: 'project-closeout-checklist.jpg',
        altText: 'Comprehensive project closeout checklist',
        caption: 'Project closeout checklist',
      },
    ],
  },
  {
    module: 'NRP-023',
    htmlFilename: 'NRP-023-ASSOCIATION-MEMBERSHIPS-BENEFITS.html',
    images: [
      {
        filename: 'cash-flow-projection.jpg',
        altText: '12-month cash flow projection chart',
        caption: 'Cash flow projection',
      },
      {
        filename: 'profit-loss-statement.jpg',
        altText: 'Professional P&L statement template',
        caption: 'Profit and loss statement',
      },
      {
        filename: 'financial-kpi-dashboard.jpg',
        altText: 'Key financial performance indicators dashboard',
        caption: 'Financial KPI dashboard',
      },
      {
        filename: 'invoice-template.jpg',
        altText: 'Professional invoice template design',
        caption: 'Professional invoice template',
      },
      {
        filename: 'financial-reporting-system.jpg',
        altText: 'Financial reporting and analysis system',
        caption: 'Financial reporting system',
      },
    ],
  },
  {
    module: 'NRP-024',
    htmlFilename: 'NRP-024-MEMBERS-GATHERINGS-NETWORKING.html',
    images: [
      {
        filename: 'business-growth-strategy.jpg',
        altText: 'Strategic business growth planning framework',
        caption: 'Business growth strategy',
      },
      {
        filename: 'competitive-analysis-matrix.jpg',
        altText: 'Competitive analysis and market positioning',
        caption: 'Competitive analysis matrix',
      },
      {
        filename: 'strategic-partnerships.jpg',
        altText: 'Partnership development and ecosystem diagram',
        caption: 'Strategic partnerships',
      },
      {
        filename: 'scaling-operations.jpg',
        altText: 'Operations scaling and expansion strategy',
        caption: 'Operations scaling strategy',
      },
      {
        filename: 'succession-planning.jpg',
        altText: 'Business succession and continuity planning',
        caption: 'Succession planning',
      },
    ],
  },
];

/**
 * Generate image HTML markup
 */
function generateImageHtml(module: string, image: { filename: string; altText: string; caption?: string }): string {
  // Use relative path for local file viewing (../ goes up from "NRP Folder" to "training-sources")
  const imagePath = `../images/${module}/${image.filename}`;

  return `
<figure class="training-image">
  <img
    src="${imagePath}"
    alt="${image.altText}"
    loading="lazy"
    class="training-module-img"
  />
  ${image.caption ? `<figcaption>${image.caption}</figcaption>` : ''}
</figure>`;
}

/**
 * Inject CSS styles for training images
 */
function generateImageStyles(): string {
  return `
<style>
  .training-image {
    margin: 2rem 0;
    text-align: center;
  }

  .training-module-img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
  }

  .training-module-img:hover {
    transform: scale(1.02);
  }

  .training-image figcaption {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #666;
    font-style: italic;
  }

  @media print {
    .training-module-img {
      max-width: 80%;
      page-break-inside: avoid;
    }
  }
</style>`;
}

/**
 * Process a single training module HTML file
 */
function integrateImagesIntoModule(moduleFilePath: string, mapping: ImageMapping): void {
  console.log(`\n📄 Processing: ${mapping.module}`);

  if (!fs.existsSync(moduleFilePath)) {
    console.log(`   ⚠️  File not found: ${moduleFilePath}`);
    return;
  }

  let htmlContent = fs.readFileSync(moduleFilePath, 'utf-8');

  // Remove old training images section if it exists (for re-integration)
  if (htmlContent.includes('training-images-section')) {
    console.log(`   🔄 Updating existing images...`);
    // Remove old images section
    htmlContent = htmlContent.replace(/<!-- Training Module Images -->[\s\S]*?<!-- End Training Module Images -->\n\n/g, '');
    // Remove old style if exists
    htmlContent = htmlContent.replace(/<style>[\s\S]*?\.training-image \{[\s\S]*?<\/style>\n/g, '');
  }

  // Add CSS styles (always add since we removed old ones above)
  const styleTag = generateImageStyles();
  htmlContent = htmlContent.replace('</head>', `${styleTag}\n</head>`);

  // Generate all image HTML
  const imagesHtml = mapping.images.map(img => generateImageHtml(mapping.module, img)).join('\n');

  // Insert images after the first <h1> or <h2> tag (module title)
  const titleMatch = htmlContent.match(/<h[12][^>]*>.*?<\/h[12]>/i);

  if (titleMatch) {
    const insertPosition = titleMatch.index! + titleMatch[0].length;
    htmlContent =
      htmlContent.slice(0, insertPosition) +
      '\n\n<!-- Training Module Images -->\n<div class="training-images-section">\n' +
      imagesHtml +
      '\n</div>\n<!-- End Training Module Images -->\n\n' +
      htmlContent.slice(insertPosition);
  } else {
    // Fallback: insert at the beginning of body
    htmlContent = htmlContent.replace('<body>', `<body>\n${imagesHtml}\n`);
  }

  // Write updated HTML
  fs.writeFileSync(moduleFilePath, htmlContent, 'utf-8');
  console.log(`   ✅ Integrated ${mapping.images.length} images`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🖼️  Training Module Image Integration');
  console.log('=====================================\n');

  const modulesDir = path.join(process.cwd(), 'apps', 'web', 'public', 'training-sources', 'NRP Folder');

  if (!fs.existsSync(modulesDir)) {
    console.error(`❌ Training modules directory not found: ${modulesDir}`);
    process.exit(1);
  }

  let processedCount = 0;
  let skippedCount = 0;
  let notFoundCount = 0;

  // Process each module
  for (const mapping of IMAGE_MAPPINGS) {
    const moduleFilePath = path.join(modulesDir, mapping.htmlFilename);

    if (!fs.existsSync(moduleFilePath)) {
      console.log(`\n📄 ${mapping.module}: ⚠️  File not found`);
      notFoundCount++;
      continue;
    }

    const beforeSize = fs.statSync(moduleFilePath).size;
    integrateImagesIntoModule(moduleFilePath, mapping);
    const afterSize = fs.statSync(moduleFilePath).size;

    if (afterSize > beforeSize) {
      processedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log('\n=====================================');
  console.log('✅ Integration Complete!');
  console.log(`   Processed: ${processedCount} modules`);
  console.log(`   Skipped (already integrated): ${skippedCount} modules`);
  console.log(`   Not found: ${notFoundCount} modules`);
  console.log('=====================================\n');
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { integrateImagesIntoModule, IMAGE_MAPPINGS };
