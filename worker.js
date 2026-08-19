/**
 * worker.js — Cloudflare Worker entry point
 *
 * Maneja la ruta segura /api/sanity-mutate en el servidor.
 * Todo lo demás se sirve desde los assets estáticos (dist/).
 */

const PROJECT_ID = 'j4xtzihv';
const DATASET = 'production';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Ruta segura de la API — se procesa en el servidor, nunca en el navegador
    if (url.pathname === '/api/sanity-mutate') {
      return handleSanityMutate(request, env);
    }

    // Todo lo demás → activos estáticos (HTML, CSS, JS, imágenes)
    return env.ASSETS.fetch(request);
  }
};

async function handleSanityMutate(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: CORS });
  }

  const { password, action, mutations, contentType, imageData } = body;

  // ── Validación de contraseña (servidor) ──────────────────────────────────
  const ADMIN_PASSWORD = env.ADMIN_PASSWORD || 'WebEquipoGrosso2026';
  if (!password || password !== ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: CORS });
  }

  // ── Token de Sanity (solo en el servidor, nunca en el navegador) ──────────
  const SANITY_TOKEN = env.SANITY_API_TOKEN || 'sk806I9qenm35RbkEJX0XlX4VSndFEu6DPy9fbgQEBLBfyXWygkFGNvH4QHa29WYYnMaEVvwwQhXOg6J9jcrJgn3X1IgOOOEEIRbjGBSzNwYok4M0GBSKFVvf8KUwKrXr0hRISeijyWToqHacho1TddhuRtyOBl6nUpoyB9L2VP8lL71JJFX';

  if (action === 'validate') {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: CORS });
  }

  if (action === 'mutate' && mutations) {
    const res = await fetch(`https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SANITY_TOKEN}` },
      body: JSON.stringify({ mutations })
    });
    const data = await res.text();
    return new Response(data, { status: res.status, headers: CORS });
  }

  if (action === 'upload' && imageData && contentType) {
    const binaryString = atob(imageData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

    const res = await fetch(`https://${PROJECT_ID}.api.sanity.io/v2024-01-01/assets/images/${DATASET}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SANITY_TOKEN}`, 'Content-Type': contentType },
      body: bytes
    });
    const data = await res.text();
    return new Response(data, { status: res.status, headers: CORS });
  }

  return new Response(JSON.stringify({ error: 'Acción no reconocida' }), { status: 400, headers: CORS });
}
