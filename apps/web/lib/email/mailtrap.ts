/**
 * The one mail-sending module for the DR-NRPG platform (DR-964).
 *
 * Every email the app sends goes through `sendMail` here, which posts to the
 * Mailtrap Email Sending API with a plain `fetch` (no SDK), modelled on CARSI's
 * `src/lib/server/email.ts`. Mailtrap is the estate default (ruling UNI-2959).
 *
 * Configuration comes from environment variables only:
 *   - MAILTRAP_API_KEY  Mailtrap send-only API token (secret; never logged)
 *   - SENDER_EMAIL      the verified sending address, e.g. "noreply@nrpg.business"
 *                       or "NRPG <noreply@nrpg.business>"
 *   - SENDER_NAME       optional default display name
 *
 * FAIL CLOSED: with no key or no sender the module sends nothing, logs a loud
 * `[mail] not configured` error, and returns `{ sent: false, reason: 'not_configured' }`.
 * It never reports an email as sent unless Mailtrap accepted it, and it never
 * falls back to another provider or a console "transport".
 *
 * `sendMail` never throws; `sendMailOrThrow` throws a typed `MailNotConfiguredError`
 * or `MailSendError` for callers that want an exception instead.
 */

export const MAILTRAP_TRANSACTIONAL_URL = 'https://send.api.mailtrap.io/api/send';
export const MAILTRAP_BULK_URL = 'https://bulk.api.mailtrap.io/api/send';

/** Per-request budget so a hung Mailtrap call cannot hang a request handler. */
export const MAIL_TIMEOUT_MS = 15_000;

/**
 * `transactional`: verification, password reset, approval, receipt and other
 * one-to-one emails. `bulk`: anything sent to a list. Never mix them.
 */
export type MailStream = 'transactional' | 'bulk';

export interface MailAddress {
  email: string;
  name?: string;
}

export interface MailAttachment {
  filename: string;
  /** Raw bytes, or a string that is already base64-encoded. */
  content: Buffer | Uint8Array | string;
  /** MIME type, e.g. "application/pdf". */
  type?: string;
}

export interface MailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  /**
   * Display name for the From header. The From ADDRESS is always SENDER_EMAIL,
   * because Mailtrap only sends from a verified domain.
   */
  fromName?: string;
  attachments?: MailAttachment[];
  /** Mailtrap category, for grouping in its dashboard (e.g. "waitlist"). */
  category?: string;
  customVariables?: Record<string, string>;
  /** Defaults to `transactional`. */
  stream?: MailStream;
}

export type MailFailureReason =
  | 'not_configured'
  | 'invalid_message'
  | 'provider_error'
  | 'request_failed';

export type MailResult =
  | { sent: true; messageId: string | undefined; messageIds: string[] }
  | {
      sent: false;
      reason: MailFailureReason;
      /** Safe, secret-free description of the failure. */
      error: string;
      /** For `not_configured`: which variables are missing (names only). */
      missing?: string[];
      status?: number;
    };

export interface MailConfig {
  apiKey: string;
  sender: MailAddress;
}

export type MailConfigResult =
  | { configured: true; config: MailConfig }
  | { configured: false; missing: string[] };

export interface SendMailDeps {
  /** Injected in tests; defaults to the global `fetch`. */
  fetchImpl?: typeof fetch;
  env?: NodeJS.ProcessEnv;
}

export class MailNotConfiguredError extends Error {
  readonly code = 'mail_not_configured' as const;
  constructor(readonly missing: string[]) {
    super(`Mail is not configured: missing ${missing.join(', ')}`);
    this.name = 'MailNotConfiguredError';
  }
}

export class MailSendError extends Error {
  readonly code = 'mail_send_failed' as const;
  constructor(
    readonly reason: Exclude<MailFailureReason, 'not_configured'>,
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = 'MailSendError';
  }
}

/** Longest input parseAddress splits into name + address; anything longer is left whole. */
export const MAX_ADDRESS_LENGTH = 1024;

function hasWhitespace(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    if (value[i].trim() === '') return true;
  }
  return false;
}

/**
 * Splits `Name <email@host>` into its parts in one linear pass, without a
 * regex. The previous /^(.*?)\s*<([^<>\s]+)>$/ backtracked quadratically on a
 * long run of whitespace (CodeQL js/polynomial-redos, alert #190) and was
 * reachable from user input (contact, waitlist, sign-up addresses).
 * Anything that is not that shape is returned whole as the address, exactly
 * as before; Mailtrap then rejects it if it is not a valid address.
 */
export function parseAddress(raw: string): MailAddress {
  const trimmed = raw.trim();
  if (trimmed.length > MAX_ADDRESS_LENGTH || !trimmed.endsWith('>')) {
    return { email: trimmed };
  }
  const open = trimmed.lastIndexOf('<');
  if (open < 0) return { email: trimmed };

  const email = trimmed.slice(open + 1, -1);
  const namePart = trimmed.slice(0, open);
  // Same shape the old pattern accepted: a non-empty address with no
  // whitespace or angle brackets, and a name on a single line.
  if (
    email.length === 0 ||
    email.includes('>') ||
    hasWhitespace(email) ||
    namePart.includes('\n') ||
    namePart.includes('\r')
  ) {
    return { email: trimmed };
  }

  let name = namePart.trim();
  if (name.startsWith('"') || name.startsWith("'")) name = name.slice(1);
  if (name.endsWith('"') || name.endsWith("'")) name = name.slice(0, -1);
  return name ? { email, name } : { email };
}

