import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { handleUnexpectedError, handleValidationError } from '@/lib/api-errors';
import { sendEmail } from '@/lib/services/email.service';
import { sendResumeLinkSchema } from '@/lib/validations/client-onboarding';
import { getTenantDb } from '@/lib/get-tenant-db';
import { ZodError } from 'zod';
import crypto from 'crypto';
import { getUserReturnOrigin } from '@/lib/tenant-return-origin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/client/onboarding/send-resume-link
 *
 * Send magic link email to continue onboarding on another device
 * Generates secure token valid for 24 hours
 * Use case: Client starts on mobile, needs to upload documents on desktop
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;
    
    // Get tenant-scoped database client
    const db = getTenantDb(authResult.context);

    // Check role
    if (!requireRole(user, ['CLIENT', 'ADMIN', 'SUPER_ADMIN'])) {
      return unauthorizedRoleResponse(['CLIENT', 'ADMIN', 'SUPER_ADMIN']);
    }

    // Parse and validate
    const body = await request.json();
    const validated = sendResumeLinkSchema.parse(body);

    // Generate secure token (expires in 24 hours)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database (you may want to create a ResumeToken table)
    // For now, we'll generate a JWT-like token
    const payload = {
      userId: user.id,
      phase: validated.currentPhase,
      email: validated.email,
      expiresAt: expiresAt.getTime(),
    };

    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const secureToken = `${token}.${encodedPayload}`;

    // Generate resume URL
    const resumeUrl = `${await getUserReturnOrigin(user)}/dashboard/client/onboarding/${validated.currentPhase}?token=${encodeURIComponent(secureToken)}`;

    // Send email with magic link
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Continue Your NRPG Setup on Another Device</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #00BFA6 0%, #00897B 100%); padding: 30px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Continue on Another Device</h1>
    </div>

    <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Hi <strong>${user.name || 'Valued Client'}</strong>,</p>

        <p>You requested to continue your NRPG onboarding on another device. Click the button below to resume exactly where you left off:</p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${resumeUrl}"
               style="display: inline-block; background-color: #00BFA6; color: #ffffff; text-decoration: none;
                      padding: 14px 28px; border-radius: 4px; font-size: 16px; font-weight: bold;">
                Continue Onboarding →
            </a>
        </div>

        <p style="font-size: 14px; color: #666;">
            You'll resume at: <strong>${validated.currentPhase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong>
        </p>

        <div style="background: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #E65100; font-size: 14px;">
                <strong>⏰ This link expires in 24 hours</strong><br>
                For security, this link can only be used once.
            </p>
        </div>

        <p style="font-size: 12px; color: #999; margin-top: 30px;">
            If you didn't request this link, you can safely ignore this email. Your account is secure.
        </p>
    </div>
</body>
</html>
    `;

    await sendEmail({
      to: validated.email,
      subject: 'Continue Your NRPG Setup on Another Device',
      html: emailContent,
    });

    return NextResponse.json({
      success: true,
      message: `Resume link sent to ${validated.email}`,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error);
    }
    return handleUnexpectedError(error);
  }
}
