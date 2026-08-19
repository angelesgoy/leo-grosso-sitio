import type { LocalContentRecord } from '../model.ts';

export const pendingSocialRecords: LocalContentRecord[] = [
  {
    id: 'ph-ig', source: 'instagram', type: 'placeholder', feedCategory: 'redes',
    title: 'FEED Instagram · PENDIENTE DE INTEGRACIÓN',
    excerpt: 'La conexión con la cuenta oficial @leon_grosso se activará en la próxima etapa técnica.',
    authorName: 'Leon Grosso', authorHandle: '@leon_grosso', verified: false,
    editorialStatus: 'reviewed', integrationStatus: 'pending', provider: 'Configuración local'
  },
  {
    id: 'ph-tt', source: 'tiktok', type: 'placeholder', feedCategory: 'redes',
    title: 'FEED TikTok · PENDIENTE DE INTEGRACIÓN',
    excerpt: 'La integración del canal oficial está prevista en la capa de servicios.',
    authorName: 'Leon Grosso', authorHandle: '@leon_grosso', verified: false,
    editorialStatus: 'reviewed', integrationStatus: 'pending', provider: 'Configuración local'
  },
  {
    id: 'ph-x', source: 'x', type: 'placeholder', feedCategory: 'redes',
    title: 'FEED X · PENDIENTE DE INTEGRACIÓN',
    excerpt: 'Conexión a la cuenta oficial @Leonardo_Grosso pendiente de configuración.',
    authorName: 'Leon Grosso', authorHandle: '@Leonardo_Grosso', verified: false,
    editorialStatus: 'reviewed', integrationStatus: 'pending', provider: 'Configuración local'
  },
  {
    id: 'ph-fb', source: 'facebook', type: 'placeholder', feedCategory: 'redes',
    title: 'FEED Facebook · PENDIENTE DE INTEGRACIÓN',
    excerpt: 'La integración del perfil público se activará junto con el resto de redes.',
    authorName: 'Leon Grosso', authorHandle: 'grossoleonardo', verified: false,
    editorialStatus: 'reviewed', integrationStatus: 'pending', provider: 'Configuración local'
  }
];
