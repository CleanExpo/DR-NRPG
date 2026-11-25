import { SITE_URL } from '@/lib/seo/site-url'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join the NRPG Contractor Network | Disaster Recovery Australia',
  description: 'Scale your restoration business with pre-qualified leads through NRPG — Australia and New Zealand\'s certified disaster recovery contractor network. 20% platform fee per claim.',
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: 'Join the NRPG Contractor Network',
    description: 'Pre-qualified restoration leads for qualified contractors across Australia and New Zealand. 20% platform fee per claim, no monthly fees.',
    url: `${SITE_URL}/contractors`,
    siteName: 'NRPG — Disaster Recovery Australia',
    type: 'website',
    locale: 'en_AU',
  },
}

export default function ContractorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
