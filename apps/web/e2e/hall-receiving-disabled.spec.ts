import { test, expect } from '@playwright/test';

test('NRPG Hall receiving is inert on the actual local HTTP route', async ({ request, baseURL }) => {
  const target = new URL(baseURL || '');
  expect(['127.0.0.1', 'localhost']).toContain(target.hostname);
  const response = await request.post('/api/hall/enquiries', {
    headers: { origin: 'https://nrpg.business' },
    data: { eventId: 'synthetic-disabled-probe' },
  });
  expect(response.status()).toBe(503);
  expect(await response.json()).toEqual({ status: 'not_connected' });
});


test('NRPG Hall member page stays inactive without a reviewed receiving profile', async ({ request, baseURL }) => {
  expect(['127.0.0.1', 'localhost']).toContain(new URL(baseURL || '').hostname);
  const response = await request.get('/hall/enquiry');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('not connected');
  expect(html).not.toContain('name="email"');
  expect(html).not.toContain('name="question"');
});
