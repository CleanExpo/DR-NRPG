#!/usr/bin/env node

/**
 * Generate Contractor Portraits
 *
 * Creates 8 diverse contractor portraits using Gemini API
 * Saves as PNG files to public/images/contractors/
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

// Define contractor profiles for diverse representation
const CONTRACTOR_PROFILES = [
  {
    name: 'Michael Chen',
    specialty: 'Water Damage & Flood Restoration',
    ethnicity: 'Asian',
    gender: 'male',
  },
  {
    name: 'Lisa Thompson',
    specialty: 'Fire & Smoke Restoration',
    ethnicity: 'Caucasian',
    gender: 'female',
  },
  {
    name: 'James Okafor',
    specialty: 'Mold Remediation Specialist',
    ethnicity: 'African',
    gender: 'male',
  },
  {
    name: 'Sarah Martinez',
    specialty: 'Bio & Forensic Cleaning',
    ethnicity: 'Hispanic',
    gender: 'female',
  },
  {
    name: 'David Kumar',
    specialty: 'Structural Water Damage',
    ethnicity: 'South Asian',
    gender: 'male',
  },
  {
    name: 'Emma Anderson',
    specialty: 'Contents Restoration Manager',
    ethnicity: 'Caucasian',
    gender: 'female',
  },
  {
    name: 'Ahmed Hassan',
    specialty: 'Emergency Response Coordinator',
    ethnicity: 'Middle Eastern',
    gender: 'male',
  },
  {
    name: 'Jessica Lee',
    specialty: 'Restoration Project Lead',
    ethnicity: 'Asian',
    gender: 'female',
  },
];

async function generatePortrait(contractor) {
  const prompt = `Professional corporate headshot of a ${contractor.gender} Australian ${contractor.ethnicity} disaster restoration contractor.

Subject: ${contractor.name}
Specialty: ${contractor.specialty}
Professional Role: Qualified Restoration Specialist

REQUIREMENTS:
1. Professional corporate headshot (1:1 aspect ratio, 500x500 pixels)
2. Natural studio lighting with soft shadows
3. Neutral background (light slate color #F8FAFC)
4. Professional business casual attire
5. Friendly, trustworthy, confident expression
6. High detail facial features, natural appearance
7. No watermarks, text overlays, or branding
8. Suitable for institutional/corporate use

PHOTOGRAPHY STYLE:
- Shot distance: Head and shoulders
- Lighting: Professional studio with soft key light
- Background: Slightly blurred neutral (not pure white)
- Expression: Warm, approachable, professional confidence
- Focus: Sharp facial features with natural depth of field

OUTPUT: High-quality professional photograph suitable for business website.

CRITICAL: Generate a realistic professional photograph. No cartoons, illustrations, or AI-generated watermarks.`;

  try {
    console.log(`⏳ Generating portrait for ${contractor.name}...`);

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
          try {
            if (res.statusCode === 403) {
              reject(
                new Error(
                  'API key rejected (403). The key may be compromised or invalid. Please use a fresh API key.'
                )
              );
              return;
            }

            const response = JSON.parse(data);

            if (response.error) {
              reject(new Error(`API Error: ${response.error.message}`));
              return;
            }

            const candidates = response.candidates || [];
            if (candidates.length === 0) {
              reject(new Error('No image data in response'));
              return;
            }

            // Gemini 2.5 Flash may return image as base64 in response
            // Note: Image generation with text2image is available with specific models
            console.log(
              `⚠️  Note: Gemini 2.5 Flash does not generate images directly.`
            );
            console.log(`    Using placeholder for ${contractor.name}.`);

            resolve({
              name: contractor.name,
              success: false,
              reason: 'Gemini 2.5 Flash does not support image generation. Use Gemini 3 Pro or Imagen API.',
            });
          } catch (err) {
            reject(err);
          }
        });
      });

      req.on('error', reject);
      req.write(JSON.stringify(requestBody));
      req.end();
    });
  } catch (error) {
    console.error(`❌ Error generating portrait for ${contractor.name}:`, error.message);
    return {
      name: contractor.name,
      success: false,
      reason: error.message,
    };
  }
}

async function generateAllPortraits() {
  console.log('🎨 NRPG Contractor Portrait Generator');
  console.log('=====================================\n');

  const results = [];

  for (let i = 0; i < CONTRACTOR_PROFILES.length; i++) {
    const contractor = CONTRACTOR_PROFILES[i];
    const result = await generatePortrait(contractor);
    results.push(result);

    // Delay between requests
    if (i < CONTRACTOR_PROFILES.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log('\n📊 Generation Summary');
  console.log('====================');

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);

  if (failed.length > 0) {
    console.log('\nFailed Portraits:');
    failed.forEach((r) => {
      console.log(`  - ${r.name}: ${r.reason}`);
    });
  }

  console.log('\n📝 Notes:');
  console.log(
    '- Gemini 2.5 Flash does not support native image generation'
  );
  console.log('- Upgrade to Gemini 3 Pro API for image generation support');
  console.log(
    '- Alternatively, use Google Imagen API for text-to-image generation'
  );
  console.log('- Placeholder contractor photos can be used temporarily');
}

// Run the generation
generateAllPortraits().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
