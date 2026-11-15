/**
 * Google Analytics 4 Component
 *
 * Loads the Google tag only after the gate has been open once on this page
 * load: the visitor said yes, and the page is one that may be counted. Once
 * loaded the tag stays for the life of the page; from then on the gate and
 * Google's own off switch (kept by src/lib/analytics.ts) decide what is sent.
 */

'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { gateOpen, initializeGA4 } from '@/lib/analytics';
import { isMeasurementId } from '@/lib/analytics-gate';

interface GoogleAnalyticsProps {
  measurementId: string;
  /** Accepted and ignored: this site does not load Google Tag Manager. */
  gtmId?: string;
  debug?: boolean;
  cookieConsent?: boolean;
}

export function GoogleAnalytics({
  measurementId,
  debug = false,
  cookieConsent = true,
}: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (load || !cookieConsent || !isMeasurementId(measurementId)) return;
    // Set the off switch and queue the configuration before the tag exists,
    // so the first thing the tag reads is already clean.
    initializeGA4({ measurementId, debug });
    if (gateOpen()) setLoad(true);
  }, [load, cookieConsent, measurementId, debug, pathname]);

  if (!load || !isMeasurementId(measurementId)) {
    return null;
  }

  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
      strategy="afterInteractive"
    />
  );
}
