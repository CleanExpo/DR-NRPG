/**
 * Client Notification Email Templates
 *
 * Sends email notifications to clients (property owners) for various events
 */

import { SITE_URL } from '@/lib/seo/site-url';
import { sendEmail } from './resend';

const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'Disaster Recovery Australia <noreply@disasterrecovery.com.au>',
  baseUrl: SITE_URL,
  supportEmail: 'support@disasterrecovery.com.au',
};

/**
 * Send claim submission confirmation email
 */
export async function sendClaimSubmissionConfirmationEmail(data: {
  clientName: string;
  email: string;
  claimId: string;
  damageType: string;
  propertyAddress: string;
  urgency: string;
  estimatedValue?: string;
}): Promise<{ success: boolean; error?: string }> {
  const trackingUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/client/claims/${data.claimId}`;

  const urgencyInfo: Record<string, { label: string; responseTime: string; color: string }> = {
    'EMERGENCY': { label: 'Emergency', responseTime: 'within 2 hours', color: '#dc2626' },
    'URGENT': { label: 'Urgent', responseTime: 'within 4 hours', color: '#f59e0b' },
    'HIGH': { label: 'High Priority', responseTime: 'within 24 hours', color: '#3b82f6' },
    'NORMAL': { label: 'Normal', responseTime: 'within 48 hours', color: '#10b981' },
  };

  const urgencyData = urgencyInfo[data.urgency] || urgencyInfo['NORMAL'];

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
    .success-box { background: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #059669; }
    .timeline { background: white; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .timeline-item { margin: 15px 0; padding-left: 20px; border-left: 2px solid #059669; }
    .urgency-badge { display: inline-block; padding: 6px 14px; border-radius: 12px; font-size: 14px; font-weight: 700; background: ${urgencyData.color}; color: white; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Claim Submitted Successfully</h1>
    </div>
    <div class="content">
      <p>Hi ${data.clientName},</p>

      <div class="success-box">
        <h2 style="margin: 0; color: #059669;">✓ We've Received Your Claim</h2>
        <p style="margin: 10px 0 0 0; font-size: 18px;"><strong>Reference: ${data.claimId}</strong></p>
      </div>

      <p>Thank you for submitting your disaster recovery claim. Our AI-powered matching system is now identifying the best certified contractors for your ${data.damageType.toLowerCase()} damage restoration.</p>

      <div class="info-box">
        <strong>Claim Summary:</strong><br><br>
        <strong>Reference Number:</strong> ${data.claimId}<br>
        <strong>Damage Type:</strong> ${data.damageType}<br>
        <strong>Property:</strong> ${data.propertyAddress}<br>
        <strong>Priority Level:</strong> <span class="urgency-badge">${urgencyData.label}</span><br>
        ${data.estimatedValue ? `<strong>Estimated Value:</strong> ${data.estimatedValue}<br>` : ''}
        <strong>Expected Response:</strong> ${urgencyData.responseTime}
      </div>

      <div class="timeline">
        <strong>What Happens Next:</strong>

        <div class="timeline-item">
          <strong>1. AI Matching (Now)</strong><br>
          Our system analyzes your claim and identifies qualified contractors in your area
        </div>

        <div class="timeline-item">
          <strong>2. Contractor Notification (Within ${urgencyData.responseTime})</strong><br>
          Certified contractors receive your claim and prepare quotes
        </div>

        <div class="timeline-item">
          <strong>3. Quotes Received</strong><br>
          You'll receive email notifications as contractors submit competitive quotes
        </div>

        <div class="timeline-item">
          <strong>4. Compare & Select</strong><br>
          Review contractor profiles, ratings, and quotes to choose the best fit
        </div>

        <div class="timeline-item">
          <strong>5. Work Begins</strong><br>
          Schedule the work and track progress through your dashboard
        </div>
      </div>

      <p style="text-align: center;">
        <a href="${trackingUrl}" class="button">Track Your Claim</a>
      </p>

      <p><strong>Need Immediate Assistance?</strong></p>
      <p>If you need urgent help or have questions about your claim:</p>
      <ul>
        <li>Email: <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></li>
        <li>Phone: 1300 DR NRPG (1300 37 677 447)</li>
      </ul>

      <p>We're committed to helping you recover quickly and efficiently.</p>
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
Claim Submitted Successfully

Hi ${data.clientName},

✓ We've Received Your Claim
Reference: ${data.claimId}

Thank you for submitting your disaster recovery claim. Our AI-powered matching system is now identifying the best certified contractors for your ${data.damageType.toLowerCase()} damage restoration.

Claim Summary:
- Reference Number: ${data.claimId}
- Damage Type: ${data.damageType}
- Property: ${data.propertyAddress}
- Priority Level: ${urgencyData.label}
${data.estimatedValue ? `- Estimated Value: ${data.estimatedValue}` : ''}
- Expected Response: ${urgencyData.responseTime}

What Happens Next:

1. AI Matching (Now)
   Our system analyzes your claim and identifies qualified contractors in your area

2. Contractor Notification (Within ${urgencyData.responseTime})
   Certified contractors receive your claim and prepare quotes

3. Quotes Received
   You'll receive email notifications as contractors submit competitive quotes

4. Compare & Select
   Review contractor profiles, ratings, and quotes to choose the best fit

5. Work Begins
   Schedule the work and track progress through your dashboard

Track Your Claim: ${trackingUrl}

Need Immediate Assistance?
- Email: ${EMAIL_CONFIG.supportEmail}
- Phone: 1300 DR NRPG (1300 37 677 447)

We're committed to helping you recover quickly and efficiently.

---
Disaster Recovery Australia
Australia's #1 Disaster Recovery Platform
  `;

  return sendEmail({
    to: data.email,
    subject: `✅ Claim Received - Reference #${data.claimId}`,
    html,
    text,
  });
}

