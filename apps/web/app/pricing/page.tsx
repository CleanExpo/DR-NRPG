/**
 * Pricing Transparency Page
 *
 * Build trust through complete pricing disclosure:
 * - $2,750 emergency service breakdown
 * - Additional services pricing
 * - Insurance billing explanation
 * - No hidden costs guarantee
 *
 * E.E.A.T Signal: Trustworthiness through transparency
 */

import { Metadata } from 'next';
import { Check, AlertCircle, Zap, DollarSign } from 'lucide-react';
import { CookieSettingsButton } from '@/components/analytics/CookieSettingsButton';

export const metadata: Metadata = {
  title: 'Pricing & Costs | NRPG Disaster Recovery',
  description: 'Complete transparent pricing for disaster recovery services. No hidden fees. IICRC-standard documentation for insurance claims.',
};

export default function PricingPage() {
  return (
    <main className="bg-white text-gray-900 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Transparent Pricing</h1>
          <p className="text-xl text-blue-100">
            No hidden costs. No surprises. Complete price breakdown for every service.
          </p>
        </div>
      </section>

      {/* Primary Service */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-black mb-4">Emergency Response Service</h2>
          <p className="text-gray-400 mb-8">Our most common service covering assessment and make-safe work</p>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-12 border-2 border-blue-200">
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-5xl font-black text-blue-600">$2,750</span>
              <span className="text-gray-400">Including GST</span>
            </div>

            <h3 className="text-2xl font-bold mb-6">What's Included:</h3>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Left Column */}
              <div>
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Immediate Response
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>24/7 emergency dispatch available</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Average 42-minute response time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>IICRC-certified contractor</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Professional uniform and vehicle</span>
                  </li>
                </ul>
              </div>

              {/* Right Column */}
              <div>
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Comprehensive Assessment
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Full damage assessment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Moisture & humidity testing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Written damage report</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Emergency mitigation advice</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t-2 border-blue-200 pt-8">
              <h4 className="font-bold text-lg mb-4">Make-Safe Work:</h4>
              <ul className="space-y-3 grid md:grid-cols-2 gap-6">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Water extraction (if applicable)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Emergency drying setup</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Structural stabilization</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Safety hazard mitigation</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Mould prevention (first 48 hours)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Professional documentation</span>
                </li>
              </ul>
            </div>

            <div className="border-t-2 border-blue-200 mt-8 pt-8">
              <h4 className="font-bold text-lg mb-4">Insurance & Documentation:</h4>
              <ul className="space-y-3 grid md:grid-cols-2 gap-6">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Insurance claim documentation</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Before/after photography</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Damage timeline report</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>All major insurers accepted</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* How Payment Works */}
        <div className="bg-blue-50 rounded-xl p-8 border-l-4 border-blue-600">
          <h3 className="text-2xl font-bold mb-6">How Payment Works</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-lg mb-3">Step 1 — Pay Disaster Recovery Australia</h4>
              <p className="text-gray-400 mb-4">
                The $2,750 emergency response and assessment fee is payable to Disaster Recovery Australia upon booking.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• All major credit cards (Visa, Mastercard, Amex) and bank transfer accepted</li>
                <li>• Tax invoice provided for your insurance submission</li>
              </ul>
            </div>
            <div className="border-t pt-6">
              <h4 className="font-bold text-lg mb-3">Step 2 — Pay Your Contractor</h4>
              <p className="text-gray-400 mb-4">
                Any additional restoration works are invoiced directly to you by your assigned contractor, as per their approved scope of works and estimates.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Contractor invoices you directly under their own ABN or NZBN</li>
                <li>• All invoices and IICRC-standard documentation provided for your insurer</li>
                <li>• Payment plans available for restoration work ($2,500+)</li>
              </ul>
            </div>
            <div className="border-t pt-6">
              <h4 className="font-bold text-lg mb-3">Step 3 — Submit to Your Insurer</h4>
              <p className="text-gray-400 mb-4">
                You submit the IICRC-standard scope of works, estimate, and invoices to your insurer. Whether and how much your policy covers is a matter between you and your insurer.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Full IICRC-standard documentation provided</li>
                <li>• Before/after photography and damage report included</li>
                <li>• All documentation meets Australian standards for insurance submission</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black mb-4">Additional Services & Costs</h2>
          <p className="text-gray-400 mb-12">
            All services priced individually. We quote before starting work.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Water Extraction */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h4 className="font-bold text-lg mb-2">Water Extraction & Drying</h4>
              <p className="text-sm text-gray-400 mb-4">Professional water removal and drying setup</p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Small area (&lt; 50m²):</span>
                  <span className="font-bold">$800–$1,500</span>
                </div>
                <div className="flex justify-between">
                  <span>Medium area (50–150m²):</span>
                  <span className="font-bold">$1,500–$3,500</span>
                </div>
                <div className="flex justify-between">
                  <span>Large area (&gt; 150m²):</span>
                  <span className="font-bold">Quote required</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">Daily rental for equipment if needed: $100–$300</p>
            </div>

            {/* Fire Restoration */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h4 className="font-bold text-lg mb-2">Fire & Smoke Restoration</h4>
              <p className="text-sm text-gray-400 mb-4">Smoke damage cleanup and restoration</p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Light smoke damage:</span>
                  <span className="font-bold">$2,000–$4,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Moderate smoke damage:</span>
                  <span className="font-bold">$4,000–$8,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Heavy smoke damage:</span>
                  <span className="font-bold">Quote required</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">Includes odour treatment and ventilation</p>
            </div>

            {/* Mould Remediation */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h4 className="font-bold text-lg mb-2">Mould Remediation</h4>
              <p className="text-sm text-gray-400 mb-4">Mould detection and professional removal</p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Small area (&lt; 1m²):</span>
                  <span className="font-bold">$500–$1,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Medium area (1–10m²):</span>
                  <span className="font-bold">$1,500–$3,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Large area (&gt; 10m²):</span>
                  <span className="font-bold">Quote required</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">Includes air quality testing</p>
            </div>

            {/* Content Restoration */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h4 className="font-bold text-lg mb-2">Content Restoration</h4>
              <p className="text-sm text-gray-400 mb-4">Furniture, belongings, and personal items</p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Minimal content:</span>
                  <span className="font-bold">$500–$1,500</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard content:</span>
                  <span className="font-bold">$2,000–$5,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Extensive content:</span>
                  <span className="font-bold">Quote required</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">Storage available at additional cost</p>
            </div>

            {/* Structural Assessment */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h4 className="font-bold text-lg mb-2">Structural Assessment</h4>
              <p className="text-sm text-gray-400 mb-4">Engineering evaluation for insurance</p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Standard assessment:</span>
                  <span className="font-bold">$1,200</span>
                </div>
                <div className="flex justify-between">
                  <span>Detailed report:</span>
                  <span className="font-bold">$1,800</span>
                </div>
                <div className="flex justify-between">
                  <span>Expert witness:</span>
                  <span className="font-bold">$250/hour</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">IICRC-certified inspector included</p>
            </div>

            {/* Cleaning & Decontamination */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h4 className="font-bold text-lg mb-2">Deep Cleaning & Decontamination</h4>
              <p className="text-sm text-gray-400 mb-4">Biohazard and contamination cleanup</p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Standard cleaning:</span>
                  <span className="font-bold">$1,500–$3,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Biohazard cleanup:</span>
                  <span className="font-bold">Quote required</span>
                </div>
                <div className="flex justify-between">
                  <span>Forensic decontamination:</span>
                  <span className="font-bold">Quote required</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">Includes disposal and certification</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-black mb-12">Pricing Frequently Asked Questions</h2>

        <div className="space-y-6">
          <div className="border-b pb-6">
            <h3 className="font-bold text-lg mb-2">What if my insurance doesn't cover the full cost?</h3>
            <p className="text-gray-400">
              We provide a professional IICRC-standard scope of works and estimate that you submit to your insurer. Whether your policy covers the full cost is between you and your insurer — if it doesn't, we can arrange a payment plan for any outstanding balance.
            </p>
          </div>

          <div className="border-b pb-6">
            <h3 className="font-bold text-lg mb-2">Is the $2,750 the final cost?</h3>
            <p className="text-gray-400">
              The $2,750 covers the emergency response and assessment. Additional restoration work (water extraction, drying, repairs) is quoted separately based on damage severity. We always provide a written quote before starting any work beyond the emergency service.
            </p>
          </div>

          <div className="border-b pb-6">
            <h3 className="font-bold text-lg mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-400">
              We accept all major credit cards (Visa, Mastercard, American Express) and bank transfer. Payment plans are available for restoration work exceeding $2,500.
            </p>
          </div>

          <div className="border-b pb-6">
            <h3 className="font-bold text-lg mb-2">Will my insurance cover everything?</h3>
            <p className="text-gray-400">
              That depends on your specific policy and coverage type. NRPG provides a thorough IICRC-standard inspection report, scope of works, and cost estimate — professional documentation prepared to Australian standards that you present to your insurer. Whether and how much your policy covers is determined by you and your insurer.
            </p>
          </div>

          <div className="border-b pb-6">
            <h3 className="font-bold text-lg mb-2">How are complex restoration projects priced?</h3>
            <p className="text-gray-400">
              We provide detailed written quotes before starting any work. Quotes include materials, labour, equipment rental, and timeline. Most quotes are provided within 24 hours of initial assessment.
            </p>
          </div>

          <div className="pb-6">
            <h3 className="font-bold text-lg mb-2">Is there a discount for direct payment?</h3>
            <p className="text-gray-400">
              Yes. We offer 10% discount for immediate full payment on non-insurance claims. We also offer interest-free payment plans for work exceeding $2,500 if you prefer to spread costs.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-4">Ready for Professional Help?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Need damage assessment? Contact us for 24/7 emergency service.
          </p>
          <button className="px-8 py-4 bg-yellow-400 text-blue-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors text-lg">
            Request Service
          </button>
        </div>
      </section>

      {/* This page has no site footer, so the cookie control sits here. */}
      <div className="py-4 px-6 text-center">
        <CookieSettingsButton className="text-sm text-gray-600 underline hover:text-gray-900 transition-colors focus-visible:ring-blue-700 focus-visible:ring-offset-white" />
      </div>
    </main>
  );
}
