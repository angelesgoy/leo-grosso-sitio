import { data as fallbackData } from '../../data/content.js';
import type { Article } from '../../types/content.ts';

const PROJECT_ID = import.meta.env.PUBLIC_SANITY_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '';
const DATASET = import.meta.env.PUBLIC_SANITY_DATASET || process.env.PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production';
const API_VERSION = import.meta.env.PUBLIC_SANITY_API_VERSION || process.env.PUBLIC_SANITY_API_VERSION || 'v2024-01-01';

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

  // Formato _ref: image-3a87d6...-1920x1080-webp
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
      console.warn(`[Sanity] Respuesta HTTP ${res.status}. Usando fallback local.`);
      return fallbackData.articles as Article[];
    }

    const json = await res.json();
    const rawArticles = json.result || [];

    if (!Array.isArray(rawArticles) || rawArticles.length === 0) {
      return fallbackData.articles as Article[];
    }

    return rawArticles.map((item: any) => {
      const imgData = buildSanityImageUrl(item.image);
      const publishedDate = item.publishedAt ? item.publishedAt.split('T')[0] : '';
      return {
        id: item.slug || item._id,
        title: item.title || '',
        publication: item.publication || 'El Cohete a la Luna',
        date: publishedDate,
        displayDate: formatDisplayDate(publishedDate),
        author: item.authors || 'Leonardo Grosso',
        excerpt: item.excerpt || '',
        url: item.externalUrl || '',
        image: imgData.url,
        imageAlt: imgData.alt || item.title,
        featured: Boolean(item.featured)
      };
    });
  } catch (err) {
    console.warn('[Sanity] Error al conectar con Sanity API. Usando fallback local.', err);
    return fallbackData.articles as Article[];
  }
}
