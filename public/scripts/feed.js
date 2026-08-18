// Sincronización en vivo del feed público (Lo Último / Inicio) desde Sanity CMS
async function syncSanityFeed() {
  const grid = document.getElementById('feed-grid');
  if (!grid) return;

  try {
    const query = encodeURIComponent(`*[_type == "article" && !(_id in path("drafts.**")) && (status == "published" || !defined(status))] | order(publishedAt desc) {
      _id, title, "slug": slug.current, publication, publishedAt, authors, excerpt, image, externalUrl, featured
    }`);

    const res = await fetch(`https://j4xtzihv.api.sanity.io/v2024-01-01/data/query/production?query=${query}`);
    if (!res.ok) return;

    const json = await res.json();
    const articles = json.result || [];
    if (articles.length === 0) return;

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

    const featuredArt = formattedArticles.find(a => a.featured);
    const otherArts = formattedArticles.filter(a => !a.featured);
    const sortedFeed = featuredArt ? [featuredArt, ...otherArts] : formattedArticles;

    const existingArticleEls = [...grid.querySelectorAll('[data-feed-groups*="artículos"]')];
    if (existingArticleEls.length > 0) {
      existingArticleEls.forEach(el => el.remove());
    }

    const newElementsHTML = sortedFeed.map((art, idx) => {
      const isTopFeatured = art.featured || idx === 0;

      if (isTopFeatured && idx === 0) {
        return `
          <article class="feed-item featured" data-feed-item data-feed-groups="artículos">
            <div class="feed-item-media">
              ${art.image 
                ? `<img src="${art.image}" alt="${art.title}" width="1920" height="1200" loading="lazy" decoding="async" />` 
                : `<span class="feed-item-media-label">Imagen · 16:10</span>`}
            </div>
            <div class="feed-item-body">
              <div class="feed-item-meta"><span>ARTICLE</span><span class="sep">·</span><time datetime="${art.date}">${art.displayDate}</time></div>
              <h3 class="feed-item-title">${art.title}</h3>
              <p class="feed-item-excerpt">${art.excerpt}</p>
              ${art.url ? `<div class="feed-link"><a href="${art.url}" target="_blank" rel="noopener noreferrer" class="link-arrow">Leer nota <span class="arrow">↗</span></a></div>` : ''}
            </div>
          </article>
        `;
      }

      return `
        <article class="feed-item span-4" data-feed-item data-feed-groups="artículos">
          <div class="feed-item-media square">
            ${art.image 
              ? `<img src="${art.image}" alt="${art.title}" width="1200" height="1200" loading="lazy" decoding="async" />` 
              : `<span class="feed-item-media-label">Imagen · 1:1</span>`}
          </div>
          <div class="feed-item-meta">
            <span>ARTICLE · ${art.publication.toUpperCase()}</span>
            ${art.displayDate ? `<span class="sep">·</span><time datetime="${art.date}">${art.displayDate}</time>` : ''}
          </div>
          <h3 class="feed-item-title">${art.title}</h3>
          <p class="feed-item-excerpt">${art.excerpt}</p>
          ${art.url ? `<div class="feed-link"><a href="${art.url}" target="_blank" rel="noopener noreferrer" class="link-arrow">Ver <span class="arrow">↗</span></a></div>` : ''}
        </article>
      `;
    }).join('');

    grid.insertAdjacentHTML('afterbegin', newElementsHTML);
    updateFilterCounts();

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
