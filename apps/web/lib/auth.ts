import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { clientIpFromHeaders } from '@/lib/net/client-ip';
import bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import { validateSecrets } from '@/lib/config/secrets-validation';
import { validateProductionDefaults } from '@/lib/config/development-defaults';
import { isAccountLocked, recordFailedLoginAttempt, recordSuccessfulLogin } from '@/lib/services/lockout.service';
import { logLoginAttempt, logAccountLockout } from '@/lib/services/audit.service';

// Validate all critical secrets at module load time
// This ensures the app fails fast if required secrets are missing
validateSecrets();

// Validate that no development defaults leak into production
// This prevents accidental security issues from dev configs
validateProductionDefaults();

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV === 'test' ? 'test-only-jwt-secret' : undefined);

// Validate NEXTAUTH_SECRET exists - CRITICAL for security
// This validation runs at startup to catch configuration errors early
// Skip during build phase - secrets are not available during static generation
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
if (!process.env.NEXTAUTH_SECRET && !isBuildPhase) {
  const errorMessage =
    process.env.NODE_ENV === 'production'
      ? 'CRITICAL: NEXTAUTH_SECRET environment variable is not set. This is required for secure session management. Please set NEXTAUTH_SECRET in your production environment (e.g., Vercel secrets).'
      : 'WARNING: NEXTAUTH_SECRET not set. Sessions will use default insecure behavior in development. Set NEXTAUTH_SECRET for secure session handling.';

  if (process.env.NODE_ENV === 'production') {
    // FAIL FAST in production - don't allow app to start without NEXTAUTH_SECRET
    throw new Error(errorMessage);
  } else {
    console.warn(errorMessage);
  }
}

function requireJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET (or NEXTAUTH_SECRET fallback)');
  }
  return JWT_SECRET;
}

export interface JWTPayload {
  userId: string;
  email?: string;
  userType?: 'ADMIN' | 'CONTRACTOR' | 'CLIENT' | 'SUPER_ADMIN';
  tenantId?: string | null;
  type?: 'auth' | 'password-reset' | 'email-verification' | '2fa';
  iat?: number;
  exp?: number;
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    userType: user.userType,
    tenantId: user.tenantId,
    type: 'auth',
  };

  return jwt.sign(payload, requireJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, requireJwtSecret()) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * NextAuth options export.
 *
 * This enables cookie-based sessions (`getServerSession(authOptions)`) across App Router API routes.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? '';

        if (!email || !password) {
          return null;
        }

        // Get IP and user agent for audit logging.
        //
        // IMPORTANT: next-auth v4 does NOT pass a Fetch `Headers` instance here.
        // In the App Router path (next-auth/next NextAuthRouteHandler) it passes
        // `Object.fromEntries(await headers())` — a plain lowercase-keyed object —
        // and in the Pages Router path it passes Node's IncomingHttpHeaders.
        // Calling `.get()` on either throws `req?.headers?.get is not a function`,
        // which next-auth surfaces as a 401 — breaking EVERY credentials sign-in
        // (caught live by the DR-905 go-live gate on run 28592431904). Read
        // defensively across all three shapes.
        const headerValue = (name: string): string | undefined => {
          const h = req?.headers as
            | Headers
            | Record<string, string | string[] | undefined>
            | undefined;
          if (!h) return undefined;
          if (typeof (h as Headers).get === 'function') {
            return (h as Headers).get(name) ?? undefined;
          }
          const record = h as Record<string, string | string[] | undefined>;
          const value = record[name] ?? record[name.toLowerCase()];
          return Array.isArray(value) ? value[0] : value;
        };
        const ip = clientIpFromHeaders(headerValue);
        const userAgent = headerValue('user-agent') || 'unknown';

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            userType: true,
            avatar: true,
            isActive: true,
            isBlocked: true,
            lockedUntil: true,
            tenantId: true,
          },
        });

        // Check if account is locked (before attempting password verification)
        if (user && user.lockedUntil && new Date() < user.lockedUntil) {
          // Account is still locked - log and reject login
          await logAccountLockout(user.id, ip, userAgent);
          return null;
        }

        // Verify password (using timing-safe comparison)
        const hashedPassword = user?.password || '$2a$10$dummyhashtopreventtimingleak';
        const isValidPassword = await verifyPasswordSafe(password, hashedPassword);

        if (!user || !user.password || !isValidPassword) {
          // Invalid credentials - record failed attempt and log event
          if (user) {
            const { locked } = await recordFailedLoginAttempt(user.id, ip, userAgent);
            await logLoginAttempt(user.id, false, ip, userAgent, { locked });
          }
          return null;
        }

        // Check account status
        if (!user.isActive || user.isBlocked) {
          await logLoginAttempt(user.id, false, ip, userAgent, {
            reason: 'account_inactive_or_blocked',
          });
          return null;
        }

        // Successful login - reset failed attempts and record login
        await recordSuccessfulLogin(user.id, ip, userAgent);
        await logLoginAttempt(user.id, true, ip, userAgent);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
          avatar: user.avatar,
          tenantId: user.tenantId,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.id = u.id;
        token.userType = u.userType;
        token.role = u.userType;
        token.avatar = u.avatar ?? null;
        token.tenantId = u.tenantId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const su = session.user as any;
        su.id = token.id;
        su.userType = token.userType;
        su.role = token.userType;
        su.avatar = token.avatar ?? null;
        su.tenantId = token.tenantId ?? null;
      }
      return session;
    },
  },
};

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * Timing-safe password verification to prevent timing attacks
 * Follows Anthropic security best practices
 */
export async function verifyPasswordSafe(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const result = await bcrypt.compare(plainPassword, hashedPassword);
    await new Promise(resolve => setTimeout(resolve, 5 + randomInt(10)));
    return result;
  } catch (error) {
    await new Promise(resolve => setTimeout(resolve, 5 + randomInt(10)));
    return false;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function generateResetToken(userId: string): string {
  return jwt.sign({ userId, type: 'password-reset' } satisfies Partial<JWTPayload>, requireJwtSecret(), {
    expiresIn: '1h',
  });
}

export function generateVerificationToken(userId: string): string {
  return jwt.sign({ userId, type: 'email-verification' } satisfies Partial<JWTPayload>, requireJwtSecret(), {
    expiresIn: '24h',
  });
}

export function isAdmin(roleOrUserType: string): boolean {
  return roleOrUserType === 'ADMIN' || roleOrUserType === 'SUPER_ADMIN';
}

export function isSuperAdmin(roleOrUserType: string): boolean {
  return roleOrUserType === 'SUPER_ADMIN';
}
