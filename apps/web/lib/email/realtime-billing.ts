/**
 * Real-Time Add-On Billing Email Templates
 *
 * Email automation for real-time subscription lifecycle:
 * - Trial welcome
 * - Trial ending reminder (7 days)
 * - Trial ended
 * - Payment succeeded
 * - Payment failed
 * - Subscription cancelled
 */

import { SITE_URL } from '@/lib/seo/site-url'
import { sendEmail, EmailTemplate } from './templates'

const BASE_URL = SITE_URL
const SUPPORT_EMAIL = 'support@disasterrecovery.com.au'

type RealtimeTier = 'BASIC' | 'PRO' | 'ENTERPRISE'

const TIER_NAMES: Record<RealtimeTier, string> = {
  BASIC: 'Basic',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
}

const TIER_PRICES: Record<RealtimeTier, number> = {
  BASIC: 49,
  PRO: 99,
  ENTERPRISE: 199,
}

/**
 * Trial Welcome Email
 * Sent when a contractor starts their 90-day trial
 */
export function realtimeTrialWelcome(data: {
  contractorName: string
  businessName: string
  email: string
  tier: RealtimeTier
  trialEndsAt: Date
}): EmailTemplate {
  const { contractorName, businessName, tier, trialEndsAt } = data
  const tierName = TIER_NAMES[tier]
  const price = TIER_PRICES[tier]
  const formattedDate = trialEndsAt.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return {
    subject: `Welcome to Real-Time Job Coordination - Your 90-Day ${tierName} Trial`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; colour: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); colour: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #2563EB; colour: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-item { padding: 8px 0; border-bottom: 1px solid #eee; }
            .feature-item:last-child { border-bottom: none; }
            .trial-badge { display: inline-block; background: #10B981; colour: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
            .footer { text-align: center; padding: 20px; colour: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="trial-badge">90-Day Free Trial</span>
              <h1>Welcome to Real-Time!</h1>
            </div>
            <div class="content">
              <p>Hi ${contractorName},</p>

              <p>Congratulations! Your <strong>${tierName}</strong> real-time job coordination trial has started for <strong>${businessName}</strong>.</p>

              <div style="background: #EFF6FF; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <strong>Trial Details:</strong><br>
                Plan: ${tierName} ($${price}/month after trial)<br>
                Trial ends: ${formattedDate}
              </div>

              <h3>What You Can Do Now:</h3>
              <div class="feature-list">
                ${getTrialFeatures(tier)}
              </div>

              <p style="text-align: center;">
                <a href="${BASE_URL}/dashboard/contractor" class="button">Go to Dashboard</a>
              </p>

              <h3>Getting Started Tips:</h3>
              <ol>
                <li><strong>Enable notifications</strong> - Turn on push notifications to never miss a job</li>
                <li><strong>Set your availability</strong> - Update your status to start receiving real-time jobs</li>
                <li><strong>Test the features</strong> - Try out live updates on your next job</li>
              </ol>

              <p>Your trial will automatically convert to a paid subscription on ${formattedDate}. You can cancel anytime before then.</p>

              <p>Questions? Reply to this email or contact ${SUPPORT_EMAIL}</p>

              <p>Best regards,<br>
              <strong>The Disaster Recovery Team</strong></p>
            </div>
            <div class="footer">
              <p>Disaster Recovery Australia<br>
              © 2026 Disaster Recovery. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    textContent: `
Hi ${contractorName},

Congratulations! Your ${tierName} real-time job coordination trial has started for ${businessName}.

Trial Details:
Plan: ${tierName} ($${price}/month after trial)
Trial ends: ${formattedDate}

Getting Started:
1. Enable notifications - Turn on push notifications to never miss a job
2. Set your availability - Update your status to start receiving real-time jobs
3. Test the features - Try out live updates on your next job

Visit your dashboard: ${BASE_URL}/dashboard/contractor

Your trial will automatically convert to a paid subscription on ${formattedDate}. You can cancel anytime before then.

Questions? Contact ${SUPPORT_EMAIL}

Best regards,
The Disaster Recovery Team
    `,
  }
}

/**
 * Trial Ending Soon Email
 * Sent 7 days before trial ends
 */
export function realtimeTrialEndingSoon(data: {
  contractorName: string
  businessName: string
  email: string
  tier: RealtimeTier
  trialEndsAt: Date
  daysRemaining: number
}): EmailTemplate {
  const { contractorName, tier, trialEndsAt, daysRemaining } = data
  const tierName = TIER_NAMES[tier]
  const price = TIER_PRICES[tier]
  const formattedDate = trialEndsAt.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return {
    subject: `${daysRemaining} days left in your Real-Time trial - Add payment method`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; colour: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); colour: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #2563EB; colour: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .warning-box { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; colour: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${daysRemaining} Days Left</h1>
              <p>Your trial ends soon</p>
            </div>
            <div class="content">
              <p>Hi ${contractorName},</p>

              <div class="warning-box">
                <strong>Your ${tierName} trial ends on ${formattedDate}</strong><br>
                Add a payment method now to ensure uninterrupted service.
              </div>

              <p>We hope you've been enjoying the real-time features! To continue after your trial:</p>

              <p style="text-align: center;">
                <a href="${BASE_URL}/dashboard/contractor/realtime/pricing" class="button">Add Payment Method</a>
              </p>

              <p><strong>After trial, your plan costs:</strong> $${price}/month</p>

              <h3>What happens next?</h3>
              <ul>
                <li>If you add a payment method: Your subscription continues seamlessly</li>
                <li>If you don't: Real-time features will be disabled on ${formattedDate}</li>
              </ul>

              <p>Need help deciding? Reply to this email - we're happy to assist!</p>

              <p>Best regards,<br>
              <strong>The Disaster Recovery Team</strong></p>
            </div>
            <div class="footer">
              <p>Disaster Recovery Australia<br>
              © 2026 Disaster Recovery. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    textContent: `
Hi ${contractorName},

Your ${tierName} trial ends on ${formattedDate} - only ${daysRemaining} days left!

Add a payment method now to ensure uninterrupted service:
${BASE_URL}/dashboard/contractor/realtime/pricing

After trial, your plan costs: $${price}/month

What happens next?
- If you add a payment method: Your subscription continues seamlessly
- If you don't: Real-time features will be disabled on ${formattedDate}

Need help? Reply to this email or contact ${SUPPORT_EMAIL}

Best regards,
The Disaster Recovery Team
    `,
  }
}

