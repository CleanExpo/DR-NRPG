import type { Metadata } from "next"
import { SITE_URL } from "@/lib/seo/site-url"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Shield, CheckCircle, Award, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import PublicContractorSearch from "@/components/contractor/public-contractor-search"

const BASE_URL = SITE_URL;

export const metadata: Metadata = {
  title: "Find a Certified Contractor | Disaster Recovery Australia",
  description:
    "Search verified disaster recovery contractors across Australia. IICRC certified professionals for water damage, fire damage, mould remediation and more. Find help near you.",
  keywords: [
    "find contractor",
    "disaster recovery contractor",
    "restoration professional",
    "water damage contractor",
    "fire damage contractor",
    "mould remediation",
    "IICRC certified",
    "Australia",
  ],
  alternates: {
    canonical: `${BASE_URL}/contractors/directory`,
  },
  openGraph: {
    title: "Find a Certified Contractor | NRPG Australia",
    description:
      "Search verified disaster recovery contractors across Australia. IICRC certified professionals. Find help near you.",
    url: `${BASE_URL}/contractors/directory`,
    siteName: "NRPG - Disaster Recovery Australia",
    type: "website",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find a Certified Contractor | NRPG Australia",
    description:
      "Search verified disaster recovery contractors across Australia. IICRC certified professionals. Find help near you.",
  },
}

export default function ContractorDirectoryPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Find a Certified Contractor",
      description: metadata.description,
      url: `${BASE_URL}/contractors/directory`,
      isPartOf: {
        "@type": "WebSite",
        name: "NRPG - Disaster Recovery Australia",
        url: BASE_URL,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Contractors",
          item: `${BASE_URL}/contractors`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Directory",
          item: `${BASE_URL}/contractors/directory`,
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="py-24">
        {/* Hero Section */}
        <section className="container mx-auto px-6 mb-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              NRPG Verified Network
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              Find a Certified{" "}
              <span className="text-[#00BFA6]">Contractor</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8 max-w-2xl mx-auto">
              Search our network of disaster recovery professionals across
              Australia. Every contractor in this directory is NRPG-verified and
              holds current IICRC certification.
            </p>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="container mx-auto px-6 mb-12">
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 bg-[#1F2937]/50 rounded-xl p-4 border border-[#374151]">
              <Shield className="h-8 w-8 text-[#00BFA6] flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-[#F9FAFB]">
                  NRPG Verified
                </div>
                <div className="text-xs text-[#6B7280]">
                  Credentials reviewed
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#1F2937]/50 rounded-xl p-4 border border-[#374151]">
              <Award className="h-8 w-8 text-[#2196F3] flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-[#F9FAFB]">
                  IICRC Certified
                </div>
                <div className="text-xs text-[#6B7280]">
                  Industry standard
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#1F2937]/50 rounded-xl p-4 border border-[#374151]">
              <CheckCircle className="h-8 w-8 text-[#7C4DFF] flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-[#F9FAFB]">
                  Insurance Required
                </div>
                <div className="text-xs text-[#6B7280]">Contractors hold their own cover</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#1F2937]/50 rounded-xl p-4 border border-[#374151]">
              <Users className="h-8 w-8 text-[#FFD700] flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-[#F9FAFB]">
                  All States
                </div>
                <div className="text-xs text-[#6B7280]">
                  Australia-wide
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Interface */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-6xl mx-auto">
            <PublicContractorSearch />
          </div>
        </section>

        {/* Contractor CTA */}
        <section className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-[#00BFA6] to-[#2196F3] rounded-2xl p-12 text-center">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-white mb-4">
              Are You a Contractor?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-lg mx-auto">
              Join the NRPG network. Get pre-qualified leads, fair rotation,
              and transparent pricing.
            </p>
            <Link href="/contractors">
              <Button className="bg-white hover:bg-white/90 text-[#0F1115] font-bold text-lg px-10 py-4">
                Join Our Network
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
