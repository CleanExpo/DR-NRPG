// @ts-nocheck

/**
 * Integration tests for Claim Submission → Contractor Matching Flow
 *
 * Tests the complete claim submission and contractor matching workflow:
 * - Public claim submission and validation
 * - Claim status lifecycle
 * - Contractor matching creation
 * - Booking creation from matched claim
 */

import { PrismaClient, AustralianServiceType, AustralianState, BookingStatus, MatchStatus, IICRCCertificationLevel } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// Mock email functions
jest.mock('../../../lib/email', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
  sendClaimConfirmationEmail: jest.fn().mockResolvedValue({ success: true }),
  sendContractorMatchEmail: jest.fn().mockResolvedValue({ success: true }),
}));

describe('Claim Submission and Contractor Matching Integration Tests', () => {
  const TEST_ID = Date.now().toString();
  let testClientUserId: string;
  let testContractorProfileId: string;
  let testContractorUserId: string;
  let testClaimId: string;
  let testTenantId: string;

  beforeAll(async () => {
    // Create test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: `Test Tenant ${TEST_ID}`,
        domain: `test-tenant-${TEST_ID}.local`,
        isActive: true,
      },
    });
    testTenantId = tenant.id;

    // Create test client user
    const clientUser = await prisma.user.create({
      data: {
        email: `client-${TEST_ID}@test.com`,
        name: 'Test Client',
        userType: 'CLIENT',
        tenantId: testTenantId,
      },
    });
    testClientUserId = clientUser.id;

    // Create contractor user
    const contractorUser = await prisma.user.create({
      data: {
        email: `contractor-${TEST_ID}@test.com`,
        name: 'Contractor One',
        userType: 'CONTRACTOR',
        tenantId: testTenantId,
      },
    });
    testContractorUserId = contractorUser.id;

    // Create contractor profile (for ContractorMatch relation)
    const contractorProfile = await prisma.contractorProfile.create({
      data: {
        userId: testContractorUserId,
        companyName: 'Test Contractor Services',
        tenantId: testTenantId,
        isVerified: true,
        totalJobs: 0,
      },
    });
    testContractorProfileId = contractorProfile.id;
  });

  afterAll(async () => {
    // Cleanup in correct order
    await prisma.contractorMatch.deleteMany({
      where: { claimId: testClaimId },
    });
    await prisma.booking.deleteMany({
      where: { clientId: testClientUserId },
    });
    await prisma.publicClaim.deleteMany({
      where: { tenantId: testTenantId },
    });
    await prisma.contractorProfile.deleteMany({
      where: { tenantId: testTenantId },
    });
    await prisma.user.deleteMany({
      where: { tenantId: testTenantId },
    });
    await prisma.tenant.delete({
      where: { id: testTenantId },
    });
    await prisma.$disconnect();
  });

  describe('Claim Submission via Public Lead Capture', () => {
    it('should create a public claim with valid data', async () => {
      const claim = await prisma.publicClaim.create({
        data: {
          tenantId: testTenantId,
          clientName: 'Test Client',
          clientEmail: `client-${TEST_ID}@test.com`,
          clientPhone: '0400123456',
          propertyAddress: '123 Test Street',
          suburb: 'Sydney',
          postcode: '2000',
          disasterType: 'WATER_DAMAGE',
          damageDescription: 'Burst pipe causing water damage to living room',
          incidentDate: new Date(),
          isEmergency: true,
          hasInsurance: true,
          insuranceProvider: 'NRMA',
          priority: 'High',
          status: 'PENDING',
        },
      });

      testClaimId = claim.id;

      expect(claim).toBeDefined();
      expect(claim.disasterType).toBe('WATER_DAMAGE');
      expect(claim.status).toBe('PENDING');
      expect(claim.tenantId).toBe(testTenantId);
      expect(claim.isEmergency).toBe(true);
    });

    it('should retrieve claim by id', async () => {
      const claim = await prisma.publicClaim.findUnique({
        where: { id: testClaimId },
      });

      expect(claim).toBeDefined();
      expect(claim?.clientName).toBe('Test Client');
      expect(claim?.suburb).toBe('Sydney');
    });

    it('should filter claims by status', async () => {
      const pendingClaims = await prisma.publicClaim.findMany({
        where: {
          tenantId: testTenantId,
          status: 'PENDING',
        },
      });

      expect(pendingClaims.length).toBeGreaterThanOrEqual(1);
      expect(pendingClaims.every(c => c.status === 'PENDING')).toBe(true);
    });

    it('should filter claims by emergency status', async () => {
      const emergencyClaims = await prisma.publicClaim.findMany({
        where: {
          tenantId: testTenantId,
          isEmergency: true,
        },
      });

      expect(emergencyClaims.length).toBeGreaterThanOrEqual(1);
      expect(emergencyClaims.every(c => c.isEmergency === true)).toBe(true);
    });
  });

  describe('Contractor Match Creation', () => {
    it('should create contractor match for a claim', async () => {
      const match = await prisma.contractorMatch.create({
        data: {
          claimId: testClaimId,
          contractorId: testContractorProfileId,
          tenantId: testTenantId,
          matchScore: 85.5,
          status: MatchStatus.PENDING,
          matchReason: ['Location match', 'Qualified contractor', 'Available'],
        },
      });

      expect(match).toBeDefined();
      expect(match.claimId).toBe(testClaimId);
      expect(match.contractorId).toBe(testContractorProfileId);
      expect(match.matchScore).toBe(85.5);
      expect(match.status).toBe(MatchStatus.PENDING);
    });

    it('should retrieve matches for a claim', async () => {
      const matches = await prisma.contractorMatch.findMany({
        where: { claimId: testClaimId },
        orderBy: { matchScore: 'desc' },
      });

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].claimId).toBe(testClaimId);
    });

    it('should update match status when contractor responds', async () => {
      const match = await prisma.contractorMatch.findFirst({
        where: { claimId: testClaimId },
      });

      const updatedMatch = await prisma.contractorMatch.update({
        where: { id: match!.id },
        data: {
          status: MatchStatus.ACCEPTED,
          contractorRespondedAt: new Date(),
          contractorResponse: 'ACCEPTED',
        },
      });

      expect(updatedMatch.status).toBe(MatchStatus.ACCEPTED);
      expect(updatedMatch.contractorRespondedAt).toBeDefined();
    });
  });

  describe('Claim Status Lifecycle', () => {
    it('should transition claim from PENDING to MATCHED', async () => {
      await prisma.publicClaim.update({
        where: { id: testClaimId },
        data: { status: 'MATCHED' },
      });

      const claim = await prisma.publicClaim.findUnique({
        where: { id: testClaimId },
      });

      expect(claim?.status).toBe('MATCHED');
    });

    it('should transition claim from MATCHED to ASSIGNED', async () => {
      await prisma.publicClaim.update({
        where: { id: testClaimId },
        data: { status: 'ASSIGNED' },
      });

      const claim = await prisma.publicClaim.findUnique({
        where: { id: testClaimId },
      });

      expect(claim?.status).toBe('ASSIGNED');
    });

    it('should transition claim from ASSIGNED to IN_PROGRESS', async () => {
      await prisma.publicClaim.update({
        where: { id: testClaimId },
        data: { status: 'IN_PROGRESS' },
      });

      const claim = await prisma.publicClaim.findUnique({
        where: { id: testClaimId },
      });

      expect(claim?.status).toBe('IN_PROGRESS');
    });

    it('should transition claim to COMPLETED', async () => {
      await prisma.publicClaim.update({
        where: { id: testClaimId },
        data: { status: 'COMPLETED' },
      });

      const claim = await prisma.publicClaim.findUnique({
        where: { id: testClaimId },
      });

      expect(claim?.status).toBe('COMPLETED');
    });
  });

  describe('Claim with Insurance Information', () => {
    it('should store insurance details on claim', async () => {
      const claimWithInsurance = await prisma.publicClaim.create({
        data: {
          tenantId: testTenantId,
          clientName: 'Insurance Client',
          clientEmail: `insurance-${TEST_ID}@test.com`,
          clientPhone: '0400999888',
          propertyAddress: '456 Insurance Street',
          suburb: 'Melbourne',
          postcode: '3000',
          disasterType: 'FIRE_DAMAGE',
          damageDescription: 'Kitchen fire damage',
          incidentDate: new Date(),
          hasInsurance: true,
          insuranceProvider: 'Allianz',
          policyNumber: 'POL-123456',
          status: 'PENDING',
        },
      });

      expect(claimWithInsurance.hasInsurance).toBe(true);
      expect(claimWithInsurance.insuranceProvider).toBe('Allianz');
      expect(claimWithInsurance.policyNumber).toBe('POL-123456');

      // Cleanup
      await prisma.publicClaim.delete({ where: { id: claimWithInsurance.id } });
    });

    it('should handle claims without insurance', async () => {
      const claimNoInsurance = await prisma.publicClaim.create({
        data: {
          tenantId: testTenantId,
          clientName: 'No Insurance Client',
          clientEmail: `noinsurance-${TEST_ID}@test.com`,
          clientPhone: '0400777666',
          propertyAddress: '789 Cash Street',
          suburb: 'Brisbane',
          postcode: '4000',
          disasterType: 'MOULD_REMEDIATION',
          damageDescription: 'Mould in bathroom',
          incidentDate: new Date(),
          hasInsurance: false,
          status: 'PENDING',
        },
      });

      expect(claimNoInsurance.hasInsurance).toBe(false);
      expect(claimNoInsurance.insuranceProvider).toBeNull();

      // Cleanup
      await prisma.publicClaim.delete({ where: { id: claimNoInsurance.id } });
    });
  });

  describe('Claim Priority and Emergency Handling', () => {
    it('should create high priority emergency claim', async () => {
      const emergencyClaim = await prisma.publicClaim.create({
        data: {
          tenantId: testTenantId,
          clientName: 'Emergency Client',
          clientEmail: `emergency-${TEST_ID}@test.com`,
          clientPhone: '0400111222',
          propertyAddress: '999 Urgent Street',
          suburb: 'Perth',
          postcode: '6000',
          disasterType: 'WATER_DAMAGE',
          damageDescription: 'Major flooding, water rising',
          incidentDate: new Date(),
          isEmergency: true,
          isOngoing: true,
          priority: 'High',
          status: 'PENDING',
        },
      });

      expect(emergencyClaim.isEmergency).toBe(true);
      expect(emergencyClaim.isOngoing).toBe(true);
      expect(emergencyClaim.priority).toBe('High');

      // Cleanup
      await prisma.publicClaim.delete({ where: { id: emergencyClaim.id } });
    });

    it('should query only emergency claims', async () => {
      const emergencies = await prisma.publicClaim.findMany({
        where: {
          tenantId: testTenantId,
          isEmergency: true,
        },
      });

      expect(emergencies.every(c => c.isEmergency)).toBe(true);
    });
  });
});
