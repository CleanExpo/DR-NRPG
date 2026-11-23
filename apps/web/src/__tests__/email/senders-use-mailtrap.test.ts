/**
 * @jest-environment node
 *
 * DR-964: every existing sender now goes through the single mail module
 * (lib/email/mailtrap.ts) and therefore through Mailtrap's Sending API.
 *
 * The HTTP client (global fetch) is mocked at the boundary; nothing else in
 * the mail path is mocked, so a sender that still used Resend, nodemailer or
 * any other transport would make no Mailtrap request and fail here.
 *
 * Senders covered:
 *   1. lib/email/resend.ts            sendEmail (used by lib/email/* templates,
 *                                     the email queue and job notifications)
 *   2. lib/email/resend.ts            sendVerificationEmail (auth templates)
 *   3. lib/email/templates.ts         sendTemplateEmail
 *   4. src/lib/services/email.service sendEmail (contact, resume link,
 *                                     contractor onboarding, client-email.service)
 *   5. src/lib/services/client-email.service sendClientWelcomeEmail
 *   6. lib/email/contractor-notifications sendContractorMatchNotificationEmail
 *   7. lib/notifications/index.ts     sendNotification
 *   8. app/api/landing/waitlist       POST confirmation email
 *   9. lib/seo/report-generator.ts    ReportGenerator.deliverReport
 * plus a source guard: no app code imports another mail provider.
 */

import fs from 'fs';
import path from 'path';

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn(), addBreadcrumb: jest.fn() }), {
  virtual: true,
});

jest.mock('@/lib/prisma', () => {
  const client = {
    user: { findUnique: jest.fn() },
    notificationPreference: { findUnique: jest.fn() },
    notification: { create: jest.fn() },
    waitlistSubmission: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  };
  return { prisma: client, basePrisma: client };
});

// The SEO report generator's data sources are irrelevant to delivery.
jest.mock('@/lib/seo/rank-tracker', () => ({ rankTracker: {} }));
jest.mock('@/lib/seo/seo-health-monitor', () => ({ seoHealthMonitor: {} }));
jest.mock('@/lib/seo/analytics-tracker', () => ({ analyticsTracker: {} }));

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail as sendViaTemplatesAdapter, sendVerificationEmail } from '@/lib/email/resend';
import { sendTemplateEmail } from '@/lib/email/templates';
import { sendEmail as sendViaOnboardingService } from '@/lib/services/email.service';
import { sendClientWelcomeEmail } from '@/lib/services/client-email.service';
import { sendContractorMatchNotificationEmail } from '@/lib/email/contractor-notifications';
import { sendNotification } from '@/lib/notifications';
import { POST as waitlistPOST } from '@/app/api/landing/waitlist/route';
import { ReportGenerator, ReportType, ReportFormat } from '@/lib/seo/report-generator';

const MAILTRAP_SEND = 'https://send.api.mailtrap.io/api/send';
const mockPrisma = prisma as unknown as {
  user: { findUnique: jest.Mock };
  notificationPreference: { findUnique: jest.Mock };
  notification: { create: jest.Mock };
  waitlistSubmission: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock };
};

const fetchMock = jest.fn();
const realFetch = global.fetch;
const savedEnv = { ...process.env };

function mailtrapCalls(): Array<{ url: string; body: Record<string, any>; auth: string }> {
  return fetchMock.mock.calls
    .filter(([url]) => String(url) === MAILTRAP_SEND)
    .map(([url, init]) => ({
      url: String(url),
      body: JSON.parse(String((init as RequestInit).body)),
      auth: ((init as RequestInit).headers as Record<string, string>).Authorization,
    }));
}

async function flush() {
  for (let i = 0; i < 10; i++) await new Promise((r) => setImmediate(r));
}

const matchData = {
  contractorName: 'Sam',
  contractorEmail: 'sam@contractor.example',
  businessName: 'Sam Restorations',
  claimId: 'claim-1',
  clientName: 'Jo D.',
  propertySuburb: 'Parramatta',
  propertyPostcode: '2150',
  disasterType: 'Water damage',
  urgency: 'urgent' as const,
  matchScore: 0.9,
  matchReasons: ['Nearby'],
  responseDeadline: new Date('2026-11-24T00:00:00Z'),
  hasInsurance: true,
};

