// @ts-nocheck

/**
 * Review Request Automation System
 *
 * Automatically requests customer reviews post-job
 * Target: 50+ reviews per city within 6 months
 *
 * Methods:
 * - SMS request (within 48 hours of job completion)
 * - Email request (follow-up at 1 week)
 * - In-app prompt (optional)
 *
 * Strategy:
 * - Request at optimal time (high satisfaction point)
 * - Make it easy (direct Google review link)
 * - Incentivize (mention NRPG mission/impact)
 * - Follow up systematically
 */

import { GBPLocation } from './gbp-manager';

export interface ReviewRequest {
  id: string;
  jobId: string;
  locationId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: string;
  jobCompletionDate: Date;
  status: 'pending' | 'sms_sent' | 'email_sent' | 'completed' | 'declined';
  requestedAt: Date;
  reviewReceived: boolean;
  reviewText?: string;
  reviewRating?: number;
  reviewUrl?: string;
  reminderCount: number;
  lastReminderAt?: Date;
}

export interface ReviewTemplate {
  type: 'sms' | 'email' | 'first_reminder' | 'second_reminder';
  subject?: string;
  body: string;
  callToActionText: string;
  reviewLink: string;
}

// SMS Template (160 characters ideal)
const SMS_TEMPLATE: ReviewTemplate = {
  type: 'sms',
  body: `Hi {{NAME}}, thanks for choosing NRPG for your {{SERVICE}} restoration. We'd appreciate a Google review! {{REVIEW_LINK}} - NRPG Team`,
  callToActionText: 'Leave Review',
  reviewLink: 'https://nrpg.reviews/',
};

// Email Templates
const EMAIL_TEMPLATES: ReviewTemplate[] = [
  {
    type: 'email',
    subject: 'Thank You for Choosing NRPG - Share Your Review',
    body: `
Dear {{NAME}},

Thank you for choosing NRPG for your {{SERVICE}} restoration. We're proud to have helped restore your {{PROPERTY_TYPE}} to its original condition.

Your feedback helps us maintain our 4.9-star rating and ensures we continue delivering professional, qualified service to Australian families and businesses.

Would you take 2 minutes to leave a Google review?

Your review helps:
✓ Other families find us when they need emergency help
✓ Us improve our service quality
✓ Hold contractors accountable to high standards

{{REVIEW_LINK}}

Thank you for being part of the NRPG community.

Best regards,
NRPG Team
National Restoration Professionals Group
Available 24/7 for emergency restoration
    `.trim(),
    callToActionText: 'Leave a Review',
    reviewLink: 'https://g.page/nrpg-{{CITY}}/review',
  },
  {
    type: 'first_reminder',
    subject: 'reminder: One Week After Your Restoration - Share Your Review',
    body: `
Hi {{NAME}},

It has been one week since we completed your {{SERVICE}} restoration. We hope you are happy with the results!

If you have not had a chance, would you consider sharing a quick Google review? It takes just 2 minutes and means a lot to us.

Your honest feedback (good or constructive) helps us stay the best disaster recovery service in {{CITY}}.

{{REVIEW_LINK}}

Thank you!
NRPG Team
    `.trim(),
    callToActionText: 'Share Your Experience',
    reviewLink: 'https://g.page/nrpg-{{CITY}}/review',
  },
  {
    type: 'second_reminder',
    subject: 'Final Reminder: Your {{CITY}} Restoration Review',
    body: `
Hello {{NAME}},

We noticed you have not had a chance to leave a review yet. No pressure!

But if you are happy with your {{SERVICE}} restoration, a quick 30-second Google review would be incredibly helpful.

{{REVIEW_LINK}}

Your review directly helps other people in {{CITY}} find professional, affordable disaster recovery help.

Thank you for considering it!
NRPG Team
    `.trim(),
    callToActionText: 'Leave Review Now',
    reviewLink: 'https://g.page/nrpg-{{CITY}}/review',
  },
];

/**
 * Review Request System for automation
 */
export class ReviewRequestSystem {
  /**
   * Create review request after job completion
   */
  createReviewRequest(
    jobId: string,
    locationId: string,
    customerId: string,
    customerData: {
      name: string;
      email: string;
      phone: string;
      serviceType: string;
    }
  ): ReviewRequest {
    return {
      id: `review-req-${jobId}-${Date.now()}`,
      jobId,
      locationId,
      customerId,
      customerName: customerData.name,
      customerEmail: customerData.email,
      customerPhone: customerData.phone,
      serviceType: customerData.serviceType,
      jobCompletionDate: new Date(),
      status: 'pending',
      requestedAt: new Date(),
      reviewReceived: false,
      reminderCount: 0,
    };
  }

  /**
   * Send SMS review request (within 48 hours of job completion)
   */
  generateSMSRequest(request: ReviewRequest, location: GBPLocation): string {
    let sms = SMS_TEMPLATE.body
      .replace('{{NAME}}', request.customerName.split(' ')[0])
      .replace('{{SERVICE}}', request.serviceType)
      .replace('{{REVIEW_LINK}}', `${SMS_TEMPLATE.reviewLink}${location.id}`);

    return sms;
  }

