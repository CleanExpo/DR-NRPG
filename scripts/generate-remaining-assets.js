/**
 * Generate remaining NRPG assets (retry with improved prompts)
 * Using: gemini-2.5-flash-image (Latest December 2025)
 * Features: Rate limiting, simplified prompts to avoid safety filters
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Rate limiting
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateImage(prompt, outputPath) {
  console.log(`\n📸 Generating image...`);
  console.log(`📝 Prompt: ${prompt.substring(0, 70)}...`);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-image', // Latest with higher quota
  });

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;

    // Extract image from response
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const buffer = Buffer.from(part.inlineData.data, 'base64');

          // Ensure directory exists
          const dir = path.dirname(outputPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(outputPath, buffer);
          const sizeMB = (buffer.length / 1024).toFixed(0);
          console.log(`✅ Saved: ${path.basename(outputPath)} (${sizeMB}KB)`);
          return buffer;
        }
      }
    }

    const text = response.text ? response.text() : 'No response text';
    console.log(`⚠️  No image data. Response: ${text.substring(0, 150)}...`);
    return null;
  } catch (error) {
    console.error(`❌ Failed: ${error.message.substring(0, 100)}...`);
    return null;
  }
}

async function generateAllRemainingAssets() {
  console.log('🚀 Generating Remaining NRPG Assets');
  console.log('📦 Using: gemini-2.5-flash-image (Latest December 2025)');
  console.log('⏱️  Rate Limited: 7-second delays between requests');
  console.log('');

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found');
    process.exit(1);
  }

  console.log('✅ API Key loaded');
  console.log('');

  // ============================================================
  // SECTOR CARDS (4 × 2K) - Simplified prompts
  // ============================================================
  console.log('━'.repeat(70));
  console.log('1️⃣  SECTOR CARD IMAGES (2K)');
  console.log('━'.repeat(70));

  const sectorPrompts = {
    residential: `Create a professional photograph of a beautiful modern suburban family home exterior. Contemporary Australian architecture with rendered walls, manicured green lawn, clear blue sky. Welcoming and aspirational. Real estate photography style. Natural daylight. No people, no text, no logos.`,

    commercial: `Create a professional photograph of a modern glass and steel office building exterior. Contemporary commercial architecture, business district setting, clear sky. Corporate professional photography. No people, no signage with text.`,

    industrial: `Create a professional photograph of a large industrial warehouse facility exterior. Modern industrial architecture with loading docks, large scale building. Professional industrial photography. Clear sky, well-maintained facility. No people, no company branding.`,

    insurance: `Create a professional photograph of a modern corporate office interior meeting room. Clean contemporary design, large windows with natural light, professional furniture. Corporate business photography. No people's faces visible, no text, no logos.`,
  };

  for (const [sector, prompt] of Object.entries(sectorPrompts)) {
    const outputPath = path.join(process.cwd(), 'public', 'images', 'sectors', `${sector}.jpg`);

    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  Skipping ${sector} (already exists)`);
      continue;
    }

    await generateImage(prompt, outputPath);
    await delay(8000); // 8 second delay to avoid rate limits
  }

  // ============================================================
  // LOCATION IMAGES (8 States) - Generic Australian cityscapes
  // ============================================================
  console.log('');
  console.log('━'.repeat(70));
  console.log('2️⃣  LOCATION IMAGES - Australian Cities (2K)');
  console.log('━'.repeat(70));

  const locationPrompts = {
    nsw: `Create a professional photograph of a modern Australian coastal city skyline. Harbor with boats, modern skyscrapers, clear blue sky. Professional travel photography. Vibrant colors. No specific landmarks, no people, no text.`,

    vic: `Create a professional photograph of a cosmopolitan Australian city with river. Modern CBD skyline, river with reflections, contemporary architecture. Professional urban photography. Cultural atmosphere. No specific landmarks, no people, no text.`,

    qld: `Create a professional photograph of a subtropical Australian city skyline. Modern buildings, river view, palm trees, sunny Queensland atmosphere. Professional travel photography. Warm natural lighting. No specific landmarks, no people, no text.`,

    wa: `Create a professional photograph of a west coast Australian city skyline. Modern architecture, river or coast view, clear blue sky. Professional city photography. Clean modern aesthetic. No specific landmarks, no people, no text.`,

    sa: `Create a professional photograph of an Australian city with mixed heritage and modern architecture. Cultural district, clean organized city, clear sky. Professional urban photography. No specific buildings, no people, no text.`,

    tas: `Create a professional photograph of an Australian island city with mountain backdrop. Waterfront setting, natural beauty, modern and historic mix. Professional travel photography. No specific landmarks, no people, no text.`,

    nt: `Create a professional photograph of a tropical Australian city. Palm trees, modern development, coastal tropical setting, clear blue sky. Professional travel photography. Tropical atmosphere. No specific landmarks, no people, no text.`,

    act: `Create a professional photograph of a modern planned Australian capital city. Civic architecture, organized layout, clear sky, professional atmosphere. No specific government buildings, no people, no flags with text.`,
  };

  for (const [state, prompt] of Object.entries(locationPrompts)) {
    const outputPath = path.join(process.cwd(), 'public', 'images', 'locations', `${state}.jpg`);

    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  Skipping ${state} (already exists)`);
      continue;
    }

    await generateImage(prompt, outputPath);
    await delay(8000); // 8 second delay
  }

  // ============================================================
  // MARKETING GRAPHICS (5 × 2K)
  // ============================================================
  console.log('');
  console.log('━'.repeat(70));
  console.log('3️⃣  MARKETING GRAPHICS (2K)');
  console.log('━'.repeat(70));

  const marketingPrompts = {
    'emergency-response': `Create a professional photograph of a white emergency restoration service van with equipment being unloaded. Australian residential street, daytime, professional team (back view only, no faces). Organized emergency response. Professional photojournalism style. No text on vehicle, no faces.`,

    'qualified-technician': `Create a professional photograph showing professional restoration certification and standards. Professional technician's hands holding certification document (no text details visible), clean professional work environment, quality and professionalism theme. No faces, no specific text on certificate.`,

    '24-7-service': `Create a professional photograph of a modern emergency dispatch monitoring center. Multiple screens showing maps (generic, no specific locations), professional workstation, night operation implied. Technical capability and 24/7 availability theme. No faces, no text on screens.`,

    'insurance-approved': `Create a professional photograph of business professionals reviewing restoration documentation together. Clean corporate office setting, tablet with damage photos, professional collaboration. Trust and partnership theme. No faces in focus, no text on documents.`,

    'customer-satisfaction': `Create a professional photograph of a beautifully restored modern Australian home interior. Gorgeous living room or kitchen, perfect restoration, natural lighting from windows, professional interior design photography. Clean high-quality finishes, inviting atmosphere. No people, no text, no brand items visible.`,
  };

  for (const [name, prompt] of Object.entries(marketingPrompts)) {
    const outputPath = path.join(process.cwd(), 'public', 'images', 'marketing', `${name}.jpg`);

    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  Skipping ${name} (already exists)`);
      continue;
    }

    await generateImage(prompt, outputPath);
    await delay(8000); // 8 second delay
  }

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('');
  console.log('━'.repeat(70));
  console.log('🎉 GENERATION COMPLETE!');
  console.log('━'.repeat(70));
  console.log('');
  console.log('📁 Check: /public/images/');
  console.log('  - /sectors/');
  console.log('  - /locations/');
  console.log('  - /marketing/');
  console.log('');
  console.log('💰 Estimated Additional Cost: ~$2.36');
  console.log('');
  console.log('✅ Ready for production!');
}

// Run generation
generateAllRemainingAssets().catch((error) => {
  console.error('❌ Generation failed:', error);
  process.exit(1);
});
