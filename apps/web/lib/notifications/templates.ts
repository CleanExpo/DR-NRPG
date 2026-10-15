import { SITE_URL } from '@/lib/seo/site-url';
/**
 * Email Templates for Notifications
 *
 * HTML email templates for all notification types
 */

// ============================================================================
// Claim Confirmation (already sent in Phase 02, but included here for completeness)
// ============================================================================

export function getClaimConfirmationTemplate(data: Record<string, any>): string {
  const { clientName, claimId, suburb, disasterType, priority } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .claim-ref { background: white; padding: 20px; border-left: 4px solid #059669; margin: 20px 0; border-radius: 4px; font-family: monospace; font-size: 18px; font-weight: bold; }
    .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Claim Received</h1>
      <p>Your disaster recovery claim has been successfully submitted</p>
    </div>
    <div class="content">
      <p>Hello ${clientName},</p>
      <p>Thank you for submitting your disaster recovery claim. We've received your information and our system is now matching you with contractors in your area.</p>
      <div class="claim-ref">
        Claim Reference: ${claimId}
      </div>
      <p><strong>Your Claim Details:</strong></p>
      <ul>
        <li>Disaster Type: ${disasterType}</li>
        <li>Location: ${suburb}</li>
        <li>Priority: ${priority}</li>
      </ul>
      <p style="text-align: center;">
        <a href="${SITE_URL}/claim/success?claimId=${claimId}" class="button">View Your Claim</a>
      </p>
      <p>If you have any questions, contact us at support@disasterrecovery.com.au</p>
      <p>Best regards,<br><strong>Disaster Recovery Australia</strong></p>
    </div>
    <div class="footer">
      <p>© 2026 Disaster Recovery Australia. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================================================
// Booking Created (contractors matched)
// ============================================================================

export function getBookingCreatedTemplate(data: Record<string, any>): string {
  const { clientName, bookingId, contractorCount, disasterType, location } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .highlight { background: white; padding: 20px; border-left: 4px solid #059669; margin: 20px 0; border-radius: 4px; }
    .contractor-count { font-size: 36px; font-weight: bold; color: #059669; }
    .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Contractors Found!</h1>
      <p>We've matched you with ${contractorCount} qualified contractors</p>
    </div>
    <div class="content">
      <p>Hello ${clientName},</p>
      <p>Great news! Your ${disasterType} claim has been processed and converted to a booking. We've found <strong>${contractorCount} qualified contractors</strong> to bid on your job in ${location}.</p>

      <div class="highlight">
        <p>Your booking ID: <strong style="font-family: monospace;">${bookingId}</strong></p>
        <p style="margin: 10px 0;">Next steps: Contractors will submit bids within the next 30 minutes. You can review and compare their offers.</p>
      </div>

      <h3>What Happens Next:</h3>
      <ol>
        <li><strong>Contractors Submit Bids</strong> - In the next 30 minutes, contractors will review your job and submit their bids</li>
        <li><strong>Review Bids</strong> - You'll see detailed quotes, timelines, and contractor information</li>
        <li><strong>Accept a Bid</strong> - Choose the contractor that best fits your needs</li>
        <li><strong>Work Begins</strong> - Start the restoration process right away</li>
      </ol>

      <p style="text-align: center;">
        <a href="${SITE_URL}/dashboard/client/claims/${bookingId}" class="button">View Your Claim & Bids</a>
      </p>

      <p style="background: #f0fdf4; border: 1px solid #86efac; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <strong>💡 Pro Tip:</strong> You're not obligated to accept the first bid. Review all options and choose the best contractor for your situation.
      </p>

      <p>Questions? Contact us at support@disasterrecovery.com.au</p>
      <p>Best regards,<br><strong>Disaster Recovery Australia</strong></p>
    </div>
    <div class="footer">
      <p>© 2026 Disaster Recovery Australia. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================================================
// Bid Received
// ============================================================================

export function getBidReceivedTemplate(data: Record<string, any>): string {
  const { clientName, businessName, contractorName, proposedBudget, estimatedHours, bookingId } =
    data;
  const hourlyRate = estimatedHours ? (proposedBudget / estimatedHours).toFixed(2) : 'N/A';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .bid-details { background: white; padding: 20px; border: 2px solid #059669; margin: 20px 0; border-radius: 4px; }
    .bid-amount { font-size: 36px; font-weight: bold; color: #059669; margin: 10px 0; }
    .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📬 New Bid Received!</h1>
      <p>${businessName} has submitted a bid</p>
    </div>
    <div class="content">
      <p>Hello ${clientName},</p>
      <p><strong>${contractorName}</strong> from <strong>${businessName}</strong> has submitted a bid for your job.</p>

      <div class="bid-details">
        <p><strong>Bid Summary:</strong></p>
        <div class="bid-amount">\$${proposedBudget.toLocaleString('en-AU')}</div>
        ${estimatedHours ? `<p><strong>Estimated Hours:</strong> ${estimatedHours} hours</p>` : ''}
        ${hourlyRate !== 'N/A' ? `<p><strong>Effective Hourly Rate:</strong> \$${hourlyRate}/hour</p>` : ''}
      </div>

      <p><strong>Contractor Message:</strong></p>
      <p style="background: #f3f4f6; padding: 15px; border-radius: 4px; font-style: italic;">
        "${data.message || 'No message provided'}"
      </p>

      <p style="text-align: center;">
        <a href="${SITE_URL}/dashboard/client/claims/${bookingId}" class="button">Review All Bids</a>
      </p>

      <p style="background: #f0fdf4; border: 1px solid #86efac; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <strong>💡 Next Step:</strong> Go to your claim dashboard to see all submitted bids and compare options.
      </p>

      <p>Best regards,<br><strong>Disaster Recovery Australia</strong></p>
    </div>
    <div class="footer">
      <p>© 2026 Disaster Recovery Australia. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================================================
// Bid Accepted
// ============================================================================

export function getBidAcceptedTemplate(data: Record<string, any>): string {
  const { contractorName, businessName, clientName, bookingId } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .contractor-info { background: white; padding: 20px; border: 2px solid #059669; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Bid Accepted!</h1>
      <p>Work is ready to start</p>
    </div>
    <div class="content">
      <p>Hello ${contractorName},</p>
      <p>Great news! <strong>${clientName}</strong> has accepted your bid for the job in the Disaster Recovery platform.</p>

      <div class="contractor-info">
        <p><strong>Next Steps:</strong></p>
        <ul>
          <li>Contact the client to coordinate timing</li>
          <li>Confirm your availability and start date</li>
          <li>Begin the restoration work</li>
          <li>Keep the client updated on progress</li>
        </ul>
      </div>

      <p><strong>Booking Reference:</strong> ${bookingId}</p>

      <p style="text-align: center;">
        <a href="${SITE_URL}/dashboard/contractor/my-bids" class="button">View Accepted Bid</a>
      </p>

      <p style="background: #f0fdf4; border: 1px solid #86efac; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <strong>📞 Important:</strong> Reach out to the client immediately to discuss timing and any final details.
      </p>

      <p>Best regards,<br><strong>Disaster Recovery Australia</strong></p>
    </div>
    <div class="footer">
      <p>© 2026 Disaster Recovery Australia. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================================================
// Job Matched (contractor notification)
// ============================================================================

export function getJobMatchedTemplate(data: Record<string, any>): string {
  const { contractorName, businessName, matchScore, bookingId } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .match-score { background: white; padding: 20px; border: 2px solid #059669; margin: 20px 0; border-radius: 4px; text-align: center; }
    .score-number { font-size: 48px; font-weight: bold; color: #059669; }
    .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 New Job Opportunity!</h1>
      <p>You've been matched for a new job</p>
    </div>
    <div class="content">
      <p>Hello ${contractorName},</p>
      <p>A new disaster recovery job has been posted that matches your expertise and service area.</p>

      <div class="match-score">
        <p style="margin: 0; font-size: 14px; color: #666;">MATCH SCORE</p>
        <div class="score-number">${matchScore}%</div>
        <p style="margin: 10px 0; color: #666;">
          ${matchScore >= 80 ? 'Excellent fit!' : matchScore >= 60 ? 'Good opportunity' : 'Worth checking out'}
        </p>
      </div>

      <p><strong>Why were you matched?</strong></p>
      <ul>
        <li>Your location matches the job site</li>
        <li>You have relevant expertise</li>
        <li>You're currently accepting new jobs</li>
      </ul>

      <p style="text-align: center;">
        <a href="${SITE_URL}/dashboard/contractor/available-requests/${bookingId}" class="button">View Job Details & Bid</a>
      </p>

      <p style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <strong>⏰ Quick Action:</strong> Other contractors are bidding too. Submit your bid soon to stay competitive!
      </p>

      <p>Best regards,<br><strong>Disaster Recovery Australia</strong></p>
    </div>
    <div class="footer">
      <p>© 2026 Disaster Recovery Australia. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================================================
// Work Started
// ============================================================================

export function getWorkStartedTemplate(data: Record<string, any>): string {
  const { clientName, contractorName, businessName, bookingId } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Work Has Started!</h1>
      <p>${contractorName} from ${businessName} is working on your claim</p>
    </div>
    <div class="content">
      <p>Hello ${clientName},</p>
      <p><strong>${contractorName}</strong> from <strong>${businessName}</strong> has begun work on your disaster recovery claim.</p>

      <p><strong>What You Can Expect:</strong></p>
      <ul>
        <li>Regular progress updates from the contractor</li>
        <li>Direct communication through the platform</li>
        <li>Real-time tracking of work completion</li>
        <li>Before and after documentation</li>
      </ul>

      <p style="text-align: center;">
        <a href="${SITE_URL}/dashboard/client/claims/${bookingId}" class="button">Track Progress</a>
      </p>

      <p style="background: #f0fdf4; border: 1px solid #86efac; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <strong>📞 Need to communicate?</strong> You can message the contractor directly through your claim dashboard.
      </p>

      <p>Best regards,<br><strong>Disaster Recovery Australia</strong></p>
    </div>
    <div class="footer">
      <p>© 2026 Disaster Recovery Australia. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================================================
// Work Completed
// ============================================================================

export function getWorkCompletedTemplate(data: Record<string, any>): string {
  const { clientName, contractorName, businessName, bookingId } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Work Completed!</h1>
      <p>Your disaster recovery restoration is complete</p>
    </div>
    <div class="content">
      <p>Hello ${clientName},</p>
      <p>Great news! <strong>${contractorName}</strong> from <strong>${businessName}</strong> has completed the work on your disaster recovery claim.</p>

      <p><strong>Next Steps:</strong></p>
      <ol>
        <li>Inspect the completed work</li>
        <li>Confirm quality and completion</li>
        <li>Release payment to contractor</li>
        <li>Leave a review and rating</li>
      </ol>

      <p style="text-align: center;">
        <a href="${SITE_URL}/dashboard/client/claims/${bookingId}" class="button">Review & Complete</a>
      </p>

      <p style="background: #f0fdf4; border: 1px solid #86efac; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <strong>⭐ Please leave a review!</strong> Your feedback helps us maintain quality contractors and helps others make informed decisions.
      </p>

      <p>Thank you for using Disaster Recovery Australia. We hope your restoration was smooth and your property is back to normal.</p>
      <p>Best regards,<br><strong>Disaster Recovery Australia</strong></p>
    </div>
    <div class="footer">
      <p>© 2026 Disaster Recovery Australia. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
