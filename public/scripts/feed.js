// Sincronización en vivo del feed público desde Sanity CMS
async function syncSanityFeed() {
  const homeNewsGrid = document.getElementById('home-news-grid');
  const homeArticlesGrid = document.getElementById('home-articles-grid');
  const summaryNewsGrid = document.getElementById('summary-news-grid');
  const summaryArticlesGrid = document.getElementById('summary-articles-grid');
  const filteredFeedGrid = document.getElementById('filtered-feed-grid');

  if (!homeNewsGrid && !homeArticlesGrid && !summaryNewsGrid && !summaryArticlesGrid && !filteredFeedGrid) return;

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

    const allFormatted = items.map(formatItem);
    const newsOnly = allFormatted.filter(i => i.type === 'news');
    const articlesOnly = allFormatted.filter(i => i.type === 'article');

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
          ${item.url && item.url !== '#' ? `<div class="feed-link"><a href="${item.url}" target="_blank" rel="noopener noreferrer" class="link-arrow">${item.type === 'news' ? 'Leer noticia' : 'Ver'} <span class="arrow">↗</span></a></div>` : ''}
        </article>
      `;
    }

    // ── 1. HOME: NOTICIAS (1 destacada + 2 compactas = 3) ───────────────────
    if (homeNewsGrid) {
      const feat = newsOnly.find(n => n.featured) || newsOnly[0];
      const others = newsOnly.filter(n => n.id !== feat?.id).slice(0, 2);
      const list = feat ? [feat, ...others] : [];
      if (list.length > 0) {
        homeNewsGrid.innerHTML = list.map((item, idx) => renderCard(item, idx === 0)).join('');
      }
    }

    // ── 2. HOME: ARTÍCULOS (1 destacado + 2 compactos = 3) ─────────────────
    if (homeArticlesGrid) {
      const feat = articlesOnly.find(a => a.featured) || articlesOnly[0];
      const others = articlesOnly.filter(a => a.id !== feat?.id).slice(0, 2);
      const list = feat ? [feat, ...others] : [];
      if (list.length > 0) {
        homeArticlesGrid.innerHTML = list.map((item, idx) => renderCard(item, idx === 0)).join('');
      }
    }

    // ── 3. LO ÚLTIMO: RESUMEN TODO (3 noticias + 3 artículos) ───────────────
    if (summaryNewsGrid) {
      const feat = newsOnly.find(n => n.featured) || newsOnly[0];
      const others = newsOnly.filter(n => n.id !== feat?.id).slice(0, 2);
      const list = feat ? [feat, ...others] : [];
      if (list.length > 0) {
        summaryNewsGrid.innerHTML = list.map((item, idx) => renderCard(item, idx === 0)).join('');
      }
    }

    if (summaryArticlesGrid) {
      const feat = articlesOnly.find(a => a.featured) || articlesOnly[0];
      const others = articlesOnly.filter(a => a.id !== feat?.id).slice(0, 2);
      const list = feat ? [feat, ...others] : [];
      if (list.length > 0) {
        summaryArticlesGrid.innerHTML = list.map((item, idx) => renderCard(item, idx === 0)).join('');
      }
    }

    // ── 4. LO ÚLTIMO: VISTA DE SOLAPAS (HASTA 6 NOTICIAS / 6 ARTÍCULOS) ─────
    window.__ALL_SANITY_NEWS__ = newsOnly;
    window.__ALL_SANITY_ARTICLES__ = articlesOnly;

  } catch (e) {
    // Fallback silencioso
  }
}

// ── MANEJO DE FILTROS EN LO ÚLTIMO ─────────────────────────────────────────
function setupLoUltimoFilters() {
  const buttons = [...document.querySelectorAll('.feed-filters [data-feed-filter]')];
  const todoView = document.getElementById('todo-structured-view');
  const categoryView = document.getElementById('category-filtered-view');
  const filteredGrid = document.getElementById('filtered-feed-grid');
  const archiveBanner = document.getElementById('archive-redirect-banner');
  const bannerTitle = document.getElementById('archive-banner-title');
  const bannerLink = document.getElementById('archive-banner-link');

  if (!todoView || !categoryView || !filteredGrid) return;

  function renderCategory(filter) {
    if (filter === 'todo') {
      todoView.style.display = 'flex';
      categoryView.style.display = 'none';
      return;
    }

    todoView.style.display = 'none';
    categoryView.style.display = 'block';

    let items = [];
    if (filter === 'noticias') {
      items = window.__ALL_SANITY_NEWS__ || [];
      if (archiveBanner && bannerLink && bannerTitle) {
        archiveBanner.style.display = 'block';
        bannerTitle.textContent = '¿Buscás más noticias anteriores?';
        bannerLink.href = '/noticias/';
        bannerLink.textContent = 'Ver archivo histórico de noticias →';
      }
    } else if (filter === 'artículos') {
      items = window.__ALL_SANITY_ARTICLES__ || [];
      if (archiveBanner && bannerLink && bannerTitle) {
        archiveBanner.style.display = 'block';
        bannerTitle.textContent = '¿Buscás más artículos y ensayos?';
        bannerLink.href = '/escribe/';
        bannerLink.textContent = 'Ver todos los artículos en Escribo →';
      }
    } else {
      if (archiveBanner) archiveBanner.style.display = 'none';
      items = [];
    }

    // Hasta 6 publicaciones en la solapa
    const feat = items.find(i => i.featured) || items[0];
    const others = items.filter(i => i.id !== feat?.id).slice(0, 5);
    const displayList = feat ? [feat, ...others] : [];

    if (displayList.length === 0) {
      filteredGrid.innerHTML = `<div class="feed-empty" style="grid-column: 1 / -1; padding: 3rem 2rem; text-align: center; border: 1px dashed var(--border); color: var(--dim-gray);">No hay publicaciones disponibles en esta sección por el momento.</div>`;
      return;
    }

    filteredGrid.innerHTML = displayList.map((item, idx) => {
      if (idx === 0) {
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
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.feedFilter;
      buttons.forEach((b) => {
        const active = b === button;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      renderCategory(filter);
    });
  });
}

setupLoUltimoFilters();
syncSanityFeed();
