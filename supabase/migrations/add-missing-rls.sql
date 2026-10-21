-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
-- SUPERSEDED. DO NOT RUN THIS FILE. (2026-10-22)
-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
-- Running this script REINSTATES the security hole closed by
--   apps/web/prisma/migrations/20261022010000_tenant_rls_deny_without_tenant
-- Its policies pass whenever current_tenant_id() IS NULL, and nothing sets
-- app.current_tenant_id, so every anon/authenticated /rest/v1 request
-- would again read and write users, xero_tokens and the other tables below.
--
-- Tenant RLS policies are owned by the Prisma migration chain
-- (apps/web/prisma/migrations), applied by `prisma migrate deploy`.
-- This file is kept for history only. No automation applies it (the
-- name does not match the Supabase CLI <timestamp>_name.sql pattern);
-- do not paste it into the SQL editor.
-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

-- ===================================================================
-- Missing RLS Policies — DR-196 Audit (idempotent version)
-- ===================================================================
-- Uses DROP POLICY IF EXISTS before each CREATE POLICY so this script
-- can be re-run safely without the 42710 "already exists" error.
-- ===================================================================

-- ===================================================================
-- 1. Enable RLS on missing tables (safe to run multiple times)
-- ===================================================================

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contractor_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "xero_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenant_configurations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_image_enhancement_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_batch_processing_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "background_jobs" ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- 2. CRITICAL: users
-- ===================================================================

DROP POLICY IF EXISTS "tenant_isolation_select" ON "users";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "users";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "users";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "users";

CREATE POLICY "tenant_isolation_select" ON "users"
  FOR SELECT USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_insert" ON "users"
  FOR INSERT WITH CHECK (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_update" ON "users"
  FOR UPDATE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_delete" ON "users"
  FOR DELETE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

-- ===================================================================
-- 3. HIGH: service_requests
-- ===================================================================

DROP POLICY IF EXISTS "tenant_isolation_select" ON "service_requests";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "service_requests";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "service_requests";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "service_requests";

CREATE POLICY "tenant_isolation_select" ON "service_requests"
  FOR SELECT USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_insert" ON "service_requests"
  FOR INSERT WITH CHECK (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_update" ON "service_requests"
  FOR UPDATE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_delete" ON "service_requests"
  FOR DELETE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

-- ===================================================================
-- 4. HIGH: contractor_profiles
-- ===================================================================

DROP POLICY IF EXISTS "tenant_isolation_select" ON "contractor_profiles";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "contractor_profiles";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "contractor_profiles";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "contractor_profiles";

CREATE POLICY "tenant_isolation_select" ON "contractor_profiles"
  FOR SELECT USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_insert" ON "contractor_profiles"
  FOR INSERT WITH CHECK (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_update" ON "contractor_profiles"
  FOR UPDATE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_delete" ON "contractor_profiles"
  FOR DELETE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

-- ===================================================================
-- 5. HIGH: messages
-- ===================================================================

DROP POLICY IF EXISTS "tenant_isolation_select" ON "messages";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "messages";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "messages";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "messages";

CREATE POLICY "tenant_isolation_select" ON "messages"
  FOR SELECT USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_insert" ON "messages"
  FOR INSERT WITH CHECK (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_update" ON "messages"
  FOR UPDATE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_delete" ON "messages"
  FOR DELETE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

-- ===================================================================
-- 6. HIGH: jobs
-- ===================================================================

DROP POLICY IF EXISTS "tenant_isolation_select" ON "jobs";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "jobs";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "jobs";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "jobs";

CREATE POLICY "tenant_isolation_select" ON "jobs"
  FOR SELECT USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_insert" ON "jobs"
  FOR INSERT WITH CHECK (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_update" ON "jobs"
  FOR UPDATE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_delete" ON "jobs"
  FOR DELETE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

-- ===================================================================
-- 7. CRITICAL: xero_tokens
-- ===================================================================

DROP POLICY IF EXISTS "tenant_isolation_select" ON "xero_tokens";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "xero_tokens";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "xero_tokens";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "xero_tokens";

CREATE POLICY "tenant_isolation_select" ON "xero_tokens"
  FOR SELECT USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_insert" ON "xero_tokens"
  FOR INSERT WITH CHECK (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_update" ON "xero_tokens"
  FOR UPDATE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_delete" ON "xero_tokens"
  FOR DELETE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

-- ===================================================================
-- 8. MEDIUM: tenant_configurations
-- ===================================================================

DROP POLICY IF EXISTS "tenant_isolation_select" ON "tenant_configurations";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "tenant_configurations";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "tenant_configurations";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "tenant_configurations";

CREATE POLICY "tenant_isolation_select" ON "tenant_configurations"
  FOR SELECT USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_insert" ON "tenant_configurations"
  FOR INSERT WITH CHECK (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_update" ON "tenant_configurations"
  FOR UPDATE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_delete" ON "tenant_configurations"
  FOR DELETE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

-- ===================================================================
-- 9. LOW: ai_image_enhancement_logs
-- ===================================================================

DROP POLICY IF EXISTS "tenant_isolation_select" ON "ai_image_enhancement_logs";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "ai_image_enhancement_logs";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "ai_image_enhancement_logs";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "ai_image_enhancement_logs";

CREATE POLICY "tenant_isolation_select" ON "ai_image_enhancement_logs"
  FOR SELECT USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_insert" ON "ai_image_enhancement_logs"
  FOR INSERT WITH CHECK (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_update" ON "ai_image_enhancement_logs"
  FOR UPDATE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_delete" ON "ai_image_enhancement_logs"
  FOR DELETE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

-- ===================================================================
-- 10. LOW: ai_batch_processing_jobs
-- ===================================================================

DROP POLICY IF EXISTS "tenant_isolation_select" ON "ai_batch_processing_jobs";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "ai_batch_processing_jobs";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "ai_batch_processing_jobs";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "ai_batch_processing_jobs";

CREATE POLICY "tenant_isolation_select" ON "ai_batch_processing_jobs"
  FOR SELECT USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_insert" ON "ai_batch_processing_jobs"
  FOR INSERT WITH CHECK (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_update" ON "ai_batch_processing_jobs"
  FOR UPDATE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_delete" ON "ai_batch_processing_jobs"
  FOR DELETE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

-- ===================================================================
-- 11. LOW: background_jobs
-- ===================================================================

DROP POLICY IF EXISTS "tenant_isolation_select" ON "background_jobs";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "background_jobs";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "background_jobs";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "background_jobs";

CREATE POLICY "tenant_isolation_select" ON "background_jobs"
  FOR SELECT USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_insert" ON "background_jobs"
  FOR INSERT WITH CHECK (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_update" ON "background_jobs"
  FOR UPDATE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

CREATE POLICY "tenant_isolation_delete" ON "background_jobs"
  FOR DELETE USING (
    "tenantId" IS NULL OR
    "tenantId" = current_tenant_id() OR
    current_tenant_id() IS NULL
  );

-- ===================================================================
-- VERIFICATION QUERY (uncomment to run after applying)
-- ===================================================================
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN (
--   'users', 'service_requests', 'contractor_profiles', 'messages',
--   'jobs', 'xero_tokens', 'tenant_configurations',
--   'ai_image_enhancement_logs', 'ai_batch_processing_jobs', 'background_jobs'
-- )
-- ORDER BY tablename;
