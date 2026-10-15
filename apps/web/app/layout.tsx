import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AppProviders } from "@/components/providers/AppProviders"
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider"
import { ConvaiWidget } from "@/components/support/ConvaiWidget"
import { SITE_URL } from "@/lib/seo/site-url"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
  variable: "--font-jakarta",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Disaster Recovery Australia | 24/7 Emergency Restoration",
    template: "%s | Disaster Recovery Australia",
  },
  description: "24/7 emergency disaster recovery in major Australian cities. Connect with IICRC-certified restoration contractors for flood, fire, storm & water damage. Professional restoration standards.",
  keywords: [
    // Primary Australian keywords
    "disaster recovery australia",
    "emergency restoration australia",
    "flood restoration sydney",
    "fire damage restoration melbourne",
    "water damage restoration brisbane",
    "storm damage repair perth",
    "mould remediation adelaide",

    // Service-specific
    "24/7 emergency restoration",
    "verified restoration contractors",
    "IICRC certified restorers",
    "professional restoration",
    "water damage cleanup",
    "fire damage repair",
    "trauma cleanup australia",
    "biohazard restoration",

    // Local modifiers
    "same day restoration services",
    "emergency water extraction",
    "insurance approved contractors",
    "property disaster recovery",

    // Brand
    "NRPG",
    "National Restoration Professionals Group",
  ],
  authors: [
    { name: "NRPG Unite Group Australia", url: SITE_URL }
  ],
  creator: "NRPG Australia",
  publisher: "National Restoration Professionals Group",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "./",
    siteName: "NRPG - National Restoration Professionals Group",
    title: "NRPG | Australia's Emergency Restoration Network",
    description: "24/7 disaster recovery. IICRC-certified contractors. Flood, fire, storm & water damage restoration in major cities. Professional standards.",
    images: [
      {
        url: "/images/og-nrpg-main.jpg",
        width: 1200,
        height: 630,
        alt: "NRPG - National Emergency Restoration Network Australia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NRPG | Emergency Restoration Australia",
    description: "24/7 disaster recovery. Verified contractors. Flood, fire, storm damage restoration in major cities.",
    images: ["/images/twitter-nrpg.jpg"],
    creator: "@NRPGAustralia",
  },
  alternates: {
    // './' resolves against each rendered pathname, so every page that does not
    // set its own canonical gets a self-referencing one on SITE_URL.
    canonical: './',
  },
  verification: {
    google: "google-site-verification-code-here",
    other: {
      "msvalidate.01": "bing-verification-code-here",
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const baseUrl = SITE_URL;

  // Organization Schema with Social Media Profiles
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "National Restoration Professionals Group",
    "alternateName": "NRPG",
    "url": baseUrl,
    "logo": `${baseUrl}/images/nrpg-logo.png`,
    "description": "24/7 emergency disaster recovery in major Australian cities. Connect with IICRC-certified restoration contractors for flood, fire, storm & water damage.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AU"
    },
    "sameAs": [
      "https://www.linkedin.com/in/phill-mcgurk-drq/",
      "https://www.facebook.com/disasterrecoveryau",
      "https://www.youtube.com/channel/UCc9RuDsvlEXr8ymzIbQqRCQ",
      "https://creators.spotify.com/pod/show/2PtpuuiYKKlKa7fWI0IvaV/home"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Emergency Service",
      "areaServed": "AU",
      "availableLanguage": "English"
    }
  };

  // WebSite + SiteLinksSearchBox Schema (DIS-31)
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    "url": baseUrl,
    "name": "Disaster Recovery Australia \u2014 NRPG",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`font-sans ${jakarta.variable} ${spaceGrotesk.variable} antialiased`}>
        <AnalyticsProvider
          measurementId={process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || ''}
          gtmId={process.env.NEXT_PUBLIC_GTM_ID}
          debug={process.env.NODE_ENV === 'development'}
        >
          <AppProviders>
            {children}
            <Analytics />
            <ConvaiWidget />
          </AppProviders>
        </AnalyticsProvider>
      </body>
    </html>
  )
}
