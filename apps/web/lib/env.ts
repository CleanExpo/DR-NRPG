/**
 * Environment variable validation — server-side only.
 *
 * Validates required vars at startup via instrumentation.ts.
 * Fails fast with a clear message rather than surfacing a cryptic
 * runtime error deep in a request handler.
 *
 * Usage:
 *   import { validateEnv, env } from '@/lib/env'   // in instrumentation.ts
 *   import { env } from '@/lib/env'                 // anywhere else on server
 */

const REQUIRED: Record<string, string> = {
  DATABASE_URL: 'PostgreSQL connection string (Supabase → Settings → Database → Connection string)',
  NEXTAUTH_SECRET: 'Random secret for JWT signing — generate with: openssl rand -hex 32',
  NEXTAUTH_URL: 'Full URL of the app (e.g. https://contractor.disasterrecovery.com.au)',
};

const RECOMMENDED: Record<string, string> = {
  JWT_SECRET: 'JWT token signing secret — falls back to NEXTAUTH_SECRET if unset (lib/auth)',
  ANTHROPIC_API_KEY: 'Anthropic API key — required for AI claim triage and agent workflows',
  MAILTRAP_API_KEY: 'Mailtrap send-only API key — required for every email (registration, notifications); lib/email/mailtrap',
  SENDER_EMAIL: 'Verified Mailtrap sending address, e.g. "NRPG <noreply@your-verified-domain>" — required with MAILTRAP_API_KEY',
  STRIPE_SECRET_KEY: 'Stripe secret key — required for contractor Stripe Connect payouts',
  STRIPE_WEBHOOK_SECRET: 'Stripe webhook signing secret — required for payment event processing',
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase project URL — required for real-time features',
  SUPABASE_SERVICE_ROLE_KEY: 'Supabase service role key — required for RLS bypass operations',
  GOOGLE_CLIENT_ID: 'Google OAuth client ID — required for Google sign-in (lib/auth)',
  GOOGLE_CLIENT_SECRET: 'Google OAuth client secret — required for Google sign-in (lib/auth)',
  GOOGLE_MAPS_API_KEY: 'Google Maps API key — required for geo matching and location services',
  XERO_CLIENT_ID: 'Xero client ID — required for invoice sync (lib/xero)',
  XERO_CLIENT_SECRET: 'Xero client secret — required for invoice sync (lib/xero)',
  UPSTASH_REDIS_REST_URL: 'Upstash Redis URL — required for distributed rate limiting (falls back to in-memory)',
  UPSTASH_REDIS_REST_TOKEN: 'Upstash Redis token — required for distributed rate limiting',
  CRON_SECRET: 'Cron authentication secret — required to authorise scheduled cron routes',
};

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validates environment variables at startup.
 *
 * Throws an error if any REQUIRED variable is absent.
 * Logs warnings for missing RECOMMENDED variables.
 *
 * Call this from instrumentation.ts (runs once per server startup).
 */
export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const [key, description] of Object.entries(REQUIRED)) {
    if (!process.env[key]) {
      missing.push(`  ✗ ${key}\n    ${description}`);
    }
  }

  for (const [key, description] of Object.entries(RECOMMENDED)) {
    if (!process.env[key]) {
      warnings.push(`  ⚠ ${key}\n    ${description}`);
    }
  }

  if (missing.length > 0) {
    const lines = [
      '',
      '┌─────────────────────────────────────────────────────┐',
      '│  FATAL: Required environment variables are missing  │',
      '└─────────────────────────────────────────────────────┘',
      '',
      ...missing,
      '',
      'Set these in your .env file (local) or Vercel project settings (production).',
      'See apps/web/.env.example for a full template.',
      '',
    ];
    throw new Error(lines.join('\n'));
  }

  if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn(
      [
        '',
        '┌─────────────────────────────────────────────────────────┐',
        '│  WARNING: Recommended environment variables are missing  │',
        '└─────────────────────────────────────────────────────────┘',
        '',
        ...warnings,
        '',
        'Some platform features will be unavailable.',
        '',
      ].join('\n')
    );
  }

  return { valid: true, missing: [], warnings: warnings.map(w => w.trim()) };
}

/**
 * Typed, validated access to environment variables.
 *
 * All properties are server-side only unless prefixed with NEXT_PUBLIC_.
 * Throws at access time if the variable is absent (belt + suspenders after
 * startup validation).
 */
function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

function optional(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export const env = {
  // Database
  databaseUrl: () => required('DATABASE_URL'),
  directUrl: () => optional('DIRECT_URL'),

  // Auth
  nextauthSecret: () => required('NEXTAUTH_SECRET'),
  nextauthUrl: () => required('NEXTAUTH_URL'),

  // AI
  anthropicApiKey: () => optional('ANTHROPIC_API_KEY'),
  openaiApiKey: () => optional('OPENAI_API_KEY'),

  // Payments
  stripeSecretKey: () => optional('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: () => optional('STRIPE_WEBHOOK_SECRET'),
  stripeConnectWebhookSecret: () => optional('STRIPE_CONNECT_WEBHOOK_SECRET'),
  stripePublishableKey: () => optional('STRIPE_PUBLISHABLE_KEY'),

  // Email
  mailtrapApiKey: () => optional('MAILTRAP_API_KEY'),
  senderEmail: () => optional('SENDER_EMAIL'),

  // Supabase
  supabaseUrl: () => optional('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: () => optional('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: () => optional('SUPABASE_SERVICE_ROLE_KEY'),

  // Storage
  storageType: () => optional('STORAGE_TYPE', 's3'),
  storageRegion: () => optional('STORAGE_REGION', 'ap-southeast-2'),
  storageBucket: () => optional('STORAGE_BUCKET_NAME'),
  storageAccessKeyId: () => optional('STORAGE_ACCESS_KEY_ID'),
  storageSecretAccessKey: () => optional('STORAGE_SECRET_ACCESS_KEY'),

  // Infrastructure
  redisUrl: () => optional('REDIS_URL', 'redis://localhost:6379'),
  cronSecret: () => optional('CRON_SECRET'),

  // Feature flags
  features: {
    aiClaimTriage: () => process.env.FEATURE_AI_CLAIM_TRIAGE === 'true',
    aiSemanticSearch: () => process.env.FEATURE_AI_SEMANTIC_SEARCH === 'true',
  },
} as const;
