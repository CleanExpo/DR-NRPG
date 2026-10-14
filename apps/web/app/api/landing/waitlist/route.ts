/**
 * Waitlist Submission API
 *
 * POST /api/landing/waitlist
 * Captures email addresses from pre-launch waitlist landing page
 *
 * Features:
 * - Email validation and duplicate checking
 * - UTM parameter tracking for marketing attribution
 * - Confirmation email sending via Resend
 * - Rate limiting (10 submissions per IP per hour)
 * - Analytics event tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { basePrisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import * as Sentry from '@sentry/nextjs';

// Initialize Resend client (only in runtime, not during build)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize rate limiting (10 requests per hour per IP) - only if Redis is configured
const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, '1 h'),
        analytics: true,
        prefix: 'ratelimit:waitlist',
      })
    : null;

// Validation schema
const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  userType: z.enum(['PROPERTY_OWNER', 'CONTRACTOR'], {
    errorMap: () => ({ message: 'User type must be PROPERTY_OWNER or CONTRACTOR' }),
  }),
  // Marketing attribution (optional)
  source: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
  // Consent
  consentEmail: z.boolean().default(false),
});

type WaitlistSubmissionData = z.infer<typeof waitlistSchema>;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check (skip if not configured)
    if (ratelimit) {
      const ip =
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const { success, limit, remaining, reset } = await ratelimit.limit(ip);

      if (!success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Too many submissions. Please try again later.',
            rateLimit: {
              limit,
              remaining,
              reset: new Date(reset).toISOString(),
            },
          },
          { status: 429 }
        );
      }
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = waitlistSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data: WaitlistSubmissionData = validationResult.data;

    // Check for duplicate email
    const existingSubmission = await basePrisma.waitlistSubmission.findUnique({
      where: { email: data.email },
    });

    if (existingSubmission) {
      return NextResponse.json(
        {
          success: false,
          error: 'This email is already on the waitlist',
          message: "You're already signed up! We'll notify you when we launch.",
        },
        { status: 409 }
      );
    }

    // Create waitlist submission
    const submission = await basePrisma.waitlistSubmission.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        userType: data.userType,
        source: data.source || 'waitlist',
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        utmContent: data.utmContent,
        utmTerm: data.utmTerm,
        consentEmail: data.consentEmail,
      },
    });

    // Send confirmation email (non-blocking)
    sendConfirmationEmail(submission.email, submission.fullName, submission.userType).catch((error) => {
      console.error('[Waitlist API] Failed to send confirmation email:', error);
      // Don't fail the request if email fails
    });

    // Track analytics event (non-blocking)
    trackWaitlistConversion(submission).catch((error) => {
      console.error('[Waitlist API] Failed to track analytics:', error);
    });

    return NextResponse.json(
      {
        success: true,
        message: "You're on the list! Check your email for confirmation.",
        data: {
          id: submission.id,
          email: submission.email,
          userType: submission.userType,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Waitlist API] Error processing submission:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while processing your submission. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * Send confirmation email via Resend
 */
