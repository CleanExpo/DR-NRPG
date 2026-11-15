import React from 'react'
import Link from 'next/link'
import { CookieSettingsButton } from '@/components/analytics/CookieSettingsButton'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-[#0F1115] to-transparent py-16 border-t border-[#374151]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00BFA6] to-[#7C4DFF] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">DR</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F9FAFB]">Disaster Recovery</h3>
                <p className="text-sm text-[#9CA3AF]">NRPG Platform</p>
              </div>
            </div>
            <p className="text-[#9CA3AF] text-sm leading-relaxed">
              Connecting disaster recovery professionals with clients who need help, fast.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-[#F9FAFB] mb-4">For Clients</h4>
            <ul className="space-y-2">
              <li><Link href="/services" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">Request Service</Link></li>
              <li><Link href="/contractors/directory" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">Find a Contractor</Link></li>
              <li><Link href="/claim/step-1" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">Submit a Claim</Link></li>
              <li><Link href="/how-it-works" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#F9FAFB] mb-4">For Contractors</h4>
            <ul className="space-y-2">
              <li><Link href="/contractors" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">Join Our Network</Link></li>
              <li><Link href="/certifications" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">IICRC Certification</Link></li>
              <li><Link href="/training" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">Training</Link></li>
              <li><Link href="/resources" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">Resources</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#F9FAFB] mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">Contact</Link></li>
              <li><Link href="/resources" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">Blog</Link></li>
              <li><Link href="/support" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">Support</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Social Media Links */}
        <div className="border-t border-[#374151]/50 pt-8 pb-6">
          <div className="flex justify-center gap-6 mb-6">
            <Link
              href="https://www.linkedin.com/in/phill-mcgurk-drq/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-[#1F2937] hover:bg-[#0077B5] rounded-lg flex items-center justify-center transition-colors group"
              aria-label="Follow us on LinkedIn"
            >
              <svg className="w-5 h-5 text-[#9CA3AF] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </Link>

            <Link
              href="https://www.facebook.com/disasterrecoveryau"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-[#1F2937] hover:bg-[#1877F2] rounded-lg flex items-center justify-center transition-colors group"
              aria-label="Follow us on Facebook"
            >
              <svg className="w-5 h-5 text-[#9CA3AF] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </Link>

            <Link
              href="https://www.youtube.com/channel/UCc9RuDsvlEXr8ymzIbQqRCQ"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-[#1F2937] hover:bg-[#FF0000] rounded-lg flex items-center justify-center transition-colors group"
              aria-label="Subscribe on YouTube"
            >
              <svg className="w-5 h-5 text-[#9CA3AF] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </Link>

            <Link
              href="https://creators.spotify.com/pod/show/2PtpuuiYKKlKa7fWI0IvaV/home"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-[#1F2937] hover:bg-[#1DB954] rounded-lg flex items-center justify-center transition-colors group"
              aria-label="Listen on Spotify"
            >
              <svg className="w-5 h-5 text-[#9CA3AF] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </Link>
          </div>
        </div>

        <div className="border-t border-[#374151]/50 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-[#9CA3AF] text-sm">
            © 2025 Disaster Recovery NRPG Platform. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 mt-4 md:mt-0">
            <Link href="/privacy" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors text-sm">
              Terms of Service
            </Link>
            <Link href="/cookie-policy" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors text-sm">
              Cookie Policy
            </Link>
            <CookieSettingsButton className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors text-sm" />
            <Link href="/disclaimer" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors text-sm">
              Disclaimer
            </Link>
            <Link href="/contact" className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors text-sm">
              Support
            </Link>
          </div>
        </div>

        {/* Legal Entity Notice */}
        <div className="mt-6 text-center space-y-1">
          <p className="text-[#9CA3AF] text-xs">
            Disaster Recovery Pty Ltd | ABN: 85 151 794 142 | ACN: 151 794 142
          </p>
          <p className="text-[#9CA3AF] text-xs">
            Australia-wide · AI-automated online platform
          </p>
          <p className="text-[#9CA3AF] text-xs">
            Trading as: Disaster Recovery &middot; NRPG &middot; Restore Assist
          </p>
        </div>
      </div>
    </footer>
  )
}
