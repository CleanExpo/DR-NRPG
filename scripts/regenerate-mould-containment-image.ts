/**
 * Industry-Standard Mould Containment Image Regeneration
 *
 * This script regenerates ONLY the mould-containment-setup.jpg image
 * with an industry-standard prompt that emphasizes:
 * - Realistic equipment connections (no kinked ducting)
 * - Properly attached hoses between machines
 * - Professional mould remediation setup
 *
 * Issue: Original image showed kinked ducting not properly attached
 * between machines - unrealistic equipment connections.
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

// Industry-Standard Prompt for Mould Containment Setup
const MOULD_CONTAINMENT_IMAGE_SPEC = {
  module: 'NRP-007',
  filename: 'mould-containment-setup.jpg',
  description: 'Industry-standard mould remediation containment with realistic equipment connections',
  prompt: `Professional photograph of mould remediation containment setup in Australian residential property.

SCENE: Professional mould containment with HEPA air scrubbers and negative air setup in an Australian home.

CRITICAL EQUIPMENT REALISM REQUIREMENTS (HIGHEST PRIORITY):
- All flexible ducting must be STRAIGHT and properly tensioned - ABSOLUTELY NO KINKS or bends
- Every duct must be SECURELY ATTACHED to equipment intake/exhaust ports with visible clamps or tape
- Negative air machine exhaust duct must run DIRECTLY to window with proper seal
- HEPA air scrubber connections must show professional sealed fittings
- Ducting must follow realistic physics - properly supported, not floating in mid-air
- All hose connections must show where they attach to machines - no disconnected ends
- Ducting must have natural tension and slight curves (not tight angles)

CONTAINMENT SETUP (INDUSTRY STANDARD):
- 6 mil polyethylene sheeting barriers from floor to ceiling
- Zipper door access points with proper sealing tape around edges
- Clear poly sheeting with visible seams taped professionally
- CAUTION or DANGER signage clearly visible (mould remediation warning)
- Evidence of negative pressure (slight inward bow of plastic sheeting)

EQUIPMENT ARRAY (PROFESSIONAL GRADE):
- HEPA air scrubber (minimum 500 CFM capacity) with ducting ATTACHED
- Negative air machine with exhaust running to window/exterior
- Air movers for circulation within containment
- All equipment positioned professionally with clear purpose

LIGHTING AND SETTING:
- Australian residential interior (weatherboard or brick home)
- Natural window light supplemented by professional work lights
- Clean, organised professional setup appearance
- Blue or clear protective floor covering visible

CAMERA SPECIFICATIONS:
- Wide-angle 24mm lens, f/8 aperture for depth of field
- Showing complete containment system in frame
- Slightly elevated angle to show equipment layout
- Sharp focus throughout the scene

STYLE: industry-standard professional mould remediation documentation photography

PHOTOREALISM CHECKLIST (MUST PASS):
- [ ] All equipment connections are physically realistic and complete
- [ ] Ducting shows proper attachment points with visible clamps/tape
- [ ] Hoses follow gravity and natural tension - no floating sections
- [ ] No impossible bends, kinks, or kinked sections in any ducting
- [ ] Lighting is consistent throughout the image
- [ ] Shadows are realistic and properly placed
- [ ] Equipment proportions match real-world specifications
- [ ] Australian context maintained (architecture, fittings)

STRICTLY AVOID:
- Kinked, bent, or twisted ducting (CRITICAL - this was the original issue)
- Disconnected or floating hoses not attached to equipment
- Unrealistic equipment connections
- Visible mould growth (health hazard in photos)
- People's faces clearly visible
- Brand logos or identifiable trademarks
- Unsafe practices or messy setup
- Horror aesthetic or exaggerated damage
- Generic stock photo appearance`,
};

async function regenerateMouldContainmentImage(): Promise<void> {
  console.log('='.repeat(70));
  console.log('Industry-Standard Mould Containment Image Regeneration');
  console.log('='.repeat(70));
  console.log('');
  console.log('Issue: Original image showed kinked ducting not properly attached');
  console.log('');

  const outputDir = path.join(
    __dirname,
    '../apps/web/public/training-sources/images',
    MOULD_CONTAINMENT_IMAGE_SPEC.module
  );

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, MOULD_CONTAINMENT_IMAGE_SPEC.filename);

  // Backup existing image if it exists
  if (fs.existsSync(outputPath)) {
    const backupPath = path.join(outputDir, 'mould-containment-setup.backup.jpg');
    fs.copyFileSync(outputPath, backupPath);
    console.log(`Backed up existing image to: ${backupPath}`);
  }

  console.log('');
  console.log('Generating industry-standard mould containment image...');
  console.log('');
  console.log('Key improvements in this regeneration:');
  console.log('  - STRAIGHT ducting (no kinks)');
  console.log('  - Properly ATTACHED connections with visible clamps/tape');
  console.log('  - Realistic equipment connections following physics');
  console.log('  - Professional Australian residential setting');
  console.log('');

  try {
    // Use Gemini 3 Pro for image generation
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-image-preview',
    });

    const result = await model.generateContent(MOULD_CONTAINMENT_IMAGE_SPEC.prompt);

    // Extract image from response
    for (const part of result.response.candidates![0].content.parts) {
      if (part.inlineData) {
        const imageData = Buffer.from(part.inlineData.data, 'base64');
        fs.writeFileSync(outputPath, imageData);
        console.log(`SUCCESS: Generated ${MOULD_CONTAINMENT_IMAGE_SPEC.filename}`);
        console.log(`Location: ${outputPath}`);
        console.log(`Size: ${(imageData.length / 1024).toFixed(1)} KB`);
        console.log('');
        console.log('Image regenerated with industry-standard specifications:');
        console.log('  - Straight, properly tensioned ducting (NO KINKS)');
        console.log('  - Securely attached equipment connections');
        console.log('  - Professional containment barriers');
        console.log('  - Negative air setup with exhaust to exterior');
        console.log('');
        console.log('VISUAL QA CHECKLIST - Please verify:');
        console.log('  [ ] No kinked or bent ducting visible');
        console.log('  [ ] All hoses attached to equipment (no floating ends)');
        console.log('  [ ] Realistic equipment connections');
        console.log('  [ ] Professional containment appearance');
        console.log('  [ ] Australian context maintained');
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
regenerateMouldContainmentImage()
  .then(() => {
    console.log('');
    console.log('='.repeat(70));
    console.log('Mould containment image regeneration complete!');
    console.log('='.repeat(70));
  })
  .catch((error) => {
    console.error('Failed to regenerate image:', error);
    process.exit(1);
  });
