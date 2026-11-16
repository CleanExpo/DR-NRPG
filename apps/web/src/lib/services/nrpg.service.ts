/**
 * NRPG (National Restoration Professionals Group) Integration Service
 *
 * Handles NRPG member verification, contractor registration, and industry certification
 * - Member lookup and verification
 * - Contractor registration workflow
 * - Industry certification validation
 */

import { AustralianServiceType, AustralianState, IICRCCertificationLevel } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  australianABNSchema,
  australianACNSchema,
  australianPhoneSchema,
  validateABNChecksum,
} from '@/lib/validation/australia';

// ============================================================================
// TYPES
// ============================================================================

export interface NRPGMemberLookupResult {
  found: boolean;
  memberId?: string;
  businessName?: string;
  verificationStatus?: 'VERIFIED' | 'PENDING' | 'SUSPENDED' | 'REJECTED';
  abnNumber?: string;
  iicrcCertifications?: Array<{
    level: IICRCCertificationLevel;
    code: string;
    expiryDate: Date;
    isActive: boolean;
  }>;
  operatingStates?: AustralianState[];
  error?: string;
}

export interface ContractorRegistrationInput {
  businessName: string;
  abnNumber: string;
  acnNumber?: string;
  phone: string;
  email: string;
  iicrcLevel: IICRCCertificationLevel;
  iicrcCertificationCode: string;
  iicrcCertificationDate: Date;
  iicrcExpiryDate: Date;
  iicrcCertificateFile: string;
  insuranceCertificateFile?: string;
  operatingStates: AustralianState[];
  servicePostcodes: string[];
  specialties: AustralianServiceType[];
  publicLiabilityPolicyNumber: string;
  publicLiabilityExpiryDate: Date;
}

export interface ContractorRegistrationResult {
  success: boolean;
  contractorId?: string;
  nrpgMemberId?: string;
  verificationLevel?: string;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================================================
// NRPG MEMBER LOOKUP
// ============================================================================

/**
 * Look up an NRPG member by ABN
 * In production, this would connect to NRPG's API
 * For now, we implement local verification
 */
export async function lookupNRPGMember(
  abnNumber: string
): Promise<NRPGMemberLookupResult> {
  try {
    // Validate ABN format and checksum
    if (!validateABNChecksum(abnNumber)) {
      return {
        found: false,
        error: 'Invalid ABN checksum',
      };
    }

    // Check if contractor exists locally
    const existingContractor = await prisma.contractor.findUnique({
      where: { abnNumber },
      include: {
        iicrcCertifications: true,
      },
    });

    if (!existingContractor) {
      return {
        found: false,
        error: 'Contractor not found in NRPG registry',
      };
    }

    return {
      found: true,
      memberId: existingContractor.nrpgMemberId || undefined,
      businessName: existingContractor.businessName,
      verificationStatus: (existingContractor.nrpgVerificationLevel as any) || 'PENDING',
      abnNumber: existingContractor.abnNumber || undefined,
      iicrcCertifications: existingContractor.iicrcCertifications.map((cert) => ({
        level: cert.certificationLevel,
        code: cert.certificationCode,
        expiryDate: cert.expiryDate,
        isActive: cert.isActive,
      })),
      operatingStates: existingContractor.operatingStates,
    };
  } catch (error) {
    console.error('Error looking up NRPG member:', error);
    return {
      found: false,
      error: 'Error looking up NRPG member',
    };
  }
}

// ============================================================================
// CONTRACTOR REGISTRATION
// ============================================================================

/**
 * Register a new contractor with NRPG
 * Validates all input data, creates contractor profile, and initiates verification
 */
export async function registerContractor(
  input: ContractorRegistrationInput,
  userId: string
): Promise<ContractorRegistrationResult> {
  const errors: Record<string, string[]> = {};

  try {
    // Validate ABN
    try {
      australianABNSchema.parse(input.abnNumber);
    } catch (error: any) {
      errors.abnNumber = error.errors?.map((e: any) => e.message) || [
        'Invalid ABN',
      ];
    }

    // Validate ACN if provided
    if (input.acnNumber) {
      try {
        australianACNSchema.parse(input.acnNumber);
      } catch (error: any) {
        errors.acnNumber = error.errors?.map((e: any) => e.message) || [
          'Invalid ACN',
        ];
      }
    }

    // Validate phone
    try {
      australianPhoneSchema.parse(input.phone);
    } catch (error: any) {
      errors.phone = error.errors?.map((e: any) => e.message) || [
        'Invalid phone number',
      ];
    }

    // If validation errors exist, return early
    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: 'Validation errors occurred',
        errors,
      };
    }

