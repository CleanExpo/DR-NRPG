/**
 * Health Check Endpoint - GET /api/health (deepened for DR-907)
 *
 * Public endpoint (no auth) used by uptime monitors AND the deploy-time
 * env-parity gate (`scripts/env-parity-gate.ts`). Per the ops-deploy spec
 * ("The /api/health gate asserts database/stripe/storage report healthy")
 * it now GENUINELY exercises each subsystem instead of only checking that
 * env vars are set:
 *
 *   - database: real `SELECT 1` through the shared Prisma client
 *   - stripe:   key present + cheap authenticated `balance.retrieve()`
 *               (a missing/bad key reports unhealthy — never crashes)
 *   - storage:  cheap 1-item list against the configured backend
 *               (supabase primary; s3/spaces legacy — see lib/storage)
 *
 *   - mail:     MAILTRAP_API_KEY + SENDER_EMAIL present (DR-964). No send is
 *               made; a missing key reports unhealthy/not_configured.
 *
 * Overall HTTP status: 200 only when database + stripe + storage are ALL
 * healthy; 503 otherwise. `mail`/`auth`/`redis` are reported but non-gating:
 * gating on `mail` before the Mailtrap key is set in Vercel would fail the
 * preview/production deploy health gates (DR-964 leaves that switch to a
 * follow-up once the key is live).
 *
 * SECURITY: the response never contains secrets or raw error internals —
 * failure `reason`s are coarse enum codes, price IDs are reported as
 * classifications only (feeds owner ticket DR-901), and the only URL
 * exposed is the public NEXTAUTH_URL host.
 */

import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { classifyDeployedPriceIds } from '@/lib/monitoring/env-parity';
import { getSupabaseServerEnv } from '@/lib/supabase/server-env';
import { getMailConfig } from '@/lib/email/mailtrap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Per-subsystem probe budget so the endpoint itself cannot hang. */
export const CHECK_TIMEOUT_MS = 5000;

type SubsystemStatus = 'healthy' | 'unhealthy';

export interface SubsystemCheck {
  status: SubsystemStatus;
  /** Coarse enum code only — never a raw error message. */
  reason?: 'not_configured' | 'request_failed' | 'timeout';
  [key: string]: unknown;
}

async function withTimeout<T>(work: PromiseLike<T>, ms = CHECK_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(work),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('health_check_timeout')), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function failureReason(error: unknown): 'request_failed' | 'timeout' {
  return error instanceof Error && error.message === 'health_check_timeout'
    ? 'timeout'
    : 'request_failed';
}

