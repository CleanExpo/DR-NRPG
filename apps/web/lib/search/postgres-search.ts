// @ts-nocheck

/**
 * PostgreSQL Full-Text Search Service
 * Replaces Algolia with native PostgreSQL tsvector search
 *
 * Benefits:
 * - No external service signup
 * - No API keys required
 * - No additional costs
 * - Already in your stack
 */

import { prisma } from '@/lib/prisma';

// Types
interface SearchParams {
  query: string;
  category?: string;
  state?: string;
  limit?: number;
  offset?: number;
}

interface ContractorSearchParams {
  query: string;
  services?: string[];
  state?: string;
  suburb?: string;
  limit?: number;
}

interface SearchHit {
  objectID: string;
  title: string;
  description: string;
  category: string;
  state: string | null;
  slug: string;
  _highlightResult?: {
    title: { value: string };
    description: { value: string };
  };
}

interface SearchResult {
  hits: SearchHit[];
  totalHits: number;
  page: number;
  totalPages: number;
}

interface LocationResult {
  label: string;
  value: string;
  city: string;
  suburb: string;
  state: string;
}

/**
 * Highlight matching terms in text
 */
export function highlightMatch(text: string, query: string): string {
  if (!text || !query) return text;

  const terms = query.trim().split(/\s+/);
  let highlighted = text;

  terms.forEach((term) => {
    // Escape regex metacharacters so the user's term is matched literally.
    const literal = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${literal})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  });

  return highlighted;
}

/**
 * PostgreSQL Full-Text Search for Resources
 */
export async function searchResources(params: SearchParams): Promise<SearchResult> {
  const { query, category, state, limit = 20, offset = 0 } = params;

  if (!query || query.trim().length < 2) {
    return { hits: [], totalHits: 0, page: 0, totalPages: 0 };
  }

  try {
    // Build WHERE conditions
    const conditions: string[] = [
      `to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', $1)`,
    ];
    const values: (string | number)[] = [query];
    let paramIndex = 2;

    if (category) {
      conditions.push(`category = $${paramIndex}`);
      values.push(category);
      paramIndex++;
    }

    if (state) {
      conditions.push(`state = $${paramIndex}`);
      values.push(state);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Use PostgreSQL full-text search with ts_rank for relevance
    const results = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        title: string;
        description: string | null;
        category: string;
        state: string | null;
        slug: string;
        rank: number;
      }>
    >(
      `
      SELECT
        id,
        title,
        description,
        category,
        state,
        slug,
        ts_rank(
          to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')),
          plainto_tsquery('english', $1)
        ) as rank
      FROM "Resource"
      WHERE ${whereClause}
      ORDER BY rank DESC
      LIMIT $${paramIndex}
      OFFSET $${paramIndex + 1}
    `,
      ...values,
      limit,
      offset
    );

    // Get total count
    const countResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
      `
      SELECT COUNT(*) as count
      FROM "Resource"
      WHERE ${whereClause}
    `,
      ...values
    );

    const totalHits = Number(countResult[0]?.count || 0);

    return {
      hits: results.map((r) => ({
        objectID: r.id,
        title: r.title,
        description: r.description || '',
        category: r.category,
        state: r.state,
        slug: r.slug,
        _highlightResult: {
          title: { value: highlightMatch(r.title, query) },
          description: { value: highlightMatch(r.description || '', query) },
        },
      })),
      totalHits,
      page: Math.floor(offset / limit),
      totalPages: Math.ceil(totalHits / limit),
    };
  } catch (error) {
    console.error('PostgreSQL search error:', error);
    // Fallback to ILIKE search
    return fallbackSearch(params);
  }
}

/**
 * Search contractors by service and location
 */
