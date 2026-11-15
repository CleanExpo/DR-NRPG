/**
 * Australian-Specific Validation Schemas
 *
 * Validates all Australian inputs including:
 * - Postcodes (4-digit format, state ranges)
 * - Phone numbers (Australian format with 02-07, 08, 04 prefixes)
 * - ABN/ACN numbers (Australian Business/Company Numbers)
 * - IICRC certifications
 * - Insurance claim information
 * - Booking details
 */

import { z } from 'zod';

// ============================================================================
// POSTCODE VALIDATION
// ============================================================================

/**
 * Australian postcode: exactly 4 digits
 * Valid ranges by state:
 * NSW: 1000-2999
 * VIC: 3000-3999
 * QLD: 4000-4999
 * WA: 6000-6999
 * SA: 5000-5999
 * TAS: 7000-7999
 * ACT: 0200-0999
 * NT: 0800-0899
 */
export const australianPostcodeSchema = z
  .string()
  .regex(/^\d{4}$/, 'Australian postcode must be exactly 4 digits')
  .refine((code) => {
    const num = parseInt(code, 10);
    // NSW
    if (num >= 1000 && num <= 2999) return true;
    // VIC
    if (num >= 3000 && num <= 3999) return true;
    // QLD
    if (num >= 4000 && num <= 4999) return true;
    // WA
    if (num >= 6000 && num <= 6999) return true;
    // SA
    if (num >= 5000 && num <= 5999) return true;
    // TAS
    if (num >= 7000 && num <= 7999) return true;
    // ACT
    if (num >= 200 && num <= 999) return true;
    // NT
    if (num >= 800 && num <= 899) return true;
    return false;
  }, 'Invalid Australian postcode range');

// ============================================================================
// PHONE VALIDATION
// ============================================================================

/**
 * Australian phone number format
 * Valid prefixes: 02 (NSW/ACT), 03 (VIC/TAS), 07 (QLD), 08 (WA/SA/NT), 04 (mobile)
 * Format: 10 digits total or +61 followed by 9 digits
 */
export const australianPhoneSchema = z
  .string()
  .regex(
    /^(\+61|0)[2-478](\s?|-)?(\d{4}(\s?|-)?(\d{3}|\d{2})|[0-9]{8,9})$/,
    'Invalid Australian phone number. Must start with 02-08 or 04 prefix, or +61'
  )
  .transform((val) => val.replace(/\s|-/g, '')) // Remove spaces and dashes
  .refine(
    (val) => val.length === 10 || (val.startsWith('+61') && val.length === 12),
    'Australian phone number must be 10 digits (or +61 + 9 digits)'
  );

// ============================================================================
// ABN & ACN VALIDATION
// ============================================================================

/**
 * Australian Business Number (ABN)
 * Format: 11 digits (no spaces or dashes)
 */
export const australianABNSchema = z
  .string()
  .regex(/^\d{11}$/, 'Australian Business Number must be exactly 11 digits')
  .refine((abn) => {
    // Basic ABN checksum validation
    const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    const digits = (abn.substring(0, 11)).split('');
    let checksum = 0;

    for (let i = 0; i < 11; i++) {
      checksum += parseInt(digits[i], 10) * weights[i];
    }

    return (checksum % 89) === 0;
  }, 'Invalid ABN checksum');

/**
 * Australian Company Number (ACN)
 * Format: 9 digits (no spaces or dashes)
 */
export const australianACNSchema = z
  .string()
  .regex(/^\d{9}$/, 'Australian Company Number must be exactly 9 digits')
  .refine((acn) => {
    // ACN checksum validation using modulus 10 algorithm
    const weights = [8, 7, 6, 5, 4, 3, 2, 1];
    const digits = acn.split('').map(Number);
    let checksum = 0;

    for (let i = 0; i < 8; i++) {
      checksum += digits[i] * weights[i];
    }

    const remainder = checksum % 10;
    const checkDigit = remainder === 0 ? 0 : 10 - remainder;

    return checkDigit === digits[8];
  }, 'Invalid ACN checksum');

