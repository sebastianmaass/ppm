// Zählende Kennzahlen. Ohne JavaScript oder bei reduzierter Bewegung steht sofort der Endwert da.
export function init() {
  const els = [...document.querySelectorAll('[data-count],[data-count-years]')];
  const end = (el) => el.dataset.count ? +el.dataset.count : new Date().getFullYear() - +el.dataset.countYears;
  els.forEach(el => { el.textContent = end(el); });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const el = e.target, to = end(el), dur = 1400; let t0 = null;
    const step = (t) => { t0 ??= t; const p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  els.forEach(el => { const r = el.getBoundingClientRect(); if (r.top > innerHeight) { el.textContent = '0'; } io.observe(el); });
}