beforeEach(() => {
  process.env = { ...savedEnv };
  delete process.env.RESEND_API_KEY;
  delete process.env.SENDGRID_API_KEY;
  delete process.env.AWS_SES_REGION;
  delete process.env.SMTP_HOST;
  process.env.MAILTRAP_API_KEY = 'test-key';
  process.env.SENDER_EMAIL = 'noreply@nrpg.example';

  fetchMock.mockReset();
  fetchMock.mockImplementation(
    async () => new Response(JSON.stringify({ success: true, message_ids: ['mt-1'] }), { status: 200 })
  );
  global.fetch = fetchMock as unknown as typeof fetch;

  mockPrisma.user.findUnique.mockResolvedValue({ email: 'user@example.com' });
  mockPrisma.notificationPreference.findUnique.mockResolvedValue(null);
  mockPrisma.notification.create.mockResolvedValue({});
  mockPrisma.waitlistSubmission.findUnique.mockResolvedValue(null);
  mockPrisma.waitlistSubmission.create.mockImplementation(async ({ data }: any) => ({ id: 'w1', ...data }));
  mockPrisma.waitlistSubmission.update.mockResolvedValue({});

  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  global.fetch = realFetch;
  process.env = { ...savedEnv };
  jest.restoreAllMocks();
});

