import { data as fallbackData } from '../../data/content.js';
import type { Article } from '../../types/content.ts';

const PROJECT_ID = (import.meta.env?.PUBLIC_SANITY_PROJECT_ID as string) || 'j4xtzihv';
const DATASET = (import.meta.env?.PUBLIC_SANITY_DATASET as string) || 'production';
const API_VERSION = (import.meta.env?.PUBLIC_SANITY_API_VERSION as string) || 'v2024-01-01';

const fallbackImageMap: Record<string, { image: string; alt?: string }> = {
  'a-las-armas': { image: '/images/principales/articulo-destacado.webp', alt: 'Fachada urbana en San Martín, imagen editorial del artículo A las armas las carga el narco' },
  'a-las-armas-las-carga-el-narco': { image: '/images/principales/articulo-destacado.webp', alt: 'Fachada urbana en San Martín, imagen editorial del artículo A las armas las carga el narco' },
  'article-a-las-armas': { image: '/images/principales/articulo-destacado.webp', alt: 'Fachada urbana en San Martín, imagen editorial del artículo A las armas las carga el narco' },

  'ano-nuevo': { image: '/images/articulos/ano-nuevo-vida-vieja.webp', alt: 'Movilización vecinal con una bandera que reclama justicia' },
  'ano-nuevo-vida-vieja': { image: '/images/articulos/ano-nuevo-vida-vieja.webp', alt: 'Movilización vecinal con una bandera que reclama justicia' },
  'article-ano-nuevo': { image: '/images/articulos/ano-nuevo-vida-vieja.webp', alt: 'Movilización vecinal con una bandera que reclama justicia' },

  'sillas-vacias': { image: '/images/articulos/sillas-vacias.webp', alt: 'Sillas vacías iluminadas sobre un fondo oscuro' },
  'las-sillas-vacias': { image: '/images/articulos/sillas-vacias.webp', alt: 'Sillas vacías iluminadas sobre un fondo oscuro' },
  'article-sillas-vacias': { image: '/images/articulos/sillas-vacias.webp', alt: 'Sillas vacías iluminadas sobre un fondo oscuro' },

  'muertes-anunciadas': { image: '/images/articulos/muertes-anunciadas.webp', alt: 'Ilustración nocturna con figuras y aves bajo un cielo estrellado' },
  'article-muertes-anunciadas': { image: '/images/articulos/muertes-anunciadas.webp', alt: 'Ilustración nocturna con figuras y aves bajo un cielo estrellado' },

  'laberinto': { image: '/images/articulos/laberinto-violencia.webp', alt: 'Ilustración de figuras recorriendo un laberinto circular' },
  'el-laberinto-de-la-violencia': { image: '/images/articulos/laberinto-violencia.webp', alt: 'Ilustración de figuras recorriendo un laberinto circular' },
  'article-laberinto': { image: '/images/articulos/laberinto-violencia.webp', alt: 'Ilustración de figuras recorriendo un laberinto circular' },

  'nueva-ola': { image: '/images/articulos/nueva-ola-asesinatos.webp', alt: 'Operativo policial nocturno frente a una dependencia pública' },
  'una-nueva-ola-de-asesinatos': { image: '/images/articulos/nueva-ola-asesinatos.webp', alt: 'Operativo policial nocturno frente a una dependencia pública' },
  'article-nueva-ola': { image: '/images/articulos/nueva-ola-asesinatos.webp', alt: 'Operativo policial nocturno frente a una dependencia pública' },

  'muertes-ii': { image: '/images/articulos/muertes-no-conmueven-ii.webp', alt: 'Calle barrial con problemas de infraestructura y agua acumulada' },
  'muertes-que-no-conmueven-ii': { image: '/images/articulos/muertes-no-conmueven-ii.webp', alt: 'Calle barrial con problemas de infraestructura y agua acumulada' },
  'article-muertes-ii': { image: '/images/articulos/muertes-no-conmueven-ii.webp', alt: 'Calle barrial con problemas de infraestructura y agua acumulada' },

  'muertes-i': { image: '/images/articulos/muertes-no-conmueven.webp', alt: 'Marcha vecinal con una bandera que reclama justicia' },
  'muertes-que-no-conmueven': { image: '/images/articulos/muertes-no-conmueven.webp', alt: 'Marcha vecinal con una bandera que reclama justicia' },
  'article-muertes-i': { image: '/images/articulos/muertes-no-conmueven.webp', alt: 'Marcha vecinal con una bandera que reclama justicia' }
};

/**
 * Convierte una fecha ISO (YYYY-MM-DD) al formato editorial de la web (DD/MM/YYYY).
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Genera la URL de la CDN de Sanity para una imagen a partir de su _ref.
 */
export function buildSanityImageUrl(image: any): { url?: string; alt?: string } {
  if (!image) return {};
  if (typeof image === 'string') return { url: image };
  if (image.url) return { url: image.url, alt: image.alt };

  const ref = image?.asset?._ref || image?.asset?._id;
  if (!ref || !PROJECT_ID) return {};

  const pattern = /^image-([a-fA-F0-9]+)-(\d+x\d+)-(\w+)$/;
  const match = ref.match(pattern);

  if (!match) return {};
  const [, id, dimensions, format] = match;
  const url = `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}-${dimensions}.${format}`;
  return { url, alt: image.alt || '' };
}

/**
 * Consulta los artículos publicados desde Sanity CMS vía la API pública GROQ.
 * Si Sanity no está configurado o falla, devuelve los artículos fallback locales.
 */
export async function getArticlesFromSanity(): Promise<Article[]> {
  if (!PROJECT_ID || PROJECT_ID === 'demo') {
    return fallbackData.articles as Article[];
  }

  const query = encodeURIComponent(
    `*[_type == "article" && !(_id in path("drafts.**")) && (status == "published" || !defined(status))] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      authors,
      publication,
      publishedAt,
      excerpt,
      image,
      externalUrl,
      featured,
      status
    }`
  );

  const url = `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/query/${DATASET}?query=${query}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      return fallbackData.articles as Article[];
    }

    const json = await res.json();
    const rawArticles = json.result || [];

    if (!Array.isArray(rawArticles) || rawArticles.length === 0) {
      return fallbackData.articles as Article[];
    }

    return rawArticles.map((item: any) => {
      const slugKey = typeof item.slug === 'string' ? item.slug : (item.slug?.current || item._id.replace(/^article-/, ''));
      const localFallback = fallbackImageMap[slugKey] || fallbackImageMap[item._id] || {};
      const imgData = buildSanityImageUrl(item.image);

      const finalImageUrl = imgData.url || localFallback.image;
      const finalImageAlt = imgData.alt || localFallback.alt || item.title;
      const publishedDate = item.publishedAt ? item.publishedAt.split('T')[0] : '';

      return {
        id: slugKey,
        title: item.title || '',
        publication: item.publication || 'El Cohete a la Luna',
        date: publishedDate,
        displayDate: formatDisplayDate(publishedDate),
        author: item.authors || 'Leonardo Grosso',
        excerpt: item.excerpt || '',
        url: item.externalUrl || '',
        image: finalImageUrl,
        imageAlt: finalImageAlt,
        featured: Boolean(item.featured)
      };
    });
  } catch (err) {
    return fallbackData.articles as Article[];
  }
}
