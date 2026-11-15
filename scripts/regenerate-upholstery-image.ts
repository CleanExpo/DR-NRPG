/**
 * Industry-Standard Upholstery Cleaning Image Regeneration
 *
 * This script regenerates ONLY the upholstery-cleaning-process.jpg image
 * with an IICRC UFT (Upholstery & Fabric Cleaning Technician) compliant prompt.
 *
 * Issue: Original image showed carpet-style extraction wand instead of
 * the proper upholstery hand wand with soft bristle head.
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

// Industry-Standard Prompt for Upholstery Cleaning
const UPHOLSTERY_IMAGE_SPEC = {
  module: 'NRP-011',
  filename: 'upholstery-cleaning-process.jpg',
  description: 'industry-standard upholstery steam cleaning with proper hand wand',
  prompt: `Professional photograph of upholstery steam cleaning in progress on Australian furniture.

SCENE REQUIREMENTS:
Professional technician's hands using an UPHOLSTERY STEAM CLEANING HAND WAND on a fabric sofa or lounge chair in an Australian residential home.

CRITICAL EQUIPMENT - MUST BE VISIBLE:
1. UPHOLSTERY HAND WAND/TOOL - Compact upholstery-specific cleaning tool with:
   - Soft bristle head attachment (NOT a wide carpet wand)
   - Small rectangular or triangular head design (approximately 10-15cm wide)
   - Clear transparent or semi-transparent head showing extraction slots
2. Steam extraction hose connected to the hand wand
3. Pre-spray solution bottle visible nearby on protective sheeting
4. Portable extraction unit or visible hose connection to truck-mount system

TECHNIQUE REQUIREMENTS:
- Hand wand held at proper 15-30 degree angle against upholstery fabric
- Visible systematic overlapping stroke pattern on the sofa/chair
- Light moisture visible on fabric indicating active steam extraction
- Technician wearing nitrile gloves (blue or black)
- No face visible - only hands and arms in frame

SETTING:
- Clean Australian residential interior
- Natural window lighting supplemented by work lights
- Blue or clear protective plastic sheeting under furniture
- Professional, organised workspace appearance

FURNITURE:
- Modern Australian-style fabric sofa or lounge chair
- Light-coloured upholstery (beige, grey, or light blue)
- Visible cleaning progress showing cleaned vs uncleaned areas

CAMERA:
- Mid-range 50mm lens, f/4 aperture
- Sharp focus on the upholstery hand wand and cleaning technique
- Slightly elevated angle showing the wand, fabric, and technique clearly

STYLE: industry-standard professional upholstery cleaning service documentation

ABSOLUTE REQUIREMENTS:
- MUST show compact UPHOLSTERY-SPECIFIC hand tool (NOT wide carpet wand)
- MUST show steam extraction method with visible hose connection
- MUST show proper 15-30 degree wand angle professional technique
- Technician hands visible performing work, face NOT visible
- Professional gloves worn

STRICTLY AVOID:
- Wide carpet cleaning wands (these are 30-40cm wide floor tools)
- Floor-style extraction tools used on furniture
- Dry cleaning or spray-only methods
- Amateur or incorrect technique angles
- Any brand logos, text, or identifiable trademarks
- People's faces clearly visible
- Generic stock photo appearance
- Residential-grade or consumer equipment`,
};

async function regenerateUpholsteryImage(): Promise<void> {
  console.log('='.repeat(70));
  console.log('Industry-Standard Upholstery Image Regeneration');
  console.log('='.repeat(70));
  console.log('');
  console.log('Issue: Original image showed carpet-style wand instead of upholstery hand wand');
  console.log('Standard: recognised industry practice for upholstery and fabric cleaning');
  console.log('');

  const outputDir = path.join(
    __dirname,
    '../apps/web/public/training-sources/images',
    UPHOLSTERY_IMAGE_SPEC.module
  );

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, UPHOLSTERY_IMAGE_SPEC.filename);

  // Backup existing image if it exists
  if (fs.existsSync(outputPath)) {
    const backupPath = path.join(outputDir, 'upholstery-cleaning-process.backup.jpg');
    fs.copyFileSync(outputPath, backupPath);
    console.log(`Backed up existing image to: ${backupPath}`);
  }

  console.log('');
  console.log('Generating industry-standard upholstery cleaning image...');
  console.log('');

  try {
    // Use Gemini 3 Pro for image generation (matching original script)
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-image-preview', // Nano Banana Pro
    });

    const result = await model.generateContent(UPHOLSTERY_IMAGE_SPEC.prompt);

    // Extract image from response
    for (const part of result.response.candidates![0].content.parts) {
      if (part.inlineData) {
        const imageData = Buffer.from(part.inlineData.data, 'base64');
        fs.writeFileSync(outputPath, imageData);
        console.log(`SUCCESS: Generated ${UPHOLSTERY_IMAGE_SPEC.filename}`);
        console.log(`Location: ${outputPath}`);
        console.log(`Size: ${(imageData.length / 1024).toFixed(1)} KB`);
        console.log('');
        console.log('Image regenerated with industry-standard specifications:');
        console.log('  - Upholstery-specific hand wand with soft bristle head');
        console.log('  - Proper 15-30 degree technique angle');
        console.log('  - Steam extraction method visible');
        console.log('  - Professional gloves and technique');
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
regenerateUpholsteryImage()
  .then(() => {
    console.log('');
    console.log('='.repeat(70));
    console.log('Upholstery image regeneration complete!');
    console.log('='.repeat(70));
  })
  .catch((error) => {
    console.error('Failed to regenerate image:', error);
    process.exit(1);
  });
