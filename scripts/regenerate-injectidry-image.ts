/**
 * Manufacturer-Accurate Injectidry HP60 Image Regeneration
 *
 * This script regenerates the advanced-drying-techniques.jpg image
 * with CORRECT Injectidry equipment colors based on manufacturer research.
 *
 * RESEARCH SOURCES:
 * - https://www.injectidry.com/products/wall-ceiling-cabinet-drying/hp-60-wall-and-ceiling-drying-package/
 * - https://dryitcenter.com/products/injectidry-hp-60-systems-configured-in-floor-drying-package
 *
 * KEY FINDING: Injectidry hoses are SAFETY YELLOW, not red/blue
 *
 * Current Image Issue:
 * - Shows RED and BLUE hoses (INCORRECT)
 * - Should show SAFETY YELLOW hoses (CORRECT)
 *
 * @date 2026-02-06
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Load GEMINI_API_KEY from .env.local
function loadGeminiApiKey(): string {
  const envPath = path.join(process.cwd(), '.env.local');

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/GEMINI_API_KEY\s*=\s*["']?([^"'\n\r]+)["']?/);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return process.env.GEMINI_API_KEY || '';
}

const GEMINI_API_KEY = loadGeminiApiKey();

if (!GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY not found in .env.local or environment');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Manufacturer-Researched Prompt for Injectidry HP60 System
const INJECTIDRY_IMAGE_SPEC = {
  module: 'NRP-016',
  filename: 'advanced-drying-techniques.jpg',
  description: 'Injectidry HP60 wall drying system with manufacturer-accurate SAFETY YELLOW hoses',
  prompt: `Professional photograph of advanced structural drying setup using Injectidry HP60 wall drying system in Australian residential property.

CRITICAL - INJECTIDRY EQUIPMENT COLOURS (VERIFIED FROM MANUFACTURER WEBSITE):
- Main HP60 unit: GREY roto-molded housing with black carrying handle
- ALL Injectidry hoses: SAFETY YELLOW colour (this is absolutely critical)
- Active Hoseline: SAFETY YELLOW 1.5" diameter flexible hose
- Wall tubing: SAFETY YELLOW 3/8" diameter tubing to injection points
- Manifolds: Grey/black plastic with yellow tubing connections
- THIS IS THE ONLY CORRECT COLOUR SCHEME - Injectidry does NOT use red or blue hoses

SCENE: Comprehensive structural drying operation in water-damaged Australian home
- Large open-plan living area with exposed wall cavities
- Timber wall framing visible (Australian residential construction)
- Subfloor access panel showing floor joists
- Multiple professional drying systems working in coordination
- Blue painters tape marking moisture measurement points on walls

INJECTIDRY WALL DRYING SETUP (CENTRAL FOCUS):
- Grey HP60 unit positioned against wall with exposed cavities
- SAFETY YELLOW hoselines connecting to wall injection manifold
- Yellow tubing routed neatly to multiple wall injection points
- Small injection holes (3/16") visible in drywall at stud cavity locations
- Yellow tubing secured with clips along baseboard
- Manifold system distributing air to 6-10 injection points

SUPPORTING EQUIPMENT ARRAY:
- Multiple LGR dehumidifiers (blue units - Dri-Eaz style)
- High-velocity air movers (blue and orange units)
- Thermal imaging camera on tripod for moisture monitoring
- Laptop/tablet on folding table showing drying progress graphs
- Moisture meter and documentation clipboard nearby

AUSTRALIAN RESIDENTIAL SETTING:
- Timber stud framing typical of Australian homes
- Natural lighting from large windows
- Cream/white painted walls (partially exposed)
- Timber or tile flooring
- Professional restoration work area organisation

CAMERA SPECIFICATIONS:
- Wide angle 24mm lens, f/5.6 aperture
- Elevated angle showing complete multi-system setup
- Sharp focus throughout the scene
- Professional documentation photography style

STYLE: industry-standard professional water damage restoration documentation

PHOTOREALISM REQUIREMENTS:
- Injectidry hoses MUST be SAFETY YELLOW (not red, not blue - this is critical)
- Grey HP60 unit clearly visible with yellow hose connections
- All equipment connections must be realistic and properly attached
- No floating or disconnected hoses
- Natural lighting with realistic shadows
- Professional, organised work environment

STRICTLY AVOID:
- Red coloured Injectidry hoses (WRONG COLOUR)
- Blue coloured Injectidry hoses (WRONG COLOUR)
- Any colour other than SAFETY YELLOW for Injectidry tubing
- Kinked or twisted hoses
- Brand logos or text
- People's faces clearly visible
- Cluttered or unprofessional appearance
- Unrealistic equipment connections`,
};

async function regenerateInjectidryImage(): Promise<void> {
  console.log('='.repeat(70));
  console.log('Manufacturer-Accurate Injectidry HP60 Image Regeneration');
  console.log('='.repeat(70));
  console.log('');
  console.log('RESEARCH-BASED CORRECTION:');
  console.log('  Previous: Red and blue hoses (INCORRECT)');
  console.log('  Correct:  SAFETY YELLOW hoses (MANUFACTURER VERIFIED)');
  console.log('');
  console.log('Sources:');
  console.log('  - https://www.injectidry.com/products/');
  console.log('  - https://dryitcenter.com/products/injectidry-hp-60-systems');
  console.log('');

  const outputDir = path.join(
    __dirname,
    '../apps/web/public/training-sources/images',
    INJECTIDRY_IMAGE_SPEC.module
  );

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, INJECTIDRY_IMAGE_SPEC.filename);

  // Backup existing image if it exists
  if (fs.existsSync(outputPath)) {
    const backupPath = path.join(outputDir, 'advanced-drying-techniques.backup.jpg');
    fs.copyFileSync(outputPath, backupPath);
    console.log(`Backed up existing image to: ${backupPath}`);
  }

  console.log('');
  console.log('Generating manufacturer-accurate Injectidry image...');
  console.log('');
  console.log('Key colour requirements:');
  console.log('  - HP60 Unit: GREY roto-molded housing');
  console.log('  - All Hoses: SAFETY YELLOW (critical)');
  console.log('  - Tubing: SAFETY YELLOW 3/8"');
  console.log('');

  try {
    // Use Gemini 3 Pro for image generation
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-image-preview',
    });

    const result = await model.generateContent(INJECTIDRY_IMAGE_SPEC.prompt);

    // Extract image from response
    for (const part of result.response.candidates![0].content.parts) {
      if (part.inlineData) {
        const imageData = Buffer.from(part.inlineData.data, 'base64');
        fs.writeFileSync(outputPath, imageData);
        console.log(`SUCCESS: Generated ${INJECTIDRY_IMAGE_SPEC.filename}`);
        console.log(`Location: ${outputPath}`);
        console.log(`Size: ${(imageData.length / 1024).toFixed(1)} KB`);
        console.log('');
        console.log('VISUAL QA CHECKLIST - Please verify:');
        console.log('  [ ] Injectidry hoses are SAFETY YELLOW (not red/blue)');
        console.log('  [ ] HP60 unit is GREY with black handle');
        console.log('  [ ] Yellow tubing connects to wall injection points');
        console.log('  [ ] All equipment connections are realistic');
        console.log('  [ ] Australian residential setting maintained');
        console.log('  [ ] No brand logos visible');
        return;
      }
    }

    console.error('ERROR: No image data in response');
  } catch (error) {
    console.error('ERROR generating image:', error);
    throw error;
  }
}

// Run the regeneration
regenerateInjectidryImage()
  .then(() => {
    console.log('');
    console.log('='.repeat(70));
    console.log('Injectidry image regeneration complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. View the generated image to verify YELLOW hoses');
    console.log('2. Compare against manufacturer reference images');
    console.log('3. If correct, update generate-training-images.ts');
    console.log('4. Commit changes to repository');
    console.log('='.repeat(70));
  })
  .catch((error) => {
    console.error('Failed to regenerate image:', error);
    process.exit(1);
  });
