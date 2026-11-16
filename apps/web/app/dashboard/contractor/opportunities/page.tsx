/**
 * NRPG Growth Portal - Opportunities Page
 *
 * Full partnership opportunities view with filtering and search.
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  ChevronDown,
  Building2,
  Flame,
  Droplets,
  Wind,
  Briefcase,
} from 'lucide-react';

interface Opportunity {
  id: string;
  type: string;
  category: 'water' | 'fire' | 'mould' | 'storm';
  priority: 'Elite' | 'Strategic' | 'New Market' | 'Standard';
  location: string;
  distance: string;
  potentialValue: string;
  deadline: string;
  description: string;
  requirements: string[];
}

const categoryIcons = {
  water: Droplets,
  fire: Flame,
  mould: Building2,
  storm: Wind,
};

const priorityColors: Record<string, string> = {
  Elite: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Strategic: 'bg-nrpg-teal/10 text-nrpg-teal border-nrpg-teal/30',
  'New Market': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Standard: 'bg-white/5 text-gray-400 border-white/10',
};

const sampleOpportunities: Opportunity[] = [
  {
    id: '1',
    type: 'Commercial Water Damage',
    category: 'water',
    priority: 'Elite',
    location: 'Sydney CBD, NSW',
    distance: '12 km away',
    potentialValue: '$45,000 - $65,000',
    deadline: '24 hours',
    description: 'Large commercial building with significant water damage from burst pipes. Requires immediate response and full restoration.',
    requirements: ['Current industry certification', 'Commercial experience', '24/7 availability'],
  },
  {
    id: '2',
    type: 'Residential Mould Remediation',
    category: 'mould',
    priority: 'Strategic',
    location: 'Parramatta, NSW',
    distance: '8 km away',
    potentialValue: '$12,000 - $18,000',
    deadline: '48 hours',
    description: 'Three-bedroom home with mould growth in bathroom and laundry areas. Full assessment and remediation required.',
    requirements: ['Mould certification', 'Residential experience'],
  },
  {
    id: '3',
    type: 'Fire & Smoke Restoration',
    category: 'fire',
    priority: 'New Market',
    location: 'Newcastle, NSW',
    distance: '95 km away',
    potentialValue: '$85,000 - $120,000',
    deadline: '72 hours',
    description: 'Office building fire damage. Complete smoke remediation and structural restoration needed.',
    requirements: ['Fire restoration certification', 'Large project experience', 'Team of 5+'],
  },
  {
    id: '4',
    type: 'Storm Damage Assessment',
    category: 'storm',
    priority: 'Standard',
    location: 'Wollongong, NSW',
    distance: '45 km away',
    potentialValue: '$8,000 - $15,000',
    deadline: '1 week',
    description: 'Residential property with storm damage to roof and facade. Assessment and repair required.',
    requirements: ['Storm damage experience', 'Roofing capability'],
  },
  {
    id: '5',
    type: 'Industrial Water Extraction',
    category: 'water',
    priority: 'Elite',
    location: 'Alexandria, NSW',
    distance: '15 km away',
    potentialValue: '$55,000 - $75,000',
    deadline: '12 hours',
    description: 'Warehouse flooding requiring immediate extraction and drying. 24/7 operation required.',
    requirements: ['Industrial equipment', '24/7 availability', 'Large drying capacity'],
  },
];

export default function OpportunitiesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [opportunities, setOpportunities] = useState<Opportunity[]>(sampleOpportunities);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || opp.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || opp.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nrpg-teal"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-portal-text font-heading">
            Partnership Opportunities
          </h1>
          <p className="text-portal-muted font-body mt-1">
            Browse and express interest in available projects
          </p>
        </div>
        <span className="px-4 py-2 bg-earth-primary/10 text-earth-primary text-sm font-bold font-heading rounded-full">
          {filteredOpportunities.length} Available
        </span>
      </div>

      {/* Filters */}
      <div className="bg-portal-card rounded-xl border border-portal-border p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-portal-muted" />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-portal-bg border border-portal-border rounded-lg text-portal-text placeholder:text-portal-muted focus:outline-none focus:ring-2 focus:ring-nrpg-teal/50 focus:border-nrpg-teal font-body"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-portal-bg border border-portal-border rounded-lg text-portal-text focus:outline-none focus:ring-2 focus:ring-nrpg-teal/50 focus:border-nrpg-teal font-body"
            >
              <option value="all">All Categories</option>
              <option value="water">Water Damage</option>
              <option value="fire">Fire & Smoke</option>
              <option value="mould">Mould Remediation</option>
              <option value="storm">Storm Damage</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-portal-muted pointer-events-none" />
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-portal-bg border border-portal-border rounded-lg text-portal-text focus:outline-none focus:ring-2 focus:ring-nrpg-teal/50 focus:border-nrpg-teal font-body"
            >
              <option value="all">All Priorities</option>
              <option value="Elite">Elite</option>
              <option value="Strategic">Strategic</option>
              <option value="New Market">New Market</option>
              <option value="Standard">Standard</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-portal-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpportunities.map((opp) => {
          const CategoryIcon = categoryIcons[opp.category];
          return (
            <div
              key={opp.id}
              className="bg-portal-card rounded-xl border border-portal-border p-6 shadow-sm hover:shadow-md hover:border-nrpg-teal/30 transition-[box-shadow,border-color] duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Main Content */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="size-12 bg-earth-light rounded-lg flex items-center justify-center flex-shrink-0">
                      <CategoryIcon className="size-6 text-earth-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-portal-text font-heading">
                          {opp.type}
                        </h3>
                        <span
                          className={cn(
                            'px-2 py-0.5 text-xs font-bold rounded border font-heading',
                            priorityColors[opp.priority]
                          )}
                        >
                          {opp.priority}
                        </span>
                      </div>
                      <p className="text-portal-muted font-body text-sm">
                        {opp.description}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1 text-portal-muted">
                      <MapPin className="size-4" />
                      <span>{opp.location}</span>
                      <span className="text-earth-secondary">({opp.distance})</span>
                    </div>
                    <div className="flex items-center gap-1 text-portal-muted">
                      <Clock className="size-4" />
                      <span>Response: {opp.deadline}</span>
                    </div>
                    <div className="flex items-center gap-1 text-portal-success font-bold">
                      <DollarSign className="size-4" />
                      <span>{opp.potentialValue}</span>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="flex flex-wrap gap-2">
                    {opp.requirements.map((req, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-portal-border/50 text-portal-muted text-xs rounded font-body"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <div className="flex-shrink-0">
                  <button className="w-full lg:w-auto px-6 py-2.5 bg-nrpg-teal hover:bg-nrpg-teal-dark text-white text-sm font-bold font-heading rounded-lg transition-colors shadow-sm hover:shadow-md">
                    Express Interest
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* DR-766: distinguish filter-empty from genuinely-empty */}
        {filteredOpportunities.length === 0 && (() => {
          const hasActiveFilters =
            searchQuery !== '' ||
            selectedCategory !== 'all' ||
            selectedPriority !== 'all';

          if (hasActiveFilters) {
            // Filters are on but no results — actionable: reset filters
            return (
              <div className="bg-portal-card rounded-xl border border-portal-border p-12 text-center">
                <Filter className="size-12 text-portal-muted mx-auto mb-4" />
                <h3 className="text-lg font-bold text-portal-text font-heading mb-2">
                  No matching opportunities
                </h3>
                <p className="text-portal-muted font-body mb-4">
                  Your current filters aren&apos;t matching any opportunities.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedPriority('all');
                  }}
                  className="px-4 py-2 bg-nrpg-teal text-white rounded-lg text-sm font-medium hover:bg-nrpg-teal/90 transition-colors"
                >
                  Reset filters
                </button>
              </div>
            );
          }

          // No filters active — contractor genuinely has no opportunities
          return (
            <div className="bg-portal-card rounded-xl border border-portal-border p-12 text-center">
              <Briefcase className="size-12 text-portal-muted mx-auto mb-4" />
              <h3 className="text-lg font-bold text-portal-text font-heading mb-2">
                No opportunities yet
              </h3>
              <p className="text-portal-muted font-body">
                Update your profile and service areas to start receiving matched opportunities.
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
