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

  // Retry, then prove a fresh script (not the dead one) is the only tag on the
  // page, and that loading it renders the widget.
  const retryLoadsFreshScriptAndRenders = async (deadScript: HTMLScriptElement) => {
    fireEvent.click(screen.getByRole('button', { name: /try the security check again/i }));
    await waitFor(() => {
      expect(hcaptchaScripts()).toHaveLength(1);
      expect(hcaptchaScripts()[0]).not.toBe(deadScript);
    });
    const freshScript = hcaptchaScripts()[0];

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
  };

  const firstScript = async () => {
    render(<ClaimStep3Page />);
    await waitFor(() => expect(hcaptchaScripts()).toHaveLength(1));
    return hcaptchaScripts()[0];
  };

  it('script error -> Retry loads a fresh script and renders the widget', async () => {
    const deadScript = await firstScript();
    act(() => {
      deadScript.dispatchEvent(new Event('error'));
    });
    await screen.findByTestId('claim-captcha-fallback');

    await retryLoadsFreshScriptAndRenders(deadScript);
  });

  describe('timeouts', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('script loads but the API never appears -> Retry loads a fresh script', async () => {
      const deadScript = await firstScript();
      // `load` fires, but window.hcaptcha is never defined
      act(() => {
        deadScript.dispatchEvent(new Event('load'));
      });
      await act(async () => {
        await jest.advanceTimersByTimeAsync(6000);
      });
      await screen.findByTestId('claim-captcha-fallback');

      await retryLoadsFreshScriptAndRenders(deadScript);
    });

    it('script never fires load or error -> fallback shows, then Retry loads a fresh script', async () => {
      const deadScript = await firstScript();
      await act(async () => {
        await jest.advanceTimersByTimeAsync(20000);
      });
      await screen.findByTestId('claim-captcha-fallback');

      await retryLoadsFreshScriptAndRenders(deadScript);
    });
  });
});
