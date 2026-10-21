-- Close the "no tenant set" hole in the tenant_isolation_* policies.
--
-- 20260710000002_reinstate_tenant_rls gave every tenant-scoped table four
-- policies (TO PUBLIC) whose condition was
--   "tenantId" IS NULL OR "tenantId" = current_tenant_id() OR current_tenant_id() IS NULL
-- current_tenant_id() reads the app.current_tenant_id GUC, which nothing in
-- this codebase ever sets, so it is NULL for every PostgREST request. Anon
-- therefore passed every policy and could read, insert, update and delete
-- rows of every tenant through /rest/v1 (anon holds table grants on public).
-- The live catalog also carried a drifted Booking "tenant_isolation_delete"
-- defined FOR ALL with no condition, which allowed everything on Booking.
--
-- New rule (deny when no tenant is set):
--   SELECT: a tenant must be set; then own-tenant rows plus shared rows
--           ("tenantId" IS NULL).
--   INSERT / UPDATE / DELETE: only rows whose "tenantId" equals the set
--           tenant. Shared (NULL-tenant) rows are writable only by roles that
--           bypass RLS.
--
-- Who is affected: nobody legitimate. Prisma connects as the table owner
-- (postgres, BYPASSRLS, RLS not FORCEd) and supabase-js server code uses the
-- service_role key (BYPASSRLS). The anon-key client is used only for Realtime
-- broadcast/presence, with no table queries and no postgres_changes. No code
-- sets app.current_tenant_id, so no request relied on the tenant branch either.
--
-- Same 55 tables as 20260710000002. Tables absent on a given database are
-- skipped. Idempotent: drops then recreates the four policies by name.
--
-- Rollback: re-run the policy block of 20260710000002_reinstate_tenant_rls
-- (restores the old, permissive condition and therefore the exposure).

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'AuditLog',
    'Booking',
    'Contractor',
    'InsuranceClaimAU',
    'InsuranceProvider',
    'InvoiceAU',
    'LoginAttempt',
    'Payment',
    'Rating',
    'VerificationToken',
    'activities',
    'ai_batch_processing_jobs',
    'ai_image_enhancement_logs',
    'audit_logs',
    'background_jobs',
    'beta_enrollments',
    'beta_feedback',
    'beta_nps_surveys',
    'beta_programs',
    'blog_posts',
    'case_studies',
    'client_insurance',
    'client_onboarding',
    'client_payments',
    'client_profiles',
    'client_properties',
    'compliance_checks',
    'contractor_assessments',
    'contractor_certifications',
    'contractor_matches',
    'contractor_module_progress',
    'contractor_onboarding',
    'contractor_profiles',
    'cost_estimates',
    'customer_lifecycle',
    'damage_areas',
    'equipment_line_items',
    'faqs',
    'inspection_photos',
    'inspection_reports',
    'job_outcome_logs',
    'jobs',
    'labor_line_items',
    'material_line_items',
    'messages',
    'moisture_readings',
    'opportunities',
    'public_claims',
    'report_revisions',
    'service_requests',
    'tasks',
    'tenant_configurations',
    'triage_assessments',
    'users',
    'xero_tokens'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF to_regclass(format('public.%I', t)) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_select" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_insert" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_update" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_delete" ON public.%I', t);

    EXECUTE format(
      'CREATE POLICY "tenant_isolation_select" ON public.%I FOR SELECT USING ('
      || 'current_tenant_id() IS NOT NULL AND '
      || '("tenantId" IS NULL OR "tenantId" = current_tenant_id()))', t);

    EXECUTE format(
      'CREATE POLICY "tenant_isolation_insert" ON public.%I FOR INSERT WITH CHECK ('
      || '"tenantId" = current_tenant_id())', t);

    EXECUTE format(
      'CREATE POLICY "tenant_isolation_update" ON public.%I FOR UPDATE USING ('
      || '"tenantId" = current_tenant_id()) WITH CHECK ('
      || '"tenantId" = current_tenant_id())', t);

    EXECUTE format(
      'CREATE POLICY "tenant_isolation_delete" ON public.%I FOR DELETE USING ('
      || '"tenantId" = current_tenant_id())', t);
  END LOOP;
END
$$;
