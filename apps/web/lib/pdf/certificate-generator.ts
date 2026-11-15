/**
 * NRPG Network Contractor Certificate Generator
 *
 * Generates PDF certificates recording a contractor's NRPG network membership level
 * Includes contractor details, certification level, and verification QR code
 */

import { PDFDocument, PDFPage, rgb, PDFFont } from 'pdf-lib';
import QRCode from 'qrcode';

export interface CertificateData {
  contractorId: string;
  contractorName: string;
  certificationLevel: 'Associate' | 'Professional' | 'Master';
  issueDate: Date;
  expiryDate: Date;
  certificationNumber: string;
  licenseNumber: string;
}

/**
 * Generate NRPG network contractor certificate PDF
 */
export async function generateContractorCertificate(data: CertificateData): Promise<Buffer> {
  try {
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Standard letter size

    // Define colors
    const darkBlue = rgb(0, 47 / 255, 167 / 255); // #002FA7
    const gold = rgb(255 / 255, 215 / 255, 0); // #FFD700
    const darkGray = rgb(51 / 255, 51 / 255, 51 / 255); // #333333

    // Get or embed font
    const helvetica = await pdfDoc.embedFont('Helvetica');
    const helveticaBold = await pdfDoc.embedFont('Helvetica-Bold');

    // Add certificate border
    drawCertificateBorder(page, darkBlue, darkGray);

    // Add header
    page.drawText('NATIONAL RESTORATION PROFESSIONALS GROUP', {
      x: 50,
      y: 720,
      size: 16,
      font: helveticaBold,
      color: darkBlue,
    });

    page.drawText('Network Contractor Certificate', {
      x: 50,
      y: 700,
      size: 14,
      font: helveticaBold,
      color: darkGray,
    });

    // Add "Certificate of" text
    page.drawText('Certificate of Professional Achievement', {
      x: 50,
      y: 640,
      size: 24,
      font: helveticaBold,
      color: darkBlue,
    });

    // Add contractor name
    page.drawText(`${data.contractorName}`, {
      x: 50,
      y: 580,
      size: 20,
      font: helveticaBold,
      color: darkGray,
    });

    // Add certification text
    const certificationText =
      `is recognised as an NRPG ${data.certificationLevel} network contractor.\nThis certificate records network membership. Each contractor holds\ntheir own trade licences, insurance and qualifications independently.`;

    page.drawText(certificationText, {
      x: 50,
      y: 520,
      size: 12,
      font: helvetica,
      color: darkGray,
      lineHeight: 18,
    });

    // Add certification details
    const detailsY = 420;
    page.drawText('Certification Details:', {
      x: 50,
      y: detailsY,
      size: 11,
      font: helveticaBold,
      color: darkGray,
    });

    // Left column details
    const leftX = 70;
    const rightX = 350;
    let currentY = detailsY - 30;

    page.drawText('Certification Level:', {
      x: leftX,
      y: currentY,
      size: 10,
      font: helveticaBold,
      color: darkGray,
    });
    page.drawText(data.certificationLevel, {
      x: leftX + 150,
      y: currentY,
      size: 10,
      font: helvetica,
      color: darkGray,
    });

    currentY -= 25;
    page.drawText('Certification Number:', {
      x: leftX,
      y: currentY,
      size: 10,
      font: helveticaBold,
      color: darkGray,
    });
    page.drawText(data.certificationNumber, {
      x: leftX + 150,
      y: currentY,
      size: 10,
      font: helvetica,
      color: darkGray,
    });

    currentY -= 25;
    page.drawText('License Number:', {
      x: leftX,
      y: currentY,
      size: 10,
      font: helveticaBold,
      color: darkGray,
    });
    page.drawText(data.licenseNumber, {
      x: leftX + 150,
      y: currentY,
      size: 10,
      font: helvetica,
      color: darkGray,
    });

    // Right column dates
    currentY = detailsY - 30;
    page.drawText('Issue Date:', {
      x: rightX,
      y: currentY,
      size: 10,
      font: helveticaBold,
      color: darkGray,
    });
    page.drawText(formatDate(data.issueDate), {
      x: rightX + 100,
      y: currentY,
      size: 10,
      font: helvetica,
      color: darkGray,
    });

    currentY -= 25;
    page.drawText('Expiry Date:', {
      x: rightX,
      y: currentY,
      size: 10,
      font: helveticaBold,
      color: darkGray,
    });
    page.drawText(formatDate(data.expiryDate), {
      x: rightX + 100,
      y: currentY,
      size: 10,
      font: helvetica,
      color: darkGray,
    });

    // Add QR code for verification
    const qrCodeBuffer = await QRCode.toBuffer(
      `https://nrpg.com.au/verify/${data.contractorId}`,
      {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 150,
      }
    );

    const qrImage = await pdfDoc.embedPng(qrCodeBuffer);
    page.drawImage(qrImage, {
      x: 470,
      y: 320,
      width: 100,
      height: 100,
    });

    page.drawText('Verification QR Code', {
      x: 470,
      y: 310,
      size: 8,
      font: helvetica,
      color: darkGray,
    });

    // Add footer
    page.drawText(
      'This certificate confirms compliance with industry standards and regulations. Valid only for the specified period.',
      {
        x: 50,
        y: 60,
        size: 8,
        font: helvetica,
        color: darkGray,
      }
    );

    page.drawText('National Restoration Professionals Group - NRPG', {
      x: 50,
      y: 40,
      size: 9,
      font: helveticaBold,
      color: gold,
    });

    // Save and return PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw new Error(`Failed to generate certificate: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Draw certificate border
 */
function drawCertificateBorder(
  page: PDFPage,
  primaryColor: ReturnType<typeof rgb>,
  secondaryColor: ReturnType<typeof rgb>
) {
  // Outer border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: 572,
    height: 752,
    borderColor: primaryColor,
    borderWidth: 3,
  });

  // Inner decorative border
  page.drawRectangle({
    x: 35,
    y: 35,
    width: 542,
    height: 722,
    borderColor: secondaryColor,
    borderWidth: 1,
  });
}

/**
 * Format date for certificate
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
