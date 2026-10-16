/**
 * @jest-environment node
 *
 * sendEmail derives the text/plain part with stripHtml when no text is given.
 * - CodeQL js/polynomial-redos (alert #154): /<[^>]*>/g is quadratic on a run of "<".
 * - CodeQL js/double-escaping (alert #125): "&amp;" was decoded first, so "&amp;lt;"
 *   became "<" instead of the literal "&lt;" the HTML displays.
 * - CodeQL js/incomplete-multi-character-sanitization (PR #270): nested tags survived.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

const mockSendMail = jest.fn(async (_opts: any) => ({ messageId: 'test' }));

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: { createTransport: () => ({ sendMail: (opts: any) => mockSendMail(opts) }) },
}));

import { sendEmail } from '@/lib/services/email.service';

async function textFor(html: string): Promise<string> {
  await sendEmail({ to: 'ops@example.com', subject: 's', html });
  const opts = mockSendMail.mock.calls[mockSendMail.mock.calls.length - 1][0];
  return opts.text;
}

describe('sendEmail plain-text fallback', () => {
  beforeEach(() => {
    mockSendMail.mockClear();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('decodes &amp; last so an escaped entity stays literal', async () => {
    await expect(textFor('<p>Tom &amp;lt;3 Jerry</p>')).resolves.toBe('Tom &lt;3 Jerry');
  });

  it('still strips tags and decodes the basic entities', async () => {
    await expect(textFor('<p>A &amp; B &lt;ok&gt; &quot;q&quot;&nbsp;end</p>')).resolves.toBe(
      'A & B <ok> "q" end'
    );
  });

  it('leaves no tag behind when tags are nested inside a tag name', async () => {
    // CodeQL js/incomplete-multi-character-sanitization (PR #270): one regex pass
    // removed "<b>" and joined "<scr" + "ipt>" into "<script>".
    const text = await textFor('<scr<b>ipt>alert(1)</scr</b>ipt>ok');
    expect(text).not.toMatch(/<script/i);
    expect(text).toBe('ipt>alert(1)ipt>ok');
  });

  it('strips tags in linear time on a long run of "<"', async () => {
    const html = '<'.repeat(100_000);
    const started = Date.now();
    const text = await textFor(html);
    expect(Date.now() - started).toBeLessThan(1000);
    expect(text).toBe(html);
  });
});
