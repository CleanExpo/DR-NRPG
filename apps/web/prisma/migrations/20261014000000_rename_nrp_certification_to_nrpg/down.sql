-- Rollback for 20261014000000_rename_nrp_certification_to_nrpg.
-- Not run by `prisma migrate deploy`; run by hand with `prisma db execute --file`.
--
-- Renames EVERY row back, including certificates issued under the new name after
-- the migration, so code that only knows the old name still finds them.
-- With the dual-name code deployed, this rollback is not needed for correctness.

UPDATE "contractor_certifications"
SET "certificationName" = 'NRP Contractor Certification'
WHERE "certificationName" = 'NRPG Contractor Certification';
