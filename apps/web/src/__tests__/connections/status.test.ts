import { buildDrNrpgConnectionStatus } from "@/lib/connections/status";

const EMPTY_ENV = {} as NodeJS.ProcessEnv;

const FULL_ENV = {
  VERCEL_ENV: "production",
  DATABASE_URL: "postgresql://user:redacted@host/db",
  NEXTAUTH_SECRET: "nextauth-secret-value",
  NEXTAUTH_URL: "https://nrpg.example",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key-value",
  STRIPE_SECRET_KEY: "sk_test_value",
  STRIPE_WEBHOOK_SECRET: "whsec_value",
  MAILTRAP_API_KEY: "mailtrap-key-value",
  SENDER_EMAIL: "noreply@nrpg.example",
  ANTHROPIC_API_KEY: "sk-ant-value",
  UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
  UPSTASH_REDIS_REST_TOKEN: "upstash-token-value",
  XERO_CLIENT_ID: "xero-client-id",
  XERO_CLIENT_SECRET: "xero-client-secret-value",
  PRINTFUL_API_KEY: "printful-key-value",
  SENTRY_DSN: "https://abc@sentry.example/1",
} as unknown as NodeJS.ProcessEnv;

describe("buildDrNrpgConnectionStatus", () => {
  it("reports blocked/unknown states when env is empty", () => {
    const status = buildDrNrpgConnectionStatus(EMPTY_ENV, "2026-07-02T00:00:00.000Z");
    const byId = Object.fromEntries(status.connections.map((c) => [c.id, c]));

    expect(byId.database.state).toBe("blocked");
    expect(byId.auth.state).toBe("blocked");
    expect(byId.supabase.state).toBe("blocked");
    expect(byId.stripe.state).toBe("blocked");
    expect(byId.email.state).toBe("blocked");
    expect(byId.ai_anthropic.state).toBe("blocked");
    expect(byId.redis.state).toBe("blocked");
    expect(byId.xero.state).toBe("blocked");
    expect(byId.printful.state).toBe("blocked");
    expect(byId.sentry.state).toBe("unknown");
    expect(byId.unite_group.state).toBe("ready");
    expect(status.summary.total).toBe(status.connections.length);
    expect(status.summary.blocked).toBeGreaterThan(0);
  });

  it("reports connected/ready states with a fully configured env", () => {
    const status = buildDrNrpgConnectionStatus(FULL_ENV, "2026-07-02T00:00:00.000Z");
    const byId = Object.fromEntries(status.connections.map((c) => [c.id, c]));

    expect(byId.database.state).toBe("connected");
    expect(byId.auth.state).toBe("connected");
    expect(byId.supabase.state).toBe("ready");
    expect(byId.stripe.state).toBe("ready");
    expect(byId.email.state).toBe("ready");
    expect(byId.ai_anthropic.state).toBe("ready");
    expect(byId.redis.state).toBe("ready");
    expect(byId.xero.state).toBe("ready");
    expect(byId.printful.state).toBe("ready");
    expect(byId.sentry.state).toBe("connected");
    expect(status.project.environment).toBe("production");
    expect(status.summary.blocked).toBe(0);
  });

  it("flags a missing Stripe webhook secret without blocking", () => {
    const env = { ...FULL_ENV, STRIPE_WEBHOOK_SECRET: "" } as NodeJS.ProcessEnv;
    const status = buildDrNrpgConnectionStatus(env, "2026-07-02T00:00:00.000Z");
    const stripe = status.connections.find((c) => c.id === "stripe");

    expect(stripe?.state).toBe("ready");
    expect(stripe?.nextAction).toBe("Set STRIPE_WEBHOOK_SECRET.");
  });

  it("never leaks secret values into the payload", () => {
    const status = buildDrNrpgConnectionStatus(FULL_ENV, "2026-07-02T00:00:00.000Z");
    const serialized = JSON.stringify(status);

    for (const secret of [
      "redacted",
      "nextauth-secret-value",
      "anon-key-value",
      "sk_test_value",
      "whsec_value",
      "re_value",
      "sk-ant-value",
      "upstash-token-value",
      "xero-client-secret-value",
      "printful-key-value",
    ]) {
      expect(serialized).not.toContain(secret);
    }
  });
});
