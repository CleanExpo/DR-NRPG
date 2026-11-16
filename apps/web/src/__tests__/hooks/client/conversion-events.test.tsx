/**
 * Wave 1 GA4 conversion events, sent through the one gated GA4 client
 * (src/lib/analytics.ts):
 *   claim_submitted, contractor_signup, certification_purchase, callout_paid.
 * Events carry no personal information, and payment-return events fire once per
 * Stripe session.
 *
 * Every "sent" assertion reads window.dataLayer, which is what the Google
 * library reads. A mock of window.gtag would pass whether or not the gate held.
 * The one seam above the gate is a record of what the panels ask to send
 * (mockOnceCalls): the real function still runs. It is there so that "nothing
 * sent" from a closed page can be told apart from a panel that never asked.
 *
 * Stage 1 counts the public pages only. The two payment events happen on
 * /dashboard pages, which are not counted, so those tests now assert that
 * nothing is sent from there. They are kept, not deleted: when /dashboard is
 * opened in a later stage they change back to expecting one event.
 */
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import ClaimStep3Page from '@/app/claim/step-3/page';
import { SignupForm } from '@/app/signup/signup-form';
import { CalloutCheckoutPanel } from '@/components/payments/callout-checkout-panel';
import { CertificationCheckoutPanel } from '@/components/payments/certification-checkout-panel';
import { __resetAnalyticsForTests, initializeGA4, trackEventOnce } from '@/lib/analytics';
import { writeStoredConsent } from '@/lib/analytics-gate';

// Jest cannot resolve the real package here (other suites mock it the same way).
jest.mock('@sentry/nextjs', () => ({ captureMessage: jest.fn() }), { virtual: true });

const mockRegister = jest.fn();
const mockPush = jest.fn();
/** Every call a component made to trackEventOnce, before the gate decided. */
const mockOnceCalls: unknown[][] = [];

jest.mock('@/lib/analytics', () => {
  const actual = jest.requireActual<typeof import('@/lib/analytics')>('@/lib/analytics');
  return {
    ...actual,
    __esModule: true,
    trackEventOnce: (...args: Parameters<typeof actual.trackEventOnce>) => {
      mockOnceCalls.push(args);
      return actual.trackEventOnce(...args);
    },
  };
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ register: mockRegister }),
}));

jest.mock('@/lib/claim-wizard/storage', () => ({
  loadClaimProgress: () => ({
    step1: { disasterType: 'water-damage', isEmergency: 'no', isOngoing: 'no' },
    step2: { name: 'Pat Example', email: 'pat@example.com', suburb: 'Example', postcode: '4000' },
  }),
  saveClaimProgress: jest.fn(),
  clearClaimProgress: jest.fn(),
}));

jest.mock('@/src/design-system/components/Layout/PageTransition', () => ({
  PageTransition: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/upload/PhotoUpload', () => ({ PhotoUpload: () => null }));

let captchaVerify: ((token: string) => void) | undefined;
jest.mock('@/components/captcha/HCaptcha', () => ({
  HCaptcha: (props: { onVerify?: (token: string) => void }) => {
    captchaVerify = props.onVerify;
    return <div data-testid="hcaptcha-widget" />;
  },
}));

jest.mock('@/components/onboarding/contractor-onboarding', () => () => null);
jest.mock('@/components/client-onboarding', () => () => null);
jest.mock('@/components/onboarding/preference-selector', () => () => null);

const PII = /pat@example\.com|Pat Example|@/;

const fetchMock = jest.fn();
const TEST_ID = 'G-TEST000000';
const CALLOUT_PAGE = '/dashboard/client/callout/sr_1';

function layer(): unknown[][] {
  const raw = (window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer;
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => Array.from(entry));
}

function eventsNamed(name: string) {
  return layer().filter(([kind, eventName]) => kind === 'event' && eventName === name);
}

function allEvents() {
  return layer().filter(([kind]) => kind === 'event');
}

function onceKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < window.sessionStorage.length; i += 1) {
    const key = window.sessionStorage.key(i);
    if (key && key.startsWith('nrpg_ga4_once:')) keys.push(key);
  }
  return keys;
}

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });
}

