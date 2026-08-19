// Sincronización en vivo del feed público desde Sanity CMS
async function syncSanityFeed() {
  const homeNewsGrid = document.getElementById('home-news-grid');
  const homeArticlesGrid = document.getElementById('home-articles-grid');
  const feedGrid = document.getElementById('feed-grid');

  if (!homeNewsGrid && !homeArticlesGrid && !feedGrid) return;

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

    function renderCard(item, isFeatured) {
      if (isFeatured) {
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
          ${item.url && item.url !== '#' ? `<div class="feed-link"><a href="${item.url}" target="_blank" rel="noopener noreferrer" class="link-arrow">Ver <span class="arrow">↗</span></a></div>` : ''}
        </article>
      `;
    }

    // ── 1. HOME: SECCIÓN NOTICIAS (Primera horizontal destacada, siguientes en grilla) ──
    if (homeNewsGrid) {
      const newsOnly = formattedAll.filter(i => i.type === 'news');
      const featuredNews = newsOnly.find(n => n.featured) || newsOnly[0];
      const otherNews = newsOnly.filter(n => n.id !== featuredNews?.id).slice(0, 3);
      const list = featuredNews ? [featuredNews, ...otherNews] : [];

      if (list.length > 0) {
        homeNewsGrid.innerHTML = list.map((item, idx) => renderCard(item, idx === 0)).join('');
      }
    }

    // ── 2. HOME: SECCIÓN ESCRIBO (Primer artículo horizontal destacado, siguientes en grilla) ──
    if (homeArticlesGrid) {
      const articlesOnly = formattedAll.filter(i => i.type === 'article');
      const featuredArticle = articlesOnly.find(a => a.featured) || articlesOnly[0];
      const otherArticles = articlesOnly.filter(a => a.id !== featuredArticle?.id).slice(0, 3);
      const list = featuredArticle ? [featuredArticle, ...otherArticles] : [];

      if (list.length > 0) {
        homeArticlesGrid.innerHTML = list.map((item, idx) => renderCard(item, idx === 0)).join('');
      }
    }

    // ── 3. PÁGINA /lo-ultimo/: CARGAR TODOS Y GESTIONAR DESTACADO HORIZONTAL SEGÚN FILTRO ──
    if (feedGrid) {
      const featuredItem = formattedAll.find(a => a.featured) || formattedAll[0];
      const otherItems = formattedAll.filter(a => a.id !== featuredItem?.id);
      const sortedFeed = featuredItem ? [featuredItem, ...otherItems] : formattedAll;

      // Remover artículos y noticias estáticos pre-renderizados
      const existingDynamicEls = [...feedGrid.querySelectorAll('[data-feed-groups*="artículos"], [data-feed-groups*="noticias"]')];
      existingDynamicEls.forEach(el => el.remove());

      feedGrid.insertAdjacentHTML('afterbegin', sortedFeed.map((item, idx) => renderCard(item, idx === 0)).join(''));
      updateFilterCounts();
    }

  } catch (e) {
    // Fallback silencioso
  }
}

function updateFilterCounts() {
  const currentItems = [...document.querySelectorAll('#feed-grid [data-feed-item]')];
  if (currentItems.length === 0) return;

  const activeBtn = document.querySelector('[data-feed-filter].active');
  const filter = activeBtn ? activeBtn.dataset.feedFilter : 'todo';
  const liveRegion = document.getElementById('feed-status');

  let visibleCount = 0;
  let firstVisibleItem = null;

  // Evaluamos visibilidad y limpiamos estado anterior
  currentItems.forEach((item) => {
    const groups = (item.dataset.feedGroups || '').split(' ');
    const show = filter === 'todo' || groups.includes(filter);
    item.hidden = !show;

    // Reiniciamos clase a tarjeta compacta estándar (span-4)
    item.classList.remove('featured');
    item.classList.add('span-4');

    if (show) {
      visibleCount += 1;
      if (!firstVisibleItem) {
        firstVisibleItem = item;
      }
    }
  });

  // El primer elemento visible de la solapa activa se convierte en el DESTACADO HORIZONTAL
  if (firstVisibleItem) {
    firstVisibleItem.classList.remove('span-4');
    firstVisibleItem.classList.add('featured');
  }

  if (liveRegion) liveRegion.textContent = `${visibleCount} contenidos visibles`;
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
