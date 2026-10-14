/**
 * Contractor Verification Email Templates
 *
 * Sends email notifications to contractors when their verification status changes
 */

import { SITE_URL } from '@/lib/seo/site-url';
import { sendEmail } from './resend';

const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'Disaster Recovery Australia <noreply@disasterrecovery.com.au>',
  baseUrl: SITE_URL,
  supportEmail: 'support@disasterrecovery.com.au',
};

/**
 * Send verification submitted confirmation email
 */
export async function sendVerificationSubmittedEmail(
  email: string,
  contractorName: string,
  businessName: string
): Promise<{ success: boolean; error?: string }> {
  const dashboardUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/contractor/verification`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #00BFA6 0%, #00A693 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #00BFA6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #00BFA6; }
    .timeline { background: white; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .timeline-item { margin: 15px 0; padding-left: 20px; border-left: 2px solid #00BFA6; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Verification Submitted</h1>
    </div>
    <div class="content">
      <p>Hi ${contractorName},</p>

      <p>Thank you for submitting your contractor verification for <strong>${businessName}</strong>. Your application is now under review by the NRPG management team.</p>

      <div class="info-box">
        <strong>What Happens Next?</strong><br><br>
        Our verification team typically reviews applications within 2-3 business days. We'll carefully review:
        <ul>
          <li>Your business licenses and certifications</li>
          <li>Insurance documentation</li>
          <li>Service area coverage</li>
          <li>Business profile completeness</li>
        </ul>
      </div>

      <div class="timeline">
        <strong>Verification Process:</strong>

        <div class="timeline-item">
          <strong>1. Document Review</strong><br>
          We verify all licenses, insurance, and certifications
        </div>

        <div class="timeline-item">
          <strong>2. Background Check</strong><br>
          Ensure compliance with NRPG standards
        </div>

        <div class="timeline-item">
          <strong>3. Profile Assessment</strong><br>
          Review your business profile and service capabilities
        </div>

        <div class="timeline-item">
          <strong>4. Decision</strong><br>
          You'll receive email notification of approval or required changes
        </div>
      </div>

      <p style="text-align: center;">
        <a href="${dashboardUrl}" class="button">View Verification Status</a>
      </p>

      <p><strong>💡 Tip:</strong> While you wait, ensure your profile is complete and all documents are up to date. This helps speed up the verification process.</p>

      <p>If you have questions, contact our verification team at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia - NRPG<br>
      National Recovery Professionals Group</p>
      <p>This email was sent to ${email}</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Verification Submitted

Hi ${contractorName},

Thank you for submitting your contractor verification for ${businessName}. Your application is now under review by the NRPG management team.

What Happens Next?

Our verification team typically reviews applications within 2-3 business days. We'll carefully review:
- Your business licenses and certifications
- Insurance documentation
- Service area coverage
- Business profile completeness

Verification Process:
1. Document Review - We verify all licenses, insurance, and certifications
2. Background Check - Ensure compliance with NRPG standards
3. Profile Assessment - Review your business profile and service capabilities
4. Decision - You'll receive email notification of approval or required changes

View your verification status: ${dashboardUrl}

Tip: While you wait, ensure your profile is complete and all documents are up to date. This helps speed up the verification process.

Questions? Contact us at ${EMAIL_CONFIG.supportEmail}

---
Disaster Recovery Australia - NRPG
National Recovery Professionals Group
  `;

  return sendEmail({
    to: email,
    subject: 'Verification Submitted - Under Review',
    html,
    text,
  });
}

/**
 * Send verification approved email
 */
