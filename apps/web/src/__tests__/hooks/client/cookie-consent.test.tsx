/**
 * The cookie banner, the "Cookie settings" dialog and the footer control that
 * reopens it. The stored choice is read through src/lib/analytics-gate.ts, the
 * same reader the sending gate uses, so what these tests store is exactly what
 * decides whether anything is sent.
 */
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { CookieConsent } from '@/components/analytics/CookieConsent';
import { CookieSettingsButton } from '@/components/analytics/CookieSettingsButton';
import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION_KEY,
  COOKIE_SETTINGS_EVENT,
  readStoredConsent,
  writeStoredConsent,
} from '@/lib/analytics-gate';

function stored() {
  return readStoredConsent(window.localStorage);
}

function openFromEvent() {
  act(() => {
    window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_EVENT));
  });
}

function dialog() {
  return screen.getByRole('dialog', { name: 'Cookie settings' });
}

function analyticsSwitch() {
  return within(dialog()).getByRole('switch', { name: 'Analytics cookies' });
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('the banner', () => {
  it('shows when no choice is stored, and says only what the site does', () => {
    render(<CookieConsent />);
    const banner = screen.getByRole('region', { name: 'Cookie notice' });
    expect(banner).toHaveTextContent(/analyse site traffic/);
    expect(banner).not.toHaveTextContent(/personali[sz]ed|advertis|marketing/i);
    expect(within(banner).getByRole('link', { name: /cookie policy/i })).toHaveAttribute('href', '/cookie-policy');
  });

  it('does not show when a choice is stored under the current notice', () => {
    writeStoredConsent(window.localStorage, false);
    render(<CookieConsent />);
    expect(screen.queryByRole('region', { name: 'Cookie notice' })).not.toBeInTheDocument();
  });

  it('shows again when the stored choice was made under an older notice', () => {
    writeStoredConsent(window.localStorage, true);
    window.localStorage.setItem(CONSENT_VERSION_KEY, '2020-01-01');
    render(<CookieConsent />);
    expect(screen.getByRole('region', { name: 'Cookie notice' })).toBeInTheDocument();
  });

  it('Accept All stores yes for analytics only, and hides the banner', () => {
    const onChange = jest.fn();
    render(<CookieConsent onConsentChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Accept All' }));
    expect(stored()).toEqual({ necessary: true, analytics: true, marketing: false, preferences: false });
    expect(JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) as string)).toEqual({
      necessary: true,
      analytics: true,
      marketing: false,
      preferences: false,
    });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ analytics: true, marketing: false }));
    expect(screen.queryByRole('region', { name: 'Cookie notice' })).not.toBeInTheDocument();
  });

  it('Reject All stores no', () => {
    const onChange = jest.fn();
    render(<CookieConsent onConsentChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reject All' }));
    expect(stored()).toEqual({ necessary: true, analytics: false, marketing: false, preferences: false });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ analytics: false }));
  });

  it('Customise opens the dialog without storing anything', () => {
    render(<CookieConsent />);
    fireEvent.click(screen.getByRole('button', { name: /customise/i }));
    expect(dialog()).toBeInTheDocument();
    expect(stored()).toBeNull();
  });
});

