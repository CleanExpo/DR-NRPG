import { SITE_URL } from '@/lib/seo/site-url'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Your Account | NRPG — Disaster Recovery Australia',
  description: 'Sign up to access the NRPG platform. Property owners lodge claims, contractors register to receive pre-qualified disaster recovery leads.',
  alternates: {
    canonical: `${SITE_URL}/signup`,
  },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
