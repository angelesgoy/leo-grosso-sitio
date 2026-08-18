import { data } from '../../../data/content.js';
import type { Article } from '../../../types/content.ts';
import type { LocalContentRecord } from '../model.ts';

export function createArticleRecords(articlesList?: Article[]): LocalContentRecord[] {
  const sourceArticles = articlesList && articlesList.length > 0 ? articlesList : (data.articles as Article[]);

  return sourceArticles.map((article) => ({
    id: `article-${article.id}`,
    source: 'article',
    sourceId: article.id,
    type: 'article',
    feedCategory: 'artículos',
    title: article.title,
    excerpt: article.excerpt,
    externalUrl: article.url,
    canonicalUrl: article.url,
    publishedAt: article.date,
    displayDate: article.displayDate,
    authorName: article.author,
    media: article.image ? [{ type: 'image', url: article.image, alt: article.imageAlt }] : [],
    featured: article.featured || false,
    verified: true,
    editorialStatus: article.featured ? 'selected' : 'reviewed',
    integrationStatus: 'manual',
    provider: article.publication
  }));
}

export const articleRecords: LocalContentRecord[] = createArticleRecords();
