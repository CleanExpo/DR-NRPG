'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GA4_EVENTS, trackEventOnce } from '@/lib/analytics';

type CertificationStatus = { configured: boolean; paid: boolean; sessionPaid: boolean };

/**
 * Wave 1 CTA for the NRPG certification purchase. The price lives in Stripe,
 * so no amount is shown here. When checkout is not configured the panel shows
 * a "not available yet" state instead of a button.
 */
export function CertificationCheckoutPanel() {
  const [status, setStatus] = useState<CertificationStatus | null>(null);
  // Stripe return URL: ?certification=success|cancel&session_id=...
  const [returnStatus, setReturnStatus] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setLoadError(false);
    try {
      // On a Stripe return, ask the server to confirm THIS session is the user's paid checkout.
      const params = new URLSearchParams(window.location.search);
      const returnedSession = params.get('certification') === 'success' ? params.get('session_id') : null;
      const query = returnedSession ? `?session_id=${encodeURIComponent(returnedSession)}` : '';
      const response = await fetch(`/api/training/certification/checkout${query}`);
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error('status unavailable');
      setStatus({
        configured: Boolean(data.configured),
        paid: Boolean(data.paid),
        sessionPaid: Boolean(data.sessionPaid),
      });
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReturnStatus(params.get('certification'));
    setSessionId(params.get('session_id'));
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (returnStatus === 'success' && sessionId && status?.sessionPaid) {
      trackEventOnce(GA4_EVENTS.CERTIFICATION_PURCHASE, sessionId, { event_category: 'Certification' });
    }
  }, [returnStatus, sessionId, status?.sessionPaid]);

  const startCheckout = async () => {
    setStarting(true);
    setStartError(null);
    try {
      const response = await fetch('/api/training/certification/checkout', { method: 'POST' });
      const data = await response.json();
      if (response.status === 503) {
        setStatus((prev) => ({ paid: prev?.paid ?? false, sessionPaid: false, configured: false }));
        return;
      }
      if (!response.ok || !data?.url) {
        throw new Error(data?.message || 'Failed to start checkout');
      }
      window.location.href = data.url;
    } catch (error) {
      setStartError(error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setStarting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>NRPG Certification</CardTitle>
        <CardDescription>
          The NRPG certification programme covers the 24 training modules required before you can receive jobs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {returnStatus === 'cancel' && (
          <p className="text-muted-foreground">Checkout cancelled. No payment was taken.</p>
        )}

        {loadError ? (
          <div className="space-y-2">
            <p>Unable to load certification status.</p>
            <Button variant="outline" onClick={() => void loadStatus()}>
              Retry
            </Button>
          </div>
        ) : !status ? (
          <p className="text-muted-foreground" aria-live="polite">Loading certification status...</p>
        ) : status.paid ? (
          <p>Certification purchased. Your training modules are unlocked.</p>
        ) : returnStatus === 'success' ? (
          <div className="space-y-2">
            <p>Payment received by Stripe. Confirming your purchase...</p>
            <Button variant="outline" onClick={() => void loadStatus()}>
              Re-check
            </Button>
          </div>
        ) : !status.configured ? (
          <p className="text-muted-foreground">Certification checkout is not available yet. Please check back soon.</p>
        ) : (
          <div className="space-y-2">
            <Button onClick={startCheckout} disabled={starting}>
              {starting ? 'Starting checkout...' : 'Purchase certification'}
            </Button>
            {startError && <p role="alert">{startError}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
