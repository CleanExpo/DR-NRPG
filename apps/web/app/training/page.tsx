/**
 * IICRC Training Hub
 *
 * Educational authority building through:
 * - Certification pathway guides
 * - Free study resources
 * - Course provider integration
 * - CE credit tracking
 * - Monthly webinars with IICRC instructors
 *
 * Strategic positioning: NRPG as IICRC's digital training partner in Australia
 */

import { Metadata } from 'next';
import { Award, BookOpen, Users, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import { VerifiedBadge, WaterDamage, FireSmoke, MouldRemediation, BioForensic } from '@/icons';

export const metadata: Metadata = {
  title: 'IICRC Training & Certifications | NRPG',
  description: 'Official IICRC certification pathways, study guides, and continuing education for Australian disaster recovery professionals',
};

export default function TrainingPage() {
  return (
    <main className="bg-white text-gray-900 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-8 h-8 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-sm">IICRC Certified Partner</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Professional Restoration Certifications
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Master IICRC standards. Advance your restoration career. Access exclusive training resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-6 py-3 bg-yellow-400 text-blue-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors">
              Explore Certifications
            </button>
            <button className="px-6 py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors border border-white">
              Join Webinar
            </button>
          </div>
        </div>
      </section>

      {/* Certification Pathways */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-black mb-4">IICRC Certification Pathways</h2>
        <p className="text-gray-400 mb-12 max-w-3xl">
          Choose your specialization. Each pathway includes prerequisites, study materials, exam preparation, and continuing education credits.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Water Damage */}
          <div className="border-2 border-blue-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <WaterDamage size="md" gradient="water" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold">Water Damage</h3>
            </div>
            <p className="text-gray-400 mb-6">
              RSD (Restoration Specialist – Drying), FSRT, and Advanced WRD certifications
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">48-hour response protocols</span>
              </div>
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Moisture detection & monitoring</span>
              </div>
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Drying techniques & equipment</span>
              </div>
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Insurance documentation</span>
              </div>
            </div>
            <div className="text-sm text-gray-400 mb-6">
              <strong>Study time:</strong> 30-40 hours | <strong>CE credits:</strong> 8
            </div>
            <button className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              View Path <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Fire & Smoke */}
          <div className="border-2 border-orange-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FireSmoke size="md" gradient="fire" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold">Fire & Smoke</h3>
            </div>
            <p className="text-gray-400 mb-6">
              FSRT (Fire & Smoke Restoration Tech) and Advanced FSRT certifications
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Smoke damage assessment</span>
              </div>
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Odour elimination</span>
              </div>
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Content restoration</span>
              </div>
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Structural assessment</span>
              </div>
            </div>
            <div className="text-sm text-gray-400 mb-6">
              <strong>Study time:</strong> 35-45 hours | <strong>CE credits:</strong> 10
            </div>
            <button className="w-full px-4 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
              View Path <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mould Remediation */}
          <div className="border-2 border-green-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MouldRemediation size="md" gradient="mould" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold">Mould Remediation</h3>
            </div>
            <p className="text-gray-400 mb-6">
              CMR (Certified Mould Remediator) and Advanced CMR certifications
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Mould identification & growth</span>
              </div>
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Containment strategies</span>
              </div>
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Air quality monitoring</span>
              </div>
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Health & safety protocols</span>
              </div>
            </div>
            <div className="text-sm text-gray-400 mb-6">
              <strong>Study time:</strong> 25-35 hours | <strong>CE credits:</strong> 7
            </div>
            <button className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
              View Path <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Biohazard */}
          <div className="border-2 border-red-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <BioForensic size="md" gradient="bio" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold">Biohazard Cleaning</h3>
            </div>
            <p className="text-gray-400 mb-6">
              CBCT (Certified Biohazard Cleanup Technician) certifications
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Bloodborne pathogen training</span>
              </div>
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">PPE & safety protocols</span>
              </div>
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Biohazard disposal</span>
              </div>
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Trauma cleanup regulations</span>
              </div>
            </div>
            <div className="text-sm text-gray-400 mb-6">
              <strong>Study time:</strong> 20-25 hours | <strong>CE credits:</strong> 5
            </div>
            <button className="w-full px-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
              View Path <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Forensic */}
          <div className="border-2 border-purple-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔬</span>
              </div>
              <h3 className="text-xl font-bold">Forensic Restoration</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Advanced certification for crime scene and trauma cleanup
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Crime scene protocol</span>
              </div>
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Evidence preservation</span>
              </div>
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Advanced decontamination</span>
              </div>
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Law enforcement coordination</span>
              </div>
            </div>
            <div className="text-sm text-gray-400 mb-6">
              <strong>Study time:</strong> 40-50 hours | <strong>CE credits:</strong> 12
            </div>
            <button className="w-full px-4 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
              View Path <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Master Restorer */}
          <div className="border-2 border-yellow-300 rounded-xl p-8 hover:shadow-lg transition-shadow bg-yellow-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
              <h3 className="text-xl font-bold">Master Restorer Track</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Elite certification combining multiple specialties
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Minimum 3 IICRC certifications</span>
              </div>
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">5+ years field experience</span>
              </div>
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Leadership certifications</span>
              </div>
              <div className="flex items-start gap-3">
                <VerifiedBadge size="sm" gradient="primary" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">Continuing education requirement</span>
              </div>
            </div>
            <div className="text-sm text-gray-400 mb-6">
              <strong>Requirements:</strong> See individual certifications + prerequisites
            </div>
            <button className="w-full px-4 py-3 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2">
              Apply Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Quick Resources */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black mb-4">Study Resources</h2>
          <p className="text-gray-400 mb-12">Free tools to accelerate your certification journey</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <BookOpen className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-bold mb-2">Study Guides</h3>
              <p className="text-sm text-gray-400 mb-4">
                Comprehensive PDFs covering exam topics with practice questions
              </p>
              <a href="#" className="text-blue-600 font-bold text-sm hover:underline">
                Download →
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Users className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-bold mb-2">Monthly Webinars</h3>
              <p className="text-sm text-gray-400 mb-4">
                Live sessions with IICRC instructors and industry experts
              </p>
              <a href="#" className="text-green-600 font-bold text-sm hover:underline">
                Register →
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Zap className="w-8 h-8 text-yellow-600 mb-3" />
              <h3 className="font-bold mb-2">Practice Exams</h3>
              <p className="text-sm text-gray-400 mb-4">
                Full-length mock exams simulating real testing conditions
              </p>
              <a href="#" className="text-yellow-600 font-bold text-sm hover:underline">
                Try Free →
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Award className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-bold mb-2">CE Credits</h3>
              <p className="text-sm text-gray-400 mb-4">
                Maintain certifications with approved continuing education
              </p>
              <a href="#" className="text-purple-600 font-bold text-sm hover:underline">
                Browse →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* NRPG Network Advantage */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="bg-blue-900 text-white rounded-xl p-12">
          <h2 className="text-3xl font-black mb-4">Why Train with NRPG?</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-4">For Contractors</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300 mt-0.5 flex-shrink-0" />
                  <span>Access to the NRPG network of verified professionals</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300 mt-0.5 flex-shrink-0" />
                  <span>Monthly training webinars with industry leaders</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300 mt-0.5 flex-shrink-0" />
                  <span>12 free CE credits annually for network members</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300 mt-0.5 flex-shrink-0" />
                  <span>Preferred insurance and referral partnerships</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">For Trainees</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300 mt-0.5 flex-shrink-0" />
                  <span>Structured certification pathways with mentorship</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300 mt-0.5 flex-shrink-0" />
                  <span>Job placement assistance after certification</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300 mt-0.5 flex-shrink-0" />
                  <span>Real-world case studies and field training</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300 mt-0.5 flex-shrink-0" />
                  <span>Structured exam preparation and study support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-4">Ready to Get Certified?</h2>
          <p className="text-gray-400 mb-8">
            Start your IICRC certification journey with Australia's leading restoration professionals network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
              Explore Certifications
            </button>
            <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors">
              Join Next Webinar
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-8">
            Questions? <a href="/contact" className="text-blue-600 font-bold hover:underline">
              Contact our training team
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
