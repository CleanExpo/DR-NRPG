'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getNrpgCalloutSplit } from '@/lib/pricing/nrpg-callout';
import { GA4_EVENTS, trackEventOnce } from '@/lib/analytics';

interface CalloutCheckoutPanelProps {
  requestId: string;
  status?: string;
  sessionId?: string;
}

export function CalloutCheckoutPanel({ requestId, status, sessionId }: CalloutCheckoutPanelProps) {
  const split = useMemo(() => getNrpgCalloutSplit(), []);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paid, setPaid] = useState<boolean | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const startCheckout = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/service-requests/${requestId}/callout/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (!response.ok || !data?.url) {
        throw new Error(data?.message || data?.error || 'Failed to start checkout');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Failed to start checkout:', error);
      alert(error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async () => {
    try {
      setVerifying(true);
      const response = await fetch(`/api/service-requests/${requestId}/callout/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();
      if (response.ok && data?.success) {
        setPaid(Boolean(data.paid));
        if (data.paid && sessionId) {
          trackEventOnce(GA4_EVENTS.CALLOUT_PAID, sessionId, {
            event_category: 'Callout',
            value: split.total.totalAUD,
            currency: 'AUD',
          });
        }
        setPaymentStatus(data.paymentStatus ?? null);
      } else {
        throw new Error(data?.message || data?.error || 'Failed to verify payment');
      }
    } catch (error) {
      console.error('Failed to verify payment:', error);
      setPaid(null);
      setPaymentStatus(null);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (status === 'success' && sessionId) {
      void verifyPayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, sessionId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Initial Callout Payment</CardTitle>
        <CardDescription>
          Client pays NRPG AU${split.total.totalAUD.toLocaleString()} upfront. NRPG holds funds until the job is completed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Total (AUD)</span>
            <span className="font-medium">AU${split.total.totalAUD.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>GST ({split.total.gstInclusive ? 'included' : 'added'})</span>
            <span>AU${split.total.gstAUD.toLocaleString()}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>NRPG marketing &amp; advertising hold</span>
            <span className="font-medium">AU${split.platformFee.totalAUD.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Contractor entitlement (subject to KPI)</span>
            <span className="font-medium">AU${split.contractorEntitlement.totalAUD.toLocaleString()}</span>
          </div>
        </div>

        {status === 'success' && (
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium">Payment verification</div>
            <div className="text-muted-foreground">
              {verifying
                ? 'Verifying payment status...'
                : paid === true
                  ? `Paid (Stripe status: ${paymentStatus ?? 'paid'})`
                  : paid === false
                    ? `Not paid yet (Stripe status: ${paymentStatus ?? 'unknown'})`
                    : 'Unable to verify payment at this time.'}
            </div>
            {!verifying && (
              <Button variant="outline" className="mt-3" onClick={verifyPayment} disabled={!sessionId}>
                Re-check payment
              </Button>
            )}
          </div>
        )}

        {status === 'cancel' && (
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium">Checkout cancelled</div>
            <div className="text-muted-foreground">No payment was taken. You can try again when ready.</div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={startCheckout} disabled={loading}>
            {loading ? 'Starting checkout...' : `Pay AU$${split.total.totalAUD.toLocaleString()}`}
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = '/dashboard/client')}>
            Back to dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
