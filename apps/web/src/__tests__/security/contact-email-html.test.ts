/**
 * @jest-environment node
 *
 * POST /api/public/contact puts visitor text into two HTML emails: a notification to
 * the team and an acknowledgement sent to the address the visitor typed. Unescaped,
 * a first name such as `<a href="https://evil.example">Verify</a>` makes NRPG send
 * branded HTML with an attacker's link to any inbox. Every visitor field must reach
 * the HTML escaped.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

const sent: Array<{ to: string; html: string }> = [];

jest.mock('@/lib/prisma', () => ({
  basePrisma: { contactEnquiry: { create: jest.fn(async () => ({ id: 'enq_1' })) } },
}));
jest.mock('@/lib/services/email.service', () => ({
  sendEmail: jest.fn(async (opts: { to: string; html: string }) => {
    sent.push(opts);
    return true;
  }),
}));
jest.mock('@/lib/crm/lead-bridge', () => ({ bridgeLeadToCrm: jest.fn(async () => undefined) }));

import { POST } from '@/app/api/public/contact/route';

const LINK = '<a href="https://evil.example">Verify</a>';

function post(body: Record<string, unknown>) {
  return POST(
    new Request('http://localhost/api/public/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }) as any
  );
}

describe('POST /api/public/contact email HTML', () => {
  beforeEach(() => {
    sent.length = 0;
    process.env.ADMIN_EMAIL = 'team@example.com';
  });

  it('escapes visitor fields in the acknowledgement and the team notification', async () => {
    const res = await post({
      firstName: LINK,
      lastName: '<b>x</b>',
      email: 'victim@example.com',
      phone: '<i>1</i>',
      subject: 'General Inquiry',
      message: `Hello there\n${LINK}`,
    });
    expect(res.status).toBe(201);
    expect(sent.map((m) => m.to).sort()).toEqual(['team@example.com', 'victim@example.com']);
    for (const mail of sent) {
      expect(mail.html).not.toContain('<a href');
      expect(mail.html).not.toContain('<b>x</b>');
      expect(mail.html).not.toContain('<i>1</i>');
    }
    const ack = sent.find((m) => m.to === 'victim@example.com')!;
    expect(ack.html).toContain('Hi &lt;a href=&quot;https://evil.example&quot;&gt;Verify&lt;/a&gt;,');
  });

  it('keeps ordinary text and line breaks readable', async () => {
    await post({
      firstName: 'Sam',
      lastName: "O'Neil",
      email: 'sam@example.com',
      subject: 'Platform Support',
      message: 'Line one is long enough\nLine two',
    });
    const team = sent.find((m) => m.to === 'team@example.com')!;
    expect(team.html).toContain('Sam O&#39;Neil');
    expect(team.html).toContain('Line one is long enough<br/>Line two');
  });
});
