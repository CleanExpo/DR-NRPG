import { SITE_URL } from '@/lib/seo/site-url';

/** Published Margot articles in the existing Sanity resource collection. */
const CMS_READ_TIMEOUT_MS = 3000;
type MargotTextSpan = { text: string; href?: string };
type MargotParagraph = string | MargotTextSpan[];

export interface MargotResource {
  id: string;
  slug: string;
  title: string;
  description: string;
  paragraphs: MargotParagraph[];
  publishedAt: string;
}

export const publishedMargotQuery = `
  *[_type == "resource" && "margot-series" in tags && isPremium == false
    && !(_id in path("drafts.**")) && !(_id in path("versions.**"))
    && defined(publishedAt) && dateTime(publishedAt) <= dateTime($now)]
  | order(publishedAt desc) {
    _id, _type, "slug": slug.current, title, description, tags, isPremium, publishedAt,
    "paragraphs": body[_type == "block"]{
      children[_type == "span"]{ _type, text, marks },
      markDefs[]{ _key, _type, href }
    }
  }
`;

// Admit only the existing public resource and companion-course destinations.
// Queries, fragments and encoded paths are unnecessary here and can carry private tokens.
function publicResourceHref(value: unknown): string | undefined {
  if (typeof value !== 'string' || /[\s\\?#%]/.test(value)) return undefined;
  const resourcePath = /^\/resources(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*\/?$/;
  if (resourcePath.test(value)) return value;
  if (!value.startsWith('https://')) return undefined;
  try {
    const url = new URL(value);
    if (url.username || url.password || url.port || value !== `${url.origin}${url.pathname}`) return undefined;
    if (url.origin === SITE_URL
      && resourcePath.test(url.pathname)) return value;
    if (url.origin === 'https://carsi.com.au' && [
      '/courses/collaborative-development-your-personal-ai-assistant',
      '/courses/restoration-project-management-premium',
    ].includes(url.pathname)) return value;
  } catch { /* Invalid destinations remain readable text. */ }
  return undefined;
}

function selectParagraph(value: unknown): MargotParagraph | undefined {
  // Preserve the earlier plain-text projection as well as current PortableText blocks.
  if (typeof value === 'string') return value.trim() ? value : undefined;
  if (!value || typeof value !== 'object' || !('children' in value) || !Array.isArray(value.children)) return undefined;
  const definitions = 'markDefs' in value && Array.isArray(value.markDefs) ? value.markDefs : [];
  const spans: MargotTextSpan[] = [];
  for (const child of value.children) {
    if (!child || child._type !== 'span' || typeof child.text !== 'string') return undefined;
    const marks = Array.isArray(child.marks) ? child.marks : [];
    const link = definitions.find(definition => definition && definition._type === 'link'
      && typeof definition._key === 'string' && marks.includes(definition._key));
    const href = publicResourceHref(link?.href);
    spans.push(href ? { text: child.text, href } : { text: child.text });
  }
  return spans.some(span => span.text.trim()) ? spans : undefined;
}

export function selectPublishedMargotResources(value: unknown, now: Date): MargotResource[] {
  if (!Array.isArray(value)) throw new Error('Published Margot resources could not be loaded.');
  return value.flatMap((doc): MargotResource[] => {
    if (!doc || typeof doc !== 'object' || doc._type !== 'resource') return [];
    if (doc.isPremium !== false) return [];
    if (typeof doc._id !== 'string' || !doc._id || /^(drafts|versions)\./.test(doc._id)) return [];
    if (!Array.isArray(doc.tags) || !doc.tags.includes('margot-series')) return [];
    if (typeof doc.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(doc.slug)) return [];
    if (typeof doc.title !== 'string' || !doc.title.trim() || typeof doc.description !== 'string' || !doc.description.trim()) return [];
    const publishedAt = typeof doc.publishedAt === 'string' ? Date.parse(doc.publishedAt) : NaN;
    if (!Number.isFinite(publishedAt) || publishedAt > now.getTime()) return [];
    if (!Array.isArray(doc.paragraphs) || !doc.paragraphs.length) return [];
    const paragraphs = doc.paragraphs.map(selectParagraph);
    if (paragraphs.some((paragraph: MargotParagraph | undefined) => paragraph === undefined)) return [];
    return [{ id: doc._id, slug: doc.slug, title: doc.title, description: doc.description,
      paragraphs: paragraphs as MargotParagraph[], publishedAt: doc.publishedAt }];
  });
}

export function margotResourcePath(slug: string): string {
  return `/resources/margot/${encodeURIComponent(slug)}`;
}

export async function getPublishedMargotResources(): Promise<MargotResource[]> {
  // The existing client validates configuration at import time. An unconfigured
  // deployment has no connected series; it must not expose local draft content.
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return [];
  const now = new Date();
  // A slow CMS must not hold the hub or the 5,000-URL sitemap hostage.
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), CMS_READ_TIMEOUT_MS);
  try {
    const { getClient } = await import('@/lib/sanity.client');
    const publicClient = getClient(false).withConfig({ useCdn: false, perspective: 'published' });
    const docs: unknown = await publicClient.fetch(publishedMargotQuery, { now: now.toISOString() }, { cache: 'no-store', signal: abort.signal });
    return selectPublishedMargotResources(docs, now);
  } catch {
    throw new Error('Published Margot resources could not be loaded.');
  } finally {
    clearTimeout(timer);
  }
}

/** Optional series discovery must not take down the existing hub or sitemap. */
export async function getMargotResourceListing(surface: '/resources' | '/sitemap.xml') {
  try {
    return { status: 'available' as const, resources: await getPublishedMargotResources() };
  } catch {
    console.error('[margot-resources] Published series unavailable', { surface });
    return { status: 'unavailable' as const, resources: [] as MargotResource[] };
  }
}
