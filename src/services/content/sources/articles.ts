import { data } from '../../../data/content.js';
import type { LocalContentRecord } from '../model.ts';

export const articleRecords: LocalContentRecord[] = data.articles.map((article) => ({
  id: `article-${article.id}`,
  source: 'article',
  sourceId: article.id,
  type: 'article',
  feedCategory: 'artículos',
  title: article.title,
  excerpt: article.excerpt,
  externalUrl: article.url,
  canonicalUrl: article.url,
  displayDate: article.year,
  authorName: article.author,
  media: article.image ? [{ type: 'image', url: article.image, alt: article.imageAlt }] : [],
  featured: article.featured || false,
  verified: true,
  editorialStatus: article.featured ? 'selected' : 'reviewed',
  integrationStatus: 'manual',
  provider: article.publication
}));
