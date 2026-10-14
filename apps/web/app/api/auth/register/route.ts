import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validation-schemas';
import { handleValidationError, handleUnexpectedError, createErrorResponse, ErrorCode } from '@/lib/api-errors';
import { ZodError } from 'zod';
import { authRateLimiter } from '@/lib/api/redis-rate-limit';
import { randomBytes } from 'crypto';
import { sendVerificationEmail } from '@/lib/email/resend';
import { getTenantReturnOrigin } from '@/lib/tenant-return-origin';
import { CURRENT_CONSENT_VERSION } from '@/lib/consent';
import { isGoLiveEnabled, GO_LIVE_KILLED_MESSAGE } from '@/lib/feature-flags/nrpg-go-live';

/**
 * POST /api/auth/register
 * Registers a new user account
 *
 * @implements Anthropic best practices:
 * - Centralized Zod validation
 * - Secure password hashing (bcrypt rounds=12)
 * - Duplicate email check
 * - Structured error responses
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - prevent brute force registration attempts
    const rateLimitResult = await authRateLimiter(request);
    if (rateLimitResult) return rateLimitResult;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // DR-929: kill switch — new CONTRACTOR registrations only. CLIENT signups
    // (and existing contractor logins, elsewhere) are never gated by this
    // flag; this stops NEW contractor go-live activity, not existing users.
    if (validatedData.userType === 'CONTRACTOR' && !isGoLiveEnabled()) {
      return createErrorResponse(
        ErrorCode.SERVICE_UNAVAILABLE,
        GO_LIVE_KILLED_MESSAGE,
        503
      );
    }

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return createErrorResponse(
        ErrorCode.INVALID_INPUT,
        'An account with this email already exists',
        400
      );
    }

    // Hash password with bcrypt (12 rounds for security)
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user account with a single-use email-verification token (24h expiry).
    // Uses the User.emailVerificationToken field — the same mechanism the GET
    // /api/auth/verify-email link validates against.
    const verificationToken = randomBytes(32).toString('hex');

    // Never honour a client-supplied privileged role: public self-registration
    // may only create CLIENT or CONTRACTOR accounts. ADMIN/SUPER_ADMIN are
    // provisioned out of band, so anything other than CONTRACTOR collapses to CLIENT.
    const safeUserType = validatedData.userType === 'CONTRACTOR' ? 'CONTRACTOR' : 'CLIENT';

    // Consent is server-authoritative: the schema already guarantees the client
    // ticked the box (consentAccepted === true); we stamp WHEN and WHICH version
    // of the terms they accepted (DR-881).
    const consentAcceptedAt = new Date();

    // Create the account. For contractors, atomically create the Contractor +
    // ContractorOnboarding (step 0) so the lifecycle exists from signup onward.
    // Lifecycle rows key contractorId on User.id (DR-879, Option B).
    //
    // DR-906: the duplicate check above is check-then-create, so two CONCURRENT
    // signups for the same email can both pass it. The unique constraint on
    // User.email decides the winner inside the transaction; the loser's P2002
    // must surface as the same 400 as the sequential duplicate path — never a
    // 500 — so exactly one account exists and the race is a client error.
    let user;
    try {
      user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          userType: safeUserType,
          emailVerificationToken: verificationToken,
          emailVerificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
          consentAcceptedAt,
          consentVersion: CURRENT_CONSENT_VERSION,
        },
      });

      if (safeUserType === 'CONTRACTOR') {
        await tx.contractor.create({
          data: {
            userId: createdUser.id,
            businessName: `${validatedData.name}'s Business`,
          },
        });
        // Step-0 onboarding placeholder (status defaults to PENDING_START).
        // specialization + training modules are filled in when the contractor
        // starts training: POST /api/onboarding/start populates this PENDING_START row.
        await tx.contractorOnboarding.create({
          data: {
            contractorId: createdUser.id,
            specialization: 'PENDING',
          },
        });
      }

        return createdUser;
      });
    } catch (txError) {
      // Duck-typed Prisma unique-constraint violation (avoids a runtime
      // @prisma/client value import in test-loaded code).
      if ((txError as { code?: string })?.code === 'P2002') {
        return createErrorResponse(
          ErrorCode.INVALID_INPUT,
          'An account with this email already exists',
          400
        );
      }
      throw txError;
    }

    // Send the verification email. A send failure must NOT fail registration —
    // the user can re-request via the resend flow.
    try {
      await sendVerificationEmail(
        user.email,
        verificationToken,
        user.name ?? undefined,
        // Self-registered users have no tenant yet, so this resolves to SITE_URL.
        await getTenantReturnOrigin(user.tenantId)
      );
    } catch (emailError) {
      console.error('[register] verification email send failed:', emailError);
    }

    // Return success with user data (excluding password)
    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            userType: user.userType,
            avatar: user.avatar,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error);
    }
    return handleUnexpectedError(error);
  }
}
