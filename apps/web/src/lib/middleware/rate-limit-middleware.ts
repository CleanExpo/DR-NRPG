import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/net/client-ip';
import { AdvancedRateLimiter } from '@/lib/security/advanced-rate-limiting';
import { EnhancedAuditLogger, AUDIT_ACTIONS_EXPORT } from '@/lib/security/enhanced-audit-logging';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Rate Limiting Middleware
 *
 * Middleware to apply rate limiting to API routes
 */

const ACTION_MAPPING: Record<string, string> = {
  '/api/chat/messages': 'message:send',
  '/api/chat/messages/[messageId]/reactions': 'reaction:add',
  '/api/chat/messages/[messageId]/edit': 'message:edit',
  '/api/auth/login': 'auth:login',
  '/api/auth/register': 'auth:register',
  '/api/files/upload': 'file:upload',
};

export async function rateLimitMiddleware(
  req: NextRequest,
  action?: string
): Promise<{
  allowed: boolean;
  response?: NextResponse;
  rateLimitInfo?: any;
}> {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'anonymous';
    const userEmail = session?.user?.email;

    // Get client IP
    const ipAddress = getClientIp(req);

    // Determine action from route or parameter
    const route = req.nextUrl.pathname;
    const method = req.method;
    const actionKey = action || ACTION_MAPPING[route] || `${method}:${route}`;

    // Check IP-based global limit first
    const globalLimit = await AdvancedRateLimiter.checkIPGlobalLimit(ipAddress);

    if (!globalLimit.success) {
      // Log rate limit event
      await EnhancedAuditLogger.logSecurityEvent(
        userId,
        AUDIT_ACTIONS_EXPORT.SECURITY_RATE_LIMIT,
        ipAddress,
        {
          route,
          action: actionKey,
          reason: 'Global IP limit exceeded',
        }
      );

      return {
        allowed: false,
        response: NextResponse.json(
          {
            error: 'Too many requests from this IP',
            retryAfter: globalLimit.retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(globalLimit.retryAfter || 60),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(
                Date.now() + (globalLimit.resetAfter * 1000)
              ).toISOString(),
            },
          }
        ),
      };
    }

    // Check action-specific rate limit
    const actionLimit = await AdvancedRateLimiter.checkLimit(
      actionKey,
      userId,
      ipAddress
    );

    if (!actionLimit.success) {
      // Log rate limit event
      await EnhancedAuditLogger.logSecurityEvent(
        userId,
        AUDIT_ACTIONS_EXPORT.SECURITY_RATE_LIMIT,
        ipAddress,
        {
          route,
          action: actionKey,
          reason: 'Action rate limit exceeded',
        }
      );

      return {
        allowed: false,
        response: NextResponse.json(
          {
            error: 'Too many requests. Please try again later.',
            retryAfter: actionLimit.retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(actionLimit.retryAfter || 60),
              'X-RateLimit-Limit': '100',
              'X-RateLimit-Remaining': String(actionLimit.remaining),
              'X-RateLimit-Reset': new Date(
                Date.now() + (actionLimit.resetAfter * 1000)
              ).toISOString(),
            },
          }
        ),
      };
    }

    // Allowed, return rate limit info for response headers
    return {
      allowed: true,
      rateLimitInfo: {
        limit: 100,
        remaining: actionLimit.remaining,
        reset: new Date(Date.now() + actionLimit.resetAfter * 1000).toISOString(),
      },
    };
  } catch (error) {
    console.error('Rate limit middleware error:', error);
    // Fail open - allow request on error
    return { allowed: true };
  }
}

/**
 * Higher-order function to wrap API routes with rate limiting
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  action?: string
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const { allowed, response, rateLimitInfo } = await rateLimitMiddleware(req, action);

    if (!allowed) {
      return response!;
    }

    // Call the actual handler
    const apiResponse = await handler(req);

    // Add rate limit headers to response
    if (rateLimitInfo) {
      apiResponse.headers.set('X-RateLimit-Limit', String(rateLimitInfo.limit));
      apiResponse.headers.set('X-RateLimit-Remaining', String(rateLimitInfo.remaining));
      apiResponse.headers.set('X-RateLimit-Reset', rateLimitInfo.reset);
    }

    return apiResponse;
  };
}
