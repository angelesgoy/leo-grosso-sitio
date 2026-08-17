import type { ContentItem } from './model.ts';
import { deduplicateContent } from './deduplicate.ts';
import { normalizeLocalRecord } from './normalize.ts';
import { articleRecords } from './sources/articles.ts';
import { pendingSocialRecords } from './sources/local.ts';
import { validateContentCollection } from './validate.ts';

export function getFeed(): ContentItem[] {
  const primaryArticles = articleRecords.filter((item) => item.featured);
  const archiveArticles = articleRecords.filter((item) => !item.featured);
  const records = [...primaryArticles, ...archiveArticles, ...pendingSocialRecords];
  const normalized = records.map(normalizeLocalRecord);
  const validated = validateContentCollection(normalized);
  return deduplicateContent(validated);
}

export type { ContentItem } from './model.ts';