export async function searchContractors(params: ContractorSearchParams) {
  const { query, services, state, suburb, limit = 20 } = params;

  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const conditions: string[] = [
      `to_tsvector('english',
        COALESCE(c."businessName", '') || ' ' ||
        COALESCE(array_to_string(c.services, ' '), '') || ' ' ||
        COALESCE(c.state, '') || ' ' ||
        COALESCE(c.suburb, '')
      ) @@ plainto_tsquery('english', $1)`,
    ];
    const values: (string | number)[] = [query];
    let paramIndex = 2;

    if (state) {
      conditions.push(`c.state = $${paramIndex}`);
      values.push(state);
      paramIndex++;
    }

    if (suburb) {
      conditions.push(`c.suburb ILIKE $${paramIndex}`);
      values.push(`%${suburb}%`);
      paramIndex++;
    }

    if (services && services.length > 0) {
      conditions.push(`c.services && $${paramIndex}::text[]`);
      values.push(services as unknown as string);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const results = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        businessName: string;
        services: string[];
        state: string;
        suburb: string;
        rank: number;
      }>
    >(
      `
      SELECT
        c.id,
        c."businessName",
        c.services,
        c.state,
        c.suburb,
        ts_rank(
          to_tsvector('english',
            COALESCE(c."businessName", '') || ' ' ||
            COALESCE(array_to_string(c.services, ' '), '') || ' ' ||
            COALESCE(c.state, '') || ' ' ||
            COALESCE(c.suburb, '')
          ),
          plainto_tsquery('english', $1)
        ) as rank
      FROM "Contractor" c
      WHERE c.status = 'APPROVED' AND ${whereClause}
      ORDER BY rank DESC
      LIMIT $${paramIndex}
    `,
      ...values,
      limit
    );

    return results.map((r) => ({
      id: r.id,
      businessName: r.businessName,
      services: r.services,
      state: r.state,
      suburb: r.suburb,
      relevance: r.rank,
    }));
  } catch (error) {
    console.error('Contractor search error:', error);
    return [];
  }
}

/**
 * Search location pages for autocomplete
 */
export async function searchLocationPages(query: string, limit = 10): Promise<LocationResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const results = await prisma.$queryRawUnsafe<
      Array<{
        city: string;
        suburb: string;
        state: string;
        rank: number;
      }>
    >(
      `
      SELECT
        city,
        suburb,
        state,
        ts_rank(
          to_tsvector('english',
            COALESCE(city, '') || ' ' ||
            COALESCE(suburb, '') || ' ' ||
            COALESCE(state, '')
          ),
          plainto_tsquery('english', $1)
        ) as rank
      FROM "LocationPage"
      WHERE
        status = 'PUBLISHED'
        AND to_tsvector('english',
          COALESCE(city, '') || ' ' ||
          COALESCE(suburb, '') || ' ' ||
          COALESCE(state, '')
        ) @@ plainto_tsquery('english', $1)
      ORDER BY rank DESC
      LIMIT $2
    `,
      query,
      limit
    );

    return results.map((r) => ({
      label: `${r.suburb}, ${r.city} ${r.state}`,
      value: `/${r.city.toLowerCase()}/${r.suburb.toLowerCase().replace(/\s+/g, '-')}`,
      city: r.city,
      suburb: r.suburb,
      state: r.state,
    }));
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
}

/**
 * Fallback search using ILIKE (when full-text fails or isn't available)
 */
async function fallbackSearch(params: SearchParams): Promise<SearchResult> {
  const { query, category, state, limit = 20, offset = 0 } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ],
  };

  if (category) where.category = category;
  if (state) where.state = state;

  const [results, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.resource.count({ where }),
  ]);

  return {
    hits: results.map((r) => ({
      objectID: r.id,
      title: r.title,
      description: r.description || '',
      category: r.category,
      state: r.state,
      slug: r.slug,
      _highlightResult: {
        title: { value: highlightMatch(r.title, query) },
        description: { value: highlightMatch(r.description || '', query) },
      },
    })),
    totalHits: total,
    page: Math.floor(offset / limit),
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Global search across multiple content types
 */
export async function globalSearch(
  query: string,
  options: { limit?: number } = {}
): Promise<{
  resources: SearchResult;
  locations: LocationResult[];
}> {
  const { limit = 10 } = options;

  const [resources, locations] = await Promise.all([
    searchResources({ query, limit }),
    searchLocationPages(query, limit),
  ]);

  return { resources, locations };
}

// Export service object
export const PostgresSearchService = {
  searchResources,
  searchContractors,
  searchLocationPages,
  globalSearch,
  fallbackSearch,
};

export default PostgresSearchService;
