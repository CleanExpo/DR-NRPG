/**
 * PostgreSQL RLS acceptance probe.
 *
 * This suite authenticates through a dedicated non-owner, non-superuser,
 * non-BYPASSRLS login role. It deliberately uses raw SQL so explicit Prisma
 * tenant filters cannot create a false isolation result.
 *
 * Policy semantics (20261022010000_tenant_rls_deny_without_tenant): with no
 * session tenant set, every tenant-scoped row is invisible and every write is
 * refused. With a tenant set, SELECT sees own-tenant rows plus shared rows
 * (tenantId NULL); INSERT, UPDATE and DELETE reach only own-tenant rows, so
 * shared rows are writable only by roles that bypass RLS.
 */
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Prisma, PrismaClient } from '@prisma/client'
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required for the PostgreSQL RLS acceptance probe')
}
const testId = `${process.pid}_${Date.now()}`
const roleName = `rls_acceptance_${testId}`
const rolePassword = `rls-test-${testId}`
const tenantAId = `rls-tenant-a-${testId}`
const tenantBId = `rls-tenant-b-${testId}`
const userAId = `rls-user-a-${testId}`
const userBId = `rls-user-b-${testId}`
const legacyUserId = `rls-user-legacy-${testId}`
const admin = new PrismaClient({
  datasources: { db: { url: databaseUrl } },
})
let restricted: PrismaClient | undefined
function restrictedDatabaseUrl(): string {
  const url = new URL(databaseUrl as string)
  url.username = roleName
  url.password = rolePassword
  return url.toString()
}
async function withTenant<T>(
  tenantId: string | null,
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  if (!restricted) {
    throw new Error('Restricted RLS client has not been initialised')
  }
  return restricted.$transaction(async (tx) => {
    await tx.$queryRaw`
      SELECT set_config('app.current_tenant_id', ${tenantId ?? ''}, true)
    `
    return operation(tx)
  })
}
type UserRow = {
  id: string
  tenantId: string | null
  name: string | null
}
type RoleRow = {
  role_name: string
  is_superuser: boolean
  bypasses_rls: boolean
  owns_users_table: boolean
}
type PolicyCoverageRow = {
  table_name: string
  rls_enabled: boolean
  commands: string[]
}
describe('PostgreSQL row-level tenant isolation', () => {
  beforeAll(async () => {
    await admin.$connect()
    await admin.$executeRaw`
      INSERT INTO "tenants" ("id", "name", "updatedAt")
      VALUES
        (${tenantAId}, 'RLS acceptance tenant A', NOW()),
        (${tenantBId}, 'RLS acceptance tenant B', NOW())
    `
    await admin.$executeRaw`
      INSERT INTO "users" ("id", "email", "name", "tenantId", "updatedAt")
      VALUES
        (${userAId}, ${`${userAId}@example.invalid`}, 'Tenant A original', ${tenantAId}, NOW()),
        (${userBId}, ${`${userBId}@example.invalid`}, 'Tenant B original', ${tenantBId}, NOW()),
        (${legacyUserId}, ${`${legacyUserId}@example.invalid`}, 'Legacy NULL tenant', NULL, NOW())
    `
    await admin.$executeRawUnsafe(`
      CREATE ROLE "${roleName}"
        LOGIN
        PASSWORD '${rolePassword}'
        NOSUPERUSER
        NOCREATEDB
        NOCREATEROLE
        NOINHERIT
        NOBYPASSRLS
    `)
    await admin.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO "${roleName}"`)
    await admin.$executeRawUnsafe(
      `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "users" TO "${roleName}"`,
    )
    restricted = new PrismaClient({
      datasources: { db: { url: restrictedDatabaseUrl() } },
    })
    await restricted.$connect()
  })
  afterAll(async () => {
    await restricted?.$disconnect()
    await admin.$executeRaw`
      DELETE FROM "users"
      WHERE "id" IN (${userAId}, ${userBId}, ${legacyUserId})
         OR "id" LIKE ${`rls-insert-${testId}-%`}
    `
    await admin.$executeRaw`
      DELETE FROM "tenants" WHERE "id" IN (${tenantAId}, ${tenantBId})
    `
    await admin.$executeRawUnsafe(`DROP OWNED BY "${roleName}"`)
    await admin.$executeRawUnsafe(`DROP ROLE IF EXISTS "${roleName}"`)
    await admin.$disconnect()
  })
  it('authenticates as a non-owner, non-superuser, non-BYPASSRLS role', async () => {
    const rows = await restricted!.$queryRaw<RoleRow[]>`
      SELECT
        current_user AS role_name,
        role.rolsuper AS is_superuser,
        role.rolbypassrls AS bypasses_rls,
        table_class.relowner = role.oid AS owns_users_table
      FROM pg_roles AS role
      CROSS JOIN pg_class AS table_class
      JOIN pg_namespace AS namespace ON namespace.oid = table_class.relnamespace
      WHERE role.rolname = current_user
        AND namespace.nspname = 'public'
        AND table_class.relname = 'users'
    `
    expect(rows).toEqual([
      {
        role_name: roleName,
        is_superuser: false,
        bypasses_rls: false,
        owns_users_table: false,
      },
    ])
  })
  it('has RLS and all four CRUD policies on all 55 baseline tenantId tables', async () => {
    const rows = await admin.$queryRaw<PolicyCoverageRow[]>`
      SELECT
        tables.relname AS table_name,
        tables.relrowsecurity AS rls_enabled,
        COALESCE(
          array_agg(DISTINCT policies.cmd ORDER BY policies.cmd)
            FILTER (WHERE policies.cmd IS NOT NULL),
          ARRAY[]::text[]
        ) AS commands
      FROM pg_class AS tables
      JOIN pg_namespace AS namespace ON namespace.oid = tables.relnamespace
      JOIN information_schema.columns AS tenant_columns
        ON tenant_columns.table_schema = namespace.nspname
       AND tenant_columns.table_name = tables.relname
       AND tenant_columns.column_name = 'tenantId'
      LEFT JOIN pg_policies AS policies
        ON policies.schemaname = namespace.nspname
       AND policies.tablename = tables.relname
      WHERE namespace.nspname = 'public'
        AND tables.relkind = 'r'
      GROUP BY tables.relname, tables.relrowsecurity
      ORDER BY tables.relname
    `
    expect(rows).toHaveLength(55)
    for (const row of rows) {
      expect(row.rls_enabled).toBe(true)
      expect(row.commands).toEqual(['DELETE', 'INSERT', 'SELECT', 'UPDATE'])
    }
  })
  it('has RLS enabled on every public table', async () => {
    const rows = await admin.$queryRaw<{ table_name: string }[]>`
      SELECT tables.relname AS table_name
      FROM pg_class AS tables
      JOIN pg_namespace AS namespace ON namespace.oid = tables.relnamespace
      WHERE namespace.nspname = 'public'
        AND tables.relkind = 'r'
        AND NOT tables.relrowsecurity
      ORDER BY tables.relname
    `
    expect(rows).toEqual([])
  })
  it('tenant A can SELECT its own row and legacy NULL rows but cannot SELECT tenant B', async () => {
    const rows = await withTenant(tenantAId, (tx) => tx.$queryRaw<UserRow[]>`
      SELECT "id", "tenantId", "name"
      FROM "users"
      WHERE "id" IN (${userAId}, ${userBId}, ${legacyUserId})
      ORDER BY "id"
    `)
    expect(rows.map((row) => row.id).sort()).toEqual([legacyUserId, userAId].sort())
    expect(rows.find((row) => row.id === userBId)).toBeUndefined()
    expect(rows.find((row) => row.id === legacyUserId)?.tenantId).toBeNull()
  })
  it('tenant A cannot UPDATE tenant B', async () => {
    const affected = await withTenant(tenantAId, (tx) => tx.$executeRaw`
      UPDATE "users" SET "name" = 'forbidden update', "updatedAt" = NOW()
      WHERE "id" = ${userBId}
    `)
    expect(affected).toBe(0)
    const row = await admin.$queryRaw<UserRow[]>`
      SELECT "id", "tenantId", "name" FROM "users" WHERE "id" = ${userBId}
    `
    expect(row[0].name).toBe('Tenant B original')
  })
  it('tenant A cannot DELETE tenant B', async () => {
    const affected = await withTenant(tenantAId, (tx) => tx.$executeRaw`
      DELETE FROM "users" WHERE "id" = ${userBId}
    `)
    expect(affected).toBe(0)
    const row = await admin.$queryRaw<UserRow[]>`
      SELECT "id", "tenantId", "name" FROM "users" WHERE "id" = ${userBId}
    `
    expect(row).toHaveLength(1)
  })
  it('tenant A cannot INSERT a tenant B row', async () => {
    const crossTenantId = `rls-insert-${testId}-cross-tenant`
    await expect(withTenant(tenantAId, (tx) => tx.$executeRaw`
      INSERT INTO "users" ("id", "email", "name", "tenantId", "updatedAt")
      VALUES (
        ${crossTenantId},
        ${`${crossTenantId}@example.invalid`},
        'Forbidden cross-tenant insert',
        ${tenantBId},
        NOW()
      )
    `)).rejects.toThrow(/row-level security policy/i)
    const row = await admin.$queryRaw<UserRow[]>`
      SELECT "id", "tenantId", "name" FROM "users" WHERE "id" = ${crossTenantId}
    `
    expect(row).toHaveLength(0)
  })
  it('tenant A can INSERT and UPDATE its own row', async () => {
    const sameTenantId = `rls-insert-${testId}-same-tenant`
    await withTenant(tenantAId, async (tx) => {
      const inserted = await tx.$executeRaw`
        INSERT INTO "users" ("id", "email", "name", "tenantId", "updatedAt")
        VALUES (
          ${sameTenantId},
          ${`${sameTenantId}@example.invalid`},
          'Allowed same-tenant insert',
          ${tenantAId},
          NOW()
        )
      `
      expect(inserted).toBe(1)
      const updated = await tx.$executeRaw`
        UPDATE "users" SET "name" = 'Allowed same-tenant update', "updatedAt" = NOW()
        WHERE "id" = ${sameTenantId}
      `
      expect(updated).toBe(1)
    })
  })
  it('tenant A cannot UPDATE a NULL-tenant shared row', async () => {
    const affected = await withTenant(tenantAId, (tx) => tx.$executeRaw`
      UPDATE "users" SET "name" = 'forbidden shared update', "updatedAt" = NOW()
      WHERE "id" = ${legacyUserId}
    `)
    expect(affected).toBe(0)
    const row = await admin.$queryRaw<UserRow[]>`
      SELECT "id", "tenantId", "name" FROM "users" WHERE "id" = ${legacyUserId}
    `
    expect(row[0].name).toBe('Legacy NULL tenant')
  })
  it('tenant A cannot DELETE a NULL-tenant shared row', async () => {
    const affected = await withTenant(tenantAId, (tx) => tx.$executeRaw`
      DELETE FROM "users" WHERE "id" = ${legacyUserId}
    `)
    expect(affected).toBe(0)
    const row = await admin.$queryRaw<UserRow[]>`
      SELECT "id", "tenantId", "name" FROM "users" WHERE "id" = ${legacyUserId}
    `
    expect(row).toHaveLength(1)
  })
  it('tenant A cannot INSERT a NULL-tenant shared row', async () => {
    const sharedInsertId = `rls-insert-${testId}-tenant-a-shared`
    await expect(withTenant(tenantAId, (tx) => tx.$executeRaw`
      INSERT INTO "users" ("id", "email", "name", "tenantId", "updatedAt")
      VALUES (
        ${sharedInsertId},
        ${`${sharedInsertId}@example.invalid`},
        'Forbidden shared insert',
        NULL,
        NOW()
      )
    `)).rejects.toThrow(/row-level security policy/i)
    const row = await admin.$queryRaw<UserRow[]>`
      SELECT "id" FROM "users" WHERE "id" = ${sharedInsertId}
    `
    expect(row).toHaveLength(0)
  })
  it('NULL tenant context SELECT returns no rows, shared rows included', async () => {
    const rows = await withTenant(null, (tx) => tx.$queryRaw<UserRow[]>`
      SELECT "id", "tenantId", "name"
      FROM "users"
      WHERE "id" IN (${userAId}, ${userBId}, ${legacyUserId})
    `)
    expect(rows).toEqual([])
  })
  it('NULL tenant context UPDATE and DELETE affect no rows', async () => {
    await withTenant(null, async (tx) => {
      const updated = await tx.$executeRaw`
        UPDATE "users" SET "name" = 'forbidden NULL-context update', "updatedAt" = NOW()
        WHERE "id" IN (${userAId}, ${userBId}, ${legacyUserId})
      `
      expect(updated).toBe(0)
      const deleted = await tx.$executeRaw`
        DELETE FROM "users" WHERE "id" IN (${userAId}, ${userBId}, ${legacyUserId})
      `
      expect(deleted).toBe(0)
    })
    const rows = await admin.$queryRaw<UserRow[]>`
      SELECT "id", "tenantId", "name" FROM "users"
      WHERE "id" IN (${userAId}, ${userBId}, ${legacyUserId})
      ORDER BY "id"
    `
    expect(rows).toHaveLength(3)
    expect(rows.map((row) => row.name).sort()).toEqual(
      ['Legacy NULL tenant', 'Tenant A original', 'Tenant B original'].sort(),
    )
  })
  it.each([
    ['a tenant B row', tenantBId],
    ['a NULL-tenant row', null],
  ])('NULL tenant context cannot INSERT %s', async (label, insertTenantId) => {
    const insertId = `rls-insert-${testId}-null-context-${insertTenantId ? 'b' : 'shared'}`
    await expect(withTenant(null, (tx) => tx.$executeRaw`
      INSERT INTO "users" ("id", "email", "name", "tenantId", "updatedAt")
      VALUES (
        ${insertId},
        ${`${insertId}@example.invalid`},
        ${`Forbidden NULL-context insert of ${label}`},
        ${insertTenantId},
        NOW()
      )
    `)).rejects.toThrow(/row-level security policy/i)
    const row = await admin.$queryRaw<UserRow[]>`
      SELECT "id" FROM "users" WHERE "id" = ${insertId}
    `
    expect(row).toHaveLength(0)
  })
})