/**
 * Send contractor match notification email
 */
export async function sendContractorMatchNotificationEmail(data: {
  clientName: string;
  email: string;
  claimId: string;
  contractorCount: number;
  topContractors: Array<{
    name: string;
    rating: number;
    reviewCount: number;
    yearsInBusiness: number;
  }>;
}): Promise<{ success: boolean; error?: string }> {
  const viewContractorsUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/client/claims/${data.claimId}/contractors`;

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
    .match-box { background: #dbeafe; border: 2px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .contractor-card { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
    .star-rating { color: #fbbf24; font-size: 18px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Contractors Matched!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.clientName},</p>

      <div class="match-box">
        <h2 style="margin: 0; color: #2563eb;">✓ ${data.contractorCount} Qualified Contractors Found</h2>
        <p style="margin: 10px 0 0 0;">We've identified certified professionals ready to help with your claim.</p>
      </div>

      <p>Great news! Our AI matching system has identified <strong>${data.contractorCount} qualified contractors</strong> in your area who can handle your disaster recovery needs.</p>

      <p><strong>Top Matched Contractors:</strong></p>

      ${data.topContractors.map((contractor, index) => `
        <div class="contractor-card">
          <strong>${index + 1}. ${contractor.name}</strong><br>
          <span class="star-rating">${'★'.repeat(Math.floor(contractor.rating))}${'☆'.repeat(5 - Math.floor(contractor.rating))}</span> ${contractor.rating.toFixed(1)} (${contractor.reviewCount} reviews)<br>
          <span style="color: #666; font-size: 14px;">${contractor.yearsInBusiness}+ years in business • IICRC Certified</span>
        </div>
      `).join('')}

      <p><strong>What Happens Next:</strong></p>
      <ol>
        <li>Contractors have been notified of your claim</li>
        <li>They'll review your requirements and prepare competitive quotes</li>
        <li>You'll receive email notifications as quotes arrive</li>
        <li>Compare quotes, ratings, and profiles in your dashboard</li>
        <li>Select your preferred contractor and schedule the work</li>
      </ol>

      <p style="text-align: center;">
        <a href="${viewContractorsUrl}" class="button">View All Contractors</a>
      </p>

      <p><strong>💡 Pro Tips:</strong></p>
      <ul>
        <li>Review contractor profiles, certifications, and customer reviews</li>
        <li>Compare multiple quotes to ensure competitive pricing</li>
        <li>Check availability and estimated start dates</li>
        <li>Ask questions through the platform messaging system</li>
      </ul>

      <p>Need help? Contact us at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a> or 1300 DR NRPG (1300 37 677 447)</p>
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
Contractors Matched!

Hi ${data.clientName},

✓ ${data.contractorCount} Qualified Contractors Found
We've identified certified professionals ready to help with your claim.

Great news! Our AI matching system has identified ${data.contractorCount} qualified contractors in your area who can handle your disaster recovery needs.

Top Matched Contractors:

${data.topContractors.map((contractor, index) => `
${index + 1}. ${contractor.name}
   ${contractor.rating.toFixed(1)}/5.0 (${contractor.reviewCount} reviews)
   ${contractor.yearsInBusiness}+ years in business • IICRC Certified
`).join('\n')}

What Happens Next:
1. Contractors have been notified of your claim
2. They'll review your requirements and prepare competitive quotes
3. You'll receive email notifications as quotes arrive
4. Compare quotes, ratings, and profiles in your dashboard
5. Select your preferred contractor and schedule the work

View All Contractors: ${viewContractorsUrl}

Pro Tips:
- Review contractor profiles, certifications, and customer reviews
- Compare multiple quotes to ensure competitive pricing
- Check availability and estimated start dates
- Ask questions through the platform messaging system

Need help? Contact us at ${EMAIL_CONFIG.supportEmail} or 1300 DR NRPG (1300 37 677 447)

---
Disaster Recovery Australia
Australia's #1 Disaster Recovery Platform
  `;

  return sendEmail({
    to: data.email,
    subject: `🎯 ${data.contractorCount} Contractors Matched for Your Claim`,
    html,
    text,
  });
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(data: {
  clientName: string;
  email: string;
  bookingId: string;
  contractorName: string;
  contractorPhone?: string;
  serviceType: string;
  scheduledDate: Date;
  propertyAddress: string;
  totalAmount?: number;
}): Promise<{ success: boolean; error?: string }> {
  const bookingUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/client/bookings/${data.bookingId}`;

  const formattedDate = data.scheduledDate.toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = data.scheduledDate.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
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
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .success-box { background: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
    .detail-row:last-child { border-bottom: none; font-weight: 600; }
    .calendar-icon { font-size: 48px; color: #10b981; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Booking Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.clientName},</p>

      <div class="success-box">
        <div class="calendar-icon">📅</div>
        <h2 style="margin: 10px 0 0 0; color: #059669;">Your Booking is Confirmed</h2>
        <p style="margin: 10px 0 0 0; font-size: 18px;"><strong>${formattedDate} at ${formattedTime}</strong></p>
      </div>

      <p>Great news! Your disaster recovery service has been scheduled with <strong>${data.contractorName}</strong>.</p>

      <div class="booking-details">
        <strong>Booking Details:</strong><br><br>
        <div class="detail-row">
          <span>Booking Reference:</span>
          <span><strong>${data.bookingId}</strong></span>
        </div>
        <div class="detail-row">
          <span>Service Type:</span>
          <span>${data.serviceType}</span>
        </div>
        <div class="detail-row">
          <span>Contractor:</span>
          <span>${data.contractorName}</span>
        </div>
        ${data.contractorPhone ? `
        <div class="detail-row">
          <span>Contractor Phone:</span>
          <span><a href="tel:${data.contractorPhone}">${data.contractorPhone}</a></span>
        </div>
        ` : ''}
        <div class="detail-row">
          <span>Date & Time:</span>
          <span>${formattedDate} at ${formattedTime}</span>
        </div>
        <div class="detail-row">
          <span>Property:</span>
          <span>${data.propertyAddress}</span>
        </div>
        ${data.totalAmount ? `
        <div class="detail-row">
          <span>Total Amount:</span>
          <span><strong>$${data.totalAmount.toFixed(2)} AUD</strong></span>
        </div>
        ` : ''}
      </div>

      <p><strong>Before the Appointment:</strong></p>
      <ul>
        <li>Ensure safe access to the affected areas</li>
        <li>Remove valuable items if possible</li>
        <li>Have your insurance claim number ready (if applicable)</li>
        <li>Prepare any questions for the contractor</li>
        <li>Be available at the scheduled time</li>
      </ul>

      <p style="text-align: center;">
        <a href="${bookingUrl}" class="button">View Booking Details</a>
      </p>

      <p><strong>Need to Reschedule?</strong></p>
      <p>If you need to change your appointment, please contact ${data.contractorName}${data.contractorPhone ? ` at ${data.contractorPhone}` : ''} or manage your booking through your dashboard.</p>

      <p><strong>Questions?</strong> Contact us at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></p>
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
Booking Confirmed!

Hi ${data.clientName},

Your Booking is Confirmed
${formattedDate} at ${formattedTime}

Great news! Your disaster recovery service has been scheduled with ${data.contractorName}.

Booking Details:
- Booking Reference: ${data.bookingId}
- Service Type: ${data.serviceType}
- Contractor: ${data.contractorName}
${data.contractorPhone ? `- Contractor Phone: ${data.contractorPhone}` : ''}
- Date & Time: ${formattedDate} at ${formattedTime}
- Property: ${data.propertyAddress}
${data.totalAmount ? `- Total Amount: $${data.totalAmount.toFixed(2)} AUD` : ''}

Before the Appointment:
- Ensure safe access to the affected areas
- Remove valuable items if possible
- Have your insurance claim number ready (if applicable)
- Prepare any questions for the contractor
- Be available at the scheduled time

View Booking Details: ${bookingUrl}

Need to Reschedule?
If you need to change your appointment, please contact ${data.contractorName}${data.contractorPhone ? ` at ${data.contractorPhone}` : ''} or manage your booking through your dashboard.

Questions? Contact us at ${EMAIL_CONFIG.supportEmail}

---
Disaster Recovery Australia
Australia's #1 Disaster Recovery Platform
  `;

  return sendEmail({
    to: data.email,
    subject: `📅 Booking Confirmed: ${formattedDate} - ${data.contractorName}`,
    html,
    text,
  });
}

/**
 * Send booking completed email to client
 */
export async function sendBookingCompletedEmail(data: {
  clientName: string;
  email: string;
  contractorName: string;
  bookingId: string;
  serviceType: string;
  completedDate: Date;
  propertyAddress?: string;
  finalAmount?: number;
}): Promise<{ success: boolean; error?: string }> {
  const bookingUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/client/bookings/${data.bookingId}`;
  const reviewUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/client/bookings/${data.bookingId}/review`;

  const formattedDate = data.completedDate.toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 10px 5px; font-weight: 600; }
    .button-secondary { display: inline-block; background: #8b5cf6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 10px 5px; font-weight: 600; }
    .success-box { background: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .completion-icon { font-size: 48px; margin-bottom: 10px; }
    .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
    .detail-row:last-child { border-bottom: none; font-weight: 600; }
    .review-prompt { background: #faf5ff; border: 2px solid #8b5cf6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .star-rating { color: #fbbf24; font-size: 28px; margin: 10px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Service Completed!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.clientName},</p>

      <div class="success-box">
        <div class="completion-icon">🎉</div>
        <h2 style="margin: 0; color: #059669;">Your Service Has Been Completed</h2>
        <p style="margin: 10px 0 0 0;">Completed on ${formattedDate}</p>
      </div>

      <p>Great news! <strong>${data.contractorName}</strong> has successfully completed the ${data.serviceType.toLowerCase()} service for your property.</p>

      <div class="booking-details">
        <strong>Completion Summary:</strong><br><br>
        <div class="detail-row">
          <span>Booking Reference:</span>
          <span><strong>${data.bookingId}</strong></span>
        </div>
        <div class="detail-row">
          <span>Service Type:</span>
          <span>${data.serviceType}</span>
        </div>
        <div class="detail-row">
          <span>Contractor:</span>
          <span>${data.contractorName}</span>
        </div>
        <div class="detail-row">
          <span>Completed:</span>
          <span>${formattedDate}</span>
        </div>
        ${data.propertyAddress ? `
        <div class="detail-row">
          <span>Property:</span>
          <span>${data.propertyAddress}</span>
        </div>
        ` : ''}
        ${data.finalAmount ? `
        <div class="detail-row">
          <span>Final Amount:</span>
          <span><strong>$${data.finalAmount.toFixed(2)} AUD</strong></span>
        </div>
        ` : ''}
      </div>

      <div class="review-prompt">
        <div class="star-rating">★ ★ ★ ★ ★</div>
        <h3 style="margin: 0; color: #7c3aed;">How Was Your Experience?</h3>
        <p style="margin: 10px 0; color: #666;">Your feedback helps other property owners and rewards great contractors.</p>
        <a href="${reviewUrl}" class="button-secondary">Leave a Review</a>
      </div>

      <p><strong>What's Next:</strong></p>
      <ul>
        <li>Review the completed work and ensure you're satisfied</li>
        <li>Take photos for your records (especially for insurance claims)</li>
        <li>Leave a review to help other property owners</li>
        <li>Contact the contractor if you have any follow-up questions</li>
        <li>Keep all documentation for warranty purposes</li>
      </ul>

      <p style="text-align: center;">
        <a href="${bookingUrl}" class="button">View Booking Details</a>
      </p>

      <p><strong>Not Satisfied?</strong></p>
      <p>If you have any concerns about the completed work, please contact us immediately at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a> so we can help resolve any issues.</p>

      <p>Thank you for choosing Disaster Recovery Australia. We're glad we could help restore your property!</p>
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
Service Completed!

Hi ${data.clientName},

🎉 Your Service Has Been Completed
Completed on ${formattedDate}

Great news! ${data.contractorName} has successfully completed the ${data.serviceType.toLowerCase()} service for your property.

Completion Summary:
- Booking Reference: ${data.bookingId}
- Service Type: ${data.serviceType}
- Contractor: ${data.contractorName}
- Completed: ${formattedDate}
${data.propertyAddress ? `- Property: ${data.propertyAddress}` : ''}
${data.finalAmount ? `- Final Amount: $${data.finalAmount.toFixed(2)} AUD` : ''}

★ ★ ★ ★ ★
How Was Your Experience?
Your feedback helps other property owners and rewards great contractors.
Leave a Review: ${reviewUrl}

What's Next:
- Review the completed work and ensure you're satisfied
- Take photos for your records (especially for insurance claims)
- Leave a review to help other property owners
- Contact the contractor if you have any follow-up questions
- Keep all documentation for warranty purposes

View Booking Details: ${bookingUrl}

Not Satisfied?
If you have any concerns, contact us at ${EMAIL_CONFIG.supportEmail}

Thank you for choosing Disaster Recovery Australia!

---
Disaster Recovery Australia
Australia's #1 Disaster Recovery Platform
  `;

  return sendEmail({
    to: data.email,
    subject: `✅ Service Completed: ${data.serviceType} - ${data.contractorName}`,
    html,
    text,
  });
}

/**
 * Send review request email
 */
export async function sendReviewRequestEmail(data: {
  clientName: string;
  email: string;
  contractorName: string;
  bookingId: string;
  serviceType: string;
  completedDate: Date;
}): Promise<{ success: boolean; error?: string }> {
  const reviewUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/client/bookings/${data.bookingId}/review`;

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
    .button { display: inline-block; background: #8b5cf6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .review-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #8b5cf6; text-align: center; }
    .star-rating { font-size: 48px; color: #fbbf24; margin: 10px 0; }
    .benefit-list { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⭐ How Was Your Experience?</h1>
    </div>
    <div class="content">
      <p>Hi ${data.clientName},</p>

      <p>We hope ${data.contractorName} did an excellent job with your ${data.serviceType.toLowerCase()} service!</p>

      <div class="review-box">
        <div class="star-rating">★ ★ ★ ★ ★</div>
        <h3 style="margin: 10px 0; color: #7c3aed;">Rate Your Experience</h3>
        <p style="margin: 10px 0 0 0; color: #666;">Your feedback takes less than 2 minutes and helps other property owners make informed decisions.</p>
      </div>

      <p style="text-align: center;">
        <a href="${reviewUrl}" class="button">Leave a Review</a>
      </p>

      <div class="benefit-list">
        <strong>Why Your Review Matters:</strong>
        <ul>
          <li>🎯 Helps other property owners choose the right contractor</li>
          <li>🏆 Recognizes quality workmanship and professionalism</li>
          <li>📊 Improves the platform for everyone</li>
          <li>💡 Provides valuable feedback to contractors</li>
        </ul>
      </div>

      <p><strong>What to Include:</strong></p>
      <ul>
        <li>Quality of workmanship</li>
        <li>Professionalism and communication</li>
        <li>Timeliness and reliability</li>
        <li>Value for money</li>
        <li>Overall satisfaction</li>
      </ul>

      <p><strong>Quick Details:</strong></p>
      <p style="background: white; padding: 15px; border-radius: 4px;">
        <strong>Contractor:</strong> ${data.contractorName}<br>
        <strong>Service:</strong> ${data.serviceType}<br>
        <strong>Completed:</strong> ${data.completedDate.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      <p>Thank you for using Disaster Recovery Australia! Your feedback helps us maintain the highest standards in the industry.</p>

      <p>Questions? Contact us at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></p>
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
How Was Your Experience?

Hi ${data.clientName},

We hope ${data.contractorName} did an excellent job with your ${data.serviceType.toLowerCase()} service!

★ ★ ★ ★ ★
Rate Your Experience

Your feedback takes less than 2 minutes and helps other property owners make informed decisions.

Leave a Review: ${reviewUrl}

Why Your Review Matters:
- Helps other property owners choose the right contractor
- Recognizes quality workmanship and professionalism
- Improves the platform for everyone
- Provides valuable feedback to contractors

What to Include:
- Quality of workmanship
- Professionalism and communication
- Timeliness and reliability
- Value for money
- Overall satisfaction

Quick Details:
- Contractor: ${data.contractorName}
- Service: ${data.serviceType}
- Completed: ${data.completedDate.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}

Thank you for using Disaster Recovery Australia! Your feedback helps us maintain the highest standards in the industry.

Questions? Contact us at ${EMAIL_CONFIG.supportEmail}

---
Disaster Recovery Australia
Australia's #1 Disaster Recovery Platform
  `;

  return sendEmail({
    to: data.email,
    subject: `⭐ Rate Your Experience with ${data.contractorName}`,
    html,
    text,
  });
}

/**
 * Send account status change email
 */
export async function sendAccountStatusChangeEmail(data: {
  clientName: string;
  email: string;
  statusChange: 'ACTIVATED' | 'SUSPENDED' | 'REACTIVATED' | 'CLOSED';
  reason?: string;
  actionRequired?: string;
}): Promise<{ success: boolean; error?: string }> {
  const dashboardUrl = `${EMAIL_CONFIG.baseUrl}/dashboard`;
  const billingUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/billing`;

  const statusConfig: Record<string, { emoji: string; title: string; color: string; message: string }> = {
    'ACTIVATED': {
      emoji: '✅',
      title: 'Account Activated',
      color: '#10b981',
      message: 'Welcome! Your account has been successfully activated and is ready to use.',
    },
    'SUSPENDED': {
      emoji: '⚠️',
      title: 'Account Suspended',
      color: '#ef4444',
      message: 'Your account has been temporarily suspended.',
    },
    'REACTIVATED': {
      emoji: '🎉',
      title: 'Account Reactivated',
      color: '#10b981',
      message: 'Great news! Your account has been reactivated and is fully operational.',
    },
    'CLOSED': {
      emoji: '❌',
      title: 'Account Closed',
      color: '#6b7280',
      message: 'Your account has been closed as requested.',
    },
  };

  const config = statusConfig[data.statusChange];

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
    .button { display: inline-block; background: ${config.color}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .status-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid ${config.color}; }
    .warning-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${config.emoji} ${config.title}</h1>
    </div>
    <div class="content">
      <p>Hi ${data.clientName},</p>

      <div class="status-box">
        <h3 style="margin-top: 0; color: ${config.color};">${config.message}</h3>
        ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
      </div>

      ${data.actionRequired ? `
      <div class="warning-box">
        <strong>⚠️ Action Required:</strong><br>
        ${data.actionRequired}
      </div>
      ` : ''}

      ${data.statusChange === 'ACTIVATED' || data.statusChange === 'REACTIVATED' ? `
      <p><strong>What You Can Do Now:</strong></p>
      <ul>
        <li>Access your full account dashboard</li>
        <li>Submit disaster recovery claims</li>
        <li>Connect with certified contractors</li>
        <li>Track your ongoing projects</li>
        <li>Manage your property portfolio</li>
      </ul>
      ` : ''}

      ${data.statusChange === 'SUSPENDED' ? `
      <p><strong>What This Means:</strong></p>
      <ul>
        <li>You cannot access your dashboard temporarily</li>
        <li>Existing claims and bookings are on hold</li>
        <li>Your data remains secure and preserved</li>
        <li>You can resolve this issue and reactivate your account</li>
      </ul>

      <p style="text-align: center;">
        <a href="${billingUrl}" class="button">Resolve Issue</a>
      </p>
      ` : ''}

      ${data.statusChange === 'CLOSED' ? `
      <p><strong>What Happens to Your Data:</strong></p>
      <ul>
        <li>Your personal data will be removed within 30 days</li>
        <li>Transaction history is retained for compliance (7 years)</li>
        <li>You can request a data export before deletion</li>
        <li>You can reopen your account within 30 days</li>
      </ul>
      ` : ''}

      ${data.statusChange === 'ACTIVATED' || data.statusChange === 'REACTIVATED' ? `
      <p style="text-align: center;">
        <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
      </p>
      ` : ''}

      <p><strong>Need Help?</strong></p>
      <p>If you have questions or need assistance, please contact our support team:</p>
      <ul>
        <li>Email: <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></li>
        <li>Phone: 1300 DR NRPG (1300 37 677 447)</li>
      </ul>
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
${config.title}

Hi ${data.clientName},

${config.message}
${data.reason ? `\nReason: ${data.reason}` : ''}

${data.actionRequired ? `\n⚠️ Action Required:\n${data.actionRequired}\n` : ''}

${data.statusChange === 'ACTIVATED' || data.statusChange === 'REACTIVATED' ? `
What You Can Do Now:
- Access your full account dashboard
- Submit disaster recovery claims
- Connect with certified contractors
- Track your ongoing projects
- Manage your property portfolio
` : ''}

${data.statusChange === 'SUSPENDED' ? `
What This Means:
- You cannot access your dashboard temporarily
- Existing claims and bookings are on hold
- Your data remains secure and preserved
- You can resolve this issue and reactivate your account

Resolve Issue: ${billingUrl}
` : ''}

${data.statusChange === 'CLOSED' ? `
What Happens to Your Data:
- Your personal data will be removed within 30 days
- Transaction history is retained for compliance (7 years)
- You can request a data export before deletion
- You can reopen your account within 30 days
` : ''}

${data.statusChange === 'ACTIVATED' || data.statusChange === 'REACTIVATED' ? `Go to Dashboard: ${dashboardUrl}\n` : ''}

Need Help?
Email: ${EMAIL_CONFIG.supportEmail}
Phone: 1300 DR NRPG (1300 37 677 447)

---
Disaster Recovery Australia
Australia's #1 Disaster Recovery Platform
  `;

  return sendEmail({
    to: data.email,
    subject: `${config.emoji} ${config.title} - Disaster Recovery Australia`,
    html,
    text,
  });
}

/**
 * Send email when contractor accepts claim
 */
export async function sendClaimContractorAssignedEmail(data: {
  clientName: string;
  email: string;
  claimId: string;
  contractorName: string;
  contractorEmail: string;
  contractorPhone: string;
  estimatedArrival: string;
}): Promise<{ success: boolean; error?: string }> {
  const trackingUrl = `${EMAIL_CONFIG.baseUrl}/dashboard/client/claims/${data.claimId}`;

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
    .success-box { background: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .contractor-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #059669; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
    .timeline { background: white; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .timeline-item { margin: 15px 0; padding-left: 20px; border-left: 2px solid #059669; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .contact-row { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Contractor Assigned to Your Claim</h1>
    </div>
    <div class="content">
      <p>Hi ${data.clientName},</p>

      <div class="success-box">
        <h2 style="margin: 0; color: #059669;">✓ Great News!</h2>
        <p style="margin: 10px 0 0 0; font-size: 16px;">A certified contractor has accepted your claim and will contact you shortly</p>
      </div>

      <p>We're pleased to confirm that <strong>${data.contractorName}</strong>, a verified and certified disaster recovery contractor, has accepted your claim and will be handling your restoration work.</p>

      <div class="contractor-box">
        <h3 style="margin-top: 0; color: #059669;">Your Assigned Contractor:</h3>
        <div class="contact-row"><strong>Business Name:</strong> ${data.contractorName}</div>
        <div class="contact-row"><strong>Email:</strong> <a href="mailto:${data.contractorEmail}">${data.contractorEmail}</a></div>
        ${data.contractorPhone ? `<div class="contact-row"><strong>Phone:</strong> <a href="tel:${data.contractorPhone}">${data.contractorPhone}</a></div>` : ''}
        <div class="contact-row"><strong>Estimated Contact Time:</strong> ${data.estimatedArrival}</div>
      </div>

      <div class="timeline">
        <strong>What Happens Next:</strong>

        <div class="timeline-item">
          <strong>1. Contractor Will Contact You</strong><br>
          ${data.contractorName} will reach out to you ${data.estimatedArrival} to schedule an initial assessment
        </div>

        <div class="timeline-item">
          <strong>2. Property Assessment</strong><br>
          The contractor will visit your property to assess the damage and provide a detailed quote
        </div>

        <div class="timeline-item">
          <strong>3. Quote & Timeline</strong><br>
          You'll receive a comprehensive quote with a clear timeline for completion
        </div>

        <div class="timeline-item">
          <strong>4. Work Begins</strong><br>
          Once approved, restoration work begins according to the agreed schedule
        </div>

        <div class="timeline-item">
          <strong>5. Completion & Review</strong><br>
          Work is completed, inspected, and you're invited to leave a review
        </div>
      </div>

      <div class="info-box">
        <strong>📋 Important Reminders:</strong><br><br>
        ✓ Keep your claim reference handy: <strong>${data.claimId}</strong><br>
        ✓ Take photos before, during, and after restoration work<br>
        ✓ Notify your insurance provider (if applicable)<br>
        ✓ Keep all receipts and documentation<br>
        ✓ Communicate directly with your contractor for updates
      </div>

      <p style="text-align: center;">
        <a href="${trackingUrl}" class="button">Track Your Claim</a>
      </p>

      <p><strong>Questions or Concerns?</strong></p>
      <p>If you have any questions about your claim or need assistance, please don't hesitate to contact us:</p>
      <ul>
        <li>Email: <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></li>
        <li>Track online: <a href="${trackingUrl}">${trackingUrl}</a></li>
      </ul>

      <p><strong>Note:</strong> This contractor has been verified and certified by Disaster Recovery Australia. All NRPG members maintain current licenses, insurance, and IICRC certifications.</p>

      <div class="footer">
        <p>
          <strong>Disaster Recovery Australia</strong><br>
          Connecting property owners with certified disaster recovery contractors<br>
          <a href="${EMAIL_CONFIG.baseUrl}">${EMAIL_CONFIG.baseUrl}</a>
        </p>
        <p style="margin-top: 10px; color: #999; font-size: 11px;">
          This is an automated notification. Please do not reply directly to this email.<br>
          For support, contact ${EMAIL_CONFIG.supportEmail}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Contractor Assigned to Your Claim

Hi ${data.clientName},

Great news! A certified contractor has accepted your claim and will contact you shortly.

YOUR ASSIGNED CONTRACTOR:
Business Name: ${data.contractorName}
Email: ${data.contractorEmail}
${data.contractorPhone ? `Phone: ${data.contractorPhone}` : ''}
Estimated Contact Time: ${data.estimatedArrival}

WHAT HAPPENS NEXT:
1. Contractor Will Contact You - ${data.contractorName} will reach out ${data.estimatedArrival}
2. Property Assessment - The contractor will visit to assess damage
3. Quote & Timeline - You'll receive a detailed quote
4. Work Begins - Restoration starts once approved
5. Completion & Review - Work completed and you leave feedback

IMPORTANT REMINDERS:
- Keep your claim reference: ${data.claimId}
- Take photos before, during, and after work
- Notify your insurance provider (if applicable)
- Keep all receipts and documentation
- Communicate directly with your contractor

TRACK YOUR CLAIM:
${trackingUrl}

QUESTIONS?
Email: ${EMAIL_CONFIG.supportEmail}

Note: This contractor has been verified and certified by Disaster Recovery Australia.

---
Disaster Recovery Australia
${EMAIL_CONFIG.baseUrl}
  `;

  return sendEmail({
    to: data.email,
    subject: '🎉 Contractor Assigned to Your Claim - Disaster Recovery Australia',
    html,
    text,
  });
}
