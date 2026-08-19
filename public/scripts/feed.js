// Sincronización en vivo del feed público desde Sanity CMS (Noticias y Artículos separados o unificados según la página)
async function syncSanityFeed() {
  const homeNewsGrid = document.getElementById('home-news-grid');
  const feedGrid = document.getElementById('feed-grid');

  if (!homeNewsGrid && !feedGrid) return;

  try {
    const query = encodeURIComponent(`*[_type in ["article", "news"] && !(_id in path("drafts.**")) && (status == "published" || !defined(status))] | order(publishedAt desc) {
      _id, _type, title, "slug": slug.current, publication, publishedAt, authors, excerpt, image, externalUrl, featured
    }`);

    const res = await fetch(`https://j4xtzihv.api.sanity.io/v2024-01-01/data/query/production?query=${query}`);
    if (!res.ok) return;

    const json = await res.json();
    const items = json.result || [];
    if (items.length === 0) return;

    function formatItem(item) {
      const parts = item.publishedAt ? item.publishedAt.split('T')[0].split('-') : [];
      const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : '';
      let imgUrl = '';
      if (typeof item.image === 'string') {
        imgUrl = item.image;
      } else if (item.image?.asset?._ref) {
        const match = item.image.asset._ref.match(/^image-([a-fA-F0-9]+)-(\d+x\d+)-(\w+)$/);
        if (match) {
          imgUrl = `https://cdn.sanity.io/images/j4xtzihv/production/${match[1]}-${match[2]}.${match[3]}`;
        }
      }

      const isNews = item._type === 'news';
      return {
        id: item._id,
        type: item._type,
        category: isNews ? 'noticias' : 'artículos',
        categoryLabel: isNews ? 'NOTICIA' : 'ARTÍCULO',
        title: item.title,
        publication: item.publication || (isNews ? 'Medio' : 'El Cohete a la Luna'),
        date: item.publishedAt || '',
        displayDate: displayDate,
        excerpt: item.excerpt || '',
        url: item.externalUrl || '#',
        image: imgUrl,
        featured: Boolean(item.featured)
      };
    }

    const formattedAll = items.map(formatItem);

    // ── 1. SI ESTAMOS EN EL HOME: CARGAR EXCLUSIVAMENTE NOTICIAS EN #home-news-grid ──
    if (homeNewsGrid) {
      const newsOnly = formattedAll.filter(i => i.type === 'news');
      const featuredNews = newsOnly.find(n => n.featured);
      const regularNews = newsOnly.filter(n => !n.featured);
      const sortedNews = (featuredNews ? [featuredNews, ...regularNews] : newsOnly).slice(0, 3);

      if (sortedNews.length > 0) {
        homeNewsGrid.innerHTML = sortedNews.map((item) => `
          <article class="feed-item span-4" data-feed-item data-feed-groups="noticias">
            <div class="feed-item-media square">
              ${item.image 
                ? `<img src="${item.image}" alt="${item.title}" width="1200" height="1200" loading="lazy" decoding="async" />` 
                : `<span class="feed-item-media-label">Imagen · 1:1</span>`}
            </div>
            <div class="feed-item-meta">
              <span>NOTICIA · ${item.publication.toUpperCase()}</span>
              ${item.displayDate ? `<span class="sep">·</span><time datetime="${item.date}">${item.displayDate}</time>` : ''}
            </div>
            <h3 class="feed-item-title">${item.title}</h3>
            <p class="feed-item-excerpt">${item.excerpt}</p>
            ${item.url && item.url !== '#' ? `<div class="feed-link"><a href="${item.url}" target="_blank" rel="noopener noreferrer" class="link-arrow">Leer noticia <span class="arrow">↗</span></a></div>` : ''}
          </article>
        `).join('');
      }
    }

    // ── 2. SI ESTAMOS EN /lo-ultimo/: CARGAR NOTICIAS Y ARTÍCULOS EN #feed-grid ──
    if (feedGrid) {
      const featuredItem = formattedAll.find(a => a.featured);
      const regularItems = formattedAll.filter(a => !a.featured);
      const sortedFeed = featuredItem ? [featuredItem, ...regularItems] : formattedAll;

      // Remover artículos y noticias estáticos pre-renderizados
      const existingDynamicEls = [...feedGrid.querySelectorAll('[data-feed-groups*="artículos"], [data-feed-groups*="noticias"]')];
      existingDynamicEls.forEach(el => el.remove());

      const newElementsHTML = sortedFeed.map((item, idx) => {
        const isTopFeatured = item.featured || idx === 0;

        if (isTopFeatured && idx === 0) {
          return `
            <article class="feed-item featured" data-feed-item data-feed-groups="${item.category}">
              <div class="feed-item-media">
                ${item.image 
                  ? `<img src="${item.image}" alt="${item.title}" width="1920" height="1200" loading="lazy" decoding="async" />` 
                  : `<span class="feed-item-media-label">Imagen · 16:10</span>`}
              </div>
              <div class="feed-item-body">
                <div class="feed-item-meta">
                  <span>${item.categoryLabel} · ${item.publication.toUpperCase()}</span>
                  ${item.displayDate ? `<span class="sep">·</span><time datetime="${item.date}">${item.displayDate}</time>` : ''}
                </div>
                <h3 class="feed-item-title">${item.title}</h3>
                <p class="feed-item-excerpt">${item.excerpt}</p>
                ${item.url && item.url !== '#' ? `<div class="feed-link"><a href="${item.url}" target="_blank" rel="noopener noreferrer" class="link-arrow">${item.type === 'news' ? 'Leer noticia' : 'Leer nota'} <span class="arrow">↗</span></a></div>` : ''}
              </div>
            </article>
          `;
        }

        return `
          <article class="feed-item span-4" data-feed-item data-feed-groups="${item.category}">
            <div class="feed-item-media square">
              ${item.image 
                ? `<img src="${item.image}" alt="${item.title}" width="1200" height="1200" loading="lazy" decoding="async" />` 
                : `<span class="feed-item-media-label">Imagen · 1:1</span>`}
            </div>
            <div class="feed-item-meta">
              <span>${item.categoryLabel} · ${item.publication.toUpperCase()}</span>
              ${item.displayDate ? `<span class="sep">·</span><time datetime="${item.date}">${item.displayDate}</time>` : ''}
            </div>
            <h3 class="feed-item-title">${item.title}</h3>
            <p class="feed-item-excerpt">${item.excerpt}</p>
            ${item.url && item.url !== '#' ? `<div class="feed-link"><a href="${item.url}" target="_blank" rel="noopener noreferrer" class="link-arrow">${item.type === 'news' ? 'Leer noticia' : 'Ver'} <span class="arrow">↗</span></a></div>` : ''}
          </article>
        `;
      }).join('');

      feedGrid.insertAdjacentHTML('afterbegin', newElementsHTML);
      updateFilterCounts();
    }

  } catch (e) {
    // Fallback silencioso
  }
}

function updateFilterCounts() {
  const currentItems = [...document.querySelectorAll('[data-feed-item]')];
  const activeBtn = document.querySelector('[data-feed-filter].active');
  const filter = activeBtn ? activeBtn.dataset.feedFilter : 'todo';
  const liveRegion = document.getElementById('feed-status');

  let visible = 0;
  currentItems.forEach((item) => {
    const groups = (item.dataset.feedGroups || '').split(' ');
    // Si el filtro es 'todo', muestra todo (noticias, artículos, gestión, redes)
    // Si es un filtro específico (ej: 'noticias' o 'artículos'), muestra estrictamente esa categoría
    const show = filter === 'todo' || groups.includes(filter);
    item.hidden = !show;
    if (show) visible += 1;
  });
  if (liveRegion) liveRegion.textContent = `${visible} contenidos visibles`;
}

const buttons = [...document.querySelectorAll('[data-feed-filter]')];
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
