#!/usr/bin/env node

/**
 * Generate Professional Icons - Option A: Modern SaaS
 *
 * Creates professional, thin-line gradient art icons for:
 * - Service categories (Water, Fire, Mold, Bio)
 * - Trust badges (Qualified, Verified, Insured)
 * - Action icons (Emergency, Call, Chat, Schedule)
 *
 * Style: Thin gradient line art (NOT playful/toy aesthetic)
 * Following ICON_STYLE_GUIDE.md Option A
 */

const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Read API key from .env.local
let GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envMatch = envContent.match(/GEMINI_API_KEY=(.+)/);
    if (envMatch) {
      GEMINI_API_KEY = envMatch[1].trim();
    }
  } catch (err) {
    console.error('❌ Could not read .env.local');
  }
}

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not found');
  process.exit(1);
}

// Icon definitions - PHOTOREALISTIC 3D RENDERED IMAGES (PNG/JPEG)
// NOT SVG! These generate actual rendered images with photorealism
const ICONS_TO_GENERATE = [
  {
    name: 'water-damage',
    category: 'Service Icon',
    basePrompt: `Generate a professional photorealistic 3D rendered icon for 'Water Damage Restoration'.

Style: High-quality 3D CGI render with photorealistic lighting and materials.

Composition:
- Center: A two-story residential house (white exterior with black trim/windows) partially submerged in realistic water
- The house shows clear water damage - water level approximately 40% up the structure
- Water: Realistic blue water with wave textures and splashes, showing depth and movement
- Sky: Dark teal/navy gradient background suggesting crisis situation
- Framing: The icon is contained within a rounded rectangle frame with subtle border
- Subtle atmospheric elements: Water droplets, mist effects

Technical Requirements:
- Photorealistic 3D rendering quality
- Professional studio lighting with rim light on the house
- Realistic water physics and reflections
- High contrast and clarity
- PNG format, transparent background
- 512x512px canvas with padding for the frame
- Color palette: Blues (#0047FF, #00BFA6), whites, dark navy background

Mood: Professional, serious, showing the severity of water damage
Quality: Production-ready, suitable for SaaS dashboard
Constraint: NO cartoon style, NO vector graphics, NO SVG code. Must be rendered photorealistic 3D image.`,
  },
  {
    name: 'fire-smoke',
    category: 'Service Icon',
    basePrompt: `Generate a professional photorealistic 3D rendered icon for 'Fire Damage Restoration'.

Style: High-quality 3D CGI render with photorealistic lighting and materials.

Composition:
- Center: A two-story residential house (white exterior with black trim/windows) engulfed in intense orange and red flames
- The house shows clear fire damage - flames rising dramatically from the roof and walls
- Flames: Realistic orange to red flames with flickering details, realistic fire geometry and heat effects
- Smoke: Dark grey to black smoke billowing upward from the burning structure, volumetric movement
- Sky: Dark navy/teal gradient background showing nighttime crisis
- Workers: One or two professional firefighters or restoration workers visible (silhouette or suited), suggesting emergency response
- Equipment: Fire hoses or emergency equipment suggesting active response
- Framing: The icon is contained within a rounded rectangle frame with subtle border
- Atmospheric: Glow effects from fire, heat distortion, embers

Technical Requirements:
- Photorealistic 3D rendering quality
- Professional lighting with warm orange glow from flames and rim light on house
- Realistic fire physics and smoke dynamics
- High contrast and clarity
- PNG format, transparent or dark background
- 512x512px canvas with padding for the frame
- Color palette: Orange (#F59E0B), Red (#DC2626), dark greys, dark navy background

Mood: Urgent, serious, showing active fire crisis
Quality: Production-ready, suitable for SaaS dashboard
Constraint: NO cartoon style, NO vector graphics, NO SVG code. Must be rendered photorealistic 3D image with realistic fire and smoke.`,
  },
  {
    name: 'mould-remediation',
    category: 'Service Icon',
    basePrompt: `Generate a professional photorealistic 3D rendered icon for 'Mould Remediation'.

Style: High-quality 3D CGI render with photorealistic lighting and materials.

Composition:
- Center: A two-story residential house (white exterior with black trim/windows) showing dark mould patches and discoloration across walls
- Mould: Visible dark green/black mould growth spreading across exterior walls and foundation, realistic contamination patterns
- Remediation: Professional remediation workers in protective equipment (suits, masks, respirators) using cleaning equipment and spray systems
- Equipment: HEPA filters, spray equipment, containment barriers visible in the scene
- Sky: Dark navy/teal gradient background suggesting damp crisis conditions
- Framing: The icon is contained within a rounded rectangle frame with subtle border
- Atmospheric: Mist or spray effects from remediation equipment, professional containment setup

Technical Requirements:
- Photorealistic 3D rendering quality
- Professional lighting with clinical blue-green tones highlighting the remediation process
- Realistic mould texture and professional equipment detail
- High contrast and clarity
- PNG format, transparent or dark background
- 512x512px canvas with padding for the frame
- Color palette: Dark green (#10b981), Teal (#00BFA6), whites, dark navy background

Mood: Professional, clinical, showing expert remediation solution
Quality: Production-ready, suitable for SaaS dashboard
Constraint: NO cartoon style, NO vector graphics, NO SVG code. Must be rendered photorealistic 3D image showing professional mould remediation.`,
  },
  {
    name: 'bio-forensic',
    category: 'Service Icon',
    basePrompt: `Generate a professional photorealistic 3D rendered icon for 'Bio-Forensic Cleaning'.

Style: High-quality 3D CGI render with photorealistic lighting and materials.

Composition:
- Center: Interior crime scene or biohazard situation showing professional containment and cleaning
- Scene: Dark room with biohazard warning signs, forensic markers, evidence tape visible
- Workers: Professional forensic cleaning team in full protective gear (hazmat suits, respirators, goggles) performing specialized cleaning with professional equipment
- Equipment: HEPA vacuums, specialized cleaning agents, biohazard containment equipment, sterilization gear visible
- Contamination: Evidence of biohazard (represented clinically, not graphically) being professionally remediated
- Sky/Background: Dark navy background with clinical lighting suggesting sterile professional environment
- Framing: The icon is contained within a rounded rectangle frame with subtle border
- Atmospheric: Professional sterilization glow, clinical lighting, evidence of expertise and precision

Technical Requirements:
- Photorealistic 3D rendering quality
- Professional lighting with scientific clinical tones (cool blues, purples) suggesting sterilization
- Realistic equipment and protective gear detail
- High contrast and clarity
- PNG format, transparent or dark background
- 512x512px canvas with padding for the frame
- Color palette: Purple (#8b5cf6), Blue (#0047FF), whites, dark navy background

Mood: Professional, scientific, showing specialized expertise and complete scene restoration
Quality: Production-ready, suitable for SaaS dashboard
Constraint: NO cartoon style, NO vector graphics, NO SVG code. Must be rendered photorealistic 3D image showing professional forensic cleaning scene.`,
  },
  {
    name: 'iicrc-badge',
    category: 'Trust Badge',
    basePrompt: `Generate a professional photorealistic 3D rendered certification badge for 'Qualified Contractor'.

Style: High-quality 3D CGI rendered badge with photorealistic lighting and premium materials.

Composition:
- Center: A professional shield or seal badge shape (matte finish, geometric edges)
- Badge Body: Primary blue (#0047FF) with gold (#FFD700) certification ribbons and accents
- Certification Details: Official qualification markings, "CERTIFIED" text clearly visible
- Ribbons: Gold certification ribbons wrapping around the shield with official seal appearance
- Lighting: Professional rim lighting creating depth and premium appearance
- Background: Dark navy gradient background (#111827)
- Framing: Contained within a rounded rectangle frame with subtle border
- Atmospheric: Subtle volumetric rays or glow effects suggesting authority and trustworthiness

Technical Requirements:
- Photorealistic 3D rendering quality
- Premium matte finish with satin lustre (not glossy plastic)
- Professional lighting with rim light on the badge
- Hard, defined edges with slight filleting
- High contrast and clarity
- PNG format, transparent or dark background
- 512x512px canvas with padding for the frame
- Color palette: Blue (#0047FF), Gold (#FFD700), dark navy background

Mood: Professional, authoritative, institutional trust signal
Quality: Production-ready, suitable for SaaS dashboard trust badge display
Constraint: NO cartoon style, NO vector graphics, NO SVG code. Must be rendered photorealistic 3D badge showing premium certification authority.`,
  },
  {
    name: 'verified-badge',
    category: 'Trust Badge',
    basePrompt: `Generate a professional photorealistic 3D rendered verification badge for 'Verified Professional'.

Style: High-quality 3D CGI rendered badge with photorealistic lighting and premium materials.

Composition:
- Center: A professional badge or shield shape (matte finish, geometric edges)
- Badge Body: Green (#10b981) to Teal (#00BFA6) gradient coloring
- Verification Mark: A large, prominent checkmark rendered in vibrant green/teal emerging from the badge
- Checkmark Details: Geometric precision, clean lines showing validation and confirmation
- Lighting: Professional rim lighting creating depth and verification authority
- Background: Dark navy gradient background (#111827)
- Framing: Contained within a rounded rectangle frame with subtle border
- Atmospheric: Subtle verification glow or confidence rays suggesting professional validation

Technical Requirements:
- Photorealistic 3D rendering quality
- Premium matte finish with satin lustre (not glossy plastic)
- Professional lighting with rim light on the badge
- Hard, defined edges with slight filleting
- High contrast and clarity
- PNG format, transparent or dark background
- 512x512px canvas with padding for the frame
- Color palette: Green (#10b981), Teal (#00BFA6), dark navy background

Mood: Professional, validating, confirming trustworthiness
Quality: Production-ready, suitable for SaaS dashboard verification badge display
Constraint: NO cartoon style, NO vector graphics, NO SVG code. Must be rendered photorealistic 3D badge showing professional verification and validation.`,
  },
  {
    name: 'emergency-alert',
    category: 'Action Icon',
    basePrompt: `Generate a professional photorealistic 3D rendered icon for 'Emergency Alert'.

Style: High-quality 3D CGI render with photorealistic lighting and urgent visual impact.

Composition:
- Center: A large alert/warning symbol - triangle or exclamation mark rendered with sharp, angular precision
- Alert Base: Orange (#F59E0B) to Red (#DC2626) gradient coloring showing maximum urgency
- Emergency Elements: Flashing warning lights, emergency beacon effects, red alert pulsing animations represented visually
- Background: Dark navy background (#111827) creating high contrast
- Framing: Contained within a rounded rectangle frame with subtle border
- Atmospheric: Urgent glow effects, warning light pulses, emergency response indication

Technical Requirements:
- Photorealistic 3D rendering quality
- Professional lighting with urgent amber and red highlights suggesting crisis
- Sharp, angular precision with minimal soft edges (convey urgency)
- High contrast and maximum clarity
- PNG format, transparent or dark background
- 512x512px canvas with padding for the frame
- Color palette: Orange (#F59E0B), Red (#DC2626), dark navy background

Mood: Maximum urgency, commanding immediate attention, crisis alert
Quality: Production-ready, suitable for SaaS dashboard emergency notification
Constraint: NO cartoon style, NO vector graphics, NO SVG code. Must be rendered photorealistic 3D icon showing urgent emergency alert with maximum impact.`,
  },
  {
    name: 'phone-call',
    category: 'Action Icon',
    basePrompt: `Generate a professional photorealistic 3D rendered icon for 'Phone Support'.

Style: High-quality 3D CGI render with photorealistic lighting and communication emphasis.

Composition:
- Center: A modern phone handset or telephone receiver rendered with geometric precision
- Phone: Teal (#00BFA6) to Blue (#0047FF) gradient coloring
- Communication: Visible sound waves or signal rings emanating from the phone outward
- Waves: Concentric communication waves/signal rings showing active connection
- Background: Dark navy background (#111827) creating professional appearance
- Framing: Contained within a rounded rectangle frame with subtle border
- Atmospheric: Professional communication glow, active connection signals, outreach indication

Technical Requirements:
- Photorealistic 3D rendering quality
- Premium matte finish with satin lustre
- Professional lighting with cool communication tones (blues, teals)
- Hard, defined edges with slight filleting
- High contrast and clarity
- PNG format, transparent or dark background
- 512x512px canvas with padding for the frame
- Color palette: Teal (#00BFA6), Blue (#0047FF), dark navy background

Mood: Professional, accessible, suggesting active helpful communication
Quality: Production-ready, suitable for SaaS dashboard support action button
Constraint: NO cartoon style, NO vector graphics, NO SVG code. Must be rendered photorealistic 3D icon showing professional phone support capability.`,
  },
  {
    name: 'chat-message',
    category: 'Action Icon',
    basePrompt: `Generate a professional photorealistic 3D rendered icon for 'Chat Support'.

Style: High-quality 3D CGI render with photorealistic lighting and interactive communication emphasis.

Composition:
- Center: A modern speech bubble or message window shape with clean geometric lines
- Bubble: Blue (#0047FF) to Purple (#8b5cf6) gradient coloring
- Messages: Visible message text lines or conversation patterns inside and around the bubble showing dialogue
- Conversation: Multiple message indicators suggesting interactive back-and-forth communication
- Background: Dark navy background (#111827) creating modern appearance
- Framing: Contained within a rounded rectangle frame with subtle border
- Atmospheric: Interactive communication glow, dialogue indicators, active engagement signals

Technical Requirements:
- Photorealistic 3D rendering quality
- Premium matte finish with satin lustre
- Professional lighting with cool interactive tones (blues, purples)
- Hard, defined edges with slight filleting
- High contrast and clarity
- PNG format, transparent or dark background
- 512x512px canvas with padding for the frame
- Color palette: Blue (#0047FF), Purple (#8b5cf6), dark navy background

Mood: Professional, modern, suggesting active helpful dialogue and engagement
Quality: Production-ready, suitable for SaaS dashboard chat support action button
Constraint: NO cartoon style, NO vector graphics, NO SVG code. Must be rendered photorealistic 3D icon showing professional chat support communication.`,
  },
  {
    name: 'schedule-calendar',
    category: 'Action Icon',
    basePrompt: `Generate a professional photorealistic 3D rendered icon for 'Schedule Appointment'.

Style: High-quality 3D CGI render with photorealistic lighting and scheduling organization emphasis.

Composition:
- Center: A modern calendar grid or appointment scheduler rendered with geometric precision
- Calendar: Blue (#0047FF) to Teal (#00BFA6) gradient coloring
- Scheduling: Visible calendar dates, time indicators, appointment checkmarks showing organization
- Dates: Clear date selectors and time scheduling elements indicating professional appointment management
- Background: Dark navy background (#111827) creating organized appearance
- Framing: Contained within a rounded rectangle frame with subtle border
- Atmospheric: Professional scheduling glow, time indicators, planning and forward-movement signals

Technical Requirements:
- Photorealistic 3D rendering quality
- Premium matte finish with satin lustre
- Professional lighting with cool organizational tones (blues, teals)
- Hard, defined edges with slight filleting
- High contrast and clarity
- PNG format, transparent or dark background
- 512x512px canvas with padding for the frame
- Color palette: Blue (#0047FF), Teal (#00BFA6), dark navy background

Mood: Professional, organized, suggesting efficient appointment scheduling and time management
Quality: Production-ready, suitable for SaaS dashboard appointment scheduling action button
Constraint: NO cartoon style, NO vector graphics, NO SVG code. Must be rendered photorealistic 3D icon showing professional calendar appointment scheduling.`,
  },
];

