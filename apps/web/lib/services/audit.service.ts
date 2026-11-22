/**
 * Audit Logging Service
 * Logs security events for compliance, forensics, and security monitoring
 *
 * Logged Events:
 * - Authentication (login success/failure, logout)
 * - Password changes and resets
 * - Account lockouts
 * - 2FA setup/changes
 * - Resource access (bookings, payments, profiles)
 * - Admin actions (user management, permissions)
 * - System changes (configuration, settings)
 */

import { prisma } from '@/lib/prisma';

export type AuditAction =
  // Authentication
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGIN_LOCKED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET'
  | 'ACCOUNT_LOCKED'
  | '2FA_ENABLED'
  | '2FA_DISABLED'
  // Resource Operations
  | 'RESOURCE_ACCESSED'
  | 'RESOURCE_CREATED'
  | 'RESOURCE_UPDATED'
  | 'RESOURCE_DELETED'
  | 'PERMISSION_CHANGED'
  | 'ADMIN_ACTION'
  // User Management (Admin)
  | 'USER_ROLE_CHANGED'
  | 'USER_DEACTIVATED'
  | 'USER_REACTIVATED'
  | 'USER_DELETED'
  // Contractor Verification (Admin)
  | 'CONTRACTOR_APPROVED'
  | 'CONTRACTOR_REJECTED'
  | 'CONTRACTOR_INFO_REQUESTED'
  | 'CONTRACTOR_SUSPENDED'
  | 'CONTRACTOR_REINSTATED'
  // Claims & Bookings (Admin)
  | 'CLAIM_CONVERTED'
  | 'CLAIM_ASSIGNED'
  | 'BOOKING_REASSIGNED'
  | 'BOOKING_CANCELLED'
  // Payments (Admin)
  | 'PAYMENT_REFUNDED'
  | 'PAYOUT_INITIATED'
  | 'DISPUTE_RESOLVED';

