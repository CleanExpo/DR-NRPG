/**
 * Contractor Notification Email Templates
 *
 * Sends email notifications to contractors for:
 * - New claim matches (primary and backup)
 * - Assignment confirmations
 * - Response deadline reminders
 */

import { SITE_URL } from '@/lib/seo/site-url';
import { sendEmail } from './resend';

const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'Disaster Recovery Australia <matches@disasterrecovery.com.au>',
  baseUrl: SITE_URL,
  supportEmail: 'contractor-support@disasterrecovery.com.au',
};

/**
 * Send new claim match notification to contractor (primary match)
 */
export async function sendContractorMatchNotificationEmail(data: {
  contractorName: string;
  contractorEmail: string;
  businessName: string;
  claimId: string;
  clientName: string; // Masked (e.g., "John D.")
  propertySuburb: string;
  propertyPostcode: string;
  disasterType: string;
  urgency: 'emergency' | 'urgent' | 'standard' | 'flexible';
  matchScore: number;
  matchReasons: string[];
  responseDeadline: Date;
  estimatedValue?: string;
  hasInsurance: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const respondUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/contractor/claims/${data.claimId}/respond`;
  const viewUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/contractor/claims/${data.claimId}`;

  const urgencyInfo: Record<string, { label: string; deadline: string; color: string; priority: string }> = {
    'emergency': {
      label: 'Emergency',
      deadline: '15 minutes',
      color: '#dc2626',
      priority: 'Immediate action required'
    },
    'urgent': {
      label: 'Urgent',
      deadline: '30 minutes',
      color: '#f59e0b',
      priority: 'High priority - fast response needed'
    },
    'standard': {
      label: 'Standard',
      deadline: '2 hours',
      color: '#3b82f6',
      priority: 'Normal priority'
    },
    'flexible': {
      label: 'Flexible',
      deadline: '4 hours',
      color: '#10b981',
      priority: 'Standard timeline'
    },
  };

  const urgencyData = urgencyInfo[data.urgency];
  const deadlineStr = data.responseDeadline.toLocaleString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Format match score as percentage
  const scorePercentage = Math.round(data.matchScore);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .cta-button { display: inline-block; background: #059669; color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 700; font-size: 16px; }
    .cta-button:hover { background: #047857; }
    .urgent-banner { background: ${urgencyData.color}; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; font-weight: 700; }
    .match-score { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .match-score-value { font-size: 48px; font-weight: 700; margin: 10px 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .info-item { background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 3px solid #059669; }
    .info-item strong { display: block; color: #059669; margin-bottom: 5px; font-size: 12px; text-transform: uppercase; }
    .match-reasons { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981; }
    .match-reasons ul { margin: 10px 0; padding-left: 20px; }
    .match-reasons li { margin: 8px 0; color: #047857; }
    .timeline { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .timeline-item { margin: 15px 0; padding-left: 20px; border-left: 3px solid #059669; }
    .deadline-warning { background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center; }
    .insurance-badge { display: inline-block; background: #3b82f6; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 New Claim Matched to Your Services</h1>
      <p>You've been identified as an ideal contractor for this job</p>
    </div>
    <div class="content">
      <p>Hi ${data.contractorName},</p>

      <div class="urgent-banner">
        ⚡ ${urgencyData.label.toUpperCase()} PRIORITY - ${urgencyData.priority.toUpperCase()}
      </div>

      <p>Great news! Our AI matching system has identified <strong>${data.businessName}</strong> as a top match for a ${data.disasterType.toLowerCase()} restoration job in ${data.propertySuburb}.</p>

      <div class="match-score">
        <div>Your Match Score</div>
        <div class="match-score-value">${scorePercentage}%</div>
        <div>Highly Recommended Contractor</div>
      </div>

      <div class="match-reasons">
        <strong style="color: #047857; font-size: 16px;">🌟 Why You Were Selected:</strong>
        <ul>
          ${data.matchReasons.map(reason => `<li>${reason}</li>`).join('\n          ')}
        </ul>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <strong>Client</strong>
          ${data.clientName}
        </div>
        <div class="info-item">
          <strong>Location</strong>
          ${data.propertySuburb}, ${data.propertyPostcode}
        </div>
        <div class="info-item">
          <strong>Damage Type</strong>
          ${data.disasterType} ${data.hasInsurance ? '<span class="insurance-badge">INSURANCE</span>' : ''}
        </div>
        <div class="info-item">
          <strong>Urgency</strong>
          <span style="color: ${urgencyData.color}; font-weight: 700;">${urgencyData.label}</span>
        </div>
      </div>

      ${data.estimatedValue ? `
      <div class="info-item" style="margin: 20px 0;">
        <strong>Estimated Value</strong>
        ${data.estimatedValue}
      </div>
      ` : ''}

      <div class="deadline-warning">
        ⏰ <strong>Response Deadline: ${deadlineStr}</strong><br>
        <span style="font-size: 14px;">Respond within ${urgencyData.deadline} to accept this opportunity</span>
      </div>

      <div style="text-align: center;">
        <a href="${respondUrl}" class="cta-button">View Claim & Respond →</a>
      </div>

      <div class="timeline">
        <strong style="color: #059669;">📋 Next Steps:</strong>

        <div class="timeline-item">
          <strong>1. Review Full Details</strong><br>
          <span style="font-size: 14px;">Click the button above to view complete claim information and property details</span>
        </div>

        <div class="timeline-item">
          <strong>2. Respond by ${deadlineStr}</strong><br>
          <span style="font-size: 14px;">Accept, decline, or submit a counter-offer within ${urgencyData.deadline}</span>
        </div>

        <div class="timeline-item">
          <strong>3. Get Assigned</strong><br>
          <span style="font-size: 14px;">If you accept, we'll connect you with the client immediately</span>
        </div>
      </div>

      ${data.hasInsurance ? `
      <div style="background: #eff6ff; padding: 15px; border-radius: 6px; border-left: 3px solid #3b82f6; margin: 20px 0;">
        <strong style="color: #1e40af;">💼 Insurance Claim Requirements:</strong><br>
        <span style="font-size: 14px;">This is an insurance-backed job. Ensure you have:<br>
        • Current $10M+ Public Liability Insurance<br>
        • Completed insurance training module<br>
        • Code of Practice compliance documentation</span>
      </div>
      ` : ''}

      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        <strong>Why act fast?</strong><br>
        ${urgencyData.label} priority claims require rapid response. If you don't respond within ${urgencyData.deadline}, we'll automatically notify backup contractors to ensure the client gets timely service.
      </p>

      <div class="footer">
        <p>Questions? Email us at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></p>
        <p>Disaster Recovery Australia • Connecting property owners with certified restoration contractors</p>
        <p style="margin-top: 15px; font-size: 11px; color: #999;">
          This email was sent to ${data.contractorEmail} because you're registered as a contractor on our platform.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await sendEmail({
      to: data.contractorEmail,
      subject: `🎯 ${urgencyData.label} Priority Job - ${data.disasterType} in ${data.propertySuburb} (${scorePercentage}% match)`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send contractor match notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send backup contractor notification (when primary doesn't respond)
 */
export async function sendBackupContractorNotificationEmail(data: {
  contractorName: string;
  contractorEmail: string;
  businessName: string;
  claimId: string;
  clientName: string;
  propertySuburb: string;
  propertyPostcode: string;
  disasterType: string;
  urgency: 'emergency' | 'urgent' | 'standard' | 'flexible';
  matchScore: number;
  responseDeadline: Date;
}): Promise<{ success: boolean; error?: string }> {
  const respondUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/contractor/claims/${data.claimId}/respond`;

  const urgencyInfo: Record<string, { color: string }> = {
    'emergency': { color: '#dc2626' },
    'urgent': { color: '#f59e0b' },
    'standard': { color: '#3b82f6' },
    'flexible': { color: '#10b981' },
  };

  const urgencyData = urgencyInfo[data.urgency];
  const deadlineStr = data.responseDeadline.toLocaleString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const scorePercentage = Math.round(data.matchScore);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .cta-button { display: inline-block; background: #f59e0b; color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 700; font-size: 16px; }
    .backup-banner { background: #fef3c7; border: 2px solid #f59e0b; color: #92400e; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ Urgent: Backup Contractor Opportunity</h1>
    </div>
    <div class="content">
      <p>Hi ${data.contractorName},</p>

      <div class="backup-banner">
        ⏰ BACKUP OPPORTUNITY - PRIMARY CONTRACTOR DIDN'T RESPOND<br>
        <span style="font-size: 14px; font-weight: normal;">This client needs immediate assistance</span>
      </div>

      <p>The primary contractor for this ${data.disasterType.toLowerCase()} job in ${data.propertySuburb} hasn't responded. You're our next best match (${scorePercentage}% score) and can claim this job immediately.</p>

      <p><strong>Location:</strong> ${data.propertySuburb}, ${data.propertyPostcode}<br>
      <strong>Urgency:</strong> <span style="color: ${urgencyData.color};">${data.urgency.toUpperCase()}</span><br>
      <strong>Deadline:</strong> Respond by ${deadlineStr}</p>

      <div style="text-align: center;">
        <a href="${respondUrl}" class="cta-button">Claim This Job →</a>
      </div>

      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        ⚡ <strong>Act fast!</strong> Multiple backup contractors are being notified. First to respond wins the job.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await sendEmail({
      to: data.contractorEmail,
      subject: `⚡ BACKUP Opportunity - ${data.disasterType} in ${data.propertySuburb} (${scorePercentage}% match)`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send backup contractor notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send assignment confirmation to contractor
 */
export async function sendContractorAssignmentConfirmationEmail(data: {
  contractorName: string;
  contractorEmail: string;
  businessName: string;
  claimId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  propertyAddress: string;
  disasterType: string;
  damageDescription: string;
  urgency: string;
  hasInsurance: boolean;
  insuranceProvider?: string;
  policyNumber?: string;
}): Promise<{ success: boolean; error?: string }> {
  const claimUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/contractor/claims/${data.claimId}`;

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
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .success-banner { background: #d1fae5; border: 2px solid #10b981; color: #065f46; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
    .client-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #059669; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Job Assigned to ${data.businessName}</h1>
    </div>
    <div class="content">
      <p>Hi ${data.contractorName},</p>

      <div class="success-banner">
        <strong style="font-size: 18px;">🎉 Congratulations! You've Been Selected</strong><br>
        <span style="font-size: 14px;">The client has chosen you for this ${data.disasterType.toLowerCase()} restoration job</span>
      </div>

      <div class="client-info">
        <strong style="color: #059669; font-size: 16px;">👤 Client Contact Information:</strong><br><br>
        <strong>Name:</strong> ${data.clientName}<br>
        <strong>Email:</strong> <a href="mailto:${data.clientEmail}">${data.clientEmail}</a><br>
        <strong>Phone:</strong> <a href="tel:${data.clientPhone}">${data.clientPhone}</a><br>
        <strong>Property:</strong> ${data.propertyAddress}<br><br>
        <strong>Damage Type:</strong> ${data.disasterType}<br>
        <strong>Description:</strong> ${data.damageDescription}
        ${data.hasInsurance ? `<br><br><strong style="color: #3b82f6;">💼 Insurance Claim:</strong><br>Provider: ${data.insuranceProvider || 'Not specified'}<br>Policy: ${data.policyNumber || 'Not provided'}` : ''}
      </div>

      <p><strong>Next Steps:</strong></p>
      <ol>
        <li>Contact ${data.clientName} immediately via phone or email</li>
        <li>Schedule an on-site inspection within 24 hours</li>
        <li>Provide a detailed quote through the platform</li>
        <li>Update job progress regularly in your dashboard</li>
      </ol>

      <p style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 3px solid #f59e0b;">
        ⚠️ <strong>Important:</strong> Please contact the client as soon as possible. ${data.urgency === 'EMERGENCY' ? 'This is an EMERGENCY job requiring immediate attention.' : 'Timely communication builds trust and improves your contractor rating.'}
      </p>

      <div style="text-align: center;">
        <a href="${claimUrl}" style="display: inline-block; background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 700;">View Full Job Details →</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await sendEmail({
      to: data.contractorEmail,
      subject: `✅ Job Assigned - ${data.disasterType} at ${data.propertyAddress}`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send contractor assignment confirmation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
