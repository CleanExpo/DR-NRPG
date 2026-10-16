/**
 * @jest-environment node
 *
 * CodeQL js/request-forgery #152 — GoogleBusinessProfileManager builds every
 * GBP API URL from the fixed accountsUrl plus validated path segments. IDs that
 * arrive from the /api/local-seo/gbp request body or query (locationId,
 * reviewId) must not be able to add `/`, `..`, `?`, `#` or `%` and walk the
 * bearer-token request to another API path.
 */

import { GoogleBusinessProfileManager } from '@/lib/seo/gbp-manager';

const ACCOUNTS = 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts';

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
      `${ACCOUNTS}/123456/locations/nrpg-sydney-nsw/localPosts`
    );
  });
});
