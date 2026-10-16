-- B2: give every started onboarding all 24 canonical training modules.
--
-- The certificate is issued only when ALL of NRP-001..NRP-024 are passed (DR-893),
-- but onboarding start used to seed only the recommended subset (7 core plus the
-- specialisation, at most 12). Those contractors could never earn the certificate.
-- New onboardings now seed all 24 (app/api/onboarding/start/route.ts).
--
-- Data only. Inserts each missing canonical module as NOT_STARTED for every
-- onboarding that already has at least one module row. Existing rows and progress
-- are never changed. Replay-safe: NOT EXISTS skips modules already present.
--
-- Backfilled rows carry createdAt = '2026-10-14 01:00:00' so they sort after the modules
-- the contractor already has, and so down.sql can find them.
--
-- Rollback: down.sql in this folder, run with
--   prisma db execute --file prisma/migrations/20261014010000_backfill_all_training_modules/down.sql
-- then `prisma migrate resolve --rolled-back 20261014010000_backfill_all_training_modules`.

INSERT INTO "contractor_module_progress"
  ("onboardingId", "moduleId", "courseName", "status", "progress", "completed", "createdAt", "tenantId")
SELECT o."id", c."moduleId", c."courseName", 'NOT_STARTED'::"ModuleStatus", 0, false, TIMESTAMP '2026-10-14 01:00:00', o."tenantId"
FROM "contractor_onboarding" o
CROSS JOIN (VALUES
  ('NRP-001', 'NRP-001: Membership Registration - Complete Training Module'),
  ('NRP-002', 'NRP-002: Environmental Assessment & Testing'),
  ('NRP-003', 'NRP-003: Insurance & Claims Management'),
  ('NRP-004', 'NRP-004: Professional Documentation & Reporting'),
  ('NRP-005', 'NRP-005: Health & Safety Compliance'),
  ('NRP-006', 'NRP-006: Structural Drying & Dehumidification'),
  ('NRP-007', 'NRP-007: Mould Remediation Protocols'),
  ('NRP-008', 'NRP-008: Fire & Smoke Damage Restoration'),
  ('NRP-009', 'NRP-009: Contents Restoration & Pack-Out'),
  ('NRP-010', 'NRP-010: Biohazard & Trauma Cleanup - Complete Training Module'),
  ('NRP-011', 'NRP-011: Carpet & Upholstery Cleaning - Complete Training Module'),
  ('NRP-012', 'NRP-012: Odour Control & Deodorisation - Complete Training Module'),
  ('NRP-013', 'NRP-013: Emergency Response Procedures - Complete Training Module'),
  ('NRP-014', 'NRP-014: Equipment Management & Maintenance - Complete Training Module'),
  ('NRP-015', 'NRP-015: Customer Service Excellence - Complete Training Module'),
  ('NRP-016', 'NRP-016: Project Management & Scheduling - Complete Training Module'),
  ('NRP-017', 'NRP-017: Cost Estimation & Pricing - Complete Training Module'),
  ('NRP-018', 'NRP-018: Quality Assurance & Control - Complete Training Module'),
  ('NRP-019', 'NRP-019: Business Development & Marketing - Complete Training Module'),
  ('NRP-020', 'NRP-020: Advanced Restoration Technologies - Complete Training Module'),
  ('NRP-021', 'NRP-021: DR-NRPG Platform Operations Guide - Complete Training Module'),
  ('NRP-022', 'NRP-022: Continual Education Credits System - Complete Training Module'),
  ('NRP-023', 'NRP-023: Association Memberships & Benefits - Complete Training Module'),
  ('NRP-024', 'NRP-024: Members Gatherings & Networking - Complete Training Module')
) AS c("moduleId", "courseName")
WHERE EXISTS (
  SELECT 1 FROM "contractor_module_progress" p WHERE p."onboardingId" = o."id"
)
AND NOT EXISTS (
  SELECT 1 FROM "contractor_module_progress" p
  WHERE p."onboardingId" = o."id" AND upper(p."moduleId") = c."moduleId"
);
