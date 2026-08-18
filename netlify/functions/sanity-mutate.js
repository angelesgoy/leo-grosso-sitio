/**
 * Netlify Serverless Function: sanity-mutate
 * 
 * Intermediario seguro entre el panel /admin/ y la API de Sanity.
 * El token de escritura NUNCA llega al navegador — vive solo aquí, en el servidor.
 * 
 * Acepta dos acciones:
 *   - mutate: ejecuta mutaciones (crear, editar, eliminar, destacar artículos)
 *   - upload: sube una imagen a Sanity CDN
 */

export const handler = async (event) => {
  // Preflight CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Method not allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'JSON inválido' })
    };
  }

  const { password, action, mutations, contentType, imageData } = body;

  // ─── VALIDACIÓN DE CONTRASEÑA (LADO SERVIDOR) ────────────────────────────
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'WebEquipoGrosso2026';
  if (!password || password !== ADMIN_PASSWORD) {
    return {
      statusCode: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'No autorizado' })
    };
  }

  // ─── TOKEN DE SANITY (SOLO EXISTE EN EL SERVIDOR) ────────────────────────
  const SANITY_TOKEN = process.env.SANITY_API_TOKEN || 'sk806I9qenm35RbkEJX0XlX4VSndFEu6DPy9fbgQEBLBfyXWygkFGNvH4QHa29WYYnMaEVvwwQhXOg6J9jcrJgn3X1IgOOOEEIRbjGBSzNwYok4M0GBSKFVvf8KUwKrXr0hRISeijyWToqHacho1TddhuRtyOBl6nUpoyB9L2VP8lL71JJFX';
  if (!SANITY_TOKEN) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Token de servidor no configurado.' })
    };
  }

  const PROJECT_ID = 'j4xtzihv';
  const DATASET = 'production';

  try {
    // ─── ACCIÓN: VALIDAR CONTRASEÑA ────────────────────────────────────────
    if (action === 'validate') {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true })
      };
    }

    // ─── ACCIÓN: MUTACIONES (crear, editar, eliminar, destacar) ───────────
    if (action === 'mutate' && mutations) {
      const res = await fetch(
        `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SANITY_TOKEN}`
          },
          body: JSON.stringify({ mutations })
        }
      );
      const data = await res.json();
      return {
        statusCode: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
    }

    // ─── ACCIÓN: SUBIR IMAGEN ─────────────────────────────────────────────
    if (action === 'upload' && imageData && contentType) {
      const buffer = Buffer.from(imageData, 'base64');
      const res = await fetch(
        `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/assets/images/${DATASET}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SANITY_TOKEN}`,
            'Content-Type': contentType
          },
          body: buffer
        }
      );
      const data = await res.json();
      return {
        statusCode: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
    }

    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Acción no reconocida' })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
