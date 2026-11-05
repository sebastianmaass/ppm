// Zeitstrahl: Pfeil-Knöpfe scrollen um eine Karte weiter.
export function init() {
  document.querySelectorAll('[data-module~="timeline"]').forEach(root => {
    const tl = root.querySelector('.timeline'); if (!tl) return;
    root.querySelectorAll('[data-tl]').forEach(b => b.addEventListener('click', () => {
      const item = tl.querySelector('.timeline__item'); const w = item ? item.getBoundingClientRect().width : 300;
      tl.scrollBy({ left: +b.dataset.tl * w, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }));
  });
}
