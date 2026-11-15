/**
 * Complete AI Enhancement Demo
 *
 * This script:
 * 1. Creates test data (booking, report, damage area, photo)
 * 2. Enhances the photo with AI
 * 3. Shows the results
 */

import { AIImageEnhancementService } from '../lib/services/ai-image-enhancement.service';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('🚀 AI Image Enhancement - Complete Demo\n');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Step 1: Find or create admin user
    console.log('📋 Step 1: Setting up test data...');

    let adminUser = await prisma.user.findFirst({
      where: { userType: 'ADMIN' },
    });

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: 'demo.admin@disasterrecovery.com.au',
          name: 'Demo Admin',
          userType: 'ADMIN',
          password: 'hashed-password',
        },
      });
      console.log('✅ Created admin user');
    } else {
      console.log('✅ Found admin user:', adminUser.email);
    }

    // Step 2: Create test booking
    const booking = await prisma.booking.create({
      data: {
        clientId: adminUser.id,
        australianServiceType: 'WATER_DAMAGE',
        servicePostcode: '2000',
        serviceState: 'NSW',
        serviceSuburb: 'Sydney',
        streetAddress: '123 Test Street',
        description: 'Water damage from burst pipe - demonstration case',
        estimatedCostAUD: 8500,
        status: 'IN_PROGRESS',
      },
    });
    console.log('✅ Created test booking:', booking.id);

    // Step 3: Create inspection report
    const report = await prisma.inspectionReport.create({
      data: {
        reportNumber: `DEMO-${Date.now()}`,
        bookingId: booking.id,
        inspectionDate: new Date(),
        inspectorId: adminUser.id,
        jurisdiction: 'NSW',
        applicableCodes: ['AS 3959', 'AS/NZS 3760'],
        iicrcStandards: ['S500_WATER_DAMAGE', 'S520_MOLD_REMEDIATION'],
        status: 'IN_PROGRESS',
        scopeOfWork: 'Water damage assessment and remediation planning for residential property',
        findings: 'Extensive water damage to timber flooring, plasterboard walls, and insulation. Moisture levels indicate 48-hour exposure requiring immediate extraction and structural drying.',
        recommendations: 'Immediate dehumidification, moisture monitoring, and industry-standard drying protocol implementation',
        createdBy: adminUser.id,
      },
    });
    console.log('✅ Created inspection report:', report.reportNumber);

    // Step 4: Create damage area
    const damageArea = await prisma.damageArea.create({
      data: {
        reportId: report.id,
        areaName: 'Living Room',
        floor: 'Ground Floor',
        roomType: 'Living Area',
        damageCategory: 'CATEGORY_2',
        affectedArea: 32.5,
        affectedMaterials: [
          'Timber flooring (Oregon pine)',
          'Plasterboard walls',
          'R2.5 ceiling insulation',
          'Carpet underlay',
        ],
        description: 'Category 2 water damage affecting structural timber flooring and wall cavities. Visible moisture infiltration and saturation detected.',
        severity: 'Major',
        requiredActions: [
          'Water extraction',
          'Structural drying',
          'Dehumidification',
          'Moisture monitoring (48-72 hours)',
          'Antimicrobial treatment',
        ],
        equipmentNeeded: [
          'Industrial dehumidifier',
          'Air movers (x4)',
          'Moisture meter',
          'Thermal imaging camera',
        ],
        estimatedDryingTime: 5,
      },
    });
    console.log('✅ Created damage area:', damageArea.areaName);

    // Step 5: Create inspection photo with publicly accessible image
    // Using a Cloudinary demo image for testing
    const photo = await prisma.inspectionPhoto.create({
      data: {
        reportId: report.id,
        damageAreaId: damageArea.id,
        photoUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
        filename: 'water-damage-demo.jpg',
        fileSize: 245000,
        mimeType: 'image/jpeg',
        photoType: 'evidence',
        caption: 'Water damage restoration equipment deployed',
        capturedAt: new Date(),
        sortOrder: 1,
      },
    });
    console.log('✅ Created inspection photo:', photo.id);
    console.log('   Photo URL:', photo.photoUrl);
    console.log('\n');

    // Step 6: Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️  OpenAI API key not found - showing demo output\n');
      showDemoEnhancement();
      return;
    }

    // Step 7: Enhance the image with AI
    console.log('🤖 Step 2: Enhancing image with GPT-4 Vision...');
    console.log('⏳ Processing (this may take 3-5 seconds)...\n');

    const service = new AIImageEnhancementService();
    const startTime = Date.now();

    const result = await service.enhanceSingleImage(photo.id);
    const duration = Date.now() - startTime;

    if (result.success) {
      console.log('✅ Enhancement Complete!\n');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📝 AI-GENERATED DESCRIPTION:');
      console.log('═══════════════════════════════════════════════════════');
      console.log(result.description);
      console.log('═══════════════════════════════════════════════════════\n');

      console.log('📊 Performance Metrics:');
      console.log(`   ⏱️  Processing Time: ${(duration / 1000).toFixed(2)}s`);
      console.log(`   💰 Cost: $${result.cost.toFixed(4)} USD`);
      console.log(`   📏 Length: ${result.description?.length || 0} characters\n`);

      // Check E.E.A.T. elements
      const desc = result.description || '';
      console.log('🎯 E.E.A.T. Quality Check:');
      console.log(`   ${/IICRC/i.test(desc) ? '✅' : '❌'} IICRC Standards Referenced`);
      console.log(`   ${/AS[\s\/]?\d{4}|AS\/NZS/i.test(desc) ? '✅' : '❌'} Australian Building Codes`);
      console.log(`   ${/(moisture|saturation|extraction|remediation)/i.test(desc) ? '✅' : '❌'} Technical Terminology`);
      console.log(`   ${/(colour|mould|metre)/i.test(desc) ? '✅' : '❌'} Australian English\n`);

      console.log('✅ Test completed successfully!');
      console.log('\n📍 Next Steps:');
      console.log('   1. View dashboard: http://localhost:3002/dashboard/admin/ai-enhancement');
      console.log('   2. Check database for enhancement logs');
      console.log('   3. Try batch processing with more images\n');
    } else {
      console.error('❌ Enhancement failed:', result.error);
    }

  } catch (error: any) {
    console.error('\n❌ Demo failed:', error.message);
    console.error('\nStack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

function showDemoEnhancement() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('📝 DEMO: Expected AI-Generated Description');
  console.log('═══════════════════════════════════════════════════════');
  console.log(
    'Professional water damage mitigation deployment utilizing industry-standard restoration equipment including DryAir inflatable air chamber drying mat system and industrial-grade dehumidification unit. Affected timber flooring substrate exhibits visible moisture infiltration requiring controlled environmental drying conditions established through polyethylene containment barrier installation per AS/NZS 3760 safety protocols. Equipment configuration demonstrates adherence to structured drying methodology with optimized airflow pathways and moisture extraction systems to prevent secondary microbial colonisation and progressive structural timber degradation in accordance with Australian building code requirements.'
  );
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('💰 Estimated Cost: $0.0024 USD');
  console.log('⏱️  Estimated Time: 2-3 seconds\n');

  console.log('🎯 E.E.A.T. Quality Elements:');
  console.log('   ✅ Industry standards referenced');
  console.log('   ✅ AS/NZS 3760 safety protocols cited');
  console.log('   ✅ Technical terminology (moisture infiltration, microbial colonisation)');
  console.log('   ✅ Australian English spelling (colonisation, optimised)\n');

  console.log('📝 To enable live AI enhancement:');
  console.log('   1. Ensure OPENAI_API_KEY is set in .env.local');
  console.log('   2. Restart the dev server');
  console.log('   3. Run this script again\n');
}

main();
