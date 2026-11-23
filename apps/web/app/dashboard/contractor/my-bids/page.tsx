'use client';

/**
 * DR-947: contractors are sent here after submitting a bid, and the "bid accepted"
 * email links here. The page did not exist, so a contractor's first bid ended on a 404.
 *
 * Reads GET /api/contractor/my-bids ({ success, data: ContractorMatch[] }). A failed
 * load says so; it never shows as "no bids yet".
 */

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface MyBid {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
  contractorMessage?: string | null;
  serviceRequest?: {
    serviceTitle?: string | null;
    location?: string | null;
    urgency?: string | null;
  } | null;
}

const STATUS_LABEL: Record<MyBid['status'], string> = {
  PENDING: 'Awaiting response',
  ACCEPTED: 'Accepted',
  REJECTED: 'Not accepted',
  EXPIRED: 'Expired',
};

type LoadState =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ready'; bids: MyBid[] };

export default function MyBidsPage() {
  const [state, setState] = React.useState<LoadState>({ kind: 'loading' });

  const load = React.useCallback(async () => {
    setState({ kind: 'loading' });
    try {
      const response = await fetch('/api/contractor/my-bids', { cache: 'no-store' });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.success || !Array.isArray(body.data)) {
        setState({ kind: 'error' });
        return;
      }
      setState({ kind: 'ready', bids: body.data as MyBid[] });
    } catch {
      setState({ kind: 'error' });
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">My bids</h1>
        <p className="text-sm text-muted-foreground">The bids you have sent and where each one stands.</p>
      </div>

      {state.kind === 'loading' && <p data-testid="my-bids-loading">Loading your bids…</p>}

      {state.kind === 'error' && (
        <div role="alert" data-testid="my-bids-error" className="space-y-2">
          <p>We could not load your bids just now. Your bids are not lost.</p>
          <button type="button" className="underline" onClick={() => void load()}>
            Try again
          </button>
        </div>
      )}

      {state.kind === 'ready' && state.bids.length === 0 && (
        <div data-testid="my-bids-empty" className="space-y-2">
          <p>You have not sent any bids yet.</p>
          <Link href="/dashboard/contractor/available-requests" className="underline">
            Browse available requests
          </Link>
        </div>
      )}

      {state.kind === 'ready' && state.bids.length > 0 && (
        <ul className="space-y-4" data-testid="my-bids-list">
          {state.bids.map((bid) => (
            <li key={bid.id}>
              <Card>
                <CardContent className="space-y-1 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-semibold">{bid.serviceRequest?.serviceTitle || 'Claim job'}</h2>
                    <span className="text-sm">{STATUS_LABEL[bid.status] ?? bid.status}</span>
                  </div>
                  {bid.serviceRequest?.location && (
                    <p className="text-sm text-muted-foreground">{bid.serviceRequest.location}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Sent {new Date(bid.createdAt).toLocaleDateString('en-AU')}
                  </p>
                  {bid.contractorMessage && <p className="text-sm">Your message: {bid.contractorMessage}</p>}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