describe('the Cookie settings dialog', () => {
  it('opens on the window event even when the banner is not showing', () => {
    writeStoredConsent(window.localStorage, true);
    render(<CookieConsent />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    openFromEvent();
    expect(dialog()).toBeInTheDocument();
    expect(analyticsSwitch()).toHaveAttribute('aria-checked', 'true');
  });

  it('reads the stored choice again each time it opens', () => {
    writeStoredConsent(window.localStorage, true);
    render(<CookieConsent />);
    // The choice changes underneath the component (another tab, for example).
    writeStoredConsent(window.localStorage, false);
    openFromEvent();
    expect(analyticsSwitch()).toHaveAttribute('aria-checked', 'false');
  });

  it('offers only the necessary and analytics switches', () => {
    render(<CookieConsent />);
    openFromEvent();
    const switches = within(dialog()).getAllByRole('switch');
    expect(switches).toHaveLength(2);
    expect(within(dialog()).getByRole('switch', { name: 'Necessary cookies' })).toBeDisabled();
    expect(dialog()).not.toHaveTextContent(/marketing|preference cookies/i);
  });

  it('Cancel discards the edit', () => {
    writeStoredConsent(window.localStorage, false);
    const onChange = jest.fn();
    render(<CookieConsent onConsentChange={onChange} />);
    onChange.mockClear();
    openFromEvent();
    fireEvent.click(analyticsSwitch());
    expect(analyticsSwitch()).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(within(dialog()).getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(stored()?.analytics).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('');

    openFromEvent();
    expect(analyticsSwitch()).toHaveAttribute('aria-checked', 'false');
  });

  it('Escape discards the edit', () => {
    writeStoredConsent(window.localStorage, true);
    const onChange = jest.fn();
    render(<CookieConsent onConsentChange={onChange} />);
    onChange.mockClear();
    openFromEvent();
    fireEvent.click(analyticsSwitch());
    expect(analyticsSwitch()).toHaveAttribute('aria-checked', 'false');
    fireEvent.keyDown(dialog(), { key: 'Escape', code: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(stored()?.analytics).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Save stores the choice, tells the page, and announces it', () => {
    writeStoredConsent(window.localStorage, true);
    const onChange = jest.fn();
    render(<CookieConsent onConsentChange={onChange} />);
    onChange.mockClear();
    openFromEvent();
    fireEvent.click(analyticsSwitch());
    fireEvent.click(within(dialog()).getByRole('button', { name: 'Save choices' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(stored()).toEqual({ necessary: true, analytics: false, marketing: false, preferences: false });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ necessary: true, analytics: false, marketing: false, preferences: false });
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Cookie choices saved');
  });

  it('Save from the banner path hides the banner', () => {
    render(<CookieConsent />);
    fireEvent.click(screen.getByRole('button', { name: /customise/i }));
    fireEvent.click(analyticsSwitch());
    fireEvent.click(within(dialog()).getByRole('button', { name: 'Save choices' }));
    expect(stored()?.analytics).toBe(true);
    expect(screen.queryByRole('region', { name: 'Cookie notice' })).not.toBeInTheDocument();
  });

  it('when the browser blocks storage, the choice is a no and the visitor is told', () => {
    const onChange = jest.fn();
    render(<CookieConsent onConsentChange={onChange} />);
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    try {
      openFromEvent();
      fireEvent.click(analyticsSwitch());
      fireEvent.click(within(dialog()).getByRole('button', { name: 'Save choices' }));
    } finally {
      setItem.mockRestore();
    }
    expect(stored()).toBeNull();
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ analytics: false }));
    expect(screen.getByRole('status')).not.toHaveTextContent('Cookie choices saved');
    expect(screen.getByRole('status')).toHaveTextContent(/could not be saved/i);
  });
});

describe('the Cookie settings control', () => {
  it('is a button named "Cookie settings" that sends the open event', () => {
    const heard = jest.fn();
    window.addEventListener(COOKIE_SETTINGS_EVENT, heard);
    try {
      render(<CookieSettingsButton className="legal-row-link" />);
      const button = screen.getByRole('button', { name: 'Cookie settings' });
      expect(button).toHaveClass('legal-row-link');
      expect(button).toHaveAttribute('type', 'button');
      fireEvent.click(button);
      expect(heard).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener(COOKIE_SETTINGS_EVENT, heard);
    }
  });

  it('opens the dialog, and focus returns to it when the dialog closes', async () => {
    writeStoredConsent(window.localStorage, false);
    render(
      <>
        <CookieConsent />
        <CookieSettingsButton />
      </>,
    );
    const button = screen.getByRole('button', { name: 'Cookie settings' });
    fireEvent.click(button);
    expect(dialog()).toBeInTheDocument();
    fireEvent.click(within(dialog()).getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // The dialog hands focus back on the next tick.
    await waitFor(() => expect(button).toHaveFocus());
  });

  it('does nothing harmful when no dialog is mounted to hear it', () => {
    render(<CookieSettingsButton />);
    expect(() => fireEvent.click(screen.getByRole('button', { name: 'Cookie settings' }))).not.toThrow();
  });
});
