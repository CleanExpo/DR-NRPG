/**
 * Email Service
 *
 * Handles all email notifications for the contractor onboarding system
 * Uses nodemailer with support for multiple providers:
 * - SendGrid (recommended for production)
 * - AWS SES
 * - SMTP (development)
 */

import { SITE_URL } from '@/lib/seo/site-url';
import nodemailer from 'nodemailer';

// ============================================================================
// TYPES
// ============================================================================

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface ContractorEmailData {
  businessName: string;
  contractorName?: string;
  contractorEmail: string;
  nrpgMemberId?: string;
}

// ============================================================================
// EMAIL TRANSPORTER
// ============================================================================

/**
 * Create email transporter based on environment configuration
 */
function createTransporter() {
  // Production: SendGrid
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  // Production: AWS SES
  if (process.env.AWS_SES_REGION) {
    return nodemailer.createTransport({
      host: `email-smtp.${process.env.AWS_SES_REGION}.amazonaws.com`,
      port: 587,
      secure: false,
      auth: {
        user: process.env.AWS_SES_ACCESS_KEY_ID || '',
        pass: process.env.AWS_SES_SECRET_ACCESS_KEY || '',
      },
    });
  }

  // Development/Fallback: Console logger (doesn't actually send)
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
}

const transporter = createTransporter();

// ============================================================================
// CORE EMAIL FUNCTION
// ============================================================================

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const from = options.from || process.env.EMAIL_FROM || 'noreply@disasterrecovery.com.au';

    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
    });

    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Drop every "<...>" run in one linear pass. A regex replace removes one layer, so
 * "<scr<b>ipt>" became "<script>" (CodeQL js/incomplete-multi-character-sanitization);
 * here a tag runs from its "<" to the next ">", whatever it contains. An unclosed "<"
 * keeps its text.
 */
