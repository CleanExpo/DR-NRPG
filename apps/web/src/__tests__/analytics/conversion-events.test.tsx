/**
 * Wave 1 GA4 conversion events, sent through the existing consent-gated GA4
 * client (src/lib/analytics.ts; window.gtag exists only after consent):
 *   claim_submitted, contractor_signup, certification_purchase, callout_paid.
 * Events carry no personal information, and payment-return events fire once per
 * Stripe session.
 */
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import ClaimStep3Page from '@/app/claim/step-3/page';
import { SignupForm } from '@/app/signup/signup-form';
import { CalloutCheckoutPanel } from '@/components/payments/callout-checkout-panel';
import { CertificationCheckoutPanel } from '@/components/payments/certification-checkout-panel';
import { trackEventOnce } from '@/lib/analytics';

const mockRegister = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ register: mockRegister }),
}));

jest.mock('@/lib/claim-wizard/storage', () => ({
  loadClaimProgress: () => ({
    step1: { disasterType: 'water', isEmergency: 'no', isOngoing: 'no' },
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

let gtag: jest.Mock;
const fetchMock = jest.fn();

function eventsNamed(name: string) {
  return gtag.mock.calls.filter(([kind, eventName]) => kind === 'event' && eventName === name);
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
  gtag = jest.fn();
  (window as unknown as { gtag: jest.Mock }).gtag = gtag;
  global.fetch = fetchMock as unknown as typeof fetch;
  fetchMock.mockReset();
  mockRegister.mockReset();
  window.sessionStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('trackEventOnce', () => {
  it('sends an event once per key', () => {
    trackEventOnce('callout_paid', 'cs_1', { value: 1 });
    trackEventOnce('callout_paid', 'cs_1', { value: 1 });
    trackEventOnce('callout_paid', 'cs_2', { value: 1 });
    expect(eventsNamed('callout_paid')).toHaveLength(2);
  });

  it('does nothing without consent (no gtag)', () => {
    delete (window as unknown as { gtag?: jest.Mock }).gtag;
    expect(() => trackEventOnce('callout_paid', 'cs_1')).not.toThrow();
    expect(gtag).not.toHaveBeenCalled();
  });
});

describe('claim_submitted', () => {
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
    expect(params).toMatchObject({ claim_type: 'water' });
    expect(JSON.stringify(params)).not.toMatch(PII);
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
  it('fires once when the server confirms the callout paid', async () => {
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
    fetchMock.mockImplementation(() => jsonResponse({ success: true, paid: false, paymentStatus: 'unpaid' }));
    render(<CalloutCheckoutPanel requestId="sr_1" status="success" sessionId="cs_callout_2" />);
    await screen.findByText(/not paid yet/i);
    expect(eventsNamed('callout_paid')).toHaveLength(0);
  });
});

describe('certification_purchase', () => {
  it('fires once when the server confirms this returned session is the user’s paid checkout', async () => {
    window.history.replaceState({}, '', '/dashboard/contractor/training?certification=success&session_id=cs_cert_1');
    fetchMock.mockImplementation(() => jsonResponse({ success: true, configured: true, paid: true, sessionPaid: true }));
    const { unmount } = render(<CertificationCheckoutPanel />);
    await screen.findByText(/certification purchased/i);
    expect(fetchMock).toHaveBeenCalledWith('/api/training/certification/checkout?session_id=cs_cert_1');
    expect(eventsNamed('certification_purchase')).toHaveLength(1);
    unmount();

    render(<CertificationCheckoutPanel />);
    await screen.findByText(/certification purchased/i);
    expect(eventsNamed('certification_purchase')).toHaveLength(1);
  });

  it('does not fire for an invented session id even if the user already paid', async () => {
    window.history.replaceState({}, '', '/dashboard/contractor/training?certification=success&session_id=cs_invented');
    fetchMock.mockImplementation(() => jsonResponse({ success: true, configured: true, paid: true, sessionPaid: false }));
    render(<CertificationCheckoutPanel />);
    await screen.findByText(/certification purchased/i);
    expect(eventsNamed('certification_purchase')).toHaveLength(0);
  });

  it('does not fire on return while the purchase is unconfirmed', async () => {
    window.history.replaceState({}, '', '/dashboard/contractor/training?certification=success&session_id=cs_cert_2');
    fetchMock.mockImplementation(() => jsonResponse({ success: true, configured: true, paid: false, sessionPaid: false }));
    render(<CertificationCheckoutPanel />);
    await screen.findByText(/confirming your purchase/i);
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
