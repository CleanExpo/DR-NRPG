/**
 * Schema.org AggregateRating built only from real, published reviews.
 *
 * A star rating may reach structured data only when it is backed by published
 * client reviews (Rating rows with isPublished = true). With no published
 * reviews there is nothing to aggregate, so no rating is returned. The review
 * count is the number of published reviews, never jobs completed or an
 * estimate.
 */
export interface SchemaAggregateRating {
  '@type': 'AggregateRating';
  ratingValue: string;
  reviewCount: number;
  bestRating: '5';
  worstRating: '1';
}

export function buildAggregateRating(
  averageRating: number | string | { toString(): string } | null | undefined,
  publishedReviewCount: number
): SchemaAggregateRating | undefined {
  if (!Number.isInteger(publishedReviewCount) || publishedReviewCount < 1) return undefined;
  const value = Number(averageRating?.toString());
  if (!Number.isFinite(value) || value < 1 || value > 5) return undefined;
  return {
    '@type': 'AggregateRating',
    ratingValue: value.toFixed(1),
    reviewCount: publishedReviewCount,
    bestRating: '5',
    worstRating: '1',
  };
}
