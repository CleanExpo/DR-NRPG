/**
 * DR-947: the first-value step of each walk.
 *  - Client: "Create Request" (onboarding checklist, dashboard) reaches the request form.
 *  - Contractor: after a bid, /dashboard/contractor/my-bids shows the bid, and a failed
 *    load is shown as a failure, never as "no bids yet".
 */
import { render, screen, waitFor } from '@testing-library/react';
import {
  newRequestHref,
  newRequestRedirectTarget,
  readNewRequestIntent,
} from '@/lib/onboarding/new-request-link';

const redirectMock = jest.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT ${url}`);
});

jest.mock('next/navigation', () => ({
  redirect: (url: string) => redirectMock(url),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

describe('client walk: create a request', () => {
  it('builds the links onboarding uses', () => {
    expect(newRequestHref()).toBe('/dashboard/client/requests/new');
    expect(newRequestHref({ emergency: true })).toBe('/dashboard/client/requests/new?emergency=true');
  });

  it('/dashboard/client/requests/new sends the client to the dashboard with the form open', async () => {
    const { default: NewServiceRequestPage } = await import('@/app/dashboard/client/requests/new/page');
    await expect(NewServiceRequestPage({ searchParams: Promise.resolve({}) })).rejects.toThrow('NEXT_REDIRECT');
    expect(redirectMock).toHaveBeenLastCalledWith('/dashboard/client?newRequest=1');

    await expect(
      NewServiceRequestPage({ searchParams: Promise.resolve({ emergency: 'true' }) }),
    ).rejects.toThrow('NEXT_REDIRECT');
    expect(redirectMock).toHaveBeenLastCalledWith('/dashboard/client?newRequest=1&urgency=emergency');
  });

  it('the dashboard reads the intent it is sent, and ignores anything else', () => {
    expect(readNewRequestIntent(new URL(newRequestRedirectTarget(), 'https://x.test').search)).toEqual({ open: true });
    expect(
      readNewRequestIntent(new URL(newRequestRedirectTarget({ emergency: 'true' }), 'https://x.test').search),
    ).toEqual({ open: true, urgency: 'emergency' });
    expect(readNewRequestIntent('')).toEqual({ open: false });
    expect(readNewRequestIntent('?newRequest=yes&urgency=emergency')).toEqual({ open: false });
    expect(readNewRequestIntent('?newRequest=1&urgency=<script>')).toEqual({ open: true });
  });
});

describe('contractor walk: see the bid just sent', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  function respond(status: number, body: unknown) {
    fetchMock.mockResolvedValueOnce({ ok: status < 400, status, json: async () => body } as Response);
  }

  async function renderPage() {
    const { default: MyBidsPage } = await import('@/app/dashboard/contractor/my-bids/page');
    render(<MyBidsPage />);
  }

  it('lists the bids the API returns, including claim bids with no service request', async () => {
    respond(200, {
      success: true,
      data: [
        {
          id: 'm1',
          status: 'PENDING',
          createdAt: '2026-11-18T00:00:00.000Z',
          contractorMessage: 'Can start Monday',
          serviceRequest: { serviceTitle: 'Water damage, Parramatta', location: 'Parramatta NSW', urgency: 'emergency' },
        },
        { id: 'm2', status: 'ACCEPTED', createdAt: '2026-11-17T00:00:00.000Z', serviceRequest: null },
      ],
    });
    await renderPage();
    expect(await screen.findByTestId('my-bids-list')).toBeInTheDocument();
    expect(screen.getByText('Water damage, Parramatta')).toBeInTheDocument();
    expect(screen.getByText('Awaiting response')).toBeInTheDocument();
    expect(screen.getByText('Claim job')).toBeInTheDocument();
    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/contractor/my-bids', expect.anything());
  });

  it('says there are no bids yet only when the API says so', async () => {
    respond(200, { success: true, data: [] });
    await renderPage();
    expect(await screen.findByTestId('my-bids-empty')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse available requests/i })).toHaveAttribute(
      'href',
      '/dashboard/contractor/available-requests',
    );
  });

  it.each([
    ['a server error', () => respond(500, { success: false })],
    ['an unexpected body', () => respond(200, { bids: [] })],
    ['a network failure', () => fetchMock.mockRejectedValueOnce(new Error('offline'))],
  ])('shows %s as a failure, not as an empty list', async (_label, arrange) => {
    arrange();
    await renderPage();
    await waitFor(() => expect(screen.getByTestId('my-bids-error')).toBeInTheDocument());
    expect(screen.queryByTestId('my-bids-empty')).not.toBeInTheDocument();
  });
});
