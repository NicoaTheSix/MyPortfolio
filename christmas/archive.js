const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => { el.classList.add('will-reveal'); observer.observe(el); });
}
const yearAnchors = [...document.querySelectorAll('.year-navigation nav a')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.filter(e => e.isIntersecting).forEach(entry => yearAnchors.forEach(a => {
      if (a.hash === `#${entry.target.id}`) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    }));
  }, { rootMargin: '-20% 0px -40% 0px' });
  document.querySelectorAll('.year-card').forEach(el => observer.observe(el));
}
const dialog = document.querySelector('.lightbox');
const links = [...document.querySelectorAll('.photo-link')];
let current = 0;
let previousFocus;
function showPhoto(index) {
  current = (index + links.length) % links.length;
  const link = links[current];
  const caption = link.dataset.caption;
  dialog.querySelector('img').src = link.href;
  dialog.querySelector('img').alt = caption;
  dialog.querySelector('.photo-caption').textContent = caption;
  dialog.querySelector('.photo-position').textContent = `${String(current + 1).padStart(2, '0')} / ${String(links.length).padStart(2, '0')}`;
  dialog.querySelector('.lightbox-navigation').hidden = links.length < 2;
}
links.forEach((link, index) => link.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !dialog.showModal) return;
  event.preventDefault();
  previousFocus = link;
  showPhoto(index);
  dialog.showModal();
  document.body.classList.add('modal-open');
}));
dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
dialog.querySelector('.photo-prev').addEventListener('click', () => showPhoto(current - 1));
dialog.querySelector('.photo-next').addEventListener('click', () => showPhoto(current + 1));
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(current - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(current + 1); }
});
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); previousFocus?.focus(); });
