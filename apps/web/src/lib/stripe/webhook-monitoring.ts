/**
 * Stripe Webhook Monitoring and Alerting
 *
 * Monitors webhook processing failures and provides alerting mechanisms
 * for critical payment events that need immediate attention.
 *
 * Features:
 * - Failed event tracking and analysis
 * - Severity levels for alerts
 * - Alert thresholds (e.g., 3+ failures in 5 minutes)
 * - Integration points for email/SMS notifications
 * - Dashboard queries for monitoring UI
 */

import { prisma } from '@/lib/prisma';
import { sendWebhookFailureSlackAlert, sendHighErrorRateSlackAlert } from '../../../lib/monitoring/slack-alerts';
import { sendSystemHealthEmailAlert } from '../../../lib/monitoring/email-alerts';

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  INFO = 'INFO', // Informational, no action needed
  WARNING = 'WARNING', // Warning, monitor situation
  CRITICAL = 'CRITICAL', // Critical, immediate action required
}

/**
 * Alert types
 */
export enum AlertType {
  PAYMENT_PROCESSING_FAILED = 'PAYMENT_PROCESSING_FAILED',
  SUBSCRIPTION_UPDATE_FAILED = 'SUBSCRIPTION_UPDATE_FAILED',
  HIGH_FAILURE_RATE = 'HIGH_FAILURE_RATE',
  REPEATED_FAILURES = 'REPEATED_FAILURES',
  CHECKOUT_SESSION_FAILED = 'CHECKOUT_SESSION_FAILED',
  PAYMENT_INTENT_FAILED = 'PAYMENT_INTENT_FAILED',
}

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  failureThreshold: number; // Number of failures to trigger alert
  timeWindowMinutes: number; // Time window for counting failures
  alertSeverity: AlertSeverity;
  alertType: AlertType;
}

/**
 * Default monitoring configurations
 */
export const MONITORING_CONFIGS: Record<string, MonitoringConfig> = {
  // Alert if 3 payment failures in 5 minutes
  paymentFailures: {
    failureThreshold: 3,
    timeWindowMinutes: 5,
    alertSeverity: AlertSeverity.CRITICAL,
    alertType: AlertType.PAYMENT_PROCESSING_FAILED,
  },

  // Alert if any subscription update fails
  subscriptionUpdateFailures: {
    failureThreshold: 1,
    timeWindowMinutes: 1,
    alertSeverity: AlertSeverity.WARNING,
    alertType: AlertType.SUBSCRIPTION_UPDATE_FAILED,
  },

  // Alert if 5+ failures in 10 minutes (high failure rate)
  highFailureRate: {
    failureThreshold: 5,
    timeWindowMinutes: 10,
    alertSeverity: AlertSeverity.CRITICAL,
    alertType: AlertType.HIGH_FAILURE_RATE,
  },

  // Alert if same event ID fails multiple times
  repeatedFailures: {
    failureThreshold: 2,
    timeWindowMinutes: 60,
    alertSeverity: AlertSeverity.WARNING,
    alertType: AlertType.REPEATED_FAILURES,
  },
};

/**
 * Check if a failure threshold has been exceeded
 *
 * @param eventType - Type of event (checkout.session.completed, etc.)
 * @param config - Monitoring configuration
 * @returns true if threshold exceeded, false otherwise
 */
export async function checkFailureThreshold(
  eventType: string,
  config: MonitoringConfig
): Promise<boolean> {
  const timeWindowStart = new Date(Date.now() - config.timeWindowMinutes * 60 * 1000);

  const failureCount = await prisma.stripeWebhookEvent.count({
    where: {
      eventType,
      processed: false, // Only count failed events
      processedAt: {
        gte: timeWindowStart,
      },
    },
  });

  return failureCount >= config.failureThreshold;
}

/**
 * Log an alert for a webhook failure
 * This records the alert so it can be queried, sent to external services, etc.
 *
 * @param alertType - Type of alert
 * @param severity - Alert severity
 * @param message - Alert message
 * @param metadata - Optional additional data
 */
export async function logAlert(
  alertType: AlertType,
  severity: AlertSeverity,
  message: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    console.warn(`[${severity}] ${alertType}: ${message}`, metadata);

    // Send alerts to Slack
    if (alertType === AlertType.HIGH_FAILURE_RATE) {
      await sendHighErrorRateSlackAlert({
        errorRate: (metadata?.stats as any)?.failureRate ? parseFloat((metadata?.stats as any).failureRate) : 0,
        threshold: 5,
        errorCount: (metadata?.stats as any)?.totalFailed || 0,
        timeWindow: `${(metadata?.stats as any)?.timeWindowMinutes || 5} minutes`,
      });
    } else if (
      alertType === AlertType.PAYMENT_PROCESSING_FAILED ||
      alertType === AlertType.PAYMENT_INTENT_FAILED ||
      alertType === AlertType.CHECKOUT_SESSION_FAILED
    ) {
      await sendWebhookFailureSlackAlert({
        eventType: (metadata?.eventType as string) || 'unknown',
        failureCount: (metadata?.failureCount as number) || 0,
        errorMessage: message,
        webhookId: (metadata?.stripeEventId as string) || 'unknown',
      });
    }

    // Send critical alerts via email
    if (severity === AlertSeverity.CRITICAL) {
      await sendSystemHealthEmailAlert({
        alertType: 'WEBHOOK_FAILURES',
        metric: 'Webhook failure count',
        threshold: '5 failures in 10 minutes',
        currentValue: `${(metadata?.failureCount as number) || 0} failures`,
        duration: `${(metadata?.timeWindowMinutes as number) || 5} minutes`,
        affectedServices: ['Stripe Webhooks', 'Payment Processing'],
        severity: 'CRITICAL',
      });
    }
  } catch (error) {
    console.error('Error logging alert:', error);
  }
}

