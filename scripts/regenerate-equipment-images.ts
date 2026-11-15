/**
 * Manufacturer-Accurate Equipment Image Regeneration
 *
 * This script regenerates equipment-specific training images
 * with manufacturer-researched accurate specifications.
 *
 * Images to regenerate:
 * - NRP-002: moisture-testing-equipment.jpg
 * - NRP-006: dehumidification-equipment.jpg
 * - NRP-007: hepa-filtration-equipment.jpg
 * - NRP-008: air-scrubber-operation.jpg
 * - NRP-011: carpet-cleaning-equipment.jpg
 * - NRP-013: odour-control-equipment.jpg
 * - NRP-015: equipment-fleet-overview.jpg
 * - NRP-016: thermal-imaging-analysis.jpg
 *
 * Manufacturer Research Sources:
 * - Dri-Eaz: dri-eaz.com (BLUE dehumidifiers/air movers)
 * - Phoenix: usephoenix.com (BLUE/RED dehumidifiers)
 * - XPOWER: xpower.com (BLUE air movers)
 * - Abatement Technologies: abatement.com (GALVANIZED STEEL HEPA)
 * - FLIR: flir.com (BLACK thermal cameras)
 * - Tramex: tramexmeters.com (YELLOW/GREEN moisture meters)
 * - International Ozone: (SILVER/GREY hydroxyl generators)
 * - Injectidry: injectidry.com (GREY unit, SAFETY YELLOW hoses)
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

interface ImageSpec {
  module: string;
  filename: string;
  description: string;
  prompt: string;
}

// Equipment images requiring manufacturer-accurate regeneration
const EQUIPMENT_IMAGES: ImageSpec[] = [
  {
    module: 'NRP-002',
    filename: 'moisture-testing-equipment.jpg',
    description: 'Moisture meters and thermal cameras with manufacturer-accurate colours',
    prompt: `Professional product photography of moisture detection and testing equipment used in water damage restoration.

EQUIPMENT COLOURS (MANUFACTURER-VERIFIED):
- Pinless moisture meters: YELLOW/GREEN housing with black buttons (Tramex-style)
- Pin-type moisture meters: GREY/BLACK housing with silver probe tips
- Thermal imaging camera: BLACK housing with small colour LCD display (FLIR-style)
- Digital hygrometer: ORANGE/BLACK or GREY/BLACK housing
- Moisture probes: Silver metal with black rubber handles

EQUIPMENT ARRAY:
- Two pinless moisture meters (one yellow/green, one orange/black)
- One pin-type moisture meter with attached probe
- One handheld thermal imaging camera (black, compact design)
- One digital hygrometer with display
- Spare pin probes and accessories

SETTING: Clean professional workspace, equipment arranged on white surface
LIGHTING: Professional studio lighting, clear visibility of all equipment details
CAMERA: 35mm lens, f/5.6, sharp focus throughout
STYLE: Technical product photography, industrial-grade professional equipment

AVOID: Brand names/logos, people operating equipment, cluttered background`,
  },
  {
    module: 'NRP-006',
    filename: 'dehumidification-equipment.jpg',
    description: 'LGR dehumidifiers and air movers with manufacturer-accurate colours',
    prompt: `Professional product photography of industrial structural drying equipment used in water damage restoration.

EQUIPMENT COLOURS (MANUFACTURER-VERIFIED):
- LGR Dehumidifiers: BLUE rotomolded polyethylene housing (Dri-Eaz style)
- Alternative dehumidifiers: RED rotomolded housing (Phoenix style)
- High-velocity air movers: BLUE polypropylene housing (XPOWER/Dri-Eaz style)
- Alternative air movers: ORANGE housing
- All units have BLACK wheels and BLACK carrying handles
- Control panels: BLACK with LED indicators

EQUIPMENT ARRAY:
- Two large LGR dehumidifiers (BLUE rotomolded housing, wheeled, with control panels)
- Three high-velocity air movers (two BLUE, one ORANGE)
- Condensate hoses (clear plastic)
- Power distribution box with multiple outlets

CRITICAL VISUAL DETAILS:
- Dehumidifiers are boxy with rounded corners (rotomolded construction)
- Air movers have circular fan housings with adjustable angle positions
- Equipment appears rugged and industrial-grade
- Clear condensate collection visible on dehumidifiers

SETTING: Clean professional environment showing equipment array
LIGHTING: Professional lighting showing equipment details clearly
CAMERA: 35mm lens, f/4, clear focus on equipment features
STYLE: Industrial equipment product photography

AVOID: Brand logos, operators, cluttered background, residential-grade equipment`,
  },
  {
    module: 'NRP-007',
    filename: 'hepa-filtration-equipment.jpg',
    description: 'HEPA air scrubbers with manufacturer-accurate colours',
    prompt: `Professional product photography of HEPA air filtration and negative air machines used in mould remediation.

EQUIPMENT COLOURS (MANUFACTURER-VERIFIED):
- Industrial HEPA air scrubbers: GALVANIZED STEEL (silver/grey metal) cabinet (Abatement Technologies style)
- Alternative HEPA units: BLUE rotomolded housing (Dri-Eaz style)
- Negative air machines: GALVANIZED STEEL cabinet with BLACK control panel
- Flexible exhaust ducting: WHITE or CLEAR layflat duct (12" diameter)
- Air quality monitors: BLACK/GREY handheld devices

EQUIPMENT ARRAY:
- One large HEPA negative air machine (GALVANIZED STEEL cabinet, 2000 CFM capacity)
- One portable HEPA air scrubber (BLUE rotomolded housing)
- Coiled WHITE flexible exhaust ducting
- Handheld air quality particle counter (BLACK housing)
- Filter change indicator lights (visible on control panels)

CRITICAL VISUAL DETAILS:
- Galvanized steel units have industrial metal cabinet construction
- Multiple pre-filter and HEPA filter access panels visible
- Heavy-duty casters (BLACK) for mobility
- 12" diameter duct collars on intake/exhaust

SETTING: Clean professional environment showing industrial air filtration equipment
LIGHTING: Professional studio lighting, clear view of filtration features
CAMERA: 35mm lens, f/5.6, sharp detail throughout
STYLE: Industrial safety equipment product photography

AVOID: Brand names/logos, operators, cluttered background`,
  },
  {
    module: 'NRP-008',
    filename: 'air-scrubber-operation.jpg',
    description: 'Air scrubbers in smoke-damaged space with manufacturer-accurate equipment',
    prompt: `Professional photograph of industrial air scrubbers operating in smoke-damaged Australian commercial space.

EQUIPMENT COLOURS (MANUFACTURER-VERIFIED):
- HEPA air scrubbers: GALVANIZED STEEL (silver/grey metal) cabinet OR BLUE rotomolded
- Negative air machines: GALVANIZED STEEL with BLACK control panels
- Thermal foggers: SILVER/CHROME metal body with BLACK handles
- Exhaust ducting: WHITE flexible layflat duct running to windows
- Hydroxyl generators: SILVER/GREY powder-coated steel housing

EQUIPMENT IN SCENE:
- Two HEPA air scrubbers (one GALVANIZED STEEL, one BLUE rotomolded)
- One thermal fogger (SILVER/CHROME metal body)
- WHITE exhaust ducting properly routed to exterior
- Air quality monitoring equipment nearby

SCENE: Equipment operating in smoke-damaged Australian commercial office
- Light smoke/soot staining visible on walls and ceiling
- Professional equipment placement with proper airflow patterns
- Exhaust ducting running to window for negative air pressure
- Organised restoration setup with clear walkways

LIGHTING: Work lights showing equipment operation, natural ambient light from windows
CAMERA: 35mm lens, f/4, showing equipment and setting context
STYLE: industry-standard professional restoration documentation photography

AVOID: Brand logos, operators' faces, active fire, extreme damage, unsafe setups`,
  },
  {
    module: 'NRP-011',
    filename: 'carpet-cleaning-equipment.jpg',
    description: 'Truck-mount carpet cleaning system with industry-standard specifications',
    prompt: `Professional photograph of carpet cleaning and extraction equipment including truck-mount system.

EQUIPMENT SPECIFICATIONS (INDUSTRY-STANDARD):
- Truck-mount system: STAINLESS STEEL/CHROME components mounted in white service van
- Portable extractor: BLUE or GREY rotomolded housing with wheels
- Carpet cleaning wands: STAINLESS STEEL with ergonomic handles
- Solution hoses: HIGH-PRESSURE rated (blue or black)
- Vacuum hoses: Large diameter (2" or greater), typically grey or black

SCENE COMPOSITION:
- White Australian service van with rear doors open
- Truck-mount system visible inside (chrome/stainless components, gauges, hose reels)
- Professional cleaning wands laid out (various sizes)
- Coiled solution and vacuum hoses
- Portable extraction unit nearby (BLUE rotomolded housing)

TRUCK-MOUNT DETAILS:
- Kubota or similar engine (visible but no brand markings)
- Pressure gauges and temperature displays
- Solution tank and recovery tank
- Professional hose reel mounted on unit
- Chrome/stainless steel heat exchanger visible

SETTING: Professional service area or Australian residential driveway
LIGHTING: Natural daylight showing equipment details clearly
CAMERA: 35mm lens, f/5.6, sharp focus on equipment features
STYLE: Professional carpet cleaning industry documentation

AVOID: Brand logos, operators' faces, cluttered background, residential-grade equipment`,
  },
  {
    module: 'NRP-013',
    filename: 'odour-control-equipment.jpg',
    description: 'Hydroxyl generators and ozone equipment with manufacturer-accurate colours',
    prompt: `Professional product photography of odour control and deodorisation equipment used in restoration.

EQUIPMENT COLOURS (MANUFACTURER-VERIFIED):
- Hydroxyl generators: SILVER/GREY powder-coated steel housing (Titan/International Ozone style)
- Ozone generators: BLACK or SILVER metal housing with control panels
- Thermal foggers: SILVER/CHROME metal body with BLACK plastic handles and controls
- HEPA air scrubbers: BLUE rotomolded OR GALVANIZED STEEL cabinet
- Deodorisation chemical containers: WHITE plastic with professional labels

EQUIPMENT ARRAY:
- One hydroxyl generator (SILVER/GREY metal housing, cube-shaped, with front grille)
- One ozone generator (BLACK or SILVER housing with timer controls)
- One thermal fogger (SILVER/CHROME metal canister with BLACK handle)
- One HEPA air scrubber (BLUE rotomolded housing)
- Professional deodorisation chemicals in white containers

CRITICAL VISUAL DETAILS:
- Hydroxyl generator has visible UV lamp housing and air intake grille
- Ozone generator shows timer/control panel
- Thermal fogger has distinctive canister shape with nozzle
- All equipment appears industrial-grade and professional

SETTING: Clean professional environment, equipment arranged for clear visibility
LIGHTING: Professional studio lighting, clear view of all equipment features
CAMERA: 35mm lens, f/5.6, sharp focus throughout
STYLE: Industrial odour control equipment product photography

AVOID: Brand logos, operators, cluttered background, active operation in occupied spaces`,
  },
  {
    module: 'NRP-015',
    filename: 'equipment-fleet-overview.jpg',
    description: 'Complete restoration equipment fleet with manufacturer-accurate colours',
    prompt: `Professional photograph of complete water damage restoration equipment fleet display.

EQUIPMENT COLOURS (MANUFACTURER-VERIFIED):
- LGR Dehumidifiers: BLUE rotomolded housing (Dri-Eaz style) - 4 units
- Alternative dehumidifiers: RED rotomolded housing (Phoenix style) - 2 units
- High-velocity air movers: BLUE polypropylene housing - 8 units
- Alternative air movers: ORANGE housing - 4 units
- HEPA air scrubbers: GALVANIZED STEEL cabinet - 2 units
- Moisture meters: YELLOW/GREEN (Tramex) and ORANGE/BLACK (Protimeter) - multiple
- Thermal camera: BLACK housing (FLIR style) - 1 unit
- Injectidry wall drying: GREY unit with SAFETY YELLOW hoses - 1 unit

EQUIPMENT FLEET ARRAY:
- Row 1: Six LGR dehumidifiers (4 BLUE, 2 RED) arranged in line
- Row 2: Twelve air movers (8 BLUE, 4 ORANGE) stacked or arranged
- Row 3: Two GALVANIZED STEEL HEPA air scrubbers
- Row 4: Tool case with moisture meters, thermal camera, and accessories
- Row 5: Injectidry wall drying system with coiled YELLOW hoses

ARRANGEMENT: Professional fleet display showing full service capability
- Equipment arranged by type in organised rows
- All equipment clean and well-maintained
- Clear spacing between equipment for visibility

SETTING: Clean warehouse with concrete floor, professional service area
LIGHTING: Professional overhead lighting showing all equipment clearly
CAMERA: Wide angle 24mm, f/8, everything in sharp focus
STYLE: Professional equipment fleet photography for business documentation

AVOID: Brand logos, operators, cluttered presentation, damaged equipment`,
  },
  {
    module: 'NRP-016',
    filename: 'thermal-imaging-analysis.jpg',
    description: 'FLIR-style thermal camera showing moisture detection',
    prompt: `Professional photograph of thermal imaging moisture detection using professional-grade equipment.

EQUIPMENT COLOURS (MANUFACTURER-VERIFIED):
- Thermal imaging camera: BLACK housing with small colour LCD display (FLIR style)
- Camera body: Compact BLACK plastic housing with rubberised grip
- Display screen: 3-4 inch colour LCD showing thermal image
- Tripod: BLACK aluminium or carbon fibre

THERMAL DISPLAY SPECIFICATIONS:
- Colour palette: IRON palette (purple/blue for cold, orange/yellow/white for warm)
- Alternative: RAINBOW palette showing full colour spectrum
- Moisture areas appear as COOLER (purple/blue) regions against warmer (orange/red) surroundings
- Temperature scale visible on side of display
- Clear delineation between wet and dry areas

SCENE COMPOSITION:
- BLACK thermal camera mounted on tripod or held by gloved hands (hands only visible)
- Camera display showing thermal image of Australian wall with moisture patterns
- Wall visible in background matching thermal image
- Moisture pattern clearly visible (cool blue area indicating wet region)

SETTING: Australian property interior, professional moisture investigation in progress
LIGHTING: Normal room lighting, thermal camera display clearly visible
CAMERA: Mid-range 50mm, f/4, showing thermal imaging device and its display
STYLE: Professional building diagnostic photography for industry-standard documentation

AVOID: Brand names on equipment, people's faces, real property addresses, extreme damage`,
  },
];

async function regenerateImage(spec: ImageSpec, outputDir: string): Promise<boolean> {
  const moduleDir = path.join(outputDir, spec.module);
  const outputPath = path.join(moduleDir, spec.filename);

  // Backup existing image
  if (fs.existsSync(outputPath)) {
    const backupPath = path.join(moduleDir, spec.filename.replace('.jpg', '.backup.jpg'));
    fs.copyFileSync(outputPath, backupPath);
    console.log(`  Backed up: ${backupPath}`);
  }

  console.log(`\n  Generating with manufacturer-accurate specifications...`);

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-image-preview',
    });

    const result = await model.generateContent(spec.prompt);

    for (const part of result.response.candidates![0].content.parts) {
      if (part.inlineData) {
        const imageData = Buffer.from(part.inlineData.data, 'base64');

        // Ensure directory exists
        if (!fs.existsSync(moduleDir)) {
          fs.mkdirSync(moduleDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, imageData);
        console.log(`  SUCCESS: ${spec.filename} (${(imageData.length / 1024).toFixed(1)} KB)`);
        return true;
      }
    }

    console.error('  ERROR: No image data in response');
    return false;
  } catch (error) {
    console.error(`  ERROR: ${error}`);
    return false;
  }
}

async function regenerateAllEquipmentImages(): Promise<void> {
  console.log('='.repeat(70));
  console.log('Manufacturer-Accurate Equipment Image Regeneration');
  console.log('='.repeat(70));
  console.log('');
  console.log('This script regenerates equipment images with verified manufacturer colours:');
  console.log('');
  console.log('  - Dri-Eaz dehumidifiers/air movers: BLUE rotomolded');
  console.log('  - Phoenix dehumidifiers: BLUE or RED rotomolded');
  console.log('  - XPOWER air movers: BLUE polypropylene');
  console.log('  - Abatement HEPA scrubbers: GALVANIZED STEEL (silver/grey)');
  console.log('  - FLIR thermal cameras: BLACK housing');
  console.log('  - Tramex moisture meters: YELLOW/GREEN housing');
  console.log('  - Titan hydroxyl generators: SILVER/GREY steel');
  console.log('  - Injectidry: GREY unit with SAFETY YELLOW hoses');
  console.log('');

  const outputDir = path.join(
    __dirname,
    '../apps/web/public/training-sources/images'
  );

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < EQUIPMENT_IMAGES.length; i++) {
    const spec = EQUIPMENT_IMAGES[i];
    console.log(`\n[${i + 1}/${EQUIPMENT_IMAGES.length}] ${spec.module}/${spec.filename}`);
    console.log(`  ${spec.description}`);

    const success = await regenerateImage(spec, outputDir);

    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Rate limiting: wait 8 seconds between generations
    if (i < EQUIPMENT_IMAGES.length - 1) {
      console.log('  Waiting 8 seconds (rate limit)...');
      await new Promise(resolve => setTimeout(resolve, 8000));
    }
  }

  console.log('');
  console.log('='.repeat(70));
  console.log('Regeneration Complete!');
  console.log(`  Total: ${EQUIPMENT_IMAGES.length} images`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log('');
  console.log('VISUAL QA CHECKLIST - Verify each image shows:');
  console.log('  [ ] Correct equipment colours per manufacturer specs');
  console.log('  [ ] Professional-grade industrial equipment');
  console.log('  [ ] No brand logos visible');
  console.log('  [ ] Realistic equipment connections');
  console.log('  [ ] Australian context maintained');
  console.log('='.repeat(70));
}

// Run the regeneration
regenerateAllEquipmentImages()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
