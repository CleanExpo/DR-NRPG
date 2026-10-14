/**
 * Unified Resend Email Service
 *
 * Provides a centralized email service using Resend for all transactional emails.
 * Includes lazy initialization to avoid errors when API key is missing.
 */

import { SITE_URL } from '@/lib/seo/site-url';
import { Resend } from 'resend';

// Lazy-initialized Resend client
let resendClient: Resend | null = null;

/**
 * Get or create Resend client instance
 */
export function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

/**
 * Email configuration
 */
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'Disaster Recovery Australia <noreply@disasterrecovery.com.au>',
  baseUrl: SITE_URL,
  supportEmail: 'support@disasterrecovery.com.au',
};

/**
 * Generic email sending interface
 */
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResendClient();

    if (!resend) {
      console.warn('⚠️ RESEND_API_KEY not configured, skipping email to:', options.to);
      return { success: false, error: 'Email service not configured' };
    }

    const response = await resend.emails.send({
      from: options.from || EMAIL_CONFIG.from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    if (response.error) {
      console.error('Resend email error:', response.error);
      return { success: false, error: response.error.message };
    }

    console.log('✉️ Email sent successfully:', response.data?.id);
    return { success: true, messageId: response.data?.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============================================================================
// Authentication Email Templates
// ============================================================================

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName?: string,
  /** Trusted origin from getUserReturnOrigin (tenant domain or SITE_URL). */
  baseUrl: string = EMAIL_CONFIG.baseUrl
): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;
  const displayName = userName || 'there';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .button:hover { background: #047857; }
    .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 14px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .link-text { word-break: break-all; font-size: 12px; color: #666; background: #f3f4f6; padding: 10px; border-radius: 4px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hi ${displayName},</p>

      <p>We received a request to reset your password for your Disaster Recovery Australia account.</p>

      <p>Click the button below to create a new password:</p>

      <p style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </p>

      <div class="warning">
        <strong>⏱️ This link expires in 1 hour.</strong><br>
        If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
      </div>

      <p class="link-text">
        <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
        ${resetUrl}
      </p>

      <p>If you need help, contact us at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia<br>
      Australia's #1 Disaster Recovery Platform</p>
      <p>This email was sent to ${email}</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Password Reset Request

Hi ${displayName},

We received a request to reset your password for your Disaster Recovery Australia account.

Click here to reset your password:
${resetUrl}

This link expires in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.

Need help? Contact us at ${EMAIL_CONFIG.supportEmail}

---
Disaster Recovery Australia
Australia's #1 Disaster Recovery Platform
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - Disaster Recovery Australia',
    html,
    text,
  });
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  email: string,
  verificationToken: string,
  userName?: string,
  /** Trusted origin from getUserReturnOrigin (tenant domain or SITE_URL). */
  baseUrl: string = EMAIL_CONFIG.baseUrl
): Promise<{ success: boolean; error?: string }> {
  const verifyUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;
  const displayName = userName || 'there';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .button:hover { background: #047857; }
    .benefits { background: white; padding: 20px; margin: 20px 0; border-radius: 4px; border-left: 4px solid #059669; }
    .benefits ul { margin: 10px 0; padding-left: 20px; }
    .benefits li { margin: 8px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .link-text { word-break: break-all; font-size: 12px; color: #666; background: #f3f4f6; padding: 10px; border-radius: 4px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✉️ Verify Your Email</h1>
    </div>
    <div class="content">
      <p>Hi ${displayName},</p>

      <p>Welcome to Disaster Recovery Australia! Please verify your email address to complete your registration.</p>

      <p style="text-align: center;">
        <a href="${verifyUrl}" class="button">Verify Email Address</a>
      </p>

      <div class="benefits">
        <strong>Once verified, you'll have access to:</strong>
        <ul>
          <li>Submit disaster recovery claims</li>
          <li>Track your claim status in real-time</li>
          <li>Connect with IICRC-certified contractors</li>
          <li>Receive quotes and schedule work</li>
          <li>Manage your property portfolio</li>
        </ul>
      </div>

      <p class="link-text">
        <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
        ${verifyUrl}
      </p>

      <p><strong>This link expires in 24 hours.</strong></p>

      <p>If you didn't create an account with us, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia<br>
      Australia's #1 Disaster Recovery Platform</p>
      <p>This email was sent to ${email}</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Verify Your Email

Hi ${displayName},

Welcome to Disaster Recovery Australia! Please verify your email address to complete your registration.

Click here to verify your email:
${verifyUrl}

Once verified, you'll have access to:
- Submit disaster recovery claims
- Track your claim status in real-time
- Connect with IICRC-certified contractors
- Receive quotes and schedule work
- Manage your property portfolio

This link expires in 24 hours.

If you didn't create an account with us, please ignore this email.

---
Disaster Recovery Australia
Australia's #1 Disaster Recovery Platform
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - Disaster Recovery Australia',
    html,
    text,
  });
}

/**
 * Send welcome email after successful registration/verification
 */
export async function sendWelcomeEmail(
  email: string,
  userName?: string
): Promise<{ success: boolean; error?: string }> {
  const dashboardUrl = `${EMAIL_CONFIG.baseUrl}/dashboard`;
  const displayName = userName || 'there';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .steps { background: white; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .step { display: flex; margin: 15px 0; }
    .step-number { background: #059669; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Disaster Recovery Australia!</h1>
    </div>
    <div class="content">
      <p>Hi ${displayName},</p>

      <p>Your account is now verified and ready to use. You're now part of Australia's largest network of disaster recovery professionals.</p>

      <div class="steps">
        <strong>Get Started in 3 Easy Steps:</strong>

        <div class="step">
          <div class="step-number">1</div>
          <div>
            <strong>Complete Your Profile</strong><br>
            Add your contact details and property information
          </div>
        </div>

        <div class="step">
          <div class="step-number">2</div>
          <div>
            <strong>Submit a Claim</strong><br>
            Our AI matches you with the best contractors for your situation
          </div>
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <div>
            <strong>Get Quotes & Compare</strong><br>
            Receive competitive quotes from IICRC-certified professionals
          </div>
        </div>
      </div>

      <p style="text-align: center;">
        <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
      </p>

      <p>Questions? Contact our support team at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia<br>
      Australia's #1 Disaster Recovery Platform</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Welcome to Disaster Recovery Australia!

Hi ${displayName},

Your account is now verified and ready to use. You're now part of Australia's largest network of disaster recovery professionals.

Get Started in 3 Easy Steps:

1. Complete Your Profile
   Add your contact details and property information

2. Submit a Claim
   Our AI matches you with the best contractors for your situation

3. Get Quotes & Compare
   Receive competitive quotes from IICRC-certified professionals

Visit your dashboard: ${dashboardUrl}

Questions? Contact us at ${EMAIL_CONFIG.supportEmail}

---
Disaster Recovery Australia
Australia's #1 Disaster Recovery Platform
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to Disaster Recovery Australia!',
    html,
    text,
  });
}

/**
 * Send lead capture confirmation email
 */
export async function sendLeadConfirmationEmail(
  email: string,
  data: {
    firstName: string;
    leadId: string;
    damageType: string;
    suburb: string;
    urgency: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const responseTime =
    data.urgency === 'URGENT'
      ? 'within 2 hours'
      : data.urgency === 'HIGH'
        ? 'within 24 hours'
        : 'within 48 hours';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .ref-box { background: white; padding: 20px; border-left: 4px solid #059669; margin: 20px 0; border-radius: 4px; }
    .timeline { background: white; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .timeline-item { margin: 15px 0; padding-left: 20px; border-left: 2px solid #059669; }
    .urgent { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ We've Received Your Request</h1>
    </div>
    <div class="content">
      <p>Hi ${data.firstName},</p>

      <p>Thank you for reaching out to Disaster Recovery Australia. We've received your request and our team is ready to help with your ${data.damageType.toLowerCase()} damage in ${data.suburb}.</p>

      <div class="ref-box">
        <strong>Reference Number:</strong> ${data.leadId}<br>
        <strong>Expected Response:</strong> ${responseTime}
      </div>

      ${data.urgency === 'URGENT' ? `
      <div class="urgent">
        <strong>⚡ Urgent Request</strong><br>
        We understand you need immediate assistance. A team member will contact you as soon as possible.
      </div>
      ` : ''}

      <div class="timeline">
        <strong>What Happens Next:</strong>

        <div class="timeline-item">
          <strong>1. Review</strong><br>
          Our team reviews your request and identifies the best contractors in your area
        </div>

        <div class="timeline-item">
          <strong>2. Contact</strong><br>
          We'll call you ${responseTime} to discuss your needs
        </div>

        <div class="timeline-item">
          <strong>3. Quotes</strong><br>
          Receive competitive quotes from IICRC-certified professionals
        </div>

        <div class="timeline-item">
          <strong>4. Recovery</strong><br>
          Choose your preferred contractor and start the recovery process
        </div>
      </div>

      <p>If you need immediate assistance, please call us at <strong>1300 000 000</strong>.</p>

      <p>Questions? Contact us at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia<br>
      Australia's #1 Disaster Recovery Platform</p>
      <p>This email was sent to ${email}</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
We've Received Your Request

Hi ${data.firstName},

Thank you for reaching out to Disaster Recovery Australia. We've received your request and our team is ready to help with your ${data.damageType.toLowerCase()} damage in ${data.suburb}.

Reference Number: ${data.leadId}
Expected Response: ${responseTime}

What Happens Next:

1. Review - Our team reviews your request and identifies the best contractors in your area

2. Contact - We'll call you ${responseTime} to discuss your needs

3. Quotes - Receive competitive quotes from IICRC-certified professionals

4. Recovery - Choose your preferred contractor and start the recovery process

If you need immediate assistance, please call us at 1300 000 000.

Questions? Contact us at ${EMAIL_CONFIG.supportEmail}

---
Disaster Recovery Australia
Australia's #1 Disaster Recovery Platform
  `;

  return sendEmail({
    to: email,
    subject: `Your Request Received - Reference #${data.leadId}`,
    html,
    text,
  });
}

/**
 * Send newsletter double-opt-in confirmation email
 */
export async function sendNewsletterConfirmationEmail(
  email: string,
  confirmationToken: string,
  firstName?: string
): Promise<{ success: boolean; error?: string }> {
  const confirmUrl = `${EMAIL_CONFIG.baseUrl}/api/newsletter/confirm?token=${confirmationToken}`;
  const displayName = firstName || 'there';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .button:hover { background: #047857; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .link-text { word-break: break-all; font-size: 12px; color: #666; background: #f3f4f6; padding: 10px; border-radius: 4px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Confirm Your Subscription</h1>
    </div>
    <div class="content">
      <p>Hi ${displayName},</p>

      <p>Thanks for signing up to the Disaster Recovery Australia newsletter. Please confirm your email address to start receiving our updates.</p>

      <p style="text-align: center;">
        <a href="${confirmUrl}" class="button">Confirm Subscription</a>
      </p>

      <p class="link-text">
        <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
        ${confirmUrl}
      </p>

      <p>If you didn't request this, you can safely ignore this email and you won't be subscribed.</p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia<br>
      Australia's #1 Disaster Recovery Platform</p>
      <p>This email was sent to ${email}</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Confirm Your Subscription

Hi ${displayName},

Thanks for signing up to the Disaster Recovery Australia newsletter. Please confirm your email address to start receiving our updates.

Confirm your subscription:
${confirmUrl}

If you didn't request this, you can safely ignore this email and you won't be subscribed.

---
Disaster Recovery Australia
Australia's #1 Disaster Recovery Platform
  `;

  return sendEmail({
    to: email,
    subject: 'Confirm Your Newsletter Subscription - Disaster Recovery Australia',
    html,
    text,
  });
}

/**
 * Send newsletter welcome email
 */
export async function sendNewsletterWelcomeEmail(
  email: string,
  firstName?: string
): Promise<{ success: boolean; error?: string }> {
  const displayName = firstName || 'there';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .benefits { background: white; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .benefits ul { margin: 10px 0; padding-left: 20px; }
    .benefits li { margin: 8px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 Welcome to Our Newsletter!</h1>
    </div>
    <div class="content">
      <p>Hi ${displayName},</p>

      <p>Thank you for subscribing to the Disaster Recovery Australia newsletter! You're now part of a community dedicated to helping Australians recover from disasters.</p>

      <div class="benefits">
        <strong>What You'll Receive:</strong>
        <ul>
          <li>Industry insights and disaster preparedness tips</li>
          <li>Updates on new services and features</li>
          <li>Exclusive offers for subscribers</li>
          <li>Stories of successful recoveries</li>
          <li>Seasonal safety reminders</li>
        </ul>
      </div>

      <p>We respect your inbox and will only send valuable content. You can unsubscribe at any time using the link at the bottom of our emails.</p>

      <p>If you have any questions, contact us at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia<br>
      Australia's #1 Disaster Recovery Platform</p>
      <p>This email was sent to ${email}</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Welcome to Our Newsletter!

Hi ${displayName},

Thank you for subscribing to the Disaster Recovery Australia newsletter! You're now part of a community dedicated to helping Australians recover from disasters.

What You'll Receive:
- Industry insights and disaster preparedness tips
- Updates on new services and features
- Exclusive offers for subscribers
- Stories of successful recoveries
- Seasonal safety reminders

We respect your inbox and will only send valuable content. You can unsubscribe at any time using the link at the bottom of our emails.

Questions? Contact us at ${EMAIL_CONFIG.supportEmail}

---
Disaster Recovery Australia
Australia's #1 Disaster Recovery Platform
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to the Disaster Recovery Australia Newsletter!',
    html,
    text,
  });
}

// ============================================================================
// Job Notification Email Templates (Sprint 2)
// ============================================================================

/**
 * Send new job alert to contractor
 */
export async function sendNewJobAlertEmail(
  email: string,
  data: {
    contractorName: string;
    jobType: string;
    location: string;
    urgency: string;
    potentialValue: string;
    jobId: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const viewJobUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/contractor/opportunities/${data.jobId}`;
  const urgencyColors: Record<string, string> = {
    'Emergency': '#dc2626',
    'High': '#f59e0b',
    'Medium': '#3b82f6',
    'Low': '#22c55e',
  };
  const urgencyColor = urgencyColors[data.urgency] || '#3b82f6';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .job-card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid ${urgencyColor}; }
    .job-detail { margin: 10px 0; }
    .job-label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; }
    .job-value { font-size: 16px; color: #333; margin-top: 4px; }
    .urgency-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: ${urgencyColor}; color: white; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 New Job Opportunity</h1>
    </div>
    <div class="content">
      <p>Hi ${data.contractorName},</p>

      <p>Great news! A new job matching your profile is available in your area.</p>

      <div class="job-card">
        <div class="job-detail">
          <div class="job-label">Service Type</div>
          <div class="job-value">${data.jobType}</div>
        </div>

        <div class="job-detail">
          <div class="job-label">Location</div>
          <div class="job-value">${data.location}</div>
        </div>

        <div class="job-detail">
          <div class="job-label">Urgency</div>
          <div class="job-value"><span class="urgency-badge">${data.urgency}</span></div>
        </div>

        <div class="job-detail">
          <div class="job-label">Estimated Value</div>
          <div class="job-value">${data.potentialValue}</div>
        </div>
      </div>

      <p style="text-align: center;">
        <a href="${viewJobUrl}" class="button">View & Submit Quote</a>
      </p>

      <p><strong>⏱️ Act Fast!</strong> Early responses have higher acceptance rates.</p>

      <p>If you have questions, contact us at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia<br>
      Australia's #1 Disaster Recovery Platform</p>
      <p>This email was sent to ${email}</p>
      <p><a href="${EMAIL_CONFIG.baseUrl}/dashboard/contractor/settings/notifications">Manage notification preferences</a></p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
New Job Opportunity

Hi ${data.contractorName},

Great news! A new job matching your profile is available in your area.

Job Details:
- Service Type: ${data.jobType}
- Location: ${data.location}
- Urgency: ${data.urgency}
- Estimated Value: ${data.potentialValue}

View and submit your quote: ${viewJobUrl}

Act Fast! Early responses have higher acceptance rates.

Questions? Contact us at ${EMAIL_CONFIG.supportEmail}

---
Disaster Recovery Australia
Australia's #1 Disaster Recovery Platform
  `;

  return sendEmail({
    to: email,
    subject: `🔔 New ${data.urgency} Job: ${data.jobType} in ${data.location}`,
    html,
    text,
  });
}

/**
 * Send job status update to contractor
 */
export async function sendJobStatusUpdateEmail(
  email: string,
  data: {
    contractorName: string;
    jobType: string;
    location: string;
    status: 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
    clientName?: string;
    jobId: string;
    message?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const dashboardUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/contractor`;

  const statusConfig = {
    ACCEPTED: {
      emoji: '✅',
      title: 'Quote Accepted!',
      color: '#22c55e',
      message: 'Congratulations! Your quote has been accepted by the client.',
    },
    REJECTED: {
      emoji: '❌',
      title: 'Quote Not Selected',
      color: '#ef4444',
      message: 'Unfortunately, the client chose a different contractor for this job.',
    },
    COMPLETED: {
      emoji: '🎉',
      title: 'Job Completed',
      color: '#3b82f6',
      message: 'The job has been marked as completed. Great work!',
    },
  };

  const config = statusConfig[data.status];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${config.color}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .status-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid ${config.color}; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${config.emoji} ${config.title}</h1>
    </div>
    <div class="content">
      <p>Hi ${data.contractorName},</p>

      <p>${config.message}</p>

      <div class="status-box">
        <strong>Job Details:</strong><br>
        <strong>Service:</strong> ${data.jobType}<br>
        <strong>Location:</strong> ${data.location}<br>
        ${data.clientName ? `<strong>Client:</strong> ${data.clientName}<br>` : ''}
        ${data.message ? `<br><strong>Message:</strong> ${data.message}` : ''}
      </div>

      ${data.status === 'ACCEPTED' ? `
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Contact the client to confirm scheduling</li>
        <li>Review the job requirements</li>
        <li>Prepare your equipment and team</li>
      </ul>
      ` : ''}

      <p style="text-align: center;">
        <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
      </p>

      <p>If you have questions, contact us at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia<br>
      Australia's #1 Disaster Recovery Platform</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${config.title}

Hi ${data.contractorName},

${config.message}

Job Details:
- Service: ${data.jobType}
- Location: ${data.location}
${data.clientName ? `- Client: ${data.clientName}` : ''}
${data.message ? `\nMessage: ${data.message}` : ''}

Visit your dashboard: ${dashboardUrl}

Questions? Contact us at ${EMAIL_CONFIG.supportEmail}

---
Disaster Recovery Australia
Australia's #1 Disaster Recovery Platform
  `;

  return sendEmail({
    to: email,
    subject: `${config.emoji} ${config.title}: ${data.jobType}`,
    html,
    text,
  });
}

/**
 * Send claim status update to client
 */
export async function sendClaimStatusEmail(
  email: string,
  data: {
    clientName: string;
    claimId: string;
    status: string;
    serviceType: string;
    message?: string;
    contractorName?: string;
    eta?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const trackUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/client/claims/${data.claimId}`;

  const statusMessages: Record<string, { emoji: string; title: string; description: string }> = {
    'MATCHED': {
      emoji: '🔍',
      title: 'Contractors Found',
      description: 'We\'ve found qualified contractors in your area who can help.',
    },
    'QUOTE_RECEIVED': {
      emoji: '💰',
      title: 'Quote Received',
      description: 'A contractor has submitted a quote for your review.',
    },
    'SCHEDULED': {
      emoji: '📅',
      title: 'Work Scheduled',
      description: 'Your restoration work has been scheduled.',
    },
    'IN_PROGRESS': {
      emoji: '🔧',
      title: 'Work In Progress',
      description: 'The contractor is actively working on your property.',
    },
    'COMPLETED': {
      emoji: '✅',
      title: 'Job Completed',
      description: 'The restoration work has been completed.',
    },
  };

  const statusInfo = statusMessages[data.status] || {
    emoji: '📋',
    title: 'Status Update',
    description: 'There\'s an update on your claim.',
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .status-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #059669; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${statusInfo.emoji} ${statusInfo.title}</h1>
    </div>
    <div class="content">
      <p>Hi ${data.clientName},</p>

      <p>${statusInfo.description}</p>

      <div class="status-box">
        <strong>Claim Details:</strong><br>
        <strong>Reference:</strong> ${data.claimId}<br>
        <strong>Service:</strong> ${data.serviceType}<br>
        ${data.contractorName ? `<strong>Contractor:</strong> ${data.contractorName}<br>` : ''}
        ${data.eta ? `<strong>ETA:</strong> ${data.eta}<br>` : ''}
        ${data.message ? `<br><strong>Notes:</strong> ${data.message}` : ''}
      </div>

      <p style="text-align: center;">
        <a href="${trackUrl}" class="button">Track Your Claim</a>
      </p>

      <p>If you have questions, contact us at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia<br>
      Australia's #1 Disaster Recovery Platform</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${statusInfo.title}

Hi ${data.clientName},

${statusInfo.description}

Claim Details:
- Reference: ${data.claimId}
- Service: ${data.serviceType}
${data.contractorName ? `- Contractor: ${data.contractorName}` : ''}
${data.eta ? `- ETA: ${data.eta}` : ''}
${data.message ? `\nNotes: ${data.message}` : ''}

Track your claim: ${trackUrl}

Questions? Contact us at ${EMAIL_CONFIG.supportEmail}

---
Disaster Recovery Australia
Australia's #1 Disaster Recovery Platform
  `;

  return sendEmail({
    to: email,
    subject: `${statusInfo.emoji} ${statusInfo.title} - Claim #${data.claimId}`,
    html,
    text,
  });
}
