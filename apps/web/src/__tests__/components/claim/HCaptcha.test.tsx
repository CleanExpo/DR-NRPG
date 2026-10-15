import { render, waitFor } from '@testing-library/react';
import { HCaptcha } from '@/components/captcha/HCaptcha';

// DR-949: the widget never rendered, and a missing site key failed silently.

describe('HCaptcha (DR-949)', () => {
  const originalKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  afterEach(() => {
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
    else process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY = originalKey;
    delete window.hcaptcha;
  });

  it('renders the widget into a mounted container once the script is ready', async () => {
    process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY = 'site-key-for-test';
    const renderWidget = jest.fn<string, [string | HTMLElement, unknown]>(() => 'widget-1');
    window.hcaptcha = {
      render: renderWidget,
      reset: jest.fn(),
      remove: jest.fn(),
      execute: jest.fn(),
      getResponse: jest.fn(),
    };

    render(<HCaptcha onVerify={jest.fn()} />);

    await waitFor(() => expect(renderWidget).toHaveBeenCalledTimes(1));
    expect(renderWidget.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
  });

  it('reports an error to the parent when the site key is missing outside development', async () => {
    delete process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
    const onError = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<HCaptcha onVerify={jest.fn()} onError={onError} />);

    await waitFor(() => expect(onError).toHaveBeenCalledWith('hCaptcha not configured'));
  });
});
