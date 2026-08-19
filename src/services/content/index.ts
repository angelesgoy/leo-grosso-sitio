import type { ContentItem } from './model.ts';
import { deduplicateContent } from './deduplicate.ts';
import { normalizeLocalRecord } from './normalize.ts';
import { articleRecords, createArticleRecords } from './sources/articles.ts';
import { newsRecords, createNewsRecords } from './sources/news.ts';
import { pendingSocialRecords } from './sources/local.ts';
import { validateContentCollection } from './validate.ts';
import { getArticlesFromSanity, getNewsFromSanity } from '../sanity/client.ts';
import type { Article, NewsItem } from '../../types/content.ts';

/**
 * Obtiene la lista de artículos (desde Sanity CMS o fallback local).
 */
export async function getArticles(): Promise<Article[]> {
  return getArticlesFromSanity();
}

/**
 * Obtiene la lista de noticias de prensa (desde Sanity CMS o fallback local).
 */
export async function getNews(): Promise<NewsItem[]> {
  return getNewsFromSanity();
}

/**
 * Genera el feed público unificado de contenidos ("Lo último"),
 * incorporando automáticamente noticias y artículos del CMS.
 */
export async function getFeed(customArticles?: Article[], customNews?: NewsItem[]): Promise<ContentItem[]> {
  const articles = customArticles || await getArticles();
  const news = customNews || await getNews();

  const recordsArticles = createArticleRecords(articles);
  const recordsNews = createNewsRecords(news);

  const featuredItems = [...recordsNews.filter((i) => i.featured), ...recordsArticles.filter((i) => i.featured)];
  const regularItems = [...recordsNews.filter((i) => !i.featured), ...recordsArticles.filter((i) => !i.featured)];

  const records = [...featuredItems, ...regularItems, ...pendingSocialRecords];
  const normalized = records.map(normalizeLocalRecord);
  const validated = validateContentCollection(normalized);
  return deduplicateContent(validated);
}

/**
 * Función de respaldo síncrono para pruebas y entornos estáticos puros.
 */
export function getFeedSync(): ContentItem[] {
  const featuredItems = [...newsRecords.filter((i) => i.featured), ...articleRecords.filter((i) => i.featured)];
  const regularItems = [...newsRecords.filter((i) => !i.featured), ...articleRecords.filter((i) => !i.featured)];
  const records = [...featuredItems, ...regularItems, ...pendingSocialRecords];
  const normalized = records.map(normalizeLocalRecord);
  const validated = validateContentCollection(normalized);
  return deduplicateContent(validated);
}

export type { ContentItem } from './model.ts';
