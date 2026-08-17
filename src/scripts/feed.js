const buttons = [...document.querySelectorAll('[data-feed-filter]')];
const items = [...document.querySelectorAll('[data-feed-item]')];
const liveRegion = document.getElementById('feed-status');

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.feedFilter;
    buttons.forEach((candidate) => {
      const active = candidate === button;
      candidate.classList.toggle('active', active);
      candidate.setAttribute('aria-pressed', String(active));
    });
    let visible = 0;
    items.forEach((item) => {
      const groups = (item.dataset.feedGroups || '').split(' ');
      const show = filter === 'todo' || groups.includes(filter);
      item.hidden = !show;
      if (show) visible += 1;
    });
    if (liveRegion) liveRegion.textContent = `${visible} contenidos visibles`;
  });
});
