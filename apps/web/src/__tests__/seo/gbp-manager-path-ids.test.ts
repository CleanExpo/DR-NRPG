/**
 * @jest-environment node
 *
 * CodeQL js/request-forgery #152 — GoogleBusinessProfileManager builds every
 * GBP API URL from a fixed API base plus validated path segments. IDs that
 * arrive from the /api/local-seo/gbp request body or query (locationId,
 * reviewId) must not be able to add `/`, `..`, `?`, `#` or `%` and walk the
 * bearer-token request to another API path.
 */

import { GoogleBusinessProfileManager } from '@/lib/seo/gbp-manager';

// Google's documented endpoints: locations on Business Information v1, posts,
// reviews and media on My Business v4.
const INFO = 'https://mybusinessbusinessinformation.googleapis.com/v1';
const V4 = 'https://mybusiness.googleapis.com/v4';

function okResponse() {
  return new Response(JSON.stringify({ name: 'accounts/123456/localPosts/p1' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

function manager() {
  return new GoogleBusinessProfileManager({ accessToken: 'token-fixture', accountId: '123456' });
}

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('GBP manager path IDs', () => {
  it('does not fetch when a locationId carries a traversal or query', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(okResponse());
    const gbp = manager();

    for (const locationId of ['../../../v1/accounts/999', 'a/b', 'x?admin=1', 'x#y', '%2e%2e']) {
      await gbp.postUpdate(locationId, { summary: 'hello' });
    }

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('does not fetch when a reviewId carries a traversal', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(okResponse());

    const result = await manager().respondToReview('../../../admins', 'thanks');

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
  });

  it('fetches the exact fixed-origin URL for valid ids', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(okResponse());

    await manager().postUpdate('nrpg-sydney-nsw', { summary: 'hello' });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(String(fetchSpy.mock.calls[0][0])).toBe(
      `${V4}/accounts/123456/locations/nrpg-sydney-nsw/localPosts`
    );
  });

  it('rejects an invalid locationId with VALIDATION_ERROR before any local change or API call', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(okResponse());
    fetchSpy.mockClear();
    const gbp = manager();
    const bad = '../../../v1/accounts/999';
    type Hours = Parameters<typeof gbp.updateHours>[1];

    const results = [
      await gbp.updateLocation(bad, {}),
      await gbp.deleteLocation(bad),
      await gbp.postUpdate(bad, { summary: 'hello' }),
      await gbp.uploadPhotos(bad, []),
      await gbp.updateHours(bad, { dayOfWeek: ['Monday'], is24Hours: true } as unknown as Hours),
    ];

    for (const result of results) {
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('sends each operation to the endpoint Google documents for it', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(okResponse());
    fetchSpy.mockClear();
    const gbp = manager();
    const url = (i: number) => String(fetchSpy.mock.calls[i][0]);
    const verb = (i: number) => (fetchSpy.mock.calls[i][1] as RequestInit).method;

    const created = await gbp.createLocation({
      city: 'Sydney', state: 'New South Wales', stateCode: 'NSW', latitude: -33.86, longitude: 151.2,
    });
    const id = created.data!.id;
    await gbp.updateLocation(id, {});
    await gbp.respondToReview('r1', 'thanks', id);
    await gbp.deleteLocation(id);

    expect([url(0), verb(0)]).toEqual([`${INFO}/accounts/123456/locations`, 'POST']);
    expect([url(1), verb(1)]).toEqual([`${INFO}/locations/${id}`, 'PATCH']);
    expect([url(2), verb(2)]).toEqual([`${V4}/accounts/123456/locations/${id}/reviews/r1/reply`, 'PUT']);
    expect([url(3), verb(3)]).toEqual([`${INFO}/locations/${id}`, 'DELETE']);
  });

  it('does not fetch a review reply without a valid locationId', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(okResponse());
    fetchSpy.mockClear();

    const result = await manager().respondToReview('r1', 'thanks');

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
  });

  it('does not fetch a review reply when the locationId carries a traversal or query', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(okResponse());
    fetchSpy.mockClear();
    const gbp = manager();

    for (const locationId of ['../../../v1/accounts/999', 'a/b', 'x?admin=1', 'x#y', '%2e%2e']) {
      const result = await gbp.respondToReview('r1', 'thanks', locationId);
      expect(result.success).toBe(false);
    }

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('creates a punctuated city with an id that later updates accept', async () => {
    const gbp = new GoogleBusinessProfileManager();

    const created = await gbp.createLocation({
      city: 'St. Kilda', state: 'Victoria', stateCode: 'VIC', latitude: -37.86, longitude: 144.98,
    });
    expect(created.data!.id).toBe('nrpg-st-kilda-vic');

    const updated = await gbp.updateLocation(created.data!.id, { phone: '1300 000 000' });
    expect(updated.success).toBe(true);
    expect(updated.data!.phone).toBe('1300 000 000');
  });
});
