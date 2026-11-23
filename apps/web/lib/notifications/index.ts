/**
 * Notifications System
 *
 * Handles sending emails and managing in-app notifications
 * for all platform events
 */

import { sendMail } from '@/lib/email/mailtrap';
import { prisma } from '@/lib/prisma';
import {
  getClaimConfirmationTemplate,
  getBookingCreatedTemplate,
  getBidReceivedTemplate,
  getBidAcceptedTemplate,
  getJobMatchedTemplate,
  getWorkStartedTemplate,
  getWorkCompletedTemplate,
} from './templates';

// ============================================================================
// Types
// ============================================================================

export interface SendNotificationOptions {
  userId: string;
  type: string;
  subject: string;
  template: string;
  data: Record<string, any>;
  email?: string;
}

export interface NotificationPreferences {
  emailOnClaimSubmitted: boolean;
  emailOnBidReceived: boolean;
  emailOnBidAccepted: boolean;
  emailOnWorkStarted: boolean;
  emailOnWorkCompleted: boolean;
  emailOnNewJob: boolean;
  pushNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
}

// ============================================================================
// Send Notification
// ============================================================================

/**
 * Send a notification (email + in-app)
 * Respects user notification preferences
 */
export async function sendNotification(options: SendNotificationOptions) {
  const { userId, type, subject, template, data, email } = options;

  console.log(`📧 Sending notification: ${type} to user ${userId}`);

  try {
    // 1. Get user details if email not provided
    let userEmail = email;
    if (!userEmail) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      userEmail = user?.email;
    }

    if (!userEmail) {
      console.warn(`No email found for user ${userId}`);
      return;
    }

    // 2. Check notification preferences
    const preferences = await getNotificationPreferences(userId);
    if (!shouldSendEmail(type, preferences)) {
      console.log(`⏭️  Skipping email (user preferences) for ${type}`);
      return;
    }

    // 3. Get email template
    const htmlContent = getEmailTemplate(template, data);
    if (!htmlContent) {
      console.warn(`No template found for: ${template}`);
      return;
    }

    // 4. Send email via the Mailtrap mail module (DR-964). It fails closed and
    //    logs loudly when mail is not configured; the in-app notification is
    //    still created either way.
    const result = await sendMail({
      fromName: 'Disaster Recovery Australia',
      to: userEmail,
      subject,
      html: htmlContent,
    });

    if (result.sent) {
      console.log(`✅ Email sent to ${userEmail}: ${type}`);
    } else {
      console.error(`Email not sent for ${type} (${result.reason}): ${result.error}`);
    }

    // 5. Create in-app notification
    await createInAppNotification(userId, type, subject, data);
  } catch (error) {
    console.error('Notification error:', error);
  }
}

// ============================================================================
// Create In-App Notification
// ============================================================================

export async function createInAppNotification(
  userId: string,
  type: string,
  title: string,
  data: Record<string, any>
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message: generateNotificationMessage(type, data),
        data,
        read: false,
      },
    });

    console.log(`✅ In-app notification created for user ${userId}: ${type}`);
  } catch (error) {
    console.error('Failed to create in-app notification:', error);
  }
}

// ============================================================================
// Email Template Selection
// ============================================================================

function getEmailTemplate(templateName: string, data: Record<string, any>): string | null {
  switch (templateName) {
    case 'claim_confirmation':
      return getClaimConfirmationTemplate(data);
    case 'booking_created':
      return getBookingCreatedTemplate(data);
    case 'bid_received':
      return getBidReceivedTemplate(data);
    case 'bid_accepted':
      return getBidAcceptedTemplate(data);
    case 'job_matched':
      return getJobMatchedTemplate(data);
    case 'work_started':
      return getWorkStartedTemplate(data);
    case 'work_completed':
      return getWorkCompletedTemplate(data);
    default:
      console.warn(`Unknown template: ${templateName}`);
      return null;
  }
}

// ============================================================================
// Notification Preferences
// ============================================================================

/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  try {
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Return defaults
      return {
        emailOnClaimSubmitted: true,
        emailOnBidReceived: true,
        emailOnBidAccepted: true,
        emailOnWorkStarted: true,
        emailOnWorkCompleted: true,
        emailOnNewJob: true,
        pushNotificationsEnabled: true,
        smsNotificationsEnabled: false,
      };
    }

    return preferences as NotificationPreferences;
  } catch (error) {
    console.error('Failed to get notification preferences:', error);
    // Return defaults on error
    return {
      emailOnClaimSubmitted: true,
      emailOnBidReceived: true,
      emailOnBidAccepted: true,
      emailOnWorkStarted: true,
      emailOnWorkCompleted: true,
      emailOnNewJob: true,
      pushNotificationsEnabled: true,
      smsNotificationsEnabled: false,
    };
  }
}

/**
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
) {
  try {
    const updated = await prisma.notificationPreference.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...preferences,
      },
    });

    console.log(`✅ Notification preferences updated for user ${userId}`);
    return updated;
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Determine if email should be sent based on type and preferences
 */
function shouldSendEmail(type: string, preferences: NotificationPreferences): boolean {
  switch (type) {
    case 'claim_submitted':
      return preferences.emailOnClaimSubmitted;
    case 'bid_received':
      return preferences.emailOnBidReceived;
    case 'bid_accepted':
      return preferences.emailOnBidAccepted;
    case 'work_started':
      return preferences.emailOnWorkStarted;
    case 'work_completed':
      return preferences.emailOnWorkCompleted;
    case 'job_available':
    case 'job_matched':
      return preferences.emailOnNewJob;
    default:
      return true; // Send by default if not specified
  }
}

/**
 * Generate notification message based on type and data
 */
function generateNotificationMessage(type: string, data: Record<string, any>): string {
  switch (type) {
    case 'claim_submitted':
      return 'Your claim has been received and is being reviewed.';
    case 'booking_created':
      return `Your claim has been matched with ${data.contractorCount} contractors.`;
    case 'bid_received':
      return `New bid from ${data.businessName}: ${formatCurrency(data.proposedBudget)}`;
    case 'bid_accepted':
      return `Your bid has been accepted! Ready to get started.`;
    case 'job_available':
      return `New job available with ${data.matchScore}% match score.`;
    case 'work_started':
      return 'Work has started on your claim.';
    case 'work_completed':
      return 'Work has been completed on your claim.';
    default:
      return 'You have a new notification.';
  }
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Mark notifications as read
 */
export async function markNotificationsAsRead(userId: string, notificationIds?: string[]) {
  try {
    const where = notificationIds
      ? { userId, id: { in: notificationIds } }
      : { userId };

    await prisma.notification.updateMany({
      where,
      data: { read: true },
    });

    console.log(`✅ Notifications marked as read for user ${userId}`);
  } catch (error) {
    console.error('Failed to mark notifications as read:', error);
  }
}

/**
 * Delete old notifications (cleanup)
 */
export async function deleteOldNotifications(daysOld: number = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    console.log(`✅ Deleted ${result.count} old notifications`);
    return result.count;
  } catch (error) {
    console.error('Failed to delete old notifications:', error);
  }
}

/**
 * Get user's recent notifications
 */
export async function getRecentNotifications(userId: string, limit: number = 20) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return notifications;
  } catch (error) {
    console.error('Failed to get recent notifications:', error);
    return [];
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return count;
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }
}
