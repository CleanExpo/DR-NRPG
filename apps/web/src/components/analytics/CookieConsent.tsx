/**
 * Cookie Consent Banner
 *
 * GDPR-compliant cookie consent manager for analytics
 */

'use client';

import { useState, useEffect } from 'react';
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
import { clearStoredConsent, readStoredConsent, writeStoredConsent } from '@/lib/analytics-gate';

interface CookieConsentProps {
  onConsentChange?: (consent: CookiePreferences) => void;
}

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export function CookieConsent({ onConsentChange }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Check if consent has already been given
    const consent = getCookieConsent();
    if (consent === null) {
      // No consent given yet, show banner
      setShowBanner(true);
    } else {
      // Consent already given
      setPreferences(consent);
      onConsentChange?.(consent);
    }
  }, [onConsentChange]);

  const handleAcceptAll = () => {
    const allConsent: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveConsent(allConsent);
    setPreferences(allConsent);
    setShowBanner(false);
    onConsentChange?.(allConsent);
  };

  const handleRejectAll = () => {
    const minimalConsent: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    saveConsent(minimalConsent);
    setPreferences(minimalConsent);
    setShowBanner(false);
    onConsentChange?.(minimalConsent);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
    setShowBanner(false);
    setShowSettings(false);
    onConsentChange?.(preferences);
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
        <Card className="max-w-4xl mx-auto bg-gray-900 border-gray-700 shadow-2xl pointer-events-auto">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Cookie className="h-6 w-6 text-[#00BFA6]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-2">Cookie Preferences</h3>
                <p className="text-sm text-gray-300 mb-4">
                  We use cookies to enhance your browsing experience, analyze site traffic, and
                  provide personalized content. By clicking "Accept All", you consent to our use of
                  cookies.{' '}
                  <a
                    href="/privacy-policy"
                    className="text-[#00BFA6] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more
                  </a>
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleAcceptAll}
                    className="bg-[#00BFA6] hover:bg-[#00A693] text-white"
                  >
                    Accept All
                  </Button>
                  <Button
                    onClick={handleRejectAll}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Reject All
                  </Button>
                  <Button
                    onClick={handleOpenSettings}
                    variant="ghost"
                    className="text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Customize
                  </Button>
                </div>
              </div>
              <button
                onClick={handleRejectAll}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Cookie Settings</DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage your cookie preferences. You can enable or disable different types of cookies
              below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label className="text-base font-semibold text-white">
                  Necessary Cookies
                </Label>
                <p className="text-sm text-gray-400 mt-1">
                  Essential cookies required for the website to function properly. These cannot be
                  disabled.
                </p>
              </div>
              <Switch checked={true} disabled className="mt-1" />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label htmlFor="analytics" className="text-base font-semibold text-white">
                  Analytics Cookies
                </Label>
                <p className="text-sm text-gray-400 mt-1">
                  Help us understand how visitors interact with our website by collecting and
                  reporting information anonymously.
                </p>
              </div>
              <Switch
                id="analytics"
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, analytics: checked }))
                }
                className="mt-1"
              />
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label htmlFor="marketing" className="text-base font-semibold text-white">
                  Marketing Cookies
                </Label>
                <p className="text-sm text-gray-400 mt-1">
                  Used to track visitors across websites to display relevant advertisements and
                  measure campaign effectiveness.
                </p>
              </div>
              <Switch
                id="marketing"
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, marketing: checked }))
                }
                className="mt-1"
              />
            </div>

            {/* Preference Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label htmlFor="preferences" className="text-base font-semibold text-white">
                  Preference Cookies
                </Label>
                <p className="text-sm text-gray-400 mt-1">
                  Enable the website to remember choices you make (such as language or region) and
                  provide enhanced features.
                </p>
              </div>
              <Switch
                id="preferences"
                checked={preferences.preferences}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, preferences: checked }))
                }
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              onClick={() => setShowSettings(false)}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePreferences}
              className="bg-[#00BFA6] hover:bg-[#00A693] text-white"
            >
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

function saveConsent(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return;
  try {
    writeStoredConsent(window.localStorage, preferences.analytics === true);
  } catch {
    // Storage is blocked: nothing is kept, and the gate reads that as "no".
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
