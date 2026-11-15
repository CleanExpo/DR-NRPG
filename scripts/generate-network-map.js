#!/usr/bin/env node

/**
 * Generate Australia Network Map
 *
 * Creates an Australia network visualization showing contractor density
 * using Gemini API. Falls back to SVG placeholder if API fails.
 */

const path = require('path');
const fs = require('fs');
const https = require('https');

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
  console.error('❌ GEMINI_API_KEY not found in environment or .env.local');
  process.exit(1);
}

async function generateNetworkMap() {
  const prompt = `Create an Australia network visualization showing NRPG contractor density by location.

MAP SPECIFICATIONS:
1. Australia outline map with state boundaries (NSW, VIC, QLD, WA, SA, TAS, ACT, NT)
2. Heatmap overlay showing contractor concentration:
   - Sydney/NSW: Darkest (500+ contractors)
   - Melbourne/VIC: Dark (350+ contractors)
   - Brisbane/QLD: Medium-dark (250+ contractors)
   - Perth/WA: Medium (150+ contractors)
   - Adelaide/SA: Medium-light (100+ contractors)
   - Hobart/TAS: Light (75+ contractors)
   - Canberra/ACT: Light (60+ contractors)
   - Darwin/NT: Light (40+ contractors)
3. Gradient colors: Light blue (#EFF6FF) → Medium (#3B82F6) → Dark (#0047FF)
4. Major cities labeled with contractor counts
5. NRPG branding corner (logo area)
6. Professional, clean, modern data visualization style
7. Size: 1200x900px landscape format

DESIGN REQUIREMENTS:
- Color scheme: NRPG blue primary gradient
- Style: Modern, corporate, professional
- Format: PNG with transparency
- Clear state boundaries
- Geographic accuracy (Australia map proportions)

OUTPUT: Professional Australia network map with contractor density visualization. This is a data visualization, not a screenshot.`;

  console.log('🗺️  NRPG Australia Network Map Generator');
  console.log('========================================\n');

  console.log('⏳ Attempting to generate network map via Gemini API...');

  try {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(requestBody)),
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 403) {
            console.log('⚠️  API key rejected (403). Using SVG placeholder instead.\n');
            generatePlaceholderMap();
            resolve();
            return;
          }

          if (res.statusCode !== 200) {
            console.log(
              `⚠️  API returned status ${res.statusCode}. Using SVG placeholder instead.\n`
            );
            generatePlaceholderMap();
            resolve();
            return;
          }

          try {
            const response = JSON.parse(data);

            if (response.error) {
              console.log(
                `⚠️  API Error: ${response.error.message}. Using SVG placeholder instead.\n`
              );
              generatePlaceholderMap();
              resolve();
              return;
            }

            console.log('Note: Gemini 2.5 Flash does not support image generation.');
            console.log('Using SVG placeholder instead.\n');
            generatePlaceholderMap();
            resolve();
          } catch (err) {
            console.log(
              '⚠️  Could not parse response. Using SVG placeholder instead.\n'
            );
            generatePlaceholderMap();
            resolve();
          }
        });
      });

      req.on('error', (err) => {
        console.log(`⚠️  Request failed: ${err.message}. Using SVG placeholder.\n`);
        generatePlaceholderMap();
        resolve();
      });

      req.write(JSON.stringify(requestBody));
      req.end();
    });
  } catch (error) {
    console.log(`⚠️  Error: ${error.message}. Using SVG placeholder.\n`);
    generatePlaceholderMap();
  }
}

