SET lock_timeout = '5s';

-- Enable row level security on the 18 public tables that a fresh build from
-- this migration chain still leaves with RLS off.
--
-- Production (lccqasmurmsisnnjqqmr) already has relrowsecurity = true and no
-- policies on all 18 (read-only catalog check, 2026-10-22), so this migration
-- changes nothing there. It exists so that any new environment built with
-- `prisma migrate deploy` matches production instead of exposing these tables
-- to the anon and authenticated roles through /rest/v1.
--
-- No policies are added, for the same reasons as
-- 20261022000000_enable_rls_public_tables: the app uses Prisma as the table
-- owner (BYPASSRLS, RLS not FORCEd) and server supabase-js uses service_role.
--
-- Tables absent on a given database are skipped (IF EXISTS). Idempotent.
--
-- Rollback: ALTER TABLE ... DISABLE ROW LEVEL SECURITY on the same tables
-- (re-opens them to anon wherever table grants exist).

ALTER TABLE IF EXISTS "public"."ClaimNotification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ContractorNotification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ContractorSubscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."Enquiry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ErrorLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."JobOffer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."OnboardingPayment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."Partner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."PartnerBilling" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ProofOfWork" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."PushToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."contractor_agreement_acceptances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."contractor_training_modules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."contractor_training_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."field_service_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."lead_notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."lead_tracking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."leads" ENABLE ROW LEVEL SECURITY;
