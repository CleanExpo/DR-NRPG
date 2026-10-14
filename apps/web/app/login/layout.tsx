import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | NRPG — Disaster Recovery Australia',
  description: 'Sign in to your NRPG account to manage jobs, track leads, and access your contractor dashboard.',
  alternates: {
    canonical: 'https://nrpg.business/login',
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