/** Real database round-trip (not just DATABASE_URL presence). */
async function checkDatabase(): Promise<SubsystemCheck> {
  if (!process.env.DATABASE_URL) {
    return { status: 'unhealthy', reason: 'not_configured' };
  }
  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`);
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', reason: failureReason(error) };
  }
}

/**
 * Cheap authenticated Stripe call. The client is constructed lazily so a
 * missing STRIPE_SECRET_KEY reports unhealthy instead of crashing at module
 * load (unlike `src/lib/stripe/index.ts`, which instantiates eagerly).
 */
async function checkStripe(): Promise<SubsystemCheck> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return { status: 'unhealthy', reason: 'not_configured' };
  }
  // Key mode is not a secret; parity gates need to see live vs test.
  const keyMode = key.startsWith('sk_live_') || key.startsWith('rk_live_') ? 'live' : 'test';
  try {
    const StripeCtor = (await import('stripe')).default;
    const stripe = new StripeCtor(key, {
      apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
      timeout: CHECK_TIMEOUT_MS,
    });
    await withTimeout(stripe.balance.retrieve());
    return { status: 'healthy', keyMode };
  } catch (error) {
    return { status: 'unhealthy', reason: failureReason(error), keyMode };
  }
}

/**
 * Cheap read against the configured storage backend
 * (`lib/storage/cloud-storage.ts`: supabase primary, s3/spaces legacy).
 */
async function checkStorage(): Promise<SubsystemCheck> {
  const backend = process.env.STORAGE_TYPE || 'supabase';
  const bucket = process.env.STORAGE_BUCKET_NAME || 'nrpg-uploads';

  if (backend === 'supabase') {
    // Read via getSupabaseServerEnv() — NOT `process.env.NEXT_PUBLIC_SUPABASE_URL`,
    // which Next.js inlines at build time. Prod builds run in GitHub Actions where
    // sensitive Vercel values can't be pulled, so the inlined value is undefined
    // even though the runtime env has it (see lib/supabase/server-env.ts).
    const { url, serviceRoleKey: serviceKey } = getSupabaseServerEnv();
    if (!url || !serviceKey) {
      return {
        status: 'unhealthy',
        backend,
        reason: 'not_configured',
        // Which piece is missing (booleans only — never values). Lets a probe
        // against a preview/prod deployment distinguish "URL invisible to the
        // bundle" (the inlining bug) from "key genuinely absent in this env".
        configured: { url: Boolean(url), serviceRoleKey: Boolean(serviceKey) },
      };
    }
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const client = createClient(url, serviceKey, { auth: { persistSession: false } });
      const { error } = await withTimeout(client.storage.from(bucket).list('', { limit: 1 }));
      if (error) {
        return { status: 'unhealthy', backend, reason: 'request_failed' };
      }
      return { status: 'healthy', backend };
    } catch (error) {
      return { status: 'unhealthy', backend, reason: failureReason(error) };
    }
  }

  // Legacy s3/spaces path.
  if (
    !process.env.STORAGE_ACCESS_KEY_ID ||
    !process.env.STORAGE_SECRET_ACCESS_KEY ||
    !process.env.STORAGE_BUCKET_NAME
  ) {
    return { status: 'unhealthy', backend, reason: 'not_configured' };
  }
  try {
    const { S3Client, ListObjectsV2Command } = await import('@aws-sdk/client-s3');
    const client = new S3Client({
      region: process.env.STORAGE_REGION || 'us-east-1',
      endpoint: process.env.STORAGE_ENDPOINT,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
      },
    });
    await withTimeout(client.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 1 })));
    return { status: 'healthy', backend };
  } catch (error) {
    return { status: 'unhealthy', backend, reason: failureReason(error) };
  }
}

/**
 * Mail configuration (DR-964). Presence only — no email is sent and no value is
 * exposed; `missing` lists variable NAMES.
 */
function checkMail(env: NodeJS.ProcessEnv = process.env): SubsystemCheck {
  const result = getMailConfig(env);
  if (result.configured) {
    return { status: 'healthy', provider: 'mailtrap' };
  }
  return { status: 'unhealthy', provider: 'mailtrap', reason: 'not_configured', missing: result.missing };
}

/** Public host only — never the secret; safe for a public endpoint. */
function authUrlSummary(): { host: string } | { host: null; reason: 'missing' | 'invalid_url' } {
  const raw = process.env.NEXTAUTH_URL;
  if (!raw) return { host: null, reason: 'missing' };
  try {
    return { host: new URL(raw).host };
  } catch {
    return { host: null, reason: 'invalid_url' };
  }
}

export async function GET(_request: NextRequest) {
  const [database, stripe, storage] = await Promise.all([
    checkDatabase(),
    checkStripe(),
    checkStorage(),
  ]);

  const gated = [database, stripe, storage];
  const healthy = gated.every((c) => c.status === 'healthy');

  const response = {
    status: healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    checks: {
      api: { status: 'healthy' },
      database,
      stripe,
      storage,
      // Reported, non-gating until the Mailtrap key is live (DR-964).
      mail: checkMail(),
      // Informational (non-gating) — preserved from the previous shallow route.
      auth: { status: process.env.NEXTAUTH_SECRET ? 'configured' : 'not_configured' },
      redis: { status: process.env.UPSTASH_REDIS_REST_URL ? 'configured' : 'not_configured' },
    },
    // Non-secret parity facts for scripts/env-parity-gate.ts (DR-907).
    // Price IDs are classifications only — live values are owner-gated DR-901.
    config: {
      authUrl: authUrlSummary(),
      stripePriceIds: classifyDeployedPriceIds(),
    },
  };

  return NextResponse.json(response, {
    status: healthy ? 200 : 503,
    headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
  });
}

export async function OPTIONS() {
  return NextResponse.json({ message: 'OK' }, { status: 200 });
}
