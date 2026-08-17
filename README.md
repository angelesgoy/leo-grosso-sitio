# Leo Grosso · Web personal

Proyecto de producción construido a partir de la maqueta visual aprobada
`Qwen_html_20260817_ky5owitxd.html`.

## Principios

- La maqueta original se conserva intacta como referencia visual.
- El contenido editorial está separado de la presentación.
- Las páginas se generan como HTML estático.
- Los servicios externos futuros no se conectan directamente desde el navegador.
- No se incorporan afirmaciones o declaraciones sin fuente verificable.

## Desarrollo local

Requiere Node.js 22 y pnpm.

```bash
pnpm install
pnpm dev
```

## Validación y producción

```bash
pnpm run build
pnpm preview
```

Las pruebas del modelo de contenido se ejecutan con `pnpm test`.

El resultado se genera en `dist/`. Netlify usa la configuración declarada en
`netlify.toml` y GitHub Actions ejecuta la misma validación en cada cambio.

## Estructura

- `src/pages`: rutas públicas.
- `src/components`: componentes visuales reutilizables.
- `src/data`: contenido y configuración editorial.
- `src/styles`: tokens y estilos de la maqueta aprobada.
- `src/scripts`: interacción progresiva del menú y el feed.
- `src/services/content`: contrato común, fuentes, normalización, deduplicación y validación del feed.
- `src/types`: contratos internos del contenido.
- `public`: archivos estáticos.

## Pendiente antes del lanzamiento oficial

- Definir dominio canónico.
- Incorporar favicon e imagen social aprobados.
- Reemplazar las fotografías provisorias por los originales aprobados por Leo y su equipo.
- Verificar editorialmente afirmaciones, fechas y enlaces externos.
- Conectar el repositorio de GitHub a Netlify cuando la cuenta permita habilitar el despliegue continuo.
- Habilitar la indexación en `BaseLayout.astro` y `public/robots.txt`.
