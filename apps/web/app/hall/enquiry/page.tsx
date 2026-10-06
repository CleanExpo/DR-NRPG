import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { basePrisma } from '@/lib/prisma';
import { resolveHallActor } from '@/lib/hall/receiving';
import { memberProfile } from '@/lib/hall/member-flow';
import MemberEnquiry from './MemberEnquiry';

export const dynamic = 'force-dynamic';
export default async function HallEnquiryPage() {
  const profile = memberProfile(process.env);
  if (!profile) return <main className="min-h-screen bg-[#050505] text-white p-8"><h1 className="text-3xl font-semibold">TradeShow Hall enquiry</h1><p className="mt-4">Enquiry receiving is not connected yet. Keep your Hall draft and return when receiving is available.</p><Link className="underline" href="https://cleanexpo247-hall.vercel.app/trade-hall">Return to TradeShow Hall</Link></main>;
  const actor = await resolveHallActor(basePrisma, await getServerSession(authOptions));
  if (!actor) return <main className="min-h-screen bg-[#050505] text-white p-8"><h1 className="text-3xl font-semibold">TradeShow Hall enquiry</h1><p className="mt-4">A verified, active NRPG member account is required.</p><Link className="underline" href="/login?callbackUrl=%2Fhall%2Fenquiry">Sign in to NRPG</Link></main>;
  return <main className="min-h-screen bg-[#050505] text-white p-8"><h1 className="text-3xl font-semibold">TradeShow Hall enquiry</h1><p className="my-4">Prepare your enquiry here in NRPG. Your Hall draft is not transferred automatically.</p><MemberEnquiry profile={profile} /></main>;
}
