export const articleType = {
  name: 'article',
  title: 'Artículo',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (Rule: any) => Rule.required().error('El título es obligatorio'),
    },
    {
      name: 'slug',
      title: 'Slug (URL id)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'authors',
      title: 'Autor / Coautores',
      type: 'string',
      initialValue: 'Leonardo Grosso',
      description: 'Ejemplo: "Leonardo Grosso" o "Leonardo Grosso + Vanina Pasik"',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'publication',
      title: 'Medio / Publicación',
      type: 'string',
      initialValue: 'El Cohete a la Luna',
      description: 'Nombre del diario o medio donde se publicó',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'publishedAt',
      title: 'Fecha de Publicación',
      type: 'date',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'excerpt',
      title: 'Bajada / Resumen',
      type: 'text',
      rows: 3,
      description: 'Breve resumen del artículo que aparece en la portada y listado',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Imagen del artículo',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Texto alternativo para accesibilidad',
        },
      ],
    },
    {
      name: 'externalUrl',
      title: 'URL externa al artículo',
      type: 'url',
      description: 'Enlace directo al medio original (ej: https://www.elcohetealaluna.com/...)',
      validation: (Rule: any) => Rule.required().uri({ scheme: ['http', 'https'] }),
    },
    {
      name: 'featured',
      title: '¿Destacar en la portada y arriba en Escribe?',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'status',
      title: 'Estado del artículo',
      type: 'string',
      options: {
        list: [
          { title: 'Publicado', value: 'published' },
          { title: 'Borrador', value: 'draft' },
          { title: 'Archivado', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'published',
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'authors',
      publication: 'publication',
      media: 'image',
      featured: 'featured',
      date: 'publishedAt',
    },
    prepare(selection: any) {
      const { title, author, publication, media, featured, date } = selection;
      return {
        title: `${featured ? '⭐ ' : ''}${title}`,
        subtitle: `${publication || ''} · ${author || ''} · ${date || ''}`,
        media,
      };
    },
  },
};
