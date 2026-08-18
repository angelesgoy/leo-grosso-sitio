/**
 * Script de migración de artículos locales a Sanity CMS.
 *
 * Uso:
 * 1. Configura tus variables de entorno SANITY_PROJECT_ID y SANITY_API_TOKEN.
 * 2. Ejecuta: node scripts/seed-sanity.mjs
 */

import { data } from '../src/data/content.js';

const PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const DATASET = process.env.PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production';
const TOKEN = process.env.SANITY_API_TOKEN;

if (!PROJECT_ID || !TOKEN) {
  console.log('\n--- SCRIPT DE MIGRACIÓN A SANITY ---');
  console.log('Faltan variables de entorno para ejecutar la migración automática.');
  console.log('Asegúrate de definir:');
  console.log('  export SANITY_PROJECT_ID="tu-project-id"');
  console.log('  export SANITY_API_TOKEN="tu-token-con-permiso-de-escritura"');
  console.log('\nGenerando archivo NDJSON listo para importar manualmente con Sanity CLI:\n');

  const ndjsonLines = data.articles.map((art) => {
    return JSON.stringify({
      _type: 'article',
      _id: `article-${art.id}`,
      title: art.title,
      slug: { _type: 'slug', current: art.id },
      authors: art.author,
      publication: art.publication,
      publishedAt: art.date,
      excerpt: art.excerpt,
      externalUrl: art.url,
      featured: Boolean(art.featured),
      status: 'published'
    });
  });

  console.log(ndjsonLines.join('\n'));
  console.log('\nPuedes guardar esto como articles.ndjson y ejecutar:');
  console.log('npx sanity dataset import articles.ndjson production\n');
  process.exit(0);
}

const url = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}`;

const mutations = data.articles.map((art) => ({
  createOrReplace: {
    _type: 'article',
    _id: `article-${art.id}`,
    title: art.title,
    slug: { _type: 'slug', current: art.id },
    authors: art.author,
    publication: art.publication,
    publishedAt: art.date,
    excerpt: art.excerpt,
    externalUrl: art.url,
    featured: Boolean(art.featured),
    status: 'published'
  }
}));

console.log(`Migrando ${mutations.length} artículos a Sanity (Project ID: ${PROJECT_ID}, Dataset: ${DATASET})...`);

try {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ mutations })
  });

  if (res.ok) {
    const result = await res.json();
    console.log('✅ ¡Migración completada con éxito en Sanity!');
    console.log(result);
  } else {
    const errorText = await res.text();
    console.error(`❌ Error en la migración (${res.status}):`, errorText);
  }
} catch (err) {
  console.error('❌ Error de conexión al migrar:', err);
}
