import React from 'react'
import { Shield, Clock, FileText, Award } from 'lucide-react'

export default function SocialProofSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-transparent to-[#1a1d29]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#F9FAFB] mb-4">
            What You Can <span className="gradient-text-teal-purple">Expect</span>
          </h2>
          <p className="text-xl text-[#9CA3AF] max-w-3xl mx-auto">
            Our platform is designed to connect you with IICRC-certified restoration professionals quickly and efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-[#0F1115] to-[#1a1d29] p-8 rounded-2xl border border-[#374151]/50 hover:border-[#00BFA6]/50 transition-[border-color,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] card-hover-lift glow-effect">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00BFA6] to-[#3B82F6] rounded-full flex items-center justify-center mb-6">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-lg font-bold text-[#F9FAFB] mb-4">IICRC-Certified Contractors</h4>
            <p className="text-[#9CA3AF] leading-relaxed">
              All contractors on our platform are screened for IICRC certifications, insurance, and licensing to ensure you receive professional restoration services that meet industry standards.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#0F1115] to-[#1a1d29] p-8 rounded-2xl border border-[#374151]/50 hover:border-[#7C4DFF]/50 transition-[border-color,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] card-hover-lift glow-effect">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7C4DFF] to-[#8B5CF6] rounded-full flex items-center justify-center mb-6">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-lg font-bold text-[#F9FAFB] mb-4">Rapid Response</h4>
            <p className="text-[#9CA3AF] leading-relaxed">
              We aim to connect you with qualified contractors quickly. Our platform operates 24/7 to help you get emergency restoration services when you need them most.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#0F1115] to-[#1a1d29] p-8 rounded-2xl border border-[#374151]/50 hover:border-[#3B82F6]/50 transition-[border-color,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] card-hover-lift glow-effect">
            <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#00BFA6] rounded-full flex items-center justify-center mb-6">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-lg font-bold text-[#F9FAFB] mb-4">Comprehensive Documentation</h4>
            <p className="text-[#9CA3AF] leading-relaxed">
              Contractors provide detailed documentation throughout the restoration process, helping streamline insurance claims and ensuring transparency at every step.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-8 bg-gradient-to-br from-[#0F1115] to-[#1a1d29] p-6 rounded-2xl border border-[#374151]/50">
            <div className="text-center">
              <Shield className="h-8 w-8 text-[#00BFA6] mx-auto mb-2" />
              <div className="text-sm font-medium text-[#9CA3AF]">IICRC Standards</div>
              <div className="text-xs text-[#6B7280]">FSRT, WRT</div>
            </div>
            <div className="w-px h-12 bg-[#374151]"></div>
            <div className="text-center">
              <Clock className="h-8 w-8 text-[#7C4DFF] mx-auto mb-2" />
              <div className="text-sm font-medium text-[#9CA3AF]">24/7 Platform</div>
              <div className="text-xs text-[#6B7280]">Emergency Access</div>
            </div>
            <div className="w-px h-12 bg-[#374151]"></div>
            <div className="text-center">
              <Award className="h-8 w-8 text-[#3B82F6] mx-auto mb-2" />
              <div className="text-sm font-medium text-[#9CA3AF]">Verified Professionals</div>
              <div className="text-xs text-[#6B7280]">Licensed & Insured</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