/**
 * Payment Succeeded Email
 */
export function realtimePaymentSucceeded(data: {
  contractorName: string
  businessName: string
  email: string
  tier: RealtimeTier
  amount: number
  invoiceUrl?: string
}): EmailTemplate {
  const { contractorName, businessName, tier, amount, invoiceUrl } = data
  const tierName = TIER_NAMES[tier]

  return {
    subject: `Payment received - Real-Time ${tierName} subscription`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; colour: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); colour: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .receipt-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
            .button { display: inline-block; background: #2563EB; colour: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; colour: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Confirmed</h1>
            </div>
            <div class="content">
              <p>Hi ${contractorName},</p>

              <p>Thank you for your payment! Your Real-Time ${tierName} subscription for <strong>${businessName}</strong> is now active.</p>

              <div class="receipt-box">
                <strong>Payment Receipt</strong><br>
                Plan: Real-Time ${tierName}<br>
                Amount: $${(amount / 100).toFixed(2)} AUD<br>
                Status: Paid
              </div>

              ${invoiceUrl ? `<p><a href="${invoiceUrl}">View/Download Invoice</a></p>` : ''}

              <p style="text-align: center;">
                <a href="${BASE_URL}/dashboard/contractor" class="button">Go to Dashboard</a>
              </p>

              <p>If you have any questions about your subscription, reply to this email.</p>

              <p>Best regards,<br>
              <strong>The Disaster Recovery Team</strong></p>
            </div>
            <div class="footer">
              <p>Disaster Recovery Australia<br>
              © 2026 Disaster Recovery. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    textContent: `
Hi ${contractorName},

Thank you for your payment! Your Real-Time ${tierName} subscription for ${businessName} is now active.

Payment Receipt:
Plan: Real-Time ${tierName}
Amount: $${(amount / 100).toFixed(2)} AUD
Status: Paid

${invoiceUrl ? `View invoice: ${invoiceUrl}` : ''}

Dashboard: ${BASE_URL}/dashboard/contractor

Best regards,
The Disaster Recovery Team
    `,
  }
}