beforeAll(() => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
});

beforeEach(() => {
  __resetAnalyticsForTests();
  delete (window as unknown as { dataLayer?: unknown }).dataLayer;
  global.fetch = fetchMock as unknown as typeof fetch;
  fetchMock.mockReset();
  mockRegister.mockReset();
  mockPush.mockReset();
  mockOnceCalls.length = 0;
  window.sessionStorage.clear();
  window.localStorage.clear();
  window.history.replaceState({}, '', '/');
  // The visitor has said yes, and the site has its measurement id.
  writeStoredConsent(window.localStorage, true);
  initializeGA4({ measurementId: TEST_ID });
});

describe('trackEventOnce', () => {
  it('sends an event once per key', () => {
    trackEventOnce('callout_paid', 'cs_1', { value: 1 });
    trackEventOnce('callout_paid', 'cs_1', { value: 1 });
    trackEventOnce('callout_paid', 'cs_2', { value: 1 });
    expect(eventsNamed('callout_paid')).toHaveLength(2);
  });

  it('does nothing when the visitor said no, and does not use up the key', () => {
    writeStoredConsent(window.localStorage, false);
    expect(() => trackEventOnce('callout_paid', 'cs_1')).not.toThrow();
    expect(allEvents()).toEqual([]);
    expect(onceKeys()).toEqual([]);

    // The same key still counts once the visitor says yes.
    writeStoredConsent(window.localStorage, true);
    trackEventOnce('callout_paid', 'cs_1');
    expect(eventsNamed('callout_paid')).toHaveLength(1);
  });

  it('does nothing on a page that is not counted, and does not use up the key', () => {
    window.history.replaceState({}, '', CALLOUT_PAGE);
    trackEventOnce('callout_paid', 'cs_1', { value: 1 });
    expect(allEvents()).toEqual([]);
    expect(onceKeys()).toEqual([]);
  });
});

describe('claim_submitted', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/claim/step-3');
  });

  it('fires after a successful claim submit, without PII', async () => {
    fetchMock.mockImplementation(() => jsonResponse({ claimId: 'CLM-1' }));
    const { container } = render(<ClaimStep3Page />);

    fireEvent.change(container.querySelector('textarea[name="damageDescription"]')!, {
      target: { value: 'Water through the ceiling in two rooms after the storm.' },
    });
    fireEvent.click(container.querySelector('input[name="hasInsurance"][value="no"]')!);
    act(() => captchaVerify?.('captcha-token'));

    const submit = screen.getByRole('button', { name: /submit claim/i });
    await waitFor(() => expect(submit).not.toBeDisabled());
    fireEvent.click(submit);

    await waitFor(() => expect(eventsNamed('claim_submitted')).toHaveLength(1));
    const params = eventsNamed('claim_submitted')[0][2];
    expect(params).toMatchObject({ claim_type: 'water-damage' });
    expect(JSON.stringify(params)).not.toMatch(PII);
    // The claim id is a record id: it is in the address the visitor moves to,
    // and in nothing that was sent.
    expect(JSON.stringify(layer())).not.toMatch(/CLM-1/);
    // Nothing here answers for Google, so this is the visitor whose event is
    // never confirmed: the page still moves on, at the one-second limit.
    expect(mockPush).not.toHaveBeenCalled();
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/claim/success?claimId=CLM-1'), { timeout: 3000 });
  });

  it('sends nothing when the visitor said no, and the claim still goes through', async () => {
    writeStoredConsent(window.localStorage, false);
    fetchMock.mockImplementation(() => jsonResponse({ claimId: 'CLM-1' }));
    const { container } = render(<ClaimStep3Page />);
    fireEvent.change(container.querySelector('textarea[name="damageDescription"]')!, {
      target: { value: 'Water through the ceiling in two rooms after the storm.' },
    });
    fireEvent.click(container.querySelector('input[name="hasInsurance"][value="no"]')!);
    act(() => captchaVerify?.('captcha-token'));
    const submit = screen.getByRole('button', { name: /submit claim/i });
    await waitFor(() => expect(submit).not.toBeDisabled());
    fireEvent.click(submit);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/claim/success?claimId=CLM-1'));
    expect(allEvents()).toEqual([]);
  });

  it('does not fire when the submit fails', async () => {
    fetchMock.mockImplementation(() => jsonResponse({ error: 'bad' }, 500));
    const { container } = render(<ClaimStep3Page />);
    fireEvent.change(container.querySelector('textarea[name="damageDescription"]')!, {
      target: { value: 'Water through the ceiling in two rooms after the storm.' },
    });
    fireEvent.click(container.querySelector('input[name="hasInsurance"][value="no"]')!);
    act(() => captchaVerify?.('captcha-token'));
    const submit = screen.getByRole('button', { name: /submit claim/i });
    await waitFor(() => expect(submit).not.toBeDisabled());
    fireEvent.click(submit);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await waitFor(() => expect(submit).not.toBeDisabled());
    expect(eventsNamed('claim_submitted')).toHaveLength(0);
  });
});

