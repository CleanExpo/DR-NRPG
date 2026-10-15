import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email/resend';
import { getUserReturnOrigin } from '@/lib/tenant-return-origin';
import { handleUnexpectedError, handleValidationError, createErrorResponse, ErrorCode } from '@/lib/api-errors';

const resendSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * UNI-161: Resend Email Verification
 *
 * POST /api/auth/resend-verification
 *
 * Generates a new verification token and resends the verification email.
 * Supports the UNI-160 tenant onboarding flow.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = resendSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists and is unverified, a verification email has been sent.',
      });
    }

    // If already verified, return error
    if (user.isEmailVerified) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        'This email address is already verified. Please log in.',
        400
      );
    }

    // Generate new verification token
    const newToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: newToken,
        emailVerificationTokenExpiry: expiresAt,
      },
    });

    // Send verification email
    try {
      const emailResult = await sendVerificationEmail(
        user.email,
        newToken,
        user.name || undefined,
        await getUserReturnOrigin(user)
      );

      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error);
        return createErrorResponse(
          ErrorCode.INTERNAL_ERROR,
          'Failed to send verification email. Please try again later.',
          500
        );
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        'Failed to send verification email. Please try again later.',
        500
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error);
    }
    return handleUnexpectedError(error);
  }
}

/**
 * Generate a random verification token
 */
function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36);
}
