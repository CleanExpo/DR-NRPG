/**
 * Client Email Service
 *
 * Email notifications for client onboarding system
 * 7 email templates for complete client journey
 * Extends base email.service.ts with client-specific templates
 */

import { SITE_URL } from '@/lib/seo/site-url';
import { sendEmail } from './email.service';

// ============================================================================
// TYPES
// ============================================================================

export interface ClientEmailData {
  clientName: string;
  clientEmail: string;
  displayName?: string;
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

/**
 * Base email template wrapper (NRPG branded)
 */
function clientEmailTemplate(title: string, content: string): string {
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
                Australia's Trusted Disaster Recovery Network
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
                Only NRPG-Certified Contractors • 24/7 Emergency Response • Insurance Expertise
              </p>
              <p style="margin: 12px 0 0 0; color: #999999; font-size: 11px; text-align: center;">
                This is an automated notification. For support, call 1800 NRPG (1800 6774)
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
// 1. WELCOME EMAIL (Onboarding Started)
// ============================================================================

export async function sendClientWelcomeEmail(data: ClientEmailData): Promise<boolean> {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #333333; font-size: 20px;">
      Welcome to NRPG!
    </h2>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Hi <strong>${data.clientName}</strong>,
    </p>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Welcome to Australia's most trusted disaster recovery network. You've taken an important step toward protecting your property.
    </p>

    <div style="background-color: #E8F5E9; border-left: 4px solid #00BFA6; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 12px 0; color: #2E7D32; font-size: 14px; font-weight: bold;">
        What makes NRPG different:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #2E7D32; font-size: 14px; line-height: 1.8;">
        <li><strong>Only NRPG-Certified Contractors</strong> - Rigorous vetting, mandatory training, insurance verified</li>
        <li><strong>Insurance Claim Expertise</strong> - We work directly with your insurer for faster claims</li>
        <li><strong>30-Minute Emergency Response</strong> - 24/7 availability, rapid dispatch</li>
        <li><strong>Transparent Pricing</strong> - No hidden platform fees, what you see is what you pay</li>
      </ul>
    </div>

    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Complete your profile to get matched with certified contractors in your area.
    </p>

    <table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="background-color: #00BFA6; border-radius: 4px; padding: 12px 24px;">
          <a href="${SITE_URL}/dashboard/client/onboarding/profile" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
            Continue Setup →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 24px 0 0 0; color: #999999; font-size: 14px;">
      Estimated time: 10-15 minutes
    </p>
  `;

  return sendEmail({
    to: data.clientEmail,
    subject: 'Welcome to NRPG - Your Disaster Recovery Partner',
    html: clientEmailTemplate('Welcome to NRPG', content),
  });
}

// ============================================================================
// 2. PHASE COMPLETION EMAIL
// ============================================================================

export async function sendPhaseCompletionEmail(
  data: ClientEmailData & {
    phaseName: string;
    phaseNumber: number;
    completionPercentage: number;
    nextPhaseName?: string;
    nextPhaseUrl?: string;
    estimatedMinutes?: number;
  }
): Promise<boolean> {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #00BFA6; font-size: 20px;">
      Phase ${data.phaseNumber} Complete: ${data.phaseName}
    </h2>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Hi <strong>${data.clientName}</strong>,
    </p>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Great progress! You've completed <strong>${data.phaseName}</strong>.
    </p>

    <div style="background-color: #E3F2FD; border-left: 4px solid #2196F3; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; color: #1976D2; font-size: 14px; font-weight: bold;">
        Your Progress: ${Math.round(data.completionPercentage)}% Complete
      </p>
      <div style="background-color: #BBDEFB; height: 8px; border-radius: 4px; overflow: hidden;">
        <div style="background-color: #2196F3; width: ${data.completionPercentage}%; height: 100%;"></div>
      </div>
      <p style="margin: 8px 0 0 0; color: #1976D2; font-size: 12px;">
        ${Math.round(data.completionPercentage / 14.3)} of 7 phases complete
      </p>
    </div>

    ${data.nextPhaseName ? `
      <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
        <strong>Next up:</strong> ${data.nextPhaseName}
      </p>
      ${data.estimatedMinutes ? `
        <p style="margin: 0 0 16px 0; color: #999999; font-size: 14px;">
          Estimated time: ${data.estimatedMinutes} minutes
        </p>
      ` : ''}

      <table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
        <tr>
          <td style="background-color: #00BFA6; border-radius: 4px; padding: 12px 24px;">
            <a href="${data.nextPhaseUrl}" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
              Continue to ${data.nextPhaseName} →
            </a>
          </td>
        </tr>
      </table>
    ` : `
      <p style="margin: 0 0 16px 0; color: #4CAF50; font-size: 18px; font-weight: bold;">
        🎉 All phases complete!
      </p>
      <table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
        <tr>
          <td style="background-color: #4CAF50; border-radius: 4px; padding: 12px 24px;">
            <a href="${SITE_URL}/dashboard/client/onboarding/complete" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
              View Your Certificate →
            </a>
          </td>
        </tr>
      </table>
    `}
  `;

  return sendEmail({
    to: data.clientEmail,
    subject: `Phase ${data.phaseNumber} Complete - ${data.phaseName}`,
    html: clientEmailTemplate('Phase Complete', content),
  });
}

// ============================================================================
// 3. EDUCATION MODULE COMPLETION EMAIL
// ============================================================================

export async function sendModuleCompletionEmail(
  data: ClientEmailData & {
    moduleName: string;
    moduleId: string;
    quizScore?: number;
    nextModuleLink?: string;
  }
): Promise<boolean> {
  const passed = !data.quizScore || data.quizScore >= 70;
  const content = `
    <h2 style="margin: 0 0 16px 0; color: ${passed ? '#4CAF50' : '#FF9800'}; font-size: 20px;">
      Module Complete: ${data.moduleName}
    </h2>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Hi <strong>${data.clientName}</strong>,
    </p>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      You've completed <strong>${data.moduleName}</strong> (${data.moduleId}).
    </p>

    ${data.quizScore ? `
      <div style="background-color: ${passed ? '#E8F5E9' : '#FFF3E0'}; border-left: 4px solid ${passed ? '#4CAF50' : '#FF9800'}; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; color: ${passed ? '#2E7D32' : '#E65100'}; font-size: 18px; font-weight: bold;">
          Quiz Score: ${data.quizScore}%
        </p>
        <p style="margin: 0; color: ${passed ? '#2E7D32' : '#E65100'}; font-size: 14px;">
          ${passed ? 'Excellent! You passed.' : 'You can review and retry the quiz anytime.'}
        </p>
      </div>
    ` : ''}

    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      This knowledge will help you make better decisions during disaster recovery.
    </p>

    ${data.nextModuleLink ? `
      <table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
        <tr>
          <td style="background-color: #00BFA6; border-radius: 4px; padding: 12px 24px;">
            <a href="${data.nextModuleLink}" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
              Continue to Next Module →
            </a>
          </td>
        </tr>
      </table>
    ` : ''}
  `;

  return sendEmail({
    to: data.clientEmail,
    subject: `Module Complete: ${data.moduleName}`,
    html: clientEmailTemplate('Module Complete', content),
  });
}

// ============================================================================
// 4. ONBOARDING COMPLETE EMAIL (Welcome Package)
// ============================================================================

export async function sendOnboardingCompleteEmail(
  data: ClientEmailData & {
    certificateUrl?: string;
    completionTimeHours: number;
    modulesCompleted: number;
  }
): Promise<boolean> {
  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #00BFA6 0%, #00897B 100%); border-radius: 50%; line-height: 80px;">
        <span style="color: white; font-size: 40px;">🎉</span>
      </div>
    </div>

    <h2 style="margin: 0 0 16px 0; color: #4CAF50; font-size: 24px; text-align: center;">
      Congratulations! You're a Prepared NRPG Client
    </h2>

    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Hi <strong>${data.clientName}</strong>,
    </p>

    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Fantastic! You've completed all 7 phases of NRPG onboarding in ${Math.round(data.completionTimeHours)} hours. You're now prepared to handle any disaster recovery situation.
    </p>

    <div style="background-color: #E8F5E9; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <p style="margin: 0 0 12px 0; color: #2E7D32; font-size: 16px; font-weight: bold;">
        What You've Accomplished:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #2E7D32; font-size: 14px; line-height: 1.8;">
        <li>✓ Profile setup complete</li>
        <li>✓ Service preferences configured</li>
        <li>✓ Property details saved</li>
        <li>✓ Insurance information added</li>
        <li>✓ Payment method secured</li>
        <li>✓ Communication preferences set</li>
        <li>✓ ${data.modulesCompleted} education modules completed</li>
      </ul>
    </div>

    <div style="background-color: #FFF3E0; border-left: 4px solid #FF9800; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; color: #E65100; font-size: 14px; font-weight: bold;">
        🎁 Special Offer - First Request Priority Matching
      </p>
      <p style="margin: 0; color: #E65100; font-size: 14px;">
        Create your first service request this week and get priority access to our top-rated contractors!
      </p>
    </div>

    <div style="background-color: #E3F2FD; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0 0 16px 0; color: #1976D2; font-size: 16px; font-weight: bold;">
        Your Benefits as a Prepared Client:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #1976D2; font-size: 14px; line-height: 1.8;">
        <li>Priority contractor matching</li>
        <li>Insurance claim support and liaison</li>
        <li>24/7 emergency access</li>
        <li>"Prepared Client" badge on your profile</li>
        <li>Access to educational resources anytime</li>
      </ul>
    </div>

    ${data.certificateUrl ? `
      <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
        Your completion certificate is attached. Display it proudly!
      </p>
    ` : ''}

    <div style="text-align: center; margin: 32px 0;">
      <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
        <tr>
          <td style="padding: 0 8px;">
            <div style="background-color: #00BFA6; border-radius: 4px; padding: 12px 24px;">
              <a href="${SITE_URL}/dashboard/client/requests/new" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                Create Service Request
              </a>
            </div>
          </td>
          <td style="padding: 0 8px;">
            <div style="background-color: #2196F3; border-radius: 4px; padding: 12px 24px;">
              <a href="${SITE_URL}/dashboard/client?tour=start" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                Take Dashboard Tour
              </a>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin: 24px 0 0 0; color: #666666; font-size: 14px; text-align: center;">
      Need help getting started?<br>
      Call us at <strong>1800 NRPG (1800 6774)</strong> or email <a href="mailto:support@nrpg.com.au" style="color: #00BFA6;">support@nrpg.com.au</a>
    </p>
  `;

  return sendEmail({
    to: data.clientEmail,
    subject: '🎉 You\'re a Prepared NRPG Client! Here\'s Your Certificate',
    html: clientEmailTemplate('Onboarding Complete', content),
  });
}

// ============================================================================
// 5. ONBOARDING REMINDER (48hr Abandonment)
// ============================================================================

export async function sendOnboardingReminderEmail(
  data: ClientEmailData & {
    currentPhase: string;
    completionPercentage: number;
    resumeUrl: string;
    estimatedMinutes: number;
  }
): Promise<boolean> {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #333333; font-size: 20px;">
      Resume Your NRPG Setup
    </h2>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Hi <strong>${data.clientName}</strong>,
    </p>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      We noticed you started setting up your NRPG account but haven't finished yet. You're <strong>${Math.round(data.completionPercentage)}% complete</strong> - just a few more minutes and you'll be all set!
    </p>

    <div style="background-color: #FFF3E0; border-left: 4px solid #FF9800; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; color: #E65100; font-size: 14px; font-weight: bold;">
        Pick up where you left off:
      </p>
      <p style="margin: 0; color: #E65100; font-size: 14px;">
        ${data.currentPhase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • Estimated time: ${data.estimatedMinutes} minutes
      </p>
    </div>

    <table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="background-color: #00BFA6; border-radius: 4px; padding: 12px 24px;">
          <a href="${data.resumeUrl}" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
            Resume Setup →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 24px 0 0 0; color: #999999; font-size: 14px;">
      This is a one-time reminder. If you prefer to complete your profile later, no worries - we'll be here when you're ready.
    </p>
  `;

  return sendEmail({
    to: data.clientEmail,
    subject: `Resume Your NRPG Setup - You're ${Math.round(data.completionPercentage)}% Complete`,
    html: clientEmailTemplate('Resume Your Setup', content),
  });
}

// ============================================================================
// 6. DATA RETENTION WARNING (Day 60)
// ============================================================================

export async function sendDataRetentionWarningEmail(
  data: ClientEmailData & {
    daysSinceLastActivity: number;
    daysUntilDeletion: number;
    resumeUrl: string;
  }
): Promise<boolean> {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #F44336; font-size: 20px;">
      Your NRPG Data Will Be Deleted in ${data.daysUntilDeletion} Days
    </h2>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Hi <strong>${data.clientName}</strong>,
    </p>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      We noticed you haven't completed your NRPG onboarding (${data.daysSinceLastActivity} days of inactivity). To protect your privacy, we'll delete your incomplete profile in <strong>${data.daysUntilDeletion} days</strong>.
    </p>

    <div style="background-color: #FFEBEE; border-left: 4px solid #F44336; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; color: #C62828; font-size: 14px; font-weight: bold;">
        What This Means:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #C62828; font-size: 14px;">
        <li>Your account data will be permanently deleted</li>
        <li>You'll need to start onboarding from scratch if you return</li>
        <li>This is to comply with privacy regulations (GDPR)</li>
      </ul>
    </div>

    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      <strong>To keep your account:</strong> Simply log in and continue your onboarding, or create a service request.
    </p>

    <table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="background-color: #F44336; border-radius: 4px; padding: 12px 24px;">
          <a href="${data.resumeUrl}" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
            Resume My Account →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 24px 0 0 0; color: #999999; font-size: 14px;">
      If you don't want to use NRPG, no action needed - your data will be automatically deleted for your privacy.
    </p>
  `;

  return sendEmail({
    to: data.clientEmail,
    subject: `Action Required: Your NRPG Data Will Be Deleted in ${data.daysUntilDeletion} Days`,
    html: clientEmailTemplate('Data Retention Notice', content),
  });
}

// ============================================================================
// 7. EDUCATIONAL DRIP CAMPAIGN (Dormant Clients)
// ============================================================================

export async function sendEducationalDripEmail(
  data: ClientEmailData & {
    weekNumber: number;
    topic: string;
    content: string;
    moduleLink: string;
  }
): Promise<boolean> {
  const topics = [
    { title: 'Storm Season Prep Checklist', icon: '🌪️' },
    { title: 'How to Spot Water Damage Early', icon: '💧' },
    { title: 'Fire Safety Tips for Australian Homes', icon: '🔥' },
    { title: 'Mold Prevention in High-Humidity Areas', icon: '🍄' },
    { title: 'Understanding Your Insurance Coverage', icon: '🛡️' },
    { title: 'Emergency Kit Essentials', icon: '🎒' },
    { title: 'Annual Property Maintenance Calendar', icon: '📅' },
  ];

  const topicData = topics[data.weekNumber - 1];

  const content = `
    <h2 style="margin: 0 0 8px 0; color: #333333; font-size: 20px;">
      ${topicData.icon} ${topicData.title}
    </h2>
    <p style="margin: 0 0 8px 0; color: #999999; font-size: 12px;">
      NRPG Education Series - Week ${data.weekNumber} of 7
    </p>

    <p style="margin: 24px 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Hi <strong>${data.clientName}</strong>,
    </p>

    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 24px 0;">
      ${data.content}
    </div>

    <table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="background-color: #00BFA6; border-radius: 4px; padding: 12px 24px;">
          <a href="${data.moduleLink}" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
            Read Full Module →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 24px 0 0 0; color: #999999; font-size: 14px;">
      This is part of a 7-week educational series. Want to opt out? <a href="${SITE_URL}/preferences/emails" style="color: #00BFA6;">Manage email preferences</a>
    </p>
  `;

  return sendEmail({
    to: data.clientEmail,
    subject: `${topicData.icon} ${topicData.title} - NRPG Education Week ${data.weekNumber}`,
    html: clientEmailTemplate(topicData.title, content),
  });
}

// ============================================================================
// 8. INSURANCE EXPIRY WARNING
// ============================================================================

export async function sendInsuranceExpiryWarningEmail(
  data: ClientEmailData & {
    policyNumber: string;
    insuranceProvider: string;
    expiryDate: Date;
    daysUntilExpiry: number;
    updateUrl: string;
  }
): Promise<boolean> {
  const urgent = data.daysUntilExpiry <= 30;

  const content = `
    <h2 style="margin: 0 0 16px 0; color: ${urgent ? '#F44336' : '#FF9800'}; font-size: 20px;">
      ${urgent ? '⚠️ Insurance Expiring Soon' : '📋 Insurance Renewal Reminder'}
    </h2>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Hi <strong>${data.clientName}</strong>,
    </p>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Your ${data.insuranceProvider} insurance policy (${data.policyNumber}) will expire in <strong>${data.daysUntilExpiry} days</strong> on ${data.expiryDate.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}.
    </p>

    <div style="background-color: ${urgent ? '#FFEBEE' : '#FFF3E0'}; border-left: 4px solid ${urgent ? '#F44336' : '#FF9800'}; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; color: ${urgent ? '#C62828' : '#E65100'}; font-size: 14px; font-weight: bold;">
        ${urgent ? '⚠️ Action Required' : '📅 Renewal Due'}
      </p>
      <p style="margin: 0; color: ${urgent ? '#C62828' : '#E65100'}; font-size: 14px;">
        Expired insurance may affect your ability to submit claims through NRPG. Please renew and update your policy details.
      </p>
    </div>

    <table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="background-color: ${urgent ? '#F44336' : '#FF9800'}; border-radius: 4px; padding: 12px 24px;">
          <a href="${data.updateUrl}" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
            Update Insurance Details →
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail({
    to: data.clientEmail,
    subject: `${urgent ? '⚠️ Urgent:' : '📋'} Insurance ${urgent ? 'Expiring Soon' : 'Renewal Reminder'} - ${data.daysUntilExpiry} days`,
    html: clientEmailTemplate('Insurance Expiry', content),
  });
}

// ============================================================================
// 9. PAYMENT METHOD EXPIRY WARNING
// ============================================================================

export async function sendPaymentMethodExpiryEmail(
  data: ClientEmailData & {
    cardBrand: string;
    cardLast4: string;
    expiryMonth: number;
    expiryYear: number;
    daysUntilExpiry: number;
    updateUrl: string;
  }
): Promise<boolean> {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #FF9800; font-size: 20px;">
      💳 Payment Method Expiring Soon
    </h2>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Hi <strong>${data.clientName}</strong>,
    </p>
    <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
      Your ${data.cardBrand} card ending in ${data.cardLast4} will expire in <strong>${data.daysUntilExpiry} days</strong> (${data.expiryMonth}/${data.expiryYear}).
    </p>

    <div style="background-color: #FFF3E0; border-left: 4px solid #FF9800; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; color: #E65100; font-size: 14px; font-weight: bold;">
        Update Required
      </p>
      <p style="margin: 0; color: #E65100; font-size: 14px;">
        To ensure uninterrupted service, please update your payment method before it expires.
      </p>
    </div>

    <table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="background-color: #FF9800; border-radius: 4px; padding: 12px 24px;">
          <a href="${data.updateUrl}" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
            Update Payment Method →
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail({
    to: data.clientEmail,
    subject: `Payment Method Expiring Soon - Update Required`,
    html: clientEmailTemplate('Payment Method Expiry', content),
  });
}