describe('contractor_signup', () => {
  function fillAndSubmit() {
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Pat Example' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'pat@example.com' } });
    fireEvent.change(document.getElementById('password')!, { target: { value: 'secret-pass' } });
    fireEvent.change(document.getElementById('confirmPassword')!, { target: { value: 'secret-pass' } });
    fireEvent.click(document.getElementById('terms')!);
    fireEvent.submit(document.querySelector('form')!);
  }

  it('fires on successful contractor registration, without PII', async () => {
    window.history.replaceState({}, '', '/signup?type=contractor');
    mockRegister.mockResolvedValue({ id: 'u1', name: 'Pat Example' });
    render(<SignupForm />);
    fillAndSubmit();

    await waitFor(() => expect(eventsNamed('contractor_signup')).toHaveLength(1));
    expect(mockRegister).toHaveBeenCalledWith('pat@example.com', 'secret-pass', 'Pat Example', 'CONTRACTOR', true);
    expect(JSON.stringify(eventsNamed('contractor_signup')[0][2])).not.toMatch(PII);
  });

  it('does not fire for a client registration', async () => {
    window.history.replaceState({}, '', '/signup');
    mockRegister.mockResolvedValue({ id: 'u2' });
    render(<SignupForm />);
    fillAndSubmit();
    await waitFor(() => expect(mockRegister).toHaveBeenCalled());
    expect(eventsNamed('contractor_signup')).toHaveLength(0);
  });

  it('does not fire when registration fails', async () => {
    window.history.replaceState({}, '', '/signup?type=contractor');
    mockRegister.mockRejectedValue(new Error('Email already registered'));
    render(<SignupForm />);
    fillAndSubmit();
    await screen.findByText(/email already registered/i);
    expect(eventsNamed('contractor_signup')).toHaveLength(0);
  });
});

