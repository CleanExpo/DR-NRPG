/**
 * Billing & Subscription Email Templates
 *
 * Handles payment-related email notifications:
 * - Payment failure notifications with retry schedule
 * - Payment success confirmations
 * - Trial ending reminders
 */

import { SITE_URL } from '@/lib/seo/site-url';
import { sendEmail } from './resend';

const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'Disaster Recovery Australia <noreply@disasterrecovery.com.au>',
  baseUrl: SITE_URL,
  supportEmail: 'support@disasterrecovery.com.au',
};

/**
 * Send payment failure notification email
 * Includes retry schedule, grace period, and payment method update link
 */
export async function sendPaymentFailureEmail(data: {
  email: string;
  businessName: string;
  amountAUD: number;
  attemptCount: number;
  lastFourDigits?: string;
  subscriptionTier: string;
}): Promise<{ success: boolean; error?: string }> {
  const updatePaymentUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/workspace/billing`;

  // Determine retry schedule message based on attempt count
  const retryMessages = {
    1: 'We\'ll automatically retry your payment in 3 days.',
    2: 'We\'ll automatically retry your payment in 4 days (final attempt).',
    3: 'This was our final retry attempt. Your subscription will be suspended in 3 days if payment is not updated.',
  };

  const retryMessage = retryMessages[data.attemptCount as 1 | 2 | 3] || retryMessages[1];
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
    .button:hover { background: #b91c1c; }
    .alert-box { background: #fee2e2; border: 2px solid #dc2626; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .info-box { background: white; padding: 20px; border-left: 4px solid #dc2626; margin: 20px 0; border-radius: 4px; }
    .timeline { background: white; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .timeline-item { margin: 15px 0; padding-left: 20px; border-left: 2px solid #dc2626; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Payment Failed - Action Required</h1>
    </div>
    <div class="content">
      <p>Hi ${data.businessName} Team,</p>

      <p>We weren't able to process your payment for your <strong>${data.subscriptionTier}</strong> subscription.</p>

      ${isLastAttempt ? `
      <div class="alert-box">
        <strong>🚨 Final Notice</strong><br>
        This was our final automatic retry. Your subscription will be <strong>suspended in 3 days</strong> if payment is not updated.
      </div>
      ` : `
      <div class="alert-box">
        <strong>⚠️ Payment Attempt ${data.attemptCount} Failed</strong><br>
        ${retryMessage}
      </div>
      `}

      <div class="info-box">
        <strong>Payment Details:</strong><br>
        <strong>Amount:</strong> $${data.amountAUD.toFixed(2)} AUD<br>
        <strong>Subscription:</strong> ${data.subscriptionTier}<br>
        ${data.lastFourDigits ? `<strong>Card:</strong> •••• ${data.lastFourDigits}<br>` : ''}
        <strong>Attempt:</strong> ${data.attemptCount} of 3
      </div>

      <h3>What This Means:</h3>
      <div class="timeline">
        ${!isLastAttempt ? `
        <div class="timeline-item">
          <strong>Right Now:</strong> Your subscription is still active
        </div>
        <div class="timeline-item">
          <strong>Next ${data.attemptCount === 1 ? '3 Days' : '4 Days'}:</strong> We'll automatically retry your payment
        </div>
        ` : ''}
        <div class="timeline-item">
          <strong>${isLastAttempt ? 'In 3 Days' : 'After Final Retry Failure'}:</strong> Your subscription will be suspended and access will be limited
        </div>
        <div class="timeline-item">
          <strong>After 10 Days:</strong> Your account will be downgraded to the Free tier
        </div>
      </div>

      <h3>Update Your Payment Method:</h3>
      <p>To avoid any interruption to your service, please update your payment method now:</p>

      <p style="text-align: center;">
        <a href="${updatePaymentUrl}" class="button">Update Payment Method</a>
      </p>

      <h3>Why Did This Happen?</h3>
      <ul>
        <li>Insufficient funds in the account</li>
        <li>Expired or cancelled card</li>
        <li>Bank declined the transaction</li>
        <li>Incorrect billing information</li>
      </ul>

      <p><strong>Need Help?</strong> If you believe this is an error or need assistance, please contact our support team:</p>
      <ul>
        <li>Email: <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></li>
        <li>Phone: 1300 DR NRPG (1300 37 677 447)</li>
      </ul>

      <p>We're here to help ensure your subscription continues without interruption.</p>

      <p>Best regards,<br>
      <strong>The Disaster Recovery Team</strong></p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia<br>
      Australia's #1 Disaster Recovery Platform</p>
      <p>This email was sent to ${data.email}</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
⚠️ Payment Failed - Action Required

Hi ${data.businessName} Team,

We weren't able to process your payment for your ${data.subscriptionTier} subscription.

${isLastAttempt ? `
🚨 FINAL NOTICE
This was our final automatic retry. Your subscription will be SUSPENDED IN 3 DAYS if payment is not updated.
` : `
⚠️ Payment Attempt ${data.attemptCount} Failed
${retryMessage}
`}

Payment Details:
- Amount: $${data.amountAUD.toFixed(2)} AUD
- Subscription: ${data.subscriptionTier}
${data.lastFourDigits ? `- Card: •••• ${data.lastFourDigits}` : ''}
- Attempt: ${data.attemptCount} of 3

What This Means:
${!isLastAttempt ? `- Right Now: Your subscription is still active\n- Next ${data.attemptCount === 1 ? '3 Days' : '4 Days'}: We'll automatically retry your payment\n` : ''}- ${isLastAttempt ? 'In 3 Days' : 'After Final Retry Failure'}: Your subscription will be suspended
- After 10 Days: Your account will be downgraded to the Free tier

Update Your Payment Method:
${updatePaymentUrl}

Why Did This Happen?
- Insufficient funds in the account
- Expired or cancelled card
- Bank declined the transaction
- Incorrect billing information

Need Help?
Email: ${EMAIL_CONFIG.supportEmail}
Phone: 1300 DR NRPG (1300 37 677 447)

We're here to help ensure your subscription continues without interruption.

Best regards,
The Disaster Recovery Team

---
Disaster Recovery Australia
Australia's #1 Disaster Recovery Platform
  `;

  return sendEmail({
    to: data.email,
    subject: `⚠️ Payment Failed - Action Required (Attempt ${data.attemptCount}/3)`,
    html,
    text,
  });
}

/**
 * Send payment success confirmation email
 * Includes receipt information and next billing date
 */
export async function sendPaymentSuccessEmail(data: {
  email: string;
  businessName: string;
  amountAUD: number;
  subscriptionTier: string;
  nextBillingDate: Date;
  invoiceUrl?: string;
  lastFourDigits?: string;
}): Promise<{ success: boolean; error?: string }> {
  const dashboardUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/workspace`;
  const billingUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/workspace/billing`;

  const nextBillingFormatted = data.nextBillingDate.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

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
    .button-secondary { background: #6b7280; }
    .success-box { background: #d1fae5; border: 2px solid #059669; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
    .receipt { background: white; padding: 20px; margin: 20px 0; border-radius: 4px; border: 1px solid #e5e7eb; }
    .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
    .receipt-row:last-child { border-bottom: none; font-weight: 600; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Payment Received - Thank You!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.businessName} Team,</p>

      <div class="success-box">
        <h2 style="margin: 0; color: #059669;">✓ Payment Successful</h2>
        <p style="margin: 10px 0 0 0; font-size: 18px;"><strong>$${data.amountAUD.toFixed(2)} AUD</strong></p>
      </div>

      <p>Thank you for your payment! Your <strong>${data.subscriptionTier}</strong> subscription has been renewed and is now active.</p>

      <div class="receipt">
        <h3 style="margin-top: 0; color: #059669;">Receipt</h3>
        <div class="receipt-row">
          <span>Subscription Plan:</span>
          <span>${data.subscriptionTier}</span>
        </div>
        <div class="receipt-row">
          <span>Amount Paid:</span>
          <span>$${data.amountAUD.toFixed(2)} AUD</span>
        </div>
        ${data.lastFourDigits ? `
        <div class="receipt-row">
          <span>Payment Method:</span>
          <span>Card ending in ${data.lastFourDigits}</span>
        </div>
        ` : ''}
        <div class="receipt-row">
          <span>Payment Date:</span>
          <span>${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        <div class="receipt-row">
          <span><strong>Next Billing Date:</strong></span>
          <span><strong>${nextBillingFormatted}</strong></span>
        </div>
      </div>

      ${data.invoiceUrl ? `
      <p style="text-align: center;">
        <a href="${data.invoiceUrl}" class="button button-secondary">Download Invoice (PDF)</a>
      </p>
      ` : ''}

      <h3>What's Included:</h3>
      <ul>
        <li>Unlimited contractor job postings</li>
        <li>Real-time lead notifications</li>
        <li>Quote management system</li>
        <li>Customer review system</li>
        <li>24/7 platform support</li>
      </ul>

      <p style="text-align: center;">
        <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
      </p>

      <p>You can view your billing history and manage your subscription at any time:</p>
      <p style="text-align: center;">
        <a href="${billingUrl}" style="color: #059669; text-decoration: underline;">View Billing History →</a>
      </p>

      <p><strong>Questions about your payment?</strong> Contact us:</p>
      <ul>
        <li>Email: <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></li>
        <li>Phone: 1300 DR NRPG (1300 37 677 447)</li>
      </ul>

      <p>Thank you for being a valued member of the Disaster Recovery Australia network!</p>

      <p>Best regards,<br>
      <strong>The Disaster Recovery Team</strong></p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia<br>
      Australia's #1 Disaster Recovery Platform</p>
      <p>This email was sent to ${data.email}</p>
      <p>This is an automated receipt for your records.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
✅ Payment Received - Thank You!

Hi ${data.businessName} Team,

✓ PAYMENT SUCCESSFUL
Amount: $${data.amountAUD.toFixed(2)} AUD

Thank you for your payment! Your ${data.subscriptionTier} subscription has been renewed and is now active.

RECEIPT
-----------------
Subscription Plan: ${data.subscriptionTier}
Amount Paid: $${data.amountAUD.toFixed(2)} AUD
${data.lastFourDigits ? `Payment Method: Card ending in ${data.lastFourDigits}` : ''}
Payment Date: ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
Next Billing Date: ${nextBillingFormatted}

${data.invoiceUrl ? `Download Invoice: ${data.invoiceUrl}\n` : ''}
What's Included:
- Unlimited contractor job postings
- Real-time lead notifications
- Quote management system
- Customer review system
- 24/7 platform support

Go to Dashboard: ${dashboardUrl}
View Billing History: ${billingUrl}

Questions about your payment?
Email: ${EMAIL_CONFIG.supportEmail}
Phone: 1300 DR NRPG (1300 37 677 447)

Thank you for being a valued member of the Disaster Recovery Australia network!

Best regards,
The Disaster Recovery Team

---
Disaster Recovery Australia
Australia's #1 Disaster Recovery Platform

This is an automated receipt for your records.
  `;

  return sendEmail({
    to: data.email,
    subject: `✅ Payment Received - $${data.amountAUD.toFixed(2)} AUD`,
    html,
    text,
  });
}

