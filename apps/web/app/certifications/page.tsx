/**
 * Certifications & Standards
 *
 * NOTE (launch-readiness remediation): the previous version of this page asserted
 * awards, industry memberships, insurer partnerships and performance metrics that
 * are not substantiated by repo evidence or owner-approved records. Those claims
 * were removed because publishing unverifiable credentials is misleading conduct
 * under the Australian Consumer Law (ACCC).
 *
 * This page is intentionally a minimal, honest stub and is set to noindex until it
 * is rebuilt from owner-verified sources (see verified-claims.json and the
 * DR-NRPG launch-readiness spec). Only add a claim back here once it can be cited
 * to a first-source, owner-approved record.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Certifications & Standards | NRPG',
  description:
    'How NRPG verifies the disaster recovery contractors in its directory, and the restoration standards they work to.',
  robots: { index: false, follow: true },
};

export default function CertificationsPage() {
  return (
    <main className="bg-white text-gray-900 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Certifications &amp; Standards</h1>
          <p className="text-xl text-blue-100">
            How we verify the contractors in our directory, and the standards they work to.
          </p>
        </div>
      </section>

      {/* Verifiable facts only */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-10">
        <div className="flex items-start gap-4">
          <Shield className="h-8 w-8 text-blue-700 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl font-bold mb-2">NRPG verification</h2>
            <p className="text-gray-700">
              Before a contractor appears in our directory they are NRPG-verified: we review their
              IICRC certification and the credentials they provide (such as licence and insurance
              documentation). Contractors are required to hold their own current licensing and
              insurance. Contractors are independent businesses and are not employees or agents of
              NRPG.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <CheckCircle className="h-8 w-8 text-blue-700 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Restoration standards</h2>
            <p className="text-gray-700">
              Our contractors work to recognised industry standards for restoration, including water damage and
              mould remediation. We do not determine insurance claim
              outcomes; you deal directly with your own insurer.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <Link
            href="/contractors/directory"
            className="inline-block px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-colors"
          >
            Browse verified contractors →
          </Link>
        </div>
      </section>
    </main>
  );
}
