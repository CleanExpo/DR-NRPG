import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { handleUnexpectedError } from '@/lib/api-errors';
import { getServerClient, isSupabaseConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Storage bucket mapping
const STORAGE_BUCKETS = {
  'damage-photos': 'damage-photos',
  'documents': 'documents',
  'certificates': 'certificates',
  'progress-photos': 'progress-photos',
  'avatars': 'avatars',
} as const;

type BucketName = keyof typeof STORAGE_BUCKETS;

/**
 * File Upload API
 *
 * Handles document uploads using Supabase Storage:
 * - Industry certificates
 * - Insurance COI documents
 * - Damage photos
 * - Progress photos
 * - User avatars
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, message: 'Storage service not configured' },
        { status: 503 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucketParam = formData.get('bucket') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Determine bucket (default to documents)
    const bucket: BucketName = (bucketParam && bucketParam in STORAGE_BUCKETS)
      ? bucketParam as BucketName
      : 'documents';

    // Validate file size based on bucket
    const maxSizes: Record<BucketName, number> = {
      'damage-photos': 10 * 1024 * 1024, // 10MB for photos
      'documents': 5 * 1024 * 1024,       // 5MB for documents
      'certificates': 5 * 1024 * 1024,    // 5MB for certificates
      'progress-photos': 10 * 1024 * 1024, // 10MB for photos
      'avatars': 2 * 1024 * 1024,          // 2MB for avatars
    };

    const maxSize = maxSizes[bucket];
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` },
        { status: 400 }
      );
    }

    // Validate file type based on bucket
    const allowedTypes: Record<BucketName, string[]> = {
      'damage-photos': ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'],
      'documents': ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
      'certificates': ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
      'progress-photos': ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'],
      'avatars': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    };

    if (!allowedTypes[bucket].includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid file type for ${bucket}. Allowed: ${allowedTypes[bucket].join(', ')}`
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${user.id}/${timestamp}-${sanitizedName}`;

    // Upload to Supabase Storage
    const supabase = getServerClient();
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      return NextResponse.json(
        { success: false, message: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path,
      bucket: bucket,
      filename: file.name,
      size: file.size,
      type: file.type,
      message: 'File uploaded successfully',
    });

  } catch (error) {
    return handleUnexpectedError(error);
  }
}