function toList(value: string | string[] | undefined): MailAddress[] {
  if (!value) return [];
  const list = Array.isArray(value) ? value : value.split(',');
  return list.map((v) => v.trim()).filter(Boolean).map(parseAddress);
}

/** Reads the mail configuration. Names of missing variables only, never values. */
export function getMailConfig(env: NodeJS.ProcessEnv = process.env): MailConfigResult {
  const apiKey = env.MAILTRAP_API_KEY?.trim();
  const senderRaw = env.SENDER_EMAIL?.trim();
  const missing: string[] = [];
  if (!apiKey) missing.push('MAILTRAP_API_KEY');
  if (!senderRaw) missing.push('SENDER_EMAIL');
  if (!apiKey || !senderRaw) return { configured: false, missing };

  const sender = parseAddress(senderRaw);
  const defaultName = env.SENDER_NAME?.trim();
  if (!sender.name && defaultName) sender.name = defaultName;
  return { configured: true, config: { apiKey, sender } };
}

export function isMailConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return getMailConfig(env).configured;
}

function encodeAttachment(content: MailAttachment['content']): string {
  return typeof content === 'string' ? content : Buffer.from(content).toString('base64');
}

/** Builds the Mailtrap Sending API request body. Exported for tests. */
export function buildMailtrapPayload(message: MailMessage, sender: MailAddress) {
  const from: MailAddress = { email: sender.email };
  const name = message.fromName?.trim() || sender.name;
  if (name) from.name = name;

  const payload: Record<string, unknown> = {
    from,
    to: toList(message.to),
    subject: message.subject,
    html: message.html,
  };
  if (message.text) payload.text = message.text;
  const cc = toList(message.cc);
  if (cc.length) payload.cc = cc;
  const bcc = toList(message.bcc);
  if (bcc.length) payload.bcc = bcc;
  if (message.replyTo) payload.reply_to = parseAddress(message.replyTo);
  if (message.category) payload.category = message.category;
  if (message.customVariables && Object.keys(message.customVariables).length > 0) {
    payload.custom_variables = message.customVariables;
  }
  if (message.attachments?.length) {
    payload.attachments = message.attachments.map((a) => ({
      filename: a.filename,
      content: encodeAttachment(a.content),
      ...(a.type ? { type: a.type } : {}),
      disposition: 'attachment',
    }));
  }
  return payload;
}

function summarise(message: MailMessage): string {
  const count = toList(message.to).length;
  return `"${message.subject}" to ${count} recipient${count === 1 ? '' : 's'}`;
}

/**
 * Sends one email through Mailtrap. Never throws. Returns `sent: true` only when
 * Mailtrap accepted the message.
 */
export async function sendMail(message: MailMessage, deps: SendMailDeps = {}): Promise<MailResult> {
  const configResult = getMailConfig(deps.env ?? process.env);
  if (!configResult.configured) {
    // Loud and honest: this email was NOT sent.
    console.error(
      `[mail] not configured (missing ${configResult.missing.join(', ')}): email NOT sent: ${summarise(message)}`
    );
    return {
      sent: false,
      reason: 'not_configured',
      error: 'Mail is not configured',
      missing: configResult.missing,
    };
  }
  const { apiKey, sender } = configResult.config;

  if (toList(message.to).length === 0 || !message.subject || !message.html) {
    console.error(`[mail] invalid message (needs to, subject and html): email NOT sent`);
    return { sent: false, reason: 'invalid_message', error: 'Message needs to, subject and html' };
  }

  const url = message.stream === 'bulk' ? MAILTRAP_BULK_URL : MAILTRAP_TRANSACTIONAL_URL;
  const fetchImpl = deps.fetchImpl ?? fetch;

  let res: Response;
  try {
    res = await fetchImpl(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(buildMailtrapPayload(message, sender)),
      signal: AbortSignal.timeout(MAIL_TIMEOUT_MS),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.name : 'unknown';
    console.error(`[mail] Mailtrap request failed (${detail}): email NOT sent: ${summarise(message)}`);
    return { sent: false, reason: 'request_failed', error: `Mailtrap request failed (${detail})` };
  }

  const bodyText = await res.text().catch(() => '');
  let parsed: { success?: boolean; message_ids?: string[]; errors?: unknown } = {};
  try {
    parsed = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    // non-JSON body
  }

  if (!res.ok || parsed.success !== true) {
    const errors = Array.isArray(parsed.errors) ? parsed.errors.map(String).join('; ') : '';
    const detail = errors || `HTTP ${res.status}`;
    console.error(`[mail] Mailtrap rejected the email (${detail}): email NOT sent: ${summarise(message)}`);
    return { sent: false, reason: 'provider_error', error: detail, status: res.status };
  }

  const messageIds = Array.isArray(parsed.message_ids) ? parsed.message_ids : [];
  console.log(`[mail] sent via Mailtrap: ${summarise(message)} (message id ${messageIds[0] ?? 'n/a'})`);
  return { sent: true, messageId: messageIds[0], messageIds };
}

/** Like `sendMail`, but throws a typed error instead of returning `sent: false`. */
export async function sendMailOrThrow(
  message: MailMessage,
  deps: SendMailDeps = {}
): Promise<{ messageId: string | undefined; messageIds: string[] }> {
  const result = await sendMail(message, deps);
  if (result.sent) return { messageId: result.messageId, messageIds: result.messageIds };
  if (result.reason === 'not_configured') throw new MailNotConfiguredError(result.missing ?? []);
  throw new MailSendError(result.reason, result.error, result.status);
}
