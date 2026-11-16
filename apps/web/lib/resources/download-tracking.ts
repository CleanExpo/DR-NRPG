/**
 * Download Tracking System
 *
 * Track PDF and resource downloads for analytics with:
 * - Download event logging
 * - User session tracking
 * - Analytics integration
 * - Rate limiting
 */

import { DownloadEvent } from './types';

/**
 * Track a resource download event
 */
export async function trackDownload(
  resourceId: string,
  userId?: string
): Promise<void> {
  const sessionId = getSessionId();
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined;
  const referrer = typeof window !== 'undefined' ? document.referrer : undefined;

  const downloadEvent: DownloadEvent = {
    resourceId,
    userId,
    sessionId,
    timestamp: new Date(),
    userAgent,
    referrer,
  };

  try {
    // Send to analytics API
    await fetch('/api/resources/track-download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(downloadEvent),
    });

    // Store in local storage for offline tracking
    storeDownloadEventLocally(downloadEvent);

    // The download is recorded by the site's own API above. Nothing is sent
    // to Google from here: the resource id is a record id.
  } catch (error) {
    console.error('Failed to track download:', error);
    // Still allow download even if tracking fails
  }
}

/**
 * Get or create session ID for tracking
 */
function getSessionId(): string {
  if (typeof window === 'undefined') {
    return 'server-session';
  }

  const STORAGE_KEY = 'nrpg_session_id';
  let sessionId = sessionStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Store download event locally for offline tracking
 */
function storeDownloadEventLocally(event: DownloadEvent): void {
  if (typeof window === 'undefined') return;

  const STORAGE_KEY = 'nrpg_download_events';
  const stored = localStorage.getItem(STORAGE_KEY);
  const events: DownloadEvent[] = stored ? JSON.parse(stored) : [];

  events.push(event);

  // Keep only last 50 events
  if (events.length > 50) {
    events.shift();
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

/**
 * Get download analytics for a resource
 */
export async function getResourceDownloadStats(
  resourceId: string
): Promise<{
  totalDownloads: number;
  uniqueUsers: number;
  last7Days: number;
  last30Days: number;
}> {
  try {
    const response = await fetch(`/api/resources/${resourceId}/download-stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch download stats');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to get download stats:', error);
    return {
      totalDownloads: 0,
      uniqueUsers: 0,
      last7Days: 0,
      last30Days: 0,
    };
  }
}

/**
 * Check if user has recently downloaded this resource (rate limiting)
 */
export function hasRecentlyDownloaded(
  resourceId: string,
  windowMinutes: number = 5
): boolean {
  if (typeof window === 'undefined') return false;

  const STORAGE_KEY = 'nrpg_download_events';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return false;

  const events: DownloadEvent[] = JSON.parse(stored);
  const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);

  return events.some(
    (event) =>
      event.resourceId === resourceId &&
      new Date(event.timestamp) > cutoff
  );
}

/**
 * Batch sync local download events to server
 */
export async function syncDownloadEvents(): Promise<void> {
  if (typeof window === 'undefined') return;

  const STORAGE_KEY = 'nrpg_download_events';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;

  const events: DownloadEvent[] = JSON.parse(stored);
  if (events.length === 0) return;

  try {
    await fetch('/api/resources/sync-downloads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    });

    // Clear synced events
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to sync download events:', error);
  }
}