function generatePlaceholderMap() {
  console.log('📝 Generating SVG placeholder map...');

  const svgContent = `<svg viewBox="0 0 1200 900" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .state { fill: #EFF6FF; stroke: #0047FF; stroke-width: 2; }
      .state-dark { fill: #3B82F6; stroke: #0047FF; stroke-width: 2; }
      .state-darkest { fill: #0047FF; stroke: #0039CC; stroke-width: 2; }
      .city-label { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; fill: #1e293b; }
      .count-label { font-family: 'Inter', sans-serif; font-size: 12px; fill: #64748b; }
      .title { font-family: 'Inter', sans-serif; font-size: 28px; font-weight: 700; fill: #1e293b; }
      .subtitle { font-family: 'Inter', sans-serif; font-size: 14px; fill: #64748b; }
    </style>
    <linearGradient id="australia-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#EFF6FF;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0047FF;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="900" fill="#f8fafc"/>

  <!-- Title -->
  <text x="60" y="50" class="title">NRPG Contractor Network</text>
  <text x="60" y="75" class="subtitle">Distribution across Australia</text>

  <!-- Simplified Australia Map (Approximate State Boxes) -->

  <!-- NSW - Sydney (DARKEST - 500+) -->
  <rect x="600" y="350" width="120" height="100" class="state-darkest"/>
  <circle cx="660" cy="400" r="8" fill="#DC2626"/>
  <text x="665" y="405" class="city-label">Sydney</text>
  <text x="665" y="420" class="count-label">500+ contractors</text>

  <!-- VIC - Melbourne (DARK - 350+) -->
  <rect x="600" y="450" width="100" height="80" class="state-dark"/>
  <circle cx="650" cy="490" r="8" fill="#DC2626"/>
  <text x="655" y="495" class="city-label">Melbourne</text>
  <text x="655" y="510" class="count-label">350+ contractors</text>

  <!-- QLD - Brisbane (MEDIUM-DARK - 250+) -->
  <rect x="600" y="280" width="120" height="70" class="state-dark"/>
  <circle cx="660" cy="315" r="8" fill="#DC2626"/>
  <text x="665" y="320" class="city-label">Brisbane</text>
  <text x="665" y="335" class="count-label">250+ contractors</text>

  <!-- WA - Perth (MEDIUM - 150+) -->
  <rect x="200" y="380" width="140" height="120" class="state"/>
  <circle cx="270" cy="440" r="8" fill="#DC2626"/>
  <text x="275" y="445" class="city-label">Perth</text>
  <text x="275" y="460" class="count-label">150+ contractors</text>

  <!-- SA - Adelaide (MEDIUM-LIGHT - 100+) -->
  <rect x="450" y="440" width="100" height="90" class="state"/>
  <circle cx="500" cy="485" r="8" fill="#DC2626"/>
  <text x="505" y="490" class="city-label">Adelaide</text>
  <text x="505" y="505" class="count-label">100+ contractors</text>

  <!-- TAS - Hobart (LIGHT - 75+) -->
  <rect x="620" y="540" width="70" height="60" class="state"/>
  <circle cx="655" cy="570" r="8" fill="#DC2626"/>
  <text x="660" y="575" class="city-label">Hobart</text>
  <text x="660" y="590" class="count-label">75+ contractors</text>

  <!-- ACT - Canberra (LIGHT - 60+) -->
  <rect x="630" y="480" width="50" height="45" class="state"/>
  <circle cx="655" cy="502" r="6" fill="#DC2626"/>
  <text x="665" y="507" class="city-label">Canberra</text>
  <text x="665" y="520" class="count-label">60+ contractors</text>

  <!-- NT - Darwin (LIGHT - 40+) -->
  <rect x="400" y="150" width="150" height="130" class="state"/>
  <circle cx="475" cy="215" r="8" fill="#DC2626"/>
  <text x="480" y="220" class="city-label">Darwin</text>
  <text x="480" y="235" class="count-label">40+ contractors</text>

  <!-- Legend -->
  <g transform="translate(50, 700)">
    <text x="0" y="0" class="city-label">Coverage Density Legend:</text>

    <rect x="0" y="15" width="20" height="20" class="state-darkest"/>
    <text x="30" y="30" class="count-label">500+ (Sydney)</text>

    <rect x="150" y="15" width="20" height="20" class="state-dark"/>
    <text x="180" y="30" class="count-label">250-350+ (Melbourne, Brisbane)</text>

    <rect x="450" y="15" width="20" height="20" class="state"/>
    <text x="480" y="30" class="count-label">50-150+ (Other locations)</text>
  </g>

  <!-- NRPG Branding -->
  <g transform="translate(1050, 50)">
    <circle cx="0" cy="0" r="30" fill="#0047FF"/>
    <text x="0" y="8" text-anchor="middle" style="font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 700; fill: white;">N</text>
  </g>

  <!-- Footer -->
  <text x="60" y="850" class="count-label">National Restoration Platform Group | Qualified Network</text>
  <text x="60" y="870" class="count-label">2000+ Total NRPG Contractors Across Australia | 24/7 Emergency Response</text>
</svg>`;

  try {
    const outputPath = path.join(process.cwd(), 'public', 'images', 'network-map.svg');

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, svgContent);
    console.log(`✅ Network map created: ${outputPath}`);
    console.log('\n📊 Map Details:');
    console.log('- Format: SVG (scalable vector)');
    console.log('- Size: 1200x900px');
    console.log('- Style: Simplified Australia map with contractor density visualization');
    console.log('- Shows: All 8 Australian states with relative contractor density');
    console.log('- Type: Placeholder (awaiting Gemini 3 Pro API key for production version)');
  } catch (err) {
    console.error(`❌ Failed to save map: ${err.message}`);
    process.exit(1);
  }
}

// Run generation
generateNetworkMap().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
