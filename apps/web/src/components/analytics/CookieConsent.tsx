/**
 * Cookie banner and "Cookie settings" dialog
 *
 * The banner asks once. The dialog is always mounted, so the "Cookie settings"
 * control in each footer can reopen it at any time (it sends the
 * COOKIE_SETTINGS_EVENT window event). The site has two kinds of cookie:
 * the ones it needs to work, and Google Analytics. Nothing else is offered
 * because nothing else is used.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Cookie, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  COOKIE_SETTINGS_EVENT,
  clearStoredConsent,
  readStoredConsent,
  writeStoredConsent,
} from '@/lib/analytics-gate';

interface CookieConsentProps {
  onConsentChange?: (consent: CookiePreferences) => void;
}

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  /** Always false: the site sets no marketing cookies. */
  marketing: boolean;
  /** Always false: the site sets no preference cookies. */
  preferences: boolean;
}

const SAVED_MESSAGE = 'Cookie choices saved';
const NOT_SAVED_MESSAGE =
  'Your choice could not be saved in this browser, so analytics cookies stay off.';
const STATUS_SHOWN_MS = 6000;

// The shared switch takes its colours from theme names that resolve to
// nothing on this site, so it is painted fully transparent: present,
// clickable and impossible to see. The colours are stated outright here.
const SWITCH_COLOURS =
  'mt-1 border-gray-400 data-[state=unchecked]:bg-gray-600 data-[state=checked]:bg-[#00BFA6] dark:data-[state=unchecked]:bg-gray-600 focus-visible:ring-[#00BFA6] [&>span]:!bg-white';

function choice(analytics: boolean): CookiePreferences {
  return { necessary: true, analytics, marketing: false, preferences: false };
}

