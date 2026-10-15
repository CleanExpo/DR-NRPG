import { SITE_URL } from "@/lib/seo/site-url"
import Header from "@/components/header"
import Footer from "@/components/footer"
import {
  Search,
  Book,
  MessageCircle,
  FileText,
  Users,
  Shield,
  CheckCircle,
  AlertTriangle,
  Zap,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center | NRPG — Disaster Recovery Australia',
  description: 'Answers to common questions about lodging a disaster recovery claim, payments, contractor matching, IICRC documentation, and the NRPG platform.',
  alternates: {
    canonical: `${SITE_URL}/help-center`,
  },
}

export default function HelpCenterPage() {
  const faqs = [
    {
      question: "How do I submit a restoration request?",
      answer:
        "Simply fill out our online form with details about your damage, and we'll match you with qualified contractors in your area within 24 hours.",
    },
    {
      question: "How are contractors vetted?",
      answer:
        "Contractors are NRPG-verified before they appear in the directory: we review their IICRC certification and the credentials they provide (such as licence and insurance documentation). Contractors are required to hold their own current licensing and insurance.",
    },
    {
      question: "What types of restoration services are available?",
      answer:
        "We cover water damage, fire damage, mould remediation, storm damage, and emergency restoration services across Australia.",
    },
    {
      question: "How does pricing work?",
      answer:
        "You'll receive transparent, competitive quotes from multiple contractors. Our platform ensures fair pricing with no hidden fees.",
    },
    {
      question: "Is there emergency support available?",
      answer:
        "Yes, we offer 24/7 emergency support for urgent restoration needs. Complete the intake form for immediate assistance.",
    },
  ]

  const guides = [
    { title: "Getting Started Guide", icon: Book, description: "Learn how to use our platform effectively" },
    {
      title: "Contractor Selection Tips",
      icon: FileText,
      description: "How to choose the right contractor for your project",
    },
    { title: "Insurance Claims Help", icon: MessageCircle, description: "Navigate insurance claims with confidence" },
    { title: "Emergency Response", icon: AlertTriangle, description: "What to do in restoration emergencies" },
  ]

  const serviceCategories = [
    {
      title: "Water Damage",
      icon: AlertTriangle,
      description: "Burst pipes, flooding, leaks",
      services: ["Water extraction", "Structural drying", "Mould prevention", "Damage assessment"],
    },
    {
      title: "Fire Damage",
      icon: Zap,
      description: "Fire, smoke, and soot damage",
      services: ["Smoke removal", "Soot cleaning", "Structural repair", "Odor elimination"],
    },
    {
      title: "Storm Damage",
      icon: Shield,
      description: "Wind, hail, and weather damage",
      services: ["Roof repair", "Window replacement", "Debris removal", "Structural assessment"],
    },
    {
      title: "Mould Remediation",
      icon: Users,
      description: "Mould inspection and removal",
      services: ["Mould testing", "Safe removal", "Air purification", "Prevention strategies"],
    },
  ]

  const platformFeatures = [
    {
      title: "Smart Matching",
      description:
        "Our AI algorithm matches you with the most suitable contractors based on your specific needs, location, and project requirements.",
    },
    {
      title: "Real-time Tracking",
      description:
        "Monitor your project progress with live updates, photo documentation, and milestone notifications throughout the restoration process.",
    },
    {
      title: "Quality Assurance",
      description:
        "Every project includes quality checkpoints, customer feedback integration, and our commitment to helping ensure quality results.",
    },
    {
      title: "IICRC Documentation",
      description:
        "Every job produces IICRC-standard documentation — scope of works, moisture logs, photographic evidence — accepted by all major Australian insurers for your insurance submission.",
    },
  ]

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <Header />
      <main className="py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="font-poppins font-bold text-4xl md:text-5xl text-balance mb-6">
              Help <span className="gradient-text-teal-purple">Center</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8">Find answers, guides, and support resources</p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] h-5 w-5" />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-4 bg-[#1F2937] border border-[#374151] rounded-xl text-[#F9FAFB] placeholder-[#9CA3AF] focus:outline-none focus:border-[#00BFA6]"
              />
            </div>
          </div>

          {/* Quick Help Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {guides.map((guide, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer"
              >
                <guide.icon className="h-8 w-8 text-[#00BFA6] mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-2">{guide.title}</h3>
                <p className="text-[#9CA3AF] text-sm">{guide.description}</p>
              </div>
            ))}
          </div>

          <div className="mb-16">
            <h2 className="font-poppins font-bold text-3xl text-center mb-12">
              Service <span className="gradient-text-teal-purple">Categories</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {serviceCategories.map((category, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]"
                >
                  <div className="flex items-center mb-4">
                    <category.icon className="h-8 w-8 text-[#00BFA6] mr-4" />
                    <div>
                      <h3 className="font-poppins font-semibold text-xl text-white">{category.title}</h3>
                      <p className="text-[#9CA3AF] text-sm">{category.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {category.services.map((service, serviceIndex) => (
                      <div key={serviceIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-[#00BFA6] mr-3 flex-shrink-0" />
                        <span className="text-[#9CA3AF]">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h2 className="font-poppins font-bold text-3xl text-center mb-12">
              Platform <span className="gradient-text-teal-purple">Features</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {platformFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]"
                >
                  <h3 className="font-poppins font-semibold text-lg text-white mb-3">{feature.title}</h3>
                  <p className="text-[#9CA3AF] leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="font-poppins font-bold text-3xl text-center mb-12">
              Frequently Asked <span className="gradient-text-teal-purple">Questions</span>
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]"
                >
                  <h3 className="font-poppins font-semibold text-lg text-white mb-3">{faq.question}</h3>
                  <p className="text-[#9CA3AF] leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151] text-center">
            <h3 className="font-poppins font-bold text-2xl text-white mb-4">Still Need Help?</h3>
            <p className="text-[#9CA3AF] mb-6">Our support team is ready to assist you. Submit a request via the contact form and we&apos;ll respond within 24 hours.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold">
                <Link href="/contact">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] bg-transparent">
                <Link href="/claim">
                  <FileText className="h-4 w-4 mr-2" />
                  Lodge a Claim
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