export async function sendVerificationApprovedEmail(
  email: string,
  contractorName: string,
  businessName: string,
  nrpgMemberId?: string
): Promise<{ success: boolean; error?: string }> {
  const dashboardUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/contractor`;
  const directoryUrl = `${EMAIL_CONFIG.baseUrl}/contractors`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .success-box { background: #d1fae5; border: 2px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
    .member-id { background: white; padding: 15px; margin: 15px 0; border-radius: 4px; text-align: center; font-size: 24px; font-weight: bold; color: #10b981; border: 2px dashed #10b981; }
    .benefits { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981; }
    .benefits ul { margin: 10px 0; padding-left: 20px; }
    .benefits li { margin: 8px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Verification Approved!</h1>
    </div>
    <div class="content">
      <p>Hi ${contractorName},</p>

      <div class="success-box">
        <h2 style="margin: 0; color: #059669;">✅ Congratulations!</h2>
        <p style="margin: 10px 0 0 0; font-size: 18px;"><strong>${businessName}</strong> has been successfully verified and approved by NRPG.</p>
      </div>

      ${nrpgMemberId ? `
      <div class="member-id">
        NRPG Member ID: ${nrpgMemberId}
      </div>
      ` : ''}

      <p>You are now an official member of the National Recovery Professionals Group (NRPG) and can start receiving job opportunities from our platform.</p>

      <div class="benefits">
        <strong>Your NRPG Benefits:</strong>
        <ul>
          <li>🔔 Receive instant job notifications in your service areas</li>
          <li>💼 Access to premium disaster recovery projects</li>
          <li>⭐ Verified badge on your contractor profile</li>
          <li>📊 Advanced analytics and performance tracking</li>
          <li>🤝 Priority customer support</li>
          <li>📈 Marketing support and profile visibility</li>
          <li>🛡️ Platform protection and dispute resolution</li>
        </ul>
      </div>

      <p><strong>Next Steps:</strong></p>
      <ol>
        <li>Review and optimize your contractor profile</li>
        <li>Set up job notification preferences</li>
        <li>Browse available opportunities in your area</li>
        <li>Start submitting quotes to potential clients</li>
      </ol>

      <p style="text-align: center;">
        <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
      </p>

      <p><strong>🎯 Pro Tip:</strong> Contractors who respond quickly to job alerts get more work. Enable push notifications and check your dashboard regularly!</p>

      <p>Welcome to the NRPG family! If you have any questions, our team is here to help at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia - NRPG<br>
      National Recovery Professionals Group</p>
      <p>This email was sent to ${email}</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Verification Approved!

Hi ${contractorName},

Congratulations! ${businessName} has been successfully verified and approved by NRPG.

${nrpgMemberId ? `NRPG Member ID: ${nrpgMemberId}\n` : ''}

You are now an official member of the National Recovery Professionals Group (NRPG) and can start receiving job opportunities from our platform.

Your NRPG Benefits:
- Receive instant job notifications in your service areas
- Access to premium disaster recovery projects
- Verified badge on your contractor profile
- Advanced analytics and performance tracking
- Priority customer support
- Marketing support and profile visibility
- Platform protection and dispute resolution

Next Steps:
1. Review and optimize your contractor profile
2. Set up job notification preferences
3. Browse available opportunities in your area
4. Start submitting quotes to potential clients

Go to your dashboard: ${dashboardUrl}

Pro Tip: Contractors who respond quickly to job alerts get more work. Enable push notifications and check your dashboard regularly!

Welcome to the NRPG family! Questions? Contact us at ${EMAIL_CONFIG.supportEmail}

---
Disaster Recovery Australia - NRPG
National Recovery Professionals Group
  `;

  return sendEmail({
    to: email,
    subject: '🎉 Verification Approved - Welcome to NRPG!',
    html,
    text,
  });
}

/**
 * Send verification rejected email
 */
export async function sendVerificationRejectedEmail(
  email: string,
  contractorName: string,
  businessName: string,
  rejectionReason: string
): Promise<{ success: boolean; error?: string }> {
  const dashboardUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/contractor/verification`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #00BFA6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .rejection-box { background: #fee2e2; border: 2px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .reason-box { background: white; padding: 15px; margin: 15px 0; border-radius: 4px; border-left: 4px solid #ef4444; }
    .help-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #00BFA6; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Verification Not Approved</h1>
    </div>
    <div class="content">
      <p>Hi ${contractorName},</p>

      <div class="rejection-box">
        <p style="margin: 0; font-size: 16px;">After reviewing your application for <strong>${businessName}</strong>, we're unable to approve your verification at this time.</p>
      </div>

      <div class="reason-box">
        <strong>Reason for Rejection:</strong><br><br>
        ${rejectionReason}
      </div>

      <p>We understand this may be disappointing, but this decision was made to maintain the high standards of the NRPG network and protect both contractors and clients.</p>

      <div class="help-box">
        <strong>What You Can Do:</strong>
        <ul>
          <li>Review the reason provided above carefully</li>
          <li>Address all concerns and issues mentioned</li>
          <li>Update your documentation if required</li>
          <li>Contact our support team if you need clarification</li>
          <li>Resubmit your application once issues are resolved</li>
        </ul>
      </div>

      <p><strong>Need Help?</strong></p>
      <p>Our team is here to assist you in understanding the requirements and preparing your application for resubmission. We want to see you succeed!</p>

      <p style="text-align: center;">
        <a href="${dashboardUrl}" class="button">Update Application</a>
      </p>

      <p>Contact our verification team at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a> for support.</p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia - NRPG<br>
      National Recovery Professionals Group</p>
      <p>This email was sent to ${email}</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Verification Not Approved

Hi ${contractorName},

After reviewing your application for ${businessName}, we're unable to approve your verification at this time.

Reason for Rejection:
${rejectionReason}

We understand this may be disappointing, but this decision was made to maintain the high standards of the NRPG network and protect both contractors and clients.

What You Can Do:
- Review the reason provided above carefully
- Address all concerns and issues mentioned
- Update your documentation if required
- Contact our support team if you need clarification
- Resubmit your application once issues are resolved

Need Help?
Our team is here to assist you in understanding the requirements and preparing your application for resubmission. We want to see you succeed!

Update your application: ${dashboardUrl}

Contact our verification team at ${EMAIL_CONFIG.supportEmail} for support.

---
Disaster Recovery Australia - NRPG
National Recovery Professionals Group
  `;

  return sendEmail({
    to: email,
    subject: 'Verification Status Update - Action Required',
    html,
    text,
  });
}

