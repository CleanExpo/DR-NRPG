/** @jest-environment node */
import { getPublishedMargotResources, getMargotResourceListing, selectPublishedMargotResources, publishedMargotQuery } from '@/lib/resources/margot';
import { renderToStaticMarkup } from 'react-dom/server';
import MargotResourcePage, { generateMetadata } from '@/app/resources/margot/[slug]/page';
import sitemap from '@/app/sitemap';
import { SITE_URL } from '@/lib/seo/site-url';

const mockFetch = jest.fn();
// Mock the external SDK boundary; retain the real application client and reader.
jest.mock('next-sanity', () => {
  const createClient = (config: Record<string, unknown>): unknown => ({
    config: () => config,
    withConfig: (overrides: Record<string, unknown>) => createClient({ ...config, ...overrides }),
    fetch: (query: string, params: unknown, options: unknown) => mockFetch(query, params, options, {
      useCdn: config.useCdn, perspective: config.perspective,
    }),
  });
  return { createClient };
});
// The unrelated ESM image SDK is imported by the real application client.
jest.mock('@sanity/image-url', () => ({ __esModule: true, default: () => ({}) }));
jest.mock('next/navigation', () => ({ notFound: () => { throw new Error('NEXT_NOT_FOUND'); } }));
jest.mock('@/lib/seo/internal-linking', () => ({ internalLinking: { generateSitemapStructure: () => ({ services: [], locations: [], serviceLocations: [] }) } }));
jest.mock('@/lib/seo/city-service-generator', () => ({ getAllCityServiceCombinations: () => [] }));
jest.mock('@/data/australian-cities.json', () => ({ cities: [] }));

const now = new Date('2026-09-13T00:00:00Z');
const published = {
  _id: 'example-resource', _type: 'resource', slug: 'clear-handover',
  title: 'A clear handover', description: 'A synthetic test resource.',
  tags: ['margot-series'], isPremium: false, paragraphs: ['Current state. Next action. Responsible person.'],
  publishedAt: '2026-09-12T00:00:00Z',
};

