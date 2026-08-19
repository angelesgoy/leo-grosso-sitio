/**
 * Cloudflare Pages Function: /api/sanity-mutate
 * 
 * Intermediario seguro para Cloudflare Pages entre el panel /admin/ y Sanity API.
 * El token de escritura reside exclusivamente en el entorno del servidor (Edge Worker).
 */

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}

export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  try {
    const body = await context.request.json();
    const { password, action, mutations, contentType, imageData } = body;

    const ADMIN_PASSWORD = context.env?.ADMIN_PASSWORD || 'WebEquipoGrosso2026';
    if (!password || password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: corsHeaders });
    }

    const SANITY_TOKEN = context.env?.SANITY_API_TOKEN || 'sk806I9qenm35RbkEJX0XlX4VSndFEu6DPy9fbgQEBLBfyXWygkFGNvH4QHa29WYYnMaEVvwwQhXOg6J9jcrJgn3X1IgOOOEEIRbjGBSzNwYok4M0GBSKFVvf8KUwKrXr0hRISeijyWToqHacho1TddhuRtyOBl6nUpoyB9L2VP8lL71JJFX';
    const PROJECT_ID = 'j4xtzihv';
    const DATASET = 'production';

    if (action === 'validate') {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders });
    }

    if (action === 'mutate' && mutations) {
      const res = await fetch(`https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SANITY_TOKEN}`
        },
        body: JSON.stringify({ mutations })
      });
      const data = await res.text();
      return new Response(data, { status: res.status, headers: corsHeaders });
    }

    if (action === 'upload' && imageData && contentType) {
      const binaryString = atob(imageData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const res = await fetch(`https://${PROJECT_ID}.api.sanity.io/v2024-01-01/assets/images/${DATASET}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SANITY_TOKEN}`,
          'Content-Type': contentType
        },
        body: bytes
      });
      const data = await res.text();
      return new Response(data, { status: res.status, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Acción no válida' }), { status: 400, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}
