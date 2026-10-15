'use client'

import React from 'react'
import Link from 'next/link'
import {
  Mail,
  Users,
  Award,
  TrendingUp,
  Clock,
  FileText,
  MessageSquare,
  Calendar,
  Building2,
  CheckCircle2
} from 'lucide-react'

export function ContractorFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-slate-50 border-t border-blue-900/30">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 mb-12">
          {/* Network */}
          <div>
            <h3 className="text-teal-400 font-semibold text-lg mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Network
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contractor/about"
                  className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  About NRPG
                </Link>
              </li>
              <li>
                <Link
                  href="/contractor/standards"
                  className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contractor Standards
                </Link>
              </li>
              <li>
                <Link
                  href="/contractor/certification"
                  className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Certification Levels
                </Link>
              </li>
              <li>
                <Link
                  href="/contractor/achievements"
                  className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Achievements Program
                </Link>
              </li>
              <li>
                <Link
                  href="/contractor/success-stories"
                  className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Opportunities */}
          <div>
            <h3 className="text-blue-400 font-semibold text-lg mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Opportunities
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contractor/join"
                  className="text-slate-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  How to Join
                </Link>
              </li>
              <li>
                <Link
                  href="/contractor/jobs"
                  className="text-slate-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Available Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/contractor/training"
                  className="text-slate-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Training Programs
                </Link>
              </li>
              <li>
                <Link
                  href="/contractor/upgrade"
                  className="text-slate-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Upgrade Certification
                </Link>
              </li>
              <li>
                <Link
                  href="/contractor/benefits"
                  className="text-slate-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Member Benefits
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-teal-400 font-semibold text-lg mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contractor/help"
                  className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Help Centre
                </Link>
              </li>
              <li>
                <Link
                  href="/contractor/support"
                  className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Technical Support
                </Link>
              </li>
              <li>
                <Link
                  href="/contractor/faq"
                  className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contractor FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contractor/contact"
                  className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contractor/feedback"
                  className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Submit Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-blue-400 font-semibold text-lg mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contractor/compliance"
                  className="text-slate-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Compliance Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/contractor/safety"
                  className="text-slate-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Safety Guidelines
                </Link>
              </li>
              <li>
                <Link
                  href="/contractor/insurance"
                  className="text-slate-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Insurance Requirements
                </Link>
              </li>
              <li>
                <Link
                  href="/contractor/documentation"
                  className="text-slate-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/contractor/templates"
                  className="text-slate-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Forms & Templates
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-teal-400 font-semibold text-lg mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Community
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contractor/forum"
                  className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contractor Forum
                </Link>
              </li>
              <li>
                <Link
                  href="/contractor/events"
                  className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Events & Webinars
                </Link>
              </li>
              <li>
                <Link
                  href="/contractors/directory"
                  className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Member Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/contractor/partnerships"
                  className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Partner Network
                </Link>
              </li>
              <li>
                <Link
                  href="/contractor/news"
                  className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Industry News
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-blue-900/30 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="bg-teal-500/20 rounded-lg p-3">
                <Mail className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200 mb-1">Contractor Support</div>
                <Link
                  href="/contact"
                  className="text-teal-400 hover:text-teal-300 transition-colors duration-200"
                >
                  Contact support
                </Link>
                <div className="text-xs text-slate-400 mt-1">24/7 Support</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-blue-500/20 rounded-lg p-3">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200 mb-1">Email Support</div>
                <Link
                  href="/contact"
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  Contact the contractor team
                </Link>
                <div className="text-xs text-slate-400 mt-1">Response within 2 hours</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-teal-500/20 rounded-lg p-3">
                <Clock className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200 mb-1">Business Hours</div>
                <div className="text-slate-300 text-sm">Mon-Fri: 8:00 AM - 6:00 PM AEST</div>
                <div className="text-xs text-slate-400 mt-1">After-hours support available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="border-t border-blue-900/30 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <Award className="h-5 w-5 text-blue-400" />
              <span>Master Builders Association</span>
            </div>
            <div className="h-4 w-px bg-blue-900/30" />
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <CheckCircle2 className="h-5 w-5 text-teal-400" />
              <span>Certified Trade Network</span>
            </div>
            <div className="h-4 w-px bg-blue-900/30" />
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <Building2 className="h-5 w-5 text-blue-400" />
              <span>Australian Business Member</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-blue-900/30 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-slate-400">
              &copy; {currentYear} National Restoration Partner Group. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link
                href="/contractor/privacy"
                className="text-slate-400 hover:text-teal-400 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/contractor/terms"
                className="text-slate-400 hover:text-teal-400 transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link
                href="/contractor/contractor-agreement"
                className="text-slate-400 hover:text-teal-400 transition-colors duration-200"
              >
                Contractor Agreement
              </Link>
              <Link
                href="/contractor/code-of-conduct"
                className="text-slate-400 hover:text-teal-400 transition-colors duration-200"
              >
                Code of Conduct
              </Link>
            </div>
          </div>

          {/* Legal Entity Notice */}
          <div className="mt-4 text-center space-y-1">
            <p className="text-slate-400 text-xs">
              National Restoration Partners Guild (NRPG) | A division of Disaster Recovery Pty Ltd
            </p>
            <p className="text-slate-400 text-xs">
              ABN: 85 151 794 142 | Brisbane, Queensland 4076 | support@nrpg.com.au
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
