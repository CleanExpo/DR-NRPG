/**
 * @jest-environment node
 *
 * robots.txt rules. A crawler that reads only its own group must still be told
 * the private paths are off limits, but named search and AI crawlers must be
 * able to fetch /_next/ (scripts, styles, images) to render pages.
 */
import robots from '@/app/robots';

const PRIVATE_PATHS = ['/dashboard/', '/api/', '/admin/', '/private/', '/internal/'];

const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'Claude-Web',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'ClaudeBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Amazonbot',
  'FacebookBot',
  'Diffbot',
  'cohere-ai',
];

const SEARCH_ENGINES = ['Googlebot', 'Googlebot-Image', 'Bingbot'];

const BLOCKED_SCRAPERS = [
  'AhrefsBot',
  'SemrushBot',
  'DotBot',
  'MJ12bot',
  'BLEXBot',
  'DataForSeoBot',
  'serpstatbot',
  'Bytespider',
  'PetalBot',
  'ZoominfoBot',
];

type Rule = { userAgent?: string | string[]; allow?: string | string[]; disallow?: string | string[] };

const rules = (): Rule[] => {
  const r = robots().rules;
  return Array.isArray(r) ? (r as Rule[]) : [r as Rule];
};
const list = (v: string | string[] | undefined): string[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const group = (name: string): Rule[] => rules().filter((r) => list(r.userAgent).includes(name));

describe('robots.txt rules', () => {
  it('the AI crawler groups are exactly the expected list', () => {
    const aiNames = rules()
      .map((r) => list(r.userAgent)[0])
      .filter((n) => AI_CRAWLERS.includes(n));
    expect(aiNames.sort()).toEqual([...AI_CRAWLERS].sort());
    for (const name of AI_CRAWLERS) {
      expect(group(name)).toHaveLength(1);
      expect(list(group(name)[0].allow)).toContain('/');
    }
  });

  it.each(['*', ...SEARCH_ENGINES, ...AI_CRAWLERS])('%s group disallows all private paths', (name) => {
    const g = group(name);
    expect(g).toHaveLength(1);
    expect(list(g[0].disallow)).toEqual(expect.arrayContaining(PRIVATE_PATHS));
  });

  it.each([...SEARCH_ENGINES, ...AI_CRAWLERS])('%s group does not disallow /_next/', (name) => {
    expect(list(group(name)[0].disallow)).not.toContain('/_next/');
  });

  it('the default group still disallows /_next/', () => {
    expect(list(group('*')[0].disallow)).toContain('/_next/');
  });

  it.each(BLOCKED_SCRAPERS)('%s is still blocked from the whole site', (name) => {
    const g = group(name);
    expect(g).toHaveLength(1);
    expect(list(g[0].disallow)).toContain('/');
  });
});
