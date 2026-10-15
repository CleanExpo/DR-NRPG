import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword, generateResetToken, verifyToken } from '@/lib/auth';
import { findUserByEmail, prisma } from '@/lib/db';
import { validateRequest, formatZodErrors, passwordSchema } from '@/lib/validation';
import { authRateLimiter } from '@/lib/api/redis-rate-limit';
import { updatePasswordWithHistory, isPasswordAlreadyUsed } from '@/lib/services/password-policy.service';
import { sendPasswordResetEmail } from '@/lib/email/resend';
import { getUserReturnOrigin } from '@/lib/tenant-return-origin';

const requestResetSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

// Request password reset
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - prevent abuse of password reset
    const rateLimitResult = await authRateLimiter(request);
    if (rateLimitResult) return rateLimitResult;

    const body = await request.json();

    const validation = validateRequest(requestResetSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: formatZodErrors(validation.errors)
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    const user = await findUserByEmail(email);
    if (!user) {
      // Return success even if user doesn't exist (security)
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a reset email has been sent',
      });
    }

    const resetToken = generateResetToken(user.id);

    // Store token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      user.email,
      resetToken,
      user.name || undefined,
      await getUserReturnOrigin(user)
    );
    if (!emailResult.success) {
      console.warn('Password reset email could not be sent:', emailResult.error);
      // Still return success to avoid revealing if email exists
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists, a reset email has been sent',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Reset password with token
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting - prevent brute force password reset attempts
    const rateLimitResult = await authRateLimiter(request);
    if (rateLimitResult) return rateLimitResult;

    const body = await request.json();

    const validation = validateRequest(resetPasswordSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: formatZodErrors(validation.errors)
        },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded || decoded.type !== 'password-reset') {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Check if token exists in DB and not used
    const storedToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        userId: decoded.userId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Check if password was already used (password policy)
    const isReused = await isPasswordAlreadyUsed(decoded.userId, password);
    if (isReused) {
      return NextResponse.json(
        {
          success: false,
          error: 'This password was recently used. Please choose a different password.',
        },
        { status: 400 }
      );
    }

    // Update password with history and mark token as used
    const passwordUpdated = await updatePasswordWithHistory(decoded.userId, hashedPassword);

    if (!passwordUpdated) {
      return NextResponse.json(
        { success: false, error: 'Failed to update password' },
        { status: 500 }
      );
    }

    // Mark reset token as used
    await prisma.passwordResetToken.update({
      where: { id: storedToken.id },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