/**
 * Get failed webhook events for monitoring dashboard
 *
 * @param options - Query options
 * @returns List of failed webhook events
 */
export async function getFailedWebhookEvents(options: {
  limit?: number;
  offsetMinutes?: number;
  eventType?: string;
} = {}) {
  const limit = options.limit || 50;
  const offsetMinutes = options.offsetMinutes || 60;
  const timeWindowStart = new Date(Date.now() - offsetMinutes * 60 * 1000);

  return prisma.stripeWebhookEvent.findMany({
    where: {
      processed: false,
      ...(options.eventType && { eventType: options.eventType }),
      processedAt: {
        gte: timeWindowStart,
      },
    },
    orderBy: {
      processedAt: 'desc',
    },
    take: limit,
  });
}

/**
 * Get webhook event statistics for dashboard
 *
 * @param timeWindowMinutes - Time window for stats
 * @returns Statistics about webhook processing
 */
export async function getWebhookStats(timeWindowMinutes: number = 60) {
  const timeWindowStart = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

  const [totalProcessed, totalFailed, eventTypeStats] = await Promise.all([
    // Total processed events
    prisma.stripeWebhookEvent.count({
      where: {
        processedAt: {
          gte: timeWindowStart,
        },
      },
    }),

    // Total failed events
    prisma.stripeWebhookEvent.count({
      where: {
        processed: false,
        processedAt: {
          gte: timeWindowStart,
        },
      },
    }),

    // Stats by event type
    prisma.stripeWebhookEvent.groupBy({
      by: ['eventType', 'processed'],
      where: {
        processedAt: {
          gte: timeWindowStart,
        },
      },
      _count: true,
    }),
  ]);

  const failureRate = totalProcessed > 0 ? ((totalFailed / totalProcessed) * 100).toFixed(2) : '0';

  // Build event type breakdown
  const eventTypeBreakdown: Record<string, { succeeded: number; failed: number }> = {};
  for (const stat of eventTypeStats) {
    if (!eventTypeBreakdown[stat.eventType]) {
      eventTypeBreakdown[stat.eventType] = { succeeded: 0, failed: 0 };
    }
    if (stat.processed) {
      eventTypeBreakdown[stat.eventType].succeeded += stat._count;
    } else {
      eventTypeBreakdown[stat.eventType].failed += stat._count;
    }
  }

  return {
    timeWindowMinutes,
    totalProcessed,
    totalFailed,
    failureRate: `${failureRate}%`,
    eventTypeBreakdown,
  };
}

/**
 * Get summary of recent alerts
 *
 * @param limitMinutes - Look back this many minutes
 * @returns Alert summary
 */
export async function getAlertSummary(limitMinutes: number = 60) {
  const stats = await getWebhookStats(limitMinutes);
  const failedEvents = await getFailedWebhookEvents({
    offsetMinutes: limitMinutes,
    limit: 10,
  });

  return {
    stats,
    recentFailures: failedEvents.map((event) => ({
      id: event.id,
      stripeEventId: event.stripeEventId,
      eventType: event.eventType,
      errorMessage: event.errorMessage,
      processedAt: event.processedAt,
    })),
  };
}

/**
 * Check webhook health and trigger alerts if needed
 * This should be called periodically (e.g., every 5 minutes)
 *
 * @returns true if any critical alerts were triggered
 */
export async function checkWebhookHealth(): Promise<boolean> {
  let hasCriticalAlert = false;

  try {
    // Check for high failure rates
    const config = MONITORING_CONFIGS.highFailureRate;
    if (await checkFailureThreshold('', config)) {
      hasCriticalAlert = true;
      await logAlert(
        AlertType.HIGH_FAILURE_RATE,
        AlertSeverity.CRITICAL,
        `High webhook failure rate detected in last ${config.timeWindowMinutes} minutes`,
        await getAlertSummary(config.timeWindowMinutes)
      );
    }

    // Check for payment-specific failures
    const paymentTypes = [
      'checkout.session.completed',
      'payment_intent.succeeded',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
    ];

    for (const eventType of paymentTypes) {
      const timeWindowStart = new Date(Date.now() - 5 * 60 * 1000);
      const failureCount = await prisma.stripeWebhookEvent.count({
        where: {
          eventType,
          processed: false,
          processedAt: {
            gte: timeWindowStart,
          },
        },
      });

      if (failureCount >= 3) {
        hasCriticalAlert = true;
        await logAlert(
          AlertType.PAYMENT_PROCESSING_FAILED,
          AlertSeverity.CRITICAL,
          `${failureCount} payment event failures detected for ${eventType} in last 5 minutes`,
          { eventType, failureCount }
        );
      }
    }
  } catch (error) {
    console.error('Error checking webhook health:', error);
  }

  return hasCriticalAlert;
}

/**
 * Reset or acknowledge a failed webhook event
 * Used for manual intervention/retry from monitoring dashboard
 *
 * @param stripeEventId - Event ID to reset
 */
export async function retryFailedWebhookEvent(stripeEventId: string): Promise<boolean> {
  try {
    // Delete the failed event record to allow Stripe to retry it
    await prisma.stripeWebhookEvent.delete({
      where: { stripeEventId },
    });

    console.info(`Reset webhook event ${stripeEventId} for retry`);
    return true;
  } catch (error) {
    console.error('Error resetting webhook event %s:', stripeEventId, error);
    return false;
  }
}
