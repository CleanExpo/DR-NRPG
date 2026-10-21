SET lock_timeout = '5s';

-- Enable row level security on the 75 public tables that had it off.
--
-- Supabase advisor ERROR rls_disabled_in_public = 75 on lccqasmurmsisnnjqqmr,
-- and anon held SELECT, INSERT and DELETE on all 75 (audit 2026-10-22), so the
-- public anon key, which ships in the browser bundle, could read and write
-- ContractorPayment, contractor_payouts, audit_logs, tenants, workspaces,
-- client_emergency_contacts and the rest straight through /rest/v1.
--
-- NO POLICIES ARE ADDED, on purpose. RLS with no policy denies anon and
-- authenticated everything, and nothing legitimate reaches these tables that
-- way:
--   * The app reads and writes through Prisma (DATABASE_URL / DIRECT_URL) as
--     the table owner `postgres`, which has BYPASSRLS. RLS is not FORCEd on
--     any public table, so the owner path is unchanged.
--   * Public forms are server routes using Prisma, not supabase-js:
--     /api/public/newsletter (newsletter_subscriptions) and
--     /api/public/contractor/application (contractor_applications).
--   * supabase-js with the service-role key (lib/supabase/server.ts,
--     lib/storage/cloud-storage.ts, api/health/deep) bypasses RLS.
--   * supabase-js with the anon key (lib/supabase/client.ts,
--     lib/realtime/supabase-realtime.ts and the realtime hooks) uses only
--     Realtime broadcast and presence channels: no table queries and no
--     postgres_changes. The supabase_realtime publication holds no tables.
--
-- IF EXISTS: the list is the live catalog's, and some of these tables are not
-- declared in schema.prisma, so a fresh `migrate deploy` may not have them.
-- Idempotent: enabling RLS twice is a no-op.
--
-- Rollback: ALTER TABLE ... DISABLE ROW LEVEL SECURITY on the same list
-- (restores the exposure).

ALTER TABLE IF EXISTS "public"."BotConversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."CallTranscript" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ClaimPhotoAttachment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."CompetencyTestResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ContractorAuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ContractorCompany" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ContractorDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ContractorInsurance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ContractorKPI" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ContractorPayment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ContractorServiceArea" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ContractorTerritory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ContractorVerificationHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."DisasterAlert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."FinanceReferral" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."FinanceReferralEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."IICRCCertification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."RedditContentPillar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."RedditOrchestratorRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."RedditPerformanceLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."RedditPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."RedditSafetyAudit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."RedditSystemPrompt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."RiskAssessment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."SubContractor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."SubContractorEngagement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."VoiceCall" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."WebhookDelivery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."admin_service_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."admin_services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."admin_themes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."backlinks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."blog_faqs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."business_rule_violations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."business_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."client_emergency_contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."client_module_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."competitor_analyses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."competitor_keywords" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."competitors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."connection_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."contact_enquiries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."contractor_applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."contractor_inquiries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."contractor_location_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."contractor_matches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."contractor_payouts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."contractor_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."contractor_rotation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."job_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."job_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."job_outcome_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."job_photos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."keyword_opportunities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."lead_captures" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."newsletter_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."notification_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."notification_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."nrpg_certification_points" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."nrpg_commitments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."nrpg_onboarding_phases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."nrpg_training_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."public_claims" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."realtime_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."service_request_callout_payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."swot_analyses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."triage_assessments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."user_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."waitlist_submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."workspace_audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."workspace_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."workspaces" ENABLE ROW LEVEL SECURITY;
