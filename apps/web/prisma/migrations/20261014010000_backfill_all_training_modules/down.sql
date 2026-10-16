-- Rollback for 20261014010000_backfill_all_training_modules.
-- Not run by `prisma migrate deploy`; run by hand with `prisma db execute --file`.
--
-- Deletes backfilled rows the contractor has not touched yet. A backfilled row the
-- contractor has started or passed is kept, so no training progress is lost.

DELETE FROM "contractor_module_progress"
WHERE "createdAt" = TIMESTAMP '2026-10-14 01:00:00'
  AND "status" = 'NOT_STARTED'
  AND "progress" = 0
  AND "startedAt" IS NULL
  AND "completedAt" IS NULL;
