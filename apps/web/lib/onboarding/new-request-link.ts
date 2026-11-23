/**
 * DR-947: one owner for the client's "start a service request" link.
 *
 * Onboarding and the dashboard sent clients to /dashboard/client/requests/new, a page
 * that did not exist, so the first-value step of the client walk ended on a 404.
 * Requests are created in the dashboard's own request form, so that path now
 * redirects to the dashboard with an intent the dashboard reads to open the form.
 */

export const NEW_REQUEST_PATH = '/dashboard/client/requests/new';
export const CLIENT_DASHBOARD_PATH = '/dashboard/client';

const INTENT_PARAM = 'newRequest';
const URGENCY_PARAM = 'urgency';
const EMERGENCY = 'emergency';

type ParamValue = string | string[] | undefined;

function first(value: ParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Link to start a request; `emergency` pre-selects the emergency urgency. */
export function newRequestHref({ emergency = false }: { emergency?: boolean } = {}): string {
  return emergency ? `${NEW_REQUEST_PATH}?emergency=true` : NEW_REQUEST_PATH;
}

/** Where /dashboard/client/requests/new sends the visitor. */
export function newRequestRedirectTarget(searchParams: Record<string, ParamValue> = {}): string {
  const params = new URLSearchParams({ [INTENT_PARAM]: '1' });
  if (first(searchParams.emergency) === 'true') params.set(URGENCY_PARAM, EMERGENCY);
  return `${CLIENT_DASHBOARD_PATH}?${params.toString()}`;
}

export interface NewRequestIntent {
  open: boolean;
  urgency?: typeof EMERGENCY;
}

/** Read the dashboard's query string; anything unexpected means "do nothing". */
export function readNewRequestIntent(search: string): NewRequestIntent {
  const params = new URLSearchParams(search);
  if (params.get(INTENT_PARAM) !== '1') return { open: false };
  return params.get(URGENCY_PARAM) === EMERGENCY ? { open: true, urgency: EMERGENCY } : { open: true };
}
