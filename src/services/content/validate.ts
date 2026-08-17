import { CONTENT_SOURCES, CONTENT_TYPES, EDITORIAL_STATUSES, FEED_CATEGORIES, INTEGRATION_STATUSES, type ContentItem } from './model.ts';

function isHttpsUrl(value: string): boolean {
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

function requireText(value: string, field: string, id: string): void {
  if (!value.trim()) throw new Error(`Contenido ${id}: falta ${field}`);
  if (/[<>]/.test(value)) throw new Error(`Contenido ${id}: ${field} no admite HTML`);
}

export function validateContentItem(item: ContentItem): void {
  requireText(item.id, 'id', item.id || 'sin-id');
  requireText(item.title, 'title', item.id);
  requireText(item.excerpt, 'excerpt', item.id);
  requireText(item.sourceLabel, 'sourceLabel', item.id);
  requireText(item.author.name, 'author.name', item.id);
  requireText(item.provenance.provider, 'provenance.provider', item.id);
  if (!CONTENT_SOURCES.includes(item.source)) throw new Error(`Contenido ${item.id}: fuente inválida`);
  if (!CONTENT_TYPES.includes(item.type)) throw new Error(`Contenido ${item.id}: tipo inválido`);
  if (!FEED_CATEGORIES.includes(item.feedCategory)) throw new Error(`Contenido ${item.id}: categoría inválida`);
  if (!EDITORIAL_STATUSES.includes(item.editorialStatus)) throw new Error(`Contenido ${item.id}: estado editorial inválido`);
  if (!INTEGRATION_STATUSES.includes(item.integrationStatus)) throw new Error(`Contenido ${item.id}: estado de integración inválido`);
  if (item.externalUrl && !isHttpsUrl(item.externalUrl)) throw new Error(`Contenido ${item.id}: externalUrl debe usar HTTPS`);
  if (item.canonicalUrl && !isHttpsUrl(item.canonicalUrl)) throw new Error(`Contenido ${item.id}: canonicalUrl debe usar HTTPS`);
  if (item.provenance.sourceUrl && !isHttpsUrl(item.provenance.sourceUrl)) throw new Error(`Contenido ${item.id}: sourceUrl debe usar HTTPS`);
  if (item.integrationStatus === 'pending' && item.verified) throw new Error(`Contenido ${item.id}: integración pendiente no puede estar verificada`);
  if (item.verified && !item.provenance.sourceUrl) throw new Error(`Contenido ${item.id}: contenido verificado sin fuente`);
  if (item.verified && !item.externalUrl) throw new Error(`Contenido ${item.id}: contenido verificado sin enlace externo`);
  if (item.publishedAt && Number.isNaN(Date.parse(item.publishedAt))) throw new Error(`Contenido ${item.id}: fecha inválida`);
  if (item.updatedAt && Number.isNaN(Date.parse(item.updatedAt))) throw new Error(`Contenido ${item.id}: fecha de actualización inválida`);
  if (item.provenance.fetchedAt && Number.isNaN(Date.parse(item.provenance.fetchedAt))) throw new Error(`Contenido ${item.id}: fecha de consulta inválida`);
  item.topics.forEach((topic) => requireText(topic, 'topics', item.id));
  item.media.forEach((media) => {
    if (!['image', 'video'].includes(media.type)) throw new Error(`Contenido ${item.id}: tipo de medio inválido`);
    if (!isHttpsUrl(media.url)) throw new Error(`Contenido ${item.id}: medio debe usar HTTPS`);
    if (media.alt) requireText(media.alt, 'media.alt', item.id);
    if (media.width !== undefined && media.width <= 0) throw new Error(`Contenido ${item.id}: ancho de medio inválido`);
    if (media.height !== undefined && media.height <= 0) throw new Error(`Contenido ${item.id}: alto de medio inválido`);
  });
}

export function validateContentCollection(items: ContentItem[]): ContentItem[] {
  const ids = new Set<string>();
  items.forEach((item) => {
    validateContentItem(item);
    if (ids.has(item.id)) throw new Error(`ID de contenido duplicado: ${item.id}`);
    ids.add(item.id);
  });
  return items;
}
