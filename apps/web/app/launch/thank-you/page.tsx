/**
 * Waitlist Thank You Page
 *
 * Route: /launch/thank-you
 * Purpose: Confirmation page after successful waitlist sign-up
 * Features:
 * - Success message
 * - Next steps timeline
 * - Social sharing buttons
 * - Resource links
 */

import React, { Suspense } from 'react';
import { SITE_URL } from '@/lib/seo/site-url';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'You\'re on the List! - NRPG Waitlist',
  description:
    'Thank you for joining the NRPG waitlist. Check your email for confirmation and next steps.',
  robots: 'noindex, nofollow', // Don't index thank you pages
};

function ThankYouContent() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
            <svg className="h-14 w-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            You're on the List! 🎉
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-400">
            Thank you for joining the NRPG waitlist. You're now part of an exclusive group waiting for Australia's premier disaster recovery network.
          </p>
        </div>

        {/* Email Confirmation Notice */}
        <div className="mt-12 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-blue-900">Check Your Email</h3>
              <p className="mt-2 text-base text-blue-800">
                We've sent a confirmation email with more details about what happens next. If you don't see it in a few minutes, check your spam folder.
              </p>
              <p className="mt-2 text-sm text-blue-700">
                <strong>Pro Tip:</strong> Check your inbox regularly to ensure you don't miss our launch announcement!
              </p>
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="mt-16">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            What Happens Next?
          </h2>
          <div className="mt-8 space-y-8">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-600 text-xl font-bold text-white">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">We're Building</h3>
                <p className="mt-1 text-base text-gray-400">
                  Our team is working hard to create the best disaster recovery platform in Australia. We'll share monthly progress updates and exclusive behind-the-scenes content.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-600 text-xl font-bold text-white">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">You'll Get Updates</h3>
                <p className="mt-1 text-base text-gray-400">
                  Stay informed with monthly emails about our progress, exclusive disaster recovery tips, and industry insights. No spam, just valuable content.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-600 text-xl font-bold text-white">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Early Access (2 Weeks Before Launch)</h3>
                <p className="mt-1 text-base text-gray-400">
                  You'll be among the first to try the platform with exclusive early access 2 weeks before the public launch. Help us test, provide feedback, and shape the final product.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-xl font-bold text-white">
                  ✓
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Launch Notification (Q2 2026)</h3>
                <p className="mt-1 text-base text-gray-400">
                  When we launch in April-June 2026, you'll receive an immediate email notification. Be ready to access verified contractors 24/7 for all your disaster recovery needs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Sharing */}
        <div className="mt-16 rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Help Us Spread the Word</h2>
          <p className="mt-2 text-base text-gray-400">
            Know someone who needs disaster recovery services? Share NRPG with them!
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {/* Twitter Share */}
            <a
              href={`https://twitter.com/intent/tweet?text=Just%20joined%20the%20waitlist%20for%20NRPG%2C%20Australia%27s%20premier%20disaster%20recovery%20network!%20%F0%9F%9A%80&url=${SITE_URL}/launch`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1DA1F2] px-6 py-3 font-semibold text-white transition hover:bg-[#1a8cd8]"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
              Share on Twitter
            </a>

            {/* Facebook Share */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${SITE_URL}/launch`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1877F2] px-6 py-3 font-semibold text-white transition hover:bg-[#166fe5]"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Share on Facebook
            </a>

            {/* LinkedIn Share */}
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${SITE_URL}/launch`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0A66C2] px-6 py-3 font-semibold text-white transition hover:bg-[#095196]"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Share on LinkedIn
            </a>
          </div>
        </div>

        {/* Next Actions */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          <Link
            href="/"
            className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:border-orange-300 hover:shadow-md"
          >
            <svg
              className="h-12 w-12 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Explore the Platform</h3>
            <p className="mt-2 text-sm text-gray-400">
              Learn more about NRPG and what we're building
            </p>
          </Link>

          <Link
            href="/contractors/join"
            className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:border-orange-300 hover:shadow-md"
          >
            <svg
              className="h-12 w-12 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Are You a Contractor?</h3>
            <p className="mt-2 text-sm text-gray-400">
              Join the network and start receiving qualified leads
            </p>
          </Link>
        </div>

        {/* Contact */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-400">
            Questions about your waitlist spot?{' '}
            <a href="/contact" className="font-medium text-orange-600 hover:underline">
              Contact us online
            </a>{' '}
            or visit our{' '}
            <Link href="/support" className="font-medium text-orange-600 hover:underline">
              support page
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ThankYouContent />
    </Suspense>
  );
}