/**
 * Payment Failed Email
 */
export function realtimePaymentFailed(data: {
  contractorName: string
  businessName: string
  email: string
  tier: RealtimeTier
  attemptCount: number
}): EmailTemplate {
  const { contractorName, tier, attemptCount } = data
  const tierName = TIER_NAMES[tier]

  return {
    subject: `Action required: Payment failed for Real-Time subscription`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; colour: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); colour: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #2563EB; colour: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .warning-box { background: #FEE2E2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; colour: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Failed</h1>
            </div>
            <div class="content">
              <p>Hi ${contractorName},</p>

              <div class="warning-box">
                <strong>We couldn't process your payment</strong><br>
                This was attempt ${attemptCount}. Please update your payment method to avoid service interruption.
              </div>

              <p>Your Real-Time ${tierName} subscription payment failed. This can happen if:</p>
              <ul>
                <li>Your card has expired</li>
                <li>There are insufficient funds</li>
                <li>Your bank declined the transaction</li>
              </ul>

              <p style="text-align: center;">
                <a href="${BASE_URL}/dashboard/contractor/realtime/pricing" class="button">Update Payment Method</a>
              </p>

              <p><strong>What happens next?</strong></p>
              <p>We'll automatically retry the payment in a few days. If payment continues to fail, your real-time features may be suspended.</p>

              <p>Need help? Contact us at ${SUPPORT_EMAIL}</p>

              <p>Best regards,<br>
              <strong>The Disaster Recovery Team</strong></p>
            </div>
            <div class="footer">
              <p>Disaster Recovery Australia<br>
              © 2026 Disaster Recovery. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    textContent: `
Hi ${contractorName},

We couldn't process your payment for your Real-Time ${tierName} subscription.
This was attempt ${attemptCount}.

Please update your payment method:
${BASE_URL}/dashboard/contractor/realtime/pricing

This can happen if:
- Your card has expired
- There are insufficient funds
- Your bank declined the transaction

We'll automatically retry the payment in a few days. If payment continues to fail, your real-time features may be suspended.

Need help? Contact ${SUPPORT_EMAIL}

Best regards,
The Disaster Recovery Team
    `,
  }
}

/**
 * Subscription Cancelled Email
 */
export function realtimeSubscriptionCancelled(data: {
  contractorName: string
  businessName: string
  email: string
  tier: RealtimeTier
  endDate: Date
}): EmailTemplate {
  const { contractorName, businessName, tier, endDate } = data
  const tierName = TIER_NAMES[tier]
  const formattedDate = endDate.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return {
    subject: `Your Real-Time subscription has been cancelled`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; colour: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%); colour: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #2563EB; colour: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .info-box { background: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; colour: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Subscription Cancelled</h1>
            </div>
            <div class="content">
              <p>Hi ${contractorName},</p>

              <p>Your Real-Time ${tierName} subscription for <strong>${businessName}</strong> has been cancelled.</p>

              <div class="info-box">
                <strong>Access until:</strong> ${formattedDate}<br>
                You'll continue to have access to real-time features until this date.
              </div>

              <p><strong>What you'll lose access to:</strong></p>
              <ul>
                <li>Real-time job notifications</li>
                <li>Live status updates</li>
                <li>In-app messaging</li>
                ${tier !== 'BASIC' ? '<li>Live ETA tracking</li>' : ''}
                ${tier === 'ENTERPRISE' ? '<li>GPS tracking</li><li>Video/voice calls</li>' : ''}
              </ul>

              <p>Changed your mind? You can resubscribe anytime:</p>

              <p style="text-align: center;">
                <a href="${BASE_URL}/dashboard/contractor/realtime/pricing" class="button">Resubscribe</a>
              </p>

              <p>We'd love to hear your feedback! Reply to this email to let us know how we can improve.</p>

              <p>Best regards,<br>
              <strong>The Disaster Recovery Team</strong></p>
            </div>
            <div class="footer">
              <p>Disaster Recovery Australia<br>
              © 2026 Disaster Recovery. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    textContent: `
Hi ${contractorName},

Your Real-Time ${tierName} subscription for ${businessName} has been cancelled.

Access until: ${formattedDate}
You'll continue to have access to real-time features until this date.

Changed your mind? Resubscribe anytime:
${BASE_URL}/dashboard/contractor/realtime/pricing

We'd love to hear your feedback! Reply to this email to let us know how we can improve.

Best regards,
The Disaster Recovery Team
    `,
  }
}

