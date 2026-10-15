import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { prepareHallReceipt, receiveHallEnquiry, resolveHallActor } from '../../lib/hall/receiving';
// Explicit disposable local database only. Never consume estate DATABASE_URL.
const port = Number(process.env.HALL_TEST_POSTGRES_PORT);
if (!Number.isSafeInteger(port) || port < 1024 || port > 65535) throw Error('LOCAL_POSTGRES_TEST_PORT_REQUIRED');
const prisma = new PrismaClient({ datasources: { db: { url: `postgresql://postgres@127.0.0.1:${port}/postgres` } } });
const profile = { recipientOrganisationId: 'synthetic-ccw', approvedProductIds: ['ccw-probe'], catalogueVersion: 'synthetic-v1', sourceRevision: 'a'.repeat(40), consentVersion: 'synthetic-v1' };
const input = { eventId: 'synthetic-event', name: 'Synthetic', email: 'synthetic@example.invalid', question: 'A synthetic supplier enquiry', productIds: ['ccw-probe'], consent: { granted: true, recipientProduct: 'ccw-erp', recipientOrganisationId: 'synthetic-ccw', purpose: 'supplier-enquiry', version: 'synthetic-v1', reference: 'synthetic-consent' } };
async function main() {
 await prisma.tenant.createMany({ data: [{ id: 'synthetic-tenant-a', name: 'Synthetic A' }, { id: 'synthetic-tenant-b', name: 'Synthetic B' }] });
 await prisma.user.createMany({ data: [{ id: 'synthetic-user-a', email: 'user-a@example.invalid', tenantId: 'synthetic-tenant-a', isEmailVerified: true }, { id: 'synthetic-user-b', email: 'user-b@example.invalid', tenantId: 'synthetic-tenant-a', isEmailVerified: true }] });
 const actor = { userId: 'synthetic-user-a', tenantId: 'synthetic-tenant-a' }, prepared = prepareHallReceipt(input, profile);
 const receipts = await Promise.all(Array.from({ length: 8 }, () => receiveHallEnquiry(prisma, actor, prepared)));
 assert.ok(receipts.every(receipt => receipt.eventId === input.eventId && receipt.payloadHash === prepared.payloadHash));
 assert.equal(new Set(receipts.map(r => r.reference)).size, 1); assert.equal(receipts.filter(r => !r.duplicate).length, 1);
 assert.equal(await prisma.contactEnquiry.count(), 1); assert.equal(await prisma.backgroundJob.count(), 1);
 const job = await prisma.backgroundJob.findFirstOrThrow(); assert.equal(job.status, 'HELD'); assert.equal(job.initiatedBy, actor.userId); assert.equal(job.tenantId, actor.tenantId);
 assert.ok(!JSON.stringify(job.input).includes(input.email)); assert.ok(!JSON.stringify(job.input).includes(input.question));
 assert.equal(await resolveHallActor(prisma, { user: { id: actor.userId, tenantId: 'synthetic-tenant-b' } }), null);
 await assert.rejects(receiveHallEnquiry(prisma, { ...actor, tenantId: 'synthetic-tenant-b' }, prepared), /ACTOR_REQUIRED/);
 await assert.rejects(receiveHallEnquiry(prisma, { userId: 'synthetic-user-b', tenantId: 'synthetic-tenant-b' }, prepared), /ACTOR_REQUIRED/);
 await assert.rejects(receiveHallEnquiry(prisma, actor, prepareHallReceipt({ ...input, question: 'A changed synthetic enquiry' }, profile)), /IDEMPOTENCY_CONFLICT/);
 await prisma.user.update({ where: { id: actor.userId }, data: { isEmailVerified: false } });
 await assert.rejects(receiveHallEnquiry(prisma, actor, prepared), /ACTOR_REQUIRED/);
 await prisma.user.update({ where: { id: actor.userId }, data: { isEmailVerified: true } });
 const eventInput = job.input as Record<string, any>;
 await prisma.backgroundJob.update({ where: { id: job.id }, data: { input: { ...eventInput, userId: 'synthetic-user-b' } } });
 await assert.rejects(receiveHallEnquiry(prisma, actor, prepared), /RECEIVING_UNVERIFIED/);
 await prisma.backgroundJob.update({ where: { id: job.id }, data: { input: eventInput } });
 await prisma.$executeRawUnsafe(`CREATE FUNCTION synthetic_contact_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.email='rollback@example.invalid' THEN RAISE EXCEPTION 'synthetic rollback'; END IF; RETURN NEW; END $$`);
 await prisma.$executeRawUnsafe('CREATE TRIGGER synthetic_contact_failure BEFORE INSERT ON contact_enquiries FOR EACH ROW EXECUTE FUNCTION synthetic_contact_failure()');
 await assert.rejects(receiveHallEnquiry(prisma, actor, prepareHallReceipt({ ...input, eventId: 'synthetic-rollback', email: 'rollback@example.invalid' }, profile)), /synthetic rollback/);
 assert.equal(await prisma.contactEnquiry.count(), 1); assert.equal(await prisma.backgroundJob.count(), 1);
 // Use the actual dequeue implementation with an explicitly local database binding.
 process.env.DATABASE_URL = `postgresql://postgres@127.0.0.1:${port}/postgres`;
 const { getNextJob } = await import('../../lib/queue/background-jobs');
 const { basePrisma } = await import('../../lib/prisma');
 try {
  await prisma.backgroundJob.update({ where: { id: job.id }, data: { status: 'PENDING', priority: 1 } });
  await prisma.backgroundJob.create({ data: { id: 'synthetic-normal-one', jobType: 'REPORT_GENERATION', status: 'PENDING', priority: 5, input: {} } });
  await prisma.backgroundJob.create({ data: { id: 'synthetic-normal-two', jobType: 'DATA_EXPORT', status: 'RETRY', priority: 6, input: {} } });
  const first = await getNextJob(); assert.equal(first?.id, 'synthetic-normal-one');
  await prisma.backgroundJob.update({ where: { id: first!.id }, data: { status: 'COMPLETED' } });
  const second = await getNextJob(); assert.equal(second?.id, 'synthetic-normal-two');
  await prisma.backgroundJob.update({ where: { id: second!.id }, data: { status: 'COMPLETED' } });
  assert.equal(await getNextJob(), null);
  assert.equal((await prisma.backgroundJob.findUniqueOrThrow({ where: { id: job.id } })).status, 'PENDING');
 } finally { await basePrisma.$disconnect(); }
 console.log('PASS: real Prisma+local PostgreSQL17 full schema; concurrent immutable retries, current user/tenant denial, forged scoped replay denial, atomic rollback, HELD receiving and Hall PENDING cannot starve consecutive normal dequeues. Production RLS/delivery UNPROVEN.');
}
main().finally(() => prisma.$disconnect());