export function CookieConsent({ onConsentChange }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // The switch position while the dialog is open. It is not the stored choice
  // until Save is pressed; Cancel and Escape throw it away.
  const [analyticsDraft, setAnalyticsDraft] = useState(false);
  const [status, setStatus] = useState('');
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Check if consent has already been given
    const consent = getCookieConsent();
    if (consent === null) {
      // No consent given yet, show banner
      setShowBanner(true);
    } else {
      onConsentChange?.(consent);
    }
  }, [onConsentChange]);

  // Clear the confirmation after a short while.
  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(''), STATUS_SHOWN_MS);
    return () => window.clearTimeout(timer);
  }, [status]);

  const openSettings = useCallback((opener?: unknown) => {
    openerRef.current = opener instanceof HTMLElement ? opener : null;
    // Read the stored choice again: it may have changed in another tab.
    setAnalyticsDraft(getCookieConsent()?.analytics === true);
    setStatus('');
    setShowSettings(true);
  }, []);

  // The footer control asks for the dialog with a window event.
  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ opener?: unknown } | null>).detail;
      openSettings(detail?.opener);
    };
    window.addEventListener(COOKIE_SETTINGS_EVENT, onOpen);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, onOpen);
  }, [openSettings]);

  /**
   * Store the choice and tell the page. If the browser will not store it, the
   * choice is a "no": the sending gate reads the same storage and would treat
   * it that way in any case. Returns whether it was stored.
   */
  const applyChoice = (analytics: boolean): boolean => {
    const savedOk = saveConsent(choice(analytics));
    setShowBanner(false);
    onConsentChange?.(choice(savedOk ? analytics : false));
    return savedOk;
  };

  const handleAcceptAll = () => {
    if (!applyChoice(true)) setStatus(NOT_SAVED_MESSAGE);
  };

  const handleRejectAll = () => {
    applyChoice(false);
  };

  const handleSavePreferences = () => {
    const savedOk = applyChoice(analyticsDraft);
    setShowSettings(false);
    setStatus(savedOk ? SAVED_MESSAGE : NOT_SAVED_MESSAGE);
  };

  return (
    <>
      {/* Cookie Banner */}
      {showBanner ? (
        <div
          role="region"
          aria-label="Cookie notice"
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none"
        >
          {/* Limited to the screen height and scrolls inside, so the buttons stay
              reachable on a 320px-wide screen (DR-999). */}
          <Card className="max-w-4xl mx-auto max-h-[calc(100dvh-2rem)] md:max-h-[calc(100dvh-3rem)] overflow-y-auto bg-gray-900 border-gray-700 shadow-2xl pointer-events-auto">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Cookie className="h-6 w-6 text-[#00BFA6]" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white mb-2">Cookies on this site</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    We use the cookies this site needs to work. If you choose &quot;Accept
                    All&quot;, we also use Google Analytics cookies to analyse site traffic.{' '}
                    <a
                      href="/cookie-policy"
                      className="text-[#00BFA6] underline hover:no-underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read the cookie policy
                    </a>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleAcceptAll}
                      className="min-h-[44px] bg-[#00BFA6] hover:bg-[#00A693] text-white"
                    >
                      Accept All
                    </Button>
                    <Button
                      onClick={handleRejectAll}
                      variant="outline"
                      className="min-h-[44px] border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Reject All
                    </Button>
                    <Button
                      onClick={(event) => openSettings(event.currentTarget)}
                      variant="ghost"
                      className="min-h-[44px] text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
                      Customise
                    </Button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRejectAll}
                  className="flex-shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-sm text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00BFA6]"
                  aria-label="Reject and close"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {/* Cookie Settings Dialog: always mounted, opened by the banner or a footer */}
      <Dialog
        open={showSettings}
        onOpenChange={(open) => {
          // Closing by Escape, the corner button or a click outside discards the edit.
          if (!open) setShowSettings(false);
        }}
      >
        <DialogContent
          className="bg-gray-900 border-gray-700 text-white max-w-2xl"
          onCloseAutoFocus={(event) => {
            const opener = openerRef.current;
            if (opener && opener.isConnected) {
              event.preventDefault();
              opener.focus();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl">Cookie settings</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose which cookies this site may use. Your choice applies from now on, and you
              can change it here at any time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label htmlFor="cookie-necessary" className="text-base font-semibold text-white">
                  Necessary cookies
                </Label>
                <p className="text-sm text-gray-400 mt-1">
                  Needed for the site to work, such as keeping you signed in and remembering this
                  choice. These cannot be turned off.
                </p>
              </div>
              <Switch id="cookie-necessary" checked={true} disabled className={SWITCH_COLOURS} />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label htmlFor="cookie-analytics" className="text-base font-semibold text-white">
                  Analytics cookies
                </Label>
                <p className="text-sm text-gray-400 mt-1">
                  Google Analytics cookies that let us count visits to our public pages. Off unless
                  you turn them on. Turning them off stops future collection and removes the
                  cookies from this browser. It does not delete what Google already holds.
                </p>
              </div>
              <Switch
                id="cookie-analytics"
                checked={analyticsDraft}
                onCheckedChange={(checked) => setAnalyticsDraft(checked === true)}
                className={SWITCH_COLOURS}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              onClick={() => setShowSettings(false)}
              variant="outline"
              className="min-h-[44px] border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePreferences}
              className="min-h-[44px] bg-[#00BFA6] hover:bg-[#00A693] text-white"
            >
              Save choices
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation, announced politely to screen readers. Always in the page. */}
      <div
        role="status"
        aria-live="polite"
        className={
          status
            ? 'fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-md border border-gray-700 bg-gray-900 px-4 py-3 text-center text-sm text-white shadow-lg sm:left-4 sm:right-auto sm:mx-0'
            : 'sr-only'
        }
      >
        {status}
      </div>
    </>
  );
}

// The stored choice has one owner: src/lib/analytics-gate.ts holds the keys,
// the notice version and the parse. A choice made under an older notice is
// treated as no choice, so the banner asks again. If the browser blocks
// storage the choice cannot be kept and is treated as "no".
function getCookieConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    return readStoredConsent(window.localStorage);
  } catch {
    return null;
  }
}

/** Returns false when the browser would not store the choice. */
function saveConsent(preferences: CookiePreferences): boolean {
  if (typeof window === 'undefined') return false;
  try {
    writeStoredConsent(window.localStorage, preferences.analytics === true);
    return true;
  } catch {
    // Storage is blocked: nothing is kept, and the gate reads that as "no".
    return false;
  }
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent()?.analytics === true;
}

export function clearCookieConsent(): void {
  if (typeof window === 'undefined') return;
  try {
    clearStoredConsent(window.localStorage);
  } catch {
    // Storage is blocked: there is nothing to clear.
  }
}
