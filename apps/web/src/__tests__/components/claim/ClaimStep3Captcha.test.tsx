import { render, screen, fireEvent, act } from '@testing-library/react';
import ClaimStep3Page from '@/app/claim/step-3/page';

// DR-949: claim step 3 kept Submit disabled "until CAPTCHA" but never showed a
// CAPTCHA, and gave no way forward when the widget could not load.

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/claim/step-3',
}));

jest.mock('@/lib/claim-wizard/storage', () => ({
  loadClaimProgress: () => ({ step1: { any: 'x' }, step2: { any: 'y' } }),
  saveClaimProgress: jest.fn(),
  clearClaimProgress: jest.fn(),
}));

jest.mock('@/src/design-system/components/Layout/PageTransition', () => ({
  PageTransition: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/upload/PhotoUpload', () => ({
  PhotoUpload: () => null,
}));

let captchaProps: { onError?: (e: string) => void } = {};
let captchaMounts = 0;
jest.mock('@/components/captcha/HCaptcha', () => {
  const React = jest.requireActual('react');
  return {
    HCaptcha: (props: { onError?: (e: string) => void }) => {
      captchaProps = props;
      React.useEffect(() => {
        captchaMounts += 1;
      }, []);
      return <div data-testid="hcaptcha-widget" />;
    },
  };
});

describe('Claim step 3 CAPTCHA (DR-949)', () => {
  beforeAll(() => {
    // jsdom has no matchMedia; design-system animation hooks call it
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
    captchaProps = {};
    captchaMounts = 0;
  });

  it('renders the CAPTCHA widget without needing a submit click first', () => {
    render(<ClaimStep3Page />);

    expect(screen.getByTestId('hcaptcha-widget')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit claim/i })).toBeDisabled();
  });

  it('shows an in-flow fallback when the CAPTCHA cannot load, and still blocks submit', () => {
    render(<ClaimStep3Page />);

    act(() => captchaProps.onError?.('hCaptcha not configured'));

    expect(screen.getByTestId('claim-captcha-fallback')).toHaveTextContent(
      /couldn't load the security check/i
    );
    expect(screen.getByRole('link', { name: /get help from support/i })).toHaveAttribute(
      'href',
      '/contact'
    );
    // The contact form is support only; it must never be presented as claim intake
    expect(screen.getByTestId('claim-captcha-fallback')).not.toHaveTextContent(/lodge/i);
    expect(screen.getByRole('button', { name: /submit claim/i })).toBeDisabled();

    const mountsBeforeRetry = captchaMounts;
    fireEvent.click(screen.getByRole('button', { name: /try the security check again/i }));

    expect(screen.queryByTestId('claim-captcha-fallback')).not.toBeInTheDocument();
    expect(captchaMounts).toBe(mountsBeforeRetry + 1);
  });
});
