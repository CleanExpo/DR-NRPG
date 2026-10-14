import { SITE_URL } from '@/lib/seo/site-url'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How NRPG Works | Disaster Recovery Contractor Platform',
  description: 'See exactly how NRPG connects IICRC-certified contractors with pre-qualified disaster recovery leads. Flat $550 fee per claim, no monthly fees, no commission.',
  alternates: {
    canonical: `${SITE_URL}/how-it-works`,
  },
  openGraph: {
    title: 'How NRPG Works — Step by Step',
    description: 'From disaster report to completed job: how NRPG matches IICRC-certified contractors with verified leads. $550 flat fee, no commission.',
    url: `${SITE_URL}/how-it-works`,
    siteName: 'NRPG — Disaster Recovery Australia',
    type: 'website',
    locale: 'en_AU',
  },
}

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
