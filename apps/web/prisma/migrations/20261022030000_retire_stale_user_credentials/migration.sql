-- Retire stale credentials on four accounts (founder decision, 22/10/2026).
--
-- A credentials audit found four users whose passwords had never been rotated and whose
-- email was never verified. Two belong to partner businesses; two are test accounts.
-- Rows are named by id only: this repository is public, and an id identifies nobody
-- without database access.
--
--   Partner accounts: the password and any pending tokens are cleared, so the old password
--   no longer works. The account and everything linked to it stay. Login denies a null
--   password (apps/web/lib/auth.ts). A new password is set only if the partner asks.
--
--   Test accounts: switched off (isActive = false) and cleared the same way. Not deleted:
--   users rows cascade into bookings, payments and messages.
--
-- Data only, no schema change. Replay-safe: the WHERE clauses match nothing a second time
-- and nothing at all in a database that never had these rows (CI, local).
--
-- passwordResetToken / passwordResetExpiry exist in production but not in schema.prisma,
-- so they are cleared only where the columns exist.
--
-- Rollback: none for the cleared values (the old hashes are gone by design). To reopen a
-- test account: UPDATE public.users SET "isActive" = true WHERE id = '<id>';

UPDATE public.users
SET password = NULL,
    "emailVerificationToken" = NULL,
    "emailVerificationTokenExpiry" = NULL,
    "updatedAt" = now()
WHERE id IN ('1c8e96fb-6e42-45f3-a036-65d76fe3646c', 'cmugjr6u80001rbo5s967vp67')
  AND (password IS NOT NULL OR "emailVerificationToken" IS NOT NULL);

UPDATE public.users
SET "isActive" = false,
    password = NULL,
    "emailVerificationToken" = NULL,
    "emailVerificationTokenExpiry" = NULL,
    "updatedAt" = now()
WHERE id IN ('cmk8gw3xk0000ss31e46a6u6r', 'cmu05e9uu0001jymexgbh8n09')
  AND ("isActive" OR password IS NOT NULL OR "emailVerificationToken" IS NOT NULL);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'users'
               AND column_name = 'passwordResetToken') THEN
    EXECUTE $sql$
      UPDATE public.users
      SET "passwordResetToken" = NULL
      WHERE id IN ('1c8e96fb-6e42-45f3-a036-65d76fe3646c', 'cmugjr6u80001rbo5s967vp67',
                   'cmk8gw3xk0000ss31e46a6u6r', 'cmu05e9uu0001jymexgbh8n09')
        AND "passwordResetToken" IS NOT NULL
    $sql$;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'users'
               AND column_name = 'passwordResetExpiry') THEN
    EXECUTE $sql$
      UPDATE public.users
      SET "passwordResetExpiry" = NULL
      WHERE id IN ('1c8e96fb-6e42-45f3-a036-65d76fe3646c', 'cmugjr6u80001rbo5s967vp67',
                   'cmk8gw3xk0000ss31e46a6u6r', 'cmu05e9uu0001jymexgbh8n09')
        AND "passwordResetExpiry" IS NOT NULL
    $sql$;
  END IF;
END
$$;