    // Check if ABN is already registered to a DIFFERENT user
    if (input.abnNumber) {
      const abnConflict = await prisma.contractor.findFirst({
        where: {
          abnNumber: input.abnNumber,
          NOT: { userId },
        },
        select: { id: true },
      });

      if (abnConflict) {
        return {
          success: false,
          message: 'ABN already registered to another account in NRPG',
        };
      }
    }

    // Generate NRPG Member ID (format: NRPG-YYYY-XXXXXX)
    const year = new Date().getFullYear();
    const randomId = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    const nrpgMemberId = `NRPG-${year}-${randomId}`;

    // Upsert contractor profile — handles the case where a minimal Contractor
    // record was created by the onboarding/start flow (businessName only, no ABN).
    const contractor = await prisma.contractor.upsert({
      where: { userId },
      create: {
        userId,
        businessName: input.businessName,
        abnNumber: input.abnNumber,
        acnNumber: input.acnNumber,
        primaryState: input.operatingStates[0],
        operatingStates: input.operatingStates,
        australianSpecialties: input.specialties,
        nrpgMemberId,
        nrpgVerificationLevel: 'PENDING',
        publicLiabilityPolicyNumber: input.publicLiabilityPolicyNumber,
        publicLiabilityExpiryDate: input.publicLiabilityExpiryDate,
        publicLiabilityCertificateUrl: input.insuranceCertificateFile,
      },
      update: {
        businessName: input.businessName,
        abnNumber: input.abnNumber,
        acnNumber: input.acnNumber,
        primaryState: input.operatingStates[0],
        operatingStates: input.operatingStates,
        australianSpecialties: input.specialties,
        nrpgMemberId,
        nrpgVerificationLevel: 'PENDING',
        publicLiabilityPolicyNumber: input.publicLiabilityPolicyNumber,
        publicLiabilityExpiryDate: input.publicLiabilityExpiryDate,
        publicLiabilityCertificateUrl: input.insuranceCertificateFile,
      },
    });

    // Create industry certification record
    await prisma.iICRCCertification.create({
      data: {
        contractorId: contractor.id,
        certificationLevel: input.iicrcLevel,
        certificationCode: input.iicrcCertificationCode,
        certificationDate: input.iicrcCertificationDate,
        expiryDate: input.iicrcExpiryDate,
        certificatePdfUrl: input.iicrcCertificateFile,
        isActive: true,
      },
    });

    // Create service areas for each postcode
    for (const postcode of input.servicePostcodes) {
      await prisma.contractorServiceArea.create({
        data: {
          contractorId: contractor.id,
          postcode,
          state: getStateFromPostcode(postcode),
          responseTimeMinutes: 120, // Default 2-hour response time
          isActive: true,
        },
      });
    }

    return {
      success: true,
      contractorId: contractor.id,
      nrpgMemberId,
      verificationLevel: 'PENDING',
      message: 'Contractor registered successfully. Awaiting NRPG verification.',
    };
  } catch (error) {
    console.error('Error registering contractor:', error);
    return {
      success: false,
      message: 'Error registering contractor',
      errors: { general: ['An unexpected error occurred'] },
    };
  }
}

// ============================================================================
// INDUSTRY CERTIFICATION MANAGEMENT
// ============================================================================

/**
 * Verify industry certification
 * Checks expiry date and active status
 */
