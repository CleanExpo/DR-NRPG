import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { prepareHallReceipt, receiveHallEnquiry, resolveHallActor } from '../../lib/hall/receiving';

// Explicit disposable loopback database only; no inherited estate URLs.
const port = Number(process.env.HALL_TEST_POSTGRES_PORT);
if (!Number.isSafeInteger(port) || port < 1024 || port > 65535) throw Error('LOCAL_POSTGRES_TEST_PORT_REQUIRED');
const db = new PrismaClient({ datasources: { db: { url: `postgresql://postgres@127.0.0.1:${port}/postgres` } } });
const profile = { recipientOrganisationId: 'synthetic-ccw', approvedProductIds: ['ccw-probe'], catalogueVersion: 'synthetic', sourceRevision: 'a'.repeat(40), consentVersion: 'synthetic' };
function company(id: string, contractorId: string) {
 return { id, contractorId, companyName: 'Eligible synthetic company', abn: 'synthetic-abn', companyStructure: 'synthetic', registeredAddress: 'synthetic', registeredCity: 'synthetic', registeredState: 'QLD', registeredPostcode: '4000', directors: 'synthetic', updatedAt: new Date() };
}
const cases = ['user', 'tenant', 'contractor', 'profile', 'company', 'new-contractor', 'new-profile', 'new-company', 'reassigned-contractor', 'reassigned-profile', 'reassigned-company'];
async function main() {
 for (const kind of cases) {
  const id = `race-${kind}`, userId = `${id}-user`, tenantId = `${id}-tenant`, contractorId = `${id}-contractor`, profileId = `${id}-profile`, companyId = `${id}-company`;
  await db.tenant.create({ data: { id: tenantId, name: 'Eligible synthetic tenant' } });
  await db.user.create({ data: { id: userId, email: `${id}@example.invalid`, tenantId, isEmailVerified: true } });
  if (kind !== 'new-contractor') await db.contractor.create({ data: { id: contractorId, userId, businessName: 'Eligible synthetic contractor' } });
  if (kind !== 'new-profile') await db.contractorProfile.create({ data: { id: profileId, userId, businessName: 'Eligible synthetic profile', services: [], serviceAreas: [] } });
  if (!['new-profile', 'new-company'].includes(kind)) await db.contractorCompany.create({ data: company(companyId, profileId) });
  if (kind.startsWith('reassigned-')) {
   await db.user.create({ data: { id: `${id}-foreign`, email: `${id}-foreign@example.invalid`, tenantId, isEmailVerified: true } });
   if (kind === 'reassigned-contractor') { await db.contractor.delete({ where: { id: contractorId } }); await db.contractor.create({ data: { id: contractorId, userId: `${id}-foreign`, businessName: 'Coach8' } }); }
   if (kind === 'reassigned-profile') { await db.contractorProfile.delete({ where: { id: profileId } }); await db.contractorProfile.create({ data: { id: profileId, userId: `${id}-foreign`, businessName: 'Coach8', services: [], serviceAreas: [] } }); }
   if (kind === 'reassigned-company') { await db.contractorCompany.delete({ where: { id: companyId } }); await db.contractorProfile.create({ data: { id: `${id}-foreign-profile`, userId: `${id}-foreign`, services: [], serviceAreas: [] } }); await db.contractorCompany.create({ data: { ...company(companyId, `${id}-foreign-profile`), companyName: 'Coach8' } }); }
  }
  let signal!: () => void, release!: () => void;
  const checked = new Promise<void>(resolve => { signal = resolve; }), resume = new Promise<void>(resolve => { release = resolve; });
  // Only orchestration is wrapped: all reads, locks and writes use real Prisma/Postgres.
  const paused = { $transaction: (callback: any) => db.$transaction(tx => callback(new Proxy(tx, { get(target, key) {
   if (key === 'backgroundJob') return { ...target.backgroundJob, create: async (args: any) => { signal(); await resume; return target.backgroundJob.create(args); } };
   return Reflect.get(target, key);
  } })), { timeout: 15000 }) };
  const prepared = prepareHallReceipt({ eventId: id, name: 'Synthetic', email: 'synthetic@example.invalid', question: 'Synthetic identity concurrency proof', productIds: ['ccw-probe'], consent: { granted: true, recipientProduct: 'ccw-erp', recipientOrganisationId: 'synthetic-ccw', purpose: 'supplier-enquiry', version: 'synthetic', reference: id } }, profile);
  const receiving = receiveHallEnquiry(paused, { userId, tenantId }, prepared);
  await checked;
  let completed = false;
  const writer = db.$transaction(async tx => {
   await tx.$executeRaw`SELECT set_config('application_name',${id},true)`;
   if (kind === 'user') await tx.user.update({ where: { id: userId }, data: { email: 'blocked@coach8.com.au' } });
   if (kind === 'tenant') await tx.tenant.update({ where: { id: tenantId }, data: { name: 'Coach8' } });
   if (kind === 'contractor') await tx.contractor.update({ where: { id: contractorId }, data: { businessName: 'Coach8' } });
   if (kind === 'profile') await tx.contractorProfile.update({ where: { id: profileId }, data: { businessName: 'Coach8' } });
   if (kind === 'company') await tx.contractorCompany.update({ where: { id: companyId }, data: { companyName: 'Coach8' } });
   if (kind === 'new-contractor') await tx.contractor.create({ data: { id: contractorId, userId, businessName: 'Coach8' } });
   if (kind === 'new-profile') await tx.contractorProfile.create({ data: { id: profileId, userId, businessName: 'Coach8', services: [], serviceAreas: [] } });
   if (kind === 'new-company') await tx.contractorCompany.create({ data: { ...company(companyId, profileId), companyName: 'Coach8' } });
   if (kind === 'reassigned-contractor') await tx.contractor.update({ where: { id: contractorId }, data: { userId } });
   if (kind === 'reassigned-profile') await tx.contractorProfile.update({ where: { id: profileId }, data: { userId } });
   if (kind === 'reassigned-company') await tx.contractorCompany.update({ where: { id: companyId }, data: { contractorId: profileId } });
  }, { timeout: 15000 }).then(() => { completed = true; });
  try {
   let blocked = false;
   for (let attempt = 0; attempt < 100 && !completed; attempt++) {
    const rows = await db.$queryRaw<Array<{ wait_event_type: string | null }>>`SELECT wait_event_type FROM pg_stat_activity WHERE application_name=${id}`;
    if (rows.some(row => row.wait_event_type === 'Lock')) { blocked = true; break; }
    await new Promise(resolve => setTimeout(resolve, 20));
   }
   assert.equal(completed, false, `${kind}: excluded affiliation committed before receiving persistence`);
   assert.equal(blocked, true, `${kind}: real writer did not wait on a PostgreSQL lock`);
   release();
   assert.equal((await receiving).status, 'received');
   await writer;
   assert.equal(await resolveHallActor(db, { user: { id: userId, tenantId } }), null);
   await assert.rejects(receiveHallEnquiry(db, { userId, tenantId }, prepared), /ACTOR_REQUIRED/);
   console.log(`PASS ${kind}: affiliation mutation waited for receiving commit; subsequent receiving denied`);
  } finally { release(); await Promise.allSettled([receiving, writer]); }
 }
 console.log(`PASS ${cases.length} actual PostgreSQL identity update/insertion/reassignment races`);
}
main().finally(() => db.$disconnect());
