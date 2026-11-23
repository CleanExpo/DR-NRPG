export type DrNrpgConnectionId =
  | "database"
  | "auth"
  | "supabase"
  | "stripe"
  | "email"
  | "ai_anthropic"
  | "redis"
  | "xero"
  | "printful"
  | "sentry"
  | "unite_group";

export type DrNrpgConnectionState =
  | "connected"
  | "ready"
  | "mock"
  | "blocked"
  | "unknown";

export type DrNrpgConnection = {
  id: DrNrpgConnectionId;
  label: string;
  state: DrNrpgConnectionState;
  safeForMissionControl: boolean;
  detail: string;
  endpoint?: string;
  nextAction?: string;
};

export type DrNrpgConnectionStatus = {
  source: "dr-nrpg:connection-status";
  generatedAt: string;
  project: {
    slug: "dr-nrpg";
    repo: "CleanExpo/DR-NRPG";
    service: "nrpg-web";
    environment: string;
  };
  summary: Record<DrNrpgConnectionState, number> & { total: number };
  connections: DrNrpgConnection[];
};

function envSet(name: string, env: NodeJS.ProcessEnv): boolean {
  return Boolean(env[name]?.trim());
}

function connectionSummary(
  connections: DrNrpgConnection[],
): DrNrpgConnectionStatus["summary"] {
  return {
    total: connections.length,
    connected: connections.filter((c) => c.state === "connected").length,
    ready: connections.filter((c) => c.state === "ready").length,
    mock: connections.filter((c) => c.state === "mock").length,
    blocked: connections.filter((c) => c.state === "blocked").length,
    unknown: connections.filter((c) => c.state === "unknown").length,
  };
}

/**
 * Presence-only readiness manifest for Unite-Group Mission Control polling.
 * States are derived from env-var presence, never from secret values, and no
 * secret material is ever included in the payload. "connected" is reserved
 * for infrastructure the app cannot boot without (mirrors lib/env.ts REQUIRED);
 * integrations whose live use is still gated report "ready" at best (mirrors
 * lib/env.ts RECOMMENDED).
 */