async function sendConfirmationEmail(email: string, fullName: string, userType: string): Promise<void> {
  const firstName = fullName.split(' ')[0];

  const subject = "🎉 You're on the NRPG Waitlist!";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to NRPG Waitlist</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #FF6B35 0%, #004E89 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to NRPG!</h1>
    <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">You're on the waitlist for Australia's leading disaster recovery network</p>
  </div>

  <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1F2937; margin-top: 0;">Hi ${firstName}! 👋</h2>

    <p style="color: #4B5563; margin-bottom: 20px;">
      Thank you for joining the NRPG waitlist! You're now part of an exclusive group of ${userType === 'PROPERTY_OWNER' ? 'property owners' : 'contractors'} who will be first to access our platform when we launch.
    </p>

    ${
      userType === 'PROPERTY_OWNER'
        ? `
    <div style="background: #F3F4F6; padding: 20px; border-radius: 6px; margin: 30px 0;">
      <h3 style="color: #1F2937; margin-top: 0; font-size: 18px;">What You'll Get Access To:</h3>
      <ul style="color: #4B5563; padding-left: 20px; margin-bottom: 0;">
        <li><strong>Verified IICRC-Certified Contractors</strong> - Only pre-screened, qualified professionals</li>
        <li><strong>24/7 Emergency Response</strong> - Get help when you need it most</li>
        <li><strong>Transparent Pricing</strong> - No hidden fees, no surprises</li>
        <li><strong>Real Reviews</strong> - Make informed decisions based on actual customer experiences</li>
        <li><strong>Direct Insurance Billing</strong> - Simplified claims process</li>
      </ul>
    </div>
    `
        : `
    <div style="background: #F3F4F6; padding: 20px; border-radius: 6px; margin: 30px 0;">
      <h3 style="color: #1F2937; margin-top: 0; font-size: 18px;">What You'll Get as a Contractor:</h3>
      <ul style="color: #4B5563; padding-left: 20px; margin-bottom: 0;">
        <li><strong>Qualified Leads Daily</strong> - Property owners actively seeking your services</li>
        <li><strong>Transparent Commission</strong> - 12-15% only when you win jobs (no monthly fees)</li>
        <li><strong>Mobile App</strong> - Manage jobs, track progress, communicate with clients</li>
        <li><strong>Build Your Reputation</strong> - Customer reviews and ratings boost your visibility</li>
        <li><strong>Business Analytics</strong> - Track your growth and optimize your operations</li>
      </ul>
    </div>
    `
    }

    <h3 style="color: #1F2937; margin-top: 30px; font-size: 18px;">What Happens Next?</h3>
    <ol style="color: #4B5563; padding-left: 20px;">
      <li><strong>We're building</strong> - Our team is working hard to create the best disaster recovery platform in Australia</li>
      <li><strong>You'll get updates</strong> - We'll keep you posted on our progress and share exclusive content</li>
      <li><strong>Early access</strong> - You'll be among the first to try the platform when we launch</li>
      <li><strong>Launch notification</strong> - We'll email you the moment we go live (expected Q2 2026)</li>
    </ol>

    <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 30px 0; border-radius: 4px;">
      <p style="color: #92400E; margin: 0; font-size: 14px;">
        <strong>💡 Pro Tip:</strong> Add <strong>support@disasterrecovery.com.au</strong> to your contacts to ensure you don't miss our launch announcement!
      </p>
    </div>

    <div style="text-align: center; margin-top: 40px;">
      <a href="https://disasterrecovery.com.au" style="display: inline-block; background: #FF6B35; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Visit Our Website</a>
    </div>

    <p style="color: #6B7280; font-size: 14px; margin-top: 40px; padding-top: 30px; border-top: 1px solid #E5E7EB;">
      You're receiving this email because you signed up for the NRPG waitlist at <a href="https://disasterrecovery.com.au" style="color: #FF6B35;">disasterrecovery.com.au</a>.
      <br><br>
      <strong>NRPG - National Restoration Professionals Group</strong><br>
      Australia's Premier Disaster Recovery Network<br>
      <a href="mailto:support@disasterrecovery.com.au" style="color: #FF6B35;">support@disasterrecovery.com.au</a>
    </p>
  </div>
</body>
</html>
  `;

  const textContent = `
Hi ${firstName}!

Thank you for joining the NRPG waitlist! You're now part of an exclusive group of ${userType === 'PROPERTY_OWNER' ? 'property owners' : 'contractors'} who will be first to access our platform when we launch.

What Happens Next:
1. We're building - Our team is working hard to create the best disaster recovery platform in Australia
2. You'll get updates - We'll keep you posted on our progress and share exclusive content
3. Early access - You'll be among the first to try the platform when we launch
4. Launch notification - We'll email you the moment we go live (expected Q2 2026)

Visit our website: https://disasterrecovery.com.au

---
NRPG - National Restoration Professionals Group
Australia's Premier Disaster Recovery Network
support@disasterrecovery.com.au
  `;

  try {
    if (!resend) {
      console.warn('[Waitlist API] Resend not configured, skipping email');
      return;
    }

    const result = await resend.emails.send({
      from: 'NRPG Team <noreply@disasterrecovery.com.au>',
      to: email,
      subject,
      html: htmlContent,
      text: textContent,
      tags: [
        { name: 'category', value: 'waitlist' },
        { name: 'user_type', value: userType.toLowerCase() },
      ],
    });

    // Update submission with email sent status
    await basePrisma.waitlistSubmission.update({
      where: { email },
      data: { emailSent: true },
    });

    console.log('[Waitlist API] Confirmation email sent:', result);
  } catch (error) {
    console.error('[Waitlist API] Failed to send email:', error);
    throw error;
  }
}

/**
 * Track analytics conversion event
 */
async function trackWaitlistConversion(submission: any): Promise<void> {
  // This would integrate with your analytics system
  // For now, just log it
  console.log('[Waitlist API] Conversion tracked:', {
    id: submission.id,
    userType: submission.userType,
    source: submission.source,
    utmCampaign: submission.utmCampaign,
  });

  Sentry.addBreadcrumb({
    message: 'Waitlist conversion tracked',
    category: 'analytics',
    level: 'info',
    data: {
      id: submission.id,
      userType: submission.userType,
      source: submission.source,
      utmCampaign: submission.utmCampaign,
    },
  });
}
