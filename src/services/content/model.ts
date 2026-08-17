export const CONTENT_SOURCES = ['instagram', 'tiktok', 'x', 'facebook', 'article', 'press', 'activity', 'iduar'] as const;
export const CONTENT_TYPES = ['post', 'video', 'article', 'news', 'management', 'activity', 'placeholder'] as const;
export const FEED_CATEGORIES = ['artículos', 'gestión', 'redes'] as const;
export const EDITORIAL_STATUSES = ['automatic', 'reviewed', 'selected'] as const;
export const INTEGRATION_STATUSES = ['active', 'manual', 'pending'] as const;

export type ContentSource = typeof CONTENT_SOURCES[number];
export type ContentType = typeof CONTENT_TYPES[number];
export type FeedCategory = typeof FEED_CATEGORIES[number];
export type EditorialStatus = typeof EDITORIAL_STATUSES[number];
export type IntegrationStatus = typeof INTEGRATION_STATUSES[number];

export type ContentMedia = {
  type: 'image' | 'video';
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type ContentItem = {
  id: string;
  source: ContentSource;
  sourceId?: string;
  sourceLabel: string;
  type: ContentType;
  feedCategory: FeedCategory;
  title: string;
  excerpt: string;
  externalUrl?: string;
  canonicalUrl?: string;
  publishedAt?: string;
  updatedAt?: string;
  displayDate?: string;
  author: {
    name: string;
    handle?: string;
  };
  media: ContentMedia[];
  topics: string[];
  territory?: string;
  featured: boolean;
  verified: boolean;
  editorialStatus: EditorialStatus;
  integrationStatus: IntegrationStatus;
  provenance: {
    provider: string;
    sourceUrl?: string;
    fetchedAt?: string;
  };
};

export type LocalContentRecord = {
  id: string;
  source: ContentSource;
  sourceId?: string;
  type: ContentType;
  feedCategory: FeedCategory;
  title: string;
  excerpt: string;
  externalUrl?: string;
  canonicalUrl?: string;
  publishedAt?: string;
  displayDate?: string;
  authorName?: string;
  authorHandle?: string;
  topics?: string[];
  territory?: string;
  featured?: boolean;
  verified: boolean;
  editorialStatus: EditorialStatus;
  integrationStatus: IntegrationStatus;
  provider: string;
};