  /**
   * Send email review request
   */
  generateEmailRequest(request: ReviewRequest, location: GBPLocation, isReminder: boolean = false): {
    subject: string;
    body: string;
  } {
    const template = isReminder
      ? request.reminderCount === 1
        ? EMAIL_TEMPLATES[1] // First reminder
        : EMAIL_TEMPLATES[2] // Second reminder
      : EMAIL_TEMPLATES[0]; // Initial request

    let body = template.body
      .replace('{{NAME}}', request.customerName.split(' ')[0])
      .replace('{{SERVICE}}', request.serviceType)
      .replace('{{CITY}}', location.city)
      .replace('{{PROPERTY_TYPE}}', 'property')
      .replace('{{REVIEW_LINK}}', `\n\n👉 ${template.callToActionText}: ${template.reviewLink.replace('{{CITY}}', location.city.toLowerCase())}`);

    return {
      subject: template.subject,
      body,
    };
  }

  /**
   * Get review request status
   */
  getRequestStatus(request: ReviewRequest): {
    stage: string;
    nextAction: string;
    daysSinceCompletion: number;
    isReviewDue: boolean;
  } {
    const now = new Date();
    const daysSinceCompletion = Math.floor(
      (now.getTime() - request.jobCompletionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let stage = 'Pending';
    let nextAction = 'Send SMS request (0-48 hours after job)';

    if (request.reviewReceived) {
      stage = 'Completed';
      nextAction = 'Thank customer';
    } else if (request.status === 'sms_sent' && daysSinceCompletion < 7) {
      stage = 'SMS Sent';
      nextAction = 'Send email follow-up (at day 7)';
    } else if (request.status === 'email_sent' && request.reminderCount === 0) {
      stage = 'First Email Sent';
      nextAction = 'Send first reminder (at day 14)';
    } else if (request.reminderCount === 1 && daysSinceCompletion < 30) {
      stage = 'First Reminder Sent';
      nextAction = 'Send second/final reminder (at day 30)';
    } else if (request.reminderCount >= 2) {
      stage = 'Final Reminder Sent';
      nextAction = 'Archive request';
    }

    return {
      stage,
      nextAction,
      daysSinceCompletion,
      isReviewDue: daysSinceCompletion >= 1 && !request.reviewReceived,
    };
  }

  /**
   * Calculate review target progress for location
   */
  getReviewProgress(
    requests: ReviewRequest[],
    locationId: string
  ): {
    target: number;
    current: number;
    progress: number;
    pending: number;
    completed: number;
    conversionRate: number;
  } {
    const target = 50;
    const locationRequests = requests.filter(r => r.locationId === locationId);
    const completed = locationRequests.filter(r => r.reviewReceived).length;
    const pending = locationRequests.filter(r => !r.reviewReceived).length;

    const conversionRate =
      locationRequests.length > 0 ? (completed / locationRequests.length) * 100 : 0;

    return {
      target,
      current: completed,
      progress: (completed / target) * 100,
      pending,
      completed,
      conversionRate: Math.round(conversionRate),
    };
  }

  /**
   * Get next requests to process
   */
  getNextRequests(
    requests: ReviewRequest[],
    batchSize: number = 10
  ): ReviewRequest[] {
    const now = new Date();

    return requests
      .filter(r => !r.reviewReceived)
      .map(r => {
        const daysSince = Math.floor(
          (now.getTime() - r.jobCompletionDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        let shouldProcess = false;
        if (r.status === 'pending' && daysSince <= 2) {
          shouldProcess = true; // Send SMS within 48 hours
        } else if (r.status === 'sms_sent' && daysSince >= 7 && daysSince <= 9) {
          shouldProcess = true; // Send email at 1 week
        } else if (r.reminderCount === 0 && daysSince >= 14 && daysSince <= 16) {
          shouldProcess = true; // First reminder at 2 weeks
        } else if (r.reminderCount === 1 && daysSince >= 30 && daysSince <= 32) {
          shouldProcess = true; // Final reminder at 1 month
        }

        return { request: r, priority: Math.max(0, 32 - daysSince), shouldProcess };
      })
      .filter(r => r.shouldProcess)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, batchSize)
      .map(r => r.request);
  }

  /**
   * Mark review as received
   */
  markReviewReceived(request: ReviewRequest, reviewData: {
    rating: number;
    text: string;
    url: string;
  }): ReviewRequest {
    return {
      ...request,
      reviewReceived: true,
      reviewRating: reviewData.rating,
      reviewText: reviewData.text,
      reviewUrl: reviewData.url,
      status: 'completed',
    };
  }

  /**
   * Generate bulk request report
   */
  generateBulkReport(requests: ReviewRequest[]): {
    totalRequests: number;
    reviewsReceived: number;
    conversionRate: number;
    avgRating: number;
    pendingRequests: number;
    requestsDueToday: number;
    recommendations: string[];
  } {
    const reviewsReceived = requests.filter(r => r.reviewReceived).length;
    const avgRating =
      requests
        .filter(r => r.reviewRating)
        .reduce((sum, r) => sum + (r.reviewRating || 0), 0) / reviewsReceived || 0;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const requestsDueToday = requests.filter(r => {
      const daysTo = Math.floor(
        (r.jobCompletionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysTo % 7 === 0 && !r.reviewReceived;
    }).length;

    const recommendations: string[] = [];
    if (reviewsReceived < requests.length * 0.2) {
      recommendations.push('Increase review request frequency or timing');
    }
    if (avgRating < 4.5) {
      recommendations.push('Review service quality - ratings are below target');
    }
    if (requestsDueToday > 50) {
      recommendations.push('High volume of requests due - consider batching');
    }

    return {
      totalRequests: requests.length,
      reviewsReceived,
      conversionRate: Math.round((reviewsReceived / requests.length) * 100),
      avgRating: Math.round(avgRating * 10) / 10,
      pendingRequests: requests.length - reviewsReceived,
      requestsDueToday,
      recommendations,
    };
  }
}

// Export singleton
export const reviewRequestSystem = new ReviewRequestSystem();