export interface AuditLogEntry {
  userId: string;
  action: AuditAction;
  resourceId?: string;
  resourceType?: string;
  status: 'SUCCESS' | 'FAILURE';
  details?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

/**
 * Log a security event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<boolean> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        resourceId: entry.resourceId,
        resourceType: entry.resourceType,
        status: entry.status,
        details: entry.details ? JSON.stringify(entry.details) : null,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    });

    return true;
  } catch (error) {
    console.error('Error logging audit event:', error);
    return false;
  }
}

/**
 * Log login attempt
 */
export async function logLoginAttempt(
  userId: string,
  success: boolean,
  ipAddress: string,
  userAgent: string,
  details?: Record<string, any>
): Promise<boolean> {
  return logAuditEvent({
    userId,
    action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE',
    status: 'SUCCESS',
    ipAddress,
    userAgent,
    details,
  });
}

/**
 * Log account lockout
 */
export async function logAccountLockout(
  userId: string,
  ipAddress: string,
  userAgent: string,
  attemptCount?: number
): Promise<boolean> {
  return logAuditEvent({
    userId,
    action: 'ACCOUNT_LOCKED',
    status: 'SUCCESS',
    ipAddress,
    userAgent,
    details: { attemptCount },
  });
}

/**
 * Log password change
 */
export async function logPasswordChange(
  userId: string,
  ipAddress: string,
  userAgent: string,
  changeType: 'PASSWORD_CHANGED' | 'PASSWORD_RESET' = 'PASSWORD_CHANGED'
): Promise<boolean> {
  return logAuditEvent({
    userId,
    action: changeType,
    status: 'SUCCESS',
    ipAddress,
    userAgent,
  });
}

/**
 * Log 2FA change
 */
export async function log2FAChange(
  userId: string,
  action: '2FA_ENABLED' | '2FA_DISABLED',
  ipAddress: string,
  userAgent: string
): Promise<boolean> {
  return logAuditEvent({
    userId,
    action,
    status: 'SUCCESS',
    ipAddress,
    userAgent,
  });
}

/**
 * Log resource access
 */
export async function logResourceAccess(
  userId: string,
  resourceType: string,
  resourceId: string,
  action: 'ACCESSED' | 'CREATED' | 'UPDATED' | 'DELETED',
  success: boolean,
  ipAddress: string,
  userAgent: string,
  details?: Record<string, any>
): Promise<boolean> {
  const actionMap: Record<string, AuditAction> = {
    ACCESSED: 'RESOURCE_ACCESSED',
    CREATED: 'RESOURCE_CREATED',
    UPDATED: 'RESOURCE_UPDATED',
    DELETED: 'RESOURCE_DELETED',
  };

  return logAuditEvent({
    userId,
    action: actionMap[action] || 'RESOURCE_ACCESSED',
    resourceId,
    resourceType,
    status: success ? 'SUCCESS' : 'FAILURE',
    ipAddress,
    userAgent,
    details,
  });
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<any[]> {
  try {
    return await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  } catch (error) {
    console.error('Error getting user audit logs:', error);
    return [];
  }
}

/**
 * Get audit logs for a resource
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId: string,
  limit: number = 50
): Promise<any[]> {
  try {
    return await prisma.auditLog.findMany({
      where: {
        resourceType,
        resourceId,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('Error getting resource audit logs:', error);
    return [];
  }
}

/**
 * Get audit logs for a specific action
 */
export async function getAuditLogsByAction(
  action: AuditAction,
  limit: number = 50,
  hoursAgo: number = 24
): Promise<any[]> {
  try {
    const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    return await prisma.auditLog.findMany({
      where: {
        action,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error getting audit logs by action:', error);
    return [];
  }
}

/**
 * Get failed login attempts
 */
export async function getFailedLoginAttempts(
  hoursAgo: number = 24,
  limit: number = 100
): Promise<any[]> {
  return getAuditLogsByAction('LOGIN_FAILURE', limit, hoursAgo);
}

/**
 * Get account lockouts
 */
export async function getAccountLockouts(
  hoursAgo: number = 24,
  limit: number = 50
): Promise<any[]> {
  return getAuditLogsByAction('ACCOUNT_LOCKED', limit, hoursAgo);
}

/**
 * Get suspicious activity (multiple failed logins from same IP)
 */
export async function getSuspiciousActivity(hoursAgo: number = 24): Promise<
  Array<{
    ipAddress: string;
    failedAttempts: number;
    users: string[];
    lastAttempt: Date;
  }>
> {
  try {
    const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    const result = await prisma.auditLog.groupBy({
      by: ['ipAddress'],
      where: {
        action: 'LOGIN_FAILURE',
        createdAt: { gte: since },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Get details for each IP
    const suspicious: Array<{ ipAddress: string; failedAttempts: number; users: string[]; lastAttempt: Date }> = [];
    for (const record of result) {
      if ((record._count.id || 0) >= 5) {
        // 5+ failed attempts from same IP
        const logs = await prisma.auditLog.findMany({
          where: {
            ipAddress: record.ipAddress,
            action: 'LOGIN_FAILURE',
            createdAt: { gte: since },
          },
          select: { userId: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        });

        const users = [...new Set(logs.map((l) => l.userId).filter(Boolean))] as string[];

        suspicious.push({
          ipAddress: record.ipAddress,
          failedAttempts: record._count.id || 0,
          users,
          lastAttempt: logs[0]?.createdAt || new Date(),
        });
      }
    }

    return suspicious;
  } catch (error) {
    console.error('Error getting suspicious activity:', error);
    return [];
  }
}

/**
 * Get audit log summary for dashboard
 */
export async function getAuditSummary(hoursAgo: number = 24): Promise<{
  totalEvents: number;
  loginAttempts: number;
  failedLogins: number;
  accountLockouts: number;
  passwordChanges: number;
  suspiciousActivities: number;
}> {
  try {
    const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    const [total, loginSuccess, loginFail, lockouts, passwordChanges] =
      await Promise.all([
        prisma.auditLog.count({
          where: { createdAt: { gte: since } },
        }),
        prisma.auditLog.count({
          where: {
            action: 'LOGIN_SUCCESS',
            createdAt: { gte: since },
          },
        }),
        prisma.auditLog.count({
          where: {
            action: 'LOGIN_FAILURE',
            createdAt: { gte: since },
          },
        }),
        prisma.auditLog.count({
          where: {
            action: 'ACCOUNT_LOCKED',
            createdAt: { gte: since },
          },
        }),
        prisma.auditLog.count({
          where: {
            action: {
              in: ['PASSWORD_CHANGED', 'PASSWORD_RESET'],
            },
            createdAt: { gte: since },
          },
        }),
      ]);

    const suspicious = await getSuspiciousActivity(hoursAgo);

    return {
      totalEvents: total,
      loginAttempts: loginSuccess + loginFail,
      failedLogins: loginFail,
      accountLockouts: lockouts,
      passwordChanges: passwordChanges,
      suspiciousActivities: suspicious.length,
    };
  } catch (error) {
    console.error('Error getting audit summary:', error);
    return {
      totalEvents: 0,
      loginAttempts: 0,
      failedLogins: 0,
      accountLockouts: 0,
      passwordChanges: 0,
      suspiciousActivities: 0,
    };
  }
}

/**
 * Clean up old audit logs (retention policy)
 * Keep logs for 90 days by default
 */
export async function cleanupOldAuditLogs(daysToKeep: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    return result.count;
  } catch (error) {
    console.error('Error cleaning up audit logs:', error);
    return 0;
  }
}

// ============================================================================
// Helper Functions for Request Context
// ============================================================================

import { NextRequest } from 'next/server';
import { getClientIp } from '@/lib/net/client-ip';

/**
 * Extract IP address from NextRequest
 */
export function getIpFromRequest(request: NextRequest): string {
  return getClientIp(request);
}

/**
 * Extract user agent from NextRequest
 */
export function getUserAgentFromRequest(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Log audit event from request context
 * Automatically extracts IP and user agent from the request
 */
export async function logAuditFromRequest(
  request: NextRequest,
  entry: Omit<AuditLogEntry, 'ipAddress' | 'userAgent'>
): Promise<boolean> {
  return logAuditEvent({
    ...entry,
    ipAddress: getIpFromRequest(request),
    userAgent: getUserAgentFromRequest(request),
  });
}

// ============================================================================
// Admin Action Helpers
// ============================================================================

/**
 * Log contractor verification action
 */
export async function logContractorVerification(
  request: NextRequest,
  adminUserId: string,
  contractorId: string,
  action: 'CONTRACTOR_APPROVED' | 'CONTRACTOR_REJECTED' | 'CONTRACTOR_INFO_REQUESTED' | 'CONTRACTOR_SUSPENDED' | 'CONTRACTOR_REINSTATED',
  reason?: string,
  details?: Record<string, unknown>
): Promise<boolean> {
  return logAuditFromRequest(request, {
    userId: adminUserId,
    action,
    resourceId: contractorId,
    resourceType: 'CONTRACTOR',
    status: 'SUCCESS',
    details: { reason, ...details },
  });
}

/**
 * Log user management action
 */
export async function logUserManagement(
  request: NextRequest,
  adminUserId: string,
  targetUserId: string,
  action: 'USER_ROLE_CHANGED' | 'USER_DEACTIVATED' | 'USER_REACTIVATED' | 'USER_DELETED' | 'RESOURCE_UPDATED',
  details?: Record<string, unknown>
): Promise<boolean> {
  return logAuditFromRequest(request, {
    userId: adminUserId,
    action,
    resourceId: targetUserId,
    resourceType: 'USER',
    status: 'SUCCESS',
    details,
  });
}

/**
 * Log claim/booking action
 */
export async function logClaimAction(
  request: NextRequest,
  adminUserId: string,
  resourceId: string,
  action: 'CLAIM_CONVERTED' | 'CLAIM_ASSIGNED' | 'BOOKING_REASSIGNED' | 'BOOKING_CANCELLED',
  details?: Record<string, unknown>
): Promise<boolean> {
  return logAuditFromRequest(request, {
    userId: adminUserId,
    action,
    resourceId,
    resourceType: action.startsWith('CLAIM') ? 'CLAIM' : 'BOOKING',
    status: 'SUCCESS',
    details,
  });
}

/**
 * Log payment action
 */
export async function logPaymentAction(
  request: NextRequest,
  adminUserId: string,
  paymentId: string,
  action: 'PAYMENT_REFUNDED' | 'PAYOUT_INITIATED' | 'DISPUTE_RESOLVED',
  details?: Record<string, unknown>
): Promise<boolean> {
  return logAuditFromRequest(request, {
    userId: adminUserId,
    action,
    resourceId: paymentId,
    resourceType: action.includes('DISPUTE') ? 'DISPUTE' : 'PAYMENT',
    status: 'SUCCESS',
    details,
  });
}

/**
 * Get recent admin actions for dashboard
 */
export async function getRecentAdminActions(limit: number = 20): Promise<Array<{
  id: string;
  userId: string;
  action: string;
  resourceId: string | null;
  resourceType: string | null;
  status: string;
  details: string | null;
  createdAt: Date;
  user: { name: string | null; email: string } | null;
}>> {
  try {
    const adminActions: AuditAction[] = [
      'USER_ROLE_CHANGED',
      'USER_DEACTIVATED',
      'USER_REACTIVATED',
      'USER_DELETED',
      'CONTRACTOR_APPROVED',
      'CONTRACTOR_REJECTED',
      'CONTRACTOR_INFO_REQUESTED',
      'CONTRACTOR_SUSPENDED',
      'CONTRACTOR_REINSTATED',
      'CLAIM_CONVERTED',
      'CLAIM_ASSIGNED',
      'BOOKING_REASSIGNED',
      'BOOKING_CANCELLED',
      'PAYMENT_REFUNDED',
      'PAYOUT_INITIATED',
      'DISPUTE_RESOLVED',
      'ADMIN_ACTION',
    ];

    return await prisma.auditLog.findMany({
      where: {
        action: { in: adminActions },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        userId: true,
        action: true,
        resourceId: true,
        resourceType: true,
        status: true,
        details: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error getting recent admin actions:', error);
    return [];
  }
}
