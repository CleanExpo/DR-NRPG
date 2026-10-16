/**
 * Damage Photo Upload Processor
 *
 * Handles processing of user-uploaded claim photos for damage assessment
 * - Resize to standard dimensions (1920x1080 max)
 * - Compress to WebP format for efficiency
 * - Extract EXIF GPS data if available
 * - Generate thumbnails for preview
 */

import sharp, { type Metadata } from 'sharp';
import path from 'path';

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface ImageMetadata {
  gps?: {
    latitude: number;
    longitude: number;
  };
  dateTaken?: Date;
  cameraModel?: string;
}

/**
 * Process claim photo: resize, compress, and extract metadata
 */
export async function processClaimPhoto(buffer: Buffer): Promise<{
  processed: ProcessedImage;
  thumbnail: ProcessedImage;
  metadata: ImageMetadata;
}> {
  try {
    // Create Sharp instance
    const image = sharp(buffer);

    // Get metadata before processing
    const metadata = await image.metadata();

    // Extract EXIF data if available
    const exifData = await extractExifData(buffer, metadata);

    // Process main image: resize to max 1920x1080, compress to WebP
    const processedBuffer = await sharp(buffer)
      .resize(1920, 1080, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    const processedMetadata = await sharp(processedBuffer).metadata();

    // Generate thumbnail: 320x240, WebP
    const thumbnailBuffer = await sharp(buffer)
      .resize(320, 240, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 75 })
      .toBuffer();

    const thumbnailMetadata = await sharp(thumbnailBuffer).metadata();

    return {
      processed: {
        buffer: processedBuffer,
        width: processedMetadata.width || 1920,
        height: processedMetadata.height || 1080,
        format: 'webp',
        size: processedBuffer.length,
      },
      thumbnail: {
        buffer: thumbnailBuffer,
        width: thumbnailMetadata.width || 320,
        height: thumbnailMetadata.height || 240,
        format: 'webp',
        size: thumbnailBuffer.length,
      },
      metadata: exifData,
    };
  } catch (error) {
    console.error('Error processing claim photo:', error);
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Add watermark text to image
 */
export async function addWatermark(
  buffer: Buffer,
  text: string,
  options?: {
    opacity?: number;
    position?: 'top' | 'bottom' | 'center';
    fontSize?: number;
    color?: string;
  }
): Promise<Buffer> {
  try {
    const opacity = options?.opacity ?? 0.5;
    const position = options?.position ?? 'bottom';
    const fontSize = options?.fontSize ?? 48;
    const color = options?.color ?? 'white';

    // Create SVG watermark
    const watermarkSvg = Buffer.from(
      `<svg width="1920" height="1080">
        <defs>
          <style>
            text {
              font-family: Arial;
              font-size: ${fontSize}px;
              fill: ${color};
              opacity: ${opacity};
              font-weight: bold;
            }
          </style>
        </defs>
        <text x="50%" y="${position === 'top' ? '60' : position === 'center' ? '540' : '1020'}"
              text-anchor="middle" dominant-baseline="middle">
          ${text}
        </text>
      </svg>`
    );

    // Composite watermark onto image
    const watermarked = await sharp(buffer)
      .composite([{ input: watermarkSvg, blend: 'over' }])
      .toBuffer();

    return watermarked;
  } catch (error) {
    console.error('Error adding watermark:', error);
    throw new Error(`Failed to add watermark: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate thumbnail for gallery preview
 */
export async function generateThumbnail(
  buffer: Buffer,
  width: number = 320,
  height: number = 240
): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 75 })
      .toBuffer();
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw new Error(`Failed to generate thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract EXIF metadata including GPS data
 */
async function extractExifData(
  buffer: Buffer,
  metadata: Metadata
): Promise<ImageMetadata> {
  const exifData: ImageMetadata = {};

  try {
    // Extract basic metadata
    if (metadata.hasAlpha !== undefined) {
      // Image has alpha channel - indicates transparency support
    }

    // Note: Full EXIF parsing requires additional library (exif-parser)
    // This is a simplified version that works with sharp's built-in metadata
    // For production, consider: npm install exif-parser

    // Sharp can provide basic EXIF info through its metadata
    if (metadata.exif) {
      // EXIF data is available but requires parsing
      // Example: GPS coordinates would be in exif.Image.GPSInfo
    }

    return exifData;
  } catch (error) {
    console.error('Error extracting EXIF data:', error);
    return exifData;
  }
}

/**
 * Optimize image for web without watermark
 */
export async function optimizeForWeb(
  buffer: Buffer,
  format: 'webp' | 'jpeg' | 'png' = 'webp',
  quality: number = 80
): Promise<Buffer> {
  try {
    let sharpInstance = sharp(buffer).resize(2560, 1440, {
      fit: 'inside',
      withoutEnlargement: true,
    });

    switch (format) {
      case 'webp':
        return await sharpInstance.webp({ quality }).toBuffer();
      case 'jpeg':
        return await sharpInstance.jpeg({ quality, progressive: true }).toBuffer();
      case 'png':
        return await sharpInstance.png({ compressionLevel: 9 }).toBuffer();
      default:
        return await sharpInstance.webp({ quality }).toBuffer();
    }
  } catch (error) {
    console.error('Error optimizing image for web:', error);
    throw new Error(`Failed to optimize image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