// ============================================================================
// IICRC CERTIFICATION VALIDATION
// ============================================================================

/**
 * IICRC Certification Code
 * Format: Alphanumeric, minimum 6 characters
 * Example: "WRT-2025001234"
 */
export const iicrcCertificationCodeSchema = z
  .string()
  .min(6, 'IICRC certification code must be at least 6 characters')
  .regex(/^[A-Z0-9\-]+$/, 'IICRC code must contain only letters, numbers, and hyphens')
  .toUpperCase();

/**
 * IICRC Certification Level
 */
export const iicrcLevelSchema = z
  .enum(['TECHNICIAN', 'SUPERVISOR', 'INSPECTOR', 'MASTER'])
  .default('TECHNICIAN');

// ============================================================================
// ADDRESS VALIDATION
// ============================================================================

/**
 * Complete Australian address validation
 */
export const australianAddressSchema = z.object({
  streetAddress: z
    .string()
    .min(5, 'Street address must be at least 5 characters')
    .max(100, 'Street address must be less than 100 characters'),
  suburb: z
    .string()
    .min(2, 'Suburb must be at least 2 characters')
    .max(50, 'Suburb must be less than 50 characters'),
  postcode: australianPostcodeSchema,
  state: z.enum(['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']),
  country: z.literal('AU'),
});

export type AustralianAddress = z.infer<typeof australianAddressSchema>;

// ============================================================================
// CONTRACTOR REGISTRATION VALIDATION
// ============================================================================

/**
 * NRPG Contractor Registration Schema
 * Validates all required fields for contractor registration
 */
export const australianContractorRegistrationSchema = z.object({
  // Business Information
  businessName: z
    .string()
    .min(3, 'Business name must be at least 3 characters')
    .max(200, 'Business name must be less than 200 characters'),
  abnNumber: australianABNSchema,
  acnNumber: australianACNSchema.optional(),

  // Contact Information
  phone: australianPhoneSchema,
  email: z.string().email('Invalid email address').max(255),

  // IICRC Certification
  iicrcLevel: iicrcLevelSchema,
  iicrcCertificationCode: iicrcCertificationCodeSchema,
  iicrcCertificationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .transform((date) => new Date(date)),
  iicrcExpiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .transform((date) => new Date(date)),
  iicrcCertificateFile: z.string().url('Certificate must be a valid URL'),

  // Service Details
  operatingStates: z
    .array(z.enum(['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']))
    .min(1, 'Must operate in at least one Australian state'),
  servicePostcodes: z
    .array(australianPostcodeSchema)
    .min(1, 'Must service at least one postcode'),
  specialties: z
    .array(z.enum([
      'WATER_DAMAGE',
      'FIRE_DAMAGE',
      'SMOKE_DAMAGE',
      'MOULD_REMEDIATION',
      'ODOUR_REMEDIATION',
      'CRIME_SCENE_CLEANING',
      'BIOHAZARD_REMEDIATION',
      'COMMERCIAL_WATER_DAMAGE',
      'COMMERCIAL_FIRE_DAMAGE',
      'COMMERCIAL_MOULD',
      'GENERAL_RESTORATION',
    ]))
    .min(1, 'Must select at least one specialty'),

  // Insurance Details
  publicLiabilityPolicyNumber: z.string().min(5).max(50),
  publicLiabilityExpiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .transform((date) => new Date(date)),
});

export type AustralianContractorRegistration = z.infer<typeof australianContractorRegistrationSchema>;

// ============================================================================
// BOOKING VALIDATION
// ============================================================================

/**
 * Disaster Recovery Service Booking Schema
 */
