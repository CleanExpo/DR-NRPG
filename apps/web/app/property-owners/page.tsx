import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Shield, Clock, DollarSign, Users, CheckCircle, Star, ArrowRight, Phone, Zap, BarChart3, Smartphone, Globe, Lock } from "lucide-react"

export default function PropertyOwnersPage() {
  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <Header />
      <main className="py-24">
        {/* Hero Section */}
        <section className="container mx-auto px-6 text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#00BFA6]/10 border border-[#00BFA6]/20 text-[#00BFA6] text-sm font-medium mb-6">
            <Globe className="w-4 h-4 mr-2" />
            Australia's Advanced Restoration Marketplace Platform
          </div>
          <h1 className="font-poppins font-bold text-4xl md:text-5xl text-balance mb-6">
            Smart Restoration <span className="gradient-text-teal-purple">Marketplace Platform</span>
          </h1>
          <p className="text-xl text-[#9CA3AF] max-w-3xl mx-auto mb-8">
            Connect with qualified restoration contractors through our marketplace platform. Get matched with verified professionals, receive transparent quotes, and access restoration services across Australia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
              Start Your Project
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] px-8 py-3 text-lg bg-transparent"
            >
              Request Service
            </Button>
          </div>
        </section>

        {/* Platform Features Section */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Platform Features for Property Owners
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151] hover:border-[#00BFA6] transition-colors">
              <Zap className="h-12 w-12 text-[#00BFA6] mb-4" />
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Smart Contractor Matching</h3>
              <p className="text-[#9CA3AF]">Our smart algorithm matches you with the most suitable contractors based on your specific needs and location.</p>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151] hover:border-[#2196F3] transition-colors">
              <BarChart3 className="h-12 w-12 text-[#2196F3] mb-4" />
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Real-Time Tracking</h3>
              <p className="text-[#9CA3AF]">Monitor your project progress with live updates, photos, and milestone tracking through our platform dashboard.</p>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151] hover:border-[#7C4DFF] transition-colors">
              <DollarSign className="h-12 w-12 text-[#7C4DFF] mb-4" />
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Transparent Pricing</h3>
              <p className="text-[#9CA3AF]">Compare detailed quotes with standardized pricing across all contractors, ensuring you get the best value.</p>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151] hover:border-[#00BFA6] transition-colors">
              <Shield className="h-12 w-12 text-[#00BFA6] mb-4" />
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Verified & Insured</h3>
              <p className="text-[#9CA3AF]">All contractors are thoroughly vetted, licensed, insured, and background checked for your peace of mind.</p>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151] hover:border-[#2196F3] transition-colors">
              <Smartphone className="h-12 w-12 text-[#2196F3] mb-4" />
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Mobile-First Platform</h3>
              <p className="text-[#9CA3AF]">Access your projects, communicate with contractors, and track progress from anywhere with our mobile app.</p>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151] hover:border-[#7C4DFF] transition-colors">
              <Lock className="h-12 w-12 text-[#7C4DFF] mb-4" />
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Secure Payments</h3>
              <p className="text-[#9CA3AF]">Safe and secure payment processing with escrow protection until your project is completed to your satisfaction.</p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            Why Property Owners Choose Our Platform
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <Shield className="h-12 w-12 text-[#00BFA6] mx-auto mb-4" />
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Quality Assurance</h3>
              <p className="text-[#9CA3AF] text-sm">All work is monitored through our platform quality assurance process</p>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <Clock className="h-12 w-12 text-[#2196F3] mx-auto mb-4" />
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Fast Response</h3>
              <p className="text-[#9CA3AF] text-sm">Get connected with qualified contractors within 24 hours of your request</p>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <DollarSign className="h-12 w-12 text-[#FFD700] mx-auto mb-4" />
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Cost Savings</h3>
              <p className="text-[#9CA3AF] text-sm">Save up to 38% on restoration costs with our competitive marketplace pricing</p>
            </div>

            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <Users className="h-12 w-12 text-[#00BFA6] mx-auto mb-4" />
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Dedicated Support</h3>
              <p className="text-[#9CA3AF] text-sm">24/7 platform support team to guide you through every step of your project</p>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">Platform Workflow</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00BFA6] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#0F1115] font-bold text-xl">1</span>
              </div>
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Submit Request</h3>
              <p className="text-[#9CA3AF]">Describe your restoration needs through our platform and upload photos for accurate assessment</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#2196F3] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Smart Matching</h3>
              <p className="text-[#9CA3AF]">Our AI algorithm matches you with the most suitable verified contractors in your area</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#7C4DFF] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Compare & Choose</h3>
              <p className="text-[#9CA3AF]">Review transparent quotes, contractor profiles, and ratings to make an informed decision</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#0F1115] font-bold text-xl">4</span>
              </div>
              <h3 className="font-poppins font-semibold text-xl text-white mb-3">Track & Complete</h3>
              <p className="text-[#9CA3AF]">Monitor progress in real-time through our platform dashboard and mobile app</p>
            </div>
          </div>
        </section>

        {/* Platform Benefits Section */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">Platform Benefits</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-[#00BFA6] mx-auto mb-4" />
              <h3 className="font-semibold text-xl text-white mb-3">Quality Assurance</h3>
              <p className="text-[#9CA3AF]">All work is monitored through our platform's quality assurance process and tracked in our system</p>
            </div>

            <div className="text-center">
              <Star className="h-12 w-12 text-[#FFD700] mx-auto mb-4" />
              <h3 className="font-semibold text-xl text-white mb-3">Customer Focus</h3>
              <p className="text-[#9CA3AF]">We work to connect you with contractors committed to delivering quality restoration services</p>
            </div>

            <div className="text-center">
              <Shield className="h-12 w-12 text-[#2196F3] mx-auto mb-4" />
              <h3 className="font-semibold text-xl text-white mb-3">Secure Platform</h3>
              <p className="text-[#9CA3AF]">Your data and payments are protected with enterprise-grade security and encryption</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-[#00BFA6]/10 to-[#7C4DFF]/10 rounded-2xl p-12 text-center border border-[#00BFA6]/20">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-white mb-6">
              Ready to Experience the Future of Restoration?
            </h2>
            <p className="text-xl text-[#9CA3AF] mb-8 max-w-2xl mx-auto">
              Get started today and experience transparent, efficient, and quality restoration services through our marketplace platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                Start Your Project Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] px-8 py-3 text-lg bg-transparent"
              >
                Learn More About Our Platform
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
