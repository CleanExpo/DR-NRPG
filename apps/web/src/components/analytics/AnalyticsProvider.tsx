/**
 * Analytics Provider Component
 *
 * Wraps the app with analytics initialization and cookie consent
 */

'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { GoogleAnalytics } from './GoogleAnalytics';
import { CookieConsent, type CookiePreferences } from './CookieConsent';
import { useGA4PageAnalytics } from '@/hooks/useGA4';
import { installAnalyticsGuards, syncGate, withdrawAnalytics } from '@/lib/analytics';
import { CONSENT_CHANGED_EVENT, readStoredConsent } from '@/lib/analytics-gate';

interface AnalyticsProviderProps {
  children: ReactNode;
  measurementId: string;
  gtmId?: string;
  debug?: boolean;
}

/**
 * 'unknown' is the state before the stored choice has been read. It is not a
 * "no": nothing is withdrawn and no cookie is deleted because of it.
 */
type ConsentState = 'unknown' | 'granted' | 'denied';

function storedState(): ConsentState {
  try {
    const stored = readStoredConsent(window.localStorage);
    if (!stored) return 'unknown';
    return stored.analytics === true ? 'granted' : 'denied';
  } catch {
    // Storage is blocked: the visitor cannot have said yes.
    return 'unknown';
  }
}

export function AnalyticsProvider({
  children,
  measurementId,
  gtmId,
  debug = false,
}: AnalyticsProviderProps) {
  const [consent, setConsent] = useState<ConsentState>('unknown');
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    installAnalyticsGuards();

    const read = () => {
      const state = storedState();
      setConsent(state);
      // A stored "no" is the visitor's own choice, so it is honoured again here.
      if (state === 'denied') withdrawAnalytics();
    };
    read();

    // The choice changed in another tab.
    window.addEventListener(CONSENT_CHANGED_EVENT, read);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, read);
  }, []);

  const handleConsentChange = useCallback((preferences: CookiePreferences) => {
    if (preferences.analytics === true) {
      setConsent('granted');
      syncGate();
    } else {
      setConsent('denied');
      withdrawAnalytics();
    }
  }, []);

  // Keep Google's off switch right for the page now showing.
  useEffect(() => {
    syncGate();
  }, [pathname, consent]);

  const granted = consent === 'granted';

  // Enable comprehensive page tracking once consent is given
  useGA4PageAnalytics({
    enableScrollTracking: granted,
    enableTimeTracking: granted,
    enableOutboundTracking: granted,
    consentState: consent,
  });

  // `children` keeps the same position before and after mount, so the app
  // tree is not remounted when the analytics pieces appear.
  return (
    <>
      {mounted ? (
        <GoogleAnalytics
          measurementId={measurementId}
          gtmId={gtmId}
          debug={debug}
          cookieConsent={granted}
        />
      ) : null}
      {mounted ? <CookieConsent onConsentChange={handleConsentChange} /> : null}
      {children}
    </>
  );
}
