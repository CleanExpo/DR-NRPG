/**
 * hCaptcha Component
 *
 * React wrapper for hCaptcha verification widget
 *
 * Setup:
 * 1. Create account at https://www.hcaptcha.com/
 * 2. Get site key from dashboard
 * 3. Set environment variables:
 *    - NEXT_PUBLIC_HCAPTCHA_SITE_KEY (client-side)
 *    - HCAPTCHA_SECRET (server-side)
 */

'use client';

import * as React from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    hcaptcha?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark';
          size?: 'normal' | 'compact' | 'invisible';
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      execute: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
    };
    onHCaptchaLoad?: () => void;
  }
}

const HCAPTCHA_SCRIPT_SELECTOR = 'script[src*="hcaptcha.com"]';
// Upper bound on waiting for the script tag; a stalled request otherwise
// leaves the user on "Loading verification..." with no way forward (DR-949).
const SCRIPT_LOAD_TIMEOUT_MS = 15000;

// Drop every hCaptcha script tag so the next attempt inserts a fresh one
// rather than waiting on a tag that already failed or already fired `load`.
function removeHCaptchaScripts() {
  document.querySelectorAll(HCAPTCHA_SCRIPT_SELECTOR).forEach((s) => s.remove());
}

export interface HCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
  className?: string;
}

export function HCaptcha({
  onVerify,
  onExpire,
  onError,
  theme = 'light',
  size = 'normal',
  className = '',
}: HCaptchaProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const widgetIdRef = React.useRef<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isVerified, setIsVerified] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  // Keep the latest callbacks in refs so a parent re-render (e.g. typing in the
  // form) does not tear down and re-render the widget, losing the challenge.
  const onVerifyRef = React.useRef(onVerify);
  const onExpireRef = React.useRef(onExpire);
  const onErrorRef = React.useRef(onError);
  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;
  onErrorRef.current = onError;

  React.useEffect(() => {
    // Check if site key is configured
    if (!siteKey) {
      setError('hCaptcha not configured');
      setIsLoading(false);

      // In development, allow bypass
      if (process.env.NODE_ENV === 'development') {
        console.warn('hCaptcha not configured. Development mode bypass available.');
      } else {
        // Fail loudly so the parent can show a fallback instead of a dead end (DR-949)
        console.error('NEXT_PUBLIC_HCAPTCHA_SITE_KEY is not set; CAPTCHA cannot render.');
        onErrorRef.current?.('hCaptcha not configured');
      }
      return;
    }

    let cancelled = false;

    // Load hCaptcha script. Every path settles: load, error or timeout.
    const loadScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if already loaded
        if (window.hcaptcha) {
          resolve();
          return;
        }

        const timer = setTimeout(
          () => reject(new Error('hCaptcha script load timed out')),
          SCRIPT_LOAD_TIMEOUT_MS
        );
        const done = () => {
          clearTimeout(timer);
          resolve();
        };
        const fail = () => {
          clearTimeout(timer);
          reject(new Error('Failed to load hCaptcha'));
        };

        const existingScript = document.querySelector<HTMLScriptElement>(
          HCAPTCHA_SCRIPT_SELECTOR
        );
        if (existingScript) {
          if (existingScript.dataset.hcaptchaState === 'loading') {
            // Another mount's request is still in flight: wait for it (bounded)
            existingScript.addEventListener('load', done);
            existingScript.addEventListener('error', fail);
          } else {
            // Its `load` already fired (or its state is unknown), so waiting for
            // `load` would hang. Go straight to the bounded API poll below.
            done();
          }
          return;
        }

        // Create and load script
        const script = document.createElement('script');
        script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.dataset.hcaptchaState = 'loading';

        script.onload = () => {
          script.dataset.hcaptchaState = 'loaded';
          done();
        };
        script.onerror = fail;

        document.head.appendChild(script);
      });
    };

    const initCaptcha = async () => {
      try {
        await loadScript();

        // Wait for hCaptcha to be available
        let attempts = 0;
        while (!window.hcaptcha && attempts < 50) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }

        if (!window.hcaptcha) {
          throw new Error('hCaptcha failed to initialize');
        }

        if (cancelled) return;

        // Render the widget. The container is always mounted (see below), so a
        // missing container is a real fault: fail loudly rather than silently.
        if (!containerRef.current) {
          throw new Error('hCaptcha container not mounted');
        }
        if (!widgetIdRef.current) {
          widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              setIsVerified(true);
              setError(null);
              onVerifyRef.current(token);
            },
            'error-callback': () => {
              setError('Verification failed. Please try again.');
              onErrorRef.current?.('Verification failed');
            },
            'expired-callback': () => {
              setIsVerified(false);
              onExpireRef.current?.();
            },
            theme,
            size,
          });
        }

        setIsLoading(false);
      } catch (err) {
        // An unmounted attempt must not touch the DOM: it could remove the
        // fresh script a retry has just inserted.
        if (cancelled) return;
        // No usable API (script error, load timeout or init timeout): drop the
        // stale script so Retry always starts from a fresh tag (DR-949).
        if (!window.hcaptcha) {
          removeHCaptchaScripts();
        }
        console.error('hCaptcha initialization error:', err);
        setError('Failed to load verification widget');
        setIsLoading(false);
        onErrorRef.current?.(err instanceof Error ? err.message : 'Initialization failed');
      }
    };

    initCaptcha();

    // Cleanup
    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.hcaptcha) {
        try {
          window.hcaptcha.remove(widgetIdRef.current);
        } catch {
          // Widget may already be removed
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, theme, size]);

  // Reset function exposed via ref if needed
  const reset = React.useCallback(() => {
    if (widgetIdRef.current && window.hcaptcha) {
      window.hcaptcha.reset(widgetIdRef.current);
      setIsVerified(false);
    }
  }, []);

  // Development mode bypass
  if (!siteKey && process.env.NODE_ENV === 'development') {
    return (
      <div
        className={`bg-yellow-50 border border-yellow-300 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <span className="font-medium text-yellow-800">
            Development Mode
          </span>
        </div>
        <p className="text-sm text-yellow-700 mb-3">
          hCaptcha not configured. Click below to bypass for development.
        </p>
        <button
          type="button"
          onClick={() => {
            setIsVerified(true);
            onVerify('development_bypass_token');
          }}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Bypass for Development
        </button>
      </div>
    );
  }

  // Error state
  if (error && !siteKey) {
    return (
      <div
        className={`bg-red-50 border border-red-300 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  // Verified state
  if (isVerified) {
    return (
      <div
        className={`bg-green-50 border border-green-300 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">
            Verification complete
          </span>
        </div>
      </div>
    );
  }

  // hCaptcha widget container. It stays mounted while loading: hcaptcha.render
  // needs it to exist, and an early loading-only return left it null (DR-949).
  return (
    <div className={`${className}`}>
      {isLoading && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-400">Loading verification...</span>
        </div>
      )}
      <div
        ref={containerRef}
        className="flex justify-center"
        style={{ minHeight: size === 'compact' ? '70px' : '78px' }}
      />
      {error && (
        <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}

export default HCaptcha;
