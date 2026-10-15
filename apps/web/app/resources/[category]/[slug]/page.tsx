/**
 * Individual Resource Page
 *
 * Dynamic page for each resource with:
 * - Full content display
 * - Timeline for process guides
 * - Before/After for case studies
 * - Author information
 * - Related resources
 * - Download tracking
 * - Social sharing
 */

import * as React from 'react';
import { resourceCanonical } from '@/lib/resources/canonical';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DownloadButton } from '@/components/resources/DownloadButton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Clock,
  Download,
  Eye,
  Share2,
  Bookmark,
  FileText,
  Video,
  Headphones,
  CheckSquare,
  Wrench,
  Calendar,
  Tag,
  Linkedin,
  Twitter,
  Facebook,
} from 'lucide-react';
import { Timeline } from '@/src/design-system/components/Timeline/Timeline';
import { BeforeAfterComparison } from '@/src/design-system/components/BeforeAfter/BeforeAfterComparison';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { NewsletterSignup } from '@/components/resources/NewsletterSignup';
import {
  RESOURCE_CATEGORIES,
  SAMPLE_RESOURCES,
  SAMPLE_PROCESS_RESOURCE,
  SAMPLE_CASE_STUDY,
} from '@/lib/resources/data';
import { DisasterCategory, ContentType, Resource } from '@/lib/resources/types';
import { sanitizeHtml } from '@/lib/sanitize';

interface ResourcePageProps {
  params: Promise<{
    category: DisasterCategory;
    slug: string;
  }>;
}

const CONTENT_TYPE_ICONS: Record<ContentType, React.ElementType> = {
  article: FileText,
  guide: FileText,
  video: Video,
  podcast: Headphones,
  checklist: CheckSquare,
  tool: Wrench,
};

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  article: 'Article',
  guide: 'Guide',
  video: 'Video',
  podcast: 'Podcast',
  checklist: 'Checklist',
  tool: 'Tool',
};

// Helper function to find resource by slug
function getResourceBySlug(category: DisasterCategory, slug: string): Resource | null {
  // Check sample resources
  const sampleResource = SAMPLE_RESOURCES.find(
    (r) => r.category === category && r.slug === slug
  );
  if (sampleResource) return sampleResource;

  // Check process resource
  if (SAMPLE_PROCESS_RESOURCE.category === category && SAMPLE_PROCESS_RESOURCE.slug === slug) {
    return SAMPLE_PROCESS_RESOURCE;
  }

  // Check case study
  if (SAMPLE_CASE_STUDY.category === category && SAMPLE_CASE_STUDY.slug === slug) {
    return SAMPLE_CASE_STUDY;
  }

  return null;
}

export async function generateMetadata(props: ResourcePageProps): Promise<Metadata> {
  const params = await props.params;
  const resource = getResourceBySlug(params.category, params.slug);

  if (!resource) {
    return {
      title: 'Resource Not Found',
    };
  }

  return {
    title: resource.metaTitle || `${resource.title} | Resource Hub`,
    description: resource.metaDescription || resource.description,
    alternates: { canonical: resourceCanonical(`/resources/${resource.category}/${resource.slug}`) },
    openGraph: {
      title: resource.title,
      description: resource.description,
      images: [resource.ogImage || resource.featuredImageUrl || '/images/og/default.jpg'],
    },
  };
}

