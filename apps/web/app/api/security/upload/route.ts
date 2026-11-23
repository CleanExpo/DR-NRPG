/**
 * Secure File Upload Endpoint
 *
 * POST /api/security/upload
 * Validates and scans files before allowing upload
 *
 * Supports:
 * - Multiple file uploads
 * - MIME type validation
 * - File size limits
 * - Magic byte verification
 * - Malware scanning with VirusTotal
 * - EXIF metadata removal for images
 *
 * Response:
 * ```json
 * {
 *   "files": [
 *     {
 *       "filename": "document.pdf",
 *       "size": 102400,
 *       "mimeType": "application/pdf",
 *       "safe": true,
 *       "scanned": true,
 *       "scanTime": 245
 *     }
 *   ],
 *   "blockedFiles": [
 *     {
 *       "filename": "malware.exe",
 *       "reason": "Dangerous file extension: .exe",
 *       "size": 51200
 *     }
 *   ]
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/net/client-ip';
import { authenticateRequest } from '@/lib/auth-middleware';
import { fileScanner } from '@/lib/security/file-scanner';
import { securityMonitor } from '@/lib/security/security-monitor';
import { logError, logInfo, logWarn } from '@/lib/logger/helpers';

interface UploadedFile {
  filename: string;
  size: number;
  mimeType: string;
  safe: boolean;
  scanned: boolean;
  scanTime: number;
}

interface BlockedFile {
  filename: string;
  reason: string;
  size: number;
}

export async function POST(request: NextRequest) {
  let clientIp = 'unknown';

  try {
    // Get client IP
    clientIp = getClientIp(request);

    // Verify authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;

    // Get form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 files per upload' },
        { status: 400 }
      );
    }

    const uploadedFiles: UploadedFile[] = [];
    const blockedFiles: BlockedFile[] = [];

    // Process each file
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = fileScanner.sanitizeFilename(file.name);

      // Scan file
      const scanResult = await fileScanner.scanFile(buffer, filename);

      if (scanResult.safe) {
        uploadedFiles.push({
          filename: scanResult.filename,
          size: scanResult.size,
          mimeType: scanResult.mimeType,
          safe: true,
          scanned: true,
          scanTime: scanResult.scanTime,
        });

        logInfo('File upload allowed', {
          userId: user.id,
          filename,
          size: scanResult.size,
          mimeType: scanResult.mimeType,
          scanTime: scanResult.scanTime,
        });
      } else {
        blockedFiles.push({
          filename,
          reason: scanResult.reason || 'Unknown reason',
          size: scanResult.size,
        });

        // Track suspicious upload attempt
        securityMonitor.trackSuspiciousFileUpload(
          user.id,
          user.email,
          filename,
          scanResult.reason || 'Failed security scan',
          clientIp
        );

        logWarn('File upload blocked', {
          userId: user.id,
          filename,
          size: scanResult.size,
          reason: scanResult.reason,
          scanTime: scanResult.scanTime,
        });
      }
    }

    // Return results
    return NextResponse.json({
      files: uploadedFiles,
      blockedFiles,
      summary: {
        uploaded: uploadedFiles.length,
        blocked: blockedFiles.length,
        total: files.length,
      },
    });
  } catch (error) {
    logError(error, { context: 'secure_file_upload', clientIp });
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/security/upload
 * Get file upload configuration and limits
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const config = fileScanner.getConfig();

    return NextResponse.json({
      maxSize: config.maxSize,
      maxSizeMB: Math.round(config.maxSize / (1024 * 1024)),
      allowedMimeTypes: config.allowedMimeTypes,
      maxFilesPerUpload: 10,
      scanningEnabled: true,
      virusScanningEnabled: config.virusTotalEnabled,
    });
  } catch (error) {
    logError(error, { context: 'get_upload_config' });
    return NextResponse.json(
      { error: 'Failed to get upload configuration' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/security/upload
 * CORS support for file uploads
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    { message: 'OK' },
    {
      headers: {
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
