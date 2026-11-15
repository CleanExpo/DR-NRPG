/**
 * Claim Wizard - Success Page
 *
 * Confirmation page shown after successful claim submission
 * Uses DesignOS SuccessState component for professional feedback
 * NO phone contact CTAs (AI automated only, per spec)
 */

'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SuccessState } from '@/src/design-system/components/SuccessState/SuccessState';
import { Loader2 } from 'lucide-react';

export default function ClaimSuccessPage() {
  return (
    <Suspense fallback={<ClaimSuccessLoading />}>
      <ClaimSuccessContent />
    </Suspense>
  );
}

function ClaimSuccessLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  );
}

function ClaimSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const claimId = searchParams.get('claimId');

  // Redirect to step 1 if accessed without claim ID
  React.useEffect(() => {
    if (!claimId) {
      router.push('/claim/step-1');
    }
  }, [claimId, router]);

  if (!claimId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <SuccessState
          title="Help Is On The Way"
          message="We've received your claim and matched you with IICRC-certified contractors in your area. They'll contact you within 30 minutes to assess the damage and provide a quote."
          nextSteps={[
            {
              number: 1,
              text: 'Expect 1-3 contractor calls within 30 minutes',
            },
            {
              number: 2,
              text: 'Each contractor will assess the damage and provide a free quote',
            },
            {
              number: 3,
              text: 'Choose your preferred contractor based on their quote and availability',
            },
            {
              number: 4,
              text: 'Your chosen contractor will begin work (often within 2 hours for emergencies)',
            },
          ]}
          primaryAction={{
            label: 'Track My Claim',
            onClick: () => router.push(`/dashboard/client?claim=${claimId}`),
          }}
          secondaryAction={{
            label: 'Return to Homepage',
            onClick: () => router.push('/'),
          }}
        />

        {/* Claim Reference */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Claim Reference
          </h3>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 font-mono text-sm">
            {claimId}
          </div>
          <p className="text-sm text-gray-400 mt-3">
            Please save this reference number. You'll need it to track your claim or contact support.
          </p>
        </div>

        {/* What Happens Next */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            What Happens Next?
          </h3>
          <div className="space-y-4 text-sm text-blue-900">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <p className="font-semibold mb-1">Contractor Matching (Now)</p>
                <p className="text-blue-800">
                  Our AI system is matching you with the best available contractors based on your
                  location, disaster type, and urgency level.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <p className="font-semibold mb-1">First Contact (Within 30 Minutes)</p>
                <p className="text-blue-800">
                  Contractors will call you to discuss the damage, ask clarifying questions, and
                  schedule an on-site assessment if needed.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <p className="font-semibold mb-1">Quote & Assessment (Same Day)</p>
                <p className="text-blue-800">
                  Each contractor will provide a detailed quote and timeline. Compare their offers
                  and choose the one that best meets your needs.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <p className="font-semibold mb-1">Work Begins (Often Within 2 Hours)</p>
                <p className="text-blue-800">
                  For emergency situations, contractors can often begin work the same day to prevent
                  further damage and start the restoration process.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">
            Important Information
          </h3>
          <ul className="space-y-2 text-sm text-amber-900">
            <li className="flex gap-2">
              <span className="text-amber-600">•</span>
              <span>
                <strong>All contractors are IICRC-certified</strong> and have been vetted by our
                network
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-600">•</span>
              <span>
                <strong>No obligation:</strong> You're under no obligation to hire any contractor.
                Get quotes and decide
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-600">•</span>
              <span>
                <strong>Insurance claims:</strong> If you have insurance, contractors provide industry-standard documentation — scope of works and estimates — for you to submit to your insurer
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-600">•</span>
              <span>
                <strong>Direct payment:</strong> If paying directly, contractors will provide
                itemized quotes before starting work
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-600">•</span>
              <span>
                <strong>Communication preference:</strong> Contractors will contact you via phone
                and email as you specified
              </span>
            </li>
          </ul>
        </div>

        {/* Email Confirmation */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            A confirmation email has been sent with your claim details and next steps.
            <br />
            If you don't receive it within 5 minutes, please check your spam folder.
          </p>
        </div>

        {/* Support */}
        <div className="mt-8 text-center pb-12">
          <p className="text-sm text-gray-400 mb-2">Need help or have questions?</p>
          <a
            href="/help-center"
            className="text-sm text-dr-education hover:text-dr-education-hover underline"
          >
            Visit our Help Center
          </a>
        </div>
      </div>
    </div>
  );
}
