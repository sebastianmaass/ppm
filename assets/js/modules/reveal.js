// Einblenden beim Scrollen (aus bei reduzierter Bewegung).
export function init() {
  const sel = '.section-head, .kpis, .company-grid, .ruled, .cards, .people, .stories, .steps, .faq, .split > *, .cta__grid, .termin-list, .news-list, .job-list, .beruf-grid';
  const els = [...document.querySelectorAll(sel)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .05 });
  els.forEach(el => { if (el.getBoundingClientRect().top < innerHeight * .9) return; el.classList.add('reveal'); io.observe(el); });
}
