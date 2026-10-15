import { SITE_URL } from '@/lib/seo/site-url';
/**
 * Job Notification Email Templates
 *
 * OLED dark themed HTML email templates for job lifecycle events.
 * Uses teal #0d9488 accents and NRPG branding.
 */

const BASE_URL = SITE_URL;
const SUPPORT_EMAIL = 'support@disasterrecovery.com.au';

/** Shared OLED dark email wrapper */
function wrapTemplate(title: string, accentColour: string, content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #e0e0e0; margin: 0; padding: 0; background-color: #050505; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, ${accentColour} 0%, #050505 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; border: 1px solid rgba(255,255,255,0.1); border-bottom: none; }
    .header h1 { margin: 0; font-size: 22px; color: #ffffff; }
    .header p { margin: 8px 0 0; color: rgba(255,255,255,0.7); font-size: 14px; }
    .content { background: #0a0a0a; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid rgba(255,255,255,0.1); border-top: none; }
    .content p { color: #d0d0d0; margin: 12px 0; }
    .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-left: 4px solid ${accentColour}; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .card-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 4px; }
    .card-value { font-size: 15px; color: #ffffff; font-weight: 500; }
    .job-number { font-family: 'SF Mono', 'Fira Code', monospace; color: #00F5FF; font-size: 18px; font-weight: 700; }
    .button { display: inline-block; background: #0d9488; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; font-size: 14px; }
    .button:hover { background: #0f766e; }
    .footer { text-align: center; color: #666; font-size: 11px; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); }
    .footer a { color: #0d9488; text-decoration: none; }
    ul { color: #d0d0d0; }
    li { margin: 6px 0; }
    strong { color: #ffffff; }
  </style>
</head>
<body style="background-color: #050505;">
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Disaster Recovery Australia &mdash; NRPG</p>
      <p><a href="${BASE_URL}">disasterrecovery.com.au</a> &middot; <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================================
// Job Created — sent to property owner
// ============================================================================

export function getJobCreatedTemplate(data: {
  clientName: string;
  jobNumber: string;
  jobType: string;
  propertyAddress: string;
  estimatedCost?: string;
}): string {
  return wrapTemplate('Job Created', '#0d9488', `
    <p>Hello ${data.clientName},</p>
    <p>Your disaster recovery job has been created and is now being processed.</p>
    <div class="card">
      <div class="card-label">Job Number</div>
      <div class="job-number">${data.jobNumber}</div>
    </div>
    <div class="card">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <div class="card-label">Service Type</div>
          <div class="card-value">${data.jobType}</div>
        </div>
        <div>
          <div class="card-label">Property</div>
          <div class="card-value">${data.propertyAddress}</div>
        </div>
        ${data.estimatedCost ? `<div>
          <div class="card-label">Estimated Cost</div>
          <div class="card-value">$${data.estimatedCost} AUD</div>
        </div>` : ''}
      </div>
    </div>
    <p><strong>What happens next:</strong></p>
    <ul>
      <li>A qualified contractor will be assigned to your job</li>
      <li>You will receive a notification when work is scheduled</li>
      <li>Track progress at any time from your dashboard</li>
    </ul>
    <p style="text-align: center;">
      <a href="${BASE_URL}/dashboard/jobs" class="button">View Your Jobs</a>
    </p>
    <p>If you have questions, contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #0d9488;">${SUPPORT_EMAIL}</a></p>
  `);
}

// ============================================================================
// Contractor Assigned — sent to contractor
// ============================================================================

export function getContractorAssignedTemplate(data: {
  contractorName: string;
  jobNumber: string;
  jobType: string;
  propertyAddress: string;
  clientName?: string;
}): string {
  return wrapTemplate('You Have Been Assigned a Job', '#00F5FF', `
    <p>Hello ${data.contractorName},</p>
    <p>You have been assigned to a new disaster recovery job. Please review the details below and prepare to begin work.</p>
    <div class="card">
      <div class="card-label">Job Number</div>
      <div class="job-number">${data.jobNumber}</div>
    </div>
    <div class="card">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <div class="card-label">Service Type</div>
          <div class="card-value">${data.jobType}</div>
        </div>
        <div>
          <div class="card-label">Property</div>
          <div class="card-value">${data.propertyAddress}</div>
        </div>
        ${data.clientName ? `<div>
          <div class="card-label">Client</div>
          <div class="card-value">${data.clientName}</div>
        </div>` : ''}
      </div>
    </div>
    <p><strong>Next steps:</strong></p>
    <ul>
      <li>Review the job requirements and property access details</li>
      <li>Confirm your availability and start date</li>
      <li>Begin the restoration work when ready</li>
      <li>Update job status as you progress</li>
    </ul>
    <p style="text-align: center;">
      <a href="${BASE_URL}/dashboard/contractor" class="button">Go to Dashboard</a>
    </p>
  `);
}

// ============================================================================
// Work Started — sent to property owner
// ============================================================================

export function getWorkStartedJobTemplate(data: {
  clientName: string;
  jobNumber: string;
  jobType: string;
  contractorName: string;
  propertyAddress: string;
}): string {
  return wrapTemplate('Work Has Started', '#0d9488', `
    <p>Hello ${data.clientName},</p>
    <p><strong>${data.contractorName}</strong> has commenced work on your property for job <span class="job-number">${data.jobNumber}</span>.</p>
    <div class="card">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <div class="card-label">Service</div>
          <div class="card-value">${data.jobType}</div>
        </div>
        <div>
          <div class="card-label">Contractor</div>
          <div class="card-value">${data.contractorName}</div>
        </div>
        <div>
          <div class="card-label">Property</div>
          <div class="card-value">${data.propertyAddress}</div>
        </div>
      </div>
    </div>
    <p>You can track the progress of this job in your dashboard at any time.</p>
    <p style="text-align: center;">
      <a href="${BASE_URL}/dashboard/jobs" class="button">Track Progress</a>
    </p>
  `);
}

// ============================================================================
// Job Completed — sent to property owner (+ CC insurer if applicable)
// ============================================================================

export function getJobCompletedTemplate(data: {
  clientName: string;
  jobNumber: string;
  jobType: string;
  contractorName: string;
  propertyAddress: string;
  hoursWorked?: string;
  actualCost?: string;
}): string {
  return wrapTemplate('Job Completed', '#00FF88', `
    <p>Hello ${data.clientName},</p>
    <p>Great news! The restoration work on your property has been completed.</p>
    <div class="card">
      <div class="card-label">Job Number</div>
      <div class="job-number">${data.jobNumber}</div>
    </div>
    <div class="card">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <div class="card-label">Service</div>
          <div class="card-value">${data.jobType}</div>
        </div>
        <div>
          <div class="card-label">Contractor</div>
          <div class="card-value">${data.contractorName}</div>
        </div>
        <div>
          <div class="card-label">Property</div>
          <div class="card-value">${data.propertyAddress}</div>
        </div>
        ${data.hoursWorked ? `<div>
          <div class="card-label">Hours Worked</div>
          <div class="card-value">${data.hoursWorked}h</div>
        </div>` : ''}
        ${data.actualCost ? `<div>
          <div class="card-label">Final Cost (ex. GST)</div>
          <div class="card-value">$${data.actualCost} AUD</div>
        </div>` : ''}
      </div>
    </div>
    <p><strong>Next steps:</strong></p>
    <ul>
      <li>Inspect the completed work on your property</li>
      <li>An invoice will be generated shortly</li>
      <li>Leave a review and rating for the contractor</li>
    </ul>
    <p style="text-align: center;">
      <a href="${BASE_URL}/dashboard/jobs" class="button">Review Completed Job</a>
    </p>
  `);
}

// ============================================================================
// Invoice Generated — sent to property owner
// ============================================================================

export function getInvoiceGeneratedTemplate(data: {
  clientName: string;
  jobNumber: string;
  jobType: string;
  contractorName: string;
  subtotalAUD: string;
  gstAUD: string;
  totalAUD: string;
}): string {
  return wrapTemplate('Invoice Generated', '#a78bfa', `
    <p>Hello ${data.clientName},</p>
    <p>An invoice has been generated for the completed work on your property.</p>
    <div class="card">
      <div class="card-label">Job Number</div>
      <div class="job-number">${data.jobNumber}</div>
    </div>
    <div class="card">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <div class="card-label">Service</div>
          <div class="card-value">${data.jobType}</div>
        </div>
        <div>
          <div class="card-label">Contractor</div>
          <div class="card-value">${data.contractorName}</div>
        </div>
      </div>
    </div>
    <div class="card" style="border-left-color: #a78bfa;">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #888;">Subtotal (ex. GST)</span>
          <span style="color: #fff;">$${data.subtotalAUD}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #888;">GST (10%)</span>
          <span style="color: #ccc;">$${data.gstAUD}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; font-weight: 700;">
          <span style="color: #fff;">Total (inc. GST)</span>
          <span style="color: #00FF88; font-size: 18px;">$${data.totalAUD}</span>
        </div>
      </div>
    </div>
    <p style="text-align: center;">
      <a href="${BASE_URL}/dashboard/jobs" class="button" style="background: #a78bfa;">View Invoice</a>
    </p>
  `);
}

// ============================================================================
// Contractor Assignment SMS
// ============================================================================

export function getContractorAssignedSmsText(data: {
  contractorName: string;
  jobNumber: string;
  jobType: string;
  propertyAddress: string;
}): string {
  return `NRPG: Hi ${data.contractorName}, you've been assigned to job ${data.jobNumber} (${data.jobType}) at ${data.propertyAddress}. Log in to view details: ${BASE_URL}/dashboard/contractor`;
}
