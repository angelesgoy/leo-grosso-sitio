import { data } from '../../../data/content.js';
import type { NewsItem } from '../../../types/content.ts';
import type { LocalContentRecord } from '../model.ts';

export function createNewsRecords(newsList?: NewsItem[]): LocalContentRecord[] {
  const sourceNews = newsList && newsList.length > 0 ? newsList : ((data.news || []) as NewsItem[]);

  return sourceNews.map((item) => ({
    id: `news-${item.id}`,
    source: 'news',
    sourceId: item.id,
    type: 'news',
    feedCategory: 'noticias',
    title: item.title,
    excerpt: item.excerpt,
    externalUrl: item.url,
    canonicalUrl: item.url,
    publishedAt: item.date,
    displayDate: item.displayDate,
    authorName: item.publication,
    media: item.image ? [{ type: 'image', url: item.image, alt: item.imageAlt || item.title }] : [],
    featured: item.featured || false,
    verified: true,
    editorialStatus: item.featured ? 'selected' : 'reviewed',
    integrationStatus: 'manual',
    provider: item.publication
  }));
}

export const newsRecords: LocalContentRecord[] = createNewsRecords();
