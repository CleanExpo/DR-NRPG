/**
 * QR Code Generation Utilities
 *
 * Generates scannable QR codes for:
 * - Job tracking and verification
 * - Certificate verification links
 * - Contractor portfolio links
 * - Insurance claim verification
 */

import QRCode, { QRCodeToDataURLOptions, QRCodeToBufferStringOptions } from 'qrcode';
import { SITE_URL } from '@/lib/seo/site-url';

export interface QRCodeOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generate QR code for job tracking
 * Returns PNG buffer for embedding in PDFs or images
 */
export async function generateJobQRCode(jobId: string, baseUrl: string = SITE_URL): Promise<Buffer> {
  try {
    const url = `${baseUrl}/dashboard/jobs/${jobId}`;

    const qrBuffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 150,
      margin: 2,
    });

    return qrBuffer;
  } catch (error) {
    console.error('Error generating job QR code:', error);
    throw new Error(`Failed to generate job QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code for certificate verification
 * Links to the contractor's public profile, which only shows verified contractors
 */
export async function generateCertificateQRCode(
  contractorId: string,
  baseUrl: string = SITE_URL
): Promise<Buffer> {
  try {
    // Public profile: only shows verified, active contractors.
    const url = `${baseUrl}/contractors/${contractorId}`;

    const qrBuffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 150,
      margin: 2,
    });

    return qrBuffer;
  } catch (error) {
    console.error('Error generating certificate QR code:', error);
    throw new Error(`Failed to generate certificate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code for insurance claim verification
 */
export async function generateClaimQRCode(claimId: string, baseUrl: string = SITE_URL): Promise<Buffer> {
  try {
    const url = `${baseUrl}/dashboard/claims/${claimId}`;

    const qrBuffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 150,
      margin: 2,
    });

    return qrBuffer;
  } catch (error) {
    console.error('Error generating claim QR code:', error);
    throw new Error(`Failed to generate claim QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code for contractor portfolio
 */
export async function generateContractorPortfolioQRCode(
  contractorId: string,
  baseUrl: string = SITE_URL
): Promise<Buffer> {
  try {
    const url = `${baseUrl}/contractors/${contractorId}`;

    const qrBuffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 150,
      margin: 2,
    });

    return qrBuffer;
  } catch (error) {
    console.error('Error generating contractor portfolio QR code:', error);
    throw new Error(
      `Failed to generate contractor portfolio QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate QR code with custom URL
 * Generic function for custom QR code generation
 */
export async function generateCustomQRCode(
  url: string,
  options?: QRCodeOptions
): Promise<Buffer> {
  try {
    const qrBuffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: options?.errorCorrectionLevel || 'H',
      type: 'image/png',
      width: options?.width || 150,
      margin: options?.margin || 2,
      color: options?.color ? {
        dark: options.color.dark || '#000000',
        light: options.color.light || '#FFFFFF',
      } : undefined,
    });

    return qrBuffer;
  } catch (error) {
    console.error('Error generating custom QR code:', error);
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code as data URL (for HTML embedding)
 */
export async function generateQRCodeDataURL(
  url: string,
  options?: QRCodeOptions
): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: options?.errorCorrectionLevel || 'H',
      width: options?.width || 150,
      margin: options?.margin || 2,
    });

    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code data URL:', error);
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code with branding colors (NRPG brand colors)
 */
export async function generateBrandedQRCode(
  url: string,
  options?: QRCodeOptions
): Promise<Buffer> {
  try {
    // NRPG brand colors: Dark blue background, gold accent
    const brandedOptions: QRCodeOptions = {
      errorCorrectionLevel: options?.errorCorrectionLevel || 'H',
      width: options?.width || 150,
      margin: options?.margin || 2,
      color: {
        dark: '#002FA7', // NRPG dark blue
        light: '#FFFFFF', // White background
      },
      ...options,
    };

    return await generateCustomQRCode(url, brandedOptions);
  } catch (error) {
    console.error('Error generating branded QR code:', error);
    throw new Error(`Failed to generate branded QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
