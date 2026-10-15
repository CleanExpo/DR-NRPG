/**
 * Admin Notification Email Templates
 *
 * Sends email notifications to admin users for important platform events
 */

import { SITE_URL } from '@/lib/seo/site-url';
import { sendEmail } from './resend';

const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'Disaster Recovery Australia <noreply@disasterrecovery.com.au>',
  baseUrl: SITE_URL,
  supportEmail: 'support@disasterrecovery.com.au',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@disasterrecovery.com.au',
};

/**
 * Send new contractor application alert to admin
 */
export async function sendNewContractorApplicationEmail(data: {
  contractorName: string;
  businessName: string;
  email: string;
  phone?: string;
  serviceAreas: string[];
  abnNumber?: string;
  contractorId: string;
}): Promise<{ success: boolean; error?: string }> {
  const reviewUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/admin/contractors/verification/${data.contractorId}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: 600; color: #666; }
    .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #fef3c7; color: #92400e; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 New Contractor Application</h1>
    </div>
    <div class="content">
      <p><span class="priority-badge">ACTION REQUIRED</span></p>

      <p>A new contractor has submitted their application for verification on the NRPG platform.</p>

      <div class="info-box">
        <strong>Application Details:</strong><br><br>
        <div class="info-row">
          <span class="info-label">Contractor Name:</span>
          <span>${data.contractorName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Business Name:</span>
          <span>${data.businessName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span><a href="mailto:${data.email}">${data.email}</a></span>
        </div>
        ${data.phone ? `
        <div class="info-row">
          <span class="info-label">Phone:</span>
          <span>${data.phone}</span>
        </div>
        ` : ''}
        ${data.abnNumber ? `
        <div class="info-row">
          <span class="info-label">ABN:</span>
          <span>${data.abnNumber}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Service Areas:</span>
          <span>${data.serviceAreas.join(', ')}</span>
        </div>
      </div>

      <p><strong>Next Steps:</strong></p>
      <ol>
        <li>Review the contractor's profile and documentation</li>
        <li>Verify business licenses and insurance certificates</li>
        <li>Check IICRC certifications (if applicable)</li>
        <li>Approve, reject, or request additional information</li>
      </ol>

      <p style="text-align: center;">
        <a href="${reviewUrl}" class="button">Review Application</a>
      </p>

      <p><strong>⏱️ SLA:</strong> Please review this application within 2-3 business days to maintain contractor satisfaction.</p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia - Admin Notification<br>
      National Recovery Professionals Group</p>
      <p>This is an automated admin notification</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
New Contractor Application - ACTION REQUIRED

A new contractor has submitted their application for verification on the NRPG platform.

Application Details:
- Contractor Name: ${data.contractorName}
- Business Name: ${data.businessName}
- Email: ${data.email}
${data.phone ? `- Phone: ${data.phone}` : ''}
${data.abnNumber ? `- ABN: ${data.abnNumber}` : ''}
- Service Areas: ${data.serviceAreas.join(', ')}

Next Steps:
1. Review the contractor's profile and documentation
2. Verify business licenses and insurance certificates
3. Check IICRC certifications (if applicable)
4. Approve, reject, or request additional information

Review Application: ${reviewUrl}

SLA: Please review this application within 2-3 business days to maintain contractor satisfaction.

---
Disaster Recovery Australia - Admin Notification
National Recovery Professionals Group
  `;

  return sendEmail({
    to: EMAIL_CONFIG.adminEmail,
    subject: `🔔 New Contractor Application: ${data.businessName}`,
    html,
    text,
  });
}

/**
 * Send payment failure alert to admin (for high-value subscriptions)
 */
export async function sendPaymentFailureAlertEmail(data: {
  tenantName: string;
  businessName: string;
  email: string;
  subscriptionTier: string;
  amountAUD: number;
  attemptCount: number;
  lastFourDigits?: string;
  tenantId: string;
  failureReason?: string;
}): Promise<{ success: boolean; error?: string }> {
  const tenantUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/admin/tenants/${data.tenantId}`;
  const billingUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/admin/billing`;

  const isHighValue = data.amountAUD >= 200; // High-value threshold
  const isLastAttempt = data.attemptCount >= 3;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .alert-box { background: #fee2e2; border: 2px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc2626; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .info-row:last-child { border-bottom: none; }
    .priority-badge { display: inline-block; padding: 6px 14px; border-radius: 12px; font-size: 14px; font-weight: 700; background: #dc2626; color: white; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Payment Failure Alert</h1>
    </div>
    <div class="content">
      <p><span class="priority-badge">${isHighValue ? 'HIGH VALUE' : 'STANDARD'} ${isLastAttempt ? '- FINAL ATTEMPT' : ''}</span></p>

      ${isLastAttempt ? `
      <div class="alert-box">
        <strong>🚨 CRITICAL: Final Payment Attempt Failed</strong><br>
        Tenant will be downgraded to FREE tier in 3 days if payment is not resolved.
      </div>
      ` : `
      <div class="alert-box">
        <strong>⚠️ Payment Attempt ${data.attemptCount} Failed</strong><br>
        ${isHighValue ? 'High-value customer may churn if not addressed.' : 'Customer payment retry in progress.'}
      </div>
      `}

      <div class="info-box">
        <strong>Tenant Information:</strong><br><br>
        <div class="info-row">
          <span><strong>Business Name:</strong></span>
          <span>${data.businessName}</span>
        </div>
        <div class="info-row">
          <span><strong>Contact:</strong></span>
          <span><a href="mailto:${data.email}">${data.email}</a></span>
        </div>
        <div class="info-row">
          <span><strong>Subscription Tier:</strong></span>
          <span>${data.subscriptionTier}</span>
        </div>
        <div class="info-row">
          <span><strong>Failed Amount:</strong></span>
          <span>$${data.amountAUD.toFixed(2)} AUD</span>
        </div>
        ${data.lastFourDigits ? `
        <div class="info-row">
          <span><strong>Card:</strong></span>
          <span>•••• ${data.lastFourDigits}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span><strong>Attempt:</strong></span>
          <span>${data.attemptCount} of 3</span>
        </div>
        ${data.failureReason ? `
        <div class="info-row">
          <span><strong>Failure Reason:</strong></span>
          <span>${data.failureReason}</span>
        </div>
        ` : ''}
      </div>

      <p><strong>Recommended Actions:</strong></p>
      <ul>
        ${isHighValue ? '<li><strong>Contact tenant directly</strong> to resolve payment (high-value customer)</li>' : ''}
        <li>Review payment history and identify patterns</li>
        <li>Check if this is a recurring issue with this tenant</li>
        ${isLastAttempt ? '<li><strong>Urgent:</strong> Reach out before account downgrade</li>' : '<li>Monitor next automatic retry</li>'}
        <li>Verify Stripe webhook logs for detailed error information</li>
      </ul>

      <p style="text-align: center;">
        <a href="${tenantUrl}" class="button">View Tenant Profile</a>
      </p>

      <p><strong>Timeline:</strong></p>
      <ul>
        ${!isLastAttempt ? `<li>Next retry: In ${data.attemptCount === 1 ? '3' : '4'} days</li>` : ''}
        <li>Account suspension: ${isLastAttempt ? 'In 3 days' : 'After final retry failure'}</li>
        <li>Downgrade to FREE: After 10 days total</li>
      </ul>

      <p style="font-size: 12px; color: #666;">💡 <strong>Note:</strong> Customer has been automatically notified via email. This alert is for admin awareness and potential proactive outreach.</p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia - Admin Notification<br>
      Billing Alert System</p>
      <p>This is an automated admin notification</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Payment Failure Alert - ${isHighValue ? 'HIGH VALUE' : 'STANDARD'} ${isLastAttempt ? '- FINAL ATTEMPT' : ''}

${isLastAttempt ? '🚨 CRITICAL: Final Payment Attempt Failed\nTenant will be downgraded to FREE tier in 3 days if payment is not resolved.\n' : `⚠️ Payment Attempt ${data.attemptCount} Failed\n${isHighValue ? 'High-value customer may churn if not addressed.' : 'Customer payment retry in progress.'}\n`}

Tenant Information:
- Business Name: ${data.businessName}
- Contact: ${data.email}
- Subscription Tier: ${data.subscriptionTier}
- Failed Amount: $${data.amountAUD.toFixed(2)} AUD
${data.lastFourDigits ? `- Card: •••• ${data.lastFourDigits}` : ''}
- Attempt: ${data.attemptCount} of 3
${data.failureReason ? `- Failure Reason: ${data.failureReason}` : ''}

Recommended Actions:
${isHighValue ? '- Contact tenant directly to resolve payment (high-value customer)' : ''}
- Review payment history and identify patterns
- Check if this is a recurring issue with this tenant
${isLastAttempt ? '- Urgent: Reach out before account downgrade' : '- Monitor next automatic retry'}
- Verify Stripe webhook logs for detailed error information

View Tenant Profile: ${tenantUrl}

Timeline:
${!isLastAttempt ? `- Next retry: In ${data.attemptCount === 1 ? '3' : '4'} days` : ''}
- Account suspension: ${isLastAttempt ? 'In 3 days' : 'After final retry failure'}
- Downgrade to FREE: After 10 days total

Note: Customer has been automatically notified via email. This alert is for admin awareness and potential proactive outreach.

---
Disaster Recovery Australia - Admin Notification
Billing Alert System
  `;

  return sendEmail({
    to: EMAIL_CONFIG.adminEmail,
    subject: `⚠️ Payment Failure: ${data.businessName} - $${data.amountAUD.toFixed(2)} (Attempt ${data.attemptCount}/3)`,
    html,
    text,
  });
}

/**
 * Send suspicious activity alert to admin
 */
export async function sendSuspiciousActivityAlertEmail(data: {
  activityType: 'MULTIPLE_FAILED_LOGINS' | 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_PAYMENT' | 'DATA_SCRAPING' | 'API_ABUSE';
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  requestCount?: number;
  timeWindow?: string;
  details: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}): Promise<{ success: boolean; error?: string }> {
  const adminUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/admin/security`;

  const severityColors: Record<string, string> = {
    'LOW': '#10b981',
    'MEDIUM': '#f59e0b',
    'HIGH': '#ef4444',
    'CRITICAL': '#7f1d1d',
  };

  const severityColor = severityColors[data.severity];

  const activityTypeLabels: Record<string, string> = {
    'MULTIPLE_FAILED_LOGINS': 'Multiple Failed Login Attempts',
    'RATE_LIMIT_EXCEEDED': 'Rate Limit Exceeded',
    'SUSPICIOUS_PAYMENT': 'Suspicious Payment Activity',
    'DATA_SCRAPING': 'Potential Data Scraping',
    'API_ABUSE': 'API Abuse Detected',
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
    .header { background: ${severityColor}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: ${severityColor}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .alert-box { background: ${data.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7'}; border: 2px solid ${severityColor}; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid ${severityColor}; }
    .severity-badge { display: inline-block; padding: 6px 14px; border-radius: 12px; font-size: 14px; font-weight: 700; background: ${severityColor}; color: white; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 Suspicious Activity Detected</h1>
    </div>
    <div class="content">
      <p><span class="severity-badge">${data.severity} SEVERITY</span></p>

      <div class="alert-box">
        <h3 style="margin-top: 0;">${activityTypeLabels[data.activityType]}</h3>
        <p style="margin-bottom: 0;">${data.details}</p>
      </div>

      <div class="info-box">
        <strong>Activity Details:</strong><br><br>
        ${data.userEmail ? `<strong>User Email:</strong> ${data.userEmail}<br>` : ''}
        ${data.userId ? `<strong>User ID:</strong> ${data.userId}<br>` : ''}
        ${data.ipAddress ? `<strong>IP Address:</strong> ${data.ipAddress}<br>` : ''}
        ${data.requestCount ? `<strong>Request Count:</strong> ${data.requestCount}<br>` : ''}
        ${data.timeWindow ? `<strong>Time Window:</strong> ${data.timeWindow}<br>` : ''}
        <strong>Detected At:</strong> ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}
      </div>

      <p><strong>Recommended Actions:</strong></p>
      <ul>
        ${data.severity === 'CRITICAL' || data.severity === 'HIGH' ? '<li><strong>Immediate:</strong> Review and potentially block IP address</li>' : ''}
        ${data.userEmail ? '<li>Review user account activity history</li>' : ''}
        <li>Check security logs for additional suspicious patterns</li>
        <li>Update rate limiting rules if necessary</li>
        ${data.severity === 'CRITICAL' ? '<li><strong>Consider:</strong> Temporarily suspending affected account</li>' : ''}
        <li>Document the incident for security review</li>
      </ul>

      <p style="text-align: center;">
        <a href="${adminUrl}" class="button">View Security Dashboard</a>
      </p>

      <p style="font-size: 12px; color: #666;">💡 <strong>Note:</strong> Automated security measures may have already been applied. Please review the security dashboard for current status.</p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia - Admin Notification<br>
      Security Alert System</p>
      <p>This is an automated security notification</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Suspicious Activity Detected - ${data.severity} SEVERITY

${activityTypeLabels[data.activityType]}
${data.details}

Activity Details:
${data.userEmail ? `- User Email: ${data.userEmail}` : ''}
${data.userId ? `- User ID: ${data.userId}` : ''}
${data.ipAddress ? `- IP Address: ${data.ipAddress}` : ''}
${data.requestCount ? `- Request Count: ${data.requestCount}` : ''}
${data.timeWindow ? `- Time Window: ${data.timeWindow}` : ''}
- Detected At: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}

Recommended Actions:
${data.severity === 'CRITICAL' || data.severity === 'HIGH' ? '- Immediate: Review and potentially block IP address' : ''}
${data.userEmail ? '- Review user account activity history' : ''}
- Check security logs for additional suspicious patterns
- Update rate limiting rules if necessary
${data.severity === 'CRITICAL' ? '- Consider: Temporarily suspending affected account' : ''}
- Document the incident for security review

View Security Dashboard: ${adminUrl}

Note: Automated security measures may have already been applied. Please review the security dashboard for current status.

---
Disaster Recovery Australia - Admin Notification
Security Alert System
  `;

  return sendEmail({
    to: EMAIL_CONFIG.adminEmail,
    subject: `🚨 ${data.severity} Security Alert: ${activityTypeLabels[data.activityType]}`,
    html,
    text,
  });
}

/**
 * Send system health degradation alert to admin
 */
export async function sendSystemHealthAlertEmail(data: {
  alertType: 'HIGH_ERROR_RATE' | 'SLOW_API_RESPONSE' | 'DATABASE_ISSUES' | 'HIGH_MEMORY_USAGE' | 'WEBHOOK_FAILURES';
  metric: string;
  threshold: string;
  currentValue: string;
  duration?: string;
  affectedServices?: string[];
  severity: 'WARNING' | 'ERROR' | 'CRITICAL';
}): Promise<{ success: boolean; error?: string }> {
  const monitoringUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/admin/monitoring`;
  const sentryUrl = process.env.SENTRY_DSN ? 'https://sentry.io' : null;

  const severityColors: Record<string, string> = {
    'WARNING': '#f59e0b',
    'ERROR': '#ef4444',
    'CRITICAL': '#7f1d1d',
  };

  const severityColor = severityColors[data.severity];

  const alertTypeLabels: Record<string, string> = {
    'HIGH_ERROR_RATE': 'High Error Rate',
    'SLOW_API_RESPONSE': 'Slow API Response Times',
    'DATABASE_ISSUES': 'Database Performance Issues',
    'HIGH_MEMORY_USAGE': 'High Memory Usage',
    'WEBHOOK_FAILURES': 'Webhook Processing Failures',
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
    .header { background: ${severityColor}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: ${severityColor}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 10px 5px; font-weight: 600; }
    .alert-box { background: ${data.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7'}; border: 2px solid ${severityColor}; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .metric-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid ${severityColor}; }
    .metric-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .metric-row:last-child { border-bottom: none; }
    .severity-badge { display: inline-block; padding: 6px 14px; border-radius: 12px; font-size: 14px; font-weight: 700; background: ${severityColor}; color: white; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 System Health Alert</h1>
    </div>
    <div class="content">
      <p><span class="severity-badge">${data.severity}</span></p>

      <div class="alert-box">
        <h3 style="margin-top: 0;">${alertTypeLabels[data.alertType]}</h3>
        <p style="margin-bottom: 0; font-size: 16px;">The platform is experiencing ${alertTypeLabels[data.alertType].toLowerCase()}. Immediate investigation recommended.</p>
      </div>

      <div class="metric-box">
        <strong>Metrics:</strong><br><br>
        <div class="metric-row">
          <span><strong>Metric:</strong></span>
          <span>${data.metric}</span>
        </div>
        <div class="metric-row">
          <span><strong>Threshold:</strong></span>
          <span>${data.threshold}</span>
        </div>
        <div class="metric-row">
          <span><strong>Current Value:</strong></span>
          <span><strong style="color: ${severityColor};">${data.currentValue}</strong></span>
        </div>
        ${data.duration ? `
        <div class="metric-row">
          <span><strong>Duration:</strong></span>
          <span>${data.duration}</span>
        </div>
        ` : ''}
        ${data.affectedServices && data.affectedServices.length > 0 ? `
        <div class="metric-row">
          <span><strong>Affected Services:</strong></span>
          <span>${data.affectedServices.join(', ')}</span>
        </div>
        ` : ''}
        <div class="metric-row">
          <span><strong>Detected At:</strong></span>
          <span>${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}</span>
        </div>
      </div>

      <p><strong>Recommended Actions:</strong></p>
      <ul>
        ${data.severity === 'CRITICAL' ? '<li><strong>Urgent:</strong> Investigate immediately - service degradation in progress</li>' : ''}
        <li>Check Sentry for error details and stack traces</li>
        <li>Review Vercel deployment logs</li>
        <li>Monitor database performance metrics</li>
        ${data.alertType === 'DATABASE_ISSUES' ? '<li>Check Neon database connection pool and slow queries</li>' : ''}
        ${data.alertType === 'WEBHOOK_FAILURES' ? '<li>Review Stripe webhook logs and retry queue</li>' : ''}
        ${data.alertType === 'HIGH_ERROR_RATE' ? '<li>Check for recent deployments or configuration changes</li>' : ''}
        <li>Document findings and resolution steps</li>
      </ul>

      <p style="text-align: center;">
        <a href="${monitoringUrl}" class="button">View Monitoring Dashboard</a>
        ${sentryUrl ? `<a href="${sentryUrl}" class="button">Open Sentry</a>` : ''}
      </p>

      <p style="font-size: 12px; color: #666;">💡 <strong>Note:</strong> This alert was triggered by automated monitoring. Please investigate and resolve the underlying issue to prevent customer impact.</p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia - Admin Notification<br>
      System Monitoring</p>
      <p>This is an automated health alert</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
System Health Alert - ${data.severity}

${alertTypeLabels[data.alertType]}
The platform is experiencing ${alertTypeLabels[data.alertType].toLowerCase()}. Immediate investigation recommended.

Metrics:
- Metric: ${data.metric}
- Threshold: ${data.threshold}
- Current Value: ${data.currentValue}
${data.duration ? `- Duration: ${data.duration}` : ''}
${data.affectedServices && data.affectedServices.length > 0 ? `- Affected Services: ${data.affectedServices.join(', ')}` : ''}
- Detected At: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}

Recommended Actions:
${data.severity === 'CRITICAL' ? '- Urgent: Investigate immediately - service degradation in progress' : ''}
- Check Sentry for error details and stack traces
- Review Vercel deployment logs
- Monitor database performance metrics
${data.alertType === 'DATABASE_ISSUES' ? '- Check Neon database connection pool and slow queries' : ''}
${data.alertType === 'WEBHOOK_FAILURES' ? '- Review Stripe webhook logs and retry queue' : ''}
${data.alertType === 'HIGH_ERROR_RATE' ? '- Check for recent deployments or configuration changes' : ''}
- Document findings and resolution steps

View Monitoring Dashboard: ${monitoringUrl}
${sentryUrl ? `Open Sentry: ${sentryUrl}` : ''}

Note: This alert was triggered by automated monitoring. Please investigate and resolve the underlying issue to prevent customer impact.

---
Disaster Recovery Australia - Admin Notification
System Monitoring
  `;

  return sendEmail({
    to: EMAIL_CONFIG.adminEmail,
    subject: `📊 ${data.severity} System Alert: ${alertTypeLabels[data.alertType]}`,
    html,
    text,
  });
}
