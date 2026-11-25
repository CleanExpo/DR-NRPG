import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import { AppProviders } from "@/components/providers/AppProviders"
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider"
import { ConvaiWidget } from "@/components/support/ConvaiWidget"
import { SITE_URL } from "@/lib/seo/site-url"
import "./globals.css"

// DR-1008: the fonts are served from app/fonts (latin subset, SIL OFL 1.1, from
// Fontsource) instead of next/font/google, so the build no longer downloads them from
// Google. A bad Google response failed the build check on 18/11/2026.
const jakarta = localFont({
  src: [
    { path: "./fonts/plus-jakarta-sans-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-jakarta",
  display: "swap",
})

const spaceGrotesk = localFont({
  src: [
    { path: "./fonts/space-grotesk-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/space-grotesk-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-space-grotesk",
  display: "swap",
})

const SITE_TITLE = "NRPG | National Restoration Professionals Group"
const SITE_DESCRIPTION =
  "The restoration industry network for Australia and New Zealand, connecting corporate clients, agencies and property managers with verified restoration professionals."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | NRPG",
  },
  description: SITE_DESCRIPTION,
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
    "professional restoration",
    "water damage cleanup",
    "fire damage repair",
    "trauma cleanup australia",
    "biohazard restoration",

    // Local modifiers
    "same day restoration services",
    "emergency water extraction",
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
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/images/twitter-nrpg.jpg"],
    creator: "@NRPGAustralia",
  },
  alternates: {
    // './' resolves against each rendered pathname, so every page that does not
    // set its own canonical gets a self-referencing one on SITE_URL.
    canonical: './',
  },
  // Google verifies nrpg.business through the DNS domain property, so no meta tag is needed.
  verification: {
    other: {
      "msvalidate.01": "DB030D197A83DF2F524BF0DFBACDC52C",
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
    "description": "The network and services group for the restoration industry across Australia and New Zealand, connecting corporate clients, agencies and property managers with restoration professionals.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AU"
    },
    // Only profiles NRPG itself owns: no personal or sister-brand accounts.
    "sameAs": [
      "https://www.youtube.com/@NRPG-verified"
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
    "name": "NRPG \u2014 National Restoration Professionals Group",
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
    <html lang="en-AU" className="light" suppressHydrationWarning>
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
