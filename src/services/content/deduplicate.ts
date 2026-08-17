import type { ContentItem } from './model.ts';

function canonicalKey(url: string): string {
  const parsed = new URL(url);
  parsed.hash = '';
  parsed.search = '';
  return parsed.toString().replace(/\/$/, '').toLowerCase();
}

export function deduplicateContent(items: ContentItem[]): ContentItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const keys = [`id:${item.id}`];
    if (item.sourceId) keys.push(`source:${item.source}:${item.sourceId}`);
    if (item.canonicalUrl) keys.push(`url:${canonicalKey(item.canonicalUrl)}`);
    if (keys.some((key) => seen.has(key))) return false;
    keys.forEach((key) => seen.add(key));
    return true;
  });
}
