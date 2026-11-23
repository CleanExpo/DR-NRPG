import { redirect } from 'next/navigation';
import { newRequestRedirectTarget } from '@/lib/onboarding/new-request-link';

/**
 * DR-947: onboarding's "Create Request" and the dashboard's Emergency card land here.
 * Requests are created in the dashboard's request form, so send the client there with
 * the form open (and Emergency pre-selected when asked).
 */
export default async function NewServiceRequestPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  redirect(newRequestRedirectTarget(await searchParams));
}
