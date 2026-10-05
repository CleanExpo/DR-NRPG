import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import ClaimStep3Page from '@/app/claim/step-3/page';

// DR-949: after the hCaptcha script failed to load, "Try again" reused the dead
// <script> tag and hung on "Loading verification..." forever. This drives the
// real page and the real HCaptcha component: script error -> Retry -> a fresh
// script loads -> hcaptcha.render is called.

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

const hcaptchaScripts = () =>
  Array.from(document.querySelectorAll<HTMLScriptElement>('script[src*="hcaptcha.com"]'));

describe('Claim step 3 CAPTCHA retry after a script load failure (DR-949)', () => {
  const originalKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

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
    process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY = 'site-key-for-test';
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
    else process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY = originalKey;
    delete window.hcaptcha;
    hcaptchaScripts().forEach((s) => s.remove());
  });

  it('loads a fresh script on Retry and renders the widget', async () => {
    render(<ClaimStep3Page />);

    // First attempt: the script tag is inserted, then fails (e.g. network or blocker)
    await waitFor(() => expect(hcaptchaScripts()).toHaveLength(1));
    const failedScript = hcaptchaScripts()[0];
    act(() => {
      failedScript.dispatchEvent(new Event('error'));
    });
    await screen.findByTestId('claim-captcha-fallback');

    // Retry: the dead script must not be reused
    fireEvent.click(screen.getByRole('button', { name: /try the security check again/i }));
    await waitFor(() =>
      expect(hcaptchaScripts().filter((s) => s !== failedScript)).toHaveLength(1)
    );
    const freshScript = hcaptchaScripts().find((s) => s !== failedScript)!;

    // The fresh script loads and exposes the API
    const renderWidget = jest.fn<string, [string | HTMLElement, unknown]>(() => 'widget-1');
    window.hcaptcha = {
      render: renderWidget,
      reset: jest.fn(),
      remove: jest.fn(),
      execute: jest.fn(),
      getResponse: jest.fn(),
    };
    act(() => {
      freshScript.dispatchEvent(new Event('load'));
    });

    await waitFor(() => expect(renderWidget).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(/loading verification/i)).not.toBeInTheDocument();
  });
});
