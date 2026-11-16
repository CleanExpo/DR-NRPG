/**
 * Client Onboarding - Get Started Page
 * Step-by-step wizard for new clients to submit service requests
 */

import { Metadata } from 'next'
import ClientOnboardingWizard from '@/components/onboarding/ClientOnboardingWizard'
import { CookieSettingsButton } from '@/components/analytics/CookieSettingsButton'

export const metadata: Metadata = {
  title: 'Get Started | Disaster Recovery Australia',
  description: 'Connect with certified restoration contractors in your area. Free quotes for water damage, fire restoration, mould remediation and more.',
  openGraph: {
    title: 'Get Started with Disaster Recovery',
    description: 'Connect with certified restoration contractors in your area.',
  }
}

export default function GetStartedPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Get Your Free Quote
            </h1>
            <p className="text-lg text-slate-600">
              Connect with certified restoration professionals in your area.
              No obligation, no phone calls - just qualified contractors ready to help.
            </p>
          </div>
          
          <ClientOnboardingWizard />
          
          <div className="mt-12 text-center text-sm text-slate-500">
            <p>
              Need assistance?{' '}
              <a
                href="/contact"
                className="text-blue-600 hover:underline"
              >
                Contact us online
              </a>
            </p>
            {/* This page has no site footer, so the cookie control sits here. */}
            <CookieSettingsButton className="text-sm text-gray-600 underline hover:text-gray-900 transition-colors focus-visible:ring-blue-700 focus-visible:ring-offset-white" />
          </div>
        </div>
      </div>
    </main>
  )
}