// Helper function to get tier-specific features for emails
function getTrialFeatures(tier: RealtimeTier): string {
  const basicFeatures = `
    <div class="feature-item">Real-time job notifications</div>
    <div class="feature-item">Live status updates</div>
    <div class="feature-item">Client status page</div>
    <div class="feature-item">Push notifications</div>
  `

  const proFeatures = `
    ${basicFeatures}
    <div class="feature-item">Live ETA tracking</div>
    <div class="feature-item">In-app messaging</div>
    <div class="feature-item">Priority notifications</div>
  `

  const enterpriseFeatures = `
    ${proFeatures}
    <div class="feature-item">GPS location tracking</div>
    <div class="feature-item">Video/voice calls</div>
    <div class="feature-item">Team coordination</div>
  `

  switch (tier) {
    case 'ENTERPRISE':
      return enterpriseFeatures
    case 'PRO':
      return proFeatures
    default:
      return basicFeatures
  }
}

/**
 * Send realtime billing email
 */
export async function sendRealtimeBillingEmail(
  type:
    | 'trial_welcome'
    | 'trial_ending'
    | 'payment_succeeded'
    | 'payment_failed'
    | 'subscription_cancelled',
  data: {
    contractorName: string
    businessName: string
    email: string
    tier: RealtimeTier
    trialEndsAt?: Date
    daysRemaining?: number
    amount?: number
    invoiceUrl?: string
    attemptCount?: number
    endDate?: Date
  }
) {
  let template: EmailTemplate

  switch (type) {
    case 'trial_welcome':
      template = realtimeTrialWelcome({
        contractorName: data.contractorName,
        businessName: data.businessName,
        email: data.email,
        tier: data.tier,
        trialEndsAt: data.trialEndsAt!,
      })
      break

    case 'trial_ending':
      template = realtimeTrialEndingSoon({
        contractorName: data.contractorName,
        businessName: data.businessName,
        email: data.email,
        tier: data.tier,
        trialEndsAt: data.trialEndsAt!,
        daysRemaining: data.daysRemaining!,
      })
      break

    case 'payment_succeeded':
      template = realtimePaymentSucceeded({
        contractorName: data.contractorName,
        businessName: data.businessName,
        email: data.email,
        tier: data.tier,
        amount: data.amount!,
        invoiceUrl: data.invoiceUrl,
      })
      break

    case 'payment_failed':
      template = realtimePaymentFailed({
        contractorName: data.contractorName,
        businessName: data.businessName,
        email: data.email,
        tier: data.tier,
        attemptCount: data.attemptCount || 1,
      })
      break

    case 'subscription_cancelled':
      template = realtimeSubscriptionCancelled({
        contractorName: data.contractorName,
        businessName: data.businessName,
        email: data.email,
        tier: data.tier,
        endDate: data.endDate!,
      })
      break

    default:
      throw new Error(`Unknown email type: ${type}`)
  }

  await sendEmail({
    to: data.email,
    subject: template.subject,
    htmlContent: template.htmlContent,
    textContent: template.textContent,
  })
}