describe('callout_paid', () => {
  beforeEach(() => {
    // The panel lives on a /dashboard page, which stage 1 does not count.
    window.history.replaceState({}, '', CALLOUT_PAGE);
  });

  it('stage 1: sends nothing from the dashboard when the server confirms the callout paid', async () => {
    fetchMock.mockImplementation(() => jsonResponse({ success: true, paid: true, paymentStatus: 'paid' }));
    const { unmount } = render(<CalloutCheckoutPanel requestId="sr_1" status="success" sessionId="cs_callout_1" />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByText(/not paid yet/i)).not.toBeInTheDocument());
    expect(allEvents()).toEqual([]);
    // The once-key is kept for the stage that opens this page.
    expect(onceKeys()).toEqual([]);
    unmount();

    render(<CalloutCheckoutPanel requestId="sr_1" status="success" sessionId="cs_callout_1" />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(allEvents()).toEqual([]);
  });

  it('the panel does report a paid callout: seen when its address is one that is counted', async () => {
    // Positive control for the test above: the same panel on a counted address
    // does send, so "nothing sent" there is the gate, not a broken panel.
    window.history.replaceState({}, '', '/');
    fetchMock.mockImplementation(() => jsonResponse({ success: true, paid: true, paymentStatus: 'paid' }));
    const { unmount } = render(<CalloutCheckoutPanel requestId="sr_1" status="success" sessionId="cs_callout_1" />);
    await waitFor(() => expect(eventsNamed('callout_paid')).toHaveLength(1));
    expect(eventsNamed('callout_paid')[0][2]).toMatchObject({ currency: 'AUD' });
    unmount();

    render(<CalloutCheckoutPanel requestId="sr_1" status="success" sessionId="cs_callout_1" />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(eventsNamed('callout_paid')).toHaveLength(1);
  });

  it('does not fire when the server says unpaid', async () => {
    // On a counted address, so that "nothing sent" is the panel's own decision.
    window.history.replaceState({}, '', '/');
    fetchMock.mockImplementation(() => jsonResponse({ success: true, paid: false, paymentStatus: 'unpaid' }));
    render(<CalloutCheckoutPanel requestId="sr_1" status="success" sessionId="cs_callout_2" />);
    await screen.findByText(/not paid yet/i);
    expect(eventsNamed('callout_paid')).toHaveLength(0);
  });
});

describe('certification_purchase', () => {
  it('stage 1: sends nothing from the dashboard when the server confirms the paid checkout', async () => {
    // The address carries a Stripe session id. /dashboard is not counted, and
    // an address with a query like this one would be closed in any case.
    window.history.replaceState({}, '', '/dashboard/contractor/training?certification=success&session_id=cs_cert_1');
    fetchMock.mockImplementation(() => jsonResponse({ success: true, configured: true, paid: true, sessionPaid: true }));
    const { unmount } = render(<CertificationCheckoutPanel />);
    await screen.findByText(/certification purchased/i);
    expect(fetchMock).toHaveBeenCalledWith('/api/training/certification/checkout?session_id=cs_cert_1');
    // Positive control for the two tests below: for a confirmed session the
    // panel does ask to send, and the gate is what stops it.
    await waitFor(() => expect(mockOnceCalls.filter((call) => call[0] === 'certification_purchase')).toHaveLength(1));
    expect(mockOnceCalls[0].slice(0, 2)).toEqual(['certification_purchase', 'cs_cert_1']);
    expect(allEvents()).toEqual([]);
    expect(onceKeys()).toEqual([]);
    expect(JSON.stringify(layer())).not.toMatch(/cs_cert_1/);
    unmount();

    render(<CertificationCheckoutPanel />);
    await screen.findByText(/certification purchased/i);
    expect(allEvents()).toEqual([]);
  });

  it('does not fire for an invented session id even if the user already paid', async () => {
    window.history.replaceState({}, '', '/dashboard/contractor/training?certification=success&session_id=cs_invented');
    fetchMock.mockImplementation(() => jsonResponse({ success: true, configured: true, paid: true, sessionPaid: false }));
    render(<CertificationCheckoutPanel />);
    await screen.findByText(/certification purchased/i);
    // The panel's own decision, read above the gate: it never asked.
    expect(mockOnceCalls).toEqual([]);
    expect(eventsNamed('certification_purchase')).toHaveLength(0);
  });

  it('does not fire on return while the purchase is unconfirmed', async () => {
    window.history.replaceState({}, '', '/dashboard/contractor/training?certification=success&session_id=cs_cert_2');
    fetchMock.mockImplementation(() => jsonResponse({ success: true, configured: true, paid: false, sessionPaid: false }));
    render(<CertificationCheckoutPanel />);
    await screen.findByText(/confirming your purchase/i);
    expect(mockOnceCalls).toEqual([]);
    expect(eventsNamed('certification_purchase')).toHaveLength(0);
  });

  it('shows the not-available state when checkout is unconfigured', async () => {
    fetchMock.mockImplementation(() => jsonResponse({ success: true, configured: false, paid: false, sessionPaid: false }));
    render(<CertificationCheckoutPanel />);
    expect(await screen.findByText(/not available yet/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/training/certification/checkout');
    expect(screen.queryByRole('button', { name: /purchase certification/i })).not.toBeInTheDocument();
  });
});