export const australianBookingSchema = z.object({
  serviceType: z.enum([
    'WATER_DAMAGE',
    'FIRE_DAMAGE',
    'SMOKE_DAMAGE',
    'MOULD_REMEDIATION',
    'ODOUR_REMEDIATION',
    'CRIME_SCENE_CLEANING',
    'BIOHAZARD_REMEDIATION',
    'HOARDING_CLEANUP',
    'VANDALISM_CLEANUP',
    'COMMERCIAL_WATER_DAMAGE',
    'COMMERCIAL_FIRE_DAMAGE',
    'COMMERCIAL_MOULD',
    'GENERAL_RESTORATION',
  ]),
  emergencyLevel: z.enum(['URGENT', 'HIGH', 'STANDARD', 'SCHEDULED']),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  address: australianAddressSchema,
  damagePhotos: z
    .array(z.string().url('Each photo must be a valid URL'))
    .max(10, 'Maximum 10 photos allowed')
    .optional(),
  insuranceProvider: z
    .enum(['NRMA', 'SUNCORP', 'ALLIANZ', 'QBE', 'IAG', 'CGU', 'MEDIBANK', 'OTHER'])
    .optional(),
  policyNumber: z.string().max(50).optional(),
  preferredDateTime: z.string().datetime().optional(),
  estimatedDamageAUD: z
    .number()
    .positive('Damage estimate must be a positive number')
    .optional(),
});

export type AustralianBooking = z.infer<typeof australianBookingSchema>;

// ============================================================================
// INSURANCE CLAIM VALIDATION
// ============================================================================

/**
 * Insurance Claim Submission Schema
 */
export const australianInsuranceClaimSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  insuranceProvider: z.enum(['NRMA', 'SUNCORP', 'ALLIANZ', 'QBE', 'IAG', 'CGU', 'MEDIBANK', 'OTHER']),
  policyNumber: z
    .string()
    .min(5, 'Policy number must be at least 5 characters')
    .max(50, 'Policy number must be less than 50 characters'),
  totalClaimAmountAUD: z
    .number()
    .positive('Claim amount must be positive'),
  damagePhotos: z
    .array(z.string().url('Each photo must be a valid URL'))
    .min(1, 'At least one damage photo required')
    .max(20, 'Maximum 20 photos allowed'),
  invoiceDocument: z.string().url('Invoice must be a valid URL'),
  contractorEstimate: z.string().url('Contractor estimate must be a valid URL'),
  additionalDocuments: z
    .array(z.string().url('Each document must be a valid URL'))
    .optional(),
});

export type AustralianInsuranceClaim = z.infer<typeof australianInsuranceClaimSchema>;

// ============================================================================
// HELPER VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate Australian postcode and return state
 */
export function getStateFromPostcode(postcode: string): string | null {
  const num = parseInt(postcode, 10);

  if (num >= 1000 && num <= 2999) return 'NSW';
  if (num >= 3000 && num <= 3999) return 'VIC';
  if (num >= 4000 && num <= 4999) return 'QLD';
  if (num >= 6000 && num <= 6999) return 'WA';
  if (num >= 5000 && num <= 5999) return 'SA';
  if (num >= 7000 && num <= 7999) return 'TAS';
  if (num >= 200 && num <= 999) return 'ACT';
  if (num >= 800 && num <= 899) return 'NT';

  return null;
}

/**
 * Format Australian phone number for storage
 */
export function formatAustralianPhone(phone: string): string {
  return phone.replace(/\s|-/g, '');
}

/**
 * Validate ABN checksum
 */
export function validateABNChecksum(abn: string): boolean {
  if (!/^\d{11}$/.test(abn)) return false;

  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const digits = abn.split('').map(Number);
  let checksum = 0;

  for (let i = 0; i < 11; i++) {
    checksum += digits[i] * weights[i];
  }

  return (checksum % 89) === 0;
}

/**
 * Validate ACN checksum
 */
export function validateACNChecksum(acn: string): boolean {
  if (!/^\d{9}$/.test(acn)) return false;

  const weights = [8, 7, 6, 5, 4, 3, 2, 1];
  const digits = acn.split('').map(Number);
  let checksum = 0;

  for (let i = 0; i < 8; i++) {
    checksum += digits[i] * weights[i];
  }

  const remainder = checksum % 10;
  const checkDigit = remainder === 0 ? 0 : 10 - remainder;

  return checkDigit === digits[8];
}
