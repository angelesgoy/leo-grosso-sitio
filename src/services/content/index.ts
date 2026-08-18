import type { ContentItem } from './model.ts';
import { deduplicateContent } from './deduplicate.ts';
import { normalizeLocalRecord } from './normalize.ts';
import { articleRecords, createArticleRecords } from './sources/articles.ts';
import { pendingSocialRecords } from './sources/local.ts';
import { validateContentCollection } from './validate.ts';
import { getArticlesFromSanity } from '../sanity/client.ts';
import type { Article } from '../../types/content.ts';

/**
 * Obtiene la lista de artículos (desde Sanity CMS o fallback local).
 */
export async function getArticles(): Promise<Article[]> {
  return getArticlesFromSanity();
}

/**
 * Genera el feed público unificado de contenidos ("Lo último"),
 * incorporando automáticamente los artículos del CMS como tipo `article`.
 */
export async function getFeed(customArticles?: Article[]): Promise<ContentItem[]> {
  const articles = customArticles || await getArticles();
  const recordsArticles = createArticleRecords(articles);

  const primaryArticles = recordsArticles.filter((item) => item.featured);
  const archiveArticles = recordsArticles.filter((item) => !item.featured);
  const records = [...primaryArticles, ...archiveArticles, ...pendingSocialRecords];
  const normalized = records.map(normalizeLocalRecord);
  const validated = validateContentCollection(normalized);
  return deduplicateContent(validated);
}

/**
 * Función de respaldo síncrono para pruebas y entornos estáticos puros.
 */
export function getFeedSync(): ContentItem[] {
  const primaryArticles = articleRecords.filter((item) => item.featured);
  const archiveArticles = articleRecords.filter((item) => !item.featured);
  const records = [...primaryArticles, ...archiveArticles, ...pendingSocialRecords];
  const normalized = records.map(normalizeLocalRecord);
  const validated = validateContentCollection(normalized);
  return deduplicateContent(validated);
}

export type { ContentItem } from './model.ts';
