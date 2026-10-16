-- NRP is now NRPG: rename the stored name of the auto-issued training certificate.
--
-- Data only. No schema change. Safe to replay (the WHERE clause matches nothing
-- on a second run).
--
-- Order does not matter: the app matches certificates on BOTH names
-- (NRPG_CERTIFICATION_NAMES in lib/training/training-policy.ts), so a certified
-- contractor stays dispatch-eligible before, during and after this update.
--
-- Rollback: down.sql in this folder, run with
--   prisma db execute --file prisma/migrations/20261014000000_rename_nrp_certification_to_nrpg/down.sql
-- then `prisma migrate resolve --rolled-back 20261014000000_rename_nrp_certification_to_nrpg`.
--
-- audit_logs rows keep the old name on purpose: they are history.

UPDATE "contractor_certifications"
SET "certificationName" = 'NRPG Contractor Certification'
WHERE "certificationName" = 'NRP Contractor Certification';
