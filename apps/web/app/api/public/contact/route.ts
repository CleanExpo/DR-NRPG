/**
 * Public API - Platform Contact Enquiry
 *
 * Receives submissions from /contact (platform-level enquiries: support,
 * partnerships, licensing, general). Persists to ContactEnquiry and best-effort
 * notifies the team. Damage/claim intake is handled separately by lead-capture.
 *
 * POST /api/public/contact
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { basePrisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/services/email.service';
import { bridgeLeadToCrm } from '@/lib/crm/lead-bridge';
import { CURRENT_CONSENT_VERSION } from '@/lib/consent';

const SUBJECTS = [
  'Platform Support',
  'Contractor Registration',
  'Client Portal Access',
  'Technical Issues',
  'Partnership Opportunities',
  'White-Label Licensing',
  'General Inquiry',
  'Other',
] as const;

const contactSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Enter a valid email address').max(200),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  subject: z.enum(SUBJECTS).default('General Inquiry'),
  message: z.string().trim().min(10, 'Please include a little more detail').max(3000),
  // Honeypot: must be empty. Bots fill it; humans never see it.
  website: z.string().max(0).optional().or(z.literal('')),
});

// Visitor text goes into HTML email bodies. The acknowledgement is sent to the
// address the visitor typed, so unescaped markup would let anyone send NRPG-branded
// HTML (links, fake buttons) to any inbox.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 },
      );
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.errors },
        { status: 400 },
      );
    }

    // Honeypot tripped — pretend success, persist nothing.
    if (parsed.data.website) {
      return NextResponse.json({ success: true, message: 'Thank you.' }, { status: 201 });
    }

    const data = parsed.data;
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    const referrer = request.headers.get('referer') || undefined;

    const enquiry = await basePrisma.contactEnquiry.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        source: 'contact_form',
        referrer,
        ipAddress,
        userAgent,
        status: 'NEW',
        // Consent is captured at submission (the form presents the privacy
        // notice); the server stamps when + which version (DR-858 N-09).
        consentGivenAt: new Date(),
        consentVersion: CURRENT_CONSENT_VERSION,
      },
    });

    // Bridge into the CRM so the enquirer is visible as a customer (no postcode,
    // so this seeds a lifecycle without opening an opportunity). Best-effort.
    void bridgeLeadToCrm({
      email: data.email,
      name: `${data.firstName} ${data.lastName}`.trim(),
      phone: data.phone || null,
      source: 'contact_form',
    });

    // Best-effort notifications. sendEmail never throws (returns false on failure
    // or when email is not configured), so a missing provider does not lose the
    // enquiry — it is already persisted above.
    const adminTo = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;
    if (adminTo) {
      await sendEmail({
        to: adminTo,
        subject: `New contact enquiry: ${data.subject}`,
        html: `<h2>New platform contact enquiry</h2>
          <p><strong>Name:</strong> ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(data.phone || '—')}</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(data.message).replace(/\n/g, '<br/>')}</p>
          <p style="color:#888">Enquiry ID: ${enquiry.id}</p>`,
      });
    }

    await sendEmail({
      to: data.email,
      subject: 'We received your enquiry — NRPG',
      html: `<p>Hi ${escapeHtml(data.firstName)},</p>
        <p>Thanks for getting in touch with the NRPG platform team. We've received your
        enquiry about "<strong>${data.subject}</strong>" and aim to respond within one
        business day.</p>
        <p>If your matter is an active emergency, please use the emergency claim intake on
        our website rather than waiting on this reply.</p>
        <p>— The NRPG Team</p>`,
    });

    return NextResponse.json(
      { success: true, message: 'Thanks — your enquiry has been received.', enquiryId: enquiry.id },
      { status: 201 },
    );
  } catch (error) {
    console.error('Contact enquiry error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    },
  );
}
