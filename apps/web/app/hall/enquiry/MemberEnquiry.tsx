'use client';
import { useEffect, useRef, useState } from 'react';
import type { HallProfile } from '@/lib/hall/receiving';
import { createMemberSubmitter, productLabel } from '@/lib/hall/member-flow';
import { CsrfProtectedForm } from '@/components/forms/csrf-protected-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function MemberEnquiry({ profile }: { profile: HallProfile }) {
  const submitter = useRef(createMemberSubmitter());
  const eventId = useRef(''); const expiresAt = useRef(0);
  const [confirmed, setConfirmed] = useState(false), [busy, setBusy] = useState(false), [status, setStatus] = useState('draft');
  useEffect(() => { eventId.current = crypto.randomUUID(); expiresAt.current = Date.now() + 300000; const controller = submitter.current; return () => controller.invalidate(); }, []);
  const messages: Record<string, string> = { draft: 'Your enquiry has not been submitted.', not_connected: 'Receiving is not connected. Your enquiry has not been confirmed.', unverified: 'Receiving could not be verified. Keep the same draft and try again.', 'received-held': 'NRPG has received your enquiry. Supplier delivery is pending.' };
  return <CsrfProtectedForm className="max-w-xl space-y-5" onSubmit={async (event, csrfToken) => {
    if (busy || status === 'received-held') return;
    const data = new FormData(event.currentTarget); setBusy(true);
    const result = await submitter.current.submit({ name: String(data.get('name') || ''), email: String(data.get('email') || ''), question: String(data.get('question') || ''), productId: String(data.get('productId') || '') }, profile,
      { origin: window.location.origin, confirmed, csrfToken, eventId: eventId.current, nonce: crypto.randomUUID(), expiresAt: expiresAt.current, now: Date.now }, fetch);
    setStatus(result.status); setBusy(false);
  }}>{() => <fieldset disabled={busy || status === 'received-held'} className="space-y-5" onChange={() => { if (!busy) { eventId.current = crypto.randomUUID(); submitter.current.invalidate(); } }}>
    <div><Label htmlFor="hall-name">Your name</Label><Input id="hall-name" name="name" maxLength={100} required /></div>
    <div><Label htmlFor="hall-email">Reply contact</Label><Input id="hall-email" name="email" type="email" maxLength={200} required /></div>
    <div><Label htmlFor="hall-product">Carpet Cleaners Warehouse product</Label><select id="hall-product" name="productId" className="w-full rounded border border-white/20 bg-[#050505] p-3">{profile.approvedProductIds.map(id => <option key={id} value={id}>{productLabel(id)}</option>)}</select></div>
    <div><Label htmlFor="hall-question">Your enquiry</Label><textarea id="hall-question" name="question" minLength={10} maxLength={3000} required className="w-full rounded border border-white/20 bg-[#050505] p-3" /></div>
    <label className="flex gap-3"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />I consent to NRPG receiving this enquiry for Carpet Cleaners Warehouse. Supplier delivery will remain pending. This does not subscribe me to marketing.</label>
    <Button type="submit" disabled={!confirmed || busy}>Confirm enquiry</Button><p role="status">{messages[status]}</p>
  </fieldset>}</CsrfProtectedForm>;
}
