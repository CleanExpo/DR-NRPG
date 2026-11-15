/**
 * "Cookie settings" control
 *
 * A text button that reopens the cookie dialog (CookieConsent listens for the
 * event). It passes itself as the opener so focus comes back here when the
 * dialog closes. Pass the surrounding row's own link classes as `className`.
 */

'use client';

import { useCallback, useRef } from 'react';
import { COOKIE_SETTINGS_EVENT } from '@/lib/analytics-gate';
import { cn } from '@/lib/utils';

interface CookieSettingsButtonProps {
  className?: string;
}

export function CookieSettingsButton({ className }: CookieSettingsButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const open = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent(COOKIE_SETTINGS_EVENT, { detail: { opener: ref.current } }),
    );
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      onClick={open}
      className={cn(
        // 44px tap height, and a ring that shows for keyboard users only.
        'inline-flex min-h-[44px] items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00BFA6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1115]',
        className,
      )}
    >
      Cookie settings
    </button>
  );
}