export default async function ResourcePage(props: ResourcePageProps) {
  const params = await props.params;
  const resource = getResourceBySlug(params.category, params.slug);

  if (!resource) {
    notFound();
  }

  const res = resource as Resource;
  const category = RESOURCE_CATEGORIES[params.category];
  const ContentTypeIcon = CONTENT_TYPE_ICONS[res.contentType] as React.ComponentType<{ className?: string }>;

  // Get related resources
  const relatedResources = SAMPLE_RESOURCES.filter(
    (r) =>
      r.id !== res.id &&
      (r.category === res.category ||
        r.tags.some((tag) => res.tags?.includes(tag)))
  ).slice(0, 3);

  const resAny = res as any;
  // Check if resource has process timeline
  const isProcessResource = 'steps' in resAny && resAny.steps;

  // Check if resource has case study
  const isCaseStudy = 'caseStudy' in resAny && resAny.caseStudy;


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
                <BreadcrumbLink href={`/resources/${params.category}`}>
                  {category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{res.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Article Header */}
            <header>
              <div className="flex items-center gap-2 mb-4">
                <Badge className={`bg-gradient-to-r ${category.gradient} text-white border-0`}>
                  {category.name}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <ContentTypeIcon className="h-3 w-3" />
                  {CONTENT_TYPE_LABELS[res.contentType]}
                </Badge>
                {res.difficulty && (
                  <Badge variant="outline">{res.difficulty}</Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {res.title}
              </h1>

              <p className="text-xl text-muted-foreground mb-6">
                {res.description}
              </p>

              {/* Meta information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {res.author && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={res.author.avatarUrl} alt={res.author.name} />
                      <AvatarFallback>{res.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-900">
                      {res.author.name}
                    </span>
                  </div>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {res.publishedAt.toLocaleDateString('en-AU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                {res.readingTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {res.readingTime} min read
                  </span>
                )}
                {res.viewCount && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {res.viewCount.toLocaleString()} views
                  </span>
                )}
              </div>
            </header>

            <Separator />

            {/* Featured Image */}
            {res.featuredImageUrl && (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={res.featuredImageUrl}
                  alt={res.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Main Content */}
            <div className="prose prose-lg max-w-none">
              {res.content ? (
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(res.content) }} />
              ) : (
                <div>
                  <p>{res.description}</p>
                  <p className="mt-4">
                    This is a sample resource. In production, content would be fetched from
                    a headless CMS like Contentful or Sanity.
                  </p>
                </div>
              )}
            </div>

            {/* Process Timeline (if applicable) */}
            {isProcessResource && resAny.steps && (
              <div className="mt-12">
                <h2 className="text-3xl font-bold mb-6">Step-by-Step Process</h2>
                <Timeline steps={resAny.steps} mode="timeline" animated={true} />
              </div>
            )}

            {/* Case Study (if applicable) */}
            {isCaseStudy && resAny.caseStudy && (
              <div className="mt-12 space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6">Case Study Details</h2>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Property Type</p>
                      <p className="font-semibold">{resAny.caseStudy.propertyType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Project Duration</p>
                      <p className="font-semibold">{resAny.caseStudy.projectDuration}</p>
                    </div>
                  </div>
                </div>

                {resAny.caseStudy.beforeImages.length > 0 && (
                  <BeforeAfterComparison
                    title="Restoration Results"
                    description="Professional restoration following IICRC standards"
                    beforeImage={resAny.caseStudy.beforeImages[0]}
                    afterImage={resAny.caseStudy.afterImages[0]}
                    explanation={resAny.caseStudy.outcome}
                    lesson={resAny.caseStudy.challenges.join('. ')}
                  />
                )}
              </div>
            )}

            {/* Tags */}
            {res.tags && res.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-8 border-t">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {res.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Author Bio */}
            {res.author && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>About the Author</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={res.author.avatarUrl} alt={res.author.name} />
                      <AvatarFallback>{res.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{res.author.name}</h4>
                      {res.author.title && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {res.author.title}
                        </p>
                      )}
                      {res.author.credentials && res.author.credentials.length > 0 && (
                        <div className="flex gap-2 mb-2">
                          {res.author.credentials.map((cred) => (
                            <Badge key={cred} variant="outline" className="text-xs">
                              {cred}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {res.author.bio && (
                        <p className="text-sm text-muted-foreground">{res.author.bio}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                {res.downloadable && res.downloadUrl && (
                  <DownloadButton
                    downloadUrl={res.downloadUrl}
                    resourceId={res.id}
                    downloadFormat={res.downloadFormat}
                  />
                )}

                <Button variant="outline" className="w-full gap-2">
                  <Bookmark className="h-4 w-4" />
                  Save for Later
                </Button>

                <Separator />

                <p className="text-sm font-medium mb-2">Share this resource:</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Newsletter Signup */}
            <NewsletterSignup variant="compact" source="resources" />

            {/* Related Resources */}
            {relatedResources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedResources.map((relatedResource) => (
                    <ResourceCard
                      key={relatedResource.id}
                      resource={relatedResource}
                      variant="compact"
                      showAuthor={false}
                    />
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
