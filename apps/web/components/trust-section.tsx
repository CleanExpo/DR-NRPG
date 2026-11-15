import React from 'react'

export default function TrustSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-transparent to-[#1a1d29]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#F9FAFB] mb-4">
            Built on <span className="gradient-text-teal-purple">Trust</span>
          </h2>
          <p className="text-xl text-[#9CA3AF] max-w-3xl mx-auto">
            Our platform connects property owners with professional restoration contractors
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#00BFA6] mb-2">6+</div>
            <div className="text-[#9CA3AF]">Industry Standards</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#7C4DFF] mb-2">100%</div>
            <div className="text-[#9CA3AF]">Screened Contractors</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#3B82F6] mb-2">24/7</div>
            <div className="text-[#9CA3AF]">Platform Access</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#F59E0B] mb-2">8</div>
            <div className="text-[#9CA3AF]">States & Territories</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-[#0F1115] to-[#1a1d29] p-8 rounded-2xl border border-[#374151]/50 hover:border-[#00BFA6]/50 transition-[border-color,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] card-hover-lift glow-effect">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00BFA6] to-[#3B82F6] rounded-xl mb-6 flex items-center justify-center">
              <span className="text-white text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-[#F9FAFB] mb-4">Secure Platform</h3>
            <p className="text-[#9CA3AF]">
              Your data is protected with industry-standard encryption. We prioritize your privacy and data security.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#0F1115] to-[#1a1d29] p-8 rounded-2xl border border-[#374151]/50 hover:border-[#7C4DFF]/50 transition-[border-color,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] card-hover-lift glow-effect">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7C4DFF] to-[#8B5CF6] rounded-xl mb-6 flex items-center justify-center">
              <span className="text-white text-2xl">⭐</span>
            </div>
            <h3 className="text-xl font-bold text-[#F9FAFB] mb-4">Quality Focused</h3>
            <p className="text-[#9CA3AF]">
              Contractors are screened for IICRC certifications, insurance, and licensing to help ensure professional service quality.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#0F1115] to-[#1a1d29] p-8 rounded-2xl border border-[#374151]/50 hover:border-[#3B82F6]/50 transition-[border-color,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] card-hover-lift glow-effect">
            <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#00BFA6] rounded-xl mb-6 flex items-center justify-center">
              <span className="text-white text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-bold text-[#F9FAFB] mb-4">Emergency Ready</h3>
            <p className="text-[#9CA3AF]">
              Our platform operates 24/7 to help connect you with restoration professionals when emergencies strike.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
