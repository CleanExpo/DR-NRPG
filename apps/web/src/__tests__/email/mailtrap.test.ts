/**
 * @jest-environment node
 *
 * DR-964: the single mail module (lib/email/mailtrap.ts).
 *  - request shape sent to the Mailtrap Sending API (mocked HTTP client)
 *  - fail-closed "not configured" path: no request, typed result, loud log
 *  - provider/network failures are reported, never claimed as sent
 *  - the API key never appears in any log line
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  MAILTRAP_BULK_URL,
  MAILTRAP_TRANSACTIONAL_URL,
  MailNotConfiguredError,
  MailSendError,
  getMailConfig,
  parseAddress,
  sendMail,
  sendMailOrThrow,
} from '@/lib/email/mailtrap';

const KEY = 'test-mailtrap-key-do-not-log';

const CONFIGURED_ENV = {
  MAILTRAP_API_KEY: KEY,
  SENDER_EMAIL: 'NRPG <noreply@nrpg.example>',
} as unknown as NodeJS.ProcessEnv;

function okResponse(ids: string[] = ['msg-123']) {
  return new Response(JSON.stringify({ success: true, message_ids: ids }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

let logSpy: jest.SpiedFunction<typeof console.log>;
let errorSpy: jest.SpiedFunction<typeof console.error>;

function allLogged(): string {
  return [...logSpy.mock.calls, ...errorSpy.mock.calls].map((c) => c.map(String).join(' ')).join('\n');
}

beforeEach(() => {
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('sendMail request shape', () => {
  it('POSTs the Mailtrap Sending API payload with a bearer token', async () => {
    const fetchImpl = jest.fn(async (..._args: Parameters<typeof fetch>) => okResponse());

    const result = await sendMail(
      {
        to: ['a@example.com', 'Bea Smith <b@example.com>'],
        cc: 'c@example.com',
        bcc: ['d@example.com'],
        replyTo: 'Support <support@example.com>',
        subject: 'Verify your email',
        html: '<p>Hi</p>',
        text: 'Hi',
        fromName: 'Disaster Recovery Australia',
        category: 'verification',
        customVariables: { user_type: 'contractor' },
        attachments: [{ filename: 'r.pdf', content: Buffer.from('PDF'), type: 'application/pdf' }],
      },
      { fetchImpl: fetchImpl as unknown as typeof fetch, env: CONFIGURED_ENV }
    );

    expect(result).toEqual({ sent: true, messageId: 'msg-123', messageIds: ['msg-123'] });
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(MAILTRAP_TRANSACTIONAL_URL);
    expect(url).toBe('https://send.api.mailtrap.io/api/send');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
    expect(init.signal).toBeDefined();

    expect(JSON.parse(String(init.body))).toEqual({
      // The From ADDRESS is always SENDER_EMAIL; only the display name is per-call.
      from: { email: 'noreply@nrpg.example', name: 'Disaster Recovery Australia' },
      to: [{ email: 'a@example.com' }, { email: 'b@example.com', name: 'Bea Smith' }],
      cc: [{ email: 'c@example.com' }],
      bcc: [{ email: 'd@example.com' }],
      reply_to: { email: 'support@example.com', name: 'Support' },
      subject: 'Verify your email',
      html: '<p>Hi</p>',
      text: 'Hi',
      category: 'verification',
      custom_variables: { user_type: 'contractor' },
      attachments: [
        {
          filename: 'r.pdf',
          content: Buffer.from('PDF').toString('base64'),
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    });
  });

  it('uses the SENDER_EMAIL display name when the caller gives none', async () => {
    const fetchImpl = jest.fn(async (..._args: Parameters<typeof fetch>) => okResponse());
    await sendMail(
      { to: 'a@example.com', subject: 's', html: '<p>x</p>' },
      { fetchImpl: fetchImpl as unknown as typeof fetch, env: CONFIGURED_ENV }
    );
    const body = JSON.parse(String((fetchImpl.mock.calls[0] as [string, RequestInit])[1].body));
    expect(body.from).toEqual({ email: 'noreply@nrpg.example', name: 'NRPG' });
    expect(body).not.toHaveProperty('cc');
    expect(body).not.toHaveProperty('attachments');
  });

  it('sends list mail through the bulk stream', async () => {
    const fetchImpl = jest.fn(async (..._args: Parameters<typeof fetch>) => okResponse());
    await sendMail(
      { to: 'a@example.com', subject: 's', html: '<p>x</p>', stream: 'bulk' },
      { fetchImpl: fetchImpl as unknown as typeof fetch, env: CONFIGURED_ENV }
    );
    expect((fetchImpl.mock.calls[0] as [string])[0]).toBe(MAILTRAP_BULK_URL);
  });

  it('never logs the API key', async () => {
    const fetchImpl = jest.fn(async (..._args: Parameters<typeof fetch>) => okResponse());
    await sendMail(
      { to: 'a@example.com', subject: 's', html: '<p>x</p>' },
      { fetchImpl: fetchImpl as unknown as typeof fetch, env: CONFIGURED_ENV }
    );
    const failing = jest.fn(async (..._args: Parameters<typeof fetch>) => {
      throw new TypeError('fetch failed');
    });
    await sendMail(
      { to: 'a@example.com', subject: 's', html: '<p>x</p>' },
      { fetchImpl: failing as unknown as typeof fetch, env: CONFIGURED_ENV }
    );
    expect(allLogged()).not.toContain(KEY);
  });
});

describe('sendMail when mail is not configured', () => {
  it.each([
    [{}, ['MAILTRAP_API_KEY', 'SENDER_EMAIL']],
    [{ SENDER_EMAIL: 'noreply@nrpg.example' }, ['MAILTRAP_API_KEY']],
    [{ MAILTRAP_API_KEY: KEY }, ['SENDER_EMAIL']],
    [{ MAILTRAP_API_KEY: '   ', SENDER_EMAIL: 'noreply@nrpg.example' }, ['MAILTRAP_API_KEY']],
  ])('fails closed for env %j', async (env, missing) => {
    const fetchImpl = jest.fn(async (..._args: Parameters<typeof fetch>) => okResponse());

    const result = await sendMail(
      { to: 'a@example.com', subject: 'Verify your email', html: '<p>x</p>' },
      { fetchImpl: fetchImpl as unknown as typeof fetch, env: env as NodeJS.ProcessEnv }
    );

    expect(result).toEqual({
      sent: false,
      reason: 'not_configured',
      error: 'Mail is not configured',
      missing,
    });
    // No request is made and no other provider is tried.
    expect(fetchImpl).not.toHaveBeenCalled();
    // Loud: an error-level log that says the email was NOT sent.
    expect(errorSpy).toHaveBeenCalled();
    expect(allLogged()).toMatch(/\[mail\] not configured .*email NOT sent/);
    expect(allLogged()).not.toContain(KEY);
  });

  it('sendMailOrThrow throws a typed MailNotConfiguredError', async () => {
    const fetchImpl = jest.fn(async (..._args: Parameters<typeof fetch>) => okResponse());
    const attempt = sendMailOrThrow(
      { to: 'a@example.com', subject: 's', html: '<p>x</p>' },
      { fetchImpl: fetchImpl as unknown as typeof fetch, env: {} as NodeJS.ProcessEnv }
    );
    await expect(attempt).rejects.toBeInstanceOf(MailNotConfiguredError);
    await expect(attempt).rejects.toMatchObject({
      code: 'mail_not_configured',
      missing: ['MAILTRAP_API_KEY', 'SENDER_EMAIL'],
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('reads configuration from process.env by default', () => {
    expect(getMailConfig({} as NodeJS.ProcessEnv)).toEqual({
      configured: false,
      missing: ['MAILTRAP_API_KEY', 'SENDER_EMAIL'],
    });
    expect(getMailConfig(CONFIGURED_ENV)).toEqual({
      configured: true,
      config: { apiKey: KEY, sender: { email: 'noreply@nrpg.example', name: 'NRPG' } },
    });
  });
});

describe('sendMail failures are never reported as sent', () => {
  it('reports a Mailtrap rejection as provider_error', async () => {
    const fetchImpl = jest.fn(
      async (..._args: Parameters<typeof fetch>) =>
        new Response(JSON.stringify({ success: false, errors: ['Unauthorized'] }), { status: 401 })
    );
    const result = await sendMail(
      { to: 'a@example.com', subject: 's', html: '<p>x</p>' },
      { fetchImpl: fetchImpl as unknown as typeof fetch, env: CONFIGURED_ENV }
    );
    expect(result).toEqual({ sent: false, reason: 'provider_error', error: 'Unauthorized', status: 401 });

    await expect(
      sendMailOrThrow(
        { to: 'a@example.com', subject: 's', html: '<p>x</p>' },
        { fetchImpl: fetchImpl as unknown as typeof fetch, env: CONFIGURED_ENV }
      )
    ).rejects.toBeInstanceOf(MailSendError);
  });

  it('treats a 200 without success:true as a failure', async () => {
    const fetchImpl = jest.fn(async (..._args: Parameters<typeof fetch>) => new Response('ok', { status: 200 }));
    const result = await sendMail(
      { to: 'a@example.com', subject: 's', html: '<p>x</p>' },
      { fetchImpl: fetchImpl as unknown as typeof fetch, env: CONFIGURED_ENV }
    );
    expect(result.sent).toBe(false);
  });

  it('reports a network failure as request_failed', async () => {
    const fetchImpl = jest.fn(async (..._args: Parameters<typeof fetch>) => {
      throw new TypeError('fetch failed');
    });
    const result = await sendMail(
      { to: 'a@example.com', subject: 's', html: '<p>x</p>' },
      { fetchImpl: fetchImpl as unknown as typeof fetch, env: CONFIGURED_ENV }
    );
    expect(result).toMatchObject({ sent: false, reason: 'request_failed' });
  });

  it('refuses a message with no recipient', async () => {
    const fetchImpl = jest.fn(async (..._args: Parameters<typeof fetch>) => okResponse());
    const result = await sendMail(
      { to: [], subject: 's', html: '<p>x</p>' },
      { fetchImpl: fetchImpl as unknown as typeof fetch, env: CONFIGURED_ENV }
    );
    expect(result).toMatchObject({ sent: false, reason: 'invalid_message' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe('parseAddress (CodeQL js/polynomial-redos, alert #190)', () => {
  it.each([
    ['plain address', 'a@example.com', { email: 'a@example.com' }],
    ['name and address', 'Bea Smith <b@example.com>', { email: 'b@example.com', name: 'Bea Smith' }],
    ['quoted name', '"Bea Smith" <b@example.com>', { email: 'b@example.com', name: 'Bea Smith' }],
    ['no space before <', 'NRPG<noreply@nrpg.example>', { email: 'noreply@nrpg.example', name: 'NRPG' }],
    ['bare angle address', '<b@example.com>', { email: 'b@example.com' }],
    ['tabs around parts', '\tNRPG\t\t<noreply@nrpg.example>\t', { email: 'noreply@nrpg.example', name: 'NRPG' }],
    ['space inside <>', 'Bea <b @example.com>', { email: 'Bea <b @example.com>' }],
    ['empty <>', 'Bea <>', { email: 'Bea <>' }],
    ['unclosed <', 'Bea <b@example.com', { email: 'Bea <b@example.com' }],
    ['newline in name', 'Bea\nSmith <b@example.com>', { email: 'Bea\nSmith <b@example.com>' }],
  ])('parses %s', (_label, raw, expected) => {
    expect(parseAddress(raw)).toEqual(expected);
  });

  // Each shape forces the old /^(.*?)\s*<([^<>\s]+)>$/ into quadratic
  // backtracking: the lazy (.*?) and \s* both match the same whitespace run.
  const N = 50_000;
  it.each([
    ['tabs then no <', 'a' + '\t'.repeat(N) + 'b'],
    ['spaces then no <', 'a' + ' '.repeat(N) + 'b'],
    ['tabs then an unclosed <', 'a' + '\t'.repeat(N) + '<b'],
    ['repeated "\t<"', 'a' + '\t<'.repeat(N / 2) + 'b'],
  ])('runs in linear time on 50,000 characters: %s', (_label, raw) => {
    const started = performance.now();
    const result = parseAddress(raw);
    const elapsed = performance.now() - started;
    expect(result.email.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(200);
  });
});