async function generateIcon(iconDef) {
  console.log(`⏳ Generating: ${iconDef.name} (${iconDef.category})...`);

  const prompt = `Generate a professional photorealistic 3D rendered image icon following these specifications:

${iconDef.basePrompt}

CRITICAL CONSTRAINTS (Apply to ALL):
- NO vector graphics, NO SVG code, NO geometric shapes only
- NO SVG output, NO code output - MUST be PNG/JPEG image
- NO claymorphism, soft 3D, inflated shapes
- NO emojis, cartoonish styles, playful aesthetics
- NO rounded blobs, toy textures, cute features
- YES: Photorealistic 3D CGI render
- YES: Sharp edges, precision, professional mood
- YES: Industrial, serious, trusted appearance
- YES: High contrast, technical clarity
- YES: Professional lighting and realistic materials

This is for a professional disaster recovery platform. The aesthetic must be enterprise-grade photorealistic 3D rendering, not vector graphics or playful designs.

OUTPUT ONLY: Generate as a PNG/JPEG image. Do not output code or text. Generate the actual image.`;

  try {
    const client = new GoogleGenerativeAI(GEMINI_API_KEY);

    // Use Gemini 3 Pro Image Preview (the latest image generation model in January 2026)
    const model = client.getGenerativeModel({ model: 'gemini-3-pro-image-preview' });

    const result = await model.generateContent(prompt);

    if (result && result.response) {
      const responseData = result.response;

      // Get image data from the response
      let imageData = null;
      if (responseData.candidates && responseData.candidates[0]) {
        const candidate = responseData.candidates[0];
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              imageData = Buffer.from(part.inlineData.data, 'base64');
              break;
            }
          }
        }
      }

      if (!imageData) {
        console.log(`⚠️  No image data in response for ${iconDef.name}`);
        return {
          name: iconDef.name,
          success: false,
          reason: 'No image data in API response',
        };
      }

      // Save image to file
      const assetDir = path.join(process.cwd(), 'public', 'generated-assets');
      if (!fs.existsSync(assetDir)) {
        fs.mkdirSync(assetDir, { recursive: true });
      }

      const filename = `${iconDef.name}.png`;
      const filepath = path.join(assetDir, filename);

      fs.writeFileSync(filepath, imageData);

      console.log(`✅ Generated: ${iconDef.name} → ${filepath}`);
      return {
        name: iconDef.name,
        success: true,
        filepath,
        size: imageData.length,
      };
    } else {
      console.log(`⚠️  No response from API for ${iconDef.name}`);
      return {
        name: iconDef.name,
        success: false,
        reason: 'No response content from API',
      };
    }
  } catch (error) {
    const errorMsg = error.message || String(error);
    console.log(`⚠️  Error generating ${iconDef.name}: ${errorMsg}`);
    return {
      name: iconDef.name,
      success: false,
      reason: errorMsg,
    };
  }
}

