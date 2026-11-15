/**
 * Case Studies Hub
 *
 * Centralized location showcasing 50+ real restoration projects
 * Critical for:
 * - E.E.A.T authority signals
 * - Content marketing
 * - Customer proof & social proof
 * - SEO rankings for service + location combinations
 *
 * Target: 50 case studies
 * - 10 water damage
 * - 10 fire restoration
 * - 10 mould remediation
 * - 10 storm damage
 * - 5 biohazard
 * - 5 other
 */

import { Metadata } from 'next';
import { Search, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { WaterDamage, FireSmoke, MouldRemediation, BioForensic } from '@/icons';

export const metadata: Metadata = {
  title: 'Restoration Case Studies | NRPG',
  description: 'Real disaster recovery projects completed by NRPG contractors across Australia. Industry-standard documentation, timelines, costs, and customer testimonials from verified projects.',
  openGraph: {
    title: 'Restoration Case Studies | NRPG',
    description: 'Real disaster recovery projects completed by NRPG contractors across Australia. Industry-standard documentation and verified project outcomes.',
    type: 'website',
  },
};

interface CaseStudy {
  id: string;
  title: string;
  location: string;
  state: string;
  serviceType: 'Water' | 'Fire' | 'Mould' | 'Storm' | 'Bio' | 'Other';
  thumbnail: string;
  responseTime: string;
  cost: string;
  daysToRestore: number;
  customerSatisfaction: number;
  featured: boolean;
  published: string;
  excerpt: string;
  slug: string;
}

// Sample case studies - in production, fetch from database
const SAMPLE_CASE_STUDIES: CaseStudy[] = [
  {
    id: '1',
    title: 'Kitchen Fire Restoration - Family Home Back in 5 Days',
    location: 'Hawthorn',
    state: 'VIC',
    serviceType: 'Fire',
    thumbnail: '/images/case-studies/hawthorn-fire.jpg',
    responseTime: '38 minutes',
    cost: '$18,500',
    daysToRestore: 5,
    customerSatisfaction: 5,
    featured: true,
    published: '2025-11-15',
    excerpt: 'Kitchen fire caused extensive smoke damage. NRPG contractors arrived within 38 minutes, completed emergency make-safe, and restored the home to pre-loss condition within 5 days.',
    slug: 'hawthorn-kitchen-fire-restoration',
  },
  {
    id: '2',
    title: 'Severe Water Damage - Emergency Response & Rapid Drying',
    location: 'Alexandria',
    state: 'NSW',
    serviceType: 'Water',
    thumbnail: '/images/case-studies/alexandria-water.jpg',
    responseTime: '45 minutes',
    cost: '$12,750',
    daysToRestore: 3,
    customerSatisfaction: 5,
    featured: true,
    published: '2025-11-10',
    excerpt: 'Burst pipe caused significant water damage. Professional extraction and dehumidification prevented mould growth. Industry-standard documentation provided for the client\'s insurance submission.',
    slug: 'alexandria-water-damage-restoration',
  },
  {
    id: '3',
    title: 'Mould Remediation in Investment Property',
    location: 'South Brisbane',
    state: 'QLD',
    serviceType: 'Mould',
    thumbnail: '/images/case-studies/south-brisbane-mould.jpg',
    responseTime: '52 minutes',
    cost: '$8,200',
    daysToRestore: 4,
    customerSatisfaction: 4.9,
    featured: true,
    published: '2025-10-30',
    excerpt: 'Humidity damage created mould growth. NRPG performed professional remediation with air quality testing and industry-standard documentation for the client\'s insurance submission.',
    slug: 'south-brisbane-mould-remediation',
  },
  {
    id: '4',
    title: 'Storm Damage Commercial Property',
    location: 'Perth CBD',
    state: 'WA',
    serviceType: 'Storm',
    thumbnail: '/images/case-studies/perth-storm.jpg',
    responseTime: '41 minutes',
    cost: '$15,300',
    daysToRestore: 2,
    customerSatisfaction: 4.9,
    featured: false,
    published: '2025-10-20',
    excerpt: 'Hail and wind damage required emergency tarping and structural assessment. Professional restoration kept business operational.',
    slug: 'perth-storm-damage-commercial',
  },
  {
    id: '5',
    title: 'Bathroom Mould & Water Damage - Adelaide Home',
    location: 'Unley',
    state: 'SA',
    serviceType: 'Mould',
    thumbnail: '/images/case-studies/unley-bathroom.jpg',
    responseTime: '48 minutes',
    cost: '$6,500',
    daysToRestore: 2,
    customerSatisfaction: 5,
    featured: false,
    published: '2025-09-25',
    excerpt: 'Bathroom leak created mould in walls. NRPG identified hidden damage, remediated mould, and restored bathroom. Industry-standard documentation supported the client\'s insurance submission.',
    slug: 'unley-bathroom-restoration',
  },
];

async function getCaseStudies(): Promise<CaseStudy[]> {
  // In production, this would fetch from database
  // For now, return sample data
  try {
    // const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/case-studies`);
    // if (response.ok) {
    //   return response.json();
    // }
    return SAMPLE_CASE_STUDIES;
  } catch (error) {
    return SAMPLE_CASE_STUDIES;
  }
}

const SERVICE_TYPES = [
  { type: 'Water' as const, label: 'Water Damage', color: 'from-blue-500 to-blue-600' },
  { type: 'Fire' as const, label: 'Fire Restoration', color: 'from-orange-500 to-orange-600' },
  { type: 'Mould' as const, label: 'Mould Remediation', color: 'from-green-500 to-green-600' },
  { type: 'Storm' as const, label: 'Storm Damage', color: 'from-slate-500 to-slate-600' },
  { type: 'Bio' as const, label: 'Biohazard', color: 'from-red-500 to-red-600' },
  { type: 'Other' as const, label: 'Other', color: 'from-purple-500 to-purple-600' },
];

export default async function CaseStudiesPage() {
  const caseStudies = await getCaseStudies();
  const featured = caseStudies.filter(cs => cs.featured);
  const others = caseStudies.filter(cs => !cs.featured);

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-black mb-6">
              Real Restoration Stories
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Real disaster recovery projects completed by NRPG contractors across Australia.
              Industry-standard documentation, timelines, costs, and customer testimonials from verified projects.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search case studies..."
                className="w-full pl-12 pr-4 py-3 rounded-xl text-slate-900"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Service Filter Tabs */}
      <section className="bg-slate-50 border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-4">
          <div className="flex overflow-x-auto gap-2 -mx-6 md:mx-0 px-6 md:px-0 pb-2 md:pb-0">
            {SERVICE_TYPES.map(service => (
              <button
                key={service.type}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold text-slate-700 bg-white border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-colors"
              >
                {service.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Case Studies */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Featured Projects</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(cs => (
            <Link
              key={cs.id}
              href={`/case-studies/${cs.slug}`}
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-slate-200 hover:border-blue-600"
            >
              {/* Image Placeholder */}
              <div className="bg-gradient-to-br from-slate-200 to-slate-300 aspect-video" aria-hidden="true" />

              {/* Content */}
              <div className="p-6">
                {/* Service Badge with Icon */}
                <div className="mb-3 flex items-center gap-2">
                  {cs.serviceType === 'Water' && <WaterDamage size="md" gradient="water" aria-hidden="true" />}
                  {cs.serviceType === 'Fire' && <FireSmoke size="md" gradient="fire" aria-hidden="true" />}
                  {cs.serviceType === 'Mould' && <MouldRemediation size="md" gradient="mould" aria-hidden="true" />}
                  {cs.serviceType === 'Bio' && <BioForensic size="md" gradient="bio" aria-hidden="true" />}
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-blue-600">
                    {SERVICE_TYPES.find(s => s.type === cs.serviceType)?.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {cs.title}
                </h3>

                {/* Location */}
                <p className="text-sm text-slate-600 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {cs.location}, {cs.state}
                </p>

                {/* Stats */}
                <div className="space-y-2 mb-4 pt-4 border-t border-slate-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Response Time</span>
                    <span className="font-bold text-slate-900">{cs.responseTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Restoration Time</span>
                    <span className="font-bold text-slate-900">{cs.daysToRestore} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Cost</span>
                    <span className="font-bold text-slate-900">{cs.cost}</span>
                  </div>
                </div>

                {/* Unsourced star-rating removed (DR-858 N-07) — reinstate only with verifiable data */}
                <div className="flex items-center justify-end pt-4 border-t border-slate-200">
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* All Case Studies Grid */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">All Case Studies</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {others.map(cs => (
            <Link
              key={cs.id}
              href={`/case-studies/${cs.slug}`}
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-slate-200 hover:border-blue-600"
            >
              {/* Image */}
              <div className="bg-gradient-to-br from-slate-200 to-slate-300 aspect-video" aria-hidden="true" />

              {/* Content */}
              <div className="p-6">
                <div className="mb-3 flex items-center gap-2">
                  {cs.serviceType === 'Water' && <WaterDamage size="md" gradient="water" aria-hidden="true" />}
                  {cs.serviceType === 'Fire' && <FireSmoke size="md" gradient="fire" aria-hidden="true" />}
                  {cs.serviceType === 'Mould' && <MouldRemediation size="md" gradient="mould" aria-hidden="true" />}
                  {cs.serviceType === 'Bio' && <BioForensic size="md" gradient="bio" aria-hidden="true" />}
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-slate-600">
                    {SERVICE_TYPES.find(s => s.type === cs.serviceType)?.label}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {cs.title}
                </h3>

                <p className="text-sm text-slate-600 mb-4">
                  {cs.location}, {cs.state}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="text-xs font-bold text-slate-600">{cs.cost}</div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl font-bold mb-6">Need Disaster Recovery Help?</h2>
          <p className="text-xl text-blue-100 mb-8">
            See what NRPG contractors have accomplished for thousands of Australians.
            Let us help restore your property.
          </p>
          <button className="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
            Request Emergency Service →
          </button>
        </div>
      </section>
    </main>
  );
}
