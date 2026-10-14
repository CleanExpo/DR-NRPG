import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get a Free Quote | Disaster Recovery Australia',
  description:
    'Request a free quote for disaster recovery services. Water damage, fire damage, storm damage, mould remediation and more. Available 24/7 across Australia.',
  alternates: {
    canonical: 'https://nrpg.business/claim/step-1',
  },
}

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function QuotePage(props: Props) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') {
      params.set(key, value)
    }
  }
  const query = params.toString()
  redirect(`/claim/step-1${query ? `?${query}` : ''}`)
}
