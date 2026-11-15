/**
 * Seed Test Data Script
 *
 * Creates comprehensive test data for the Disaster Recovery NRPG Platform
 * including users, customers, contractors, opportunities, bookings, and inspection reports.
 *
 * Run: npx tsx scripts/seed-test-data.ts
 */

import { PrismaClient, CustomerLifecycleStage, OpportunityStage, ActivityType, AustralianState, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 Starting test data seeding...\n');

  try {
    // ========================================
    // 1. Create Test Users (Clients)
    // ========================================
    console.log('👥 Creating test clients...');

    const clients = await Promise.all([
      prisma.user.create({
        data: {
          email: 'john.smith@example.com',
          name: 'John Smith',
          password: '$2a$10$hashedpassword', // bcrypt hash of 'password123'
          userType: 'CLIENT',
          australianPhoneNumber: '+61412345001',
          australianState: 'VIC',
          australianPostcode: '3000',
          suburb: 'Melbourne',
          streetAddress: '123 Collins St',
          isEmailVerified: true,
          isActive: true,
        },
      }),
      prisma.user.create({
        data: {
          email: 'sarah.jones@example.com',
          name: 'Sarah Jones',
          password: '$2a$10$hashedpassword',
          userType: 'CLIENT',
          australianPhoneNumber: '+61412345002',
          australianState: 'NSW',
          australianPostcode: '2000',
          suburb: 'Sydney',
          streetAddress: '456 George St',
          isEmailVerified: true,
          isActive: true,
        },
      }),
      prisma.user.create({
        data: {
          email: 'michael.brown@example.com',
          name: 'Michael Brown',
          password: '$2a$10$hashedpassword',
          userType: 'CLIENT',
          australianPhoneNumber: '+61412345003',
          australianState: 'QLD',
          australianPostcode: '4000',
          suburb: 'Brisbane',
          streetAddress: '789 Queen St',
          isEmailVerified: true,
          isActive: true,
        },
      }),
    ]);

    console.log(`✅ Created ${clients.length} test clients\n`);

    // ========================================
    // 2. Create Customer Lifecycles
    // ========================================
    console.log('📊 Creating customer lifecycles...');

    const lifecycles = await Promise.all(
      clients.map((client, index) =>
        prisma.customerLifecycle.create({
          data: {
            userId: client.id,
            currentStage: index === 0 ? 'CUSTOMER' : index === 1 ? 'OPPORTUNITY' : 'LEAD',
            totalInteractions: index === 0 ? 12 : index === 1 ? 5 : 1,
            lastInteractionDate: new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000),
            daysSinceLastContact: index * 7,
            lifetimeValueAUD: new Prisma.Decimal(index === 0 ? 15000 : index === 1 ? 5000 : 0),
            averageJobValueAUD: new Prisma.Decimal(index === 0 ? 7500 : index === 1 ? 5000 : 0),
            totalJobsCompleted: index === 0 ? 2 : index === 1 ? 1 : 0,
            healthScore: index === 0 ? 85 : index === 1 ? 60 : 50,
            churnRiskScore: index === 0 ? 10 : index === 1 ? 25 : 0,
            isAtRisk: false,
          },
        })
      )
    );

    console.log(`✅ Created ${lifecycles.length} customer lifecycles\n`);

    // ========================================
    // 3. Create Opportunities
    // ========================================
    console.log('💼 Creating opportunities...');

    const opportunities = [
      await prisma.opportunity.create({
        data: {
          customerLifecycleId: lifecycles[0].id,
          name: 'Water Damage Restoration - Melbourne CBD Office',
          stage: 'CLOSED_WON',
          estimatedValueAUD: new Prisma.Decimal(8500.00),
          probabilityPercent: 100,
          australianServiceType: 'WATER_DAMAGE',
          urgencyLevel: 'URGENT',
          serviceState: 'VIC',
          servicePostcode: '3000',
          expectedCloseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          actualCloseDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        },
      }),
      await prisma.opportunity.create({
        data: {
          customerLifecycleId: lifecycles[0].id,
          name: 'Mold Remediation - Residential Property',
          stage: 'CLOSED_WON',
          estimatedValueAUD: new Prisma.Decimal(6500.00),
          probabilityPercent: 100,
          australianServiceType: 'MOULD_REMEDIATION',
          urgencyLevel: 'STANDARD',
          serviceState: 'VIC',
          servicePostcode: '3000',
          expectedCloseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          actualCloseDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
        },
      }),
      await prisma.opportunity.create({
        data: {
          customerLifecycleId: lifecycles[1].id,
          name: 'Fire Damage Restoration - Sydney Warehouse',
          stage: 'PROPOSAL',
          estimatedValueAUD: new Prisma.Decimal(25000.00),
          probabilityPercent: 70,
          australianServiceType: 'FIRE_DAMAGE',
          urgencyLevel: 'HIGH',
          serviceState: 'NSW',
          servicePostcode: '2000',
          expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      }),
      await prisma.opportunity.create({
        data: {
          customerLifecycleId: lifecycles[2].id,
          name: 'Water Damage Assessment - Brisbane Apartment',
          stage: 'DISCOVERY',
          estimatedValueAUD: new Prisma.Decimal(4500.00),
          probabilityPercent: 30,
          australianServiceType: 'WATER_DAMAGE',
          urgencyLevel: 'STANDARD',
          serviceState: 'QLD',
          servicePostcode: '4000',
          expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ];

    console.log(`✅ Created ${opportunities.length} opportunities\n`);

    // ========================================
    // 4. Create Activities
    // ========================================
    console.log('📝 Creating activities...');

    const activities = await Promise.all([
      prisma.activity.create({
        data: {
          customerLifecycleId: lifecycles[0].id,
          opportunityId: opportunities[0].id,
          type: 'CALL',
          subject: 'Initial Emergency Call',
          description: 'Customer called about water damage in office building',
          outcome: 'Scheduled emergency assessment for next day',
          performedById: clients[0].id,
          customerId: clients[0].id,
          activityDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          durationMinutes: 15,
          sentiment: 'urgent',
        },
      }),
      prisma.activity.create({
        data: {
          customerLifecycleId: lifecycles[0].id,
          opportunityId: opportunities[0].id,
          type: 'INSPECTION',
          subject: 'On-site Water Damage Assessment',
          description: 'Conducted comprehensive industry-standard inspection',
          outcome: 'Category 2 water damage, immediate extraction required',
          performedById: clients[0].id,
          customerId: clients[0].id,
          activityDate: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
          durationMinutes: 90,
          sentiment: 'positive',
        },
      }),
      prisma.activity.create({
        data: {
          customerLifecycleId: lifecycles[0].id,
          opportunityId: opportunities[0].id,
          type: 'QUOTE_SENT',
          subject: 'Detailed Quote Sent',
          description: 'Sent comprehensive quote with IICRC compliance documentation',
          outcome: 'Customer approved quote same day',
          performedById: clients[0].id,
          customerId: clients[0].id,
          activityDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
          sentiment: 'positive',
          sentimentScore: 0.9,
        },
      }),
      prisma.activity.create({
        data: {
          customerLifecycleId: lifecycles[0].id,
          opportunityId: opportunities[0].id,
          type: 'BOOKING_CREATED',
          subject: 'Service Booking Confirmed',
          description: 'Water damage restoration service scheduled',
          outcome: 'Work completed successfully in 3 days',
          performedById: clients[0].id,
          customerId: clients[0].id,
          activityDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000),
          sentiment: 'positive',
        },
      }),
      prisma.activity.create({
        data: {
          customerLifecycleId: lifecycles[1].id,
          opportunityId: opportunities[2].id,
          type: 'EMAIL',
          subject: 'Fire Damage Restoration Proposal',
          description: 'Sent detailed proposal for warehouse fire damage',
          performedById: clients[1].id,
          customerId: clients[1].id,
          activityDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          sentiment: 'neutral',
        },
      }),
      prisma.activity.create({
        data: {
          customerLifecycleId: lifecycles[2].id,
          opportunityId: opportunities[3].id,
          type: 'NOTE',
          subject: 'Initial Inquiry Received',
          description: 'Customer submitted online form for water damage assessment',
          performedById: clients[2].id,
          customerId: clients[2].id,
          activityDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          sentiment: 'neutral',
        },
      }),
    ]);

    console.log(`✅ Created ${activities.length} activities\n`);

    // ========================================
    // 5. Create Tasks
    // ========================================
    console.log('✅ Creating tasks...');

    const tasks = await Promise.all([
      prisma.task.create({
        data: {
          customerLifecycleId: lifecycles[1].id,
          opportunityId: opportunities[2].id,
          title: 'Follow up on fire damage proposal',
          description: 'Customer requested 48 hours to review. Follow up Friday afternoon.',
          assignedToId: clients[1].id,
          createdById: clients[1].id,
          priority: 'HIGH',
          status: 'TODO',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          reminderDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          isOverdue: false,
        },
      }),
      prisma.task.create({
        data: {
          customerLifecycleId: lifecycles[2].id,
          opportunityId: opportunities[3].id,
          title: 'Schedule Brisbane apartment inspection',
          description: 'Customer available Tuesday morning for on-site assessment',
          assignedToId: clients[2].id,
          createdById: clients[2].id,
          priority: 'MEDIUM',
          status: 'TODO',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          isOverdue: false,
        },
      }),
    ]);

    console.log(`✅ Created ${tasks.length} tasks\n`);

    // ========================================
    // 6. Create Business Rules
    // ========================================
    console.log('⚖️ Creating business rules...');

    const businessRules = await Promise.all([
      prisma.businessRule.create({
        data: {
          name: 'Response Time SLA',
          description: 'All urgent inquiries must receive response within 2 hours',
          ruleType: 'RESPONSE_TIME',
          metric: 'RESPONSE_TIME',
          threshold: new Prisma.Decimal(120),
          comparison: 'less_than',
          actionOnViolation: ['send_alert', 'create_task', 'notify_manager'],
          ownerId: clients[0].id,
          isActive: true,
        },
      }),
      prisma.businessRule.create({
        data: {
          name: 'Opportunity Conversion Rate',
          description: 'Conversion rate must stay above 15%',
          ruleType: 'CONVERSION_THRESHOLD',
          metric: 'CONVERSION_RATE',
          threshold: new Prisma.Decimal(15),
          comparison: 'greater_than',
          actionOnViolation: ['send_alert', 'create_report'],
          ownerId: clients[0].id,
          isActive: true,
        },
      }),
      prisma.businessRule.create({
        data: {
          name: 'Customer Churn Prevention',
          description: 'Customers with health score < 30 require intervention',
          ruleType: 'CHURN_PREVENTION',
          metric: 'CUSTOMER_SATISFACTION',
          threshold: new Prisma.Decimal(30),
          comparison: 'greater_than',
          actionOnViolation: ['create_task', 'send_alert'],
          ownerId: clients[0].id,
          isActive: true,
        },
      }),
      prisma.businessRule.create({
        data: {
          name: 'Revenue Target Tracking',
          description: 'Monthly revenue must meet 80% of target by day 20',
          ruleType: 'REVENUE_TRACKING',
          metric: 'REVENUE_TARGET',
          threshold: new Prisma.Decimal(80),
          comparison: 'greater_than',
          actionOnViolation: ['send_alert', 'create_report', 'schedule_meeting'],
          ownerId: clients[0].id,
          isActive: true,
        },
      }),
    ]);

    console.log(`✅ Created ${businessRules.length} business rules\n`);

    // ========================================
    // 7. Create Test Contractor
    // ========================================
    console.log('🔧 Creating test contractor...');

    const contractorUser = await prisma.user.create({
      data: {
        email: 'contractor@nrpg.com.au',
        name: 'Expert Restoration Services',
        password: '$2a$10$hashedpassword',
        userType: 'CONTRACTOR',
        australianPhoneNumber: '+61412345100',
        australianState: 'VIC',
        australianPostcode: '3001',
        isEmailVerified: true,
        isActive: true,
      },
    });

    const contractor = await prisma.contractor.create({
      data: {
        userId: contractorUser.id,
        businessName: 'Expert Restoration Services Pty Ltd',
        abnNumber: '12345678901',
        primaryState: 'VIC',
        operatingStates: ['VIC', 'NSW'],
        australianSpecialties: ['WATER_DAMAGE', 'FIRE_DAMAGE', 'MOULD_REMEDIATION'],
        supportedEmergencyLevels: ['URGENT', 'HIGH', 'STANDARD'],
        publicLiabilityPolicyNumber: 'PL-2025-001',
        publicLiabilityExpiryDate: new Date('2026-12-31'),
        completedJobs: 145,
        averageRating: new Prisma.Decimal(4.8),
        averageResponseTimeMinutes: 45,
        isVerified: true,
        isActive: true,
      },
    });

    console.log(`✅ Created test contractor\n`);

    // ========================================
    // 8. Create Sample Bookings
    // ========================================
    console.log('📅 Creating sample bookings...');

    const bookings = await Promise.all([
      prisma.booking.create({
        data: {
          clientId: clients[0].id,
          contractorId: contractor.id,
          australianServiceType: 'WATER_DAMAGE',
          description: 'Emergency water damage restoration - burst pipe in office',
          servicePostcode: '3000',
          serviceState: 'VIC',
          serviceSuburb: 'Melbourne',
          streetAddress: '123 Collins St',
          status: 'COMPLETED',
          emergencyResponseLevel: 'URGENT',
          scheduledDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          startedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
          estimatedCostAUD: new Prisma.Decimal(8500.00),
          finalCostAUD: new Prisma.Decimal(8750.00),
          damagePhotos: [],
        },
      }),
      prisma.booking.create({
        data: {
          clientId: clients[1].id,
          contractorId: contractor.id,
          australianServiceType: 'FIRE_DAMAGE',
          description: 'Fire damage assessment and restoration planning',
          servicePostcode: '2000',
          serviceState: 'NSW',
          serviceSuburb: 'Sydney',
          streetAddress: '456 George St',
          status: 'PENDING',
          emergencyResponseLevel: 'HIGH',
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          estimatedCostAUD: new Prisma.Decimal(25000.00),
          damagePhotos: [],
        },
      }),
    ]);

    console.log(`✅ Created ${bookings.length} bookings\n`);

    // ========================================
    // 9. Create Sample Inspection Report
    // ========================================
    console.log('📋 Creating sample inspection report...');

    const inspectionReport = await prisma.inspectionReport.create({
      data: {
        reportNumber: 'NRPG-2025-0001',
        bookingId: bookings[0].id,
        inspectorId: contractorUser.id,
        inspectionDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        jurisdiction: 'VIC',
        applicableCodes: ['Victorian Building Regulations 2018', 'NCC 2022'],
        iicrcStandards: ['S500_WATER_DAMAGE', 'WRT_WATER_RESTORATION'],
        status: 'APPROVED',
        isDraft: false,
        version: 1,
        executiveSummary: 'Comprehensive water damage assessment following burst pipe incident. Category 2 water damage affecting 3 rooms. Immediate extraction and drying completed successfully.',
        scopeOfWork: 'Water extraction, structural drying, moisture monitoring, antimicrobial treatment, and final restoration.',
        findings: 'Category 2 water damage in master bedroom (25.5 sqm), ensuite bathroom (8 sqm), and living room (40 sqm). Initial moisture readings ranged from 45-78%. All areas dried to target levels within 72 hours. No mold growth detected.',
        recommendations: 'Monitor moisture levels weekly for next month. Increase ventilation in affected areas. Consider upgrading plumbing to prevent future incidents.',
        complianceStatus: 'COMPLIANT',
        pdfUrl: 'https://storage.example.com/reports/NRPG-2025-0001.pdf',
        pdfGeneratedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
        pdfVersion: 1,
        createdBy: contractorUser.id,
        technicalReviewerId: contractorUser.id,
        technicalReviewDate: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
        managerReviewerId: contractorUser.id,
        managerReviewDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
        finalApproverId: contractorUser.id,
        finalApprovalDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
      },
    });

    console.log(`✅ Created inspection report: ${inspectionReport.reportNumber}\n`);

    // ========================================
    // 10. Create Damage Areas for Report
    // ========================================
    console.log('🏚️ Creating damage areas...');

    const damageAreas = await Promise.all([
      prisma.damageArea.create({
        data: {
          reportId: inspectionReport.id,
          areaName: 'Master Bedroom',
          floor: 'Level 2',
          roomType: 'Bedroom',
          damageCategory: 'CATEGORY_2',
          affectedArea: 25.5,
          affectedMaterials: ['Carpet', 'Drywall', 'Baseboards'],
          initialMoistureLevel: 65.5,
          targetMoistureLevel: 12.0,
          description: 'Water damage from burst pipe overhead. Carpet saturated, drywall moisture detected.',
          severity: 'Moderate',
          requiredActions: ['Remove carpet', 'Extract water', 'Set up drying equipment', 'Monitor daily'],
          equipmentNeeded: ['Air movers x3', 'Dehumidifier x1', 'Moisture meter'],
          estimatedDryingTime: 72,
          estimatedCost: 3500.00,
        },
      }),
      prisma.damageArea.create({
        data: {
          reportId: inspectionReport.id,
          areaName: 'Living Room',
          floor: 'Level 1',
          roomType: 'Living Room',
          damageCategory: 'CATEGORY_2',
          affectedArea: 40.0,
          affectedMaterials: ['Hardwood flooring', 'Drywall', 'Baseboards'],
          initialMoistureLevel: 78.5,
          targetMoistureLevel: 10.0,
          description: 'Extensive water damage from ceiling leak. Hardwood buckling observed.',
          severity: 'Severe',
          requiredActions: ['Remove damaged flooring', 'Dry structural elements', 'Replace materials'],
          equipmentNeeded: ['Water extractors', 'Air movers x4', 'Dehumidifier x2', 'HEPA air scrubber'],
          estimatedDryingTime: 96,
          estimatedCost: 6500.00,
        },
      }),
    ]);

    console.log(`✅ Created ${damageAreas.length} damage areas\n`);

    // ========================================
    // 11. Create Moisture Readings
    // ========================================
    console.log('💧 Creating moisture readings...');

    const moistureReadings = await Promise.all([
      prisma.moistureReading.create({
        data: {
          reportId: inspectionReport.id,
          readingDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          location: 'Master Bedroom - Center',
          material: 'Carpet',
          moistureContent: 65.5,
          ambientTemperature: 22.0,
          ambientHumidity: 55.0,
          meterType: 'Pin-type',
          readingDepth: 'Surface',
          notes: 'Initial reading - heavily saturated',
        },
      }),
      prisma.moistureReading.create({
        data: {
          reportId: inspectionReport.id,
          readingDate: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
          location: 'Master Bedroom - Center',
          material: 'Carpet',
          moistureContent: 35.2,
          ambientTemperature: 21.5,
          ambientHumidity: 45.0,
          meterType: 'Pin-type',
          readingDepth: 'Surface',
          notes: 'Day 2 - drying progress good',
        },
      }),
      prisma.moistureReading.create({
        data: {
          reportId: inspectionReport.id,
          readingDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
          location: 'Master Bedroom - Center',
          material: 'Carpet',
          moistureContent: 11.8,
          ambientTemperature: 21.0,
          ambientHumidity: 42.0,
          meterType: 'Pin-type',
          readingDepth: 'Surface',
          notes: 'Day 4 - target moisture achieved',
        },
      }),
    ]);

    console.log(`✅ Created ${moistureReadings.length} moisture readings\n`);

    // ========================================
    // Summary
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST DATA SEEDING COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   Clients: ${clients.length}`);
    console.log(`   Customer Lifecycles: ${lifecycles.length}`);
    console.log(`   Opportunities: ${opportunities.length}`);
    console.log(`   Activities: ${activities.length}`);
    console.log(`   Tasks: ${tasks.length}`);
    console.log(`   Business Rules: ${businessRules.length}`);
    console.log(`   Contractors: 1`);
    console.log(`   Bookings: ${bookings.length}`);
    console.log(`   Inspection Reports: 1`);
    console.log(`   Damage Areas: ${damageAreas.length}`);
    console.log(`   Moisture Readings: ${moistureReadings.length}`);
    console.log('\n🌐 Access the system at: http://localhost:3000');
    console.log('\n📧 Test Credentials:');
    console.log('   Client: john.smith@example.com / password123');
    console.log('   Contractor: contractor@nrpg.com.au / password123');
    console.log('\n✅ CRM Dashboard: http://localhost:3000/dashboard/crm/customers');
    console.log('✅ Pipeline: http://localhost:3000/dashboard/crm/pipeline');
    console.log('✅ Inspections: http://localhost:3000/dashboard/inspections\n');

  } catch (error) {
    console.error('\n❌ Error seeding test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedTestData()
  .then(() => {
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
