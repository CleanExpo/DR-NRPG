/**
 * @jest-environment node
 *
 * CodeQL js/regex-injection (alert #142): highlightMatch built a RegExp straight
 * from the user's search query, so regex metacharacters were interpreted (and an
 * unbalanced "(" threw). Query terms must be matched literally.
 */

import { describe, it, expect } from '@jest/globals';

jest.mock('@/lib/prisma', () => ({ prisma: {} }));

import { highlightMatch } from '@/lib/search/postgres-search';

describe('highlightMatch treats query terms as literal text', () => {
  it('does not throw on an unbalanced regex metacharacter', () => {
    expect(() => highlightMatch('Burst pipe (kitchen', '(')).not.toThrow();
    expect(highlightMatch('Burst pipe (kitchen', '(')).toBe('Burst pipe <mark>(</mark>kitchen');
  });

  it('matches metacharacters literally instead of as a pattern', () => {
    expect(highlightMatch('Price (AUD) 5', '(AUD)')).toBe('Price <mark>(AUD)</mark> 5');
    expect(highlightMatch('abc a.c', 'a.c')).toBe('abc <mark>a.c</mark>');
  });

  it('still highlights plain terms case-insensitively', () => {
    expect(highlightMatch('Water Damage repair', 'water repair')).toBe(
      '<mark>Water</mark> Damage <mark>repair</mark>'
    );
  });
});
