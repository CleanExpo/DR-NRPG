'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { CookieSettingsButton } from '@/components/analytics/CookieSettingsButton'
import {
  Mail,
  MapPin,
  Clock,
  Facebook,
  Youtube,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react'

interface FooterLink {
  label: string
  href: string
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

const companyLinks: FooterLink[] = [
  { label: 'About Us', href: '/about' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Contractor Credentials', href: '/certifications' },
  { label: 'Blog & Resources', href: '/resources' },
  { label: 'Contact Us', href: '/contact' }
]

const serviceLinks: FooterLink[] = [
  { label: 'Water Damage', href: '/services/water-damage' },
  { label: 'Fire & Smoke Damage', href: '/services/fire-smoke-damage' },
  { label: 'Storm Damage', href: '/services/storm-damage' },
  { label: 'Mould Remediation', href: '/services/mould-remediation' },
  { label: 'Biohazard Cleanup', href: '/services/biohazard-cleanup' },
  { label: 'All Services', href: '/services' }
]

const locationLinks: FooterLink[] = [
  { label: 'Sydney', href: '/locations/nsw/sydney' },
  { label: 'Melbourne', href: '/locations/vic/melbourne' },
  { label: 'Brisbane', href: '/locations/qld/brisbane' },
  { label: 'Perth', href: '/locations/wa/perth' },
  { label: 'Adelaide', href: '/locations/sa/adelaide' },
  { label: 'Gold Coast', href: '/locations/qld/gold-coast' }
]

const supportLinks: FooterLink[] = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'Support', href: '/support' },
  { label: 'Find a Contractor', href: '/contractors/directory' },
  { label: 'Training', href: '/training' },
  { label: 'Submit a Claim', href: '/claim/step-1' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
  { label: 'Disclaimer', href: '/disclaimer' }
]

const legalLinks: FooterLink[] = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
]

export function PublicFooter() {
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubscribing(true)

    // Simulate newsletter subscription
    setTimeout(() => {
      setSubscribeStatus('success')
      setIsSubscribing(false)
      setEmail('')

      // Reset status after 3 seconds
      setTimeout(() => setSubscribeStatus('idle'), 3000)
    }, 1000)
  }

  return (
    <footer aria-label="Site footer" className="bg-gradient-to-br from-emerald-900 via-slate-900 to-gray-900 text-white">
      {/* Emergency Banner */}
      <div className="bg-red-600 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <span className="font-bold text-lg">24/7 Emergency Response Available</span>
            </div>
            <a
              href="/claim/step-1?emergency=true"
              className="flex items-center gap-2 px-6 py-2 bg-white text-red-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              <AlertCircle className="w-5 h-5" />
              Submit Emergency Claim
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Company Info & Newsletter */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">DR</span>
              </div>
              <div>
                <div className="font-bold text-white text-lg leading-tight">
                  Disaster Recovery
                </div>
                <div className="text-sm text-emerald-400 font-medium">
                  Australia
                </div>
              </div>
            </Link>

            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Australia's trusted disaster recovery network. Connecting property owners with certified restoration professionals for rapid response and quality repairs.
            </p>

            {/* Trust Signals */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300">Credentialled Professionals</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300">Insurance Approved Network</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300">24/7 Emergency Response</span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <h3 className="text-white font-semibold text-sm mb-3">Stay Informed</h3>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
              {subscribeStatus === 'success' && (
                <p className="text-emerald-400 text-sm mt-2">Thanks for subscribing!</p>
              )}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-emerald-400 text-sm transition-colors inline-flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Services</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-emerald-400 text-sm transition-colors inline-flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Locations</h3>
            <ul className="space-y-2">
              {locationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-emerald-400 text-sm transition-colors inline-flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2 mb-6">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-emerald-400 text-sm transition-colors inline-flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="/claim/step-1"
                className="flex items-start gap-2 text-gray-300 hover:text-emerald-400 text-sm transition-colors group"
              >
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:text-emerald-400" />
                <span>Submit a Claim</span>
              </a>
              <div className="flex items-start gap-2 text-gray-300 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Australia-wide service</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Trust Badges */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm font-medium">Follow us:</span>
              <a
                href="https://www.facebook.com/disasterrecoveryau"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/@NRPG-verified"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Subscribe on YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mb-1">
                  <Shield className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-xs text-gray-400">Qualified<br />Contractors</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mb-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-xs text-gray-400">Insurance<br />Approved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            {legalLinks.map((link) => (
              <React.Fragment key={link.href}>
                <Link
                  href={link.href}
                  className="text-gray-400 hover:text-emerald-400 text-xs transition-colors"
                >
                  {link.label}
                </Link>
                <span className="text-gray-400" aria-hidden="true">|</span>
              </React.Fragment>
            ))}
            <CookieSettingsButton className="text-gray-400 hover:text-emerald-400 text-xs transition-colors focus-visible:ring-emerald-400" />
          </div>

          {/* Legal Entity Notice */}
          <div className="text-center space-y-1 mb-4">
            <p className="text-slate-400 text-xs">
              Disaster Recovery Pty Ltd | ABN: 85 151 794 142 | ACN: 151 794 142
            </p>
            <p className="text-slate-400 text-xs">
              Trading as: Disaster Recovery &middot; NRPG &middot; Restore Assist
            </p>
          </div>

          {/* Bottom Bar */}
          <div className="text-center text-gray-400 text-xs space-y-2">
            <p>
              &copy; {new Date().getFullYear()} Disaster Recovery Australia. All rights reserved.
            </p>
            <p className="text-gray-400">
              Powered by <Link href="/about" className="text-emerald-400 hover:text-emerald-300 transition-colors">National Recovery Platform Group (NRPG)</Link>
            </p>
            <p className="text-gray-400 max-w-4xl mx-auto leading-relaxed pt-2">
              Disaster Recovery Australia is a platform that connects property owners with independent restoration contractors.
              We facilitate the matching process only and do not directly provide restoration services.
              All work is performed by independent, licensed contractors in the NRPG network.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