async function generateAllIcons() {
  console.log('🎨 NRPG Professional Icon Generator - Photorealistic 3D Rendering');
  console.log('================================================================\n');
  console.log(`Generating ${ICONS_TO_GENERATE.length} professional photorealistic 3D rendered icons...`);
  console.log(`Style: Professional 3D CGI Rendering`);
  console.log(`Aesthetic: High-quality photorealistic 3D images with professional materials and lighting\n`);

  const results = [];

  for (let i = 0; i < ICONS_TO_GENERATE.length; i++) {
    const icon = ICONS_TO_GENERATE[i];
    try {
      const result = await generateIcon(icon);
      results.push(result);

      // Delay between requests
      if (i < ICONS_TO_GENERATE.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`❌ Error generating ${icon.name}:`, error.message);
      results.push({
        name: icon.name,
        success: false,
        reason: error.message,
      });
    }
  }

  console.log('\n📊 Generation Summary');
  console.log('====================\n');

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}\n`);

  if (failed.length > 0) {
    console.log('⚠️  Generation Issues:');
    failed.forEach((r) => {
      console.log(`  • ${r.name}: ${r.reason}`);
    });
  }

  console.log('\n📝 Photorealistic 3D Icon Generation Summary:\n');
  console.log('✅ Model: Gemini 3 Pro Image Preview (gemini-3-pro-image-preview)');
  console.log('✅ Output Format: PNG/JPEG photorealistic 3D images');
  console.log('✅ Resolution: 512x512px with professional framing');
  console.log('✅ Style: High-quality 3D CGI render with photorealistic materials and lighting');
  console.log('');
  console.log('Generated Icons:');
  successful.forEach((r) => {
    console.log(`  • ${r.name}: ${r.size} bytes`);
  });
  console.log('');
  console.log('Next Steps:');
  console.log('1. Review generated PNG images in public/generated-assets/');
  console.log('2. Verify quality matches reference standards');
  console.log('3. Integrate icons into dashboard components');
  console.log('4. Update image imports from .svg to .png');
  console.log('5. Commit changes and deploy to production');
  console.log('');
}

// Run generation
generateAllIcons().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
