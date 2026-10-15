/**
 * Resource Category Page
 *
 * Dynamic page for each disaster category with:
 * - Category header with description
 * - Filter by content type
 * - Search within category
 * - Resource grid
 * - Related categories
 */

import * as React from 'react';
import { resourceCanonical } from '@/lib/resources/canonical';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Search,
  Filter,
  FileText,
  Video,
  Headphones,
  CheckSquare,
  Wrench,
  ArrowRight,
  Droplet,
  Flame,
  Shield,
  Cloud,
  AlertTriangle,
  Biohazard,
} from 'lucide-react';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { NewsletterSignup } from '@/components/resources/NewsletterSignup';
import {
  RESOURCE_CATEGORIES,
  getCategoryBySlug,
  getResourcesByCategory,
} from '@/lib/resources/data';
import { DisasterCategory, ContentType } from '@/lib/resources/types';

interface CategoryPageProps {
  params: Promise<{
    category: DisasterCategory;
  }>;
}

const CATEGORY_ICONS: Record<DisasterCategory, React.ComponentType<{ className?: string }>> = {
  'water-damage': Droplet,
  'fire-damage': Flame,
  'mold-remediation': Shield,
  'storm-damage': Cloud,
  'sewage-cleanup': AlertTriangle,
  'biohazard-cleanup': Biohazard,
};

const CONTENT_TYPE_ICONS: Record<ContentType, React.ComponentType<{ className?: string }>> = {
  article: FileText,
  guide: FileText,
  video: Video,
  podcast: Headphones,
  checklist: CheckSquare,
  tool: Wrench,
};

export async function generateMetadata(props: CategoryPageProps): Promise<Metadata> {
  const params = await props.params;
  const category = getCategoryBySlug(params.category);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} Resources | Disaster Recovery Hub`,
    description: category.description,
    alternates: { canonical: resourceCanonical(`/resources/${params.category}`) },
    openGraph: {
      title: `${category.name} Resources`,
      description: category.description,
      images: [`/images/og/resources-${params.category}.jpg`],
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(RESOURCE_CATEGORIES).map((category) => ({
    category,
  }));
}

export default async function CategoryPage(props: CategoryPageProps) {
  const params = await props.params;
  const category = getCategoryBySlug(params.category);

  if (!category) {
    notFound();
  }

  const resources = getResourcesByCategory(params.category);
  const Icon = CATEGORY_ICONS[params.category];

  // Group resources by content type
  const resourcesByType = resources.reduce((acc, resource) => {
    const type = resource.contentType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(resource);
    return acc;
  }, {} as Record<ContentType, typeof resources>);

  // Get related categories (exclude current)
  const relatedCategories = Object.values(RESOURCE_CATEGORIES)
    .filter((cat) => cat.id !== params.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Breadcrumbs */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/resources">Resources</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{category.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Category Header */}
      <section className={`bg-gradient-to-r ${category.gradient} text-white py-16`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                <Icon className="h-12 w-12" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">{category.name}</h1>
                <p className="text-xl text-white/90 mt-2">{category.description}</p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {resources.length} Resources
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                IICRC Compliant
              </Badge>
            </div>

            {/* Search within category */}
            <div className="mt-8 relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder={`Search ${category.name.toLowerCase()} resources...`}
                className="pl-12 pr-4 py-6 bg-white text-gray-900"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Content Type Tabs */}
        <section className="mb-16">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-full max-w-2xl grid-cols-4">
                <TabsTrigger value="all">
                  All ({resources.length})
                </TabsTrigger>
                {Object.entries(resourcesByType)
                  .slice(0, 3)
                  .map(([type, items]) => {
                    const TypeIcon = CONTENT_TYPE_ICONS[type as ContentType];
                    return (
                      <TabsTrigger key={type} value={type} className="gap-2">
                        <TypeIcon className="h-4 w-4" />
                        {type.charAt(0).toUpperCase() + type.slice(1)}s ({items.length})
                      </TabsTrigger>
                    );
                  })}
              </TabsList>

              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* All resources */}
            <TabsContent value="all" className="mt-0">
              {resources.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No resources found in this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Resources by type */}
            {Object.entries(resourcesByType).map(([type, items]) => (
              <TabsContent key={type} value={type} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Newsletter Signup */}
        <section className="mb-16">
          <NewsletterSignup variant="inline" source="resources" />
        </section>

        {/* Related Categories */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Related Resources</h2>
            <p className="text-muted-foreground">
              Explore other disaster recovery categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedCategories.map((relatedCategory) => {
              const RelatedIcon = CATEGORY_ICONS[relatedCategory.id];
              return (
                <Link
                  key={relatedCategory.id}
                  href={`/resources/${relatedCategory.id}`}
                  className="group"
                >
                  <div className="p-6 rounded-lg border hover:border-dr-education hover:shadow-lg transition-all bg-white">
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${relatedCategory.gradient} mb-4`}>
                      <RelatedIcon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-dr-education transition-colors">
                      {relatedCategory.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {relatedCategory.description}
                    </p>
                    <div className="flex items-center text-dr-education text-sm font-medium">
                      Explore Resources
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