describe('Margot public resource boundary', () => {
  const originalProject = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const originalBase = process.env.NEXT_PUBLIC_BASE_URL;
  beforeEach(() => { jest.useFakeTimers(); jest.setSystemTime(now); });
  afterEach(() => {
    jest.useRealTimers();
    if (originalProject === undefined) delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    else process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = originalProject;
    if (originalBase === undefined) delete process.env.NEXT_PUBLIC_BASE_URL;
    else process.env.NEXT_PUBLIC_BASE_URL = originalBase;
    mockFetch.mockReset();
  });

  it('admits a real published record without inventing media metadata', () => {
    const resources = selectPublishedMargotResources([published], now);
    expect(resources).toHaveLength(1);
    expect(resources[0]).toMatchObject({ slug: published.slug, paragraphs: published.paragraphs });
    expect(resources[0]).not.toHaveProperty('videoUrl');
    expect(resources[0]).not.toHaveProperty('uploadDate');
  });

  it.each([
    { _id: 'drafts.example-resource' }, { _id: 'versions.release.example-resource' },
    { publishedAt: '2026-09-14T00:00:00Z' }, { publishedAt: undefined },
    { publishedAt: 'invalid' }, { tags: [] }, { _type: 'blogPost' },
    { slug: '../private' }, { paragraphs: [] }, { paragraphs: [null] },
    { isPremium: true }, { isPremium: undefined },
  ])('excludes an ineligible record: %j', override => {
    expect(selectPublishedMargotResources([{ ...published, ...override }], now)).toEqual([]);
  });

  it('does not query an unconfigured CMS or use a local draft fallback', async () => {
    delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    expect(await getPublishedMargotResources()).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rechecks the returned records instead of trusting the query alone', async () => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'synthetic-project';
    mockFetch.mockResolvedValue([published, { ...published, _id: 'drafts.secret' }]);
    expect(await getPublishedMargotResources()).toHaveLength(1);
    expect(mockFetch.mock.calls[0].slice(0, 2)).toEqual([publishedMargotQuery, { now: expect.any(String) }]);
  });

  it('withdraws an unpublished article from the page, metadata, listing and sitemap on the next read', async () => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'synthetic-project';
    const { getClient } = await import('@/lib/sanity.client');
    const sharedConfiguration = {
      useCdn: getClient(false).config().useCdn, perspective: getClient(false).config().perspective,
    };
    let currentDocuments: typeof published[] = [published];
    // A retained external cache snapshot remains visible unless both cache layers
    // are bypassed and the published perspective is explicitly selected.
    mockFetch.mockImplementation((_query, _params, options, config) => Promise.resolve(
      config.useCdn === false && config.perspective === 'published' && options?.cache === 'no-store'
        ? currentDocuments : [published]
    ));
    const props = { params: Promise.resolve({ slug: published.slug }) };
    expect(renderToStaticMarkup(await MargotResourcePage(props))).toContain(published.title);
    expect((await getMargotResourceListing('/resources')).resources).toHaveLength(1);
    expect((await sitemap()).some(item => item.url.endsWith('/margot/clear-handover'))).toBe(true);

    currentDocuments = [];
    await expect(MargotResourcePage(props)).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(generateMetadata(props)).rejects.toThrow('NEXT_NOT_FOUND');
    expect(await getMargotResourceListing('/resources')).toEqual({ status: 'available', resources: [] });
    expect((await sitemap()).some(item => item.url.endsWith('/margot/clear-handover'))).toBe(false);
    expect({
      useCdn: getClient(false).config().useCdn, perspective: getClient(false).config().perspective,
    }).toEqual(sharedConfiguration);
  });

  it('reports a CMS failure without returning a false empty success or private error', async () => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'synthetic-project';
    mockFetch.mockRejectedValue(new Error('private-provider-diagnostic'));
    await expect(getPublishedMargotResources()).rejects.toThrow('Published Margot resources could not be loaded.');
  });

  it('uses SITE_URL for resource canonicals whatever the base URL env says', async () => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'synthetic-project';
    mockFetch.mockResolvedValue([published]);
    for (const env of ['https://disasterrecovery.com.au', undefined]) {
      if (env === undefined) delete process.env.NEXT_PUBLIC_BASE_URL;
      else process.env.NEXT_PUBLIC_BASE_URL = env;
      const metadata = await generateMetadata({ params: Promise.resolve({ slug: published.slug }) });
      const urls = (await sitemap()).map(item => item.url);
      expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/resources/margot/clear-handover`);
      expect(urls).toContain(metadata.alternates?.canonical);
      expect(new Set(urls.map(url => new URL(url).origin))).toEqual(new Set([SITE_URL]));
    }
  });

  it('gives up on a hung CMS read and reports the series unavailable', async () => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'synthetic-project';
    mockFetch.mockImplementation((_q: unknown, _p: unknown, options: { signal?: AbortSignal }) => new Promise((_resolve, reject) => {
      if (!options?.signal) return; // A read with no abort signal hangs forever.
      options.signal.addEventListener('abort', () => reject(new Error('aborted')));
    }));
    const pending = getMargotResourceListing('/sitemap.xml');
    await jest.advanceTimersByTimeAsync(10000);
    await expect(pending).resolves.toMatchObject({ status: 'unavailable', resources: [] });
  });

  it('keeps a draft out of the actual public page, metadata and sitemap', async () => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'synthetic-project';
    mockFetch.mockResolvedValue([{ ...published, _id: 'drafts.example-resource' }]);
    const props = { params: Promise.resolve({ slug: published.slug }) };
    await expect(MargotResourcePage(props)).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(generateMetadata(props)).rejects.toThrow('NEXT_NOT_FOUND');
    expect((await sitemap()).some(item => item.url.endsWith('/margot/clear-handover'))).toBe(false);
  });

  it('uses the same published URL in page metadata and the actual sitemap', async () => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'synthetic-project';
    process.env.NEXT_PUBLIC_BASE_URL = 'https://disasterrecovery.com.au';
    mockFetch.mockResolvedValue([published, { ...published, _id: 'drafts.private', slug: 'private' }]);
    const props = { params: Promise.resolve({ slug: published.slug }) };
    const metadata = await generateMetadata(props);
    const urls = (await sitemap()).map(item => item.url);
    expect(urls).toContain(metadata.alternates?.canonical);
    expect(urls.some(url => url.endsWith('/margot/private'))).toBe(false);
    const html = renderToStaticMarkup(await MargotResourcePage(props));
    expect(html).toContain(published.paragraphs[0]);
    expect(html).not.toMatch(/VideoObject|uploadDate|<video|<iframe/);
  });

  it('renders existing PortableText resource and course links inline with escaped text', async () => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'synthetic-project';
    const links = [
      ['/resources/margot/another-lesson', 'Another lesson'],
      ['https://nrpg.business/resources', 'NRPG resources'],
      ['https://carsi.com.au/courses/collaborative-development-your-personal-ai-assistant', 'Learn <safely>'],
    ];
    mockFetch.mockResolvedValue([{ ...published, paragraphs: [{
      children: links.flatMap(([, text], index) => [
        { _type: 'span', text: index ? ' then ' : 'Read ', marks: [] },
        { _type: 'span', text, marks: [`link-${index}`] },
      ]),
      markDefs: links.map(([href], index) => ({ _type: 'link', _key: `link-${index}`, href })),
    }] }]);
    const html = renderToStaticMarkup(await MargotResourcePage({ params: Promise.resolve({ slug: published.slug }) }));
    for (const [href] of links) expect(html).toContain(`href="${href}"`);
    expect(html).toContain('Read ');
    expect(html).toContain(' then ');
    expect(html).toContain('Learn &lt;safely&gt;</a>');
    expect(html).not.toContain('<safely>');
  });

  it.each([
    'javascript:alert(1)', 'data:text/html,<script>alert(1)</script>',
    '//nrpg.business/resources', 'http://nrpg.business/resources', 'https://disasterrecovery.com.au/resources',
    'https://foreign.example/resources', 'https://nrpg.business.foreign.example/resources',
    'https://person:secret@nrpg.business/resources', 'https://nrpg.business:444/resources',
    'https://nrpg.business/resources?token=synthetic-private-token',
    'https://nrpg.business/resources#synthetic-private-token',
    'https://synthetic.supabase.co/storage/v1/object/sign/private/video.mp4?token=synthetic',
    '/api/private', '/founder/weekly-tasks', '/auth/login',
    'https://nrpg.business/founder/weekly-tasks',
    'https://nrpg.business/api/../resources', 'https://nrpg.business/auth/../resources',
    '/resources/%2e%2e/founder', 'https://nrpg.business/\\resources',
    'mailto:synthetic@example.com', 'tel:000',
    'https://carsi.com.au/courses/unassigned-course',
  ])('preserves readable text without admitting an unsafe or unassigned destination: %s', async href => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'synthetic-project';
    mockFetch.mockResolvedValue([{ ...published, paragraphs: [{
      children: [{ _type: 'span', text: 'Read <this> lesson.', marks: ['link'] }],
      markDefs: [{ _type: 'link', _key: 'link', href }],
    }] }]);
    const html = renderToStaticMarkup(await MargotResourcePage({ params: Promise.resolve({ slug: published.slug }) }));
    expect(html).toContain('Read &lt;this&gt; lesson.');
    expect(html.match(/<a\b/g)).toHaveLength(1); // Only the existing Resource Hub navigation.
    expect(html).not.toContain('synthetic-private-token');
  });

  it('renders companion text as text rather than executable HTML', async () => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'synthetic-project';
    mockFetch.mockResolvedValue([{ ...published, paragraphs: ['<script>alert(1)</script>'] }]);
    const html = renderToStaticMarkup(await MargotResourcePage({ params: Promise.resolve({ slug: published.slug }) }));
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('keeps premium or unspecified-access content out of the public page and sitemap', async () => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'synthetic-project';
    mockFetch.mockResolvedValue([{ ...published, isPremium: true }, { ...published, _id: 'unspecified-access', isPremium: undefined }]);
    await expect(MargotResourcePage({ params: Promise.resolve({ slug: published.slug }) })).rejects.toThrow('NEXT_NOT_FOUND');
    expect((await sitemap()).some(item => item.url.endsWith('/margot/clear-handover'))).toBe(false);
  });

  it('keeps existing discovery available during a CMS outage and records only a safe diagnostic', async () => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'synthetic-project';
    mockFetch.mockRejectedValue(new Error('private-provider-diagnostic'));
    const logged = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(await getMargotResourceListing('/resources')).toEqual({ status: 'unavailable', resources: [] });
      const urls = (await sitemap()).map(item => item.url);
      expect(urls.some(url => url.endsWith('/services'))).toBe(true);
      expect(urls.some(url => url.endsWith('/resources'))).toBe(true);
      expect(urls.some(url => url.includes('/resources/margot/'))).toBe(false);
      expect(logged).toHaveBeenNthCalledWith(1, '[margot-resources] Published series unavailable', { surface: '/resources' });
      expect(logged).toHaveBeenNthCalledWith(2, '[margot-resources] Published series unavailable', { surface: '/sitemap.xml' });
      expect(JSON.stringify(logged.mock.calls)).not.toContain('private-provider-diagnostic');
      await expect(MargotResourcePage({ params: Promise.resolve({ slug: published.slug }) })).rejects.toThrow('Published Margot resources could not be loaded.');
    } finally {
      logged.mockRestore();
    }
  });
});
