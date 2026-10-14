import { SITE_URL } from "@/lib/seo/site-url"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Mail, Phone, Clock, MessageCircle, FileText, Users, Shield, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support | NRPG — Disaster Recovery Australia',
  description: 'Get help with your NRPG claim, contractor matching, billing, or platform questions. Submit a support request via our online contact form.',
  alternates: {
    canonical: `${SITE_URL}/support`,
  },
}

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <Header />
      <main className="py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Section 1: Hero & Contact Methods */}
          <div className="text-center mb-16">
            <h1 className="font-poppins font-bold text-4xl md:text-5xl text-balance mb-8">
              Customer <span className="gradient-text-teal-purple">Support</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-12 max-w-3xl mx-auto">
              We're here to help you with any questions or issues you may have. Our dedicated support team is ready to
              assist you 24/7.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-4">
                <Phone className="h-8 w-8 text-[#00BFA6] mr-3" />
                <h3 className="font-poppins font-semibold text-xl text-white">Request Service</h3>
              </div>
              <p className="text-[#9CA3AF] mb-4">Complete our intake form for support</p>
              <p className="text-[#00BFA6] font-semibold text-lg">Complete the intake form</p>
              <p className="text-[#9CA3AF] text-sm">Response within 24 hours</p>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-4">
                <Mail className="h-8 w-8 text-[#2196F3] mr-3" />
                <h3 className="font-poppins font-semibold text-xl text-white">Contact Form</h3>
              </div>
              <p className="text-[#9CA3AF] mb-4">Send us a detailed message via our secure online form</p>
              <Link href="/contact" className="inline-flex items-center gap-1 text-[#2196F3] font-semibold hover:underline">
                Submit a request <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-[#9CA3AF] text-sm mt-2">Response within 24 hours</p>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-4">
                <MessageCircle className="h-8 w-8 text-[#7C4DFF] mr-3" />
                <h3 className="font-poppins font-semibold text-xl text-white">Live Chat</h3>
              </div>
              <p className="text-[#9CA3AF] mb-4">Instant support via chat</p>
              <button className="bg-[#7C4DFF] hover:bg-[#6C3CE7] text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                Start Chat
              </button>
              <p className="text-[#9CA3AF] text-sm mt-2">Available 24/7</p>
            </div>
          </div>

          {/* Section 2: Support Categories */}
          <div className="mb-16">
            <h2 className="font-poppins font-bold text-3xl text-center mb-12">
              Support <span className="gradient-text-teal-purple">Categories</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-xl p-6 border border-[#374151] text-center">
                <FileText className="h-12 w-12 text-[#00BFA6] mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">Account Issues</h3>
                <p className="text-[#9CA3AF] text-sm">Login problems, password resets, account settings</p>
              </div>
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-xl p-6 border border-[#374151] text-center">
                <Users className="h-12 w-12 text-[#2196F3] mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">Project Support</h3>
                <p className="text-[#9CA3AF] text-sm">Project management, contractor matching, progress tracking</p>
              </div>
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-xl p-6 border border-[#374151] text-center">
                <Shield className="h-12 w-12 text-[#7C4DFF] mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">Billing & Payments</h3>
                <p className="text-[#9CA3AF] text-sm">Invoice questions, payment issues, refund requests</p>
              </div>
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-xl p-6 border border-[#374151] text-center">
                <MessageCircle className="h-12 w-12 text-[#00BFA6] mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">Technical Issues</h3>
                <p className="text-[#9CA3AF] text-sm">Platform bugs, mobile app problems, connectivity issues</p>
              </div>
            </div>
          </div>

          {/* Section 3: Support Hours & Emergency */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex items-center mb-6">
                <Clock className="h-8 w-8 text-[#7C4DFF] mr-3" />
                <h3 className="font-poppins font-semibold text-2xl text-white">Support Hours</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Business Hours</h4>
                  <p className="text-[#9CA3AF]">Monday - Friday: 8:00 AM - 6:00 PM AEST</p>
                  <p className="text-[#9CA3AF]">Saturday: 9:00 AM - 2:00 PM AEST</p>
                  <p className="text-[#9CA3AF]">Sunday: Closed</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Response Times</h4>
                  <p className="text-[#9CA3AF]">Contact form: Within 24 hours</p>
                  <p className="text-[#9CA3AF]">Chat: Within 5 minutes</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#DC2626] to-[#991B1B] rounded-2xl p-8 border border-[#DC2626]">
              <div className="flex items-center mb-6">
                <Phone className="h-8 w-8 text-white mr-3" />
                <h3 className="font-poppins font-semibold text-2xl text-white">Emergency Support</h3>
              </div>
              <p className="text-white/90 mb-4">
                24/7 emergency response available for urgent restoration needs and critical system issues.
              </p>
              <p className="text-white font-bold text-lg mb-2">Request Emergency Service</p>
              <p className="text-white/80 text-sm">
                For water damage, fire damage, or other restoration emergencies requiring immediate attention.
              </p>
            </div>
          </div>

          {/* Section 4: Self-Service Resources */}
          <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
            <h2 className="font-poppins font-bold text-3xl text-center mb-8">
              Self-Service <span className="gradient-text-teal-purple">Resources</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-[#00BFA6]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-[#00BFA6]" />
                </div>
                <h3 className="font-semibold text-white mb-2">Knowledge Base</h3>
                <p className="text-[#9CA3AF] text-sm mb-4">Comprehensive guides and tutorials</p>
                <a href="/help-center" className="text-[#00BFA6] hover:text-[#00A693] font-semibold">
                  Browse Articles →
                </a>
              </div>
              <div className="text-center">
                <div className="bg-[#2196F3]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-[#2196F3]" />
                </div>
                <h3 className="font-semibold text-white mb-2">Community Forum</h3>
                <p className="text-[#9CA3AF] text-sm mb-4">Connect with other users and experts</p>
                <a href="#" className="text-[#2196F3] hover:text-[#1976D2] font-semibold">
                  Join Discussion →
                </a>
              </div>
              <div className="text-center">
                <div className="bg-[#7C4DFF]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-[#7C4DFF]" />
                </div>
                <h3 className="font-semibold text-white mb-2">Video Tutorials</h3>
                <p className="text-[#9CA3AF] text-sm mb-4">Step-by-step video guides</p>
                <a href="#" className="text-[#7C4DFF] hover:text-[#6C3CE7] font-semibold">
                  Watch Videos →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
