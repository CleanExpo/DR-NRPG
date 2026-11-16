/**
 * Certification Requirements Mapping
 *
 * Maps disaster types to the certification levels required for contractor matching.
 * Used for contractor filtering with fallback mechanism:
 * - Round 1: Match contractors WITH required certifications
 * - Round 2 (Fallback): If no contractors have cert, offer to ANY in rotation
 */

// Internal certification codes compared with contractor records in matching (never shown to visitors)
type IICRCCertCode = 'WRT' | 'ASD' | 'AMRT' | 'FSRT' | 'OCT' | 'CCT' | 'UFT';

/**
 * Disaster Type → Required Certifications Mapping
 *
 * Each disaster type specifies which certifications are REQUIRED.
 * Contractors without these certifications will be skipped in Round 1 matching.
 */
export const CERT_REQUIREMENTS: Record<string, IICRCCertCode[]> = {
  // ============================================================================
  // Water-Related Disasters
  // ============================================================================

  'Water Damage': ['WRT', 'ASD'],
  // Core water damage restoration and structural drying expertise

  Flood: ['WRT', 'ASD', 'AMRT'],
  // Water extraction and restoration, structural drying and mould prevention

  'Storm Damage': ['WRT', 'ASD'],
  // Water damage from storms and structural drying

  'Leak Detection': ['WRT'],
  // Water damage assessment

  'Burst Pipe': ['WRT', 'ASD'],
  // Water restoration and structural drying

  // ============================================================================
  // Fire-Related Disasters
  // ============================================================================

  'Fire Damage': ['FSRT'],
  // Fire restoration specialist

  'Smoke Damage': ['FSRT', 'OCT'],
  // Smoke damage restoration and smoke odour removal

  // ============================================================================
  // Mould-Related Disasters
  // ============================================================================

  'Mould Remediation': ['AMRT'],
  // Microbial remediation specialist

  'Mould Inspection': ['AMRT'],
  // Mould assessment and remediation

  'Mould Assessment': ['AMRT'],
  // Mould testing and evaluation

  // ============================================================================
  // Specialized Disasters
  // ============================================================================

  'Sewage Backup': ['WRT', 'AMRT'],
  // Water extraction, biohazard and microbial remediation

  'Biohazard Cleanup': ['AMRT'],
  // Biohazard remediation

  'Contents Restoration': ['CCT', 'UFT'],
  // Textile and fabric restoration

  'Odour Removal': ['OCT'],
  // Specialised odour control

  'Carpet Cleaning': ['CCT'],
  // Carpet restoration

  'Upholstery Cleaning': ['UFT'],
  // Upholstery restoration

  // ============================================================================
  // General/No Certification Required
  // ============================================================================

  'General Cleaning': [],
  // No specific certification required

  'Emergency Board Up': [],
  // No specific certification required

  'Debris Removal': [],
  // No specific certification required

  'Temporary Repairs': [],
  // No specific certification required

  'Tarpaulin Installation': [],
  // No specific certification required

  'Tree Removal': [],
  // No specific certification required

  'Roof Damage': [],
  // No specific certification (specialised roofing licence required)

  'Structural Damage': [],
  // No specific certification (structural engineering may be required)
};

/**
 * Get required certifications for a disaster type
 *
 * @param disasterType - The type of disaster (e.g., "Water Damage", "Flood")
 * @returns Array of required certification levels, or empty array if none required
 *
 * @example
 * getRequiredCerts('Flood') → three required certification codes
 * getRequiredCerts('General Cleaning') → []
 * getRequiredCerts('Unknown Type') → []
 */
export function getRequiredCerts(disasterType: string): IICRCCertCode[] {
  return CERT_REQUIREMENTS[disasterType] || [];
}

/**
 * Check if a disaster type requires certifications
 *
 * @param disasterType - The type of disaster
 * @returns True if certifications are required, false otherwise
 *
 * @example
 * requiresCertification('Flood') → true
 * requiresCertification('General Cleaning') → false
 */
export function requiresCertification(disasterType: string): boolean {
  const certs = getRequiredCerts(disasterType);
  return certs.length > 0;
}

/**
 * Get human-readable certification names
 *
 * @param certLevel - certification level code
 * @returns Full certification name
 */
export function getCertificationName(certLevel: IICRCCertCode): string {
  const certNames: Record<IICRCCertCode, string> = {
    WRT: 'Water damage restoration',
    AMRT: 'Mould and microbial remediation',
    ASD: 'Structural drying',
    FSRT: 'Fire and smoke restoration',
    OCT: 'Odour control',
    CCT: 'Carpet cleaning',
    UFT: 'Upholstery and fabric cleaning',
  };

  return certNames[certLevel] || certLevel;
}

/**
 * Validate if contractor has required certifications for disaster type
 *
 * @param contractorCerts - Array of contractor's active certification levels
 * @param disasterType - The type of disaster
 * @returns True if contractor has ALL required certifications, false otherwise
 *
 * @example
 * hasRequiredCerts(allRequiredCodes, 'Water Damage') → true
 * hasRequiredCerts(onlyOneOfThreeCodes, 'Flood') → false (two codes missing)
 * hasRequiredCerts([], 'General Cleaning') → true (no certs required)
 */
export function hasRequiredCerts(
  contractorCerts: IICRCCertCode[],
  disasterType: string
): boolean {
  const requiredCerts = getRequiredCerts(disasterType);

  // If no certs required, contractor is qualified
  if (requiredCerts.length === 0) {
    return true;
  }

  // Check if contractor has ALL required certifications
  return requiredCerts.every((cert) => contractorCerts.includes(cert));
}

/**
 * Get missing certifications for a contractor
 *
 * @param contractorCerts - Array of contractor's active certification levels
 * @param disasterType - The type of disaster
 * @returns Array of missing certification levels
 *
 * @example
 * getMissingCerts(onlyOneOfThreeCodes, 'Flood') → the two missing codes
 * getMissingCerts(allThreeCodes, 'Flood') → []
 */
export function getMissingCerts(
  contractorCerts: IICRCCertCode[],
  disasterType: string
): IICRCCertCode[] {
  const requiredCerts = getRequiredCerts(disasterType);
  return requiredCerts.filter((cert) => !contractorCerts.includes(cert));
}
