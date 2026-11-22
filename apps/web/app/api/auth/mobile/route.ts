/**
 * POST /api/auth/mobile
 *
 * Mobile authentication endpoint for NRPG contractor app.
 * Returns bearer access token for React Native clients (stored in expo-secure-store).
 *
 * Access token: 7 days (using existing generateToken — suitable for contractor app)
 * Supports ?action=refresh for token renewal using an existing valid token.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/net/client-ip';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken } from '@/lib/auth';
import { isAccountLocked, recordFailedLoginAttempt, recordSuccessfulLogin } from '@/lib/services/lockout.service';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  deviceId: z.string().optional(),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const isRefresh = url.searchParams.get('action') === 'refresh';

    if (isRefresh) {
      return handleRefresh(request);
    }

    const body = await request.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          errors: parsed.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const normalisedEmail = email.toLowerCase().trim();
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') ?? 'unknown';

    const user = await prisma.user.findUnique({
      where: { email: normalisedEmail },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check account lockout by userId (after confirming user exists)
    const locked = await isAccountLocked(user.id);
    if (locked) {
      return NextResponse.json(
        {
          success: false,
          error: 'ACCOUNT_LOCKED',
          message: 'Account temporarily locked due to multiple failed login attempts. Try again later.',
        },
        { status: 423 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      await recordFailedLoginAttempt(user.id, ipAddress, userAgent);
      return NextResponse.json(
        { success: false, error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'ACCOUNT_INACTIVE', message: 'Account is inactive. Contact support.' },
        { status: 403 }
      );
    }

    await recordSuccessfulLogin(user.id, ipAddress, userAgent);

    // generateToken() returns a 7-day JWT — suitable for mobile access token
    const accessToken = generateToken(user);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
          avatar: user.avatar,
        },
        tokens: {
          access: accessToken,
          expiresIn: 604800, // 7 days in seconds
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[/api/auth/mobile] Error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}

async function handleRefresh(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = refreshSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'VALIDATION_ERROR', message: 'Refresh token is required' },
        { status: 400 }
      );
    }

    const decoded = verifyToken(parsed.data.refreshToken);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'INVALID_TOKEN', message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'USER_NOT_FOUND', message: 'User account not found or inactive' },
        { status: 401 }
      );
    }

    const accessToken = generateToken(user);

    return NextResponse.json(
      {
        success: true,
        tokens: {
          access: accessToken,
          expiresIn: 604800,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[/api/auth/mobile refresh] Error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Token refresh failed' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
