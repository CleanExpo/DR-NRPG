/**
 * Analytics Event Processor
 *
 * Processes platform events in real-time and updates metrics
 * Handles Socket.io events and converts them to analytics data
 */

import { io } from 'socket.io-client';
import { Redis } from '@upstash/redis';
import { getUpstashRestConfig } from '@/lib/redis/upstash-config';
import { calculateDailyMetrics, calculatePercentageChange } from './metrics-engine';

export interface PlatformEvent {
  type:
    | 'payment:created'
    | 'payment:succeeded'
    | 'payment:failed'
    | 'booking:completed'
    | 'job:requested'
    | 'contractor:joined'
    | 'client:joined'
    | 'message:sent';
  userId?: string;
  data: Record<string, any>;
  timestamp: Date;
}

export interface MetricsCache {
  date: string;
  snapshot: any;
  lastUpdated: number;
}

class EventProcessor {
  private redis: Redis | null = null;
  private metricsCache: Map<string, MetricsCache> = new Map();
  private CACHE_TTL = 3600; // 1 hour in seconds
  private DAILY_CACHE_KEY = 'metrics:daily:';

  constructor() {
    this.initializeRedis();
  }

  private initializeRedis() {
    // Initialize Redis if available
    // Skip unusable values such as the "[SENSITIVE]" placeholder (DR-1011).
    const config = getUpstashRestConfig();
    if (config) {
      try {
        this.redis = new Redis(config);
      } catch (error) {
        console.error('Failed to initialize Redis:', error);
      }
    }
  }

  /**
   * Process an analytics event
   */
  async processEvent(event: PlatformEvent): Promise<void> {
    try {
      // Store in cache for immediate retrieval
      await this.cacheEvent(event);

      // Emit to real-time dashboard subscribers
      await this.emitToSubscribers(event);

      // Queue for aggregation if needed
      await this.queueForAggregation(event);
    } catch (error) {
      console.error('Error processing analytics event:', error);
    }
  }

  /**
   * Cache event in Redis for fast retrieval
   */
  private async cacheEvent(event: PlatformEvent): Promise<void> {
    const date = new Date(event.timestamp);
    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const cacheKey = `${this.DAILY_CACHE_KEY}${dateKey}`;

    if (!this.redis) return;

    try {
      // Store event in Redis
      await this.redis.lpush(cacheKey, JSON.stringify(event));

      // Set expiry
      await this.redis.expire(cacheKey, this.CACHE_TTL);
    } catch (error) {
      console.error('Error caching event:', error);
    }
  }

  /**
   * Emit event to real-time subscribers
   */
  private async emitToSubscribers(event: PlatformEvent): Promise<void> {
    try {
      // This would connect to Socket.io server to emit real-time updates
      // For now, we log the event
      console.log(`[Analytics] Event processed:`, {
        type: event.type,
        timestamp: event.timestamp,
        dataKeys: Object.keys(event.data),
      });
    } catch (error) {
      console.error('Error emitting to subscribers:', error);
    }
  }

  /**
   * Queue event for periodic aggregation
   */
  private async queueForAggregation(event: PlatformEvent): Promise<void> {
    const date = new Date(event.timestamp);
    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    if (!this.redis) return;

    try {
      await this.redis.lpush('analytics:events:queue', JSON.stringify({ event, dateKey }));
    } catch (error) {
      console.error('Error queueing event:', error);
    }
  }

  /**
   * Get cached metrics for a date
   */
  async getCachedMetrics(date: Date): Promise<any | null> {
    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const cacheKey = `${this.DAILY_CACHE_KEY}${dateKey}`;

    // Check in-memory cache first
    const cached = this.metricsCache.get(dateKey);
    if (cached && Date.now() - cached.lastUpdated < this.CACHE_TTL * 1000) {
      return cached.snapshot;
    }

    // Check Redis cache
    if (!this.redis) return null;

    try {
      const redisData = await this.redis.get(cacheKey);
      if (redisData) {
        const parsed = typeof redisData === 'string' ? JSON.parse(redisData) : redisData;

        // Update in-memory cache
        this.metricsCache.set(dateKey, {
          date: dateKey,
          snapshot: parsed,
          lastUpdated: Date.now(),
        });

        return parsed;
      }
    } catch (error) {
      console.error('Error retrieving cached metrics:', error);
    }

    return null;
  }

  /**
   * Clear cache for a date (useful after aggregation)
   */
  async clearCache(date: Date): Promise<void> {
    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const cacheKey = `${this.DAILY_CACHE_KEY}${dateKey}`;

    this.metricsCache.delete(dateKey);

    if (!this.redis) return;

    try {
      await this.redis.del(cacheKey);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get pending events for aggregation
   */
  async getPendingEvents(limit = 100): Promise<any[]> {
    if (!this.redis) return [];

    try {
      const events = await this.redis.lrange('analytics:events:queue', 0, limit - 1);
      return events.map((e) => (typeof e === 'string' ? JSON.parse(e) : e));
    } catch (error) {
      console.error('Error getting pending events:', error);
      return [];
    }
  }

  /**
   * Remove processed events from queue
   */
  async removePendingEvents(count: number): Promise<void> {
    if (!this.redis) return;

    try {
      for (let i = 0; i < count; i++) {
        await this.redis.rpop('analytics:events:queue');
      }
    } catch (error) {
      console.error('Error removing pending events:', error);
    }
  }
}

// Export singleton instance
export const eventProcessor = new EventProcessor();

/**
 * Record an analytics event to be processed
 */
export async function recordAnalyticsEvent(
  type: PlatformEvent['type'],
  data: Record<string, any>,
  userId?: string
): Promise<void> {
  const event: PlatformEvent = {
    type,
    userId,
    data,
    timestamp: new Date(),
  };

  await eventProcessor.processEvent(event);
}

/**
 * Record payment event
 */
export async function recordPaymentEvent(
  eventType: 'created' | 'succeeded' | 'failed',
  paymentData: any
): Promise<void> {
  await recordAnalyticsEvent(`payment:${eventType}` as any, paymentData);
}

/**
 * Record booking completion event
 */
export async function recordBookingCompleted(
  bookingId: string,
  contractorId: string,
  finalPrice: number
): Promise<void> {
  await recordAnalyticsEvent('booking:completed', {
    bookingId,
    contractorId,
    finalPrice,
  });
}

/**
 * Record job request event
 */
export async function recordJobRequested(
  serviceRequestId: string,
  clientId: string,
  serviceType: string,
  estimatedValue: number
): Promise<void> {
  await recordAnalyticsEvent('job:requested', {
    serviceRequestId,
    clientId,
    serviceType,
    estimatedValue,
  });
}

/**
 * Record contractor joined event
 */
export async function recordContractorJoined(
  contractorId: string,
  businessName: string,
  serviceAreas: string[]
): Promise<void> {
  await recordAnalyticsEvent('contractor:joined', {
    contractorId,
    businessName,
    serviceAreas,
  });
}

/**
 * Record client joined event
 */
export async function recordClientJoined(clientId: string, email: string): Promise<void> {
  await recordAnalyticsEvent('client:joined', {
    clientId,
    email,
  });
}
