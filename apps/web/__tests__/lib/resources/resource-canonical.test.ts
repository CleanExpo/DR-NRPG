import { resourceCanonical } from '@/lib/resources/canonical';
import { SITE_URL } from '@/lib/seo/site-url';

describe('resourceCanonical', () => {
  const originalOrigin = process.env.NEXT_PUBLIC_BASE_URL;
  afterEach(() => {
    if (originalOrigin === undefined) delete process.env.NEXT_PUBLIC_BASE_URL;
    else process.env.NEXT_PUBLIC_BASE_URL = originalOrigin;
  });

  it('always uses SITE_URL, ignoring NEXT_PUBLIC_BASE_URL', () => {
    for (const env of ['https://disasterrecovery.com.au', 'https://www.nrpg.business/base', 'not-a-url', undefined]) {
      if (env === undefined) delete process.env.NEXT_PUBLIC_BASE_URL;
      else process.env.NEXT_PUBLIC_BASE_URL = env;
      expect(resourceCanonical()).toBe(`${SITE_URL}/resources`);
      expect(resourceCanonical('/resources/margot/clear-handover')).toBe(`${SITE_URL}/resources/margot/clear-handover`);
    }
  });

  it('keeps canonicals inside the resource section', () => {
    for (const path of ['https://elsewhere.example/resources', '//elsewhere.example/resources', '/about', '/resources/../about', '/resources/%2e%2e/about', '/resources-other', '/resources\\..\\about']) {
      expect(() => resourceCanonical(path)).toThrow('Invalid resource canonical path');
    }
  });

  it('removes query and fragment variants while retaining the page path', () => {
    expect(resourceCanonical('/resources/margot/clear-handover?utm_source=weekly#exercise')).toBe(`${SITE_URL}/resources/margot/clear-handover`);
  });
});
