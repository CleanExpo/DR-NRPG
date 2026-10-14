import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join the NRPG Contractor Network | Disaster Recovery Australia',
  description: 'Scale your restoration business with pre-qualified leads through NRPG — Australia and New Zealand\'s certified disaster recovery contractor network. Flat fee per claim, no commission.',
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: 'Join the NRPG Contractor Network',
    description: 'Pre-qualified restoration leads for IICRC-certified contractors across Australia and New Zealand. Flat fee per claim, no monthly fees, no commission.',
    url: 'https://disasterrecovery.com.au/contractors',
    siteName: 'NRPG — Disaster Recovery Australia',
    type: 'website',
    locale: 'en_AU',
  },
}

export default function ContractorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
