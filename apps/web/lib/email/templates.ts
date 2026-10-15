import { SITE_URL } from '@/lib/seo/site-url';
/**
 * Email Templates for NRPG Contractor Acquisition
 *
 * Email automation hooks for contractor application workflow
 */

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

/**
 * Contractor Application Received Email
 */
export function contractorApplicationReceived(data: {
  businessName: string;
  contactName: string;
  applicationId: string;
  tier: string;
}): EmailTemplate {
  const { businessName, contactName, applicationId, tier } = data;

  return {
    subject: 'NRPG Application Received - What Happens Next',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00BFA6 0%, #00A693 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #00BFA6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .timeline { background: white; padding: 20px; border-left: 3px solid #00BFA6; margin: 20px 0; }
            .timeline-item { margin-bottom: 15px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Received!</h1>
            </div>
            <div class="content">
              <p>Hi ${contactName},</p>

              <p>Thank you for applying to join NRPG! We've received your application for <strong>${businessName}</strong> and are excited to review it.</p>

              <div style="background: #e8f5f3; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <strong>Application ID:</strong> ${applicationId}<br>
                <strong>Selected Tier:</strong> ${tier.charAt(0).toUpperCase() + tier.slice(1)}<br>
                <strong>Status:</strong> Under Review
              </div>

              <h3>What Happens Next?</h3>
              <div class="timeline">
                <div class="timeline-item">
                  <strong>Step 1: Verification (24-48 hours)</strong><br>
                  We'll verify your ABN, IICRC certifications, and insurance documents.
                </div>
                <div class="timeline-item">
                  <strong>Step 2: Approval Email</strong><br>
                  Once approved, you'll receive an email with your subscription setup link.
                </div>
                <div class="timeline-item">
                  <strong>Step 3: Payment Setup</strong><br>
                  Complete your subscription payment via Stripe (secure & easy).
                </div>
                <div class="timeline-item">
                  <strong>Step 4: Onboarding</strong><br>
                  Access your contractor dashboard and complete platform training.
                </div>
                <div class="timeline-item">
                  <strong>Step 5: Start Receiving Leads!</strong><br>
                  You'll be active in our rotation system within 1 week.
                </div>
              </div>

              <h3>Need Help?</h3>
              <p>If you have any questions, reply to this email or contact us at:</p>
              <ul>
                <li>Email: support@nrpg.com.au</li>
                <li>Phone: 1300 NRPG (1300 677 447)</li>
              </ul>

              <p>We're here to help you succeed!</p>

              <p>Best regards,<br>
              <strong>The NRPG Team</strong></p>
            </div>
            <div class="footer">
              <p>NRPG - Australia's #1 Disaster Recovery Network<br>
              © 2026 NRPG. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    textContent: `
Hi ${contactName},

Thank you for applying to join NRPG! We've received your application for ${businessName} and are excited to review it.

Application ID: ${applicationId}
Selected Tier: ${tier.charAt(0).toUpperCase() + tier.slice(1)}
Status: Under Review

What Happens Next?

Step 1: Verification (24-48 hours)
We'll verify your ABN, IICRC certifications, and insurance documents.

Step 2: Approval Email
Once approved, you'll receive an email with your subscription setup link.

Step 3: Payment Setup
Complete your subscription payment via Stripe (secure & easy).

Step 4: Onboarding
Access your contractor dashboard and complete platform training.

Step 5: Start Receiving Leads!
You'll be active in our rotation system within 1 week.

Need Help?
Email: support@nrpg.com.au
Phone: 1300 NRPG (1300 677 447)

Best regards,
The NRPG Team
    `,
  };
}

/**
 * Admin New Application Notification
 */
export function adminNewApplication(data: {
  businessName: string;
  abn: string;
  contactName: string;
  contactEmail: string;
  tier: string;
  applicationId: string;
}): EmailTemplate {
  const { businessName, abn, contactName, contactEmail, tier, applicationId } = data;

  return {
    subject: `New Contractor Application: ${businessName}`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>New Contractor Application Received</h2>

          <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
            <tr>
              <td style="padding: 8px; background: #f5f5f5; font-weight: bold;">Application ID:</td>
              <td style="padding: 8px;">${applicationId}</td>
            </tr>
            <tr>
              <td style="padding: 8px; background: #f5f5f5; font-weight: bold;">Business Name:</td>
              <td style="padding: 8px;">${businessName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; background: #f5f5f5; font-weight: bold;">ABN:</td>
              <td style="padding: 8px;">${abn}</td>
            </tr>
            <tr>
              <td style="padding: 8px; background: #f5f5f5; font-weight: bold;">Contact Name:</td>
              <td style="padding: 8px;">${contactName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; background: #f5f5f5; font-weight: bold;">Email:</td>
              <td style="padding: 8px;">${contactEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px; background: #f5f5f5; font-weight: bold;">Tier:</td>
              <td style="padding: 8px;">${tier.toUpperCase()}</td>
            </tr>
          </table>

          <p><a href="${SITE_URL}/dashboard/admin/contractors?app=${applicationId}" style="display: inline-block; background: #00BFA6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Review Application</a></p>

          <p><strong>Action Required:</strong> Review and verify contractor details within 24-48 hours.</p>
        </body>
      </html>
    `,
    textContent: `
New Contractor Application Received

Application ID: ${applicationId}
Business Name: ${businessName}
ABN: ${abn}
Contact Name: ${contactName}
Email: ${contactEmail}
Tier: ${tier.toUpperCase()}

Review at: ${SITE_URL}/dashboard/admin/contractors?app=${applicationId}

Action Required: Review and verify contractor details within 24-48 hours.
    `,
  };
}

/**
 * Application Approved Email
 */
export function applicationApproved(data: {
  businessName: string;
  contactName: string;
  tier: string;
  checkoutUrl: string;
}): EmailTemplate {
  const { businessName, contactName, tier, checkoutUrl } = data;

  return {
    subject: 'NRPG Application Approved - Complete Your Subscription',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00BFA6 0%, #00A693 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #00BFA6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .success-box { background: #e8f5f3; padding: 20px; border-left: 4px solid #00BFA6; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p>Your Application Has Been Approved</p>
            </div>
            <div class="content">
              <p>Hi ${contactName},</p>

              <div class="success-box">
                <strong>Great news!</strong> ${businessName} has been approved to join NRPG as a ${tier} tier contractor.
              </div>

              <h3>Next Step: Complete Your Subscription</h3>
              <p>Click the button below to securely set up your monthly subscription via Stripe:</p>

              <p style="text-align: center;">
                <a href="${checkoutUrl}" class="button">Complete Subscription Setup</a>
              </p>

              <p><strong>What's included in your ${tier} tier:</strong></p>
              ${getTierBenefits(tier)}

              <p>Once your subscription is active, you'll gain immediate access to:</p>
              <ul>
                <li>Your contractor dashboard</li>
                <li>Platform training modules</li>
                <li>Mobile app download</li>
                <li>Lead rotation system</li>
              </ul>

              <p>Welcome to the NRPG family! We're excited to help you grow your business.</p>

              <p>Best regards,<br>
              <strong>The NRPG Team</strong></p>
            </div>
          </div>
        </body>
      </html>
    `,
    textContent: `
Hi ${contactName},

Congratulations! ${businessName} has been approved to join NRPG as a ${tier} tier contractor.

Next Step: Complete Your Subscription

Visit this link to securely set up your monthly subscription via Stripe:
${checkoutUrl}

Once your subscription is active, you'll gain immediate access to your contractor dashboard, platform training, mobile app, and the lead rotation system.

Welcome to the NRPG family!

Best regards,
The NRPG Team
    `,
  };
}

function getTierBenefits(tier: string): string {
  const benefits = {
    basic: '<ul><li>Up to 10 leads per month</li><li>Basic profile listing</li><li>Mobile app access</li><li>Email support</li></ul>',
    pro: '<ul><li>Up to 50 leads per month</li><li>Featured profile listing</li><li>Priority support</li><li>Marketing automation</li></ul>',
    enterprise: '<ul><li>Unlimited leads</li><li>Premium placement</li><li>Dedicated account manager</li><li>API access</li></ul>',
  };

  return benefits[tier as keyof typeof benefits] || benefits.basic;
}

/**
 * Send email using the unified Resend service
 */
export async function sendTemplateEmail(params: {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}): Promise<{ success: boolean; error?: string }> {
  // Import dynamically to avoid circular dependency
  const { sendEmail: sendViaResend } = await import('./resend');

  return sendViaResend({
    to: params.to,
    subject: params.subject,
    html: params.htmlContent,
    text: params.textContent,
  });
}

/**
 * @deprecated Use sendTemplateEmail instead
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}) {
  return sendTemplateEmail(params);
}
