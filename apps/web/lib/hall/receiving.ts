import { createHash } from 'crypto';
import { z } from 'zod';
import { hallIdentityExcluded } from './access-policy';

const identity = z.string().trim().min(1).max(120).regex(/^[\w-]+$/);
const enquirySchema = z.object({
  eventId: identity,
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  question: z.string().trim().min(10).max(3000),
  productIds: z.array(identity).min(1).max(6),
  consent: z.object({
    granted: z.literal(true), recipientProduct: z.literal('ccw-erp'),
    recipientOrganisationId: identity, purpose: z.literal('supplier-enquiry'),
    version: z.string().min(1).max(80), reference: identity,
  }).strict(),
}).strict();

export interface HallProfile {
  recipientOrganisationId: string;
  approvedProductIds: readonly string[];
  catalogueVersion: string;
  sourceRevision: string;
  consentVersion: string;
}
export interface HallActor { userId: string; tenantId: string }

/** Session claims alone never establish current membership or verified authority. */
export async function resolveHallActor(prisma: any, session: any): Promise<HallActor | null> {
  const userId = session?.user?.id;
  const tenantId = session?.user?.tenantId;
  if (!identity.safeParse(userId).success || !identity.safeParse(tenantId).success) return null;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: {
    id: true, tenantId: true, email: true, isEmailVerified: true, isActive: true, isBlocked: true,
    tenant: { select: { isActive: true, name: true, domain: true } },
    contractor: { select: { businessName: true, abnNumber: true } },
    contractorProfile: { select: { businessName: true, ContractorCompany: { select: {
      companyName: true, tradingName: true, abn: true, website: true, companyEmail: true,
    } } } },
  } });
  if (!user || user.id !== userId || user.tenantId !== tenantId || !user.isEmailVerified ||
      !user.isActive || user.isBlocked || !user.tenant?.isActive) return null;
  const company = user.contractorProfile?.ContractorCompany;
  if ([{ email: user.email }, { businessName: user.tenant.name, domain: user.tenant.domain },
      { businessName: user.contractor?.businessName, abn: user.contractor?.abnNumber },
      { businessName: user.contractorProfile?.businessName },
      { businessName: company?.companyName, tradingName: company?.tradingName, abn: company?.abn,
        website: company?.website, email: company?.companyEmail }].some(hallIdentityExcluded)) return null;
  return { userId, tenantId };
}

export function prepareHallReceipt(input: unknown, profile: HallProfile) {
  if (!identity.safeParse(profile.recipientOrganisationId).success || !/^[a-f0-9]{40}$/.test(profile.sourceRevision) ||
      !profile.catalogueVersion || !profile.consentVersion || !profile.approvedProductIds.length) throw Error('PROFILE_REQUIRED');
  const data = enquirySchema.parse(input);
  if (hallIdentityExcluded({ email: data.email, businessName: data.name })) throw Error('INVALID_ENQUIRY');
  if (data.consent.recipientOrganisationId !== profile.recipientOrganisationId || data.consent.version !== profile.consentVersion ||
      new Set(data.productIds).size !== data.productIds.length || data.productIds.some(id => !profile.approvedProductIds.includes(id))) throw Error('INVALID_CONSENT_OR_PRODUCTS');
  const payload = { ...data, sourceProduct: 'dr-nrpg', source: 'nrpg-trade-show-hall',
    sourceRevision: profile.sourceRevision, catalogueVersion: profile.catalogueVersion };
  const payloadHash = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  return { payload, payloadHash };
}

/** Existing NRPG tables only; no email, CRM bridge, matching or supplier delivery. */
export async function receiveHallEnquiry(prisma: any, actor: HallActor, prepared: ReturnType<typeof prepareHallReceipt>) {
  if (!identity.safeParse(actor.userId).success || !identity.safeParse(actor.tenantId).success) throw Error('ACTOR_REQUIRED');
  const { payload, payloadHash } = prepared;
  const key = createHash('sha256').update(JSON.stringify(['nrpg-trade-show-hall', actor.tenantId, actor.userId, payload.eventId])).digest('hex');
  const jobId = 'hall-event-' + key, reference = 'hall-' + key;
  return prisma.$transaction(async (tx: any) => {
    await tx.$queryRaw`SELECT set_config('app.current_tenant_id',${actor.tenantId},true),set_config('app.current_user_id',${actor.userId},true)`;
    // Fixed parent-to-child lock order stabilises every identity contributor.
    // UPDATE locks also block FK KEY SHARE checks when a missing affiliation is
    // inserted or an existing affiliation is reassigned to this user/profile.
    await tx.$queryRaw`SELECT id FROM users WHERE id=${actor.userId} FOR UPDATE`;
    await tx.$queryRaw`SELECT id FROM tenants WHERE id=${actor.tenantId} FOR SHARE`;
    await tx.$queryRaw`SELECT id FROM "Contractor" WHERE "userId"=${actor.userId} ORDER BY id FOR UPDATE`;
    await tx.$queryRaw`SELECT id FROM contractor_profiles WHERE "userId"=${actor.userId} ORDER BY id FOR UPDATE`;
    await tx.$queryRaw`SELECT c.id FROM "ContractorCompany" c JOIN contractor_profiles p ON p.id=c."contractorId" WHERE p."userId"=${actor.userId} ORDER BY c.id FOR UPDATE OF c`;
    const current = await resolveHallActor(tx, { user: { id: actor.userId, tenantId: actor.tenantId } });
    if (!current) throw Error('ACTOR_REQUIRED');
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))::text`;
    const read = () => tx.backgroundJob.findFirst({ where: { id: jobId, tenantId: actor.tenantId, initiatedBy: actor.userId } });
    const previous = await read();
    if (previous) {
      if (previous.input?.userId !== actor.userId || previous.input?.tenantId !== actor.tenantId || previous.input?.reference !== reference) throw Error('RECEIVING_UNVERIFIED');
      if (previous.input?.payloadHash !== payloadHash) throw Error('IDEMPOTENCY_CONFLICT');
      const contact = await tx.contactEnquiry.findUnique({ where: { id: reference }, select: { id: true } });
      if (!contact) throw Error('RECEIVING_UNVERIFIED');
      return { status: 'received', reference, eventId: payload.eventId, payloadHash, duplicate: true, deliveryStatus: 'held' };
    }
    await tx.backgroundJob.create({ data: { id: jobId, jobType: 'HALL_ENQUIRY_HANDOFF', status: 'HELD',
      tenantId: actor.tenantId, initiatedBy: actor.userId,
      input: { ...actor, reference, payloadHash, eventId: payload.eventId, productIds: payload.productIds,
        consent: payload.consent, source: payload.source, sourceProduct: payload.sourceProduct,
        sourceRevision: payload.sourceRevision, catalogueVersion: payload.catalogueVersion } } });
    await tx.contactEnquiry.create({ data: { id: reference, firstName: payload.name, lastName: '', email: payload.email,
      subject: 'TradeShow Hall enquiry', message: payload.question, source: 'nrpg-trade-show-hall',
      consentGivenAt: new Date(), consentVersion: payload.consent.version } });
    const persisted = await read();
    if (persisted?.input?.payloadHash !== payloadHash) throw Error('RECEIVING_UNVERIFIED');
    return { status: 'received', reference, eventId: payload.eventId, payloadHash, duplicate: false, deliveryStatus: 'held' };
  });
}
