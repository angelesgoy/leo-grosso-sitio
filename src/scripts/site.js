const menu = document.getElementById('mobile-menu');
const toggle = document.querySelector('.nav-toggle');
const closeButton = document.getElementById('mobile-menu-close');
let hideTimer;
let lastFocused;

const focusable = () => menu?.querySelectorAll('a[href], button:not([disabled])') ?? [];

function openMenu() {
  if (!menu || !toggle) return;
  clearTimeout(hideTimer);
  lastFocused = document.activeElement;
  menu.hidden = false;
  requestAnimationFrame(() => {
    menu.classList.add('open');
    document.body.classList.add('no-scroll');
    toggle.setAttribute('aria-expanded', 'true');
    closeButton?.focus();
  });
}

function closeMenu({ restoreFocus = true } = {}) {
  if (!menu || !toggle || menu.hidden) return;
  menu.classList.remove('open');
  document.body.classList.remove('no-scroll');
  toggle.setAttribute('aria-expanded', 'false');
  clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    menu.hidden = true;
    if (restoreFocus && lastFocused instanceof HTMLElement) lastFocused.focus();
  }, 400);
}

toggle?.addEventListener('click', () => {
  toggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
});
closeButton?.addEventListener('click', () => closeMenu());
menu?.querySelectorAll('.mobile-menu-link').forEach((link) => {
  link.addEventListener('click', () => closeMenu({ restoreFocus: false }));
});

document.addEventListener('keydown', (event) => {
  if (!menu?.classList.contains('open')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeMenu();
    return;
  }
  if (event.key !== 'Tab') return;
  const nodes = [...focusable()];
  if (!nodes.length) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

const reveals = document.querySelectorAll('.reveal');
if (!('IntersectionObserver' in window)) {
  reveals.forEach((element) => element.classList.add('in'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  reveals.forEach((element) => observer.observe(element));
}

const hashRoutes = {
  '#home': '/',
  '#sobre-mi': '/sobre-mi/',
  '#lo-ultimo': '/lo-ultimo/',
  '#san-martin': '/san-martin/',
  '#escribe': '/escribe/',
  '#ideas': '/ideas/',
  '#trayectoria': '/trayectoria/',
  '#trabajo': '/trabajo/'
};
if ((location.pathname === '/' || location.pathname.endsWith('/index.html')) && hashRoutes[location.hash]) {
  location.replace(hashRoutes[location.hash]);
}