describe('every sender delivers through the Mailtrap module', () => {
  it('1. lib/email/resend sendEmail', async () => {
    const result = await sendViaTemplatesAdapter({ to: 'a@example.com', subject: 'S', html: '<p>x</p>' });
    expect(result).toMatchObject({ success: true, messageId: 'mt-1' });
    expect(mailtrapCalls()).toHaveLength(1);
    expect(mailtrapCalls()[0].auth).toBe('Bearer test-key');
    expect(mailtrapCalls()[0].body.from.email).toBe('noreply@nrpg.example');
  });

  it('2. lib/email/resend sendVerificationEmail', async () => {
    const result = await sendVerificationEmail('new@example.com', 'tok', 'New', 'https://nrpg.example');
    expect(result.success).toBe(true);
    const [call] = mailtrapCalls();
    expect(call.body.to).toEqual([{ email: 'new@example.com' }]);
    expect(call.body.html).toContain('tok');
  });

  it('3. lib/email/templates sendTemplateEmail', async () => {
    const result = await sendTemplateEmail({ to: 't@example.com', subject: 'S', htmlContent: '<p>h</p>', textContent: 'h' });
    expect(result.success).toBe(true);
    expect(mailtrapCalls()[0].body).toMatchObject({ html: '<p>h</p>', text: 'h' });
  });

  it('4. src/lib/services/email.service sendEmail', async () => {
    await expect(
      sendViaOnboardingService({ to: 'c@example.com', subject: 'S', html: '<p>A &amp; B</p>' })
    ).resolves.toBe(true);
    expect(mailtrapCalls()[0].body).toMatchObject({ text: 'A & B', to: [{ email: 'c@example.com' }] });
  });

  it('5. client-email.service sendClientWelcomeEmail', async () => {
    await expect(sendClientWelcomeEmail({ clientName: 'Jo', clientEmail: 'jo@example.com' })).resolves.toBe(true);
    expect(mailtrapCalls()[0].body.to).toEqual([{ email: 'jo@example.com' }]);
  });

  it('6. contractor-notifications sendContractorMatchNotificationEmail', async () => {
    await expect(sendContractorMatchNotificationEmail(matchData)).resolves.toEqual({ success: true });
    expect(mailtrapCalls()[0].body.to).toEqual([{ email: 'sam@contractor.example' }]);
  });

  it('7. lib/notifications sendNotification', async () => {
    await sendNotification({
      userId: 'u1',
      type: 'claim_submitted',
      subject: 'Claim received',
      template: 'claim_confirmation',
      data: { claimNumber: 'C-1', claimId: 'claim-1', propertyAddress: '1 St', disasterType: 'Water', urgency: 'urgent' },
    });
    const [call] = mailtrapCalls();
    expect(call.body.to).toEqual([{ email: 'user@example.com' }]);
    expect(call.body.from).toEqual({ email: 'noreply@nrpg.example', name: 'Disaster Recovery Australia' });
    expect(mockPrisma.notification.create).toHaveBeenCalled();
  });

  it('8. waitlist POST confirmation email', async () => {
    const res = await waitlistPOST(
      new NextRequest('http://localhost/api/landing/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'w@example.com', fullName: 'Wendy W', userType: 'CONTRACTOR' }),
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(res.status).toBe(201);
    await flush();
    const [call] = mailtrapCalls();
    expect(call.body).toMatchObject({
      to: [{ email: 'w@example.com' }],
      from: { email: 'noreply@nrpg.example', name: 'NRPG Team' },
      category: 'waitlist',
      custom_variables: { user_type: 'contractor' },
    });
    expect(mockPrisma.waitlistSubmission.update).toHaveBeenCalledWith({
      where: { email: 'w@example.com' },
      data: { emailSent: true },
    });
  });

  it('9. SEO ReportGenerator.deliverReport', async () => {
    const generator = new ReportGenerator();
    jest.spyOn(generator as any, 'generateEmailHtml').mockResolvedValue('<p>report</p>');
    await generator.deliverReport({}, ReportType.DAILY_BRIEF, {
      recipients: ['seo@example.com', 'ops@example.com'],
      format: ReportFormat.HTML,
    } as any);
    expect(mailtrapCalls()[0].body.to).toEqual([{ email: 'seo@example.com' }, { email: 'ops@example.com' }]);
  });
});

describe('with mail not configured, no sender claims an email was sent', () => {
  beforeEach(() => {
    delete process.env.MAILTRAP_API_KEY;
  });

  it('reports a typed not-configured result and makes no request', async () => {
    await expect(
      sendViaTemplatesAdapter({ to: 'a@example.com', subject: 'S', html: '<p>x</p>' })
    ).resolves.toMatchObject({ success: false, notConfigured: true, reason: 'not_configured' });
    await expect(sendVerificationEmail('n@example.com', 'tok')).resolves.toMatchObject({ success: false });
    await expect(
      sendViaOnboardingService({ to: 'c@example.com', subject: 'S', html: '<p>x</p>' })
    ).resolves.toBe(false);
    await expect(sendClientWelcomeEmail({ clientName: 'Jo', clientEmail: 'jo@example.com' })).resolves.toBe(false);
    await expect(sendContractorMatchNotificationEmail(matchData)).resolves.toMatchObject({ success: false });
    await expect(
      new ReportGenerator().deliverReport({}, ReportType.DAILY_BRIEF, {
        recipients: ['seo@example.com'],
        format: ReportFormat.HTML,
      } as any)
    ).rejects.toMatchObject({ code: 'mail_not_configured' });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('waitlist does not record emailSent', async () => {
    const res = await waitlistPOST(
      new NextRequest('http://localhost/api/landing/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'w@example.com', fullName: 'Wendy W', userType: 'CONTRACTOR' }),
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(res.status).toBe(201);
    await flush();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockPrisma.waitlistSubmission.update).not.toHaveBeenCalled();
  });
});

describe('source guard: no other mail provider in app code', () => {
  const ROOT = path.resolve(__dirname, '../../..');
  const SCAN = ['app', 'lib', 'src', 'components'];
  const BANNED = [
    /from\s+['"]resend['"]/,
    /require\(\s*['"]resend['"]\s*\)/,
    /from\s+['"]nodemailer['"]/,
    /require\(\s*['"]nodemailer['"]\s*\)/,
    /from\s+['"]@sendgrid\//,
    /api\.resend\.com/,
    /api\.sendgrid\.com/,
    /smtp\.sendgrid\.net/,
    /createTransport\s*\(/,
  ];

  function walk(dir: string, out: string[] = []): string[] {
    if (!fs.existsSync(dir)) return out;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '__tests__') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, out);
      else if (/\.(ts|tsx|js|mjs|cjs)$/.test(entry.name)) out.push(full);
    }
    return out;
  }

  it('scans a non-trivial number of files (the guard can see the code)', () => {
    const files = SCAN.flatMap((d) => walk(path.join(ROOT, d)));
    expect(files.length).toBeGreaterThan(200);
    expect(files.some((f) => f.endsWith(path.join('lib', 'email', 'mailtrap.ts')))).toBe(true);
  });

  it('finds no Resend, nodemailer or SendGrid transport outside the Mailtrap module', () => {
    const offenders = SCAN.flatMap((d) => walk(path.join(ROOT, d))).filter((file) => {
      const text = fs.readFileSync(file, 'utf8');
      return BANNED.some((re) => re.test(text));
    });
    expect(offenders.map((f) => path.relative(ROOT, f))).toEqual([]);
  });
});
