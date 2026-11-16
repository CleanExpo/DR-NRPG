/**
 * Australian-Specific Types and Interfaces
 *
 * Defines all TypeScript types for Australian disaster recovery SaaS platform
 * Including NRPG and Australian insurance integration
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum AustralianState {
  NSW = 'NSW', // New South Wales
  VIC = 'VIC', // Victoria
  QLD = 'QLD', // Queensland
  WA = 'WA',   // Western Australia
  SA = 'SA',   // South Australia
  TAS = 'TAS', // Tasmania
  ACT = 'ACT', // Australian Capital Territory
  NT = 'NT',   // Northern Territory
}

export enum ServiceType {
  // Residential
  WATER_DAMAGE = 'WATER_DAMAGE',
  FIRE_DAMAGE = 'FIRE_DAMAGE',
  SMOKE_DAMAGE = 'SMOKE_DAMAGE',
  MOULD_REMEDIATION = 'MOULD_REMEDIATION',
  ODOUR_REMEDIATION = 'ODOUR_REMEDIATION',
  CARPET_CLEANING = 'CARPET_CLEANING',

  // Commercial
  COMMERCIAL_WATER_DAMAGE = 'COMMERCIAL_WATER_DAMAGE',
  COMMERCIAL_FIRE_DAMAGE = 'COMMERCIAL_FIRE_DAMAGE',
  COMMERCIAL_MOULD = 'COMMERCIAL_MOULD',
  COMMERCIAL_ODOUR = 'COMMERCIAL_ODOUR',

  // Specialized
  CRIME_SCENE_CLEANING = 'CRIME_SCENE_CLEANING',
  BIOHAZARD_REMEDIATION = 'BIOHAZARD_REMEDIATION',
  HOARDING_CLEANUP = 'HOARDING_CLEANUP',
  VANDALISM_CLEANUP = 'VANDALISM_CLEANUP',

  // General
  GENERAL_RESTORATION = 'GENERAL_RESTORATION',
}

export enum EmergencyLevel {
  URGENT = 'URGENT',      // < 2 hours
  HIGH = 'HIGH',          // Same day
  STANDARD = 'STANDARD',  // Next business day
  SCHEDULED = 'SCHEDULED', // Pre-arranged
}

export enum IICRCLevel {
  TECHNICIAN = 'TECHNICIAN',
  SUPERVISOR = 'SUPERVISOR',
  INSPECTOR = 'INSPECTOR',
  MASTER = 'MASTER',
}

export enum InsuranceProvider {
  NRMA = 'NRMA',
  SUNCORP = 'SUNCORP',
  ALLIANZ = 'ALLIANZ',
  QBE = 'QBE',
  IAG = 'IAG',
  CGU = 'CGU',
  MEDIBANK = 'MEDIBANK',
  OTHER = 'OTHER',
}

export enum ClaimStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  PARTIALLY_APPROVED = 'PARTIALLY_APPROVED',
  DENIED = 'DENIED',
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  CLOSED = 'CLOSED',
}

// ============================================================================
// ADDRESS & LOCATION TYPES
// ============================================================================

export interface AustralianPostcode {
  code: string;           // 4-digit postcode
  locality: string;       // Suburb/city name
  state: AustralianState;
  ranges?: {
    min: number;
    max: number;
  };
}

export interface AustralianAddress {
  streetAddress: string;
  suburb: string;         // Suburb/locality
  postcode: string;       // 4-digit Australian postcode
  state: AustralianState;
  country: 'AU';
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  postcode: string;
  state: AustralianState;
}

// ============================================================================
// CONTRACTOR & NRPG TYPES
// ============================================================================

export interface IICRCCertification {
  level: IICRCLevel;
  code: string;           // industry certification code
  certifiedDate: Date;
  expiryDate: Date;
  isActive: boolean;
  documentUrl?: string;
  isVerified?: boolean;
}

export interface NRPGContractor {
  nrpgMemberId: string;
  nrpgVerifiedAt: Date | null;
  nrpgVerificationLevel: 'VERIFIED' | 'PENDING' | 'SUSPENDED' | 'REJECTED';
  iicrcCertifications: IICRCCertification[];
  operatingStates: AustralianState[];
  specialties: ServiceType[];
  publicLiabilityExpiry: Date | null;
  workCoverExpiry: Date | null;
}

export interface ContractorProfile {
  id: string;
  userId: string;
  businessName: string;
  abnNumber?: string;
  acnNumber?: string;
  primaryPostcode: string;
  primaryState: AustralianState;
  operatingStates: AustralianState[];
  nrpgMemberId?: string;
  nrpgVerified: boolean;
  iicrcCertifications: IICRCCertification[];
  specialties: ServiceType[];
  serviceAreas: string[]; // Array of postcodes
  completedJobs: number;
  averageRating: number;
  isVerified: boolean;
  isActive: boolean;
}

export interface ContractorSearchResult {
  contractors: ContractorProfile[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ============================================================================
// BOOKING & CLAIM TYPES
// ============================================================================

export interface DisasterBooking {
  id?: string;
  clientId: string;
  serviceType: ServiceType;
  emergencyLevel: EmergencyLevel;
  description: string;
  location: AustralianAddress;
  damagePhotos?: string[];
  estimatedDamageAUD?: number;
  insuranceProvider?: InsuranceProvider;
  policyNumber?: string;
  preferredDateTime?: Date;
  status?: string;
  contractorId?: string | null;
}

export interface BookingResponse {
  id: string;
  status: string;
  estimatedCost: number;
  estimatedResponseTime: string;
  contractor?: ContractorProfile;
  createdAt: Date;
}

export interface InsuranceClaim {
  id?: string;
  bookingId: string;
  clientId: string;
  insuranceProvider: InsuranceProvider;
  policyNumber: string;
  claimNumber?: string;
  totalClaimAmountAUD: number;
  approvedAmountAUD?: number;
  status: ClaimStatus;
  damagePhotos: string[];
  invoiceUrl?: string;
  estimateUrl?: string;
  additionalDocuments?: string[];
}

export interface ClaimTrackingInfo {
  claimId: string;
  status: ClaimStatus;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  approvedAt: Date | null;
  paidAt: Date | null;
  nextStep: string;
  estimatedTimeframe: string;
}

// ============================================================================
// PAYMENT TYPES (AUD CURRENCY)
// ============================================================================

export interface PaymentDetails {
  bookingId: string;
  clientId: string;
  contractorId?: string;
  amountAUD: number;
  platformFeeAUD: number;
  gstAUD: number;
  netAmountAUD: number;
  paymentMethod: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'CHECK' | 'INSURANCE';
  stripePaymentIntentId?: string;
}

export interface Invoice {
  invoiceNumber: string;
  dateIssued: Date;
  dateDue: Date;
  subtotalAUD: number;
  gstAUD: number;
  totalAUD: number;
  isPaid: boolean;
  paidDate?: Date;
  description: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface ContractorLookupResponse {
  success: boolean;
  contractors: Array<{
    id: string;
    businessName: string;
    nrpgMemberId: string;
    iicrcLevel: IICRCLevel;
    rating: number | null;
    completedJobs: number;
    responseTime: string;
    specialties: ServiceType[];
  }>;
  count: number;
}

export interface BookingCreatedResponse {
  success: boolean;
  bookingId: string;
  status: string;
  estimatedCost: number;
  estimatedResponseTime: string;
  message: string;
}

export interface VerificationResponse {
  verified: boolean;
  iicrcVerified: boolean;
  nrpgVerified: boolean;
  nrpgMemberDetails?: any;
  message: string;
}

// ============================================================================
// NRPG SPECIFIC TYPES
// ============================================================================

export interface NRPGMember {
  memberId: string;
  businessName: string;
  abnNumber: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'SUSPENDED' | 'REJECTED';
  verificationDate: Date;
  certifications: IICRCCertification[];
  operatingStates: AustralianState[];
  contactInfo: {
    email: string;
    phone: string;
    address: AustralianAddress;
  };
}

export interface NRPGRegistration {
  businessName: string;
  abnNumber: string;
  acnNumber?: string;
  phone: string;
  email: string;
  operatingStates: AustralianState[];
  specialties: ServiceType[];
  iicrcCertifications: IICRCCertification[];
}

// ============================================================================
// RATING & FEEDBACK TYPES
// ============================================================================

export interface ContractorRating {
  id?: string;
  bookingId: string;
  contractorId: string;
  clientId: string;
  rating: number; // 1-5 stars
  comment?: string;
  wouldRecommend: boolean;
  createdAt?: Date;
}

export interface AverageRating {
  averageRating: number;
  totalRatings: number;
  wouldRecommendPercentage: number;
}

// ============================================================================
// DISASTER ALERT TYPES
// ============================================================================

export interface DisasterAlert {
  id?: string;
  disasterType: 'FLOOD' | 'FIRE' | 'STORM' | 'CYCLONE' | 'BUSHFIRE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedPostcodes: string[];
  affectedStates: AustralianState[];
  description: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  alertUrl?: string;
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface AuthSession {
  userId: string;
  email: string;
  role: 'CLIENT' | 'CONTRACTOR' | 'ADMIN' | 'SUPER_ADMIN';
  contractorId?: string;
  iat: number;
  exp: number;
}

export interface LoginAttempt {
  userId: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  attemptedAt: Date;
}

// ============================================================================
// SEARCH & FILTER TYPES
// ============================================================================

export interface ContractorSearchFilter {
  postcode: string;
  state: AustralianState;
  serviceType?: ServiceType;
  emergencyLevel?: EmergencyLevel;
  minRating?: number;
  maxDistance?: number; // kilometers
}

export interface BookingFilter {
  state?: AustralianState;
  serviceType?: ServiceType;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export type NotificationType =
  | 'BOOKING_CREATED'
  | 'CONTRACTOR_ASSIGNED'
  | 'CONTRACTOR_ARRIVED'
  | 'WORK_STARTED'
  | 'WORK_COMPLETED'
  | 'PAYMENT_PROCESSED'
  | 'NEW_JOB_AVAILABLE'
  | 'JOB_CANCELLED'
  | 'REVIEW_RECEIVED'
  | 'CLAIM_APPROVED'
  | 'CLAIM_DENIED'
  | 'NRPG_VERIFIED'
  | 'DISASTER_ALERT'
  | 'CERTIFICATION_EXPIRING';
