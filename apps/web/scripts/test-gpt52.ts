/**
 * Quick GPT-5.2 Test with Real API
 */

import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testGPT52() {
  console.log('🚀 Testing GPT-5.2 with Water Damage Image\n');

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment');
    console.log('Looking in:', path.resolve(__dirname, '../.env.local'));
    process.exit(1);
  }

  console.log('✅ OpenAI API key loaded');
  console.log('📸 Using Cloudinary demo image URL\n');

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const imageUrl = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg';

  const prompt = `You are a certified IICRC disaster restoration expert documenting insurance claims in Australia.

PHOTO CONTEXT:
- Type: evidence (before/after/evidence)
- Location: Living Room - Living Area
- Damage Category: CATEGORY_2 (water damage)
- Severity: Major
- Affected Materials: Timber flooring (Oregon pine), Plasterboard walls, R2.5 ceiling insulation, Carpet underlay
- Required Actions: Water extraction, Structural drying, Dehumidification, Moisture monitoring (48-72 hours), Antimicrobial treatment

COMPLIANCE FRAMEWORK:
- Jurisdiction: NSW
- Applicable Codes: AS 3959, AS/NZS 3760
- Industry Standards: water damage restoration, mould remediation

SERVICE TYPE: WATER_DAMAGE
CLAIM VALUE: $8500 AUD

TASK: Analyze this image and generate a 2-3 sentence expert-level description that:
1. Demonstrates technical expertise using proper restoration terminology
2. Shows authority by referencing applicable Australian standards or building codes
3. Provides specific details about materials, damage extent, and remediation needs
4. Is optimized for SEO and E.E.A.T. scoring
5. Uses Australian English spelling (colour, mould, metre)

OUTPUT FORMAT: Plain text description only, no preamble or explanations.

EXAMPLE OUTPUT (for reference only):
"Severe water damage to structural timber framing and plasterboard ceiling linings in accordance with AS 3959 classification. Moisture readings indicate saturation levels exceeding 20% requiring immediate extraction and drying per industry standards. Affected materials include Oregon timber joists, R2.5 ceiling insulation, and painted plasterboard requiring removal and replacement to prevent secondary mould colonisation."`;

  try {
    console.log('🤖 Calling GPT-5.2 API...');
    console.log('⏳ This may take 3-5 seconds...\n');

    const startTime = Date.now();

    const response = await openai.chat.completions.create({
      model: 'gpt-5.2',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const duration = Date.now() - startTime;
    const description = response.choices[0]?.message?.content || '';
    const tokensUsed = response.usage?.total_tokens || 0;
    const cost = ((response.usage?.prompt_tokens || 0) * 2.5 + (response.usage?.completion_tokens || 0) * 10) / 1_000_000;

    console.log('✅ GPT-5.2 Response Received!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📝 AI-GENERATED DESCRIPTION (GPT-5.2):');
    console.log('═══════════════════════════════════════════════════════');
    console.log(description);
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📊 Performance Metrics:');
    console.log(`   ⏱️  Processing Time: ${(duration / 1000).toFixed(2)}s`);
    console.log(`   🪙 Tokens Used: ${tokensUsed}`);
    console.log(`   💰 Cost: $${cost.toFixed(4)} USD`);
    console.log(`   📏 Length: ${description.length} characters\n`);

    // E.E.A.T. Quality Check
    console.log('🎯 E.E.A.T. Quality Check:');
    console.log(`   ${/IICRC/i.test(description) ? '✅' : '❌'} IICRC Standards Referenced`);
    console.log(`   ${/AS[\s\/]?\d{4}|AS\/NZS/i.test(description) ? '✅' : '❌'} Australian Building Codes`);
    console.log(`   ${/(moisture|saturation|extraction|remediation|infiltration)/i.test(description) ? '✅' : '❌'} Technical Terminology`);
    console.log(`   ${/(colour|mould|metre|colonisation|optimised)/i.test(description) ? '✅' : '❌'} Australian English Spelling\n`);

    console.log('🎉 Test Complete!');
    console.log('\n📍 Model Information:');
    console.log(`   Model: ${response.model}`);
    console.log(`   System: ${response.system_fingerprint || 'N/A'}\n`);

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.code) console.error('   Code:', error.code);
    if (error.status) console.error('   Status:', error.status);
    console.error('\n💡 Common Issues:');
    console.error('   - Invalid API key');
    console.error('   - Model not available (try "gpt-4o" instead)');
    console.error('   - Rate limit exceeded');
    console.error('   - Insufficient quota/billing\n');
  }
}

testGPT52();