export function buildDrNrpgConnectionStatus(
  env: NodeJS.ProcessEnv = process.env,
  now = new Date().toISOString(),
): DrNrpgConnectionStatus {
  const environment = env.VERCEL_ENV?.trim() || env.NODE_ENV?.trim() || "development";

  const databaseReady = envSet("DATABASE_URL", env);
  const authReady = envSet("NEXTAUTH_SECRET", env) && envSet("NEXTAUTH_URL", env);
  const supabaseReady =
    envSet("NEXT_PUBLIC_SUPABASE_URL", env) && envSet("NEXT_PUBLIC_SUPABASE_ANON_KEY", env);
  const stripeReady = envSet("STRIPE_SECRET_KEY", env);
  const stripeWebhookReady = envSet("STRIPE_WEBHOOK_SECRET", env);
  const emailReady = envSet("MAILTRAP_API_KEY", env) && envSet("SENDER_EMAIL", env);
  const anthropicReady = envSet("ANTHROPIC_API_KEY", env);
  const redisReady = envSet("UPSTASH_REDIS_REST_URL", env) && envSet("UPSTASH_REDIS_REST_TOKEN", env);
  const xeroReady = envSet("XERO_CLIENT_ID", env) && envSet("XERO_CLIENT_SECRET", env);
  const printfulReady = envSet("PRINTFUL_API_KEY", env);
  const sentryReady = envSet("SENTRY_DSN", env) || envSet("NEXT_PUBLIC_SENTRY_DSN", env);

  const connections: DrNrpgConnection[] = [
    {
      id: "database",
      label: "Primary database (Prisma)",
      state: databaseReady ? "connected" : "blocked",
      safeForMissionControl: true,
      detail: databaseReady
        ? "DATABASE_URL is configured; metadata only exposed."
        : "DATABASE_URL is not set — Prisma cannot connect.",
      nextAction: databaseReady ? undefined : "Set DATABASE_URL in the deploy environment.",
    },
    {
      id: "auth",
      label: "Authentication (NextAuth)",
      state: authReady ? "connected" : "blocked",
      safeForMissionControl: true,
      detail: authReady
        ? "NextAuth secret and canonical URL are present."
        : "NEXTAUTH_SECRET and NEXTAUTH_URL are required for sign-in.",
      nextAction: authReady ? undefined : "Set NEXTAUTH_SECRET and NEXTAUTH_URL.",
    },
    {
      id: "supabase",
      label: "Supabase (storage + realtime)",
      state: supabaseReady ? "ready" : "blocked",
      safeForMissionControl: true,
      detail: supabaseReady
        ? "Supabase URL and anon key are present; storage/realtime features can run."
        : "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.",
      nextAction: supabaseReady ? undefined : "Set the Supabase public env pair.",
    },
    {
      id: "stripe",
      label: "Payments (Stripe)",
      state: stripeReady ? "ready" : "blocked",
      safeForMissionControl: true,
      detail: stripeReady
        ? stripeWebhookReady
          ? "Stripe secret and webhook secret present; contractor payouts remain verification-gated."
          : "Stripe secret present but STRIPE_WEBHOOK_SECRET is missing — payment events will fail."
        : "STRIPE_SECRET_KEY is not set.",
      nextAction: stripeReady
        ? stripeWebhookReady
          ? undefined
          : "Set STRIPE_WEBHOOK_SECRET."
        : "Set the Stripe key pair.",
    },
    {
      id: "email",
      label: "Transactional email",
      state: emailReady ? "ready" : "blocked",
      safeForMissionControl: true,
      detail: emailReady
        ? "Mailtrap key and sender present; sends remain policy-gated."
        : "MAILTRAP_API_KEY and SENDER_EMAIL are not both set — no email is sent.",
      nextAction: emailReady ? undefined : "Set MAILTRAP_API_KEY and SENDER_EMAIL.",
    },
    {
      id: "ai_anthropic",
      label: "Anthropic AI",
      state: anthropicReady ? "ready" : "blocked",
      safeForMissionControl: true,
      detail: anthropicReady
        ? "Anthropic key present; AI claim triage can run (billing applies on use)."
        : "ANTHROPIC_API_KEY is not set — AI claim triage degrades.",
      nextAction: anthropicReady ? undefined : "Set ANTHROPIC_API_KEY.",
    },
    {
      id: "redis",
      label: "Distributed rate limiting (Upstash Redis)",
      state: redisReady ? "ready" : "blocked",
      safeForMissionControl: true,
      detail: redisReady
        ? "Upstash Redis URL and token present; rate limiting is distributed."
        : "UPSTASH_REDIS_REST_URL/TOKEN are not set — falls back to in-memory rate limiting.",
      nextAction: redisReady ? undefined : "Set the Upstash Redis env pair.",
    },
    {
      id: "xero",
      label: "Xero accounting sync",
      state: xeroReady ? "ready" : "blocked",
      safeForMissionControl: true,
      detail: xeroReady
        ? "Xero client credential pair present; invoice sync remains OAuth-gated."
        : "XERO_CLIENT_ID and XERO_CLIENT_SECRET are required for invoice sync.",
      nextAction: xeroReady ? undefined : "Provision Xero OAuth client credentials.",
    },
    {
      id: "printful",
      label: "Printful dropshipping (NRPG Store)",
      state: printfulReady ? "ready" : "blocked",
      safeForMissionControl: true,
      detail: printfulReady
        ? "Printful API key present; store fulfilment can run."
        : "PRINTFUL_API_KEY is not set — no store fulfilment.",
      nextAction: printfulReady ? undefined : "Set PRINTFUL_API_KEY and PRINTFUL_STORE_ID.",
    },
    {
      id: "sentry",
      label: "Error monitoring (Sentry)",
      state: sentryReady ? "connected" : "unknown",
      safeForMissionControl: true,
      detail: sentryReady
        ? "Sentry DSN present; client/edge/server configs ship in this repo."
        : "No Sentry DSN detected — errors are not being reported.",
      nextAction: sentryReady ? undefined : "Set SENTRY_DSN (and NEXT_PUBLIC_SENTRY_DSN).",
    },
    {
      id: "unite_group",
      label: "Unite-Group Mission Control",
      state: "ready",
      safeForMissionControl: true,
      detail:
        "This manifest is designed for Unite-Group to poll and show DR-NRPG readiness without secrets.",
      endpoint: "/api/v1/connections/status",
      nextAction: "Add this endpoint to the Unite-Group project registry.",
    },
  ];

  return {
    source: "dr-nrpg:connection-status",
    generatedAt: now,
    project: {
      slug: "dr-nrpg",
      repo: "CleanExpo/DR-NRPG",
      service: "nrpg-web",
      environment,
    },
    summary: connectionSummary(connections),
    connections,
  };
}