function stripTags(html: string): string {
  let out = '';
  let tagStart = -1;
  for (let i = 0; i < html.length; i++) {
    const ch = html[i];
    if (tagStart >= 0) {
      if (ch === '>') tagStart = -1;
    } else if (ch === '<') {
      tagStart = i;
    } else {
      out += ch;
    }
  }
  return tagStart >= 0 ? out + html.slice(tagStart) : out;
}

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html: string): string {
  // &amp; is decoded last so an escaped entity such as "&amp;lt;" stays the
  // literal text "&lt;".
  return stripTags(html)
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

/**
 * Base email template wrapper
 */
function emailTemplate(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #00BFA6 0%, #00897B 100%); padding: 30px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                NRPG - Disaster Recovery
              </h1>
              <p style="margin: 8px 0 0 0; color: #E0F2F1; font-size: 14px;">
                National Restoration Professionals Group
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #666666; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} NRPG - National Restoration Professionals Group<br>
                Australia-wide disaster recovery and restoration services
              </p>
              <p style="margin: 12px 0 0 0; color: #999999; font-size: 11px; text-align: center;">
                This is an automated notification. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ============================================================================
// CONTRACTOR NOTIFICATION TEMPLATES
// ============================================================================

/**
 * 1. Registration Received Notification
 */
export async function sendRegistrationReceivedEmail(data: ContractorEmailData): Promise<boolean> {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #333333; font-size: 20px;">
      Registration Received
    </h2>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Hi <strong>${data.businessName}</strong>,
    </p>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Thank you for submitting your NRPG contractor registration. We've received your application and assigned you member ID: <strong>${data.nrpgMemberId}</strong>.
    </p>
    <div style="background-color: #E3F2FD; border-left: 4px solid #2196F3; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; color: #1976D2; font-size: 14px;">
        <strong>What happens next?</strong><br>
        Our verification team will review your ABN, IICRC certification, and insurance documents within 24-48 hours.
      </p>
    </div>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      You can continue with your training modules while we review your application. Once verified, you'll be able to start bidding on service requests.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="background-color: #00BFA6; border-radius: 4px; padding: 12px 24px;">
          <a href="${SITE_URL}/dashboard/contractor/onboarding" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
            View Your Progress
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 24px 0 0 0; color: #999999; font-size: 14px;">
      If you have any questions, please contact our support team.
    </p>
  `;

  return sendEmail({
    to: data.contractorEmail,
    subject: `NRPG Registration Received - ${data.nrpgMemberId}`,
    html: emailTemplate('Registration Received', content),
  });
}

/**
 * 2. Verification Approved Notification
 */
export async function sendVerificationApprovedEmail(data: ContractorEmailData & { reason?: string }): Promise<boolean> {
  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 64px; height: 64px; background-color: #4CAF50; border-radius: 50%; line-height: 64px;">
        <span style="color: white; font-size: 32px;">✓</span>
      </div>
    </div>
    <h2 style="margin: 0 0 16px 0; color: #4CAF50; font-size: 20px; text-align: center;">
      Congratulations! You're Verified
    </h2>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Hi <strong>${data.businessName}</strong>,
    </p>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Great news! Your NRPG contractor application has been approved. You're now a verified member of the National Restoration Professionals Group.
    </p>
    ${data.reason ? `
      <div style="background-color: #F1F8E9; border-left: 4px solid #8BC34A; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; color: #558B2F; font-size: 14px;">
          <strong>Verification Notes:</strong><br>
          ${data.reason}
        </p>
      </div>
    ` : ''}
    <div style="background-color: #E8F5E9; border-left: 4px solid #4CAF50; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; color: #2E7D32; font-size: 14px;">
        <strong>You can now:</strong>
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #2E7D32; font-size: 14px;">
        <li>Bid on service requests in your area</li>
        <li>Receive job notifications</li>
        <li>Access the contractor marketplace</li>
        <li>Earn income through the NRPG platform</li>
      </ul>
    </div>
    <table cellpadding="0" cellspacing="0" style="margin: 24px auto; display: block; width: fit-content;">
      <tr>
        <td style="background-color: #4CAF50; border-radius: 4px; padding: 12px 24px;">
          <a href="${SITE_URL}/dashboard/contractor" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
            Start Bidding on Jobs
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail({
    to: data.contractorEmail,
    subject: 'NRPG Verification Approved - Welcome to the Network!',
    html: emailTemplate('Verification Approved', content),
  });
}

/**
 * 3. Verification Rejected Notification
 */
export async function sendVerificationRejectedEmail(data: ContractorEmailData & { reason: string }): Promise<boolean> {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #F44336; font-size: 20px;">
      Registration Update Required
    </h2>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Hi <strong>${data.businessName}</strong>,
    </p>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      We've reviewed your NRPG contractor application. Unfortunately, we're unable to approve your registration at this time.
    </p>
    <div style="background-color: #FFEBEE; border-left: 4px solid #F44336; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; color: #C62828; font-size: 14px; font-weight: bold;">
        Reason for rejection:
      </p>
      <p style="margin: 0; color: #C62828; font-size: 14px;">
        ${data.reason}
      </p>
    </div>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      If you believe this is an error or would like to discuss this decision, please contact our verification team. You may reapply once the issues have been addressed.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="background-color: #666666; border-radius: 4px; padding: 12px 24px;">
          <a href="mailto:verification@nrpg.com.au" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
            Contact Verification Team
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail({
    to: data.contractorEmail,
    subject: 'NRPG Registration Update Required',
    html: emailTemplate('Registration Update Required', content),
  });
}

/**
 * 4. Training Milestone Completion
 */
export async function sendTrainingMilestoneEmail(
  data: ContractorEmailData & { moduleName: string; moduleId: string; score: number }
): Promise<boolean> {
  const passed = data.score >= 70;
  const content = `
    <h2 style="margin: 0 0 16px 0; color: ${passed ? '#4CAF50' : '#FF9800'}; font-size: 20px;">
      Training Module ${passed ? 'Completed' : 'Assessment Needs Review'}
    </h2>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Hi <strong>${data.businessName}</strong>,
    </p>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      You've completed the assessment for <strong>${data.moduleName}</strong> (${data.moduleId}).
    </p>
    <div style="background-color: ${passed ? '#E8F5E9' : '#FFF3E0'}; border-left: 4px solid ${passed ? '#4CAF50' : '#FF9800'}; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; color: ${passed ? '#2E7D32' : '#E65100'}; font-size: 18px; font-weight: bold;">
        Your Score: ${data.score}%
      </p>
      <p style="margin: 0; color: ${passed ? '#2E7D32' : '#E65100'}; font-size: 14px;">
        ${passed ? 'Passed! (70% required)' : 'Below passing score of 70%'}
      </p>
    </div>
    ${passed ? `
      <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
        Excellent work! You've successfully completed this module. Continue with your training to earn your NRPG certification.
      </p>
    ` : `
      <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
        Don't worry - you can review the training materials and retake the assessment as many times as needed.
      </p>
    `}
    <table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="background-color: ${passed ? '#4CAF50' : '#FF9800'}; border-radius: 4px; padding: 12px 24px;">
          <a href="${SITE_URL}/dashboard/contractor/onboarding" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
            ${passed ? 'Continue Training' : 'Review & Retry'}
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail({
    to: data.contractorEmail,
    subject: `Training ${passed ? 'Completed' : 'Assessment'}: ${data.moduleName}`,
    html: emailTemplate(`Training Module ${passed ? 'Completed' : 'Update'}`, content),
  });
}

/**
 * 5. IICRC Certificate Expiry Warning
 */
export async function sendIICRCExpiryWarningEmail(
  data: ContractorEmailData & { expiryDate: Date; daysUntilExpiry: number }
): Promise<boolean> {
  const urgent = data.daysUntilExpiry <= 30;
  const content = `
    <h2 style="margin: 0 0 16px 0; color: ${urgent ? '#F44336' : '#FF9800'}; font-size: 20px;">
      IICRC Certificate ${urgent ? 'Expiring Soon' : 'Renewal Reminder'}
    </h2>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Hi <strong>${data.businessName}</strong>,
    </p>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      This is a reminder that your IICRC certification will expire in <strong>${data.daysUntilExpiry} days</strong> on ${data.expiryDate.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}.
    </p>
    <div style="background-color: ${urgent ? '#FFEBEE' : '#FFF3E0'}; border-left: 4px solid ${urgent ? '#F44336' : '#FF9800'}; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; color: ${urgent ? '#C62828' : '#E65100'}; font-size: 14px; font-weight: bold;">
        ${urgent ? '⚠️ Urgent Action Required' : '📅 Action Needed Soon'}
      </p>
      <p style="margin: 0; color: ${urgent ? '#C62828' : '#E65100'}; font-size: 14px;">
        To maintain your NRPG membership, please renew your IICRC certification before it expires.
      </p>
    </div>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Upload your renewed certificate to keep your NRPG status active and continue receiving job opportunities.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="background-color: ${urgent ? '#F44336' : '#FF9800'}; border-radius: 4px; padding: 12px 24px;">
          <a href="${SITE_URL}/dashboard/contractor/profile" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
            Update Certificate
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail({
    to: data.contractorEmail,
    subject: `IICRC Certificate ${urgent ? 'Expiring Soon' : 'Renewal Reminder'} - ${data.daysUntilExpiry} days`,
    html: emailTemplate('IICRC Certificate Expiry', content),
  });
}

/**
 * 6. Insurance Expiry Warning
 */
export async function sendInsuranceExpiryWarningEmail(
  data: ContractorEmailData & { expiryDate: Date; daysUntilExpiry: number; policyNumber: string }
): Promise<boolean> {
  const urgent = data.daysUntilExpiry <= 30;
  const content = `
    <h2 style="margin: 0 0 16px 0; color: ${urgent ? '#F44336' : '#FF9800'}; font-size: 20px;">
      Insurance ${urgent ? 'Expiring Soon' : 'Renewal Reminder'}
    </h2>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Hi <strong>${data.businessName}</strong>,
    </p>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Your public liability insurance (Policy: ${data.policyNumber}) will expire in <strong>${data.daysUntilExpiry} days</strong> on ${data.expiryDate.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}.
    </p>
    <div style="background-color: ${urgent ? '#FFEBEE' : '#FFF3E0'}; border-left: 4px solid ${urgent ? '#F44336' : '#FF9800'}; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; color: ${urgent ? '#C62828' : '#E65100'}; font-size: 14px; font-weight: bold;">
        ${urgent ? '⚠️ Critical: Insurance Expiring' : '📋 Insurance Renewal Due'}
      </p>
      <p style="margin: 0; color: ${urgent ? '#C62828' : '#E65100'}; font-size: 14px;">
        Expired insurance will suspend your ability to accept jobs through NRPG.
      </p>
    </div>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Please renew your insurance and upload your updated Certificate of Currency to maintain active status.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="background-color: ${urgent ? '#F44336' : '#FF9800'}; border-radius: 4px; padding: 12px 24px;">
          <a href="${SITE_URL}/dashboard/contractor/profile" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
            Update Insurance
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail({
    to: data.contractorEmail,
    subject: `Insurance ${urgent ? 'Expiring Soon' : 'Renewal Reminder'} - ${data.daysUntilExpiry} days`,
    html: emailTemplate('Insurance Expiry Warning', content),
  });
}

/**
 * 7. Payouts Ready Notification
 */
export async function sendPayoutsReadyEmail(data: ContractorEmailData): Promise<boolean> {
  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 64px; height: 64px; background-color: #4CAF50; border-radius: 50%; line-height: 64px;">
        <span style="color: white; font-size: 32px;">💳</span>
      </div>
    </div>
    <h2 style="margin: 0 0 16px 0; color: #4CAF50; font-size: 20px; text-align: center;">
      Payouts Configured Successfully
    </h2>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Hi <strong>${data.businessName}</strong>,
    </p>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Great news! Your Stripe Connect account has been fully verified and is ready to receive payments.
    </p>
    <div style="background-color: #E8F5E9; border-left: 4px solid #4CAF50; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; color: #2E7D32; font-size: 14px; font-weight: bold;">
        ✓ Your account is configured for:
      </p>
      <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #2E7D32; font-size: 14px;">
        <li>Receiving payments from completed jobs</li>
        <li>Automatic payouts to your bank account</li>
        <li>Viewing transaction history</li>
      </ul>
    </div>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Payments will be automatically transferred to your linked bank account according to your payout schedule.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="background-color: #00BFA6; border-radius: 4px; padding: 12px 24px;">
          <a href="${SITE_URL}/dashboard/contractor" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
            View Dashboard
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail({
    to: data.contractorEmail,
    subject: 'Stripe Payouts Configured - Ready to Receive Payments',
    html: emailTemplate('Payouts Ready', content),
  });
}

/**
 * 8. Request More Info Notification
 */
export async function sendRequestMoreInfoEmail(
  data: ContractorEmailData & { infoNeeded: string }
): Promise<boolean> {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #2196F3; font-size: 20px;">
      Additional Information Required
    </h2>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Hi <strong>${data.businessName}</strong>,
    </p>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      We're reviewing your NRPG contractor application and need some additional information to proceed.
    </p>
    <div style="background-color: #E3F2FD; border-left: 4px solid #2196F3; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; color: #1976D2; font-size: 14px; font-weight: bold;">
        Information Needed:
      </p>
      <p style="margin: 0; color: #1976D2; font-size: 14px;">
        ${data.infoNeeded}
      </p>
    </div>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Please provide the requested information as soon as possible to continue your verification process.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="background-color: #2196F3; border-radius: 4px; padding: 12px 24px;">
          <a href="${SITE_URL}/dashboard/contractor/onboarding/nrpg-registration" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
            Update Registration
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail({
    to: data.contractorEmail,
    subject: 'NRPG Registration - Additional Information Required',
    html: emailTemplate('Additional Information Required', content),
  });
}
