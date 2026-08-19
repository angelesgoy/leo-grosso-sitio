import type { ContentSource, FeedCategory, IntegrationStatus } from './model.ts';

export type SourceDefinition = {
  id: ContentSource;
  label: string;
  handle?: string;
  profileUrl?: string;
  category: FeedCategory;
  integrationStatus: IntegrationStatus;
};

export const sourceRegistry: Record<ContentSource, SourceDefinition> = {
  instagram: { id: 'instagram', label: 'Instagram · @leon_grosso', handle: '@leon_grosso', profileUrl: 'https://www.instagram.com/leon_grosso/', category: 'redes', integrationStatus: 'pending' },
  tiktok: { id: 'tiktok', label: 'TikTok · @leon_grosso', handle: '@leon_grosso', profileUrl: 'https://www.tiktok.com/@leon_grosso', category: 'redes', integrationStatus: 'pending' },
  x: { id: 'x', label: 'X · @Leonardo_Grosso', handle: '@Leonardo_Grosso', profileUrl: 'https://x.com/Leonardo_Grosso', category: 'redes', integrationStatus: 'pending' },
  facebook: { id: 'facebook', label: 'Facebook · grossoleonardo', handle: 'grossoleonardo', profileUrl: 'https://www.facebook.com/grossoleonardo/', category: 'redes', integrationStatus: 'pending' },
  article: { id: 'article', label: 'Artículo', category: 'artículos', integrationStatus: 'manual' },
  news: { id: 'news', label: 'Noticia', category: 'noticias', integrationStatus: 'manual' },
  press: { id: 'press', label: 'Prensa', category: 'artículos', integrationStatus: 'manual' },
  activity: { id: 'activity', label: 'Actividad', category: 'gestión', integrationStatus: 'manual' },
  iduar: { id: 'iduar', label: 'IDUAR · Moreno', profileUrl: 'https://iduar.moreno.gob.ar/', category: 'gestión', integrationStatus: 'manual' }
};

