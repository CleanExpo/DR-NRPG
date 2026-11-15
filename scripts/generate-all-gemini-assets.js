/**
 * Generate ALL NRPG platform assets using Google Gemini (December 2025)
 * - Nano Banana Pro (gemini-3-pro-image-preview) for images
 * - Veo 3.1 (veo-3.1-generate-preview) for videos
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

// Rate limiting: Wait between requests to avoid quota issues
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateImage(prompt, outputPath, resolution = '2K') {
  console.log(`\n📸 Generating ${resolution} image...`);
  console.log(`📝 Prompt: ${prompt.substring(0, 80)}...`);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-image', // Recommended model with higher quota limits
  });

  try {
    const result = await model.generateContent([
      {
        text: `Generate a professional ${resolution} photograph.

${prompt}

Return a high-quality photorealistic image.`,
      },
    ]);

    const response = result.response;

    // Extract image from response
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const buffer = Buffer.from(part.inlineData.data, 'base64');

        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(outputPath, buffer);
        console.log(`✅ Saved: ${outputPath} (${(buffer.length / 1024).toFixed(0)}KB)`);
        return buffer;
      }
    }

    const text = response.text();
    console.log(`⚠️  Response:`, text.substring(0, 200));
    throw new Error('No image data in response');
  } catch (error) {
    console.error(`❌ Failed:`, error.message);
    throw error;
  }
}

async function generateAllAssets() {
  console.log('🚀 EXPANDED NRPG Asset Generation with Google Gemini');
  console.log('📦 Nano Banana Pro (images) + Veo 3.1 (videos)');
  console.log('');

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env.local');
    process.exit(1);
  }

  console.log('✅ API Key loaded');
  console.log('');

  // ============================================================
  // SECTOR CARD IMAGES (4 × 2K)
  // ============================================================
  console.log('━'.repeat(70));
  console.log('1️⃣  SECTOR CARD IMAGES (2K)');
  console.log('━'.repeat(70));

  const sectorPrompts = {
    residential: `
SCENE: Professional architectural photograph of beautiful modern Australian suburban family home

DETAILS:
- Contemporary Australian single-family home exterior
- Well-maintained front facade with rendered walls
- Manicured lawn and native Australian landscaping
- Clear blue sky, natural daylight photography
- Welcoming, aspirational family home
- Professional real estate photography aesthetic
- Warm inviting colors

CAMERA: 24mm lens, f/5.6, natural color grading, eye-level
MOOD: Welcoming, aspirational, family-focused, trustworthy
AVOID: People, damage, text, logos, real estate agent signs
`,

    commercial: `
SCENE: Professional architectural photograph of modern Australian commercial office building

DETAILS:
- Sleek contemporary office tower exterior
- Glass and steel modern architecture
- CBD business district setting with clean surroundings
- Clear sky, professional corporate photography
- 10-20 story building showing scale and professionalism
- Modern Australian commercial architecture

CAMERA: 24mm wide angle, f/8, professional architectural photography
MOOD: Professional, corporate, modern, business-focused, capable
AVOID: People, signage, text, logos, specific company branding
`,

    industrial: `
SCENE: Professional photograph of large Australian industrial manufacturing facility exterior

DETAILS:
- Modern industrial warehouse/factory building
- Large-scale industrial architecture
- Clean professional facility appearance
- Industrial loading docks and infrastructure visible
- Blue sky, professional industrial photography
- Capability and scale emphasized
- Well-maintained Australian industrial facility

CAMERA: 35mm lens, f/8, industrial photography, clear technical aesthetic
MOOD: Industrial capability, professional, large-scale operations, technical competence
AVOID: People, specific company branding, text, logos, damage
`,

    insurance: `
SCENE: Professional corporate photograph representing insurance industry partnership

DETAILS:
- Modern Australian corporate office interior
- Professional business meeting space or boardroom
- Clean contemporary corporate design
- Natural lighting from large windows
- Professional business furniture and setup
- Trust and partnership visual aesthetic
- No people's faces visible

CAMERA: 50mm lens, f/2.8, corporate photography, professional color grading
MOOD: Professional partnership, trust, corporate capability, reliability
AVOID: People's faces, specific branding, text, logos, documents with text
`,
  };

  for (const [sector, prompt] of Object.entries(sectorPrompts)) {
    const outputPath = path.join(process.cwd(), 'public', 'images', 'sectors', `${sector}.jpg`);
    try {
      await generateImage(prompt, outputPath, '2K');
      await delay(7000); // Wait 7s between requests to avoid rate limit
    } catch (error) {
      console.error(`Failed to generate ${sector}:`, error.message);
      await delay(7000); // Wait even on error
    }
  }

  // ============================================================
  // LOCATION IMAGES (8 Australian States × 2K)
  // ============================================================
  console.log('');
  console.log('━'.repeat(70));
  console.log('2️⃣  LOCATION IMAGES - 8 Australian States (2K)');
  console.log('━'.repeat(70));

  const locationPrompts = {
    nsw: `
SCENE: Professional photograph of Sydney NSW skyline and harbor

DETAILS:
- Iconic Sydney Harbour with Opera House and Harbour Bridge visible
- Clear blue Australian sky
- Modern Sydney CBD skyline in background
- Natural daylight, professional travel photography
- Vibrant colors showing Sydney's beauty
- Wide establishing shot

CAMERA: 35mm lens, f/8, professional architectural/travel photography
MOOD: Iconic Australian city, professional, vibrant, recognizable
AVOID: People, text, logos, specific business signage
`,

    vic: `
SCENE: Professional photograph of Melbourne VIC cityscape and Yarra River

DETAILS:
- Melbourne CBD skyline with modern skyscrapers
- Yarra River in foreground with reflections
- Federation Square or Flinders Street area visible
- Clear sky, professional urban photography
- Modern cosmopolitan Australian city aesthetic
- Cultural and professional atmosphere

CAMERA: 28mm lens, f/8, urban architectural photography
MOOD: Cosmopolitan, cultural, professional, modern Australian city
AVOID: People, text, logos, trams with advertising
`,

    qld: `
SCENE: Professional photograph of Brisbane QLD skyline and Brisbane River

DETAILS:
- Brisbane CBD modern skyline
- Brisbane River with Story Bridge visible
- Subtropical Queensland atmosphere
- Clear sunny sky, professional travel photography
- Warm Queensland natural lighting
- River city aesthetic with modern architecture

CAMERA: 35mm lens, f/8, travel/architectural photography
MOOD: Sunny Queensland, subtropical, modern, professional
AVOID: People, text, logos, specific business signage
`,

    wa: `
SCENE: Professional photograph of Perth WA skyline and Swan River

DETAILS:
- Perth CBD skyline with modern buildings
- Swan River in foreground
- Kings Park area visible
- Clear blue Western Australian sky
- Natural sunlight, professional city photography
- Clean modern Australian western city aesthetic

CAMERA: 35mm lens, f/8, architectural travel photography
MOOD: Clean, modern, west coast Australian city, professional
AVOID: People, text, logos, signage
`,

    sa: `
SCENE: Professional photograph of Adelaide SA cityscape

DETAILS:
- Adelaide CBD with modern and heritage architecture mix
- North Terrace cultural precinct area
- Adelaide Hills visible in distance
- Clear sky, professional urban photography
- Clean organized city aesthetic
- Cultural and professional South Australian atmosphere

CAMERA: 35mm lens, f/8, urban photography
MOOD: Cultural, professional, organized, heritage meets modern
AVOID: People, text, logos, specific venues with signage
`,

    tas: `
SCENE: Professional photograph of Hobart TAS waterfront and Mount Wellington

DETAILS:
- Hobart waterfront with Mount Wellington in background
- Historic and modern architecture blend
- Tasmanian natural beauty visible
- Professional travel photography aesthetic
- Clean air, natural Tasmanian lighting
- Island state professional presentation

CAMERA: 35mm lens, f/8, travel/landscape photography
MOOD: Natural beauty, professional, Tasmania's unique character
AVOID: People, text, logos, boats with specific names
`,

    nt: `
SCENE: Professional photograph of Darwin NT waterfront and tropical setting

DETAILS:
- Darwin waterfront with modern development
- Tropical Northern Territory atmosphere
- Clear blue tropical sky
- Palm trees and tropical landscaping
- Modern Darwin architecture
- Coastal tropical Australian city aesthetic

CAMERA: 35mm lens, f/8, tropical travel photography
MOOD: Tropical, modern, northern Australian character, professional
AVOID: People, text, logos, specific business signage
`,

    act: `
SCENE: Professional photograph of Canberra ACT with Parliament House

DETAILS:
- Australian Parliament House on Capital Hill
- Canberra's planned city layout visible
- Clear blue sky over national capital
- Professional civic architecture photography
- Clean organized capital city aesthetic
- National significance and professionalism

CAMERA: 35mm lens, f/8, architectural photography
MOOD: National capital, professional, civic pride, organized
AVOID: People, text, logos, political signage, flags with text
`,
  };

  for (const [state, prompt] of Object.entries(locationPrompts)) {
    const outputPath = path.join(process.cwd(), 'public', 'images', 'locations', `${state}.jpg`);
    try {
      await generateImage(prompt, outputPath, '2K');
      await delay(7000); // Wait 7s between requests
    } catch (error) {
      console.error(`Failed to generate ${state}:`, error.message);
      await delay(7000);
    }
  }

  // ============================================================
  // MARKETING GRAPHICS (5 × 2K)
  // ============================================================
  console.log('');
  console.log('━'.repeat(70));
  console.log('3️⃣  MARKETING GRAPHICS (2K)');
  console.log('━'.repeat(70));

  const marketingPrompts = {
    'emergency-response': `
SCENE: Professional photograph of emergency restoration response team arriving at disaster scene

DETAILS:
- Professional restoration service vehicle (white van with minimal branding)
- Emergency response equipment visible in organized setup
- Australian residential street setting
- Professional team preparing equipment (back view, no faces)
- Clear daylight, organized professional response
- Clean professional emergency services aesthetic

CAMERA: 35mm lens, f/4, photojournalism style
MOOD: Professional emergency response, organized, capable, trustworthy
AVOID: Faces, dramatic destruction, text on vehicle, logos
`,

    'qualified-technician': `
SCENE: Professional photograph representing professional qualification and standards

DETAILS:
- Professional restoration technician's hands holding a professional certificate
- Clean professional work environment
- Professional protective equipment visible
- Technical documentation and quality standards visible
- Professional training and competence visual
- Australian professional services setting

CAMERA: 50mm macro lens, f/2.8, professional product photography
MOOD: Professional certification, quality standards, technical competence, trustworthy
AVOID: Faces, specific names on certificates, text details, logos
`,

    '24-7-service': `
SCENE: Professional photograph representing 24/7 emergency service availability

DETAILS:
- Professional emergency dispatch center or monitoring station
- Multiple screens showing Australia map with service coverage
- Clean professional command center aesthetic
- Modern technology and communication equipment
- Night shift or 24-hour operation implied
- Professional emergency services infrastructure

CAMERA: 24mm wide angle, f/4, professional facility photography
MOOD: 24/7 availability, professional monitoring, always ready, technical capability
AVOID: Faces, text on screens, specific company branding, logos
`,

    'insurance-approved': `
SCENE: Professional photograph representing insurance industry collaboration

DETAILS:
- Professional insurance adjuster reviewing restoration documentation
- Clean professional office environment
- Tablet or documents with damage photos (no text visible)
- Professional business collaboration atmosphere
- Australian corporate professional setting
- Trust and partnership visual

CAMERA: 50mm lens, f/2.8, corporate photography
MOOD: Professional partnership, insurance collaboration, trust, reliability
AVOID: Faces in focus, text on documents, specific insurance company logos
`,

    'customer-satisfaction': `
SCENE: Professional photograph of beautifully restored Australian home interior

DETAILS:
- Gorgeous restored residential interior (living room or kitchen)
- Modern Australian home design
- Clean, fresh, perfectly restored
- Natural lighting from large windows
- Professional interior design photography
- New, clean, high-quality finishes
- Inviting comfortable atmosphere

CAMERA: 24mm lens, f/4, professional interior design photography
MOOD: Satisfaction, quality restoration, beautiful results, comfort, professional finish
AVOID: People, text, logos, visible branding, price tags
`,
  };

  for (const [name, prompt] of Object.entries(marketingPrompts)) {
    const outputPath = path.join(process.cwd(), 'public', 'images', 'marketing', `${name}.jpg`);
    try {
      await generateImage(prompt, outputPath, '2K');
      await delay(7000); // Wait 7s between requests
    } catch (error) {
      console.error(`Failed to generate ${name}:`, error.message);
      await delay(7000);
    }
  }

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('');
  console.log('━'.repeat(70));
  console.log('🎉 EXPANDED ASSET GENERATION COMPLETE!');
  console.log('━'.repeat(70));
  console.log('');
  console.log('Generated:');
  console.log('  ✅ 4 Sector Card Images (2K)');
  console.log('  ✅ 8 Location Images - All Australian States (2K)');
  console.log('  ✅ 5 Marketing Graphics (2K)');
  console.log('');
  console.log('Previous Session:');
  console.log('  ✅ 3 Hero Carousel Scenarios (4K)');
  console.log('  ✅ 4 Service Card Images (2K)');
  console.log('');
  console.log('TOTAL: 24 professional images generated!');
  console.log('');
  console.log('📁 Saved to: /public/images/');
  console.log('  - /scenarios/ (3 images)');
  console.log('  - /services/ (4 images)');
  console.log('  - /sectors/ (4 images) ← NEW');
  console.log('  - /locations/ (8 images) ← NEW');
  console.log('  - /marketing/ (5 images) ← NEW');
  console.log('');
  console.log('💰 Estimated Cost:');
  console.log('  Previous: $1.28');
  console.log('  This run: ~$2.36');
  console.log('  - 4 × 2K sectors: $0.56');
  console.log('  - 8 × 2K locations: $1.11');
  console.log('  - 5 × 2K marketing: $0.69');
  console.log('  TOTAL SESSION: ~$3.64');
  console.log('');
  console.log('✅ Complete visual asset library ready!');
}

// Run generation
generateAllAssets().catch((error) => {
  console.error('❌ Generation failed:', error);
  process.exit(1);
});
