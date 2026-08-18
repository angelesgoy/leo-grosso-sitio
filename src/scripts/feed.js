const buttons = [...document.querySelectorAll('[data-feed-filter]')];
const liveRegion = document.getElementById('feed-status');

// Sincronizar artículos en vivo desde Sanity CMS en las secciones público (Lo Último / Inicio)
async function syncSanityFeed() {
  const grid = document.getElementById('feed-grid');
  if (!grid) return;

  try {
    const query = encodeURIComponent(`*[_type == "article" && !(_id in path("drafts.**")) && (status == "published" || !defined(status))] | order(publishedAt desc) {
      _id, title, "slug": slug.current, publication, publishedAt, excerpt, image, externalUrl, featured
    }`);

    const res = await fetch(`https://j4xtzihv.api.sanity.io/v2024-01-01/data/query/production?query=${query}`);
    if (!res.ok) return;

    const json = await res.json();
    const articles = json.result || [];
    if (articles.length === 0) return;

    // Buscar items existentes de artículos en el grid
    const existingArticleEls = [...grid.querySelectorAll('[data-feed-groups*="artículos"]')];
    
    // Si hay artículos de Sanity, renderizarlos dinámicamente si cambió la cantidad o títulos
    const formattedArticles = articles.map(art => {
      const parts = art.publishedAt ? art.publishedAt.split('T')[0].split('-') : [];
      const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : '';
      let imgUrl = '';
      if (typeof art.image === 'string') {
        imgUrl = art.image;
      } else if (art.image?.asset?._ref) {
        const match = art.image.asset._ref.match(/^image-([a-fA-F0-9]+)-(\d+x\d+)-(\w+)$/);
        if (match) {
          imgUrl = `https://cdn.sanity.io/images/j4xtzihv/production/${match[1]}-${match[2]}.${match[3]}`;
        }
      }

      return {
        id: art._id,
        title: art.title,
        publication: art.publication || 'El Cohete a la Luna',
        date: art.publishedAt || '',
        displayDate: displayDate,
        excerpt: art.excerpt || '',
        url: art.externalUrl || '#',
        image: imgUrl,
        featured: Boolean(art.featured)
      };
    });

    // Reemplazar o insertar en el DOM para actualizar la vista en tiempo real
    if (existingArticleEls.length > 0) {
      existingArticleEls.forEach(el => el.remove());
    }

    const newElementsHTML = formattedArticles.map(art => `
      <article class="feed-item span-4" data-feed-item data-feed-groups="artículos">
        <div class="feed-item-media square">
          ${art.image 
            ? `<img src="${art.image}" alt="${art.title}" width="1200" height="1200" loading="lazy" decoding="async" />` 
            : `<span class="feed-item-media-label">Imagen · 1:1</span>`}
        </div>
        <div class="feed-item-meta">
          <span>ARTÍCULO · ${art.publication.toUpperCase()}</span>
          ${art.displayDate ? `<span class="sep">·</span><time datetime="${art.date}">${art.displayDate}</time>` : ''}
        </div>
        <h3 class="feed-item-title">${art.title}</h3>
        <p class="feed-item-excerpt">${art.excerpt}</p>
        ${art.url ? `<div class="feed-link"><a href="${art.url}" target="_blank" rel="noopener noreferrer" class="link-arrow">Ver <span class="arrow">↗</span></a></div>` : ''}
      </article>
    `).join('');

    grid.insertAdjacentHTML('afterbegin', newElementsHTML);
    updateFilterCounts();

  } catch (e) {
    // Si falla la red, conserva el HTML estático pre-renderizado sin interrumpir al usuario
  }
}

function updateFilterCounts() {
  const currentItems = [...document.querySelectorAll('[data-feed-item]')];
  const activeBtn = document.querySelector('[data-feed-filter].active');
  const filter = activeBtn ? activeBtn.dataset.feedFilter : 'todo';

  let visible = 0;
  currentItems.forEach((item) => {
    const groups = (item.dataset.feedGroups || '').split(' ');
    const show = filter === 'todo' || groups.includes(filter);
    item.hidden = !show;
    if (show) visible += 1;
  });
  if (liveRegion) liveRegion.textContent = `${visible} contenidos visibles`;
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.feedFilter;
    buttons.forEach((candidate) => {
      const active = candidate === button;
      candidate.classList.toggle('active', active);
      candidate.setAttribute('aria-pressed', String(active));
    });
    updateFilterCounts();
  });
});

syncSanityFeed();
