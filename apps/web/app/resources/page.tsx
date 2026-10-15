/**
 * Resources Hub Main Page
 *
 * Features:
 * - Hero section with search
 * - Featured resource carousel
 * - Category grid
 * - Recent resources
 * - Newsletter signup
 * - Filter and search functionality (prepared for Algolia)
 */

import * as React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  BookOpen,
  TrendingUp,
  Clock,
  Filter,
  ArrowRight,
  Cloud,
  AlertTriangle
} from 'lucide-react';
import { WaterDamage, FireSmoke, MouldRemediation, BioForensic } from '@/icons';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { FeaturedResourceCarousel } from '@/components/resources/FeaturedResourceCarousel';
import { NewsletterSignup } from '@/components/resources/NewsletterSignup';
import {
  RESOURCE_CATEGORIES,
  SAMPLE_RESOURCES,
  getFeaturedResources,
  getTrendingResources,
  getRecentResources,
} from '@/lib/resources/data';
import { DisasterCategory, ContentType } from '@/lib/resources/types';
import { getMargotResourceListing, margotResourcePath } from '@/lib/resources/margot';
import { resourceCanonical } from '@/lib/resources/canonical';

// Publication changes must be checked on each request, including an unconfigured CMS.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Resource Hub | Disaster Recovery Education & Guides',
  description: 'Comprehensive disaster recovery resources including articles, guides, videos, and tools for water damage, fire restoration, mould remediation, and more.',
  alternates: { canonical: resourceCanonical() },
  openGraph: {
    title: 'Resource Hub | Disaster Recovery Education',
    description: 'Expert guides and resources for disaster recovery professionals',
    images: ['/images/og/resources-hub.jpg'],
  },
};

// Category icon mapping moved to render-time conditional

export default async function ResourcesPage() {
  const margotListing = await getMargotResourceListing('/resources');
  const margotResources = margotListing.resources;
  const featuredResources = getFeaturedResources();
  const trendingResources = getTrendingResources();
  const recentResources = getRecentResources(6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-slate-900">
      {margotListing.status === 'unavailable' && (
        <p role="status" className="bg-[#050505] px-6 py-6 text-center text-white">
          Margot resources could not be loaded. Please try again later.
        </p>
      )}
      {margotResources.length > 0 && (
        <section className="bg-[#050505] px-6 py-12 text-white" aria-labelledby="margot-resources-heading">
          <div className="mx-auto max-w-4xl">
            <h2 id="margot-resources-heading" className="text-2xl font-bold">Margot · Practical business lessons</h2>
            <ul className="mt-6 space-y-4">
              {margotResources.map(resource => (
                <li key={resource.id}>
                  <Link href={margotResourcePath(resource.slug)} className="text-dr-education hover:underline">{resource.title}</Link>
                  <p className="mt-1 text-white/75">{resource.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-r from-dr-education to-dr-education-hover text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="h-12 w-12" />
              <h1 className="text-4xl md:text-5xl font-bold">Resource Hub</h1>
            </div>
            <p className="text-xl text-white/90 mb-8">
              Expert guides, articles, and tools for disaster recovery professionals
            </p>

            {/* Search bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search resources... (e.g., 'water damage restoration', 'mould remediation')"
                className="pl-12 pr-4 py-6 text-lg bg-white text-gray-900"
              />
              <Button
                className="absolute right-2 top-1/2 -translate-y-1/2"
                size="lg"
              >
                Search
              </Button>
            </div>

            {/* Quick filters */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-white/80">Popular:</span>
              <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                Water Damage
              </Button>
              <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                Fire Restoration
              </Button>
              <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                Mould Remediation
              </Button>
              <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                IICRC Standards
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Resources Carousel */}
        {featuredResources.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Resources</h2>
                <p className="text-muted-foreground">
                  Hand-picked guides and articles from industry experts
                </p>
              </div>
            </div>

            <FeaturedResourceCarousel resources={featuredResources} />
          </section>
        )}

        {/* Category Grid */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Browse by Category</h2>
              <p className="text-muted-foreground">
                Explore resources organized by disaster type
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(RESOURCE_CATEGORIES).map((category) => {
              const categoryResourceCount = SAMPLE_RESOURCES.filter(
                (r) => r.category === category.id
              ).length;

              return (
                <Link
                  key={category.id}
                  href={`/resources/${category.id}`}
                  className="group"
                >
                  <Card className="h-full hover:shadow-lg transition-all hover:border-dr-education">
                    <CardHeader>
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${category.gradient} mb-4`}>
                        {category.id === 'water-damage' && <WaterDamage size="lg" className="text-white" aria-hidden="true" />}
                        {category.id === 'fire-damage' && <FireSmoke size="lg" className="text-white" aria-hidden="true" />}
                        {category.id === 'mold-remediation' && <MouldRemediation size="lg" className="text-white" aria-hidden="true" />}
                        {category.id === 'biohazard-cleanup' && <BioForensic size="lg" className="text-white" aria-hidden="true" />}
                        {category.id === 'storm-damage' && <Cloud className="h-8 w-8 text-white" />}
                        {category.id === 'sewage-cleanup' && <AlertTriangle className="h-8 w-8 text-white" />}
                      </div>
                      <CardTitle className="group-hover:text-dr-education transition-colors">
                        {category.name}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {categoryResourceCount} resources
                        </span>
                        <ArrowRight className="h-5 w-5 text-dr-education group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Trending & Recent Resources */}
        <section className="mb-16">
          <Tabs defaultValue="trending" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-auto grid-cols-2">
                <TabsTrigger value="trending" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="recent" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Recent
                </TabsTrigger>
              </TabsList>

              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            <TabsContent value="trending" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Newsletter Signup */}
        <section className="mb-16">
          <NewsletterSignup variant="inline" source="resources" />
        </section>

        {/* Content Type Sections */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Popular Guides & Checklists</h2>
            <p className="text-muted-foreground">
              Downloadable resources for your team
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {SAMPLE_RESOURCES.filter(
              (r) => r.contentType === 'guide' || r.contentType === 'checklist'
            )
              .slice(0, 4)
              .map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  variant="compact"
                />
              ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-r from-dr-education to-dr-education-hover text-white rounded-lg p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">
                {SAMPLE_RESOURCES.length}+
              </div>
              <div className="text-white/90">Expert Resources</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50k+</div>
              <div className="text-white/90">Monthly Readers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-white/90">Free Access</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