/**
 * Send trial ending reminder email
 * Sent 3 days before trial expires to give time to add payment method
 */
export async function sendTrialEndingEmail(data: {
  email: string;
  businessName: string;
  trialEndsAt: Date;
  subscriptionTier: string;
  monthlyPrice: number;
}): Promise<{ success: boolean; error?: string }> {
  const addPaymentUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/workspace/billing`;

  const trialEndsFormatted = data.trialEndsAt.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const daysRemaining = Math.ceil((data.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0; auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .button:hover { background: #d97706; }
    .warning-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
    .pricing-box { background: white; padding: 20px; margin: 20px 0; border-radius: 4px; border: 1px solid #e5e7eb; }
    .benefit-list { background: white; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .benefit-item { margin: 12px 0; display: flex; align-items: flex-start; }
    .benefit-icon { color: #059669; margin-right: 10px; font-weight: bold; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Your Trial is Ending in ${daysRemaining} Days</h1>
    </div>
    <div class="content">
      <p>Hi ${data.businessName} Team,</p>

      <div class="warning-box">
        <h2 style="margin: 0; color: #f59e0b;">⏱️ ${daysRemaining} Days Remaining</h2>
        <p style="margin: 10px 0 0 0;">Your trial ends on <strong>${trialEndsFormatted}</strong></p>
      </div>

      <p>Your free trial of the <strong>${data.subscriptionTier}</strong> plan is ending soon. To continue enjoying uninterrupted access to our platform, please add a payment method.</p>

      <div class="pricing-box">
        <h3 style="margin-top: 0; color: #059669;">Continue with ${data.subscriptionTier}</h3>
        <p style="font-size: 32px; margin: 10px 0; color: #059669;"><strong>$${data.monthlyPrice.toFixed(2)}</strong> <span style="font-size: 18px; color: #666;">AUD/month</span></p>
        <p style="margin: 0; color: #666;">Billed monthly • Cancel anytime</p>
      </div>

      <div class="benefit-list">
        <h3 style="color: #059669;">What You'll Continue to Enjoy:</h3>
        <div class="benefit-item">
          <span class="benefit-icon">✓</span>
          <span><strong>Unlimited job postings</strong> - Receive leads from property owners across Australia</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">✓</span>
          <span><strong>Real-time notifications</strong> - Be the first to respond to new opportunities</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">✓</span>
          <span><strong>Quote management</strong> - Professional quote system with automated follow-ups</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">✓</span>
          <span><strong>Customer reviews</strong> - Build your reputation with verified customer reviews</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">✓</span>
          <span><strong>24/7 support</strong> - Our team is always here to help you succeed</span>
        </div>
      </div>

      <p style="text-align: center;">
        <a href="${addPaymentUrl}" class="button">Add Payment Method</a>
      </p>

      <h3>What Happens If I Don't Add Payment?</h3>
      <p>If no payment method is added before ${trialEndsFormatted}:</p>
      <ul>
        <li>Your account will be automatically downgraded to the <strong>Free</strong> plan</li>
        <li>You'll lose access to premium features</li>
        <li>Your job history and data will be preserved</li>
        <li>You can upgrade again at any time</li>
      </ul>

      <h3>Not Ready to Commit?</h3>
      <p>No worries! You can:</p>
      <ul>
        <li>Downgrade to the Free plan (limited features)</li>
        <li>Contact us about a different plan that fits your needs</li>
        <li>Cancel your trial with no charges</li>
      </ul>

      <p><strong>Have questions?</strong> We're here to help:</p>
      <ul>
        <li>Email: <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></li>
        <li>Phone: 1300 DR NRPG (1300 37 677 447)</li>
      </ul>

      <p>Thank you for trying Disaster Recovery Australia. We hope you'll continue to grow your business with us!</p>

      <p>Best regards,<br>
      <strong>The Disaster Recovery Team</strong></p>
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia<br>
      Australia's #1 Disaster Recovery Platform</p>
      <p>This email was sent to ${data.email}</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
⏰ Your Trial is Ending in ${daysRemaining} Days

Hi ${data.businessName} Team,

⏱️ ${daysRemaining} DAYS REMAINING
Your trial ends on ${trialEndsFormatted}

Your free trial of the ${data.subscriptionTier} plan is ending soon. To continue enjoying uninterrupted access to our platform, please add a payment method.

CONTINUE WITH ${data.subscriptionTier.toUpperCase()}
$${data.monthlyPrice.toFixed(2)} AUD/month
Billed monthly • Cancel anytime

What You'll Continue to Enjoy:
✓ Unlimited job postings - Receive leads from property owners across Australia
✓ Real-time notifications - Be the first to respond to new opportunities
✓ Quote management - Professional quote system with automated follow-ups
✓ Customer reviews - Build your reputation with verified customer reviews
✓ 24/7 support - Our team is always here to help you succeed

Add Payment Method: ${addPaymentUrl}

What Happens If I Don't Add Payment?
If no payment method is added before ${trialEndsFormatted}:
- Your account will be automatically downgraded to the Free plan
- You'll lose access to premium features
- Your job history and data will be preserved
- You can upgrade again at any time

Not Ready to Commit?
- Downgrade to the Free plan (limited features)
- Contact us about a different plan that fits your needs
- Cancel your trial with no charges

Have questions?
Email: ${EMAIL_CONFIG.supportEmail}
Phone: 1300 DR NRPG (1300 37 677 447)

Thank you for trying Disaster Recovery Australia. We hope you'll continue to grow your business with us!

Best regards,
The Disaster Recovery Team

---
Disaster Recovery Australia
Australia's #1 Disaster Recovery Platform
  `;

  return sendEmail({
    to: data.email,
    subject: `⏰ Your Trial Ends in ${daysRemaining} Days - Add Payment to Continue`,
    html,
    text,
  });
}
