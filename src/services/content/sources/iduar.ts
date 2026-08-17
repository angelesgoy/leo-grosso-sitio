import { data } from '../../../data/content.js';
import type { LocalContentRecord } from '../model.ts';

const IDUAR_HOME = 'https://iduar.moreno.gob.ar/';

export const iduarRecords: LocalContentRecord[] = data.projects.map((project) => ({
  id: `iduar-${project.num}`,
  source: 'iduar',
  sourceId: project.num,
  type: 'management',
  feedCategory: 'gestión',
  title: project.title,
  excerpt: project.sub,
  externalUrl: project.url,
  canonicalUrl: project.url === IDUAR_HOME ? undefined : project.url,
  authorName: 'IDUAR',
  topics: [project.cat],
  territory: 'Moreno',
  featured: false,
  verified: true,
  editorialStatus: 'selected',
  integrationStatus: 'manual',
  provider: 'IDUAR · Moreno'
}));