export async function verifyIICRCCertification(
  certificationCode: string
): Promise<{
  valid: boolean;
  level?: IICRCCertificationLevel;
  expiryDate?: Date;
  contractorId?: string;
  message: string;
}> {
  try {
    const certification = await prisma.iICRCCertification.findUnique({
      where: { certificationCode },
    });

    if (!certification) {
      return {
        valid: false,
        message: 'Certification not found',
      };
    }

    const now = new Date();
    const isExpired = certification.expiryDate < now;

    if (isExpired) {
      return {
        valid: false,
        message: 'Certification has expired',
        expiryDate: certification.expiryDate,
        contractorId: certification.contractorId,
      };
    }

    if (!certification.isActive) {
      return {
        valid: false,
        message: 'Certification is inactive',
        contractorId: certification.contractorId,
      };
    }

    return {
      valid: true,
      level: certification.certificationLevel,
      expiryDate: certification.expiryDate,
      contractorId: certification.contractorId,
      message: 'Certification is valid',
    };
  } catch (error) {
    console.error('Error verifying industry certification:', error);
    return {
      valid: false,
      message: 'Error verifying certification',
    };
  }
}

/**
 * Renew industry certification
 */
export async function renewIICRCCertification(
  certificationId: string,
  newExpiryDate: Date
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await prisma.iICRCCertification.update({
      where: { id: certificationId },
      data: {
        expiryDate: newExpiryDate,
        isActive: true,
      },
    });

    return {
      success: true,
      message: 'Certification renewed successfully',
    };
  } catch (error) {
    console.error('Error renewing industry certification:', error);
    return {
      success: false,
      message: 'Error renewing certification',
    };
  }
}

// ============================================================================
// NRPG VERIFICATION WORKFLOW
// ============================================================================

/**
 * Verify NRPG contractor (admin function)
 */
export async function verifyNRPGContractor(
  contractorId: string,
  verificationLevel: 'VERIFIED' | 'SUSPENDED' | 'REJECTED',
  notes?: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await prisma.contractor.update({
      where: { id: contractorId },
      data: {
        nrpgVerificationLevel: verificationLevel,
        nrpgVerifiedAt: verificationLevel === 'VERIFIED' ? new Date() : undefined,
        isVerified: verificationLevel === 'VERIFIED',
      },
    });

    return {
      success: true,
      message: `Contractor verification status updated to ${verificationLevel}`,
    };
  } catch (error) {
    console.error('Error verifying NRPG contractor:', error);
    return {
      success: false,
      message: 'Error updating verification status',
    };
  }
}

/**
 * Get contractors pending verification
 */
export async function getPendingVerifications(
  state?: AustralianState
): Promise<
  Array<{
    id: string;
    businessName: string;
    abnNumber: string;
    nrpgMemberId?: string;
    operatingStates: AustralianState[];
    email?: string;
    phone?: string;
    certifications: Array<{
      level: IICRCCertificationLevel;
      certificationCode: string;
      expiryDate: Date;
    }>;
    createdAt: Date;
  }>
> {
  try {
    const contractors = await prisma.contractor.findMany({
      where: {
        nrpgVerificationLevel: 'PENDING',
        ...(state && { operatingStates: { has: state } }),
      },
      include: {
        user: {
          select: {
            email: true,
            australianPhoneNumber: true,
          },
        },
        iicrcCertifications: {
          where: { isActive: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return contractors.map((c) => ({
      id: c.id,
      businessName: c.businessName,
      abnNumber: c.abnNumber || '',
      nrpgMemberId: c.nrpgMemberId || undefined,
      operatingStates: c.operatingStates,
      email: c.user.email,
      phone: c.user.australianPhoneNumber || undefined,
      certifications: c.iicrcCertifications.map((cert) => ({
        level: cert.certificationLevel,
        certificationCode: cert.certificationCode,
        expiryDate: cert.expiryDate,
      })),
      createdAt: c.createdAt,
    }));
  } catch (error) {
    console.error('Error getting pending verifications:', error);
    return [];
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStateFromPostcode(postcode: string): AustralianState {
  const num = parseInt(postcode, 10);

  if (num >= 1000 && num <= 2999) return AustralianState.NSW;
  if (num >= 3000 && num <= 3999) return AustralianState.VIC;
  if (num >= 4000 && num <= 4999) return AustralianState.QLD;
  if (num >= 6000 && num <= 6999) return AustralianState.WA;
  if (num >= 5000 && num <= 5999) return AustralianState.SA;
  if (num >= 7000 && num <= 7999) return AustralianState.TAS;
  if (num >= 200 && num <= 999) return AustralianState.ACT;
  if (num >= 800 && num <= 899) return AustralianState.NT;

  return AustralianState.NSW; // Default fallback
}
