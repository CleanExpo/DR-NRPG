import { CookieSettingsButton } from '@/components/analytics/CookieSettingsButton'
import { SITE_URL } from '@/lib/seo/site-url'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Your Account | NRPG — Disaster Recovery Australia',
  description: 'Sign up to access the NRPG platform. Property owners lodge claims, contractors register to receive pre-qualified disaster recovery leads.',
  alternates: {
    canonical: `${SITE_URL}/signup`,
  },
}

/**
 * /signup has no site footer, and the page switches between screens (the
 * form, then the onboarding screens a new account sees). The "Cookie settings"
 * control lives here, around whatever screen the page returns, so no screen
 * can be without it (spec E38).
 */
export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <footer className="bg-slate-900 py-3 text-center">
        <CookieSettingsButton className="text-xs text-gray-400 underline hover:text-white transition-colors focus-visible:ring-offset-slate-900" />
      </footer>
    </>
  )
}
