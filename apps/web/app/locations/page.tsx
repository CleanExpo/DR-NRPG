import { SITE_URL } from "@/lib/seo/site-url"
import Link from "next/link"
import { MapPin } from "lucide-react"
import type { Metadata } from 'next'
import Header from "@/components/header"
import Footer from "@/components/footer"
import citiesData from "@/data/australian-cities.json"

export const metadata: Metadata = {
  title: 'Service Areas | Disaster Recovery Australia',
  description: 'Disaster recovery and restoration service areas across Australia — every city we cover in NSW, VIC, QLD, WA, SA, ACT, TAS and NT.',
  alternates: {
    canonical: `${SITE_URL}/locations`,
  },
  openGraph: {
    title: 'Service Areas | Disaster Recovery Australia',
    description: 'Every city covered by our disaster recovery and restoration network across Australia.',
    url: `${SITE_URL}/locations`,
    type: 'website',
  },
}

interface City {
  city: string
  stateCode: string
  slug: string
}

// Display order for the state groupings
const STATE_ORDER = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT']

const STATE_NAMES: Record<string, string> = {
  NSW: 'New South Wales',
  VIC: 'Victoria',
  QLD: 'Queensland',
  WA: 'Western Australia',
  SA: 'South Australia',
  ACT: 'Australian Capital Territory',
  TAS: 'Tasmania',
  NT: 'Northern Territory',
}

export default function LocationsPage() {
  const cities = citiesData.cities as City[]

  const byState = STATE_ORDER
    .map((code) => ({
      code,
      name: STATE_NAMES[code] ?? code,
      cities: cities.filter((c) => c.stateCode === code),
    }))
    .filter((group) => group.cities.length > 0)

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <Header />
      <main className="py-24">
        <section className="container mx-auto px-6 text-center mb-16">
          <h1 className="font-poppins font-bold text-4xl md:text-5xl text-balance mb-6">
            Our <span className="text-[#00BFA6]">Service Areas</span>
          </h1>
          <p className="text-xl text-[#9CA3AF] max-w-3xl mx-auto">
            Restoration coverage across {cities.length} cities in every Australian state and territory.
            Choose your city to see the services available near you.
          </p>
        </section>

        <section className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {byState.map((group) => (
              <div
                key={group.code}
                className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151]"
              >
                <h2 className="font-poppins font-semibold text-xl text-white mb-4">
                  {group.name}
                </h2>
                <ul className="space-y-2">
                  {group.cities.map((city) => (
                    <li key={city.slug}>
                      <Link
                        href={`/${city.slug}`}
                        className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#00BFA6] transition-colors"
                      >
                        <MapPin className="w-4 h-4 shrink-0" />
                        {city.city}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
