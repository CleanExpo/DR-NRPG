/**
 * @jest-environment node
 *
 * PR #270 review: a review reply goes to My Business v4
 * accounts/{a}/locations/{l}/reviews/{r}/reply, so POST action
 * respondToReview needs locationId. Without it the route answers 400
 * VALIDATION_ERROR and never calls the manager.
 */

const mockRespondToReview = jest.fn();

jest.mock('@/lib/seo/gbp-manager', () => ({
  gbpManager: { respondToReview: (...args: unknown[]) => mockRespondToReview(...args) },
  PRIORITY_CITIES: [],
}));

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/local-seo/gbp/route';

function post(body: Record<string, unknown>) {
  return POST(new NextRequest('http://localhost/api/local-seo/gbp', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  }));
}

beforeEach(() => {
  mockRespondToReview.mockReset();
  mockRespondToReview.mockResolvedValue({ success: true, data: true });
});

describe('POST /api/local-seo/gbp respondToReview', () => {
  it('returns 400 and does not call the manager without a locationId', async () => {
    const res = await post({ action: 'respondToReview', reviewId: 'r1', response: 'thanks' });

    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR');
    expect(mockRespondToReview).not.toHaveBeenCalled();
  });

  it('passes reviewId, response and locationId to the manager', async () => {
    const res = await post({ action: 'respondToReview', reviewId: 'r1', response: 'thanks', locationId: 'nrpg-sydney-nsw' });

    expect(res.status).toBe(200);
    expect(mockRespondToReview).toHaveBeenCalledWith('r1', 'thanks', 'nrpg-sydney-nsw');
  });
});
