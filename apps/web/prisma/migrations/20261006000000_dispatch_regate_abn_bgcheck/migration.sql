-- DR-900: dispatch re-gate inputs. Additive, nullable, no backfill: NULL means
-- "no cancellation recorded" / "no expiry recorded", so no existing contractor
-- changes eligibility when this migration lands.
ALTER TABLE "Contractor" ADD COLUMN IF NOT EXISTS "backgroundCheckExpiresAt" TIMESTAMP(3);
ALTER TABLE "Contractor" ADD COLUMN IF NOT EXISTS "abnCancelledAt" TIMESTAMP(3);
