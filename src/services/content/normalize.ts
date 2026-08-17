import type { ContentItem, LocalContentRecord } from './model.ts';
import { sourceRegistry } from './sources.ts';

export function normalizeLocalRecord(record: LocalContentRecord): ContentItem {
  const source = sourceRegistry[record.source];
  if (record.feedCategory !== source.category) {
    throw new Error(`Contenido ${record.id}: categoría incompatible con la fuente ${record.source}`);
  }
  if (record.integrationStatus !== source.integrationStatus) {
    throw new Error(`Contenido ${record.id}: estado incompatible con la fuente ${record.source}`);
  }
  return {
    id: record.id,
    source: record.source,
    sourceId: record.sourceId,
    sourceLabel: source.label,
    type: record.type,
    feedCategory: source.category,
    title: record.title,
    excerpt: record.excerpt,
    externalUrl: record.externalUrl,
    canonicalUrl: record.canonicalUrl,
    publishedAt: record.publishedAt,
    displayDate: record.displayDate,
    author: { name: record.authorName || 'Leo Grosso', handle: record.authorHandle || source.handle },
    media: record.media || [],
    topics: record.topics || [],
    territory: record.territory,
    featured: record.featured || false,
    verified: record.verified,
    editorialStatus: record.editorialStatus,
    integrationStatus: record.integrationStatus,
    provenance: { provider: record.provider, sourceUrl: record.externalUrl || source.profileUrl }
  };
}