/**
 * Send verification changes requested email
 */
export async function sendVerificationChangesRequestedEmail(
  email: string,
  contractorName: string,
  businessName: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  const dashboardUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/contractor/verification`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .warning-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .notes-box { background: white; padding: 15px; margin: 15px 0; border-radius: 4px; border-left: 4px solid #f59e0b; }
    .checklist { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Changes Requested</h1>
    </div>
    <div class="content">
      <p>Hi ${contractorName},</p>

      <div class="warning-box">
        <p style="margin: 0; font-size: 16px;">Your verification application for <strong>${businessName}</strong> has been reviewed, and we need some additional information or corrections before we can approve it.</p>
      </div>

      <div class="notes-box">
        <strong>Requested Changes:</strong><br><br>
        ${notes}
      </div>

      <p>Don't worry - this is a common part of the verification process! Many contractors need to make small adjustments to their applications.</p>

      <div class="checklist">
        <strong>Next Steps:</strong>
        <ol>
          <li>Review the requested changes above</li>
          <li>Update your profile and documentation</li>
          <li>Re-upload any corrected documents</li>
          <li>Resubmit your application for review</li>
        </ol>
      </div>

      <p style="text-align: center;">
        <a href="${dashboardUrl}" class="button">Update Application Now</a>
      </p>

      <p><strong>💡 Tip:</strong> The verification team typically reviews resubmissions within 1-2 business days. The faster you update your application, the sooner you can start receiving jobs!</p>

      <p>Need help with the requested changes? Contact us at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia - NRPG<br>
      National Recovery Professionals Group</p>
      <p>This email was sent to ${email}</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Changes Requested

Hi ${contractorName},

Your verification application for ${businessName} has been reviewed, and we need some additional information or corrections before we can approve it.

Requested Changes:
${notes}

Don't worry - this is a common part of the verification process! Many contractors need to make small adjustments to their applications.

Next Steps:
1. Review the requested changes above
2. Update your profile and documentation
3. Re-upload any corrected documents
4. Resubmit your application for review

Update your application: ${dashboardUrl}

Tip: The verification team typically reviews resubmissions within 1-2 business days. The faster you update your application, the sooner you can start receiving jobs!

Need help? Contact us at ${EMAIL_CONFIG.supportEmail}

---
Disaster Recovery Australia - NRPG
National Recovery Professionals Group
  `;

  return sendEmail({
    to: email,
    subject: '⚠️ Application Update Required - NRPG Verification',
    html,
    text,
  });
}

/**
 * Send verification under review email
 */
export async function sendVerificationUnderReviewEmail(
  email: string,
  contractorName: string,
  businessName: string
): Promise<{ success: boolean; error?: string }> {
  const dashboardUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/contractor/verification`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: #ede9fe; border: 2px solid #8b5cf6; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>👁️ Verification Under Review</h1>
    </div>
    <div class="content">
      <p>Hi ${contractorName},</p>

      <div class="info-box">
        <p style="margin: 0; font-size: 18px; font-weight: 600;">Your application for <strong>${businessName}</strong> is currently under review by our verification team.</p>
      </div>

      <p>A member of the NRPG verification team is actively reviewing your application, documents, and business profile.</p>

      <p><strong>What's Being Reviewed:</strong></p>
      <ul>
        <li>Business licenses and registrations</li>
        <li>Insurance certificates and expiry dates</li>
        <li>Professional certifications (IICRC, trade licenses)</li>
        <li>Service area coverage and capabilities</li>
        <li>Business profile information</li>
      </ul>

      <p>You'll receive a notification once the review is complete. This typically takes 1-2 business days.</p>

      <p>Track your verification progress in your dashboard: <a href="${dashboardUrl}">${dashboardUrl}</a></p>

      <p>Questions? Contact us at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia - NRPG<br>
      National Recovery Professionals Group</p>
      <p>This email was sent to ${email}</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Verification Under Review

Hi ${contractorName},

Your application for ${businessName} is currently under review by our verification team.

A member of the NRPG verification team is actively reviewing your application, documents, and business profile.

What's Being Reviewed:
- Business licenses and registrations
- Insurance certificates and expiry dates
- Professional certifications (IICRC, trade licenses)
- Service area coverage and capabilities
- Business profile information

You'll receive a notification once the review is complete. This typically takes 1-2 business days.

Track your verification progress: ${dashboardUrl}

Questions? Contact us at ${EMAIL_CONFIG.supportEmail}

---
Disaster Recovery Australia - NRPG
National Recovery Professionals Group
  `;

  return sendEmail({
    to: email,
    subject: '👁️ Verification Under Review - NRPG',
    html,
    text,
  });
}
